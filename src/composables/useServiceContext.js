import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'

const serviceTypes = {
  'diocesain': {
    name: 'Service diocésain',
    icon: 'mdi mdi-face',
    description: 'Gestion du service diocésain'
  },
  'decanal': {
    name: 'Noyau décanal',
    icon: 'mdi mdi-face',
    description: 'Gestion du noyau décanal'
  },
  'paroissial': {
    name: 'Noyau paroissial',
    icon: 'mdi mdi-face',
    description: 'Gestion du noyau paroissial'
  },
  'jeunes': {
    name: 'Jeunes',
    icon: 'mdi mdi-face',
    description: 'Gestion des jeunes'
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
    name: 'Secteur KIN EST',
    icon: 'mdi mdi-currency-usd',
    description: 'Paiement secteur KIN EST'
  },
  'kin-centre': {
    name: 'Secteur KIN CENTRE',
    icon: 'mdi mdi-currency-usd',
    description: 'Paiement secteur KIN CENTRE'
  },
  'kin-ouest': {
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
  'affect': {
    name: 'Affectation logistique',
    icon: 'mdi mdi-currency-usd',
    description: 'Mis en place'
  },
  'badge-preview': {
    name: 'Modèle badge',
    icon: 'mdi mdi-currency-usd',
    description: 'Visualisation badge'
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
  }

}

export function useServiceContext() {
  const route = useRoute()
  
  const currentServiceType = computed(() => {
    return route.params.serviceType || 'diocesain'
  })
  
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
    getServiceConfig
  }
}