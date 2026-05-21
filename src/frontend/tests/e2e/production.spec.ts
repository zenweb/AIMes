import { test, expect } from '@playwright/test'

test.describe.configure({ timeout: 90000 })

test.describe('Production 生产看板', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('aimes_token', 'mock-e2e-token')
      localStorage.setItem('aimes_user', JSON.stringify({ username: 'admin', displayName: '管理员', role: 'Admin' }))
      if (!location.pathname.includes('/anomaly') && !location.pathname.includes('/risk')) {
        localStorage.removeItem('aimes_production_anomaly_event')
      }
    })
    await page.goto('production')
    await page.waitForSelector('.production-board', { timeout: 20000 })
  })

  test('页面加载 — 产量摘要栏', async ({ page }) => {
    await expect(page.locator('.summary-bar')).toBeVisible()
    const items = page.locator('.summary-item')
    const count = await items.count()
    expect(count).toBe(6) // 总工单/生产中/已完成/待生产/完成数/准时率
  })

  test('产量摘要显示数值', async ({ page }) => {
    const values = page.locator('.summary-value')
    const count = await values.count()
    expect(count).toBe(6)
    // 每个值都应显示（可能为 0）
    for (let i = 0; i < count; i++) {
      const text = await values.nth(i).textContent()
      expect(text).not.toBeNull()
    }
  })

  test('工单列表渲染', async ({ page }) => {
    await expect(page.locator('.panel-header')).toBeVisible()
    await expect(page.getByText('工单列表')).toBeVisible()
  })

  test('状态筛选下拉框', async ({ page }) => {
    const filterSelect = page.locator('.filter-select')
    await expect(filterSelect).toBeVisible()

    // 验证筛选选项
    const options = await filterSelect.locator('option').allTextContents()
    expect(options).toContain('全部状态')
    expect(options).toContain('待生产')
    expect(options).toContain('生产中')
    expect(options).toContain('已完成')
  })

  test('状态筛选切换', async ({ page }) => {
    const filterSelect = page.locator('.filter-select')

    await filterSelect.selectOption('in_progress')
    await expect(filterSelect).toHaveValue('in_progress')

    await filterSelect.selectOption('completed')
    await expect(filterSelect).toHaveValue('completed')

    // 重置为全部
    await filterSelect.selectOption('')
    await expect(filterSelect).toHaveValue('')
  })

  test('扫码输入框', async ({ page }) => {
    const scanInput = page.locator('.scan-input')
    await expect(scanInput).toBeVisible()
    await expect(scanInput).toHaveAttribute('placeholder', /扫码/)

    // 空输入时查询按钮禁用
    await expect(page.locator('.scan-btn')).toBeDisabled()
  })

  test('扫码查询按钮', async ({ page }) => {
    const scanInput = page.locator('.scan-input')
    await scanInput.fill('WO-001')
    await expect(page.locator('.scan-btn')).toBeEnabled()
  })

  test('点击工单显示详情面板', async ({ page }) => {
    const woCards = page.locator('.wo-card')
    const cardCount = await woCards.count()

    if (cardCount > 0) {
      await woCards.first().click()
      // 右侧详情面板应出现
      await expect(page.locator('.detail-empty')).not.toBeVisible()
      await expect(page.locator('.detail-header')).toBeVisible()
      // 工单号应显示
      await expect(page.locator('.detail-title-row h3')).toBeVisible()
    } else {
      test.skip() // 无工单数据时跳过
    }
  })

  test('工单详情显示产品信息', async ({ page }) => {
    const woCards = page.locator('.wo-card')
    const cardCount = await woCards.count()

    if (cardCount > 0) {
      await woCards.first().click()
      await expect(page.locator('.detail-info-grid')).toBeVisible()
      const labels = await page.locator('.detail-info-grid .di label').allTextContents()
      expect(labels).toContain('产品')
      expect(labels).toContain('产品编码')
      expect(labels).toContain('计划数量')
      expect(labels).toContain('完成数量')
    } else {
      test.skip()
    }
  })

  test('工单详情显示工序列表', async ({ page }) => {
    const woCards = page.locator('.wo-card')
    const cardCount = await woCards.count()

    if (cardCount > 0) {
      await woCards.first().click()
      await expect(page.locator('.operations-section')).toBeVisible()
      await expect(page.getByText('工序')).toBeVisible()
    } else {
      test.skip()
    }
  })

  test('工序包含操作按钮', async ({ page }) => {
    const woCards = page.locator('.wo-card')
    const cardCount = await woCards.count()

    if (cardCount > 0) {
      await woCards.first().click()
      const opCards = page.locator('.op-card')
      const opCount = await opCards.count()

      if (opCount > 0) {
        // 已完成工序没有按钮，待生产/生产中工序应提供开工/完工/异常操作。
        const buttons = page.locator('.op-actions button')
        await expect(buttons.first()).toBeVisible()
        expect(await buttons.count()).toBeGreaterThanOrEqual(1)
      }
    } else {
      test.skip()
    }
  })

  test('工序卡片展示 SOP、质检点、设备要求和物料齐套约束', async ({ page }) => {
    const woCards = page.locator('.wo-card')
    const cardCount = await woCards.count()

    if (cardCount > 0) {
      await woCards.first().click()
      const opCard = page.locator('.op-card').filter({ hasText: 'OP-20' }).first()
      await expect(opCard.locator('.op-constraints').getByText('SOP: CNC 精加工 V2.3')).toBeVisible()
      await expect(opCard.locator('.op-constraints').getByText('质检: 首件尺寸')).toBeVisible()
      await expect(opCard.locator('.op-constraints').getByText('设备: CNC-002')).toBeVisible()
      await expect(opCard.locator('.op-constraints').getByText('物料: AL-6061 齐套')).toBeVisible()
    } else {
      test.skip()
    }
  })

  test('开工对话框', async ({ page }) => {
    const woCards = page.locator('.wo-card')
    const cardCount = await woCards.count()

    if (cardCount > 0) {
      await woCards.first().click()
      const startBtn = page.locator('.op-btn.start').first()
      await expect(startBtn).toBeVisible()

      await startBtn.click()
      await expect(page.locator('.dialog-overlay')).toBeVisible()
      await expect(page.getByText('开工确认')).toBeVisible()
      const qualificationPanel = page.locator('.start-qualification-panel')
      await expect(qualificationPanel).toBeVisible()
      await expect(qualificationPanel.getByText('开工前校验')).toBeVisible()
      await expect(qualificationPanel.getByText('校验通过')).toBeVisible()
      await expect(qualificationPanel.getByText('张三 · EMP-001')).toBeVisible()
      await expect(qualificationPanel.getByText('CNC 精加工', { exact: true })).toBeVisible()
      await expect(qualificationPanel.getByText('CNC-002 可用，CNC-001 故障不可派工')).toBeVisible()
      await expect(qualificationPanel.getByText('M-AL-6061 已齐套，批次 AL-202605')).toBeVisible()
      await expect(qualificationPanel.getByText('CNC 精加工 SOP V2.3')).toBeVisible()
      await expect(qualificationPanel.getByText('首件尺寸复检 + Ra 粗糙度抽检')).toBeVisible()
      await expect(qualificationPanel.getByText('物料齐套：通过')).toBeVisible()
      const stationInput = page.locator('.dialog-card input').first()
      await expect(stationInput).toBeVisible()

      // 开工弹窗会预填推荐工位，确认按钮应可用。
      await expect(page.locator('.dialog-confirm')).toBeEnabled()

      await stationInput.fill('ST-001')
      await expect(page.locator('.dialog-confirm')).toBeEnabled()

      await page.locator('.dialog-confirm').click()
      const tracePanel = page.locator('.execution-trace-panel')
      await expect(tracePanel.locator('.trace-tags').getByText('人员资质')).toBeVisible()
      await expect(tracePanel.locator('.trace-tags').getByText('SOP')).toBeVisible()
      await expect(tracePanel.locator('.trace-tags').getByText('物料齐套')).toBeVisible()
      await expect(tracePanel.getByText(/CNC 精加工 SOP V2.3/)).toBeVisible()
      await expect(page.locator('.dialog-overlay')).not.toBeVisible()
    } else {
      test.skip()
    }
  })

  test('热处理开工读取人员替班建议并写回 OTD 证据', async ({ page }) => {
    await page.goto('employee', { waitUntil: 'commit' })
    await page.waitForSelector('.emp-board', { timeout: 20000 })
    const skillPanel = page.locator('.skill-matrix-panel')
    await skillPanel.getByRole('button', { name: '生成替班建议' }).click()
    await expect(skillPanel.getByText('替班建议已同步生产开工与 OTD 复盘')).toBeVisible()

    await page.goto('production', { waitUntil: 'commit' })
    await page.waitForSelector('.production-board', { timeout: 20000 })
    const heatOrder = page.locator('.wo-card').filter({ hasText: 'WO-013' })
    await expect(heatOrder).toBeVisible()
    await heatOrder.click()

    const heatOperation = page.locator('.op-card').filter({ hasText: 'OP-10' }).filter({ hasText: '淬火' })
    await expect(heatOperation.getByText('人员: EMP-006 替班已确认')).toBeVisible()
    await heatOperation.getByRole('button', { name: '开工' }).click()

    const qualificationPanel = page.locator('.start-qualification-panel')
    await expect(qualificationPanel.getByText('替班已确认', { exact: true })).toBeVisible()
    await expect(qualificationPanel.getByText('孙八 · EMP-006')).toBeVisible()
    const reassignmentBox = qualificationPanel.locator('.qualification-reassignment')
    await expect(reassignmentBox.getByText('AUD-LABOR-REASSIGN-20260520-001', { exact: true })).toBeVisible()
    await expect(reassignmentBox.getByText(/TRACE-LABOR-REASSIGN-WO-013-OP-10/)).toBeVisible()
    await expect(reassignmentBox.getByText(/原人员：王五 · EMP-003/)).toBeVisible()
    await expect(reassignmentBox.getByText(/复核：赵六 · 工程放行/)).toBeVisible()

    await expect(page.locator('.dialog-confirm')).toBeEnabled()
    await page.locator('.dialog-confirm').click()

    const tracePanel = page.locator('.execution-trace-panel')
    await expect(tracePanel.locator('.trace-tags').getByText('人员替班')).toBeVisible()
    await expect(tracePanel.getByText(/AUD-LABOR-REASSIGN-20260520-001 已执行 孙八 替班复核/)).toBeVisible()

    await page.goto('report', { waitUntil: 'commit' })
    await page.waitForSelector('.report-board', { timeout: 60000 })
    const evidenceChain = page.locator('.otd-evidence-chain')
    const startEvidence = evidenceChain.locator('.evidence-chain-card').filter({ hasText: 'WO-013 淬火 替班后开工' })
    await expect(startEvidence.getByText('生产开工')).toBeVisible()
    await expect(startEvidence.getByText('替班已执行')).toBeVisible()
    await expect(startEvidence.getByText('TRACE-LABOR-REASSIGN-WO-013-OP-10-START')).toBeVisible()
  })

  test('热处理无有效替班候选时阻断确认开工', async ({ page }) => {
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
    await page.waitForSelector('.production-board', { timeout: 20000 })

    const heatOrder = page.locator('.wo-card').filter({ hasText: 'WO-013' })
    await expect(heatOrder).toBeVisible()
    await heatOrder.click()

    const heatOperation = page.locator('.op-card').filter({ hasText: 'OP-10' }).filter({ hasText: '淬火' })
    await expect(heatOperation.getByText('人员: EMP-003 停工复核')).toBeVisible()
    await heatOperation.getByRole('button', { name: '开工' }).click()

    const qualificationPanel = page.locator('.start-qualification-panel')
    await expect(qualificationPanel.getByText('停工复核', { exact: true })).toBeVisible()
    await expect(qualificationPanel.getByText('王五 · EMP-003', { exact: true })).toBeVisible()
    await expect(qualificationPanel.getByText('替班候选：无有效候选')).toBeVisible()
    const blockBox = qualificationPanel.locator('.qualification-reassignment.blocked')
    await expect(blockBox.getByText('AUD-LABOR-BLOCK-20260520-001', { exact: true })).toBeVisible()
    await expect(blockBox.getByText(/TRACE-LABOR-BLOCK-WO-013-OP-10/)).toBeVisible()
    await expect(blockBox.getByText(/未找到有效替班候选/)).toBeVisible()
    await expect(page.locator('.dialog-confirm')).toBeDisabled()
  })

  test('完工后生成排产与质量回写记录', async ({ page }) => {
    const woCards = page.locator('.wo-card')
    const cardCount = await woCards.count()

    if (cardCount > 0) {
      await woCards.first().click()
      const completeBtn = page.locator('.op-btn.complete').first()
      await expect(completeBtn).toBeVisible()

      await completeBtn.click()
      await expect(page.getByText('完工报告')).toBeVisible()
      await expect(page.locator('.dialog-confirm')).toBeEnabled()
      await page.locator('.dialog-confirm').click()

      const tracePanel = page.locator('.execution-trace-panel')
      await expect(tracePanel.locator('.trace-type').getByText('排产回写', { exact: true })).toBeVisible()
      await expect(tracePanel.getByText(/完工进度已回写/)).toBeVisible()
      await expect(tracePanel.getByText(/工单进度更新为/)).toBeVisible()
      await expect(tracePanel.locator('.trace-type').getByText('生产复核', { exact: true })).toBeVisible()
      await expect(tracePanel.getByText(/完工复核已提交/)).toBeVisible()
      await expect(tracePanel.locator('.trace-type').getByText('质量联动', { exact: true })).toBeVisible()
      await expect(tracePanel.getByText(/质检放行/)).toBeVisible()

      await page.goto('scheduling', { waitUntil: 'commit' })
      await page.waitForSelector('.agent-workbench-panel', { timeout: 45000 })
      const eventPanel = page.locator('.event-queue-panel')
      const productionEvent = eventPanel.locator('.event-card').filter({ hasText: 'WO-001 CNC 精加工 完工复核' }).first()
      await expect(productionEvent.getByText('生产完工事件')).toBeVisible()
      await expect(productionEvent.getByText(/已复核|待复核/)).toBeVisible()
      await expect(productionEvent.getByRole('button')).toHaveText(/生成重排建议|复核排产影响/)
      await productionEvent.getByRole('button').click()
      await expect(eventPanel.getByText('生产完工复核建议')).toBeVisible()
      await expect(eventPanel.getByText(/复核后续工序窗口、质量门和 OTD 证据链/)).toBeVisible()

      await page.goto('report', { waitUntil: 'commit' })
      await page.waitForSelector('.report-board', { timeout: 60000 })
      const completionEvidence = page.locator('.otd-evidence-chain .evidence-chain-card').filter({ hasText: '完工回写' })
      await expect(completionEvidence.getByText('生产完工')).toBeVisible()
      await expect(completionEvidence.getByText(/TRACE-PROD-COMPLETE/)).toBeVisible()

      await page.goto('audit-logs', { waitUntil: 'commit' })
      await page.waitForSelector('.audit-board', { timeout: 60000 })
      const auditPanel = page.locator('.audit-replay-panel')
      await expect(auditPanel.locator('.metric-chip').filter({ hasText: '生产完工回放' }).getByText('1')).toBeVisible()
      await expect(auditPanel.locator('.metric-chip').filter({ hasText: '生产复核回放' }).getByText('1')).toBeVisible()
      const closeoutCard = auditPanel.locator('.decision-card').filter({ hasText: '生产复核：WO-001 CNC 精加工 完工复核' })
      await expect(closeoutCard).toBeVisible()
      await expect(closeoutCard.locator('.decision-topline').getByText('生产复核证据')).toBeVisible()
      await expect(closeoutCard.locator('.decision-meta').getByText('证据：TRACE-PROD-CLOSEOUT-OP-20')).toBeVisible()
      await closeoutCard.getByRole('button', { name: '回放决策链' }).click()
      const detail = auditPanel.locator('.replay-detail')
      await expect(detail.getByText(/生产报工读取 生产报工 \/ admin 的完工回写、排产页复核、质量门和承诺交期/)).toBeVisible()
      await expect(detail.getByText(/当前状态为 (完工复核已提交|OTD 风险待复核)/)).toBeVisible()
      await expect(detail.locator('ol li').filter({ hasText: /完工回写、排产页复核、质量门放行和承诺交期是否仍成立/ }).first()).toBeVisible()
    } else {
      test.skip()
    }
  })

  test('异常上报后生成风险联动记录', async ({ page }) => {
    const woCards = page.locator('.wo-card')
    const cardCount = await woCards.count()

    if (cardCount > 0) {
      await woCards.first().click()
      const exceptionBtn = page.locator('.op-btn.exception').first()
      await expect(exceptionBtn).toBeVisible()

      await exceptionBtn.click()
      await expect(page.getByRole('heading', { name: '异常上报' })).toBeVisible()
      await page.locator('.dialog-card textarea').fill('主轴温升异常，需暂停复核')
      await page.locator('.dialog-confirm').click()

      const tracePanel = page.locator('.execution-trace-panel')
      await expect(tracePanel.locator('.trace-type').getByText('风险联动', { exact: true })).toBeVisible()
      await expect(tracePanel.getByText(/异常已进入处置队列/)).toBeVisible()
      await expect(tracePanel.getByText(/已生成异常管理事件/)).toBeVisible()
      await expect(tracePanel.getByText(/主轴温升异常/)).toBeVisible()
      await expect(tracePanel.locator('.trace-tags').getByText('排产风险')).toBeVisible()
    } else {
      test.skip()
    }
  })

  test('异常上报后能在异常管理看到并打开 AI 处置建议', async ({ page }) => {
    const woCards = page.locator('.wo-card')
    const cardCount = await woCards.count()

    if (cardCount > 0) {
      await woCards.first().click()
      const exceptionBtn = page.locator('.op-btn.exception').first()
      await expect(exceptionBtn).toBeVisible()

      await exceptionBtn.click()
      await page.locator('.dialog-card textarea').fill('夹具定位偏移，首件尺寸超差')
      await page.locator('.dialog-confirm').click()
      await page.waitForFunction(() =>
        localStorage.getItem('aimes_production_anomaly_event')?.includes('夹具定位偏移，首件尺寸超差')
      )

      await page.goto('anomaly')
      await page.waitForSelector('.anomaly-board', { timeout: 20000 })
      const anomalyCard = page.locator('.anomaly-card').filter({ hasText: '现场异常' }).first()
      await expect(anomalyCard).toBeVisible()
      await anomalyCard.click()
      await expect(page.locator('.slide-panel')).toBeVisible()
      await expect(page.getByText('夹具定位偏移，首件尺寸超差')).toBeVisible()
      await expect(page.getByText('冻结当前工序，通知班组长复核 SOP、设备状态和物料批次')).toBeVisible()
      await expect(page.getByText('同步 AI 排产风险队列评估延期')).toBeVisible()
    } else {
      test.skip()
    }
  })

  test('异常上报后能在风险预警处置队列看到', async ({ page }) => {
    const woCards = page.locator('.wo-card')
    const cardCount = await woCards.count()

    if (cardCount > 0) {
      await woCards.first().click()
      const exceptionBtn = page.locator('.op-btn.exception').first()
      await expect(exceptionBtn).toBeVisible()

      await exceptionBtn.click()
      await page.locator('.dialog-card textarea').fill('刀具磨损导致表面粗糙度超差')
      await page.locator('.dialog-confirm').click()

      await page.goto('risk')
      await page.waitForSelector('.risk-action-panel', { timeout: 20000 })
      const panel = page.locator('.risk-action-panel')
      const riskCard = panel.locator('.action-card').filter({ hasText: '现场异常' }).first()
      await expect(riskCard).toBeVisible({ timeout: 10000 })
      await expect(riskCard.getByText('生产异常')).toBeVisible()
      await expect(riskCard.getByText(/刀具磨损导致表面粗糙度超差/)).toBeVisible()
      await expect(riskCard.getByText('负责人：班组长 孙八')).toBeVisible()
      await expect(riskCard.getByText('截止：立即')).toBeVisible()
      await expect(panel.locator('.queue-trace').getByText(/已由生产报工异常上报自动进入风险处置队列/)).toBeVisible()
    } else {
      test.skip()
    }
  })

  test('空状态下显示暂无工单', async ({ page }) => {
    // 拦截工单列表 API 返回空
    await page.route('**/api/v1/scheduling/workorders*', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ items: [], totalCount: 0, page: 1, pageSize: 20, totalPages: 1 }),
      })
    })
    await page.reload()
    await page.waitForSelector('.production-board', { timeout: 10000 })

    await expect(page.getByText('暂无工单')).toBeVisible()
  })

  test('进度条显示', async ({ page }) => {
    await expect(page.locator('.wo-progress-bar').first()).toBeVisible({ timeout: 5000 })
    await expect(page.locator('.wo-progress-fill').first()).toBeVisible()
  })
})
