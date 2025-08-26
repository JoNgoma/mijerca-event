import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'

export function useTopMenu() {
  const route = useRoute()
  
  const currentMenu = computed(() => {
    const routeName = route.name
    
    switch (routeName) {
      case 'list':
        return 'communiques'
      case 'composer':
        return 'new-communique'
      case 'rap-day':
        return 'rap-day'
      case 'paie':
        return 'paie'
      case 'dep-new':
        return 'dep-new'
      case 'dep-suivis':
        return 'dep-suivis'
      case 'services':
        return 'services'
      case 'adm-select':
        return 'adm-select'
      case 'log-dortoir':
        return 'dortoir'
      case 'log-carrefour':
        return 'carrefour'
      case 'log-affect':
        return 'affect'
      case 'info-badge-editor':
        return 'badge-editor'
      case 'info-badge-preview':
        return 'badge-preview'
      case 'info-a4-generator':
        return 'a4-generator'
      case 'kin-est':
        return 'kin-est'
      case 'kin-centre':
        return 'kin-centre'
      case 'kin-ouest':
        return 'kin-ouest'
      default:
        return 'dashboard'
    }
  })
  
  return {
    currentMenu
  }
}