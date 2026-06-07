import { test, expect } from '@playwright/test'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

interface LatestAbReport {
  baseline: { otd: number }
  agent: { otd: number }
}

const latestAbReport = JSON.parse(
  readFileSync(resolve(process.cwd(), 'public', 'reports', 'latest-ab-report.json'), 'utf8'),
) as LatestAbReport
const expectedOtdRange = `${formatPercent(latestAbReport.baseline.otd)} -> ${formatPercent(latestAbReport.agent.otd)}`

function formatPercent(value: number) {
  return `${(value * 100).toFixed(1)}%`
}

test.describe('Dashboard 生产概览', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('aimes_token', 'mock-e2e-token')
      localStorage.setItem('aimes_user', JSON.stringify({ username: 'admin', displayName: '管理员', role: 'Admin', mustChangePassword: false }))
    })
    await page.goto('dashboard')
    await expect(page.locator('.command-center')).toBeVisible()
  })

  test('页面标题显示正确', async ({ page }) => {
    await expect(page).toHaveTitle(/AIMes/)
  })

  test('KPI 指标卡片渲染', async ({ page }) => {
    await expect(page.locator('.kpi-card')).toHaveCount(4)
  })

  test('AI MES 指挥中心串联主线动作', async ({ page }) => {
    const panel = page.locator('.command-center')
    await expect(panel.getByText('AI MES 指挥中心')).toBeVisible()
    await expect(panel.getByText(expectedOtdRange)).toBeVisible()
    const stepTitles = panel.locator('.command-card strong')
    await expect(stepTitles).toContainText(['风险识别', 'Agent 重排', '采购协同', '生产执行', 'OTD 复盘'])
    await expect(panel.getByText('M-AL-6061 缺 12 件')).toBeVisible()
    await expect(panel.getByText('WO-RUSH-9001 加班插入')).toBeVisible()

    await panel.getByRole('link', { name: '进入 AI 排产' }).click()
    await expect(page).toHaveURL(/\/scheduling\/scheduling$/)
  })

  test('展示 5 分钟 Demo 录制运行手册', async ({ page }) => {
    const runbook = page.locator('.demo-runbook')
    await expect(runbook.getByText('5 分钟 Demo 录制运行手册')).toBeVisible()
    await expect(runbook.locator('.recording-summary').getByText('05:00')).toBeVisible()
    await expect(runbook.getByText('5 个镜头 · 7 个验收证据')).toBeVisible()
    await expect(runbook.getByText('00:00-00:45')).toBeVisible()
    await expect(runbook.getByText('开场：老板问题')).toBeVisible()
    await expect(runbook.getByText('风险：三类事件进入队列')).toBeVisible()
    await expect(runbook.getByText('Agent：生成重排建议')).toBeVisible()
    await expect(runbook.getByText('执行：采购与生产回写')).toBeVisible()
    await expect(runbook.getByText('复盘：POC 评分和缺口')).toBeVisible()
    await expect(runbook.locator('.evidence-tags').getByText('POC 97/100')).toBeVisible()
    await expect(runbook.getByText('录制报表与 CSV 导出')).toBeVisible()

    await runbook.getByRole('link', { name: /复盘：POC 评分和缺口/ }).click()
    await expect(page).toHaveURL(/\/scheduling\/report$/)
  })

  test('5 分钟 Demo 彩排确认进入报表证据链和审计回放', async ({ page }) => {
    const runbook = page.locator('.demo-runbook')
    await expect(runbook.getByText('确认 5 分钟 Demo 彩排')).toBeVisible()
    await runbook.getByRole('button', { name: '确认彩排并写入证据链' }).click()
    await expect(runbook.getByText('5 分钟 Demo 彩排已确认')).toBeVisible()
    await expect(runbook.getByText('TRACE-DEMO-RUNBOOK-20260521-REHEARSAL')).toBeVisible()

    await page.goto('report', { waitUntil: 'commit' })
    await page.waitForSelector('.report-board', { timeout: 60000 })
    const evidence = page.locator('.otd-evidence-chain .evidence-chain-card').filter({ hasText: '5 分钟 Demo 彩排已确认' })
    await expect(evidence.locator('.evidence-topline span').getByText('演示彩排', { exact: true })).toBeVisible()
    await expect(evidence.locator('code').getByText('TRACE-DEMO-RUNBOOK-20260521-REHEARSAL', { exact: true })).toBeVisible()

    await page.goto('audit-logs', { waitUntil: 'commit' })
    await page.waitForSelector('.audit-board', { timeout: 20000 })
    const replay = page.locator('.audit-replay-panel .decision-card').filter({ hasText: '演示彩排：5 分钟 Demo 彩排已确认' })
    await expect(replay).toBeVisible()
    await replay.getByRole('button', { name: '回放决策链' }).click()
    await expect(page.locator('.audit-replay-panel .replay-detail .detail-title span').getByText('TRACE-DEMO-RUNBOOK-20260521-REHEARSAL', { exact: true })).toBeVisible()
  })

  test('5 分钟 Demo 彩排证据写入失败时真实浏览器展示 fail-loud 且不伪造证据', async ({ page }) => {
    await page.evaluate(() => {
      localStorage.removeItem('aimes_otd_evidence_chain')
      const originalSetItem = Storage.prototype.setItem
      Storage.prototype.setItem = function setItemWithDemoRehearsalFailure(key: string, value: string) {
        if (key === 'aimes_otd_evidence_chain') {
          throw new Error('dashboard demo rehearsal evidence storage unavailable')
        }
        return originalSetItem.call(this, key, value)
      }
    })

    const runbook = page.locator('.demo-runbook')
    await runbook.getByRole('button', { name: '确认彩排并写入证据链' }).click()

    await expect(runbook.getByText('彩排证据写入失败')).toBeVisible()
    await expect(runbook.getByText('5 分钟 Demo 彩排尚未写入 OTD 证据链')).toBeVisible()
    await expect(runbook.getByText('dashboard demo rehearsal evidence storage unavailable')).toBeVisible()
    await expect(runbook.getByText('TRACE-DEMO-RUNBOOK-20260521-REHEARSAL')).toBeHidden()

    const rehearsalEvidence = await page.evaluate(() => {
      const records = JSON.parse(localStorage.getItem('aimes_otd_evidence_chain') || '[]') as Array<{ id?: string }>
      return records.find(record => record.id === 'demo-rehearsal-20260521') ?? null
    })
    expect(rehearsalEvidence).toBeNull()
  })

  test('设备状态列表', async ({ page }) => {
    await expect(page.getByText(/运行\s+\d+/)).toBeVisible()
  })

  test('今日排产任务', async ({ page }) => {
    await expect(page.getByText('今日暂无排产任务')).toBeVisible()
  })

  test('物料预警区域', async ({ page }) => {
    await expect(page.getByText('所有物料库存充足')).toBeVisible()
  })

  test('顶部导航包含所有模块', async ({ page }) => {
    const navLinks = page.locator('.side-link')
    const count = await navLinks.count()
    expect(count).toBeGreaterThan(5)
    await expect(navLinks.first()).toHaveText('生产概览')
  })
})

test.describe('Dashboard 生产概览失败态', () => {
  test('A/B 报告读取失败时显示默认 OTD 值来源提示', async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('aimes_token', 'mock-e2e-token')
      localStorage.setItem('aimes_user', JSON.stringify({ username: 'admin', displayName: '管理员', role: 'Admin', mustChangePassword: false }))
    })
    await page.route('**/reports/latest-ab-report.json', async route => {
      await route.fulfill({
        status: 404,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'latest A/B report missing from chromium' }),
      })
    })

    await page.goto('dashboard')

    const alert = page.getByRole('region', { name: 'A/B 报告读取失败' })
    await expect(page.getByRole('heading', { name: '生产运营控制塔' })).toBeVisible()
    await expect(page.getByText('26.7% -> 30.0%').first()).toBeVisible()
    await expect(alert.getByRole('heading', { name: 'A/B 报告读取失败' })).toBeVisible()
    await expect(alert.getByText('OTD 改善暂用默认演示值')).toBeVisible()
    await expect(alert.getByText('latest A/B report HTTP 404')).toBeVisible()
  })

  test('后端生产概览数据读取失败时显示 fail-loud 提示', async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('aimes_token', 'mock-e2e-token')
      localStorage.setItem('aimes_user', JSON.stringify({ username: 'admin', displayName: '管理员', role: 'Admin', mustChangePassword: false }))
      localStorage.setItem('aimes_offline_demo', 'false')
    })
    await page.route('**/api/v1/dashboard', async route => {
      await route.fulfill({
        status: 503,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'dashboard backend unavailable from chromium' }),
      })
    })

    await page.goto('dashboard?offlineDemo=0')

    const alert = page.getByRole('region', { name: '生产概览数据读取失败' })
    await expect(page.getByRole('heading', { name: '生产运营控制塔' })).toBeVisible()
    await expect(alert.getByRole('heading', { name: '生产概览数据读取失败' })).toBeVisible()
    await expect(alert.getByText('KPI、设备状态、今日排产与物料预警暂未加载')).toBeVisible()
    await expect(alert.getByText('dashboard backend unavailable from chromium')).toBeVisible()
  })
})
