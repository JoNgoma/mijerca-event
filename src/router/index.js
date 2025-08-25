
import AccueilDash from '@/partials/dashboard/AccueilDash.vue'
import NewUnity from '@/partials/dashboard/persons/new/NewUnity.vue'
import Analytic from '@/partials/dashboard/persons/analytic/Analytic.vue'
import DetailInfo from '@/partials/dashboard/persons/info/DetailInfo.vue'
import ListInfo from '@/partials/dashboard/persons/info/ListInfo.vue'
import NewInfo from '@/partials/dashboard/persons/info/NewInfo.vue'
import NewBiblic from '@/partials/dashboard/biblic/NewBiblic.vue'
import Paie from '@/partials/dashboard/biblic/Paie.vue'
import RapDay from '@/partials/dashboard/biblic/RapDay.vue'
import DepNew from '@/partials/dashboard/biblic/DepNew.vue'
import DepSuivis from '@/partials/dashboard/biblic/DepSuivis.vue'
import DashboardView from '@/views/DashboardView.vue'
import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
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
          meta: { requiresAuth: true },
          children: [
            {
              path: ':serviceType/new-unit',
              name: 'new-unit',
              component: NewUnity
            },
            {
              path: ':serviceType/analytic',
              name: 'analytic',
              component: Analytic
            },
            {
              path: ':serviceType/news',
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
        },
        {
              path: 'biblic',
              meta: { requiresAuth: true },
              children: [
                {
                  path: 'new',
                  name: 'new-camp',
                  component: NewBiblic
                },
                {
                  path: 'finances',
              meta: { requiresAuth: true },
              children: [
                {
                  path: '',
              meta: { requiresAuth: true },
              children: [
                {
                  path: ':serviceType',
                  name: 'rap-day',
                  component: RapDay
                },
                {
                  path: 'out',
                  meta: { requiresAuth: true },
                  children: [
                    {
                      path: ':serviceType',
                      name: 'dep-new',
                      component: DepNew
                    },
                    {
                      path: ':serviceType',
                      name: 'dep-suivis',
                      component: DepSuivis
                    },
                  ]}
              ]
                },
                {
                  path: 'paie/:serviceType',
                  name: 'paie',
                  component: Paie
                }
              ]
                }
              ]
            }
      ]
    }
  ],
})

export default router
