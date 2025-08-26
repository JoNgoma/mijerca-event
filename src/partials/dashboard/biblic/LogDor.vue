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
                    Dortoir Frère
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
                            <th>Dortoir</th>
                            <th>J1</th>
                            <th>J2</th>
                            <th>J3</th>
                            <th>J4</th>
                            <th>J5</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr><td>1</td><td>15</td><td>17</td><td>13</td><td>18</td><td>16</td></tr>
                          <tr><td>2</td><td>12</td><td>14</td><td>17</td><td>15</td><td>18</td></tr>
                          <tr><td>3</td><td>16</td><td>18</td><td>14</td><td>13</td><td>17</td></tr>
                          <tr><td>4</td><td>13</td><td>16</td><td>15</td><td>17</td><td>12</td></tr>
                          <tr><td>5</td><td>14</td><td>18</td><td>16</td><td>15</td><td>13</td></tr>
                          <tr><td>6</td><td>18</td><td>17</td><td>14</td><td>12</td><td>16</td></tr>
                          <tr><td>7</td><td>15</td><td>13</td><td>18</td><td>14</td><td>17</td></tr>
                          <tr><td>8</td><td>17</td><td>16</td><td>12</td><td>15</td><td>18</td></tr>
                          <tr><td>9</td><td>12</td><td>15</td><td>17</td><td>18</td><td>14</td></tr>
                          <tr><td>10</td><td>13</td><td>14</td><td>16</td><td>12</td><td>15</td></tr>
                          <tr><td>11</td><td>18</td><td>15</td><td>13</td><td>16</td><td>17</td></tr>
                          <tr><td>12</td><td>14</td><td>12</td><td>18</td><td>17</td><td>15</td></tr>
                          <tr><td>13</td><td>16</td><td>13</td><td>15</td><td>14</td><td>12</td></tr>
                          <tr><td>14</td><td>17</td><td>18</td><td>12</td><td>16</td><td>13</td></tr>
                          <tr><td>15</td><td>15</td><td>14</td><td>17</td><td>18</td><td>16</td></tr>
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
                    Dortoir Soeur
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
                            <th>Dortoir</th>
                            <th>J1</th>
                            <th>J2</th>
                            <th>J3</th>
                            <th>J4</th>
                            <th>J5</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr><td>1</td><td>15</td><td>17</td><td>13</td><td>18</td><td>16</td></tr>
                          <tr><td>2</td><td>12</td><td>14</td><td>17</td><td>15</td><td>18</td></tr>
                          <tr><td>3</td><td>16</td><td>18</td><td>14</td><td>13</td><td>17</td></tr>
                          <tr><td>4</td><td>13</td><td>16</td><td>15</td><td>17</td><td>12</td></tr>
                          <tr><td>5</td><td>14</td><td>18</td><td>16</td><td>15</td><td>13</td></tr>
                          <tr><td>6</td><td>18</td><td>17</td><td>14</td><td>12</td><td>16</td></tr>
                          <tr><td>7</td><td>15</td><td>13</td><td>18</td><td>14</td><td>17</td></tr>
                          <tr><td>8</td><td>17</td><td>16</td><td>12</td><td>15</td><td>18</td></tr>
                          <tr><td>9</td><td>12</td><td>15</td><td>17</td><td>18</td><td>14</td></tr>
                          <tr><td>10</td><td>13</td><td>14</td><td>16</td><td>12</td><td>15</td></tr>
                          <tr><td>11</td><td>18</td><td>15</td><td>13</td><td>16</td><td>17</td></tr>
                          <tr><td>12</td><td>14</td><td>12</td><td>18</td><td>17</td><td>15</td></tr>
                          <tr><td>13</td><td>16</td><td>13</td><td>15</td><td>14</td><td>12</td></tr>
                          <tr><td>14</td><td>17</td><td>18</td><td>12</td><td>16</td><td>13</td></tr>
                          <tr><td>15</td><td>15</td><td>14</td><td>17</td><td>18</td><td>16</td></tr>
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

</style>