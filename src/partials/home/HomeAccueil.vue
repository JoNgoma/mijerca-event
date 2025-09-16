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
        <!-- .container -->
        <div class="container">
          <div class="card-body be-navbar-header"><a class="navbar-brand d-md-flex align-items-center justify-content-center" href="#">
            <img class=" d-md-block" :src="logo" alt="logo"/>
            <span class="fw-bold bg-white d-md-block d-none" style="font-size: 2.2rem; font-weight: bolder; color: blue; letter-spacing: 1.5px; padding-left: .5em">
              MIJERCA
            </span>
          </a>
        </div>
          <a class="navbar-btn btn btn-subtle-primary ml-auto order-lg-2" href="/sign-up" style="font-size: 1rem; font-weight: 600;">S'enregistrer</a> <!-- .navbar-collapse -->

        </div><!-- /.container -->
      </nav><!-- /.navbar -->
      <!-- /site header -->
      <!-- hero -->
      <section class="py-5">
        <!-- .container -->
        <div class="container container-fluid-xl">
          <!-- .row -->
          <div class="row align-items-center">
            <!-- .col-md-6 -->
            <div class="col-12 col-md-6 order-md-2" data-aos="fade-left">
              <img class="img-fluid img-float-md-6 mb-5 mb-md-0" src="/assets/images/illustration/launch.svg" alt="">
            </div><!-- /.col-md-6 -->
            <!-- .col-md-6 -->
            <div class="col-12 col-md-6 order-md-1" data-aos="fade-in">
              <div class="col-fix pl-xl-3 ml-auto text-center text-sm-left">
                <h1 class="display-4 enable-responsive-font-size mb-4"> Ministère des Jeunes du Renouveau Catholique </h1>
                <p class="lead text-muted mb-5"> Build rich and beautiful experiences for your project. Increase your productivity and grow your business. </p>
                <a href="/sign-up" class="btn btn-lg btn-primary d-block d-sm-inline-block mr-sm-2 my-3" data-aos="zoom-in" data-aos-delay="200">
                  S'enregistrer <i class="fa fa-angle-right ml-2"></i>
                </a>
                <a href="/login" style="font-size: 1rem; font-weight: 600;" class="btn btn-lg btn-subtle-primary d-block d-sm-inline-block my-3"   data-aos="zoom-in" data-aos-delay="300">
                  Administration
                </a>
              </div>
            </div><!-- /.col-md-6 -->
          </div><!-- /.row -->
        </div><!-- /.container -->
      </section><!-- /hero -->
      <!-- .feature -->
      <section class="py-5">
        <!-- .container -->
        <div class="container">
          <!-- .row -->
          <div class="row text-center text-md-left">
            <!-- .col -->
            <div class="col-6 col-md-3 py-4" data-aos="fade-up" data-aos-delay="0">
              <img class="mb-4" src="/assets/images/illustration/easy-config.svg" alt="" height="72">
              <h2 class="lead"> Prière </h2>
            </div><!-- /.col -->
            <!-- .col -->
            <div class="col-6 col-md-3 py-4" data-aos="fade-up" data-aos-delay="100">
              <img class="mb-4" src="/assets/images/illustration/scale.svg" alt="" height="72">
              <h2 class="lead"> Partage </h2>
            </div><!-- /.col -->
            <!-- .col -->
            <div class="col-6 col-md-3 py-4" data-aos="fade-up" data-aos-delay="200">
              <img class="mb-4" src="/assets/images/illustration/support.svg" alt="" height="72">
              <h2 class="lead"> Méditation </h2>
            </div><!-- /.col -->
            <!-- .col -->
            <div class="col-6 col-md-3 py-4" data-aos="fade-up" data-aos-delay="300">
              <img class="mb-4" src="/assets/images/illustration/lab.svg" alt="" height="72">
              <h2 class="lead"> Développement intégral </h2>
            </div><!-- /.col -->
          </div><!-- /.row -->
        </div><!-- /.container -->
      </section><!-- /.feature -->
      <!-- sections title -->
      <section class="py-5">
        <!-- .container -->
        <div class="container">
          <!-- .row -->
          <div class="row">
            <!-- .col -->
            <div class="col-12 col-md-8 offset-md-2 text-center">
              <h2> With You From the Ground Up </h2>
              <p class="lead text-muted"> Architected as an extension of Bootstrap, built to reach your goals. </p>
            </div><!-- /.col -->
          </div><!-- /.row -->
        </div><!-- /.container -->
      </section><!-- /sections title -->
      <!-- feature -->
      <section class="py-5">
        <!-- .container -->
        <div class="container">
          <!-- .row -->
          <div class="row align-items-center">
            <!-- .col-md-6 -->
            <div class="col-12 col-md-6" data-aos="fade-right">
              <img class="img-fluid mb-4 mb-md-0" src="/assets/images/illustration/solution.svg" alt="">
            </div><!-- /.col-md-6 -->
            <!-- .col-md-6 -->
            <div class="col-12 col-md-6 text-center text-sm-left">
              <h3 class="mb-4"> Increase your productivity </h3>
              <p class="text-muted font-size-lg mb-4"> Create stunning UI with tons of our components. Our build system allows you to save a lot of time as well. </p><a href="#" class="btn btn-subtle-primary">Browse all components</a>
            </div><!-- /.col-md-6 -->
          </div><!-- /.row -->
        </div><!-- /.container -->
      </section>
      <section class="pt-5">
        <!-- .container -->
        <div class="container">
          <!-- .row -->
          <div class="row align-items-center">
            <!-- .col-md-6 -->
            <div class="col-12 col-md-6 order-md-2" data-aos="fade-left">
              <img class="img-fluid mb-4 mb-md-0" src="/assets/images/illustration/testimony.svg" alt="">
            </div><!-- /.col-md-6 -->
            <!-- .col-md-6 -->
            <div class="col-12 col-md-6 order-md-1 text-center text-sm-left">
              <h3 class="mb-4"> Grow your business </h3>
              <p class="text-muted font-size-lg mb-4"> With a user-friendly, simple and responsive design, you can easily attract your prospective clients. Don't worry! our team will always be behind you if needed. </p><a href="#" class="btn btn-subtle-primary">Explore details</a>
            </div><!-- /.col-md-6 -->
          </div><!-- /.row -->
        </div><!-- /.container -->
      </section><!-- /feature -->
      <!-- divider -->
      <section class="position-relative">
        <!-- wave2.svg -->
        <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="192" viewbox="0 0 1440 240" preserveaspectratio="none">
          <path class="fill-light" fill-rule="evenodd" d="M0 240V0c19.985 5.919 41.14 11.008 63.964 14.89 40.293 6.855 82.585 9.106 125.566 9.106 74.151 0 150.382-6.697 222.166-8.012 13.766-.252 27.51-.39 41.21-.39 99.76 0 197.087 7.326 282.907 31.263C827.843 72.527 860.3 117.25 906.926 157.2c43.505 37.277 115.38 51.186 208.485 53.076 7.584.153 15.156.224 22.714.224 40.887 0 81.402-2.062 121.914-4.125 40.512-2.062 81.027-4.125 121.902-4.125 1.01 0 2.019.002 3.03.004 16.208.042 34.959.792 55.029 2.234V240H0z"></path>
        </svg>
      </section><!-- /divider -->
      <!-- feature -->
      <section class="position-relative pb-5 bg-light">
        <!-- .sticker -->
        <div class="sticker">
          <div class="sticker-item sticker-top-right sticker-soften">
            <img src="/assets/images/decoration/cubes.svg" alt="" data-aos="zoom-in">
          </div>
          <div class="sticker-item sticker-bottom-left sticker-soften scale-150">
            <img src="/assets/images/decoration/cubes.svg" alt="" data-aos="zoom-in">
          </div>
        </div><!-- /.sticker -->
        <!-- .container -->
        <div class="container position-relative">
          <h2 class="text-center text-sm-left"> Get more benefits </h2>
          <p class="lead text-muted text-center text-sm-left mb-5"> Scaffold your theme and start developing quickly. </p><!-- .card-deck -->
          <div class="card-deck-lg">
            <!-- .card -->
            <div class="card shadow" data-aos="fade-up" data-aos-delay="0">
              <!-- .card-body -->
              <div class="card-body p-4">
                <div class="d-sm-flex align-items-start text-center text-sm-left">
                  <img src="/assets/images/illustration/rocket.svg" class="mr-sm-4 mb-3 mb-sm-0" alt="" width="72">
                  <div class="flex-fill">
                    <h5 class="mt-0"> Ready-to-go </h5>
                    <p class="text-muted font-size-lg"> Provides a tons of useful Components and Pages that allow you to focus on your application logic rather than re-touching pixels. </p>
                  </div>
                </div>
              </div><!-- /.card-body -->
            </div><!-- /.card -->
            <!-- .card -->
            <div class="card shadow" data-aos="fade-up" data-aos-delay="100">
              <!-- .card-body -->
              <div class="card-body p-4">
                <div class="d-sm-flex align-items-start text-center text-sm-left">
                  <img src="/assets/images/illustration/setting.svg" class="mr-sm-4 mb-3 mb-sm-0" alt="" width="72">
                  <div class="flex-fill">
                    <h5 class="mt-0"> Highly functionality </h5>
                    <p class="text-muted font-size-lg"> Looper is not 1001 in 1 shit theme, there's not an obscene amount of wasted space, and we are carefully in adding useful features without going overboard. </p>
                  </div>
                </div>
              </div><!-- /.card-body -->
            </div><!-- /.card -->
          </div><!-- /.card-deck -->
          <!-- .card-deck -->
          <div class="card-deck-lg">
            <!-- .card -->
            <div class="card shadow" data-aos="fade-up" data-aos-delay="200">
              <!-- .card-body -->
              <div class="card-body p-4">
                <div class="d-sm-flex align-items-start text-center text-sm-left">
                  <img src="/assets/images/illustration/brain.svg" class="mr-sm-4 mb-3 mb-sm-0" alt="" width="72">
                  <div class="flex-fill">
                    <h5 class="mt-0"> Boost your creativity </h5>
                    <p class="text-muted font-size-lg"> The design is clean, simple, modern, and essential, with Lots of refined graphics and tons of 3rd party support. </p>
                  </div>
                </div>
              </div><!-- /.card-body -->
            </div><!-- /.card -->
            <!-- .card -->
            <div class="card shadow" data-aos="fade-up" data-aos-delay="300">
              <!-- .card-body -->
              <div class="card-body p-4">
                <div class="d-sm-flex align-items-start text-center text-sm-left">
                  <img src="/assets/images/illustration/horse.svg" class="mr-sm-4 mb-3 mb-sm-0" alt="" width="72">
                  <div class="flex-fill">
                    <h5 class="mt-0"> Simple workflow </h5>
                    <p class="text-muted font-size-lg"> We make sure you can make a magic by running just two command. It was very easy, extremely powerful, and modern. </p>
                  </div>
                </div>
              </div><!-- /.card-body -->
            </div><!-- /.card -->
          </div><!-- /.card-deck -->
          <!-- .card-deck -->
          <div class="card-deck-lg">
            <!-- .card -->
            <div class="card shadow" data-aos="fade-up" data-aos-delay="400">
              <!-- .card-body -->
              <div class="card-body p-4">
                <div class="d-sm-flex align-items-start text-center text-sm-left">
                  <img src="/assets/images/illustration/savings.svg" class="mr-sm-4 mb-3 mb-sm-0" alt="" width="72">
                  <div class="flex-fill">
                    <h5 class="mt-0"> One time payment </h5>
                    <p class="text-muted font-size-lg"> After you make a purchase you will get a free update forever. We will make Looper better and better again for you. </p>
                  </div>
                </div>
              </div><!-- /.card-body -->
            </div><!-- /.card -->
            <!-- .card -->
            <div class="card shadow" data-aos="fade-up" data-aos-delay="500">
              <!-- .card-body -->
              <div class="card-body p-4">
                <div class="d-sm-flex align-items-start text-center text-sm-left">
                  <img src="/assets/images/illustration/document.svg" class="mr-sm-4 mb-3 mb-sm-0" alt="" width="72">
                  <div class="flex-fill">
                    <h5 class="mt-0"> Well Documented </h5>
                    <p class="text-muted font-size-lg"> Each component is well explained with example, code block and best practices. We also provide extensive information about customizing Looper. </p>
                  </div>
                </div>
              </div><!-- /.card-body -->
            </div><!-- /.card -->
          </div><!-- /.card-deck -->
        </div><!-- /.container -->
      </section><!-- /feature -->
      <!-- feature -->
      <section class="position-relative py-5 bg-light">
        <!-- .sticker -->
        <div class="sticker">
          <div class="sticker-item sticker-top-right sticker-soften translate-x-50">
            <img src="/assets/images/decoration/bubble1.svg" alt="" data-aos="fade-left">
          </div>
        </div><!-- /.sticker -->
        <!-- .container -->
        <div class="container position-relative">
          <h2 class="text-center"> Simple pricing </h2>
          <p class="lead text-muted text-center mb-5"> Quality design and excellent support at an affordable price. </p><!-- .row -->
          <div class="row align-items-center">
            <!-- .col -->
            <div class="col-12 col-md-5 offset-md-1 py-md-4 pr-md-0">
              <div class="card font-size-lg shadow-lg" data-aos="fade-up">
                <h5 class="card-header text-center text-success p-4 px-lg-5"> Standard License </h5>
                <div class="card-body p-4 p-lg-5">
                  <h3 class="display-3 text-center">
                    <sup><small>$</small></sup>49<small><small>/app</small></small>
                  </h3>
                  <p class="text-center text-muted mb-5"> If you are a freelancer, team, or you just create an app for your internal company, this offers is great for you. </p>
                  <ul class="list-icons">
                    <li class="mb-2 pl-1">
                      <span class="list-icon"><img class="mr-2" src="/assets/images/decoration/check.svg" alt="" width="16"></span> Build a Single End Product </li>
                    <li class="mb-2 pl-1">
                      <span class="list-icon"><img class="mr-2" src="/assets/images/decoration/check.svg" alt="" width="16"></span> Use for Personal or a Client </li>
                    <li class="mb-2 pl-1">
                      <span class="list-icon"><img class="mr-2" src="/assets/images/decoration/check.svg" alt="" width="16"></span> Make unlimited copies </li>
                    <li class="mb-2 pl-1">
                      <span class="list-icon"><img class="mr-2" src="/assets/images/decoration/check.svg" alt="" width="16"></span> Modify the Theme </li>
                    <li class="mb-2 pl-1">
                      <span class="list-icon"><img class="mr-2" src="/assets/images/decoration/check.svg" alt="" width="16"></span> Combine with another works </li>
                    <li class="mb-2 pl-1">
                      <span class="list-icon"><img class="mr-2" src="/assets/images/decoration/check.svg" alt="" width="16"></span> Free update forever </li>
                    <li class="mb-2 pl-1">
                      <span class="list-icon"><img class="mr-2" src="/assets/images/decoration/check.svg" alt="" width="16"></span> 24/7 support </li>
                  </ul>
                </div>
                <div class="card-footer">
                  <a href="https://themes.getbootstrap.com/product/looper-responsive-admin-template" class="card-footer-item p-4 px-lg-5">Purchase now</a>
                </div>
              </div>
            </div><!-- /.col -->
            <!-- .col -->
            <div class="col-12 col-md-5 py-md-4 pl-md-0">
              <div class="card font-size-lg card-inverse bg-primary shadow" data-aos="fade-up" data-aos-delay="200">
                <h5 class="card-header text-center p-4 px-lg-5"> Extended License </h5>
                <div class="card-body p-4 p-lg-5">
                  <h3 class="display-3 text-center">
                    <sup><small>$</small></sup>499<small><small>/app</small></small>
                  </h3>
                  <p class="text-center text-muted-light mb-5"> Build your app, sell and charge your users. You don't need to pay us anymore. </p>
                  <ul class="list-icons">
                    <li class="mb-2 pl-1">
                      <span class="list-icon"><img class="mr-2" src="/assets/images/decoration/check.svg" alt="" width="16"></span> Include all the Standar License </li>
                    <li class="mb-2 pl-1">
                      <span class="list-icon"><img class="mr-2" src="/assets/images/decoration/check.svg" alt="" width="16"></span> Use in an End Product that is "Sold" </li>
                    <li class="mb-2 pl-1">
                      <span class="list-icon"><img class="mr-2" src="/assets/images/decoration/check.svg" alt="" width="16"></span> Can have multiple paying users </li>
                  </ul>
                </div>
                <div class="card-footer">
                  <a href="https://themes.getbootstrap.com/product/looper-responsive-admin-template" class="card-footer-item text-white p-4 px-lg-5">Purchase now</a>
                </div>
              </div>
            </div><!-- /.col -->
          </div><!-- /.row -->
        </div><!-- /.container -->
      </section><!-- /feature -->
      <!-- testimonials -->
      <section class="position-relative py-5 bg-light">
        <!-- .sticker -->
        <div class="sticker">
          <div class="sticker-item sticker-bottom-left sticker-soften">
            <img src="/assets/images/decoration/bubble2.svg" alt="" data-aos="zoom-in" data-aos-delay="200">
          </div>
        </div><!-- /.sticker -->
        <!-- .container -->
        <div class="container position-relative mb-5">
          <h2 class="text-center"> You are in a good company </h2>
          <p class="text-center text-muted font-size-lg mb-5"> We are nothing without you! Thanks to all of you who have contributed in every update. </p><!-- .row -->
          <div class="row mb-6">
            <!-- .col -->
            <div class="col-12 col-md-8 offset-md-2 py-3">
              <!-- .row -->
              <div class="row justify-content-center text-center">
                <div class="col-4 col-md-3 col-lg-2 mb-5" data-aos="fade-up" data-aos-delay="0">
                  <img src="/assets/images/logo/airbnb.svg" alt="" class="img-fluid" style="max-height: 32px">
                </div>
                <div class="col-4 col-md-3 col-lg-2 mb-5" data-aos="fade-up" data-aos-delay="100">
                  <img src="/assets/images/logo/amazon.svg" alt="" class="img-fluid" style="max-height: 32px">
                </div>
                <div class="col-4 col-md-3 col-lg-2 mb-5" data-aos="fade-up" data-aos-delay="200">
                  <img src="/assets/images/logo/apple.svg" alt="" class="img-fluid" style="max-height: 32px">
                </div>
                <div class="col-4 col-md-3 col-lg-2 mb-5" data-aos="fade-up" data-aos-delay="300">
                  <img src="/assets/images/logo/dropbox.svg" alt="" class="img-fluid" style="max-height: 32px">
                </div>
                <div class="col-4 col-md-3 col-lg-2 mb-5" data-aos="fade-up" data-aos-delay="400">
                  <img src="/assets/images/logo/google.svg" alt="" class="img-fluid" style="max-height: 32px">
                </div>
                <div class="col-4 col-md-3 col-lg-2 mb-5" data-aos="fade-up" data-aos-delay="500">
                  <img src="/assets/images/logo/linkedin.svg" alt="" class="img-fluid" style="max-height: 32px">
                </div>
                <div class="col-4 col-md-3 col-lg-2 mb-5" data-aos="fade-up" data-aos-delay="600">
                  <img src="/assets/images/logo/paypal.svg" alt="" class="img-fluid" style="max-height: 32px">
                </div>
                <div class="col-4 col-md-3 col-lg-2 mb-5" data-aos="fade-up" data-aos-delay="700">
                  <img src="/assets/images/logo/shopify.svg" alt="" class="img-fluid" style="max-height: 32px">
                </div>
                <div class="col-4 col-md-3 col-lg-2 mb-5" data-aos="fade-up" data-aos-delay="900">
                  <img src="/assets/images/logo/sketch.svg" alt="" class="img-fluid" style="max-height: 32px">
                </div>
                <div class="col-4 col-md-3 col-lg-2 mb-5" data-aos="fade-up" data-aos-delay="1000">
                  <img src="/assets/images/logo/slack.svg" alt="" class="img-fluid" style="max-height: 32px">
                </div>
              </div><!-- /.row -->
            </div><!-- /.col -->
          </div><!-- /.row -->
          <!-- .row -->
          <div class="row">
            <!-- .col -->
            <div class="col-12 col-md-6 col-lg-4 offset-lg-1 mr-md-0">
              <!-- .card -->
              <div class="card shadow-none rounded-lg mb-0 mr-md-n5 mt-md-n5 scale-125" data-aos="fade-in">
                <img class="img-fluid rounded-lg" src="/assets/images/dummy/happy-client.jpg" alt="">
              </div><!-- /.card -->
            </div><!-- /.col -->
            <!-- .col -->
            <div class="col-12 col-md-6 col-lg-5 ml-md-0">
              <!-- .card -->
              <div class="card shadow-lg rounded-lg p-4 ml-md-n5 mt-md-5" data-aos="fade-up">
                <blockquote class="blockquote text-center border-0 p-3 p-md-4">
                  <figure>
                    <img class="mr-2" src="/assets/images/decoration/quote.svg" alt="" height="32">
                  </figure>
                  <p> I am a Looper enthusiast in many ways. First, the design is modern and essential, yet very pleasant and rich of refined graphics. Plus, it has some serious gems like rich-text editor, timeline activity, autocompletes and many other components that literally boost your creativity and the features you can put in a website. On top of all that, the creator offers excellent support on a few hours response time! </p>
                  <footer class="blockquote-footer"> Marco, through <cite title="Bootstrap Themes">Bootstrap Themes</cite>
                  </footer>
                </blockquote>
              </div><!-- /.card -->
            </div><!-- /.col -->
          </div><!-- /.row -->
        </div><!-- /.container -->
      </section><!-- /testimonials -->
      <!-- call to action -->
      <section class="py-5 position-relative bg-light">

        <!-- .container -->
        <div class="container">
          <!-- .card -->
          <div class="card bg-success text-white position-relative overflow-hidden shadow rounded-lg p-4 mb-0" data-aos="fade-up">
            <!-- .sticker -->
            <div class="sticker">
              <div class="sticker-item sticker-middle-left">
                <img class="flip-y" src="/assets/images/decoration/bubble4.svg" alt="">
              </div>
            </div><!-- /.sticker -->
            <!-- .card-body -->
            <div class="card-body d-md-flex justify-content-between align-items-center text-center position-relative">
              <h3 class="font-weight-normal mb-3 mb-md-0 mr-md-3"> Jeune d'aujourd'hui, espoir de demain </h3><a class="btn btn-lg btn-primary shadow" href="#"> Nous contacter <i class="fa fa-angle-right ml-2"></i></a>
            </div><!-- /.card-body -->
          </div><!-- /.card -->
        </div><!-- /.container -->
      </section><!-- /call to action -->
    </main>
</template>

<style scoped>
@import "/assets/stylesheets/theme.min.css";
.navbar-brand img {
  max-height: 3rem;
}
</style>
