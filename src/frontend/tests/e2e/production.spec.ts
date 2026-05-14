import { test, expect } from '@playwright/test'

test.describe('Production 生产看板', () => {
  test.beforeEach(async ({ page }) => {
    await page.evaluate(() => localStorage.setItem('aimes_token', 'mock-e2e-token'))
    await page.goto('/production')
    await page.waitForSelector('.production-board', { timeout: 20000 })
  })

  test('页面加载 — 产量摘要栏', async ({ page }) => {
    await expect(page.locator('.summary-bar')).toBeVisible()
    const items = page.locator('.summary-item')
    const count = await items.count()
    expect(count).toBe(6) // 总工单/生产中/已完成/待生产/完成数/准时率
  })

  test('产量摘要显示数值', async ({ page }) => {
    const values = page.locator('.summary-value')
    const count = await values.count()
    expect(count).toBe(6)
    // 每个值都应显示（可能为 0）
    for (let i = 0; i < count; i++) {
      const text = await values.nth(i).textContent()
      expect(text).not.toBeNull()
    }
  })

  test('工单列表渲染', async ({ page }) => {
    await expect(page.locator('.panel-header')).toBeVisible()
    await expect(page.getByText('工单列表')).toBeVisible()
  })

  test('状态筛选下拉框', async ({ page }) => {
    const filterSelect = page.locator('.filter-select')
    await expect(filterSelect).toBeVisible()

    // 验证筛选选项
    const options = await filterSelect.locator('option').allTextContents()
    expect(options).toContain('全部状态')
    expect(options).toContain('待生产')
    expect(options).toContain('生产中')
    expect(options).toContain('已完成')
  })

  test('状态筛选切换', async ({ page }) => {
    const filterSelect = page.locator('.filter-select')

    await filterSelect.selectOption('in_progress')
    await expect(filterSelect).toHaveValue('in_progress')

    await filterSelect.selectOption('completed')
    await expect(filterSelect).toHaveValue('completed')

    // 重置为全部
    await filterSelect.selectOption('')
    await expect(filterSelect).toHaveValue('')
  })

  test('扫码输入框', async ({ page }) => {
    const scanInput = page.locator('.scan-input')
    await expect(scanInput).toBeVisible()
    await expect(scanInput).toHaveAttribute('placeholder', /扫码/)

    // 空输入时查询按钮禁用
    await expect(page.locator('.scan-btn')).toBeDisabled()
  })

  test('扫码查询按钮', async ({ page }) => {
    const scanInput = page.locator('.scan-input')
    await scanInput.fill('WO-001')
    await expect(page.locator('.scan-btn')).toBeEnabled()
  })

  test('点击工单显示详情面板', async ({ page }) => {
    const woCards = page.locator('.wo-card')
    const cardCount = await woCards.count()

    if (cardCount > 0) {
      await woCards.first().click()
      // 右侧详情面板应出现
      await expect(page.locator('.detail-empty')).not.toBeVisible()
      await expect(page.locator('.detail-header')).toBeVisible()
      // 工单号应显示
      await expect(page.locator('.detail-title-row h3')).toBeVisible()
    } else {
      test.skip() // 无工单数据时跳过
    }
  })

  test('工单详情显示产品信息', async ({ page }) => {
    const woCards = page.locator('.wo-card')
    const cardCount = await woCards.count()

    if (cardCount > 0) {
      await woCards.first().click()
      await expect(page.locator('.detail-info-grid')).toBeVisible()
      const labels = await page.locator('.detail-info-grid .di label').allTextContents()
      expect(labels).toContain('产品')
      expect(labels).toContain('产品编码')
      expect(labels).toContain('计划数量')
      expect(labels).toContain('完成数量')
    } else {
      test.skip()
    }
  })

  test('工单详情显示工序列表', async ({ page }) => {
    const woCards = page.locator('.wo-card')
    const cardCount = await woCards.count()

    if (cardCount > 0) {
      await woCards.first().click()
      await expect(page.locator('.operations-section')).toBeVisible()
      await expect(page.getByText('工序')).toBeVisible()
    } else {
      test.skip()
    }
  })

  test('工序包含操作按钮', async ({ page }) => {
    const woCards = page.locator('.wo-card')
    const cardCount = await woCards.count()

    if (cardCount > 0) {
      await woCards.first().click()
      const opCards = page.locator('.op-card')
      const opCount = await opCards.count()

      if (opCount > 0) {
        // 每个工序应有操作按钮（开工/完工/异常）
        const firstOp = opCards.first()
        const buttons = firstOp.locator('button')
        const btnCount = await buttons.count()
        expect(btnCount).toBeGreaterThanOrEqual(1)
      }
    } else {
      test.skip()
    }
  })

  test('开工对话框', async ({ page }) => {
    const woCards = page.locator('.wo-card')
    const cardCount = await woCards.count()

    if (cardCount > 0) {
      await woCards.first().click()
      const startBtn = page.locator('.op-btn.start').first()
      const visible = await startBtn.isVisible().catch(() => false)

      if (visible) {
        await startBtn.click()
        await expect(page.locator('.dialog-overlay')).toBeVisible()
        await expect(page.getByText('开工确认')).toBeVisible()
        await expect(page.locator('.dialog-card input')).toBeVisible()

        // 空工位时确认按钮禁用
        await expect(page.locator('.dialog-confirm')).toBeDisabled()

        // 填写工位后可用
        await page.locator('.dialog-card input').fill('ST-001')
        await expect(page.locator('.dialog-confirm')).toBeEnabled()

        // 取消
        await page.locator('.dialog-cancel').click()
        await expect(page.locator('.dialog-overlay')).not.toBeVisible()
      }
    } else {
      test.skip()
    }
  })

  test('空状态下显示暂无工单', async ({ page }) => {
    // 拦截工单列表 API 返回空
    await page.route('**/api/production/work-orders*', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ items: [], totalCount: 0, page: 1, pageSize: 20, totalPages: 1 }),
      })
    })
    await page.reload()
    await page.waitForSelector('.production-board', { timeout: 10000 })

    await expect(page.getByText('暂无工单')).toBeVisible()
  })

  test('进度条显示', async ({ page }) => {
    await expect(page.locator('.wo-progress-bar').first()).toBeVisible({ timeout: 5000 })
    await expect(page.locator('.wo-progress-fill').first()).toBeVisible()
  })
})
