<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from 'vue-toastification'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'
import axios from 'axios'
import badgeJeunesImage from '/assets/img/badge-jeunes.jpg'
import badgeRespImage from '/assets/img/badge-resp.png'
import badgeVisitImage from '/assets/img/badge-visit.jpeg'

const router = useRouter()
const toast = useToast()

const selectedPersons = ref([])
const layoutJeunes = ref([])
const layoutResponsable = ref([])
const layoutVisiteur = ref([])
const currentPage = ref(1)
const isGeneratingPDF = ref(false)
let paroisse = ''

const API = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api'

// Dimensions de référence pour les calculs de positionnement
const EDITOR_WIDTH = 400
const EDITOR_HEIGHT = 600

// Cache pour les services
const servicesCache = ref({
  informatiques: [],
  administrations: [],
  finances: [],
  hebergement: [],
})

// Charger les services depuis les APIs
const loadServices = async () => {
  const token = localStorage.getItem('token')
  const endpoints = [
    { key: 'informatiques', url: `${API}/informatiques` },
    { key: 'administrations', url: `${API}/administrations` },
    { key: 'finances', url: `${API}/finances` },
    { key: 'hebergement', url: `${API}/hebergements` },
  ]

  try {
    const promises = endpoints.map(async ({ key, url }) => {
      try {
        const response = await axios.get(url, {
          headers: { Authorization: `Bearer ${token}` },
        })
        servicesCache.value[key] = response.data['hydra:member'] || []
      } catch (error) {
        servicesCache.value[key] = []
      }
    })

    await Promise.all(promises)
  } catch (error) {}
}

// Vérifier si une personne est dans un service spécifique
const isPersonInService = (personId, serviceType) => {
  const serviceList = servicesCache.value[serviceType] || []
  return serviceList.some((item) => {
    if (item.user && Array.isArray(item.user)) {
      return item.user.some((user) => {
        const userId = typeof user === 'string' ? user.split('/').pop() : user?.id || user
        return userId == personId
      })
    }
    return false
  })
}

// Fonction pour mettre à jour le badge du participator
const updateParticipatorBadge = async (id) => {
  const token = localStorage.getItem('token')
  try {
    await axios.patch(
      `${API}/participators/${id}`,
      { badge: true },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/merge-patch+json',
        },
      },
    )
    return true
  } catch (error) {
    throw error
  }
}

// Obtenir le libellé du service pour un responsable
const getServiceLabel = (person) => {
  if (!person.isResponsable) {
    return person.service || 'Service'
  }

  if (person.isDicoces || person.isDecoces) {
    return 'Service Diocésain'
  }

  const isInInformatiques = isPersonInService(person.id, 'informatiques')
  const isInAdministrations = isPersonInService(person.id, 'administrations')
  const isInFinances = isPersonInService(person.id, 'finances')
  const isInHebergement = isPersonInService(person.id, 'hebergement')

  if (isInAdministrations) {
    return 'Commission Administration'
  } else if (isInFinances) {
    return 'Commission Finances'
  } else if (isInInformatiques) {
    return 'Commission Secrétariat'
  } else if (isInHebergement) {
    return 'Commission Hébergement'
  }

  return person.service
}

// Dimensions réelles du badge dans l'aperçu A4
const getPreviewBadgeDimensions = () => {
  const pageWidthMM = 210
  const pageHeightMM = 297
  const paddingMM = 10
  const gapMM = 5

  const availableWidthMM = pageWidthMM - 2 * paddingMM - gapMM
  const availableHeightMM = pageHeightMM - 2 * paddingMM - gapMM

  const badgeWidthMM = availableWidthMM / 2
  const badgeHeightMM = availableHeightMM / 2

  return { badgeWidthMM, badgeHeightMM }
}

// Fonction pour convertir mm en pixels
const mmToPx = (mm) => mm * 3.78

// Fonction pour ajuster les positions selon le ratio de redimensionnement
const getAdjustedField = (field) => {
  if (!field) {
    return { x: 0, y: 0, fontSize: 12, width: 100, height: 40, color: '#000000' }
  }

  const { badgeWidthMM, badgeHeightMM } = getPreviewBadgeDimensions()
  const badgeWidthPx = mmToPx(badgeWidthMM)
  const badgeHeightPx = mmToPx(badgeHeightMM)

  const scaleX = badgeWidthPx / EDITOR_WIDTH
  const scaleY = badgeHeightPx / EDITOR_HEIGHT
  const scale = Math.min(scaleX, scaleY)

  return {
    x: (field.x || 0) * scale,
    y: (field.y || 0) * scale,
    fontSize: (field.fontSize || 14) * scale,
    width: (field.width || 100) * scale,
    height: (field.height || 40) * scale,
    color: field.color || '#000000',
  }
}

// Charger les données
const loadData = async () => {
  await loadServices()

  const savedPersons = sessionStorage.getItem('selectedPersonsForBadges')
  if (savedPersons) {
    try {
      selectedPersons.value = JSON.parse(savedPersons)

      selectedPersons.value.forEach((person) => {
        if (person.isResponsable) {
          person.serviceLabel = getServiceLabel(person)
        }
      })
    } catch (error) {
      selectedPersons.value = []
    }
  } else {
    selectedPersons.value = []
  }

  const savedLayoutJeunes = localStorage.getItem('badgeLayout_jeunes')
  if (savedLayoutJeunes) {
    try {
      const layoutData = JSON.parse(savedLayoutJeunes)
      if (layoutData.fields) {
        layoutJeunes.value = layoutData.fields
      }
    } catch (e) {
      layoutJeunes.value = []
    }
  } else {
    layoutJeunes.value = []
  }

  const savedLayoutResp = localStorage.getItem('badgeLayout_responsable')
  if (savedLayoutResp) {
    try {
      const layoutData = JSON.parse(savedLayoutResp)
      if (layoutData.fields) {
        layoutResponsable.value = layoutData.fields
      }
    } catch (e) {
      layoutResponsable.value = []
    }
  } else {
    layoutResponsable.value = []
  }

  const savedLayoutVisit = localStorage.getItem('badgeLayout_visiteur')
  if (savedLayoutVisit) {
    try {
      const layoutData = JSON.parse(savedLayoutVisit)
      if (layoutData.fields) {
        layoutVisiteur.value = layoutData.fields
      }
    } catch (e) {
      layoutVisiteur.value = []
    }
  } else {
    layoutVisiteur.value = []
  }
}

// Obtenir le layout approprié selon le type de personne
const getLayoutForPerson = (person) => {
  if (!person) return []

  if (person.isResponsable) {
    return layoutResponsable.value.length > 0 ? layoutResponsable.value : []
  } else if (person.dortoir === 0 || person.dortoir === '0') {
    return layoutVisiteur.value.length > 0 ? layoutVisiteur.value : layoutJeunes.value
  } else {
    return layoutJeunes.value.length > 0 ? layoutJeunes.value : []
  }
}

// Diviser les personnes en pages (4 badges par page)
const pages = computed(() => {
  const pagesArray = []
  for (let i = 0; i < selectedPersons.value.length; i += 4) {
    pagesArray.push(selectedPersons.value.slice(i, i + 4))
  }
  return pagesArray
})

// Nombre total de pages
const totalPages = computed(() => pages.value.length)

// Page actuelle
const currentPagePersons = computed(() => {
  return pages.value[currentPage.value - 1] || []
})

// Navigation entre les pages
const goToPage = (page) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
  }
}

// Obtenir la valeur d'un champ pour une personne
const getPersonValue = (person, key) => {
  if (!person) return ''

  const siteValue =
    person.carrefour === 0 || person.carrefour === '0'
      ? 'Rafiki'
      : person.carrefour
        ? `Carrefour ${person.carrefour}`
        : 'Carrefour'

  const sleepValue =
    person.dortoir === 0 || person.dortoir === '0'
      ? 'Visiteur'
      : person.dortoir
        ? `Dortoir ${person.dortoir}`
        : 'Dortoir'

  const mapping = {
    name: person.nom || person.prenom || '',
    church: person.paroisse || 'Paroisse',
    site: siteValue,
    sleep: sleepValue,
    service: person.serviceLabel || person.service || 'Service',
  }

  paroisse = person.paroisse || ''
  return mapping[key] || person[key] || ''
}

// Mise à jour par lot des badges
const updateBadgesBatch = async (personIds) => {
  const token = localStorage.getItem('token')
  const results = []

  for (const id of personIds) {
    try {
      await axios.patch(
        `${API}/participators/${id}`,
        { badge: true },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/merge-patch+json',
          },
        },
      )
      results.push({ id, success: true })
    } catch (error) {
      results.push({ id, success: false, error })
    }
  }

  return results
}

// Imprimer toutes les pages
const printAllPages = async () => {
  if (selectedPersons.value.length === 0) {
    toast.warning('Aucun badge à imprimer')
    return
  }

  isGeneratingPDF.value = true
  toast.info('Téléchargement du PDF en cours...')

  try {
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    })

    for (let i = 0; i < pages.value.length; i++) {
      const pagePersons = pages.value[i]
      const pageData = await generateA4Page(pagePersons, i + 1)

      if (i > 0) {
        pdf.addPage()
      }

      const pageWidth = 210
      const pageHeight = 297
      const margin = 5

      const imgWidth = pageWidth - 2 * margin
      const imgHeight = pageHeight - 2 * margin

      pdf.addImage(pageData.imgData, 'JPEG', margin, margin, imgWidth, imgHeight)

      pdf.setFontSize(10)
      pdf.setTextColor(128, 128, 128)
      pdf.text(`Page ${i + 1} / ${pages.value.length}`, pageWidth / 2, pageHeight - 5, {
        align: 'center',
      })
    }

    const fileName = `badges_${paroisse} ${new Date().toISOString().split('T')[0]}.pdf`
    pdf.save(fileName)

    toast.info('Mise à jour des badges en cours...')

    const personIds = selectedPersons.value.map((person) => person.id)
    const updateResults = await updateBadgesBatch(personIds)

    const successfulUpdates = updateResults.filter((r) => r.success).length
    const failedUpdates = updateResults.filter((r) => !r.success).length

    if (failedUpdates === 0) {
      toast.success(`${successfulUpdates} badges mis à jour avec succès!`)
    } else {
      toast.warning(`${successfulUpdates} badges mis à jour, ${failedUpdates} échecs`)
    }

    sessionStorage.removeItem('selectedPersonsForBadges')

    setTimeout(() => {
      router.push({
        name: 'info-person-selector',
        params: {
          serviceType: 'person-selector',
          id: 'badge',
        },
      })
    }, 2000)
  } catch (error) {
    toast.error('Erreur lors de la génération du PDF')
  } finally {
    isGeneratingPDF.value = false
  }
}

// Imprimer la page actuelle
const printCurrentPage = async () => {
  if (currentPagePersons.value.length === 0) {
    toast.warning('Aucun badge sur cette page')
    return
  }

  isGeneratingPDF.value = true
  toast.info('Génération du PDF en cours...')

  try {
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    })

    const pageData = await generateA4Page(currentPagePersons.value, currentPage.value)

    const pageWidth = 210
    const pageHeight = 297
    const margin = 5

    const imgWidth = pageWidth - 2 * margin
    const imgHeight = pageHeight - 2 * margin

    pdf.addImage(pageData.imgData, 'JPEG', margin, margin, imgWidth, imgHeight)

    pdf.setFontSize(10)
    pdf.setTextColor(128, 128, 128)
    pdf.text(`Page ${currentPage.value} / ${totalPages.value}`, pageWidth / 2, pageHeight - 5, {
      align: 'center',
    })

    const fileName = `badges_page_${currentPage.value}.pdf`
    pdf.save(fileName)

    toast.info('Mise à jour des badges en cours...')

    const personIds = currentPagePersons.value.map((person) => person.id)
    const updateResults = await updateBadgesBatch(personIds)

    const successfulUpdates = updateResults.filter((r) => r.success).length
    const failedUpdates = updateResults.filter((r) => !r.success).length

    if (failedUpdates === 0) {
      toast.success(`Page ${currentPage.value} imprimée et ${successfulUpdates} badges mis à jour!`)
    } else {
      toast.warning(
        `Page ${currentPage.value} imprimée, ${successfulUpdates} mis à jour, ${failedUpdates} échecs`,
      )
    }
  } catch (error) {
    toast.error('Erreur lors de la génération du PDF')
  } finally {
    isGeneratingPDF.value = false
  }
}

// Retourner à la sélection
const goBackToSelection = () => {
  router.push({
    name: 'info-person-selector',
    params: {
      serviceType: 'person-selector',
      id: 'badge',
    },
  })
}

// Générer une page A4 avec 4 badges
const generateA4Page = (personsOnPage, pageNumber) => {
  return new Promise((resolve, reject) => {
    try {
      const pageElement = document.createElement('div')
      pageElement.style.cssText = `
        width: 210mm;
        height: 297mm;
        display: grid;
        grid-template-columns: 1fr 1fr;
        grid-template-rows: 1fr 1fr;
        gap: 10mm;
        padding: 5mm;
        box-sizing: border-box;
        background: white;
        position: absolute;
        left: -10000px;
        top: -10000px;
      `

      const { badgeWidthMM, badgeHeightMM } = getPreviewBadgeDimensions()
      const badgeWidthPx = mmToPx(badgeWidthMM)
      const badgeHeightPx = mmToPx(badgeHeightMM)

      personsOnPage.forEach((person, index) => {
        const badgeElement = document.createElement('div')
        badgeElement.style.cssText = `
          position: relative;
          width: 100%;
          height: 100%;
          overflow: hidden;
          border: 1px solid #eee;
          border-radius: 4px;
          box-sizing: border-box;
        `

        let badgeImage
        if (person.isResponsable) {
          badgeImage = badgeRespImage
        } else if (person.dortoir === 0 || person.dortoir === '0') {
          badgeImage = badgeVisitImage
        } else {
          badgeImage = badgeJeunesImage
        }

        const img = document.createElement('img')
        img.src = badgeImage
        img.style.cssText = `
          width: 100%;
          height: 100%;
          object-fit: cover;
          position: absolute;
          top: 0;
          left: 0;
        `
        badgeElement.appendChild(img)

        const layout = getLayoutForPerson(person)
        layout.forEach((field) => {
          if (!field) return

          const textElement = document.createElement('div')
          const textValue = getPersonValue(person, field.key)
          const adjusted = getAdjustedField(field)

          textElement.style.cssText = `
            position: absolute;
            top: ${adjusted.y}px;
            left: ${adjusted.x}px;
            color: ${adjusted.color || '#000000'};
            font-size: ${adjusted.fontSize}pt;
            font-family: 'Arial, sans-serif';
            font-weight: bold;
            height: ${adjusted.height}px;
            display: flex;
            align-items: center;
            justify-content: center;
            text-align: center;
            white-space: normal;
            overflow: visible;
            text-overflow: clip;
            z-index: 10;
            pointer-events: none;
            line-height: 1.2;
            word-wrap: break-word;
            overflow-wrap: break-word;
          `

          textElement.textContent = textValue
          badgeElement.appendChild(textElement)
        })

        pageElement.appendChild(badgeElement)
      })

      for (let i = personsOnPage.length; i < 4; i++) {
        const emptyBadge = document.createElement('div')
        emptyBadge.style.cssText = `
          width: 100%;
          height: 100%;
          border: 2px dashed #ddd;
          border-radius: 4px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          background: #f8f9fa;
          box-sizing: border-box;
        `
        pageElement.appendChild(emptyBadge)
      }

      document.body.appendChild(pageElement)

      html2canvas(pageElement, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
      })
        .then((canvas) => {
          document.body.removeChild(pageElement)
          const imgData = canvas.toDataURL('image/jpeg', 0.95)
          resolve({
            imgData,
            width: canvas.width,
            height: canvas.height,
          })
        })
        .catch((error) => {
          document.body.removeChild(pageElement)
          reject(error)
        })
    } catch (error) {
      reject(error)
    }
  })
}

onMounted(() => {
  loadData()
})
</script>

<template>
  <div class="be-content">
    <div class="main-content container-fluid">
      <!-- Informations sur l'impression -->
      <div class="row mb-3">
        <div class="col-12">
          <div class="card card-border-color card-border-color-info">
            <div class="card-body">
              <div class="row align-items-center">
                <div class="col-md-4">
                  <h6 class="mb-0">Total : {{ selectedPersons.length }} badges</h6>
                  <small class="text-muted">{{ totalPages }} page(s) A4</small>
                </div>
                <div class="col-md-4 text-center">
                  <h6 class="mb-0">Page {{ currentPage }} / {{ totalPages }}</h6>
                  <small class="text-muted"
                    >{{ currentPagePersons.length }} badge(s) sur cette page</small
                  >
                </div>
                <div class="col-md-4 p-0 text-end">
                  <div class="btn-group" role="group">
                    <button
                      class="btn btn-primary btn-sm mr-2 shadow-sm"
                      @click="goToPage(currentPage - 1)"
                      :disabled="currentPage === 1"
                    >
                      <i class="mdi mdi-chevron-left"></i>
                    </button>
                    <button
                      class="btn btn-primary btn-sm shadow-sm"
                      @click="goToPage(currentPage + 1)"
                      :disabled="currentPage === totalPages"
                    >
                      <i class="mdi mdi-chevron-right"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Aperçu de la page A4 -->
      <div class="row justify-content-center">
        <div class="col-12">
          <div class="card card-border-color card-border-color-primary">
            <div class="card-header text-center">
              <h5 class="card-title">Aperçu page {{ currentPage }}</h5>
              <small class="text-muted">
                {{ selectedPersons.filter((p) => p.isResponsable).length }} responsable(s),
                {{ selectedPersons.filter((p) => !p.isResponsable).length }} jeune(s)
              </small>
            </div>
            <div class="card-body d-flex justify-content-center">
              <div class="a4-preview mt-1">
                <div class="a4-page">
                  <div
                    v-for="(person, index) in currentPagePersons"
                    :key="person.id"
                    class="badge-slot"
                  >
                    <div class="badge">
                      <img
                        :src="
                          person.isResponsable
                            ? badgeRespImage
                            : person.dortoir === 0 || person.dortoir === '0'
                              ? badgeVisitImage
                              : badgeJeunesImage
                        "
                        alt="badge"
                        class="badge-bg"
                      />

                      <div
                        v-for="(field, i) in getLayoutForPerson(person)"
                        :key="i"
                        class="text"
                        :style="{
                          position: 'absolute',
                          top: field.y + 'px',
                          left: field.x + 'px',
                          color: field.color || '#000000',
                          fontSize: field.fontSize + 'pt',
                          fontFamily: 'Arial, sans-serif',
                          fontWeight: 'bold',
                          height: field.height + 'px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          textAlign: 'center',
                          whiteSpace: 'normal',
                          overflow: 'visible',
                          textOverflow: 'clip',
                          pointerEvents: 'none',
                          zIndex: 10,
                          lineHeight: '1.2',
                          wordWrap: 'break-word',
                          overflowWrap: 'break-word',
                        }"
                      >
                        {{ getPersonValue(person, field.key) }}
                      </div>
                    </div>
                  </div>

                  <!-- Emplacements vides -->
                  <div
                    v-for="n in 4 - currentPagePersons.length"
                    :key="'empty-' + n"
                    class="badge-slot empty"
                  >
                    <div class="empty-badge">
                      <i class="mdi mdi-plus mdi-24px text-muted"></i>
                      <small class="text-muted">Vide</small>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Boutons d'action -->
      <div class="row mt-4">
        <div class="col-12 d-flex justify-content-center gap-3">
          <button
            @click="goBackToSelection"
            class="btn btn-secondary btn-lg"
            type="button"
            :disabled="isGeneratingPDF"
          >
            <i class="mdi mdi-arrow-left mr-1"></i>
            Retour à la sélection
          </button>
          <button
            @click="printAllPages"
            class="btn btn-success btn-lg"
            type="button"
            :disabled="selectedPersons.length === 0 || isGeneratingPDF"
          >
            <i class="mdi mdi-print mr-2"></i>
            {{ isGeneratingPDF ? 'Génération en cours...' : 'Imprimer (' + totalPages + ' pages)' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.a4-preview {
  transform: scale(0.5);
  transform-origin: top center;
  margin: -50px 0;
}

.a4-page {
  width: 240mm;
  height: 347mm;
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: 1fr 1fr;
  gap: 5mm;
  padding: 10mm;
  border: 2px solid #ddd;
  border-radius: 8px;
  background: white;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  box-sizing: border-box;
}

.badge-slot {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.badge {
  position: relative;
  width: 400px;
  height: 600px;
  border-radius: 4px;
  overflow: hidden;
  background: white;
  border: 1px solid #eee;
}

.badge-bg {
  width: 100%;
  height: 100%;
  position: absolute;
  left: 0;
  top: 0;
  object-fit: cover;
  object-position: center;
}

.text {
  position: absolute;
  pointer-events: none;
  line-height: 1.2;
  white-space: normal;
  overflow: visible;
  text-overflow: clip;
  word-wrap: break-word;
  overflow-wrap: break-word;
}

.empty-badge {
  width: 100%;
  height: 100%;
  border: 2px dashed #ddd;
  border-radius: 4px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: #f8f9fa;
}

.gap-3 {
  gap: 1rem;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

@media print {
  .be-content {
    display: none;
  }
}

@media (max-width: 768px) {
  .a4-preview {
    transform: scale(0.4);
    margin: -80px 0;
  }
}
</style>
