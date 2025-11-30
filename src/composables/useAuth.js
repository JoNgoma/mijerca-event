import { ref, computed, onMounted } from "vue"

const user = ref(null) // infos complètes de l'utilisateur (API)
const person = ref(null) // infos de la personne liée

export function useAuth() {
  const API_URL = import.meta.env.VITE_API_BASE_URL

  const userRoles = computed(() => user.value?.roles || [])
  const isAuthenticated = computed(() => !!user.value)

  // ==========================
  // PAGINATION OPTIMISÉE
  // ==========================
  async function fetchAllPages(baseUrl, options = {}) {
    let allItems = [];
    let currentPage = 1;
    let hasMore = true;
    
    try {
      const token = localStorage.getItem("token");
      
      while (hasMore) {
        const url = new URL(baseUrl);
        url.searchParams.set('page', currentPage);
        
        const response = await fetch(url, {
          headers: { 
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/ld+json",
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
      
      console.log(`📊 ${baseUrl} - ${allItems.length} enregistrements chargés`);
      return allItems;
    } catch (error) {
      console.error('Erreur lors de la récupération paginée:', error);
      throw error;
    }
  }

  // 🔄 Login
  function login(userData) {
    localStorage.setItem("token", userData.token || "")
    localStorage.setItem("username", userData.username || "")
    localStorage.setItem("user", JSON.stringify(userData))

    // Charger le user depuis l'API directement après login
    loadFromApi()
  }

  // 🔒 Logout
  function logout() {
    user.value = null
    person.value = null
    localStorage.removeItem("token")
    localStorage.removeItem("username")
    localStorage.removeItem("user")
    localStorage.removeItem("userPhone")
    localStorage.removeItem("roles")
  }

  // 🔑 Charger depuis localStorage
  function loadFromStorage() {
    const storedUser = JSON.parse(localStorage.getItem("user") || "null")
    if (storedUser) {
      user.value = storedUser
      // Charger les infos à jour depuis API
      loadFromApi()
    }
  }

  // ✅ Vérifie si l'utilisateur a un rôle
  function hasRole(role) {
    return userRoles.value.includes(role)
  }

  // ⚡ Charger l'utilisateur complet depuis API avec pagination
  async function loadFromApi() {
    try {
      const token = localStorage.getItem("token")
      const username = localStorage.getItem("userPhone")
      if (!token || !username) return

      console.log('🔄 Chargement des données utilisateur depuis API...')

      // Récupérer TOUS les utilisateurs avec pagination
      const allUsers = await fetchAllPages(`${API_URL}/users`)
      const fetchedUser = allUsers.find(u => u.username === username)
      
      if (fetchedUser) {
        user.value = fetchedUser
        console.log('✅ Utilisateur trouvé:', fetchedUser.username)

        // Récupérer TOUTES les personnes avec pagination pour trouver celle liée
        const allPeople = await fetchAllPages(`${API_URL}/people`)
        const matchedPerson = allPeople.find(p => p.phoneNumber === fetchedUser.username)

        if (matchedPerson) {
          person.value = matchedPerson
          console.log('✅ Personne liée trouvée:', matchedPerson.fullName)
        } else {
          console.warn('⚠️ Aucune personne trouvée avec ce numéro de téléphone')
          person.value = null
        }

        // Mettre à jour les rôles dans localStorage
        localStorage.setItem("roles", JSON.stringify(fetchedUser.roles || []))
        
      } else {
        console.warn('⚠️ Utilisateur non trouvé dans la liste paginée')
        user.value = null
        person.value = null
      }
    } catch (err) {
      console.error("Erreur récupération user API:", err)
      // En cas d'erreur 401, déconnecter l'utilisateur
      if (err.message.includes('401')) {
        logout()
      }
    }
  }

  // 🔹 Charger automatiquement au montage si token existe
  onMounted(() => {
    const token = localStorage.getItem("token")
    if (token) {
      loadFromStorage()
    }
  })

  return {
    user,
    person,
    userRoles,
    isAuthenticated,
    login,
    logout,
    loadFromStorage,
    loadFromApi,
    hasRole
  }
}