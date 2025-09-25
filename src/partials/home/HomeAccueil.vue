<script setup>
import logo from "/assets/img/mijerca.jpg"
import { onMounted } from "vue"

onMounted(() => {
  const skin = localStorage.getItem("skin") || "default"
  document.querySelectorAll('link[data-skin]').forEach(link => {
    if (link.getAttribute("data-skin") !== skin) {
      link.disabled = true
    }
  })
  document.documentElement.classList.add("loading")
})

</script>

<template>
    <main class="app app-site">
      <nav class="navbar navbar-expand-lg navbar-light py-4" data-aos="fade-in">
        <div class="container">
          <div class="card-body be-navbar-header"><a class="navbar-brand d-md-flex align-items-center justify-content-center" href="#">
            <img class=" d-md-block" :src="logo" alt="logo"/>
            <span class="fw-bold bg-white d-md-block d-none" style="font-size: 2.2rem; font-weight: bolder; color: blue; letter-spacing: 1.5px; padding-left: .5em">
              MIJERCA
            </span>
          </a>
        </div>
          <a class="navbar-btn btn btn-subtle-primary ml-auto order-lg-2" href="/sign-up" style="font-size: 1rem; font-weight: 600;">S'enregistrer</a>
        </div>
      </nav>
      <section class="py-5">
        <div class="container container-fluid-xl">
          <div class="row align-items-center">
            <div class="col-12 col-md-6 order-md-2" data-aos="fade-left">
              <img class="img-fluid img-float-md-6 mb-5 mb-md-0" src="/assets/images/illustration/launch.svg" alt="">
            </div>
            <div class="col-12 col-md-6 order-md-1" data-aos="fade-in">
              <div class="col-fix pl-xl-3 ml-auto text-center text-sm-left">
                <h1 class="display-4 enable-responsive-font-size mb-4"> Ministère des Jeunes du Renouveau Catholique </h1>
                <p class="lead text-muted mb-5"> Inscrivez-vous facilement aux événements et activités du Ministère des Jeunes du Renouveau Catholique. </p>
                <a href="/sign-up" class="btn btn-lg btn-primary d-block d-sm-inline-block mr-sm-2 my-3" data-aos="zoom-in" data-aos-delay="200">
                  S'enregistrer <i class="fa fa-angle-right ml-2"></i>
                </a>
                <a href="/login" style="font-size: 1rem; font-weight: 600;" class="btn btn-lg btn-subtle-primary d-block d-sm-inline-block my-3" data-aos="zoom-in" data-aos-delay="300">
                  Administration
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section class="py-5">
        <div class="container">
          <div class="row text-center text-md-left">
            <div class="col-6 col-md-3 py-4" data-aos="fade-up" data-aos-delay="0">
              <img class="mb-4" src="/assets/images/illustration/easy-config.svg" alt="" height="72">
              <h2 class="lead"> Prière </h2>
            </div>
            <div class="col-6 col-md-3 py-4" data-aos="fade-up" data-aos-delay="100">
              <img class="mb-4" src="/assets/images/illustration/scale.svg" alt="" height="72">
              <h2 class="lead"> Partage </h2>
            </div>
            <div class="col-6 col-md-3 py-4" data-aos="fade-up" data-aos-delay="200">
              <img class="mb-4" src="/assets/images/illustration/support.svg" alt="" height="72">
              <h2 class="lead"> Méditation </h2>
            </div>
            <div class="col-6 col-md-3 py-4" data-aos="fade-up" data-aos-delay="300">
              <img class="mb-4" src="/assets/images/illustration/lab.svg" alt="" height="72">
              <h2 class="lead"> Développement intégral </h2>
            </div>
          </div>
        </div>
      </section>
      <section class="py-5">
        <div class="container">
          <div class="row">
            <div class="col-12 col-md-8 offset-md-2 text-center">
              <h2> Accompagnement et Formation des Jeunes </h2>
              <p class="lead text-muted"> Une plateforme conçue pour soutenir la croissance spirituelle et personnelle des jeunes du diocèse de Kinshasa. </p>
            </div>
          </div>
        </div>
      </section>
      <section class="py-5">
        <div class="container">
          <div class="row align-items-center">
            <div class="col-12 col-md-6" data-aos="fade-right">
              <img class="img-fluid mb-4 mb-md-0" src="/assets/images/illustration/solution.svg" alt="">
            </div>
            <div class="col-12 col-md-6 text-center text-sm-left">
              <h3 class="mb-4"> Développez vos compétences </h3>
              <p class="text-muted font-size-lg mb-4"> Profitez d’outils et ressources pour mieux vous préparer à vos responsabilités dans le Ministère et au sein de la communauté. </p>
              <a href="#" class="btn btn-subtle-primary">Découvrir les ressources</a>
            </div>
          </div>
        </div>
      </section>
      <section class="pt-5">
        <div class="container">
          <div class="row align-items-center">
            <div class="col-12 col-md-6 order-md-2" data-aos="fade-left">
              <img class="img-fluid mb-4 mb-md-0" src="/assets/images/illustration/testimony.svg" alt="">
            </div>
            <div class="col-12 col-md-6 order-md-1 text-center text-sm-left">
              <h3 class="mb-4"> Engagez-vous avec la communauté </h3>
              <p class="text-muted font-size-lg mb-4"> Connectez-vous facilement avec d'autres jeunes et participez aux activités spirituelles et sociales du diocèse. </p>
              <a href="#" class="btn btn-subtle-primary">Explorer les événements</a>
            </div>
          </div>
        </div>
      </section>
      <section class="py-5 position-relative bg-light">
        <div class="container">
          <h2 class="text-center"> Avantages pour les jeunes </h2>
          <p class="lead text-muted text-center mb-5"> Accédez à des formations, des événements et des outils pour grandir spirituellement et personnellement. </p>
        </div>
      </section>
      <section class="py-5 position-relative bg-light">
        <div class="container">
          <h2 class="text-center"> Témoignages </h2>
          <p class="text-center text-muted font-size-lg mb-5"> Découvrez les expériences des jeunes qui participent aux activités du Ministère. </p>
        </div>
      </section>
      <section class="py-5 position-relative bg-success text-white">
        <div class="container">
          <div class="card bg-success text-white position-relative overflow-hidden shadow rounded-lg p-4 mb-0" data-aos="fade-up">
            <div class="card-body d-md-flex justify-content-between align-items-center text-center position-relative">
              <h3 class="font-weight-normal mb-3 mb-md-0 mr-md-3"> Jeune d'aujourd'hui, espoir de demain </h3>
              <a class="btn btn-lg btn-primary shadow" href="#"> Nous contacter <i class="fa fa-angle-right ml-2"></i></a>
            </div>
          </div>
        </div>
      </section>
    </main>
</template>


<style scoped>
@import "/assets/stylesheets/theme.min.css";
.navbar-brand img {
  max-height: 3rem;
}
</style>
