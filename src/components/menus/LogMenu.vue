<script setup>
import { useRoute } from 'vue-router';
import { useServiceContext } from '@/composables/useServiceContext'

const route = useRoute();
const { serviceTypes } = useServiceContext()

const isActive = (routeName) => {
  return route.name === routeName;
};
</script>

<template>
  <ul class="navbar-nav">
    <li class="nav-item">
      <router-link 
        :to="{ name: 'log-affect', params: { serviceType: 'affect' } }" 
        class="nav-link"
        :class="{ 'text-primary': isActive('log-affect') }"
      >
        Affectation
      </router-link>
    </li>
    <li class="nav-item">
      <router-link 
        :to="{ name: 'log-dortoir', params: { serviceType: 'dortoir' } }" 
        class="nav-link"
        :class="{ 'text-primary': isActive('log-dortoir') }"
      >
        Dortoirs
      </router-link>
    </li>
    <li class="nav-item">
      <router-link 
        :to="{ name: 'log-carrefour', params: { serviceType: 'carrefour' } }" 
        class="nav-link"
        :class="{ 'text-primary': isActive('log-carrefour') }"
      >
        Carrefours
      </router-link>
    </li>
  </ul>
</template>
