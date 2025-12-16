<script setup>
import { ref, onMounted, computed } from 'vue'
import axios from 'axios'
import { useRoute } from 'vue-router'
import { useToast } from 'vue-toastification'

const toast = useToast()
const route = useRoute()
const loading = ref(false)
const viewServices = ref([])

const API = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api'

// === Récupérer l'id du camp courant depuis l'URL ===
const campId = computed(() => route.params.id_campBiblique || null)
const campName = ref('...')

async function fetchCampName() {
  if (!campId.value) return
  try {
    const res = await axios.get(`${API}/camp_bibliques/${campId.value}`)
    campName.value = res.data.name || 'Activité inconnue'
  } catch (err) {
    console.error('Erreur récupération camp:', err)
    campName.value = 'Camp introuvable'
  }
}

// === PAGINATION OPTIMISÉE ===
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

// === Utils ===
const extractIdFromUrl = (url) => {
  if (!url) return null
  try {
    return String(url).split('/').pop() || null
  } catch {
    return null
  }
}

// === Liste des services à analyser ===
const allServices = [
  { id: 'adm', name: 'Administration', key: 'administrations' },
  { id: 'fin', name: 'Finances', key: 'finances' },
  { id: 'heb', name: 'Hébergement', key: 'hebergements' },
  { id: 'sec', name: 'Secrétariat', key: 'informatiques' }
]

// === Données globales ===
const allPeople = ref([])
const allUsers = ref([])

// === Chargement des données de base ===
async function fetchBaseData() {
  try {
    loading.value = true

    const [usersRes, peopleRes] = await Promise.all([
      fetchAllPages(`${API}/users`),
      fetchAllPages(`${API}/people`)
    ])

    allUsers.value = usersRes
    allPeople.value = peopleRes

    await computeServiceStats()
  } catch (err) {
    console.error(err)
    toast.error('Erreur lors du chargement des données de base')
  } finally {
    loading.value = false
  }
}

// === Calcul des effectifs par service pour le camp courant ===
async function computeServiceStats() {
  const results = []

  for (const service of allServices) {
    let freres = 0
    let soeurs = 0

    try {
      // Charger tous les enregistrements du service avec pagination
      const allRecords = await fetchAllPages(`${API}/${service.key}`)

      // Ne garder que ceux du camp courant
      const campRecords = allRecords.filter(
        s => s.campBiblic === `/api/camp_bibliques/${campId.value}`
      )

      // console.log(`📊 ${service.name}: ${campRecords.length} enregistrements pour ce camp`)

      // Extraire les users liés à ces services
      const serviceUserIds = campRecords
        .map(rec => {
          if (Array.isArray(rec.user)) {
            return rec.user.map(u => extractIdFromUrl(u))
          } else if (rec.user) {
            return [extractIdFromUrl(rec.user)]
          }
          return []
        })
        .flat()
        .filter(Boolean)

      // Calculer les effectifs
      serviceUserIds.forEach(uid => {
        const user = allUsers.value.find(u => extractIdFromUrl(u['@id']) === uid)
        if (!user) return
        const person = allPeople.value.find(p => p['@id'] === user.person)
        if (!person) return

        const gender = person.gender?.toLowerCase()
        if (gender === 'frère' || gender === 'frere') freres++
        else soeurs++
      })

      results.push({
        id: service.id,
        name: service.name,
        freres,
        soeurs,
        total: freres + soeurs,
        recordsCount: campRecords.length
      })
    } catch (err) {
      console.warn(`Erreur pour le service ${service.name}`, err)
      // Ajouter quand même le service avec des valeurs à 0 en cas d'erreur
      results.push({
        id: service.id,
        name: service.name,
        freres: 0,
        soeurs: 0,
        total: 0,
        recordsCount: 0,
        error: true
      })
    }
  }

  viewServices.value = results
  // console.log('🎯 Statistiques calculées:', results)
}

// === Actualisation manuelle ===
async function handleRefresh() {
  loading.value = true
  try {
    await fetchBaseData()
    toast.success('Données actualisées avec succès')
  } catch (err) {
    toast.error('Erreur lors de l\'actualisation')
  } finally {
    loading.value = false
  }
}

// === Initialisation ===
onMounted(async () => {
  await fetchCampName()
  await fetchBaseData()
})
</script>

<template>
  <div class="tab-pane">
    <div class="d-flex justify-content-between align-items-center mb-3">
      <h5 class="mb-0">Statistiques des services</h5>
      <button 
        @click="handleRefresh" 
        class="btn btn-outline-primary btn-sm"
        :disabled="loading"
        title="Actualiser les données"
      >
        <i class="fas fa-sync-alt" :class="{ 'fa-spin': loading }"></i>
        {{ loading ? 'Actualisation...' : 'Actualiser' }}
      </button>
    </div>

    <div v-if="loading" class="text-center my-5">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden"></span>
      </div>
      <p class="mt-2">Chargement des données...</p>
    </div>

    <div v-else>
      <div class="card shadow-sm">
        <div class="table-container">
          <table class="table table-hover align-middle mb-0">
            <thead class="table-light sticky-header">
              <tr>
                <th>Service</th>
                <th>Soeurs</th>
                <th>Frères</th>
                <th>Total</th>
                <!-- <th class="text-muted small">Enregistrements</th> -->
              </tr>
            </thead>

            <tbody>
              <tr 
                v-for="s in viewServices" 
                :key="s.id"
                :class="{ 'table-warning': s.error }"
              >
                <td>
                  {{ s.name }}
                  <span v-if="s.error" class="badge bg-danger ms-1" title="Erreur lors du calcul">!</span>
                </td>
                <td>
                  <span class="badge bg-info">{{ s.soeurs }}</span>
                </td>
                <td>
                  <span class="badge bg-primary">{{ s.freres }}</span>
                </td>
                <td>
                  <strong>{{ s.total }}</strong>
                </td>
                <!-- <td class="text-muted small">
                  {{ s.recordsCount }}
                </td> -->
              </tr>

              <tr v-if="!viewServices.length">
                <td colspan="5" class="text-center text-muted py-4">
                  Aucun service trouvé pour ce camp
                </td>
              </tr>
            </tbody>

            <tfoot class="table-light fw-semibold tfoot">
              <tr>
                <td>Total général</td>
                <td>
                  <span class="badge bg-info">
                    {{ viewServices.reduce((a, s) => a + s.soeurs, 0) }} Soeurs
                  </span>
                </td>
                <td>
                  <span class="badge bg-primary">
                    {{ viewServices.reduce((a, s) => a + s.freres, 0) }} Frères
                  </span>
                </td>
                <td>
                  <strong class="text-success">
                    {{ viewServices.reduce((a, s) => a + s.total, 0) }}
                  </strong>
                </td>
                <!-- <td class="text-muted small">
                  {{ viewServices.reduce((a, s) => a + s.recordsCount, 0) }}
                </td> -->
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

    </div>
  </div>
</template>

<style scoped>
.table-container {
  max-height: 34rem;
  overflow-y: auto;
  border: 1px solid #dee2e6;
  border-radius: 0.5rem;
}
.sticky-header {
  position: sticky;
  top: 0;
  background: #edeff0;
  z-index: 2;
}
.tfoot {
  position: sticky;
  bottom: 0;
  background: #edeff0;
  z-index: 2;
}
.fw-semibold {
  font-weight: 600;
}

/* Animation de l'icône d'actualisation */
.fa-spin {
  animation: fa-spin 1s infinite linear;
}

@keyframes fa-spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.badge {
  font-size: 0.75em;
}
</style>