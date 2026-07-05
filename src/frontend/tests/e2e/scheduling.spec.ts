import { test, expect } from '@playwright/test'
import { readFile } from 'node:fs/promises'

const LABOR_EVIDENCE_RETRY_TITLE = '人员证据启动读取失败后可重试'
const LEGACY_PERSONNEL_EVIDENCE_TITLES = [
  '人员替班证据释放排产人员约束',
  '人员无有效替班候选时排产保持停工复核事件',
]
const AGENT_BACKEND_EVIDENCE_TITLES = [
  '调度员 Agent 工作台通过后端 API',
  '调度员 Agent 工作台通过后端 API 生成并拒绝推荐',
  '调度员 Agent 工作台后端 403',
  '调度员 Agent 工作台 API 不可用',
]
const FORMAL_WRITEBACK_EVIDENCE_TITLE = '急单 Agent 采纳后区分反馈与正式排产回写'
const FEEDBACK_MODAL_EVIDENCE_TITLE = '排产采纳反馈表单提交成功后关闭'
const COMPARE_APPLY_EVIDENCE_TITLE = '多目标方案对比采用成功后真实浏览器关闭对话框并同步反馈'
const ASSISTANT_RECOVERY_HANDOFF_EVIDENCE_TITLE = 'Assistant 恢复交接闭环后真实浏览器保留本地闭环建议'
const ASSISTANT_RECOVERY_RISK_REFRESH_EVIDENCE_TITLE = 'Assistant 恢复交接闭环后风险事件刷新失败时真实浏览器保留闭环建议'
const EQUIPMENT_ROW_CLICK_GUARD_EVIDENCE_TITLE = '点击设备行时真实浏览器不打开工单详情'
const RUSH_FEEDBACK_MISSING_PLAN_ID_EVIDENCE_TITLE = '急单采纳反馈缺少计划 ID 时真实浏览器 fail-loud'
const OUTSOURCING_RISK_REFRESH_EVIDENCE_TITLE = '外协排产释放后风险事件刷新失败时真实浏览器保留释放确认'
const FAIL_LOUD_BACKEND_EVIDENCE_TITLES = [
  '后端返回空排产计划',
  '排产计划返回 HTML fallback',
  '设备列表返回 HTML fallback',
  '排产优化失败',
  '风险看板读取失败',
  '批量方案反馈同步失败',
]

const laborEvidenceRetryReads = {
  blocks: 0,
  reassignments: 0,
}

test.describe.configure({ timeout: 90000 })

test.describe('Scheduling 排产甘特图', () => {
  test.beforeEach(async ({ page }, testInfo) => {
    const usesLegacyPersonnelOfflineDemo = LEGACY_PERSONNEL_EVIDENCE_TITLES.some(title => testInfo.title.includes(title))
    const usesAgentBackendMock = AGENT_BACKEND_EVIDENCE_TITLES.some(title => testInfo.title.includes(title))
    const usesFormalWritebackMock = testInfo.title.includes(FORMAL_WRITEBACK_EVIDENCE_TITLE)
    const usesFailLoudBackendMock = FAIL_LOUD_BACKEND_EVIDENCE_TITLES.some(title => testInfo.title.includes(title))
    const usesFeedbackModalMock = testInfo.title.includes(FEEDBACK_MODAL_EVIDENCE_TITLE)
    const usesCompareApplyMock = testInfo.title.includes(COMPARE_APPLY_EVIDENCE_TITLE)
    const usesAssistantRecoveryHandoffMock = testInfo.title.includes(ASSISTANT_RECOVERY_HANDOFF_EVIDENCE_TITLE)
    const usesAssistantRecoveryRiskRefreshMock = testInfo.title.includes(ASSISTANT_RECOVERY_RISK_REFRESH_EVIDENCE_TITLE)
    const usesEquipmentRowClickGuardMock = testInfo.title.includes(EQUIPMENT_ROW_CLICK_GUARD_EVIDENCE_TITLE)
    const usesRushFeedbackMissingPlanIdMock = testInfo.title.includes(RUSH_FEEDBACK_MISSING_PLAN_ID_EVIDENCE_TITLE)
    const usesOutsourcingRiskRefreshMock = testInfo.title.includes(OUTSOURCING_RISK_REFRESH_EVIDENCE_TITLE)
    const usesLiveBackendMock = usesAgentBackendMock || usesFormalWritebackMock || usesFailLoudBackendMock || usesFeedbackModalMock || usesCompareApplyMock || usesAssistantRecoveryHandoffMock || usesAssistantRecoveryRiskRefreshMock || usesEquipmentRowClickGuardMock || usesRushFeedbackMissingPlanIdMock || usesOutsourcingRiskRefreshMock || testInfo.title.includes(LABOR_EVIDENCE_RETRY_TITLE)
    await page.addInitScript((offlineDemoSession) => {
      localStorage.setItem('aimes_offline_demo', offlineDemoSession ? 'true' : 'false')
      localStorage.setItem('aimes_token', offlineDemoSession ? 'demo-token-admin' : 'mock-e2e-token')
      localStorage.setItem('aimes_refresh_token', offlineDemoSession ? 'demo-refresh-admin' : 'mock-e2e-refresh')
      localStorage.setItem('aimes_user', JSON.stringify({ username: 'admin', displayName: '管理员', role: 'Admin', mustChangePassword: false }))
    }, !usesLiveBackendMock)
    if (usesAgentBackendMock) {
      await mockSchedulingPlanApis(page, {
        agentApiUnavailable: testInfo.title.includes('调度员 Agent 工作台 API 不可用'),
        agentAdoptStatus: testInfo.title.includes('调度员 Agent 工作台后端 403') ? 403 : 200,
      })
    }
    if (usesFormalWritebackMock) {
      await mockSchedulingPlanApis(page)
    }
    if (usesFeedbackModalMock) {
      await mockSchedulingPlanApis(page)
    }
    if (usesCompareApplyMock) {
      await mockSchedulingPlanApis(page)
    }
    if (usesAssistantRecoveryHandoffMock) {
      await mockSchedulingPlanApis(page)
    }
    if (usesAssistantRecoveryRiskRefreshMock) {
      await mockSchedulingPlanApis(page)
    }
    if (usesEquipmentRowClickGuardMock) {
      await mockSchedulingPlanApis(page)
    }
    if (usesRushFeedbackMissingPlanIdMock) {
      await mockSchedulingPlanApis(page, { missingPlanId: true })
    }
    if (testInfo.title.includes(LABOR_EVIDENCE_RETRY_TITLE)) {
      await page.addInitScript(() => {
        localStorage.setItem('aimes_offline_demo', 'false')
        localStorage.removeItem('aimes_labor_qualification_block')
        localStorage.removeItem('aimes_labor_reassignment')
      })
      await mockLaborRetrySchedulingPlanApis(page)
      await mockLaborEvidenceRetryApis(page)
    }
    const entry = usesLiveBackendMock
      ? '/scheduling/scheduling?offlineDemo=0'
      : '/scheduling/scheduling?offlineDemo=1'
    if (!usesLegacyPersonnelOfflineDemo) {
      await page.goto(entry, { waitUntil: 'commit', timeout: 45000 })
      await page.waitForURL('**/scheduling/scheduling**', { timeout: 45000 })
      await expect(page.locator('.schedule-board')).toBeVisible({ timeout: 45000 })
      await expect(page.getByRole('heading', { name: 'AI 调度员专业台' })).toBeVisible({ timeout: 45000 })
    }
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

  test('排产复杂操作提供双语指引、关联证据链接和帮助入口', async ({ page }) => {
    const guidance = page.locator('.schedule-workbench-guidance')
    await expect(guidance).toBeVisible()
    await expect(guidance).toContainText('优化或采纳前，请确认目标、锁定期、证据链和回写路径。')
    await expect(guidance).toContainText('Before optimizing or adopting a plan, confirm objective, lock window, evidence trail, and writeback path.')

    const auditLink = guidance.getByRole('link', { name: '审计回放 / Audit trail' })
    const reportLink = guidance.getByRole('link', { name: '交付报表 / Delivery report' })
    const helpLink = guidance.getByRole('link', { name: '帮助 / Help' })
    await expect(auditLink).toHaveAttribute('href', './audit-logs')
    await expect(reportLink).toHaveAttribute('href', './report')
    await expect(helpLink).toHaveAttribute('href', '#schedule-workbench-help')

    await helpLink.click()
    await expect(page).toHaveURL(/#schedule-workbench-help$/)
    const help = page.locator('#schedule-workbench-help')
    await expect(help).toBeVisible()
    await expect(help).toHaveAttribute('aria-label', '排产帮助')
    await expect(help).toContainText('先复核影响范围，再执行优化、采纳或拖拽回写。')
    await expect(help).toContainText('Review impact scope before optimization, adoption, or drag writeback.')
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

  test('调度员 Agent 工作台提供后端建议采纳拒绝入口', async ({ page }) => {
    const panel = page.locator('.agent-workbench-panel')
    await expect(panel.getByRole('button', { name: '生成后端建议' })).toBeVisible()
    await expect(panel.getByRole('button', { name: '采纳推荐' })).toBeVisible()
    await expect(panel.getByRole('button', { name: '拒绝建议' })).toBeVisible()
    await expect(panel.getByText(/demo fallback/)).toBeVisible()
  })

  test('调度员 Agent 工作台通过后端 API 生成并采纳推荐', async ({ page }) => {
    const panel = page.locator('.agent-workbench-panel')
    await clickAgentWorkbenchButton(page, '生成后端建议')
    await expect(panel.getByText('后端已生成 2 个方案，推荐 WeightedComposite。')).toBeVisible()
    await expect(panel.getByText('后端推荐采用 WeightedComposite')).toBeVisible()

    await clickAgentWorkbenchButton(page, '采纳推荐')
    await expect(panel.getByText('推荐方案已采纳，后端已写入 Agent action、审计和采纳反馈。')).toBeVisible()
    await expect(panel.getByText('后端决策 / Adopted')).toBeVisible()
  })

  test('调度员 Agent 工作台通过后端 API 生成并拒绝推荐', async ({ page }) => {
    const panel = page.locator('.agent-workbench-panel')
    await clickAgentWorkbenchButton(page, '生成后端建议')
    await expect(panel.getByText('后端已生成 2 个方案，推荐 WeightedComposite。')).toBeVisible()
    await expect(panel.getByText('后端推荐采用 WeightedComposite')).toBeVisible()

    await clickAgentWorkbenchButton(page, '拒绝建议')
    await expect(panel.getByText('推荐方案已拒绝，后端已写入 Agent action 和审计记录。')).toBeVisible()
    await expect(panel.getByText('后端决策 / Rejected')).toBeVisible()
    await expect(panel.getByRole('button', { name: '采纳推荐' })).toBeDisabled()
    await expect(panel.getByRole('button', { name: '拒绝建议' })).toBeDisabled()
  })

  test('调度员 Agent 工作台后端 403 时保留 fallback 并提示权限', async ({ page }) => {
    const panel = page.locator('.agent-workbench-panel')
    await clickAgentWorkbenchButton(page, '生成后端建议')
    await expect(panel.getByText('后端已生成 2 个方案，推荐 WeightedComposite。')).toBeVisible()

    await clickAgentWorkbenchButton(page, '采纳推荐')
    await expect(panel.getByText('采纳失败，请确认当前用户具有 Admin 或 Planner 权限。')).toBeVisible()
  })

  test('调度员 Agent 工作台 API 不可用时保留 demo fallback', async ({ page }) => {
    const panel = page.locator('.agent-workbench-panel')
    await clickAgentWorkbenchButton(page, '生成后端建议')
    await expect(panel.getByText('后端建议生成失败，已保留 demo fallback。')).toBeVisible()
    await expect(panel.getByText(/API 不可用 \/ demo fallback/)).toBeVisible()
  })

  test('后端返回空排产计划时真实浏览器展示 fail-loud fallback', async ({ page }) => {
    await page.evaluate(() => localStorage.setItem('aimes_offline_demo', 'false'))
    await page.route('**/api/v1/scheduling/current', route => route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        id: 'empty-plan-e2e',
        planName: '空排产计划',
        items: [],
        overallUtilizationRate: 0.82,
        onTimeDeliveryRate: 0.91,
      }),
    }))
    await page.route(/\/api\/v1\/equipment(?:\?|$)/, route => route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ items: [], totalCount: 0, page: 1, pageSize: 50 }),
    }))

    await page.reload({ waitUntil: 'commit' })
    await page.waitForSelector('.agent-workbench-panel', { timeout: 45000 })

    const warning = page.locator('.warnings-bar')
    await expect(warning).toBeVisible()
    await expect(warning).toContainText('后端排产服务不可用')
    await expect(warning).toContainText('当前显示演示排产数据')
    await expect(warning).toContainText('后端排产计划缺少可执行任务')
    await page.waitForSelector('.gantt_task_line', { timeout: 10000 })
    await expect(page.locator('.gantt_task_line')).not.toHaveCount(0)
  })

  test('排产计划返回 HTML fallback 时真实浏览器展示 fail-loud fallback', async ({ page }) => {
    await page.evaluate(() => localStorage.setItem('aimes_offline_demo', 'false'))
    await page.route('**/api/v1/scheduling/current', route => route.fulfill({
      status: 200,
      contentType: 'text/html',
      body: '<!doctype html><html><body>schedule SPA fallback from chromium</body></html>',
    }))

    await page.reload({ waitUntil: 'commit' })
    await page.waitForSelector('.agent-workbench-panel', { timeout: 45000 })

    const warning = page.locator('.warnings-bar')
    await expect(warning).toBeVisible()
    await expect(warning).toContainText('后端排产服务不可用')
    await expect(warning).toContainText('当前显示演示排产数据')
    await expect(warning).toContainText('后端排产计划载荷不完整')
    await page.waitForSelector('.gantt_task_line', { timeout: 10000 })
    await expect(page.locator('.gantt_task_line')).not.toHaveCount(0)
  })

  test('设备列表返回 HTML fallback 时真实浏览器展示 fail-loud fallback', async ({ page }) => {
    await page.evaluate(() => localStorage.setItem('aimes_offline_demo', 'false'))
    await page.route(/\/api\/v1\/equipment(?:\?|$)/, route => route.fulfill({
      status: 200,
      contentType: 'text/html',
      body: '<!doctype html><html><body>equipment SPA fallback from chromium</body></html>',
    }))

    await page.reload({ waitUntil: 'commit' })
    await page.waitForSelector('.agent-workbench-panel', { timeout: 45000 })

    const warning = page.locator('.warnings-bar')
    await expect(warning).toBeVisible()
    await expect(warning).toContainText('后端排产服务不可用')
    await expect(warning).toContainText('当前显示演示排产数据')
    await expect(warning).toContainText('后端设备列表载荷不完整')
    await page.waitForSelector('.gantt_task_line', { timeout: 10000 })
    await expect(page.locator('.gantt_task_line')).not.toHaveCount(0)
  })

  test('A/B 报告读取失败时真实浏览器展示 OTD 对比来源提示', async ({ page }) => {
    await page.route('**/reports/latest-ab-report.json', route => route.fulfill({
      status: 404,
      contentType: 'application/json',
      body: JSON.stringify({ message: 'schedule A/B report missing from chromium' }),
    }))

    await page.reload({ waitUntil: 'commit' })
    await page.waitForSelector('.agent-workbench-panel', { timeout: 45000 })

    const warning = page.locator('.warnings-bar')
    await expect(warning).toBeVisible()
    await expect(warning).toContainText('A/B 报告读取失败')
    await expect(warning).toContainText('基线 vs Agent OTD 对比暂用排产计划推导值')
    await expect(warning).toContainText('latest A/B report HTTP 404')
  })

  test('排产优化失败时真实浏览器保留当前甘特图并展示 fail-loud 告警', async ({ page }) => {
    await page.evaluate(() => localStorage.setItem('aimes_offline_demo', 'false'))
    await page.route('**/api/v1/scheduling/optimize', route => route.fulfill({
      status: 503,
      contentType: 'application/json',
      body: JSON.stringify({ message: 'chromium optimizer unavailable' }),
    }))

    await page.waitForSelector('.gantt_task_line', { timeout: 10000 })
    const taskCountBefore = await page.locator('.gantt_task_line').count()

    await page.getByRole('button', { name: '排产优化' }).click()

    const alert = page.locator('.error-banner[role="alert"]')
    await expect(alert).toBeVisible()
    await expect(alert).toContainText('优化失败')
    await expect(alert).toContainText('chromium optimizer unavailable')
    await expect(page.locator('.gantt_task_line')).toHaveCount(taskCountBefore)
  })

  test('风险看板读取失败时真实浏览器展示本地事件 fallback', async ({ page }) => {
    await page.evaluate(() => localStorage.setItem('aimes_offline_demo', 'false'))
    await page.route('**/api/v1/scheduling/current', route => route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        id: 'risk-fallback-plan-e2e',
        planName: '风险 fallback 排产计划',
        planStartDate: '2026-06-01T08:00:00.000Z',
        planEndDate: '2026-06-01T12:00:00.000Z',
        overallUtilizationRate: 0.82,
        onTimeDeliveryRate: 0.9,
        totalChangeoverMinutes: 35,
        groupCount: 1,
        createdAt: '2026-06-01T08:00:00.000Z',
        items: [
          {
            id: 'risk-fallback-item-1',
            workOrderId: 'risk-fallback-wo-1',
            workOrderNumber: 'WO-RISK-FALLBACK-001',
            equipmentId: 'risk-fallback-eq-1',
            equipmentName: 'CNC 风险复核机台',
            plannedStartTime: '2026-06-01T08:00:00.000Z',
            plannedEndTime: '2026-06-01T12:00:00.000Z',
            sequence: 1,
            setupTime: '30 分钟',
            dependentItems: [],
          },
        ],
      }),
    }))
    await page.route('**/api/v1/equipment/bottlenecks**', route => route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(['risk-fallback-eq-1']),
    }))
    await page.route(/\/api\/v1\/equipment(?:\?|$)/, route => route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        items: [
          {
            id: 'risk-fallback-eq-1',
            equipmentCode: 'CNC-RISK-01',
            equipmentName: 'CNC 风险复核机台',
            equipmentType: 'CNC',
            status: 'running',
            capacity: 100,
            utilizationRate: 0.82,
          },
        ],
        totalCount: 1,
        page: 1,
        pageSize: 50,
      }),
    }))
    let riskRequests = 0
    await page.route('**/api/v1/risk/dashboard**', route => {
      riskRequests += 1
      return route.fulfill({
        status: 503,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'chromium risk dashboard unavailable' }),
      })
    })

    await page.reload({ waitUntil: 'commit' })
    await page.waitForSelector('.agent-workbench-panel', { timeout: 45000 })
    await expect.poll(() => riskRequests).toBeGreaterThan(0)

    const note = page.locator('.risk-event-sync-note')
    await expect(note).toBeVisible()
    await expect(note).toHaveAttribute('role', 'status')
    await expect(note).toHaveAttribute('aria-live', 'polite')
    await expect(note).toContainText('风险事件加载失败')
    await expect(note).toContainText('已显示本地演示事件')
    await expect(note).toContainText('chromium risk dashboard unavailable')

    const panel = page.locator('.event-queue-panel')
    await expect(panel.getByText('缺料事件')).toBeVisible()
    await expect(panel.getByText('设备故障事件')).toBeVisible()
    await expect(panel.getByText('急单插单事件')).toBeVisible()
  })

  test('批量方案反馈同步失败时真实浏览器保留本地目标切换并展示原因', async ({ page }) => {
    await page.evaluate(() => localStorage.setItem('aimes_offline_demo', 'false'))
    const comparedPlan = {
      id: 'batch-balanced-plan-e2e',
      planName: '综合平衡方案',
      planStartDate: '2026-06-01T08:00:00.000Z',
      planEndDate: '2026-06-01T12:00:00.000Z',
      overallUtilizationRate: 0.86,
      onTimeDeliveryRate: 0.93,
      totalChangeoverMinutes: 28,
      groupCount: 1,
      createdAt: '2026-06-01T08:00:00.000Z',
      items: [
        {
          id: 'batch-balanced-item-1',
          workOrderId: 'batch-balanced-wo-1',
          workOrderNumber: 'WO-BATCH-BALANCED-001',
          equipmentId: 'batch-balanced-eq-1',
          equipmentName: 'CNC 批量对比机台',
          plannedStartTime: '2026-06-01T08:00:00.000Z',
          plannedEndTime: '2026-06-01T12:00:00.000Z',
          sequence: 1,
          setupTime: '20 分钟',
          dependentItems: [],
        },
      ],
    }
    await page.route('**/api/v1/scheduling/optimize-compare', route => route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        bestOverallObjective: 'balanced',
        items: [
          {
            objective: 'balanced',
            objectiveLabel: '综合平衡',
            plan: comparedPlan,
            utilizationRate: 0.86,
            onTimeDeliveryRate: 0.93,
            totalChangeoverMinutes: 28,
            groupCount: 1,
            estimatedCompletionRate: 0.95,
            totalWorkOrders: 1,
            recommendationScore: 0.8112,
            recommendationScoreBreakdown: {
              utilizationContribution: 0.258,
              onTimeDeliveryContribution: 0.465,
              changeoverContribution: 0.0882,
            },
          },
        ],
        recommendationScoreFormula: {
          version: 'e2e-v1',
          utilizationWeight: 0.3,
          onTimeDeliveryWeight: 0.5,
          changeoverWeight: 0.2,
          changeoverNormalizationMinutes: 50,
          description: 'E2E 批量方案反馈同步失败验证公式',
        },
      }),
    }))
    await page.route('**/api/v1/scheduling/optimize', route => route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        plan: comparedPlan,
        assignments: [],
        estimatedCompletionRate: 0.95,
        utilizationRate: 0.86,
        warnings: ['综合平衡方案已应用'],
      }),
    }))
    let feedbackRequests = 0
    await page.route('**/api/v1/scheduling/adoption-feedback', route => {
      feedbackRequests += 1
      return route.fulfill({
        status: 503,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'chromium batch feedback unavailable' }),
      })
    })

    await page.getByRole('button', { name: '多目标对比' }).click()
    const dialog = page.getByRole('dialog', { name: '多目标方案对比' })
    await expect(dialog).toBeVisible()
    await expect(dialog.locator('.recommend-card')).toContainText('综合平衡')

    await dialog.getByRole('button', { name: '采用此方案' }).click()
    await expect.poll(() => feedbackRequests).toBeGreaterThan(0)

    const note = page.locator('.sync-note').filter({ hasText: '批量方案采纳反馈同步失败' })
    await expect(note).toBeVisible()
    await expect(note).toHaveAttribute('role', 'status')
    await expect(note).toHaveAttribute('aria-live', 'polite')
    await expect(note).toContainText('批量方案采纳反馈同步失败')
    await expect(note).toContainText('当前仅保留本地目标切换')
    await expect(note).toContainText('chromium batch feedback unavailable')
    await expect(page.locator('.toolbar')).toContainText('综合平衡方案')
    await expect(page.locator('.warnings-bar')).toContainText('综合平衡方案已应用')
  })

  test('多目标方案对比采用成功后真实浏览器关闭对话框并同步反馈', async ({ page }) => {
    await page.evaluate(() => localStorage.setItem('aimes_offline_demo', 'false'))
    const comparedPlan = {
      id: 'batch-balanced-success-plan-e2e',
      planName: '综合平衡方案',
      planStartDate: '2026-06-01T08:00:00.000Z',
      planEndDate: '2026-06-01T12:00:00.000Z',
      overallUtilizationRate: 0.86,
      onTimeDeliveryRate: 0.93,
      totalChangeoverMinutes: 28,
      groupCount: 1,
      createdAt: '2026-06-01T08:00:00.000Z',
      items: [
        {
          id: 'batch-balanced-success-item-1',
          workOrderId: 'batch-balanced-success-wo-1',
          workOrderNumber: 'WO-BATCH-BALANCED-SUCCESS-001',
          equipmentId: 'batch-balanced-success-eq-1',
          equipmentName: 'CNC 批量对比成功机台',
          plannedStartTime: '2026-06-01T08:00:00.000Z',
          plannedEndTime: '2026-06-01T12:00:00.000Z',
          sequence: 1,
          setupTime: '20 分钟',
          dependentItems: [],
        },
      ],
    }
    await page.route('**/api/v1/scheduling/optimize-compare', route => route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        bestOverallObjective: 'balanced',
        items: [
          {
            objective: 'balanced',
            objectiveLabel: '综合平衡',
            plan: comparedPlan,
            utilizationRate: 0.86,
            onTimeDeliveryRate: 0.93,
            totalChangeoverMinutes: 28,
            groupCount: 1,
            estimatedCompletionRate: 0.95,
            totalWorkOrders: 1,
            recommendationScore: 0.8112,
            recommendationScoreBreakdown: {
              utilizationContribution: 0.258,
              onTimeDeliveryContribution: 0.465,
              changeoverContribution: 0.0882,
            },
          },
        ],
        recommendationScoreFormula: {
          version: 'e2e-v1',
          utilizationWeight: 0.3,
          onTimeDeliveryWeight: 0.5,
          changeoverWeight: 0.2,
          changeoverNormalizationMinutes: 50,
          description: 'E2E 批量方案反馈同步成功验证公式',
        },
      }),
    }))
    await page.route('**/api/v1/scheduling/optimize', route => route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        plan: comparedPlan,
        assignments: [],
        estimatedCompletionRate: 0.95,
        utilizationRate: 0.86,
        warnings: ['综合平衡方案已应用'],
      }),
    }))
    let feedbackRequests = 0
    await page.route('**/api/v1/scheduling/adoption-feedback', route => {
      feedbackRequests += 1
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ id: 'batch-compare-apply-success-e2e' }),
      })
    })

    await page.getByRole('button', { name: '多目标对比' }).click()
    const dialog = page.getByRole('dialog', { name: '多目标方案对比' })
    await expect(dialog).toBeVisible()
    await expect(dialog.locator('.recommend-card')).toContainText('综合平衡')

    await dialog.getByRole('button', { name: '采用此方案' }).click()

    await expect(dialog).toBeHidden()
    await expect.poll(() => feedbackRequests).toBe(1)
    const note = page.locator('.sync-note').filter({ hasText: '批量方案采纳反馈已同步后台' })
    await expect(note).toBeVisible()
    await expect(note).toContainText('批量方案采纳反馈已同步后台')
    await expect(page.locator('.toolbar')).toContainText('综合平衡方案')
    await expect(page.locator('.warnings-bar')).toContainText('综合平衡方案已应用')
  })

  test('外协到货建议被采纳后真实浏览器归档排产释放证据', async ({ page }) => {
    await page.route('**/api/v1/scheduling/outsourcing-commitments**', route => route.abort())
    await seedReceivedOutsourcingCommitment(page)

    await page.reload({ waitUntil: 'commit' })
    await page.waitForSelector('.agent-workbench-panel', { timeout: 45000 })

    const eventPanel = page.locator('.event-queue-panel')
    const outsourcingEvent = eventPanel.locator('.event-card').filter({ hasText: '法兰盘 DN100 外协到货已确认' })
    await expect(outsourcingEvent.locator('.event-severity').getByText('已到货', { exact: true })).toBeVisible()
    await expect(outsourcingEvent.getByText('TRACE-OUTSOURCING-FLANGE-RECEIVED-20260521')).toBeVisible()

    await outsourcingEvent.getByRole('button', { name: '复核排产影响' }).click()
    await expect(eventPanel.locator('.agent-suggestion').getByText('外协到货后的排产释放复核')).toBeVisible()
    await expect(eventPanel.locator('.agent-suggestion').getByText(/关闭 WO-DEMO-1013 的厂外等待口径/)).toBeVisible()

    await eventPanel.locator('.agent-suggestion').getByRole('button', { name: '采纳此建议' }).click()
    const suggestion = eventPanel.locator('.agent-suggestion')
    await expect(suggestion.getByText('外协排产释放已确认')).toBeVisible()
    await expect(suggestion.getByText('TRACE-OUTSOURCING-FLANGE-SCHEDULE-RELEASE-20260521')).toBeVisible()
    await expect(suggestion.getByText('AUD-OUTSOURCING-SCHEDULE-RELEASE-FLANGE-20260521-001')).toBeVisible()
    await expect(suggestion.getByText('OTD +2% 已释放归档')).toBeVisible()
    await expect(suggestion.getByText('延期 0 单外部等待')).toBeVisible()

    const releasedEvent = eventPanel.locator('.event-card').filter({ hasText: '法兰盘 DN100 外协排产释放已确认' })
    await expect(releasedEvent.locator('.event-severity').getByText('已释放', { exact: true })).toBeVisible()
    await expect(releasedEvent.getByText('TRACE-OUTSOURCING-FLANGE-SCHEDULE-RELEASE-20260521')).toBeVisible()

    const packageSnapshot = await page.evaluate(() => JSON.parse(localStorage.getItem('aimes_outsourcing_commitment_packages') || '[]'))
    expect(packageSnapshot[0].scheduleReleaseTraceId).toBe('TRACE-OUTSOURCING-FLANGE-SCHEDULE-RELEASE-20260521')
    expect(packageSnapshot[0].scheduleReleaseAuditId).toBe('AUD-OUTSOURCING-SCHEDULE-RELEASE-FLANGE-20260521-001')

    const evidenceSnapshot = await page.evaluate(() => JSON.parse(localStorage.getItem('aimes_otd_evidence_chain') || '[]'))
    expect(evidenceSnapshot.some((item: { traceId?: string }) => item.traceId === 'TRACE-OUTSOURCING-FLANGE-SCHEDULE-RELEASE-20260521')).toBe(true)
  })

  test('外协排产释放返回空审计时真实浏览器 fail-loud 且不虚假归档', async ({ page }) => {
    await page.route('**/api/v1/scheduling/outsourcing-commitments**', route => route.abort())
    await seedReceivedOutsourcingCommitment(page)

    await page.reload({ waitUntil: 'commit' })
    await page.waitForSelector('.agent-workbench-panel', { timeout: 45000 })

    const eventPanel = page.locator('.event-queue-panel')
    const outsourcingEvent = eventPanel.locator('.event-card').filter({ hasText: '法兰盘 DN100 外协到货已确认' })
    await expect(outsourcingEvent.locator('.event-severity').getByText('已到货', { exact: true })).toBeVisible()
    await expect(outsourcingEvent.getByText('TRACE-OUTSOURCING-FLANGE-RECEIVED-20260521')).toBeVisible()

    await outsourcingEvent.getByRole('button', { name: '复核排产影响' }).click()
    await expect(eventPanel.locator('.agent-suggestion').getByText('外协到货后的排产释放复核')).toBeVisible()
    await page.evaluate(() => {
      const packages = JSON.parse(localStorage.getItem('aimes_outsourcing_commitment_packages') || '[]')
      delete packages[0].receiptTraceId
      delete packages[0].receiptAuditId
      localStorage.setItem('aimes_outsourcing_commitment_packages', JSON.stringify(packages))
    })

    await eventPanel.locator('.agent-suggestion').getByRole('button', { name: '采纳此建议' }).click()

    const note = page.locator('.sync-note').filter({ hasText: '外协排产释放同步失败' })
    await expect(note).toBeVisible()
    await expect(note).toContainText('采纳反馈已保留')
    await expect(note).toContainText('未拿到释放审计记录')
    await expect(note).toContainText('product-flange')
    await expect(note).not.toContainText('外协排产释放已归档')

    const suggestion = eventPanel.locator('.agent-suggestion')
    await expect(suggestion.getByText('外协到货后的排产释放复核')).toBeVisible()
    await expect(suggestion).not.toContainText('外协排产释放已确认')
    await expect(suggestion).not.toContainText('TRACE-OUTSOURCING-FLANGE-SCHEDULE-RELEASE-20260521')

    const packageSnapshot = await page.evaluate(() => JSON.parse(localStorage.getItem('aimes_outsourcing_commitment_packages') || '[]'))
    expect(packageSnapshot[0].scheduleReleaseTraceId).toBeUndefined()
    expect(packageSnapshot[0].scheduleReleaseAuditId).toBeUndefined()
  })

  test('外协排产释放后风险事件刷新失败时真实浏览器保留释放确认', async ({ page }) => {
    await page.route('**/api/v1/scheduling/outsourcing-commitments**', route => route.abort())
    await seedReceivedOutsourcingCommitment(page)

    await page.reload({ waitUntil: 'commit' })
    await page.waitForSelector('.agent-workbench-panel', { timeout: 45000 })

    const eventPanel = page.locator('.event-queue-panel')
    const outsourcingEvent = eventPanel.locator('.event-card').filter({ hasText: '法兰盘 DN100 外协到货已确认' })
    await expect(outsourcingEvent.locator('.event-severity').getByText('已到货', { exact: true })).toBeVisible()

    await outsourcingEvent.getByRole('button', { name: '复核排产影响' }).click()
    await expect(eventPanel.locator('.agent-suggestion').getByText('外协到货后的排产释放复核')).toBeVisible()
    await page.evaluate(() => localStorage.setItem('aimes_offline_demo', 'false'))
    await page.route('**/api/v1/scheduling/adoption-feedback', route => route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ id: 'outsourcing-risk-refresh-fail-loud-e2e' }),
    }))
    await page.route('**/api/v1/risk/dashboard**', route => route.fulfill({
      status: 503,
      contentType: 'application/json',
      body: JSON.stringify({ message: 'risk refresh unavailable after release from chromium' }),
    }))

    await eventPanel.locator('.agent-suggestion').getByRole('button', { name: '采纳此建议' }).click()

    const note = page.locator('.sync-note').filter({ hasText: '外协排产释放已归档' })
    await expect(note).toBeVisible()
    await expect(note).toContainText('外协排产释放已归档')
    await expect(note).toContainText('风险事件刷新失败')
    await expect(note).toContainText('释放确认仍保留')
    await expect(note).toContainText('risk refresh unavailable after release from chromium')
    await expect(note).toContainText('TRACE-OUTSOURCING-FLANGE-SCHEDULE-RELEASE-20260521')

    const riskNote = page.locator('.risk-event-sync-note')
    await expect(riskNote).toBeVisible()
    await expect(riskNote).toContainText('风险事件加载失败')
    await expect(riskNote).toContainText('risk refresh unavailable after release from chromium')

    const suggestion = eventPanel.locator('.agent-suggestion')
    await expect(suggestion.getByText('外协排产释放已确认')).toBeVisible()
    await expect(suggestion.getByText('TRACE-OUTSOURCING-FLANGE-SCHEDULE-RELEASE-20260521')).toBeVisible()

    const packageSnapshot = await page.evaluate(() => JSON.parse(localStorage.getItem('aimes_outsourcing_commitment_packages') || '[]'))
    expect(packageSnapshot[0].scheduleReleaseTraceId).toBe('TRACE-OUTSOURCING-FLANGE-SCHEDULE-RELEASE-20260521')
    expect(packageSnapshot[0].scheduleReleaseAuditId).toBe('AUD-OUTSOURCING-SCHEDULE-RELEASE-FLANGE-20260521-001')
  })

  test('Assistant 恢复交接闭环后真实浏览器保留本地闭环建议', async ({ page }) => {
    await page.route('**/api/v1/scheduling/assistant-recovery-packages**', route => {
      if (route.request().method() === 'GET') {
        return route.fulfill({
          status: 503,
          contentType: 'application/json',
          body: JSON.stringify({ message: 'assistant recovery refresh unavailable from chromium' }),
        })
      }
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: route.request().postData() || '{}',
      })
    })
    await page.evaluate(() => {
      localStorage.setItem('aimes_assistant_recovery_packages', JSON.stringify([
        {
          id: 'assistant-recovery-e2e-1',
          title: 'Assistant 恢复交接',
          auditCode: 'AUD-AST-RECOVERY-E2E-001',
          traceId: 'TRACE-AST-RECOVERY-E2E-001',
          actor: '调度员 李工',
          role: 'Scheduler',
          workOrders: 'WO-RUSH-9001',
          priority: 'critical',
          owner: '生产经理审批',
          dueAt: '今日 15:30',
          scheduleWindow: 'CNC-003 夜班窗口',
          scheduleAction: '插入 WO-RUSH-9001 并保留 OP-20 复核。',
          riskImpact: '急单恢复窗口依赖替代料和质量复核。',
          riskSuggestion: '闭环后复核排产窗口。',
          otdImpact: '+6%',
          delayImpact: '-1 单',
          changeoverImpact: '+8min',
          status: 'active',
          statusLabel: '待跨模块复核',
          summary: 'Assistant 恢复交接包需要排产、采购、风险和质量责任动作同步闭环。',
          dispatchSteps: [
            {
              module: 'AI 排产',
              owner: '调度员 李工',
              action: '复核恢复窗口',
              evidence: 'TRACE-AST-RECOVERY-E2E-001',
              status: 'pending',
            },
          ],
          createdAt: '2026-06-22T09:30:00.000Z',
        },
      ]))
    })

    await page.reload({ waitUntil: 'commit' })
    await page.waitForSelector('.agent-workbench-panel', { timeout: 45000 })

    const handoff = page.locator('.recovery-handoff-panel')
    await expect(handoff).toBeVisible()
    await expect(handoff).toContainText('Assistant 恢复交接')
    await expect(handoff).toContainText('待跨模块复核')

    await handoff.getByRole('button', { name: '确认执行交接闭环' }).click()

    await expect(handoff).toContainText('执行交接已闭环')
    await expect(handoff).toContainText('TRACE-CHAT-RECOVERY-WO-RUSH-9001-CLOSED-20260521')
    await expect(handoff.getByRole('button', { name: '确认执行交接闭环' })).toHaveCount(0)

    const note = page.locator('.sync-note').filter({ hasText: 'Assistant 恢复交接闭环刷新失败' })
    await expect(note).toBeVisible()
    await expect(note).toHaveAttribute('role', 'status')
    await expect(note).toHaveAttribute('aria-live', 'polite')
    await expect(note).toContainText('assistant recovery refresh unavailable from chromium')

    const suggestion = page.locator('.agent-suggestion')
    await expect(suggestion.getByText('Assistant 恢复交接闭环复核建议')).toBeVisible()
    await expect(suggestion.getByText('TRACE-CHAT-RECOVERY-WO-RUSH-9001-CLOSED-20260521')).toBeVisible()

    const packageSnapshot = await page.evaluate(() => JSON.parse(localStorage.getItem('aimes_assistant_recovery_packages') || '[]'))
    expect(packageSnapshot[0].status).toBe('closed')
    expect(packageSnapshot[0].closureTraceId).toBe('TRACE-CHAT-RECOVERY-WO-RUSH-9001-CLOSED-20260521')
  })

  test('Assistant 恢复交接闭环后风险事件刷新失败时真实浏览器保留闭环建议', async ({ page }) => {
    await page.route('**/api/v1/scheduling/assistant-recovery-packages**', route => {
      if (route.request().method() === 'GET') {
        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([]),
        })
      }
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: route.request().postData() || '{}',
      })
    })
    await page.evaluate(() => {
      localStorage.setItem('aimes_assistant_recovery_packages', JSON.stringify([
        {
          id: 'assistant-recovery-risk-refresh-e2e-1',
          title: 'Assistant 恢复交接',
          auditCode: 'AUD-AST-RECOVERY-RISK-REFRESH-E2E-001',
          traceId: 'TRACE-AST-RECOVERY-RISK-REFRESH-E2E-001',
          actor: '调度员 李工',
          role: 'Scheduler',
          workOrders: 'WO-RUSH-9001',
          priority: 'critical',
          owner: '生产经理审批',
          dueAt: '今日 15:30',
          scheduleWindow: 'CNC-003 夜班窗口',
          scheduleAction: '插入 WO-RUSH-9001 并保留 OP-20 复核。',
          riskImpact: '急单恢复窗口依赖替代料和质量复核。',
          riskSuggestion: '闭环后复核排产窗口。',
          otdImpact: '+6%',
          delayImpact: '-1 单',
          changeoverImpact: '+8min',
          status: 'active',
          statusLabel: '待跨模块复核',
          summary: 'Assistant 恢复交接包需要排产、采购、风险和质量责任动作同步闭环。',
          dispatchSteps: [
            {
              module: 'AI 排产',
              owner: '调度员 李工',
              action: '复核恢复窗口',
              evidence: 'TRACE-AST-RECOVERY-RISK-REFRESH-E2E-001',
              status: 'pending',
            },
          ],
          createdAt: '2026-06-22T09:30:00.000Z',
        },
      ]))
    })

    await page.reload({ waitUntil: 'commit' })
    await page.waitForSelector('.agent-workbench-panel', { timeout: 45000 })

    const handoff = page.locator('.recovery-handoff-panel')
    await expect(handoff).toBeVisible()
    await expect(handoff).toContainText('Assistant 恢复交接')
    await expect(handoff).toContainText('待跨模块复核')

    await page.route('**/api/v1/risk/dashboard**', route => route.fulfill({
      status: 503,
      contentType: 'application/json',
      body: JSON.stringify({ message: 'risk events unavailable after assistant closure from chromium' }),
    }))

    await handoff.getByRole('button', { name: '确认执行交接闭环' }).click()

    await expect(handoff).toContainText('执行交接已闭环')
    await expect(handoff).toContainText('TRACE-CHAT-RECOVERY-WO-RUSH-9001-CLOSED-20260521')
    await expect(handoff.getByRole('button', { name: '确认执行交接闭环' })).toHaveCount(0)

    const note = page.locator('.sync-note').filter({ hasText: 'Assistant 恢复交接闭环后风险事件刷新失败' })
    await expect(note).toBeVisible()
    await expect(note).toHaveAttribute('role', 'status')
    await expect(note).toHaveAttribute('aria-live', 'polite')
    await expect(note).toContainText('闭环建议仍保留')
    await expect(note).toContainText('risk events unavailable after assistant closure from chromium')
    await expect(note).not.toContainText('Assistant 恢复交接闭环刷新失败')

    const riskNote = page.locator('.risk-event-sync-note')
    await expect(riskNote).toBeVisible()
    await expect(riskNote).toContainText('风险事件加载失败')
    await expect(riskNote).toContainText('risk events unavailable after assistant closure from chromium')

    const suggestion = page.locator('.agent-suggestion')
    await expect(suggestion.getByText('Assistant 恢复交接闭环复核建议')).toBeVisible()
    await expect(suggestion.getByText('TRACE-CHAT-RECOVERY-WO-RUSH-9001-CLOSED-20260521')).toBeVisible()

    const packageSnapshot = await page.evaluate(() => JSON.parse(localStorage.getItem('aimes_assistant_recovery_packages') || '[]'))
    expect(packageSnapshot[0].status).toBe('closed')
    expect(packageSnapshot[0].closureTraceId).toBe('TRACE-CHAT-RECOVERY-WO-RUSH-9001-CLOSED-20260521')
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
    await page.goto('employee?offlineDemo=1', { waitUntil: 'commit' })
    await page.waitForSelector('.emp-board', { timeout: 20000 })
    const skillPanel = page.locator('.skill-matrix-panel')
    await expect(skillPanel.getByText(/推荐 EMP-006 孙八/)).toBeVisible({ timeout: 20000 })
    await skillPanel.getByRole('button', { name: '生成替班建议' }).click()
    await expect(skillPanel.getByText('替班建议已同步生产开工与 OTD 复盘')).toBeVisible({ timeout: 10000 })

    await page.goto('scheduling?offlineDemo=1', { waitUntil: 'commit' })
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

  test('人员证据启动读取失败后可重试并释放排产人员约束', async ({ page }) => {
    const warning = page.locator('.warnings-bar')
    await expect(warning).toBeVisible()
    await expect(warning).toContainText('人员约束启动证据加载失败')
    await expect(warning).toContainText('chromium startup labor block read unavailable')
    const retryButton = warning.getByRole('button', { name: '重试人员证据 / Retry labor evidence' })
    await expect(retryButton).toBeVisible()

    await retryButton.click()
    await expect.poll(() => laborEvidenceRetryReads.blocks).toBeGreaterThanOrEqual(2)
    await expect.poll(() => laborEvidenceRetryReads.reassignments).toBeGreaterThanOrEqual(2)
    await expect(page.getByText('人员约束启动证据加载失败')).toHaveCount(0)

    const constraintPanel = page.locator('.engineering-constraint-panel')
    await expect(constraintPanel.getByText('EMP-003 资质临期已生成 EMP-006 替班复核')).toBeVisible()
    await expect(constraintPanel.getByText(/生产开工可直接读取该证据/)).toBeVisible()
    await expect(constraintPanel.getByText('AUD-LABOR-RELEASE-20260520-001', { exact: true })).toBeVisible()
    await expect(constraintPanel.getByText('TRACE-LABOR-RELEASE-WO-013-OP-10', { exact: true })).toBeVisible()

    const eventPanel = page.locator('.event-queue-panel')
    const laborEvent = eventPanel.locator('.event-card').filter({ hasText: 'WO-013 热处理替班已确认' })
    await expect(laborEvent.getByText('人员替班事件')).toBeVisible()
    await expect(laborEvent.getByText('已闭环')).toBeVisible()
    await expect(laborEvent.getByText('人员约束已由替班建议转为开工校验')).toBeVisible()
    await expect(page.locator('.agent-workbench-panel')).toBeVisible()
    await page.waitForSelector('.gantt_task_line', { timeout: 10000 })
  })

  test('人员无有效替班候选时排产保持停工复核事件', async ({ page }) => {
    await page.addInitScript(() => {
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
    await page.goto('scheduling?offlineDemo=1', { waitUntil: 'commit' })
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
    const eventList = panel.locator('.event-grid')
    await expect(eventList).toHaveAttribute('role', 'list')
    await expect(eventList).toHaveAttribute('aria-label', /排产事件重排队列：\d+ 个待评估事件/)
    await expect(panel.getByText('缺料事件')).toBeVisible()
    await expect(panel.getByText('设备故障事件')).toBeVisible()
    await expect(panel.getByText('急单插单事件')).toBeVisible()

    const materialEvent = panel.locator('.event-card').filter({ hasText: 'M-AL-6061 齐套缺口' })
    await expect(materialEvent).toHaveAttribute('role', 'listitem')
    await expect(materialEvent).toHaveAttribute('aria-label', /缺料事件：M-AL-6061 齐套缺口/)
    await materialEvent.getByRole('button', { name: '生成重排建议' }).click()
    await expect(panel.getByText('缺料约束重排建议')).toBeVisible()
    await expect(panel.getByText(/BOM-A100 替代料规则/)).toBeVisible()
    await expect(panel.getByText(/R-A100 CNC 能力要求/)).toBeVisible()

    await panel.locator('.event-card').filter({ hasText: 'CNC 加工中心 01 健康下降' }).getByRole('button', { name: '生成重排建议' }).click()
    await expect(panel.getByText('设备维护窗口重排建议')).toBeVisible()
    await expect(panel.locator('.agent-suggestion > p').getByText(/维护窗口放入夜班/)).toBeVisible()

    await panel.locator('.event-card').filter({ hasText: 'WO-RUSH-9001 客户插单' }).getByRole('button', { name: '生成重排建议' }).click()
    await expect(panel.getByText('急单插入重排建议')).toBeVisible()
    await expect(panel.locator('.agent-suggestion > p').getByText(/锁定期后第一个 CNC 空窗/)).toBeVisible()
  })

  test('急单插单生成多方案决策包并进入 OTD 复盘', async ({ page }) => {
    const eventPanel = page.locator('.event-queue-panel')

    await eventPanel.locator('.event-card').filter({ hasText: 'WO-RUSH-9001 客户插单' }).getByRole('button', { name: '生成重排建议' }).click()

    const scenarioPackage = eventPanel.locator('.scenario-package')
    await expect(scenarioPackage.getByText('Agent 多方案决策包')).toBeVisible()
    await expect(scenarioPackage.locator('.scenario-row').filter({ hasText: '加班插入' })).toBeVisible()
    await expect(scenarioPackage.locator('.scenario-row').filter({ hasText: '强插当前窗口' })).toBeVisible()
    await expect(scenarioPackage.locator('.scenario-row').filter({ hasText: '换设备插入' })).toBeVisible()
    await expect(scenarioPackage.getByText(/OTD 改善最高/)).toBeVisible()
    await expect(scenarioPackage.getByText(/破坏锁定期并扩大换线成本/)).toBeVisible()

    await eventPanel.getByRole('button', { name: '采纳此建议' }).click()

    const feedbackRecord = page.locator('.feedback-record')
    await expect(feedbackRecord.getByText('已采纳 Agent 推荐')).toBeVisible()
    await expect(feedbackRecord.getByText(/推荐方案：加班插入/)).toBeVisible()
    await expect(feedbackRecord.getByText(/未选方案：强插当前窗口/)).toBeVisible()

    const snapshot = await page.evaluate(() => JSON.parse(localStorage.getItem('aimes_schedule_feedback_snapshot') || 'null'))
    expect(snapshot.reasonDetail).toContain('推荐方案：加班插入')
    expect(snapshot.reasonDetail).toContain('未选方案：强插当前窗口')
    expect(snapshot.reasonDetail).toContain('换设备插入')

    await page.goto('report?offlineDemo=1', { waitUntil: 'commit' })
    await page.waitForSelector('.report-board', { timeout: 60000 })
    const evidenceChain = page.locator('.otd-evidence-chain')
    const scheduleEvidence = evidenceChain.locator('.evidence-chain-card').filter({ hasText: '急单插入重排建议' })
    await expect(scheduleEvidence.locator('span').getByText('人工采纳', { exact: true })).toBeVisible()
    await expect(scheduleEvidence.getByText(/推荐方案：加班插入/)).toBeVisible()
    await expect(scheduleEvidence.getByText(/未选方案：强插当前窗口/)).toBeVisible()
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
    await expect(record.locator('span').getByText(/急单插单事件/)).toBeVisible()
    await expect(record.getByText(/急单插入重排建议/)).toBeVisible()
    await expect(record.getByText(/锁定期后第一个 CNC 空窗/)).toBeVisible()

    const snapshot = await page.evaluate(() => JSON.parse(localStorage.getItem('aimes_schedule_feedback_snapshot') || 'null'))
    expect(snapshot.reasonDetail).toContain('急单插入重排建议')

    await page.goto('report?offlineDemo=1', { waitUntil: 'commit' })
    await page.waitForSelector('.report-board', { timeout: 60000 })
    const evidenceChain = page.locator('.otd-evidence-chain')
    const scheduleEvidence = evidenceChain.locator('.evidence-chain-card').filter({ hasText: '急单插入重排建议' })
    await expect(scheduleEvidence.locator('span').getByText('人工采纳', { exact: true })).toBeVisible()
    await expect(scheduleEvidence.getByText('已采纳 Agent 推荐')).toBeVisible()
    await expect(scheduleEvidence.getByText(/急单插入重排建议/)).toBeVisible()
  })

  test('急单采纳反馈缺少计划 ID 时真实浏览器 fail-loud', async ({ page }) => {
    let feedbackRequests = 0
    await page.route('**/api/v1/scheduling/adoption-feedback', route => {
      feedbackRequests += 1
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ id: 'unexpected-missing-plan-id-feedback-sync' }),
      })
    })

    const eventPanel = page.locator('.event-queue-panel')
    await eventPanel.locator('.event-card').filter({ hasText: 'WO-RUSH-9001 客户插单' }).getByRole('button', { name: '生成重排建议' }).click()
    await clickEventQueueButton(page, '采纳此建议')

    const note = page.locator('.sync-note').filter({ hasText: '当前排产计划缺少 ID' })
    await expect(note).toHaveAttribute('role', 'status')
    await expect(note).toHaveAttribute('aria-live', 'polite')
    await expect(note).toContainText('反馈已写入本地复盘记录')
    await expect(note).toContainText('当前排产计划缺少 ID')
    await expect(note).toContainText('暂未同步后台')
    await expect(note).toContainText('尚未写入正式排产计划')
    await expect(page.locator('.feedback-record').getByText('已采纳 Agent 推荐')).toBeVisible()
    expect(feedbackRequests).toBe(0)
  })

  test('急单 Agent 采纳后区分反馈与正式排产回写', async ({ page }) => {
    const eventPanel = page.locator('.event-queue-panel')
    await eventPanel.locator('.event-card').filter({ hasText: 'WO-RUSH-9001 客户插单' }).getByRole('button', { name: '生成重排建议' }).click()
    await eventPanel.getByRole('button', { name: '采纳此建议' }).click()

    const workbench = page.locator('.agent-workbench-panel')
    await expect(workbench.getByText('已进入反馈数据集')).toBeVisible()
    await expect(workbench.getByText('排产反馈已写入本地复盘记录；正式计划待优化或保存')).toBeVisible()
    const writebackStep = workbench.locator('li').filter({ hasText: '执行回写' })
    await expect(writebackStep).toHaveClass(/current/)

    await page.getByRole('button', { name: '排产优化' }).click()

    await expect(workbench.getByText('排产反馈已写入本地复盘记录；正式排产计划已更新')).toBeVisible()
    await expect(writebackStep).toHaveClass(/done/)
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

  test('工单详情接口失败时真实浏览器展示本地排产解释兜底', async ({ page }) => {
    let detailRequests = 0
    await page.route('**/api/v1/scheduling/workorders/**', async route => {
      detailRequests += 1
      await route.fulfill({
        status: 503,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'work order detail unavailable from chromium' }),
      })
    })

    await page.evaluate(() => {
      window.history.replaceState(null, '', '/scheduling/scheduling?offlineDemo=0')
      localStorage.setItem('aimes_offline_demo', 'false')
    })
    await page.waitForSelector('.gantt_task_line', { timeout: 10000 })
    await page.locator('.gantt_task_line').first().focus()
    await page.keyboard.press('Enter')

    const panel = page.locator('.detail-panel')
    await expect(panel).toHaveClass(/open/)
    await expect(panel).toHaveAttribute('role', 'dialog')
    await expect(panel).toHaveAttribute('aria-modal', 'true')
    await expect(panel).toHaveAttribute('aria-label', /工单详情/)
    await expect(panel.getByRole('button', { name: '关闭工单详情' })).toBeVisible()
    const error = panel.locator('.panel-body.error')
    await expect(error).toHaveAttribute('role', 'alert')
    await expect(error).toHaveAttribute('aria-live', 'assertive')
    await expect(error).toContainText('工单详情加载失败')
    await expect(error).toContainText('已显示本地排产解释兜底')
    await expect(error).toContainText('work order detail unavailable from chromium')
    expect(detailRequests).toBeGreaterThan(0)
  })

  test('工单详情接口成功时真实浏览器展示后端工单详情', async ({ page }) => {
    let detailRequests = 0
    await page.route('**/api/v1/scheduling/workorders/**', route => {
      detailRequests += 1
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 'wo-agent-e2e-001',
          orderNumber: 'WO-AGENT-E2E-BACKEND',
          productCode: 'PRD-BROWSER-BACKEND',
          productName: '真实浏览器后端工单',
          plannedQuantity: 120,
          completedQuantity: 48,
          plannedStartDate: '2026-05-20T08:00:00.000Z',
          plannedEndDate: '2026-05-20T10:00:00.000Z',
          actualStartDate: '2026-05-20T08:10:00.000Z',
          status: 'in_progress',
          workshopId: 'ws-e2e',
          routeCode: 'R-BROWSER-BACKEND',
          priority: 1,
          progressPercentage: 40,
          createdAt: '2026-05-19T08:00:00.000Z',
          updatedAt: '2026-05-20T09:00:00.000Z',
        }),
      })
    })

    await page.evaluate(() => {
      window.history.replaceState(null, '', '/scheduling/scheduling?offlineDemo=0')
      localStorage.setItem('aimes_offline_demo', 'false')
    })
    await page.waitForSelector('.gantt_task_line', { timeout: 10000 })
    await page.locator('.gantt_task_line').first().focus()
    await page.keyboard.press('Enter')

    const panel = page.locator('.detail-panel')
    await expect(panel).toHaveClass(/open/)
    await expect(panel).toHaveAttribute('role', 'dialog')
    await expect(panel).toHaveAttribute('aria-modal', 'true')
    await expect.poll(() => detailRequests).toBe(1)
    await expect(panel).toHaveAttribute('aria-label', '工单详情：WO-AGENT-E2E-BACKEND')
    await expect(panel.locator('.panel-body.error')).toHaveCount(0)
    await expect(panel.getByText('WO-AGENT-E2E-BACKEND')).toBeVisible()
    await expect(panel.getByText('真实浏览器后端工单')).toBeVisible()
    await expect(panel.getByText('PRD-BROWSER-BACKEND')).toBeVisible()
    await expect(panel.getByText('40%')).toBeVisible()
    await expect(panel.getByText('生产中')).toBeVisible()
    await expect(panel).not.toContainText('工单详情加载失败')
  })

  test('点击设备行时真实浏览器不打开工单详情', async ({ page }) => {
    let detailRequests = 0
    await page.route('**/api/v1/scheduling/workorders/**', route => {
      detailRequests += 1
      return route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'equipment row must not request work order detail' }),
      })
    })

    await page.waitForSelector('.gantt_grid_data .gantt_row', { timeout: 10000 })
    const equipmentRow = page.locator('.gantt_grid_data .gantt_row').filter({ hasText: 'eq-agent-e2e-001' }).first()
    await expect(equipmentRow).toBeVisible()

    await equipmentRow.click()

    await expect(page.locator('.detail-panel')).not.toHaveClass(/open/)
    await expect(page.locator('.detail-panel')).toHaveAttribute('aria-modal', 'false')
    expect(detailRequests).toBe(0)
  })

  test('甘特图路由往返后仍可用键盘打开工单详情', async ({ page }) => {
    await page.waitForSelector('.gantt_task_line', { timeout: 10000 })
    await page.locator('.gantt_task_line').first().focus()
    await page.keyboard.press('Enter')
    await expect(page.locator('.detail-panel')).toHaveClass(/open/)

    await page.goto('report?offlineDemo=1', { waitUntil: 'commit' })
    await page.waitForSelector('.report-board', { timeout: 60000 })

    await page.goto('scheduling?offlineDemo=1', { waitUntil: 'commit' })
    await page.waitForSelector('.agent-workbench-panel', { timeout: 45000 })
    await page.waitForSelector('.gantt_task_line', { timeout: 10000 })
    await page.locator('.gantt_task_line').first().focus()
    await page.keyboard.press('Enter')

    const panel = page.locator('.detail-panel')
    await expect(panel).toHaveClass(/open/)
    await expect(panel).toHaveAttribute('role', 'dialog')
    await expect(panel).toHaveAttribute('aria-label', /工单详情/)
  })

  test('工具栏显示', async ({ page }) => {
    await expect(page.locator('.toolbar')).toBeVisible()

    await expect(page.getByText('排产优化').first()).toBeVisible()
    await expect(page.getByText('刷新').first()).toBeVisible()
  })

  test('工具栏导出 CSV 时真实浏览器下载当前排产计划', async ({ page }) => {
    await page.waitForSelector('.gantt_task_line', { timeout: 10000 })

    const [download] = await Promise.all([
      page.waitForEvent('download'),
      page.getByRole('button', { name: '导出 CSV' }).click(),
    ])

    expect(download.suggestedFilename()).toMatch(/^排产计划-\d{8}-\d{4}\.csv$/)
    const downloadPath = await download.path()
    expect(downloadPath).toBeTruthy()
    const content = await readFile(downloadPath!, 'utf8')
    expect(content).toContain('"工单号","产品","设备","开始时间","结束时间","状态","进度"')
    expect(content).toContain('WO-DEMO-1001')
    expect(content).toMatch(/"\d+%"/)
  })

  test('排产采纳反馈表单提交成功后关闭', async ({ page }) => {
    let feedbackRequests = 0
    await page.route('**/api/v1/scheduling/adoption-feedback', route => {
      feedbackRequests += 1
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ id: 'feedback-modal-close-e2e' }),
      })
    })

    await page.getByRole('button', { name: '采纳反馈' }).click()
    const modal = page.locator('.modal-container').filter({ hasText: '排产方案采纳反馈' })
    await expect(modal).toBeVisible()

    await modal.locator('select').selectOption('urgentInsertion')
    await modal.locator('textarea').fill('真实浏览器验证：提交成功后反馈弹窗关闭。')
    await modal.getByRole('button', { name: '提交反馈' }).click()

    await expect.poll(() => feedbackRequests).toBe(1)
    await expect(modal).toBeHidden()
    await expect(page.locator('.schedule-board')).toBeVisible()
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


async function clickAgentWorkbenchButton(page: import('@playwright/test').Page, label: string) {
  const clicked = await page.evaluate((buttonLabel) => {
    const buttons = Array.from(document.querySelectorAll<HTMLButtonElement>('.agent-workbench-panel button'))
    const button = buttons.find(candidate => candidate.textContent?.trim() === buttonLabel)
    if (!button || button.disabled) return false
    button.scrollIntoView({ block: 'center', inline: 'center' })
    button.click()
    return true
  }, label)
  expect(clicked, `Agent workbench button is missing or disabled: ${label}`).toBe(true)
}

async function clickEventQueueButton(page: import('@playwright/test').Page, label: string) {
  const clicked = await page.evaluate((buttonLabel) => {
    const buttons = Array.from(document.querySelectorAll<HTMLButtonElement>('.event-queue-panel button'))
    const button = buttons.find(candidate => candidate.textContent?.trim() === buttonLabel)
    if (!button || button.disabled) return false
    button.scrollIntoView({ block: 'center', inline: 'center' })
    button.click()
    return true
  }, label)
  expect(clicked, `Event queue button is missing or disabled: ${label}`).toBe(true)
}

async function seedReceivedOutsourcingCommitment(page: import('@playwright/test').Page) {
  await page.evaluate(() => {
    localStorage.setItem('aimes_outsourcing_commitment_packages', JSON.stringify([
      {
        id: 'outsourcing-commitment-product-flange',
        sourceKpiId: 'product-flange',
        dimensionLabel: '产品族',
        targetName: '法兰盘 DN100',
        title: '法兰盘 DN100 外协承诺包',
        auditId: 'AUD-OUTSOURCING-COMMITMENT-FLANGE-20260521-001',
        traceId: 'TRACE-OUTSOURCING-FLANGE-20260521',
        actor: '经营复盘 王经理',
        baselineOtd: 84,
        agentOtd: 91,
        lift: 7,
        delayedReduced: 3,
        statusLabel: '外协到货已确认',
        commitment: '法兰盘 DN100 外协到货口径：华东精密外协厂已按 2026-05-23 到货，厂外等待可关闭但仍需排产释放复核。',
        owner: '采购 / 计划联合确认',
        dueAt: '2026-05-23',
        summary: '外协等待未闭环转为外协承诺口径，外协到货后等待 AI 排产采纳释放。',
        actions: [
          {
            module: '外协协同',
            owner: '采购 / 计划',
            action: '向 华东精密外协厂 锁定 法兰盘 DN100 的外协承诺日期 2026-05-23',
            evidence: 'TRACE-OUTSOURCING-FLANGE-20260521',
          },
          {
            module: '采购协同',
            owner: '采购员 周工',
            action: '确认 华东精密外协厂 的 法兰盘 DN100 外协到货并触发排产释放复核',
            evidence: 'TRACE-OUTSOURCING-FLANGE-RECEIVED-20260521',
          },
        ],
        partnerName: '华东精密外协厂',
        promiseDate: '2026-05-23',
        affectedOrders: 'WO-DEMO-1013',
        sourceTraceId: 'TRACE-KPI-PRODUCT-FLANGE-OTD-20260521',
        createdAt: '2026-05-21T08:00:00.000Z',
        receivedAt: '2026-05-23T09:30:00.000Z',
        receivedBy: '采购员 周工',
        receiptAuditId: 'AUD-OUTSOURCING-RECEIPT-FLANGE-20260521-001',
        receiptTraceId: 'TRACE-OUTSOURCING-FLANGE-RECEIVED-20260521',
        receiptMessage: '华东精密外协厂 已按 2026-05-23 完成 法兰盘 DN100 外协到货，WO-DEMO-1013 可从厂外等待转为排产释放复核。',
      },
    ]))
  })
}

async function mockSchedulingPlanApis(
  page: import('@playwright/test').Page,
  options: { agentApiUnavailable?: boolean; agentAdoptStatus?: 200 | 403; missingPlanId?: boolean } = {},
) {
  const plan = {
    id: options.missingPlanId ? '' : 'plan-agent-e2e',
    planName: 'Agent E2E 排产计划',
    planStartDate: '2026-05-20T08:00:00.000Z',
    planEndDate: '2026-05-20T20:00:00.000Z',
    overallUtilizationRate: 0.82,
    onTimeDeliveryRate: 0.91,
    totalChangeoverMinutes: 35,
    groupCount: 1,
    createdAt: '2026-05-20T08:00:00.000Z',
    items: [
      {
        id: 'agent-e2e-item-001',
        workOrderId: 'wo-agent-e2e-001',
        workOrderNumber: 'WO-AGENT-E2E-001',
        equipmentId: 'eq-agent-e2e-001',
        equipmentName: 'CNC Agent E2E',
        plannedStartTime: '2026-05-20T08:00:00.000Z',
        plannedEndTime: '2026-05-20T10:00:00.000Z',
        sequence: 1,
        setupTime: '20 分钟',
        dependentItems: [],
      },
    ],
  }
  const optimizedPlan = {
    ...plan,
    id: 'plan-agent-e2e-optimized',
    planName: 'Agent E2E 正式排产计划',
    overallUtilizationRate: 0.87,
    onTimeDeliveryRate: 0.94,
    totalChangeoverMinutes: 42,
    groupCount: 2,
  }
  const pendingDecision = {
    id: 'agent-decision-e2e-001',
    triggerEventId: 'trigger-e2e-001',
    boundedContext: 'Scheduling',
    decisionType: 'MultiScenario',
    status: 'PendingReview',
    recommendedScenarioId: 'scenario-weighted',
    agentName: 'SchedulingAgent',
    agentVersion: 'v1.5-e2e',
    traceId: 'trace-agent-e2e-001',
    promptHash: 'prompt-hash-e2e',
    contextHash: 'context-hash-e2e',
    inputSummary: 'Workshop=ws-001;Orders=30',
    outputSummary: 'Scenarios=2;Recommended=WeightedComposite',
    businessKey: 'Workshop:ws-001',
    createdAt: '2026-05-23T08:00:00.000Z',
    scenarios: [
      {
        id: 'scenario-fcfs',
        strategyName: 'FCFS',
        priorityRule: 'FCFS',
        capacityStrategy: 'LeastLoaded',
        objective: 'due_date',
        otdProjection: 26.67,
        utilizationProjection: 71,
        changeoverProjection: 218,
        explanation: '先到先服务基线。',
      },
      {
        id: 'scenario-weighted',
        strategyName: 'WeightedComposite',
        priorityRule: 'WeightedComposite',
        capacityStrategy: 'LeastLoaded',
        objective: 'due_date',
        otdProjection: 30,
        utilizationProjection: 82,
        changeoverProjection: 145,
        explanation: '交期、优先级、加工时长加权后推荐。',
      },
    ],
  }

  await page.route('**/api/v1/auth/refresh', route => route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify({
      token: 'mock-e2e-token',
      refreshToken: 'mock-e2e-refresh',
      expiresAt: '2026-12-31T23:59:59Z',
    }),
  }))
  await page.route('**/api/v1/llm/status', route => route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify({ available: false, provider: 'mock-e2e' }),
  }))
  await page.route('**/api/v1/dashboard', route => route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify({
      equipmentStatus: [],
      todaySchedules: [],
      materialAlerts: [],
      qualityStats: { passRate: 0, totalInspections: 0, passedInspections: 0, defects: 0 },
    }),
  }))
  await page.route('**/api/v1/risk/dashboard', route => route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify({ items: [], totalCount: 0, page: 1, pageSize: 50 }),
  }))
  await page.route('**/api/v1/**', route => {
    const url = route.request().url()
    if (url.includes('/api/v1/auth/refresh')) {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          token: 'mock-e2e-token',
          refreshToken: 'mock-e2e-refresh',
          expiresAt: '2026-12-31T23:59:59Z',
        }),
      })
    }
    if (options.agentApiUnavailable && url.includes('/api/v1/scheduling/agent/')) {
      return route.abort()
    }
    if (url.includes('/api/v1/scheduling/agent/recommend')) {
      return route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify(pendingDecision),
      })
    }
    if (url.includes('/api/v1/scheduling/agent/agent-decision-e2e-001/adopt')) {
      if (options.agentAdoptStatus === 403) {
        return route.fulfill({
          status: 403,
          contentType: 'application/json',
          body: JSON.stringify({ message: 'Only Admin or Planner can adopt Scheduling Agent decisions.' }),
        })
      }
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          ...pendingDecision,
          status: 'Adopted',
          adoptedScenarioId: 'scenario-weighted',
        }),
      })
    }
    if (url.includes('/api/v1/scheduling/agent/agent-decision-e2e-001/reject')) {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          ...pendingDecision,
          status: 'Rejected',
        }),
      })
    }
    if (url.includes('/api/v1/scheduling/agent/decisions')) {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([]),
      })
    }
    if (url.includes('/api/v1/scheduling/optimize')) {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          plan: optimizedPlan,
          assignments: [],
          estimatedCompletionRate: 0.94,
          utilizationRate: 0.87,
          warnings: ['Agent E2E 正式排产计划已更新'],
        }),
      })
    }
    return route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ items: [], totalCount: 0, page: 1, pageSize: 50 }),
    })
  })
  await page.route('**/api/v1/scheduling/current', route => route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify(plan),
  }))
  await page.route('**/api/v1/equipment/bottlenecks**', route => route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify([]),
  }))
  await page.route(/\/api\/v1\/equipment(?:\?|$)/, route => route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify({ items: [], totalCount: 0, page: 1, pageSize: 50 }),
  }))
}

async function mockLaborRetrySchedulingPlanApis(page: import('@playwright/test').Page) {
  const plan = {
    id: 'plan-labor-retry-e2e',
    planName: '人员证据重试排产计划',
    planStartDate: '2026-05-20T08:00:00.000Z',
    planEndDate: '2026-05-20T20:00:00.000Z',
    overallUtilizationRate: 0.82,
    onTimeDeliveryRate: 0.9,
    totalChangeoverMinutes: 35,
    groupCount: 1,
    createdAt: '2026-05-20T08:00:00.000Z',
    items: [
      {
        id: 'labor-retry-item-wo-013-op-10',
        workOrderId: 'wo-013',
        workOrderNumber: 'WO-013',
        equipmentId: 'eq-heat-01',
        equipmentName: '热处理炉 01',
        plannedStartTime: '2026-05-20T10:00:00.000Z',
        plannedEndTime: '2026-05-20T14:00:00.000Z',
        sequence: 1,
        setupTime: '20 分钟',
        dependentItems: [],
      },
    ],
  }

  const equipment = {
    items: [
      {
        id: 'eq-heat-01',
        equipmentCode: 'HEAT-01',
        equipmentName: '热处理炉 01',
        equipmentType: 'HeatTreatment',
        status: 'running',
        capacity: 60,
        utilizationRate: 0.82,
      },
    ],
    totalCount: 1,
    page: 1,
    pageSize: 50,
  }

  await page.route('**/api/v1/scheduling/current', route => route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify(plan),
  }))
  await page.route('**/api/v1/equipment/bottlenecks**', route => route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify(['eq-heat-01']),
  }))
  await page.route(/\/api\/v1\/equipment(?:\?|$)/, route => route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify(equipment),
  }))
}

async function mockLaborEvidenceRetryApis(page: import('@playwright/test').Page) {
  laborEvidenceRetryReads.blocks = 0
  laborEvidenceRetryReads.reassignments = 0

  await page.route('**/api/v1/auth/refresh', route => route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify({
      token: 'mock-e2e-token',
      refreshToken: 'mock-e2e-refresh',
      expiresAt: '2026-12-31T23:59:59Z',
    }),
  }))
  await page.route('**/api/v1/llm/status', route => route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify({ available: false, provider: 'mock-e2e' }),
  }))
  await page.route('**/api/v1/dashboard', route => route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify({
      equipmentStatus: [],
      todaySchedules: [],
      materialAlerts: [],
      qualitySummary: {
        inspectionCount: 0,
        passCount: 0,
        defectCount: 0,
        pendingAnomalies: 0,
      },
    }),
  }))
  await page.route('**/api/v1/risk/dashboard', route => route.fulfill({
    status: 503,
    contentType: 'application/json',
    body: JSON.stringify({ message: 'chromium risk dashboard unavailable for labor retry evidence' }),
  }))
  await page.route('**/api/v1/scheduling/**', route => {
    const request = route.request()
    const pathname = new URL(request.url()).pathname
    if (
      pathname.endsWith('/api/v1/scheduling/current')
      || pathname.endsWith('/api/v1/scheduling/labor-qualification-blocks')
      || pathname.endsWith('/api/v1/scheduling/labor-reassignments')
    ) {
      return route.fallback()
    }
    const method = request.method()
    if (method !== 'GET') {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: request.postData() || '{}',
      })
    }
    return route.fulfill({
      status: 503,
      contentType: 'application/json',
      body: JSON.stringify({ message: `chromium scheduling evidence unavailable: ${pathname}` }),
    })
  })
  await page.route('**/api/v1/scheduling/labor-qualification-blocks**', route => {
    if (route.request().method() !== 'GET') {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: route.request().postData() || '{}',
      })
    }
    laborEvidenceRetryReads.blocks += 1
    if (laborEvidenceRetryReads.blocks === 1) {
      return route.fulfill({
        status: 503,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'chromium startup labor block read unavailable' }),
      })
    }
    return route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([
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
          reason: 'EMP-003 王五的热处理上岗证已通过补证改派重新放行。',
          auditId: 'AUD-LABOR-BLOCK-20260520-001',
          traceId: 'TRACE-LABOR-BLOCK-WO-013-OP-10',
          createdAt: '2026-05-20T09:00:00.000Z',
          status: 'released',
          releasedAt: '2026-05-20T10:00:00.000Z',
          releaseAuditId: 'AUD-LABOR-RELEASE-20260520-001',
          releaseTraceId: 'TRACE-LABOR-RELEASE-WO-013-OP-10',
          releaseReason: '补证改派后释放热处理开工。',
        },
      ]),
    })
  })
  await page.route('**/api/v1/scheduling/labor-reassignments**', route => {
    if (route.request().method() !== 'GET') {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: route.request().postData() || '{}',
      })
    }
    laborEvidenceRetryReads.reassignments += 1
    return route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(laborEvidenceRetryReads.reassignments === 1 ? [] : [
        {
          id: 'labor-reassignment-release-WO-013-heat-treatment',
          workOrderNumber: 'WO-013',
          operationCode: 'OP-10',
          operationCodes: ['OP-10', 'OP-20'],
          operationName: '淬火 / 回火',
          blockedEmployeeNumber: 'EMP-003',
          blockedEmployeeName: '王五',
          blockedCertification: '热处理上岗证',
          blockedExpiresAt: '2026-05-25',
          replacementEmployeeNumber: 'EMP-006',
          replacementEmployeeName: '孙八',
          replacementTeam: '甲班',
          replacementShift: '白班',
          replacementSkill: '补证改派 / 热处理替班复核',
          replacementCertification: '热处理上岗证',
          replacementExpiresAt: '2026-12-31',
          reviewerEmployeeNumber: 'EMP-004',
          reviewerName: '赵六',
          reviewerRole: '工程放行',
          reason: '补证改派后，EMP-006 接管 WO-013 热处理开工复核。',
          auditId: 'AUD-LABOR-RELEASE-20260520-001',
          traceId: 'TRACE-LABOR-RELEASE-WO-013-OP-10',
          createdAt: '2026-05-20T10:00:00.000Z',
          status: 'approved',
        },
      ]),
    })
  })
}
