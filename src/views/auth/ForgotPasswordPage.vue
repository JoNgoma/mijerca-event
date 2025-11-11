<script>
import logo from "/assets/img/mijerca.jpg"
import axios from 'axios'; // Assurez-vous d'avoir axios installé

export default {
  data() {
    return {
      logo: logo,
      email: '',
      message: '',
      isLoading: false,
      API_URL: 'http://localhost:8000/api/reset-password/request' // L'URL de votre endpoint Symfony
    };
  },
  methods: {
    async submitEmail() {
      this.isLoading = true;
      this.message = '';

      try {
        const response = await axios.post(this.API_URL, {
          email: this.email
        });

        // Le message est générique par sécurité (voir le controller Symfony)
        this.message = response.data.message || 'Vérifiez votre boîte de réception.';

      } catch (error) {
        console.error('Erreur lors de la demande :', error);
        this.message = 'Une erreur est survenue. Veuillez réessayer.';
      } finally {
        this.isLoading = false;
      }
    }
  }
};
</script>

<template>
  <div class="splash-container forgot-password">
    <div class='card card-border-color card-border-color-primary'>
      <!-- Header -->
      <div class="card-body be-navbar-header text-center">
        <a class="navbar-brand d-flex flex-column align-items-center justify-content-center" href="#">
          <img class="logo-img" :src="logo" alt="logo" />
          <span class="fw-bold brand-text">MIJERCA</span>
          <small class="text-muted">Ministère des Jeunes du Renouveau Catholique</small>
        </a>
        <h1 class="h3">Verification adresse e-mail</h1>
      </div>
      <!-- <h1 class="h3"> Réunitialisation mot de passe </h1> -->
      <form class='card-body' @submit.prevent="submitEmail">
          <p> Ne vous inquiétez pas, nous allons vous aider à réinitialiser votre mot de passe en toute sécurité. </p><!-- .form-group -->
          <!-- Phone -->
          <div class="form-group">
            <label for="inputUsername">Votre adresse e-mail</label>
            <input
              type="email"
              id="inputUEmail"
              class="form-control"
              placeholder="joedoe@gmail.com"
              v-model="email"
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
              <span v-else>Envoyer le lien</span>
            </button>
          </div>

          <!-- Links -->
          <div class="form-group text-center">
            <p class="mb-1">
              Abandonner ?
              <router-link :to="{ name: 'home' }">Revenir plus tard</router-link>
            </p>
            <router-link to="/login" class="link">Se connecter</router-link>
          </div>

          <p v-if="message">{{ message }}</p>
          <!-- <p v-if="error" class="error">{{ error }}</p> -->
      </form>
    </div>  

  </div>
</template>

<style scoped>
.success { color: green; }
.error { color: red; }
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
