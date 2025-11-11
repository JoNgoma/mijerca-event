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
        :to="{ name: 'info-person-selector', params: { serviceType: 'person-selector' } }" 
        class="nav-link"
        :class="{ 
          'text-primary': isActive('info-person-selector', { serviceType: 'person-selector' }) 
                      || isActive('info-a4-generator', { serviceType: 'a4-generator' }) 
        }"
      >
        Impression
      </router-link>
    </li>

    <li class="nav-item">
      <router-link 
        :to="{ name: 'info-badge-editor', params: { serviceType: 'badge-editor' } }" 
        class="nav-link"
        :class="{ 
          'text-primary': isActive('info-badge-editor', { serviceType: 'badge-editor' }) 
                      || isActive('info-badge-preview', { serviceType: 'badge-preview' }) 
        }"
      >
        Custom badge
      </router-link>
    </li>
  </ul>
</template>
