<script setup>
import { ref, onMounted, watch, nextTick } from 'vue'
import axios from 'axios'
import { useRoute } from 'vue-router'
import { useAuth } from '@/composables/useAuth'
import { useServiceContext } from '@/composables/useServiceContext'

const route = useRoute()
const { idCamp } = useServiceContext()

// Composable auth
const { hasRole, loadFromApi } = useAuth()
const hasCARole = (type = 'SEC', activity = 'CA', year) => {
  const role = `ROLE_${type}_${activity}${year}`
  return hasRole(role)
}

const isLoading = ref(false)
// Liste dynamique des camps
const camps = ref([])

// Vérifier si un lien est actif
const isActiveRoute = (routeName, params = {}) => {
  if (route.name === routeName) {
    if (Object.keys(params).length > 0) {
      return Object.entries(params).every(
        ([key, value]) => route.params[key] === value
      )
    }
    return true
  }
  return false
}

// ==========================
// PAGINATION OPTIMISÉE
// ==========================
async function fetchAllPages(baseUrl, options = {}) {
  let allItems = [];
  let currentPage = 1;
  let hasMore = true;
  
  try {
    const token = localStorage.getItem("token");
    
    while (hasMore) {
      const url = new URL(baseUrl);
      url.searchParams.set('page', currentPage);
      
      const response = await fetch(url, {
        headers: { 
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/ld+json",
          ...options.headers
        },
        ...options
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
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
    console.error('Erreur lors de la récupération paginée:', error);
    throw error;
  }
}

// Récupérer la liste des camps dynamiquement avec pagination
const fetchCamps = async () => {
  try {
    const campsData = await fetchAllPages(
      `${import.meta.env.VITE_API_BASE_URL}/camp_bibliques`
    )
    camps.value = Array.isArray(campsData) ? campsData : []
  } catch (err) {
    console.error("Erreur lors du fetch des camps:", err)
  }
}

// Initialisation
onMounted(async () => {
  try {
    isLoading.value = true
    await loadFromApi()
    await fetchCamps()
  } catch (err) {
    console.error("❌ Erreur au chargement du menu:", err)
  } finally {
    isLoading.value = false
    nextTick(() => {
      if (window.App && typeof window.App.init === 'function') {
        window.App.init()
      }
    })
  }
})

// 🔄 Watch : actualise la liste dès qu'un nouveau camp est ajouté
watch(idCamp, async (newVal, oldVal) => {
  if (newVal && newVal !== oldVal) {
    await fetchCamps()
  }
})
</script>

<template>
  <div class="be-left-sidebar">
    <div class="left-sidebar-wrapper">
      <router-link :to="{ name: 'dashboard' }" class="left-sidebar-toggle">Dashboard</router-link>

      <!-- ✅ Loading visuel -->
      <div v-if="isLoading" class="menu-loading d-flex flex-column align-items-center justify-content-center">
        <div class="spinner-border text-primary my-3" role="status">
          <span class="visually-hidden"></span>
        </div>
        <p class="text-muted">Chargement du menu...</p>
      </div>

      <!-- ✅ Menu réel, reste dans le DOM mais masqué avec CSS -->
      <div class="left-sidebar-spacer" :class="{ 'd-none': isLoading }">
        <div class="left-sidebar-scroll">
          <div class="left-sidebar-content">
            <ul class="sidebar-elements">

              <!-- Dashboard -->
              <li v-if="hasRole('ROLE_ADMIN') || hasRole('ROLE_NOYAU')"
                  :class="{ active: isActiveRoute('dashboard') }">
                <a href="/admin/dashboard">
                  <i class="icon mdi mdi-home"></i>
                  <span>Dashboard</span>
                </a>
              </li>

              <!-- Administration pour ROLE_ADMIN -->
              <li v-if="
              hasRole('ROLE_ADMIN') ||
              hasRole('ROLE_DIOCESE') ||
              hasRole('ROLE_DECANAL') ||
              hasRole('ROLE_NOYAU')"
              class="divider">Administration</li>

              <!-- Service diocésain -->
              <li class="parent" v-if="hasRole('ROLE_ADMIN') || hasRole('ROLE_DIOCESE')">
                <a href="#"
                :class="{
                          'text-primary': ['new-unit', 'analytic'].includes(route.name) &&
                          route.params.serviceType === 'diocesain'
                        }"><i class="icon mdi mdi-accounts-list"></i><span>Service diocésain</span></a>
                <ul class="sub-menu">
                  <li>
                    <router-link
                      :to="{ name: 'new-unit', params: { serviceType: 'diocesain' } }"
                      :class="{ 'text-primary': isActiveRoute('new-unit', { serviceType: 'diocesain' }) }"
                    >Nouveau membre</router-link>
                  </li>
                  <li>
                    <router-link
                      :to="{ name: 'analytic', params: { serviceType: 'diocesain' } }"
                      :class="{ 'text-primary': isActiveRoute('analytic', { serviceType: 'diocesain' }) }"
                    >Voir statistique</router-link>
                  </li>
                </ul>
              </li>

              <!-- Noyau décanal -->
              <li class="parent" v-if="hasRole('ROLE_ADMIN') || hasRole('ROLE_DIOCESE') || hasRole('ROLE_DECANAL')">
                <a href="#"
                :class="{
                          'text-primary': ['new-unit', 'analytic'].includes(route.name) &&
                          route.params.serviceType === 'decanal'
                        }"><i class="icon mdi mdi-accounts-list"></i><span>Noyau décanal</span></a>
                <ul class="sub-menu">
                  <li>
                    <router-link
                      :to="{ name: 'new-unit', params: { serviceType: 'decanal' } }"
                      :class="{ 'text-primary': isActiveRoute('new-unit', { serviceType: 'decanal' }) }"
                    >Nouveau membre</router-link>
                  </li>
                  <li>
                    <router-link
                      :to="{ name: 'analytic', params: { serviceType: 'decanal' } }"
                      :class="{ 'text-primary': isActiveRoute('analytic', { serviceType: 'decanal' }) }"
                    >Voir statistique</router-link>
                  </li>
                </ul>
              </li>

              <!-- Noyau paroissial -->
              <li class="parent" v-if="hasRole('ROLE_ADMIN') || hasRole('ROLE_DIOCESE') || hasRole('ROLE_DECANAL') || hasRole('ROLE_NOYAU')">
                <a href="#"
                :class="{
                          'text-primary': ['new-unit', 'analytic'].includes(route.name) &&
                          route.params.serviceType === 'paroissial'
                        }"><i class="icon mdi mdi-accounts-list"></i><span>Noyau paroissial</span></a>
                <ul class="sub-menu">
                  <li>
                    <router-link
                      :to="{ name: 'new-unit', params: { serviceType: 'paroissial' } }"
                      :class="{ 'text-primary': isActiveRoute('new-unit', { serviceType: 'paroissial' }) }"
                    >Nouveau membre</router-link>
                  </li>
                  <li>
                    <router-link
                      :to="{ name: 'analytic', params: { serviceType: 'paroissial' } }"
                      :class="{ 'text-primary': isActiveRoute('analytic', { serviceType: 'paroissial' }) }"
                    >Voir statistique</router-link>
                  </li>
                </ul>
              </li>

              <!-- Jeunes -->
              <li class="parent" v-if="hasRole('ROLE_ADMIN') || hasRole('ROLE_DIOCESE') || hasRole('ROLE_DECANAL') || hasRole('ROLE_NOYAU')">
                <a href="#"
                :class="{
                          'text-primary': ['new-unit', 'analytic'].includes(route.name) &&
                          route.params.serviceType === 'jeunes'
                        }"><i class="icon mdi mdi-accounts"></i><span>Jeunes</span></a>
                <ul class="sub-menu">
                  <li>
                    <router-link
                      :to="{ name: 'new-unit', params: { serviceType: 'jeunes' } }"
                      :class="{ 'text-primary': isActiveRoute('new-unit', { serviceType: 'jeunes' }) }"
                    >Nouveau membre</router-link>
                  </li>
                  <li>
                    <router-link
                      :to="{ name: 'analytic', params: { serviceType: 'jeunes' } }"
                      :class="{ 'text-primary': isActiveRoute('analytic', { serviceType: 'jeunes' }) }"
                    >Voir statistique</router-link>
                  </li>
                </ul>
              </li>

              <!-- Activité -->
              <li v-if="hasRole('ROLE_ADMIN') || hasRole('ROLE_DIOCESE') || hasRole('ROLE_DECANAL') || hasRole('ROLE_NOYAU')" class="divider">Activités</li>
              <li v-if="hasRole('ROLE_ADMIN') || hasRole('ROLE_DIOCESE')">
                <router-link :to="{ name: 'new-camp', params: { serviceType: 'new-camp' } }" 
                :class="{
                          'text-primary': [
                            'new-camp', 'manager-camp'
                          ].includes(route.name)}">
                  <i class="icon mdi mdi-border-color"></i><span>Créer une activité</span>
                </router-link>
              </li>

              <!-- Dynamique : liste des camps -->
              <template v-if="camps.length && (hasRole('ROLE_ADMIN') || hasRole('ROLE_DIOCESE') || hasRole('ROLE_DECANAL') || hasRole('ROLE_NOYAU'))">
                <li v-for="camp in camps" :key="camp.id" class="parent">
                  <a href="#"
                  :class="{
                          'text-primary': [
                            'services', 'manager', 'media',
                            'rap-day', 'paie',
                            'log-affect', 'log-dortoir', 'log-carrefour',
                            'info-badge-editor', 'info-badge-preview', 'info-a4-generator', 'info-person-selector'
                          ].includes(route.name) &&
                                          route.params.id_campBiblique === camp.id
                        }">
                    <i v-if="camp.name.startsWith('Ecole de responsable')" class="icon mdi mdi-assignment"></i>
                    <i v-else class="icon mdi mdi-collection-text"></i>
                    <span>{{ camp.name.startsWith('Ecole de responsable') ? camp.name.replace('Ecole de responsable', 'Ecores') : camp.name }}</span>
                  </a>
                  <ul class="sub-menu">
                    <li v-if="
                      hasCARole(
                        'ADM', 
                        camp.name.startsWith('Ecole de responsable') ? 'EC' : 'CA',
                        '2025') ||
                       hasRole('ROLE_ADMIN')">
                      <router-link
                        :to="{ name: 'services', params: { id_campBiblique: camp.id, serviceType: 'services' } }"
                        :class="{
                          'text-primary': ['services', 'manager', 'media'].includes(route.name) &&
                                          route.params.id_campBiblique === camp.id
                        }"
                      >
                        Administration
                      </router-link>
                    </li>
                    <li v-if="
                      hasCARole(
                        'FIN', 
                        camp.name.startsWith('Ecole de responsable') ? 'EC' : 'CA',
                        '2025') ||
                       hasRole('ROLE_ADMIN')">
                      <router-link
                        :to="{ name: 'rap-day', params: { id_campBiblique: camp.id, serviceType: 'rap-day' } }"
                        :class="{
                          'text-primary': ['rap-day', 'paie'].includes(route.name) &&
                                          route.params.id_campBiblique === camp.id
                        }"
                      >
                        Finances
                      </router-link>
                    </li>
                    <li v-if="
                      hasCARole(
                        'HEB', 
                        camp.name.startsWith('Ecole de responsable') ? 'EC' : 'CA',
                        '2025') ||
                       hasRole('ROLE_ADMIN')">
                      <router-link
                        :to="{ name: 'log-affect', params: { id_campBiblique: camp.id, serviceType: 'affect' } }"
                        :class="{
                          'text-primary': ['log-affect', 'log-dortoir', 'log-carrefour'].includes(route.name) &&
                                          route.params.id_campBiblique === camp.id
                        }"
                      >
                        Hébergement
                      </router-link>
                    </li>
                    <li v-if="
                      hasCARole(
                        'SEC', 
                        camp.name.startsWith('Ecole de responsable') ? 'EC' : 'CA',
                        '2025') ||
                       hasRole('ROLE_ADMIN')">
                      <router-link
                        :to="{ name: 'info-person-selector', params: { id_campBiblique: camp.id, serviceType: 'person-selector' } }"
                        :class="{
                          'text-primary': ['info-badge-editor', 'info-badge-preview', 'info-a4-generator', 'info-person-selector' ].includes(route.name) &&
                                          route.params.id_campBiblique === camp.id
                        }"
                      >
                        Secrétariat
                      </router-link>
                    </li>
                  </ul>
                </li>
              </template>

              <!-- Gestion des paroisses pour ROLE_NOYAU -->
              <li v-if="
                  hasRole('ROLE_ADMIN') ||
                  hasRole('ROLE_DIOCESE') ||
                  hasRole('ROLE_DECANAL') ||
                  hasRole('ROLE_NOYAU')"
                  class="divider">Gestion des paroisses
              </li>
              <li v-if="
                hasRole('ROLE_ADMIN') ||
                hasRole('ROLE_DIOCESE') ||
                hasRole('ROLE_EST')"
              class="parent">
                <a href="#"
                :class="{
                          'text-primary': ['sec-kin', 'sec-paroisse', 'sec-new'].includes(route.name) &&
                          route.params.serviceType === 'est'
                        }"><i class="icon mdi mdi-undo"></i><span>KIN EST</span></a>
                <ul class="sub-menu" v-if="
                    hasRole('ROLE_ADMIN') ||
                    hasRole('ROLE_DIOCESE') ||
                    hasRole('ROLE_DECANAL') ||
                    hasRole('ROLE_NOYAU')">
                  <li>
                    <router-link :to="{ name: 'sec-kin', params: { serviceType: 'est' } }"
                               :class="{ 'text-primary': isActiveRoute('sec-kin', { serviceType: 'est' }) }">
                      Doyenné
                    </router-link>
                  </li>
                  <li>
                    <router-link :to="{ name: 'sec-paroisse', params: { serviceType: 'est' } }"
                                 :class="{ 'text-primary': isActiveRoute('sec-paroisse', { serviceType: 'est' }) }">
                      Paroisse
                    </router-link>
                  </li>
                  <li v-if="
                    hasRole('ROLE_ADMIN') ||
                    hasRole('ROLE_DIOCESE') ||
                    hasRole('ROLE_DECANAL')" >
                    <router-link :to="{ name: 'sec-new', params: { serviceType: 'est' } }"
                                 :class="{ 'text-primary': isActiveRoute('sec-new', { serviceType: 'est' }) }">
                      Nouveau
                    </router-link>
                  </li>
                </ul>
              </li>
              <li v-if="
                hasRole('ROLE_ADMIN') ||
                hasRole('ROLE_DIOCESE') ||
                hasRole('ROLE_CENTRE')"
              class="parent">
                <a href="#"
                :class="{
                          'text-primary': ['sec-kin', 'sec-paroisse', 'sec-new'].includes(route.name) &&
                          route.params.serviceType === 'centre'
                        }"><i class="icon mdi mdi-circle-o"></i><span>KIN CENTRE</span></a>
                <ul class="sub-menu" v-if="
                    hasRole('ROLE_ADMIN') ||
                    hasRole('ROLE_DIOCESE') ||
                    hasRole('ROLE_DECANAL') ||
                    hasRole('ROLE_NOYAU')">
                  <li>
                    <router-link :to="{ name: 'sec-kin', params: { serviceType: 'centre' } }"
                               :class="{ 'text-primary': isActiveRoute('sec-kin', { serviceType: 'centre' }) }">
                      Doyenné
                    </router-link>
                  </li>
                  <li>
                    <router-link :to="{ name: 'sec-paroisse', params: { serviceType: 'centre' } }"
                                 :class="{ 'text-primary': isActiveRoute('sec-paroisse', { serviceType: 'centre' }) }">
                      Paroisse
                    </router-link>
                  </li>
                  <li v-if="
                    hasRole('ROLE_ADMIN') ||
                    hasRole('ROLE_DIOCESE') ||
                    hasRole('ROLE_DECANAL')" >
                    <router-link :to="{ name: 'sec-new', params: { serviceType: 'centre' } }"
                                 :class="{ 'text-primary': isActiveRoute('sec-new', { serviceType: 'centre' }) }">
                      Nouveau
                    </router-link>
                  </li>
                </ul>
              </li>
              <li v-if="
                hasRole('ROLE_ADMIN') ||
                hasRole('ROLE_DIOCESE') ||
                hasRole('ROLE_OUEST')"
              class="parent">
                <a href="#"
                :class="{
                          'text-primary': ['sec-kin', 'sec-paroisse', 'sec-new'].includes(route.name) &&
                          route.params.serviceType === 'ouest'
                        }"><i class="icon mdi mdi-redo"></i><span>KIN OUEST</span></a>
                <ul class="sub-menu" v-if="
                    hasRole('ROLE_ADMIN') ||
                    hasRole('ROLE_DIOCESE') ||
                    hasRole('ROLE_DECANAL') ||
                    hasRole('ROLE_NOYAU')">
                  <li>
                    <router-link :to="{ name: 'sec-kin', params: { serviceType: 'ouest' } }"
                               :class="{ 'text-primary': isActiveRoute('sec-kin', { serviceType: 'ouest' }) }">
                      Doyenné
                    </router-link>
                  </li>
                  <li>
                    <router-link :to="{ name: 'sec-paroisse', params: { serviceType: 'ouest' } }"
                                 :class="{ 'text-primary': isActiveRoute('sec-paroisse', { serviceType: 'ouest' }) }">
                      Paroisse
                    </router-link>
                  </li>
                  <li v-if="
                    hasRole('ROLE_ADMIN') ||
                    hasRole('ROLE_DIOCESE') ||
                    hasRole('ROLE_DECANAL')" >
                    <router-link :to="{ name: 'sec-new', params: { serviceType: 'ouest' } }"
                                 :class="{ 'text-primary': isActiveRoute('sec-new', { serviceType: 'ouest' }) }">
                      Nouveau
                    </router-link>
                  </li>
                </ul>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* tes styles existants */
</style>