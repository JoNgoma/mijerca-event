<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useServiceContext } from '@/composables/useServiceContext';

const router = useRouter();
const { currentService, currentServiceType } = useServiceContext();

const pageTitle = computed(() => {
  return `Statistique - ${currentService.value.name}`;
});

const breadcrumbService = computed(() => {
  return currentService.value.name;
});

$(document).ready(function(){
  //-initialize the javascript
  App.init();
  App.dataTables();
});
</script>

<template>
  <div class="be-content">
    <div class="page-head">
      <h2 class="page-head-title">{{ pageTitle }}</h2>
      <nav aria-label="breadcrumb" role="navigation">
        <ol class="breadcrumb page-head-nav">
          <li class="breadcrumb-item">
            <router-link :to="{ name: 'dashboard' }">Dashboard</router-link>
          </li>
          <li class="breadcrumb-item">
            <a href="#">{{ breadcrumbService }}</a>
          </li>
          <li class="breadcrumb-item active">Statistique</li>
        </ol>
      </nav>
    </div>
    <div class="main-content container-fluid">
      <div class="row">
        <div class="col-sm-12">
          <div class="card card-table">
            <div class="card-header">
              {{ currentService.name }}
              <div class="tools dropdown">
                <span class="icon mdi mdi-download"></span>
                <a class="dropdown-toggle" href="#" role="button" data-toggle="dropdown">
                  <span class="icon mdi mdi-more-vert"></span>
                </a>
                <div class="dropdown-menu" role="menu">
                  <a class="dropdown-item" href="#">Action</a>
                  <a class="dropdown-item" href="#">Another action</a>
                  <a class="dropdown-item" href="#">Something else here</a>
                  <div class="dropdown-divider"></div>
                  <a class="dropdown-item" href="#">Separated link</a>
                </div>
              </div>
            </div>
            <div class="card-body">
              <table class="table table-striped table-hover table-fw-widget" id="table1">
                <thead>
                  <tr>
                    <th>Numéro de contact</th>
                    <th>Noms</th>
                    <th>Paroisse</th>
                    <th>Service</th>
                    <th>Genre</th>
                  </tr>
                </thead>
                <tbody>
                  <!-- ... existing code ... -->
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>