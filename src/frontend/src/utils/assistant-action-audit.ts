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

const ASSISTANT_ACTION_TYPES: Array<ChatAction['type']> = [
  'navigate',
  'schedule_suggestion',
  'export_report',
  'create_anomaly_card',
  'delivery_recovery_package',
  'engineering_constraint_package',
  'customer_commitment_package',
  'bom_kitting_package',
  'equipment_downtime_package',
]

function canUseStorage() {
  return typeof window !== 'undefined' && !!window.localStorage
}

function isAssistantActionType(type: unknown): type is ChatAction['type'] {
  return ASSISTANT_ACTION_TYPES.includes(type as ChatAction['type'])
}

function isAssistantActionAuditRecord(
  record: Partial<AssistantActionAuditRecord> | null | undefined,
): record is AssistantActionAuditRecord {
  return !!record
    && typeof record.id === 'string'
    && typeof record.actionId === 'string'
    && typeof record.label === 'string'
    && isAssistantActionType(record.type)
    && typeof record.actor === 'string'
    && typeof record.role === 'string'
    && (typeof record.targetRoute === 'undefined' || typeof record.targetRoute === 'string')
    && typeof record.auditCode === 'string'
    && (typeof record.traceId === 'undefined' || typeof record.traceId === 'string')
    && typeof record.resultMessage === 'string'
    && typeof record.permitted === 'boolean'
    && typeof record.createdAt === 'string'
}

function readRawRecords(): AssistantActionAuditRecord[] {
  if (!canUseStorage()) return []
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) {
      window.localStorage.removeItem(STORAGE_KEY)
      return []
    }
    const records = parsed.filter(isAssistantActionAuditRecord)
    if (records.length !== parsed.length) {
      if (records.length) {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(records))
      } else {
        window.localStorage.removeItem(STORAGE_KEY)
      }
    }
    return records
  } catch {
    window.localStorage.removeItem(STORAGE_KEY)
    return []
  }
}

export function readAssistantActionAudits(): AssistantActionAuditRecord[] {
  return readRawRecords().slice(0, MAX_RECORDS)
}

export async function readAssistantActionAuditsBackendFirst(options?: { failLoud?: boolean }): Promise<AssistantActionAuditRecord[]> {
  try {
    const { queryAssistantActionAudits } = await import('../api/assistantEvidence')
    const records = await queryAssistantActionAudits(MAX_RECORDS, options)
    if (!Array.isArray(records)) {
      throw new Error('后端返回非数组审计载荷')
    }
    return records.length > 0 ? records : readAssistantActionAudits()
  } catch (error: unknown) {
    if (options?.failLoud) throw error
    return readAssistantActionAudits()
  }
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
          : action.type === 'customer_commitment_package'
            ? 'TRACE-KPI-COMMITMENT-HUADONG-20260521'
            : action.type === 'bom_kitting_package'
              ? 'TRACE-BOM-KIT-BOM-A100-WO-RUSH-9001'
              : action.type === 'equipment_downtime_package'
                ? 'TRACE-EQ-DOWNTIME-CNC-001'
                : undefined,
    resultMessage: action.resultMessage,
    permitted,
    createdAt: new Date().toISOString(),
  }

  const nextRecords = [record, ...readRawRecords()].slice(0, MAX_RECORDS)
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextRecords))
  void import('../api/assistantEvidence')
    .then(({ upsertAssistantActionAudit }) => upsertAssistantActionAudit(record))
    .catch(() => undefined)
}
