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
    await expect(page.locator('.chat-fab')).toBeVisible()
  }

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

  test('业务问答：解释订单延期原因', async ({ page }) => {
    await page.locator('.chat-fab').click()
    await page.locator('.chat-input').fill('为什么 WO-RUSH-9001 会延期？')
    await page.locator('.send-btn').click()

    const chat = page.locator('.chat-panel')
    await expect(chat.getByText('延期原因分析：WO-RUSH-9001 当前是最高风险订单。')).toBeVisible()
    await expect(chat.getByText(/M-AL-6061.*齐套缺口 12 件/)).toBeVisible()
    await expect(chat.getByText(/尚未读取到库存齐套证据/)).toBeVisible()
    await expect(chat.getByText(/CNC-001.*夜班维护窗口/)).toBeVisible()
    await expect(chat.getByText(/OTD 可从 82% 恢复到 96%/)).toBeVisible()
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
    await expect(chat.getByText(/OTD 可从 82% 恢复到 96%/)).toBeVisible()
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
})
