<script setup>
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import axios from 'axios'
import { useToast } from 'vue-toastification'

const toast = useToast()
const props = defineProps({
  id: { type: [String, Number], required: true },
  date: { type: String, required: true },
})

const loading = ref(false)
const selectedDoyenne = ref('Tous')
const selectedParoisseId = ref(null)
const showJeunesModal = ref(false)
const showEditModal = ref(false)
const currentParoisse = ref(null)
const editingJeune = ref(null)
const editCarrefour = ref('')
const editDortoir = ref('')
const saving = ref(false)

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
    
    // console.log(`📊 ${baseUrl} - ${allItems.length} enregistrements chargés`);
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
    // console.log(`🔄 Chargement des données d'hébergement pour le secteur ${props.id}...`)

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

    // console.log(`🏨 Données hébergement chargées: ${allParoisses.value.length} paroisses, ${allPeople.value.length} personnes, ${allParticipators.value.length} participants`)

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
  // console.log(`🏛️ ${viewParoisses.value.length} paroisses agrégées pour l'hébergement (${totalParticipants} participants)`)
}

const doyennesBySector = computed(() => {
  const doyenneIds = new Set(
    allParoisses.value
      .filter(p => p.sector && extractIdFromUrl(p.sector) === String(props.id))
      .map(p => extractIdFromUrl(p.doyenne))
      .filter(Boolean)
  )
  const doyennes = allDoyennes.value.filter(d => doyenneIds.has(extractIdFromUrl(d['@id'])))
  // console.log(`🎯 ${doyennes.length} doyennés trouvés pour l'hébergement secteur ${props.id}`)
  return doyennes
})

const filteredParoisses = computed(() => {
  if (selectedDoyenne.value === 'Tous') return viewParoisses.value
  const result = viewParoisses.value.filter(
    p => p.doyenne === selectedDoyenne.value
  )
  // console.log(`🔍 ${result.length} paroisses filtrées pour le doyenné sélectionné`)
  return result
})

const countDoyennes = computed(() => new Set(filteredParoisses.value.map(p => p.doyenne)).size)
const countParoisses = computed(() => filteredParoisses.value.length)

const totalEffectifFiltre = computed(() => filteredParoisses.value.reduce((a, p) => a + (p.effectif || 0), 0))

async function selectParoisse(paroId) {
  selectedParoisseId.value = paroId
  currentParoisse.value = viewParoisses.value.find(p => p.id === paroId)
  // console.log(`📍 Paroisse sélectionnée pour hébergement: ${currentParoisse.value?.nom}`)
  
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
    const match =
      personParoId === selectedParoisseId.value ||
      extractIdFromUrl(personParoId) === extractIdFromUrl(selectedParoisseId.value)
    if (!match) return

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
      arrivee: new Date(part.createdAt || props.date).toLocaleDateString('fr-FR'),
      status: person.isDicoces ? 'Noyau diocésain' : person.isDecanal ? 'Noyau décanal' : person.isNoyau ? 'Noyau paroissial' : 'Jeune',
      montantValue: frais,
      montantDevise: devise === '$' ? '$' : 'FC',
      montantFormatted: `${frais.toLocaleString('fr-FR')} ${devise === '$' ? '$' : 'FC'}`,
      participatorId: part['@id'],
      personId: person['@id']
    }

    if (!result[selectedParoisseId.value]) result[selectedParoisseId.value] = []
    result[selectedParoisseId.value].push(jeune)
  })

  // console.log(`👥 ${result[selectedParoisseId.value]?.length || 0} jeunes trouvés pour l'hébergement`)
  return result
})

// Fonction pour ouvrir le modal d'édition
function openEditModal(jeune, event) {
  if (event) event.stopPropagation()
  editingJeune.value = jeune
  editCarrefour.value = jeune.carrefour || ''
  editDortoir.value = jeune.dortoir || ''
  showEditModal.value = true
}

// Fonction pour sauvegarder les modifications
async function saveJeuneDetails() {
  if (!editingJeune.value) return

  try {
    saving.value = true
    
    const participatorId = extractIdFromUrl(editingJeune.value.participatorId)
    
    // Construire l'objet de mise à jour
    const updateData = {}
    if (editCarrefour.value !== editingJeune.value.carrefour) {
      updateData.carrefour = editCarrefour.value
    }
    if (editDortoir.value !== editingJeune.value.dortoir) {
      updateData.dortoir = editDortoir.value
    }
    
    // Si rien n'a changé, fermer le modal
    if (Object.keys(updateData).length === 0) {
      showEditModal.value = false
      return
    }

    // Envoyer la requête PATCH avec application/merge-patch+json
    await axios.patch(
      `${API}/participators/${participatorId}`,
      updateData,
      {
        headers: {
          'Content-Type': 'application/merge-patch+json',
        }
      }
    )

    // Mettre à jour localement les données
    const participatorIndex = allParticipators.value.findIndex(p => 
      extractIdFromUrl(p['@id']) === participatorId
    )
    
    if (participatorIndex !== -1) {
      // Mettre à jour le participator local
      allParticipators.value[participatorIndex] = {
        ...allParticipators.value[participatorIndex],
        ...updateData
      }
      
      // Mettre à jour le jeune dans le computed
      editingJeune.value.carrefour = editCarrefour.value
      editingJeune.value.dortoir = editDortoir.value
    }

    toast.success('Carrefour et dortoir mis à jour avec succès')
    showEditModal.value = false
  } catch (error) {
    console.error('Erreur lors de la mise à jour:', error)
    toast.error('Erreur lors de la mise à jour')
  } finally {
    saving.value = false
  }
}

// Fonction de rafraîchissement
async function refreshData() {
  await fetchData()
  toast.success('Données d\'hébergement actualisées')
}

watch(selectedDoyenne, () => {
  selectedParoisseId.value = null
  // console.log(`🔄 Filtre doyenné changé: ${selectedDoyenne.value}`)
})

onMounted(fetchData)
</script>

<template>
  <div class="tab-pane" :id="id" role="tabpanel">
    <div class="d-flex justify-content-between align-items-center mb-3">
      <h6 class="m-0">Hébergement - Secteur {{ allSectors.find(s => String(s.id) === String(props.id))?.name || props.id }}</h6>
      <button @click="refreshData" class="btn btn-sm btn-outline-primary" :disabled="loading">
        <span v-if="loading" class="spinner-border spinner-border-sm me-1"></span>
        {{ loading ? 'Actualisation...' : 'Actualiser' }}
      </button>
    </div>

    <div v-if="loading" class="text-center my-5">
      <span class="spinner-border"></span> 
      <div class="mt-2">Chargement des données d'hébergement...</div>
    </div>

    <div v-else class="row g-3">
      <!-- Paroisses agrégées -->
      <div class="col-12 col-lg-6">
        <div class="card card-table shadow-sm">
          <div class="card-header bg-light fw-semibold d-flex justify-content-between align-items-center mx-2">
            <span>Hébergement (Affectation)</span>
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
            <table class="table table-striped table-borderless align-middle">
              <thead class="table-light sticky-header">
                <tr>
                  <th>Doyenné</th>
                  <th>Paroisse</th>
                  <th class="text-center">Effectif</th>
                </tr>
              </thead>

              <tbody>
                <tr
                  v-for="p in filteredParoisses"
                  :key="p.id"
                  @click="selectParoisse(p.id)"
                  :class="['selectable-row', { active: p.id === selectedParoisseId }]"
                >
                  <td class="fw-medium">{{ p.doyenneName }}</td>
                  <td class="fw-semibold">{{ p.nom }}</td>
                  <td class="text-center">
                    <span class="badge bg-primary rounded-pill">{{ p.effectif || 0 }}</span>
                  </td>
                </tr>

                <tr v-if="!filteredParoisses.length">
                  <td colspan="4" class="text-center text-muted py-4">
                    <i class="fas fa-bed me-2"></i>
                    Aucune donnée d'hébergement trouvée
                  </td>
                </tr>
              </tbody>

              <tfoot class="table-light fw-semibold">
                <tr>
                  <td>{{ countDoyennes }} Doyenné{{ countDoyennes > 1 ? 's' : '' }}</td>
                  <td>{{ countParoisses }} Paroisse{{ countParoisses > 1 ? 's' : '' }}</td>
                  <td class="text-center">
                    <span class="badge bg-primary rounded-pill">{{ totalEffectifFiltre }}</span>
                  </td>
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
                  <th class="text-center">Dortoir</th>
                  <th class="text-center">Carrefour</th>
                  <th class="text-center">Status</th>
                  <th class="text-center">Action</th>
                </tr>
              </thead>

              <tbody>
                <tr v-if="!selectedParoisseId">
                  <td colspan="5" class="text-center text-muted py-4">
                    <i class="fas fa-hand-pointer me-2"></i>
                    Cliquez sur une paroisse pour voir les affectations
                  </td>
                </tr>

                <tr v-else v-for="j in jeunesParParoisse[selectedParoisseId] || []" :key="j.nom + j.arrivee">
                  <td class="fw-medium">{{ j.nom }}</td>
                  <td class="text-center">
                    <span v-if="j.dortoir" class="badge bg-info text-dark">{{ j.dortoir }}</span>
                    <span v-else class="text-muted small">—</span>
                  </td>
                  <td class="text-center">
                    <span v-if="j.carrefour" class="badge bg-secondary">{{ j.carrefour }}</span>
                    <span v-else class="text-muted small">—</span>
                  </td>
                  <td class="text-center">
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
                  <td class="text-center">
                    <button 
                      @click="openEditModal(j, $event)"
                      class="btn btn-sm btn-outline-primary"
                      title="Modifier carrefour/dortoir"
                    >
                      <i class="fas fa-edit"></i>
                    </button>
                  </td>
                </tr>

                <tr v-if="selectedParoisseId && !(jeunesParParoisse[selectedParoisseId] || []).length">
                  <td colspan="5" class="text-center text-muted py-4">
                    <i class="fas fa-users me-2"></i>
                    Aucun jeune affecté pour cette paroisse
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
                  <th class="text-center">Dortoir</th>
                  <th class="text-center">Carrefour</th>
                  <th class="text-center">Status</th>
                  <th class="text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="j in jeunesParParoisse[currentParoisse?.id] || []" :key="j.nom + j.arrivee">
                  <td class="fw-medium">{{ j.nom }}</td>
                  <td class="text-center">
                    <span v-if="j.dortoir" class="badge bg-info text-dark">{{ j.dortoir }}</span>
                    <span v-else class="text-muted small">—</span>
                  </td>
                  <td class="text-center">
                    <span v-if="j.carrefour" class="badge bg-secondary">{{ j.carrefour }}</span>
                    <span v-else class="text-muted small">—</span>
                  </td>
                  <td class="text-center">
                    <span class="badge"
                          :class="{
                            'bg-success text-white': j.status === 'Jeune',
                            'bg-primary text-white': j.status === 'Noyau paroissial',
                            'bg-warning text-white': j.status === 'Noyau décanal',
                            'bg-danger text-white': j.status === 'Noyau diocésain'
                          }">{{ j.status }}</span>
                  </td>
                  <td class="text-center">
                    <button 
                      @click="openEditModal(j, $event)"
                      class="btn btn-sm btn-outline-primary"
                      title="Modifier carrefour/dortoir"
                    >
                      <i class="mdi mdi-edit"></i>
                    </button>
                  </td>
                </tr>
                <tr v-if="!(jeunesParParoisse[currentParoisse?.id] || []).length">
                  <td colspan="5" class="text-center text-muted py-3">
                    <i class="mdi mdi-mood-bad mr-1"></i>
                    Aucun jeune affecté pour cette paroisse
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal d'édition du carrefour et dortoir -->
    <div v-if="showEditModal" class="modal show" @click.self="showEditModal = false">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Modifier l'affectation</h5>
            <button type="button" class="btn-close" @click="showEditModal = false"></button>
          </div>
          <div class="modal-body">
            <div v-if="editingJeune" class="mb-4">
              <h6 class="mb-2">Jeune : {{ editingJeune.nom }}</h6>
              <div class="d-flex gap-3 text-muted small">
                <span><i class="mdi mdi-calendar mr-1"></i> {{ editingJeune.arrivee }}</span>
                <span class="badge text-white ml-1" :class="{
                  'bg-success': editingJeune.status === 'Jeune',
                  'bg-primary': editingJeune.status === 'Noyau paroissial',
                  'bg-warning': editingJeune.status === 'Noyau décanal',
                  'bg-danger': editingJeune.status === 'Noyau diocésain'
                }">
                  {{ editingJeune.status }}
                </span>
              </div>
            </div>
            
            <form @submit.prevent="saveJeuneDetails">
              <div class="mb-3">
                <label for="carrefour" class="form-label">Carrefour</label>
                <input 
                  type="text" 
                  class="form-control" 
                  id="carrefour" 
                  v-model="editCarrefour"
                  placeholder="Carrefour 0 si rafiki"
                >
                <div class="form-text">Le carrefour d'affectation du jeune</div>
              </div>
              
              <div class="mb-4">
                <label for="dortoir" class="form-label">Dortoir</label>
                <input 
                  type="text" 
                  class="form-control" 
                  id="dortoir" 
                  v-model="editDortoir"
                  placeholder="Dortoir 0 si visiteur"
                >
                <div class="form-text">Le dortoir d'affectation du jeune</div>
              </div>
              
              <div class="text-end">
                <button 
                  type="button" 
                  class="btn btn-secondary mr-2" 
                  @click="showEditModal = false"
                  :disabled="saving"
                >
                  Annuler
                </button>
                <button 
                  type="submit" 
                  class="btn btn-primary"
                  :disabled="saving"
                >
                  <span v-if="saving" class="spinner-border spinner-border-sm me-1"></span>
                  {{ saving ? 'Enregistrement...' : 'Enregistrer' }}
                </button>
              </div>
            </form>
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
  border-radius: 0.5rem;
  border: 1px solid #dee2e6;
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

.modal-dialog-scrollable {
  max-height: 90vh;
}

.modal-content {
  max-height: 90vh;
  overflow-y: auto;
}

.sticky-header {
  position: sticky;
  top: 0;
  background: #edeff0;
  z-index: 2;
}

.badge.rounded-pill {
  border-radius: 50rem !important;
  min-width: 2.5rem;
}

.btn-outline-primary {
  padding: 0.25rem 0.5rem;
  font-size: 0.875rem;
}

/* Styles pour le modal d'édition */
.modal-dialog:not(.modal-dialog-scrollable) {
  max-width: 500px;
}

/* Responsive design */
@media (max-width: 768px) {
  .table-container {
    max-height: 25rem;
  }
  
  .card-header {
    flex-direction: column;
    gap: 0.5rem;
    align-items: start;
  }
  
  .modal-dialog {
    margin: 0.5rem;
    width: calc(100% - 1rem);
  }
  
  .btn-outline-primary {
    font-size: 0.75rem;
    padding: 0.2rem 0.4rem;
  }
}

@media (max-width: 576px) {
  .modal-dialog {
    margin: 0.25rem;
    width: calc(100% - 0.5rem);
  }
}
</style>