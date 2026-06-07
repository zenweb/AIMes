import { upsertOtdEvidenceChainRecord } from './otd-evidence-chain-sync'
import { getLatestQualityCapaClosure, upsertQualityCapaClosure } from '../api/executionEvidence'

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
  void upsertQualityCapaClosure(closure).catch(() => undefined)
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
    const parsed = JSON.parse(raw)
    if (isQualityCapaClosure(parsed)) {
      return parsed
    }
    localStorage.removeItem(QUALITY_CAPA_SYNC_KEY)
    return null
  } catch {
    localStorage.removeItem(QUALITY_CAPA_SYNC_KEY)
    return null
  }
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value)
}

function isQualityCapaClosure(value: unknown): value is QualityCapaClosure {
  if (!value || typeof value !== 'object') return false
  const candidate = value as Partial<QualityCapaClosure>
  return isNonEmptyString(candidate.inspectionId)
    && isNonEmptyString(candidate.workOrderId)
    && isNonEmptyString(candidate.traceId)
    && isNonEmptyString(candidate.rootCause)
    && isFiniteNumber(candidate.evidenceStrength)
    && isNonEmptyString(candidate.taskTitle)
    && isNonEmptyString(candidate.taskKind)
    && isNonEmptyString(candidate.owner)
    && isNonEmptyString(candidate.dueAt)
    && isNonEmptyString(candidate.verification)
    && isNonEmptyString(candidate.verifiedAt)
    && isNonEmptyString(candidate.auditState)
    && isNonEmptyString(candidate.otdImpact)
    && isNonEmptyString(candidate.reviewAction)
}

export async function readQualityCapaClosureBackendFirst(): Promise<QualityCapaClosure | null> {
  try {
    const record = await getLatestQualityCapaClosure()
    return record ?? readQualityCapaClosure()
  } catch {
    return readQualityCapaClosure()
  }
}
