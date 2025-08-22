
import AccueilDash from '@/partials/dashboard/AccueilDash.vue'
import Diocesain from '@/partials/dashboard/persons/new/Diocesain.vue'
import DiocesainAna from '@/partials/dashboard/persons/analytic/DiocesainAna.vue'
import DetailInfo from '@/partials/dashboard/persons/info/DetailInfo.vue'
import ListInfo from '@/partials/dashboard/persons/info/ListInfo.vue'
import NewInfo from '@/partials/dashboard/persons/info/NewInfo.vue'
import DashboardView from '@/views/DashboardView.vue'
// import PersonsView from '@/views/PersonsView.vue'
import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    // {
    //   path: '/',
    //   name: 'home',
    //   component: DashboardView,
    // },
//     {
//   path: '/sign-in',
//   name: 'SignIn',
//   component: LoginPage
// },
// {
//   path: '/sign-up',
//   name: 'SignUp',
//   component: SignUpPage
// },
// {
//   path: '/forgot-password',
//   name: 'ForgotPassword',
//   component: ForgotPasswordPage
// },
    {
    path: '/admin',
    component: DashboardView,
    meta: { requiresAuth: true },
    children: [
      {
        path: 'dashboard',
        name: 'dashboard',
        component: AccueilDash
      },
      {
    path: 'persons',
    // component: PersonsView,
    meta: { requiresAuth: true },
    children: [
      {
        path: 'new-diocesain',
        name: 'new-diocesain',
        component: Diocesain
      },
      {
        path: 'analytic-diocesain',
        name: 'analytic-diocesain',
        component: DiocesainAna
      },
      {
        path: 'news',
        // component: Information,
        meta: { requiresAuth: true },
        children: [
          {
        path: 'list',
        name: 'list',
        component: ListInfo
      },
      {
        path: 'detail',
        name: 'detail',
        component: DetailInfo
      },
      {
        path: 'compose',
        name: 'composer',
        component: NewInfo
      },
        ]
      },
    ]
  }
    ]
  }
  ],
})

export default router
