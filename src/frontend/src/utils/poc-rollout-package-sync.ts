import { upsertOtdEvidenceChainRecord } from './otd-evidence-chain-sync'
import type { PocReviewSignoffRecord } from './poc-review-signoff-sync'
import { getLatestPocRolloutPackage, upsertPocRolloutPackage } from '../api/pocEvidence'

const STORAGE_KEY = 'aimes_poc_rollout_package'

export interface PocRolloutAction {
  module: string
  owner: string
  action: string
  dueAt: string
  evidence: string
}

export interface PocRolloutPackageRecord {
  id: string
  title: string
  targetCustomer: string
  sourceMeetingId: string
  sourceAuditId: string
  status: 'ready'
  statusLabel: string
  rolloutWindow: string
  goLiveGate: string
  owner: string
  successCriteria: string[]
  actions: PocRolloutAction[]
  auditId: string
  traceId: string
  createdAt: string
  summary: string
}

function canUseStorage() {
  return typeof window !== 'undefined' && !!window.localStorage
}

function isPocRolloutAction(action: Partial<PocRolloutAction> | null | undefined): action is PocRolloutAction {
  return !!action
    && typeof action.module === 'string'
    && typeof action.owner === 'string'
    && typeof action.action === 'string'
    && typeof action.dueAt === 'string'
    && typeof action.evidence === 'string'
}

function isPocRolloutPackageRecord(record: Partial<PocRolloutPackageRecord> | null | undefined): record is PocRolloutPackageRecord {
  return !!record
    && typeof record.id === 'string'
    && typeof record.title === 'string'
    && typeof record.targetCustomer === 'string'
    && typeof record.sourceMeetingId === 'string'
    && typeof record.sourceAuditId === 'string'
    && record.status === 'ready'
    && typeof record.statusLabel === 'string'
    && typeof record.rolloutWindow === 'string'
    && typeof record.goLiveGate === 'string'
    && typeof record.owner === 'string'
    && Array.isArray(record.successCriteria)
    && Array.isArray(record.actions)
    && record.actions.every(isPocRolloutAction)
    && typeof record.auditId === 'string'
    && typeof record.traceId === 'string'
    && typeof record.createdAt === 'string'
    && typeof record.summary === 'string'
}

export function readPocRolloutPackageRecord(): PocRolloutPackageRecord | null {
  if (!canUseStorage()) return null
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (isPocRolloutPackageRecord(parsed)) return parsed
    window.localStorage.removeItem(STORAGE_KEY)
    return null
  } catch {
    window.localStorage.removeItem(STORAGE_KEY)
    return null
  }
}

export async function readPocRolloutPackageRecordBackendFirst(): Promise<PocRolloutPackageRecord | null> {
  const localRecord = readPocRolloutPackageRecord()
  const record = await getLatestPocRolloutPackage()
  if (!isPocRolloutPackageRecord(record)) return localRecord
  if (!localRecord) return record
  return new Date(localRecord.createdAt).getTime() >= new Date(record.createdAt).getTime()
    ? localRecord
    : record
}

export function writePocRolloutPackageRecord(signoff: PocReviewSignoffRecord) {
  if (!canUseStorage()) return null
  const now = new Date().toISOString()
  const record: PocRolloutPackageRecord = {
    id: 'poc-rollout-package-20260521',
    title: 'POC 成功转上线交付行动包',
    targetCustomer: signoff.targetCustomer,
    sourceMeetingId: signoff.meetingId,
    sourceAuditId: signoff.auditId,
    status: 'ready',
    statusLabel: '待客户交付启动会确认',
    rolloutWindow: 'T+7 天完成试点上线准备，T+14 天进入首批真实工单运行',
    goLiveGate: 'POC 评分通过、客户工单/设备样例齐套、OTD 证据链可审计',
    owner: '交付经理 / 客户厂长 / IT 负责人',
    successCriteria: [
      '首批真实工单 >= 30 单，OTD 恢复口径沿用 POC 评分表。',
      '排产、采购、质量、设备四类责任动作均能回写统一证据链。',
      '上线启动会确认账号、数据接口、现场培训和审计导出口径。',
    ],
    actions: [
      {
        module: '交付项目',
        owner: '交付经理',
        action: '组织 POC 转上线启动会，冻结试点范围和验收口径。',
        dueAt: 'T+1',
        evidence: 'TRACE-POC-ROLLOUT-KICKOFF-20260521',
      },
      {
        module: '数据接口',
        owner: '客户 IT / MES 实施',
        action: '确认 ERP 工单、设备故障、采购到货和质量检验四类接口映射。',
        dueAt: 'T+3',
        evidence: 'TRACE-POC-ROLLOUT-DATA-MAPPING-20260521',
      },
      {
        module: '现场运行',
        owner: '调度主管 / 班组长',
        action: '用首批真实工单跑通排产建议采纳、现场执行和异常回写。',
        dueAt: 'T+7',
        evidence: 'TRACE-POC-ROLLOUT-PILOT-RUN-20260521',
      },
      {
        module: '治理审计',
        owner: '客户厂长 / 项目经理',
        action: '复核 OTD、责任动作、AI 建议采纳和审计导出是否可对客户复盘。',
        dueAt: 'T+14',
        evidence: 'TRACE-POC-ROLLOUT-GOVERNANCE-20260521',
      },
    ],
    auditId: 'AUD-POC-ROLLOUT-20260521',
    traceId: 'TRACE-POC-ROLLOUT-DELIVERY-PACKAGE-20260521',
    createdAt: now,
    summary: `${signoff.targetCustomer} 已从 POC 签署进入试点上线准备，交付、接口、现场运行和治理审计责任动作已固化。`,
  }
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(record))
  void upsertPocRolloutPackage(record).catch(() => undefined)
  upsertOtdEvidenceChainRecord({
    id: record.id,
    stage: 'POC 上线交付包',
    title: record.title,
    summary: record.summary,
    object: record.targetCustomer,
    source: record.owner,
    traceId: record.traceId,
    status: 'ready',
    statusLabel: record.statusLabel,
    createdAt: record.createdAt,
  })
  return record
}
