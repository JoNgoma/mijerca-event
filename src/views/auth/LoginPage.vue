<template>
  <div class="be-login be-signup">
    <div class="splash-container sign-up">
      <div class="card card-border-color card-border-color-primary">
        <!-- Header -->
        <div class="card-body be-navbar-header text-center">
          <a class="navbar-brand d-flex flex-column align-items-center justify-content-center" href="#">
            <img class="logo-img" :src="logo" alt="logo" />
            <span class="fw-bold brand-text">MIJERCA</span>
            <small class="text-muted">Ministère des Jeunes du Renouveau Catholique</small>
          </a>
        </div>

        <!-- Login Form -->
        <form class="card-body" @submit.prevent="handleLogin">
          <!-- Phone -->
          <div class="form-group">
            <label for="inputUsername">Téléphone</label>
            <input
              type="text"
              @input="formatPhone"
              id="inputUsername"
              class="form-control"
              placeholder="0899 999 999"
              v-model="username"
              required
            />
          </div>

          <!-- Password -->
          <div class="form-group">
            <label for="inputPassword">Mot de passe</label>
            <input
              type="password"
              id="inputPassword"
              class="form-control"
              placeholder="Mot de passe"
              v-model="password"
              required
            />
          </div>

          <!-- Submit -->
          <div class="form-group">
            <button
              class="btn btn-block btn-primary btn-xl"
              type="submit"
              :disabled="isLoading"
            >
              <span
                v-if="isLoading"
                class="spinner-border spinner-border-sm"
                role="status"
              ></span>
              <span v-else>Se connecter</span>
            </button>
          </div>

          <!-- Links -->
          <div class="form-group text-center">
            <p class="mb-1">
              Pas de compte ?
              <router-link :to="{ name: 'home' }">Revenir plus tard</router-link>
            </p>
            <router-link to="/forget-pwd" class="link">Mot de passe oublié ?</router-link>
          </div>

          <!-- Error -->
          <p v-if="error" class="text-danger text-center mt-2">{{ error }}</p>
        </form>
      </div>

      <div class="splash-footer text-center">&copy; 2025 Beyin LazQuir.</div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue"
import { useRouter } from "vue-router"
import logo from "/assets/img/mijerca.jpg"

const API_URL = import.meta.env.VITE_API_BASE_URL

const username = ref("")
const password = ref("")
const error = ref("")
const isLoading = ref(false)
const router = useRouter()
const formatPhone = () => {
  let digits = username.value.replace(/\D/g, '');
  digits = digits.slice(0, 10);
  if (digits.length > 4 && digits.length <= 7) {
    username.value = digits.slice(0, 4) + ' ' + digits.slice(4);
  } else if (digits.length > 7) {
    username.value =
      digits.slice(0, 4) + ' ' + digits.slice(4, 7) + ' ' + digits.slice(7);
  } else {
    username.value = digits;
  }
}

async function handleLogin() {
  isLoading.value = true
  error.value = ""
  try {
    const response = await fetch(`${API_URL}/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        username: username.value.replace(/\s+/g, ''),
        password: password.value
      })
    })

    if (!response.ok) {
      throw new Error("Connexion échouée")
    }

    const data = await response.json()
    const token = data.token
    const roles = data.roles || [] // <-- Assure-toi que ton API renvoie un tableau de rôles

    localStorage.setItem("token", token)
    localStorage.setItem("userPhone", username.value.replace(/\s+/g, ''))
    localStorage.setItem("roles", JSON.stringify(roles)) // <-- Ajouté

    // router.push({ name: "dashboard" })
    window.location.href = '/admin/dashboard' // recharge la page complète
  } catch (err) {
    error.value = "Connexion échouée. Vérifiez vos identifiants."
    console.error(err)
  } finally {
    isLoading.value = false
  }
}
</script>


<style scoped>
.logo-img {
  max-height: 50px;
  margin-bottom: 0.5rem;
}

.brand-text {
  font-size: 1.8rem;
  letter-spacing: 1.5px;
  background: white;
  padding: 0 0.4em;
  border-radius: 4px;
  display: inline-block;
  margin-bottom: 0.3rem;
}

/* Mobile */
@media (max-width: 576px) {
  .logo-img {
    max-height: 40px;
  }
  .brand-text {
    font-size: 1.4rem;
    letter-spacing: 1px;
  }
}
</style>
