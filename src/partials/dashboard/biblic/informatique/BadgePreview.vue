<script setup>
import { ref, onMounted, computed, nextTick, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import badgeJeunesImage from "/assets/img/badge-jeunes.jpg";
import badgeRespImage from "/assets/img/badge-resp.png";

const router = useRouter();
const route = useRoute();

// Types de badges
const badgeTypes = {
  JEUNES: 'jeunes',
  RESPONSABLE: 'responsable'
};

// Récupérer le type de badge depuis les paramètres
const currentBadgeType = ref(badgeTypes.JEUNES);

// Observer les changements de route pour mettre à jour le type de badge
watch(() => route.params.badgeType, (newType) => {
  if (newType) {
    currentBadgeType.value = newType;
    loadLayout();
  }
}, { immediate: true });

// Données de test pour la prévisualisation
const personnes = {
  [badgeTypes.JEUNES]: {
    name: "Frère Josué Ngoma",
    church: "Paroisse Saint Noé Mawaggali", 
    site: "Carrefour 5",
    sleep: "Dortoir 1",
    service: ""
  },
  [badgeTypes.RESPONSABLE]: {
    name: "Frère Josué Ngoma",
    church: "Paroisse Saint Noé Mawaggali", 
    service: "Service Administration",
    site: "",
    sleep: ""
  }
};

// Personne actuelle selon le type de badge
const person = computed(() => {
  return personnes[currentBadgeType.value];
});

// Configuration du layout
const layout = ref([]);

// Image de fond selon le type de badge
const currentBadgeImage = computed(() => {
  return currentBadgeType.value === badgeTypes.JEUNES ? badgeJeunesImage : badgeRespImage;
});

// Fonction pour calculer la largeur du texte
const calculateTextWidth = (text, fontSize) => {
  if (!text) return 100;
  
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  context.font = `${fontSize}pt Arial, sans-serif`;
  const textWidth = context.measureText(text).width;
  return textWidth + 20;
};

// Fonction pour obtenir le texte à afficher pour un champ
const getFieldText = (field) => {
  return person.value[field.key] || field.label || '';
};

// Calculer les dimensions pour chaque champ
const updatePreviewFields = () => {
  if (!layout.value || layout.value.length === 0) return;
  
  layout.value.forEach((field, index) => {
    const text = getFieldText(field);
    const width = calculateTextWidth(text, field.fontSize || 14);
    const height = Math.max(30, (field.fontSize || 14) * 2 + 10);
    
    // Mettre à jour les dimensions dynamiques
    layout.value[index].dynamicWidth = width;
    layout.value[index].dynamicHeight = height;
  });
};

// Charger la configuration sauvegardée selon le type de badge
const loadLayout = () => {
  const saved = localStorage.getItem(`badgeLayout_${currentBadgeType.value}`);
  if (saved) {
    try {
      const layoutData = JSON.parse(saved);
      if (layoutData.fields) {
        layout.value = layoutData.fields;
        nextTick(() => {
          updatePreviewFields();
        });
      }
    } catch (e) {
      console.error("Erreur lors du chargement:", e);
      layout.value = getDefaultLayout();
      updatePreviewFields();
    }
  } else {
    layout.value = getDefaultLayout();
    updatePreviewFields();
  }
};

// Configuration par défaut
const getDefaultLayout = () => {
  if (currentBadgeType.value === badgeTypes.JEUNES) {
    return [
      { 
        label: "Frère Josue Ngoma", 
        key: "name", 
        x: 50, 
        y: 450, 
        color: "#3B5998", 
        fontSize: 18,
        width: 150,
        height: 40
      },
      { 
        label: "Paroisse Saint Noé Mawaggali", 
        key: "church", 
        x: 50, 
        y: 480, 
        color: "#E74C3C", 
        fontSize: 16,
        width: 250,
        height: 40
      },
      { 
        label: "Carrefour 1", 
        key: "site", 
        x: 50, 
        y: 510, 
        color: "#000000", 
        fontSize: 14,
        width: 100,
        height: 40
      },
      { 
        label: "Dortoir 1", 
        key: "sleep", 
        x: 50, 
        y: 540, 
        color: "#000000", 
        fontSize: 14,
        width: 100,
        height: 40
      }
    ];
  } else {
    return [
      { 
        label: "Paroisse Saint Noé Mawaggali", 
        key: "church", 
        x: 50, 
        y: 450, 
        color: "#000000", 
        fontSize: 18,
        width: 250,
        height: 40
      },
      { 
        label: "Frère Josue Ngoma", 
        key: "name", 
        x: 50, 
        y: 480, 
        color: "#3B5998", 
        fontSize: 16,
        width: 150,
        height: 40
      },
      { 
        label: "Service Administration", 
        key: "service", 
        x: 50, 
        y: 510, 
        color: "#E74C3C", 
        fontSize: 14,
        width: 130,
        height: 40
      }
    ];
  }
};

// Retourner à l'éditeur avec le type de badge actuel
const goBackToEditor = () => {
  router.push({ 
    name: "info-badge-editor", 
    params: { 
      serviceType: 'badge-editor'
    },
    query: {
      badgeType: currentBadgeType.value
    }
  });
};

// Aller à la sélection des personnes
const goToPersonSelection = () => {
  router.push({ 
    name: "info-person-selector", 
    params: { 
      serviceType: 'person-selector',
      badgeType: currentBadgeType.value
    }
  });
};

// Basculer entre les types de badges
const switchBadgeType = (type) => {
  if (type === currentBadgeType.value) return;
  
  // Mettre à jour la ref directement
  currentBadgeType.value = type;
  
  // Naviguer vers la nouvelle route
  router.push({
    name: "info-badge-preview",
    params: {
      serviceType: 'badge-preview',
      badgeType: type
    }
  });
  
  // Recharger le layout pour le nouveau type
  loadLayout();
};

// Observateur pour recalculer les dimensions quand les données de la personne changent
watch(person, () => {
  updatePreviewFields();
}, { deep: true });

onMounted(() => {
  // Initialiser depuis les paramètres de route
  if (route.params.badgeType) {
    currentBadgeType.value = route.params.badgeType;
  }
  loadLayout();
});
</script>

<template>
  <div class="be-content">
    <div class="main-content container-fluid">
      <!-- Sélecteur de type de badge -->
      <div class="row mb-3">
        <div class="col-12">
          <div class="card">
            <div class="card-body py-2">
              <div class="d-flex justify-content-between align-items-center">
                <h5 class="card-title mb-0">Prévisualisation des badges</h5>
                <div class="btn-group">
                  <button 
                    type="button" 
                    class="btn btn-sm"
                    :class="currentBadgeType === badgeTypes.JEUNES ? 'btn-primary' : 'btn-outline-primary'"
                    @click="switchBadgeType(badgeTypes.JEUNES)"
                  >
                    Badge Jeunes
                  </button>
                  <button 
                    type="button" 
                    class="btn btn-sm"
                    :class="currentBadgeType === badgeTypes.RESPONSABLE ? 'btn-primary' : 'btn-outline-primary'"
                    @click="switchBadgeType(badgeTypes.RESPONSABLE)"
                  >
                    Badge Responsable
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="row justify-content-center">
        <div class="col-lg-6">
          <div class="card card-border-color card-border-color-primary">
            <div class="card-header text-center">
              <h5 class="card-title">
                Aperçu du badge {{ currentBadgeType === badgeTypes.JEUNES ? 'Jeunes' : 'Responsable' }}
              </h5>
              <small class="text-muted">
                Exemple avec : 
                <strong>{{ currentBadgeType === badgeTypes.JEUNES ? person.name : person.name + ' - ' + person.service }}</strong>
              </small>
            </div>
            <div class="card-body d-flex justify-content-center">
              <div class="badge-container">
                <div class="badge">
                  <img 
                    :src="currentBadgeImage" 
                    :alt="`badge-${currentBadgeType}`" 
                    class="badge-bg"
                  />
                  
                  <!-- Affichage des textes selon le layout -->
                  <div
                    v-for="(field, i) in layout"
                    :key="i"
                    class="text-preview"
                    :style="{ 
                      position: 'absolute',
                      top: field.y + 'px', 
                      left: field.x + 'px',
                      color: field.color || '#000000',
                      fontSize: (field.fontSize || 14) + 'pt',
                      fontFamily: 'Arial, sans-serif',
                      fontWeight: 'bold',
                      width: (field.dynamicWidth || field.width || 180) + 'px',
                      height: (field.dynamicHeight || field.height || 40) + 'px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: 'transparent',
                      borderRadius: '4px',
                      textShadow: '1px 1px 2px rgba(0,0,0,0.3)',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      padding: '0 5px',
                      boxSizing: 'border-box',
                      zIndex: 10
                    }"
                  >
                    {{ getFieldText(field) }}
                  </div>
                  
                  <!-- Message si pas de champs -->
                  <div v-if="layout.length === 0" class="no-fields-message">
                    <div style="
                      position: absolute;
                      top: 50%;
                      left: 50%;
                      transform: translate(-50%, -50%);
                      background: white;
                      padding: 20px;
                      border-radius: 8px;
                      text-align: center;
                      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
                      z-index: 5;
                    ">
                      Aucun champ configuré
                    </div>
                  </div>
                </div>
                
                <!-- Informations sur le badge 
                  <div class="mt-3 text-center">
                  <div class="alert alert-info py-2 mb-0">
                    <small>
                      <i class="mdi mdi-information me-1"></i>
                      Affichage de {{ layout.length }} champs configurés
                    </small>
                  </div>
                </div> -->
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Boutons d'action -->
      <div class="row mt-4">
        <div class="col-12 d-flex justify-content-center gap-3">
          <button 
            @click="goBackToEditor" 
            class="btn btn-secondary"
            type="button"
          >
            <i class="mdi mdi-arrow-left me-2"></i>
            Retour à l'éditeur
          </button>
          <button 
            @click="goToPersonSelection" 
            class="btn btn-success"
            type="button"
            :disabled="layout.length === 0"
            :title="layout.length === 0 ? 'Configurez d\'abord les positions des champs' : ''"
          >
            <i class="mdi mdi-printer me-2"></i>
            Passer aux impressions
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.be-content {
  min-height: 100vh;
  background-color: #f8f9fa;
}

.main-content {
  padding: 20px 0;
}

.badge-container {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.badge {
  position: relative;
  width: 400px;
  height: 600px;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  background: white;
  margin-bottom: 1rem;
  border: 1px solid #dee2e6;
}

.badge-bg {
  width: 100%;
  height: 100%;
  position: absolute;
  left: 0;
  top: 0;
  object-fit: cover;
  object-position: center;
  z-index: 1;
}

.text-preview {
  position: absolute;
  z-index: 2;
  pointer-events: none;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.gap-3 {
  gap: 1rem;
}

.alert-info {
  background-color: #e7f3ff;
  border-color: #b3d7ff;
  color: #0066cc;
}

.card-header .card-title {
  font-weight: 600;
}

.card {
  border: 1px solid rgba(0,0,0,.125);
  border-radius: 0.375rem;
  margin-bottom: 1.5rem;
}

.card-border-color-primary {
  border-top: 3px solid #007bff;
}

.btn-primary {
  background-color: #007bff;
  border-color: #007bff;
}

.btn-outline-primary {
  color: #007bff;
  border-color: #007bff;
  background-color: transparent;
}

.btn-outline-primary:hover {
  background-color: #007bff;
  color: white;
}

.btn-secondary {
  background-color: #6c757d;
  border-color: #6c757d;
}

.btn-success {
  background-color: #28a745;
  border-color: #28a745;
}

.btn {
  padding: 0.375rem 0.75rem;
  font-size: 1rem;
  line-height: 1.5;
  border-radius: 0.25rem;
  display: inline-flex;
  align-items: center;
}

.btn-sm {
  padding: 0.25rem 0.5rem;
  font-size: 0.875rem;
}

.d-flex {
  display: flex;
}

.justify-content-between {
  justify-content: space-between;
}

.justify-content-center {
  justify-content: center;
}

.align-items-center {
  align-items: center;
}

.text-center {
  text-align: center;
}

.mb-0 {
  margin-bottom: 0;
}

.mb-3 {
  margin-bottom: 1rem;
}

.mt-3 {
  margin-top: 1rem;
}

.mt-4 {
  margin-top: 1.5rem;
}

.me-1 {
  margin-right: 0.25rem;
}

.me-2 {
  margin-right: 0.5rem;
}

.py-2 {
  padding-top: 0.5rem;
  padding-bottom: 0.5rem;
}

.row {
  display: flex;
  flex-wrap: wrap;
  margin-right: -15px;
  margin-left: -15px;
}

.col-12 {
  flex: 0 0 100%;
  max-width: 100%;
  padding-right: 15px;
  padding-left: 15px;
}

.col-lg-6 {
  flex: 0 0 50%;
  max-width: 50%;
  padding-right: 15px;
  padding-left: 15px;
}

.container-fluid {
  width: 100%;
  padding-right: 15px;
  padding-left: 15px;
  margin-right: auto;
  margin-left: auto;
}

.btn-group {
  display: flex;
}

@media (max-width: 768px) {
  .badge {
    width: 300px;
    height: 450px;
  }
  
  .text-preview {
    transform-origin: 0 0;
    transform: scale(0.75);
  }
}
</style>