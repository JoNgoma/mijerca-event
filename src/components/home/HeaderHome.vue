<script setup>
import { ref } from "vue"
import { useRoute } from "vue-router"
import logo from "/assets/img/mijerca.jpg"

const isOpen = ref(false)
const route = useRoute()
</script>

<template>
  <!-- HEADER -->
  <header class="fixed-top shadow-sm bg-white navbar-light">
    <div class="container d-flex justify-content-between align-items-center py-2">
      <!-- Logo -->
      <a href="/" class="d-flex align-items-center text-decoration-none">
        <img :src="logo" alt="logo" style="height: 3rem; margin-right: 1rem;">
        <span class="fw-bold text-primary d-none d-md-inline" style="font-size: 2rem;">MIJERCA</span>
      </a>

      <!-- MENU DESKTOP -->
      <nav class="d-none d-lg-flex">
        <ul class="nav mx-auto">
          <li class="nav-item">
            <a
              href="/"
              class="nav-link fs-5"
              :class="{ active: route.path === '/' }"
            >
              Accueil
            </a>
          </li>
          <li class="nav-item">
            <a
              href="/events"
              class="nav-link fs-5"
              :class="{ active: route.path.startsWith('/events') }"
            >
              Evénements
            </a>
          </li>
          <li class="nav-item">
            <a href="#" class="nav-link fs-5">Enseignement</a>
          </li>
          <li class="nav-item">
            <a href="#" class="nav-link fs-5">Actualité</a>
          </li>
        </ul>
      </nav>

      <!-- BOUTONS DROITE (Desktop) -->
      <div class="d-none d-lg-flex">
        <a href="/sign-up" class="btn btn-primary mr-2">S'enregistrer</a>
        <a href="/login" class="btn btn-outline-primary">Administration</a>
      </div>

      <!-- BURGER MENU -->
      <button class="navbar-toggler d-lg-none border-0" @click="isOpen = !isOpen">
        <span class="navbar-toggler-icon"></span>
      </button>
    </div>

    <!-- MENU MOBILE -->
    <div v-if="isOpen" class="bg-white shadow-sm">
      <ul class="nav flex-column text-center py-3">
        <li class="nav-item">
          <a
            href="/"
            class="nav-link"
            :class="{ active: route.path === '/' }"
            @click="isOpen = false"
          >
            Accueil
          </a>
        </li>
        <li class="nav-item">
          <a
            href="/events"
            class="nav-link"
            :class="{ active: route.path.startsWith('/events') }"
            @click="isOpen = false"
          >
            Evénements
          </a>
        </li>
        <li class="nav-item"><a href="#" class="nav-link" @click="isOpen=false">Enseignement</a></li>
        <li class="nav-item"><a href="#" class="nav-link" @click="isOpen=false">Actualité</a></li>
        <li class="nav-item mt-3">
          <a href="/sign-up" class="btn btn-primary w-75 mx-auto" @click="isOpen=false">S'enregistrer</a>
        </li>
        <li class="nav-item mt-2">
          <a href="/login" class="btn btn-outline-primary w-75 mx-auto" @click="isOpen=false">Administration</a>
        </li>
      </ul>
    </div>
  </header>

  <!-- ESPACE POUR NE PAS CACHER LE MAIN -->
  <div style="height: 60px;"></div>
</template>

<style scoped>
.nav-link.active {
  font-weight: bold;
  color: #0d6efd !important; /* bleu bootstrap */
}
</style>
