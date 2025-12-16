<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from 'vue-toastification'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'
import axios from 'axios'
import badgeJeunesImage from '/assets/img/badge-jeunes.jpg'
import badgeRespImage from '/assets/img/badge-resp.png'

const router = useRouter()
const toast = useToast()

const selectedPersons = ref([])
const layoutJeunes = ref([])
const layoutResponsable = ref([])
const currentPage = ref(1)
const isGeneratingPDF = ref(false)
let paroisse = ''

const API = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api'

// Dimensions de référence pour les calculs de positionnement
const EDITOR_WIDTH = 400 // Largeur du badge dans l'éditeur (px)
const EDITOR_HEIGHT = 600 // Hauteur du badge dans l'éditeur (px)

// Cache pour les services
const servicesCache = ref({
  informatiques: [],
  administrations: [],
  finances: [],
  hebergement: []
})

// Charger les services depuis les APIs
const loadServices = async () => {
  const token = localStorage.getItem('token')
  const endpoints = [
    { key: 'informatiques', url: `${API}/informatiques` },
    { key: 'administrations', url: `${API}/administrations` },
    { key: 'finances', url: `${API}/finances` },
    { key: 'hebergement', url: `${API}/hebergements` }
  ]

  try {
    const promises = endpoints.map(async ({ key, url }) => {
      try {
        const response = await axios.get(url, {
          headers: { Authorization: `Bearer ${token}` }
        })
        servicesCache.value[key] = response.data['hydra:member'] || []
      } catch (error) {
        console.error(`Erreur lors du chargement des ${key}:`, error)
        servicesCache.value[key] = []
      }
    })

    await Promise.all(promises)
  } catch (error) {
    console.error('Erreur lors du chargement des services:', error)
  }
}

// Vérifier si une personne est dans un service spécifique
const isPersonInService = (personId, serviceType) => {
  const serviceList = servicesCache.value[serviceType] || []
  return serviceList.some(item => {
    if (item.user && Array.isArray(item.user)) {
      return item.user.some(user => {
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
    // Utiliser application/merge-patch+json comme spécifié
    await axios.patch(
      `${API}/participators/${id}`,
      { badge: true },
      {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/merge-patch+json'
        }
      }
    )
    return true
  } catch (error) {
    console.error(`Erreur lors de la mise à jour du participator ${id}:`, error)
    throw error
  }
}

// Obtenir le libellé du service pour un responsable
const getServiceLabel = (person) => {
  if (!person.isResponsable) {
    return person.service || 'Service'
  }

  // Si la personne est diocésaine (isDicoces)
  if (person.isDicoces || person.isDecoces) {
    return 'Service Diocésain'
  }

  // Vérifier dans quel(s) service(s) la personne se trouve
  const isInInformatiques = isPersonInService(person.id, 'informatiques')
  const isInAdministrations = isPersonInService(person.id, 'administrations')
  const isInFinances = isPersonInService(person.id, 'finances')
  const isInHebergement = isPersonInService(person.id, 'hebergement')

  // Déterminer le libellé en fonction des services
  if (isInAdministrations) {
    return 'Commission Administration'
  } else if (isInFinances) {
    return 'Commission Finances'
  } else if (isInInformatiques) {
    return 'Commission Secrétariat'
  } else if (isInHebergement) {
    return 'Commission Hébergement'
  }

  // Si aucun service spécifique n'est trouvé
  return person.service
}

// Dimensions réelles du badge dans l'aperçu A4 (calculées en fonction de l'espace disponible)
const getPreviewBadgeDimensions = () => {
  // Dimensions d'une page A4 en mm
  const pageWidthMM = 210
  const pageHeightMM = 297
  const paddingMM = 10
  const gapMM = 5

  // Espace disponible pour les badges
  const availableWidthMM = pageWidthMM - 2 * paddingMM - gapMM
  const availableHeightMM = pageHeightMM - 2 * paddingMM - gapMM

  // Dimensions d'un badge (2x2 sur la page)
  const badgeWidthMM = availableWidthMM / 2
  const badgeHeightMM = availableHeightMM / 2

  return { badgeWidthMM, badgeHeightMM }
}

// Fonction pour convertir mm en pixels (pour html2canvas)
const mmToPx = (mm) => mm * 3.78 // 1mm = 3.78px à 96 DPI

// Fonction pour ajuster les positions selon le ratio de redimensionnement
const getAdjustedField = (field) => {
  const { badgeWidthMM, badgeHeightMM } = getPreviewBadgeDimensions()
  const badgeWidthPx = mmToPx(badgeWidthMM)
  const badgeHeightPx = mmToPx(badgeHeightMM)

  // Calculer les ratios de redimensionnement
  const scaleX = badgeWidthPx / EDITOR_WIDTH
  const scaleY = badgeHeightPx / EDITOR_HEIGHT

  // Pour conserver les proportions, utiliser le même ratio
  const scale = Math.min(scaleX, scaleY)

  return {
    x: field.x * scale,
    y: field.y * scale,
    fontSize: field.fontSize * scale,
    width: field.width * scale,
    height: field.height * scale,
    color: field.color,
  }
}

// Charger les données
const loadData = async () => {
  // Charger les services d'abord
  await loadServices()
  
  // Charger les personnes sélectionnées depuis la page précédente
  const savedPersons = sessionStorage.getItem('selectedPersonsForBadges')
  if (savedPersons) {
    selectedPersons.value = JSON.parse(savedPersons)
    
    // Ajouter le libellé de service correct pour chaque personne
    selectedPersons.value.forEach(person => {
      if (person.isResponsable) {
        person.serviceLabel = getServiceLabel(person)
      }
    })
  }

  // Charger la configuration du badge jeunes
  const savedLayoutJeunes = localStorage.getItem('badgeLayout_jeunes')
  if (savedLayoutJeunes) {
    try {
      const layoutData = JSON.parse(savedLayoutJeunes)
      if (layoutData.fields) {
        layoutJeunes.value = layoutData.fields
      }
    } catch (e) {
      console.error('Erreur lors du chargement de la configuration jeunes:', e)
    }
  } else {
    console.warn('Aucune configuration trouvée pour les badges jeunes')
  }

  // Charger la configuration du badge responsable
  const savedLayoutResp = localStorage.getItem('badgeLayout_responsable')
  if (savedLayoutResp) {
    try {
      const layoutData = JSON.parse(savedLayoutResp)
      if (layoutData.fields) {
        layoutResponsable.value = layoutData.fields
      }
    } catch (e) {
      console.error('Erreur lors du chargement de la configuration responsable:', e)
    }
  } else {
    console.warn('Aucune configuration trouvée pour les badges responsables')
  }
}

// Obtenir le layout approprié selon le type de personne
const getLayoutForPerson = (person) => {
  return person.isResponsable ? layoutResponsable.value : layoutJeunes.value
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
  const mapping = {
    name: person.nom || person.prenom || '',
    church: person.paroisse || 'Paroisse',
    site: person.carrefour ? `Carrefour ${person.carrefour}` : 'Carrefour',
    sleep: person.dortoir ? `Dortoir ${person.dortoir}` : 'Dortoir',
    service: person.serviceLabel || person.service || 'Service',
  }
  paroisse = person.paroisse || ''
  return mapping[key] || person[key] || ''
}

// Générer une page A4 avec 4 badges
const generateA4Page = (personsOnPage, pageNumber) => {
  return new Promise((resolve, reject) => {
    try {
      // Créer un élément temporaire pour la page A4
      const pageElement = document.createElement('div')
      pageElement.style.cssText = `
        width: 210mm;
        height: 297mm;
        display: grid;
        grid-template-columns: 1fr 1fr;
        grid-template-rows: 1fr 1fr;
        gap: 5mm;
        padding: 10mm;
        box-sizing: border-box;
        background: white;
        position: absolute;
        left: -10000px;
        top: -10000px;
      `

      // Calculer les dimensions d'un badge dans la page A4
      const { badgeWidthMM, badgeHeightMM } = getPreviewBadgeDimensions()
      const badgeWidthPx = mmToPx(badgeWidthMM)
      const badgeHeightPx = mmToPx(badgeHeightMM)

      // Ajouter les badges à la page
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

        // Créer l'image de fond
        const img = document.createElement('img')
        img.src = person.isResponsable ? badgeRespImage : badgeJeunesImage
        img.style.cssText = `
          width: 100%;
          height: 100%;
          object-fit: cover;
          position: absolute;
          top: 0;
          left: 0;
        `
        badgeElement.appendChild(img)

        // Ajouter les champs de texte avec les positions ajustées
        const layout = getLayoutForPerson(person)
        layout.forEach((field) => {
          const textElement = document.createElement('div')
          const textValue = getPersonValue(person, field.key)

          // Ajuster les positions selon le ratio
          const adjusted = getAdjustedField(field)

          textElement.style.cssText = `
            position: absolute;
            top: ${adjusted.y}px;
            left: ${adjusted.x}px;
            color: ${adjusted.color || '#000000'};
            font-size: ${adjusted.fontSize}pt;
            font-family: 'Arial, sans-serif';
            font-weight: bold;
            width: ${adjusted.width}px;
            height: ${adjusted.height}px;
            display: flex;
            align-items: center;
            justify-content: center;
            text-align: center;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            z-index: 10;
            pointer-events: none;
            line-height: 1.2;
          `

          textElement.textContent = textValue
          badgeElement.appendChild(textElement)
        })

        pageElement.appendChild(badgeElement)
      })

      // Ajouter des badges vides si nécessaire
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

      // Convertir l'élément en canvas
      html2canvas(pageElement, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
      })
        .then((canvas) => {
          // Nettoyer
          document.body.removeChild(pageElement)

          // Convertir le canvas en image data URL
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
            'Content-Type': 'application/merge-patch+json'
          }
        }
      )
      results.push({ id, success: true })
    } catch (error) {
      console.error(`Erreur lors de la mise à jour du participator ${id}:`, error)
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
    // Créer un nouveau PDF
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    })

    // Générer chaque page
    for (let i = 0; i < pages.value.length; i++) {
      const pagePersons = pages.value[i]

      const pageData = await generateA4Page(pagePersons, i + 1)

      // Ajouter la page au PDF
      if (i > 0) {
        pdf.addPage()
      }

      // Calculer les dimensions pour s'adapter à la page A4
      const pageWidth = 210 // mm
      const pageHeight = 297 // mm
      const margin = 5 // mm

      const imgWidth = pageWidth - 2 * margin
      const imgHeight = pageHeight - 2 * margin

      pdf.addImage(pageData.imgData, 'JPEG', margin, margin, imgWidth, imgHeight)

      // Ajouter un pied de page avec le numéro de page
      pdf.setFontSize(10)
      pdf.setTextColor(128, 128, 128)
      pdf.text(`Page ${i + 1} / ${pages.value.length}`, pageWidth / 2, pageHeight - 5, {
        align: 'center',
      })
    }

    // Sauvegarder le PDF
    const fileName = `badges_${paroisse} ${new Date().toISOString().split('T')[0]}.pdf`
    pdf.save(fileName)

    // Mettre à jour les badges dans l'API
    toast.info('Mise à jour des badges en cours...')
    
    const personIds = selectedPersons.value.map(person => person.id)
    const updateResults = await updateBadgesBatch(personIds)
    
    const successfulUpdates = updateResults.filter(r => r.success).length
    const failedUpdates = updateResults.filter(r => !r.success).length
    
    if (failedUpdates === 0) {
      toast.success(`${successfulUpdates} badges mis à jour avec succès!`)
    } else {
      toast.warning(`${successfulUpdates} badges mis à jour, ${failedUpdates} échecs`)
    }

    // Nettoyer et retourner
    sessionStorage.removeItem('selectedPersonsForBadges')

    // Retourner à la page ListPeople après 2 secondes
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
    console.error('Erreur lors de la génération du PDF:', error)
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
    // Créer un nouveau PDF
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    })

    const pageData = await generateA4Page(currentPagePersons.value, currentPage.value)

    // Calculer les dimensions pour s'adapter à la page A4
    const pageWidth = 210 // mm
    const pageHeight = 297 // mm
    const margin = 5 // mm

    const imgWidth = pageWidth - 2 * margin
    const imgHeight = pageHeight - 2 * margin

    pdf.addImage(pageData.imgData, 'JPEG', margin, margin, imgWidth, imgHeight)

    // Ajouter un pied de page
    pdf.setFontSize(10)
    pdf.setTextColor(128, 128, 128)
    pdf.text(`Page ${currentPage.value} / ${totalPages.value}`, pageWidth / 2, pageHeight - 5, {
      align: 'center',
    })

    // Sauvegarder le PDF
    const fileName = `badges_page_${currentPage.value}.pdf`
    pdf.save(fileName)

    // Mettre à jour les badges des personnes de cette page
    toast.info('Mise à jour des badges en cours...')

    const personIds = currentPagePersons.value.map(person => person.id)
    const updateResults = await updateBadgesBatch(personIds)
    
    const successfulUpdates = updateResults.filter(r => r.success).length
    const failedUpdates = updateResults.filter(r => !r.success).length
    
    if (failedUpdates === 0) {
      toast.success(`Page ${currentPage.value} imprimée et ${successfulUpdates} badges mis à jour!`)
    } else {
      toast.warning(`Page ${currentPage.value} imprimée, ${successfulUpdates} mis à jour, ${failedUpdates} échecs`)
    }
  } catch (error) {
    console.error('Erreur lors de la génération du PDF:', error)
    toast.error('Erreur lors de la génération du PDF: ' + error.message)
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
                        :src="person.isResponsable ? badgeRespImage : badgeJeunesImage"
                        alt="badge"
                        class="badge-bg"
                      />

                      <div
                        v-for="(field, i) in getLayoutForPerson(person)"
                        :key="i"
                        class="text"
                        :style="{
                          position: 'absolute',
                          top: getAdjustedField(field).y + 'px',
                          left: getAdjustedField(field).x + 'px',
                          color: field.color || '#000000',
                          fontSize: getAdjustedField(field).fontSize + 'pt',
                          fontFamily: 'Arial, sans-serif',
                          fontWeight: 'bold',
                          width: getAdjustedField(field).width + 'px',
                          height: getAdjustedField(field).height + 'px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          textAlign: 'center',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          pointerEvents: 'none',
                          zIndex: 10,
                          lineHeight: '1.2',
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

      <!-- Navigation entre les pages -->
      <div class="row mt-3" v-if="totalPages > 1">
        <div class="col-12">
          <div class="card card-border-color card-border-color-secondary">
            <div class="card-body">
              <div class="d-flex justify-content-center">
                <nav>
                  <ul class="pagination">
                    <li class="page-item" :class="{ disabled: currentPage === 1 }">
                      <button class="page-link" @click="goToPage(1)" :disabled="currentPage === 1">
                        <i class="mdi mdi-chevron-double-left"></i>
                      </button>
                    </li>
                    <li class="page-item" :class="{ disabled: currentPage === 1 }">
                      <button
                        class="page-link"
                        @click="goToPage(currentPage - 1)"
                        :disabled="currentPage === 1"
                      >
                        <i class="mdi mdi-chevron-left"></i>
                      </button>
                    </li>

                    <li
                      v-for="page in totalPages"
                      :key="page"
                      class="page-item"
                      :class="{ active: currentPage === page }"
                    >
                      <button class="page-link" @click="goToPage(page)">
                        {{ page }}
                      </button>
                    </li>

                    <li class="page-item" :class="{ disabled: currentPage === totalPages }">
                      <button
                        class="page-link"
                        @click="goToPage(currentPage + 1)"
                        :disabled="currentPage === totalPages"
                      >
                        <i class="mdi mdi-chevron-right"></i>
                      </button>
                    </li>
                    <li class="page-item" :class="{ disabled: currentPage === totalPages }">
                      <button
                        class="page-link"
                        @click="goToPage(totalPages)"
                        :disabled="currentPage === totalPages"
                      >
                        <i class="mdi mdi-chevron-double-right"></i>
                      </button>
                    </li>
                  </ul>
                </nav>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Boutons d'action -->
      <div class="row">
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
  width: 210mm;
  height: 297mm;
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
  width: 100%;
  height: 100%;
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