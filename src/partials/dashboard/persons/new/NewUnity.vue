<template>
  <div class="be-content">
    <div class="page-head">
      <h2 class="page-head-title">Nouvelle Unité</h2>
      <nav aria-label="breadcrumb" role="navigation">
        <ol class="breadcrumb page-head-nav">
          <li class="breadcrumb-item">
            <router-link :to="{ name: 'dashboard' }">Dashboard</router-link>
          </li>
          <li class="breadcrumb-item"><router-link
            :to="{ name: 'analytic', params: { serviceType: LocalisationService } }"
            >{{ nameService }}</router-link></li>
          <li class="breadcrumb-item active">Nouvelle Unité</li>
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
                    type="text"
                    placeholder="0899 999 999"
                    v-model="phoneNumber"
                    @input="formatPhoneNumberDisplay"
                  />
                </div>

                <!-- Nom complet -->
                <div class="form-group">
                  <label for="inputNames">Noms au complet</label>
                  <input
                    id="inputNames"
                    class="form-control"
                    type="text"
                    placeholder="Joe Doe"
                    v-model="fullName"
                  />
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
import { ref, onMounted, watch, onUnmounted } from 'vue'
import { useRouter, onBeforeRouteUpdate } from 'vue-router'
import axios from 'axios'
import { useServiceContext } from '@/composables/useServiceContext'

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
const sector = ref("")
const doyenne = ref("")
const paroisse = ref("")
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
// Formatage numéro
// =========================
function formatPhoneNumberDisplay() {
  let digits = phoneNumber.value.replace(/\D/g, '').slice(0, 10)
  if (digits.length > 4 && digits.length <= 7) phoneNumber.value = digits.slice(0,4)+' '+digits.slice(4)
  else if (digits.length > 7) phoneNumber.value = digits.slice(0,4)+' '+digits.slice(4,7)+' '+digits.slice(7)
  else phoneNumber.value = digits
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

    // Appliquer restrictions selon service
    // if (isDioces) {
    //   sectors.value = sectors.value.filter(s => s.name === currentService.value.sector)
    // }
    // if (isDecanal) {
    //   doyennes.value = doyennes.value.filter(d => d.name === currentService.value.doyenne)
    // }
    // if (isNoyau) {
    //   paroisses.value = paroisses.value.filter(p => p.name === currentService.value.paroisse)
    // }

    // Initialisation valeurs
    // if (isDioces && sectors.value.length) {
    //   sector.value = currentService.value.sector
    // } else if (sectors.value.length) {
    //   sector.value = sectors.value[0].name
    // }
    filterDoyennes()

    // Activer watchers après chargement
    stopSectorWatcher = watch(sector, filterDoyennes)
    stopDoyenneWatcher = watch(doyenne, filterParoisses)
  } catch (err) {
    console.error("Erreur chargement données :", err)
  }
}

// =========================
// Gestion montage / démontage
// =========================
onMounted(() => {
  loadData()
})

// Nettoyage complet quand le composant est démonté
onUnmounted(() => {
  if (stopSectorWatcher) stopSectorWatcher()
  if (stopDoyenneWatcher) stopDoyenneWatcher()
  resetForm()
})

// Relancer quand on change de param route (ex: /nouvelle-unite/est -> /nouvelle-unite/ouest)
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
  sector.value = ""
  doyenne.value = ""
  paroisse.value = ""
  // sectors.value = []
  // doyennes.value = []
  // paroisses.value = []
  filteredDoyennes.value = []
  filteredParoisses.value = []
  error.value = ""
  isLoading.value = false
}

// =========================
// Soumission
// =========================
async function handleSubmit(e) {
  e.preventDefault()
  error.value = ""
  isLoading.value = true
  try {
    const cleanedNumber = phoneNumber.value.replace(/\s+/g, '')
    if (!/^\d{10}$/.test(cleanedNumber)) { error.value = "Numéro invalide"; isLoading.value = false; return }
    if (!fullName.value.trim()) { error.value = "Veuillez saisir le nom complet"; isLoading.value = false; return }

    const sectorObj = sectors.value.find(s => s.name === sector.value)
    const doyenneObj = doyennes.value.find(d => d.name === doyenne.value)
    const paroisseObj = paroisses.value.find(p => p.name === paroisse.value)

    // Construire le payload attendu par ton backend
    const payload = {
      gender: gender.value,
      fullName: fullName.value.trim(),
      phoneNumber: cleanedNumber,
      isNoyau: isNoyau, // par ex. lié au switch
      isDecanal: isDecanal,
      isDicoces: isDioces,
      updatedAt: new Date().toISOString(),
      sector: sectorObj ? sectorObj["@id"] : "",
      doyenne: doyenneObj ? doyenneObj["@id"] : "",
      paroisse: paroisseObj ? paroisseObj["@id"] : ""
    }

    console.log("📤 Payload envoyé à /people :", payload)

    const personRes = await axios.post(`${API_URL}/people`, payload, {
      headers: { "Content-Type": "application/ld+json" }
    })

    // console.log("✅ Réponse /people :", personRes.data)

    if (isDioces || isDecanal || isNoyau) {
      let userPayload
      if (isDioces)
        {
      userPayload = {
        username: cleanedNumber,
        roles: ["ROLE_DIOCESE", "ROLE_DECANAL", "ROLE_NOYAU"],
        password: "mijerca2025",
        person: personRes.data["@id"] || personRes.data.id
      }
    } else if (isDecanal)
        {
      userPayload = {
        username: cleanedNumber,
        roles: ["ROLE_DECANAL", "ROLE_NOYAU"],
        password: "mijerca2025",
        person: personRes.data["@id"] || personRes.data.id
      }
    }
    else if (isNoyau)
        {
      userPayload = {
        username: cleanedNumber,
        roles: ["ROLE_NOYAU"],
        password: "mijerca2025",
        person: personRes.data["@id"] || personRes.data.id
      }
    }

      console.log("📤 Payload envoyé à /users :", userPayload)

      const userRes = await axios.post(`${API_URL}/users`, userPayload, {
        headers: { "Content-Type": "application/ld+json" }
      })

      console.log("✅ Réponse /users :", userRes.data)
      alert("Responsable ajouté ! Mot de passe initial : mijerca2025")
    } else {
      alert("Jeune ajouté avec succès !")
    }
    resetForm()
    // router.push({ name: "dashboard" })
  } catch (err) {
    console.error("❌ Erreur handleSubmit :", err.response?.data || err)
    error.value = "Erreur lors de l'enregistrement"
  } finally {
    isLoading.value = false
  }
}
</script>

