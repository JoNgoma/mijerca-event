<script setup>
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
import ContactHome from '../../components/home/ContactHome.vue' // Assurez-vous que ce composant existe

const showModal = ref(false)
</script>

<template>
  <main class="mi-main-content">
    <!-- 1. SECTION HERO (Impact visuel et CTA fort) -->
    <section class="mi-hero d-flex text-white"
      :style="`background-image: linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.7)), url(${accueil})`"
      >
      <div class="mi-hero-content">
        <div class="text-end">
          <h1 class="mi-title">
            MIJERCA
            <span class="mi-subtitle  mb-6">Ministère des Jeunes du Renouveau Catholique</span>
          </h1>
          <!-- <p class="lead mi-slogan">
            Formons la jeunesse à l'image du Christ ressuscité !
          </p> -->
          <div class="mi-actions">
            <a href="/sign-up" class="btn mi-btn-primary mi-btn-lg">
              S'enregistrer
              <i class="mdi mdi-arrow-right-thick"></i>
            </a>
            <a href="#" class="btn mi-btn-outline mi-btn-lg">
              <i class="mdi mdi-information-outline"></i>
              En savoir plus
            </a>
          </div>
        </div>
      </div>
    </section>

    <!-- 2. SECTION À PROPOS (Vidéo interactive et mission) -->
    <section class="mi-section mi-about-section">
      <div class="mi-container mi-about-grid">
        <!-- Contenu Texte -->
        <div class="mi-about-text">
          <h2 class="mi-heading-secondary">À propos du MIJERCA</h2>
          <p class="mi-text-lg">
            Le MIJERCA est né le 2 septembre 1993 avec un objectif clair : évangéliser les jeunes par les jeunes. C'est un creuset de grâce, un lieu idéal pour grandir dans la foi, partager la Parole de Dieu et avancer ensemble vers la sainteté.
          </p>
          <ul class="mi-list">
            <li><i class="mdi mdi-star"></i>Conversion mature en la personne de Jésus-Christ.</li>
            <li><i class="mdi mdi-fire"></i> Accueil de la personne et de la manifestation de l’Esprit-Saint.</li>
            <li><i class="mdi mdi-book"></i> Formation à la prière, à la Parole et à l'évangélisation.</li>
          </ul>
          <a href="#" class="btn mi-btn-secondary mt-3">En savoir plus sur notre histoire</a>
        </div>

        <!-- Conteneur Vidéo -->
        <div class="mi-video-container">
          <video
            :src="video"
            autoplay
            muted
            loop
            playsinline
            class="mi-video"
          ></video>
          <!-- Bouton Play/Overlay pour l'UX du modal -->
          <div class="mi-play-overlay" @click="showModal = true">
            <i class="mdi mdi-play-circle-outline"></i>
            <span class="mi-play-text">Visionner la présentation</span>
          </div>
        </div>
      </div>
    </section>

    <!-- 3. SECTION TEMPS FORTS / ACTIVITÉS (Carrousel pour mobile et desktop) -->
    <section class="mi-section mi-activities-section">
      <div class="mi-container">
        <h2 class="mi-heading-primary mi-text-center">
          Nos activités principales
          <span class="mi-subtitle-sm">Glissez pour découvrir les moments forts qui transforment la jeunesse.</span>
        </h2>

        <!-- Carrousel Scrollable (UX améliorée pour le mobile) -->
        <div class="mi-carousel-wrapper">
          
          <!-- Come to Me -->
          <div class="mi-carousel-item">
            <div class="card mi-card mi-card-hover">
              <img :src="img5" class="card-img-top mi-card-img" alt="Come to Me">
              <div class="card-body">
                <h5 class="mi-card-title">✝️ Come to Me</h5>
                <p class="mi-card-text">
                  Chaque 14 février, une heure de contemplation et de prière devant le Saint Sacrement pour raviver la flamme de la foi.
                </p>
              </div>
            </div>
          </div>

          <!-- Camp Biblique -->
          <div class="mi-carousel-item">
            <div class="card mi-card mi-card-hover">
              <img :src="img6" class="card-img-top mi-card-img" alt="Camp Biblique">
              <div class="card-body">
                <h5 class="mi-card-title">📖 Camp Biblique</h5>
                <p class="mi-card-text">
                  Cinq jours intenses (26-30 décembre) de prière, d’enseignement et de formation spirituelle profonde.
                </p>
              </div>
            </div>
          </div>

          <!-- La Montagne -->
          <div class="mi-carousel-item">
            <div class="card mi-card mi-card-hover">
              <img :src="img7" class="card-img-top mi-card-img" alt="La Montagne">
              <div class="card-body">
                <h5 class="mi-card-title">⛰️ La Montagne</h5>
                <p class="mi-card-text">
                  Pèlerinage nocturne annuel (octobre) vers des lieux saints pour une rencontre puissante avec Dieu.
                </p>
              </div>
            </div>
          </div>

          <!-- La Grande Veillée -->
          <div class="mi-carousel-item">
            <div class="card mi-card mi-card-hover">
              <img :src="img8" class="card-img-top mi-card-img" alt="La Grande Veillée">
              <div class="card-body">
                <h5 class="mi-card-title">🕯️ La Grande Veillée</h5>
                <p class="mi-card-text">
                  Nuit intense de recueillement et de communion spirituelle, préparatoire au Camp Biblique.
                </p>
              </div>
            </div>
          </div>

          <!-- JDM -->
          <div class="mi-carousel-item">
            <div class="card mi-card mi-card-hover">
              <img :src="img9" class="card-img-top mi-card-img" alt="Journée Diocésaine du Mijerca">
              <div class="card-body">
                <h5 class="mi-card-title">🤝 Journée Diocésaine du Mijerca (JDM)</h5>
                <p class="mi-card-text">
                  Rassemblement annuel (17 mai) de tous les jeunes du Renouveau Catholique.
                </p>
              </div>
            </div>
          </div>

          <!-- Camping Spirituel -->
          <div class="mi-carousel-item">
            <div class="card mi-card mi-card-hover">
              <img :src="img10" class="card-img-top mi-card-img" alt="Camping Spirituel">
              <div class="card-body">
                <h5 class="mi-card-title">🌍 Camping Spirituel</h5>
                <p class="mi-card-text">
                  Mission d'évangélisation en septembre pour partager l’Évangile dans des lieux isolés et servir.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 4. MODAL VIDÉO (Amélioration de l'UX) -->
    <div v-if="showModal"
      @click.self="showModal = false"
      class="mi-modal-backdrop">
      <div class="mi-modal-content">
        <i class="mdi mdi-close mi-modal-close" @click="showModal = false"></i>
        <video
          :src="video"
          controls
          autoplay
          class="mi-modal-video"
        ></video>
      </div>
    </div>

    <!-- 5. CONTACT & CALL TO ACTION FINAL -->
    <!-- <NewsLetters /> -->
    <ContactHome />
    <section class="mi-section mi-cta-section mi-text-center">
      <div class="mi-container">
        <h2 class="mi-heading-secondary mb-3">
          Prêt à vivre une expérience de foi renouvelée ?
        </h2>
        <p class="lead mi-text-lg mb-4">
          Rejoignez le Ministère des Jeunes du Renouveau Catholique et suivez en temps réel toutes nos activités.
        </p>
        <a href="/sign-up" class="btn mi-btn-primary mi-btn-lg mi-btn-pulse" style="color: #4A90E2;">
          S'enregistrer maintenant
        </a>
      </div>
    </section>
  </main>
</template>

<style scoped>
:root {--mi-color-primary:#4A90E2;--mi-color-primary-dark:#3A7BBF;--mi-color-secondary:#FFC107;--mi-color-background:#F7F9FC;--mi-color-text:#343a40;--mi-color-text-light:#6c757d;}
.mi-main-content {font-family:'Inter',sans-serif;color:var(--mi-color-text);}
.mi-container {max-width:1200px;margin:0 auto;padding:0 20px;}
.mi-section {padding:80px 0;background-color:white;}
.mi-text-center {text-align:center;}
.mi-text-lg {font-size:1.15rem;line-height:1.8;color:var(--mi-color-text-light);}
.mi-heading-primary {font-size:2.5rem;font-weight:700;color:var(--mi-color-primary);margin-bottom:20px;}
.mi-heading-secondary {font-size:2rem;font-weight:700;color:var(--mi-color-primary);margin-bottom:20px;}
.mi-subtitle-sm {display:block;font-size:1rem;font-weight:400;color:var(--mi-color-text-light);margin-top:5px;}
.btn {padding:0.75rem 1.75rem;border-radius:9999px;font-weight:600;transition:all 0.3s ease;box-shadow:0 4px 10px rgba(0,0,0,0.1);}
.mi-btn-lg {font-size:1.1rem;}
.mi-btn-primary {background-color:var(--mi-color-primary);color:white;border:none;}
.mi-btn-primary:hover {background-color:var(--mi-color-primary-dark);transform:translateY(-2px);box-shadow:0 8px 15px rgba(74,144,226,0.4);}
.mi-btn-outline {background-color:transparent;color:white;border:2px solid white;}
.mi-btn-outline:hover {background-color:rgba(255,255,255,0.15);color:white;border-color:white;}
.mi-btn-secondary {background-color:var(--mi-color-secondary);color:#333;border:none;}
.mi-btn-secondary:hover {background-color:#e6b000;transform:translateY(-2px);box-shadow:0 8px 15px rgba(255,193,7,0.4);}
.mi-btn-pulse {animation:pulse 2s infinite;}
@keyframes pulse {0%{transform:scale(1);box-shadow:0 0 0 0 rgba(74,144,226,0.4);}70%{transform:scale(1.05);box-shadow:0 0 0 15px rgba(74,144,226,0);}100%{transform:scale(1);box-shadow:0 0 0 0 rgba(74,144,226,0);}}
.mi-hero {background-size:cover !important;background-position:center !important;min-height:90vh;position:relative;}
.mi-hero::before {content:'';position:absolute;top:0;left:0;right:0;bottom:0;background:linear-gradient(to right,rgba(0,0,0,0.1),rgba(0,0,0,0.7));z-index:1;}
.mi-hero-content {position:absolute;bottom:10%;right:5%;max-width:600px;padding:2rem;z-index:2;text-shadow:1px 1px 10px rgba(0,0,0,0.8);}
.mi-title {font-size:5rem;font-weight:900;line-height:1;margin:0;}
.mi-subtitle {display:block;font-size:1.5rem;font-weight:300;margin-top:5px;}
.mi-slogan {font-size:1.4rem;font-weight:500;margin-bottom:2.5rem;}
.mi-actions a {margin-left:1rem;}
.mi-about-section {background-color:var(--mi-color-background);}
.mi-about-grid {display:grid;grid-template-columns:1fr;gap:4rem;align-items:center;}
@media(min-width:992px){.mi-about-grid{grid-template-columns:4fr 3fr;}}
.mi-about-text {padding:1rem 0;}
.mi-list {list-style:none;padding-left:0;margin-top:20px;}
.mi-list li {font-size:1.1rem;line-height:2.2;}
.mi-list i {color:var(--mi-color-secondary);margin-right:10px;font-size:1.25rem;}
.mi-video-container {position:relative;overflow:hidden;border-radius:15px;box-shadow:0 10px 30px rgba(0,0,0,0.15);cursor:pointer;transition:transform 0.3s ease,box-shadow 0.3s ease;}
.mi-video-container:hover {transform:scale(1.02);box-shadow:0 15px 40px rgba(0,0,0,0.25);}
.mi-video {width:100%;display:block;filter:brightness(0.9);}
.mi-play-overlay {position:absolute;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.25);display:flex;flex-direction:column;align-items:center;justify-content:center;color:white;transition:background 0.3s;}
.mi-video-container:hover .mi-play-overlay {background:rgba(0,0,0,0.4);}
.mi-play-overlay i {font-size:6rem;animation:pulse-icon 1.5s infinite;}
.mi-play-text {margin-top:10px;font-size:1.2rem;font-weight:600;letter-spacing:1px;}
@keyframes pulse-icon {0%{transform:scale(1);opacity:0.9;}50%{transform:scale(1.1);opacity:1;}100%{transform:scale(1);opacity:0.9;}}
.mi-activities-section {background-color:white;}
.mi-carousel-wrapper {display:flex;overflow-x:scroll;padding-bottom:20px;scroll-snap-type:x mandatory;-webkit-overflow-scrolling:touch;gap:20px;}
.mi-carousel-wrapper::-webkit-scrollbar {height:8px;}
.mi-carousel-wrapper::-webkit-scrollbar-thumb {background:var(--mi-color-primary);border-radius:10px;}
.mi-carousel-wrapper::-webkit-scrollbar-track {background:#e0e0e0;}
.mi-carousel-item {flex:0 0 90%;scroll-snap-align:start;}
.mi-carousel-item:last-child {margin-right:20px;}
.mi-card {border:none;border-radius:12px;overflow:hidden;height:100%;transition:transform 0.3s ease,box-shadow 0.3s ease;box-shadow:0 4px 15px rgba(0,0,0,0.08);}
.mi-card-hover:hover {transform:translateY(-8px);box-shadow:0 15px 35px rgba(0,0,0,0.15);}
.mi-card-img {height:200px;object-fit:cover;border-bottom:3px solid var(--mi-color-secondary);}
.mi-card-title {color:var(--mi-color-primary-dark);font-weight:700;font-size:1.3rem;margin-bottom:10px;}
.mi-card-text {font-size:0.95rem;line-height:1.6;}
@media(min-width:768px){.mi-carousel-item{flex:0 0 calc(33.333% - 14px);}}
@media(min-width:1024px){.mi-carousel-item{flex:0 0 calc(25% - 15px);}}
@media(max-width:767px){.mi-carousel-item{flex:0 0 90%;}}
.mi-modal-backdrop {position:fixed;top:0;left:0;width:100vw;height:100vh;background-color:rgba(0,0,0,0.95);display:flex;justify-content:center;align-items:center;z-index:2000;}
.mi-modal-content {position:relative;max-width:90%;max-height:90%;width:1000px;}
.mi-modal-video {width:100%;max-height:80vh;border-radius:10px;box-shadow:0 0 50px rgba(74,144,226,0.5);}
.mi-modal-close {position:absolute;top:-40px;right:0;color:white;font-size:2.5rem;cursor:pointer;transition:color 0.2s;}
.mi-modal-close:hover {color:var(--mi-color-secondary);}
.mi-cta-section {background:linear-gradient(135deg,var(--mi-color-background) 0%,#e0f2ff 100%);border-top:5px solid var(--mi-color-primary);}
@media(max-width:768px){.mi-hero{min-height:70vh;}.mi-hero-content{right:0;left:0;bottom:5%;text-align:center;padding:1rem;max-width:100%;}.mi-title{font-size:3rem;}.mi-subtitle{font-size:1rem;}.mi-slogan{font-size:1.15rem;margin-bottom:1.5rem;}.mi-actions{display:flex;flex-direction:column;gap:10px;}.mi-actions a{margin:0;width:100%;}.mi-section{padding:40px 0;}.mi-heading-primary,.mi-heading-secondary{font-size:1.8rem;}.mi-about-grid{gap:2rem;}.mi-about-text{padding:0;order:2;}.mi-video-container{order:1;}.mi-list li{font-size:1rem;}}
</style>