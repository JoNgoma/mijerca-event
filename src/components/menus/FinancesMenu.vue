<script setup>
import { useServiceContext } from '@/composables/useServiceContext'

const { serviceTypes } = useServiceContext()

// on ne garde que ceux qui commencent par "kin"
const secteurs = Object.keys(serviceTypes)
  .filter(k => k.startsWith('kin-'))
  .map(k => ({ key: k, ...serviceTypes[k] }))

  const rapports = Object.keys(serviceTypes)
  .filter(k => k.startsWith('rap-'))
  .map(k => ({ key: k, ...serviceTypes[k] }))

  const depenses = Object.keys(serviceTypes)
  .filter(k => k.startsWith('dep-'))
  .map(k => ({ key: k, ...serviceTypes[k] }))
</script>

<template>
  <ul class="navbar-nav">
    <li class="nav-item dropdown">
      <a class="nav-link dropdown-toggle" href="#" data-toggle="dropdown" role="button" aria-expanded="false">
        Rapports <span class="mdi mdi-caret-down"></span>
      </a>
      <div class="dropdown-menu" role="menu">
        <router-link
          v-for="rapport in rapports"
          :key="rapport.key"
          :to="{ name: 'rap-day', params: { serviceType: rapport.key } }"
          class="dropdown-item"
        >
          {{ rapport.name }}
        </router-link>
      </div>
    </li>
    <li class="nav-item dropdown">
      <a class="nav-link dropdown-toggle" href="#" data-toggle="dropdown" role="button" aria-expanded="false">
        Paiement <span class="mdi mdi-caret-down"></span>
      </a>
      <div class="dropdown-menu" role="menu">
        <router-link
          v-for="secteur in secteurs"
          :key="secteur.key"
          :to="{ name: 'paie', params: { serviceType: secteur.key } }"
          class="dropdown-item"
        >
          {{ secteur.name }}
        </router-link>
      </div>
    </li>
    <li class="nav-item dropdown">
      <a class="nav-link dropdown-toggle" href="#" data-toggle="dropdown" role="button" aria-expanded="false">
        Dépenses <span class="mdi mdi-caret-down"></span>
      </a>
      <div class="dropdown-menu" role="menu">
          <router-link
            v-for="depense in depenses"
            :key="depense.key"
            :to="{ name: depense.key, params: { serviceType: depense.key } }" 
            class="dropdown-item"
          >
            {{ depense.name }}
          </router-link>
      </div>
    </li>
  </ul>
</template>
