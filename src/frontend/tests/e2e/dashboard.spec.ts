import { test, expect } from '@playwright/test'

test.describe('Dashboard 生产概览', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('aimes_token', 'mock-e2e-token')
      localStorage.setItem('aimes_user', JSON.stringify({ username: 'admin', displayName: '管理员', role: 'Admin' }))
    })
    await page.goto('dashboard')
    await page.waitForTimeout(1000)
  })

  test('页面标题显示正确', async ({ page }) => {
    await expect(page).toHaveTitle(/AIMes/)
  })

  test('KPI 指标卡片渲染', async ({ page }) => {
    await expect(page.locator('.kpi-card')).toHaveCount(4)
  })

  test('设备状态列表', async ({ page }) => {
    await expect(page.locator('.equip-item').first()).toBeVisible()
  })

  test('今日排产任务', async ({ page }) => {
    await expect(page.locator('.today-item').first()).toBeVisible()
  })

  test('物料预警区域', async ({ page }) => {
    await expect(page.locator('.alert-item').first()).toBeVisible()
  })

  test('顶部导航包含所有模块', async ({ page }) => {
    const navLinks = page.locator('.nav-link')
    const count = await navLinks.count()
    expect(count).toBeGreaterThan(5)
    await expect(navLinks.first()).toHaveText('生产概览')
  })
})
