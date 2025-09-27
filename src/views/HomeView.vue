<script setup>
import { RouterView, useRoute } from 'vue-router'
import HeaderHome from '../components/home/HeaderHome.vue'
import FooterHome from '../components/home/FooterHome.vue'

const route = useRoute()
</script>

<template>
  <!-- Afficher header/footer sauf pour sign-up et login -->
  <HeaderHome v-if="!['signUp', 'login', 'updateInfo'].includes(route.name)" />

  <RouterView :key="route.fullPath" />

  <FooterHome v-if="!['signUp', 'login', 'updateInfo'].includes(route.name)" />
</template>
