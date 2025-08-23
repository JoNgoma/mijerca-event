<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();

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
              <li class="active">
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
                    <router-link :to="{ name: 'new-unit', params: { serviceType: 'diocesain' } }">
                      Nouvelle Unité
                    </router-link>
                  </li>
                  <li>
                    <router-link :to="{ name: 'analytic', params: { serviceType: 'diocesain' } }">
                      Voir statistique
                    </router-link>
                  </li>
                  <li>
                    <router-link :to="{ name: 'list', params: { serviceType: 'diocesain' } }">
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
                    <router-link :to="{ name: 'new-unit', params: { serviceType: 'decanal' } }">
                      Nouvelle Unité
                    </router-link>
                  </li>
                  <li>
                    <router-link :to="{ name: 'analytic', params: { serviceType: 'decanal' } }">
                      Voir statistique
                    </router-link>
                  </li>
                  <li>
                    <router-link :to="{ name: 'list', params: { serviceType: 'decanal' } }">
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
                    <router-link :to="{ name: 'new-unit', params: { serviceType: 'paroissial' } }">
                      Nouvelle Unité
                    </router-link>
                  </li>
                  <li>
                    <router-link :to="{ name: 'analytic', params: { serviceType: 'paroissial' } }">
                      Voir statistique
                    </router-link>
                  </li>
                  <li>
                    <router-link :to="{ name: 'list', params: { serviceType: 'paroissial' } }">
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
                    <router-link :to="{ name: 'new-unit', params: { serviceType: 'jeunes' } }">
                      Nouvelle Unité
                    </router-link>
                  </li>
                  <li>
                    <router-link :to="{ name: 'analytic', params: { serviceType: 'jeunes' } }">
                      Voir statistique
                    </router-link>
                  </li>
                </ul>
              </li>
              
              <li class="divider">Camp Biblique</li>
              <li>
                <router-link :to="{ name: 'new-camp' }">
                  <i class="icon mdi mdi-book"></i><span>Nouveau</span>
                </router-link>
              </li>
              
              <li class="parent">
                <a href="#"><i class="icon mdi mdi-layers"></i><span>Camp biblique 2025</span></a>
                <ul class="sub-menu">
                  <li>
                    <router-link :to="{ name: 'new-unit', params: { serviceType: 'diocesain' } }">
                      Administration
                    </router-link>
                  </li>
                  <li>
                    <router-link :to="{ name: 'new-unit', params: { serviceType: 'diocesain' } }">
                      Finances
                    </router-link>
                  </li>
                  <li>
                    <router-link :to="{ name: 'new-unit', params: { serviceType: 'diocesain' } }">
                      Informatique
                    </router-link>
                  </li>
                  <li>
                    <router-link :to="{ name: 'new-unit', params: { serviceType: 'diocesain' } }">
                      Logistique
                    </router-link>
                  </li>
                  <li>
                    <router-link :to="{ name: 'new-unit', params: { serviceType: 'diocesain' } }">
                      Média
                    </router-link>
                  </li>
                  <!-- <li>
                    <router-link :to="{ name: 'new-unit', params: { serviceType: 'diocesain' } }">
                      Nouvelle Unité
                    </router-link>
                  </li> -->
                </ul>
              </li>
              
              <li class="divider">Gestion des paroisses</li>
              <li><a href="documentation.html"><i class="icon mdi mdi-pin"></i><span>KIN EST</span></a></li>
              <li><a href="documentation.html"><i class="icon mdi mdi-pin"></i><span>KIN CENTRE</span></a></li>
              <li><a href="documentation.html"><i class="icon mdi mdi-pin"></i><span>KIN OUEST</span></a></li>
            </ul>
          </div>
        </div>
      </div>
      
      <!-- ... existing code ... -->
      
    </div>
  </div>
</template>

<style scoped>
/* ... existing code ... */
</style>
