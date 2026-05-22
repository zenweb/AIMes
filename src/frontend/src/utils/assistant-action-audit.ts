import type { ChatAction } from '../types/knowledge'

const STORAGE_KEY = 'aimes_assistant_action_audits'
const MAX_RECORDS = 12

export interface AssistantActionAuditRecord {
  id: string
  actionId: string
  label: string
  type: ChatAction['type']
  actor: string
  role: string
  targetRoute?: string
  auditCode: string
  traceId?: string
  resultMessage: string
  permitted: boolean
  createdAt: string
}

interface RecordAssistantActionAuditInput {
  action: ChatAction
  actor: string
  role: string
  permitted: boolean
}

function canUseStorage() {
  return typeof window !== 'undefined' && !!window.localStorage
}

function readRawRecords(): AssistantActionAuditRecord[] {
  if (!canUseStorage()) return []
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function readAssistantActionAudits(): AssistantActionAuditRecord[] {
  return readRawRecords()
    .filter(record => record?.id && record?.actionId && record?.auditCode)
    .slice(0, MAX_RECORDS)
}

export function recordAssistantActionAudit(input: RecordAssistantActionAuditInput) {
  if (!canUseStorage()) return

  const { action, actor, role, permitted } = input
  const auditCode = action.auditCode ?? `AUD-CHAT-${Date.now()}`
  const record: AssistantActionAuditRecord = {
    id: `${auditCode}-${Date.now()}`,
    actionId: action.id,
    label: action.label,
    type: action.type,
    actor,
    role,
    targetRoute: action.targetRoute,
    auditCode,
    traceId: action.type === 'delivery_recovery_package'
      ? 'TRACE-CHAT-RECOVERY-WO-RUSH-9001-20260521'
      : action.type === 'create_anomaly_card'
        ? 'TRACE-CHAT-ANOMALY-CNC001-TEMP-20260522'
        : action.type === 'engineering_constraint_package'
          ? 'TRACE-CHAT-ENG-CONSTRAINT-PACKAGE-20260523'
          : undefined,
    resultMessage: action.resultMessage,
    permitted,
    createdAt: new Date().toISOString(),
  }

  const nextRecords = [record, ...readRawRecords()].slice(0, MAX_RECORDS)
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextRecords))
}
