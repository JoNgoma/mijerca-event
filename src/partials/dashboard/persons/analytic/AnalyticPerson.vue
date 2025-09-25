<script setup>
import { ref, computed, onMounted, onUnmounted } from "vue";
import axios from "axios";
import { useServiceContext } from "@/composables/useServiceContext";

const { currentService } = useServiceContext();
const LocalisationService = ref(currentService.value.position);

// Config API
const API_URL = import.meta.env.VITE_API_BASE_URL;
const token = localStorage.getItem("token");

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
      const personRes = await axios.get(`${API_URL}/people?phoneNumber=${encodeURIComponent(currentUser.value.username)}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      currentPerson.value = personRes.data.member?.[0] || null;
    }
  } catch (err) {
    console.error("❌ Erreur récupération user", err);
  }
}

// ==========================
// Récupérer toutes les paroisses et doyennes
// ==========================
async function fetchAllParoisses() {
  try { allParoisses.value = (await axios.get(`${API_URL}/paroisses`, { headers: { Authorization: `Bearer ${token}` } })).data.member || []; }
  catch (err) { console.error("❌ Erreur récupération toutes paroisses", err); }
}
async function fetchAllDoyennes() {
  try { allDoyennes.value = (await axios.get(`${API_URL}/doyennes`, { headers: { Authorization: `Bearer ${token}` } })).data.member || []; }
  catch (err) { console.error("❌ Erreur récupération toutes doyennes", err); }
}

// ==========================
// Fetch doyennes, paroisses, diocèses, personnes
// ==========================
async function fetchSectorId() {
  try {
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
  }
}

// ==========================
// Fetch doyennes (noyau décanal)
async function fetchDoyennes() {
  try {
    doyennes.value = (await axios.get(`${API_URL}/people`, { headers: { Authorization: `Bearer ${token}` } })).data.member?.filter(p => p.doyenne === currentPerson.value.doyenne && p.isDecanal) || [];
  } catch (err) { console.error("❌ Erreur récupération doyennes", err); }
}

// ==========================
// Fetch paroisses (noyau paroissial)
async function fetchParoisses() {
  try {
    paroisses.value = (await axios.get(`${API_URL}/people`, { headers: { Authorization: `Bearer ${token}` } })).data.member?.filter(p => p.paroisse === currentPerson.value.paroisse && p.isNoyau) || [];
  } catch (err) { console.error("❌ Erreur récupération paroisses", err); }
}

// ==========================
// Fetch diocèses (isDioces=true)
async function fetchDioceses() {
  try {
    dioceses.value = (await axios.get(`${API_URL}/people`, { headers: { Authorization: `Bearer ${token}` } })).data.member?.filter(p => p.isDicoces) || [];
  } catch (err) { console.error("❌ Erreur récupération diocèses", err); }
}

// ==========================
// Fetch toutes les personnes
// ==========================
async function fetchPeople() {
  try {
    allPeople.value = (await axios.get(`${API_URL}/people`, { headers: { Authorization: `Bearer ${token}` } })).data.member?.filter(p => p.paroisse === currentPerson.value.paroisse) || [];
  } catch (err) { console.error("❌ Erreur récupération personnes", err); }
}

// ==========================
// Computed pour l'affichage
// ==========================
const jeunes = computed(() => {
  let selected = [];
  switch (LocalisationService.value) {
    case "diocesain": selected = dioceses.value || []; break;
    case "decanal": selected = doyennes.value || []; break;
    case "paroissial": selected = paroisses.value || []; break;
    case "jeune": selected = allPeople.value || []; break;
    default: selected = [];
  }

  return selected.map(p => ({
    ...p,
    doyenne: allDoyennes.value.find(d => d["@id"] === p.doyenne)?.name || "",
    paroisse: allParoisses.value.find(pa => pa["@id"] === p.paroisse)?.name || "",
    nom: p.fullName,
    tel: p.phoneNumber
  }));
});

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
            <div class="card-header">
              Statistique - {{ nameService }}
            </div>
            <div class="card-body">
              <div style="max-height: 44.9rem; overflow-y: auto;">
                <table class="table table-striped table-hover table-fw-widget" id="table1">
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
                      style="cursor: pointer;"
                      :class="{
                        'bg-noyau text-dark': j.isNoyau
                      }"
                    >
                      <td>{{ j.fullName }}</td>
                      <td class="d-none d-md-table-cell">{{ j.doyenne }}</td>
                      <td>{{ j.paroisse }}</td>
                      <td>{{ j.phoneNumber }}</td>
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
#table1 thead th  {
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
</style>
