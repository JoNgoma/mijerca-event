<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue'
import { useServiceContext } from '@/composables/useServiceContext'

const { currentService } = useServiceContext()
const LocalisationService = ref(currentService.value.position)

// Config API
const API_URL = import.meta.env.VITE_API_BASE_URL
const token = localStorage.getItem('token')

// MODIFICATION : Initialiser isLoading à true pour montrer le loading immédiatement
const isLoading = ref(true)

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
// Fonction pour formater les noms en format Kubuku Ngoma Josué
// ==========================
function formatName(name) {
  if (!name) return ''
  
  // Convertir en minuscules d'abord, puis capitaliser chaque mot
  return name
    .toLowerCase()
    .split(' ')
    .map(word => {
      // Gérer les noms avec apostrophe (ex: d')
      if (word.includes("'")) {
        return word.split("'")
          .map(part => part.charAt(0).toUpperCase() + part.slice(1))
          .join("'")
      }
      // Gérer les noms avec tiret (ex: Jean-Pierre)
      if (word.includes('-')) {
        return word.split('-')
          .map(part => part.charAt(0).toUpperCase() + part.slice(1))
          .join('-')
      }
      return word.charAt(0).toUpperCase() + word.slice(1)
    })
    .join(' ')
    .trim()
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
// Initialiser/détruire DataTables OPTIMISÉ - Version améliorée pour mobile
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
      const screenWidth = window.innerWidth
      const isMobile = screenWidth < 768
      const isSmallScreen = screenWidth < 576
      const isVerySmallScreen = screenWidth < 400

      let tableHeight
      if (isVerySmallScreen) {
        tableHeight = Math.max(250, screenHeight * 0.45) + 'px'
      } else if (isSmallScreen) {
        tableHeight = Math.max(300, screenHeight * 0.5) + 'px'
      } else if (isMobile) {
        tableHeight = Math.max(350, screenHeight * 0.6) + 'px'
      } else {
        tableHeight = '60vh'
      }

      // Configuration pour les très petits écrans
      let domConfig
      if (isVerySmallScreen) {
        domConfig = "<'row'<'col-12'l>><'row'<'col-12'f>><'row'<'col-12'tr>><'row'<'col-12'i>><'row'<'col-12'p>>"
      } else if (isSmallScreen) {
        domConfig = "<'row'<'col-12'l>><'row'<'col-12'f>><'row'<'col-12'tr>><'row'<'col-6'i><'col-6'p>>"
      } else {
        domConfig = "<'row'<'col-sm-12 col-md-6'l><'col-sm-12 col-md-6'f>>" +
                   "<'row'<'col-sm-12'tr>>" +
                   "<'row'<'col-sm-12 col-md-5'i><'col-sm-12 col-md-7'p>>"
      }

      dataTable = $(tableElement).DataTable({
        responsive: true,
        pageLength: isSmallScreen ? 10 : 25,
        lengthMenu: [
          [10, 25, 50, 100, -1],
          [10, 25, 50, 100, 'Tous'],
        ],
        language: {
          lengthMenu: isSmallScreen ? '_MENU_' : 'Afficher _MENU_ éléments',
          search: isSmallScreen ? '_INPUT_' : 'Rechercher:',
          searchPlaceholder: isSmallScreen ? 'Recherche...' : '',
          info: 'Affichage de _START_ à _END_ sur _TOTAL_',
          infoEmpty: 'Aucune donnée disponible',
          infoFiltered: '(filtré à partir de _MAX_ entrées)',
          zeroRecords: 'Aucun résultat trouvé',
          paginate: {
            first: isSmallScreen ? '«' : 'Premier',
            last: isSmallScreen ? '»' : 'Dernier',
            next: isSmallScreen ? '›' : 'Suivant',
            previous: isSmallScreen ? '‹' : 'Précédent',
          },
        },
        order: [[0, 'asc']],
        scrollY: tableHeight,
        scrollCollapse: true,
        paging: true,
        scrollX: isMobile,
        deferRender: true,
        processing: true,
        dom: domConfig,
        columnDefs: [
          { responsivePriority: 1, targets: 0 },
          { responsivePriority: 2, targets: 3 },
          { responsivePriority: 3, targets: 2 },
          { responsivePriority: 4, targets: 1 },
          {
            targets: [1],
            visible: !isMobile,
          },
          {
            // Pour les très petits écrans, réduire la largeur de certaines colonnes
            targets: [0, 2, 3],
            width: isVerySmallScreen ? '30%' : null,
          },
        ],
        // Amélioration pour mobile
        responsive: {
          details: {
            display: $.fn.dataTable.Responsive.display.modal({
              header: function (row) {
                var data = row.data();
                return 'Détails de ' + data[0];
              }
            }),
            renderer: isSmallScreen ? 
              $.fn.dataTable.Responsive.renderer.listHidden() :
              $.fn.dataTable.Responsive.renderer.tableAll()
          }
        }
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
// Computed pour l'affichage avec mapping des IDs et formatage des noms
// ==========================
const jeunes = computed(() => {
  const formattedPeople = (allPeople.value || []).map((p) => {
    // Extraire les IDs pour la comparaison
    const doyenneId = extractIdFromUrl(p.doyenne)
    const paroisseId = extractIdFromUrl(p.paroisse)

    // Trouver les noms correspondants
    const doyenneObj = allDoyennes.value.find((d) => extractIdFromUrl(d['@id']) === doyenneId)
    const paroisseObj = allParoisses.value.find((pa) => extractIdFromUrl(pa['@id']) === paroisseId)

    // Formater le nom complet
    const formattedName = formatName(p.fullName || '')
    
    return {
      ...p,
      doyenne: doyenneObj?.name || p.doyenne || 'Non défini',
      paroisse: paroisseObj?.name || p.paroisse || 'Non défini',
      formattedName: formattedName,
      gender: p.gender,
      phoneNumber: p.phoneNumber,
      originalName: p.fullName || '' // Pour le tri
    }
  })

  // Trier par ordre alphabétique (en utilisant le nom original pour le tri)
  return formattedPeople.sort((a, b) => {
    const nameA = (a.originalName || '').toLowerCase()
    const nameB = (b.originalName || '').toLowerCase()
    return nameA.localeCompare(nameB, 'fr', { sensitivity: 'base' })
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
  // Le loading est déjà visible (isLoading.value = true)
  
  // Initialiser la page
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
            <div class="card-header">
              <div class="header-content">
                <span class="page-title">Statistique - {{ nameService }}</span>
                <div class="header-actions">
                  <button 
                    @click="handleRefresh" 
                    class="btn btn-sm btn-outline-primary refresh-btn"
                    :disabled="isLoading"
                  >
                    <i class="fas fa-sync-alt" :class="{ 'fa-spin': isLoading }"></i>
                    <span class="btn-text">Rafraîchir</span>
                  </button>
                </div>
              </div>
            </div>
            <div class="card-body">
              <div class="table-container">
                <!-- Le loading s'affiche maintenant dès le début -->
                <div v-if="isLoading" class="loading-container">
                  <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden"></span>
                  </div>
                  <p class="loading-text">Chargement des données...</p>
                </div>
                <div v-else>
                  <div v-if="jeunes.length === 0" class="empty-state">
                    <div class="empty-icon">
                      <i class="fas fa-info-circle"></i>
                    </div>
                    <div class="empty-text">
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
                      <span v-else>Aucune donnée disponible pour ce service.</span>
                    </div>
                  </div>

                  <div v-else class="datatable-wrapper">
                    <div class="datatable-container">
                      <table class="table table-striped table-hover mobile-optimized" id="table1">
                        <thead>
                          <tr>
                            <th class="name-column">Nom complet</th>
                            <th class="doyenne-column">Doyenné</th>
                            <th class="paroisse-column">Paroisse</th>
                            <th class="phone-column">Téléphone</th>
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
                            <td class="name-column">
                              <span class="person-name">{{ j.gender }} {{ j.formattedName }}</span>
                            </td>
                            <td class="doyenne-column">
                              <span class="doyenne-text">{{ j.doyenne }}</span>
                            </td>
                            <td class="paroisse-column">
                              <span class="paroisse-text">{{ j.paroisse }}</span>
                            </td>
                            <td class="phone-column">
                              <a :href="`tel:${j.phoneNumber}`" class="phone-link">
                                <i class="fas fa-phone-alt phone-icon"></i>
                                <span class="phone-text">{{ j.phoneNumber }}</span>
                              </a>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div class="card-footer">
              <small class="footer-info">
                <i class="fas fa-info-circle me-1"></i>
                <span class="footer-text">
                  <span class="member-count">{{ jeunes.length }}</span> membre(s) | 
                  Dernière actualisation : <span class="update-time">{{ new Date().toLocaleTimeString() }}</span>
                </span>
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
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.card-header {
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-bottom: 1px solid #dee2e6;
  padding: 1rem;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.page-title {
  font-weight: 600;
  font-size: 1.1rem;
  color: #343a40;
}

.header-actions {
  display: flex;
  align-items: center;
}

.refresh-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.375rem 0.75rem;
  border-radius: 6px;
  font-size: 0.875rem;
  transition: all 0.2s ease;
}

.refresh-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(13, 110, 253, 0.2);
}

.refresh-btn:disabled {
  opacity: 0.6;
  transform: none;
  box-shadow: none;
}

.btn-text {
  display: inline;
}

.header-info {
  text-align: center;
  padding-top: 0.5rem;
  border-top: 1px solid #e9ecef;
}

.card-body {
  flex: 1;
  overflow: hidden;
  padding: 0;
  display: flex;
  flex-direction: column;
}

.table-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 300px;
}

.loading-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 3rem 1rem;
}

.loading-container .spinner-border {
  width: 3rem;
  height: 3rem;
  border-width: 0.25rem;
}

.loading-text {
  margin-top: 1rem;
  color: #6c757d;
  font-size: 1rem;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 1rem;
  text-align: center;
}

.empty-icon {
  font-size: 3rem;
  color: #6c757d;
  margin-bottom: 1rem;
  opacity: 0.7;
}

.empty-text {
  color: #6c757d;
  font-size: 1rem;
  max-width: 300px;
}

.datatable-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.datatable-container {
  flex: 1;
  overflow: auto;
  position: relative;
  min-height: 200px;
  width: 100%;
}

.table {
  margin-bottom: 0;
  font-size: 0.9rem;
}

.table th {
  position: sticky;
  top: 0;
  background: #f8f9fa;
  z-index: 10;
  box-shadow: 0 2px 2px -1px rgba(0, 0, 0, 0.1);
  padding: 0.75rem;
  font-weight: 600;
  white-space: nowrap;
  border-bottom: 2px solid #dee2e6;
}

.table td {
  padding: 0.75rem;
  vertical-align: middle;
  border-bottom: 1px solid #e9ecef;
}

.mobile-optimized {
  width: 100% !important;
}

.name-column {
  min-width: 180px;
}

.doyenne-column {
  min-width: 120px;
}

.paroisse-column {
  min-width: 150px;
}

.phone-column {
  min-width: 130px;
}

.bg-noyau {
  background-color: rgba(232, 245, 233, 0.7) !important;
}

.person-name {
  font-weight: 500;
  color: #212529;
}

.doyenne-text, .paroisse-text {
  color: #495057;
}

.phone-link {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #0d6efd;
  text-decoration: none;
  transition: color 0.2s;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  background: rgba(13, 110, 253, 0.05);
}

.phone-link:hover {
  color: #0a58ca;
  background: rgba(13, 110, 253, 0.1);
  text-decoration: none;
}

.phone-icon {
  font-size: 0.875rem;
}

.phone-text {
  font-weight: 500;
}

.card-footer {
  background: #f8f9fa;
  border-top: 1px solid #dee2e6;
  padding: 0.75rem 1rem;
  text-align: center;
}

.footer-info {
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6c757d;
  font-size: 0.875rem;
}

.footer-text {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
  justify-content: center;
}

.member-count {
  font-weight: 600;
  color: #495057;
}

.update-time {
  font-weight: 500;
  color: #495057;
}

/* Styles pour les contrôles DataTables */
:deep(.dataTables_wrapper) {
  width: 100%;
  font-size: 0.875rem;
}

:deep(.dataTables_length),
:deep(.dataTables_filter),
:deep(.dataTables_info),
:deep(.dataTables_paginate) {
  padding: 0.75rem 1rem;
  background: #f8f9fa;
  border-top: 1px solid #e9ecef;
}

:deep(.dataTables_length label),
:deep(.dataTables_filter label) {
  display: flex;
  align-items: center;
  margin-bottom: 0;
  font-weight: 500;
  color: #495057;
}

:deep(.dataTables_length select) {
  border: 1px solid #ced4da;
  border-radius: 6px;
  padding: 0.375rem 0.75rem;
  margin: 0 0.5rem;
  background: white;
  font-size: 0.875rem;
  min-width: 80px;
}

:deep(.dataTables_filter input) {
  border: 1px solid #ced4da;
  border-radius: 6px;
  padding: 0.375rem 0.75rem;
  margin-left: 0.5rem;
  background: white;
  font-size: 0.875rem;
  min-width: 180px;
}

:deep(.dataTables_info) {
  color: #6c757d;
  font-size: 0.875rem;
}

:deep(.dataTables_paginate) {
  display: flex;
  justify-content: center;
  gap: 0.25rem;
}

:deep(.paginate_button) {
  padding: 0.375rem 0.75rem;
  border: 1px solid #dee2e6;
  border-radius: 6px;
  background: white;
  color: #0d6efd;
  cursor: pointer;
  text-decoration: none;
  font-size: 0.875rem;
  transition: all 0.2s;
  min-width: 36px;
  text-align: center;
}

:deep(.paginate_button:hover) {
  background: #e9ecef;
  color: #0a58ca;
  transform: translateY(-1px);
}

:deep(.paginate_button.current) {
  background: #0d6efd;
  color: white !important;
  border-color: #0d6efd;
  font-weight: 600;
}

:deep(.paginate_button.disabled) {
  color: #adb5bd;
  cursor: not-allowed;
  background: #f8f9fa;
  border-color: #e9ecef;
}

/* Améliorations pour les très petits écrans */
@media (max-width: 400px) {
  .card-header {
    padding: 0.75rem;
  }
  
  .header-content {
    flex-direction: column;
    align-items: stretch;
    gap: 0.75rem;
  }
  
  .page-title {
    font-size: 1rem;
    text-align: center;
  }
  
  .header-actions {
    justify-content: center;
  }
  
  .refresh-btn {
    width: 100%;
    justify-content: center;
    padding: 0.5rem;
  }
  
  .btn-text {
    display: inline;
  }
  
  .header-info {
    font-size: 0.875rem;
  }
  
  .table th,
  .table td {
    padding: 0.5rem 0.375rem;
    font-size: 0.8125rem;
  }
  
  .name-column {
    min-width: 140px;
  }
  
  .paroisse-column {
    min-width: 120px;
  }
  
  .phone-column {
    min-width: 110px;
  }
  
  .phone-link {
    padding: 0.25rem;
    gap: 0.25rem;
  }
  
  .phone-icon {
    font-size: 0.75rem;
  }
  
  .phone-text {
    font-size: 0.8125rem;
  }
  
  :deep(.dataTables_length select),
  :deep(.dataTables_filter input) {
    width: 100%;
    margin: 0.25rem 0;
  }
  
  :deep(.dataTables_length),
  :deep(.dataTables_filter) {
    width: 100%;
    text-align: center;
  }
  
  :deep(.dataTables_length label),
  :deep(.dataTables_filter label) {
    flex-direction: column;
    align-items: center;
  }
  
  .footer-info {
    flex-direction: column;
    gap: 0.25rem;
  }
  
  .footer-text {
    flex-direction: column;
    gap: 0.25rem;
  }
}

/* Améliorations pour les petits écrans (576px - 768px) */
@media (max-width: 768px) {
  .card {
    border-radius: 8px;
    margin: 0.5rem;
    min-height: 350px;
  }
  
  .header-content {
    flex-direction: row;
  }
  
  .page-title {
    font-size: 1rem;
  }
  
  .refresh-btn {
    padding: 0.375rem 0.5rem;
  }
  
  .btn-text {
    display: inline;
  }
  
  .table th,
  .table td {
    padding: 0.5rem;
    font-size: 0.8125rem;
  }
  
  .doyenne-column {
    display: none;
  }
  
  .name-column {
    min-width: 160px;
  }
  
  .paroisse-column {
    min-width: 130px;
  }
  
  .phone-column {
    min-width: 120px;
  }
  
  .phone-link {
    flex-direction: column;
    gap: 0.25rem;
    padding: 0.375rem;
    text-align: center;
  }
  
  .phone-icon {
    font-size: 0.8125rem;
  }
  
  :deep(.dataTables_length),
  :deep(.dataTables_filter) {
    width: 100%;
    text-align: center;
    padding: 0.5rem;
  }
  
  :deep(.dataTables_length label),
  :deep(.dataTables_filter label) {
    flex-direction: column;
    align-items: center;
    gap: 0.25rem;
  }
  
  :deep(.dataTables_length select),
  :deep(.dataTables_filter input) {
    width: 100%;
    max-width: 200px;
    margin: 0.25rem 0;
  }
  
  :deep(.dataTables_info) {
    width: 100%;
    text-align: center;
    padding: 0.5rem;
  }
  
  :deep(.dataTables_paginate) {
    width: 100%;
    flex-wrap: wrap;
    gap: 0.125rem;
    padding: 0.5rem;
  }
  
  :deep(.paginate_button) {
    padding: 0.25rem 0.5rem;
    font-size: 0.8125rem;
    min-width: 32px;
  }
  
  .footer-info {
    font-size: 0.8125rem;
  }
}

/* Améliorations pour les écrans moyens (768px - 992px) */
@media (min-width: 768px) and (max-width: 992px) {
  .card {
    margin: 0.75rem;
  }
  
  .table th,
  .table td {
    padding: 0.625rem;
    font-size: 0.875rem;
  }
  
  :deep(.dataTables_length select),
  :deep(.dataTables_filter input) {
    width: 150px;
  }
}

/* Améliorations pour les grands écrans */
@media (min-width: 992px) {
  .datatable-container {
    /* max-height: 100vh; */
  }
  
  .table th {
    font-size: 0.875rem;
  }
  
  .table td {
    font-size: 0.9rem;
  }
}

/* Styles pour les lignes au survol */
.table-hover tbody tr:hover {
  background-color: rgba(0, 0, 0, 0.03);
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: all 0.2s ease;
}

/* Animation pour le spinner */
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

/* Amélioration de l'accessibilité */
@media (prefers-reduced-motion: reduce) {
  .refresh-btn:hover,
  .phone-link:hover,
  .table-hover tbody tr:hover,
  :deep(.paginate_button:hover) {
    transform: none;
    transition: none;
  }
}
</style>

<style>
/* Styles globaux pour DataTables - Mobile Optimized */
.dataTables_wrapper {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
}

.dataTables_wrapper .dataTables_length,
.dataTables_wrapper .dataTables_filter,
.dataTables_wrapper .dataTables_info,
.dataTables_wrapper .dataTables_paginate {
  font-size: 0.875rem;
}

.dataTables_wrapper .dataTables_filter input {
  border: 1px solid #ced4da !important;
  border-radius: 6px !important;
  padding: 0.375rem 0.75rem !important;
  font-size: 0.875rem !important;
  background: white !important;
}

.dataTables_wrapper .dataTables_length select {
  border: 1px solid #ced4da !important;
  border-radius: 6px !important;
  padding: 0.375rem 0.75rem !important;
  font-size: 0.875rem !important;
  background: white !important;
}

.dataTables_wrapper .dataTables_paginate .paginate_button {
  border: 1px solid #dee2e6 !important;
  border-radius: 6px !important;
  padding: 0.375rem 0.75rem !important;
  font-size: 0.875rem !important;
  background: white !important;
  color: #0d6efd !important;
  margin: 0 0.125rem !important;
}

.dataTables_wrapper .dataTables_paginate .paginate_button.current {
  background: #0d6efd !important;
  color: white !important;
  border-color: #0d6efd !important;
}

.dataTables_wrapper .dataTables_paginate .paginate_button:hover {
  background: #e9ecef !important;
  color: #0a58ca !important;
}

.dataTables_wrapper .dataTables_paginate .paginate_button.disabled,
.dataTables_wrapper .dataTables_paginate .paginate_button.disabled:hover,
.dataTables_wrapper .dataTables_paginate .paginate_button.disabled:active {
  color: #adb5bd !important;
  background: #f8f9fa !important;
  border-color: #e9ecef !important;
  cursor: not-allowed !important;
}

/* Améliorations pour les très petits écrans */
@media (max-width: 400px) {
  .dataTables_wrapper .dataTables_length,
  .dataTables_wrapper .dataTables_filter,
  .dataTables_wrapper .dataTables_info,
  .dataTables_wrapper .dataTables_paginate {
    padding: 0.5rem !important;
  }
  
  .dataTables_wrapper .dataTables_length select,
  .dataTables_wrapper .dataTables_filter input {
    width: 100% !important;
    max-width: none !important;
    font-size: 0.8125rem !important;
    padding: 0.375rem !important;
  }
  
  .dataTables_wrapper .dataTables_paginate .paginate_button {
    padding: 0.25rem 0.5rem !important;
    font-size: 0.8125rem !important;
    min-width: 32px !important;
    margin: 0.0625rem !important;
  }
}

/* Améliorations pour les petits écrans */
@media (max-width: 768px) {
  .dataTables_wrapper .dataTables_length,
  .dataTables_wrapper .dataTables_filter,
  .dataTables_wrapper .dataTables_info,
  .dataTables_wrapper .dataTables_paginate {
    padding: 0.75rem !important;
  }
  
  .dataTables_wrapper .dataTables_paginate {
    display: flex !important;
    flex-wrap: wrap !important;
    justify-content: center !important;
    gap: 0.25rem !important;
  }
}
</style>