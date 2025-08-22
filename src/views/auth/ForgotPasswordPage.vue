<template>
<main class="auth">
      <form class="auth-form auth-form-reflow" @submit.prevent="handleForgetPwd">
        <div class="text-center mb-4">
          <div class="mb-4">
            <h1 style="display: flex; flex-direction: column;">
                <router-link  to="/" style="text-decoration: none;">MIJERCA</router-link>
            </h1>
            <!-- <img class="rounded" src="/src/assets/apple-touch-icon.png" alt="" height="72"> -->
          </div>
          <h1 class="h3"> Réunitialisation mot de passe </h1>
        </div>
        <p class="mb-4"> Ne vous inquiétez pas, nous allons vous aider à réinitialiser votre mot de passe en toute sécurité. </p><!-- .form-group -->
        <div class="form-group mb-4">
          <label class="d-block text-left" for="inputUser">Entrer votre adresse e-mail</label> <input type="text" id="inputUser" class="form-control form-control-lg" required="" autofocus="">
          <p class="text-muted">
            <small>Nous vous enverrons un lien de réinitialisation du mot de passe par e-mail.</small>
          </p>
        </div>
        <div class="d-block d-md-inline-block mb-2">
          <button class="btn btn-lg btn-block btn-primary" type="submit">Soumettre</button>
        </div>
        <div class="d-block d-md-inline-block">
          <router-link to="/sign-in" class="btn btn-block btn-light">Se connecter</router-link>
        </div>
      </form>
        <footer class="auth-footer">© 2025 Beyin LazQuir.</footer>
    </main>

</template>

<script setup>
import { ref } from 'vue';

const inputEmail = ref('');
const inputPassword = ref('');

function handleForgetPwd() {
  // Logique de connexion ici
  console.log("E-mail", inputEmail.value);
  console.log("Mot de passe:", inputPassword.value);
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
