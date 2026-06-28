import { upsertOtdEvidenceChainRecord } from './otd-evidence-chain-sync'

const RISK_SLA_REVIEW_KEY = 'aimes_risk_sla_review'

export type RiskSlaReviewStatus = 'active' | 'escalated' | 'closed'

export interface RiskSlaReviewRisk {
  id: string
  type: string
  title: string
  owner: string
  dueAt: string
  workOrders: string
  deliveryImpact: string
  statusLabel: string
  slaStatus: 'overdue' | 'critical' | 'watch'
  requiredAction: string
}

export interface RiskSlaReviewAction {
  module: string
  owner: string
  dueAt: string
  action: string
  evidence: string
  result?: string
}

export interface RiskSlaReviewRecord {
  id: string
  title: string
  status: RiskSlaReviewStatus
  statusLabel: string
  reviewMeetingId: string
  owner: string
  overdueCount: number
  criticalCount: number
  affectedOrders: string
  otdImpact: string
  auditId: string
  traceId: string
  createdAt: string
  summary: string
  risks: RiskSlaReviewRisk[]
  actions: RiskSlaReviewAction[]
  closedAt?: string
  closureAuditId?: string
  closureTraceId?: string
  closureSummary?: string
}

export interface WriteRiskSlaReviewInput {
  risks: Array<{
    id: string
    type: string
    title: string
    level: 'critical' | 'warning'
    owner: string
    dueAt: string
    workOrders: string
    deliveryImpact: string
    status: string
    statusLabel: string
    suggestion: string
  }>
}

function canUseStorage() {
  return typeof window !== 'undefined' && !!window.localStorage
}

function isRiskSlaReviewRecord(record: Partial<RiskSlaReviewRecord> | null | undefined): record is RiskSlaReviewRecord {
  return !!record
    && typeof record.id === 'string'
    && typeof record.title === 'string'
    && (record.status === 'active' || record.status === 'escalated' || record.status === 'closed')
    && typeof record.statusLabel === 'string'
    && typeof record.reviewMeetingId === 'string'
    && typeof record.owner === 'string'
    && typeof record.overdueCount === 'number'
    && typeof record.criticalCount === 'number'
    && typeof record.affectedOrders === 'string'
    && typeof record.otdImpact === 'string'
    && typeof record.auditId === 'string'
    && typeof record.traceId === 'string'
    && typeof record.createdAt === 'string'
    && typeof record.summary === 'string'
    && Array.isArray(record.risks)
    && Array.isArray(record.actions)
}

export function readRiskSlaReviewRecord(): RiskSlaReviewRecord | null {
  if (!canUseStorage()) return null
  try {
    const raw = window.localStorage.getItem(RISK_SLA_REVIEW_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (isRiskSlaReviewRecord(parsed)) return parsed
    window.localStorage.removeItem(RISK_SLA_REVIEW_KEY)
    return null
  } catch {
    window.localStorage.removeItem(RISK_SLA_REVIEW_KEY)
    return null
  }
}

export async function readRiskSlaReviewRecordBackendFirst(options?: { failLoud?: boolean }): Promise<RiskSlaReviewRecord | null> {
  try {
    const { getLatestRiskSlaReview } = await import('../api/riskEvidence')
    const record = await getLatestRiskSlaReview(options)
    return isRiskSlaReviewRecord(record) ? record : readRiskSlaReviewRecord()
  } catch (error: unknown) {
    if (options?.failLoud) throw error
    return readRiskSlaReviewRecord()
  }
}

export function writeRiskSlaReviewRecord(input: WriteRiskSlaReviewInput): RiskSlaReviewRecord {
  const createdAt = new Date().toISOString()
  const sourceRisks = input.risks.length ? input.risks : []
  const criticalRisks = sourceRisks.filter(risk => risk.level === 'critical')
  const overdueRisks = sourceRisks.filter(risk => risk.dueAt.includes('今日') || risk.dueAt.includes('立即'))
  const mappedRisks: RiskSlaReviewRisk[] = sourceRisks.slice(0, 6).map((risk) => {
    const slaStatus = risk.dueAt.includes('立即') || risk.dueAt.includes('今日')
      ? 'overdue'
      : risk.level === 'critical'
        ? 'critical'
        : 'watch'
    return {
      id: risk.id,
      type: risk.type,
      title: risk.title,
      owner: risk.owner,
      dueAt: risk.dueAt,
      workOrders: risk.workOrders,
      deliveryImpact: risk.deliveryImpact,
      statusLabel: risk.statusLabel,
      slaStatus,
      requiredAction: risk.suggestion,
    }
  })

  const record: RiskSlaReviewRecord = {
    id: 'risk-sla-review-20260521',
    title: '风险 SLA 逾期晨会复核包',
    status: 'escalated',
    statusLabel: '已升级晨会复核',
    reviewMeetingId: 'RISK-DAILY-20260521-001',
    owner: '生产经理 / 调度主管 / 采购主管 / 设备主管',
    overdueCount: overdueRisks.length || mappedRisks.filter(risk => risk.slaStatus === 'overdue').length,
    criticalCount: criticalRisks.length || mappedRisks.filter(risk => risk.slaStatus !== 'watch').length,
    affectedOrders: 'WO-2026-0042 / WO-RUSH-9001 / WO-DEMO-1002 / CNC-001 / AL-6061',
    otdImpact: '-2 单延期风险待复核，预计可追回 +6% OTD',
    auditId: 'AUD-RISK-SLA-REVIEW-20260521',
    traceId: 'TRACE-RISK-SLA-DAILY-REVIEW-20260521',
    createdAt,
    summary: '风险处置队列把逾期、关键缺料和瓶颈设备风险升级为晨会复核包，要求生产经理在当日晨会确认排产保护、采购承诺、设备窗口和管理复盘动作。',
    risks: mappedRisks.length
      ? mappedRisks
      : [
          {
            id: 'risk-order-0042',
            type: '工单延期',
            title: 'WO-2026-0042 CNC 停机延期',
            owner: '生产经理审批',
            dueAt: '今日 14:00',
            workOrders: 'WO-2026-0042 / WO-2026-0041',
            deliveryImpact: '预计延期 2 天',
            statusLabel: '已升级',
            slaStatus: 'overdue',
            requiredAction: '调度主管确认 CNC-003 分流和夜班加班 2 小时。',
          },
        ],
    actions: [
      {
        module: 'AI 排产',
        owner: '调度主管',
        dueAt: '今日 10:30',
        action: '按 SLA 复核结果生成锁定期后排产保护建议，优先保护 WO-2026-0042 与急单窗口。',
        evidence: 'TRACE-RISK-SLA-SCHEDULE-REVIEW-20260521',
      },
      {
        module: '采购协同',
        owner: '采购主管',
        dueAt: '今日 11:00',
        action: '确认 AL-6061 替代承诺或加急到货窗口，并把采购承诺回写 OTD 证据链。',
        evidence: 'TRACE-RISK-SLA-PURCHASE-COMMIT-20260521',
      },
      {
        module: '设备维护',
        owner: '设备主管',
        dueAt: '今日 11:30',
        action: '锁定 CNC-001 维护窗口与 CNC-003 分流能力，避免瓶颈窗口继续挤占承诺工单。',
        evidence: 'TRACE-RISK-SLA-EQUIPMENT-WINDOW-20260521',
      },
      {
        module: '系统治理',
        owner: '生产经理',
        dueAt: '今日 12:00',
        action: '晨会复核结论进入 Agent 治理、报表证据链和审计回放，未关闭项纳入次日追踪。',
        evidence: 'TRACE-RISK-SLA-GOVERNANCE-20260521',
      },
    ],
  }

  if (canUseStorage()) {
    window.localStorage.setItem(RISK_SLA_REVIEW_KEY, JSON.stringify(record))
  }
  void import('../api/riskEvidence')
    .then(({ upsertRiskSlaReview }) => upsertRiskSlaReview(record))
    .catch(() => undefined)

  upsertOtdEvidenceChainRecord({
    id: record.id,
    stage: '风险 SLA 复核',
    title: record.title,
    summary: `${record.summary} 逾期 ${record.overdueCount} 项，关键风险 ${record.criticalCount} 项。`,
    object: record.affectedOrders,
    source: `风险处置队列 / ${record.owner}`,
    traceId: record.traceId,
    status: 'active',
    statusLabel: record.statusLabel,
    createdAt,
  })

  return record
}

export function closeRiskSlaReviewRecord(actor = '生产经理'): RiskSlaReviewRecord | null {
  if (!canUseStorage()) return null
  const current = readRiskSlaReviewRecord()
  if (!current) return null

  const closedAt = new Date().toISOString()
  const record: RiskSlaReviewRecord = {
    ...current,
    status: 'closed',
    statusLabel: '晨会责任动作已闭环',
    otdImpact: '+6% OTD 恢复动作已锁定，-2 单延期风险转入日终复盘',
    summary: `${current.summary} 晨会已确认全部责任动作，排产保护、采购承诺、设备窗口和治理审计均已回写。`,
    actions: current.actions.map(action => ({
      ...action,
      result: {
        'AI 排产': '已锁定 WO-2026-0042 / WO-RUSH-9001 承诺窗口，CNC-003 分流和夜班加班进入排产复核。',
        '采购协同': 'AL-6061 替代承诺已确认，采购承诺进入 OTD 复盘口径。',
        '设备维护': 'CNC-001 维护窗口与 CNC-003 分流能力已确认，瓶颈设备风险降级。',
        '系统治理': '晨会复核结论已进入 Agent 治理、报表证据链和审计回放。',
      }[action.module] ?? `${action.module} 责任动作已确认闭环。`,
    })),
    closedAt,
    closureAuditId: 'AUD-RISK-SLA-CLOSURE-20260521',
    closureTraceId: 'TRACE-RISK-SLA-DAILY-REVIEW-CLOSED-20260521',
    closureSummary: `${actor} 已确认 ${current.reviewMeetingId} 的 ${current.actions.length} 项责任动作全部闭环，未关闭项转入日终复盘跟踪。`,
  }

  window.localStorage.setItem(RISK_SLA_REVIEW_KEY, JSON.stringify(record))
  void import('../api/riskEvidence')
    .then(({ upsertRiskSlaReview }) => upsertRiskSlaReview(record))
    .catch(() => undefined)
  upsertOtdEvidenceChainRecord({
    id: record.id,
    stage: '风险 SLA 复核',
    title: record.title,
    summary: `${record.closureSummary} ${record.otdImpact}。`,
    object: record.affectedOrders,
    source: `风险处置队列 / ${actor}`,
    traceId: record.closureTraceId ?? record.traceId,
    status: 'closed',
    statusLabel: record.statusLabel,
    createdAt: closedAt,
  })

  return record
}
