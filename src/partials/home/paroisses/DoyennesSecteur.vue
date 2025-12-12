<!-- src/views/doyennes/DoyennesSecteur.vue -->
<template>
  <div class="doyennes-container">
    <!-- Header avec bouton retour -->
    <div class="page-header">
      <div class="header-content">
        <button @click="goBack" class="back-button">
          <i class="mdi mdi-arrow-left"></i>
          Retour
        </button>
        <h1 class="page-title">Doyennés du Secteur {{ secteurName }}</h1>
        <p class="page-subtitle">Liste complète des doyennés avec leurs statistiques</p>
      </div>
      
      <div class="header-stats">
        <div class="header-stat" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
          <span class="stat-icon">
            <i class="mdi mdi-globe-alt"></i>
          </span>
          <div class="stat-content">
            <span class="stat-number">{{ filteredDoyennes.length }}</span>
            <span class="stat-label">Doyennés</span>
          </div>
        </div>
        <div class="header-stat" style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);">
          <span class="stat-icon">
            <i class="mdi mdi-balance"></i>
          </span>
          <div class="stat-content">
            <span class="stat-number">{{ totalParoisses }}</span>
            <span class="stat-label">Paroisses</span>
          </div>
        </div>
        <div class="header-stat" style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);">
          <span class="stat-icon">
            <i class="mdi mdi-accounts-list"></i>
          </span>
          <div class="stat-content">
            <span class="stat-number">{{ noyauxDecanaux }}</span>
            <span class="stat-label">Noyaux décanaux</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="loading-container">
      <div class="loading-content">
        <div class="spinner"></div>
        <p>Chargement des données...</p>
      </div>
    </div>

    <!-- Main Content -->
    <div v-else class="main-content">
      <!-- Doyennés Grid -->
      <div class="doyennes-grid">
        <div v-for="doyenne in filteredDoyennes" :key="doyenne.id" class="doyenne-card">
          <div class="doyenne-header">
            <div class="doyenne-title">
              <h3>Doyenné {{ doyenne.name }}</h3>
              <p class="sector-name">Secteur {{ secteurName }}</p>
            </div>
          </div>
          
          <div class="doyenne-stats">
            <div class="stat-item">
              <div class="stat-icon-small">
                <i class="mdi mdi-balance"></i>
              </div>
              <div class="stat-details">
                <span class="stat-number">{{ countParoissesByDoyenne(doyenne['@id']) }}</span>
                <span class="stat-label">Paroisses</span>
              </div>
            </div>
            <div class="stat-item">
              <div class="stat-icon-small">
                <i class="mdi mdi-male-female"></i>
              </div>
              <div class="stat-details">
                <span class="stat-number">{{ countJeunesByDoyenne(doyenne['@id']) }}</span>
                <span class="stat-label">Jeunes</span>
              </div>
            </div>
            <div class="stat-item">
              <div class="stat-icon-small">
                <i class="mdi mdi-accounts-list"></i>
              </div>
              <div class="stat-details">
                <span class="stat-number">{{ countNoyauxByDoyenne(doyenne['@id']) }}</span>
                <span class="stat-label">Noyaux décanaux</span>
              </div>
            </div>
          </div>
          
          <div class="doyenne-actions">
            <button class="action-btn view-btn" @click="viewDoyenneParoisses(doyenne)">
              <i class="mdi mdi-eye"></i>
              <span>Voir les paroisses</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-if="filteredDoyennes.length === 0" class="empty-state">
        <div class="empty-icon">
          <i class="mdi mdi-domain-off"></i>
        </div>
        <h3>Aucun doyenné trouvé</h3>
        <p>Aucun doyenné n'est enregistré pour le secteur {{ secteurName }}</p>
        <button @click="goBack" class="back-home-btn">
          <i class="mdi mdi-arrow-left"></i>
          Retour aux secteurs
        </button>
      </div>
    </div>

    <!-- Modal pour afficher les paroisses du doyenné -->
    <div v-if="showParoissesModal" class="modal-overlay" @click="closeParoissesModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h2 class="modal-title">
            <i class="mdi mdi-church modal-icon"></i>
            Doyenné {{ selectedDoyenne?.name || '' }}
          </h2>
          <button class="modal-close-btn" @click="closeParoissesModal">
            <i class="mdi mdi-close"></i>
          </button>
        </div>
        
        <div class="modal-body">
          <div v-if="isLoadingParoisses" class="modal-loading">
            <div class="spinner"></div>
            <p>Chargement des paroisses...</p>
          </div>
          
          <div v-else>
            <div v-if="doyenneParoisses.length === 0" class="no-responsables">
              <i class="mdi mdi-church-off no-data-icon"></i>
              <h3>Aucune paroisse</h3>
              <p>Aucune paroisse n'est enregistrée pour ce doyenné.</p>
            </div>
            
            <div v-else class="paroisses-modal-list">
              <div v-for="paroisse in doyenneParoisses" :key="paroisse.id" class="paroisse-modal-item">
                <div class="paroisse-modal-header">
                  <div class="paroisse-modal-avatar">
                    <i class="mdi mdi-balance"></i>
                  </div>
                  <div class="paroisse-modal-info">
                    <h4>
                      {{ paroisse.name }}
                    </h4>
                    <p class="paroisse-modal-stats">
                      <span class="stat-chunk">
                        <i class="mdi mdi-male-female"></i>
                        {{ countJeunesByParoisse(paroisse['@id']) }} jeunes
                      </span>
                      <span class="stat-chunk">
                        <i class="mdi mdi-accounts-list"></i>
                        {{ countNoyauxByParoisse(paroisse['@id']) }} noyaux
                      </span>
                    </p>
                  </div>
                </div>
                
                <div class="paroisse-modal-actions">
                  <!-- <button class="modal-action-btn" @click="viewParoisseDetails(paroisse)">
                    <i class="mdi mdi-eye"></i>
                    Voir détails
                  </button> -->
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="modal-footer">
          <button class="modal-btn modal-close" @click="closeParoissesModal">
            Fermer
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import axios from 'axios'

const route = useRoute()
const router = useRouter()
const API_URL = import.meta.env.VITE_API_BASE_URL

const isLoading = ref(true)
const doyennes = ref([])
const paroisses = ref([])
const people = ref([])
const sectors = ref([])

// Variables pour le modal des paroisses
const showParoissesModal = ref(false)
const selectedDoyenne = ref(null)
const doyenneParoisses = ref([])
const isLoadingParoisses = ref(false)

const secteur = computed(() => route.params.secteur)
const secteurName = computed(() => {
  switch(secteur.value) {
    case 'est': return 'EST'
    case 'centre': return 'CENTRE'
    case 'ouest': return 'OUEST'
    default: return secteur.value.toUpperCase()
  }
})

// Fonction pour extraire l'ID d'une URL
function extractIdFromUrl(url) {
  if (!url) return null
  const parts = url.split('/')
  return parts[parts.length - 1]
}

// Fonction pour récupérer toutes les pages
async function fetchAllPages(endpoint) {
  let allItems = []
  let currentPage = 1
  let hasMore = true

  try {
    while (hasMore) {
      const url = `${API_URL}${endpoint}${endpoint.includes('?') ? '&' : '?'}page=${currentPage}`
      const response = await axios.get(url)

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
    console.error(`Erreur récupération ${endpoint}:`, error)
    return []
  }
}

async function fetchData() {
  try {
    const [doyennesData, paroissesData, peopleData, sectorsData] = await Promise.all([
      fetchAllPages('/doyennes'),
      fetchAllPages('/paroisses'),
      fetchAllPages('/people'),
      fetchAllPages('/sectors')
    ])
    
    doyennes.value = doyennesData
    paroisses.value = paroissesData
    people.value = peopleData
    sectors.value = sectorsData

  } catch (error) {
    console.error('❌ Erreur:', error)
  } finally {
    isLoading.value = false
  }
}

// Trouver le secteur correspondant
const currentSector = computed(() => {
  const sectorNameMap = {
    'est': 'KIN EST',
    'centre': 'KIN CENTRE', 
    'ouest': 'KIN OUEST'
  }
  
  const targetName = sectorNameMap[secteur.value]
  if (!targetName) return null
  
  return sectors.value.find(s => s.name === targetName)
})

// Filtrer doyennés par secteur
const filteredDoyennes = computed(() => {
  if (!currentSector.value) return []
  
  const sectorId = extractIdFromUrl(currentSector.value['@id']) || currentSector.value.id
  
  return doyennes.value.filter(d => {
    if (!d.sector) return false

    let doyenneSectorId = null
    
    if (typeof d.sector === 'string') {
      doyenneSectorId = extractIdFromUrl(d.sector)
    } else if (d.sector['@id']) {
      doyenneSectorId = extractIdFromUrl(d.sector['@id'])
    } else if (d.sector.id) {
      doyenneSectorId = d.sector.id
    }

    return doyenneSectorId === sectorId
  })
})

// Compter paroisses par doyenné
function countParoissesByDoyenne(doyenneId) {
  const doyenneIdClean = extractIdFromUrl(doyenneId)
  return paroisses.value.filter(p => {
    if (!p.doyenne) return false
    const pDoyenneId = extractIdFromUrl(p.doyenne)
    return pDoyenneId === doyenneIdClean
  }).length
}

// Compter jeunes par doyenné
function countJeunesByDoyenne(doyenneId) {
  const doyenneIdClean = extractIdFromUrl(doyenneId)
  return people.value.filter(p => {
    if (!p.doyenne) return false
    const pDoyenneId = extractIdFromUrl(p.doyenne)
    return pDoyenneId === doyenneIdClean
  }).length
}

// Compter noyaux décanaux par doyenné
function countNoyauxByDoyenne(doyenneId) {
  const doyenneIdClean = extractIdFromUrl(doyenneId)
  return people.value.filter(p => {
    if (!p.doyenne) return false
    const pDoyenneId = extractIdFromUrl(p.doyenne)
    return pDoyenneId === doyenneIdClean && p.isDecanal
  }).length
}

// Compter les jeunes par paroisse
function countJeunesByParoisse(paroisseId) {
  const paroisseIdClean = extractIdFromUrl(paroisseId)
  return people.value.filter(p => {
    if (!p.paroisse) return false
    const pParoisseId = extractIdFromUrl(p.paroisse)
    return pParoisseId === paroisseIdClean
  }).length
}

// Compter les noyaux par paroisse
function countNoyauxByParoisse(paroisseId) {
  const paroisseIdClean = extractIdFromUrl(paroisseId)
  return people.value.filter(p => {
    if (!p.paroisse) return false
    const pParoisseId = extractIdFromUrl(p.paroisse)
    return pParoisseId === paroisseIdClean && p.isNoyau
  }).length
}

// Récupérer les paroisses d'un doyenné
async function fetchParoissesForDoyenne(doyenne) {
  isLoadingParoisses.value = true
  
  try {
    const doyenneId = extractIdFromUrl(doyenne['@id']) || doyenne.id
    
    // Filtrer les paroisses de ce doyenné
    const paroissesList = paroisses.value.filter(paroisse => {
      if (!paroisse.doyenne) return false
      const paroisseDoyenneId = extractIdFromUrl(paroisse.doyenne)
      return paroisseDoyenneId === doyenneId
    })
    
    // Trier par ordre alphabétique
    paroissesList.sort((a, b) => {
      const nameA = (a.name || '').toLowerCase()
      const nameB = (b.name || '').toLowerCase()
      return nameA.localeCompare(nameB, 'fr', { sensitivity: 'base' })
    })
    
    doyenneParoisses.value = paroissesList
  } catch (error) {
    console.error('Erreur lors du chargement des paroisses:', error)
    doyenneParoisses.value = []
  } finally {
    isLoadingParoisses.value = false
  }
}

// Afficher le modal des paroisses du doyenné
function viewDoyenneParoisses(doyenne) {
  
  // 1. Fermer si déjà ouvert (nettoyage)
  showParoissesModal.value = false;
  
  // 2. Réinitialiser les données
  selectedDoyenne.value = doyenne;
  doyenneParoisses.value = [];
  isLoadingParoisses.value = true;
  
  // 3. Petit délai pour laisser le DOM se mettre à jour
  setTimeout(() => {
    // 4. Ouvrir le modal
    showParoissesModal.value = true;
    
    // 5. Charger les paroisses
    fetchParoissesForDoyenne(doyenne);
  }, 10);
}

// Fermer le modal des paroisses
function closeParoissesModal() {
  showParoissesModal.value = false
  selectedDoyenne.value = null
  doyenneParoisses.value = []
}

// Statistiques
const totalParoisses = computed(() => {
  return filteredDoyennes.value.reduce((total, doyenne) => {
    return total + countParoissesByDoyenne(doyenne['@id'])
  }, 0)
})

const noyauxDecanaux = computed(() => {
  return filteredDoyennes.value.reduce((total, doyenne) => {
    return total + countNoyauxByDoyenne(doyenne['@id'])
  }, 0)
})

// Navigation
function goBack() {
  router.push('/paroisses')
}

onMounted(() => {
  fetchData()
})
</script>

<style scoped>
.doyennes-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  padding: 20px;
  position: relative;
  overflow: visible !important;
}

/* Header */
.page-header {
  background: white;
  border-radius: 20px;
  padding: 30px;
  margin-bottom: 30px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.header-content {
  flex: 1;
}

.back-button {
  background: none;
  border: none;
  color: #667eea;
  font-size: 16px;
  cursor: pointer;
  padding: 10px 20px;
  border-radius: 10px;
  display: inline-flex;
  align-items: center;
  gap: 10px;
  transition: all 0.3s ease;
  margin-bottom: 20px;
}

.back-button:hover {
  background: rgba(102, 126, 234, 0.1);
  transform: translateX(-5px);
}

.page-title {
  font-size: 2.5rem;
  font-weight: 800;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin-bottom: 10px;
}

.page-subtitle {
  font-size: 1.1rem;
  color: #666;
  max-width: 600px;
}

.header-stats {
  display: flex;
  flex-direction: column;
  gap: 15px;
  min-width: 250px;
}

.header-stat {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 20px;
  border-radius: 15px;
  color: white;
  min-width: 200px;
}

.stat-icon {
  font-size: 2rem;
  opacity: 0.9;
}

.stat-content {
  display: flex;
  flex-direction: column;
}

.stat-number {
  font-size: 2.2rem;
  font-weight: 700;
  line-height: 1;
}

.stat-label {
  font-size: 0.9rem;
  opacity: 0.9;
}

/* Loading */
.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 60vh;
}

.loading-content {
  text-align: center;
}

.spinner {
  width: 60px;
  height: 60px;
  border: 5px solid #f3f3f3;
  border-top: 5px solid #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 20px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Doyennés Grid */
.doyennes-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: 25px;
}

.doyenne-card {
  background: white;
  border-radius: 20px;
  padding: 25px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  border: 1px solid #e9ecef;
}

.doyenne-card:hover {
  transform: translateY(-10px);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
}

.doyenne-header {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 25px;
  padding-bottom: 20px;
  border-bottom: 2px solid #f8f9fa;
}

.doyenne-icon {
  width: 60px;
  height: 60px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 15px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.8rem;
}

.doyenne-title h3 {
  margin: 0;
  font-size: 1.5rem;
  color: #333;
  font-weight: 700;
}

.sector-name {
  margin: 5px 0 0 0;
  color: #666;
  font-size: 0.95rem;
}

.doyenne-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 15px;
  margin-bottom: 25px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 12px;
}

.stat-icon-small {
  width: 40px;
  height: 40px;
  background: rgba(102, 126, 234, 0.1);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #667eea;
  font-size: 1.2rem;
}

.stat-details {
  display: flex;
  flex-direction: column;
}

.stat-details .stat-number {
  font-size: 1.6rem;
  font-weight: 700;
  color: #333;
  line-height: 1;
}

.stat-details .stat-label {
  font-size: 0.85rem;
  color: #666;
  margin-top: 5px;
}

.doyenne-actions {
  display: flex;
  gap: 15px;
}

.action-btn {
  flex: 1;
  padding: 12px 20px;
  border: none;
  border-radius: 12px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  transition: all 0.3s ease;
}

.view-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.view-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 80px 20px;
  background: white;
  border-radius: 20px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
}

.empty-icon {
  width: 100px;
  height: 100px;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 30px;
  font-size: 3rem;
  color: #667eea;
}

.empty-state h3 {
  font-size: 2rem;
  color: #333;
  margin-bottom: 15px;
}

.empty-state p {
  color: #666;
  font-size: 1.1rem;
  max-width: 500px;
  margin: 0 auto 30px;
}

.back-home-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 15px 30px;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 10px;
  transition: all 0.3s ease;
}

.back-home-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 20px rgba(102, 126, 234, 0.3);
}

/* ============================================= */
/* MODAL STYLES POUR LES PAROISSES */
/* ============================================= */

.modal-overlay {
  position: fixed !important;
  top: 0 !important;
  left: 0 !important;
  right: 0 !important;
  bottom: 0 !important;
  background: rgba(0, 0, 0, 0.85) !important;
  display: flex !important;
  justify-content: center;
  align-items: center;
  z-index: 999999 !important;
  padding: 20px;
  opacity: 1 !important;
  visibility: visible !important;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.modal-content {
  background: white;
  border-radius: 20px;
  width: 100%;
  max-width: 600px;
  max-height: 85vh;
  overflow-y: auto;
  box-shadow: 0 30px 80px rgba(0, 0, 0, 0.6);
  position: relative;
  animation: modalSlideUp 0.3s ease;
  transform: translateY(0) !important;
}

@keyframes modalSlideUp {
  from {
    opacity: 0;
    transform: translateY(50px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.modal-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 25px 30px;
  border-radius: 20px 20px 0 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: sticky;
  top: 0;
  z-index: 10;
}

.modal-title {
  margin: 0;
  font-size: 1.8rem;
  display: flex;
  align-items: center;
  gap: 15px;
}

.modal-icon {
  font-size: 2rem;
}

.modal-close-btn {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: white;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  flex-shrink: 0;
}

.modal-close-btn:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: rotate(90deg);
}

.modal-body {
  padding: 30px;
}

.modal-loading {
  text-align: center;
  padding: 40px 0;
}

.modal-loading .spinner {
  width: 50px;
  height: 50px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 20px;
}

.no-responsables {
  text-align: center;
  padding: 40px 20px;
}

.no-data-icon {
  font-size: 4rem;
  color: #ccc;
  margin-bottom: 20px;
}

.no-responsables h3 {
  color: #666;
  margin-bottom: 10px;
}

.no-responsables p {
  color: #999;
}

.paroisses-modal-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.paroisse-modal-item {
  background: #f8f9fa;
  border-radius: 15px;
  padding: 20px;
  border: 1px solid #e9ecef;
  transition: all 0.3s ease;
}

.paroisse-modal-item:hover {
  background: #f1f3f5;
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
}

.paroisse-modal-header {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 15px;
}

.paroisse-modal-avatar {
  width: 50px;
  height: 50px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.5rem;
  flex-shrink: 0;
}

.paroisse-modal-info h4 {
  margin: 0 0 8px 0;
  color: #333;
  font-size: 1.2rem;
  font-weight: 600;
}

.paroisse-modal-stats {
  margin: 0;
  color: #666;
  font-size: 0.9rem;
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
}

.stat-chunk {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 4px 10px;
  background: rgba(102, 126, 234, 0.1);
  border-radius: 20px;
  font-size: 0.85rem;
}

.stat-chunk i {
  font-size: 0.9rem;
  color: #667eea;
}

.paroisse-modal-actions {
  display: flex;
  justify-content: flex-end;
}

.modal-action-btn {
  background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  transition: all 0.3s ease;
}

.modal-action-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(67, 233, 123, 0.3);
}

.modal-footer {
  padding: 20px 30px;
  border-top: 1px solid #e9ecef;
  display: flex;
  justify-content: flex-end;
  position: sticky;
  bottom: 0;
  background: white;
  border-radius: 0 0 20px 20px;
}

.modal-btn {
  padding: 10px 25px;
  border: none;
  border-radius: 10px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.modal-close {
  background: #667eea;
  color: white;
}

.modal-close:hover {
  background: #5a6fd8;
  transform: translateY(-2px);
}

/* ============================================= */
/* RESPONSIVE STYLES */
/* ============================================= */

@media (max-width: 1024px) {
  .page-header {
    flex-direction: column;
    gap: 30px;
  }
  
  .header-stats {
    flex-direction: row;
    width: 100%;
    justify-content: center;
  }
  
  .doyennes-grid {
    grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  }
}

/* Modification pour la responsive entre 768px et 968px */
@media (max-width: 1020px) and (min-width: 769px) {
  .doyenne-stats {
    grid-template-columns: 1fr;
    gap: 12px;
  }
  
  .stat-item {
    justify-content: flex-start;
    padding: 12px;
  }
}

/* Ou si vous voulez que ce soit en colonne en dessous de 968px (y compris mobile) */
@media (max-width: 968px) {
  .doyenne-stats {
    grid-template-columns: 1fr;
    gap: 12px;
  }
  
  .stat-item {
    justify-content: flex-start;
    padding: 12px;
  }
}

@media (max-width: 768px) {
  .doyennes-grid {
    grid-template-columns: 1fr;
  }
  
  .page-title {
    font-size: 2rem;
  }
  
  .header-stat {
    min-width: 160px;
    padding: 15px;
  }
  
  .header-stat .stat-number {
    font-size: 1.8rem;
  }
  
  .doyenne-stats {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .modal-content {
    max-width: 95%;
    max-height: 90vh;
  }
  
  .modal-header {
    padding: 20px;
  }
  
  .modal-title {
    font-size: 1.5rem;
  }
  
  .modal-body {
    padding: 20px;
  }
}

@media (max-width: 480px) {
  .doyennes-container {
    padding: 15px;
  }
  
  .page-header {
    padding: 20px;
  }
  
  .header-stats {
    flex-direction: column;
    gap: 10px;
  }
  
  .header-stat {
    width: 100%;
    justify-content: flex-start;
  }
  
  .doyenne-stats {
    grid-template-columns: 1fr;
  }
  
  .stat-icon {
    font-size: 1.5rem;
  }
  
  .stat-number {
    font-size: 1.5rem;
  }
  
  .stat-label {
    font-size: 0.8rem;
  }
  
  .modal-content {
    max-width: 100%;
    border-radius: 15px;
    max-height: 95vh;
  }
  
  .modal-overlay {
    padding: 10px;
  }
  
  .paroisse-modal-stats {
    flex-direction: column;
    gap: 8px;
  }
  
  .paroisse-modal-header {
    flex-direction: column;
    text-align: center;
    gap: 10px;
  }
  
  .paroisse-modal-avatar {
    width: 40px;
    height: 40px;
    font-size: 1.2rem;
  }
}

@media (max-width: 360px) {
  .doyenne-card {
    padding: 20px;
  }
  
  .doyenne-header {
    flex-direction: column;
    text-align: center;
    gap: 15px;
  }
  
  .doyenne-icon {
    width: 50px;
    height: 50px;
    font-size: 1.5rem;
  }
  
  .modal-title {
    font-size: 1.3rem;
  }
}
</style>