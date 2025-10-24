<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import axios from 'axios'
import ListServices from './ListServices.vue'
import EffecTotal from './EffecTotal.vue'

const route = useRoute()
const campBibliqueId = ref(route.params.id_campBiblique || '')
const campName = ref('')
const selectedDate = ref('')
const selectedService = ref('') // Tab actif

const API = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api'

// Liste statique des services
const allServices = ref([
  { id: 'adm', name: 'Administration', apiAccess: '/administrations' },
  { id: 'fin', name: 'Finances', apiAccess: '/finances' },
  { id: 'heb', name: 'Hébergement', apiAccess: '/hebergements' },
  { id: 'sec', name: 'Secrétariat', apiAccess: '/informatiques' }
])

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

// Initial fetch
onMounted(() => {
  fetchCampName()
})

// Fonction pour sélectionner un service et rafraîchir les données
function selectService(id) {
  selectedService.value = id
  rapportKey.value = Date.now() // Forcer le refresh du composant enfant
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
                  :class="{ active: selectedService === '' }"
                  href="#home"
                  @click.prevent="selectService('')"
                >
                  EFFECTIF
                </a>
              </li>
              <li v-for="service in allServices" :key="service.id" class="nav-item">
                <a
                  class="nav-link"
                  :class="{ active: selectedService === service.id }"
                  href="#"
                  @click.prevent="selectService(service.id)"
                >
                  {{ service.name }}
                </a>
              </li>
            </ul>
            <div class="tab-content" style="max-height: 65vh; padding: 1.5rem;">
              <div v-if="selectedService === ''">
                <EffecTotal></EffecTotal>
              </div>
              <div v-else>
                <ListServices :key="rapportKey" :id="selectedService" :date="selectedDate" :apiAccess="apiAccess" />
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
