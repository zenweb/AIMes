import { test, expect } from '@playwright/test'

test.describe('功能模块 E2E', () => {
  test.beforeEach(async ({ page }) => {
    // 通过 login 页面建立登录态（路由 /login 无需认证）
    await page.goto('/scheduling/login')
    await page.waitForSelector('#username', { timeout: 10000 })
    // fill demo login
    await page.fill('#username', 'admin')
    await page.fill('#password', 'admin123')
    await page.click('button[type="submit"]')
    await page.waitForTimeout(500)
  })

  test('BOM 管理页面渲染', async ({ page }) => {
    await page.goto('/scheduling/bom')
    await page.waitForTimeout(500)
    await expect(page.locator('.page-title')).toHaveText('BOM 物料清单')
    await expect(page.locator('.list-item')).toHaveCount(3)
  })

  test('工艺路线页面渲染', async ({ page }) => {
    await page.goto('/scheduling/routing')
    await page.waitForTimeout(500)
    await expect(page.locator('.page-title')).toHaveText('工艺路线管理')
    await expect(page.locator('.list-item')).toHaveCount(3)
  })

  test('异常管理页面渲染', async ({ page }) => {
    await page.goto('/scheduling/anomaly')
    await page.waitForTimeout(500)
    await expect(page.locator('.page-title')).toHaveText('异常管理')
    await expect(page.locator('.anomaly-card')).toHaveCount(4)
  })

  test('库存管理页面渲染', async ({ page }) => {
    await page.goto('/scheduling/inventory')
    await page.waitForTimeout(500)
    await expect(page.locator('.page-title')).toHaveText('库存管理')
    await expect(page.locator('.list-item').first()).toBeVisible()
  })

  test('采购管理页面渲染', async ({ page }) => {
    await page.goto('/scheduling/purchase')
    await page.waitForTimeout(500)
    await expect(page.locator('.page-title')).toHaveText('采购管理')
    await expect(page.locator('.list-item').first()).toBeVisible()
  })

  test('人员管理页面渲染', async ({ page }) => {
    await page.goto('/scheduling/employee')
    await page.waitForTimeout(500)
    await expect(page.locator('.page-title')).toHaveText('人员管理')
    await expect(page.locator('.emp-card').first()).toBeVisible()
  })

  test('系统管理页面渲染', async ({ page }) => {
    await page.goto('/scheduling/admin')
    await page.waitForTimeout(500)
    await expect(page.locator('.page-title')).toHaveText('系统管理')
    await expect(page.locator('.tab.active')).toHaveText('用户管理')
  })

  test('报表中心页面渲染', async ({ page }) => {
    await page.goto('/scheduling/report')
    await page.waitForTimeout(500)
    await expect(page.locator('.page-title')).toHaveText('报表中心')
    await expect(page.locator('.section')).toHaveCount(4)
  })

  test('文档上传页面渲染', async ({ page }) => {
    await page.goto('/scheduling/knowledge/documents')
    await page.waitForTimeout(500)
    await expect(page.locator('.page-title')).toHaveText('文档上传')
    await expect(page.locator('.drop-zone')).toBeVisible()
  })

  test('排产甘特图页面渲染', async ({ page }) => {
    await page.goto('/scheduling/scheduling')
    await page.waitForTimeout(500)
    await expect(page.locator('.schedule-board')).toBeVisible()
    await expect(page.locator('.metric-card')).toHaveCount(4)
  })
})
