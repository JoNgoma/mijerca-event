import { computed } from 'vue'
import { useRoute } from 'vue-router'



const serviceTypes = {
  'diocesain': {
    position: 'diocesain',
    name: 'Service diocésain',
    icon: 'mdi mdi-face',
    description: 'Gestion du service diocésain'
  },
  'decanal': {
    position: 'decanal',
    name: 'Noyau décanal',
    icon: 'mdi mdi-face',
    description: 'Gestion du noyau décanal'
  },
  'paroissial': {
    position: 'paroissial',
    name: 'Noyau paroissial',
    icon: 'mdi mdi-face',
    description: 'Gestion du noyau paroissial'
  },
  'jeunes': {
    position: 'jeune',
    name: 'Jeunes',
    icon: 'mdi mdi-face',
    description: 'Gestion des jeunes'
  },
  'affect': {
    name: 'Affectation',
    icon: 'mdi mdi-currency-usd',
    description: 'Mis en place'
  },
  'ser-adm': {
    api: '/administrations',
    role: 'ROLE_ADM_',
    name: 'Administration',
    icon: 'mdi mdi-face',
    description: 'Service administrative de l\'acivité'
  },
  'ser-fin': {
    api:'/finances',
    role: 'ROLE_FIN_',
    name: 'Finances',
    icon: 'mdi mdi-face',
    description: 'Service Financier de l\'acivité'
  },
  'ser-heb': {
    api:'/hebergements',
    role: 'ROLE_HEB_',
    name: 'Hébergement',
    icon: 'mdi mdi-face',
    description: 'Service hébergement de l\'acivité'
  },
  'ser-sec': {
    api:'/informatiques',
    role: 'ROLE_SEC_',
    name: 'Secrétariat',
    icon: 'mdi mdi-face',
    description: 'Service secrétariat de l\'acivité'
  },
  'rap-day': {
    name: 'Rapport journalier',
    icon: 'mdi mdi-face',
    description: 'Rapport journalier'
  },
  'rap-global': {
    name: 'Rapport global',
    icon: 'mdi mdi-face',
    description: 'Rapport global'
  },
  'kin-est': {
    id:'kin-est',
    sectorName : 'KIN EST',
    name: 'Secteur KIN EST',
    icon: 'mdi mdi-currency-usd',
    description: 'Paiement secteur KIN EST'
  },
  'kin-centre': {
    id:'kin-centre',
    sectorName : 'KIN CENTRE',
    name: 'Secteur KIN CENTRE',
    icon: 'mdi mdi-currency-usd',
    description: 'Paiement secteur KIN CENTRE'
  },
  'kin-ouest': {
    id:'kin-ouest',
    sectorName : 'KIN OUEST',
    name: 'Secteur KIN OUEST',
    icon: 'mdi mdi-currency-usd',
    description: 'Paiement secteur KIN OUEST'
  },
  'dep-new': {
    name: 'Nouvelle dépense',
    icon: 'mdi mdi-currency-usd',
    description: 'Ajouter une nouvelle dépense'
  },
  'dep-suivis': {
    name: 'Liste des dépenses',
    icon: 'mdi mdi-currency-usd',
    description: 'Suivis des sorties'
  },
   'services': {
    name: 'Administration',
    icon: 'mdi mdi-currency-usd',
    description: 'Listes de services'
  },
  'adm-select': {
    name: 'Services sectionné',
    icon: 'mdi mdi-currency-usd',
    description: 'Descrition du services'
  },
  'dortoir': {
    name: 'Dortoirs',
    icon: 'mdi mdi-currency-usd',
    description: 'Gestion des dortoirs'
  },
  'carrefour': {
    name: 'Carrefours',
    icon: 'mdi mdi-currency-usd',
    description: 'Gestion des dortoirs'
  },
  'badge-preview': {
    name: 'Modèle badge',
    icon: 'mdi mdi-currency-usd',
    description: 'Visualisation badge'
  },
  'person-selector': {
    name: 'Liste Badge',
    icon: 'mdi mdi-currency-usd',
    description: "Personnes selectionnée pour l'impression des badges"
  },
  'badge-editor': {
    name: 'Editeur badge',
    icon: 'mdi mdi-currency-usd',
    description: 'Edidtion et création badge'
  },
  'a4-generator': {
    name: 'Générateur impression',
    icon: 'mdi mdi-currency-usd',
    description: 'Impression badge en A4'
  },
  'doyenne-paroisse': {
    name: 'Paroisse et doyenné',
    icon: 'mdi mdi-currency-usd',
    description: 'KIN EST'
  },
  'sec-kin': {
    name: 'Paroisse et doyenné',
    icon: 'mdi mdi-currency-usd',
    description: 'Info KIN EST'
  },
  'est': {
    position: 'est',
    name: 'Paroisse et doyenné',
    icon: 'mdi mdi-currency-usd',
    description: 'Info KIN EST'
  },
  'centre': {
    position: 'centre',
    name: 'Paroisse et doyenné',
    icon: 'mdi mdi-currency-usd',
    description: 'Info KIN CENTRE'
  },
  'ouest': {
    position: 'ouest',
    name: 'Paroisse et doyenné',
    icon: 'mdi mdi-currency-usd',
    description: 'Info KIN OUEST'
  },

}

export function useServiceContext() {
  const route = useRoute()

  // Type de service courant (ex: paroissial, rap-day, etc.)
  const currentServiceType = computed(() => {
    return route.params.serviceType || 'diocesain'
  })

  // ID du camp courant si présent dans l’URL
  const idCamp = computed(() => {
    return route.params.id_campBiblique || null
  })

  // Config du service courant
  const currentService = computed(() => {
    return serviceTypes[currentServiceType.value] || serviceTypes.diocesain
  })

  const getServiceConfig = (type) => {
    return serviceTypes[type] || serviceTypes.diocesain
  }

  return {
    currentServiceType,
    currentService,
    serviceTypes,
    getServiceConfig,
    idCamp // 🔥 ajouté ici
  }
}
