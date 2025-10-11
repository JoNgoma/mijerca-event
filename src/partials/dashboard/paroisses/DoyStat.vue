<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useRoute } from 'vue-router';
import { useServiceContext } from '@/composables/useServiceContext';

const route = useRoute();
const { currentService } = useServiceContext();

const sectorService = computed(() => route.params.serviceType || currentService.value.position);

const sector = computed(() => {
  if (sectorService.value === "est") return "KIN EST";
  if (sectorService.value === "centre") return "KIN CENTRE";
  if (sectorService.value === "ouest") return "KIN OUEST";
  return "KIN EST";
});

const descr = computed(() => currentService.value.description);

// ==========================
// Données dynamiques
// ==========================
const API_URL = import.meta.env.VITE_API_BASE_URL;
const token = localStorage.getItem("token");

const isLoading = ref(false)
const sectorId = ref(null);
const doyennes = ref([]);
const totalSecteur = ref(0);

// ==========================
// SSE pour temps réel
// ==========================
const messages = ref([]);
const connectSse = () => {
  const evtSource = new EventSource(`${API_URL}/sse/updates`);
  evtSource.onmessage = e => {
    const msg = JSON.parse(e.data);
    messages.value.push(msg);
  };
  evtSource.onerror = () => evtSource.close(); // reconnect si nécessaire
  return evtSource;
};

// ==========================
// Fetch sector + doyennes + paroisses + personnes
// ==========================
async function fetchSectorId() {
  isLoading.value = true; // ✅ Début du chargement
  try {
    const res = await fetch(`${API_URL}/sectors?name=${encodeURIComponent(sector.value)}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    const sec = data.member?.find(s => s.name === sector.value);
    if (sec) {
      sectorId.value = sec.id;
      await fetchDoyennes();
    }
  } catch (err) {
    console.error("Erreur récupération secteur", err);
  } finally {
    isLoading.value = false; // ✅ Fin du chargement
  }
}

async function fetchDoyennes() {
  if (!sectorId.value) return;
  try {
    const res = await fetch(`${API_URL}/doyennes?sector=/sectors/${sectorId.value}`, { headers: { Authorization: `Bearer ${token}` } });
    const data = await res.json();
    const secDoyenne = data.member?.filter(s => s.sector === `/api/sectors/${sectorId.value}`) || [];

    const paroissesRes = await fetch(`${API_URL}/paroisses?sector=/sectors/${sectorId.value}`, { headers: { Authorization: `Bearer ${token}` } });
    const paroissesData = await paroissesRes.json();
    const secParoisses = paroissesData.member?.filter(s => s.sector === `/api/sectors/${sectorId.value}`) || [];

    const peopleRes = await fetch(`${API_URL}/people?sector=/sectors/${sectorId.value}`, { headers: { Authorization: `Bearer ${token}` } });
    const peopleData = await peopleRes.json();
    const people = peopleData.member || [];

    doyennes.value = secDoyenne.map(d => {
      const paroisses = secParoisses
        .filter(p => p.doyenne === `/api/doyennes/${d.id}`)
        .map(p => ({
          id: p.id,
          name: p.name,
          effectif: people.filter(pe => pe.paroisse === `/api/paroisses/${p.id}`).length
        }));

      const idx = paroisses.findIndex(p => p.name === d.name);
      if (idx > 0) {
        const [p] = paroisses.splice(idx, 1);
        paroisses.unshift(p);
      }

      const totalEffectif = paroisses.reduce((acc, p) => acc + p.effectif, 0);
      return { ...d, paroisses, totalEffectif };
    });

    totalSecteur.value = people.filter(pe => pe.sector === `/api/sectors/${sectorId.value}`).length;
  } catch (err) {
    console.error("Erreur récupération doyennés, paroisses et personnes", err);
  }
}

// ==========================
// Watch SSE pour mise à jour temps réel
// ==========================
watch(messages, (newMessages) => {
  newMessages.forEach(msg => {
    if(msg.type === 'doyenne' && msg.sector === sectorId.value){
      // Ajouter si pas déjà présent
      if (!doyennes.value.some(d => d.id === msg.id)) {
        doyennes.value.push({ ...msg, paroisses: [], totalEffectif: 0 });
      }
    }
    if(msg.type === 'paroisse' && msg.sector === sectorId.value){
      const doy = doyennes.value.find(d => d.id === msg.doyenneId);
      if(doy){
        doy.paroisses.push({ id: msg.id, name: msg.name, effectif: 0 });
        doy.totalEffectif = doy.paroisses.reduce((acc, p) => acc + p.effectif, 0);
      }
    }
  });
});

// ==========================
// Initialisation
// ==========================
onMounted(() => {
  fetchSectorId();
  connectSse();
});

// 🔑 Relancer dès que le param change
watch(() => route.params.serviceType, () => fetchSectorId());
</script>


<template>
  <div class="be-content">
    <div class="main-content container-fluid">
      <div class="row">
        <div class="col-sm-12">
          <div class="card card-table">
            <div class="card-header">{{ descr }}
              <div class="tools dropdown">
                <span class="icon mdi mdi-download"></span>
                <a class="dropdown-toggle" href="#" role="button" data-toggle="dropdown">
                  <span class="icon mdi mdi-more-vert"></span>
                </a>
                <div class="dropdown-menu" role="menu">
                  <a class="dropdown-item" href="#">Action</a>
                  <a class="dropdown-item" href="#">Another action</a>
                  <a class="dropdown-item" href="#">Something else here</a>
                  <div class="dropdown-divider"></div>
                  <a class="dropdown-item" href="#">Separated link</a>
                </div>
              </div>
            </div>
            <div class="card-body">
              <div v-if="isLoading" class="text-center my-5">
                <div class="spinner-border text-primary" role="status">
                  <span class="visually-hidden"></span>
                </div>
                <p>Chargement des données...</p>
              </div>
              <div v-else style="max-height: 44.9rem; overflow-y: auto;">
                <table class="table table-striped table-hover table-fw-widget" id="tableSect">
                  <thead>
                    <tr>
                      <th class="col-doyenne">Doyennés</th>
                      <th class="col-paroisse">Paroisses</th>
                      <th>Effectif</th>
                    </tr>
                  </thead>
                  <tbody>
                    <template v-for="d in doyennes" :key="d.id">
                      <tr v-for="(p, index) in d.paroisses" :key="p.id">
                        <td v-if="index === 0" :rowspan="d.paroisses.length + 1"
                            class="align-middle fw-bold bg-light">
                          Doyenné {{ d.name }}
                        </td>
                        <td>{{ p.name }}</td>
                        <td>{{ p.effectif }}</td>
                      </tr>
                      <!-- Ligne total du doyenné -->
                      <tr class="table-info fw-bold">
                        <td class="text-center">
                          <span class="badge bg-info text-dark">{{ d.paroisses.length }} Paroisses</span>
                        </td>
                        <td><span class="badge bg-success">{{ d.totalEffectif }}</span></td>
                      </tr>
                    </template>
                    <!-- Ligne finale total du secteur -->
                    <tr class="table-warning fw-bold">
                      <td colspan="2" class="text-center">
                        <span class="badge bg-warning text-dark">Total Secteur</span>
                      </td>
                      <td><span class="badge bg-danger">{{ totalSecteur }}</span></td>
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
/* Rend l'en-tête fixe */
#tableSect thead th {
  position: sticky;
  top: 0;
  z-index: 2;
  background: #fff;
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.15);
}

/* Réduction largeur colonne Doyenné */
#tableSect .col-doyenne {
  width: 45%;
}

/* Paroisse proche en taille */
#tableSect .col-paroisse {
  width: 40%;
}
</style>
