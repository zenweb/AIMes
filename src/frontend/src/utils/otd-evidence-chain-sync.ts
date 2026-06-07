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
    if (!Array.isArray(parsed)) {
      window.localStorage.removeItem(OTD_EVIDENCE_CHAIN_KEY)
      return []
    }
    const records = parsed.filter(isEvidenceItem)
    if (records.length !== parsed.length) {
      if (records.length) {
        window.localStorage.setItem(OTD_EVIDENCE_CHAIN_KEY, JSON.stringify(records))
      } else {
        window.localStorage.removeItem(OTD_EVIDENCE_CHAIN_KEY)
      }
    }
    return records
  } catch {
    window.localStorage.removeItem(OTD_EVIDENCE_CHAIN_KEY)
    return []
  }
}

export function readOtdEvidenceChainRecords(): OtdEvidenceChainItem[] {
  return readRawEvidenceChain()
}

export async function readOtdEvidenceChainRecordsBackendFirst(): Promise<OtdEvidenceChainItem[]> {
  try {
    const { getOtdEvidenceChain } = await import('../api/otdEvidence')
    const records = await getOtdEvidenceChain()
    if (!Array.isArray(records)) return readRawEvidenceChain()
    const validRecords = records.filter(isEvidenceItem)
    return validRecords.length > 0 ? validRecords : readRawEvidenceChain()
  } catch {
    return readRawEvidenceChain()
  }
}

export function upsertOtdEvidenceChainRecord(record: OtdEvidenceChainItem) {
  if (!canUseStorage()) return []
  const next = [record, ...readRawEvidenceChain().filter(item => item.id !== record.id)].slice(0, 24)
  window.localStorage.setItem(OTD_EVIDENCE_CHAIN_KEY, JSON.stringify(next))
  void import('../api/otdEvidence')
    .then(({ upsertOtdEvidence }) => upsertOtdEvidence(record))
    .catch(() => undefined)
  return next
}

export function closeOtdEvidenceChainRecords(
  matcher: (record: OtdEvidenceChainItem) => boolean,
  closure: {
    statusLabel: string
    summary?: (record: OtdEvidenceChainItem) => string
    sourceTraceId?: string
  }
) {
  if (!canUseStorage()) return []
  let changed = false
  const next = readRawEvidenceChain().map(record => {
    if (!matcher(record)) return record
    changed = true
    return {
      ...record,
      summary: closure.summary ? closure.summary(record) : record.summary,
      sourceTraceId: closure.sourceTraceId ?? record.sourceTraceId,
      status: 'closed' as const,
      statusLabel: closure.statusLabel,
    }
  })
  if (changed) window.localStorage.setItem(OTD_EVIDENCE_CHAIN_KEY, JSON.stringify(next))
  return next
}
