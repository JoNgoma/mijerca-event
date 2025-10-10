<template>
  <div>
    <div v-if="!campAvailable" class="text-center my-3 text-muted">
      Aucun camp sélectionné.
    </div>

    <div v-else>
      <div v-if="loading" class="text-center my-3">
        <span class="spinner-border"></span> Chargement...
      </div>

      <div v-else class="card shadow-sm">
        <div class="card-header bg-light fw-semibold d-flex justify-content-between align-items-center">
          <span>Personnes déplacées</span>
          <input
            v-model="searchTerm"
            type="text"
            class="form-control form-control-sm w-auto"
            placeholder="Rechercher par nom..."
          />
        </div>

        <div class="card-body table-wrapper">
          <table class="table table-striped table-bordered">
            <thead class="table-light sticky-top">
              <tr>
                <th>Nom</th>
                <th>Paroisse</th>
                <th>Dortoir</th>
                <th>Carrefour</th>
                <th>Motif</th>
                <th>Départ</th>
                <th>Retour</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="r in filteredRemovals" :key="r.id">
                <td>{{ r.gender }} {{ r.personName }}</td>
                <td>{{ r.paroisse }}</td>
                <td>{{ r.dortoir }}</td>
                <td>{{ r.carrefour }}</td>
                <td>{{ r.motif }}</td>
                <td>{{ formatDateTime(r.start) }}</td>
                <td>
                  <span v-if="r.end">{{ formatDateTime(r.end) }}</span>
                  <button 
                    v-else
                    class="btn btn-sm btn-success" 
                    @click="confirmRetour(r)">
                    Confirmer retour
                  </button>
                </td>
              </tr>
              <tr v-if="!filteredRemovals.length">
                <td colspan="7" class="text-center text-muted">Aucun déplacement trouvé</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import axios from 'axios'
import { useToast } from 'vue-toastification'

const toast = useToast()
const props = defineProps({ camp: { type: Object, required: true } })
const API = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api'

const loading = ref(false)
const removals = ref([])
const participators = ref([])
const people = ref([])
const paroisses = ref([])
const searchTerm = ref('')

const campAvailable = computed(() => props.camp && props.camp.id)

function extractId(url) {
  if (!url) return null
  return String(url).split('/').filter(Boolean).pop()
}

async function fetchAll() {
  if (!campAvailable.value) return
  try {
    loading.value = true
    const [remRes, partRes, peopleRes, parRes] = await Promise.all([
      axios.get(`${API}/removals`).then(r => r.data?.member || r.data || []),
      axios.get(`${API}/participators`).then(r => r.data?.member || []),
      axios.get(`${API}/people`).then(r => r.data?.member || []),
      axios.get(`${API}/paroisses`).then(r => r.data?.member || [])
    ])

    const campId = props.camp.id
    removals.value = (Array.isArray(remRes) ? remRes : remRes.member || []).filter(
      r => r.campBiblic?.some(cb => extractId(cb) === campId)
    )
    participators.value = partRes.filter(p => p.campBiblic?.some(cb => extractId(cb) === campId))
    people.value = peopleRes
    paroisses.value = parRes
  } catch (e) {
    console.error(e)
    toast.error('Erreur chargement')
  } finally {
    loading.value = false
  }
}

onMounted(fetchAll)

function formatDateTime(s) {
  if (!s) return '—'
  const d = new Date(s)
  return d.toLocaleString('fr-FR', { timeZone: 'Africa/Kinshasa' })
}

const allRemovals = computed(() => {
  return removals.value
    .map(r => {
      const participatorUrl = Array.isArray(r.participator) ? r.participator[0] : r.participator
      const pid = extractId(participatorUrl)
      const part = participators.value.find(p => String(p.id) === String(pid)) || {}
      const personId = extractId(part.person)
      const pe = people.value.find(x => extractId(x['@id']) === personId) || {}
      let paroName = '—'
      if (pe.paroisse) {
        const parId = extractId(pe.paroisse)
        const par = paroisses.value.find(pp => String(pp.id) === parId)
        if (par) paroName = par.name
      }
      return {
        id: extractId(r['@id'] || r.id),
        gender: pe.gender,
        personName: pe.fullName || `#${part.id}`,
        paroisse: paroName,
        dortoir: part.dortoir || '—',
        carrefour: part.carrefour || '—',
        motif: r.motif || '—',
        start: r.start,
        end: r.end || null,
        createdAt: r.start // fallback si tu n’as pas de champ createdAt
      }
    })
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
})

const filteredRemovals = computed(() => {
  const term = searchTerm.value.toLowerCase().trim()
  if (!term) return allRemovals.value
  return allRemovals.value.filter(r => r.personName.toLowerCase().includes(term))
})

async function confirmRetour(rem) {
  try {
    const now = new Date().toISOString()
    await axios.patch(`${API}/removals/${rem.id}`, { end: now }, {
      headers: {
        "Content-Type": "application/merge-patch+json",
        "Authorization": `Bearer ${localStorage.getItem("token")}`
      }
    })
    toast.success('Retour confirmé')
    await fetchAll()
  } catch (e) {
    console.error(e)
    toast.error('Erreur confirmation')
  }
}
</script>

<style scoped>
.table-wrapper { max-height: 52vh; overflow-y: auto; border-radius: 8px; }
.table th, .table td { padding: .45rem; border: 1px solid #dee2e6; }
.sticky-top { position: sticky; top: -0.7rem; background: #fff; z-index: 10; }
</style>
