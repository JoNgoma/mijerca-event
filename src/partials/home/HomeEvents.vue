<script setup>
import img1 from "/assets/img/img1.jpg"
import img2 from "/assets/img/img2.jpeg"
import img3 from "/assets/img/img3.jpeg"

const events = [
  { id: 1, title: "Camp Biblique", date: "26/12/2025", img: img1 },
  { id: 2, title: "Retraite Spirituelle", date: "15/01/2026", img: img2 },
  { id: 3, title: "Journée de Prière", date: "05/02/2026", img: img3 },
  { id: 4, title: "Camp Biblique 2", date: "26/12/2025", img: img1 },
  { id: 5, title: "Retraite Spirituelle 2", date: "15/01/2026", img: img2 },
  { id: 6, title: "Journée de Prière 2", date: "05/02/2026", img: img3 },
  { id: 7, title: "Journée de Prière 3", date: "05/02/2026", img: img2 },
]
</script>

<template>
  <!-- HERO / TITLE -->
  <section class="hero-events text-center text-white py-5 mb-5">
    <div class="container">
      <h1 class="display-4 fw-bold">Événements marquants</h1>
      <p class="lead">Rejoignez les jeunes pour des moments spirituels et de partage.</p>
    </div>
  </section>

  <!-- EVENTS GRID -->
  <main class="container">
    <div class="row g-4">
      <div v-for="event in events" :key="event.id" class="col-12 col-md-6 col-lg-4">
        <div class="card shadow-sm overflow-hidden">
          <div class="position-relative">
            <img :src="event.img" class="card-img-top" alt="image événement">
            <div class="overlay d-flex flex-column justify-content-end p-3">
              <h5 class="text-white">{{ event.title }}</h5>
              <p class="text-white small">{{ event.date }}</p>
            </div>
          </div>
          <div class="card-body text-center">
            <a href="#" class="btn btn-primary btn-sm">Voir plus</a>
          </div>
        </div>
      </div>
    </div>

    <!-- CALL TO ACTION -->
    <section class="text-center py-5 mt-5">
      <h2 class="fw-bold">Pourquoi participer ?</h2>
      <p class="lead text-muted mb-4">Vivez des expériences uniques et connectez-vous avec la communauté.</p>
      <a href="/sign-up" class="btn btn-lg btn-primary">S'enregistrer maintenant</a>
    </section>
  </main>
</template>

<style scoped>
.hero-events {
  background: url('/assets/img/img1.jpg') center/cover no-repeat;
  color: white;
  text-shadow: 2px 2px 6px rgba(0,0,0,0.6);
  border-radius: 0.5rem;
}

/* Overlay */
.card img {
  height: 18rem;
  object-fit: cover;
  width: 100%;
}
.overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(transparent, rgba(0,0,0,0.6));
  color: white;
  padding: 1rem;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .hero-events h1 {
    font-size: 2rem;
  }
  .hero-events p {
    font-size: 1rem;
  }
}
</style>
