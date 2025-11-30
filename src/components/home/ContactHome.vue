<template>
  <section class="contact-section py-5 bg-light">
    <div class="container">
      <div class="text-center mb-5">
        <h2>Contactez-nous</h2>
        <p>Nous sommes disponibles pour répondre à vos questions et vous guider dans vos démarches.</p>
      </div>

      <div class="row gy-4">
        <!-- Infos -->
        <div class="col-md-6">
          <h5>Nos coordonnées</h5>
          <ul class="list-unstyled">
            <li><strong>Adresse :</strong> Avenue des Orangers, Kinshasa/ Kalamu, RDC</li>
            <li><strong>Téléphone :</strong> +243 840 306 094 </li>
            <li><strong>Email :</strong> info@mijerca.rccarchikin.org</li>
          </ul>

          <div class="social-links mt-3">
            <a href="#" class="me-2"><i class="bi bi-facebook"></i></a>
            <a href="#" class="me-2"><i class="bi bi-twitter"></i></a>
            <a href="#"><i class="bi bi-instagram"></i></a>
          </div>
        </div>

        <!-- Carte -->
        <div class="col-md-6">
          <iframe 
          src="https://www.google.com/maps/embed?pb=!1m14!1m12!1m3!1d1670.5533638052864!2d15.322651508211205!3d-4.342528528811178!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!5e1!3m2!1sfr!2scd!4v1758885326073!5m2!1sfr!2scd" 
          max-width="550" max-height="375" style="border:0;" allowfullscreen="" loading="lazy" referrerpolicy="no-referrer-when-downgrade">
          </iframe>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.contact-section h2 {
  color: #0d47a1;
}
.social-links a {
  font-size: 1.5rem;
  color: #0d47a1;
  transition: color 0.3s;
}
.social-links a:hover {
  color: #6610f2;
}
</style>
