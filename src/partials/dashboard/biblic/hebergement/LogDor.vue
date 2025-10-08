<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import axios from 'axios'
import { useRoute } from 'vue-router'
import ListDor from './ListDor.vue'

const route = useRoute()
const campBibliqueId = ref(route.params.id_campBiblique || '')
const campName = ref('')
const selectedTab = ref('freres') // 'freres' ou 'soeurs'
const API = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api'

// Données du camp
const camp = ref(null)

// Récupération du camp biblique
async function fetchCamp() {
  if (!campBibliqueId.value) return
  try {
    const res = await axios.get(`${API}/camp_bibliques/${campBibliqueId.value}`)
    camp.value = res.data
    campName.value = res.data?.name || 'Camp inconnu'
  } catch (err) {
    console.error('Erreur fetchCamp', err)
    campName.value = 'Camp inconnu'
  }
}

onMounted(fetchCamp)

// Forcer le rechargement du composant enfant à chaque changement d’onglet
const rapportKey = ref(Date.now())
watch(selectedTab, () => {
  rapportKey.value = Date.now()
})
</script>

<template>
  <div class="be-content be-no-padding">
    <div class="main-content container-fluid">
      <div class="col-12 mt-4">
        <div class="card shadow-sm border-light rounded-3">
          <div class="card-header d-flex justify-content-between align-items-center">
            <h3 class="m-0">{{ campName }}</h3>
          </div>

          <div class="tab-container">
            <ul class="nav nav-tabs mt-3 px-3" role="tablist">
              <li class="nav-item">
                <a
                  href="#"
                  class="nav-link"
                  :class="{ active: selectedTab === 'freres' }"
                  @click.prevent="selectedTab = 'freres'"
                >
                  Frères
                </a>
              </li>
              <li class="nav-item">
                <a
                  href="#"
                  class="nav-link"
                  :class="{ active: selectedTab === 'soeurs' }"
                  @click.prevent="selectedTab = 'soeurs'"
                >
                  Soeurs
                </a>
              </li>
            </ul>

            <div class="tab-content p-4" style="max-height: 75vh; overflow-y: auto;">
              <ListDor
                v-if="camp"
                :key="rapportKey"
                :camp="camp"
                :type="selectedTab"
              />
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
}
.nav-tabs .nav-link.active {
  color: #0d6efd;
  border-color: #0d6efd #0d6efd #fff;
}
</style>
