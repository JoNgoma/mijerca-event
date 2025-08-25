<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useServiceContext } from '@/composables/useServiceContext';

const router = useRouter();
const { currentService, currentServiceType } = useServiceContext();

const pageTitle = computed(() => {
  return `${currentService.value.name}`;
});

const composeRoute = computed(() => {
  return {
    name: 'composer',
    params: { serviceType: currentServiceType.value }
  };
});

const descrip = computed(() => {
  return currentService.value.description;
});

$(document).ready(function(){
      	//-initialize the javascript
      	App.init();
      	App.formMultiselect();
      	App.masks();
      });
      
</script>

<template>
    <div class="be-content">
        <div class="page-head">
          <h2 class="page-head-title">{{ pageTitle }}</h2>
          <nav aria-label="breadcrumb" role="navigation">
            <ol class="breadcrumb page-head-nav">
              <li class="breadcrumb-item"><router-link :to="{ name: 'dashboard' }">Dashboard</router-link></li>
              <li class="breadcrumb-item"><a href="#">Paiement par paroisse</a></li>
              <li class="breadcrumb-item active">{{ pageTitle }}</li>
            </ol>
          </nav>
        </div>
        <div class="main-content container-fluid">
          <div class="row">
            
            <div class="col-lg-6">
              <div class="card card-border-color card-border-color-primary">
                <div class="card-body">
                  <form>
                    <div class="form-group row pt-3">
                      <label class="col-12 col-sm-3 col-form-label text-sm-right pt-4">Selectionner la dévise</label>
                      <div class="col-12 col-sm-8 col-lg-6">
                        <div class="form-check form-check-inline">
                          <label class="custom-control custom-radio custom-radio-icon custom-control-inline">
                            <input class="custom-control-input" id="radioIconDollars" type="radio" name="radio-icon" checked=""><span class="custom-control-label" style="display: flex; justify-content: center; align-items: center;"><span style="font-weight: bold; font-size: 2.1rem;">&dollar;</span></span>
                          </label>
                          <label class="custom-control custom-radio custom-radio-icon custom-control-inline">
                            <input class="custom-control-input" id="radioIconM" type="radio" name="radio-icon"><span class="custom-control-label" style="display: flex; justify-content: center; align-items: center;"><span style="font-weight: bold; font-size: 2.1rem;">Fc</span></span>
                          </label>
                        </div>
                      </div>
                    </div>
                    <div class="form-group pt-2">
                      <label>Entrer le montant par personne</label>
                    <div class="input-group mb-3">
                          <input class="form-control" type="text">
                          <div class="input-group-append"><span class="input-group-text">.00</span></div>
                        </div>
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
                  </form>
                </div>
              </div>
            </div>

            <div class="col-lg-6">
              <div class="card card-border-color card-border-color-primary">
                <div class="card-body">
                  <form>
                    <table class="table table-striped table-borderless">
                    <tr>
                      <td>
                        <select id="searchable" multiple="multiple">
                          <option value="Josué Ngoma">Josué Ngoma</option>
                          <option value="Divine Kangala">Divine Kangala</option>
                          <option value="Chadrack Akasa" selected="">Chadrack Akasa</option>
                          <option value="Jules Kalph">Jules Kalph</option>
                          <option value="Emmanuel Ngoyi">Emmanuel Ngoyi</option>
                          <option value="Bénie Rose Kangala">Bénie Rose Kangala</option>
                          <option value="Grâce Mibu" selected="">Grâce Mibu</option>
                        </select>
                      </td>
                      <!-- <td>Adds a search bar to filter options</td> -->
                    </tr>
                  </table>
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

<style scoped>

</style>