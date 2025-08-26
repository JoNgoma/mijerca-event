<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useServiceContext } from '@/composables/useServiceContext';

const router = useRouter();
const { currentService, currentServiceType } = useServiceContext();
const pageTitle = computed(() => {
  return `${currentService.value.name}`;
});

const descr = computed(() => {
  return currentService.value.description;
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
          <h2 class="page-head-title">{{pageTitle}}</h2>
          <nav aria-label="breadcrumb" role="navigation">
            <ol class="breadcrumb page-head-nav">
              <li class="breadcrumb-item"><router-link :to="{ name: 'dashboard' }">Dashboard</router-link></li>
              <li class="breadcrumb-item"><a href="#">{{ descr }}</a></li>
              <li class="breadcrumb-item active">{{pageTitle}}</li>
            </ol>
          </nav>
        </div>
        <div class="main-content container-fluid">
          <div class="row">
            <div class="col-lg-6">
              <div class="card card-border-color card-border-color-primary">
                <div class="card-header card-header-divider">{{ descr }}<span class="card-subtitle">Ajouter un doyenné inexistant</span></div>
                <div class="card-body">
                  <form>
                    <div class="form-group pt-2">
                      <label for="inputNameDoy">Nom du doyenné</label>
                      <input class="form-control" id="inputNameDoy" type="text" placeholder="Saint Noé Mawaggali">
                    </div>
                    <div class="row pt-8">
                      <div class="col-12 d-flex justify-content-end">
                        <button class="btn btn-secondary mr-4">Retour</button>
                        <button class="btn btn-primary" type="submit">Enregistrer doyené</button>
                      </div>
                    </div>
                  </form>
                </div>
              </div>
            </div>
            <div class="col-lg-6">
              <div class="card card-border-color card-border-color-primary">
                  <div class="card-header card-header-divider">Nouvelle paroisse</div>
                <div class="card-body">
                  <form>
                    <div class="form-group">
                      <label>Selectionner le doyenné</label>
                      <select class="form-control">
                          <option value="KIN EST" selected>Saint Noé Mawaggali</option>
                          <option value="KIN CENTRE">NODASA</option>
                          <option value="KIN OUEST">Saint Sacrement</option>
                        </select>
                    </div>
                    <div class="form-group">
                      <label for="inputNamPar">Nom de la paroisse</label>
                      <input class="form-control" id="inputNamePar" type="text" placeholder="Saint Noé Mawaggali">
                    </div>
                    <div class="row">
                      <div class="col-12 d-flex justify-content-end">
                        <button class="btn btn-secondary mr-4">Retour</button>
                        <button class="btn btn-primary" type="submit">Enregistrer paroisse</button>
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