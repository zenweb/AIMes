import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory('/scheduling/'),
  routes: [
    {
      path: '/',
      redirect: '/dashboard',
    },
    {
      path: '/login',
      name: 'Login',
      component: () => import('../components/auth/LoginPage.vue'),
    },
    {
      path: '/dashboard',
      name: 'Dashboard',
      component: () => import('../components/dashboard/DashboardBoard.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/risk',
      name: 'Risk',
      component: () => import('../components/risk/RiskBoard.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/scheduling',
      name: 'Scheduling',
      component: () => import('../components/schedule/ScheduleBoard.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/quality',
      name: 'Quality',
      component: () => import('../components/quality/QualityBoard.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/equipment',
      name: 'Equipment',
      component: () => import('../components/equipment/EquipmentBoard.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/production',
      name: 'Production',
      component: () => import('../components/production/ProductionBoard.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/bom',
      name: 'Bom',
      component: () => import('../components/bom/BomBoard.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/routing',
      name: 'Routing',
      component: () => import('../components/routing/RoutingBoard.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/anomaly',
      name: 'Anomaly',
      component: () => import('../components/anomaly/AnomalyBoard.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/knowledge/documents',
      name: 'DocumentUpload',
      component: () => import('../components/knowledge/DocumentUpload.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/inventory',
      name: 'Inventory',
      component: () => import('../components/inventory/InventoryBoard.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/purchase',
      name: 'Purchase',
      component: () => import('../components/purchase/PurchaseBoard.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/employee',
      name: 'Employee',
      component: () => import('../components/employee/EmployeeBoard.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/admin',
      name: 'Admin',
      component: () => import('../components/admin/AdminBoard.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/barcode',
      name: 'Barcode',
      component: () => import('../components/barcode/BarcodePrintBoard.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/audit-logs',
      name: 'AuditLogs',
      component: () => import('../components/auditLog/AuditLogBoard.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/report',
      name: 'Report',
      component: () => import('../components/report/ReportBoard.vue'),
      meta: { requiresAuth: true },
    },
  ],
})

router.beforeEach((to, _from, next) => {
  const token = localStorage.getItem('aimes_token')
  if (to.meta.requiresAuth && !token) {
    next('/login')
  } else if (to.path === '/login' && token) {
    next('/dashboard')
  } else {
    next()
  }
})

export default router
