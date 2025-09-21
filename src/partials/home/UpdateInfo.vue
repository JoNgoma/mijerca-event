<script setup>
import { ref, onMounted, watch } from "vue"
import axios from "axios"
import { useRouter } from "vue-router"
import logo from "/assets/img/mijerca.jpg"

const API_URL = import.meta.env.VITE_API_BASE_URL

const gender = ref("Soeur")
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

const showModal = ref(false)
const roles = ref([
  { key: "isNoyau", label: "Noyau", value: false },
  { key: "isDecanal", label: "Décanal", value: false },
  { key: "isDicoces", label: "Diocès", value: false },
])

const error = ref("")
const isLoading = ref(false)
const router = useRouter()

// 🔹 Formatage du numéro
const formatPhone = () => {
  let digits = phoneNumber.value.replace(/\D/g, '');
  digits = digits.slice(0, 10);
  if (digits.length > 4 && digits.length <= 7) {
    phoneNumber.value = digits.slice(0, 4) + ' ' + digits.slice(4);
  } else if (digits.length > 7) {
    phoneNumber.value =
      digits.slice(0, 4) + ' ' + digits.slice(4, 7) + ' ' + digits.slice(7);
  } else {
    phoneNumber.value = digits;
  }
}

// 🔹 Chargement des données
onMounted(async () => {
  try {
    const [sectorRes, doyenneRes, paroisseRes] = await Promise.all([
      axios.get(`${API_URL}/sectors`),
      axios.get(`${API_URL}/doyennes`),
      axios.get(`${API_URL}/paroisses`)
    ])
    sectors.value = sectorRes.data.member
    doyennes.value = doyenneRes.data.member
    paroisses.value = paroisseRes.data.member

    if(sectors.value.length) sector.value = sectors.value[0].name
    filterDoyennes()
  } catch (err) {
    console.error("Erreur chargement données :", err)
  }
})

// 🔹 Watchers pour filtrage
watch(sector, filterDoyennes)
watch(doyenne, filterParoisses)

function filterDoyennes() {
  const selectedSector = sectors.value.find(s => s.name === sector.value)
  if (!selectedSector) {
    filteredDoyennes.value = []
    doyenne.value = ""
    return
  }
  filteredDoyennes.value = doyennes.value.filter(d => d.sector === selectedSector["@id"])
  if (filteredDoyennes.value.length) {
    doyenne.value = filteredDoyennes.value[0].name
  } else {
    doyenne.value = ""
  }
  filterParoisses()
}

function filterParoisses() {
  const selectedDoyenne = filteredDoyennes.value.find(d => d.name === doyenne.value)
  if (!selectedDoyenne) {
    filteredParoisses.value = []
    paroisse.value = ""
    return
  }
  filteredParoisses.value = paroisses.value.filter(p => p.doyenne === selectedDoyenne["@id"])
  if(filteredParoisses.value.length) {
    paroisse.value = filteredParoisses.value[0].name
  } else {
    paroisse.value = ""
  }
}

// 🔹 Gestion formulaire
async function handleSubmit() {
  fullName.value = fullName.value.trim()
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

async function registerUser(roleValues, isResponsible) {
  isLoading.value = true
  try {
    const sectorObj = sectors.value.find(s => s.name === sector.value)
    const sectorUrl = sectorObj ? sectorObj["@id"] : ""

    const doyenneObj = doyennes.value.find(d => d.name === doyenne.value)
    const doyenneUrl = doyenneObj ? doyenneObj["@id"] : ""

    const paroisseObj = paroisses.value.find(p => p.name === paroisse.value)
    const paroisseUrl = paroisseObj ? paroisseObj["@id"] : ""

    const cleanedNumber = phoneNumber.value.replace(/\s+/g, '')

    // 🔹 Création personne
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
      personPayload,{
        headers: {
          "Content-Type": "application/ld+json"
        }
  })
    const personUrl = personRes.data["@id"] || personRes.data.id

    // 🔹 Si responsable, créer également l'utilisateur
    if (isResponsible) {
      const rolesArray = []
      if(roleValues.isDicoces) rolesArray.push("ROLE_DIOCESE")
      if(roleValues.isDecanal) rolesArray.push("ROLE_DECANAL")
      if(roleValues.isNoyau) rolesArray.push("ROLE_NOYAU")
      // Noyau inclus automatiquement
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
        userPayload,{
        headers: {
          "Content-Type": "application/ld+json"
        }
      })
      alert("Inscription réussie !\nVotre mot de passe initial est : mijerca2025")
      router.push({ name: "home" })
      return
    }

    alert("Inscription réussie !")
    router.push({ name: "home" })

  } catch (err) {
    error.value = "Erreur lors de l'inscription."
    console.error(err)
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
          <!-- Téléphone -->
          <div class="form-group">
            <label for="inputPhone">Numéro de téléphone</label>
            <input id="inputPhone" required class="form-control" type="text" disabled @input="formatPhone" v-model="phoneNumber" placeholder="0899 999 999" />
          </div>

          <!-- Genre -->
          <div class="form-group">
            <label class="col-12 col-sm-3 col-form-label text-sm-right pt-4">Sélectionner le genre</label>
            <div class="col-12 col-sm-8 col-lg-6 d-flex">
              <label class="custom-control custom-radio custom-radio-icon custom-control-inline me-2">
                <input class="custom-control-input" type="radio" name="radio-icon" value="Soeur" v-model="gender" />
                <span class="custom-control-label"><i class="mdi mdi-female"></i></span>
              </label>
              <label class="custom-control custom-radio custom-radio-icon custom-control-inline">
                <input class="custom-control-input" type="radio" name="radio-icon" value="Frère" v-model="gender" />
                <span class="custom-control-label"><i class="mdi mdi-male-alt"></i></span>
              </label>
            </div>
          </div>

          <!-- Nom complet -->
          <div class="form-group">
            <label for="inputNames">Noms au complet</label>
            <input class="form-control" v-model="fullName" type="text" placeholder="Joe Doe" />
          </div>

          <!-- Secteur / Doyenné / Paroisse -->
          <div class="form-group">
            <label>Votre secteur</label>
            <select class="form-control" v-model="sector">
              <option v-for="s in sectors" :key="s.id" :value="s.name">{{ s.name }}</option>
            </select>
          </div>

          <div class="form-group">
            <label>Votre doyenné</label>
            <select class="form-control" v-model="doyenne">
              <option v-for="d in filteredDoyennes" :key="d.id" :value="d.name">{{ d.name }}</option>
            </select>
          </div>

          <div class="form-group">
            <label>Votre paroisse</label>
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
              <span v-else>Mettre à jour</span>
            </button>
          </div>
          <div class="form-group text-center">
            <p class="mb-1">
              Retour à l'accueil ?
              <a href="/">Retourner</a>
            </p>
          </div>
          <!-- Error -->
          <p v-if="error" class="text-danger text-center mt-2">{{ error }}</p>
        </form>
      </div>

      <div class="splash-footer text-center">&copy; 2025 Beyin</div>

      <!-- Modal pour responsable -->
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
    </div>
  </div>
</template>

<style scoped>
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
}

.modal-card {
  background: white;
  padding: 1.5rem;
  border-radius: 6px;
  width: 320px;
}
</style>

