<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useServiceContext } from '@/composables/useServiceContext'
import { useToast } from 'vue-toastification'

// ===========================
// Toast
// ===========================
const toast = useToast()

// ===========================
// Contexte service
// ===========================
const { currentService } = useServiceContext()
const pageTitle = computed(() => currentService.value?.name || '')
const sectorService = computed(() => currentService.value?.position || '')
let sector = 'KIN EST'
if (sectorService.value === 'est') sector = 'KIN EST'
else if (sectorService.value === 'centre') sector = 'KIN CENTRE'
else if (sectorService.value === 'ouest') sector = 'KIN OUEST'
const descr = computed(() => currentService.value?.description || '')

// ===========================
// Configuration API
// ===========================
const API_URL = import.meta.env.VITE_API_BASE_URL
const token = localStorage.getItem('token')

// ===========================
// Champs formulaires
// ===========================
const doyenneName = ref('')
const paroisseName = ref('')
const selectedDoyenne = ref('')
const doyennes = ref([])
const paroisses = ref([])
const sectorId = ref(null)
const error = ref('')

// états de chargement
const isLoadingDoyenne = ref(false)
const isLoadingParoisse = ref(false)
const isRefreshing = ref(false)

// ===========================
// SSE composable
// ===========================
const messages = ref([])
const connectSse = () => {
  const evtSource = new EventSource(`${API_URL}/sse/updates`)
  evtSource.onmessage = (e) => messages.value.push(JSON.parse(e.data))
  evtSource.onerror = () => evtSource.close()
  return evtSource
}

// ===========================
// Fonctions API
// ===========================
async function fetchSectorId() {
  try {
    const res = await fetch(`${API_URL}/sectors?name=${encodeURIComponent(sector)}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    const data = await res.json()
    const sec = data.member?.find((s) => s.name === sector)
    if (sec) {
      sectorId.value = sec.id
      await fetchDoyennes()
    }
  } catch (err) {
    console.error('Erreur récupération secteur', err)
    toast.error('❌ Impossible de récupérer le secteur')
  }
}

async function fetchDoyennes() {
  try {
    if (!sectorId.value) return
    const res = await fetch(`${API_URL}/doyennes?sector=/sectors/${sectorId.value}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    const data = await res.json()
    doyennes.value = data.member?.filter((s) => s.sector === `/api/sectors/${sectorId.value}`) || []
    // console.log(`🔄 ${doyennes.value.length} doyennés chargés`)
  } catch (err) {
    console.error('Erreur récupération doyennés', err)
    toast.error('❌ Erreur lors du chargement des doyennés')
  }
}

// ==========================
// Fonction de rafraîchissement
// ==========================
async function refreshData() {
  isRefreshing.value = true
  try {
    await fetchSectorId()
    toast.success('✅ Liste des doyennés actualisée')
  } catch (err) {
    console.error('Erreur lors du rafraîchissement', err)
    toast.error('❌ Erreur lors du rafraîchissement')
  } finally {
    isRefreshing.value = false
  }
}

// ==========================
// Création Doyenné
// ==========================
async function saveDoyenne(e) {
  e.preventDefault()
  if (!sectorId.value) return
  isLoadingDoyenne.value = true
  error.value = ''

  try {
    const payload = {
      name: doyenneName.value,
      sector: `/api/sectors/${sectorId.value}`,
    }

    const res = await fetch(`${API_URL}/doyennes`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/ld+json',
        Accept: 'application/ld+json',
      },
      body: JSON.stringify(payload),
    })

    if (res.ok) {
      const newDoyenne = await res.json()

      // Rafraîchir immédiatement la liste des doyennés
      await fetchDoyennes()
      
      // Sélectionner automatiquement le nouveau doyenné dans le select
      selectedDoyenne.value = newDoyenne.id

      // Créer aussi la paroisse du même nom
      const paroisseRes = await fetch(`${API_URL}/paroisses`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/ld+json' },
        body: JSON.stringify({
          name: `Paroisse ${doyenneName.value}`,
          doyenne: `/api/doyennes/${newDoyenne.id}`,
          sector: `/api/sectors/${sectorId.value}`,
        }),
      })

      if (paroisseRes.ok) {
        toast.success('✅ Doyenné et paroisse enregistrés avec succès !')
      } else {
        const data = await paroisseRes.json()
        error.value = data.violations
          ? data.violations.map((v) => `${v.message}`).join(', ')
          : data.message || 'Erreur création paroisse'
        toast.error(`${error.value}`)
      }

      doyenneName.value = ''
    } else {
      const data = await res.json()
      error.value = data.violations
        ? data.violations.map((v) => `${v.message}`).join(', ')
        : data.message || 'Erreur création doyenné'
      toast.error(`${error.value}`)
    }
  } catch (err) {
    console.error('Erreur création doyenné', err)
    toast.error('Erreur création doyenné')
  } finally {
    isLoadingDoyenne.value = false
  }
}

// ==========================
// Création Paroisse
// ==========================
async function saveParoisse(e) {
  e.preventDefault()
  if (!sectorId.value || !selectedDoyenne.value) return
  isLoadingParoisse.value = true
  error.value = ''

  try {
    const payload = {
      name: `Paroisse ${paroisseName.value}`,
      doyenne: `/api/doyennes/${selectedDoyenne.value}`,
      sector: `/api/sectors/${sectorId.value}`,
    }
    if(paroisseName.value)
    {
      const res = await fetch(`${API_URL}/paroisses`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/ld+json' },
        body: JSON.stringify(payload),
      })

      if (res.ok) {
        paroisseName.value = ''
        selectedDoyenne.value = ''
        toast.success('✅ Paroisse enregistrée avec succès !')
      } else {
        const data = await res.json()
        error.value = data.violations
          ? data.violations.map((v) => ` ${v.message}`).join(', ')
          : data.message || 'Erreur création paroisse'
        toast.error(`${error.value}`)
      }
    }
    else{
        toast.error(`Saisir le nom de la paroisse`)
    }

  } catch (err) {
    console.error('Erreur création paroisse', err)
    toast.error('Erreur création paroisse')
  } finally {
    isLoadingParoisse.value = false
  }
}

// ===========================
// Écouter SSE pour temps réel
// ===========================
watch(messages, (newMessages) => {
  newMessages.forEach((msg) => {
    if (msg.type === 'doyenne' && msg.sector == sectorId.value) {
      // Au lieu d'ajouter simplement, on rafraîchit toute la liste
      fetchDoyennes()
      toast.success(`📢 Nouveau doyenné ajouté : ${msg.name}`)
    }
    if (msg.type === 'paroisse' && msg.sector == sectorId.value) {
      paroisses.value.push(msg)
      toast.success(`📢 Nouvelle paroisse ajoutée : ${msg.name}`)
    }
  })
})

// ===========================
// Initialisation
// ===========================
onMounted(() => {
  fetchSectorId()
  connectSse()
})
</script>

<template>
  <div class="be-content">
    <div class="page-head">
      <div class="d-flex justify-content-between align-items-center">
        <div>
          <h2 class="page-head-title">{{ pageTitle }}</h2>
          <nav aria-label="breadcrumb" role="navigation">
            <ol class="breadcrumb page-head-nav">
              <li class="breadcrumb-item">
                <router-link :to="{ name: 'dashboard' }">Dashboard</router-link>
              </li>
              <li class="breadcrumb-item">
                <a href="#">{{ descr }}</a>
              </li>
              <li class="breadcrumb-item active">{{ pageTitle }}</li>
            </ol>
          </nav>
        </div>
        <button 
          @click="refreshData" 
          class="btn btn-outline-primary btn-sm" 
          :disabled="isRefreshing"
        >
          <span v-if="isRefreshing" class="spinner-border spinner-border-sm me-1"></span>
          <i v-else class="fas fa-sync-alt me-1"></i>
          {{ isRefreshing ? 'Actualisation...' : 'Actualiser' }}
        </button>
      </div>
    </div>

    <div class="main-content container-fluid">
      <div class="row">
        <!-- Formulaire Doyenné -->
        <div class="col-lg-6">
          <div class="card card-border-color card-border-color-primary">
            <div class="card-header card-header-divider">
              {{ descr }}
              <span class="card-subtitle">Ajouter un doyenné inexistant</span>
            </div>
            <div class="card-body">
              <form @submit="saveDoyenne">
                <div class="form-group pt-2">
                  <label for="inputNameDoy">Nom du doyenné</label>
                  <input
                    v-model="doyenneName"
                    class="form-control"
                    id="inputNameDoy"
                    type="text"
                    placeholder="Saint Noé Mawaggali"
                    required
                  />
                </div>
                <div class="row pt-8">
                  <div class="col-12 d-flex justify-content-end">
                    <button class="btn btn-primary" type="submit" :disabled="isLoadingDoyenne">
                      <span v-if="isLoadingDoyenne" class="spinner-border spinner-border-sm me-1"></span>
                      <span v-if="isLoadingDoyenne">Enregistrement...</span>
                      <span v-else>Enregistrer doyenné</span>
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>

        <!-- Formulaire Paroisse -->
        <div class="col-lg-6">
          <div class="card card-border-color card-border-color-primary">
            <div class="card-header card-header-divider">
              Nouvelle paroisse
              <span class="card-subtitle">{{ doyennes.length }} doyennés disponibles</span>
            </div>
            <div class="card-body">
              <form @submit="saveParoisse">
                <div class="form-group">
                  <label>Selectionner le doyenné</label>
                  <select v-model="selectedDoyenne" class="form-control" required>
                    <option value="" disabled>Sélectionnez un doyenné</option>
                    <option v-for="d in doyennes" :key="d.id" :value="d.id">{{ d.name }}</option>
                  </select>
                </div>
                <div class="form-group">
                  <label for="inputNamePar">Nom de la paroisse</label>
                  <input
                    v-model="paroisseName"
                    class="form-control"
                    id="inputNamePar"
                    type="text"
                    placeholder="Saint Noé Mawaggali"
                    required
                  />
                </div>
                <div class="row">
                  <div class="col-12 d-flex justify-content-end">
                    <button class="btn btn-primary" type="submit" :disabled="isLoadingParoisse || !selectedDoyenne">
                      <span v-if="isLoadingParoisse" class="spinner-border spinner-border-sm me-1"></span>
                      <span v-if="isLoadingParoisse">Enregistrement...</span>
                      <span v-else>Enregistrer paroisse</span>
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>