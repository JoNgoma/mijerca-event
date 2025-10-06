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

// ==========================
// Données
// ==========================
const jeunes = ref([])
const paroisses = ref([])
const doyennes = ref([])
const sectorId = ref(null)

// ==========================
// SSE
// ==========================
let eventSource = null

// ==========================
// Récupérer doyennés et paroisses
// ==========================
async function fetchSectorId() {
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
  }
}

async function fetchDoyennes() {
  try {
    const res = await fetch(`${API_URL}/doyennes`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    doyennes.value = data.member?.filter(s => s.sector === `/api/sectors/${sectorId.value}`) || [];
  } catch (err) {
    console.error("Erreur récupération doyennés", err);
  }
}

async function fetchParoisses() {
  try {
    const res = await fetch(`${API_URL}/paroisses`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    paroisses.value = data.member?.filter(s => s.sector === `/api/sectors/${sectorId.value}`) || [];
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

async function fetchPeople() {
  try {
    const res = await fetch(`${API_URL}/people`, { headers: { Authorization: `Bearer ${token}` } })
    const data = await res.json()
    jeunes.value = data.member
      ?.filter(s => s.sector === `/api/sectors/${sectorId.value}`)
      .map(formatPerson) || []
  } catch (err) {
    console.error('Erreur récupération des jeunes', err)
  }
}

// ==========================
// Montage / SSE
// ==========================
onMounted(async () => {
  window.App.init();
  window.App.dataTables();

  await fetchSectorId()
  await fetchPeople()

  // SSE
  eventSource = new EventSource(`${API_URL.replace("/api","")}/sse/people`)
  eventSource.onmessage = (event) => {
    const data = JSON.parse(event.data)
    console.log("📥 Nouvel enregistrement :", data)

    // Ajouter à la liste si c'est pour ce secteur
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

</script>

<template>
  <div class="be-content">
    <div class="main-content container-fluid">
      <div class="row">
        <div class="col-sm-12">
          <div class="card card-table">
            <div class="card-header">
              {{ descr }}
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
              <div style="max-height: 40.5rem; overflow-y: auto;">
                <table class="table table-striped table-hover table-fw-widget" id="tableSect">
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
              <strong>Statut :</strong>
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
#tableSect thead th {
  position: sticky;
  top: 0;
  z-index: 2;
  background: #fff;
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.15);
}
</style>
