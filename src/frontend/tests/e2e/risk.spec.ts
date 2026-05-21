import { test, expect } from '@playwright/test'

test.describe('Risk 风险处置队列', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('aimes_token', 'mock-e2e-token')
      localStorage.setItem('aimes_user', JSON.stringify({ username: 'admin', displayName: '管理员', role: 'Admin' }))
      if (!location.pathname.includes('/risk')) {
        localStorage.removeItem('aimes_production_anomaly_event')
      }
    })
    await page.goto('risk')
    await page.waitForSelector('.risk-board', { timeout: 20000 })
  })

  test('展示风险类型、影响工单、交期影响、建议动作、负责人和截止时间', async ({ page }) => {
    const panel = page.locator('.risk-action-panel')
    await expect(panel).toBeVisible()
    await expect(panel.getByText('风险处置队列')).toBeVisible()
    await expect(panel.getByText('待处置工作项')).toBeVisible()
    await expect(panel.getByText('WO-2026-0042 CNC 停机延期')).toBeVisible()

    const card = panel.locator('.action-card').filter({ hasText: 'WO-2026-0042 CNC 停机延期' })
    await expect(card.getByText('工单延期')).toBeVisible()
    await expect(card.getByText(/影响工单：WO-2026-0042/)).toBeVisible()
    await expect(card.getByText('交期影响：预计延期 2 天')).toBeVisible()
    await expect(card.getByText('负责人：调度员 李工')).toBeVisible()
    await expect(card.getByText('截止：今日 14:00')).toBeVisible()
    await expect(card.getByText(/生成 AI 重排建议/)).toBeVisible()
  })

  test('风险工作项支持转派、升级和关闭留痕', async ({ page }) => {
    const panel = page.locator('.risk-action-panel')
    const orderCard = panel.locator('.action-card').filter({ hasText: 'WO-2026-0042 CNC 停机延期' })
    await orderCard.getByRole('button', { name: '转派' }).click()
    await expect(orderCard.getByText('已转派')).toBeVisible()
    await expect(orderCard.getByText('负责人：班组长 孙八')).toBeVisible()
    await expect(panel.locator('.queue-trace').getByText(/已转派给 班组长 孙八/)).toBeVisible()

    const equipmentCard = panel.locator('.action-card').filter({ hasText: 'CNC-001 主轴振动异常' })
    await equipmentCard.getByRole('button', { name: '升级' }).click()
    await expect(equipmentCard.getByText('已升级')).toBeVisible()
    await expect(equipmentCard.getByText('负责人：生产经理审批')).toBeVisible()
    await expect(panel.locator('.queue-trace').getByText(/已升级为跨部门处置/)).toBeVisible()

    const materialCard = panel.locator('.action-card').filter({ hasText: 'AL-6061 齐套缺口' })
    await materialCard.getByRole('button', { name: '关闭' }).click()
    await expect(materialCard.getByText('已关闭')).toBeVisible()
    await expect(panel.locator('.queue-trace').getByText(/已关闭，处置结果将进入 OTD 复盘与审计日志/)).toBeVisible()

    const traces = await page.evaluate(() => JSON.parse(localStorage.getItem('aimes_risk_action_traces') || '[]'))
    expect(traces.some((trace: any) => trace.title === 'AL-6061 齐套缺口' && trace.status === 'closed')).toBeTruthy()

    await page.goto('report', { waitUntil: 'commit' })
    await page.waitForSelector('.report-board', { timeout: 60000 })
    const evidenceChain = page.locator('.otd-evidence-chain')
    const materialEvidence = evidenceChain.locator('.evidence-chain-card').filter({ hasText: 'AL-6061 齐套缺口' })
    await expect(materialEvidence.getByText('现场处置')).toBeVisible()
    await expect(materialEvidence.getByRole('heading', { name: 'AL-6061 齐套缺口' })).toBeVisible()
    await expect(materialEvidence.getByText(/处置结果将进入 OTD 复盘与审计日志/)).toBeVisible()
  })

  test('读取生产异常事件生成风险处置卡', async ({ page }) => {
    await page.evaluate(() => {
      localStorage.setItem('aimes_production_anomaly_event', JSON.stringify({
        id: 'prod-anomaly-e2e-risk',
        workOrderNumber: 'WO-E2E-001',
        operationCode: 'OP-020',
        operationName: 'CNC 精加工',
        equipmentId: 'CNC-002',
        anomalyType: 'process',
        severity: 'High',
        title: 'WO-E2E-001 CNC 精加工 现场异常',
        description: '夹具定位偏移，首件尺寸超差',
        detectedAt: '2026-05-20T10:00:00.000Z',
        detectedBy: 'admin',
        suggestedAction: '冻结当前工序，通知班组长复核 SOP、设备状态和物料批次；同步 AI 排产风险队列评估延期。',
      }))
    })
    await page.reload()
    await page.waitForSelector('.risk-board', { timeout: 20000 })

    const panel = page.locator('.risk-action-panel')
    const riskCard = panel.locator('.action-card').filter({ hasText: 'WO-E2E-001 CNC 精加工 现场异常' })
    await expect(riskCard.getByText('生产异常')).toBeVisible()
    await expect(riskCard.getByText(/影响工单：WO-E2E-001/)).toBeVisible()
    await expect(riskCard.getByText(/夹具定位偏移/)).toBeVisible()
    await expect(riskCard.getByText('负责人：班组长 孙八')).toBeVisible()
    await expect(riskCard.getByText('截止：立即')).toBeVisible()
    await expect(panel.locator('.queue-trace').getByText(/已由生产报工异常上报自动进入风险处置队列/)).toBeVisible()
  })

  test('生成风险 SLA 晨会复核包并联动排产、助手、治理、报表和审计', async ({ page }) => {
    await page.evaluate(() => localStorage.removeItem('aimes_risk_sla_review'))
    await page.reload()
    await page.waitForSelector('.risk-board', { timeout: 20000 })

    const panel = page.locator('.risk-action-panel')
    await panel.getByRole('button', { name: '生成 SLA 晨会复核包' }).click()

    const review = panel.locator('.sla-review-card')
    await expect(review.getByText('风险 SLA 逾期晨会复核包')).toBeVisible()
    await expect(review.getByText('RISK-DAILY-20260521-001')).toBeVisible()
    await expect(review.getByText('AUD-RISK-SLA-REVIEW-20260521')).toBeVisible()
    await expect(review.getByText('TRACE-RISK-SLA-DAILY-REVIEW-20260521')).toBeVisible()
    await expect(panel.locator('.queue-trace').getByText(/风险 SLA 逾期晨会复核包 已生成/)).toBeVisible()
    await panel.getByRole('button', { name: '确认责任动作闭环' }).click()
    await expect(review.getByText('晨会责任动作已闭环')).toBeVisible()
    await expect(review.getByText('AUD-RISK-SLA-CLOSURE-20260521 / TRACE-RISK-SLA-DAILY-REVIEW-CLOSED-20260521')).toBeVisible()
    await expect(panel.locator('.queue-trace').getByText(/责任动作已闭环/)).toBeVisible()

    const storedReview = await page.evaluate(() => JSON.parse(localStorage.getItem('aimes_risk_sla_review') || 'null'))
    expect(storedReview.reviewMeetingId).toBe('RISK-DAILY-20260521-001')
    expect(storedReview.status).toBe('closed')
    expect(storedReview.actions.length).toBeGreaterThanOrEqual(4)

    await page.goto('scheduling', { waitUntil: 'commit' })
    await page.waitForSelector('.schedule-board', { timeout: 60000 })
    const eventCard = page.locator('.event-card').filter({ hasText: '风险 SLA 逾期晨会复核包' })
    await expect(eventCard).toBeVisible()
    await expect(eventCard.getByText('风险 SLA 复核')).toBeVisible()
    await expect(eventCard.getByText('已缓解')).toBeVisible()
    await eventCard.getByRole('button', { name: '复核排产影响' }).click()
    await expect(page.locator('.agent-suggestion').getByText('风险 SLA 闭环后的排产复核建议')).toBeVisible()
    await expect(page.locator('.agent-suggestion').getByText(/TRACE-RISK-SLA-DAILY-REVIEW-CLOSED-20260521/)).toBeVisible()

    await page.locator('.chat-fab').click()
    await page.locator('.chat-input').fill('风险 SLA 晨会复核情况？')
    await page.locator('.send-btn').click()
    const chat = page.locator('.chat-panel')
    await expect(chat.getByText('风险 SLA 逾期晨会复核包 已闭环。')).toBeVisible()
    await expect(chat.getByText(/晨会编号：RISK-DAILY-20260521-001/)).toBeVisible()
    await expect(chat.getByText(/审计追踪：AUD-RISK-SLA-REVIEW-20260521/)).toBeVisible()
    await expect(chat.getByText(/闭环追踪：AUD-RISK-SLA-CLOSURE-20260521/)).toBeVisible()
    await chat.getByRole('button', { name: '关闭聊天' }).click()

    await page.goto('admin', { waitUntil: 'commit' })
    await page.waitForSelector('.admin-board', { timeout: 30000 })
    await page.getByRole('button', { name: 'Agent 治理' }).click()
    const governance = page.locator('.risk-sla-governance-card')
    await expect(governance.getByText('风险 SLA 逾期晨会复核包')).toBeVisible()
    await expect(governance.getByText('RISK-DAILY-20260521-001')).toBeVisible()
    await expect(governance.getByText('AUD-RISK-SLA-REVIEW-20260521')).toBeVisible()
    await expect(governance.getByText(/TRACE-RISK-SLA-DAILY-REVIEW-CLOSED-20260521/)).toBeVisible()

    await page.goto('report', { waitUntil: 'commit' })
    await page.waitForSelector('.report-board', { timeout: 30000 })
    const evidence = page.locator('.otd-evidence-chain').locator('.evidence-chain-card').filter({ hasText: '风险 SLA 逾期晨会复核包' })
    await expect(evidence.getByText('风险 SLA 复核')).toBeVisible()
    await expect(evidence.getByText('TRACE-RISK-SLA-DAILY-REVIEW-CLOSED-20260521')).toBeVisible()

    await page.goto('audit-logs', { waitUntil: 'commit' })
    await page.waitForSelector('.audit-board', { timeout: 30000 })
    const auditPanel = page.locator('.audit-replay-panel')
    const auditCard = auditPanel.locator('.decision-card').filter({ hasText: '风险 SLA 复核：风险 SLA 逾期晨会复核包' })
    await expect(auditCard).toBeVisible()
    await expect(auditCard.locator('.decision-meta').getByText('证据：TRACE-RISK-SLA-DAILY-REVIEW-CLOSED-20260521')).toBeVisible()
    await auditCard.getByRole('button', { name: '回放决策链' }).click()
    await expect(auditPanel.getByText(/风险 SLA 复核 阶段生成证据/)).toBeVisible()
    await expect(auditPanel.getByText(/报表中心 CSV 与审计回放均可核对该记录/)).toBeVisible()
  })
})
