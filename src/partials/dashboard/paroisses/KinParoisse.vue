<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useServiceContext } from '@/composables/useServiceContext'

const { currentService } = useServiceContext()

// ==========================
// Déterminer le secteur actif
// ==========================
const sectorService = computed(() => currentService.value.position)
let sectorName = 'KIN EST'
if (sectorService.value === 'est') sectorName = 'KIN EST'
else if (sectorService.value === 'centre') sectorName = 'KIN CENTRE'
else if (sectorService.value === 'ouest') sectorName = 'KIN OUEST'

const descr = computed(() => currentService.value.description)

const API_URL = import.meta.env.VITE_API_BASE_URL
const token = localStorage.getItem('token')
const isLoading = ref(false)

// ==========================
// Données
// ==========================
const jeunes = ref([])
const paroisses = ref([])
const doyennes = ref([])
const sectorId = ref(null)

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

// Version alternative pour les endpoints sans paramètres
async function fetchAllWithPagination(baseUrl, pageParam = 'page', itemsPerPage = 100) {
  let allItems = [];
  let page = 1;
  let totalItems = 0;
  
  do {
    try {
      const url = `${baseUrl}${baseUrl.includes('?') ? '&' : '?'}${pageParam}=${page}&itemsPerPage=${itemsPerPage}`;
      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      
      const data = await response.json();
      
      if (data.member && Array.isArray(data.member)) {
        allItems = [...allItems, ...data.member];
        totalItems = data.member.length;
        page++;
      } else {
        break;
      }
    } catch (error) {
      console.error(`Erreur page ${page}:`, error);
      break;
    }
  } while (totalItems === itemsPerPage);
  
  return allItems;
}

// ==========================
// SSE
// ==========================
let eventSource = null

// ==========================
// Récupérer doyennés et paroisses
// ==========================
async function fetchSectorId() {
  isLoading.value = true
  try {
    const res = await fetch(`${API_URL}/sectors?name=${encodeURIComponent(sectorName)}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    const sec = data.member?.find(s => s.name === sectorName)
    if (sec) {
      sectorId.value = sec.id;
      await Promise.all([fetchDoyennes(), fetchParoisses()]);
    }
  } catch (err) {
    console.error("Erreur récupération secteur", err);
  } finally {
    isLoading.value = false
  }
}

async function fetchPeople() {
  isLoading.value = true
  try {
    // Utilisation de la pagination pour récupérer toutes les personnes
    const peopleData = await fetchAllPages(`${API_URL}/people`);
    
    jeunes.value = peopleData
      .filter(s => s.sector === `/api/sectors/${sectorId.value}`)
      .map(formatPerson) || []
    
    console.log('📊 Personnes chargées:', jeunes.value.length);
  } catch (err) {
    console.error('Erreur récupération des jeunes', err)
  } finally {
    isLoading.value = false
  }
}

async function fetchDoyennes() {
  try {
    // Utilisation de la pagination pour récupérer tous les doyennés
    const doyennesData = await fetchAllPages(`${API_URL}/doyennes`);
    doyennes.value = doyennesData.filter(s => s.sector === `/api/sectors/${sectorId.value}`) || [];
    console.log('📊 Doyennés chargés:', doyennes.value.length);
  } catch (err) {
    console.error("Erreur récupération doyennés", err);
  }
}

async function fetchParoisses() {
  try {
    // Utilisation de la pagination pour récupérer toutes les paroisses
    const paroissesData = await fetchAllPages(`${API_URL}/paroisses`);
    paroisses.value = paroissesData.filter(s => s.sector === `/api/sectors/${sectorId.value}`) || [];
    console.log('📊 Paroisses chargées:', paroisses.value.length);
  } catch (err) {
    console.error("Erreur récupération paroisses", err);
  }
}

// ==========================
// Récupérer personnes
// ==========================
function formatPerson(p) {
  let statut = 'Jeune'
  if (p.isDicoces) statut = 'Noyau diocésain'
  else if (p.isDecanal) statut = 'Noyau décanal'
  else if (p.isNoyau) statut = 'Noyau paroissial'

  const doyenne = doyennes.value.find(d => d['@id'] === p.doyenne)?.name || p.doyenne?.split('/').pop() || ''
  const paroisse = paroisses.value.find(pa => pa['@id'] === p.paroisse)?.name || p.paroisse?.split('/').pop() || ''

  return {
    id: p.id,
    doyenne,
    paroisse,
    nom: `${p.gender} ${p.fullName}`,
    tel: p.phoneNumber,
    statut
  }
}

// ==========================
// Montage / SSE
// ==========================
onMounted(async () => {
  window.App.init()
  window.App.dataTables()

  // Étape 1 : Charger le secteur et les structures associées
  await fetchSectorId()

  // ✅ Attendre que paroisses et doyennés soient bien chargées
  await new Promise(resolve => setTimeout(resolve, 500))

  // Étape 2 : Charger les jeunes après les structures
  await fetchPeople()

  // Étape 3 : Initialiser le SSE
  eventSource = new EventSource(`${API_URL.replace("/api","")}/sse/people`)
  eventSource.onmessage = (event) => {
    const data = JSON.parse(event.data)
    console.log("📥 Nouvel enregistrement :", data)

    if (data.sector?.includes(sectorId.value)) {
      jeunes.value.push(formatPerson(data))
    }
  }
  eventSource.onerror = (err) => {
    console.error("❌ SSE error", err)
    eventSource.close()
  }
})


onUnmounted(() => {
  if (eventSource) eventSource.close()
})

// ==========================
// Filtres
// ==========================
const filterDoyenne = ref('')
const filterParoisse = ref('')
const filterStatut = ref('')
const search = ref('')

// Options dynamiques
const doyenneOptions = computed(() => [...new Set(jeunes.value.map(j => j.doyenne))])
const paroisseOptions = computed(() => [...new Set(jeunes.value.map(j => j.paroisse))])

// Filtrage
const filteredJeunes = computed(() => {
  return jeunes.value.filter(j =>
    (!filterDoyenne.value || j.doyenne === filterDoyenne.value) &&
    (!filterParoisse.value || j.paroisse === filterParoisse.value) &&
    (!filterStatut.value || j.statut === filterStatut.value) &&
    (!search.value || j.nom.toLowerCase().includes(search.value.toLowerCase()))
  )
})

// Modal
const selectedJeune = ref(null)
function openModal(jeune) { selectedJeune.value = jeune }
function closeModal() { selectedJeune.value = null }

// Actualisation manuelle
async function handleRefresh() {
  isLoading.value = true
  try {
    await Promise.all([fetchSectorId(), fetchPeople()])
  } finally {
    isLoading.value = false
  }
}

</script>

<template>
  <div class="be-content">
    <div class="main-content container-fluid">
      <div class="row">
        <div class="col-sm-12">
          <div class="card card-table">
            <div class="card-header d-flex justify-content-between align-items-center">
              <span>{{ descr }}</span>
              <button 
                @click="handleRefresh" 
                class="btn btn-outline-primary btn-sm"
                :disabled="isLoading"
                title="Actualiser les données"
              >
                <i class="fas fa-sync-alt" :class="{ 'fa-spin': isLoading }"></i>
                {{ isLoading ? 'Actualisation...' : 'Actualiser' }}
              </button>
            </div>

            <!-- Filtres -->
            <div class="p-2 bg-white rounded shadow-sm">
              <div class="row g-2 row-cols-1 row-cols-sm-2 row-cols-md-4">
                <div class="col mb-1">
                  <select v-model="filterDoyenne" class="form-select p-1">
                    <option value="">Doyenné</option>
                    <option v-for="d in doyenneOptions" :key="d" :value="d">{{ d }}</option>
                  </select>
                </div>
                <div class="col">
                  <select v-model="filterParoisse" class="form-select p-1">
                    <option value="">Paroisse</option>
                    <option v-for="p in paroisseOptions" :key="p" :value="p">{{ p }}</option>
                  </select>
                </div>
                <div class="col">
                  <select v-model="filterStatut" class="form-select p-1">
                    <option value="">Statut</option>
                    <option value="Jeune">Jeune</option>
                    <option value="Noyau paroissial">Noyau paroissial</option>
                    <option value="Noyau décanal">Noyau décanal</option>
                    <option value="Noyau diocésain">Noyau diocésain</option>
                  </select>
                </div>
                <div class="col">
                  <input
                    v-model="search"
                    type="text"
                    class="form-control form-control-sm"
                    placeholder="🔍 Rechercher..."
                  />
                </div>
              </div>
            </div>

            <div class="card-body">
              <div class="table-container">
                <div v-if="isLoading" class="text-center my-5">
                  <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden"></span>
                  </div>
                  <p>Chargement des données...</p>
                </div>
                <table v-else class="table table-striped table-hover table-fw-widget" id="tableSect">
                  <thead>
                    <tr>
                      <th class="d-none d-md-table-cell">Doyennés</th>
                      <th>Paroisses</th>
                      <th>Jeunes</th>
                      <th>Téléphone</th>
                      <th>Statut</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr
                      v-for="jeune in filteredJeunes"
                      :key="jeune.id"
                      @click="openModal(jeune)"
                      style="cursor: pointer;"
                    >
                      <td class="d-none d-md-table-cell">{{ jeune.doyenne }}</td>
                      <td>{{ jeune.paroisse }}</td>
                      <td>{{ jeune.nom }}</td>
                      <td>{{ jeune.tel }}</td>
                      <td>
                        <span
                          class="badge"
                          :class="{
                            'bg-success': jeune.statut === 'Jeune',
                            'bg-primary text-white': jeune.statut === 'Noyau paroissial',
                            'bg-warning text-dark': jeune.statut === 'Noyau décanal',
                            'bg-danger text-white': jeune.statut === 'Noyau diocésain'
                          }"
                        >
                          {{ jeune.statut }}
                        </span>
                      </td>
                    </tr>
                    <tr v-if="filteredJeunes.length === 0">
                      <td colspan="5" class="text-center text-muted">Aucun résultat trouvé</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal infos jeune -->
    <div v-if="selectedJeune" class="modal fade show d-block" tabindex="-1" style="background: rgba(0,0,0,0.5);">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Infos du jeune</h5>
            <button type="button" class="btn-close" @click="closeModal"></button>
          </div>
          <div class="modal-body">
            <p><strong>Nom :</strong> {{ selectedJeune.nom }}</p>
            <p><strong>Doyenné :</strong> {{ selectedJeune.doyenne }}</p>
            <p><strong>Paroisse :</strong> {{ selectedJeune.paroisse }}</p>
            <p><strong>Téléphone :</strong> {{ selectedJeune.tel }}</p>
            <p>
              <strong>Statut : </strong>
              <span class="badge"
                :class="{
                  'bg-success text-white': selectedJeune.statut === 'Jeune',
                  'bg-primary text-white': selectedJeune.statut === 'Noyau paroissial',
                  'bg-warning text-white': selectedJeune.statut === 'Noyau décanal',
                  'bg-danger text-white': selectedJeune.statut === 'Noyau diocésain'
                }"
              >
                {{ selectedJeune.statut }}
              </span>
            </p>
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary" @click="closeModal">Fermer</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style>
.table-container {
  max-height: 40.5rem;
  overflow-y: auto;
  position: relative;
}

#tableSect thead th {
  position: sticky;
  top: 0;
  z-index: 2;
  background: #fff;
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.15);
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