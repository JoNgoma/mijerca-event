<script setup>
import { useServiceContext } from '@/composables/useServiceContext'

const { serviceTypes } = useServiceContext()

</script>

<template>
  <ul class="navbar-nav">
    <li class="nav-item">
      <router-link :to="{ name: 'log-dortoir', params: { serviceType: 'dortoir' } }" class="nav-link">Dortoirs</router-link>
    </li>
    <li class="nav-item">
      <router-link :to="{ name: 'log-carrefour', params: { serviceType: 'carrefour' } }" class="nav-link">Carrefours</router-link>
    </li>
    <li class="nav-item">
      <router-link :to="{ name: 'log-affect', params: { serviceType: 'affect' } }" class="nav-link">Affectation</router-link>
    </li>
  </ul>
</template>
