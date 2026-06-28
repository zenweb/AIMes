import { test, expect } from '@playwright/test'

test.describe('功能模块 E2E', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('aimes_offline_demo', 'true')
      localStorage.setItem('aimes_token', 'demo-token-admin')
      localStorage.setItem('aimes_refresh_token', 'demo-refresh-admin')
      localStorage.setItem(
        'aimes_user',
        JSON.stringify({ username: 'admin', displayName: '管理员', role: 'Admin', mustChangePassword: false }),
      )
    })
  })

  async function gotoOfflineDemo(page: import('@playwright/test').Page, path: string) {
    await page.goto(`${path}?offlineDemo=1`, { waitUntil: 'commit' })
  }

  async function expectNoTechnicalFallback(page: import('@playwright/test').Page) {
    await expect(page.getByText('Offline demo mode skipped backend request')).toHaveCount(0)
    await expect(page.getByText('API 返回了 HTML fallback')).toHaveCount(0)
    await expect(page.getByText('请求错误')).toHaveCount(0)
    await expect(page.getByText('加载失败')).toHaveCount(0)
  }

  test('排产甘特图页面渲染', async ({ page }) => {
    await gotoOfflineDemo(page, 'scheduling')
    await expect(page.locator('.schedule-board')).toBeVisible()
    await expect(page.locator('.metric-card')).toHaveCount(4)
    await expectNoTechnicalFallback(page)
  })

  test('质量管理页面渲染', async ({ page }) => {
    await gotoOfflineDemo(page, 'quality')
    await expect(page.locator('.quality-board')).toBeVisible()
    await expectNoTechnicalFallback(page)
  })

  test('风险预警页面渲染', async ({ page }) => {
    await gotoOfflineDemo(page, 'risk')
    await expect(page.locator('.risk-board')).toBeVisible()
    await expect(page.locator('.risk-action-panel')).toBeVisible()
    await expectNoTechnicalFallback(page)
  })

  test('人员管理页面渲染', async ({ page }) => {
    await gotoOfflineDemo(page, 'employee')
    await expect(page.locator('.emp-board')).toBeVisible()
    await expect(page.locator('.skill-matrix-panel')).toBeVisible()
    await expectNoTechnicalFallback(page)
  })

  test('设备管理页面渲染', async ({ page }) => {
    await gotoOfflineDemo(page, 'equipment')
    await expect(page.locator('.equipment-board')).toBeVisible()
    await expect(page.locator('.equipment-impact-panel')).toBeVisible()
    await expectNoTechnicalFallback(page)
  })

  test('库存管理页面渲染', async ({ page }) => {
    await gotoOfflineDemo(page, 'inventory')
    await expect(page.locator('.page-title')).toBeVisible()
    await expect(page.locator('.kitting-panel')).toBeVisible()
    await expectNoTechnicalFallback(page)
  })

  test('报表中心页面渲染', async ({ page }) => {
    await gotoOfflineDemo(page, 'report')
    await expect(page.locator('.page-title')).toHaveText('报表中心')
    await expect(page.locator('.header-actions')).toBeVisible()
    await expect(page.locator('.otd-report-section')).toBeVisible()
    await expectNoTechnicalFallback(page)
  })

  test('条码打印页面渲染', async ({ page }) => {
    await gotoOfflineDemo(page, 'barcode')
    await expect(page.locator('.page-title')).toHaveText('条码 / QR 打印')
    await expect(page.locator('.label-card')).toHaveCount(4)
    await expectNoTechnicalFallback(page)
  })

  test('条码扫描页面渲染', async ({ page }) => {
    await gotoOfflineDemo(page, 'scanner')
    await expect(page.locator('.page-title')).toHaveText('条码扫描')
    await expect(page.locator('.scanner-board')).toBeVisible()
    await expect(page.locator('.code-input')).toBeVisible()
    await expectNoTechnicalFallback(page)
  })

  test('文档上传页面渲染', async ({ page }) => {
    await gotoOfflineDemo(page, 'knowledge/documents')
    await expect(page.locator('.upload-page')).toBeVisible()
    await expect(page.locator('.knowledge-governance-panel')).toBeVisible()
    await expectNoTechnicalFallback(page)
  })

  test('审计日志页面渲染', async ({ page }) => {
    await gotoOfflineDemo(page, 'audit-logs')
    await expect(page.locator('.audit-board')).toBeVisible()
    await expect(page.locator('.audit-replay-panel')).toBeVisible()
    await expectNoTechnicalFallback(page)
  })

  test('实时监控页面渲染', async ({ page }) => {
    await gotoOfflineDemo(page, 'monitoring')
    await expect(page.locator('.monitoring')).toBeVisible()
    await expectNoTechnicalFallback(page)
  })
})
