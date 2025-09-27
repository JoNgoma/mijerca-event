<script setup>
import CarouselHome from '@/components/home/CarouselHome.vue'

import accueil from "/assets/img/accueil.jpg"
import video from "/assets/video/present.mp4"
import img5 from "/assets/img/img-5.jpg"
import img6 from "/assets/img/img-6.jpg"
import img7 from "/assets/img/img-7.jpg"
import img8 from "/assets/img/img-8.jpg"
import img9 from "/assets/img/img-9.jpg"
import img10 from "/assets/img/img-10.jpg"
import { ref } from "vue"
// import NewsLetters from '../../components/home/NewsLetters.vue'
import ContactHome from '../../components/home/ContactHome.vue'

const showModal = ref(false)
</script>

<template>
  <!-- MAIN CONTENT -->
  <main>
    <section
      class="hero d-flex text-white"
      :style="`background: linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url(${accueil}) center/cover no-repeat; min-height: 90vh;`"
      >
      <div :style="`
          position: absolute;
          bottom: 4rem;
          right: 2.2rem;
          text-align: left;
        `">
        <div class="text-end">
          <h1 class="display-3 fw-bold">MIJERCA</h1>
          <p class="lead mb-4">Ministère des Jeunes du Renouveau Catholique</p>
          <div>
            <a href="/sign-up" class="btn btn-light btn-lg mr-3">S'enregistrer</a>
            <a href="#" class="btn btn-outline-light btn-lg">En savoir plus</a>
          </div>
        </div>
      </div>
    </section>

    <section
      style="
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        padding: 80px 20px;
        background-color: #f8f9fa;
      "
    >
      <!-- Image -->
      <div
        style="
          flex: 1 1 400px;
          min-width: 300px;
          text-align: center;
          margin-bottom: 30px;
        "
      >
      <video
      :src="video"
      autoplay
      muted
      loop
      playsinline
      style="width: 100%; max-width: 45rem; border-radius: 15px; box-shadow: 0 8px 20px rgba(0,0,0,0.2);"
      @click="showModal = true"
    ></video>
      </div>

      <!-- Texte -->
      <div
        style="
          flex: 1 1 20rem;
          min-width: 10rem;
          /* margin-right: 35px; */
        "
      >
        <h2 style="font-size: 2.5rem; color: #0d6efd; margin-bottom: 20px;">À propos du MIJERCA</h2>
        <p style="font-size: 1.1rem; line-height: 1.8; margin-bottom: 20px;">
          Le MIJERCA (Ministère des Jeunes du Renouveau Catholique) est né le 2 septembre 1993 dans le souci d’évangéliser les jeunes par les jeunes.
          Il constitue un cadre idéal pour partager la parole de Dieu et accompagner les jeunes vers la sainteté.
        </p>
        <ul style="font-size: 1.05rem; line-height: 1.6; margin-bottom: 20px;">
          <li>Conversion mature en la personne de Jésus-Christ.</li>
          <li>Accueil personnel de la personne et de la manifestation de l’Esprit-Saint.</li>
          <li>Initiation à la prière, à l’étude de la Parole et à l’évangélisation.</li>
        </ul>
        <a href="#"
          style="
            display: inline-block;
            padding: 0.75rem 1.5rem;
            background-color: #0d6efd;
            color: #fff;
            border-radius: 0.5rem;
            text-decoration: none;
            font-size: 1.1rem;
          "
        >En savoir plus</a>
      </div>
    </section>

    <!-- Modal vidéo -->
    <div v-if="showModal"
        @click.self="showModal = false"
        style="
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          background-color: rgba(0,0,0,0.8);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 1050;
        ">
      <video
        :src="video"
        controls
        autoplay
        style="max-width: 90%; max-height: 80%; border-radius: 10px;"
      ></video>
    </div>

    <!-- Temps fort -->
    <section class="py-1 bg-light">
      <div class="container">
        <h2 class="text-center mb-5" style="color: #0d6efd;">Nos activités principales</h2>
        <p class="text-center mb-5" style="font-size:1.1rem;">
          Découvrez les piliers qui font vivre le MIJERCA et qui permettent aux jeunes de grandir spirituellement,
          de se rencontrer et de se former. Chaque activité est un moment unique de prière, d’enseignement et de partage.
        </p>

        <div class="row g-4">
          <!-- Come to Me -->
          <div class="col-md-4">
            <div class="card shadow-sm">
              <img :src="img5" class="card-img-top" alt="Come to Me">
              <div class="card-body">
                <h5 class="card-title">✝️ Come to Me</h5>
                <p class="card-text">
                  Chaque 14 février, les jeunes se rassemblent pour une heure de contemplation et de prière devant le Saint Sacrement.
                  Cet événement historique a vu naître le Renouveau Charismatique Catholique et continue d’unir les jeunes dans la foi.
                </p>
              </div>
            </div>
          </div>

          <!-- Camp Biblique -->
          <div class="col-md-4">
            <div class="card shadow-sm">
              <img :src="img6" class="card-img-top" alt="Camp Biblique">
              <div class="card-body">
                <h5 class="card-title">📖 Camp Biblique</h5>
                <p class="card-text">
                  Du 26 au 30 décembre, les jeunes du Renouveau Charismatique Catholique se retrouvent pour cinq jours intenses de prière et d’enseignement.
                  Un moment fort de formation spirituelle et de partage avec des intervenants inspirants.
                </p>
              </div>
            </div>
          </div>

          <!-- La Montagne -->
          <div class="col-md-4">
            <div class="card shadow-sm">
              <img :src="img7" class="card-img-top" alt="La Montagne">
              <div class="card-body">
                <h5 class="card-title">✝️ La Montagne</h5>
                <p class="card-text">
                  Chaque octobre, les jeunes partent en pèlerinage nocturne vers des lieux comme Mangenge ou Lutendele,
                  gravissant la montagne en prière et méditation. Un moment puissant de rencontre avec Dieu.
                </p>
              </div>
            </div>
          </div>

          <!-- La Grande Veillée -->
          <div class="col-md-4">
            <div class="card shadow-sm">
              <img :src="img8" class="card-img-top" alt="La Grande Veillée">
              <div class="card-body">
                <h5 class="card-title">✝️ La Grande Veillée</h5>
                <p class="card-text">
                  Alternant avec la Montagne, cette nuit intense de prière se déroule avant le Camp Biblique.
                  Les jeunes vivent un moment de recueillement et de communion spirituelle profond.
                </p>
              </div>
            </div>
          </div>

          <!-- JDM -->
          <div class="col-md-4">
            <div class="card shadow-sm">
              <img :src="img9" class="card-img-top" alt="Journée Diocésaine des Jeunes">
              <div class="card-body">
                <h5 class="card-title">📰 Journée Diocésaine des Jeunes (JDM)</h5>
                <p class="card-text">
                  Chaque 17 mai, cet événement rassemble tous les jeunes du Renouveau Catholique autour de prière, témoignages,
                  partages d’expériences et rencontres. Une journée vivante et pleine d’inspiration.
                </p>
              </div>
            </div>
          </div>

          <!-- Camping Spirituel -->
          <div class="col-md-4">
            <div class="card shadow-sm">
              <img :src="img10" class="card-img-top" alt="Camping Spirituel">
              <div class="card-body">
                <h5 class="card-title">🤝 Camping Spirituel</h5>
                <p class="card-text">
                  En septembre, les jeunes partent en mission pour partager l’Évangile dans des lieux isolés,
                  mettant en pratique leur foi et leur formation spirituelle dans le service et l’évangélisation.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <CarouselHome />
    <!-- <NewsLetters /> -->
    <ContactHome />
    <section class="cta bg-light text-center py-5">
  <div class="container">
    <h2 class="mb-3">Rejoignez-nous dès aujourd'hui</h2>
    <p class="lead mb-4">Participez à nos activités, partagez la foi et grandissez spirituellement avec nous.</p>
    <a href="/sign-up" class="btn btn-gradient btn-lg px-4 py-2">
      S'enregistrer maintenant
    </a>
  </div>
</section>
  </main>
</template>

<style scoped>
/* Global Styles */
body {
  font-family: 'Arial', sans-serif;
  margin: 0;
  padding: 0;
  background-color: #f8f9fa;
}

/* Hero Section */
.hero {
  background-image: url('/assets/img/hero-bg.jpg');
  background-size: cover;
  background-position: center;
  color: white;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
}

.hero h1 {
  font-size: 3rem;
  font-weight: bold;
}

.hero p {
  font-size: 1.25rem;
}

/* Services Section */
.services .card {
  border: none;
  border-radius: 0.5rem;
  overflow: hidden;
}

.services .card-img-top {
  height: 200px;
  object-fit: cover;
}

.services .card-body {
  padding: 1.25rem;
}

.services .card-title {
  font-size: 1.25rem;
  font-weight: bold;
}

/* Call to Action Section */
.cta {
  background-color: #e9ecef;
}

.cta h2 {
  font-size: 2rem;
  font-weight: bold;
}

.cta p {
  font-size: 1.25rem;
}
.card-title {
  color: #0d6efd;
  font-weight: bold;
}
.card-text {
  font-size: 0.95rem;
  line-height: 1.6;
}

/* Avant footer */
.cta h2 {
  color: #0d47a1;
  font-weight: 700;
}

.cta p.lead {
  color: #495057;
  font-size: 1.25rem;
}

.cta .btn-gradient {
  background: linear-gradient(135deg, #0d6efd 0%, #6610f2 100%);
  color: #fff;
  font-weight: 600;
  border-radius: 8px;
  transition: transform 0.2s, box-shadow 0.2s;
}

.cta .btn-gradient:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
}

</style>
