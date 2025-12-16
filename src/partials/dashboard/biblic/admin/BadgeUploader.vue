<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import axios from 'axios'

const route = useRoute()
const API_URL = import.meta.env.VITE_API_BASE_URL
const API_URL_IMG = import.meta.env.VITE_API_IMG

const file = ref(null)
const fileName = ref('')
const category = ref('')
const previewUrl = ref('')
const isUploading = ref(false)
const uploadUrl = ref('')
const error = ref('')
const campName = ref('')

// Charger le nom du camp
onMounted(async () => {
  const campId = route.params.id_campBiblique
  if (!campId) {
    error.value = "Aucune activité trouvée dans l'URL"
    return
  }

  try {
    const res = await axios.get(`${API_URL}/camp_bibliques/${campId}`)
    const camp = res.data
    if (camp.name) campName.value = camp.name
  } catch (err) {
    console.error(err)
    error.value = "Impossible de récupérer l'activité"
  }
})

// Gestion du fichier avec aperçu
const onFileChange = (e) => {
  const selectedFile = e.target.files[0]
  if (selectedFile) {
    // Vérifier la taille du fichier (5MB max)
    if (selectedFile.size > 5 * 1024 * 1024) {
      error.value = "Le fichier est trop volumineux (max 5MB)"
      return
    }

    file.value = selectedFile
    fileName.value = selectedFile.name

    // Créer l'URL pour l'aperçu
    previewUrl.value = URL.createObjectURL(selectedFile)
    error.value = ''

    // Mettre à jour le label du custom file input
    const label = e.target.nextElementSibling
    if (label) {
      label.textContent = selectedFile.name
    }
  }
}

// Upload du fichier
const uploadImage = async () => {
  if (!file.value || !category.value) {
    error.value = 'Veuillez sélectionner un fichier et une catégorie'
    return
  }

  isUploading.value = true
  error.value = ''

  try {
    let folder = 'uploads'
    if (campName.value) {
      folder = campName.value.includes('Ecole')
        ? `Ecole_${new Date().getFullYear()}`
        : `Camp_${new Date().getFullYear()}`
    }

    const formData = new FormData()
    formData.append('image', file.value)
    formData.append('folder', folder)
    formData.append('category', category.value)

    // console.log('Envoi vers:', `${API_URL_IMG}/upload-image`)
    // console.log('Dossier:', folder)
    // console.log('Catégorie:', category.value)

    const res = await axios.post(`${API_URL_IMG}/upload-image`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      timeout: 30000, // 30 secondes timeout
    })

    // console.log('Réponse reçue:', res.data)

    if (res.data.url) {
      uploadUrl.value = res.data.url
      // Optionnel: utiliser le nom original retourné par le backend
      if (res.data.original_filename) {
        fileName.value = res.data.original_filename
      }
      previewUrl.value = ''
      error.value = ''
    } else {
      throw new Error(res.data.error || 'URL non reçue dans la réponse')
    }

  } catch (err) {
    console.error('Erreur détaillée:', err)

    if (err.response) {
      // Erreur du serveur avec réponse
      error.value = err.response.data?.error ||
                   `Erreur serveur (${err.response.status}): ${err.response.statusText}`
    } else if (err.request) {
      // Pas de réponse du serveur
      error.value = 'Impossible de contacter le serveur. Vérifiez votre connexion.'
    } else {
      // Erreur de configuration
      error.value = 'Erreur de configuration: ' + err.message
    }
  } finally {
    isUploading.value = false
  }
}

// Copier l'URL dans le presse-papier
const copyUrl = async () => {
  if (uploadUrl.value) {
    try {
      await navigator.clipboard.writeText(uploadUrl.value)
      // Optionnel: Afficher un message de succès
      const originalError = error.value
      error.value = 'Lien copié dans le presse-papier !'
      setTimeout(() => {
        error.value = originalError
      }, 2000)
    } catch {
      error.value = 'Erreur lors de la copie du lien'
    }
  }
}

// Réinitialiser le formulaire
const resetForm = () => {
  file.value = null
  fileName.value = ''
  category.value = ''
  previewUrl.value = ''
  uploadUrl.value = ''
  error.value = ''

  // Réinitialiser l'input file
  const fileInput = document.getElementById('fileInput')
  if (fileInput) {
    fileInput.value = ''
    const label = fileInput.nextElementSibling
    if (label) {
      label.textContent = 'Choisir un fichier image...'
    }
  }
}
</script>

<template>
  <div class="be-wrapper">
    <div class="be-content">
      <div class="main-content container-fluid">
        <div class="row justify-content-center">
          <div class="col-lg-8">
            <div class="card card-border-color card-border-color-primary">
              <div class="card-header card-header-divider">
                Importer un badge
                <span class="card-subtitle">Téléchargez et visualisez les badges pour votre activité</span>
              </div>
              <div class="card-body">

                <!-- Nom de l'activité -->
                <div v-if="campName" class="alert alert-primary mb-4">
                  <div class="d-flex align-items-center">
                    <span class="icon mdi mdi-information mr-2"></span>
                    <strong>Activité :</strong>
                    <span class="ml-2">{{ campName }}</span>
                  </div>
                </div>
                <div v-else class="alert alert-secondary mb-4">
                  <div class="d-flex align-items-center">
                    <span class="icon mdi mdi-loading mdi-spin mr-2"></span>
                    <span>Chargement des informations de l'activité...</span>
                  </div>
                </div>

                <div class="row">
                  <!-- Colonne Formulaire -->
                  <div class="col-md-6">
                    <!-- Upload file -->
                    <div class="form-group">
                      <label for="fileInput" class="form-label fw-bold">
                        <span class="icon mdi mdi-file-image mr-2"></span>
                        Fichier du badge
                      </label>
                      <div class="custom-file">
                        <input
                          id="fileInput"
                          type="file"
                          @change="onFileChange"
                          accept="image/*"
                          class="custom-file-input"
                        >
                        <label class="custom-file-label" for="fileInput">
                          {{ fileName || 'Choisir un fichier image...' }}
                        </label>
                      </div>
                      <small class="form-text text-muted">
                        Formats acceptés: JPG, PNG, GIF. Taille max: 5MB
                      </small>
                    </div>

                    <!-- Catégorie -->
                    <div class="form-group">
                      <label for="category" class="form-label fw-bold mr-2">
                        <span class="icon mdi mdi-tag mr-2"></span>
                        Catégorie du badge
                      </label>
                      <select
                        id="category"
                        v-model="category"
                        class="form-select"
                      >
                        <option disabled value="">Sélectionnez une catégorie</option>
                        <option value="service">Service</option>
                        <option value="participant">Participant</option>
                        <option value="visiteur">Visiteur</option>
                        <option value="diocesain">Diocésain</option>
                      </select>
                    </div>

                    <!-- Boutons -->
                    <div class="form-group pt-3">
                      <button
                        class="btn btn-primary btn-lg"
                        :disabled="!file || !category || isUploading"
                        @click="uploadImage"
                        type="button"
                      >
                        <span
                          v-if="isUploading"
                          class="spinner-border spinner-border-sm mr-2"
                          role="status"
                        ></span>
                        <span v-else class="icon mdi mdi-cloud-upload mr-2"></span>
                        {{ isUploading ? 'Importation en cours...' : 'Importer le badge' }}
                      </button>
                      <button
                        class="btn btn-secondary btn-lg ml-2"
                        type="button"
                        @click="resetForm"
                      >
                        <span class="icon mdi mdi-refresh mr-2"></span>
                        Réinitialiser
                      </button>
                    </div>
                  </div>

                  <!-- Colonne Aperçu -->
                  <div class="col-md-6">
                    <div class="preview-container">
                      <h6 class="fw-bold mb-3">
                        <span class="icon mdi mdi-eye mr-2"></span>
                        Aperçu du badge
                      </h6>

                      <!-- Aperçu avant upload -->
                      <div v-if="!previewUrl && !uploadUrl" class="preview-placeholder">
                        <div class="text-center py-5">
                          <span class="icon mdi mdi-image-off display-4 text-muted"></span>
                          <p class="mt-3 text-muted">Aucun badge sélectionné</p>
                        </div>
                      </div>

                      <!-- Aperçu après sélection -->
                      <div v-if="previewUrl && !uploadUrl" class="preview-image">
                        <div class="card">
                          <div class="card-header bg-light">
                            <small class="text-muted">Aperçu avant import</small>
                          </div>
                          <div class="card-body text-center">
                            <img
                              :src="previewUrl"
                              alt="Aperçu du badge"
                              class="img-fluid rounded shadow-sm"
                              style="max-height: 200px;"
                            >
                            <p class="mt-2 small text-muted">
                              {{ fileName }}<br>
                              <span class="badge badge-info">{{ category }}</span>
                            </p>
                          </div>
                        </div>
                      </div>

                      <!-- Badge uploadé -->
                      <div v-if="uploadUrl" class="uploaded-badge">
                        <div class="card border-success">
                          <div class="card-header bg-success text-white">
                            <div class="d-flex justify-content-between align-items-center">
                              <span>Badge importé avec succès</span>
                              <span class="icon mdi mdi-check-circle"></span>
                            </div>
                          </div>
                          <div class="card-body text-center">
                            <img
                              :src="uploadUrl"
                              alt="Badge importé"
                              class="img-fluid rounded shadow"
                              style="max-height: 200px;"
                            >
                            <div class="mt-3">
                              <p class="mb-2">
                                <strong>Catégorie:</strong>
                                <span class="badge badge-primary ml-2">{{ category }}</span>
                              </p>
                              <a
                                :href="uploadUrl"
                                target="_blank"
                                class="btn btn-outline-primary btn-sm mr-2"
                              >
                                <span class="icon mdi mdi-open-in-new mr-1"></span>
                                Ouvrir
                              </a>
                              <button
                                class="btn btn-outline-secondary btn-sm"
                                @click="copyUrl"
                              >
                                <span class="icon mdi mdi-content-copy mr-1"></span>
                                Copier le lien
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Messages d'alerte -->
                <div v-if="error" class="alert alert-danger mt-4">
                  <div class="d-flex align-items-center">
                    <span class="icon mdi mdi-alert-circle mr-2"></span>
                    <span>{{ error }}</span>
                  </div>
                </div>

                <!-- Lien de succès (version réduite) -->
                <div v-if="uploadUrl" class="alert alert-success mt-4">
                  <div class="d-flex justify-content-between align-items-center">
                    <div>
                      <span class="icon mdi mdi-check-circle mr-2"></span>
                      <strong>Lien du badge :</strong>
                      <a :href="uploadUrl" target="_blank" class="ml-2">{{ uploadUrl }}</a>
                    </div>
                    <button
                      class="btn btn-sm btn-outline-success"
                      @click="copyUrl"
                    >
                      <span class="icon mdi mdi-content-copy"></span>
                    </button>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.preview-container {
  border-left: 1px solid #e9ecef;
  padding-left: 2rem;
  height: 100%;
}

.preview-placeholder {
  border: 2px dashed #dee2e6;
  border-radius: 0.5rem;
  background-color: #f8f9fa;
}

.preview-image, .uploaded-badge {
  animation: fadeIn 0.5s ease-in;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.custom-file-label::after {
  content: "Parcourir";
}

.form-control:focus, .custom-file-input:focus ~ .custom-file-label,
.form-select:focus {
  border-color: #2196F3;
  box-shadow: 0 0 0 0.2rem rgba(33, 150, 243, 0.25);
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
}

.btn-primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(102, 126, 234, 0.3);
}

@media (max-width: 768px) {
  .preview-container {
    border-left: none;
    border-top: 1px solid #e9ecef;
    padding-left: 0;
    padding-top: 2rem;
    margin-top: 2rem;
  }
}
</style>
