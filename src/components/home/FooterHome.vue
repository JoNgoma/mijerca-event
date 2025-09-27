<template>
  <!-- FOOTER -->
  <footer class="bg-dark text-white pt-5">
    <div class="container">
      <div class="row gy-4">
        <!-- Menu secondaire -->
        <div class="col-md-4 text-start">
          <h5 class="mb-3">Navigation</h5>
          <ul class="list-unstyled">
            <li><a href="/" class="text-white text-decoration-none d-block mb-1">Accueil</a></li>
            <li><a href="/about" class="text-white text-decoration-none d-block mb-1">À propos</a></li>
            <li><a href="/contact" class="text-white text-decoration-none d-block mb-1">Contact</a></li>
            <li><a href="#" class="text-white text-decoration-none d-block mb-1">Politique de confidentialité</a></li>
          </ul>
        </div>

        <!-- Réseaux sociaux -->
        <div class="col-md-4 text-start">
          <h5 class="mb-3">Suivez-nous</h5>
          <div class="d-flex gap-3 flex-wrap">
            <a href="#" class="text-white fs-4"><i class="bi bi-facebook"></i></a>
            <a href="#" class="text-white fs-4"><i class="bi bi-twitter"></i></a>
            <a href="#" class="text-white fs-4"><i class="bi bi-instagram"></i></a>
            <a href="#" class="text-white fs-4"><i class="bi bi-youtube"></i></a>
          </div>
        </div>

        <!-- Contact rapide -->
        <div class="col-md-4 text-start">
          <h5 class="mb-3">Contact</h5>
          <p class="mb-1"><strong>Email :</strong> info@mijerca.rccarchikin.org </p>
          <p class="mb-1"><strong>Téléphone :</strong> +243 840 306 094 </p>
          <p class="mb-0"><strong>Adresse :</strong> Avenue des Oliviers, Kinshasa/Kalamu, RDC </p>
        </div>
      </div>

      <hr class="bg-secondary my-4">

      <!-- Copyright -->
      <div class="text-center pb-3">
        <p class="mb-0">&copy; Beyin 2025 <br/> Tous droits réservés.</p>
      </div>
    </div>
  </footer>
</template>

<style scoped>
footer h5 {
  color: #0d6efd;
  font-weight: 600;
}

footer a:hover {
  color: #6610f2;
  text-decoration: underline;
}

footer p, footer li {
  color: #ced4da;
  font-size: 0.95rem;
}

/* MOBILE : colonnes empilées et centrées */
@media (max-width: 767px) {
  footer .col-md-4 {
    text-align: center !important;
  }

  footer .d-flex {
    justify-content: center !important;
  }
}
</style>
