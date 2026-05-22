import { test, expect, type Page } from '@playwright/test'
import { readFile } from 'node:fs/promises'

test.describe.configure({ timeout: 60000 })

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

async function seedR3R4R5QualityRecommendationExperiments(page: Page) {
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
}

test.describe('Admin Agent 治理', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('aimes_token', 'mock-e2e-token')
      localStorage.setItem('aimes_user', JSON.stringify({ username: 'admin', displayName: '管理员', role: 'Admin' }))
    })
    await page.goto('admin', { waitUntil: 'commit' })
    await page.waitForSelector('.admin-board', { timeout: 30000 })
  })

  test('展示 Agent 可执行动作、权限、审计和配置审批策略', async ({ page }) => {
    await page.getByRole('button', { name: 'Agent 治理' }).click()

    const panel = page.locator('.agent-governance-panel')
    await expect(panel).toBeVisible()
    await expect(panel.getByText('Agent 策略与权限治理')).toBeVisible()
    await expect(panel.getByText('生成重排建议')).toBeVisible()
    await expect(panel.getByText('创建异常处置卡')).toBeVisible()
    await expect(panel.getByText('治理客户工单导入样例')).toBeVisible()
    await expect(panel.getByText('治理客户设备故障样例')).toBeVisible()
    await expect(panel.getByText('归档 POC 复盘签署')).toBeVisible()
    await expect(panel.locator('.agent-metric').filter({ hasText: 'POC 复盘签署' }).getByText('待签署')).toBeVisible()
    await expect(panel.getByText('AUD-CHAT-ANOMALY-20260520')).toBeVisible()
    const executionPolicy = panel.locator('.policy-block').filter({ hasText: '执行策略' })
    await expect(executionPolicy.getByText('置信度阈值', { exact: true })).toBeVisible()
    await expect(executionPolicy.getByText('0.80', { exact: true })).toBeVisible()
    await expect(panel.getByRole('heading', { name: '关键配置变更审批' })).toBeVisible()
    await expect(panel.getByText('Scheduling.LockWindowHours 8h -> 10h')).toBeVisible()
  })

  test('从 Agent 治理跳转到审计决策回放', async ({ page }) => {
    await page.getByRole('button', { name: 'Agent 治理' }).click()
    await page.getByRole('button', { name: '查看审计回放' }).click()

    await expect(page).toHaveURL(/\/scheduling\/audit-logs$/)
    await expect(page.locator('.audit-board')).toBeVisible()
    await expect(page.locator('.audit-replay-panel')).toBeVisible()
  })

  test('AI 助手动作审计进入 Agent 治理清单', async ({ page }) => {
    await page.evaluate(() => {
      localStorage.setItem('aimes_assistant_action_audits', JSON.stringify([
        {
          id: 'AUD-CHAT-RECOVERY-PACKAGE-20260521-001-1',
          actionId: 'create-delivery-recovery-package',
          label: '生成交期恢复执行包',
          type: 'delivery_recovery_package',
          actor: 'admin',
          role: 'Admin',
          targetRoute: '/scheduling',
          auditCode: 'AUD-CHAT-RECOVERY-PACKAGE-20260521-001',
          traceId: 'TRACE-CHAT-RECOVERY-WO-RUSH-9001-20260521',
          resultMessage: '已生成 WO-RUSH-9001 交期恢复执行包，包含排产、风险、采购和质量四个责任动作。',
          permitted: true,
          createdAt: '2026-05-22T09:00:00.000Z',
        },
        {
          id: 'AUD-CHAT-ANOMALY-20260520-1',
          actionId: 'create-anomaly-card',
          label: '创建异常处置卡',
          type: 'create_anomaly_card',
          actor: 'operator1',
          role: 'Operator',
          targetRoute: '/anomaly',
          auditCode: 'AUD-CHAT-ANOMALY-20260520',
          resultMessage: '已创建 WO-RUSH-9001 CNC 精加工现场异常处置卡，并打开异常管理现场事件中心。',
          permitted: false,
          createdAt: '2026-05-22T09:05:00.000Z',
        },
      ]))
    })
    await page.reload({ waitUntil: 'commit' })
    await page.waitForSelector('.admin-board', { timeout: 30000 })
    await page.getByRole('button', { name: 'Agent 治理' }).click()

    const panel = page.locator('.agent-governance-panel')
    await expect(panel.locator('.agent-metric').filter({ hasText: '助手动作审计' }).getByText('2')).toBeVisible()
    await expect(panel.locator('.agent-metric').filter({ hasText: '助手拒绝动作' }).getByText('1')).toBeVisible()
    await expect(panel.getByRole('heading', { name: 'AI 助手动作治理' })).toBeVisible()
    const recoveryCard = panel.locator('.assistant-action-card').filter({ hasText: '生成交期恢复执行包' })
    await expect(recoveryCard.getByText('交期恢复包')).toBeVisible()
    await expect(recoveryCard.getByText('已执行')).toBeVisible()
    await expect(recoveryCard.getByText('admin / Admin')).toBeVisible()
    await expect(recoveryCard.getByText('/scheduling')).toBeVisible()
    await expect(recoveryCard.getByText('AUD-CHAT-RECOVERY-PACKAGE-20260521-001')).toBeVisible()
    await expect(recoveryCard.getByText('TRACE-CHAT-RECOVERY-WO-RUSH-9001-20260521')).toBeVisible()
    const rejectedCard = panel.locator('.assistant-action-card').filter({ hasText: '创建异常处置卡' })
    await expect(rejectedCard.locator('.action-topline span').getByText('异常处置', { exact: true })).toBeVisible()
    await expect(rejectedCard.getByText('已拒绝')).toBeVisible()
    await expect(rejectedCard.getByText('operator1 / Operator')).toBeVisible()
    await expect(rejectedCard.getByText('AUD-CHAT-ANOMALY-20260520')).toBeVisible()
  })

  test('外协承诺包进入 Agent 治理并可跳转到采购与排产', async ({ page }) => {
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
          actor: 'report.agent',
          baselineOtd: 68,
          agentOtd: 73,
          lift: 5,
          delayedReduced: 0,
          statusLabel: '外协承诺待到货',
          commitment: '法兰盘 DN100 外协承诺口径：华东精密外协厂将按 2026-05-23 交付，当前仍保留厂内延期口径。',
          owner: '采购 / 计划联合确认',
          dueAt: '2026-05-23',
          summary: '外协等待未闭环转为外协承诺口径，保留 TRACE-KPI-PRODUCT-FLANGE-OTD-20260521 作为原始 KPI 证据。',
          actions: [
            {
              module: '外协协同',
              owner: '采购 / 计划',
              action: '向 华东精密外协厂 锁定 法兰盘 DN100 的外协承诺日期 2026-05-23',
              evidence: 'TRACE-OUTSOURCING-FLANGE-20260521',
            },
          ],
          partnerName: '华东精密外协厂',
          promiseDate: '2026-05-23',
          affectedOrders: 'WO-DEMO-1013',
          sourceTraceId: 'TRACE-KPI-PRODUCT-FLANGE-OTD-20260521',
          createdAt: '2026-05-22T09:00:00.000Z',
        },
      ]))
    })
    await page.reload({ waitUntil: 'commit' })
    await page.waitForSelector('.admin-board', { timeout: 30000 })
    await page.getByRole('button', { name: 'Agent 治理' }).click()

    const panel = page.locator('.agent-governance-panel')
    await expect(panel.locator('.agent-metric').filter({ hasText: '外协承诺包' }).getByText('1 条 / 外协承诺待到货')).toBeVisible()
    const outsourcingCard = panel.locator('.outsourcing-governance-card').filter({ hasText: '法兰盘 DN100 外协承诺包' })
    await expect(outsourcingCard).toBeVisible()
    await expect(outsourcingCard.getByText('华东精密外协厂 / 2026-05-23')).toBeVisible()
    await expect(outsourcingCard.getByText('AUD-OUTSOURCING-COMMITMENT-FLANGE-20260521-001')).toBeVisible()
    await expect(outsourcingCard.getByText('TRACE-OUTSOURCING-FLANGE-20260521')).toBeVisible()
    await outsourcingCard.getByRole('button', { name: '查看采购协同' }).click()
    await expect(page).toHaveURL(/\/scheduling\/purchase$/)
    await page.goBack()
    await page.waitForSelector('.admin-board', { timeout: 30000 })
    await page.getByRole('button', { name: 'Agent 治理' }).click()
    await outsourcingCard.getByRole('button', { name: '查看 AI 排产' }).click()
    await expect(page).toHaveURL(/\/scheduling\/scheduling$/)
  })

  test('交期恢复执行包进入 Agent 治理并可跳转到排产风险采购与质量', async ({ page }) => {
    await page.evaluate(() => {
      localStorage.setItem('aimes_assistant_recovery_packages', JSON.stringify([
        {
          id: 'wo-rush-9001-delivery-recovery',
          title: 'WO-RUSH-9001 交期恢复执行包',
          auditCode: 'AUD-CHAT-RECOVERY-PACKAGE-20260521-001',
          traceId: 'TRACE-CHAT-RECOVERY-WO-RUSH-9001-20260521',
          actor: 'admin',
          role: 'Admin',
          workOrders: 'WO-RUSH-9001 / WO-DEMO-1002 / WO-2026-0042',
          priority: 'critical',
          owner: '生产经理审批',
          dueAt: '今日 15:30',
          scheduleWindow: '锁定期后第一个 CNC 空窗 + 夜班加班',
          scheduleAction: '保护 8h 锁定期，释放 M-AL-6061B 替代料复核，把 WO-RUSH-9001 插入 CNC-003 夜班窗口，并后移低优先级标准件。',
          riskImpact: '急单、缺料和 CNC-001 维护窗口叠加，若不处置会让 30 单样本从 96% 回落到 82% OTD。',
          riskSuggestion: '风险队列转生产经理审批，采购确认替代批次，调度员采纳锁定期后插入方案，质量保留首件复核。',
          otdImpact: '+14%',
          delayImpact: '-4 单延期风险',
          changeoverImpact: '+20min 可控',
          status: 'active',
          statusLabel: '质量动作已闭合',
          purchaseActionStatus: 'closed',
          purchaseActionAuditCode: 'AUD-CHAT-RECOVERY-PURCHASE-CLOSURE-20260521-001',
          purchaseActionTraceId: 'TRACE-CHAT-RECOVERY-PURCHASE-M-AL-6061-RECEIVED-20260521',
          purchaseActionSummary: '采购 王工 已确认 PO-RUSH-20260519 加急收货，M-AL-6061 齐套缺口清零，交期恢复执行包中的采购协同责任动作已闭合。',
          qualityActionStatus: 'closed',
          qualityActionAuditCode: 'AUD-CHAT-RECOVERY-QUALITY-CLOSURE-20260521-001',
          qualityActionTraceId: 'TRACE-CHAT-RECOVERY-QUALITY-FIRST-ARTICLE-20260521',
          qualityActionSummary: '质量工程师 周工 已确认 FAI-WO-RUSH-9001-OP20-20260521 首件检验合格，OP-20 装配扭矩复核窗口保留，交期恢复执行包中的质量闭环责任动作已闭合。',
          firstArticleRecord: 'FAI-WO-RUSH-9001-OP20-20260521',
          closureAuditCode: 'AUD-CHAT-RECOVERY-PACKAGE-CLOSURE-20260521-001',
          closureTraceId: 'TRACE-CHAT-RECOVERY-WO-RUSH-9001-CLOSED-20260521',
          closureSummary: '调度员 李工 已确认排产、风险、采购和质量四个责任动作完成交接，WO-RUSH-9001 恢复方案进入 OTD 复盘闭环。',
          closedAt: '2026-05-22T09:20:00.000Z',
          closedBy: '调度员 李工',
          summary: 'AI 生产助手把最高风险工单、缺料、设备维护和质量复核合并成一张可执行动作包，要求排产、采购、风险和质量同时回写证据。',
          dispatchSteps: [
            {
              module: 'AI 排产',
              owner: '调度员 李工',
              action: '生成锁定期后插入 + CNC-003 分流 + 夜班加班建议',
              evidence: 'TRACE-SCH-RECOVERY-WO-RUSH-9001',
              status: 'closed',
              result: '建议已采纳',
              closedAt: '2026-05-22T09:18:00.000Z',
            },
            {
              module: '风险预警',
              owner: '生产经理审批',
              action: '把急单、缺料、设备维护窗口升级为跨部门处置项',
              evidence: 'TRACE-RISK-RECOVERY-WO-RUSH-9001',
              status: 'closed',
              result: '风险已关闭',
              closedAt: '2026-05-22T09:18:10.000Z',
            },
            {
              module: '采购协同',
              owner: '采购 王工',
              action: '确认 M-AL-6061B 替代批次和到料承诺',
              evidence: 'TRACE-PO-RECOVERY-M-AL-6061B',
              status: 'closed',
              result: '到料闭合',
              closedAt: '2026-05-22T09:18:20.000Z',
            },
            {
              module: '质量闭环',
              owner: '质量工程师 周工',
              action: '保留替代料首件检验与 OP-20 装配扭矩复核窗口',
              evidence: 'TRACE-QA-RECOVERY-FIRST-ARTICLE',
              status: 'closed',
              result: '首件合格',
              closedAt: '2026-05-22T09:18:30.000Z',
            },
          ],
          createdAt: '2026-05-22T09:00:00.000Z',
        },
      ]))
    })
    await page.reload({ waitUntil: 'commit' })
    await page.waitForSelector('.admin-board', { timeout: 30000 })
    await page.getByRole('button', { name: 'Agent 治理' }).click()

    const panel = page.locator('.agent-governance-panel')
    await expect(panel.locator('.agent-metric').filter({ hasText: '交期恢复包' }).getByText('1 条 / 质量动作已闭合')).toBeVisible()
    const recoveryCard = panel.locator('.assistant-package-card').filter({ hasText: 'WO-RUSH-9001 交期恢复执行包' })
    await expect(recoveryCard).toBeVisible()
    await expect(recoveryCard.getByText('生产经理审批')).toBeVisible()
    await expect(recoveryCard.getByText('AUD-CHAT-RECOVERY-PACKAGE-20260521-001')).toBeVisible()
    await expect(recoveryCard.getByText('TRACE-CHAT-RECOVERY-WO-RUSH-9001-CLOSED-20260521')).toBeVisible()
    await expect(recoveryCard.getByText('采购责任动作')).toBeVisible()
    await expect(recoveryCard.getByText('质量责任动作')).toBeVisible()
    await recoveryCard.getByRole('button', { name: '查看 AI 排产' }).click()
    await expect(page).toHaveURL(/\/scheduling\/scheduling$/)
    await page.goBack()
    await page.waitForSelector('.admin-board', { timeout: 30000 })
    await page.getByRole('button', { name: 'Agent 治理' }).click()
    await recoveryCard.getByRole('button', { name: '查看风险预警' }).click()
    await expect(page).toHaveURL(/\/scheduling\/risk$/)
    await page.goBack()
    await page.waitForSelector('.admin-board', { timeout: 30000 })
    await page.getByRole('button', { name: 'Agent 治理' }).click()
    await recoveryCard.getByRole('button', { name: '查看采购协同' }).click()
    await expect(page).toHaveURL(/\/scheduling\/purchase$/)
    await page.goBack()
    await page.waitForSelector('.admin-board', { timeout: 30000 })
    await page.getByRole('button', { name: 'Agent 治理' }).click()
    await recoveryCard.getByRole('button', { name: '查看质量闭环' }).click()
    await expect(page).toHaveURL(/\/scheduling\/quality$/)
  })

  test('客户 POC 证据进入 Agent 治理批次与审计编号', async ({ page }) => {
    await page.evaluate(() => {
      localStorage.setItem('aimes_customer_order_import', JSON.stringify({
        batchId: 'IMP-POC-WO-20260520-001',
        fileName: '客户真实工单导入样例_30单.csv',
        source: '客户 IT / ERP 导出样例',
        importedOrders: 30,
        highRiskOrders: 6,
        mappedFields: ['工单号', '产品', '交期', '工艺路线', '物料缺口', '设备约束'],
        preparedAt: '2026-05-20T09:30:00.000Z',
      }))
      localStorage.setItem('aimes_customer_equipment_fault_evidence', JSON.stringify({
        batchId: 'IMP-POC-EQ-FAULT-20260520-001',
        fileName: '客户真实设备故障样例_CNC-001.csv',
        source: '客户设备联网平台 / 点检历史导出',
        equipmentCode: 'CNC-001',
        faultSamples: 12,
        affectedOrders: 'WO-2026-0042 / WO-RUSH-9001 / WO-DEMO-1001',
        downtimeHours: 4,
        capturedSignals: ['主轴振动', '轴承温度', '停机时长', '维修工单', '影响工单'],
        preparedAt: '2026-05-20T09:35:00.000Z',
      }))
    })
    await page.reload({ waitUntil: 'commit' })
    await page.waitForSelector('.admin-board', { timeout: 30000 })
    await page.getByRole('button', { name: 'Agent 治理' }).click()

    const panel = page.locator('.agent-governance-panel')
    await expect(panel.getByRole('heading', { name: '客户 POC 证据治理' })).toBeVisible()
    await expect(panel.getByText('客户工单导入样例治理')).toBeVisible()
    await expect(panel.getByText('客户设备故障样例治理')).toBeVisible()
    await expect(panel.getByText('IMP-POC-WO-20260520-001')).toBeVisible()
    await expect(panel.getByText('IMP-POC-EQ-FAULT-20260520-001')).toBeVisible()
    await expect(panel.getByText('AUD-POC-WO-001')).toBeVisible()
    await expect(panel.getByText('AUD-POC-EQ-001')).toBeVisible()
  })

  test('OTD 复盘证据进入 Agent 治理清单', async ({ page }) => {
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
          summary: '10 件完工，工单进度更新为 100%，质检结果 Pass。',
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
    await page.waitForSelector('.admin-board', { timeout: 30000 })
    await page.getByRole('button', { name: 'Agent 治理' }).click()

    const panel = page.locator('.agent-governance-panel')
    await expect(panel.locator('.agent-metric').filter({ hasText: 'OTD 复盘证据' }).getByText('3')).toBeVisible()
    await expect(panel.getByRole('heading', { name: 'OTD 复盘证据治理' })).toBeVisible()
    const otdLane = panel.locator('.otd-evidence-governance')
    await expect(otdLane.getByText('M-AL-6061 加急采购收货已释放缺料风险')).toBeVisible()
    await expect(otdLane.getByText('CNC-001 停机窗口已同步重排')).toBeVisible()
    await expect(otdLane.getByText('WO-DEMO-1001 CNC 精加工 完工回写')).toBeVisible()
    await expect(otdLane.getByText('TRACE-PROD-COMPLETE-OP-020')).toBeVisible()
  })

  test('异常分流进入 Agent 治理并可跳转异常风险排产和质量', async ({ page }) => {
    await page.goto('anomaly', { waitUntil: 'commit' })
    await page.waitForSelector('.anomaly-board', { timeout: 30000 })
    const qualityLane = page.locator('.event-center .event-lane').filter({ hasText: '装配间隙超差' })
    await qualityLane.getByRole('button', { name: '确认分流' }).click()
    await expect(page.locator('.dispatch-trace').getByText('TRACE-ANOMALY-DISPATCH-QUALITY-GAP-20260521')).toBeVisible()

    await page.goto('admin', { waitUntil: 'commit' })
    await page.waitForSelector('.admin-board', { timeout: 30000 })
    await page.getByRole('button', { name: 'Agent 治理' }).click()

    const panel = page.locator('.agent-governance-panel')
    await expect(panel.locator('.agent-metric').filter({ hasText: '异常分流治理' }).getByText('1 条 / 1 待下游闭环')).toBeVisible()
    const governance = panel.locator('.anomaly-dispatch-governance')
    await expect(governance.getByRole('heading', { name: '异常分流治理' })).toBeVisible()
    const card = governance.locator('.anomaly-dispatch-card').filter({ hasText: '装配间隙超差已分流到质量返工与排产复核' })
    await expect(card.locator('.action-topline span').getByText('质量异常', { exact: true })).toBeVisible()
    await expect(card.getByText('质量分流已确认')).toBeVisible()
    await expect(card.locator('.policy-row').filter({ hasText: '影响工单' }).getByText('WO-20260502 / WO-RUSH-9001')).toBeVisible()
    await expect(card.locator('.policy-row').filter({ hasText: '责任人' }).getByText('质量工程师 周工 / 今日 15:00')).toBeVisible()
    await expect(card.locator('.policy-row').filter({ hasText: '分流路径' }).getByText('异常管理 -> 质量闭环 -> AI 排产 -> OTD 复盘')).toBeVisible()
    await expect(card.locator('.policy-row').filter({ hasText: '追踪编号' }).getByText('TRACE-ANOMALY-DISPATCH-QUALITY-GAP-20260521')).toBeVisible()

    await card.getByRole('button', { name: '查看异常中心' }).click()
    await page.waitForURL(/\/scheduling\/anomaly$/)
    await expect(page.locator('.anomaly-board')).toBeVisible()

    await page.goto('admin', { waitUntil: 'commit' })
    await page.waitForSelector('.admin-board', { timeout: 30000 })
    await page.getByRole('button', { name: 'Agent 治理' }).click()
    const riskCard = page.locator('.anomaly-dispatch-card').filter({ hasText: '装配间隙超差已分流到质量返工与排产复核' })
    await riskCard.getByRole('button', { name: '查看风险预警' }).click()
    await page.waitForURL(/\/scheduling\/risk$/)
    await expect(page.locator('.risk-board')).toBeVisible()

    await page.goto('admin', { waitUntil: 'commit' })
    await page.waitForSelector('.admin-board', { timeout: 30000 })
    await page.getByRole('button', { name: 'Agent 治理' }).click()
    const schedulingCard = page.locator('.anomaly-dispatch-card').filter({ hasText: '装配间隙超差已分流到质量返工与排产复核' })
    await schedulingCard.getByRole('button', { name: '查看 AI 排产' }).click()
    await page.waitForURL(/\/scheduling\/scheduling$/)
    await expect(page.locator('.schedule-board')).toBeVisible()

    await page.goto('admin', { waitUntil: 'commit' })
    await page.waitForSelector('.admin-board', { timeout: 30000 })
    await page.getByRole('button', { name: 'Agent 治理' }).click()
    const qualityCard = page.locator('.anomaly-dispatch-card').filter({ hasText: '装配间隙超差已分流到质量返工与排产复核' })
    await qualityCard.getByRole('button', { name: '查看质量闭环' }).click()
    await page.waitForURL(/\/scheduling\/quality$/)
    await expect(page.locator('.quality-board')).toBeVisible()
  })

  test('工程变更 ECN 进入 Agent 治理并可跳转 BOM 排产报表和审计', async ({ page }) => {
    await page.goto('bom', { waitUntil: 'commit' })
    await page.waitForSelector('.bom-board', { timeout: 30000 })
    await page.locator('.list-item').filter({ hasText: 'BOM-A100' }).click()
    const impact = page.locator('.change-impact')
    await impact.getByRole('button', { name: '生成影响分析' }).click()
    await impact.getByRole('button', { name: '批准 ECN 放行' }).click()
    await expect(impact.getByText('AUD-ENG-ECN-20260521-APPROVE')).toBeVisible()

    await page.goto('admin', { waitUntil: 'commit' })
    await page.waitForSelector('.admin-board', { timeout: 30000 })
    await page.getByRole('button', { name: 'Agent 治理' }).click()

    const panel = page.locator('.agent-governance-panel')
    await expect(panel.locator('.agent-metric').filter({ hasText: '工程变更治理' }).getByText('1 条 / 已批准')).toBeVisible()
    const governance = panel.locator('.engineering-change-governance')
    await expect(governance.getByRole('heading', { name: '工程变更治理' })).toBeVisible()
    const card = governance.locator('.engineering-change-card').filter({ hasText: 'ECN-BOM-A100-6061B-20260521' })
    await expect(card.locator('.action-topline span').getByText('ECN-BOM-A100-6061B-20260521', { exact: true })).toBeVisible()
    await expect(card.getByText('已批准')).toBeVisible()
    await expect(card.getByText('M-AL-6061B 替代 M-AL-6061 工程变更影响分析')).toBeVisible()
    await expect(card.locator('.policy-row').filter({ hasText: '影响工单' }).getByText('WO-RUSH-9001 / WO-DEMO-1002 / WO-DEMO-1005')).toBeVisible()
    await expect(card.locator('.policy-row').filter({ hasText: '库存影响' }).getByText(/M-AL-6061 当前缺口 19 件/)).toBeVisible()
    await expect(card.locator('.policy-row').filter({ hasText: '质量门' }).getByText(/OP-040 扭矩检验/)).toBeVisible()
    await expect(card.locator('.policy-row').filter({ hasText: 'OTD 影响' }).getByText('Agent 模拟 OTD +7%，预计减少 1 单延期风险。')).toBeVisible()
    await expect(card.locator('.policy-row').filter({ hasText: '审批审计' }).getByText('AUD-ENG-ECN-20260521-APPROVE')).toBeVisible()
    await expect(card.locator('.policy-row').filter({ hasText: '追踪编号' }).getByText('TRACE-ENG-ECN-BOM-A100-6061B')).toBeVisible()

    await card.getByRole('button', { name: '查看 BOM 约束' }).click()
    await page.waitForURL(/\/scheduling\/bom$/)
    await expect(page.locator('.bom-board')).toBeVisible()

    await page.goto('admin', { waitUntil: 'commit' })
    await page.waitForSelector('.admin-board', { timeout: 30000 })
    await page.getByRole('button', { name: 'Agent 治理' }).click()
    const schedulingCard = page.locator('.engineering-change-card').filter({ hasText: 'ECN-BOM-A100-6061B-20260521' })
    await schedulingCard.getByRole('button', { name: '查看 AI 排产' }).click()
    await page.waitForURL(/\/scheduling\/scheduling$/)
    await expect(page.locator('.schedule-board')).toBeVisible()

    await page.goto('admin', { waitUntil: 'commit' })
    await page.waitForSelector('.admin-board', { timeout: 30000 })
    await page.getByRole('button', { name: 'Agent 治理' }).click()
    const reportCard = page.locator('.engineering-change-card').filter({ hasText: 'ECN-BOM-A100-6061B-20260521' })
    await reportCard.getByRole('button', { name: '查看 OTD 报告' }).click()
    await page.waitForURL(/\/scheduling\/report$/)
    await expect(page.locator('.report-board')).toBeVisible()

    await page.goto('admin', { waitUntil: 'commit' })
    await page.waitForSelector('.admin-board', { timeout: 30000 })
    await page.getByRole('button', { name: 'Agent 治理' }).click()
    const auditCard = page.locator('.engineering-change-card').filter({ hasText: 'ECN-BOM-A100-6061B-20260521' })
    await auditCard.getByRole('button', { name: '查看审计回放' }).click()
    await page.waitForURL(/\/scheduling\/audit-logs$/)
    await expect(page.locator('.audit-board')).toBeVisible()
  })

  test('缺料齐套证据进入 Agent 治理并可跳转库存排产采购和 BOM', async ({ page }) => {
    await page.goto('inventory', { waitUntil: 'commit' })
    await page.waitForSelector('.inv-board', { timeout: 30000 })
    const kittingPanel = page.locator('.kitting-panel')
    await kittingPanel.locator('.order-card').filter({ hasText: 'WO-RUSH-9001' }).getByRole('button', { name: '生成缺料排产事件' }).click()
    await expect(kittingPanel.getByText('缺料事件已同步 AI 排产')).toBeVisible()

    await page.goto('admin', { waitUntil: 'commit' })
    await page.waitForSelector('.admin-board', { timeout: 30000 })
    await page.getByRole('button', { name: 'Agent 治理' }).click()

    const panel = page.locator('.agent-governance-panel')
    await expect(panel.locator('.agent-metric').filter({ hasText: '缺料齐套治理' }).getByText('1 待处理 / 1 条')).toBeVisible()
    const governance = panel.locator('.kitting-governance')
    await expect(governance.getByRole('heading', { name: '缺料齐套治理' })).toBeVisible()
    await expect(governance.getByText('1 待处理 / 1 条')).toBeVisible()
    const card = governance.locator('.kitting-governance-card').filter({ hasText: 'M-AL-6061 工单齐套缺口已进入排产复核' })
    await expect(card.getByText('待齐套')).toBeVisible()
    await expect(card.locator('.policy-row').filter({ hasText: '影响对象' }).getByText('WO-RUSH-9001', { exact: true })).toBeVisible()
    await expect(card.locator('.policy-row').filter({ hasText: '来源' }).getByText('库存齐套 / BOM-A100 V1.0', { exact: true })).toBeVisible()
    await expect(card.locator('.policy-row').filter({ hasText: '追踪编号' }).getByText('TRACE-KIT-WO-RUSH-9001-M-AL-6061', { exact: true })).toBeVisible()

    await card.getByRole('button', { name: '查看库存齐套' }).click()
    await page.waitForURL(/\/scheduling\/inventory$/)
    await expect(page.locator('.kitting-panel')).toBeVisible()

    await page.goto('admin', { waitUntil: 'commit' })
    await page.waitForSelector('.admin-board', { timeout: 30000 })
    await page.getByRole('button', { name: 'Agent 治理' }).click()
    const schedulingCard = page.locator('.kitting-governance-card').filter({ hasText: 'M-AL-6061 工单齐套缺口已进入排产复核' })
    await schedulingCard.getByRole('button', { name: '查看 AI 排产' }).click()
    await page.waitForURL(/\/scheduling\/scheduling$/)
    await expect(page.locator('.schedule-board')).toBeVisible()

    await page.goto('admin', { waitUntil: 'commit' })
    await page.waitForSelector('.admin-board', { timeout: 30000 })
    await page.getByRole('button', { name: 'Agent 治理' }).click()
    const purchaseCard = page.locator('.kitting-governance-card').filter({ hasText: 'M-AL-6061 工单齐套缺口已进入排产复核' })
    await purchaseCard.getByRole('button', { name: '查看采购协同' }).click()
    await page.waitForURL(/\/scheduling\/purchase$/)
    await expect(page.locator('.po-board')).toBeVisible()

    await page.goto('admin', { waitUntil: 'commit' })
    await page.waitForSelector('.admin-board', { timeout: 30000 })
    await page.getByRole('button', { name: 'Agent 治理' }).click()
    const bomCard = page.locator('.kitting-governance-card').filter({ hasText: 'M-AL-6061 工单齐套缺口已进入排产复核' })
    await bomCard.getByRole('button', { name: '查看 BOM 约束' }).click()
    await page.waitForURL(/\/scheduling\/bom$/)
    await expect(page.locator('.bom-board')).toBeVisible()
  })

  test('质量返工事件进入 Agent 治理并可跳转质量排产和报表', async ({ page }) => {
    await page.goto('quality', { waitUntil: 'commit' })
    await page.waitForSelector('.quality-board', { timeout: 30000 })
    const qualityPanel = page.locator('.quality-rework-panel')
    await qualityPanel.getByRole('button', { name: '生成返工排产事件' }).click()
    await expect(qualityPanel.getByText(/返工排产事件已生成/)).toBeVisible()

    await page.goto('admin', { waitUntil: 'commit' })
    await page.waitForSelector('.admin-board', { timeout: 30000 })
    await page.getByRole('button', { name: 'Agent 治理' }).click()

    const panel = page.locator('.agent-governance-panel')
    await expect(panel.locator('.agent-metric').filter({ hasText: '质量返工治理' }).getByText('1 条 / 待排产复核')).toBeVisible()
    const governance = panel.locator('.quality-rework-governance')
    await expect(governance.getByRole('heading', { name: '质量返工治理' })).toBeVisible()
    const card = governance.locator('.quality-rework-governance-card').filter({ hasText: 'INS-003 / WO-003' })
    await expect(card.getByText('待排产复核')).toBeVisible()
    await expect(card.getByText('热处理 硬度检测返工')).toBeVisible()
    await expect(card.locator('.policy-row').filter({ hasText: '返工窗口' }).getByText('2 件 / 6h')).toBeVisible()
    await expect(card.locator('.policy-row').filter({ hasText: '关联对象' }).getByText('HT-01 / MAT-AL6061-B03')).toBeVisible()
    await expect(card.locator('.policy-row').filter({ hasText: '批次号' }).getByText('WO-003-硬度检测')).toBeVisible()
    await expect(card.locator('.policy-row').filter({ hasText: 'OTD 影响' }).getByText('WO-003 延期 +1 单风险')).toBeVisible()
    await expect(card.locator('.policy-row').filter({ hasText: '根因证据' }).getByText('硬度不足 / 热处理参数漂移')).toBeVisible()

    await card.getByRole('button', { name: '查看质量闭环' }).click()
    await page.waitForURL(/\/scheduling\/quality$/)
    await expect(page.locator('.quality-board')).toBeVisible()

    await page.goto('admin', { waitUntil: 'commit' })
    await page.waitForSelector('.admin-board', { timeout: 30000 })
    await page.getByRole('button', { name: 'Agent 治理' }).click()
    const schedulingCard = page.locator('.quality-rework-governance-card').filter({ hasText: 'INS-003 / WO-003' })
    await schedulingCard.getByRole('button', { name: '查看 AI 排产' }).click()
    await page.waitForURL(/\/scheduling\/scheduling$/)
    await expect(page.locator('.schedule-board')).toBeVisible()

    await page.goto('admin', { waitUntil: 'commit' })
    await page.waitForSelector('.admin-board', { timeout: 30000 })
    await page.getByRole('button', { name: 'Agent 治理' }).click()
    const reportCard = page.locator('.quality-rework-governance-card').filter({ hasText: 'INS-003 / WO-003' })
    await reportCard.getByRole('button', { name: '查看 OTD 报告' }).click()
    await page.waitForURL(/\/scheduling\/report$/)
    await expect(page.locator('.report-board')).toBeVisible()
    await expect(page.locator('.quality-rework-report').getByText('WO-003 返工对 OTD 的影响')).toBeVisible()
  })

  test('生产完工执行证据进入 Agent 治理并可跳转生产排产和报表', async ({ page }) => {
    await page.goto('production', { waitUntil: 'commit' })
    await page.waitForSelector('.production-board', { timeout: 30000 })
    await page.locator('.wo-card').first().click()
    await page.locator('.op-btn.complete').first().click()
    await expect(page.getByText('完工报告')).toBeVisible()
    await expect(page.locator('.dialog-confirm')).toBeEnabled()
    await page.locator('.dialog-confirm').click()
    await expect(page.locator('.execution-trace-panel').getByText(/完工复核已提交/)).toBeVisible()

    await page.goto('admin', { waitUntil: 'commit' })
    await page.waitForSelector('.admin-board', { timeout: 30000 })
    await page.getByRole('button', { name: 'Agent 治理' }).click()

    const panel = page.locator('.agent-governance-panel')
    await expect(panel.locator('.agent-metric').filter({ hasText: '生产执行治理' }).getByText('2 条 / 2 待复核')).toBeVisible()
    const governance = panel.locator('.production-execution-governance')
    await expect(governance.getByRole('heading', { name: '生产执行治理' })).toBeVisible()
    const completionCard = governance.locator('.production-execution-card').filter({ hasText: '完工回写' })
    await expect(completionCard.locator('.action-topline span').getByText('生产完工', { exact: true })).toBeVisible()
    await expect(completionCard.getByText('OTD 风险')).toBeVisible()
    await expect(completionCard.getByText(/质检结果 Pass/)).toBeVisible()
    await expect(completionCard.locator('.policy-row').filter({ hasText: '来源' }).getByText('生产报工 / admin')).toBeVisible()
    await expect(completionCard.locator('.policy-row').filter({ hasText: '追踪编号' }).getByText(/TRACE-PROD-COMPLETE-/)).toBeVisible()
    const reviewCard = governance.locator('.production-execution-card').filter({ hasText: '完工复核' })
    await expect(reviewCard.locator('.action-topline span').getByText('生产复核', { exact: true })).toBeVisible()
    await expect(reviewCard.getByText('OTD 风险待复核')).toBeVisible()

    await completionCard.getByRole('button', { name: '查看生产报工' }).click()
    await page.waitForURL(/\/scheduling\/production$/)
    await expect(page.locator('.production-board')).toBeVisible()

    await page.goto('admin', { waitUntil: 'commit' })
    await page.waitForSelector('.admin-board', { timeout: 30000 })
    await page.getByRole('button', { name: 'Agent 治理' }).click()
    const schedulingCard = page.locator('.production-execution-card').filter({ hasText: '完工回写' })
    await schedulingCard.getByRole('button', { name: '查看 AI 排产' }).click()
    await page.waitForURL(/\/scheduling\/scheduling$/)
    await expect(page.locator('.schedule-board')).toBeVisible()

    await page.goto('admin', { waitUntil: 'commit' })
    await page.waitForSelector('.admin-board', { timeout: 30000 })
    await page.getByRole('button', { name: 'Agent 治理' }).click()
    const reportCard = page.locator('.production-execution-card').filter({ hasText: '完工回写' })
    await reportCard.getByRole('button', { name: '查看 OTD 报告' }).click()
    await page.waitForURL(/\/scheduling\/report$/)
    const reportEvidence = page.locator('.otd-evidence-chain .evidence-chain-card').filter({ hasText: '完工回写' })
    await expect(reportEvidence.locator('.evidence-topline span').getByText('生产完工', { exact: true })).toBeVisible()
    await expect(reportEvidence.getByText(/TRACE-PROD-COMPLETE-/)).toBeVisible()
  })

  test('POC 复盘签署进入 Agent 治理与审计编号', async ({ page }) => {
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
    })
    await page.reload({ waitUntil: 'commit' })
    await page.waitForSelector('.admin-board', { timeout: 30000 })
    await page.getByRole('button', { name: 'Agent 治理' }).click()

    const panel = page.locator('.agent-governance-panel')
    await expect(panel.locator('.agent-metric').filter({ hasText: 'POC 复盘签署' }).getByText('已签署')).toBeVisible()
    const signoffCard = panel.locator('.poc-evidence-card.signoff')
    await expect(signoffCard.getByText('POC 复盘会评分表治理')).toBeVisible()
    await expect(signoffCard.getByText('POC-REVIEW-20260520-001')).toBeVisible()
    await expect(signoffCard.getByText('AUD-POC-REVIEW-20260520')).toBeVisible()
    await expect(signoffCard.getByText('IMP-POC-WO-20260520-001 / IMP-POC-EQ-FAULT-20260520-001')).toBeVisible()
  })

  test('知识治理复核进入 Agent 治理来源清单', async ({ page }) => {
    await page.evaluate(() => {
      localStorage.setItem('aimes_knowledge_governance_reviews', JSON.stringify([
        {
          id: 'knowledge-governance-review-kg-equipment-cnc-maint',
          documentId: 'kg-equipment-cnc-maint',
          documentTitle: 'CNC-01 主轴维护手册',
          version: 'V1.1',
          reviewedVersion: 'V1.2',
          validUntil: '2026-12-31',
          reviewer: '设备主管 / 知识库管理员',
          reviewedAt: '2026-05-20T12:10:00.000Z',
          auditId: 'AUD-KG-REINDEX-20260520-001',
          traceId: 'TRACE-KG-CNC-MAINT-REINDEX',
          action: '复核有效期并重建 RAG 索引',
          status: 'approved',
          summary: 'CNC-01 主轴维护手册已由设备主管复核，升级为 V1.2 并完成分块索引，可作为设备停机影响问答的正式引用来源。',
          references: ['AI 生产助手', '设备维护', '风险预警', 'AI 排产'],
        },
      ]))
    })
    await page.reload({ waitUntil: 'commit' })
    await page.waitForSelector('.admin-board', { timeout: 30000 })
    await page.getByRole('button', { name: 'Agent 治理' }).click()

    const panel = page.locator('.agent-governance-panel')
    await expect(panel.locator('.agent-metric').filter({ hasText: '知识复核' }).getByText('1')).toBeVisible()
    await expect(panel.getByRole('heading', { name: '知识来源治理' })).toBeVisible()
    const knowledgeCard = panel.locator('.knowledge-review-card')
    await expect(knowledgeCard.getByText('CNC-01 主轴维护手册', { exact: true })).toBeVisible()
    await expect(knowledgeCard.getByText('V1.1 -> V1.2')).toBeVisible()
    await expect(knowledgeCard.getByText('AUD-KG-REINDEX-20260520-001')).toBeVisible()
    await expect(knowledgeCard.getByText('AI 生产助手 / 设备维护 / 风险预警 / AI 排产')).toBeVisible()
  })

  test('知识待治理提醒可从 Agent 治理跳转到文档治理', async ({ page }) => {
    await page.getByRole('button', { name: 'Agent 治理' }).click()

    const panel = page.locator('.agent-governance-panel')
    await expect(panel.locator('.agent-metric').filter({ hasText: '知识待治理' }).getByText('2')).toBeVisible()
    const governanceLane = panel.locator('.knowledge-governance-lane')
    await expect(governanceLane.getByText('2 待治理 / 0 已复核')).toBeVisible()
    const maintenanceCard = governanceLane.locator('.knowledge-pending-card').filter({ hasText: 'CNC-01 主轴维护手册' })
    await expect(maintenanceCard.getByText('已过期')).toBeVisible()
    await expect(maintenanceCard.getByText('待索引')).toBeVisible()
    await expect(maintenanceCard.getByText('设备维护 / 风险预警 / AI 排产')).toBeVisible()
    await expect(maintenanceCard.getByText(/复核有效期并重建 RAG 索引/)).toBeVisible()
    const torqueCard = governanceLane.locator('.knowledge-pending-card').filter({ hasText: '装配扭矩检验规范' })
    await expect(torqueCard.getByText('即将过期')).toBeVisible()
    await expect(torqueCard.getByText('已索引')).toBeVisible()
    await expect(torqueCard.getByText(/到期前复核检验窗口和复验规则/)).toBeVisible()

    await governanceLane.getByRole('button', { name: '打开文档治理' }).click()
    await page.waitForURL(/\/scheduling\/knowledge\/documents$/)
    await expect(page.locator('.upload-page')).toBeVisible()
    await expect(page.locator('.knowledge-governance-panel')).toBeVisible()
    await expect(page.locator('.knowledge-governance-panel').getByRole('heading', { name: 'CNC-01 主轴维护手册' })).toBeVisible()
  })

  test('质量知识低分复核规则进入 Agent 策略治理', async ({ page }) => {
    await page.evaluate(() => {
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
          createdAt: '2026-05-21T10:30:00.000Z',
          status: 'closed',
          statusLabel: '直接复用已禁用',
          effectScore: 61,
          reviewActions: ['复核 OP-20 装配扭矩偏移是否属于扫码返工样本的有效泛化范围。'],
          closedAt: '2026-05-21T10:45:00.000Z',
          decisionAuditId: 'AUD-KG-QA-LOW-SCORE-DECISION-20260521-001',
          decisionTraceId: 'TRACE-KG-QA-WO-DEMO-1018-OP-20-LOW-SCORE-DECISION',
          decisionLabel: '禁用直接复用',
          decisionSummary: '人工复核确认 OP-20 装配扭矩偏移与 CNC 扫码返工样本不属于同一泛化族，禁止 AI 助手把该低分候选作为直接 CAPA 推荐。',
          disabledReuseRule: 'matchScore < 70 或跨工序缺陷模式不一致时，只能进入复核/再训练队列，不能进入优先推荐。',
          retrainingTraceId: 'TRACE-KG-QA-WO-DEMO-1018-OP-20-RETRAINING-CANDIDATE',
          retrainingPlan: ['把本次 61 分低分尝试作为负样本，降低跨工序扫码返工样本的召回权重。'],
        },
      ]))
    })
    await page.reload({ waitUntil: 'commit' })
    await page.waitForSelector('.admin-board', { timeout: 30000 })
    await page.getByRole('button', { name: 'Agent 治理' }).click()

    const panel = page.locator('.agent-governance-panel')
    await expect(panel.locator('.agent-metric').filter({ hasText: '质量策略规则' }).getByText('1')).toBeVisible()
    await expect(panel.getByRole('heading', { name: '质量知识策略治理' })).toBeVisible()
    const policyCard = panel.locator('.quality-policy-card')
    await expect(policyCard.getByText('WO-DEMO-1018 OP-20 复用策略治理')).toBeVisible()
    await expect(policyCard.getByText('复用效果阈值 >= 70 分')).toBeVisible()
    await expect(policyCard.getByText(/禁止 AI 助手把该低分候选作为直接 CAPA 推荐/)).toBeVisible()
    await expect(policyCard.getByText('matchScore < 70 或跨工序缺陷模式不一致时，只能进入复核/再训练队列，不能进入优先推荐。')).toBeVisible()
    await expect(policyCard.getByText('AUD-KG-QA-LOW-SCORE-DECISION-20260521-001')).toBeVisible()
    await expect(policyCard.getByText('TRACE-KG-QA-WO-DEMO-1018-OP-20-RETRAINING-CANDIDATE')).toBeVisible()
    const executionPolicy = panel.locator('.policy-block').filter({ hasText: '执行策略' })
    await expect(executionPolicy.getByText('质量复用低分阈值')).toBeVisible()
    await expect(executionPolicy.getByText('70 分')).toBeVisible()
    await expect(executionPolicy.getByText('禁用直接复用 + 再训练候选')).toBeVisible()
  })

  test('质量再训练版本进入 Agent 治理监管', async ({ page }) => {
    await page.evaluate(() => {
      localStorage.setItem('aimes_quality_knowledge_retraining_versions', JSON.stringify([
        {
          id: 'quality-retraining-version-quality-knowledge-review-low-score-wo-demo-1018-op-20',
          sourceReviewQueueId: 'quality-knowledge-review-low-score-wo-demo-1018-op-20',
          targetWorkOrderId: 'WO-DEMO-1018',
          operationCode: 'OP-20',
          candidateTraceId: 'TRACE-KG-QA-WO-DEMO-1018-OP-20-RETRAINING-CANDIDATE',
          trainingSetVersion: 'QK-TRAIN-20260521-R2',
          trainingSetName: '装配扭矩偏移 CAPA 再训练样本集',
          status: 'validation_failed',
          statusLabel: '发布前校验未通过',
          approvedBy: '知识库管理员 / 质量主管 刘工',
          approvedAt: '2026-05-21T12:00:00.000Z',
          approvalAuditId: 'AUD-KG-QA-RETRAINING-APPROVAL-20260521-001',
          approvalTraceId: 'TRACE-KG-QA-WO-DEMO-1018-OP-20-RETRAINING-APPROVED',
          positiveSampleCount: 18,
          negativeSampleCount: 3,
          featurePolicy: '工序、设备族、缺陷模式、验证效果分必须同时参与召回排序，跨工序低分样本作为负样本降权。',
          changeSummary: [
            '新增 OP-20 装配扭矩偏移独立 CAPA 正样本。',
            '纳入 WO-DEMO-1018 低分复用尝试作为负样本。',
            '把 70 分复用效果阈值固化为训练集准入门槛。',
          ],
          validationGates: [
            '离线 Top-3 召回不得推荐跨工序扫码返工样本。',
            '低分负样本召回权重下降 >= 30%。',
            '训练集发布前保留 QK-TRAIN-20260521-R1 回滚目标。',
          ],
          validationStatus: 'failed',
          validatedAt: '2026-05-21T12:20:00.000Z',
          validationAuditId: 'AUD-KG-QA-RETRAINING-VALIDATION-20260521-001',
          validationTraceId: 'TRACE-KG-QA-WO-DEMO-1018-OP-20-RETRAINING-VALIDATION-FAILED',
          validationSummary: '发布前抽检发现 OP-20 扭矩工具校准字段缺失，训练集暂不能发布到 AI 推荐链路。',
          validationFindings: [
            'OP-20 扭矩工具校准字段缺失。',
            '离线 Top-3 召回仍需补充扭矩工具族特征。',
            '发布前必须保留 QK-TRAIN-20260521-R1 回滚目标。',
          ],
          rollbackTargetVersion: 'QK-TRAIN-20260521-R1',
        },
      ]))
    })
    await page.reload({ waitUntil: 'commit' })
    await page.waitForSelector('.admin-board', { timeout: 30000 })
    await page.getByRole('button', { name: 'Agent 治理' }).click()

    const panel = page.locator('.agent-governance-panel')
    await expect(panel.locator('.agent-metric').filter({ hasText: '再训练版本' }).getByText('1')).toBeVisible()
    await expect(panel.getByRole('heading', { name: '质量再训练版本治理' })).toBeVisible()
    const retrainingLane = panel.locator('.quality-retraining-governance')
    const versionCard = retrainingLane.locator('.quality-retraining-card')
    await expect(versionCard.getByText('QK-TRAIN-20260521-R2 装配扭矩偏移 CAPA 再训练样本集')).toBeVisible()
    await expect(versionCard.getByText('发布前校验未通过')).toBeVisible()
    await expect(versionCard.getByText('正样本 18 条 / 负样本 3 条')).toBeVisible()
    await expect(versionCard.getByText('AUD-KG-QA-RETRAINING-VALIDATION-20260521-001')).toBeVisible()
    await expect(versionCard.getByText('TRACE-KG-QA-WO-DEMO-1018-OP-20-RETRAINING-VALIDATION-FAILED')).toBeVisible()
    await expect(versionCard.locator('.policy-row').filter({ hasText: '回滚目标' }).getByText('QK-TRAIN-20260521-R1', { exact: true })).toBeVisible()
    await expect(versionCard.locator('.policy-row').filter({ hasText: '校验门' }).getByText(/OP-20 扭矩工具校准字段缺失/)).toBeVisible()
    const executionPolicy = panel.locator('.policy-block').filter({ hasText: '执行策略' })
    await expect(executionPolicy.getByText('质量再训练版本')).toBeVisible()
    await expect(executionPolicy.getByText('QK-TRAIN-20260521-R2 / 发布前校验未通过')).toBeVisible()
  })

  test('已发布质量再训练版本进入 Agent 推荐治理', async ({ page }) => {
    await page.evaluate(() => {
      localStorage.setItem('aimes_quality_knowledge_retraining_versions', JSON.stringify([
        {
          id: 'quality-retraining-version-quality-knowledge-review-low-score-wo-demo-1018-op-20',
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
          featurePolicy: '工序、设备族、缺陷模式、验证效果分必须同时参与召回排序，跨工序低分样本作为负样本降权。',
          changeSummary: [
            '新增 OP-20 装配扭矩偏移独立 CAPA 正样本。',
            '纳入 WO-DEMO-1018 低分复用尝试作为负样本。',
            '把 70 分复用效果阈值固化为训练集准入门槛。',
          ],
          validationGates: [
            '离线 Top-3 召回不得推荐跨工序扫码返工样本。',
            '低分负样本召回权重下降 >= 30%。',
            '训练集发布前保留 QK-TRAIN-20260521-R1 回滚目标。',
          ],
          validationStatus: 'passed',
          validatedAt: '2026-05-21T12:30:00.000Z',
          validationAuditId: 'AUD-KG-QA-RETRAINING-VALIDATION-PASS-20260521-001',
          validationTraceId: 'TRACE-KG-QA-WO-DEMO-1018-OP-20-RETRAINING-VALIDATION-PASSED',
          validationSummary: 'OP-20 扭矩工具校准字段已补齐，离线 Top-3 召回不再推荐跨工序扫码返工样本，训练集可进入受控发布。',
          validationFindings: [
            '扭矩工具校准字段覆盖率 100%。',
            '低分负样本召回权重下降 36%。',
            '离线 Top-3 未命中跨工序扫码返工样本。',
          ],
          publishedAt: '2026-05-21T12:40:00.000Z',
          publishAuditId: 'AUD-KG-QA-RETRAINING-PUBLISH-20260521-001',
          publishTraceId: 'TRACE-KG-QA-WO-DEMO-1018-OP-20-RETRAINING-PUBLISHED',
          publishSummary: '训练集版本通过发布前校验后进入质量知识复用排序，OP-20 装配扭矩偏移将优先匹配独立 CAPA 样本并保留负样本降权。',
          recommendationScope: ['质量知识复用排序', 'AI 生产助手引用链', 'CAPA 草案推荐'],
          rollbackTargetVersion: 'QK-TRAIN-20260521-R1',
        },
      ]))
    })
    await page.reload({ waitUntil: 'commit' })
    await page.waitForSelector('.admin-board', { timeout: 30000 })
    await page.getByRole('button', { name: 'Agent 治理' }).click()

    const panel = page.locator('.agent-governance-panel')
    const retrainingLane = panel.locator('.quality-retraining-governance')
    const versionCard = retrainingLane.locator('.quality-retraining-card')
    await expect(versionCard.getByText('QK-TRAIN-20260521-R2 装配扭矩偏移 CAPA 再训练样本集')).toBeVisible()
    await expect(versionCard.getByText('已发布到 AI 推荐')).toBeVisible()
    await expect(versionCard.getByText('AUD-KG-QA-RETRAINING-PUBLISH-20260521-001')).toBeVisible()
    await expect(versionCard.getByText('TRACE-KG-QA-WO-DEMO-1018-OP-20-RETRAINING-PUBLISHED')).toBeVisible()
    await expect(versionCard.getByText(/质量知识复用排序/)).toBeVisible()
    await expect(versionCard.getByText(/AI 生产助手引用链/)).toBeVisible()
    await expect(versionCard.locator('.policy-row').filter({ hasText: '校验门' }).getByText(/低分负样本召回权重下降 36%/)).toBeVisible()
    const executionPolicy = panel.locator('.policy-block').filter({ hasText: '执行策略' })
    await expect(executionPolicy.getByText('QK-TRAIN-20260521-R2 / 已发布到 AI 推荐')).toBeVisible()
  })

  test('质量推荐采纳反馈进入 Agent 治理趋势监管', async ({ page }) => {
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
    await page.reload({ waitUntil: 'commit' })
    await page.waitForSelector('.admin-board', { timeout: 30000 })
    await page.getByRole('button', { name: 'Agent 治理' }).click()

    const panel = page.locator('.agent-governance-panel')
    await expect(panel.locator('.agent-metric').filter({ hasText: '推荐采纳反馈' }).getByText('1')).toBeVisible()
    await expect(panel.getByRole('heading', { name: '质量推荐采纳治理' })).toBeVisible()
    const feedbackCard = panel.locator('.quality-feedback-card')
    await expect(feedbackCard.getByText('WO-DEMO-1018 OP-20 推荐采纳反馈')).toBeVisible()
    await expect(feedbackCard.getByText('QK-TRAIN-20260521-R2 -> QK-TRAIN-20260521-R3')).toBeVisible()
    await expect(feedbackCard.getByText('现场已采纳推荐')).toBeVisible()
    await expect(feedbackCard.getByText('89 -> 93 分')).toBeVisible()
    await expect(feedbackCard.getByText('AUD-KG-QA-RECOMMENDATION-FEEDBACK-20260521-001')).toBeVisible()
    await expect(feedbackCard.getByText('TRACE-KG-QA-WO-DEMO-1018-OP-20-RECOMMENDATION-ADOPTED')).toBeVisible()
    const nextTrainingRow = feedbackCard.locator('.policy-row').filter({ hasText: '下一轮训练' })
    await expect(nextTrainingRow.getByText(/QK-TRAIN-20260521-R3/)).toBeVisible()
    await expect(nextTrainingRow.getByText(/TRACE-KG-QA-WO-DEMO-1018-OP-20-NEXT-TRAINING-R3/)).toBeVisible()
    const executionPolicy = panel.locator('.policy-block').filter({ hasText: '执行策略' })
    await expect(executionPolicy.getByText('质量推荐采纳')).toBeVisible()
    await expect(executionPolicy.getByText('89 -> 93 分 / QK-TRAIN-20260521-R3')).toBeVisible()
  })

  test('R3 灰度发布进入 Agent 灰度监控指标', async ({ page }) => {
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
    await page.waitForSelector('.admin-board', { timeout: 30000 })
    await page.getByRole('button', { name: 'Agent 治理' }).click()

    const panel = page.locator('.agent-governance-panel')
    await expect(panel.locator('.agent-metric').filter({ hasText: '灰度监控' }).getByText('1')).toBeVisible()
    await expect(panel.getByRole('heading', { name: '质量推荐灰度监控' })).toBeVisible()
    const monitorCard = panel.locator('.quality-gray-monitor-card')
    await expect(monitorCard.getByText('QK-TRAIN-20260521-R3 灰度监控')).toBeVisible()
    await expect(monitorCard.getByText('灰度监控达标')).toBeVisible()
    await expect(monitorCard.locator('.action-topline span').getByText('OP-20 装配扭矩推荐链路', { exact: true })).toBeVisible()
    await expect(monitorCard.locator('.gray-metric').filter({ hasText: '推荐采纳率' }).getByText('100%')).toBeVisible()
    await expect(monitorCard.locator('.gray-metric').filter({ hasText: '复验通过率' }).getByText('100%')).toBeVisible()
    await expect(monitorCard.locator('.gray-metric').filter({ hasText: '负样本误召回' }).getByText('0 次')).toBeVisible()
    await expect(monitorCard.getByText('AUD-KG-QA-RETRAINING-R3-GRAY-PUBLISH-20260521-001')).toBeVisible()
    await expect(monitorCard.getByText('TRACE-KG-QA-WO-DEMO-1018-OP-20-R3-GRAY-PUBLISHED')).toBeVisible()
    const executionPolicy = panel.locator('.policy-block').filter({ hasText: '执行策略' })
    await expect(executionPolicy.getByText('质量灰度监控')).toBeVisible()
    await expect(executionPolicy.getByText('100% 采纳 / 0 次 误召回')).toBeVisible()
  })

  test('R3 R4 R5 多版本质量推荐实验进入 Agent 治理实验池', async ({ page }) => {
    await seedR3R4R5QualityRecommendationExperiments(page)
    await page.reload({ waitUntil: 'commit' })
    await page.waitForSelector('.admin-board', { timeout: 30000 })
    await page.getByRole('button', { name: 'Agent 治理' }).click()

    const panel = page.locator('.agent-governance-panel')
    await expect(panel.locator('.agent-metric').filter({ hasText: '推荐实验' }).getByText('3')).toBeVisible()
    await expect(panel.getByRole('heading', { name: '质量推荐实验池' })).toBeVisible()

    const experimentLane = panel.locator('.quality-experiment-governance')
    await expect(experimentLane.getByText('3 条')).toBeVisible()
    await expect(experimentLane.getByText('QK-TRAIN-20260521-R3 · 首次灰度发布')).toBeVisible()
    await expect(experimentLane.getByText('QK-TRAIN-20260521-R4 · 首次灰度发布')).toBeVisible()
    await expect(experimentLane.getByText('QK-TRAIN-20260521-R5 · 首次灰度发布')).toBeVisible()

    const r4Card = experimentLane.locator('.quality-experiment-card').filter({ hasText: 'QK-TRAIN-20260521-R4' })
    await expect(r4Card.getByText('实验已扩大')).toBeVisible()
    await expect(r4Card.getByText('93 -> 96 分')).toBeVisible()
    await expect(r4Card.locator('.experiment-metric-grid').getByText('98%')).toBeVisible()
    await expect(r4Card.locator('.experiment-metric-grid').getByText('0 次')).toBeVisible()
    await expect(r4Card.getByText('扩大灰度范围 / 质量主管已确认扩大')).toBeVisible()
    await expect(r4Card.getByText('AUD-KG-QA-RETRAINING-R4-GRAY-EXPAND-20260521-001')).toBeVisible()

    const r5Card = experimentLane.locator('.quality-experiment-card').filter({ hasText: 'QK-TRAIN-20260521-R5' })
    await expect(r5Card.getByText('实验已回滚')).toBeVisible()
    await expect(r5Card.getByText('96 -> 91 分')).toBeVisible()
    await expect(r5Card.locator('.experiment-metric-grid').getByText('82%')).toBeVisible()
    await expect(r5Card.locator('.experiment-metric-grid').getByText('2 次')).toBeVisible()
    await expect(r5Card.getByText('回滚到 R2 正式版 / 回滚无需扩大审批')).toBeVisible()
    await expect(r5Card.getByText('AUD-KG-QA-RETRAINING-R5-GRAY-ROLLBACK-20260521-001')).toBeVisible()

    const executionPolicy = panel.locator('.policy-block').filter({ hasText: '执行策略' })
    await expect(executionPolicy.getByText('质量推荐实验池')).toBeVisible()
    await expect(executionPolicy.getByText('3 个实验 / 1 个扩大 / 1 个回滚')).toBeVisible()
  })

  test('质量推荐实验扩大门禁审批后进入实验池判定', async ({ page }) => {
    await seedR3R4R5QualityRecommendationExperiments(page)
    await page.reload({ waitUntil: 'commit' })
    await page.waitForSelector('.admin-board', { timeout: 30000 })
    await page.getByRole('button', { name: 'Agent 治理' }).click()

    const panel = page.locator('.agent-governance-panel')
    const approvalRow = panel.locator('.approval-row').filter({ hasText: '质量推荐实验扩大门禁' })
    await expect(approvalRow.getByText('复核中')).toBeVisible()
    await expect(approvalRow.getByText(/R4 同设备族实验复验 98%/)).toBeVisible()
    await approvalRow.getByRole('button', { name: '通过' }).click()
    await expect(approvalRow.getByText('已通过')).toBeVisible()

    const executionPolicy = panel.locator('.policy-block').filter({ hasText: '执行策略' })
    await expect(executionPolicy.getByText('质量实验扩大门禁')).toBeVisible()
    await expect(executionPolicy.getByText('采纳 >=100% / 复验 >=95% / 误召回 <=0 次 / 已通过')).toBeVisible()

    const experimentLane = panel.locator('.quality-experiment-governance')
    const r4Card = experimentLane.locator('.quality-experiment-card').filter({ hasText: 'QK-TRAIN-20260521-R4' })
    await expect(r4Card.getByText('门禁通过 / 采纳 >=100% / 复验 >=95% / 误召回 <=0 次 / 已通过')).toBeVisible()
    await expect(r4Card.getByText('TRACE-CFG-QA-EXPERIMENT-GATE-20260521-001 / 已通过')).toBeVisible()

    const r5Card = experimentLane.locator('.quality-experiment-card').filter({ hasText: 'QK-TRAIN-20260521-R5' })
    await expect(r5Card.getByText('门禁未通过 / 采纳 >=100% / 复验 >=95% / 误召回 <=0 次 / 已通过')).toBeVisible()
  })

  test('R5 回滚后派生 R6 R7 质量实验候选治理', async ({ page }) => {
    await seedR3R4R5QualityRecommendationExperiments(page)
    await page.reload({ waitUntil: 'commit' })
    await page.waitForSelector('.admin-board', { timeout: 30000 })
    await page.getByRole('button', { name: 'Agent 治理' }).click()

    const panel = page.locator('.agent-governance-panel')
    await expect(panel.locator('.agent-metric').filter({ hasText: '实验候选' }).getByText('2')).toBeVisible()
    await expect(panel.getByRole('heading', { name: '质量实验候选治理' })).toBeVisible()
    const candidateLane = panel.locator('.quality-experiment-candidate-governance')
    await expect(candidateLane.locator('.otd-governance-heading > strong')).toHaveText('2 条')

    const r6Card = candidateLane.locator('.quality-experiment-candidate-card').filter({
      has: page.locator('.action-topline span').getByText('QK-TRAIN-20260521-R6 · R5 回滚触发', { exact: true }),
    })
    await expect(r6Card.getByText('补样待合并')).toBeVisible()
    await expect(r6Card.locator('.experiment-metric-grid').getByText('6 / 8 条', { exact: true })).toBeVisible()
    await expect(r6Card.locator('.experiment-metric-grid').getByText('75%', { exact: true })).toBeVisible()
    await expect(r6Card.locator('.experiment-metric-grid').getByText('需补 2 条跨线负样本', { exact: true })).toBeVisible()
    await expect(r6Card.locator('.policy-row').filter({ hasText: '来源审计' }).getByText('AUD-KG-QA-RETRAINING-R5-GRAY-ROLLBACK-20260521-001')).toBeVisible()
    await expect(r6Card.locator('.policy-row').filter({ hasText: '候选审计' }).getByText('AUD-KG-QA-RETRAINING-R6-NEGATIVE-COVERAGE-20260521-001')).toBeVisible()

    const r7Card = candidateLane.locator('.quality-experiment-candidate-card').filter({
      has: page.locator('.action-topline span').getByText('QK-TRAIN-20260521-R7 · R6 补样后触发', { exact: true }),
    })
    await expect(r7Card.getByText('影子验证待排队')).toBeVisible()
    await expect(r7Card.locator('.experiment-metric-grid').getByText('100%', { exact: true })).toBeVisible()
    await expect(r7Card.locator('.experiment-metric-grid').getByText('追加 2 个跨线影子场景', { exact: true })).toBeVisible()
    await expect(r7Card.getByText(/只进入影子验证/)).toBeVisible()

    const executionPolicy = panel.locator('.policy-block').filter({ hasText: '执行策略' })
    await expect(executionPolicy.getByText('质量实验候选')).toBeVisible()
    await expect(executionPolicy.getByText('2 个候选 / QK-TRAIN-20260521-R6 75%')).toBeVisible()
  })

  test('R3 灰度扩大需要质量主管确认后生效', async ({ page }) => {
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
    await page.waitForSelector('.admin-board', { timeout: 30000 })
    await page.getByRole('button', { name: 'Agent 治理' }).click()

    const monitorCard = page.locator('.quality-gray-monitor-card')
    await monitorCard.getByRole('button', { name: '扩大灰度' }).click()
    await expect(monitorCard.getByText('扩大灰度范围')).toBeVisible()
    await expect(monitorCard.getByText('待质量主管确认')).toBeVisible()
    await expect(monitorCard.getByText('AUD-KG-QA-RETRAINING-R3-GRAY-EXPAND-20260521-001')).toBeVisible()
    await monitorCard.getByRole('button', { name: '质量主管确认扩大' }).click()
    await expect(monitorCard.getByText('质量主管已确认扩大')).toBeVisible()
  })

  test('R3 灰度监控可触发回滚并进入质量推荐与审计回放', async ({ page }) => {
    await page.evaluate(() => {
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
        summary: 'WO-DEMO-1012 OP-10 命中扫码返工 CAPA 样本，可生成待复核处置草案。',
        matchDimensions: [
          { label: '工序', source: 'CNC 精加工', target: 'CNC 精加工', matched: true },
          { label: '设备', source: 'CNC-002', target: 'CNC-002', matched: true },
        ],
        dispositionDraft: ['冻结 WO-DEMO-1012 OP-10 到 OP-20 的下道交接。'],
        effectMetrics: [{ label: '分析节省', value: '45 分钟' }],
        evidenceTraceIds: ['TRACE-KG-QA-WO-RUSH-9001-OP-10-REWORK-SAMPLE'],
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
      localStorage.setItem('aimes_quality_knowledge_reuse_drafts', JSON.stringify([draft]))
      localStorage.setItem('aimes_quality_knowledge_recommendation_feedback', JSON.stringify([feedback]))
      localStorage.setItem('aimes_quality_knowledge_retraining_versions', JSON.stringify([r3GrayPublished, r2Published]))
    })
    await page.reload({ waitUntil: 'commit' })
    await page.waitForSelector('.admin-board', { timeout: 30000 })
    await page.getByRole('button', { name: 'Agent 治理' }).click()

    const panel = page.locator('.agent-governance-panel')
    const monitorCard = panel.locator('.quality-gray-monitor-card')
    await monitorCard.getByRole('button', { name: '回滚到 R2' }).click()
    await expect(monitorCard.getByText('回滚到 R2 正式版')).toBeVisible()
    await expect(monitorCard.getByText('AUD-KG-QA-RETRAINING-R3-GRAY-ROLLBACK-20260521-001')).toBeVisible()
    await expect(panel.locator('.agent-metric').filter({ hasText: '灰度决策' }).getByText('1')).toBeVisible()

    await page.goto('quality', { waitUntil: 'commit', timeout: 45000 })
    await page.waitForSelector('.quality-board', { timeout: 60000 })
    const qualityPanel = page.locator('.quality-capa-panel')
    await expect(qualityPanel.locator('.gray-release-decision-banner').getByText('QK-TRAIN-20260521-R3 / 回滚到 R2 正式版')).toBeVisible()
    await expect(qualityPanel.locator('.gray-release-decision-banner').getByText('TRACE-KG-QA-WO-DEMO-1018-OP-20-R3-GRAY-ROLLED-BACK')).toBeVisible()
    const rankingCard = qualityPanel.locator('.ranking-card').filter({ hasText: 'WO-DEMO-1018 OP-20 装配扭矩偏移独立 CAPA 推荐' })
    await expect(rankingCard.locator('.ranking-topline span').getByText('R3 回滚后 R2 生效', { exact: true })).toBeVisible()
    await expect(rankingCard.locator('.ranking-training-release').getByText('QK-TRAIN-20260521-R2', { exact: true })).toBeVisible()
    await expect(rankingCard.getByText('AUD-KG-QA-RETRAINING-PUBLISH-20260521-001')).toBeVisible()

    await page.goto('audit-logs', { waitUntil: 'commit', timeout: 45000 })
    await page.waitForSelector('.audit-board', { timeout: 60000 })
    const auditPanel = page.locator('.audit-replay-panel')
    await expect(auditPanel.getByText('质量灰度回放')).toBeVisible()
    const grayReplayCard = auditPanel.locator('.decision-card').filter({ hasText: 'QK-TRAIN-20260521-R3 回滚到 R2 正式版回放' })
    await expect(grayReplayCard).toBeVisible()
    await grayReplayCard.getByRole('button', { name: '回放决策链' }).click()
    const detail = auditPanel.locator('.replay-detail')
    await expect(detail.getByText('TRACE-KG-QA-WO-DEMO-1018-OP-20-R3-GRAY-ROLLED-BACK', { exact: true })).toBeVisible()
    await expect(detail.getByText(/从 active 推荐选择中排除 QK-TRAIN-20260521-R3/)).toBeVisible()
    await expect(detail.getByText(/推荐链路回到 QK-TRAIN-20260521-R2/)).toBeVisible()
    await expect(detail.getByText(/R3-REVIEW-ISSUE-20260521-001 待复核问题单已打开/)).toBeVisible()

    await page.goto('report', { waitUntil: 'commit', timeout: 45000 })
    await page.waitForSelector('.report-board', { timeout: 60000 })
    const reportPanel = page.locator('.quality-gray-decision-report')
    await expect(reportPanel.getByRole('heading', { name: '扩大、回滚和待复核问题单' })).toBeVisible()
    await expect(reportPanel.getByText('0 次扩大 / 1 次回滚')).toBeVisible()
    await expect(reportPanel.getByText('R3-REVIEW-ISSUE-20260521-001')).toBeVisible()
    await expect(reportPanel.getByText('TRACE-KG-QA-WO-DEMO-1018-OP-20-R3-REVIEW-ISSUE')).toBeVisible()
    const downloadPromise = page.waitForEvent('download')
    await page.getByRole('button', { name: 'CSV' }).click()
    const download = await downloadPromise
    const downloadPath = await download.path()
    expect(downloadPath).toBeTruthy()
    const csv = await readFile(downloadPath!, 'utf8')
    expect(csv).toContain('质量灰度决策统计')
    expect(csv).toContain('0 次扩大 / 1 次回滚')
    expect(csv).toContain('R3-REVIEW-ISSUE-20260521-001 / TRACE-KG-QA-WO-DEMO-1018-OP-20-R3-REVIEW-ISSUE')
  })

  test('R3 回滚后可补充负样本并关闭待复核问题单', async ({ page }) => {
    await seedR3GrayReleaseDemo(page)
    await page.reload({ waitUntil: 'commit' })
    await page.waitForSelector('.admin-board', { timeout: 30000 })
    await page.getByRole('button', { name: 'Agent 治理' }).click()

    const panel = page.locator('.agent-governance-panel')
    const monitorCard = panel.locator('.quality-gray-monitor-card')
    await monitorCard.getByRole('button', { name: '回滚到 R2' }).click()
    await expect(monitorCard.getByText('待复核')).toBeVisible()
    await expect(panel.locator('.agent-metric').filter({ hasText: '灰度复核' }).getByText('1')).toBeVisible()

    await monitorCard.getByRole('button', { name: '补充负样本并关闭' }).click()
    await expect(monitorCard.getByText('问题单已关闭')).toBeVisible()
    await expect(monitorCard.getByText('AUD-KG-QA-RETRAINING-R3-REVIEW-CLOSE-20260521-001')).toBeVisible()
    await expect(panel.locator('.agent-metric').filter({ hasText: '灰度复核' }).getByText('0')).toBeVisible()

    await page.goto('audit-logs', { waitUntil: 'commit', timeout: 45000 })
    await page.waitForSelector('.audit-board', { timeout: 60000 })
    const auditPanel = page.locator('.audit-replay-panel')
    const grayReplayCard = auditPanel.locator('.decision-card').filter({ hasText: 'QK-TRAIN-20260521-R3 回滚到 R2 正式版回放' })
    await grayReplayCard.getByRole('button', { name: '回放决策链' }).click()
    const detail = auditPanel.locator('.replay-detail')
    await expect(detail.getByText(/R3-REVIEW-ISSUE-20260521-001 复核问题单状态 问题单已关闭/)).toBeVisible()
    await expect(detail.getByText('补充 R3 负样本：跨工序扫码返工 CAPA 不再进入 OP-20 装配扭矩 Top-3 推荐。', { exact: true })).toBeVisible()
    await expect(detail.getByText(/AUD-KG-QA-RETRAINING-R3-REVIEW-CLOSE-20260521-001/)).toBeVisible()

    await page.goto('report', { waitUntil: 'commit', timeout: 45000 })
    await page.waitForSelector('.report-board', { timeout: 60000 })
    const reportPanel = page.locator('.quality-gray-decision-report')
    await expect(reportPanel.getByText('问题单已关闭')).toBeVisible()
    await expect(reportPanel.getByText('AUD-KG-QA-RETRAINING-R3-REVIEW-CLOSE-20260521-001')).toBeVisible()
    const downloadPromise = page.waitForEvent('download')
    await page.getByRole('button', { name: 'CSV' }).click()
    const download = await downloadPromise
    const downloadPath = await download.path()
    expect(downloadPath).toBeTruthy()
    const csv = await readFile(downloadPath!, 'utf8')
    expect(csv).toContain('1 个已关闭 / 0 个重开灰度前校验')
    expect(csv).toContain('AUD-KG-QA-RETRAINING-R3-REVIEW-CLOSE-20260521-001 / TRACE-KG-QA-WO-DEMO-1018-OP-20-R3-REVIEW-CLOSED')
  })

  test('R3 回滚后可调整灰度范围并重开前置校验', async ({ page }) => {
    await seedR3GrayReleaseDemo(page)
    await page.reload({ waitUntil: 'commit' })
    await page.waitForSelector('.admin-board', { timeout: 30000 })
    await page.getByRole('button', { name: 'Agent 治理' }).click()

    const panel = page.locator('.agent-governance-panel')
    const monitorCard = panel.locator('.quality-gray-monitor-card')
    await monitorCard.getByRole('button', { name: '回滚到 R2' }).click()
    await monitorCard.getByRole('button', { name: '调整范围重开校验' }).click()
    await expect(monitorCard.getByText('已重开灰度前校验')).toBeVisible()
    await expect(monitorCard.getByText('AUD-KG-QA-RETRAINING-R3-SCOPE-REVALIDATION-20260521-001')).toBeVisible()
    await expect(panel.locator('.agent-metric').filter({ hasText: '灰度复核' }).getByText('0')).toBeVisible()

    await page.goto('audit-logs', { waitUntil: 'commit', timeout: 45000 })
    await page.waitForSelector('.audit-board', { timeout: 60000 })
    const auditPanel = page.locator('.audit-replay-panel')
    const grayReplayCard = auditPanel.locator('.decision-card').filter({ hasText: 'QK-TRAIN-20260521-R3 回滚到 R2 正式版回放' })
    await grayReplayCard.getByRole('button', { name: '回放决策链' }).click()
    const detail = auditPanel.locator('.replay-detail')
    await expect(detail.getByText(/R3-REVIEW-ISSUE-20260521-001 复核问题单状态 已重开灰度前校验/)).toBeVisible()
    await expect(detail.getByText(/缩小 R3 灰度范围到 WO-DEMO-1018 OP-20/)).toBeVisible()
    await expect(detail.getByText(/TRACE-KG-QA-WO-DEMO-1018-OP-20-R3-SCOPE-REVALIDATION/)).toBeVisible()

    await page.goto('report', { waitUntil: 'commit', timeout: 45000 })
    await page.waitForSelector('.report-board', { timeout: 60000 })
    const reportPanel = page.locator('.quality-gray-decision-report')
    await expect(reportPanel.getByText('已重开灰度前校验')).toBeVisible()
    await expect(reportPanel.getByText('AUD-KG-QA-RETRAINING-R3-SCOPE-REVALIDATION-20260521-001')).toBeVisible()
    const downloadPromise = page.waitForEvent('download')
    await page.getByRole('button', { name: 'CSV' }).click()
    const download = await downloadPromise
    const downloadPath = await download.path()
    expect(downloadPath).toBeTruthy()
    const csv = await readFile(downloadPath!, 'utf8')
    expect(csv).toContain('0 个已关闭 / 1 个重开灰度前校验')
    expect(csv).toContain('AUD-KG-QA-RETRAINING-R3-SCOPE-REVALIDATION-20260521-001 / TRACE-KG-QA-WO-DEMO-1018-OP-20-R3-SCOPE-REVALIDATION')
  })

  test('关键 Agent 配置审批通过后进入审计回放', async ({ page }) => {
    await page.getByRole('button', { name: 'Agent 治理' }).click()
    const panel = page.locator('.agent-governance-panel')
    const approvalRow = panel.locator('.approval-row').filter({ hasText: 'Scheduling.LockWindowHours' })

    await expect(approvalRow.getByText('待审批')).toBeVisible()
    await approvalRow.getByRole('button', { name: '通过' }).click()
    await expect(approvalRow.getByText('已通过')).toBeVisible()

    await page.getByRole('button', { name: '查看审计回放' }).click()
    await expect(page).toHaveURL(/\/scheduling\/audit-logs$/)
    const auditPanel = page.locator('.audit-replay-panel')
    await auditPanel.locator('.decision-card').filter({ hasText: '配置审批：锁定期保护从 8 小时调整为 10 小时' }).getByRole('button', { name: '回放决策链' }).click()

    const detail = auditPanel.locator('.replay-detail')
    await expect(detail.getByText('TRACE-CFG-20260520-002', { exact: true })).toBeVisible()
    await expect(detail.getByText(/admin 审批通过/)).toBeVisible()
    await expect(detail.getByText(/Scheduling.LockWindowHours 从 8h 生效为 10h/)).toBeVisible()
  })
})
