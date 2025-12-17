<template>
  <div>
    <div class="d-flex justify-content-between align-items-center mb-3">
      <h6 class="m-0">Gestion des carrefours - {{ props.type === 'freres' ? 'Frères' : 'Soeurs' }}</h6>
      <button @click="refreshData" class="btn btn-sm btn-outline-primary" :disabled="loading">
        <span v-if="loading" class="spinner-border spinner-border-sm me-1"></span>
        {{ loading ? 'Actualisation...' : 'Actualiser' }}
      </button>
    </div>

    <div v-if="loading" class="text-center my-4">
      <span class="spinner-border"></span> 
      <div class="mt-2">Chargement des carrefours...</div>
    </div>

    <div v-else class="card card-table shadow-sm">
      <div class="table-wrapper">
        <table class="table table-striped table-bordered align-middle">
          <thead class="table-light sticky-top">
            <tr>
              <th>N°</th>
              <th>Carrefour</th>
              <th v-for="day in days" :key="day.label" class="text-center">{{ day.label }}</th>
              <th class="text-center">Total</th>
            </tr>
          </thead>

          <tbody>
            <tr
              v-for="(car, idx) in carrefours"
              :key="car"
              @click="openModal(car)"
              class="clickable-row"
            >
            
              <td class="fw-semibold">{{ idx + 1 }}</td>
              <td v-if="(car<1)" class="fw-semibold">Rafiki</td>
              <td v-else class="fw-semibold">Dortoir {{ car }}</td>
              <td
                v-for="day in days"
                :key="day.date.toISOString()"
                class="text-center"
              >
                <span class="badge bg-primary rounded-pill cl-white">
                  {{ effectifs[car]?.[day.date.toISOString().split('T')[0]] || 0 }}
                </span>
              </td>
              <td class="text-center fw-bold">
                <span class="badge bg-dark rounded-pill cl-white">
                  <!-- Affiche la valeur du dernier jour -->
                  {{ effectifs[car]?.[days[days.length - 1]?.date.toISOString().split('T')[0]] || 0 }}
                </span>
              </td>
            </tr>

            <tr v-if="!carrefours.length">
              <td colspan="10" class="text-center text-muted py-4">
                <i class="fas fa-map-marker-alt me-2"></i>
                Aucun carrefour défini pour ce camp
              </td>
            </tr>
          </tbody>

          <tfoot class="table-light sticky-bottom fw-semibold">
            <tr>
              <td colspan="2">Totaux</td>
              <td v-for="(t, i) in totalPerDay" :key="i" class="text-center">
                <span class="badge bg-success rounded-pill cl-white">{{ t }}</span>
              </td>
              <td class="text-center">
                <!-- Affiche la valeur du dernier jour pour le total général -->
                <span class="badge bg-success rounded-pill cl-white">
                  {{ totalPerDay.length > 0 ? totalPerDay[totalPerDay.length - 1] : 0 }}
                </span>
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>

    <!-- Modal -->
    <div v-if="showModal" class="modal-backdrop" @keydown.esc="closeModal" tabindex="0">
      <div class="modal-content" role="dialog" aria-modal="true">
        <div class="modal-header">
          <h5>
            <i class="fas fa-map-marker-alt me-2"></i>
            Carrefour {{ selected }} — Effectif : {{ members.length }}
          </h5>
          <button class="btn-close" @click="closeModal" aria-label="Fermer">×</button>
        </div>

        <div class="modal-body">
          <div class="d-flex justify-content-between align-items-center mb-3">
            <small class="text-muted">{{ members.length }} personne(s) dans ce carrefour</small>
          </div>
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
                <td class="text-start fw-medium">{{ m.genderLabel }} {{ m.fullName }}</td>
                <td class="text-start">{{ m.paroisse }}</td>
                <td class="text-start">
                  <span class="badge" 
                    :class="{
                      'bg-success text-white': m.status === 'Jeune',
                      'bg-primary text-white': m.status === 'Noyau paroissial',
                      'bg-warning text-white': m.status === 'Noyau décanal',
                      'bg-danger text-white': m.status === 'Noyau diocésain'
                    }">
                    {{ m.status }}
                  </span>
                </td>
                <td class="text-start">
                  <span v-if="m.dortoir" class="badge bg-info text-dark">Dortoir {{ m.dortoir }}</span>
                  <span v-else class="text-muted small">—</span>
                </td>

                <td
                  v-for="day in days"
                  :key="day.date.toISOString()"
                  class="text-center"
                >
                  <span class="badge" 
                    :class="new Date(day.date) >= new Date(m.createdAt) ? 'bg-success' : 'bg-secondary'">
                    {{ new Date(day.date) >= new Date(m.createdAt) ? '✓' : '—' }}
                  </span>
                </td>
              </tr>

              <tr v-if="!members.length">
                <td colspan="10" class="text-center text-muted py-3">
                  <i class="fas fa-users me-2"></i>
                  Aucun membre dans ce carrefour
                </td>
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

// === FONCTION PAGINATION OPTIMISÉE ===
async function fetchAllPages(baseUrl) {
  let allItems = [];
  let currentPage = 1;
  let hasMore = true;
  
  try {
    while (hasMore) {
      const url = `${baseUrl}${baseUrl.includes('?') ? '&' : '?'}page=${currentPage}`;
      
      const response = await axios.get(url);
      const data = response.data;
      
      if (data.member && Array.isArray(data.member)) {
        allItems = [...allItems, ...data.member];
        
        // Vérifie s'il y a plus de pages
        if (data.member.length === 0 || 
            data.member.length < 30 ||
            currentPage >= 50) {
          hasMore = false;
        } else {
          currentPage++;
        }
      } else {
        hasMore = false;
      }
    }
    
    // console.log(`📊 ${baseUrl} - ${allItems.length} enregistrements chargés`);
    return allItems;
  } catch (error) {
    console.error(`Erreur lors de la récupération paginée de ${baseUrl}:`, error);
    throw error;
  }
}

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
    // console.log(`🔄 Chargement des données carrefours pour ${props.type}...`)

    const [logRes, partRes, peopleRes, parRes] = await Promise.all([
      fetchAllPages(`${API}/logistics`),
      fetchAllPages(`${API}/participators`),
      fetchAllPages(`${API}/people`),
      fetchAllPages(`${API}/paroisses`),
    ])

    logistics.value = logRes.filter(l => extractId(l.cb) === props.camp.id)
    participators.value = partRes.filter(p => p.campBiblic?.some(cb => extractId(cb) === props.camp.id))
    people.value = peopleRes
    paroisses.value = parRes

    // console.log(`📍 Données carrefours chargées: ${logRes.length} logistiques, ${partRes.length} participants, ${peopleRes.length} personnes, ${parRes.length} paroisses`)

  } catch (e) {
    console.error(e)
    toast.error('Erreur lors du chargement des données')
  } finally {
    loading.value = false
  }
}

// Fonction de rafraîchissement
async function refreshData() {
  await fetchAll()
  toast.success('Données des carrefours actualisées')
}

onMounted(fetchAll)

// carrefours list + filtering by gender (from people)
const carrefours = ref([])
const effectifs = ref({})
const totalPerDay = ref([])
const showModal = ref(false)
const selected = ref(null)
const members = ref([])

// Total général calculé (dernier jour)
const totalGeneral = computed(() => {
  return totalPerDay.value.length > 0 ? totalPerDay.value[totalPerDay.value.length - 1] : 0
})

// recompute whenever data changes
watch([logistics, participators, people], () => {
  // console.log(`👥 Traitement de ${participators.value.length} participants et ${people.value.length} personnes`)
  
  // determine number of carrefours from logistics first matching camp
  const log = logistics.value[0] || {}
  const nbCar = log?.carrefour+1 || 0
  carrefours.value = Array.from({ length: nbCar }, (_, i) => `${i}`)

  // console.log(`📍 ${carrefours.value.length} carrefours disponibles`)

  // build participators details (join with people and paroisse)
  const partsDetails = participators.value.map(p => {
    const pid = extractId(p.person)
    const pe = people.value.find(x => extractId(x['@id']) === pid) || {}
    let paroName = '—'
    if (pe.paroisse) {
      const parId = extractId(pe.paroisse)
      const parObj = paroisses.value.find(pp => extractId(pp['@id']) === parId || String(pp.id) === parId)
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
  const filtered = partsDetails.filter(p => {
    const g = (p.genderLabel || '').toLowerCase()
    return (g.includes('fr') || g.includes('m') || g.includes('homme') || g.includes('soeu') || g.includes('s') || g.includes('f'))
  })

  // console.log(`👨‍👩‍👧‍👦 ${filtered.length} ${isFrere ? 'frères' : 'soeurs'} filtrés`)

  // compute effectifs per carrefour per day
  const map = {}
  for (const car of carrefours.value) {
    map[car-1] = {}
    for (const day of days.value) {
      const dateStr = day.date.toISOString().split('T')[0]
      const count = filtered.filter(p => {
        const created = new Date(p.createdAt)
        const jour = new Date(day.date)
        // car stored as number string? compare stringified
        return (String(p.carrefour) === String(car-1)) && jour >= created
      }).length
      map[car-1][dateStr] = count
    }
  }

  // totals per day
  totalPerDay.value = days.value.map(day => {
    const dateStr = day.date.toISOString().split('T')[0]
    return Object.values(map).reduce((s, dor) => s + (dor[dateStr] || 0), 0)
  })

  effectifs.value = map

  // console.log(`📊 Calcul des effectifs terminé: ${totalGeneral.value} ${isFrere ? 'frères' : 'soeurs'} au total (dernier jour)`)
}, { immediate: true })

function openModal(car) {
  selected.value = car
  // build members list
    const partsDetails = participators.value.map(p => {
    const pid = extractId(p.person)
    const pe = people.value.find(x => extractId(x['@id']) === pid) || {}
    let paroName = '—'
    if (pe.paroisse) {
      const parId = extractId(pe.paroisse)
      const parObj = paroisses.value.find(pp => extractId(pp['@id']) === parId || String(pp.id) === parId)
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
    const okGender = (g.includes('fr') || g.includes('m')) || (g.includes('soeu') || g.includes('f') || g.includes('s'))
    return okGender && String(p.carrefour) === String(car)
  })
  members.value = filtered
  showModal.value = true
  // console.log(`🪟 Ouverture modal carrefour ${car}: ${members.value.length} membres`)
  
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
.table-wrapper { 
  max-height: 52vh; 
  overflow-y: auto; 
  border-radius: 8px; 
  border: 1px solid #dee2e6;
}
.table th, .table td { 
  padding: .75rem; 
  border: 1px solid #dee2e6; 
}
.sticky-top { 
  position: sticky; 
  top: 0; 
  background: #fff; 
  z-index: 10; 
}
.sticky-bottom { 
  position: sticky; 
  bottom: 0; 
  background: #f8f9fa; 
  z-index: 9; 
}
.clickable-row { 
  cursor: pointer; 
  transition: all 0.2s ease;
}
.clickable-row:hover { 
  background: #eef4ff; 
  transform: translateY(-1px);
}

.badge.rounded-pill {
  border-radius: 50rem !important;
  min-width: 2.5rem;
}

/* Modal */
.modal-backdrop { 
  position: fixed; 
  inset: 0; 
  background: rgba(0,0,0,0.55); 
  display:flex; 
  align-items:center; 
  justify-content:center; 
  z-index:1050; 
  backdrop-filter: blur(3px); 
}
.modal-content { 
  background:#fff; 
  width:90%; 
  max-width:1200px; 
  max-height:85vh; 
  border-radius:12px; 
  overflow:hidden; 
  display:flex; 
  flex-direction:column; 
  box-shadow: 0 10px 25px rgba(0,0,0,0.25);
  animation: fadeInUp 0.3s ease;
}
@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}
.modal-header { 
  padding:1rem 1.5rem; 
  border-bottom:1px solid #e9ecef; 
  display:flex; 
  justify-content:space-between; 
  align-items:center; 
  background:linear-gradient(90deg,#f8f9fa,#eef2f6); 
}
.modal-header h5 { 
  margin:0; 
  font-weight:600; 
  font-size: 1.2rem;
}
.btn-close { 
  border:none; 
  background:transparent; 
  font-size:1.5rem; 
  cursor:pointer; 
  color:#6c757d; 
  padding: 0.5rem;
  transition: all 0.2s ease;
}
.btn-close:hover { 
  color:#dc3545; 
  transform:scale(1.1); 
}
.modal-body { 
  padding:1rem 1.5rem; 
  overflow-y:auto; 
  max-height:70vh; 
}

/* alignments */
.text-start { text-align: start; }
.text-center { text-align: center; }

/* Responsive design */
@media (max-width: 768px) {
  .table-wrapper {
    max-height: 40vh;
  }
  
  .modal-content {
    width: 95%;
    margin: 1rem;
  }
  
  .modal-header {
    padding: 0.75rem 1rem;
  }
  
  .modal-body {
    padding: 0.5rem 1rem;
  }
  
  .table th, .table td {
    padding: 0.5rem;
  }
}
.cl-white {
    color: #fff;
  }
</style>