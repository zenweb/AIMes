import { test, expect } from '@playwright/test'

test.describe('Dashboard 生产概览', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/dashboard')
    await page.waitForTimeout(500)
  })

  test('页面标题显示正确', async ({ page }) => {
    await expect(page).toHaveTitle(/AIMes/)
  })

  test('KPI 指标卡片渲染', async ({ page }) => {
    await expect(page.locator('.kpi-card')).toHaveCount(4)
  })

  test('设备状态列表渲染', async ({ page }) => {
    await expect(page.locator('.equip-item')).toHaveCount(8)
  })

  test('今日排产任务列表', async ({ page }) => {
    await expect(page.locator('.today-item')).toHaveCount(5)
  })

  test('物料预警显示', async ({ page }) => {
    await expect(page.locator('.alert-item')).toHaveCount(3)
  })

  test('顶部导航包含所有模块', async ({ page }) => {
    const navLinks = page.locator('.nav-link')
    const count = await navLinks.count()
    expect(count).toBeGreaterThan(10)
    await expect(navLinks.first()).toHaveText('生产概览')
  })
})
