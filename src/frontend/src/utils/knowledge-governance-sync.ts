import { upsertOtdEvidenceChainRecord } from './otd-evidence-chain-sync'

const STORAGE_KEY = 'aimes_knowledge_governance_reviews'

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
    return Array.isArray(parsed) ? parsed.filter(isKnowledgeGovernanceReviewRecord) : []
  } catch {
    window.localStorage.removeItem(STORAGE_KEY)
    return []
  }
}

export function readKnowledgeGovernanceReview(documentId: string) {
  return readKnowledgeGovernanceReviews().find(record => record.documentId === documentId) ?? null
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
