<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import badgeImage from "/assets/img/badge-template.jpg";

const router = useRouter();

// Données de test pour la prévisualisation
const person = ref({
  name: "Josué Ngoma",
  church: "Saint Noé Mawaggali", 
  site: "Carrefour 5",
  sleep: "Dortoir 1"
});

const layout = ref([]);

// Charger la configuration sauvegardée
const loadLayout = () => {
  const saved = localStorage.getItem("badgeLayout");
  if (saved) {
    try {
      const layoutData = JSON.parse(saved);
      if (layoutData.fields) {
        layout.value = layoutData.fields;
      }
    } catch (e) {
      console.error("Erreur lors du chargement:", e);
      layout.value = [];
    }
  }
};

// Retourner à l'éditeur
const goBackToEditor = () => {
  router.push({ name: "info-badge-editor", params: { serviceType: 'badge-editor' }});
};

// Aller à la sélection des personnes
const goToPersonSelection = () => {
  router.push({ name: "info-person-selector", params: { serviceType: 'person-selector' }});
};

onMounted(() => {
  loadLayout();
});
</script>

<template>
  <div class="be-content">
    
    <div class="main-content container-fluid">
      <div class="row justify-content-center">
        <div class="col-lg-6">
          <div class="card card-border-color card-border-color-primary">
            <div class="card-header text-center">
              <h5 class="card-title">Aperçu du badge</h5>
              <small class="text-muted">Exemple avec : {{ person.name }}</small>
            </div>
            <div class="card-body d-flex justify-content-center">
              <div class="badge-container">
                <div class="badge">
                  <img :src="badgeImage" alt="badge" class="badge-bg"/>
                  
                  <div
                    v-for="(field, i) in layout"
                    :key="i"
                    class="text"
                    :style="{ 
                      top: field.y + 'px', 
                      left: field.x + 'px',
                      color: field.color || '#000000',
                      fontSize: (field.fontSize || 14) + 'pt'
                    }"
                  >
                    {{ person[field.key] || field.label }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Boutons d'action -->
      <div class="row mt-1">
        <div class="col-12 d-flex justify-content-center gap-3">
          <button 
            @click="goBackToEditor" 
            class="btn btn-secondary btn-lg"
            type="button"
          >
            <i class="mdi mdi-arrow-left me-2"></i>
            Retour à l'éditeur
          </button>
          <button 
            @click="goToPersonSelection" 
            class="btn btn-success btn-lg"
            type="button"
            :disabled="layout.length === 0"
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
.badge-container {
  display: flex;
  justify-content: center;
  align-items: center;
}

.badge {
  position: relative;
  width: 400px;
  height: 600px;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 8px 16px rgba(0,0,0,0.15);
  background: white;
}

.badge-bg {
  width: 100%;
  height: 100%;
  position: absolute;
  left:0;
  object-fit: cover;
}

.text {
  position: absolute;
  font-weight: bold;
  text-shadow: 1px 1px 2px rgba(255,255,255,0.8);
  pointer-events: none;
  white-space: nowrap;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.gap-3 {
  gap: 1rem;
}
</style>
