<script setup>
import { ref, onMounted, computed } from 'vue'
import axios from 'axios'
import { useToast } from 'vue-toastification'

const toast = useToast()

const props = defineProps({
  camp: { type: Object, required: true }
})

const API = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api'

const loading = ref(false)
const saving = ref(false)
const removalsLoading = ref(false)
const participators = ref([])
const people = ref([])
const paroisses = ref([])
const removals = ref([])

const selectedCarrefour = ref('')
const selectedParticipator = ref('')
const motif = ref('')
const searchQuery = ref('')
const confirmingRetour = ref(false)

const campAvailable = computed(() => props.camp && props.camp.id)

function extractId(url) {
  if (!url) return null
  return String(url).split('/').filter(Boolean).pop()
}

// --- Données principales ---
async function fetchData() {
  if (!campAvailable.value) return
  try {
    loading.value = true
    const [partRes, peopleRes, paroisseRes] = await Promise.all([
      axios.get(`${API}/participators`).then(r => r.data?.member || []),
      axios.get(`${API}/people`).then(r => r.data?.member || []),
      axios.get(`${API}/paroisses`).then(r => r.data?.member || [])
    ])
    participators.value = partRes.filter(p =>
      p.campBiblic?.some(cb => extractId(cb) === props.camp.id)
    )
    people.value = peopleRes
    paroisses.value = paroisseRes
    await fetchRemovals()
  } catch (e) {
    console.error(e)
    toast.error('Erreur lors du chargement')
  } finally {
    loading.value = false
  }
}

onMounted(fetchData)

// --- Carrefours disponibles ---
const carrefoursDisponibles = computed(() => {
  const unique = [...new Set(participators.value.map(p => p.carrefour).filter(Boolean))]
  const numeric = unique.filter(c => !isNaN(c)).sort((a,b) => a-b)
  const nonNumeric = unique.filter(c => isNaN(c)).sort((a,b) => a.localeCompare(b))
  return [...numeric, ...nonNumeric]
})

// --- Participants non déplacés pour le carrefour sélectionné ---
const openParticipantsIds = computed(() =>
  new Set(removals.value.filter(r => !r.end).map(r => String(r.id)))
)

const participantsParCarrefour = computed(() => {
  if (!selectedCarrefour.value) return []
  return participators.value
    .filter(p => p.carrefour === selectedCarrefour.value && !openParticipantsIds.value.has(String(p.id)))
    .map(p => {
      const pid = extractId(p.person)
      const person = people.value.find(pe => extractId(pe['@id']) === pid) || {}
      return {
        id: p.id,
        fullName: person.fullName || `#${p.id}`,
        gender: person.gender,
        dortoir: p.dortoir || '—'
      }
    })
    .sort((a, b) => a.fullName.localeCompare(b.fullName))
})

// --- Déplacements ---
async function fetchRemovals() {
  try {
    removalsLoading.value = true
    const res = await axios.get(`${API}/removals`).then(r => r.data?.member || [])
    removals.value = res
      .filter(r => r.campBiblic?.some(cb => extractId(cb) === props.camp.id))
      .map(r => {
        const partUrl = Array.isArray(r.participator) ? r.participator[0] : r.participator
        const pid = extractId(partUrl)
        const part = participators.value.find(p => String(p.id) === pid) || {}
        const personId = extractId(part.person)
        const pe = people.value.find(x => extractId(x['@id']) === personId) || {}
        const parId = extractId(pe.paroisse)
        const par = paroisses.value.find(pp => String(pp.id) === parId)
        const paroName = par ? par.name : '—'

        return {
          id: extractId(r['@id'] || r.id),
          personName: pe.fullName || `#${part.id}`,
          gender: pe.gender || '—',
          paroisse: paroName,
          dortoir: part.dortoir || '—',
          carrefour: part.carrefour || '—',
          motif: r.motif || '—',
          start: r.start,
          end: r.end || null,
          // Champs bruts pour vérification des doublons
          rawParticipator: r.participator,
          rawCamp: r.campBiblic
        }
      })
      .sort((a, b) => new Date(b.start) - new Date(a.start))
  } catch (e) {
    console.error(e)
    toast.error('Erreur chargement des déplacements')
  } finally {
    removalsLoading.value = false
  }
}

const openRemovals = computed(() => removals.value.filter(r => !r.end))

const filteredRemovals = computed(() => {
  const q = searchQuery.value.toLowerCase().trim()
  if (!q) return openRemovals.value
  return openRemovals.value.filter(r =>
    r.personName.toLowerCase().includes(q)
  )
})

// --- Actions ---
async function submitRemoval() {
  if (!selectedParticipator.value || !motif.value) return

  const participantId = String(selectedParticipator.value)
  const campId = String(props.camp.id)

  // Vérifier si ce participant a déjà un déplacement ouvert dans CE camp
  const hasOpenRemoval = removals.value.some(r => {
    const rParticipatorId = Array.isArray(r.rawParticipator)
      ? extractId(r.rawParticipator[0])
      : extractId(r.rawParticipator)

    const rCampIds = Array.isArray(r.rawCamp)
      ? r.rawCamp.map(c => extractId(c))
      : [extractId(r.rawCamp)]

    return rParticipatorId === participantId &&
           rCampIds.includes(campId) &&
           (r.end === null || r.end === undefined)
  })

  if (hasOpenRemoval) {
    toast.warning(
      "Cette personne n'a jamais été marquée de retour depuis son dernier déplacement. Veuillez bien vérifier."
    )
    return
  }

  try {
    saving.value = true
    const now = new Date().toISOString()
    await axios.post(`${API}/removals`, {
      campBiblic: [`/api/camp_bibliques/${campId}`],
      participator: [`/api/participators/${participantId}`],
      motif: motif.value,
      start: now
    }, {
      headers: {
        "Content-Type": "application/ld+json",
        "Authorization": `Bearer ${localStorage.getItem("token")}`
      }
    })
    toast.success('Déplacement enregistré')
    resetForm()
    await fetchRemovals()
  } catch (e) {
    console.error(e)
    toast.error('Erreur lors de l’enregistrement')
  } finally {
    saving.value = false
  }
}

async function confirmRetour(rem) {
  try {
    confirmingRetour.value = rem.id
    const now = new Date().toISOString()
    await axios.patch(`${API}/removals/${extractId(rem['@id'] || rem.id)}`, { end: now }, {
      headers: {
        "Content-Type": "application/merge-patch+json",
        "Authorization": `Bearer ${localStorage.getItem("token")}`
      }
    })
    toast.success('Retour confirmé')
    await fetchRemovals()
  } catch (e) {
    console.error(e)
    toast.error('Erreur lors de la confirmation')
  } finally {
    confirmingRetour.value = false
  }
}

function resetForm() {
  selectedCarrefour.value = ''
  selectedParticipator.value = ''
  motif.value = ''
}

function formatDateTime(s) {
  if (!s) return '—'
  const d = new Date(s)
  return d.toLocaleString('fr-FR', { timeZone: 'Africa/Kinshasa' })
}
</script>

<template>
  <div>
    <div v-if="!campAvailable" class="text-center my-4 text-muted">
      Aucun camp sélectionné.
    </div>

    <div v-else>
      <div v-if="loading" class="text-center my-4">
        <span class="spinner-border"></span> Chargement...
      </div>

      <div v-else class="card shadow-sm border-0">
        <div class="card-body mx-3">
          <!-- Formulaire -->
          <form @submit.prevent="submitRemoval" class="d-flex flex-column gap-3">
            <div class="row gx-3">
              <div class="col-md-4">
                <label class="form-label">Carrefour</label>
                <select v-model="selectedCarrefour" class="styled-select" required>
                  <option value="" disabled>Choisir le carrefour</option>
                  <option v-for="c in carrefoursDisponibles" :key="c" :value="c">
                    {{ c }}
                  </option>
                </select>
              </div>

              <div class="col-md-4" v-if="selectedCarrefour">
                <label class="form-label">Participant</label>
                <select v-model="selectedParticipator" class="styled-select" required>
                  <option value="" disabled>Choisir une personne</option>
                  <option v-for="p in participantsParCarrefour" :key="p.id" :value="p.id">
                    {{ p.gender }} {{ p.fullName }} : Dortoir: {{ p.dortoir }}
                  </option>
                </select>
              </div>

              <div class="col-md-4">
                <label class="form-label">Motif</label>
                <input v-model="motif" class="styled-input" placeholder="Motif du déplacement" required />
              </div>
            </div>

            <div class="d-flex gap-2 mb-3">
              <button type="submit" class="btn btn-primary d-flex align-items-center justify-content-center" :disabled="saving">
                <span v-if="saving" class="spinner-border spinner-border-sm me-2"></span>
                {{ saving ? 'Enregistrement...' : 'Enregistrer' }}
              </button>
              <button type="button" class="btn btn-outline-secondary" @click="resetForm">
                Réinitialiser
              </button>
            </div>
          </form>

          <!-- Recherche -->
          <div class="d-flex justify-content-end mb-2">
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Recherche par nom..."
              class="form-control search-input"
              style="max-width: 250px;"
            />
          </div>

          <!-- Tableau des déplacements -->
          <div v-if="removalsLoading" class="text-center py-2">
            <span class="spinner-border spinner-border-sm"></span>
          </div>
          <table v-else class="table table-sm table-hover table-bordered align-middle">
            <thead class="table-light sticky-top">
              <tr>
                <th>Participant</th>
                <th>Paroisse</th>
                <th>Carrefour</th>
                <th>Motif</th>
                <th>Départ</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="r in filteredRemovals" :key="r.id">
                <td>{{ r.gender }} {{ r.personName }}</td>
                <td>{{ r.paroisse }}</td>
                <td>{{ r.carrefour }}</td>
                <td>{{ r.motif }}</td>
                <td>{{ formatDateTime(r.start) }}</td>
                <td>
                  <button
                    class="btn btn-success btn-sm d-flex align-items-center"
                    :disabled="confirmingRetour === r.id"
                    @click="confirmRetour(r)"
                  >
                    <span v-if="confirmingRetour === r.id" class="spinner-border spinner-border-sm me-1"></span>
                    Confirmer retour
                  </button>
                </td>
              </tr>
              <tr v-if="!openRemovals.length">
                <td colspan="6" class="text-center text-muted py-2">Aucun déplacement en cours</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.card { border-radius: .6rem; }
.form-label { font-size: .9rem; font-weight: 600; }
.styled-select, .styled-input { width: 100%; border: 1px solid #ced4da; border-radius: .2rem; padding: .75rem .75rem; background-color: #fff; transition: all .2s; font-size: .9rem; margin-bottom:1rem; }
.styled-select:focus, .styled-input:focus { border-color: #0d6efd; box-shadow: 0 0 0 .2rem rgba(13, 110, 253, .15); outline: none; }
.btn { border-radius: .2rem; font-weight: 500; padding: .15rem 1rem; margin-right: 1rem; }
.table th, .table td { padding: .45rem; border: 1px solid #dee2e6; }
.sticky-top { position: sticky; top: 0; background: #fff; z-index: 10; }
.search-input { border-radius: .2rem; padding: 0 .7rem; font-size: .9rem; border: 1px solid #ced4da; transition: all .2s ease; }
.search-input:focus { border-color: #0d6efd; box-shadow: 0 0 0 .2rem rgba(13, 110, 253, .15); outline: none; }
</style>
