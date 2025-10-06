<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import axios from 'axios'
import RapportDay from './RapportDay.vue'

const route = useRoute()
const campBibliqueId = ref(route.params.id_campBiblique || '')
const campName = ref('')
const selectedDate = ref('')
const availableDates = ref([])
const selectedSecteur = ref('') // Tab actif

const API = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api'
const allSectors = ref([])

// Récupération du nom du camp
async function fetchCampName() {
  if (!campBibliqueId.value) return
  try {
    const res = await axios.get(`${API}/camp_bibliques/${campBibliqueId.value}`)
    campName.value = res.data?.name || 'Camp inconnu'
  } catch (err) {
    console.error(err)
    campName.value = 'Camp inconnu'
  }
}

// Récupération des secteurs
async function fetchSectors() {
  try {
    const res = await axios.get(`${API}/sectors`)
    allSectors.value = res.data?.member || []
  } catch (err) {
    console.error('Erreur fetch sectors', err)
  }
}

// Récupération des dates de participators
async function fetchDates() {
  try {
    const res = await axios.get(`${API}/participators`)
    const participators = res.data?.member || []

    const datesSet = new Set()
    participators.forEach(p => {
      if (p.createdAt && p.campBiblic?.some(c => c.split('/').pop() === campBibliqueId.value)) {
        datesSet.add(p.createdAt.split('T')[0])
      }
    })

    const sortedDates = Array.from(datesSet).sort((a, b) => new Date(b) - new Date(a))
    availableDates.value = sortedDates
    if (!selectedDate.value || !sortedDates.includes(selectedDate.value)) {
      selectedDate.value = sortedDates[0] || ''
    }
  } catch (err) {
    console.error('Erreur récupération dates participators', err)
  }
}

// Initial fetch
onMounted(() => {
  fetchCampName()
  fetchSectors()
  fetchDates()
  setInterval(fetchDates, 10000)
})

// Fonction pour sélectionner un secteur et rafraîchir les données
function selectSecteur(id) {
  selectedSecteur.value = id

  // Forcer le refresh de RapportDay en changeant sa key
  rapportKey.value = Date.now()
}

// key pour forcer le rechargement du composant enfant
const rapportKey = ref(Date.now())

// Watch pour changement de camp
watch(
  () => route.params.id_campBiblique,
  (newId) => {
    campBibliqueId.value = newId || ''
    fetchCampName()
    fetchDates()
  }
)

const pageTitle = computed(() => campName.value)
const formattedDate = computed(() => {
  if (!selectedDate.value) return ''
  return new Date(selectedDate.value).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' })
})
</script>

<template>
  <div class="be-content be-no-padding">
    <div class="main-content container-fluid">
      <div class="col-12 mt-4" style="margin: 0 auto;">
        <div class="card shadow-sm border-light rounded-3">
          <div class="card-header d-flex justify-content-between align-items-center">
            <h3 class="m-0">{{ pageTitle }}</h3>
            <div class="d-flex align-items-center">
              <label class="m-2 fw-semibold">Filtrer la date :</label>
              <select v-model="selectedDate" class="form-select form-select-sm">
                <option v-for="date in availableDates" :key="date" :value="date">
                  {{ new Date(date).toLocaleDateString('fr-FR') }}
                </option>
              </select>
            </div>
          </div>

          <div class="tab-container">
            <ul class="nav nav-tabs mt-3 px-3" role="tablist">
              <li class="nav-item">
                <a
                  class="nav-link"
                  :class="{ active: selectedSecteur === '' }"
                  href="#home"
                  @click.prevent="selectSecteur('')"
                >
                  Résumé
                </a>
              </li>
              <li v-for="secteur in allSectors" :key="secteur.id" class="nav-item">
                <a
                  class="nav-link"
                  :class="{ active: selectedSecteur === secteur.id }"
                  href="#"
                  @click.prevent="selectSecteur(secteur.id)"
                >
                  {{ secteur.name }}
                </a>
              </li>
            </ul>
            <div class="tab-content" style="max-height: 65vh; padding: 1.5rem;">
              <div v-if="selectedSecteur === ''">
                <h5 class="fw-bold text-secondary mb-3">Rapport du {{ formattedDate }}</h5>
                <p class="text-muted">Résumé des secteurs.</p>
              </div>
              <div v-else>
                <RapportDay :key="rapportKey" :id="selectedSecteur" :date="selectedDate" />
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  </div>
</template>


<style scoped>
.card-header {
  padding: 0.75rem 1rem;
}
.form-select {
  min-width: 130px;
}
.nav-tabs .nav-link {
  font-weight: 500;
  color: #555;
}
.nav-tabs .nav-link.active {
  color: #0d6efd;
  border-color: #0d6efd #0d6efd #fff;
}
</style>
