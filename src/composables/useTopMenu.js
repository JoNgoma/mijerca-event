import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useAuth } from '@/composables/useAuth' // ton composable auth

export function useTopMenu() {
  const route = useRoute()
  const { userRoles } = useAuth()

  // 🔹 Liste des menus avec leurs routes et les rôles autorisés
  const menuItems = [
    { name: 'dashboard', route: 'dashboard', roles: ['ROLE_ADMIN', 'ROLE_NOYAU'] },
    { name: 'communiques', route: 'list', roles: ['ROLE_ADMIN', 'ROLE_NOYAU'] },
    { name: 'new-communique', route: 'composer', roles: ['ROLE_ADMIN', 'ROLE_NOYAU'] },
    { name: 'rap-day', route: 'rap-day', roles: ['ROLE_ADMIN', 'ROLE_NOYAU'] },
    { name: 'paie', route: 'paie', roles: ['ROLE_ADMIN', 'ROLE_NOYAU'] },
    { name: 'dep-new', route: 'dep-new', roles: ['ROLE_ADMIN', 'ROLE_NOYAU'] },
    { name: 'dep-suivis', route: 'dep-suivis', roles: ['ROLE_ADMIN', 'ROLE_NOYAU'] },
    { name: 'services', route: 'services', roles: ['ROLE_ADMIN', 'ROLE_DIOCESE', 'ROLE_NOYAU'] },
    { name: 'manager', route: 'manager', roles: ['ROLE_ADMIN', 'ROLE_NOYAU'] },
    { name: 'media', route: 'media', roles: ['ROLE_ADMIN', 'ROLE_NOYAU'] },
    { name: 'dortoir', route: 'log-dortoir', roles: ['ROLE_ADMIN', 'ROLE_NOYAU'] },
    { name: 'carrefour', route: 'log-carrefour', roles: ['ROLE_ADMIN', 'ROLE_NOYAU'] },
    { name: 'affect', route: 'log-affect', roles: ['ROLE_ADMIN', 'ROLE_NOYAU'] },
    { name: 'badge-editor', route: 'info-badge-editor', roles: ['ROLE_ADMIN', 'ROLE_NOYAU'] },
    { name: 'badge-preview', route: 'info-badge-preview', roles: ['ROLE_ADMIN', 'ROLE_NOYAU'] },
    { name: 'person-selector', route: 'info-person-selector', roles: ['ROLE_ADMIN', 'ROLE_NOYAU'] },
    { name: 'a4-generator', route: 'info-a4-generator', roles: ['ROLE_ADMIN', 'ROLE_NOYAU'] },
    { name: 'kin-est', route: 'sec-kin', roles: ['ROLE_ADMIN', 'ROLE_NOYAU'] },
    { name: 'new-noy&par', route: 'sec-new', roles: ['ROLE_ADMIN', 'ROLE_NOYAU'] },
    { name: 'kin-paroisse', route: 'sec-paroisse', roles: ['ROLE_ADMIN', 'ROLE_NOYAU'] },
    { name: 'new-camp', route: 'new-camp', roles: ['ROLE_ADMIN', 'ROLE_DIOCESE'] },
    { name: 'manager-camp', route: 'manager-camp', roles: ['ROLE_ADMIN', 'ROLE_DIOCESE'] },
  ]

  // 🔹 Menu courant filtré par route
  const currentMenu = computed(() => {
    const routeName = route.name
    const menu = menuItems.find(item => item.route === routeName)
    // 🔒 Vérifie que l'utilisateur a le rôle pour voir ce menu
    if (!menu) return 'dashboard'
    if (!menu.roles.some(r => userRoles.value.includes(r))) return null
    return menu.name
  })

  // 🔹 Liste de tous les menus accessibles pour l'utilisateur
  const accessibleMenus = computed(() => {
    return menuItems.filter(item =>
      item.roles.some(r => userRoles.value.includes(r))
    )
  })

  return {
    currentMenu,
    accessibleMenus
  }
}
