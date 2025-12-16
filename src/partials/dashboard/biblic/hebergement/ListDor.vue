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
// 📦 Chargement des données AVEC PAGINATION
// ===================================================
async function fetchData() {
  try {
    loading.value = true
    // console.log(`🔄 Chargement des données de dortoir pour ${props.type}...`)

    const [logRes, partRes, peopleRes, paroisRes] = await Promise.all([
      fetchAllPages(`${API}/logistics`),
      fetchAllPages(`${API}/participators`),
      fetchAllPages(`${API}/people`),
      fetchAllPages(`${API}/paroisses`),
    ])

    logistics.value = logRes.filter(l => extractId(l.cb) === props.camp.id)
    participators.value = partRes.filter(p =>
      p.campBiblic?.some(cb => extractId(cb) === props.camp.id)
    )
    paroisses.value = paroisRes
    people.value = peopleRes

    // console.log(`🏨 Données dortoir chargées: ${logRes.length} logistiques, ${partRes.length} participants, ${peopleRes.length} personnes, ${paroisRes.length} paroisses`)

  } catch (err) {
    console.error('❌ Erreur lors du chargement :', err)
    toast.error('Erreur lors du chargement des données')
  } finally {
    loading.value = false
  }
}

// Fonction de rafraîchissement
async function refreshData() {
  await fetchData()
  toast.success('Données des dortoirs actualisées')
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
  // console.log(`👥 Traitement de ${newParts.length} participants et ${newPeople.length} personnes`)
  
  participatorsDetails.value = newParts.map(p => {
    const personId = extractId(p.person)
    const person = newPeople.find(pe => extractId(pe['@id']) === personId)

    // Récupération du nom de la paroisse
    let paroisseName = '—'

    if (person?.paroisse) {
      const paroisseId = extractId(person.paroisse)
      const paroisseObj = paroisses.value.find(par => extractId(par['@id']) === paroisseId || String(par.id) === paroisseId)
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

  // console.log(`👨‍👩‍👧‍👦 ${filtered.length} ${isFrere ? 'frères' : 'soeurs'} filtrés`)

  // 🏠 Dortoirs
  const log = logistics.value[0]
  const nbDortoirs = isFrere ? log?.dortoirFrere || 0 : log?.dortoirSoeur || 0
  const dortoirList = Array.from({ length: nbDortoirs }, (_, i) => `${i + 1}`)

  // console.log(`🏠 ${dortoirList.length} dortoirs disponibles`)

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

  // Total général (dernier jour)
  const lastDayTotal = totals.length > 0 ? totals[totals.length - 1] : 0

  filteredParticipators.value = filtered
  dortoirs.value = dortoirList
  effectifs.value = map
  totalPerDay.value = totals
  totalEffectif.value = lastDayTotal

  // console.log(`📊 Calcul des effectifs terminé: ${lastDayTotal} ${isFrere ? 'frères' : 'soeurs'} au total (dernier jour)`)
}, { immediate: true })

// ===================================================
// 🪟 Gestion du modal
// ===================================================
function openModal(dortoir) {
  selectedDortoir.value = dortoir
  dortoirMembers.value = filteredParticipators.value.filter(p => p.dortoir === dortoir)
  // console.log(`🪟 Ouverture modal dortoir ${dortoir}: ${dortoirMembers.value.length} membres`)
  showModal.value = true
}

function closeModal() {
  showModal.value = false
}
</script>

<template>
  <div>
    <div class="d-flex justify-content-between align-items-center mb-3">
      <h6 class="m-0">Gestion des dortoirs - {{ props.type === 'freres' ? 'Frères' : 'Soeurs' }}</h6>
      <button @click="refreshData" class="btn btn-sm btn-outline-primary" :disabled="loading">
        <span v-if="loading" class="spinner-border spinner-border-sm me-1"></span>
        {{ loading ? 'Actualisation...' : 'Actualiser' }}
      </button>
    </div>

    <div v-if="loading" class="text-center my-5">
      <span class="spinner-border"></span> 
      <div class="mt-2">Chargement des données des dortoirs...</div>
    </div>

    <div v-else class="card card-table shadow-sm">
      <div class="table-wrapper">
        <table class="table table-striped table-bordered align-middle">
          <thead class="table-light sticky-top">
            <tr>
              <th>Dortoir</th>
              <th v-for="day in days" :key="day.label">{{ day.label }}</th>
              <th>Total</th>
            </tr>
          </thead>

          <tbody>
            <tr
              v-for="(dortoir) in dortoirs"
              :key="dortoir"
              @click="openModal(dortoir)"
              class="selectable-row"
            >
              <td class="fw-semibold">Dortoir {{ dortoir }}</td>
              <td
                v-for="day in days"
                :key="day.date.toISOString()"
                class="text-center"
              >
                <span class="badge bg-primary rounded-pill cl-white">
                  {{ effectifs[dortoir]?.[day.date.toISOString().split('T')[0]] || 0 }}
                </span>
              </td>
              <td class="text-center fw-bold">
                <span class="badge bg-dark rounded-pill cl-white">
                  <!-- Affiche la valeur du dernier jour -->
                  {{ effectifs[dortoir]?.[days[days.length - 1]?.date.toISOString().split('T')[0]] || 0 }}
                </span>
              </td>
            </tr>

            <tr v-if="!dortoirs.length">
              <td colspan="10" class="text-center text-muted py-4">
                <i class="fas fa-bed me-2"></i>
                Aucun dortoir défini pour ce camp
              </td>
            </tr>
          </tbody>

          <tfoot class="table-light sticky-bottom fw-semibold">
            <tr>
              <td>Totaux</td>
              <td v-for="(total, i) in totalPerDay" :key="i" class="text-center">
                <span class="badge bg-success rounded-pill cl-white">{{ total }}</span>
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

    <!-- 🪟 Modal -->
    <div v-if="showModal" class="modal-backdrop">
      <div class="modal-content">
        <div class="modal-header bg-light d-flex justify-content-between align-items-center">
          <h5 class="m-0">
            <i class="fas fa-bed me-2"></i>
            Dortoir {{ selectedDortoir }} — Effectif : {{ dortoirMembers.length }}
          </h5>
          <button class="btn-close" @click="closeModal">×</button>
        </div>

        <div class="modal-body">
          <div class="d-flex justify-content-between align-items-center mb-3">
            <small class="text-muted">{{ dortoirMembers.length }} membre(s) dans ce dortoir</small>
          </div>
          <table class="table table-bordered table-striped align-middle">
            <thead class="table-light sticky-top">
              <tr>
                <th>Nom</th>
                <th>Paroisse</th>
                <th>Statut</th>
                <th v-for="day in days" :key="day.label" class="text-center">{{ day.label }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="m in dortoirMembers" :key="m.id">
                <td class="fw-medium">{{ m.gender.charAt(0).toUpperCase() + m.gender.slice(1) }} {{ m.fullName }}</td>
                <td>{{ m.paroisse }}</td>
                <td>
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
              <tr v-if="!dortoirMembers.length">
                <td colspan="10" class="text-center text-muted py-3">
                  <i class="fas fa-users me-2"></i>
                  Aucun membre dans ce dortoir
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
.table-wrapper { 
  max-height: 52vh; 
  overflow-y: auto; 
  border-radius: 8px; 
  border: 1px solid #dee2e6;
}
th, td { 
  text-align: center; 
  vertical-align: middle; 
  padding: 0.75rem;
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

.selectable-row { 
  cursor: pointer; 
  transition: all 0.2s ease;
}
.selectable-row:hover { 
  background-color: #f8f9fa; 
  transform: translateY(-1px);
}

.badge.rounded-pill {
  border-radius: 50rem !important;
  min-width: 2.5rem;
}

/* 🌈 Scrollbar douce */
.modal-body::-webkit-scrollbar { width: 8px; }
.modal-body::-webkit-scrollbar-thumb { background: #adb5bd; border-radius: 4px; }
.modal-body::-webkit-scrollbar-thumb:hover { background: #6c757d; }

/* 🪟 Modal moderne */
.modal-backdrop { 
  position: fixed; 
  inset: 0; 
  background: rgba(0,0,0,0.55); 
  display: flex; 
  align-items: center; 
  justify-content: center; 
  z-index: 1050; 
  backdrop-filter: blur(3px); 
}
.modal-content { 
  background: #fff; 
  width: 90%; 
  max-width: 1200px; 
  max-height: 85vh; 
  border-radius: 16px; 
  box-shadow: 0 10px 25px rgba(0,0,0,0.25); 
  overflow: hidden; 
  display: flex; 
  flex-direction: column; 
  animation: fadeInUp 0.3s ease; 
}
@keyframes fadeInUp { 
  from { opacity: 0; transform: translateY(20px); } 
  to { opacity: 1; transform: translateY(0); } 
}
.modal-header { 
  background: linear-gradient(90deg,#f8f9fa,#e9ecef); 
  border-bottom: 1px solid #dee2e6; 
  padding: 1rem 1.5rem; 
  display: flex; 
  justify-content: space-between; 
  align-items: center; 
}
.modal-header h5 { 
  font-size: 1.2rem; 
  font-weight: 600; 
  color: #343a40; 
  margin: 0; 
}
.btn-close { 
  border: none; 
  background: transparent; 
  font-size: 1.5rem; 
  font-weight: 700; 
  cursor: pointer; 
  color: #6c757d; 
  transition: .2s; 
  padding: 0.5rem;
}
.btn-close:hover { 
  color: #dc3545; 
  transform: scale(1.1); 
}
.modal-body { 
  padding: 1rem 1.5rem; 
  overflow-y: auto; 
  max-height: 70vh; 
}

/* 📋 Table du modal */
.table { 
  border-collapse: collapse; 
  width: 100%; 
  margin: 0; 
}
.table th { 
  position: sticky; 
  top: 0; 
  background: #f8f9fa; 
  color: #343a40; 
  font-weight: 600; 
  border-bottom: 2px solid #dee2e6; 
  z-index: 5; 
}
.table td, .table th { 
  padding: 0.75rem; 
  border: 1px solid #dee2e6; 
}
.table-striped tbody tr:nth-child(odd) { 
  background-color: #f9f9f9; 
}
.table tbody tr:hover { 
  background-color: #eef4ff; 
  transition: .2s ease; 
}
.table .text-muted { 
  color: #6c757d; 
}

/* 🔠 Alignement à gauche pour Nom / Paroisse / Statut */
.table td:nth-child(1),
.table td:nth-child(2),
.table td:nth-child(3) { 
  text-align: start; 
}

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
}
.cl-white {
    color: #fff;
  }
</style>