<script setup>
import { ref } from 'vue';
import axios from 'axios';
import { useToast } from 'vue-toastification';

const toast = useToast();

// Champs du formulaire
const typeActivite = ref('Camp Biblique');
const dateDebut = ref('');
const dateFin = ref('');
const lieu = ref('');
const theme = ref('');

// Champs logistique
const dortoirFrere = ref(0);
const dortoirSoeur = ref(0);
const carrefour = ref(0);

// Etats de chargement et erreur
const isLoading = ref(false);
const error = ref('');

// Soumission du formulaire
const submitForm = async (e) => {
  e.preventDefault();

  // Vérification de la date de début
  if (!dateDebut.value) {
    toast.error("Veuillez renseigner la date de début.");
    return;
  }

  // Vérification du format YYYY-MM-DD
  const regexDate = /^\d{4}-\d{2}-\d{2}$/;
  if (!regexDate.test(dateDebut.value)) {
    toast.error("Format de date invalide pour la date de début !");
    return;
  }
  if (dateFin.value && !regexDate.test(dateFin.value)) {
    toast.error("Format de date invalide pour la date de fin !");
    return;
  }

  const name = `${typeActivite.value} ${dateDebut.value.split('-')[0]}`;
  isLoading.value = true;
  error.value = '';

  try {
    // 1️⃣ Création du camp biblique
    const response = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/camp_bibliques`, {
      name,
      start: dateDebut.value,
      end: dateFin.value || null,
      location: lieu.value,
      topic: theme.value,
    }, {
      headers: {
        "Content-Type": "application/ld+json",
        "Authorization": `Bearer ${localStorage.getItem("token")}`
      }
    });

    const campId = response.data['@id']; // ex: "/api/camp_bibliques/1"

    // 2️⃣ Création des entités liées
    const linkedEntities = ['finances', 'administrations', 'hebergements', 'informatiques'];
    for (const entity of linkedEntities) {
      await axios.post(`${import.meta.env.VITE_API_BASE_URL}/${entity}`, {
        campBiblic: campId
      }, { headers: { "Content-Type": "application/ld+json" } });
    }

    // 3️⃣ Création des informations logistiques
    await axios.post(`${import.meta.env.VITE_API_BASE_URL}/logistics`, {
      cb: campId,
      dortoirFrere: dortoirFrere.value,
      dortoirSoeur: dortoirSoeur.value,
      carrefour: carrefour.value
    }, { headers: { "Content-Type": "application/ld+json" } });

    toast.success("Activité et Services liées créés avec succès !");

    // Réinitialisation du formulaire
    dateDebut.value = '';
    dateFin.value = '';
    lieu.value = '';
    theme.value = '';
    dortoirFrere.value = 0;
    dortoirSoeur.value = 0;
    carrefour.value = 0;

  } catch (err) {
    console.error("Erreur API:", err);

    if (err.response) {
      const status = err.response.status;
      const data = err.response.data;

      if (status === 400 && data.violations) {
        let messages = data.violations.map(v => `${v.message}`).join("\n");
        error.value = messages;
        toast.error(`Erreurs de validation:\n${messages}`);
      } else if (status === 422 || (status === 400 && data.detail?.includes("unique"))) {
        error.value = data.detail || "Cette activité existe déjà.";
        toast.error(`${error.value}`);
      } else if (status === 500) {
        error.value = data.detail || "Erreur interne du serveur.";
        toast.error(`${error.value}`);
      } else {
        error.value = data.detail || data.message || "Erreur inconnue.";
        toast.error(`${error.value}`);
      }
    } else {
      error.value = "Impossible d'atteindre le serveur.";
      toast.error(error.value);
    }
  } finally {
    isLoading.value = false;
  }
};

</script>

<template>
  <div class="be-content">
    <div class="page-head">
      <h2 class="page-head-title">Nouvelle Activité</h2>
      <nav aria-label="breadcrumb" role="navigation">
        <ol class="breadcrumb page-head-nav">
          <li class="breadcrumb-item"><a href="#">Dashboard</a></li>
          <li class="breadcrumb-item active">Nouvelle activité</li>
        </ol>
      </nav>
    </div>
    <div class="main-content container-fluid">
      <form class="row" @submit="submitForm">
        <div class="col-lg-6">
          <div class="card card-border-color card-border-color-primary">
            <div class="card-header card-header-divider">
              Nouvelle activité
              <span class="card-subtitle">Renseignement sur l'activité</span>
            </div>
            <div class="card-body">
              <div class="form-group pt-2">
                <label for="selectTypeActivite">Type de l'activité</label>
                <select v-model="typeActivite" id="selectTypeActivite" class="form-control">
                  <option>Camp Biblique</option>
                  <option>Ecole de responsable</option>
                </select>
              </div>
              <div class="form-group pt-2">
                <label for="inputActiviteDebut">Début de l'activité</label>
                <input
                  v-model="dateDebut"
                  id="inputActiviteDebut"
                  class="form-control"
                  type="date"
                >
              </div>
              <div class="form-group pt-2">
                <label for="inputActiviteFin">Fin de l'activité</label>
                <input
                  v-model="dateFin"
                  id="inputActiviteFin"
                  class="form-control"
                  type="date"
                >
              </div>
              <div class="form-group pt-2">
                <label for="inputTextarea3">Thème de l'activité</label>
                <textarea v-model="theme" class="form-control" id="inputTheme"></textarea>
              </div>
            </div>
          </div>
        </div>
        <div class="col-lg-6">
          <div class="card card-border-color card-border-color-primary">
            <div class="card-body">
              <div class="form-group">
                <label for="inputActiviteLieu">Lieu de l'activité</label>
                <input v-model="lieu" class="form-control" id="inputActiviteLieu" type="text" placeholder="Lindonge">
              </div>
              <div class="form-group pt-2">
                <label for="inputDortoirFrere">Dortoir Frère (max)</label>
                <input
                  v-model.number="dortoirFrere"
                  id="inputDortoirFrere"
                  class="form-control"
                  type="number"
                  min="0"
                >
              </div>
              <div class="form-group pt-2">
                <label for="inputDortoirSoeur">Dortoir Sœur (max)</label>
                <input
                  v-model.number="dortoirSoeur"
                  id="inputDortoirSoeur"
                  class="form-control"
                  type="number"
                  min="0"
                >
              </div>
              <div class="form-group pt-2">
                <label for="inputCarrefour">Carrefours (max)</label>
                <input
                  v-model.number="carrefour"
                  id="inputCarrefour"
                  class="form-control"
                  type="number"
                  min="0"
                >
              </div>
              <div class="row pt-8">
                <div class="col-12 d-flex justify-content-end">
                  <button class="btn btn-secondary mr-4" type="button">Retour</button>
                  <button class="btn btn-primary d-flex align-items-center" type="submit" :disabled="isLoading">
                    <span v-if="isLoading" class="spinner-border spinner-border-sm mr-2"></span>
                    {{ isLoading ? 'Enregistrement...' : 'Enregistrer' }}
                  </button>
                </div>
              </div>
              <div v-if="error" class="alert alert-danger mt-3">{{ error }}</div>
            </div>
          </div>
        </div>
      </form>
    </div>
  </div>
</template>
