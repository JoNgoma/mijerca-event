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
const allDoyennes = ref([])
const allParoisses = ref([])
const sectorId = ref(null)
const nameService = ref(currentService.value.name)

// Référence pour DataTables
let dataTable = null

// ==========================
// PAGINATION OPTIMISÉE
// ==========================
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
// Gestion du redimensionnement de la fenêtre
// ==========================
const handleResize = () => {
  if (dataTable) {
    setTimeout(() => {
      dataTable.destroy()
      initDataTable()
    }, 150)
  }
}

// ==========================
// Initialiser/détruire DataTables OPTIMISÉ
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
      // Calculer la hauteur dynamique basée sur la taille de l'écran
      const screenHeight = window.innerHeight
      const isMobile = screenHeight < 768
      const isSmallScreen = screenHeight < 576
      
      let tableHeight
      if (isSmallScreen) {
        tableHeight = Math.max(300, screenHeight * 0.5) + 'px' // 50% de la hauteur de l'écran
      } else if (isMobile) {
        tableHeight = Math.max(400, screenHeight * 0.65) + 'px' // 65% de la hauteur de l'écran
      } else {
        tableHeight = '60vh' // 60% de la hauteur de la fenêtre sur desktop
      }

      dataTable = $(tableElement).DataTable({
        responsive: true,
        pageLength: 25, // Plus d'éléments par page pour réduire la pagination
        lengthMenu: [[10, 25, 50, 100, -1], [10, 25, 50, 100, "Tous"]],
        language: {
          url: '//cdn.datatables.net/plug-ins/1.13.4/i18n/fr-FR.json',
          lengthMenu: "Afficher _MENU_ éléments",
          search: "Rechercher:",
          info: "Affichage de _START_ à _END_ sur _TOTAL_ personnes",
          paginate: {
            first: "Premier",
            last: "Dernier",
            next: "Suivant",
            previous: "Précédent"
          }
        },
        order: [[0, 'asc']],
        scrollY: tableHeight, // Hauteur dynamique
        scrollCollapse: true,
        paging: true,
        scrollX: true, // Activer le défilement horizontal sur mobile
        fixedHeader: true, // En-tête fixe
        
        // OPTIMISATIONS DE PERFORMANCE CRITIQUES
        deferRender: true, // Rendu différé: ne rend que les lignes visibles
        scrollX: true,
        fixedHeader: true,
        processing: true, // Affiche "Traitement en cours..."
        columnDefs: [
          { responsivePriority: 1, targets: 0 }, // Nom complet prioritaire
          { responsivePriority: 2, targets: 3 }, // Téléphone
          { responsivePriority: 3, targets: 2 }, // Paroisse
          { responsivePriority: 4, targets: 1 }, // Doyenné
          {
            targets: [1], // Colonne doyenné
            visible: !isMobile // Masquer sur mobile
          }
        ]
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
// Fetch doyennes, paroisses, diocèses - OPTIMISÉ
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
      // Charger les données en parallèle pour optimiser le temps
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
    console.time('fetchPeople') // Mesure du temps d'exécution
    const people = await fetchAllPagesAxios(`${API_URL}/people`)

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
    console.timeEnd('fetchPeople') // Fin de la mesure
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
// Montage - SANS SSE
// ==========================
onMounted(async () => {
  await fetchCurrentUser()
  await fetchSectorId()
  
  // Écouter le redimensionnement de la fenêtre
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  destroyDataTable()
  window.removeEventListener('resize', handleResize)
  // Pas de SSE à fermer
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
              <!-- <div class="d-flex align-items-center gap-2">
                <small class="text-muted me-2">{{ jeunes.length }} personnes listées</small>
                <button
                  @click="handleRefresh"
                  class="btn btn-outline-primary btn-sm"
                  :disabled="isLoading"
                  title="Actualiser les données"
                >
                  <i class="fas fa-sync-alt" :class="{ 'fa-spin': isLoading }"></i>
                </button>
              </div> -->
            </div>
            <div class="card-body p-2">
              <div class="table-responsive-wrapper">
                <div v-if="isLoading" class="text-center my-5">
                  <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden"></span>
                  </div>
                  <p>Chargement des données...</p>
                </div>
                <div v-else class="table-responsive">
                  <table class="table table-striped table-hover" id="table1">
                    <thead>
                      <tr>
                        <th>Nom complet</th>
                        <th class="doyenne-column">Doyenné</th>
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
                        <td class="doyenne-column">{{ j.doyenne }}</td>
                        <td>{{ j.paroisse }}</td>
                        <td>
                          <a :href="`tel:${j.phoneNumber}`" class="text-decoration-none">
                            {{ j.phoneNumber }}
                          </a>
                        </td>
                      </tr>
                      <tr v-if="jeunes.length === 0 && !isLoading">
                        <td colspan="4" class="text-center text-muted py-4">
                          <i class="fas fa-inbox fa-2x mb-2"></i><br>
                          Aucune donnée disponible
                        </td>
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
  </div>
</template>

<style scoped>
/* Conteneur principal de la carte */
.card {
  display: flex;
  flex-direction: column;
  min-height: 400px; /* Hauteur minimale */
}

/* Corps de la carte avec hauteur flexible */
.card-body {
  flex: 1;
  overflow: hidden;
  padding: 0;
  display: flex;
  flex-direction: column;
}

/* Conteneur pour le tableau responsive */
.table-responsive-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 300px;
}

/* Tableau responsive */
.table-responsive {
  flex: 1;
  overflow: auto;
  position: relative;
  min-height: 200px;
}

/* En-tête fixe du tableau */
.table-responsive table thead th {
  position: sticky;
  top: 0;
  background-color: #f8f9fa;
  z-index: 10;
  box-shadow: 0 2px 2px -1px rgba(0, 0, 0, 0.1);
  padding: 0.75rem;
  font-weight: 600;
  white-space: nowrap;
}

/* Style pour les noyaux */
.bg-noyau {
  background-color: #e8f5e9 !important;
}

/* Style pour les liens téléphone */
a[href^="tel:"] {
  color: #0d6efd;
  transition: color 0.2s;
}

a[href^="tel:"]:hover {
  color: #0a58ca;
  text-decoration: underline !important;
}

/* Style pour les colonnes */
.doyenne-column {
  min-width: 150px;
}

/* Styles pour DataTables */
.dataTables_wrapper {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.dataTables_scroll {
  flex: 1;
  min-height: 0;
}

/* Ajustements pour mobile */
@media (max-width: 768px) {
  .card-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.75rem;
  }
  
  .table-responsive {
    max-height: 70vh;
  }
  
  .card-header .btn {
    align-self: flex-end;
    margin-top: -2.5rem;
  }
  
  .doyenne-column {
    display: none;
  }
  
  /* Ajuster la taille de police sur mobile */
  .table td, .table th {
    font-size: 0.875rem;
    padding: 0.5rem;
  }
  
  /* Réduire l'espacement sur très petits écrans */
  @media (max-width: 360px) {
    .table td, .table th {
      font-size: 0.8125rem;
      padding: 0.375rem;
    }
  }
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

/* Style pour le message vide */
.text-center.text-muted {
  font-size: 1.1rem;
  color: #6c757d;
}

/* Améliorer la visibilité des lignes au survol */
.table-hover tbody tr:hover {
  background-color: rgba(0, 0, 0, 0.03);
}

/* Ajustements pour les écrans très hauts */
@media (min-height: 900px) {
  .table-responsive {
    max-height: 70vh;
  }
}

/* Ajustements pour les écrans larges */
@media (min-width: 1200px) {
  .table-responsive {
    max-height: 80vh;
  }
}
</style>