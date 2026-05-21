import { test, expect } from '@playwright/test'

test.describe('功能模块 E2E', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('aimes_token', 'mock-e2e-token')
      localStorage.setItem('aimes_user', JSON.stringify({ username: 'admin', displayName: '管理员', role: 'Admin' }))
    })
  })

  test('排产甘特图页面渲染', async ({ page }) => {
    await page.goto('scheduling')
    await page.waitForTimeout(500)
    await expect(page.locator('.schedule-board')).toBeVisible()
    await expect(page.locator('.metric-card')).toHaveCount(4)
  })

  test('质量管理页面渲染', async ({ page }) => {
    await page.goto('quality')
    await page.waitForTimeout(500)
    await expect(page.locator('.quality-board')).toBeVisible()
  })

  test('风险预警页面渲染', async ({ page }) => {
    await page.goto('risk')
    await page.waitForTimeout(500)
    await expect(page.locator('.risk-board')).toBeVisible()
    await expect(page.locator('.risk-action-panel')).toBeVisible()
  })

  test('人员管理页面渲染', async ({ page }) => {
    await page.goto('employee')
    await page.waitForTimeout(500)
    await expect(page.locator('.emp-board')).toBeVisible()
    await expect(page.locator('.skill-matrix-panel')).toBeVisible()
  })

  test('设备管理页面渲染', async ({ page }) => {
    await page.goto('equipment')
    await page.waitForTimeout(500)
    await expect(page.locator('.equipment-board')).toBeVisible()
    await expect(page.locator('.equipment-impact-panel')).toBeVisible()
  })

  test('库存管理页面渲染', async ({ page }) => {
    await page.goto('inventory')
    await page.waitForTimeout(500)
    await expect(page.locator('.page-title')).toBeVisible()
    await expect(page.locator('.kitting-panel')).toBeVisible()
  })

  test('报表中心页面渲染', async ({ page }) => {
    await page.goto('report')
    await page.waitForTimeout(500)
    await expect(page.locator('.page-title')).toHaveText('报表中心')
    await expect(page.locator('.header-actions')).toBeVisible()
    await expect(page.locator('.otd-report-section')).toBeVisible()
  })

  test('条码打印页面渲染', async ({ page }) => {
    await page.goto('barcode')
    await page.waitForTimeout(500)
    await expect(page.locator('.page-title')).toHaveText('条码 / QR 打印')
    await expect(page.locator('.label-card')).toHaveCount(4)
  })

  test('条码扫描页面渲染', async ({ page }) => {
    await page.goto('scanner')
    await page.waitForTimeout(500)
    await expect(page.locator('.page-title')).toHaveText('条码扫描')
    await expect(page.locator('.scanner-board')).toBeVisible()
    await expect(page.locator('.code-input')).toBeVisible()
  })

  test('文档上传页面渲染', async ({ page }) => {
    await page.goto('knowledge/documents')
    await page.waitForTimeout(500)
    await expect(page.locator('.upload-page')).toBeVisible()
    await expect(page.locator('.knowledge-governance-panel')).toBeVisible()
  })

  test('审计日志页面渲染', async ({ page }) => {
    await page.goto('audit-logs')
    await page.waitForTimeout(500)
    await expect(page.locator('.audit-board')).toBeVisible()
    await expect(page.locator('.audit-replay-panel')).toBeVisible()
  })

  test('实时监控页面渲染', async ({ page }) => {
    await page.goto('monitoring')
    await page.waitForTimeout(500)
    await expect(page.locator('.monitoring')).toBeVisible()
  })
})
