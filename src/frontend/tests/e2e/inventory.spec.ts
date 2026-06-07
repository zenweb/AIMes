import { test, expect } from '@playwright/test'

test.describe('Inventory 缺料齐套闭环', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('aimes_token', 'mock-e2e-token')
      localStorage.setItem('aimes_user', JSON.stringify({ username: 'admin', displayName: '管理员', role: 'Admin', mustChangePassword: false }))
    })
    await page.goto('inventory')
    await page.waitForSelector('.inv-board', { timeout: 20000 })
    await page.evaluate(() => localStorage.removeItem('aimes_shortage_kitting_event'))
  })

  test('库存列表加载失败时真实浏览器展示 fail-loud fallback', async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('aimes_token', 'mock-e2e-token')
      localStorage.setItem('aimes_user', JSON.stringify({ username: 'admin', displayName: '管理员', role: 'Admin', mustChangePassword: false }))
      localStorage.setItem('aimes_offline_demo', 'false')
    })
    await page.route('**/api/v1/inventory/dashboard', route => route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        totalMaterials: 8,
        lowStockCount: 3,
        outOfStockCount: 1,
        todayTransactions: 2,
      }),
    }))
    await page.route('**/api/v1/inventory', route => route.fulfill({
      status: 503,
      contentType: 'application/json',
      body: JSON.stringify({ message: 'chromium inventory list API unavailable' }),
    }))

    await page.goto('inventory')
    await page.waitForSelector('.inv-board', { timeout: 20000 })

    const alert = page.locator('[role="alert"]').filter({ hasText: '库存列表加载失败' })
    await expect(alert).toBeVisible()
    await expect(alert).toContainText('chromium inventory list API unavailable')
    const listbox = page.getByRole('listbox', { name: '物料库存列表' })
    await expect(listbox.getByRole('option', { name: /轴承钢圈/ })).toBeVisible()
    await expect(listbox.getByRole('option', { name: /MAT-A01/ })).toBeVisible()
  })

  test('库存交易记录加载失败时真实浏览器展示 fail-loud fallback', async ({ page }) => {
    await page.evaluate(() => localStorage.setItem('aimes_offline_demo', 'false'))
    await page.route('**/api/v1/inventory/transactions**', route => route.fulfill({
      status: 503,
      contentType: 'application/json',
      body: JSON.stringify({ message: 'chromium inventory transactions API unavailable' }),
    }))

    await page.getByRole('option', { name: /轴承钢圈/ }).click()

    const alert = page.locator('[role="alert"]').filter({ hasText: '库存交易记录加载失败' })
    await expect(alert).toBeVisible()
    await expect(alert).toContainText('chromium inventory transactions API unavailable')
    const detailPanel = page.locator('.detail-panel').filter({ hasText: '轴承钢圈' })
    await expect(detailPanel.getByText('采购入库')).toBeVisible()
    await expect(detailPanel.getByText('生产领料')).toBeVisible()
    await expect(detailPanel.getByText('参考: PO-20260501')).toBeVisible()
  })

  test('库存操作弹窗支持 Escape 关闭并回到入库按钮', async ({ page }) => {
    await page.getByRole('option', { name: /轴承钢圈/ }).click()

    const stockInButton = page.locator('.detail-panel').getByRole('button', { name: '入库' })
    await stockInButton.focus()
    await page.keyboard.press('Enter')

    const dialog = page.getByRole('dialog', { name: '入库' })
    await expect(dialog).toBeVisible()
    await expect(dialog).toBeFocused()
    await expect(dialog.getByText('轴承钢圈 (MAT-A01)')).toBeVisible()

    await page.keyboard.press('Escape')
    await expect(dialog).toBeHidden()
    await expect(stockInButton).toBeFocused()
  })

  test('库存出库失败时真实浏览器保留弹窗并展示 alert', async ({ page }) => {
    await page.evaluate(() => localStorage.setItem('aimes_offline_demo', 'false'))
    await page.route('**/api/v1/inventory/stock-out', route => route.fulfill({
      status: 503,
      contentType: 'application/json',
      body: JSON.stringify({ message: 'chromium stock out API unavailable' }),
    }))

    await page.getByRole('option', { name: /轴承钢圈/ }).click()
    const stockOutButton = page.locator('.detail-panel').getByRole('button', { name: '出库' })
    await stockOutButton.click()

    const dialog = page.getByRole('dialog', { name: '出库' })
    await expect(dialog).toBeVisible()
    await expect(dialog.getByText('轴承钢圈 (MAT-A01)')).toBeVisible()
    await dialog.getByRole('button', { name: '确认' }).click()

    await expect(dialog).toBeVisible()
    const alert = dialog.locator('[role="alert"]')
    await expect(alert).toBeVisible()
    await expect(alert).toContainText('Request failed with status code 503')
    await expect(dialog.getByText('轴承钢圈 (MAT-A01)')).toBeVisible()
  })

  test('库存调拨失败时真实浏览器保留弹窗并展示 alert', async ({ page }) => {
    await page.evaluate(() => localStorage.setItem('aimes_offline_demo', 'false'))
    await page.route('**/api/v1/inventory/transfer', route => route.fulfill({
      status: 503,
      contentType: 'application/json',
      body: JSON.stringify({ message: 'chromium transfer API unavailable' }),
    }))

    await page.getByRole('option', { name: /轴承钢圈/ }).click()
    const transferButton = page.locator('.detail-panel').getByRole('button', { name: '调拨' })
    await transferButton.click()

    const dialog = page.getByRole('dialog', { name: '调拨' })
    await expect(dialog).toBeVisible()
    await expect(dialog.getByText('轴承钢圈 (MAT-A01)')).toBeVisible()
    await dialog.getByRole('button', { name: '确认' }).click()

    await expect(dialog).toBeVisible()
    const alert = dialog.locator('[role="alert"]')
    await expect(alert).toBeVisible()
    await expect(alert).toContainText('Request failed with status code 503')
    await expect(dialog.getByText('轴承钢圈 (MAT-A01)')).toBeVisible()
  })

  test('库存盘点失败时真实浏览器保留弹窗并展示 alert', async ({ page }) => {
    await page.evaluate(() => localStorage.setItem('aimes_offline_demo', 'false'))
    await page.route('**/api/v1/inventory/adjust', route => route.fulfill({
      status: 503,
      contentType: 'application/json',
      body: JSON.stringify({ message: 'chromium adjustment API unavailable' }),
    }))

    await page.getByRole('option', { name: /轴承钢圈/ }).click()
    const adjustButton = page.locator('.detail-panel').getByRole('button', { name: '盘点' })
    await adjustButton.click()

    const dialog = page.getByRole('dialog', { name: '盘点调整' })
    await expect(dialog).toBeVisible()
    await expect(dialog.getByText('轴承钢圈 (MAT-A01)')).toBeVisible()
    await dialog.getByRole('button', { name: '确认' }).click()

    await expect(dialog).toBeVisible()
    const alert = dialog.locator('[role="alert"]')
    await expect(alert).toBeVisible()
    await expect(alert).toContainText('Request failed with status code 503')
    await expect(dialog.getByText('轴承钢圈 (MAT-A01)')).toBeVisible()
  })

  test('按工单展示 BOM、可用量、在途量、缺口和处置建议', async ({ page }) => {
    const panel = page.locator('.kitting-panel')
    await expect(panel).toBeVisible()
    await expect(panel.getByText('工单齐套闭环')).toBeVisible()
    const rushCard = panel.locator('.order-card').filter({ hasText: 'WO-RUSH-9001 / 急单阀体组件' })
    await expect(rushCard).toBeVisible()
    await expect(rushCard.getByText('BOM-A100 V1.0')).toBeVisible()
    await expect(rushCard.getByRole('cell', { name: 'M-AL-6061', exact: true })).toBeVisible()
    await expect(rushCard.getByText('64件')).toBeVisible()
    await expect(rushCard.getByText('45件')).toBeVisible()
    await expect(rushCard.getByText('20件')).toBeVisible()
    await expect(rushCard.getByText('19件')).toBeVisible()
    await expect(rushCard.getByText(/调拨：从 A-03 库调 8 件/)).toBeVisible()
    await expect(rushCard.getByText(/替代料：M-AL-6061B 工程确认/)).toBeVisible()
    await expect(rushCard.getByText(/采购加急：今日 18:00 前补 20 件/)).toBeVisible()
    await expect(rushCard.getByText(/调整排产顺序：先做不缺料工序/)).toBeVisible()
  })

  test('按排产时间窗预测缺料并回写 AI 排产事件队列', async ({ page }) => {
    const panel = page.locator('.kitting-panel')
    const timeWindow = panel.locator('.time-window')
    await expect(timeWindow.getByText('今天缺')).toBeVisible()
    await expect(timeWindow.getByText('3 天后缺')).toBeVisible()
    await expect(timeWindow.getByText('7 天内')).toBeVisible()

    await panel.locator('.order-card').filter({ hasText: 'WO-RUSH-9001' }).getByRole('button', { name: '生成缺料排产事件' }).click()
    await expect(panel.getByText('缺料事件已同步 AI 排产')).toBeVisible()
    await expect(panel.getByText(/M-AL-6061 缺 19件/)).toBeVisible()

    await page.goto('scheduling', { waitUntil: 'commit' })
    await page.waitForSelector('.event-queue-panel', { timeout: 60000 })
    const eventPanel = page.locator('.event-queue-panel')
    const eventCard = eventPanel.locator('.event-card').filter({ hasText: 'M-AL-6061 工单齐套缺口' })
    await expect(eventCard.getByText('缺料事件')).toBeVisible()
    await expect(eventCard.locator('.event-meta').getByText('WO-RUSH-9001', { exact: true })).toBeVisible()
    await expect(eventCard.getByText(/缺口 19/)).toBeVisible()
    await eventCard.getByRole('button', { name: '生成重排建议' }).click()
    await expect(eventPanel.getByText('缺料约束重排建议')).toBeVisible()
    await expect(eventPanel.getByText(/引用 BOM 替代料规则触发采购加急或替代料评估/)).toBeVisible()

    await page.goto('report', { waitUntil: 'commit' })
    await page.waitForSelector('.report-board', { timeout: 60000 })
    const evidenceChain = page.locator('.otd-evidence-chain')
    const kittingEvidence = evidenceChain.locator('.evidence-chain-card').filter({ hasText: 'M-AL-6061 工单齐套缺口已进入排产复核' })
    await expect(kittingEvidence.locator('.evidence-topline span').getByText('库存齐套', { exact: true })).toBeVisible()
    await expect(kittingEvidence.locator('code').getByText('TRACE-KIT-WO-RUSH-9001-M-AL-6061', { exact: true })).toBeVisible()

    await page.goto('audit-logs', { waitUntil: 'commit' })
    await page.waitForSelector('.audit-board', { timeout: 60000 })
    const auditPanel = page.locator('.audit-replay-panel')
    await expect(auditPanel.locator('.metric-chip').filter({ hasText: '库存齐套回放' }).getByText('1')).toBeVisible()
    const auditCard = auditPanel.locator('.decision-card').filter({ hasText: '库存齐套：M-AL-6061 工单齐套缺口已进入排产复核' })
    await expect(auditCard).toBeVisible()
    await expect(auditCard.locator('.decision-topline').getByText('库存齐套证据')).toBeVisible()
    await expect(auditCard.locator('.decision-meta').getByText('对象：WO-RUSH-9001')).toBeVisible()
    await expect(auditCard.locator('.decision-meta').getByText('证据：TRACE-KIT-WO-RUSH-9001-M-AL-6061')).toBeVisible()
    await auditCard.getByRole('button', { name: '回放决策链' }).click()
    const detail = auditPanel.locator('.replay-detail')
    await expect(detail.getByText(/库存齐套读取 库存齐套 \/ BOM-A100 V1.0 的 BOM 版本、库存可用量、在途量和排产时间窗/)).toBeVisible()
    await expect(detail.getByText(/当前状态为 待齐套/)).toBeVisible()
    await expect(detail.getByText(/调拨、替代料、采购加急和排产顺序调整是否闭环/)).toBeVisible()
  })
})
