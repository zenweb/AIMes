import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory('/scheduling/'),
  routes: [
    {
      path: '/',
      redirect: '/dashboard',
    },
    {
      path: '/dashboard',
      name: 'Dashboard',
      component: () => import('../components/dashboard/DashboardBoard.vue'),
    },
    {
      path: '/scheduling',
      name: 'Scheduling',
      component: () => import('../components/schedule/ScheduleBoard.vue'),
    },
  ],
})

export default router
