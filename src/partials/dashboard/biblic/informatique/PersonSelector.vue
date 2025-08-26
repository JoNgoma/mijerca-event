<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();

// Liste des personnes (basée sur LogAffect.vue)
const allPersons = ref([
  { id: 1, nom: "Josué Ngoma", dortoir: 1, carrefour: 5, tel: "0812 345 678", selected: false },
  { id: 2, nom: "Marie-Claire Tshibangu", dortoir: 2, carrefour: 3, tel: "0998 765 432", selected: false },
  { id: 3, nom: "David Kasongo", dortoir: 3, carrefour: 8, tel: "0813 246 579", selected: false },
  { id: 4, nom: "Joseph Ilunga", dortoir: 4, carrefour: 1, tel: "0997 654 321", selected: false },
  { id: 5, nom: "Thérèse Mbala", dortoir: 5, carrefour: 12, tel: "0814 357 680", selected: false },
  { id: 6, nom: "Gabriel Kayembe", dortoir: 6, carrefour: 7, tel: "0996 543 210", selected: false },
  { id: 7, nom: "Michel Tshilombo", dortoir: 7, carrefour: 15, tel: "0815 468 279", selected: false },
  { id: 8, nom: "Cécile Mulumba", dortoir: 8, carrefour: 2, tel: "0995 432 198", selected: false },
  { id: 9, nom: "André Mbuyi", dortoir: 9, carrefour: 10, tel: "0816 579 234", selected: false },
  { id: 10, nom: "Matthieu Kabeya", dortoir: 10, carrefour: 4, tel: "0994 321 087", selected: false },
  { id: 11, nom: "Pierre Ngoy", dortoir: 1, carrefour: 9, tel: "0817 680 345", selected: false },
  { id: 12, nom: "Bernadette Mputu", dortoir: 2, carrefour: 6, tel: "0993 210 654", selected: false },
  { id: 13, nom: "Thomas Kazadi", dortoir: 3, carrefour: 11, tel: "0818 791 246", selected: false },
  { id: 14, nom: "Jacques Beya", dortoir: 4, carrefour: 14, tel: "0992 109 876", selected: false },
  { id: 15, nom: "Elisabeth Kabongo", dortoir: 5, carrefour: 13, tel: "0819 234 567", selected: false }
]);

const searchQuery = ref("");
const selectAll = ref(false);

// Personnes filtrées
const filteredPersons = computed(() => {
  if (!searchQuery.value.trim()) {
    return allPersons.value;
  }
  const query = searchQuery.value.toLowerCase();
  return allPersons.value.filter(person => 
    person.nom.toLowerCase().includes(query) ||
    person.dortoir.toString().includes(query) ||
    person.carrefour.toString().includes(query)
  );
});

// Personnes sélectionnées
const selectedPersons = computed(() => {
  return allPersons.value.filter(person => person.selected);
});

// Nombre de pages A4 nécessaires
const pagesNeeded = computed(() => {
  return Math.ceil(selectedPersons.value.length / 4);
});

// Sélectionner/désélectionner tout
const toggleSelectAll = () => {
  filteredPersons.value.forEach(person => {
    person.selected = selectAll.value;
  });
};

// Sélectionner/désélectionner une personne
const togglePerson = (person) => {
  person.selected = !person.selected;
  updateSelectAllState();
};

// Mettre à jour l'état "Tout sélectionner"
const updateSelectAllState = () => {
  const visibleSelected = filteredPersons.value.filter(p => p.selected).length;
  const visibleTotal = filteredPersons.value.length;
  selectAll.value = visibleSelected === visibleTotal && visibleTotal > 0;
};

// Retourner à la prévisualisation
const goBackToPreview = () => {
  router.push({ name: "info-badge-preview", params: { serviceType: 'badge-preview' }});
};

// Générer les badges
const generateBadges = () => {
  if (selectedPersons.value.length === 0) {
    alert("Veuillez sélectionner au moins une personne.");
    return;
  }
  
  // Sauvegarder les personnes sélectionnées
  localStorage.setItem("selectedPersonsForBadges", JSON.stringify(selectedPersons.value));
  
  // Rediriger vers le générateur A4
  router.push({ name: "info-a4-generator", params: { serviceType: 'a4-generator' }});
};
</script>

<template>
  <div class="be-content">
    <!-- <div class="page-head">
      <h2 class="page-head-title">Sélection des personnes</h2>
      <nav aria-label="breadcrumb" role="navigation">
        <ol class="breadcrumb page-head-nav">
          <li class="breadcrumb-item"><router-link :to="{ name: 'dashboard' }">Dashboard</router-link></li>
          <li class="breadcrumb-item"><a href="#">Informatique</a></li>
          <li class="breadcrumb-item active">Sélection</li>
        </ol>
      </nav>
    </div> -->
    
    <div class="main-content container-fluid">
      <!-- Statistiques et recherche -->
      <div class="row mb-1">
        <div class="col-lg-8">
          <div class="card card-border-color card-border-color-info">
            <div class="card-body">
              <div class="row align-items-center">
                <div class="col-md-6">
                  <div class="input-group">
                    <!-- <span class="input-group-text"><i class="mdi mdi-magnify"></i></span> -->
                    <input
                      type="text"
                      class="form-control"
                      placeholder="Rechercher par nom, dortoir ou carrefour..."
                      v-model="searchQuery"
                    />
                  </div>
                </div>
                <div class="col-md-6">
                  <div class="form-check">
                    <input
                      class="form-check-input"
                      type="checkbox"
                      id="selectAllCheck"
                      v-model="selectAll"
                      @change="toggleSelectAll"
                    />
                    <label class="form-check-label" for="selectAllCheck">
                      Sélectionner tout ({{ filteredPersons.length }} personnes)
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="col-lg-4">
            <div class="card card-border-color card-border-color-success">
                <div class="card-body">
                    <div class="row text-center align-items-center">
                        <!-- Colonne 1 -->
                        <div class="col-6 border-end">
                            <h5 class="text-success mb-0">{{ selectedPersons.length }}</h5>
                            <small class="text-muted">Personnes sélectionnées</small>
                        </div>
                        <!-- Colonne 2 -->
                        <div class="col-6">
                            <h5 class="text-dark mb-0">{{ pagesNeeded }}</h5>
                            <small class="text-muted">page(s) A4</small>
                        </div>
                    </div>
                </div>
            </div>
        </div>

      </div>

      <!-- Liste des personnes -->
        <div class="row">
            <div class="col-12">
                <div class="card card-border-color card-border-color-primary">
                <div class="card-header">
                    <h5 class="card-title">Impression badge</h5>
                </div>
                <div class="card-body">
                    <div class="table-responsive" style="max-height: 30rem; overflow-y: auto;">
                    <table class="table table-hover table-striped align-middle">
                        <thead class="table-dark sticky-top">
                        <tr>
                            <th width="50" class="text-center align-middle">
                                <div class="form-check m-0 d-inline-flex align-items-center justify-content-center">
                                <input
                                    type="checkbox"
                                    class="form-check-input mb-2"
                                    v-model="selectAll"
                                    @change="toggleSelectAll"
                                />
                                </div>
                            </th>
                            <th class="align-middle">Nom complet</th>
                            <th class="align-middle">Dortoir</th>
                            <th class="align-middle">Carrefour</th>
                            <th class="align-middle">Téléphone</th>
                        </tr>

                        </thead>
                        <tbody>
                        <tr 
                            v-for="person in filteredPersons" 
                            :key="person.id"
                            :class="{ 'table-success': person.selected }"
                            @click="togglePerson(person)"
                            style="cursor: pointer;"
                        >
                            <td width="50" class="text-center align-middle">
                            <div class="form-check m-0 d-inline-flex align-items-center justify-content-center">
                                <input
                                type="checkbox"
                                class="form-check-input mb-2"
                                v-model="person.selected"
                                @change="updateSelectAllState"
                                @click.stop
                                />
                            </div>
                            </td>
                            <td>
                            <strong>{{ person.nom }}</strong>
                            <!-- <span v-if="person.selected" class="badge bg-success ms-2">Sélectionné</span> -->
                            </td>
                            <td>{{ person.dortoir }}</td>
                            <td>{{ person.carrefour }}</td>
                            <td>{{ person.tel }}</td>
                        </tr>
                        </tbody>
                    </table>
                    </div>
                    
                    <div v-if="filteredPersons.length === 0" class="text-center text-muted py-4">
                    <i class="mdi mdi-account-search mdi-48px"></i>
                    <p>Aucune personne trouvée pour "{{ searchQuery }}"</p>
                    </div>
                </div>
                </div>
            </div>
        </div>


      <!-- Boutons d'action -->
      <div class="row mt-4">
        <div class="col-12 d-flex justify-content-center gap-3">
          <button 
            @click="goBackToPreview" 
            class="btn btn-secondary btn-lg"
            type="button"
          >
            <i class="mdi mdi-arrow-left me-2"></i>
            Retour à la prévisualisation
          </button>
          <button 
            @click="generateBadges" 
            class="btn btn-primary btn-lg"
            type="button"
            :disabled="selectedPersons.length === 0"
          >
            <i class="mdi mdi-printer me-2"></i>
            Générer {{ selectedPersons.length }} badge(s)
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.table-responsive {
  border-radius: 0.375rem;
}

.sticky-top {
  position: sticky;
  top: 0;
  z-index: 10;
}

.gap-3 {
  gap: 1rem;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

tr:hover {
  background-color: rgba(0,123,255,0.1) !important;
}

.table-success {
  background-color: rgba(25,135,84,0.1) !important;
}
</style>