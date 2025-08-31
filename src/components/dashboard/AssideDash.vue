<script setup>
import { ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';

const router = useRouter();
const route = useRoute();

// Fonction pour vérifier si un lien est actif
const isActiveRoute = (routeName, params = {}) => {
  if (route.name === routeName) {
    // Vérifier aussi les paramètres si fournis
    if (Object.keys(params).length > 0) {
      return Object.entries(params).every(([key, value]) => route.params[key] === value);
    }
    return true;
  }
  return false;
};

const openMenus = ref({
  service: false,
  noyauDecanal: false,
  noyauParoissial: false,
  jeunes: false,
  campBiblique: false
});

$(document).ready(function(){
  //-initialize the javascript
  App.init();
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
              <li :class="{ active: isActiveRoute('dashboard') }">
                <router-link :to="{ name: 'dashboard' }">
                  <i class="icon mdi mdi-home"></i>
                  <span>Dashboard</span>
                </router-link>
              </li>
              <li class="divider">Administration</li>
              
              <!-- Service diocésain -->
              <li class="parent">
                <a href="#"><i class="icon mdi mdi-face"></i><span>Service diocésain</span></a>
                <ul class="sub-menu">
                  <li>
                    <router-link 
                      :to="{ name: 'new-unit', params: { serviceType: 'diocesain' } }"
                      :class="{ 'text-primary': isActiveRoute('new-unit', { serviceType: 'diocesain' }) }"
                    >
                      Nouvelle Unité
                    </router-link>
                  </li>
                  <li>
                    <router-link 
                      :to="{ name: 'analytic', params: { serviceType: 'diocesain' } }"
                      :class="{ 'text-primary': isActiveRoute('analytic', { serviceType: 'diocesain' }) }"
                    >
                      Voir statistique
                    </router-link>
                  </li>
                  <li>
                    <router-link 
                      :to="{ name: 'list', params: { serviceType: 'diocesain' } }"
                      :class="{ 'text-primary': isActiveRoute('list', { serviceType: 'diocesain' }) }"
                    >
                      <span class="badge badge-primary float-right">New</span>Communiqués
                    </router-link>
                  </li>
                </ul>
              </li>
              
              <!-- Noyau décanal -->
              <li class="parent">
                <a href="#"><i class="icon mdi mdi-face"></i><span>Noyau décanal</span></a>
                <ul class="sub-menu">
                  <li>
                    <router-link 
                      :to="{ name: 'new-unit', params: { serviceType: 'decanal' } }"
                      :class="{ 'text-primary': isActiveRoute('new-unit', { serviceType: 'decanal' }) }"
                    >
                      Nouvelle Unité
                    </router-link>
                  </li>
                  <li>
                    <router-link 
                      :to="{ name: 'analytic', params: { serviceType: 'decanal' } }"
                      :class="{ 'text-primary': isActiveRoute('analytic', { serviceType: 'decanal' }) }"
                    >
                      Voir statistique
                    </router-link>
                  </li>
                  <li>
                    <router-link 
                      :to="{ name: 'list', params: { serviceType: 'decanal' } }"
                      :class="{ 'text-primary': isActiveRoute('list', { serviceType: 'decanal' }) }"
                    >
                      <span class="badge badge-primary float-right">New</span>Communiqués
                    </router-link>
                  </li>
                </ul>
              </li>
              
              <!-- Noyau paroissial -->
              <li class="parent">
                <a href="#"><i class="icon mdi mdi-face"></i><span>Noyau paroissial</span></a>
                <ul class="sub-menu">
                  <li>
                    <router-link 
                      :to="{ name: 'new-unit', params: { serviceType: 'paroissial' } }"
                      :class="{ 'text-primary': isActiveRoute('new-unit', { serviceType: 'paroissial' }) }"
                    >
                      Nouvelle Unité
                    </router-link>
                  </li>
                  <li>
                    <router-link 
                      :to="{ name: 'analytic', params: { serviceType: 'paroissial' } }"
                      :class="{ 'text-primary': isActiveRoute('analytic', { serviceType: 'paroissial' }) }"
                    >
                      Voir statistique
                    </router-link>
                  </li>
                  <li>
                    <router-link 
                      :to="{ name: 'list', params: { serviceType: 'paroissial' } }"
                      :class="{ 'text-primary': isActiveRoute('list', { serviceType: 'paroissial' }) }"
                    >
                      <span class="badge badge-primary float-right">New</span>Communiqués
                    </router-link>
                  </li>
                </ul>
              </li>
              
              <!-- Jeunes -->
              <li class="parent">
                <a href="#"><i class="icon mdi mdi-face"></i><span>Jeunes</span></a>
                <ul class="sub-menu">
                  <li>
                    <router-link 
                      :to="{ name: 'new-unit', params: { serviceType: 'jeunes' } }"
                      :class="{ 'text-primary': isActiveRoute('new-unit', { serviceType: 'jeunes' }) }"
                    >
                      Nouvelle Unité
                    </router-link>
                  </li>
                  <li>
                    <router-link 
                      :to="{ name: 'analytic', params: { serviceType: 'jeunes' } }"
                      :class="{ 'text-primary': isActiveRoute('analytic', { serviceType: 'jeunes' }) }"
                    >
                      Voir statistique
                    </router-link>
                  </li>
                </ul>
              </li>
              
              <li class="divider">Camp Biblique</li>
              <li>
                <router-link 
                  :to="{ name: 'new-camp' }"
                  :class="{ 'text-primary': isActiveRoute('new-camp') }"
                >
                  <i class="icon mdi mdi-book"></i><span>Nouveau</span>
                </router-link>
              </li>
              <li class="parent">
                <a href="#"><i class="icon mdi mdi-layers"></i><span>Camp biblique 2025</span></a>
                <ul class="sub-menu">
                  <li>
                    <router-link 
                      :to="{ name: 'services', params: { serviceType: 'services' } }"
                      :class="{ 'text-primary': isActiveRoute('services', { serviceType: 'services' }) }"
                    >
                      Administration
                    </router-link>
                  </li>
                  <li>
                    <router-link 
                      :to="{ name: 'rap-day', params: { serviceType: 'rap-day' } }"
                      :class="{ 'text-primary': isActiveRoute('rap-day', { serviceType: 'rap-day' }) }"
                    >
                      Finances
                    </router-link>
                  </li>
                  <li>
                    <router-link 
                      :to="{ name: 'log-dortoir', params: { serviceType: 'dortoir' } }"
                      :class="{ 'text-primary': isActiveRoute('log-dortoir', { serviceType: 'dortoir' }) }"
                    >
                      Logistique
                    </router-link>
                  </li>
                  <li>
                    <router-link 
                      :to="{ name: 'info-badge-editor', params: { serviceType: 'badge-editor' } }"
                      :class="{ 'text-primary': isActiveRoute('info-badge-editor', { serviceType: 'badge-editor' }) }"
                    >
                      Informatique
                    </router-link>
                  </li>
                  <!-- <li>
                    <router-link :to="{ name: 'med-list', params: { serviceType: 'média' } }">
                      Média
                    </router-link>
                  </li> -->
                </ul>
              </li>
              
              <li class="divider">Gestion des paroisses</li>
              <li>
                <router-link 
                  :to="{ name: 'sec-kin', params: { serviceType: 'est' } }"
                  :class="{ 'text-primary': isActiveRoute('sec-kin', { serviceType: 'est' }) }"
                >
                  <i class="icon mdi mdi-pin"></i><span>KIN EST</span>
                </router-link>
              </li>
              <li>
                <router-link 
                  :to="{ name: 'sec-kin', params: { serviceType: 'centre' } }"
                  :class="{ 'text-primary': isActiveRoute('sec-kin', { serviceType: 'centre' }) }"
                >
                  <i class="icon mdi mdi-pin"></i><span>KIN CENTRE</span>
                </router-link>
              </li>
              <li>
                <router-link 
                  :to="{ name: 'sec-kin', params: { serviceType: 'ouest' } }"
                  :class="{ 'text-primary': isActiveRoute('sec-kin', { serviceType: 'ouest' }) }"
                >
                  <i class="icon mdi mdi-pin"></i><span>KIN OUEST</span>
                </router-link>
              </li>
            </ul>
          </div>
        </div>
      </div>      
    </div>
  </div>
</template>

<style scoped>
/* ... existing code ... */
</style>
