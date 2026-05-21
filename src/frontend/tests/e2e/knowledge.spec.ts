import { test, expect, type Page } from '@playwright/test'
import { readFile } from 'node:fs/promises'

async function seedR3GrayReleaseDemo(page: Page) {
  await page.evaluate(() => {
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
    localStorage.setItem('aimes_quality_knowledge_recommendation_feedback', JSON.stringify([feedback]))
    localStorage.setItem('aimes_quality_knowledge_retraining_versions', JSON.stringify([r3GrayPublished, r2Published]))
  })
}

test.describe('Knowledge 文档治理', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('aimes_token', 'mock-e2e-token')
      localStorage.setItem('aimes_user', JSON.stringify({ username: 'admin', displayName: '管理员', role: 'Admin' }))
    })
    await page.goto('knowledge/documents')
    await page.waitForSelector('.upload-page', { timeout: 20000 })
  })

  test('展示分类、版本、索引状态、引用追踪和过期提醒', async ({ page }) => {
    const panel = page.locator('.knowledge-governance-panel')
    await expect(panel).toBeVisible()
    await expect(panel.getByText('分类、版本、索引状态与引用追踪')).toBeVisible()
    const cncSopCard = panel.locator('.governance-card').filter({ hasText: 'CNC 精加工 SOP' })
    await expect(cncSopCard).toBeVisible()
    await expect(cncSopCard.getByText('V2.3')).toBeVisible()
    await expect(cncSopCard.getByText('索引：已索引')).toBeVisible()
    await expect(panel.getByText('AI 生产助手').first()).toBeVisible()
    const torqueCard = panel.locator('.governance-card').filter({ hasText: '装配扭矩检验规范' })
    await expect(torqueCard).toBeVisible()
    await expect(torqueCard.getByText(/即将过期/)).toBeVisible()
    const maintenanceCard = panel.locator('.governance-card').filter({ hasText: 'CNC-01 主轴维护手册' })
    await expect(maintenanceCard).toBeVisible()
    await expect(maintenanceCard.getByText('索引：待索引')).toBeVisible()
    await expect(maintenanceCard.getByText(/已过期/)).toBeVisible()
  })

  test('展示 AI 助手业务问答的引用链和阻断来源', async ({ page }) => {
    const tracePanel = page.locator('.assistant-trace-panel')
    await expect(tracePanel).toBeVisible()
    await expect(tracePanel.getByText('AI 助手引用链')).toBeVisible()
    const delayCard = tracePanel.locator('.trace-card').filter({ hasText: '为什么 WO-RUSH-9001 会延期？' })
    await expect(delayCard).toBeVisible()
    await expect(delayCard.getByText('CNC 精加工 SOP V2.3')).toBeVisible()
    await expect(delayCard.getByText('BOM-A100 替代料规则 V1.0')).toBeVisible()
    await expect(delayCard.getByText(/CNC-01 主轴维护手册 V1.1 已过期/)).toBeVisible()
    const riskCard = tracePanel.locator('.trace-card').filter({ hasText: '今天最危险的 3 个工单是什么？' })
    await expect(riskCard).toBeVisible()
    await expect(riskCard.locator('.trace-topline span').getByText('需复核', { exact: true })).toBeVisible()
    await expect(tracePanel.getByText('如果 CNC-001 故障 4 小时会怎样？')).toBeVisible()
  })

  test('工程数据约束进入 AI 助手引用链', async ({ page }) => {
    const tracePanel = page.locator('.assistant-trace-panel')
    const engineeringCard = tracePanel.locator('.trace-card').filter({ hasText: 'BOM 与工艺路线如何约束排产？' })
    await expect(engineeringCard).toBeVisible()
    await expect(engineeringCard.locator('.trace-topline span').getByText('可引用', { exact: true })).toBeVisible()
    await expect(engineeringCard.getByText('BOM-A100 替代料规则 V1.0')).toBeVisible()
    await expect(engineeringCard.getByText('R-A100 精密轴承组件工艺路线')).toBeVisible()
    await expect(engineeringCard.getByText('R-B200 传动轴总成工艺路线')).toBeVisible()
    await expect(engineeringCard.getByText(/BOM-C300 草稿与未发布工艺路线/)).toBeVisible()
  })

  test('生成客户真实工单导入样例并进入治理队列', async ({ page }) => {
    const importPanel = page.locator('.customer-import-panel')
    await expect(importPanel.getByRole('heading', { name: '客户真实工单导入样例' })).toBeVisible()
    await expect(importPanel.getByText('待生成导入批次')).toBeVisible()
    await expect(importPanel.getByText('工艺路线')).toBeVisible()

    await importPanel.getByRole('button', { name: '生成客户工单导入样例' }).click()

    await expect(importPanel.getByText('IMP-POC-WO-20260520-001')).toBeVisible()
    await expect(importPanel.locator('.import-metrics strong').getByText('30 单')).toBeVisible()
    await expect(importPanel.getByText('6 单高风险已识别')).toBeVisible()
    const governanceCard = page.locator('.knowledge-governance-panel .governance-card').filter({ hasText: '客户真实工单导入样例_30单.csv' })
    await expect(governanceCard).toBeVisible()
    await expect(governanceCard.getByText('索引：已索引')).toBeVisible()
    await expect(page.locator('.history-table').getByText('客户真实工单导入样例_30单.csv')).toBeVisible()
  })

  test('质量低分复核结论进入统一知识资产视图', async ({ page }) => {
    await page.evaluate(() => {
      localStorage.setItem('aimes_quality_knowledge_samples', JSON.stringify([
        {
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
          createdAt: '2026-05-21T09:00:00',
          summary: 'WO-RUSH-9001 OP-10 扫码质检不合格已沉淀为可复用样本。',
          capaRecommendations: ['冻结下道交接', '隔离同批次', '复验后释放'],
          reuseTargets: ['质量根因分析', 'AI 生产助手', '文档上传', '报表中心', '审计日志'],
          evidenceTraceIds: ['TRACE-QR-WO-RUSH-9001-OP-10-REWORK'],
        },
      ]))
      localStorage.setItem('aimes_quality_knowledge_review_queue', JSON.stringify([
        {
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
          createdAt: '2026-05-21T10:00:00',
          status: 'closed',
          statusLabel: '直接复用已禁用',
          effectScore: 61,
          reviewActions: ['复核 OP-20 装配扭矩偏移是否属于扫码返工样本的有效泛化范围。'],
          closedAt: '2026-05-21T11:00:00',
          decisionAuditId: 'AUD-KG-QA-LOW-SCORE-DECISION-20260521-001',
          decisionTraceId: 'TRACE-KG-QA-WO-DEMO-1018-OP-20-LOW-SCORE-DECISION',
          decisionLabel: '禁用直接复用',
          decisionSummary: '人工复核确认 OP-20 装配扭矩偏移与 CNC 扫码返工样本不属于同一泛化族。',
          disabledReuseRule: 'matchScore < 70 或跨工序缺陷模式不一致时，只能进入复核/再训练队列，不能进入优先推荐。',
          retrainingTraceId: 'TRACE-KG-QA-WO-DEMO-1018-OP-20-RETRAINING-CANDIDATE',
          retrainingPlan: [
            '新建装配扭矩偏移独立 CAPA 样本。',
            '把本次 61 分低分尝试作为负样本。',
            '下次推荐需同时满足工序、设备族、缺陷模式和验证效果阈值。',
          ],
        },
      ]))
    })
    await page.reload()
    await page.waitForSelector('.upload-page', { timeout: 20000 })

    const assetPanel = page.locator('.quality-asset-panel')
    await expect(assetPanel.getByRole('heading', { name: '质量知识资产治理' })).toBeVisible()
    await expect(assetPanel.getByText('4 项资产')).toBeVisible()
    await expect(assetPanel.locator('.asset-card').filter({ hasText: '扫码返工 CAPA 样本库' }).getByText('样本入库')).toBeVisible()
    const disabledCard = assetPanel.locator('.asset-card').filter({ hasText: 'WO-DEMO-1018 OP-20 直接复用禁用' })
    await expect(disabledCard.getByText('禁用', { exact: true })).toBeVisible()
    await expect(disabledCard.getByText('低分 61 分 / 阈值 70 分')).toBeVisible()
    await expect(disabledCard.getByText('AUD-KG-QA-LOW-SCORE-DECISION-20260521-001')).toBeVisible()
    await expect(assetPanel.locator('.asset-card').filter({ hasText: 'WO-DEMO-1018 OP-20 负样本' }).getByText('已标记负样本')).toBeVisible()
    const retrainingCard = assetPanel.locator('.asset-card').filter({ hasText: 'WO-DEMO-1018 OP-20 再训练候选' })
    await expect(retrainingCard.getByText('再训练候选', { exact: true })).toBeVisible()
    await expect(retrainingCard.getByText('TRACE-KG-QA-WO-DEMO-1018-OP-20-RETRAINING-CANDIDATE')).toBeVisible()
    await expect(retrainingCard.getByText(/补齐独立 CAPA 样本字段后进入训练样本集/)).toBeVisible()
  })

  test('质量推荐采纳反馈进入知识资产与下一轮训练集视图', async ({ page }) => {
    await page.evaluate(() => {
      localStorage.setItem('aimes_quality_knowledge_recommendation_feedback', JSON.stringify([
        {
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
          feedbackActions: [
            '装配班长按独立扭矩 CAPA 执行工具校准复验。',
            '质量工程师把现场采纳结果回写为正样本。',
          ],
          feedbackMetrics: [
            { label: '推荐采纳耗时', value: '18 分钟' },
            { label: '复验通过率', value: '100%' },
          ],
        },
      ]))
    })
    await page.reload()
    await page.waitForSelector('.upload-page', { timeout: 20000 })

    const assetPanel = page.locator('.quality-asset-panel')
    await expect(assetPanel.getByText('2 项资产')).toBeVisible()
    const feedbackCard = assetPanel.locator('.asset-card').filter({ hasText: 'WO-DEMO-1018 OP-20 推荐采纳反馈' })
    await expect(feedbackCard.getByText('推荐采纳', { exact: true })).toBeVisible()
    await expect(feedbackCard.getByText('现场已采纳推荐')).toBeVisible()
    await expect(feedbackCard.getByText('效果 89 -> 93 分')).toBeVisible()
    await expect(feedbackCard.getByText('AUD-KG-QA-RECOMMENDATION-FEEDBACK-20260521-001')).toBeVisible()
    await expect(feedbackCard.getByText('TRACE-KG-QA-WO-DEMO-1018-OP-20-RECOMMENDATION-ADOPTED')).toBeVisible()
    await expect(feedbackCard.getByText(/QK-TRAIN-20260521-R3/)).toBeVisible()
    const nextTrainingCard = assetPanel.locator('.asset-card').filter({ hasText: 'QK-TRAIN-20260521-R3 下一轮训练集候选' })
    await expect(nextTrainingCard.locator('.asset-topline span').getByText('下一轮训练集', { exact: true })).toBeVisible()
    await expect(nextTrainingCard.getByText('下一轮候选')).toBeVisible()
    await expect(nextTrainingCard.getByText('TRACE-KG-QA-WO-DEMO-1018-OP-20-NEXT-TRAINING-R3')).toBeVisible()
    await expect(nextTrainingCard.getByText(/推荐采纳耗时 18 分钟/)).toBeVisible()
    await expect(nextTrainingCard.getByText(/复验通过率 100%/)).toBeVisible()
  })

  test('下一轮训练集候选合并反馈后完成 R3 审批校验和灰度发布', async ({ page }) => {
    await page.evaluate(() => {
      localStorage.setItem('aimes_quality_knowledge_recommendation_feedback', JSON.stringify([
        {
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
          feedbackActions: [
            '装配班长按独立扭矩 CAPA 执行工具校准复验。',
            '质量工程师把现场采纳结果回写为正样本。',
          ],
          feedbackMetrics: [
            { label: '推荐采纳耗时', value: '18 分钟' },
            { label: '复验通过率', value: '100%' },
            { label: '扭矩偏移复发风险', value: '-41%' },
          ],
        },
      ]))
    })
    await page.reload()
    await page.waitForSelector('.upload-page', { timeout: 20000 })

    const assetPanel = page.locator('.quality-asset-panel')
    const nextTrainingCard = assetPanel.locator('.asset-card').filter({ hasText: 'QK-TRAIN-20260521-R3 下一轮训练集候选' })
    await nextTrainingCard.getByRole('button', { name: '合并现场反馈' }).click()

    await expect(nextTrainingCard.getByText('现场反馈已合并')).toBeVisible()
    await expect(nextTrainingCard.getByText('QK-TRAIN-20260521-R3 / 负样本 4 条')).toBeVisible()
    await expect(nextTrainingCard.getByText('AUD-KG-QA-RETRAINING-R3-MERGE-20260521-001')).toBeVisible()
    await expect(nextTrainingCard.getByText(/等待质量主管审批后进入灰度前校验/)).toBeVisible()
    await expect(page.locator('.history-table').getByText('QK-TRAIN-20260521-R3_现场反馈合并')).toBeVisible()

    await nextTrainingCard.getByRole('button', { name: '批准 R3 训练集' }).click()

    await expect(nextTrainingCard.getByText('训练集已批准')).toBeVisible()
    await expect(nextTrainingCard.getByText('AUD-KG-QA-RETRAINING-R3-APPROVAL-20260521-001')).toBeVisible()
    await expect(nextTrainingCard.locator('.asset-reference-list').getByText('推荐采纳反馈字段完整率 100%。')).toBeVisible()
    await expect(page.locator('.history-table').getByText('QK-TRAIN-20260521-R3_R3训练集审批')).toBeVisible()

    await nextTrainingCard.getByRole('button', { name: '运行灰度前校验' }).click()

    await expect(nextTrainingCard.getByText('灰度前校验已通过')).toBeVisible()
    await expect(nextTrainingCard.getByText('AUD-KG-QA-RETRAINING-R3-VALIDATION-PASS-20260521-001')).toBeVisible()
    await expect(nextTrainingCard.locator('.asset-reference-list').getByText('Top-3 召回命中独立扭矩 CAPA 样本。')).toBeVisible()
    await expect(page.locator('.history-table').getByText('QK-TRAIN-20260521-R3_灰度前校验已通过')).toBeVisible()

    await nextTrainingCard.getByRole('button', { name: '灰度发布 R3' }).click()

    await expect(nextTrainingCard.locator('.asset-topline').getByText('已灰度发布', { exact: true })).toBeVisible()
    await expect(nextTrainingCard.getByText('AUD-KG-QA-RETRAINING-R3-GRAY-PUBLISH-20260521-001')).toBeVisible()
    await expect(nextTrainingCard.getByText(/OP-20 装配扭矩推荐链路/)).toBeVisible()
    await expect(page.locator('.history-table').getByText('QK-TRAIN-20260521-R3_灰度发布到质量推荐链路')).toBeVisible()

    await page.goto('report', { waitUntil: 'commit' })
    await page.waitForSelector('.report-board', { timeout: 60000 })
    const mergeEvidence = page.locator('.otd-evidence-chain .evidence-chain-card').filter({ hasText: 'QK-TRAIN-20260521-R3 现场反馈已合并' })
    await expect(mergeEvidence.getByText('知识再训练合并')).toBeVisible()
    await expect(mergeEvidence.getByText('TRACE-KG-QA-WO-DEMO-1018-OP-20-R3-MERGED')).toBeVisible()
    const approvalEvidence = page.locator('.otd-evidence-chain .evidence-chain-card').filter({ hasText: 'QK-TRAIN-20260521-R3 训练集版本已批准' })
    await expect(approvalEvidence.getByText('知识再训练审批')).toBeVisible()
    await expect(approvalEvidence.getByText('TRACE-KG-QA-WO-DEMO-1018-OP-20-R3-APPROVED')).toBeVisible()
    const validationEvidence = page.locator('.otd-evidence-chain .evidence-chain-card').filter({ hasText: 'QK-TRAIN-20260521-R3 发布前校验已通过' })
    await expect(validationEvidence.getByText('知识再训练校验通过')).toBeVisible()
    await expect(validationEvidence.getByText('TRACE-KG-QA-WO-DEMO-1018-OP-20-R3-VALIDATION-PASSED')).toBeVisible()
    const grayPublishEvidence = page.locator('.otd-evidence-chain .evidence-chain-card').filter({ hasText: 'QK-TRAIN-20260521-R3 已灰度发布到质量推荐链路' })
    await expect(grayPublishEvidence.getByText('知识再训练灰度发布')).toBeVisible()
    await expect(grayPublishEvidence.getByText('TRACE-KG-QA-WO-DEMO-1018-OP-20-R3-GRAY-PUBLISHED')).toBeVisible()
  })

  test('R3 调整范围重开校验后可重新灰度发布并恢复推荐决策', async ({ page }) => {
    await seedR3GrayReleaseDemo(page)
    await page.goto('admin', { waitUntil: 'commit' })
    await page.waitForSelector('.admin-board', { timeout: 30000 })
    await page.getByRole('button', { name: 'Agent 治理' }).click()

    const adminPanel = page.locator('.agent-governance-panel')
    const monitorCard = adminPanel.locator('.quality-gray-monitor-card')
    await monitorCard.getByRole('button', { name: '回滚到 R2' }).click()
    await monitorCard.getByRole('button', { name: '调整范围重开校验' }).click()
    await expect(monitorCard.getByText('已重开灰度前校验')).toBeVisible()

    await page.goto('knowledge/documents', { waitUntil: 'commit' })
    await page.waitForSelector('.upload-page', { timeout: 20000 })
    const assetPanel = page.locator('.quality-asset-panel')
    const nextTrainingCard = assetPanel.locator('.asset-card').filter({ hasText: 'QK-TRAIN-20260521-R3 下一轮训练集候选' })

    await expect(nextTrainingCard.getByText('已重开灰度前校验')).toBeVisible()
    await expect(nextTrainingCard.getByText('AUD-KG-QA-RETRAINING-R3-SCOPE-REVALIDATION-20260521-001')).toBeVisible()
    await expect(nextTrainingCard.getByText(/R2 继续承接正式推荐/)).toBeVisible()

    await nextTrainingCard.getByRole('button', { name: '重新运行灰度前校验' }).click()

    await expect(nextTrainingCard.getByText('灰度前校验已通过')).toBeVisible()
    await expect(nextTrainingCard.getByText('AUD-KG-QA-RETRAINING-R3-SCOPE-REVALIDATION-PASS-20260521-001')).toBeVisible()
    await expect(nextTrainingCard.locator('.asset-reference-list').getByText('R2 回滚期间补充的负样本未被误召回。')).toBeVisible()
    await expect(page.locator('.history-table').getByText('QK-TRAIN-20260521-R3_灰度前校验已通过')).toBeVisible()

    await nextTrainingCard.getByRole('button', { name: '重新灰度发布 R3' }).click()

    await expect(nextTrainingCard.locator('.asset-topline').getByText('已重新灰度发布', { exact: true })).toBeVisible()
    await expect(nextTrainingCard.getByText('AUD-KG-QA-RETRAINING-R3-GRAY-REPUBLISH-20260521-001')).toBeVisible()
    await expect(nextTrainingCard.getByText('TRACE-KG-QA-WO-DEMO-1018-OP-20-R3-GRAY-REPUBLISHED')).toBeVisible()
    await expect(page.locator('.history-table').getByText('QK-TRAIN-20260521-R3_灰度发布到质量推荐链路')).toBeVisible()

    await page.goto('quality', { waitUntil: 'commit', timeout: 45000 })
    await page.waitForSelector('.quality-board', { timeout: 60000 })
    const rankingCard = page.locator('.quality-capa-panel .ranking-card').filter({ hasText: 'WO-DEMO-1018 OP-20 装配扭矩偏移独立 CAPA 推荐' })
    await expect(rankingCard.locator('.ranking-topline span').getByText('已灰度发布', { exact: true })).toBeVisible()
    await expect(rankingCard.locator('.ranking-training-release').getByText('QK-TRAIN-20260521-R3', { exact: true })).toBeVisible()
    await expect(rankingCard.getByText('AUD-KG-QA-RETRAINING-R3-GRAY-REPUBLISH-20260521-001')).toBeVisible()

    await page.goto('admin', { waitUntil: 'commit' })
    await page.waitForSelector('.admin-board', { timeout: 30000 })
    await page.getByRole('button', { name: 'Agent 治理' }).click()
    const republishedMonitorCard = page.locator('.agent-governance-panel .quality-gray-monitor-card')
    await expect(republishedMonitorCard.getByText('TRACE-KG-QA-WO-DEMO-1018-OP-20-R3-GRAY-REPUBLISHED')).toBeVisible()
    await expect(republishedMonitorCard.getByRole('button', { name: '扩大灰度' })).toBeVisible()
    await expect(republishedMonitorCard.getByRole('button', { name: '回滚到 R2' })).toBeVisible()
  })

  test('批准再训练候选生成训练集版本并支持回滚', async ({ page }) => {
    await page.evaluate(() => {
      localStorage.setItem('aimes_quality_knowledge_samples', JSON.stringify([
        {
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
          createdAt: '2026-05-21T09:00:00',
          summary: 'WO-RUSH-9001 OP-10 扫码质检不合格已沉淀为可复用样本。',
          capaRecommendations: ['冻结下道交接', '隔离同批次', '复验后释放'],
          reuseTargets: ['质量根因分析', 'AI 生产助手', '文档上传', '报表中心', '审计日志'],
          evidenceTraceIds: ['TRACE-QR-WO-RUSH-9001-OP-10-REWORK'],
        },
      ]))
      localStorage.setItem('aimes_quality_knowledge_review_queue', JSON.stringify([
        {
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
          createdAt: '2026-05-21T10:00:00',
          status: 'closed',
          statusLabel: '直接复用已禁用',
          effectScore: 61,
          reviewActions: ['复核 OP-20 装配扭矩偏移是否属于扫码返工样本的有效泛化范围。'],
          closedAt: '2026-05-21T11:00:00',
          decisionAuditId: 'AUD-KG-QA-LOW-SCORE-DECISION-20260521-001',
          decisionTraceId: 'TRACE-KG-QA-WO-DEMO-1018-OP-20-LOW-SCORE-DECISION',
          decisionLabel: '禁用直接复用',
          decisionSummary: '人工复核确认 OP-20 装配扭矩偏移与 CNC 扫码返工样本不属于同一泛化族。',
          disabledReuseRule: 'matchScore < 70 或跨工序缺陷模式不一致时，只能进入复核/再训练队列，不能进入优先推荐。',
          retrainingTraceId: 'TRACE-KG-QA-WO-DEMO-1018-OP-20-RETRAINING-CANDIDATE',
          retrainingPlan: [
            '新建装配扭矩偏移独立 CAPA 样本。',
            '把本次 61 分低分尝试作为负样本。',
            '下次推荐需同时满足工序、设备族、缺陷模式和验证效果阈值。',
          ],
        },
      ]))
    })
    await page.reload()
    await page.waitForSelector('.upload-page', { timeout: 20000 })

    const assetPanel = page.locator('.quality-asset-panel')
    const retrainingCard = assetPanel.locator('.asset-card').filter({ hasText: 'WO-DEMO-1018 OP-20 再训练候选' })
    await retrainingCard.getByRole('button', { name: '批准进入训练集' }).click()

    await expect(retrainingCard.getByText('训练集已批准')).toBeVisible()
    await expect(retrainingCard.getByText('QK-TRAIN-20260521-R2 / 负样本 3 条')).toBeVisible()
    await expect(retrainingCard.getByText('AUD-KG-QA-RETRAINING-APPROVAL-20260521-001')).toBeVisible()
    await expect(retrainingCard.locator('.asset-reference-list').getByText('离线 Top-3 召回不得推荐跨工序扫码返工样本。')).toBeVisible()
    await expect(page.locator('.history-table').getByText('QK-TRAIN-20260521-R2_装配扭矩偏移 CAPA 再训练样本集_审批')).toBeVisible()

    await retrainingCard.getByRole('button', { name: '运行发布前校验' }).click()

    await expect(retrainingCard.getByText('发布前校验未通过')).toBeVisible()
    await expect(retrainingCard.getByText('AUD-KG-QA-RETRAINING-VALIDATION-20260521-001')).toBeVisible()
    await expect(retrainingCard.locator('.asset-reference-list').getByText('OP-20 扭矩工具校准字段缺失。')).toBeVisible()
    await expect(page.locator('.history-table').getByText('QK-TRAIN-20260521-R2_发布前校验未通过')).toBeVisible()

    await retrainingCard.getByRole('button', { name: '补齐字段并重新校验' }).click()

    await expect(retrainingCard.getByText('发布前校验已通过')).toBeVisible()
    await expect(retrainingCard.getByText('AUD-KG-QA-RETRAINING-VALIDATION-PASS-20260521-001')).toBeVisible()
    await expect(retrainingCard.locator('.asset-reference-list').getByText('低分负样本召回权重下降 36%。')).toBeVisible()
    await expect(page.locator('.history-table').getByText('QK-TRAIN-20260521-R2_发布前校验已通过')).toBeVisible()

    await retrainingCard.getByRole('button', { name: '发布到 AI 推荐' }).click()

    await expect(retrainingCard.locator('.asset-topline').getByText('已发布到 AI 推荐', { exact: true })).toBeVisible()
    await expect(retrainingCard.getByText('AUD-KG-QA-RETRAINING-PUBLISH-20260521-001')).toBeVisible()
    await expect(retrainingCard.getByText(/质量知识复用排序/)).toBeVisible()
    await expect(page.locator('.history-table').getByText('QK-TRAIN-20260521-R2_发布到_AI_推荐链路')).toBeVisible()

    await page.evaluate(() => {
      const records = JSON.parse(localStorage.getItem('aimes_quality_knowledge_retraining_versions') ?? '[]')
      localStorage.setItem('aimes_quality_knowledge_retraining_versions', JSON.stringify(records.map((record: any) => ({
        ...record,
        status: 'validation_failed',
        statusLabel: '发布前校验未通过',
        publishedAt: undefined,
        publishAuditId: undefined,
        publishTraceId: undefined,
        publishSummary: undefined,
        recommendationScope: undefined,
      }))))
    })
    await page.reload()
    await page.waitForSelector('.upload-page', { timeout: 20000 })
    const rollbackCard = page.locator('.quality-asset-panel .asset-card').filter({ hasText: 'WO-DEMO-1018 OP-20 再训练候选' })
    await rollbackCard.getByRole('button', { name: '回滚训练集版本' }).click()

    await expect(rollbackCard.getByText('已回滚到 R1')).toBeVisible()
    await expect(rollbackCard.getByText('AUD-KG-QA-RETRAINING-ROLLBACK-20260521-001')).toBeVisible()
    await expect(rollbackCard.getByText(/回滚目标 QK-TRAIN-20260521-R1/)).toBeVisible()
    await expect(page.locator('.history-table').getByText('QK-TRAIN-20260521-R2_回滚到_QK-TRAIN-20260521-R1')).toBeVisible()

    await page.goto('report', { waitUntil: 'commit' })
    await page.waitForSelector('.report-board', { timeout: 60000 })
    const approvalEvidence = page.locator('.otd-evidence-chain .evidence-chain-card').filter({ hasText: 'QK-TRAIN-20260521-R2 训练集版本已批准' })
    await expect(approvalEvidence.getByText('知识再训练审批')).toBeVisible()
    await expect(approvalEvidence.getByText('TRACE-KG-QA-WO-DEMO-1018-OP-20-RETRAINING-APPROVED')).toBeVisible()
    const validationEvidence = page.locator('.otd-evidence-chain .evidence-chain-card').filter({ hasText: 'QK-TRAIN-20260521-R2 发布前校验未通过' })
    await expect(validationEvidence.getByText('知识再训练校验')).toBeVisible()
    await expect(validationEvidence.getByText('TRACE-KG-QA-WO-DEMO-1018-OP-20-RETRAINING-VALIDATION-FAILED')).toBeVisible()
    const validationPassEvidence = page.locator('.otd-evidence-chain .evidence-chain-card').filter({ hasText: 'QK-TRAIN-20260521-R2 发布前校验已通过' })
    await expect(validationPassEvidence.getByText('知识再训练校验通过')).toBeVisible()
    await expect(validationPassEvidence.getByText('TRACE-KG-QA-WO-DEMO-1018-OP-20-RETRAINING-VALIDATION-PASSED')).toBeVisible()
    const publishEvidence = page.locator('.otd-evidence-chain .evidence-chain-card').filter({ hasText: 'QK-TRAIN-20260521-R2 已发布到 AI 推荐链路' })
    await expect(publishEvidence.getByText('知识再训练发布')).toBeVisible()
    await expect(publishEvidence.getByText('TRACE-KG-QA-WO-DEMO-1018-OP-20-RETRAINING-PUBLISHED')).toBeVisible()
    const rollbackEvidence = page.locator('.otd-evidence-chain .evidence-chain-card').filter({ hasText: 'QK-TRAIN-20260521-R2 已回滚到 QK-TRAIN-20260521-R1' })
    await expect(rollbackEvidence.getByText('知识再训练回滚')).toBeVisible()
    await expect(rollbackEvidence.getByText('TRACE-KG-QA-WO-DEMO-1018-OP-20-RETRAINING-ROLLBACK')).toBeVisible()

    await page.goto('/scheduling/audit-logs', { waitUntil: 'commit' })
    await page.waitForSelector('.audit-board', { timeout: 20000 })
    const auditCards = page.locator('.audit-replay-panel .decision-card')
    await expect(auditCards.filter({ hasText: '知识再训练审批：QK-TRAIN-20260521-R2 训练集版本已批准' })).toBeVisible()
    await expect(auditCards.filter({ hasText: '知识再训练校验：QK-TRAIN-20260521-R2 发布前校验未通过' })).toBeVisible()
    await expect(auditCards.filter({ hasText: '知识再训练校验通过：QK-TRAIN-20260521-R2 发布前校验已通过' })).toBeVisible()
    await expect(auditCards.filter({ hasText: '知识再训练发布：QK-TRAIN-20260521-R2 已发布到 AI 推荐链路' })).toBeVisible()
    await expect(auditCards.filter({ hasText: '知识再训练回滚：QK-TRAIN-20260521-R2 已回滚到 QK-TRAIN-20260521-R1' })).toBeVisible()
  })

  test('上传文档进入待索引治理队列', async ({ page }) => {
    await page.route('**/api/v1/knowledge/documents', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          documentId: 'doc-test-sop',
          fileName: '现场换线SOP.md',
          chunkCount: 3,
          uploadedAt: '2026-05-20T10:00:00',
          status: 'done',
        }),
      })
    })

    await page.locator('.cat-select').selectOption('process')
    const fileInput = page.locator('input[type="file"]')
    await fileInput.setInputFiles({
      name: '现场换线SOP.md',
      mimeType: 'text/markdown',
      buffer: Buffer.from('# 现场换线SOP\n\n换线前确认设备、人员和首件。'),
    })
    await page.getByRole('button', { name: '开始上传' }).click()

    const panel = page.locator('.knowledge-governance-panel')
    await expect(panel.getByText('现场换线SOP.md')).toBeVisible()
    await expect(panel.getByText('工艺文档').first()).toBeVisible()
    await expect(panel.getByText('索引：待索引').first()).toBeVisible()
    await expect(panel.getByText('新上传文档已进入治理队列')).toBeVisible()
    await expect(page.locator('.history-table').getByText('现场换线SOP.md')).toBeVisible()
  })

  test('过期待索引文档复核后成为 AI 助手可引用来源', async ({ page }) => {
    const panel = page.locator('.knowledge-governance-panel')
    const maintenanceCard = panel.locator('.governance-card').filter({ hasText: 'CNC-01 主轴维护手册' })
    await expect(maintenanceCard.getByText('索引：待索引')).toBeVisible()
    await expect(maintenanceCard.getByText(/已过期/)).toBeVisible()

    await maintenanceCard.getByRole('button', { name: '复核并重建索引' }).click()

    await expect(maintenanceCard.locator('.doc-topline strong').getByText('V1.2', { exact: true })).toBeVisible()
    await expect(maintenanceCard.getByText('索引：已索引')).toBeVisible()
    await expect(maintenanceCard.getByText('有效期：2026-12-31')).toBeVisible()
    await expect(maintenanceCard.getByText(/已由设备主管复核/)).toBeVisible()
    await expect(page.locator('.history-table').getByText('AUD-KG-REINDEX-20260520-001')).toBeVisible()

    const tracePanel = page.locator('.assistant-trace-panel')
    const faultTrace = tracePanel.locator('.trace-card').filter({ hasText: '如果 CNC-001 故障 4 小时会怎样？' })
    await expect(faultTrace.locator('.reference-list').getByText('CNC-01 主轴维护手册 V1.2', { exact: true })).toBeVisible()
    await expect(faultTrace.getByText(/AUD-KG-REINDEX-20260520-001 已完成知识治理复核/)).toBeVisible()

    await page.locator('.chat-fab').click()
    await page.locator('.chat-input').fill('如果 CNC-001 故障 4 小时会怎样？')
    await page.locator('.send-btn').click()
    const chat = page.locator('.chat-panel')
    await expect(chat.getByText(/CNC-01 主轴维护手册 V1.2/)).toBeVisible()
    await expect(chat.getByText(/AUD-KG-REINDEX-20260520-001 已完成知识治理复核/)).toBeVisible()

    await page.goto('report', { waitUntil: 'commit' })
    await page.waitForSelector('.report-board', { timeout: 60000 })
    const evidence = page.locator('.otd-evidence-chain .evidence-chain-card').filter({ hasText: 'CNC-01 主轴维护手册 已复核并重建索引' })
    await expect(evidence.getByText('知识治理')).toBeVisible()
    await expect(evidence.getByText('TRACE-KG-CNC-MAINT-REINDEX')).toBeVisible()
  })

  test('R5 回滚实验沉淀为实验负样本和风险阈值资产', async ({ page }) => {
    await page.evaluate(() => {
      localStorage.setItem('aimes_quality_knowledge_gray_release_decisions', JSON.stringify([
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
    await page.reload()
    await page.waitForSelector('.upload-page', { timeout: 20000 })

    const assetPanel = page.locator('.quality-asset-panel')
    await expect(assetPanel.getByText('4 项资产')).toBeVisible()
    const negativeCard = assetPanel.locator('.asset-card').filter({ hasText: 'QK-TRAIN-20260521-R5 实验负样本' })
    await expect(negativeCard.getByText('实验负样本', { exact: true })).toBeVisible()
    await expect(negativeCard.getByText('已从主动推荐排除')).toBeVisible()
    await expect(negativeCard.locator('.asset-meta').getByText('误召回 2 次', { exact: true })).toBeVisible()
    await expect(negativeCard.getByText('AUD-KG-QA-RETRAINING-R5-GRAY-ROLLBACK-20260521-001')).toBeVisible()
    await expect(negativeCard.getByText('TRACE-KG-QA-WO-DEMO-1018-OP-20-R5-GRAY-ROLLED-BACK')).toBeVisible()
    await expect(negativeCard.getByText(/主动推荐选择器排除 QK-TRAIN-20260521-R5/)).toBeVisible()

    const thresholdCard = assetPanel.locator('.asset-card').filter({ hasText: 'QK-TRAIN-20260521-R5 风险阈值' })
    await expect(thresholdCard.getByText('风险阈值', { exact: true })).toBeVisible()
    await expect(thresholdCard.getByText('扩大门禁收紧')).toBeVisible()
    await expect(thresholdCard.locator('.asset-meta').getByText('复验 82% / 误召回 2 次', { exact: true })).toBeVisible()
    await expect(thresholdCard.getByText(/推荐采纳率 100%、复验通过率不低于 95%、负样本误召回 0 次/)).toBeVisible()
    await expect(assetPanel.locator('.asset-card').filter({ hasText: 'QK-TRAIN-20260521-R6 补样实验候选' })).toBeVisible()
    await expect(assetPanel.locator('.asset-card').filter({ hasText: 'QK-TRAIN-20260521-R7 影子验证候选' })).toBeVisible()
  })

  test('R5 回滚后的 R6 补样和 R7 影子验证进入知识资产执行链', async ({ page }) => {
    await page.evaluate(() => {
      const feedbackRecords = [
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
      ]
      localStorage.setItem('aimes_quality_knowledge_recommendation_feedback', JSON.stringify(feedbackRecords))
      localStorage.setItem('aimes_quality_knowledge_retraining_versions', JSON.stringify(versions))
      localStorage.setItem('aimes_quality_knowledge_gray_release_decisions', JSON.stringify(decisions))
    })
    await page.reload({ waitUntil: 'commit' })
    await page.waitForSelector('.upload-page', { timeout: 20000 })

    const assetPanel = page.locator('.quality-asset-panel')
    await expect(assetPanel.getByText('6 项资产')).toBeVisible()
    const r6Candidate = assetPanel.locator('.asset-card').filter({ hasText: 'QK-TRAIN-20260521-R6 补样实验候选' })
    await expect(r6Candidate.getByText('实验候选', { exact: true })).toBeVisible()
    await expect(r6Candidate.getByText('补样待合并')).toBeVisible()
    await expect(r6Candidate.locator('.asset-meta').getByText('6 / 8 条 / 75%', { exact: true })).toBeVisible()
    await r6Candidate.getByRole('button', { name: '合并 R6 负样本' }).click()
    await expect(r6Candidate.getByText('补样已合并')).toBeVisible()
    await expect(r6Candidate.locator('.asset-meta').getByText('8 / 8 条 / 100%', { exact: true })).toBeVisible()
    await expect(r6Candidate.getByText('AUD-KG-QA-RETRAINING-R6-NEGATIVE-COVERAGE-MERGE-20260521-001')).toBeVisible()

    const r7Candidate = assetPanel.locator('.asset-card').filter({ hasText: 'QK-TRAIN-20260521-R7 影子验证候选' })
    await expect(r7Candidate.getByRole('button', { name: '运行 R7 影子验证' })).toBeVisible()
    await r7Candidate.getByRole('button', { name: '运行 R7 影子验证' }).click()
    await expect(r7Candidate.locator('.asset-topline em').getByText('影子验证已通过', { exact: true })).toBeVisible()
    await expect(r7Candidate.getByText(/连续 2 个跨线场景误召回 0 次/)).toBeVisible()
    await expect(r7Candidate.getByText('AUD-KG-QA-RETRAINING-R7-SHADOW-VALIDATION-PASS-20260521-001')).toBeVisible()
    await expect(r7Candidate.getByText(/跨线影子场景 LX-A \/ LX-B 均未触发同名缺陷误召回/)).toBeVisible()
    await expect(r7Candidate.getByRole('button', { name: '发布 R7 影子灰度' })).toBeVisible()
    await r7Candidate.getByRole('button', { name: '发布 R7 影子灰度' }).click()
    await expect(r7Candidate.locator('.asset-topline em').getByText('影子灰度已发布', { exact: true })).toBeVisible()
    await expect(r7Candidate.getByText('AUD-KG-QA-RETRAINING-R7-SHADOW-GRAY-PUBLISH-20260521-001')).toBeVisible()
    await expect(r7Candidate.getByText(/等待系统管理提交扩大并由质量主管确认/)).toBeVisible()
    await expect(page.locator('.history-table').getByText('QK-TRAIN-20260521-R6_R6负样本补样已合并')).toBeVisible()
    await expect(page.locator('.history-table').getByText('QK-TRAIN-20260521-R7_R7影子验证已通过')).toBeVisible()
    await expect(page.locator('.history-table').getByText('QK-TRAIN-20260521-R7_R7影子灰度已发布')).toBeVisible()

    await page.goto('admin', { waitUntil: 'commit' })
    await page.waitForSelector('.admin-board', { timeout: 30000 })
    await page.getByRole('button', { name: 'Agent 治理' }).click()
    const adminPanel = page.locator('.agent-governance-panel')
    const adminCandidateLane = adminPanel.locator('.quality-experiment-candidate-governance')
    await expect(adminCandidateLane.getByText('补样已合并')).toBeVisible()
    const adminR7Candidate = adminCandidateLane.locator('.quality-experiment-candidate-card').filter({ hasText: 'QK-TRAIN-20260521-R7' })
    await expect(adminR7Candidate.locator('.action-topline em').getByText('影子灰度已发布', { exact: true })).toBeVisible()
    await expect(adminR7Candidate.getByText('AUD-KG-QA-RETRAINING-R7-SHADOW-GRAY-PUBLISH-20260521-001')).toBeVisible()
    const grayMonitorLane = adminPanel.locator('.quality-gray-monitor-governance')
    const r7Monitor = grayMonitorLane.locator('.quality-gray-monitor-card').filter({ hasText: 'QK-TRAIN-20260521-R7 灰度监控' })
    await expect(r7Monitor.getByText('跨线 OP-20 扭矩偏移影子灰度').first()).toBeVisible()
    await expect(r7Monitor.getByText('100%').first()).toBeVisible()
    await expect(r7Monitor.locator('.gray-metric').filter({ hasText: '误召回' }).locator('strong')).toHaveText('0 次')
    await expect(r7Monitor.getByText('AUD-KG-QA-RETRAINING-R7-SHADOW-GRAY-PUBLISH-20260521-001')).toBeVisible()
    const executionPolicy = adminPanel.locator('.policy-block').filter({ hasText: '执行策略' })
    await expect(executionPolicy.getByText('2 个候选 / QK-TRAIN-20260521-R6 100%')).toBeVisible()

    await page.goto('audit-logs', { waitUntil: 'commit' })
    await page.waitForSelector('.audit-board', { timeout: 20000 })
    const auditPanel = page.locator('.audit-replay-panel')
    const r7Replay = auditPanel.locator('.decision-card').filter({ hasText: 'QK-TRAIN-20260521-R7 影子灰度已发布回放' })
    await expect(r7Replay).toBeVisible()
    await r7Replay.getByRole('button', { name: '回放决策链' }).click()
    await expect(auditPanel.locator('.replay-detail').getByText('TRACE-KG-QA-WO-DEMO-1018-OP-20-R7-SHADOW-GRAY-PUBLISHED', { exact: true })).toBeVisible()
    await expect(auditPanel.locator('.replay-detail').getByText(/跨线 OP-20 扭矩偏移影子灰度/)).toBeVisible()

    await page.goto('report', { waitUntil: 'commit' })
    await page.waitForSelector('.report-board', { timeout: 60000 })
    const reportCandidatePanel = page.locator('.quality-experiment-candidate-report')
    const reportR6Candidate = reportCandidatePanel.locator('.candidate-card').filter({ hasText: 'QK-TRAIN-20260521-R6 · R5 回滚触发' })
    await expect(reportR6Candidate.locator('.experiment-topline em')).toHaveText('补样已合并')
    const reportR7Candidate = reportCandidatePanel.locator('.candidate-card').filter({ hasText: 'QK-TRAIN-20260521-R7 · R6 补样后触发' })
    await expect(reportR7Candidate.locator('.experiment-topline em')).toHaveText('影子灰度已发布')
    const reportGrayPanel = page.locator('.quality-gray-monitor-report')
    const reportR7Monitor = reportGrayPanel.locator('.gray-monitor-row').filter({ hasText: 'QK-TRAIN-20260521-R7 灰度监控' })
    await expect(reportR7Monitor).toBeVisible()
    await expect(reportR7Monitor.locator('strong')).toContainText('跨线 OP-20 扭矩偏移影子灰度')
    const reportExperimentPanel = page.locator('.quality-experiment-report')
    await expect(reportExperimentPanel.getByText('QK-TRAIN-20260521-R7 · 首次灰度发布')).toBeVisible()
    const downloadPromise = page.waitForEvent('download')
    await page.getByRole('button', { name: 'CSV' }).click()
    const download = await downloadPromise
    const downloadPath = await download.path()
    expect(downloadPath).toBeTruthy()
    const csv = await readFile(downloadPath!, 'utf8')
    expect(csv).toContain('QK-TRAIN-20260521-R6 / R5 回滚触发')
    expect(csv).toContain('补样已合并 / 负样本覆盖 8 / 8 条 / 覆盖率 100% / 跨线负样本已补齐')
    expect(csv).toContain('QK-TRAIN-20260521-R7 / R6 补样后触发')
    expect(csv).toContain('影子灰度已发布 / 负样本覆盖 8 / 8 条 / 覆盖率 100% / 影子灰度已发布')
    expect(csv).toContain('QK-TRAIN-20260521-R7 灰度监控 / 跨线 OP-20 扭矩偏移影子灰度')
    expect(csv).toContain('QK-TRAIN-20260521-R7 灰度审计')
  })
})
