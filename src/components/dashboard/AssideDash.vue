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
        <div class="left-sidebar-wrapper"><a class="left-sidebar-toggle" href="#">Dashboard</a>
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
                  <li class="parent"><a href="#"><i class="icon mdi mdi-face"></i><span>Service diocésain</span></a>
                    <ul class="sub-menu">
                      <li><router-link :to="{ name: 'new-diocesain' }">Nouvelle Unité</router-link>
                      </li>
                      <li><router-link :to="{ name: 'analytic-diocesain' }">Voir statistique</router-link>
                      </li>
                      <li><router-link :to="{ name: 'list' }"><span class="badge badge-primary float-right">New</span>Communiqués</router-link>
                      </li>
                    </ul>
                  </li>
                  <li class="parent"><a href="#"><i class="icon mdi mdi-face"></i><span>Noyau décanal</span></a>
                    <ul class="sub-menu">
                      <li><a href="ui-alerts.html">Nouvelle Unité</a>
                      </li>
                      <li><a href="ui-buttons.html">Voir statistique</a>
                      </li>
                      <li><a href="ui-cards.html"><span class="badge badge-primary float-right">New</span>Communiqués</a>
                      </li>
                    </ul>
                  </li>
                  <li class="parent"><a href="#"><i class="icon mdi mdi-face"></i><span>Noyau paroissial</span></a>
                    <ul class="sub-menu">
                      <li><a href="ui-alerts.html">Nouvelle Unité</a>
                      </li>
                      <li><a href="ui-buttons.html">Voir statistique</a>
                      </li>
                      <li><a href="ui-cards.html"><span class="badge badge-primary float-right">New</span>Communiqués</a>
                      </li>
                    </ul>
                  </li>
                  <li class="parent"><a href="#"><i class="icon mdi mdi-face"></i><span>Jeunes</span></a>
                    <ul class="sub-menu">
                      <li><a href="ui-alerts.html">Nouvelle Unité</a>
                      </li>
                      <li><a href="ui-buttons.html">Voir statistique</a>
                      </li>
                    </ul>
                  </li>
                  <li class="divider">Camp Biblique</li>
                  <li class="parent"><a href="#"><i class="icon mdi mdi-layers"></i><span>Camp Biblique 2025</span></a>
                    <ul class="sub-menu">
                      <li><a href="ui-alerts.html">Finances</a>
                      </li>
                      <li><a href="ui-buttons.html">Informatique</a>
                      </li>
                      <li><a href="ui-alerts.html">Logistique</a>
                      </li>
                      <li><a href="ui-buttons.html">Média</a>
                      </li>
                    </ul>
                  </li>
                  <li class="divider">Gestion des paroisses</li>
                  <li><a href="documentation.html"><i class="icon mdi mdi-pin"></i><span>KIN EST</span></a>
                  </li>
                  <li><a href="documentation.html"><i class="icon mdi mdi-pin"></i><span>KIN CENTRE</span></a>
                  </li>
                  <li><a href="documentation.html"><i class="icon mdi mdi-pin"></i><span>KIN OUEST</span></a>
                  </li>
                </ul>
              </div>
            </div>
          </div>
          <div class="progress-widget">
            <div class="progress-data"><span class="progress-value">60%</span><span class="name">Current Project</span></div>
            <div class="progress">
              <div class="progress-bar progress-bar-primary" style="width: 60%;"></div>
            </div>
          </div>
        </div>
      </div>
</template>
<style scoped>
/* .router-link-exact-active .menu-icon,
.router-link-exact-active .menu-text,
.router-link-exact-active {
  color: #007bff !important;
}

.menu-item.has-child.has-open > .menu-link {
  color: #007bff !important;
}

.menu-item.has-child.has-open > .menu-link .menu-icon,
.menu-item.has-child.has-open > .menu-link .menu-text {
  
  color: #007bff !important;
} */
</style>
