<script setup>
import { ref, computed, onMounted, onUnmounted } from "vue";
import axios from "axios";
import { useServiceContext } from "@/composables/useServiceContext";

const { currentService } = useServiceContext();
const LocalisationService = ref(currentService.value.position);

// Config API
const API_URL = import.meta.env.VITE_API_BASE_URL;
const token = localStorage.getItem("token");
const isLoading = ref(false)

// Données
const currentUser = ref(null);
const currentPerson = ref(null);
const allPeople = ref([]);
const doyennes = ref([]);      // noyaux décanaux
const paroisses = ref([]);      // noyaux paroissiaux
const dioceses = ref([]);
const allDoyennes = ref([]);    // liste complète doyennes
const allParoisses = ref([]);   // liste complète paroisses
const sectorId = ref(null);
const nameService = ref(currentService.value.name)

// SSE
let eventSource = null

// ==========================
// PAGINATION OPTIMISÉE
// ==========================
async function fetchAllPages(baseUrl, options = {}) {
  let allItems = [];
  let currentPage = 1;
  let hasMore = true;
  
  try {
    while (hasMore) {
      const url = new URL(baseUrl);
      url.searchParams.set('page', currentPage);
      
      const response = await fetch(url, {
        headers: { 
          Authorization: `Bearer ${token}`,
          ...options.headers
        },
        ...options
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.member && Array.isArray(data.member)) {
        allItems = [...allItems, ...data.member];
        
        // Vérifie s'il y a plus de pages
        if (data.member.length === 0 || 
            data.member.length < 30 ||
            currentPage >= 50) {
          hasMore = false;
        } else {
          currentPage++;
        }
      } else {
        hasMore = false;
      }
    }
    
    return allItems;
  } catch (error) {
    console.error('Erreur lors de la récupération paginée:', error);
    throw error;
  }
}

// Version axios pour la pagination
async function fetchAllPagesAxios(baseUrl) {
  let allItems = [];
  let currentPage = 1;
  let hasMore = true;
  
  try {
    while (hasMore) {
      const url = `${baseUrl}${baseUrl.includes('?') ? '&' : '?'}page=${currentPage}`;
      
      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const data = response.data;
      
      if (data.member && Array.isArray(data.member)) {
        allItems = [...allItems, ...data.member];
        
        if (data.member.length === 0 || 
            data.member.length < 30 ||
            currentPage >= 50) {
          hasMore = false;
        } else {
          currentPage++;
        }
      } else {
        hasMore = false;
      }
    }
    
    return allItems;
  } catch (error) {
    console.error('Erreur lors de la récupération paginée:', error);
    throw error;
  }
}

// ==========================
// Déterminer le secteur actif
// ==========================
const sectorName = computed(() => {
  switch (currentService.value?.position) {
    case "est": return "KIN EST";
    case "centre": return "KIN CENTRE";
    case "ouest": return "KIN OUEST";
    default: return "KIN EST";
  }
});

// ==========================
// Charger l'utilisateur connecté
// ==========================
async function fetchCurrentUser() {
  try {
    const username = localStorage.getItem("userPhone");
    if (!token || !username) return;

    const res = await axios.get(`${API_URL}/users?username=${encodeURIComponent(username)}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    currentUser.value = res.data.member?.find(u => u.username === username);

    if (currentUser.value) {
      const personRes = await axios.get(`${API_URL}/people?phoneNumber=${encodeURIComponent(username)}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      currentPerson.value = personRes.data.member?.find(p => p.phoneNumber === username) || null;
    }
  } catch (err) {
    console.error("❌ Erreur récupération user", err);
  }
}

// ==========================
// Récupérer toutes les paroisses et doyennes (avec pagination)
// ==========================
async function fetchAllParoisses() {
  try { 
    allParoisses.value = await fetchAllPagesAxios(`${API_URL}/paroisses`);
    console.log('📊 Toutes les paroisses chargées:', allParoisses.value.length);
  } catch (err) { 
    console.error("❌ Erreur récupération toutes paroisses", err); 
  }
}

async function fetchAllDoyennes() {
  try { 
    allDoyennes.value = await fetchAllPagesAxios(`${API_URL}/doyennes`);
    console.log('📊 Tous les doyennes chargés:', allDoyennes.value.length);
  } catch (err) { 
    console.error("❌ Erreur récupération toutes doyennes", err); 
  }
}

// ==========================
// Fetch doyennes, paroisses, diocèses, personnes (avec pagination)
// ==========================
async function fetchSectorId() {
  try {
    isLoading.value = true
    const res = await axios.get(`${API_URL}/sectors?name=${encodeURIComponent(sectorName.value)}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const sec = res.data.member?.find(s => s.name === sectorName.value);
    if (sec) {
      sectorId.value = sec.id;
      await Promise.all([
        fetchParoisses(),
        fetchDoyennes(),
        fetchPeople(),
        fetchDioceses(),
        fetchAllParoisses(),
        fetchAllDoyennes()
      ]);
    }
  } catch (err) {
    console.error("❌ Erreur récupération secteur", err);
  } finally {
    isLoading.value = false
  }
}

// ==========================
// Fetch doyennes (noyau décanal) avec pagination
async function fetchDoyennes() {
  try {
    const allPeopleData = await fetchAllPagesAxios(`${API_URL}/people`);
    doyennes.value = allPeopleData.filter(p => p.doyenne === currentPerson.value?.doyenne && p.isDecanal) || [];
    console.log('📊 Noyaux décanaux chargés:', doyennes.value.length);
  } catch (err) { 
    console.error("❌ Erreur récupération doyennes", err); 
  }
}

// ==========================
// Fetch paroisses (noyau paroissial) avec pagination
async function fetchParoisses() {
  try {
    const allPeopleData = await fetchAllPagesAxios(`${API_URL}/people`);
    paroisses.value = allPeopleData.filter(p => p.paroisse === currentPerson.value?.paroisse && p.isNoyau) || [];
    console.log('📊 Noyaux paroissiaux chargés:', paroisses.value.length);
  } catch (err) { 
    console.error("❌ Erreur récupération paroisses", err); 
  }
}

// ==========================
// Fetch diocèses (isDioces=true) avec pagination
async function fetchDioceses() {
  try {
    const allPeopleData = await fetchAllPagesAxios(`${API_URL}/people`);
    dioceses.value = allPeopleData.filter(p => p.isDicoces) || [];
    console.log('📊 Noyaux diocésains chargés:', dioceses.value.length);
  } catch (err) { 
    console.error("❌ Erreur récupération diocèses", err); 
  }
}

// ==========================
// Fetch toutes les personnes avec pagination
// ==========================
async function fetchPeople() {
  try {
    const people = await fetchAllPagesAxios(`${API_URL}/people`);
    console.log('📊 Toutes les personnes chargées:', people.length);

    // Filtrage de base
    switch (LocalisationService.value) {
      case "jeune":
        // Tous les jeunes de la même paroisse
        allPeople.value = people.filter(p => p.paroisse === currentPerson.value?.paroisse);
        break;

      case "paroissial":
        // Noyau paroissial avec même paroisse
        allPeople.value = people.filter(
          p => p.paroisse === currentPerson.value?.paroisse && p.isNoyau
        );
        break;

      case "decanal":
        // Noyau décanal avec même doyenné
        allPeople.value = people.filter(
          p => p.doyenne === currentPerson.value?.doyenne && p.isDecanal
        );
        break;

      case "diocesain":
        // Tous les diocésains
        allPeople.value = people.filter(p => p.isDicoces);
        break;

      default:
        allPeople.value = [];
    }

    console.log('📊 Personnes filtrées pour affichage:', allPeople.value.length);
  } catch (err) {
    console.error("❌ Erreur récupération personnes", err);
  }
}

// ==========================
// Computed pour l'affichage
// ==========================
const jeunes = computed(() => {
  return (allPeople.value || []).map(p => ({
    ...p,
    doyenne: allDoyennes.value.find(d => d["@id"] === p.doyenne)?.name || "",
    paroisse: allParoisses.value.find(pa => pa["@id"] === p.paroisse)?.name || "",
    nom: p.fullName,
    tel: p.phoneNumber
  }));
});

// ==========================
// Actualisation manuelle
// ==========================
async function handleRefresh() {
  isLoading.value = true
  try {
    await fetchSectorId();
  } finally {
    isLoading.value = false
  }
}

// ==========================
// Montage SSE
// ==========================
onMounted(async () => {
  await fetchCurrentUser();
  await fetchSectorId();

  // Initialiser DataTables après que les données soient chargées
  window.App?.init();
  window.App?.dataTables();

  // === SSE ===
  eventSource = new EventSource(`${API_URL.replace("/api","")}/sse/people`);
  eventSource.onmessage = (event) => {
    const data = JSON.parse(event.data);

    // Ajouter les nouvelles personnes selon secteur et localisation
    if (!currentPerson.value) return;

    // Diocèse
    if (data.isDicoces && LocalisationService.value === "diocesain") dioceses.value.push(data);

    // Doyenne
    if (data.isDecanal && LocalisationService.value === "decanal") doyennes.value.push(data);

    // Paroisse
    if (data.isNoyau && LocalisationService.value === "paroissial") paroisses.value.push(data);

    // Jeune
    if (data.paroisse === currentPerson.value.paroisse && LocalisationService.value === "jeune") allPeople.value.push(data);
  };

  eventSource.onerror = (err) => {
    console.error("❌ SSE error", err);
    eventSource.close();
  };
});

onUnmounted(() => {
  if (eventSource) eventSource.close();
});
</script>

<template>
  <div class="be-content">
    <div class="main-content container-fluid">
      <div class="row">
        <div class="col-sm-12">
          <div class="card card-table">
            <div class="card-header d-flex justify-content-between align-items-center">
              <span>Statistique - {{ nameService }}</span>
              <!-- <button 
                @click="handleRefresh" 
                class="btn btn-outline-primary btn-sm"
                :disabled="isLoading"
                title="Actualiser les données"
              >
                <i class="fas fa-sync-alt" :class="{ 'fa-spin': isLoading }"></i>
                {{ isLoading ? 'Actualisation...' : 'Actualiser' }}
              </button> -->
            </div>
            <div class="card-body">
              <div class="table-container">
                <div v-if="isLoading" class="text-center my-5">
                  <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden"></span>
                  </div>
                  <p>Chargement des données...</p>
                </div>
                <table v-else class="table table-striped table-hover table-fw-widget" id="table1">
                  <thead>
                    <tr>
                      <th>Nom complet</th>
                      <th class="d-none d-md-table-cell">Doyenné</th>
                      <th>Paroisse</th>
                      <th>Téléphone</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr
                      v-for="j in jeunes"
                      :key="j.id"
                      :class="{
                        'bg-noyau text-dark': j.isNoyau
                      }"
                    >
                      <td>{{ j.gender }} {{ j.fullName }}</td>
                      <td class="d-none d-md-table-cell">{{ j.doyenne }}</td>
                      <td>{{ j.paroisse }}</td>
                      <td>{{ j.phoneNumber }}</td>
                    </tr>
                    <tr v-if="jeunes.length === 0 && !isLoading">
                      <td colspan="4" class="text-center text-muted">Aucune donnée disponible</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style>
.table-container {
  max-height: 44.9rem;
  overflow-y: auto;
  position: relative;
}

#table1 thead th {
  position: sticky;
  top: 0;
  z-index: 2;
  background: #fff;
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.15);
}

/* Couleurs personnalisées pour les lignes */
.bg-noyau {
  background-color: #d7ddd7 !important; /* vert très clair pour isNoyau */
  color: black !important; /* texte noir */
}

/* Hover sur toutes les lignes du tableau */
#table1 tbody tr:hover {
  background-color: rgb(239, 249, 237) !important;
  color: black !important;
}

/* Animation de l'icône d'actualisation */
.fa-spin {
  animation: fa-spin 1s infinite linear;
}

@keyframes fa-spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>