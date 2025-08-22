<template>
    <main class="auth">
      <header id="auth-header" class="auth-header"
        style="background-image: url(/src/assets/images/illustration/img-1.png);">
        <h1 style="display: flex; flex-direction: column;">
          <router-link to="/" style="text-decoration: none; color: white;">MIJERCA</router-link>
          <span class="h5">Ministère des Jeunes du Renouceau Catholique</span>
        </h1>
      </header>
  
      <form class="auth-form" @submit.prevent="handleLogin">
        <div class="form-group">
          <div class="form-label-group">
            <input type="email" id="inputEmail" class="form-control" placeholder="johndoe@gmail.com"
              v-model="email" required />
            <label for="inputEmail">Adresse e-mail</label>
          </div>
        </div>
        <div class="form-group">
          <div class="form-label-group">
            <input type="password" id="inputPassword" class="form-control" placeholder="Mot de passe"
              v-model="password" required />
            <label for="inputPassword">Mot de passe</label>
          </div>
        </div>
        <div class="form-group">
          <button class="btn btn-lg btn-primary btn-block" type="submit" :disabled="isLoading">
            <span v-if="isLoading" class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
            <span v-else>Se connecter</span>
          </button>
        </div>
        <div class="form-group">
          <p class="text-end mb-2">
          Avez-vous un compte ? <router-link to="/sign-up">S'inscrire</router-link>
        </p>
        </div>
        <div class="text-end pt-3">
          <router-link to="/forget-pwd" class="link">Mot de passe oublié ?</router-link>
        </div>
        <p v-if="error" style="color: red;">{{ error }}</p>
      </form>
  
      <footer class="auth-footer">© 2025 Beyin LazQuir.</footer>
    </main>
  </template>
  
  <script setup>
  import { ref } from 'vue'
  import axios from 'axios'
  import { useRouter } from 'vue-router'
  
  const email = ref('')
  const password = ref('')
  const error = ref('')
  // Loading
  const isLoading = ref(false)
  const router = useRouter()
  
  async function handleLogin() {
    // loading
    isLoading.value = true
    try {
      const response = await axios.post('http://127.0.0.1:8000/api/login', {
        email: email.value,
        password: password.value
      })
  
      const token = response.data.token
      localStorage.setItem('token', token)
  
      // Redirige vers le tableau de bord ou autre page
      router.push('/admin/dashboard')
      // In the handleLogin function after successful login
      localStorage.setItem('userEmail', email.value)
    } catch (err) {
      error.value = 'Connexion échouée. Vérifiez vos identifiants.'
      console.error(err)
    } 
    // loading
    finally {
      isLoading.value = false
    }
  }
  </script>
  
  <style scoped>
  /* Ajoute ici ton style */
  </style>
  