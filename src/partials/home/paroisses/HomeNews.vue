<script setup>
import { ref, onMounted, computed } from 'vue'
import campHero from "/assets/img/camp-biblique-2025.jpg"
import campPosterPlaceholder from "/assets/img/camp-poster-placeholder.jpg"
// import { formatPhoneNumber, formatName } from '../../utils/formatters'

// États réactifs
const showModal = ref(false)
const registrationSuccess = ref(false)
const isLoading = ref(true)
const preRegistration = ref({
  fullName: '',
  email: '',
  phone: '',
  ageGroup: '',
  message: ''
})

// Données du camp
const campInfo = ref({
  name: "Camp Biblique 2025",
  date: "Décembre 2025",
  location: {
    name: "En cours de détermination",
    status: "loading"
  },
  theme: {
    title: "En cours de préparation",
    description: "Le thème sera dévoilé avec l'affiche officielle",
    status: "loading"
  },
  poster: {
    image: campPosterPlaceholder,
    status: "coming_soon",
    releaseDate: "15 Mars 2025"
  },
  highlights: [
    {
      id: 1,
      icon: "mdi-slideshare",
      title: "Moments de Prière",
      description: "Sessions de prière collective et personnelle"
    },
    {
      id: 2,
      icon: "mdi-face",
      title: "Études Bibliques",
      description: "Exploration approfondie des Écritures"
    },
    {
      id: 3,
      icon: "mdi-music-note",
      title: "Louanges & Adoration",
      description: "Célébrations en musique et chants"
    },
    {
      id: 4,
      icon: "mdi-account-group",
      title: "Communauté Fraternelle",
      description: "Partages et activités de groupe"
    },
    {
      id: 5,
      icon: "mdi-nature",
      title: "Retraite Spirituelle",
      description: "Rencontre avec Dieu dans la nature"
    },
    {
      id: 6,
      icon: "mdi-campfire",
      title: "Veillées Spirituelles",
      description: "Nuits de recueillement et partage"
    }
  ],
  countdown: {
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    targetDate: new Date(new Date().getFullYear(), 11, 26, 18, 0, 0) // 11 = décembre (0-indexé)
  }
})

// Computed properties
const isFormValid = computed(() => {
  return preRegistration.value.fullName.trim() !== '' && 
         preRegistration.value.email.trim() !== '' &&
         preRegistration.value.ageGroup !== ''
})

const formattedCountdown = computed(() => {
  const { days, hours, minutes, seconds } = campInfo.value.countdown
  return {
    days: days.toString().padStart(2, '0'),
    hours: hours.toString().padStart(2, '0'),
    minutes: minutes.toString().padStart(2, '0'),
    seconds: seconds.toString().padStart(2, '0')
  }
})

// Méthodes
const updateCountdown = () => {
  const now = new Date().getTime()
  const distance = campInfo.value.countdown.targetDate.getTime() - now
  
  if (distance > 0) {
    campInfo.value.countdown.days = Math.floor(distance / (1000 * 60 * 60 * 24))
    campInfo.value.countdown.hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    campInfo.value.countdown.minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60))
    campInfo.value.countdown.seconds = Math.floor((distance % (1000 * 60)) / 1000)
  }
}

const handlePreRegistration = async () => {
  if (!isFormValid.value) return
  
  try {
    // Simulation d'envoi à l'API
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    registrationSuccess.value = true
    
    // Réinitialiser le formulaire
    preRegistration.value = {
      fullName: '',
      email: '',
      phone: '',
      ageGroup: '',
      message: ''
    }
    
    // Cacher le message de succès après 5 secondes
    setTimeout(() => {
      registrationSuccess.value = false
    }, 5000)
    
  } catch (error) {
    console.error('Erreur lors de la pré-inscription:', error)
  }
}

const resetForm = () => {
  preRegistration.value = {
    fullName: '',
    email: '',
    phone: '',
    ageGroup: '',
    message: ''
  }
}

// Lifecycle hooks
onMounted(() => {
  // Simuler le chargement des données
  setTimeout(() => {
    isLoading.value = false
  }, 1000)
  
  // Démarrer le compte à rebours
  updateCountdown()
  setInterval(updateCountdown, 1000)
})
</script>

<template>
  <main class="camp-main-content">
    <!-- Section Hero avec image de fond -->
    <section class="camp-hero d-flex align-items-center text-white"
      :style="`background-image: linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.8)), url(${campHero})`">
      <div class="camp-container">
        <div class="camp-hero-content">
          <!-- Badge d'actualité -->
          <div class="camp-badge mb-4">
            <span class="badge bg-warning text-dark">
              <i class="mdi mdi-alert-circle-outline me-2"></i>
              NOUVEAUTÉ 2025
            </span>
          </div>
          
          <h1 class="camp-title display-1 fw-bold">
            Camp Biblique 2025
          </h1>
          
          <p class="camp-subtitle lead fs-3 mb-4">
            Une expérience spirituelle transformatrice pour la jeunesse
          </p>
          
          <!-- Compte à rebours -->
          <div class="camp-countdown mb-5">
            <div class="row g-3 justify-content-center">
              <div class="col-6 col-md-3 mb-2">
                <div class="countdown-card">
                  <div class="countdown-number">{{ formattedCountdown.days }}</div>
                  <div class="countdown-label">Jours</div>
                </div>
              </div>
              <div class="col-6 col-md-3 mb-2">
                <div class="countdown-card">
                  <div class="countdown-number">{{ formattedCountdown.hours }}</div>
                  <div class="countdown-label">Heures</div>
                </div>
              </div>
              <div class="col-6 col-md-3 mb-2">
                <div class="countdown-card">
                  <div class="countdown-number">{{ formattedCountdown.minutes }}</div>
                  <div class="countdown-label">Minutes</div>
                </div>
              </div>
              <div class="col-6 col-md-3 mb-2">
                <div class="countdown-card">
                  <div class="countdown-number">{{ formattedCountdown.seconds }}</div>
                  <div class="countdown-label">Secondes</div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Call to Action -->
          <div class="camp-actions">
            <!-- <button @click="showModal = true" class="btn btn-primary btn-lg mr-3">
              <i class="mdi mdi-information-outline mr-2"></i>
              Détail sur l'activité
            </button> -->
            <a href="/sign-up" class="btn btn-outline-light btn-lg">
              <i class="mdi mdi-pencil"></i>
              Pré-inscription
            </a>
          </div>
        </div>
      </div>
    </section>

    <!-- Section Informations principales -->
    <section class="camp-section camp-info-section">
      <div class="camp-container">
        <div class="row align-items-center">
          <div class="col-lg-6 mb-5 mb-lg-0">
            <h2 class="camp-heading-primary mb-4">
              Camp Biblique 2025
              <span class="camp-subtitle-sm d-block mt-2">
                Préparation en cours...
              </span>
            </h2>
            
            <p class="camp-text-lg mb-4">
              Le <strong>Camp Biblique 2025</strong> est en pleine préparation ! Cette édition promet d'être une expérience spirituelle unique pour les jeunes désireux de renforcer leur foi et de grandir dans leur relation avec Dieu.
            </p>
            
            <!-- Informations en cours de chargement -->
            <div class="camp-loading-info">
              <div class="info-item mb-4">
                <h5 class="d-flex align-items-center">
                  <i class="mdi mdi-map-marker-outline text-primary me-3 fs-4"></i>
                  Lieu du Camp
                </h5>
                <small class="text-muted">En cours de finalisation - Annonce prévue avant le 20 Décembre</small>
              </div>
              
              <div class="info-item mb-4">
                <h5 class="d-flex align-items-center">
                  <i class="mdi mdi-book-open-page-variant text-primary me-3 fs-4"></i>
                  Thème Principal
                </h5>
                <small class="text-muted">En préparation - Révélation avec l'affiche officielle</small>
              </div>
              
              <!-- Dans la section Informations principales -->
              <div class="info-item">
                <h5 class="d-flex align-items-center">
                  <i class="mdi mdi-calendar-clock text-primary me-3 fs-4"></i>
                  Dates exactes
                </h5>
                <!-- Modifier cette ligne -->
                <h4 class="mt-3">Du 26 au 30 Décembre {{ new Date().getFullYear() }}</h4>
              </div>
            </div>
          </div>
          
          <div class="col-lg-6">
            <!-- Carte d'information visuelle -->
            <div class="camp-visual-card">
              <div class="card border-0 shadow-lg">
                <div class="card-body p-4">
                  <div class="text-center mb-4">
                    <i class="mdi mdi-campfire display-1 text-warning"></i>
                    <h3 class="mt-3">Édition Spéciale 2025</h3>
                  </div>
                  
                  <div class="camp-stats">
                    <div class="row text-center">
                      <div class="col-6 mb-4">
                        <div class="stat-number text-primary">5</div>
                        <div class="stat-label">Jours d'immersion</div>
                      </div>
                      <div class="col-6 mb-4">
                        <div class="stat-number text-primary">24/7</div>
                        <div class="stat-label">Vie communautaire</div>
                      </div>
                      <div class="col-6">
                        <div class="stat-number text-primary">1000+</div>
                        <div class="stat-label">Participants attendus</div>
                      </div>
                      <div class="col-6">
                        <div class="stat-number text-primary">5+</div>
                        <div class="stat-label">Animateurs expérimentés</div>
                      </div>
                    </div>
                  </div>
                  
                  <div class="text-center mt-4">
                    <button @click="showModal = true" class="btn btn-outline-primary">
                      <i class="mdi mdi-information-slab-circle-outline me-2"></i>
                      Plus d'informations
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Section Affiche officielle -->
    <section class="camp-section camp-poster-section bg-light">
      <div class="camp-container">
        <div class="text-center mb-5">
          <h2 class="camp-heading-secondary">
            Affiche Officielle 2025
            <span class="camp-subtitle-sm d-block mt-2">
              En cours de création - Dévoilement imminent
            </span>
          </h2>
        </div>
        
        <div class="camp-poster-container">
          <div class="camp-poster-placeholder">
            <div class="poster-image-wrapper">
              <img :src="campPosterPlaceholder" alt="Affiche Camp Biblique 2025" class="poster-image">
              <div class="poster-overlay">
                <div class="overlay-content">
                  <i class="mdi mdi-image-filter-hdr display-1 text-white mb-3"></i>
                  <h3 class="text-white">Affiche à venir</h3>
                  <p class="text-white mb-0">Camp Biblique 2025</p>
                  <small class="text-white-50">Dévoilement avant le 20 Décembre</small>
                </div>
              </div>
            </div>
            
            <div class="poster-info mt-4">
              <div class="row">
                <div class="col-md-6">
                  <div class="info-box">
                    <i class="mdi mdi-palette text-primary fs-3"></i>
                    <h5 class="mt-2">Design en cours</h5>
                    <p class="text-muted">Nos designers travaillent sur une affiche exceptionnelle</p>
                  </div>
                </div>
                <div class="col-md-6">
                  <div class="info-box">
                    <i class="mdi mdi-format-color-fill text-primary fs-3"></i>
                    <h5 class="mt-2">Soyez alertés</h5>
                    <p class="text-muted">Nous vous notifierons dès que l'affiche sera disponible</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Section Points forts -->
    <!-- <section class="camp-section camp-highlights-section">
      <div class="camp-container">
        <div class="text-center mb-5">
          <h2 class="camp-heading-primary">
            Ce qui vous attend
            <span class="camp-subtitle-sm d-block mt-2">
              Une expérience spirituelle complète et transformatrice
            </span>
          </h2>
        </div>
        
        <div class="row g-4">
          <div v-for="highlight in campInfo.highlights" :key="highlight.id" class="col-md-6 col-lg-4">
            <div class="camp-highlight-card">
              <div class="highlight-icon">
                <i :class="`mdi ${highlight.icon}`"></i>
              </div>
              <h5 class="mt-3">{{ highlight.title }}</h5>
              <p class="text-muted">{{ highlight.description }}</p>
            </div>
          </div>
        </div>
      </div>
    </section> -->

    <!-- Section Call to Action finale -->
    <section class="camp-section camp-cta-section">
      <div class="camp-container text-center">
        <h2 class="camp-heading-primary mb-4">
          Prêt à rejoindre le camp biblique 2025 ?
        </h2>
        
        <p class="camp-text-lg mb-5 mx-auto" style="max-width: 600px;">
          Le Camp Biblique 2025 sera un moment charnière dans votre vie de foi. Ne manquez pas cette opportunité de grandir spirituellement au sein d'une communauté fraternelle.
        </p>
        
        <div class="camp-cta-buttons">
          <a href="/sign-up" class="btn btn-primary btn-lg mr-3">
            <i class="mdi mdi-pencil-plus me-2"></i>
            Pré-inscription
          </a>
          <button @click="showModal = true" class="btn btn-outline-primary btn-lg">
            <i class="mdi mdi-information-variant me-2"></i>
            Plus d'informations
          </button>
        </div>
      </div>
    </section>

    <!-- Modal d'informations détaillées -->
    <div v-if="showModal" @click.self="showModal = false" class="camp-modal-backdrop">
      <div class="camp-modal-content">
        <div class="camp-modal-header">
          <h3 class="camp-modal-title">
            <i class="mdi mdi-information-outline me-2"></i>
            Détails du Camp Biblique 2025
          </h3>
          <button class="camp-modal-close" @click="showModal = false">
            <i class="mdi mdi-close"></i>
          </button>
        </div>
        
        <div class="camp-modal-body">
          <div class="row">
            <div class="col-md-6">
              <h5 class="mb-3">
                <i class="mdi mdi-format-align-left text-primary mr-2"></i>
                <strong><strong> Informations pratiques </strong></strong>
              </h5>
              <ul class="list-unstyled">
                <li class="mb-2"><strong>Dates :</strong> Du 26 au 30 Decembre </li>
                <li class="mb-2"><strong>Durée :</strong> 5 jours </li>
                <li class="mb-2"><strong>Lieu :</strong> En cours de détermination</li>
                <li class="mb-2"><strong>Public :</strong> Jeunes de 12 à 35 ans</li>
              </ul>
            </div>
            
            <div class="col-md-6">
              <h5 class="mb-3">
                <i class="mdi mdi-view-dashboard text-primary mr-2"></i>
                <strong><strong>Tarifs & Inscriptions</strong></strong></h5>
              <ul class="list-unstyled">
                <li class="mb-2"><strong>Pré-inscription :</strong> en ligne </li>
                <li class="mb-2"><strong>Inscriptions :</strong> Toujours ouvert </li>
                <li class="mb-2"><strong>Participation :</strong> 10 $ </li>
              </ul>
            </div>
          </div>
          
          <div class="mt-4">
            <h5><i class="mdi mdi-phone text-primary mr-2"></i>Contact & Informations</h5>
            <p>Pour toute question concernant le Camp Biblique 2025 :</p>
            <ul>
              <li>Email : <a href="mailto:info@mijerca.rccarchikin.org">info@mijerca.rccarchikin.org </a></li>
              <li>Téléphone : <a href="tel:+243 840 306 094"> +243 840 306 094 </a></li>
            </ul>
          </div>
        </div>
        
        <div class="camp-modal-footer">
          <button class="btn btn-primary" @click="showModal = false">
            <i class="mdi mdi-check me-2"></i>
            Compris
          </button>
        </div>
      </div>
    </div>
  </main>
</template>

<style scoped>
:root {
  --camp-color-primary: #4A90E2;
  --camp-color-primary-dark: #3A7BBF;
  --camp-color-secondary: #FFC107;
  --camp-color-accent: #28a745;
  --camp-color-background: #F7F9FC;
  --camp-color-text: #343a40;
  --camp-color-text-light: #6c757d;
}

.camp-main-content {
  font-family: 'Inter', sans-serif;
  color: var(--camp-color-text);
}

.camp-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.camp-section {
  padding: 80px 0;
  position: relative;
}

.camp-text-lg {
  font-size: 1.15rem;
  line-height: 1.8;
  color: var(--camp-color-text-light);
}

.camp-heading-primary {
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--camp-color-primary);
  margin-bottom: 20px;
}

.camp-heading-secondary {
  font-size: 2rem;
  font-weight: 700;
  color: var(--camp-color-primary);
  margin-bottom: 20px;
}

.camp-subtitle-sm {
  display: block;
  font-size: 1rem;
  font-weight: 400;
  color: var(--camp-color-text-light);
  margin-top: 5px;
}

/* Hero Section */
.camp-hero {
  background-size: cover !important;
  background-position: center !important;
  min-height: 85vh;
  position: relative;
}

.camp-hero-content {
  position: relative;
  z-index: 2;
  padding-top: 100px;
  text-align: center;
}

.camp-badge {
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
}

.camp-title {
  text-shadow: 2px 2px 8px rgba(0, 0, 0, 0.5);
  margin-bottom: 20px;
}

.camp-subtitle {
  text-shadow: 1px 1px 4px rgba(0, 0, 0, 0.5);
  opacity: 0.9;
}

/* Countdown */
.camp-countdown {
  max-width: 600px;
  margin: 0 auto;
}

.countdown-card {
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  border-radius: 15px;
  padding: 20px;
  text-align: center;
  border: 1px solid rgba(255, 255, 255, 0.2);
  transition: transform 0.3s ease;
}

.countdown-card:hover {
  transform: translateY(-5px);
  background: rgba(255, 255, 255, 0.25);
}

.countdown-number {
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--camp-color-secondary);
  line-height: 1;
}

.countdown-label {
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-top: 5px;
}

/* Loading Bars */
.loading-bar {
  height: 8px;
  background-color: #e9ecef;
  border-radius: 4px;
  overflow: hidden;
  margin: 10px 0;
}

.loading-progress {
  height: 100%;
  background: linear-gradient(90deg, var(--camp-color-primary), var(--camp-color-accent));
  border-radius: 4px;
  animation: loadingAnimation 1.5s infinite ease-in-out;
}

@keyframes loadingAnimation {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(200%); }
}

/* Visual Card */
.camp-visual-card {
  transform: perspective(1000px) rotateY(-5deg);
  transition: transform 0.5s ease;
}

.camp-visual-card:hover {
  transform: perspective(1000px) rotateY(0deg);
}

.stat-number {
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 5px;
}

.stat-label {
  font-size: 0.9rem;
  color: var(--camp-color-text-light);
}

/* Poster Section */
.camp-poster-placeholder {
  max-width: 800px;
  margin: 0 auto;
}

.poster-image-wrapper {
  position: relative;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
}

.poster-image {
  width: 100%;
  height: 400px;
  object-fit: cover;
  filter: brightness(0.7);
}

.poster-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(45deg, rgba(74, 144, 226, 0.3), rgba(40, 167, 69, 0.3));
  display: flex;
  align-items: center;
  justify-content: center;
}

.info-box {
  text-align: center;
  padding: 20px;
  background: white;
  border-radius: 15px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
  height: 100%;
}

/* Highlights */
.camp-highlight-card {
  background: white;
  padding: 30px;
  border-radius: 15px;
  text-align: center;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
  height: 100%;
  transition: all 0.3s ease;
  border: 2px solid transparent;
}

.camp-highlight-card:hover {
  transform: translateY(-10px);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
  border-color: var(--camp-color-primary);
}

.highlight-icon {
  width: 70px;
  height: 70px;
  margin: 0 auto;
  background: linear-gradient(135deg, var(--camp-color-primary), var(--camp-color-primary-dark));
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 30px;
}

/* Registration Section */
.camp-registration-section {
  position: relative;
  overflow: hidden;
}

.camp-registration-section::before {
  content: '';
  position: absolute;
  top: 0;
  right: 0;
  width: 300px;
  height: 300px;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.1) 0%, transparent 70%);
}

.camp-registration-card {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 40px;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

/* Modal */
.camp-modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.85);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2000;
  padding: 20px;
}

.camp-modal-content {
  background: white;
  border-radius: 20px;
  max-width: 600px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  animation: modalAppear 0.3s ease;
}

@keyframes modalAppear {
  from {
    opacity: 0;
    transform: translateY(50px) scale(0.9);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.camp-modal-header {
  padding: 25px 30px;
  border-bottom: 1px solid #e9ecef;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: linear-gradient(135deg, var(--camp-color-primary), var(--camp-color-primary-dark));
  color: white;
  border-radius: 20px 20px 0 0;
}

.camp-modal-title {
  margin: 0;
  font-size: 1.5rem;
}

.camp-modal-close {
  background: none;
  border: none;
  color: white;
  font-size: 24px;
  cursor: pointer;
  transition: transform 0.3s;
}

.camp-modal-close:hover {
  transform: rotate(90deg);
}

.camp-modal-body {
  padding: 30px;
}

.camp-modal-footer {
  padding: 20px 30px;
  border-top: 1px solid #e9ecef;
  text-align: right;
}

/* Responsive */
@media (max-width: 768px) {
  .camp-hero {
    min-height: 70vh;
  }
  
  .camp-title {
    font-size: 2.5rem;
  }
  
  .camp-subtitle {
    font-size: 1.25rem;
  }
  
  .camp-section {
    padding: 50px 0;
  }
  
  .camp-heading-primary {
    font-size: 2rem;
  }
  
  .camp-heading-secondary {
    font-size: 1.75rem;
  }
  
  .camp-countdown {
    max-width: 100%;
  }
  
  .countdown-number {
    font-size: 1.75rem;
  }
  
  .camp-registration-card {
    padding: 25px;
  }
  
  .camp-modal-content {
    max-width: 95%;
  }
}

@media (max-width: 576px) {
  .camp-hero-content {
    padding-top: 60px;
  }
  
  .camp-title {
    font-size: 2rem;
  }
  
  .camp-actions .btn {
    width: 100%;
    margin-bottom: 10px;
  }
  
  .camp-cta-buttons .btn {
    width: 100%;
    margin-bottom: 10px;
  }
}
</style>