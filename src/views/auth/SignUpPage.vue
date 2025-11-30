<template>
<main class="auth">
      <header id="auth-header" class="auth-header"
            style="background-image: url(/src/assets/images/illustration/img-1.png);">
            <h1 style="display: flex; flex-direction: column;">
              <router-link to="/" style="text-decoration: none; color: white;">MIJERCA</router-link>
              <span class="h5">Ministère des Jeunes du Renouceau Catholique</span>
            </h1>
          </header>
          <form class="auth-form" @submit.prevent="handleLogup">
        <div class="form-group">
          <div class="form-label-group">
            <input type="email" id="inputEmail" class="form-control" placeholder="Email" required="" autofocus=""> <label for="inputEmail">johndoe@gmail.com</label>
          </div>
        </div>
        
        <div class="form-group">
          <div class="form-label-group">
            <input type="text" id="inputUsername" class="form-control" placeholder="Noms" required=""> <label for="inputUser">John Doe</label>
          </div>
        </div>
        
        <div class="form-group">
          <div class="form-label-group">
            <input type="number" id="inputNumber" class="form-control" placeholder="Phone" required=""> <label for="inputNum">0891234567</label>
          </div>
        </div>

        <div class="form-group">
          <div class="form-label-group">
            <input type="password" id="inputPassword" class="form-control" placeholder="Mot de passe" required=""> <label for="inputPassword">Mot de passe</label>
          </div>
        </div>

        <div class="form-group">
          <div class="form-label-group">
            <input type="password2" id="inputPassword2" class="form-control" placeholder="Mot de passe" required=""> <label for="inputPassword2">Confirmer mot de passe</label>
          </div>        
        </div>
        
        <div class="form-group">
          <button class="btn btn-lg btn-primary btn-block" type="submit" :disabled="isLoading">
            <span v-if="isLoading" class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
            <span v-else>S'inscrire</span>
          </button>
        </div>
        
        <div class="form-group">
            <p class="text-end mb-2">
              Avez-vous déjà un compte? <router-link to="/sign-in">Se connecter</router-link>
            </p>
        </div>
         <p class="text-center text-muted mb-0">En créant un compte, vous acceptez les <a href="#">Conditions d'utilisation</a> et la <a href="#">Politique de confidentialité</a>.</p>
      </form>
      <footer class="auth-footer">
        <p class="mb-0">
          &copy; MIJERCA Kinshasa 2025. Tous droits réservés.
          <br />
          <span class="d-block mt-1">Prod. by Beyin LQ</span>
        </p>
      </footer>
    </main>

</template>

<script setup>
import { ref } from 'vue';
import { useToast } from 'vue-toastification'

const toast = useToast()
const inputUsername = ref('');
const inputEmail = ref('');
const inputNumber = ref('');
const inputPassword = ref('');
const error = ref('')
// Loading
const isLoading = ref(false)

function handleLogup() {
  // loading
  isLoading.value = true
  // Logique de connexion ici
  try {
    console.log("Nom d'utilisateur:", inputUsername.value);
  console.log("Email", inputEmail.value);
  console.log("Numéro de téléphone", inputNumber.value);
  console.log("Mot de passe:", inputPassword.value);
  } catch (err) {
      toast.error('Connexion échouée. Vérifiez vos identifiants.')
      error.value = 'Connexion échouée. Vérifiez vos identifiants.'
      console.error(err)
    } 
    // loading
    finally {
      isLoading.value = false
    }
}
defineProps({
  msg: {
    type: String,
    required: true,
  },
})
</script>

<style scoped>

</style>
