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
      case 'dashboard':
        return 'dashboard'
      default:
        return 'default'
    }
  })
  
  return {
    currentMenu
  }
}