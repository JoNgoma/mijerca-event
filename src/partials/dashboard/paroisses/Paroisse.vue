<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useServiceContext } from '@/composables/useServiceContext'

const router = useRouter()
const { currentService, currentServiceType } = useServiceContext()
const pageTitle = computed(() => `${currentService.value.name}`)
const descr = computed(() => currentService.value.description)

const jeunes = ref([
  { id: 1, doyenne: 'Limete', paroisse: 'Saint Alphonse', nom: 'Josué Kabasele', tel: '0812345678', statut: 'jeune' },
  { id: 2, doyenne: 'Limete', paroisse: 'Saint Alphonse', nom: 'Mireille Ngoma', tel: '0823456789', statut: 'jeune' },
  { id: 3, doyenne: 'Limete', paroisse: 'Saint Pierre Claver', nom: 'Patrick Ilunga', tel: '0991234567', statut: 'jeune' },
  { id: 4, doyenne: 'Limete', paroisse: 'Sacré-Cœur', nom: 'Christelle Mbayo', tel: '0972345678', statut: 'noyau' },
  { id: 5, doyenne: 'Lemba', paroisse: 'Saint Raphaël', nom: 'Benoît Tshibanda', tel: '0818765432', statut: 'jeune' },
  { id: 6, doyenne: 'Lemba', paroisse: 'Saint Camille', nom: 'Stéphanie Luyeye', tel: '0851239876', statut: 'jeune' },
  { id: 7, doyenne: 'Lemba', paroisse: 'Saint Dominique', nom: 'Emmanuel Kitenge', tel: '0892345671', statut: 'noyau' },
  { id: 8, doyenne: 'Ngaba', paroisse: 'Saint François Xavier', nom: 'Sarah Lumumba', tel: '0812223344', statut: 'jeune' },
  { id: 9, doyenne: 'Ngaba', paroisse: 'Saint Augustin', nom: 'Jean-Claude Nzuzi', tel: '0998765432', statut: 'jeune' },
  { id: 10, doyenne: 'Ngaba', paroisse: 'Saint Charles Lwanga', nom: 'Prisca Mbala', tel: '0821234560', statut: 'jeune' },
  { id: 11, doyenne: 'Ngaba', paroisse: 'Saint Charles Lwanga', nom: 'Didier Mutombo', tel: '0839988776', statut: 'noyau' },
  { id: 12, doyenne: 'Kalamu', paroisse: 'Sainte Anne', nom: 'Rachel Kanku', tel: '0842223344', statut: 'jeune' },
  { id: 13, doyenne: 'Kalamu', paroisse: 'Saint Joseph', nom: 'Alain Mayamba', tel: '0817654321', statut: 'jeune' },
  { id: 14, doyenne: 'Kalamu', paroisse: 'Saint Benoît', nom: 'Dorcas Mulumba', tel: '0893332211', statut: 'noyau' },
  { id: 15, doyenne: 'Masina', paroisse: 'Notre-Dame du Rosaire', nom: 'Michel Kasongo', tel: '0821122334', statut: 'jeune' },
  { id: 16, doyenne: 'Masina', paroisse: 'Saint Esprit', nom: 'Gédéon Banza', tel: '0815566778', statut: 'jeune' },
  { id: 17, doyenne: 'Masina', paroisse: 'Saint Michel', nom: 'Solange Tshiala', tel: '0828899001', statut: 'noyau' },
  { id: 18, doyenne: 'Masina', paroisse: 'Saint Michel', nom: 'Bruno Malu', tel: '0992233445', statut: 'jeune' },
  { id: 19, doyenne: 'Masina', paroisse: 'Saint Esprit', nom: 'Inès Mpoyi', tel: '0814455667', statut: 'jeune' },
  { id: 20, doyenne: 'Lemba', paroisse: 'Saint Raphaël', nom: 'Christian Kabeya', tel: '0975544332', statut: 'jeune' },
])

// Filtres
const filterDoyenne = ref('')
const filterParoisse = ref('')
const filterStatut = ref('')
const search = ref('')

// Options de filtres dynamiques
const doyenneOptions = computed(() => [...new Set(jeunes.value.map(j => j.doyenne))])
const paroisseOptions = computed(() => [...new Set(jeunes.value.map(j => j.paroisse))])

// Application des filtres
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

$(document).ready(function () {
  App.init()
  App.dataTables()
})
</script>

<template>
  <div class="be-content">
    <div class="main-content container-fluid">
      <div class="row">
        <div class="col-sm-12">
          <div class="card card-table">
            <div class="card-header">
              {{ descr }}
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

            <!-- Filtres -->
            <div class="p-2 bg-white rounded shadow-sm">
              <div class="row g-2 row-cols-1 row-cols-sm-2 row-cols-md-4">
                <!-- Doyenné -->
                <div class="col mb-1">
                  <select v-model="filterDoyenne" class="form-select p-1">
                    <option value="">Doyenné</option>
                    <option v-for="d in doyenneOptions" :key="d" :value="d">{{ d }}</option>
                  </select>
                </div>

                <!-- Paroisse -->
                <div class="col">
                  <select v-model="filterParoisse" class="form-select p-1">
                    <option value="">Paroisse</option>
                    <option v-for="p in paroisseOptions" :key="p" :value="p">{{ p }}</option>
                  </select>
                </div>

                <!-- Statut -->
                <div class="col">
                  <select v-model="filterStatut" class="form-select p-1">
                    <option value="">Statut</option>
                    <option value="jeune">Jeune</option>
                    <option value="noyau">Noyau</option>
                  </select>
                </div>

                <!-- Recherche -->
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
                          :class="jeune.statut === 'noyau' ? 'bg-warning text-dark' : 'bg-success'"
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
              <span class="badge" :class="selectedJeune.statut === 'noyau' ? 'bg-warning text-dark' : 'bg-success'">
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
