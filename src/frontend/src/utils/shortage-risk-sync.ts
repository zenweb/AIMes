const SHORTAGE_RISK_SYNC_KEY = 'aimes_shortage_risk_resolution'
const SHORTAGE_KITTING_EVENT_KEY = 'aimes_shortage_kitting_event'
const SUPPLY_RISK_ESCALATION_KEY = 'aimes_supply_risk_escalation'
const SUPPLIER_NETWORK_DECISION_KEY = 'aimes_supplier_network_decision'

export interface ShortageRiskResolution {
  materialCode: string
  materialName: string
  affectedOrders: string
  sourceOrderNumber: string
  receivedQuantity: number
  unit: string
  availableQuantity: number
  resolvedAt: string
  message: string
}

export interface ShortageKittingEvent {
  materialCode: string
  materialName: string
  workOrderNumber: string
  affectedOrders: string
  requiredQuantity: number
  availableQuantity: number
  inboundQuantity: number
  shortageQuantity: number
  window: string
  suggestion: string
  createdAt: string
}

export interface SupplyRiskEscalation {
  purchaseOrderNumber: string
  materialCode: string
  materialName: string
  supplierName: string
  originalDeliveryDate: string
  promisedDeliveryDate: string
  delayDays: number
  affectedOrders: string
  alternateSupplierName: string
  alternatePromiseDate: string
  decision: 'escalated' | 'alternate_committed' | 'alternate_received'
  statusLabel: string
  auditId: string
  traceId: string
  message: string
  createdAt: string
  receivedAt?: string
  receivedQuantity?: number
  receiptAuditId?: string
  receiptTraceId?: string
  receiptMessage?: string
}

export interface SupplierNetworkCandidate {
  supplierName: string
  promiseDate: string
  quotedPrice: number
  capacityQuantity: number
  onTimeRate: number
  defectRate: number
  performanceScore: number
  slaLeadTimeHours: number
  slaStatus: 'breached' | 'watch' | 'healthy'
  riskNote: string
}

export interface SupplierNetworkDecision {
  materialCode: string
  materialName: string
  affectedOrders: string
  selectedSupplierName: string
  selectedPromiseDate: string
  selectedPerformanceScore: number
  selectedOnTimeRate: number
  selectedQuotedPrice: number
  selectedCapacityQuantity: number
  candidates: SupplierNetworkCandidate[]
  statusLabel: string
  auditId: string
  traceId: string
  message: string
  createdAt: string
}

export function writeShortageRiskResolution(resolution: ShortageRiskResolution) {
  if (typeof localStorage === 'undefined') return
  localStorage.setItem(SHORTAGE_RISK_SYNC_KEY, JSON.stringify(resolution))
}

export function readShortageRiskResolution(): ShortageRiskResolution | null {
  if (typeof localStorage === 'undefined') return null
  const raw = localStorage.getItem(SHORTAGE_RISK_SYNC_KEY)
  if (!raw) return null

  try {
    return JSON.parse(raw) as ShortageRiskResolution
  } catch {
    localStorage.removeItem(SHORTAGE_RISK_SYNC_KEY)
    return null
  }
}

export function writeShortageKittingEvent(event: ShortageKittingEvent) {
  if (typeof localStorage === 'undefined') return
  localStorage.setItem(SHORTAGE_KITTING_EVENT_KEY, JSON.stringify(event))
}

export function readShortageKittingEvent(): ShortageKittingEvent | null {
  if (typeof localStorage === 'undefined') return null
  const raw = localStorage.getItem(SHORTAGE_KITTING_EVENT_KEY)
  if (!raw) return null

  try {
    return JSON.parse(raw) as ShortageKittingEvent
  } catch {
    localStorage.removeItem(SHORTAGE_KITTING_EVENT_KEY)
    return null
  }
}

export function writeSupplyRiskEscalation(record: SupplyRiskEscalation) {
  if (typeof localStorage === 'undefined') return
  localStorage.setItem(SUPPLY_RISK_ESCALATION_KEY, JSON.stringify(record))
}

export function readSupplyRiskEscalation(): SupplyRiskEscalation | null {
  if (typeof localStorage === 'undefined') return null
  const raw = localStorage.getItem(SUPPLY_RISK_ESCALATION_KEY)
  if (!raw) return null

  try {
    return JSON.parse(raw) as SupplyRiskEscalation
  } catch {
    localStorage.removeItem(SUPPLY_RISK_ESCALATION_KEY)
    return null
  }
}

export function writeSupplierNetworkDecision(record: SupplierNetworkDecision) {
  if (typeof localStorage === 'undefined') return
  localStorage.setItem(SUPPLIER_NETWORK_DECISION_KEY, JSON.stringify(record))
}

export function readSupplierNetworkDecision(): SupplierNetworkDecision | null {
  if (typeof localStorage === 'undefined') return null
  const raw = localStorage.getItem(SUPPLIER_NETWORK_DECISION_KEY)
  if (!raw) return null

  try {
    return JSON.parse(raw) as SupplierNetworkDecision
  } catch {
    localStorage.removeItem(SUPPLIER_NETWORK_DECISION_KEY)
    return null
  }
}

export function matchesShortageMaterial(sourceCode: string, targetCode: string) {
  const normalize = (value: string) => value.replace(/^M-/, '').replace(/-/g, '').toLowerCase()
  return normalize(targetCode).includes(normalize(sourceCode))
}
