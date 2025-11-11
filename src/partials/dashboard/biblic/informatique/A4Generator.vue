<!-- <template>
  <div class="a4">
    <BadgePreview
      v-for="(p, i) in persons.slice(0, 4)"
      :key="i"
      :person="p"
      :layout="layout"
    />
  </div>
</template> -->

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import BadgePreview from "./BadgePreview.vue";

const router = useRouter();

const selectedPersons = ref([]);
const layout = ref([]);
const currentPage = ref(1);

// Charger les données
const loadData = () => {
  // Charger les personnes sélectionnées depuis la page précédente
  const savedPersons = sessionStorage.getItem("selectedPersonsForBadges");
  if (savedPersons) {
    selectedPersons.value = JSON.parse(savedPersons);
  }

  // Charger la configuration du badge (comme avant)
  const savedLayout = localStorage.getItem("badgeLayout");
  if (savedLayout) {
    try {
      const layoutData = JSON.parse(savedLayout);
      if (layoutData.fields) layout.value = layoutData.fields;
    } catch (e) {
      console.error("Erreur lors du chargement de la configuration:", e);
    }
  }
};

// Diviser les personnes en pages (4 badges par page)
const pages = computed(() => {
  const pagesArray = [];
  for (let i = 0; i < selectedPersons.value.length; i += 4) {
    pagesArray.push(selectedPersons.value.slice(i, i + 4));
  }
  return pagesArray;
});

// Nombre total de pages
const totalPages = computed(() => pages.value.length);

// Page actuelle
const currentPagePersons = computed(() => {
  return pages.value[currentPage.value - 1] || [];
});

// Navigation entre les pages
const goToPage = (page) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page;
  }
};

// Imprimer la page actuelle
const printCurrentPage = () => {
  window.print();
};

// Imprimer toutes les pages
const printAllPages = () => {
  // Afficher toutes les pages pour l'impression
  const printWindow = window.open('', '_blank');
  const printContent = generatePrintContent();
  printWindow.document.write(printContent);
  printWindow.document.close();
  setTimeout(() => {
    printWindow.print();
    sessionStorage.removeItem("selectedPersonsForBadges");
  }, 500);
  
};

// Générer le contenu pour l'impression
const generatePrintContent = () => {
  let content = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Impression des badges</title>
      <style>
        @page {
          size: A4;
          margin: 2mm;
        }
        body {
          margin: 0;
          padding: 0;
          font-family: Arial, sans-serif;
        }
        .page {
          width: 210mm;
          height: 297mm;
          display: grid;
          grid-template-columns: 1fr 1fr;
          grid-template-rows: 1fr 1fr;
          gap: 4mm;
          page-break-after: always;
          box-sizing: border-box;
        }
        .page:last-child {
          page-break-after: auto;
        }
        .badge {
          position: relative;
          width: 100%;
          height: 100%;
          border: 1px solid #ddd;
          border-radius: 8px;
          overflow: hidden;
          background: white;
        }
        .badge-bg {
          width: 100%;
          height: 100%;
          position: absolute;
          object-fit: cover;
        }
        .text {
          position: absolute;
          font-weight: bold;
          white-space: nowrap;
          text-align: center;
        }
      </style>
    </head>
    <body>
  `;
  
  pages.value.forEach((pagePersons, pageIndex) => {
    content += `<div class="page">`;
    
    pagePersons.forEach(person => {
      content += `
        <div class="badge">
          <img src="/assets/img/badge-template.jpg" alt="badge" class="badge-bg"/>
      `;
      
      layout.value.forEach(field => {
        const value = getPersonValue(person, field.key);
        content += `
          <div class="text" style="
            top: ${field.y-10}px; 
            left: ${field.x}px;
            color: ${field.color || '#000000'};
            font-size: ${field.fontSize || 14}pt;
          ">
            ${value}
          </div>
        `;
      });
      
      content += `</div>`;
    });
    
    content += `</div>`;
  });
  
  content += `</body></html>`;
  return content;
};

// Obtenir la valeur d'un champ pour une personne
const getPersonValue = (person, key) => {
  const mapping = {
    'name': person.nom,
    'church': `${person.paroisse}`, // Adaptation
    'site': `Carrefour ${person.carrefour}`,
    'sleep': `Dortoir ${person.dortoir}`
  };
  return mapping[key] || person[key] || '';
};

// Retourner à la sélection
const goBackToSelection = () => {
  router.push({ name: "info-person-selector", params: { serviceType: 'person-selector' }});
};

onMounted(() => {
  loadData();
});
</script>

<template>
  <div class="be-content">
    
    <div class="main-content container-fluid">
      <!-- Informations sur l'impression -->
      <div class="row mb-3">
        <div class="col-12">
          <div class="card card-border-color card-border-color-info">
            <div class="card-body">
              <div class="row align-items-center">
                <div class="col-md-4">
                  <h6 class="mb-0">Total : {{ selectedPersons.length }} badges</h6>
                  <small class="text-muted">{{ totalPages }} page(s) A4</small>
                </div>
                <div class="col-md-4 text-center">
                  <h6 class="mb-0">Page {{ currentPage }} / {{ totalPages }}</h6>
                  <small class="text-muted">{{ currentPagePersons.length }} badge(s) sur cette page</small>
                </div>
                <div class="col-md-4 p-0 text-end">
                  <div class="btn-group" role="group">
                    <button 
                      class="btn btn-primary btn-sm mr-2 shadow-sm"
                      @click="goToPage(currentPage - 1)"
                      :disabled="currentPage === 1"
                    >
                      <i class="mdi mdi-chevron-left"></i>
                    </button>
                    <button 
                      class="btn btn-primary btn-sm shadow-sm"
                      @click="goToPage(currentPage + 1)"
                      :disabled="currentPage === totalPages"
                    >
                      <i class="mdi mdi-chevron-right"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Aperçu de la page A4 -->
      <div class="row justify-content-center">
        <div class="col-12">
          <div class="card card-border-color card-border-color-primary">
            <div class="card-header text-center">
              <h5 class="card-title">Aperçu page {{ currentPage }}</h5>
            </div>
            <div class="card-body d-flex justify-content-center">
              <div class="a4-preview">
                <div class="a4-page">
                  <div 
                    v-for="(person, index) in currentPagePersons" 
                    :key="person.id"
                    class="badge-slot"
                  >
                    <div class="badge">
                      <img src="/assets/img/badge-template.jpg" alt="badge" class="badge-bg"/>
                      
                      <div
                        v-for="(field, i) in layout"
                        :key="i"
                        class="text"
                        :style="{ 
                          top: (field.y * 0.91) + 'px', 
                          left: (field.x * 0.91) + 'px',
                          color: field.color || '#000000',
                          fontSize: ((field.fontSize || 14) * 0.91) + 'pt'
                        }"
                      >
                        {{ getPersonValue(person, field.key) }}
                      </div>
                    </div>
                  </div>
                  
                  <!-- Emplacements vides -->
                  <div 
                    v-for="n in (4 - currentPagePersons.length)" 
                    :key="'empty-' + n"
                    class="badge-slot empty"
                  >
                    <div class="empty-badge">
                      <i class="mdi mdi-plus mdi-24px text-muted"></i>
                      <small class="text-muted">Vide</small>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Navigation entre les pages -->
      <div class="row mt-3" v-if="totalPages > 1">
        <div class="col-12">
          <div class="card card-border-color card-border-color-secondary">
            <div class="card-body">
              <div class="d-flex justify-content-center">
                <nav>
                  <ul class="pagination">
                    <li class="page-item" :class="{ disabled: currentPage === 1 }">
                      <button class="page-link" @click="goToPage(1)" :disabled="currentPage === 1">
                        <i class="mdi mdi-chevron-double-left"></i>
                      </button>
                    </li>
                    <li class="page-item" :class="{ disabled: currentPage === 1 }">
                      <button class="page-link" @click="goToPage(currentPage - 1)" :disabled="currentPage === 1">
                        <i class="mdi mdi-chevron-left"></i>
                      </button>
                    </li>
                    
                    <li 
                      v-for="page in totalPages" 
                      :key="page"
                      class="page-item"
                      :class="{ active: currentPage === page }"
                    >
                      <button class="page-link" @click="goToPage(page)">
                        {{ page }}
                      </button>
                    </li>
                    
                    <li class="page-item" :class="{ disabled: currentPage === totalPages }">
                      <button class="page-link" @click="goToPage(currentPage + 1)" :disabled="currentPage === totalPages">
                        <i class="mdi mdi-chevron-right"></i>
                      </button>
                    </li>
                    <li class="page-item" :class="{ disabled: currentPage === totalPages }">
                      <button class="page-link" @click="goToPage(totalPages)" :disabled="currentPage === totalPages">
                        <i class="mdi mdi-chevron-double-right"></i>
                      </button>
                    </li>
                  </ul>
                </nav>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Boutons d'action -->
      <div class="row mt-4">
        <div class="col-12 d-flex justify-content-center gap-3">
          <button 
            @click="goBackToSelection" 
            class="btn btn-secondary btn-lg"
            type="button"
          >
            <i class="mdi mdi-arrow-left me-2"></i>
            Retour à la sélection
          </button>
          <!-- <button 
            @click="printCurrentPage" 
            class="btn btn-info btn-lg"
            type="button"
            :disabled="currentPagePersons.length === 0"
          >
            <i class="mdi mdi-printer me-2"></i>
            Imprimer cette page
          </button> -->
          <button 
            @click="printAllPages" 
            class="btn btn-success btn-lg"
            type="button"
            :disabled="selectedPersons.length === 0"
          >
            <i class="mdi mdi-printer-settings me-2"></i>
            Imprimer tout ({{ totalPages }} pages)
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.a4-preview {
  transform: scale(0.9);
  transform-origin: top center;
}

.a4-page {
  width: 210mm;
  height: 297mm;
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: 1fr 1fr;
  gap: 5mm;
  padding: 5mm;
  border: 2px solid #ddd;
  border-radius: 8px;
  background: white;
  box-shadow: 0 4px 8px rgba(0,0,0,0.1);
  box-sizing: border-box;
}

.badge-slot {
  display: flex;
  align-items: center;
  justify-content: center;
}

.badge {
  position: relative;
  width: 100%;
  height: 100%;
  border-radius: 4px;
  overflow: hidden;
  background: white;
  border: 1px solid #eee;
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
  white-space: nowrap;
  pointer-events: none;
}

.empty-badge {
  width: 100%;
  height: 100%;
  border: 2px dashed #ddd;
  border-radius: 4px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: #f8f9fa;
}

.gap-3 {
  gap: 1rem;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

@media print {
  .be-content {
    display: none;
  }
}
</style>
