import { beforeEach, describe, expect, it, vi } from 'vitest'
import { installMemoryLocalStorage } from './test-storage'

vi.mock('../../src/components/auth/LoginPage.vue', () => ({ default: { template: '<div />' } }))
vi.mock('../../src/components/auth/ChangePasswordPage.vue', () => ({ default: { template: '<div />' } }))
vi.mock('../../src/components/dashboard/DashboardBoard.vue', () => ({ default: { template: '<div />' } }))
vi.mock('../../src/components/risk/RiskBoard.vue', () => ({ default: { template: '<div />' } }))
vi.mock('../../src/components/schedule/ScheduleBoard.vue', () => ({ default: { template: '<div />' } }))
vi.mock('../../src/components/quality/QualityBoard.vue', () => ({ default: { template: '<div />' } }))
vi.mock('../../src/components/equipment/EquipmentBoard.vue', () => ({ default: { template: '<div />' } }))
vi.mock('../../src/components/production/ProductionBoard.vue', () => ({ default: { template: '<div />' } }))
vi.mock('../../src/components/bom/BomBoard.vue', () => ({ default: { template: '<div />' } }))
vi.mock('../../src/components/routing/RoutingBoard.vue', () => ({ default: { template: '<div />' } }))
vi.mock('../../src/components/anomaly/AnomalyBoard.vue', () => ({ default: { template: '<div />' } }))
vi.mock('../../src/components/knowledge/DocumentUpload.vue', () => ({ default: { template: '<div />' } }))
vi.mock('../../src/components/inventory/InventoryBoard.vue', () => ({ default: { template: '<div />' } }))
vi.mock('../../src/components/purchase/PurchaseBoard.vue', () => ({ default: { template: '<div />' } }))
vi.mock('../../src/components/employee/EmployeeBoard.vue', () => ({ default: { template: '<div />' } }))
vi.mock('../../src/components/admin/AdminBoard.vue', () => ({ default: { template: '<div />' } }))
vi.mock('../../src/components/barcode/BarcodePrintBoard.vue', () => ({ default: { template: '<div />' } }))
vi.mock('../../src/components/scanner/ScannerBoard.vue', () => ({ default: { template: '<div />' } }))
vi.mock('../../src/components/auditLog/AuditLogBoard.vue', () => ({ default: { template: '<div />' } }))
vi.mock('../../src/components/report/ReportBoard.vue', () => ({ default: { template: '<div />' } }))
vi.mock('../../src/components/monitoring/MonitoringBoard.vue', () => ({ default: { template: '<div />' } }))

async function loadRouter() {
  vi.resetModules()
  return (await import('../../src/router')).default
}

describe('router auth guard', () => {
  beforeEach(() => {
    installMemoryLocalStorage()
    localStorage.clear()
    window.history.replaceState({}, '', '/scheduling/')
  })

  it('treats a blank access token as unauthenticated for protected routes', async () => {
    localStorage.setItem('aimes_token', '   ')

    const router = await loadRouter()
    await router.push('/dashboard')
    await router.isReady()

    expect(router.currentRoute.value.path).toBe('/login')
  })

  it('treats a missing cached user as unauthenticated even when an access token exists', async () => {
    localStorage.setItem('aimes_token', 'stale-token')

    const router = await loadRouter()
    await router.push('/dashboard')
    await router.isReady()

    expect(router.currentRoute.value.path).toBe('/login')
  })

  it('preserves explicit offline demo mode and return target when protected route visitors are redirected to login', async () => {
    const router = await loadRouter()
    await router.push('/employee?offlineDemo=1')
    await router.isReady()

    expect(router.currentRoute.value.path).toBe('/login')
    expect(router.currentRoute.value.query).toMatchObject({
      offlineDemo: '1',
      redirect: '/employee?offlineDemo=1',
    })
  })

  it('treats a cached user without role as unauthenticated for protected routes', async () => {
    localStorage.setItem('aimes_token', 'stale-token')
    localStorage.setItem('aimes_user', JSON.stringify({
      username: 'unknown',
      displayName: '未知用户',
      mustChangePassword: false,
    }))

    const router = await loadRouter()
    await router.push('/dashboard')
    await router.isReady()

    expect(router.currentRoute.value.path).toBe('/login')
  })

  it('authorizes role-restricted routes after normalizing cached role whitespace', async () => {
    localStorage.setItem('aimes_token', 'admin-token')
    localStorage.setItem('aimes_user', JSON.stringify({
      username: 'admin',
      displayName: '管理员',
      role: '  Admin  ',
      mustChangePassword: false,
    }))

    const router = await loadRouter()
    await router.push('/admin')
    await router.isReady()

    expect(router.currentRoute.value.path).toBe('/admin')
  })

  it('redirects authenticated users who must change password before entering protected routes', async () => {
    localStorage.setItem('aimes_token', 'admin-token')
    localStorage.setItem('aimes_user', JSON.stringify({
      username: 'admin',
      displayName: '管理员',
      role: 'Admin',
      mustChangePassword: true,
    }))

    const router = await loadRouter()
    await router.push('/dashboard')
    await router.isReady()

    expect(router.currentRoute.value.path).toBe('/change-password')
  })

  it('allows forced password-change users to stay on the change-password route', async () => {
    localStorage.setItem('aimes_token', 'first-login-token')
    localStorage.setItem('aimes_user', JSON.stringify({
      username: 'operator',
      displayName: '操作员',
      role: 'Operator',
      mustChangePassword: true,
    }))

    const router = await loadRouter()
    await router.push('/change-password')
    await router.isReady()

    expect(router.currentRoute.value.path).toBe('/change-password')
  })

  it('redirects authenticated users away from login to keep the main workbench as the entry point', async () => {
    localStorage.setItem('aimes_token', 'engineer-token')
    localStorage.setItem('aimes_user', JSON.stringify({
      username: 'engineer',
      displayName: '工程师',
      role: 'Engineer',
      mustChangePassword: false,
    }))

    const router = await loadRouter()
    await router.push('/login')
    await router.isReady()

    expect(router.currentRoute.value.path).toBe('/dashboard')
  })

  it('lets stale demo sessions return to plain login so live backend authentication can recover', async () => {
    localStorage.setItem('aimes_offline_demo', 'true')
    localStorage.setItem('aimes_token', 'demo-token-admin')
    localStorage.setItem('aimes_refresh_token', 'demo-refresh-admin')
    localStorage.setItem('aimes_user', JSON.stringify({
      username: 'admin',
      displayName: '管理员',
      role: 'Admin',
      mustChangePassword: false,
    }))

    const router = await loadRouter()
    await router.push('/login')
    await router.isReady()

    expect(router.currentRoute.value.path).toBe('/login')
    expect(localStorage.getItem('aimes_token')).toBeNull()
    expect(localStorage.getItem('aimes_refresh_token')).toBeNull()
    expect(localStorage.getItem('aimes_user')).toBeNull()
    expect(localStorage.getItem('aimes_offline_demo')).toBe('false')
  })

  it('clears stale demo sessions from protected live entries before employee requests can skip the backend', async () => {
    localStorage.setItem('aimes_offline_demo', 'true')
    localStorage.setItem('aimes_token', 'demo-token-admin')
    localStorage.setItem('aimes_refresh_token', 'demo-refresh-admin')
    localStorage.setItem('aimes_user', JSON.stringify({
      username: 'admin',
      displayName: '管理员',
      role: 'Admin',
      mustChangePassword: false,
    }))

    const router = await loadRouter()
    await router.push('/employee')
    await router.isReady()

    expect(router.currentRoute.value.path).toBe('/login')
    expect(localStorage.getItem('aimes_token')).toBeNull()
    expect(localStorage.getItem('aimes_refresh_token')).toBeNull()
    expect(localStorage.getItem('aimes_user')).toBeNull()
    expect(localStorage.getItem('aimes_offline_demo')).toBe('false')
  })

  it('redirects authenticated forced password-change users from login to change-password', async () => {
    localStorage.setItem('aimes_token', 'first-login-token')
    localStorage.setItem('aimes_user', JSON.stringify({
      username: 'operator',
      displayName: '操作员',
      role: 'Operator',
      mustChangePassword: true,
    }))

    const router = await loadRouter()
    await router.push('/login')
    await router.isReady()

    expect(router.currentRoute.value.path).toBe('/change-password')
  })

  it('redirects the root entry to dashboard for authenticated users', async () => {
    localStorage.setItem('aimes_token', 'admin-token')
    localStorage.setItem('aimes_user', JSON.stringify({
      username: 'admin',
      displayName: '管理员',
      role: 'Admin',
      mustChangePassword: false,
    }))

    const router = await loadRouter()
    await router.push('/')
    await router.isReady()

    expect(router.currentRoute.value.path).toBe('/dashboard')
  })

  it('allows engineers to enter engineering routes without weakening admin-only routes', async () => {
    localStorage.setItem('aimes_token', 'engineer-token')
    localStorage.setItem('aimes_user', JSON.stringify({
      username: 'engineer',
      displayName: '工程师',
      role: 'Engineer',
      mustChangePassword: false,
    }))

    const router = await loadRouter()
    await router.push('/bom')
    await router.isReady()
    expect(router.currentRoute.value.path).toBe('/bom')

    await router.push('/admin')
    await router.isReady()
    expect(router.currentRoute.value.path).toBe('/dashboard')
  })

  it('allows operators to enter production execution routes while protecting engineering data setup', async () => {
    localStorage.setItem('aimes_token', 'operator-token')
    localStorage.setItem('aimes_user', JSON.stringify({
      username: 'operator',
      displayName: '操作员',
      role: 'Operator',
      mustChangePassword: false,
    }))

    const router = await loadRouter()
    await router.push('/production')
    await router.isReady()
    expect(router.currentRoute.value.path).toBe('/production')

    await router.push('/inventory')
    await router.isReady()
    expect(router.currentRoute.value.path).toBe('/dashboard')
  })

  it('redirects operators away from engineering-only scheduling routes', async () => {
    localStorage.setItem('aimes_token', 'operator-token')
    localStorage.setItem('aimes_user', JSON.stringify({
      username: 'operator',
      displayName: '操作员',
      role: 'Operator',
      mustChangePassword: false,
    }))

    const router = await loadRouter()
    await router.push('/scheduling')
    await router.isReady()

    expect(router.currentRoute.value.path).toBe('/dashboard')
  })

  it('redirects role-restricted routes to login when the cached user payload is missing a role', async () => {
    localStorage.setItem('aimes_token', 'stale-token')
    localStorage.setItem('aimes_user', JSON.stringify({
      username: 'unknown',
      displayName: '未知用户',
      mustChangePassword: false,
    }))

    const router = await loadRouter()
    await router.push('/report')
    await router.isReady()

    expect(router.currentRoute.value.path).toBe('/login')
  })

  it('clears demo auth memory before opening the live-backend login recovery entry', async () => {
    localStorage.setItem('aimes_offline_demo', 'true')
    localStorage.setItem('aimes_token', 'demo-token-admin')
    localStorage.setItem('aimes_refresh_token', 'demo-refresh-admin')
    localStorage.setItem('aimes_user', JSON.stringify({
      username: 'admin',
      displayName: '管理员',
      role: 'Admin',
      mustChangePassword: false,
    }))

    const router = await loadRouter()
    const auth = await import('../../src/stores/auth')
    expect(auth.useAuth().isLoggedIn.value).toBe(true)

    await router.push('/login?offlineDemo=0&redirect=/employee?offlineDemo=0')
    await router.isReady()

    expect(router.currentRoute.value.path).toBe('/login')
    expect(router.currentRoute.value.query).toMatchObject({
      offlineDemo: '0',
      redirect: '/employee?offlineDemo=0',
    })
    expect(auth.useAuth().isLoggedIn.value).toBe(false)
    expect(localStorage.getItem('aimes_offline_demo')).toBe('false')
    expect(localStorage.getItem('aimes_token')).toBeNull()
    expect(localStorage.getItem('aimes_refresh_token')).toBeNull()
    expect(localStorage.getItem('aimes_user')).toBeNull()
  })

  it('resolves every registered workbench route component so navigation targets cannot silently drift', async () => {
    const router = await loadRouter()

    const routes = router.getRoutes()
      .filter(route => route.path !== '/')
      .sort((a, b) => a.path.localeCompare(b.path))
    const paths = routes.map(route => route.path)

    expect(paths).toEqual([
      '/admin',
      '/anomaly',
      '/audit-logs',
      '/barcode',
      '/bom',
      '/change-password',
      '/dashboard',
      '/employee',
      '/equipment',
      '/inventory',
      '/knowledge/documents',
      '/login',
      '/monitoring',
      '/production',
      '/purchase',
      '/quality',
      '/report',
      '/risk',
      '/routing',
      '/scanner',
      '/scheduling',
    ])

    for (const route of routes) {
      const component = route.components?.default
      expect(component, `${route.path} should have a default component`).toBeTypeOf('function')
      await expect((component as () => Promise<unknown>)()).resolves.toHaveProperty('default')
    }
  })
})
