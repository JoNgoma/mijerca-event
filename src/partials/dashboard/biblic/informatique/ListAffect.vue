<script setup>
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import axios from 'axios'
import { useToast } from 'vue-toastification'
import { useRouter } from "vue-router";

const router = useRouter()
const toast = useToast()

const props = defineProps({
  id: { type: [String, Number], required: true },
  date: { type: String, required: true },
})

// ==========================
// FORMATAGE DU NOM COMPLET AVANCÉ
// ==========================
const formatFullName = (fullName) => {
  if (!fullName) return '';
  
  const lowerCaseWords = ['de', 'du', 'des', 'le', 'la', 'les', 'et', 'à', 'aux', 'en', 'sur', 'sous', 'dans', 'von', 'van'];
  
  const specialCases = {
    'mcdonald': 'McDonald',
    'macdonald': 'MacDonald',
    'o\'connor': 'O\'Connor',
    'd\'artagnan': 'D\'Artagnan',
    'de la': 'De La',
    'van der': 'Van Der',
    'de l\'': 'De L\'',
    'des ': 'Des ',
    'du ': 'Du ',
    'del ': 'Del '
  };
  
  let formatted = fullName.toLowerCase().trim();
  
  Object.entries(specialCases).forEach(([key, value]) => {
    if (formatted.startsWith(key)) {
      formatted = value + formatted.slice(key.length);
    }
  });
  
  const words = formatted.split(/\s+/);
  
  const resultWords = words.map((word, index) => {
    if (index === 0) {
      return word.charAt(0).toUpperCase() + word.slice(1);
    }
    
    if (lowerCaseWords.includes(word.toLowerCase())) {
      if (index < words.length - 1 && words[index + 1].length > 2) {
        return word.toLowerCase();
      }
    }
    
    return word.charAt(0).toUpperCase() + word.slice(1);
  });
  
  let result = resultWords.join(' ');
  
  result = result.replace(/-\s*/g, '-').replace(/([a-z])-([a-z])/gi, (match, p1, p2) => {
    return p1.toUpperCase() + '-' + p2.toUpperCase();
  });
  
  result = result.replace(/'\s*/g, '\'').replace(/([a-z])'([a-z])/gi, (match, p1, p2) => {
    return p1.toUpperCase() + '\'' + p2.toUpperCase();
  });
  
  return result;
};

// ==========================
// PAGINATION OPTIMISÉE
// ==========================
const token = localStorage.getItem('token')

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
// États et données
// ==========================
const loading = ref(false)
const selectedDoyenne = ref('Tous')
const selectedParoisseId = ref(null)

const allSectors = ref([])
const allDoyennes = ref([])
const allParoisses = ref([])
const allPeople = ref([])
const allParticipators = ref([])
const allMontants = ref([])
const allUsers = ref([])
const allAdministrations = ref([])
const allFinances = ref([])
const allInformatiques = ref([])
const allHebergements = ref([])

const viewParoisses = ref([])

// Sélection des jeunes
const selectedJeunes = ref([])
const allSelected = ref(false)
const showJeunesModal = ref(false)
const currentParoisse = ref(null)

// ==========================
// Fonctions utilitaires
// ==========================
function extractIdFromUrl(url) {
  if (!url) return null
  const parts = String(url).split('/').filter(Boolean)
  return parts.pop()
}

const API = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api'

// ==========================
// Vérifier si une personne est responsable et obtenir son service
// ==========================
const getPersonServiceInfo = (person) => {
  if (!person) return { isResponsable: false, serviceLabel: '' }
  
  // Vérifier si la personne est diocésaine
  if (person.isDicoces) {
    return { isResponsable: true, serviceLabel: 'Service Diocésain' }
  }
  
  const personId = extractIdFromUrl(person['@id'])
  let serviceLabel = ''
  let isResponsable = false
  
  // Vérifier si la personne est dans les administrations
  const isInAdministration = allAdministrations.value.some(admin => {
    const adminUserIds = (admin.user || []).map(userUrl => extractIdFromUrl(userUrl))
    return adminUserIds.some(userId => {
      const user = allUsers.value.find(u => extractIdFromUrl(u['@id']) === userId)
      if (user && extractIdFromUrl(user.person) === personId) {
        serviceLabel = 'Commission Administration'
        isResponsable = true
        return true
      }
      return false
    })
  })
  
  // Vérifier si la personne est dans les finances
  const isInFinance = allFinances.value.some(finance => {
    const financeUserIds = (finance.user || []).map(userUrl => extractIdFromUrl(userUrl))
    return financeUserIds.some(userId => {
      const user = allUsers.value.find(u => extractIdFromUrl(u['@id']) === userId)
      if (user && extractIdFromUrl(user.person) === personId) {
        serviceLabel = 'Commission Administration - Finances'
        isResponsable = true
        return true
      }
      return false
    })
  })
  
  // Vérifier si la personne est dans les informatiques
  const isInInformatique = allInformatiques.value.some(info => {
    const infoUserIds = (info.user || []).map(userUrl => extractIdFromUrl(userUrl))
    return infoUserIds.some(userId => {
      const user = allUsers.value.find(u => extractIdFromUrl(u['@id']) === userId)
      if (user && extractIdFromUrl(user.person) === personId) {
        serviceLabel = 'Commission Secrétariat'
        isResponsable = true
        return true
      }
      return false
    })
  })
  
  // Vérifier si la personne est dans les hébergements
  const isInHebergement = allHebergements.value.some(heb => {
    const hebUserIds = (heb.user || []).map(userUrl => extractIdFromUrl(userUrl))
    return hebUserIds.some(userId => {
      const user = allUsers.value.find(u => extractIdFromUrl(u['@id']) === userId)
      if (user && extractIdFromUrl(user.person) === personId) {
        serviceLabel = 'Commission Hébergement'
        isResponsable = true
        return true
      }
      return false
    })
  })
  
  // Si la personne est responsable mais n'est dans aucun service spécifique
  if (isResponsable && !serviceLabel) {
    serviceLabel = 'Service Diocésain'
  }
  
  return { isResponsable, serviceLabel }
}

// ==========================
// Chargement des données avec pagination
// ==========================
async function fetchData() {
  try {
    loading.value = true
    
    const [
      doyennesRes,
      paroissesRes,
      peopleRes,
      participatorsRes,
      sectorsRes,
      montantsRes,
      usersRes,
      administrationsRes,
      financesRes,
      informatiquesRes,
      hebergementsRes,
    ] = await Promise.all([
      fetchAllPages(`${API}/doyennes`),
      fetchAllPages(`${API}/paroisses`),
      fetchAllPages(`${API}/people`),
      fetchAllPages(`${API}/participators`),
      fetchAllPages(`${API}/sectors`),
      fetchAllPages(`${API}/montants`),
      fetchAllPages(`${API}/users`),
      fetchAllPages(`${API}/administrations`),
      fetchAllPages(`${API}/finances`),
      fetchAllPages(`${API}/informatiques`),
      fetchAllPages(`${API}/hebergements`),
    ])

    allDoyennes.value = doyennesRes || []
    allParoisses.value = paroissesRes || []
    allPeople.value = peopleRes || []
    allParticipators.value = participatorsRes || []
    allSectors.value = sectorsRes || []
    allMontants.value = montantsRes || []
    allUsers.value = usersRes || []
    allAdministrations.value = administrationsRes || []
    allFinances.value = financesRes || []
    allInformatiques.value = informatiquesRes || []
    allHebergements.value = hebergementsRes || []

    aggregateParoisses()
  } catch (err) {
    console.error('Erreur fetchData:', err)
    toast.error('Erreur lors de la récupération des données')
  } finally {
    loading.value = false
  }
}

function aggregateParoisses() {
  const agg = {}

  allParticipators.value.forEach(part => {
    const person = allPeople.value.find(
      pe => pe['@id'] === part.person || extractIdFromUrl(pe['@id']) === extractIdFromUrl(part.person)
    )
    if (!person) return

    const paro = allParoisses.value.find(
      pa => pa['@id'] === person.paroisse || extractIdFromUrl(pa['@id']) === extractIdFromUrl(person.paroisse)
    )
    if (!paro) return

    const sectorId = extractIdFromUrl(paro.sector)
    if (String(sectorId) !== String(props.id)) return

    const doy = allDoyennes.value.find(
      d => d['@id'] === paro.doyenne || extractIdFromUrl(d['@id']) === extractIdFromUrl(paro.doyenne)
    )
    const paroId = paro['@id'] || `/api/paroisses/${paro.id}`
    if (!agg[paroId]) {
      agg[paroId] = {
        id: paroId,
        nom: paro.name || '—',
        doyenne: doy ? doy['@id'] : 'Non défini',
        doyenneName: doy?.name || 'Non défini',
        effectif: 0,
        montantUSD: 0,
        montantFC: 0,
      }
    }

    const montantRecord = allMontants.value.find(m =>
      m.participator === part['@id'] ||
      extractIdFromUrl(m.participator) === extractIdFromUrl(part['@id'])
    )

    const devise = (montantRecord?.devise || 'FC').toUpperCase()
    const montant = Number(montantRecord?.frais || 0)

    agg[paroId].effectif += 1
    if (devise === 'USD' || devise === '$') agg[paroId].montantUSD += montant
    else agg[paroId].montantFC += montant
  })

  viewParoisses.value = Object.values(agg)
}

const doyennesBySector = computed(() => {
  const doyenneIds = new Set(
    allParoisses.value
      .filter(p => p.sector && extractIdFromUrl(p.sector) === String(props.id))
      .map(p => extractIdFromUrl(p.doyenne))
      .filter(Boolean)
  )
  return allDoyennes.value.filter(d => doyenneIds.has(extractIdFromUrl(d['@id'])))
})

const filteredParoisses = computed(() => {
  if (selectedDoyenne.value === 'Tous') return viewParoisses.value
  return viewParoisses.value.filter(p => p.doyenne === selectedDoyenne.value)
})

const countDoyennes = computed(() => new Set(filteredParoisses.value.map(p => p.doyenne)).size)
const countParoisses = computed(() => filteredParoisses.value.length)
const totalEffectifFiltre = computed(() => filteredParoisses.value.reduce((a, p) => a + (p.effectif || 0), 0))

// ==========================
// Gestion des sélections de paroisses et jeunes
// ==========================
async function selectParoisse(paroId) {
  selectedParoisseId.value = paroId
  currentParoisse.value = viewParoisses.value.find(p => p.id === paroId)
  if (window.innerWidth < 768) {
    await nextTick()
    showJeunesModal.value = true
  }
  
  selectedJeunes.value = []
  allSelected.value = false
}

// ==========================
// Préparation des jeunes par paroisse avec formatage des noms
// ==========================
const jeunesParParoisse = computed(() => {
  const result = {}
  if (!selectedParoisseId.value) return result

  const jeunes = []

  allParticipators.value.forEach(part => {
    const person = allPeople.value.find(
      pe => pe['@id'] === part.person || extractIdFromUrl(pe['@id']) === extractIdFromUrl(part.person)
    )
    if (!person) return

    const personParoId = person.paroisse
    const match =
      personParoId === selectedParoisseId.value ||
      extractIdFromUrl(personParoId) === extractIdFromUrl(selectedParoisseId.value)
    if (!match) return

    const montantRecord = allMontants.value.find(m =>
      m.participator === part['@id'] ||
      extractIdFromUrl(m.participator) === extractIdFromUrl(part['@id'])
    )

    const paroisseObj = allParoisses.value.find(
      p => p['@id'] === person.paroisse || extractIdFromUrl(p['@id']) === extractIdFromUrl(person.paroisse)
    )

    const devise = (montantRecord?.devise || 'FC').toUpperCase()
    const frais = Number(montantRecord?.frais || 0)

    const formattedFullName = formatFullName(person.fullName)
    const { isResponsable, serviceLabel } = getPersonServiceInfo(person)

    const jeune = {
      id: part.id,
      paroisse: paroisseObj ? paroisseObj.name : 'Non définie',
      nom: `${person.gender} ${formattedFullName}`.trim() || '—',
      fullName: formattedFullName,
      dortoir: part.dortoir || '',
      carrefour: part.carrefour || '',
      arrivee: new Date(part.createdAt || props.date).toLocaleDateString('fr-FR'),
      badge: part.badge === true,
      montantFormatted: `${frais.toLocaleString('fr-FR')} ${devise}`,
      personId: extractIdFromUrl(person['@id']),
      isResponsable: isResponsable,
      serviceLabel: person.isDicoces ? 'Service Diocésain' : serviceLabel,
    }
    jeunes.push(jeune)
  })

  jeunes.sort((a, b) => a.fullName.localeCompare(b.fullName))
  result[selectedParoisseId.value] = jeunes
  return result
})

// ==========================
// Gestion de la sélection des jeunes
// ==========================
function toggleSelectAll() {
  const list = jeunesParParoisse.value[selectedParoisseId.value] || []
  if (allSelected.value) {
    selectedJeunes.value = list.map(j => j.id)
  } else {
    selectedJeunes.value = []
  }
}

function toggleSingleSelection() {
  const list = jeunesParParoisse.value[selectedParoisseId.value] || []
  allSelected.value = selectedJeunes.value.length === list.length
}

function toggleJeuneSelection(id) {
  const index = selectedJeunes.value.indexOf(id)
  if (index === -1) {
    selectedJeunes.value.push(id)
  } else {
    selectedJeunes.value.splice(index, 1)
  }
  toggleSingleSelection()
}

// ==========================
// Impression
// ==========================
function goToPrint() {
  const paroisseId = selectedParoisseId.value;
  const list = jeunesParParoisse.value[paroisseId] || [];
  
  const selectedPersons = list.filter(j => selectedJeunes.value.includes(j.id));

  // Sauvegarder avec toutes les informations nécessaires pour les badges
  const personsData = selectedPersons.map(p => ({
    id: p.id,
    nom: p.nom,
    paroisse: p.paroisse,
    dortoir: p.dortoir,
    carrefour: p.carrefour,
    isResponsable: p.isResponsable,
    // Ajouter les champs supplémentaires nécessaires
    prenom: p.prenom,
    service: p.serviceLabel || p.service || '',
    isDicoces: p.isDecoces || false,
    // Champ isDecoces pour compatibilité avec la logique des badges
    isDecoces: p.isDecoces || false
  }));
  
  sessionStorage.setItem("selectedPersonsForBadges", JSON.stringify(personsData));

  router.push({ name: "info-a4-generator", params: { serviceType: 'a4-generator' } });
}

// ==========================
// Watchers et lifecycle hooks
// ==========================
watch(selectedDoyenne, () => {
  selectedParoisseId.value = null
  selectedJeunes.value = []
  allSelected.value = false
})

onMounted(fetchData)
</script>

<template>
  <div class="tab-pane" :id="id" role="tabpanel">
    <div v-if="loading" class="text-center my-5">
      <span class="spinner-border"></span> 
      <p class="mt-2">Chargement des données...</p>
    </div>

    <div v-else class="row g-3">
      <!-- Liste des paroisses -->
      <div class="col-12 col-lg-6">
        <div class="card card-table shadow-sm">
          <div class="card-header bg-light fw-semibold d-flex justify-content-between align-items-center mx-2">
            <span>Distribution badges</span>
            <select class="form-select form-select-sm" v-model="selectedDoyenne">
              <option value="Tous">Tous les doyennés</option>
              <option v-for="d in doyennesBySector" :key="d['@id']" :value="d['@id']">{{ d.name }}</option>
            </select>
          </div>

          <div class="table-container">
            <table class="table table-striped table-borderless align-middle">
              <thead class="table-light">
                <tr>
                  <th>Doyenné</th>
                  <th>Paroisse</th>
                  <th>Effectif</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="p in filteredParoisses"
                  :key="p.id"
                  @click="selectParoisse(p.id)"
                  :class="['selectable-row', { active: p.id === selectedParoisseId }]"
                >
                  <td>{{ p.doyenneName }}</td>
                  <td>{{ p.nom }}</td>
                  <td>{{ p.effectif || 0 }}</td>
                </tr>
                <tr v-if="!filteredParoisses.length">
                  <td colspan="3" class="text-center text-muted">Aucune activité trouvée</td>
                </tr>
              </tbody>
              <tfoot class="table-light fw-semibold">
                <tr>
                  <td>{{ countDoyennes }} Doyenné{{ countDoyennes>1?'s':'' }}</td>
                  <td>{{ countParoisses }} Paroisse{{ countParoisses>1?'s':'' }}</td>
                  <td>{{ totalEffectifFiltre }}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>

      <!-- Participants -->
      <div class="col-12 col-lg-6 d-none d-lg-block">
        <div class="card card-table shadow-sm">
          <div class="card-header bg-light fw-semibold mx-2 d-flex justify-content-between align-items-center">
            <span v-if="selectedParoisseId" class="text-primary">
              {{ viewParoisses.find(x => x.id === selectedParoisseId)?.nom }}
              <small class="text-muted ms-2">
                ({{ jeunesParParoisse[selectedParoisseId]?.length || 0 }} jeunes)
              </small>
            </span>

            <div v-if="selectedParoisseId" class="form-check d-flex align-items-center gap-2 m-0">
              <input 
                class="form-check-input mr-2" 
                type="checkbox" 
                v-model="allSelected" 
                @change="toggleSelectAll" 
                id="selectAll"
              />
              <label class="form-check-label m-0" for="selectAll">
                Tout sélectionner
              </label>
            </div>
          </div>

          <div class="table-container">
            <table class="table table-hover align-middle">
              <thead class="table-light">
                <tr>
                  <th style="width: 40px;"></th>
                  <th>Noms</th>
                  <th>Dortoir</th>
                  <th>Carrefour</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="!selectedParoisseId">
                  <td colspan="5" class="text-center text-muted">Aucune paroisse sélectionnée</td>
                </tr>

                <tr
                  v-else
                  v-for="j in jeunesParParoisse[selectedParoisseId] || []"
                  :key="j.id"
                  :class="{ 'table-active': selectedJeunes.includes(j.id) }"
                  @click="toggleJeuneSelection(j.id)"
                  style="cursor: pointer;"
                >
                  <td>
                    <input 
                      type="checkbox" 
                      :checked="selectedJeunes.includes(j.id)"
                      @change.stop="() => toggleJeuneSelection(j.id)"
                    />
                  </td>
                  <td>{{ j.nom }}</td>
                  <td>{{ j.dortoir }}</td>
                  <td>{{ j.carrefour }}</td>
                  <td>
                    <span
                      class="badge"
                      :style="{ backgroundColor: j.badge ? 'green' : '#FFC107', color: 'white' }"
                    >
                      {{ j.badge ? 'Imprimé' : 'En attente' }}
                    </span>
                  </td>
                </tr>

                <tr v-if="selectedParoisseId && !(jeunesParParoisse[selectedParoisseId] || []).length">
                  <td colspan="5" class="text-center text-muted">Aucun jeune pour cette paroisse</td>
                </tr>
              </tbody>
            </table>
          </div>
          
          <div class="card-footer bg-light border-top">
            <div class="d-flex justify-content-between align-items-center">
              <small class="text-muted">
                {{ selectedJeunes.length }} jeune{{ selectedJeunes.length > 1 ? 's' : '' }} sélectionné{{ selectedJeunes.length > 1 ? 's' : '' }}
              </small>
              <button 
                v-if="selectedJeunes.length" 
                class="btn btn-primary btn-sm"
                @click="goToPrint"
              >
                <span class="icon mdi mdi-print mr-2"></span>
                Imprimer
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.table-container { 
  max-height: 30rem; 
  overflow-y: auto; 
  position: relative;
}

.selectable-row { 
  cursor: pointer; 
  transition: background-color 0.2s;
}

.selectable-row:hover { 
  background-color: #f8f9fa; 
}

.selectable-row.active { 
  background-color: #e6f0ff; 
  font-weight: 600; 
}

.badge { 
  border-radius: 4px; 
  padding: 0.35em 0.75em; 
  font-size: 0.85rem; 
}

thead th {
  position: sticky;
  top: 0;
  z-index: 10;
  background: #f8f9fa;
}

.spinner-border {
  width: 3rem;
  height: 3rem;
}
</style>