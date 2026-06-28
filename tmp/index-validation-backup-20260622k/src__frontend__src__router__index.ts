import { createRouter, createWebHistory } from 'vue-router'
import { getLocalAccessToken } from '../utils/auth-token'
import { getLocalUser, getLocalUserRole } from '../utils/local-user'
import { setOfflineDemoMode } from '../utils/offline-demo-mode'

declare module 'vue-router' {
  interface RouteMeta {
    requiresAuth?: boolean
    roles?: string[]
  }
}

// Allowed roles (kept in sync with backend AdminBoard definitions)
const ROLES = {
  ADMIN: 'Admin',
  ENGINEER: 'Engineer',
  LEAD: 'Lead',
  OPERATOR: 'Operator',
  QC: 'QC',
} as const

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
      path: '/change-password',
      name: 'ChangePassword',
      component: () => import('../components/auth/ChangePasswordPage.vue'),
      meta: { requiresAuth: true },
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
      meta: { requiresAuth: true, roles: [ROLES.ADMIN, ROLES.ENGINEER] },
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
      meta: { requiresAuth: true, roles: [ROLES.ADMIN, ROLES.ENGINEER] },
    },
    {
      path: '/routing',
      name: 'Routing',
      component: () => import('../components/routing/RoutingBoard.vue'),
      meta: { requiresAuth: true, roles: [ROLES.ADMIN, ROLES.ENGINEER] },
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
      meta: { requiresAuth: true, roles: [ROLES.ADMIN, ROLES.ENGINEER] },
    },
    {
      path: '/inventory',
      name: 'Inventory',
      component: () => import('../components/inventory/InventoryBoard.vue'),
      meta: { requiresAuth: true, roles: [ROLES.ADMIN, ROLES.ENGINEER] },
    },
    {
      path: '/purchase',
      name: 'Purchase',
      component: () => import('../components/purchase/PurchaseBoard.vue'),
      meta: { requiresAuth: true, roles: [ROLES.ADMIN, ROLES.ENGINEER] },
    },
    {
      path: '/employee',
      name: 'Employee',
      component: () => import('../components/employee/EmployeeBoard.vue'),
      meta: { requiresAuth: true, roles: [ROLES.ADMIN] },
    },
    {
      path: '/admin',
      name: 'Admin',
      component: () => import('../components/admin/AdminBoard.vue'),
      meta: { requiresAuth: true, roles: [ROLES.ADMIN] },
    },
    {
      path: '/barcode',
      name: 'Barcode',
      component: () => import('../components/barcode/BarcodePrintBoard.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/scanner',
      name: 'Scanner',
      component: () => import('../components/scanner/ScannerBoard.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/audit-logs',
      name: 'AuditLogs',
      component: () => import('../components/auditLog/AuditLogBoard.vue'),
      meta: { requiresAuth: true, roles: [ROLES.ADMIN] },
    },
    {
      path: '/report',
      name: 'Report',
      component: () => import('../components/report/ReportBoard.vue'),
      meta: { requiresAuth: true, roles: [ROLES.ADMIN, ROLES.ENGINEER] },
    },
    {
      path: '/monitoring',
      name: 'Monitoring',
      component: () => import('../components/monitoring/MonitoringBoard.vue'),
      meta: { requiresAuth: true },
    },
  ],
})

function demoEntryQuery(query: Record<string, unknown>) {
  const result: Record<string, string> = {}
  for (const key of ['offlineDemo', 'demoMode']) {
    const value = query[key]
    if (typeof value === 'string') result[key] = value
  }
  return result
}

function protectedEntryQuery(to: { path: string; fullPath?: string; query?: Record<string, unknown> }) {
  return {
    ...demoEntryQuery(to.query ?? {}),
    redirect: to.fullPath || to.path,
  }
}

function isExplicitDemoEntry(query: Record<string, unknown>) {
  const value = query.offlineDemo ?? query.demoMode
  return value === '1' || value === 'true' || value === 'offline'
}

function clearCachedAuth() {
  localStorage.removeItem('aimes_token')
  localStorage.removeItem('aimes_refresh_token')
  localStorage.removeItem('aimes_user')
}

router.beforeEach((to, _from, next) => {
  const token = getLocalAccessToken()
  const cachedUser = getLocalUser()
  const userRole = getLocalUserRole()
  const isAuthenticated = !!token && !!cachedUser && !!userRole
  const mustChangePassword = cachedUser?.mustChangePassword === true

  if (token?.startsWith('demo-token-') && !isExplicitDemoEntry(to.query) && (to.path === '/login' || to.meta.requiresAuth)) {
    clearCachedAuth()
    setOfflineDemoMode(false)
    next(to.path === '/login' ? undefined : { path: '/login' })
  } else if (to.meta.requiresAuth && !isAuthenticated) {
    next({ path: '/login', query: protectedEntryQuery(to) })
  } else if (mustChangePassword && to.path !== '/change-password' && to.path !== '/login') {
    next('/change-password')
  } else if (to.path === '/login' && isAuthenticated) {
    next(mustChangePassword ? '/change-password' : '/dashboard')
  } else {
    // Role-based access check
    const routeRoles = to.meta.roles as string[] | undefined
    if (routeRoles && routeRoles.length > 0) {
      if (!routeRoles.includes(userRole)) {
        next('/dashboard')
        return
      }
    }
    next()
  }
})

export default router
