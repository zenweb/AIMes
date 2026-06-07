import { upsertOtdEvidenceChainRecord } from './otd-evidence-chain-sync'
import { readQualityExperimentExpansionGatePolicy, type QualityExperimentExpansionGatePolicy } from './agent-config-approval-sync'
import { queryQualityKnowledgeEvidence, upsertQualityKnowledgeEvidence } from '../api/qualityKnowledgeEvidence'

const STORAGE_KEY = 'aimes_quality_knowledge_samples'
const REUSE_DRAFT_STORAGE_KEY = 'aimes_quality_knowledge_reuse_drafts'
const REUSE_CLOSURE_STORAGE_KEY = 'aimes_quality_knowledge_reuse_closures'
const REVIEW_QUEUE_STORAGE_KEY = 'aimes_quality_knowledge_review_queue'
const RETRAINING_VERSION_STORAGE_KEY = 'aimes_quality_knowledge_retraining_versions'
const RECOMMENDATION_FEEDBACK_STORAGE_KEY = 'aimes_quality_knowledge_recommendation_feedback'
const GRAY_RELEASE_DECISION_STORAGE_KEY = 'aimes_quality_knowledge_gray_release_decisions'
const QUALITY_KNOWLEDGE_R3_GRAY_REPUBLISH_AUDIT_ID = 'AUD-KG-QA-RETRAINING-R3-GRAY-REPUBLISH-20260521-001'
const QUALITY_KNOWLEDGE_R3_GRAY_REPUBLISH_TRACE_ID = 'TRACE-KG-QA-WO-DEMO-1018-OP-20-R3-GRAY-REPUBLISHED'

export interface QualityKnowledgeSampleRecord {
  id: string
  workOrderId: string
  operationCode: string
  processName: string
  equipmentCode: string
  materialBatch: string
  defectPattern: string
  documentId: string
  documentTitle: string
  version: string
  validUntil: string
  auditId: string
  traceId: string
  createdAt: string
  summary: string
  capaRecommendations: string[]
  reuseTargets: string[]
  evidenceTraceIds: string[]
}

export interface QualityKnowledgeReuseDraftRecord {
  id: string
  sourceSampleId: string
  sourceTraceId: string
  targetWorkOrderId: string
  targetOperationCode: string
  targetProcessName: string
  targetEquipmentCode: string
  targetMaterialBatch: string
  targetDefectPattern: string
  matchScore: number
  effectScore: number
  auditId: string
  traceId: string
  createdAt: string
  summary: string
  matchDimensions: Array<{
    label: string
    source: string
    target: string
    matched: boolean
  }>
  dispositionDraft: string[]
  effectMetrics: Array<{
    label: string
    value: string
  }>
  evidenceTraceIds: string[]
}

export type QualityKnowledgeReuseClosureStatus = 'approved' | 'verified'

export interface QualityKnowledgeReuseClosureRecord {
  id: string
  draftId: string
  draftTraceId: string
  targetWorkOrderId: string
  targetOperationCode: string
  formalCapaTitle: string
  owner: string
  dueAt: string
  verification: string
  auditId: string
  traceId: string
  effectTraceId: string
  approvedAt: string
  verifiedAt?: string
  status: QualityKnowledgeReuseClosureStatus
  statusLabel: string
  effectScoreBefore: number
  effectScoreAfter: number
  effectReview: string
  feedbackActions: string[]
  feedbackMetrics: Array<{
    label: string
    value: string
  }>
}

export interface QualityKnowledgeReuseRankingItem {
  id: string
  title: string
  targetWorkOrderId: string
  operationCode: string
  matchScore: number
  effectScore: number
  statusLabel: string
  recommendation: string
  evidenceTraceId: string
  rankReason: string
  reviewRequired: boolean
  riskTags: string[]
  trainingSetVersion?: string
  releaseScopeLabel?: string
  auditId?: string
  feedbackAuditId?: string
  feedbackTraceId?: string
  effectTrendLabel?: string
  nextTrainingSetVersion?: string
  experimentDecisionLabel?: string
  experimentDecisionAuditId?: string
  experimentDecisionTraceId?: string
  excludedExperimentVersions?: string[]
}

export interface QualityKnowledgeReviewQueueRecord {
  id: string
  sourceRankingId: string
  targetWorkOrderId: string
  operationCode: string
  title: string
  reason: string
  owner: string
  dueAt: string
  auditId: string
  traceId: string
  createdAt: string
  status: 'open' | 'closed'
  statusLabel: string
  effectScore: number
  reviewActions: string[]
  closedAt?: string
  decisionAuditId?: string
  decisionTraceId?: string
  decisionLabel?: string
  decisionSummary?: string
  disabledReuseRule?: string
  retrainingTraceId?: string
  retrainingPlan?: string[]
}

export interface QualityKnowledgePolicyGovernanceRecord {
  id: string
  title: string
  statusLabel: string
  statusClass: 'accepted' | 'guarded' | 'logged'
  thresholdLabel: string
  rule: string
  summary: string
  auditId: string
  traceId: string
  retrainingTraceId?: string
}

export interface QualityKnowledgeRetrainingGovernanceRecord {
  id: string
  title: string
  statusLabel: string
  statusClass: 'accepted' | 'guarded' | 'logged'
  versionLabel: string
  sampleLabel: string
  summary: string
  auditId: string
  traceId: string
  validationSummary: string
  rollbackTarget?: string
}

export interface QualityKnowledgeRecommendationFeedbackGovernanceRecord {
  id: string
  title: string
  statusLabel: string
  statusClass: 'accepted' | 'guarded' | 'logged'
  trainingLabel: string
  effectTrendLabel: string
  summary: string
  auditId: string
  traceId: string
  nextTrainingSetVersion: string
  nextTrainingTraceId: string
  metricsLabel: string
}

export type QualityKnowledgeGrayReleaseCycleLabel = '首次灰度发布' | '重新灰度发布'

export interface QualityKnowledgeGrayReleaseMonitorRecord {
  id: string
  title: string
  trainingSetVersion: string
  targetWorkOrderId: string
  operationCode: string
  publishedAt?: string
  releaseCycleLabel: QualityKnowledgeGrayReleaseCycleLabel
  statusLabel: string
  statusClass: 'accepted' | 'guarded' | 'logged'
  versionLabel: string
  scopeLabel: string
  recommendationScope: string[]
  adoptionRateLabel: string
  recheckPassRateLabel: string
  falseRecallLabel: string
  negativeSampleLabel: string
  summary: string
  auditId: string
  traceId: string
  metrics: Array<{
    label: string
    value: string
    statusClass: 'accepted' | 'guarded' | 'logged'
  }>
}

export interface QualityKnowledgeRecommendationExperimentComparisonRecord {
  id: string
  title: string
  trainingSetVersion: string
  targetWorkOrderId: string
  operationCode: string
  releaseCycleLabel: QualityKnowledgeGrayReleaseCycleLabel
  releaseScopeLabel: string
  recommendationScope: string[]
  statusLabel: string
  statusClass: 'accepted' | 'guarded' | 'logged'
  decisionLabel: string
  decisionStatusClass: 'accepted' | 'guarded' | 'logged'
  adoptionRateLabel: string
  recheckPassRateLabel: string
  falseRecallLabel: string
  effectTrendLabel: string
  experimentScoreLabel: string
  gatePolicyLabel: string
  gateAuditLabel: string
  gatePassLabel: string
  feedbackAuditLabel: string
  feedbackTraceLabel: string
  releaseAuditId: string
  releaseTraceId: string
  decisionAuditId?: string
  decisionTraceId?: string
  summary: string
}

export interface QualityKnowledgeRecommendationExperimentCandidateRecord {
  id: string
  title: string
  candidateTrainingSetVersion: string
  sourceTrainingSetVersion: string
  targetWorkOrderId: string
  operationCode: string
  candidateType: 'negative_sample_patch' | 'shadow_validation'
  statusLabel: string
  statusClass: 'accepted' | 'guarded' | 'logged'
  triggerLabel: string
  negativeCoverageLabel: string
  coveragePercentLabel: string
  gapLabel: string
  adoptionRateLabel: string
  recheckPassRateLabel: string
  falseRecallLabel: string
  gatePolicyLabel: string
  sourceAuditId: string
  sourceTraceId: string
  auditId: string
  traceId: string
  nextAction: string
  summary: string
  references: string[]
}

export type QualityKnowledgeGrayReleaseDecisionType = 'expanded' | 'rolled_back'
export type QualityKnowledgeGrayReleaseApprovalStatus = 'pending' | 'approved' | 'not_required'
export type QualityKnowledgeGrayReleaseReviewIssueStatus = 'open' | 'closed' | 'prevalidation_reopened'
export type QualityKnowledgeGrayReleaseReviewIssueResolution = 'negative_sample_added' | 'scope_adjusted'
export type QualityKnowledgeNextTrainingSetValidationMode = 'initial' | 'reopened'
export type QualityKnowledgeNextTrainingSetGrayPublishMode = 'initial' | 'reopened'
export interface QualityKnowledgeGrayReleaseDecisionRecord {
  id: string
  monitorId: string
  trainingSetVersion: string
  targetWorkOrderId: string
  operationCode: string
  releaseCycleLabel: QualityKnowledgeGrayReleaseCycleLabel
  releaseAuditId: string
  releaseTraceId: string
  releaseScopeLabel: string
  decision: QualityKnowledgeGrayReleaseDecisionType
  decisionLabel: string
  statusClass: 'accepted' | 'guarded' | 'logged'
  decidedBy: string
  decidedAt: string
  auditId: string
  traceId: string
  reason: string
  approvalStatus: QualityKnowledgeGrayReleaseApprovalStatus
  approvalLabel: string
  approvedBy?: string
  approvedAt?: string
  rollbackTargetVersion?: string
  expansionScope?: string[]
  reviewIssueId?: string
  reviewIssueTraceId?: string
  reviewIssueStatus?: QualityKnowledgeGrayReleaseReviewIssueStatus
  reviewIssueLabel?: string
  reviewIssueResolution?: QualityKnowledgeGrayReleaseReviewIssueResolution
  reviewIssueClosedBy?: string
  reviewIssueClosedAt?: string
  reviewIssueValidationAuditId?: string
  reviewIssueValidationTraceId?: string
  reviewIssueActions?: string[]
  metricSnapshot: Array<{
    label: string
    value: string
  }>
  actions: string[]
}

export interface QualityKnowledgeAssetGovernanceRecord {
  id: string
  title: string
  assetStage: '样本入库' | '禁用' | '负样本' | '再训练候选' | '推荐采纳' | '下一轮训练集' | '实验负样本' | '风险阈值' | '实验候选' | '复核中'
  statusLabel: string
  statusClass: 'accepted' | 'guarded' | 'logged'
  summary: string
  auditId: string
  traceId: string
  scoreLabel: string
  owner: string
  nextAction: string
  sourceDocumentTitle: string
  references: string[]
  experimentCandidateType?: QualityKnowledgeRecommendationExperimentCandidateRecord['candidateType']
}

export type QualityKnowledgeRetrainingVersionStatus = 'merged' | 'approved' | 'validation_failed' | 'validation_passed' | 'published' | 'gray_published' | 'rolled_back'
export type QualityKnowledgeRetrainingValidationStatus = 'failed' | 'passed'

export interface QualityKnowledgeRetrainingVersionRecord {
  id: string
  sourceReviewQueueId: string
  targetWorkOrderId: string
  operationCode: string
  candidateTraceId: string
  trainingSetVersion: string
  trainingSetName: string
  status: QualityKnowledgeRetrainingVersionStatus
  statusLabel: string
  approvedBy: string
  approvedAt: string
  approvalAuditId: string
  approvalTraceId: string
  positiveSampleCount: number
  negativeSampleCount: number
  featurePolicy: string
  changeSummary: string[]
  validationGates: string[]
  validationStatus?: QualityKnowledgeRetrainingValidationStatus
  validatedAt?: string
  validationAuditId?: string
  validationTraceId?: string
  validationSummary?: string
  validationFindings?: string[]
  publishedAt?: string
  publishAuditId?: string
  publishTraceId?: string
  publishSummary?: string
  recommendationScope?: string[]
  rolledBackAt?: string
  rollbackAuditId?: string
  rollbackTraceId?: string
  rollbackReason?: string
  rollbackTargetVersion?: string
}

export type QualityKnowledgeRecommendationFeedbackDecision = 'accepted' | 'rejected'

export interface QualityKnowledgeRecommendationFeedbackRecord {
  id: string
  rankingId: string
  trainingSetVersion: string
  targetWorkOrderId: string
  operationCode: string
  decision: QualityKnowledgeRecommendationFeedbackDecision
  decisionLabel: string
  owner: string
  reason: string
  decidedAt: string
  auditId: string
  traceId: string
  effectScoreBefore: number
  effectScoreAfter: number
  effectTrendLabel: string
  nextTrainingSetVersion: string
  nextTrainingTraceId: string
  feedbackActions: string[]
  feedbackMetrics: Array<{
    label: string
    value: string
  }>
}

function canUseStorage() {
  return typeof window !== 'undefined' && !!window.localStorage
}

function syncQualityKnowledgeEvidence<T extends { id: string }>(
  evidenceType: string,
  title: string,
  status: string,
  record: T,
  auditId: string,
  traceId: string,
  createdAt: string
) {
  void upsertQualityKnowledgeEvidence({
    id: record.id,
    evidenceType,
    title,
    auditId,
    traceId,
    status,
    createdAt,
    payload: record,
  }).catch(() => undefined)
}

async function readQualityKnowledgeEvidencePayloads<T>(
  evidenceType: string,
  isRecord: (item: Partial<T> | null | undefined) => item is T,
  take = 20
): Promise<T[]> {
  const records = await queryQualityKnowledgeEvidence<T>(evidenceType, take)
  if (!Array.isArray(records)) {
    throw new Error('后端返回非数组审计载荷')
  }
  return records.map(record => record.payload).filter(isRecord)
}

async function readQualityKnowledgeRecordsBackendFirst<T>(
  evidenceType: string,
  isRecord: (item: Partial<T> | null | undefined) => item is T,
  readLocalRecords: () => T[],
  take = 20,
  normalize: (item: T) => T = item => item
): Promise<T[]> {
  try {
    const records = await readQualityKnowledgeEvidencePayloads(evidenceType, isRecord, take)
    return records.length > 0 ? records.map(normalize) : readLocalRecords()
  } catch (error: unknown) {
    const localRecords = readLocalRecords()
    if (localRecords.length > 0) return localRecords
    throw error
  }
}

function isQualityKnowledgeSampleRecord(
  item: Partial<QualityKnowledgeSampleRecord> | null | undefined
): item is QualityKnowledgeSampleRecord {
  return !!item
    && typeof item.id === 'string'
    && typeof item.workOrderId === 'string'
    && typeof item.operationCode === 'string'
    && typeof item.processName === 'string'
    && typeof item.equipmentCode === 'string'
    && typeof item.materialBatch === 'string'
    && typeof item.defectPattern === 'string'
    && typeof item.documentId === 'string'
    && typeof item.documentTitle === 'string'
    && typeof item.version === 'string'
    && typeof item.validUntil === 'string'
    && typeof item.auditId === 'string'
    && typeof item.traceId === 'string'
    && typeof item.createdAt === 'string'
    && typeof item.summary === 'string'
    && Array.isArray(item.capaRecommendations)
    && hasNonEmptyTextItems(item.capaRecommendations)
    && Array.isArray(item.reuseTargets)
    && hasNonEmptyTextItems(item.reuseTargets)
    && Array.isArray(item.evidenceTraceIds)
    && hasNonEmptyTextItems(item.evidenceTraceIds)
}

function isQualityKnowledgeReuseDraftRecord(
  item: Partial<QualityKnowledgeReuseDraftRecord> | null | undefined
): item is QualityKnowledgeReuseDraftRecord {
  return !!item
    && typeof item.id === 'string'
    && typeof item.sourceSampleId === 'string'
    && typeof item.sourceTraceId === 'string'
    && typeof item.targetWorkOrderId === 'string'
    && typeof item.targetOperationCode === 'string'
    && typeof item.targetProcessName === 'string'
    && typeof item.targetEquipmentCode === 'string'
    && typeof item.targetMaterialBatch === 'string'
    && typeof item.targetDefectPattern === 'string'
    && typeof item.matchScore === 'number'
    && typeof item.effectScore === 'number'
    && typeof item.auditId === 'string'
    && typeof item.traceId === 'string'
    && typeof item.createdAt === 'string'
    && typeof item.summary === 'string'
    && Array.isArray(item.matchDimensions)
    && Array.isArray(item.dispositionDraft)
    && Array.isArray(item.effectMetrics)
    && Array.isArray(item.evidenceTraceIds)
}

function isQualityKnowledgeReuseClosureRecord(
  item: Partial<QualityKnowledgeReuseClosureRecord> | null | undefined
): item is QualityKnowledgeReuseClosureRecord {
  return !!item
    && typeof item.id === 'string'
    && typeof item.draftId === 'string'
    && typeof item.draftTraceId === 'string'
    && typeof item.targetWorkOrderId === 'string'
    && typeof item.targetOperationCode === 'string'
    && typeof item.formalCapaTitle === 'string'
    && typeof item.owner === 'string'
    && typeof item.dueAt === 'string'
    && typeof item.verification === 'string'
    && typeof item.auditId === 'string'
    && typeof item.traceId === 'string'
    && typeof item.effectTraceId === 'string'
    && typeof item.approvedAt === 'string'
    && ['approved', 'verified'].includes(String(item.status))
    && typeof item.statusLabel === 'string'
    && typeof item.effectScoreBefore === 'number'
    && typeof item.effectScoreAfter === 'number'
    && typeof item.effectReview === 'string'
    && Array.isArray(item.feedbackActions)
    && hasNonEmptyTextItems(item.feedbackActions)
    && Array.isArray(item.feedbackMetrics)
    && hasMetricItems(item.feedbackMetrics)
}

function isQualityKnowledgeReviewQueueRecord(
  item: Partial<QualityKnowledgeReviewQueueRecord> | null | undefined
): item is QualityKnowledgeReviewQueueRecord {
  return !!item
    && typeof item.id === 'string'
    && typeof item.sourceRankingId === 'string'
    && typeof item.targetWorkOrderId === 'string'
    && typeof item.operationCode === 'string'
    && typeof item.title === 'string'
    && typeof item.reason === 'string'
    && typeof item.owner === 'string'
    && typeof item.dueAt === 'string'
    && typeof item.auditId === 'string'
    && typeof item.traceId === 'string'
    && typeof item.createdAt === 'string'
    && ['open', 'closed'].includes(String(item.status))
    && typeof item.statusLabel === 'string'
    && typeof item.effectScore === 'number'
    && Array.isArray(item.reviewActions)
}

function isQualityKnowledgeRetrainingVersionRecord(
  item: Partial<QualityKnowledgeRetrainingVersionRecord> | null | undefined
): item is QualityKnowledgeRetrainingVersionRecord {
  return !!item
    && typeof item.id === 'string'
    && typeof item.sourceReviewQueueId === 'string'
    && typeof item.targetWorkOrderId === 'string'
    && typeof item.operationCode === 'string'
    && typeof item.candidateTraceId === 'string'
    && typeof item.trainingSetVersion === 'string'
    && typeof item.trainingSetName === 'string'
    && ['merged', 'approved', 'validation_failed', 'validation_passed', 'published', 'gray_published', 'rolled_back'].includes(String(item.status))
    && typeof item.statusLabel === 'string'
    && typeof item.approvedBy === 'string'
    && typeof item.approvedAt === 'string'
    && typeof item.approvalAuditId === 'string'
    && typeof item.approvalTraceId === 'string'
    && typeof item.positiveSampleCount === 'number'
    && typeof item.negativeSampleCount === 'number'
    && typeof item.featurePolicy === 'string'
    && Array.isArray(item.changeSummary)
    && Array.isArray(item.validationGates)
}

function isQualityKnowledgeRecommendationFeedbackRecord(
  item: Partial<QualityKnowledgeRecommendationFeedbackRecord> | null | undefined
): item is QualityKnowledgeRecommendationFeedbackRecord {
  return !!item
    && typeof item.id === 'string'
    && typeof item.rankingId === 'string'
    && typeof item.trainingSetVersion === 'string'
    && typeof item.targetWorkOrderId === 'string'
    && typeof item.operationCode === 'string'
    && ['accepted', 'rejected'].includes(String(item.decision))
    && typeof item.decisionLabel === 'string'
    && typeof item.owner === 'string'
    && typeof item.reason === 'string'
    && typeof item.decidedAt === 'string'
    && typeof item.auditId === 'string'
    && typeof item.traceId === 'string'
    && typeof item.effectScoreBefore === 'number'
    && typeof item.effectScoreAfter === 'number'
    && typeof item.effectTrendLabel === 'string'
    && typeof item.nextTrainingSetVersion === 'string'
    && typeof item.nextTrainingTraceId === 'string'
    && Array.isArray(item.feedbackActions)
    && hasNonEmptyTextItems(item.feedbackActions)
    && Array.isArray(item.feedbackMetrics)
    && hasMetricItems(item.feedbackMetrics)
}

function hasNonEmptyTextItems(items: unknown[]): items is string[] {
  return items.length > 0 && items.every(item => typeof item === 'string' && item.trim().length > 0)
}

function hasMetricItems(items: unknown[]): items is Array<{ label: string, value: string }> {
  return items.length > 0 && items.every(item =>
    !!item
    && typeof item === 'object'
    && typeof (item as { label?: unknown }).label === 'string'
    && (item as { label: string }).label.trim().length > 0
    && typeof (item as { value?: unknown }).value === 'string'
    && (item as { value: string }).value.trim().length > 0
  )
}

function isQualityKnowledgeGrayReleaseDecisionRecord(
  item: Partial<QualityKnowledgeGrayReleaseDecisionRecord> | null | undefined
): item is QualityKnowledgeGrayReleaseDecisionRecord {
  return !!item
    && typeof item.id === 'string'
    && typeof item.monitorId === 'string'
    && typeof item.trainingSetVersion === 'string'
    && typeof item.targetWorkOrderId === 'string'
    && typeof item.operationCode === 'string'
    && ['expanded', 'rolled_back'].includes(String(item.decision))
    && typeof item.decisionLabel === 'string'
    && ['accepted', 'guarded', 'logged'].includes(String(item.statusClass))
    && typeof item.decidedBy === 'string'
    && typeof item.decidedAt === 'string'
    && typeof item.auditId === 'string'
    && typeof item.traceId === 'string'
    && typeof item.reason === 'string'
    && ['pending', 'approved', 'not_required'].includes(String(item.approvalStatus))
    && typeof item.approvalLabel === 'string'
    && Array.isArray(item.metricSnapshot)
    && Array.isArray(item.actions)
}

function qualityGrayReviewIssueLabel(record: QualityKnowledgeGrayReleaseDecisionRecord) {
  if (!record.reviewIssueId) return undefined
  if (record.reviewIssueStatus === 'closed') return '问题单已关闭'
  if (record.reviewIssueStatus === 'prevalidation_reopened') return '已重开灰度前校验'
  return '待复核'
}

function qualityGrayReviewIssueEvidenceStatus(record: QualityKnowledgeGrayReleaseDecisionRecord) {
  if (record.reviewIssueStatus === 'closed') {
    return { status: 'closed' as const, statusLabel: '复核关闭' }
  }
  if (record.reviewIssueStatus === 'prevalidation_reopened') {
    return { status: 'ready' as const, statusLabel: '重开校验' }
  }
  return { status: 'active' as const, statusLabel: '待复核' }
}

function readQualityKnowledgeRecords<T>(
  storageKey: string,
  isRecord: (item: Partial<T> | null | undefined) => item is T,
  normalize: (item: T) => T = item => item
): T[] {
  try {
    const raw = window.localStorage.getItem(storageKey)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) {
      window.localStorage.removeItem(storageKey)
      return []
    }

    const validRecords = parsed.filter(isRecord).map(normalize)
    const serializedRecords = JSON.stringify(validRecords)
    if (validRecords.length === parsed.length) {
      if (serializedRecords !== JSON.stringify(parsed)) {
        window.localStorage.setItem(storageKey, serializedRecords)
      }
      return validRecords
    }

    if (validRecords.length > 0) {
      window.localStorage.setItem(storageKey, serializedRecords)
      return validRecords
    }

    window.localStorage.removeItem(storageKey)
    return []
  } catch {
    window.localStorage.removeItem(storageKey)
    return []
  }
}

export function readQualityKnowledgeSamples(): QualityKnowledgeSampleRecord[] {
  if (!canUseStorage()) return []
  return readQualityKnowledgeRecords(STORAGE_KEY, isQualityKnowledgeSampleRecord)
}

export async function readQualityKnowledgeSamplesBackendFirst(): Promise<QualityKnowledgeSampleRecord[]> {
  return readQualityKnowledgeRecordsBackendFirst('QualityKnowledgeSample', isQualityKnowledgeSampleRecord, readQualityKnowledgeSamples, 12)
}

export function readQualityKnowledgeReuseDrafts(): QualityKnowledgeReuseDraftRecord[] {
  if (!canUseStorage()) return []
  return readQualityKnowledgeRecords(REUSE_DRAFT_STORAGE_KEY, isQualityKnowledgeReuseDraftRecord)
}

export async function readQualityKnowledgeReuseDraftsBackendFirst(): Promise<QualityKnowledgeReuseDraftRecord[]> {
  return readQualityKnowledgeRecordsBackendFirst('QualityKnowledgeReuseDraft', isQualityKnowledgeReuseDraftRecord, readQualityKnowledgeReuseDrafts, 12)
}

export function readQualityKnowledgeReuseClosures(): QualityKnowledgeReuseClosureRecord[] {
  if (!canUseStorage()) return []
  return readQualityKnowledgeRecords(REUSE_CLOSURE_STORAGE_KEY, isQualityKnowledgeReuseClosureRecord)
}

export async function readQualityKnowledgeReuseClosuresBackendFirst(): Promise<QualityKnowledgeReuseClosureRecord[]> {
  return readQualityKnowledgeRecordsBackendFirst('QualityKnowledgeReuseClosure', isQualityKnowledgeReuseClosureRecord, readQualityKnowledgeReuseClosures, 12)
}

export function readQualityKnowledgeReviewQueueRecords(): QualityKnowledgeReviewQueueRecord[] {
  if (!canUseStorage()) return []
  return readQualityKnowledgeRecords(REVIEW_QUEUE_STORAGE_KEY, isQualityKnowledgeReviewQueueRecord)
}

export async function readQualityKnowledgeReviewQueueRecordsBackendFirst(): Promise<QualityKnowledgeReviewQueueRecord[]> {
  return readQualityKnowledgeRecordsBackendFirst('QualityKnowledgeReviewQueue', isQualityKnowledgeReviewQueueRecord, readQualityKnowledgeReviewQueueRecords, 12)
}

export function readQualityKnowledgeRetrainingVersionRecords(): QualityKnowledgeRetrainingVersionRecord[] {
  if (!canUseStorage()) return []
  return readQualityKnowledgeRecords(RETRAINING_VERSION_STORAGE_KEY, isQualityKnowledgeRetrainingVersionRecord)
}

export async function readQualityKnowledgeRetrainingVersionRecordsBackendFirst(): Promise<QualityKnowledgeRetrainingVersionRecord[]> {
  return readQualityKnowledgeRecordsBackendFirst('QualityKnowledgeRetrainingVersion', isQualityKnowledgeRetrainingVersionRecord, readQualityKnowledgeRetrainingVersionRecords, 12)
}

export function readQualityKnowledgeRecommendationFeedbackRecords(): QualityKnowledgeRecommendationFeedbackRecord[] {
  if (!canUseStorage()) return []
  return readQualityKnowledgeRecords(RECOMMENDATION_FEEDBACK_STORAGE_KEY, isQualityKnowledgeRecommendationFeedbackRecord)
}

export async function readQualityKnowledgeRecommendationFeedbackRecordsBackendFirst(): Promise<QualityKnowledgeRecommendationFeedbackRecord[]> {
  return readQualityKnowledgeRecordsBackendFirst(
    'QualityKnowledgeRecommendationFeedback',
    isQualityKnowledgeRecommendationFeedbackRecord,
    readQualityKnowledgeRecommendationFeedbackRecords,
    12
  )
}

export function readQualityKnowledgeGrayReleaseDecisionRecords(): QualityKnowledgeGrayReleaseDecisionRecord[] {
  if (!canUseStorage()) return []
  return readQualityKnowledgeRecords(
    GRAY_RELEASE_DECISION_STORAGE_KEY,
    isQualityKnowledgeGrayReleaseDecisionRecord,
    withQualityKnowledgeGrayReleaseDecisionDefaults
  )
}

export async function readQualityKnowledgeGrayReleaseDecisionRecordsBackendFirst(): Promise<QualityKnowledgeGrayReleaseDecisionRecord[]> {
  return readQualityKnowledgeRecordsBackendFirst(
    'QualityKnowledgeGrayReleaseDecision',
    isQualityKnowledgeGrayReleaseDecisionRecord,
    readQualityKnowledgeGrayReleaseDecisionRecords,
    12,
    withQualityKnowledgeGrayReleaseDecisionDefaults
  )
}

export function readLatestQualityKnowledgeSample() {
  return readQualityKnowledgeSamples()[0] ?? null
}

export function readLatestQualityKnowledgeReuseDraft() {
  return readQualityKnowledgeReuseDrafts()[0] ?? null
}

export function readLatestQualityKnowledgeReuseClosure() {
  return readQualityKnowledgeReuseClosures()[0] ?? null
}

export function readLatestQualityKnowledgeReviewQueueRecord() {
  return readQualityKnowledgeReviewQueueRecords()[0] ?? null
}

export function readLatestQualityKnowledgeRetrainingVersionRecord() {
  return readQualityKnowledgeRetrainingVersionRecords()[0] ?? null
}

export function readLatestQualityKnowledgeRecommendationFeedbackRecord() {
  return readQualityKnowledgeRecommendationFeedbackRecords()[0] ?? null
}

export function readLatestQualityKnowledgeGrayReleaseDecisionRecord() {
  return readQualityKnowledgeGrayReleaseDecisionRecords()[0] ?? null
}

export function selectActiveQualityKnowledgeRecommendationVersion(
  versions: QualityKnowledgeRetrainingVersionRecord[] = readQualityKnowledgeRetrainingVersionRecords(),
  targetWorkOrderId = 'WO-DEMO-1018',
  operationCode = 'OP-20',
  grayReleaseDecisions: QualityKnowledgeGrayReleaseDecisionRecord[] = readQualityKnowledgeGrayReleaseDecisionRecords()
) {
  const rolledBackVersions = new Set(
    grayReleaseDecisions
      .filter((decision) => {
        if (
          decision.decision !== 'rolled_back'
          || decision.approvalStatus === 'pending'
          || decision.targetWorkOrderId !== targetWorkOrderId
          || decision.operationCode !== operationCode
        ) {
          return false
        }
        const version = versions.find(item => item.trainingSetVersion === decision.trainingSetVersion)
        if (
          decision.reviewIssueStatus === 'prevalidation_reopened'
          && version?.status === 'gray_published'
          && isQualityKnowledgeGrayRepublishEvidence(version)
        ) {
          return false
        }
        return true
      })
      .map(decision => decision.trainingSetVersion)
  )
  const unapprovedShadowGrayVersions = new Set(
    versions
      .filter(version =>
        version.status === 'gray_published'
        && version.targetWorkOrderId === targetWorkOrderId
        && version.operationCode === operationCode
        && isQualityKnowledgeShadowGrayReleaseEvidence(version)
      )
      .filter(version => !grayReleaseDecisions.some(decision =>
        decision.trainingSetVersion === version.trainingSetVersion
        && decision.targetWorkOrderId === targetWorkOrderId
        && decision.operationCode === operationCode
        && decision.decision === 'expanded'
        && decision.approvalStatus === 'approved'
      ))
      .map(version => version.trainingSetVersion)
  )
  return [...versions]
    .filter(version =>
      (version.status === 'gray_published' || version.status === 'published')
      && version.targetWorkOrderId === targetWorkOrderId
      && version.operationCode === operationCode
      && !rolledBackVersions.has(version.trainingSetVersion)
      && !unapprovedShadowGrayVersions.has(version.trainingSetVersion)
    )
    .sort((left, right) => {
      const statusRank = (status: QualityKnowledgeRetrainingVersionStatus) => status === 'gray_published' ? 2 : 1
      const statusDelta = statusRank(right.status) - statusRank(left.status)
      if (statusDelta !== 0) return statusDelta
      const rightTime = Date.parse(right.publishedAt ?? right.validatedAt ?? right.approvedAt)
      const leftTime = Date.parse(left.publishedAt ?? left.validatedAt ?? left.approvedAt)
      if (Number.isFinite(rightTime) && Number.isFinite(leftTime) && rightTime !== leftTime) {
        return rightTime - leftTime
      }
      return right.trainingSetVersion.localeCompare(left.trainingSetVersion)
    })[0]
}

function latestQualityGrayReleaseDecisionForVersion(
  version: QualityKnowledgeRetrainingVersionRecord | undefined,
  grayReleaseDecisions: QualityKnowledgeGrayReleaseDecisionRecord[]
) {
  if (!version) return undefined
  const releaseCycleLabel = qualityKnowledgeGrayReleaseCycleLabel(version)
  return grayReleaseDecisions.find(decision =>
    decision.trainingSetVersion === version.trainingSetVersion
    && decision.targetWorkOrderId === version.targetWorkOrderId
    && decision.operationCode === version.operationCode
    && decision.releaseCycleLabel === releaseCycleLabel
  )
}

function qualityRecommendationVersionDecisionRank(
  version: QualityKnowledgeRetrainingVersionRecord,
  grayReleaseDecisions: QualityKnowledgeGrayReleaseDecisionRecord[]
) {
  const decision = latestQualityGrayReleaseDecisionForVersion(version, grayReleaseDecisions)
  if (decision?.decision === 'expanded' && decision.approvalStatus === 'approved') return 4
  if (version.status === 'gray_published') return 3
  if (version.status === 'published') return 2
  return 1
}

export function selectPrioritizedQualityKnowledgeRecommendationVersion(
  versions: QualityKnowledgeRetrainingVersionRecord[] = readQualityKnowledgeRetrainingVersionRecords(),
  targetWorkOrderId = 'WO-DEMO-1018',
  operationCode = 'OP-20',
  grayReleaseDecisions: QualityKnowledgeGrayReleaseDecisionRecord[] = readQualityKnowledgeGrayReleaseDecisionRecords()
) {
  const rolledBackVersions = new Set(
    grayReleaseDecisions
      .filter((decision) => {
        if (
          decision.decision !== 'rolled_back'
          || decision.approvalStatus === 'pending'
          || decision.targetWorkOrderId !== targetWorkOrderId
          || decision.operationCode !== operationCode
        ) {
          return false
        }
        const version = versions.find(item => item.trainingSetVersion === decision.trainingSetVersion)
        if (
          decision.reviewIssueStatus === 'prevalidation_reopened'
          && version?.status === 'gray_published'
          && isQualityKnowledgeGrayRepublishEvidence(version)
        ) {
          return false
        }
        return true
      })
      .map(decision => decision.trainingSetVersion)
  )
  const unapprovedShadowGrayVersions = new Set(
    versions
      .filter(version =>
        version.status === 'gray_published'
        && version.targetWorkOrderId === targetWorkOrderId
        && version.operationCode === operationCode
        && isQualityKnowledgeShadowGrayReleaseEvidence(version)
      )
      .filter(version => !grayReleaseDecisions.some(decision =>
        decision.trainingSetVersion === version.trainingSetVersion
        && decision.targetWorkOrderId === targetWorkOrderId
        && decision.operationCode === operationCode
        && decision.decision === 'expanded'
        && decision.approvalStatus === 'approved'
      ))
      .map(version => version.trainingSetVersion)
  )
  return [...versions]
    .filter(version =>
      (version.status === 'gray_published' || version.status === 'published')
      && version.targetWorkOrderId === targetWorkOrderId
      && version.operationCode === operationCode
      && !rolledBackVersions.has(version.trainingSetVersion)
      && !unapprovedShadowGrayVersions.has(version.trainingSetVersion)
    )
    .sort((left, right) => {
      const decisionRankDelta = qualityRecommendationVersionDecisionRank(right, grayReleaseDecisions) - qualityRecommendationVersionDecisionRank(left, grayReleaseDecisions)
      if (decisionRankDelta !== 0) return decisionRankDelta
      const rightTime = Date.parse(right.publishedAt ?? right.validatedAt ?? right.approvedAt)
      const leftTime = Date.parse(left.publishedAt ?? left.validatedAt ?? left.approvedAt)
      if (Number.isFinite(rightTime) && Number.isFinite(leftTime) && rightTime !== leftTime) {
        return rightTime - leftTime
      }
      return right.trainingSetVersion.localeCompare(left.trainingSetVersion)
    })[0]
}

export function isQualityKnowledgeGrayRepublishEvidence(record: {
  auditId?: string
  traceId?: string
  publishAuditId?: string
  publishTraceId?: string
}) {
  const auditId = record.publishAuditId ?? record.auditId
  const traceId = record.publishTraceId ?? record.traceId
  return auditId === QUALITY_KNOWLEDGE_R3_GRAY_REPUBLISH_AUDIT_ID
    || traceId === QUALITY_KNOWLEDGE_R3_GRAY_REPUBLISH_TRACE_ID
}

export function isQualityKnowledgeShadowGrayReleaseEvidence(record: {
  auditId?: string
  traceId?: string
  publishAuditId?: string
  publishTraceId?: string
  featurePolicy?: string
  recommendationScope?: string[]
}) {
  const auditId = record.publishAuditId ?? record.auditId
  const traceId = record.publishTraceId ?? record.traceId
  return auditId?.includes('SHADOW-GRAY-PUBLISH') === true
    || traceId?.includes('SHADOW-GRAY-PUBLISHED') === true
    || record.featurePolicy?.includes('影子') === true
    || record.recommendationScope?.some(scope => scope.includes('影子')) === true
}

export function qualityKnowledgeGrayReleaseCycleLabel(record: {
  auditId?: string
  traceId?: string
  publishAuditId?: string
  publishTraceId?: string
}): QualityKnowledgeGrayReleaseCycleLabel {
  return isQualityKnowledgeGrayRepublishEvidence(record) ? '重新灰度发布' : '首次灰度发布'
}

function qualityKnowledgeGrayReleaseCycleSlug(label: QualityKnowledgeGrayReleaseCycleLabel) {
  return label === '重新灰度发布' ? 'republish' : 'initial'
}

function qualityKnowledgeDefaultRollbackTargetVersion(version: string) {
  return version === 'QK-TRAIN-20260521-R7' ? 'QK-TRAIN-20260521-R2' : 'QK-TRAIN-20260521-R2'
}

function withQualityKnowledgeGrayReleaseDecisionDefaults(record: QualityKnowledgeGrayReleaseDecisionRecord): QualityKnowledgeGrayReleaseDecisionRecord {
  const releaseCycleLabel = record.releaseCycleLabel ?? qualityKnowledgeGrayReleaseCycleLabel(record)
  return {
    ...record,
    releaseCycleLabel,
    releaseAuditId: record.releaseAuditId ?? record.auditId,
    releaseTraceId: record.releaseTraceId ?? record.traceId,
    releaseScopeLabel: record.releaseScopeLabel ?? `${record.operationCode} 装配扭矩推荐链路`,
  }
}

export function qualityKnowledgeRecommendationReleaseScopeLabel(version: QualityKnowledgeRetrainingVersionRecord) {
  if (version.status === 'gray_published' && isQualityKnowledgeShadowGrayReleaseEvidence(version)) {
    return version.recommendationScope?.[0] ?? `${version.operationCode} 影子验证范围`
  }
  return version.status === 'gray_published'
    ? `${version.operationCode} 装配扭矩推荐链路`
    : version.recommendationScope?.join(' / ') ?? '质量知识复用排序'
}

export function createBarcodeQualityKnowledgeSample(
  createdAt = new Date().toISOString(),
  overrides: Partial<QualityKnowledgeSampleRecord> = {}
): QualityKnowledgeSampleRecord {
  const baseRecord: QualityKnowledgeSampleRecord = {
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
    createdAt,
    summary: 'WO-RUSH-9001 OP-10 扫码质检不合格已沉淀为可复用样本，覆盖批次隔离、返工成本、复验放行、OP-20 释放和排产回写。',
    capaRecommendations: [
      '同类 CNC 首件尺寸偏差先冻结下道交接并隔离 AL 批次。',
      '按不良数量预估返工工时成本，进入 OTD 与经营复盘。',
      '复验放行后必须同步解冻流转卡标签，并让 AI 排产复核 OP-20 窗口。',
    ],
    reuseTargets: ['质量根因分析', 'AI 生产助手', '文档上传', '报表中心', '审计日志'],
    evidenceTraceIds: [
      'TRACE-QR-WO-RUSH-9001-OP-10-REWORK',
      'TRACE-QR-WO-RUSH-9001-OP-10-ISOLATION',
      'TRACE-QR-WO-RUSH-9001-OP-10-REWORK-COST',
      'TRACE-QR-WO-RUSH-9001-OP-10-RECHECK',
      'TRACE-QR-WO-RUSH-9001-OP-10-SCHEDULE-RELEASE',
    ],
  }
  return { ...baseRecord, ...overrides }
}

export function writeQualityKnowledgeSample(record = createBarcodeQualityKnowledgeSample()) {
  if (!canUseStorage()) return record
  const next = [
    record,
    ...readQualityKnowledgeSamples().filter(item => item.id !== record.id),
  ].slice(0, 12)
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  syncQualityKnowledgeEvidence('QualityKnowledgeSample', `${record.workOrderId} ${record.operationCode} 质量知识样本`, 'closed', record, record.auditId, record.traceId, record.createdAt)
  upsertOtdEvidenceChainRecord({
    id: `quality-knowledge-${record.id}`,
    stage: '质量知识',
    title: `${record.workOrderId} 扫码返工 CAPA 样本已入库`,
    summary: `${record.auditId} 将 ${record.processName} / ${record.materialBatch} / ${record.defectPattern} 固化为 ${record.documentTitle} ${record.version}，后续同类缺陷可引用推荐 CAPA、隔离和成本口径。`,
    object: `${record.workOrderId} / ${record.operationCode}`,
    source: '质量闭环 / 知识库治理',
    traceId: record.traceId,
    status: 'closed',
    statusLabel: '可复用',
    createdAt: record.createdAt,
  })
  return record
}

export function createBarcodeQualityReuseDraft(
  sample: QualityKnowledgeSampleRecord,
  createdAt = new Date().toISOString(),
  overrides: Partial<QualityKnowledgeReuseDraftRecord> = {}
): QualityKnowledgeReuseDraftRecord {
  const baseRecord: QualityKnowledgeReuseDraftRecord = {
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
    createdAt,
    summary: 'WO-DEMO-1012 OP-10 命中扫码返工 CAPA 样本，同设备、同工序、同 AL 批次族和同类首件尺寸偏差均匹配，可生成待复核处置草案。',
    matchDimensions: [
      { label: '工序', source: sample.processName, target: 'CNC 精加工', matched: true },
      { label: '设备', source: sample.equipmentCode, target: 'CNC-002', matched: true },
      { label: '材料族', source: sample.materialBatch, target: 'AL-202605-B', matched: true },
      { label: '缺陷模式', source: sample.defectPattern, target: '首件尺寸偏差', matched: true },
    ],
    dispositionDraft: [
      '冻结 WO-DEMO-1012 OP-10 到 OP-20 的下道交接，未复验前禁止批量流转。',
      '把 AL-202605-B 同批次在制件移入 Q-HOLD-02，并引用扫码返工样本的隔离口径。',
      '按 1.5h 返工窗口预估 270 元返工成本，进入 OTD 复盘和经营复盘。',
      '复验通过后同步解除标签冻结，并让 AI 排产复核 OP-20 装配接收窗口。',
    ],
    effectMetrics: [
      { label: '分析节省', value: '45 分钟' },
      { label: '重复缺陷风险', value: '-32%' },
      { label: 'OTD 风险恢复', value: '1 单' },
    ],
    evidenceTraceIds: [sample.traceId, ...sample.evidenceTraceIds],
  }
  return { ...baseRecord, ...overrides }
}

export function writeQualityKnowledgeReuseDraft(record: QualityKnowledgeReuseDraftRecord) {
  if (!canUseStorage()) return record
  const next = [
    record,
    ...readQualityKnowledgeReuseDrafts().filter(item => item.id !== record.id),
  ].slice(0, 12)
  window.localStorage.setItem(REUSE_DRAFT_STORAGE_KEY, JSON.stringify(next))
  syncQualityKnowledgeEvidence('QualityKnowledgeReuseDraft', `${record.targetWorkOrderId} ${record.targetOperationCode} 复用草案`, 'ready', record, record.auditId, record.traceId, record.createdAt)
  upsertOtdEvidenceChainRecord({
    id: `quality-reuse-draft-${record.id}`,
    stage: '质量处置草案',
    title: `${record.targetWorkOrderId} 同类缺陷处置草案已生成`,
    summary: `${record.auditId} 命中 ${record.matchScore}%：${record.summary} 复用效果评分 ${record.effectScore} 分，待质量工程师复核后转正式 CAPA。`,
    object: `${record.targetWorkOrderId} / ${record.targetOperationCode}`,
    source: '质量闭环 / 知识命中 / AI 处置草案',
    traceId: record.traceId,
    status: 'ready',
    statusLabel: '草案待复核',
    createdAt: record.createdAt,
  })
  return record
}

export function createBarcodeQualityReuseClosure(
  draft: QualityKnowledgeReuseDraftRecord,
  approvedAt = new Date().toISOString(),
  overrides: Partial<QualityKnowledgeReuseClosureRecord> = {}
): QualityKnowledgeReuseClosureRecord {
  const baseRecord: QualityKnowledgeReuseClosureRecord = {
    id: 'quality-knowledge-reuse-closure-wo-demo-1012-op-10',
    draftId: draft.id,
    draftTraceId: draft.traceId,
    targetWorkOrderId: draft.targetWorkOrderId,
    targetOperationCode: draft.targetOperationCode,
    formalCapaTitle: `${draft.targetWorkOrderId} ${draft.targetOperationCode} 同类首件尺寸偏差正式 CAPA`,
    owner: '质量工程师 周工 / 工艺工程师 陈工',
    dueAt: '今日 17:30',
    verification: '复验尺寸 Cpk >= 1.33，OP-20 首件接收无返修',
    auditId: 'AUD-KG-QA-REUSE-CAPA-20260521-001',
    traceId: 'TRACE-KG-QA-WO-DEMO-1012-OP-10-FORMAL-CAPA',
    effectTraceId: 'TRACE-KG-QA-WO-DEMO-1012-OP-10-REUSE-EFFECT',
    approvedAt,
    status: 'approved',
    statusLabel: '正式 CAPA 待验证',
    effectScoreBefore: draft.effectScore,
    effectScoreAfter: 94,
    effectReview: '复用扫码返工样本后，根因确认、隔离、返工成本和排产复核不再重复拆解，现场按正式 CAPA 验证后可回写为质量知识反馈样本。',
    feedbackActions: [
      '质量工程师复核同类缺陷匹配维度，确认可按扫码返工样本转正式 CAPA。',
      '工艺工程师复核 OP-10 刀补和首件检验窗口，确认复验标准。',
      '复验通过后把草案命中、正式 CAPA 和效果评分写回知识样本，供后续同类问题排序。',
    ],
    feedbackMetrics: [
      { label: '草案复核耗时', value: '12 分钟' },
      { label: '重复分析节省', value: '45 分钟' },
      { label: '复发风险', value: '-32%' },
    ],
  }
  return { ...baseRecord, ...overrides }
}

export function writeQualityKnowledgeReuseClosure(record: QualityKnowledgeReuseClosureRecord) {
  if (!canUseStorage()) return record
  const next = [
    record,
    ...readQualityKnowledgeReuseClosures().filter(item => item.id !== record.id),
  ].slice(0, 12)
  window.localStorage.setItem(REUSE_CLOSURE_STORAGE_KEY, JSON.stringify(next))
  syncQualityKnowledgeEvidence('QualityKnowledgeReuseClosure', record.formalCapaTitle, record.status, record, record.auditId, record.traceId, record.verifiedAt ?? record.approvedAt)
  upsertOtdEvidenceChainRecord({
    id: `quality-reuse-formal-capa-${record.id}`,
    stage: '正式CAPA',
    title: record.formalCapaTitle,
    summary: `${record.auditId} 已复核草案 ${record.draftTraceId}，将同类缺陷处置草案转为正式 CAPA。负责人 ${record.owner}，验证标准：${record.verification}。`,
    object: `${record.targetWorkOrderId} / ${record.targetOperationCode}`,
    source: '质量闭环 / 人工复核 / 知识复用',
    traceId: record.traceId,
    status: record.status === 'verified' ? 'closed' : 'active',
    statusLabel: record.status === 'verified' ? '正式 CAPA 已验证' : record.statusLabel,
    createdAt: record.approvedAt,
  })
  if (record.status === 'verified' && record.verifiedAt) {
    upsertOtdEvidenceChainRecord({
      id: `quality-reuse-effect-${record.id}`,
      stage: '质量复用效果',
      title: `${record.targetWorkOrderId} 知识复用效果已回写`,
      summary: `${record.effectReview} 复用评分从 ${record.effectScoreBefore} 分提升到 ${record.effectScoreAfter} 分，反馈指标：${record.feedbackMetrics.map(metric => `${metric.label}${metric.value}`).join(' / ')}。`,
      object: `${record.targetWorkOrderId} / ${record.targetOperationCode}`,
      source: '质量闭环 / CAPA 验证 / 知识反馈',
      traceId: record.effectTraceId,
      status: 'closed',
      statusLabel: '效果已回写',
      createdAt: record.verifiedAt,
    })
  }
  return record
}

export function verifyQualityKnowledgeReuseClosure(
  record: QualityKnowledgeReuseClosureRecord,
  verifiedAt = new Date().toISOString()
) {
  return writeQualityKnowledgeReuseClosure({
    ...record,
    status: 'verified',
    statusLabel: '复用效果已回写',
    verifiedAt,
  })
}

export function createQualityKnowledgeRecommendationFeedbackRecord(
  ranking: QualityKnowledgeReuseRankingItem,
  decidedAt = new Date().toISOString(),
  overrides: Partial<QualityKnowledgeRecommendationFeedbackRecord> = {}
): QualityKnowledgeRecommendationFeedbackRecord {
  const nextTrainingSetVersion = 'QK-TRAIN-20260521-R3'
  const baseRecord: QualityKnowledgeRecommendationFeedbackRecord = {
    id: `quality-recommendation-feedback-${ranking.targetWorkOrderId.toLowerCase()}-${ranking.operationCode.toLowerCase()}`,
    rankingId: ranking.id,
    trainingSetVersion: ranking.trainingSetVersion ?? 'QK-TRAIN-20260521-R2',
    targetWorkOrderId: ranking.targetWorkOrderId,
    operationCode: ranking.operationCode,
    decision: 'accepted',
    decisionLabel: '现场已采纳推荐',
    owner: '质量工程师 周工 / 装配班长 王工',
    reason: '复验发现 OP-20 扭矩工具校准、设备族和缺陷模式均命中独立 CAPA 样本，现场采用再训练推荐替代原扫码返工泛化建议。',
    decidedAt,
    auditId: 'AUD-KG-QA-RECOMMENDATION-FEEDBACK-20260521-001',
    traceId: 'TRACE-KG-QA-WO-DEMO-1018-OP-20-RECOMMENDATION-ADOPTED',
    effectScoreBefore: ranking.effectScore,
    effectScoreAfter: 93,
    effectTrendLabel: `${ranking.effectScore} -> 93 分`,
    nextTrainingSetVersion,
    nextTrainingTraceId: 'TRACE-KG-QA-WO-DEMO-1018-OP-20-NEXT-TRAINING-R3',
    feedbackActions: [
      '装配班长按独立扭矩 CAPA 执行工具校准复验，未再引用 CNC 扫码返工处置。',
      '质量工程师把现场采纳结果回写为正样本，保留原 61 分跨工序尝试为负样本。',
      `下一轮训练集 ${nextTrainingSetVersion} 将纳入推荐采纳效果、复验结果和负样本对照。`,
    ],
    feedbackMetrics: [
      { label: '推荐采纳耗时', value: '18 分钟' },
      { label: '复验通过率', value: '100%' },
      { label: '扭矩偏移复发风险', value: '-41%' },
    ],
  }
  return { ...baseRecord, ...overrides }
}

export function writeQualityKnowledgeRecommendationFeedbackRecord(
  record: QualityKnowledgeRecommendationFeedbackRecord
) {
  if (!canUseStorage()) return record
  const next = [
    record,
    ...readQualityKnowledgeRecommendationFeedbackRecords().filter(item => item.id !== record.id),
  ].slice(0, 12)
  window.localStorage.setItem(RECOMMENDATION_FEEDBACK_STORAGE_KEY, JSON.stringify(next))
  syncQualityKnowledgeEvidence('QualityKnowledgeRecommendationFeedback', `${record.targetWorkOrderId} ${record.operationCode} 推荐反馈`, record.decision, record, record.auditId, record.traceId, record.decidedAt)
  upsertOtdEvidenceChainRecord({
    id: `quality-recommendation-feedback-${record.id}`,
    stage: '推荐采纳反馈',
    title: `${record.targetWorkOrderId} ${record.operationCode} 已采纳已发布训练集推荐`,
    summary: `${record.auditId}：${record.decisionLabel}，${record.reason} 效果趋势 ${record.effectTrendLabel}，下一轮训练集 ${record.nextTrainingSetVersion} 已形成候选。`,
    object: `${record.targetWorkOrderId} / ${record.operationCode}`,
    source: '质量闭环 / AI 推荐采纳 / 知识反馈',
    traceId: record.traceId,
    status: 'closed',
    statusLabel: record.decisionLabel,
    createdAt: record.decidedAt,
  })
  upsertOtdEvidenceChainRecord({
    id: `quality-recommendation-next-training-${record.id}`,
    stage: '下一轮训练集',
    title: `${record.nextTrainingSetVersion} 推荐采纳效果已入池`,
    summary: `基于 ${record.trainingSetVersion} 的现场采纳反馈，效果评分从 ${record.effectScoreBefore} 分提升到 ${record.effectScoreAfter} 分；采纳动作：${record.feedbackActions.join('；')}`,
    object: `${record.targetWorkOrderId} / ${record.operationCode}`,
    source: '质量闭环 / 持续学习样本池',
    traceId: record.nextTrainingTraceId,
    status: 'ready',
    statusLabel: '下一轮候选',
    createdAt: record.decidedAt,
  })
  return record
}

export function acceptQualityKnowledgeRecommendation(
  ranking: QualityKnowledgeReuseRankingItem,
  decidedAt = new Date().toISOString()
) {
  return writeQualityKnowledgeRecommendationFeedbackRecord(
    createQualityKnowledgeRecommendationFeedbackRecord(ranking, decidedAt)
  )
}

export function buildQualityKnowledgeReuseRanking(
  closure: QualityKnowledgeReuseClosureRecord | null = readLatestQualityKnowledgeReuseClosure(),
  draft: QualityKnowledgeReuseDraftRecord | null = readLatestQualityKnowledgeReuseDraft(),
  retrainingVersions: QualityKnowledgeRetrainingVersionRecord[] = readQualityKnowledgeRetrainingVersionRecords(),
  recommendationFeedbackRecords: QualityKnowledgeRecommendationFeedbackRecord[] = readQualityKnowledgeRecommendationFeedbackRecords(),
  grayReleaseDecisions: QualityKnowledgeGrayReleaseDecisionRecord[] = readQualityKnowledgeGrayReleaseDecisionRecords()
): QualityKnowledgeReuseRankingItem[] {
  const verifiedTraceId = closure?.status === 'verified'
    ? closure.effectTraceId
    : closure?.traceId ?? draft?.traceId ?? 'TRACE-KG-QA-WO-RUSH-9001-OP-10-REWORK-SAMPLE'
  const verifiedScore = closure?.status === 'verified'
    ? closure.effectScoreAfter
    : closure?.effectScoreBefore ?? draft?.effectScore ?? 88
  const activeRetrainingVersion = selectPrioritizedQualityKnowledgeRecommendationVersion(retrainingVersions, 'WO-DEMO-1018', 'OP-20', grayReleaseDecisions)
  const activeGrayDecision = latestQualityGrayReleaseDecisionForVersion(activeRetrainingVersion, grayReleaseDecisions)
  const latestGrayDecision = grayReleaseDecisions.find(record =>
    record.targetWorkOrderId === 'WO-DEMO-1018'
    && record.operationCode === 'OP-20'
  )
  const excludedExperimentDecisions = grayReleaseDecisions.filter(record =>
    record.decision === 'rolled_back'
    && record.approvalStatus !== 'pending'
    && record.targetWorkOrderId === 'WO-DEMO-1018'
    && record.operationCode === 'OP-20'
  )
  const feedbackForActiveRecommendation = recommendationFeedbackRecords.find(record =>
    record.decision === 'accepted'
    && record.trainingSetVersion === activeRetrainingVersion?.trainingSetVersion
    && record.targetWorkOrderId === activeRetrainingVersion?.targetWorkOrderId
    && record.operationCode === activeRetrainingVersion?.operationCode
  )
  const feedbackThatFedActiveVersion = recommendationFeedbackRecords.find(record =>
    record.decision === 'accepted'
    && record.nextTrainingSetVersion === activeRetrainingVersion?.trainingSetVersion
    && record.targetWorkOrderId === activeRetrainingVersion?.targetWorkOrderId
    && record.operationCode === activeRetrainingVersion?.operationCode
  )
  const activeRecommendationFeedback = feedbackForActiveRecommendation ?? feedbackThatFedActiveVersion
  const activeVersionIsGray = activeRetrainingVersion?.status === 'gray_published'
  const activeVersionIsShadowGray = activeRetrainingVersion ? isQualityKnowledgeShadowGrayReleaseEvidence(activeRetrainingVersion) : false
  const torqueRetrainingRanking: QualityKnowledgeReuseRankingItem = activeRetrainingVersion
    ? {
        id: 'reuse-rank-published-torque-retraining',
        title: `${activeRetrainingVersion.targetWorkOrderId} ${activeRetrainingVersion.operationCode} 装配扭矩偏移独立 CAPA 推荐`,
        targetWorkOrderId: activeRetrainingVersion.targetWorkOrderId,
        operationCode: activeRetrainingVersion.operationCode,
        matchScore: 91,
        effectScore: activeRecommendationFeedback?.effectScoreAfter ?? (activeVersionIsShadowGray ? 94 : activeVersionIsGray ? 93 : 89),
        statusLabel: activeVersionIsGray
          ? activeGrayDecision?.decision === 'expanded' && activeGrayDecision.approvalStatus === 'approved'
            ? '实验扩大优先'
            : '已灰度发布'
          : latestGrayDecision?.decision === 'rolled_back'
            ? 'R3 回滚后 R2 生效'
            : activeRecommendationFeedback ? '已采纳推荐' : '已发布训练集',
        recommendation: activeVersionIsGray
          ? activeGrayDecision?.decision === 'expanded' && activeGrayDecision.approvalStatus === 'approved'
            ? `${activeRetrainingVersion.trainingSetVersion} 已按 ${activeGrayDecision.auditId} 确认扩大，优先进入 OP-20 装配扭矩推荐；${excludedExperimentDecisions.length ? `${excludedExperimentDecisions.map(decision => decision.trainingSetVersion).join(' / ')} 已因回滚从主动推荐中排除，` : ''}${activeRecommendationFeedback ? `效果趋势 ${activeRecommendationFeedback.effectTrendLabel}，` : ''}继续保留负样本误召回阈值。`
            : `${activeRetrainingVersion.trainingSetVersion} 已灰度发布到 ${qualityKnowledgeRecommendationReleaseScopeLabel(activeRetrainingVersion)}，基于 ${activeRecommendationFeedback?.trainingSetVersion ?? 'R2'} 现场采纳反馈提升 OP-20 装配扭矩推荐，${activeRecommendationFeedback ? `效果趋势 ${activeRecommendationFeedback.effectTrendLabel}，` : ''}并继续保留跨工序扫码返工负样本降权。`
          : latestGrayDecision?.decision === 'rolled_back'
            ? `${latestGrayDecision.trainingSetVersion} 灰度已按 ${latestGrayDecision.auditId} 回滚到 ${latestGrayDecision.rollbackTargetVersion ?? activeRetrainingVersion.trainingSetVersion}，当前 OP-20 推荐恢复使用 ${activeRetrainingVersion.trainingSetVersion} 正式发布版本，并保留灰度监控指标作为后续复盘证据。`
          : activeRecommendationFeedback
            ? `${activeRecommendationFeedback.trainingSetVersion} 推荐已被现场采纳，OP-20 装配扭矩偏移按独立 CAPA 样本复验通过，效果趋势 ${activeRecommendationFeedback.effectTrendLabel}，并进入 ${activeRecommendationFeedback.nextTrainingSetVersion} 样本池。`
            : `${activeRetrainingVersion.trainingSetVersion} 已发布到 AI 推荐链路，OP-20 装配扭矩偏移优先匹配独立 CAPA 样本，并保留跨工序扫码返工负样本降权。`,
        evidenceTraceId: activeRetrainingVersion.publishTraceId ?? activeRetrainingVersion.validationTraceId ?? activeRetrainingVersion.approvalTraceId,
        rankReason: activeVersionIsGray
          ? activeGrayDecision?.decision === 'expanded' && activeGrayDecision.approvalStatus === 'approved'
            ? `${activeGrayDecision.auditId}：${activeGrayDecision.approvalLabel}，指标快照 ${activeGrayDecision.metricSnapshot.map(metric => `${metric.label}${metric.value}`).join(' / ')}。${excludedExperimentDecisions.length ? `排除回滚实验 ${excludedExperimentDecisions.map(decision => `${decision.trainingSetVersion} ${decision.auditId}`).join(' / ')}。` : ''}`
            : `${activeRetrainingVersion.publishAuditId ?? activeRetrainingVersion.validationAuditId} 已灰度发布 ${activeRetrainingVersion.trainingSetVersion}；${activeRecommendationFeedback ? `${activeRecommendationFeedback.auditId} 已回写现场采纳效果，${activeRecommendationFeedback.feedbackMetrics.map(metric => `${metric.label}${metric.value}`).join(' / ')}。` : activeRetrainingVersion.validationFindings?.join(' / ') ?? activeRetrainingVersion.publishSummary ?? '灰度前校验已通过。'}`
          : latestGrayDecision?.decision === 'rolled_back'
            ? `${latestGrayDecision.auditId}：${latestGrayDecision.reason} 指标快照 ${latestGrayDecision.metricSnapshot.map(metric => `${metric.label}${metric.value}`).join(' / ')}。`
          : activeRecommendationFeedback
            ? `${activeRecommendationFeedback.auditId} 已回写现场采纳效果；${activeRecommendationFeedback.feedbackMetrics.map(metric => `${metric.label}${metric.value}`).join(' / ')}。`
            : `训练集 ${activeRetrainingVersion.trainingSetVersion} 已通过校验并发布；${activeRetrainingVersion.validationFindings?.join(' / ') ?? activeRetrainingVersion.publishSummary ?? '发布前校验已通过'}。`,
        reviewRequired: false,
        riskTags: [
          activeRetrainingVersion.trainingSetVersion,
          'OP-20 扭矩偏移',
          activeGrayDecision?.decision === 'expanded' && activeGrayDecision.approvalStatus === 'approved'
            ? '实验已扩大'
            : activeVersionIsGray ? '灰度发布' : latestGrayDecision?.decision === 'rolled_back' ? '灰度回滚' : activeRecommendationFeedback ? '已采纳' : '已发布',
          ...excludedExperimentDecisions.map(decision => `${decision.trainingSetVersion} 已回滚排除`),
        ],
        trainingSetVersion: activeRetrainingVersion.trainingSetVersion,
        releaseScopeLabel: qualityKnowledgeRecommendationReleaseScopeLabel(activeRetrainingVersion),
        auditId: activeRetrainingVersion.publishAuditId ?? activeRetrainingVersion.validationAuditId ?? activeRetrainingVersion.approvalAuditId,
        feedbackAuditId: activeRecommendationFeedback?.auditId,
        feedbackTraceId: activeRecommendationFeedback?.traceId,
        effectTrendLabel: activeRecommendationFeedback?.effectTrendLabel,
        nextTrainingSetVersion: activeRecommendationFeedback?.nextTrainingSetVersion,
        experimentDecisionLabel: activeGrayDecision ? `${activeGrayDecision.decisionLabel} / ${activeGrayDecision.approvalLabel}` : undefined,
        experimentDecisionAuditId: activeGrayDecision?.auditId,
        experimentDecisionTraceId: activeGrayDecision?.traceId,
        excludedExperimentVersions: excludedExperimentDecisions.map(decision => `${decision.trainingSetVersion} / ${decision.decisionLabel} / ${decision.auditId}`),
      }
    : {
        id: 'reuse-rank-low-score-torque',
        title: 'WO-DEMO-1018 OP-20 装配扭矩偏移复用尝试',
        targetWorkOrderId: 'WO-DEMO-1018',
        operationCode: 'OP-20',
        matchScore: 63,
        effectScore: 61,
        statusLabel: '低分复核',
        recommendation: '跨工序、跨设备且缺陷模式偏离，不能直接复用扫码返工 CAPA，需进入质量知识复核队列。',
        evidenceTraceId: 'TRACE-KG-QA-WO-DEMO-1018-OP-20-LOW-SCORE-CANDIDATE',
        rankReason: '匹配维度不足且复用效果低于 70 分阈值。',
        reviewRequired: true,
        riskTags: ['跨工序', '跨设备', '低于阈值'],
      }

  return [
    {
      id: 'reuse-rank-verified-cnc-dimension',
      title: closure?.formalCapaTitle ?? 'WO-DEMO-1012 OP-10 同类首件尺寸偏差复用样本',
      targetWorkOrderId: closure?.targetWorkOrderId ?? draft?.targetWorkOrderId ?? 'WO-DEMO-1012',
      operationCode: closure?.targetOperationCode ?? draft?.targetOperationCode ?? 'OP-10',
      matchScore: draft?.matchScore ?? 92,
      effectScore: verifiedScore,
      statusLabel: closure?.status === 'verified' ? '优先复用' : '待验证',
      recommendation: closure?.status === 'verified'
        ? '后续 CNC-002 / AL 批次族 / 首件尺寸偏差优先引用该正式 CAPA 和效果反馈。'
        : '草案已具备高匹配度，需完成正式 CAPA 验证后才能进入优先复用。',
      evidenceTraceId: verifiedTraceId,
      rankReason: `同工序、同设备、同材料族命中，效果评分 ${verifiedScore} 分。`,
      reviewRequired: closure?.status !== 'verified',
      riskTags: ['CNC-002', 'AL 批次族', closure?.status === 'verified' ? '已验证' : '待验证'],
    },
    {
      id: 'reuse-rank-source-barcode-sample',
      title: 'WO-RUSH-9001 OP-10 扫码返工源样本',
      targetWorkOrderId: 'WO-RUSH-9001',
      operationCode: 'OP-10',
      matchScore: 100,
      effectScore: 88,
      statusLabel: '可复用',
      recommendation: '作为同类首件尺寸偏差的基线样本，继续保留隔离、返工成本、复验释放和排产回写口径。',
      evidenceTraceId: 'TRACE-KG-QA-WO-RUSH-9001-OP-10-REWORK-SAMPLE',
      rankReason: '源样本证据链完整，但效果分低于已验证的正式 CAPA 反馈。',
      reviewRequired: false,
      riskTags: ['源样本', '证据完整', '可引用'],
    },
    torqueRetrainingRanking,
  ].sort((left, right) => right.effectScore - left.effectScore)
}

export function createLowScoreQualityKnowledgeReviewQueueRecord(
  createdAt = new Date().toISOString(),
  overrides: Partial<QualityKnowledgeReviewQueueRecord> = {}
): QualityKnowledgeReviewQueueRecord {
  const baseRecord: QualityKnowledgeReviewQueueRecord = {
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
    createdAt,
    status: 'open',
    statusLabel: '复核中',
    effectScore: 61,
    reviewActions: [
      '复核 OP-20 装配扭矩偏移是否属于扫码返工样本的有效泛化范围。',
      '若跨工序差异无法解释，生成独立装配扭矩 CAPA 样本并标记原复用尝试为低分。',
      '把低分样本加入后续知识检索降权策略，避免 AI 助手直接引用。',
    ],
  }
  return { ...baseRecord, ...overrides }
}

export function writeQualityKnowledgeReviewQueueRecord(
  record = createLowScoreQualityKnowledgeReviewQueueRecord()
) {
  if (!canUseStorage()) return record
  const next = [
    record,
    ...readQualityKnowledgeReviewQueueRecords().filter(item => item.id !== record.id),
  ].slice(0, 12)
  window.localStorage.setItem(REVIEW_QUEUE_STORAGE_KEY, JSON.stringify(next))
  syncQualityKnowledgeEvidence('QualityKnowledgeReviewQueue', record.title, record.status, record, record.decisionAuditId ?? record.auditId, record.decisionTraceId ?? record.traceId, record.closedAt ?? record.createdAt)
  upsertOtdEvidenceChainRecord({
    id: `quality-knowledge-review-${record.id}`,
    stage: '低分复核',
    title: record.title,
    summary: `${record.auditId}：${record.reason} 复核动作：${record.reviewActions.join('；')}`,
    object: `${record.targetWorkOrderId} / ${record.operationCode}`,
    source: `质量知识反馈 / ${record.owner}`,
    traceId: record.traceId,
    status: record.status === 'closed' ? 'closed' : 'active',
    statusLabel: record.statusLabel,
    createdAt: record.createdAt,
  })
  if (
    record.status === 'closed'
    && record.closedAt
    && record.decisionAuditId
    && record.decisionTraceId
    && record.decisionLabel
    && record.decisionSummary
    && record.disabledReuseRule
    && record.retrainingTraceId
    && record.retrainingPlan
  ) {
    upsertOtdEvidenceChainRecord({
      id: `quality-knowledge-review-decision-${record.id}`,
      stage: '低分复核结论',
      title: `${record.targetWorkOrderId} ${record.operationCode} 低分复用已禁用`,
      summary: `${record.decisionAuditId}：${record.decisionSummary} 禁用规则：${record.disabledReuseRule}`,
      object: `${record.targetWorkOrderId} / ${record.operationCode}`,
      source: `质量知识反馈 / ${record.owner}`,
      traceId: record.decisionTraceId,
      status: 'closed',
      statusLabel: record.decisionLabel,
      createdAt: record.closedAt,
    })
    upsertOtdEvidenceChainRecord({
      id: `quality-knowledge-retraining-${record.id}`,
      stage: '知识再训练',
      title: `${record.targetWorkOrderId} ${record.operationCode} 进入再训练候选`,
      summary: record.retrainingPlan.join('；'),
      object: `${record.targetWorkOrderId} / ${record.operationCode}`,
      source: '质量知识反馈 / 样本治理',
      traceId: record.retrainingTraceId,
      status: 'ready',
      statusLabel: '待再训练样本确认',
      createdAt: record.closedAt,
    })
  }
  return record
}

export function closeLowScoreQualityKnowledgeReviewQueueRecord(
  record: QualityKnowledgeReviewQueueRecord,
  closedAt = new Date().toISOString()
) {
  return writeQualityKnowledgeReviewQueueRecord({
    ...record,
    status: 'closed',
    statusLabel: '直接复用已禁用',
    closedAt,
    decisionAuditId: 'AUD-KG-QA-LOW-SCORE-DECISION-20260521-001',
    decisionTraceId: 'TRACE-KG-QA-WO-DEMO-1018-OP-20-LOW-SCORE-DECISION',
    decisionLabel: '禁用直接复用',
    decisionSummary: '人工复核确认 OP-20 装配扭矩偏移与 CNC 扫码返工样本不属于同一泛化族，禁止 AI 助手把该低分候选作为直接 CAPA 推荐。',
    disabledReuseRule: 'matchScore < 70 或跨工序缺陷模式不一致时，只能进入复核/再训练队列，不能进入优先推荐。',
    retrainingTraceId: 'TRACE-KG-QA-WO-DEMO-1018-OP-20-RETRAINING-CANDIDATE',
    retrainingPlan: [
      '新建装配扭矩偏移独立 CAPA 样本，保留 OP-20 扭矩窗口、工具校准和复验数据。',
      '把本次 61 分低分尝试作为负样本，降低跨工序扫码返工样本的召回权重。',
      '下次推荐需同时满足工序、设备族、缺陷模式和验证效果阈值。',
    ],
  })
}

export function writeQualityKnowledgeRetrainingVersionRecord(
  record: QualityKnowledgeRetrainingVersionRecord
) {
  if (!canUseStorage()) return record
  const next = [
    record,
    ...readQualityKnowledgeRetrainingVersionRecords().filter(item => item.id !== record.id),
  ].slice(0, 12)
  window.localStorage.setItem(RETRAINING_VERSION_STORAGE_KEY, JSON.stringify(next))
  syncQualityKnowledgeEvidence('QualityKnowledgeRetrainingVersion', `${record.trainingSetVersion} ${record.trainingSetName}`, record.status, record, record.approvalAuditId, record.approvalTraceId, record.approvedAt)
  const approvalEvidenceStatus = record.status === 'rolled_back'
    ? { status: 'closed' as const, statusLabel: '审批保留 / 已回滚' }
    : record.status === 'validation_failed'
      ? { status: 'active' as const, statusLabel: '审批保留 / 校验未通过' }
      : record.status === 'published' || record.status === 'gray_published'
        ? { status: 'closed' as const, statusLabel: '审批保留 / 已发布' }
        : record.status === 'merged'
          ? { status: 'ready' as const, statusLabel: '待审批' }
        : { status: 'ready' as const, statusLabel: record.statusLabel }
  if (record.status === 'merged') {
    upsertOtdEvidenceChainRecord({
      id: `quality-knowledge-retraining-merge-${record.id}`,
      stage: '知识再训练合并',
      title: `${record.trainingSetVersion} 现场反馈已合并`,
      summary: `${record.approvalAuditId}：${record.trainingSetName} 已合并推荐采纳效果、复验结果和负样本对照，正样本 ${record.positiveSampleCount} 条、负样本 ${record.negativeSampleCount} 条。`,
      object: `${record.targetWorkOrderId} / ${record.operationCode}`,
      source: '知识库治理 / 下一轮训练集合并',
      traceId: record.approvalTraceId,
      status: 'ready',
      statusLabel: record.statusLabel,
      createdAt: record.approvedAt,
    })
  }
  if (record.status !== 'merged') {
    upsertOtdEvidenceChainRecord({
      id: `quality-knowledge-retraining-approval-${record.id}`,
      stage: '知识再训练审批',
      title: `${record.trainingSetVersion} 训练集版本已批准`,
      summary: `${record.approvalAuditId}：${record.trainingSetName} 已由 ${record.approvedBy} 批准，正样本 ${record.positiveSampleCount} 条、负样本 ${record.negativeSampleCount} 条。策略：${record.featurePolicy}`,
      object: `${record.targetWorkOrderId} / ${record.operationCode}`,
      source: '知识库治理 / 再训练候选审批',
      traceId: record.approvalTraceId,
      status: approvalEvidenceStatus.status,
      statusLabel: approvalEvidenceStatus.statusLabel,
      createdAt: record.approvedAt,
    })
  }
  if (record.validationStatus === 'failed' && record.validatedAt && record.validationAuditId && record.validationTraceId) {
    upsertOtdEvidenceChainRecord({
      id: `quality-knowledge-retraining-validation-${record.id}`,
      stage: '知识再训练校验',
      title: `${record.trainingSetVersion} 发布前校验未通过`,
      summary: `${record.validationAuditId}：${record.validationSummary} 校验发现：${record.validationFindings?.join(' / ') ?? '存在发布阻断项'}。`,
      object: `${record.targetWorkOrderId} / ${record.operationCode}`,
      source: '知识库治理 / 训练集发布前校验',
      traceId: record.validationTraceId,
      status: record.status === 'rolled_back' ? 'closed' : 'active',
      statusLabel: record.status === 'rolled_back' ? '校验失败已触发回滚' : record.statusLabel,
      createdAt: record.validatedAt,
    })
  }
  if (record.validationStatus === 'passed' && record.validatedAt && record.validationAuditId && record.validationTraceId) {
    upsertOtdEvidenceChainRecord({
      id: `quality-knowledge-retraining-validation-pass-${record.id}`,
      stage: '知识再训练校验通过',
      title: `${record.trainingSetVersion} 发布前校验已通过`,
      summary: `${record.validationAuditId}：${record.validationSummary} 校验结论：${record.validationFindings?.join(' / ') ?? '发布前校验已通过'}。`,
      object: `${record.targetWorkOrderId} / ${record.operationCode}`,
      source: '知识库治理 / 训练集发布前校验',
      traceId: record.validationTraceId,
      status: ['published', 'gray_published'].includes(record.status) ? 'closed' : 'ready',
      statusLabel: ['published', 'gray_published'].includes(record.status) ? '校验通过 / 已发布' : record.statusLabel,
      createdAt: record.validatedAt,
    })
  }
  if ((record.status === 'published' || record.status === 'gray_published') && record.publishedAt && record.publishAuditId && record.publishTraceId) {
    const shadowGrayRelease = isQualityKnowledgeShadowGrayReleaseEvidence(record)
    upsertOtdEvidenceChainRecord({
      id: `quality-knowledge-retraining-publish-${record.id}`,
      stage: record.status === 'gray_published' ? '知识再训练灰度发布' : '知识再训练发布',
      title: record.status === 'gray_published'
        ? shadowGrayRelease ? `${record.trainingSetVersion} 已发布到质量推荐影子灰度` : `${record.trainingSetVersion} 已灰度发布到质量推荐链路`
        : `${record.trainingSetVersion} 已发布到 AI 推荐链路`,
      summary: `${record.publishAuditId}：${record.publishSummary} 发布范围：${record.recommendationScope?.join(' / ') ?? '质量知识复用排序'}。`,
      object: `${record.targetWorkOrderId} / ${record.operationCode}`,
      source: record.status === 'gray_published'
        ? shadowGrayRelease ? '知识库治理 / 质量推荐影子灰度发布' : '知识库治理 / 质量推荐灰度发布'
        : '知识库治理 / AI 推荐链路发布',
      traceId: record.publishTraceId,
      status: 'closed',
      statusLabel: record.statusLabel,
      createdAt: record.publishedAt,
    })
  }
  if (record.status === 'rolled_back' && record.rolledBackAt && record.rollbackAuditId && record.rollbackTraceId) {
    upsertOtdEvidenceChainRecord({
      id: `quality-knowledge-retraining-rollback-${record.id}`,
      stage: '知识再训练回滚',
      title: `${record.trainingSetVersion} 已回滚到 ${record.rollbackTargetVersion}`,
      summary: `${record.rollbackAuditId}：${record.rollbackReason}，原审批 ${record.approvalAuditId} 保留审计。`,
      object: `${record.targetWorkOrderId} / ${record.operationCode}`,
      source: '知识库治理 / 再训练版本回滚',
      traceId: record.rollbackTraceId,
      status: 'closed',
      statusLabel: record.statusLabel,
      createdAt: record.rolledBackAt,
    })
  }
  return record
}

export function approveQualityKnowledgeRetrainingCandidate(
  reviewRecord: QualityKnowledgeReviewQueueRecord,
  approvedAt = new Date().toISOString()
) {
  return writeQualityKnowledgeRetrainingVersionRecord({
    id: `quality-retraining-version-${reviewRecord.id}`,
    sourceReviewQueueId: reviewRecord.id,
    targetWorkOrderId: reviewRecord.targetWorkOrderId,
    operationCode: reviewRecord.operationCode,
    candidateTraceId: reviewRecord.retrainingTraceId ?? reviewRecord.decisionTraceId ?? reviewRecord.traceId,
    trainingSetVersion: 'QK-TRAIN-20260521-R2',
    trainingSetName: '装配扭矩偏移 CAPA 再训练样本集',
    status: 'approved',
    statusLabel: '训练集已批准',
    approvedBy: '知识库管理员 / 质量主管 刘工',
    approvedAt,
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
  })
}

export function mergeQualityKnowledgeNextTrainingSetCandidate(
  feedbackRecord: QualityKnowledgeRecommendationFeedbackRecord,
  mergedAt = new Date().toISOString()
) {
  return writeQualityKnowledgeRetrainingVersionRecord({
    id: `quality-retraining-version-${feedbackRecord.nextTrainingSetVersion.toLowerCase()}`,
    sourceReviewQueueId: `recommendation-feedback-${feedbackRecord.id}`,
    targetWorkOrderId: feedbackRecord.targetWorkOrderId,
    operationCode: feedbackRecord.operationCode,
    candidateTraceId: feedbackRecord.nextTrainingTraceId,
    trainingSetVersion: feedbackRecord.nextTrainingSetVersion,
    trainingSetName: '推荐采纳效果持续学习样本集',
    status: 'merged',
    statusLabel: '现场反馈已合并',
    approvedBy: '知识库管理员 / 质量主管 刘工',
    approvedAt: mergedAt,
    approvalAuditId: 'AUD-KG-QA-RETRAINING-R3-MERGE-20260521-001',
    approvalTraceId: 'TRACE-KG-QA-WO-DEMO-1018-OP-20-R3-MERGED',
    positiveSampleCount: 24,
    negativeSampleCount: 4,
    featurePolicy: 'R3 合并推荐采纳效果、复验通过率、扭矩工具校准字段和 R2 负样本对照，先灰度到 OP-20 装配扭矩推荐链路。',
    changeSummary: [
      `${feedbackRecord.trainingSetVersion} 现场采纳反馈作为正样本进入 ${feedbackRecord.nextTrainingSetVersion}。`,
      `保留 ${feedbackRecord.effectScoreBefore} -> ${feedbackRecord.effectScoreAfter} 分效果趋势作为排序收益标签。`,
      '继续保留跨工序扫码返工低分样本作为负样本对照。',
    ],
    validationGates: [
      'R3 灰度前 Top-3 召回命中独立扭矩 CAPA 样本。',
      '推荐采纳反馈字段完整率 100%。',
      '灰度发布范围限定 WO-DEMO-1018 OP-20 与同设备族装配扭矩偏移样本。',
    ],
  })
}

export function approveQualityKnowledgeNextTrainingSetVersion(
  record: QualityKnowledgeRetrainingVersionRecord,
  approvedAt = new Date().toISOString()
) {
  return writeQualityKnowledgeRetrainingVersionRecord({
    ...record,
    status: 'approved',
    statusLabel: '训练集已批准',
    approvedAt,
    approvalAuditId: 'AUD-KG-QA-RETRAINING-R3-APPROVAL-20260521-001',
    approvalTraceId: 'TRACE-KG-QA-WO-DEMO-1018-OP-20-R3-APPROVED',
  })
}

export function runQualityKnowledgeNextTrainingSetValidationPass(
  record: QualityKnowledgeRetrainingVersionRecord,
  validatedAt = new Date().toISOString(),
  mode: QualityKnowledgeNextTrainingSetValidationMode = 'initial'
) {
  const reopened = mode === 'reopened'
  return writeQualityKnowledgeRetrainingVersionRecord({
    ...record,
    status: 'validation_passed',
    statusLabel: '灰度前校验已通过',
    validationStatus: 'passed',
    validatedAt,
    validationAuditId: reopened
      ? 'AUD-KG-QA-RETRAINING-R3-SCOPE-REVALIDATION-PASS-20260521-001'
      : 'AUD-KG-QA-RETRAINING-R3-VALIDATION-PASS-20260521-001',
    validationTraceId: reopened
      ? 'TRACE-KG-QA-WO-DEMO-1018-OP-20-R3-SCOPE-REVALIDATION-PASSED'
      : 'TRACE-KG-QA-WO-DEMO-1018-OP-20-R3-VALIDATION-PASSED',
    validationSummary: reopened
      ? 'R3 调整灰度范围后重新通过灰度前校验，范围缩小到 WO-DEMO-1018 OP-20 与同设备族装配扭矩偏移样本。'
      : 'R3 推荐采纳反馈字段完整，Top-3 召回命中独立扭矩 CAPA 样本，可进入受控灰度发布。',
    validationFindings: reopened
      ? [
          '重开校验范围限定 WO-DEMO-1018 OP-20 与同设备族装配扭矩偏移样本。',
          'Top-3 召回继续命中独立扭矩 CAPA 样本。',
          'R2 回滚期间补充的负样本未被误召回。',
        ]
      : [
          '推荐采纳反馈字段完整率 100%。',
          'Top-3 召回命中独立扭矩 CAPA 样本。',
          '灰度范围限定 OP-20 装配扭矩偏移同设备族。',
        ],
  })
}

export function grayPublishQualityKnowledgeNextTrainingSetVersion(
  record: QualityKnowledgeRetrainingVersionRecord,
  publishedAt = new Date().toISOString(),
  mode: QualityKnowledgeNextTrainingSetGrayPublishMode = 'initial'
) {
  const reopened = mode === 'reopened'
  return writeQualityKnowledgeRetrainingVersionRecord({
    ...record,
    status: 'gray_published',
    statusLabel: reopened ? '已重新灰度发布' : '已灰度发布',
    publishedAt,
    publishAuditId: reopened
      ? QUALITY_KNOWLEDGE_R3_GRAY_REPUBLISH_AUDIT_ID
      : 'AUD-KG-QA-RETRAINING-R3-GRAY-PUBLISH-20260521-001',
    publishTraceId: reopened
      ? QUALITY_KNOWLEDGE_R3_GRAY_REPUBLISH_TRACE_ID
      : 'TRACE-KG-QA-WO-DEMO-1018-OP-20-R3-GRAY-PUBLISHED',
    publishSummary: reopened
      ? 'R3 在调整灰度范围并重新通过校验后，再次灰度发布到 OP-20 装配扭矩推荐链路，继续以 R2 为回滚目标监控误召回。'
      : 'R3 已按受控范围灰度发布到 OP-20 装配扭矩推荐链路，继续监控推荐采纳率、复验通过率和负样本误召回。',
    recommendationScope: reopened
      ? ['WO-DEMO-1018 OP-20 装配扭矩偏移', '同设备族装配扭矩偏移灰度', 'AI 生产助手引用链灰度']
      : ['OP-20 装配扭矩偏移', '质量知识复用排序灰度', 'AI 生产助手引用链灰度'],
  })
}

export function runQualityKnowledgeRetrainingValidation(
  record: QualityKnowledgeRetrainingVersionRecord,
  validatedAt = new Date().toISOString()
) {
  return writeQualityKnowledgeRetrainingVersionRecord({
    ...record,
    status: 'validation_failed',
    statusLabel: '发布前校验未通过',
    validationStatus: 'failed',
    validatedAt,
    validationAuditId: 'AUD-KG-QA-RETRAINING-VALIDATION-20260521-001',
    validationTraceId: 'TRACE-KG-QA-WO-DEMO-1018-OP-20-RETRAINING-VALIDATION-FAILED',
    validationSummary: '发布前抽检发现 OP-20 扭矩工具校准字段缺失，训练集暂不能发布到 AI 推荐链路。',
    validationFindings: [
      'OP-20 扭矩工具校准字段缺失。',
      '离线 Top-3 召回仍需补充扭矩工具族特征。',
      '发布前必须保留 QK-TRAIN-20260521-R1 回滚目标。',
    ],
  })
}

export function rerunQualityKnowledgeRetrainingValidationPass(
  record: QualityKnowledgeRetrainingVersionRecord,
  validatedAt = new Date().toISOString()
) {
  return writeQualityKnowledgeRetrainingVersionRecord({
    ...record,
    status: 'validation_passed',
    statusLabel: '发布前校验已通过',
    validationStatus: 'passed',
    validatedAt,
    validationAuditId: 'AUD-KG-QA-RETRAINING-VALIDATION-PASS-20260521-001',
    validationTraceId: 'TRACE-KG-QA-WO-DEMO-1018-OP-20-RETRAINING-VALIDATION-PASSED',
    validationSummary: 'OP-20 扭矩工具校准字段已补齐，离线 Top-3 召回不再推荐跨工序扫码返工样本，训练集可进入受控发布。',
    validationFindings: [
      '扭矩工具校准字段覆盖率 100%。',
      '低分负样本召回权重下降 36%。',
      '离线 Top-3 未命中跨工序扫码返工样本。',
    ],
  })
}

export function publishQualityKnowledgeRetrainingVersion(
  record: QualityKnowledgeRetrainingVersionRecord,
  publishedAt = new Date().toISOString()
) {
  return writeQualityKnowledgeRetrainingVersionRecord({
    ...record,
    status: 'published',
    statusLabel: '已发布到 AI 推荐',
    publishedAt,
    publishAuditId: 'AUD-KG-QA-RETRAINING-PUBLISH-20260521-001',
    publishTraceId: 'TRACE-KG-QA-WO-DEMO-1018-OP-20-RETRAINING-PUBLISHED',
    publishSummary: '训练集版本通过发布前校验后进入质量知识复用排序，OP-20 装配扭矩偏移将优先匹配独立 CAPA 样本并保留负样本降权。',
    recommendationScope: ['质量知识复用排序', 'AI 生产助手引用链', 'CAPA 草案推荐'],
  })
}

export function rollbackQualityKnowledgeRetrainingVersion(
  record: QualityKnowledgeRetrainingVersionRecord,
  rolledBackAt = new Date().toISOString()
) {
  return writeQualityKnowledgeRetrainingVersionRecord({
    ...record,
    status: 'rolled_back',
    statusLabel: '已回滚到 R1',
    rolledBackAt,
    rollbackAuditId: 'AUD-KG-QA-RETRAINING-ROLLBACK-20260521-001',
    rollbackTraceId: 'TRACE-KG-QA-WO-DEMO-1018-OP-20-RETRAINING-ROLLBACK',
    rollbackReason: '发布前抽检发现 OP-20 扭矩工具校准字段缺失，先回滚训练集版本并等待字段补齐。',
    rollbackTargetVersion: 'QK-TRAIN-20260521-R1',
  })
}

export function buildQualityKnowledgePolicyGovernanceRecords(
  records: QualityKnowledgeReviewQueueRecord[] = readQualityKnowledgeReviewQueueRecords()
): QualityKnowledgePolicyGovernanceRecord[] {
  return records.map(record => ({
    id: `quality-policy-${record.id}`,
    title: `${record.targetWorkOrderId} ${record.operationCode} 复用策略治理`,
    statusLabel: record.status === 'closed' ? record.decisionLabel ?? record.statusLabel : record.statusLabel,
    statusClass: record.status === 'closed' ? 'guarded' : 'logged',
    thresholdLabel: '复用效果阈值 >= 70 分',
    rule: record.disabledReuseRule ?? 'matchScore < 70 或复用效果 < 70 分时进入人工复核，不进入优先推荐。',
    summary: record.decisionSummary ?? `${record.reason} 当前仍需 ${record.owner} 复核后才能形成禁用或再训练结论。`,
    auditId: record.decisionAuditId ?? record.auditId,
    traceId: record.decisionTraceId ?? record.traceId,
    retrainingTraceId: record.retrainingTraceId,
  }))
}

export function buildQualityKnowledgeRetrainingGovernanceRecords(
  versions: QualityKnowledgeRetrainingVersionRecord[] = readQualityKnowledgeRetrainingVersionRecords()
): QualityKnowledgeRetrainingGovernanceRecord[] {
  return versions.map(version => ({
    id: `quality-retraining-governance-${version.id}`,
    title: `${version.trainingSetVersion} ${version.trainingSetName}`,
    statusLabel: version.statusLabel,
    statusClass: ['approved', 'validation_passed', 'published', 'gray_published'].includes(version.status) ? 'accepted' : 'guarded',
    versionLabel: `${version.trainingSetVersion} / ${version.featurePolicy}`,
    sampleLabel: `正样本 ${version.positiveSampleCount} 条 / 负样本 ${version.negativeSampleCount} 条`,
    summary: version.status === 'rolled_back'
      ? `${version.rollbackReason} 原审批 ${version.approvalAuditId} 保留，回滚后等待字段补齐再重新审批。`
      : version.status === 'gray_published'
        ? `${version.publishSummary} 当前灰度范围：${version.recommendationScope?.join(' / ') ?? '质量知识复用排序灰度'}。`
      : version.status === 'published'
        ? `${version.publishSummary} 当前发布范围：${version.recommendationScope?.join(' / ') ?? '质量知识复用排序'}。`
        : version.status === 'validation_passed'
          ? `${version.validationSummary} 当前可发布到 AI 推荐链路。`
      : version.status === 'validation_failed'
        ? `${version.validationSummary} 当前必须补齐校验发现后才能发布或回滚。`
        : version.status === 'merged'
          ? `${version.changeSummary.join('；')} 当前已合并现场反馈，等待质量主管审批。`
        : `${version.changeSummary.join('；')} 发布前必须通过训练集校验门。`,
    auditId: version.status === 'rolled_back'
      ? version.rollbackAuditId ?? version.approvalAuditId
      : version.status === 'gray_published'
        ? version.publishAuditId ?? version.validationAuditId ?? version.approvalAuditId
      : version.status === 'published'
        ? version.publishAuditId ?? version.validationAuditId ?? version.approvalAuditId
      : version.status === 'validation_passed'
        ? version.validationAuditId ?? version.approvalAuditId
      : version.status === 'validation_failed'
        ? version.validationAuditId ?? version.approvalAuditId
      : version.approvalAuditId,
    traceId: version.status === 'rolled_back'
      ? version.rollbackTraceId ?? version.approvalTraceId
      : version.status === 'gray_published'
        ? version.publishTraceId ?? version.validationTraceId ?? version.approvalTraceId
      : version.status === 'published'
        ? version.publishTraceId ?? version.validationTraceId ?? version.approvalTraceId
      : version.status === 'validation_passed'
        ? version.validationTraceId ?? version.approvalTraceId
      : version.status === 'validation_failed'
        ? version.validationTraceId ?? version.approvalTraceId
      : version.approvalTraceId,
    validationSummary: version.validationFindings?.join(' / ') ?? version.validationGates.join(' / '),
    rollbackTarget: version.rollbackTargetVersion,
  }))
}

export function buildQualityKnowledgeRecommendationFeedbackGovernanceRecords(
  records: QualityKnowledgeRecommendationFeedbackRecord[] = readQualityKnowledgeRecommendationFeedbackRecords()
): QualityKnowledgeRecommendationFeedbackGovernanceRecord[] {
  return records.map(record => ({
    id: `quality-recommendation-feedback-governance-${record.id}`,
    title: `${record.targetWorkOrderId} ${record.operationCode} 推荐采纳反馈`,
    statusLabel: record.decisionLabel,
    statusClass: record.decision === 'accepted' ? 'accepted' : 'guarded',
    trainingLabel: `${record.trainingSetVersion} -> ${record.nextTrainingSetVersion}`,
    effectTrendLabel: record.effectTrendLabel,
    summary: `${record.reason} 采纳动作：${record.feedbackActions.join('；')}`,
    auditId: record.auditId,
    traceId: record.traceId,
    nextTrainingSetVersion: record.nextTrainingSetVersion,
    nextTrainingTraceId: record.nextTrainingTraceId,
    metricsLabel: record.feedbackMetrics.map(metric => `${metric.label} ${metric.value}`).join(' / '),
  }))
}

function metricValueForFeedback(
  record: QualityKnowledgeRecommendationFeedbackRecord | undefined,
  label: string,
  fallback: string
) {
  return record?.feedbackMetrics.find(metric => metric.label === label)?.value ?? fallback
}

function percentMetricValue(label: string) {
  const value = Number.parseInt(label, 10)
  return Number.isFinite(value) ? value : undefined
}

function countMetricValue(label: string) {
  const value = Number.parseInt(label, 10)
  return Number.isFinite(value) ? value : undefined
}

function metricSnapshotValue(
  record: QualityKnowledgeGrayReleaseDecisionRecord,
  label: string,
  fallback: string
) {
  return record.metricSnapshot.find(metric => metric.label.includes(label))?.value ?? fallback
}

function qualityTrainingVersionSuffix(version: string) {
  return version.match(/R\d+$/)?.[0] ?? version.replace(/^.*?([A-Za-z0-9]+)$/, '$1')
}

function incrementQualityTrainingVersion(version: string) {
  const match = version.match(/R(\d+)$/)
  if (!match) return `${version}-NEXT`
  return version.replace(/R\d+$/, `R${Number(match[1]) + 1}`)
}

function qualityExperimentGatePassLabel(
  adoptionRate: number,
  recheckPassRateLabel: string,
  falseRecallLabel: string,
  gatePolicy: QualityExperimentExpansionGatePolicy
) {
  const recheckPassRate = percentMetricValue(recheckPassRateLabel)
  const falseRecallCount = countMetricValue(falseRecallLabel)
  const pass = adoptionRate >= gatePolicy.adoptionRateMin
    && recheckPassRate !== undefined
    && recheckPassRate >= gatePolicy.recheckPassRateMin
    && falseRecallCount !== undefined
    && falseRecallCount <= gatePolicy.falseRecallMax
  return pass ? '门禁通过' : '门禁未通过'
}

function feedbackRecordsForQualityTrainingVersion(
  version: QualityKnowledgeRetrainingVersionRecord,
  recommendationFeedbackRecords: QualityKnowledgeRecommendationFeedbackRecord[],
  includeScopeFallback = true
) {
  const versionFeedbackRecords = recommendationFeedbackRecords.filter(record =>
    record.trainingSetVersion === version.trainingSetVersion
  )
  if (versionFeedbackRecords.length) return versionFeedbackRecords
  const nextTrainingFeedbackRecords = recommendationFeedbackRecords.filter(record =>
    record.nextTrainingSetVersion === version.trainingSetVersion
  )
  if (nextTrainingFeedbackRecords.length) return nextTrainingFeedbackRecords
  if (!includeScopeFallback) return []
  return recommendationFeedbackRecords.filter(record =>
      record.targetWorkOrderId === version.targetWorkOrderId
      && record.operationCode === version.operationCode
      && record.decision === 'accepted'
  )
}

export function buildQualityKnowledgeGrayReleaseMonitorRecords(
  versions: QualityKnowledgeRetrainingVersionRecord[] = readQualityKnowledgeRetrainingVersionRecords(),
  recommendationFeedbackRecords: QualityKnowledgeRecommendationFeedbackRecord[] = readQualityKnowledgeRecommendationFeedbackRecords(),
  gatePolicy: QualityExperimentExpansionGatePolicy = readQualityExperimentExpansionGatePolicy()
): QualityKnowledgeGrayReleaseMonitorRecord[] {
  return versions
    .filter(version => version.status === 'gray_published')
    .map(version => {
      const shadowGrayRelease = isQualityKnowledgeShadowGrayReleaseEvidence(version)
      const feedbackRecords = feedbackRecordsForQualityTrainingVersion(version, recommendationFeedbackRecords, false)
      const acceptedFeedbackRecords = feedbackRecords.filter(record => record.decision === 'accepted')
      const primaryFeedback = acceptedFeedbackRecords[0] ?? feedbackRecords[0]
      const adoptionRate = feedbackRecords.length
        ? Math.round((acceptedFeedbackRecords.length / feedbackRecords.length) * 100)
        : shadowGrayRelease ? 100 : 0
      const recheckPassRateLabel = metricValueForFeedback(
        primaryFeedback,
        '复验通过率',
        shadowGrayRelease || version.validationFindings?.some(item => item.includes('反馈字段完整率 100%')) ? '100%' : '待采集'
      )
      const falseRecallCount = shadowGrayRelease || version.validationFindings?.some(item => item.includes('Top-3 召回命中独立扭矩 CAPA 样本')) ? 0 : undefined
      const falseRecallLabel = falseRecallCount === 0 ? '0 次' : '待观察'
      const gatePass = qualityExperimentGatePassLabel(adoptionRate, recheckPassRateLabel, falseRecallLabel, gatePolicy) === '门禁通过'
      const statusClass = gatePass
        ? 'accepted'
        : feedbackRecords.length
          ? 'logged'
          : 'guarded'
      const statusLabel = statusClass === 'accepted'
        ? '灰度监控达标'
        : statusClass === 'logged'
          ? '灰度监控中'
          : '等待灰度反馈'
      const adoptionRateLabel = feedbackRecords.length ? `${adoptionRate}%` : '待采集'
      const negativeSampleLabel = `负样本 ${version.negativeSampleCount} 条 / 误召回 ${falseRecallLabel}`
      const scopeLabel = qualityKnowledgeRecommendationReleaseScopeLabel(version)
      const recommendationScope = version.recommendationScope?.length ? version.recommendationScope : [scopeLabel]
      return {
        id: `quality-gray-release-monitor-${version.id}`,
        title: `${version.trainingSetVersion} 灰度监控`,
        trainingSetVersion: version.trainingSetVersion,
        targetWorkOrderId: version.targetWorkOrderId,
        operationCode: version.operationCode,
        publishedAt: version.publishedAt,
        releaseCycleLabel: qualityKnowledgeGrayReleaseCycleLabel(version),
        statusLabel,
        statusClass,
        versionLabel: `${version.trainingSetVersion} / ${version.trainingSetName}`,
        scopeLabel,
        recommendationScope,
        adoptionRateLabel,
        recheckPassRateLabel,
        falseRecallLabel,
        negativeSampleLabel,
        summary: `${version.publishSummary ?? `${version.trainingSetVersion} 已进入灰度发布监控。`} 当前基于 ${shadowGrayRelease ? '2 个影子场景' : `${feedbackRecords.length} 条现场反馈`} 监控推荐采纳率、复验通过率和负样本误召回；扩大门禁 ${gatePolicy.thresholdLabel}。`,
        auditId: version.publishAuditId ?? version.validationAuditId ?? version.approvalAuditId,
        traceId: version.publishTraceId ?? version.validationTraceId ?? version.approvalTraceId,
        metrics: [
          { label: '推荐采纳率', value: adoptionRateLabel, statusClass },
          { label: '复验通过率', value: recheckPassRateLabel, statusClass: recheckPassRateLabel === '100%' ? 'accepted' : 'logged' },
          { label: '负样本误召回', value: falseRecallLabel, statusClass: falseRecallLabel === '0 次' ? 'accepted' : 'guarded' },
          { label: '灰度范围', value: scopeLabel, statusClass: 'logged' },
        ],
      }
    })
}

export function buildQualityKnowledgeRecommendationExperimentComparisonRecords(
  versions: QualityKnowledgeRetrainingVersionRecord[] = readQualityKnowledgeRetrainingVersionRecords(),
  recommendationFeedbackRecords: QualityKnowledgeRecommendationFeedbackRecord[] = readQualityKnowledgeRecommendationFeedbackRecords(),
  grayReleaseDecisions: QualityKnowledgeGrayReleaseDecisionRecord[] = readQualityKnowledgeGrayReleaseDecisionRecords(),
  gatePolicy: QualityExperimentExpansionGatePolicy = readQualityExperimentExpansionGatePolicy()
): QualityKnowledgeRecommendationExperimentComparisonRecord[] {
  return versions
    .filter(version => version.status === 'gray_published')
    .map(version => {
      const shadowGrayRelease = isQualityKnowledgeShadowGrayReleaseEvidence(version)
      const feedbackRecords = feedbackRecordsForQualityTrainingVersion(version, recommendationFeedbackRecords)
      const acceptedFeedbackRecords = feedbackRecords.filter(record => record.decision === 'accepted')
      const primaryFeedback = acceptedFeedbackRecords[0] ?? feedbackRecords[0]
      const adoptionRate = feedbackRecords.length
        ? Math.round((acceptedFeedbackRecords.length / feedbackRecords.length) * 100)
        : shadowGrayRelease ? 100 : 0
      const recheckPassRateLabel = metricValueForFeedback(
        primaryFeedback,
        '复验通过率',
        shadowGrayRelease || version.validationFindings?.some(item => item.includes('反馈字段完整率 100%')) ? '100%' : '待采集'
      )
      const falseRecallFinding = version.validationFindings?.find(item => item.includes('误召回'))
      const fallbackFalseRecallLabel = falseRecallFinding?.match(/(\d+)\s*次/)?.[0]
        ?? (shadowGrayRelease ? '0 次' : undefined)
        ?? (version.validationFindings?.some(item => item.includes('Top-3 召回命中独立扭矩 CAPA 样本')) ? '0 次' : '待观察')
      const falseRecallLabel = metricValueForFeedback(primaryFeedback, '负样本误召回', fallbackFalseRecallLabel)
      const releaseCycleLabel = qualityKnowledgeGrayReleaseCycleLabel(version)
      const matchingDecisions = grayReleaseDecisions.filter(decision =>
        decision.trainingSetVersion === version.trainingSetVersion
        && decision.targetWorkOrderId === version.targetWorkOrderId
        && decision.operationCode === version.operationCode
        && decision.releaseCycleLabel === releaseCycleLabel
      )
      const latestDecision = matchingDecisions[0]
      const gatePassLabel = qualityExperimentGatePassLabel(adoptionRate, recheckPassRateLabel, falseRecallLabel, gatePolicy)
      const statusClass: QualityKnowledgeRecommendationExperimentComparisonRecord['statusClass'] = latestDecision?.decision === 'rolled_back'
        ? 'guarded'
        : gatePassLabel === '门禁通过'
          ? 'accepted'
          : feedbackRecords.length
            ? 'logged'
            : 'guarded'
      const statusLabel = latestDecision?.decision === 'rolled_back'
        ? '实验已回滚'
        : latestDecision?.decision === 'expanded' && latestDecision.approvalStatus === 'approved'
          ? '实验已扩大'
          : statusClass === 'accepted'
            ? '实验达标'
            : statusClass === 'logged'
              ? '实验观察中'
              : '等待实验反馈'
      const decisionLabel = latestDecision
        ? `${latestDecision.decisionLabel} / ${latestDecision.approvalLabel}`
        : '未触发灰度决策'
      const adoptionRateLabel = feedbackRecords.length || shadowGrayRelease ? `${adoptionRate}%` : '待采集'
      const effectScoreAfter = primaryFeedback?.effectScoreAfter ?? (shadowGrayRelease ? 94 : 0)
      const recheckPassRate = Number.parseInt(recheckPassRateLabel, 10)
      const falseRecallScore = falseRecallLabel === '0 次'
        ? 20
        : falseRecallLabel === '待观察'
          ? 8
          : 0
      const decisionPenalty = latestDecision?.decision === 'rolled_back' ? 25 : 0
      const experimentScore = Math.max(0, Math.round(
        adoptionRate * 0.4
        + (Number.isFinite(recheckPassRate) ? recheckPassRate * 0.25 : 0)
        + falseRecallScore
        + Math.min(effectScoreAfter, 100) * 0.15
        - decisionPenalty
      ))
      const releaseScopeLabel = qualityKnowledgeRecommendationReleaseScopeLabel(version)
      const recommendationScope = version.recommendationScope?.length ? version.recommendationScope : [releaseScopeLabel]
      return {
        id: `quality-recommendation-experiment-${version.id}`,
        title: `${version.trainingSetVersion} 推荐实验`,
        trainingSetVersion: version.trainingSetVersion,
        targetWorkOrderId: version.targetWorkOrderId,
        operationCode: version.operationCode,
        releaseCycleLabel,
        releaseScopeLabel,
        recommendationScope,
        statusLabel,
        statusClass,
        decisionLabel,
        decisionStatusClass: latestDecision?.statusClass ?? 'logged',
        adoptionRateLabel,
        recheckPassRateLabel,
        falseRecallLabel,
        effectTrendLabel: primaryFeedback?.effectTrendLabel ?? '待采集',
        experimentScoreLabel: feedbackRecords.length ? `${experimentScore} 分` : '待采集',
        gatePolicyLabel: gatePolicy.policyLabel,
        gateAuditLabel: gatePolicy.auditLabel,
        gatePassLabel,
        feedbackAuditLabel: primaryFeedback?.auditId ?? (shadowGrayRelease ? version.validationAuditId ?? '影子验证通过' : '待现场反馈'),
        feedbackTraceLabel: primaryFeedback?.traceId ?? primaryFeedback?.nextTrainingTraceId ?? (shadowGrayRelease ? version.validationTraceId ?? '影子验证通过' : '待现场反馈'),
        releaseAuditId: version.publishAuditId ?? version.validationAuditId ?? version.approvalAuditId,
        releaseTraceId: version.publishTraceId ?? version.validationTraceId ?? version.approvalTraceId,
        decisionAuditId: latestDecision?.auditId,
        decisionTraceId: latestDecision?.traceId,
        summary: `${version.trainingSetVersion} 在 ${releaseScopeLabel} 进入${releaseCycleLabel}，基于 ${shadowGrayRelease ? '影子验证结论' : `${feedbackRecords.length} 条现场反馈`} 对比推荐采纳率、复验通过率、负样本误召回和效果趋势。`,
      }
    })
    .sort((left, right) => {
      const rightVersionRank = right.trainingSetVersion.localeCompare(left.trainingSetVersion)
      if (rightVersionRank !== 0) return rightVersionRank
      return right.releaseCycleLabel.localeCompare(left.releaseCycleLabel)
    })
}

export function buildQualityKnowledgeRecommendationExperimentCandidateRecords(
  versions: QualityKnowledgeRetrainingVersionRecord[] = readQualityKnowledgeRetrainingVersionRecords(),
  recommendationFeedbackRecords: QualityKnowledgeRecommendationFeedbackRecord[] = readQualityKnowledgeRecommendationFeedbackRecords(),
  grayReleaseDecisions: QualityKnowledgeGrayReleaseDecisionRecord[] = readQualityKnowledgeGrayReleaseDecisionRecords(),
  gatePolicy: QualityExperimentExpansionGatePolicy = readQualityExperimentExpansionGatePolicy()
): QualityKnowledgeRecommendationExperimentCandidateRecord[] {
  return grayReleaseDecisions
    .filter(decision => decision.decision === 'rolled_back')
    .flatMap<QualityKnowledgeRecommendationExperimentCandidateRecord>((decision) => {
      const failedVersion = versions.find(version =>
        version.trainingSetVersion === decision.trainingSetVersion
        && version.targetWorkOrderId === decision.targetWorkOrderId
        && version.operationCode === decision.operationCode
      )
      const feedback = recommendationFeedbackRecords.find(record =>
        record.trainingSetVersion === decision.trainingSetVersion
        && record.targetWorkOrderId === decision.targetWorkOrderId
        && record.operationCode === decision.operationCode
      )
      const falseRecallLabel = metricSnapshotValue(decision, '误召回', '0 次')
      const falseRecallCount = countMetricValue(falseRecallLabel) ?? 0
      const currentNegativeSamples = failedVersion?.negativeSampleCount ?? Math.max(falseRecallCount, 1)
      const requiredNegativeSamples = currentNegativeSamples + Math.max(falseRecallCount, 1)
      const coveragePercent = requiredNegativeSamples
        ? Math.round((currentNegativeSamples / requiredNegativeSamples) * 100)
        : 100
      const patchCount = Math.max(requiredNegativeSamples - currentNegativeSamples, 0)
      const sourceSuffix = qualityTrainingVersionSuffix(decision.trainingSetVersion)
      const patchVersion = feedback?.nextTrainingSetVersion ?? incrementQualityTrainingVersion(decision.trainingSetVersion)
      const patchSuffix = qualityTrainingVersionSuffix(patchVersion)
      const shadowVersion = incrementQualityTrainingVersion(patchVersion)
      const shadowSuffix = qualityTrainingVersionSuffix(shadowVersion)
      const adoptionRateLabel = metricSnapshotValue(decision, '采纳', '待复核')
      const recheckPassRateLabel = metricSnapshotValue(decision, '复验', '待复核')
      const patchAuditId = `AUD-KG-QA-RETRAINING-${patchSuffix}-NEGATIVE-COVERAGE-20260521-001`
      const patchTraceId = `TRACE-KG-QA-${decision.targetWorkOrderId}-${decision.operationCode}-${patchSuffix}-NEGATIVE-COVERAGE`
      const shadowAuditId = `AUD-KG-QA-RETRAINING-${shadowSuffix}-SHADOW-VALIDATION-20260521-001`
      const shadowTraceId = `TRACE-KG-QA-${decision.targetWorkOrderId}-${decision.operationCode}-${shadowSuffix}-SHADOW-VALIDATION`
      const patchExecutionVersion = versions.find(version =>
        version.trainingSetVersion === patchVersion
        && version.targetWorkOrderId === decision.targetWorkOrderId
        && version.operationCode === decision.operationCode
        && version.candidateTraceId === patchTraceId
      )
      const shadowExecutionVersion = versions.find(version =>
        version.trainingSetVersion === shadowVersion
        && version.targetWorkOrderId === decision.targetWorkOrderId
        && version.operationCode === decision.operationCode
        && version.candidateTraceId === shadowTraceId
      )
      const patchStatusLabel = patchExecutionVersion?.statusLabel ?? (patchCount > 0 ? '补样待合并' : '负样本覆盖充足')
      const patchStatusClass = patchExecutionVersion ? 'accepted' : patchCount > 0 ? 'guarded' : 'accepted'
      const patchNextAction = patchExecutionVersion
        ? `${patchVersion} 已合并跨线负样本，下一步排队 ${shadowVersion} 影子验证。`
        : `${patchVersion} 合并 ${patchCount} 条跨线负样本后，必须重新跑 ${gatePolicy.thresholdLabel}。`
      const patchSummary = patchExecutionVersion
        ? `${patchVersion} 已基于 ${decision.trainingSetVersion} 回滚样本合并跨线负样本，覆盖 ${patchExecutionVersion.negativeSampleCount}/${patchExecutionVersion.negativeSampleCount} 条；进入 ${shadowVersion} 影子验证前不得扩大灰度。`
        : `${decision.trainingSetVersion} 因 ${decision.reason} 回滚；当前负样本覆盖 ${currentNegativeSamples}/${requiredNegativeSamples} 条（${coveragePercent}%），${patchCount > 0 ? `需补 ${patchCount} 条跨线负样本后再进入 ${patchVersion}。` : `可进入 ${patchVersion} 灰度前校验。`}`
      const shadowStatusLabel = shadowExecutionVersion?.statusLabel ?? (patchExecutionVersion ? '影子验证待执行' : '影子验证待排队')
      const shadowStatusClass = shadowExecutionVersion ? 'accepted' : 'logged'
      const shadowPublished = shadowExecutionVersion?.status === 'gray_published'
      const shadowNextAction = shadowPublished
        ? `${shadowVersion} 已进入影子灰度范围，下一步由系统管理提交扩大灰度并等待质量主管确认；未确认前不进入主动推荐。`
        : shadowExecutionVersion
        ? `${shadowVersion} 已通过影子验证，可发布到影子灰度范围并提交质量主管扩大审批；主动推荐仍需门禁审批后启用。`
        : `${shadowVersion} 只进入影子验证，连续两轮误召回 0 次后才允许提交扩大审批。`
      const shadowSummary = shadowPublished
        ? `${shadowVersion} 已完成影子流量复核并发布到跨线影子灰度范围，连续 2 个跨线场景误召回 0 次；未形成质量主管确认前仍排除主动推荐。`
        : shadowExecutionVersion
        ? `${shadowVersion} 已完成影子流量复核，连续 2 个跨线场景误召回 0 次，保留 ${shadowTraceId} 作为扩大审批前置证据。`
        : `${patchVersion} 补齐负样本后，${shadowVersion} 用影子流量复核跨线 OP-20 扭矩偏移是否仍会误召回；未通过前不进入主动推荐选择。`

      return [
        {
          id: `quality-experiment-candidate-${patchVersion.toLowerCase()}-negative-coverage`,
          title: `${patchVersion} 补样实验候选`,
          candidateTrainingSetVersion: patchVersion,
          sourceTrainingSetVersion: decision.trainingSetVersion,
          targetWorkOrderId: decision.targetWorkOrderId,
          operationCode: decision.operationCode,
          candidateType: 'negative_sample_patch',
          statusLabel: patchStatusLabel,
          statusClass: patchStatusClass,
          triggerLabel: `${sourceSuffix} 回滚触发`,
          negativeCoverageLabel: patchExecutionVersion ? `${requiredNegativeSamples} / ${requiredNegativeSamples} 条` : `${currentNegativeSamples} / ${requiredNegativeSamples} 条`,
          coveragePercentLabel: patchExecutionVersion ? '100%' : `${coveragePercent}%`,
          gapLabel: patchExecutionVersion ? '跨线负样本已补齐' : patchCount > 0 ? `需补 ${patchCount} 条跨线负样本` : '无需补样',
          adoptionRateLabel,
          recheckPassRateLabel,
          falseRecallLabel,
          gatePolicyLabel: gatePolicy.policyLabel,
          sourceAuditId: decision.auditId,
          sourceTraceId: decision.traceId,
          auditId: patchExecutionVersion?.approvalAuditId ?? patchAuditId,
          traceId: patchExecutionVersion?.approvalTraceId ?? patchTraceId,
          nextAction: patchNextAction,
          summary: patchSummary,
          references: [
            decision.reason,
            `${decision.auditId} / ${decision.traceId}`,
            ...(feedback ? [`${feedback.auditId} / ${feedback.traceId}`, `下一轮训练 ${feedback.nextTrainingSetVersion} / ${feedback.nextTrainingTraceId}`] : []),
            ...(patchExecutionVersion?.changeSummary ?? []),
            ...(failedVersion?.validationFindings ?? []),
          ],
        },
        {
          id: `quality-experiment-candidate-${shadowVersion.toLowerCase()}-shadow-validation`,
          title: `${shadowVersion} 影子验证候选`,
          candidateTrainingSetVersion: shadowVersion,
          sourceTrainingSetVersion: decision.trainingSetVersion,
          targetWorkOrderId: decision.targetWorkOrderId,
          operationCode: decision.operationCode,
          candidateType: 'shadow_validation',
          statusLabel: shadowStatusLabel,
          statusClass: shadowStatusClass,
          triggerLabel: `${patchSuffix} 补样后触发`,
          negativeCoverageLabel: `${requiredNegativeSamples} / ${requiredNegativeSamples} 条`,
          coveragePercentLabel: '100%',
          gapLabel: shadowPublished ? '影子灰度已发布' : shadowExecutionVersion ? '影子场景已通过' : '追加 2 个跨线影子场景',
          adoptionRateLabel,
          recheckPassRateLabel,
          falseRecallLabel,
          gatePolicyLabel: gatePolicy.policyLabel,
          sourceAuditId: patchExecutionVersion?.approvalAuditId ?? patchAuditId,
          sourceTraceId: patchExecutionVersion?.approvalTraceId ?? patchTraceId,
          auditId: shadowPublished
            ? shadowExecutionVersion?.publishAuditId ?? shadowExecutionVersion?.validationAuditId ?? shadowAuditId
            : shadowExecutionVersion?.validationAuditId ?? shadowAuditId,
          traceId: shadowPublished
            ? shadowExecutionVersion?.publishTraceId ?? shadowExecutionVersion?.validationTraceId ?? shadowTraceId
            : shadowExecutionVersion?.validationTraceId ?? shadowTraceId,
          nextAction: shadowNextAction,
          summary: shadowSummary,
          references: [
            `${patchExecutionVersion?.approvalAuditId ?? patchAuditId} / ${patchExecutionVersion?.approvalTraceId ?? patchTraceId}`,
            `${decision.trainingSetVersion} 误召回 ${falseRecallLabel}`,
            `扩大门禁 ${gatePolicy.thresholdLabel}`,
            ...(shadowPublished ? shadowExecutionVersion?.recommendationScope ?? [] : []),
            ...(shadowExecutionVersion?.validationFindings ?? []),
          ],
        },
      ]
    })
    .sort((left, right) => {
      const sourceRank = left.sourceTrainingSetVersion.localeCompare(right.sourceTrainingSetVersion)
      if (sourceRank !== 0) return sourceRank
      return left.candidateTrainingSetVersion.localeCompare(right.candidateTrainingSetVersion)
    })
}

export function mergeQualityExperimentNegativeSampleCandidate(
  candidate: QualityKnowledgeRecommendationExperimentCandidateRecord,
  mergedAt = new Date().toISOString()
) {
  const candidateSuffix = qualityTrainingVersionSuffix(candidate.candidateTrainingSetVersion)
  const negativeSampleCount = countMetricValue(candidate.negativeCoverageLabel.split('/')[1] ?? candidate.negativeCoverageLabel) ?? 8
  return writeQualityKnowledgeRetrainingVersionRecord({
    id: `quality-retraining-version-${candidate.candidateTrainingSetVersion.toLowerCase()}`,
    sourceReviewQueueId: `experiment-candidate-${candidate.id}`,
    targetWorkOrderId: candidate.targetWorkOrderId,
    operationCode: candidate.operationCode,
    candidateTraceId: candidate.traceId,
    trainingSetVersion: candidate.candidateTrainingSetVersion,
    trainingSetName: 'R5 回滚负样本补齐实验集',
    status: 'merged',
    statusLabel: '补样已合并',
    approvedBy: '知识库管理员 / 质量主管 刘工',
    approvedAt: mergedAt,
    approvalAuditId: `AUD-KG-QA-RETRAINING-${candidateSuffix}-NEGATIVE-COVERAGE-MERGE-20260521-001`,
    approvalTraceId: `TRACE-KG-QA-${candidate.targetWorkOrderId}-${candidate.operationCode}-${candidateSuffix}-NEGATIVE-COVERAGE-MERGED`,
    positiveSampleCount: 38,
    negativeSampleCount,
    featurePolicy: 'R6 仅补齐 R5 回滚后的跨线负样本覆盖，不进入主动推荐扩大；后续必须先跑 R7 影子验证。',
    changeSummary: [
      `${candidate.sourceTrainingSetVersion} 回滚后的跨线负样本已补齐到 ${negativeSampleCount} 条。`,
      '新增 2 条跨线同名缺陷负样本，区分工序、产线、设备族和扭矩工具校准窗口。',
      'R6 作为补样实验集保留，不直接参与主动推荐选择。',
    ],
    validationGates: [
      'R6 补样后负样本覆盖率达到 100%。',
      'R7 影子验证前不得提交扩大灰度审批。',
      '扩大门禁仍需满足推荐采纳率 100%、复验通过率 >=95%、负样本误召回 0 次。',
    ],
  })
}

export function runQualityExperimentShadowValidationCandidate(
  candidate: QualityKnowledgeRecommendationExperimentCandidateRecord,
  validatedAt = new Date().toISOString()
) {
  const candidateSuffix = qualityTrainingVersionSuffix(candidate.candidateTrainingSetVersion)
  return writeQualityKnowledgeRetrainingVersionRecord({
    id: `quality-retraining-version-${candidate.candidateTrainingSetVersion.toLowerCase()}`,
    sourceReviewQueueId: `experiment-candidate-${candidate.id}`,
    targetWorkOrderId: candidate.targetWorkOrderId,
    operationCode: candidate.operationCode,
    candidateTraceId: candidate.traceId,
    trainingSetVersion: candidate.candidateTrainingSetVersion,
    trainingSetName: 'R7 跨线扭矩偏移影子验证集',
    status: 'validation_passed',
    statusLabel: '影子验证已通过',
    approvedBy: '知识库管理员 / 质量主管 刘工',
    approvedAt: validatedAt,
    approvalAuditId: `AUD-KG-QA-RETRAINING-${candidateSuffix}-SHADOW-VALIDATION-APPROVAL-20260521-001`,
    approvalTraceId: `TRACE-KG-QA-${candidate.targetWorkOrderId}-${candidate.operationCode}-${candidateSuffix}-SHADOW-VALIDATION-APPROVED`,
    positiveSampleCount: 38,
    negativeSampleCount: countMetricValue(candidate.negativeCoverageLabel.split('/')[1] ?? candidate.negativeCoverageLabel) ?? 8,
    featurePolicy: 'R7 只运行影子流量，验证跨线同名缺陷不会再次误召回；通过后仅可提交扩大审批。',
    changeSummary: [
      '继承 R6 补齐后的 8 条跨线负样本覆盖。',
      '追加 2 个跨线影子场景，覆盖同名扭矩偏移但不同产线/设备族组合。',
      '影子验证结果不直接进入主动推荐，必须先形成质量主管审批。',
    ],
    validationGates: [
      '2 个跨线影子场景误召回 0 次。',
      'OP-20 装配扭矩推荐 Top-3 仍命中独立 CAPA 样本。',
      '扩大审批前保留 R2 正式版回滚目标。',
    ],
    validationStatus: 'passed',
    validatedAt,
    validationAuditId: `AUD-KG-QA-RETRAINING-${candidateSuffix}-SHADOW-VALIDATION-PASS-20260521-001`,
    validationTraceId: `TRACE-KG-QA-${candidate.targetWorkOrderId}-${candidate.operationCode}-${candidateSuffix}-SHADOW-VALIDATION-PASSED`,
    validationSummary: 'R7 影子验证通过，2 个跨线场景误召回 0 次，可进入质量主管扩大审批准备。',
    validationFindings: [
      '跨线影子场景 LX-A / LX-B 均未触发同名缺陷误召回。',
      'Top-3 推荐继续命中 OP-20 独立扭矩 CAPA 样本。',
      'R2 正式版回滚目标保持可用。',
    ],
  })
}

export function grayPublishQualityExperimentShadowValidationVersion(
  record: QualityKnowledgeRetrainingVersionRecord,
  publishedAt = new Date().toISOString()
) {
  const versionSuffix = qualityTrainingVersionSuffix(record.trainingSetVersion)
  return writeQualityKnowledgeRetrainingVersionRecord({
    ...record,
    status: 'gray_published',
    statusLabel: '影子灰度已发布',
    publishedAt,
    publishAuditId: `AUD-KG-QA-RETRAINING-${versionSuffix}-SHADOW-GRAY-PUBLISH-20260521-001`,
    publishTraceId: `TRACE-KG-QA-${record.targetWorkOrderId}-${record.operationCode}-${versionSuffix}-SHADOW-GRAY-PUBLISHED`,
    publishSummary: `${record.trainingSetVersion} 已基于 R6 负样本补齐和 R7 影子验证发布到跨线影子灰度范围；未完成扩大决策与质量主管确认前，不进入主动推荐选择。`,
    recommendationScope: [
      '跨线 OP-20 扭矩偏移影子灰度',
      '质量知识复用排序影子流量',
      'AI 生产助手引用链影子校验',
    ],
  })
}

function writeQualityKnowledgeGrayReleaseDecisionRecord(record: QualityKnowledgeGrayReleaseDecisionRecord) {
  if (record.reviewIssueId && !record.reviewIssueLabel) {
    record = {
      ...record,
      reviewIssueLabel: qualityGrayReviewIssueLabel(record),
    }
  }
  if (!canUseStorage()) return record
  const next = [
    record,
    ...readQualityKnowledgeGrayReleaseDecisionRecords().filter(item => item.id !== record.id),
  ].slice(0, 12)
  window.localStorage.setItem(GRAY_RELEASE_DECISION_STORAGE_KEY, JSON.stringify(next))
  syncQualityKnowledgeEvidence('QualityKnowledgeGrayReleaseDecision', `${record.trainingSetVersion} ${record.decisionLabel}`, record.decision, record, record.auditId, record.traceId, record.decidedAt)
  upsertOtdEvidenceChainRecord({
    id: `quality-gray-release-decision-${record.id}`,
    stage: record.decision === 'expanded' ? '灰度扩大' : '灰度回滚',
    title: `${record.trainingSetVersion} ${record.decisionLabel}`,
    summary: `${record.auditId}：${record.reason} 审批状态：${record.approvalLabel}。指标快照：${record.metricSnapshot.map(metric => `${metric.label} ${metric.value}`).join(' / ')}。${record.reviewIssueId ? `待复核问题单 ${record.reviewIssueId} 已生成。` : ''}`,
    object: `${record.targetWorkOrderId} / ${record.operationCode}`,
    source: '系统管理 / 质量推荐灰度治理',
    traceId: record.traceId,
    status: record.decision === 'expanded' && record.approvalStatus !== 'approved' ? 'ready' : record.decision === 'expanded' ? 'closed' : 'active',
    statusLabel: record.decisionLabel,
    createdAt: record.decidedAt,
  })
  if (record.reviewIssueId && record.reviewIssueTraceId) {
    const reviewIssueEvidenceStatus = qualityGrayReviewIssueEvidenceStatus(record)
    const reviewIssueActions = record.reviewIssueActions?.join(' / ')
    const reviewIssueSummary = record.reviewIssueStatus === 'closed'
      ? `${record.reviewIssueId} 已关闭：${reviewIssueActions ?? '已补充 R3 负样本并保留 R2 回滚目标。'}`
      : record.reviewIssueStatus === 'prevalidation_reopened'
        ? `${record.reviewIssueId} 已重开灰度前校验：${reviewIssueActions ?? '已调整灰度范围，等待复核 R3 是否可再次灰度发布。'}`
        : `${record.reviewIssueId} 已打开：复核 ${record.trainingSetVersion} 灰度指标、推荐降级原因和是否需要补充负样本；回滚目标 ${record.rollbackTargetVersion ?? 'QK-TRAIN-20260521-R2'}。`
    upsertOtdEvidenceChainRecord({
      id: `quality-gray-review-issue-${record.reviewIssueId}`,
      stage: '灰度复核问题单',
      title: `${record.trainingSetVersion} 回滚后待复核问题单`,
      summary: reviewIssueSummary,
      object: `${record.targetWorkOrderId} / ${record.operationCode}`,
      source: '系统管理 / 质量推荐灰度治理',
      traceId: record.reviewIssueTraceId,
      status: reviewIssueEvidenceStatus.status,
      statusLabel: reviewIssueEvidenceStatus.statusLabel,
      createdAt: record.reviewIssueClosedAt ?? record.decidedAt,
    })
  }
  return record
}

export function decideQualityKnowledgeGrayRelease(
  monitor: QualityKnowledgeGrayReleaseMonitorRecord,
  decision: QualityKnowledgeGrayReleaseDecisionType,
  decidedAt = new Date().toISOString()
) {
  const releaseCycleLabel = monitor.releaseCycleLabel
  const versionSuffix = qualityTrainingVersionSuffix(monitor.trainingSetVersion)
  const rollbackTargetVersion = qualityKnowledgeDefaultRollbackTargetVersion(monitor.trainingSetVersion)
  const cycleSlug = qualityKnowledgeGrayReleaseCycleSlug(releaseCycleLabel)
  const decisionAuditAction = decision === 'expanded' ? 'EXPAND' : 'ROLLBACK'
  const decisionTraceAction = decision === 'expanded' ? 'EXPANDED' : 'ROLLED-BACK'
  const auditCycleSegment = releaseCycleLabel === '重新灰度发布' ? 'GRAY-REPUBLISH' : 'GRAY'
  const traceCycleSegment = releaseCycleLabel === '重新灰度发布' ? 'GRAY-REPUBLISH' : 'GRAY'
  const reviewIssueCycleSegment = releaseCycleLabel === '重新灰度发布' ? `${versionSuffix}-REPUBLISH-REVIEW-ISSUE` : `${versionSuffix}-REVIEW-ISSUE`
  const metricSnapshot = monitor.metrics.map(metric => ({
    label: metric.label,
    value: metric.value,
  }))
  const baseRecord: QualityKnowledgeGrayReleaseDecisionRecord = {
    id: `quality-gray-release-decision-${monitor.trainingSetVersion.toLowerCase()}-${cycleSlug}-${decision}`,
    monitorId: monitor.id,
    trainingSetVersion: monitor.trainingSetVersion,
    targetWorkOrderId: monitor.targetWorkOrderId,
    operationCode: monitor.operationCode,
    releaseCycleLabel,
    releaseAuditId: monitor.auditId,
    releaseTraceId: monitor.traceId,
    releaseScopeLabel: monitor.scopeLabel,
    decision,
    decisionLabel: decision === 'expanded' ? '扩大灰度范围' : '回滚到 R2 正式版',
    statusClass: decision === 'expanded' ? 'accepted' : 'guarded',
    decidedBy: '质量主管 刘工 / 知识库管理员',
    decidedAt,
    auditId: `AUD-KG-QA-RETRAINING-${versionSuffix}-${auditCycleSegment}-${decisionAuditAction}-20260521-001`,
    traceId: `TRACE-KG-QA-WO-DEMO-1018-OP-20-${versionSuffix}-${traceCycleSegment}-${decisionTraceAction}`,
    reason: decision === 'expanded'
      ? `${releaseCycleLabel} ${monitor.statusLabel}，推荐采纳率 ${monitor.adoptionRateLabel}、复验通过率 ${monitor.recheckPassRateLabel}、负样本误召回 ${monitor.falseRecallLabel}，允许从 ${monitor.scopeLabel} 扩大到同类 OP-20 装配扭矩推荐。`
      : `${releaseCycleLabel} ${monitor.statusLabel} 未满足扩大灰度条件或现场要求保守验证，先回滚到 ${rollbackTargetVersion} 正式发布版本，${monitor.trainingSetVersion} 保留为待复核灰度样本。`,
    approvalStatus: decision === 'expanded' ? 'pending' : 'not_required',
    approvalLabel: decision === 'expanded' ? '待质量主管确认' : '回滚无需扩大审批',
    rollbackTargetVersion: decision === 'rolled_back' ? rollbackTargetVersion : undefined,
    expansionScope: decision === 'expanded'
      ? ['OP-20 装配扭矩推荐链路', '同类装配扭矩偏移 CAPA 推荐', 'AI 生产助手引用链']
      : undefined,
    reviewIssueId: decision === 'rolled_back' ? `${reviewIssueCycleSegment}-20260521-001` : undefined,
    reviewIssueTraceId: decision === 'rolled_back' ? `TRACE-KG-QA-WO-DEMO-1018-OP-20-${reviewIssueCycleSegment}` : undefined,
    reviewIssueStatus: decision === 'rolled_back' ? 'open' : undefined,
    reviewIssueLabel: decision === 'rolled_back' ? '待复核' : undefined,
    reviewIssueActions: decision === 'rolled_back'
      ? [
          `复核 ${monitor.trainingSetVersion} 灰度指标、推荐降级原因和负样本覆盖。`,
          '决定补充负样本后关闭问题单，或调整灰度范围后重开灰度前校验。',
        ]
      : undefined,
    metricSnapshot,
    actions: decision === 'expanded'
      ? [
          `保留 ${monitor.trainingSetVersion} 为受控灰度推荐版本，并扩大到同类 OP-20 装配扭矩偏移场景。`,
          'Agent 治理继续监控推荐采纳率、复验通过率和负样本误召回。',
          '报表中心与审计回放使用同一决策记录复盘扩大依据。',
        ]
      : [
          `从 active 推荐选择中排除 ${monitor.trainingSetVersion}。`,
          `OP-20 质量推荐排序恢复到 ${rollbackTargetVersion} 正式发布版本。`,
          `${monitor.trainingSetVersion} 灰度指标、回滚原因和审计编号进入 OTD 证据链与审计回放。`,
        ],
  }
  return writeQualityKnowledgeGrayReleaseDecisionRecord(baseRecord)
}

export function approveQualityKnowledgeGrayReleaseExpansion(
  record: QualityKnowledgeGrayReleaseDecisionRecord,
  approvedAt = new Date().toISOString()
) {
  if (record.decision !== 'expanded') return record
  return writeQualityKnowledgeGrayReleaseDecisionRecord({
    ...record,
    approvalStatus: 'approved',
    approvalLabel: '质量主管已确认扩大',
    approvedBy: '质量主管 刘工',
    approvedAt,
    actions: [
      ...record.actions.filter(action => !action.includes('待质量主管确认')),
      `质量主管已确认扩大灰度，${record.trainingSetVersion} 可进入受控 active 推荐范围。`,
    ],
  })
}

export function closeQualityKnowledgeGrayReviewIssueWithNegativeSample(
  record: QualityKnowledgeGrayReleaseDecisionRecord,
  closedAt = new Date().toISOString()
) {
  if (record.decision !== 'rolled_back' || !record.reviewIssueId) return record
  return writeQualityKnowledgeGrayReleaseDecisionRecord({
    ...record,
    reviewIssueStatus: 'closed',
    reviewIssueLabel: '问题单已关闭',
    reviewIssueResolution: 'negative_sample_added',
    reviewIssueClosedBy: '质量主管 刘工',
    reviewIssueClosedAt: closedAt,
    reviewIssueValidationAuditId: 'AUD-KG-QA-RETRAINING-R3-REVIEW-CLOSE-20260521-001',
    reviewIssueValidationTraceId: 'TRACE-KG-QA-WO-DEMO-1018-OP-20-R3-REVIEW-CLOSED',
    reviewIssueActions: [
      '补充 R3 负样本：跨工序扫码返工 CAPA 不再进入 OP-20 装配扭矩 Top-3 推荐。',
      '保留 QK-TRAIN-20260521-R2 作为正式推荐版本，R3 转入下一轮受控校验样本池。',
      '关闭待复核问题单，并把处置结论写入报表、审计回放和 OTD 证据链。',
    ],
    actions: [
      ...record.actions,
      '质量主管补充 R3 负样本后关闭待复核问题单，R2 继续作为当前正式推荐版本。',
    ],
  })
}

export function reopenQualityKnowledgeGrayPrevalidationWithScopeAdjustment(
  record: QualityKnowledgeGrayReleaseDecisionRecord,
  reopenedAt = new Date().toISOString()
) {
  if (record.decision !== 'rolled_back' || !record.reviewIssueId) return record
  return writeQualityKnowledgeGrayReleaseDecisionRecord({
    ...record,
    reviewIssueStatus: 'prevalidation_reopened',
    reviewIssueLabel: '已重开灰度前校验',
    reviewIssueResolution: 'scope_adjusted',
    reviewIssueClosedBy: '质量主管 刘工',
    reviewIssueClosedAt: reopenedAt,
    reviewIssueValidationAuditId: 'AUD-KG-QA-RETRAINING-R3-SCOPE-REVALIDATION-20260521-001',
    reviewIssueValidationTraceId: 'TRACE-KG-QA-WO-DEMO-1018-OP-20-R3-SCOPE-REVALIDATION',
    reviewIssueActions: [
      '缩小 R3 灰度范围到 WO-DEMO-1018 OP-20 与同设备族装配扭矩偏移样本。',
      '重新打开灰度前校验，复核推荐采纳字段、Top-3 召回和负样本误召回。',
      '校验通过前 R2 仍为正式推荐版本，R3 不重新进入 active 推荐选择。',
    ],
    actions: [
      ...record.actions,
      '质量主管调整 R3 灰度范围并重开灰度前校验，校验通过前仍由 R2 承接正式推荐。',
    ],
  })
}

export function buildQualityKnowledgeAssetGovernanceRecords(
  samples: QualityKnowledgeSampleRecord[] = readQualityKnowledgeSamples(),
  reviewRecords: QualityKnowledgeReviewQueueRecord[] = readQualityKnowledgeReviewQueueRecords(),
  retrainingVersions: QualityKnowledgeRetrainingVersionRecord[] = readQualityKnowledgeRetrainingVersionRecords(),
  recommendationFeedbackRecords: QualityKnowledgeRecommendationFeedbackRecord[] = readQualityKnowledgeRecommendationFeedbackRecords(),
  grayReleaseDecisions: QualityKnowledgeGrayReleaseDecisionRecord[] = readQualityKnowledgeGrayReleaseDecisionRecords()
): QualityKnowledgeAssetGovernanceRecord[] {
  const sampleAssets: QualityKnowledgeAssetGovernanceRecord[] = samples.map(sample => ({
    id: `quality-asset-sample-${sample.id}`,
    title: sample.documentTitle,
    assetStage: '样本入库',
    statusLabel: '已入库',
    statusClass: 'accepted',
    summary: `${sample.workOrderId} ${sample.operationCode} 的 ${sample.defectPattern} 已固化为 ${sample.version}，可作为同类缺陷推荐、隔离、返工成本和排产回写的复用基线。`,
    auditId: sample.auditId,
    traceId: sample.traceId,
    scoreLabel: '源样本',
    owner: '质量工程师 / 知识库管理员',
    nextAction: '进入同类缺陷推荐排序，并持续接收正式 CAPA 的效果评分反馈。',
    sourceDocumentTitle: sample.documentTitle,
    references: sample.reuseTargets,
  }))

  const reviewAssets = reviewRecords.flatMap<QualityKnowledgeAssetGovernanceRecord>((record) => {
    if (record.status !== 'closed') {
      return [{
        id: `quality-asset-review-${record.id}`,
        title: record.title,
        assetStage: '复核中',
        statusLabel: record.statusLabel,
        statusClass: 'logged',
        summary: record.reason,
        auditId: record.auditId,
        traceId: record.traceId,
        scoreLabel: `低分 ${record.effectScore} 分`,
        owner: record.owner,
        nextAction: '完成复核后决定是否禁用直接复用、沉淀负样本或进入再训练候选。',
        sourceDocumentTitle: '质量知识低分复核队列',
        references: record.reviewActions,
      }]
    }

    const decisionAuditId = record.decisionAuditId ?? record.auditId
    const decisionTraceId = record.decisionTraceId ?? record.traceId
    const decisionSummary = record.decisionSummary ?? record.reason
    const disabledRule = record.disabledReuseRule ?? '低分候选禁止进入直接推荐。'
    const retrainingVersion = retrainingVersions.find(item => item.sourceReviewQueueId === record.id)
    const retrainingSummary = record.retrainingPlan?.join('；') ?? '等待知识库管理员确认再训练样本字段、标签和负样本权重。'
    const retrainingStatusLabel = retrainingVersion?.statusLabel ?? '待再训练确认'
    const retrainingStatusClass = retrainingVersion
      ? ['approved', 'validation_passed', 'published', 'gray_published'].includes(retrainingVersion.status) ? 'accepted' : 'guarded'
      : 'logged'
    const retrainingNextAction = retrainingVersion
      ? retrainingVersion.status === 'rolled_back'
        ? `${retrainingVersion.rollbackReason} 当前回滚目标 ${retrainingVersion.rollbackTargetVersion}，需补齐字段后重新审批。`
        : retrainingVersion.status === 'published' || retrainingVersion.status === 'gray_published'
          ? `${retrainingVersion.publishSummary} 发布范围：${retrainingVersion.recommendationScope?.join(' / ') ?? '质量知识复用排序'}。`
          : retrainingVersion.status === 'validation_passed'
            ? `${retrainingVersion.validationSummary} 可发布到 AI 推荐链路。`
        : retrainingVersion.status === 'validation_failed'
          ? `${retrainingVersion.validationSummary} 建议回滚到 ${retrainingVersion.rollbackTargetVersion ?? 'QK-TRAIN-20260521-R1'}，补齐字段后重新校验。`
          : `${retrainingVersion.trainingSetVersion} 已批准；发布前需通过 ${retrainingVersion.validationGates.join(' / ')}。`
      : '补齐独立 CAPA 样本字段后进入训练样本集，保留本次低分尝试作为负样本。'
    const retrainingAuditId = retrainingVersion?.status === 'rolled_back'
      ? retrainingVersion.rollbackAuditId ?? retrainingVersion.approvalAuditId
      : retrainingVersion?.status === 'published' || retrainingVersion?.status === 'gray_published'
        ? retrainingVersion.publishAuditId ?? retrainingVersion.validationAuditId ?? retrainingVersion.approvalAuditId
      : retrainingVersion?.status === 'validation_passed'
        ? retrainingVersion.validationAuditId ?? retrainingVersion.approvalAuditId
      : retrainingVersion?.status === 'validation_failed'
        ? retrainingVersion.validationAuditId ?? retrainingVersion.approvalAuditId
      : retrainingVersion?.approvalAuditId ?? decisionAuditId
    const retrainingTraceId = retrainingVersion?.status === 'rolled_back'
      ? retrainingVersion.rollbackTraceId ?? retrainingVersion.approvalTraceId
      : retrainingVersion?.status === 'published' || retrainingVersion?.status === 'gray_published'
        ? retrainingVersion.publishTraceId ?? retrainingVersion.validationTraceId ?? retrainingVersion.approvalTraceId
      : retrainingVersion?.status === 'validation_passed'
        ? retrainingVersion.validationTraceId ?? retrainingVersion.approvalTraceId
      : retrainingVersion?.status === 'validation_failed'
        ? retrainingVersion.validationTraceId ?? retrainingVersion.approvalTraceId
      : retrainingVersion?.approvalTraceId ?? record.retrainingTraceId ?? decisionTraceId
    const retrainingScoreLabel = retrainingVersion
      ? `${retrainingVersion.trainingSetVersion} / 负样本 ${retrainingVersion.negativeSampleCount} 条`
      : '训练候选'

    return [
      {
        id: `quality-asset-disabled-${record.id}`,
        title: `${record.targetWorkOrderId} ${record.operationCode} 直接复用禁用`,
        assetStage: '禁用',
        statusLabel: record.decisionLabel ?? record.statusLabel,
        statusClass: 'guarded',
        summary: decisionSummary,
        auditId: decisionAuditId,
        traceId: decisionTraceId,
        scoreLabel: `低分 ${record.effectScore} 分 / 阈值 70 分`,
        owner: record.owner,
        nextAction: disabledRule,
        sourceDocumentTitle: '质量知识低分复核队列',
        references: [record.reason, disabledRule],
      },
      {
        id: `quality-asset-negative-${record.id}`,
        title: `${record.targetWorkOrderId} ${record.operationCode} 负样本`,
        assetStage: '负样本',
        statusLabel: '已标记负样本',
        statusClass: 'guarded',
        summary: `${record.targetWorkOrderId} ${record.operationCode} 的 ${record.effectScore} 分低分复用尝试已作为负样本保留，用于降低跨工序、跨设备、缺陷模式不一致样本的召回权重。`,
        auditId: decisionAuditId,
        traceId: decisionTraceId,
        scoreLabel: `负样本 ${record.effectScore} 分`,
        owner: record.owner,
        nextAction: '知识检索排序需同时检查工序、设备族、缺陷模式和验证效果阈值。',
        sourceDocumentTitle: '质量知识低分复核队列',
        references: record.retrainingPlan ?? record.reviewActions,
      },
      {
        id: `quality-asset-retraining-${record.id}`,
        title: `${record.targetWorkOrderId} ${record.operationCode} 再训练候选`,
        assetStage: '再训练候选',
        statusLabel: retrainingStatusLabel,
        statusClass: retrainingStatusClass,
        summary: retrainingVersion
          ? `${retrainingVersion.trainingSetName}：${retrainingVersion.changeSummary.join('；')}`
          : retrainingSummary,
        auditId: retrainingAuditId,
        traceId: retrainingTraceId,
        scoreLabel: retrainingScoreLabel,
        owner: '知识库管理员 / 质量主管',
        nextAction: retrainingNextAction,
        sourceDocumentTitle: '质量知识低分复核队列',
        references: retrainingVersion?.validationFindings ?? retrainingVersion?.validationGates ?? record.retrainingPlan ?? record.reviewActions,
      },
    ]
  })

  const feedbackAssets = recommendationFeedbackRecords.flatMap<QualityKnowledgeAssetGovernanceRecord>((record) => {
    const nextTrainingVersion = retrainingVersions.find(item =>
      item.trainingSetVersion === record.nextTrainingSetVersion
      || item.sourceReviewQueueId === `recommendation-feedback-${record.id}`
    )
    const reopenedGrayDecision = nextTrainingVersion
      ? grayReleaseDecisions.find(decision =>
          decision.trainingSetVersion === nextTrainingVersion.trainingSetVersion
          && decision.targetWorkOrderId === nextTrainingVersion.targetWorkOrderId
          && decision.operationCode === nextTrainingVersion.operationCode
          && decision.reviewIssueStatus === 'prevalidation_reopened'
        )
      : undefined
    const nextTrainingReopenedPending = !!reopenedGrayDecision
      && nextTrainingVersion?.status === 'gray_published'
      && !isQualityKnowledgeGrayRepublishEvidence(nextTrainingVersion)
    const nextTrainingStatusClass = nextTrainingReopenedPending
      ? 'logged'
      : nextTrainingVersion
        ? ['approved', 'validation_passed', 'published', 'gray_published'].includes(nextTrainingVersion.status) ? 'accepted' : 'logged'
      : 'logged'
    const nextTrainingStatusLabel = nextTrainingReopenedPending
      ? '已重开灰度前校验'
      : nextTrainingVersion?.statusLabel ?? '下一轮候选'
    const nextTrainingAuditId = nextTrainingReopenedPending
      ? reopenedGrayDecision?.reviewIssueValidationAuditId ?? nextTrainingVersion?.validationAuditId ?? record.auditId
      : nextTrainingVersion?.status === 'gray_published'
      ? nextTrainingVersion.publishAuditId ?? nextTrainingVersion.validationAuditId ?? nextTrainingVersion.approvalAuditId
      : nextTrainingVersion?.status === 'validation_passed'
        ? nextTrainingVersion.validationAuditId ?? nextTrainingVersion.approvalAuditId
        : nextTrainingVersion?.status === 'approved'
          ? nextTrainingVersion.approvalAuditId
          : nextTrainingVersion?.approvalAuditId ?? record.auditId
    const nextTrainingTraceId = nextTrainingReopenedPending
      ? reopenedGrayDecision?.reviewIssueValidationTraceId ?? nextTrainingVersion?.validationTraceId ?? record.nextTrainingTraceId
      : nextTrainingVersion?.status === 'gray_published'
      ? nextTrainingVersion.publishTraceId ?? nextTrainingVersion.validationTraceId ?? nextTrainingVersion.approvalTraceId
      : nextTrainingVersion?.status === 'validation_passed'
        ? nextTrainingVersion.validationTraceId ?? nextTrainingVersion.approvalTraceId
        : nextTrainingVersion?.status === 'approved'
          ? nextTrainingVersion.approvalTraceId
          : nextTrainingVersion?.approvalTraceId ?? record.nextTrainingTraceId
    const nextTrainingNextAction = nextTrainingVersion
      ? nextTrainingReopenedPending
        ? '已调整 R3 灰度范围并重开灰度前校验；重新运行校验并再次灰度发布前，R2 继续承接正式推荐。'
        : nextTrainingVersion.status === 'gray_published'
        ? `${nextTrainingVersion.publishSummary} 发布范围：${nextTrainingVersion.recommendationScope?.join(' / ') ?? 'OP-20 灰度'}。`
        : nextTrainingVersion.status === 'validation_passed'
          ? `${nextTrainingVersion.validationSummary} 下一步可执行灰度发布。`
          : nextTrainingVersion.status === 'approved'
            ? `${nextTrainingVersion.trainingSetVersion} 已批准；灰度前需通过 ${nextTrainingVersion.validationGates.join(' / ')}。`
            : '已合并现场反馈，等待质量主管审批后进入灰度前校验。'
      : `等待 ${record.nextTrainingSetVersion} 合并更多现场反馈后进入审批和发布前校验。`
    const nextTrainingReferences = nextTrainingReopenedPending
      ? reopenedGrayDecision?.reviewIssueActions ?? nextTrainingVersion?.validationGates ?? record.feedbackMetrics.map(metric => `${metric.label} ${metric.value}`)
      : nextTrainingVersion?.validationFindings
        ?? nextTrainingVersion?.validationGates
        ?? record.feedbackMetrics.map(metric => `${metric.label} ${metric.value}`)

    return [
      {
        id: `quality-asset-recommendation-feedback-${record.id}`,
        title: `${record.targetWorkOrderId} ${record.operationCode} 推荐采纳反馈`,
        assetStage: '推荐采纳',
        statusLabel: record.decisionLabel,
        statusClass: record.decision === 'accepted' ? 'accepted' : 'guarded',
        summary: `${record.trainingSetVersion} 的发布推荐已形成现场反馈：${record.reason}`,
        auditId: record.auditId,
        traceId: record.traceId,
        scoreLabel: `效果 ${record.effectTrendLabel}`,
        owner: record.owner,
        nextAction: `把采纳结果、复验指标和负样本对照写入 ${record.nextTrainingSetVersion}。`,
        sourceDocumentTitle: '质量推荐采纳反馈',
        references: record.feedbackActions,
      },
      {
        id: `quality-asset-next-training-${record.id}`,
        title: `${record.nextTrainingSetVersion} 下一轮训练集候选`,
        assetStage: '下一轮训练集',
        statusLabel: nextTrainingStatusLabel,
        statusClass: nextTrainingStatusClass,
        summary: nextTrainingVersion
          ? `${nextTrainingVersion.trainingSetName}：${nextTrainingVersion.changeSummary.join('；')}`
          : `基于 ${record.trainingSetVersion} 的现场采纳反馈，效果评分从 ${record.effectScoreBefore} 分提升到 ${record.effectScoreAfter} 分，进入持续学习样本池。`,
        auditId: nextTrainingAuditId,
        traceId: nextTrainingTraceId,
        scoreLabel: nextTrainingVersion ? `${nextTrainingVersion.trainingSetVersion} / 负样本 ${nextTrainingVersion.negativeSampleCount} 条` : record.effectTrendLabel,
        owner: '知识库管理员 / 质量主管',
        nextAction: nextTrainingNextAction,
        sourceDocumentTitle: '质量推荐采纳反馈',
        references: nextTrainingReferences,
      },
    ]
  })

  const rollbackRecords = grayReleaseDecisions.filter(record => record.decision === 'rolled_back')
  const experimentRollbackAssets = rollbackRecords
    .flatMap<QualityKnowledgeAssetGovernanceRecord>((record) => {
      const falseRecallMetric = record.metricSnapshot.find(metric => metric.label.includes('误召回'))?.value ?? '待复核'
      const passRateMetric = record.metricSnapshot.find(metric => metric.label.includes('复验'))?.value ?? '待复核'
      const adoptionMetric = record.metricSnapshot.find(metric => metric.label.includes('采纳'))?.value ?? '待复核'
      return [
        {
          id: `quality-asset-experiment-negative-${record.id}`,
          title: `${record.trainingSetVersion} 实验负样本`,
          assetStage: '实验负样本',
          statusLabel: '已从主动推荐排除',
          statusClass: 'guarded',
          summary: `${record.trainingSetVersion} ${record.releaseCycleLabel} 因 ${record.reason} 被回滚，指标快照：推荐采纳率 ${adoptionMetric} / 复验通过率 ${passRateMetric} / 负样本误召回 ${falseRecallMetric}。`,
          auditId: record.auditId,
          traceId: record.traceId,
          scoreLabel: `误召回 ${falseRecallMetric}`,
          owner: record.decidedBy,
          nextAction: `主动推荐选择器排除 ${record.trainingSetVersion}，回滚目标 ${record.rollbackTargetVersion ?? 'QK-TRAIN-20260521-R2'} 保持生效。`,
          sourceDocumentTitle: '质量推荐实验池',
          references: [
            record.reason,
            ...record.metricSnapshot.map(metric => `${metric.label} ${metric.value}`),
            ...(record.reviewIssueId ? [`${record.reviewIssueId} / ${record.reviewIssueTraceId}`] : []),
          ],
        },
        {
          id: `quality-asset-experiment-threshold-${record.id}`,
          title: `${record.trainingSetVersion} 风险阈值`,
          assetStage: '风险阈值',
          statusLabel: '扩大门禁收紧',
          statusClass: 'logged',
          summary: `${record.trainingSetVersion} 回滚后，扩大灰度必须同时满足推荐采纳率 100%、复验通过率不低于 95%、负样本误召回 0 次，并保留质量主管审批。`,
          auditId: record.auditId,
          traceId: record.traceId,
          scoreLabel: `复验 ${passRateMetric} / 误召回 ${falseRecallMetric}`,
          owner: '质量主管 / 知识库管理员',
          nextAction: '后续 R6/R7 实验进入灰度前，必须补充跨线负样本并通过误召回阈值。',
          sourceDocumentTitle: '质量推荐实验池',
          references: record.actions,
        },
      ]
    })

  const experimentCandidateAssets = buildQualityKnowledgeRecommendationExperimentCandidateRecords(
    retrainingVersions,
    recommendationFeedbackRecords,
    rollbackRecords
  ).map<QualityKnowledgeAssetGovernanceRecord>(candidate => ({
    id: `quality-asset-${candidate.id}`,
    title: candidate.title,
    assetStage: '实验候选',
    statusLabel: candidate.statusLabel,
    statusClass: candidate.statusClass,
    summary: candidate.summary,
    auditId: candidate.auditId,
    traceId: candidate.traceId,
    scoreLabel: `${candidate.negativeCoverageLabel} / ${candidate.coveragePercentLabel}`,
    owner: '知识库管理员 / 质量主管',
    nextAction: candidate.nextAction,
    sourceDocumentTitle: '质量推荐实验候选',
    references: candidate.references,
    experimentCandidateType: candidate.candidateType,
  }))

  const stageOrder: Record<QualityKnowledgeAssetGovernanceRecord['assetStage'], number> = {
    样本入库: 0,
    禁用: 1,
    负样本: 2,
    再训练候选: 3,
    推荐采纳: 4,
    下一轮训练集: 5,
    实验负样本: 6,
    风险阈值: 7,
    实验候选: 8,
    复核中: 9,
  }

  return [...sampleAssets, ...reviewAssets, ...feedbackAssets, ...experimentRollbackAssets, ...experimentCandidateAssets].sort((left, right) =>
    stageOrder[left.assetStage] - stageOrder[right.assetStage]
  )
}
