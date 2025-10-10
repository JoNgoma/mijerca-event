<script setup>
import { ref, onMounted, watch, computed } from 'vue'
import axios from 'axios'
import { useRoute } from 'vue-router'

// Import des composants
import ListCar from './ListCar.vue'
import InscrDepl from './InscrDepl.vue'
import ListDepl from './ListDepl.vue'

const route = useRoute()
const campBibliqueId = ref(route.params.id_campBiblique || '')
const campName = ref('Camp inconnu')
const selectedTab = ref('carrefours')
const API = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api'

// Données du camp
const camp = ref(null)
const loading = ref(false)

// Charger le camp biblique
async function fetchCamp() {
  if (!campBibliqueId.value) return
  try {
    loading.value = true
    const res = await axios.get(`${API}/camp_bibliques/${campBibliqueId.value}`)
    camp.value = res.data
    campName.value = res.data?.name || 'Camp inconnu'
  } catch (err) {
    console.error('Erreur lors du chargement du camp:', err)
    campName.value = 'Camp inconnu'
  } finally {
    loading.value = false
  }
}

// Composant dynamique selon l'onglet
const getCurrentComponent = computed(() => {
  if (selectedTab.value === 'carrefours') return ListCar
  if (selectedTab.value === 'deplacements') return InscrDepl
  return ListDepl
})

// Recharger le composant enfant à chaque changement d’onglet
const rapportKey = ref(Date.now())
watch(selectedTab, () => {
  rapportKey.value = Date.now()
})

onMounted(fetchCamp)
</script>

<template>
  <div class="be-content be-no-padding">
    <div class="main-content container-fluid">
      <div class="col-12 mt-4">
        <div class="card shadow-sm border-light rounded-3">
          <!-- En-tête -->
          <div class="card-header d-flex justify-content-between align-items-center">
            <h3 class="m-0">{{ campName }}</h3>
          </div>

          <!-- Onglets -->
          <div class="tab-container">
            <ul class="nav nav-tabs mt-3 px-3" role="tablist">
              <li class="nav-item">
                <a
                  href="#"
                  class="nav-link"
                  :class="{ active: selectedTab === 'carrefours' }"
                  @click.prevent="selectedTab = 'carrefours'"
                >
                  Carrefours
                </a>
              </li>

              <li class="nav-item">
                <a
                  href="#"
                  class="nav-link"
                  :class="{ active: selectedTab === 'deplacements' }"
                  @click.prevent="selectedTab = 'deplacements'"
                >
                  Inscrire un déplacement
                </a>
              </li>

              <li class="nav-item">
                <a
                  href="#"
                  class="nav-link"
                  :class="{ active: selectedTab === 'personnes' }"
                  @click.prevent="selectedTab = 'personnes'"
                >
                  Flux de déplacement
                </a>
              </li>
            </ul>

            <!-- Contenu -->
            <div class="tab-content p-4" style="max-height: 75vh; overflow-y: auto;">
              <!-- Chargement -->
              <div v-if="loading" class="text-center py-5">
                <span class="spinner-border text-primary"></span>
                <p class="mt-2 text-muted">Chargement du camp...</p>
              </div>

              <!-- Camp chargé -->
              <component
                v-else-if="camp"
                :is="getCurrentComponent"
                :camp="camp"
                :key="rapportKey"
                v-bind="selectedTab === 'carrefours' ? { type: 'freres' } : {}"
              />

              <!-- Aucun camp trouvé -->
              <div v-else class="text-center py-5 text-muted">
                Aucun camp trouvé.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.nav-tabs .nav-link {
  font-weight: 500;
  color: #555;
  transition: 0.2s ease;
}

.nav-tabs .nav-link:hover {
  color: #0d6efd;
}

.nav-tabs .nav-link.active {
  color: #0d6efd;
  border-color: #0d6efd #0d6efd #fff;
}

.card-header {
  background: linear-gradient(90deg, #f8f9fa, #e9ecef);
}
</style>
