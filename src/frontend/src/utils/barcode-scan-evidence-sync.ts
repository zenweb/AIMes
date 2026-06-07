import { upsertOtdEvidenceChainRecord } from './otd-evidence-chain-sync'
import { queryBarcodeScanEvidence, upsertBarcodeScanEvidence } from '../api/executionEvidence'

const STORAGE_KEY = 'aimes_barcode_scan_evidence'

export type BarcodeScanEvidenceType = 'WorkOrder' | 'Equipment' | 'Material'

export interface BarcodeScanEvidenceRecord {
  id: string
  code: string
  type: BarcodeScanEvidenceType
  title: string
  action: string
  actor: string
  object: string
  source: string
  summary: string
  traceId: string
  statusLabel: string
  createdAt: string
  nextCheck: string
}

export interface BarcodeScanEvidenceInput {
  code: string
  type: string
  name: string
  actor: string
  scannedAt?: string
}

function canUseStorage() {
  return typeof window !== 'undefined' && !!window.localStorage
}

function normalizedTracePart(code: string) {
  return code.trim().toUpperCase().replace(/[^A-Z0-9]+/g, '-').replace(/^-|-$/g, '')
}

function isEvidenceRecord(item: Partial<BarcodeScanEvidenceRecord> | null | undefined): item is BarcodeScanEvidenceRecord {
  return !!item
    && typeof item.id === 'string'
    && typeof item.code === 'string'
    && ['WorkOrder', 'Equipment', 'Material'].includes(String(item.type))
    && typeof item.title === 'string'
    && typeof item.action === 'string'
    && typeof item.actor === 'string'
    && typeof item.object === 'string'
    && typeof item.source === 'string'
    && typeof item.summary === 'string'
    && typeof item.traceId === 'string'
    && typeof item.statusLabel === 'string'
    && typeof item.createdAt === 'string'
    && typeof item.nextCheck === 'string'
}

function readRawRecords(): BarcodeScanEvidenceRecord[] {
  if (!canUseStorage()) return []
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    const records = parsed.filter(isEvidenceRecord)
    if (records.length !== parsed.length) {
      if (records.length) {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(records))
      } else {
        window.localStorage.removeItem(STORAGE_KEY)
      }
    }
    return records
  } catch {
    window.localStorage.removeItem(STORAGE_KEY)
    return []
  }
}

export function readBarcodeScanEvidenceRecords(): BarcodeScanEvidenceRecord[] {
  return readRawRecords()
}

export async function readBarcodeScanEvidenceRecordsBackendFirst(): Promise<BarcodeScanEvidenceRecord[]> {
  const records = await queryBarcodeScanEvidence()
  return records.length > 0 ? records : readBarcodeScanEvidenceRecords()
}

export function createBarcodeScanEvidenceRecord(input: BarcodeScanEvidenceInput): BarcodeScanEvidenceRecord {
  const code = input.code.trim().toUpperCase()
  const tracePart = normalizedTracePart(code)
  const createdAt = input.scannedAt ?? new Date().toISOString()

  if (input.type === 'WorkOrder') {
    return {
      id: `barcode-scan-workorder-${tracePart}`,
      code,
      type: 'WorkOrder',
      title: `${code} 工单扫码到站已确认`,
      action: '工单到站报工入口确认',
      actor: input.actor,
      object: code,
      source: '条码扫描 / 现场工位',
      summary: `现场扫描 ${code} 流转卡并确认 ${input.name} 已到达报工入口，后续进入生产报工和排产影响复核。`,
      traceId: `TRACE-QR-${tracePart}-ARRIVAL`,
      statusLabel: '到站已确认',
      createdAt,
      nextCheck: '生产报工开工校验',
    }
  }

  if (input.type === 'Equipment') {
    return {
      id: `barcode-scan-equipment-${tracePart}`,
      code,
      type: 'Equipment',
      title: `${code} 设备扫码点检入口已确认`,
      action: '设备现场点检入口确认',
      actor: input.actor,
      object: code,
      source: '条码扫描 / 设备看板',
      summary: `现场扫描 ${code} 设备牌并确认 ${input.name} 点检入口可用，后续进入设备维护和实时监控核对。`,
      traceId: `TRACE-QR-${tracePart}-CHECK`,
      statusLabel: '点检已确认',
      createdAt,
      nextCheck: '设备维护状态复核',
    }
  }

  return {
    id: `barcode-scan-material-${tracePart}`,
    code,
    type: 'Material',
    title: `${code} 物料批次扫码复核已确认`,
    action: '物料现场批次复核',
    actor: input.actor,
    object: code,
    source: '条码扫描 / 物料容器',
    summary: `现场扫描 ${code} 物料标签并确认 ${input.name} 已进入库存齐套与 BOM 用量追溯，缺料状态可回到采购和排产复核。`,
    traceId: `TRACE-QR-${tracePart}-KIT`,
    statusLabel: '批次已复核',
    createdAt,
    nextCheck: '库存齐套与 BOM 用量核对',
  }
}

export function writeBarcodeScanEvidenceRecord(record: BarcodeScanEvidenceRecord) {
  if (!canUseStorage()) return record
  const next = [record, ...readRawRecords().filter(item => item.id !== record.id)].slice(0, 20)
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  void upsertBarcodeScanEvidence(record).catch(() => undefined)
  upsertOtdEvidenceChainRecord({
    id: `barcode-${record.id}`,
    stage: '扫码执行',
    title: record.title,
    summary: `${record.summary} 下一核对点：${record.nextCheck}。`,
    object: record.object,
    source: `${record.source} / ${record.actor}`,
    traceId: record.traceId,
    status: 'closed',
    statusLabel: record.statusLabel,
    createdAt: record.createdAt,
  })
  return record
}
