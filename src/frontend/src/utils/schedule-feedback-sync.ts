import { upsertOtdEvidenceChainRecord } from './otd-evidence-chain-sync'

const SCHEDULE_FEEDBACK_KEY = 'aimes_schedule_feedback_snapshot'

export interface ScheduleFeedbackSnapshot {
  decision: 'accepted' | 'rejected'
  decisionLabel: string
  reasonCategory: string
  categoryLabel: string
  reasonDetail?: string
  objectiveLabel: string
  createdAt: string
  traceId?: string
  source?: 'backend' | 'local'
  agentDecisionId?: string
}

function canUseStorage() {
  return typeof window !== 'undefined' && !!window.localStorage
}

export function writeScheduleFeedbackSnapshot(input: Omit<ScheduleFeedbackSnapshot, 'traceId'> & { traceId?: string }) {
  if (!canUseStorage()) return null
  const record: ScheduleFeedbackSnapshot = {
    ...input,
    traceId: input.traceId ?? `TRACE-SCH-FEEDBACK-${Date.now()}`,
    source: 'local',
  }
  window.localStorage.setItem(SCHEDULE_FEEDBACK_KEY, JSON.stringify(record))
  upsertOtdEvidenceChainRecord({
    id: 'schedule-feedback',
    stage: '人工采纳',
    title: record.decisionLabel,
    summary: `${record.categoryLabel}：${record.reasonDetail}`,
    object: record.objectiveLabel,
    source: 'AI 排产 / 人机协同复盘',
    traceId: record.traceId ?? `TRACE-SCH-FEEDBACK-${Date.now()}`,
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
    if (isScheduleFeedbackSnapshot(parsed)) {
      return parsed
    }
    window.localStorage.removeItem(SCHEDULE_FEEDBACK_KEY)
    return null
  } catch {
    window.localStorage.removeItem(SCHEDULE_FEEDBACK_KEY)
    return null
  }
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0
}

function isScheduleDecision(value: unknown): value is ScheduleFeedbackSnapshot['decision'] {
  return value === 'accepted' || value === 'rejected'
}

function isScheduleFeedbackSnapshot(value: unknown): value is ScheduleFeedbackSnapshot {
  if (!value || typeof value !== 'object') return false
  const candidate = value as Partial<ScheduleFeedbackSnapshot>
  return isScheduleDecision(candidate.decision)
    && isNonEmptyString(candidate.decisionLabel)
    && isNonEmptyString(candidate.reasonCategory)
    && isNonEmptyString(candidate.categoryLabel)
    && isNonEmptyString(candidate.reasonDetail)
    && isNonEmptyString(candidate.objectiveLabel)
    && isNonEmptyString(candidate.createdAt)
}
