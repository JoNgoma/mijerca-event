<template>
  <section class="newsletter-section py-5 text-white">
    <div class="container text-center">
      <h2 class="mb-3">Nous écrire</h2>
      <p class="mb-4">Vous avez des questions ou souhaitez nous contacter directement ? Écrivez-nous via ce formulaire et nous vous répondrons rapidement.</p>

      <form @submit.prevent="sendMessage" class="row g-2 justify-content-center">
        <div class="col-12 col-md-3 mb-2">
          <input type="text" v-model="name" placeholder="Votre nom" class="form-control" required />
        </div>
        <div class="col-12 col-md-3 mb-2">
          <input type="email" v-model="email" placeholder="Votre email" class="form-control" required />
        </div>
        <div class="col-12 col-md-4 mb-5">
          <textarea v-model="userMessage" placeholder="Votre message" class="form-control" required></textarea>
        </div>
        <div class="col-12 col-md-2">
          <button type="submit" class="btn btn-light text-primary w-100">Envoyer</button>
        </div>
      </form>

      <p v-if="message" class="mt-3 feedback">{{ message }}</p>
    </div>
  </section>
</template>

<script setup>
import { ref } from 'vue'

const name = ref('')
const email = ref('')
const userMessage = ref('')
const message = ref('')

function sendMessage() {
  if (!name.value || !email.value || !userMessage.value) return
  // Ici tu peux appeler ton API pour envoyer le mail
  message.value = `Merci ${name.value}, votre message a bien été envoyé !`
  name.value = ''
  email.value = ''
  userMessage.value = ''
}
</script>

<style scoped>
.newsletter-section {
  background: linear-gradient(135deg, #0d6efd 0%, #6610f2 100%);
  padding-top: 4rem;
  padding-bottom: 4rem;
  border-radius: 5px;
}

.newsletter-section input,
.newsletter-section textarea {
  min-height: 48px;
  padding: 0.65rem 1rem;
  border-radius: 8px;
  border: none;
  font-size: 0.95rem;
  outline: none;
}

.newsletter-section textarea {
  min-height: 100px;
  resize: vertical;
}

.newsletter-section input:focus,
.newsletter-section textarea:focus {
  box-shadow: 0 0 0 3px rgba(255,255,255,0.3);
}

.newsletter-section .btn {
  background: #fff;
  color: #6610f2;
  font-weight: 700;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  border: none;
  transition: transform 0.2s, background 0.2s;
}

.newsletter-section .btn:hover {
  transform: translateY(-2px);
  background: #e6e6e6;
  color: #0d6efd;
}

.feedback {
  color: #fff;
  font-weight: 500;
}
</style>
