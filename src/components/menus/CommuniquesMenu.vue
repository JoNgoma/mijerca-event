<script setup>
import { useRoute } from 'vue-router';

const route = useRoute();

const isActive = (routeName) => {
  return route.name === routeName;
};
</script>

<template>
  <ul class="navbar-nav">
    <li class="nav-item dropdown">
      <a class="nav-link dropdown-toggle text-primary" href="#" data-toggle="dropdown" role="button" aria-expanded="false">
        Communiqués <span class="mdi mdi-caret-down"></span>
      </a>
      <div class="dropdown-menu" role="menu">
        <router-link 
          :to="{ name: 'list' }" 
          class="dropdown-item"
          :class="{ 'text-primary': isActive('list') }"
        >
          Niveau diocésain
        </router-link>
        <router-link 
          :to="{ name: 'list' }" 
          class="dropdown-item"
          :class="{ 'text-primary': isActive('list') }"
        >
          Niveau décanal
        </router-link>
        <router-link 
          :to="{ name: 'list' }" 
          class="dropdown-item"
          :class="{ 'text-primary': isActive('list') }"
        >
          Niveau paroissial
        </router-link>
        <router-link 
          :to="{ name: 'list' }" 
          class="dropdown-item"
          :class="{ 'text-primary': isActive('list') }"
        >
          Tous
        </router-link>
      </div>
    </li>
    <li class="nav-item">
      <router-link 
        :to="{ name: 'composer' }" 
        class="nav-link"
        :class="{ 'text-primary': isActive('composer') }"
      >
        New communiqué
      </router-link>
    </li>
  </ul>
</template>