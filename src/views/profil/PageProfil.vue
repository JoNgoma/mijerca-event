<script setup>
import axios from "axios"
import { onMounted } from "vue"
import { ref } from "vue"
import { useRoute } from "vue-router"
import { useToast } from 'vue-toastification'

const route  = useRoute()
const toast = useToast()
const showModal = ref(false)
const isLoading = ref(false)
const isLoadBtn = ref(false)
const error = ref("")

const modalData = ref({
  id: null,
  gender: "",
  fullName: "",
  sector: "",
  doyenne: "",
  paroisse: "",
})
const secs = ref("")
const doys = ref("")
const paros = ref("")
let localisation = ref({
  sector: "Secteur",
  doyenne: "Doyenné",
  paroisse: "Paroisse",
})
const userData = ref({
  id: null,
  username: "",
  roles: [],
  person: null,
})
const personData = ref({
  id: null,
  fullName: "",
  phoneNumber: "",
  gender: "",
})
const API_URL = import.meta.env.VITE_API_BASE_URL

// 🔹 Charger infos user connecté
async function fetchUserData() {
  try {
    isLoading.value = true
    const token = localStorage.getItem("token")
    const username = localStorage.getItem("userPhone")

    // Récupérer l'utilisateur courant
    const res = await fetch(`${API_URL}/users?username=${encodeURIComponent(username)}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/ld+json",
      },
    })
    const data = await res.json()
    if (res.status === 401) {
      localStorage.removeItem("token"); // on vide le token
      window.location.href = "/login";  // redirection vers login
      return;
    }
    const user = data.member?.find(u => u.username === username)
    if (user) {
      userData.value = user

      // Récupérer toutes les personnes
      const personRes = await fetch(`${API_URL}/people`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/ld+json",
        },
      })
      const personDataJson = await personRes.json()

      // Filtrer pour trouver la personne avec le phoneNumber correspondant au username
      const matchedPerson = personDataJson.member?.find(
        p => p.phoneNumber === user.username
      )

      if (matchedPerson) {
        const [sec, doy ,paro] = await Promise.all([
          axios.get(`${API_URL}/sectors`).then((r) => r.data?.member || []),
          axios.get(`${API_URL}/doyennes`).then((r) => r.data?.member || []),
          axios.get(`${API_URL}/paroisses`).then((r) => r.data?.member || []),
        ])

        localisation.value = ({
          sector: sec.find(d => `/api/sectors/${d.id}` === matchedPerson.sector),
          doyenne : doy.find(d => `/api/doyennes/${d.id}` === matchedPerson.doyenne),
          paroisse : paro.find(p => `/api/paroisses/${p.id}` === matchedPerson.paroisse),
          })
        personData.value = matchedPerson

        secs.value = sec
        const selectedSector = secs.value.find(s => s.name === localisation.value.sector.name)
        
        doys.value = selectedSector
        ? doy.filter(d => d.sector === selectedSector["@id"])
        : []
        const selectedDoyenne = doys.value.find(s => s.name === localisation.value.doyenne.name)
        
        paros.value = selectedDoyenne
          ? paro.filter(p => p.doyenne === selectedDoyenne["@id"])
          : []

        modalData.value = {
          id: personData.value.id,
          gender: personData.value.gender,
          fullName: personData.value.fullName,
          sector: localisation.value.sector,
          doyenne: localisation.value.doyenne,
          paroisse: localisation.value.paroisse,
        }
      } else {
        personData.value = null
      }
    }
  } catch (err) {
    console.error("Erreur user connecté", err)
  } finally{
    isLoading.value = false
  }
}

onMounted(() => {
  fetchUserData()
})

// === OUVRIR LE MODAL ===
function openUserModal() {
  showModal.value = true
}

// 🔹 Update personne
async function handleSubmit() {
  isLoadBtn.value = true
  error.value = ""
  try {
    const sectorObj = secs.value.find(s => s.name === modalData.value.sector.name)
    const doyenneObj = doys.value.find(d => d.name === modalData.value.doyenne.name)
    const paroisseObj = paros.value.find(p => p.name === modalData.value.paroisse.name)

    const payload = {
      gender: modalData.value.gender,
      fullName: modalData.value.fullName,
      sector: sectorObj ? sectorObj["@id"] : null,
      doyenne: doyenneObj ? doyenneObj["@id"] : null,
      paroisse: paroisseObj ? paroisseObj["@id"] : null,
      updatedAt: new Date().toISOString()
    }

    const personId = route.query.id
    if (personId) {
      await axios.patch(`${API_URL}/people/${personId}`, payload, {
        headers: { 
          "Content-Type": "application/merge-patch+json",
          "Accept": "application/ld+json",
          // "Authorization": `Bearer ${localStorage.getItem("token")}`
        }
      })

      toast.success("Mise à jour réussie !")
      fetchUserData()
    }
  } catch (err) {
    console.error("Erreur update :", err)
    toast.error("Erreur lors de la mise à jour.")
  } finally {
    isLoadBtn.value = false
  }
}
</script>

<template>
  <div class="be-content">
    <div class="main-content container-fluid">
      <!-- ✅ Loading visuel -->
      <div v-if="isLoading" class="menu-loading d-flex flex-column align-items-center justify-content-center">
        <div class="spinner-border text-primary my-3" role="status">
          <span class="visually-hidden"></span>
        </div>
        <p class="text-muted">Chargement du profil...</p>
      </div>
      <div v-else class="user-profile">
        <div class="row">
          <div class="col-lg-5">
            <div class="user-display">
              <div class="user-display-bg">
                <img src="/assets/img/user-profile-display.png" alt="Profile Background" />
              </div>
              <div class="user-display-bottom">
                <div class="user-display-avatar">
                  <img src="/assets/img/avatar-150.png" alt="Avatar" />
                </div>
                <div class="user-display-info">
                  <div class="name"> {{ personData.gender }} {{ personData.fullName }} </div>
                  <div class="nick"><span class="mdi mdi-phone mr-1"></span> {{ personData.phoneNumber }} </div>
                </div>
                <div class="text-right">
                  <button disabled
                  class="btn btn-space btn-primary"
                  @click="openUserModal()"
                  ><i class="icon icon-left mdi mdi-cloud-done"></i>Mettre à jour</button>
                </div>
              </div>
            </div>
            <div class="user-info-list card">
              <div class="card-header card-header-divider">
                A propos de moi<span class="card-subtitle"
                  >Vous trouverez vos infos ci-dessous</span
                >
              </div>
              <div class="card-body">
                <table class="no-border no-strip skills">
                  <tbody class="no-border-x no-border-y">
                    <tr>
                      <td class="icon"><span class="mdi mdi-globe-alt"></span></td>
                      <td class="item">Doyenné<span class="icon s7-map-marker"></span></td>
                      <td>{{ localisation.doyenne.name }}, {{ localisation.sector.name }}</td>
                    </tr>
                    <tr>
                      <td class="icon"><span class="mdi mdi-pin"></span></td>
                      <td class="item">Paroisse<span class="icon s7-global"></span></td>
                      <td>{{ localisation.paroisse.name }}</td>
                    </tr>
                    <tr>
                      <td class="icon"><span class="mdi mdi-case"></span></td>
                      <td class="item">Responsabilité<span class="icon s7-portfolio"></span></td>
                      <td>{{ 
                      personData.isDicose ?'Noyau Diocésain':
                      personData.isDecanal ?'Noyau Décanal' :
                      personData.isNoyau ?'Noyau Paroissial' :
                      'Jeune' }}</td>
                    </tr>
                    <tr>
                      <td class="icon"><span class="mdi mdi-smartphone-android"></span></td>
                      <td class="item">Mobile<span class="icon s7-phone"></span></td>
                      <td>{{ personData.phoneNumber }}</td>
                    </tr>
                    <tr>
                      <td class="icon"><span class="mdi mdi-cake"></span></td>
                      <td class="item">Inscrit<span class="icon s7-gift"></span></td>
                      <td>Le {{ personData.createdAt }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          <div class="col-lg-7">
            <div class="card">
              <div class="card-header card-header-divider">Activités<span class="card-subtitle">Les activité auxquelles vous avez participées s'affiche ici</span></div>
              <div class="card-body">
                <ul class="user-timeline">
                  <li class="latest">
                    <div class="user-timeline-date">Camp biblique 2025</div>
                    <div class="user-timeline-title">Du 26/12/2025 au 30/12/2025</div>
                    <div>
                      <div class="user-timeline-description">Service Administration</div>
                      <div class="user-timeline-description">Service Finance</div>
                    </div>
                  </li>
                  <li>
                    <div class="user-timeline-date">Ecole de Responsable 2025</div>
                    <div class="user-timeline-title">Du 20/10/2025 au 23/10/2025</div>
                    <div>
                      <div class="user-timeline-description">Service Administration</div>
                    </div>
                  </li>
                  <li>
                    <div class="user-timeline-date">Camp biblique 2024</div>
                    <div class="user-timeline-title">Du 26/12/2024 au 30/12/2024</div>
                    <div>
                      <div class="user-timeline-description">Service Administration</div>
                      <div class="user-timeline-description">Service Finance</div>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <!-- MODAL UPDATE PROFIL -->
    <div v-if="showModal" class="modal show" @click.self="showModal = false">
      <div class="modal-dialog modal-dialog-centered modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title text-primary">
              <b>{{ personData.gender }} {{ personData.fullName }}</b>
            </h5>
            <button type="button" class="btn-close" @click="showModal = false"></button>
          </div>
          <div class="">
            <!-- Formulaire -->
            <form class="card-body" @submit.prevent="handleSubmit">
              <!-- Genre -->
              <div class="form-group">
                <div class="col-6 col-sm-8 col-lg-6 d-flex">
                  <label class="custom-control custom-radio custom-radio-icon custom-control-inline me-2">
                    <input class="custom-control-input" type="radio" name="radio-icon" value="Soeur" v-model="modalData.gender" />
                    <span class="custom-control-label"><i class="mdi mdi-female"></i></span>
                  </label>
                  <label class="custom-control custom-radio custom-radio-icon custom-control-inline">
                    <input class="custom-control-input" type="radio" name="radio-icon" value="Frère" v-model="modalData.gender" />
                    <span class="custom-control-label"><i class="mdi mdi-male-alt"></i></span>
                  </label>
                </div>
              </div>

              <!-- Nom complet -->
              <div class="form-group">
                <label for="inputNames">Noms au complet</label>
                <input class="form-control" v-model="modalData.fullName" type="text" placeholder="Joe Doe" />
              </div>

              <!-- Secteur / Doyenné / Paroisse -->
              <div class="form-group">
                <label>Votre secteur</label>
                <select class="form-control" v-model="modalData.sector.name">
                  <option v-for="s in secs" :key="s.id" :value="s.name">{{ s.name }}</option>
                </select>
              </div>

              <div class="form-group">
                <label>Votre doyenné</label>
                <select class="form-control" v-model="modalData.doyenne.name">
                  <option v-for="d in doys" :key="d.id" :value="d.name">{{ d.name }}</option>
                </select>
              </div>

              <div class="form-group">
                <label>Votre paroisse</label>
                <select class="form-control" v-model="modalData.paroisse.name">
                  <option v-for="p in paros" :key="p.id" :value="p.name">{{ p.name }}</option>
                </select>
              </div>
              <!-- Submit -->
              <div class="form-group">
                <button class="btn btn-block btn-primary btn-xl" type="submit" :disabled="isLoading">
                  <span v-if="isLoadBtn" class="spinner-border spinner-border-sm"></span>
                  <span v-else>Mettre à jour</span>
                </button>
              </div>
              <!-- Error -->
              <p v-if="error" class="text-danger text-center mt-2">{{ error }}</p>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.modal.show {
  display: block;
  background: rgba(0, 0, 0, 0.5);
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1050;
}
.modal-dialog {
  margin: 1.75rem auto;
}
.badge {
  font-size: 0.75rem;
  vertical-align: middle;
}
</style>
