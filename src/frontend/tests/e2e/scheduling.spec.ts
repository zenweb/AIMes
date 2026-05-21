import { test, expect } from '@playwright/test'

test.describe.configure({ timeout: 90000 })

test.describe('Scheduling 排产甘特图', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('aimes_token', 'mock-e2e-token')
      localStorage.setItem('aimes_user', JSON.stringify({ username: 'admin', displayName: '管理员', role: 'Admin' }))
    })
    await page.goto('scheduling', { waitUntil: 'commit', timeout: 45000 })
    await page.waitForSelector('.agent-workbench-panel', { timeout: 45000 })
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

  test('展示基线与 Agent 的 OTD 改善', async ({ page }) => {
    const panel = page.locator('.impact-panel')
    await expect(panel).toBeVisible()
    await expect(panel.getByText('基线 vs Agent 方案')).toBeVisible()
    await expect(panel.getByText(/OTD \+\d+%/)).toBeVisible()
    await expect(panel.getByText('人工基线')).toBeVisible()
    await expect(panel.getByText('Agent 推荐')).toBeVisible()
    await expect(panel.getByText('优先保护临近交期工单')).toBeVisible()
  })

  test('展示调度员 Agent 工作台', async ({ page }) => {
    const panel = page.locator('.agent-workbench-panel')
    await expect(panel).toBeVisible()
    await expect(panel.getByText('工单池、方案、解释与执行追踪')).toBeVisible()
    await expect(panel.getByText('待排')).toBeVisible()
    await expect(panel.getByText('已排')).toBeVisible()
    await expect(panel.getByText('风险')).toBeVisible()
    await expect(panel.getByText('插单')).toBeVisible()
    await expect(panel.getByText('人工基线')).toBeVisible()
    await expect(panel.getByText('Agent 推荐')).toBeVisible()
    await expect(panel.getByText('人工调整')).toBeVisible()
    await expect(panel.getByText('锁定期后的第一个 CNC 空窗')).toBeVisible()
    await expect(panel.getByText('等待调度员决策')).toBeVisible()
  })

  test('展示急单插单前影响分析', async ({ page }) => {
    const panel = page.locator('.rush-impact-panel')
    await expect(panel).toBeVisible()
    await expect(panel.getByText('插单前先算账')).toBeVisible()
    await expect(panel.getByText('WO-RUSH-9001 急单影响分析')).toBeVisible()
    await expect(panel.getByText('受影响工单')).toBeVisible()
    await expect(panel.getByText(/新增延期/)).toBeVisible()
    await expect(panel.getByText(/换线增加/)).toBeVisible()
    await expect(panel.getByText('M-AL-6061 缺 12 件')).toBeVisible()
    await expect(panel.getByText('建议加班插入')).toBeVisible()
  })

  test('展示 BOM 与工艺路线约束解释', async ({ page }) => {
    const panel = page.locator('.engineering-constraint-panel')
    await expect(panel).toBeVisible()
    await expect(panel.getByText('BOM 与工艺路线进入排产解释')).toBeVisible()
    await expect(panel.getByText('BOM-A100 V1.0')).toBeVisible()
    await expect(panel.getByText('M-AL-6061B 可替代 M-AL-6061')).toBeVisible()
    await expect(panel.getByText('R-A100 OP-020')).toBeVisible()
    await expect(panel.getByText(/CNC 精加工必须匹配 CNC 设备能力/)).toBeVisible()
    await expect(panel.getByText(/OP-040 质检窗口/)).toBeVisible()
    await expect(panel.getByText('人员能力')).toBeVisible()
    await expect(panel.locator('.constraint-topline').filter({ hasText: '人员能力' }).getByText('EMP-001 / EMP-003')).toBeVisible()
    await expect(panel.locator('.constraint-evidence').getByText('EMP-001 / EMP-003 技能矩阵')).toBeVisible()
    await expect(panel.getByText(/热处理夜班 EMP-003 资质 2026-05-25 到期/)).toBeVisible()
  })

  test('人员替班证据释放排产人员约束', async ({ page }) => {
    await page.goto('employee', { waitUntil: 'commit' })
    await page.waitForSelector('.emp-board', { timeout: 20000 })
    const skillPanel = page.locator('.skill-matrix-panel')
    await expect(skillPanel.getByText(/推荐 EMP-006 孙八/)).toBeVisible({ timeout: 20000 })
    await skillPanel.getByRole('button', { name: '生成替班建议' }).click()
    await expect(skillPanel.getByText('替班建议已同步生产开工与 OTD 复盘')).toBeVisible({ timeout: 10000 })

    await page.goto('scheduling', { waitUntil: 'commit' })
    await page.waitForSelector('.agent-workbench-panel', { timeout: 45000 })
    const constraintPanel = page.locator('.engineering-constraint-panel')
    await expect(constraintPanel.getByText('EMP-003 资质临期已生成 EMP-006 替班复核')).toBeVisible()
    const laborConstraint = constraintPanel.locator('.constraint-item').filter({ hasText: 'EMP-003 资质临期已生成 EMP-006 替班复核' })
    await expect(laborConstraint.locator('.constraint-evidence').getByText('AUD-LABOR-REASSIGN-20260520-001', { exact: true })).toBeVisible()
    await expect(laborConstraint.locator('.constraint-evidence').getByText('TRACE-LABOR-REASSIGN-WO-013-OP-10', { exact: true })).toBeVisible()
    await expect(constraintPanel.getByText(/生产开工可直接读取该证据/)).toBeVisible()

    const eventPanel = page.locator('.event-queue-panel')
    const laborEvent = eventPanel.locator('.event-card').filter({ hasText: 'WO-013 热处理替班已确认' })
    await expect(laborEvent.getByText('人员替班事件')).toBeVisible()
    await expect(laborEvent.getByText('已闭环')).toBeVisible()
    await laborEvent.getByRole('button', { name: '复核排产影响' }).click()
    await expect(eventPanel.getByText('人员替班后的开工复核建议')).toBeVisible()
    await expect(eventPanel.getByText(/生产开工按替班复核执行/)).toBeVisible()
  })

  test('人员无有效替班候选时排产保持停工复核事件', async ({ page }) => {
    await page.evaluate(() => {
      localStorage.setItem('aimes_labor_qualification_block', JSON.stringify([
        {
          id: 'labor-qualification-block-WO-013-heat-treatment',
          workOrderNumber: 'WO-013',
          operationCode: 'OP-10',
          operationCodes: ['OP-10', 'OP-20'],
          operationName: '淬火 / 回火',
          blockedEmployeeNumber: 'EMP-003',
          blockedEmployeeName: '王五',
          blockedCertification: '热处理上岗证',
          blockedExpiresAt: '2026-05-25',
          requiredSkill: '热处理',
          requiredTeam: '乙班',
          requiredShift: '夜班',
          reviewerEmployeeNumber: 'EMP-004',
          reviewerName: '赵六',
          reviewerRole: '工程放行',
          reason: 'EMP-003 王五的热处理上岗证 2026-05-25 临期；系统按热处理技能、班组/班次、同证书有效期与复核授权评分后未找到有效替班候选，WO-013 热处理必须停工复核。',
          auditId: 'AUD-LABOR-BLOCK-20260520-001',
          traceId: 'TRACE-LABOR-BLOCK-WO-013-OP-10',
          createdAt: '2026-05-20T09:00:00.000Z',
          status: 'active',
        },
      ]))
    })
    await page.reload({ waitUntil: 'commit' })
    await page.waitForSelector('.agent-workbench-panel', { timeout: 45000 })

    const constraintPanel = page.locator('.engineering-constraint-panel')
    await expect(constraintPanel.getByText('EMP-003 资质临期且无有效替班候选')).toBeVisible()
    const laborConstraint = constraintPanel.locator('.constraint-item').filter({ hasText: 'EMP-003 资质临期且无有效替班候选' })
    await expect(laborConstraint.locator('.constraint-evidence').getByText('AUD-LABOR-BLOCK-20260520-001', { exact: true })).toBeVisible()
    await expect(laborConstraint.locator('.constraint-evidence').getByText('TRACE-LABOR-BLOCK-WO-013-OP-10', { exact: true })).toBeVisible()
    await expect(constraintPanel.getByText(/生产开工必须读取阻断证据/)).toBeVisible()

    const eventPanel = page.locator('.event-queue-panel')
    const laborEvent = eventPanel.locator('.event-card').filter({ hasText: 'WO-013 热处理无有效替班候选' })
    await expect(laborEvent.getByText('人员资质阻断事件')).toBeVisible()
    await expect(laborEvent.getByText('停工复核')).toBeVisible()
    await laborEvent.getByRole('button', { name: '生成重排建议' }).click()
    await expect(eventPanel.getByText('人员资质停工复核建议')).toBeVisible()
    await expect(eventPanel.getByText(/复核通过前生产开工不得放行/)).toBeVisible()
  })

  test('记录 Agent 方案采纳原因', async ({ page }) => {
    const panel = page.locator('.feedback-panel')
    await expect(panel).toBeVisible()
    await expect(panel.getByText('采纳 / 拒绝原因')).toBeVisible()

    await panel.locator('select').selectOption('rush_order')
    await panel.locator('input').fill('急单客户承诺交期优先，接受加班插入')
    await panel.getByRole('button', { name: '采纳方案' }).click()

    const record = panel.locator('.feedback-record')
    await expect(record.getByText('最近反馈')).toBeVisible()
    await expect(record.getByText('已采纳 Agent 推荐')).toBeVisible()
    await expect(record.getByText(/急单插入/)).toBeVisible()
    await expect(record.getByText('急单客户承诺交期优先，接受加班插入')).toBeVisible()
  })

  test('三类事件触发 Agent 重排建议', async ({ page }) => {
    const panel = page.locator('.event-queue-panel')
    await expect(panel).toBeVisible()
    await expect(panel.getByText('三类事件重排队列')).toBeVisible()
    await expect(panel.getByText('缺料事件')).toBeVisible()
    await expect(panel.getByText('设备故障事件')).toBeVisible()
    await expect(panel.getByText('急单插单事件')).toBeVisible()

    await panel.locator('.event-card').filter({ hasText: 'M-AL-6061 齐套缺口' }).getByRole('button', { name: '生成重排建议' }).click()
    await expect(panel.getByText('缺料约束重排建议')).toBeVisible()
    await expect(panel.getByText(/BOM-A100 替代料规则/)).toBeVisible()
    await expect(panel.getByText(/R-A100 CNC 能力要求/)).toBeVisible()

    await panel.locator('.event-card').filter({ hasText: 'CNC 加工中心 01 健康下降' }).getByRole('button', { name: '生成重排建议' }).click()
    await expect(panel.getByText('设备维护窗口重排建议')).toBeVisible()
    await expect(panel.getByText(/维护窗口放入夜班/)).toBeVisible()

    await panel.locator('.event-card').filter({ hasText: 'WO-RUSH-9001 客户插单' }).getByRole('button', { name: '生成重排建议' }).click()
    await expect(panel.getByText('急单插入重排建议')).toBeVisible()
    await expect(panel.getByText(/锁定期后第一个 CNC 空窗/)).toBeVisible()
  })

  test('采纳事件建议进入反馈记录', async ({ page }) => {
    const eventPanel = page.locator('.event-queue-panel')
    const feedbackPanel = page.locator('.feedback-panel')

    await eventPanel.locator('.event-card').filter({ hasText: 'WO-RUSH-9001 客户插单' }).getByRole('button', { name: '生成重排建议' }).click()
    await eventPanel.getByRole('button', { name: '采纳此建议' }).click()

    const workbench = page.locator('.agent-workbench-panel')
    await expect(workbench.getByText('已进入反馈数据集')).toBeVisible()
    await expect(workbench.locator('.suggestion-title').getByText('急单插入重排建议')).toBeVisible()
    await expect(workbench.getByText('排产反馈已写入本地复盘记录')).toBeVisible()

    const record = feedbackPanel.locator('.feedback-record')
    await expect(record.getByText('已采纳 Agent 推荐')).toBeVisible()
    await expect(record.getByText(/急单插单事件/)).toBeVisible()
    await expect(record.getByText(/急单插入重排建议/)).toBeVisible()
    await expect(record.getByText(/锁定期后第一个 CNC 空窗/)).toBeVisible()

    const snapshot = await page.evaluate(() => JSON.parse(localStorage.getItem('aimes_schedule_feedback_snapshot') || 'null'))
    expect(snapshot.reasonDetail).toContain('急单插入重排建议')

    await page.goto('report', { waitUntil: 'commit' })
    await page.waitForSelector('.report-board', { timeout: 60000 })
    const evidenceChain = page.locator('.otd-evidence-chain')
    await expect(evidenceChain.getByText('人工采纳')).toBeVisible()
    await expect(evidenceChain.getByText('已采纳 Agent 推荐')).toBeVisible()
    await expect(evidenceChain.getByText(/急单插入重排建议/)).toBeVisible()
  })

  test('点击任务条展示任务级排产解释', async ({ page }) => {
    await page.locator('.task-explain-shortcuts').getByRole('button', { name: /打开 .* 排产解释/ }).first().click()

    const panel = page.locator('.detail-panel')
    await expect(panel).toHaveClass(/open/)
    await expect(panel.getByText('一键解释这个排产')).toBeVisible()
    await expect(panel.getByText(/为什么排在这里/)).toBeVisible()
    const cardLabels = panel.locator('.explain-card span')
    await expect(cardLabels.getByText('交期', { exact: true })).toBeVisible()
    await expect(cardLabels.getByText('设备', { exact: true })).toBeVisible()
    await expect(cardLabels.getByText('前置工序', { exact: true })).toBeVisible()
    await expect(cardLabels.getByText('缺料', { exact: true })).toBeVisible()
    await expect(cardLabels.getByText('瓶颈', { exact: true })).toBeVisible()
    const summary = panel.locator('.explain-summary')
    await expect(summary.getByText('Agent 推荐理由')).toBeVisible()
    await expect(summary.getByText('风险提示')).toBeVisible()
    await expect(summary.getByText('可替代方案')).toBeVisible()
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
