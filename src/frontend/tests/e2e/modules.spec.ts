import { test, expect } from '@playwright/test'

test.describe('功能模块 E2E', () => {
  test.beforeEach(async ({ page }) => {
    await page.evaluate(() => localStorage.setItem('aimes_token', 'mock-e2e-token'))
  })

  test('排产甘特图页面渲染', async ({ page }) => {
    await page.goto('/scheduling/scheduling')
    await page.waitForTimeout(500)
    await expect(page.locator('.schedule-board')).toBeVisible()
    await expect(page.locator('.metric-card')).toHaveCount(4)
  })

  test('质量管理页面渲染', async ({ page }) => {
    await page.goto('/scheduling/quality')
    await page.waitForTimeout(500)
    await expect(page.locator('.quality-board')).toBeVisible()
  })

  test('设备管理页面渲染', async ({ page }) => {
    await page.goto('/scheduling/equipment')
    await page.waitForTimeout(500)
    await expect(page.locator('.equipment-board')).toBeVisible()
  })

  test('库存管理页面渲染', async ({ page }) => {
    await page.goto('/scheduling/inventory')
    await page.waitForTimeout(500)
    await expect(page.locator('.page-title')).toBeVisible()
  })

  test('报表中心页面渲染', async ({ page }) => {
    await page.goto('/scheduling/report')
    await page.waitForTimeout(500)
    await expect(page.locator('.page-title')).toHaveText('报表中心')
    await expect(page.locator('.header-actions')).toBeVisible()
  })

  test('条码打印页面渲染', async ({ page }) => {
    await page.goto('/scheduling/barcode')
    await page.waitForTimeout(500)
    await expect(page.locator('.page-title')).toHaveText('条码 / QR 打印')
    await expect(page.locator('.label-card')).toHaveCount(4)
  })

  test('条码扫描页面渲染', async ({ page }) => {
    await page.goto('/scheduling/scanner')
    await page.waitForTimeout(500)
    await expect(page.locator('.page-title')).toHaveText('条码扫描')
    await expect(page.locator('.scanner-board')).toBeVisible()
    await expect(page.locator('.code-input')).toBeVisible()
  })

  test('实时监控页面渲染', async ({ page }) => {
    await page.goto('/scheduling/monitoring')
    await page.waitForTimeout(500)
    await expect(page.locator('.monitoring')).toBeVisible()
  })
})
