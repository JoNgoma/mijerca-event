<script setup>
import { useRoute } from 'vue-router'
import { useServiceContext } from '@/composables/useServiceContext'

const route = useRoute()
const { serviceTypes } = useServiceContext()

// Vérifie si une route est active
const isActive = (routeName) => route.name === routeName

// Vérifie si l'utilisateur est dans une des pages Manager (dropdown actif)
const isManagerActive = () => {
  return route.name === 'manager' && route.params.serviceType?.startsWith('ser-')
}

const manages = Object.keys(serviceTypes)
  .filter(k => k.startsWith('ser-'))
  .map(k => ({ key: k, ...serviceTypes[k] }))
</script>

<template>
  <ul class="navbar-nav">
    <!-- SERVICES -->
    <li class="nav-item">
      <router-link 
        :to="{ name: 'services', params: { serviceType: 'services' } }" 
        class="nav-link"
        :class="{ 'text-primary': isActive('services') }"
      >
        Services
      </router-link>
    </li>

    <!-- MANAGER -->
    <li class="nav-item dropdown">
      <a
        class="nav-link dropdown-toggle"
        href="#"
        data-toggle="dropdown"
        role="button"
        aria-expanded="false"
        :class="{ 'text-primary': isManagerActive() }"
      >
        Manager <span class="mdi mdi-caret-down"></span>
      </a>
      <div class="dropdown-menu" role="menu">
        <router-link
          v-for="manage in manages"
          :key="manage.key"
          :to="{
            name: 'manager',
            params: {
              id_campBiblique: route.params.id_campBiblique,
              serviceType: manage.key
            }
          }"
          class="dropdown-item"
          :class="{ 'text-primary': isActive('manager') && route.params.serviceType === manage.key }"
        >
          {{ manage.name }}
        </router-link>
      </div>
    </li>

    <!-- MEDIA -->
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
