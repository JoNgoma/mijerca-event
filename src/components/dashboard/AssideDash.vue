<script setup>
import { onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useAuth } from '@/composables/useAuth';

const route = useRoute();

// 🔹 Utilisation du composable auth
const { hasRole, loadFromApi } = useAuth();

// 🔹 Vérifier si un lien est actif (optionnel : comparer les params)
const isActiveRoute = (routeName, params = {}) => {
  if (route.name === routeName) {
    if (Object.keys(params).length > 0) {
      return Object.entries(params).every(
        ([key, value]) => route.params[key] === value
      );
    }
    return true;
  }
  return false;
};

// 🔹 Etat des menus ouverts (pour les sous-menus)
// const openMenus = ref({
//   service: false,
//   noyauDecanal: false,
//   noyauParoissial: false,
//   jeunes: false,
//   campBiblique: false
// });

// 🔹 Charger l'utilisateur et initialiser les menus
onMounted(async () => {
  await loadFromApi(); // récupère l'user et ses rôles depuis API

  // Initialisation de JS tiers si nécessaire
  if (window.App && typeof window.App.init === 'function') {
    window.App.init();
  }
});
</script>

<template>
  <div class="be-left-sidebar">
    <div class="left-sidebar-wrapper">
      <router-link :to="{ name: 'dashboard' }" class="left-sidebar-toggle">Dashboard</router-link>
      <div class="left-sidebar-spacer">
        <div class="left-sidebar-scroll">
          <div class="left-sidebar-content">
            <ul class="sidebar-elements">

              <!-- Dashboard -->
              <li v-if="hasRole('ROLE_ADMIN') || hasRole('ROLE_NOYAU')" 
                  :class="{ active: isActiveRoute('dashboard') }">
                <router-link :to="{ name: 'dashboard' }">
                  <i class="icon mdi mdi-home"></i>
                  <span>Dashboard</span>
                </router-link>
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
                  <a href="#"><i class="icon mdi mdi-face"></i><span>Service diocésain</span></a>
                  <ul class="sub-menu">
                    <li>
                      <router-link 
                        :to="{ name: 'new-unit', params: { serviceType: 'diocesain' } }"
                        :class="{ 'text-primary': isActiveRoute('new-unit', { serviceType: 'diocesain' }) }"
                      >Nouvelle Unité</router-link>
                    </li>
                    <li>
                      <router-link 
                        :to="{ name: 'analytic', params: { serviceType: 'diocesain' } }"
                        :class="{ 'text-primary': isActiveRoute('analytic', { serviceType: 'diocesain' }) }"
                      >Voir statistique</router-link>
                    </li>
                    <!-- <li>
                      <router-link 
                        :to="{ name: 'list', params: { serviceType: 'diocesain' } }"
                        :class="{ 'text-primary': isActiveRoute('list', { serviceType: 'diocesain' }) }"
                      ><span class="badge badge-primary float-right">New</span>Communiqués</router-link>
                    </li> -->
                  </ul>
                </li>

                <!-- Noyau décanal -->
                <li class="parent" v-if="hasRole('ROLE_ADMIN') || hasRole('ROLE_DIOCESE') || hasRole('ROLE_DECANAL')">
                  <a href="#"><i class="icon mdi mdi-face"></i><span>Noyau décanal</span></a>
                  <ul class="sub-menu">
                    <li>
                      <router-link 
                        :to="{ name: 'new-unit', params: { serviceType: 'decanal' } }"
                        :class="{ 'text-primary': isActiveRoute('new-unit', { serviceType: 'decanal' }) }"
                      >Nouvelle Unité</router-link>
                    </li>
                    <li>
                      <router-link 
                        :to="{ name: 'analytic', params: { serviceType: 'decanal' } }"
                        :class="{ 'text-primary': isActiveRoute('analytic', { serviceType: 'decanal' }) }"
                      >Voir statistique</router-link>
                    </li>
                    <!-- <li>
                      <router-link 
                        :to="{ name: 'list', params: { serviceType: 'decanal' } }"
                        :class="{ 'text-primary': isActiveRoute('list', { serviceType: 'decanal' }) }"
                      ><span class="badge badge-primary float-right">New</span>Communiqués</router-link>
                    </li> -->
                  </ul>
                </li>

                <!-- Noyau paroissial -->
                <li class="parent" v-if="hasRole('ROLE_ADMIN') || hasRole('ROLE_DIOCESE') || hasRole('ROLE_DECANAL') || hasRole('ROLE_NOYAU')">
                  <a href="#"><i class="icon mdi mdi-face"></i><span>Noyau paroissial</span></a>
                  <ul class="sub-menu">
                    <li>
                      <router-link 
                        :to="{ name: 'new-unit', params: { serviceType: 'paroissial' } }"
                        :class="{ 'text-primary': isActiveRoute('new-unit', { serviceType: 'paroissial' }) }"
                      >Nouvelle Unité</router-link>
                    </li>
                    <li>
                      <router-link 
                        :to="{ name: 'analytic', params: { serviceType: 'paroissial' } }"
                        :class="{ 'text-primary': isActiveRoute('analytic', { serviceType: 'paroissial' }) }"
                      >Voir statistique</router-link>
                    </li>
                    <!-- <li>
                      <router-link 
                        :to="{ name: 'list', params: { serviceType: 'paroissial' } }"
                        :class="{ 'text-primary': isActiveRoute('list', { serviceType: 'paroissial' }) }"
                      ><span class="badge badge-primary float-right">New</span>Communiqués</router-link>
                    </li> -->
                  </ul>
                </li>

                <!-- Jeunes -->
                <li class="parent" v-if="hasRole('ROLE_ADMIN') || hasRole('ROLE_DIOCESE') || hasRole('ROLE_DECANAL') || hasRole('ROLE_NOYAU')">
                  <a href="#"><i class="icon mdi mdi-face"></i><span>Jeunes</span></a>
                  <ul class="sub-menu">
                    <li>
                      <router-link 
                        :to="{ name: 'new-unit', params: { serviceType: 'jeunes' } }"
                        :class="{ 'text-primary': isActiveRoute('new-unit', { serviceType: 'jeunes' }) }"
                      >Nouvelle Unité</router-link>
                    </li>
                    <li>
                      <router-link 
                        :to="{ name: 'analytic', params: { serviceType: 'jeunes' } }"
                        :class="{ 'text-primary': isActiveRoute('analytic', { serviceType: 'jeunes' }) }"
                      >Voir statistique</router-link>
                    </li>
                  </ul>
                </li>

              <!-- Camp Biblique -->
               <li v-if="
                hasRole('ROLE_ADMIN') || 
                hasRole('ROLE_DIOCESE') || 
                hasRole('ROLE_DECANAL') || 
                hasRole('ROLE_NOYAU')" 
              class="divider">Camp biblique</li>
              <li v-if="hasRole('ROLE_ADMIN') || hasRole('ROLE_DIOCESE')">
                <router-link :to="{ name: 'new-camp' }" :class="{ 'text-primary': isActiveRoute('new-camp') }">
                  <i class="icon mdi mdi-book"></i><span>Nouveau</span>
                </router-link>
              </li>
              <li v-if="
                hasRole('ROLE_ADMIN') || 
                hasRole('ROLE_DIOCESE') || 
                hasRole('ROLE_DECANAL') || 
                hasRole('ROLE_NOYAU')"  
              class="parent">
                <a href="#"><i class="icon mdi mdi-layers"></i><span>Camp biblique 2025</span></a>
                <ul class="sub-menu">
                  <li v-if="hasRole('ROLE_ADMIN')">
                    <router-link :to="{ name: 'services', params: { serviceType: 'services' } }"
                                 :class="{ 'text-primary': isActiveRoute('services', { serviceType: 'services' }) }">
                      Administration
                    </router-link>
                  </li>
                  <li v-if="
                    hasRole('ROLE_ADMIN') || 
                    hasRole('ROLE_DIOCESE') || 
                    hasRole('ROLE_DECANAL') || 
                    hasRole('ROLE_NOYAU')"  >
                    <router-link :to="{ name: 'rap-day', params: { serviceType: 'rap-day' } }"
                                 :class="{ 'text-primary': isActiveRoute('rap-day', { serviceType: 'rap-day' }) }">
                      Finances
                    </router-link>
                  </li>
                  <li v-if="
                    hasRole('ROLE_ADMIN') || 
                    hasRole('ROLE_DIOCESE') || 
                    hasRole('ROLE_DECANAL') || 
                    hasRole('ROLE_NOYAU')"  >
                    <router-link :to="{ name: 'log-dortoir', params: { serviceType: 'dortoir' } }"
                                 :class="{ 'text-primary': isActiveRoute('log-dortoir', { serviceType: 'dortoir' }) }">
                      Hébergement
                    </router-link>
                  </li>
                  <li>
                    <router-link :to="{ name: 'info-badge-editor', params: { serviceType: 'badge-editor' } }"
                                 :class="{ 'text-primary': isActiveRoute('info-badge-editor', { serviceType: 'badge-editor' }) }">
                      Informatique
                    </router-link>
                  </li>
                </ul>
              </li>

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
                hasRole('ROLE_DECANAL') || 
                hasRole('ROLE_NOYAU')"  
              class="parent">
                <a href="#"><i class="icon mdi mdi-layers"></i><span>KIN EST</span></a>
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
                hasRole('ROLE_DECANAL') || 
                hasRole('ROLE_NOYAU')"  
              class="parent">
                <a href="#"><i class="icon mdi mdi-layers"></i><span>KIN CENTRE</span></a>
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
                hasRole('ROLE_DECANAL') || 
                hasRole('ROLE_NOYAU')"  
              class="parent">
                <a href="#"><i class="icon mdi mdi-layers"></i><span>KIN OUEST</span></a>
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
