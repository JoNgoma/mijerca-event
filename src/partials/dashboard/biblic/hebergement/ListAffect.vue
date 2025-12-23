<script setup>
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import axios from 'axios'
import { useToast } from 'vue-toastification'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'

const toast = useToast()
const props = defineProps({
  id: { type: [String, Number], required: true },
  date: { type: String, required: true },
})

const loading = ref(false)
const selectedDoyenne = ref('Tous')
const selectedParoisseId = ref(null)
const showJeunesModal = ref(false)
const showEditModal = ref(false)
const currentParoisse = ref(null)
const editingJeune = ref(null)
const editCarrefour = ref('')
const editDortoir = ref('')
const saving = ref(false)

const allSectors = ref([])
const allDoyennes = ref([])
const allParoisses = ref([])
const allPeople = ref([])
const allParticipators = ref([])
const allMontants = ref([])

const viewParoisses = ref([])
const jeunesList = ref([])

// Variables pour l'impression
const campBiblique = ref({
  name: "CAMP BIBLIQUE 2025",
  date: "",
  effectif: 0,
  total: "0 $ + 0 FC",
  carrefour: "12",
  dortoir: "3"
})

// Formater la date pour l'impression
watch(() => props.date, (newDate) => {
  if (newDate) {
    const dateObj = new Date(newDate)
    campBiblique.value.date = dateObj.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }).toUpperCase()
  }
}, { immediate: true })

// === FONCTION PAGINATION OPTIMISÉE ===
async function fetchAllPages(baseUrl) {
  let allItems = [];
  let currentPage = 1;
  let hasMore = true;
  
  try {
    while (hasMore) {
      const url = `${baseUrl}${baseUrl.includes('?') ? '&' : '?'}page=${currentPage}`;
      
      const response = await axios.get(url);
      const data = response.data;
      
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
    console.error(`Erreur lors de la récupération paginée de ${baseUrl}:`, error);
    throw error;
  }
}

function extractIdFromUrl(url) {
  if (!url) return null
  const parts = String(url).split('/').filter(Boolean)
  return parts.pop()
}

const API = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api'

// === Fetch Data AVEC PAGINATION ===
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
      fetchAllPages(`${API}/doyennes`),
      fetchAllPages(`${API}/paroisses`),
      fetchAllPages(`${API}/people`),
      fetchAllPages(`${API}/participators`),
      fetchAllPages(`${API}/sectors`),
      fetchAllPages(`${API}/montants`),
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
  let totalParticipants = 0

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
    totalParticipants++
    
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
  const doyennes = allDoyennes.value.filter(d => doyenneIds.has(extractIdFromUrl(d['@id'])))
  return doyennes
})

const filteredParoisses = computed(() => {
  if (selectedDoyenne.value === 'Tous') return viewParoisses.value
  const result = viewParoisses.value.filter(
    p => p.doyenne === selectedDoyenne.value
  )
  return result
})

const countDoyennes = computed(() => new Set(filteredParoisses.value.map(p => p.doyenne)).size)
const countParoisses = computed(() => filteredParoisses.value.length)
const totalEffectifFiltre = computed(() => filteredParoisses.value.reduce((a, p) => a + (p.effectif || 0), 0))

// Fonction pour charger les jeunes d'une paroisse, triés alphabétiquement
async function selectParoisse(paroId) {
  selectedParoisseId.value = paroId
  currentParoisse.value = viewParoisses.value.find(p => p.id === paroId)
  
  // Charger les jeunes pour cette paroisse
  await loadJeunesForParoisse(paroId)
  
  // Sur mobile, ouvrir le modal
  if (window.innerWidth < 992) {
    await nextTick()
    showJeunesModal.value = true
  }
}

// Fonction pour charger et trier les jeunes
async function loadJeunesForParoisse(paroId) {
  jeunesList.value = []
  
  allParticipators.value.forEach(part => {
    const person = allPeople.value.find(
      pe => pe['@id'] === part.person || extractIdFromUrl(pe['@id']) === extractIdFromUrl(part.person)
    )
    if (!person) return

    const personParoId = person.paroisse
    const match =
      personParoId === paroId ||
      extractIdFromUrl(personParoId) === extractIdFromUrl(paroId)
    if (!match) return

    const montantRecord = allMontants.value.find(m =>
      m.participator === part['@id'] ||
      extractIdFromUrl(m.participator) === extractIdFromUrl(part['@id'])
    )

    const devise = (montantRecord?.devise || 'FC').toUpperCase()
    const frais = Number(montantRecord?.frais || 0)

    const jeune = {
      nom: `${person.gender} ${person.fullName}`.trim() || '—',
      fullName: person.fullName || '',
      dortoir: part.dortoir || '',
      carrefour: part.carrefour || '',
      arrivee: new Date(part.createdAt || props.date).toLocaleDateString('fr-FR'),
      status: person.isDicoces ? 'Noyau diocésain' : person.isDecanal ? 'Noyau décanal' : person.isNoyau ? 'Noyau paroissial' : 'Jeune',
      montantValue: frais,
      montantDevise: devise === '$' ? '$' : 'FC',
      montantFormatted: `${frais.toLocaleString('fr-FR')} ${devise === '$' ? '$' : 'FC'}`,
      participatorId: part['@id'],
      personId: person['@id'],
      gender: person.gender || ''
    }

    jeunesList.value.push(jeune)
  })

  // Tri alphabétique par nom
  jeunesList.value.sort((a, b) => {
    const nameA = a.fullName || a.nom
    const nameB = b.fullName || b.nom
    return nameA.localeCompare(nameB, 'fr', { sensitivity: 'base' })
  })
}

// Computed pour les jeunes (version triée pour desktop)
const jeunesParParoisseSorted = computed(() => {
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

    const devise = (montantRecord?.devise || 'FC').toUpperCase()
    const frais = Number(montantRecord?.frais || 0)

    const jeune = {
      nom: `${person.gender} ${person.fullName}`.trim() || '—',
      fullName: person.fullName || '',
      dortoir: part.dortoir || '',
      carrefour: part.carrefour || '',
      arrivee: new Date(part.createdAt || props.date).toLocaleDateString('fr-FR'),
      status: person.isDicoces ? 'Noyau diocésain' : person.isDecanal ? 'Noyau décanal' : person.isNoyau ? 'Noyau paroissial' : 'Jeune',
      montantValue: frais,
      montantDevise: devise === '$' ? '$' : 'FC',
      montantFormatted: `${frais.toLocaleString('fr-FR')} ${devise === '$' ? '$' : 'FC'}`,
      participatorId: part['@id'],
      personId: person['@id'],
      gender: person.gender || ''
    }

    jeunes.push(jeune)
  })

  // Tri alphabétique
  jeunes.sort((a, b) => {
    const nameA = a.fullName || a.nom
    const nameB = b.fullName || b.nom
    return nameA.localeCompare(nameB, 'fr', { sensitivity: 'base' })
  })

  result[selectedParoisseId.value] = jeunes
  return result
})

// Fonction pour ouvrir le modal d'édition
function openEditModal(jeune, event) {
  if (event) event.stopPropagation()
  editingJeune.value = jeune
  editCarrefour.value = jeune.carrefour || ''
  editDortoir.value = jeune.dortoir || ''
  showEditModal.value = true
}

// Fonction pour sauvegarder les modifications
async function saveJeuneDetails() {
  if (!editingJeune.value) return

  try {
    saving.value = true
    
    const participatorId = extractIdFromUrl(editingJeune.value.participatorId)
    
    const updateData = {}
    if (editCarrefour.value !== editingJeune.value.carrefour) {
      updateData.carrefour = editCarrefour.value
    }
    if (editDortoir.value !== editingJeune.value.dortoir) {
      updateData.dortoir = editDortoir.value
    }
    
    if (Object.keys(updateData).length === 0) {
      showEditModal.value = false
      return
    }

    await axios.patch(
      `${API}/participators/${participatorId}`,
      updateData,
      {
        headers: {
          'Content-Type': 'application/merge-patch+json',
        }
      }
    )

    // Mettre à jour localement
    const participatorIndex = allParticipators.value.findIndex(p => 
      extractIdFromUrl(p['@id']) === participatorId
    )
    
    if (participatorIndex !== -1) {
      allParticipators.value[participatorIndex] = {
        ...allParticipators.value[participatorIndex],
        ...updateData
      }
      
      // Mettre à jour dans jeunesList (mobile)
      const jeuneIndex = jeunesList.value.findIndex(j => 
        extractIdFromUrl(j.participatorId) === participatorId
      )
      if (jeuneIndex !== -1) {
        jeunesList.value[jeuneIndex].carrefour = editCarrefour.value
        jeunesList.value[jeuneIndex].dortoir = editDortoir.value
      }
      
      editingJeune.value.carrefour = editCarrefour.value
      editingJeune.value.dortoir = editDortoir.value
    }

    toast.success('Carrefour et dortoir mis à jour avec succès')
    showEditModal.value = false
  } catch (error) {
    console.error('Erreur lors de la mise à jour:', error)
    toast.error('Erreur lors de la mise à jour')
  } finally {
    saving.value = false
  }
}

// Fonction d'impression PDF
async function printParoisse() {
  try {
    if (!selectedParoisseId.value) {
      toast.warning('Veuillez sélectionner une paroisse')
      return
    }

    // Récupérer les jeunes selon le mode d'affichage
    const jeunes = window.innerWidth >= 992 
      ? jeunesParParoisseSorted.value[selectedParoisseId.value] || []
      : jeunesList.value
    
    if (jeunes.length === 0) {
      toast.warning('Aucun participant à imprimer pour cette paroisse')
      return
    }

    const paroisse = viewParoisses.value.find(p => p.id === selectedParoisseId.value)
    if (!paroisse) {
      toast.error('Paroisse non trouvée')
      return
    }

    // Mettre à jour les statistiques
    campBiblique.value.effectif = jeunes.length

    // Calculer les totaux
    let totalUSD = 0
    let totalFC = 0
    
    jeunes.forEach(j => {
      if (j.montantDevise === '$') {
        totalUSD += j.montantValue
      } else {
        totalFC += j.montantValue
      }
    })
    
    campBiblique.value.total = `${totalUSD.toLocaleString('fr-FR')} $ + ${totalFC.toLocaleString('fr-FR')} FC`

    // Diviser les jeunes en groupes de 3 pour le PDF
    const chunkArray = (array, size) => {
      const result = []
      for (let i = 0; i < array.length; i += size) {
        result.push(array.slice(i, i + size))
      }
      return result
    }
    
    const groupedJeunes = chunkArray(jeunes, 3)
    
    // Créer le contenu HTML
    const pdfContent = document.createElement('div')
    pdfContent.style.cssText = `
      position: absolute;
      left: -9999px;
      top: -9999px;
      width: 210mm;
      padding: 20mm;
      font-family: Arial, sans-serif;
      font-size: 12px;
      background-color: white;
    `
    
    // Construire le tableau HTML
    let tableHTML = '<table style="width: 100%; border-collapse: collapse; margin-top: 20px;">'
    
    groupedJeunes.forEach((group) => {
      tableHTML += '<tr>'
      
      group.forEach(jeune => {
        tableHTML += `
          <td style="border: 1px solid #000; padding: 10px; width: 33.33%; vertical-align: top; height: 120px;">
            <div style="font-weight: bold; margin-bottom: 5px; text-align: center;">Doyenné ${paroisse.doyenneName}</div>
            <div style="margin-bottom: 5px; text-align: center;">${paroisse.nom}</div>
            <div style="margin-bottom: 5px; text-align: center;">${jeune.nom}</div>
            <div style="margin-bottom: 5px; text-align: center;">Carrefour : ${(jeune.carrefour === '0' ? 'Rafiki' : jeune.carrefour) || campBiblique.value.carrefour}</div>
            <div style="text-align: center;">Dortoir : ${(jeune.dortoir === '0' ? 'Visiteur' : jeune.dortoir) || campBiblique.value.dortoir}</div>
          </td>
        `
      })
      
      // Compléter avec des cellules vides si nécessaire
      for (let i = group.length; i < 3; i++) {
        tableHTML += '<td style="border: 1px solid #000; width: 33.33%; height: 120px;"></td>'
      }
      
      tableHTML += '</tr>'
    })
    
    tableHTML += '</table>'
    
    // Ajouter l'en-tête
    pdfContent.innerHTML = `
      <div style="text-align: center; margin-bottom: 20px;">
        <h1 style="font-size: 20px; margin-bottom: 10px; font-weight: bold;">
          ${campBiblique.value.name}
        </h1>
        <div style="display: flex; justify-content: space-between; font-size: 16px; margin-bottom: 20px;">
          <div><strong>EFFECTIF : ${campBiblique.value.effectif} JEUNES</strong></div>
          <div><strong>TOTAL : ${campBiblique.value.total}</strong></div>
        </div>
      </div>
      
      ${tableHTML}
      
      <div style="margin-top: 30px; text-align: center; font-style: italic; font-size: 10px;">
        MIJERCA Kinshasa. Hébergement, le ${new Date().toLocaleDateString('fr-FR', { 
          day: '2-digit', 
          month: '2-digit', 
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })}
      </div>
    `
    
    // Ajouter au DOM et générer le PDF
    document.body.appendChild(pdfContent)
    
    const canvas = await html2canvas(pdfContent, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff'
    })
    
    const imgData = canvas.toDataURL('image/png')
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    })
    
    const imgWidth = 210
    const imgHeight = (canvas.height * imgWidth) / canvas.width
    
    pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight)
    
    // Télécharger le PDF
    pdf.save(`${paroisse.nom.replace(/[^a-z0-9]/gi, '_')}_${new Date().toLocaleDateString('fr-FR')}.pdf`)
    
    // Nettoyer
    document.body.removeChild(pdfContent)
    
    toast.success('PDF généré avec succès')
    
  } catch (error) {
    console.error('Erreur lors de la génération du PDF:', error)
    toast.error('Erreur lors de la génération du PDF')
  }
}

// Fonction de rafraîchissement
async function refreshData() {
  await fetchData()
  if (selectedParoisseId.value) {
    await loadJeunesForParoisse(selectedParoisseId.value)
  }
  toast.success('Données d\'hébergement actualisées')
}

// Fonction pour fermer le modal mobile
function closeMobileModal() {
  showJeunesModal.value = false
  selectedParoisseId.value = null
  currentParoisse.value = null
  jeunesList.value = []
}

watch(selectedDoyenne, () => {
  selectedParoisseId.value = null
  jeunesList.value = []
})

onMounted(fetchData)
</script>

<template>
  <div class="tab-pane" :id="id" role="tabpanel">
    <div class="d-flex justify-content-between align-items-center mb-3">
      <h6 class="m-0">Hébergement - Secteur {{ allSectors.find(s => String(s.id) === String(props.id))?.name || props.id }}</h6>
      <button @click="refreshData" class="btn btn-sm btn-outline-primary" :disabled="loading">
        <span v-if="loading" class="spinner-border spinner-border-sm mr-1"></span>
        {{ loading ? 'Actualisation...' : 'Actualiser' }}
      </button>
    </div>

    <div v-if="loading" class="text-center my-5">
      <span class="spinner-border"></span> 
      <div class="mt-2">Chargement des données d'hébergement...</div>
    </div>

    <div v-else class="row g-3">
      <!-- Paroisses agrégées -->
      <div class="col-12 col-lg-6">
        <div class="card card-table shadow-sm">
          <div class="card-header bg-light fw-semibold d-flex justify-content-between align-items-center flex-wrap mx-2 py-3">
            <span class="mb-2 mb-md-0">Hébergement (Affectation)</span>
            <div class="d-flex align-items-center flex-wrap gap-2">
              <small class="text-muted mr-2 d-none d-md-inline">{{ filteredParoisses.length }} paroisses</small>
              <select class="form-select form-select-sm" v-model="selectedDoyenne" style="min-width: 180px;">
                <option value="Tous">Tous les doyennés</option>
                <option v-for="d in doyennesBySector" :key="d['@id']" :value="d['@id']">
                  {{ d.name }}
                </option>
              </select>
            </div>
          </div>

          <div class="table-container">
            <table class="table table-striped table-borderless align-middle mb-0">
              <thead class="table-light sticky-header">
                <tr>
                  <th>Doyenné</th>
                  <th>Paroisse</th>
                  <th class="text-center">Effectif</th>
                </tr>
              </thead>

              <tbody>
                <tr
                  v-for="p in filteredParoisses"
                  :key="p.id"
                  @click="selectParoisse(p.id)"
                  :class="['selectable-row', { active: p.id === selectedParoisseId }]"
                >
                  <td class="fw-medium">{{ p.doyenneName }}</td>
                  <td class="fw-semibold">{{ p.nom }}</td>
                  <td class="text-center">
                    <span class="badge bg-primary rounded-pill">{{ p.effectif || 0 }}</span>
                  </td>
                </tr>

                <tr v-if="!filteredParoisses.length">
                  <td colspan="4" class="text-center text-muted py-4">
                    <i class="mdi mdi-balance mr-2"></i>
                    Aucune donnée d'hébergement trouvée
                  </td>
                </tr>
              </tbody>

              <tfoot class="table-light fw-semibold">
                <tr>
                  <td>{{ countDoyennes }} Doyenné{{ countDoyennes > 1 ? 's' : '' }}</td>
                  <td>{{ countParoisses }} Paroisse{{ countParoisses > 1 ? 's' : '' }}</td>
                  <td class="text-center">
                    <span class="badge bg-primary rounded-pill">{{ totalEffectifFiltre }}</span>
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>

      <!-- Jeunes (Desktop) -->
      <div class="col-12 col-lg-6 d-none d-lg-block">
        <div class="card card-table shadow-sm h-100">
          <div class="card-header bg-light fw-semibold mx-2 d-flex justify-content-between align-items-center py-3">
            <div>
              <span v-if="selectedParoisseId" class="text-primary fw-bold"> 
                {{ viewParoisses.find(x => x.id === selectedParoisseId)?.nom }}
              </span>
              <span v-else class="text-muted">
                <i class="mdi mdi-mail-reply-all mr-2"></i>Sélectionnez une paroisse
              </span>
            </div>
            <div v-if="selectedParoisseId" class="text-end">
              <button 
                @click="printParoisse" 
                class="btn btn-primary btn-sm ms-2"
                title="Imprimer la liste des participants"
              >
                <i class="mdi mdi-print mr-1"></i> Imprimer
              </button>
              <small class="text-muted d-block mt-1">
                {{ jeunesParParoisseSorted[selectedParoisseId]?.length || 0 }} participant(s)
              </small>
            </div>
          </div>

          <div class="table-container">
            <table class="table table-hover align-middle mb-0">
              <thead class="table-light sticky-header">
                <tr>
                  <th>#</th>
                  <th>Noms</th>
                  <th class="text-center">Dortoir</th>
                  <th class="text-center">Carrefour</th>
                  <th class="text-center">Status</th>
                </tr>
              </thead>

              <tbody>
                <tr v-if="!selectedParoisseId">
                  <td colspan="5" class="text-center text-muted py-4">
                    <i class="mdi mdi-pointer mr-2"></i>
                    Cliquez sur une paroisse pour voir les affectations
                  </td>
                </tr>

                <tr v-else-if="jeunesParParoisseSorted[selectedParoisseId] && jeunesParParoisseSorted[selectedParoisseId].length" 
                    v-for="(j, index) in jeunesParParoisseSorted[selectedParoisseId]" 
                    :key="j.nom + j.arrivee"
                    @click="openEditModal(j, $event)"
                    class="jeune-row">
                  <td class="text-muted">{{ index + 1 }}</td>
                  <td class="fw-medium">{{ j.nom }}</td>
                  <td class="text-center">
                    <span v-if="j.dortoir" class="badge bg-info text-dark">{{ j.dortoir }}</span>
                    <span v-else class="text-muted small">—</span>
                  </td>
                  <td class="text-center">
                    <span v-if="j.carrefour" class="badge bg-secondary">{{ j.carrefour }}</span>
                    <span v-else class="text-muted small">—</span>
                  </td>
                  <td class="text-center">
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

                <tr v-if="selectedParoisseId && (!jeunesParParoisseSorted[selectedParoisseId] || jeunesParParoisseSorted[selectedParoisseId].length === 0)">
                  <td colspan="5" class="text-center text-muted py-4">
                    <i class="mdi mdi-face mr-2"></i>
                    Aucun participant pour cette paroisse
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal pour les petits écrans -->
    <div v-if="showJeunesModal" class="modal fade show d-block" style="background-color: rgba(0,0,0,0.5);" @click.self="closeMobileModal">
      <div class="modal-dialog modal-dialog-scrollable modal-fullscreen-sm-down" @click.stop>
        <div class="modal-content">
          <div class="modal-header bg-primary text-white">
            <h5 class="modal-title">
              <i class="mdi mdi-face mr-2"></i>
              {{ currentParoisse?.nom || 'Participants' }}
            </h5>
            <button type="button" class="btn-close btn-close-white" @click="closeMobileModal"></button>
          </div>
          <div class="modal-body p-0">
            <div class="sticky-top bg-white px-3 py-2 border-bottom">
              <div class="d-flex justify-content-between align-items-center">
                <small class="text-muted">
                  {{ jeunesList.length }} participant(s)
                </small>
                <div>
                  <button @click="refreshData" class="btn btn-sm btn-outline-primary btn-icon mr-2">
                    <i class="mdi mdi-refresh-sync"></i>
                  </button>
                  <button 
                    v-if="currentParoisse" 
                    @click="printParoisse" 
                    class="btn btn-primary btn-sm"
                  >
                    <i class="mdi mdi-printer mr-1"></i> Imprimer
                  </button>
                </div>
              </div>
            </div>
            
            <div class="list-group list-group-flush">
              <div v-if="jeunesList.length === 0" class="text-center py-5 text-muted">
                <i class="mdi mdi-face fa-2x mb-3"></i>
                <p>Aucun participant pour cette paroisse</p>
              </div>
              
              <div v-for="(j, index) in jeunesList" 
                   :key="j.nom + index" 
                   @click="openEditModal(j, $event)"
                   class="list-group-item list-group-item-action jeune-item">
                <div class="d-flex justify-content-between align-items-start">
                  <div class="mr-3">
                    <div class="d-flex align-items-center mb-1">
                      <span class="badge bg-light text-dark mr-2">{{ index + 1 }}</span>
                      <strong class="text-primary">{{ j.nom }}</strong>
                    </div>
                    <div class="d-flex flex-wrap gap-2 mb-2 text-white">
                      <span class="badge" :class="{
                        'bg-success text-white': j.status === 'Jeune',
                        'bg-primary text-white': j.status === 'Noyau paroissial',
                        'bg-warning text-white': j.status === 'Noyau décanal',
                        'bg-danger text-white': j.status === 'Noyau diocésain'
                      }">
                        {{ j.status }}
                      </span>
                      <span v-if="j.dortoir" class="badge bg-info">
                        <i class="mdi mdi-local-hotel mr-1"></i>{{ j.dortoir }}
                      </span>
                      <span v-if="j.carrefour" class="badge bg-secondary">
                        <i class="mdi mdi-local-convenience-store mr-1"></i>{{ j.carrefour }}
                      </span>
                    </div>
                    <small class="text-muted">
                      <i class="mdi mdi-calendar-alt mr-1"></i>{{ j.arrivee }}
                    </small>
                  </div>
                  <div class="text-muted">
                    <i class="mdi mdi-chevron-right"></i>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="closeMobileModal">
              Fermer
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal d'édition -->
    <div v-if="showEditModal" class="modal fade show d-block" style="background-color: rgba(0,0,0,0.5);" @click.self="showEditModal = false">
      <div class="modal-dialog modal-dialog-centered" @click.stop>
        <div class="modal-content">
          <div class="modal-header bg-primary text-white">
            <h5 class="modal-title">
              <i class="mdi mdi-edit mr-2"></i>
              Modifier l'affectation
            </h5>
            <button type="button" class="btn-close btn-close-white" @click="showEditModal = false"></button>
          </div>
          <div class="modal-body">
            <div v-if="editingJeune" class="mb-4">
              <h6 class="mb-2 text-primary">{{ editingJeune.nom }}</h6>
              <div class="d-flex flex-wrap gap-2 mb-3">
                <span class="badge text-white mr-2" :class="{
                  'bg-success': editingJeune.status === 'Jeune',
                  'bg-primary': editingJeune.status === 'Noyau paroissial',
                  'bg-warning': editingJeune.status === 'Noyau décanal',
                  'bg-danger': editingJeune.status === 'Noyau diocésain'
                }">
                  {{ editingJeune.status }}
                </span>
                <span class="text-muted small">
                  <i class="mdi mdi-calendar mr-1"></i>
                  {{ editingJeune.arrivee }}
                </span>
              </div>
            </div>
            
            <form @submit.prevent="saveJeuneDetails">
              <div class="mb-3">
                <label for="carrefour" class="form-label">
                  <i class="mdi mdi-local-convenience-store mr-1 text-muted"></i>
                  Carrefour
                </label>
                <input 
                  type="text" 
                  class="form-control" 
                  id="carrefour" 
                  v-model="editCarrefour"
                  placeholder="0 pour rafiki"
                  required
                >
                <div class="form-text">Carrefour d'affectation du participant</div>
              </div>
              
              <div class="mb-4">
                <label for="dortoir" class="form-label">
                  <i class="mdi mdi-local-hotel mr-1 text-muted"></i>
                  Dortoir
                </label>
                <input 
                  type="text" 
                  class="form-control" 
                  id="dortoir" 
                  v-model="editDortoir"
                  placeholder="0 pour visiteur"
                  required
                >
                <div class="form-text">Dortoir d'affectation du participant</div>
              </div>
              
              <div class="d-flex gap-2">
                <button 
                  type="button" 
                  class="btn btn-outline-secondary flex-fill mr-2" 
                  @click="showEditModal = false"
                  :disabled="saving"
                >
                  Annuler
                </button>
                <button 
                  type="submit" 
                  class="btn btn-primary flex-fill"
                  :disabled="saving"
                >
                  <span v-if="saving" class="spinner-border spinner-border-sm mr-1"></span>
                  {{ saving ? 'Enregistrement...' : 'Enregistrer' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.table-container {
  max-height: 34rem;
  overflow-y: auto;
  border-radius: 0 0 0.5rem 0.5rem;
  border: 1px solid #dee2e6;
  border-top: none;
}

.card-header {
  border-bottom: 1px solid #dee2e6;
}

.selectable-row { 
  cursor: pointer; 
  transition: all 0.2s ease;
}

.selectable-row:hover { 
  background-color: #f8f9fa !important; 
}

.selectable-row.active { 
  background-color: #e6f0ff !important; 
  font-weight: 600;
  border-left: 3px solid #0d6efd;
}

.jeune-row {
  cursor: pointer;
  transition: all 0.2s ease;
}

.jeune-row:hover {
  background-color: #f0f7ff !important;
  transform: translateX(2px);
}

.sticky-header {
  position: sticky;
  top: 0;
  background: #edeff0;
  z-index: 2;
}

.badge.rounded-pill {
  border-radius: 50rem !important;
  min-width: 2.5rem;
}

.btn-icon {
  width: 32px;
  height: 32px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0;
}

.modal-fullscreen-sm-down {
  max-width: 95%;
  margin: 1rem auto;
}

.jeune-item {
  cursor: pointer;
  transition: all 0.2s ease;
}

.jeune-item:hover {
  background-color: #f8f9fa;
  padding-left: 10px;
}

.jeune-item .mdi-chevron-right {
  opacity: 0.5;
  transition: all 0.2s ease;
}

.jeune-item:hover .mdi-chevron-right {
  opacity: 1;
  transform: translateX(3px);
}

@media (max-width: 992px) {
  .d-none-d-lg-block {
    display: none !important;
  }
  
  .modal-fullscreen-sm-down {
    max-width: 100%;
    margin: 0;
    height: 100%;
  }
  
  .modal-content {
    height: 100%;
    border-radius: 0;
  }
}

@media (max-width: 768px) {
  .table-container {
    max-height: 25rem;
  }
  
  .card-header {
    flex-direction: column;
    align-items: stretch;
    gap: 0.5rem;
    padding: 0.75rem;
  }
  
  select.form-select-sm {
    width: 100%;
  }
  
  .modal-dialog {
    margin: 0.5rem;
  }
  
  .list-group-item {
    padding: 0.75rem;
  }
  
  .jeune-item:hover {
    padding-left: 15px;
  }
  
  .btn-primary {
    padding: 0.25rem 0.5rem;
    font-size: 0.875rem;
  }
}

@media (max-width: 576px) {
  .table-container {
    font-size: 0.875rem;
  }
  
  th, td {
    padding: 0.5rem;
  }
  
  .badge {
    font-size: 0.75rem;
  }
  
  .btn-icon {
    width: 28px;
    height: 28px;
  }
  
  .modal-body {
    padding: 1rem;
  }
}

/* Animation pour le modal */
.modal.fade.show {
  animation: modalFadeIn 0.3s ease-out;
}

@keyframes modalFadeIn {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Style pour le bouton imprimer */
.btn-primary {
  background-color: #4361ee;
  border-color: #4361ee;
}

.btn-primary:hover {
  background-color: #3a56d4;
  border-color: #3a56d4;
}

/* Ajustements pour les petits badges */
.badge {
  font-weight: 500;
}
</style>