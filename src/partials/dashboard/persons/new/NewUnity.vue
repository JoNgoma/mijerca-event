<template>
  <div class="be-content">
    <div class="page-head">
      <h2 class="page-head-title">Nouveau membre</h2>
      <nav aria-label="breadcrumb" role="navigation">
        <ol class="breadcrumb page-head-nav">
          <li class="breadcrumb-item">
            <router-link :to="{ name: 'dashboard' }">Dashboard</router-link>
          </li>
          <li class="breadcrumb-item"><router-link
            :to="{ name: 'analytic', params: { serviceType: LocalisationService } }"
            >{{ nameService }}</router-link></li>
          <li class="breadcrumb-item active">Nouveau membre</li>
        </ol>
      </nav>
    </div>

    <div class="main-content container-fluid">
      <div class="row">
        <!-- Partie gauche -->
        <div class="col-lg-6">
          <div class="card card-border-color card-border-color-primary">
            <div class="card-header card-header-divider">
              Nouveau {{ LocalisationService }}
              <span class="card-subtitle">Veuillez entrer les coordonnées correspondantes</span>
            </div>
            <div class="card-body">
              <form @submit="handleSubmit">
                <!-- Genre -->
                <div class="form-group row pt-3">
                  <label class="col-12 col-sm-3 col-form-label text-sm-right pt-4">Sélectionner le genre</label>
                  <div class="col-12 col-sm-8 col-lg-6">
                    <div class="form-check form-check-inline">
                      <label class="custom-control custom-radio custom-radio-icon custom-control-inline">
                        <input
                          class="custom-control-input"
                          type="radio"
                          name="radio-icon"
                          value="Soeur"
                          v-model="gender"
                        />
                        <span class="custom-control-label"><i class="mdi mdi-female"></i></span>
                      </label>
                      <label class="custom-control custom-radio custom-radio-icon custom-control-inline">
                        <input
                          class="custom-control-input"
                          type="radio"
                          name="radio-icon"
                          value="Frère"
                          v-model="gender"
                        />
                        <span class="custom-control-label"><i class="mdi mdi-male-alt"></i></span>
                      </label>
                    </div>
                  </div>
                </div>

                <!-- Numéro de téléphone -->
                <div class="form-group pt-2">
                  <label for="inputNumber">Numéro de téléphone</label>
                  <input
                    id="inputNumber"
                    class="form-control"
                    :class="{ 'is-invalid': phoneError }"
                    type="text"
                    placeholder="0899 999 999"
                    v-model="phoneNumber"
                    @input="formatPhoneNumberDisplay"
                    @blur="validatePhoneNumber"
                  />
                  <div v-if="phoneError" class="invalid-feedback">{{ phoneError }}</div>
                </div>

                <!-- Nom complet -->
                <div class="form-group">
                  <label for="inputNames">Noms au complet</label>
                  <input
                    id="inputNames"
                    class="form-control"
                    :class="{ 'is-invalid': nameError }"
                    type="text"
                    placeholder="Joe Doe"
                    v-model="fullName"
                    @blur="validateFullName"
                  />
                  <div v-if="nameError" class="invalid-feedback">{{ nameError }}</div>
                </div>

                <!-- Email (seulement si LocalisationService n'est pas "jeunes") -->
                <div class="form-group" v-if="showEmailField">
                  <label for="inputEmail">Adresse email</label>
                  <input
                    id="inputEmail"
                    class="form-control"
                    :class="{ 'is-invalid': emailError }"
                    type="email"
                    placeholder="joe.doe@example.com"
                    v-model="email"
                    @blur="validateEmail"
                  />
                  <div v-if="emailError" class="invalid-feedback">{{ emailError }}</div>
                </div>

                <div v-if="error" class="text-danger mt-2">{{ error }}</div>
              </form>
            </div>
          </div>
        </div>

        <!-- Partie droite -->
        <div class="col-lg-6">
          <div class="card card-border-color card-border-color-primary">
            <div class="card-body">
              <form @submit.prevent="handleSubmit">
                <!-- Secteur -->
                <div class="form-group pt-2">
                  <label>Sélectionner le secteur</label>
                  <select class="form-control" v-model="sector">
                    <option v-for="s in sectors" :key="s.id" :value="s.name">{{ s.name }}</option>
                  </select>
                </div>

                <!-- Doyenné -->
                <div class="form-group pt-2">
                  <label>Sélectionner le doyenné</label>
                  <select class="form-control" v-model="doyenne">
                    <option v-for="d in filteredDoyennes" :key="d.id" :value="d.name">{{ d.name }}</option>
                  </select>
                </div>

                <!-- Paroisse -->
                <div class="form-group pt-2">
                  <label>Sélectionner la paroisse</label>
                  <select class="form-control" v-model="paroisse">
                    <option v-for="p in filteredParoisses" :key="p.id" :value="p.name">{{ p.name }}</option>
                  </select>
                </div>

                <!-- Boutons -->
                <div class="row pt-8">
                  <div class="col-12 d-flex justify-content-end">
                    <button class="btn btn-secondary mr-4" type="button" @click="router.back()">Retour</button>
                    <button class="btn btn-primary" type="submit" :disabled="isLoading">
                      {{ isLoading ? 'Enregistrement...' : 'Enregistrer' }}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, onUnmounted, computed } from 'vue'
import { useRouter, onBeforeRouteUpdate } from 'vue-router'
import axios from 'axios'
import { useServiceContext } from '@/composables/useServiceContext'
import { useToast } from 'vue-toastification';

const toast = useToast();

const API_URL = import.meta.env.VITE_API_BASE_URL
const router = useRouter()
const { currentService } = useServiceContext()

// =========================
// Niveaux d'accès
// =========================
const nameService = ref(currentService.value.name)
const LocalisationService = ref(currentService.value.position)
let isDioces = false, isDecanal = false, isNoyau = false
if (LocalisationService.value === "diocesain") { isDioces = true; isDecanal = true; isNoyau = true }
else if (LocalisationService.value === "decanal") { isDioces = false; isDecanal = true; isNoyau = true }
else if (LocalisationService.value === "paroissial") {isDioces = false; isDecanal = false; isNoyau = true }
else {isDioces = false; isDecanal = false; isNoyau = false }

// =========================
// Champs formulaire
// =========================
const gender = ref("Soeur")
const phoneNumber = ref("")
const fullName = ref("")
const email = ref("")
const sector = ref("")
const doyenne = ref("")
const paroisse = ref("")

// =========================
// Validation des champs
// =========================
const phoneError = ref("")
const nameError = ref("")
const emailError = ref("")

// =========================
// Computed properties
// =========================
const showEmailField = computed(() => {
  return nameService.value !== "Jeunes"
})

// =========================
// Listes et filtres
// =========================
const sectors = ref([])
const doyennes = ref([])
const paroisses = ref([])
const filteredDoyennes = ref([])
const filteredParoisses = ref([])

// =========================
// État UI
// =========================
const error = ref("")
const isLoading = ref(false)

// =========================
// SSE
// =========================
let eventSource = null
const newPeople = ref([]) // stocke les nouvelles personnes reçues via SSE

// =========================
// Validation du numéro de téléphone
// =========================
function validatePhoneNumber() {
  const cleanedNumber = phoneNumber.value.replace(/\s+/g, '')
  
  if (!cleanedNumber) {
    phoneError.value = "Le numéro de téléphone est requis"
    return false
  }

  if (cleanedNumber.length < 10) {
    phoneError.value = "Le numéro doit contenir au moins 10 chiffres"
    return false
  }

  // Vérification des préfixes autorisés
  const validPrefixes = ['081', '082', '083', '084', '085', '089', '09']
  const hasValidPrefix = validPrefixes.some(prefix => cleanedNumber.startsWith(prefix))
  
  if (!hasValidPrefix) {
    phoneError.value = "Le numéro doit commencer par : 081, 082, 083, 084, 085, 089 ou 09"
    return false
  }

  if (!/^\d+$/.test(cleanedNumber)) {
    phoneError.value = "Le numéro ne doit contenir que des chiffres"
    return false
  }

  phoneError.value = ""
  return true
}

// =========================
// Validation du nom complet
// =========================
function validateFullName() {
  const name = fullName.value.trim()
  
  if (!name) {
    nameError.value = "Le nom complet est requis"
    return false
  }

  // Autorise les lettres, espaces et tirets uniquement entre deux mots
  const nameRegex = /^[A-Za-zÀ-ÿ]+([-'][A-Za-zÀ-ÿ]+)*([\s][A-Za-zÀ-ÿ]+([-'][A-Za-zÀ-ÿ]+)*)*$/
  
  if (!nameRegex.test(name)) {
    nameError.value = "Le nom ne peut contenir que des lettres, espaces et tirets (uniquement entre deux mots)"
    return false
  }

  nameError.value = ""
  return true
}

// =========================
// Validation de l'email
// =========================
function validateEmail() {
  if (!showEmailField.value) {
    emailError.value = ""
    return true
  }

  const emailValue = email.value.trim()
  
  if (!emailValue) {
    emailError.value = "L'adresse email est requise"
    return false
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  
  if (!emailRegex.test(emailValue)) {
    emailError.value = "Veuillez saisir une adresse email valide"
    return false
  }

  emailError.value = ""
  return true
}

// =========================
// Formatage numéro
// =========================
function formatPhoneNumberDisplay() {
  let digits = phoneNumber.value.replace(/\D/g, '').slice(0, 10)
  if (digits.length > 4 && digits.length <= 7) phoneNumber.value = digits.slice(0,4)+' '+digits.slice(4)
  else if (digits.length > 7) phoneNumber.value = digits.slice(0,4)+' '+digits.slice(4,7)+' '+digits.slice(7)
  else phoneNumber.value = digits
  
  // Effacer l'erreur pendant la saisie
  phoneError.value = ""
}

// =========================
// Watchers
// =========================
let stopSectorWatcher, stopDoyenneWatcher

function filterDoyennes() {
  const sel = sectors.value.find(s => s.name === sector.value)
  if (!sel) { filteredDoyennes.value = []; doyenne.value = ""; return }
  filteredDoyennes.value = doyennes.value.filter(d => d.sector === sel["@id"])
  doyenne.value = filteredDoyennes.value[0]?.name || ""
  filterParoisses()
}

function filterParoisses() {
  const sel = filteredDoyennes.value.find(d => d.name === doyenne.value)
  if (!sel) { filteredParoisses.value = []; paroisse.value = ""; return }
  filteredParoisses.value = paroisses.value.filter(p => p.doyenne === sel["@id"])
  paroisse.value = filteredParoisses.value[0]?.name || ""
}

// =========================
// Chargement des données
// =========================
async function loadData() {
  try {
    const [sectorRes, doyenneRes, paroisseRes] = await Promise.all([
      axios.get(`${API_URL}/sectors`),
      axios.get(`${API_URL}/doyennes`),
      axios.get(`${API_URL}/paroisses`)
    ])
    sectors.value = sectorRes.data.member
    doyennes.value = doyenneRes.data.member
    paroisses.value = paroisseRes.data.member
    filterDoyennes()

    stopSectorWatcher = watch(sector, filterDoyennes)
    stopDoyenneWatcher = watch(doyenne, filterParoisses)
  } catch (err) {
      toast.error("Erreur chargement données", 'error');
      console.error("Erreur chargement données :", err)
  }
}

// =========================
// Montage / démontage
// =========================
onMounted(() => {
  loadData()

  // SSE
  eventSource = new EventSource(`${API_URL.replace("/api","")}/sse/people`)
  eventSource.onmessage = (event) => {
    const data = JSON.parse(event.data)
    console.log("📥 Nouvel enregistrement :", data)
    newPeople.value.push(data)
    // Ici tu peux recharger automatiquement les listes si nécessaire
    // loadData()
  }
  eventSource.onerror = (err) => {
    console.error("❌ SSE error", err)
    eventSource.close()
  }
})

onUnmounted(() => {
  if (stopSectorWatcher) stopSectorWatcher()
  if (stopDoyenneWatcher) stopDoyenneWatcher()
  if (eventSource) eventSource.close()
  resetForm()
})

// Relancer quand on change de route
onBeforeRouteUpdate((to, from, next) => {
  resetForm()
  loadData()
  next()
})

// =========================
// Reset form
// =========================
function resetForm() {
  gender.value = "Soeur"
  phoneNumber.value = ""
  fullName.value = ""
  email.value = ""
  sector.value = ""
  doyenne.value = ""
  paroisse.value = ""
  filteredDoyennes.value = []
  filteredParoisses.value = []
  error.value = ""
  phoneError.value = ""
  nameError.value = ""
  emailError.value = ""
  isLoading.value = false
}

// =========================
// Soumission
// =========================
async function handleSubmit(e) {
  e.preventDefault()
  error.value = ""
  
  // Validation de tous les champs
  const isPhoneValid = validatePhoneNumber()
  const isNameValid = validateFullName()
  const isEmailValid = showEmailField.value ? validateEmail() : true

  if (!isPhoneValid || !isNameValid || !isEmailValid) {
    error.value = "Veuillez corriger les erreurs dans le formulaire"
    return
  }

  isLoading.value = true

  try {
    const cleanedNumber = phoneNumber.value.replace(/\s+/g, '')
    
    const sectorObj = sectors.value.find(s => s.name === sector.value)
    const doyenneObj = doyennes.value.find(d => d.name === doyenne.value)
    const paroisseObj = paroisses.value.find(p => p.name === paroisse.value)

    const payload = {
      gender: gender.value,
      fullName: fullName.value.trim(),
      phoneNumber: cleanedNumber,
      isNoyau: isNoyau,
      isDecanal: isDecanal,
      isDicoces: isDioces,
      updatedAt: new Date().toISOString(),
      sector: sectorObj ? sectorObj["@id"] : "",
      doyenne: doyenneObj ? doyenneObj["@id"] : "",
      paroisse: paroisseObj ? paroisseObj["@id"] : ""
    }

    const personRes = await axios.post(`${API_URL}/people`, payload, {
      headers: { 
        "Content-Type": "application/ld+json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`
       }
    })
    
    const sectorUrl = sectorObj ? sectorObj["@id"] : ""
    let roleSector = '' 
    if (sectorUrl === '/api/sectors/1') roleSector = 'ROLE_EST' 
    else if (sectorUrl === '/api/sectors/2') roleSector = 'ROLE_CENTRE'
    else if (sectorUrl === '/api/sectors/3') roleSector = 'ROLE_OUEST'
    
    if (isDioces || isDecanal || isNoyau) {
      let rolesArray = []
      if (isDioces) rolesArray = [roleSector, "ROLE_DIOCESE","ROLE_DECANAL","ROLE_NOYAU"]
      else if (isDecanal) rolesArray = [roleSector, "ROLE_DECANAL","ROLE_NOYAU"]
      else if (isNoyau) rolesArray = [roleSector, "ROLE_NOYAU"]

      const userPayload = {
        username: cleanedNumber,
        email: showEmailField.value ? email.value.trim() : null,
        roles: rolesArray,
        password: "mijerca2025",
        person: personRes.data["@id"] || personRes.data.id
      }

      await axios.post(`${API_URL}/users`, userPayload, {
        headers: { 
          "Content-Type": "application/ld+json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        }
      })

      toast.success("Responsable ajouté avec succes!\nMot de passe initial : mijerca2025")
    } else {
      toast.success("Jeune ajouté avec succès !")
    }

    resetForm()
  } catch (err) {
    console.error("❌ Erreur handleSubmit :", err.response?.data || err)

    // ✅ Gestion des erreurs Symfony / ApiPlatform
    if (err.response?.data?.violations) {
      // Tableau de violations => concaténation des messages
      error.value = err.response.data.violations
        .map((v) => `${v.propertyPath} : ${v.message}`)
        .join(", ")
    } else if (err.response?.data?.message) {
      // Cas général
      error.value = err.response.data.message
    } else {
      error.value = "Erreur lors de l'enregistrement"
    }
  } finally {
    isLoading.value = false
  }
}

</script>