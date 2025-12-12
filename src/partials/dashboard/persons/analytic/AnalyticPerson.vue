<script setup>
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
import axios from 'axios'
import { useServiceContext } from '@/composables/useServiceContext'

const { currentService } = useServiceContext()
const LocalisationService = ref(currentService.value.position)

// Config API
const API_URL = import.meta.env.VITE_API_BASE_URL
const token = localStorage.getItem('token')
const isLoading = ref(false)

// Données
const currentUser = ref(null)
const currentPerson = ref(null)
const allPeople = ref([])
const doyennes = ref([])
const paroisses = ref([])
const dioceses = ref([])
const allDoyennes = ref([])
const allParoisses = ref([])
const sectorId = ref(null)
const nameService = ref(currentService.value.name)

// Référence pour DataTables
let dataTable = null

// SSE
let eventSource = null

// ==========================
// PAGINATION OPTIMISÉE
// ==========================
async function fetchAllPages(baseUrl, options = {}) {
  let allItems = []
  let currentPage = 1
  let hasMore = true

  try {
    while (hasMore) {
      const url = new URL(baseUrl)
      url.searchParams.set('page', currentPage)

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
          ...options.headers,
        },
        ...options,
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()

      if (data.member && Array.isArray(data.member)) {
        allItems = [...allItems, ...data.member]

        if (data.member.length === 0 || data.member.length < 30 || currentPage >= 50) {
          hasMore = false
        } else {
          currentPage++
        }
      } else {
        hasMore = false
      }
    }

    return allItems
  } catch (error) {
    console.error('Erreur lors de la récupération paginée:', error)
    throw error
  }
}

async function fetchAllPagesAxios(baseUrl) {
  let allItems = []
  let currentPage = 1
  let hasMore = true

  try {
    while (hasMore) {
      const url = `${baseUrl}${baseUrl.includes('?') ? '&' : '?'}page=${currentPage}`

      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      })

      const data = response.data

      if (data.member && Array.isArray(data.member)) {
        allItems = [...allItems, ...data.member]

        if (data.member.length === 0 || data.member.length < 30 || currentPage >= 50) {
          hasMore = false
        } else {
          currentPage++
        }
      } else {
        hasMore = false
      }
    }

    return allItems
  } catch (error) {
    console.error('Erreur lors de la récupération paginée:', error)
    throw error
  }
}

// ==========================
// Déterminer le secteur actif
// ==========================
const sectorName = computed(() => {
  switch (currentService.value?.position) {
    case 'est':
      return 'KIN EST'
    case 'centre':
      return 'KIN CENTRE'
    case 'ouest':
      return 'KIN OUEST'
    default:
      return 'KIN EST'
  }
})

// ==========================
// Initialiser/détruire DataTables
// ==========================
function initDataTable() {
  // Détruire l'instance existante
  if (dataTable) {
    dataTable.destroy()
    dataTable = null
  }

  // Attendre que le DOM soit mis à jour
  nextTick(() => {
    const tableElement = document.getElementById('table1')
    if (tableElement) {
      dataTable = $(tableElement).DataTable({
        responsive: true,
        pageLength: 10,
        language: {
          url: '//cdn.datatables.net/plug-ins/1.13.4/i18n/fr-FR.json'
        },
        order: [[0, 'asc']],
        scrollY: '45rem', // Hauteur fixe pour le défilement
        scrollCollapse: true,
        paging: true
      })
    }
  })
}

function destroyDataTable() {
  if (dataTable) {
    dataTable.destroy()
    dataTable = null
  }
}

// ==========================
// Charger l'utilisateur connecté
// ==========================
async function fetchCurrentUser() {
  try {
    const username = localStorage.getItem('userPhone')
    if (!token || !username) return

    const res = await axios.get(`${API_URL}/users?username=${encodeURIComponent(username)}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    currentUser.value = res.data.member?.find((u) => u.username === username)
  
    if (currentUser.value) {
      // Récupérer toutes les personnes pour trouver celle correspondante
      const people = await fetchAllPagesAxios(`${API_URL}/people`)
      currentPerson.value = people.find((p) => p.phoneNumber === username)
    }
  } catch (err) {
    console.error('❌ Erreur récupération user', err)
  }
}

// ==========================
// Récupérer toutes les paroisses et doyennes
// ==========================
async function fetchAllParoisses() {
  try {
    allParoisses.value = await fetchAllPagesAxios(`${API_URL}/paroisses`)
  } catch (err) {
    console.error('❌ Erreur récupération toutes paroisses', err)
  }
}

async function fetchAllDoyennes() {
  try {
    allDoyennes.value = await fetchAllPagesAxios(`${API_URL}/doyennes`)
  } catch (err) {
    console.error('❌ Erreur récupération toutes doyennes', err)
  }
}

// ==========================
// Fetch doyennes, paroisses, diocèses
// ==========================
async function fetchSectorId() {
  try {
    isLoading.value = true
    
    // D'abord récupérer le secteur
    const res = await axios.get(`${API_URL}/sectors?name=${encodeURIComponent(sectorName.value)}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    const sec = res.data.member?.find((s) => s.name === sectorName.value)
    
    if (sec) {
      sectorId.value = sec.id
      // Charger les données en parallèle
      await Promise.all([
        fetchAllParoisses(),
        fetchAllDoyennes(),
        fetchPeople(), // Cette fonction va filtrer selon le service
      ])
      
      // Après chargement des données, initialiser DataTables
      setTimeout(() => {
        initDataTable()
      }, 100)
    }
  } catch (err) {
    console.error('❌ Erreur récupération secteur', err)
  } finally {
    isLoading.value = false
  }
}

// ==========================
// Fetch et filtrer les personnes selon le service
// ==========================
async function fetchPeople() {
  try {
    const people = await fetchAllPagesAxios(`${API_URL}/people`)
    
    // DEBUG: Afficher les données brutes
    console.log('📊 Toutes les personnes chargées:', people.length)
    console.log('📍 Service actuel:', LocalisationService.value)
    console.log('👤 Personne connectée:', currentPerson.value)

    // Réinitialiser la liste
    allPeople.value = []

    // Filtrage selon le service
    switch (LocalisationService.value) {
      case 'jeune':
        // Tous les jeunes de la même paroisse
        if (currentPerson.value?.paroisse) {
          allPeople.value = people.filter((p) => p.paroisse === currentPerson.value.paroisse)
          console.log('🎯 Jeunes filtrés par paroisse:', allPeople.value.length)
        }
        break

      case 'paroissial':
        // Noyau paroissial avec même paroisse
        if (currentPerson.value?.paroisse) {
          allPeople.value = people.filter(
            (p) => p.paroisse === currentPerson.value.paroisse && p.isNoyau
          )
          console.log('🎯 Noyau paroissial filtré:', allPeople.value.length)
        }
        break

      case 'decanal':
        // Noyau décanal avec même doyenné
        if (currentPerson.value?.doyenne) {
          allPeople.value = people.filter(
            (p) => p.doyenne === currentPerson.value.doyenne && p.isDecanal
          )
          console.log('🎯 Noyau décanal filtré:', allPeople.value.length)
        }
        break

      case 'diocesain':
        // Tous les diocésains
        allPeople.value = people.filter((p) => p.isDicoces)
        console.log('🎯 Diocésains filtrés:', allPeople.value.length)
        break

      default:
        allPeople.value = []
    }
  } catch (err) {
    console.error('❌ Erreur récupération personnes', err)
  }
}

// ==========================
// Computed pour l'affichage
// ==========================
const jeunes = computed(() => {
  return (allPeople.value || []).map((p) => ({
    ...p,
    doyenne: allDoyennes.value.find((d) => d['@id'] === p.doyenne)?.name || p.doyenne || '',
    paroisse: allParoisses.value.find((pa) => pa['@id'] === p.paroisse)?.name || p.paroisse || '',
    nom: p.fullName,
    tel: p.phoneNumber,
  }))
})

// ==========================
// Watcher pour recréer DataTables quand les données changent
// ==========================
watch(jeunes, () => {
  if (!isLoading.value) {
    setTimeout(() => {
      initDataTable()
    }, 100)
  }
}, { deep: true })

// ==========================
// Actualisation manuelle
// ==========================
async function handleRefresh() {
  destroyDataTable()
  isLoading.value = true
  try {
    await fetchPeople()
  } finally {
    isLoading.value = false
    setTimeout(() => {
      initDataTable()
    }, 100)
  }
}

// ==========================
// Montage SSE
// ==========================
onMounted(async () => {
  await fetchCurrentUser()
  await fetchSectorId()

  // === SSE ===
  eventSource = new EventSource(`${API_URL.replace('/api', '')}/sse/people`)
  
  eventSource.onmessage = async (event) => {
    const data = JSON.parse(event.data)
    
    // Rafraîchir les données
    await fetchPeople()
  }

  eventSource.onerror = (err) => {
    console.error('❌ SSE error', err)
    eventSource.close()
  }
})

onUnmounted(() => {
  destroyDataTable()
  if (eventSource) eventSource.close()
})
</script>

<template>
  <div class="be-content">
    <div class="main-content container-fluid">
      <div class="row">
        <div class="col-sm-12">
          <div class="card card-table">
            <div class="card-header d-flex justify-content-between align-items-center">
              <span>Statistique - {{ nameService }}</span>
              <!-- <button 
                @click="handleRefresh" 
                class="btn btn-outline-primary btn-sm"
                :disabled="isLoading"
                title="Actualiser les données"
              >
                <i class="fas fa-sync-alt" :class="{ 'fa-spin': isLoading }"></i>
                {{ isLoading ? 'Actualisation...' : 'Actualiser' }}
              </button> -->
            </div>
            <div class="card-body">
              <div class="table-responsive p-2">
                <div v-if="isLoading" class="text-center my-5">
                  <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden"></span>
                  </div>
                  <p>Chargement des données...</p>
                </div>
                <table v-else class="table table-striped table-hover" id="table1">
                  <thead>
                    <tr>
                      <th>Nom complet</th>
                      <th class="d-none d-md-table-cell">Doyenné</th>
                      <th>Paroisse</th>
                      <th>Téléphone</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr
                      v-for="j in jeunes"
                      :key="j.id || j.phoneNumber"
                      :class="{
                        'bg-noyau text-dark': j.isNoyau,
                      }"
                    >
                      <td>{{ j.gender }} {{ j.fullName }}</td>
                      <td class="d-none d-md-table-cell">{{ j.doyenne }}</td>
                      <td>{{ j.paroisse }}</td>
                      <td>{{ j.phoneNumber }}</td>
                    </tr>
                    <tr v-if="jeunes.length === 0 && !isLoading">
                      <td colspan="4" class="text-center text-muted">Aucune donnée disponible</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Conteneur de la carte avec hauteur limitée */
.card {
  max-height: 60rem; /* Hauteur totale de la carte */
  display: flex;
  flex-direction: column;
}

/* Corps de la carte avec hauteur fixe */
.card-body {
  flex: 1;
  overflow: hidden;
  padding: 0;
}

/* Conteneur du tableau avec hauteur maximale de 45rem */
.table-responsive {
  max-height: 45rem; /* 45rem = 720px */
  overflow: auto;
  position: relative;
}

/* En-tête du tableau fixe */
.table-responsive table thead {
  position: sticky;
  top: 0;
  z-index: 10;
}

.table-responsive table thead th {
  background-color: #fff;
  box-shadow: 0 2px 2px -1px rgba(0, 0, 0, 0.1);
  padding: 0.75rem;
  font-weight: 600;
}

/* Style pour les noyaux */
.bg-noyau {
  background-color: #d7ddd7 !important;
  color: black !important;
}

/* Animation de l'icône d'actualisation */
.fa-spin {
  animation: fa-spin 1s infinite linear;
}

@keyframes fa-spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

/* Ajustement du style DataTables */
.dataTables_wrapper {
  width: 100%;
  max-height: 45rem;
}

.dataTables_wrapper .dataTables_scroll {
  max-height: 45rem;
}

.dataTables_wrapper .dataTables_scrollBody {
  max-height: calc(45rem - 40px) !important; /* Ajuster selon la hauteur de l'en-tête */
}

/* Style pour les en-têtes dans le défilement DataTables */
.dataTables_scrollHead thead th {
  background-color: #fff;
}

/* Responsive */
@media (max-width: 768px) {
  .table-responsive {
    max-height: 35rem; /* Réduire sur mobile */
  }
  
  .d-none.d-md-table-cell {
    display: none !important;
  }
}

@media (max-width: 576px) {
  .table-responsive {
    max-height: 30rem; /* Réduire encore plus sur petits écrans */
  }
  
  .card-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
  
  .card-header .btn {
    align-self: flex-end;
  }
}
</style>