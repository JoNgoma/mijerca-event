<template>
  <div class="paroisses-container">
    <!-- Header avec bouton retour -->
    <div class="page-header">
      <div class="header-content">
        <button @click="goBack" class="back-button">
          <i class="mdi mdi-arrow-left"></i>
          Retour
        </button>
        <h1 class="page-title">Paroisses du Secteur {{ secteurName }}</h1>
        <p class="page-subtitle">Liste complète des paroisses avec leurs statistiques</p>
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
      <!-- Stats Cards -->
      <div class="stats-grid">
        <div class="stat-card" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
          <div class="stat-icon">
            <i class="mdi mdi-globe-alt"></i>
          </div>
          <div class="stat-info">
            <h3>{{ doyennesCount }}</h3>
            <p>Doyennés</p>
          </div>
        </div>
        <div class="stat-card" style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);">
          <div class="stat-icon">
            <i class="mdi mdi-balance"></i>
          </div>
          <div class="stat-info">
            <h3>{{ filteredParoisses.length }}</h3>
            <p>Paroisses</p>
          </div>
        </div>
        <div class="header-stats">
          <div class="header-stat" style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);">
            <span class="stat-icon">
              <i class="mdi mdi-accounts-list"></i>
            </span>
            <div class="stat-content">
              <span class="stat-number">{{ noyauxCount }}</span>
              <span class="stat-label">Noyaux</span>
            </div>
          </div>
          <div class="header-stat" style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);">
            <span class="stat-icon">
              <i class="mdi mdi-male-female"></i>
            </span>
            <div class="stat-content">
              <span class="stat-number">{{ totalJeunes }}</span>
              <span class="stat-label">Jeunes</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Paroisses Grid -->
      <div class="paroisses-grid">
        <div v-for="paroisse in filteredParoisses" :key="paroisse.id" class="paroisse-card">
          <div class="paroisse-header">
            <div class="paroisse-title">
              <h3>{{ paroisse.name }}</h3>
              <p class="doyenne-name">Doyenné {{ getDoyenneName(paroisse.doyenne) }}</p>
            </div>
          </div>
          
          <div class="paroisse-stats">
            <div class="stat-item">
              <div class="stat-icon-small">
                <i class="mdi mdi-male-female"></i>
              </div>
              <div class="stat-details">
                <span class="stat-number">{{ countJeunesByParoisse(paroisse['@id']) }}</span>
                <span class="stat-label">Jeunes</span>
              </div>
            </div>
            <div class="stat-item">
              <div class="stat-icon-small">
                <i class="mdi mdi-accounts-list"></i>
              </div>
              <div class="stat-details">
                <span class="stat-number">{{ countNoyauxByParoisse(paroisse['@id']) }}</span>
                <span class="stat-label">Noyaux</span>
              </div>
            </div>
          </div>
          
          <div class="paroisse-actions">
            <button class="action-btn view-btn" @click="showResponsablesModal(paroisse)">
              <i class="mdi mdi-eye"></i>
              <span>Voir les membres</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-if="filteredParoisses.length === 0" class="empty-state">
        <div class="empty-icon">
          <i class="mdi mdi-church"></i>
        </div>
        <h3>Aucune paroisse trouvée</h3>
        <p>Aucune paroisse n'est enregistrée pour le secteur {{ secteurName }}</p>
        <button @click="goBack" class="back-home-btn">
          <i class="mdi mdi-arrow-left"></i>
          Retour aux secteurs
        </button>
      </div>
    </div>

    <!-- Modal pour afficher les responsables - CORRIGÉ -->
    <div v-if="showModal" class="modal-overlay" @click="closeModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h2 class="modal-title">
            <i class="mdi mdi-account-group modal-icon"></i>
            {{ selectedParoisse?.name || '' }}
          </h2>
          <button class="modal-close-btn" @click="closeModal">
            <i class="mdi mdi-close"></i>
          </button>
        </div>
        
        <div class="modal-body">
          <div v-if="isLoadingResponsables" class="modal-loading">
            <div class="spinner"></div>
            <p>Chargement des responsables...</p>
          </div>
          
          <div v-else>
            <div v-if="paroisseResponsables.length === 0" class="no-responsables">
              <i class="mdi mdi-account-off no-data-icon"></i>
              <h3>Aucun responsable</h3>
              <p>Aucun responsable n'est assigné à cette paroisse.</p>
            </div>
            
            <div v-else class="responsables-list">
              <div v-for="responsable in paroisseResponsables" :key="responsable.id" class="responsable-item">
                <div class="responsable-header">
                  <div class="responsable-avatar">
                    <i class="mdi" :class="getGenderIcon(responsable.gender)"></i>
                  </div>
                  <div class="responsable-info">
                    <h4>
                      {{ getGenderPrefix(responsable.gender) }} {{ formatName(responsable.fullName) }}
                    </h4>
                    <p class="responsable-phone">
                      <i class="mdi mdi-phone"></i>
                      {{ formatPhoneNumber(responsable.phoneNumber) }}
                    </p>
                  </div>
                </div>
                
                <div class="responsable-roles">
                  <div class="role-badges">
                    <span v-if="responsable.isDicoces" class="role-badge badge-diocesain">
                      <i class="mdi mdi-crown"></i>
                      Responsable diocésain
                    </span>
                    <span v-else-if="responsable.isDecanal" class="role-badge badge-decanal">
                      <i class="mdi mdi-account-tie"></i>
                      Responsable décanal
                    </span>
                    <span v-else-if="responsable.isNoyau" class="role-badge badge-decanal">
                      <i class="mdi mdi-account-tie"></i>
                      Responsable paroissial
                    </span>
                    <span v-else class="role-badge badge-paroissial">
                      <i class="mdi mdi-church"></i>
                      Jeune
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="modal-footer">
          <button class="modal-btn modal-close" @click="closeModal">
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
const isLoadingResponsables = ref(false)
const showModal = ref(false)
const sectors = ref([])
const paroisses = ref([])
const doyennes = ref([])
const people = ref([])
const users = ref([])
const selectedParoisse = ref(null)
const paroisseResponsables = ref([])

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

// Fonction pour formater le numéro de téléphone
function formatPhoneNumber(phoneNumber) {
  if (!phoneNumber || phoneNumber === 'Non spécifié') {
    return 'Non spécifié';
  }
  
  // Nettoyer le numéro (enlever espaces, tirets, etc.)
  const cleaned = phoneNumber.toString().replace(/\D/g, '');
  
  // Si le numéro fait 10 chiffres (format congolais: 0891234567)
  if (cleaned.length === 10) {
    // Prendre les 6 premiers chiffres et masquer les 4 derniers
    const visiblePart = cleaned.substring(0, 6);
    const maskedPart = '****';
    
    // Formater avec des espaces: 089 846 ****
    return `${visiblePart.substring(0, 3)} ${visiblePart.substring(3)} ${maskedPart}`;
  }
  
  // Si le numéro fait 9 chiffres (format alternatif: 891234567)
  if (cleaned.length === 9) {
    const visiblePart = cleaned.substring(0, 5);
    const maskedPart = '****';
    return `0${visiblePart.substring(0, 2)} ${visiblePart.substring(2)} ${maskedPart}`;
  }
  
  // Pour d'autres formats, masquer la fin
  if (cleaned.length > 4) {
    const visiblePart = cleaned.substring(0, cleaned.length - 4);
    const maskedPart = '****';
    
    // Essayer de formater avec des espaces tous les 3 chiffres
    let formatted = '';
    for (let i = 0; i < visiblePart.length; i++) {
      if (i > 0 && i % 3 === 0) {
        formatted += ' ';
      }
      formatted += visiblePart[i];
    }
    
    return `${formatted} ${maskedPart}`;
  }
  
  // Si trop court, retourner tel quel
  return phoneNumber;
}

// Fonction pour formater le nom avec majuscules appropriées (version améliorée)
function formatName(fullName) {
  if (!fullName || typeof fullName !== 'string') return ''
  
  // Nettoyer les espaces multiples
  const cleanName = fullName.trim().replace(/\s+/g, ' ')
  
  // Liste des particules à garder en minuscule (ajustez selon vos besoins)
  const particules = ['de', 'du', 'des', 'le', 'la', 'van', 'von', 'di', 'da', 'del', 'della']
  
  // Séparer le nom en mots
  const words = cleanName.split(' ')
  
  // Formater chaque mot
  const formattedWords = words.map((word, index) => {
    // Si le mot est vide, le sauter
    if (!word) return ''
    
    const lowerWord = word.toLowerCase()
    
    // Garder les particules en minuscule (sauf en première position)
    if (index > 0 && particules.includes(lowerWord)) {
      return lowerWord
    }
    
    // Gérer les noms avec tiret: JEAN-PAUL → Jean-Paul
    if (word.includes('-')) {
      const hyphenParts = word.split('-')
      const formattedHyphenParts = hyphenParts.map(part => {
        const lowerPart = part.toLowerCase()
        return lowerPart.charAt(0).toUpperCase() + lowerPart.slice(1)
      })
      return formattedHyphenParts.join('-')
    }
    
    // Cas normal: première lettre majuscule, reste minuscule
    return lowerWord.charAt(0).toUpperCase() + lowerWord.slice(1)
  })
  
  return formattedWords.filter(word => word !== '').join(' ')
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
    const [sectorsData, paroissesData, doyennesData, peopleData, usersData] = await Promise.all([
      fetchAllPages('/sectors'),
      fetchAllPages('/paroisses'),
      fetchAllPages('/doyennes'),
      fetchAllPages('/people'),
      fetchAllPages('/users')
    ])
    
    sectors.value = sectorsData
    paroisses.value = paroissesData
    doyennes.value = doyennesData
    people.value = peopleData
    users.value = usersData

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

// Filtrer paroisses par secteur
// Filtrer et trier paroisses par secteur (triées par ordre alphabétique)
const filteredParoisses = computed(() => {
  if (!currentSector.value) return []

  const sectorId = extractIdFromUrl(currentSector.value['@id']) || currentSector.value.id
  
  // Filtrer les paroisses du secteur
  const paroissesDuSecteur = paroisses.value.filter(p => {
    if (!p.sector) return false

    let paroisseSectorId = null
    
    if (typeof p.sector === 'string') {
      paroisseSectorId = extractIdFromUrl(p.sector)
    } else if (p.sector['@id']) {
      paroisseSectorId = extractIdFromUrl(p.sector['@id'])
    } else if (p.sector.id) {
      paroisseSectorId = p.sector.id
    }

    return paroisseSectorId === sectorId
  })
  
  // Trier par ordre alphabétique
  return paroissesDuSecteur.sort((a, b) => {
    const nameA = (a.name || '').toLowerCase()
    const nameB = (b.name || '').toLowerCase()
    return nameA.localeCompare(nameB, 'fr', { sensitivity: 'base' })
  })
})

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

// Nom du doyenné
function getDoyenneName(doyenneId) {
  if (!doyenneId) return 'Non spécifié'
  
  const doyenneIdClean = extractIdFromUrl(doyenneId)
  const doyenne = doyennes.value.find(d => {
    const dId = extractIdFromUrl(d['@id']) || d.id
    return dId === doyenneIdClean
  })
  
  return doyenne ? doyenne.name : 'Non spécifié'
}

// Récupérer les responsables d'une paroisse (triés par ordre alphabétique avec gestion des accents)
async function fetchResponsablesForParoisse(paroisse) {
  isLoadingResponsables.value = true
  selectedParoisse.value = paroisse
  
  try {
    const paroisseId = extractIdFromUrl(paroisse['@id']) || paroisse.id
    
    // Filtrer les personnes de cette paroisse
    const responsables = people.value.filter(person => {
      if (!person.paroisse) return false
      const personParoisseId = extractIdFromUrl(person.paroisse)
      return personParoisseId === paroisseId
    })
    
    // Fonction pour normaliser les caractères (enlever les accents)
    const normalizeString = (str) => {
      return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
    }
    
    // Trier par ordre alphabétique
    const responsablesTries = responsables.sort((a, b) => {
      const nomA = normalizeString(a.fullName || '')
      const nomB = normalizeString(b.fullName || '')
      return nomA.localeCompare(nomB, 'fr')
    })
    
    paroisseResponsables.value = responsablesTries
  } catch (error) {
    console.error('Erreur lors du chargement des responsables:', error)
    paroisseResponsables.value = []
  } finally {
    isLoadingResponsables.value = false
  }
}

// Afficher le modal des responsables - CORRIGÉ
function showResponsablesModal(paroisse) {
  // 1. D'abord fermer si déjà ouvert (nettoyage)
  showModal.value = false;
  
  // 2. Réinitialiser les données
  selectedParoisse.value = paroisse;
  paroisseResponsables.value = [];
  isLoadingResponsables.value = true;
  
  // 3. Petit délai pour laisser le DOM se mettre à jour
  setTimeout(() => {
    // 4. Ouvrir le modal
    showModal.value = true;
    
    // 5. Charger les données
    fetchResponsablesForParoisse(paroisse);
  }, 10);
}

// Fermer le modal
function closeModal() {
  showModal.value = false
  selectedParoisse.value = null
  paroisseResponsables.value = []
}

// Obtenir le préfixe selon le genre
function getGenderPrefix(gender) {
  if (!gender) return ''
  
  const genderLower = gender.toLowerCase()
  if (genderLower.includes('frère') || genderLower.includes('fr') || genderLower === 'male') {
    return 'Frère'
  } else if (genderLower.includes('soeur') || genderLower.includes('sr') || genderLower === 'female') {
    return 'Soeur'
  }
  return ''
}

// Obtenir l'icône selon le genre
function getGenderIcon(gender) {
  if (!gender) return 'mdi-account'
  
  const genderLower = gender.toLowerCase()
  if (genderLower.includes('frère') || genderLower.includes('fr') || genderLower === 'male') {
    return 'mdi-mood'
  } else if (genderLower.includes('soeur') || genderLower.includes('sr') || genderLower === 'female') {
    return 'mdi-face'
  }
  return 'mdi-mood-bad'
}

// Statistiques
const totalJeunes = computed(() => {
  return filteredParoisses.value.reduce((total, paroisse) => {
    return total + countJeunesByParoisse(paroisse['@id'])
  }, 0)
})

const doyennesCount = computed(() => {
  const doyenneIds = new Set()
  filteredParoisses.value.forEach(p => {
    if (p.doyenne) {
      const doyenneId = extractIdFromUrl(p.doyenne)
      if (doyenneId) doyenneIds.add(doyenneId)
    }
  })
  return doyenneIds.size
})

const noyauxCount = computed(() => {
  return filteredParoisses.value.reduce((total, paroisse) => {
    return total + countNoyauxByParoisse(paroisse['@id'])
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
.paroisses-container {
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
  gap: 30px;
}

.header-stat {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 15px;
  color: white;
  min-width: 180px;
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

/* Stats Grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 40px;
}

.stat-card {
  border-radius: 20px;
  padding: 30px;
  color: white;
  display: flex;
  align-items: center;
  gap: 20px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  transition: transform 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-5px);
}

.stat-card .stat-icon {
  font-size: 3rem;
  opacity: 0.8;
}

.stat-info h3 {
  font-size: 2.5rem;
  font-weight: 800;
  margin: 0;
  line-height: 1;
}

.stat-info p {
  margin: 5px 0 0 0;
  opacity: 0.9;
  font-size: 1rem;
}

/* Paroisses Grid */
.paroisses-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 25px;
}

.paroisse-card {
  background: white;
  border-radius: 20px;
  padding: 25px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  border: 1px solid #e9ecef;
}

.paroisse-card:hover {
  transform: translateY(-10px);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
}

.paroisse-header {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 25px;
  padding-bottom: 20px;
  border-bottom: 2px solid #f8f9fa;
}

.paroisse-icon {
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

.paroisse-title h3 {
  margin: 0;
  font-size: 1.5rem;
  color: #333;
  font-weight: 700;
}

.doyenne-name {
  margin: 5px 0 0 0;
  color: #666;
  font-size: 0.95rem;
}

.paroisse-stats {
  display: flex;
  gap: 20px;
  margin-bottom: 25px;
}

.stat-item {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 15px;
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
  font-size: 1.8rem;
  font-weight: 700;
  color: #333;
  line-height: 1;
}

.stat-details .stat-label {
  font-size: 0.85rem;
  color: #666;
  margin-top: 5px;
}

.paroisse-actions {
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
/* MODAL STYLES - CORRIGÉS POUR L'AFFICHAGE */
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
  z-index: 999999 !important; /* TRÈS ÉLEVÉ */
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
  border-width: 4px;
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

.responsables-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.responsable-item {
  background: #f8f9fa;
  border-radius: 15px;
  padding: 20px;
  border: 1px solid #e9ecef;
}

.responsable-header {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 15px;
}

.responsable-avatar {
  width: 50px;
  height: 50px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.5rem;
}

.responsable-info h4 {
  margin: 0 0 5px 0;
  color: #333;
  font-size: 1.2rem;
}

.responsable-phone {
  margin: 0;
  color: #666;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 5px;
}

.responsable-roles {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.role-badge {
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: 5px;
}

.role-badge i {
  font-size: 0.9rem;
}

.badge-diocesain {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  color: white;
}

.badge-decanal {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  color: white;
}

.badge-paroissial {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.badge-noyau {
  background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
  color: white;
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
  
  .header-stat {
    flex: 1;
    padding: 12px;
    min-width: 0;
  }
  
  .paroisses-grid {
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  }
}

@media (max-width: 968px) {
  .stats-grid {
    grid-template-columns: 2fr;
  }

  .header-stats {
    width: 100%;
    justify-content: center;
  }

  .header-stat {
    min-width: 140px;
    padding: 15px;
  }

  .header-stat .stat-number {
    font-size: 1.8rem;
  }

  .header-stat {
    flex: 1;
    padding: 12px;
    min-width: 0;
  }
}

@media (max-width: 768px) {
  .paroisses-grid {
    grid-template-columns: 1fr;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .page-title {
    font-size: 2rem;
  }
  
  .header-stat {
    min-width: 140px;
    padding: 15px;
  }
  
  .header-stat .stat-number {
    font-size: 1.8rem;
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
  .header-stats {
    display: flex;
    flex-direction: row;
    gap: 8px;
    width: 100%;
  }
  
  .header-stat {
    flex: 1;
    padding: 12px;
    min-width: 0;
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
}

@media (max-width: 360px) {
  .header-stats {
    flex-direction: column;
    gap: 10px;
  }
  
  .header-stat {
    width: 100%;
    justify-content: center;
  }
  
  .responsable-header {
    flex-direction: column;
    text-align: center;
  }
  
  .modal-title {
    font-size: 1.3rem;
  }
}
</style>