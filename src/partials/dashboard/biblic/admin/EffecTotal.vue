<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import { useToast } from 'vue-toastification'

const toast = useToast()
const loading = ref(false)

const API = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api'

// === Données globales ===
const allPeople = ref([])
const allUsers = ref([])
const viewServices = ref([])

// === Liste des services à analyser ===
const allServices = [
  { id: 'adm', name: 'Administration', key: 'administrations' },
  { id: 'fin', name: 'Finances', key: 'finances' },
  { id: 'heb', name: 'Hébergement', key: 'hebergements' },
  { id: 'sec', name: 'Secrétariat', key: 'informatiques' }
]

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
  } catch (err) {
    console.error(err)
    toast.error('Erreur lors du chargement des données de base')
  }
}

// === Calcul des effectifs par service ===
function computeServiceStats() {
  const results = []

  for (const service of allServices) {
    let freres = 0
    let soeurs = 0

    // pour chaque utilisateur
    allUsers.value.forEach(user => {
      const hasService = Array.isArray(user[service.key]) && user[service.key].length > 0
      if (!hasService) return

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
  }

  viewServices.value = results
}

// === Initialisation ===
onMounted(async () => {
  await fetchBaseData()
  computeServiceStats()
  loading.value = false
})
</script>

<template>
  <div class="tab-pane">
    <div v-if="loading" class="text-center my-5">
      <span class="spinner-border"></span> Chargement des données...
    </div>

    <div v-else>
      <div class="card shadow-sm">
        <div class="table-container">
          <table class="table table-striped table-borderless align-middle">
            <thead class="table-light">
              <tr>
                <th>Service</th>
                <th>Sœurs</th>
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
                  Aucun service trouvé
                </td>
              </tr>
            </tbody>

            <tfoot class="table-light fw-semibold">
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
}
.fw-semibold {
  font-weight: 600;
}
</style>
