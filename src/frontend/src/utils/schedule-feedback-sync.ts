import { upsertOtdEvidenceChainRecord } from './otd-evidence-chain-sync'

const SCHEDULE_FEEDBACK_KEY = 'aimes_schedule_feedback_snapshot'

export interface ScheduleFeedbackSnapshot {
  decision: 'accepted' | 'rejected'
  decisionLabel: string
  reasonCategory: string
  categoryLabel: string
  reasonDetail: string
  objectiveLabel: string
  createdAt: string
  traceId: string
}

function canUseStorage() {
  return typeof window !== 'undefined' && !!window.localStorage
}

export function writeScheduleFeedbackSnapshot(input: Omit<ScheduleFeedbackSnapshot, 'traceId'> & { traceId?: string }) {
  if (!canUseStorage()) return null
  const record: ScheduleFeedbackSnapshot = {
    ...input,
    traceId: input.traceId ?? `TRACE-SCH-FEEDBACK-${Date.now()}`,
  }
  window.localStorage.setItem(SCHEDULE_FEEDBACK_KEY, JSON.stringify(record))
  upsertOtdEvidenceChainRecord({
    id: 'schedule-feedback',
    stage: '人工采纳',
    title: record.decisionLabel,
    summary: `${record.categoryLabel}：${record.reasonDetail}`,
    object: record.objectiveLabel,
    source: 'AI 排产 / 人机协同复盘',
    traceId: record.traceId,
    status: record.decision === 'accepted' ? 'ready' : 'active',
    statusLabel: record.decision === 'accepted' ? '已采纳' : '已拒绝',
    createdAt: record.createdAt,
  })
  return record
}

export function readScheduleFeedbackSnapshot(): ScheduleFeedbackSnapshot | null {
  if (!canUseStorage()) return null
  try {
    const raw = window.localStorage.getItem(SCHEDULE_FEEDBACK_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    return parsed?.decisionLabel && parsed?.reasonDetail ? parsed : null
  } catch {
    window.localStorage.removeItem(SCHEDULE_FEEDBACK_KEY)
    return null
  }
}
