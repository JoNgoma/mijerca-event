<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useServiceContext } from '@/composables/useServiceContext';

const router = useRouter();
const { currentService, currentServiceType } = useServiceContext();

const pageTitle = computed(() => {
  return `${currentService.value.name}`;
});

const paroisses = [
  "Saint Joseph", "Sainte Thérèse", "Saint Michel",
  "Notre-Dame de la Paix", "Saint François", "Saint Pierre",
  "Saint Antoine", "Sainte Famille", "Saint Jean-Baptiste",
  "Saint Augustin", "Saint Charles", "Saint Benoît",
  "Sainte Claire", "Saint Dominique", "Saint Luc"
];

const jeunes = ref([
  { nom: "Josué Ngoma", dortoir: 1, carrefour: 5, tel: "0812 345 678" },
  { nom: "Marie-Claire Tshibangu", dortoir: 2, carrefour: 3, tel: "0998 765 432" },
  { nom: "David Kasongo", dortoir: 3, carrefour: 8, tel: "0813 246 579" },
  { nom: "Joseph Ilunga", dortoir: 4, carrefour: 1, tel: "0997 654 321" },
  { nom: "Thérèse Mbala", dortoir: 5, carrefour: 12, tel: "0814 357 680" },
  { nom: "Gabriel Kayembe", dortoir: 6, carrefour: 7, tel: "0996 543 210" },
  { nom: "Michel Tshilombo", dortoir: 7, carrefour: 15, tel: "0815 468 279" },
  { nom: "Cécile Mulumba", dortoir: 8, carrefour: 2, tel: "0995 432 198" },
  { nom: "André Mbuyi", dortoir: 9, carrefour: 10, tel: "0816 579 234" },
  { nom: "Matthieu Kabeya", dortoir: 10, carrefour: 4, tel: "0994 321 087" },
  { nom: "Pierre Ngoy", dortoir: 1, carrefour: 9, tel: "0817 680 345" },
  { nom: "Bernadette Mputu", dortoir: 2, carrefour: 6, tel: "0993 210 654" },
  { nom: "Thomas Kazadi", dortoir: 3, carrefour: 11, tel: "0818 791 246" },
  { nom: "Jacques Beya", dortoir: 4, carrefour: 14, tel: "0992 109 876" },
  { nom: "Elisabeth Kabongo", dortoir: 5, carrefour: 13, tel: "0819 234 567" },
]);
const tbodySize = computed(() => jeunes.value.length);

const query = ref("");
const suggestions = ref([]);
const selectedParoisse = ref("");

// Filtrer les paroisses en fonction de la saisie
const filterParoisses = () => {
  if (query.value.trim() === "") {
    suggestions.value = [];
    return;
  }
  const q = query.value.toLowerCase();
  suggestions.value = paroisses.filter(p => p.toLowerCase().includes(q));
};

// Sélectionner une paroisse dans la liste
const selectParoisse = (name) => {
  selectedParoisse.value = name;
  query.value = name;
  suggestions.value = [];
};

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
              <li class="breadcrumb-item"><a href="#">Logistique</a></li>
              <li class="breadcrumb-item active">{{ pageTitle }}</li>
            </ol>
          </nav>
        </div>
        <div class="main-content container-fluid">
          <div class="row">
            <div class="col-lg-6">
              <div class="card card-border-color card-border-color-primary">
                <div class="card">
                  <div class="card-header">
                    <div class="container mt-4">
                      <h3 class="mb-3">Recherche de paroisse</h3>

                      <div class="form-group position-relative">
                        <input
                          id="inputParoisse"
                          type="text"
                          class="form-control"
                          v-model="query"
                          @input="filterParoisses"
                          placeholder="Tapez pour rechercher..."
                          autocomplete="off"
                        />

                        <!-- Liste des suggestions -->
                        <ul 
                          v-if="suggestions.length" 
                          class="list-group position-absolute w-100" 
                          style="z-index: 10; max-height: 15rem; overflow-y: auto;"
                        >
                          <li
                            v-for="(item, index) in suggestions"
                            :key="index"
                            class="list-group-item list-group-item-action"
                            @click="selectParoisse(item)"
                            style="cursor: pointer;"
                          >
                            {{ item }}
                          </li>
                        </ul>
                      </div>

                      <div v-if="selectedParoisse" class="mt-3">
                        Paroisse <strong> {{ selectedParoisse }} ( {{ tbodySize }} jeunes )</strong>
                      </div>
                    </div>
                  </div>
                  <div class="card-body">
                    <!-- Ajout du conteneur scrollable -->
                    <div style="max-height: 24rem; overflow-y: auto;">
                      <table class="table table-sm table-hover table-bordered table-striped">
                        <thead>
                          <tr>
                            <th>Noms complet</th>
                            <th>Dortoir</th>
                            <th>Carrefour</th>
                            <th>Numéro tél</th>
                            
                          </tr>
                        </thead>
                        <tbody>
                          <tr v-for="(row, index) in jeunes" :key="index">
                            <td>{{ row.nom }}</td>
                            <td>{{ row.dortoir }}</td>
                            <td>{{ row.carrefour }}</td>
                            <td>{{ row.tel }}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                    <!-- fin conteneur scrollable -->
                  </div>
                </div>
              </div>
            </div>

            <div class="col-lg-6">
              <div class="card card-border-color card-border-color-primary">
                <div class="card">
                  <div class="card-header">
                    Responsable
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
                    <!-- Ajout du conteneur scrollable -->
                    <div style="max-height: 34rem; overflow-y: auto;">
                      <table class="table table-sm table-hover table-bordered table-striped">
                        <thead>
                          <tr>
                            <th>Noms complet</th>
                            <th>Dortoir</th>
                            <th>Carrefour</th>
                            <th>Numéro tél</th>
                            
                          </tr>
                        </thead>
                        <tbody>
                          <tr><td>Josué Ngoma</td><td>1</td><td>5</td><td>0812 345 678</td></tr>
                          <tr><td>Thérèse Mbala</td><td>5</td><td>12</td><td>0814 357 680</td></tr>
                          <tr><td>Cécile Mulumba</td><td>8</td><td>2</td><td>0995 432 198</td></tr>
                          <tr><td>Jacques Beya</td><td>4</td><td>14</td><td>0992 109 876</td></tr>
                          <tr><td>Elisabeth Kabongo</td><td>5</td><td>13</td><td>0819 234 567</td></tr>
                        </tbody>
                      </table>
                    </div>
                    <!-- fin conteneur scrollable -->
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
</template>

<style scoped>
/* Styliser la liste des suggestions */
.list-group-item:hover {
  background-color: #f0f0f0;
}
</style>