import { test, expect } from '@playwright/test'

function offlineDemoPath(path: string) {
  return `${path}?offlineDemo=1`
}

test.describe('Anomaly 现场事件中心', () => {
  test.describe.configure({ timeout: 60000 })

  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      if (localStorage.getItem('aimes_e2e_live_mock') === 'true') return
      localStorage.setItem('aimes_offline_demo', 'true')
      localStorage.setItem('aimes_token', 'demo-token-admin')
      localStorage.setItem('aimes_refresh_token', 'demo-refresh-admin')
      localStorage.setItem('aimes_user', JSON.stringify({ username: 'admin', displayName: '管理员', role: 'Admin', mustChangePassword: false }))
    })
    await page.goto(offlineDemoPath('anomaly'), { waitUntil: 'domcontentloaded' })
  })

  async function seedLiveMockSession(page: import('@playwright/test').Page, options: { evaluateNow?: boolean } = {}) {
    const seed = () => {
      localStorage.setItem('aimes_e2e_live_mock', 'true')
      localStorage.setItem('aimes_offline_demo', 'false')
      localStorage.setItem('aimes_token', 'mock-e2e-token')
      localStorage.setItem('aimes_refresh_token', 'mock-e2e-refresh')
      localStorage.setItem('aimes_user', JSON.stringify({ username: 'admin', displayName: '管理员', role: 'Admin', mustChangePassword: false }))
    }
    await page.addInitScript(seed)
    if (options.evaluateNow !== false) {
      await page.evaluate(seed)
    }
  }

  test('展示异常到风险、排产、质量、采购的处置闭环', async ({ page }) => {
    const panel = page.locator('.event-center')
    await expect(panel.getByText('现场事件中心')).toBeVisible()
    await expect(panel.getByText('异常到处置闭环')).toBeVisible()
    const laneList = panel.locator('.event-lanes')
    await expect(laneList).toHaveAttribute('role', 'list')
    await expect(laneList).toHaveAttribute('aria-label', '异常分流事件队列：3 条')
    const equipmentLane = panel.locator('.event-lane').filter({ hasText: 'CNC-001 主轴温升异常' })
    await expect(equipmentLane).toHaveAttribute('role', 'listitem')
    await expect(equipmentLane).toHaveAttribute('aria-label', /设备事件：CNC-001 主轴温升异常/)
    await expect(panel.getByText('CNC-001 主轴温升异常')).toBeVisible()
    await expect(panel.getByText('装配间隙超差')).toBeVisible()
    await expect(panel.getByText('原料批次来料异常')).toBeVisible()
    await expect(panel.getByText('异常管理 -> 风险队列 -> AI 排产 -> 设备维护')).toBeVisible()
    await expect(panel.getByText(/设备异常进入风险队列和排产复核/)).toBeVisible()

    await panel.getByRole('link', { name: '查看风险处置队列' }).click()
    await expect(page).toHaveURL(/\/scheduling\/risk\?offlineDemo=1$/)
  })

  test('异常分流证据写入失败时真实浏览器展示 fail-loud 且不伪造分流', async ({ page }) => {
    await page.evaluate(() => {
      const originalSetItem = Storage.prototype.setItem
      Storage.prototype.setItem = function setItemWithAnomalyDispatchFailure(key: string, value: string) {
        if (key === 'aimes_anomaly_dispatch_records') {
          throw new Error('anomaly dispatch storage unavailable from chromium')
        }
        return originalSetItem.call(this, key, value)
      }
    })

    const panel = page.locator('.event-center')
    const qualityLane = panel.locator('.event-lane').filter({ hasText: '装配间隙超差' })

    await qualityLane.getByRole('button', { name: '确认分流' }).click()

    const alert = page.locator('.anomaly-notification')
    await expect(alert).toBeVisible()
    await expect(alert).toContainText('异常分流确认失败')
    await expect(alert).toContainText('anomaly dispatch storage unavailable from chromium')
    await expect(qualityLane.getByRole('button', { name: '确认分流' })).toBeVisible()
    await expect(panel.locator('.dispatch-trace')).toBeHidden()
  })

  test('异常分流记录启动读取失败时真实浏览器仍加载异常列表并 fail-loud', async ({ page }) => {
    await page.route('**/api/v1/scheduling/production-anomaly-event/latest', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: 'null',
      })
    })
    await page.route('**/api/v1/scheduling/anomaly-dispatch-records**', async route => {
      await route.fulfill({
        status: 503,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'dispatch backend unavailable from chromium' }),
      })
    })
    await page.route('**/api/v1/anomaly**', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          items: [{
            id: 'a-real-dispatch-read-fail',
            workOrderNumber: 'WO-DISPATCH-READ-001',
            operationCode: 'OP-010',
            equipmentId: 'CNC-001',
            anomalyType: 'equipment',
            severity: 'Critical',
            title: 'CNC-001 主轴温升异常',
            description: '用于验证分流记录启动读取失败不阻断异常列表。',
            detectedAt: '2026-06-14T10:00:00',
            detectedBy: 'operator-dispatch',
            status: 'Open',
            rootCause: null,
            resolution: null,
            responseCount: 0,
          }],
          totalCount: 1,
          page: 1,
          pageSize: 20,
          totalPages: 1,
        }),
      })
    })
    await page.addInitScript(() => {
      localStorage.setItem('aimes_offline_demo', 'false')
      const originalGetItem = Storage.prototype.getItem
      const originalRemoveItem = Storage.prototype.removeItem
      Storage.prototype.getItem = function getItemWithAnomalyDispatchFailure(key: string) {
        if (key === 'aimes_anomaly_dispatch_records') {
          throw new Error('dispatch storage read unavailable from chromium')
        }
        return originalGetItem.call(this, key)
      }
      Storage.prototype.removeItem = function removeItemWithAnomalyDispatchFailure(key: string) {
        if (key === 'aimes_anomaly_dispatch_records') {
          throw new Error('dispatch storage cleanup unavailable from chromium')
        }
        return originalRemoveItem.call(this, key)
      }
    })

    await seedLiveMockSession(page, { evaluateNow: false })
    await page.goto('anomaly?offlineDemo=0', { waitUntil: 'domcontentloaded' })

    const alert = page.locator('.anomaly-notification')
    await expect(alert).toBeVisible()
    await expect(alert).toContainText('异常分流记录加载失败')
    await expect(alert).toContainText('dispatch storage cleanup unavailable from chromium')
    await expect(page.locator('.anomaly-card').filter({ hasText: 'CNC-001 主轴温升异常' })).toBeVisible()
    await expect(page.locator('.event-center').getByRole('button', { name: '确认分流' })).toHaveCount(3)
  })

  test('启动分流记录和异常列表同时失败时真实浏览器保留全部 fail-loud 原因', async ({ page }) => {
    await page.route('**/api/v1/scheduling/production-anomaly-event/latest', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: 'null',
      })
    })
    await page.route('**/api/v1/scheduling/anomaly-dispatch-records**', async route => {
      await route.fulfill({
        status: 503,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'dispatch backend unavailable from chromium' }),
      })
    })
    await page.route('**/api/v1/anomaly**', async route => {
      await route.fulfill({
        status: 503,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'anomaly list unavailable from chromium' }),
      })
    })
    await page.addInitScript(() => {
      localStorage.setItem('aimes_offline_demo', 'false')
      const originalGetItem = Storage.prototype.getItem
      const originalRemoveItem = Storage.prototype.removeItem
      Storage.prototype.getItem = function getItemWithAnomalyDispatchFailure(key: string) {
        if (key === 'aimes_anomaly_dispatch_records') {
          throw new Error('dispatch storage read unavailable from chromium')
        }
        return originalGetItem.call(this, key)
      }
      Storage.prototype.removeItem = function removeItemWithAnomalyDispatchFailure(key: string) {
        if (key === 'aimes_anomaly_dispatch_records') {
          throw new Error('dispatch storage cleanup unavailable from chromium')
        }
        return originalRemoveItem.call(this, key)
      }
    })

    await seedLiveMockSession(page)
    await page.goto('anomaly?offlineDemo=0', { waitUntil: 'domcontentloaded' })

    const alert = page.locator('.anomaly-notification')
    await expect(alert).toBeVisible()
    await expect(alert).toContainText('异常分流记录加载失败')
    await expect(alert).toContainText('dispatch storage cleanup unavailable from chromium')
    await expect(alert).toContainText('异常列表加载失败')
    await expect(alert).toContainText('anomaly list unavailable from chromium')
    await expect(page.locator('.anomaly-card').filter({ hasText: 'CNC-001 主轴温升异常' })).toBeVisible()
  })

  test('真实浏览器只请求单层 api/v1 anomaly 路径', async ({ page }) => {
    const anomalyRequests: string[] = []
    await page.route('**/api/v1/scheduling/production-anomaly-event/latest', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: 'null',
      })
    })
    await page.route('**/api/v1/scheduling/anomaly-dispatch-records**', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: '[]',
      })
    })
    await page.route('**/api/v1/auth/refresh', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          token: 'mock-e2e-token',
          refreshToken: 'mock-e2e-refresh',
          expiresAt: '2026-12-31T23:59:59Z',
        }),
      })
    })
    await page.route('**/api/v1/anomaly**', async route => {
      anomalyRequests.push(route.request().url())
      if (route.request().url().includes('/api/v1/api/v1/')) {
        await route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({ message: 'double api prefix should not be requested' }),
        })
        return
      }
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          items: [{
            id: 'a-real-prefix-1',
            workOrderNumber: 'WO-PREFIX-001',
            operationCode: 'OP-010',
            equipmentId: 'CNC-009',
            anomalyType: 'equipment',
            severity: 'Critical',
            title: '真实路径异常',
            description: '用于验证前端不会重复拼接 api/v1。',
            detectedAt: '2026-06-11T10:00:00',
            detectedBy: 'operator-prefix',
            status: 'Open',
            rootCause: null,
            resolution: null,
            responseCount: 0,
          }],
          totalCount: 1,
          page: 1,
          pageSize: 20,
          totalPages: 1,
        }),
      })
    })

    await seedLiveMockSession(page)
    await page.goto('anomaly?offlineDemo=0', { waitUntil: 'domcontentloaded' })
    await expect(page.locator('.anomaly-card').filter({ hasText: '真实路径异常' })).toBeVisible()

    expect(anomalyRequests.length).toBeGreaterThan(0)
    expect(anomalyRequests.some(url => url.includes('/api/v1/anomaly'))).toBe(true)
    expect(anomalyRequests.every(url => !url.includes('/api/v1/api/v1/'))).toBe(true)
  })

  test('异常详情仍可打开 AI 分析建议', async ({ page }) => {
    await page.locator('.anomaly-card').filter({ hasText: 'CNC-001 主轴温升异常' }).click()
    const drawer = page.getByRole('dialog', { name: 'CNC-001 主轴温升异常' })
    await expect(drawer.getByRole('heading', { name: 'CNC-001 主轴温升异常' })).toBeVisible()
    await expect(drawer.getByRole('button', { name: '关闭异常详情' })).toBeVisible()
    await drawer.getByRole('button', { name: 'AI 分析建议' }).click()
    const analysis = drawer.locator('.analysis-results')
    await expect(analysis.getByText('立即停机检查主轴冷却系统，检查冷却液位和循环泵')).toBeVisible()
    await expect(analysis.getByText('检查主轴轴承状态')).toBeVisible()
  })

  test('质量异常确认分流后进入风险队列、排产复核和 OTD 审计', async ({ page }) => {
    const panel = page.locator('.event-center')
    const qualityLane = panel.locator('.event-lane').filter({ hasText: '装配间隙超差' })
    await qualityLane.getByRole('button', { name: '确认分流' }).click()
    await expect(qualityLane.getByRole('button', { name: '已确认分流' })).toBeVisible()
    await expect(qualityLane.getByRole('button', { name: '已确认分流' })).toBeDisabled()
    await expect(panel.locator('.dispatch-trace').getByText('质量分流已确认')).toBeVisible()
    await expect(panel.locator('.dispatch-trace').getByText('TRACE-ANOMALY-DISPATCH-QUALITY-GAP-20260521')).toBeVisible()

    await page.goto(offlineDemoPath('risk'), { waitUntil: 'commit' })
    await page.waitForSelector('.risk-action-panel', { timeout: 30000 })
    const riskPanel = page.locator('.risk-action-panel')
    const riskCard = riskPanel.locator('.action-card').filter({ hasText: '装配间隙超差已分流到质量返工与排产复核' })
    await expect(riskCard.locator('.card-topline span').getByText('质量异常', { exact: true })).toBeVisible()
    await expect(riskCard.getByText(/影响工单：WO-20260502 \/ WO-RUSH-9001/)).toBeVisible()
    await expect(riskCard.getByText('负责人：质量工程师 周工')).toBeVisible()
    await expect(riskPanel.locator('.queue-trace').getByText(/异常管理现场事件中心确认分流/)).toBeVisible()

    await page.goto(offlineDemoPath('scheduling'), { waitUntil: 'commit' })
    await page.waitForSelector('.event-queue-panel', { timeout: 45000 })
    const eventPanel = page.locator('.event-queue-panel')
    const anomalyEvent = eventPanel.locator('.event-card').filter({ hasText: '装配间隙超差已分流到质量返工与排产复核' })
    await expect(anomalyEvent.locator('.event-type').getByText('异常分流', { exact: true })).toBeVisible()
    await anomalyEvent.getByRole('button', { name: '生成重排建议' }).click()
    await expect(eventPanel.locator('.agent-suggestion').getByText('质量异常后的排产复核')).toBeVisible()
    await expect(eventPanel.locator('.agent-suggestion').getByText(/OP-030 复验前/)).toBeVisible()

    await page.goto(offlineDemoPath('report'), { waitUntil: 'commit' })
    await page.waitForSelector('.report-board', { timeout: 60000 })
    const evidence = page.locator('.otd-evidence-chain .evidence-chain-card').filter({ hasText: '装配间隙超差已分流到质量返工与排产复核' })
    await expect(evidence.locator('.evidence-topline span').getByText('异常分流', { exact: true })).toBeVisible()
    await expect(evidence.getByText('TRACE-ANOMALY-DISPATCH-QUALITY-GAP-20260521')).toBeVisible()

    await page.goto(offlineDemoPath('audit-logs'), { waitUntil: 'commit' })
    await page.waitForSelector('.audit-board', { timeout: 30000 })
    const auditPanel = page.locator('.audit-replay-panel')
    await expect(auditPanel.locator('.metric-chip').filter({ hasText: '异常分流回放' }).getByText('1')).toBeVisible()
    const auditCard = auditPanel.locator('.decision-card').filter({ hasText: '异常分流：装配间隙超差已分流到质量返工与排产复核' })
    await expect(auditCard).toBeVisible()
    await expect(auditCard.locator('.decision-topline').getByText('异常分流证据')).toBeVisible()
    await auditCard.getByRole('button', { name: '回放决策链' }).click()
    await expect(auditPanel.locator('.replay-detail').getByText('TRACE-ANOMALY-DISPATCH-QUALITY-GAP-20260521', { exact: true })).toBeVisible()
    await expect(auditPanel.locator('.replay-detail').getByText(/异常管理读取 异常管理 \/ 质量工程师 周工/)).toBeVisible()
    await expect(auditPanel.locator('.replay-detail').getByText(/核对质量返工、设备维护、库存隔离或采购整改是否进入下游闭环/)).toBeVisible()
  })

  test('设备异常确认分流后进入设备维护、排产复核和 OTD 审计', async ({ page }) => {
    const panel = page.locator('.event-center')
    const equipmentLane = panel.locator('.event-lane').filter({ hasText: 'CNC-001 主轴温升异常' })
    await equipmentLane.getByRole('button', { name: '确认分流' }).click()
    await expect(panel.locator('.dispatch-trace').getByText('设备分流已确认')).toBeVisible()
    await expect(panel.locator('.dispatch-trace').getByText('TRACE-ANOMALY-DISPATCH-EQUIPMENT-CNC001-20260521')).toBeVisible()

    await page.goto(offlineDemoPath('equipment'), { waitUntil: 'commit' })
    await page.waitForSelector('.equipment-impact-panel', { timeout: 30000 })
    const maintenancePanel = page.locator('.dispatch-maintenance-panel')
    await expect(maintenancePanel.getByText('CNC-001 主轴温升异常已分流到设备维护与排产复核')).toBeVisible()
    await expect(maintenancePanel.getByText('WO-20260501 / WO-2026-0042')).toBeVisible()
    await maintenancePanel.getByRole('button', { name: '生成维护复核单' }).click()
    await expect(page.locator('.sync-note').getByText('异常分流维护单已同步')).toBeVisible()

    await page.goto(offlineDemoPath('scheduling'), { waitUntil: 'commit' })
    await page.waitForSelector('.event-queue-panel', { timeout: 45000 })
    const eventPanel = page.locator('.event-queue-panel')
    const equipmentEvent = eventPanel.locator('.event-card').filter({ hasText: 'CNC-001 主轴温升异常已分流到设备维护与排产复核' })
    await expect(equipmentEvent.locator('.event-type').getByText('异常分流', { exact: true })).toBeVisible()
    await expect(eventPanel.locator('.event-card').filter({ hasText: 'CNC-001 停机影响' }).getByText(/CNC-003 \/ CNC-002/)).toBeVisible()
    await equipmentEvent.getByRole('button', { name: '生成重排建议' }).click()
    await expect(eventPanel.locator('.agent-suggestion').getByText('设备异常后的排产复核')).toBeVisible()

    await page.goto(offlineDemoPath('report'), { waitUntil: 'commit' })
    await page.waitForSelector('.report-board', { timeout: 60000 })
    const evidence = page.locator('.otd-evidence-chain .evidence-chain-card').filter({ hasText: '维护复核单已生成' })
    await expect(evidence.locator('.evidence-topline span').getByText('设备维护', { exact: true })).toBeVisible()
    await expect(evidence.locator('code').getByText('TRACE-ANOMALY-DISPATCH-EQUIPMENT-CNC001-20260521', { exact: true })).toBeVisible()

    await page.goto(offlineDemoPath('audit-logs'), { waitUntil: 'commit' })
    await page.waitForSelector('.audit-board', { timeout: 30000 })
    const auditCard = page.locator('.audit-replay-panel .decision-card').filter({ hasText: '设备维护：CNC-001 主轴温升异常已分流到设备维护与排产复核维护复核单已生成' })
    await expect(auditCard).toBeVisible()
  })

  test('物料异常确认分流后进入库存隔离、采购整改、排产复核和 OTD 审计', async ({ page }) => {
    const panel = page.locator('.event-center')
    const materialLane = panel.locator('.event-lane').filter({ hasText: '原料批次来料异常' })
    await materialLane.getByRole('button', { name: '确认分流' }).click()
    await expect(panel.locator('.dispatch-trace').getByText('物料分流已确认')).toBeVisible()
    await expect(panel.locator('.dispatch-trace').getByText('TRACE-ANOMALY-DISPATCH-MATERIAL-BATCH-20260521')).toBeVisible()

    await page.goto(offlineDemoPath('inventory'), { waitUntil: 'commit' })
    await page.waitForSelector('.kitting-panel', { timeout: 30000 })
    const materialPanel = page.locator('.material-dispatch-panel')
    await expect(materialPanel.getByText('原料批次来料异常已分流到库存与采购协同')).toBeVisible()
    await materialPanel.getByRole('button', { name: '生成批次隔离与齐套复核' }).click()
    await expect(page.locator('.sync-note').getByText('批次隔离已同步 AI 排产')).toBeVisible()

    await page.goto(offlineDemoPath('purchase'), { waitUntil: 'commit' })
    await page.waitForSelector('.po-board', { timeout: 30000 })
    const supplierPanel = page.locator('.material-supplier-panel')
    await expect(supplierPanel.getByText('来料异常供应商整改与替代承诺')).toBeVisible()
    await expect(supplierPanel.getByText('TRACE-ANOMALY-DISPATCH-MATERIAL-BATCH-20260521')).toBeVisible()
    await supplierPanel.getByRole('button', { name: '锁定供应商整改承诺' }).click()
    await expect(page.locator('.supply-risk-trace').getByText('来料异常整改承诺已锁定')).toBeVisible()

    await page.goto(offlineDemoPath('scheduling'), { waitUntil: 'commit' })
    await page.waitForSelector('.event-queue-panel', { timeout: 45000 })
    const eventPanel = page.locator('.event-queue-panel')
    const materialEvent = eventPanel.locator('.event-card').filter({ hasText: '原料批次来料异常已分流到库存与采购协同' })
    await expect(materialEvent.locator('.event-type').getByText('异常分流', { exact: true })).toBeVisible()
    await expect(eventPanel.locator('.event-card').filter({ hasText: 'LH-202605 工单齐套缺口' })).toBeVisible()
    await expect(eventPanel.locator('.event-card').filter({ hasText: 'LH-202605 供应延期风险' })).toBeVisible()
    await materialEvent.getByRole('button', { name: '生成重排建议' }).click()
    await expect(eventPanel.locator('.agent-suggestion').getByText('物料异常后的排产复核')).toBeVisible()

    await page.goto(offlineDemoPath('report'), { waitUntil: 'commit' })
    await page.waitForSelector('.report-board', { timeout: 60000 })
    const kittingEvidence = page.locator('.otd-evidence-chain .evidence-chain-card').filter({ hasText: '批次隔离已进入齐套复核' })
    await expect(kittingEvidence.locator('.evidence-topline span').getByText('库存齐套', { exact: true })).toBeVisible()
    const purchaseEvidence = page.locator('.otd-evidence-chain .evidence-chain-card').filter({ hasText: '供应商整改承诺已锁定' })
    await expect(purchaseEvidence.locator('.evidence-topline span').getByText('采购整改', { exact: true })).toBeVisible()
    await expect(purchaseEvidence.locator('code').getByText('TRACE-ANOMALY-DISPATCH-MATERIAL-BATCH-20260521', { exact: true })).toBeVisible()

    await page.goto(offlineDemoPath('audit-logs'), { waitUntil: 'commit' })
    await page.waitForSelector('.audit-board', { timeout: 30000 })
    const auditPanel = page.locator('.audit-replay-panel')
    await expect(auditPanel.locator('.metric-chip').filter({ hasText: '采购整改回放' }).getByText('1')).toBeVisible()
    const auditCard = auditPanel.locator('.decision-card').filter({ hasText: '采购整改：原料批次来料异常已分流到库存与采购协同供应商整改承诺已锁定' })
    await expect(auditCard).toBeVisible()
    await expect(auditCard.locator('.decision-topline').getByText('采购整改证据')).toBeVisible()
    await auditCard.getByRole('button', { name: '回放决策链' }).click()
    await expect(auditPanel.locator('.replay-detail .detail-title span').getByText('TRACE-ANOMALY-DISPATCH-MATERIAL-BATCH-20260521', { exact: true })).toBeVisible()
    await expect(auditPanel.locator('.replay-detail').getByText(/来料异常、供应商 8D、备用批次、复检入库和库存齐套回写/)).toBeVisible()
    await expect(auditPanel.locator('.replay-detail').getByText(/隔离、复检、备用批次和排产复核是否闭环/)).toBeVisible()
  })
})
