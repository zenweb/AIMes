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
})
