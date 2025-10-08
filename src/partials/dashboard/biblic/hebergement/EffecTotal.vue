<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import { useToast } from 'vue-toastification'

const toast = useToast()

const loading = ref(false)

// Données principales
const allSectors = ref([])
const allDoyennes = ref([])
const allParoisses = ref([])
const allPeople = ref([])
const allParticipators = ref([])

const viewSectors = ref([])

// Fonction pour extraire l'ID d'une URL
function extractIdFromUrl(url) {
  if (!url) return null
  const parts = String(url).split('/').filter(Boolean)
  return parts.pop()
}

// API base
const API = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api'

// Récupération des données
async function fetchData() {
  try {
    loading.value = true

    const [sectorsRes, doyennesRes, paroissesRes, peopleRes, participatorsRes] = await Promise.all([
      axios.get(`${API}/sectors`).then(r => r.data?.member || []),
      axios.get(`${API}/doyennes`).then(r => r.data?.member || []),
      axios.get(`${API}/paroisses`).then(r => r.data?.member || []),
      axios.get(`${API}/people`).then(r => r.data?.member || []),
      axios.get(`${API}/participators`).then(r => r.data?.member || []),
    ])

    allSectors.value = sectorsRes
    allDoyennes.value = doyennesRes
    allParoisses.value = paroissesRes
    allPeople.value = peopleRes
    allParticipators.value = participatorsRes

    aggregateSectors()
  } catch (err) {
    console.error(err)
    toast.error('Erreur lors de la récupération des données')
  } finally {
    loading.value = false
  }
}

// Agrégation par secteur
function aggregateSectors() {
  const agg = {}

  allParticipators.value.forEach(part => {
    const person = allPeople.value.find(p => 
      p['@id'] === part.person || extractIdFromUrl(p['@id']) === extractIdFromUrl(part.person)
    )
    if (!person) return

    const paro = allParoisses.value.find(pa =>
      pa['@id'] === person.paroisse || extractIdFromUrl(pa['@id']) === extractIdFromUrl(person.paroisse)
    )
    if (!paro) return

    const sector = allSectors.value.find(s =>
      s['@id'] === paro.sector || extractIdFromUrl(s['@id']) === extractIdFromUrl(paro.sector)
    )
    if (!sector) return

    const doyId = paro.doyenne || 'non-defini'
    const sectorId = sector['@id'] || `/api/sectors/${sector.id}`

    if (!agg[sectorId]) {
      agg[sectorId] = {
        id: sectorId,
        nom: sector.name || '—',
        doyennes: new Set(),
        paroisses: new Set(),
        freres: 0,
        soeurs: 0,
      }
    }

    agg[sectorId].doyennes.add(doyId)
    agg[sectorId].paroisses.add(paro['@id'] || `/api/paroisses/${paro.id}`)

    if (person.gender?.toLowerCase() === 'frère') agg[sectorId].freres++
    else agg[sectorId].soeurs++
  })

  // Transformer les Set en nombre
  viewSectors.value = Object.values(agg).map(s => ({
    ...s,
    doyennes: s.doyennes.size,
    paroisses: s.paroisses.size,
    total: s.freres + s.soeurs,
  }))
}

onMounted(fetchData)
</script>

<template>
  <div class="tab-pane">
    <div v-if="loading" class="text-center my-5">
      <span class="spinner-border"></span> Chargement des données...
    </div>

    <div v-else>
      <div class="card shadow-sm">
        <div class="card-header bg-light fw-semibold">
          Effectif actuel
        </div>
        <div class="table-container">
          <table class="table table-striped table-borderless align-middle">
            <thead class="table-light">
              <tr>
                <th>Secteur</th>
                <th>Doyennes</th>
                <th>Paroisses</th>
                <th>Frères</th>
                <th>Soeurs</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="s in viewSectors" :key="s.id">
                <td>{{ s.nom }}</td>
                <td>{{ s.doyennes }}</td>
                <td>{{ s.paroisses }}</td>
                <td>{{ s.freres }}</td>
                <td>{{ s.soeurs }}</td>
                <td>{{ s.total }}</td>
              </tr>
              <tr v-if="!viewSectors.length">
                <td colspan="6" class="text-center text-muted">Aucun secteur trouvé</td>
              </tr>
            </tbody>
            <tfoot class="table-light fw-semibold">
              <tr>
                <td>{{ viewSectors.length }} Secteur{{ viewSectors.length > 1 ? 's' : '' }}</td>
                <td>{{ viewSectors.reduce((a, s) => a + s.doyennes, 0) }} Doyenne{{ viewSectors.reduce((a, s) => a + s.doyennes, 0) > 1 ? 's' : '' }}</td>
                <td>{{ viewSectors.reduce((a, s) => a + s.paroisses, 0) }} Paroisse{{ viewSectors.reduce((a, s) => a + s.paroisses, 0) > 1 ? 's' : '' }}</td>
                <td>{{ viewSectors.reduce((a, s) => a + s.freres, 0) }} Frère{{ viewSectors.reduce((a, s) => a + s.freres, 0) > 1 ? 's' : '' }}</td>
                <td>{{ viewSectors.reduce((a, s) => a + s.soeurs, 0) }} Soeur{{ viewSectors.reduce((a, s) => a + s.soeurs, 0) > 1 ? 's' : '' }}</td>
                <td>{{ viewSectors.reduce((a, s) => a + s.total, 0) }} Jeune{{ viewSectors.reduce((a, s) => a + s.total, 0) > 1 ? 's' : '' }}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.table-container {
  max-height: 34rem;
  overflow-y: auto;
}
</style>
