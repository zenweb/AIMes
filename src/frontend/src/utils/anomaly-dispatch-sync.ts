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
    && (item.type === 'equipment' || item.type === 'quality' || item.type === 'material')
    && typeof item.typeLabel === 'string'
    && typeof item.title === 'string'
    && typeof item.workOrderNumber === 'string'
    && typeof item.operationCode === 'string'
    && typeof item.route === 'string'
    && typeof item.owner === 'string'
    && typeof item.dueAt === 'string'
    && typeof item.affectedOrders === 'string'
    && typeof item.deliveryImpact === 'string'
    && typeof item.scheduleWindow === 'string'
    && typeof item.suggestedAction === 'string'
    && typeof item.auditId === 'string'
    && typeof item.traceId === 'string'
    && item.status === 'routed'
    && typeof item.statusLabel === 'string'
    && typeof item.createdAt === 'string'
    && typeof item.summary === 'string'
}

function readRawRecords(): AnomalyDispatchRecord[] {
  if (!canUseStorage()) return []
  try {
    const raw = window.localStorage.getItem(ANOMALY_DISPATCH_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    const records = parsed.filter(isRecord)
    if (records.length !== parsed.length) {
      if (records.length) {
        window.localStorage.setItem(ANOMALY_DISPATCH_KEY, JSON.stringify(records))
      } else {
        window.localStorage.removeItem(ANOMALY_DISPATCH_KEY)
      }
    }
    return records
  } catch {
    window.localStorage.removeItem(ANOMALY_DISPATCH_KEY)
    return []
  }
}

export function readAnomalyDispatchRecords(): AnomalyDispatchRecord[] {
  return readRawRecords()
}

function mergeAnomalyDispatchRecords(
  remoteRecords: AnomalyDispatchRecord[],
  localRecords: AnomalyDispatchRecord[],
): AnomalyDispatchRecord[] {
  const merged = [...remoteRecords, ...localRecords].reduce<AnomalyDispatchRecord[]>((acc, record) => {
    if (acc.some(item => item.id === record.id)) return acc
    acc.push(record)
    return acc
  }, [])
  return merged
    .sort((left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime())
    .slice(0, 12)
}

export async function readAnomalyDispatchRecordsBackendFirst(options?: { failLoud?: boolean }): Promise<AnomalyDispatchRecord[]> {
  try {
    const { queryAnomalyDispatchRecords } = await import('../api/riskEvidence')
    const records = await queryAnomalyDispatchRecords(12, options)
    if (!Array.isArray(records)) {
      throw new Error('后端返回非数组异常分流审计载荷')
    }
    return mergeAnomalyDispatchRecords(records.filter(isRecord), readAnomalyDispatchRecords())
  } catch (error: unknown) {
    if (options?.failLoud) throw error
    return readAnomalyDispatchRecords()
  }
}

export function readAnomalyDispatchRecordByType(type: AnomalyDispatchType): AnomalyDispatchRecord | null {
  return readRawRecords().find(record => record.type === type) ?? null
}

export async function readAnomalyDispatchRecordByTypeBackendFirst(type: AnomalyDispatchType): Promise<AnomalyDispatchRecord | null> {
  const records = await readAnomalyDispatchRecordsBackendFirst()
  return records.find(record => record.type === type) ?? null
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
  void import('../api/riskEvidence')
    .then(({ upsertAnomalyDispatchRecord }) => upsertAnomalyDispatchRecord(record))
    .catch(() => undefined)
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
