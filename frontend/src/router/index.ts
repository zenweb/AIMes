import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory('/scheduling/'),
  routes: [
    {
      path: '/',
      name: 'Scheduling',
      component: () => import('../components/schedule/ScheduleBoard.vue'),
    },
  ],
})

export default router
