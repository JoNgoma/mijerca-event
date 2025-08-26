<script setup>
import { useServiceContext } from '@/composables/useServiceContext'

const { serviceTypes } = useServiceContext()

// on ne garde que ceux qui commencent par "kin"
const services = Object.keys(serviceTypes)
  .filter(k => k.startsWith('adm-'))
  .map(k => ({ key: k, ...serviceTypes[k] }))
</script>

<template>
  <ul class="navbar-nav">
    <li class="nav-item">
      <router-link :to="{ name: 'services', params: { serviceType: 'services' } }" class="nav-link">Tous</router-link>
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
        >
          {{ service.name }}
        </router-link>
      </div>
    </li>
  </ul>
</template>
