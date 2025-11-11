<script setup>
import AssideDash from '@/components/dashboard/AssideDash.vue';
import HeaderDash from '@/components/dashboard/HeaderDash.vue';
import NavBarDash from '@/components/dashboard/NavBarDash.vue';
import CommuniquesMenu from '@/components/menus/CommuniquesMenu.vue';
import NewCommuniqueMenu from '@/components/menus/NewCommuniqueMenu.vue';
import AdmMenu from '@/components/menus/AdmMenu.vue';
import LogMenu from '@/components/menus/LogMenu.vue';
import FinancesMenu from '@/components/menus/FinancesMenu.vue';
import ParoisseMenu from '@/components/menus/ParoisseMenu.vue';
import { useTopMenu } from '@/composables/useTopMenu'
import { useRoute } from 'vue-router';
import SecMenu from '../components/menus/SecMenu.vue';

const route = useRoute()

const isActiveRoute = (routeName, params = {}) => {
  if (routeName === 'dashboard') {
    if (Object.keys(params).length > 0) {
      return Object.entries(params).every(
        ([key, value]) => route.params[key] === value
      )
    }
    return true
  }
  return false
}
const { currentMenu } = useTopMenu()

$(document).ready(function(){
      	//-initialize the javascript
      	App.init();
      	App.dashboard();
      });

</script>

<template>
  <div class="be-wrapper be-fixed-sidebar">
      <HeaderDash >
        <template #navigation>
          <CommuniquesMenu v-if="currentMenu === 'communiques'" />
          <NewCommuniqueMenu v-else-if="currentMenu === 'new-communique'" />
          <FinancesMenu v-else-if="currentMenu === 'rap-day' || currentMenu === 'paie' || currentMenu === 'dep-new'  || currentMenu === 'dep-suivis'" />
          <AdmMenu v-else-if="['services','manager','media'].includes(currentMenu)" />
          <LogMenu v-else-if="currentMenu === 'dortoir' || currentMenu === 'carrefour' || currentMenu === 'affect'" />
          <ParoisseMenu v-else-if="currentMenu === 'kin-est' || currentMenu === 'kin-centre' || currentMenu === 'kin-oest' || currentMenu === 'new-noy&par' || currentMenu === 'kin-paroisse'" />
          <SecMenu v-else-if="currentMenu === 'person-selector' ||currentMenu === 'badge-editor' || currentMenu === 'a4-generator' || currentMenu==='badge-preview'" />
          <ul v-else class="navbar-nav">
            <li
            :class="{ 'text-primary': isActiveRoute('dashboard', { serviceType: 'dashboard' }) }"
             class="nav-item"><a class="nav-link" href="/admin/dashboard">Accueil</a></li>
          </ul>
        </template>
      </HeaderDash>
      <AssideDash />
      <router-view :key="$route.fullPath"/>
      <NavBarDash />
  </div>
</template>

