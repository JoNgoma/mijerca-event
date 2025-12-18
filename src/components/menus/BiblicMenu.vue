<script setup>
import { useRoute } from 'vue-router'

const route = useRoute()

// ✅ Fonction isActive identique à celle de asside.vue
const isActive = (routeName, params = {}) => {
  if (route.name === routeName) {
    if (Object.keys(params).length > 0) {
      return Object.entries(params).every(
        ([key, value]) => route.params[key] === value
      )
    }
    return true
  }
  return false
}
</script>

<template>
  <ul class="navbar-nav">
    <li class="nav-item">
      <router-link 
        :to="{ name: 'new-camp', params: { serviceType: 'new-camp' } }" 
        class="nav-link"
        :class="{ 'text-primary': ['new-camp'].includes(route.name)}"
      >
        Nouvelle activité
      </router-link>
    </li>

    <li class="nav-item">
      <router-link 
        :to="{ name: 'manager-camp', params: { serviceType: 'manager-camp' } }" 
        class="nav-link"
        :class="{ 'text-primary': ['manager-camp'].includes(route.name)}"
      >
        Manager
      </router-link>
    </li>
  </ul>
</template>
