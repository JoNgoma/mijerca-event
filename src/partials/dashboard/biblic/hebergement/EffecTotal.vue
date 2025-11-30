<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import { useToast } from 'vue-toastification'

const toast = useToast()

const loading = ref(false)

// Données principales
const allSectors = ref([])
const allDoyennes = ref([])
const allParoisses = ref([])
const allPeople = ref([])
const allParticipators = ref([])

const viewSectors = ref([])

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

// Fonction pour extraire l'ID d'une URL
function extractIdFromUrl(url) {
  if (!url) return null
  const parts = String(url).split('/').filter(Boolean)
  return parts.pop()
}

// API base
const API = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api'

// Récupération des données AVEC PAGINATION
async function fetchData() {
  try {
    loading.value = true
    console.log('🔄 Chargement des données avec pagination...')

    const [sectorsRes, doyennesRes, paroissesRes, peopleRes, participatorsRes] = await Promise.all([
      fetchAllPages(`${API}/sectors`),
      fetchAllPages(`${API}/doyennes`),
      fetchAllPages(`${API}/paroisses`),
      fetchAllPages(`${API}/people`),
      fetchAllPages(`${API}/participators`),
    ])

    allSectors.value = sectorsRes
    allDoyennes.value = doyennesRes
    allParoisses.value = paroissesRes
    allPeople.value = peopleRes
    allParticipators.value = participatorsRes

    console.log(`📈 Données chargées: ${sectorsRes.length} secteurs, ${doyennesRes.length} doyennes, ${paroissesRes.length} paroisses, ${peopleRes.length} personnes, ${participatorsRes.length} participants`)

    aggregateSectors()
  } catch (err) {
    console.error(err)
    toast.error('Erreur lors de la récupération des données')
  } finally {
    loading.value = false
  }
}

// Agrégation par secteur
function aggregateSectors() {
  const agg = {}
  let totalParticipants = 0

  allParticipators.value.forEach(part => {
    const person = allPeople.value.find(p => 
      p['@id'] === part.person || extractIdFromUrl(p['@id']) === extractIdFromUrl(part.person)
    )
    if (!person) return

    const paro = allParoisses.value.find(pa =>
      pa['@id'] === person.paroisse || extractIdFromUrl(pa['@id']) === extractIdFromUrl(person.paroisse)
    )
    if (!paro) return

    const sector = allSectors.value.find(s =>
      s['@id'] === paro.sector || extractIdFromUrl(s['@id']) === extractIdFromUrl(paro.sector)
    )
    if (!sector) return

    const doyId = paro.doyenne || 'non-defini'
    const sectorId = sector['@id'] || `/api/sectors/${sector.id}`

    if (!agg[sectorId]) {
      agg[sectorId] = {
        id: sectorId,
        nom: sector.name || '—',
        doyennes: new Set(),
        paroisses: new Set(),
        freres: 0,
        soeurs: 0,
      }
    }

    agg[sectorId].doyennes.add(doyId)
    agg[sectorId].paroisses.add(paro['@id'] || `/api/paroisses/${paro.id}`)

    if (person.gender?.toLowerCase() === 'frère' || person.gender?.toLowerCase() === 'frere') {
      agg[sectorId].freres++
    } else if (person.gender?.toLowerCase() === 'soeur') {
      agg[sectorId].soeurs++
    }
    
    totalParticipants++
  })

  // Transformer les Set en nombre
  viewSectors.value = Object.values(agg).map(s => ({
    ...s,
    doyennes: s.doyennes.size,
    paroisses: s.paroisses.size,
    total: s.freres + s.soeurs,
  }))

  console.log(`🏛️ ${viewSectors.value.length} secteurs agrégés (${totalParticipants} participants au total)`)
}

// Fonction de rafraîchissement manuel
async function refreshData() {
  await fetchData()
  toast.success('Données actualisées avec succès')
}

onMounted(fetchData)
</script>

<template>
  <div class="tab-pane">
    <div class="d-flex justify-content-between align-items-center mb-3">
      <h5 class="m-0">Tableau de bord - Effectifs</h5>
      <button @click="refreshData" class="btn btn-sm btn-outline-primary" :disabled="loading">
        <span v-if="loading" class="spinner-border spinner-border-sm me-1"></span>
        {{ loading ? 'Actualisation...' : 'Actualiser' }}
      </button>
    </div>

    <div v-if="loading" class="text-center my-5">
      <span class="spinner-border"></span> 
      <div class="mt-2">Chargement des données...</div>
    </div>

    <div v-else>
      <!-- Cartes de résumé -->
      <div class="row mb-4">
        <div class="col-md-2 col-6 mb-3">
          <div class="card bg-primary text-white text-center">
            <div class="card-body py-3">
              <h4 class="card-title mb-0">{{ viewSectors.length }}</h4>
              <small class="card-text">Secteurs</small>
            </div>
          </div>
        </div>
        <div class="col-md-2 col-6 mb-3">
          <div class="card bg-info text-white text-center">
            <div class="card-body py-3">
              <h4 class="card-title mb-0">{{ viewSectors.reduce((a, s) => a + s.doyennes, 0) }}</h4>
              <small class="card-text">Doyennés</small>
            </div>
          </div>
        </div>
        <div class="col-md-2 col-6 mb-3">
          <div class="card bg-success text-white text-center">
            <div class="card-body py-3">
              <h4 class="card-title mb-0">{{ viewSectors.reduce((a, s) => a + s.paroisses, 0) }}</h4>
              <small class="card-text">Paroisses</small>
            </div>
          </div>
        </div>
        <div class="col-md-2 col-6 mb-3">
          <div class="card bg-warning cl-white text-center">
            <div class="card-body py-3">
              <h4 class="card-title mb-0">{{ viewSectors.reduce((a, s) => a + s.freres, 0) }}</h4>
              <small class="card-text">Frères</small>
            </div>
          </div>
        </div>
        <div class="col-md-2 col-6 mb-3">
          <div class="card bg-pink text-white text-center">
            <div class="card-body py-3">
              <h4 class="card-title mb-0">{{ viewSectors.reduce((a, s) => a + s.soeurs, 0) }}</h4>
              <small class="card-text">Soeurs</small>
            </div>
          </div>
        </div>
        <div class="col-md-2 col-6 mb-3">
          <div class="card bg-dark text-white text-center">
            <div class="card-body py-3">
              <h4 class="card-title mb-0">{{ viewSectors.reduce((a, s) => a + s.total, 0) }}</h4>
              <small class="card-text">Total</small>
            </div>
          </div>
        </div>
      </div>

      <div class="card shadow-sm">
        <div class="table-container">
          <table class="table table-striped table-borderless align-middle">
            <thead class="table-light sticky-header">
              <tr>
                <th>Secteur</th>
                <th class="text-center">Doyennes</th>
                <th class="text-center">Paroisses</th>
                <th class="text-center">Frères</th>
                <th class="text-center">Soeurs</th>
                <th class="text-center">Total</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="s in viewSectors" :key="s.id">
                <td class="fw-semibold">{{ s.nom }}</td>
                <td class="text-center">
                  <span class="badge bg-info rounded-pill cl-white">{{ s.doyennes }}</span>
                </td>
                <td class="text-center">
                  <span class="badge bg-success rounded-pill cl-white">{{ s.paroisses }}</span>
                </td>
                <td class="text-center">
                  <span class="badge bg-warning rounded-pill cl-white">{{ s.freres }}</span>
                </td>
                <td class="text-center">
                  <span class="badge bg-pink rounded-pill cl-white">{{ s.soeurs }}</span>
                </td>
                <td class="text-center">
                  <span class="badge bg-dark rounded-pill cl-white">{{ s.total }}</span>
                </td>
              </tr>
              <tr v-if="!viewSectors.length">
                <td colspan="6" class="text-center text-muted py-4">
                  <i class="fas fa-inbox me-2"></i>
                  Aucun secteur trouvé avec des participants
                </td>
              </tr>
            </tbody>
            <tfoot class="table-light fw-semibold">
              <tr>
                <td>Total général</td>
                <td class="text-center">
                  <span class="badge bg-info rounded-pill cl-white">
                    {{ viewSectors.reduce((a, s) => a + s.doyennes, 0) }}
                  </span>
                </td>
                <td class="text-center">
                  <span class="badge bg-success rounded-pill cl-white">
                    {{ viewSectors.reduce((a, s) => a + s.paroisses, 0) }}
                  </span>
                </td>
                <td class="text-center">
                  <span class="badge bg-warning rounded-pill cl-white">
                    {{ viewSectors.reduce((a, s) => a + s.freres, 0) }}
                  </span>
                </td>
                <td class="text-center">
                  <span class="badge bg-pink rounded-pill cl-white">
                    {{ viewSectors.reduce((a, s) => a + s.soeurs, 0) }}
                  </span>
                </td>
                <td class="text-center">
                  <span class="badge bg-dark rounded-pill cl-white">
                    {{ viewSectors.reduce((a, s) => a + s.total, 0) }}
                  </span>
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.cl-white{
  color : white;
}
.table-container {
  max-height: 34rem;
  overflow-y: auto;
  border-radius: 0.5rem;
  border: 1px solid #dee2e6;
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

.bg-pink {
  background-color: #d63384 !important;
}

.card .card-body {
  padding: 0.75rem;
}

.card .card-title {
  font-size: 1.5rem;
  font-weight: 600;
}

/* Responsive design */
@media (max-width: 768px) {
  .table-container {
    max-height: 25rem;
  }
  
  .card-header {
    flex-direction: column;
    gap: 0.5rem;
    text-align: center;
  }
  
  .card .card-body {
    padding: 0.5rem;
  }
  
  .card .card-title {
    font-size: 1.25rem;
  }
}
</style>