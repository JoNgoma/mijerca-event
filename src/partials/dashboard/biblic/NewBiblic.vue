<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
$(document).ready(function(){
      	//-initialize the javascript
      	App.init();
      	App.masks();
      });
</script>

<template>
    <div class="be-content">
        <div class="page-head">
          <h2 class="page-head-title">Nouveau Camp biblique</h2>
          <nav aria-label="breadcrumb" role="navigation">
            <ol class="breadcrumb page-head-nav">
              <li class="breadcrumb-item"><a href="#">Dashboard</a></li>
              <!-- <li class="breadcrumb-item"><a href="#">Camp biblique</a></li> -->
              <li class="breadcrumb-item active">Nouveau Camp biblique</li>
            </ol>
          </nav>
        </div>
        <div class="main-content container-fluid">
          <div class="row">
            <div class="col-lg-6">
              <div class="card card-border-color card-border-color-primary">
                <div class="card-header card-header-divider">Nouveau camp biblique<span class="card-subtitle">Renseignement sur l'activité</span></div>
                <div class="card-body">
                  <form>
                    <div class="form-group pt-2">
                      <label for="inputActiviteDebut">Début de l'activité</label>
                    <input id="inputActiviteDebut" class="form-control" type="text" data-mask="date" placeholder="DD/MM/YYYY">
                    </div>
                    <div class="form-group pt-2">
                      <label for="inputActiviteFin">Fin de l'activité</label>
                    <input id="inputActiviteFin" class="form-control" type="text" data-mask="date" placeholder="DD/MM/YYYY">
                    </div>
                    <div class="form-group">
                      <label for="inputActiviteLieu">Lieu de l'activité</label>
                      <input class="form-control" id="inputActiviteLieu" type="text" placeholder="Camp biblique">
                    </div>
                  </form>
                </div>
              </div>
            </div>
            <div class="col-lg-6">
              <div class="card card-border-color card-border-color-primary">
                <div class="card-body">
                  <form>
                    <div class="form-group pt-2">
                      <label for="inputTextarea3">Thème de l'activité</label>
                        <textarea class="form-control" id="inputTheme"></textarea>
                    </div>
                    <div class="row pt-8">
                      <div class="col-12 d-flex justify-content-end">
                        <button class="btn btn-secondary mr-4">Retour</button>
                        <button class="btn btn-primary" type="submit">Enregistrer</button>
                      </div>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
</template>