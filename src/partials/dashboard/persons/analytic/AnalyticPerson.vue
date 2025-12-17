<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue'
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
// UTILITAIRES
// ==========================
function extractIdFromUrl(url) {
  if (!url) return null
  const parts = String(url).split('/').filter(Boolean)
  return parts.pop()
}

// ==========================
// PAGINATION OPTIMISÉE AVEC FETCH (Version améliorée)
// ==========================
async function fetchAllPages(baseUrl, options = {}) {
  let allItems = []
  let currentPage = 1
  let hasMore = true
  const maxPages = options.maxPages || 100
  const pageSize = options.pageSize || 30

  try {
    while (hasMore && currentPage <= maxPages) {
      const url = new URL(baseUrl)
      url.searchParams.set('page', currentPage)

      if (options.params) {
        Object.entries(options.params).forEach(([key, value]) => {
          url.searchParams.set(key, value)
        })
      }

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/ld+json',
        },
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()

      if (data.member && Array.isArray(data.member)) {
        allItems = [...allItems, ...data.member]

        // Conditions d'arrêt
        const currentItemsCount = data.member.length
        if (currentItemsCount === 0 || currentItemsCount < pageSize) {
          hasMore = false
        } else {
          currentPage++
        }
      } else if (data['hydra:member'] && Array.isArray(data['hydra:member'])) {
        // Support pour format Hydra
        allItems = [...allItems, ...data['hydra:member']]

        const currentItemsCount = data['hydra:member'].length
        const totalItems = data['hydra:totalItems'] || 0

        if (
          currentItemsCount === 0 ||
          currentItemsCount < pageSize ||
          allItems.length >= totalItems
        ) {
          hasMore = false
        } else {
          currentPage++
        }
      } else if (Array.isArray(data)) {
        // Si l'API retourne directement un tableau
        allItems = [...allItems, ...data]
        hasMore = false
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
// PAGINATION POUR LES UTILISATEURS
// ==========================
async function fetchAllUsersWithPagination() {
  let allUsers = []
  let currentPage = 1
  const maxPages = 50
  const pageSize = 30

  try {
    while (currentPage <= maxPages) {
      const url = new URL(`${API_URL}/users`)
      url.searchParams.set('page', currentPage)

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/ld+json',
        },
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()

      // Gestion des différents formats de réponse
      let users = []
      if (data.member && Array.isArray(data.member)) {
        users = data.member
      } else if (data['hydra:member'] && Array.isArray(data['hydra:member'])) {
        users = data['hydra:member']
      } else if (Array.isArray(data)) {
        users = data
      }

      if (users.length === 0) {
        break
      }

      allUsers = [...allUsers, ...users]

      // Si on a moins d'éléments que la taille de page, c'est la dernière page
      if (users.length < pageSize) {
        break
      }

      currentPage++
    }

    return allUsers
  } catch (error) {
    console.error('Erreur lors de la récupération des utilisateurs:', error)
    throw error
  }
}

// ==========================
// Recherche d'utilisateur par critères multiples
// ==========================
async function searchUserByMultipleCriteria(username) {
  try {
    // Essai 1: Récupération de tous les utilisateurs avec pagination
    const allUsers = await fetchAllUsersWithPagination()

    if (allUsers.length === 0) {
      return null
    }

    // Recherche par plusieurs critères
    const user = allUsers.find(
      (u) =>
        u.username === username ||
        u.phoneNumber === username ||
        u.email === username ||
        (u.person && (u.person.phoneNumber === username || u.person.phone === username)),
    )

    return user || null
  } catch (error) {
    console.error('Erreur recherche utilisateur:', error)
    return null
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
        tableHeight = Math.max(300, screenHeight * 0.5) + 'px'
      } else if (isMobile) {
        tableHeight = Math.max(400, screenHeight * 0.65) + 'px'
      } else {
        tableHeight = '60vh'
      }

      dataTable = $(tableElement).DataTable({
        responsive: true,
        pageLength: 25,
        lengthMenu: [
          [10, 25, 50, 100, -1],
          [10, 25, 50, 100, 'Tous'],
        ],
        language: {
          lengthMenu: 'Afficher _MENU_ éléments',
          search: 'Rechercher:',
          info: 'Affichage de _START_ à _END_ sur _TOTAL_ personnes',
          infoEmpty: 'Aucune donnée disponible',
          infoFiltered: '(filtré à partir de _MAX_ entrées)',
          zeroRecords: 'Aucun résultat trouvé',
          paginate: {
            first: 'Premier',
            last: 'Dernier',
            next: 'Suivant',
            previous: 'Précédent',
          },
        },
        order: [[0, 'asc']],
        scrollY: tableHeight,
        scrollCollapse: true,
        paging: true,
        scrollX: true,
        fixedHeader: true,
        deferRender: true,
        processing: true,
        columnDefs: [
          { responsivePriority: 1, targets: 0 },
          { responsivePriority: 2, targets: 3 },
          { responsivePriority: 3, targets: 2 },
          { responsivePriority: 4, targets: 1 },
          {
            targets: [1],
            visible: !isMobile,
          },
        ],
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
// Charger l'utilisateur connecté - AVEC PAGINATION COMPLÈTE
// ==========================
async function fetchCurrentUser() {
  try {
    // Essayer différentes clés possibles pour le numéro de téléphone
    const username =
      localStorage.getItem('userPhone') ||
      localStorage.getItem('phoneNumber') ||
      localStorage.getItem('username') ||
      localStorage.getItem('user')

    if (!token || !username) {
      console.error('Token ou username manquant')
      return
    }

    // Rechercher l'utilisateur avec pagination complète
    currentUser.value = await searchUserByMultipleCriteria(username)

    if (currentUser.value) {
      // Récupérer toutes les personnes pour trouver celle correspondante
      const people = await fetchAllPages(`${API_URL}/people`)

      // Chercher la personne par plusieurs critères
      currentPerson.value = people.find(
        (p) =>
          p.phoneNumber === username ||
          p.phoneNumber === currentUser.value?.phoneNumber ||
          p.phoneNumber === currentUser.value?.username ||
          (currentUser.value.person &&
            extractIdFromUrl(currentUser.value.person) === extractIdFromUrl(p['@id'] || p.id)),
      )

      if (!currentPerson.value) {
        // Essayer de trouver par nom
        const nameParts = currentUser.value.username?.split(' ') || []
        if (nameParts.length >= 2) {
          currentPerson.value = people.find(
            (p) => p.fullName?.includes(nameParts[0]) && p.fullName?.includes(nameParts[1]),
          )
        }
      }
    }
  } catch (err) {
    console.error('Erreur récupération user', err.message || err)
  }
}

// ==========================
// Récupérer toutes les paroisses et doyennes avec pagination
// ==========================
async function fetchAllParoisses() {
  try {
    allParoisses.value = await fetchAllPages(`${API_URL}/paroisses`)
  } catch (err) {
    console.error('Erreur récupération toutes paroisses', err)
  }
}

async function fetchAllDoyennes() {
  try {
    allDoyennes.value = await fetchAllPages(`${API_URL}/doyennes`)
  } catch (err) {
    console.error('Erreur récupération toutes doyennes', err)
  }
}

// ==========================
// Fetch doyennes, paroisses, diocèses
// ==========================
async function fetchSectorId() {
  try {
    isLoading.value = true

    // Récupérer le secteur
    const res = await fetch(`${API_URL}/sectors?name=${encodeURIComponent(sectorName.value)}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })

    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`)
    }

    const data = await res.json()
    const sec = data.member?.find((s) => s.name === sectorName.value)

    if (sec) {
      sectorId.value = sec.id

      // Charger les données en parallèle
      await Promise.all([fetchAllParoisses(), fetchAllDoyennes()])

      // Attendre que fetchCurrentUser ait fini
      await fetchCurrentUser()

      // Maintenant charger les personnes avec les informations utilisateur
      await fetchPeople()

      // Initialiser DataTables
      setTimeout(() => {
        initDataTable()
      }, 100)
    } else {
      console.error('Secteur non trouvé:', sectorName.value)
    }
  } catch (err) {
    console.error('Erreur récupération secteur', err)
  } finally {
    isLoading.value = false
  }
}

// ==========================
// Fetch et filtrer les personnes selon le service
// ==========================
async function fetchPeople() {
  try {
    const people = await fetchAllPages(`${API_URL}/people`)

    // Réinitialiser la liste
    allPeople.value = []

    // Vérifier si currentPerson existe
    if (!currentPerson.value) {
      // Pour le débogage, afficher toutes les personnes
      if (LocalisationService.value === 'diocesain') {
        allPeople.value = people.filter((p) => p.isDicoces === true)
      } else {
        allPeople.value = []
      }
      return
    }

    // Filtrage selon le service avec comparaison des IDs extraits
    switch (LocalisationService.value) {
      case 'jeune':
        // Tous les jeunes de la même paroisse
        if (currentPerson.value?.paroisse) {
          const currentParoisseId = extractIdFromUrl(currentPerson.value.paroisse)

          allPeople.value = people.filter((p) => {
            const pParoisseId = extractIdFromUrl(p.paroisse)
            return pParoisseId === currentParoisseId
          })
        }
        break

      case 'paroissial':
        // Noyau paroissial avec même paroisse
        if (currentPerson.value?.paroisse) {
          const currentParoisseId = extractIdFromUrl(currentPerson.value.paroisse)

          allPeople.value = people.filter((p) => {
            const pParoisseId = extractIdFromUrl(p.paroisse)
            return pParoisseId === currentParoisseId && p.isNoyau === true
          })
        }
        break

      case 'decanal':
        // Noyau décanal avec même doyenné
        if (currentPerson.value?.doyenne) {
          const currentDoyenneId = extractIdFromUrl(currentPerson.value.doyenne)

          allPeople.value = people.filter((p) => {
            const pDoyenneId = extractIdFromUrl(p.doyenne)
            return pDoyenneId === currentDoyenneId && p.isDecanal === true
          })
        }
        break

      case 'diocesain':
        // Tous les diocésains
        allPeople.value = people.filter((p) => p.isDicoces === true)
        break
    }
  } catch (err) {
    console.error('Erreur récupération personnes', err)
  }
}

// ==========================
// Computed pour l'affichage avec mapping des IDs
// ==========================
const jeunes = computed(() => {
  return (allPeople.value || []).map((p) => {
    // Extraire les IDs pour la comparaison
    const doyenneId = extractIdFromUrl(p.doyenne)
    const paroisseId = extractIdFromUrl(p.paroisse)

    // Trouver les noms correspondants
    const doyenneObj = allDoyennes.value.find((d) => extractIdFromUrl(d['@id']) === doyenneId)
    const paroisseObj = allParoisses.value.find((pa) => extractIdFromUrl(pa['@id']) === paroisseId)

    return {
      ...p,
      doyenne: doyenneObj?.name || p.doyenne || 'Non défini',
      paroisse: paroisseObj?.name || p.paroisse || 'Non défini',
      nom: p.fullName,
      tel: p.phoneNumber,
    }
  })
})

// ==========================
// Watcher pour recréer DataTables quand les données changent
// ==========================
watch(
  jeunes,
  () => {
    if (!isLoading.value) {
      setTimeout(() => {
        initDataTable()
      }, 100)
    }
  },
  { deep: true },
)

// ==========================
// Actualisation manuelle
// ==========================
async function handleRefresh() {
  destroyDataTable()
  isLoading.value = true
  try {
    await fetchCurrentUser()
    await fetchPeople()
  } finally {
    isLoading.value = false
    setTimeout(() => {
      initDataTable()
    }, 100)
  }
}

// ==========================
// Montage
// ==========================
onMounted(async () => {
  await fetchCurrentUser()
  await fetchSectorId()

  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  destroyDataTable()
  window.removeEventListener('resize', handleResize)
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
              <div class="d-flex align-items-center gap-2">
                <small class="text-muted me-2">{{ jeunes.length }} personne(s) listée(s)</small>
              </div>
            </div>
            <div class="card-body p-2">
              <div class="table-responsive-wrapper">
                <div v-if="isLoading" class="text-center my-5">
                  <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden"></span>
                  </div>
                  <p>Chargement des données...</p>
                </div>
                <div v-else>
                  <div v-if="jeunes.length === 0" class="alert alert-info m-3">
                    <i class="fas fa-info-circle me-2"></i>
                    <span v-if="LocalisationService === 'jeune'">
                      Aucune personne trouvée dans votre paroisse.
                    </span>
                    <span v-else-if="LocalisationService === 'paroissial'">
                      Aucun membre du noyau paroissial trouvé dans votre paroisse.
                    </span>
                    <span v-else-if="LocalisationService === 'decanal'">
                      Aucun membre du noyau décanal trouvé dans votre doyenné.
                    </span>
                    <span v-else-if="LocalisationService === 'diocesain'">
                      Aucun membre diocésain trouvé.
                    </span>
                    <span v-else> Aucune donnée disponible pour ce service. </span>
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
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
            <div class="card-footer text-muted">
              <small>
                <i class="fas fa-info-circle me-1"></i>
                Membre : {{ jeunes.length }} | Dernière actualisation :
                {{ new Date().toLocaleTimeString() }}
              </small>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.card {
  display: flex;
  flex-direction: column;
  min-height: 400px;
}

.card-body {
  flex: 1;
  overflow: hidden;
  padding: 0;
  display: flex;
  flex-direction: column;
}

.table-responsive-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 300px;
}

.table-responsive {
  flex: 1;
  overflow: auto;
  position: relative;
  min-height: 200px;
}

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

.bg-noyau {
  background-color: #e8f5e9 !important;
}

a[href^='tel:'] {
  color: #0d6efd;
  transition: color 0.2s;
}

a[href^='tel:']:hover {
  color: #0a58ca;
  text-decoration: underline !important;
}

.doyenne-column {
  min-width: 150px;
}

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

  .table td,
  .table th {
    font-size: 0.875rem;
    padding: 0.5rem;
  }

  @media (max-width: 360px) {
    .table td,
    .table th {
      font-size: 0.8125rem;
      padding: 0.375rem;
    }
  }
}

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

.table-hover tbody tr:hover {
  background-color: rgba(0, 0, 0, 0.03);
}

@media (min-height: 900px) {
  .table-responsive {
    max-height: 70vh;
  }
}

@media (min-width: 1200px) {
  .table-responsive {
    max-height: 80vh;
  }
}

.card-footer {
  background-color: #f8f9fa;
  border-top: 1px solid #dee2e6;
  padding: 0.5rem 1rem;
}

.alert-info {
  background-color: #e7f3ff;
  border-color: #b3d7ff;
  color: #004085;
}
</style>
