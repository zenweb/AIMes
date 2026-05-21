import { upsertOtdEvidenceChainRecord } from './otd-evidence-chain-sync'

const QUALITY_MRB_DISPOSITION_KEY = 'aimes_quality_mrb_disposition'

export type QualityMrbDispositionStatus = 'active' | 'closed'
export type QualityMrbDispositionType = 'scrap_rebuild' | 'rework' | 'concession'

export interface QualityMrbDispositionAction {
  module: string
  owner: string
  action: string
  dueAt: string
  evidence: string
  result?: string
}

export interface QualityMrbDispositionRecord {
  id: string
  title: string
  inspectionId: string
  workOrderId: string
  productCode: string
  processName: string
  equipmentCode: string
  materialBatchCode: string
  batchCode: string
  inspectionPoint: string
  defectPattern: string
  defectQuantity: number
  disposition: QualityMrbDispositionType
  dispositionLabel: string
  status: QualityMrbDispositionStatus
  statusLabel: string
  owner: string
  dueAt: string
  otdImpact: string
  scheduleImpact: string
  recommendedAction: string
  auditId: string
  traceId: string
  scheduleTraceId: string
  createdAt: string
  actions: QualityMrbDispositionAction[]
  closureAuditId?: string
  closureTraceId?: string
  closureSummary?: string
  closedAt?: string
  closedBy?: string
}

function canUseStorage() {
  return typeof window !== 'undefined' && !!window.localStorage
}

export function buildQualityMrbDispositionRecord(createdAt = new Date().toISOString()): QualityMrbDispositionRecord {
  return {
    id: 'quality-mrb-disposition-20260521',
    title: 'WO-004 装配间隙超差 MRB 处置决策',
    inspectionId: 'INS-004',
    workOrderId: 'WO-004',
    productCode: 'PRD-001',
    processName: '装配',
    equipmentCode: 'ASM-01',
    materialBatchCode: 'MAT-STEEL-A12',
    batchCode: 'WO-004-ASM',
    inspectionPoint: '功能测试',
    defectPattern: '装配间隙超差 / 功能测试不合格',
    defectQuantity: 4,
    disposition: 'scrap_rebuild',
    dispositionLabel: '报废补料重建',
    status: 'active',
    statusLabel: 'MRB 已判定报废补料',
    owner: '质量经理 / 生产经理 / 采购主管',
    dueAt: '今日 15:00',
    otdImpact: 'WO-004 延期 +2 单风险，需补料与重排',
    scheduleImpact: '冻结 WO-004 原装配窗口，插入 MAT-STEEL-A12 补料 ETA、返工替代工单和终检复验窗口。',
    recommendedAction: '建议先隔离 4 件不合格品并判废，采购补齐 MAT-STEEL-A12，排产重建 WO-004 装配与复检窗口，同时把客户交付说明纳入 OTD 复盘。',
    auditId: 'AUD-QA-MRB-DISPOSITION-20260521',
    traceId: 'TRACE-QA-WO-004-MRB-DISPOSITION-20260521',
    scheduleTraceId: 'TRACE-QA-WO-004-MRB-SCHEDULE-IMPACT-20260521',
    createdAt,
    actions: [
      {
        module: '质量',
        owner: '质量经理',
        action: '隔离 4 件装配间隙超差品并完成 MRB 判废',
        dueAt: '今日 11:30',
        evidence: 'Q-HOLD-ASM-WO-004',
      },
      {
        module: '采购',
        owner: '采购主管',
        action: '补料 MAT-STEEL-A12 4 件并确认 ETA',
        dueAt: '今日 13:30',
        evidence: 'PO-MRB-WO-004-MAT-STEEL-A12',
      },
      {
        module: '排产',
        owner: '生产经理',
        action: '冻结原装配窗口并重排补料后装配/复检',
        dueAt: '今日 15:00',
        evidence: 'SCHED-MRB-WO-004-REBUILD',
      },
      {
        module: '客户',
        owner: '客服主管',
        action: '准备 WO-004 延期 +2 单风险说明和恢复承诺',
        dueAt: '今日 16:00',
        evidence: 'CS-MRB-WO-004-OTD-NOTE',
      },
    ],
  }
}

function upsertQualityMrbOtdEvidence(record: QualityMrbDispositionRecord) {
  upsertOtdEvidenceChainRecord({
    id: 'quality-mrb-disposition',
    stage: '质量MRB处置',
    title: record.title,
    summary: record.status === 'closed'
      ? record.closureSummary ?? `${record.workOrderId} MRB 报废补料动作已闭环，排产可按补料后窗口复核。`
      : `${record.dispositionLabel}：${record.scheduleImpact}`,
    object: `${record.workOrderId} / ${record.inspectionId}`,
    source: `质量 MRB / ${record.owner}`,
    traceId: record.status === 'closed' ? record.closureTraceId ?? record.traceId : record.traceId,
    status: record.status,
    statusLabel: record.status === 'closed' ? 'MRB 处置已闭环' : record.statusLabel,
    createdAt: record.closedAt ?? record.createdAt,
  })
}

export function writeQualityMrbDispositionRecord(record: QualityMrbDispositionRecord) {
  if (!canUseStorage()) return record
  window.localStorage.setItem(QUALITY_MRB_DISPOSITION_KEY, JSON.stringify(record))
  upsertQualityMrbOtdEvidence(record)
  return record
}

export function readQualityMrbDispositionRecord(): QualityMrbDispositionRecord | null {
  if (!canUseStorage()) return null
  const raw = window.localStorage.getItem(QUALITY_MRB_DISPOSITION_KEY)
  if (!raw) return null

  try {
    return JSON.parse(raw) as QualityMrbDispositionRecord
  } catch {
    window.localStorage.removeItem(QUALITY_MRB_DISPOSITION_KEY)
    return null
  }
}

export function closeQualityMrbDispositionRecord(actor = '生产经理', closedAt = new Date().toISOString()) {
  const current = readQualityMrbDispositionRecord()
  if (!current) return null

  const closed: QualityMrbDispositionRecord = {
    ...current,
    status: 'closed',
    statusLabel: 'MRB 处置已闭环',
    closedAt,
    closedBy: actor,
    closureAuditId: 'AUD-QA-MRB-CLOSURE-20260521',
    closureTraceId: 'TRACE-QA-WO-004-MRB-CLOSURE-20260521',
    closureSummary: '质量隔离、补料 ETA、排产重建和客户说明均已确认，WO-004 转入补料后装配/复检窗口。',
    actions: current.actions.map(action => ({
      ...action,
      result: action.module === '质量'
        ? '4 件已隔离判废'
        : action.module === '采购'
          ? '补料 ETA 已确认'
          : action.module === '排产'
            ? '原装配窗口已冻结并重建'
            : '客户说明已准备',
    })),
  }

  return writeQualityMrbDispositionRecord(closed)
}
