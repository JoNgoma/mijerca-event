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
      	App.formElements();
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
                    <div class="form-group pt-2">
                      <label>Selectionner la date</label>
                        <div class="input-group date datetimepicker" data-date="" data-date-format="yyyy-mm-dd - HH:ii P" data-link-field="dtp_input1">
                          <input class="form-control" size="16" type="text" value="" readonly="">
                          <div class="input-group-append">
                            <button class="btn btn-primary"><i class="icon-th mdi mdi-calendar"></i></button>
                          </div>
                        </div>
                    </div>
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
                  </form>
                </div>
              </div>
            </div>

            <div class="col-lg-6">
              <div class="card card-border-color card-border-color-primary">
                <div class="card-body">
                  <form>
                    <div class="form-group pt-2">
                      <label>Entrer le motif de la dépense</label>
                        <textarea class="form-control" id="inputDepMotif"></textarea>
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

<style scoped>

</style>