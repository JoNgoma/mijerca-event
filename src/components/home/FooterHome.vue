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
            <li><a href="/events" class="text-white text-decoration-none d-block mb-1">Evénements</a></li>
            <li><a href="/news" class="text-white text-decoration-none d-block mb-1">Actualité</a></li>
            <li><a href="/paroisses" class="text-white text-decoration-none d-block mb-1">Paroisses</a></li>
          </ul>
        </div>

        <!-- Réseaux sociaux -->
        <div class="col-md-4 text-start">
          <h5 class="mb-3">Suivez-nous</h5>
          <ul class="list-unstyled">
            <li><a target="_blank" href="https://www.facebook.com/profile.php?id=100092526310267" class="text-white text-decoration-none d-block mb-1">Facebook</a></li>
            <li><a target="_blank" href="https://www.tiktok.com/@mijerca.kin.news?_r=1&_t=ZS-92AYpRNrjTo" class="text-white text-decoration-none d-block mb-1">TikTok</a></li>
            <!-- <li><a target="_blank" href="/contact" class="text-white text-decoration-none d-block mb-1">Instagram</a></li> -->
            <li><a target="_blank" href="https://youtube.com/@rccarchikin7926?si=O_WHnecFw5B5RMSE" class="text-white text-decoration-none d-block mb-1">YouTube</a></li>
            <li><a target="_blank" href="https://rccarchikin.org/" class="text-white text-decoration-none d-block mb-1">Renouveau Charismatique Catholique</a></li>
          </ul>
        </div>

        <!-- Contact rapide -->
        <div class="col-md-4 text-start">
          <h5 class="mb-3">Contact</h5>
          <p class="mb-1"><strong>Email :</strong> info@mijerca.rccarchikin.org </p>
          <p class="mb-1"><strong>Téléphone :</strong> +243 840 306 094 </p>
          <p class="mb-0"><strong>Adresse :</strong> Avenue des Orangers, Kinshasa/Kalamu, RDC </p>
        </div>
      </div>

      <hr class="bg-secondary my-4">

      <!-- Copyright -->
      <div class="text-center pb-3">
        <p class="mb-0">
          &copy; MIJERCA Kinshasa 2025. Tous droits réservés.
          <br />
          <span class="d-block mt-1">
            Prod. by 
            <a target="_blank" href="https://josue-ngoma-folio.onrender.com/" class="text-white text-decoration-none mb-1">
              Beyin LQ
            </a>
          </span>
        </p>
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
