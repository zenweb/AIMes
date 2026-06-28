import { upsertOtdEvidenceChainRecord } from './otd-evidence-chain-sync'
import type { PocRolloutPackageRecord } from './poc-rollout-package-sync'
import { getLatestPocPilotRun, upsertPocPilotRun } from '../api/pocEvidence'

const STORAGE_KEY = 'aimes_poc_pilot_run'

export interface PocPilotRunWorkOrder {
  workOrderNumber: string
  productName: string
  quantity: number
  route: string
  scheduleDecision: string
  executionStatus: string
}

export interface PocPilotRunCheckpoint {
  module: string
  owner: string
  status: 'closed'
  evidence: string
  summary: string
}

export interface PocPilotRunRecord {
  id: string
  title: string
  targetCustomer: string
  sourcePackageId: string
  sourceAuditId: string
  status: 'closed'
  statusLabel: string
  runWindow: string
  batchId: string
  sampleSize: number
  otdTarget: string
  actualOtd: string
  owner: string
  workOrders: PocPilotRunWorkOrder[]
  checkpoints: PocPilotRunCheckpoint[]
  acceptanceCriteria: string[]
  auditId: string
  traceId: string
  createdAt: string
  summary: string
}

function canUseStorage() {
  return typeof window !== 'undefined' && !!window.localStorage
}

function isPocPilotRunWorkOrder(
  workOrder: Partial<PocPilotRunWorkOrder> | null | undefined
): workOrder is PocPilotRunWorkOrder {
  return !!workOrder
    && typeof workOrder.workOrderNumber === 'string'
    && typeof workOrder.productName === 'string'
    && typeof workOrder.quantity === 'number'
    && typeof workOrder.route === 'string'
    && typeof workOrder.scheduleDecision === 'string'
    && typeof workOrder.executionStatus === 'string'
}

function isPocPilotRunCheckpoint(
  checkpoint: Partial<PocPilotRunCheckpoint> | null | undefined
): checkpoint is PocPilotRunCheckpoint {
  return !!checkpoint
    && typeof checkpoint.module === 'string'
    && typeof checkpoint.owner === 'string'
    && checkpoint.status === 'closed'
    && typeof checkpoint.evidence === 'string'
    && typeof checkpoint.summary === 'string'
}

function isPocPilotRunRecord(record: Partial<PocPilotRunRecord> | null | undefined): record is PocPilotRunRecord {
  return !!record
    && typeof record.id === 'string'
    && typeof record.title === 'string'
    && typeof record.targetCustomer === 'string'
    && typeof record.sourcePackageId === 'string'
    && typeof record.sourceAuditId === 'string'
    && record.status === 'closed'
    && typeof record.statusLabel === 'string'
    && typeof record.runWindow === 'string'
    && typeof record.batchId === 'string'
    && typeof record.sampleSize === 'number'
    && typeof record.otdTarget === 'string'
    && typeof record.actualOtd === 'string'
    && typeof record.owner === 'string'
    && Array.isArray(record.workOrders)
    && record.workOrders.every(isPocPilotRunWorkOrder)
    && Array.isArray(record.checkpoints)
    && record.checkpoints.every(isPocPilotRunCheckpoint)
    && Array.isArray(record.acceptanceCriteria)
    && typeof record.auditId === 'string'
    && typeof record.traceId === 'string'
    && typeof record.createdAt === 'string'
    && typeof record.summary === 'string'
}

export function readPocPilotRunRecord(): PocPilotRunRecord | null {
  if (!canUseStorage()) return null
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (isPocPilotRunRecord(parsed)) return parsed
    window.localStorage.removeItem(STORAGE_KEY)
    return null
  } catch {
    window.localStorage.removeItem(STORAGE_KEY)
    return null
  }
}

export async function readPocPilotRunRecordBackendFirst(): Promise<PocPilotRunRecord | null> {
  const record = await getLatestPocPilotRun()
  return isPocPilotRunRecord(record) ? record : readPocPilotRunRecord()
}

export function writePocPilotRunRecord(rollout: PocRolloutPackageRecord) {
  if (!canUseStorage()) return null
  const now = new Date().toISOString()
  const record: PocPilotRunRecord = {
    id: 'poc-pilot-run-20260521',
    title: 'POC 首批真实工单试点运行确认',
    targetCustomer: rollout.targetCustomer,
    sourcePackageId: rollout.id,
    sourceAuditId: rollout.auditId,
    status: 'closed',
    statusLabel: '首批真实工单已跑通',
    runWindow: 'T+14 首批真实工单上线班次',
    batchId: 'PILOT-WO-BATCH-20260521-001',
    sampleSize: 30,
    otdTarget: '>= 96%',
    actualOtd: '97%',
    owner: '调度主管 / 生产班组长 / 交付经理',
    workOrders: [
      {
        workOrderNumber: 'WO-PILOT-2101',
        productName: '急单阀体组件',
        quantity: 12,
        route: 'CNC 精加工 -> OP-20 装配 -> 首件复检',
        scheduleDecision: '采纳 Agent 锁定期后插入建议',
        executionStatus: '已完工回写',
      },
      {
        workOrderNumber: 'WO-PILOT-2102',
        productName: '标准泵体基座',
        quantity: 10,
        route: 'CNC 粗加工 -> 热处理 -> 去毛刺',
        scheduleDecision: '按瓶颈设备合批重排',
        executionStatus: '已异常回写并关闭',
      },
      {
        workOrderNumber: 'WO-PILOT-2103',
        productName: '高优先级装配包',
        quantity: 8,
        route: '物料齐套 -> 装配 -> 质量抽检',
        scheduleDecision: '采购齐套后释放冻结窗口',
        executionStatus: '已首件通过',
      },
    ],
    checkpoints: [
      {
        module: 'AI 排产',
        owner: '调度主管',
        status: 'closed',
        evidence: 'TRACE-POC-PILOT-SCHEDULE-20260521',
        summary: '30 单真实工单已按锁定期、瓶颈设备和缺料齐套约束生成排产建议，关键建议均有人工采纳原因。',
      },
      {
        module: '生产报工',
        owner: '班组长',
        status: 'closed',
        evidence: 'TRACE-POC-PILOT-PRODUCTION-20260521',
        summary: '首批工单完成开工、完工、首件检验和异常回写，执行追踪可在生产报工页核对。',
      },
      {
        module: '治理审计',
        owner: '项目经理',
        status: 'closed',
        evidence: 'TRACE-POC-PILOT-AUDIT-20260521',
        summary: '试点运行结果进入统一 OTD 证据链、审计回放、系统治理和 CSV 导出。',
      },
    ],
    acceptanceCriteria: [
      '30 单真实工单样本全部完成排产建议、人工确认和执行回写。',
      'OTD 实测 97%，高于上线门禁 >= 96%。',
      '异常、质量、采购、生产四类现场动作均可追踪到证据编号。',
    ],
    auditId: 'AUD-POC-PILOT-RUN-20260521',
    traceId: 'TRACE-POC-PILOT-RUN-CLOSED-20260521',
    createdAt: now,
    summary: `${rollout.targetCustomer} 首批 30 单真实工单已跑通排产建议采纳、生产执行、异常回写和审计复盘，POC 进入上线验收确认。`,
  }
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(record))
  void upsertPocPilotRun(record).catch(() => undefined)
  upsertOtdEvidenceChainRecord({
    id: record.id,
    stage: 'POC 试点运行',
    title: record.title,
    summary: record.summary,
    object: `${record.batchId} / ${record.sampleSize} 单`,
    source: record.owner,
    traceId: record.traceId,
    status: 'closed',
    statusLabel: record.statusLabel,
    createdAt: record.createdAt,
  })
  return record
}
