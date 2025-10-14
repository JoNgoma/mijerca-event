<script setup>
import { ref, onMounted, onUnmounted, watch } from "vue"
import axios from "axios"
import { useRouter } from "vue-router"
import logo from "/assets/img/mijerca.jpg"

const API_URL = import.meta.env.VITE_API_BASE_URL

// 🔹 Variables formulaire
const gender = ref("")
const phoneNumber = ref("")
const fullName = ref("")
const sector = ref("")
const doyenne = ref("")
const paroisse = ref("")
const isResponsable = ref(false)

const sectors = ref([])
const doyennes = ref([])
const filteredDoyennes = ref([])
const paroisses = ref([])
const filteredParoisses = ref([])

const showModal = ref(false)           // Modal pour rôles
const showInfoModal = ref(false)       // Modal pour "Voir info"
const roles = ref([
  { key: "isNoyau", label: "Noyau Paroissial", value: false },
  { key: "isDecanal", label: "Noyau décanal", value: false },
  { key: "isDicoces", label: "Noyau diocèse", value: false },
])

const infoNumber = ref("")             // Numéro saisi dans modal "Voir info"
const error = ref("")
const genderError = ref("")
const isLoading = ref(false)
const router = useRouter()

// 🔹 Toast amélioré
const toasts = ref([])
function notify(msg, delay = 4000) {
  return new Promise(resolve => {
    const id = Date.now()
    toasts.value.push({ id, msg })
    setTimeout(() => {
      toasts.value = toasts.value.filter(t => t.id !== id)
      resolve()
    }, delay)
  })
}

// 🔹 SSE
let eventSource = null
const newPeople = ref([])

// Ref ou string → string formatée
const formatPhone = (target) => {
  let val = target?.value ?? target ?? ''
  let digits = val.replace(/\D/g, '').slice(0, 10)

  if (digits.length > 7) {
    digits = digits.slice(0, 4) + ' ' + digits.slice(4, 7) + ' ' + digits.slice(7)
  } else if (digits.length > 4) {
    digits = digits.slice(0, 4) + ' ' + digits.slice(4)
  }

  if (target?.value !== undefined) {
    target.value = digits   // pour les refs
  } else {
    return digits          // pour les strings
  }
}

// 🔹 Chargement données
onMounted(async () => {
  try {
    const [sectorRes, doyenneRes, paroisseRes] = await Promise.all([
      axios.get(`${API_URL}/sectors`),
      axios.get(`${API_URL}/doyennes`),
      axios.get(`${API_URL}/paroisses`)
    ])
    sectors.value = sectorRes.data.member || []
    doyennes.value = doyenneRes.data.member || []
    paroisses.value = paroisseRes.data.member || []

    if (sectors.value.length) sector.value = sectors.value[0].name
    filterDoyennes()
  } catch (err) {
    console.error("Erreur chargement données :", err)
    notify("Erreur chargement données.")
  }

  // 🔹 SSE
  eventSource = new EventSource(`${API_URL.replace("/api","")}/sse/people`)
  eventSource.onmessage = (event) => {
    const data = JSON.parse(event.data)
    newPeople.value.push(data)
  }
  eventSource.onerror = (err) => {
    console.error("❌ SSE error", err)
    eventSource.close()
  }
})

onUnmounted(() => {
  if (eventSource) eventSource.close()
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
    await notify("Veuillez sélectionner un genre.") 
    return
  }

  if (isResponsable.value) {
    showModal.value = true
    return
  }
  await registerUser({ isNoyau: false, isDecanal: false, isDicoces: false }, false)
}

function cancelModal() {
  showModal.value = false
}

async function submitModal() {
  showModal.value = false
  const roleValues = roles.value.reduce((acc, role) => {
    acc[role.key] = role.value
    return acc
  }, {})
  await registerUser(roleValues, true)
}

// 🔹 Modal "Voir info"
// function openInfoModal() {
//   infoNumber.value = ""
//   showInfoModal.value = true
// }

function cancelInfoModal() {
  showInfoModal.value = false
}

async function submitInfoModal() {
  const cleanedNumber2 = infoNumber.value.replace(/\s+/g, '')
  if (!cleanedNumber2) {
    await notify("Veuillez saisir un numéro.")
    return
  }

  try {
    // Rechercher directement la personne par numéro
    const res = await axios.get(`${API_URL}/people?phoneNumber=${cleanedNumber2}`)
    const person = res.data.member?.find(d => d.phoneNumber === cleanedNumber2)
    if (person) {
      router.push({ path: "/update-info", query: { id: person.id || person["@id"] } })
      showInfoModal.value = false
    } else {
      await notify("Numéro non trouvé.")
    }
  } catch (err) {
    console.error("Erreur recherche numéro :", err)
    await notify("Erreur lors de la recherche.")
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
        // "Authorization": `Bearer ${localStorage.getItem("token")}`
       } }
    )
    let roleSector ='' 
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
        roles: rolesArray,
        password: "mijerca2025",
        person: personUrl
      }

      await axios.post(
        `${API_URL}/users`,
        userPayload,
        { headers: { "Content-Type": "application/ld+json" } }
      )
      await notify(`Inscription réussie ! Votre mot de passe initial est : mijerca2025`)
      router.push({ name: "home" })
      return
    }

    await notify("Inscription réussie !")
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

    await notify(error.value)
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
              Etes-vous déjà enregistré ? 
              <a href="#" @click.prevent="showInfoModal = true">Voir mes infos</a>
              </p>
          </div>

          <!-- Erreur -->
          <p v-if="error" class="text-danger text-center mt-2">{{ error }}</p>
        </form>
      </div>

      <div class="splash-footer text-center">&copy; 2025 Beyin</div>

      <!-- Modal -->
      <div v-if="showModal" class="modal-backdrop">
        <div class="modal-card">
          <h5>Choisir les responsabilités</h5>
          <div class="form-check" v-for="role in roles" :key="role.key">
            <input type="checkbox" class="form-check-input" v-model="role.value" :id="role.key" />
            <label class="form-check-label" :for="role.key">{{ role.label }}</label>
          </div>
          <div class="mt-3 d-flex justify-content-between">
            <button class="btn btn-primary" @click="submitModal">S'enregistrer</button>
            <button class="btn btn-secondary" @click="cancelModal">Retour</button>
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
            <button @click="submitInfoModal" class="btn btn-primary" :disabled="isLoading">
              <span v-if="isLoading" class="spinner-border spinner-border-sm"></span>
              <span v-else>Valider</span>
            </button>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<style scoped>
.gender-icon {
  width: 3.5rem;
  height: 3.5rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  cursor: pointer;
  border: 2px solid #ccc;
  transition: all 0.3s ease;
}

.btn-check:checked + .gender-icon {
  color: #fff;
  font-weight: bold;
  transform: scale(1.1);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

#genderSoeur:checked + .gender-icon {
  background-color: #e74c3c;
  border-color: #e74c3c;
}

#genderFrere:checked + .gender-icon {
  background-color: #3498db;
  border-color: #3498db;
}

input[type="radio"].btn-check {
  position: absolute;
  opacity: 0;
  pointer-events: none;
}

.gender-icon.required {
  border-color: red !important;
}

.logo-img {
  max-height: 50px;
  margin-bottom: 0.5rem;
}

.brand-text {
  font-size: 1.8rem;
  letter-spacing: 1.5px;
  background: white;
  padding: 0 0.4em;
  border-radius: 4px;
  display: inline-block;
  margin-bottom: 0.3rem;
}

.modal-backdrop {
  position: fixed;
  top:0; left:0; right:0; bottom:0;
  background: rgba(0,0,0,0.5);
  display:flex;
  align-items:center;
  justify-content:center;
  z-index: 1040;
}

.modal-card {
  background: white;
  padding: 1.5rem;
  border-radius: 6px;
  width: 320px;
}

.toast-container {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  z-index: 1050;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.toast-notification {
  background: #0d6efd;
  color: white;
  padding: 1rem 1.5rem;
  border-radius: 6px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.25);
  animation: slideIn 0.3s ease;
}

@keyframes slideIn {
  from { transform: translateY(50px); opacity:0; }
  to { transform: translateY(0); opacity:1; }
}
</style>
