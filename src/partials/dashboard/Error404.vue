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

</script>

<template>
<div class="be-splash-screen">
      <div class="be-wrapper be-error be-error-404">
      <div class="be-content">
        <div class="main-content container-fluid">
          <div class="error-container">
            <div class="error-number">404</div>
            <div class="error-description">La page recherchée n'existe pas ou se situe en pleine maintenance.</div>
            <div class="error-goback-text">Souhaitez-vous retourner à l'accueil ?</div>
            <div class="error-goback-button"><router-link :to="{ name: 'dashboard' }" class="btn btn-xl btn-primary" >Accueil</router-link></div>
            <div class="footer">&copy; 2025, Beyin LazQuir</div>
          </div>
        </div>
      </div>
    </div>
    </div>
</template>

