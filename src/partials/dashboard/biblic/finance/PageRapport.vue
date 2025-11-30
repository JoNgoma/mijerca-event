<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import axios from 'axios'
import Chart from 'chart.js/auto'
import RapportDay from './RapportDay.vue'

const route = useRoute()
const campBibliqueId = ref(route.params.id_campBiblique || '')
const campName = ref('')
const selectedDate = ref('')
const availableDates = ref([])
const selectedSecteur = ref('') // Tab actif

const allSectors = ref([])
const allParoisses = ref([])
const allPeople = ref([])
const allParticipators = ref([])
const allMontants = ref([])

const loading = ref(true)
const summaryData = ref([])

const API = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api'
let chartInstance = null

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
    
    console.log(`📊 ${baseUrl} - ${allItems.length} enregistrements chargés`);
    return allItems;
  } catch (error) {
    console.error(`Erreur lors de la récupération paginée de ${baseUrl}:`, error);
    throw error;
  }
}

async function fetchCampName() {
  if (!campBibliqueId.value) return
  try {
    const res = await axios.get(`${API}/camp_bibliques/${campBibliqueId.value}`)
    campName.value = res.data?.name || 'Camp inconnu'
  } catch (err) {
    console.error(err)
    campName.value = 'Camp inconnu'
  }
}

async function fetchSectors() {
  try {
    const res = await fetchAllPages(`${API}/sectors`)
    allSectors.value = res || []
    console.log(`🏛️ ${allSectors.value.length} secteurs chargés`)
  } catch (err) {
    console.error('Erreur fetch sectors', err)
  }
}

async function fetchDates() {
  loading.value = true
  try {
    console.log('🔄 Chargement des données avec pagination...')
    
    const [participators, paroisses, people, montants] = await Promise.all([
      fetchAllPages(`${API}/participators`),
      fetchAllPages(`${API}/paroisses`),
      fetchAllPages(`${API}/people`),
      fetchAllPages(`${API}/montants`)
    ])

    allParticipators.value = participators
    allParoisses.value = paroisses
    allPeople.value = people
    allMontants.value = montants

    console.log(`📈 Données chargées: ${participators.length} participants, ${paroisses.length} paroisses, ${people.length} personnes, ${montants.length} montants`)

    const datesSet = new Set()
    participators.forEach(p => {
      if (p.createdAt && p.campBiblic?.some(c => c.split('/').pop() === campBibliqueId.value)) {
        datesSet.add(p.createdAt.split('T')[0])
      }
    })

    const sortedDates = Array.from(datesSet).sort((a, b) => new Date(b) - new Date(a))
    availableDates.value = sortedDates
    if (!selectedDate.value || !sortedDates.includes(selectedDate.value)) {
      selectedDate.value = sortedDates[0] || ''
    }

    calculateSummary()
  } catch (err) {
    console.error('Erreur récupération dates et données', err)
  } finally {
    loading.value = false
  }
}

const rapportKey = ref(Date.now())
function selectSecteur(id) {
  selectedSecteur.value = id
  rapportKey.value = Date.now()
}

function extractIdFromUrl(url) {
  if (!url) return null
  return String(url).split('/').filter(Boolean).pop()
}

// Calcul du résumé par secteur avec filtre date
function calculateSummary() {
  if (!selectedDate.value) return
  const agg = {}

  allSectors.value.forEach(sector => {
    agg[sector.id] = {
      id: sector.id,
      name: sector.name,
      totalEffectif: 0,
      totalFrere: 0,
      totalSoeur: 0,
      totalUSD: 0,
      totalFC: 0,
      totalParoisses: 0
    }
  })

  // Calcul des effectifs et montants
  allParticipators.value.forEach(part => {
    const partDate = part.createdAt?.split('T')[0]
    if (partDate !== selectedDate.value) return

    const person = allPeople.value.find(pe => pe['@id'] === part.person)
    if (!person) return

    const paro = allParoisses.value.find(pa => pa['@id'] === person.paroisse)
    if (!paro) return

    const sectorId = extractIdFromUrl(paro.sector)
    if (!agg[sectorId]) return

    const montantRecord = allMontants.value.find(m => m.participator === part['@id'])
    const montant = Number(montantRecord?.frais || 0)
    const devise = (montantRecord?.devise || 'FC').toUpperCase()

    agg[sectorId].totalEffectif += 1
    if (person.gender === 'Frère') agg[sectorId].totalFrere += 1
    if (person.gender === 'Soeur') agg[sectorId].totalSoeur += 1

    if (devise === 'USD' || devise === '$') agg[sectorId].totalUSD += montant
    else agg[sectorId].totalFC += montant
  })

// Nombre de paroisses par secteur filtré sur date
allSectors.value.forEach(sector => {
  const paroissesDuSecteur = allParoisses.value.filter(pa => extractIdFromUrl(pa.sector) === sector.id)

  // récupérer les paroisses ayant au moins un participator à la date
  const paroIds = new Set()

  allParticipators.value.forEach(p => {
    const partDate = p.createdAt?.split('T')[0]
    if (partDate !== selectedDate.value) return

    const person = allPeople.value.find(pe => pe['@id'] === p.person)
    if (!person || !person.paroisse) return

    const paroId = extractIdFromUrl(person.paroisse)
    if (paroissesDuSecteur.some(pa => extractIdFromUrl(pa['@id']) === paroId)) {
      paroIds.add(paroId)
    }
  })

  agg[sector.id].totalParoisses = paroIds.size
})

  summaryData.value = Object.values(agg)
  console.log(`📊 Résumé calculé: ${summaryData.length} secteurs pour le ${selectedDate.value}`)
  renderChart()
}

// Diagramme dynamique
function renderChart() {
  const ctx = document.getElementById('secteursChart')?.getContext('2d')
  if (!ctx) return

  if (chartInstance) chartInstance.destroy()

  chartInstance = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: summaryData.value.map(s => s.name),
      datasets: [
        { 
          label: 'Frères', 
          data: summaryData.value.map(s => s.totalFrere), 
          backgroundColor: '#0d6efd',
          borderColor: '#0a58ca',
          borderWidth: 1
        },
        { 
          label: 'Soeurs', 
          data: summaryData.value.map(s => s.totalSoeur), 
          backgroundColor: '#d63384',
          borderColor: '#a61e4d',
          borderWidth: 1
        },
        { 
          label: 'Montant FC', 
          data: summaryData.value.map(s => Math.round(s.totalFC / 1000)), 
          backgroundColor: '#198754',
          borderColor: '#146c43',
          borderWidth: 1,
          yAxisID: 'y1'
        },
        { 
          label: 'Montant $', 
          data: summaryData.value.map(s => s.totalUSD), 
          backgroundColor: '#ffc107',
          borderColor: '#d39e00',
          borderWidth: 1,
          yAxisID: 'y1'
        }
      ]
    },
    options: { 
      responsive: true, 
      plugins: { 
        legend: { 
          position: 'top',
          labels: {
            usePointStyle: true,
            padding: 15
          }
        },
        title: {
          display: true,
          text: `Répartition par secteur - ${selectedDate.value}`
        }
      },
      scales: {
        y: {
          type: 'linear',
          display: true,
          position: 'left',
          title: {
            display: true,
            text: 'Effectifs'
          }
        },
        y1: {
          type: 'linear',
          display: true,
          position: 'right',
          title: {
            display: true,
            text: 'Montants'
          },
          grid: {
            drawOnChartArea: false,
          },
        }
      }
    }
  })
}

onMounted(() => {
  fetchCampName()
  fetchSectors()
  fetchDates()
  // setInterval(fetchDates, 10000)
})

watch(() => route.params.id_campBiblique, (newId) => {
  campBibliqueId.value = newId || ''
  fetchCampName()
  fetchDates()
})

watch(selectedDate, () => calculateSummary())

const pageTitle = computed(() => campName.value)

// Totaux pour l'affichage
const totalEffectif = computed(() => summaryData.value.reduce((a,s) => a + s.totalEffectif, 0))
const totalFrere = computed(() => summaryData.value.reduce((a,s) => a + s.totalFrere, 0))
const totalSoeur = computed(() => summaryData.value.reduce((a,s) => a + s.totalSoeur, 0))
const totalFC = computed(() => summaryData.value.reduce((a,s) => a + s.totalFC, 0))
const totalUSD = computed(() => summaryData.value.reduce((a,s) => a + s.totalUSD, 0))
</script>

<template>
  <div class="be-content be-no-padding">
    <div class="main-content container-fluid">
      <div class="col-12 mt-4" style="margin: 0 auto;">
        <div class="card shadow-sm border-light rounded-3">
          <div class="card-header d-flex justify-content-between align-items-center">
            <h3 class="m-0">{{ pageTitle }}</h3>
            <div class="d-flex align-items-center gap-3">
              <!-- <div class="text-end">
                <small class="text-muted d-block">Date sélectionnée</small>
                <strong>{{ selectedDate ? new Date(selectedDate).toLocaleDateString('fr-FR') : 'Aucune' }}</strong>
              </div> -->
              <div>
                <label class="m-2 fw-semibold">Filtrer la date :</label>
                <select v-model="selectedDate" class="form-select form-select-sm">
                  <option v-for="date in availableDates" :key="date" :value="date">
                    {{ new Date(date).toLocaleDateString('fr-FR') }}
                  </option>
                </select>
              </div>
            </div>
          </div>

          <div class="tab-container">
            <ul class="nav nav-tabs mt-3 px-3" role="tablist">
              <li class="nav-item">
                <a class="nav-link" :class="{ active: selectedSecteur === '' }" href="#" @click.prevent="selectSecteur('')">
                  Résumé
                </a>
              </li>
              <li v-for="secteur in allSectors" :key="secteur.id" class="nav-item">
                <a class="nav-link" :class="{ active: selectedSecteur === secteur.id }" href="#" @click.prevent="selectSecteur(secteur.id)">
                  {{ secteur.name }}
                </a>
              </li>
            </ul>

            <div class="tab-content" style="padding: 1.5rem;">
              <div v-if="selectedSecteur === ''">
                <div v-if="loading" class="text-center my-3">
                  <span class="spinner-border"></span> Chargement des données...
                </div>

                <div v-else>
                  <!-- Cartes de résumé -->
                  <div class="row mb-4">
                    <div class="col-md-3 col-6">
                      <div class="card bg-primary text-white">
                        <div class="card-body text-center">
                          <h4 class="card-title">{{ totalEffectif }}</h4>
                          <p class="card-text">Total Effectif</p>
                        </div>
                      </div>
                    </div>
                    <div class="col-md-3 col-6">
                      <div class="card bg-info text-white">
                        <div class="card-body text-center">
                          <h4 class="card-title">{{ totalFrere }}</h4>
                          <p class="card-text">Frères</p>
                        </div>
                      </div>
                    </div>
                    <div class="col-md-3 col-6">
                      <div class="card bg-pink text-white">
                        <div class="card-body text-center">
                          <h4 class="card-title">{{ totalSoeur }}</h4>
                          <p class="card-text">Soeurs</p>
                        </div>
                      </div>
                    </div>
                    <div class="col-md-3 col-6">
                      <div class="card bg-success text-white">
                        <div class="card-body text-center">
                          <h4 class="card-title">{{ totalUSD.toLocaleString('fr-FR') }}$</h4>
                          <p class="card-text">{{ totalFC.toLocaleString('fr-FR') }} FC</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div class="table-container">
                    <table class="table table-hover align-middle">
                      <thead class="sticky-header">
                        <tr>
                          <th>Secteur</th>
                          <th>Effectif Total</th>
                          <th>Frères</th>
                          <th>Soeurs</th>
                          <th>Montant</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr v-for="s in summaryData" :key="s.id">
                          <td><strong>{{ s.name }}</strong></td>
                          <td><span class="badge bg-primary">{{ s.totalEffectif }}</span></td>
                          <td><span class="badge bg-info">{{ s.totalFrere }}</span></td>
                          <td><span class="badge bg-pink">{{ s.totalSoeur }}</span></td>
                          <td>
                            <span class="badge bg-success">{{ s.totalFC.toLocaleString('fr-FR') }} FC</span>
                            <span class="badge bg-warning text-dark mt-1">{{ s.totalUSD.toLocaleString('fr-FR') }} $</span>
                          </td>
                        </tr>
                        <tr v-if="!summaryData.length">
                          <td colspan="6" class="text-center text-muted">Aucune donnée trouvée pour cette date</td>
                        </tr>
                      </tbody>
                      <tfoot class="table-light fw-semibold">
                        <tr>
                          <td>Total</td>
                          <td>{{ totalEffectif }}</td>
                          <td>{{ totalFrere }}</td>
                          <td>{{ totalSoeur }}</td>
                          <td>
                            {{ totalFC.toLocaleString('fr-FR') }} FC + 
                            {{ totalUSD.toLocaleString('fr-FR') }} $
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>

                  <div class="mt-4">
                    <canvas id="secteursChart" width="400" height="200"></canvas>
                  </div>
                </div>
              </div>

              <div v-else>
                <RapportDay :key="rapportKey" :id="selectedSecteur" :date="selectedDate" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.card-header { padding: 0.75rem 1rem; }
.form-select { min-width: 130px; }
.nav-tabs .nav-link { font-weight: 500; color: #555; }
.nav-tabs .nav-link.active { color: #0d6efd; border-color: #0d6efd #0d6efd #fff; }
.table-hover tbody tr:hover { background-color: #f1f1f1; }
.table-dark thead tr:hover { background-color: inherit !important; } /* supprime hover sur thead */
.badge.bg-pink { background-color: #d63384; }
.badge { margin: 0.1rem; }
.table-container { overflow-y: auto; border-radius: 0.5rem; border: 1px solid #dee2e6; max-height: 400px; }
.sticky-header { position: sticky; top: 0; background: #edeff0; z-index: 2; }

/* Styles pour les cartes de résumé */
.card .card-body { padding: 1rem; }
.card .card-title { font-size: 1.5rem; margin-bottom: 0.5rem; }
.card .card-text { font-size: 0.875rem; opacity: 0.9; }

.bg-pink {
  background-color: #d63384 !important;
}

/* Responsive */
@media (max-width: 768px) {
  .card-header {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }
  
  .table-container {
    max-height: 300px;
  }
}
</style>