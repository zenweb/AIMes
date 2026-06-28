import { test, expect } from '@playwright/test'

test.describe.configure({ timeout: 90000 })

test.describe('Quality 质量闭环', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('aimes_token', 'mock-e2e-token')
      localStorage.setItem('aimes_user', JSON.stringify({ username: 'admin', displayName: '管理员', role: 'Admin', mustChangePassword: false }))
    })
  })

  test('质量返工事件回写排产和 OTD 复盘', async ({ page }) => {
    await page.goto('quality', { waitUntil: 'commit', timeout: 45000 })
    await page.waitForSelector('.quality-board', { timeout: 60000 })

    const qualityPanel = page.locator('.quality-rework-panel')
    await expect(qualityPanel).toBeVisible()
    await expect(qualityPanel.getByText('返工影响排产与 OTD')).toBeVisible()
    await expect(qualityPanel.getByText('INS-003')).toBeVisible()
    await expect(qualityPanel.getByText('WO-003 · 热处理')).toBeVisible()
    await expect(qualityPanel.getByText(/检验结果 返工 已自动生成返工排产事件/)).toBeVisible()

    await qualityPanel.getByRole('button', { name: '生成返工排产事件' }).click()
    await expect(qualityPanel.getByRole('status').getByText(/返工排产事件已生成/)).toBeVisible()

    await page.goto('scheduling', { waitUntil: 'commit', timeout: 45000 })
    await page.waitForSelector('.event-queue-panel', { timeout: 60000 })
    const eventPanel = page.locator('.event-queue-panel')
    await expect(eventPanel.getByText('质量返工事件')).toBeVisible()
    await expect(eventPanel.getByText('WO-003 返工插入')).toBeVisible()
    await expect(eventPanel.getByText(/预计占用 6h/)).toBeVisible()

    await eventPanel.locator('.event-card').filter({ hasText: 'WO-003 返工插入' }).getByRole('button', { name: '生成重排建议' }).click()
    await expect(eventPanel.getByText('质量返工插入建议')).toBeVisible()
    await expect(eventPanel.getByText(/插入返工与复验窗口/)).toBeVisible()
    const agentSuggestion = eventPanel.locator('.agent-suggestion')
    await expect(agentSuggestion.getByText('质量返工插入建议')).toBeVisible()
    await expect(agentSuggestion.locator('.suggestion-metrics').getByText('延期 -1 单风险', { exact: true })).toBeVisible()

    await page.goto('report', { waitUntil: 'commit', timeout: 45000 })
    await page.waitForSelector('.report-board', { timeout: 60000 })
    const reportPanel = page.locator('.quality-rework-report')
    await expect(reportPanel).toBeVisible()
    await expect(reportPanel.getByText('WO-003 返工对 OTD 的影响')).toBeVisible()
    await expect(reportPanel.getByText('6h 返工窗口')).toBeVisible()
    await expect(reportPanel.getByText('WO-003 延期 +1 单风险')).toBeVisible()
  })

  test('质量根因分析生成 CAPA 处置任务并验证留痕', async ({ page }) => {
    await page.goto('quality', { waitUntil: 'commit', timeout: 45000 })
    await page.waitForSelector('.quality-board', { timeout: 60000 })

    const capaPanel = page.locator('.quality-capa-panel')
    await expect(capaPanel).toBeVisible()
    await expect(capaPanel.getByText('根因证据转纠正措施任务')).toBeVisible()
    await expect(capaPanel.getByText('硬度不足 / 热处理参数漂移')).toBeVisible()
    await expect(capaPanel.getByText('72%')).toBeVisible()
    await expect(capaPanel.getByText(/HT-01 炉温曲线末段波动/)).toBeVisible()
    const taskKinds = capaPanel.locator('.task-topline span')
    await expect(taskKinds.getByText('纠正措施', { exact: true })).toBeVisible()
    await expect(taskKinds.getByText('隔离措施', { exact: true })).toBeVisible()
    await expect(taskKinds.getByText('预防措施', { exact: true })).toBeVisible()
    await expect(capaPanel.getByText('质量工程师 周工')).toBeVisible()
    await expect(capaPanel.getByText('返工后硬度 HB95+')).toBeVisible()

    const firstTask = capaPanel.locator('.task-card').filter({ hasText: '复核 HT-01 炉温曲线' })
    await firstTask.getByRole('button', { name: '推进处置' }).click()
    await expect(firstTask.getByText('执行中')).toBeVisible()
    await expect(capaPanel.getByText(/已开始执行/)).toBeVisible()

    await firstTask.getByRole('button', { name: '推进处置' }).click()
    await expect(firstTask.locator('.task-topline em').getByText('已验证', { exact: true })).toBeVisible()
    await expect(firstTask.getByRole('button', { name: '已验证' })).toBeVisible()
    await expect(capaPanel.getByText(/已完成验证：返工后硬度 HB95\+/)).toBeVisible()
    await expect(capaPanel.getByText(/质量审计与 OTD 复盘/)).toBeVisible()
    await expect(capaPanel.getByText(/已同步到审计回放与 OTD 复盘/)).toBeVisible()

    await page.goto('audit-logs', { waitUntil: 'commit', timeout: 45000 })
    await page.waitForSelector('.audit-board', { timeout: 60000 })
    const auditPanel = page.locator('.audit-replay-panel')
    const capaAuditCard = auditPanel.locator('.decision-card').filter({ hasText: 'WO-003 纠正措施验证闭环' })
    await expect(capaAuditCard).toBeVisible()
    await expect(capaAuditCard.getByText(/证据强度 72%/)).toBeVisible()
    await capaAuditCard.getByRole('button', { name: '回放决策链' }).click()
    await expect(auditPanel.locator('.replay-detail').getByText('TRACE-QA-CAPA-20260520-CAPA-HEAT-PARAM', { exact: true })).toBeVisible()
    await expect(auditPanel.getByText(/验证标准 返工后硬度 HB95\+ 已回写/)).toBeVisible()

    await page.goto('report', { waitUntil: 'commit', timeout: 45000 })
    await page.waitForSelector('.report-board', { timeout: 60000 })
    const reportPanel = page.locator('.quality-capa-report')
    await expect(reportPanel).toBeVisible()
    await expect(reportPanel.getByText('WO-003 质量 CAPA 已进入 OTD 复盘')).toBeVisible()
    await expect(reportPanel.getByText('72% 证据强度')).toBeVisible()
    await expect(reportPanel.getByText(/热处理返工风险从 \+1 单延期/)).toBeVisible()
  })

  test('根因分析加载失败时真实浏览器展示 fail-loud 且保留 fallback 分析', async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('aimes_offline_demo', 'false')
    })
    await page.route('**/api/v1/quality/statistics', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          totalInspections: 1,
          passedCount: 0,
          failedCount: 1,
          reworkCount: 0,
          passRate: 0,
          defectRate: 100,
          reworkRate: 0,
        }),
      })
    })
    await page.route('**/api/v1/quality/inspections', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          {
            id: 'INS-ROOT-FAIL',
            workOrderId: 'WO-ROOT-FAIL',
            productCode: 'PRD-ROOT',
            processName: 'CNC精加工',
            inspectionPoint: '尺寸检验',
            inspectionQuantity: 10,
            qualifiedQuantity: 8,
            defectQuantity: 2,
            result: 'fail',
            inspectorId: 'USR-001',
            inspectedAt: '2026-05-12T09:00:00',
            passRate: 80,
          },
        ]),
      })
    })
    await page.route('**/api/v1/anomaly', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ items: [] }),
      })
    })
    await page.route('**/api/v1/quality/spc/analyze**', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          processParameter: 'surface_roughness',
          hasTrend: false,
          hasDrift: false,
          hasCycle: false,
          isNearLimit: false,
          trendDirection: 'stable',
          recommendedAction: '',
          dataPoints: [12, 14, 13],
        }),
      })
    })
    await page.route('**/api/v1/quality/inspections/INS-ROOT-FAIL/analyze', async route => {
      await route.fulfill({
        status: 503,
        contentType: 'application/json',
        body: JSON.stringify({ title: 'root cause API unavailable from chromium' }),
      })
    })

    await page.goto('quality', { waitUntil: 'commit', timeout: 45000 })
    await page.waitForSelector('.quality-board', { timeout: 60000 })

    const qualityBoard = page.locator('.quality-board')
    const inspectionRow = qualityBoard.locator('.ins-row').filter({ hasText: 'WO-ROOT-FAIL' })
    await expect(inspectionRow.getByText('WO-ROOT-FAIL')).toBeVisible()
    await inspectionRow.getByRole('button', { name: '查看 INS-ROOT-FAIL 根因分析' }).click()

    const alert = qualityBoard.getByRole('alert')
    await expect(alert).toBeVisible()
    await expect(alert).toContainText('根因分析加载失败')
    await expect(alert).toContainText('Request failed with status code 503')

    const dialog = qualityBoard.getByRole('dialog', { name: /根因分析/ })
    await expect(dialog).toBeVisible()
    await expect(dialog.getByText('根因分析 — INS-ROOT-FAIL')).toBeVisible()
    await expect(dialog.getByText('刀具磨损超差')).toBeVisible()
    await expect(dialog.getByText('冷却液温度偏高')).toBeVisible()
    await expect(dialog.getByText('来料硬度波动')).toBeVisible()
    await expect(dialog.getByText(/主要根因为刀具磨损导致表面粗糙度超差/)).toBeVisible()
  })

  test('CAPA 验证同步失败时真实浏览器展示 fail-loud 且不伪造验证留痕', async ({ page }) => {
    await page.addInitScript(() => {
      const originalSetItem = Storage.prototype.setItem
      Storage.prototype.setItem = function setItemWithCapaClosureFailure(key: string, value: string) {
        if (key === 'aimes_quality_capa_closure') {
          throw new Error('CAPA closure storage unavailable from chromium')
        }
        return originalSetItem.call(this, key, value)
      }
    })

    await page.goto('quality', { waitUntil: 'commit', timeout: 45000 })
    await page.waitForSelector('.quality-board', { timeout: 60000 })

    const capaPanel = page.locator('.quality-capa-panel')
    const spcTask = capaPanel.locator('.task-card').filter({ hasText: '新增热处理硬度 SPC 预警点' })
    await expect(spcTask.locator('.task-topline em').getByText('执行中', { exact: true })).toBeVisible()
    await expect(spcTask.getByRole('button', { name: '推进处置' })).toBeVisible()

    await spcTask.getByRole('button', { name: '推进处置' }).click()

    const alert = capaPanel.getByRole('alert')
    await expect(alert).toBeVisible()
    await expect(alert).toContainText('CAPA 验证同步失败')
    await expect(alert).toContainText('CAPA closure storage unavailable from chromium')
    await expect(spcTask.locator('.task-topline em').getByText('执行中', { exact: true })).toBeVisible()
    await expect(spcTask.getByRole('button', { name: '推进处置' })).toBeVisible()
    await expect(spcTask.getByRole('button', { name: '已验证' })).toBeHidden()
    await expect(capaPanel.getByText(/已完成验证：SPC 连续 6 点无上升风险/)).toBeHidden()
    await expect(capaPanel.getByText(/已同步到审计回放与 OTD 复盘/)).toBeHidden()
    await expect(capaPanel.getByText('TRACE-QA-CAPA-20260520-CAPA-SPC-MONITOR')).toBeHidden()

    const capaClosure = await page.evaluate(() => localStorage.getItem('aimes_quality_capa_closure'))
    const evidenceRecords = await page.evaluate(() => localStorage.getItem('aimes_otd_evidence_chain'))
    expect(capaClosure).toBeNull()
    expect(evidenceRecords ?? '').not.toContain('TRACE-QA-CAPA-20260520-CAPA-SPC-MONITOR')
  })

  test('质量异常告警加载失败时真实浏览器展示 fail-loud 且保留本地告警', async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('aimes_offline_demo', 'false')
    })
    await page.route('**/api/v1/quality/statistics', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          totalInspections: 45,
          passedCount: 42,
          failedCount: 2,
          reworkCount: 1,
          passRate: 93.3,
          defectRate: 4.4,
          reworkRate: 2.2,
        }),
      })
    })
    await page.route('**/api/v1/quality/inspections', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([]),
      })
    })
    await page.route('**/api/v1/quality/spc/analyze**', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          processParameter: 'surface_roughness',
          hasTrend: false,
          hasDrift: false,
          hasCycle: false,
          isNearLimit: false,
          trendDirection: 'stable',
          recommendedAction: '',
          dataPoints: [12, 14, 13, 15, 14, 16],
        }),
      })
    })
    await page.route('**/api/v1/anomaly', async route => {
      await route.fulfill({
        status: 503,
        contentType: 'application/json',
        body: JSON.stringify({ title: 'anomaly API unavailable from chromium' }),
      })
    })

    await page.goto('quality', { waitUntil: 'commit', timeout: 45000 })
    await page.waitForSelector('.quality-board', { timeout: 60000 })

    const qualityBoard = page.locator('.quality-board')
    const alert = qualityBoard.getByRole('alert')
    await expect(alert).toBeVisible()
    await expect(alert).toContainText('质量异常告警加载失败')
    await expect(alert).toContainText('Request failed with status code 503')

    const anomaliesBody = qualityBoard.locator('.anomalies-body')
    await expect(anomaliesBody.getByText('装配后轴孔配合间隙 0.12mm，超过 0.08mm 标准上限')).toBeVisible()
    await expect(anomaliesBody.getByText('热处理后硬度 HB89，低于 HB95 标准下限')).toBeVisible()
    await expect(anomaliesBody.getByText('Ra 3.6μm，接近 3.2μm 标准上限，建议监控')).toBeVisible()
    await expect(qualityBoard.getByText('异常告警 (3)')).toBeVisible()
    await expect(anomaliesBody.getByText('暂无异常告警')).toBeHidden()
  })

  test('SPC 趋势分析加载失败后真实浏览器展示 fallback 并在后续成功时清理告警', async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('aimes_offline_demo', 'false')
    })
    await page.route('**/api/v1/quality/statistics', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          totalInspections: 45,
          passedCount: 42,
          failedCount: 2,
          reworkCount: 1,
          passRate: 93.3,
          defectRate: 4.4,
          reworkRate: 2.2,
        }),
      })
    })
    await page.route('**/api/v1/quality/inspections', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([]),
      })
    })
    await page.route('**/api/v1/anomaly', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ items: [] }),
      })
    })
    await page.route('**/api/v1/quality/spc/analyze**', async route => {
      const url = new URL(route.request().url())
      if (url.searchParams.get('processParameter') === 'hardness') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            processParameter: 'hardness',
            hasTrend: false,
            hasDrift: false,
            hasCycle: false,
            isNearLimit: false,
            trendDirection: 'stable',
            recommendedAction: '',
            dataPoints: [10, 20, 30],
          }),
        })
        return
      }
      await route.fulfill({
        status: 503,
        contentType: 'application/json',
        body: JSON.stringify({ title: 'SPC backend unavailable from chromium' }),
      })
    })

    await page.goto('quality', { waitUntil: 'commit', timeout: 45000 })
    await page.waitForSelector('.quality-board', { timeout: 60000 })

    const qualityBoard = page.locator('.quality-board')
    const spcCard = qualityBoard.locator('.spc-card')
    const alert = qualityBoard.getByRole('alert')
    await expect(alert).toBeVisible()
    await expect(alert).toContainText('SPC 趋势分析加载失败')
    await expect(alert).toContainText('Request failed with status code 503')
    await expect(spcCard.locator('.spc-chart circle')).toHaveCount(24)
    await expect(spcCard.locator('.spc-empty-state')).toBeHidden()

    await spcCard.locator('.param-select').selectOption('hardness')

    await expect(qualityBoard.getByRole('alert')).toBeHidden()
    await expect(spcCard.locator('.spc-chart circle')).toHaveCount(3)
  })

  test('质量 MRB 报废补料决策联动排产和 OTD 复盘', async ({ page }) => {
    await page.goto('quality', { waitUntil: 'commit', timeout: 45000 })
    await page.waitForSelector('.quality-board', { timeout: 60000 })

    const mrbPanel = page.locator('.quality-mrb-panel')
    await expect(mrbPanel).toBeVisible()
    await expect(mrbPanel.getByText('报废补料影响排产与 OTD')).toBeVisible()
    await expect(mrbPanel.getByText('INS-004')).toBeVisible()
    await expect(mrbPanel.getByText('WO-004 · 装配')).toBeVisible()
    await expect(mrbPanel.getByText('WO-004 延期 +2 单风险，需补料与重排')).toBeVisible()

    await mrbPanel.getByRole('button', { name: '生成 WO-004 INS-004 MRB 报废补料决策' }).click()
    await expect(mrbPanel.getByText('AUD-QA-MRB-DISPOSITION-20260521')).toBeVisible()
    await expect(mrbPanel.getByText('TRACE-QA-WO-004-MRB-DISPOSITION-20260521')).toBeVisible()
    await expect(mrbPanel.getByRole('status').getByText(/MRB 报废补料决策已生成/)).toBeVisible()

    await page.goto('scheduling', { waitUntil: 'commit', timeout: 45000 })
    await page.waitForSelector('.event-queue-panel', { timeout: 60000 })
    const eventPanel = page.locator('.event-queue-panel')
    const mrbEvent = eventPanel.locator('.event-card').filter({ hasText: 'WO-004 MRB 报废补料重排' })
    await expect(mrbEvent).toBeVisible()
    await expect(mrbEvent.getByText('MRB 处置事件')).toBeVisible()
    await expect(mrbEvent.getByText('TRACE-QA-WO-004-MRB-SCHEDULE-IMPACT-20260521')).toBeVisible()
    await mrbEvent.getByRole('button', { name: '生成重排建议' }).click()
    const mrbSuggestion = eventPanel.locator('.agent-suggestion')
    await expect(mrbSuggestion.getByText('MRB 报废补料后的排产保护建议')).toBeVisible()
    await expect(mrbSuggestion.getByText(/冻结 WO-004 原装配窗口/)).toBeVisible()
    await expect(mrbSuggestion.getByText(/\+2 单风险/)).toBeVisible()

    await page.locator('.chat-fab').click()
    await page.locator('.chat-input').fill('质量 MRB 报废补料影响？')
    await page.locator('.send-btn').click()
    const chat = page.locator('.chat-panel')
    await expect(chat.getByText('WO-004 装配间隙超差 MRB 处置决策 已生成。')).toBeVisible()
    await expect(chat.getByText(/处置结论：报废补料重建/)).toBeVisible()
    await expect(chat.getByText(/TRACE-QA-WO-004-MRB-SCHEDULE-IMPACT-20260521/)).toBeVisible()

    await page.goto('report', { waitUntil: 'commit', timeout: 45000 })
    await page.waitForSelector('.report-board', { timeout: 60000 })
    const reportPanel = page.locator('.quality-mrb-report')
    await expect(reportPanel).toBeVisible()
    await expect(reportPanel.getByText('WO-004 MRB 报废补料进入 OTD 复盘')).toBeVisible()
    await expect(reportPanel.getByText('4 件报废补料')).toBeVisible()
    await expect(reportPanel.getByText('TRACE-QA-WO-004-MRB-DISPOSITION-20260521')).toBeVisible()

    await page.goto('admin', { waitUntil: 'commit', timeout: 45000 })
    await page.waitForSelector('.admin-board', { timeout: 60000 })
    await page.getByRole('tab', { name: 'Agent 治理' }).click()
    const governanceSection = page.locator('.quality-mrb-governance')
    await expect(governanceSection.getByText('质量 MRB 处置治理')).toBeVisible()
    const governanceCard = governanceSection.locator('.quality-mrb-governance-card')
    await expect(governanceCard).toBeVisible()
    await expect(governanceCard.getByText('AUD-QA-MRB-DISPOSITION-20260521')).toBeVisible()
    await expect(governanceCard.getByText('TRACE-QA-WO-004-MRB-SCHEDULE-IMPACT-20260521')).toBeVisible()

    await page.goto('audit-logs', { waitUntil: 'commit', timeout: 45000 })
    await page.waitForSelector('.audit-replay-panel', { timeout: 60000 })
    const auditCard = page.locator('.audit-replay-panel .decision-card').filter({ hasText: '质量MRB处置：WO-004 装配间隙超差 MRB 处置决策' })
    await expect(auditCard).toBeVisible()
    await auditCard.getByRole('button', { name: '回放决策链' }).click()
    await expect(page.locator('.replay-detail').getByText('TRACE-QA-WO-004-MRB-DISPOSITION-20260521', { exact: true })).toBeVisible()

    await page.goto('quality', { waitUntil: 'commit', timeout: 45000 })
    await page.waitForSelector('.quality-board', { timeout: 60000 })
    await page.locator('.quality-mrb-panel').getByRole('button', { name: '确认 WO-004 MRB 处置闭环' }).click()
    await expect(page.locator('.quality-mrb-panel').getByText('AUD-QA-MRB-CLOSURE-20260521')).toBeVisible()
    await expect(page.locator('.quality-mrb-panel').getByText('TRACE-QA-WO-004-MRB-CLOSURE-20260521')).toBeVisible()

    await page.goto('scheduling', { waitUntil: 'commit', timeout: 45000 })
    await page.waitForSelector('.event-queue-panel', { timeout: 60000 })
    const closedMrbEvent = page.locator('.event-queue-panel .event-card').filter({ hasText: 'WO-004 MRB 报废补料重排' })
    await expect(closedMrbEvent.getByText('已缓解')).toBeVisible()
    await closedMrbEvent.getByRole('button', { name: '复核排产影响' }).click()
    await expect(page.locator('.event-queue-panel').getByText('MRB 处置闭环后的排产复核建议')).toBeVisible()
  })

  test('MRB 处置证据写入失败时真实浏览器展示 fail-loud 且不伪造 MRB 决策', async ({ page }) => {
    await page.addInitScript(() => {
      const originalSetItem = Storage.prototype.setItem
      Storage.prototype.setItem = function setItemWithMrbDispositionFailure(key: string, value: string) {
        if (key === 'aimes_quality_mrb_disposition') {
          throw new Error('MRB disposition storage unavailable from chromium')
        }
        return originalSetItem.call(this, key, value)
      }
    })

    await page.goto('quality', { waitUntil: 'commit', timeout: 45000 })
    await page.waitForSelector('.quality-board', { timeout: 60000 })

    const qualityBoard = page.locator('.quality-board')
    const mrbPanel = page.locator('.quality-mrb-panel')
    await expect(mrbPanel).toBeVisible()
    await expect(mrbPanel.getByText('待 MRB 判定')).toBeVisible()
    await expect(mrbPanel.getByText('INS-004')).toBeVisible()
    await expect(mrbPanel.getByText('WO-004 · 装配')).toBeVisible()
    await expect(mrbPanel.getByRole('button', { name: '生成 WO-004 INS-004 MRB 报废补料决策' })).toBeVisible()

    await mrbPanel.getByRole('button', { name: '生成 WO-004 INS-004 MRB 报废补料决策' }).click()

    const alert = qualityBoard.getByRole('alert')
    await expect(alert).toBeVisible()
    await expect(alert).toContainText('MRB 处置证据写入失败')
    await expect(alert).toContainText('MRB disposition storage unavailable from chromium')
    await expect(mrbPanel.getByText('待 MRB 判定')).toBeVisible()
    await expect(mrbPanel.getByRole('button', { name: '生成 WO-004 INS-004 MRB 报废补料决策' })).toBeVisible()
    await expect(mrbPanel.getByText(/MRB 报废补料决策已生成/)).toBeHidden()
    await expect(mrbPanel.getByRole('button', { name: '确认 WO-004 MRB 处置闭环' })).toBeHidden()

    const mrbRecord = await page.evaluate(() => localStorage.getItem('aimes_quality_mrb_disposition'))
    const evidenceRecords = await page.evaluate(() => localStorage.getItem('aimes_otd_evidence_chain'))
    expect(mrbRecord).toBeNull()
    expect(evidenceRecords ?? '').not.toContain('TRACE-QA-WO-004-MRB-DISPOSITION-20260521')
    expect(evidenceRecords ?? '').not.toContain('TRACE-QA-WO-004-MRB-SCHEDULE-IMPACT-20260521')
  })

  test('MRB 处置闭环写入失败时真实浏览器展示 fail-loud 且不伪造闭环结论', async ({ page }) => {
    await page.addInitScript(() => {
      const activeMrbRecord = {
        id: 'quality-mrb-disposition-20260521',
        title: 'WO-004 装配间隙超差 MRB 处置决策',
        inspectionId: 'INS-004',
        workOrderId: 'WO-004',
        productCode: 'PRD-001',
        processName: '装配',
        equipmentCode: 'ASM-01',
        materialBatchCode: 'MAT-STEEL-A12',
        batchCode: 'WO-004-ASM',
        inspectionPoint: '功能测试',
        defectPattern: '装配间隙超差 / 功能测试不合格',
        defectQuantity: 4,
        disposition: 'scrap_rebuild',
        dispositionLabel: '报废补料重建',
        status: 'active',
        statusLabel: 'MRB 已判定报废补料',
        owner: '质量经理 / 生产经理 / 采购主管',
        dueAt: '今日 15:00',
        otdImpact: 'WO-004 延期 +2 单风险，需补料与重排',
        scheduleImpact: '冻结 WO-004 原装配窗口，插入 MAT-STEEL-A12 补料 ETA、返工替代工单和终检复验窗口。',
        recommendedAction: '建议先隔离 4 件不合格品并判废，采购补齐 MAT-STEEL-A12，排产重建 WO-004 装配与复检窗口，同时把客户交付说明纳入 OTD 复盘。',
        auditId: 'AUD-QA-MRB-DISPOSITION-20260521',
        traceId: 'TRACE-QA-WO-004-MRB-DISPOSITION-20260521',
        scheduleTraceId: 'TRACE-QA-WO-004-MRB-SCHEDULE-IMPACT-20260521',
        createdAt: '2026-05-21T09:30:00.000Z',
        actions: [
          {
            module: '质量',
            owner: '质量经理',
            action: '隔离 4 件装配间隙超差品并完成 MRB 判废',
            dueAt: '今日 11:30',
            evidence: 'Q-HOLD-ASM-WO-004',
          },
          {
            module: '采购',
            owner: '采购主管',
            action: '补料 MAT-STEEL-A12 4 件并确认 ETA',
            dueAt: '今日 13:30',
            evidence: 'PO-MRB-WO-004-MAT-STEEL-A12',
          },
          {
            module: '排产',
            owner: '生产经理',
            action: '冻结原装配窗口并重排补料后装配/复检',
            dueAt: '今日 15:00',
            evidence: 'SCHED-MRB-WO-004-REBUILD',
          },
          {
            module: '客户',
            owner: '客服主管',
            action: '准备 WO-004 延期 +2 单风险说明和恢复承诺',
            dueAt: '今日 16:00',
            evidence: 'CS-MRB-WO-004-OTD-NOTE',
          },
        ],
      }
      localStorage.setItem('aimes_quality_mrb_disposition', JSON.stringify(activeMrbRecord))

      const originalSetItem = Storage.prototype.setItem
      Storage.prototype.setItem = function setItemWithMrbClosureFailure(key: string, value: string) {
        if (key === 'aimes_quality_mrb_disposition') {
          throw new Error('MRB closure storage unavailable from chromium')
        }
        return originalSetItem.call(this, key, value)
      }
    })

    await page.goto('quality', { waitUntil: 'commit', timeout: 45000 })
    await page.waitForSelector('.quality-board', { timeout: 60000 })

    const qualityBoard = page.locator('.quality-board')
    const mrbPanel = page.locator('.quality-mrb-panel')
    await expect(mrbPanel).toBeVisible()
    await expect(mrbPanel.getByText('MRB 已判定报废补料')).toBeVisible()
    await expect(mrbPanel.getByText('TRACE-QA-WO-004-MRB-DISPOSITION-20260521')).toBeVisible()
    await expect(mrbPanel.getByRole('button', { name: '确认 WO-004 MRB 处置闭环' })).toBeVisible()

    await mrbPanel.getByRole('button', { name: '确认 WO-004 MRB 处置闭环' }).click()

    const alert = qualityBoard.getByRole('alert')
    await expect(alert).toBeVisible()
    await expect(alert).toContainText('MRB 处置闭环写入失败')
    await expect(alert).toContainText('MRB closure storage unavailable from chromium')
    await expect(mrbPanel.getByText('MRB 已判定报废补料')).toBeVisible()
    await expect(mrbPanel.getByRole('button', { name: '确认 WO-004 MRB 处置闭环' })).toBeVisible()
    await expect(mrbPanel.getByText(/MRB 处置闭环已确认/)).toBeHidden()
    await expect(mrbPanel.getByText('AUD-QA-MRB-CLOSURE-20260521')).toBeHidden()
    await expect(mrbPanel.getByText('TRACE-QA-WO-004-MRB-CLOSURE-20260521')).toBeHidden()

    const mrbRecord = await page.evaluate(() => localStorage.getItem('aimes_quality_mrb_disposition'))
    const evidenceRecords = await page.evaluate(() => localStorage.getItem('aimes_otd_evidence_chain'))
    expect(mrbRecord ?? '').toContain('"status":"active"')
    expect(mrbRecord ?? '').not.toContain('"status":"closed"')
    expect(mrbRecord ?? '').not.toContain('TRACE-QA-WO-004-MRB-CLOSURE-20260521')
    expect(evidenceRecords ?? '').not.toContain('TRACE-QA-WO-004-MRB-CLOSURE-20260521')
  })

  test('扫码返工复验放行进入审计回放和 OTD 复盘', async ({ page }) => {
    await page.addInitScript(() => {
      const createdAt = '2026-05-21T10:00:00.000Z'
      if (localStorage.getItem('aimes_otd_evidence_chain')) return
      localStorage.setItem('aimes_otd_evidence_chain', JSON.stringify([
        {
          id: 'barcode-rework-WO-RUSH-9001-OP-10',
          stage: '扫码返工',
          title: 'WO-RUSH-9001 CNC 精加工 扫码返工冻结',
          summary: '扫码首件巡检不合格，冻结 OP-20 接收。',
          object: 'WO-RUSH-9001 / OP-10',
          source: '生产报工 / 扫码质检',
          traceId: 'TRACE-QR-WO-RUSH-9001-OP-10-REWORK',
          status: 'active',
          statusLabel: '返工待复验',
          createdAt,
        },
        {
          id: 'barcode-hold-WO-RUSH-9001-OP-10-OP-20',
          stage: '交接冻结',
          title: 'WO-RUSH-9001 OP-10 到 OP-20 交接冻结',
          summary: '质量冻结期间下道接收暂不可用。',
          object: 'WO-RUSH-9001 / OP-10 / OP-20',
          source: '质量闭环 / 工序交接',
          traceId: 'TRACE-QR-WO-RUSH-9001-OP-10-HOLD-OP-20',
          status: 'active',
          statusLabel: '交接冻结中',
          createdAt,
        },
        {
          id: 'barcode-capa-WO-RUSH-9001-OP-10',
          stage: '质量CAPA',
          title: 'WO-RUSH-9001 CNC 精加工 扫码 CAPA 处置',
          summary: '复验前需要核对返工、隔离和标签冻结。',
          object: 'WO-RUSH-9001 / OP-10',
          source: '质量闭环 / CAPA',
          traceId: 'TRACE-QR-WO-RUSH-9001-OP-10-CAPA',
          status: 'active',
          statusLabel: 'CAPA 待验证',
          createdAt,
        },
        {
          id: 'barcode-label-hold-WO-RUSH-9001-OP-10',
          stage: '标签状态',
          title: 'WO-RUSH-9001 流转卡标签冻结',
          summary: '实物流转卡标签状态已从可交接更新为质量冻结。',
          object: 'WO-RUSH-9001',
          source: '条码 / QR 打印 / 质量冻结',
          traceId: 'TRACE-QR-WO-RUSH-9001-OP-10-LABEL-HOLD',
          status: 'active',
          statusLabel: '质量冻结中',
          createdAt,
        },
      ]))
    })

    await page.goto('quality', { waitUntil: 'commit', timeout: 45000 })
    await page.waitForSelector('.quality-board', { timeout: 60000 })

    const releasePanel = page.locator('.barcode-quality-gate-panel')
    await expect(releasePanel.getByText('返工复验待放行')).toBeVisible()
    await releasePanel.getByRole('button', { name: '复验通过并释放交接' }).click()
    await expect(releasePanel.getByText('返工复验已放行', { exact: true })).toBeVisible()
    await expect(releasePanel.getByText('返工复验已放行：OP-20 接收、排产窗口和流转卡标签状态均已更新。')).toBeVisible()

    await page.goto('audit-logs', { waitUntil: 'commit', timeout: 45000 })
    await page.waitForSelector('.audit-replay-panel', { timeout: 60000 })
    const auditPanel = page.locator('.audit-replay-panel')
    await expect(auditPanel.locator('.metric-chip').filter({ hasText: '质量复验释放回放' }).getByText('4')).toBeVisible()

    const holdLabelCard = auditPanel.locator('.decision-card').filter({ hasText: '标签状态：WO-RUSH-9001 流转卡标签冻结' })
    await expect(holdLabelCard.locator('.decision-topline').getByText('OTD 证据链')).toBeVisible()

    const recheckCard = auditPanel.locator('.decision-card').filter({ hasText: '质量复验：WO-RUSH-9001 CNC 精加工 返工复验放行' })
    await expect(recheckCard).toBeVisible()
    await expect(recheckCard.locator('.decision-topline').getByText('质量复验释放证据')).toBeVisible()
    await recheckCard.getByRole('button', { name: '回放决策链' }).click()
    const detail = auditPanel.locator('.replay-detail')
    await expect(detail.getByText('TRACE-QR-WO-RUSH-9001-OP-10-RECHECK', { exact: true })).toBeVisible()
    await expect(detail.getByText(/质量闭环读取 质量闭环 \/ 复验放行 \/ 质量工程师 周工/)).toBeVisible()
    await expect(detail.locator('li').filter({ hasText: '交接释放、排产回写和标签状态' })).toBeVisible()

    const releaseCard = auditPanel.locator('.decision-card').filter({ hasText: '交接释放：WO-RUSH-9001 OP-20 接收已释放' })
    await expect(releaseCard.locator('.decision-topline').getByText('质量复验释放证据')).toBeVisible()
    await releaseCard.getByRole('button', { name: '回放决策链' }).click()
    await expect(detail.getByText('TRACE-QR-WO-RUSH-9001-OP-10-RELEASE-OP-20', { exact: true })).toBeVisible()
    await expect(detail.getByText(/OP-20 接收并恢复下道交接/)).toBeVisible()

    const scheduleCard = auditPanel.locator('.decision-card').filter({ hasText: '排产回写：WO-RUSH-9001 OP-20 接收窗口已恢复' })
    await expect(scheduleCard.locator('.decision-topline').getByText('质量复验释放证据')).toBeVisible()
    const labelCard = auditPanel.locator('.decision-card').filter({ hasText: '标签状态：WO-RUSH-9001 流转卡标签已解冻' })
    await expect(labelCard.locator('.decision-topline').getByText('质量复验释放证据')).toBeVisible()
  })

  test('扫码质量门释放写入失败时真实浏览器展示 fail-loud 且不伪造放行证据', async ({ page }) => {
    await page.addInitScript(() => {
      const createdAt = '2026-05-21T10:00:00.000Z'
      localStorage.setItem('aimes_otd_evidence_chain', JSON.stringify([
        {
          id: 'barcode-rework-WO-RUSH-9001-OP-10',
          stage: '扫码返工',
          title: 'WO-RUSH-9001 CNC 精加工 扫码返工冻结',
          summary: '扫码首件巡检不合格，冻结 OP-20 接收。',
          object: 'WO-RUSH-9001 / OP-10',
          source: '生产报工 / 扫码质检',
          traceId: 'TRACE-QR-WO-RUSH-9001-OP-10-REWORK',
          status: 'active',
          statusLabel: '返工待复验',
          createdAt,
        },
        {
          id: 'barcode-hold-WO-RUSH-9001-OP-10-OP-20',
          stage: '交接冻结',
          title: 'WO-RUSH-9001 OP-10 到 OP-20 交接冻结',
          summary: '质量冻结期间下道接收暂不可用。',
          object: 'WO-RUSH-9001 / OP-10 / OP-20',
          source: '质量闭环 / 工序交接',
          traceId: 'TRACE-QR-WO-RUSH-9001-OP-10-HOLD-OP-20',
          status: 'active',
          statusLabel: '交接冻结中',
          createdAt,
        },
        {
          id: 'barcode-capa-WO-RUSH-9001-OP-10',
          stage: '质量CAPA',
          title: 'WO-RUSH-9001 CNC 精加工 扫码 CAPA 处置',
          summary: '复验前需要核对返工、隔离和标签冻结。',
          object: 'WO-RUSH-9001 / OP-10',
          source: '质量闭环 / CAPA',
          traceId: 'TRACE-QR-WO-RUSH-9001-OP-10-CAPA',
          status: 'active',
          statusLabel: 'CAPA 待验证',
          createdAt,
        },
        {
          id: 'barcode-label-hold-WO-RUSH-9001-OP-10',
          stage: '标签状态',
          title: 'WO-RUSH-9001 流转卡标签冻结',
          summary: '实物流转卡标签状态已从可交接更新为质量冻结。',
          object: 'WO-RUSH-9001',
          source: '条码 / QR 打印 / 质量冻结',
          traceId: 'TRACE-QR-WO-RUSH-9001-OP-10-LABEL-HOLD',
          status: 'active',
          statusLabel: '质量冻结中',
          createdAt,
        },
      ]))
      const originalSetItem = Storage.prototype.setItem
      Storage.prototype.setItem = function setItem(key: string, value: string) {
        if (key === 'aimes_otd_evidence_chain') {
          throw new Error('barcode release storage unavailable from chromium')
        }
        return originalSetItem.call(this, key, value)
      }
    })

    await page.goto('quality', { waitUntil: 'commit', timeout: 45000 })
    await page.waitForSelector('.quality-board', { timeout: 60000 })

    const qualityBoard = page.locator('.quality-board')
    const releasePanel = page.locator('.barcode-quality-gate-panel')
    await expect(releasePanel.getByText('返工复验待放行')).toBeVisible()
    await expect(releasePanel.getByRole('button', { name: '复验通过并释放交接' })).toBeVisible()

    await releasePanel.getByRole('button', { name: '复验通过并释放交接' }).click()

    const alert = qualityBoard.getByRole('alert')
    await expect(alert).toBeVisible()
    await expect(alert).toContainText('扫码质量门释放写入失败')
    await expect(alert).toContainText('barcode release storage unavailable from chromium')
    await expect(releasePanel.getByText('返工复验待放行')).toBeVisible()
    await expect(releasePanel.getByRole('button', { name: '复验通过并释放交接' })).toBeVisible()
    await expect(releasePanel.getByText('返工复验已放行', { exact: true })).toBeHidden()
    await expect(page.locator('.barcode-release-message')).toBeHidden()

    const evidenceRecords = await page.evaluate(() => localStorage.getItem('aimes_otd_evidence_chain'))
    expect(evidenceRecords ?? '').toContain('"status":"active"')
    expect(evidenceRecords ?? '').not.toContain('TRACE-QR-WO-RUSH-9001-OP-10-RECHECK')
    expect(evidenceRecords ?? '').not.toContain('TRACE-QR-WO-RUSH-9001-OP-10-RELEASE-OP-20')
    expect(evidenceRecords ?? '').not.toContain('TRACE-QR-WO-RUSH-9001-OP-10-SCHEDULE-RELEASE')
    expect(evidenceRecords ?? '').not.toContain('TRACE-QR-WO-RUSH-9001-OP-10-LABEL-RELEASE')
  })

  test('扫码返工样本沉淀为 CAPA 知识并被助手复用', async ({ page }) => {
    await page.addInitScript(() => {
      const createdAt = '2026-05-21T10:00:00.000Z'
      if (localStorage.getItem('aimes_otd_evidence_chain')) return
      localStorage.setItem('aimes_otd_evidence_chain', JSON.stringify([
        {
          id: 'barcode-rework-WO-RUSH-9001-OP-10',
          stage: '扫码返工',
          title: 'WO-RUSH-9001 CNC 精加工 扫码返工冻结',
          summary: '扫码首件巡检不合格，冻结 OP-20 接收。',
          object: 'WO-RUSH-9001 / OP-10',
          source: '生产报工 / 扫码质检',
          traceId: 'TRACE-QR-WO-RUSH-9001-OP-10-REWORK',
          status: 'active',
          statusLabel: '返工待复验',
          createdAt,
        },
        {
          id: 'barcode-isolation-WO-RUSH-9001-OP-10',
          stage: '质量隔离',
          title: 'WO-RUSH-9001 CNC 精加工 AL-202605 批次隔离',
          summary: 'AL-202605 已进入 Q-HOLD-01 隔离区，等待复验释放。',
          object: 'WO-RUSH-9001 / AL-202605 / Q-HOLD-01',
          source: '生产报工 / 扫码质检',
          traceId: 'TRACE-QR-WO-RUSH-9001-OP-10-ISOLATION',
          status: 'active',
          statusLabel: '隔离待复验',
          createdAt,
        },
        {
          id: 'barcode-rework-cost-WO-RUSH-9001-OP-10',
          stage: '返工成本',
          title: 'WO-RUSH-9001 CNC 精加工 返工工时成本预估',
          summary: '预计返工 2h，成本约 360 元。',
          object: 'WO-RUSH-9001 / OP-10',
          source: '生产报工 / 成本预估',
          traceId: 'TRACE-QR-WO-RUSH-9001-OP-10-REWORK-COST',
          status: 'active',
          statusLabel: '成本待结算',
          createdAt,
        },
      ]))
    })

    await page.goto('quality', { waitUntil: 'commit', timeout: 45000 })
    await page.waitForSelector('.quality-board', { timeout: 60000 })

    const samplePanel = page.locator('.barcode-knowledge-sample-panel')
    await expect(samplePanel).toBeVisible()
    await expect(samplePanel.getByText('扫码返工样本沉淀为 CAPA 推荐')).toBeVisible()
    await samplePanel.getByRole('button', { name: '沉淀为 CAPA 知识样本' }).click()
    await expect(samplePanel.getByText('AUD-KG-QA-REWORK-20260521-001')).toBeVisible()
    await expect(samplePanel.getByText('TRACE-KG-QA-WO-RUSH-9001-OP-10-REWORK-SAMPLE')).toBeVisible()

    const capaPanel = page.locator('.quality-capa-panel')
    await expect(capaPanel.locator('.sample-reuse-card')).toBeVisible()
    await expect(capaPanel.getByText('扫码返工 CAPA 样本库 QK-20260521')).toBeVisible()
    await expect(capaPanel.getByText(/同类 CNC 首件尺寸偏差先冻结下道交接/)).toBeVisible()

    await page.goto('knowledge/documents', { waitUntil: 'commit', timeout: 45000 })
    await page.waitForSelector('.knowledge-governance-panel', { timeout: 60000 })
    const knowledgeCard = page.locator('.knowledge-governance-panel .governance-card').filter({ hasText: '扫码返工 CAPA 样本库' })
    await expect(knowledgeCard).toBeVisible()
    await expect(knowledgeCard.getByText('QK-20260521')).toBeVisible()
    await expect(knowledgeCard.getByText('索引：已索引')).toBeVisible()
    await expect(knowledgeCard.getByText('质量根因分析')).toBeVisible()

    const traceCard = page.locator('.assistant-trace-panel .trace-card').filter({ hasText: '扫码返工同类问题如何复用 CAPA？' })
    await expect(traceCard).toBeVisible()
    await expect(traceCard.locator('.trace-topline span').getByText('可引用', { exact: true })).toBeVisible()
    await expect(traceCard.getByText('扫码返工 CAPA 样本库 QK-20260521')).toBeVisible()
    await expect(traceCard.getByText(/AUD-KG-QA-REWORK-20260521-001 已沉淀扫码质量样本/)).toBeVisible()

    await page.locator('.chat-fab').click()
    await page.locator('.chat-input').fill('扫码返工同类问题怎么复用 CAPA？')
    await page.locator('.send-btn').click()
    const chat = page.locator('.chat-panel')
    await expect(chat.getByText('扫码质量复用建议：WO-RUSH-9001 的返工样本已可复用。')).toBeVisible()
    await expect(chat.getByText(/AUD-KG-QA-REWORK-20260521-001/)).toBeVisible()
    await expect(chat.getByText(/同类 CNC 首件尺寸偏差先冻结下道交接/)).toBeVisible()
    await chat.locator('.sources-toggle').click()
    await expect(chat.locator('.source-item').filter({ hasText: '扫码返工 CAPA 样本库 QK-20260521' })).toBeVisible()

    await page.goto('audit-logs', { waitUntil: 'commit', timeout: 45000 })
    await page.waitForSelector('.audit-replay-panel', { timeout: 60000 })
    const auditCard = page.locator('.audit-replay-panel .decision-card').filter({ hasText: '质量知识：WO-RUSH-9001 扫码返工 CAPA 样本已入库' })
    await expect(auditCard).toBeVisible()
    await auditCard.getByRole('button', { name: '回放决策链' }).click()
    await expect(page.locator('.replay-detail').getByText('TRACE-KG-QA-WO-RUSH-9001-OP-10-REWORK-SAMPLE', { exact: true })).toBeVisible()
  })

  test('质量知识样本写入失败时真实浏览器展示 fail-loud 且不伪造样本入库', async ({ page }) => {
    await page.addInitScript(() => {
      const createdAt = '2026-05-21T10:00:00.000Z'
      localStorage.setItem('aimes_otd_evidence_chain', JSON.stringify([
        {
          id: 'barcode-rework-WO-RUSH-9001-OP-10',
          stage: '扫码返工',
          title: 'WO-RUSH-9001 CNC 精加工 扫码返工冻结',
          summary: '扫码首件巡检不合格，冻结 OP-20 接收。',
          object: 'WO-RUSH-9001 / OP-10',
          source: '生产报工 / 扫码质检',
          traceId: 'TRACE-QR-WO-RUSH-9001-OP-10-REWORK',
          status: 'active',
          statusLabel: '返工待复验',
          createdAt,
        },
        {
          id: 'barcode-isolation-WO-RUSH-9001-OP-10',
          stage: '质量隔离',
          title: 'WO-RUSH-9001 CNC 精加工 AL-202605 批次隔离',
          summary: 'AL-202605 已进入 Q-HOLD-01 隔离区，等待复验释放。',
          object: 'WO-RUSH-9001 / AL-202605 / Q-HOLD-01',
          source: '生产报工 / 扫码质检',
          traceId: 'TRACE-QR-WO-RUSH-9001-OP-10-ISOLATION',
          status: 'active',
          statusLabel: '隔离待复验',
          createdAt,
        },
        {
          id: 'barcode-rework-cost-WO-RUSH-9001-OP-10',
          stage: '返工成本',
          title: 'WO-RUSH-9001 CNC 精加工 返工工时成本预估',
          summary: '预计返工 2h，成本约 360 元。',
          object: 'WO-RUSH-9001 / OP-10',
          source: '生产报工 / 成本预估',
          traceId: 'TRACE-QR-WO-RUSH-9001-OP-10-REWORK-COST',
          status: 'active',
          statusLabel: '成本待结算',
          createdAt,
        },
      ]))
      const originalSetItem = Storage.prototype.setItem
      Storage.prototype.setItem = function setItemWithKnowledgeSampleFailure(key: string, value: string) {
        if (key === 'aimes_quality_knowledge_samples') {
          throw new Error('quality knowledge sample storage unavailable from chromium')
        }
        return originalSetItem.call(this, key, value)
      }
    })

    await page.goto('quality', { waitUntil: 'commit', timeout: 45000 })
    await page.waitForSelector('.quality-board', { timeout: 60000 })

    const qualityBoard = page.locator('.quality-board')
    const samplePanel = page.locator('.barcode-knowledge-sample-panel')
    await expect(samplePanel).toBeVisible()
    await expect(samplePanel.getByText('扫码返工样本沉淀为 CAPA 推荐')).toBeVisible()
    await expect(samplePanel.getByRole('button', { name: '沉淀为 CAPA 知识样本' })).toBeVisible()

    await samplePanel.getByRole('button', { name: '沉淀为 CAPA 知识样本' }).click()

    const alert = qualityBoard.getByRole('alert')
    await expect(alert).toBeVisible()
    await expect(alert).toContainText('质量知识样本写入失败')
    await expect(alert).toContainText('quality knowledge sample storage unavailable from chromium')
    await expect(samplePanel.getByRole('button', { name: '沉淀为 CAPA 知识样本' })).toBeVisible()
    await expect(samplePanel.locator('.sample-synced')).toBeHidden()
    await expect(samplePanel.getByText('AUD-KG-QA-REWORK-20260521-001')).toBeHidden()
    await expect(samplePanel.getByText('TRACE-KG-QA-WO-RUSH-9001-OP-10-REWORK-SAMPLE')).toBeHidden()
    await expect(page.locator('.barcode-release-message')).toBeHidden()

    const sampleRecords = await page.evaluate(() => localStorage.getItem('aimes_quality_knowledge_samples'))
    const evidenceRecords = await page.evaluate(() => localStorage.getItem('aimes_otd_evidence_chain'))
    expect(sampleRecords).toBeNull()
    expect(evidenceRecords ?? '').not.toContain('TRACE-KG-QA-WO-RUSH-9001-OP-10-REWORK-SAMPLE')
  })

  test('质量知识复用草案写入失败时真实浏览器展示 fail-loud 且不伪造草案证据', async ({ page }) => {
    await page.addInitScript(() => {
      const createdAt = '2026-05-21T10:00:00.000Z'
      localStorage.setItem('aimes_otd_evidence_chain', JSON.stringify([
        {
          id: 'barcode-rework-WO-RUSH-9001-OP-10',
          stage: '扫码返工',
          title: 'WO-RUSH-9001 CNC 精加工 扫码返工冻结',
          summary: '扫码首件巡检不合格，冻结 OP-20 接收。',
          object: 'WO-RUSH-9001 / OP-10',
          source: '生产报工 / 扫码质检',
          traceId: 'TRACE-QR-WO-RUSH-9001-OP-10-REWORK',
          status: 'active',
          statusLabel: '返工待复验',
          createdAt,
        },
        {
          id: 'barcode-isolation-WO-RUSH-9001-OP-10',
          stage: '质量隔离',
          title: 'WO-RUSH-9001 CNC 精加工 AL-202605 批次隔离',
          summary: 'AL-202605 已进入 Q-HOLD-01 隔离区，等待复验释放。',
          object: 'WO-RUSH-9001 / AL-202605 / Q-HOLD-01',
          source: '生产报工 / 扫码质检',
          traceId: 'TRACE-QR-WO-RUSH-9001-OP-10-ISOLATION',
          status: 'active',
          statusLabel: '隔离待复验',
          createdAt,
        },
        {
          id: 'barcode-rework-cost-WO-RUSH-9001-OP-10',
          stage: '返工成本',
          title: 'WO-RUSH-9001 CNC 精加工 返工工时成本预估',
          summary: '预计返工 2h，成本约 360 元。',
          object: 'WO-RUSH-9001 / OP-10',
          source: '生产报工 / 成本预估',
          traceId: 'TRACE-QR-WO-RUSH-9001-OP-10-REWORK-COST',
          status: 'active',
          statusLabel: '成本待结算',
          createdAt,
        },
      ]))
    })

    await page.goto('quality', { waitUntil: 'commit', timeout: 45000 })
    await page.waitForSelector('.quality-board', { timeout: 60000 })

    const qualityBoard = page.locator('.quality-board')
    const samplePanel = page.locator('.barcode-knowledge-sample-panel')
    await samplePanel.getByRole('button', { name: '沉淀为 CAPA 知识样本' }).click()
    await expect(samplePanel.getByText('TRACE-KG-QA-WO-RUSH-9001-OP-10-REWORK-SAMPLE')).toBeVisible()

    await page.evaluate(() => {
      const originalSetItem = Storage.prototype.setItem
      Storage.prototype.setItem = function setItemWithKnowledgeReuseDraftFailure(key: string, value: string) {
        if (key === 'aimes_quality_knowledge_reuse_drafts') {
          throw new Error('quality reuse draft storage unavailable from chromium')
        }
        return originalSetItem.call(this, key, value)
      }
    })

    const draftCard = samplePanel.locator('.reuse-draft-card')
    await expect(draftCard.getByText('WO-DEMO-1012 命中扫码返工样本')).toBeVisible()
    await expect(draftCard.getByRole('button', { name: '生成同类缺陷处置草案' })).toBeVisible()

    await draftCard.getByRole('button', { name: '生成同类缺陷处置草案' }).click()

    const alert = qualityBoard.getByRole('alert')
    await expect(alert).toBeVisible()
    await expect(alert).toContainText('质量知识复用草案写入失败')
    await expect(alert).toContainText('quality reuse draft storage unavailable from chromium')
    await expect(draftCard.getByText('WO-DEMO-1012 命中扫码返工样本')).toBeVisible()
    await expect(draftCard.getByRole('button', { name: '生成同类缺陷处置草案' })).toBeVisible()
    await expect(draftCard.locator('.reuse-draft-result')).toBeHidden()
    await expect(draftCard.getByText('WO-DEMO-1012 处置草案')).toBeHidden()
    await expect(draftCard.getByText('AUD-KG-QA-REUSE-20260521-001')).toBeHidden()
    await expect(draftCard.getByText('TRACE-KG-QA-WO-DEMO-1012-OP-10-REUSE-DRAFT')).toBeHidden()
    await expect(page.locator('.barcode-release-message').getByText(/同类缺陷处置草案已生成/)).toBeHidden()

    const sampleRecords = await page.evaluate(() => localStorage.getItem('aimes_quality_knowledge_samples'))
    const draftRecords = await page.evaluate(() => localStorage.getItem('aimes_quality_knowledge_reuse_drafts'))
    const evidenceRecords = await page.evaluate(() => localStorage.getItem('aimes_otd_evidence_chain'))
    expect(sampleRecords ?? '').toContain('TRACE-KG-QA-WO-RUSH-9001-OP-10-REWORK-SAMPLE')
    expect(draftRecords).toBeNull()
    expect(evidenceRecords ?? '').not.toContain('TRACE-KG-QA-WO-DEMO-1012-OP-10-REUSE-DRAFT')
  })

  test('同类缺陷命中质量知识后生成处置草案和复用评分', async ({ page }) => {
    await page.addInitScript(() => {
      const createdAt = '2026-05-21T10:00:00.000Z'
      if (localStorage.getItem('aimes_otd_evidence_chain')) return
      localStorage.setItem('aimes_otd_evidence_chain', JSON.stringify([
        {
          id: 'barcode-rework-WO-RUSH-9001-OP-10',
          stage: '扫码返工',
          title: 'WO-RUSH-9001 CNC 精加工 扫码返工冻结',
          summary: '扫码首件巡检不合格，冻结 OP-20 接收。',
          object: 'WO-RUSH-9001 / OP-10',
          source: '生产报工 / 扫码质检',
          traceId: 'TRACE-QR-WO-RUSH-9001-OP-10-REWORK',
          status: 'active',
          statusLabel: '返工待复验',
          createdAt,
        },
        {
          id: 'barcode-isolation-WO-RUSH-9001-OP-10',
          stage: '质量隔离',
          title: 'WO-RUSH-9001 CNC 精加工 AL-202605 批次隔离',
          summary: 'AL-202605 已进入 Q-HOLD-01 隔离区，等待复验释放。',
          object: 'WO-RUSH-9001 / AL-202605 / Q-HOLD-01',
          source: '生产报工 / 扫码质检',
          traceId: 'TRACE-QR-WO-RUSH-9001-OP-10-ISOLATION',
          status: 'active',
          statusLabel: '隔离待复验',
          createdAt,
        },
        {
          id: 'barcode-rework-cost-WO-RUSH-9001-OP-10',
          stage: '返工成本',
          title: 'WO-RUSH-9001 CNC 精加工 返工工时成本预估',
          summary: '预计返工 2h，成本约 360 元。',
          object: 'WO-RUSH-9001 / OP-10',
          source: '生产报工 / 成本预估',
          traceId: 'TRACE-QR-WO-RUSH-9001-OP-10-REWORK-COST',
          status: 'active',
          statusLabel: '成本待结算',
          createdAt,
        },
      ]))
    })

    await page.goto('quality', { waitUntil: 'commit', timeout: 45000 })
    await page.waitForSelector('.quality-board', { timeout: 60000 })

    const samplePanel = page.locator('.barcode-knowledge-sample-panel')
    await samplePanel.getByRole('button', { name: '沉淀为 CAPA 知识样本' }).click()
    await expect(samplePanel.getByText('TRACE-KG-QA-WO-RUSH-9001-OP-10-REWORK-SAMPLE')).toBeVisible()

    const draftCard = samplePanel.locator('.reuse-draft-card')
    await expect(draftCard.getByText('WO-DEMO-1012 命中扫码返工样本')).toBeVisible()
    await draftCard.getByRole('button', { name: '生成同类缺陷处置草案' }).click()
    await expect(draftCard.getByText('WO-DEMO-1012 处置草案')).toBeVisible()
    await expect(draftCard.getByText('88 分')).toBeVisible()
    await expect(draftCard.getByText('AUD-KG-QA-REUSE-20260521-001')).toBeVisible()
    await expect(draftCard.getByText('TRACE-KG-QA-WO-DEMO-1012-OP-10-REUSE-DRAFT')).toBeVisible()
    await expect(draftCard.getByText(/冻结 WO-DEMO-1012 OP-10 到 OP-20/)).toBeVisible()
    await expect(page.locator('.barcode-release-message').getByText(/同类缺陷处置草案已生成：WO-DEMO-1012 命中 92%/)).toBeVisible()

    const capaPanel = page.locator('.quality-capa-panel')
    const draftReuseCard = capaPanel.locator('.draft-reuse-card')
    await expect(draftReuseCard.getByText('知识命中草案')).toBeVisible()
    await expect(draftReuseCard.getByText('WO-DEMO-1012 匹配 92%')).toBeVisible()
    await expect(draftReuseCard.getByText('复用效果 88 分')).toBeVisible()
    const formalFlow = draftReuseCard.locator('.formal-capa-flow')
    await expect(formalFlow.getByText('草案待质量工程师复核')).toBeVisible()
    await formalFlow.getByRole('button', { name: '复核草案并转正式 CAPA' }).click()
    await expect(formalFlow.getByText('WO-DEMO-1012 OP-10 同类首件尺寸偏差正式 CAPA')).toBeVisible()
    await expect(formalFlow.getByText('AUD-KG-QA-REUSE-CAPA-20260521-001')).toBeVisible()
    await expect(formalFlow.getByText('TRACE-KG-QA-WO-DEMO-1012-OP-10-FORMAL-CAPA')).toBeVisible()
    await expect(capaPanel.getByText(/已转正式 CAPA，等待按 复验尺寸 Cpk >= 1.33/)).toBeVisible()
    await formalFlow.getByRole('button', { name: '验证复用效果并回写' }).click()
    await expect(formalFlow.getByText('TRACE-KG-QA-WO-DEMO-1012-OP-10-REUSE-EFFECT')).toBeVisible()
    await expect(formalFlow.getByText('复用评分 88 -> 94 分')).toBeVisible()
    await expect(capaPanel.getByText(/已验证并回写复用效果，评分 88 -> 94 分/)).toBeVisible()
    const rankingPanel = draftReuseCard.locator('.reuse-ranking-panel')
    await expect(rankingPanel.getByText('质量知识复用排序')).toBeVisible()
    await expect(rankingPanel.locator('.ranking-card').first().getByText('优先复用')).toBeVisible()
    await expect(rankingPanel.locator('.ranking-card').first().getByText('94 分')).toBeVisible()
    const lowScoreCard = rankingPanel.locator('.ranking-card').filter({ hasText: 'WO-DEMO-1018 OP-20 装配扭矩偏移复用尝试' })
    await expect(lowScoreCard.getByText('低分复核')).toBeVisible()
    await expect(lowScoreCard.getByText('61 分')).toBeVisible()
    await rankingPanel.getByRole('button', { name: '生成低分样本复核队列' }).click()
    await expect(rankingPanel.getByText('WO-DEMO-1018 OP-20 低分复用样本复核')).toBeVisible()
    await expect(rankingPanel.getByText('AUD-KG-QA-LOW-SCORE-20260521-001')).toBeVisible()
    await expect(rankingPanel.getByText('TRACE-KG-QA-WO-DEMO-1018-OP-20-LOW-SCORE-REVIEW')).toBeVisible()
    await rankingPanel.getByRole('button', { name: '完成复核并禁用直接复用' }).click()
    await expect(rankingPanel.getByText(/禁止 AI 助手把该低分候选作为直接 CAPA 推荐/)).toBeVisible()
    await expect(rankingPanel.getByText('AUD-KG-QA-LOW-SCORE-DECISION-20260521-001')).toBeVisible()
    await expect(rankingPanel.getByText('TRACE-KG-QA-WO-DEMO-1018-OP-20-LOW-SCORE-DECISION')).toBeVisible()
    await expect(rankingPanel.getByText('TRACE-KG-QA-WO-DEMO-1018-OP-20-RETRAINING-CANDIDATE')).toBeVisible()

    await page.locator('.chat-fab').click()
    await page.locator('.chat-input').fill('扫码返工同类问题怎么复用 CAPA？')
    await page.locator('.send-btn').click()
    const chat = page.locator('.chat-panel')
    await expect(chat.getByText(/低分复核结论：WO-DEMO-1018 OP-20 低分复用样本复核/)).toBeVisible()
    await expect(chat.getByText(/matchScore < 70/)).toBeVisible()
    await expect(chat.getByText(/TRACE-KG-QA-WO-DEMO-1018-OP-20-RETRAINING-CANDIDATE/)).toBeVisible()
    await expect(chat.getByText(/TRACE-KG-QA-WO-DEMO-1018-OP-20-LOW-SCORE-DECISION/)).toBeVisible()
    await chat.locator('.sources-toggle').click()
    await expect(chat.locator('.source-item').filter({ hasText: 'WO-DEMO-1018 低分复用复核队列' })).toBeVisible()

    await page.goto('report', { waitUntil: 'commit', timeout: 45000 })
    await page.waitForSelector('.report-board', { timeout: 60000 })
    const evidenceCard = page.locator('.otd-evidence-chain .evidence-chain-card').filter({ hasText: '质量处置草案' })
    await expect(evidenceCard.getByText('WO-DEMO-1012 同类缺陷处置草案已生成')).toBeVisible()
    await expect(evidenceCard.getByText('TRACE-KG-QA-WO-DEMO-1012-OP-10-REUSE-DRAFT')).toBeVisible()
    const formalEvidenceCard = page.locator('.otd-evidence-chain .evidence-chain-card').filter({ hasText: '正式CAPA' })
    await expect(formalEvidenceCard.getByText('WO-DEMO-1012 OP-10 同类首件尺寸偏差正式 CAPA')).toBeVisible()
    await expect(formalEvidenceCard.getByText('TRACE-KG-QA-WO-DEMO-1012-OP-10-FORMAL-CAPA')).toBeVisible()
    const effectEvidenceCard = page.locator('.otd-evidence-chain .evidence-chain-card').filter({ hasText: '质量复用效果' })
    await expect(effectEvidenceCard.getByText('WO-DEMO-1012 知识复用效果已回写')).toBeVisible()
    await expect(effectEvidenceCard.getByText('TRACE-KG-QA-WO-DEMO-1012-OP-10-REUSE-EFFECT')).toBeVisible()
    const lowScoreEvidenceCard = page.locator('.otd-evidence-chain .evidence-chain-card').filter({ hasText: '低分复核' })
    await expect(lowScoreEvidenceCard.getByText('WO-DEMO-1018 OP-20 低分复用样本复核')).toBeVisible()
    await expect(lowScoreEvidenceCard.getByText('TRACE-KG-QA-WO-DEMO-1018-OP-20-LOW-SCORE-REVIEW')).toBeVisible()
    const reviewDecisionCard = page.locator('.otd-evidence-chain .evidence-chain-card').filter({ hasText: '低分复核结论' })
    await expect(reviewDecisionCard.getByText('WO-DEMO-1018 OP-20 低分复用已禁用')).toBeVisible()
    await expect(reviewDecisionCard.getByText('TRACE-KG-QA-WO-DEMO-1018-OP-20-LOW-SCORE-DECISION')).toBeVisible()
    const retrainingCard = page.locator('.otd-evidence-chain .evidence-chain-card').filter({ hasText: '知识再训练' })
    await expect(retrainingCard.getByText('WO-DEMO-1018 OP-20 进入再训练候选')).toBeVisible()
    await expect(retrainingCard.getByText('TRACE-KG-QA-WO-DEMO-1018-OP-20-RETRAINING-CANDIDATE')).toBeVisible()

    await page.goto('audit-logs', { waitUntil: 'commit', timeout: 45000 })
    await page.waitForSelector('.audit-replay-panel', { timeout: 60000 })
    const auditCard = page.locator('.audit-replay-panel .decision-card').filter({ hasText: '质量处置草案：WO-DEMO-1012 同类缺陷处置草案已生成' })
    await expect(auditCard).toBeVisible()
    await auditCard.getByRole('button', { name: '回放决策链' }).click()
    const detail = page.locator('.audit-replay-panel .replay-detail')
    await expect(detail.getByText('TRACE-KG-QA-WO-DEMO-1012-OP-10-REUSE-DRAFT', { exact: true })).toBeVisible()
    await expect(detail.getByText(/AUD-KG-QA-REUSE-20260521-001 命中 92%/)).toBeVisible()
    const effectAuditCard = page.locator('.audit-replay-panel .decision-card').filter({ hasText: '质量复用效果：WO-DEMO-1012 知识复用效果已回写' })
    await expect(effectAuditCard).toBeVisible()
    await effectAuditCard.getByRole('button', { name: '回放决策链' }).click()
    await expect(detail.getByText('TRACE-KG-QA-WO-DEMO-1012-OP-10-REUSE-EFFECT', { exact: true })).toBeVisible()
    await expect(detail.getByText(/复用评分从 88 分提升到 94 分/)).toBeVisible()
    const lowScoreAuditCard = page.locator('.audit-replay-panel .decision-card').filter({ hasText: '低分复核：WO-DEMO-1018 OP-20 低分复用样本复核' })
    await expect(lowScoreAuditCard).toBeVisible()
    await lowScoreAuditCard.getByRole('button', { name: '回放决策链' }).click()
    await expect(detail.getByText('TRACE-KG-QA-WO-DEMO-1018-OP-20-LOW-SCORE-REVIEW', { exact: true })).toBeVisible()
    await expect(detail.getByText(/低于 70 分阈值/)).toBeVisible()
    const reviewDecisionAuditCard = page.locator('.audit-replay-panel .decision-card').filter({ hasText: '低分复核结论：WO-DEMO-1018 OP-20 低分复用已禁用' })
    await expect(reviewDecisionAuditCard).toBeVisible()
    await reviewDecisionAuditCard.getByRole('button', { name: '回放决策链' }).click()
    await expect(detail.getByText('TRACE-KG-QA-WO-DEMO-1018-OP-20-LOW-SCORE-DECISION', { exact: true })).toBeVisible()
    await expect(detail.getByText(/禁止 AI 助手把该低分候选作为直接 CAPA 推荐/)).toBeVisible()
    const retrainingAuditCard = page.locator('.audit-replay-panel .decision-card').filter({ hasText: '知识再训练：WO-DEMO-1018 OP-20 进入再训练候选' })
    await expect(retrainingAuditCard).toBeVisible()
    await retrainingAuditCard.getByRole('button', { name: '回放决策链' }).click()
    await expect(detail.getByText('TRACE-KG-QA-WO-DEMO-1018-OP-20-RETRAINING-CANDIDATE', { exact: true })).toBeVisible()
    await expect(detail.getByText(/降低跨工序扫码返工样本的召回权重/)).toBeVisible()
  })

  test('质量知识复用转正式 CAPA 写入失败时真实浏览器展示 fail-loud 且不伪造正式 CAPA', async ({ page }) => {
    await page.addInitScript(() => {
      const originalSetItem = Storage.prototype.setItem
      Storage.prototype.setItem = function setItemWithReuseClosureFailure(key: string, value: string) {
        if (key === 'aimes_quality_knowledge_reuse_closures') {
          throw new Error('reuse closure storage unavailable from chromium')
        }
        return originalSetItem.call(this, key, value)
      }

      const sample = {
        id: 'quality-knowledge-sample-qr-rework-wo-rush-9001-op-10',
        workOrderId: 'WO-RUSH-9001',
        operationCode: 'OP-10',
        processName: 'CNC 精加工',
        equipmentCode: 'CNC-002',
        materialBatch: 'AL-202605',
        defectPattern: '首件尺寸偏差 + Ra 粗糙度复检',
        documentId: 'kg-quality-barcode-rework',
        documentTitle: '扫码返工 CAPA 样本库',
        version: 'QK-20260521',
        validUntil: '2026-12-31',
        auditId: 'AUD-KG-QA-REWORK-20260521-001',
        traceId: 'TRACE-KG-QA-WO-RUSH-9001-OP-10-REWORK-SAMPLE',
        createdAt: '2026-05-21T10:00:00.000Z',
        summary: 'WO-RUSH-9001 OP-10 扫码质检不合格已沉淀为可复用样本。',
        capaRecommendations: ['同类 CNC 首件尺寸偏差先冻结下道交接并隔离 AL 批次。'],
        reuseTargets: ['质量根因分析', 'AI 生产助手', '文档上传', '报表中心', '审计日志'],
        evidenceTraceIds: ['TRACE-QR-WO-RUSH-9001-OP-10-REWORK'],
      }
      const draft = {
        id: 'quality-knowledge-reuse-draft-wo-demo-1012-op-10',
        sourceSampleId: sample.id,
        sourceTraceId: sample.traceId,
        targetWorkOrderId: 'WO-DEMO-1012',
        targetOperationCode: 'OP-10',
        targetProcessName: 'CNC 精加工',
        targetEquipmentCode: 'CNC-002',
        targetMaterialBatch: 'AL-202605-B',
        targetDefectPattern: '首件尺寸偏差',
        matchScore: 92,
        effectScore: 88,
        auditId: 'AUD-KG-QA-REUSE-20260521-001',
        traceId: 'TRACE-KG-QA-WO-DEMO-1012-OP-10-REUSE-DRAFT',
        createdAt: '2026-05-21T10:10:00.000Z',
        summary: 'WO-DEMO-1012 OP-10 命中扫码返工 CAPA 样本，同设备、同工序、同 AL 批次族和同类首件尺寸偏差均匹配。',
        matchDimensions: [
          { label: '工序', source: 'CNC 精加工', target: 'CNC 精加工', matched: true },
          { label: '设备', source: 'CNC-002', target: 'CNC-002', matched: true },
          { label: '材料族', source: 'AL-202605', target: 'AL-202605-B', matched: true },
          { label: '缺陷模式', source: '首件尺寸偏差', target: '首件尺寸偏差', matched: true },
        ],
        dispositionDraft: ['冻结 WO-DEMO-1012 OP-10 到 OP-20 的下道交接。'],
        effectMetrics: [{ label: '分析节省', value: '45 分钟' }],
        evidenceTraceIds: [sample.traceId],
      }
      localStorage.setItem('aimes_quality_knowledge_samples', JSON.stringify([sample]))
      localStorage.setItem('aimes_quality_knowledge_reuse_drafts', JSON.stringify([draft]))
    })

    await page.route('**/api/v1/scheduling/quality-knowledge-evidence**', async route => {
      if (route.request().method() === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: '[]',
        })
        return
      }
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: '{}',
      })
    })

    await page.goto('quality', { waitUntil: 'commit', timeout: 45000 })
    await page.waitForSelector('.quality-board', { timeout: 60000 })

    const capaPanel = page.locator('.quality-capa-panel')
    const draftReuseCard = capaPanel.locator('.draft-reuse-card')
    await expect(draftReuseCard.getByText('知识命中草案')).toBeVisible()
    await expect(draftReuseCard.getByText('WO-DEMO-1012 匹配 92%')).toBeVisible()

    const formalFlow = draftReuseCard.locator('.formal-capa-flow')
    await expect(formalFlow.getByText('草案待质量工程师复核')).toBeVisible()
    await formalFlow.getByRole('button', { name: '复核草案并转正式 CAPA' }).click()

    const alert = capaPanel.getByRole('alert')
    await expect(alert).toBeVisible()
    await expect(alert).toContainText('质量知识复用转正式 CAPA 失败')
    await expect(alert).toContainText('reuse closure storage unavailable from chromium')
    await expect(formalFlow.getByText('草案待质量工程师复核')).toBeVisible()
    await expect(formalFlow.getByRole('button', { name: '复核草案并转正式 CAPA' })).toBeVisible()
    await expect(formalFlow.getByText('TRACE-KG-QA-WO-DEMO-1012-OP-10-FORMAL-CAPA')).toBeHidden()
    await expect(capaPanel.getByText(/已转正式 CAPA/)).toBeHidden()

    const closureRecords = await page.evaluate(() => localStorage.getItem('aimes_quality_knowledge_reuse_closures'))
    const evidenceRecords = await page.evaluate(() => localStorage.getItem('aimes_otd_evidence_chain'))
    expect(closureRecords).toBeNull()
    expect(evidenceRecords ?? '').not.toContain('TRACE-KG-QA-WO-DEMO-1012-OP-10-FORMAL-CAPA')
  })

  test('质量知识复用效果验证写入失败时真实浏览器展示 fail-loud 且不伪造效果回写', async ({ page }) => {
    await page.addInitScript(() => {
      const sample = {
        id: 'quality-knowledge-sample-qr-rework-wo-rush-9001-op-10',
        workOrderId: 'WO-RUSH-9001',
        operationCode: 'OP-10',
        processName: 'CNC 精加工',
        equipmentCode: 'CNC-002',
        materialBatch: 'AL-202605',
        defectPattern: '首件尺寸偏差 + Ra 粗糙度复检',
        documentId: 'kg-quality-barcode-rework',
        documentTitle: '扫码返工 CAPA 样本库',
        version: 'QK-20260521',
        validUntil: '2026-12-31',
        auditId: 'AUD-KG-QA-REWORK-20260521-001',
        traceId: 'TRACE-KG-QA-WO-RUSH-9001-OP-10-REWORK-SAMPLE',
        createdAt: '2026-05-21T10:00:00.000Z',
        summary: 'WO-RUSH-9001 OP-10 扫码质检不合格已沉淀为可复用样本。',
        capaRecommendations: ['同类 CNC 首件尺寸偏差先冻结下道交接并隔离 AL 批次。'],
        reuseTargets: ['质量根因分析', 'AI 生产助手', '文档上传', '报表中心', '审计日志'],
        evidenceTraceIds: ['TRACE-QR-WO-RUSH-9001-OP-10-REWORK'],
      }
      const draft = {
        id: 'quality-knowledge-reuse-draft-wo-demo-1012-op-10',
        sourceSampleId: sample.id,
        sourceTraceId: sample.traceId,
        targetWorkOrderId: 'WO-DEMO-1012',
        targetOperationCode: 'OP-10',
        targetProcessName: 'CNC 精加工',
        targetEquipmentCode: 'CNC-002',
        targetMaterialBatch: 'AL-202605-B',
        targetDefectPattern: '首件尺寸偏差',
        matchScore: 92,
        effectScore: 88,
        auditId: 'AUD-KG-QA-REUSE-20260521-001',
        traceId: 'TRACE-KG-QA-WO-DEMO-1012-OP-10-REUSE-DRAFT',
        createdAt: '2026-05-21T10:10:00.000Z',
        summary: 'WO-DEMO-1012 OP-10 命中扫码返工 CAPA 样本，同设备、同工序、同 AL 批次族和同类首件尺寸偏差均匹配。',
        matchDimensions: [
          { label: '工序', source: 'CNC 精加工', target: 'CNC 精加工', matched: true },
          { label: '设备', source: 'CNC-002', target: 'CNC-002', matched: true },
          { label: '材料族', source: 'AL-202605', target: 'AL-202605-B', matched: true },
          { label: '缺陷模式', source: '首件尺寸偏差', target: '首件尺寸偏差', matched: true },
        ],
        dispositionDraft: ['冻结 WO-DEMO-1012 OP-10 到 OP-20 的下道交接。'],
        effectMetrics: [{ label: '分析节省', value: '45 分钟' }],
        evidenceTraceIds: [sample.traceId],
      }
      const closure = {
        id: 'quality-knowledge-reuse-closure-wo-demo-1012-op-10',
        draftId: draft.id,
        draftTraceId: draft.traceId,
        targetWorkOrderId: draft.targetWorkOrderId,
        targetOperationCode: draft.targetOperationCode,
        formalCapaTitle: 'WO-DEMO-1012 OP-10 同类首件尺寸偏差正式 CAPA',
        owner: '质量工程师 周工 / 工艺工程师 陈工',
        dueAt: '今日 17:30',
        verification: '复验尺寸 Cpk >= 1.33，OP-20 首件接收无返修',
        auditId: 'AUD-KG-QA-REUSE-CAPA-20260521-001',
        traceId: 'TRACE-KG-QA-WO-DEMO-1012-OP-10-FORMAL-CAPA',
        effectTraceId: 'TRACE-KG-QA-WO-DEMO-1012-OP-10-REUSE-EFFECT',
        approvedAt: '2026-05-21T10:20:00.000Z',
        status: 'approved',
        statusLabel: '待验证',
        effectScoreBefore: 88,
        effectScoreAfter: 94,
        effectReview: '复用扫码返工样本后，根因确认、隔离、返工成本和排产复核不再重复拆解。',
        feedbackActions: ['复验通过后把草案命中、正式 CAPA 和效果评分写回知识样本。'],
        feedbackMetrics: [{ label: '重复分析节省', value: '45 分钟' }],
      }
      localStorage.setItem('aimes_quality_knowledge_samples', JSON.stringify([sample]))
      localStorage.setItem('aimes_quality_knowledge_reuse_drafts', JSON.stringify([draft]))
      localStorage.setItem('aimes_quality_knowledge_reuse_closures', JSON.stringify([closure]))

      const originalSetItem = Storage.prototype.setItem
      Storage.prototype.setItem = function setItemWithReuseEffectFailure(key: string, value: string) {
        if (key === 'aimes_quality_knowledge_reuse_closures') {
          throw new Error('reuse effect verification storage unavailable from chromium')
        }
        return originalSetItem.call(this, key, value)
      }
    })

    await page.route('**/api/v1/scheduling/quality-knowledge-evidence**', async route => {
      if (route.request().method() === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: '[]',
        })
        return
      }
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: '{}',
      })
    })

    await page.goto('quality', { waitUntil: 'commit', timeout: 45000 })
    await page.waitForSelector('.quality-board', { timeout: 60000 })

    const capaPanel = page.locator('.quality-capa-panel')
    const formalFlow = capaPanel.locator('.draft-reuse-card .formal-capa-flow')
    await expect(formalFlow.getByText('WO-DEMO-1012 OP-10 同类首件尺寸偏差正式 CAPA')).toBeVisible()
    await expect(formalFlow.getByText('AUD-KG-QA-REUSE-CAPA-20260521-001')).toBeVisible()
    await expect(formalFlow.getByRole('button', { name: '验证复用效果并回写' })).toBeVisible()

    await formalFlow.getByRole('button', { name: '验证复用效果并回写' }).click()

    const alert = capaPanel.getByRole('alert')
    await expect(alert).toBeVisible()
    await expect(alert).toContainText('质量知识复用效果验证失败')
    await expect(alert).toContainText('reuse effect verification storage unavailable from chromium')
    await expect(formalFlow).not.toHaveClass(/verified/)
    await expect(formalFlow.getByRole('button', { name: '验证复用效果并回写' })).toBeVisible()
    await expect(formalFlow.getByText('TRACE-KG-QA-WO-DEMO-1012-OP-10-REUSE-EFFECT')).toBeHidden()
    await expect(capaPanel.getByText(/已验证并回写复用效果/)).toBeHidden()

    const closureRecords = await page.evaluate(() => localStorage.getItem('aimes_quality_knowledge_reuse_closures'))
    const evidenceRecords = await page.evaluate(() => localStorage.getItem('aimes_otd_evidence_chain'))
    expect(closureRecords ?? '').toContain('"status":"approved"')
    expect(closureRecords ?? '').not.toContain('"status":"verified"')
    expect(evidenceRecords ?? '').not.toContain('TRACE-KG-QA-WO-DEMO-1012-OP-10-REUSE-EFFECT')
  })

  test('低分样本复核队列生成失败时真实浏览器展示 fail-loud 且不伪造复核队列', async ({ page }) => {
    await page.addInitScript(() => {
      const sample = {
        id: 'quality-knowledge-sample-qr-rework-wo-rush-9001-op-10',
        workOrderId: 'WO-RUSH-9001',
        operationCode: 'OP-10',
        processName: 'CNC 精加工',
        equipmentCode: 'CNC-002',
        materialBatch: 'AL-202605',
        defectPattern: '首件尺寸偏差 + Ra 粗糙度复检',
        documentId: 'kg-quality-barcode-rework',
        documentTitle: '扫码返工 CAPA 样本库',
        version: 'QK-20260521',
        validUntil: '2026-12-31',
        auditId: 'AUD-KG-QA-REWORK-20260521-001',
        traceId: 'TRACE-KG-QA-WO-RUSH-9001-OP-10-REWORK-SAMPLE',
        createdAt: '2026-05-21T10:00:00.000Z',
        summary: 'WO-RUSH-9001 OP-10 扫码质检不合格已沉淀为可复用样本。',
        capaRecommendations: ['同类 CNC 首件尺寸偏差先冻结下道交接并隔离 AL 批次。'],
        reuseTargets: ['质量根因分析', 'AI 生产助手', '文档上传', '报表中心', '审计日志'],
        evidenceTraceIds: ['TRACE-QR-WO-RUSH-9001-OP-10-REWORK'],
      }
      const draft = {
        id: 'quality-knowledge-reuse-draft-wo-demo-1012-op-10',
        sourceSampleId: sample.id,
        sourceTraceId: sample.traceId,
        targetWorkOrderId: 'WO-DEMO-1012',
        targetOperationCode: 'OP-10',
        targetProcessName: 'CNC 精加工',
        targetEquipmentCode: 'CNC-002',
        targetMaterialBatch: 'AL-202605-B',
        targetDefectPattern: '首件尺寸偏差',
        matchScore: 92,
        effectScore: 88,
        auditId: 'AUD-KG-QA-REUSE-20260521-001',
        traceId: 'TRACE-KG-QA-WO-DEMO-1012-OP-10-REUSE-DRAFT',
        createdAt: '2026-05-21T10:10:00.000Z',
        summary: 'WO-DEMO-1012 OP-10 命中扫码返工 CAPA 样本，同设备、同工序、同 AL 批次族和同类首件尺寸偏差均匹配。',
        matchDimensions: [
          { label: '工序', source: 'CNC 精加工', target: 'CNC 精加工', matched: true },
          { label: '设备', source: 'CNC-002', target: 'CNC-002', matched: true },
          { label: '材料族', source: 'AL-202605', target: 'AL-202605-B', matched: true },
          { label: '缺陷模式', source: '首件尺寸偏差', target: '首件尺寸偏差', matched: true },
        ],
        dispositionDraft: ['冻结 WO-DEMO-1012 OP-10 到 OP-20 的下道交接。'],
        effectMetrics: [{ label: '分析节省', value: '45 分钟' }],
        evidenceTraceIds: [sample.traceId],
      }
      const closure = {
        id: 'quality-knowledge-reuse-closure-wo-demo-1012-op-10',
        draftId: draft.id,
        draftTraceId: draft.traceId,
        targetWorkOrderId: draft.targetWorkOrderId,
        targetOperationCode: draft.targetOperationCode,
        formalCapaTitle: 'WO-DEMO-1012 OP-10 同类首件尺寸偏差正式 CAPA',
        owner: '质量工程师 周工 / 工艺工程师 陈工',
        dueAt: '今日 17:30',
        verification: '复验尺寸 Cpk >= 1.33，OP-20 首件接收无返修',
        auditId: 'AUD-KG-QA-REUSE-CAPA-20260521-001',
        traceId: 'TRACE-KG-QA-WO-DEMO-1012-OP-10-FORMAL-CAPA',
        effectTraceId: 'TRACE-KG-QA-WO-DEMO-1012-OP-10-REUSE-EFFECT',
        approvedAt: '2026-05-21T10:20:00.000Z',
        verifiedAt: '2026-05-21T10:30:00.000Z',
        status: 'verified',
        statusLabel: '复用效果已回写',
        effectScoreBefore: 88,
        effectScoreAfter: 94,
        effectReview: '复用扫码返工样本后，根因确认、隔离、返工成本和排产复核不再重复拆解。',
        feedbackActions: ['复验通过后把草案命中、正式 CAPA 和效果评分写回知识样本。'],
        feedbackMetrics: [{ label: '重复分析节省', value: '45 分钟' }],
      }
      localStorage.setItem('aimes_quality_knowledge_samples', JSON.stringify([sample]))
      localStorage.setItem('aimes_quality_knowledge_reuse_drafts', JSON.stringify([draft]))
      localStorage.setItem('aimes_quality_knowledge_reuse_closures', JSON.stringify([closure]))

      const originalSetItem = Storage.prototype.setItem
      Storage.prototype.setItem = function setItemWithReviewQueueFailure(key: string, value: string) {
        if (key === 'aimes_quality_knowledge_review_queue') {
          throw new Error('review queue storage unavailable from chromium')
        }
        return originalSetItem.call(this, key, value)
      }
    })

    await page.route('**/api/v1/scheduling/quality-knowledge-evidence**', async route => {
      if (route.request().method() === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: '[]',
        })
        return
      }
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: '{}',
      })
    })

    await page.goto('quality', { waitUntil: 'commit', timeout: 45000 })
    await page.waitForSelector('.quality-board', { timeout: 60000 })

    const capaPanel = page.locator('.quality-capa-panel')
    const rankingPanel = capaPanel.locator('.draft-reuse-card .reuse-ranking-panel')
    await expect(rankingPanel.getByText('质量知识复用排序')).toBeVisible()
    await expect(rankingPanel.locator('.ranking-card').filter({ hasText: 'WO-DEMO-1018 OP-20 装配扭矩偏移复用尝试' }).getByText('低分复核')).toBeVisible()
    await expect(rankingPanel.getByRole('button', { name: '生成低分样本复核队列' })).toBeVisible()

    await rankingPanel.getByRole('button', { name: '生成低分样本复核队列' }).click()

    const alert = capaPanel.getByRole('alert')
    await expect(alert).toBeVisible()
    await expect(alert).toContainText('低分样本复核队列生成失败')
    await expect(alert).toContainText('review queue storage unavailable from chromium')
    await expect(rankingPanel.getByRole('button', { name: '生成低分样本复核队列' })).toBeVisible()
    await expect(rankingPanel.locator('.low-score-review-card')).toBeHidden()
    await expect(rankingPanel.getByText('TRACE-KG-QA-WO-DEMO-1018-OP-20-LOW-SCORE-REVIEW')).toBeHidden()
    await expect(capaPanel.getByText(/已进入低分样本复核队列/)).toBeHidden()

    const reviewQueueRecords = await page.evaluate(() => localStorage.getItem('aimes_quality_knowledge_review_queue'))
    const evidenceRecords = await page.evaluate(() => localStorage.getItem('aimes_otd_evidence_chain'))
    expect(reviewQueueRecords).toBeNull()
    expect(evidenceRecords ?? '').not.toContain('TRACE-KG-QA-WO-DEMO-1018-OP-20-LOW-SCORE-REVIEW')
  })

  test('低分样本复核队列关闭失败时真实浏览器展示 fail-loud 且不伪造关闭结论', async ({ page }) => {
    await page.addInitScript(() => {
      const draft = {
        id: 'quality-knowledge-reuse-draft-wo-demo-1012-op-10',
        sourceSampleId: 'quality-knowledge-sample-qr-rework-wo-rush-9001-op-10',
        sourceTraceId: 'TRACE-KG-QA-WO-RUSH-9001-OP-10-REWORK-SAMPLE',
        targetWorkOrderId: 'WO-DEMO-1012',
        targetOperationCode: 'OP-10',
        targetProcessName: 'CNC 精加工',
        targetEquipmentCode: 'CNC-002',
        targetMaterialBatch: 'AL-202605-B',
        targetDefectPattern: '首件尺寸偏差',
        matchScore: 92,
        effectScore: 88,
        auditId: 'AUD-KG-QA-REUSE-20260521-001',
        traceId: 'TRACE-KG-QA-WO-DEMO-1012-OP-10-REUSE-DRAFT',
        createdAt: '2026-05-21T10:10:00.000Z',
        summary: 'WO-DEMO-1012 OP-10 命中扫码返工 CAPA 样本，同设备、同工序、同 AL 批次族和同类首件尺寸偏差均匹配。',
        matchDimensions: [
          { label: '工序', source: 'CNC 精加工', target: 'CNC 精加工', matched: true },
          { label: '设备', source: 'CNC-002', target: 'CNC-002', matched: true },
          { label: '材料族', source: 'AL-202605', target: 'AL-202605-B', matched: true },
          { label: '缺陷模式', source: '首件尺寸偏差', target: '首件尺寸偏差', matched: true },
        ],
        dispositionDraft: ['冻结 WO-DEMO-1012 OP-10 到 OP-20 的下道交接。'],
        effectMetrics: [{ label: '分析节省', value: '45 分钟' }],
        evidenceTraceIds: ['TRACE-KG-QA-WO-RUSH-9001-OP-10-REWORK-SAMPLE'],
      }
      const reviewQueue = {
        id: 'quality-knowledge-review-low-score-wo-demo-1018-op-20',
        sourceRankingId: 'reuse-rank-low-score-torque',
        targetWorkOrderId: 'WO-DEMO-1018',
        operationCode: 'OP-20',
        title: 'WO-DEMO-1018 OP-20 低分复用样本复核',
        reason: '装配扭矩偏移与扫码返工源样本跨工序、跨设备，复用效果 61 分，低于 70 分阈值，需复核是否新建独立 CAPA 样本。',
        owner: '质量主管 刘工 / 知识库管理员',
        dueAt: '明日 10:00',
        auditId: 'AUD-KG-QA-LOW-SCORE-20260521-001',
        traceId: 'TRACE-KG-QA-WO-DEMO-1018-OP-20-LOW-SCORE-REVIEW',
        createdAt: '2026-05-21T10:40:00.000Z',
        status: 'open',
        statusLabel: '复核中',
        effectScore: 61,
        reviewActions: [
          '复核 OP-20 装配扭矩偏移是否属于扫码返工样本的有效泛化范围。',
          '若跨工序差异无法解释，生成独立装配扭矩 CAPA 样本并标记原复用尝试为低分。',
          '把低分样本加入后续知识检索降权策略，避免 AI 助手直接引用。',
        ],
      }
      localStorage.setItem('aimes_quality_knowledge_reuse_drafts', JSON.stringify([draft]))
      localStorage.setItem('aimes_quality_knowledge_review_queue', JSON.stringify([reviewQueue]))

      const originalSetItem = Storage.prototype.setItem
      Storage.prototype.setItem = function setItemWithReviewQueueClosureFailure(key: string, value: string) {
        if (key === 'aimes_quality_knowledge_review_queue') {
          throw new Error('review queue closure storage unavailable from chromium')
        }
        return originalSetItem.call(this, key, value)
      }
    })

    await page.route('**/api/v1/scheduling/quality-knowledge-evidence**', async route => {
      if (route.request().method() === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: '[]',
        })
        return
      }
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: '{}',
      })
    })

    await page.goto('quality', { waitUntil: 'commit', timeout: 45000 })
    await page.waitForSelector('.quality-board', { timeout: 60000 })

    const capaPanel = page.locator('.quality-capa-panel')
    const reviewCard = capaPanel.locator('.low-score-review-card')
    await expect(reviewCard).toBeVisible()
    await expect(reviewCard.getByText('WO-DEMO-1018 OP-20 低分复用样本复核')).toBeVisible()
    await expect(reviewCard.getByText('TRACE-KG-QA-WO-DEMO-1018-OP-20-LOW-SCORE-REVIEW')).toBeVisible()
    await expect(reviewCard.getByRole('button', { name: '完成复核并禁用直接复用' })).toBeVisible()

    await reviewCard.getByRole('button', { name: '完成复核并禁用直接复用' }).click()

    const alert = capaPanel.getByRole('alert')
    await expect(alert).toBeVisible()
    await expect(alert).toContainText('低分样本复核队列关闭失败')
    await expect(alert).toContainText('review queue closure storage unavailable from chromium')
    await expect(reviewCard.getByRole('button', { name: '完成复核并禁用直接复用' })).toBeVisible()
    await expect(reviewCard.getByText(/禁止 AI 助手把该低分候选作为直接 CAPA 推荐/)).toBeHidden()
    await expect(reviewCard.getByText('TRACE-KG-QA-WO-DEMO-1018-OP-20-LOW-SCORE-DECISION')).toBeHidden()
    await expect(reviewCard.getByText('TRACE-KG-QA-WO-DEMO-1018-OP-20-RETRAINING-CANDIDATE')).toBeHidden()
    await expect(capaPanel.getByText(/已完成复核/)).toBeHidden()

    const reviewQueueRecords = await page.evaluate(() => localStorage.getItem('aimes_quality_knowledge_review_queue'))
    const evidenceRecords = await page.evaluate(() => localStorage.getItem('aimes_otd_evidence_chain'))
    expect(reviewQueueRecords ?? '').toContain('"status":"open"')
    expect(reviewQueueRecords ?? '').not.toContain('"status":"closed"')
    expect(reviewQueueRecords ?? '').not.toContain('TRACE-KG-QA-WO-DEMO-1018-OP-20-LOW-SCORE-DECISION')
    expect(evidenceRecords ?? '').not.toContain('TRACE-KG-QA-WO-DEMO-1018-OP-20-LOW-SCORE-DECISION')
    expect(evidenceRecords ?? '').not.toContain('TRACE-KG-QA-WO-DEMO-1018-OP-20-RETRAINING-CANDIDATE')
  })

  test('已发布再训练版本提升 OP-20 推荐排序并进入助手引用', async ({ page }) => {
    await page.addInitScript(() => {
      const sample = {
        id: 'quality-knowledge-sample-qr-rework-wo-rush-9001-op-10',
        workOrderId: 'WO-RUSH-9001',
        operationCode: 'OP-10',
        processName: 'CNC 精加工',
        equipmentCode: 'CNC-002',
        materialBatch: 'AL-202605',
        defectPattern: '首件尺寸偏差 + Ra 粗糙度复检',
        documentId: 'kg-quality-barcode-rework',
        documentTitle: '扫码返工 CAPA 样本库',
        version: 'QK-20260521',
        validUntil: '2026-12-31',
        auditId: 'AUD-KG-QA-REWORK-20260521-001',
        traceId: 'TRACE-KG-QA-WO-RUSH-9001-OP-10-REWORK-SAMPLE',
        createdAt: '2026-05-21T10:00:00.000Z',
        summary: 'WO-RUSH-9001 OP-10 扫码质检不合格已沉淀为可复用样本，覆盖批次隔离、返工成本、复验放行、OP-20 释放和排产回写。',
        capaRecommendations: [
          '同类 CNC 首件尺寸偏差先冻结下道交接并隔离 AL 批次。',
          '按不良数量预估返工工时成本，进入 OTD 与经营复盘。',
        ],
        reuseTargets: ['质量根因分析', 'AI 生产助手', '文档上传', '报表中心', '审计日志'],
        evidenceTraceIds: ['TRACE-QR-WO-RUSH-9001-OP-10-REWORK'],
      }
      const draft = {
        id: 'quality-knowledge-reuse-draft-wo-demo-1012-op-10',
        sourceSampleId: sample.id,
        sourceTraceId: sample.traceId,
        targetWorkOrderId: 'WO-DEMO-1012',
        targetOperationCode: 'OP-10',
        targetProcessName: 'CNC 精加工',
        targetEquipmentCode: 'CNC-002',
        targetMaterialBatch: 'AL-202605-B',
        targetDefectPattern: '首件尺寸偏差',
        matchScore: 92,
        effectScore: 88,
        auditId: 'AUD-KG-QA-REUSE-20260521-001',
        traceId: 'TRACE-KG-QA-WO-DEMO-1012-OP-10-REUSE-DRAFT',
        createdAt: '2026-05-21T10:10:00.000Z',
        summary: 'WO-DEMO-1012 OP-10 命中扫码返工 CAPA 样本，同设备、同工序、同 AL 批次族和同类首件尺寸偏差均匹配。',
        matchDimensions: [
          { label: '工序', source: 'CNC 精加工', target: 'CNC 精加工', matched: true },
          { label: '设备', source: 'CNC-002', target: 'CNC-002', matched: true },
          { label: '材料族', source: 'AL-202605', target: 'AL-202605-B', matched: true },
          { label: '缺陷模式', source: '首件尺寸偏差', target: '首件尺寸偏差', matched: true },
        ],
        dispositionDraft: ['冻结 WO-DEMO-1012 OP-10 到 OP-20 的下道交接。'],
        effectMetrics: [{ label: '分析节省', value: '45 分钟' }],
        evidenceTraceIds: [sample.traceId],
      }
      const closure = {
        id: 'quality-knowledge-reuse-closure-wo-demo-1012-op-10',
        draftId: draft.id,
        draftTraceId: draft.traceId,
        targetWorkOrderId: draft.targetWorkOrderId,
        targetOperationCode: draft.targetOperationCode,
        formalCapaTitle: 'WO-DEMO-1012 OP-10 同类首件尺寸偏差正式 CAPA',
        owner: '质量工程师 周工 / 工艺工程师 陈工',
        dueAt: '今日 17:30',
        verification: '复验尺寸 Cpk >= 1.33，OP-20 首件接收无返修',
        auditId: 'AUD-KG-QA-REUSE-CAPA-20260521-001',
        traceId: 'TRACE-KG-QA-WO-DEMO-1012-OP-10-FORMAL-CAPA',
        effectTraceId: 'TRACE-KG-QA-WO-DEMO-1012-OP-10-REUSE-EFFECT',
        approvedAt: '2026-05-21T10:20:00.000Z',
        verifiedAt: '2026-05-21T10:30:00.000Z',
        status: 'verified',
        statusLabel: '复用效果已回写',
        effectScoreBefore: 88,
        effectScoreAfter: 94,
        effectReview: '复用扫码返工样本后，根因确认、隔离、返工成本和排产复核不再重复拆解。',
        feedbackActions: ['复验通过后把草案命中、正式 CAPA 和效果评分写回知识样本。'],
        feedbackMetrics: [{ label: '重复分析节省', value: '45 分钟' }],
      }
      const reviewQueue = {
        id: 'quality-knowledge-review-low-score-wo-demo-1018-op-20',
        sourceRankingId: 'reuse-rank-low-score-torque',
        targetWorkOrderId: 'WO-DEMO-1018',
        operationCode: 'OP-20',
        title: 'WO-DEMO-1018 OP-20 低分复用样本复核',
        reason: '装配扭矩偏移与扫码返工源样本跨工序、跨设备，复用效果 61 分，低于 70 分阈值。',
        owner: '质量主管 刘工 / 知识库管理员',
        dueAt: '明日 10:00',
        auditId: 'AUD-KG-QA-LOW-SCORE-20260521-001',
        traceId: 'TRACE-KG-QA-WO-DEMO-1018-OP-20-LOW-SCORE-REVIEW',
        createdAt: '2026-05-21T10:40:00.000Z',
        status: 'closed',
        statusLabel: '直接复用已禁用',
        effectScore: 61,
        reviewActions: ['复核 OP-20 装配扭矩偏移是否属于扫码返工样本的有效泛化范围。'],
        closedAt: '2026-05-21T10:50:00.000Z',
        decisionAuditId: 'AUD-KG-QA-LOW-SCORE-DECISION-20260521-001',
        decisionTraceId: 'TRACE-KG-QA-WO-DEMO-1018-OP-20-LOW-SCORE-DECISION',
        decisionLabel: '禁用直接复用',
        decisionSummary: '人工复核确认 OP-20 装配扭矩偏移与 CNC 扫码返工样本不属于同一泛化族，禁止 AI 助手把该低分候选作为直接 CAPA 推荐。',
        disabledReuseRule: 'matchScore < 70 或跨工序缺陷模式不一致时，只能进入复核/再训练队列，不能进入优先推荐。',
        retrainingTraceId: 'TRACE-KG-QA-WO-DEMO-1018-OP-20-RETRAINING-CANDIDATE',
        retrainingPlan: ['把本次 61 分低分尝试作为负样本，降低跨工序扫码返工样本的召回权重。'],
      }
      const publishedVersion = {
        id: 'quality-retraining-version-quality-knowledge-review-low-score-wo-demo-1018-op-20',
        sourceReviewQueueId: reviewQueue.id,
        targetWorkOrderId: 'WO-DEMO-1018',
        operationCode: 'OP-20',
        candidateTraceId: 'TRACE-KG-QA-WO-DEMO-1018-OP-20-RETRAINING-CANDIDATE',
        trainingSetVersion: 'QK-TRAIN-20260521-R2',
        trainingSetName: '装配扭矩偏移 CAPA 再训练样本集',
        status: 'published',
        statusLabel: '已发布到 AI 推荐',
        approvedBy: '知识库管理员 / 质量主管 刘工',
        approvedAt: '2026-05-21T12:00:00.000Z',
        approvalAuditId: 'AUD-KG-QA-RETRAINING-APPROVAL-20260521-001',
        approvalTraceId: 'TRACE-KG-QA-WO-DEMO-1018-OP-20-RETRAINING-APPROVED',
        positiveSampleCount: 18,
        negativeSampleCount: 3,
        featurePolicy: '工序、设备族、缺陷模式、验证效果分必须同时参与召回排序，跨工序低分样本作为负样本降权。',
        changeSummary: ['新增 OP-20 装配扭矩偏移独立 CAPA 正样本。'],
        validationGates: ['离线 Top-3 召回不得推荐跨工序扫码返工样本。'],
        validationStatus: 'passed',
        validatedAt: '2026-05-21T12:30:00.000Z',
        validationAuditId: 'AUD-KG-QA-RETRAINING-VALIDATION-PASS-20260521-001',
        validationTraceId: 'TRACE-KG-QA-WO-DEMO-1018-OP-20-RETRAINING-VALIDATION-PASSED',
        validationSummary: 'OP-20 扭矩工具校准字段已补齐，离线 Top-3 召回不再推荐跨工序扫码返工样本，训练集可进入受控发布。',
        validationFindings: ['低分负样本召回权重下降 36%。'],
        publishedAt: '2026-05-21T12:40:00.000Z',
        publishAuditId: 'AUD-KG-QA-RETRAINING-PUBLISH-20260521-001',
        publishTraceId: 'TRACE-KG-QA-WO-DEMO-1018-OP-20-RETRAINING-PUBLISHED',
        publishSummary: '训练集版本通过发布前校验后进入质量知识复用排序，OP-20 装配扭矩偏移将优先匹配独立 CAPA 样本并保留负样本降权。',
        recommendationScope: ['质量知识复用排序', 'AI 生产助手引用链', 'CAPA 草案推荐'],
        rollbackTargetVersion: 'QK-TRAIN-20260521-R1',
      }
      localStorage.setItem('aimes_quality_knowledge_samples', JSON.stringify([sample]))
      localStorage.setItem('aimes_quality_knowledge_reuse_drafts', JSON.stringify([draft]))
      localStorage.setItem('aimes_quality_knowledge_reuse_closures', JSON.stringify([closure]))
      localStorage.setItem('aimes_quality_knowledge_review_queue', JSON.stringify([reviewQueue]))
      localStorage.setItem('aimes_quality_knowledge_retraining_versions', JSON.stringify([publishedVersion]))
    })

    await page.goto('quality', { waitUntil: 'commit', timeout: 45000 })
    await page.waitForSelector('.quality-board', { timeout: 60000 })

    const rankingPanel = page.locator('.reuse-ranking-panel')
    const publishedCard = rankingPanel.locator('.ranking-card').filter({ hasText: 'WO-DEMO-1018 OP-20 装配扭矩偏移独立 CAPA 推荐' })
    await expect(publishedCard.getByText('已发布训练集')).toBeVisible()
    await expect(publishedCard.getByText('89 分')).toBeVisible()
    const releaseMeta = publishedCard.locator('.ranking-training-release')
    await expect(releaseMeta.getByText('QK-TRAIN-20260521-R2', { exact: true })).toBeVisible()
    await expect(releaseMeta.getByText('AUD-KG-QA-RETRAINING-PUBLISH-20260521-001', { exact: true })).toBeVisible()
    await expect(publishedCard.getByText('TRACE-KG-QA-WO-DEMO-1018-OP-20-RETRAINING-PUBLISHED')).toBeVisible()
    await expect(publishedCard.getByText(/优先匹配独立 CAPA 样本/)).toBeVisible()

    await page.locator('.chat-fab').click()
    await page.locator('.chat-input').fill('扫码返工同类问题怎么复用 CAPA？')
    await page.locator('.send-btn').click()
    const chat = page.locator('.chat-panel')
    await expect(chat.getByText(/再训练发布：QK-TRAIN-20260521-R2 已发布到 AI 推荐链路/)).toBeVisible()
    await expect(chat.getByText(/OP-20 推荐：装配扭矩偏移优先匹配独立 CAPA 样本/)).toBeVisible()
    await expect(chat.getByText(/AUD-KG-QA-RETRAINING-PUBLISH-20260521-001/)).toBeVisible()
    await chat.locator('.sources-toggle').click()
    await expect(chat.locator('.source-item').filter({ hasText: 'QK-TRAIN-20260521-R2 已发布训练集' })).toBeVisible()
  })

  test('采纳已发布推荐后回写效果趋势并进入下一轮训练集', async ({ page }) => {
    await page.addInitScript(() => {
      const sample = {
        id: 'quality-knowledge-sample-qr-rework-wo-rush-9001-op-10',
        workOrderId: 'WO-RUSH-9001',
        operationCode: 'OP-10',
        processName: 'CNC 精加工',
        equipmentCode: 'CNC-002',
        materialBatch: 'AL-202605',
        defectPattern: '首件尺寸偏差 + Ra 粗糙度复检',
        documentId: 'kg-quality-barcode-rework',
        documentTitle: '扫码返工 CAPA 样本库',
        version: 'QK-20260521',
        validUntil: '2026-12-31',
        auditId: 'AUD-KG-QA-REWORK-20260521-001',
        traceId: 'TRACE-KG-QA-WO-RUSH-9001-OP-10-REWORK-SAMPLE',
        createdAt: '2026-05-21T10:00:00.000Z',
        summary: 'WO-RUSH-9001 OP-10 扫码质检不合格已沉淀为可复用样本。',
        capaRecommendations: ['冻结下道交接并隔离批次。'],
        reuseTargets: ['质量根因分析', 'AI 生产助手', '审计日志'],
        evidenceTraceIds: ['TRACE-QR-WO-RUSH-9001-OP-10-REWORK'],
      }
      const draft = {
        id: 'quality-knowledge-reuse-draft-wo-demo-1012-op-10',
        sourceSampleId: sample.id,
        sourceTraceId: sample.traceId,
        targetWorkOrderId: 'WO-DEMO-1012',
        targetOperationCode: 'OP-10',
        targetProcessName: 'CNC 精加工',
        targetEquipmentCode: 'CNC-002',
        targetMaterialBatch: 'AL-202605-B',
        targetDefectPattern: '首件尺寸偏差',
        matchScore: 92,
        effectScore: 88,
        auditId: 'AUD-KG-QA-REUSE-20260521-001',
        traceId: 'TRACE-KG-QA-WO-DEMO-1012-OP-10-REUSE-DRAFT',
        createdAt: '2026-05-21T10:10:00.000Z',
        summary: 'WO-DEMO-1012 OP-10 命中扫码返工 CAPA 样本。',
        matchDimensions: [{ label: '工序', source: 'CNC 精加工', target: 'CNC 精加工', matched: true }],
        dispositionDraft: ['冻结 WO-DEMO-1012 OP-10 到 OP-20 的下道交接。'],
        effectMetrics: [{ label: '分析节省', value: '45 分钟' }],
        evidenceTraceIds: [sample.traceId],
      }
      const closure = {
        id: 'quality-knowledge-reuse-closure-wo-demo-1012-op-10',
        draftId: draft.id,
        draftTraceId: draft.traceId,
        targetWorkOrderId: 'WO-DEMO-1012',
        targetOperationCode: 'OP-10',
        formalCapaTitle: 'WO-DEMO-1012 OP-10 同类首件尺寸偏差正式 CAPA',
        owner: '质量工程师 周工 / 工艺工程师 陈工',
        dueAt: '今日 17:30',
        verification: '复验尺寸 Cpk >= 1.33',
        auditId: 'AUD-KG-QA-REUSE-CAPA-20260521-001',
        traceId: 'TRACE-KG-QA-WO-DEMO-1012-OP-10-FORMAL-CAPA',
        effectTraceId: 'TRACE-KG-QA-WO-DEMO-1012-OP-10-REUSE-EFFECT',
        approvedAt: '2026-05-21T10:20:00.000Z',
        verifiedAt: '2026-05-21T10:40:00.000Z',
        status: 'verified',
        statusLabel: '复用效果已回写',
        effectScoreBefore: 88,
        effectScoreAfter: 94,
        effectReview: '复用扫码返工样本后，根因确认和复验不再重复拆解。',
        feedbackActions: ['复验通过后回写知识样本。'],
        feedbackMetrics: [{ label: '重复分析节省', value: '45 分钟' }],
      }
      const reviewQueue = {
        id: 'quality-knowledge-review-low-score-wo-demo-1018-op-20',
        sourceRankingId: 'reuse-rank-low-score-torque',
        targetWorkOrderId: 'WO-DEMO-1018',
        operationCode: 'OP-20',
        title: 'WO-DEMO-1018 OP-20 低分复用样本复核',
        reason: '装配扭矩偏移与扫码返工源样本跨工序、跨设备。',
        owner: '质量主管 刘工 / 知识库管理员',
        dueAt: '明日 10:00',
        auditId: 'AUD-KG-QA-LOW-SCORE-20260521-001',
        traceId: 'TRACE-KG-QA-WO-DEMO-1018-OP-20-LOW-SCORE-REVIEW',
        createdAt: '2026-05-21T10:30:00.000Z',
        status: 'closed',
        statusLabel: '直接复用已禁用',
        effectScore: 61,
        reviewActions: ['复核 OP-20 装配扭矩偏移是否属于扫码返工样本的有效泛化范围。'],
        closedAt: '2026-05-21T10:50:00.000Z',
        decisionAuditId: 'AUD-KG-QA-LOW-SCORE-DECISION-20260521-001',
        decisionTraceId: 'TRACE-KG-QA-WO-DEMO-1018-OP-20-LOW-SCORE-DECISION',
        decisionLabel: '禁用直接复用',
        decisionSummary: '人工复核确认 OP-20 装配扭矩偏移与 CNC 扫码返工样本不属于同一泛化族。',
        disabledReuseRule: 'matchScore < 70 或跨工序缺陷模式不一致时，只能进入复核/再训练队列。',
        retrainingTraceId: 'TRACE-KG-QA-WO-DEMO-1018-OP-20-RETRAINING-CANDIDATE',
        retrainingPlan: ['把本次 61 分低分尝试作为负样本。'],
      }
      const publishedVersion = {
        id: 'quality-retraining-version-quality-knowledge-review-low-score-wo-demo-1018-op-20',
        sourceReviewQueueId: reviewQueue.id,
        targetWorkOrderId: 'WO-DEMO-1018',
        operationCode: 'OP-20',
        candidateTraceId: 'TRACE-KG-QA-WO-DEMO-1018-OP-20-RETRAINING-CANDIDATE',
        trainingSetVersion: 'QK-TRAIN-20260521-R2',
        trainingSetName: '装配扭矩偏移 CAPA 再训练样本集',
        status: 'published',
        statusLabel: '已发布到 AI 推荐',
        approvedBy: '知识库管理员 / 质量主管 刘工',
        approvedAt: '2026-05-21T12:00:00.000Z',
        approvalAuditId: 'AUD-KG-QA-RETRAINING-APPROVAL-20260521-001',
        approvalTraceId: 'TRACE-KG-QA-WO-DEMO-1018-OP-20-RETRAINING-APPROVED',
        positiveSampleCount: 18,
        negativeSampleCount: 3,
        featurePolicy: '工序、设备族、缺陷模式、验证效果分必须同时参与召回排序。',
        changeSummary: ['新增 OP-20 装配扭矩偏移独立 CAPA 正样本。'],
        validationGates: ['离线 Top-3 召回不得推荐跨工序扫码返工样本。'],
        validationStatus: 'passed',
        validatedAt: '2026-05-21T12:30:00.000Z',
        validationAuditId: 'AUD-KG-QA-RETRAINING-VALIDATION-PASS-20260521-001',
        validationTraceId: 'TRACE-KG-QA-WO-DEMO-1018-OP-20-RETRAINING-VALIDATION-PASSED',
        validationSummary: 'OP-20 扭矩工具校准字段已补齐。',
        validationFindings: ['低分负样本召回权重下降 36%。'],
        publishedAt: '2026-05-21T12:40:00.000Z',
        publishAuditId: 'AUD-KG-QA-RETRAINING-PUBLISH-20260521-001',
        publishTraceId: 'TRACE-KG-QA-WO-DEMO-1018-OP-20-RETRAINING-PUBLISHED',
        publishSummary: '训练集版本通过发布前校验后进入质量知识复用排序。',
        recommendationScope: ['质量知识复用排序', 'AI 生产助手引用链', 'CAPA 草案推荐'],
      }
      localStorage.setItem('aimes_quality_knowledge_samples', JSON.stringify([sample]))
      localStorage.setItem('aimes_quality_knowledge_reuse_drafts', JSON.stringify([draft]))
      localStorage.setItem('aimes_quality_knowledge_reuse_closures', JSON.stringify([closure]))
      localStorage.setItem('aimes_quality_knowledge_review_queue', JSON.stringify([reviewQueue]))
      localStorage.setItem('aimes_quality_knowledge_retraining_versions', JSON.stringify([publishedVersion]))
    })

    await page.goto('quality', { waitUntil: 'commit', timeout: 45000 })
    await page.waitForSelector('.quality-board', { timeout: 60000 })

    const rankingPanel = page.locator('.reuse-ranking-panel')
    const publishedCard = rankingPanel.locator('.ranking-card').filter({ hasText: 'WO-DEMO-1018 OP-20 装配扭矩偏移独立 CAPA 推荐' })
    await expect(publishedCard.getByText('已发布训练集')).toBeVisible()
    await publishedCard.getByRole('button', { name: '采纳发布推荐并回写效果' }).click()
    await expect(publishedCard.getByText('已采纳推荐')).toBeVisible()
    await expect(publishedCard.locator('.ranking-topline strong').getByText('93 分', { exact: true })).toBeVisible()
    const feedback = publishedCard.locator('.ranking-feedback')
    await expect(feedback.getByText('采纳效果 89 -> 93 分')).toBeVisible()
    await expect(feedback.getByText('AUD-KG-QA-RECOMMENDATION-FEEDBACK-20260521-001')).toBeVisible()
    await expect(feedback.getByText('TRACE-KG-QA-WO-DEMO-1018-OP-20-RECOMMENDATION-ADOPTED')).toBeVisible()
    await expect(feedback.getByText('QK-TRAIN-20260521-R3')).toBeVisible()
    await expect(page.locator('.quality-capa-panel').getByText(/已采纳 QK-TRAIN-20260521-R2 推荐，效果趋势 89 -> 93 分/)).toBeVisible()

    await page.locator('.chat-fab').click()
    await page.locator('.chat-input').fill('扫码返工同类问题怎么复用 CAPA？')
    await page.locator('.send-btn').click()
    const chat = page.locator('.chat-panel')
    await expect(chat.getByText(/采纳反馈：现场已采纳推荐，效果趋势 89 -> 93 分，进入 QK-TRAIN-20260521-R3/)).toBeVisible()
    await expect(chat.getByText(/TRACE-KG-QA-WO-DEMO-1018-OP-20-NEXT-TRAINING-R3/)).toBeVisible()
    await chat.locator('.sources-toggle').click()
    await expect(chat.locator('.source-item').filter({ hasText: 'WO-DEMO-1018 OP-20 推荐采纳效果' })).toBeVisible()

    await page.goto('report', { waitUntil: 'commit', timeout: 45000 })
    await page.waitForSelector('.report-board', { timeout: 60000 })
    const feedbackEvidence = page.locator('.otd-evidence-chain .evidence-chain-card').filter({ hasText: '推荐采纳反馈' })
    await expect(feedbackEvidence.getByText('WO-DEMO-1018 OP-20 已采纳已发布训练集推荐')).toBeVisible()
    await expect(feedbackEvidence.getByText('TRACE-KG-QA-WO-DEMO-1018-OP-20-RECOMMENDATION-ADOPTED')).toBeVisible()
    const nextTrainingEvidence = page.locator('.otd-evidence-chain .evidence-chain-card').filter({ hasText: '下一轮训练集' })
    await expect(nextTrainingEvidence.getByText('QK-TRAIN-20260521-R3 推荐采纳效果已入池')).toBeVisible()
    await expect(nextTrainingEvidence.getByText('TRACE-KG-QA-WO-DEMO-1018-OP-20-NEXT-TRAINING-R3')).toBeVisible()
  })

  test('发布推荐采纳写入失败时真实浏览器展示 fail-loud 且不伪造采纳反馈', async ({ page }) => {
    await page.addInitScript(() => {
      const sample = {
        id: 'quality-knowledge-sample-qr-rework-wo-rush-9001-op-10',
        workOrderId: 'WO-RUSH-9001',
        operationCode: 'OP-10',
        processName: 'CNC 精加工',
        equipmentCode: 'CNC-002',
        materialBatch: 'AL-202605',
        defectPattern: '首件尺寸偏差 + Ra 粗糙度复检',
        documentId: 'kg-quality-barcode-rework',
        documentTitle: '扫码返工 CAPA 样本库',
        version: 'QK-20260521',
        validUntil: '2026-12-31',
        auditId: 'AUD-KG-QA-REWORK-20260521-001',
        traceId: 'TRACE-KG-QA-WO-RUSH-9001-OP-10-REWORK-SAMPLE',
        createdAt: '2026-05-21T10:00:00.000Z',
        summary: 'WO-RUSH-9001 OP-10 扫码质检不合格已沉淀为可复用样本。',
        capaRecommendations: ['冻结下道交接并隔离批次。'],
        reuseTargets: ['质量根因分析', 'AI 生产助手', '审计日志'],
        evidenceTraceIds: ['TRACE-QR-WO-RUSH-9001-OP-10-REWORK'],
      }
      const draft = {
        id: 'quality-knowledge-reuse-draft-wo-demo-1012-op-10',
        sourceSampleId: sample.id,
        sourceTraceId: sample.traceId,
        targetWorkOrderId: 'WO-DEMO-1012',
        targetOperationCode: 'OP-10',
        targetProcessName: 'CNC 精加工',
        targetEquipmentCode: 'CNC-002',
        targetMaterialBatch: 'AL-202605-B',
        targetDefectPattern: '首件尺寸偏差',
        matchScore: 92,
        effectScore: 88,
        auditId: 'AUD-KG-QA-REUSE-20260521-001',
        traceId: 'TRACE-KG-QA-WO-DEMO-1012-OP-10-REUSE-DRAFT',
        createdAt: '2026-05-21T10:10:00.000Z',
        summary: 'WO-DEMO-1012 OP-10 命中扫码返工 CAPA 样本。',
        matchDimensions: [{ label: '工序', source: 'CNC 精加工', target: 'CNC 精加工', matched: true }],
        dispositionDraft: ['冻结 WO-DEMO-1012 OP-10 到 OP-20 的下道交接。'],
        effectMetrics: [{ label: '分析节省', value: '45 分钟' }],
        evidenceTraceIds: [sample.traceId],
      }
      const closure = {
        id: 'quality-knowledge-reuse-closure-wo-demo-1012-op-10',
        draftId: draft.id,
        draftTraceId: draft.traceId,
        targetWorkOrderId: 'WO-DEMO-1012',
        targetOperationCode: 'OP-10',
        formalCapaTitle: 'WO-DEMO-1012 OP-10 同类首件尺寸偏差正式 CAPA',
        owner: '质量工程师 周工 / 工艺工程师 陈工',
        dueAt: '今日 17:30',
        verification: '复验尺寸 Cpk >= 1.33',
        auditId: 'AUD-KG-QA-REUSE-CAPA-20260521-001',
        traceId: 'TRACE-KG-QA-WO-DEMO-1012-OP-10-FORMAL-CAPA',
        effectTraceId: 'TRACE-KG-QA-WO-DEMO-1012-OP-10-REUSE-EFFECT',
        approvedAt: '2026-05-21T10:20:00.000Z',
        verifiedAt: '2026-05-21T10:40:00.000Z',
        status: 'verified',
        statusLabel: '复用效果已回写',
        effectScoreBefore: 88,
        effectScoreAfter: 94,
        effectReview: '复用扫码返工样本后，根因确认和复验不再重复拆解。',
        feedbackActions: ['复验通过后回写知识样本。'],
        feedbackMetrics: [{ label: '重复分析节省', value: '45 分钟' }],
      }
      const reviewQueue = {
        id: 'quality-knowledge-review-low-score-wo-demo-1018-op-20',
        sourceRankingId: 'reuse-rank-low-score-torque',
        targetWorkOrderId: 'WO-DEMO-1018',
        operationCode: 'OP-20',
        title: 'WO-DEMO-1018 OP-20 低分复用样本复核',
        reason: '装配扭矩偏移与扫码返工源样本跨工序、跨设备。',
        owner: '质量主管 刘工 / 知识库管理员',
        dueAt: '明日 10:00',
        auditId: 'AUD-KG-QA-LOW-SCORE-20260521-001',
        traceId: 'TRACE-KG-QA-WO-DEMO-1018-OP-20-LOW-SCORE-REVIEW',
        createdAt: '2026-05-21T10:30:00.000Z',
        status: 'closed',
        statusLabel: '直接复用已禁用',
        effectScore: 61,
        reviewActions: ['复核 OP-20 装配扭矩偏移是否属于扫码返工样本的有效泛化范围。'],
        closedAt: '2026-05-21T10:50:00.000Z',
        decisionAuditId: 'AUD-KG-QA-LOW-SCORE-DECISION-20260521-001',
        decisionTraceId: 'TRACE-KG-QA-WO-DEMO-1018-OP-20-LOW-SCORE-DECISION',
        decisionLabel: '禁用直接复用',
        decisionSummary: '人工复核确认 OP-20 装配扭矩偏移与 CNC 扫码返工样本不属于同一泛化族。',
        disabledReuseRule: 'matchScore < 70 或跨工序缺陷模式不一致时，只能进入复核/再训练队列。',
        retrainingTraceId: 'TRACE-KG-QA-WO-DEMO-1018-OP-20-RETRAINING-CANDIDATE',
        retrainingPlan: ['把本次 61 分低分尝试作为负样本。'],
      }
      const publishedVersion = {
        id: 'quality-retraining-version-quality-knowledge-review-low-score-wo-demo-1018-op-20',
        sourceReviewQueueId: reviewQueue.id,
        targetWorkOrderId: 'WO-DEMO-1018',
        operationCode: 'OP-20',
        candidateTraceId: 'TRACE-KG-QA-WO-DEMO-1018-OP-20-RETRAINING-CANDIDATE',
        trainingSetVersion: 'QK-TRAIN-20260521-R2',
        trainingSetName: '装配扭矩偏移 CAPA 再训练样本集',
        status: 'published',
        statusLabel: '已发布到 AI 推荐',
        approvedBy: '知识库管理员 / 质量主管 刘工',
        approvedAt: '2026-05-21T12:00:00.000Z',
        approvalAuditId: 'AUD-KG-QA-RETRAINING-APPROVAL-20260521-001',
        approvalTraceId: 'TRACE-KG-QA-WO-DEMO-1018-OP-20-RETRAINING-APPROVED',
        positiveSampleCount: 18,
        negativeSampleCount: 3,
        featurePolicy: '工序、设备族、缺陷模式、验证效果分必须同时参与召回排序。',
        changeSummary: ['新增 OP-20 装配扭矩偏移独立 CAPA 正样本。'],
        validationGates: ['离线 Top-3 召回不得推荐跨工序扫码返工样本。'],
        validationStatus: 'passed',
        validatedAt: '2026-05-21T12:30:00.000Z',
        validationAuditId: 'AUD-KG-QA-RETRAINING-VALIDATION-PASS-20260521-001',
        validationTraceId: 'TRACE-KG-QA-WO-DEMO-1018-OP-20-RETRAINING-VALIDATION-PASSED',
        validationSummary: 'OP-20 扭矩工具校准字段已补齐。',
        validationFindings: ['低分负样本召回权重下降 36%。'],
        publishedAt: '2026-05-21T12:40:00.000Z',
        publishAuditId: 'AUD-KG-QA-RETRAINING-PUBLISH-20260521-001',
        publishTraceId: 'TRACE-KG-QA-WO-DEMO-1018-OP-20-RETRAINING-PUBLISHED',
        publishSummary: '训练集版本通过发布前校验后进入质量知识复用排序。',
        recommendationScope: ['质量知识复用排序', 'AI 生产助手引用链', 'CAPA 草案推荐'],
      }
      localStorage.setItem('aimes_quality_knowledge_samples', JSON.stringify([sample]))
      localStorage.setItem('aimes_quality_knowledge_reuse_drafts', JSON.stringify([draft]))
      localStorage.setItem('aimes_quality_knowledge_reuse_closures', JSON.stringify([closure]))
      localStorage.setItem('aimes_quality_knowledge_review_queue', JSON.stringify([reviewQueue]))
      localStorage.setItem('aimes_quality_knowledge_retraining_versions', JSON.stringify([publishedVersion]))

      const originalSetItem = Storage.prototype.setItem
      Storage.prototype.setItem = function setItemWithRecommendationFeedbackFailure(key: string, value: string) {
        if (key === 'aimes_quality_knowledge_recommendation_feedback') {
          throw new Error('published recommendation adoption storage unavailable from chromium')
        }
        return originalSetItem.call(this, key, value)
      }
    })

    await page.route('**/api/v1/scheduling/quality-knowledge-evidence**', async route => {
      if (route.request().method() === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: '[]',
        })
        return
      }
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: '{}',
      })
    })

    await page.goto('quality', { waitUntil: 'commit', timeout: 45000 })
    await page.waitForSelector('.quality-board', { timeout: 60000 })

    const capaPanel = page.locator('.quality-capa-panel')
    const rankingPanel = capaPanel.locator('.reuse-ranking-panel')
    const publishedCard = rankingPanel.locator('.ranking-card').filter({ hasText: 'WO-DEMO-1018 OP-20 装配扭矩偏移独立 CAPA 推荐' })
    await expect(publishedCard.getByText('已发布训练集')).toBeVisible()
    await expect(publishedCard.getByText('89 分')).toBeVisible()
    await expect(publishedCard.getByRole('button', { name: '采纳发布推荐并回写效果' })).toBeVisible()

    await publishedCard.getByRole('button', { name: '采纳发布推荐并回写效果' }).click()

    const alert = capaPanel.getByRole('alert')
    await expect(alert).toBeVisible()
    await expect(alert).toContainText('质量知识发布推荐采纳失败')
    await expect(alert).toContainText('published recommendation adoption storage unavailable from chromium')
    await expect(publishedCard.getByRole('button', { name: '采纳发布推荐并回写效果' })).toBeVisible()
    await expect(publishedCard.locator('.ranking-feedback')).toBeHidden()
    await expect(publishedCard.getByText('已采纳推荐')).toBeHidden()
    await expect(publishedCard.getByText('TRACE-KG-QA-WO-DEMO-1018-OP-20-RECOMMENDATION-ADOPTED')).toBeHidden()
    await expect(publishedCard.getByText('TRACE-KG-QA-WO-DEMO-1018-OP-20-NEXT-TRAINING-R3')).toBeHidden()
    await expect(capaPanel.getByText(/已采纳 QK-TRAIN-20260521-R2 推荐/)).toBeHidden()

    const feedbackRecords = await page.evaluate(() => localStorage.getItem('aimes_quality_knowledge_recommendation_feedback'))
    const evidenceRecords = await page.evaluate(() => localStorage.getItem('aimes_otd_evidence_chain'))
    expect(feedbackRecords).toBeNull()
    expect(evidenceRecords ?? '').not.toContain('TRACE-KG-QA-WO-DEMO-1018-OP-20-RECOMMENDATION-ADOPTED')
    expect(evidenceRecords ?? '').not.toContain('TRACE-KG-QA-WO-DEMO-1018-OP-20-NEXT-TRAINING-R3')
  })

  test('助手执行包质量责任闭环失败时真实浏览器展示 fail-loud 且不伪造质量闭环', async ({ page }) => {
    await page.addInitScript(() => {
      const recoveryPackage = {
        id: 'wo-rush-9001-delivery-recovery',
        title: 'WO-RUSH-9001 交期恢复执行包',
        auditCode: 'AUD-CHAT-RECOVERY-PACKAGE-20260521-001',
        traceId: 'TRACE-CHAT-RECOVERY-WO-RUSH-9001-20260521',
        actor: 'AI 生产助手',
        role: 'Assistant',
        workOrders: 'WO-RUSH-9001 / WO-DEMO-1002 / WO-2026-0042',
        priority: 'critical',
        owner: '生产经理审批',
        dueAt: '今日 15:30',
        scheduleWindow: '锁定期后第一个 CNC 空窗 + 夜班加班',
        scheduleAction: '保护 8h 锁定期，释放 M-AL-6061B 替代料复核，把 WO-RUSH-9001 插入 CNC-003 夜班窗口。',
        riskImpact: '急单、缺料和 CNC-001 维护窗口叠加。',
        riskSuggestion: '风险队列转生产经理审批，采购确认替代批次，质量保留首件复核。',
        otdImpact: '+3.33pt / p=0.7745',
        delayImpact: '-4 单延期风险',
        changeoverImpact: '+20min 可控',
        status: 'active',
        statusLabel: '待跨模块复核',
        purchaseActionStatus: 'closed',
        purchaseActionAuditCode: 'AUD-CHAT-RECOVERY-PURCHASE-CLOSURE-20260521-001',
        purchaseActionTraceId: 'TRACE-CHAT-RECOVERY-PURCHASE-M-AL-6061-RECEIVED-20260521',
        purchaseActionSummary: '采购 王工 已确认 PO-RUSH-20260519 加急收货，M-AL-6061 齐套缺口清零。',
        qualityActionStatus: 'pending',
        qualityActionTraceId: 'TRACE-QA-RECOVERY-FIRST-ARTICLE',
        qualityActionAuditCode: 'AUD-QA-RECOVERY-FIRST-ARTICLE',
        firstArticleRecord: 'FAI-WO-RUSH-9001-OP20-20260521',
        summary: 'AI 生产助手把最高风险工单、缺料、设备维护和质量复核合并成一张可执行动作包。',
        dispatchSteps: [
          {
            module: 'AI 排产',
            owner: '调度员 李工',
            action: '生成锁定期后插入 + CNC-003 分流 + 夜班加班建议',
            evidence: 'TRACE-SCH-RECOVERY-WO-RUSH-9001',
            status: 'pending',
          },
          {
            module: '风险预警',
            owner: '生产经理审批',
            action: '把急单、缺料、设备维护窗口升级为跨部门处置项',
            evidence: 'TRACE-RISK-RECOVERY-WO-RUSH-9001',
            status: 'pending',
          },
          {
            module: '采购协同',
            owner: '采购 王工',
            action: '确认 M-AL-6061B 替代批次和到料承诺',
            evidence: 'TRACE-CHAT-RECOVERY-PURCHASE-M-AL-6061-RECEIVED-20260521',
            status: 'closed',
          },
          {
            module: '质量闭环',
            owner: '质量工程师 周工',
            action: '保留替代料首件检验与 OP-20 装配扭矩复核窗口',
            evidence: 'TRACE-QA-RECOVERY-FIRST-ARTICLE',
            status: 'pending',
          },
        ],
        createdAt: '2026-05-21T09:00:00.000Z',
      }
      localStorage.setItem('aimes_assistant_recovery_packages', JSON.stringify([recoveryPackage]))

      const originalSetItem = Storage.prototype.setItem
      Storage.prototype.setItem = function setItemWithAssistantQualityClosureFailure(key: string, value: string) {
        if (key === 'aimes_assistant_recovery_packages') {
          throw new Error('assistant quality action closure unavailable from chromium')
        }
        return originalSetItem.call(this, key, value)
      }
    })

    await page.route('**/api/v1/scheduling/quality-knowledge-evidence**', async route => {
      if (route.request().method() === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: '[]',
        })
        return
      }
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: '{}',
      })
    })
    await page.route('**/api/v1/assistant-evidence/recovery-packages**', async route => {
      if (route.request().method() === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: '[]',
        })
        return
      }
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: '{}',
      })
    })

    await page.goto('quality', { waitUntil: 'commit', timeout: 45000 })
    await page.waitForSelector('.quality-board', { timeout: 60000 })

    const capaPanel = page.locator('.quality-capa-panel')
    const assistantCard = capaPanel.locator('.assistant-quality-closure-card')
    await expect(assistantCard).toBeVisible()
    await expect(assistantCard.getByText('助手执行包质量责任')).toBeVisible()
    await expect(assistantCard.getByText('WO-RUSH-9001 交期恢复执行包')).toBeVisible()
    await expect(assistantCard.getByText('TRACE-QA-RECOVERY-FIRST-ARTICLE')).toBeVisible()
    await expect(assistantCard.getByRole('button', { name: '确认首件复核闭环' })).toBeVisible()

    await assistantCard.getByRole('button', { name: '确认首件复核闭环' }).click()

    const alert = capaPanel.getByRole('alert')
    await expect(alert).toBeVisible()
    await expect(alert).toContainText('助手执行包质量责任闭环失败')
    await expect(alert).toContainText('assistant quality action closure unavailable from chromium')
    await expect(assistantCard.getByRole('button', { name: '确认首件复核闭环' })).toBeVisible()
    await expect(assistantCard.locator('.assistant-quality-result')).toBeHidden()
    await expect(assistantCard.getByText('AUD-CHAT-RECOVERY-QUALITY-CLOSURE-20260521-001')).toBeHidden()
    await expect(assistantCard.getByText('TRACE-CHAT-RECOVERY-QUALITY-FIRST-ARTICLE-20260521')).toBeHidden()
    await expect(capaPanel.getByText(/交期恢复执行包质量责任动作已闭合/)).toBeHidden()

    const recoveryRecords = await page.evaluate(() => localStorage.getItem('aimes_assistant_recovery_packages'))
    const evidenceRecords = await page.evaluate(() => localStorage.getItem('aimes_otd_evidence_chain'))
    expect(recoveryRecords ?? '').toContain('"qualityActionStatus":"pending"')
    expect(recoveryRecords ?? '').not.toContain('"qualityActionStatus":"closed"')
    expect(recoveryRecords ?? '').not.toContain('TRACE-CHAT-RECOVERY-QUALITY-FIRST-ARTICLE-20260521')
    expect(evidenceRecords ?? '').not.toContain('TRACE-CHAT-RECOVERY-QUALITY-FIRST-ARTICLE-20260521')
  })

  test('R3 灰度发布后优先进入质量推荐排序和助手引用', async ({ page }) => {
    await page.addInitScript(() => {
      const sample = {
        id: 'quality-knowledge-sample-qr-rework-wo-rush-9001-op-10',
        workOrderId: 'WO-RUSH-9001',
        operationCode: 'OP-10',
        processName: 'CNC 精加工',
        equipmentCode: 'CNC-002',
        materialBatch: 'AL-202605',
        defectPattern: '首件尺寸偏差 + Ra 粗糙度复检',
        documentId: 'kg-quality-barcode-rework',
        documentTitle: '扫码返工 CAPA 样本库',
        version: 'QK-20260521',
        validUntil: '2026-12-31',
        auditId: 'AUD-KG-QA-REWORK-20260521-001',
        traceId: 'TRACE-KG-QA-WO-RUSH-9001-OP-10-REWORK-SAMPLE',
        createdAt: '2026-05-21T10:00:00.000Z',
        summary: 'WO-RUSH-9001 OP-10 扫码质检不合格已沉淀为可复用样本，覆盖批次隔离、返工成本、复验放行、OP-20 释放和排产回写。',
        capaRecommendations: [
          '同类 CNC 首件尺寸偏差先冻结下道交接并隔离 AL 批次。',
          '按不良数量预估返工工时成本，进入 OTD 与经营复盘。',
        ],
        reuseTargets: ['质量根因分析', 'AI 生产助手', '文档上传', '报表中心', '审计日志'],
        evidenceTraceIds: ['TRACE-QR-WO-RUSH-9001-OP-10-REWORK'],
      }
      const draft = {
        id: 'quality-knowledge-reuse-draft-wo-demo-1012-op-10',
        sourceSampleId: sample.id,
        sourceTraceId: sample.traceId,
        targetWorkOrderId: 'WO-DEMO-1012',
        targetOperationCode: 'OP-10',
        targetProcessName: 'CNC 精加工',
        targetEquipmentCode: 'CNC-002',
        targetMaterialBatch: 'AL-202605-B',
        targetDefectPattern: '首件尺寸偏差',
        matchScore: 92,
        effectScore: 88,
        auditId: 'AUD-KG-QA-REUSE-20260521-001',
        traceId: 'TRACE-KG-QA-WO-DEMO-1012-OP-10-REUSE-DRAFT',
        createdAt: '2026-05-21T10:10:00.000Z',
        summary: 'WO-DEMO-1012 OP-10 命中扫码返工 CAPA 样本，同设备、同工序、同 AL 批次族和同类首件尺寸偏差均匹配。',
        matchDimensions: [
          { label: '工序', source: 'CNC 精加工', target: 'CNC 精加工', matched: true },
          { label: '设备', source: 'CNC-002', target: 'CNC-002', matched: true },
          { label: '材料族', source: 'AL-202605', target: 'AL-202605-B', matched: true },
          { label: '缺陷模式', source: '首件尺寸偏差', target: '首件尺寸偏差', matched: true },
        ],
        dispositionDraft: ['冻结 WO-DEMO-1012 OP-10 到 OP-20 的下道交接。'],
        effectMetrics: [{ label: '分析节省', value: '45 分钟' }],
        evidenceTraceIds: [sample.traceId],
      }
      const closure = {
        id: 'quality-knowledge-reuse-closure-wo-demo-1012-op-10',
        draftId: draft.id,
        draftTraceId: draft.traceId,
        targetWorkOrderId: draft.targetWorkOrderId,
        targetOperationCode: draft.targetOperationCode,
        formalCapaTitle: 'WO-DEMO-1012 OP-10 同类首件尺寸偏差正式 CAPA',
        owner: '质量工程师 周工 / 工艺工程师 陈工',
        dueAt: '今日 17:30',
        verification: '复验尺寸 Cpk >= 1.33，OP-20 首件接收无返修',
        auditId: 'AUD-KG-QA-REUSE-CAPA-20260521-001',
        traceId: 'TRACE-KG-QA-WO-DEMO-1012-OP-10-FORMAL-CAPA',
        effectTraceId: 'TRACE-KG-QA-WO-DEMO-1012-OP-10-REUSE-EFFECT',
        approvedAt: '2026-05-21T10:20:00.000Z',
        verifiedAt: '2026-05-21T10:30:00.000Z',
        status: 'verified',
        statusLabel: '复用效果已回写',
        effectScoreBefore: 88,
        effectScoreAfter: 94,
        effectReview: '复用扫码返工样本后，根因确认、隔离、返工成本和排产复核不再重复拆解。',
        feedbackActions: ['复验通过后把草案命中、正式 CAPA 和效果评分写回知识样本。'],
        feedbackMetrics: [{ label: '重复分析节省', value: '45 分钟' }],
      }
      const reviewQueue = {
        id: 'quality-knowledge-review-low-score-wo-demo-1018-op-20',
        sourceRankingId: 'reuse-rank-low-score-torque',
        targetWorkOrderId: 'WO-DEMO-1018',
        operationCode: 'OP-20',
        title: 'WO-DEMO-1018 OP-20 低分复用样本复核',
        reason: '装配扭矩偏移与扫码返工源样本跨工序、跨设备，复用效果 61 分，低于 70 分阈值。',
        owner: '质量主管 刘工 / 知识库管理员',
        dueAt: '明日 10:00',
        auditId: 'AUD-KG-QA-LOW-SCORE-20260521-001',
        traceId: 'TRACE-KG-QA-WO-DEMO-1018-OP-20-LOW-SCORE-REVIEW',
        createdAt: '2026-05-21T10:40:00.000Z',
        status: 'closed',
        statusLabel: '直接复用已禁用',
        effectScore: 61,
        reviewActions: ['复核 OP-20 装配扭矩偏移是否属于扫码返工样本的有效泛化范围。'],
        closedAt: '2026-05-21T10:50:00.000Z',
        decisionAuditId: 'AUD-KG-QA-LOW-SCORE-DECISION-20260521-001',
        decisionTraceId: 'TRACE-KG-QA-WO-DEMO-1018-OP-20-LOW-SCORE-DECISION',
        decisionLabel: '禁用直接复用',
        decisionSummary: '人工复核确认 OP-20 装配扭矩偏移与 CNC 扫码返工样本不属于同一泛化族。',
        disabledReuseRule: 'matchScore < 70 或跨工序缺陷模式不一致时，只能进入复核/再训练队列，不能进入优先推荐。',
        retrainingTraceId: 'TRACE-KG-QA-WO-DEMO-1018-OP-20-RETRAINING-CANDIDATE',
        retrainingPlan: ['把本次 61 分低分尝试作为负样本，降低跨工序扫码返工样本的召回权重。'],
      }
      const feedback = {
        id: 'quality-recommendation-feedback-wo-demo-1018-op-20',
        rankingId: 'reuse-rank-published-torque-retraining',
        trainingSetVersion: 'QK-TRAIN-20260521-R2',
        targetWorkOrderId: 'WO-DEMO-1018',
        operationCode: 'OP-20',
        decision: 'accepted',
        decisionLabel: '现场已采纳推荐',
        owner: '质量工程师 周工 / 装配班长 王工',
        reason: '复验发现 OP-20 扭矩工具校准、设备族和缺陷模式均命中独立 CAPA 样本。',
        decidedAt: '2026-05-21T13:00:00.000Z',
        auditId: 'AUD-KG-QA-RECOMMENDATION-FEEDBACK-20260521-001',
        traceId: 'TRACE-KG-QA-WO-DEMO-1018-OP-20-RECOMMENDATION-ADOPTED',
        effectScoreBefore: 89,
        effectScoreAfter: 93,
        effectTrendLabel: '89 -> 93 分',
        nextTrainingSetVersion: 'QK-TRAIN-20260521-R3',
        nextTrainingTraceId: 'TRACE-KG-QA-WO-DEMO-1018-OP-20-NEXT-TRAINING-R3',
        feedbackActions: ['装配班长按独立扭矩 CAPA 执行工具校准复验。'],
        feedbackMetrics: [
          { label: '推荐采纳耗时', value: '18 分钟' },
          { label: '复验通过率', value: '100%' },
        ],
      }
      const r2Published = {
        id: 'quality-retraining-version-quality-knowledge-review-low-score-wo-demo-1018-op-20',
        sourceReviewQueueId: reviewQueue.id,
        targetWorkOrderId: 'WO-DEMO-1018',
        operationCode: 'OP-20',
        candidateTraceId: 'TRACE-KG-QA-WO-DEMO-1018-OP-20-RETRAINING-CANDIDATE',
        trainingSetVersion: 'QK-TRAIN-20260521-R2',
        trainingSetName: '装配扭矩偏移 CAPA 再训练样本集',
        status: 'published',
        statusLabel: '已发布到 AI 推荐',
        approvedBy: '知识库管理员 / 质量主管 刘工',
        approvedAt: '2026-05-21T12:00:00.000Z',
        approvalAuditId: 'AUD-KG-QA-RETRAINING-APPROVAL-20260521-001',
        approvalTraceId: 'TRACE-KG-QA-WO-DEMO-1018-OP-20-RETRAINING-APPROVED',
        positiveSampleCount: 18,
        negativeSampleCount: 3,
        featurePolicy: '工序、设备族、缺陷模式、验证效果分必须同时参与召回排序。',
        changeSummary: ['新增 OP-20 装配扭矩偏移独立 CAPA 正样本。'],
        validationGates: ['离线 Top-3 召回不得推荐跨工序扫码返工样本。'],
        validationStatus: 'passed',
        validatedAt: '2026-05-21T12:30:00.000Z',
        validationAuditId: 'AUD-KG-QA-RETRAINING-VALIDATION-PASS-20260521-001',
        validationTraceId: 'TRACE-KG-QA-WO-DEMO-1018-OP-20-RETRAINING-VALIDATION-PASSED',
        validationSummary: 'OP-20 扭矩工具校准字段已补齐。',
        validationFindings: ['低分负样本召回权重下降 36%。'],
        publishedAt: '2026-05-21T12:40:00.000Z',
        publishAuditId: 'AUD-KG-QA-RETRAINING-PUBLISH-20260521-001',
        publishTraceId: 'TRACE-KG-QA-WO-DEMO-1018-OP-20-RETRAINING-PUBLISHED',
        publishSummary: '训练集版本通过发布前校验后进入质量知识复用排序。',
        recommendationScope: ['质量知识复用排序', 'AI 生产助手引用链', 'CAPA 草案推荐'],
      }
      const r3GrayPublished = {
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
      }
      localStorage.setItem('aimes_quality_knowledge_samples', JSON.stringify([sample]))
      localStorage.setItem('aimes_quality_knowledge_reuse_drafts', JSON.stringify([draft]))
      localStorage.setItem('aimes_quality_knowledge_reuse_closures', JSON.stringify([closure]))
      localStorage.setItem('aimes_quality_knowledge_review_queue', JSON.stringify([reviewQueue]))
      localStorage.setItem('aimes_quality_knowledge_recommendation_feedback', JSON.stringify([feedback]))
      localStorage.setItem('aimes_quality_knowledge_retraining_versions', JSON.stringify([r3GrayPublished, r2Published]))
    })

    await page.goto('quality', { waitUntil: 'commit', timeout: 45000 })
    await page.waitForSelector('.quality-board', { timeout: 60000 })

    const rankingPanel = page.locator('.reuse-ranking-panel')
    const grayCard = rankingPanel.locator('.ranking-card').filter({ hasText: 'WO-DEMO-1018 OP-20 装配扭矩偏移独立 CAPA 推荐' })
    await expect(grayCard.locator('.ranking-topline span').getByText('已灰度发布', { exact: true })).toBeVisible()
    await expect(grayCard.locator('.ranking-topline strong').getByText('93 分', { exact: true })).toBeVisible()
    const releaseMeta = grayCard.locator('.ranking-training-release')
    await expect(releaseMeta.getByText('QK-TRAIN-20260521-R3', { exact: true })).toBeVisible()
    await expect(releaseMeta.getByText('OP-20 装配扭矩推荐链路', { exact: true })).toBeVisible()
    await expect(releaseMeta.getByText('AUD-KG-QA-RETRAINING-R3-GRAY-PUBLISH-20260521-001', { exact: true })).toBeVisible()
    await expect(grayCard.getByText('TRACE-KG-QA-WO-DEMO-1018-OP-20-R3-GRAY-PUBLISHED')).toBeVisible()
    await expect(grayCard.getByText(/效果趋势 89 -> 93 分/)).toBeVisible()

    await page.locator('.chat-fab').click()
    await page.locator('.chat-input').fill('扫码返工同类问题怎么复用 CAPA？')
    await page.locator('.send-btn').click()
    const chat = page.locator('.chat-panel')
    await expect(chat.getByText(/再训练发布：QK-TRAIN-20260521-R3 已灰度发布，OP-20 装配扭矩推荐链路 已启用/)).toBeVisible()
    await expect(chat.getByText(/AUD-KG-QA-RETRAINING-R3-GRAY-PUBLISH-20260521-001/)).toBeVisible()
    await expect(chat.getByText(/TRACE-KG-QA-WO-DEMO-1018-OP-20-R3-GRAY-PUBLISHED/)).toBeVisible()
    await expect(chat.getByText(/采纳反馈：现场已采纳推荐，效果趋势 89 -> 93 分，进入 QK-TRAIN-20260521-R3/)).toBeVisible()
    await chat.locator('.sources-toggle').click()
    await expect(chat.locator('.source-item').filter({ hasText: 'QK-TRAIN-20260521-R3 已灰度发布训练集' })).toBeVisible()
  })

  test('R4 扩大后成为主动质量推荐且 R5 回滚被排除', async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('aimes_quality_knowledge_recommendation_feedback', JSON.stringify([
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
      ]))
      localStorage.setItem('aimes_quality_knowledge_retraining_versions', JSON.stringify([
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
      ]))
      localStorage.setItem('aimes_quality_knowledge_gray_release_decisions', JSON.stringify([
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
          id: 'quality-gray-release-decision-qk-train-20260521-r5-initial-rolled-back',
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
      ]))
    })

    await page.goto('quality', { waitUntil: 'commit', timeout: 45000 })
    await page.waitForSelector('.quality-board', { timeout: 60000 })

    const rankingPanel = page.locator('.reuse-ranking-panel')
    const recommendationCard = rankingPanel.locator('.ranking-card').filter({ hasText: 'WO-DEMO-1018 OP-20 装配扭矩偏移独立 CAPA 推荐' })
    await expect(recommendationCard.locator('.ranking-topline span').getByText('实验扩大优先', { exact: true })).toBeVisible()
    await expect(recommendationCard.locator('.ranking-topline strong').getByText('96 分', { exact: true })).toBeVisible()
    await expect(recommendationCard.locator('.ranking-training-release').getByText('QK-TRAIN-20260521-R4', { exact: true })).toBeVisible()
    await expect(recommendationCard.locator('.ranking-training-release').getByText('AUD-KG-QA-RETRAINING-R4-GRAY-PUBLISH-20260521-001', { exact: true })).toBeVisible()
    await expect(recommendationCard.getByText(/QK-TRAIN-20260521-R4 已按 AUD-KG-QA-RETRAINING-R4-GRAY-EXPAND-20260521-001 确认扩大/)).toBeVisible()
    await expect(recommendationCard.locator('.ranking-experiment-decision').getByText('扩大灰度范围 / 质量主管已确认扩大')).toBeVisible()
    await expect(recommendationCard.locator('.ranking-experiment-decision').getByText('TRACE-KG-QA-WO-DEMO-1018-OP-20-R4-GRAY-EXPANDED')).toBeVisible()
    await expect(recommendationCard.locator('.ranking-tags').getByText('QK-TRAIN-20260521-R5 已回滚排除', { exact: true })).toBeVisible()
    await expect(recommendationCard.locator('.ranking-excluded-experiments').getByText('QK-TRAIN-20260521-R5 / 回滚到 R2 正式版 / AUD-KG-QA-RETRAINING-R5-GRAY-ROLLBACK-20260521-001')).toBeVisible()
  })

  test('R7 影子灰度需质量主管确认后才进入主动推荐', async ({ page }) => {
    await page.goto('quality', { waitUntil: 'commit', timeout: 45000 })
    await page.waitForSelector('.quality-board', { timeout: 60000 })
    await page.evaluate(() => {
      const r2Published = {
        id: 'quality-retraining-version-qk-train-20260521-r2',
        sourceReviewQueueId: 'quality-knowledge-review-low-score-wo-demo-1018-op-20',
        targetWorkOrderId: 'WO-DEMO-1018',
        operationCode: 'OP-20',
        candidateTraceId: 'TRACE-KG-QA-WO-DEMO-1018-OP-20-RETRAINING-CANDIDATE',
        trainingSetVersion: 'QK-TRAIN-20260521-R2',
        trainingSetName: '装配扭矩偏移 CAPA 再训练样本集',
        status: 'published',
        statusLabel: '已发布到 AI 推荐',
        approvedBy: '知识库管理员 / 质量主管 刘工',
        approvedAt: '2026-05-21T12:00:00.000Z',
        approvalAuditId: 'AUD-KG-QA-RETRAINING-APPROVAL-20260521-001',
        approvalTraceId: 'TRACE-KG-QA-WO-DEMO-1018-OP-20-RETRAINING-APPROVED',
        positiveSampleCount: 18,
        negativeSampleCount: 3,
        featurePolicy: '工序、设备族、缺陷模式、验证效果分必须同时参与召回排序。',
        changeSummary: ['新增 OP-20 装配扭矩偏移独立 CAPA 正样本。'],
        validationGates: ['离线 Top-3 召回不得推荐跨工序扫码返工样本。'],
        validationStatus: 'passed',
        validatedAt: '2026-05-21T12:30:00.000Z',
        validationAuditId: 'AUD-KG-QA-RETRAINING-VALIDATION-PASS-20260521-001',
        validationTraceId: 'TRACE-KG-QA-WO-DEMO-1018-OP-20-RETRAINING-VALIDATION-PASSED',
        validationSummary: 'OP-20 扭矩工具校准字段已补齐。',
        validationFindings: ['低分负样本召回权重下降 36%。'],
        publishedAt: '2026-05-21T12:40:00.000Z',
        publishAuditId: 'AUD-KG-QA-RETRAINING-PUBLISH-20260521-001',
        publishTraceId: 'TRACE-KG-QA-WO-DEMO-1018-OP-20-RETRAINING-PUBLISHED',
        publishSummary: '训练集版本通过发布前校验后进入质量知识复用排序。',
        recommendationScope: ['质量知识复用排序', 'AI 生产助手引用链', 'CAPA 草案推荐'],
      }
      const r7ShadowGray = {
        id: 'quality-retraining-version-qk-train-20260521-r7',
        sourceReviewQueueId: 'experiment-candidate-quality-experiment-candidate-qk-train-20260521-r7-shadow-validation',
        targetWorkOrderId: 'WO-DEMO-1018',
        operationCode: 'OP-20',
        candidateTraceId: 'TRACE-KG-QA-WO-DEMO-1018-OP-20-R7-SHADOW-VALIDATION',
        trainingSetVersion: 'QK-TRAIN-20260521-R7',
        trainingSetName: 'R7 跨线扭矩偏移影子验证集',
        status: 'gray_published',
        statusLabel: '影子灰度已发布',
        approvedBy: '知识库管理员 / 质量主管 刘工',
        approvedAt: '2026-05-21T18:20:00.000Z',
        approvalAuditId: 'AUD-KG-QA-RETRAINING-R7-SHADOW-VALIDATION-APPROVAL-20260521-001',
        approvalTraceId: 'TRACE-KG-QA-WO-DEMO-1018-OP-20-R7-SHADOW-VALIDATION-APPROVED',
        positiveSampleCount: 38,
        negativeSampleCount: 8,
        featurePolicy: 'R7 只运行影子流量，验证跨线同名缺陷不会再次误召回；通过后仅可提交扩大审批。',
        changeSummary: ['继承 R6 补齐后的 8 条跨线负样本覆盖。'],
        validationGates: ['2 个跨线影子场景误召回 0 次。'],
        validationStatus: 'passed',
        validatedAt: '2026-05-21T18:25:00.000Z',
        validationAuditId: 'AUD-KG-QA-RETRAINING-R7-SHADOW-VALIDATION-PASS-20260521-001',
        validationTraceId: 'TRACE-KG-QA-WO-DEMO-1018-OP-20-R7-SHADOW-VALIDATION-PASSED',
        validationSummary: 'R7 影子验证通过，2 个跨线场景误召回 0 次，可进入质量主管扩大审批准备。',
        validationFindings: ['跨线影子场景 LX-A / LX-B 均未触发同名缺陷误召回。', 'Top-3 推荐继续命中 OP-20 独立扭矩 CAPA 样本。'],
        publishedAt: '2026-05-21T18:30:00.000Z',
        publishAuditId: 'AUD-KG-QA-RETRAINING-R7-SHADOW-GRAY-PUBLISH-20260521-001',
        publishTraceId: 'TRACE-KG-QA-WO-DEMO-1018-OP-20-R7-SHADOW-GRAY-PUBLISHED',
        publishSummary: 'QK-TRAIN-20260521-R7 已基于 R6 负样本补齐和 R7 影子验证发布到跨线影子灰度范围；未完成扩大决策与质量主管确认前，不进入主动推荐选择。',
        recommendationScope: ['跨线 OP-20 扭矩偏移影子灰度', '质量知识复用排序影子流量', 'AI 生产助手引用链影子校验'],
      }
      localStorage.setItem('aimes_quality_knowledge_retraining_versions', JSON.stringify([r7ShadowGray, r2Published]))
      localStorage.setItem('aimes_quality_knowledge_gray_release_decisions', JSON.stringify([]))
    })

    await page.reload({ waitUntil: 'commit', timeout: 45000 })
    await page.waitForSelector('.quality-board', { timeout: 60000 })
    let recommendationCard = page.locator('.reuse-ranking-panel .ranking-card').filter({ hasText: 'WO-DEMO-1018 OP-20 装配扭矩偏移独立 CAPA 推荐' })
    await expect(recommendationCard.locator('.ranking-training-release').getByText('QK-TRAIN-20260521-R2', { exact: true })).toBeVisible()
    await expect(recommendationCard.getByText('QK-TRAIN-20260521-R7')).toHaveCount(0)

    await page.goto('admin', { waitUntil: 'commit', timeout: 45000 })
    await page.waitForSelector('.admin-board', { timeout: 30000 })
    await page.getByRole('tab', { name: 'Agent 治理' }).click()
    const r7Monitor = page.locator('.quality-gray-monitor-card').filter({ hasText: 'QK-TRAIN-20260521-R7 灰度监控' })
    await expect(r7Monitor.locator('.action-topline span').getByText('跨线 OP-20 扭矩偏移影子灰度', { exact: true })).toBeVisible()
    await r7Monitor.getByRole('button', { name: '扩大灰度' }).click()
    await expect(r7Monitor.getByText('待质量主管确认')).toBeVisible()

    await page.goto('quality', { waitUntil: 'commit', timeout: 45000 })
    await page.waitForSelector('.quality-board', { timeout: 60000 })
    recommendationCard = page.locator('.reuse-ranking-panel .ranking-card').filter({ hasText: 'WO-DEMO-1018 OP-20 装配扭矩偏移独立 CAPA 推荐' })
    await expect(recommendationCard.locator('.ranking-training-release').getByText('QK-TRAIN-20260521-R2', { exact: true })).toBeVisible()
    await expect(page.locator('.gray-release-decision-banner').getByText('QK-TRAIN-20260521-R7 / 扩大灰度范围')).toBeVisible()

    await page.goto('admin', { waitUntil: 'commit', timeout: 45000 })
    await page.waitForSelector('.admin-board', { timeout: 30000 })
    await page.getByRole('tab', { name: 'Agent 治理' }).click()
    await page.locator('.quality-gray-monitor-card').filter({ hasText: 'QK-TRAIN-20260521-R7 灰度监控' }).getByRole('button', { name: '质量主管确认扩大' }).click()

    await page.goto('quality', { waitUntil: 'commit', timeout: 45000 })
    await page.waitForSelector('.quality-board', { timeout: 60000 })
    recommendationCard = page.locator('.reuse-ranking-panel .ranking-card').filter({ hasText: 'WO-DEMO-1018 OP-20 装配扭矩偏移独立 CAPA 推荐' })
    await expect(recommendationCard.locator('.ranking-topline span').getByText('实验扩大优先', { exact: true })).toBeVisible()
    await expect(recommendationCard.locator('.ranking-topline strong').getByText('94 分', { exact: true })).toBeVisible()
    await expect(recommendationCard.locator('.ranking-training-release').getByText('QK-TRAIN-20260521-R7', { exact: true })).toBeVisible()
    await expect(recommendationCard.locator('.ranking-training-release').getByText('跨线 OP-20 扭矩偏移影子灰度', { exact: true })).toBeVisible()
    await expect(recommendationCard.getByText(/QK-TRAIN-20260521-R7 已按 AUD-KG-QA-RETRAINING-R7-GRAY-EXPAND-20260521-001 确认扩大/)).toBeVisible()
    await expect(recommendationCard.locator('.ranking-experiment-decision').getByText('扩大灰度范围 / 质量主管已确认扩大')).toBeVisible()
    await expect(recommendationCard.locator('.ranking-experiment-decision').getByText('TRACE-KG-QA-WO-DEMO-1018-OP-20-R7-GRAY-EXPANDED')).toBeVisible()
  })
})
