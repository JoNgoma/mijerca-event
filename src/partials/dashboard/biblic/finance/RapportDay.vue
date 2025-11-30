<script setup>
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import axios from 'axios'
import { useToast } from 'vue-toastification'

const toast = useToast()

// Props venant du parent
const props = defineProps({
  id: { type: [String, Number], required: true },  // selectedSecteur
  date: { type: String, required: true },          // selectedDate
})

const loading = ref(false)
const selectedDoyenne = ref('Tous')
const selectedParoisseId = ref(null)

const allSectors = ref([])
const allDoyennes = ref([])
const allParoisses = ref([])
const allPeople = ref([])
const allParticipators = ref([])
const allMontants = ref([])

const viewParoisses = ref([])

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

function extractIdFromUrl(url) {
  if (!url) return null
  const parts = String(url).split('/').filter(Boolean)
  return parts.pop()
}

const API = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api'

// === Fetch Data AVEC PAGINATION ===
async function fetchData() {
  try {
    loading.value = true
    console.log(`🔄 Chargement des données pour le secteur ${props.id}...`)
    
    const [
      doyennesRes,
      paroissesRes,
      peopleRes,
      participatorsRes,
      sectorsRes,
      montantsRes,
    ] = await Promise.all([
      fetchAllPages(`${API}/doyennes`),
      fetchAllPages(`${API}/paroisses`),
      fetchAllPages(`${API}/people`),
      fetchAllPages(`${API}/participators`),
      fetchAllPages(`${API}/sectors`),
      fetchAllPages(`${API}/montants`),
    ])

    allDoyennes.value = doyennesRes
    allParoisses.value = paroissesRes
    allPeople.value = peopleRes
    allParticipators.value = participatorsRes
    allSectors.value = sectorsRes
    allMontants.value = montantsRes

    console.log(`📈 Données chargées: ${allParoisses.value.length} paroisses, ${allPeople.value.length} personnes, ${allParticipators.value.length} participants`)

    aggregateParoisses()
  } catch (err) {
    console.error('Erreur fetchData:', err)
    toast.error('Erreur lors de la récupération des données')
  } finally {
    loading.value = false
  }
}

function aggregateParoisses() {
  const agg = {}
  let totalParticipants = 0

  allParticipators.value.forEach(part => {
    // filtrer par date sélectionnée
    const partDate = part.createdAt?.split('T')[0]
    if (partDate !== props.date) return

    const person = allPeople.value.find(
      pe => pe['@id'] === part.person || extractIdFromUrl(pe['@id']) === extractIdFromUrl(part.person)
    )
    if (!person) return

    const paro = allParoisses.value.find(
      pa => pa['@id'] === person.paroisse || extractIdFromUrl(pa['@id']) === extractIdFromUrl(person.paroisse)
    )
    if (!paro) return

    const sectorId = extractIdFromUrl(paro.sector)
    if (String(sectorId) !== String(props.id)) return

    const doy = allDoyennes.value.find(
      d => d['@id'] === paro.doyenne || extractIdFromUrl(d['@id']) === extractIdFromUrl(paro.doyenne)
    )
    const paroId = paro['@id'] || `/api/paroisses/${paro.id}`
    if (!agg[paroId]) {
      agg[paroId] = {
        id: paroId,
        nom: paro.name || '—',
        doyenne: doy ? doy['@id'] : 'Non défini',
        doyenneName: doy?.name || 'Non défini',
        effectif: 0,
        montantUSD: 0,
        montantFC: 0,
      }
    }

    const montantRecord = allMontants.value.find(m =>
      m.participator === part['@id'] ||
      extractIdFromUrl(m.participator) === extractIdFromUrl(part['@id'])
    )

    const devise = (montantRecord?.devise || 'FC').toUpperCase()
    const montant = Number(montantRecord?.frais || 0)

    agg[paroId].effectif += 1
    totalParticipants++
    
    if (devise === 'USD' || devise === '$') agg[paroId].montantUSD += montant
    else agg[paroId].montantFC += montant
  })

  viewParoisses.value = Object.values(agg)
  console.log(`🏛️ ${viewParoisses.value.length} paroisses agrégées pour le secteur ${props.id} (${totalParticipants} participants)`)
}

// recalculer si la date change
watch(
  () => props.date,
  () => {
    console.log(`📅 Changement de date: ${props.date}`)
    aggregateParoisses()
    selectedParoisseId.value = null
  }
)

const doyennesBySector = computed(() => {
  const doyenneIds = new Set(
    allParoisses.value
      .filter(p => p.sector && extractIdFromUrl(p.sector) === String(props.id))
      .map(p => extractIdFromUrl(p.doyenne))
      .filter(Boolean)
  )
  const doyennes = allDoyennes.value.filter(d => doyenneIds.has(extractIdFromUrl(d['@id'])))
  console.log(`🎯 ${doyennes.length} doyennés trouvés pour le secteur ${props.id}`)
  return doyennes
})

const filteredParoisses = computed(() => {
  let result = viewParoisses.value.filter(p => 
    selectedDoyenne.value === 'Tous' || p.doyenne === selectedDoyenne.value
  )
  console.log(`🔍 ${result.length} paroisses filtrées (doyenne: ${selectedDoyenne.value})`)
  return result
})

const countDoyennes = computed(() => new Set(filteredParoisses.value.map(p => p.doyenne)).size)
const countParoisses = computed(() => filteredParoisses.value.length)

const totalEffectifFiltre = computed(() => filteredParoisses.value.reduce((a, p) => a + (p.effectif || 0), 0))
const totalMontantFiltre = computed(() => {
  const usd = filteredParoisses.value.reduce((a, p) => a + (p.montantUSD || 0), 0)
  const fc = filteredParoisses.value.reduce((a, p) => a + (p.montantFC || 0), 0)
  return `${usd.toLocaleString('fr-FR')} $ + ${fc.toLocaleString('fr-FR')} FC`
})

const showJeunesModal = ref(false)
const currentParoisse = ref(null)

async function selectParoisse(paroId) {
  selectedParoisseId.value = paroId
  currentParoisse.value = viewParoisses.value.find(p => p.id === paroId)
  console.log(`📍 Paroisse sélectionnée: ${currentParoisse.value?.nom}`)
  
  if (window.innerWidth < 768) {
    await nextTick()
    showJeunesModal.value = true
  }
}

const jeunesParParoisse = computed(() => {
  const result = {}
  if (!selectedParoisseId.value) return result

  allParticipators.value.forEach(part => {
    const person = allPeople.value.find(
      pe => pe['@id'] === part.person || extractIdFromUrl(pe['@id']) === extractIdFromUrl(part.person)
    )
    if (!person) return

    const personParoId = person.paroisse
    const matchParo =
      personParoId === selectedParoisseId.value ||
      extractIdFromUrl(personParoId) === extractIdFromUrl(selectedParoisseId.value)
    if (!matchParo) return

    const partDate = part.createdAt?.split('T')[0]
    if (partDate !== props.date) return

    const montantRecord = allMontants.value.find(m =>
      m.participator === part['@id'] ||
      extractIdFromUrl(m.participator) === extractIdFromUrl(part['@id'])
    )
    const devise = (montantRecord?.devise || 'FC').toUpperCase()
    const frais = Number(montantRecord?.frais || 0)

    const jeune = {
      nom: `${person.gender} ${person.fullName}`.trim() || '—',
      dortoir: part.dortoir || '',
      carrefour: part.carrefour || '',
      arrivee: new Date(part.createdAt).toLocaleDateString('fr-FR'),
      status: person.isDicoces ? 'Noyau diocésain' : person.isDecanal ? 'Noyau décanal' : person.isNoyau ? 'Noyau paroissial' : 'Jeune',
      montantValue: frais,
      montantDevise: devise === '$' ? '$' : 'FC',
      montantFormatted: `${frais.toLocaleString('fr-FR')} ${devise === '$' ? '$' : 'FC'}`
    }

    if (!result[selectedParoisseId.value]) result[selectedParoisseId.value] = []
    result[selectedParoisseId.value].push(jeune)
  })

  console.log(`👥 ${result[selectedParoisseId.value]?.length || 0} jeunes trouvés pour la paroisse sélectionnée`)
  return result
})

// Rafraîchissement manuel
async function refreshData() {
  await fetchData()
  toast.success('Données actualisées')
}

onMounted(() => {
  console.log(`🚀 Composant RapportDay monté pour le secteur ${props.id}`)
  fetchData()
})

// Watch le secteur pour recharger les données si nécessaire
watch(
  () => props.id,
  (newId) => {
    console.log(`🔄 Changement de secteur: ${newId}`)
    fetchData()
  }
)
</script>

<template>
  <div class="tab-pane" :id="id" role="tabpanel">
    <div class="d-flex justify-content-between align-items-center mb-3">
      <h6 class="m-0">Secteur {{ allSectors.find(s => String(s.id) === String(props.id))?.name || '...' }}</h6>
      <button @click="refreshData" class="btn btn-sm btn-outline-primary" :disabled="loading">
        <span v-if="loading" class="spinner-border spinner-border-sm me-1"></span>
        {{ loading ? 'Actualisation...' : 'Actualiser' }}
      </button>
    </div>

    <div v-if="loading" class="text-center my-5">
      <span class="spinner-border"></span> 
      <div class="mt-2">Chargement des données...</div>
    </div>

    <div v-else class="row g-3">
      <!-- Paroisses agrégées -->
      <div class="col-12 col-lg-6">
        <div class="card card-table shadow-sm">
          <div class="card-header bg-light fw-semibold d-flex justify-content-between align-items-center mx-2">
            <span>Rapport Journalier - {{ props.date }}</span>
            <div class="d-flex align-items-center gap-2">
              <small class="text-muted">{{ filteredParoisses.length }} paroisses</small>
              <select class="form-select form-select-sm" v-model="selectedDoyenne">
                <option value="Tous">Tous les doyennés</option>
                <option v-for="d in doyennesBySector" :key="d['@id']" :value="d['@id']">
                  {{ d.name }}
                </option>
              </select>
            </div>
          </div>

          <div class="table-container">
            <table class="table table-hover align-middle">
              <thead class="sticky-header">
                <tr>
                  <th>Doyenné</th>
                  <th>Paroisse</th>
                  <th>Effectif</th>
                  <th>Montant</th>
                </tr>
              </thead>

              <tbody>
                <tr
                  v-for="p in filteredParoisses"
                  :key="p.id"
                  @click="selectParoisse(p.id)"
                  :class="['selectable-row', { active: p.id === selectedParoisseId }]"
                >
                  <td>{{ p.doyenneName }}</td>
                  <td>{{ p.nom }}</td>
                  <td>
                    <span class="badge bg-primary rounded-pill">{{ p.effectif || 0 }}</span>
                  </td>
                  <td>
                    <div class="d-flex flex-column gap-1">
                      <span class="badge bg-success" v-if="p.montantUSD > 0">
                        {{ p.montantUSD.toLocaleString('fr-FR') }} $
                      </span>
                      <span class="badge bg-warning text-dark" v-if="p.montantFC > 0">
                        {{ p.montantFC.toLocaleString('fr-FR') }} FC
                      </span>
                      <span class="text-muted small" v-if="p.montantUSD === 0 && p.montantFC === 0">
                        Aucun montant
                      </span>
                    </div>
                  </td>
                </tr>

                <tr v-if="!filteredParoisses.length">
                  <td colspan="4" class="text-center text-muted py-4">
                    <i class="fas fa-inbox me-2"></i>
                    Aucune activité trouvée pour cette date
                  </td>
                </tr>
              </tbody>

              <tfoot class="table-light fw-semibold">
                <tr>
                  <td>{{ countDoyennes }} Doyenné{{ countDoyennes > 1 ? 's' : '' }}</td>
                  <td>{{ countParoisses }} Paroisse{{ countParoisses > 1 ? 's' : '' }}</td>
                  <td>
                    <span class="badge bg-primary rounded-pill">{{ totalEffectifFiltre }}</span>
                  </td>
                  <td>{{ totalMontantFiltre }}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>

      <!-- Jeunes -->
      <div class="col-12 col-lg-6 d-none d-lg-block">
        <div class="card card-table shadow-sm">
          <div class="card-header bg-light fw-semibold mx-2 d-flex justify-content-between align-items-center">
            <span v-if="selectedParoisseId" class="text-primary"> 
              {{ viewParoisses.find(x => x.id === selectedParoisseId)?.nom }}
            </span>
            <small v-if="selectedParoisseId" class="text-muted">
              {{ (jeunesParParoisse[selectedParoisseId] || []).length }} jeune(s)
            </small>
            <span v-else class="text-muted">
              <i class="fas fa-mouse-pointer me-2"></i>Sélectionnez une paroisse
            </span>
          </div>

          <div class="table-container">
            <table class="table table-hover align-middle">
              <thead class="table-light">
                <tr>
                  <th>Noms</th>
                  <th>Montant</th>
                  <th>Dortoir</th>
                  <th>Carrefour</th>
                  <th>Status</th>
                </tr>
              </thead>

              <tbody>
                <tr v-if="!selectedParoisseId">
                  <td colspan="5" class="text-center text-muted py-4">
                    <i class="fas fa-hand-pointer me-2"></i>
                    Cliquez sur une paroisse pour voir les détails
                  </td>
                </tr>

                <tr v-else v-for="j in jeunesParParoisse[selectedParoisseId] || []" :key="j.nom + j.arrivee">
                  <td class="fw-medium">{{ j.nom }}</td>
                  <td>
                    <span class="badge" :class="j.montantDevise === '$' ? 'bg-success' : 'bg-warning text-dark'">
                      {{ j.montantFormatted }}
                    </span>
                  </td>
                  <td>
                    <span class="badge bg-info text-dark" v-if="j.dortoir">{{ j.dortoir }}</span>
                    <span class="text-muted small" v-else>—</span>
                  </td>
                  <td>
                    <span class="badge bg-secondary" v-if="j.carrefour">{{ j.carrefour }}</span>
                    <span class="text-muted small" v-else>—</span>
                  </td>
                  <td class="align-middle">
                    <span
                      class="badge"
                      :class="{
                        'bg-success text-white': j.status === 'Jeune',
                        'bg-primary text-white': j.status === 'Noyau paroissial',
                        'bg-warning text-white': j.status === 'Noyau décanal',
                        'bg-danger text-white': j.status === 'Noyau diocésain'
                      }"
                    >
                      {{ j.status }}
                    </span>
                  </td>
                </tr>

                <tr v-if="selectedParoisseId && !(jeunesParParoisse[selectedParoisseId] || []).length">
                  <td colspan="5" class="text-center text-muted py-4">
                    <i class="fas fa-users me-2"></i>
                    Aucun jeune pour cette paroisse
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal jeunes pour mobile -->
    <div v-if="showJeunesModal" class="modal show" @click.self="showJeunesModal = false">
      <div class="modal-dialog modal-dialog-scrollable">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">{{ currentParoisse?.nom }}</h5>
            <button type="button" class="btn-close" @click="showJeunesModal = false"></button>
          </div>
          <div class="modal-body">
            <div class="d-flex justify-content-between align-items-center mb-3">
              <small class="text-muted">{{ (jeunesParParoisse[currentParoisse?.id] || []).length }} jeune(s)</small>
            </div>
            <table class="table table-hover">
              <thead>
                <tr>
                  <th>Noms</th>
                  <th>Montant</th>
                  <th>Dortoir</th>
                  <th>Carrefour</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="j in jeunesParParoisse[currentParoisse?.id] || []" :key="j.nom + j.arrivee">
                  <td class="fw-medium">{{ j.nom }}</td>
                  <td>
                    <span class="badge" :class="j.montantDevise === '$' ? 'bg-success' : 'bg-warning text-dark'">
                      {{ j.montantFormatted }}
                    </span>
                  </td>
                  <td>
                    <span class="badge bg-info text-dark" v-if="j.dortoir">{{ j.dortoir }}</span>
                    <span class="text-muted small" v-else>—</span>
                  </td>
                  <td>
                    <span class="badge bg-secondary" v-if="j.carrefour">{{ j.carrefour }}</span>
                    <span class="text-muted small" v-else>—</span>
                  </td>
                  <td>
                    <span class="badge"
                          :class="{
                            'bg-success text-white': j.status === 'Jeune',
                            'bg-primary text-white': j.status === 'Noyau paroissial',
                            'bg-warning text-white': j.status === 'Noyau décanal',
                            'bg-danger text-white': j.status === 'Noyau diocésain'
                          }">{{ j.status }}</span>
                  </td>
                </tr>
                <tr v-if="!(jeunesParParoisse[currentParoisse?.id] || []).length">
                  <td colspan="5" class="text-center text-muted py-3">
                    <i class="fas fa-users me-2"></i>
                    Aucun jeune pour cette paroisse
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.table-container {
  max-height: 34rem;
  overflow-y: auto;
}
.selectable-row { 
  cursor: pointer; 
  transition: all 0.2s ease;
}
.selectable-row:hover { 
  background-color: #f8f9fa; 
  transform: translateY(-1px);
}
.selectable-row.active { 
  background-color: #e6f0ff; 
  font-weight: 600;
  border-left: 3px solid #0d6efd;
}
.modal.show { 
  display: block; 
  background-color: rgba(0,0,0,0.5); 
  position: fixed; 
  top: 0; 
  left: 0; 
  width: 100%; 
  height: 100%; 
  z-index: 1050; 
}
.modal-dialog { 
  margin: 1.75rem auto; 
  max-width: 95%; 
}
.modal-content { 
  max-height: 90vh; 
  overflow-y: auto; 
}
.table-container { 
  overflow-y: auto; 
  border-radius: 0.5rem; 
  border: 1px solid #dee2e6; 
  margin: 0 1rem; 
}
.sticky-header { 
  position: sticky; 
  top: 0; 
  background: #edeff0; 
  z-index: 2; 
}

.text-muted {
  font-size: 0.875rem;
}

.badge.rounded-pill {
  border-radius: 50rem !important;
}

/* Amélioration responsive */
@media (max-width: 768px) {
  .table-container {
    max-height: 25rem;
  }
  
  .card-header {
    flex-direction: column;
    gap: 0.5rem;
    align-items: start;
  }
}
</style>