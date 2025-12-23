<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useServiceContext } from '@/composables/useServiceContext';
import { useToast } from 'vue-toastification';

const router = useRouter();
const route = useRoute();
const { currentService, currentServiceType } = useServiceContext();
const toast = useToast();

const date = ref(new Date().toISOString().split('T')[0]);
const time = ref('12:00');
const devise = ref('USD');
const montant = ref('');
const motif = ref('');
const isLoading = ref(false);
const errorMessage = ref('');
const campBiblic = ref({ name: '' });
const showConfirmationModal = ref(false);
const confirmationMessage = ref('');
const requireConfirmation = ref(false);

// Références pour les données financières
const montants = ref([]);
const budgetTotal = ref({ USD: 0, CDF: 0 });
const depensesTotal = ref({ USD: 0, CDF: 0 });
const soldeBudget = ref({ USD: 0, CDF: 0 });

const activityId = computed(() => {
  return route.params.id_campBiblique || route.params.id || route.query.activityId;
});

const pageTitle = computed(() => {
  return `${currentService.value?.name || 'Activité'}`;
});

const formattedMontant = computed(() => {
  if (!montant.value) return '';
  const amount = parseFloat(montant.value);
  return devise.value === 'CDF' ? `${amount.toLocaleString()} Fc` : `$${amount.toFixed(2)}`;
});

const fullDateTime = computed(() => {
  if (!date.value) return new Date().toISOString();
  const timePart = time.value || '12:00';
  const dateTimeString = `${date.value}T${timePart}:00`;
  return new Date(dateTimeString).toISOString();
});

// === FONCTION PAGINATION OPTIMISÉE ===
async function fetchAllPages(baseUrl) {
  let allItems = [];
  let currentPage = 1;
  let hasMore = true;
  
  try {
    while (hasMore) {
      const url = `${baseUrl}${baseUrl.includes('?') ? '&' : '?'}page=${currentPage}`;
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Erreur HTTP ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data['member'] && Array.isArray(data['member'])) {
        allItems = [...allItems, ...data['member']];
        
        // Conditions d'arrêt
        if (data['member'].length === 0 || 
            data['member'].length < 30 ||
            currentPage >= 50) {
          hasMore = false;
        } else {
          currentPage++;
        }
      } else {
        hasMore = false;
      }
    }
    
    return allItems;
  } catch (error) {
    toast.error(`Erreur lors de la récupération paginée: ${error.message}`);
    throw error;
  }
}

// Calculer les totaux à partir des montants
function calculerTotaux() {
  budgetTotal.value = { USD: 0, CDF: 0 };
  depensesTotal.value = { USD: 0, CDF: 0 };
  soldeBudget.value = { USD: 0, CDF: 0 };

  const montantsDuCamp = montants.value.filter(montant => {
    if (!montant.campBiblic || !Array.isArray(montant.campBiblic)) {
      return false;
    }
    
    return montant.campBiblic.some(cb => {
      if (!cb) return false;
      const cbId = cb.split('/').pop();
      return cbId === activityId.value;
    });
  });

  montantsDuCamp.forEach(m => {
    const deviseMontant = m.devise === '$' ? 'USD' : 'CDF';
    const frais = m.frais || 0;
    
    if (m.status === 'Access CB') {
      budgetTotal.value[deviseMontant] += frais;
    } else if (m.status === 'OK') {
      depensesTotal.value[deviseMontant] += frais;
    }
  });

  soldeBudget.value.USD = budgetTotal.value.USD - depensesTotal.value.USD;
  soldeBudget.value.CDF = budgetTotal.value.CDF - depensesTotal.value.CDF;
}

// Formater les montants pour l'affichage
const budgetTotalFormatted = computed(() => {
  return {
    USD: `$${budgetTotal.value.USD.toLocaleString()}`,
    CDF: `${budgetTotal.value.CDF.toLocaleString()} Fc`
  };
});

const depensesTotalFormatted = computed(() => {
  return {
    USD: `$${depensesTotal.value.USD.toLocaleString()}`,
    CDF: `${depensesTotal.value.CDF.toLocaleString()} Fc`
  };
});

const soldeBudgetFormatted = computed(() => {
  return {
    USD: `$${soldeBudget.value.USD.toLocaleString()}`,
    CDF: `${soldeBudget.value.CDF.toLocaleString()} Fc`
  };
});

// Vérifier si le montant dépasse le solde
const montantDepasseSolde = computed(() => {
  if (!montant.value) return false;
  const montantSaisi = parseFloat(montant.value);
  const deviseMontant = devise.value === 'USD' ? 'USD' : 'CDF';
  return montantSaisi > soldeBudget.value[deviseMontant];
});

async function submitDepense() {
  if (!validateForm()) return;
  
  const montantSaisi = parseFloat(montant.value);
  const deviseMontant = devise.value === 'USD' ? 'USD' : 'CDF';
  
  if (montantSaisi > soldeBudget.value[deviseMontant]) {
    confirmationMessage.value = `Cette dépense de ${formattedMontant.value} dépasse le solde actuel de ${soldeBudgetFormatted.value[deviseMontant]}. Voulez-vous quand même enregistrer cette dépense ?`;
    showConfirmationModal.value = true;
    requireConfirmation.value = true;
    return;
  }
  
  await enregistrerDepense();
}

async function enregistrerDepense() {
  isLoading.value = true;
  errorMessage.value = '';
  
  try {
    const campBiblicUrl = `/api/camp_bibliques/${activityId.value}`;
    
    const montantData = {
      campBiblic: [campBiblicUrl],
      devise: devise.value === 'CDF' ? 'Fc' : '$',
      frais: parseFloat(montant.value),
      status: "OK",
      createdAt: fullDateTime.value
    };
    
    const montantResponse = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api'}/montants`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/ld+json',
        'Accept': 'application/ld+json',
      },
      body: JSON.stringify(montantData)
    });
    
    if (!montantResponse.ok) {
      const errorText = await montantResponse.text();
      throw new Error(`Erreur création montant: ${montantResponse.statusText}`);
    }
    
    const montantResult = await montantResponse.json();
    
    await createDepense(montantResult['@id'], campBiblicUrl);
    
  } catch (error) {
    toast.error(`Erreur lors de l'enregistrement: ${error.message}`);
    errorMessage.value = error.message;
  } finally {
    isLoading.value = false;
    showConfirmationModal.value = false;
    requireConfirmation.value = false;
  }
}

async function createDepense(montantIri, campBiblicUrl) {
  const depenseData = {
    campBiblic: campBiblicUrl,
    motif: motif.value,
    montant: montantIri,
    createdAt: fullDateTime.value
  };
  
  const depenseResponse = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api'}/costs`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/ld+json',
      'Accept': 'application/ld+json',
    },
    body: JSON.stringify(depenseData)
  });
  
  if (!depenseResponse.ok) {
    const errorText = await depenseResponse.text();
    
    await fetch(montantIri, {
      method: 'DELETE'
    });
    
    throw new Error(`Erreur création dépense: ${depenseResponse.statusText}`);
  }
  
  const depenseResult = await depenseResponse.json();
  
  handleSuccess();
}

function handleSuccess() {
  loadMontants();
  resetForm();
  toast.success('Dépense enregistrée avec succès !');
}

function confirmDepense() {
  showConfirmationModal.value = false;
  requireConfirmation.value = false;
  enregistrerDepense();
}

function cancelDepense() {
  showConfirmationModal.value = false;
  requireConfirmation.value = false;
  toast.info('Dépense annulée. Vous pouvez modifier le montant.');
}

function validateForm() {
  if (!activityId.value) {
    errorMessage.value = 'Aucune activité sélectionnée';
    toast.error('Aucune activité sélectionnée');
    return false;
  }
  
  if (!date.value) {
    errorMessage.value = 'Veuillez sélectionner une date';
    toast.error('Veuillez sélectionner une date');
    return false;
  }
  
  if (!montant.value || parseFloat(montant.value) <= 0) {
    errorMessage.value = 'Veuillez entrer un montant valide';
    toast.error('Veuillez entrer un montant valide');
    return false;
  }
  
  if (!motif.value.trim()) {
    errorMessage.value = 'Veuillez entrer un motif';
    toast.error('Veuillez entrer un motif');
    return false;
  }
  
  return true;
}

function resetForm() {
  montant.value = '';
  motif.value = '';
  devise.value = 'USD';
  
  const now = new Date();
  date.value = now.toISOString().split('T')[0];
  time.value = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
  
  errorMessage.value = '';
}

function goBack() {
  router.go(-1);
}

function handleSimpleDateChange(event) {
  date.value = event.target.value;
}

function handleSimpleTimeChange(event) {
  time.value = event.target.value;
}

function validateMontant() {
  if (montant.value && parseFloat(montant.value) < 0) {
    montant.value = '';
  }
}

// Charger les montants depuis l'API AVEC PAGINATION
async function loadMontants() {
  if (!activityId.value) return;
  
  try {
    const baseUrl = `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api'}/montants?campBiblic[]=/api/camp_bibliques/${activityId.value}`;
    
    montants.value = await fetchAllPages(baseUrl);
    calculerTotaux();
    
  } catch (error) {
    toast.error('Erreur lors du chargement des montants');
    try {
      const baseUrl = `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api'}/montants`;
      montants.value = await fetchAllPages(baseUrl);
      calculerTotaux();
    } catch (secondError) {
      toast.error('Impossible de charger les données financières');
    }
  }
}

onMounted(() => {
  $(document).ready(function(){
    App.init();
    App.formElements();
  });
  
  loadCampDetails();
  loadMontants();
});

async function loadCampDetails() {
  if (!activityId.value) return;
  
  try {
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api'}/camp_bibliques/${activityId.value}`);
    if (response.ok) {
      const data = await response.json();
      campBiblic.value = data;
    }
  } catch (error) {
    toast.error('Erreur lors du chargement des détails de l\'activité');
  }
}

watch(activityId, () => {
  if (activityId.value) {
    loadCampDetails();
    loadMontants();
  }
});

</script>

<template>
  <div class="be-content">
    <div class="page-head">
      <h2 class="page-head-title">{{ pageTitle }}</h2>
      <nav aria-label="breadcrumb" role="navigation">
        <ol class="breadcrumb page-head-nav">
          <li class="breadcrumb-item"><router-link :to="{ name: 'dashboard' }">Dashboard</router-link></li>
          <li class="breadcrumb-item"><a href="#">Finances</a></li>
          <li class="breadcrumb-item active">{{ pageTitle }}</li>
        </ol>
      </nav>
    </div>
    
    <div class="main-content container-fluid">
      <!-- Modal de confirmation -->
      <div v-if="showConfirmationModal" class="modal fade show d-block" tabindex="-1" role="dialog" style="background-color: rgba(0,0,0,0.5); z-index: 9999;">
        <div class="modal-dialog modal-dialog-centered" role="document">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title text-warning">
                <i class="mdi mdi-alert-circle mr-2"></i>
                Attention : Dépense au-dessus du budget
              </h5>
              <button type="button" class="close" @click="cancelDepense">
                <span aria-hidden="true">&times;</span>
              </button>
            </div>
            <div class="modal-body">
              <p>{{ confirmationMessage }}</p>
              <p class="text-muted">
                <small>
                  <i class="mdi mdi-info mr-1"></i>
                  Cette dépense sera prélevée dans une autre poche financière.
                </small>
              </p>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" @click="cancelDepense">
                <i class="mdi mdi-close mr-1"></i>
                Annuler
              </button>
              <button type="button" class="btn btn-primary" @click="confirmDepense">
                <i class="mdi mdi-check mr-1"></i>
                Approuver et enregistrer
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <form @submit.prevent="submitDepense" class="row">
        <div class="col-lg-6">
          <!-- Carte des informations budgétaires -->
          <div class="card card-border-color card-border-color-info mb-3">
            <div class="card-header">
              <h6 class="mb-0 px-2">
                <i class="mdi mdi-balance mr-1"></i>
                État du Budget
              </h6>
            </div>
            <div class="card-body">
              <div class="row">
                <div class="col-md-6">
                  <div class="mb-3 pl-2">
                    <h6 class="text-primary">Dollars USD ($)</h6>
                    <p class="mb-1">
                      <small class="text-muted">Budget Total:</small>
                      <span class="fw-bold float-right">{{ budgetTotalFormatted.USD }}</span>
                    </p>
                    <p class="mb-1">
                      <small class="text-muted">Dépenses Total:</small>
                      <span class="fw-bold float-right">{{ depensesTotalFormatted.USD }}</span>
                    </p>
                    <p class="mb-0">
                      <small class="text-muted">Solde:</small>
                      <span 
                        :class="{
                          'fw-bold float-right': true,
                          'text-success': soldeBudget.USD >= 0,
                          'text-danger': soldeBudget.USD < 0
                        }"
                      >
                        {{ soldeBudgetFormatted.USD }}
                      </span>
                    </p>
                  </div>
                </div>
                <div class="col-md-6">
                  <div class="mb-3 pr-2">
                    <h6 class="text-primary">Francs Congolais (Fc)</h6>
                    <p class="mb-1">
                      <small class="text-muted">Budget Total:</small>
                      <span class="fw-bold float-right">{{ budgetTotalFormatted.CDF }}</span>
                    </p>
                    <p class="mb-1">
                      <small class="text-muted">Dépenses Total:</small>
                      <span class="fw-bold float-right">{{ depensesTotalFormatted.CDF }}</span>
                    </p>
                    <p class="mb-0">
                      <small class="text-muted">Solde:</small>
                      <span 
                        :class="{
                          'fw-bold float-right': true,
                          'text-success': soldeBudget.CDF >= 0,
                          'text-danger': soldeBudget.CDF < 0
                        }"
                      >
                        {{ soldeBudgetFormatted.CDF }}
                      </span>
                    </p>
                  </div>
                </div>
              </div>
              
              <!-- Avertissement si la dépense dépasse le solde -->
              <div v-if="montant && montantDepasseSolde" class="px-2 alert alert-warning alert-dismissible fade show mt-3" role="alert">
                <i class="mdi mdi-alert-circle mr-1"></i>
                Cette dépense dépasse le solde actuel, Votre solde est de {{ devise === 'USD' ? soldeBudgetFormatted.USD : soldeBudgetFormatted.CDF }}.
                <br>
                <small>Si vous continuez, la dépense sera prélevée dans une autre poche financière.</small>
              </div>
            </div>
          </div>
          
          <!-- Carte du formulaire de dépense -->
          <div class="card card-border-color card-border-color-primary">
            <div class="card-body">
              <div class="form-group pt-2">
                <label>Sélectionner la date et l'heure</label>
                <div class="row">
                  <div class="col-md-6">
                    <label for="simpleDateInput">Date</label>
                    <input 
                      id="simpleDateInput"
                      type="date" 
                      class="form-control" 
                      :value="date"
                      @change="handleSimpleDateChange"
                    >
                  </div>
                  <div class="col-md-6">
                    <label for="simpleTimeInput">Heure</label>
                    <input 
                      id="simpleTimeInput"
                      type="time" 
                      class="form-control" 
                      :value="time"
                      @change="handleSimpleTimeChange"
                    >
                  </div>
                </div>
              </div>
              
              <div class="form-group row pt-3">
                <label class="col-12 col-sm-3 col-form-label text-sm-right pt-4">Devise</label>
                <div class="col-12 col-sm-8 col-lg-6">
                  <div class="form-check form-check-inline">
                    <label class="custom-control custom-radio custom-radio-icon custom-control-inline">
                      <input 
                        v-model="devise" 
                        value="USD" 
                        class="custom-control-input" 
                        id="radioIconDollars" 
                        type="radio" 
                        name="devise"
                        :disabled="isLoading"
                      >
                      <span class="custom-control-label" style="display: flex; justify-content: center; align-items: center;">
                        <span style="font-weight: bold; font-size: 2.1rem;">$</span>
                      </span>
                    </label>
                    <label class="custom-control custom-radio custom-radio-icon custom-control-inline">
                      <input 
                        v-model="devise" 
                        value="CDF" 
                        class="custom-control-input" 
                        id="radioIconM" 
                        type="radio" 
                        name="devise"
                        :disabled="isLoading"
                      >
                      <span class="custom-control-label" style="display: flex; justify-content: center; align-items: center;">
                        <span style="font-weight: bold; font-size: 2.1rem;">Fc</span>
                      </span>
                    </label>
                  </div>
                </div>
              </div>
              
              <div class="form-group pt-2">
                <label>Entrer le montant</label>
                <div class="input-group mb-3">
                  <input 
                    v-model="montant"
                    type="number" 
                    min="0" 
                    step="0.01" 
                    placeholder="0.00" 
                    class="form-control"
                    @input="validateMontant"
                    :disabled="isLoading"
                  >
                  <div class="input-group-append">
                    <span class="input-group-text">
                      {{ devise === 'CDF' ? 'Fc' : '$' }}
                    </span>
                  </div>
                </div>
                <small v-if="montant" class="form-text text-primary">
                  Montant : {{ formattedMontant }}
                </small>
              </div>
            </div>
          </div>
        </div>

        <div class="col-lg-6">
          <div class="card card-border-color card-border-color-primary">
            <div class="card-body">
              <div class="form-group pt-2">
                <label>Entrer le motif de la dépense</label>
                <textarea 
                  v-model="motif"
                  rows="5" 
                  class="form-control" 
                  id="inputDepMotif" 
                  placeholder="Décrivez le motif de cette dépense..."
                  required
                  maxlength="500"
                  :disabled="isLoading"
                ></textarea>
                <small class="form-text text-muted">
                  {{ motif.length }}/500 caractères
                </small>
              </div>
              
              <div class="row pt-4">
                <div class="col-12 d-flex justify-content-end flex-wrap gap-2">
                  <button 
                    type="button" 
                    class="btn btn-secondary mr-2" 
                    @click="goBack"
                    :disabled="isLoading"
                  >
                    Retour
                  </button>
                  <button 
                    type="button" 
                    class="btn btn-outline-primary mr-2" 
                    @click="resetForm"
                    :disabled="isLoading"
                  >
                    Réinitialiser
                  </button>
                  <button 
                    type="submit" 
                    class="btn btn-primary" 
                    :disabled="isLoading || requireConfirmation"
                  >
                    <span v-if="isLoading">
                      <span class="spinner-border spinner-border-sm mr-2" role="status"></span>
                      Enregistrement...
                    </span>
                    <span v-else>
                      Enregistrer la dépense
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Récapitulatif -->
          <div class="card card-border-color card-border-color-success mt-3">
            <div class="card-header">
              <h6 class="mb-0">
                <i class="mdi mdi-file-document-box mr-2"></i>
                Récapitulatif
              </h6>
            </div>
            <div class="card-body">
              <div class="row">
                <div class="col-6">
                  <p class="mb-1"><small class="text-muted">Montant</small></p>
                  <p class="fw-semibold text-primary" v-if="montant">
                    {{ formattedMontant }}
                  </p>
                  <p class="text-muted" v-else>Non spécifié</p>
                </div>
                <div class="col-6">
                  <p class="mb-1"><small class="text-muted">Devise</small></p>
                  <p class="fw-semibold">{{ devise === 'CDF' ? 'Francs Congolais (Fc)' : 'Dollars USD ($)' }}</p>
                </div>
                <div class="col-12 mt-2">
                  <p class="mb-1"><small class="text-muted">Activité</small></p>
                  <p class="fw-semibold" v-if="campBiblic.name">
                    {{ campBiblic.name }}
                  </p>
                  <p class="text-danger" v-else>
                    <i class="mdi mdi-alert-circle mr-1"></i>
                    Aucune activité
                  </p>
                </div>
                <div class="col-12 mt-2">
                  <p class="mb-1"><small class="text-muted">Motif</small></p>
                  <p class="fw-semibold" v-if="motif">{{ motif }}</p>
                  <p class="text-muted" v-else>Non spécifié</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>
.card {
  border-radius: 10px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}

.card-header {
  background-color: #f8f9fa;
  border-bottom: 1px solid rgba(0,0,0,.125);
  border-radius: 10px 10px 0 0 !important;
}

.form-control:focus {
  border-color: #0d6efd;
  box-shadow: 0 0 0 0.2rem rgba(13, 110, 253, 0.25);
}

.input-group-text {
  background-color: #f8f9fa;
  border-color: #ced4da;
}

@media (max-width: 768px) {
  .form-group.row .col-form-label {
    text-align: left !important;
    padding-bottom: 0.5rem;
  }
  
  .d-flex.justify-content-end {
    justify-content: center !important;
  }
  
  .d-flex.justify-content-end .btn {
    margin-bottom: 0.5rem;
  }
}

.spinner-border {
  vertical-align: middle;
}

textarea.form-control {
  min-height: 120px;
  resize: vertical;
}

.card-border-color-success {
  border-top: 4px solid #28a745;
}

.card-border-color-info {
  border-top: 4px solid #17a2b8;
}

.modal {
  z-index: 9999;
}

.text-success {
  color: #28a745 !important;
}

.text-danger {
  color: #dc3545 !important;
}

.text-warning {
  color: #ffc107 !important;
}

.float-right {
  float: right;
}

.alert {
  border-radius: 8px;
  margin-bottom: 1.5rem;
}
</style>