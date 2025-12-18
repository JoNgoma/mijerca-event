<script setup>
import { useRouter } from 'vue-router'
import { ref, computed, onMounted, nextTick, watch } from 'vue'
import badgeJeunesImage from '/assets/img/badge-jeunes.jpg'
import badgeRespImage from '/assets/img/badge-resp.png'
import badgeVisitImage from '/assets/img/badge-visit.jpeg'
import Vue3DraggableResizable from 'vue3-draggable-resizable'
import 'vue3-draggable-resizable/dist/Vue3DraggableResizable.css'

const router = useRouter()

// Types de badges
const badgeTypes = {
  JEUNES: 'jeunes',
  RESPONSABLE: 'responsable',
  VISIT: 'visiteur',
}

// Configuration par défaut pour chaque type de badge
const defaultConfigs = {
  [badgeTypes.JEUNES]: {
    image: badgeJeunesImage,
    fields: [
      {
        label: 'Frère Josue Ngoma',
        key: 'name',
        x: 50,
        y: 450,
        color: '#3B5998',
        fontSize: 18,
        width: 150,
        height: 40,
      },
      {
        label: 'Paroisse Saint Noé Mawaggali',
        key: 'church',
        x: 50,
        y: 480,
        color: '#E74C3C',
        fontSize: 16,
        width: 250,
        height: 40,
      },
      {
        label: 'Carrefour 1',
        key: 'site',
        x: 50,
        y: 510,
        color: '#000000',
        fontSize: 14,
        width: 100,
        height: 40,
      },
      {
        label: 'Dortoir 1',
        key: 'sleep',
        x: 50,
        y: 540,
        color: '#000000',
        fontSize: 14,
        width: 100,
        height: 40,
      },
    ],
  },
  [badgeTypes.RESPONSABLE]: {
    image: badgeRespImage,
    fields: [
      {
        label: 'Paroisse Saint Noé Mawaggali',
        key: 'church',
        x: 50,
        y: 450,
        color: '#000000',
        fontSize: 18,
        width: 250,
        height: 40,
      },
      {
        label: 'Frère Josue Ngoma',
        key: 'name',
        x: 50,
        y: 480,
        color: '#3B5998',
        fontSize: 16,
        width: 150,
        height: 40,
      },
      {
        label: 'Service Administration',
        key: 'service',
        x: 50,
        y: 510,
        color: '#E74C3C',
        fontSize: 14,
        width: 130,
        height: 40,
      },
    ],
  },
  [badgeTypes.VISIT]: {
    image: badgeVisitImage,
    fields: [
      {
        label: 'Frère Josué Ngoma',
        key: 'name',
        x: 50,
        y: 450,
        color: '#3B5998',
        fontSize: 18,
        width: 150,
        height: 40,
      },
      {
        label: 'Paroisse Saint Noé Mawaggali',
        key: 'church',
        x: 50,
        y: 480,
        color: '#E74C3C',
        fontSize: 16,
        width: 250,
        height: 40,
      },
      {
        label: 'Carrefour 1',
        key: 'site',
        x: 50,
        y: 510,
        color: '#000000',
        fontSize: 14,
        width: 100,
        height: 40,
      },
      {
        label: 'Visiteur',
        key: 'sleep',
        x: 50,
        y: 540,
        color: '#000000',
        fontSize: 14,
        width: 100,
        height: 40,
      },
    ],
  },
}

// État actuel
const currentBadgeType = ref(badgeTypes.JEUNES)
const fields = ref([...defaultConfigs[badgeTypes.JEUNES].fields])
const selectedFieldIndex = ref(0)

// Stockage des configurations de tous les badges
const allBadgeConfigs = ref({
  [badgeTypes.JEUNES]: [...defaultConfigs[badgeTypes.JEUNES].fields],
  [badgeTypes.RESPONSABLE]: [...defaultConfigs[badgeTypes.RESPONSABLE].fields],
  [badgeTypes.VISIT]: [...defaultConfigs[badgeTypes.VISIT].fields],
})

// Computed pour l'image actuelle
const currentBadgeImage = computed(() => {
  return defaultConfigs[currentBadgeType.value].image
})

// Fonction pour calculer la largeur du texte
const calculateTextWidth = (text, fontSize) => {
  const canvas = document.createElement('canvas')
  const context = canvas.getContext('2d')
  context.font = `${fontSize}pt Arial, sans-serif`
  const textWidth = context.measureText(text).width
  return textWidth + 20
}

// Calculer la largeur du texte pour tous les champs
const updateAllFieldWidths = () => {
  fields.value.forEach((field, index) => {
    const width = calculateTextWidth(field.label, field.fontSize)
    fields.value[index].width = width
    const height = Math.max(30, field.fontSize * 2 + 10)
    fields.value[index].height = height
  })
}

// Mettre à jour la position
const updatePosition = (pos, index) => {
  fields.value[index].x = pos.x
  fields.value[index].y = pos.y
}

// Mettre à jour la couleur du champ sélectionné
const updateColor = (color) => {
  fields.value[selectedFieldIndex.value].color = color
}

// Mettre à jour la taille de police
const updateFontSize = (size) => {
  const newSize = parseInt(size)
  fields.value[selectedFieldIndex.value].fontSize = newSize
  const field = fields.value[selectedFieldIndex.value]
  const width = calculateTextWidth(field.label, newSize)
  const height = Math.max(30, newSize * 2 + 10)
  fields.value[selectedFieldIndex.value].width = width
  fields.value[selectedFieldIndex.value].height = height
}

// Sélectionner un champ
const selectField = (index) => {
  selectedFieldIndex.value = index
}

// Changer de type de badge
const changeBadgeType = (type) => {
  // Sauvegarder les modifications actuelles dans allBadgeConfigs
  allBadgeConfigs.value[currentBadgeType.value] = [...fields.value]
  
  // Changer le type de badge
  currentBadgeType.value = type
  
  // Charger la configuration sauvegardée
  const saved = localStorage.getItem(`badgeLayout_${type}`)
  if (saved) {
    try {
      const layoutData = JSON.parse(saved)
      if (layoutData.fields) {
        fields.value = layoutData.fields
        allBadgeConfigs.value[type] = layoutData.fields
        nextTick(() => {
          updateAllFieldWidths()
        })
      }
    } catch (e) {
      console.error('Erreur lors du chargement:', e)
      fields.value = [...defaultConfigs[type].fields]
      allBadgeConfigs.value[type] = [...defaultConfigs[type].fields]
      updateAllFieldWidths()
    }
  } else {
    fields.value = [...allBadgeConfigs.value[type]]
    updateAllFieldWidths()
  }
  selectedFieldIndex.value = 0
}

// Sauvegarder dans localStorage
const saveLayout = () => {
  // Sauvegarder les modifications du badge actuel
  allBadgeConfigs.value[currentBadgeType.value] = [...fields.value]
  
  // Sauvegarder toutes les configurations
  Object.keys(allBadgeConfigs.value).forEach((badgeType) => {
    const layoutData = {
      badgeType: badgeType,
      fields: allBadgeConfigs.value[badgeType],
      timestamp: new Date().toISOString(),
    }
    localStorage.setItem(`badgeLayout_${badgeType}`, JSON.stringify(layoutData))
  })
  
  router.push({
    name: 'info-badge-preview',
    params: {
      serviceType: 'badge-preview',
      badgeType: currentBadgeType.value,
    },
  })
}

// Charger la configuration sauvegardée au démarrage
const loadSavedLayout = () => {
  // Charger les configurations pour tous les types de badges
  Object.keys(allBadgeConfigs.value).forEach((badgeType) => {
    const saved = localStorage.getItem(`badgeLayout_${badgeType}`)
    if (saved) {
      try {
        const layoutData = JSON.parse(saved)
        if (layoutData.fields) {
          allBadgeConfigs.value[badgeType] = layoutData.fields
        }
      } catch (e) {
        console.error(`Erreur lors du chargement du badge ${badgeType}:`, e)
      }
    }
  })
  
  // Charger le badge jeunes par défaut
  const savedJeunes = localStorage.getItem(`badgeLayout_${badgeTypes.JEUNES}`)
  if (savedJeunes) {
    try {
      const layoutData = JSON.parse(savedJeunes)
      if (layoutData.fields) {
        fields.value = layoutData.fields
        nextTick(() => {
          updateAllFieldWidths()
        })
      }
    } catch (e) {
      console.error('Erreur lors du chargement de la configuration jeunes:', e)
      updateAllFieldWidths()
    }
  } else {
    updateAllFieldWidths()
  }
}

onMounted(() => {
  loadSavedLayout()
})

watch(
  fields,
  () => {
    nextTick(() => {
      fields.value.forEach((field, index) => {
        if (field.label && field.fontSize) {
          const width = calculateTextWidth(field.label, field.fontSize)
          const height = Math.max(30, field.fontSize * 2 + 10)
          if (fields.value[index].width !== width) {
            fields.value[index].width = width
          }
          if (fields.value[index].height !== height) {
            fields.value[index].height = height
          }
        }
      })
    })
  },
  { deep: true },
)
</script>

<template>
  <div class="be-content">
    <div class="main-content container-fluid">
      <div class="row">
        <!-- Zone d'édition du badge -->
        <div class="col-lg-8">
          <div class="card card-border-color card-border-color-primary">
            <!-- Sélecteur de type de badge -->
            <div class="card-header d-flex justify-content-between align-items-center">
              <h5 class="card-title mb-0">Configuration des badges</h5>
              <div class="btn-group">
                <button
                  type="button"
                  class="btn btn-sm"
                  :class="
                    currentBadgeType === badgeTypes.JEUNES ? 'btn-primary' : 'btn-outline-primary'
                  "
                  @click="changeBadgeType(badgeTypes.JEUNES)"
                >
                  Badge Jeunes
                </button>
                <button
                  type="button"
                  class="btn btn-sm"
                  :class="
                    currentBadgeType === badgeTypes.RESPONSABLE
                      ? 'btn-primary'
                      : 'btn-outline-primary'
                  "
                  @click="changeBadgeType(badgeTypes.RESPONSABLE)"
                >
                  Badge Responsable
                </button>
                <button
                  type="button"
                  class="btn btn-sm"
                  :class="
                    currentBadgeType === badgeTypes.VISIT ? 'btn-primary' : 'btn-outline-primary'
                  "
                  @click="changeBadgeType(badgeTypes.VISIT)"
                >
                  Badge Visiteur
                </button>
              </div>
            </div>

            <div class="card-body d-flex justify-content-center">
              <div class="badge-editor">
                <!-- Image du badge -->
                <img :src="currentBadgeImage" :alt="`badge-${currentBadgeType}`" class="badge-bg" />

                <!-- Textes positionnables -->
                <vue3-draggable-resizable
                  v-for="(field, index) in fields"
                  :key="index"
                  :x="field.x"
                  :y="field.y"
                  :w="field.width"
                  :h="field.height"
                  :draggable="true"
                  :resizable="true"
                  :min-width="50"
                  :min-height="30"
                  @dragging="updatePosition($event, index)"
                  @resizing="
                    (rect) => {
                      field.width = rect.width
                      field.height = rect.height
                    }
                  "
                  @click="selectField(index)"
                  :class="{ 'selected-field': selectedFieldIndex === index }"
                >
                  <div
                    class="text-field"
                    :style="{
                      color: field.color,
                      fontSize: field.fontSize + 'pt',
                      lineHeight: field.height + 'px',
                      border: selectedFieldIndex === index ? '2px solid #007bff' : 'none',
                      width: '100%',
                      height: '100%',
                      backgroundColor: 'transparent',
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
              <h5 class="card-title">
                Configuration du badge
                {{
                  currentBadgeType === badgeTypes.JEUNES
                    ? 'Jeunes'
                    : currentBadgeType === badgeTypes.RESPONSABLE
                    ? 'Responsable'
                    : 'Visiteur'
                }}
              </h5>
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
                    <div class="color-preview" :style="{ backgroundColor: field.color }"></div>
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
                      style="width: 50px; height: 38px"
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

                <!-- Dimensions -->
                <div class="form-group mb-3">
                  <label>Dimensions :</label>
                  <div class="row">
                    <div class="col-6">
                      <small>Largeur: {{ Math.round(fields[selectedFieldIndex].width) }}px</small>
                    </div>
                    <div class="col-6">
                      <small>Hauteur: {{ Math.round(fields[selectedFieldIndex].height) }}px</small>
                    </div>
                  </div>
                  <div class="row mt-1">
                    <div class="col-6">
                      <small>Position X: {{ fields[selectedFieldIndex].x }}px</small>
                    </div>
                    <div class="col-6">
                      <small>Position Y: {{ fields[selectedFieldIndex].y }}px</small>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Couleurs prédéfinies -->
              <div class="mb-3">
                <h6>Couleurs rapides :</h6>
                <div class="d-flex flex-wrap gap-2">
                  <button
                    v-for="color in [
                      '#000000',
                      '#FFFFFF',
                      '#FF0000',
                      '#00FF00',
                      '#0000FF',
                      '#FFFF00',
                      '#FF00FF',
                      '#00FFFF',
                    ]"
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
                    Enregistrer toutes les configurations
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
  width: 400px;
  height: 600px;
  border: 2px solid #ddd;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.badge-bg {
  width: 100%;
  height: 100%;
  position: absolute;
  object-fit: cover;
}

.text-field {
  font-weight: bold;
  text-align: center;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  cursor: move;
  transition: all 0.2s ease;
  user-select: none;
  white-space: nowrap;
  overflow: visible;
  background-color: transparent;
  padding: 0 5px;
}

.text-field:hover {
  background-color: rgba(255, 255, 255, 0.1);
  transform: scale(1.02);
}

.selected-field .text-field {
  box-shadow: 0 0 10px rgba(0, 123, 255, 0.5);
  border: 2px solid #007bff !important;
  background-color: rgba(255, 255, 255, 0.1);
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

.mr-3 {
  margin-right: 1rem;
}

/* Style pour les poignées de redimensionnement */
.vdr {
  border: none !important;
  background-color: transparent !important;
}

.vdr-handle {
  background-color: #007bff !important;
  border: 1px solid white !important;
}

/* Ajustement pour voir les poignées sur fond transparent */
.selected-field .vdr {
  background-color: rgba(0, 123, 255, 0.1) !important;
}
</style>