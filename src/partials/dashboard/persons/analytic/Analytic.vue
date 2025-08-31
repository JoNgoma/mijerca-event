<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useServiceContext } from '@/composables/useServiceContext';

const router = useRouter();
const { currentService, currentServiceType } = useServiceContext();

const pageTitle = computed(() => {
  return `Statistique - ${currentService.value.name}`;
});

const breadcrumbService = computed(() => {
  return currentService.value.name;
});

// Données des jeunes
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
]);

// Modal
const selectedJeune = ref(null);
let modalInstance = null;

const openModal = (j) => {
  selectedJeune.value = j;
  modalInstance = new bootstrap.Modal(document.getElementById('detailsModal'));
  modalInstance.show();
};

const closeModal = () => {
  if (modalInstance) modalInstance.hide();
};


$(document).ready(function () {
  App.init();
  App.dataTables();
});
</script>

<template>
  <div class="be-content">
    <div class="main-content container-fluid">
      <div class="row">
        <div class="col-sm-12">
          <div class="card card-table">
            <div class="card-header">
              {{ pageTitle }}
            </div>
            <div class="card-body">
              <div style="max-height: 44.9rem; overflow-y: auto;">
                <table class="table table-striped table-hover table-fw-widget" id="table1">
                  <thead>
                    <tr>
                      <th>Nom complet</th>
                      <th class="d-none d-md-table-cell">Doyenné</th>
                      <th>Paroisse</th>
                      <th>Téléphone</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="j in jeunes" :key="j.id" @click="openModal(j)" style="cursor: pointer;">
                      <td>{{ j.nom }}</td>
                      <td class="d-none d-md-table-cell">{{ j.doyenne }}</td>
                      <td>{{ j.paroisse }}</td>
                      <td>{{ j.tel }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal détails -->
<div
  class="modal fade"
  id="detailsModal"
  tabindex="-1"
  aria-labelledby="detailsModalLabel"
  aria-hidden="true"
>
  <div class="modal-dialog modal-dialog-centered modal-lg">
    <div class="modal-content shadow-lg border-0 rounded-3" v-if="selectedJeune">
      
      <!-- Header -->
      <div class="modal-header bg-primary text-white">
        <h5 class="modal-title fw-bold" id="detailsModalLabel">
          👤 {{ selectedJeune.nom }}
        </h5>
      </div>

      <!-- Body -->
      <div class="modal-body px-4 py-3">
        <ul class="list-group list-group-flush">
          <li class="list-group-item">
            <strong>📍 Doyenné : </strong> {{ selectedJeune.doyenne }}
          </li>
          <li class="list-group-item">
            <strong>⛪ Paroisse : </strong> {{ selectedJeune.paroisse }}
          </li>
          <li class="list-group-item">
            <strong>📞 Téléphone : </strong> 
            <a :href="`tel:${selectedJeune.tel}`">{{ selectedJeune.tel }}</a>
          </li>
          <li class="list-group-item">
            <strong>✅ Statut : </strong> 
            <span
              class="badge"
              :class="{
                'bg-success': selectedJeune.statut === 'Validé',
                'bg-warning text-dark': selectedJeune.statut === 'En attente',
                'bg-danger': selectedJeune.statut === 'Rejeté'
              }"
            >
              {{ selectedJeune.statut }}
            </span>
          </li>
        </ul>
      </div>

      <!-- Footer -->
      <div class="modal-footer">
            <button type="button" class="btn btn-outline-secondary" @click="closeModal">
              Fermer
            </button>
            <a class="btn btn-primary" :href="`tel:${selectedJeune.tel}`">
              Contacter
            </a>
          </div>
    </div>
  </div>
</div>

  </div>
</template> 

<style>
#table1 thead th  {
  position: sticky;
  top: 0;
  z-index: 2;
  background: #fff;
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.15);
}
</style>
