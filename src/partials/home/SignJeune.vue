<script setup>
import { ref, onMounted, watch } from "vue"
import axios from "axios"
import { useRouter } from "vue-router"
import { useToast } from 'vue-toastification'
import logo from "/assets/img/mijerca.jpg"

const toast = useToast()
const API_URL = import.meta.env.VITE_API_BASE_URL

// 🔹 Variables formulaire
const gender = ref("")
const phoneNumber = ref("")
const fullName = ref("")
const sector = ref("")
const doyenne = ref("")
const paroisse = ref("")
const isResponsable = ref(false)
const email = ref("") // ajouté pour le modal

const sectors = ref([])
const doyennes = ref([])
const filteredDoyennes = ref([])
const paroisses = ref([])
const filteredParoisses = ref([])

const showModal = ref(false)           // Modal pour rôles
const showAccessModal = ref(false)     // 🔹 NOUVEAU: Modal pour code d'accès
const showInfoModal = ref(false)       // Modal pour "Voir info"
const roles = ref([
  { key: "isNoyau", label: "Noyau Paroissial", value: false },
  { key: "isDecanal", label: "Noyau Décanal", value: false },
  { key: "isDicoces", label: "Noyau Diocésain", value: false },
])

const infoNumber = ref("")
const error = ref("")
const genderError = ref("")
const isLoading = ref(false)
const isLoadingInfo = ref(false) // 🔹 NOUVEAU: Loading spécifique pour le modal "Voir info"
const router = useRouter()

// 🔹 Variables pour le modal d'accès
const accessCode = ref("")
const showPassword = ref(false)

// 🔹 Toast amélioré
const toasts = ref([])

// ==========================
// PAGINATION OPTIMISÉE
// ==========================
async function fetchAllPages(baseUrl) {
  let allItems = [];
  let currentPage = 1;
  let hasMore = true;

  try {
    while (hasMore) {
      const url = `${baseUrl}${baseUrl.includes('?') ? '&' : '?'}page=${currentPage}`;

      const response = await axios.get(url);
      const data = response.data;

      if (data.member && Array.isArray(data.member)) {
        allItems = [...allItems, ...data.member];

        // Vérifie s'il y a plus de pages
        if (data.member.length === 0 ||
            data.member.length < 30 ||
            currentPage >= 50) {
          hasMore = false;
        } else {
          currentPage++;
        }
      } else {
        hasMore = false;
      }
    }

    // console.log(`📊 ${baseUrl} - ${allItems.length} enregistrements chargés`);
    return allItems;
  } catch (error) {
    console.error(`Erreur lors de la récupération paginée de ${baseUrl}:`, error);
    throw error;
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
  const validPrefixes = ['080', '081', '082', '083', '084', '085', '086', '089', '09']
  const hasValidPrefix = validPrefixes.some(prefix => cleaned.startsWith(prefix))
  if (!hasValidPrefix) return "Le numéro doit commencer par 080, 081, 082, 083, 084, 085, 086, 089 ou 09."
  if (cleaned.length < 10) return "Le numéro doit contenir au moins 10 chiffres."
  return ""
}

// 🔹 Validation du nom complet
const validateFullName = (name) => {
  const cleaned = name.trim()
  const nameRegex = /^[A-Za-zÀ-ÖØ-öø-ÿ]+(?:[-' ][A-Za-zÀ-ÖØ-öø-ÿ]+)*$/
  if (!cleaned) return "Veuillez saisir votre nom complet."
  if (!nameRegex.test(cleaned)) return "Le nom ne doit pas contenir de chiffres ni de symboles, sauf un tiret entre deux mots."
  return ""
}

// 🔹 Validation email
const validateEmail = (email) => {
  if (!email.trim()) return "Veuillez saisir votre adresse e-mail."
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) return "Veuillez saisir une adresse e-mail valide."
  return ""
}

// 🔹 Validation des rôles (au moins un checkbox sélectionné)
const validateRoles = () => {
  const hasSelectedRole = roles.value.some(role => role.value)
  if (!hasSelectedRole) return "Veuillez sélectionner au moins un type de responsabilité."
  return ""
}

// 🔹 Chargement données avec pagination
onMounted(async () => {
  try {
    // Chargement paginé de toutes les données
    const [sectorData, doyenneData, paroisseData] = await Promise.all([
      fetchAllPages(`${API_URL}/sectors`),
      fetchAllPages(`${API_URL}/doyennes`),
      fetchAllPages(`${API_URL}/paroisses`)
    ])

    sectors.value = sectorData || []
    doyennes.value = doyenneData || []
    paroisses.value = paroisseData || []

    // console.log('📊 Données chargées:', {
    //   sectors: sectors.value.length,
    //   doyennes: doyennes.value.length,
    //   paroisses: paroisses.value.length
    // })

    if (sectors.value.length) sector.value = sectors.value[0].name
    filterDoyennes()
  } catch (err) {
    console.error("Erreur chargement données :", err)
    toast.error("Erreur chargement données.")
  }
})

// 🔹 Watchers
watch(sector, filterDoyennes)
watch(doyenne, filterParoisses)

function filterDoyennes() {
  const selectedSector = sectors.value.find(s => s.name === sector.value)
  filteredDoyennes.value = selectedSector
    ? doyennes.value.filter(d => d.sector === selectedSector["@id"])
    : []
  doyenne.value = filteredDoyennes.value[0]?.name || ""
  filterParoisses()
}

function filterParoisses() {
  const selectedDoyenne = filteredDoyennes.value.find(d => d.name === doyenne.value)
  filteredParoisses.value = selectedDoyenne
    ? paroisses.value.filter(p => p.doyenne === selectedDoyenne["@id"])
    : []
  paroisse.value = filteredParoisses.value[0]?.name || ""
}

// 🔹 Gestion formulaire
async function handleSubmit() {
  fullName.value = fullName.value.trim()
  genderError.value = ""

  if (!gender.value) {
    genderError.value = "Veuillez sélectionner un genre."
    toast.error(genderError.value)
    return
  }

  const phoneError = validatePhone(phoneNumber.value)
  if (phoneError) {
    toast.error(phoneError)
    return
  }

  const nameError = validateFullName(fullName.value)
  if (nameError) {
    toast.error(nameError)
    return
  }

  if (isResponsable.value) {
    // 🔹 Afficher d'abord le modal d'accès
    showAccessModal.value = true
    return
  }
  await registerUser({ isNoyau: false, isDecanal: false, isDicoces: false }, false)
}

// 🔹 Gestion modal d'accès
function cancelAccessModal() {
  showAccessModal.value = false
  accessCode.value = ""
  showPassword.value = false
}

function validateAccessCode() {
  if (accessCode.value === "archidiocese") {
    showAccessModal.value = false
    accessCode.value = ""
    showPassword.value = false
    showModal.value = true // Ouvrir le modal des responsabilités
  } else {
    toast.error("Accès refusé, code invalide")
    accessCode.value = ""
  }
}

function togglePasswordVisibility() {
  showPassword.value = !showPassword.value
}

function cancelModal() {
  showModal.value = false
}

async function submitModal() {
  // 🔹 Validation de l'email
  const emailError = validateEmail(email.value)
  if (emailError) {
    toast.error(emailError)
    return
  }

  // 🔹 Validation des rôles (au moins un checkbox sélectionné)
  const rolesError = validateRoles()
  if (rolesError) {
    toast.error(rolesError)
    return
  }

  showModal.value = false
  const roleValues = roles.value.reduce((acc, role) => {
    acc[role.key] = role.value
    return acc
  }, {})
  await registerUser(roleValues, true)
}

// 🔹 Modal "Voir info"
function cancelInfoModal() {
  showInfoModal.value = false
  isLoadingInfo.value = false // 🔹 Réinitialiser le loading
}

async function submitInfoModal() {
  const cleanedNumber2 = infoNumber.value.replace(/\s+/g, '')
  if (!cleanedNumber2) {
    toast.error("Veuillez saisir un numéro.")
    return
  }

  isLoadingInfo.value = true // 🔹 Activer le loading

  try {
    // Recherche paginée de la personne
    const allPeople = await fetchAllPages(`${API_URL}/people?phoneNumber=${cleanedNumber2}`)
    const person = allPeople.find(d => d.phoneNumber === cleanedNumber2)

    if (person) {
      router.push({ path: "/update-info", query: { id: person.id || person["@id"] } })
      showInfoModal.value = false
    } else {
      toast.error("Numéro non trouvé.")
    }
  } catch (err) {
    console.error("Erreur recherche numéro :", err)
    toast.error("Erreur lors de la recherche.")
  } finally {
    isLoadingInfo.value = false // 🔹 Désactiver le loading
  }
}

// 🔹 Fonction d'inscription
async function registerUser(roleValues, isResponsible) {
  isLoading.value = true
  try {
    const sectorUrl = sectors.value.find(s => s.name === sector.value)?.["@id"] || ""
    const doyenneUrl = doyennes.value.find(d => d.name === doyenne.value)?.["@id"] || ""
    const paroisseUrl = paroisses.value.find(p => p.name === paroisse.value)?.["@id"] || ""

    const cleanedNumber = phoneNumber.value.replace(/\s+/g, '')

    const personPayload = {
      gender: gender.value,
      phoneNumber: cleanedNumber,
      fullName: fullName.value,
      sector: sectorUrl,
      doyenne: doyenneUrl,
      paroisse: paroisseUrl,
      ...roleValues,
      updatedAt: new Date().toISOString(),
    }

    const personRes = await axios.post(
      `${API_URL}/people`,
      personPayload,
      { headers: {
        "Content-Type": "application/ld+json",
        "Accept": "application/ld+json",
      } }
    )

    let roleSector = ''
    if (sectorUrl=== '/api/sectors/1') roleSector = 'ROLE_EST'
    else if (sectorUrl=== '/api/sectors/2') roleSector = 'ROLE_CENTRE'
    else if (sectorUrl=== '/api/sectors/3') roleSector = 'ROLE_OUEST'

    const personUrl = personRes.data["@id"] || personRes.data.id

    if (isResponsible) {
      const rolesArray = [roleSector]
      if(roleValues.isDicoces) rolesArray.push("ROLE_DIOCESE")
      if(roleValues.isDecanal) rolesArray.push("ROLE_DECANAL")
      if(roleValues.isNoyau) rolesArray.push("ROLE_NOYAU")
      if(roleValues.isDecanal && !rolesArray.includes("ROLE_NOYAU")) rolesArray.unshift("ROLE_NOYAU")
      if(roleValues.isDicoces && !rolesArray.includes("ROLE_NOYAU")) rolesArray.unshift("ROLE_NOYAU")
      if(roleValues.isDicoces && !rolesArray.includes("ROLE_DECANAL")) rolesArray.splice(1,0,"ROLE_DECANAL")

      const userPayload = {
        username: cleanedNumber,
        email: email.value,
        roles: rolesArray,
        password: "mijerca2025",
        person: personUrl
      }

      await axios.post(
        `${API_URL}/users`,
        userPayload,
        { headers: { "Content-Type": "application/ld+json" } }
      )
      toast.success(`Inscription réussie ! Votre mot de passe initial est : mijerca2025`)
      router.push({ name: "home" })
      return
    }

    toast.success("Inscription réussie !")
    router.push({ name: "home" })

  } catch (err) {
    if (err.response?.data?.violations) {
      error.value = err.response.data.violations
        .map((v) => `${v.propertyPath} : ${v.message}`)
        .join(", ")
    } else if (err.response?.data?.message) {
      error.value = err.response.data.message
    } else {
      error.value = "Erreur lors de l'enregistrement"
    }

    toast.error(error.value)
    console.error("❌ Erreur registerUser :", err)
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="be-login be-signup">
    <div class="splash-container sign-up">
      <div class="card card-border-color card-border-color-primary">
        <!-- Header -->
        <div class="card-body be-navbar-header text-center">
          <a class="navbar-brand d-flex flex-column align-items-center justify-content-center" href="#">
            <img class="logo-img" :src="logo" alt="logo" />
            <span class="fw-bold brand-text">MIJERCA</span>
            <small class="text-muted">Ministère des Jeunes du Renouveau Catholique</small>
          </a>
        </div>

        <!-- Formulaire -->
        <form class="card-body" @submit.prevent="handleSubmit">
          <!-- Genre -->
          <div class="form-group">
            <label class="col-12 col-form-label text-lg-left pt-4">
              Sélectionner le genre
            </label>
            <div class="d-flex mt-2" style="gap:1rem;">
              <input type="radio" class="btn-check" name="gender" id="genderSoeur" value="Soeur" v-model="gender" />
              <label class="gender-icon btn-outline-danger" :class="{ 'required': genderError }" for="genderSoeur">
                <i class="mdi mdi-female"></i>
              </label>

              <input type="radio" class="btn-check" name="gender" id="genderFrere" value="Frère" v-model="gender" />
              <label class="gender-icon btn-outline-primary" :class="{ 'required': genderError }" for="genderFrere">
                <i class="mdi mdi-male"></i>
              </label>
            </div>
          </div>

          <!-- Téléphone -->
          <div class="form-group">
            <label for="inputPhone">Numéro de téléphone</label>
            <input id="inputPhone" class="form-control" type="text" @input="phoneNumber = formatPhone(phoneNumber)" v-model="phoneNumber" placeholder="0899 999 999" />
          </div>

          <!-- Nom complet -->
          <div class="form-group">
            <label for="inputNames">Noms au complet</label>
            <input class="form-control" v-model="fullName" type="text" placeholder="Joe Doe" />
          </div>

          <!-- Secteur / Doyenné / Paroisse -->
          <div class="form-group">
            <label>Sélectionner le secteur</label>
            <select class="form-control" v-model="sector">
              <option v-for="s in sectors" :key="s.id" :value="s.name">{{ s.name }}</option>
            </select>
          </div>

          <div class="form-group">
            <label>Sélectionner le doyenné</label>
            <select class="form-control" v-model="doyenne">
              <option v-for="d in filteredDoyennes" :key="d.id" :value="d.name">{{ d.name }}</option>
            </select>
          </div>

          <div class="form-group">
            <label>Sélectionner la paroisse</label>
            <select class="form-control" v-model="paroisse">
              <option v-for="p in filteredParoisses" :key="p.id" :value="p.name">{{ p.name }}</option>
            </select>
          </div>

          <!-- Responsable -->
          <div class="form-group mb-3">
            <div class="form-check">
              <input type="checkbox" id="responsable" v-model="isResponsable" class="form-check-input" />
              <label for="responsable" class="form-check-label">Je suis responsable</label>
            </div>
          </div>

          <!-- Submit -->
          <div class="form-group">
            <button class="btn btn-block btn-primary btn-xl" type="submit" :disabled="isLoading">
              <span v-if="isLoading" class="spinner-border spinner-border-sm"></span>
              <span v-else>S'inscrire</span>
            </button>
          </div>

          <!-- Liens -->
          <div class="form-group text-center">
            <p class="mb-1">
              Retour à l'accueil ? <a href="/">Revenir plus tard</a>
            </p>
            <p class="mb-1">
              Êtes-vous déjà enregistré ?
              <a href="#" @click.prevent="showInfoModal = true">Voir mes infos</a>
            </p>
          </div>

          <!-- Erreur -->
          <p v-if="error" class="text-danger text-center mt-2">{{ error }}</p>
        </form>
      </div>

      <div class="splash-footer text-center">
        <p class="copyright">
          &copy; MIJERCA Kinshasa 2025. Tous droits réservés.
          <br />
          <span class="d-block mt-1 pb-3">
            Prod. by
            <a target="_blank" href="https://josue-ngoma-folio.onrender.com/" class="text-decoration-none">
              Beyin LQ
            </a>
          </span>
        </p>
      </div>

      <!-- 🔹 MODAL D'ACCÈS -->
      <div v-if="showAccessModal" class="modal-backdrop">
        <div class="modal-card">
          <h5 class="text-center mb-4">Accès Responsable</h5>
          <p class="text-muted text-center mb-3">
            Veuillez saisir le code d'accès pour continuer
          </p>

          <div class="form-group">
            <label for="accessCode">Code d'accès</label>
            <div class="input-group">
              <input
                id="accessCode"
                :type="showPassword ? 'text' : 'password'"
                class="form-control"
                v-model="accessCode"
                placeholder="Saisir le code d'accès"
                @keyup.enter="validateAccessCode"
              />
              <button
                class="btn btn-outline-secondary"
                type="button"
                @click="togglePasswordVisibility"
              >
                <i :class="showPassword ? 'px-1 mdi mdi-eye-off' : 'px-1 mdi mdi-eye text-primary'"></i>
              </button>
            </div>
          </div>

          <div class="mt-4 d-flex justify-content-between">
            <button class="btn btn-secondary" @click="cancelAccessModal">Fermer</button>
            <button class="btn btn-primary" @click="validateAccessCode">Valider</button>
          </div>
        </div>
      </div>

      <!-- Modal des responsabilités -->
      <div v-if="showModal" class="modal-backdrop">
        <div class="modal-card">
          <h5>Choisir les responsabilités</h5>

          <!-- Email -->
          <div class="form-group mb-3">
            <label for="email">Adresse e-mail <span class="text-danger">*</span></label>
            <input id="email" type="email" class="form-control" v-model="email" placeholder="exemple@email.com" />
          </div>

          <div class="form-check mb-2" v-for="role in roles" :key="role.key">
            <input type="checkbox" class="form-check-input" v-model="role.value" :id="role.key" />
            <label class="form-check-label" :for="role.key">{{ role.label }}</label>
          </div>

          <div class="alert alert-info small mb-3">
            <i class="fas fa-info-circle me-1"></i>
            Veuillez sélectionner au moins un type de responsabilité
          </div>

          <div class="mt-3 d-flex justify-content-between">
            <button class="btn btn-secondary" @click="cancelModal">Retour</button>
            <button class="btn btn-primary" @click="submitModal">S'enregistrer</button>
          </div>
        </div>
      </div>

      <!-- Toasts -->
      <div class="toast-container">
        <div v-for="t in toasts" :key="t.id" class="toast-notification">
          {{ t.msg }}
        </div>
      </div>

      <!-- Template modal "Voir info" -->
      <div v-if="showInfoModal" class="modal-backdrop">
        <div class="modal-card">
          <h5>Rechercher une personne</h5>
          <div class="form-group">
            <label>Numéro de téléphone</label>
            <input type="text" class="form-control" v-model="infoNumber" @input="infoNumber = formatPhone(infoNumber)" placeholder="0899 999 999" />
          </div>
          <div class="mt-3 d-flex justify-content-between">
            <button class="btn btn-secondary" @click="cancelInfoModal">Annuler</button>
            <button @click="submitInfoModal" class="btn btn-primary" :disabled="isLoadingInfo">
              <span v-if="isLoadingInfo" class="spinner-border spinner-border-sm me-1"></span>
              {{ isLoadingInfo ? 'Recherche...' : 'Valider' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.gender-icon { width: 3.5rem; height: 3.5rem; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 28px; cursor: pointer; border: 2px solid #ccc; transition: all 0.3s ease; }
.btn-check:checked + .gender-icon { color: #fff; font-weight: bold; transform: scale(1.1); box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15); }
#genderSoeur:checked + .gender-icon { background-color: #e74c3c; border-color: #e74c3c; }
#genderFrere:checked + .gender-icon { background-color: #3498db; border-color: #3498db; }
input[type="radio"].btn-check { position: absolute; opacity: 0; pointer-events: none; }
.gender-icon.required { border-color: red !important; }
.logo-img { max-height: 50px; margin-bottom: 0.5rem; }
.brand-text { font-size: 1.8rem; letter-spacing: 1.5px; background: white; padding: 0 0.4em; border-radius: 4px; display: inline-block; margin-bottom: 0.3rem; }
.modal-backdrop { position: fixed; top:0; left:0; right:0; bottom:0; background: rgba(0,0,0,0.5); display:flex; align-items:center; justify-content:center; z-index: 1040; }
.modal-card { background: white; padding: 1.5rem; border-radius: 6px; width: 340px; }
.toast-container { position: fixed; bottom: 2rem; right: 2rem; z-index: 1050; display: flex; flex-direction: column; gap: 0.5rem; }
.toast-notification { background: #0d6efd; color: white; padding: 1rem 1.5rem; border-radius: 6px; box-shadow: 0 4px 12px rgba(0,0,0,0.25); animation: slideIn 0.3s ease; }
@keyframes slideIn { from { transform: translateY(50px); opacity:0; } to { transform: translateY(0); opacity:1; } }

/* Styles spécifiques pour le modal d'accès */
.input-group .btn-outline-secondary {
  border-left: 0;
}

/* Style pour l'alerte d'information */
.alert-info {
  background-color: #d1ecf1;
  border-color: #bee5eb;
  color: #0c5460;
  font-size: 0.875rem;
  padding: 0.5rem 0.75rem;
}

.text-danger {
  color: #dc3545 !important;
}
</style>