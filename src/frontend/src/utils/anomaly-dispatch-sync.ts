import { upsertOtdEvidenceChainRecord } from './otd-evidence-chain-sync'

const ANOMALY_DISPATCH_KEY = 'aimes_anomaly_dispatch_records'

export type AnomalyDispatchType = 'equipment' | 'quality' | 'material'

export interface AnomalyDispatchRecord {
  id: string
  anomalyId: string
  type: AnomalyDispatchType
  typeLabel: string
  title: string
  workOrderNumber: string
  operationCode: string
  route: string
  owner: string
  dueAt: string
  affectedOrders: string
  deliveryImpact: string
  scheduleWindow: string
  suggestedAction: string
  auditId: string
  traceId: string
  status: 'routed'
  statusLabel: string
  createdAt: string
  summary: string
}

function canUseStorage() {
  return typeof window !== 'undefined' && !!window.localStorage
}

function isRecord(item: Partial<AnomalyDispatchRecord> | null | undefined): item is AnomalyDispatchRecord {
  return !!item
    && typeof item.id === 'string'
    && typeof item.anomalyId === 'string'
    && typeof item.type === 'string'
    && typeof item.title === 'string'
    && typeof item.traceId === 'string'
}

function readRawRecords(): AnomalyDispatchRecord[] {
  if (!canUseStorage()) return []
  try {
    const raw = window.localStorage.getItem(ANOMALY_DISPATCH_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed.filter(isRecord) : []
  } catch {
    window.localStorage.removeItem(ANOMALY_DISPATCH_KEY)
    return []
  }
}

export function readAnomalyDispatchRecords(): AnomalyDispatchRecord[] {
  return readRawRecords()
}

export function readAnomalyDispatchRecordByType(type: AnomalyDispatchType): AnomalyDispatchRecord | null {
  return readRawRecords().find(record => record.type === type) ?? null
}

export function writeAnomalyDispatchRecord(input: Omit<AnomalyDispatchRecord, 'id' | 'status' | 'createdAt'> & Partial<Pick<AnomalyDispatchRecord, 'id' | 'createdAt'>>) {
  if (!canUseStorage()) return null
  const createdAt = input.createdAt ?? new Date().toISOString()
  const record: AnomalyDispatchRecord = {
    ...input,
    id: input.id ?? `anomaly-dispatch-${input.anomalyId}`,
    status: 'routed',
    createdAt,
  }
  const next = [record, ...readRawRecords().filter(item => item.id !== record.id)].slice(0, 12)
  window.localStorage.setItem(ANOMALY_DISPATCH_KEY, JSON.stringify(next))
  upsertOtdEvidenceChainRecord({
    id: record.id,
    stage: '异常分流',
    title: record.title,
    summary: `${record.summary} 建议动作：${record.suggestedAction}`,
    object: record.affectedOrders,
    source: `异常管理 / ${record.owner}`,
    traceId: record.traceId,
    status: 'active',
    statusLabel: record.statusLabel,
    createdAt,
  })
  return record
}
