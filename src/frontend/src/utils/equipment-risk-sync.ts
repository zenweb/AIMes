const EQUIPMENT_DOWNTIME_EVENT_KEY = 'aimes_equipment_downtime_event'
const CUSTOMER_EQUIPMENT_FAULT_KEY = 'aimes_customer_equipment_fault_evidence'

export interface EquipmentDowntimeEvent {
  equipmentCode: string
  equipmentName: string
  downtimeHours: number
  affectedOrders: string
  alternativeEquipment: string
  maintenanceWindow: string
  protectionStrategy: string
  createdAt: string
}

export interface CustomerEquipmentFaultEvidence {
  batchId: string
  fileName: string
  source: string
  equipmentCode: string
  faultSamples: number
  affectedOrders: string
  downtimeHours: number
  capturedSignals: string[]
  preparedAt: string
}

export function writeEquipmentDowntimeEvent(event: EquipmentDowntimeEvent) {
  if (typeof localStorage === 'undefined') return
  localStorage.setItem(EQUIPMENT_DOWNTIME_EVENT_KEY, JSON.stringify(event))
  void import('../api/equipmentEvidence')
    .then(({ upsertEquipmentDowntime }) => upsertEquipmentDowntime(event))
    .catch(() => undefined)
}

export function readEquipmentDowntimeEvent(): EquipmentDowntimeEvent | null {
  if (typeof localStorage === 'undefined') return null
  const raw = localStorage.getItem(EQUIPMENT_DOWNTIME_EVENT_KEY)
  if (!raw) return null

  try {
    const parsed = JSON.parse(raw)
    if (isEquipmentDowntimeEvent(parsed)) {
      return parsed
    }
    localStorage.removeItem(EQUIPMENT_DOWNTIME_EVENT_KEY)
    return null
  } catch {
    localStorage.removeItem(EQUIPMENT_DOWNTIME_EVENT_KEY)
    return null
  }
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value)
}

function isEquipmentDowntimeEvent(value: unknown): value is EquipmentDowntimeEvent {
  if (!value || typeof value !== 'object') return false
  const candidate = value as Partial<EquipmentDowntimeEvent>
  return isNonEmptyString(candidate.equipmentCode)
    && isNonEmptyString(candidate.equipmentName)
    && isFiniteNumber(candidate.downtimeHours)
    && isNonEmptyString(candidate.affectedOrders)
    && isNonEmptyString(candidate.alternativeEquipment)
    && isNonEmptyString(candidate.maintenanceWindow)
    && isNonEmptyString(candidate.protectionStrategy)
    && isNonEmptyString(candidate.createdAt)
}

function isCustomerEquipmentFaultEvidence(value: unknown): value is CustomerEquipmentFaultEvidence {
  if (!value || typeof value !== 'object') return false
  const candidate = value as Partial<CustomerEquipmentFaultEvidence>
  return isNonEmptyString(candidate.batchId)
    && isNonEmptyString(candidate.fileName)
    && isNonEmptyString(candidate.source)
    && isNonEmptyString(candidate.equipmentCode)
    && isFiniteNumber(candidate.faultSamples)
    && isNonEmptyString(candidate.affectedOrders)
    && isFiniteNumber(candidate.downtimeHours)
    && Array.isArray(candidate.capturedSignals)
    && candidate.capturedSignals.length > 0
    && candidate.capturedSignals.every(isNonEmptyString)
    && isNonEmptyString(candidate.preparedAt)
}

export async function readEquipmentDowntimeEventBackendFirst(): Promise<EquipmentDowntimeEvent | null> {
  try {
    const { getLatestEquipmentDowntime } = await import('../api/equipmentEvidence')
    return await getLatestEquipmentDowntime() ?? readEquipmentDowntimeEvent()
  } catch {
    return readEquipmentDowntimeEvent()
  }
}

export function writeCustomerEquipmentFaultEvidence(evidence?: Partial<CustomerEquipmentFaultEvidence>) {
  if (typeof localStorage === 'undefined') return null
  const next: CustomerEquipmentFaultEvidence = {
    batchId: evidence?.batchId ?? 'IMP-POC-EQ-FAULT-20260520-001',
    fileName: evidence?.fileName ?? '客户真实设备故障样例_CNC-001.csv',
    source: evidence?.source ?? '客户设备联网平台 / 点检历史导出',
    equipmentCode: evidence?.equipmentCode ?? 'CNC-001',
    faultSamples: evidence?.faultSamples ?? 12,
    affectedOrders: evidence?.affectedOrders ?? 'WO-2026-0042 / WO-RUSH-9001 / WO-DEMO-1001',
    downtimeHours: evidence?.downtimeHours ?? 4,
    capturedSignals: evidence?.capturedSignals ?? ['主轴振动', '轴承温度', '停机时长', '维修工单', '影响工单'],
    preparedAt: evidence?.preparedAt ?? new Date().toISOString(),
  }
  localStorage.setItem(CUSTOMER_EQUIPMENT_FAULT_KEY, JSON.stringify(next))
  void import('../api/equipmentEvidence')
    .then(({ upsertCustomerEquipmentFault }) => upsertCustomerEquipmentFault(next))
    .catch(() => undefined)
  return next
}

export function readCustomerEquipmentFaultEvidence(): CustomerEquipmentFaultEvidence | null {
  if (typeof localStorage === 'undefined') return null
  const raw = localStorage.getItem(CUSTOMER_EQUIPMENT_FAULT_KEY)
  if (!raw) return null

  try {
    const parsed = JSON.parse(raw)
    if (isCustomerEquipmentFaultEvidence(parsed)) {
      return parsed
    }
    localStorage.removeItem(CUSTOMER_EQUIPMENT_FAULT_KEY)
    return null
  } catch {
    localStorage.removeItem(CUSTOMER_EQUIPMENT_FAULT_KEY)
    return null
  }
}

export async function readCustomerEquipmentFaultEvidenceBackendFirst(): Promise<CustomerEquipmentFaultEvidence | null> {
  try {
    const { getLatestCustomerEquipmentFault } = await import('../api/equipmentEvidence')
    return await getLatestCustomerEquipmentFault() ?? readCustomerEquipmentFaultEvidence()
  } catch {
    return readCustomerEquipmentFaultEvidence()
  }
}
