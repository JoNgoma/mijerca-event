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
import AdmServices from '@/partials/dashboard/biblic/AdmServices.vue'
import AdmSelectService from '@/partials/dashboard/biblic/AdmSelectService.vue'
import PageRapport from '@/partials/dashboard/biblic/rapport/PageRapport.vue'
import DepNew from '@/partials/dashboard/biblic/DepNew.vue'
import DepSuivis from '@/partials/dashboard/biblic/DepSuivis.vue'
import Paie from '@/partials/dashboard/biblic/Paie.vue'

// Logistique
import LogDor from '@/partials/dashboard/biblic/hebergement/LogDor.vue'
import LogCar from '@/partials/dashboard/biblic/hebergement/LogCar.vue'
import LogAffect from '@/partials/dashboard/biblic/hebergement/LogAffect.vue'

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
      meta: { requiresAuth: true }, // Tous les enfants héritent
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
        { path: ':id_campBiblique/services/:serviceType', name: 'services', component: AdmServices },
        { path: ':id_campBiblique/services/:serviceType/select', name: 'adm-select', component: AdmSelectService },

        // Finances
        { path: ':id_campBiblique/finances/:serviceType', name: 'rap-day', component: PageRapport },
        { path: ':id_campBiblique/finances/out/:serviceType', name: 'dep-new', component: DepNew },
        { path: ':id_campBiblique/finances/out/:serviceType/suivis', name: 'dep-suivis', component: DepSuivis },
        { path: ':id_campBiblique/finances/paie/:serviceType', name: 'paie', component: Paie },

        // Logistique
        { path: ':id_campBiblique/logistique/dortoir', name: 'log-dortoir', component: LogDor },
        { path: ':id_campBiblique/logistique/carrefour', name: 'log-carrefour', component: LogCar },
        { path: ':id_campBiblique/logistique/affect', name: 'log-affect', component: LogAffect },

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

    // 404 - front only
{
  path: '/:pathMatch(.*)*',
  name: 'NotFound',
  component: PageError404,
  beforeEnter: (to, from, next) => {
    // Si l'URL commence par /api ou /sse, laisse Symfony gérer
    if (to.path.startsWith('/api') || to.path.startsWith('/sse')) {
      return next(false); // Annule la navigation côté Vue
    }
    next(); // Sinon affiche la page 404 front
  }
},
  ],
})

// ----- Navigation guard -----
router.beforeEach((to, from, next) => {
  const isAuthenticated = !!localStorage.getItem('token')

  // Si route requiert auth
  if (to.matched.some(record => record.meta.requiresAuth) && !isAuthenticated) {
    return next({ name: 'login' })
  }

  // Redirection si déjà connecté
  if (isAuthenticated && to.name === 'login') {
    return next({ name: 'dashboard' })
  }

  next()
})

export default router
