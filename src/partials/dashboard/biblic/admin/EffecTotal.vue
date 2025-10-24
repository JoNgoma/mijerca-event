<script setup>
import { ref, onMounted, computed } from 'vue'
import axios from 'axios'
import { useRoute } from 'vue-router'
import { useToast } from 'vue-toastification'

const toast = useToast()
const route = useRoute()
const loading = ref(false)
const viewServices = ref([])

const API = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api'

// === Récupérer l'id du camp courant depuis l'URL ===
const campId = computed(() => route.params.id_campBiblique || null)

// === Utils ===
const extractIdFromUrl = (url) => {
  if (!url) return null
  try {
    return String(url).split('/').pop() || null
  } catch {
    return null
  }
}

// === Liste des services à analyser ===
const allServices = [
  { id: 'adm', name: 'Administration', key: 'administrations' },
  { id: 'fin', name: 'Finances', key: 'finances' },
  { id: 'heb', name: 'Hébergement', key: 'hebergements' },
  { id: 'sec', name: 'Secrétariat', key: 'informatiques' }
]

// === Données globales ===
const allPeople = ref([])
const allUsers = ref([])

// === Chargement des données de base ===
async function fetchBaseData() {
  try {
    loading.value = true

    const [usersRes, peopleRes] = await Promise.all([
      axios.get(`${API}/users`).then(r => r.data?.member || []),
      axios.get(`${API}/people`).then(r => r.data?.member || [])
    ])

    allUsers.value = usersRes
    allPeople.value = peopleRes

    await computeServiceStats()
  } catch (err) {
    console.error(err)
    toast.error('Erreur lors du chargement des données de base')
  } finally {
    loading.value = false
  }
}

// === Calcul des effectifs par service pour le camp courant ===
async function computeServiceStats() {
  const results = []

  for (const service of allServices) {
    let freres = 0
    let soeurs = 0

    try {
      // Charger tous les enregistrements du service
      const { data } = await axios.get(`${API}/${service.key}`)
      const allRecords = data?.member || []

      // Ne garder que ceux du camp courant
      const campRecords = allRecords.filter(
        s => s.campBiblic === `/api/camp_bibliques/${campId.value}`
      )

      // Extraire les users liés à ces services
      const serviceUserIds = campRecords
        .map(rec => {
          if (Array.isArray(rec.user)) {
            return rec.user.map(u => extractIdFromUrl(u))
          } else if (rec.user) {
            return [extractIdFromUrl(rec.user)]
          }
          return []
        })
        .flat()
        .filter(Boolean)

      // Calculer les effectifs
      serviceUserIds.forEach(uid => {
        const user = allUsers.value.find(u => extractIdFromUrl(u['@id']) === uid)
        if (!user) return
        const person = allPeople.value.find(p => p['@id'] === user.person)
        if (!person) return

        const gender = person.gender?.toLowerCase()
        if (gender === 'frère' || gender === 'frere') freres++
        else soeurs++
      })

      results.push({
        id: service.id,
        name: service.name,
        freres,
        soeurs,
        total: freres + soeurs
      })
    } catch (err) {
      console.warn(`Erreur pour le service ${service.name}`, err)
    }
  }

  viewServices.value = results
}

// === Initialisation ===
onMounted(fetchBaseData)
</script>

<template>
  <div class="tab-pane">
    <div v-if="loading" class="text-center my-5">
      <span class="spinner-border"></span> Chargement des données...
    </div>

    <div v-else>
      <div class="card shadow-sm">
        <div class="table-container">
          <table class="table table-hover align-middle">
            <thead class="table-light sticky-header">
              <tr>
                <th>Service</th>
                <th>Soeurs</th>
                <th>Frères</th>
                <th>Total</th>
              </tr>
            </thead>

            <tbody>
              <tr v-for="s in viewServices" :key="s.id">
                <td>{{ s.name }}</td>
                <td>{{ s.soeurs }}</td>
                <td>{{ s.freres }}</td>
                <td>{{ s.total }}</td>
              </tr>

              <tr v-if="!viewServices.length">
                <td colspan="4" class="text-center text-muted">
                  Aucun service trouvé pour ce camp
                </td>
              </tr>
            </tbody>

            <tfoot class="table-light fw-semibold tfoot">
              <tr>
                <td>Total</td>
                <td>{{ viewServices.reduce((a, s) => a + s.soeurs, 0) }} Soeurs</td>
                <td>{{ viewServices.reduce((a, s) => a + s.freres, 0) }} Frères</td>
                <td>{{ viewServices.reduce((a, s) => a + s.total, 0) }}</td>
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
  border: 1px solid #dee2e6;
  border-radius: 0.5rem;
}
.sticky-header {
  position: sticky;
  top: 0;
  background: #edeff0;
  z-index: 2;
}
.tfoot{
    background: #edeff0;
}
.fw-semibold {
  font-weight: 600;
}
</style>
