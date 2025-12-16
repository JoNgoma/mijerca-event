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
  date: "Du 26 au 30 Décembre 2025",
  location: {
    name: "En cours de détermination",
    status: "loading"
  },
  theme: {
    title: "Les Épîtres Catholiques",
    description: "Une étude approfondie des Épîtres Catholiques (Jacques, Pierre, Jean, Jude) et leur application dans la vie des jeunes chrétiens.",
    subtopics: [
      {
        title: "Épître de Jacques : Une foi vivante et agissante",
        orientations: [
          "Présentation de l'auteur",
          "La pertinence actuelle de l'Épître",
          "Valorisation des œuvres qui accompagnent la foi",
          "Inviter les jeunes à devenir praticien de la parole de Dieu"
        ]
      },
      {
        title: "Épîtres de Pierre 1 et 2 : L'espérance au cœur de l'épreuve",
        orientations: [
          "La présentation de l'auteur",
          "La persévérance dans les épreuves",
          "La vie de sainteté",
          "L'espérance du retour du Christ"
        ]
      },
      {
        title: "1-2-3 Jean : Vérité, amour et vigilance",
        orientations: [
          "La présentation de l'auteur",
          "Le contexte de la rédaction de ses livres",
          "Vivre l'amour pur, la vérité et la Fidélité",
          "Mise en garde contre les faux enseignements"
        ]
      },
      {
        title: "Épître de Jude : Résister à la corruption spirituelle",
        orientations: [
          "La présentation de l'auteur",
          "La pertinence actuelle de l'Épître",
          "La prière persévérante",
          "Mettre en garde contre les dérives doctrinales et morales"
        ]
      }
    ],
    canonicalStudy: {
      title: "De la parole apostolique à la norme ecclésiale",
      description: "Lecture canonique des épîtres universelles",
      orientations: [
        "Relier l'épître de Jacques qui insiste sur les œuvres et la justice sociale, aux normes canoniques sur la charité et la mission sociale de l'Église (Can. 839 P 1)",
        "Structure ecclésiale (hiérarchie et la gouvernance - Can. 127 et 1263) en s'inspirant des épîtres de Pierre et Jean qui évoquent les responsabilités des anciens, la vigilance doctrinale, et la communion fraternelle",
        "Correction et discipline : lier les procédures canoniques de correction et de protection de la foi (Can. 1371) à l'épître de Jude qui met en garde contre les faux docteurs",
        "Canons spécifiques aux associations privées de fidèles (Can. 321-326) cas du Renouveau Catholique"
      ]
    },
    status: "loaded"
  },
  poster: {
    image: campPosterPlaceholder,
    status: "coming_soon",
    releaseDate: "15 Mars 2025"
  },
  highlights: [
    {
      id: 1,
      icon: "mdi-receipt",
      title: "Études Bibliques",
      description: "Exploration approfondie des Épîtres Catholiques"
    },
    {
      id: 2,
      icon: "mdi-pin-assistant",
      title: "Moments de Prière",
      description: "Sessions de prière collective et personnelle"
    },
    {
      id: 3,
      icon: "mdi-collection-speaker",
      title: "Louanges & Adoration",
      description: "Célébrations en musique et chants"
    },
    {
      id: 4,
      icon: "mdi-collection-item-9",
      title: "Carrefour",
      description: "Partages et témoignages"
    },
    {
      id: 5,
      icon: "mdi-labels",
      title: "Enseignements",
      description: "Orientations pratiques pour la vie chrétienne"
    },
    {
      id: 6,
      icon: "mdi-lamp",
      title: "Veillées Spirituelles",
      description: "Nuits de recueillement et partage"
    }
  ],
  countdown: {
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    targetDate: new Date(2025, 11, 26, 18, 0, 0) // 26 Décembre 2025 à 18h
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
            « Les Épîtres Catholiques » : Une foi vivante et agissante
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
            <a href="/sign-up" class="btn btn-outline-light btn-lg">
              <i class="mdi mdi-edit mr-1"></i>
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
                « Les Épîtres Catholiques »
              </span>
            </h2>
            
            <p class="camp-text-lg mb-4">
              Le <strong>Camp Biblique 2025</strong> aura lieu <strong>du 26 au 30 Décembre 2025</strong>. Cette édition spéciale sera dédiée à l'étude approfondie des <strong>Épîtres Catholiques</strong> (Jacques, Pierre, Jean, Jude), offrant aux jeunes une immersion totale dans la Parole de Dieu pour fortifier leur foi et les équiper pour leur vie chrétienne.
            </p>
            
            <!-- Informations détaillées -->
            <div class="camp-detailed-info">
              <div class="info-item mb-4">
                <h5 class="d-flex align-items-center">
                  <i class="mdi mdi-calendar text-dark mr-1 fs-4"></i>
                  Dates exactes
                </h5>
                <h4 class="text-primary mt-2">Du 26 au 30 Décembre 2025</h4>
              </div>
              
              <div class="info-item mb-4">
                <h5 class="d-flex align-items-center">
                  <i class="mdi mdi-my-location text-dark mr-1 fs-4"></i>
                  Lieu du Camp
                </h5>
                <small class="text-muted">En cours de finalisation - Annonce prévue avant le 20 Décembre</small>
              </div>
              
              <div class="info-item">
                <h5 class="d-flex align-items-center mb-3">
                  <i class="mdi mdi-receipt text-dark mr-1 fs-4"></i>
                  Thème Principal
                </h5>
                <h4 class="text-success">« Les Épîtres Catholiques »</h4>
                <p class="mt-2">Une foi vivante et agissante - L'espérance au cœur de l'épreuve - Vérité, amour et vigilance - Résister à la corruption spirituelle</p>
              </div>
            </div>
          </div>
          
          <div class="col-lg-6">
            <!-- Carte d'information visuelle -->
            <div class="camp-visual-card">
              <div class="card border-0 shadow-lg">
                <div class="card-body p-4">
                  <div class="text-center mb-4">
                    <i class="mdi mdi-layers display-1 text-warning"></i>
                    <h3 class="mt-3">Étude des Épîtres Catholiques</h3>
                  </div>
                  
                  <div class="camp-stats">
                    <div class="row text-center">
                      <div class="col-6 mb-4">
                        <div class="stat-number text-primary">5</div>
                        <div class="stat-label">Jours d'immersion</div>
                      </div>
                      <div class="col-6 mb-4">
                        <div class="stat-number text-primary">4</div>
                        <div class="stat-label">Épîtres étudiées</div>
                      </div>
                      <div class="col-6">
                        <div class="stat-number text-primary">20+</div>
                        <div class="stat-label">Sessions bibliques</div>
                      </div>
                      <div class="col-6">
                        <div class="stat-number text-primary">5+</div>
                        <div class="stat-label">Animateurs expérimentés</div>
                      </div>
                    </div>
                  </div>
                  
                  <div class="text-center mt-4">
                    <button @click="showModal = true" class="btn btn-outline-primary">
                      <i class="mdi mdi-info mr-1"></i>
                      Programme détaillé
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Section Thème et Sous-thèmes -->
    <section class="camp-section camp-theme-section bg-light">
      <div class="camp-container">
        <div class="text-center mb-5">
          <h2 class="camp-heading-secondary">
            Thème 2025 : Les Épîtres Catholiques
            <span class="camp-subtitle-sm d-block mt-2">
              Une étude approfondie pour une foi vivante et agissante
            </span>
          </h2>
        </div>
        
        <div class="row g-4">
          <!-- Sous-thème 1 -->
          <div class="col-md-6 col-lg-3">
            <div class="camp-theme-card">
              <div class="theme-icon bg-primary">
                <i class="mdi mdi-fire
"></i>
              </div>
              <h5 class="mt-3 text-primary">Épître de Jacques</h5>
              <h6 class="text-muted mb-3">Une foi vivante et agissante</h6>
              <ul class="theme-orientations">
                <li>Présentation de l'auteur</li>
                <li>Pertinence actuelle de l'Épître</li>
                <li>Œuvres qui accompagnent la foi</li>
                <li>Devenir praticien de la Parole</li>
              </ul>
            </div>
          </div>
          
          <!-- Sous-thème 2 -->
          <div class="col-md-6 col-lg-3">
            <div class="camp-theme-card">
              <div class="theme-icon bg-success">
                <i class="mdi mdi-label-heart"></i>
              </div>
              <h5 class="mt-3 text-success">Épîtres de Pierre</h5>
              <h6 class="text-muted mb-3">L'espérance au cœur de l'épreuve</h6>
              <ul class="theme-orientations">
                <li>Présentation de l'auteur</li>
                <li>Persévérance dans les épreuves</li>
                <li>Vie de sainteté</li>
                <li>Espérance du retour du Christ</li>
              </ul>
            </div>
          </div>
          
          <!-- Sous-thème 3 -->
          <div class="col-md-6 col-lg-3">
            <div class="camp-theme-card">
              <div class="theme-icon bg-warning">
                <i class="mdi mdi-shield-check"></i>
              </div>
              <h5 class="mt-3 text-warning">1-2-3 Jean</h5>
              <h6 class="text-muted mb-3">Vérité, amour et vigilance</h6>
              <ul class="theme-orientations">
                <li>Présentation de l'auteur</li>
                <li>Contexte de rédaction</li>
                <li>Vivre l'amour pur et la vérité</li>
                <li>Mise en garde contre faux enseignements</li>
              </ul>
            </div>
          </div>
          
          <!-- Sous-thème 4 -->
          <div class="col-md-6 col-lg-3">
            <div class="camp-theme-card">
              <div class="theme-icon bg-danger">
                <i class="mdi mdi-shield-security"></i>
              </div>
              <h5 class="mt-3 text-danger">Épître de Jude</h5>
              <h6 class="text-muted mb-3">Résister à la corruption spirituelle</h6>
              <ul class="theme-orientations">
                <li>Présentation de l'auteur</li>
                <li>Pertinence actuelle</li>
                <li>Prière persévérante</li>
                <li>Garde contre dérives doctrinales</li>
              </ul>
            </div>
          </div>
        </div>
        
        <!-- Étude canonique -->
        <div class="camp-canonical-study mt-5 pt-1">
          <div class="card border-primary">
            <div class="card-header bg-primary text-white m-0 px-4">
              <h4 class="mb-0">
                <i class="mdi mdi-balance mr-2"></i>
                Étude canonique : De la parole apostolique à la norme ecclésiale
              </h4>
            </div>
            <div class="card-body">
              <p class="lead">Lecture canonique des épîtres universelles dans le contexte de l'Église Catholique</p>
              
              <div class="row mt-4">
                <div class="col-md-6 mb-3">
                  <div class="d-flex">
                    <i class="mdi mdi-scale-balance text-primary fs-4 me-3"></i>
                    <div>
                      <h6>Justice sociale et charité</h6>
                      <small>L'épître de Jacques et les normes canoniques (Can. 839 P 1)</small>
                    </div>
                  </div>
                </div>
                <div class="col-md-6 mb-3">
                  <div class="d-flex">
                    <i class="mdi mdi-account-group text-primary fs-4 me-3"></i>
                    <div>
                      <h6>Structure ecclésiale</h6>
                      <small>Hiérarchie et gouvernance (Can. 127 et 1263)</small>
                    </div>
                  </div>
                </div>
                <div class="col-md-6 mb-3">
                  <div class="d-flex">
                    <i class="mdi mdi-gavel text-primary fs-4 me-3"></i>
                    <div>
                      <h6>Correction et discipline</h6>
                      <small>Procédures canoniques (Can. 1371)</small>
                    </div>
                  </div>
                </div>
                <div class="col-md-6 mb-3">
                  <div class="d-flex">
                    <i class="mdi mdi-account-multiple text-primary fs-4 me-3"></i>
                    <div>
                      <h6>Associations de fidèles</h6>
                      <small>Canons spécifiques (Can. 321-326)</small>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Section Points forts -->
    <section class="camp-section camp-highlights-section">
      <div class="camp-container">
        <div class="text-center mb-5">
          <h2 class="camp-heading-primary">
            Ce qui vous attend au camp Biblique 2025
            <span class="camp-subtitle-sm d-block mt-2">
              Une expérience spirituelle complète et transformatrice
            </span>
          </h2>
        </div>
        
        <div class="row g-4">
          <div v-for="highlight in campInfo.highlights" :key="highlight.id" class="col-md-6 col-lg-4 mb-4">
            <div class="camp-highlight-card">
              <div class="highlight-icon">
                <i :class="`mdi ${highlight.icon} text-dark`"></i>
              </div>
              <h5 class="mt-3">{{ highlight.title }}</h5>
              <p class="text-muted">{{ highlight.description }}</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Section Call to Action finale -->
    <section class="camp-section camp-cta-section bg-primary text-white">
      <div class="camp-container text-center">
        <h2 class="camp-heading-primary mb-4 text-white">
          Prêt à approfondir votre foi ?
        </h2>
        
        <p class="camp-text-lg mb-5 mx-auto" style="max-width: 600px;">
          Le Camp Biblique 2025 sera une opportunité unique d'étudier les Épîtres Catholiques et de renforcer votre relation avec Dieu. Inscrivez-vous dès maintenant pour réserver votre place !
        </p>
        
        <div class="camp-cta-buttons">
          <a href="/sign-up" class="btn btn-light btn-lg text-primary mr-3">
            <i class="mdi mdi-edit mr-1"></i>
            Pré-inscription
          </a>
          <button @click="showModal = true" class="btn btn-outline-light btn-lg">
            <i class="mdi mdi-info mr-1"></i>
            Programme détaillé
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
          <div class="row mb-4">
            <div class="col-md-6">
              <h5 class="mb-3" style="font-weight: bold;">
                <i class="mdi mdi-calendar mr-1"></i>
                Informations pratiques
              </h5>
              <ul class="list-unstyled">
                <li class="mb-2"><strong>Dates :</strong> Du 26 au 30 Décembre 2025</li>
                <li class="mb-2"><strong>Durée :</strong> 5 jours complets</li>
                <li class="mb-2"><strong>Lieu :</strong> En cours de détermination</li>
                <li class="mb-2"><strong>Public :</strong> Jeunes de 12 à 35 ans</li>
                <li class="mb-2"><strong>Participation :</strong> 10 $ par personne</li>
              </ul>
            </div>
            
            <div class="col-md-6">
              <h5 class="mb-3" style="font-weight: bold;">
                <i class="mdi mdi-book mr-1"></i>
                Inscriptions
              </h5>
              <ul class="list-unstyled">
                <li class="mb-2"><strong>Pré-inscription :</strong> En ligne uniquement</li>
                <li class="mb-2"><strong>Date limite :</strong> 25 Décembre 2025</li>
                <li class="mb-2"><strong>Places :</strong> Premier arrivé, premier servi</li>
              </ul>
            </div>
          </div>
          
          <!-- Thème détaillé -->
          <div class="camp-theme-details mb-4">
            <h5 class="border-bottom pb-2 mb-3" style="font-weight: bold;">
              <i class="mdi mdi-book mr-1"></i>
              Programme détaillé du Thème
            </h5>
            
            <div class="mb-4">
              <h6 class="text-primary" style="font-size : 1.5rem;">Thème général : « Les Épîtres Catholiques »</h6>
              <p>{{ campInfo.theme.description }}</p>
            </div>
            
            <!-- Sous-thèmes -->
            <div class="row g-3">
              <div v-for="(subtopic, index) in campInfo.theme.subtopics" :key="index" class="col-md-6">
                <div class="card h-100 border">
                  <div class="card-body">
                    <h6 class="card-title text-primary">{{ subtopic.title }}</h6>
                    <ul class="small">
                      <li v-for="(orientation, idx) in subtopic.orientations" :key="idx">{{ orientation }}</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Étude canonique -->
            <div class="mt-4">
              <div class="card border-primary">
                <div class="card-header bg-light">
                  <h6 class="mb-0 text-primary">
                    <i class="mdi mdi-balance mr-1"></i>
                    {{ campInfo.theme.canonicalStudy.title }}
                  </h6>
                </div>
                <div class="card-body">
                  <p><strong>{{ campInfo.theme.canonicalStudy.description }}</strong></p>
                  <ul class="small">
                    <li v-for="(orientation, idx) in campInfo.theme.canonicalStudy.orientations" :key="idx">{{ orientation }}</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Contact -->
          <div class="mt-4 pt-4 border-top">
            <h5 style="font-weight: bold;">
              <i class="mdi mdi-phone-msg text-primary mr-1"></i>
              Contact & Informations
            </h5>
            <p>Pour toute question concernant le Camp Biblique 2025 :</p>
            <ul class="list-unstyled">
              <li class="mb-2">
                <i class="mdi mdi-email mr-1"></i>
                Email : <a href="mailto:info@mijerca.rccarchikin.org">info@mijerca.rccarchikin.org</a>
              </li>
              <li>
                <i class="mdi mdi-phone mr-1"></i>
                Téléphone : <a href="tel:+243840306094">+243 840 306 094</a>
              </li>
            </ul>
          </div>
        </div>
        
        <div class="camp-modal-footer">
          <a href="/sign-up" class="btn btn-primary mr-2">
            Pré-inscription
          </a>
          <button class="btn btn-outline-primary" @click="showModal = false">
            Fermer
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

/* Theme Cards */
.camp-theme-card {
  background: white;
  padding: 25px;
  border-radius: 15px;
  text-align: center;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
  height: 100%;
  transition: all 0.3s ease;
  border: 2px solid transparent;
}

.camp-theme-card:hover {
  transform: translateY(-10px);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
  border-color: var(--camp-color-primary);
}

.theme-icon {
  width: 70px;
  height: 70px;
  margin: 0 auto;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 30px;
}

.theme-orientations {
  list-style: none;
  padding-left: 0;
  text-align: left;
  margin-top: 15px;
}

.theme-orientations li {
  padding: 5px 0;
  padding-left: 20px;
  position: relative;
  font-size: 0.9rem;
  color: var(--camp-color-text-light);
}

.theme-orientations li:before {
  content: "✓";
  position: absolute;
  left: 0;
  color: var(--camp-color-primary);
  font-weight: bold;
}

/* Canonical Study */
.camp-canonical-study .card {
  border-radius: 15px;
  overflow: hidden;
}

.camp-canonical-study .card-header {
  border-radius: 15px 15px 0 0 !important;
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
  max-width: 800px;
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

/* Theme Details in Modal */
.camp-theme-details .card {
  border-radius: 10px;
  margin-bottom: 15px;
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
  
  .theme-orientations li {
    font-size: 0.8rem;
  }
}
</style>