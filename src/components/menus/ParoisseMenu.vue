<script setup>
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import { useServiceContext } from '@/composables/useServiceContext'

const route = useRoute()
const { currentService, currentServiceType } = useServiceContext();

const placePosition = computed(() => {
  return currentServiceType.value || 'est';
});

// Vérifier si un lien est actif
const isActive = (routeName) => {
  return route.name === routeName;
};

</script>

<template>
  <ul class="navbar-nav">
    <li class="nav-item">
      <router-link 
        :to="{ name: 'sec-kin', params: { serviceType: placePosition } }" 
        class="nav-link"
        :class="{ 'text-primary': isActive('sec-kin') }"
      >
        Doyenné
      </router-link>
    </li>
    <li class="nav-item">
      <router-link 
        :to="{ name: 'sec-paroisse', params: { serviceType: placePosition } }" 
        class="nav-link"
        :class="{ 'text-primary': isActive('sec-paroisse') }"
      >
        Paroisse
      </router-link>
    </li>
    <li class="nav-item">
      <router-link 
        :to="{ name: 'sec-new', params: { serviceType: placePosition } }" 
        class="nav-link"
        :class="{ 'text-primary': isActive('sec-new') }"
      >
        Nouveau
      </router-link>
    </li>
  </ul>
</template>
