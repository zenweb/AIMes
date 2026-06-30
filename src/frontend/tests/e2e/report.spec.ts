import { test, expect, type Page } from '@playwright/test'
import { readFile } from 'node:fs/promises'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

test.describe.configure({ timeout: 90000 })

interface LatestAbReport {
  baseline: { otd: number }
  agent: { otd: number }
  delta: { otd: number; delayedOrdersReduced: number }
}

const latestAbReport = JSON.parse(
  readFileSync(resolve(process.cwd(), 'public', 'reports', 'latest-ab-report.json'), 'utf8'),
) as LatestAbReport
const expectedBaselineOtd = formatPercent(latestAbReport.baseline.otd)
const expectedAgentOtd = formatPercent(latestAbReport.agent.otd)
const expectedOtdDelta = formatPoint(latestAbReport.delta.otd)
const expectedDelayedOrdersReduced = `${latestAbReport.delta.delayedOrdersReduced} 单`

type CapturedCsvDownload = {
  filename: string
  text: string
}

function formatPercent(value: number) {
  return `${(value * 100).toFixed(1)}%`
}

function formatPoint(value: number) {
  return `${(value * 100).toFixed(1)}`
}

async function captureCsvDownload(page: Page, trigger: () => Promise<void>) {
  await page.evaluate(() => {
    const w = window as typeof window & {
      __aimesCsvDownloads?: Array<{ filename: string; text: string }>
      __aimesCsvBlobTextByUrl?: Record<string, Promise<string>>
      __aimesCsvDownloadHookInstalled?: boolean
    }
    w.__aimesCsvDownloads = []
    w.__aimesCsvBlobTextByUrl = {}
    if (w.__aimesCsvDownloadHookInstalled) return

    const originalCreateObjectURL = URL.createObjectURL.bind(URL)
    URL.createObjectURL = function createObjectURLWithCsvCapture(object: Blob | MediaSource) {
      const url = originalCreateObjectURL(object)
      if (object instanceof Blob && object.type.includes('text/csv')) {
        w.__aimesCsvBlobTextByUrl ??= {}
        w.__aimesCsvBlobTextByUrl[url] = object.text()
      }
      return url
    }

    const originalClick = HTMLAnchorElement.prototype.click
    HTMLAnchorElement.prototype.click = function clickWithCsvCapture() {
      if (this.download && this.href.startsWith('blob:')) {
        const filename = this.download
        const textPromise = w.__aimesCsvBlobTextByUrl?.[this.href] ?? fetch(this.href)
          .then(response => response.text())
        void textPromise
          .then(text => {
            w.__aimesCsvDownloads?.push({ filename, text })
          })
        return
      }

      return originalClick.call(this)
    }
    w.__aimesCsvDownloadHookInstalled = true
  })

  await trigger()
  await expect.poll(
    async () => page.evaluate(() => {
      const w = window as typeof window & {
        __aimesCsvDownloads?: Array<{ filename: string; text: string }>
      }
      return w.__aimesCsvDownloads?.length ?? 0
    }),
    { timeout: 10000 },
  ).toBeGreaterThan(0)

  return await page.evaluate(() => {
    const w = window as typeof window & {
      __aimesCsvDownloads?: CapturedCsvDownload[]
    }
    return w.__aimesCsvDownloads?.at(-1)
      ?? { filename: '报表-00000000-0000.csv', text: '' }
  }) as CapturedCsvDownload
}

async function waitForReportExportReady(page: Page) {
  await expect(page.locator('.report-board section').filter({ hasText: '生产概况' }).getByText('工单总数')).toBeVisible({ timeout: 60000 })
  await expect(page.locator('.report-board section').filter({ hasText: '生产概况' }).locator('.num').first()).not.toBeEmpty({ timeout: 60000 })
}

test.describe('Report 报表中心', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('aimes_token', 'mock-e2e-token')
      localStorage.setItem('aimes_user', JSON.stringify({ username: 'admin', displayName: '管理员', role: 'Admin', mustChangePassword: false }))
    })
    await page.goto('report', { waitUntil: 'commit', timeout: 45000 })
    await page.waitForSelector('.report-board', { timeout: 60000 })
  })

  test('多源报表证据加载失败时真实浏览器展示单条聚合 fail-loud 告警', async ({ page }) => {
    await page.addInitScript(() => {
      const brokenKeys = new Set([
        'aimes_customer_order_import_evidence',
        'aimes_customer_equipment_fault_evidence',
        'aimes_otd_evidence_chain',
      ])
      const originalGetItem = Storage.prototype.getItem
      const originalRemoveItem = Storage.prototype.removeItem
      Storage.prototype.getItem = function getItem(key: string) {
        if (brokenKeys.has(key)) throw new Error(`report evidence local read unavailable: ${key}`)
        return originalGetItem.call(this, key)
      }
      Storage.prototype.removeItem = function removeItem(key: string) {
        if (brokenKeys.has(key)) throw new Error(`report evidence cleanup unavailable: ${key}`)
        return originalRemoveItem.call(this, key)
      }
    })
    await page.goto('report', { waitUntil: 'commit', timeout: 45000 })
    await page.waitForSelector('.report-board', { timeout: 60000 })

    const alerts = page.locator('.report-board [role="alert"]').filter({
      hasText: '报表证据加载失败',
    })
    await expect(alerts).toHaveCount(1, { timeout: 10000 })
    await expect(alerts.first()).toContainText('客户工单导入证据')
    await expect(alerts.first()).toContainText('客户设备故障证据')
    await expect(alerts.first()).toContainText('OTD 证据链')
    await expect(alerts.first()).toContainText('/api/v1/scheduling/customer-order-import/latest')
    await expect(alerts.first()).toContainText('aimes_customer_equipment_fault_evidence')
    await expect(alerts.first()).toContainText('aimes_otd_evidence_chain')
    await expect(page.locator('.report-board section').filter({ hasText: '生产概况' }).getByText('工单总数')).toBeVisible()
  })

  test('CSV 导出成功后仍保留报表证据加载 fail-loud 告警', async ({ page }) => {
    await page.addInitScript(() => {
      const originalGetItem = Storage.prototype.getItem
      const originalRemoveItem = Storage.prototype.removeItem
      Storage.prototype.getItem = function getItem(key: string) {
        if (key === 'aimes_customer_order_import_evidence') {
          throw new Error('report evidence local read unavailable after csv')
        }
        return originalGetItem.call(this, key)
      }
      Storage.prototype.removeItem = function removeItem(key: string) {
        if (key === 'aimes_customer_order_import_evidence') {
          throw new Error('report evidence cleanup unavailable after csv')
        }
        return originalRemoveItem.call(this, key)
      }
    })
    await page.goto('report', { waitUntil: 'commit', timeout: 45000 })
    await page.waitForSelector('.report-board', { timeout: 60000 })

    const alert = page.locator('.report-board [role="alert"]')
    await expect(alert).toContainText('报表证据加载失败')
    await expect(alert).toContainText('客户工单导入证据')

    const download = await captureCsvDownload(page, async () => {
      await page.getByRole('button', { name: 'CSV' }).click()
    })
    expect(download.text.replace(/\uFEFF/g, '')).toContain('OTD复盘')
    await expect(alert).toContainText('报表证据加载失败')
    await expect(alert).toContainText('客户工单导入证据')
    await expect(alert).toContainText('/api/v1/scheduling/customer-order-import/latest')
  })

  test('展示 OTD 改善复盘报告', async ({ page }) => {
    const panel = page.locator('.otd-report-section')

    await expect(panel.getByRole('heading', { name: 'OTD 改善复盘报告' })).toBeVisible()
    await expect(panel.locator('.dataset-badge').getByText('30 单演示数据集')).toBeVisible()
    await expect(panel.getByText(`+${expectedOtdDelta}%`)).toBeVisible()
    await expect(panel.locator('.otd-card.baseline').getByText('人工基线')).toBeVisible()
    await expect(panel.locator('.otd-card.baseline').getByText(expectedBaselineOtd)).toBeVisible()
    await expect(panel.locator('.otd-card.agent').getByText('Agent 推荐')).toBeVisible()
    await expect(panel.locator('.otd-card.agent').getByText(expectedAgentOtd)).toBeVisible()
    const reducedDelayMetric = panel.locator('.metric-tile').filter({ hasText: '延期减少' })
    await expect(reducedDelayMetric.getByText('延期减少')).toBeVisible()
    await expect(reducedDelayMetric.getByText(expectedDelayedOrdersReduced)).toBeVisible()
    await expect(panel.locator('.reason-row strong').getByText('可重放基准')).toBeVisible()
    await expect(panel.getByText(/当前样本未达到 95% 显著性/)).toBeVisible()
    await expect(panel.getByText('OTD 复盘证据链')).toBeVisible()
    const evidenceChain = panel.locator('.otd-evidence-chain')
    await expect(evidenceChain.locator('.evidence-chain-card').filter({ hasText: '急单 / 缺料 / 设备健康进入风险队列' }).getByText('风险触发')).toBeVisible()
    const agentEvidence = evidenceChain.locator('.evidence-chain-card').filter({ hasText: '锁定期后插入 + 采购加急 + 瓶颈保护' })
    await expect(agentEvidence.getByText('Agent 建议')).toBeVisible()
    await expect(agentEvidence.getByText('TRACE-SCH-20260520-001')).toBeVisible()
  })

  test('OTD 证据链消费批量对比采纳 feedback snapshot', async ({ page }) => {
    await page.evaluate(() => {
      localStorage.setItem('aimes_schedule_feedback_snapshot', JSON.stringify({
        decision: 'accepted',
        decisionLabel: '已采纳批量对比方案',
        reasonCategory: 'batch_optimize_apply',
        categoryLabel: '批量对比采纳',
        reasonDetail: '从批量对比中选择此方案',
        objectiveLabel: '综合平衡',
        createdAt: '2026-06-14T10:30:00.000Z',
        traceId: 'TRACE-SCH-FEEDBACK-BATCH-balanced',
        agentDecisionId: 'decision-batch-balanced-001',
        source: 'local',
      }))
    })
    await page.reload({ waitUntil: 'commit' })
    await page.waitForSelector('.report-board', { timeout: 60000 })

    const evidenceChain = page.locator('.otd-evidence-chain')
    const scheduleEvidence = evidenceChain.locator('.evidence-chain-card').filter({ hasText: '已采纳批量对比方案' })
    await expect(scheduleEvidence.getByText('人工采纳')).toBeVisible()
    await expect(scheduleEvidence.getByText('批量对比采纳：从批量对比中选择此方案')).toBeVisible()
    await expect(scheduleEvidence.getByText('对象：综合平衡')).toBeVisible()
    await expect(scheduleEvidence.getByText('TRACE-SCH-FEEDBACK-BATCH-balanced')).toBeVisible()

    await scheduleEvidence.click()
    const detail = page.locator('.drilldown-detail')
    await expect(detail.getByText('批量对比采纳是否已进入 OTD 复盘？')).toBeVisible()
    await expect(detail.getByText('decision-batch-balanced-001')).toBeVisible()
    await expect(detail.getByText('在AI 排产核对批量对比采纳记录，确认目标、原因、traceId 和 Agent 决策证据 是否已同步到 OTD 证据链。')).toBeVisible()
    await expect(page.getByText('本地采纳证据随 CSV 导出；Excel/PDF 为后端报表快照。')).toBeVisible()

    const download = await captureCsvDownload(page, async () => {
      await page.getByRole('button', { name: 'CSV' }).click()
    })
    const csv = download.text.replace(/\uFEFF/g, '')
    expect(csv).toContain('OTD经营钻取')
    expect(csv).toContain('人工采纳 / 批量对比采纳是否已进入 OTD 复盘？')
    expect(csv).toContain('在AI 排产核对批量对比采纳记录，确认目标、原因、traceId 和 Agent 决策证据 是否已同步到 OTD 证据链。')
    expect(csv).toContain('TRACE-SCH-FEEDBACK-BATCH-balanced')
    expect(csv).toContain('decision-batch-balanced-001')

    await page.getByRole('button', { name: 'Excel' }).click()
    await expect(page.locator('.report-board [role="alert"]')).toContainText('报表 Excel 已请求后端快照导出；本地批量采纳证据请使用 CSV 导出。')
  })
  test('OTD 经营复盘支持按证据钻取解释和跳转', async ({ page }) => {
    await page.evaluate(() => {
      localStorage.setItem('aimes_otd_evidence_chain', JSON.stringify([
        {
          id: 'purchase-receipt-PO-RUSH-20260519',
          stage: '采购回写',
          title: 'M-AL-6061 加急采购收货已释放缺料风险',
          summary: 'PO-RUSH-20260519 收货完成，WO-RUSH-9001 / WO-DEMO-1002 的齐套缺口清零。',
          object: 'WO-RUSH-9001 / WO-DEMO-1002',
          source: '采购协同 / 华东铝材快供',
          traceId: 'PO-RUSH-20260519',
          status: 'closed',
          statusLabel: '已收货',
          createdAt: '2026-05-20T10:05:00.000Z',
        },
      ]))
    })
    await page.reload({ waitUntil: 'commit' })
    await page.waitForSelector('.report-board', { timeout: 60000 })

    const panel = page.locator('.otd-drilldown-panel')
    await expect(panel.getByRole('heading', { name: '经营复盘钻取' })).toBeVisible()
    await expect(panel.getByText(/条已闭环/)).toBeVisible()
    await expect(panel.getByRole('button', { name: /Agent 推荐为什么能提升 OTD/ })).toBeVisible()
    await expect(panel.locator('.drilldown-detail').getByText('已解释，可作为采纳证据')).toBeVisible()

    await panel.getByRole('button', { name: /缺料风险是否已被采购承诺消除/ }).click()
    const detail = panel.locator('.drilldown-detail')
    await expect(detail.getByRole('heading', { name: 'M-AL-6061 加急采购收货已释放缺料风险' })).toBeVisible()
    await expect(detail.getByText('采购协同').first()).toBeVisible()
    await expect(detail.locator('.drilldown-detail-grid strong').getByText('华东铝材快供', { exact: true })).toBeVisible()
    await expect(detail.getByText('已闭环，进入复盘口径')).toBeVisible()
    await expect(detail.getByText('在采购协同核对归档结果，确认复盘证据是否完整。')).toBeVisible()

    await detail.getByRole('link', { name: '打开采购协同' }).click()
    await expect(page).toHaveURL(/\/scheduling\/purchase$/)
  })

  test('OTD KPI 支持按客户、产线、产品族和时间窗口钻取', async ({ page }) => {
    const panel = page.locator('.otd-kpi-drilldown-panel')

    await expect(panel.getByRole('heading', { name: 'OTD KPI 多维钻取' })).toBeVisible()
    await expect(panel.getByText(/6 个已恢复 \/ 2 个仍有风险 \/ 平均提升 14%/)).toBeVisible()
    const huadongCard = panel.locator('.kpi-drilldown-card').filter({ hasText: '华东新能源' })
    await expect(huadongCard.getByText('华东新能源', { exact: true })).toBeVisible()
    await expect(huadongCard.getByText('基线 76%')).toBeVisible()
    await expect(huadongCard.getByText('Agent 94%')).toBeVisible()
    const detail = panel.locator('.kpi-drilldown-detail')
    await expect(detail.getByRole('heading', { name: '华东新能源 OTD 差异解释' })).toBeVisible()
    await expect(detail.getByText('急单插入 + M-AL-6061 缺料')).toBeVisible()
    await expect(detail.getByText('TRACE-KPI-CUSTOMER-HUADONG-OTD-20260521')).toBeVisible()

    await panel.getByRole('tab', { name: '产线' }).click()
    await expect(panel.locator('.kpi-drilldown-card').filter({ hasText: 'CNC 精加工线' }).getByText('CNC 精加工线', { exact: true })).toBeVisible()
    await panel.getByRole('button', { name: /装配复检线/ }).click()
    await expect(detail.getByRole('heading', { name: '装配复检线 OTD 差异解释' })).toBeVisible()
    await expect(detail.getByText('扫码返工释放 OP-20 接收')).toBeVisible()
    await expect(detail.getByText('TRACE-KPI-LINE-ASM-OTD-20260521')).toBeVisible()

    await panel.getByRole('tab', { name: '产品族' }).click()
    await panel.getByRole('button', { name: /法兰盘 DN100/ }).click()
    await expect(detail.getByRole('heading', { name: '法兰盘 DN100 OTD 差异解释' })).toBeVisible()
    await expect(detail.getByText('仍延期')).toBeVisible()
    await expect(detail.getByText('外协等待未闭环')).toBeVisible()

    await panel.getByRole('tab', { name: '时间窗口' }).click()
    await panel.getByRole('button', { name: /本周交付窗口/ }).click()
    await expect(detail.getByRole('heading', { name: '本周交付窗口 OTD 差异解释' })).toBeVisible()
    await expect(detail.getByText('周窗口达标')).toBeVisible()
    await expect(detail.getByText('TRACE-KPI-TIME-WEEK-OTD-20260521')).toBeVisible()

    await waitForReportExportReady(page)
    const download = await captureCsvDownload(page, async () => {
      await page.evaluate(() => {
        document.querySelector<HTMLButtonElement>('.report-board .btn-export')?.click()
      })
    })
    const csv = download.text
    expect(csv).toContain('OTD KPI多维钻取')
    expect(csv).toContain('客户 / 华东新能源')
    expect(csv).toContain('基线 76% / Agent 94% / 提升 +18% / 延期减少 3 单 / 已恢复')
    expect(csv).toContain('TRACE-KPI-LINE-ASM-OTD-20260521')
    expect(csv).toContain('法兰盘 DN100 主因')
    expect(csv).toContain('本周交付窗口 下一步')
  })

  test('OTD KPI 可生成客户交付恢复承诺包并进入助手与审计', async ({ page }) => {
    const panel = page.locator('.otd-kpi-drilldown-panel')
    const detail = panel.locator('.kpi-drilldown-detail')

    await panel.getByRole('button', { name: '生成客户交付恢复承诺包' }).click()
    await expect(detail.getByText('华东新能源 交付恢复承诺包')).toBeVisible()
    await expect(detail.getByText('AUD-KPI-COMMITMENT-HUADONG-20260521-001')).toBeVisible()
    await expect(detail.getByText('TRACE-KPI-COMMITMENT-HUADONG-20260521')).toBeVisible()
    await expect(panel.getByRole('button', { name: '生成客户交付恢复承诺包' })).toBeDisabled()

    const evidenceChain = page.locator('.otd-evidence-chain')
    await expect(evidenceChain.getByText('客户承诺包')).toBeVisible()
    await expect(evidenceChain.getByText('华东新能源 交付恢复承诺包')).toBeVisible()

    await waitForReportExportReady(page)
    const download = await captureCsvDownload(page, async () => {
      await page.evaluate(() => {
        document.querySelector<HTMLButtonElement>('.report-board .btn-export')?.click()
      })
    })
    const csv = download.text
    expect(csv).toContain('客户交付恢复承诺包')
    expect(csv).toContain('华东新能源 交付恢复承诺包')
    expect(csv).toContain('AUD-KPI-COMMITMENT-HUADONG-20260521-001 / TRACE-KPI-COMMITMENT-HUADONG-20260521')

    await page.locator('.chat-fab').click()
    await page.locator('.chat-input').fill('客户交付承诺包的 OTD 恢复口径是什么？')
    await page.locator('.send-btn').click()
    const chat = page.locator('.chat-panel')
    await expect(chat.getByText('华东新能源 交付恢复承诺包 已生成。')).toBeVisible()
    await expect(chat.getByText(/Agent OTD 94%（基线 76%）/)).toBeVisible()
    await expect(chat.getByText(/AUD-KPI-COMMITMENT-HUADONG-20260521-001 \/ TRACE-KPI-COMMITMENT-HUADONG-20260521/)).toBeVisible()
    await chat.getByRole('button', { name: '关闭聊天' }).click()

    await page.goto('audit-logs', { waitUntil: 'commit' })
    await page.waitForSelector('.audit-board', { timeout: 20000 })
    const auditPanel = page.locator('.audit-replay-panel')
    const commitmentCard = auditPanel.locator('.decision-card').filter({ hasText: '客户承诺包：华东新能源 交付恢复承诺包' })
    await expect(commitmentCard).toBeVisible()
    await expect(commitmentCard.getByText('TRACE-KPI-COMMITMENT-HUADONG-20260521')).toBeVisible()
    await commitmentCard.getByRole('button', { name: '回放决策链' }).click()
    const replay = auditPanel.locator('.replay-detail')
    await expect(replay.getByText(/报表中心从 OTD KPI 多维钻取生成客户承诺包/)).toBeVisible()
    await expect(replay.getByText(/AI 生产助手可读取该承诺包回答客户交付恢复口径/)).toBeVisible()
    await expect(replay.getByText(/KPI 钻取、客户承诺、责任动作和报表导出已归档/)).toBeVisible()
  })

  test('OTD KPI 产品族外协等待可生成外协承诺包并进入排产与审计', async ({ page }) => {
    const panel = page.locator('.otd-kpi-drilldown-panel')
    const detail = panel.locator('.kpi-drilldown-detail')

    await panel.getByRole('tab', { name: '产品族' }).click()
    await panel.getByRole('button', { name: /法兰盘 DN100/ }).click()
    await expect(detail.getByRole('heading', { name: '法兰盘 DN100 OTD 差异解释' })).toBeVisible()
    await panel.getByRole('button', { name: '生成外协承诺包' }).click()
    await expect(detail.getByText('法兰盘 DN100 外协承诺包')).toBeVisible()
    await expect(detail.getByText('AUD-OUTSOURCING-COMMITMENT-FLANGE-20260521-001')).toBeVisible()
    await expect(detail.getByText('TRACE-OUTSOURCING-FLANGE-20260521')).toBeVisible()
    await expect(panel.getByRole('button', { name: '生成外协承诺包' })).toBeDisabled()

    const evidenceChain = page.locator('.otd-evidence-chain')
    await expect(evidenceChain.getByText('法兰盘 DN100 外协承诺包')).toBeVisible()
    await expect(evidenceChain.getByText('TRACE-OUTSOURCING-FLANGE-20260521', { exact: true })).toBeVisible()

    await page.goto('scheduling', { waitUntil: 'commit' })
    await page.waitForSelector('.schedule-board', { timeout: 60000 })
    await page.waitForSelector('.event-queue-panel .event-card', { timeout: 60000 })
    const eventQueue = page.locator('.event-queue-panel')
    await eventQueue.scrollIntoViewIfNeeded()
    const outsourcingEvent = eventQueue.locator('.event-card').filter({ hasText: '法兰盘 DN100 外协承诺已锁定' })
    await expect(outsourcingEvent.locator('.event-type').getByText('外协承诺', { exact: true })).toBeVisible()
    await expect(outsourcingEvent.locator('.event-severity').getByText('待到货', { exact: true })).toBeVisible()
    await expect(outsourcingEvent.getByText('TRACE-OUTSOURCING-FLANGE-20260521')).toBeVisible()
    await outsourcingEvent.getByRole('button', { name: '生成重排建议' }).click()
    await expect(page.locator('.agent-suggestion').getByText('外协承诺后的排产复核建议')).toBeVisible()
    await expect(page.locator('.agent-suggestion').getByText(/不将其计入厂内已恢复订单/)).toBeVisible()

    await page.goto('audit-logs', { waitUntil: 'commit' })
    await page.waitForSelector('.audit-board', { timeout: 60000 })
    const auditPanel = page.locator('.audit-replay-panel')
    const outsourcingCard = auditPanel.locator('.decision-card').filter({ hasText: '外协承诺包：法兰盘 DN100 外协承诺包' })
    await expect(outsourcingCard).toBeVisible()
    await outsourcingCard.getByRole('button', { name: '回放决策链' }).click()
    const replay = auditPanel.locator('.replay-detail')
    await expect(replay.getByText(/外协承诺、计划复核和厂外等待口径已归档/)).toBeVisible()
    await expect(replay.getByText(/不能把厂外等待误判为厂内恢复/)).toBeVisible()

    await page.goto('report', { waitUntil: 'commit' })
    await page.waitForSelector('.report-board', { timeout: 60000 })
    await waitForReportExportReady(page)
    const download = await captureCsvDownload(page, async () => {
      await page.evaluate(() => {
        const button = document.querySelector<HTMLButtonElement>('.report-board .btn-export')
        button?.click()
      })
    })
    const csv = download.text
    expect(csv).toContain('外协承诺包')
    expect(csv).toContain('法兰盘 DN100 外协承诺包')
    expect(csv).toContain('AUD-OUTSOURCING-COMMITMENT-FLANGE-20260521-001 / TRACE-OUTSOURCING-FLANGE-20260521')
  })

  test('展示 5 分钟 demo 路径与样本工单', async ({ page }) => {
    const panel = page.locator('.otd-report-section')

    await expect(panel.getByText('5 分钟 Demo 路径')).toBeVisible()
    await expect(panel.getByText('生产概览查看今日风险与物料状态')).toBeVisible()
    await expect(panel.getByText('报表中心导出 OTD 改善复盘报告')).toBeVisible()
    await expect(panel.getByText('30 单样本节选')).toBeVisible()
    await expect(panel.getByRole('cell', { name: 'WO-RUSH-9001' })).toBeVisible()
    await expect(panel.getByText('急单阀体组件')).toBeVisible()
    await expect(panel.getByText('加班插入 + 采购加急')).toBeVisible()
    await expect(panel.getByText('已恢复').first()).toBeVisible()
  })

  test('展示 POC 评估模板与售前 checklist', async ({ page }) => {
    const panel = page.locator('.poc-template-section')

    await expect(panel.getByRole('heading', { name: 'AI MES 交期改善 POC 评估模板' })).toBeVisible()
    await expect(panel.getByText('2 周 · 通过线 85 分')).toBeVisible()
    await expect(panel.getByText(/离散制造工厂/)).toBeVisible()
    await expect(panel.getByText('评分维度')).toBeVisible()
    await expect(panel.getByText('当前 POC 评分')).toBeVisible()
    await expect(panel.getByText('97 / 100')).toBeVisible()
    await expect(panel.getByText('达到通过线 · 通过线 85 分')).toBeVisible()
    await expect(panel.getByText('补齐缺口')).toBeVisible()
    await expect(panel.getByText(/客户真实设备故障数据接入后可补满 1 分/)).toBeVisible()
    await expect(panel.getByText(/客户真实工单导入样例未准备/).first()).toBeVisible()
    await expect(panel.locator('.poc-dimension strong').getByText('OTD 改善')).toBeVisible()
    await expect(panel.locator('.poc-dimension em').getByText('30 / 30 分')).toBeVisible()
    await expect(panel.locator('.poc-dimension strong').getByText('事件闭环')).toBeVisible()
    await expect(panel.getByRole('heading', { name: '验收证据' })).toBeVisible()
    await expect(panel.getByText('30 单演示数据集与 OTD 基线')).toBeVisible()
    const importEvidence = panel.locator('.evidence-row').filter({ hasText: '客户真实工单导入样例' })
    await expect(importEvidence).toBeVisible()
    await expect(importEvidence.getByText('待补充')).toBeVisible()
    const equipmentEvidence = panel.locator('.evidence-row').filter({ hasText: '客户真实设备故障数据' })
    await expect(equipmentEvidence).toBeVisible()
    await expect(equipmentEvidence.getByText('待补充')).toBeVisible()
    await expect(panel.getByRole('heading', { name: '售前 Demo Checklist' })).toBeVisible()
    await expect(panel.getByText('处理采购缺料')).toBeVisible()
    await expect(panel.getByText(/生成加急采购单、模拟收货、风险下降/)).toBeVisible()
  })

  test('客户真实工单导入样例补齐后回写 POC 证据', async ({ page }) => {
    const panel = page.locator('.poc-template-section')

    await expect(panel.getByText('97 / 100')).toBeVisible()
    await expect(panel.getByText(/客户真实工单导入样例未准备/).first()).toBeVisible()
    await panel.getByRole('link', { name: '准备导入样例' }).click()

    await expect(page).toHaveURL(/\/scheduling\/knowledge\/documents$/)
    const importPanel = page.locator('.customer-import-panel')
    await expect(importPanel.getByRole('heading', { name: '客户真实工单导入样例' })).toBeVisible()
    await importPanel.getByRole('button', { name: '生成客户工单导入样例' }).click()
    await expect(importPanel.getByText('IMP-POC-WO-20260520-001')).toBeVisible()
    await expect(importPanel.getByText('6 单高风险已识别')).toBeVisible()

    await page.goto('report', { waitUntil: 'commit' })
    const refreshedPanel = page.locator('.poc-template-section')
    await expect(refreshedPanel.getByText('99 / 100')).toBeVisible()
    await expect(refreshedPanel.locator('.customer-import-evidence')).toContainText('客户真实工单导入样例_30单.csv')
    const importEvidence = refreshedPanel.locator('.evidence-row').filter({ hasText: '客户真实工单导入样例' })
    await expect(importEvidence.getByText('已准备')).toBeVisible()
    await expect(importEvidence.getByText('客户 IT / 已导入')).toBeVisible()
    await expect(refreshedPanel.getByText(/客户真实工单导入样例未准备/)).not.toBeVisible()
  })

  test('客户真实设备故障数据补齐后回写 POC 事件闭环', async ({ page }) => {
    const panel = page.locator('.poc-template-section')

    await expect(panel.getByText('97 / 100')).toBeVisible()
    await expect(panel.getByText(/客户真实设备故障数据接入后可补满 1 分/)).toBeVisible()
    await panel.getByRole('link', { name: '准备设备故障样例' }).first().click()

    await expect(page).toHaveURL(/\/scheduling\/equipment$/)
    const customerPanel = page.locator('.customer-fault-panel')
    await expect(customerPanel.getByRole('heading', { name: '客户真实设备故障数据' })).toBeVisible()
    await customerPanel.getByRole('button', { name: '生成客户设备故障样例' }).click()
    await expect(customerPanel.getByText('IMP-POC-EQ-FAULT-20260520-001')).toBeVisible()
    await expect(customerPanel.getByText('4h 停机样例已映射')).toBeVisible()

    await page.goto('report', { waitUntil: 'commit' })
    const refreshedPanel = page.locator('.poc-template-section')
    await expect(refreshedPanel.getByText('98 / 100')).toBeVisible()
    await expect(refreshedPanel.locator('.customer-import-evidence.equipment')).toContainText('客户真实设备故障样例_CNC-001.csv')
    const eventDimension = refreshedPanel.locator('.poc-dimension').filter({ hasText: '事件闭环' })
    await expect(eventDimension.getByText('25 / 25 分')).toBeVisible()
    const equipmentEvidence = refreshedPanel.locator('.evidence-row').filter({ hasText: '客户真实设备故障数据' })
    await expect(equipmentEvidence.getByText('已准备')).toBeVisible()
    await expect(equipmentEvidence.getByText('设备维护 / 已导入')).toBeVisible()
    await expect(refreshedPanel.getByText(/客户真实设备故障数据接入后可补满 1 分/)).not.toBeVisible()
  })

  test('客户 POC 证据包齐套后展示完整复盘状态', async ({ page }) => {
    const panel = page.locator('.poc-template-section')

    await panel.getByRole('link', { name: '准备导入样例' }).click()
    const importPanel = page.locator('.customer-import-panel')
    await importPanel.getByRole('button', { name: '生成客户工单导入样例' }).click()
    await expect(importPanel.getByText('IMP-POC-WO-20260520-001')).toBeVisible()

    await page.goto('report', { waitUntil: 'commit' })
    await page.locator('.poc-template-section').getByRole('link', { name: '准备设备故障样例' }).first().click()
    const customerPanel = page.locator('.customer-fault-panel')
    await customerPanel.getByRole('button', { name: '生成客户设备故障样例' }).click()
    await expect(customerPanel.getByText('IMP-POC-EQ-FAULT-20260520-001')).toBeVisible()

    await page.goto('report', { waitUntil: 'commit' })
    const refreshedPanel = page.locator('.poc-template-section')
    await expect(refreshedPanel.locator('.poc-score-main').getByText('100 / 100')).toBeVisible()
    await expect(refreshedPanel.getByText('客户 POC 证据包齐套')).toBeVisible()
    await expect(refreshedPanel.getByText('工单导入 + 设备故障样例已联动完成')).toBeVisible()
    await expect(refreshedPanel.getByText('全部关键证据已准备')).toBeVisible()
    const packageMeta = refreshedPanel.locator('.poc-package-meta')
    await expect(packageMeta.getByText('IMP-POC-WO-20260520-001')).toBeVisible()
    await expect(packageMeta.getByText('IMP-POC-EQ-FAULT-20260520-001')).toBeVisible()
    await expect(refreshedPanel.getByText(/待补充/)).not.toBeVisible()

    await expect(refreshedPanel.getByText('生成客户 POC 复盘签署记录')).toBeVisible()
    await refreshedPanel.getByRole('button', { name: '生成 POC 复盘签署记录' }).click()
    await expect(refreshedPanel.getByText('POC 复盘已签署')).toBeVisible()
    await expect(refreshedPanel.getByText('POC-REVIEW-20260520-001')).toBeVisible()
    await expect(refreshedPanel.locator('.poc-review-meta').getByText('AUD-POC-REVIEW-20260520')).toBeVisible()
    const reviewEvidence = refreshedPanel.locator('.evidence-row').filter({ hasText: 'POC 复盘会评分表' })
    await expect(reviewEvidence.getByText('项目经理 / 已签署')).toBeVisible()
  })

  test('POC 复盘签署后生成上线交付行动包并进入助手治理审计', async ({ page }) => {
    const panel = page.locator('.poc-template-section')

    await panel.getByRole('link', { name: '准备导入样例' }).click()
    const customerImportPanel = page.getByRole('region', { name: '客户真实工单导入样例' })
    await customerImportPanel.getByRole('button', { name: '生成客户工单导入样例' }).click()
    await expect(customerImportPanel.getByText('IMP-POC-WO-20260520-001', { exact: true })).toBeVisible()

    await page.goto('report', { waitUntil: 'commit' })
    await page.locator('.poc-template-section').getByRole('link', { name: '准备设备故障样例' }).first().click()
    await page.locator('.customer-fault-panel').getByRole('button', { name: '生成客户设备故障样例' }).click()
    await expect(page.getByText('IMP-POC-EQ-FAULT-20260520-001', { exact: true })).toBeVisible()

    await page.goto('report', { waitUntil: 'commit' })
    const refreshedPanel = page.locator('.poc-template-section')
    await refreshedPanel.getByRole('button', { name: '生成 POC 复盘签署记录' }).click()
    await expect(refreshedPanel.getByText('POC 复盘已签署')).toBeVisible()
    await expect(refreshedPanel.getByText('生成 POC 成功转上线交付行动包')).toBeVisible()

    await refreshedPanel.getByRole('button', { name: '生成上线交付行动包' }).click()
    await expect(refreshedPanel.getByText('POC 成功转上线交付行动包')).toBeVisible()
    await expect(refreshedPanel.getByText('T+7 天完成试点上线准备，T+14 天进入首批真实工单运行')).toBeVisible()
    await expect(refreshedPanel.getByText('TRACE-POC-ROLLOUT-DELIVERY-PACKAGE-20260521')).toBeVisible()
    await expect(refreshedPanel.locator('.rollout-action-card').filter({ hasText: '数据接口' }).getByText('TRACE-POC-ROLLOUT-DATA-MAPPING-20260521')).toBeVisible()

    await expect(refreshedPanel.getByText('确认首批真实工单试点运行')).toBeVisible()
    await refreshedPanel.getByRole('button', { name: '确认试点运行闭环' }).click()
    await expect(refreshedPanel.getByText('POC 首批真实工单试点运行确认')).toBeVisible()
    await expect(refreshedPanel.getByText('PILOT-WO-BATCH-20260521-001')).toBeVisible()
    await expect(refreshedPanel.getByText('TRACE-POC-PILOT-RUN-CLOSED-20260521')).toBeVisible()
    await expect(refreshedPanel.locator('.pilot-workorder-card').filter({ hasText: 'WO-PILOT-2101' }).getByText('采纳 Agent 锁定期后插入建议')).toBeVisible()
    await expect(refreshedPanel.locator('.pilot-checkpoint-card').filter({ hasText: 'AI 排产' }).getByText('TRACE-POC-PILOT-SCHEDULE-20260521')).toBeVisible()

    await expect(refreshedPanel.getByRole('button', { name: '生成上线验收与 Hypercare 监控包' })).toBeVisible()
    await refreshedPanel.getByRole('button', { name: '生成上线验收与 Hypercare 监控包' }).click()
    await expect(refreshedPanel.getByText('POC 正式上线验收与 Hypercare 稳定运行监控包')).toBeVisible()
    await expect(refreshedPanel.getByText('Hypercare 7 天稳定运行中')).toBeVisible()
    await expect(refreshedPanel.getByText('TRACE-POC-HYPERCARE-ACCEPTANCE-20260521')).toBeVisible()
    await expect(refreshedPanel.locator('.hypercare-monitor-card').filter({ hasText: 'OTD 稳定性' }).getByText('97%')).toBeVisible()
    await expect(refreshedPanel.locator('.hypercare-monitor-card').filter({ hasText: '异常告警' }).getByText('0 个未关闭，1 个 P3 已派单')).toBeVisible()

    await waitForReportExportReady(page)
    const download = await captureCsvDownload(page, async () => {
      await page.evaluate(() => {
        document.querySelector<HTMLButtonElement>('.report-board .btn-export')?.click()
      })
    })
    const csv = download.text
    expect(csv).toContain('POC上线交付包')
    expect(csv).toContain('AUD-POC-ROLLOUT-20260521')
    expect(csv).toContain('TRACE-POC-ROLLOUT-DATA-MAPPING-20260521')
    expect(csv).toContain('POC试点运行')
    expect(csv).toContain('PILOT-WO-BATCH-20260521-001')
    expect(csv).toContain('TRACE-POC-PILOT-RUN-CLOSED-20260521')
    expect(csv).toContain('POCHypercare验收')
    expect(csv).toContain('AUD-POC-HYPERCARE-20260521 / TRACE-POC-HYPERCARE-ACCEPTANCE-20260521')
    expect(csv).toContain('POCHypercare指标')
    expect(csv).toContain('TRACE-POC-HYPERCARE-MONITORING-20260521')

    await page.locator('.chat-fab').click()
    await page.locator('.chat-input').fill('POC 上线交付行动包是什么？')
    await page.locator('.send-btn').click()
    const chat = page.locator('.chat-panel')
    await expect(chat.getByText('POC 成功转上线交付行动包 已生成。')).toBeVisible()
    await expect(chat.getByText(/T\+7 天完成试点上线准备/)).toBeVisible()
    await expect(chat.getByText(/AUD-POC-ROLLOUT-20260521/)).toBeVisible()
    await page.locator('.chat-input').fill('POC 首批真实工单试点运行情况？')
    await page.locator('.send-btn').click()
    await expect(chat.getByText('POC 首批真实工单试点运行确认 已闭环。')).toBeVisible()
    await expect(chat.getByText(/PILOT-WO-BATCH-20260521-001/)).toBeVisible()
    await expect(chat.getByText(/TRACE-POC-PILOT-RUN-CLOSED-20260521/)).toBeVisible()
    await page.locator('.chat-input').fill('POC Hypercare 上线验收情况？')
    await page.locator('.send-btn').click()
    await expect(chat.getByText('POC 正式上线验收与 Hypercare 稳定运行监控包 已进入运行。')).toBeVisible()
    await expect(chat.getByText(/P1\/P2 未关闭 0 个/)).toBeVisible()
    await expect(chat.getByText(/TRACE-POC-HYPERCARE-ACCEPTANCE-20260521/)).toBeVisible()

    await page.goto('dashboard', { waitUntil: 'commit' })
    await page.waitForSelector('.dashboard', { timeout: 60000 })
    const dashboardHypercare = page.locator('.hypercare-command')
    await expect(dashboardHypercare.getByText('POC 正式上线验收与 Hypercare 稳定运行监控包')).toBeVisible()
    await expect(dashboardHypercare.getByText('Hypercare 7 天稳定运行中')).toBeVisible()
    await expect(dashboardHypercare.getByText('P1/P2 未关闭', { exact: true })).toBeVisible()

    await page.goto('monitoring', { waitUntil: 'domcontentloaded' })
    await page.waitForSelector('.shopfloor-situation', { timeout: 60000 })
    const monitoringHypercare = page.locator('.hypercare-watch')
    await expect(monitoringHypercare.getByText('上线后稳定运行监控')).toBeVisible()
    await expect(monitoringHypercare.getByText('AUD-POC-HYPERCARE-20260521')).toBeVisible()
    await expect(monitoringHypercare.locator('.hypercare-watch-card').filter({ hasText: 'AI 建议采纳率' }).getByText('89%')).toBeVisible()

    await page.goto('admin', { waitUntil: 'commit' })
    await page.getByRole('tab', { name: 'Agent 治理' }).click()
    const adminPanel = page.locator('.agent-governance-panel')
    const rolloutGovernanceCard = adminPanel.locator('.poc-evidence-card.rollout')
    await expect(rolloutGovernanceCard.getByText('POC 上线交付')).toBeVisible()
    await expect(rolloutGovernanceCard.getByText('POC 成功转上线交付行动包')).toBeVisible()
    await expect(rolloutGovernanceCard.getByText('AUD-POC-ROLLOUT-20260521')).toBeVisible()
    const pilotGovernanceCard = adminPanel.locator('.poc-evidence-card.pilot')
    await expect(pilotGovernanceCard.getByText('POC 试点运行')).toBeVisible()
    await expect(pilotGovernanceCard.getByText('PILOT-WO-BATCH-20260521-001')).toBeVisible()
    await expect(pilotGovernanceCard.getByText('AUD-POC-PILOT-RUN-20260521')).toBeVisible()
    const hypercareGovernanceCard = adminPanel.locator('.poc-evidence-card.hypercare')
    await expect(hypercareGovernanceCard.getByText('POC Hypercare')).toBeVisible()
    await expect(hypercareGovernanceCard.getByText('AUD-POC-HYPERCARE-20260521')).toBeVisible()
    await expect(hypercareGovernanceCard.getByText(/OTD 97% \/ OEE 82% \/ P1P2 0/)).toBeVisible()

    await page.goto('scheduling', { waitUntil: 'commit' })
    await page.waitForSelector('.schedule-board', { timeout: 60000 })
    const pilotEvent = page.locator('.event-card').filter({ hasText: 'PILOT-WO-BATCH-20260521-001' })
    await expect(pilotEvent.getByText('POC 试点运行')).toBeVisible()
    await expect(pilotEvent.getByText('TRACE-POC-PILOT-RUN-CLOSED-20260521')).toBeVisible()
    await pilotEvent.getByRole('button', { name: '复核排产影响' }).click()
    await expect(page.locator('.agent-suggestion').getByText('POC 试点运行上线验收复核')).toBeVisible()

    await page.goto('production', { waitUntil: 'commit' })
    await page.waitForSelector('.production-board', { timeout: 60000 })
    const productionTrace = page.locator('.execution-trace-panel .trace-card').filter({ hasText: 'POC 首批真实工单试点运行确认' })
    await expect(productionTrace.getByText('POC 试点')).toBeVisible()
    await expect(productionTrace.getByText(/TRACE-POC-PILOT-PRODUCTION-20260521/)).toBeVisible()

    await page.goto('audit-logs', { waitUntil: 'commit' })
    await page.waitForSelector('.audit-board', { timeout: 20000 })
    const auditPanel = page.locator('.audit-replay-panel')
    const rolloutCard = auditPanel.locator('.decision-card').filter({ hasText: 'POC 上线交付包：POC 成功转上线交付行动包' })
    await expect(rolloutCard).toBeVisible()
    await expect(rolloutCard.locator('.decision-meta').getByText('证据：TRACE-POC-ROLLOUT-DELIVERY-PACKAGE-20260521')).toBeVisible()
    await rolloutCard.getByRole('button', { name: '回放决策链' }).click()
    await expect(auditPanel.locator('.replay-detail').getByText(/POC 上线交付包 阶段生成证据/)).toBeVisible()
    const pilotCard = auditPanel.locator('.decision-card').filter({ hasText: 'POC 试点运行：POC 首批真实工单试点运行确认' })
    await expect(pilotCard).toBeVisible()
    await expect(pilotCard.locator('.decision-meta').getByText('证据：TRACE-POC-PILOT-RUN-CLOSED-20260521')).toBeVisible()
    await pilotCard.getByRole('button', { name: '回放决策链' }).click()
    await expect(auditPanel.locator('.replay-detail').getByText(/POC 试点运行 阶段生成证据/)).toBeVisible()
    const hypercareCard = auditPanel.locator('.decision-card').filter({ hasText: 'POC 上线验收：POC 正式上线验收与 Hypercare 稳定运行监控包' })
    await expect(hypercareCard).toBeVisible()
    await expect(hypercareCard.locator('.decision-meta').getByText('证据：TRACE-POC-HYPERCARE-ACCEPTANCE-20260521')).toBeVisible()
    await hypercareCard.getByRole('button', { name: '回放决策链' }).click()
    await expect(auditPanel.locator('.replay-detail').getByText(/POC 上线验收 阶段生成证据/)).toBeVisible()
  })

  test('POC 复盘签署字段写入 CSV 导出', async ({ page }) => {
    await page.evaluate(() => {
      localStorage.setItem('aimes_poc_review_signoff', JSON.stringify({
        id: 'poc-review-signoff-20260520',
        meetingId: 'POC-REVIEW-20260520-001',
        targetCustomer: '离散制造工厂：多品种小批量、插单频繁、设备瓶颈明显',
        totalScore: 100,
        passScore: 85,
        result: 'approved',
        signedBy: '项目经理 / 客户代表',
        signedAt: '2026-05-20T11:20:00.000Z',
        reviewers: ['客户厂长', 'MES 项目经理', '调度主管', '设备主管'],
        evidenceBatches: ['IMP-POC-WO-20260520-001', 'IMP-POC-EQ-FAULT-20260520-001'],
        auditId: 'AUD-POC-REVIEW-20260520',
        summary: 'POC 评分 100 / 100，客户工单导入与设备故障样例证据齐套，达到 85 分通过线。',
      }))
      localStorage.setItem('aimes_otd_evidence_chain', JSON.stringify([
        {
          id: 'purchase-receipt-PO-RUSH-20260519',
          stage: '采购回写',
          title: 'M-AL-6061 加急采购收货已释放缺料风险',
          summary: 'PO-RUSH-20260519 收货完成，WO-RUSH-9001 / WO-DEMO-1002 的齐套缺口清零。',
          object: 'WO-RUSH-9001 / WO-DEMO-1002',
          source: '采购协同 / 华东铝材快供',
          traceId: 'PO-RUSH-20260519',
          status: 'closed',
          statusLabel: '已收货',
          createdAt: '2026-05-20T10:05:00.000Z',
        },
        {
          id: 'equipment-downtime-CNC-001',
          stage: '设备维护',
          title: 'CNC-001 停机窗口已同步重排',
          summary: '4h 停机影响 WO-2026-0042 / WO-RUSH-9001 / WO-DEMO-1001。',
          object: 'WO-2026-0042 / WO-RUSH-9001 / WO-DEMO-1001',
          source: '设备维护 / 瓶颈保护',
          traceId: 'TRACE-EQ-DOWNTIME-CNC-001',
          status: 'active',
          statusLabel: '待维护',
          createdAt: '2026-05-20T10:10:00.000Z',
        },
        {
          id: 'production-completion-op-020',
          stage: '生产完工',
          title: 'WO-DEMO-1001 CNC 精加工 完工回写',
          summary: '10 件完工，质检结果 Pass。',
          object: 'WO-DEMO-1001',
          source: '生产报工 / admin',
          traceId: 'TRACE-PROD-COMPLETE-OP-020',
          status: 'closed',
          statusLabel: 'OTD 达成',
          createdAt: '2026-05-20T10:20:00.000Z',
        },
      ]))
    })
    await page.reload({ waitUntil: 'commit' })
    await page.waitForSelector('.report-board', { timeout: 60000 })
    await waitForReportExportReady(page)

    const download = await captureCsvDownload(page, async () => {
      await page.evaluate(() => {
        document.querySelector<HTMLButtonElement>('.report-board .btn-export')?.click()
      })
    })

    expect(download.filename).toMatch(/^报表-\d{8}-\d{4}\.csv$/)
    const csv = download.text
    expect(csv).toContain('OTD复盘证据链')
    expect(csv).toContain('TRACE-SCH-20260520-001')
    expect(csv).toContain('采购回写 / M-AL-6061 加急采购收货已释放缺料风险')
    expect(csv).toContain('设备维护 / CNC-001 停机窗口已同步重排')
    expect(csv).toContain('生产完工 / WO-DEMO-1001 CNC 精加工 完工回写')
    expect(csv).toContain('POC复盘签署')
    expect(csv).toContain('POC-REVIEW-20260520-001')
    expect(csv).toContain('AUD-POC-REVIEW-20260520')
    expect(csv).toContain('项目经理 / 客户代表')
  })

  test('质量推荐采纳反馈写入报表学习闭环和 CSV 导出', async ({ page }) => {
    await page.evaluate(() => {
      localStorage.setItem('aimes_quality_knowledge_recommendation_feedback', JSON.stringify([
        {
          id: 'quality-recommendation-feedback-wo-demo-1018-op-20',
          rankingId: 'reuse-rank-published-torque',
          trainingSetVersion: 'QK-TRAIN-20260521-R2',
          targetWorkOrderId: 'WO-DEMO-1018',
          operationCode: 'OP-20',
          decision: 'accepted',
          decisionLabel: '现场已采纳推荐',
          owner: '质量工程师 周工 / 装配班长 王工',
          reason: '复验发现 OP-20 扭矩工具校准、设备族和缺陷模式均命中独立 CAPA 样本。',
          decidedAt: '2026-05-21T13:10:00.000Z',
          auditId: 'AUD-KG-QA-RECOMMENDATION-FEEDBACK-20260521-001',
          traceId: 'TRACE-KG-QA-WO-DEMO-1018-OP-20-RECOMMENDATION-ADOPTED',
          effectScoreBefore: 89,
          effectScoreAfter: 93,
          effectTrendLabel: '89 -> 93 分',
          nextTrainingSetVersion: 'QK-TRAIN-20260521-R3',
          nextTrainingTraceId: 'TRACE-KG-QA-WO-DEMO-1018-OP-20-NEXT-TRAINING-R3',
          feedbackActions: ['按独立扭矩 CAPA 执行复验。', '采纳结果回写为正样本。'],
          feedbackMetrics: [
            { label: '推荐采纳耗时', value: '18 分钟' },
            { label: '复验通过率', value: '100%' },
          ],
        },
      ]))
    })
    await page.reload({ waitUntil: 'commit' })
    await page.waitForSelector('.report-board', { timeout: 60000 })

    const panel = page.locator('.quality-learning-report')
    await expect(panel.getByRole('heading', { name: '已发布推荐采纳后进入下一轮训练集' })).toBeVisible()
    await expect(panel.getByText('WO-DEMO-1018 OP-20 · QK-TRAIN-20260521-R2 -> QK-TRAIN-20260521-R3')).toBeVisible()
    await expect(panel.getByText(/效果趋势 89 -> 93 分/)).toBeVisible()
    await expect(panel.getByText('AUD-KG-QA-RECOMMENDATION-FEEDBACK-20260521-001')).toBeVisible()
    await expect(panel.getByText('TRACE-KG-QA-WO-DEMO-1018-OP-20-NEXT-TRAINING-R3')).toBeVisible()

    const downloadPromise = page.waitForEvent('download')
    await page.getByRole('button', { name: 'CSV' }).click()
    const download = await downloadPromise
    const downloadPath = await download.path()
    expect(downloadPath).toBeTruthy()
    const csv = await readFile(downloadPath!, 'utf8')
    expect(csv).toContain('质量推荐学习闭环')
    expect(csv).toContain('WO-DEMO-1018 OP-20')
    expect(csv).toContain('QK-TRAIN-20260521-R2 -> QK-TRAIN-20260521-R3 / 89 -> 93 分 / AUD-KG-QA-RECOMMENDATION-FEEDBACK-20260521-001')
    expect(csv).toContain('TRACE-KG-QA-WO-DEMO-1018-OP-20-NEXT-TRAINING-R3')
  })

  test('R3 灰度发布监控进入报表和 CSV 导出', async ({ page }) => {
    await page.evaluate(() => {
      const feedback = {
        id: 'quality-recommendation-feedback-wo-demo-1018-op-20',
        rankingId: 'reuse-rank-published-torque',
        trainingSetVersion: 'QK-TRAIN-20260521-R2',
        targetWorkOrderId: 'WO-DEMO-1018',
        operationCode: 'OP-20',
        decision: 'accepted',
        decisionLabel: '现场已采纳推荐',
        owner: '质量工程师 周工 / 装配班长 王工',
        reason: '复验发现 OP-20 扭矩工具校准、设备族和缺陷模式均命中独立 CAPA 样本。',
        decidedAt: '2026-05-21T13:10:00.000Z',
        auditId: 'AUD-KG-QA-RECOMMENDATION-FEEDBACK-20260521-001',
        traceId: 'TRACE-KG-QA-WO-DEMO-1018-OP-20-RECOMMENDATION-ADOPTED',
        effectScoreBefore: 89,
        effectScoreAfter: 93,
        effectTrendLabel: '89 -> 93 分',
        nextTrainingSetVersion: 'QK-TRAIN-20260521-R3',
        nextTrainingTraceId: 'TRACE-KG-QA-WO-DEMO-1018-OP-20-NEXT-TRAINING-R3',
        feedbackActions: ['按独立扭矩 CAPA 执行复验。', '采纳结果回写为正样本。'],
        feedbackMetrics: [
          { label: '推荐采纳耗时', value: '18 分钟' },
          { label: '复验通过率', value: '100%' },
        ],
      }
      localStorage.setItem('aimes_quality_knowledge_recommendation_feedback', JSON.stringify([feedback]))
      localStorage.setItem('aimes_quality_knowledge_retraining_versions', JSON.stringify([
        {
          id: 'quality-retraining-version-qk-train-20260521-r3',
          sourceReviewQueueId: `recommendation-feedback-${feedback.id}`,
          targetWorkOrderId: 'WO-DEMO-1018',
          operationCode: 'OP-20',
          candidateTraceId: 'TRACE-KG-QA-WO-DEMO-1018-OP-20-NEXT-TRAINING-R3',
          trainingSetVersion: 'QK-TRAIN-20260521-R3',
          trainingSetName: '推荐采纳效果持续学习样本集',
          status: 'gray_published',
          statusLabel: '已灰度发布',
          approvedBy: '知识库管理员 / 质量主管 刘工',
          approvedAt: '2026-05-21T13:30:00.000Z',
          approvalAuditId: 'AUD-KG-QA-RETRAINING-R3-APPROVAL-20260521-001',
          approvalTraceId: 'TRACE-KG-QA-WO-DEMO-1018-OP-20-R3-APPROVED',
          positiveSampleCount: 24,
          negativeSampleCount: 4,
          featurePolicy: 'R3 合并推荐采纳效果、复验通过率、扭矩工具校准字段和 R2 负样本对照，先灰度到 OP-20 装配扭矩推荐链路。',
          changeSummary: ['R2 现场采纳反馈作为正样本进入 QK-TRAIN-20260521-R3。'],
          validationGates: ['R3 灰度前 Top-3 召回命中独立扭矩 CAPA 样本。'],
          validationStatus: 'passed',
          validatedAt: '2026-05-21T13:50:00.000Z',
          validationAuditId: 'AUD-KG-QA-RETRAINING-R3-VALIDATION-PASS-20260521-001',
          validationTraceId: 'TRACE-KG-QA-WO-DEMO-1018-OP-20-R3-VALIDATION-PASSED',
          validationSummary: 'R3 推荐采纳反馈字段完整，Top-3 召回命中独立扭矩 CAPA 样本，可进入受控灰度发布。',
          validationFindings: ['推荐采纳反馈字段完整率 100%。', 'Top-3 召回命中独立扭矩 CAPA 样本。'],
          publishedAt: '2026-05-21T14:00:00.000Z',
          publishAuditId: 'AUD-KG-QA-RETRAINING-R3-GRAY-PUBLISH-20260521-001',
          publishTraceId: 'TRACE-KG-QA-WO-DEMO-1018-OP-20-R3-GRAY-PUBLISHED',
          publishSummary: 'R3 已按受控范围灰度发布到 OP-20 装配扭矩推荐链路，继续监控推荐采纳率、复验通过率和负样本误召回。',
          recommendationScope: ['OP-20 装配扭矩偏移', '质量知识复用排序灰度', 'AI 生产助手引用链灰度'],
        },
      ]))
    })
    await page.reload({ waitUntil: 'commit' })
    await page.waitForSelector('.report-board', { timeout: 60000 })

    const panel = page.locator('.quality-gray-monitor-report')
    await expect(panel.getByRole('heading', { name: '质量推荐灰度发布后的采纳率、复验和误召回' })).toBeVisible()
    await expect(panel.getByText('QK-TRAIN-20260521-R3 灰度监控 · OP-20 装配扭矩推荐链路')).toBeVisible()
    await expect(panel.getByText(/推荐采纳率 100%/)).toBeVisible()
    await expect(panel.getByText(/复验通过率 100%/)).toBeVisible()
    await expect(panel.getByText(/负样本误召回 0 次/)).toBeVisible()
    await expect(panel.getByText('AUD-KG-QA-RETRAINING-R3-GRAY-PUBLISH-20260521-001')).toBeVisible()
    await expect(panel.getByText('TRACE-KG-QA-WO-DEMO-1018-OP-20-R3-GRAY-PUBLISHED')).toBeVisible()

    const downloadPromise = page.waitForEvent('download')
    await page.getByRole('button', { name: 'CSV' }).click()
    const download = await downloadPromise
    const downloadPath = await download.path()
    expect(downloadPath).toBeTruthy()
    const csv = await readFile(downloadPath!, 'utf8')
    expect(csv).toContain('质量推荐灰度监控')
    expect(csv).toContain('QK-TRAIN-20260521-R3 灰度监控 / OP-20 装配扭矩推荐链路')
    expect(csv).toContain('推荐采纳率 100% / 复验通过率 100% / 负样本误召回 0 次')
    expect(csv).toContain('AUD-KG-QA-RETRAINING-R3-GRAY-PUBLISH-20260521-001 / TRACE-KG-QA-WO-DEMO-1018-OP-20-R3-GRAY-PUBLISHED')
  })

  test('R3 重新灰度发布在报表和 CSV 中区分二次灰度周期', async ({ page }) => {
    await page.evaluate(() => {
      const feedback = {
        id: 'quality-recommendation-feedback-wo-demo-1018-op-20',
        rankingId: 'reuse-rank-published-torque',
        trainingSetVersion: 'QK-TRAIN-20260521-R2',
        targetWorkOrderId: 'WO-DEMO-1018',
        operationCode: 'OP-20',
        decision: 'accepted',
        decisionLabel: '现场已采纳推荐',
        owner: '质量工程师 周工 / 装配班长 王工',
        reason: '复验发现 OP-20 扭矩工具校准、设备族和缺陷模式均命中独立 CAPA 样本。',
        decidedAt: '2026-05-21T13:10:00.000Z',
        auditId: 'AUD-KG-QA-RECOMMENDATION-FEEDBACK-20260521-001',
        traceId: 'TRACE-KG-QA-WO-DEMO-1018-OP-20-RECOMMENDATION-ADOPTED',
        effectScoreBefore: 89,
        effectScoreAfter: 93,
        effectTrendLabel: '89 -> 93 分',
        nextTrainingSetVersion: 'QK-TRAIN-20260521-R3',
        nextTrainingTraceId: 'TRACE-KG-QA-WO-DEMO-1018-OP-20-NEXT-TRAINING-R3',
        feedbackActions: ['按独立扭矩 CAPA 执行复验。'],
        feedbackMetrics: [
          { label: '推荐采纳耗时', value: '18 分钟' },
          { label: '复验通过率', value: '100%' },
        ],
      }
      localStorage.setItem('aimes_quality_knowledge_recommendation_feedback', JSON.stringify([feedback]))
      localStorage.setItem('aimes_quality_knowledge_retraining_versions', JSON.stringify([
        {
          id: 'quality-retraining-version-qk-train-20260521-r3',
          sourceReviewQueueId: `recommendation-feedback-${feedback.id}`,
          targetWorkOrderId: 'WO-DEMO-1018',
          operationCode: 'OP-20',
          candidateTraceId: 'TRACE-KG-QA-WO-DEMO-1018-OP-20-NEXT-TRAINING-R3',
          trainingSetVersion: 'QK-TRAIN-20260521-R3',
          trainingSetName: '推荐采纳效果持续学习样本集',
          status: 'gray_published',
          statusLabel: '已重新灰度发布',
          approvedBy: '知识库管理员 / 质量主管 刘工',
          approvedAt: '2026-05-21T13:30:00.000Z',
          approvalAuditId: 'AUD-KG-QA-RETRAINING-R3-APPROVAL-20260521-001',
          approvalTraceId: 'TRACE-KG-QA-WO-DEMO-1018-OP-20-R3-APPROVED',
          positiveSampleCount: 24,
          negativeSampleCount: 4,
          featurePolicy: 'R3 合并推荐采纳效果、复验通过率、扭矩工具校准字段和 R2 负样本对照。',
          changeSummary: ['R2 现场采纳反馈作为正样本进入 QK-TRAIN-20260521-R3。'],
          validationGates: ['R3 灰度前 Top-3 召回命中独立扭矩 CAPA 样本。'],
          validationStatus: 'passed',
          validatedAt: '2026-05-21T15:20:00.000Z',
          validationAuditId: 'AUD-KG-QA-RETRAINING-R3-SCOPE-REVALIDATION-PASS-20260521-001',
          validationTraceId: 'TRACE-KG-QA-WO-DEMO-1018-OP-20-R3-SCOPE-REVALIDATION-PASSED',
          validationSummary: 'R3 调整灰度范围后重新通过灰度前校验。',
          validationFindings: [
            'Top-3 召回命中独立扭矩 CAPA 样本。',
            'R2 回滚期间补充的负样本未被误召回。',
          ],
          publishedAt: '2026-05-21T15:35:00.000Z',
          publishAuditId: 'AUD-KG-QA-RETRAINING-R3-GRAY-REPUBLISH-20260521-001',
          publishTraceId: 'TRACE-KG-QA-WO-DEMO-1018-OP-20-R3-GRAY-REPUBLISHED',
          publishSummary: 'R3 在调整灰度范围并重新通过校验后，再次灰度发布到 OP-20 装配扭矩推荐链路。',
          recommendationScope: ['WO-DEMO-1018 OP-20 装配扭矩偏移', '同设备族装配扭矩偏移灰度', 'AI 生产助手引用链灰度'],
        },
      ]))
    })
    await page.reload({ waitUntil: 'commit' })
    await page.waitForSelector('.report-board', { timeout: 60000 })

    const panel = page.locator('.quality-gray-monitor-report')
    await expect(panel.getByText('QK-TRAIN-20260521-R3 灰度监控 · OP-20 装配扭矩推荐链路 · 重新灰度发布')).toBeVisible()
    await expect(panel.getByText('灰度周期 重新灰度发布')).toBeVisible()
    await expect(panel.getByText('AUD-KG-QA-RETRAINING-R3-GRAY-REPUBLISH-20260521-001')).toBeVisible()
    await expect(panel.getByText('TRACE-KG-QA-WO-DEMO-1018-OP-20-R3-GRAY-REPUBLISHED')).toBeVisible()

    const downloadPromise = page.waitForEvent('download')
    await page.getByRole('button', { name: 'CSV' }).click()
    const download = await downloadPromise
    const downloadPath = await download.path()
    expect(downloadPath).toBeTruthy()
    const csv = await readFile(downloadPath!, 'utf8')
    expect(csv).toContain('质量推荐灰度监控')
    expect(csv).toContain('"灰度周期","重新灰度发布"')
    expect(csv).toContain('AUD-KG-QA-RETRAINING-R3-GRAY-REPUBLISH-20260521-001 / TRACE-KG-QA-WO-DEMO-1018-OP-20-R3-GRAY-REPUBLISHED')
  })

  test('R3 首次和重新灰度决策在报表周期趋势中并存', async ({ page }) => {
    await page.evaluate(() => {
      const feedback = {
        id: 'quality-recommendation-feedback-wo-demo-1018-op-20',
        rankingId: 'reuse-rank-published-torque',
        trainingSetVersion: 'QK-TRAIN-20260521-R2',
        targetWorkOrderId: 'WO-DEMO-1018',
        operationCode: 'OP-20',
        decision: 'accepted',
        decisionLabel: '现场已采纳推荐',
        owner: '质量工程师 周工 / 装配班长 王工',
        reason: '复验发现 OP-20 扭矩工具校准、设备族和缺陷模式均命中独立 CAPA 样本。',
        decidedAt: '2026-05-21T13:10:00.000Z',
        auditId: 'AUD-KG-QA-RECOMMENDATION-FEEDBACK-20260521-001',
        traceId: 'TRACE-KG-QA-WO-DEMO-1018-OP-20-RECOMMENDATION-ADOPTED',
        effectScoreBefore: 89,
        effectScoreAfter: 93,
        effectTrendLabel: '89 -> 93 分',
        nextTrainingSetVersion: 'QK-TRAIN-20260521-R3',
        nextTrainingTraceId: 'TRACE-KG-QA-WO-DEMO-1018-OP-20-NEXT-TRAINING-R3',
        feedbackActions: ['按独立扭矩 CAPA 执行复验。'],
        feedbackMetrics: [
          { label: '推荐采纳耗时', value: '18 分钟' },
          { label: '复验通过率', value: '100%' },
        ],
      }
      const republishedVersion = {
        id: 'quality-retraining-version-qk-train-20260521-r3',
        sourceReviewQueueId: `recommendation-feedback-${feedback.id}`,
        targetWorkOrderId: 'WO-DEMO-1018',
        operationCode: 'OP-20',
        candidateTraceId: 'TRACE-KG-QA-WO-DEMO-1018-OP-20-NEXT-TRAINING-R3',
        trainingSetVersion: 'QK-TRAIN-20260521-R3',
        trainingSetName: '推荐采纳效果持续学习样本集',
        status: 'gray_published',
        statusLabel: '已重新灰度发布',
        approvedBy: '知识库管理员 / 质量主管 刘工',
        approvedAt: '2026-05-21T13:30:00.000Z',
        approvalAuditId: 'AUD-KG-QA-RETRAINING-R3-APPROVAL-20260521-001',
        approvalTraceId: 'TRACE-KG-QA-WO-DEMO-1018-OP-20-R3-APPROVED',
        positiveSampleCount: 24,
        negativeSampleCount: 4,
        featurePolicy: 'R3 合并推荐采纳效果、复验通过率、扭矩工具校准字段和 R2 负样本对照。',
        changeSummary: ['R2 现场采纳反馈作为正样本进入 QK-TRAIN-20260521-R3。'],
        validationGates: ['R3 灰度前 Top-3 召回命中独立扭矩 CAPA 样本。'],
        validationStatus: 'passed',
        validatedAt: '2026-05-21T15:20:00.000Z',
        validationAuditId: 'AUD-KG-QA-RETRAINING-R3-SCOPE-REVALIDATION-PASS-20260521-001',
        validationTraceId: 'TRACE-KG-QA-WO-DEMO-1018-OP-20-R3-SCOPE-REVALIDATION-PASSED',
        validationSummary: 'R3 调整灰度范围后重新通过灰度前校验。',
        validationFindings: ['Top-3 召回命中独立扭矩 CAPA 样本。'],
        publishedAt: '2026-05-21T15:35:00.000Z',
        publishAuditId: 'AUD-KG-QA-RETRAINING-R3-GRAY-REPUBLISH-20260521-001',
        publishTraceId: 'TRACE-KG-QA-WO-DEMO-1018-OP-20-R3-GRAY-REPUBLISHED',
        publishSummary: 'R3 在调整灰度范围并重新通过校验后，再次灰度发布到 OP-20 装配扭矩推荐链路。',
        recommendationScope: ['WO-DEMO-1018 OP-20 装配扭矩偏移', '同设备族装配扭矩偏移灰度', 'AI 生产助手引用链灰度'],
      }
      const firstRollbackDecision = {
        id: 'quality-gray-release-decision-qk-train-20260521-r3-initial-rolled_back',
        monitorId: 'quality-gray-release-monitor-quality-retraining-version-qk-train-20260521-r3',
        trainingSetVersion: 'QK-TRAIN-20260521-R3',
        targetWorkOrderId: 'WO-DEMO-1018',
        operationCode: 'OP-20',
        releaseCycleLabel: '首次灰度发布',
        releaseAuditId: 'AUD-KG-QA-RETRAINING-R3-GRAY-PUBLISH-20260521-001',
        releaseTraceId: 'TRACE-KG-QA-WO-DEMO-1018-OP-20-R3-GRAY-PUBLISHED',
        releaseScopeLabel: 'OP-20 装配扭矩推荐链路',
        decision: 'rolled_back',
        decisionLabel: '回滚到 R2 正式版',
        statusClass: 'guarded',
        decidedBy: '质量主管 刘工 / 知识库管理员',
        decidedAt: '2026-05-21T14:20:00.000Z',
        auditId: 'AUD-KG-QA-RETRAINING-R3-GRAY-ROLLBACK-20260521-001',
        traceId: 'TRACE-KG-QA-WO-DEMO-1018-OP-20-R3-GRAY-ROLLED-BACK',
        reason: '首次灰度发布出现保守验证要求，先回滚到 R2 正式版。',
        approvalStatus: 'not_required',
        approvalLabel: '回滚无需扩大审批',
        rollbackTargetVersion: 'QK-TRAIN-20260521-R2',
        reviewIssueId: 'R3-REVIEW-ISSUE-20260521-001',
        reviewIssueTraceId: 'TRACE-KG-QA-WO-DEMO-1018-OP-20-R3-REVIEW-ISSUE',
        reviewIssueStatus: 'prevalidation_reopened',
        reviewIssueLabel: '已重开灰度前校验',
        metricSnapshot: [
          { label: '推荐采纳率', value: '100%' },
          { label: '复验通过率', value: '100%' },
          { label: '负样本误召回', value: '0 次' },
        ],
        actions: ['从 active 推荐选择中排除 QK-TRAIN-20260521-R3。'],
      }
      const republishRollbackDecision = {
        ...firstRollbackDecision,
        id: 'quality-gray-release-decision-qk-train-20260521-r3-republish-rolled_back',
        releaseCycleLabel: '重新灰度发布',
        releaseAuditId: 'AUD-KG-QA-RETRAINING-R3-GRAY-REPUBLISH-20260521-001',
        releaseTraceId: 'TRACE-KG-QA-WO-DEMO-1018-OP-20-R3-GRAY-REPUBLISHED',
        decidedAt: '2026-05-21T15:55:00.000Z',
        auditId: 'AUD-KG-QA-RETRAINING-R3-GRAY-REPUBLISH-ROLLBACK-20260521-001',
        traceId: 'TRACE-KG-QA-WO-DEMO-1018-OP-20-R3-GRAY-REPUBLISH-ROLLED-BACK',
        reason: '重新灰度发布后仍要求保守验证，二次回滚到 R2 正式版。',
        reviewIssueId: 'R3-REPUBLISH-REVIEW-ISSUE-20260521-001',
        reviewIssueTraceId: 'TRACE-KG-QA-WO-DEMO-1018-OP-20-R3-REPUBLISH-REVIEW-ISSUE',
        reviewIssueStatus: 'open',
        reviewIssueLabel: '待复核',
        actions: ['重新灰度发布周期从 active 推荐选择中排除 QK-TRAIN-20260521-R3。'],
      }
      localStorage.setItem('aimes_quality_knowledge_recommendation_feedback', JSON.stringify([feedback]))
      localStorage.setItem('aimes_quality_knowledge_retraining_versions', JSON.stringify([republishedVersion]))
      localStorage.setItem('aimes_quality_knowledge_gray_release_decisions', JSON.stringify([republishRollbackDecision, firstRollbackDecision]))
    })
    await page.reload({ waitUntil: 'commit' })
    await page.waitForSelector('.report-board', { timeout: 60000 })

    const reportPanel = page.locator('.quality-gray-decision-report')
    const cycleSummary = reportPanel.locator('.gray-cycle-summary')
    await expect(cycleSummary.getByText('首次灰度发布', { exact: true })).toBeVisible()
    await expect(cycleSummary.getByText('重新灰度发布', { exact: true })).toBeVisible()
    await expect(cycleSummary.getByText('0 扩大 / 1 回滚').first()).toBeVisible()
    await expect(reportPanel.getByText('R3-REVIEW-ISSUE-20260521-001')).toBeVisible()
    await expect(reportPanel.getByText('R3-REPUBLISH-REVIEW-ISSUE-20260521-001')).toBeVisible()
    await expect(reportPanel.getByText('AUD-KG-QA-RETRAINING-R3-GRAY-REPUBLISH-ROLLBACK-20260521-001')).toBeVisible()
    await expect(reportPanel.getByText('AUD-KG-QA-RETRAINING-R3-GRAY-REPUBLISH-20260521-001 / TRACE-KG-QA-WO-DEMO-1018-OP-20-R3-GRAY-REPUBLISHED')).toBeVisible()

    const downloadPromise = page.waitForEvent('download')
    await page.getByRole('button', { name: 'CSV' }).click()
    const download = await downloadPromise
    const downloadPath = await download.path()
    expect(downloadPath).toBeTruthy()
    const csv = await readFile(downloadPath!, 'utf8')
    expect(csv).toContain('质量灰度决策周期')
    expect(csv).toContain('"重新灰度发布","0 次扩大 / 1 次回滚 / 0 待确认 / 1 待复核"')
    expect(csv).toContain('AUD-KG-QA-RETRAINING-R3-GRAY-REPUBLISH-ROLLBACK-20260521-001 / TRACE-KG-QA-WO-DEMO-1018-OP-20-R3-GRAY-REPUBLISH-ROLLED-BACK')
    expect(csv).toContain('重新灰度发布 / AUD-KG-QA-RETRAINING-R3-GRAY-REPUBLISH-20260521-001 / TRACE-KG-QA-WO-DEMO-1018-OP-20-R3-GRAY-REPUBLISHED')
  })

  test('R3 R4 R5 多版本质量推荐实验对比进入报表和 CSV', async ({ page }) => {
    await page.evaluate(() => {
      const feedbackRecords = [
        {
          id: 'quality-recommendation-feedback-r3-accepted',
          rankingId: 'reuse-rank-published-torque-r3',
          trainingSetVersion: 'QK-TRAIN-20260521-R2',
          targetWorkOrderId: 'WO-DEMO-1018',
          operationCode: 'OP-20',
          decision: 'accepted',
          decisionLabel: '现场已采纳推荐',
          owner: '质量工程师 周工 / 装配班长 王工',
          reason: 'R3 命中 OP-20 扭矩工具校准字段，复验通过。',
          decidedAt: '2026-05-21T13:10:00.000Z',
          auditId: 'AUD-KG-QA-RECOMMENDATION-FEEDBACK-R3-20260521-001',
          traceId: 'TRACE-KG-QA-WO-DEMO-1018-OP-20-R3-RECOMMENDATION-ADOPTED',
          effectScoreBefore: 89,
          effectScoreAfter: 93,
          effectTrendLabel: '89 -> 93 分',
          nextTrainingSetVersion: 'QK-TRAIN-20260521-R3',
          nextTrainingTraceId: 'TRACE-KG-QA-WO-DEMO-1018-OP-20-NEXT-TRAINING-R3',
          feedbackActions: ['按独立扭矩 CAPA 执行复验。'],
          feedbackMetrics: [
            { label: '推荐采纳耗时', value: '18 分钟' },
            { label: '复验通过率', value: '100%' },
            { label: '负样本误召回', value: '0 次' },
          ],
        },
        {
          id: 'quality-recommendation-feedback-r4-accepted',
          rankingId: 'reuse-rank-published-torque-r4',
          trainingSetVersion: 'QK-TRAIN-20260521-R4',
          targetWorkOrderId: 'WO-DEMO-1018',
          operationCode: 'OP-20',
          decision: 'accepted',
          decisionLabel: '现场已采纳推荐',
          owner: '质量工程师 周工 / 装配班长 王工',
          reason: 'R4 加入同设备族扭矩漂移样本后，采纳链路更稳定。',
          decidedAt: '2026-05-21T16:10:00.000Z',
          auditId: 'AUD-KG-QA-RECOMMENDATION-FEEDBACK-R4-20260521-001',
          traceId: 'TRACE-KG-QA-WO-DEMO-1018-OP-20-R4-RECOMMENDATION-ADOPTED',
          effectScoreBefore: 93,
          effectScoreAfter: 96,
          effectTrendLabel: '93 -> 96 分',
          nextTrainingSetVersion: 'QK-TRAIN-20260521-R5',
          nextTrainingTraceId: 'TRACE-KG-QA-WO-DEMO-1018-OP-20-NEXT-TRAINING-R5',
          feedbackActions: ['扩大到同设备族 OP-20 扭矩偏移样本。'],
          feedbackMetrics: [
            { label: '推荐采纳耗时', value: '12 分钟' },
            { label: '复验通过率', value: '98%' },
            { label: '负样本误召回', value: '0 次' },
          ],
        },
        {
          id: 'quality-recommendation-feedback-r5-rejected',
          rankingId: 'reuse-rank-published-torque-r5',
          trainingSetVersion: 'QK-TRAIN-20260521-R5',
          targetWorkOrderId: 'WO-DEMO-1018',
          operationCode: 'OP-20',
          decision: 'rejected',
          decisionLabel: '现场拒绝推荐',
          owner: '质量工程师 周工 / 装配班长 王工',
          reason: 'R5 引入跨线样本后出现同名缺陷误召回，需回滚复核。',
          decidedAt: '2026-05-21T17:10:00.000Z',
          auditId: 'AUD-KG-QA-RECOMMENDATION-FEEDBACK-R5-20260521-001',
          traceId: 'TRACE-KG-QA-WO-DEMO-1018-OP-20-R5-RECOMMENDATION-REJECTED',
          effectScoreBefore: 96,
          effectScoreAfter: 91,
          effectTrendLabel: '96 -> 91 分',
          nextTrainingSetVersion: 'QK-TRAIN-20260521-R6',
          nextTrainingTraceId: 'TRACE-KG-QA-WO-DEMO-1018-OP-20-NEXT-TRAINING-R6',
          feedbackActions: ['记录跨线负样本误召回。'],
          feedbackMetrics: [
            { label: '推荐采纳耗时', value: '待复核' },
            { label: '复验通过率', value: '82%' },
            { label: '负样本误召回', value: '2 次' },
          ],
        },
      ]
      const versions = [
        {
          id: 'quality-retraining-version-qk-train-20260521-r3',
          sourceReviewQueueId: 'recommendation-feedback-quality-recommendation-feedback-r3-accepted',
          targetWorkOrderId: 'WO-DEMO-1018',
          operationCode: 'OP-20',
          candidateTraceId: 'TRACE-KG-QA-WO-DEMO-1018-OP-20-NEXT-TRAINING-R3',
          trainingSetVersion: 'QK-TRAIN-20260521-R3',
          trainingSetName: '推荐采纳效果持续学习样本集',
          status: 'gray_published',
          statusLabel: '已灰度发布',
          approvedBy: '知识库管理员 / 质量主管 刘工',
          approvedAt: '2026-05-21T13:30:00.000Z',
          approvalAuditId: 'AUD-KG-QA-RETRAINING-R3-APPROVAL-20260521-001',
          approvalTraceId: 'TRACE-KG-QA-WO-DEMO-1018-OP-20-R3-APPROVED',
          positiveSampleCount: 24,
          negativeSampleCount: 4,
          featurePolicy: 'R3 合并推荐采纳效果、复验通过率、扭矩工具校准字段和 R2 负样本对照。',
          changeSummary: ['R2 现场采纳反馈作为正样本进入 QK-TRAIN-20260521-R3。'],
          validationGates: ['R3 灰度前 Top-3 召回命中独立扭矩 CAPA 样本。'],
          validationStatus: 'passed',
          validatedAt: '2026-05-21T13:50:00.000Z',
          validationAuditId: 'AUD-KG-QA-RETRAINING-R3-VALIDATION-PASS-20260521-001',
          validationTraceId: 'TRACE-KG-QA-WO-DEMO-1018-OP-20-R3-VALIDATION-PASSED',
          validationSummary: 'R3 推荐采纳反馈字段完整，Top-3 召回命中独立扭矩 CAPA 样本。',
          validationFindings: ['推荐采纳反馈字段完整率 100%。', 'Top-3 召回命中独立扭矩 CAPA 样本。'],
          publishedAt: '2026-05-21T14:00:00.000Z',
          publishAuditId: 'AUD-KG-QA-RETRAINING-R3-GRAY-PUBLISH-20260521-001',
          publishTraceId: 'TRACE-KG-QA-WO-DEMO-1018-OP-20-R3-GRAY-PUBLISHED',
          publishSummary: 'R3 已按受控范围灰度发布到 OP-20 装配扭矩推荐链路。',
          recommendationScope: ['OP-20 装配扭矩偏移', '质量知识复用排序灰度'],
        },
        {
          id: 'quality-retraining-version-qk-train-20260521-r4',
          sourceReviewQueueId: 'recommendation-feedback-quality-recommendation-feedback-r4-accepted',
          targetWorkOrderId: 'WO-DEMO-1018',
          operationCode: 'OP-20',
          candidateTraceId: 'TRACE-KG-QA-WO-DEMO-1018-OP-20-NEXT-TRAINING-R4',
          trainingSetVersion: 'QK-TRAIN-20260521-R4',
          trainingSetName: '同设备族扭矩偏移扩大实验样本集',
          status: 'gray_published',
          statusLabel: '已灰度发布',
          approvedBy: '知识库管理员 / 质量主管 刘工',
          approvedAt: '2026-05-21T15:30:00.000Z',
          approvalAuditId: 'AUD-KG-QA-RETRAINING-R4-APPROVAL-20260521-001',
          approvalTraceId: 'TRACE-KG-QA-WO-DEMO-1018-OP-20-R4-APPROVED',
          positiveSampleCount: 31,
          negativeSampleCount: 5,
          featurePolicy: 'R4 扩展同设备族扭矩偏移样本，保留 R3 负样本对照。',
          changeSummary: ['R4 扩大到同设备族 OP-20 扭矩偏移样本。'],
          validationGates: ['R4 灰度前 Top-3 召回命中独立扭矩 CAPA 样本。'],
          validationStatus: 'passed',
          validatedAt: '2026-05-21T15:50:00.000Z',
          validationAuditId: 'AUD-KG-QA-RETRAINING-R4-VALIDATION-PASS-20260521-001',
          validationTraceId: 'TRACE-KG-QA-WO-DEMO-1018-OP-20-R4-VALIDATION-PASSED',
          validationSummary: 'R4 同设备族样本通过灰度前校验。',
          validationFindings: ['Top-3 召回命中独立扭矩 CAPA 样本。', '负样本误召回 0 次。'],
          publishedAt: '2026-05-21T16:00:00.000Z',
          publishAuditId: 'AUD-KG-QA-RETRAINING-R4-GRAY-PUBLISH-20260521-001',
          publishTraceId: 'TRACE-KG-QA-WO-DEMO-1018-OP-20-R4-GRAY-PUBLISHED',
          publishSummary: 'R4 已灰度发布到同设备族扭矩偏移推荐实验。',
          recommendationScope: ['同设备族 OP-20 扭矩偏移', '质量知识复用排序灰度'],
        },
        {
          id: 'quality-retraining-version-qk-train-20260521-r5',
          sourceReviewQueueId: 'recommendation-feedback-quality-recommendation-feedback-r5-rejected',
          targetWorkOrderId: 'WO-DEMO-1018',
          operationCode: 'OP-20',
          candidateTraceId: 'TRACE-KG-QA-WO-DEMO-1018-OP-20-NEXT-TRAINING-R5',
          trainingSetVersion: 'QK-TRAIN-20260521-R5',
          trainingSetName: '跨线扭矩偏移探索实验样本集',
          status: 'gray_published',
          statusLabel: '已灰度发布',
          approvedBy: '知识库管理员 / 质量主管 刘工',
          approvedAt: '2026-05-21T16:30:00.000Z',
          approvalAuditId: 'AUD-KG-QA-RETRAINING-R5-APPROVAL-20260521-001',
          approvalTraceId: 'TRACE-KG-QA-WO-DEMO-1018-OP-20-R5-APPROVED',
          positiveSampleCount: 38,
          negativeSampleCount: 6,
          featurePolicy: 'R5 探索跨线扭矩偏移样本，但需严格监控误召回。',
          changeSummary: ['R5 引入跨产线同名缺陷样本。'],
          validationGates: ['R5 灰度前需复核跨线负样本误召回。'],
          validationStatus: 'passed',
          validatedAt: '2026-05-21T16:50:00.000Z',
          validationAuditId: 'AUD-KG-QA-RETRAINING-R5-VALIDATION-PASS-20260521-001',
          validationTraceId: 'TRACE-KG-QA-WO-DEMO-1018-OP-20-R5-VALIDATION-PASSED',
          validationSummary: 'R5 灰度前校验通过，但标记跨线误召回观察项。',
          validationFindings: ['跨线负样本误召回 2 次。'],
          publishedAt: '2026-05-21T17:00:00.000Z',
          publishAuditId: 'AUD-KG-QA-RETRAINING-R5-GRAY-PUBLISH-20260521-001',
          publishTraceId: 'TRACE-KG-QA-WO-DEMO-1018-OP-20-R5-GRAY-PUBLISHED',
          publishSummary: 'R5 已灰度发布到跨线扭矩偏移推荐实验。',
          recommendationScope: ['跨线 OP-20 扭矩偏移', '质量知识复用排序灰度'],
        },
      ]
      const decisions = [
        {
          id: 'quality-gray-release-decision-qk-train-20260521-r4-initial-expanded',
          monitorId: 'quality-gray-release-monitor-quality-retraining-version-qk-train-20260521-r4',
          trainingSetVersion: 'QK-TRAIN-20260521-R4',
          targetWorkOrderId: 'WO-DEMO-1018',
          operationCode: 'OP-20',
          releaseCycleLabel: '首次灰度发布',
          releaseAuditId: 'AUD-KG-QA-RETRAINING-R4-GRAY-PUBLISH-20260521-001',
          releaseTraceId: 'TRACE-KG-QA-WO-DEMO-1018-OP-20-R4-GRAY-PUBLISHED',
          releaseScopeLabel: 'OP-20 装配扭矩推荐链路',
          decision: 'expanded',
          decisionLabel: '扩大灰度范围',
          statusClass: 'accepted',
          decidedBy: '质量主管 刘工 / 知识库管理员',
          decidedAt: '2026-05-21T16:30:00.000Z',
          auditId: 'AUD-KG-QA-RETRAINING-R4-GRAY-EXPAND-20260521-001',
          traceId: 'TRACE-KG-QA-WO-DEMO-1018-OP-20-R4-GRAY-EXPANDED',
          reason: 'R4 推荐采纳稳定，允许扩大到同设备族 OP-20 扭矩偏移。',
          approvalStatus: 'approved',
          approvalLabel: '质量主管已确认扩大',
          approvedBy: '质量主管 刘工',
          approvedAt: '2026-05-21T16:35:00.000Z',
          expansionScope: ['同设备族 OP-20 扭矩偏移', 'AI 生产助手引用链'],
          metricSnapshot: [
            { label: '推荐采纳率', value: '100%' },
            { label: '复验通过率', value: '98%' },
            { label: '负样本误召回', value: '0 次' },
          ],
          actions: ['R4 扩大同设备族推荐实验。'],
        },
        {
          id: 'quality-gray-release-decision-qk-train-20260521-r5-initial-rolled_back',
          monitorId: 'quality-gray-release-monitor-quality-retraining-version-qk-train-20260521-r5',
          trainingSetVersion: 'QK-TRAIN-20260521-R5',
          targetWorkOrderId: 'WO-DEMO-1018',
          operationCode: 'OP-20',
          releaseCycleLabel: '首次灰度发布',
          releaseAuditId: 'AUD-KG-QA-RETRAINING-R5-GRAY-PUBLISH-20260521-001',
          releaseTraceId: 'TRACE-KG-QA-WO-DEMO-1018-OP-20-R5-GRAY-PUBLISHED',
          releaseScopeLabel: 'OP-20 装配扭矩推荐链路',
          decision: 'rolled_back',
          decisionLabel: '回滚到 R2 正式版',
          statusClass: 'guarded',
          decidedBy: '质量主管 刘工 / 知识库管理员',
          decidedAt: '2026-05-21T17:30:00.000Z',
          auditId: 'AUD-KG-QA-RETRAINING-R5-GRAY-ROLLBACK-20260521-001',
          traceId: 'TRACE-KG-QA-WO-DEMO-1018-OP-20-R5-GRAY-ROLLED-BACK',
          reason: 'R5 跨线样本误召回超过阈值，先回滚到 R2 正式版。',
          approvalStatus: 'not_required',
          approvalLabel: '回滚无需扩大审批',
          rollbackTargetVersion: 'QK-TRAIN-20260521-R2',
          reviewIssueId: 'R5-REVIEW-ISSUE-20260521-001',
          reviewIssueTraceId: 'TRACE-KG-QA-WO-DEMO-1018-OP-20-R5-REVIEW-ISSUE',
          reviewIssueStatus: 'open',
          reviewIssueLabel: '待复核',
          metricSnapshot: [
            { label: '推荐采纳率', value: '0%' },
            { label: '复验通过率', value: '82%' },
            { label: '负样本误召回', value: '2 次' },
          ],
          actions: ['R5 跨线推荐实验回滚。'],
        },
      ]
      localStorage.setItem('aimes_quality_knowledge_recommendation_feedback', JSON.stringify(feedbackRecords))
      localStorage.setItem('aimes_quality_knowledge_retraining_versions', JSON.stringify(versions))
      localStorage.setItem('aimes_quality_knowledge_gray_release_decisions', JSON.stringify(decisions))
    })
    await page.reload({ waitUntil: 'commit' })
    await page.waitForSelector('.report-board', { timeout: 60000 })

    const panel = page.locator('.quality-experiment-report')
    await expect(panel.getByRole('heading', { name: 'R3 / R4 / R5 / R7 灰度实验采纳、复验、误召回和决策对比' })).toBeVisible()
    await expect(panel.getByText('QK-TRAIN-20260521-R3 · 首次灰度发布')).toBeVisible()
    await expect(panel.getByText('QK-TRAIN-20260521-R4 · 首次灰度发布')).toBeVisible()
    await expect(panel.getByText('QK-TRAIN-20260521-R5 · 首次灰度发布')).toBeVisible()
    await expect(panel.getByText('扩大灰度范围 / 质量主管已确认扩大')).toBeVisible()
    await expect(panel.getByText('回滚到 R2 正式版 / 回滚无需扩大审批')).toBeVisible()
    await expect(panel.getByText('AUD-KG-QA-RETRAINING-R5-GRAY-ROLLBACK-20260521-001')).toBeVisible()

    const r4Card = panel.locator('.experiment-card').filter({ hasText: 'QK-TRAIN-20260521-R4' })
    await expect(r4Card.getByText('93 -> 96 分')).toBeVisible()
    await expect(r4Card.locator('.experiment-metrics').getByText('98%')).toBeVisible()
    await expect(r4Card.locator('.experiment-metrics').getByText('0 次')).toBeVisible()
    const r5Card = panel.locator('.experiment-card').filter({ hasText: 'QK-TRAIN-20260521-R5' })
    await expect(r5Card.locator('.experiment-metrics').getByText('82%')).toBeVisible()
    await expect(r5Card.locator('.experiment-metrics').getByText('2 次')).toBeVisible()

    const candidatePanel = page.locator('.quality-experiment-candidate-report')
    await expect(candidatePanel.getByRole('heading', { name: 'R5 回滚后的 R6 / R7 负样本覆盖和影子验证' })).toBeVisible()
    const r6Candidate = candidatePanel.locator('.candidate-card').filter({
      has: page.locator('.experiment-topline span').getByText('QK-TRAIN-20260521-R6 · R5 回滚触发', { exact: true }),
    })
    await expect(r6Candidate.getByText('补样待合并')).toBeVisible()
    await expect(r6Candidate.locator('.candidate-metrics').getByText('6 / 8 条')).toBeVisible()
    await expect(r6Candidate.locator('.candidate-metrics').getByText('75%')).toBeVisible()
    await expect(r6Candidate.locator('.experiment-meta code').filter({ hasText: 'AUD-KG-QA-RETRAINING-R6-NEGATIVE-COVERAGE-20260521-001' })).toBeVisible()
    const r7Candidate = candidatePanel.locator('.candidate-card').filter({
      has: page.locator('.experiment-topline span').getByText('QK-TRAIN-20260521-R7 · R6 补样后触发', { exact: true }),
    })
    await expect(r7Candidate.getByText('影子验证待排队')).toBeVisible()
    await expect(r7Candidate.getByText('追加 2 个跨线影子场景')).toBeVisible()

    const downloadPromise = page.waitForEvent('download')
    await page.getByRole('button', { name: 'CSV' }).click()
    const download = await downloadPromise
    const downloadPath = await download.path()
    expect(downloadPath).toBeTruthy()
    const csv = await readFile(downloadPath!, 'utf8')
    expect(csv).toContain('质量推荐实验对比')
    expect(csv).toContain('QK-TRAIN-20260521-R4 / 首次灰度发布 / OP-20 装配扭矩推荐链路')
    expect(csv).toContain('采纳率 100% / 复验通过率 98% / 误召回 0 次')
    expect(csv).toContain('QK-TRAIN-20260521-R5 / 首次灰度发布 / OP-20 装配扭矩推荐链路')
    expect(csv).toContain('采纳率 0% / 复验通过率 82% / 误召回 2 次')
    expect(csv).toContain('AUD-KG-QA-RETRAINING-R4-GRAY-EXPAND-20260521-001 / TRACE-KG-QA-WO-DEMO-1018-OP-20-R4-GRAY-EXPANDED')
    expect(csv).toContain('AUD-KG-QA-RETRAINING-R5-GRAY-ROLLBACK-20260521-001 / TRACE-KG-QA-WO-DEMO-1018-OP-20-R5-GRAY-ROLLED-BACK')
    expect(csv).toContain('质量推荐实验候选')
    expect(csv).toContain('QK-TRAIN-20260521-R6 / R5 回滚触发')
    expect(csv).toContain('补样待合并 / 负样本覆盖 6 / 8 条 / 覆盖率 75% / 需补 2 条跨线负样本')
    expect(csv).toContain('QK-TRAIN-20260521-R7 / R6 补样后触发')
    expect(csv).toContain('AUD-KG-QA-RETRAINING-R6-NEGATIVE-COVERAGE-20260521-001 / TRACE-KG-QA-WO-DEMO-1018-OP-20-R6-NEGATIVE-COVERAGE')
  })
})
