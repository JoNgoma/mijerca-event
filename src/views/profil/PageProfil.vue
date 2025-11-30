<script setup>
import axios from "axios"
import { onMounted, ref, computed, watch } from "vue"
import { useToast } from 'vue-toastification'

const toast = useToast()
const showModal = ref(false)
const isLoading = ref(false)
const isLoadBtn = ref(false)
const error = ref("")

const modalData = ref({
  id: null,
  gender: "",
  fullName: "",
  sector: "",
  doyenne: "",
  paroisse: "",
})

const secs = ref([])
const doys = ref([])
const paros = ref([])
const filteredDoys = ref([])
const filteredParos = ref([])
const users = ref([])

const localisation = ref({
  sector: { name: "Chargement..." },
  doyenne: { name: "Chargement..." },
  paroisse: { name: "Chargement..." },
})

const userData = ref({
  id: null,
  username: "",
  email: "",
  roles: [],
})

const personData = ref({
  id: null,
  fullName: "Chargement...",
  phoneNumber: "Chargement...",
  gender: "",
  isDicoces: false,
  isDecanal: false,
  isNoyau: false,
  createdAt: "Chargement..."
})

const userActivities = ref([])
const API_URL = import.meta.env.VITE_API_BASE_URL

// ==========================
// PAGINATION CORRIGÉE
// ==========================
async function fetchAllPages(baseUrl) {
  let allItems = [], currentPage = 1, hasMore = true
  const token = localStorage.getItem("token")
  
  try {
    while (hasMore) {
      const url = `${baseUrl}${baseUrl.includes('?') ? '&' : '?'}page=${currentPage}`
      const response = await axios.get(url, {
        headers: { 
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/ld+json"
        }
      })
      const data = response.data
      
      if (data.member?.length) {
        allItems = [...allItems, ...data.member]
        if (data.member.length < 30) hasMore = false
        else currentPage++
      } else {
        hasMore = false
      }
    }
    console.log(`📊 ${baseUrl} - ${allItems.length} enregistrements chargés`)
    return allItems
  } catch (error) {
    console.error(`Erreur récupération ${baseUrl}:`, error)
    throw error
  }
}

// Computed property pour regrouper les activités par camp
const groupedActivities = computed(() => {
  const grouped = {}
  
  userActivities.value.forEach(activity => {
    const key = `${activity.campName}_${activity.startDate}_${activity.endDate}`
    
    if (!grouped[key]) {
      grouped[key] = {
        campName: activity.campName,
        theme: activity.theme,
        startDate: activity.startDate,
        endDate: activity.endDate,
        services: []
      }
    }
    
    if (!grouped[key].services.includes(activity.service)) {
      grouped[key].services.push(activity.service)
    }
  })
  
  return Object.values(grouped).sort((a, b) => new Date(b.startDate) - new Date(a.startDate))
})

// Fonctions de formatage de date
const formatFrenchDateTime = (dateString) => {
  if (!dateString) return "Date non disponible"
  try {
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return "Date invalide"
    return `Le ${date.toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} à ${date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', hour12: false })}`
  } catch {
    return "Erreur de date"
  }
}

const formatFrenchDate = (dateString) => {
  if (!dateString) return "Date non disponible"
  try {
    const date = new Date(dateString)
    return isNaN(date.getTime()) ? "Date invalide" : date.toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })
  } catch {
    return "Erreur de date"
  }
}

// Fonction utilitaire pour extraire l'ID
const extractIdFromUrl = (url) => url ? String(url).split('/').filter(Boolean).pop() : null

// Charger les activités utilisateur
async function fetchUserActivities(userId) {
  try {
    const services = [
      { name: 'Administration', endpoint: '/administrations' },
      { name: 'Finance', endpoint: '/finances' },
      { name: 'Hébergement', endpoint: '/hebergements' },
      { name: 'Informatique', endpoint: '/informatiques' }
    ]

    const allActivities = []
    for (const service of services) {
      try {
        const serviceData = await fetchAllPages(`${API_URL}${service.endpoint}`)
        const userServiceRecords = serviceData.filter(record => 
          Array.isArray(record.user) && record.user.some(userUrl => extractIdFromUrl(userUrl) === String(userId))
        )

        for (const record of userServiceRecords) {
          if (record.campBiblic) {
            try {
              const campId = extractIdFromUrl(record.campBiblic)
              const campRes = await axios.get(`${API_URL}/camp_bibliques/${campId}`, {
                headers: { 
                  Authorization: `Bearer ${localStorage.getItem("token")}`,
                  "Content-Type": "application/ld+json"
                }
              })
              const camp = campRes.data
              
              allActivities.push({
                service: service.name,
                campName: camp.name || 'Camp sans nom',
                theme: camp.topic || 'Thème non défini',
                startDate: camp.start,
                endDate: camp.end,
                recordId: record.id
              })
            } catch (campError) {
              console.error(`Erreur camp ${service.name}:`, campError)
            }
          }
        }
      } catch (serviceError) {
        console.error(`Erreur service ${service.name}:`, serviceError)
      }
    }
    userActivities.value = allActivities.sort((a, b) => new Date(b.startDate) - new Date(a.startDate))
  } catch (err) {
    console.error('Erreur chargement activités:', err)
  }
}

// Charger données de localisation et utilisateurs
async function fetchLocationData() {
  try {
    const [secRes, doyRes, parRes, usersRes] = await Promise.all([
      fetchAllPages(`${API_URL}/sectors`),
      fetchAllPages(`${API_URL}/doyennes`),
      fetchAllPages(`${API_URL}/paroisses`),
      fetchAllPages(`${API_URL}/users`)
    ])
    secs.value = secRes
    doys.value = doyRes
    paros.value = parRes
    users.value = usersRes
    
    console.log('📍 Données localisation chargées:', {
      sectors: secRes.length,
      doyennes: doyRes.length,
      paroisses: parRes.length,
      users: usersRes.length
    })
  } catch (error) {
    console.error('Erreur chargement localisation:', error)
    toast.error('Erreur chargement localisations')
  }
}

// Récupérer les détails de localisation d'une personne
async function fetchPersonLocationDetails(person) {
  try {
    const sectorId = extractIdFromUrl(person.sector)
    const doyenneId = extractIdFromUrl(person.doyenne)
    const paroisseId = extractIdFromUrl(person.paroisse)

    // Récupérer les détails depuis les listes déjà chargées
    const sectorDetail = secs.value.find(s => s.id == sectorId) || { name: "Non défini" }
    const doyenneDetail = doys.value.find(d => d.id == doyenneId) || { name: "Non défini" }
    const paroisseDetail = paros.value.find(p => p.id == paroisseId) || { name: "Non défini" }

    return { sector: sectorDetail, doyenne: doyenneDetail, paroisse: paroisseDetail }
  } catch (error) {
    console.error('Erreur récupération détails localisation:', error)
    return {
      sector: { name: "Erreur" },
      doyenne: { name: "Erreur" },
      paroisse: { name: "Erreur" }
    }
  }
}

// Trouver personne par numéro
async function findPersonByPhone(phoneNumber) {
  try {
    const allPeople = await fetchAllPages(`${API_URL}/people`)
    const person = allPeople.find(p => p.phoneNumber === phoneNumber)
    
    if (person) {
      const locationDetails = await fetchPersonLocationDetails(person)
      return { ...person, locationDetails }
    }
    return null
  } catch (error) {
    console.error('Erreur recherche personne:', error)
    toast.error('Erreur recherche profil')
    return null
  }
}

// 🔹 Filtrage doyennés et paroisses (comme dans votre exemple)
function filterDoyennes() {
  const selectedSector = secs.value.find(s => s.id == modalData.value.sector)
  filteredDoys.value = selectedSector
    ? doys.value.filter(d => d.sector === selectedSector["@id"])
    : []
  
  // Réinitialiser les sélections si nécessaire
  if (!filteredDoys.value.some(d => d.id == modalData.value.doyenne)) {
    modalData.value.doyenne = ""
    modalData.value.paroisse = ""
  }
  filterParoisses()
}

function filterParoisses() {
  const selectedDoyenne = filteredDoys.value.find(d => d.id == modalData.value.doyenne)
  filteredParos.value = selectedDoyenne
    ? paros.value.filter(p => p.doyenne === selectedDoyenne["@id"])
    : []
  
  if (!filteredParos.value.some(p => p.id == modalData.value.paroisse)) {
    modalData.value.paroisse = ""
  }
}

// Watchers pour les filtres
watch(() => modalData.value.sector, filterDoyennes)
watch(() => modalData.value.doyenne, filterParoisses)

// Chargement données principales
async function fetchUserData() {
  try {
    isLoading.value = true
    const token = localStorage.getItem("token")
    const username = localStorage.getItem("userPhone")

    if (!token || !username) {
      toast.error('Session invalide')
      window.location.href = "/login"
      return
    }

    // Récupérer TOUS les utilisateurs avec pagination
    const allUsers = await fetchAllPages(`${API_URL}/users`)
    const user = allUsers.find(u => u.username === username)
    
    if (!user) {
      toast.error('Utilisateur non trouvé')
      return
    }

    userData.value = user
    await fetchUserActivities(user.id)
    await fetchLocationData()

    // Charger données personne avec localisation complète
    const person = await findPersonByPhone(username)
    if (person) {
      personData.value = person
      localisation.value = person.locationDetails
    } else {
      personData.value = { ...personData.value, phoneNumber: username, fullName: "Non trouvé" }
    }
  } catch (err) {
    console.error("Erreur chargement:", err)
    toast.error('Erreur chargement profil')
  } finally {
    isLoading.value = false
  }
}

// Chargement données modal
async function loadModalData() {
  try {
    const phoneNumber = localStorage.getItem("userPhone")
    if (!phoneNumber) {
      toast.error('Numéro non trouvé')
      return
    }

    const person = await findPersonByPhone(phoneNumber)
    
    if (person) {
      modalData.value = {
        id: person.id,
        gender: person.gender || "",
        fullName: person.fullName || "",
        sector: extractIdFromUrl(person.sector) || "",
        doyenne: extractIdFromUrl(person.doyenne) || "",
        paroisse: extractIdFromUrl(person.paroisse) || "",
      }
      
      console.log('📝 Données modal chargées:', modalData.value)
      
      // Appliquer les filtres basés sur les données actuelles
      filterDoyennes()
    } else {
      toast.error('Profil non trouvé')
    }
  } catch (error) {
    console.error('Erreur chargement modal:', error)
    toast.error('Erreur chargement données')
  }
}

// Mise à jour personne avec gestion des rôles
async function handleSubmit() {
  isLoadBtn.value = true
  error.value = ""
  
  try {
    const sectorObj = secs.value.find(s => s.id == modalData.value.sector)
    const doyenneObj = doys.value.find(d => d.id == modalData.value.doyenne)
    const paroisseObj = paros.value.find(p => p.id == modalData.value.paroisse)

    const payload = {
      gender: modalData.value.gender,
      fullName: modalData.value.fullName,
      sector: sectorObj ? sectorObj["@id"] : null,
      doyenne: doyenneObj ? doyenneObj["@id"] : null,
      paroisse: paroisseObj ? paroisseObj["@id"] : null,
      updatedAt: new Date().toISOString()
    }

    console.log('📤 Payload de mise à jour:', payload)

    if (modalData.value.id) {
      // Mettre à jour la personne
      await axios.patch(`${API_URL}/people/${modalData.value.id}`, payload, {
        headers: { 
          "Content-Type": "application/merge-patch+json",
          "Accept": "application/ld+json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        }
      })

      // 🔹 Mise à jour des rôles en fonction du secteur (comme dans votre exemple)
      if (sectorObj) {
        let roleToAdd = ""
        
        // Déterminer le rôle en fonction du secteur
        if (sectorObj["@id"] === '/api/sectors/1') roleToAdd = 'ROLE_EST' 
        else if (sectorObj["@id"] === '/api/sectors/2') roleToAdd = 'ROLE_CENTRE'
        else if (sectorObj["@id"] === '/api/sectors/3') roleToAdd = 'ROLE_OUEST'
        
        // Trouver l'utilisateur correspondant
        const phoneNumber = localStorage.getItem("userPhone")
        const roleUsers = users.value.find((u) => u.username === phoneNumber)

        if (roleUsers && roleToAdd) {
          // Filtrer les rôles existants pour enlever les rôles de secteur
          let rolesInit = (roleUsers.roles || []).filter(r => 
            r !== 'ROLE_EST' && r !== 'ROLE_CENTRE' && r !== 'ROLE_OUEST'
          )
          
          // Ajouter le nouveau rôle de secteur
          rolesInit.push(roleToAdd)
          
          // Mettre à jour les rôles de l'utilisateur
          await axios.patch(`${API_URL}/users/${roleUsers.id}`, 
            { roles: rolesInit }, 
            {
              headers: {
                "Content-Type": "application/merge-patch+json",
                "Accept": "application/ld+json",
                "Authorization": `Bearer ${localStorage.getItem("token")}`
              }
            }
          )
          
          console.log('🔐 Rôles utilisateur mis à jour:', rolesInit)
        }
      }

      toast.success("Mise à jour réussie !")
      showModal.value = false
      
      // 🔹 ACTUALISATION AUTOMATIQUE DE LA PAGE
      await fetchUserData() // Recharge les données
      
      // Optionnel : Forcer un re-rendu complet si nécessaire
      // window.location.reload()
      
    }
  } catch (err) {
    console.error("Erreur mise à jour:", err)
    error.value = err.response?.data?.violations?.map(v => `${v.propertyPath}: ${v.message}`).join(", ") || "Erreur mise à jour"
    toast.error("Erreur lors de la mise à jour")
  } finally {
    isLoadBtn.value = false
  }
}

// Fonction pour actualiser manuellement les données
async function refreshData() {
  isLoading.value = true
  try {
    await fetchUserData()
    toast.success("Données actualisées avec succès !")
  } catch (error) {
    console.error("Erreur lors de l'actualisation:", error)
    toast.error("Erreur lors de l'actualisation des données")
  } finally {
    isLoading.value = false
  }
}

// Ouvrir modal
async function openUserModal() {
  await loadModalData()
  showModal.value = true
}

onMounted(fetchUserData)
</script>

<template>
  <div class="be-content">
    <div class="main-content container-fluid">
      <div v-if="isLoading" class="menu-loading d-flex flex-column align-items-center justify-content-center">
        <div class="spinner-border text-primary my-3" role="status"></div>
        <p class="text-muted">Chargement du profil...</p>
      </div>

      <div v-else class="user-profile">
        <!-- Bouton d'actualisation manuel -->
        <div class="row mb-3">
          <div class="col-12">
            <div class="d-flex justify-content-end">
              <button 
                @click="refreshData" 
                class="btn btn-outline-primary btn-sm"
                :disabled="isLoading"
                title="Actualiser les données"
              >
                <i class="fas fa-sync-alt" :class="{ 'fa-spin': isLoading }"></i>
                {{ isLoading ? 'Actualisation...' : 'Actualiser' }}
              </button>
            </div>
          </div>
        </div>

        <div class="row">
          <div class="col-lg-5">
            <div class="user-display">
              <div class="user-display-bg">
                <img src="/assets/img/user-profile-display.png" alt="Profile Background" />
              </div>
              <div class="user-display-bottom">
                <div class="user-display-avatar">
                  <img src="/assets/img/avatar-150.png" alt="Avatar" />
                </div>
                <div class="user-display-info">
                  <div class="name">{{ personData.gender }} {{ personData.fullName }}</div>
                  <div class="nick">
                    <span class="mdi mdi-phone mr-1"></span> {{ personData.phoneNumber }}
                  </div>
                  <div v-if="userData.email" class="nick text-muted">
                    <span class="mdi mdi-email mr-1"></span> {{ userData.email }}
                  </div>
                </div>
                <div class="text-right">
                  <button class="btn btn-space btn-primary" @click="openUserModal()" :disabled="isLoading">
                    <i class="icon icon-left mdi mdi-account-edit"></i>
                    Mettre à jour
                  </button>
                </div>
              </div>
            </div>

            <div class="user-info-list card">
              <div class="card-header card-header-divider">
                À propos de moi
                <span class="card-subtitle">Vous trouverez vos infos ci-dessous</span>
              </div>
              <div class="card-body">
                <table class="no-border no-strip skills">
                  <tbody class="no-border-x no-border-y">
                    <tr>
                      <td class="icon"><span class="mdi mdi-globe-alt"></span></td>
                      <td class="item">Doyenné</td>
                      <td>{{ localisation.doyenne.name }}, {{ localisation.sector.name }}</td>
                    </tr>
                    <tr>
                      <td class="icon"><span class="mdi mdi-pin"></span></td>
                      <td class="item">Paroisse</td>
                      <td>{{ localisation.paroisse.name }}</td>
                    </tr>
                    <tr>
                      <td class="icon"><span class="mdi mdi-case"></span></td>
                      <td class="item">Responsabilité</td>
                      <td>
                        {{
                          personData.isDicoces ? 'Noyau Diocésain' :
                          personData.isDecanal ? 'Noyau Décanal' :
                          personData.isNoyau ? 'Noyau Paroissial' :
                          'Jeune'
                        }}
                      </td>
                    </tr>
                    <tr>
                      <td class="icon"><span class="mdi mdi-smartphone-android"></span></td>
                      <td class="item">Mobile</td>
                      <td>{{ personData.phoneNumber }}</td>
                    </tr>
                    <tr v-if="userData.email">
                      <td class="icon"><span class="mdi mdi-email"></span></td>
                      <td class="item">Email</td>
                      <td>{{ userData.email }}</td>
                    </tr>
                    <tr>
                      <td class="icon"><span class="mdi mdi-cake"></span></td>
                      <td class="item">Inscrit</td>
                      <td>{{ formatFrenchDateTime(personData.createdAt) }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div class="col-lg-7">
            <div class="card">
              <div class="card-header card-header-divider">
                Activités
                <span class="card-subtitle">Les activités auxquelles vous avez participées s'affichent ici</span>
              </div>
              <div class="card-body">
                <div v-if="groupedActivities.length === 0" class="text-center text-muted py-4">
                  <i class="mdi mdi-calendar-blank mdi-48px"></i>
                  <p class="mt-2">Aucune activité trouvée</p>
                </div>
                <ul v-else class="user-timeline">
                  <li v-for="(activity, index) in groupedActivities" :key="`${activity.campName}_${activity.startDate}`" :class="{ latest: index === 0 }">
                    <div class="user-timeline-date">{{ activity.campName }}</div>
                    <div class="user-timeline-title">
                      Du {{ formatFrenchDate(activity.startDate) }} au {{ formatFrenchDate(activity.endDate) }}
                    </div>
                    <div v-if="activity.theme && activity.theme !== 'Thème non défini'" class="user-timeline-theme text-muted">
                      Thème: {{ activity.theme }}
                    </div>
                    <div class="mt-2">
                      <div class="user-timeline-services-label text-muted small mb-1">Services réalisés :</div>
                      <div class="user-timeline-services">
                        <span v-for="service in activity.services" :key="service" class="user-timeline-service-badge">
                          {{ service }}
                        </span>
                      </div>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- MODAL UPDATE PROFIL -->
    <div v-if="showModal" class="modal show" @click.self="showModal = false">
      <div class="modal-dialog modal-dialog-centered modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title text-primary"><b>Mettre à jour mon profil</b></h5>
            <button type="button" class="btn-close" @click="showModal = false"></button>
          </div>
          <div class="">
            <form class="card-body" @submit.prevent="handleSubmit">
              <div class="form-group">
                <label class="d-block mb-2">Genre</label>
                <div class="d-flex">
                  <label class="custom-control custom-radio custom-radio-icon custom-control-inline me-3">
                    <input class="custom-control-input" type="radio" name="radio-icon" value="Soeur" v-model="modalData.gender" />
                    <span class="custom-control-label"><i class="mdi mdi-female"></i></span>
                  </label>
                  <label class="custom-control custom-radio custom-radio-icon custom-control-inline">
                    <input class="custom-control-input" type="radio" name="radio-icon" value="Frère" v-model="modalData.gender" />
                    <span class="custom-control-label"><i class="mdi mdi-male-alt"></i></span>
                  </label>
                </div>
              </div>

              <div class="form-group">
                <label for="inputNames">Noms au complet</label>
                <input id="inputNames" class="form-control" v-model="modalData.fullName" type="text" placeholder="Joe Doe" required />
              </div>

              <div class="form-group">
                <label>Votre secteur</label>
                <select class="form-control" v-model="modalData.sector" required>
                  <option value="" disabled>Sélectionnez un secteur</option>
                  <option v-for="s in secs" :key="s.id" :value="s.id">{{ s.name }}</option>
                </select>
              </div>

              <div class="form-group">
                <label>Votre doyenné</label>
                <select class="form-control" v-model="modalData.doyenne" required :disabled="!modalData.sector">
                  <option value="" disabled>Sélectionnez un doyenné</option>
                  <option v-for="d in filteredDoys" :key="d.id" :value="d.id">{{ d.name }}</option>
                </select>
                <small v-if="!modalData.sector" class="text-muted">Veuillez d'abord sélectionner un secteur</small>
              </div>

              <div class="form-group">
                <label>Votre paroisse</label>
                <select class="form-control" v-model="modalData.paroisse" required :disabled="!modalData.doyenne">
                  <option value="" disabled>Sélectionnez une paroisse</option>
                  <option v-for="p in filteredParos" :key="p.id" :value="p.id">{{ p.name }}</option>
                </select>
                <small v-if="!modalData.doyenne" class="text-muted">Veuillez d'abord sélectionner un doyenné</small>
              </div>

              <div class="form-group">
                <button class="btn btn-block btn-primary btn-xl" type="submit" :disabled="isLoadBtn">
                  <span v-if="isLoadBtn" class="spinner-border spinner-border-sm me-2"></span>
                  {{ isLoadBtn ? 'Mise à jour...' : 'Mettre à jour' }}
                </button>
              </div>
              
              <p v-if="error" class="text-danger text-center mt-2">{{ error }}</p>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.modal.show {
  display: block;
  background: rgba(0, 0, 0, 0.5);
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1050;
}

.user-timeline-services {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.user-timeline-service-badge {
  background-color: #e9ecef;
  color: #495057;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  font-size: 0.875rem;
  border: 1px solid #dee2e6;
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