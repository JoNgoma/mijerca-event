<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useServiceContext } from '@/composables/useServiceContext';

const router = useRouter();
const { currentService, currentServiceType } = useServiceContext();


const breadcrumbService = computed(() => {
  return currentService.value.name;
});

$(document).ready(function(){
      	//-initialize the javascript
      	App.init();
      	App.masks();
      });
      
</script>

<template>
    <div class="be-content">
        <div class="page-head">
          <h2 class="page-head-title">Nouvelle Unité</h2>
          <nav aria-label="breadcrumb" role="navigation">
            <ol class="breadcrumb page-head-nav">
              <li class="breadcrumb-item"><router-link :to="{ name: 'dashboard' }">Dashboard</router-link></li>
              <li class="breadcrumb-item"><a href="#">{{ breadcrumbService }}</a></li>
              <li class="breadcrumb-item active">Nouvelle Unité</li>
            </ol>
          </nav>
        </div>
        <div class="main-content container-fluid">
          <div class="row">
            <div class="col-lg-6">
              <div class="card card-border-color card-border-color-primary">
                <div class="card-header card-header-divider">Nouveau {{ breadcrumbService }}<span class="card-subtitle">Veuillez entrer les coordonnées correspondantes</span></div>
                <div class="card-body">
                  <form>
                      <div class="form-group row pt-3">
                      <label class="col-12 col-sm-3 col-form-label text-sm-right pt-4">Selectionner le genre</label>
                      <div class="col-12 col-sm-8 col-lg-6">
                        <div class="form-check form-check-inline">
                          <label class="custom-control custom-radio custom-radio-icon custom-control-inline">
                            <input class="custom-control-input" id="radioIconF" type="radio" name="radio-icon" checked=""><span class="custom-control-label"><i class="mdi mdi-female"></i></span>
                          </label>
                          <label class="custom-control custom-radio custom-radio-icon custom-control-inline">
                            <input class="custom-control-input" id="radioIconM" type="radio" name="radio-icon"><span class="custom-control-label"><i class="mdi mdi-male-alt"></i></span>
                          </label>
                        </div>
                      </div>
                    </div>
                    <div class="form-group pt-2">
                      <label for="inputNumber" >Numéro de téléphone</label>
                      <input id="inputNumber" class="form-control" type="text" data-mask="phone-int" placeholder="+243 999 999 999">
                      <!-- <label for="inputNumber">Numéro de téléphone</label>
                      <input class="form-control" id="inputNumber" type="text" placeholder="0812345678"> -->
                    </div>
                    <div class="form-group">
                      <label for="inputNames">Noms au complet</label>
                      <input class="form-control" id="inputNames" type="text" placeholder="Joe Doe">
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
                      <label>Selectionner le secteur</label>
                      <select class="form-control">
                          <option value="KIN EST" selected>KIN EST</option>
                          <option value="KIN CENTRE">KIN CENTRE</option>
                          <option value="KIN OUEST">KIN OUEST</option>
                        </select>
                    </div>
                    <div class="form-group pt-2">
                      <label>Selectionner le doyenné</label>
                      <select class="form-control">
                          <option value="KIN EST" selected>Saint Noé Mawaggali</option>
                          <option value="KIN CENTRE">NODASA</option>
                          <option value="KIN OUEST">Saint Sacrement</option>
                        </select>
                    </div>
                    <div class="form-group pt-2">
                      <label>Selectionner la paroisse</label>
                      <select class="form-control">
                        <option value="KIN OUEST">Saint Norbert</option>
                          <option value="KIN EST" selected>Saint Noé Mawaggali</option>
                          <option value="KIN CENTRE">Saint Mugaga</option>
                        </select>
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