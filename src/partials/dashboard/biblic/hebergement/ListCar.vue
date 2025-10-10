<template>
  <div>
    <div v-if="loading" class="text-center my-4">
      <span class="spinner-border"></span> Chargement...
    </div>

    <div v-else class="card card-table shadow-sm">
      <div class="card-header bg-light fw-semibold mx-2">
        Liste carrefours
      </div>

      <div class="table-wrapper">
        <table class="table table-striped table-bordered align-middle">
          <thead class="table-light sticky-top">
            <tr>
              <th>N°</th>
              <th>Carrefour</th>
              <th v-for="day in days" :key="day.label">{{ day.label }}</th>
            </tr>
          </thead>

          <tbody>
            <tr
              v-for="(car, idx) in carrefours"
              :key="car"
              @click="openModal(car)"
              class="clickable-row"
            >
              <td>{{ idx + 1 }}</td>
              <td>Carrefour {{ car }}</td>
              <td
                v-for="day in days"
                :key="day.date.toISOString()"
                class="text-center"
              >
                {{ effectifs[car]?.[day.date.toISOString().split('T')[0]] || 0 }}
              </td>
            </tr>

            <tr v-if="!carrefours.length">
              <td colspan="10" class="text-center text-muted">Aucun carrefour défini</td>
            </tr>
          </tbody>

          <tfoot class="table-light sticky-bottom fw-semibold">
            <tr>
              <td colspan="2">Totaux</td>
              <td v-for="(t, i) in totalPerDay" :key="i" class="text-center">{{ t }}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>

    <!-- Modal -->
    <div v-if="showModal" class="modal-backdrop" @keydown.esc="closeModal" tabindex="0">
      <div class="modal-content" role="dialog" aria-modal="true">
        <div class="modal-header">
          <h5>Carrefour {{ selected }} — Effectif : {{ members.length }}</h5>
          <button class="btn-close" @click="closeModal" aria-label="Fermer">×</button>
        </div>

        <div class="modal-body">
          <table class="table table-bordered table-striped align-middle">
            <thead class="table-light sticky-top">
              <tr>
                <th>Nom</th>
                <th>Paroisse</th>
                <th>Statut</th>
                <th>Dortoir</th>
                <th v-for="day in days" :key="day.label" class="text-center">{{ day.label }}</th>
              </tr>
            </thead>

            <tbody>
              <tr v-for="m in members" :key="m.id">
                <td class="text-start">{{ m.genderLabel }} {{ m.fullName }}</td>
                <td class="text-start">{{ m.paroisse }}</td>
                <td class="text-start">{{ m.status }}</td>
                <td class="text-start">{{ m.dortoir }}</td>

                <td
                  v-for="day in days"
                  :key="day.date.toISOString()"
                  class="text-center"
                >
                  {{ new Date(day.date) >= new Date(m.createdAt) ? 'X' : '0' }}
                </td>
              </tr>

              <tr v-if="!members.length">
                <td colspan="10" class="text-center text-muted">Aucun membre trouvé</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import axios from 'axios'
import { useToast } from 'vue-toastification'

const toast = useToast()
const props = defineProps({
  camp: { type: Object, required: true },
  type: { type: String, required: true } // 'freres' | 'soeurs' | 'carrefours'
})
const API = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api'

const loading = ref(false)
const logistics = ref([])
const participators = ref([])
const people = ref([])
const paroisses = ref([])

function extractId(url) {
  if (!url) return null
  return String(url).split('/').filter(Boolean).pop()
}

const days = computed(() => {
  if (!props.camp?.start || !props.camp?.end) return []
  const start = new Date(props.camp.start)
  const end = new Date(props.camp.end)
  const res = []
  for (let d = new Date(start), i = 1; d <= end; d.setDate(d.getDate()+1), i++) {
    res.push({ label: `Jour_${i}`, date: new Date(d) })
  }
  return res
})

async function fetchAll() {
  try {
    loading.value = true
    const [logRes, partRes, peopleRes, parRes] = await Promise.all([
      axios.get(`${API}/logistics`).then(r => r.data?.member || []),
      axios.get(`${API}/participators`).then(r => r.data?.member || []),
      axios.get(`${API}/people`).then(r => r.data?.member || []),
      axios.get(`${API}/paroisses`).then(r => r.data?.member || []),
    ])
    logistics.value = logRes.filter(l => extractId(l.cb) === props.camp.id)
    participators.value = partRes.filter(p => p.campBiblic?.some(cb => extractId(cb) === props.camp.id))
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

// carrefours list + filtering by gender (from people)
const carrefours = ref([])
const effectifs = ref({})
const totalPerDay = ref([])
const showModal = ref(false)
const selected = ref(null)
const members = ref([])

// recompute whenever data changes
watch([logistics, participators, people], () => {
  // determine number of carrefours from logistics first matching camp
  const log = logistics.value[0] || {}
  const nbCar = log?.carrefour || 0
  carrefours.value = Array.from({ length: nbCar }, (_, i) => `${i + 1}`)

  // build participators details (join with people and paroisse)
  const partsDetails = participators.value.map(p => {
    const pid = extractId(p.person)
    const pe = people.value.find(x => extractId(x['@id']) === pid) || {}
    let paroName = '—'
    if (pe.paroisse) {
      const parId = extractId(pe.paroisse)
      const parObj = paroisses.value.find(pp => String(pp.id) === parId)
      if (parObj) paroName = parObj.name
    }
    const genderLabel = pe.gender ? (pe.gender.charAt(0).toUpperCase() + pe.gender.slice(1).toLowerCase()) : ''
    const status = pe.isDicoces ? 'Noyau diocésain' : pe.isDecanal ? 'Noyau décanal' : pe.isNoyau ? 'Noyau paroissial' : 'Jeune'
    return {
      id: p.id,
      personId: pid,
      fullName: pe.fullName || '',
      genderLabel,
      paroisse: paroName,
      status,
      dortoir: String(p.dortoir).trim(),
      carrefour: String(p.carrefour ?? '').trim(),
      createdAt: p.createdAt
    }
  })

  // filter by type (freres / soeurs) using gender label
  const isFrere = props.type === 'freres'
  const filtered = partsDetails.filter(p => {
    const g = (p.genderLabel || '').toLowerCase()
    return isFrere ? (g.includes('fr') || g.includes('m') || g.includes('homme')) : (g.includes('soeu') || g.includes('s') || g.includes('f'))
  })

  // compute effectifs per carrefour per day
  const map = {}
  for (const car of carrefours.value) {
    map[car] = {}
    for (const day of days.value) {
      const dateStr = day.date.toISOString().split('T')[0]
      const count = filtered.filter(p => {
        const created = new Date(p.createdAt)
        const jour = new Date(day.date)
        // car stored as number string? compare stringified
        return (String(p.carrefour) === String(car)) && jour >= created
      }).length
      map[car][dateStr] = count
    }
  }

  // totals per day
  totalPerDay.value = days.value.map(day => {
    const dateStr = day.date.toISOString().split('T')[0]
    return Object.values(map).reduce((s, dor) => s + (dor[dateStr] || 0), 0)
  })

  effectifs.value = map
}, { immediate: true })

function openModal(car) {
  selected.value = car
  // build members list
  const isFrere = props.type === 'freres'
  const partsDetails = participators.value.map(p => {
    const pid = extractId(p.person)
    const pe = people.value.find(x => extractId(x['@id']) === pid) || {}
    let paroName = '—'
    if (pe.paroisse) {
      const parId = extractId(pe.paroisse)
      const parObj = paroisses.value.find(pp => String(pp.id) === parId)
      if (parObj) paroName = parObj.name
    }
    const genderLabel = pe.gender ? (pe.gender.charAt(0).toUpperCase() + pe.gender.slice(1).toLowerCase()) : ''
    const status = pe.isDicoces ? 'Noyau diocésain' : pe.isDecanal ? 'Noyau décanal' : pe.isNoyau ? 'Noyau paroissial' : 'Jeune'
    return {
      id: p.id,
      fullName: pe.fullName || '',
      genderLabel,
      paroisse: paroName,
      status,
      dortoir: String(p.dortoir).trim(),
      carrefour: String(p.carrefour ?? '').trim(),
      createdAt: p.createdAt
    }
  })
  // filter by type AND carrefour
  const filtered = partsDetails.filter(p => {
    const g = (p.genderLabel || '').toLowerCase()
    const okGender = isFrere ? (g.includes('fr') || g.includes('m')) : (g.includes('soeu') || g.includes('f') || g.includes('s'))
    return okGender && String(p.carrefour) === String(car)
  })
  members.value = filtered
  showModal.value = true
  // focus for keyboard esc
  setTimeout(() => {
    const backdrop = document.querySelector('.modal-backdrop')
    if (backdrop) backdrop.focus()
  }, 0)
}
function closeModal() {
  showModal.value = false
  members.value = []
}
</script>

<style scoped>
.table-wrapper { max-height: 52vh; overflow-y: auto; border-radius: 8px; }
.table th, .table td { padding: .45rem; border: 1px solid #dee2e6; }
.sticky-top { position: sticky; top: 0; background: #fff; z-index: 10; }
.sticky-bottom { position: sticky; bottom: 0; background: #f8f9fa; z-index: 9; }
.clickable-row { cursor: pointer; }
.clickable-row:hover { background: #eef4ff; transition: .12s; }

/* Modal */
.modal-backdrop { position: fixed; inset: 0; background: rgba(0,0,0,0.55); display:flex; align-items:center; justify-content:center; z-index:1050; backdrop-filter: blur(3px); }
.modal-content { background:#fff; width:85%; max-width:900px; max-height:85vh; border-radius:12px; overflow:hidden; display:flex; flex-direction:column; }
.modal-header { padding:.75rem 1rem; border-bottom:1px solid #e9ecef; display:flex; justify-content:space-between; align-items:center; background:linear-gradient(90deg,#f8f9fa,#eef2f6); }
.modal-header h5 { margin:0; font-weight:600; }
.btn-close { border:none; background:transparent; font-size:1.4rem; cursor:pointer; color:#6c757d; }
.btn-close:hover { color:#dc3545; transform:scale(1.05); }
.modal-body { padding:.5rem 1rem 1rem; overflow-y:auto; max-height:70vh; }

/* alignments */
.text-start { text-align: start; }
.text-center { text-align: center; }
</style>
