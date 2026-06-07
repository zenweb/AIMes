import { test, expect, type Page } from '@playwright/test'

test.describe('AI 生产助手 (ChatPanel)', () => {
  test.describe.configure({ timeout: 60000 })

  async function closeRushKittingRisk(page: Page) {
    await page.goto('inventory', { waitUntil: 'commit' })
    await page.waitForSelector('.inv-board', { timeout: 30000 })
    await page.locator('.kitting-panel').locator('.order-card').filter({ hasText: 'WO-RUSH-9001' }).getByRole('button', { name: '生成缺料排产事件' }).click()
    await expect(page.locator('.kitting-panel').getByText('缺料事件已同步 AI 排产')).toBeVisible()

    await page.goto('purchase', { waitUntil: 'commit' })
    await page.waitForSelector('.po-board', { timeout: 30000 })
    const purchasePanel = page.locator('.shortage-action-panel')
    await purchasePanel.getByRole('button', { name: '生成采购加急单' }).click()
    await expect(purchasePanel.getByText('已加急')).toBeVisible()
    await purchasePanel.getByRole('button', { name: '模拟加急收货' }).click()
    await expect(purchasePanel.getByText('风险下降')).toBeVisible()

    await page.goto('dashboard', { waitUntil: 'commit' })
    await page.waitForSelector('.chat-fab', { timeout: 30000 })
  }

  async function expectReplayDetailTrace(page: Page, traceId: string) {
    const replayDetail = page.locator('.audit-replay-panel .replay-detail')
    await expect(replayDetail.locator('.detail-title span').getByText(traceId, { exact: true })).toBeVisible({ timeout: 15000 })
    await expect(replayDetail.locator('li').first()).toBeVisible()
    return replayDetail
  }

  function replayCardByTitle(page: Page, title: string) {
    return page.locator('.audit-replay-panel .decision-card').filter({
      has: page.getByRole('heading', { name: title, exact: true }),
    })
  }

  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('aimes_token', 'mock-e2e-token')
      localStorage.setItem('aimes_user', JSON.stringify({ username: 'admin', displayName: '管理员', role: 'Admin', mustChangePassword: false }))
    })
    await page.goto('dashboard', { waitUntil: 'commit' })
    await page.waitForSelector('.chat-fab', { timeout: 30000 })
  })

  test('浮动按钮可见', async ({ page }) => {
    const fab = page.locator('.chat-fab')
    await expect(fab).toBeVisible()
    await expect(fab).toHaveAttribute('aria-label', '打开AI助手')
  })

  test('打开聊天面板', async ({ page }) => {
    await page.locator('.chat-fab').click()
    await expect(page.locator('.chat-panel')).toBeVisible()
    await expect(page.locator('.chat-header h3')).toHaveText('AI 生产助手')
    await expect(page.locator('.chat-input')).toBeVisible()
  })

  test('发送消息并获得回复', async ({ page }) => {
    let releaseQuery: () => void = () => {}
    let queryRequested = false
    await page.route('**/api/v1/knowledge/query', async route => {
      queryRequested = true
      await new Promise<void>(resolve => {
        releaseQuery = resolve
      })
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          answer: '当前产能稳定，CNC 产线负荷 82%。',
          sources: [],
        }),
      })
    })
    await page.evaluate(() => localStorage.setItem('aimes_offline_demo', 'false'))
    await page.locator('.chat-fab').click()

    const input = page.locator('.chat-input')
    await input.fill('当前产能如何？')

    await page.locator('.send-btn').click()

    // 用户消息出现
    await expect(page.locator('.message.user')).toHaveCount(1, { timeout: 5000 })
    await expect.poll(() => queryRequested).toBe(true)
    const typing = page.locator('.message.assistant.typing')
    await expect(typing).toHaveAttribute('role', 'status')
    await expect(typing).toHaveAttribute('aria-live', 'polite')
    await expect(typing).toHaveAttribute('aria-label', 'AI 生产助手正在生成回复')

    releaseQuery()

    // 助手回复出现。
    await expect(page.locator('.message.assistant .msg-content').filter({ hasText: '当前产能稳定' })).toBeVisible({ timeout: 10000 })
  })

  test('知识问答服务失败时真实浏览器展示 fail-loud 离线回答', async ({ page }) => {
    let queryRequests = 0
    await page.route('**/api/v1/knowledge/query', async route => {
      queryRequests += 1
      await route.fulfill({
        status: 503,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'chromium RAG service unavailable' }),
      })
    })
    await page.evaluate(() => localStorage.setItem('aimes_offline_demo', 'false'))
    await page.locator('.chat-fab').click()

    await page.locator('.chat-input').fill('当前产能如何？')
    await page.locator('.send-btn').click()

    const alert = page.locator('.message.assistant[role="alert"]').filter({
      hasText: '知识问答服务暂不可用，已切换到离线演示回答。',
    })
    await expect(alert).toBeVisible({ timeout: 10000 })
    await expect(alert).toContainText('知识问答服务暂不可用，已切换到离线演示回答。')
    await expect(alert).toContainText('chromium RAG service unavailable')
    await expect(alert).toContainText('当前车间整体设备利用率')
    await expect(page.locator('.chat-input')).toBeEnabled()
    expect(queryRequests).toBeGreaterThan(0)
  })

  test('参考来源折叠展开', async ({ page }) => {
    await page.locator('.chat-fab').click()
    await page.locator('.chat-input').fill('设备状态')
    await page.locator('.send-btn').click()

    // 等待回复
    await expect(page.locator('.sources-toggle')).toBeVisible({ timeout: 10000 })
    await page.locator('.sources-toggle').click()
    await expect(page.locator('.source-item').first()).toBeVisible()
  })

  test('关闭面板', async ({ page }) => {
    await page.locator('.chat-fab').click()
    const chat = page.locator('.chat-panel')
    await expect(chat).toBeVisible()

    await chat.getByRole('button', { name: '关闭聊天' }).click()
    await expect(page.locator('.chat-panel')).not.toBeVisible()
  })

  test('空状态显示', async ({ page }) => {
    await page.locator('.chat-fab').click()
    await expect(page.locator('.empty-chat')).toBeVisible()
    await expect(page.getByText('有什么生产相关的问题？')).toBeVisible()
  })

  test('发送按钮在输入为空时禁用', async ({ page }) => {
    await page.locator('.chat-fab').click()
    await expect(page.locator('.send-btn')).toBeDisabled()
  })

  test('可执行动作：打开 AI 排产', async ({ page }) => {
    await page.locator('.chat-fab').click()
    await page.locator('.chat-input').fill('打开 AI 排产')
    await page.locator('.send-btn').click()

    await expect(page.getByRole('button', { name: '打开 AI 排产' })).toBeVisible()
    await page.getByRole('button', { name: '打开 AI 排产' }).click()

    await expect(page).toHaveURL(/\/scheduling\/scheduling/)
    await expect(page.locator('.schedule-board')).toBeVisible()
    await expect(page.locator('.chat-panel').getByText('动作已执行：已打开 AI 排产工作台。')).toBeVisible()
  })

  test('可执行动作：生成重排建议入口', async ({ page }) => {
    await page.locator('.chat-fab').click()
    await page.locator('.chat-input').fill('帮我生成重排建议')
    await page.locator('.send-btn').click()

    await expect(page.getByRole('button', { name: '生成重排建议' })).toBeVisible()
    await page.getByRole('button', { name: '生成重排建议' }).click()

    await expect(page.locator('.event-queue-panel')).toBeVisible()
    await expect(page.locator('.event-queue-panel').getByText('三类事件重排队列')).toBeVisible()
    await expect(page.locator('.chat-panel').getByText(/请在“三类事件重排队列”中复核 Agent 建议/)).toBeVisible()
  })

  test('可执行动作：导出 OTD 复盘报告', async ({ page }) => {
    await page.locator('.chat-fab').click()
    await page.locator('.chat-input').fill('导出 OTD 复盘报告')
    await page.locator('.send-btn').click()

    await expect(page.getByRole('button', { name: '导出 OTD 复盘' })).toBeVisible()
    const downloadPromise = page.waitForEvent('download')
    await page.getByRole('button', { name: '导出 OTD 复盘' }).click()
    const download = await downloadPromise

    expect(download.suggestedFilename()).toBe('AI-MES-OTD-POC-Report.csv')
    await expect(page).toHaveURL(/\/scheduling\/report/)
    await expect(page.locator('.otd-report-section')).toBeVisible()
    await expect(page.locator('.chat-panel').getByText(/已生成 OTD\/POC 复盘 CSV/)).toBeVisible()
  })

  test('可执行动作：创建异常处置卡并联动风险排产和审计', async ({ page }) => {
    test.setTimeout(180000)

    await page.locator('.chat-fab').click()
    await page.locator('.chat-input').fill('创建 CNC-001 主轴温升异常处置卡')
    await page.locator('.send-btn').click()

    await expect(page.getByRole('button', { name: '创建异常处置卡' })).toBeVisible()
    await page.getByRole('button', { name: '创建异常处置卡' }).click()

    await expect(page).toHaveURL(/\/scheduling\/anomaly/)
    await expect(page.locator('.event-center')).toBeVisible()
    const chat = page.locator('.chat-panel')
    await expect(chat.getByText('权限校验通过：Admin 可创建异常处置卡。')).toBeVisible()
    await expect(chat.getByText('审计编号：AUD-CHAT-ANOMALY-20260522-001')).toBeVisible()
    await expect(chat.getByText(/已创建 CNC-001 主轴温升异常处置卡/)).toBeVisible()
    await expect(chat.getByText(/已同步到异常管理、风险处置队列、AI 排产事件队列、OTD 复盘证据链和审计回放/)).toBeVisible()
    const anomalyPackage = chat.locator('.action-package-card').filter({ hasText: 'CNC-001 主轴温升异常处置卡' })
    await expect(anomalyPackage).toBeVisible()
    await expect(anomalyPackage.locator('code').getByText('TRACE-CHAT-ANOMALY-CNC001-TEMP-20260522', { exact: true }).first()).toBeVisible()

    const anomalyCard = page.locator('.anomaly-card').filter({ hasText: 'CNC-001 主轴温升异常处置卡' }).first()
    await expect(anomalyCard).toBeVisible()
    await expect(page.locator('.dispatch-trace').getByText('AI 助手创建的 CNC-001 主轴温升异常已分流到风险与排产复核')).toBeVisible()

    await page.goto('risk', { waitUntil: 'commit' })
    await page.waitForSelector('.risk-action-panel', { timeout: 20000 })
    const riskPanel = page.locator('.risk-action-panel')
    await expect(riskPanel.locator('.action-card').filter({ hasText: 'CNC-001 主轴温升异常处置卡' })).toBeVisible()
    await expect(riskPanel.locator('.action-card').filter({ hasText: 'AI 助手创建的 CNC-001 主轴温升异常已分流到风险与排产复核' })).toBeVisible()

    await page.goto('scheduling', { waitUntil: 'commit' })
    await expect(page.locator('.agent-workbench-panel')).toBeVisible({ timeout: 60000 })
    const eventPanel = page.locator('.event-queue-panel')
    await expect(eventPanel).toBeVisible({ timeout: 60000 })
    await expect(eventPanel.getByText('CNC-001 主轴温升异常处置卡已由 AI 助手创建')).toBeVisible()
    await expect(eventPanel.getByText('AI 助手创建的 CNC-001 主轴温升异常已分流到风险与排产复核')).toBeVisible()

    await page.goto('audit-logs', { waitUntil: 'commit' })
    await page.waitForSelector('.audit-board', { timeout: 20000 })
    const auditPanel = page.locator('.audit-replay-panel')
    const auditCard = auditPanel.locator('.decision-card').filter({ hasText: 'AI 助手创建异常处置卡' })
    await expect(auditCard).toBeVisible()
    await expect(auditCard.locator('.decision-meta').getByText('证据：AUD-CHAT-ANOMALY-20260522-001')).toBeVisible()
    await auditCard.getByRole('button', { name: '回放决策链' }).click()
    await expectReplayDetailTrace(page, 'TRACE-CHAT-ANOMALY-CNC001-TEMP-20260522')
  })

  test('可执行动作：生成交期恢复执行包并跨模块追溯', async ({ page }) => {
    await page.locator('.chat-fab').click()
    await page.locator('.chat-input').fill('帮我生成 WO-RUSH-9001 交期恢复执行包')
    await page.locator('.send-btn').click()

    await expect(page.getByRole('button', { name: '生成交期恢复执行包' })).toBeVisible()
    await page.getByRole('button', { name: '生成交期恢复执行包' }).click()

    const chat = page.locator('.chat-panel')
    await expect(page).toHaveURL(/\/scheduling\/scheduling/)
    await expect(chat.getByText('权限校验通过：Admin 可生成交期恢复执行包。')).toBeVisible()
    await expect(chat.getByText('审计编号：AUD-CHAT-RECOVERY-PACKAGE-20260521-001')).toBeVisible()
    await expect(chat.locator('.action-package-card').filter({ hasText: 'WO-RUSH-9001 交期恢复执行包' })).toBeVisible()
    await expect(chat.getByText('TRACE-CHAT-RECOVERY-WO-RUSH-9001-20260521')).toBeVisible()
    await chat.getByRole('button', { name: '关闭聊天' }).click()
    await expect(page.locator('.chat-panel')).not.toBeVisible()

    const handoff = page.locator('.recovery-handoff-panel')
    await expect(handoff.getByText('交期恢复执行包交接')).toBeVisible()
    await expect(handoff.getByText('待跨模块复核')).toBeVisible()
    await expect(handoff.getByText('AI 排产')).toBeVisible()
    await expect(handoff.getByText('风险预警')).toBeVisible()
    await expect(handoff.getByText('采购协同')).toBeVisible()
    await expect(handoff.getByText('质量闭环')).toBeVisible()
    await expect(handoff.getByText('TRACE-SCH-RECOVERY-WO-RUSH-9001')).toBeVisible()

    const recoveryEvent = page.locator('.event-card').filter({ hasText: 'WO-RUSH-9001 交期恢复执行包' })
    await expect(recoveryEvent).toBeVisible()
    await expect(recoveryEvent.getByText('助手执行包')).toBeVisible()
    await recoveryEvent.getByRole('button', { name: '生成重排建议' }).click()
    await expect(page.locator('.agent-suggestion').getByText('WO-RUSH-9001 交期恢复执行包排产建议')).toBeVisible()
    await expect(page.locator('.agent-suggestion').getByText(/TRACE-CHAT-RECOVERY-WO-RUSH-9001-20260521/)).toBeVisible()
    await expect(handoff.getByText('排产建议已生成')).toBeVisible()
    await expect(handoff.getByText('等待采纳 / 调整原因')).toBeVisible()
    await handoff.getByRole('button', { name: '确认执行交接闭环' }).click()
    await expect(handoff.getByText('执行交接已闭环')).toBeVisible()
    await expect(handoff.getByText('TRACE-CHAT-RECOVERY-WO-RUSH-9001-CLOSED-20260521')).toBeVisible()
    await expect(page.locator('.agent-suggestion').getByText('WO-RUSH-9001 交期恢复执行包闭环复核建议')).toBeVisible()

    await page.goto('purchase', { waitUntil: 'commit' })
    await page.waitForSelector('.po-board', { timeout: 20000 })
    const purchasePanel = page.locator('.shortage-action-panel')
    await purchasePanel.getByRole('button', { name: '生成采购加急单' }).click()
    await expect(page.locator('.detail-header').getByRole('heading', { name: 'PO-RUSH-20260519' })).toBeVisible()
    await purchasePanel.getByRole('button', { name: '模拟加急收货' }).click()
    await expect(purchasePanel.getByText('风险下降')).toBeVisible()
    await expect(purchasePanel.getByText(/采购 王工 已确认 PO-RUSH-20260519 加急收货/)).toBeVisible()

    await page.goto('scheduling', { waitUntil: 'commit' })
    await expect(page.locator('.recovery-handoff-panel').getByText(/采购责任动作：采购 王工 已确认 PO-RUSH-20260519 加急收货/)).toBeVisible()
    await page.locator('.event-card').filter({ hasText: 'WO-RUSH-9001 交期恢复执行包' }).getByRole('button', { name: '复核排产影响' }).click()
    await expect(page.locator('.agent-suggestion').getByText(/采购责任动作：采购 王工 已确认 PO-RUSH-20260519 加急收货/)).toBeVisible()

    await page.goto('quality', { waitUntil: 'commit' })
    await page.waitForSelector('.quality-board', { timeout: 20000 })
    const assistantQualityCard = page.locator('.assistant-quality-closure-card')
    await expect(assistantQualityCard.getByText('助手执行包质量责任')).toBeVisible()
    await expect(assistantQualityCard.getByText('WO-RUSH-9001 交期恢复执行包')).toBeVisible()
    await assistantQualityCard.getByRole('button', { name: '确认首件复核闭环' }).click()
    await expect(assistantQualityCard.getByText(/质量工程师 周工 已确认 FAI-WO-RUSH-9001-OP20-20260521 首件检验合格/)).toBeVisible()
    await expect(assistantQualityCard.getByText('TRACE-CHAT-RECOVERY-QUALITY-FIRST-ARTICLE-20260521')).toBeVisible()

    await page.goto('scheduling', { waitUntil: 'commit' })
    await expect(page.locator('.recovery-handoff-panel').getByText(/质量责任动作：质量工程师 周工 已确认 FAI-WO-RUSH-9001-OP20-20260521 首件检验合格/)).toBeVisible()
    await page.locator('.event-card').filter({ hasText: 'WO-RUSH-9001 交期恢复执行包' }).getByRole('button', { name: '复核排产影响' }).click()
    await expect(page.locator('.agent-suggestion').getByText(/质量责任动作：质量工程师 周工 已确认 FAI-WO-RUSH-9001-OP20-20260521 首件检验合格/)).toBeVisible()

    await page.goto('risk', { waitUntil: 'commit' })
    await page.waitForSelector('.risk-board', { timeout: 20000 })
    const riskCard = page.locator('.action-card').filter({ hasText: 'WO-RUSH-9001 交期恢复执行包' })
    await expect(riskCard).toBeVisible()
    await expect(riskCard.getByText('助手执行包')).toBeVisible()
    await expect(riskCard.locator('.card-topline').getByText('已关闭')).toBeVisible()
    await expect(riskCard.getByText(/采购责任动作：采购 王工 已确认 PO-RUSH-20260519 加急收货/)).toBeVisible()
    await expect(riskCard.getByText(/质量责任动作：质量工程师 周工 已确认 FAI-WO-RUSH-9001-OP20-20260521 首件检验合格/)).toBeVisible()
    await expect(page.locator('.queue-trace').getByText(/确认执行交接闭环/)).toBeVisible()

    await page.goto('report', { waitUntil: 'commit' })
    await page.waitForSelector('.report-board', { timeout: 20000 })
    await expect(page.locator('.otd-evidence-chain').getByText('助手执行包')).toBeVisible()
    await expect(page.locator('.otd-evidence-chain').getByText('助手质量回写')).toBeVisible()
    await expect(page.locator('.otd-evidence-chain').getByText('TRACE-CHAT-RECOVERY-QUALITY-FIRST-ARTICLE-20260521')).toBeVisible()
    await expect(page.getByText('AI 助手是否把问答转成了可执行闭环？')).toBeVisible()
    await expect(page.getByText('TRACE-CHAT-RECOVERY-WO-RUSH-9001-CLOSED-20260521')).toBeVisible()
    await expect(page.getByText('执行交接已闭环')).toBeVisible()

    await page.goto('audit-logs', { waitUntil: 'commit' })
    await page.waitForSelector('.audit-board', { timeout: 20000 })
    const auditPanel = page.locator('.audit-replay-panel')
    const auditCard = replayCardByTitle(page, 'AI 助手生成交期恢复执行包')
    await expect(auditCard).toBeVisible()
    await expect(auditCard.locator('.decision-meta').getByText('证据：AUD-CHAT-RECOVERY-PACKAGE-20260521-001')).toBeVisible()
    await auditCard.scrollIntoViewIfNeeded()
    await auditCard.getByRole('button', { name: '回放决策链' }).click({ force: true })
    await expectReplayDetailTrace(page, 'TRACE-CHAT-RECOVERY-WO-RUSH-9001-20260521')
    const closedEvidenceCard = replayCardByTitle(page, '助手执行包：WO-RUSH-9001 交期恢复执行包')
    await expect(closedEvidenceCard).toBeVisible()
    await closedEvidenceCard.scrollIntoViewIfNeeded()
    await closedEvidenceCard.getByRole('button', { name: '回放决策链' }).click({ force: true })
    const replayDetail = auditPanel.locator('.replay-detail')
    await expect(replayDetail.getByText('TRACE-CHAT-RECOVERY-WO-RUSH-9001-CLOSED-20260521', { exact: true })).toBeVisible()
    await expect(auditPanel.getByText(/当前状态为 执行交接已闭环/)).toBeVisible()
    const qualityEvidenceCard = replayCardByTitle(page, '助手质量回写：WO-RUSH-9001 交期恢复执行包质量动作已闭合')
    await expect(qualityEvidenceCard).toBeVisible()
    await qualityEvidenceCard.scrollIntoViewIfNeeded()
    await qualityEvidenceCard.getByRole('button', { name: '回放决策链' }).click({ force: true })
    await expect(replayDetail.getByText('TRACE-CHAT-RECOVERY-QUALITY-FIRST-ARTICLE-20260521', { exact: true })).toBeVisible()
    await expect(auditPanel.getByText(/助手执行包质量回写/)).toBeVisible()
  })

  test('可执行动作：生成工程约束复核包并同步排产证据与审计', async ({ page }) => {
    await page.locator('.chat-fab').click()
    await page.locator('.chat-input').fill('帮我生成工程约束复核包')
    await page.locator('.send-btn').click()

    await expect(page.getByRole('button', { name: '生成工程约束复核包' })).toBeVisible()
    await page.getByRole('button', { name: '生成工程约束复核包' }).click()

    const chat = page.locator('.chat-panel')
    await expect(page).toHaveURL(/\/scheduling\/scheduling/)
    await expect(chat.getByText('权限校验通过：Admin 可生成工程约束复核包。')).toBeVisible()
    await expect(chat.getByText('审计编号：AUD-CHAT-ENG-CONSTRAINT-20260523-001')).toBeVisible()
    await expect(chat.getByText('追踪编号：TRACE-CHAT-ENG-CONSTRAINT-PACKAGE-20260523')).toBeVisible()
    await expect(chat.getByText(/已同步到 BOM 管理、工艺路线、AI 排产、OTD 复盘证据链和审计回放/)).toBeVisible()
    const packageCard = chat.locator('.action-package-card').filter({ hasText: 'BOM-A100 / R-B200 工程约束复核包' })
    await expect(packageCard).toBeVisible()
    await expect(packageCard.getByText('待工程约束复核')).toBeVisible()
    await expect(packageCard.getByText('WO-RUSH-9001 / WO-DEMO-1002 / WO-DEMO-1007')).toBeVisible()

    const eventPanel = page.locator('.event-queue-panel')
    await expect(eventPanel).toBeVisible({ timeout: 60000 })
    const engineeringEvent = eventPanel.locator('.event-card').filter({ hasText: 'BOM-A100 / R-B200 工程约束复核包' })
    await expect(engineeringEvent).toBeVisible()
    await expect(engineeringEvent.getByText('助手工程约束')).toBeVisible()
    await expect(engineeringEvent.getByText('TRACE-CHAT-ENG-CONSTRAINT-PACKAGE-20260523')).toBeVisible()

    await page.goto('report', { waitUntil: 'commit' })
    await page.waitForSelector('.report-board', { timeout: 20000 })
    const reportBoard = page.locator('.otd-evidence-chain')
    await expect(reportBoard.getByText('助手工程约束')).toBeVisible()
    await expect(reportBoard.getByText('BOM-A100 / ECN-BOM-A100-6061B-20260521 / R-B200 OP-090')).toBeVisible()
    await expect(reportBoard.getByText('TRACE-CHAT-ENG-CONSTRAINT-PACKAGE-20260523')).toBeVisible()

    await page.goto('audit-logs', { waitUntil: 'commit' })
    await page.waitForSelector('.audit-board', { timeout: 20000 })
    const auditPanel = page.locator('.audit-replay-panel')
    const auditCard = auditPanel.locator('.decision-card').filter({ hasText: 'AI 助手生成工程约束复核包' })
    await expect(auditCard).toBeVisible()
    await expect(auditCard.locator('.decision-meta').getByText('证据：AUD-CHAT-ENG-CONSTRAINT-20260523-001')).toBeVisible()
    await auditCard.getByRole('button', { name: '回放决策链' }).click()
    await expectReplayDetailTrace(page, 'TRACE-CHAT-ENG-CONSTRAINT-PACKAGE-20260523')
  })

  test('可执行动作：生成客户交付恢复承诺包并同步排产报表和审计', async ({ page }) => {
    await page.locator('.chat-fab').click()
    await page.locator('.chat-input').fill('帮我生成客户交付恢复承诺包')
    await page.locator('.send-btn').click()

    await expect(page.getByRole('button', { name: '生成客户交付恢复承诺包' })).toBeVisible()
    await page.getByRole('button', { name: '生成客户交付恢复承诺包' }).click()

    const chat = page.locator('.chat-panel')
    await expect(page).toHaveURL(/\/scheduling\/report/)
    await expect(chat.getByText('权限校验通过：Admin 可生成客户交付恢复承诺包。')).toBeVisible()
    await expect(chat.getByText('审计编号：AUD-KPI-COMMITMENT-HUADONG-20260521-001')).toBeVisible()
    await expect(chat.getByText('追踪编号：TRACE-KPI-COMMITMENT-HUADONG-20260521')).toBeVisible()
    await expect(chat.getByText(/已同步到报表中心、AI 排产、OTD 复盘证据链、CSV 导出和审计回放/)).toBeVisible()
    const packageCard = chat.locator('.action-package-card').filter({ hasText: '华东新能源 交付恢复承诺包' })
    await expect(packageCard).toBeVisible()
    await expect(packageCard.getByText('+18% / 延期减少 3 单')).toBeVisible()

    await page.waitForSelector('.report-board', { timeout: 20000 })
    const reportBoard = page.locator('.otd-evidence-chain')
    await expect(reportBoard.getByText('客户承诺包')).toBeVisible()
    await expect(reportBoard.getByText('TRACE-KPI-COMMITMENT-HUADONG-20260521')).toBeVisible()

    await page.goto('scheduling', { waitUntil: 'commit' })
    await expect(page.locator('.event-queue-panel')).toBeVisible({ timeout: 60000 })
    const commitmentEvent = page.locator('.event-card').filter({ hasText: '华东新能源 交付恢复承诺包' })
    await expect(commitmentEvent).toBeVisible()
    await expect(commitmentEvent.getByText('客户承诺包')).toBeVisible()
    await commitmentEvent.getByRole('button', { name: '生成重排建议' }).click()
    await expect(page.locator('.agent-suggestion').getByText('客户交付恢复承诺后的排产复核')).toBeVisible()
    await expect(page.locator('.agent-suggestion').getByText(/TRACE-KPI-COMMITMENT-HUADONG-20260521/)).toBeVisible()

    await page.goto('audit-logs', { waitUntil: 'commit' })
    await page.waitForSelector('.audit-board', { timeout: 20000 })
    const auditPanel = page.locator('.audit-replay-panel')
    const auditCard = auditPanel.locator('.decision-card').filter({ hasText: 'AI 助手生成客户交付恢复承诺包' })
    await expect(auditCard).toBeVisible()
    await expect(auditCard.locator('.decision-meta').getByText('证据：AUD-KPI-COMMITMENT-HUADONG-20260521-001')).toBeVisible()
    await auditCard.getByRole('button', { name: '回放决策链' }).click()
    await expectReplayDetailTrace(page, 'TRACE-KPI-COMMITMENT-HUADONG-20260521')
  })

  test('可执行动作：生成 BOM 展开齐套检查包并同步库存排产和审计', async ({ page }) => {
    await page.locator('.chat-fab').click()
    await page.locator('.chat-input').fill('帮我生成 BOM 展开齐套检查包')
    await page.locator('.send-btn').click()

    await expect(page.getByRole('button', { name: '生成 BOM 展开齐套检查包' })).toBeVisible()
    await page.getByRole('button', { name: '生成 BOM 展开齐套检查包' }).click()

    const chat = page.locator('.chat-panel')
    await expect(page).toHaveURL(/\/scheduling\/bom/)
    await expect(chat.getByText('权限校验通过：Admin 可生成 BOM 展开齐套检查包。')).toBeVisible()
    await expect(chat.getByText('审计编号：AUD-BOM-KIT-BOM-A100-WO-RUSH-9001-20260522')).toBeVisible()
    await expect(chat.getByText('追踪编号：TRACE-BOM-KIT-BOM-A100-WO-RUSH-9001')).toBeVisible()
    await expect(chat.getByText(/已同步到 BOM 管理、库存齐套、AI 排产、OTD 复盘证据链、系统治理和审计回放/)).toBeVisible()
    const packageCard = chat.locator('.action-package-card').filter({ hasText: 'BOM-A100 WO-RUSH-9001 展开齐套检查包' })
    await expect(packageCard).toBeVisible()
    await expect(packageCard.getByText('缺口 19 件 / 待齐套')).toBeVisible()

    await page.goto('inventory', { waitUntil: 'commit' })
    await page.waitForSelector('.inv-board', { timeout: 20000 })
    await expect(page.locator('.bom-kitting-package-panel').getByText('BOM-A100 展开齐套包')).toBeVisible()
    await expect(page.locator('.bom-kitting-package-panel').getByText('TRACE-BOM-KIT-BOM-A100-WO-RUSH-9001')).toBeVisible()

    await page.goto('scheduling', { waitUntil: 'commit' })
    await expect(page.locator('.event-queue-panel')).toBeVisible({ timeout: 60000 })
    const kittingEvent = page.locator('.event-card').filter({ hasText: 'M-AL-6061 工单齐套缺口' })
    await expect(kittingEvent).toBeVisible()
    await expect(kittingEvent.getByText('缺料事件')).toBeVisible()
    await expect(kittingEvent.getByText('TRACE-BOM-KIT-BOM-A100-WO-RUSH-9001')).toBeVisible()

    await page.goto('audit-logs', { waitUntil: 'commit' })
    await page.waitForSelector('.audit-board', { timeout: 20000 })
    const auditPanel = page.locator('.audit-replay-panel')
    const auditCard = auditPanel.locator('.decision-card').filter({ hasText: 'AI 助手生成 BOM 展开齐套检查包' })
    await expect(auditCard).toBeVisible()
    await expect(auditCard.locator('.decision-meta').getByText('证据：AUD-BOM-KIT-BOM-A100-WO-RUSH-9001-20260522')).toBeVisible()
    await auditCard.getByRole('button', { name: '回放决策链' }).click()
    await expectReplayDetailTrace(page, 'TRACE-BOM-KIT-BOM-A100-WO-RUSH-9001')
  })

  test('可执行动作：生成设备停机复核包并同步设备排产和审计', async ({ page }) => {
    await page.locator('.chat-fab').click()
    await page.locator('.chat-input').fill('帮我生成 CNC-001 设备停机复核包')
    await page.locator('.send-btn').click()

    await expect(page.getByRole('button', { name: '生成设备停机复核包' })).toBeVisible()
    await page.getByRole('button', { name: '生成设备停机复核包' }).click()

    const chat = page.locator('.chat-panel')
    await expect(page).toHaveURL(/\/scheduling\/equipment/)
    await expect(chat.getByText('权限校验通过：Admin 可生成设备停机复核包。')).toBeVisible()
    await expect(chat.getByText('审计编号：AUD-CHAT-EQ-DOWNTIME-CNC001-20260523-001')).toBeVisible()
    await expect(chat.getByText('追踪编号：TRACE-EQ-DOWNTIME-CNC-001')).toBeVisible()
    await expect(chat.getByText(/已同步到设备维护、AI 排产事件队列、风险预警、OTD 复盘证据链和审计回放/)).toBeVisible()
    const packageCard = chat.locator('.action-package-card').filter({ hasText: 'CNC-001 设备停机复核包' })
    await expect(packageCard).toBeVisible()
    await expect(packageCard.getByText('停机 4h / +1 单延期风险')).toBeVisible()
    await expect(packageCard.getByText('影响工单：WO-2026-0042 / WO-RUSH-9001 / WO-DEMO-1001')).toBeVisible()

    await page.goto('scheduling', { waitUntil: 'commit' })
    await expect(page.locator('.event-queue-panel')).toBeVisible({ timeout: 60000 })
    const downtimeEvent = page.locator('.event-card').filter({ hasText: 'CNC-001 停机影响' })
    await expect(downtimeEvent).toBeVisible()
    await expect(downtimeEvent.getByText('设备故障事件')).toBeVisible()
    await expect(downtimeEvent.getByText('WO-2026-0042 / WO-RUSH-9001 / WO-DEMO-1001')).toBeVisible()

    await page.goto('report', { waitUntil: 'commit' })
    await page.waitForSelector('.report-board', { timeout: 20000 })
    const reportBoard = page.locator('.otd-evidence-chain')
    await expect(reportBoard.getByText('设备维护')).toBeVisible()
    await expect(reportBoard.getByText('TRACE-EQ-DOWNTIME-CNC-001')).toBeVisible()

    await page.goto('audit-logs', { waitUntil: 'commit' })
    await page.waitForSelector('.audit-board', { timeout: 20000 })
    const auditPanel = page.locator('.audit-replay-panel')
    const auditCard = auditPanel.locator('.decision-card').filter({ hasText: 'AI 助手生成设备停机复核包' })
    await expect(auditCard).toBeVisible()
    await expect(auditCard.locator('.decision-meta').getByText('证据：AUD-CHAT-EQ-DOWNTIME-CNC001-20260523-001')).toBeVisible()
    await auditCard.getByRole('button', { name: '回放决策链' }).click()
    await expectReplayDetailTrace(page, 'TRACE-EQ-DOWNTIME-CNC-001')
  })

  test('可执行动作：设备停机复核包 OTD 证据写入失败时真实浏览器保留 fail-loud 告警', async ({ page }) => {
    await page.addInitScript(() => {
      const originalSetItem = Storage.prototype.setItem
      Storage.prototype.setItem = function (key: string, value: string) {
        if (key === 'aimes_otd_evidence_chain') {
          throw new Error('chromium equipment downtime evidence storage unavailable')
        }
        return originalSetItem.call(this, key, value)
      }
    })

    await page.goto('dashboard', { waitUntil: 'commit' })
    await page.waitForSelector('.chat-fab', { timeout: 30000 })
    await page.locator('.chat-fab').click()
    await page.locator('.chat-input').fill('帮我生成 CNC-001 设备停机复核包')
    await page.locator('.send-btn').click()

    await expect(page.getByRole('button', { name: '生成设备停机复核包' })).toBeVisible()
    await page.getByRole('button', { name: '生成设备停机复核包' }).click()

    const chat = page.locator('.chat-panel')
    await expect(page).toHaveURL(/\/scheduling\/equipment/)
    await expect(chat.getByText('权限校验通过：Admin 可生成设备停机复核包。')).toBeVisible()
    await expect(chat.getByText('审计编号：AUD-CHAT-EQ-DOWNTIME-CNC001-20260523-001')).toBeVisible()
    await expect(chat.getByText('追踪编号：TRACE-EQ-DOWNTIME-CNC-001')).toBeVisible()
    await expect(chat.getByText(/已同步到设备维护、AI 排产事件队列、风险预警、OTD 复盘证据链和审计回放/)).toBeVisible()

    const packageCard = chat.locator('.action-package-card').filter({ hasText: 'CNC-001 设备停机复核包' })
    await expect(packageCard).toBeVisible()
    await expect(packageCard.getByText('停机 4h / +1 单延期风险')).toBeVisible()

    const alert = chat.locator('.message.assistant[role="alert"]').filter({
      hasText: '设备停机复核包已生成，但 OTD 证据写入失败',
    })
    await expect(alert).toBeVisible()
    await expect(alert).toContainText('chromium equipment downtime evidence storage unavailable')
    await expect(chat.getByText('动作执行失败：生成设备停机复核包')).toHaveCount(0)
  })

  test('业务问答：工程数据约束可直接进入 BOM 与工艺路线页面', async ({ page }) => {
    await page.locator('.chat-fab').click()
    await page.locator('.chat-input').fill('BOM 与工艺路线如何约束排产？')
    await page.locator('.send-btn').click()

    const chat = page.locator('.chat-panel')
    await expect(chat.getByText('工程数据约束：BOM、工艺路线和质量门已经进入排产解释。')).toBeVisible()
    await expect(chat.getByText(/M-AL-6061B 只有工程确认后才能释放/)).toBeVisible()
    await expect(chat.getByText(/R-B200 负责热处理瓶颈/)).toBeVisible()
    await expect(page.getByRole('button', { name: '打开 AI 排产' })).toBeVisible()
    await expect(page.getByRole('button', { name: '打开 BOM 管理' })).toBeVisible()
    await expect(page.getByRole('button', { name: '打开工艺路线' })).toBeVisible()

    await page.getByRole('button', { name: '打开 BOM 管理' }).click()
    await expect(page).toHaveURL(/\/scheduling\/bom$/)
    await expect(page.locator('.bom-board')).toBeVisible()
    await expect(chat.getByText('已打开 BOM 管理页面。')).toBeVisible()
  })

  test('业务问答：工程变更批准后解释 ECN 对排产和 OTD 的影响', async ({ page }) => {
    await page.goto('bom', { waitUntil: 'commit' })
    await page.waitForSelector('.bom-board', { timeout: 30000 })
    await page.locator('.list-item').filter({ hasText: 'BOM-A100' }).click()
    const impact = page.locator('.change-impact')
    await impact.getByRole('button', { name: '生成影响分析' }).click()
    await impact.getByRole('button', { name: '批准 ECN 放行' }).click()
    await expect(impact.getByText('AUD-ENG-ECN-20260521-APPROVE')).toBeVisible()

    await page.goto('dashboard', { waitUntil: 'commit' })
    await expect(page.locator('.chat-fab')).toBeVisible()
    await page.locator('.chat-fab').click()
    await page.locator('.chat-input').fill('工程变更 ECN 对排产和 OTD 有什么影响？')
    await page.locator('.send-btn').click()

    const chat = page.locator('.chat-panel')
    await expect(chat.getByText('工程变更影响：ECN-BOM-A100-6061B-20260521 已批准。')).toBeVisible()
    await expect(chat.getByText(/BOM-A100 V1.0，M-AL-6061B 替代 M-AL-6061/)).toBeVisible()
    await expect(chat.getByText(/WO-RUSH-9001 \/ WO-DEMO-1002 \/ WO-DEMO-1005/)).toBeVisible()
    await expect(chat.getByText(/M-AL-6061 当前缺口 19 件/)).toBeVisible()
    await expect(chat.getByText(/OP-040 扭矩检验/)).toBeVisible()
    await expect(chat.getByText(/材料成本 \+1.8%/)).toBeVisible()
    await expect(chat.getByText(/Agent 模拟 OTD \+7%/)).toBeVisible()
    await expect(chat.getByText(/AUD-ENG-ECN-20260521-APPROVE 已批准/)).toBeVisible()
    await expect(chat.getByText(/TRACE-ENG-ECN-BOM-A100-6061B/)).toBeVisible()
    await expect(chat.getByText(/系统治理、OTD 复盘证据链和审计回放/)).toBeVisible()
    await expect(page.getByRole('button', { name: '打开 BOM 管理' })).toBeVisible()
    await expect(page.getByRole('button', { name: '打开 AI 排产' })).toBeVisible()
    await expect(page.getByRole('button', { name: '打开 OTD 报告' })).toBeVisible()
    await expect(page.getByRole('button', { name: '打开系统治理' })).toBeVisible()
  })

  test('业务问答：工艺能力放行后解释热处理瓶颈对排产和 OTD 的影响', async ({ page }) => {
    await page.goto('routing', { waitUntil: 'commit' })
    await page.waitForSelector('.routing-board', { timeout: 30000 })
    await page.locator('.list-item').filter({ hasText: 'R-B200' }).click()
    const validation = page.locator('.capability-validation')
    await validation.getByRole('button', { name: '运行能力校验' }).click()
    await validation.getByRole('button', { name: '确认分流/合批方案' }).click()
    await expect(validation.getByText('TRACE-ROUTE-CAP-R-B200-OP-090')).toBeVisible()

    await page.goto('dashboard', { waitUntil: 'commit' })
    await expect(page.locator('.chat-fab')).toBeVisible()
    await page.locator('.chat-fab').click()
    await page.locator('.chat-input').fill('工艺能力校验对热处理瓶颈排产和 OTD 有什么影响？')
    await page.locator('.send-btn').click()

    const chat = page.locator('.chat-panel')
    await expect(chat.getByText('工艺能力影响：R-B200 OP-090 分流已确认。')).toBeVisible()
    await expect(chat.getByText(/传动轴总成工艺路线 V2.1，工序 热处理/)).toBeVisible()
    await expect(chat.getByText(/WO-DEMO-1007 \/ WO-DEMO-1010 \/ WO-RUSH-9001/)).toBeVisible()
    await expect(chat.getByText(/热处理炉 HT-01，能力缺口 4.5h/)).toBeVisible()
    await expect(chat.getByText(/HT-02 夜班窗口 \/ 外协 HT-SUP-01/)).toBeVisible()
    await expect(chat.getByText(/2026-05-21 22:00-02:00/)).toBeVisible()
    await expect(chat.getByText(/换线影响：35min/)).toBeVisible()
    await expect(chat.getByText(/AUD-ROUTE-CAP-20260521-001 已确认分流\/合批/)).toBeVisible()
    await expect(chat.getByText(/TRACE-ROUTE-CAP-R-B200-OP-090/)).toBeVisible()
    await expect(chat.getByText(/系统治理、OTD 复盘证据链和审计回放/)).toBeVisible()
    await expect(page.getByRole('button', { name: '打开工艺路线' })).toBeVisible()
    await expect(page.getByRole('button', { name: '打开 AI 排产' })).toBeVisible()
    await expect(page.getByRole('button', { name: '打开 OTD 报告' })).toBeVisible()
    await expect(page.getByRole('button', { name: '打开系统治理' })).toBeVisible()
  })

  test('业务问答：BOM 展开齐套包解释缺料、库存和排产影响', async ({ page }) => {
    await page.goto('bom', { waitUntil: 'commit' })
    await page.waitForSelector('.bom-board', { timeout: 30000 })
    await page.locator('.list-item').filter({ hasText: 'BOM-A100' }).click()
    const kitting = page.locator('.bom-kitting-source')
    await kitting.getByRole('button', { name: '生成 BOM 齐套检查包' }).click()
    await expect(kitting.getByText('TRACE-BOM-KIT-BOM-A100-WO-RUSH-9001')).toBeVisible()

    await page.goto('dashboard', { waitUntil: 'commit' })
    await page.waitForSelector('.chat-fab', { timeout: 30000 })
    await page.locator('.chat-fab').click()
    await page.locator('.chat-input').fill('BOM 展开齐套包对库存和排产有什么影响？')
    await page.locator('.send-btn').click()

    const chat = page.locator('.chat-panel')
    await expect(chat.getByText('BOM 展开齐套：BOM-A100 V1.0 已进入 WO-RUSH-9001 排产复核。')).toBeVisible()
    await expect(chat.getByText(/工单窗口：2026-05-20 14:00-22:00/)).toBeVisible()
    await expect(chat.getByText(/M-AL-6061 缺 19件/)).toBeVisible()
    await expect(chat.getByText(/M-AL-6061B：替代可用/)).toBeVisible()
    await expect(chat.getByText(/AUD-BOM-KIT-BOM-A100-WO-RUSH-9001-20260522/)).toBeVisible()
    await expect(chat.getByText(/TRACE-BOM-KIT-BOM-A100-WO-RUSH-9001/)).toBeVisible()
    await expect(chat.getByText(/库存齐套、AI 排产事件队列、系统治理/)).toBeVisible()
    await expect(page.getByRole('button', { name: '打开 BOM 管理' })).toBeVisible()
    await expect(page.getByRole('button', { name: '打开库存齐套' })).toBeVisible()
    await expect(page.getByRole('button', { name: '打开 AI 排产' })).toBeVisible()
    await expect(page.getByRole('button', { name: '打开系统治理' })).toBeVisible()
  })

  test('业务问答：解释订单延期原因', async ({ page }) => {
    await page.locator('.chat-fab').click()
    await page.locator('.chat-input').fill('为什么 WO-RUSH-9001 会延期？')
    await page.locator('.send-btn').click()

    const chat = page.locator('.chat-panel')
    await expect(chat.getByText('延期原因分析：WO-RUSH-9001 当前是最高风险订单。')).toBeVisible()
    await expect(chat.getByText(/M-AL-6061.*齐套缺口 12 件/)).toBeVisible()
    await expect(chat.getByText(/尚未读取到库存齐套证据/)).toBeVisible()
    await expect(chat.getByText(/CNC-001.*夜班维护窗口/)).toBeVisible()
    await expect(chat.getByText(/OTD 当前可重跑口径为从 26\.67% 恢复到 30\.00%/)).toBeVisible()
    await expect(chat.getByText(/引用治理：CNC 精加工 SOP V2.3/)).toBeVisible()
    await expect(chat.getByText(/阻断来源：CNC-01 主轴维护手册 V1.1 已过期/)).toBeVisible()
    await expect(page.getByRole('button', { name: '打开库存齐套' })).toBeVisible()
    await expect(page.getByRole('button', { name: '打开采购协同' })).toBeVisible()
    await expect(page.getByRole('button', { name: '打开 AI 排产' })).toBeVisible()
    await page.getByRole('button', { name: '打开库存齐套' }).click()
    await expect(page).toHaveURL(/\/scheduling\/inventory$/)
    await expect(page.locator('.inv-board')).toBeVisible()
    await expect(chat.getByText(/核对 WO-RUSH-9001 \/ M-AL-6061 缺口和齐套证据/)).toBeVisible()
    await chat.locator('.sources-toggle').click()
    await expect(chat.locator('.source-item').filter({ hasText: 'BOM-A100 替代料规则 V1.0' })).toBeVisible()
  })

  test('业务问答：采购收货闭合后解释缺料齐套状态', async ({ page }) => {
    await closeRushKittingRisk(page)
    await page.locator('.chat-fab').click()
    await page.locator('.chat-input').fill('为什么 WO-RUSH-9001 会延期？')
    await page.locator('.send-btn').click()

    const chat = page.locator('.chat-panel')
    await expect(chat.getByText('延期原因分析：WO-RUSH-9001 当前是最高风险订单。')).toBeVisible()
    await expect(chat.getByText(/采购收货已齐套/)).toBeVisible()
    await expect(chat.getByText(/采购证据 PO-RUSH-20260519/)).toBeVisible()
    await expect(chat.getByText(/缺口清零，排产复核可释放冻结工序/)).toBeVisible()
    await expect(chat.getByText(/OTD 当前可重跑口径为从 26\.67% 恢复到 30\.00%/)).toBeVisible()
  })

  test('业务问答：列出今天最危险的 3 个工单', async ({ page }) => {
    await page.locator('.chat-fab').click()
    await page.locator('.chat-input').fill('今天最危险的 3 个工单是什么？')
    await page.locator('.send-btn').click()

    const chat = page.locator('.chat-panel')
    await expect(chat.getByText('今天最危险的 3 个工单：')).toBeVisible()
    await expect(chat.getByText(/WO-RUSH-9001.*急单插入/)).toBeVisible()
    await expect(chat.getByText(/WO-2026-0042.*CNC-001/)).toBeVisible()
    await expect(chat.getByText(/WO-003.*热处理硬度返工/)).toBeVisible()
  })

  test('业务问答：采购收货闭合后重排最危险工单', async ({ page }) => {
    await closeRushKittingRisk(page)
    await page.locator('.chat-fab').click()
    await page.locator('.chat-input').fill('今天最危险的 3 个工单是什么？')
    await page.locator('.send-btn').click()

    const chat = page.locator('.chat-panel')
    await expect(chat.getByText('今天最危险的 3 个工单：')).toBeVisible()
    await expect(chat.getByText(/WO-2026-0042.*CNC-001/)).toBeVisible()
    await expect(chat.getByText(/WO-003.*热处理硬度返工/)).toBeVisible()
    await expect(chat.getByText(/WO-RUSH-9001.*采购收货已齐套.*采购证据 PO-RUSH-20260519/)).toBeVisible()
    await expect(chat.getByText(/缺料风险从高风险降级为观察项/)).toBeVisible()
    await expect(chat.getByText(/缺口清零，排产复核可释放冻结工序/)).toBeVisible()
  })

  test('业务问答：质量返工事件生成后解释热处理 OTD 影响', async ({ page }) => {
    await page.goto('quality', { waitUntil: 'commit' })
    await page.waitForSelector('.quality-board', { timeout: 60000 })
    const qualityPanel = page.locator('.quality-rework-panel')
    await qualityPanel.getByRole('button', { name: '生成返工排产事件' }).click()
    await expect(qualityPanel.getByText(/返工排产事件已生成/)).toBeVisible()

    await page.goto('dashboard', { waitUntil: 'commit' })
    await expect(page.locator('.chat-fab')).toBeVisible()
    await page.locator('.chat-fab').click()
    await page.locator('.chat-input').fill('质量返工对热处理 OTD 有什么影响？')
    await page.locator('.send-btn').click()

    const chat = page.locator('.chat-panel')
    await expect(chat.getByText('质量返工影响：INS-003 / WO-003 已进入排产复核。')).toBeVisible()
    await expect(chat.getByText(/热处理 \/ 硬度检测，2 件返工，预计占用 6h/)).toBeVisible()
    await expect(chat.getByText(/设备 HT-01，物料批次 MAT-AL6061-B03/)).toBeVisible()
    await expect(chat.getByText(/批次号 WO-003-硬度检测/)).toBeVisible()
    await expect(chat.getByText(/WO-003 延期 \+1 单风险/)).toBeVisible()
    await expect(chat.getByText(/硬度不足 \/ 热处理参数漂移/)).toBeVisible()
    await expect(chat.getByText(/硬度检测 检验结果 rework/)).toBeVisible()
    await expect(chat.getByText(/建议插入返工与复验窗口/)).toBeVisible()
    await expect(page.getByRole('button', { name: '打开质量闭环' })).toBeVisible()
    await expect(page.getByRole('button', { name: '打开 AI 排产' })).toBeVisible()
    await expect(page.getByRole('button', { name: '打开 OTD 报告' })).toBeVisible()
  })

  test('业务问答：生产完工后解释 OTD 复核影响', async ({ page }) => {
    await page.goto('production', { waitUntil: 'commit' })
    await page.waitForSelector('.production-board', { timeout: 30000 })
    await page.locator('.wo-card').first().click()
    await page.locator('.op-btn.complete').first().click()
    await expect(page.getByText('完工报告')).toBeVisible()
    await expect(page.locator('.dialog-confirm')).toBeEnabled()
    await page.locator('.dialog-confirm').click()
    await expect(page.locator('.execution-trace-panel').getByText(/完工复核已提交/)).toBeVisible()

    await page.goto('dashboard', { waitUntil: 'commit' })
    await expect(page.locator('.chat-fab')).toBeVisible()
    await page.locator('.chat-fab').click()
    await page.locator('.chat-input').fill('生产完工对 OTD 有什么影响？')
    await page.locator('.send-btn').click()

    const chat = page.locator('.chat-panel')
    await expect(chat.getByText('生产执行影响：WO-001 已进入 OTD 复盘。')).toBeVisible()
    await expect(chat.getByText(/WO-001 CNC 精加工 完工回写/)).toBeVisible()
    await expect(chat.getByText(/质检结果 Pass/)).toBeVisible()
    await expect(chat.getByText(/OTD 状态：OTD 风险/)).toBeVisible()
    await expect(chat.getByText(/生产复核：WO-001 CNC 精加工 完工复核/)).toBeVisible()
    await expect(chat.getByText(/OTD 风险待复核/)).toBeVisible()
    await expect(chat.getByText(/TRACE-PROD-COMPLETE-OP-20 \/ TRACE-PROD-CLOSEOUT-OP-20/)).toBeVisible()
    await expect(page.getByRole('button', { name: '打开生产报工' })).toBeVisible()
    await expect(page.getByRole('button', { name: '打开 AI 排产' })).toBeVisible()
    await expect(page.getByRole('button', { name: '打开 OTD 报告' })).toBeVisible()
  })

  test('业务问答：异常分流后解释现场事件处置影响', async ({ page }) => {
    await page.goto('anomaly', { waitUntil: 'commit' })
    await page.waitForSelector('.anomaly-board', { timeout: 30000 })
    const qualityLane = page.locator('.event-center .event-lane').filter({ hasText: '装配间隙超差' })
    await qualityLane.getByRole('button', { name: '确认分流' }).click()
    await expect(page.locator('.dispatch-trace').getByText('TRACE-ANOMALY-DISPATCH-QUALITY-GAP-20260521')).toBeVisible()

    await page.goto('dashboard', { waitUntil: 'commit' })
    await expect(page.locator('.chat-fab')).toBeVisible()
    await page.locator('.chat-fab').click()
    await page.locator('.chat-input').fill('异常分流对 OTD 和排产有什么影响？')
    await page.locator('.send-btn').click()

    const chat = page.locator('.chat-panel')
    await expect(chat.getByText('异常分流影响：装配间隙超差已分流到质量返工与排产复核。')).toBeVisible()
    await expect(chat.getByText(/分流类型：质量异常，状态 质量分流已确认/)).toBeVisible()
    await expect(chat.getByText(/WO-20260502 \/ WO-RUSH-9001/)).toBeVisible()
    await expect(chat.getByText(/预计影响 1 个装配窗口/)).toBeVisible()
    await expect(chat.getByText(/质量工程师 周工，截止 今日 15:00/)).toBeVisible()
    await expect(chat.getByText(/排产窗口：OP-030 复验前/)).toBeVisible()
    await expect(chat.getByText(/保护 WO-RUSH-9001 后段装配承诺/)).toBeVisible()
    await expect(chat.getByText(/TRACE-ANOMALY-DISPATCH-QUALITY-GAP-20260521/)).toBeVisible()
    await expect(chat.getByText(/异常管理 -> 质量闭环 -> AI 排产 -> OTD 复盘/)).toBeVisible()
    await expect(page.getByRole('button', { name: '打开异常中心' })).toBeVisible()
    await expect(page.getByRole('button', { name: '打开风险预警' })).toBeVisible()
    await expect(page.getByRole('button', { name: '打开 AI 排产' })).toBeVisible()
    await expect(page.getByRole('button', { name: '打开 OTD 报告' })).toBeVisible()
  })

  test('业务问答：现场态势处置包生成后解释监控、风险和 Hypercare 影响', async ({ page }) => {
    await page.goto('monitoring', { waitUntil: 'domcontentloaded' })
    await page.waitForSelector('.shopfloor-situation', { timeout: 30000 })

    const monitoringPanel = page.locator('.shopfloor-situation')
    await monitoringPanel.getByRole('button', { name: '升级为跨模块处置包' }).click()
    await expect(monitoringPanel.getByText('现场态势已升级为跨模块处置包')).toBeVisible()
    await expect(monitoringPanel.getByLabel('现场态势升级处置包').getByText('CNC-001 现场态势升级处置包')).toBeVisible()

    await page.goto('dashboard', { waitUntil: 'commit' })
    await expect(page.locator('.chat-fab')).toBeVisible()
    await page.locator('.chat-fab').click()
    await page.locator('.chat-input').fill('实时监控现场态势对 OTD 有什么影响？')
    await page.locator('.send-btn').click()

    const chat = page.locator('.chat-panel')
    await expect(chat.getByText('实时监控现场态势：CNC-001 现场态势升级处置包。')).toBeVisible()
    await expect(chat.getByText(/来源事件：CNC-001，影响 WO-RUSH-9001 \/ WO-DEMO-1002/)).toBeVisible()
    await expect(chat.getByText(/OTD 影响：\+6%/)).toBeVisible()
    await expect(chat.getByText(/排产动作：CNC-001 瓶颈负载超过 90%/)).toBeVisible()
    await expect(chat.getByText(/风险建议：风险队列升级给生产经理/)).toBeVisible()
    await expect(chat.getByText(/审计追踪：AUD-SF-ESC-SF-CNC-LOAD-20260521 \/ TRACE-SF-ESC-SF-CNC-LOAD/)).toBeVisible()
    await expect(chat.getByText(/该现场态势已同步到风险预警、AI 排产、报表 OTD 证据链和审计回放。/)).toBeVisible()
    await expect(chat.getByRole('button', { name: '打开实时监控' })).toBeVisible()
    await expect(chat.getByRole('button', { name: '打开风险预警' })).toBeVisible()
    await expect(chat.getByRole('button', { name: '打开 AI 排产' })).toBeVisible()
    await expect(chat.getByRole('button', { name: '打开 OTD 报告' })).toBeVisible()
    await expect(chat.getByRole('button', { name: '打开审计回放' })).toBeVisible()

    await page.getByRole('button', { name: '打开实时监控' }).click()
    await expect(page).toHaveURL(/\/scheduling\/monitoring$/)
    await expect(page.locator('.shopfloor-situation')).toBeVisible()
    await expect(chat.getByText('动作已执行：已打开实时监控页面，核对现场态势图和处置包。')).toBeVisible()
  })

  test('业务问答：外协承诺生成后解释厂外等待是否可计入 OTD 恢复', async ({ page }) => {
    await page.goto('report', { waitUntil: 'commit' })
    await page.waitForSelector('.report-board', { timeout: 30000 })

    const kpiPanel = page.locator('.otd-kpi-drilldown-panel')
    await kpiPanel.getByRole('tab', { name: '产品族' }).click()
    await kpiPanel.getByRole('button', { name: /法兰盘 DN100/ }).click()
    await kpiPanel.getByRole('button', { name: '生成外协承诺包' }).click()
    await expect(page.locator('.otd-kpi-drilldown-panel').getByText('法兰盘 DN100 外协承诺包')).toBeVisible()

    await page.goto('dashboard', { waitUntil: 'commit' })
    await expect(page.locator('.chat-fab')).toBeVisible()
    await page.locator('.chat-fab').click()
    await page.locator('.chat-input').fill('法兰盘 DN100 外协到货后厂外等待能不能计入 OTD 恢复？')
    await page.locator('.send-btn').click()

    const chat = page.locator('.chat-panel')
    await expect(chat.getByText('外协承诺口径：法兰盘 DN100 当前状态为 外协承诺待到货。')).toBeVisible()
    await expect(chat.getByText(/外协对象：法兰盘 DN100，外协厂 华东精密外协厂，承诺到货 2026-05-23。/)).toBeVisible()
    await expect(chat.getByText(/影响工单：WO-DEMO-1013/)).toBeVisible()
    await expect(chat.getByText(/承诺包审计：AUD-OUTSOURCING-COMMITMENT-FLANGE-20260521-001 \/ TRACE-OUTSOURCING-FLANGE-20260521/)).toBeVisible()
    await expect(chat.getByText(/当前结论：外协承诺待到货，外协承诺只能证明外部供应窗口已锁定，厂外等待口径尚未关闭。/)).toBeVisible()
    await expect(chat.getByText(/OTD 口径：不能计入厂内已恢复订单，也不能把外协承诺误判为排产释放。/)).toBeVisible()
    await expect(chat.getByText(/下一步：采购协同确认 华东精密外协厂 到货/)).toBeVisible()
    await expect(chat.getByRole('button', { name: '打开采购协同' })).toBeVisible()
    await expect(chat.getByRole('button', { name: '打开 AI 排产' })).toBeVisible()
    await expect(chat.getByRole('button', { name: '打开 OTD 报告' })).toBeVisible()
    await expect(chat.getByRole('button', { name: '打开系统治理' })).toBeVisible()
    await expect(chat.getByRole('button', { name: '打开审计回放' })).toBeVisible()

    await page.getByRole('button', { name: '打开采购协同' }).click()
    await expect(page).toHaveURL(/\/purchase$/)
    await expect(page.locator('.po-board')).toBeVisible()
    await expect(chat.getByText('动作已执行：已打开采购协同页面，核对 法兰盘 DN100 外协到货与收货闭环。')).toBeVisible()
  })

  test('业务问答：评估 CNC-001 故障 4 小时影响', async ({ page }) => {
    await page.locator('.chat-fab').click()
    await page.locator('.chat-input').fill('如果 CNC-001 故障 4 小时会怎样？')
    await page.locator('.send-btn').click()

    const chat = page.locator('.chat-panel')
    await expect(chat.getByText('设备停机影响：CNC-001 4 小时场景。')).toBeVisible()
    await expect(chat.getByText(/WO-2026-0042 \/ WO-RUSH-9001 \/ WO-DEMO-1001/)).toBeVisible()
    await expect(chat.getByText(/尚未读取到设备停机证据/)).toBeVisible()
    await expect(chat.getByText(/CNC-003.*换线增加约 25 分钟/)).toBeVisible()
    await expect(chat.getByText(/设备故障分流/)).toBeVisible()
    await expect(chat.getByText(/排产锁定期策略 8h/)).toBeVisible()
    await expect(page.getByRole('button', { name: '打开设备维护' })).toBeVisible()
    await expect(page.getByRole('button', { name: '打开风险预警' })).toBeVisible()
    await expect(page.getByRole('button', { name: '打开 AI 排产' })).toBeVisible()
    await page.getByRole('button', { name: '打开设备维护' }).click()
    await expect(page).toHaveURL(/\/scheduling\/equipment$/)
    await expect(page.locator('.equipment-board')).toBeVisible()
    await expect(chat.getByText(/核对 CNC-001 停机诊断和瓶颈保护策略/)).toBeVisible()
  })

  test('业务问答：设备停机证据生成后解释 CNC-001 影响', async ({ page }) => {
    await page.goto('equipment', { waitUntil: 'commit' })
    await page.waitForSelector('.equipment-board', { timeout: 20000 })
    const panel = page.locator('.equipment-impact-panel')
    await panel.getByRole('button', { name: '标记故障并同步排产' }).click()
    await expect(panel.getByText('设备故障已同步 AI 排产')).toBeVisible()

    await page.goto('dashboard', { waitUntil: 'commit' })
    await expect(page.locator('.chat-fab')).toBeVisible()
    await page.locator('.chat-fab').click()
    await page.locator('.chat-input').fill('如果 CNC-001 故障 4 小时会怎样？')
    await page.locator('.send-btn').click()

    const chat = page.locator('.chat-panel')
    await expect(chat.getByText('设备停机影响：CNC-001 4 小时场景。')).toBeVisible()
    await expect(chat.getByText(/4h 停机影响 WO-2026-0042 \/ WO-RUSH-9001 \/ WO-DEMO-1001/)).toBeVisible()
    await expect(chat.getByText(/TRACE-EQ-DOWNTIME-CNC-001/)).toBeVisible()
    await expect(chat.getByText(/待维护/)).toBeVisible()
    await expect(chat.getByText(/设备维护 \/ 瓶颈保护/)).toBeVisible()
    await expect(chat.getByText(/尚未读取到设备停机证据/)).not.toBeVisible()
  })

  test('业务问答：人员替班证据生成后解释开工和排产影响', async ({ page }) => {
    await page.goto('employee', { waitUntil: 'commit' })
    await page.waitForSelector('.emp-board', { timeout: 30000 })
    const skillPanel = page.locator('.skill-matrix-panel')
    await skillPanel.getByRole('button', { name: '同步人员证据' }).click()
    await expect(skillPanel.getByText('人员能力证据已同步 OTD 复盘')).toBeVisible()
    await skillPanel.getByRole('button', { name: '生成替班建议' }).click()
    await expect(skillPanel.getByText('替班建议已同步生产开工与 OTD 复盘')).toBeVisible()

    await page.goto('dashboard', { waitUntil: 'commit' })
    await expect(page.locator('.chat-fab')).toBeVisible()
    await page.locator('.chat-fab').click()
    await page.locator('.chat-input').fill('人员资质临期对 WO-013 开工和排产有什么影响？')
    await page.locator('.send-btn').click()

    const chat = page.locator('.chat-panel')
    await expect(chat.getByText('人员能力影响：WO-013 热处理开工受人员资质约束。')).toBeVisible()
    await expect(chat.getByText(/EMP-003 王五.*热处理上岗证 2026-05-25 临期/)).toBeVisible()
    await expect(chat.getByText(/EMP-006 孙八 接管 淬火 \/ 回火/)).toBeVisible()
    await expect(chat.getByText(/审核人 赵六/)).toBeVisible()
    await expect(chat.getByText(/TRACE-LABOR-REASSIGN-WO-013-OP-10/)).toBeVisible()
    await expect(chat.getByText(/人员替班事件/)).toBeVisible()
    await expect(chat.getByText(/系统管理 Agent 治理、报表 OTD 证据链和审计回放/)).toBeVisible()
    await expect(page.getByRole('button', { name: '打开人员管理' })).toBeVisible()
    await expect(page.getByRole('button', { name: '打开生产报工' })).toBeVisible()
    await expect(page.getByRole('button', { name: '打开 AI 排产' })).toBeVisible()
    await expect(page.getByRole('button', { name: '打开系统治理' })).toBeVisible()
    await expect(page.getByRole('button', { name: '打开审计回放' })).toBeVisible()

    await page.getByRole('button', { name: '打开系统治理' }).click()
    await expect(page).toHaveURL(/\/scheduling\/admin$/)
    await expect(page.locator('.admin-board')).toBeVisible()
    await expect(chat.getByText(/核对人员能力治理记录/)).toBeVisible()
  })
})
