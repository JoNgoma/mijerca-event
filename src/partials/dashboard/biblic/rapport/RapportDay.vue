<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import axios from 'axios'
import { useToast } from 'vue-toastification'
import { useServiceContext } from '@/composables/useServiceContext'

const toast = useToast()
const props = defineProps({
  id: { type: [String, Number], required: true },
  date: { type: String, required: true },
})

const { currentServiceType } = useServiceContext()

const loading = ref(false)
const selectedDoyenne = ref('Tous')
const selectedParoisseId = ref(null)

const allSectors = ref([])
const allDoyennes = ref([])
const allParoisses = ref([])
const allPeople = ref([])
const allParticipators = ref([])
const allMontants = ref([])

const viewParoisses = ref([])

function extractIdFromUrl(url) {
  if (!url) return null
  const parts = String(url).split('/').filter(Boolean)
  return parts.pop()
}

const API = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api'

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
    ] = await Promise.all([
      axios.get(`${API}/doyennes`).then(r => r.data?.member || []),
      axios.get(`${API}/paroisses`).then(r => r.data?.member || []),
      axios.get(`${API}/people`).then(r => r.data?.member || []),
      axios.get(`${API}/participators`).then(r => r.data?.member || []),
      axios.get(`${API}/sectors`).then(r => r.data?.member || []),
      axios.get(`${API}/montants`).then(r => r.data?.member || []),
    ])

    allDoyennes.value = doyennesRes
    allParoisses.value = paroissesRes
    allPeople.value = peopleRes
    allParticipators.value = participatorsRes
    allSectors.value = sectorsRes
    allMontants.value = montantsRes

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
  return viewParoisses.value.filter(
    p => p.doyenne === selectedDoyenne.value
  )
})

const countDoyennes = computed(() => new Set(filteredParoisses.value.map(p => p.doyenne)).size)
const countParoisses = computed(() => filteredParoisses.value.length)

const totalEffectifFiltre = computed(() => filteredParoisses.value.reduce((a, p) => a + (p.effectif || 0), 0))
const totalMontantFiltre = computed(() => {
  const usd = filteredParoisses.value.reduce((a, p) => a + (p.montantUSD || 0), 0)
  const fc = filteredParoisses.value.reduce((a, p) => a + (p.montantFC || 0), 0)
  return `${usd.toLocaleString('fr-FR')} $ + ${fc.toLocaleString('fr-FR')} FC`
})
const showJeunesModal = ref(false)
const currentParoisse = ref(null)

import { nextTick } from 'vue'

async function selectParoisse(paroId) {
  selectedParoisseId.value = paroId
  currentParoisse.value = viewParoisses.value.find(p => p.id === paroId)
  if (window.innerWidth < 768) {
    await nextTick()
    showJeunesModal.value = true
  }
}


const jeunesParParoisse = computed(() => {
  const result = {}
  if (!selectedParoisseId.value) return result

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

    const devise = (montantRecord?.devise || 'FC').toUpperCase()
    const frais = Number(montantRecord?.frais || 0)

    const jeune = {
      nom: `${person.gender} ${person.fullName}`.trim() || '—',
      dortoir: part.dortoir || '',
      carrefour: part.carrefour || '',
      arrivee: new Date(part.createdAt || props.date).toLocaleDateString('fr-FR'),
      status: person.isDicoces ? 'Noyau diocésain' : person.isDecanal ? 'Noyau décanal' : person.isNoyau ? 'Noyau paroissial' : 'Jeune',
      montantValue: frais,
      montantDevise: devise === '$' ? '$' : 'FC',
      montantFormatted: `${frais.toLocaleString('fr-FR')} ${devise === '$' ? '$' : 'FC'}`,
    }

    if (!result[selectedParoisseId.value]) result[selectedParoisseId.value] = []
    result[selectedParoisseId.value].push(jeune)
  })

  return result
})

watch(selectedDoyenne, () => (selectedParoisseId.value = null))
onMounted(fetchData)
</script>

<template>
  <div class="tab-pane" :id="id" role="tabpanel">
    <div v-if="loading" class="text-center my-5">
      <span class="spinner-border"></span> Chargement des données...
    </div>

    <div v-else class="row g-3">
      <!-- Paroisses agrégées -->
      <div class="col-12 col-lg-6">
        <div class="card card-table shadow-sm">
          <div class="card-header bg-light fw-semibold d-flex justify-content-between align-items-center mx-2">
            <span>Rapport Journalier</span>
            <select class="form-select form-select-sm" v-model="selectedDoyenne">
              <option value="Tous">Tous les doyennés</option>
              <option v-for="d in doyennesBySector" :key="d['@id']" :value="d['@id']">
                {{ d.name }}
              </option>
            </select>
          </div>

          <div class="table-container">
            <table class="table table-striped table-borderless align-middle">
              <thead class="table-light">
                <tr>
                  <th>Doyenné</th>
                  <th>Paroisse</th>
                  <th>Effectif</th>
                  <th>Montant</th>
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
                  <td>{{ (p.montantUSD || 0).toLocaleString('fr-FR') }} $ + {{ (p.montantFC || 0).toLocaleString('fr-FR') }} FC</td>
                </tr>

                <tr v-if="!filteredParoisses.length">
                  <td colspan="4" class="text-center text-muted">Aucune activité trouvée</td>
                </tr>
              </tbody>

              <tfoot class="table-light fw-semibold">
                <tr>
                  <td>{{ countDoyennes }} Doyenné{{ countDoyennes > 1 ? 's' : '' }}</td>
                  <td>{{ countParoisses }} Paroisse{{ countParoisses > 1 ? 's' : '' }}</td>
                  <td>{{ totalEffectifFiltre }}</td>
                  <td>{{ totalMontantFiltre }}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>

      <!-- Jeunes -->
      <div class="col-12 col-lg-6 d-none d-lg-block">
        <div class="card card-table shadow-sm">
          <div class="card-header bg-light fw-semibold mx-2">
            <span v-if="selectedParoisseId" class="text-primary"> {{ viewParoisses.find(x => x.id === selectedParoisseId)?.nom }}</span>
          </div>

          <div class="table-container">
            <table class="table table-hover align-middle">
              <thead class="table-light">
                <tr>
                  <th>Noms</th>
                  <th>Montant</th>
                  <th>Dortoir</th>
                  <th>Carrefour</th>
                  <th>Status</th>
                </tr>
              </thead>

              <tbody>
                <tr v-if="!selectedParoisseId">
                  <td colspan="5" class="text-center text-muted">Aucune paroisse sélectionnée</td>
                </tr>

                <tr v-else v-for="j in jeunesParParoisse[selectedParoisseId] || []" :key="j.nom + j.arrivee">
                  <td>{{ j.nom }}</td>
                  <td>{{ j.montantFormatted }}</td>
                  <td>{{ j.dortoir }}</td>
                  <td>{{ j.carrefour }}</td>
                  <td class="align-middle">
                    <span
                      class="badge"
                      :class="{
                        'bg-success text-white': j.status === 'Jeune',
                        'bg-primary text-white': j.status === 'Noyau paroissial',
                        'bg-warning text-white': j.status === 'Noyau décanal',
                        'bg-danger text-white': j.status === 'Noyau diocésain'
                      }"
                    >
                      {{ j.status }}
                    </span>
                  </td>
                </tr>

                <tr v-if="selectedParoisseId && !(jeunesParParoisse[selectedParoisseId] || []).length">
                  <td colspan="5" class="text-center text-muted">Aucun jeune pour cette paroisse</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </div>
  <!-- Modal jeunes pour mobile -->
  <div v-if="showJeunesModal" class="modal show" @click.self="showJeunesModal = false">
    <div class="modal-dialog modal-dialog-scrollable">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">{{ currentParoisse?.nom }}</h5>
          <button type="button" class="btn-close" @click="showJeunesModal = false"></button>
        </div>
        <div class="modal-body">
          <table class="table table-hover">
            <thead>
              <tr>
                <th>Noms</th>
                <th>Montant</th>
                <th>Dortoir</th>
                <th>Carrefour</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="j in jeunesParParoisse[currentParoisse?.id] || []" :key="j.nom + j.arrivee">
                <td>{{ j.nom }}</td>
                <td>{{ j.montantFormatted }}</td>
                <td>{{ j.dortoir }}</td>
                <td>{{ j.carrefour }}</td>
                <td>
                  <span class="badge"
                        :class="{
                          'bg-success text-white': j.status === 'Jeune',
                          'bg-primary text-white': j.status === 'Noyau paroissial',
                          'bg-warning text-white': j.status === 'Noyau décanal',
                          'bg-danger text-white': j.status === 'Noyau diocésain'
                        }">{{ j.status }}</span>
                </td>
              </tr>
              <tr v-if="!(jeunesParParoisse[currentParoisse?.id] || []).length">
                <td colspan="5" class="text-center text-muted">Aucun jeune pour cette paroisse</td>
              </tr>
            </tbody>
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
.selectable-row { cursor: pointer; }
.selectable-row.active { background-color: #e6f0ff; font-weight: 600; }
.modal.show {
  display: block;
  background-color: rgba(0,0,0,0.5);
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1050;
}
.modal-dialog {
  margin: 1.75rem auto;
  max-width: 95%;
}
.modal-content {
  max-height: 90vh;
  overflow-y: auto;
}

</style>
