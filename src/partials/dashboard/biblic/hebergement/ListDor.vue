<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import axios from 'axios'
import { useToast } from 'vue-toastification'

const toast = useToast()

const props = defineProps({
  camp: { type: Object, required: true },
  type: { type: String, required: true }, // 'freres' ou 'soeurs'
})

// ===================================================
// 🌐 États réactifs & API
// ===================================================
const API = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api'
const loading = ref(false)
const logistics = ref([])
const participators = ref([])
const people = ref([])
const participatorsDetails = ref([])
const paroisses = ref([])

function extractId(url) {
  if (!url) return null
  return String(url).split('/').filter(Boolean).pop()
}

// ===================================================
// 🗓️ Génération dynamique des jours du camp
// ===================================================
const days = computed(() => {
  if (!props.camp.start || !props.camp.end) return []
  const start = new Date(props.camp.start)
  const end = new Date(props.camp.end)
  const result = []

  for (let d = new Date(start), i = 1; d <= end; d.setDate(d.getDate() + 1), i++) {
    result.push({
      label: `Jour_${i}`,
      date: new Date(d),
    })
  }
  return result
})

// ===================================================
// 📦 Chargement des données
// ===================================================
async function fetchData() {
  try {
    loading.value = true

    const [logRes, partRes, peopleRes, paroisRes] = await Promise.all([
      axios.get(`${API}/logistics`).then(r => r.data?.member || []),
      axios.get(`${API}/participators`).then(r => r.data?.member || []),
      axios.get(`${API}/people`).then(r => r.data?.member || []),
      axios.get(`${API}/paroisses`).then(r => r.data?.member || []),
    ])

    logistics.value = logRes.filter(l => extractId(l.cb) === props.camp.id)
    participators.value = partRes.filter(p =>
      p.campBiblic?.some(cb => extractId(cb) === props.camp.id)
    )
    paroisses.value = paroisRes
    people.value = peopleRes
  } catch (err) {
    console.error('❌ Erreur lors du chargement :', err)
    toast.error('Erreur lors du chargement des données')
  } finally {
    loading.value = false
  }
}
onMounted(fetchData)

// ===================================================
// 🧩 Fusion participators + people + filtrage
// ===================================================
const filteredParticipators = ref([])
const dortoirs = ref([])
const effectifs = ref({})
const totalEffectif = ref(0)
const totalPerDay = ref([])

// Modal
const showModal = ref(false)
const selectedDortoir = ref(null)
const dortoirMembers = ref([])

watch([participators, people], ([newParts, newPeople]) => {
  participatorsDetails.value = newParts.map(p => {
    const personId = extractId(p.person)
    const person = newPeople.find(pe => extractId(pe['@id']) === personId)

    // Récupération du nom de la paroisse
    let paroisseName = '—'

    if (person?.paroisse) {
      const paroisseId = extractId(person.paroisse)
      const paroisseObj = paroisses.value.find(par => String(par.id) === paroisseId)
      if (paroisseObj) paroisseName = paroisseObj.name
    }

    return {
      id: p.id,
      // Première lettre du genre en majuscule
      gender: person?.gender
        ? person.gender.charAt(0).toUpperCase() + person.gender.slice(1).toLowerCase()
        : '',
      fullName: person?.fullName || '',
      paroisse: paroisseName,
      status: person?.isDicoces
        ? 'Noyau diocésain'
        : person?.isDecanal
        ? 'Noyau décanal'
        : person?.isNoyau
        ? 'Noyau paroissial'
        : 'Jeune',
      dortoir: String(p.dortoir).trim(),
      createdAt: p.createdAt,
    }
  })

  // 🧮 Filtrage Frères / Sœurs 
  const isFrere = props.type === 'freres'
  const filtered = participatorsDetails.value.filter(p => {
    const g = p.gender.toLowerCase()
    return isFrere
      ? g.includes('fr') || g.includes('frère') || g.includes('frere')
      : g.includes('sr') || g.includes('soeur') || g.includes('sœur')
  })

  // 🏠 Dortoirs
  const log = logistics.value[0]
  const nbDortoirs = isFrere ? log?.dortoirFrere || 0 : log?.dortoirSoeur || 0
  const dortoirList = Array.from({ length: nbDortoirs }, (_, i) => `${i + 1}`)

  // 📊 Effectifs
  const map = {}
  for (const dor of dortoirList) {
    map[dor] = {}
    for (const day of days.value) {
      const dateStr = day.date.toISOString().split('T')[0]
      const count = filtered.filter(p => {
        const created = new Date(p.createdAt)
        const jour = new Date(day.date)
        return p.dortoir == dor && jour >= created
      }).length
      map[dor][dateStr] = count
    }
  }

  // Totaux par jour
  const totals = days.value.map(day => {
    const dateStr = day.date.toISOString().split('T')[0]
    return Object.values(map).reduce((sum, dor) => sum + (dor[dateStr] || 0), 0)
  })

  // Total général
  const total = Object.values(map).reduce(
    (acc, dor) => acc + Object.values(dor).reduce((a, b) => a + b, 0),
    0
  )

  filteredParticipators.value = filtered
  dortoirs.value = dortoirList
  effectifs.value = map
  totalPerDay.value = totals
  totalEffectif.value = total
}, { immediate: true })

// ===================================================
// 🪟 Gestion du modal
// ===================================================
function openModal(dortoir) {
  selectedDortoir.value = dortoir
  dortoirMembers.value = filteredParticipators.value.filter(p => p.dortoir === dortoir)
  showModal.value = true
}

function closeModal() {
  showModal.value = false
}
</script>

<template>
  <div>
    <div v-if="loading" class="text-center my-5">
      <span class="spinner-border"></span> Chargement des données...
    </div>

    <div v-else class="card card-table shadow-sm">
      <div class="card-header bg-light fw-semibold mx-2">
        Liste des dortoirs ({{ props.type === 'freres' ? 'Frères' : 'Soeurs' }})
      </div>

      <div class="table-wrapper">
        <table class="table table-striped table-bordered align-middle">
          <thead class="table-light sticky-top">
            <tr>
              <th>Dortoir</th>
              <th v-for="day in days" :key="day.label">{{ day.label }}</th>
            </tr>
          </thead>

          <tbody>
            <tr
              v-for="(dortoir) in dortoirs"
              :key="dortoir"
              @click="openModal(dortoir)"
              style="cursor: pointer"
            >
              <td>Dortoir {{ dortoir }}</td>
              <td
                v-for="day in days"
                :key="day.date.toISOString()"
                class="text-center"
              >
                {{ effectifs[dortoir]?.[day.date.toISOString().split('T')[0]] || 0 }}
              </td>
            </tr>

            <tr v-if="!dortoirs.length">
              <td colspan="10" class="text-center text-muted">
                Aucun dortoir défini pour ce camp
              </td>
            </tr>
          </tbody>

          <tfoot class="table-light sticky-bottom fw-semibold">
            <tr>
              <td>Totaux</td>
              <td v-for="(total, i) in totalPerDay" :key="i" class="text-center">
                {{ total }}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>

    <!-- 🪟 Modal -->
    <div v-if="showModal" class="modal-backdrop">
      <div class="modal-content">
        <div class="modal-header bg-light d-flex justify-between align-items-center">
          <h5>
            Dortoir {{ selectedDortoir }} — Effectif :
            {{ dortoirMembers.length }}
          </h5>
          <button class="btn-close" @click="closeModal">x</button>
        </div>

        <div class="modal-body">
          <table class="table table-bordered table-striped align-middle">
            <thead class="table-light sticky-top">
              <tr>
                <th>Nom</th>
                <th>Paroisse</th>
                <th>Statut</th>
                <th v-for="day in days" :key="day.label">{{ day.label }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="m in dortoirMembers" :key="m.id">
                <td>{{ m.gender.charAt(0).toUpperCase() + m.gender.slice(1) }} {{ m.fullName }}</td>
                <td>{{ m.paroisse }}</td>
                <td>{{ m.status }}</td>
                <td
                  v-for="day in days"
                  :key="day.date.toISOString()"
                  class="text-center"
                >
                  {{
                    new Date(day.date) >= new Date(m.createdAt)
                      ? 'X'
                      : '0'
                  }}
                </td>
              </tr>
              <tr v-if="!dortoirMembers.length">
                <td colspan="10" class="text-center text-muted">
                  Aucun membre trouvé
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.table-wrapper { max-height: 52vh; overflow-y: auto; border-radius: 8px; }
th, td { text-align: center; vertical-align: middle; }
.sticky-top { position: sticky; top: 0; background: #fff; z-index: 10; }
.sticky-bottom { position: sticky; bottom: 0; background: #f8f9fa; z-index: 9; }

/* 🌈 Scrollbar douce */
.modal-body::-webkit-scrollbar { width: 8px; }
.modal-body::-webkit-scrollbar-thumb { background: #adb5bd; border-radius: 4px; }
.modal-body::-webkit-scrollbar-thumb:hover { background: #6c757d; }

/* 🪟 Modal moderne */
.modal-backdrop { position: fixed; inset: 0; background: rgba(0,0,0,0.55); display: flex; align-items: center; justify-content: center; z-index: 1050; backdrop-filter: blur(3px); }
.modal-content { background: #fff; width: 85%; max-width: 950px; max-height: 85vh; border-radius: 16px; box-shadow: 0 10px 25px rgba(0,0,0,0.25); overflow: hidden; display: flex; flex-direction: column; animation: fadeInUp 0.3s ease; }
@keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
.modal-header { background: linear-gradient(90deg,#f8f9fa,#e9ecef); border-bottom: 1px solid #dee2e6; padding: .75rem 1rem; display: flex; justify-content: space-between; align-items: center; }
.modal-header h5 { font-size: 1.1rem; font-weight: 600; color: #343a40; margin: 0; }
.btn-close { border: none; background: transparent; font-size: 1.4rem; font-weight: 700; cursor: pointer; color: #6c757d; transition: .2s; }
.btn-close:hover { color: #dc3545; transform: scale(1.1); }
.modal-body { padding: .5rem 1rem 1rem; overflow-y: auto; max-height: 70vh; }

/* 📋 Table du modal */
.table { border-collapse: collapse; width: 100%; margin: 0; }
.table th { position: sticky; top: 0; background: #f8f9fa; color: #343a40; font-weight: 600; border-bottom: 2px solid #dee2e6; z-index: 5; }
.table td, .table th { padding: .5rem; border: 1px solid #dee2e6; }
.table-striped tbody tr:nth-child(odd) { background-color: #f9f9f9; }
.table tbody tr:hover { background-color: #eef4ff; transition: .2s ease; }
.table .text-muted { color: #6c757d; }

/* 🔠 Alignement à gauche pour Nom / Paroisse / Statut */
.table td:nth-child(1),
.table td:nth-child(2),
.table td:nth-child(3) { text-align: start; }

</style>

