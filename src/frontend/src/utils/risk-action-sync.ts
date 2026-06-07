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

function readRawTraces(): RiskActionTrace[] {
  if (!canUseStorage()) return []
  try {
    const raw = window.localStorage.getItem(RISK_ACTION_TRACE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed.filter(item => item?.id && item?.title && item?.trace) : []
  } catch {
    window.localStorage.removeItem(RISK_ACTION_TRACE_KEY)
    return []
  }
}

export function readRiskActionTraces(): RiskActionTrace[] {
  return readRawTraces()
}

export async function readRiskActionTracesBackendFirst(): Promise<RiskActionTrace[]> {
  try {
    const { queryRiskActionTraces } = await import('../api/riskEvidence')
    const traces = await queryRiskActionTraces(12)
    return traces.length > 0 ? traces : readRiskActionTraces()
  } catch {
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
