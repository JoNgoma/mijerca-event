<script setup>
import AssideDash from '@/components/dashboard/AssideDash.vue';
import HeaderDash from '@/components/dashboard/HeaderDash.vue';
import FooterDash from '@/components/dashboard/FooterDash.vue';
import AccueilDash from '@/partials/dashboard/AccueilDash.vue';
import NavBarDash from '@/components/dashboard/NavBarDash.vue';
import CommuniquesMenu from '@/components/menus/CommuniquesMenu.vue';
import NewCommuniqueMenu from '@/components/menus/NewCommuniqueMenu.vue';
import AdmMenu from '@/components/menus/AdmMenu.vue';
import LogMenu from '@/components/menus/LogMenu.vue';
import FinancesMenu from '@/components/menus/FinancesMenu.vue';
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useTopMenu } from '@/composables/useTopMenu'
import axios from 'axios'

const router = useRouter()
const { currentMenu } = useTopMenu()

const userData = ref({
  firstName: '',
  name: '',
  email: ''
})
const educativeData = ref([])
const provinceData = ref([])
const token = localStorage.getItem('token')
const userEmail = localStorage.getItem('userEmail')
const apiBaseUrl = import.meta.env.VITE_API_BASE_URL

// function isTokenValid(token) {
//   if (!token) return false
//   try {
//     const payload = JSON.parse(atob(token.split('.')[1]))
//     return payload.exp > Date.now() / 1000
//   } catch {
//     return false
//   }
// }

// async function fetchUserData() {
//   try {
//     if (!isTokenValid(token)) {
//       localStorage.removeItem('token')
//       router.push('/sign-in')
//       return
//     }

//     const response = await axios.get(`${apiBaseUrl}/api/users`, {
//       headers: {
//         Authorization: `Bearer ${token}`
//       }
//     })
//     console.log(`1. l'email est : ${userEmail}`)

//     if (response.data.member && response.data.member.length > 0) {
//       const authenticatedUser = response.data.member.find(user => user.email === userEmail)
//       console.log(`2. l'email est : ${userEmail}`)

//       if (authenticatedUser) {
//         console.log(`3. l'email est : ${userEmail}`)

//         userData.value = authenticatedUser
//       }
//     }
//   } catch (error) {
//     if (error.response?.status === 401) {
//       localStorage.removeItem('token')
//       router.push('/sign-in')
//     }
//     console.error('Error fetching user data:', error)
//   }
// }

// async function fetchEducative() {
//   try {
//     if (!isTokenValid(token)) return
//     const response = await axios.get(`${apiBaseUrl}/api/educative_systemes`, {
//       headers: {
//         Authorization: `Bearer ${token}`
//       }
//     })
//     if (response.data.member && response.data.member.length > 0) {
//       educativeData.value = response.data.member
//     }
//   } catch (error) {
//     if (error.response?.status === 401) {
//       localStorage.removeItem('token')
//       router.push('/signn-in')
//     }
//     console.error('Error fetching educative data:', error)
//   }
// }

// async function fetchProvince() {
//   try {
//     if (!isTokenValid(token)) return
//     const response = await axios.get(`${apiBaseUrl}/api/provinces`, {
//       headers: {
//         Authorization: `Bearer ${token}`
//       }
//     })
//     if (response.data.member && response.data.member.length > 0) {
//       provinceData.value = response.data.member
//     }
//   } catch (error) {
//     if (error.response?.status === 401) {
//       localStorage.removeItem('token')
//       router.push('/sign-in')
//     }
//     console.error('Error fetching province data:', error)
//   }
// }
// let paceScript = null;

// onMounted(async () => {
//   await Promise.all([
//     fetchUserData(),
//     fetchEducative(),
//     fetchProvince()
//   ])

//   // Crée une nouvelle balise script
//   paceScript = document.createElement('script');
//   paceScript.src = '/assets/vendor/pace-progress/pace.min.js';
//   paceScript.async = true;
//   paceScript.id = 'pace-script';

//   document.body.appendChild(paceScript);
// });

// onUnmounted(() => {
//   // Retire le script lorsque le composant est détruit
//   if (paceScript) {
//     document.body.removeChild(paceScript);
//   }
//   // Pace.js ajoute des éléments au body, il faut aussi les nettoyer
//   const paceElements = document.querySelectorAll('.pace');
//   paceElements.forEach(el => el.remove());
// });

</script>

<template>
<div class="be-wrapper be-fixed-sidebar">
      <HeaderDash :userData="userData">
        <template #navigation>
          <CommuniquesMenu v-if="currentMenu === 'communiques'" />
          <NewCommuniqueMenu v-else-if="currentMenu === 'new-communique'" />
          <FinancesMenu v-else-if="currentMenu === 'rap-day' || currentMenu === 'paie' || currentMenu === 'dep-new'  || currentMenu === 'dep-suivis'" />
          <AdmMenu v-else-if="currentMenu === 'services' ||currentMenu === 'adm-select'" />
          <LogMenu v-else-if="currentMenu === 'dortoir' ||currentMenu === 'carrefour' ||currentMenu === 'affect'" />
          <ul v-else class="navbar-nav">
            <li class="nav-item"><router-link class="nav-link" :to="{ name: 'dashboard' }">Accueil</router-link></li>
          </ul>
        </template>
      </HeaderDash>
      <AssideDash />
      <RouterView />
      <NavBarDash />
    </div>
</template>

