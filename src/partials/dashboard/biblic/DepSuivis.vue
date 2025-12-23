<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useToast } from 'vue-toastification'

const route = useRoute()
const toast = useToast()

const montants = ref([])
const isLoading = ref(false)
const selectedMontant = ref(null)
const showModal = ref(false)

const activityId = computed(() =>
  route.params.id_campBiblique || route.params.id || route.query.activityId
)

// ==========================
// Chargement paginé
// ==========================
async function fetchAllPages(baseUrl) {
  let results = []
  let page = 1
  let hasMore = true

  while (hasMore) {
    const res = await fetch(`${baseUrl}&page=${page}`)
    const data = await res.json()

    if (!data.member || data.member.length === 0) {
      hasMore = false
    } else {
      results.push(...data.member)
      page++
    }
  }

  return results
}

// ==========================
// Récupérer les motifs depuis l'API /costs
// ==========================
async function fetchCostsForMontants(montantsList) {
  try {
    // Filtrer d'abord pour exclure "Access CB"
    const filteredMontants = montantsList.filter(m => 
      m.status && m.status.toLowerCase() !== 'access cb'
    )
    
    // Récupérer tous les coûts pour cette activité
    const costsUrl = `${import.meta.env.VITE_API_BASE_URL}/costs?campBiblic[]=/api/camp_bibliques/${activityId.value}`
    const costs = await fetchAllPages(costsUrl)
    
    // Créer une map pour associer rapidement un montant à son cost
    const costsByMontantId = {}
    
    costs.forEach(cost => {
      if (cost.montant && typeof cost.montant === 'string') {
        // Extraire l'ID du montant depuis l'URL
        const montantId = cost.montant.split('/').pop()
        costsByMontantId[montantId] = cost
      }
    })
    
    // Associer les motifs aux montants
    return filteredMontants.map(montant => {
      const montantId = montant['@id'].split('/').pop()
      return {
        ...montant,
        costDetail: costsByMontantId[montantId] || null
      }
    })
  } catch (error) {
    console.error('Erreur lors du chargement des motifs:', error)
    // Retourner la liste filtrée même en cas d'erreur
    return montantsList.filter(m => 
      m.status && m.status.toLowerCase() !== 'access cb'
    )
  }
}

// ==========================
// Charger les dépenses
// ==========================
async function loadDepenses() {
  if (!activityId.value) return

  isLoading.value = true
  try {
    const url = `${import.meta.env.VITE_API_BASE_URL}/montants?campBiblic[]=/api/camp_bibliques/${activityId.value}`
    const montantsData = await fetchAllPages(url)
    
    // Charger et associer les motifs (avec filtrage)
    montants.value = await fetchCostsForMontants(montantsData)
  } catch (e) {
    toast.error("Erreur lors du chargement des dépenses")
  } finally {
    isLoading.value = false
  }
}

// ==========================
// Ouvrir le modal avec les détails
// ==========================
function openModal(montant) {
  selectedMontant.value = montant
  showModal.value = true
}

// ==========================
// Annuler / Restaurer
// ==========================
async function toggleDepense() {
  if (!selectedMontant.value) return

  const montant = selectedMontant.value
  const newStatus = montant.status === 'OK' ? 'KO' : 'OK'

  try {
    const res = await fetch(
      `${import.meta.env.VITE_API_IMG}${montant['@id']}`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/merge-patch+json',
          'Accept': 'application/ld+json'
        },
        body: JSON.stringify({ status: newStatus })
      }
    )

    if (!res.ok) throw new Error()

    // Mettre à jour le statut localement
    montant.status = newStatus
    
    // Mettre à jour dans la liste
    const index = montants.value.findIndex(m => m['@id'] === montant['@id'])
    if (index !== -1) {
      montants.value[index].status = newStatus
    }
    
    toast.success(
      newStatus === 'KO'
        ? 'Dépense annulée'
        : 'Dépense restaurée'
    )
    
    // Fermer le modal
    showModal.value = false
    selectedMontant.value = null
  } catch {
    toast.error("Action impossible")
  }
}

// ==========================
// Fermer le modal
// ==========================
function closeModal() {
  showModal.value = false
  selectedMontant.value = null
}

// ==========================
// Helpers
// ==========================
function formatMontant(m) {
  return m.devise === '$'
    ? `$${m.frais.toLocaleString()}`
    : `${m.frais.toLocaleString()} Fc`
}

function formatDate(date) {
  return new Date(date).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

onMounted(loadDepenses)
watch(activityId, loadDepenses)
</script>

<template>
  <div class="be-content">
    <!-- En-tête -->
    <div class="page-head">
      <div class="row align-items-center">
        <div class="col-12 col-md-6">
          <h2 class="page-head-title mb-0">Dépenses de l'activité</h2>
        </div>
      </div>
    </div>

    <!-- Contenu principal -->
    <div class="main-content container-fluid">
      <!-- Carte principale -->
      <div class="card border-0 shadow-sm">
        <div class="card-header bg-transparent border-0 py-3">
          <div class="d-flex justify-content-between align-items-center">
            <h5 class="card-title mb-0 fw-semibold">
              <i class="fas fa-list-ul mr-12 text-primary"></i>
              Liste des dépenses
            </h5>
            <span class="badge bg-primary-subtle text-primary fs-6">
              {{ montants.length }} dépense{{ montants.length > 1 ? 's' : '' }}
            </span>
          </div>
        </div>

        <!-- Corps de la carte -->
        <div class="card-body p-0">
          <!-- Tableau avec entêtes fixes -->
          <div class="table-fixed-header">
            <table class="table table-hover mb-0">
              <thead>
                <tr class="bg-light sticky-header">
                  <th class="pl-3" style="width: 35%; min-width: 180px;">Date</th>
                  <th class="text-end pe-3" style="width: 35%; min-width: 150px;">Montant</th>
                  <th class="text-center" style="width: 30%; min-width: 120px;">Statut</th>
                </tr>
              </thead>

              <tbody>
                <!-- État de chargement -->
                <tr v-if="isLoading">
                  <td colspan="3" class="text-center py-5">
                    <div class="d-flex justify-content-center align-items-center">
                      <div class="spinner-border text-primary" role="status">
                        <span class="visually-hidden"></span>
                      </div>
                      <span class="ml-1">Chargement des dépenses...</span>
                    </div>
                  </td>
                </tr>

                <!-- Liste des dépenses -->
                <tr 
                  v-for="m in montants" 
                  :key="m['@id']"
                  @click="openModal(m)"
                  class="clickable-row align-middle"
                  :class="m.status === 'KO' ? 'bg-light-subtle' : ''"
                >
                  <td class="pl-3 py-3">
                    <div class="d-flex align-items-center">
                      <div class="mr-2">
                        <i class="fas fa-calendar-alt text-muted"></i>
                      </div>
                      <div>
                        <div class="fw-medium">{{ formatDate(m.createdAt) }}</div>
                        <small class="text-muted" v-if="m.costDetail && m.costDetail.motif">
                          {{ m.costDetail.motif.substring(0, 30) }}{{ m.costDetail.motif.length > 30 ? '...' : '' }}
                        </small>
                      </div>
                    </div>
                  </td>

                  <td class="text-end pe-3 py-3">
                    <div class="d-flex flex-column align-items-end">
                      <span class="fw-bold fs-5" :class="m.status === 'KO' ? 'text-decoration-line-through text-muted' : ''">
                        {{ formatMontant(m) }}
                      </span>
                      <small class="text-muted">
                        {{ m.devise === '$' ? 'Dollar américain' : 'Franc congolais' }}
                      </small>
                    </div>
                  </td>

                  
                </tr>

                <!-- État vide -->
                <tr v-if="!isLoading && montants.length === 0">
                  <td colspan="3" class="text-center py-5">
                    <div class="text-center py-5">
                      <i class="fas fa-inbox fa-3x text-muted mb-3"></i>
                      <p class="text-muted mb-0">Aucune dépense trouvée</p>
                      <small class="text-muted">Les dépenses avec statut "Access CB" sont exclues</small>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Pied de la carte -->
          <div class="card-footer bg-transparent border-0 pt-0">
            <div class="row align-items-center">
              <div class="col-12 col-md-6">
                <small class="text-muted">
                  <i class="fas fa-info-circle mr-11"></i>
                  Cliquez sur une ligne pour voir les détails
                </small>
              </div>
              <div class="col-12 col-md-6 text-md-end mt-2 mt-md-0">
                <small class="text-muted">
                  Dernière mise à jour : {{ new Date().toLocaleDateString('fr-FR') }}
                </small>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal pour afficher les détails -->
    <div 
      v-if="showModal" 
      class="modal-backdrop"
      @click.self="closeModal"
    >
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content border-0 shadow-lg">
          <!-- En-tête du modal -->
          <div class="modal-header bg-primary text-white border-0 rounded-top">
            <div class="w-100">
              <div class="d-flex justify-content-between align-items-center">
                <h5 class="modal-title">
                  <i class="fas fa-receipt mr-12"></i>
                  Détails de la dépense
                </h5>
                <button 
                  type="button" 
                  class="btn-close btn-close-white"
                  @click="closeModal"
                  aria-label="Fermer"
                ></button>
              </div>
            </div>
          </div>
          
          <!-- Corps du modal -->
          <div class="modal-body" v-if="selectedMontant">
            <!-- Informations principales -->
            <div class="mb-4">
              <div class="row mb-3">
                <div class="col-12 col-md-6 mb-3 mb-md-0">
                  <div class="d-flex align-items-start">
                    <i class="fas fa-calendar text-primary mt-1 mr-12"></i>
                    <div>
                      <div class="text-muted small">Date</div>
                      <div class="fw-medium">{{ formatDate(selectedMontant.createdAt) }}</div>
                    </div>
                  </div>
                </div>
                <div class="col-12 col-md-6">
                  <div class="d-flex align-items-start">
                    <i class="fas fa-tag text-primary mt-1 mr-12"></i>
                    <div>
                      <div class="text-muted small">Statut</div>
                      <span
                        class="badge rounded-pill px-3 py-1 fw-medium mt-1"
                        :class="{
                          'bg-success': selectedMontant.status === 'OK',
                          'bg-danger': selectedMontant.status === 'KO'
                        }"
                      >
                        {{ selectedMontant.status === 'OK' ? 'Effective' : 'Annulée' }}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div class="mb-3">
                <div class="d-flex align-items-start">
                  <i class="fas fa-money-bill-wave text-success mt-1 mr-12"></i>
                  <div>
                    <div class="text-muted small">Devise</div>
                    <div class="fw-medium">
                      {{ selectedMontant.devise === '$' ? 'Dollar américain ($)' : 'Franc congolais (Fc)' }}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Montant -->
            <div class="mb-4 p-3 bg-light rounded">
              <div class="text-muted small mb-1">Montant</div>
              <div class="display-6 fw-bold text-center" 
                :class="selectedMontant.status === 'KO' ? 'text-decoration-line-through text-muted' : 'text-primary'">
                {{ formatMontant(selectedMontant) }}
              </div>
            </div>

            <!-- Motif -->
            <div class="mb-4">
              <div class="text-muted small mb-2">Motif de la dépense</div>
              <div class="card border">
                <div class="card-body p-3">
                  <div v-if="selectedMontant.costDetail">
                    <p class="mb-0">
                      {{ selectedMontant.costDetail.motif || 'Non spécifié' }}
                    </p>
                  </div>
                  <div v-else class="text-center py-3">
                    <div class="spinner-border spinner-border-sm text-muted" role="status">
                      <span class="visually-hidden">Chargement...</span>
                    </div>
                    <small class="text-muted ml-2">Chargement du motif...</small>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Pied du modal -->
          <div class="modal-footer border-top">
            <button 
              type="button" 
              class="btn btn-outline-secondary"
              @click="closeModal"
            >
              Fermer
            </button>
            
            <button 
              v-if="selectedMontant?.status === 'OK'"
              class="btn btn-danger"
              @click="toggleDepense"
            >
              <i class="fas fa-ban mr-11"></i>
              Annuler la dépense
            </button>
            
            <button 
              v-else-if="selectedMontant"
              class="btn btn-success"
              @click="toggleDepense"
            >
              <i class="fas fa-redo mr-11"></i>
              Restaurer la dépense
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Tableau avec entêtes fixes */
.table-fixed-header {
  position: relative;
  max-height: 500px;
  overflow-y: auto;
}

.table-fixed-header table {
  margin-bottom: 0;
}

.sticky-header {
  position: sticky;
  top: 0;
  z-index: 10;
  background-color: #f8f9fa;
  border-bottom: 2px solid #dee2e6;
}

.sticky-header th {
  border-top: none;
  border-bottom: none;
  padding-top: 1rem;
  padding-bottom: 1rem;
  white-space: nowrap;
}

/* Pour s'assurer que les entêtes restent visibles */
.table-fixed-header thead {
  position: sticky;
  top: 0;
  z-index: 10;
}

.clickable-row {
  cursor: pointer;
  transition: background-color 0.15s ease;
}

.clickable-row:hover {
  background-color: #f8f9fa !important;
}

/* MODAL CORRIGÉ - Plus de transparence */
.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  z-index: 1055;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  opacity: 1 !important;
}

.modal-dialog {
  max-width: 100%;
  margin: auto;
  width: 100%;
  max-width: 600px;
}

.modal-content {
  animation: slideIn 0.3s ease-out;
  border-radius: 0.5rem;
  overflow: hidden;
  background-color: white !important;
  opacity: 1 !important;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .page-head-title {
    font-size: 1.25rem;
  }
  
  .table-fixed-header {
    max-height: 400px;
  }
  
  .modal-dialog {
    margin: 0.5rem;
    max-width: 95%;
  }
  
  .modal-content {
    border-radius: 0.5rem;
  }
  
  .modal-header {
    padding: 1rem;
  }
  
  .modal-body {
    padding: 1rem;
  }
  
  .modal-footer {
    padding: 0.75rem;
  }
  
  .display-6 {
    font-size: 1.75rem;
  }
  
  /* Ajustements pour petits écrans */
  .card-header .card-title {
    font-size: 1rem;
  }
  
  .badge {
    font-size: 0.75rem;
    padding: 0.25rem 0.5rem;
  }
  
  .table td, .table th {
    padding: 0.75rem 0.5rem;
    font-size: 0.875rem;
  }
  
  .table td .fw-bold.fs-5 {
    font-size: 1rem !important;
  }
  
  .table td small {
    font-size: 0.75rem;
  }
}

@media (max-width: 576px) {
  .table-fixed-header {
    max-height: 350px;
  }
  
  .modal-dialog {
    margin: 0.25rem;
    max-width: 98%;
  }
  
  .modal-header h5 {
    font-size: 1rem;
  }
  
  .display-6 {
    font-size: 1.5rem;
  }
  
  /* Réduire encore plus sur très petits écrans */
  .table td, .table th {
    padding: 0.5rem 0.25rem;
    font-size: 0.8rem;
  }
  
  .table td .fw-bold.fs-5 {
    font-size: 0.9rem !important;
  }
  
  .table td .badge {
    font-size: 0.7rem;
    padding: 0.2rem 0.4rem;
  }
  
  /* Ajuster le contenu des cellules */
  .table td .d-flex .mr-2 {
    margin-right: 0.5rem !important;
  }
  
  .table td .fas {
    font-size: 0.875rem;
  }
  
  /* Cacher le texte long sur très petits écrans */
  .table td small.text-muted {
    display: none;
  }
  
  .page-head-title {
    font-size: 1.1rem;
  }
  
  .card-header .card-title {
    font-size: 0.9rem;
  }
  
  .card-header .badge {
    font-size: 0.7rem;
  }
}

/* Pour les écrans très étroits (téléphones en portrait) */
@media (max-width: 400px) {
  .table td, .table th {
    padding: 0.4rem 0.15rem;
    font-size: 0.75rem;
  }
  
  .sticky-header th {
    padding-top: 0.75rem;
    padding-bottom: 0.75rem;
  }
  
  .modal-dialog {
    margin: 0.1rem;
    max-width: 99%;
  }
  
  .modal-body {
    padding: 0.75rem;
  }
  
  .modal-footer .btn {
    padding: 0.375rem 0.5rem;
    font-size: 0.875rem;
  }
}

/* Empêcher le débordement horizontal sur petits écrans */
.table-fixed-header {
  overflow-x: hidden;
}

.table {
  min-width: 300px; /* Largeur minimale pour assurer la lisibilité */
}

/* Ajuster l'alignement des colonnes */
.text-end {
  text-align: right !important;
}

.text-center {
  text-align: center !important;
}

/* FORCER L'OPACITÉ DU MODAL */
.modal-backdrop {
  opacity: 1 !important;
}

.modal-content {
  opacity: 1 !important;
  background-color: white !important;
}
</style>