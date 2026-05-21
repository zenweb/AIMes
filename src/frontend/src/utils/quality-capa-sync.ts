import { upsertOtdEvidenceChainRecord } from './otd-evidence-chain-sync'

const QUALITY_CAPA_SYNC_KEY = 'aimes_quality_capa_closure'

export interface QualityCapaClosure {
  inspectionId: string
  workOrderId: string
  traceId: string
  rootCause: string
  evidenceStrength: number
  taskTitle: string
  taskKind: string
  owner: string
  dueAt: string
  verification: string
  verifiedAt: string
  auditState: string
  otdImpact: string
  reviewAction: string
}

export function writeQualityCapaClosure(closure: QualityCapaClosure) {
  if (typeof localStorage === 'undefined') return
  localStorage.setItem(QUALITY_CAPA_SYNC_KEY, JSON.stringify(closure))
  upsertOtdEvidenceChainRecord({
    id: 'quality-capa',
    stage: '质量回写',
    title: closure.taskTitle,
    summary: closure.reviewAction,
    object: closure.workOrderId,
    source: `质量闭环 / ${closure.owner}`,
    traceId: closure.traceId,
    status: 'closed',
    statusLabel: '已验证',
    createdAt: closure.verifiedAt,
  })
}

export function readQualityCapaClosure(): QualityCapaClosure | null {
  if (typeof localStorage === 'undefined') return null
  const raw = localStorage.getItem(QUALITY_CAPA_SYNC_KEY)
  if (!raw) return null

  try {
    return JSON.parse(raw) as QualityCapaClosure
  } catch {
    localStorage.removeItem(QUALITY_CAPA_SYNC_KEY)
    return null
  }
}
