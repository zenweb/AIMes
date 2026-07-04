import { test, expect } from '@playwright/test'

function offlineDemoPath(path: string) {
  return `${path}?offlineDemo=1`
}

test.describe('Barcode 条码打印追溯标签', () => {
  test.describe.configure({ timeout: 60000 })

  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('aimes_offline_demo', 'true')
      localStorage.setItem('aimes_token', 'demo-token-admin')
      localStorage.setItem('aimes_refresh_token', 'demo-refresh-admin')
      localStorage.setItem('aimes_user', JSON.stringify({ username: 'admin', displayName: '管理员', role: 'Admin', mustChangePassword: false }))
    })
    await page.goto(offlineDemoPath('barcode'), { waitUntil: 'commit' })
    await expect(page.getByRole('heading', { name: '条码 / QR 打印' })).toBeVisible({ timeout: 30000 })
  })

  test('离线演示条码入口不会触达库存后端接口', async ({ page }) => {
    let inventoryBackendRequests = 0
    await page.route('**/api/v1/inventory**', async route => {
      inventoryBackendRequests += 1
      await route.fulfill({
        status: 599,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'offline demo inventory backend leak from barcode' }),
      })
    })

    await page.goto(offlineDemoPath('barcode'), { waitUntil: 'domcontentloaded' })
    await expect(page.getByRole('heading', { name: '条码 / QR 打印' })).toBeVisible({ timeout: 30000 })

    await expect(page.locator('.label-card').filter({ hasText: 'M-AL-6061' })).toBeVisible()
    await expect(page.locator('.print-error')).toHaveCount(0)
    await expect(page.locator('body')).not.toContainText('offline demo inventory backend leak from barcode')
    expect(inventoryBackendRequests).toBe(0)
  })

  test('展示工单、设备、物料标签批次和扫描后业务入口', async ({ page }) => {
    const panel = page.locator('.trace-batch')
    await expect(panel.getByText('现场追溯标签批次')).toBeVisible()
    await expect(panel.getByText('BATCH-QR-20260520-01')).toBeVisible()
    await expect(panel.getByText('WO-RUSH-9001', { exact: true })).toBeVisible()
    await expect(panel.getByText('CNC-01', { exact: true })).toBeVisible()
    await expect(panel.getByText('M-AL-6061', { exact: true })).toBeVisible()
    await expect(panel.getByText('扫码 -> 生产报工 -> AI 排产')).toBeVisible()
    await expect(panel.getByText('扫码 -> 设备维护 -> 实时监控')).toBeVisible()
    await expect(panel.getByText('扫码 -> 库存齐套 -> BOM 管理')).toBeVisible()
    await expect(panel.getByText('TRACE-QR-WO-RUSH-9001-ARRIVAL')).toBeVisible()
    await expect(panel.getByText('TRACE-QR-CNC-01-CHECK')).toBeVisible()
    await expect(panel.getByText('TRACE-QR-M-AL-6061-KIT')).toBeVisible()
    await expect(panel.getByText(/现场确认后写入 OTD 证据链/)).toBeVisible()

    await panel.getByRole('link', { name: '去扫描验证' }).click()
    await expect(page).toHaveURL(/\/scheduling\/scanner/)
    await expect(page.locator('.scanner-board')).toBeVisible()
  })

  test('标签卡片展示扫码后的上下文去向', async ({ page }) => {
    await expect(page.locator('.label-card')).toHaveCount(4)
    await expect(page.locator('.label-card').filter({ hasText: 'M-AL-6061' }).getByText('扫码后进入库存齐套')).toBeVisible()
    await expect(page.locator('.label-card').filter({ hasText: 'WO-RUSH-9001' }).getByText('扫码后进入生产报工')).toBeVisible()
    await expect(page.locator('.label-card').filter({ hasText: 'CNC-01' }).getByText('扫码后进入设备详情')).toBeVisible()
  })
})
