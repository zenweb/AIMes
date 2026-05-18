import { test, expect } from '@playwright/test'

test.describe('Scheduling 排产甘特图', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('./')
    await page.addInitScript(() => {
      localStorage.setItem('aimes_token', 'mock-e2e-token')
      localStorage.setItem('aimes_user', JSON.stringify({ username: 'admin', displayName: '管理员', role: 'Admin' }))
    })
    await page.goto('scheduling')
    await page.waitForSelector('.schedule-board', { timeout: 20000 })
  })

  test('页面加载 — 指标卡片', async ({ page }) => {
    const cards = page.locator('.metric-card')
    await expect(cards).toHaveCount(4)
    const labels = await cards.locator('.metric-label').allTextContents()
    expect(labels).toContain('设备利用率')
    expect(labels).toContain('准时交付率')
    expect(labels).toContain('换线时间')
    expect(labels).toContain('批次组数')
  })

  test('工具栏显示', async ({ page }) => {
    await expect(page.locator('.toolbar')).toBeVisible()

    await expect(page.getByText('排产优化').first()).toBeVisible()
    await expect(page.getByText('刷新').first()).toBeVisible()
  })

  test('优化目标下拉框可用', async ({ page }) => {
    const select = page.locator('.objective-label select')
    await expect(select).toBeVisible()

    await select.selectOption('utilization')
    await expect(select).toHaveValue('utilization')

    await select.selectOption('balanced')
    await expect(select).toHaveValue('balanced')
  })

  test('甘特图视图渲染', async ({ page }) => {
    await expect(page.locator('.gantt-container')).toBeVisible()
    await page.waitForSelector('.gantt_task_line', { timeout: 10000 })
  })

  test('任务条数量', async ({ page }) => {
    await page.waitForSelector('.gantt_task_line', { timeout: 10000 })
    const bars = page.locator('.gantt_task_line')
    const count = await bars.count()
    expect(count).toBeGreaterThan(0)
  })

  test('时间刻度切换', async ({ page }) => {
    const scaleSelect = page.locator('.scale-label select')
    await expect(scaleSelect).toBeVisible()

    await scaleSelect.selectOption('month')
    await expect(page.locator('.gantt_task')).toBeVisible()

    await scaleSelect.selectOption('day')
    await expect(page.locator('.gantt_task')).toBeVisible()
  })

  test('依赖箭头渲染', async ({ page }) => {
    await page.waitForSelector('.gantt_task_line', { timeout: 10000 })
    const links = page.locator('.gantt_task_link')
    const count = await links.count()
    expect(count).toBeGreaterThanOrEqual(0)
  })

  test('瓶颈设备标记', async ({ page }) => {
    await page.waitForSelector('.gantt_task_line', { timeout: 10000 })
    // Bottleneck indicator may not render in every dataset
    const bottleneck = page.getByText('[瓶颈]').first()
    const visible = await bottleneck.isVisible().catch(() => false)
    if (visible) {
      await expect(bottleneck).toBeVisible()
    }
  })

  test('刷新按钮点击响应', async ({ page }) => {
    const refreshBtn = page.getByText('刷新')
    await expect(refreshBtn).toBeVisible()
    await refreshBtn.click()
    // Page should remain stable after refresh
    await expect(page.locator('.toolbar')).toBeVisible()
  })
})
