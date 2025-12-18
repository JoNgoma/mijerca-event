<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import axios from 'axios'
import ListAffect from './ListAffect.vue'
import EffecTotal from './EffecTotal.vue'

const route = useRoute()
const campBibliqueId = ref(route.params.id_campBiblique || '')
const campName = ref('')
const selectedDate = ref('')
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

// Initial fetch
onMounted(() => {
  fetchCampName()
  fetchSectors()
})

// Fonction pour sélectionner un secteur et rafraîchir les données
function selectSecteur(id) {
  selectedSecteur.value = id

  // Forcer le refresh de ListAffect en changeant sa key
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
  }
)

const pageTitle = computed(() => campName.value)
</script>

<template>
  <div class="be-content be-no-padding">
    <div class="main-content container-fluid">
      <div class="col-12 mt-4" style="margin: 0 auto;">
        <div class="card shadow-sm border-light rounded-3">
          <div class="card-header d-flex justify-content-between align-items-center">
            <h3 class="m-0">{{ pageTitle }}</h3>
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
                  EFFECTIF
                </a>
              </li>
              <li v-for="secteur in allSectors" :key="secteur.id" class="nav-item">
                <a
                  class="nav-link"
                  :class="{ active: selectedSecteur === secteur.id }"
                  :href="`#sec${secteur.id}`"
                  @click.prevent="selectSecteur(secteur.id)"
                >
                  {{ secteur.name }}
                </a>
              </li>
            </ul>
            <div class="tab-content" style=" padding: 1.5rem;">
              <div v-if="selectedSecteur === ''">
                <EffecTotal ></EffecTotal>
              </div>
              <div v-else>
                <ListAffect :key="rapportKey" :id="selectedSecteur" :date="selectedDate" />
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
