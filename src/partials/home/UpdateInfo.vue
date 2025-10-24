<script setup>
import { ref, onMounted, watch } from "vue"
import axios from "axios"
import { useRouter, useRoute } from "vue-router"
import { useToast } from 'vue-toastification'
import logo from "/assets/img/mijerca.jpg"

const toast = useToast()

const API_URL = import.meta.env.VITE_API_BASE_URL
const router = useRouter()
const route = useRoute()

// 🔹 Form data
const gender = ref("Soeur")
const phoneNumber = ref("")
const fullName = ref("")
const sector = ref("")
const doyenne = ref("")
const paroisse = ref("")
const users = ref("")
const isResponsable = ref(false)

const sectors = ref([])
const doyennes = ref([])
const filteredDoyennes = ref([])
const paroisses = ref([])
const filteredParoisses = ref([])

const showModal = ref(false)
const roles = ref([
  { key: "isNoyau", label: "Noyau Paroissial", value: false },
  { key: "isDecanal", label: "Noyau décanal", value: false },
  { key: "isDicoces", label: "Noyau diocèse", value: false },
])

const error = ref("")
const isLoading = ref(false)

// 🔹 Formatage téléphone
const formatPhone = () => {
  let digits = phoneNumber.value.replace(/\D/g, '')
  digits = digits.slice(0, 10)
  if (digits.length > 7) {
    phoneNumber.value = digits.slice(0,4) + ' ' + digits.slice(4,7) + ' ' + digits.slice(7)
  } else if (digits.length > 4) {
    phoneNumber.value = digits.slice(0,4) + ' ' + digits.slice(4)
  } else {
    phoneNumber.value = digits
  }
}

// 🔹 Filtrage doyennés et paroisses
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

// 🔹 Chargement données secteurs/doyennés/paroisses et personne
onMounted(async () => {
  try {
    const [sectorRes, doyenneRes, paroisseRes, userRes] = await Promise.all([
      axios.get(`${API_URL}/sectors`),
      axios.get(`${API_URL}/doyennes`),
      axios.get(`${API_URL}/paroisses`),
      axios.get(`${API_URL}/users`)
    ])
    sectors.value = sectorRes.data.member || []
    doyennes.value = doyenneRes.data.member || []
    paroisses.value = paroisseRes.data.member || []
    users.value = userRes.data.member || []

    if(sectors.value.length) sector.value = sectors.value[0].name
    filterDoyennes()

    // 🔹 Charger les infos de la personne à modifier
    const personId = route.query.id
    if(personId) {
      const res = await axios.get(`${API_URL}/people/${personId}`)
      const p = res.data
      if(p) {
        gender.value = p.gender
        fullName.value = p.fullName
        phoneNumber.value = p.phoneNumber.replace(/(\d{4})(\d{3})(\d{3})/, '$1 $2 $3')
        sector.value = sectors.value.find(s => s["@id"] === p.sector)?.name || ""
        filterDoyennes()
        doyenne.value = filteredDoyennes.value.find(d => d["@id"] === p.doyenne)?.name || ""
        filterParoisses()
        paroisse.value = filteredParoisses.value.find(pa => pa["@id"] === p.paroisse)?.name || ""

        // 🔹 Définir les rôles
        roles.value.forEach(r => r.value = !!p[r.key])

        // 🔹 Définir isResponsable si au moins un rôle est true
        isResponsable.value = roles.value.some(r => r.value)
      }
    }
  } catch(err) {
    console.error("Erreur chargement :", err)
    error.value = "Erreur lors du chargement des données."
  }
})

// 🔹 Watchers
watch(sector, filterDoyennes)
watch(doyenne, filterParoisses)

// 🔹 Update personne
async function handleSubmit() {
  isLoading.value = true
  error.value = ""
  try {
    const sectorObj = sectors.value.find(s => s.name === sector.value)
    const doyenneObj = doyennes.value.find(d => d.name === doyenne.value)
    const paroisseObj = paroisses.value.find(p => p.name === paroisse.value)
    const cleanedNumber = phoneNumber.value.replace(/\s+/g, '')

    const roleToRemove = ref ("")
    if (sectorObj["@id"]=== '/api/sectors/1') roleToRemove.value = 'ROLE_EST' 
    else if (sectorObj["@id"]=== '/api/sectors/2') roleToRemove.value = 'ROLE_CENTRE'
    else if (sectorObj["@id"]=== '/api/sectors/3') roleToRemove.value = 'ROLE_OUEST'
    const roleUsers = users.value.find(
      (u) => u.username === cleanedNumber,
    )
    console.log('Id sector :', sectorObj["@id"])
    console.log('Role à  ajouter :', roleToRemove.value)
    // === Retirer le rôle spécifique ===
    let rolesInit = (roleUsers.roles || []).filter(r => (r !== 'ROLE_EST' && r !== 'ROLE_CENTRE' && r !== 'ROLE_OUEST'))
    console.log('Role initiallisé :', rolesInit)
    rolesInit.push(roleToRemove.value)
    console.log('Roles actuels :', rolesInit)

    const payload = {
      gender: gender.value,
      fullName: fullName.value,
      phoneNumber: cleanedNumber,
      sector: sectorObj ? sectorObj["@id"] : null,
      doyenne: doyenneObj ? doyenneObj["@id"] : null,
      paroisse: paroisseObj ? paroisseObj["@id"] : null,
      updatedAt: new Date().toISOString()
    }

    const personId = route.query.id
    if (personId) {
      await axios.patch(`${API_URL}/people/${personId}`, payload, {
        headers: {
          "Content-Type": "application/merge-patch+json",
          "Accept": "application/ld+json",
          // "Authorization": `Bearer ${localStorage.getItem("token")}`
        }
      })

      await axios.patch(`${API_URL}/users/${roleUsers.id}`, {roles : rolesInit}, {
        headers: {
          "Content-Type": "application/merge-patch+json",
          "Accept": "application/ld+json",
          // "Authorization": `Bearer ${localStorage.getItem("token")}`
        }
      })
      toast.success("Mise à jour réussie !")
      router.push({ name: "home" })
    }
  } catch (err) {
    console.error("Erreur update :", err)
    error.value = "Erreur lors de la mise à jour."
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
            <label class="col-12 col-sm-3 col-form-label text-sm-right pt-4">Votre genre</label>
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

