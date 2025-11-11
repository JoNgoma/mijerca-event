<script setup>
// Import images
import logo from "/assets/img/mijerca.jpg"
import avatar from "/assets/img/avatar.png"
import { ref, onMounted } from "vue"
import { useRouter, useRoute } from "vue-router"

const route = useRoute()

const isActiveRoute = (routeName, params = {}) => {
  if (route.name === routeName) {
    if (Object.keys(params).length > 0) {
      return Object.entries(params).every(
        ([key, value]) => route.params[key] === value
      )
    }
    return true
  }
  return false
}

const router = useRouter()

const userData = ref({
  id: null,
  username: "",
  roles: [],
  person: null,
})

const personData = ref({
  id: null,
  fullName: "",
  phoneNumber: "",
  gender: "",
})

const showDropdown = ref(false)
const API_URL = import.meta.env.VITE_API_BASE_URL

function toggleDropdown() {
  showDropdown.value = !showDropdown.value
}

function closeDropdown() {
  showDropdown.value = false
}

function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("username");
  window.location.href = "/login"; // recharge la page
}

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

// 🔹 Charger infos user connecté
async function fetchUserData() {
  try {
    const token = localStorage.getItem("token")
    if (!token) return router.push({ name: 'login' })

    const username = localStorage.getItem("userPhone")
    if (!username) return router.push({ name: 'login' })

    // Récupérer l'utilisateur courant avec pagination
    const usersData = await fetchAllPages(`${API_URL}/users?username=${encodeURIComponent(username)}`)
    const user = usersData.find(u => u.username === username)
    
    if (user) {
      userData.value = user

      // Récupérer toutes les personnes avec pagination
      const allPeople = await fetchAllPages(`${API_URL}/people`)

      // Filtrer pour trouver la personne avec le phoneNumber correspondant au username
      const matchedPerson = allPeople.find(
        p => p.phoneNumber === user.username
      )

      if (matchedPerson) {
        personData.value = matchedPerson
        console.log('👤 Utilisateur connecté:', matchedPerson.fullName)
      } else {
        console.warn('⚠️ Aucune personne trouvée avec ce numéro de téléphone')
        personData.value = null
      }
    } else {
      console.warn('⚠️ Utilisateur non trouvé')
    }
  } catch (err) {
    console.error("Erreur user connecté", err)
    // En cas d'erreur 401, déconnecter l'utilisateur
    if (err.message.includes('401')) {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
  }
}

onMounted(() => {
  fetchUserData()
})
</script>


<template>
  <nav class="navbar navbar-expand fixed-top be-top-header">
    <div class="container-fluid">
      <!-- Logo -->
      <div class="be-navbar-header">
        <a class="navbar-brand d-none d-md-flex align-items-center" href="#">
          <img class="d-none d-md-block" :src="logo" alt="logo"/>
          <span class="fw-bold bg-white d-none d-md-block"
                style="font-size: 1.7rem; letter-spacing: 1.5px; padding-left: .5em">
            MIJERCA
          </span>
        </a>
      </div>

      <!-- Menu gauche -->
      <div class="navbar-collapse collapse" id="be-navbar-collapse"> 
        <!-- Slot dynamique pour le contenu de navigation --> 
        <slot name="navigation"> <!-- Contenu par défaut si aucun slot n'est fourni --> 
          <ul class="navbar-nav"> 
            <li class="nav-item">
              <router-link :to="{ name: 'dashboard' }" class="nav-link">
                Accueil
              </router-link>
            </li> 
          </ul> 
        </slot> 
      </div>

      <!-- User connecté -->
      <div class="be-right-navbar">
        <ul class="nav navbar-nav float-right be-user-nav">
          <li class="nav-item dropdown" @click.stop="toggleDropdown">
            <a class="nav-link d-flex align-items-center" href="javascript:void(0)">
              <img :src="avatar" alt="Avatar" class="rounded-circle"
                   style="width: 32px; height: 32px" />
              <span class="user-name">{{ personData.fullName }}</span>
            </a>

            <!-- Dropdown -->
            <div
              v-show="showDropdown"
              class="dropdown-menu dropdown-menu-end show"
              style="position: absolute; right: 0; top: 100%;"
            >
              <div class="user-info px-3 py-2 border-bottom">
                <div class="user-name fw-bold">
                  {{ personData.fullName || "Utilisateur" }}
                </div>
                <div class="user-position small">
                  {{ personData.phoneNumber }}
                </div>
              </div>
              <router-link class="dropdown-item"
                :to="{ name: 'profil', params: { serviceType: 'profil' } }"
                :class="{ 'text-primary': isActiveRoute('profil', { serviceType: 'profil' }) }"
              ><span class="icon mdi mdi-face"></span> Mon compte </router-link>
              <a class="dropdown-item" href="#"><span class="icon mdi mdi-settings"></span> Paramètres</a>
              <a class="dropdown-item" href="#" @click.prevent="logout">
                <span class="icon mdi mdi-power"></span> Déconnexion
              </a>
            </div>
          </li>
        </ul>
      </div>
    </div>
  </nav>

  <!-- clic en dehors -->
  <div v-if="showDropdown" class="overlay" @click="closeDropdown"></div>
</template>

<style scoped>
.navbar-brand img {
  max-height: 40px;
}
.dropdown-menu {
  min-width: 200px;
  border-radius: 0.5rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}
.overlay {
  position: fixed;
  inset: 0;
  background: transparent;
  z-index: 10;
}

/* pour petits écrans, full width */
@media (max-width: 576px) {
  .dropdown-menu {
    position: static !important;
    width: 60%;
    right: 0;
    margin-top: 0.2rem;
    border-radius: 0;
  }
  .be-right-navbar {
      display: flex;
      justify-content: flex-end;
  }
}
</style>