<script setup>
import { ref, onMounted } from 'vue'

const isAuthenticated = ref(false)
onMounted(() => {
  // Exemple : vérifier si on a un token
  const token = localStorage.getItem('token')
  isAuthenticated.value = !!token
})
</script>

<template>
<div class="be-splash-screen">
      <div class="be-wrapper be-error be-error-404">
      <div class="be-content">
        <div class="main-content container-fluid">
          <div class="error-container">
            <div class="error-number">404</div>
            <div class="error-description">La page recherchée n'existe pas ou se situe en pleine maintenance.</div>
            <div class="error-goback-text">Souhaitez-vous retourner à l'accueil ?</div>
            <div class="error-goback-button">
              <router-link
                v-if="isAuthenticated"
                :to="{ name: 'dashboard' }"
                class="btn btn-xl btn-primary"
              >
                Dashboard
              </router-link>

              <router-link
                v-else
                :to="{ name: 'home' }"
                class="btn btn-xl btn-primary"
              >
                Accueil
              </router-link>
            </div>
            <div class="footer">&copy; 2025, Beyin LazQuir</div>
          </div>
        </div>
      </div>
    </div>
    </div>
</template>

