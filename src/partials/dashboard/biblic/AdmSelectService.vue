<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useServiceContext } from '@/composables/useServiceContext';

const router = useRouter();
const { currentService, currentServiceType } = useServiceContext();

const pageTitle = computed(() => {
  return `${currentService.value.name}`;
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
              <li class="breadcrumb-item"><a href="#">Camps biblique 2025</a></li>
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