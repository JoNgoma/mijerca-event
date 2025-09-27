<template>
  <section class="py-5 bg-light">
    <div class="container d-flex flex-column align-items-center">
      <!-- Titre -->
      <div class="text-center mb-5">
        <h2 class="fw-bold">Témoignages & Expériences</h2>
        <p class="text-muted">Découvrez ce que disent nos jeunes.</p>
      </div>

      <!-- Témoignages centrés -->
      <div class="testimonials-slider d-flex justify-content-center gap-4 flex-wrap pb-3">
        <!-- Témoignage 1 -->
        <div class="card shadow-sm border-0 p-4" style="width:300px;">
          <div class="rounded-circle bg-primary text-white mx-auto d-flex align-items-center justify-content-center mb-3"
               style="width:80px; height:80px; font-size:1.5rem;">SM</div>
          <blockquote class="blockquote mb-3 text-center">
            <p class="fst-italic">“Cette communauté m’a aidé à grandir dans ma foi.”</p>
          </blockquote>
          <footer class="blockquote-footer text-center">Sarah M., <cite>Membre MIJERCA</cite></footer>
        </div>

        <!-- Témoignage 2 -->
        <div class="card shadow-sm border-0 p-4" style="width:300px;">
          <div class="rounded-circle bg-success text-white mx-auto d-flex align-items-center justify-content-center mb-3"
               style="width:80px; height:80px; font-size:1.5rem;">JP</div>
          <blockquote class="blockquote mb-3 text-center">
            <p class="fst-italic">“Les retraites m’ont permis de renforcer ma relation avec Dieu.”</p>
          </blockquote>
          <footer class="blockquote-footer text-center">Jean-Paul K., <cite>Participant</cite></footer>
        </div>

        <!-- Témoignage 3 -->
        <div class="card shadow-sm border-0 p-4" style="width:300px;">
          <div class="rounded-circle bg-warning text-dark mx-auto d-flex align-items-center justify-content-center mb-3"
               style="width:80px; height:80px; font-size:1.5rem;">PN</div>
          <blockquote class="blockquote mb-3 text-center">
            <p class="fst-italic">
              {{ showFull ? longText : shortText }}
              <span v-if="longText.length > 50">
                <a href="#" @click.prevent="toggleShow" class="text-primary">
                  {{ showFull ? 'Voir moins' : 'Voir plus' }}
                </a>
              </span>
            </p>
          </blockquote>
          <footer class="blockquote-footer text-center">Josué Ngoma, <cite>Noyau décanal</cite></footer>
        </div>
      </div>
    </div>
  </section>
</template>


<script setup>
import { ref } from 'vue'

const longText = "“Chaque rencontre au sein du MIJERCA est une expérience de profonde transformation spirituelle. On partage, on prie, on apprend, et surtout on se soutient mutuellement dans la foi. Ces moments m’ont permis de découvrir la puissance de la prière collective et la beauté de l’engagement des jeunes dans la mission du Seigneur.”"
const shortText = longText.slice(0, 50) + '...'

const showFull = ref(false)
function toggleShow() {
  showFull.value = !showFull.value
}
</script>

<style>
.testimonials-slider {
  scroll-snap-type: x mandatory;
}
.testimonials-slider .card {
  scroll-snap-align: start;
}
/* lien voir plus */
.blockquote a {
  cursor: pointer;
  text-decoration: underline;
}
</style>
