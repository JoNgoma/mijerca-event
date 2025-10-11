<script setup>
import { useRoute } from 'vue-router';

const route = useRoute();



const isActive = (routeName) => {
  return route.name === routeName;
};
</script>

<template>
  <ul class="navbar-nav">
    <li class="nav-item">
      <router-link 
        :to="{ name: 'services', params: { serviceType: 'services' } }" 
        class="nav-link"
        :class="{ 'text-primary': isActive('services') }"
      >
        Services
      </router-link>
    </li>
    <li class="nav-item">
      <router-link 
        :to="{ name: 'manager', params: { serviceType: 'manager' } }" 
        class="nav-link"
        :class="{ 'text-primary': isActive('manager') }"
      >
        Manager
      </router-link>
    </li>
    <li class="nav-item">
      <router-link 
        :to="{ name: 'media', params: { serviceType: 'media' } }" 
        class="nav-link"
        :class="{ 'text-primary': isActive('media') }"
      >
        Média
      </router-link>
    </li>
  </ul>
</template>
