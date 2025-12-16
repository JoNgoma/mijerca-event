<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useServiceContext } from '@/composables/useServiceContext'

const route = useRoute()
const { currentService } = useServiceContext()

const sectorService = computed(() => route.params.serviceType || currentService.value.position)
const sector = computed(() => {
  if (sectorService.value === 'est') return 'KIN EST'
  if (sectorService.value === 'centre') return 'KIN CENTRE'
  if (sectorService.value === 'ouest') return 'KIN OUEST'
  return 'KIN EST'
})
const descr = computed(() => currentService.value.description)

const API_URL = import.meta.env.VITE_API_BASE_URL
const token = localStorage.getItem('token')

const isLoading = ref(false)
const sectorId = ref(null)
const doyennes = ref([])
const totalSecteur = ref(0)
const totalDoyennes = ref(0)
const totalParoisses = ref(0)

// =============== PAGINATION OPTIMISÉE ===============
async function fetchAllPages(baseUrl, options = {}) {
  let allItems = [];
  let currentPage = 1;
  let hasMore = true;
  
  try {
    while (hasMore) {
      const url = new URL(baseUrl);
      url.searchParams.set('page', currentPage);
      
      const response = await fetch(url, {
        headers: { 
          Authorization: `Bearer ${token}`,
          ...options.headers
        },
        ...options
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.member && Array.isArray(data.member)) {
        allItems = [...allItems, ...data.member];
        
        // Vérifie s'il y a plus de pages
        if (data.member.length === 0 || 
            data.member.length < 30 || // Si l'API utilise une limite de 30
            currentPage >= 50) { // Sécurité pour éviter les boucles infinies
          hasMore = false;
        } else {
          currentPage++;
        }
      } else {
        hasMore = false;
      }
    }
    
    return allItems;
  } catch (error) {
    console.error('Erreur lors de la récupération paginée:', error);
    throw error;
  }
}

/**
 * Version alternative si l'API utilise des paramètres différents
 */
async function fetchAllWithPagination(baseUrl, pageParam = 'page', itemsPerPage = 100) {
  let allItems = [];
  let page = 1;
  let totalItems = 0;
  
  do {
    try {
      const url = `${baseUrl}${baseUrl.includes('?') ? '&' : '?'}${pageParam}=${page}&itemsPerPage=${itemsPerPage}`;
      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      
      const data = await response.json();
      
      if (data.member && Array.isArray(data.member)) {
        allItems = [...allItems, ...data.member];
        totalItems = data.member.length;
        page++;
      } else {
        break;
      }
    } catch (error) {
      console.error(`Erreur page ${page}:`, error);
      break;
    }
  } while (totalItems === itemsPerPage); // Continue tant qu'on a une page complète
  
  return allItems;
}

// =============== SSE ===============
const evtSource = ref(null)
function connectSse() {
  if (evtSource.value) evtSource.value.close()
  evtSource.value = new EventSource(`${API_URL}/sse/updates`)

  evtSource.value.onmessage = (e) => {
    const msg = JSON.parse(e.data)

    // Si un changement concerne le même secteur → on recharge
    if (
      msg?.sector === `/api/sectors/${sectorId.value}` &&
      ['doyenne', 'paroisse', 'personne'].includes(msg.type)
    ) {
      // console.log('🔄 Mise à jour reçue via SSE:', msg)
      fetchDoyennes()
    }
  }

  evtSource.value.onerror = () => {
    console.warn('⚠️ SSE déconnecté, reconnexion dans 5s...')
    evtSource.value?.close()
    setTimeout(connectSse, 5000)
  }
}

// =============== FETCH DES DONNÉES ===============
async function fetchSectorId() {
  isLoading.value = true
  try {
    const res = await fetch(`${API_URL}/sectors?name=${encodeURIComponent(sector.value)}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    const data = await res.json()
    const sec = data.member?.find((s) => s.name === sector.value)
    if (sec) {
      sectorId.value = sec.id
      await fetchDoyennes()
    }
  } catch (err) {
    console.error('Erreur récupération secteur', err)
  } finally {
    isLoading.value = false
  }
}

async function fetchDoyennes() {
  if (!sectorId.value) return

  try {
    // Récupération paginée de TOUTES les données
    const [doyennesData, paroissesData, peopleData] = await Promise.all([
      fetchAllPages(`${API_URL}/doyennes?sector=/sectors/${sectorId.value}`),
      fetchAllPages(`${API_URL}/paroisses?sector=/sectors/${sectorId.value}`),
      fetchAllPages(`${API_URL}/people?sector=/sectors/${sectorId.value}`)
    ])

    // console.log('📊 Données récupérées (pagination):', {
    //   doyennes: doyennesData.length || 0,
    //   paroisses: paroissesData.length || 0,
    //   personnes: peopleData.length || 0
    // })

    const secDoyenne = doyennesData.filter((s) => s.sector === `/api/sectors/${sectorId.value}`) || []
    const secParoisses = paroissesData.filter((s) => s.sector === `/api/sectors/${sectorId.value}`) || []
    const people = peopleData || []

    doyennes.value = secDoyenne.map((d) => {
      const paroisses = secParoisses
        .filter((p) => p.doyenne === `/api/doyennes/${d.id}`)
        .map((p) => ({
          id: p.id,
          name: p.name,
          effectif: people.filter((pe) => pe.paroisse === `/api/paroisses/${p.id}`).length
        }))

      const idx = paroisses.findIndex((p) => p.name === d.name)
      if (idx > 0) {
        const [p] = paroisses.splice(idx, 1)
        paroisses.unshift(p)
      }

      const totalEffectif = paroisses.reduce((acc, p) => acc + p.effectif, 0)
      return { ...d, paroisses, totalEffectif }
    })

    // Calcul des totaux
    totalDoyennes.value = secDoyenne.length
    totalParoisses.value = secParoisses.length
    totalSecteur.value = people.filter((pe) => pe.sector === `/api/sectors/${sectorId.value}`).length

    // console.log('🧮 Totaux calculés:', {
    //   doyennes: totalDoyennes.value,
    //   paroisses: totalParoisses.value,
    //   secteur: totalSecteur.value
    // })

  } catch (err) {
    console.error('Erreur récupération doyennés, paroisses et personnes', err)
  }
}

// =============== ACTUALISATION MANUELLE ===============
async function handleRefresh() {
  isLoading.value = true
  try {
    await fetchSectorId()
  } finally {
    isLoading.value = false
  }
}

// =============== INIT ===============
onMounted(() => {
  fetchSectorId()
  connectSse()
})

watch(
  () => route.params.serviceType,
  () => fetchSectorId()
)
</script>

<template>
  <div class="be-content">
    <div class="main-content container-fluid">
      <div class="row">
        <div class="col-sm-12">
          <div class="card card-table">
            <div class="card-header d-flex justify-content-between align-items-center">
              <span>{{ descr }}</span>
              <button 
                @click="handleRefresh" 
                class="btn btn-outline-primary btn-sm"
                :disabled="isLoading"
                title="Actualiser les données"
              >
                <i class="fas fa-sync-alt" :class="{ 'fa-spin': isLoading }"></i>
                {{ isLoading ? 'Actualisation...' : 'Actualiser' }}
              </button>
            </div>

            <div class="card-body">
              <div v-if="isLoading" class="text-center my-5">
                <div class="spinner-border text-primary" role="status">
                  <span class="visually-hidden"></span>
                </div>
                <p>Chargement des données...</p>
              </div>

              <div v-else class="table-container">
                <table class="table table-striped table-hover table-fw-widget" id="tableSect">
                  <thead>
                    <tr>
                      <th class="col-doyenne">Doyennés</th>
                      <th class="col-paroisse">Paroisses</th>
                      <th>Effectif</th>
                    </tr>
                  </thead>

                  <tbody>
                    <template v-for="d in doyennes" :key="d.id">
                      <tr v-for="(p, index) in d.paroisses" :key="p.id">
                        <td
                          v-if="index === 0"
                          :rowspan="d.paroisses.length + 1"
                          class="align-middle fw-bold bg-light"
                        >
                          Doyenné {{ d.name }}
                        </td>
                        <td>{{ p.name }}</td>
                        <td>{{ p.effectif }}</td>
                      </tr>

                      <tr class="table-info fw-bold">
                        <td class="text-center">
                          <span class="badge bg-info text-dark">{{ d.paroisses.length }} Paroisses</span>
                        </td>
                        <td><span class="badge bg-success">{{ d.totalEffectif }}</span></td>
                      </tr>
                    </template>
                  </tbody>

                  <tfoot>
                    <tr class="table-primary fw-bold">
                      <td class="text-center">
                        <span class="badge bg-primary">Total Doyennés: {{ totalDoyennes }}</span>
                      </td>
                      <td class="text-center">
                        <span class="badge bg-primary">Total Paroisses: {{ totalParoisses }}</span>
                      </td>
                      <td class="text-center">
                        <span class="badge bg-danger">Total Effectif: {{ totalSecteur }}</span>
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style>
.table-container {
  max-height: 44.9rem;
  overflow-y: auto;
  position: relative;
}

/* En-tête collant */
#tableSect thead th {
  position: sticky;
  top: 0;
  z-index: 3;
  background: #fff;
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.15);
}

/* Pied collant */
#tableSect tfoot td {
  position: sticky;
  bottom: 0;
  z-index: 3;
  background: #e3f2fd;
  box-shadow: 0 -3px 6px rgba(0, 0, 0, 0.15);
}

/* Largeurs */
#tableSect .col-doyenne {
  width: 45%;
}
#tableSect .col-paroisse {
  width: 40%;
}

/* Animation de l'icône d'actualisation */
.fa-spin {
  animation: fa-spin 1s infinite linear;
}

@keyframes fa-spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>