import { test, expect } from '@playwright/test'

test.describe('Equipment 设备管理', () => {
  test.beforeEach(async ({ page }) => {
    await page.evaluate(() => localStorage.setItem('aimes_token', 'mock-e2e-token'))
    await page.goto('/equipment')
    await page.waitForSelector('.equipment-board', { timeout: 20000 })
  })

  test('页面加载 — KPI 行', async ({ page }) => {
    await expect(page.locator('.kpi-row')).toBeVisible()
    const cards = page.locator('.kpi-card')
    const count = await cards.count()
    expect(count).toBe(4)
  })

  test('KPI 指标标签', async ({ page }) => {
    const labels = await page.locator('.kpi-card .kpi-label').allTextContents()
    expect(labels).toContain('运行中')
    expect(labels).toContain('设备利用率')
    expect(labels).toContain('设备可动率')
    expect(labels).toContain('待修/故障')
  })

  test('设备列表区域', async ({ page }) => {
    await expect(page.getByText('设备列表')).toBeVisible()
    await expect(page.locator('.eq-grid')).toBeVisible()
  })

  test('设备卡片渲染', async ({ page }) => {
    const eqCards = page.locator('.eq-card')
    const count = await eqCards.count()
    expect(count).toBeGreaterThan(0)
  })

  test('设备卡片显示名称和状态', async ({ page }) => {
    const firstCard = page.locator('.eq-card').first()
    await expect(firstCard.locator('.eq-name')).toBeVisible()
    await expect(firstCard.locator('.eq-status-dot')).toBeVisible()
    await expect(firstCard.locator('.eq-code')).toBeVisible()
    await expect(firstCard.locator('.eq-type-tag')).toBeVisible()
    await expect(firstCard.locator('.eq-bar')).toBeVisible()
  })

  test('利用率颜色标记', async ({ page }) => {
    const badges = page.locator('.eq-badge')
    const count = await badges.count()
    expect(count).toBeGreaterThan(0)
    // 利用率 badge 有颜色分类 (high/normal/low)
    for (let i = 0; i < Math.min(count, 5); i++) {
      const classNames = await badges.nth(i).getAttribute('class')
      expect(classNames).toMatch(/(high|normal|low)/)
    }
  })

  test('类型筛选下拉框', async ({ page }) => {
    const filterSelects = page.locator('.filter-select')
    await expect(filterSelects.first()).toBeVisible()
    const options = await filterSelects.first().locator('option').allTextContents()
    expect(options).toContain('全部类型')
  })

  test('状态筛选下拉框', async ({ page }) => {
    const filterSelects = page.locator('.filter-select')
    const statusSelect = filterSelects.nth(1)
    await expect(statusSelect).toBeVisible()

    const options = await statusSelect.locator('option').allTextContents()
    expect(options).toContain('全部状态')
    expect(options).toContain('运行中')
    expect(options).toContain('空闲')
    expect(options).toContain('维护中')
    expect(options).toContain('故障')
    expect(options).toContain('离线')
  })

  test('状态筛选切换', async ({ page }) => {
    const filterSelects = page.locator('.filter-select')
    const statusSelect = filterSelects.nth(1)

    await statusSelect.selectOption('running')
    await expect(statusSelect).toHaveValue('running')

    await statusSelect.selectOption('idle')
    await expect(statusSelect).toHaveValue('idle')

    // 重置
    await statusSelect.selectOption('')
    await expect(statusSelect).toHaveValue('')
  })

  test('点击设备打开详情面板', async ({ page }) => {
    const eqCards = page.locator('.eq-card')
    const count = await eqCards.count()

    if (count > 0) {
      await eqCards.first().click()
      await expect(page.locator('.detail-panel')).toBeVisible()
      await expect(page.locator('.detail-header h4')).toBeVisible()
    } else {
      test.skip()
    }
  })

  test('详情面板 — 概览 Tab', async ({ page }) => {
    const eqCards = page.locator('.eq-card')
    const count = await eqCards.count()
    if (count === 0) { test.skip(); return }

    await eqCards.first().click()
    await page.waitForSelector('.detail-panel', { timeout: 5000 })

    // 概览 tab 默认激活
    const overviewTab = page.locator('.detail-tabs button.active')
    await expect(overviewTab).toHaveText('概览')
    await expect(page.locator('.info-grid')).toBeVisible()
  })

  test('详情面板 — Tab 切换', async ({ page }) => {
    const eqCards = page.locator('.eq-card')
    const count = await eqCards.count()
    if (count === 0) { test.skip(); return }

    await eqCards.first().click()
    await page.waitForSelector('.detail-panel', { timeout: 5000 })

    const tabs = page.locator('.detail-tabs button')
    const tabCount = await tabs.count()
    expect(tabCount).toBe(4) // 概览/健康状态/维护记录/故障诊断

    // 切换到每个 tab
    const tabLabels = ['健康状态', '维护记录', '故障诊断']
    for (const label of tabLabels) {
      await page.locator('.detail-tabs button', { hasText: label }).click()
      await expect(page.locator('.detail-tabs button.active')).toHaveText(label)
    }
  })

  test('详情面板 — 故障诊断输入', async ({ page }) => {
    const eqCards = page.locator('.eq-card')
    const count = await eqCards.count()
    if (count === 0) { test.skip(); return }

    await eqCards.first().click()
    await page.waitForSelector('.detail-panel', { timeout: 5000 })

    // 切换到故障诊断 tab
    await page.locator('.detail-tabs button', { hasText: '故障诊断' }).click()

    const diagInput = page.locator('.diag-input')
    await expect(diagInput).toBeVisible()
    await expect(diagInput).toHaveAttribute('placeholder', /故障代码/)

    const diagBtn = page.locator('.diag-btn')
    await expect(diagBtn).toBeVisible()
    await expect(diagBtn).toHaveText('开始诊断')
  })

  test('关闭详情面板', async ({ page }) => {
    const eqCards = page.locator('.eq-card')
    const count = await eqCards.count()
    if (count === 0) { test.skip(); return }

    await eqCards.first().click()
    await page.waitForSelector('.detail-panel', { timeout: 5000 })

    await page.locator('.detail-panel .close-btn').click()
    await expect(page.locator('.detail-panel')).not.toBeVisible()
  })

  test('空筛选结果显示空状态', async ({ page }) => {
    // 拦截设备列表 API 返回空
    await page.route('**/api/equipment/list*', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ items: [], totalCount: 0, page: 1, pageSize: 20, totalPages: 1 }),
      })
    })
    await page.reload()
    await page.waitForSelector('.equipment-board', { timeout: 10000 })

    await expect(page.getByText('无匹配设备')).toBeVisible()
  })

  test('设备利用率进度条', async ({ page }) => {
    const bars = page.locator('.eq-bar')
    const count = await bars.count()
    expect(count).toBeGreaterThan(0)

    // 验证每个设备有利用率进度条
    for (let i = 0; i < Math.min(count, 3); i++) {
      const width = await bars.nth(i).getAttribute('style')
      expect(width).toMatch(/width:\s*\d+%/)
    }
  })
})
