<script setup>
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useServiceContext } from '@/composables/useServiceContext'
import axios from 'axios'
import { useToast } from 'vue-toastification';

const toast = useToast();

// === Contexte & infos ===
const router = useRouter()
const route = useRoute()
const { currentService, currentServiceType } = useServiceContext()

const pageTitle = computed(() => currentService.value.name)
const sectorName = computed(() => currentService.value.sectorName)
const composeRoute = computed(() => ({ name: 'composer', params: { serviceType: currentServiceType.value } }))
const descrip = computed(() => currentService.value.description)

const campId = computed(() => route.params.id_campBiblique || null)
const API = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api'
const campName = ref(''); // ✅ Nouveau ref pour le nom du camp

// === FONCTION PAGINATION OPTIMISÉE ===
async function fetchAllPages(baseUrl) {
  let allItems = [];
  let currentPage = 1;
  let hasMore = true;
  
  try {
    while (hasMore) {
      const url = `${baseUrl}${baseUrl.includes('?') ? '&' : '?'}page=${currentPage}`;
      
      const response = await axios.get(url);
      const data = response.data;
      
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
    
    console.log(`📊 ${baseUrl} - ${allItems.length} enregistrements chargés`);
    return allItems;
  } catch (error) {
    console.error(`Erreur lors de la récupération paginée de ${baseUrl}:`, error);
    throw error;
  }
}

// === Fetch du camp biblique via son ID ===
async function fetchCampName() {
  if (!campId.value) return;
  try {
    const res = await axios.get(`${API}/camp_bibliques/${campId.value}`);
    campName.value = res.data?.name || 'Camp inconnu';
  } catch (err) {
    console.error(err);
    toast.error('Impossible de récupérer le nom du camp', 'error');
    campName.value = 'Camp inconnu';
  }
}

// === Mettre à jour pageTitle ===
const title = computed(() => campName.value);


// === States principaux ===
const peopleOptions = ref([])        // objets { id, fullName, gender, raw }
const selectedPeople = ref([])       // objets { id, fullName, gender, raw }
const selectedDoyenne = ref(null)
const selectedParoisse = ref(null)
const montant = ref(0)
const devises = ref('usd')           // 'usd' | 'fc' (lié aux radios)
const sectorDoyennes = ref([])
const doyenneParoisses = ref([])
const logistics = ref([])
const participatorsAll = ref([])
const peopleAll = ref([])
const allDoyennes = ref([])
const allParoisses = ref([])
const allSectors = ref([])
const loading = ref(false)

// === Utils ===
const extractIdFromUrl = (url) => {
  if (!url && url !== 0) return null
  try { return String(url).split('/').pop() || null } catch { return null }
}
const resourceUrlFor = (entity, id) => id ? `${API}/${entity}/${id}` : null

// Exemple d'utilisation
if (!campId.value) {
  toast.error("L'activité n'a pas été retrouvée\nVeuillez contacter l'administrateur", 'error');
}

// === Computeds ===
const selectedDevise = computed(() => devises.value === 'usd' ? '$' : 'Fc')

const totalMount = computed(() => {
  const amount = Number(montant.value) || 0
  const total = amount * (selectedPeople.value.length || 0)
  return `${total}`
})

// === Fetch principal AVEC PAGINATION ===
async function fetchAll() {
  try {
    loading.value = true
    const [sectors, doyennes, paroisses, people, participators, logs] = await Promise.all([
      fetchAllPages(`${API}/sectors`),
      fetchAllPages(`${API}/doyennes`),
      fetchAllPages(`${API}/paroisses`),
      fetchAllPages(`${API}/people`),
      fetchAllPages(`${API}/participators`),
      fetchAllPages(`${API}/logistics`)
    ])

    peopleAll.value = people
    participatorsAll.value = participators
    logistics.value = logs
    allDoyennes.value = doyennes
    allParoisses.value = paroisses
    allSectors.value = sectors

    // doyennes du secteur courant
    const currentSector = allSectors.value.find(s => (s.name || '').toLowerCase() === (sectorName.value || '').toLowerCase())
    sectorDoyennes.value = allDoyennes.value.filter(d => extractIdFromUrl(d.sector) === extractIdFromUrl(currentSector?.['@id'] || currentSector?.id))

    if (!sectorDoyennes.value.length && currentSector) {
      sectorDoyennes.value = allDoyennes.value.filter(d => d.sector && String(d.sector).includes(`/sectors/${extractIdFromUrl(currentSector['@id'] || currentSector?.id)}`))
    }

    if (sectorDoyennes.value.length && !selectedDoyenne.value) {
      selectedDoyenne.value = extractIdFromUrl(sectorDoyennes.value[0]['@id'] || sectorDoyennes.value[0].id)
    }

    updateParoissesForDoyenne()
    buildPeopleOptions()

    await nextTick()
    try { if (window.App && typeof window.App.formMultiselect === 'function') window.App.formMultiselect(); } catch { return }
  } catch (err) {
    console.error(err)
    toast.error('Erreur lors de la récupération des données', 'error')
  } finally {
    loading.value = false
  }
}

// === Helpers ===
function updateParoissesForDoyenne() {
  if (!selectedDoyenne.value) {
    doyenneParoisses.value = []
    return
  }

  const doy = allDoyennes.value.find(d => extractIdFromUrl(d['@id'] || d.id) === selectedDoyenne.value)
  if (!doy) {
    doyenneParoisses.value = []
    return
  }

  const paroIds = (doy.paroisses || []).map(extractIdFromUrl)
  doyenneParoisses.value = allParoisses.value.filter(p => paroIds.includes(extractIdFromUrl(p['@id'] || p.id)))

  if (doyenneParoisses.value.length && !selectedParoisse.value)
    selectedParoisse.value = extractIdFromUrl(doyenneParoisses.value[0]['@id'] || doyenneParoisses.value[0].id)
}

function buildPeopleOptions() {
  const paroId = selectedParoisse.value
  if (!paroId) {
    peopleOptions.value = []
    return
  }

  // participants déjà enregistrés pour ce camp -> on les exclut
  const campParts = participatorsAll.value.filter(p =>
    (p.campBiblic || []).some(u => extractIdFromUrl(u) == campId.value)
  )
  const excludedIds = new Set(campParts.map(p => extractIdFromUrl(p.person)).filter(Boolean))

  // ids déjà sélectionnés (pour éviter doublons dans la liste disponible)
  const selectedIds = new Set(selectedPeople.value.map(p => String(p.id)))

  peopleOptions.value = peopleAll.value
    .filter(p => {
      const pid = extractIdFromUrl(p.paroisse?.['@id'] || p.paroisse?.id || p.paroisse)
      if (!pid) return false
      if (String(pid) !== String(paroId)) return false
      const id = extractIdFromUrl(p['@id'] || p.id)
      if (!id) return false
      if (excludedIds.has(String(id))) return false
      if (selectedIds.has(String(id))) return false
      return true
    })
    .map(p => ({
      id: extractIdFromUrl(p['@id'] || p.id),
      fullName: p.fullName || `${p.firstName || ''} ${p.lastName || ''}`.trim(),
      gender: p.gender || 'Autre',
      raw: p
    }))
    // ✅ trier par ordre alphabétique sur fullName
    .sort((a, b) => a.fullName.localeCompare(b.fullName))

  console.log(`👥 ${peopleOptions.value.length} personnes disponibles pour la paroisse sélectionnée`)
}

// === Déplacements via change (plus fiable que @click sur <option>) ===
function onAddFromLeft(e) {
  const select = e.target
  const values = Array.from(select.selectedOptions).map(o => o.value)
  if (!values.length) return
  // ordonner et ajouter
  for (const id of values) {
    const idx = peopleOptions.value.findIndex(p => String(p.id) === String(id))
    if (idx !== -1) {
      selectedPeople.value.push(peopleOptions.value[idx])
      peopleOptions.value.splice(idx, 1)
    }
  }
  // clear selection in the select element
  select.selectedIndex = -1
}

function onRemoveFromRight(e) {
  const select = e.target
  const values = Array.from(select.selectedOptions).map(o => o.value)
  if (!values.length) return
  for (const id of values) {
    const idx = selectedPeople.value.findIndex(p => String(p.id) === String(id))
    if (idx !== -1) {
      // restore to available list
      const personObj = selectedPeople.value[idx]
      // avoid duplicate in available
      if (!peopleOptions.value.find(p => String(p.id) === String(personObj.id))) {
        peopleOptions.value.push(personObj)
      }
      selectedPeople.value.splice(idx, 1)
    }
  }
  // clear selection
  select.selectedIndex = -1
}

// helper random dorm/carrefour assignment respecting limits
function allocateLogistics(parishId, gender, parishAssignments) {
  const logisticsForCamp = logistics.value.find(l => extractIdFromUrl(l.cb) == campId.value);
  const maxFr = logisticsForCamp?.dortoirFrere || 0;
  const maxSr = logisticsForCamp?.dortoirSoeur || 0;
  const maxCar = logisticsForCamp?.carrefour || 0;

  parishAssignments[parishId] = parishAssignments[parishId] || { frere: [], soeur: [], carrefour: [] };

  const allocate = (usedArray, max) => {
    const available = [];
    for (let i = 1; i <= max; i++) if (!usedArray.includes(i)) available.push(i);
    if (available.length) return available[Math.floor(Math.random() * available.length)];
    return Math.floor(Math.random() * max) + 1; // fallback si tous pris
  };

  if (gender.toLowerCase().includes('fr')) {
    const dortoir = allocate(parishAssignments[parishId].frere, maxFr);
    parishAssignments[parishId].frere.push(dortoir);

    const carrefour = allocate(parishAssignments[parishId].carrefour, maxCar);
    parishAssignments[parishId].carrefour.push(carrefour);

    return { dortoir: `${dortoir}`, carrefour: `${carrefour}` };
  } else {
    const dortoir = allocate(parishAssignments[parishId].soeur, maxSr);
    parishAssignments[parishId].soeur.push(dortoir);

    const carrefour = allocate(parishAssignments[parishId].carrefour, maxCar);
    parishAssignments[parishId].carrefour.push(carrefour);

    return { dortoir: `${dortoir}`, carrefour: `${carrefour}` };
  }
}

async function handleSubmit(e) {
  e.preventDefault();
  if (!campId.value) {
    toast.error("L'activité n'a pas été retrouvée\nVeuillez contacter l'administrateur", 'error');
    return;
  }

  const unit = Number(montant.value) || 0;
  if (unit <= 0) {
    toast.error('Le montant unitaire doit être supérieur à 0', 'error');
    return;
  }
  if (!selectedPeople.value.length) {
    toast.error('Aucune personne sélectionnée', 'error');
    return;
  }

  loading.value = true;
  const parishAssignments = {};
  const createdParticipators = [];

  try {
    for (let personObj of selectedPeople.value) {
      // id paroisse de la personne
      const parishIdOfPerson = extractIdFromUrl(personObj.raw.paroisse?.['@id'] || personObj.raw.paroisse?.id || '') || selectedParoisse.value;

      // allocation dortoir/carrefour
      const alloc = allocateLogistics(parishIdOfPerson, personObj.gender, parishAssignments);

      // === 1. Créer le participator (sans montant d'abord)
      const participatorPayload = {
        campBiblic: [ `/api/camp_bibliques/${campId.value}` ],
        person: `/api/people/${personObj.id}`,
        carrefour: alloc.carrefour || '',
        dortoir: alloc.dortoir || '',
        removals: [],
        badge: false
      };
      const createPartRes = await axios.post(`${API}/participators`, participatorPayload, {
        headers: { "Content-Type": "application/ld+json" }
      });

      const created = createPartRes.data;
      const createdId = extractIdFromUrl(created['@id'] || created.id);
      const createdUrl = created['@id'] || `${API}/participators/${createdId}`;
      createdParticipators.push({ id: createdId, url: createdUrl });

      // === 2. Créer le montant en liant ce participator
      const montantPayload = {
        campBiblic: [ `/api/camp_bibliques/${campId.value}` ],
        participator: createdUrl,
        devise: selectedDevise.value === '$' ? '$' : selectedDevise.value,
        frais: unit,
        status: 'Access CB',
        createdAt: new Date().toISOString()
      };

      const montantRes = await axios.post(`${API}/montants`, montantPayload, {
        headers: { "Content-Type": "application/ld+json" }
      });

      const createdMontant = montantRes.data;
      const montantId = extractIdFromUrl(createdMontant['@id'] || createdMontant.id);

      // === 3. Patch participator pour ajouter le montant
      await axios.patch(`${API}/participators/${createdId}`, {
        montant: `/api/montants/${montantId}`
      }, { headers: { "Content-Type": "application/merge-patch+json" } });
    }

    toast.success(`Enregistrement terminé : ${createdParticipators.length} participant(s) créé(s)`, 'success');
    await fetchAll();
    selectedPeople.value = [];
  } catch (err) {
    console.error(err);
    toast.error('Erreur lors de l\'enregistrement. Veillez ressayer', 'error');
  } finally {
    loading.value = false;
  }
}

// === Watchers ===
watch(selectedDoyenne, () => {
  updateParoissesForDoyenne()
  buildPeopleOptions()
})
watch(selectedParoisse, buildPeopleOptions)
watch(peopleAll, buildPeopleOptions)

// === Init ===
onMounted(() => {
  fetchCampName();
  fetchAll(); // tu conserves ton fetch principal
});
</script>

<template>
    <div class="be-content">
        <div class="page-head">
          <h2 class="page-head-title">{{ title }}</h2>
          <nav aria-label="breadcrumb" role="navigation">
            <ol class="breadcrumb page-head-nav">
              <li class="breadcrumb-item"><router-link :to="{ name: 'dashboard' }">Dashboard</router-link></li>
              <li class="breadcrumb-item"><a href="#">Paiement par paroisse</a></li>
              <li class="breadcrumb-item active">{{ pageTitle }}</li>
            </ol>
          </nav>
        </div>
        <div class="main-content container-fluid">
          <form class="row" @submit.prevent="handleSubmit">
            <div class="col-lg-6">
              <div class="card card-border-color card-border-color-primary">
                <div class="card-body">
                    <!-- Choix devise -->
                    <div class="form-group row pt-3">
                      <label class="col-12 col-sm-3 col-form-label text-sm-right pt-4">
                        Sélectionner la devise
                      </label>
                      <div class="col-12 col-sm-8 col-lg-6">
                        <div class="form-check form-check-inline">
                          <label class="custom-control custom-radio custom-radio-icon custom-control-inline">
                            <input
                              class="custom-control-input"
                              type="radio"
                              value="usd"
                              v-model="devises"
                            />
                            <span
                              class="custom-control-label flex items-center justify-center"
                              style="font-weight: bold; font-size: 2.1rem"
                            >
                              $
                            </span>
                          </label>
                          <label class="custom-control custom-radio custom-radio-icon custom-control-inline">
                            <input
                              class="custom-control-input"
                              type="radio"
                              value="fc"
                              v-model="devises"
                            />
                            <span
                              class="custom-control-label flex items-center justify-center"
                              style="font-weight: bold; font-size: 2.1rem"
                            >
                              Fc
                            </span>
                          </label>
                        </div>
                      </div>
                    </div>
                    <!-- Montant par personne -->
                    <div class="form-group pt-2">
                      <label>Entrer le montant par personne</label>
                      <div class="input-group mb-3">
                        <input
                          id="mount"
                          class="form-control"
                          type="number"
                          v-model="montant"
                        />
                        <div class="input-group-append">
                          <span class="input-group-text">{{ selectedDevise }}</span>
                        </div>
                      </div>
                    </div>
                    <!-- Choix doyenné -->
                    <div class="form-group pt-2">
                      <label>Sélectionner le doyenné</label>
                      <select class="form-control" v-model="selectedDoyenne">
                        <option 
                          v-for="d in sectorDoyennes" 
                          :key="d['@id'] || d.id" 
                          :value="extractIdFromUrl(d['@id'] || d.id)">
                          {{ d.name }}
                        </option>
                      </select>
                    </div>

                    <!-- Choix paroisse -->
                    <div class="form-group pt-2">
                      <label>Sélectionner la paroisse</label>
                      <select class="form-control" v-model="selectedParoisse">
                        <option 
                          v-for="p in doyenneParoisses" 
                          :key="p['@id'] || p.id" 
                          :value="extractIdFromUrl(p['@id'] || p.id)">
                          {{ p.name }}
                        </option>
                      </select>
                    </div>
                </div>
              </div>
            </div>

            <div class="col-lg-6">
              <div class="card card-border-color card-border-color-primary">
                <div class="card-body">
                  <div class="row mb-2">
                  <!-- Liste disponible -->
                  <div class="col">
                    <label>Personnes disponibles</label>
                    <select multiple class="form-control" style="height:200px" @change="onAddFromLeft">
                      <option 
                        v-for="p in peopleOptions" 
                        :key="p.id" 
                        :value="p.id">
                        {{ p.gender }} {{ p.fullName }}
                      </option>
                    </select>
                    <small class="text-muted">Clique pour ajouter →</small>
                    <div class="mt-1 text-muted small">
                      {{ peopleOptions.length }} personne(s) disponible(s)
                    </div>
                  </div>

                  <!-- Liste choisie -->
                  <div class="col">
                    <label>Personnes sélectionnées</label>
                    <select multiple class="form-control" style="height:200px" @change="onRemoveFromRight">
                      <option 
                        v-for="p in selectedPeople" 
                        :key="p.id" 
                        :value="p.id">
                        {{ p.gender }} {{ p.fullName }}
                      </option>
                    </select>
                    <small class="text-muted">← Clique pour retirer</small>
                    <div class="mt-1 text-muted small">
                      {{ selectedPeople.length }} personne(s) sélectionnée(s)
                    </div>
                  </div>
                </div>
                  <div class="form-group">
                    <label>Montant total</label>
                    <div class="input-group">
                          <input 
                          readonly="readonly" 
                          id='totalMount' 
                          :value="totalMount" 
                          class="form-control" 
                          type="text"
                          >
                      <div class="input-group-append"><span class="input-group-text">{{ selectedDevise }}</span></div>
                    </div>
                  </div>
                  <!-- Boutons -->
                  <div class="row pt-3">
                    <div class="col-12 d-flex justify-content-end">
                      <button class="btn btn-secondary mr-4" type="button" @click="router.back()">Retour</button>
                      <button 
                        class="btn btn-primary" 
                        type="submit" 
                        :disabled="loading || selectedPeople.length === 0"
                      >
                        <span
                          v-if="loading"
                          class="spinner-border spinner-border-sm mx-5"
                          role="status"
                        ></span>
                        <span v-else>Enregistrer ({{ selectedPeople.length }})</span>
                      </button>
                    </div>
                </div>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
</template>

<style scoped>
/* Styles pour les toasts dynamiques */
#cg-toast-container { font-family: system-ui, Arial, sans-serif; }
.cg-toast { min-width: 220px; max-width: 360px; font-weight: 500; padding: 10px 16px; border-radius: 6px; margin-bottom: 8px; }
.cg-toast-success { background: #effff0; color: #2e7d32; }
.cg-toast-error   { background: #ffefef; color: #d32f2f; }

.text-muted.small {
  font-size: 0.875rem;
}
</style>