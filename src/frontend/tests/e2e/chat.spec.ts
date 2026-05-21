import { test, expect } from '@playwright/test'

test.describe('AI 生产助手 (ChatPanel)', () => {
  test.describe.configure({ timeout: 60000 })

  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('aimes_token', 'mock-e2e-token')
      localStorage.setItem('aimes_user', JSON.stringify({ username: 'admin', displayName: '管理员', role: 'Admin' }))
    })
    await page.goto('dashboard', { waitUntil: 'commit' })
    await expect(page.locator('.chat-fab')).toBeVisible()
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
    await page.locator('.chat-fab').click()

    const input = page.locator('.chat-input')
    await input.fill('当前产能如何？')

    await page.locator('.send-btn').click()

    // 用户消息出现
    await expect(page.locator('.message.user')).toHaveCount(1, { timeout: 5000 })

    // 助手回复出现（演示模式下为即时回复）
    await expect(page.locator('.message.assistant .msg-content')).not.toHaveCount(0, { timeout: 10000 })
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

  test('可执行动作：创建异常处置卡并留下权限审计', async ({ page }) => {
    await page.locator('.chat-fab').click()
    await page.locator('.chat-input').fill('创建 CNC-001 主轴温升异常处置卡')
    await page.locator('.send-btn').click()

    await expect(page.getByRole('button', { name: '创建异常处置卡' })).toBeVisible()
    await page.getByRole('button', { name: '创建异常处置卡' }).click()

    await expect(page).toHaveURL(/\/scheduling\/anomaly/)
    await expect(page.locator('.event-center')).toBeVisible()
    const chat = page.locator('.chat-panel')
    await expect(chat.getByText('权限校验通过：Admin 可创建异常处置卡。')).toBeVisible()
    await expect(chat.getByText('审计编号：AUD-CHAT-ANOMALY-20260520')).toBeVisible()
    await expect(chat.getByText(/已创建 WO-RUSH-9001 CNC 精加工现场异常处置卡/)).toBeVisible()

    await page.goto('audit-logs', { waitUntil: 'commit' })
    await page.waitForSelector('.audit-board', { timeout: 20000 })
    const auditPanel = page.locator('.audit-replay-panel')
    const auditCard = auditPanel.locator('.decision-card').filter({ hasText: 'AI 助手创建异常处置卡' })
    await expect(auditCard).toBeVisible()
    await expect(auditCard.locator('.decision-meta').getByText('证据：AUD-CHAT-ANOMALY-20260520')).toBeVisible()
    await auditCard.getByRole('button', { name: '回放决策链' }).click()
    await expect(auditPanel.getByText(/AI 生产助手识别可执行意图：创建异常处置卡/)).toBeVisible()
    await expect(auditPanel.getByText(/AI 助手意图、权限校验、执行结果已归档/)).toBeVisible()
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
    const auditCard = auditPanel.locator('.decision-card').filter({ hasText: 'AI 助手生成交期恢复执行包' })
    await expect(auditCard).toBeVisible()
    await expect(auditCard.locator('.decision-meta').getByText('证据：AUD-CHAT-RECOVERY-PACKAGE-20260521-001')).toBeVisible()
    await auditCard.getByRole('button', { name: '回放决策链' }).click()
    await expect(auditPanel.getByText(/跨模块执行包和 OTD 证据已归档/)).toBeVisible()
    await expect(auditPanel.getByText(/AI 排产重排、风险升级、采购替代批次确认和质量首件复核/)).toBeVisible()
    const closedEvidenceCard = auditPanel.locator('.decision-card').filter({ hasText: '助手执行包：WO-RUSH-9001 交期恢复执行包' })
    await expect(closedEvidenceCard).toBeVisible()
    await closedEvidenceCard.getByRole('button', { name: '回放决策链' }).click()
    const replayDetail = auditPanel.locator('.replay-detail')
    await expect(replayDetail.getByText('TRACE-CHAT-RECOVERY-WO-RUSH-9001-CLOSED-20260521', { exact: true })).toBeVisible()
    await expect(auditPanel.getByText(/当前状态为 执行交接已闭环/)).toBeVisible()
    const qualityEvidenceCard = auditPanel.locator('.decision-card').filter({ hasText: '助手质量回写：WO-RUSH-9001 交期恢复执行包质量动作已闭合' })
    await expect(qualityEvidenceCard).toBeVisible()
    await qualityEvidenceCard.getByRole('button', { name: '回放决策链' }).click()
    await expect(replayDetail.getByText('TRACE-CHAT-RECOVERY-QUALITY-FIRST-ARTICLE-20260521', { exact: true })).toBeVisible()
    await expect(auditPanel.getByText(/助手执行包质量回写/)).toBeVisible()
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

  test('业务问答：解释订单延期原因', async ({ page }) => {
    await page.locator('.chat-fab').click()
    await page.locator('.chat-input').fill('为什么 WO-RUSH-9001 会延期？')
    await page.locator('.send-btn').click()

    const chat = page.locator('.chat-panel')
    await expect(chat.getByText('延期原因分析：WO-RUSH-9001 当前是最高风险订单。')).toBeVisible()
    await expect(chat.getByText(/M-AL-6061.*齐套缺口 12 件/)).toBeVisible()
    await expect(chat.getByText(/CNC-001.*夜班维护窗口/)).toBeVisible()
    await expect(chat.getByText(/OTD 可从 82% 恢复到 96%/)).toBeVisible()
    await expect(chat.getByText(/引用治理：CNC 精加工 SOP V2.3/)).toBeVisible()
    await expect(chat.getByText(/阻断来源：CNC-01 主轴维护手册 V1.1 已过期/)).toBeVisible()
    await chat.locator('.sources-toggle').click()
    await expect(chat.locator('.source-item').filter({ hasText: 'BOM-A100 替代料规则 V1.0' })).toBeVisible()
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

  test('业务问答：评估 CNC-001 故障 4 小时影响', async ({ page }) => {
    await page.locator('.chat-fab').click()
    await page.locator('.chat-input').fill('如果 CNC-001 故障 4 小时会怎样？')
    await page.locator('.send-btn').click()

    const chat = page.locator('.chat-panel')
    await expect(chat.getByText('故障假设：CNC-001 停机 4 小时。')).toBeVisible()
    await expect(chat.getByText(/WO-2026-0042 \/ WO-RUSH-9001 \/ WO-DEMO-1001/)).toBeVisible()
    await expect(chat.getByText(/CNC-003.*换线增加约 25 分钟/)).toBeVisible()
    await expect(chat.getByText(/设备故障分流/)).toBeVisible()
    await expect(chat.getByText(/排产锁定期策略 8h/)).toBeVisible()
  })
})
