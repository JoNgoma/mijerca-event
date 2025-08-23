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