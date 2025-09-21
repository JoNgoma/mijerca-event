<script setup>
import { ref, computed, onMounted } from 'vue';
import { useServiceContext } from '@/composables/useServiceContext';

const { currentService } = useServiceContext();
const pageTitle = computed(() => {
  return `${currentService.value.name}`;
});

const sectorService = computed(() => {
  return currentService.value.position;
});
let sector = 'KIN EST';
if (sectorService.value === "est")
  sector = 'KIN EST';
else if (sectorService.value === "centre")
  sector = 'KIN CENTRE';
else if (sectorService.value === "ouest")
  sector = 'KIN OUEST';
const descr = computed(() => {
  return currentService.value.description;
});

// ===========================
// Ajout logique création
// ===========================
const API_URL = import.meta.env.VITE_API_BASE_URL;
const token = localStorage.getItem("token");

// Champs formulaires
const doyenneName = ref("");
const paroisseName = ref("");
const selectedDoyenne = ref("");
const doyennes = ref([]);
const sectorId = ref(null);

// états de chargement
const isLoadingDoyenne = ref(false);
const isLoadingParoisse = ref(false);

// Charger ID secteur courant
async function fetchSectorId() {
  try {
    const res = await fetch(`${API_URL}/sectors?name=${encodeURIComponent(sector)}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    const sec = data.member?.find(s => s.name === sector)
    if (sec) {
      sectorId.value = sec.id;
      await fetchDoyennes();
    }
  } catch (err) {
    console.error("Erreur récupération secteur", err);
  }
}

// Charger les doyennés liés à ce secteur
async function fetchDoyennes() {
  try {
    if (!sectorId.value) return;
    const res = await fetch(`${API_URL}/doyennes?sector=/sectors/${sectorId.value}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    doyennes.value = data.member?.filter(s => s.sector === `/api/sectors/${sectorId.value}`) || [];
  } catch (err) {
    console.error("Erreur récupération doyennés", err);
  }
}


// Enregistrer un nouveau doyenné
async function saveDoyenne(e) {
  e.preventDefault();
  if (!sectorId.value) return;
  isLoadingDoyenne.value = true;
  try {
    const payload = {
      name: doyenneName.value,
      sector: `/api/sectors/${sectorId.value}`
    };

    const res = await fetch(`${API_URL}/doyennes`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/ld+json"
      },
      body: JSON.stringify(payload)
    });

    if (res.ok) {
      const newDoyenne = await res.json();
      console.log("Doyenné créé:", newDoyenne);
      // ⚡ Enregistrer aussi comme paroisse
      await fetch(`${API_URL}/paroisses`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/ld+json"
        },
        body: JSON.stringify({
          name: doyenneName.value,
          doyenne: `/api/doyennes/${newDoyenne.id}`,
          sector: `/api/sectors/${sectorId.value}`
        })
      });

      await fetchDoyennes(); // rafraîchir la liste
      alert(doyenneName.value + " a été créé comme doyenné et paroisse avec succès !");
      doyenneName.value = "";
    } else {
      console.error("Erreur création doyenné", await res.json());
    }
  } catch (err) {
    console.error("Erreur création doyenné", err);
  } finally {
    isLoadingDoyenne.value = false;
  }
}

// Enregistrer une paroisse
async function saveParoisse(e) {
  e.preventDefault();
  if (!sectorId.value || !selectedDoyenne.value) return;
  isLoadingParoisse.value = true;
  try {
    const payload = {
      name: paroisseName.value,
      doyenne: `/api/doyennes/${selectedDoyenne.value}`,
      sector: `/api/sectors/${sectorId.value}`
    };

    const res = await fetch(`${API_URL}/paroisses`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/ld+json"
      },
      body: JSON.stringify(payload)
    });

    if (res.ok) {
      alert(paroisseName.value + " a été créée comme paroisse avec succès !");
      paroisseName.value = "";
      selectedDoyenne.value = "";
    } else {
      console.error("Erreur création paroisse", await res.json());
    }
  } catch (err) {
    console.error("Erreur création paroisse", err);
  } finally {
    isLoadingParoisse.value = false;
  }
}

onMounted(() => {
  fetchSectorId();
});
</script>

<template>
  <div class="be-content">
    <div class="page-head">
      <h2 class="page-head-title">{{ pageTitle }}</h2>
      <nav aria-label="breadcrumb" role="navigation">
        <ol class="breadcrumb page-head-nav">
          <li class="breadcrumb-item"><router-link :to="{ name: 'dashboard' }">Dashboard</router-link></li>
          <li class="breadcrumb-item"><a href="#">{{ descr }}</a></li>
          <li class="breadcrumb-item active">{{ pageTitle }}</li>
        </ol>
      </nav>
    </div>
    <div class="main-content container-fluid">
      <div class="row">
        <!-- Formulaire Doyenné -->
        <div class="col-lg-6">
          <div class="card card-border-color card-border-color-primary">
            <div class="card-header card-header-divider">
              {{ descr }}
              <span class="card-subtitle">Ajouter un doyenné inexistant</span>
            </div>
            <div class="card-body">
              <form @submit="saveDoyenne">
                <div class="form-group pt-2">
                  <label for="inputNameDoy">Nom du doyenné</label>
                  <input v-model="doyenneName" class="form-control" id="inputNameDoy" type="text"
                    placeholder="Saint Noé Mawaggali">
                </div>
                <div class="row pt-8">
                  <div class="col-12 d-flex justify-content-end">
                    <button class="btn btn-primary" type="submit" :disabled="isLoadingDoyenne">
                      <span v-if="isLoadingDoyenne">Enregistrement...</span>
                      <span v-else>Enregistrer doyenné</span>
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>

        <!-- Formulaire Paroisse -->
        <div class="col-lg-6">
          <div class="card card-border-color card-border-color-primary">
            <div class="card-header card-header-divider">Nouvelle paroisse</div>
            <div class="card-body">
              <form @submit="saveParoisse">
                <div class="form-group">
                  <label>Selectionner le doyenné</label>
                  <select v-model="selectedDoyenne" class="form-control">
                    <option v-for="d in doyennes" :key="d.id" :value="d.id">
                      {{ d.name }}
                    </option>
                  </select>
                </div>
                <div class="form-group">
                  <label for="inputNamPar">Nom de la paroisse</label>
                  <input v-model="paroisseName" class="form-control" id="inputNamePar" type="text"
                    placeholder="Saint Noé Mawaggali">
                </div>
                <div class="row">
                  <div class="col-12 d-flex justify-content-end">
                    <button class="btn btn-primary" type="submit" :disabled="isLoadingParoisse">
                      <span v-if="isLoadingParoisse">Enregistrement...</span>
                      <span v-else>Enregistrer paroisse</span>
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
