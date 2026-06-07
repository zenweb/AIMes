import { test, expect, type Page } from '@playwright/test'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const REPORT_PATH = resolve(process.cwd(), 'public', 'reports', 'latest-ab-report.json')

interface LatestAbReport {
  baseline: { otd: number }
  agent: { otd: number }
  delta: { otd: number }
  confidence: { pValue: number }
}

const latestAbReport = JSON.parse(readFileSync(REPORT_PATH, 'utf8')) as LatestAbReport
const expectedBaselineOtd = formatPercent(latestAbReport.baseline.otd)
const expectedAgentOtd = formatPercent(latestAbReport.agent.otd)
const expectedOtdDelta = formatPoint(latestAbReport.delta.otd)
const expectedPValue = latestAbReport.confidence.pValue.toString()

function formatPercent(value: number) {
  return `${(value * 100).toFixed(1)}%`
}

function formatPoint(value: number) {
  return `${(value * 100).toFixed(1)}`
}

test.describe.configure({ timeout: 90000 })

test.describe('5 分钟 Demo 主链路 Smoke', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('aimes_token', 'mock-demo-smoke-token')
      localStorage.setItem(
        'aimes_user',
        JSON.stringify({ username: 'admin', displayName: '管理员', role: 'Admin', mustChangePassword: false }),
      )
    })
  })

  test('Dashboard -> Scheduling -> Audit -> Report 可回放', async ({ page }) => {
    await mockAgentApi(page)

    await page.goto('dashboard', { waitUntil: 'commit' })
    await page.waitForSelector('.command-center', { timeout: 30000 })
    const commandCenter = page.locator('.command-center')
    await expect(commandCenter.getByText('AI MES 指挥中心')).toBeVisible()
    await expect(commandCenter.locator('.otd-summary')).toContainText(`${expectedBaselineOtd} -> ${expectedAgentOtd}`)
    await expect(commandCenter.locator('.otd-summary')).toContainText(`+${expectedOtdDelta}pt`)

    await commandCenter.getByRole('link', { name: '进入 AI 排产' }).click()
    await page.waitForSelector('.agent-workbench-panel', { timeout: 45000 })
    const workbench = page.locator('.agent-workbench-panel')
    await expect(workbench.getByText('工单池、方案、解释与执行追踪')).toBeVisible()
    await workbench.getByRole('button', { name: '生成后端建议' }).click()
    await expect(workbench.getByText('后端已生成 2 个方案，推荐 WeightedComposite。')).toBeVisible()
    await workbench.getByRole('button', { name: '采纳推荐' }).click()
    await expect(workbench.getByText('推荐方案已采纳，后端已写入 Agent action、审计和采纳反馈。')).toBeVisible()

    await page.evaluate(() => localStorage.setItem('aimes_offline_demo', 'true'))
    await page.goto('audit-logs', { waitUntil: 'commit' })
    await page.waitForSelector('.audit-board', { timeout: 30000 })
    const auditPanel = page.locator('.audit-replay-panel')
    await expect(auditPanel.getByText('建议、采纳、重排动作与配置审批可回放')).toBeVisible()
    const rushCard = auditPanel.locator('.decision-card').filter({ hasText: 'WO-RUSH-9001 急单插入重排建议' })
    await expect(rushCard).toBeVisible()
    await rushCard.getByRole('button', { name: '回放决策链' }).click()
    await expect(auditPanel.locator('.replay-detail').getByText('TRACE-SCH-20260520-001')).toBeVisible()

    await page.goto('report', { waitUntil: 'commit' })
    await page.waitForSelector('.report-board', { timeout: 60000 })
    const reportSection = page.locator('.otd-report-section')
    await expect(reportSection.getByRole('heading', { name: 'OTD 改善复盘报告' })).toBeVisible()
    await expect(reportSection).toContainText(`+${expectedOtdDelta}%`)
    await expect(reportSection).toContainText(expectedBaselineOtd)
    await expect(reportSection).toContainText(expectedAgentOtd)
    await expect(reportSection).toContainText(`p=${expectedPValue}`)
    await expect(reportSection.getByText('5 分钟 Demo 路径')).toBeVisible()
    await expect(reportSection.getByText('报表中心导出 OTD 改善复盘报告')).toBeVisible()
  })
})

async function mockAgentApi(page: Page) {
  await page.addInitScript(() => localStorage.setItem('aimes_offline_demo', 'false'))

  const pendingDecision = {
    id: 'agent-decision-demo-smoke-001',
    triggerEventId: 'trigger-demo-smoke-001',
    boundedContext: 'Scheduling',
    decisionType: 'MultiScenario',
    status: 'PendingReview',
    recommendedScenarioId: 'scenario-weighted',
    agentName: 'SchedulingAgent',
    agentVersion: 'v1.5-demo-smoke',
    traceId: 'trace-agent-demo-smoke-001',
    promptHash: 'prompt-hash-demo-smoke',
    contextHash: 'context-hash-demo-smoke',
    inputSummary: 'Workshop=ws-001;Orders=30',
    outputSummary: 'Scenarios=2;Recommended=WeightedComposite',
    businessKey: 'Workshop:ws-001',
    createdAt: '2026-05-25T12:00:00.000Z',
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

  await page.route('**/api/v1/scheduling/agent/decisions**', route => route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify([]),
  }))
  await page.route('**/api/v1/scheduling/agent/recommend', route => route.fulfill({
    status: 201,
    contentType: 'application/json',
    body: JSON.stringify(pendingDecision),
  }))
  await page.route('**/api/v1/scheduling/agent/agent-decision-demo-smoke-001/adopt', route => route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify({
      ...pendingDecision,
      status: 'Adopted',
      adoptedScenarioId: 'scenario-weighted',
    }),
  }))
}
