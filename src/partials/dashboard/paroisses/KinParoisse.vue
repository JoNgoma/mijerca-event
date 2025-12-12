<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useServiceContext } from '@/composables/useServiceContext'
import axios from 'axios'
import { useToast } from 'vue-toastification'

const toast = useToast()
const { currentService } = useServiceContext()

// ==========================
// Déterminer le secteur actif
// ==========================
const sectorService = computed(() => currentService.value.position)
let sectorName = 'KIN EST'
if (sectorService.value === 'est') sectorName = 'KIN EST'
else if (sectorService.value === 'centre') sectorName = 'KIN CENTRE'
else if (sectorService.value === 'ouest') sectorName = 'KIN OUEST'

const descr = computed(() => currentService.value.description)

const API_URL = import.meta.env.VITE_API_BASE_URL
const token = localStorage.getItem('token')
const isLoading = ref(false)
const isEditing = ref(false)
const isUpdating = ref(false)
const showPasswordSection = ref(false)

// ==========================
// Données
// ==========================
const jeunes = ref([])
const paroisses = ref([])
const doyennes = ref([])
const sectors = ref([])
const filteredDoyennes = ref([])
const filteredParoisses = ref([])
const sectorId = ref(null)
const users = ref([])

// Rôles de l'utilisateur connecté
const currentUserRoles = ref(JSON.parse(localStorage.getItem('roles') || '[]'))
const isAdmin = computed(() =>
  currentUserRoles.value.includes('ROLE_ADMIN') ||
  currentUserRoles.value.includes('ROLE_DIOCESE')
)

// ==========================
// FORMATAGE DU NOM COMPLET AVANCÉ
// ==========================
const formatFullName = (fullName) => {
  if (!fullName) return '';
  
  // Liste des prépositions et articles à ne pas capitaliser (sauf en début de nom)
  const lowerCaseWords = ['de', 'du', 'des', 'le', 'la', 'les', 'et', 'à', 'aux', 'en', 'sur', 'sous', 'dans', 'von', 'van'];
  
  // Liste des noms composés spéciaux
  const specialCases = {
    'mcdonald': 'McDonald',
    'macdonald': 'MacDonald',
    'o\'connor': 'O\'Connor',
    'd\'artagnan': 'D\'Artagnan',
    'de la': 'De La',
    'van der': 'Van Der',
    'de l\'': 'De L\'',
    'des ': 'Des ',
    'du ': 'Du ',
    'del ': 'Del '
  };
  
  // Convertir en minuscules
  let formatted = fullName.toLowerCase().trim();
  
  // Appliquer les cas spéciaux d'abord
  Object.entries(specialCases).forEach(([key, value]) => {
    if (formatted.startsWith(key)) {
      formatted = value + formatted.slice(key.length);
    }
  });
  
  // Séparer par espaces
  const words = formatted.split(/\s+/);
  
  // Capitaliser chaque mot selon les règles
  const resultWords = words.map((word, index) => {
    // Capitaliser tous les mots en première position
    if (index === 0) {
      return word.charAt(0).toUpperCase() + word.slice(1);
    }
    
    // Ne pas capitaliser les petits mots (sauf s'ils font partie d'un nom composé)
    if (lowerCaseWords.includes(word.toLowerCase())) {
      // Vérifier si c'est une préposition entre deux parties du nom
      if (index < words.length - 1 && words[index + 1].length > 2) {
        return word.toLowerCase();
      }
    }
    
    // Capitaliser les autres mots
    return word.charAt(0).toUpperCase() + word.slice(1);
  });
  
  // Rejoindre les mots
  let result = resultWords.join(' ');
  
  // Gérer les tirets
  result = result.replace(/-\s*/g, '-').replace(/([a-z])-([a-z])/gi, (match, p1, p2) => {
    return p1.toUpperCase() + '-' + p2.toUpperCase();
  });
  
  // Gérer les apostrophes
  result = result.replace(/'\s*/g, '\'').replace(/([a-z])'([a-z])/gi, (match, p1, p2) => {
    return p1.toUpperCase() + '\'' + p2.toUpperCase();
  });
  
  return result;
};

// ==========================
// PAGINATION OPTIMISÉE
// ==========================
async function fetchAllPages(baseUrl, options = {}) {
  let allItems = [];
  let currentPage = 1;
  let hasMore = true;

  try {
    while (hasMore) {
      const url = new URL(baseUrl);
      url.searchParams.set('page', currentPage);

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
          ...options.headers
        },
        ...options
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.member && Array.isArray(data.member)) {
        allItems = [...allItems, ...data.member];

        // Vérifie s'il y a plus de pages
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
    console.error('Erreur lors de la récupération paginée:', error);
    throw error;
  }
}

// ==========================
// SSE
// ==========================
let eventSource = null

// ==========================
// Récupérer doyennés et paroisses
// ==========================
async function fetchSectorId() {
  isLoading.value = true
  try {
    const res = await fetch(`${API_URL}/sectors?name=${encodeURIComponent(sectorName)}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    const sec = data.member?.find(s => s.name === sectorName)
    if (sec) {
      sectorId.value = sec.id;
      await Promise.all([fetchDoyennes(), fetchParoisses(), fetchSectors(), fetchUsers()]);
    }
  } catch (err) {
    console.error("Erreur récupération secteur", err);
  } finally {
    isLoading.value = false
  }
}

async function fetchPeople() {
  isLoading.value = true
  try {
    const peopleData = await fetchAllPages(`${API_URL}/people`);

    // Trier les personnes par nom complet (ordre alphabétique)
    const sortedPeople = peopleData
      .filter(s => s.sector === `/api/sectors/${sectorId.value}`)
      .sort((a, b) => a.fullName.localeCompare(b.fullName))
      .map(formatPerson) || []

    jeunes.value = sortedPeople;

    // console.log('📊 Personnes chargées:', jeunes.value.length);
  } catch (err) {
    console.error('Erreur récupération des jeunes', err)
  } finally {
    isLoading.value = false
  }
}

async function fetchDoyennes() {
  try {
    const doyennesData = await fetchAllPages(`${API_URL}/doyennes`);
    doyennes.value = doyennesData || [];
    // console.log('📊 Doyennés chargés:', doyennes.value.length);
  } catch (err) {
    console.error("Erreur récupération doyennés", err);
  }
}

async function fetchParoisses() {
  try {
    const paroissesData = await fetchAllPages(`${API_URL}/paroisses`);
    paroisses.value = paroissesData || [];
    // console.log('📊 Paroisses chargées:', paroisses.value.length);
  } catch (err) {
    console.error("Erreur récupération paroisses", err);
  }
}

async function fetchSectors() {
  try {
    const sectorsData = await fetchAllPages(`${API_URL}/sectors`);
    sectors.value = sectorsData || [];
    // console.log('📊 Secteurs chargés:', sectors.value.length);
  } catch (err) {
    console.error("Erreur récupération secteurs", err);
  }
}

async function fetchUsers() {
  try {
    const usersData = await fetchAllPages(`${API_URL}/users`);
    users.value = usersData || [];
    // console.log('📊 Utilisateurs chargés:', users.value.length);
  } catch (err) {
    console.error("Erreur récupération utilisateurs", err);
  }
}

// ==========================
// Fonction utilitaire pour extraire l'ID d'une URL
// ==========================
const extractIdFromUrl = (url) => {
  if (!url) return null;
  return String(url).split('/').filter(Boolean).pop();
}

// ==========================
// Récupérer personnes
// ==========================
function formatPerson(p) {
  let statut = 'Jeune'
  if (p.isDicoces) statut = 'Noyau diocésain'
  else if (p.isDecanal) statut = 'Noyau décanal'
  else if (p.isNoyau) statut = 'Noyau paroissial'

  const doyenneId = extractIdFromUrl(p.doyenne)
  const paroisseId = extractIdFromUrl(p.paroisse)
  const sectorId = extractIdFromUrl(p.sector)

  const doyenne = doyennes.value.find(d => d.id == doyenneId)?.name || `Doyenné ${doyenneId}`
  const paroisse = paroisses.value.find(pa => pa.id == paroisseId)?.name || `Paroisse ${paroisseId}`
  const sector = sectors.value.find(s => s.id == sectorId)?.name || `Secteur ${sectorId}`

  const formattedFullName = formatFullName(p.fullName);
  
  return {
    id: p.id,
    doyenne,
    paroisse,
    sector,
    // Utiliser le nom formaté
    nom: `${p.gender} ${formattedFullName}`,
    fullName: formattedFullName, // Stocker le nom formaté
    originalFullName: p.fullName, // Conserver l'original
    gender: p.gender,
    createdAt: new Date(p.createdAt).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }),
    tel: p.phoneNumber,
    statut,
    doyenneId,
    paroisseId,
    sectorId,
    originalData: {
      isNoyau: p.isNoyau,
      isDecanal: p.isDecanal,
      isDicoces: p.isDicoces,
      phoneNumber: p.phoneNumber,
      sector: p.sector,
      gender: p.gender
    }
  }
}

// ==========================
// Montage / SSE
// ==========================
onMounted(async () => {
  window.App.init()
  window.App.dataTables()

  await fetchSectorId()
  await new Promise(resolve => setTimeout(resolve, 500))
  await fetchPeople()

  eventSource = new EventSource(`${API_URL.replace("/api","")}/sse/people`)
  eventSource.onmessage = (event) => {
    const data = JSON.parse(event.data)
    // console.log("📥 Nouvel enregistrement :", data)

    if (data.sector?.includes(sectorId.value)) {
      // Insérer la nouvelle personne au bon endroit pour maintenir l'ordre alphabétique
      const newPerson = formatPerson(data)
      const index = jeunes.value.findIndex(j => j.fullName.localeCompare(newPerson.fullName) > 0)

      if (index === -1) {
        jeunes.value.push(newPerson)
      } else {
        jeunes.value.splice(index, 0, newPerson)
      }
    }
  }
  eventSource.onerror = (err) => {
    console.error("❌ SSE error", err)
    eventSource.close()
  }
})

onUnmounted(() => {
  if (eventSource) eventSource.close()
})

// ==========================
// Filtres
// ==========================
const filterDoyenne = ref('')
const filterParoisse = ref('')
const filterStatut = ref('')
const search = ref('')

// Options dynamiques
const doyenneOptions = computed(() => [...new Set(jeunes.value.map(j => j.doyenne))])
const paroisseOptions = computed(() => [...new Set(jeunes.value.map(j => j.paroisse))])

// Filtrage avec tri alphabétique maintenu
const filteredJeunes = computed(() => {
  const filtered = jeunes.value.filter(j =>
    (!filterDoyenne.value || j.doyenne === filterDoyenne.value) &&
    (!filterParoisse.value || j.paroisse === filterParoisse.value) &&
    (!filterStatut.value || j.statut === filterStatut.value) &&
    (!search.value || j.nom.toLowerCase().includes(search.value.toLowerCase()) ||
                     j.fullName.toLowerCase().includes(search.value.toLowerCase()))
  )

  // Maintenir l'ordre alphabétique même après filtrage
  return filtered.sort((a, b) => a.fullName.localeCompare(b.fullName))
})

// ==========================
// STATISTIQUES POUR TFOOT
// ==========================
const stats = computed(() => {
  const jeunesFiltres = filteredJeunes.value

  // Compter les doyennés uniques dans les résultats filtrés
  const doyennesUniques = new Set(jeunesFiltres.map(j => j.doyenne))

  // Compter les paroisses uniques dans les résultats filtrés
  const paroissesUniques = new Set(jeunesFiltres.map(j => j.paroisse))

  // Compter les jeunes par statut
  const statutCounts = jeunesFiltres.reduce((acc, jeune) => {
    acc[jeune.statut] = (acc[jeune.statut] || 0) + 1
    return acc
  }, {})

  return {
    totalJeunes: jeunesFiltres.length,
    totalDoyennes: doyennesUniques.size,
    totalParoisses: paroissesUniques.size,
    statutCounts
  }
})

// ==========================
// VALIDATION DU NUMÉRO DE TÉLÉPHONE
// ==========================
const phoneError = ref('')

// Formatage du numéro de téléphone
const formatPhone = (value) => {
  let val = value || ''
  let digits = val.replace(/\D/g, '').slice(0, 10)

  if (digits.length > 7) {
    digits = digits.slice(0, 4) + ' ' + digits.slice(4, 7) + ' ' + digits.slice(7)
  } else if (digits.length > 4) {
    digits = digits.slice(0, 4) + ' ' + digits.slice(4)
  }

  return digits
}

// Validation du numéro de téléphone
const validatePhone = (number) => {
  const cleaned = number.replace(/\s+/g, '')
  const validPrefixes = ["081", "082", "083", "084", "085", "089", "09"]
  const hasValidPrefix = validPrefixes.some(prefix => cleaned.startsWith(prefix))

  if (!cleaned) {
    return "Le numéro de téléphone est requis."
  }
  if (!hasValidPrefix) {
    return "Le numéro doit commencer par 081, 082, 083, 084, 085, 089 ou 09."
  }
  if (cleaned.length < 10) {
    return "Le numéro doit contenir au moins 10 chiffres."
  }
  if (cleaned.length > 10) {
    return "Le numéro ne doit pas dépasser 10 chiffres."
  }
  return ""
}

// Validation du nom complet
const validateFullName = (name) => {
  const cleaned = name.trim()
  const nameRegex = /^[A-Za-zÀ-ÖØ-öø-ÿ]+(?:[-' ][A-Za-zÀ-ÖØ-öø-ÿ]+)*$/
  if (!cleaned) return "Veuillez saisir votre nom complet."
  if (!nameRegex.test(cleaned)) return "Le nom ne doit pas contenir de chiffres ni de symboles, sauf un tiret entre deux mots."
  return ""
}

// ==========================
// Modal et édition
// ==========================
const selectedJeune = ref(null)
const editForm = ref({
  fullName: '',
  phoneNumber: '',
  gender: '',
  createdAt:'',
  sector: '',
  doyenne: '',
  paroisse: '',
  isNoyau: false,
  isDecanal: false,
  isDicoces: false
})
const passwordForm = ref({
  newPassword: '',
  confirmPassword: ''
})

// Vérifier si la personne peut être modifiée
const canEditPerson = computed(() => {
  if (!selectedJeune.value) return false
  if (isAdmin.value) return true
  return !selectedJeune.value.originalData.isNoyau &&
         !selectedJeune.value.originalData.isDecanal &&
         !selectedJeune.value.originalData.isDicoces
})

// Vérifier si la personne a au moins une responsabilité
const hasResponsibilities = computed(() => {
  if (!selectedJeune.value) return false
  return selectedJeune.value.originalData.isNoyau ||
         selectedJeune.value.originalData.isDecanal ||
         selectedJeune.value.originalData.isDicoces
})

function openModal(jeune) {
  selectedJeune.value = jeune
  isEditing.value = false
  showPasswordSection.value = false

  editForm.value = {
    fullName: jeune.fullName,
    phoneNumber: jeune.tel,
    gender: jeune.gender,
    createdAt: jeune.createdAt,
    sector: jeune.sectorId,
    doyenne: jeune.doyenneId,
    paroisse: jeune.paroisseId,
    isNoyau: jeune.originalData.isNoyau,
    isDecanal: jeune.originalData.isDecanal,
    isDicoces: jeune.originalData.isDicoces
  }
  updateFilteredDoyennes()
  updateFilteredParoisses()
}

function closeModal() {
  selectedJeune.value = null
  isEditing.value = false
  showPasswordSection.value = false
  phoneError.value = ''
}

function startEditing() {
  isEditing.value = true
}

function cancelEditing() {
  isEditing.value = false
  showPasswordSection.value = false
  if (selectedJeune.value) {
    editForm.value = {
      fullName: selectedJeune.value.fullName,
      phoneNumber: selectedJeune.value.tel,
      gender: selectedJeune.value.gender,
      sector: selectedJeune.value.sectorId,
      doyenne: selectedJeune.value.doyenneId,
      paroisse: selectedJeune.value.paroisseId,
      isNoyau: selectedJeune.value.originalData.isNoyau,
      isDecanal: selectedJeune.value.originalData.isDecanal,
      isDicoces: selectedJeune.value.originalData.isDicoces
    }
  }
  passwordForm.value = {
    newPassword: '',
    confirmPassword: ''
  }
  phoneError.value = ''
}

// ==========================
// FILTRES DYNAMIQUES AMÉLIORÉS
// ==========================
function updateFilteredDoyennes() {
  const selectedSector = sectors.value.find(s => s.id == editForm.value.sector)
  filteredDoyennes.value = selectedSector
      ? doyennes.value.filter(d => d.sector === selectedSector["@id"])
      : []

  // Réinitialiser les sélections si nécessaire
  if (!filteredDoyennes.value.some(d => d.id == editForm.value.doyenne)) {
    editForm.value.doyenne = ""
    editForm.value.paroisse = ""
  }
  updateFilteredParoisses()
}

function updateFilteredParoisses() {
  const selectedDoyenne = filteredDoyennes.value.find(d => d.id == editForm.value.doyenne)
  filteredParoisses.value = selectedDoyenne
    ? paroisses.value.filter(p => p.doyenne === selectedDoyenne["@id"])
    : []

  if (!filteredParoisses.value.some(p => p.id == editForm.value.paroisse)) {
    editForm.value.paroisse = ""
  }
}

// Gestion des changements de responsabilités
function onRoleChange() {
  if (editForm.value.isDicoces) {
    editForm.value.isDecanal = true
    editForm.value.isNoyau = true
  } else if (editForm.value.isDecanal) {
    editForm.value.isNoyau = true
    editForm.value.isDicoces = false
  } else if (!editForm.value.isNoyau) {
    editForm.value.isDecanal = false
    editForm.value.isDicoces = false
  }
}

// Validation du formulaire avant mise à jour
function validateForm() {
  // Validation du nom complet
  const nameError = validateFullName(editForm.value.fullName)
  if (nameError) {
    toast.error(nameError)
    return false
  }

  // Validation du numéro de téléphone
  phoneError.value = validatePhone(editForm.value.phoneNumber)
  if (phoneError.value) {
    toast.error(phoneError.value)
    return false
  }

  // Validation du genre
  if (!editForm.value.gender) {
    toast.error("Veuillez sélectionner un genre")
    return false
  }

  return true
}

// ==========================
// CRÉATION AUTOMATIQUE D'UTILISATEUR
// ==========================
async function createUserForPerson(person, formData, sectorObj) {
  try {
    // console.log('🆕 Création d\'utilisateur pour la personne:', person.id)

    // Déterminer les rôles en fonction des responsabilités
    const roles = []

    if (formData.isDicoces) {
      roles.push('ROLE_DIOCESE', 'ROLE_DECANAL', 'ROLE_NOYAU')
    } else if (formData.isDecanal) {
      roles.push('ROLE_DECANAL', 'ROLE_NOYAU')
    } else if (formData.isNoyau) {
      roles.push('ROLE_NOYAU')
    }

    // Ajouter le rôle du secteur
    if (sectorObj) {
      if (sectorObj["@id"] === '/api/sectors/1') roles.push('ROLE_EST')
      else if (sectorObj["@id"] === '/api/sectors/2') roles.push('ROLE_CENTRE')
      else if (sectorObj["@id"] === '/api/sectors/3') roles.push('ROLE_OUEST')
    }

    // Créer l'utilisateur
    const userPayload = {
      username: formData.phoneNumber.replace(/\s+/g, ''),
      roles: roles,
      email: `${formData.phoneNumber.replace(/\s+/g, '')}@mijerca.cd`,
      password: 'mijerca2025',
      person: `/api/people/${person.id}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    // console.log('📤 Création utilisateur:', userPayload)

    const response = await axios.post(`${API_URL}/users`, userPayload, {
      headers: {
        "Content-Type": "application/ld+json",
        "Authorization": `Bearer ${token}`
      }
    })

    // console.log('✅ Utilisateur créé avec succès:', response.data)
    // toast.success('Compte utilisateur créé automatiquement')

    // Ajouter le nouvel utilisateur à la liste locale
    users.value.push(response.data)

    return response.data

  } catch (error) {
    console.error('❌ Erreur création utilisateur:', error)
    if (error.response?.data) {
      console.error('Détails erreur:', error.response.data)
    }
    throw new Error(`Impossible de créer l'utilisateur: ${error.message}`)
  }
}

// Mise à jour de la personne
async function updatePerson() {
  if (!selectedJeune.value) return

  // Validation du formulaire
  if (!validateForm()) {
    return
  }

  isUpdating.value = true
  try {
    const token = localStorage.getItem('token')

    const sectorObj = sectors.value.find(s => s.id == editForm.value.sector)
    const doyenneObj = doyennes.value.find(d => d.id == editForm.value.doyenne)
    const paroisseObj = paroisses.value.find(p => p.id == editForm.value.paroisse)

    const personPayload = {
      fullName: editForm.value.fullName.trim(),
      phoneNumber: editForm.value.phoneNumber.replace(/\s+/g, ''),
      gender: editForm.value.gender,
      sector: sectorObj ? sectorObj["@id"] : null,
      doyenne: doyenneObj ? doyenneObj["@id"] : null,
      paroisse: paroisseObj ? paroisseObj["@id"] : null,
      updatedAt: new Date().toISOString()
    }

    if (isAdmin.value) {
      personPayload.isNoyau = editForm.value.isNoyau
      personPayload.isDecanal = editForm.value.isDecanal
      personPayload.isDicoces = editForm.value.isDicoces
    }

    // console.log('📤 Mise à jour personne:', personPayload)

    await axios.patch(`${API_URL}/people/${selectedJeune.value.id}`, personPayload, {
      headers: {
        "Content-Type": "application/merge-patch+json",
        "Authorization": `Bearer ${token}`
      }
    })

    const hadResponsibilities = selectedJeune.value.originalData.isNoyau ||
                               selectedJeune.value.originalData.isDecanal ||
                               selectedJeune.value.originalData.isDicoces

    const hasResponsibilitiesNow = editForm.value.isNoyau ||
                                  editForm.value.isDecanal ||
                                  editForm.value.isDicoces

    // Vérifier si on doit gérer les utilisateurs (nouvelle responsabilité ou admin)
    if (hasResponsibilitiesNow || isAdmin.value) {
      const user = users.value.find(u => extractIdFromUrl(u.person) === selectedJeune.value.id)

      if (!user && hasResponsibilitiesNow) {
        // Créer un nouvel utilisateur si la personne devient responsable et n'a pas d'utilisateur
        // console.log('👤 Création d\'utilisateur nécessaire')
        await createUserForPerson(selectedJeune.value, editForm.value, sectorObj)
      } else if (user) {
        // Mettre à jour l'utilisateur existant
        await updateUserData(selectedJeune.value, editForm.value, sectorObj)
      }
    }

    if (passwordForm.value.newPassword && passwordForm.value.newPassword === passwordForm.value.confirmPassword) {
      await updateUserPassword(selectedJeune.value, passwordForm.value.newPassword)
    }

    toast.success('Personne mise à jour avec succès !')

    // Mettre à jour les données localement et réorganiser par ordre alphabétique
    await updateLocalData()

    isEditing.value = false
    showPasswordSection.value = false
    phoneError.value = ''

  } catch (error) {
    console.error('Erreur mise à jour personne:', error)
    if (error.response?.data?.violations) {
      const violations = error.response.data.violations
      const errorMessage = violations.map(v => `${v.propertyPath}: ${v.message}`).join(', ')
      toast.error(`Erreur de validation: ${errorMessage}`)
    } else {
      toast.error('Erreur lors de la mise à jour')
    }
  } finally {
    isUpdating.value = false
  }
}

// Mettre à jour les données localement
async function updateLocalData() {
  try {
    // Récupérer les données mises à jour de l'API
    const updatedPerson = await axios.get(`${API_URL}/people/${selectedJeune.value.id}`, {
      headers: { Authorization: `Bearer ${token}` }
    })

    // Formater la personne
    const formattedPerson = formatPerson(updatedPerson.data)

    // Trouver l'index de la personne dans le tableau
    const index = jeunes.value.findIndex(j => j.id === selectedJeune.value.id)
    if (index !== -1) {
      // Mettre à jour la personne dans le tableau
      jeunes.value[index] = formattedPerson

      // Trier à nouveau le tableau par ordre alphabétique
      jeunes.value.sort((a, b) => a.fullName.localeCompare(b.fullName))

      // Mettre à jour également selectedJeune pour que le modal affiche les nouvelles données
      selectedJeune.value = formattedPerson
    }

    // console.log('✅ Données locales mises à jour et triées')
  } catch (error) {
    console.error('Erreur lors de la mise à jour locale:', error)
    // En cas d'erreur, recharger toutes les données
    await fetchPeople()
  }
}

// Mettre à jour les données de l'utilisateur
async function updateUserData(person, formData, sectorObj) {
  try {
    const user = users.value.find(u => extractIdFromUrl(u.person) === person.id)
    if (!user) {
      // console.log('❌ Aucun utilisateur trouvé pour cette personne')
      return
    }

    const userPayload = {}

    if (formData.phoneNumber !== person.originalData.phoneNumber) {
      userPayload.username = formData.phoneNumber.replace(/\s+/g, '')
    }

    const currentRoles = user.roles || []
    let finalRoles = [...currentRoles]

    if (sectorObj && sectorObj["@id"] !== person.originalData.sector) {
      let roleSector = ''
      if (sectorObj["@id"] === '/api/sectors/1') roleSector = 'ROLE_EST'
      else if (sectorObj["@id"] === '/api/sectors/2') roleSector = 'ROLE_CENTRE'
      else if (sectorObj["@id"] === '/api/sectors/3') roleSector = 'ROLE_OUEST'

      if (roleSector) {
        finalRoles = finalRoles.filter(role =>
          !['ROLE_EST', 'ROLE_CENTRE', 'ROLE_OUEST'].includes(role)
        )
        finalRoles.push(roleSector)
      }
    }

    if (isAdmin.value) {
      finalRoles = finalRoles.filter(role =>
        !['ROLE_NOYAU', 'ROLE_DECANAL', 'ROLE_DIOCESE'].includes(role)
      )

      if (formData.isDicoces) {
        finalRoles.push('ROLE_DIOCESE', 'ROLE_DECANAL', 'ROLE_NOYAU')
      } else if (formData.isDecanal) {
        finalRoles.push('ROLE_DECANAL', 'ROLE_NOYAU')
      } else if (formData.isNoyau) {
        finalRoles.push('ROLE_NOYAU')
      }
    }

    userPayload.roles = finalRoles

    if (Object.keys(userPayload).length > 0) {
      userPayload.updatedAt = new Date().toISOString()

      await axios.patch(`${API_URL}/users/${user.id}`, userPayload, {
        headers: {
          "Content-Type": "application/merge-patch+json",
          "Authorization": `Bearer ${token}`
        }
      })

      // console.log('✅ Utilisateur mis à jour:', userPayload)
    }

  } catch (error) {
    console.error('Erreur mise à jour utilisateur:', error)
    throw error
  }
}

// Mettre à jour le mot de passe
async function updateUserPassword(person, newPassword) {
  try {
    const user = users.value.find(u => extractIdFromUrl(u.person) === person.id)
    if (!user) {
      // console.log('❌ Aucun utilisateur trouvé pour cette personne')
      return
    }

    await axios.patch(`${API_URL}/users/${user.id}`, {
      password: newPassword,
      updatedAt: new Date().toISOString()
    }, {
      headers: {
        "Content-Type": "application/merge-patch+json",
        "Authorization": `Bearer ${token}`
      }
    })

    // console.log('✅ Mot de passe mis à jour')

  } catch (error) {
    console.error('Erreur mise à jour mot de passe:', error)
    throw error
  }
}

// Actualisation manuelle
async function handleRefresh() {
  isLoading.value = true
  try {
    await Promise.all([fetchSectorId(), fetchPeople(), fetchUsers()])
  } finally {
    isLoading.value = false
  }
}

// Watchers pour les filtres dynamiques
watch(() => editForm.value.sector, updateFilteredDoyennes)
watch(() => editForm.value.doyenne, updateFilteredParoisses)

// Watcher pour le formatage du numéro de téléphone
watch(() => editForm.value.phoneNumber, (newValue) => {
  if (newValue) {
    editForm.value.phoneNumber = formatPhone(newValue)
    // Valider en temps réel
    phoneError.value = validatePhone(newValue)
  }
})

</script>

<template>
  <div class="be-content">
    <div class="main-content container-fluid">
      <div class="row">
        <div class="col-sm-12">
          <div class="card card-table">
            <div class="card-header d-flex justify-content-between align-items-center">
              <span>{{ descr }}</span>
              <button
                @click="handleRefresh"
                class="btn btn-outline-primary btn-sm"
                :disabled="isLoading"
                title="Actualiser les données"
              >
                <i class="fas fa-sync-alt" :class="{ 'fa-spin': isLoading }"></i>
                {{ isLoading ? 'Actualisation...' : 'Actualiser' }}
              </button>
            </div>

            <!-- Filtres -->
            <div class="p-2 bg-white rounded shadow-sm">
              <div class="row g-2 row-cols-1 row-cols-sm-2 row-cols-md-4">
                <div class="col mb-1">
                  <select v-model="filterDoyenne" class="form-select p-2">
                    <option value="">Doyenné</option>
                    <option v-for="d in doyenneOptions" :key="d" :value="d">{{ d }}</option>
                  </select>
                </div>
                <div class="col mb-1">
                  <select v-model="filterParoisse" class="form-select p-2">
                    <option value="">Paroisse</option>
                    <option v-for="p in paroisseOptions" :key="p" :value="p">{{ p }}</option>
                  </select>
                </div>
                <div class="col">
                  <select v-model="filterStatut" class="form-select p-2">
                    <option value="">Statut</option>
                    <option value="Jeune">Jeune</option>
                    <option value="Noyau paroissial">Noyau paroissial</option>
                    <option value="Noyau décanal">Noyau décanal</option>
                    <option value="Noyau diocésain">Noyau diocésain</option>
                  </select>
                </div>
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
              <div class="table-container">
                <div v-if="isLoading" class="text-center my-5">
                  <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden"></span>
                  </div>
                  <p>Chargement des données...</p>
                </div>
                <table v-else class="table table-striped table-hover table-fw-widget" id="tableSect">
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
                          :class="{
                            'bg-success': jeune.statut === 'Jeune',
                            'bg-primary text-dark': jeune.statut === 'Noyau paroissial',
                            'bg-warning text-dark': jeune.statut === 'Noyau décanal',
                            'bg-danger text-dark': jeune.statut === 'Noyau diocésain'
                          }"
                        >
                          {{ jeune.statut }}
                        </span>
                      </td>
                    </tr>
                    <tr v-if="filteredJeunes.length === 0">
                      <td colspan="5" class="text-center text-muted">Aucun résultat trouvé</td>
                    </tr>
                  </tbody>

                  <!-- TFOOT avec les statistiques -->
                  <tfoot class="table-footer">
                    <tr>
                      <td colspan="5" class="text-center fw-bold py-3 bg-light border-top">
                        <div class="row justify-content-center">
                          <div class="col-auto">
                            <span class="stat-item">
                              <i class="fas fa-church me-1"></i>
                              Doyennés : <strong>{{ stats.totalDoyennes }}</strong>
                            </span>
                          </div>
                          <div class="col-auto">
                            <span class="stat-item">
                              <i class="fas fa-place-of-worship me-1"></i>
                              Paroisses : <strong>{{ stats.totalParoisses }}</strong>
                            </span>
                          </div>
                          <div class="col-auto">
                            <span class="stat-item">
                              <i class="fas fa-users me-1"></i>
                              Jeunes : <strong>{{ stats.totalJeunes }}</strong>
                            </span>
                          </div>
                        </div>
                        <!-- Détails par statut -->
                        <div v-if="Object.keys(stats.statutCounts).length > 0" class="mt-2">
                          <small class="text-muted">
                            <span v-for="(count, statut) in stats.statutCounts" :key="statut" class="mr-3">
                              {{ statut }} : <strong>{{ count }}</strong>
                            </span>
                          </small>
                        </div>
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal infos jeune -->
    <div v-if="selectedJeune" class="modal fade show d-block" tabindex="-1" style="background: rgba(0,0,0,0.5);">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header bg-primary text-white">
            <h5 class="modal-title">
              <i class="fas fa-user-circle me-2"></i>
              Informations du jeune
            </h5>
            <button type="button" class="btn-close btn-close-white" @click="closeModal"></button>
          </div>

          <div class="modal-body p-0">
            <!-- Vue lecture seule -->
            <div v-if="!isEditing" class="p-4">
              <div class="row">
                <div class="col-md-6 mb-3">
                  <label class="form-label text-muted small mb-1">Nom complet</label>
                  <p class="mb-0 fw-semibold">{{ selectedJeune.nom }}</p>
                </div>
                <div class="col-md-6 mb-3">
                  <label class="form-label text-muted small mb-1">Téléphone</label>
                  <p class="mb-0 fw-semibold">{{ selectedJeune.tel }}</p>
                </div>
              </div>

              <div class="row">
                <div class="col-md-4 mb-3">
                  <label class="form-label text-muted small mb-1">Secteur</label>
                  <p class="mb-0 fw-semibold">{{ selectedJeune.sector }}</p>
                </div>
                <div class="col-md-4 mb-3">
                  <label class="form-label text-muted small mb-1">Doyenné</label>
                  <p class="mb-0 fw-semibold">{{ selectedJeune.doyenne }}</p>
                </div>
                <div class="col-md-4 mb-3">
                  <label class="form-label text-muted small mb-1">Paroisse</label>
                  <p class="mb-0 fw-semibold">{{ selectedJeune.paroisse }}</p>
                </div>
              </div>

              <div class="row">
                <div class="col-md-4 mb-3">
                  <label class="form-label text-muted small mb-1">Date d'enregistrement</label>
                  <p class="mb-0 fw-semibold">{{ selectedJeune.createdAt }}</p>
                </div>
                <div class="col-md-8 mb-3">
                  <label class="form-label text-muted small mb-1">Statut</label>
                  <p class="mb-0">
                    <span class="badge"
                      :class="{
                        'bg-success': selectedJeune.statut === 'Jeune',
                        'bg-primary text-dark': selectedJeune.statut === 'Noyau paroissial',
                        'bg-warning text-dark': selectedJeune.statut === 'Noyau décanal',
                        'bg-danger text-dark': selectedJeune.statut === 'Noyau diocésain'
                      }"
                    >
                      {{ selectedJeune.statut }}
                    </span>
                  </p>
                </div>
              </div>
            </div>

            <!-- Vue édition -->
            <div v-else class="p-4">
              <form @submit.prevent="updatePerson">
                <div class="row">
                  <div class="col-md-6 mb-3">
                    <label class="form-label">Nom complet <span class="text-danger">*</span></label>
                    <input
                      class="form-control"
                      v-model="editForm.fullName"
                      type="text"
                      required
                      :class="{ 'is-invalid': validateFullName(editForm.fullName) }"
                    />
                    <div v-if="validateFullName(editForm.fullName)" class="invalid-feedback">
                      {{ validateFullName(editForm.fullName) }}
                    </div>
                  </div>
                  <div class="col-md-6 mb-3">
                    <label class="form-label">Numéro de téléphone <span class="text-danger">*</span></label>
                    <input
                      class="form-control"
                      v-model="editForm.phoneNumber"
                      type="tel"
                      required
                      placeholder="0899 999 999"
                      :class="{ 'is-invalid': phoneError }"
                    />
                    <div v-if="phoneError" class="invalid-feedback">
                      {{ phoneError }}
                    </div>
                    <small class="form-text text-muted">
                      Préfixe : 081, 082, 083, 084, 085, 089 ou 09
                    </small>
                  </div>
                </div>

                <div class="row">
                  <div class="col-md-4 mb-3">
                    <label class="form-label">Genre <span class="text-danger">*</span></label>
                    <select class="form-select p-2" v-model="editForm.gender" required>
                      <option value="">Sélectionnez un genre</option>
                      <option value="Frère">Frère</option>
                      <option value="Soeur">Soeur</option>
                    </select>
                  </div>
                  <div class="col-md-4 mb-3">
                    <label class="form-label">Secteur <span class="text-danger">*</span></label>
                    <select class="form-select p-2" v-model="editForm.sector" required>
                      <option value="">Sélectionnez un secteur</option>
                      <option v-for="s in sectors" :key="s.id" :value="s.id">{{ s.name }}</option>
                    </select>
                  </div>
                </div>
                <div class="row">
                  <div class="col-md-4 mb-3">
                    <label class="form-label">Doyenné <span class="text-danger">*</span></label>
                    <select class="form-select p-2" v-model="editForm.doyenne" required :disabled="!editForm.sector">
                      <option value="">Sélectionnez un doyenné</option>
                      <option v-for="d in filteredDoyennes" :key="d.id" :value="d.id">{{ d.name }}</option>
                    </select>
                    <small v-if="!editForm.sector" class="text-muted">Sélectionnez d'abord un secteur</small>
                  </div>

                  <div class="col-md-4 mb-3">
                    <label class="form-label">Paroisse <span class="text-danger">*</span></label>
                    <select class="form-select p-2" v-model="editForm.paroisse" required :disabled="!editForm.doyenne">
                      <option value="">Sélectionnez une paroisse</option>
                      <option v-for="p in filteredParoisses" :key="p.id" :value="p.id">{{ p.name }}</option>
                    </select>
                    <small v-if="!editForm.doyenne" class="text-muted">Sélectionnez d'abord un doyenné</small>
                  </div>
                </div>

                <!-- Section responsabilités (admin seulement) -->
                <div v-if="isAdmin" class="border rounded p-3 mb-3">
                  <h6 class="mb-3 text-primary">
                    <i class="fas fa-star me-2"></i>Responsabilités
                  </h6>
                  <div class="row">
                    <div class="col-md-4">
                      <div class="form-check">
                        <input
                          class="form-check-input"
                          type="checkbox"
                          id="isNoyau"
                          v-model="editForm.isNoyau"
                          @change="onRoleChange"
                        />
                        <label class="form-check-label" for="isNoyau">
                          Noyau Paroissial
                        </label>
                      </div>
                    </div>
                    <div class="col-md-4">
                      <div class="form-check">
                        <input
                          class="form-check-input"
                          type="checkbox"
                          id="isDecanal"
                          v-model="editForm.isDecanal"
                          @change="onRoleChange"
                        />
                        <label class="form-check-label" for="isDecanal">
                          Noyau Décanal
                        </label>
                      </div>
                    </div>
                    <div class="col-md-4">
                      <div class="form-check">
                        <input
                          class="form-check-input"
                          type="checkbox"
                          id="isDicoces"
                          v-model="editForm.isDicoces"
                          @change="onRoleChange"
                        />
                        <label class="form-check-label" for="isDicoces">
                          Noyau Diocésain
                        </label>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Section mot de passe -->
                <div v-if="(hasResponsibilities || isAdmin) && isEditing" class="border rounded p-3">
                  <div class="d-flex justify-content-between align-items-center mb-2">
                    <h6 class="mb-0 text-primary">
                      <i class="fas fa-key me-2"></i>Changer le mot de passe
                    </h6>
                    <button
                      type="button"
                      class="btn btn-outline-secondary btn-sm"
                      @click="showPasswordSection = !showPasswordSection"
                    >
                      {{ showPasswordSection ? 'Masquer' : 'Afficher' }}
                    </button>
                  </div>

                  <div v-if="showPasswordSection" class="bg-light p-3 rounded">
                    <div class="row">
                      <div class="col-md-6 mb-3">
                        <label class="form-label">Nouveau mot de passe</label>
                        <input
                          class="form-control"
                          v-model="passwordForm.newPassword"
                          type="password"
                          placeholder="Saisir le nouveau mot de passe"
                        />
                      </div>
                      <div class="col-md-6 mb-3">
                        <label class="form-label">Confirmer le mot de passe</label>
                        <input
                          class="form-control"
                          v-model="passwordForm.confirmPassword"
                          type="password"
                          placeholder="Confirmer le nouveau mot de passe"
                        />
                      </div>
                    </div>
                    <small class="text-muted">
                      <i class="fas fa-info-circle me-1"></i>
                      Laisser vide pour ne pas changer le mot de passe
                    </small>
                  </div>
                </div>
              </form>
            </div>
          </div>

          <div class="modal-footer border-top">
            <template v-if="!isEditing">
              <button
                class="btn btn-warning"
                @click="startEditing"
                :disabled="!canEditPerson"
                v-if="canEditPerson"
              >
                <i class="fas fa-edit me-2"></i>Modifier
              </button>
              <button class="btn btn-secondary" @click="closeModal">
                <i class="fas fa-times me-2"></i>Fermer
              </button>
            </template>
            <template v-else>
              <button
                class="btn btn-primary"
                @click="updatePerson"
                :disabled="isUpdating"
              >
                <span v-if="isUpdating" class="spinner-border spinner-border-sm me-2"></span>
                <i v-else class="fas fa-save me-2"></i>
                {{ isUpdating ? 'Mise à jour...' : 'Enregistrer' }}
              </button>
              <button class="btn btn-outline-secondary" @click="cancelEditing">
                <i class="fas fa-undo me-2"></i>Annuler
              </button>
            </template>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.table-container {
  max-height: 40.5rem;
  overflow-y: auto;
  position: relative;
}

#tableSect thead th {
  position: sticky;
  top: 0;
  z-index: 2;
  background: #fff;
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.15);
}

#tableSect tfoot th {
  position: sticky;
  bottom: 0;
  z-index: 2;
  background: #f8f9fa;
  box-shadow: 0 -3px 6px rgba(0, 0, 0, 0.15);
  border-top: 2px solid #dee2e6;
}

.table-footer {
  position: sticky;
  bottom: 0;
  background: white;
  z-index: 10;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
}

.stat-item {
  padding: 8px 16px;
  margin: 0 10px;
  background: #f8f9fa;
  border-radius: 6px;
  border: 1px solid #e9ecef;
  display: inline-block;
}

.stat-item strong {
  color: #0d6efd;
  margin-left: 4px;
}

/* Animation de l'icône d'actualisation */
.fa-spin {
  animation: fa-spin 1s infinite linear;
}

@keyframes fa-spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Améliorations du modal */
.modal-header {
  border-bottom: 2px solid rgba(255, 255, 255, 0.1);
}

.modal-body {
  max-height: 70vh;
  overflow-y: auto;
}

.form-label {
  font-weight: 500;
}

.border-top {
  border-top: 1px solid #dee2e6 !important;
}

/* Responsive design pour le modal */
@media (max-width: 768px) {
  .modal-dialog {
    margin: 1rem;
  }

  .modal-body .row {
    margin-bottom: 0.5rem;
  }

  .modal-body .col-md-6,
  .modal-body .col-md-4 {
    margin-bottom: 1rem;
  }

  .stat-item {
    display: block;
    margin: 5px 0;
  }
}

/* Style pour les sélecteurs désactivés */
.form-select:disabled {
  background-color: #f8f9fa;
  opacity: 0.7;
}

/* Badge amélioré */
.badge {
  font-size: 0.75em;
  padding: 0.35em 0.65em;
}

/* Styles pour la validation */
.is-invalid {
  border-color: #dc3545;
}

.invalid-feedback {
  display: block;
  width: 100%;
  margin-top: 0.25rem;
  font-size: 0.875em;
  color: #dc3545;
}

.text-danger {
  color: #dc3545 !important;
}

.form-text {
  font-size: 0.875em;
  margin-top: 0.25rem;
}
</style>
