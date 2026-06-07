import { upsertOtdEvidenceChainRecord } from './otd-evidence-chain-sync'
import { queryKnowledgeGovernanceReviews, upsertKnowledgeGovernanceReview } from '../api/knowledgeGovernanceEvidence'

const STORAGE_KEY = 'aimes_knowledge_governance_reviews'

export type KnowledgeIndexStatus = 'indexed' | 'pending' | 'failed'
export type KnowledgeFreshnessStatus = '有效' | '即将过期' | '已过期'

export interface KnowledgeGovernanceSourceDocument {
  id: string
  title: string
  category: string
  version: string
  summary: string
  indexStatus: KnowledgeIndexStatus
  validUntil: string
  freshnessStatus: KnowledgeFreshnessStatus
  references: string[]
  owner: string
  recommendedAction: string
  auditHint: string
}

export interface KnowledgeGovernanceReviewRecord {
  id: string
  documentId: string
  documentTitle: string
  version: string
  reviewedVersion: string
  validUntil: string
  reviewer: string
  reviewedAt: string
  auditId: string
  traceId: string
  action: string
  status: 'approved'
  summary: string
  references: string[]
}

function canUseStorage() {
  return typeof window !== 'undefined' && !!window.localStorage
}

function isKnowledgeGovernanceReviewRecord(
  item: Partial<KnowledgeGovernanceReviewRecord> | null | undefined
): item is KnowledgeGovernanceReviewRecord {
  return !!item
    && typeof item.id === 'string'
    && typeof item.documentId === 'string'
    && typeof item.documentTitle === 'string'
    && typeof item.version === 'string'
    && typeof item.reviewedVersion === 'string'
    && typeof item.validUntil === 'string'
    && typeof item.reviewer === 'string'
    && typeof item.reviewedAt === 'string'
    && typeof item.auditId === 'string'
    && typeof item.traceId === 'string'
    && typeof item.action === 'string'
    && item.status === 'approved'
    && typeof item.summary === 'string'
    && Array.isArray(item.references)
}

export function readKnowledgeGovernanceReviews(): KnowledgeGovernanceReviewRecord[] {
  if (!canUseStorage()) return []
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) {
      window.localStorage.removeItem(STORAGE_KEY)
      return []
    }
    const records = parsed.filter(isKnowledgeGovernanceReviewRecord)
    if (records.length !== parsed.length) {
      if (records.length === 0) {
        window.localStorage.removeItem(STORAGE_KEY)
      } else {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(records))
      }
    }
    return records
  } catch {
    window.localStorage.removeItem(STORAGE_KEY)
    return []
  }
}

export async function readKnowledgeGovernanceReviewsBackendFirst(): Promise<KnowledgeGovernanceReviewRecord[]> {
  try {
    const records = await queryKnowledgeGovernanceReviews()
    return records.length > 0 ? records : readKnowledgeGovernanceReviews()
  } catch (error: unknown) {
    const localRecords = readKnowledgeGovernanceReviews()
    if (localRecords.length > 0) return localRecords
    throw error
  }
}

export function readKnowledgeGovernanceReview(documentId: string) {
  return readKnowledgeGovernanceReviews().find(record => record.documentId === documentId) ?? null
}

export function createDefaultKnowledgeGovernanceDocuments(): KnowledgeGovernanceSourceDocument[] {
  return [
    {
      id: 'kg-sop-cnc',
      title: 'CNC 精加工 SOP',
      category: '工艺文档',
      version: 'V2.3',
      summary: '用于 OP-020 CNC 精加工参数、首件确认和刀具寿命预警。',
      indexStatus: 'indexed',
      validUntil: '2026-12-31',
      freshnessStatus: '有效',
      references: ['AI 生产助手', '工艺路线', '生产报工'],
      owner: '工艺工程师 / 知识库管理员',
      recommendedAction: '保持当前已索引状态，下一轮版本变更后再复核引用范围。',
      auditHint: 'AUD-KG-SOP-CNC-20260520',
    },
    {
      id: 'kg-quality-torque',
      title: '装配扭矩检验规范',
      category: '质量文档',
      version: 'V1.8',
      summary: '定义 OP-040 扭矩 32-36 N.m 的检验窗口和复验规则。',
      indexStatus: 'indexed',
      validUntil: '2026-06-05',
      freshnessStatus: '即将过期',
      references: ['质量闭环', 'AI 生产助手'],
      owner: '质量主管 / 知识库管理员',
      recommendedAction: '在到期前复核检验窗口和复验规则，避免 AI 助手正式报告继续引用临期规范。',
      auditHint: 'AUD-KG-TORQUE-REVIEW-20260520',
    },
    {
      id: 'kg-equipment-cnc-maint',
      title: 'CNC-01 主轴维护手册',
      category: '设备文档',
      version: 'V1.1',
      summary: '用于设备健康下降、主轴振动和预防维护窗口推荐。',
      indexStatus: 'pending',
      validUntil: '2026-05-10',
      freshnessStatus: '已过期',
      references: ['设备维护', '风险预警', 'AI 排产'],
      owner: '设备主管 / 知识库管理员',
      recommendedAction: '复核有效期并重建 RAG 索引，完成前只能作为停机风险提示，不能生成正式维护结论。',
      auditHint: 'AUD-KG-REINDEX-20260520-001',
    },
  ]
}

export function applyKnowledgeGovernanceReviewToDocument<T extends KnowledgeGovernanceSourceDocument>(
  document: T
): T {
  const review = readKnowledgeGovernanceReview(document.id)
  if (!review) return document
  return {
    ...document,
    version: review.reviewedVersion,
    summary: review.summary,
    indexStatus: 'indexed',
    validUntil: review.validUntil,
    freshnessStatus: '有效',
    references: review.references,
    owner: review.reviewer,
    recommendedAction: '已复核并重建索引，可作为 AI 助手、排产和风险复核的正式引用来源。',
    auditHint: review.auditId,
  }
}

export function readKnowledgeGovernanceDocuments() {
  return createDefaultKnowledgeGovernanceDocuments().map(applyKnowledgeGovernanceReviewToDocument)
}

export function isKnowledgeGovernancePendingDocument(document: KnowledgeGovernanceSourceDocument) {
  return document.indexStatus !== 'indexed' || document.freshnessStatus !== '有效'
}

export function readKnowledgeGovernancePendingDocuments() {
  return readKnowledgeGovernanceDocuments().filter(isKnowledgeGovernancePendingDocument)
}

export function createDefaultKnowledgeGovernanceReview(
  reviewedAt = new Date().toISOString(),
  overrides: Partial<KnowledgeGovernanceReviewRecord> = {}
): KnowledgeGovernanceReviewRecord {
  const baseRecord: KnowledgeGovernanceReviewRecord = {
    id: 'knowledge-governance-review-kg-equipment-cnc-maint',
    documentId: 'kg-equipment-cnc-maint',
    documentTitle: 'CNC-01 主轴维护手册',
    version: 'V1.1',
    reviewedVersion: 'V1.2',
    validUntil: '2026-12-31',
    reviewer: '设备主管 / 知识库管理员',
    reviewedAt,
    auditId: 'AUD-KG-REINDEX-20260520-001',
    traceId: 'TRACE-KG-CNC-MAINT-REINDEX',
    action: '复核有效期并重建 RAG 索引',
    status: 'approved',
    summary: 'CNC-01 主轴维护手册已由设备主管复核，升级为 V1.2 并完成分块索引，可作为设备停机影响问答的正式引用来源。',
    references: ['AI 生产助手', '设备维护', '风险预警', 'AI 排产'],
  }
  return { ...baseRecord, ...overrides }
}

export function writeKnowledgeGovernanceReview(record = createDefaultKnowledgeGovernanceReview()) {
  if (!canUseStorage()) return record
  const next = [
    record,
    ...readKnowledgeGovernanceReviews().filter(item => item.id !== record.id),
  ].slice(0, 12)
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  void upsertKnowledgeGovernanceReview(record).catch(() => undefined)
  upsertOtdEvidenceChainRecord({
    id: `knowledge-governance-${record.documentId}`,
    stage: '知识治理',
    title: `${record.documentTitle} 已复核并重建索引`,
    summary: `${record.auditId} 已完成：${record.reviewer} 将 ${record.documentTitle} ${record.version} 复核升级为 ${record.reviewedVersion}，有效期延至 ${record.validUntil}，引用范围为 ${record.references.join(' / ')}。`,
    object: record.documentId,
    source: '文档上传 / RAG 数据治理',
    traceId: record.traceId,
    status: 'closed',
    statusLabel: '已复核',
    createdAt: record.reviewedAt,
  })
  return record
}
