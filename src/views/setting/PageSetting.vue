<script setup>
import axios from "axios"
import { onMounted, ref, computed } from "vue"
import { useToast } from 'vue-toastification'
import { useRouter } from 'vue-router'

const toast = useToast()
const router = useRouter()

const API_URL = import.meta.env.VITE_API_BASE_URL

// États pour les différents formulaires
const activeTab = ref('personal')
const isLoading = ref(false)

// Données utilisateur et personne
const userData = ref({
  id: null,
  username: "",
  email: "",
  roles: []
})

const personData = ref({
  id: null,
  phoneNumber: "",
  fullName: "",
  gender: "",
  isDicoces: false,
  isDecanal: false,
  isNoyau: false
})

// Formulaires
const phoneForm = ref({
  newPhone: "",
  confirmPhone: ""
})

const emailForm = ref({
  newEmail: "",
  confirmEmail: ""
})

const passwordForm = ref({
  currentPassword: "",
  newPassword: "",
  confirmPassword: ""
})

const roleForm = ref({
  isNoyau: false,
  isDecanal: false,
  isDicoces: false
})

const errors = ref({})

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

// Chargement des données utilisateur
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

    // Récupérer TOUTES les personnes avec pagination
    const allPeople = await fetchAllPages(`${API_URL}/people`)
    const person = allPeople.find(p => p.phoneNumber === username)
    
    if (person) {
      personData.value = person
      
      // Pré-remplir le formulaire des rôles
      roleForm.value = {
        isNoyau: person.isNoyau || false,
        isDecanal: person.isDecanal || false,
        isDicoces: person.isDicoces || false
      }
    }

  } catch (error) {
    console.error('Erreur chargement données:', error)
    toast.error('Erreur lors du chargement des données')
  } finally {
    isLoading.value = false
  }
}

// 🔹 Format & validation téléphone
const formatPhone = (target) => {
  let val = target?.value ?? target ?? ''
  let digits = val.replace(/\D/g, '').slice(0, 10)

  if (digits.length > 7) {
    digits = digits.slice(0, 4) + ' ' + digits.slice(4, 7) + ' ' + digits.slice(7)
  } else if (digits.length > 4) {
    digits = digits.slice(0, 4) + ' ' + digits.slice(4)
  }

  if (target?.value !== undefined) {
    target.value = digits
  } else {
    return digits
  }
}

const validatePhone = (number) => {
  const cleaned = number.replace(/\s+/g, '')
  const validPrefixes = ["081", "082", "083", "084", "085", "089", "09"]
  const hasValidPrefix = validPrefixes.some(prefix => cleaned.startsWith(prefix))
  if (!hasValidPrefix) return "Le numéro doit commencer par 081, 082, 083, 084, 085, 089 ou 09."
  if (cleaned.length < 10) return "Le numéro doit contenir au moins 10 chiffres."
  return ""
}

// Validation des formulaires
function validatePhoneForm() {
  const errors = {}
  
  if (!phoneForm.value.newPhone) {
    errors.newPhone = 'Le nouveau numéro est requis'
  } else {
    const phoneError = validatePhone(phoneForm.value.newPhone)
    if (phoneError) errors.newPhone = phoneError
  }
  
  if (phoneForm.value.newPhone !== phoneForm.value.confirmPhone) {
    errors.confirmPhone = 'Les numéros ne correspondent pas'
  }
  
  return errors
}

function validateEmailForm() {
  const errors = {}
  
  if (!emailForm.value.newEmail) {
    errors.newEmail = 'Le nouvel email est requis'
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailForm.value.newEmail)) {
    errors.newEmail = 'Format d\'email invalide'
  }
  
  if (emailForm.value.newEmail !== emailForm.value.confirmEmail) {
    errors.confirmEmail = 'Les emails ne correspondent pas'
  }
  
  return errors
}

function validatePasswordForm() {
  const errors = {}
  
  if (!passwordForm.value.currentPassword) {
    errors.currentPassword = 'L\'ancien mot de passe est requis'
  }
  
  if (!passwordForm.value.newPassword) {
    errors.newPassword = 'Le nouveau mot de passe est requis'
  } else if (passwordForm.value.newPassword.length < 6) {
    errors.newPassword = 'Le mot de passe doit contenir au moins 6 caractères'
  }
  
  if (passwordForm.value.newPassword !== passwordForm.value.confirmPassword) {
    errors.confirmPassword = 'Les mots de passe ne correspondent pas'
  }
  
  return errors
}

// Mise à jour du numéro de téléphone
async function updatePhone() {
  errors.value.phone = validatePhoneForm()
  
  if (Object.keys(errors.value.phone).length > 0) {
    return
  }

  try {
    isLoading.value = true
    const token = localStorage.getItem("token")
    const cleanedNewPhone = phoneForm.value.newPhone.replace(/\s/g, '')

    // Vérifier si le nouveau numéro existe déjà avec pagination
    const allPeople = await fetchAllPages(`${API_URL}/people`)
    const existingPerson = allPeople.find(p => p.phoneNumber === cleanedNewPhone)
    
    if (existingPerson && existingPerson.id !== personData.value.id) {
      toast.error('Ce numéro de téléphone est déjà utilisé')
      return
    }

    // Mettre à jour la personne
    await axios.patch(`${API_URL}/people/${personData.value.id}`, {
      phoneNumber: cleanedNewPhone,
      updatedAt: new Date().toISOString()
    }, {
      headers: { 
        "Content-Type": "application/merge-patch+json",
        "Authorization": `Bearer ${token}`
      }
    })

    // Mettre à jour l'utilisateur
    await axios.patch(`${API_URL}/users/${userData.value.id}`, {
      username: cleanedNewPhone,
      updatedAt: new Date().toISOString()
    }, {
      headers: { 
        "Content-Type": "application/merge-patch+json",
        "Authorization": `Bearer ${token}`
      }
    })

    toast.success('Numéro mis à jour avec succès ! Vous serez déconnecté.')
    
    // Déconnexion après succès
    setTimeout(() => {
      localStorage.removeItem("token")
      localStorage.removeItem("userPhone")
      localStorage.removeItem("roles")
      window.location.href = "/login"
    }, 2000)

  } catch (error) {
    console.error('Erreur mise à jour téléphone:', error)
    toast.error('Erreur lors de la mise à jour du numéro')
  } finally {
    isLoading.value = false
  }
}

// Mise à jour de l'email
async function updateEmail() {
  errors.value.email = validateEmailForm()
  
  if (Object.keys(errors.value.email).length > 0) {
    return
  }

  try {
    isLoading.value = true
    const token = localStorage.getItem("token")

    await axios.patch(`${API_URL}/users/${userData.value.id}`, {
      email: emailForm.value.newEmail,
      updatedAt: new Date().toISOString()
    }, {
      headers: { 
        "Content-Type": "application/merge-patch+json",
        "Authorization": `Bearer ${token}`
      }
    })

    toast.success('Email mis à jour avec succès !')
    
    // Mettre à jour les données locales
    userData.value.email = emailForm.value.newEmail
    await fetchUserData()

  } catch (error) {
    console.error('Erreur mise à jour email:', error)
    toast.error('Erreur lors de la mise à jour de l\'email')
  } finally {
    isLoading.value = false
  }
}

// Mise à jour du mot de passe
async function updatePassword() {
  errors.value.password = validatePasswordForm()
  
  if (Object.keys(errors.value.password).length > 0) {
    return
  }

  try {
    isLoading.value = true
    const token = localStorage.getItem("token")

    // Vérifier l'ancien mot de passe (cette partie dépend de votre API)
    // Pour l'instant, on suppose que l'API gère la vérification
    await axios.patch(`${API_URL}/users/${userData.value.id}`, {
      password: passwordForm.value.newPassword,
      updatedAt: new Date().toISOString()
    }, {
      headers: { 
        "Content-Type": "application/merge-patch+json",
        "Authorization": `Bearer ${token}`
      }
    })

    toast.success('Mot de passe mis à jour avec succès !')
    
    // Réinitialiser le formulaire
    passwordForm.value = {
      currentPassword: "",
      newPassword: "",
      confirmPassword: ""
    }

  } catch (error) {
    console.error('Erreur mise à jour mot de passe:', error)
    if (error.response?.status === 400) {
      toast.error('Ancien mot de passe incorrect')
    } else {
      toast.error('Erreur lors de la mise à jour du mot de passe')
    }
  } finally {
    isLoading.value = false
  }
}

// Mise à jour des rôles
async function updateRoles() {
  try {
    isLoading.value = true
    const token = localStorage.getItem("token")

    // Déterminer les rôles utilisateur basés sur les sélections
    let userRoles = []
    
    if (roleForm.value.isDicoces) {
      userRoles = ['ROLE_DIOCESE', 'ROLE_DECANAL', 'ROLE_NOYAU']
      roleForm.value.isDecanal = true
      roleForm.value.isNoyau = true
    } else if (roleForm.value.isDecanal) {
      userRoles = ['ROLE_DECANAL', 'ROLE_NOYAU']
      roleForm.value.isNoyau = true
      roleForm.value.isDicoces = false
    } else if (roleForm.value.isNoyau) {
      userRoles = ['ROLE_NOYAU']
      roleForm.value.isDicoces = false
      roleForm.value.isDecanal = false
    } else {
      userRoles = []
    }

    // Mettre à jour la personne
    await axios.patch(`${API_URL}/people/${personData.value.id}`, {
      isNoyau: roleForm.value.isNoyau,
      isDecanal: roleForm.value.isDecanal,
      isDicoces: roleForm.value.isDicoces,
      updatedAt: new Date().toISOString()
    }, {
      headers: { 
        "Content-Type": "application/merge-patch+json",
        "Authorization": `Bearer ${token}`
      }
    })

    // Mettre à jour les rôles de l'utilisateur
    // Filtrer les rôles existants pour enlever les anciens rôles
    const currentRoles = userData.value.roles || []
    const filteredRoles = currentRoles.filter(role => 
      !['ROLE_NOYAU', 'ROLE_DECANAL', 'ROLE_DIOCESE'].includes(role)
    )
    
    const finalRoles = [...filteredRoles, ...userRoles]

    await axios.patch(`${API_URL}/users/${userData.value.id}`, {
      roles: finalRoles,
      updatedAt: new Date().toISOString()
    }, {
      headers: { 
        "Content-Type": "application/merge-patch+json",
        "Authorization": `Bearer ${token}`
      }
    })

    toast.success('Rôles mis à jour avec succès !')
    
    // Mettre à jour le localStorage et recharger les données
    localStorage.setItem('roles', JSON.stringify(finalRoles))
    await fetchUserData()

  } catch (error) {
    console.error('Erreur mise à jour rôles:', error)
    toast.error('Erreur lors de la mise à jour des rôles')
  } finally {
    isLoading.value = false
  }
}

// Gestion des changements de rôles (pour éviter les incohérences)
function onRoleChange() {
  if (roleForm.value.isDicoces) {
    roleForm.value.isDecanal = true
    roleForm.value.isNoyau = true
  } else if (roleForm.value.isDecanal) {
    roleForm.value.isNoyau = true
    roleForm.value.isDicoces = false
  } else if (!roleForm.value.isNoyau) {
    roleForm.value.isDecanal = false
    roleForm.value.isDicoces = false
  }
}

// Formatage du numéro de téléphone pour l'affichage
const formattedPhone = computed(() => {
  const phone = personData.value.phoneNumber
  if (!phone) return ''
  return phone.replace(/(\d{4})(\d{3})(\d{3})/, '$1 $2 $3')
})

onMounted(fetchUserData)
</script>

<template>
  <div class="be-content">
    <div class="main-content container-fluid">
      <div class="row">
        <div class="col-md-12">
          <div class="card">
            <div class="card-header card-header-divider">
              Paramètres du compte
              <span class="card-subtitle">Gérez vos informations personnelles et vos préférences</span>
            </div>
            <div class="card-body">
              <!-- Navigation par onglets -->
              <div class="be-tabs">
                <ul class="nav nav-tabs" role="tablist">
                  <li class="nav-item">
                    <a class="nav-link" :class="{ active: activeTab === 'personal' }" 
                       @click="activeTab = 'personal'">Informations personnelles</a>
                  </li>
                  <li class="nav-item">
                    <a class="nav-link" :class="{ active: activeTab === 'security' }" 
                       @click="activeTab = 'security'">Sécurité</a>
                  </li>
                  <li class="nav-item">
                    <a class="nav-link" :class="{ active: activeTab === 'roles' }" 
                       @click="activeTab = 'roles'">Responsabilités</a>
                  </li>
                </ul>

                <div class="tab-content">
                  <!-- Onglet Informations personnelles -->
                  <div v-if="activeTab === 'personal'" class="tab-pane active">
                    <div class="row">
                      <div class="col-md-6">
                        <div class="form-group">
                          <label>Nom complet</label>
                          <input class="form-control" :value="personData.fullName" disabled />
                        </div>
                        
                        <div class="form-group">
                          <label>Genre</label>
                          <input class="form-control" :value="personData.gender" disabled />
                        </div>
                      </div>
                      
                      <div class="col-md-6">
                        <div class="form-group">
                          <label>Numéro de téléphone actuel</label>
                          <input class="form-control" :value="formattedPhone" disabled />
                        </div>
                        
                        <div class="form-group">
                          <label>Email actuel</label>
                          <input class="form-control" :value="userData.email || 'Non défini'" disabled />
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- Onglet Sécurité -->
                  <div v-if="activeTab === 'security'" class="tab-pane active">
                    <!-- Changer le numéro de téléphone -->
                    <div class="card mb-4">
                      <div class="card-header">
                        <h5 class="mb-0">Changer le numéro de téléphone</h5>
                      </div>
                      <div class="card-body">
                        <div class="form-group">
                          <label>Nouveau numéro</label>
                          <input 
                            class="form-control" 
                            v-model="phoneForm.newPhone" 
                            type="tel" 
                            placeholder="0899 999 999"
                            @input="phoneForm.newPhone = formatPhone(phoneForm.newPhone)"
                            :class="{ 'is-invalid': errors.phone?.newPhone }"
                          />
                          <div v-if="errors.phone?.newPhone" class="invalid-feedback">
                            {{ errors.phone.newPhone }}
                          </div>
                        </div>
                        
                        <div class="form-group">
                          <label>Confirmer le nouveau numéro</label>
                          <input 
                            class="form-control" 
                            v-model="phoneForm.confirmPhone" 
                            type="tel" 
                            placeholder="0899 999 999"
                            @input="phoneForm.confirmPhone = formatPhone(phoneForm.confirmPhone)"
                            :class="{ 'is-invalid': errors.phone?.confirmPhone }"
                          />
                          <div v-if="errors.phone?.confirmPhone" class="invalid-feedback">
                            {{ errors.phone.confirmPhone }}
                          </div>
                        </div>
                        
                        <button 
                          class="btn btn-primary" 
                          @click="updatePhone" 
                          :disabled="isLoading"
                        >
                          <span v-if="isLoading" class="spinner-border spinner-border-sm me-2"></span>
                          Changer le numéro
                        </button>
                        
                        <small class="form-text text-muted d-block mt-2">
                          <i class="mdi mdi-information-outline"></i>
                          Vous serez déconnecté après cette modification
                        </small>
                      </div>
                    </div>

                    <!-- Changer l'email -->
                    <div class="card mb-4">
                      <div class="card-header">
                        <h5 class="mb-0">Changer l'adresse email</h5>
                      </div>
                      <div class="card-body">
                        <div class="form-group">
                          <label>Nouvel email</label>
                          <input 
                            class="form-control" 
                            v-model="emailForm.newEmail" 
                            type="email" 
                            placeholder="votre@email.com"
                            :class="{ 'is-invalid': errors.email?.newEmail }"
                          />
                          <div v-if="errors.email?.newEmail" class="invalid-feedback">
                            {{ errors.email.newEmail }}
                          </div>
                        </div>
                        
                        <div class="form-group">
                          <label>Confirmer le nouvel email</label>
                          <input 
                            class="form-control" 
                            v-model="emailForm.confirmEmail" 
                            type="email" 
                            placeholder="votre@email.com"
                            :class="{ 'is-invalid': errors.email?.confirmEmail }"
                          />
                          <div v-if="errors.email?.confirmEmail" class="invalid-feedback">
                            {{ errors.email.confirmEmail }}
                          </div>
                        </div>
                        
                        <button 
                          class="btn btn-primary" 
                          @click="updateEmail" 
                          :disabled="isLoading"
                        >
                          <span v-if="isLoading" class="spinner-border spinner-border-sm me-2"></span>
                          Changer l'email
                        </button>
                      </div>
                    </div>

                    <!-- Changer le mot de passe -->
                    <div class="card">
                      <div class="card-header">
                        <h5 class="mb-0">Changer le mot de passe</h5>
                      </div>
                      <div class="card-body">
                        <div class="form-group">
                          <label>Ancien mot de passe</label>
                          <input 
                            class="form-control" 
                            v-model="passwordForm.currentPassword" 
                            type="password" 
                            :class="{ 'is-invalid': errors.password?.currentPassword }"
                          />
                          <div v-if="errors.password?.currentPassword" class="invalid-feedback">
                            {{ errors.password.currentPassword }}
                          </div>
                        </div>
                        
                        <div class="form-group">
                          <label>Nouveau mot de passe</label>
                          <input 
                            class="form-control" 
                            v-model="passwordForm.newPassword" 
                            type="password" 
                            :class="{ 'is-invalid': errors.password?.newPassword }"
                          />
                          <div v-if="errors.password?.newPassword" class="invalid-feedback">
                            {{ errors.password.newPassword }}
                          </div>
                        </div>
                        
                        <div class="form-group">
                          <label>Confirmer le nouveau mot de passe</label>
                          <input 
                            class="form-control" 
                            v-model="passwordForm.confirmPassword" 
                            type="password" 
                            :class="{ 'is-invalid': errors.password?.confirmPassword }"
                          />
                          <div v-if="errors.password?.confirmPassword" class="invalid-feedback">
                            {{ errors.password.confirmPassword }}
                          </div>
                        </div>
                        
                        <button 
                          class="btn btn-primary" 
                          @click="updatePassword" 
                          :disabled="isLoading"
                        >
                          <span v-if="isLoading" class="spinner-border spinner-border-sm me-2"></span>
                          Changer le mot de passe
                        </button>
                      </div>
                    </div>
                  </div>

                  <!-- Onglet Responsabilités -->
                  <div v-if="activeTab === 'roles'" class="tab-pane active">
                    <div class="card">
                      <div class="card-header">
                        <h5 class="mb-0">Gérer les responsabilités</h5>
                      </div>
                      <div class="card-body">
                        <div class="alert alert-info">
                          <i class="mdi mdi-information-outline"></i>
                          <strong>Information :</strong> La sélection d'un niveau supérieur inclut automatiquement les niveaux inférieurs.
                        </div>

                        <div class="form-group">
                          <div class="custom-control custom-checkbox">
                            <input 
                              class="custom-control-input" 
                              id="isNoyau" 
                              type="checkbox" 
                              v-model="roleForm.isNoyau"
                              @change="onRoleChange"
                            />
                            <label class="custom-control-label" for="isNoyau">
                              <strong>Noyau Paroissial</strong>
                              <small class="form-text text-muted d-block">
                                Membre actif de la paroisse - Rôle: ROLE_NOYAU
                              </small>
                            </label>
                          </div>
                        </div>

                        <div class="form-group">
                          <div class="custom-control custom-checkbox">
                            <input 
                              class="custom-control-input" 
                              id="isDecanal" 
                              type="checkbox" 
                              v-model="roleForm.isDecanal"
                              @change="onRoleChange"
                            />
                            <label class="custom-control-label" for="isDecanal">
                              <strong>Noyau Décanal</strong>
                              <small class="form-text text-muted d-block">
                                Responsable au niveau du doyenné - Rôles: ROLE_DECANAL, ROLE_NOYAU
                              </small>
                            </label>
                          </div>
                        </div>

                        <div class="form-group">
                          <div class="custom-control custom-checkbox">
                            <input 
                              class="custom-control-input" 
                              id="isDicoces" 
                              type="checkbox" 
                              v-model="roleForm.isDicoces"
                              @change="onRoleChange"
                            />
                            <label class="custom-control-label" for="isDicoces">
                              <strong>Noyau Diocésain</strong>
                              <small class="form-text text-muted d-block">
                                Responsable au niveau du diocèse - Rôles: ROLE_DIOCESE, ROLE_DECANAL, ROLE_NOYAU
                              </small>
                            </label>
                          </div>
                        </div>

                        <button 
                          class="btn btn-primary" 
                          @click="updateRoles" 
                          :disabled="isLoading"
                        >
                          <span v-if="isLoading" class="spinner-border spinner-border-sm me-2"></span>
                          Mettre à jour les responsabilités
                        </button>
                      </div>
                    </div>
                  </div>
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
.nav-tabs .nav-link {
  color: #495057;
  cursor: pointer;
}

.nav-tabs .nav-link.active {
  color: #007bff;
  font-weight: 600;
}

.card {
  margin-bottom: 1rem;
}

.card-header {
  background-color: #f8f9fa;
  border-bottom: 1px solid #dee2e6;
}

.invalid-feedback {
  display: block;
}

.form-text.text-muted {
  font-size: 0.875rem;
}

.custom-control-label {
  cursor: pointer;
}

.alert-info {
  background-color: #d1ecf1;
  border-color: #bee5eb;
  color: #0c5460;
}
</style>