import { beforeEach, describe, expect, it, vi } from 'vitest'
import { installMemoryLocalStorage } from './test-storage'
import { findAssistantCitationTrace, readAssistantCitationTraces } from '../../src/utils/knowledge-citations'
import {
  acceptQualityKnowledgeRecommendation,
  approveQualityKnowledgeRetrainingCandidate,
  buildQualityKnowledgeReuseRanking,
  closeLowScoreQualityKnowledgeReviewQueueRecord,
  createBarcodeQualityKnowledgeSample,
  createBarcodeQualityReuseClosure,
  createBarcodeQualityReuseDraft,
  createLowScoreQualityKnowledgeReviewQueueRecord,
  grayPublishQualityKnowledgeNextTrainingSetVersion,
  runQualityKnowledgeNextTrainingSetValidationPass,
  verifyQualityKnowledgeReuseClosure,
  writeQualityKnowledgeReviewQueueRecord,
  writeQualityKnowledgeReuseClosure,
  writeQualityKnowledgeReuseDraft,
  writeQualityKnowledgeSample,
} from '../../src/utils/quality-knowledge-sample-sync'
import {
  createDefaultKnowledgeGovernanceReview,
  writeKnowledgeGovernanceReview,
} from '../../src/utils/knowledge-governance-sync'

vi.mock('../../src/api/qualityKnowledgeEvidence', () => ({
  queryQualityKnowledgeEvidence: vi.fn(async () => []),
  upsertQualityKnowledgeEvidence: vi.fn(async () => undefined),
}))

vi.mock('../../src/api/knowledgeGovernanceEvidence', () => ({
  queryKnowledgeGovernanceReviews: vi.fn(async () => []),
  upsertKnowledgeGovernanceReview: vi.fn(async () => undefined),
}))

vi.mock('../../src/utils/otd-evidence-chain-sync', () => ({
  upsertOtdEvidenceChainRecord: vi.fn(),
}))

describe('knowledge citations', () => {
  beforeEach(() => {
    installMemoryLocalStorage()
    localStorage.clear()
  })

  it('keeps barcode quality reuse under review until the shop-floor sample is persisted', () => {
    const trace = findAssistantCitationTrace('扫码返工同类质量问题如何复用 CAPA 推荐？')

    expect(trace).toEqual(expect.objectContaining({
      id: 'barcode-quality-reuse',
      status: '需复核',
    }))
    expect(trace?.sources.map(source => source.sourceId)).toEqual([
      'kg-quality-torque',
      'kg-capa-closure',
    ])
    expect(trace?.blockedSource).toContain('扫码返工样本尚未沉淀为知识来源')
  })

  it('keeps barcode quality reuse under review when the stored sample has no reusable evidence chain', () => {
    localStorage.setItem('aimes_quality_knowledge_samples', JSON.stringify([
      {
        id: 'quality-knowledge-barcode-rework-wo-demo-1007',
        workOrderId: 'WO-DEMO-1007',
        operationCode: 'OP-20',
        processName: '装配扭矩复验',
        equipmentCode: 'TORQUE-ST-01',
        materialBatch: 'BATCH-20260531-A',
        defectPattern: '扫码返工后扭矩偏移',
        documentId: 'kg-quality-barcode-rework',
        documentTitle: '扫码返工 CAPA 复用样本',
        version: 'V1.0',
        validUntil: '2026-12-31',
        auditId: 'AUD-QK-BARCODE-REWORK-20260531-001',
        traceId: 'TRACE-QK-BARCODE-REWORK-WO-DEMO-1007',
        createdAt: '2026-05-31T08:00:00.000Z',
        summary: '缺少可复用 CAPA 推荐与证据链的样本不能支撑正式引用。',
        capaRecommendations: [],
        reuseTargets: [],
        evidenceTraceIds: [],
      },
    ]))

    const trace = findAssistantCitationTrace('扫码返工同类质量问题如何复用 CAPA 推荐？')

    expect(trace).toEqual(expect.objectContaining({
      id: 'barcode-quality-reuse',
      status: '需复核',
    }))
    expect(trace?.blockedSource).toContain('尚未沉淀')
  })

  it('cites persisted barcode quality sample only after recommendations and evidence traces exist', () => {
    const sample = writeQualityKnowledgeSample(createBarcodeQualityKnowledgeSample('2026-05-31T08:00:00.000Z'))

    const trace = findAssistantCitationTrace('扫码返工同类质量问题如何复用 CAPA 推荐？')

    expect(trace).toEqual(expect.objectContaining({
      id: 'barcode-quality-reuse',
      status: '可引用',
      answerIntent: expect.stringContaining(sample.workOrderId),
    }))
    expect(trace?.sources.map(source => source.sourceId)).toEqual(expect.arrayContaining([
      sample.documentId,
      `${sample.documentId}-recommendations`,
      `${sample.documentId}-evidence`,
    ]))
    expect(trace?.blockedSource).toContain(sample.auditId)
    expect(trace?.blockedSource).toContain(sample.traceId)
  })

  it('keeps reused CAPA draft visible but blocked until quality engineer review', () => {
    const sample = writeQualityKnowledgeSample(createBarcodeQualityKnowledgeSample('2026-05-31T08:00:00.000Z'))
    const draft = writeQualityKnowledgeReuseDraft(createBarcodeQualityReuseDraft(sample, '2026-05-31T08:10:00.000Z'))

    const trace = findAssistantCitationTrace('扫码返工同类质量问题如何复用 CAPA 推荐？')

    expect(trace?.sources.map(source => source.sourceId)).toContain('kg-quality-reuse-draft')
    expect(trace?.blockedSource).toContain(draft.auditId)
    expect(trace?.blockedSource).toContain(draft.traceId)
    expect(trace?.blockedSource).toContain('草案仍需质量工程师复核')
  })

  it('adds verified closure, gray retraining release, and field feedback to the citation audit source', () => {
    const sample = writeQualityKnowledgeSample(createBarcodeQualityKnowledgeSample('2026-05-31T08:00:00.000Z'))
    const draft = writeQualityKnowledgeReuseDraft(createBarcodeQualityReuseDraft(sample, '2026-05-31T08:10:00.000Z'))
    const closure = verifyQualityKnowledgeReuseClosure(
      writeQualityKnowledgeReuseClosure(createBarcodeQualityReuseClosure(draft, '2026-05-31T08:30:00.000Z')),
      '2026-05-31T09:30:00.000Z'
    )
    const closedReview = closeLowScoreQualityKnowledgeReviewQueueRecord(
      writeQualityKnowledgeReviewQueueRecord(createLowScoreQualityKnowledgeReviewQueueRecord('2026-05-31T09:40:00.000Z')),
      '2026-05-31T10:00:00.000Z'
    )
    const approved = approveQualityKnowledgeRetrainingCandidate(closedReview, '2026-05-31T10:10:00.000Z')
    const published = grayPublishQualityKnowledgeNextTrainingSetVersion(
      runQualityKnowledgeNextTrainingSetValidationPass(approved, '2026-05-31T10:20:00.000Z'),
      '2026-05-31T10:30:00.000Z'
    )
    const ranking = buildQualityKnowledgeReuseRanking()[0]
    const feedback = acceptQualityKnowledgeRecommendation(ranking, '2026-05-31T11:00:00.000Z')

    const trace = findAssistantCitationTrace('扫码返工同类质量问题如何复用 CAPA 推荐？')

    expect(trace?.sources.map(source => source.sourceId)).toEqual(expect.arrayContaining([
      'kg-quality-reuse-feedback',
      'kg-quality-retraining-gray-published',
      'kg-quality-recommendation-feedback',
    ]))
    expect(trace?.blockedSource).toContain(closure.auditId)
    expect(trace?.blockedSource).toContain(closure.effectTraceId)
    expect(trace?.blockedSource).toContain(published.publishAuditId)
    expect(trace?.blockedSource).toContain(published.publishTraceId)
    expect(trace?.blockedSource).toContain(feedback.auditId)
    expect(trace?.blockedSource).toContain(feedback.traceId)
  })

  it('upgrades CNC stoppage answer when the maintenance document has governance review evidence', () => {
    const review = writeKnowledgeGovernanceReview(createDefaultKnowledgeGovernanceReview('2026-05-31T12:00:00.000Z'))

    const trace = findAssistantCitationTrace('如果 CNC-001 故障 4 小时会怎样？')

    expect(trace).toEqual(expect.objectContaining({
      id: 'cnc-four-hour-fault',
      status: '可引用',
    }))
    expect(trace?.sources.map(source => source.sourceId)).toContain(review.documentId)
    expect(trace?.blockedSource).toContain(review.auditId)
    expect(trace?.blockedSource).toContain('已完成知识治理复核')
  })

  it('applies governance review evidence consistently to the trace inventory list', () => {
    const review = writeKnowledgeGovernanceReview(createDefaultKnowledgeGovernanceReview('2026-05-31T12:00:00.000Z'))

    const traces = readAssistantCitationTraces()
    const rushDelay = traces.find(trace => trace.id === 'rush-delay')
    const cncStoppage = traces.find(trace => trace.id === 'cnc-four-hour-fault')
    const engineeringConstraints = traces.find(trace => trace.id === 'engineering-constraints')

    expect(rushDelay?.sources.map(source => source.sourceId)).toContain(review.documentId)
    expect(cncStoppage?.sources.map(source => source.sourceId)).toContain(review.documentId)
    expect(engineeringConstraints?.sources.map(source => source.sourceId)).toContain(review.documentId)
    expect(rushDelay?.blockedSource).toContain(review.auditId)
    expect(cncStoppage?.blockedSource).toContain(review.auditId)
    expect(engineeringConstraints?.blockedSource).toContain(review.auditId)
  })

  it('keeps top-risk citations under review even when unrelated CNC governance evidence exists', () => {
    const review = writeKnowledgeGovernanceReview(createDefaultKnowledgeGovernanceReview('2026-05-31T12:00:00.000Z'))

    const trace = findAssistantCitationTrace('今天最高风险的 3 个工单是什么？')

    expect(trace).toEqual(expect.objectContaining({
      id: 'top-risk-orders',
      status: '需复核',
    }))
    expect(trace?.sources.map(source => source.sourceId)).not.toContain(review.documentId)
    expect(trace?.blockedSource).toContain('需质量负责人复核')
  })

  it('does not fabricate citations for unrelated assistant questions', () => {
    expect(findAssistantCitationTrace('今天食堂午餐有什么？')).toBeUndefined()
  })
})
