<script setup>
import { useRoute } from 'vue-router'
import { useServiceContext } from '@/composables/useServiceContext'

const route = useRoute()
const { serviceTypes } = useServiceContext()

// Catégorisation
const secteurs = Object.keys(serviceTypes)
  .filter(k => k.startsWith('kin-'))
  .map(k => ({ key: k, ...serviceTypes[k] }))

const rapports = Object.keys(serviceTypes)
  .filter(k => k.startsWith('rap-'))
  .map(k => ({ key: k, ...serviceTypes[k] }))

const depenses = Object.keys(serviceTypes)
  .filter(k => k.startsWith('dep-'))
  .map(k => ({ key: k, ...serviceTypes[k] }))

// Vérifie la route exacte
const isActive = (routeName) => route.name === routeName

// Vérifie si un menu parent doit être actif
const isRapportActive = () => route.name === 'rap-day' && route.params.serviceType?.startsWith('rap-')
const isPaiementActive = () => route.name === 'paie' && route.params.serviceType?.startsWith('kin-')
const isDepenseActive = () => depenses.some(d => d.key === route.name)
</script>

<template>
  <ul class="navbar-nav">
    <!-- RAPPORTS -->
    <li class="nav-item dropdown">
      <a
        class="nav-link dropdown-toggle"
        href="#"
        data-toggle="dropdown"
        role="button"
        aria-expanded="false"
        :class="{ 'text-primary': isRapportActive() }"
      >
        Rapports <span class="mdi mdi-caret-down"></span>
      </a>
      <div class="dropdown-menu" role="menu">
        <router-link
          v-for="rapport in rapports"
          :key="rapport.key"
          :to="{ name: 'rap-day', params: { serviceType: rapport.key } }"
          class="dropdown-item"
          :class="{ 'text-primary': isActive('rap-day') && route.params.serviceType === rapport.key }"
        >
          {{ rapport.name }}
        </router-link>
      </div>
    </li>

    <!-- PAIEMENT -->
    <li class="nav-item dropdown">
      <a
        class="nav-link dropdown-toggle"
        href="#"
        data-toggle="dropdown"
        role="button"
        aria-expanded="false"
        :class="{ 'text-primary': isPaiementActive() }"
      >
        Paiement <span class="mdi mdi-caret-down"></span>
      </a>
      <div class="dropdown-menu" role="menu">
        <router-link
          v-for="secteur in secteurs"
          :key="secteur.key"
          :to="{ name: 'paie', params: { serviceType: secteur.key } }"
          class="dropdown-item"
          :class="{ 'text-primary': isActive('paie') && route.params.serviceType === secteur.key }"
        >
          {{ secteur.name }}
        </router-link>
      </div>
    </li>

    <!-- DÉPENSES -->
    <li class="nav-item dropdown">
      <a
        class="nav-link dropdown-toggle"
        href="#"
        data-toggle="dropdown"
        role="button"
        aria-expanded="false"
        :class="{ 'text-primary': isDepenseActive() }"
      >
        Dépenses <span class="mdi mdi-caret-down"></span>
      </a>
      <div class="dropdown-menu" role="menu">
        <router-link
          v-for="depense in depenses"
          :key="depense.key"
          :to="{ name: depense.key, params: { serviceType: depense.key } }"
          class="dropdown-item"
          :class="{ 'text-primary': isActive(depense.key) }"
        >
          {{ depense.name }}
        </router-link>
      </div>
    </li>
  </ul>
</template>
