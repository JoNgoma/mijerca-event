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
      	App.dataTables();
      });
      
</script>

<template>
    <div class="be-content">
        <div class="main-content container-fluid">
          <div class="row">
            <div class="col-sm-12">
              <div class="card card-table">
                <div class="card-header">{{ descr }}
                  <div class="tools dropdown"><span class="icon mdi mdi-download"></span><a class="dropdown-toggle" href="#" role="button" data-toggle="dropdown"><span class="icon mdi mdi-more-vert"></span></a>
                    <div class="dropdown-menu" role="menu"><a class="dropdown-item" href="#">Action</a><a class="dropdown-item" href="#">Another action</a><a class="dropdown-item" href="#">Something else here</a>
                      <div class="dropdown-divider"></div><a class="dropdown-item" href="#">Separated link</a>
                    </div>
                  </div>
                </div>
                <div class="card-body">
                    <div style="max-height: 44.9rem; overflow-y: auto;">
                        <table class="table table-striped table-hover table-fw-widget" id="tableSect">
                            <thead>
                                <tr>
                                <th>Doyennés</th>
                                <th>Paroisses</th>
                                <th>Effectif</th>
                                </tr>
                            </thead>
                            <tbody>
                                <!-- LIMETE -->
                                <tr>
                                <td rowspan="4" class="align-middle fw-bold bg-light">Doyenné de Limete</td>
                                <td>Paroisse Saint Alphonse</td>
                                <td>120</td>
                                </tr>
                                <tr>
                                <td>Paroisse Saint Pierre Claver</td>
                                <td>95</td>
                                </tr>
                                <tr>
                                <td>Paroisse Sacré-Cœur</td>
                                <td>130</td>
                                </tr>
                                <tr class="table-info fw-bold">
                                <td class="text-center">
                                    <span class="badge bg-info text-dark">3 Paroisses</span>
                                </td>
                                <td><span class="badge bg-success">345</span></td>
                                </tr>

                                <!-- LEMBA -->
                                <tr>
                                <td rowspan="4" class="align-middle fw-bold bg-light">Doyenné de Lemba</td>
                                <td>Paroisse Saint Raphaël</td>
                                <td>105</td>
                                </tr>
                                <tr>
                                <td>Paroisse Saint Camille</td>
                                <td>87</td>
                                </tr>
                                <tr>
                                <td>Paroisse Saint Dominique</td>
                                <td>112</td>
                                </tr>
                                <tr class="table-info fw-bold">
                                <td class="text-center">
                                    <span class="badge bg-info text-dark">3 Paroisses</span>
                                </td>
                                <td><span class="badge bg-success">304</span></td>
                                </tr>

                                <!-- NGABA -->
                                <tr>
                                <td rowspan="4" class="align-middle fw-bold bg-light">Doyenné de Ngaba</td>
                                <td>Paroisse Saint François Xavier</td>
                                <td>98</td>
                                </tr>
                                <tr>
                                <td>Paroisse Saint Augustin</td>
                                <td>124</td>
                                </tr>
                                <tr>
                                <td>Paroisse Saint Charles Lwanga</td>
                                <td>110</td>
                                </tr>
                                <tr class="table-info fw-bold">
                                <td class="text-center">
                                    <span class="badge bg-info text-dark">3 Paroisses</span>
                                </td>
                                <td><span class="badge bg-success">332</span></td>
                                </tr>

                                <!-- KALAMU -->
                                <tr>
                                <td rowspan="4" class="align-middle fw-bold bg-light">Doyenné de Kalamu</td>
                                <td>Paroisse Sainte Anne</td>
                                <td>132</td>
                                </tr>
                                <tr>
                                <td>Paroisse Saint Joseph</td>
                                <td>118</td>
                                </tr>
                                <tr>
                                <td>Paroisse Saint Benoît</td>
                                <td>102</td>
                                </tr>
                                <tr class="table-info fw-bold">
                                <td class="text-center">
                                    <span class="badge bg-info text-dark">3 Paroisses</span>
                                </td>
                                <td><span class="badge bg-success">352</span></td>
                                </tr>

                                <!-- MASINA -->
                                <tr>
                                <td rowspan="4" class="align-middle fw-bold bg-light">Doyenné de Masina</td>
                                <td>Paroisse Notre-Dame du Rosaire</td>
                                <td>140</td>
                                </tr>
                                <tr>
                                <td>Paroisse Saint Esprit</td>
                                <td>125</td>
                                </tr>
                                <tr>
                                <td>Paroisse Saint Michel</td>
                                <td>115</td>
                                </tr>
                                <tr class="table-info fw-bold">
                                <td class="text-center">
                                    <span class="badge bg-info text-dark">3 Paroisses</span>
                                </td>
                                <td><span class="badge bg-success">380</span></td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
</template>

<style>
  /* Rend l'en-tête fixe */
  #tableSect thead th {
    position: sticky;
    top: 0;
    z-index: 2;
    background: #fff;
    box-shadow: 0 3px 6px rgba(0, 0, 0, 0.15);
  }
</style>