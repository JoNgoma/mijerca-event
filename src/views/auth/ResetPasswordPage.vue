<script>
import axios from 'axios';
import logo from "/assets/img/mijerca.jpg"

export default {
  data() {
    return {
      logo: logo,
      token: this.$route.query.token || null, // Récupère le token de l'URL (ex: ?token=...)
      newPassword: '',
      confirmPassword: '',
      message: '',
      isLoading: false,
      isError: false,
      API_URL: 'http://localhost:8000/api/reset-password/reset' // L'URL du 2ème endpoint Symfony
    };
  },
  methods: {
    async submitNewPassword() {
      if (this.newPassword !== this.confirmPassword || !this.token) {
        this.isError = true;
        this.message = 'Veuillez vérifier le token ou la confirmation du mot de passe.';
        return;
      }

      this.isLoading = true;
      this.message = '';
      this.isError = false;

      try {
        const response = await axios.post(this.API_URL, {
          token: this.token,
          password: this.newPassword
        });

        this.message = response.data.message || 'Mot de passe réinitialisé avec succès !';
        this.isError = false;
        // Optionnel : Rediriger l'utilisateur vers la page de connexion
        // this.$router.push('/login');

      } catch (error) {
        this.isError = true;
        // La réponse Symfony pourrait contenir un message d'erreur spécifique (token invalide, expiré...)
        this.message = error.response?.data?.message || 'Échec de la réinitialisation du mot de passe.';
        console.error('Erreur lors de la réinitialisation :', error);
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
        <h1 class="h3">Réinitialisation du mot de passe</h1>
      </div>
      <!-- <h1 class="h3"> Réunitialisation mot de passe </h1> -->
      <form class='card-body' v-if="token" @submit.prevent="submitNewPassword">
          <!-- password -->
          <div class="form-group">
            <label for="inputUsername">Votre nouveau mot de passe</label>
            <input
              type="password"
              id="inputUPwd"
              class="form-control"
              v-model="newPassword"
              required
            />
          </div>
          <div class="form-group">
            <label for="inputUsername">Confirmer mot de passe</label>
            <input
              type="password"
              id="inputUPwd2"
              class="form-control"
              v-model="confirmPassword"
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
              <span v-else>Réinitialiser</span>
            </button>
          </div>

          <p v-if="newPassword !== confirmPassword && confirmPassword.length > 0" class="error">
            Les mots de passe ne correspondent pas.
          </p>

          <p v-if="message" :class="{ 'error': isError }">{{ message }}</p>
          <p v-if="!token && !message">Token de réinitialisation manquant dans l'URL.</p>
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