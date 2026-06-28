import { upsertOtdEvidenceChainRecord } from './otd-evidence-chain-sync'

const ASSISTANT_RECOVERY_PACKAGE_KEY = 'aimes_assistant_recovery_packages'
const MAX_PACKAGES = 8

export interface AssistantRecoveryDispatchStep {
  module: string
  owner: string
  action: string
  evidence: string
  status?: 'pending' | 'closed'
  result?: string
  closedAt?: string
}

export interface AssistantRecoveryPackage {
  id: string
  title: string
  auditCode: string
  traceId: string
  actor: string
  role: string
  workOrders: string
  priority: 'critical' | 'warning'
  owner: string
  dueAt: string
  scheduleWindow: string
  scheduleAction: string
  riskImpact: string
  riskSuggestion: string
  otdImpact: string
  delayImpact: string
  changeoverImpact: string
  status?: 'active' | 'closed'
  statusLabel: string
  purchaseActionStatus?: 'pending' | 'closed'
  purchaseActionAuditCode?: string
  purchaseActionTraceId?: string
  purchaseActionSummary?: string
  purchaseActionClosedAt?: string
  purchaseActionClosedBy?: string
  purchaseOrderNumber?: string
  qualityActionStatus?: 'pending' | 'closed'
  qualityActionAuditCode?: string
  qualityActionTraceId?: string
  qualityActionSummary?: string
  qualityActionClosedAt?: string
  qualityActionClosedBy?: string
  firstArticleRecord?: string
  closureAuditCode?: string
  closureTraceId?: string
  closureSummary?: string
  closedAt?: string
  closedBy?: string
  summary: string
  dispatchSteps: AssistantRecoveryDispatchStep[]
  createdAt: string
}

interface WriteAssistantRecoveryPackageInput {
  actor: string
  role: string
}

function canUseStorage() {
  return typeof window !== 'undefined' && !!window.localStorage
}

function isDispatchStep(item: Partial<AssistantRecoveryDispatchStep> | null | undefined): item is AssistantRecoveryDispatchStep {
  return !!item
    && typeof item.module === 'string'
    && typeof item.owner === 'string'
    && typeof item.action === 'string'
    && typeof item.evidence === 'string'
    && (typeof item.status === 'undefined' || ['pending', 'closed'].includes(String(item.status)))
    && (typeof item.result === 'undefined' || typeof item.result === 'string')
    && (typeof item.closedAt === 'undefined' || typeof item.closedAt === 'string')
}

function isAssistantRecoveryPackage(item: Partial<AssistantRecoveryPackage> | null | undefined): item is AssistantRecoveryPackage {
  return !!item
    && typeof item.id === 'string'
    && typeof item.title === 'string'
    && typeof item.auditCode === 'string'
    && typeof item.traceId === 'string'
    && typeof item.actor === 'string'
    && typeof item.role === 'string'
    && typeof item.workOrders === 'string'
    && ['critical', 'warning'].includes(String(item.priority))
    && typeof item.owner === 'string'
    && typeof item.dueAt === 'string'
    && typeof item.scheduleWindow === 'string'
    && typeof item.scheduleAction === 'string'
    && typeof item.riskImpact === 'string'
    && typeof item.riskSuggestion === 'string'
    && typeof item.otdImpact === 'string'
    && typeof item.delayImpact === 'string'
    && typeof item.changeoverImpact === 'string'
    && (typeof item.status === 'undefined' || ['active', 'closed'].includes(String(item.status)))
    && typeof item.statusLabel === 'string'
    && typeof item.summary === 'string'
    && Array.isArray(item.dispatchSteps)
    && item.dispatchSteps.length > 0
    && item.dispatchSteps.every(isDispatchStep)
    && typeof item.createdAt === 'string'
}

function readRawAssistantRecoveryPackages(): AssistantRecoveryPackage[] {
  if (!canUseStorage()) return []
  try {
    const raw = window.localStorage.getItem(ASSISTANT_RECOVERY_PACKAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) {
      window.localStorage.removeItem(ASSISTANT_RECOVERY_PACKAGE_KEY)
      return []
    }
    const records = parsed.filter(isAssistantRecoveryPackage)
    if (records.length !== parsed.length) {
      if (records.length) {
        window.localStorage.setItem(ASSISTANT_RECOVERY_PACKAGE_KEY, JSON.stringify(records))
      } else {
        window.localStorage.removeItem(ASSISTANT_RECOVERY_PACKAGE_KEY)
      }
    }
    return records
  } catch {
    window.localStorage.removeItem(ASSISTANT_RECOVERY_PACKAGE_KEY)
    return []
  }
}

export function readAssistantRecoveryPackages(): AssistantRecoveryPackage[] {
  return readRawAssistantRecoveryPackages()
}

function mergeAssistantRecoveryPackages(
  remoteRecords: AssistantRecoveryPackage[],
  localRecords: AssistantRecoveryPackage[],
): AssistantRecoveryPackage[] {
  const merged = [...remoteRecords, ...localRecords].reduce<AssistantRecoveryPackage[]>((acc, record) => {
    if (acc.some(item => item.id === record.id)) return acc
    acc.push(record)
    return acc
  }, [])
  return merged
    .sort((left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime())
    .slice(0, MAX_PACKAGES)
}

export async function readAssistantRecoveryPackagesBackendFirst(options?: { failLoud?: boolean }): Promise<AssistantRecoveryPackage[]> {
  try {
    const { queryAssistantRecoveryPackages } = await import('../api/assistantEvidence')
    const records = await queryAssistantRecoveryPackages(MAX_PACKAGES, options)
    if (!Array.isArray(records)) {
      throw new Error('后端返回非数组执行包审计载荷')
    }
    const validRecords = records.filter(isAssistantRecoveryPackage)
    return mergeAssistantRecoveryPackages(validRecords, readAssistantRecoveryPackages())
  } catch (error: unknown) {
    if (options?.failLoud) throw error
    return readAssistantRecoveryPackages()
  }
}

export function writeAssistantRecoveryPackage(input: WriteAssistantRecoveryPackageInput): AssistantRecoveryPackage {
  const createdAt = new Date().toISOString()
  const record: AssistantRecoveryPackage = {
    id: 'wo-rush-9001-delivery-recovery',
    title: 'WO-RUSH-9001 交期恢复执行包',
    auditCode: 'AUD-CHAT-RECOVERY-PACKAGE-20260521-001',
    traceId: 'TRACE-CHAT-RECOVERY-WO-RUSH-9001-20260521',
    actor: input.actor,
    role: input.role,
    workOrders: 'WO-RUSH-9001 / WO-DEMO-1002 / WO-2026-0042',
    priority: 'critical',
    owner: '生产经理审批',
    dueAt: '今日 15:30',
    scheduleWindow: '锁定期后第一个 CNC 空窗 + 夜班加班',
    scheduleAction: '保护 8h 锁定期，释放 M-AL-6061B 替代料复核，把 WO-RUSH-9001 插入 CNC-003 夜班窗口，并后移低优先级标准件。',
    riskImpact: '急单、缺料和 CNC-001 维护窗口叠加，若不处置会让 DEMO-OTD-30-202605 的 30 单样本回到 26.67% 基线；当前 Agent 方案为 30.00% OTD。',
    riskSuggestion: '风险队列转生产经理审批，采购确认替代批次，调度员采纳锁定期后插入方案，质量保留首件复核。',
    otdImpact: '+3.33pt / p=0.7745',
    delayImpact: '-4 单延期风险',
    changeoverImpact: '+20min 可控',
    status: 'active',
    statusLabel: '待跨模块复核',
    summary: 'AI 生产助手把最高风险工单、缺料、设备维护和质量复核合并成一张可执行动作包，要求排产、采购、风险和质量同时回写证据。',
    dispatchSteps: [
      {
        module: 'AI 排产',
        owner: '调度员 李工',
        action: '生成锁定期后插入 + CNC-003 分流 + 夜班加班建议',
        evidence: 'TRACE-SCH-RECOVERY-WO-RUSH-9001',
        status: 'pending',
      },
      {
        module: '风险预警',
        owner: '生产经理审批',
        action: '把急单、缺料、设备维护窗口升级为跨部门处置项',
        evidence: 'TRACE-RISK-RECOVERY-WO-RUSH-9001',
        status: 'pending',
      },
      {
        module: '采购协同',
        owner: '采购 王工',
        action: '确认 M-AL-6061B 替代批次和到料承诺',
        evidence: 'TRACE-PO-RECOVERY-M-AL-6061B',
        status: 'pending',
      },
      {
        module: '质量闭环',
        owner: '质量工程师 周工',
        action: '保留替代料首件检验与 OP-20 装配扭矩复核窗口',
        evidence: 'TRACE-QA-RECOVERY-FIRST-ARTICLE',
        status: 'pending',
      },
    ],
    createdAt,
  }

  if (canUseStorage()) {
    const next = [record, ...readRawAssistantRecoveryPackages().filter(item => item.id !== record.id)].slice(0, MAX_PACKAGES)
    window.localStorage.setItem(ASSISTANT_RECOVERY_PACKAGE_KEY, JSON.stringify(next))
  }
  void import('../api/assistantEvidence')
    .then(({ upsertAssistantRecoveryPackage }) => upsertAssistantRecoveryPackage(record))
    .catch(() => undefined)

  upsertOtdEvidenceChainRecord({
    id: `assistant-recovery-${record.id}`,
    stage: '助手执行包',
    title: record.title,
    summary: `${record.summary} 预计 OTD 改善 ${record.otdImpact}，延期风险 ${record.delayImpact}。`,
    object: record.workOrders,
    source: `AI 生产助手 / ${record.actor}`,
    traceId: record.traceId,
    status: 'active',
    statusLabel: record.statusLabel,
    createdAt,
  })

  return record
}

export function closeAssistantRecoveryPurchaseAction(
  id: string,
  actor = '采购 王工',
  purchaseOrderNumber = 'PO-RUSH-20260519',
): AssistantRecoveryPackage | null {
  if (!canUseStorage()) return null
  const current = readRawAssistantRecoveryPackages().find(item => item.id === id)
  if (!current) return null
  if (current.purchaseActionStatus === 'closed') return current

  const closedAt = new Date().toISOString()
  const purchaseActionAuditCode = 'AUD-CHAT-RECOVERY-PURCHASE-CLOSURE-20260521-001'
  const purchaseActionTraceId = 'TRACE-CHAT-RECOVERY-PURCHASE-M-AL-6061-RECEIVED-20260521'
  const purchaseActionSummary = `${actor} 已确认 ${purchaseOrderNumber} 加急收货，M-AL-6061 齐套缺口清零，交期恢复执行包中的采购协同责任动作已闭合。`
  const updated: AssistantRecoveryPackage = {
    ...current,
    status: current.status ?? 'active',
    statusLabel: current.status === 'closed' ? current.statusLabel : '采购动作已闭合',
    purchaseActionStatus: 'closed',
    purchaseActionAuditCode,
    purchaseActionTraceId,
    purchaseActionSummary,
    purchaseActionClosedAt: closedAt,
    purchaseActionClosedBy: actor,
    purchaseOrderNumber,
    dispatchSteps: current.dispatchSteps.map(step =>
      step.module === '采购协同'
        ? {
            ...step,
            status: 'closed',
            result: `${purchaseOrderNumber} 已收货，齐套缺口清零。`,
            closedAt,
            evidence: purchaseActionTraceId,
          }
        : step,
    ),
  }

  const next = [updated, ...readRawAssistantRecoveryPackages().filter(item => item.id !== id)].slice(0, MAX_PACKAGES)
  window.localStorage.setItem(ASSISTANT_RECOVERY_PACKAGE_KEY, JSON.stringify(next))
  void import('../api/assistantEvidence')
    .then(({ upsertAssistantRecoveryPackage }) => upsertAssistantRecoveryPackage(updated))
    .catch(() => undefined)

  upsertOtdEvidenceChainRecord({
    id: `assistant-recovery-purchase-${updated.id}`,
    stage: '助手采购回写',
    title: `${updated.title}采购动作已闭合`,
    summary: `${purchaseActionSummary} 原执行包预计 OTD 改善 ${updated.otdImpact}，延期风险 ${updated.delayImpact}。`,
    object: updated.workOrders,
    source: `采购协同 / ${actor}`,
    traceId: purchaseActionTraceId,
    status: 'closed',
    statusLabel: '采购动作已闭合',
    createdAt: closedAt,
  })

  return updated
}

export function closeAssistantRecoveryQualityAction(
  id: string,
  actor = '质量工程师 周工',
  firstArticleRecord = 'FAI-WO-RUSH-9001-OP20-20260521',
): AssistantRecoveryPackage | null {
  if (!canUseStorage()) return null
  const current = readRawAssistantRecoveryPackages().find(item => item.id === id)
  if (!current) return null
  if (current.qualityActionStatus === 'closed') return current

  const closedAt = new Date().toISOString()
  const qualityActionAuditCode = 'AUD-CHAT-RECOVERY-QUALITY-CLOSURE-20260521-001'
  const qualityActionTraceId = 'TRACE-CHAT-RECOVERY-QUALITY-FIRST-ARTICLE-20260521'
  const qualityActionSummary = `${actor} 已确认 ${firstArticleRecord} 首件检验合格，OP-20 装配扭矩复核窗口保留，交期恢复执行包中的质量闭环责任动作已闭合。`
  const updated: AssistantRecoveryPackage = {
    ...current,
    status: current.status ?? 'active',
    statusLabel: current.status === 'closed' ? current.statusLabel : '质量动作已闭合',
    qualityActionStatus: 'closed',
    qualityActionAuditCode,
    qualityActionTraceId,
    qualityActionSummary,
    qualityActionClosedAt: closedAt,
    qualityActionClosedBy: actor,
    firstArticleRecord,
    dispatchSteps: current.dispatchSteps.map(step =>
      step.module === '质量闭环'
        ? {
            ...step,
            status: 'closed',
            result: `${firstArticleRecord} 首件合格，OP-20 扭矩复核窗口已保留。`,
            closedAt,
            evidence: qualityActionTraceId,
          }
        : step,
    ),
  }

  const next = [updated, ...readRawAssistantRecoveryPackages().filter(item => item.id !== id)].slice(0, MAX_PACKAGES)
  window.localStorage.setItem(ASSISTANT_RECOVERY_PACKAGE_KEY, JSON.stringify(next))
  void import('../api/assistantEvidence')
    .then(({ upsertAssistantRecoveryPackage }) => upsertAssistantRecoveryPackage(updated))
    .catch(() => undefined)

  upsertOtdEvidenceChainRecord({
    id: `assistant-recovery-quality-${updated.id}`,
    stage: '助手质量回写',
    title: `${updated.title}质量动作已闭合`,
    summary: `${qualityActionSummary} 原执行包预计 OTD 改善 ${updated.otdImpact}，延期风险 ${updated.delayImpact}。`,
    object: updated.workOrders,
    source: `质量闭环 / ${actor}`,
    traceId: qualityActionTraceId,
    status: 'closed',
    statusLabel: '质量动作已闭合',
    createdAt: closedAt,
  })

  return updated
}

export function closeAssistantRecoveryPackage(id: string, actor = '调度员 李工'): AssistantRecoveryPackage | null {
  if (!canUseStorage()) return null
  const current = readRawAssistantRecoveryPackages().find(item => item.id === id)
  if (!current) return null

  const closedAt = new Date().toISOString()
  const closureAuditCode = 'AUD-CHAT-RECOVERY-PACKAGE-CLOSURE-20260521-001'
  const closureTraceId = 'TRACE-CHAT-RECOVERY-WO-RUSH-9001-CLOSED-20260521'
  const closureSummary = `${actor} 已确认排产、风险、采购和质量四个责任动作完成交接，WO-RUSH-9001 恢复方案进入 OTD 复盘闭环。`
  const closed: AssistantRecoveryPackage = {
    ...current,
    status: 'closed',
    statusLabel: '执行交接已闭环',
    closureAuditCode,
    closureTraceId,
    closureSummary,
    closedAt,
    closedBy: actor,
  }

  const next = [closed, ...readRawAssistantRecoveryPackages().filter(item => item.id !== id)].slice(0, MAX_PACKAGES)
  window.localStorage.setItem(ASSISTANT_RECOVERY_PACKAGE_KEY, JSON.stringify(next))
  void import('../api/assistantEvidence')
    .then(({ upsertAssistantRecoveryPackage }) => upsertAssistantRecoveryPackage(closed))
    .catch(() => undefined)

  upsertOtdEvidenceChainRecord({
    id: `assistant-recovery-${closed.id}`,
    stage: '助手执行包',
    title: closed.title,
    summary: `${closureSummary} 原执行包预计 OTD 改善 ${closed.otdImpact}，延期风险 ${closed.delayImpact}。`,
    object: closed.workOrders,
    source: `AI 排产 / ${actor}`,
    traceId: closureTraceId,
    status: 'closed',
    statusLabel: closed.statusLabel,
    createdAt: closedAt,
  })

  return closed
}
