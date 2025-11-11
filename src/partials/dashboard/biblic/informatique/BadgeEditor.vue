<script setup>
import { useRouter } from "vue-router";
import { ref } from "vue";
import badgeImage from "/assets/img/badge-template.jpg"
import Vue3DraggableResizable from "vue3-draggable-resizable";
import "vue3-draggable-resizable/dist/Vue3DraggableResizable.css";

const router = useRouter();

// Textes à placer avec couleurs
const fields = ref([
  { label: "Josue Ngoma", key: "name", x: 50, y: 450, color: "#3B5998", fontSize: 18 },
  { label: "Paroisse Saint Noé Mawaggali", key: "church", x: 50, y: 480, color: "#E74C3C", fontSize: 16 },
  { label: "Carrefour 1", key: "site", x: 50, y: 510, color: "#000000", fontSize: 14 },
  { label: "Dortoir 1", key: "sleep", x: 50, y: 540, color: "#000000", fontSize: 14 }
]);

const selectedFieldIndex = ref(0);

// Mettre à jour la position
const updatePosition = (pos, index) => {
  fields.value[index].x = pos.x;
  fields.value[index].y = pos.y;
};

// Mettre à jour la couleur du champ sélectionné
const updateColor = (color) => {
  fields.value[selectedFieldIndex.value].color = color;
};

// Mettre à jour la taille de police
const updateFontSize = (size) => {
  fields.value[selectedFieldIndex.value].fontSize = parseInt(size);
};

// Sélectionner un champ
const selectField = (index) => {
  selectedFieldIndex.value = index;
};

// Sauvegarder dans localStorage
const saveLayout = () => {
  const layoutData = {
    fields: fields.value,
    timestamp: new Date().toISOString()
  };
  localStorage.setItem("badgeLayout", JSON.stringify(layoutData));
//   alert("Positions et couleurs sauvegardées !");
  router.push({ name: "info-badge-preview", params: { serviceType: 'badge-preview' }});
};

// Charger la configuration sauvegardée
const loadSavedLayout = () => {
  const saved = localStorage.getItem("badgeLayout");
  if (saved) {
    try {
      const layoutData = JSON.parse(saved);
      if (layoutData.fields) {
        fields.value = layoutData.fields;
      }
    } catch (e) {
      console.error("Erreur lors du chargement de la configuration:", e);
    }
  }
};

// Charger au montage du composant
loadSavedLayout();
</script>

<template>
  <div class="be-content">
    
    <div class="main-content container-fluid">
      <div class="row">
        <!-- Zone d'édition du badge -->
        <div class="col-lg-8">
          <div class="card card-border-color card-border-color-primary">
            <!-- <div class="card-header">
              <h5 class="card-title">Badge : Zone d'édition</h5>
            </div> -->
            <div class="card-body d-flex justify-content-center">
              <div class="badge-editor">
                <!-- Image du badge -->
                <img :src="badgeImage" alt="badge" class="badge-bg"/>

                <!-- Textes positionnables -->
                <vue3-draggable-resizable
                  v-for="(field, index) in fields"
                  :key="index"
                  :x="field.x"
                  :y="field.y"
                  :w="180"
                  :h="40"
                  :draggable="true"
                  :resizable="false"
                  @dragging="updatePosition($event, index)"
                  @click="selectField(index)"
                  :class="{ 'selected-field': selectedFieldIndex === index }"
                >
                  <div 
                    class="text-field"
                    :style="{ 
                      color: field.color, 
                      fontSize: field.fontSize + 'pt',
                      border: selectedFieldIndex === index ? '2px solid #007bff' : 'none',
                    }"
                  >
                    {{ field.label }}
                  </div>
                </vue3-draggable-resizable>
              </div>
            </div>
          </div>
        </div>

        <!-- Menu latéral -->
        <div class="col-lg-4">
          <div class="card card-border-color card-border-color-success">
            <div class="card-header">
              <h5 class="card-title">Configuration des textes</h5>
            </div>
            <div class="card-body">
              <!-- Liste des champs -->
              <div class="mb-2">
                <h6>Champs disponibles :</h6>
                <div class="list-group">
                  <button
                    v-for="(field, index) in fields"
                    :key="index"
                    type="button"
                    class="list-group-item list-group-item-action d-flex justify-content-between align-items-center"
                    :class="{ active: selectedFieldIndex === index }"
                    @click="selectField(index)"
                  >
                    <span>{{ field.label }}</span>
                    <div 
                      class="color-preview"
                      :style="{ backgroundColor: field.color }"
                    ></div>
                  </button>
                </div>
              </div>

              <!-- Configuration du champ sélectionné -->
              <div v-if="fields[selectedFieldIndex]">
                <h6>Configuration : {{ fields[selectedFieldIndex].label }}</h6>
                
                <!-- Couleur -->
                <div class="form-group mb-1">
                  <label>Couleur du texte :</label>
                  <div class="d-flex align-items-center">
                    <input
                      type="color"
                      :value="fields[selectedFieldIndex].color"
                      @input="updateColor($event.target.value)"
                      class="form-control form-control-color me-2"
                      style="width: 50px; height: 38px;"
                    />
                    <input
                      type="text"
                      :value="fields[selectedFieldIndex].color"
                      @input="updateColor($event.target.value)"
                      class="form-control"
                      placeholder="#000000"
                    />
                  </div>
                </div>

                <!-- Taille de police -->
                <div class="form-group mb-1">
                  <label>Taille de police (pt) :</label>
                  <input
                    type="range"
                    min="8"
                    max="24"
                    :value="fields[selectedFieldIndex].fontSize"
                    @input="updateFontSize($event.target.value)"
                    class="form-range"
                  />
                  <div class="text-center mt-1">
                    <small>{{ fields[selectedFieldIndex].fontSize }}pt</small>
                  </div>
                </div>

                <!-- Position -->
                <div class="form-group mb-3">
                  <label>Position :</label>
                  <div class="row">
                    <div class="col-6">
                      <small>X: {{ fields[selectedFieldIndex].x }}px</small>
                    </div>
                    <div class="col-6">
                      <small>Y: {{ fields[selectedFieldIndex].y }}px</small>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Couleurs prédéfinies -->
              <div class="mb-3">
                <h6>Couleurs rapides :</h6>
                <div class="d-flex flex-wrap gap-2">
                  <button
                    v-for="color in ['#000000', '#FFFFFF', '#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF']"
                    :key="color"
                    type="button"
                    class="btn btn-sm color-btn"
                    :style="{ backgroundColor: color, border: '1px solid #ccc' }"
                    @click="updateColor(color)"
                    :title="color"
                  ></button>
                </div>
              </div>
              <!-- Boutons d'action -->
            <div class="row mt-3">
                <div class="col-12 d-flex justify-content-end">
                <button class="btn btn-secondary mr-3" @click="router.go(-1)">Retour</button>
                <button @click="saveLayout" class="btn btn-primary" type="button">
                    <i class="mdi mdi-content-save me-1"></i>
                    Enregistrer les positions
                </button>
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
.badge-editor {
  position: relative;
  width: 400px;   /* à ajuster selon ton image */
  height: 600px;  /* idem */
  border: 2px solid #ddd;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0,0,0,0.1);
}

.badge-bg {
  width: 100%;
  height: 100%;
  position: absolute;
  object-fit: cover;
}

.text-field {
  font-size: 14pt;
  font-weight: bold;
  background: rgba(255,255,255,0.8);
  text-align: center;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  cursor: move;
  transition: all 0.2s ease;
}

.text-field:hover {
  background: rgba(255,255,255,0.9);
  transform: scale(1.05);
}

.selected-field .text-field {
  box-shadow: 0 0 10px rgba(0,123,255,0.5);
}

.color-preview {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: 1px solid #ccc;
}

.color-btn {
  width: 30px;
  height: 30px;
  border-radius: 4px;
  cursor: pointer;
}

.color-btn:hover {
  transform: scale(1.1);
}

.list-group-item.active {
  background-color: #007bff;
  border-color: #007bff;
  color: white;
}

.form-control-color {
  border: 1px solid #ced4da;
  border-radius: 0.375rem;
}
</style>