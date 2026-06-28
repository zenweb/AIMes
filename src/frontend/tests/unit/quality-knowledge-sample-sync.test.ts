import { beforeEach, describe, expect, it, vi } from 'vitest'
import { installMemoryLocalStorage } from './test-storage'
import {
  approveQualityKnowledgeGrayReleaseExpansion,
  approveQualityKnowledgeRetrainingCandidate,
  buildQualityKnowledgeAssetGovernanceRecords,
  buildQualityKnowledgeGrayReleaseMonitorRecords,
  buildQualityKnowledgePolicyGovernanceRecords,
  buildQualityKnowledgeRecommendationFeedbackGovernanceRecords,
  buildQualityKnowledgeRecommendationExperimentCandidateRecords,
  buildQualityKnowledgeRecommendationExperimentComparisonRecords,
  buildQualityKnowledgeReuseRanking,
  buildQualityKnowledgeRetrainingGovernanceRecords,
  closeQualityKnowledgeGrayReviewIssueWithNegativeSample,
  closeLowScoreQualityKnowledgeReviewQueueRecord,
  createBarcodeQualityKnowledgeSample,
  createBarcodeQualityReuseDraft,
  createBarcodeQualityReuseClosure,
  createLowScoreQualityKnowledgeReviewQueueRecord,
  decideQualityKnowledgeGrayRelease,
  grayPublishQualityExperimentShadowValidationVersion,
  acceptQualityKnowledgeRecommendation,
  reopenQualityKnowledgeGrayPrevalidationWithScopeAdjustment,
  readQualityKnowledgeRecommendationFeedbackRecords,
  readQualityKnowledgeRecommendationFeedbackRecordsBackendFirst,
  readQualityKnowledgeGrayReleaseDecisionRecords,
  readQualityKnowledgeGrayReleaseDecisionRecordsBackendFirst,
  readQualityKnowledgeReuseClosures,
  readQualityKnowledgeReuseClosuresBackendFirst,
  readQualityKnowledgeReuseDraftsBackendFirst,
  mergeQualityExperimentNegativeSampleCandidate,
  rerunQualityKnowledgeRetrainingValidationPass,
  rollbackQualityKnowledgeRetrainingVersion,
  runQualityExperimentShadowValidationCandidate,
  runQualityKnowledgeRetrainingValidation,
  runQualityKnowledgeNextTrainingSetValidationPass,
  grayPublishQualityKnowledgeNextTrainingSetVersion,
  publishQualityKnowledgeRetrainingVersion,
  selectActiveQualityKnowledgeRecommendationVersion,
  selectPrioritizedQualityKnowledgeRecommendationVersion,
  type QualityKnowledgeGrayReleaseDecisionRecord,
  type QualityKnowledgeRecommendationFeedbackRecord,
  type QualityKnowledgeRetrainingVersionRecord,
  readQualityKnowledgeReviewQueueRecords,
  readQualityKnowledgeReviewQueueRecordsBackendFirst,
  readQualityKnowledgeReuseDrafts,
  readQualityKnowledgeSamples,
  readQualityKnowledgeSamplesBackendFirst,
  readQualityKnowledgeRetrainingVersionRecordsBackendFirst,
  verifyQualityKnowledgeReuseClosure,
  writeQualityKnowledgeRecommendationFeedbackRecord,
  writeQualityKnowledgeReviewQueueRecord,
  writeQualityKnowledgeReuseClosure,
  writeQualityKnowledgeReuseDraft,
  writeQualityKnowledgeSample,
  writeQualityKnowledgeRetrainingVersionRecord,
} from '../../src/utils/quality-knowledge-sample-sync'
import { readOtdEvidenceChainRecords } from '../../src/utils/otd-evidence-chain-sync'

const httpGet = vi.hoisted(() => vi.fn())
const httpPost = vi.hoisted(() => vi.fn(() => Promise.resolve({ data: null })))

vi.mock('../../src/api/http', () => ({
  default: {
    get: httpGet,
    post: httpPost,
  },
}))

function makeRetrainingVersion(
  trainingSetVersion: string,
  status: QualityKnowledgeRetrainingVersionRecord['status'],
  publishedAt: string,
  overrides: Partial<QualityKnowledgeRetrainingVersionRecord> = {}
): QualityKnowledgeRetrainingVersionRecord {
  return {
    id: `quality-retraining-version-${trainingSetVersion.toLowerCase()}`,
    sourceReviewQueueId: `review-${trainingSetVersion}`,
    targetWorkOrderId: 'WO-DEMO-1018',
    operationCode: 'OP-20',
    candidateTraceId: `TRACE-${trainingSetVersion}-CANDIDATE`,
    trainingSetVersion,
    trainingSetName: '装配扭矩偏移 CAPA 再训练样本集',
    status,
    statusLabel: status === 'gray_published' ? '已灰度发布' : '已发布到 AI 推荐',
    approvedBy: '质量主管 刘工',
    approvedAt: '2026-05-21T08:00:00.000Z',
    approvalAuditId: `AUD-${trainingSetVersion}-APPROVAL`,
    approvalTraceId: `TRACE-${trainingSetVersion}-APPROVAL`,
    positiveSampleCount: 24,
    negativeSampleCount: 4,
    featurePolicy: '工序、设备族、缺陷模式、验证效果分必须同时参与召回排序。',
    changeSummary: ['补充 OP-20 装配扭矩偏移样本。'],
    validationGates: ['Top-3 召回必须命中独立扭矩 CAPA 样本。'],
    validationStatus: 'passed',
    validatedAt: '2026-05-21T09:00:00.000Z',
    validationAuditId: `AUD-${trainingSetVersion}-VALIDATION`,
    validationTraceId: `TRACE-${trainingSetVersion}-VALIDATION`,
    validationSummary: '灰度前校验已通过。',
    validationFindings: ['推荐采纳反馈字段完整率 100%。'],
    publishedAt,
    publishAuditId: `AUD-${trainingSetVersion}-PUBLISH`,
    publishTraceId: `TRACE-${trainingSetVersion}-PUBLISHED`,
    publishSummary: '已发布到质量知识推荐链路。',
    recommendationScope: ['OP-20 装配扭矩推荐链路'],
    ...overrides,
  }
}

function makeGrayReleaseDecision(
  trainingSetVersion: string,
  decision: QualityKnowledgeGrayReleaseDecisionRecord['decision'],
  approvalStatus: QualityKnowledgeGrayReleaseDecisionRecord['approvalStatus'],
  overrides: Partial<QualityKnowledgeGrayReleaseDecisionRecord> = {}
): QualityKnowledgeGrayReleaseDecisionRecord {
  return {
    id: `gray-release-${trainingSetVersion.toLowerCase()}-${decision}`,
    monitorId: `monitor-${trainingSetVersion}`,
    trainingSetVersion,
    targetWorkOrderId: 'WO-DEMO-1018',
    operationCode: 'OP-20',
    releaseCycleLabel: '首次灰度发布',
    releaseAuditId: `AUD-${trainingSetVersion}-GRAY-PUBLISH`,
    releaseTraceId: `TRACE-${trainingSetVersion}-GRAY-PUBLISHED`,
    releaseScopeLabel: 'OP-20 装配扭矩推荐链路',
    decision,
    decisionLabel: decision === 'expanded' ? '扩大灰度范围' : '回滚到 R2 正式版',
    statusClass: decision === 'expanded' ? 'accepted' : 'guarded',
    decidedBy: '质量主管 刘工',
    decidedAt: '2026-05-22T10:00:00.000Z',
    auditId: `AUD-${trainingSetVersion}-${decision.toUpperCase()}`,
    traceId: `TRACE-${trainingSetVersion}-${decision.toUpperCase()}`,
    reason: decision === 'expanded'
      ? '灰度指标达标，允许扩大到 active 推荐范围。'
      : '灰度指标未满足扩大条件，先回滚到 R2 正式版。',
    approvalStatus,
    approvalLabel: approvalStatus === 'approved' ? '质量主管已确认扩大' : '回滚无需扩大审批',
    rollbackTargetVersion: decision === 'rolled_back' ? 'QK-TRAIN-20260521-R2' : undefined,
    expansionScope: decision === 'expanded' ? ['OP-20 装配扭矩推荐链路'] : undefined,
    metricSnapshot: [
      { label: '推荐采纳率', value: '82%' },
      { label: '负样本误召回', value: '0' },
    ],
    actions: ['更新质量知识推荐版本选择。'],
    ...overrides,
  }
}

function makeRecommendationFeedback(
  overrides: Partial<QualityKnowledgeRecommendationFeedbackRecord> = {}
): QualityKnowledgeRecommendationFeedbackRecord {
  return {
    id: 'quality-feedback-r2-adoption',
    rankingId: 'reuse-rank-published-torque-retraining',
    trainingSetVersion: 'QK-TRAIN-20260521-R2',
    targetWorkOrderId: 'WO-DEMO-1018',
    operationCode: 'OP-20',
    decision: 'accepted',
    decisionLabel: '现场已采纳',
    owner: '质量工程师 王工',
    reason: 'OP-20 装配扭矩偏移推荐被现场采纳，复验通过。',
    decidedAt: '2026-05-22T09:30:00.000Z',
    auditId: 'AUD-KG-QA-FEEDBACK-R2-20260521-001',
    traceId: 'TRACE-KG-QA-FEEDBACK-R2',
    effectScoreBefore: 89,
    effectScoreAfter: 94,
    effectTrendLabel: '89 -> 94',
    nextTrainingSetVersion: 'QK-TRAIN-20260521-R3',
    nextTrainingTraceId: 'TRACE-KG-QA-R3-MERGED',
    feedbackActions: ['把采纳结果、复验指标和负样本对照写入 R3。'],
    feedbackMetrics: [
      { label: '推荐采纳率', value: '100%' },
      { label: '复验通过率', value: '100%' },
    ],
    ...overrides,
  }
}

describe('quality knowledge sample sync', () => {
  beforeEach(() => {
    installMemoryLocalStorage()
    localStorage.clear()
    httpGet.mockReset()
    httpPost.mockClear()
  })

  it('stores quality knowledge sample and syncs backend and OTD evidence best-effort', async () => {
    const sample = createBarcodeQualityKnowledgeSample('2026-05-31T08:00:00.000Z')

    writeQualityKnowledgeSample(sample)
    await vi.dynamicImportSettled()

    expect(readQualityKnowledgeSamples()).toEqual([sample])
    expect(httpPost).toHaveBeenCalledWith('/scheduling/quality-knowledge-evidence', expect.objectContaining({
      id: sample.id,
      evidenceType: 'QualityKnowledgeSample',
      auditId: sample.auditId,
      traceId: sample.traceId,
      payload: sample,
    }))
    expect(readOtdEvidenceChainRecords()).toEqual([
      expect.objectContaining({
        id: `quality-knowledge-${sample.id}`,
        status: 'closed',
        traceId: sample.traceId,
      }),
    ])
  })

  it('falls back to local quality knowledge samples when backend returns no records', async () => {
    const sample = createBarcodeQualityKnowledgeSample('2026-05-31T08:00:00.000Z')
    writeQualityKnowledgeSample(sample)
    httpGet.mockResolvedValueOnce({ data: [] })

    await expect(readQualityKnowledgeSamplesBackendFirst()).resolves.toEqual([sample])
    expect(httpGet).toHaveBeenCalledWith('/scheduling/quality-knowledge-evidence', {
      params: { evidenceType: 'QualityKnowledgeSample', take: 12 },
    })
  })

  it('prefers valid backend quality knowledge sample payloads over local cache', async () => {
    const localSample = createBarcodeQualityKnowledgeSample('2026-05-31T08:00:00.000Z')
    const backendSample = createBarcodeQualityKnowledgeSample('2026-05-31T08:10:00.000Z', {
      id: 'quality-knowledge-sample-backend',
      workOrderId: 'WO-BACKEND-1001',
      traceId: 'TRACE-KG-QA-BACKEND-SAMPLE',
    })
    writeQualityKnowledgeSample(localSample)
    httpGet.mockResolvedValueOnce({
      data: [{
        id: 'backend-envelope-sample',
        evidenceType: 'QualityKnowledgeSample',
        title: backendSample.documentTitle,
        auditId: backendSample.auditId,
        traceId: backendSample.traceId,
        status: 'closed',
        createdAt: backendSample.createdAt,
        payload: backendSample,
      }],
    })

    await expect(readQualityKnowledgeSamplesBackendFirst()).resolves.toEqual([backendSample])
    expect(readQualityKnowledgeSamples()).toEqual([localSample])
    expect(httpGet).toHaveBeenCalledWith('/scheduling/quality-knowledge-evidence', {
      params: { evidenceType: 'QualityKnowledgeSample', take: 12 },
    })
  })

  it('verifies reuse closure with formal CAPA and effect feedback OTD evidence', () => {
    const sample = createBarcodeQualityKnowledgeSample('2026-05-31T08:00:00.000Z')
    const draft = createBarcodeQualityReuseDraft(sample, '2026-05-31T08:30:00.000Z')
    const closure = createBarcodeQualityReuseClosure(draft, '2026-05-31T09:30:00.000Z')

    const verifiedClosure = verifyQualityKnowledgeReuseClosure(closure, '2026-05-31T10:30:00.000Z')

    expect(readQualityKnowledgeReuseClosures()).toEqual([expect.objectContaining({
      id: closure.id,
      status: 'verified',
      statusLabel: '复用效果已回写',
      verifiedAt: '2026-05-31T10:30:00.000Z',
    })])
    expect(readOtdEvidenceChainRecords()).toEqual(expect.arrayContaining([
      expect.objectContaining({
        id: `quality-reuse-formal-capa-${closure.id}`,
        stage: '正式CAPA',
        traceId: closure.traceId,
        status: 'closed',
        statusLabel: '正式 CAPA 已验证',
      }),
      expect.objectContaining({
        id: `quality-reuse-effect-${closure.id}`,
        stage: '质量复用效果',
        traceId: closure.effectTraceId,
        status: 'closed',
        statusLabel: '效果已回写',
        createdAt: verifiedClosure.verifiedAt,
      }),
    ]))
  })

  it('falls back to local retraining versions when backend payloads are invalid', async () => {
    const localVersion = makeRetrainingVersion('QK-TRAIN-20260521-R2', 'published', '2026-05-21T10:00:00.000Z')
    writeQualityKnowledgeRetrainingVersionRecord(localVersion)
    httpGet.mockResolvedValueOnce({
      data: [{
        id: 'backend-envelope-invalid-version',
        evidenceType: 'QualityKnowledgeRetrainingVersion',
        title: 'invalid backend payload',
        auditId: 'AUD-BAD',
        traceId: 'TRACE-BAD',
        status: 'published',
        createdAt: '2026-05-21T10:00:00.000Z',
        payload: { id: 'bad-version', trainingSetVersion: 'QK-BAD' },
      }],
    })

    await expect(readQualityKnowledgeRetrainingVersionRecordsBackendFirst()).resolves.toEqual([localVersion])
    expect(httpGet).toHaveBeenCalledWith('/scheduling/quality-knowledge-evidence', {
      params: { evidenceType: 'QualityKnowledgeRetrainingVersion', take: 12 },
    })
  })

  it('falls back to local retraining versions when offline preview returns SPA HTML', async () => {
    const localVersion = makeRetrainingVersion('QK-TRAIN-20260521-R2', 'published', '2026-05-21T10:00:00.000Z')
    writeQualityKnowledgeRetrainingVersionRecord(localVersion)
    httpGet.mockResolvedValueOnce({ data: '<!DOCTYPE html><html><body>AIMes</body></html>' })

    await expect(readQualityKnowledgeRetrainingVersionRecordsBackendFirst()).resolves.toEqual([localVersion])
  })

  it('writes back valid samples when local quality knowledge sample cache contains bad records', () => {
    const sample = createBarcodeQualityKnowledgeSample('2026-05-31T08:00:00.000Z')
    localStorage.setItem('aimes_quality_knowledge_samples', JSON.stringify([
      { id: 'bad-sample', workOrderId: 'WO-BAD' },
      sample,
    ]))

    expect(readQualityKnowledgeSamples()).toEqual([sample])
    expect(JSON.parse(localStorage.getItem('aimes_quality_knowledge_samples') ?? '[]')).toEqual([sample])
  })

  it('removes quality knowledge sample cache when all records are invalid or JSON is corrupt', () => {
    localStorage.setItem('aimes_quality_knowledge_samples', JSON.stringify([
      { id: 'bad-sample', workOrderId: 'WO-BAD' },
    ]))

    expect(readQualityKnowledgeSamples()).toEqual([])
    expect(localStorage.getItem('aimes_quality_knowledge_samples')).toBeNull()

    localStorage.setItem('aimes_quality_knowledge_samples', '{bad json')

    expect(readQualityKnowledgeSamples()).toEqual([])
    expect(localStorage.getItem('aimes_quality_knowledge_samples')).toBeNull()
  })

  it('cleans invalid reuse drafts and review queue records without losing valid quality knowledge evidence', () => {
    const sample = createBarcodeQualityKnowledgeSample('2026-05-31T08:00:00.000Z')
    const draft = createBarcodeQualityReuseDraft(sample, '2026-05-31T08:30:00.000Z')
    const review = createLowScoreQualityKnowledgeReviewQueueRecord('2026-05-31T09:00:00.000Z')

    writeQualityKnowledgeReuseDraft(draft)
    writeQualityKnowledgeReviewQueueRecord(review)
    localStorage.setItem('aimes_quality_knowledge_reuse_drafts', JSON.stringify([
      { id: 'bad-draft', sourceSampleId: sample.id },
      draft,
    ]))
    localStorage.setItem('aimes_quality_knowledge_review_queue', JSON.stringify([
      { id: 'bad-review', targetWorkOrderId: 'WO-BAD' },
      review,
    ]))

    expect(readQualityKnowledgeReuseDrafts()).toEqual([draft])
    expect(JSON.parse(localStorage.getItem('aimes_quality_knowledge_reuse_drafts') ?? '[]')).toEqual([draft])
    expect(readQualityKnowledgeReviewQueueRecords()).toEqual([review])
    expect(JSON.parse(localStorage.getItem('aimes_quality_knowledge_review_queue') ?? '[]')).toEqual([review])
  })

  it('cleans audit-incomplete reuse closures and recommendation feedback without losing valid evidence', () => {
    const sample = createBarcodeQualityKnowledgeSample('2026-05-31T08:00:00.000Z')
    const draft = createBarcodeQualityReuseDraft(sample, '2026-05-31T08:30:00.000Z')
    const closure = createBarcodeQualityReuseClosure(draft, '2026-05-31T09:30:00.000Z')
    const feedback = makeRecommendationFeedback()

    localStorage.setItem('aimes_quality_knowledge_reuse_closures', JSON.stringify([
      { ...closure, id: 'bad-closure-empty-actions', feedbackActions: [], feedbackMetrics: [] },
      closure,
    ]))
    localStorage.setItem('aimes_quality_knowledge_recommendation_feedback', JSON.stringify([
      { ...feedback, id: 'bad-feedback-empty-actions', feedbackActions: [], feedbackMetrics: [] },
      feedback,
    ]))

    expect(readQualityKnowledgeReuseClosures()).toEqual([closure])
    expect(JSON.parse(localStorage.getItem('aimes_quality_knowledge_reuse_closures') ?? '[]')).toEqual([closure])
    expect(readQualityKnowledgeRecommendationFeedbackRecords()).toEqual([feedback])
    expect(JSON.parse(localStorage.getItem('aimes_quality_knowledge_recommendation_feedback') ?? '[]')).toEqual([feedback])
  })

  it('persists gray decision defaults and falls back from invalid backend recommendation feedback', async () => {
    const localFeedback = makeRecommendationFeedback()
    writeQualityKnowledgeRecommendationFeedbackRecord(localFeedback)
    const { releaseCycleLabel, releaseAuditId, releaseTraceId, releaseScopeLabel, ...legacyDecision } =
      makeGrayReleaseDecision('QK-TRAIN-20260521-R3', 'rolled_back', 'not_required')
    localStorage.setItem('aimes_quality_knowledge_gray_release_decisions', JSON.stringify([legacyDecision]))
    httpGet.mockResolvedValueOnce({
      data: [{
        id: 'backend-envelope-invalid-feedback',
        evidenceType: 'QualityKnowledgeRecommendationFeedback',
        title: 'invalid backend feedback',
        auditId: 'AUD-BAD',
        traceId: 'TRACE-BAD',
        status: 'accepted',
        createdAt: localFeedback.decidedAt,
        payload: { id: 'bad-feedback', trainingSetVersion: localFeedback.trainingSetVersion },
      }],
    })

    expect(readQualityKnowledgeGrayReleaseDecisionRecords()).toEqual([expect.objectContaining({
      id: legacyDecision.id,
      decision: legacyDecision.decision,
      trainingSetVersion: legacyDecision.trainingSetVersion,
      releaseCycleLabel,
      releaseAuditId: legacyDecision.auditId,
      releaseTraceId: legacyDecision.traceId,
      releaseScopeLabel,
    })])
    expect(releaseAuditId).not.toBe(legacyDecision.auditId)
    expect(releaseTraceId).not.toBe(legacyDecision.traceId)
    expect(JSON.parse(localStorage.getItem('aimes_quality_knowledge_gray_release_decisions') ?? '[]')).toEqual([expect.objectContaining({
      releaseCycleLabel,
      releaseAuditId: legacyDecision.auditId,
      releaseTraceId: legacyDecision.traceId,
      releaseScopeLabel,
    })])
    await expect(readQualityKnowledgeRecommendationFeedbackRecordsBackendFirst()).resolves.toEqual([localFeedback])
    expect(httpGet).toHaveBeenCalledWith('/scheduling/quality-knowledge-evidence', {
      params: { evidenceType: 'QualityKnowledgeRecommendationFeedback', take: 12 },
    })
  })

  it('prefers valid backend reuse and review payloads over local quality knowledge caches', async () => {
    const sample = createBarcodeQualityKnowledgeSample('2026-05-31T08:00:00.000Z')
    const localDraft = createBarcodeQualityReuseDraft(sample, '2026-05-31T08:30:00.000Z')
    const backendDraft = createBarcodeQualityReuseDraft(sample, '2026-05-31T08:40:00.000Z', {
      id: 'quality-knowledge-reuse-draft-backend',
      targetWorkOrderId: 'WO-BACKEND-2001',
      traceId: 'TRACE-KG-QA-BACKEND-REUSE-DRAFT',
    })
    const localClosure = createBarcodeQualityReuseClosure(localDraft, '2026-05-31T09:30:00.000Z')
    const backendClosure = createBarcodeQualityReuseClosure(backendDraft, '2026-05-31T09:40:00.000Z', {
      id: 'quality-knowledge-reuse-closure-backend',
      targetWorkOrderId: 'WO-BACKEND-2001',
      traceId: 'TRACE-KG-QA-BACKEND-REUSE-CLOSURE',
    })
    const localReview = createLowScoreQualityKnowledgeReviewQueueRecord('2026-05-31T10:00:00.000Z')
    const backendReview = createLowScoreQualityKnowledgeReviewQueueRecord('2026-05-31T10:10:00.000Z', {
      id: 'quality-knowledge-review-backend',
      targetWorkOrderId: 'WO-BACKEND-2002',
      traceId: 'TRACE-KG-QA-BACKEND-REVIEW',
    })
    writeQualityKnowledgeReuseDraft(localDraft)
    writeQualityKnowledgeReuseClosure(localClosure)
    writeQualityKnowledgeReviewQueueRecord(localReview)

    httpGet
      .mockResolvedValueOnce({
        data: [{
          id: 'backend-envelope-reuse-draft',
          evidenceType: 'QualityKnowledgeReuseDraft',
          title: backendDraft.summary,
          auditId: backendDraft.auditId,
          traceId: backendDraft.traceId,
          status: 'ready',
          createdAt: backendDraft.createdAt,
          payload: backendDraft,
        }],
      })
      .mockResolvedValueOnce({
        data: [{
          id: 'backend-envelope-reuse-closure',
          evidenceType: 'QualityKnowledgeReuseClosure',
          title: backendClosure.formalCapaTitle,
          auditId: backendClosure.auditId,
          traceId: backendClosure.traceId,
          status: backendClosure.status,
          createdAt: backendClosure.approvedAt,
          payload: backendClosure,
        }],
      })
      .mockResolvedValueOnce({
        data: [{
          id: 'backend-envelope-review',
          evidenceType: 'QualityKnowledgeReviewQueue',
          title: backendReview.title,
          auditId: backendReview.auditId,
          traceId: backendReview.traceId,
          status: backendReview.status,
          createdAt: backendReview.createdAt,
          payload: backendReview,
        }],
      })

    await expect(readQualityKnowledgeReuseDraftsBackendFirst()).resolves.toEqual([backendDraft])
    await expect(readQualityKnowledgeReuseClosuresBackendFirst()).resolves.toEqual([backendClosure])
    await expect(readQualityKnowledgeReviewQueueRecordsBackendFirst()).resolves.toEqual([backendReview])
    expect(readQualityKnowledgeReuseDrafts()).toEqual([localDraft])
    expect(readQualityKnowledgeReuseClosures()).toEqual([localClosure])
    expect(readQualityKnowledgeReviewQueueRecords()).toEqual([localReview])
  })

  it('normalizes valid backend gray decisions and falls back when backend review queue payloads are invalid', async () => {
    const localReview = createLowScoreQualityKnowledgeReviewQueueRecord('2026-05-31T10:00:00.000Z')
    writeQualityKnowledgeReviewQueueRecord(localReview)
    const { releaseCycleLabel, releaseAuditId, releaseTraceId, releaseScopeLabel, ...backendLegacyDecision } =
      makeGrayReleaseDecision('QK-TRAIN-20260521-R7', 'rolled_back', 'not_required', {
        auditId: 'AUD-KG-QA-R7-ROLLBACK-BACKEND',
        traceId: 'TRACE-KG-QA-R7-ROLLBACK-BACKEND',
      })

    httpGet
      .mockResolvedValueOnce({
        data: [{
          id: 'backend-envelope-gray-decision',
          evidenceType: 'QualityKnowledgeGrayReleaseDecision',
          title: backendLegacyDecision.decisionLabel,
          auditId: backendLegacyDecision.auditId,
          traceId: backendLegacyDecision.traceId,
          status: backendLegacyDecision.decision,
          createdAt: backendLegacyDecision.decidedAt,
          payload: backendLegacyDecision,
        }],
      })
      .mockResolvedValueOnce({
        data: [{
          id: 'backend-envelope-invalid-review',
          evidenceType: 'QualityKnowledgeReviewQueue',
          title: 'invalid backend review queue',
          auditId: 'AUD-BAD',
          traceId: 'TRACE-BAD',
          status: 'open',
          createdAt: localReview.createdAt,
          payload: { id: 'bad-review', targetWorkOrderId: 'WO-BAD' },
        }],
      })

    await expect(readQualityKnowledgeGrayReleaseDecisionRecordsBackendFirst()).resolves.toEqual([expect.objectContaining({
      id: backendLegacyDecision.id,
      releaseCycleLabel,
      releaseAuditId: backendLegacyDecision.auditId,
      releaseTraceId: backendLegacyDecision.traceId,
      releaseScopeLabel,
    })])
    expect(releaseAuditId).not.toBe(backendLegacyDecision.auditId)
    expect(releaseTraceId).not.toBe(backendLegacyDecision.traceId)
    await expect(readQualityKnowledgeReviewQueueRecordsBackendFirst()).resolves.toEqual([localReview])
  })

  it('fails loud when backend gray release decisions fail and no local decision audit record exists', async () => {
    httpGet.mockRejectedValueOnce(new Error('quality gray release backend unavailable'))

    await expect(readQualityKnowledgeGrayReleaseDecisionRecordsBackendFirst()).rejects.toThrow('quality gray release backend unavailable')
  })

  it('fails loud when backend gray release decisions return a non-array payload', async () => {
    httpGet.mockResolvedValueOnce({ data: { items: [] } })

    await expect(readQualityKnowledgeGrayReleaseDecisionRecordsBackendFirst()).rejects.toThrow('后端返回非数组审计载荷')
  })

  it('fails loud when backend recommendation feedback fails and no local feedback audit record exists', async () => {
    httpGet.mockRejectedValueOnce(new Error('quality recommendation feedback backend unavailable'))

    await expect(readQualityKnowledgeRecommendationFeedbackRecordsBackendFirst()).rejects.toThrow('quality recommendation feedback backend unavailable')
  })

  it('falls back to empty local quality knowledge records in offline demo mode instead of surfacing backend skip errors', async () => {
    const offlineDemoError = new Error('Offline demo mode skipped backend request: /api/v1/scheduling/quality-knowledge-evidence')
    offlineDemoError.name = 'OfflineDemoApiError'
    httpGet.mockRejectedValueOnce(offlineDemoError)

    await expect(readQualityKnowledgeSamplesBackendFirst()).resolves.toEqual([])
  })

  it('fails loud when backend retraining versions fail and no local version audit record exists', async () => {
    httpGet.mockRejectedValueOnce(new Error('quality retraining version backend unavailable'))

    await expect(readQualityKnowledgeRetrainingVersionRecordsBackendFirst()).rejects.toThrow('quality retraining version backend unavailable')
  })

  it('excludes rolled-back gray quality recommendation versions from active selection', () => {
    const publishedR2 = makeRetrainingVersion('QK-TRAIN-20260521-R2', 'published', '2026-05-21T10:00:00.000Z')
    const grayR3 = makeRetrainingVersion('QK-TRAIN-20260521-R3', 'gray_published', '2026-05-22T10:00:00.000Z')
    const rollbackDecision = makeGrayReleaseDecision(grayR3.trainingSetVersion, 'rolled_back', 'not_required')

    expect(selectActiveQualityKnowledgeRecommendationVersion(
      [publishedR2, grayR3],
      'WO-DEMO-1018',
      'OP-20',
      [rollbackDecision]
    )?.trainingSetVersion).toBe(publishedR2.trainingSetVersion)

    expect(selectPrioritizedQualityKnowledgeRecommendationVersion(
      [publishedR2, grayR3],
      'WO-DEMO-1018',
      'OP-20',
      [rollbackDecision]
    )?.trainingSetVersion).toBe(publishedR2.trainingSetVersion)
  })

  it('requires approved expansion before shadow gray quality recommendation versions become prioritized', () => {
    const publishedR2 = makeRetrainingVersion('QK-TRAIN-20260521-R2', 'published', '2026-05-21T10:00:00.000Z')
    const shadowGrayR7 = makeRetrainingVersion('QK-TRAIN-20260521-R7', 'gray_published', '2026-05-23T10:00:00.000Z', {
      featurePolicy: '影子灰度只观察，不进入 active 推荐。',
      publishAuditId: 'AUD-KG-QA-RETRAINING-R7-SHADOW-GRAY-PUBLISH-20260521-001',
      publishTraceId: 'TRACE-KG-QA-WO-DEMO-1018-OP-20-R7-SHADOW-GRAY-PUBLISHED',
      recommendationScope: ['跨线 OP-20 扭矩偏移影子灰度'],
    })

    expect(selectPrioritizedQualityKnowledgeRecommendationVersion(
      [publishedR2, shadowGrayR7],
      'WO-DEMO-1018',
      'OP-20',
      []
    )?.trainingSetVersion).toBe(publishedR2.trainingSetVersion)

    const approvedExpansion = makeGrayReleaseDecision(shadowGrayR7.trainingSetVersion, 'expanded', 'approved')

    expect(selectPrioritizedQualityKnowledgeRecommendationVersion(
      [publishedR2, shadowGrayR7],
      'WO-DEMO-1018',
      'OP-20',
      [approvedExpansion]
    )?.trainingSetVersion).toBe(shadowGrayR7.trainingSetVersion)
  })

  it('keeps expanded gray decisions pending until human approval closes the evidence loop', () => {
    const grayR3 = makeRetrainingVersion('QK-TRAIN-20260521-R3', 'gray_published', '2026-05-22T10:00:00.000Z', {
      validationFindings: ['推荐采纳反馈字段完整率 100%。', 'Top-3 召回命中独立扭矩 CAPA 样本。'],
    })
    const [monitor] = buildQualityKnowledgeGrayReleaseMonitorRecords([grayR3], [], {
      policyLabel: '质量推荐灰度扩大门禁',
      thresholdLabel: '采纳率 >= 80%，复验通过率 100%，负样本误召回 0 次',
      auditLabel: 'AUD-KG-QA-GRAY-GATE-20260521-001',
      minAdoptionRatePercent: 80,
      requireRecheckPassRate: true,
      requireZeroFalseRecall: true,
    })

    const pendingDecision = decideQualityKnowledgeGrayRelease(monitor, 'expanded', '2026-05-22T11:00:00.000Z')

    expect(pendingDecision).toEqual(expect.objectContaining({
      decision: 'expanded',
      approvalStatus: 'pending',
      approvalLabel: '待质量主管确认',
      releaseTraceId: monitor.traceId,
    }))
    expect(readQualityKnowledgeGrayReleaseDecisionRecords()).toEqual([pendingDecision])
    expect(readOtdEvidenceChainRecords()).toEqual(expect.arrayContaining([
      expect.objectContaining({
        id: `quality-gray-release-decision-${pendingDecision.id}`,
        status: 'ready',
        traceId: pendingDecision.traceId,
      }),
    ]))

    const approvedDecision = approveQualityKnowledgeGrayReleaseExpansion(pendingDecision, '2026-05-22T12:00:00.000Z')

    expect(approvedDecision).toEqual(expect.objectContaining({
      approvalStatus: 'approved',
      approvalLabel: '质量主管已确认扩大',
      approvedBy: '质量主管 刘工',
      approvedAt: '2026-05-22T12:00:00.000Z',
    }))
    expect(approvedDecision.actions).toContain(`质量主管已确认扩大灰度，${grayR3.trainingSetVersion} 可进入受控 active 推荐范围。`)
    expect(readQualityKnowledgeGrayReleaseDecisionRecords()).toEqual([approvedDecision])
    expect(readOtdEvidenceChainRecords()).toEqual(expect.arrayContaining([
      expect.objectContaining({
        id: `quality-gray-release-decision-${approvedDecision.id}`,
        status: 'closed',
        statusLabel: '扩大灰度范围',
        traceId: approvedDecision.traceId,
      }),
    ]))
  })

  it('tracks rollback review issues through close and prevalidation reopen evidence states', () => {
    const grayR3 = makeRetrainingVersion('QK-TRAIN-20260521-R3', 'gray_published', '2026-05-22T10:00:00.000Z')
    const [monitor] = buildQualityKnowledgeGrayReleaseMonitorRecords([grayR3])

    const rollbackDecision = decideQualityKnowledgeGrayRelease(monitor, 'rolled_back', '2026-05-22T11:00:00.000Z')

    expect(rollbackDecision).toEqual(expect.objectContaining({
      decision: 'rolled_back',
      approvalStatus: 'not_required',
      rollbackTargetVersion: 'QK-TRAIN-20260521-R2',
      reviewIssueStatus: 'open',
      reviewIssueLabel: '待复核',
    }))
    expect(rollbackDecision.reviewIssueId).toBe('R3-REVIEW-ISSUE-20260521-001')
    expect(readOtdEvidenceChainRecords()).toEqual(expect.arrayContaining([
      expect.objectContaining({
        id: `quality-gray-review-issue-${rollbackDecision.reviewIssueId}`,
        status: 'active',
        statusLabel: '待复核',
        traceId: rollbackDecision.reviewIssueTraceId,
      }),
    ]))

    const closedDecision = closeQualityKnowledgeGrayReviewIssueWithNegativeSample(rollbackDecision, '2026-05-22T12:00:00.000Z')

    expect(closedDecision).toEqual(expect.objectContaining({
      reviewIssueStatus: 'closed',
      reviewIssueLabel: '问题单已关闭',
      reviewIssueResolution: 'negative_sample_added',
      reviewIssueClosedAt: '2026-05-22T12:00:00.000Z',
    }))
    expect(readOtdEvidenceChainRecords()).toEqual(expect.arrayContaining([
      expect.objectContaining({
        id: `quality-gray-review-issue-${closedDecision.reviewIssueId}`,
        status: 'closed',
        statusLabel: '复核关闭',
        traceId: closedDecision.reviewIssueTraceId,
      }),
    ]))

    const reopenedDecision = reopenQualityKnowledgeGrayPrevalidationWithScopeAdjustment(rollbackDecision, '2026-05-22T13:00:00.000Z')

    expect(reopenedDecision).toEqual(expect.objectContaining({
      reviewIssueStatus: 'prevalidation_reopened',
      reviewIssueLabel: '已重开灰度前校验',
      reviewIssueResolution: 'scope_adjusted',
      reviewIssueClosedAt: '2026-05-22T13:00:00.000Z',
    }))
    expect(readOtdEvidenceChainRecords()).toEqual(expect.arrayContaining([
      expect.objectContaining({
        id: `quality-gray-review-issue-${reopenedDecision.reviewIssueId}`,
        status: 'ready',
        statusLabel: '重开校验',
        traceId: reopenedDecision.reviewIssueTraceId,
      }),
    ]))
  })

  it('builds traceable quality knowledge asset governance records for each governed asset stage', () => {
    const sample = createBarcodeQualityKnowledgeSample('2026-05-31T08:00:00.000Z')
    const closedReview = closeLowScoreQualityKnowledgeReviewQueueRecord(
      createLowScoreQualityKnowledgeReviewQueueRecord('2026-05-31T09:00:00.000Z'),
      '2026-05-31T10:00:00.000Z'
    )
    const publishedR2 = makeRetrainingVersion('QK-TRAIN-20260521-R2', 'published', '2026-05-21T10:00:00.000Z', {
      sourceReviewQueueId: closedReview.id,
    })
    const feedback = makeRecommendationFeedback()
    const grayR3 = makeRetrainingVersion('QK-TRAIN-20260521-R3', 'gray_published', '2026-05-22T10:00:00.000Z', {
      sourceReviewQueueId: `recommendation-feedback-${feedback.id}`,
      recommendationScope: ['OP-20 装配扭矩推荐链路灰度'],
    })
    const rollbackDecision = makeGrayReleaseDecision(grayR3.trainingSetVersion, 'rolled_back', 'not_required', {
      metricSnapshot: [
        { label: '推荐采纳率', value: '72%' },
        { label: '复验通过率', value: '88%' },
        { label: '负样本误召回', value: '1 次' },
      ],
      reviewIssueId: 'R3-REVIEW-ISSUE-20260521-001',
      reviewIssueTraceId: 'TRACE-KG-QA-R3-REVIEW-ISSUE',
    })

    const assets = buildQualityKnowledgeAssetGovernanceRecords(
      [sample],
      [closedReview],
      [publishedR2, grayR3],
      [feedback],
      [rollbackDecision]
    )

    expect(assets.every(asset => asset.auditId.trim().length > 0 && asset.traceId.trim().length > 0)).toBe(true)
    expect(assets.map(asset => asset.assetStage)).toEqual(expect.arrayContaining([
      '样本入库',
      '禁用',
      '负样本',
      '再训练候选',
      '推荐采纳',
      '下一轮训练集',
      '实验负样本',
      '风险阈值',
    ]))
    expect(assets.find(asset => asset.assetStage === '样本入库')).toEqual(expect.objectContaining({
      auditId: sample.auditId,
      traceId: sample.traceId,
      sourceDocumentTitle: sample.documentTitle,
    }))
    expect(assets.find(asset => asset.assetStage === '禁用')).toEqual(expect.objectContaining({
      auditId: closedReview.decisionAuditId,
      traceId: closedReview.decisionTraceId,
      statusClass: 'guarded',
    }))
    expect(assets.find(asset => asset.assetStage === '再训练候选')).toEqual(expect.objectContaining({
      auditId: publishedR2.publishAuditId,
      traceId: publishedR2.publishTraceId,
      statusLabel: publishedR2.statusLabel,
    }))
    expect(assets.find(asset => asset.assetStage === '推荐采纳')).toEqual(expect.objectContaining({
      auditId: feedback.auditId,
      traceId: feedback.traceId,
      statusClass: 'accepted',
    }))
    expect(assets.find(asset => asset.assetStage === '下一轮训练集')).toEqual(expect.objectContaining({
      auditId: grayR3.publishAuditId,
      traceId: grayR3.publishTraceId,
      statusLabel: grayR3.statusLabel,
    }))
    expect(assets.find(asset => asset.assetStage === '实验负样本')).toEqual(expect.objectContaining({
      auditId: rollbackDecision.auditId,
      traceId: rollbackDecision.traceId,
      statusLabel: '已从主动推荐排除',
    }))
    expect(assets.find(asset => asset.assetStage === '风险阈值')).toEqual(expect.objectContaining({
      auditId: rollbackDecision.auditId,
      traceId: rollbackDecision.traceId,
      statusLabel: '扩大门禁收紧',
    }))
  })

  it('writes OTD evidence for quality retraining validation, publish, and rollback lifecycle', () => {
    const approvedVersion = makeRetrainingVersion('QK-TRAIN-20260521-R2', 'approved', '2026-05-21T10:00:00.000Z', {
      validationStatus: undefined,
      validatedAt: undefined,
      validationAuditId: undefined,
      validationTraceId: undefined,
      validationSummary: undefined,
      validationFindings: undefined,
      publishedAt: undefined,
      publishAuditId: undefined,
      publishTraceId: undefined,
      publishSummary: undefined,
    })

    const failedValidation = runQualityKnowledgeRetrainingValidation(approvedVersion, '2026-05-21T11:00:00.000Z')

    expect(readOtdEvidenceChainRecords()).toEqual(expect.arrayContaining([
      expect.objectContaining({
        id: `quality-knowledge-retraining-approval-${approvedVersion.id}`,
        stage: '知识再训练审批',
        status: 'active',
        statusLabel: '审批保留 / 校验未通过',
        traceId: approvedVersion.approvalTraceId,
      }),
      expect.objectContaining({
        id: `quality-knowledge-retraining-validation-${approvedVersion.id}`,
        stage: '知识再训练校验',
        status: 'active',
        statusLabel: '发布前校验未通过',
        traceId: failedValidation.validationTraceId,
      }),
    ]))

    const passedValidation = rerunQualityKnowledgeRetrainingValidationPass(failedValidation, '2026-05-21T12:00:00.000Z')

    expect(readOtdEvidenceChainRecords()).toEqual(expect.arrayContaining([
      expect.objectContaining({
        id: `quality-knowledge-retraining-validation-pass-${approvedVersion.id}`,
        stage: '知识再训练校验通过',
        status: 'ready',
        statusLabel: '发布前校验已通过',
        traceId: passedValidation.validationTraceId,
      }),
    ]))

    const publishedVersion = publishQualityKnowledgeRetrainingVersion(passedValidation, '2026-05-21T13:00:00.000Z')

    expect(readOtdEvidenceChainRecords()).toEqual(expect.arrayContaining([
      expect.objectContaining({
        id: `quality-knowledge-retraining-approval-${approvedVersion.id}`,
        stage: '知识再训练审批',
        status: 'closed',
        statusLabel: '审批保留 / 已发布',
        traceId: approvedVersion.approvalTraceId,
      }),
      expect.objectContaining({
        id: `quality-knowledge-retraining-validation-pass-${approvedVersion.id}`,
        stage: '知识再训练校验通过',
        status: 'closed',
        statusLabel: '校验通过 / 已发布',
        traceId: passedValidation.validationTraceId,
      }),
      expect.objectContaining({
        id: `quality-knowledge-retraining-publish-${approvedVersion.id}`,
        stage: '知识再训练发布',
        status: 'closed',
        statusLabel: '已发布到 AI 推荐',
        traceId: publishedVersion.publishTraceId,
      }),
    ]))

    const rolledBackVersion = rollbackQualityKnowledgeRetrainingVersion(failedValidation, '2026-05-21T14:00:00.000Z')

    expect(readOtdEvidenceChainRecords()).toEqual(expect.arrayContaining([
      expect.objectContaining({
        id: `quality-knowledge-retraining-approval-${approvedVersion.id}`,
        stage: '知识再训练审批',
        status: 'closed',
        statusLabel: '审批保留 / 已回滚',
        traceId: approvedVersion.approvalTraceId,
      }),
      expect.objectContaining({
        id: `quality-knowledge-retraining-validation-${approvedVersion.id}`,
        stage: '知识再训练校验',
        status: 'closed',
        statusLabel: '校验失败已触发回滚',
        traceId: failedValidation.validationTraceId,
      }),
      expect.objectContaining({
        id: `quality-knowledge-retraining-rollback-${approvedVersion.id}`,
        stage: '知识再训练回滚',
        status: 'closed',
        statusLabel: '已回滚到 R1',
        traceId: rolledBackVersion.rollbackTraceId,
      }),
    ]))
  })

  it('keeps reopened gray republish active after scope-adjusted rollback review is revalidated', () => {
    const publishedR2 = makeRetrainingVersion('QK-TRAIN-20260521-R2', 'published', '2026-05-21T10:00:00.000Z')
    const initialGrayR3 = makeRetrainingVersion('QK-TRAIN-20260521-R3', 'gray_published', '2026-05-22T10:00:00.000Z')
    const scopeAdjustedRollback = makeGrayReleaseDecision(initialGrayR3.trainingSetVersion, 'rolled_back', 'not_required', {
      reviewIssueId: 'R3-REVIEW-ISSUE-20260521-001',
      reviewIssueTraceId: 'TRACE-KG-QA-R3-REVIEW-ISSUE',
      reviewIssueStatus: 'prevalidation_reopened',
      reviewIssueLabel: '已重开灰度前校验',
      reviewIssueResolution: 'scope_adjusted',
      reviewIssueValidationAuditId: 'AUD-KG-QA-RETRAINING-R3-SCOPE-REVALIDATION-20260521-001',
      reviewIssueValidationTraceId: 'TRACE-KG-QA-WO-DEMO-1018-OP-20-R3-SCOPE-REVALIDATION',
    })
    const revalidatedR3 = runQualityKnowledgeNextTrainingSetValidationPass(initialGrayR3, '2026-05-22T12:00:00.000Z', 'reopened')
    const republishedR3 = grayPublishQualityKnowledgeNextTrainingSetVersion(revalidatedR3, '2026-05-22T13:00:00.000Z', 'reopened')

    expect(republishedR3).toEqual(expect.objectContaining({
      status: 'gray_published',
      statusLabel: '已重新灰度发布',
      publishAuditId: 'AUD-KG-QA-RETRAINING-R3-GRAY-REPUBLISH-20260521-001',
      publishTraceId: 'TRACE-KG-QA-WO-DEMO-1018-OP-20-R3-GRAY-REPUBLISHED',
    }))
    expect(readOtdEvidenceChainRecords()).toEqual(expect.arrayContaining([
      expect.objectContaining({
        id: `quality-knowledge-retraining-validation-pass-${initialGrayR3.id}`,
        status: 'closed',
        statusLabel: '校验通过 / 已发布',
        traceId: revalidatedR3.validationTraceId,
      }),
      expect.objectContaining({
        id: `quality-knowledge-retraining-publish-${initialGrayR3.id}`,
        stage: '知识再训练灰度发布',
        status: 'closed',
        statusLabel: '已重新灰度发布',
        traceId: republishedR3.publishTraceId,
      }),
    ]))
    expect(selectActiveQualityKnowledgeRecommendationVersion(
      [publishedR2, republishedR3],
      'WO-DEMO-1018',
      'OP-20',
      [scopeAdjustedRollback]
    )?.trainingSetVersion).toBe(republishedR3.trainingSetVersion)
    expect(selectPrioritizedQualityKnowledgeRecommendationVersion(
      [publishedR2, republishedR3],
      'WO-DEMO-1018',
      'OP-20',
      [scopeAdjustedRollback]
    )?.trainingSetVersion).toBe(republishedR3.trainingSetVersion)
  })

  it('builds traceable experiment candidates from rolled-back recommendation gray releases', () => {
    const rolledBackGrayR5 = makeRetrainingVersion('QK-TRAIN-20260521-R5', 'gray_published', '2026-05-22T10:00:00.000Z', {
      negativeSampleCount: 4,
      validationFindings: ['跨线同名扭矩偏移误召回 1 次。'],
    })
    const rollbackDecision = makeGrayReleaseDecision(rolledBackGrayR5.trainingSetVersion, 'rolled_back', 'not_required', {
      metricSnapshot: [
        { label: '推荐采纳率', value: '72%' },
        { label: '复验通过率', value: '88%' },
        { label: '负样本误召回', value: '1 次' },
      ],
    })
    const feedback = makeRecommendationFeedback({
      trainingSetVersion: rolledBackGrayR5.trainingSetVersion,
      nextTrainingSetVersion: 'QK-TRAIN-20260521-R6',
      nextTrainingTraceId: 'TRACE-KG-QA-R6-MERGED',
    })

    const initialCandidates = buildQualityKnowledgeRecommendationExperimentCandidateRecords(
      [rolledBackGrayR5],
      [feedback],
      [rollbackDecision],
      {
        policyLabel: '质量推荐灰度扩大门禁',
        thresholdLabel: '推荐采纳率 100%，复验通过率 >= 95%，负样本误召回 0 次',
        auditLabel: 'AUD-KG-QA-GRAY-GATE-STRICT-20260521-001',
        minAdoptionRatePercent: 100,
        minRecheckPassRatePercent: 95,
        requireRecheckPassRate: true,
        requireZeroFalseRecall: true,
      }
    )

    const negativePatch = initialCandidates.find(candidate => candidate.candidateType === 'negative_sample_patch')
    const shadowValidation = initialCandidates.find(candidate => candidate.candidateType === 'shadow_validation')

    expect(initialCandidates).toHaveLength(2)
    expect(negativePatch).toEqual(expect.objectContaining({
      candidateTrainingSetVersion: 'QK-TRAIN-20260521-R6',
      sourceTrainingSetVersion: rolledBackGrayR5.trainingSetVersion,
      statusClass: 'guarded',
      negativeCoverageLabel: '4 / 5 条',
      coveragePercentLabel: '80%',
      gapLabel: '需补 1 条跨线负样本',
      adoptionRateLabel: '72%',
      recheckPassRateLabel: '88%',
      falseRecallLabel: '1 次',
      sourceAuditId: rollbackDecision.auditId,
      sourceTraceId: rollbackDecision.traceId,
      auditId: 'AUD-KG-QA-RETRAINING-R6-NEGATIVE-COVERAGE-20260521-001',
      traceId: 'TRACE-KG-QA-WO-DEMO-1018-OP-20-R6-NEGATIVE-COVERAGE',
    }))
    expect(negativePatch?.nextAction).toContain('必须重新跑')
    expect(negativePatch?.references).toEqual(expect.arrayContaining([
      rollbackDecision.reason,
      `${rollbackDecision.auditId} / ${rollbackDecision.traceId}`,
      `${feedback.auditId} / ${feedback.traceId}`,
      `下一轮训练 ${feedback.nextTrainingSetVersion} / ${feedback.nextTrainingTraceId}`,
      '跨线同名扭矩偏移误召回 1 次。',
    ]))
    expect(shadowValidation).toEqual(expect.objectContaining({
      candidateTrainingSetVersion: 'QK-TRAIN-20260521-R7',
      candidateType: 'shadow_validation',
      statusClass: 'logged',
      sourceAuditId: negativePatch?.auditId,
      sourceTraceId: negativePatch?.traceId,
      traceId: 'TRACE-KG-QA-WO-DEMO-1018-OP-20-R7-SHADOW-VALIDATION',
    }))
    expect(shadowValidation?.nextAction).toContain('连续两轮误召回 0 次后才允许提交扩大审批')

    if (!negativePatch) throw new Error('negative sample patch candidate should exist')
    const mergedPatchVersion = mergeQualityExperimentNegativeSampleCandidate(negativePatch)
    const candidatesAfterPatchMerge = buildQualityKnowledgeRecommendationExperimentCandidateRecords(
      [rolledBackGrayR5, mergedPatchVersion],
      [feedback],
      [rollbackDecision]
    )
    const mergedNegativePatch = candidatesAfterPatchMerge.find(candidate => candidate.candidateType === 'negative_sample_patch')
    const queuedShadowValidation = candidatesAfterPatchMerge.find(candidate => candidate.candidateType === 'shadow_validation')

    expect(mergedNegativePatch).toEqual(expect.objectContaining({
      statusLabel: '补样已合并',
      statusClass: 'accepted',
      auditId: mergedPatchVersion.approvalAuditId,
      traceId: mergedPatchVersion.approvalTraceId,
      negativeCoverageLabel: '5 / 5 条',
      coveragePercentLabel: '100%',
    }))
    expect(queuedShadowValidation).toEqual(expect.objectContaining({
      sourceAuditId: mergedPatchVersion.approvalAuditId,
      sourceTraceId: mergedPatchVersion.approvalTraceId,
      statusLabel: '影子验证待执行',
    }))

    if (!queuedShadowValidation) throw new Error('shadow validation candidate should exist after patch merge')
    const validatedShadowVersion = runQualityExperimentShadowValidationCandidate(queuedShadowValidation)
    const publishedShadowVersion = grayPublishQualityExperimentShadowValidationVersion(validatedShadowVersion)
    const candidatesAfterShadowPublish = buildQualityKnowledgeRecommendationExperimentCandidateRecords(
      [rolledBackGrayR5, mergedPatchVersion, publishedShadowVersion],
      [feedback],
      [rollbackDecision]
    )
    const publishedShadowCandidate = candidatesAfterShadowPublish.find(candidate => candidate.candidateType === 'shadow_validation')

    expect(publishedShadowCandidate).toEqual(expect.objectContaining({
      statusLabel: '影子灰度已发布',
      statusClass: 'accepted',
      auditId: publishedShadowVersion.publishAuditId,
      traceId: publishedShadowVersion.publishTraceId,
      gapLabel: '影子灰度已发布',
    }))
    expect(publishedShadowCandidate?.nextAction).toContain('等待质量主管确认')
    expect(publishedShadowCandidate?.references).toEqual(expect.arrayContaining([
      '跨线 OP-20 扭矩偏移影子灰度',
      '跨线影子场景 LX-A / LX-B 均未触发同名缺陷误召回。',
    ]))
  })

  it('summarizes expanded and rolled-back gray recommendation experiments with auditable gate evidence', () => {
    const expandedGrayR6 = makeRetrainingVersion('QK-TRAIN-20260521-R6', 'gray_published', '2026-05-22T10:00:00.000Z')
    const rolledBackGrayR5 = makeRetrainingVersion('QK-TRAIN-20260521-R5', 'gray_published', '2026-05-22T09:00:00.000Z')
    const expandedDecision = makeGrayReleaseDecision(expandedGrayR6.trainingSetVersion, 'expanded', 'approved', {
      releaseCycleLabel: '首次灰度发布',
      decidedAt: '2026-05-22T12:00:00.000Z',
      metricSnapshot: [
        { label: '推荐采纳率', value: '100%' },
        { label: '复验通过率', value: '100%' },
        { label: '负样本误召回', value: '0 次' },
      ],
    })
    const staleRollbackDecision = makeGrayReleaseDecision(expandedGrayR6.trainingSetVersion, 'rolled_back', 'not_required', {
      releaseCycleLabel: '首次灰度发布',
      decidedAt: '2026-05-22T11:00:00.000Z',
      auditId: 'AUD-QK-TRAIN-20260521-R6-STALE-ROLLBACK',
      traceId: 'TRACE-QK-TRAIN-20260521-R6-STALE-ROLLBACK',
      metricSnapshot: [
        { label: '推荐采纳率', value: '50%' },
        { label: '复验通过率', value: '88%' },
        { label: '负样本误召回', value: '1 次' },
      ],
    })
    const rollbackDecision = makeGrayReleaseDecision(rolledBackGrayR5.trainingSetVersion, 'rolled_back', 'not_required', {
      releaseCycleLabel: '首次灰度发布',
      metricSnapshot: [
        { label: '推荐采纳率', value: '50%' },
        { label: '复验通过率', value: '88%' },
        { label: '负样本误召回', value: '1 次' },
      ],
    })
    const expandedFeedback = makeRecommendationFeedback({
      id: 'quality-feedback-r6-adoption',
      trainingSetVersion: expandedGrayR6.trainingSetVersion,
      decision: 'accepted',
      effectScoreAfter: 96,
      effectTrendLabel: '91 -> 96',
      auditId: 'AUD-KG-QA-FEEDBACK-R6-20260521-001',
      traceId: 'TRACE-KG-QA-FEEDBACK-R6',
      feedbackMetrics: [
        { label: '推荐采纳率', value: '100%' },
        { label: '复验通过率', value: '100%' },
        { label: '负样本误召回', value: '0 次' },
      ],
    })
    const rollbackFeedback = makeRecommendationFeedback({
      id: 'quality-feedback-r5-rejected',
      trainingSetVersion: rolledBackGrayR5.trainingSetVersion,
      decision: 'rejected',
      effectScoreAfter: 70,
      effectTrendLabel: '89 -> 70',
      auditId: 'AUD-KG-QA-FEEDBACK-R5-20260521-001',
      traceId: 'TRACE-KG-QA-FEEDBACK-R5',
      feedbackMetrics: [
        { label: '推荐采纳率', value: '50%' },
        { label: '复验通过率', value: '88%' },
        { label: '负样本误召回', value: '1 次' },
      ],
    })

    const comparisons = buildQualityKnowledgeRecommendationExperimentComparisonRecords(
      [expandedGrayR6, rolledBackGrayR5],
      [expandedFeedback, rollbackFeedback],
      [staleRollbackDecision, expandedDecision, rollbackDecision]
    )

    expect(comparisons).toHaveLength(2)
    expect(comparisons[0]).toEqual(expect.objectContaining({
      trainingSetVersion: expandedGrayR6.trainingSetVersion,
      statusLabel: '实验已扩大',
      statusClass: 'accepted',
      decisionLabel: '扩大灰度范围 / 质量主管已确认扩大',
      decisionAuditId: expandedDecision.auditId,
      decisionTraceId: expandedDecision.traceId,
      adoptionRateLabel: '100%',
      recheckPassRateLabel: '100%',
      falseRecallLabel: '0 次',
      gatePassLabel: '门禁通过',
      feedbackAuditLabel: expandedFeedback.auditId,
      feedbackTraceLabel: expandedFeedback.traceId,
      experimentScoreLabel: '99 分',
    }))
    expect(comparisons[1]).toEqual(expect.objectContaining({
      trainingSetVersion: rolledBackGrayR5.trainingSetVersion,
      statusLabel: '实验已回滚',
      statusClass: 'guarded',
      decisionLabel: '回滚到 R2 正式版 / 回滚无需扩大审批',
      decisionAuditId: rollbackDecision.auditId,
      decisionTraceId: rollbackDecision.traceId,
      adoptionRateLabel: '0%',
      recheckPassRateLabel: '88%',
      falseRecallLabel: '1 次',
      gatePassLabel: '门禁未通过',
      feedbackAuditLabel: rollbackFeedback.auditId,
      feedbackTraceLabel: rollbackFeedback.traceId,
      experimentScoreLabel: '8 分',
    }))
  })

  it('prioritizes the latest approved gray expansion in quality knowledge reuse ranking', () => {
    const publishedR2 = makeRetrainingVersion('QK-TRAIN-20260521-R2', 'published', '2026-05-21T10:00:00.000Z')
    const expandedGrayR6 = makeRetrainingVersion('QK-TRAIN-20260521-R6', 'gray_published', '2026-05-22T10:00:00.000Z')
    const staleRollbackDecision = makeGrayReleaseDecision(expandedGrayR6.trainingSetVersion, 'rolled_back', 'not_required', {
      releaseCycleLabel: '首次灰度发布',
      decidedAt: '2026-05-22T11:00:00.000Z',
      auditId: 'AUD-QK-TRAIN-20260521-R6-STALE-ROLLBACK',
      traceId: 'TRACE-QK-TRAIN-20260521-R6-STALE-ROLLBACK',
    })
    const approvedExpansionDecision = makeGrayReleaseDecision(expandedGrayR6.trainingSetVersion, 'expanded', 'approved', {
      releaseCycleLabel: '首次灰度发布',
      decidedAt: '2026-05-22T12:00:00.000Z',
      auditId: 'AUD-QK-TRAIN-20260521-R6-LATEST-EXPANSION',
      traceId: 'TRACE-QK-TRAIN-20260521-R6-LATEST-EXPANSION',
      metricSnapshot: [
        { label: '推荐采纳率', value: '100%' },
        { label: '复验通过率', value: '100%' },
        { label: '负样本误召回', value: '0 次' },
      ],
    })

    const ranking = buildQualityKnowledgeReuseRanking(
      null,
      null,
      [publishedR2, expandedGrayR6],
      [],
      [staleRollbackDecision, approvedExpansionDecision]
    )
    const torqueRanking = ranking.find(item => item.id === 'reuse-rank-published-torque-retraining')

    expect(torqueRanking).toEqual(expect.objectContaining({
      trainingSetVersion: expandedGrayR6.trainingSetVersion,
      statusLabel: '实验扩大优先',
      experimentDecisionLabel: '扩大灰度范围 / 质量主管已确认扩大',
      experimentDecisionAuditId: approvedExpansionDecision.auditId,
      experimentDecisionTraceId: approvedExpansionDecision.traceId,
    }))
    expect(torqueRanking?.rankReason).toContain(approvedExpansionDecision.auditId)
    expect(torqueRanking?.rankReason).not.toContain(staleRollbackDecision.auditId)
    expect(torqueRanking?.riskTags).toContain('实验已扩大')
  })

  it('persists accepted quality recommendation feedback with next-training OTD evidence', () => {
    const publishedR2 = makeRetrainingVersion('QK-TRAIN-20260521-R2', 'published', '2026-05-21T10:00:00.000Z')
    const [ranking] = buildQualityKnowledgeReuseRanking(null, null, [publishedR2], [], [])

    const feedback = acceptQualityKnowledgeRecommendation(ranking, '2026-05-31T11:00:00.000Z')

    expect(readQualityKnowledgeRecommendationFeedbackRecords()).toEqual([expect.objectContaining({
      id: feedback.id,
      rankingId: ranking.id,
      trainingSetVersion: publishedR2.trainingSetVersion,
      targetWorkOrderId: ranking.targetWorkOrderId,
      operationCode: ranking.operationCode,
      auditId: feedback.auditId,
      traceId: feedback.traceId,
      nextTrainingSetVersion: 'QK-TRAIN-20260521-R3',
      nextTrainingTraceId: 'TRACE-KG-QA-WO-DEMO-1018-OP-20-NEXT-TRAINING-R3',
    })])
    expect(readOtdEvidenceChainRecords()).toEqual(expect.arrayContaining([
      expect.objectContaining({
        id: `quality-recommendation-feedback-${feedback.id}`,
        stage: '推荐采纳反馈',
        traceId: feedback.traceId,
        status: 'closed',
        statusLabel: feedback.decisionLabel,
      }),
      expect.objectContaining({
        id: `quality-recommendation-next-training-${feedback.id}`,
        stage: '下一轮训练集',
        traceId: feedback.nextTrainingTraceId,
        status: 'ready',
        statusLabel: '下一轮候选',
      }),
    ]))
  })

  it('builds admin quality governance cards with status-specific audit and trace evidence', () => {
    const openReview = createLowScoreQualityKnowledgeReviewQueueRecord('2026-05-31T09:40:00.000Z')
    const closedReview = closeLowScoreQualityKnowledgeReviewQueueRecord(openReview, '2026-05-31T10:00:00.000Z')
    const validationPassedVersion = runQualityKnowledgeNextTrainingSetValidationPass(
      approveQualityKnowledgeRetrainingCandidate(closedReview, '2026-05-31T10:10:00.000Z'),
      '2026-05-31T10:20:00.000Z'
    )
    const rolledBackVersion = rollbackQualityKnowledgeRetrainingVersion(validationPassedVersion, '2026-05-31T10:30:00.000Z')
    const feedback = makeRecommendationFeedback({
      id: 'quality-feedback-r3-governance',
      trainingSetVersion: validationPassedVersion.trainingSetVersion,
      nextTrainingSetVersion: 'QK-TRAIN-20260521-R4',
      nextTrainingTraceId: 'TRACE-KG-QA-R4-MERGED',
    })

    const policyCards = buildQualityKnowledgePolicyGovernanceRecords([openReview, closedReview])
    const retrainingCards = buildQualityKnowledgeRetrainingGovernanceRecords([validationPassedVersion, rolledBackVersion])
    const feedbackCards = buildQualityKnowledgeRecommendationFeedbackGovernanceRecords([feedback])

    expect(policyCards).toEqual([
      expect.objectContaining({
        id: `quality-policy-${openReview.id}`,
        statusLabel: openReview.statusLabel,
        statusClass: 'logged',
        auditId: openReview.auditId,
        traceId: openReview.traceId,
      }),
      expect.objectContaining({
        id: `quality-policy-${closedReview.id}`,
        statusLabel: closedReview.decisionLabel,
        statusClass: 'guarded',
        auditId: closedReview.decisionAuditId,
        traceId: closedReview.decisionTraceId,
        retrainingTraceId: closedReview.retrainingTraceId,
      }),
    ])
    expect(retrainingCards).toEqual([
      expect.objectContaining({
        id: `quality-retraining-governance-${validationPassedVersion.id}`,
        statusLabel: validationPassedVersion.statusLabel,
        statusClass: 'accepted',
        auditId: validationPassedVersion.validationAuditId,
        traceId: validationPassedVersion.validationTraceId,
        validationSummary: validationPassedVersion.validationFindings?.join(' / '),
      }),
      expect.objectContaining({
        id: `quality-retraining-governance-${rolledBackVersion.id}`,
        statusLabel: rolledBackVersion.statusLabel,
        statusClass: 'guarded',
        auditId: rolledBackVersion.rollbackAuditId,
        traceId: rolledBackVersion.rollbackTraceId,
        rollbackTarget: rolledBackVersion.rollbackTargetVersion,
      }),
    ])
    expect(feedbackCards).toEqual([
      expect.objectContaining({
        id: `quality-recommendation-feedback-governance-${feedback.id}`,
        statusLabel: feedback.decisionLabel,
        statusClass: 'accepted',
        trainingLabel: `${feedback.trainingSetVersion} -> ${feedback.nextTrainingSetVersion}`,
        auditId: feedback.auditId,
        traceId: feedback.traceId,
        nextTrainingTraceId: feedback.nextTrainingTraceId,
        metricsLabel: '推荐采纳率 100% / 复验通过率 100%',
      }),
    ])
  })
})
