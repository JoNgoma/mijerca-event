<script setup>
import { ref, computed, onMounted } from 'vue'
import axios from 'axios'
import { useRoute } from 'vue-router'
import { useToast } from 'vue-toastification'
import { useServiceContext } from '@/composables/useServiceContext'

const toast = useToast()
const { currentService } = useServiceContext()
const route = useRoute()

const apiAccess = computed(() => currentService.value.api)
const campId = computed(() => route.params.id_campBiblique || null)

const props = defineProps({
  id: { type: [String, Number], required: true },
  date: { type: String, required: false },
})

const API = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api'

const loading = ref(false)
const users = ref([])
const people = ref([])
const paroisses = ref([])
const participators = ref([])
const removals = ref([])

const selectedUser = ref(null)
const showModal = ref(false)
const showConfirm = ref(false)
const removing = ref(false)

function extractIdFromUrl(url) {
  if (!url) return null
  const parts = String(url).split('/').filter(Boolean)
  return parts.pop()
}

async function fetchData() {
  try {
    loading.value = true
    const [usersRes, peopleRes, paroissesRes, participatorsRes, removalsRes] = await Promise.all([
      axios.get(`${API}/users`).then((r) => r.data?.member || []),
      axios.get(`${API}/people`).then((r) => r.data?.member || []),
      axios.get(`${API}/paroisses`).then((r) => r.data?.member || []),
      axios.get(`${API}/participators`).then((r) => r.data?.member || []),
      axios.get(`${API}/removals`).then((r) => r.data?.member || []),
    ])

    users.value = usersRes
    people.value = peopleRes
    paroisses.value = paroissesRes
    participators.value = participatorsRes
    removals.value = removalsRes
  } catch (err) {
    console.error('Erreur de chargement:', err)
    toast.error('Erreur lors de la récupération des données')
  } finally {
    loading.value = false
  }
}

onMounted(fetchData)

// === MAPPING DES UTILISATEURS PAR SERVICE ===
const servicePeople = computed(() => {
  const serviceKey =
    props.id === 'adm'
      ? 'administrations'
      : props.id === 'fin'
        ? 'finances'
        : props.id === 'heb'
          ? 'hebergements'
          : props.id === 'sec'
            ? 'informatiques'
            : null

  if (!serviceKey) return []

  const serviceUsers = users.value.filter(
    (u) => Array.isArray(u[serviceKey]) && u[serviceKey].length,
  )

  const mapped = serviceUsers.map((u) => {
    const person = people.value.find(
      (p) => extractIdFromUrl(p['@id']) === extractIdFromUrl(u.person),
    )
    if (!person) return null

    const paroisse = paroisses.value.find(
      (pa) => extractIdFromUrl(pa['@id']) === extractIdFromUrl(person.paroisse),
    )

    const participator = participators.value.find(
      (pr) => extractIdFromUrl(pr.person) === extractIdFromUrl(person['@id']),
    )

    const responsable = person.isDicoces
      ? 'Noyau diocésain'
      : person.isDecanal
        ? 'Noyau décanal'
        : person.isNoyau
          ? 'Noyau paroissial'
          : 'Jeune'

    const serviceName =
      props.id === 'adm'
        ? 'Administration'
        : props.id === 'fin'
          ? 'Finances'
          : props.id === 'heb'
            ? 'Hébergement'
            : props.id === 'sec'
              ? 'Secrétariat'
              : 'Autre'

    const dateAjout = participator?.createdAt
      ? new Date(participator.createdAt).toLocaleString('fr-FR')
      : 'Pas en ordre'

    const personRemovals = removals.value.filter(
      (r) => extractIdFromUrl(r.participator?.[0]) === extractIdFromUrl(participator?.['@id']),
    )

    const activeRemoval = personRemovals.find((r) => r.start && !r.end)
    const isOnMove = !!activeRemoval
    const moveInfo = isOnMove
      ? {
          motif: activeRemoval.motif || 'Non précisé',
          start: new Date(activeRemoval.start).toLocaleString('fr-FR'),
        }
      : null

    return {
      id: u.id,
      fullName: person.fullName?.trim() || '—',
      paroisse: paroisse?.name || 'Paroisse inconnue',
      responsable,
      service: serviceName,
      gender: person.gender || '',
      phone: person.phoneNumber || '',
      createdAt: dateAjout,
      isOnMove,
      moveInfo,
      raw: person,
    }
  })

  return mapped.filter(Boolean).sort((a, b) => a.fullName.localeCompare(b.fullName))
})

// === OUVRIR LE MODAL ===
function openUserModal(user) {
  selectedUser.value = user
  showModal.value = true
}

// === SUPPRESSION AVEC MODAL ===
async function confirmRemoval() {
  removing.value = true
  try {
    const user = selectedUser.value
    const userId = user.id
    // Retirer le rôle correspondant
    const rolePrefix =
      user.service === 'Administration'
        ? 'ADM'
        : user.service === 'Finances'
          ? 'FIN'
          : user.service === 'Hébergement'
            ? 'HEB'
            : 'SEC'
    // === Récupérer le user complet
    const { data: userData } = await axios.get(`${API}/users/${userId}`)

    // === Récupérer le camp pour savoir le rôle exact
    const { data: camp } = await axios.get(`${API}/camp_bibliques/${campId.value}`)
    const campLabel = camp.name || ''
    const shortCamp =
      (campLabel
        .match(/[A-Za-z]/g)
        ?.slice(0, 2)
        .join('') || 'CA') + (campLabel.match(/\d{4}$/)?.[0] || 'XXXX')

    // === Retirer le rôle correspondant à ce camp
    const roleToRemove = `ROLE_${rolePrefix}_${shortCamp.toUpperCase()}`
    const roles = (userData.roles || []).filter((r) => r !== roleToRemove)

    // 🔍 LOG du rôle supprimé
    console.log('--- RÔLE RETIRÉ ---')
    console.log('Ancien rôles :', userData.roles)
    console.log('Rôle à retirer :', roleToRemove)
    console.log('Nouveaux rôles :', roles)

    // === Identifier le champ du service
    let serviceField = null
    if (apiAccess.value === '/administrations') serviceField = 'administrations'
    else if (apiAccess.value === '/finances') serviceField = 'finances'
    else if (apiAccess.value === '/hebergements') serviceField = 'hebergements'
    else if (apiAccess.value === '/informatiques') serviceField = 'informatiques'

    // === Nettoyer le tableau du service courant
    const updatedField = (userData[serviceField] || []).filter((f) => !f.includes(apiAccess.value))

    // 🔍 LOG du champ de service nettoyé
    console.log('--- SERVICE FIELD NETTOYÉ ---')
    console.log('Champ ciblé :', serviceField)
    console.log('Ancienne valeur :', userData[serviceField])
    console.log(
      'Valeur retirée :',
      (userData[serviceField] || []).filter((f) => f.includes(apiAccess.value)),
    )
    console.log('Nouvelle valeur :', updatedField)

    // === PATCH partiel
    const payload = { roles, [serviceField]: updatedField }
    console.log('--- PAYLOAD ENVOYÉ AU PATCH ---')
    console.log(payload)

    await axios.patch(`${API}/users/${userId}`, payload, {
      headers: { 'Content-Type': 'application/merge-patch+json' },
    })

    toast.success(`${user.fullName} a été retiré du service ${user.service}`)
    showConfirm.value = false
    showModal.value = false
    await fetchData()
  } catch (err) {
    console.error('Erreur retrait service:', err)
    toast.error("Impossible de retirer l'utilisateur du service")
  } finally {
    removing.value = false
  }
}
</script>

<template>
  <div>
    <div v-if="loading" class="text-center my-5">
      <span class="spinner-border"></span> Chargement des données...
    </div>

    <div v-else>
      <div class="table-container">
        <table class="table table-hover align-middle">
          <thead class="table-light sticky-header">
            <tr>
              <th>Noms</th>
              <th>Paroisse</th>
              <th>Responsable</th>
              <th>Service</th>
              <th>Frais participation (date)</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="user in servicePeople"
              :key="user.id"
              class="selectable-row"
              @click="openUserModal(user)"
            >
              <td>
                {{ user.gender }} {{ user.fullName }}
                <span v-if="user.isOnMove" class="badge bg-warning text-dark ms-2"
                  >En déplacement</span
                >
              </td>
              <td>{{ user.paroisse }}</td>
              <td>{{ user.responsable }}</td>
              <td>{{ user.service }}</td>
              <td>{{ user.createdAt }}</td>
            </tr>
            <tr v-if="!servicePeople.length">
              <td colspan="5" class="text-center text-muted py-3">
                Aucun membre trouvé pour ce service.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- MODAL DÉTAIL UTILISATEUR -->
    <div v-if="showModal" class="modal show" @click.self="showModal = false">
      <div class="modal-dialog modal-dialog-centered modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title text-primary">
              <b>{{ selectedUser.gender }} {{ selectedUser.fullName }}</b>
            </h5>
            <button type="button" class="btn-close" @click="showModal = false"></button>
          </div>
          <div class="modal-body">
            <ul class="list-group list-group-flush">
              <li class="list-group-item"><b>Téléphone :</b> {{ selectedUser.phone }}</li>
              <li class="list-group-item"><b>Paroisse :</b> {{ selectedUser.paroisse }}</li>
              <li class="list-group-item"><b>Responsable :</b> {{ selectedUser.responsable }}</li>
              <li class="list-group-item"><b>Service :</b> {{ selectedUser.service }}</li>
              <li class="list-group-item"><b>A payé :</b> {{ selectedUser.createdAt }}</li>
              <li v-if="selectedUser.isOnMove" class="list-group-item text-danger fw-bold">
                En déplacement depuis le {{ selectedUser.moveInfo.start }}<br />
                <span><b>Motif :</b> {{ selectedUser.moveInfo.motif }}</span>
              </li>
            </ul>
          </div>
          <li class="list-group-item d-flex justify-content-end">
            <button class="btn btn-danger" :disabled="removing" @click="showConfirm = true">
              Retirer du service
            </button>
          </li>
        </div>
      </div>
    </div>

    <!-- MODAL DE CONFIRMATION -->
    <div v-if="showConfirm" class="modal show" @click.self="showConfirm = false">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content border-0 shadow-lg">
          <div class="modal-header bg-danger text-white">
            <h5 class="modal-title">Confirmation du retrait</h5>
            <button
              type="button"
              class="btn-close btn-close-white"
              @click="showConfirm = false"
            ></button>
          </div>
          <div class="modal-body text-center py-4">
            <p>
              Êtes-vous sûr de vouloir retirer<br />
              <b>{{ selectedUser.fullName }}</b
              ><br />
              du service <b>{{ selectedUser.service }}</b> ?
            </p>
          </div>
          <div class="modal-footer justify-content-center">
            <button class="btn btn-secondary" @click="showConfirm = false">Annuler</button>
            <button class="btn btn-danger" :disabled="removing" @click="confirmRemoval">
              <span v-if="removing" class="spinner-border spinner-border-sm me-2"></span>
              Confirmer le retrait
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.table-container {
  max-height: 20rem;
  overflow-y: auto;
  border-radius: 0.5rem;
  border: 1px solid #dee2e6;
}

.sticky-header {
  position: sticky;
  top: 0;
  background: #f8f9fa;
  z-index: 2;
}

.selectable-row {
  cursor: pointer;
  transition: background-color 0.2s;
}
.selectable-row:hover {
  background-color: #eef5ff;
}
.modal.show {
  display: block;
  background: rgba(0, 0, 0, 0.5);
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1050;
}
.modal-dialog {
  margin: 1.75rem auto;
}
.badge {
  font-size: 0.75rem;
  vertical-align: middle;
}
</style>
