import { upsertOtdEvidenceChainRecord } from './otd-evidence-chain-sync'

const MONITORING_SITUATION_ESCALATION_KEY = 'aimes_monitoring_situation_escalations'
const MAX_ESCALATIONS = 8

export type MonitoringSituationPriority = 'critical' | 'warning'
export type MonitoringSituationEscalationStatus = 'escalated' | 'closed'

export interface MonitoringSituationEscalation {
  id: string
  sourceEventId: string
  title: string
  source: string
  workOrders: string
  priority: MonitoringSituationPriority
  owner: string
  dueAt: string
  auditId: string
  traceId: string
  status: MonitoringSituationEscalationStatus
  statusLabel: string
  scheduleWindow: string
  scheduleAction: string
  riskImpact: string
  riskSuggestion: string
  otdImpact: string
  delayImpact: string
  changeoverImpact: string
  summary: string
  evidence: string[]
  dispatchSteps: string[]
  createdAt: string
  closedAt?: string
  closureTrace?: string
}

export interface WriteMonitoringSituationEscalationInput {
  sourceEventId: string
  source: string
  eventTitle: string
  eventImpact: string
  workOrders: string
  owner: string
  action: string
  relatedEvents: Array<{
    source: string
    title: string
    impact: string
    owner: string
  }>
}

function canUseStorage() {
  return typeof window !== 'undefined' && !!window.localStorage
}

function isMonitoringSituationEscalation(item: Partial<MonitoringSituationEscalation> | null | undefined): item is MonitoringSituationEscalation {
  return !!item
    && typeof item.id === 'string'
    && typeof item.sourceEventId === 'string'
    && typeof item.title === 'string'
    && typeof item.source === 'string'
    && typeof item.workOrders === 'string'
    && (item.priority === 'critical' || item.priority === 'warning')
    && typeof item.owner === 'string'
    && typeof item.dueAt === 'string'
    && typeof item.auditId === 'string'
    && typeof item.traceId === 'string'
    && (item.status === 'escalated' || item.status === 'closed')
    && typeof item.statusLabel === 'string'
    && typeof item.scheduleWindow === 'string'
    && typeof item.scheduleAction === 'string'
    && typeof item.riskImpact === 'string'
    && typeof item.riskSuggestion === 'string'
    && typeof item.otdImpact === 'string'
    && typeof item.delayImpact === 'string'
    && typeof item.changeoverImpact === 'string'
    && typeof item.summary === 'string'
    && Array.isArray(item.evidence)
    && Array.isArray(item.dispatchSteps)
    && typeof item.createdAt === 'string'
}

function readRawEscalations(): MonitoringSituationEscalation[] {
  if (!canUseStorage()) return []
  try {
    const raw = window.localStorage.getItem(MONITORING_SITUATION_ESCALATION_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    const records = parsed.filter(isMonitoringSituationEscalation)
    if (records.length !== parsed.length) {
      if (records.length) {
        window.localStorage.setItem(MONITORING_SITUATION_ESCALATION_KEY, JSON.stringify(records))
      } else {
        window.localStorage.removeItem(MONITORING_SITUATION_ESCALATION_KEY)
      }
    }
    return records
  } catch {
    window.localStorage.removeItem(MONITORING_SITUATION_ESCALATION_KEY)
    return []
  }
}

export function readMonitoringSituationEscalations(): MonitoringSituationEscalation[] {
  return readRawEscalations()
}

export async function readMonitoringSituationEscalationsBackendFirst(options?: { failLoud?: boolean }): Promise<MonitoringSituationEscalation[]> {
  try {
    const { queryMonitoringSituationEscalations } = await import('../api/riskEvidence')
    const records = await queryMonitoringSituationEscalations(MAX_ESCALATIONS, options)
    return records.length > 0 ? records : readMonitoringSituationEscalations()
  } catch (error) {
    if (options?.failLoud) throw error
    return readMonitoringSituationEscalations()
  }
}

export function closeMonitoringSituationEscalation(id: string, trace: string, owner: string): MonitoringSituationEscalation | null {
  if (!canUseStorage()) return null
  const records = readRawEscalations()
  const current = records.find(item => item.id === id)
  if (!current) return null

  const closedAt = new Date().toISOString()
  const record: MonitoringSituationEscalation = {
    ...current,
    status: 'closed',
    statusLabel: '已闭环',
    priority: 'warning',
    owner,
    otdImpact: '+6% 已锁定',
    delayImpact: '-1 单延期风险已解除',
    changeoverImpact: '+10min 已纳入复盘',
    summary: `${current.summary} 风险队列已关闭处置，现场态势转为已闭环复盘。`,
    dispatchSteps: [
      ...current.dispatchSteps,
      '风险队列关闭现场处置包，确认生产经理审批与调度复核完成。',
    ],
    evidence: Array.from(new Set([...current.evidence, `${current.traceId}-RISK-CLOSED`])),
    closedAt,
    closureTrace: trace,
  }

  const next = [record, ...records.filter(item => item.id !== id)].slice(0, MAX_ESCALATIONS)
  window.localStorage.setItem(MONITORING_SITUATION_ESCALATION_KEY, JSON.stringify(next))
  void import('../api/riskEvidence')
    .then(({ upsertMonitoringSituationEscalation }) => upsertMonitoringSituationEscalation(record))
    .catch(() => undefined)

  upsertOtdEvidenceChainRecord({
    id: record.id,
    stage: '现场处置包',
    title: record.title,
    summary: `${record.summary} 关闭留痕：${trace}`,
    object: record.workOrders,
    source: `风险处置队列 / ${owner}`,
    traceId: record.traceId,
    status: 'closed',
    statusLabel: record.statusLabel,
    createdAt: closedAt,
  })

  return record
}

export function writeMonitoringSituationEscalation(input: WriteMonitoringSituationEscalationInput): MonitoringSituationEscalation {
  const createdAt = new Date().toISOString()
  const evidence = [
    `TRACE-SF-${input.sourceEventId.toUpperCase()}`,
    ...input.relatedEvents.map(event => `${event.source} / ${event.owner}`),
  ]

  const record: MonitoringSituationEscalation = {
    id: `monitoring-situation-${input.sourceEventId}`,
    sourceEventId: input.sourceEventId,
    title: `${input.source} 现场态势升级处置包`,
    source: input.source,
    workOrders: input.workOrders,
    priority: 'critical',
    owner: '生产经理审批',
    dueAt: '今日 11:30',
    auditId: `AUD-SF-ESC-${input.sourceEventId.toUpperCase()}-20260521`,
    traceId: `TRACE-SF-ESC-${input.sourceEventId.toUpperCase()}`,
    status: 'escalated',
    statusLabel: '待跨模块处置',
    scheduleWindow: '锁定期后第一个 CNC 空窗 + 夜班复核',
    scheduleAction: `${input.source} ${input.eventTitle} 已影响 ${input.workOrders}；建议冻结当前瓶颈任务，保留锁定期，把 WO-RUSH-9001 插入 CNC-002/CNC-003 可用窗口，并同步复核缺料与返工窗口。`,
    riskImpact: `${input.eventImpact} 现场态势已从看板告警升级为生产经理审批的跨模块处置包。`,
    riskSuggestion: `风险队列升级给生产经理；调度员复核 CNC 分流，${input.relatedEvents.map(event => event.owner).join('、')} 同步确认物料/质量约束。`,
    otdImpact: '+6%',
    delayImpact: '-1 单延期风险 / -4h 瓶颈等待',
    changeoverImpact: '+10min 可控',
    summary: `${input.source} 现场态势触发跨模块处置：${input.eventTitle}，关联 ${input.relatedEvents.length} 条现场事件，要求排产、风险、物料和质量同步回写证据。`,
    evidence,
    dispatchSteps: [
      '实时监控识别瓶颈负载、齐套缺口和返工窗口叠加。',
      '生成现场态势升级处置包并分配生产经理审批。',
      'AI 排产读取处置包生成锁定期后 CNC 分流建议。',
      '风险队列保留负责人、截止时间、建议动作和追踪编号。',
    ],
    createdAt,
  }

  if (canUseStorage()) {
    const next = [record, ...readRawEscalations().filter(item => item.id !== record.id)].slice(0, MAX_ESCALATIONS)
    window.localStorage.setItem(MONITORING_SITUATION_ESCALATION_KEY, JSON.stringify(next))
  }
  void import('../api/riskEvidence')
    .then(({ upsertMonitoringSituationEscalation }) => upsertMonitoringSituationEscalation(record))
    .catch(() => undefined)

  upsertOtdEvidenceChainRecord({
    id: record.id,
    stage: '现场处置包',
    title: record.title,
    summary: `${record.summary} 排产动作：${record.scheduleAction}`,
    object: record.workOrders,
    source: `实时监控 / ${record.source} / ${record.owner}`,
    traceId: record.traceId,
    status: 'active',
    statusLabel: record.statusLabel,
    createdAt,
  })

  return record
}
