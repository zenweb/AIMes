import { test, expect } from '@playwright/test'

test.describe('Monitoring 现场态势图', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('aimes_token', 'mock-e2e-token')
      localStorage.setItem('aimes_user', JSON.stringify({ username: 'admin', displayName: '管理员', role: 'Admin', mustChangePassword: false }))
    })
    await page.goto('monitoring', { waitUntil: 'domcontentloaded' })
    await expect(page.locator('.shopfloor-situation')).toBeVisible()
  })

  test('展示现场事件流、排产影响和 Agent 响应入口', async ({ page }) => {
    const panel = page.locator('.shopfloor-situation')
    await expect(panel.getByText('现场态势图')).toBeVisible()
    await expect(panel.getByText('事件流驱动排产响应')).toBeVisible()
    await expect(panel.getByText('瓶颈负载超过 90%')).toBeVisible()
    await expect(panel.getByText('M-AL-6061B')).toBeVisible()
    await expect(panel.getByText('热处理返工占用窗口')).toBeVisible()
    await expect(panel.getByText('锁定 CNC-001 当前任务')).toBeVisible()

    await panel.getByRole('link', { name: '查看重排建议' }).click()
    await expect(page).toHaveURL(/\/scheduling\/scheduling$/)
  })

  test('现场态势事件写入 OTD 证据链并进入审计回放', async ({ page }) => {
    const panel = page.locator('.shopfloor-situation')
    await panel.getByRole('button', { name: '同步态势证据' }).click()
    await expect(panel.getByText('现场态势证据已同步 OTD 复盘')).toBeVisible()
    await expect(panel.getByText('3 条现场事件已写入统一证据链')).toBeVisible()

    await page.goto('audit-logs', { waitUntil: 'commit' })
    await page.waitForSelector('.audit-board', { timeout: 20000 })
    const auditPanel = page.locator('.audit-replay-panel')
    await expect(auditPanel.getByText('现场态势回放')).toBeVisible()
    const eventCard = auditPanel.locator('.decision-card').filter({ hasText: '现场态势：瓶颈负载超过 90%' })
    await expect(eventCard).toBeVisible()
    await expect(eventCard.locator('.decision-topline').getByText('现场态势证据')).toBeVisible()
    await expect(eventCard.getByText('TRACE-SF-SF-CNC-LOAD')).toBeVisible()
    await eventCard.getByRole('button', { name: '回放决策链' }).click()

    const detail = auditPanel.locator('.replay-detail')
    await expect(detail.getByText('TRACE-SF-SF-CNC-LOAD', { exact: true })).toBeVisible()
    await expect(detail.getByText(/实时监控 \/ CNC-001/)).toBeVisible()
    await expect(detail.locator('li').filter({ hasText: '现场态势 阶段生成现场态势证据：瓶颈负载超过 90%' })).toBeVisible()
    await expect(detail.getByText(/核对事件是否已生成排产动作、责任人响应和处置包升级路径/)).toBeVisible()
  })

  test('现场态势可升级为跨模块处置包并联动风险、排产和审计', async ({ page }) => {
    const panel = page.locator('.shopfloor-situation')
    await panel.getByRole('button', { name: '升级为跨模块处置包' }).click()
    await expect(panel.getByText('现场态势已升级为跨模块处置包')).toBeVisible()
    const escalationCard = panel.getByLabel('现场态势升级处置包')
    await expect(escalationCard.getByText('CNC-001 现场态势升级处置包')).toBeVisible()
    await expect(escalationCard.getByText('AUD-SF-ESC-SF-CNC-LOAD-20260521 / TRACE-SF-ESC-SF-CNC-LOAD')).toBeVisible()

    await page.goto('risk', { waitUntil: 'commit' })
    await page.waitForSelector('.risk-board', { timeout: 20000 })
    const riskPanel = page.locator('.risk-action-panel')
    const riskCard = riskPanel.locator('.action-card').filter({ hasText: 'CNC-001 现场态势升级处置包' })
    await expect(riskCard.locator('.card-topline').getByText('现场态势', { exact: true })).toBeVisible()
    await expect(riskCard.getByText('负责人：生产经理审批')).toBeVisible()
    await expect(riskCard.getByText(/TRACE-SF-ESC-SF-CNC-LOAD/)).toBeVisible()
    await expect(riskPanel.locator('.queue-trace').getByText(/实时监控升级为跨模块处置包/)).toBeVisible()

    await page.goto('scheduling', { waitUntil: 'commit' })
    await page.waitForSelector('.agent-workbench-panel', { timeout: 45000 })
    const eventPanel = page.locator('.event-queue-panel')
    const scheduleEvent = eventPanel.locator('.event-card').filter({ hasText: 'CNC-001 现场态势升级处置包' })
    await expect(scheduleEvent.getByText('现场处置包')).toBeVisible()
    await expect(scheduleEvent.getByText('AUD-SF-ESC-SF-CNC-LOAD-20260521')).toBeVisible()
    await scheduleEvent.getByRole('button', { name: '生成重排建议' }).click()
    await expect(eventPanel.getByText('CNC-001 现场态势升级处置包排产建议')).toBeVisible()
    await expect(eventPanel.getByText(/锁定期后第一个 CNC 空窗/)).toBeVisible()

    await page.goto('audit-logs', { waitUntil: 'commit' })
    await page.waitForSelector('.audit-board', { timeout: 20000 })
    const auditPanel = page.locator('.audit-replay-panel')
    await expect(auditPanel.getByText('现场处置回放')).toBeVisible()
    const auditCard = auditPanel.locator('.decision-card').filter({ hasText: '现场处置包：CNC-001 现场态势升级处置包' })
    await expect(auditCard).toBeVisible()
    await expect(auditCard.locator('.decision-topline').getByText('现场处置证据')).toBeVisible()
    await expect(auditCard.getByText('TRACE-SF-ESC-SF-CNC-LOAD')).toBeVisible()
    await auditCard.getByRole('button', { name: '回放决策链' }).click()
    await expect(auditPanel.locator('.replay-detail').getByText('TRACE-SF-ESC-SF-CNC-LOAD', { exact: true })).toBeVisible()
    await expect(auditPanel.locator('.replay-detail').getByText(/核对 CNC 分流、急单窗口、物料\/质量复核和关闭留痕是否闭环/)).toBeVisible()
  })

  test('现场态势处置包关闭后反写排产复核和审计闭环状态', async ({ page }) => {
    const panel = page.locator('.shopfloor-situation')
    await panel.getByRole('button', { name: '升级为跨模块处置包' }).click()
    await expect(panel.getByText('现场态势已升级为跨模块处置包')).toBeVisible()

    await page.goto('risk', { waitUntil: 'commit' })
    await page.waitForSelector('.risk-board', { timeout: 20000 })
    const riskPanel = page.locator('.risk-action-panel')
    const riskCard = riskPanel.locator('.action-card').filter({ hasText: 'CNC-001 现场态势升级处置包' })
    await riskCard.getByRole('button', { name: '关闭' }).click()
    await expect(riskCard.locator('.card-topline').getByText('已关闭', { exact: true })).toBeVisible()
    await expect(riskCard.getByText(/已反写现场处置包/)).toBeVisible()
    await expect(riskPanel.locator('.queue-trace').getByText(/状态更新为已闭环/)).toBeVisible()

    await page.goto('scheduling', { waitUntil: 'commit' })
    await page.waitForSelector('.agent-workbench-panel', { timeout: 45000 })
    const eventPanel = page.locator('.event-queue-panel')
    const scheduleEvent = eventPanel.locator('.event-card').filter({ hasText: 'CNC-001 现场态势升级处置包' })
    await expect(scheduleEvent.getByText('已缓解')).toBeVisible()
    await expect(scheduleEvent.getByText('风险关闭后复核')).toBeVisible()
    await scheduleEvent.getByRole('button', { name: '复核排产影响' }).click()
    await expect(eventPanel.getByText('CNC-001 现场态势升级处置包闭环复核建议')).toBeVisible()
    await expect(eventPanel.getByText(/已由风险队列关闭/)).toBeVisible()

    await page.goto('audit-logs', { waitUntil: 'commit' })
    await page.waitForSelector('.audit-board', { timeout: 20000 })
    const auditPanel = page.locator('.audit-replay-panel')
    const auditCard = auditPanel.locator('.decision-card').filter({ hasText: '现场处置包：CNC-001 现场态势升级处置包' })
    await expect(auditCard.getByText('已闭环')).toBeVisible()
    await auditCard.getByRole('button', { name: '回放决策链' }).click()
    const detail = auditPanel.locator('.replay-detail')
    await expect(detail.locator('li').filter({ hasText: '关闭留痕：CNC-001 现场态势升级处置包 已关闭' })).toBeVisible()
    await expect(detail.locator('li').filter({ hasText: '当前状态为 已闭环' })).toBeVisible()
  })

  test('初始化治理证据加载失败时真实浏览器展示 fail-loud 且保留现场态势入口', async ({ page }) => {
    await page.evaluate(() => {
      localStorage.setItem('aimes_offline_demo', 'false')
    })
    await page.route('**/api/v1/scheduling/poc-hypercare-acceptance/latest', route => route.fulfill({
      status: 503,
      contentType: 'application/json',
      body: JSON.stringify({ message: 'chromium monitoring hypercare backend unavailable' }),
    }))
    await page.route(/\/api\/v1\/scheduling\/monitoring-situation-escalations(?:\?|$)/, route => route.fulfill({
      status: 503,
      contentType: 'application/json',
      body: JSON.stringify({ message: 'chromium monitoring escalation backend unavailable' }),
    }))

    await page.goto('monitoring', { waitUntil: 'domcontentloaded' })
    const panel = page.locator('.shopfloor-situation')
    await expect(panel).toBeVisible()

    await expect(panel.getByText('现场态势初始化读取失败')).toBeVisible()
    await expect(panel.getByText(/Hypercare 与现场处置包记录暂未加载/)).toBeVisible()
    await expect(panel.getByText('chromium monitoring hypercare backend unavailable')).toBeVisible()
    await expect(panel.getByText('同步态势证据')).toBeVisible()
    await expect(panel.getByText('升级为跨模块处置包')).toBeVisible()
  })

  test('SignalR 启动失败时真实浏览器展示失败原因并回落演示设备数据', async ({ page }) => {
    await page.evaluate(() => {
      localStorage.setItem('aimes_offline_demo', 'false')
    })
    await page.route('**/api/v1/scheduling/poc-hypercare-acceptance/latest', route => route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: 'null',
    }))
    await page.route(/\/api\/v1\/scheduling\/monitoring-situation-escalations(?:\?|$)/, route => route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: '[]',
    }))
    await page.route(/\/hubs\/monitoring\/negotiate(?:\?|$)/, route => route.fulfill({
      status: 503,
      contentType: 'text/plain',
      body: 'chromium signalr gateway unavailable',
    }))

    await page.goto('monitoring', { waitUntil: 'domcontentloaded' })

    await expect(page.locator('.live-badge')).toContainText('已断开')
    await expect(page.getByText('实时连接失败，使用演示数据')).toBeVisible()
    await expect(page.getByText(/503|Service Unavailable|signalr gateway unavailable/)).toBeVisible()
    await expect(page.getByText('CNC-001 加工中心')).toBeVisible()
  })
})
