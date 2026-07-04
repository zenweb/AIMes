import { test, expect } from '@playwright/test'

test('离线演示扫码入口不会触达扫码证据后端接口', async ({ page }) => {
  let scanEvidenceBackendRequests = 0
  await page.route('**/api/v1/scheduling/barcode-scan-evidence**', async route => {
    scanEvidenceBackendRequests += 1
    await route.fulfill({
      status: 599,
      contentType: 'application/json',
      body: JSON.stringify({ message: 'offline demo scanner backend leak' }),
    })
  })

  await page.addInitScript(() => {
    localStorage.setItem('aimes_offline_demo', 'true')
    localStorage.setItem('aimes_token', 'demo-token-admin')
    localStorage.setItem('aimes_refresh_token', 'demo-refresh-admin')
    localStorage.setItem('aimes_user', JSON.stringify({ username: 'admin', displayName: '管理员', role: 'Admin', mustChangePassword: false }))
  })

  await page.goto('scanner?offlineDemo=1', { waitUntil: 'domcontentloaded' })
  await expect(page.locator('.scanner-board')).toBeVisible({ timeout: 30000 })
  await expect(page.locator('[role="alert"]')).toHaveCount(0)
  await expect(page.locator('body')).not.toContainText('offline demo scanner backend leak')
  expect(scanEvidenceBackendRequests).toBe(0)
})

test.describe('Scanner 条码现场入口', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('aimes_offline_demo', 'true')
      localStorage.setItem('aimes_token', 'demo-token-admin')
      localStorage.setItem('aimes_refresh_token', 'demo-refresh-admin')
      localStorage.setItem('aimes_user', JSON.stringify({ username: 'admin', displayName: '管理员', role: 'Admin', mustChangePassword: false }))
    })
    await page.goto('scanner?offlineDemo=1')
    await page.waitForSelector('.scanner-board', { timeout: 20000 })
  })

  test('扫工单进入生产报工', async ({ page }) => {
    await page.locator('.code-input').fill('WO-RUSH-9001')
    await page.getByRole('button', { name: '查询' }).click()

    const result = page.locator('.scan-result')
    await expect(result.locator('.result-type')).toHaveText('工单')
    await expect(result.getByText('WO-RUSH-9001')).toBeVisible()
    await expect(result.locator('.result-name')).toHaveText('急单阀体组件')
    await expect(result.getByRole('button', { name: '进入生产报工' })).toBeVisible()

    await result.getByRole('button', { name: '进入生产报工' }).click()
    await expect(page).toHaveURL(/\/scheduling\/production/)
    await expect(page.locator('.production-board')).toBeVisible()
  })

  test('扫设备进入设备详情入口', async ({ page }) => {
    await page.locator('.code-input').fill('CNC-01')
    await page.getByRole('button', { name: '查询' }).click()

    const result = page.locator('.scan-result')
    await expect(result.locator('.result-type')).toHaveText('设备')
    await expect(result.locator('.result-name')).toHaveText('CNC 加工中心 01')
    await expect(result.getByText('运行中 / 瓶颈设备')).toBeVisible()

    await result.getByRole('button', { name: '查看设备详情' }).click()
    await expect(page).toHaveURL(/\/scheduling\/equipment/)
    await expect(page.locator('.equipment-board')).toBeVisible()
  })

  test('扫物料进入库存和 BOM', async ({ page }) => {
    await page.locator('.code-input').fill('M-AL-6061')
    await page.getByRole('button', { name: '查询' }).click()

    const result = page.locator('.scan-result')
    await expect(result.locator('.result-type')).toHaveText('物料')
    await expect(result.locator('.result-name')).toHaveText('铝合金 6061')
    await expect(result.getByText('缺料预警 / 待采购收货')).toBeVisible()

    await result.getByRole('button', { name: '查看库存齐套' }).click()
    await expect(page).toHaveURL(/\/scheduling\/inventory/)
    await expect(page.locator('.inventory-board, .page-title')).toBeVisible()

    await page.goto('scanner?offlineDemo=1')
    await page.locator('.code-input').fill('M-AL-6061')
    await page.getByRole('button', { name: '查询' }).click()
    await page.locator('.scan-result').getByRole('button', { name: '查看 BOM 用量' }).click()
    await expect(page).toHaveURL(/\/scheduling\/bom/)
    await expect(page.locator('.bom-board')).toBeVisible()
  })

  test('扫码确认现场执行证据进入报表与审计回放', async ({ page }) => {
    await page.locator('.code-input').fill('WO-RUSH-9001')
    await page.getByRole('button', { name: '查询' }).click()

    const result = page.locator('.scan-result')
    await expect(result.getByText('确认工单到站并进入报工入口')).toBeVisible()
    await result.getByRole('button', { name: '确认并写入证据链' }).click()
    await expect(result.getByText('TRACE-QR-WO-RUSH-9001-ARRIVAL')).toBeVisible()
    await expect(result.getByText(/生产报工开工校验/)).toBeVisible()

    const hasOtdEvidence = await page.evaluate(() => {
      const records = JSON.parse(localStorage.getItem('aimes_otd_evidence_chain') || '[]') as Array<{ traceId?: string; stage?: string }>
      return records.some(record => record.traceId === 'TRACE-QR-WO-RUSH-9001-ARRIVAL' && record.stage === '扫码执行')
    })
    expect(hasOtdEvidence).toBeTruthy()

    await page.goto('report?offlineDemo=1')
    const reportEvidence = page.locator('.otd-evidence-chain')
    await expect(reportEvidence.getByText('扫码执行')).toBeVisible()
    await expect(reportEvidence.getByText('WO-RUSH-9001 工单扫码到站已确认')).toBeVisible()
    await expect(reportEvidence.getByText('TRACE-QR-WO-RUSH-9001-ARRIVAL')).toBeVisible()

    await page.goto('audit-logs?offlineDemo=1')
    const auditPanel = page.locator('.audit-replay-panel')
    await expect(auditPanel.locator('.metric-chip').filter({ hasText: '扫码执行回放' }).getByText('1')).toBeVisible()
    const auditCard = auditPanel.locator('.decision-card').filter({ hasText: '扫码执行：WO-RUSH-9001 工单扫码到站已确认' })
    await expect(auditCard).toBeVisible()
    await expect(auditCard.locator('.decision-topline').getByText('扫码执行证据')).toBeVisible()
    await auditCard.getByRole('button', { name: '回放决策链' }).click()
    const detail = auditPanel.locator('.replay-detail')
    await expect(detail.getByText('TRACE-QR-WO-RUSH-9001-ARRIVAL', { exact: true })).toBeVisible()
    await expect(detail.getByText(/条码扫描读取 条码扫描 \/ 现场工位 \/ 管理员/)).toBeVisible()
    await expect(detail.getByText(/同步给报表、审计回放和生产报工入口/)).toBeVisible()
    await expect(detail.getByText(/核对扫码到站、报工入口、开工校验和后续工序是否连续/)).toBeVisible()
  })

  test('扫码证据写入失败时真实浏览器展示 fail-loud 且不伪造证据链', async ({ page }) => {
    await page.locator('.code-input').fill('WO-RUSH-9001')
    await page.getByRole('button', { name: '查询' }).click()

    const result = page.locator('.scan-result')
    await expect(result.getByText('确认工单到站并进入报工入口')).toBeVisible()

    await page.evaluate(() => {
      const originalSetItem = Storage.prototype.setItem
      Storage.prototype.setItem = function setItemWithBarcodeScanEvidenceFailure(key: string, value: string) {
        if (key === 'aimes_barcode_scan_evidence') {
          throw new Error('chromium barcode scan evidence storage unavailable')
        }
        return originalSetItem.call(this, key, value)
      }
    })

    await result.getByRole('button', { name: '确认并写入证据链' }).click()

    const alert = page.locator('[role="alert"]').filter({ hasText: '扫码证据写入失败' })
    await expect(alert).toBeVisible()
    await expect(alert).toContainText('chromium barcode scan evidence storage unavailable')
    await expect(result.getByText('确认工单到站并进入报工入口')).toBeVisible()
    await expect(result.getByText('TRACE-QR-WO-RUSH-9001-ARRIVAL')).not.toBeVisible()

    const scanEvidenceSnapshot = await page.evaluate(() => localStorage.getItem('aimes_barcode_scan_evidence'))
    const otdEvidenceSnapshot = await page.evaluate(() => localStorage.getItem('aimes_otd_evidence_chain'))
    expect(scanEvidenceSnapshot).toBeNull()
    expect(otdEvidenceSnapshot ?? '').not.toContain('TRACE-QR-WO-RUSH-9001-ARRIVAL')
  })

  test('扫码工单带入生产报工并生成开工证据', async ({ page }) => {
    await page.locator('.code-input').fill('WO-RUSH-9001')
    await page.getByRole('button', { name: '查询' }).click()

    const result = page.locator('.scan-result')
    await result.getByRole('button', { name: '确认并写入证据链' }).click()
    await expect(result.getByText('TRACE-QR-WO-RUSH-9001-ARRIVAL')).toBeVisible()

    await result.getByRole('button', { name: '进入生产报工' }).click()
    await expect(page).toHaveURL(/\/scheduling\/production\?scanCode=WO-RUSH-9001/)
    await expect(page.locator('.production-board')).toBeVisible()
    await expect(page.locator('.detail-title-row h3')).toHaveText('WO-RUSH-9001')

    const barcodeContext = page.locator('.barcode-start-context')
    await expect(barcodeContext.getByText('WO-RUSH-9001 工单扫码到站已确认')).toBeVisible()
    await expect(barcodeContext.getByText('TRACE-QR-WO-RUSH-9001-ARRIVAL')).toBeVisible()
    await expect(barcodeContext.getByText('OP-10 · CNC 精加工')).toBeVisible()
    await expect(barcodeContext.getByText('CNC-002')).toBeVisible()
    await expect(barcodeContext.getByText('张三 · EMP-001')).toBeVisible()

    await barcodeContext.getByRole('button', { name: '按扫码上下文开工' }).click()
    const dialogEvidence = page.locator('.barcode-dialog-evidence')
    await expect(dialogEvidence.getByText('TRACE-QR-WO-RUSH-9001-ARRIVAL')).toBeVisible()
    await expect(dialogEvidence.getByText('TRACE-QR-WO-RUSH-9001-OP-10-START')).toBeVisible()
    await expect(page.locator('.dialog-confirm')).toBeEnabled()
    await page.locator('.dialog-confirm').click()

    const tracePanel = page.locator('.execution-trace-panel')
    await expect(tracePanel.locator('.trace-tags').getByText('扫码流转卡')).toBeVisible()
    await expect(barcodeContext.getByText('TRACE-QR-WO-RUSH-9001-OP-10-START 已写入生产开工证据')).toBeVisible()
    await expect(barcodeContext.getByRole('button', { name: '扫码完工报数' })).toBeVisible()

    const hasStartEvidence = await page.evaluate(() => {
      const records = JSON.parse(localStorage.getItem('aimes_otd_evidence_chain') || '[]') as Array<{ traceId?: string; stage?: string }>
      return records.some(record => record.traceId === 'TRACE-QR-WO-RUSH-9001-OP-10-START' && record.stage === '生产开工')
    })
    expect(hasStartEvidence).toBeTruthy()

    await barcodeContext.getByRole('button', { name: '扫码完工报数' }).click()
    await expect(page.getByRole('heading', { name: '完工报告' })).toBeVisible()
    await expect(page.locator('.barcode-dialog-evidence').getByText('TRACE-QR-WO-RUSH-9001-OP-10-START')).toBeVisible()
    await page.locator('.dialog-confirm').click()
    await expect(tracePanel.locator('.trace-tags').getByText('扫码完工')).toBeVisible()
    await expect(tracePanel.locator('.trace-tags').getByText('批次追溯')).toBeVisible()
    await expect(tracePanel.locator('.trace-tags').getByText('质量门')).toBeVisible()
    await expect(tracePanel.locator('.trace-tags').getByText('首件巡检')).toBeVisible()
    await expect(tracePanel.locator('.trace-tags').getByText('工序交接')).toBeVisible()
    await expect(barcodeContext.getByText('TRACE-QR-WO-RUSH-9001-OP-10-COMPLETE 已写入扫码完工证据')).toBeVisible()
    await expect(barcodeContext.getByText('TRACE-QR-WO-RUSH-9001-OP-10-MATERIAL 已写入物料批次消耗')).toBeVisible()
    await expect(barcodeContext.getByText('TRACE-QR-WO-RUSH-9001-OP-10-QUALITY 已触发首件巡检质量门')).toBeVisible()
    await expect(barcodeContext.getByText('TRACE-QR-WO-RUSH-9001-OP-10-HANDOFF-OP-20 已生成下道工序交接')).toBeVisible()

    const hasCompletionEvidence = await page.evaluate(() => {
      const records = JSON.parse(localStorage.getItem('aimes_otd_evidence_chain') || '[]') as Array<{ traceId?: string; stage?: string }>
      return records.some(record => record.traceId === 'TRACE-QR-WO-RUSH-9001-OP-10-COMPLETE' && record.stage === '扫码完工')
        && records.some(record => record.traceId === 'TRACE-QR-WO-RUSH-9001-OP-10-MATERIAL' && record.stage === '物料消耗')
        && records.some(record => record.traceId === 'TRACE-QR-WO-RUSH-9001-OP-10-QUALITY' && record.stage === '质量门')
        && records.some(record => record.traceId === 'TRACE-QR-WO-RUSH-9001-OP-10-HANDOFF-OP-20' && record.stage === '工序交接')
    })
    expect(hasCompletionEvidence).toBeTruthy()

    await page.goto('quality?offlineDemo=1')
    const qualityGatePanel = page.locator('.barcode-quality-gate-panel')
    await expect(qualityGatePanel.getByText('首件巡检与工序交接')).toBeVisible()
    const qualityGateCard = qualityGatePanel.locator('.barcode-quality-card').filter({ hasText: 'WO-RUSH-9001 CNC 精加工 首件巡检放行' })
    await expect(qualityGateCard.getByText('TRACE-QR-WO-RUSH-9001-OP-10-QUALITY', { exact: true })).toBeVisible()
    const handoffCard = qualityGatePanel.locator('.barcode-quality-card').filter({ hasText: 'WO-RUSH-9001 OP-10 到 OP-20 扫码交接' })
    await expect(handoffCard.getByText('TRACE-QR-WO-RUSH-9001-OP-10-HANDOFF-OP-20', { exact: true })).toBeVisible()

    await page.goto('report?offlineDemo=1')
    const reportEvidence = page.locator('.otd-evidence-chain .evidence-chain-card').filter({ hasText: 'WO-RUSH-9001 CNC 精加工 扫码开工已确认' })
    await expect(reportEvidence.getByText('生产开工')).toBeVisible()
    await expect(reportEvidence.locator('.evidence-topline em')).toHaveText('扫码开工已确认')
    await expect(reportEvidence.getByText('TRACE-QR-WO-RUSH-9001-OP-10-START')).toBeVisible()
    const completionEvidence = page.locator('.otd-evidence-chain .evidence-chain-card').filter({ hasText: 'WO-RUSH-9001 CNC 精加工 扫码完工报数' })
    await expect(completionEvidence.locator('.evidence-topline span')).toHaveText('扫码完工')
    await expect(completionEvidence.getByText('TRACE-QR-WO-RUSH-9001-OP-10-COMPLETE')).toBeVisible()
    const materialEvidence = page.locator('.otd-evidence-chain .evidence-chain-card').filter({ hasText: 'WO-RUSH-9001 CNC 精加工 物料批次消耗' })
    await expect(materialEvidence.locator('.evidence-topline span')).toHaveText('物料消耗')
    await expect(materialEvidence.getByText('TRACE-QR-WO-RUSH-9001-OP-10-MATERIAL')).toBeVisible()
    const qualityEvidence = page.locator('.otd-evidence-chain .evidence-chain-card').filter({ hasText: 'WO-RUSH-9001 CNC 精加工 首件巡检放行' })
    await expect(qualityEvidence.locator('.evidence-topline span')).toHaveText('质量门')
    await expect(qualityEvidence.getByText('TRACE-QR-WO-RUSH-9001-OP-10-QUALITY')).toBeVisible()
    const handoffEvidence = page.locator('.otd-evidence-chain .evidence-chain-card').filter({ hasText: 'WO-RUSH-9001 OP-10 到 OP-20 扫码交接' })
    await expect(handoffEvidence.locator('.evidence-topline span')).toHaveText('工序交接')
    await expect(handoffEvidence.getByText('TRACE-QR-WO-RUSH-9001-OP-10-HANDOFF-OP-20')).toBeVisible()

    await page.goto('audit-logs?offlineDemo=1')
    const auditPanel = page.locator('.audit-replay-panel')
    await expect(auditPanel.locator('.metric-chip').filter({ hasText: '扫码完工回放' }).getByText('1')).toBeVisible()
    await expect(auditPanel.locator('.metric-chip').filter({ hasText: '扫码物料回放' }).getByText('1')).toBeVisible()
    await expect(auditPanel.locator('.metric-chip').filter({ hasText: '扫码质量门回放' }).getByText('1')).toBeVisible()
    await expect(auditPanel.locator('.metric-chip').filter({ hasText: '扫码交接回放' }).getByText('1')).toBeVisible()
    const auditCard = auditPanel.locator('.decision-card').filter({ hasText: '生产开工：WO-RUSH-9001 CNC 精加工 扫码开工已确认' })
    await expect(auditCard).toBeVisible()
    await auditCard.getByRole('button', { name: '回放决策链' }).click()
    await expect(page.locator('.replay-detail').getByText('TRACE-QR-WO-RUSH-9001-OP-10-START', { exact: true })).toBeVisible()
    const completionAuditCard = auditPanel.locator('.decision-card').filter({ hasText: '扫码完工：WO-RUSH-9001 CNC 精加工 扫码完工报数' })
    await expect(completionAuditCard).toBeVisible()
    await expect(completionAuditCard.locator('.decision-topline').getByText('扫码完工证据')).toBeVisible()
    await completionAuditCard.getByRole('button', { name: '回放决策链' }).click()
    const detail = page.locator('.replay-detail')
    await expect(detail.getByText('TRACE-QR-WO-RUSH-9001-OP-10-COMPLETE', { exact: true })).toBeVisible()
    await expect(detail.getByText(/同步给报表、审计回放、质量门和物料批次追溯/)).toBeVisible()
    await expect(detail.getByText(/核对扫码开工、完工报数、首件质检、物料消耗和 OTD 达成是否一致/)).toBeVisible()
    const materialAuditCard = auditPanel.locator('.decision-card').filter({ hasText: '物料消耗：WO-RUSH-9001 CNC 精加工 物料批次消耗' })
    await expect(materialAuditCard).toBeVisible()
    await expect(materialAuditCard.locator('.decision-topline').getByText('扫码物料证据')).toBeVisible()
    await materialAuditCard.getByRole('button', { name: '回放决策链' }).click()
    await expect(detail.getByText('TRACE-QR-WO-RUSH-9001-OP-10-MATERIAL', { exact: true })).toBeVisible()
    await expect(detail.getByText(/同步给库存齐套、BOM 用量、质量追溯和报表审计/)).toBeVisible()
    await expect(detail.getByText(/核对批次消耗、完工数量、齐套扣减和质量追溯是否绑定同一张扫码流转卡/)).toBeVisible()
    const qualityAuditCard = auditPanel.locator('.decision-card').filter({ hasText: '质量门：WO-RUSH-9001 CNC 精加工 首件巡检放行' })
    await expect(qualityAuditCard).toBeVisible()
    await expect(qualityAuditCard.locator('.decision-topline').getByText('扫码质量门证据')).toBeVisible()
    await qualityAuditCard.getByRole('button', { name: '回放决策链' }).click()
    await expect(detail.getByText('TRACE-QR-WO-RUSH-9001-OP-10-QUALITY', { exact: true })).toBeVisible()
    await expect(detail.getByText(/同步给质量闭环、报表和审计回放/)).toBeVisible()
    await expect(detail.getByText(/核对质量门放行、返工阻断、工序交接和后续排产窗口是否一致/)).toBeVisible()
    const handoffAuditCard = auditPanel.locator('.decision-card').filter({ hasText: '工序交接：WO-RUSH-9001 OP-10 到 OP-20 扫码交接' })
    await expect(handoffAuditCard).toBeVisible()
    await expect(handoffAuditCard.locator('.decision-topline').getByText('扫码交接证据')).toBeVisible()
    await handoffAuditCard.getByRole('button', { name: '回放决策链' }).click()
    await expect(detail.getByText('TRACE-QR-WO-RUSH-9001-OP-10-HANDOFF-OP-20', { exact: true })).toBeVisible()
    await expect(detail.getByText(/同步给质量闭环、AI 排产后续窗口和报表审计/)).toBeVisible()
    await expect(detail.getByText(/核对下道工序是否只在质量门放行后接收/)).toBeVisible()
  })

  test('扫码工单开工后异常上报进入扫码异常证据', async ({ page }) => {
    await page.locator('.code-input').fill('WO-RUSH-9001')
    await page.getByRole('button', { name: '查询' }).click()

    const result = page.locator('.scan-result')
    await result.getByRole('button', { name: '确认并写入证据链' }).click()
    await result.getByRole('button', { name: '进入生产报工' }).click()
    await expect(page.locator('.production-board')).toBeVisible()

    const barcodeContext = page.locator('.barcode-start-context')
    await barcodeContext.getByRole('button', { name: '按扫码上下文开工' }).click()
    await page.locator('.dialog-confirm').click()
    await expect(barcodeContext.getByRole('button', { name: '扫码异常上报' })).toBeVisible()

    await barcodeContext.getByRole('button', { name: '扫码异常上报' }).click()
    await expect(page.getByRole('heading', { name: '异常上报' })).toBeVisible()
    await expect(page.locator('.barcode-dialog-evidence').getByText('TRACE-QR-WO-RUSH-9001-OP-10-START')).toBeVisible()
    await expect(page.locator('.dialog-card textarea')).toHaveValue(/AL-202605 批次首件尺寸复核偏差/)
    await page.locator('.dialog-confirm.danger').click()

    await expect(page.locator('.execution-trace-panel').locator('.trace-tags').getByText('扫码异常')).toBeVisible()
    await expect(barcodeContext.getByText('TRACE-QR-WO-RUSH-9001-OP-10-ANOMALY 已写入扫码异常分流')).toBeVisible()

    const hasAnomalyEvidence = await page.evaluate(() => {
      const records = JSON.parse(localStorage.getItem('aimes_otd_evidence_chain') || '[]') as Array<{ traceId?: string; stage?: string }>
      return records.some(record => record.traceId === 'TRACE-QR-WO-RUSH-9001-OP-10-ANOMALY' && record.stage === '扫码异常')
    })
    expect(hasAnomalyEvidence).toBeTruthy()

    await page.goto('report?offlineDemo=1')
    const anomalyEvidence = page.locator('.otd-evidence-chain .evidence-chain-card').filter({ hasText: 'WO-RUSH-9001 CNC 精加工 扫码异常分流' })
    await expect(anomalyEvidence.locator('.evidence-topline span')).toHaveText('扫码异常')
    await expect(anomalyEvidence.getByText('TRACE-QR-WO-RUSH-9001-OP-10-ANOMALY')).toBeVisible()

    await page.goto('audit-logs?offlineDemo=1')
    const auditCard = page.locator('.audit-replay-panel .decision-card').filter({ hasText: '扫码异常：WO-RUSH-9001 CNC 精加工 扫码异常分流' })
    await expect(auditCard).toBeVisible()
    await auditCard.getByRole('button', { name: '回放决策链' }).click()
    await expect(page.locator('.replay-detail').getByText('TRACE-QR-WO-RUSH-9001-OP-10-ANOMALY', { exact: true })).toBeVisible()
  })

  test('扫码工单质检不合格冻结交接并更新标签状态', async ({ page }) => {
    await page.locator('.code-input').fill('WO-RUSH-9001')
    await page.getByRole('button', { name: '查询' }).click()

    const result = page.locator('.scan-result')
    await result.getByRole('button', { name: '确认并写入证据链' }).click()
    await result.getByRole('button', { name: '进入生产报工' }).click()
    await expect(page.locator('.production-board')).toBeVisible()

    const barcodeContext = page.locator('.barcode-start-context')
    await barcodeContext.getByRole('button', { name: '按扫码上下文开工' }).click()
    await page.locator('.dialog-confirm').click()
    await barcodeContext.getByRole('button', { name: '扫码完工报数' }).click()

    const completeDialog = page.locator('.dialog-card')
    await completeDialog.locator('input[type="number"]').nth(1).fill('2')
    await completeDialog.locator('select').selectOption('Rework')
    await page.locator('.dialog-confirm').click()

    const tracePanel = page.locator('.execution-trace-panel')
    await expect(tracePanel.locator('.trace-tags').getByText('返工分流')).toBeVisible()
    await expect(tracePanel.locator('.trace-tags').getByText('交接冻结')).toBeVisible()
    await expect(tracePanel.locator('.trace-tags').getByText('质量CAPA')).toBeVisible()
    await expect(tracePanel.locator('.trace-tags').getByText('质量隔离').first()).toBeVisible()
    await expect(tracePanel.locator('.trace-tags').getByText('返工成本').first()).toBeVisible()
    await expect(tracePanel.locator('.trace-tags').getByText('标签冻结')).toBeVisible()
    await expect(barcodeContext.getByText('TRACE-QR-WO-RUSH-9001-OP-10-REWORK 已生成质量返工证据')).toBeVisible()
    await expect(barcodeContext.getByText('TRACE-QR-WO-RUSH-9001-OP-10-HOLD-OP-20 已冻结下道交接')).toBeVisible()
    await expect(barcodeContext.getByText('TRACE-QR-WO-RUSH-9001-OP-10-CAPA 已生成扫码 CAPA 处置')).toBeVisible()
    await expect(barcodeContext.getByText('TRACE-QR-WO-RUSH-9001-OP-10-ISOLATION 已生成批次隔离')).toBeVisible()
    await expect(barcodeContext.getByText('TRACE-QR-WO-RUSH-9001-OP-10-REWORK-COST 已估算返工工时成本')).toBeVisible()
    await expect(barcodeContext.getByText('TRACE-QR-WO-RUSH-9001-OP-10-LABEL-HOLD 已更新实物标签状态')).toBeVisible()

    const hasFrozenQualityEvidence = await page.evaluate(() => {
      const records = JSON.parse(localStorage.getItem('aimes_otd_evidence_chain') || '[]') as Array<{ traceId?: string; stage?: string }>
      return records.some(record => record.traceId === 'TRACE-QR-WO-RUSH-9001-OP-10-REWORK' && record.stage === '扫码返工')
        && records.some(record => record.traceId === 'TRACE-QR-WO-RUSH-9001-OP-10-HOLD-OP-20' && record.stage === '交接冻结')
        && records.some(record => record.traceId === 'TRACE-QR-WO-RUSH-9001-OP-10-CAPA' && record.stage === '质量CAPA')
        && records.some(record => record.traceId === 'TRACE-QR-WO-RUSH-9001-OP-10-ISOLATION' && record.stage === '质量隔离')
        && records.some(record => record.traceId === 'TRACE-QR-WO-RUSH-9001-OP-10-REWORK-COST' && record.stage === '返工成本')
        && records.some(record => record.traceId === 'TRACE-QR-WO-RUSH-9001-OP-10-LABEL-HOLD' && record.stage === '标签状态')
        && !records.some(record => record.traceId === 'TRACE-QR-WO-RUSH-9001-OP-10-HANDOFF-OP-20' && record.stage === '工序交接')
    })
    expect(hasFrozenQualityEvidence).toBeTruthy()

    await page.goto('quality?offlineDemo=1')
    const qualityGatePanel = page.locator('.barcode-quality-gate-panel')
    await expect(qualityGatePanel.locator('.barcode-quality-card').filter({ hasText: 'WO-RUSH-9001 CNC 精加工 首件巡检待复核' }).locator('.quality-card-topline span').getByText('质量门', { exact: true })).toBeVisible()
    await expect(qualityGatePanel.locator('.barcode-quality-card').filter({ hasText: 'WO-RUSH-9001 CNC 精加工 扫码返工冻结' }).locator('.quality-card-topline span').getByText('扫码返工', { exact: true })).toBeVisible()
    await expect(qualityGatePanel.locator('.barcode-quality-card').filter({ hasText: 'WO-RUSH-9001 OP-10 到 OP-20 交接冻结' }).locator('.quality-card-topline span').getByText('交接冻结', { exact: true })).toBeVisible()
    await expect(qualityGatePanel.locator('.barcode-quality-card').filter({ hasText: 'WO-RUSH-9001 CNC 精加工 扫码 CAPA 处置' }).locator('.quality-card-topline span').getByText('质量CAPA', { exact: true })).toBeVisible()
    await expect(qualityGatePanel.locator('.barcode-quality-card').filter({ hasText: 'WO-RUSH-9001 CNC 精加工 AL-202605 批次隔离' }).locator('.quality-card-topline span').getByText('质量隔离', { exact: true })).toBeVisible()
    await expect(qualityGatePanel.locator('.barcode-quality-card').filter({ hasText: 'WO-RUSH-9001 CNC 精加工 返工工时成本预估' }).locator('.quality-card-topline span').getByText('返工成本', { exact: true })).toBeVisible()

    await page.goto('barcode?offlineDemo=1')
    const workOrderLabel = page.locator('.trace-card').filter({ hasText: 'WO-RUSH-9001' })
    await expect(workOrderLabel.getByText('质量冻结标签已更新')).toBeVisible()
    await expect(workOrderLabel.getByText('TRACE-QR-WO-RUSH-9001-OP-10-LABEL-HOLD', { exact: true })).toBeVisible()

    await page.goto('report?offlineDemo=1')
    const reworkEvidence = page.locator('.otd-evidence-chain .evidence-chain-card').filter({ hasText: 'WO-RUSH-9001 CNC 精加工 扫码返工冻结' })
    await expect(reworkEvidence.locator('.evidence-topline span')).toHaveText('扫码返工')
    await expect(reworkEvidence.getByText('TRACE-QR-WO-RUSH-9001-OP-10-REWORK')).toBeVisible()
    const labelEvidence = page.locator('.otd-evidence-chain .evidence-chain-card').filter({ hasText: 'WO-RUSH-9001 流转卡标签冻结' })
    await expect(labelEvidence.locator('.evidence-topline span')).toHaveText('标签状态')
    await expect(labelEvidence.getByText('TRACE-QR-WO-RUSH-9001-OP-10-LABEL-HOLD')).toBeVisible()
    const isolationEvidence = page.locator('.otd-evidence-chain .evidence-chain-card').filter({ hasText: 'WO-RUSH-9001 CNC 精加工 AL-202605 批次隔离' })
    await expect(isolationEvidence.locator('.evidence-topline span')).toHaveText('质量隔离')
    await expect(isolationEvidence.getByText('TRACE-QR-WO-RUSH-9001-OP-10-ISOLATION')).toBeVisible()
    const costEvidence = page.locator('.otd-evidence-chain .evidence-chain-card').filter({ hasText: 'WO-RUSH-9001 CNC 精加工 返工工时成本预估' })
    await expect(costEvidence.locator('.evidence-topline span')).toHaveText('返工成本')
    await expect(costEvidence.getByText('TRACE-QR-WO-RUSH-9001-OP-10-REWORK-COST')).toBeVisible()

    await page.goto('audit-logs?offlineDemo=1')
    const auditCard = page.locator('.audit-replay-panel .decision-card').filter({ hasText: '扫码返工：WO-RUSH-9001 CNC 精加工 扫码返工冻结' })
    await expect(auditCard).toBeVisible()
    await auditCard.getByRole('button', { name: '回放决策链' }).click()
    await expect(page.locator('.replay-detail').getByText('TRACE-QR-WO-RUSH-9001-OP-10-REWORK', { exact: true })).toBeVisible()
    const isolationAuditCard = page.locator('.audit-replay-panel .decision-card').filter({ hasText: '质量隔离：WO-RUSH-9001 CNC 精加工 AL-202605 批次隔离' })
    await expect(isolationAuditCard).toBeVisible()
    await isolationAuditCard.getByRole('button', { name: '回放决策链' }).click()
    await expect(page.locator('.replay-detail').getByText('TRACE-QR-WO-RUSH-9001-OP-10-ISOLATION', { exact: true })).toBeVisible()

    await page.goto('quality?offlineDemo=1')
    const releasePanel = page.locator('.barcode-quality-gate-panel')
    await expect(releasePanel.getByText('返工复验待放行')).toBeVisible()
    await releasePanel.getByRole('button', { name: '复验通过并释放交接' }).click()
    await expect(releasePanel.getByText('返工复验已放行', { exact: true })).toBeVisible()
    await expect(releasePanel.getByText('返工复验已放行：OP-20 接收、排产窗口和流转卡标签状态均已更新。')).toBeVisible()
    await expect(releasePanel.locator('.barcode-quality-card').filter({ hasText: 'WO-RUSH-9001 CNC 精加工 返工复验放行' }).locator('.quality-card-topline span').getByText('质量复验', { exact: true })).toBeVisible()
    await expect(releasePanel.locator('.barcode-quality-card').filter({ hasText: 'WO-RUSH-9001 OP-20 接收已释放' }).locator('.quality-card-topline span').getByText('交接释放', { exact: true })).toBeVisible()
    await expect(releasePanel.locator('.barcode-quality-card').filter({ hasText: 'WO-RUSH-9001 OP-20 接收窗口已恢复' }).locator('.quality-card-topline span').getByText('排产回写', { exact: true })).toBeVisible()
    await expect(releasePanel.locator('.barcode-quality-card').filter({ hasText: 'WO-RUSH-9001 流转卡标签已解冻' }).locator('.quality-card-topline span').getByText('标签状态', { exact: true })).toBeVisible()

    const hasReleaseEvidence = await page.evaluate(() => {
      const records = JSON.parse(localStorage.getItem('aimes_otd_evidence_chain') || '[]') as Array<{ traceId?: string; stage?: string; statusLabel?: string }>
      return records.some(record => record.traceId === 'TRACE-QR-WO-RUSH-9001-OP-10-RECHECK' && record.stage === '质量复验')
        && records.some(record => record.traceId === 'TRACE-QR-WO-RUSH-9001-OP-10-RELEASE-OP-20' && record.stage === '交接释放')
        && records.some(record => record.traceId === 'TRACE-QR-WO-RUSH-9001-OP-10-SCHEDULE-RELEASE' && record.stage === '排产回写')
        && records.some(record => record.traceId === 'TRACE-QR-WO-RUSH-9001-OP-10-LABEL-RELEASE' && record.stage === '标签状态' && record.statusLabel === '质量冻结已解除')
    })
    expect(hasReleaseEvidence).toBeTruthy()

    await page.goto('barcode?offlineDemo=1')
    const releasedWorkOrderLabel = page.locator('.trace-card').filter({ hasText: 'WO-RUSH-9001' })
    await expect(releasedWorkOrderLabel.getByText('质量冻结已解除')).toBeVisible()
    await expect(releasedWorkOrderLabel.getByText('TRACE-QR-WO-RUSH-9001-OP-10-LABEL-RELEASE', { exact: true })).toBeVisible()

    await page.goto('report?offlineDemo=1')
    const recheckEvidence = page.locator('.otd-evidence-chain .evidence-chain-card').filter({ hasText: 'WO-RUSH-9001 CNC 精加工 返工复验放行' })
    await expect(recheckEvidence.locator('.evidence-topline span')).toHaveText('质量复验')
    await expect(recheckEvidence.getByText('TRACE-QR-WO-RUSH-9001-OP-10-RECHECK')).toBeVisible()
    const releaseEvidence = page.locator('.otd-evidence-chain .evidence-chain-card').filter({ hasText: 'WO-RUSH-9001 OP-20 接收已释放' })
    await expect(releaseEvidence.locator('.evidence-topline span')).toHaveText('交接释放')
    await expect(releaseEvidence.getByText('TRACE-QR-WO-RUSH-9001-OP-10-RELEASE-OP-20')).toBeVisible()
    const scheduleReleaseEvidence = page.locator('.otd-evidence-chain .evidence-chain-card').filter({ hasText: 'WO-RUSH-9001 OP-20 接收窗口已恢复' })
    await expect(scheduleReleaseEvidence.locator('.evidence-topline span')).toHaveText('排产回写')
    await expect(scheduleReleaseEvidence.getByText('TRACE-QR-WO-RUSH-9001-OP-10-SCHEDULE-RELEASE')).toBeVisible()
    const labelReleaseEvidence = page.locator('.otd-evidence-chain .evidence-chain-card').filter({ hasText: 'WO-RUSH-9001 流转卡标签已解冻' })
    await expect(labelReleaseEvidence.locator('.evidence-topline span')).toHaveText('标签状态')
    await expect(labelReleaseEvidence.getByText('TRACE-QR-WO-RUSH-9001-OP-10-LABEL-RELEASE')).toBeVisible()

    await page.goto('audit-logs?offlineDemo=1')
    const releaseAuditCard = page.locator('.audit-replay-panel .decision-card').filter({ hasText: '交接释放：WO-RUSH-9001 OP-20 接收已释放' })
    await expect(releaseAuditCard).toBeVisible()
    await releaseAuditCard.getByRole('button', { name: '回放决策链' }).click()
    await expect(page.locator('.replay-detail').getByText('TRACE-QR-WO-RUSH-9001-OP-10-RELEASE-OP-20', { exact: true })).toBeVisible()
    await expect(page.locator('.replay-detail').getByText(/已解冻 OP-20 接收并恢复下道交接/)).toBeVisible()

    await page.goto('scheduling?offlineDemo=1')
    const eventPanel = page.locator('.event-queue-panel')
    await expect(eventPanel.getByText('扫码返工释放')).toBeVisible()
    const scheduleReleaseEvent = eventPanel.locator('.event-card').filter({ hasText: 'WO-RUSH-9001 OP-20 排产窗口恢复' })
    await expect(scheduleReleaseEvent.getByText('已缓解')).toBeVisible()
    await expect(scheduleReleaseEvent.getByText('TRACE-QR-WO-RUSH-9001-OP-10-SCHEDULE-RELEASE')).toBeVisible()
    await expect(scheduleReleaseEvent.getByText(/AI 排产需复核后段装配复检窗口/)).toBeVisible()
    await scheduleReleaseEvent.getByRole('button', { name: '复核排产影响' }).click()
    await expect(eventPanel.getByText('质量复验放行后的排产复核')).toBeVisible()
    await expect(eventPanel.getByText(/OP-20 装配复检窗口恢复到锁定期后第一个可用班次/)).toBeVisible()
  })
})
