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
      default:
        return 'dashboard'
    }
  })
  
  return {
    currentMenu
  }
}