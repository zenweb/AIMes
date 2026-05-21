import { upsertOtdEvidenceChainRecord } from './otd-evidence-chain-sync'
import type { PocPilotRunRecord } from './poc-pilot-run-sync'

const STORAGE_KEY = 'aimes_poc_hypercare_acceptance'

export interface PocHypercareMonitor {
  label: string
  target: string
  current: string
  status: 'stable' | 'watch'
  statusLabel: string
  evidence: string
}

export interface PocHypercareCheckpoint {
  module: string
  owner: string
  action: string
  status: 'active'
  evidence: string
  summary: string
}

export interface PocHypercareAcceptanceRecord {
  id: string
  title: string
  targetCustomer: string
  sourcePilotRunId: string
  sourcePilotAuditId: string
  status: 'active'
  statusLabel: string
  goLiveWindow: string
  hypercareDays: number
  otdTarget: string
  actualOtd: string
  oeeTarget: string
  currentOee: string
  incidentCount: number
  unresolvedP1P2: number
  acceptanceGate: string
  owner: string
  monitors: PocHypercareMonitor[]
  checkpoints: PocHypercareCheckpoint[]
  auditId: string
  traceId: string
  createdAt: string
  summary: string
}

function canUseStorage() {
  return typeof window !== 'undefined' && !!window.localStorage
}

function isPocHypercareAcceptanceRecord(
  record: Partial<PocHypercareAcceptanceRecord> | null | undefined
): record is PocHypercareAcceptanceRecord {
  return !!record
    && typeof record.id === 'string'
    && typeof record.title === 'string'
    && typeof record.targetCustomer === 'string'
    && typeof record.sourcePilotRunId === 'string'
    && typeof record.sourcePilotAuditId === 'string'
    && record.status === 'active'
    && typeof record.statusLabel === 'string'
    && typeof record.goLiveWindow === 'string'
    && typeof record.hypercareDays === 'number'
    && typeof record.otdTarget === 'string'
    && typeof record.actualOtd === 'string'
    && typeof record.oeeTarget === 'string'
    && typeof record.currentOee === 'string'
    && typeof record.incidentCount === 'number'
    && typeof record.unresolvedP1P2 === 'number'
    && typeof record.acceptanceGate === 'string'
    && typeof record.owner === 'string'
    && Array.isArray(record.monitors)
    && Array.isArray(record.checkpoints)
    && typeof record.auditId === 'string'
    && typeof record.traceId === 'string'
    && typeof record.createdAt === 'string'
    && typeof record.summary === 'string'
}

export function readPocHypercareAcceptanceRecord(): PocHypercareAcceptanceRecord | null {
  if (!canUseStorage()) return null
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    return isPocHypercareAcceptanceRecord(parsed) ? parsed : null
  } catch {
    window.localStorage.removeItem(STORAGE_KEY)
    return null
  }
}

export function writePocHypercareAcceptanceRecord(pilotRun: PocPilotRunRecord) {
  if (!canUseStorage()) return null
  const now = new Date().toISOString()
  const record: PocHypercareAcceptanceRecord = {
    id: 'poc-hypercare-acceptance-20260521',
    title: 'POC 正式上线验收与 Hypercare 稳定运行监控包',
    targetCustomer: pilotRun.targetCustomer,
    sourcePilotRunId: pilotRun.id,
    sourcePilotAuditId: pilotRun.auditId,
    status: 'active',
    statusLabel: 'Hypercare 7 天稳定运行中',
    goLiveWindow: 'T+15 正式上线，T+21 完成 7 天 Hypercare 验收',
    hypercareDays: 7,
    otdTarget: pilotRun.otdTarget,
    actualOtd: pilotRun.actualOtd,
    oeeTarget: '>= 78%',
    currentOee: '82%',
    incidentCount: 1,
    unresolvedP1P2: 0,
    acceptanceGate: '首批真实工单 OTD >= 96%、P1/P2 未关闭事件 = 0、审计导出可交付',
    owner: '客户厂长 / 交付经理 / 调度主管',
    monitors: [
      {
        label: 'OTD 稳定性',
        target: pilotRun.otdTarget,
        current: pilotRun.actualOtd,
        status: 'stable',
        statusLabel: '达标',
        evidence: 'TRACE-POC-HYPERCARE-OTD-20260521',
      },
      {
        label: 'OEE 稳定性',
        target: '>= 78%',
        current: '82%',
        status: 'stable',
        statusLabel: '达标',
        evidence: 'TRACE-POC-HYPERCARE-OEE-20260521',
      },
      {
        label: '异常告警',
        target: 'P1/P2 未关闭 = 0',
        current: '0 个未关闭，1 个 P3 已派单',
        status: 'watch',
        statusLabel: '持续观察',
        evidence: 'TRACE-POC-HYPERCARE-INCIDENT-20260521',
      },
      {
        label: 'AI 建议采纳率',
        target: '>= 85%',
        current: '89%',
        status: 'stable',
        statusLabel: '达标',
        evidence: 'TRACE-POC-HYPERCARE-AI-ADOPTION-20260521',
      },
    ],
    checkpoints: [
      {
        module: '生产概览',
        owner: '客户厂长',
        action: '在首页指挥中心复核上线后 OTD、P1/P2 事件和负责人。',
        status: 'active',
        evidence: 'TRACE-POC-HYPERCARE-DASHBOARD-20260521',
        summary: '正式上线状态进入生产概览，管理层可从首页看到 Hypercare 门禁和稳定运行指标。',
      },
      {
        module: '实时监控',
        owner: '生产经理 / 设备主管',
        action: '用现场监控页持续观察 OEE、异常告警和未关闭事件。',
        status: 'active',
        evidence: 'TRACE-POC-HYPERCARE-MONITORING-20260521',
        summary: 'Hypercare 期间的现场波动进入实时监控，P1/P2 未关闭事件必须保持为 0。',
      },
      {
        module: '治理审计',
        owner: '交付经理 / 项目经理',
        action: '导出上线验收、指标快照、责任动作和审计追踪给客户复盘。',
        status: 'active',
        evidence: 'TRACE-POC-HYPERCARE-AUDIT-20260521',
        summary: '上线验收记录写入统一 OTD 证据链，可在报表 CSV、系统治理和审计回放中核对。',
      },
    ],
    auditId: 'AUD-POC-HYPERCARE-20260521',
    traceId: 'TRACE-POC-HYPERCARE-ACCEPTANCE-20260521',
    createdAt: now,
    summary: `${pilotRun.targetCustomer} 已从首批真实工单试点进入正式上线验收，Hypercare 监控跟踪 OTD ${pilotRun.actualOtd}、OEE 82%、P1/P2 未关闭 0 个和 AI 建议采纳率 89%。`,
  }
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(record))
  upsertOtdEvidenceChainRecord({
    id: record.id,
    stage: 'POC 上线验收',
    title: record.title,
    summary: record.summary,
    object: `${record.targetCustomer} / Hypercare ${record.hypercareDays} 天`,
    source: record.owner,
    traceId: record.traceId,
    status: record.status,
    statusLabel: record.statusLabel,
    createdAt: record.createdAt,
  })
  return record
}
