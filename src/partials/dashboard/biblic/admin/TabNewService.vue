<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useServiceContext } from '@/composables/useServiceContext'
import axios from 'axios'
import { useToast } from 'vue-toastification'

const toast = useToast()
const router = useRouter()
const route = useRoute()
const { currentService } = useServiceContext()

const pageTitle = computed(() => currentService.value.name)
const apiAccess = computed(() => currentService.value.api)
const title = ref('')
const API = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api'

// === États ===
const campId = computed(() => route.params.id_campBiblique || null)
const campName = ref('')
const peopleOptions = ref([])
const selectedPeople = ref([])
const allParoisses = ref([])
const allPeople = ref([])
const allUsers = ref([])
const loading = ref(false)
const refreshing = ref(false)

// === FONCTION PAGINATION OPTIMISÉE ===
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
    
    console.log(`📊 ${baseUrl} - ${allItems.length} enregistrements chargés`);
    return allItems;
  } catch (error) {
    console.error(`Erreur lors de la récupération paginée de ${baseUrl}:`, error);
    throw error;
  }
}

// === Utils ===
const extractIdFromUrl = (url) => {
  if (!url && url !== 0) return null
  try {
    return String(url).split('/').pop() || null
  } catch {
    return null
  }
}

// === Fetch Camp Name ===
async function fetchCampName() {
  if (!campId.value) return
  try {
    const res = await axios.get(`${API}/camp_bibliques/${campId.value}`)
    campName.value = res.data?.name || 'Camp inconnu'
    title.value = campName.value
  } catch {
    toast.error('Impossible de récupérer le nom du camp')
    campName.value = 'Camp inconnu'
  }
}

// === Fetch All Data AVEC PAGINATION ===
async function fetchAll() {
  try {
    loading.value = true
    const [paroisses, people, users] = await Promise.all([
      fetchAllPages(`${API}/paroisses`),
      fetchAllPages(`${API}/people`),
      fetchAllPages(`${API}/users`),
    ])

    allParoisses.value = paroisses
    allPeople.value = people
    allUsers.value = users

    buildPeopleOptions()
    await nextTick()
  } catch (err) {
    console.error(err)
    toast.error('Erreur lors du chargement,\nVeuillez ressayer plus tard')
  } finally {
    loading.value = false
  }
}

// === Fonction de rafraîchissement ===
async function refreshData() {
  try {
    refreshing.value = true
    await fetchAll()
    toast.success('Liste des responsables actualisée')
  } catch (err) {
    console.error('Erreur lors du rafraîchissement:', err)
    toast.error('Erreur lors de l\'actualisation')
  } finally {
    refreshing.value = false
  }
}

// === Construction des options à partir de users reliés à des people ===
async function buildPeopleOptions() {
  try {
    // Récupérer tous les enregistrements du service courant AVEC PAGINATION
    const existingMembers = await fetchAllPages(`${API}${apiAccess.value}`)

    // On ne garde que les enregistrements du camp courant
    const filteredMembers = existingMembers.filter(
      (item) => item.campBiblic === `/api/camp_bibliques/${campId.value}`,
    )

    if (!filteredMembers.length) {
      console.warn(
        `Aucun enregistrement trouvé pour le camp ${campId.value} dans ${apiAccess.value}`,
      )
      peopleOptions.value = [] // vide la liste proprement
      return
    }

    // Extraire les userId déjà assignés à ce service et à ce camp
    const assignedUserIds = filteredMembers
      .map((item) => {
        const user = item.user
        if (Array.isArray(user)) {
          return user.map((u) => extractIdFromUrl(u))
        } else if (user) {
          return [extractIdFromUrl(user)]
        }
        return []
      })
      .flat()
      .filter(Boolean)

    // Construire les options uniquement pour les utilisateurs non encore liés
    peopleOptions.value = allUsers.value
      .filter((u) => {
        const userId = extractIdFromUrl(u['@id'] || u.id)
        return !assignedUserIds.includes(userId)
      })
      .map((u) => {
        const person = allPeople.value.find((pe) => pe['@id'] === u.person)
        if (!person) return null

        const paroisse = allParoisses.value.find((pa) => pa['@id'] === person.paroisse)
        const niveau = person.isDiocesan ? 'Diocésain' : person.isDecanal ? 'Décanal' : 'Paroissial'

        return {
          id: extractIdFromUrl(u['@id'] || u.id),
          userId: extractIdFromUrl(u['@id'] || u.id),
          fullName: person.fullName?.trim() || 'Nom inconnu',
          gender: person.gender || '',
          paroisseName: paroisse?.name || 'Paroisse inconnue',
          displayName: `${person.gender} ${person.fullName} (${niveau}), ${paroisse?.name || 'Paroisse inconnue'}`,
          rawUser: u,
          rawPerson: person,
        }
      })
      .filter(Boolean)
      .sort((a, b) => a.fullName.localeCompare(b.fullName))

    console.log(`👥 ${peopleOptions.value.length} personnes disponibles pour affectation`)
  } catch (err) {
    toast.error('Erreur de chargement,\nRevenez-y plus tard')
    console.error('Erreur lors de la construction des options:', err)
    peopleOptions.value = []
  }
}

// === Gestion des sélections ===
function onAddFromLeft(e) {
  const ids = Array.from(e.target.selectedOptions).map((o) => o.value)
  ids.forEach((id) => {
    const p = peopleOptions.value.find((pe) => pe.id === id)
    if (p) {
      selectedPeople.value.push(p)
      peopleOptions.value = peopleOptions.value.filter((pe) => pe.id !== id)
    }
  })
  selectedPeople.value.sort((a, b) => a.fullName.localeCompare(b.fullName))
}

function onRemoveFromRight(e) {
  const ids = Array.from(e.target.selectedOptions).map((o) => o.value)
  ids.forEach((id) => {
    const p = selectedPeople.value.find((pe) => pe.id === id)
    if (p) {
      peopleOptions.value.push(p)
      selectedPeople.value = selectedPeople.value.filter((pe) => pe.id !== id)
    }
  })
  peopleOptions.value.sort((a, b) => a.fullName.localeCompare(b.fullName))
}

// === Enregistrement ===
async function handleSubmit() {
  if (!campId.value) {
    toast.error('Aucune activité trouvée')
    return
  }

  if (!selectedPeople.value.length) {
    toast.error('Aucune personne sélectionnée')
    return
  }

  try {
    loading.value = true

    // Nom du camp pour le rôle
    const campRes = await axios.get(`${API}/camp_bibliques/${campId.value}`)
    const camp = campRes.data
    const campLabel = camp.name || ''
    // Déterminer le préfixe : CA si "Camp biblique" est présent, sinon EC
    const prefix = /camp\s*biblique/i.test(campLabel) ? 'CA' : 'EC'

    // Extraire les lettres et l'année (ex: 2025)
    const shortCamp =
      (campLabel
        .match(/[A-Za-z]/g)
        ?.slice(0, 2)
        .join('') || prefix) + (campLabel.match(/\d{4}$/)?.[0] || 'XXXX')

    // Rôle complet
    const roleToAssign = `${currentService.value.role}${shortCamp.toUpperCase()}`
    
    // Pour chaque user sélectionné
    for (const p of selectedPeople.value) {
      const userId = p.userId
      
      // Récupérer les enregistrements existants du service pour ce user AVEC PAGINATION
      const existingItems = await fetchAllPages(`${API}${apiAccess.value}?user=/api/users/${userId}`)
      
      // On ne garde que ceux du camp courant
      const filteredExistingItem = existingItems.filter(
        item => item.campBiblic === `/api/camp_bibliques/${campId.value}`
      )

      if (!filteredExistingItem.length) {
        console.warn(`Aucun service trouvé pour le camp ${campId.value} pour l'utilisateur ${p.fullName}`)
        continue
      }

      try {
        const userData = await axios.get(`${API}/users/${userId}`)
        const currentRoles = userData.data.roles || []
        if (!currentRoles.includes(roleToAssign)) {
          const updatedRoles = [...currentRoles, roleToAssign]
          
          // Déterminer le champ du service
          const serviceField = apiAccess.value.replace('/', '')
          const currentSer = userData.data[serviceField] || []
          const updatedSer = [
            ...currentSer,
            `/api${apiAccess.value}/${extractIdFromUrl(filteredExistingItem[0]['@id'])}`,
          ]
          
          await axios.patch(
            `${API}/users/${userId}`,
            {
              roles: updatedRoles,
              [serviceField]: updatedSer,
            },
            {
              headers: { 'Content-Type': 'application/merge-patch+json' },
            },
          )
        }
      } catch (roleErr) {
        console.warn(`Erreur patch rôle pour ${p.fullName}`, roleErr)
      }
    }
    
    toast.success(
      `${selectedPeople.value.length} ${selectedPeople.value.length>1 ? 'responsables ajoutés':'responsable ajouté'} avec succès\nRôle : ${roleToAssign}`,
    )
    selectedPeople.value = []
    await fetchAll()
  } catch (err) {
    console.error(err)
    toast.error('Erreur lors du traitement des affectations')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchCampName()
  fetchAll()
})
</script>

<template>
  <div class="be-content">
    <div class="page-head">
      <div class="d-flex justify-content-between align-items-center">
        <div>
          <h2 class="page-head-title">{{ title }}</h2>
          <nav aria-label="breadcrumb">
            <ol class="breadcrumb page-head-nav">
              <li class="breadcrumb-item">
                <router-link :to="{ name: 'dashboard' }">Dashboard</router-link>
              </li>
              <li class="breadcrumb-item"><a href="#">Affectation service</a></li>
              <li class="breadcrumb-item active">{{ pageTitle }}</li>
            </ol>
          </nav>
        </div>
        <!-- <button 
          @click="refreshData" 
          class="btn btn-outline-primary btn-sm" 
          :disabled="refreshing || loading"
        >
          <span v-if="refreshing" class="spinner-border spinner-border-sm me-1"></span>
          <i v-else class="fas fa-sync-alt me-1"></i>
          {{ refreshing ? 'Actualisation...' : 'Actualiser' }}
        </button> -->
      </div>
    </div>

    <div class="main-content container-fluid">
      <form class="row" @submit.prevent="handleSubmit">
        <div class="col-lg-12">
          <div class="card card-border-color card-border-color-primary">
            <div class="card-body">
              <div class="row mb-3">
                <!-- Liste des responsables -->
                <div class="col-md-6">
                  <label class="fw-bold mb-2">Responsables disponibles</label>
                  <select
                    multiple
                    class="form-control"
                    style="height: 30rem"
                    @change="onAddFromLeft"
                  >
                    <option v-for="p in peopleOptions" :key="p.id" :value="p.id">
                      {{ p.displayName }}
                    </option>
                  </select>
                  <small class="text-muted">Clique pour ajouter →</small>
                  <div class="mt-2 text-muted small">
                    {{ peopleOptions.length }} personne(s) disponible(s)
                  </div>
                </div>

                <!-- Liste sélectionnée -->
                <div class="col-md-6">
                  <label class="fw-bold mb-2">Responsables sélectionnés</label>
                  <select
                    multiple
                    class="form-control"
                    style="height: 30rem"
                    @change="onRemoveFromRight"
                  >
                    <option v-for="p in selectedPeople" :key="p.id" :value="p.id">
                      {{ p.displayName }}
                    </option>
                  </select>
                  <small class="text-muted">← Clique pour retirer</small>
                  <div class="mt-2 text-muted small">
                    {{ selectedPeople.length }} personne(s) sélectionnée(s)
                  </div>
                </div>
              </div>

              <div class="row pt-3">
                <div class="col-12 d-flex justify-content-end">
                  <button class="btn btn-secondary mr-4" type="button" @click="router.back()">
                    Retour
                  </button>
                  <button 
                    class="btn btn-primary" 
                    type="submit" 
                    :disabled="loading || selectedPeople.length === 0"
                  >
                    <span
                      v-if="loading"
                      class="spinner-border spinner-border-sm mx-3"
                      role="status"
                    ></span>
                    <span v-else>Enregistrer ({{ selectedPeople.length }})</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>
.fw-bold {
  font-weight: 600;
}

.text-muted.small {
  font-size: 0.875rem;
}
</style>