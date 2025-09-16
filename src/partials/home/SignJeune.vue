<script setup>
import { ref, onMounted } from "vue"
import axios from "axios"
import { useRouter } from "vue-router"
import logo from "/assets/img/mijerca.jpg"

const API_URL = import.meta.env.VITE_API_BASE_URL

const gender = ref("F")
const phoneNumber = ref("")
const fullName = ref("")
const sector = ref("KIN EST")
const doyenne = ref("Saint Noé Mawaggali")
const paroisse = ref("Saint Noé Mawaggali")
const isResponsable = ref(false)

const showModal = ref(false)
const roles = ref([
  { key: "isNoyau", label: "Noyau", value: false },
  { key: "isDecanal", label: "Décanal", value: false },
  { key: "isDicoces", label: "Diocès", value: false },
])

const error = ref("")
const isLoading = ref(false)
const router = useRouter()

onMounted(() => {
  if (window.App) {
    App.init()
    App.masks()
  }
})

async function handleSubmit() {
  if (isResponsable.value) {
    showModal.value = true
    return
  }
  await registerUser({
    isNoyau: false,
    isDecanal: false,
    isDicoces: false,
  })
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
  await registerUser(roleValues)
}

async function registerUser(roleValues) {
  isLoading.value = true
  try {
    const payload = {
      gender: gender.value,
      phoneNumber: phoneNumber.value,
      fullName: fullName.value,
      sector: sector.value,
      doyenne: doyenne.value,
      paroisse: paroisse.value,
      ...roleValues,
      updatedAt: new Date().toISOString(),
    }
    await axios.post(`${API_URL}/people`, payload)
    alert("Inscription réussie !")
    router.push({ name: "login" })
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
          <!-- Genre -->
          <div class="form-group">
            <label class="col-12 col-sm-3 col-form-label text-sm-right pt-4">Sélectionner le genre</label>
            <div class="col-12 col-sm-8 col-lg-6 d-flex">
              <label class="custom-control custom-radio custom-radio-icon custom-control-inline me-2">
                <input class="custom-control-input" type="radio" name="radio-icon" value="F" v-model="gender" checked />
                <span class="custom-control-label"><i class="mdi mdi-female"></i></span>
              </label>
              <label class="custom-control custom-radio custom-radio-icon custom-control-inline">
                <input class="custom-control-input" type="radio" name="radio-icon" value="M" v-model="gender" />
                <span class="custom-control-label"><i class="mdi mdi-male-alt"></i></span>
              </label>
            </div>
          </div>

          <!-- Téléphone -->
          <div class="form-group">
            <label for="inputPhone">Numéro de téléphone</label>
            <input id="inputPhone" data-mask="phone-int" required class="form-control" type="text" v-model="phoneNumber" placeholder="+243 999 999 999" />
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
              <option value="KIN EST">KIN EST</option>
              <option value="KIN CENTRE">KIN CENTRE</option>
              <option value="KIN OUEST">KIN OUEST</option>
            </select>
          </div>

          <div class="form-group">
            <label>Sélectionner le doyenné</label>
            <select class="form-control" v-model="doyenne">
              <option value="Saint Noé Mawaggali">Saint Noé Mawaggali</option>
              <option value="NODASA">NODASA</option>
              <option value="Saint Sacrement">Saint Sacrement</option>
            </select>
          </div>

          <div class="form-group">
            <label>Sélectionner la paroisse</label>
            <select class="form-control" v-model="paroisse">
              <option value="Saint Norbert">Saint Norbert</option>
              <option value="Saint Noé Mawaggali">Saint Noé Mawaggali</option>
              <option value="Saint Mugaga">Saint Mugaga</option>
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
