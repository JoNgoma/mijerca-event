<script setup>
import img1 from "/assets/img/img1.jpg"
import img2 from "/assets/img/img2.jpeg"
import img3 from "/assets/img/img3.jpeg"

const events = [
  { id: 1, type: 'Camp Biblique', title: "Camp Biblique 2023", date: "26/12/2025", img: img1, description: "Une immersion spirituelle pour approfondir la Parole de Dieu et renforcer la communion fraternelle." },
  { id: 2, type: 'Camp Biblique', title: "Camp Biblique 2024", date: "15/01/2026", img: img2, description: "Une semaine d’enseignement, de prière et de formation biblique dans une atmosphère fraternelle." },
  { id: 3, type: 'École des responsables', title: "Ecores 2025", date: "05/02/2026", img: img3, description: "Formation intense pour les futurs responsables du MIJERCA, alliant leadership, spiritualité et mission." },
  { id: 4, type: 'Montagne', title: "Inye 2025", date: "26/12/2025", img: img1, description: "Pèlerinage nocturne sur la montagne pour vivre un face-à-face avec Dieu dans le silence et la prière." },
  { id: 5, type: 'Come to Me', title: "Come to Me 2024", date: "15/01/2026", img: img2, description: "Veillée d’adoration et de louange chaque 14 février pour se rapprocher du cœur de Jésus." },
  { id: 6, type: 'Come to Me', title: "Come to Me 2025", date: "05/02/2026", img: img3, description: "Un moment unique de prière, de méditation et de renouvellement spirituel au pied du Saint-Sacrement." },
  { id: 7, type: 'JDM', title: "JDM 2025", date: "05/02/2026", img: img2, description: "La Journée Diocésaine des Jeunes rassemble toute la jeunesse pour célébrer la foi et l’unité en Christ." },
]

// Groupement par type
const groupedEvents = Object.values(
  events.reduce((acc, ev) => {
    if (!acc[ev.type]) acc[ev.type] = { type: ev.type, list: [] }
    acc[ev.type].list.push(ev)
    return acc
  }, {})
)
</script>

<template>
  <main class="mi-main-content">
    <!-- <section class="hero-events text-center text-white py-5 mb-5">
      <div class="container">
        <h1 class="display-4 fw-bold">Événements Marquants</h1>
        <p class="lead">Découvrez les moments forts du MIJERCA qui transforment les vies et fortifient la foi.</p>
      </div>
    </section> -->

    <div class="container">
      <!-- Carrousel pour chaque type d'événement -->
      <section
        v-for="group in groupedEvents"
        :key="group.type"
        class="mb-5"
      >
        <h2 class="mi-heading-primary mb-3 text-center">
          {{ group.type }}
        </h2>

        <div class="mi-carousel-wrapper">
          <div
            v-for="event in group.list"
            :key="event.id"
            class="mi-carousel-item"
          >
            <div class="card mi-card mi-card-hover">
              <img :src="event.img" class="card-img-top mi-card-img" alt="image événement">
              <div class="card-body">
                <h5 class="mi-card-title">{{ event.title }}</h5>
                <p class="small text-muted mb-1">{{ event.date }}</p>
                <p class="mi-card-text">{{ event.description }}</p>
                <a href="#" class="btn mi-btn-primary btn-sm">Voir plus</a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Appel à l'action -->
      <section class="text-center py-5 mt-5">
        <h2 class="fw-bold">Prêt à participer ?</h2>
        <p class="lead text-muted mb-4">
          Rejoignez la communauté et vivez des expériences spirituelles inoubliables.
        </p>
        <a href="/sign-up" class="btn mi-btn-primary mi-btn-lg">S'enregistrer maintenant</a>
      </section>
    </div>
  </main>
</template>

<style scoped>
.hero-events {
  background: linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.7)),
              url('/assets/img/img1.jpg') center/cover no-repeat;
  color: white;
  border-radius: .5rem;
}
.mi-heading-primary {
  color: #4A90E2;
  font-weight: 700;
}

/* Carrousel horizontal */
.mi-carousel-wrapper {
  display: flex;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  gap: 1.5rem;
  padding-bottom: 1rem;
}
.mi-carousel-wrapper::-webkit-scrollbar {
  height: 8px;
}
.mi-carousel-wrapper::-webkit-scrollbar-thumb {
  background-color: #4A90E2;
  border-radius: 8px;
}

/* Élément du carrousel */
.mi-carousel-item {
  flex: 0 0 85%;
  scroll-snap-align: start;
}
@media(min-width:768px){
  .mi-carousel-item{ flex: 0 0 calc(33.333% - 1rem); }
}
@media(min-width:1024px){
  .mi-carousel-item{ flex: 0 0 calc(25% - 1rem); }
}

/* Cartes */
.mi-card {
  border: none;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 15px rgba(0,0,0,0.1);
  transition: transform .3s ease, box-shadow .3s ease;
}
.mi-card-hover:hover {
  transform: translateY(-8px);
  box-shadow: 0 15px 35px rgba(0,0,0,0.2);
}
.mi-card-img {
  height: 200px;
  object-fit: cover;
}
.mi-card-title {
  color: #3A7BBF;
  font-weight: 700;
  font-size: 1.2rem;
}
.mi-card-text {
  font-size: .95rem;
  color: #555;
  line-height: 1.6;
}
.mi-btn-primary {
  background-color: #4A90E2;
  color: white;
  border: none;
  border-radius: 20px;
  transition: all .3s;
}
.mi-btn-primary:hover {
  background-color: #3A7BBF;
}
</style>
