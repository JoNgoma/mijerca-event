<template>
  <div class="dashboard-container">
    <!-- Header -->
    <div class="dashboard-header">
      <div class="header-content">
        <h1 class="page-title">Mijerca Kinshasa</h1>
        <p class="page-subtitle">Vue d'ensemble des secteurs, doyennés et paroisses</p>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="loading-container">
      <div class="spinner"></div>
      <p>Chargement des données...</p>
    </div>

    <!-- Dashboard Grid -->
    <div v-else class="dashboard-grid">
      <!-- Secteur Est -->
      <div class="sector-card">
        <div class="sector-header" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
          <h3>SECTEUR EST</h3>
          <div class="sector-stats">
            <span class="stat-badge">{{ secteurEst.jeunes }} jeunes</span>
          </div>
        </div>
        <div class="sector-body">
          <div class="stat-row">
            <div class="stat-box">
              <div class="stat-icon" style="background-color: #4CAF50;">
                <i class="mdi mdi-globe-alt"></i>
              </div>
              <div class="stat-content">
                <span class="stat-title">Doyennés</span>
                <span class="stat-value">{{ secteurEst.doyennes }}</span>
                <router-link 
                  :to="{ name: 'doyennes-secteur', params: { secteur: 'est' } }" 
                  class="stat-link"
                >
                  Voir détails
                </router-link>
              </div>
            </div>
            <div class="stat-box">
              <div class="stat-icon" style="background-color: #2196F3;">
                <i class="mdi mdi-balance"></i>
              </div>
              <div class="stat-content">
                <span class="stat-title">Paroisses</span>
                <span class="stat-value">{{ secteurEst.paroisses }}</span>
                <router-link 
                  :to="{ name: 'paroisses-secteur', params: { secteur: 'est' } }" 
                  class="stat-link"
                >
                  Voir détails
                </router-link>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Secteur Centre -->
      <div class="sector-card">
        <div class="sector-header" style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);">
          <h3>SECTEUR CENTRE</h3>
          <div class="sector-stats">
            <span class="stat-badge">{{ secteurCentre.jeunes }} jeunes</span>
          </div>
        </div>
        <div class="sector-body">
          <div class="stat-row">
            <div class="stat-box">
              <div class="stat-icon" style="background-color: #FF9800;">
                <i class="mdi mdi-globe-alt"></i>
              </div>
              <div class="stat-content">
                <span class="stat-title">Doyennés</span>
                <span class="stat-value">{{ secteurCentre.doyennes }}</span>
                <router-link 
                  :to="{ name: 'doyennes-secteur', params: { secteur: 'centre' } }" 
                  class="stat-link"
                >
                  Voir détails
                </router-link>
              </div>
            </div>
            <div class="stat-box">
              <div class="stat-icon" style="background-color: #9C27B0;">
                <i class="mdi mdi-balance"></i>
              </div>
              <div class="stat-content">
                <span class="stat-title">Paroisses</span>
                <span class="stat-value">{{ secteurCentre.paroisses }}</span>
                <router-link 
                  :to="{ name: 'paroisses-secteur', params: { secteur: 'centre' } }" 
                  class="stat-link"
                >
                  Voir détails
                </router-link>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Secteur Ouest -->
      <div class="sector-card">
        <div class="sector-header" style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);">
          <h3>SECTEUR OUEST</h3>
          <div class="sector-stats">
            <span class="stat-badge">{{ secteurOuest.jeunes }} jeunes</span>
          </div>
        </div>
        <div class="sector-body">
          <div class="stat-row">
            <div class="stat-box">
              <div class="stat-icon" style="background-color: #E91E63;">
                <i class="mdi mdi-globe-alt"></i>
              </div>
              <div class="stat-content">
                <span class="stat-title">Doyennés</span>
                <span class="stat-value">{{ secteurOuest.doyennes }}</span>
                <router-link 
                  :to="{ name: 'doyennes-secteur', params: { secteur: 'ouest' } }" 
                  class="stat-link"
                >
                  Voir détails
                </router-link>
              </div>
            </div>
            <div class="stat-box">
              <div class="stat-icon" style="background-color: #009688;">
                <i class="mdi mdi-balance"></i>
              </div>
              <div class="stat-content">
                <span class="stat-title">Paroisses</span>
                <span class="stat-value">{{ secteurOuest.paroisses }}</span>
                <router-link 
                  :to="{ name: 'paroisses-secteur', params: { secteur: 'ouest' } }" 
                  class="stat-link"
                >
                  Voir détails
                </router-link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Quick Stats -->
    <div class="quick-stats-section">
      <h2 class="section-title">Statistiques Rapides</h2>
      <div class="quick-stats-grid">
        <div class="quick-stat-card">
          <div class="quick-stat-icon" style="background-color: #FF5722;">
            <i class="mdi mdi-male-female"></i>
          </div>
          <div class="quick-stat-content">
            <h4>Total Jeunes</h4>
            <p class="quick-stat-number">{{ totalJeunes }}</p>
            <p class="quick-stat-desc">Inscrits dans tous les secteurs</p>
          </div>
        </div>
        <div class="quick-stat-card">
          <div class="quick-stat-icon" style="background-color: #3F51B5;">
            <i class="mdi mdi-globe-alt"></i>
          </div>
          <div class="quick-stat-content">
            <h4>Total Doyennés</h4>
            <p class="quick-stat-number">{{ totalDoyennes }}</p>
            <p class="quick-stat-desc">Répartis sur 3 secteurs</p>
          </div>
        </div>
        <div class="quick-stat-card">
          <div class="quick-stat-icon" style="background-color: #4CAF50;">
            <i class="mdi mdi-balance"></i>
          </div>
          <div class="quick-stat-content">
            <h4>Total Paroisses</h4>
            <p class="quick-stat-number">{{ totalParoisses }}</p>
            <p class="quick-stat-desc">Actives et enregistrées</p>
          </div>
        </div>
        <div class="quick-stat-card">
          <div class="quick-stat-icon" style="background-color: #9C27B0;">
            <i class="mdi mdi-equalizer"></i>
          </div>
          <div class="quick-stat-content">
            <h4>Taux de Croissance</h4>
            <p class="quick-stat-number">{{ tauxCroissance }}%</p>
            <p class="quick-stat-desc">Mois en cours</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_BASE_URL

// États
const isLoading = ref(true)
const sectors = ref([])
const doyennes = ref([])
const paroisses = ref([])
const people = ref([])

// Données par secteur
const secteurEst = ref({ jeunes: 0, doyennes: 0, paroisses: 0 })
const secteurCentre = ref({ jeunes: 0, doyennes: 0, paroisses: 0 })
const secteurOuest = ref({ jeunes: 0, doyennes: 0, paroisses: 0 })

// Map des IDs de secteur
const sectorMap = ref({})

// Fonction pour extraire l'ID d'une URL
function extractIdFromUrl(url) {
  if (!url) return null
  // Extraire l'ID de l'URL (ex: "/api/sectors/1" -> "1")
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
      const response = await axios.get(url, {
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
    console.error(`Erreur lors de la récupération de ${endpoint}:`, error)
    return []
  }
}

// Fonction pour compter les personnes par secteur
function countPeopleBySector(peopleData, sectorId) {
  if (!sectorId) return 0
  return peopleData.filter(person => {
    if (!person.sector) return false
    const personSectorId = extractIdFromUrl(person.sector)
    return personSectorId === sectorId
  }).length
}

// Fonction pour compter les doyennés par secteur
function countDoyennesBySector(doyennesData, sectorId) {
  if (!sectorId) return 0
  return doyennesData.filter(doyenne => {
    if (!doyenne.sector) return false
    const doyenneSectorId = extractIdFromUrl(doyenne.sector)
    return doyenneSectorId === sectorId
  }).length
}

// Fonction pour compter les paroisses par secteur
function countParoissesBySector(paroissesData, sectorId) {
  if (!sectorId) return 0
  return paroissesData.filter(paroisse => {
    if (!paroisse.sector) return false
    const paroisseSectorId = extractIdFromUrl(paroisse.sector)
    return paroisseSectorId === sectorId
  }).length
}

// Calculer le taux de croissance mensuel CORRIGÉ
const tauxCroissance = computed(() => {
  if (people.value.length === 0) return 0
  
  // Obtenir la date actuelle
  const now = new Date()
  
  // Mois en cours (du 1er jour du mois jusqu'à aujourd'hui)
  const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1)
  
  // Mois précédent (tout le mois précédent)
  const previousMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  const previousMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999)
  
  // Compter les jeunes créés dans le mois EN COURS
  const currentMonthCount = people.value.filter(person => {
    if (!person.createdAt) return false
    const createdAt = new Date(person.createdAt)
    return createdAt >= currentMonthStart && createdAt <= now
  }).length
  
  // Compter les jeunes créés dans le mois PRÉCÉDENT
  const previousMonthCount = people.value.filter(person => {
    if (!person.createdAt) return false
    const createdAt = new Date(person.createdAt)
    return createdAt >= previousMonthStart && createdAt <= previousMonthEnd
  }).length
  
  // console.log('📈 Calcul croissance:', {
  //   currentMonthStart,
  //   previousMonthStart,
  //   previousMonthEnd,
  //   currentMonthCount,
  //   previousMonthCount
  // })
  
  // Si pas de données le mois précédent
  if (previousMonthCount === 0) {
    // Si on a des inscriptions ce mois-ci, c'est une croissance infinie en %
    return currentMonthCount > 0 ? 100 : 0
  }
  
  // Calculer le pourcentage de croissance
  const growth = ((currentMonthCount - previousMonthCount) / previousMonthCount) * 100
  
  // Arrondir à 1 décimale
  const roundedGrowth = Math.round(growth * 10) / 10
  
  // console.log('📈 Taux croissance:', {
  //   growth,
  //   roundedGrowth,
  //   formula: `(${currentMonthCount} - ${previousMonthCount}) / ${previousMonthCount} * 100`
  // })
  
  return roundedGrowth
})

// Charger toutes les données
async function loadData() {
  try {
    isLoading.value = true
    
    // Charger en parallèle
    const [sectorsData, doyennesData, paroissesData, peopleData] = await Promise.all([
      fetchAllPages('/sectors'),
      fetchAllPages('/doyennes'),
      fetchAllPages('/paroisses'),
      fetchAllPages('/people')
    ])

    sectors.value = sectorsData
    doyennes.value = doyennesData
    paroisses.value = paroissesData
    people.value = peopleData

    // console.log('📊 Données chargées:', {
    //   sectors: sectors.value,
    //   doyennes: doyennes.value,
    //   paroisses: paroisses.value,
    //   people: people.value
    // })

    // Créer une map des secteurs par ID
    sectorsData.forEach(sector => {
      const sectorId = extractIdFromUrl(sector['@id']) || sector.id
      sectorMap.value[sectorId] = {
        name: sector.name,
        id: sectorId
      }
    })

    // Trouver les IDs des secteurs
    const estSector = sectorsData.find(s => s.name === 'KIN EST')
    const centreSector = sectorsData.find(s => s.name === 'KIN CENTRE')
    const ouestSector = sectorsData.find(s => s.name === 'KIN OUEST')

    const estId = estSector ? (extractIdFromUrl(estSector['@id']) || estSector.id) : null
    const centreId = centreSector ? (extractIdFromUrl(centreSector['@id']) || centreSector.id) : null
    const ouestId = ouestSector ? (extractIdFromUrl(ouestSector['@id']) || ouestSector.id) : null

    // console.log('🔍 IDs des secteurs:', { estId, centreId, ouestId })

    // Calculer les statistiques par secteur
    // Secteur Est
    secteurEst.value = {
      jeunes: countPeopleBySector(peopleData, estId),
      doyennes: countDoyennesBySector(doyennesData, estId),
      paroisses: countParoissesBySector(paroissesData, estId)
    }

    // Secteur Centre
    secteurCentre.value = {
      jeunes: countPeopleBySector(peopleData, centreId),
      doyennes: countDoyennesBySector(doyennesData, centreId),
      paroisses: countParoissesBySector(paroissesData, centreId)
    }

    // Secteur Ouest
    secteurOuest.value = {
      jeunes: countPeopleBySector(peopleData, ouestId),
      doyennes: countDoyennesBySector(doyennesData, ouestId),
      paroisses: countParoissesBySector(paroissesData, ouestId)
    }

    // console.log('📈 Statistiques:', {
    //   est: secteurEst.value,
    //   centre: secteurCentre.value,
    //   ouest: secteurOuest.value
    // })

  } catch (error) {
    console.error('❌ Erreur lors du chargement des données:', error)
  } finally {
    isLoading.value = false
  }
}

// Totaux généraux
const totalJeunes = computed(() => secteurEst.value.jeunes + secteurCentre.value.jeunes + secteurOuest.value.jeunes)
const totalDoyennes = computed(() => secteurEst.value.doyennes + secteurCentre.value.doyennes + secteurOuest.value.doyennes)
const totalParoisses = computed(() => secteurEst.value.paroisses + secteurCentre.value.paroisses + secteurOuest.value.paroisses)

// Charger au montage
onMounted(() => {
  loadData()
})
</script>

<style scoped>
.dashboard-container { min-height: 100vh; background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%); padding: 20px; }
.dashboard-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 40px; padding: 30px; background: white; border-radius: 20px; box-shadow: 0 10px 40px rgba(0,0,0,0.1); }
.header-content { flex: 1; }
.page-title { font-size: 2.5rem; font-weight: 800; background: linear-gradient(135deg,#667eea 0%,#764ba2 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; margin-bottom: 10px; }
.page-subtitle { font-size: 1.1rem; color: #666; }
.stats-summary { display: flex; gap: 30px; }
.stat-item { text-align: center; padding: 15px 25px; background: linear-gradient(135deg,#667eea 0%,#764ba2 100%); border-radius: 15px; color: white; box-shadow: 0 5px 15px rgba(102,126,234,0.4); }
.stat-number { display: block; font-size: 2rem; font-weight: 700; line-height: 1; }
.stat-label { font-size: 0.9rem; opacity: 0.9; }
.loading-container { text-align: center; padding: 100px 20px; }
.spinner { width: 60px; height: 60px; border: 5px solid #f3f3f3; border-top: 5px solid #667eea; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 20px; }
@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
.dashboard-grid { display: grid; grid-template-columns: repeat(auto-fit,minmax(350px,1fr)); gap: 30px; margin-bottom: 50px; }
.sector-card { background: white; border-radius: 20px; overflow: hidden; box-shadow: 0 15px 35px rgba(0,0,0,0.1); transition: transform .3s ease, box-shadow .3s ease; }
.sector-card:hover { transform: translateY(-10px); box-shadow: 0 20px 40px rgba(0,0,0,0.15); }
.sector-header { padding: 25px; color: white; position: relative; }
.sector-header h3 { margin: 0; font-size: 1.8rem; font-weight: 700; text-shadow: 0 2px 4px rgba(0,0,0,0.2); }
.sector-stats { position: absolute; top: 25px; right: 25px; }
.stat-badge { background: rgba(255,255,255,0.2); padding: 8px 15px; border-radius: 20px; font-weight: 600; backdrop-filter: blur(10px); }
.sector-body { padding: 25px; }
.stat-row { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
.stat-box { display: flex; align-items: center; gap: 15px; padding: 20px; background: #f8f9fa; border-radius: 15px; transition: all .3s ease; }
.stat-box:hover { background: #e9ecef; transform: translateX(5px); }
.stat-icon { width: 50px; height: 50px; border-radius: 12px; display: flex; align-items: center; justify-content: center; color: white; font-size: 1.5rem; flex-shrink: 0; }
.stat-content { flex: 1; }
.stat-title { display: block; font-size: .9rem; color: #666; margin-bottom: 5px; }
.stat-value { display: block; font-size: 2rem; font-weight: 700; color: #333; line-height: 1; margin-bottom: 10px; }
.stat-link { font-size: .85rem; color: #667eea; text-decoration: none; font-weight: 600; transition: color .3s ease; }
.stat-link:hover { color: #764ba2; text-decoration: underline; }
.quick-stats-section { background: white; border-radius: 20px; padding: 40px; box-shadow: 0 15px 35px rgba(0,0,0,0.1); }
.section-title { font-size: 2rem; font-weight: 700; color: #333; margin-bottom: 30px; text-align: center; }
.quick-stats-grid { display: grid; grid-template-columns: repeat(auto-fit,minmax(250px,1fr)); gap: 25px; }
.quick-stat-card { display: flex; align-items: center; gap: 20px; padding: 25px; background: #f8f9fa; border-radius: 15px; transition: all .3s ease; }
.quick-stat-card:hover { background: #e9ecef; transform: translateY(-5px); }
.quick-stat-icon { width: 60px; height: 60px; border-radius: 15px; display: flex; align-items: center; justify-content: center; color: white; font-size: 1.8rem; flex-shrink: 0; }
.quick-stat-content { flex: 1; }
.quick-stat-content h4 { margin: 0 0 10px 0; color: #333; font-size: 1.2rem; }
.quick-stat-number { font-size: 2.5rem; font-weight: 800; margin: 0; color: #667eea; line-height: 1; }
.quick-stat-desc { margin: 5px 0 0 0; color: #666; font-size: .9rem; }
@media (max-width:768px) {
  .dashboard-header { flex-direction: column; text-align: center; gap: 20px; }
  .stats-summary { width: 100%; justify-content: center; }
  .dashboard-grid { grid-template-columns: 1fr; }
  .stat-row { grid-template-columns: 1fr; }
  .quick-stats-grid { grid-template-columns: 1fr; }
  .page-title { font-size: 2rem; }
}
</style>
