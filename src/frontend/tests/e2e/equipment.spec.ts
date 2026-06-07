import { test, expect } from '@playwright/test'

test.describe.configure({ timeout: 90000 })

test.describe('Equipment 设备管理', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('aimes_token', 'mock-e2e-token')
      localStorage.setItem('aimes_user', JSON.stringify({ username: 'admin', displayName: '管理员', role: 'Admin', mustChangePassword: false }))
    })
    await page.goto('equipment')
    await page.waitForSelector('.equipment-board', { timeout: 20000 })
  })

  test('页面加载 — KPI 行', async ({ page }) => {
    await expect(page.locator('.kpi-row')).toBeVisible()
    const cards = page.locator('.kpi-card')
    const count = await cards.count()
    expect(count).toBe(4)
  })

  test('KPI 指标标签', async ({ page }) => {
    const labels = await page.locator('.kpi-card .kpi-label').allTextContents()
    expect(labels).toContain('运行中')
    expect(labels).toContain('设备利用率')
    expect(labels).toContain('设备可动率')
    expect(labels).toContain('待修/故障')
  })

  test('设备列表区域', async ({ page }) => {
    await expect(page.getByRole('heading', { name: '设备列表' })).toBeVisible()
    await expect(page.locator('.eq-grid')).toBeVisible()
  })

  test('展示设备不可用对排产的影响分析', async ({ page }) => {
    const panel = page.locator('.equipment-impact-panel')
    await expect(panel).toBeVisible()
    await expect(panel.getByText('CNC-001 不可用影响分析')).toBeVisible()
    await expect(panel.getByText('预计停机 4h')).toBeVisible()
    await expect(panel.getByText('WO-2026-0042 / WO-RUSH-9001 / WO-DEMO-1001')).toBeVisible()
    await expect(panel.getByText('CNC-002 / CNC-003')).toBeVisible()
    await expect(panel.getByText('今日夜班 22:00-02:00')).toBeVisible()
    await expect(panel.getByText(/减少换线/)).toBeVisible()
    await expect(panel.getByText(/优先关键订单/)).toBeVisible()
    await expect(panel.getByText(/推荐预防维护窗口/)).toBeVisible()
  })

  test('标记设备故障后回写 AI 排产事件队列', async ({ page }) => {
    const panel = page.locator('.equipment-impact-panel')
    await panel.getByRole('button', { name: '标记故障并同步排产' }).click()
    await expect(panel.getByText('设备故障已同步 AI 排产')).toBeVisible()
    await expect(panel.getByText(/CNC-001 预计停机 4h/)).toBeVisible()

    await page.goto('scheduling')
    await page.waitForSelector('.schedule-board', { timeout: 20000 })
    const eventPanel = page.locator('.event-queue-panel')
    await expect(eventPanel.getByText('CNC-001 停机影响')).toBeVisible({ timeout: 10000 })
    const eventCard = eventPanel.locator('.event-card').filter({ hasText: 'CNC-001 停机影响' })
    await expect(eventCard.getByText(/CNC-002 \/ CNC-003/)).toBeVisible()
    await expect(eventCard.getByText(/WO-RUSH-9001/)).toBeVisible()
    await eventCard.getByRole('button', { name: '生成重排建议' }).click()
    await expect(eventPanel.getByText('设备维护窗口重排建议')).toBeVisible()
    await expect(eventPanel.getByText(/换设备到 CNC-002/)).toBeVisible()
    await expect(eventPanel.getByText(/低优先级工单延后/)).toBeVisible()
    await expect(eventPanel.getByText(/夜班加班/)).toBeVisible()
    await expect(eventPanel.getByText(/拆单分流到 CNC-003/)).toBeVisible()

    await page.goto('report', { waitUntil: 'commit' })
    await page.waitForSelector('.report-board', { timeout: 60000 })
    const equipmentEvidence = page.locator('.otd-evidence-chain .evidence-chain-card').filter({ hasText: 'CNC-001 停机窗口已同步重排' })
    await expect(equipmentEvidence.locator('.evidence-topline span').getByText('设备维护', { exact: true })).toBeVisible()
    await expect(equipmentEvidence.getByText('TRACE-EQ-DOWNTIME-CNC-001')).toBeVisible()

    await page.goto('audit-logs', { waitUntil: 'commit' })
    await page.waitForSelector('.audit-board', { timeout: 60000 })
    const auditPanel = page.locator('.audit-replay-panel')
    await expect(auditPanel.locator('.metric-chip').filter({ hasText: '设备停机回放' }).getByText('1')).toBeVisible()
    const auditCard = auditPanel.locator('.decision-card').filter({ hasText: '设备维护：CNC-001 停机窗口已同步重排' })
    await expect(auditCard).toBeVisible()
    await expect(auditCard.locator('.decision-topline').getByText('设备停机证据')).toBeVisible()
    await expect(auditCard.locator('.decision-meta').getByText('证据：TRACE-EQ-DOWNTIME-CNC-001')).toBeVisible()
    await auditCard.getByRole('button', { name: '回放决策链' }).click()
    const detail = auditPanel.locator('.replay-detail')
    await expect(detail.getByText(/设备维护读取 设备维护 \/ 瓶颈保护 的停机诊断、可替代设备、维护窗口和瓶颈保护策略/)).toBeVisible()
    await expect(detail.getByText(/当前状态为 待维护/)).toBeVisible()
    await expect(detail.getByText(/换设备、延后、加班和拆单建议是否被调度员复核/)).toBeVisible()
  })

  test('设备故障 OTD 证据写入失败时真实浏览器保留 fail-loud 告警', async ({ page }) => {
    await page.evaluate(() => {
      const originalSetItem = Storage.prototype.setItem
      Storage.prototype.setItem = function setItemWithEquipmentOtdEvidenceFailure(key: string, value: string) {
        if (key === 'aimes_otd_evidence_chain') {
          throw new Error('chromium equipment OTD evidence storage unavailable')
        }
        return originalSetItem.call(this, key, value)
      }
    })

    const panel = page.locator('.equipment-impact-panel')
    await panel.getByRole('button', { name: '标记故障并同步排产' }).click()

    const alert = panel.locator('.sync-note[role="alert"]')
    await expect(alert).toBeVisible()
    await expect(alert).toContainText('设备故障同步失败')
    await expect(alert).toContainText('排产/OTD 证据未完整归档')
    await expect(alert).toContainText('chromium equipment OTD evidence storage unavailable')
    await expect(panel.getByText('设备故障已同步 AI 排产')).not.toBeVisible()

    const evidenceSnapshot = await page.evaluate(() => JSON.parse(localStorage.getItem('aimes_otd_evidence_chain') || '[]'))
    expect(evidenceSnapshot).not.toEqual(expect.arrayContaining([
      expect.objectContaining({
        id: 'equipment-downtime-CNC-001',
        traceId: 'TRACE-EQ-DOWNTIME-CNC-001',
      }),
    ]))
  })

  test('生成客户真实设备故障样例并回写排产事件', async ({ page }) => {
    const panel = page.locator('.equipment-impact-panel')
    const customerPanel = panel.locator('.customer-fault-panel')
    await expect(customerPanel.getByRole('heading', { name: '客户真实设备故障数据' })).toBeVisible()
    await expect(customerPanel.getByText('待生成故障样例批次')).toBeVisible()

    await customerPanel.getByRole('button', { name: '生成客户设备故障样例' }).click()

    await expect(customerPanel.getByText('IMP-POC-EQ-FAULT-20260520-001')).toBeVisible()
    await expect(customerPanel.locator('.fault-metrics strong').getByText('12 条')).toBeVisible()
    await expect(customerPanel.getByText('4h 停机样例已映射')).toBeVisible()
    await expect(panel.getByText('客户设备故障样例已接入')).toBeVisible()

    await page.goto('scheduling')
    await page.waitForSelector('.schedule-board', { timeout: 20000 })
    const eventCard = page.locator('.event-queue-panel .event-card').filter({ hasText: 'CNC-001 停机影响' })
    await expect(eventCard).toBeVisible()
    await expect(eventCard.getByText(/客户真实故障样例|CNC-002 \/ CNC-003/)).toBeVisible()

    await page.goto('report', { waitUntil: 'commit' })
    await page.waitForSelector('.report-board', { timeout: 60000 })
    const customerFaultEvidence = page.locator('.otd-evidence-chain .evidence-chain-card').filter({ hasText: '客户真实设备故障样例已映射' })
    await expect(customerFaultEvidence.getByText('设备实证')).toBeVisible()
    await expect(customerFaultEvidence.getByText('IMP-POC-EQ-FAULT-20260520-001')).toBeVisible()
  })

  test('客户设备故障样例 OTD 证据写入失败时真实浏览器保留 fail-loud 告警', async ({ page }) => {
    await page.evaluate(() => {
      const originalSetItem = Storage.prototype.setItem
      let otdWriteCount = 0
      Storage.prototype.setItem = function setItemWithCustomerFaultOtdEvidenceFailure(key: string, value: string) {
        if (key === 'aimes_otd_evidence_chain') {
          otdWriteCount += 1
          if (otdWriteCount === 2) {
            throw new Error('chromium customer equipment fault OTD evidence storage unavailable')
          }
        }
        return originalSetItem.call(this, key, value)
      }
    })

    const panel = page.locator('.equipment-impact-panel')
    const customerPanel = panel.locator('.customer-fault-panel')
    await customerPanel.getByRole('button', { name: '生成客户设备故障样例' }).click()

    const alert = panel.locator('.sync-note[role="alert"]')
    await expect(alert).toBeVisible()
    await expect(alert).toContainText('客户设备故障样例同步失败')
    await expect(alert).toContainText('POC/OTD 证据未完整归档')
    await expect(alert).toContainText('chromium customer equipment fault OTD evidence storage unavailable')
    await expect(panel.getByText('客户设备故障样例已接入')).not.toBeVisible()

    const evidenceSnapshot = await page.evaluate(() => JSON.parse(localStorage.getItem('aimes_otd_evidence_chain') || '[]'))
    expect(evidenceSnapshot).not.toEqual(expect.arrayContaining([
      expect.objectContaining({
        id: 'customer-equipment-fault-IMP-POC-EQ-FAULT-20260520-001',
        traceId: 'IMP-POC-EQ-FAULT-20260520-001',
      }),
    ]))
  })

  test('异常分流维护复核单 OTD 证据写入失败时真实浏览器保留 fail-loud 告警', async ({ page }) => {
    await page.goto('anomaly')
    await page.waitForSelector('.event-center', { timeout: 30000 })
    const anomalyPanel = page.locator('.event-center')
    const equipmentLane = anomalyPanel.locator('.event-lane').filter({ hasText: 'CNC-001 主轴温升异常' })
    await equipmentLane.getByRole('button', { name: '确认分流' }).click()
    await expect(anomalyPanel.locator('.dispatch-trace').getByText('设备分流已确认')).toBeVisible()

    await page.goto('equipment', { waitUntil: 'commit' })
    await page.waitForSelector('.equipment-impact-panel', { timeout: 30000 })
    await page.evaluate(() => {
      const originalSetItem = Storage.prototype.setItem
      Storage.prototype.setItem = function setItemWithDispatchMaintenanceOtdEvidenceFailure(key: string, value: string) {
        if (key === 'aimes_otd_evidence_chain' && value.includes('equipment-maintenance-equipment-cnc001')) {
          throw new Error('chromium dispatch maintenance OTD evidence storage unavailable')
        }
        return originalSetItem.call(this, key, value)
      }
    })

    const panel = page.locator('.equipment-impact-panel')
    const maintenancePanel = panel.locator('.dispatch-maintenance-panel')
    await expect(maintenancePanel.getByText('CNC-001 主轴温升异常已分流到设备维护与排产复核')).toBeVisible()
    await maintenancePanel.getByRole('button', { name: '生成维护复核单' }).click()

    const alert = panel.locator('.sync-note[role="alert"]')
    await expect(alert).toBeVisible()
    await expect(alert).toContainText('异常分流维护单同步失败')
    await expect(alert).toContainText('维护/OTD 证据未完整归档')
    await expect(alert).toContainText('chromium dispatch maintenance OTD evidence storage unavailable')
    await expect(panel.getByText('异常分流维护单已同步')).not.toBeVisible()

    const evidenceSnapshot = await page.evaluate(() => JSON.parse(localStorage.getItem('aimes_otd_evidence_chain') || '[]'))
    expect(evidenceSnapshot).not.toEqual(expect.arrayContaining([
      expect.objectContaining({
        id: 'equipment-maintenance-equipment-cnc001',
        traceId: 'TRACE-ANOMALY-DISPATCH-EQUIPMENT-CNC001-20260521',
      }),
    ]))
  })

  test('设备卡片渲染', async ({ page }) => {
    const eqCards = page.locator('.eq-card')
    await expect(eqCards.first()).toBeVisible()
    const count = await eqCards.count()
    expect(count).toBeGreaterThan(0)
  })

  test('设备卡片显示名称和状态', async ({ page }) => {
    const firstCard = page.locator('.eq-card').first()
    await expect(firstCard.locator('.eq-name')).toBeVisible()
    await expect(firstCard.locator('.eq-status-dot')).toBeVisible()
    await expect(firstCard.locator('.eq-code')).toBeVisible()
    await expect(firstCard.locator('.eq-type-tag')).toBeVisible()
    await expect(firstCard.locator('.eq-bar')).toBeVisible()
  })

  test('利用率颜色标记', async ({ page }) => {
    const badges = page.locator('.eq-badge')
    await expect(badges.first()).toBeVisible()
    const count = await badges.count()
    expect(count).toBeGreaterThan(0)
    // 利用率 badge 有颜色分类 (high/mid/low)
    for (let i = 0; i < Math.min(count, 5); i++) {
      const classNames = await badges.nth(i).getAttribute('class')
      expect(classNames).toMatch(/(high|mid|low)/)
    }
  })

  test('类型筛选下拉框', async ({ page }) => {
    const filterSelects = page.locator('.filter-select')
    await expect(filterSelects.first()).toBeVisible()
    const options = await filterSelects.first().locator('option').allTextContents()
    expect(options).toContain('全部类型')
  })

  test('状态筛选下拉框', async ({ page }) => {
    const filterSelects = page.locator('.filter-select')
    const statusSelect = filterSelects.nth(1)
    await expect(statusSelect).toBeVisible()

    const options = await statusSelect.locator('option').allTextContents()
    expect(options).toContain('全部状态')
    expect(options).toContain('运行中')
    expect(options).toContain('空闲')
    expect(options).toContain('维护中')
    expect(options).toContain('故障')
    expect(options).toContain('离线')
  })

  test('状态筛选切换', async ({ page }) => {
    const filterSelects = page.locator('.filter-select')
    const statusSelect = filterSelects.nth(1)

    await statusSelect.selectOption('running')
    await expect(statusSelect).toHaveValue('running')

    await statusSelect.selectOption('idle')
    await expect(statusSelect).toHaveValue('idle')

    // 重置
    await statusSelect.selectOption('')
    await expect(statusSelect).toHaveValue('')
  })

  test('点击设备打开详情面板', async ({ page }) => {
    const eqCards = page.locator('.eq-card')

    await expect(eqCards.first()).toBeVisible()
    await eqCards.first().click()
    await expect(page.locator('.detail-panel')).toBeVisible()
    await expect(page.locator('.detail-header h4')).toBeVisible()
  })

  test('详情面板 — 概览 Tab', async ({ page }) => {
    const eqCards = page.locator('.eq-card')

    await expect(eqCards.first()).toBeVisible()
    await eqCards.first().click()
    await page.waitForSelector('.detail-panel', { timeout: 5000 })

    // 概览 tab 默认激活
    const overviewTab = page.locator('.detail-tabs button.active')
    await expect(overviewTab).toHaveText('概览')
    await expect(page.locator('.info-grid')).toBeVisible()
  })

  test('详情面板 — Tab 切换', async ({ page }) => {
    const eqCards = page.locator('.eq-card')

    await expect(eqCards.first()).toBeVisible()
    await eqCards.first().click()
    await page.waitForSelector('.detail-panel', { timeout: 5000 })

    const tabs = page.locator('.detail-tabs button')
    const tabCount = await tabs.count()
    expect(tabCount).toBe(4) // 概览/健康监控/维护记录/故障诊断

    // 切换到每个 tab
    const tabLabels = ['健康监控', '维护记录', '故障诊断']
    for (const label of tabLabels) {
      await page.locator('.detail-tabs button', { hasText: label }).click()
      await expect(page.locator('.detail-tabs button.active')).toHaveText(label)
    }
  })

  test('详情面板 — 故障诊断输入', async ({ page }) => {
    const eqCards = page.locator('.eq-card')

    await expect(eqCards.first()).toBeVisible()
    await eqCards.first().click()
    await page.waitForSelector('.detail-panel', { timeout: 5000 })

    // 切换到故障诊断 tab
    await page.locator('.detail-tabs button', { hasText: '故障诊断' }).click()

    const diagInput = page.locator('.diag-input')
    await expect(diagInput).toBeVisible()
    await expect(diagInput).toHaveAttribute('placeholder', /故障代码/)

    const diagBtn = page.locator('.diag-btn')
    await expect(diagBtn).toBeVisible()
    await expect(diagBtn).toHaveText('开始诊断')
  })

  test('关闭详情面板', async ({ page }) => {
    const eqCards = page.locator('.eq-card')

    await expect(eqCards.first()).toBeVisible()
    await eqCards.first().click()
    await page.waitForSelector('.detail-panel', { timeout: 5000 })

    await page.locator('.detail-panel .close-btn').click()
    await expect(page.locator('.detail-panel')).not.toBeVisible()
  })

  test('空筛选结果显示空状态', async ({ page }) => {
    // 拦截设备列表 API 返回空
    await page.evaluate(() => localStorage.setItem('aimes_offline_demo', 'false'))
    await page.route('**/api/v1/equipment*', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ items: [], totalCount: 0, page: 1, pageSize: 20, totalPages: 1 }),
      })
    })
    await page.reload()
    await page.waitForSelector('.equipment-board', { timeout: 10000 })

    await expect(page.getByText('无匹配设备')).toBeVisible()
  })

  test('设备利用率进度条', async ({ page }) => {
    const bars = page.locator('.eq-bar')
    await expect(bars.first()).toBeVisible()
    const count = await bars.count()
    expect(count).toBeGreaterThan(0)

    // 验证每个设备有利用率进度条
    for (let i = 0; i < Math.min(count, 3); i++) {
      const width = await bars.nth(i).getAttribute('style')
      expect(width).toMatch(/width:\s*\d+%/)
    }
  })
})
