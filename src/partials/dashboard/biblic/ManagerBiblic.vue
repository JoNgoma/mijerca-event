<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from 'vue-toastification'
import axios from 'axios'

const router = useRouter()
const toast = useToast()

const camps = ref([])
const campLogistics = ref({})
const isLoading = ref(false)
const isEditing = ref(false)
const isUpdating = ref(false) // Nouvelle variable pour le chargement du bouton de mise à jour
const selectedCamp = ref(null)
const API = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api'

// Données du formulaire d'édition
const editForm = ref({
  typeActivite: 'Camp Biblique',
  dateDebut: '',
  dateFin: '',
  lieu: '',
  theme: '',
  dortoirFrere: 0,
  dortoirSoeur: 0,
  carrefour: 0
})

// Extraire le type et l'année du nom du camp
const parseCampName = (name) => {
  if (!name) return { type: 'Camp Biblique', year: new Date().getFullYear().toString() }
  const parts = name.split(' ')
  const type = parts.slice(0, -1).join(' ')
  const year = parts[parts.length - 1]
  return { type, year }
}

// Charger tous les camps bibliques avec leurs logistiques
const loadCamps = async () => {
  isLoading.value = true
  try {
    const token = localStorage.getItem('token')
    
    // Charger tous les camps
    const response = await axios.get(`${API}/camp_bibliques`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    
    // Correction de l'accès aux données
    camps.value = response.data['hydra:member'] || response.data.member || []
    
    // Charger toutes les logistiques en une seule requête
    try {
      const logisticsResponse = await axios.get(`${API}/logistics`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      
      const logisticsList = logisticsResponse.data['hydra:member'] || logisticsResponse.data.member || []
      
      // Créer un mapping logistiques par camp ID
      campLogistics.value = {}
      logisticsList.forEach(logistic => {
        if (logistic.cb) {
          // Extraire l'ID du camp de l'URL (ex: /api/camp_bibliques/123)
          const campId = logistic.cb.split('/').pop()
          campLogistics.value[campId] = logistic
        }
      })
      
    } catch (logError) {
      console.warn('Erreur lors du chargement des logistiques:', logError)
      // Continuer même si les logistiques ne sont pas chargées
    }
    
  } catch (error) {
    console.error('Erreur:', error)
    toast.error('Erreur lors du chargement des camps')
  } finally {
    isLoading.value = false
  }
}

// Trouver les logistiques d'un camp
const getCampLogistics = (campId) => {
  return campLogistics.value[campId] || {
    dortoirFrere: 0,
    dortoirSoeur: 0,
    carrefour: 0
  }
}

// Ouvrir le modal d'édition
const openEditModal = (camp) => {
  selectedCamp.value = camp
  
  // Extraire les informations du nom du camp
  const { type, year } = parseCampName(camp.name)
  
  // Récupérer les logistiques du camp
  const logistics = getCampLogistics(camp.id)
  
  // Pré-remplir le formulaire
  editForm.value = {
    typeActivite: type,
    dateDebut: camp.start ? camp.start.split('T')[0] : '',
    dateFin: camp.end ? camp.end.split('T')[0] : '',
    lieu: camp.location || '',
    theme: camp.topic || '',
    dortoirFrere: logistics.dortoirFrere,
    dortoirSoeur: logistics.dortoirSoeur,
    carrefour: logistics.carrefour
  }
  
  isEditing.value = true
}

// Fermer le modal d'édition
const closeEditModal = () => {
  isEditing.value = false
  isUpdating.value = false
  selectedCamp.value = null
  editForm.value = {
    typeActivite: 'Camp Biblique',
    dateDebut: '',
    dateFin: '',
    lieu: '',
    theme: '',
    dortoirFrere: 0,
    dortoirSoeur: 0,
    carrefour: 0
  }
}

// Mettre à jour un camp biblique et ses logistiques
const updateCamp = async () => {
  // Validation
  if (!editForm.value.dateDebut) {
    toast.error('Veuillez renseigner la date de début.')
    return
  }

  const regexDate = /^\d{4}-\d{2}-\d{2}$/
  if (!regexDate.test(editForm.value.dateDebut)) {
    toast.error('Format de date invalide pour la date de début !')
    return
  }
  if (editForm.value.dateFin && !regexDate.test(editForm.value.dateFin)) {
    toast.error('Format de date invalide pour la date de fin !')
    return
  }

  const newName = `${editForm.value.typeActivite} ${editForm.value.dateDebut.split('-')[0]}`
  const token = localStorage.getItem('token')
  
  isUpdating.value = true // Début du chargement
  
  try {
    // 1️⃣ Mettre à jour le camp biblique
    await axios.patch(
      `${API}/camp_bibliques/${selectedCamp.value.id}`,
      {
        name: newName,
        start: editForm.value.dateDebut,
        end: editForm.value.dateFin || null,
        location: editForm.value.lieu,
        topic: editForm.value.theme
      },
      {
        headers: {
          'Content-Type': 'application/merge-patch+json',
          'Authorization': `Bearer ${token}`
        }
      }
    )

    // 2️⃣ Mettre à jour ou créer les logistiques
    const logistics = campLogistics.value[selectedCamp.value.id]
    const logisticsData = {
      cb: `/api/camp_bibliques/${selectedCamp.value.id}`,
      dortoirFrere: editForm.value.dortoirFrere,
      dortoirSoeur: editForm.value.dortoirSoeur,
      carrefour: editForm.value.carrefour
    }

    if (logistics && logistics.id) {
      // Mise à jour des logistiques existantes
      await axios.patch(
        `${API}/logistics/${logistics.id}`,
        logisticsData,
        {
          headers: {
            'Content-Type': 'application/merge-patch+json',
            'Authorization': `Bearer ${token}`
          }
        }
      )
    } else {
      // Créer de nouvelles logistiques
      await axios.post(
        `${API}/logistics`,
        logisticsData,
        {
          headers: {
            'Content-Type': 'application/ld+json',
            'Authorization': `Bearer ${token}`
          }
        }
      )
    }

    toast.success('Camp biblique mis à jour avec succès !')
    
    // Recharger la liste
    await loadCamps()
    closeEditModal()
    
  } catch (error) {
    console.error('Erreur lors de la mise à jour:', error)
    
    if (error.response) {
      const status = error.response.status
      const data = error.response.data

      if (status === 400 && data.violations) {
        const messages = data.violations.map(v => `${v.message}`).join('\n')
        toast.error(`Erreurs de validation:\n${messages}`)
      } else if (status === 422 || (status === 400 && data.detail?.includes('unique'))) {
        toast.error(data.detail || 'Ce camp biblique existe déjà.')
      } else if (status === 500) {
        toast.error(data.detail || 'Erreur interne du serveur.')
      } else {
        toast.error(data.detail || data.message || 'Erreur inconnue.')
      }
    } else {
      toast.error('Impossible d\'atteindre le serveur.')
    }
  } finally {
    isUpdating.value = false // Fin du chargement
  }
}

// Supprimer un camp biblique
const deleteCamp = async (camp) => {
  if (!confirm(`Voulez-vous vraiment supprimer le camp "${camp.name}" ?`)) {
    return
  }

  try {
    const token = localStorage.getItem('token')
    
    // Supprimer d'abord les logistiques associées si elles existent
    const logistics = campLogistics.value[camp.id]
    if (logistics && logistics.id) {
      try {
        await axios.delete(`${API}/logistics/${logistics.id}`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      } catch (logError) {
        console.warn('Erreur lors de la suppression des logistiques:', logError)
        // Continuer même si la suppression des logistiques échoue
      }
    }
    
    // Supprimer le camp
    await axios.delete(`${API}/camp_bibliques/${camp.id}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    
    toast.success('Camp biblique supprimé avec succès')
    await loadCamps()
  } catch (error) {
    console.error('Erreur lors de la suppression:', error)
    toast.error('Erreur lors de la suppression')
  }
}

// Formater la date pour l'affichage
const formatDate = (dateString) => {
  if (!dateString) return 'N/A'
  const date = new Date(dateString)
  return date.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}

onMounted(() => {
  loadCamps()
})
</script>

<template>
  <div class="be-content">
    <div class="page-head">
      <h2 class="page-head-title">Gestion des Camps Bibliques</h2>
      <nav aria-label="breadcrumb" role="navigation">
        <ol class="breadcrumb page-head-nav">
          <li class="breadcrumb-item"><a href="#">Dashboard</a></li>
          <li class="breadcrumb-item active">Camps bibliques</li>
        </ol>
      </nav>
    </div>
    
    <div class="main-content container-fluid">
      <!-- Tableau des camps -->
      <div class="row">
        <div class="col-12">
          <div class="card card-border-color card-border-color-primary">
            <div class="card-header card-header-divider">
              Liste des Camps Bibliques
              <span class="card-subtitle">Cliquez sur un camp pour le modifier</span>
            </div>
            <div class="card-body">
              <div v-if="isLoading" class="text-center py-5">
                <div class="spinner-border text-primary" role="status">
                  <span class="sr-only">Chargement...</span>
                </div>
                <p class="mt-2">Chargement des camps...</p>
              </div>
              
              <div v-else-if="camps.length === 0" class="text-center py-5">
                <i class="mdi mdi-information-outline mdi-48px text-muted"></i>
                <h5 class="mt-3">Aucun camp biblique</h5>
                <p class="text-muted">Aucun camp n'a été créé pour le moment</p>
              </div>
              
              <div v-else class="table-responsive">
                <table class="table table-hover">
                  <thead>
                    <tr>
                      <th>Nom</th>
                      <th>Dates</th>
                      <th>Lieu</th>
                      <th>Thème</th>
                      <th>Dortoirs</th>
                      <th>Carrefours</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="camp in camps" :key="camp.id" class="cursor-pointer" @click="openEditModal(camp)">
                      <td class="font-weight-bold">{{ camp.name }}</td>
                      <td>
                        <div>{{ formatDate(camp.start) }}</div>
                        <small v-if="camp.end" class="text-muted">au {{ formatDate(camp.end) }}</small>
                      </td>
                      <td>{{ camp.location || 'Non spécifié' }}</td>
                      <td>{{ camp.topic || 'Non spécifié' }}</td>
                      <td>
                        <span class="badge badge-info mr-1">
                          Frère : {{ getCampLogistics(camp.id).dortoirFrere }}
                        </span>
                        <span class="badge badge-info">
                          Soeur : {{ getCampLogistics(camp.id).dortoirSoeur }}
                        </span>
                      </td>
                      <td>
                        <span class="badge badge-success">
                          {{ getCampLogistics(camp.id).carrefour }}
                        </span>
                      </td>
                      <td>
                        <button @click.stop="openEditModal(camp)" class="btn btn-sm btn-outline-primary mr-2" title="Modifier">
                          <i class="mdi mdi-edit"></i>
                        </button>
                        <button @click.stop="deleteCamp(camp)" class="btn btn-sm btn-outline-danger" title="Supprimer">
                          <i class="mdi mdi-delete"></i>
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal d'édition -->
    <div v-if="isEditing" class="modal fade show d-block" tabindex="-1" role="dialog" style="background-color: rgba(0,0,0,0.5)">
      <div class="modal-dialog modal-lg" role="document">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Modifier le Camp Biblique</h5>
            <button type="button" class="close" @click="closeEditModal">
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="updateCamp">
              <div class="row">
                <div class="col-md-6">
                  <div class="form-group">
                    <label for="editTypeActivite">Type de l'activité</label>
                    <select v-model="editForm.typeActivite" id="editTypeActivite" class="form-control">
                      <option>Camp Biblique</option>
                      <option>Ecole de responsable</option>
                    </select>
                  </div>
                  <div class="form-group">
                    <label for="editDateDebut">Début de l'activité</label>
                    <input
                      v-model="editForm.dateDebut"
                      id="editDateDebut"
                      class="form-control"
                      type="date"
                      required
                    >
                  </div>
                  <div class="form-group">
                    <label for="editDateFin">Fin de l'activité</label>
                    <input
                      v-model="editForm.dateFin"
                      id="editDateFin"
                      class="form-control"
                      type="date"
                    >
                  </div>
                  <div class="form-group">
                    <label for="editTheme">Thème de l'activité</label>
                    <textarea v-model="editForm.theme" class="form-control" id="editTheme" rows="3"></textarea>
                  </div>
                </div>
                <div class="col-md-6">
                  <div class="form-group">
                    <label for="editLieu">Lieu de l'activité</label>
                    <input v-model="editForm.lieu" class="form-control" id="editLieu" type="text" placeholder="Lindonge">
                  </div>
                  <div class="form-group">
                    <label for="editDortoirFrere">Dortoir Frère (max)</label>
                    <input
                      v-model.number="editForm.dortoirFrere"
                      id="editDortoirFrere"
                      class="form-control"
                      type="number"
                      min="0"
                    >
                  </div>
                  <div class="form-group">
                    <label for="editDortoirSoeur">Dortoir Sœur (max)</label>
                    <input
                      v-model.number="editForm.dortoirSoeur"
                      id="editDortoirSoeur"
                      class="form-control"
                      type="number"
                      min="0"
                    >
                  </div>
                  <div class="form-group">
                    <label for="editCarrefour">Carrefours (max)</label>
                    <input
                      v-model.number="editForm.carrefour"
                      id="editCarrefour"
                      class="form-control"
                      type="number"
                      min="0"
                    >
                  </div>
                </div>
              </div>
            </form>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="closeEditModal">Annuler</button>
            <button type="button" class="btn btn-primary" @click="updateCamp" :disabled="isUpdating">
              <span v-if="isUpdating">
                <span class="spinner-border spinner-border-sm mr-2" role="status" aria-hidden="true"></span>
                Mise à jour...
              </span>
              <span v-else>Mettre à jour</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.cursor-pointer {
  cursor: pointer;
}

.cursor-pointer:hover {
  background-color: #f8f9fa;
}

.modal-backdrop {
  opacity: 0.5;
}

.badge {
  font-size: 0.85em;
  padding: 0.35em 0.65em;
}

.table th {
  border-top: none;
}

.card-header-divider {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-subtitle {
  font-size: 0.875rem;
  color: #6c757d;
}

.btn-outline-primary, .btn-outline-danger {
  border-width: 1px;
}

.btn-sm {
  padding: 0.25rem 0.5rem;
  font-size: 0.875rem;
}

.spinner-border {
  width: 1rem;
  height: 1rem;
  border-width: 0.15em;
}

.btn:disabled {
  cursor: not-allowed;
  opacity: 0.65;
}
</style>