import { ref, computed, onMounted } from "vue"

const user = ref(null) // infos complètes de l'utilisateur (API)
const person = ref(null) // infos de la personne liée

export function useAuth() {
  const API_URL = import.meta.env.VITE_API_BASE_URL

  const userRoles = computed(() => user.value?.roles || [])
  const isAuthenticated = computed(() => !!user.value)

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

  // ⚡ Charger l'utilisateur complet depuis API
  async function loadFromApi() {
    try {
      const token = localStorage.getItem("token")
      const username = localStorage.getItem("userPhone")
      if (!token || !username) return

      // Récupérer l'utilisateur complet
      const res = await fetch(`${API_URL}/users?username=${encodeURIComponent(username)}`, {
        headers: { 
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/ld+json"
        }
      })
      const data = await res.json()
      const fetchedUser = data.member?.find(u => u.username === username)
      if (fetchedUser) {
        user.value = fetchedUser

        // Récupérer la personne liée
        const personRes = await fetch(`${API_URL}/people?phoneNumber=${encodeURIComponent(fetchedUser.username)}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/ld+json"
          }
        })
        const personDataJson = await personRes.json()
        person.value = personDataJson.member?.[0] || null
      }
    } catch (err) {
      console.error("Erreur récupération user API:", err)
    }
  }

  // 🔹 Charger automatiquement au montage si token existe
  onMounted(() => {
    loadFromStorage()
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
