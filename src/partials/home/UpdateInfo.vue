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
  
  // MODIFICATION : Supprime la réinitialisation automatique:
  // doyenne.value = filteredDoyennes.value[0]?.name || "" 
  filterParoisses()
}

function filterParoisses() {
  const selectedDoyenne = filteredDoyennes.value.find(d => d.name === doyenne.value)
  filteredParoisses.value = selectedDoyenne
    ? paroisses.value.filter(p => p.doyenne === selectedDoyenne["@id"])
    : []
  
  // MODIFICATION : Supprime la réinitialisation automatique:
  // paroisse.value = filteredParoisses.value[0]?.name || "" 
}

// 🔹 Chargement données secteurs/doyennés/paroisses et personne avec pagination
onMounted(async () => {
  try {
    // ... (Chargement paginé des données secteurs, doyennes, paroisses, users) ...
    const [sectorData, doyenneData, paroisseData, userData] = await Promise.all([
      fetchAllPages(`${API_URL}/sectors`),
      fetchAllPages(`${API_URL}/doyennes`),
      fetchAllPages(`${API_URL}/paroisses`),
      fetchAllPages(`${API_URL}/users`)
    ])
    
    sectors.value = sectorData || []
    doyennes.value = doyenneData || []
    paroisses.value = paroisseData || []
    users.value = userData || []
    
    // Initialisation du secteur par défaut (si non en mode modification)
    if(sectors.value.length) sector.value = sectors.value[0].name
    
    // Variables temporaires pour stocker les noms corrects de la personne
    let personDoyenneName = ''
    let personParoisseName = ''

    // 🔹 Charger les infos de la personne à modifier
    const personId = route.query.id
    if(personId) {
      const res = await axios.get(`${API_URL}/people/${personId}`)
      const p = res.data
      if(p) {
        gender.value = p.gender
        fullName.value = p.fullName
        phoneNumber.value = p.phoneNumber.replace(/(\d{4})(\d{3})(\d{3})/, '$1 $2 $3')
        
        // 1. Définir le secteur
        sector.value = sectors.value.find(s => s["@id"] === p.sector)?.name || ""
        
        // 2. Stocker les noms pour éviter qu'ils soient écrasés
        personDoyenneName = doyennes.value.find(d => d["@id"] === p.doyenne)?.name || ""
        personParoisseName = paroisses.value.find(pa => pa["@id"] === p.paroisse)?.name || ""

        // 3. Filtrer les doyennés (basé sur le secteur)
        filterDoyennes() 
        
        // 4. Appliquer le doyenné de la personne
        doyenne.value = personDoyenneName

        // 5. Filtrer les paroisses (basé sur le doyenné appliqué)
        filterParoisses()

        // 6. Appliquer la paroisse de la personne
        paroisse.value = personParoisseName

        // 🔹 Définir les rôles et isResponsable (logique conservée)
        roles.value.forEach(r => r.value = !!p[r.key])
        isResponsable.value = roles.value.some(r => r.value)
        
        // console.log('👤 Personne chargée pour modification:', p.fullName)
      }
    } else {
        // Si c'est un NOUVEL ajout, initialiser les listes
        filterDoyennes();
        doyenne.value = filteredDoyennes.value[0]?.name || "";
        filterParoisses();
        paroisse.value = filteredParoisses.value[0]?.name || "";
    }
  } catch(err) {
    // ... (gestion d'erreur) ...
  }
})

// 🔹 Watchers
watch(sector, filterDoyennes)
watch(doyenne, filterParoisses)

// 🔹 Validation fullName
function validateFullName(name) {
  const regex = /^([A-Za-z]+(-[A-Za-z]+)?)(\s[A-Za-z]+(-[A-Za-z]+)?)*$/ 
  return regex.test(name)
}

// 🔹 Update personne
async function handleSubmit() {
  isLoading.value = true
  error.value = ""

  // 🔹 Vérifier fullName
  if(!validateFullName(fullName.value.trim())) {
    error.value = "Le nom complet ne doit contenir que des lettres"
    isLoading.value = false
    toast.error("Le nom complet ne doit contenir que des lettres")
    return
  }

  try {
    const sectorObj = sectors.value.find(s => s.name === sector.value)
    const doyenneObj = doyennes.value.find(d => d.name === doyenne.value)
    const paroisseObj = paroisses.value.find(p => p.name === paroisse.value)
    const cleanedNumber = phoneNumber.value.replace(/\s+/g, '')

    const roleToRemove = ref("")
    if (sectorObj["@id"]=== '/api/sectors/1') roleToRemove.value = 'ROLE_EST' 
    else if (sectorObj["@id"]=== '/api/sectors/2') roleToRemove.value = 'ROLE_CENTRE'
    else if (sectorObj["@id"]=== '/api/sectors/3') roleToRemove.value = 'ROLE_OUEST'
    
    const roleUsers = users.value.find((u) => u.username === cleanedNumber)

    const payload = {
      gender: gender.value,
      fullName: fullName.value.trim(),
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
        }
      })
      
      if (roleUsers) {
        let rolesInit = (roleUsers.roles || []).filter(r => (r !== 'ROLE_EST' && r !== 'ROLE_CENTRE' && r !== 'ROLE_OUEST'))
        rolesInit.push(roleToRemove.value)
        await axios.patch(`${API_URL}/users/${roleUsers.id}`, {roles : rolesInit}, {
          headers: {
            "Content-Type": "application/merge-patch+json",
            "Accept": "application/ld+json",
          }
        })
      }
      
      toast.success("Mise à jour réussie !")
      router.push({ name: "home" })
    }
  } catch (err) {
    console.error("Erreur update :", err)
    error.value = "Erreur lors de la mise à jour."
    toast.error("Erreur lors de la mise à jour.")
  } finally {
    isLoading.value = false
  }
}

// 🔹 Fonctions modales (conservées pour compatibilité)
function cancelModal() {
  showModal.value = false
}

function submitModal() {
  showModal.value = false
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
            <label class="col-12 col-form-label text-lg-left pt-4">
              Sélectionner le genre
            </label>
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

      <div class="splash-footer text-center">
        <p class="copyright mb-0">
          &copy; MIJERCA Kinshasa 2025. Tous droits réservés.
          <br />
          <span class="d-block mt-1  pb-3">
            Prod. by 
            <a target="_blank" href="https://josue-ngoma-folio.onrender.com/" class="text-decoration-none">
              Beyin LQ
            </a>
          </span>
        </p>
      </div>

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