import { test, expect } from '@playwright/test'

test.describe('Routing 工艺路线', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('aimes_token', 'mock-e2e-token')
      localStorage.setItem('aimes_user', JSON.stringify({ username: 'admin', displayName: '管理员', role: 'Admin', mustChangePassword: false }))
      localStorage.setItem('aimes_offline_demo', 'false')
    })
  })

  test('工艺路线列表加载失败时真实浏览器展示 fail-loud fallback', async ({ page }) => {
    await page.route(/\/api\/v1\/routing(?:\?|$)/, route => route.fulfill({
      status: 503,
      contentType: 'application/json',
      body: JSON.stringify({ message: 'chromium routing list API unavailable' }),
    }))

    await page.goto('routing')
    await page.waitForSelector('.routing-board', { timeout: 20000 })

    const alert = page.locator('[role="alert"]').filter({ hasText: '工艺路线列表加载失败' })
    await expect(alert).toBeVisible()
    await expect(alert).toHaveAttribute('aria-live', 'assertive')
    await expect(alert).toContainText('chromium routing list API unavailable')
    const listbox = page.getByRole('listbox', { name: '工艺路线列表' })
    await expect(listbox.getByRole('option', { name: /精密轴承组件工艺路线/ })).toBeVisible()
    await expect(listbox.getByRole('option', { name: /传动轴总成工艺路线/ })).toBeVisible()
    await expect(listbox.getByRole('option', { name: /液压阀体工艺路线/ })).toBeVisible()
  })

  test('工艺路线详情加载失败时真实浏览器展示 fail-loud fallback', async ({ page }) => {
    await page.route(/\/api\/v1\/routing(?:\?|$)/, route => route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        items: [
          {
            id: 'r-1',
            routeCode: 'R-A100',
            routeName: '精密轴承组件工艺路线',
            productCode: 'PROD-A1',
            productName: '精密轴承组件 A',
            version: 'V1.0',
            status: 'Released',
            totalLeadTimeMinutes: 45,
            stepCount: 4,
          },
        ],
        totalCount: 1,
      }),
    }))
    await page.route('**/api/v1/routing/r-1', route => route.fulfill({
      status: 503,
      contentType: 'application/json',
      body: JSON.stringify({ message: 'chromium routing detail API unavailable' }),
    }))

    await page.goto('routing')
    await page.waitForSelector('.routing-board', { timeout: 20000 })
    await page.getByRole('option', { name: /精密轴承组件工艺路线/ }).click()

    const alert = page.locator('[role="alert"]').filter({ hasText: '工艺路线详情加载失败' })
    await expect(alert).toBeVisible()
    await expect(alert).toHaveAttribute('aria-live', 'assertive')
    await expect(alert).toContainText('chromium routing detail API unavailable')
    const detailPanel = page.locator('.detail-panel')
    await expect(detailPanel.getByRole('heading', { name: '精密轴承组件工艺路线' })).toBeVisible()
    await expect(detailPanel.getByText('工序列表 (4)')).toBeVisible()
    await expect(detailPanel.getByText('车削加工')).toBeVisible()
  })

  test('能力校验记录加载失败时真实浏览器展示 fail-loud 且保持待校验', async ({ page }) => {
    await page.route(/\/api\/v1\/routing(?:\?|$)/, route => route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        items: [
          {
            id: 'r-2',
            routeCode: 'R-B200',
            routeName: '传动轴总成工艺路线',
            productCode: 'PROD-B1',
            productName: '传动轴总成 B',
            version: 'V2.1',
            status: 'Released',
            totalLeadTimeMinutes: 120,
            stepCount: 6,
          },
        ],
        totalCount: 1,
      }),
    }))
    await page.route('**/api/v1/scheduling/route-capability-validation/latest', route => route.fulfill({
      status: 503,
      contentType: 'application/json',
      body: JSON.stringify({ message: 'chromium route capability backend unavailable' }),
    }))

    await page.goto('routing')
    await page.waitForSelector('.routing-board', { timeout: 20000 })
    await page.getByRole('option', { name: /传动轴总成工艺路线/ }).click()

    const alert = page.locator('[role="alert"]').filter({ hasText: '能力校验记录加载失败' })
    await expect(alert).toBeVisible()
    await expect(alert).toHaveAttribute('aria-live', 'assertive')
    await expect(alert).toContainText('chromium route capability backend unavailable')
    await expect(page.locator('.validation-status.open', { hasText: '待校验' })).toBeVisible()
    await expect(page.getByText('瓶颈已校验')).not.toBeVisible()
  })
})
