<template>
  <div>
    <div v-if="!campAvailable" class="text-center my-3 text-muted py-4">
      <i class="fas fa-campground fa-2x mb-3"></i>
      <p>Aucun camp sélectionné.</p>
    </div>

    <div v-else>
      <div v-if="loading" class="text-center my-3 py-4">
        <span class="spinner-border"></span> 
        <div class="mt-2">Chargement des déplacements...</div>
      </div>

      <div v-else class="card shadow-sm">
        <div class="card-header bg-light fw-semibold d-flex justify-content-between align-items-center">
          <span>Personnes déplacées</span>
          <div class="d-flex align-items-center gap-2">
            <button @click="refreshData" class="btn btn-sm btn-outline-primary mr-2" :disabled="loading">
              <span v-if="loading" class="spinner-border spinner-border-sm me-1"></span>
              {{ loading ? 'Actualisation...' : 'Actualiser' }}
            </button>
            <input
              v-model="searchTerm"
              type="text"
              class="form-control form-control-sm w-auto"
              placeholder="Rechercher par nom..."
            />
          </div>
        </div>

        <div class="card-body table-wrapper">
          <table class="table table-striped table-bordered align-middle">
            <thead class="table-light sticky-top">
              <tr>
                <th>Nom</th>
                <th>Paroisse</th>
                <th>Dortoir</th>
                <th>Carrefour</th>
                <th>Motif</th>
                <th>Départ</th>
                <th>Retour</th>
                <th>Statut</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="r in filteredRemovals" :key="r.id">
                <td class="fw-medium">{{ r.gender }} {{ r.personName }}</td>
                <td>{{ r.paroisse }}</td>
                <td>
                  <span v-if="r.dortoir" class="badge bg-info text-dark">Dortoir {{ r.dortoir }}</span>
                  <span v-else class="text-muted small">—</span>
                </td>
                <td>
                  <span v-if="r.carrefour" class="badge bg-secondary">Carrefour {{ r.carrefour }}</span>
                  <span v-else class="text-muted small">—</span>
                </td>
                <td>{{ r.motif }}</td>
                <td>{{ formatDateTime(r.start) }}</td>
                <td>
                  <span v-if="r.end" class="text-success">{{ formatDateTime(r.end) }}</span>
                  <button 
                    v-else
                    class="btn btn-sm btn-success" 
                    @click="confirmRetour(r)"
                    title="Confirmer le retour">
                    <i class="fas fa-check me-1"></i>Retour
                  </button>
                </td>
                <td>
                  <span class="badge" :class="r.end ? 'bg-success' : 'bg-secondary'">
                    {{ r.end ? 'Terminé' : 'En cours' }}
                  </span>
                </td>
              </tr>
              <tr v-if="!filteredRemovals.length">
                <td colspan="8" class="text-center text-muted py-4">
                  <i class="fas fa-walking me-2"></i>
                  Aucun déplacement trouvé
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Résumé -->
        <div class="card-footer bg-light">
          <div class="row text-center">
            <div class="col-md-3">
              <small class="text-muted">Total déplacements</small>
              <div class="fw-bold text-primary">{{ allRemovals.length }}</div>
            </div>
            <div class="col-md-3">
              <small class="text-muted">En cours</small>
              <div class="fw-bold text-secondary">{{ activeRemovalsCount }}</div>
            </div>
            <div class="col-md-3">
              <small class="text-muted">Déjà retournés</small>
              <div class="fw-bold text-success">{{ completedRemovalsCount }}</div>
            </div>
          </div>
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

const campAvailable = computed(() => props.camp && props.camp.id)

function extractId(url) {
  if (!url) return null
  return String(url).split('/').filter(Boolean).pop()
}

async function fetchAll() {
  if (!campAvailable.value) return
  try {
    loading.value = true
    // console.log(`🔄 Chargement des déplacements pour le camp ${props.camp.id}...`)

    const [remRes, partRes, peopleRes, parRes] = await Promise.all([
      fetchAllPages(`${API}/removals`),
      fetchAllPages(`${API}/participators`),
      fetchAllPages(`${API}/people`),
      fetchAllPages(`${API}/paroisses`)
    ])

    const campId = props.camp.id
    removals.value = remRes.filter(r => r.campBiblic?.some(cb => extractId(cb) === campId))
    participators.value = partRes.filter(p => p.campBiblic?.some(cb => extractId(cb) === campId))
    people.value = peopleRes
    paroisses.value = parRes

    // console.log(`🚶 Données déplacements chargées: ${remRes.length} déplacements, ${partRes.length} participants, ${peopleRes.length} personnes, ${parRes.length} paroisses`)

  } catch (e) {
    console.error(e)
    toast.error('Erreur lors du chargement des déplacements')
  } finally {
    loading.value = false
  }
}

// Fonction de rafraîchissement
async function refreshData() {
  await fetchAll()
  toast.success('Données des déplacements actualisées')
}

onMounted(fetchAll)

function formatDateTime(s) {
  if (!s) return '—'
  const d = new Date(s)
  return d.toLocaleString('fr-FR', { 
    day: '2-digit',
    month: '2-digit', 
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const allRemovals = computed(() => {
  const removalsList = removals.value
    .map(r => {
      const participatorUrl = Array.isArray(r.participator) ? r.participator[0] : r.participator
      const pid = extractId(participatorUrl)
      const part = participators.value.find(p => String(p.id) === String(pid)) || {}
      const personId = extractId(part.person)
      const pe = people.value.find(x => extractId(x['@id']) === personId) || {}
      let paroName = '—'
      if (pe.paroisse) {
        const parId = extractId(pe.paroisse)
        const par = paroisses.value.find(pp => extractId(pp['@id']) === parId || String(pp.id) === parId)
        if (par) paroName = par.name
      }
      return {
        id: extractId(r['@id'] || r.id),
        gender: pe.gender || '',
        personName: pe.fullName || `#${part.id}`,
        paroisse: paroName,
        dortoir: part.dortoir || '',
        carrefour: part.carrefour || '',
        motif: r.motif || 'Non spécifié',
        start: r.start,
        end: r.end || null,
        createdAt: r.start
      }
    })
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))

  // console.log(`📋 ${removalsList.length} déplacements traités`)
  return removalsList
})

// Compteurs pour les statistiques
const activeRemovalsCount = computed(() => allRemovals.value.filter(r => !r.end).length)
const completedRemovalsCount = computed(() => allRemovals.value.filter(r => r.end).length)

const filteredRemovals = computed(() => {
  const term = searchTerm.value.toLowerCase().trim()
  if (!term) return allRemovals.value
  
  const filtered = allRemovals.value.filter(r => 
    r.personName.toLowerCase().includes(term) ||
    r.paroisse.toLowerCase().includes(term) ||
    r.motif.toLowerCase().includes(term)
  )
  
  // console.log(`🔍 ${filtered.length} déplacements filtrés sur "${term}"`)
  return filtered
})

async function confirmRetour(rem) {
  if (!confirm(`Confirmer le retour de ${rem.personName} ?`)) return
  
  try {
    const now = new Date().toISOString()
    // console.log(`✅ Confirmation retour pour ${rem.personName}`)
    
    await axios.patch(`${API}/removals/${rem.id}`, { end: now }, {
      headers: {
        "Content-Type": "application/merge-patch+json",
        "Authorization": `Bearer ${localStorage.getItem("token")}`
      }
    })
    
    toast.success(`Retour de ${rem.personName} confirmé`)
    await fetchAll()
  } catch (e) {
    console.error('Erreur confirmation retour:', e)
    toast.error('Erreur lors de la confirmation du retour')
  }
}
</script>

<style scoped>
.table-wrapper { 
  max-height: 50vh; 
  overflow-y: auto; 
  border-radius: 8px; 
  border: 1px solid #dee2e6;
}
.table th, .table td { 
  padding: .75rem; 
  border: 1px solid #dee2e6; 
  vertical-align: middle;
}
.sticky-top { 
  position: sticky; 
  top: -0.7rem; 
  background: #fff; 
  z-index: 10; 
}

.badge {
  font-size: 0.75rem;
}

.card-footer {
  padding: 0.75rem 1rem;
}

.card-footer .fw-bold {
  font-size: 1.1rem;
}

/* Responsive design */
@media (max-width: 768px) {
  .table-wrapper {
    max-height: 40vh;
  }
  
  .card-header {
    flex-direction: column;
    gap: 0.5rem;
    align-items: start;
  }
  
  .table th, .table td {
    padding: 0.5rem;
    font-size: 0.875rem;
  }
  
  .card-footer .row > div {
    margin-bottom: 0.5rem;
  }
}
</style>