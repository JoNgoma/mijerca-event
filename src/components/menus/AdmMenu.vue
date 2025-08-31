<script setup>
import { useRoute } from 'vue-router';
import { useServiceContext } from '@/composables/useServiceContext'

const route = useRoute();
const { serviceTypes } = useServiceContext()

// on ne garde que ceux qui commencent par "adm-"
const services = Object.keys(serviceTypes)
  .filter(k => k.startsWith('adm-'))
  .map(k => ({ key: k, ...serviceTypes[k] }))

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
        Tous
      </router-link>
    </li>
    <li class="nav-item dropdown">
      <a class="nav-link dropdown-toggle" href="#" data-toggle="dropdown" role="button" aria-expanded="false">
        Services <span class="mdi mdi-caret-down"></span>
      </a>
      <div class="dropdown-menu" role="menu">
        <router-link
          v-for="service in services"
          :key="service.key"
          :to="{ name: service.key, params: { serviceType: service.key } }"
          class="dropdown-item"
          :class="{ 'text-primary': isActive(service.key) }"
        >
          {{ service.name }}
        </router-link>
      </div>
    </li>
  </ul>
</template>
