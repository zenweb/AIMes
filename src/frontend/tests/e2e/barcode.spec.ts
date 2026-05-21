import { test, expect } from '@playwright/test'

test.describe('Barcode 条码打印追溯标签', () => {
  test.describe.configure({ timeout: 60000 })

  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('aimes_token', 'mock-e2e-token')
      localStorage.setItem('aimes_user', JSON.stringify({ username: 'admin', displayName: '管理员', role: 'Admin' }))
    })
    await page.goto('barcode', { waitUntil: 'commit' })
    await expect(page.getByRole('heading', { name: '条码 / QR 打印' })).toBeVisible({ timeout: 30000 })
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
