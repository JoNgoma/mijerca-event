<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useServiceContext } from '@/composables/useServiceContext'

const router = useRouter()
const { currentService, currentServiceType } = useServiceContext()

const pageTitle = computed(() => `${currentService.value.name}`)
const descrip = computed(() => currentService.value.description)

// Données du tableau (exemple, garde tes valeurs si besoin)
const rows = ref([
  { numero: 1,  nom: 'Emmanuel',        chef: 'Frère Jean-Paul',   effectif: 13 },
  { numero: 2,  nom: 'Pentecôte',       chef: 'Sœur Marie-Claire', effectif: 17 },
  { numero: 3,  nom: 'Résurrection',    chef: 'Frère David',       effectif: 14 },
  { numero: 4,  nom: 'Miséricorde',     chef: 'Frère Joseph',      effectif: 15 },
  { numero: 5,  nom: 'Alléluia',        chef: 'Sœur Thérèse',      effectif: 16 },
  { numero: 6,  nom: 'Saint-Esprit',    chef: 'Frère Gabriel',     effectif: 14 },
  { numero: 7,  nom: 'Abba Père',       chef: 'Frère Michel',      effectif: 18 },
  { numero: 8,  nom: 'Hosanna',         chef: 'Sœur Cécile',       effectif: 12 },
  { numero: 9,  nom: 'Immaculée',       chef: 'Frère André',       effectif: 17 },
  { numero: 10, nom: 'Foi Vive',        chef: 'Frère Matthieu',    effectif: 16 },
  { numero: 11, nom: 'Christ Roi',      chef: 'Frère Pierre',      effectif: 13 },
  { numero: 12, nom: 'Maranatha',       chef: 'Sœur Bernadette',   effectif: 18 },
  { numero: 13, nom: 'Trinité',         chef: 'Frère Thomas',      effectif: 15 },
  { numero: 14, nom: 'Vie Nouvelle',    chef: 'Frère Jacques',     effectif: 12 },
  { numero: 15, nom: 'Saints Apôtres',  chef: 'Sœur Elisabeth',    effectif: 17 },
])


// Élément sélectionné
const selected = ref(null)
const selectRow = (row) => {
  selected.value = row
}

// Si tu dois absolument initialiser ton thème jQuery, fais-le après montage :
onMounted(() => {
  if (window.App) {
    try {
      window.App.init?.()
      window.App.formMultiselect?.()
      window.App.masks?.()
    } catch (_) { /* ignore */ }
  }
})
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
        <!-- Tableau -->
        <div class="col-lg-6">
          <div class="card card-border-color card-border-color-primary">
            <div class="card">
              <div class="card-header">
                {{ pageTitle }}
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
                <div style="max-height: 34rem; overflow-y: auto;">
                  <table class="table table-sm table-hover table-bordered table-striped">
                    <thead>
                      <tr>
                        <th>Numéro</th>
                        <th>Nom du carrefour</th>
                        <th>Chef de carrefour</th>
                        <th>Effectif</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr
                        v-for="row in rows"
                        :key="row.numero"
                        @click="selectRow(row)"
                        :class="{'table-active': selected && selected.numero === row.numero}"
                        style="cursor: pointer;"
                      >
                        <td>{{ row.numero }}</td>
                        <td>{{ row.nom }}</td>
                        <td>{{ row.chef }}</td>
                        <td class="number">{{ row.effectif }}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          </div>
        </div>

        <!-- Détails -->
        <div class="col-lg-6">
          <div class="card card-border-color card-border-color-primary">
            <div class="card">
              <div class="card-body" id="detailCard">
                <template v-if="selected">
                  <div class="card-header">Carrefour {{ selected.numero }}</div>
                  <div class="form-group">
                      <label for="inputActiviteLieu">Nom du carrefour</label>
                      <input class="form-control" id="inputActiviteLieu" type="text" placeholder="Donner un nom" v-model="selected.nom">
                    </div>
                    <div class="form-group">
                      <label class="">Chef du carrefour</label>
                        <select class="form-control">
                          <option value="Josué Ngoma">Josué Ngoma</option>
                          <option value="Divine Kangala">Divine Kangala</option>
                          <option :value="selected.chef" selected>{{selected.chef}}</option>
                          <option value="Grady Mbele">Grady Mbele</option>
                          <option value="John Malumba">John Malumba</option>
                          <option value="Chadrack Akasa">Chadrack Akasa</option>
                        </select>
                    </div>
                  <div class="form-group">
                      <label class=""><strong>Effectif :</strong> {{ selected.effectif }}</label>
                      <div>
                        <select class="form-control" multiple="">
                          <option value="Josué Ngoma">Josué Ngoma</option>
                          <option value="Divine Kangala">Divine Kangala</option>
                          <option :value="selected.chef" selected>{{selected.chef}}</option>
                          <option value="Grady Mbele">Grady Mbele</option>
                          <option value="John Malumba">John Malumba</option>
                          <option value="Chadrack Akasa">Chadrack Akasa</option>
                        </select>
                      </div>
                    </div>
                    <div class="row pt-7">
                      <div class="col-12 d-flex justify-content-end">
                        <button class="btn btn-secondary mr-4" @click="selected = null">Retour</button>
                        <button class="btn btn-primary" type="submit">Modifier</button>
                      </div>
                    </div>
                </template>
                <template v-else>
              <div class="card-header">Détails du carrefour</div>
                  <p><em>Clique sur un carrefour pour voir les détails ici.</em></p>
                </template>
              </div>
            </div>
          </div>
        </div>

      </div> <!-- /row -->
    </div> <!-- /main-content -->
  </div> <!-- /be-content -->
</template>

<style scoped>
/* Améliore la lisibilité de la ligne sélectionnée */
.table-active > td {
  font-weight: 600;
}
</style>
