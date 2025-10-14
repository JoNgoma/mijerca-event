import { createRouter, createWebHistory } from 'vue-router'

// Home
import HomeView from '../views/HomeView.vue'
import HomeAccueil from '../partials/home/HomeAccueil.vue'

// Dashboard
import DashboardView from '@/views/DashboardView.vue'
import LoginPage from '@/views/auth/LoginPage.vue'
import AccueilDash from '@/partials/dashboard/AccueilDash.vue'
import PersonsView from '@/views/PersonsView.vue'
import NewUnity from '@/partials/dashboard/persons/new/NewUnity.vue'
import AnalyticPerson from '@/partials/dashboard/persons/analytic/AnalyticPerson.vue'
import ListInfo from '@/partials/dashboard/persons/info/ListInfo.vue'
import DetailInfo from '@/partials/dashboard/persons/info/DetailInfo.vue'
import NewInfo from '@/partials/dashboard/persons/info/NewInfo.vue'

// Biblic
import NewBiblic from '@/partials/dashboard/biblic/NewBiblic.vue'
import TabListService from '@/partials/dashboard/biblic/admin/TabListService.vue'
import TabNewService from '@/partials/dashboard/biblic/admin/TabNewService.vue'
import PageRapport from '@/partials/dashboard/biblic/finance/PageRapport.vue'
import DepNew from '@/partials/dashboard/biblic/DepNew.vue'
import DepSuivis from '@/partials/dashboard/biblic/DepSuivis.vue'
import NewPaie from '@/partials/dashboard/biblic/finance/NewPaie.vue'

// Logistique
import TabDor from '@/partials/dashboard/biblic/hebergement/TabDor.vue'
import TabCar from '@/partials/dashboard/biblic/hebergement/TabCar.vue'
import TabAffect from '@/partials/dashboard/biblic/hebergement/TabAffect.vue'

// Informatique
import BadgeEditor from '@/partials/dashboard/biblic/informatique/BadgeEditor.vue'
import BadgePreview from '@/partials/dashboard/biblic/informatique/BadgePreview.vue'
import PersonSelector from '@/partials/dashboard/biblic/informatique/PersonSelector.vue'
import A4Generator from '@/partials/dashboard/biblic/informatique/A4Generator.vue'

// Paroisses
import DoyStat from '@/partials/dashboard/paroisses/DoyStat.vue'
import KinParoisse from '@/partials/dashboard/paroisses/KinParoisse.vue'
import ParDoyNew from '@/partials/dashboard/paroisses/ParDoyNew.vue'

// 404
import PageError404 from '@/partials/dashboard/PageError404.vue'
import UpdateInfo from '@/partials/home/UpdateInfo.vue'
import SignJeune from '@/partials/home/SignJeune.vue'
import HomeEvents from '@/partials/home/HomeEvents.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    // ----- HOME -----
    {
      path: '',
      component: HomeView,
      children: [
        { path: '', name: 'home', component: HomeAccueil },
        { path: 'events', name: 'events', component: HomeEvents },
        { path: 'sign-up', name: 'signUp', component: SignJeune },
        { path: 'update-info', name: 'updateInfo', component: UpdateInfo },
        { path: 'login', name: 'login', component: LoginPage },
      ],
    },

    // ----- DASHBOARD -----
    {
      path: '/admin',
      component: DashboardView,
      meta: { requiresAuth: true },
      children: [
        { path: 'dashboard', name: 'dashboard', component: AccueilDash },

        // ---- Persons ----
        {
          path: 'persons',
          component: PersonsView,
          children: [
            { path: ':serviceType/new-unit', name: 'new-unit', component: NewUnity },
            { path: ':serviceType/analytic', name: 'analytic', component: AnalyticPerson },
            {
              path: ':serviceType/news',
              children: [
                { path: 'list', name: 'list', component: ListInfo },
                { path: 'detail', name: 'detail', component: DetailInfo },
                { path: 'compose', name: 'composer', component: NewInfo },
              ],
            },
          ],
        },

        // ---- Biblic ----
        { path: 'biblic/new', name: 'new-camp', component: NewBiblic },
        { path: ':id_campBiblique/:serviceType', name: 'services', component: TabListService },
        { path: ':id_campBiblique/services/:serviceType', name: 'manager', component: TabNewService },
        { path: ':id_campBiblique/services/:serviceType', name: 'media', component: TabNewService },

        // Finances
        { path: ':id_campBiblique/finances/:serviceType', name: 'rap-day', component: PageRapport },
        { path: ':id_campBiblique/finances/out/:serviceType', name: 'dep-new', component: DepNew },
        { path: ':id_campBiblique/finances/out/:serviceType/suivis', name: 'dep-suivis', component: DepSuivis },
        { path: ':id_campBiblique/finances/paie/:serviceType', name: 'paie', component: NewPaie },

        // Logistique
        { path: ':id_campBiblique/logistique/:serviceType', name: 'log-dortoir', component: TabDor },
        { path: ':id_campBiblique/logistique/:serviceType', name: 'log-carrefour', component: TabCar },
        { path: ':id_campBiblique/logistique/:serviceType', name: 'log-affect', component: TabAffect },

        // Informatique
        { path: ':id_campBiblique/informatique/badge-editor/:serviceType', name: 'info-badge-editor', component: BadgeEditor },
        { path: ':id_campBiblique/informatique/badge-preview/:serviceType', name: 'info-badge-preview', component: BadgePreview },
        { path: ':id_campBiblique/informatique/person-selector/:serviceType', name: 'info-person-selector', component: PersonSelector },
        { path: ':id_campBiblique/informatique/a4-generator/:serviceType', name: 'info-a4-generator', component: A4Generator },

        // Secteur / Paroisses
        { path: 'secteur/:serviceType', name: 'sec-kin', component: DoyStat },
        { path: 'secteur/:serviceType/paroisse', name: 'sec-paroisse', component: KinParoisse },
        { path: 'secteur/:serviceType/new-doypar', name: 'sec-new', component: ParDoyNew },
      ],
    },

    // 404 - FRONT ONLY
    {
      path: '/:pathMatch(.*)*',
      name: 'NotFound',
      component: PageError404,
      beforeEnter: (to, from, next) => {
        if (to.path.startsWith('/api') || to.path.startsWith('/sse')) {
          return next(false)
        }
        next()
      },
    },
  ],
})

// ----- Navigation guard -----
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token')
  const roles = JSON.parse(localStorage.getItem('roles') || '[]') // <-- ici
  const isAuthenticated = !!token

  // Auth obligatoire
  if (to.matched.some(record => record.meta.requiresAuth) && !isAuthenticated) {
    return next({ name: 'login' })
  }

  // Déjà connecté → empêcher retour sur /login
  if (isAuthenticated && to.name === 'login') {
    return next({ name: 'dashboard' })
  }

  // Vérif rôle pour /admin/*
  if (to.path.startsWith('/admin')) {

    if (roles.includes('ROLE_ADMIN')) {
      // Accès total
      return next()
    }

    if (roles.includes('ROLE_NOYAU') || roles.includes('ROLE_DECANAL') || roles.includes('ROLE_DIOCESE')) {
      // Routes autorisées pour ROLE_NOYAU
      if (roles.includes('ROLE_DECANAL') || roles.includes('ROLE_DIOCESE')){
        const allowedRoutes = [
          'dashboard', 'new-unit', 'analytic', 'sec-kin', 'sec-paroisse', 'sec-new', 
          'services', 'manager', 'media',
          'rap-day', 'dep-new', 'dep-suivis', 'paie',
          'log-dortoir', 'log-carrefour', 'log-affect',
          'info-badge-editor', 'info-badge-preview', 'info-person-selector', 'info-a4-generator'
        ]
      if (allowedRoutes.includes(to.name)) {
        return next()
      } else {
        return 
      }
      }
      const allowedRoutes = [
        'dashboard', 'new-unit', 'analytic', 'sec-kin', 'sec-paroisse',
         'services', 'manager', 'media',
          'rap-day', 'dep-new', 'dep-suivis', 'paie',
          'log-dortoir', 'log-carrefour', 'log-affect',
          'info-badge-editor', 'info-badge-preview', 'info-person-selector', 'info-a4-generator'
        ]
      if (allowedRoutes.includes(to.name)) {
        return next()
      } else {
        return 
      }
    }
    // Aucun rôle valide → rediriger
    return 
  }

  next()
})

export default router
