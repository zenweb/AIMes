import { upsertOtdEvidenceChainRecord } from './otd-evidence-chain-sync'

const RISK_ACTION_TRACE_KEY = 'aimes_risk_action_traces'

export type RiskActionTraceStatus = 'assigned' | 'escalated' | 'closed'

export interface RiskActionTrace {
  id: string
  title: string
  type: string
  status: RiskActionTraceStatus
  statusLabel: string
  owner: string
  workOrders: string
  deliveryImpact: string
  suggestion: string
  trace: string
  createdAt: string
}

function canUseStorage() {
  return typeof window !== 'undefined' && !!window.localStorage
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0
}

function isRiskActionTrace(value: unknown): value is RiskActionTrace {
  if (!value || typeof value !== 'object') return false
  const candidate = value as Partial<RiskActionTrace>
  return isNonEmptyString(candidate.id)
    && isNonEmptyString(candidate.title)
    && isNonEmptyString(candidate.type)
    && ['assigned', 'escalated', 'closed'].includes(String(candidate.status))
    && isNonEmptyString(candidate.statusLabel)
    && isNonEmptyString(candidate.owner)
    && isNonEmptyString(candidate.workOrders)
    && isNonEmptyString(candidate.deliveryImpact)
    && isNonEmptyString(candidate.suggestion)
    && isNonEmptyString(candidate.trace)
    && isNonEmptyString(candidate.createdAt)
}

function readRawTraces(): RiskActionTrace[] {
  if (!canUseStorage()) return []
  try {
    const raw = window.localStorage.getItem(RISK_ACTION_TRACE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) {
      window.localStorage.removeItem(RISK_ACTION_TRACE_KEY)
      return []
    }
    const records = parsed.filter(isRiskActionTrace)
    if (records.length !== parsed.length) {
      if (records.length) {
        window.localStorage.setItem(RISK_ACTION_TRACE_KEY, JSON.stringify(records))
      } else {
        window.localStorage.removeItem(RISK_ACTION_TRACE_KEY)
      }
    }
    return records
  } catch {
    window.localStorage.removeItem(RISK_ACTION_TRACE_KEY)
    return []
  }
}

export function readRiskActionTraces(): RiskActionTrace[] {
  return readRawTraces()
}

export async function readRiskActionTracesBackendFirst(options?: { failLoud?: boolean }): Promise<RiskActionTrace[]> {
  try {
    const { queryRiskActionTraces } = await import('../api/riskEvidence')
    const traces = await queryRiskActionTraces(12, options)
    if (!Array.isArray(traces)) {
      throw new Error('后端返回非数组风险动作审计载荷')
    }
    const completeTraces = traces.filter(isRiskActionTrace)
    return completeTraces.length > 0 ? completeTraces : readRiskActionTraces()
  } catch (error: unknown) {
    if (options?.failLoud) throw error
    return readRiskActionTraces()
  }
}

export function appendRiskActionTrace(trace: RiskActionTrace) {
  if (!canUseStorage()) return []
  const existing = readRawTraces().filter(item => item.id !== trace.id || item.status !== trace.status)
  const next = [trace, ...existing].slice(0, 12)
  window.localStorage.setItem(RISK_ACTION_TRACE_KEY, JSON.stringify(next))
  void import('../api/riskEvidence')
    .then(({ upsertRiskActionTrace }) => upsertRiskActionTrace(trace))
    .catch(() => undefined)
  upsertOtdEvidenceChainRecord({
    id: `risk-action-${trace.id}`,
    stage: '现场处置',
    title: trace.title,
    summary: trace.trace,
    object: trace.workOrders,
    source: `风险处置队列 / ${trace.owner}`,
    traceId: trace.deliveryImpact,
    status: trace.status === 'closed' ? 'closed' : 'active',
    statusLabel: trace.statusLabel,
    createdAt: trace.createdAt,
  })
  return next
}
