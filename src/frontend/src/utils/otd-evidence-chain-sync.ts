const OTD_EVIDENCE_CHAIN_KEY = 'aimes_otd_evidence_chain'

export type OtdEvidenceStatus = 'ready' | 'active' | 'closed'

export interface OtdEvidenceChainItem {
  id: string
  stage: string
  title: string
  summary: string
  object: string
  source: string
  traceId: string
  sourceTraceId?: string
  status: OtdEvidenceStatus
  statusLabel: string
  createdAt: string
}

function canUseStorage() {
  return typeof window !== 'undefined' && !!window.localStorage
}

function isEvidenceItem(item: Partial<OtdEvidenceChainItem> | null | undefined): item is OtdEvidenceChainItem {
  return !!item
    && typeof item.id === 'string'
    && typeof item.stage === 'string'
    && typeof item.title === 'string'
    && typeof item.summary === 'string'
    && typeof item.object === 'string'
    && typeof item.source === 'string'
    && typeof item.traceId === 'string'
    && (typeof item.sourceTraceId === 'string' || typeof item.sourceTraceId === 'undefined')
    && ['ready', 'active', 'closed'].includes(String(item.status))
    && typeof item.statusLabel === 'string'
    && typeof item.createdAt === 'string'
}

function readRawEvidenceChain(): OtdEvidenceChainItem[] {
  if (!canUseStorage()) return []
  try {
    const raw = window.localStorage.getItem(OTD_EVIDENCE_CHAIN_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed.filter(isEvidenceItem) : []
  } catch {
    window.localStorage.removeItem(OTD_EVIDENCE_CHAIN_KEY)
    return []
  }
}

export function readOtdEvidenceChainRecords(): OtdEvidenceChainItem[] {
  return readRawEvidenceChain()
}

export function upsertOtdEvidenceChainRecord(record: OtdEvidenceChainItem) {
  if (!canUseStorage()) return []
  const next = [record, ...readRawEvidenceChain().filter(item => item.id !== record.id)].slice(0, 24)
  window.localStorage.setItem(OTD_EVIDENCE_CHAIN_KEY, JSON.stringify(next))
  return next
}
