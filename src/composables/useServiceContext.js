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