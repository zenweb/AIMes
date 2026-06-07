const SHORTAGE_RISK_SYNC_KEY = 'aimes_shortage_risk_resolution'
const SHORTAGE_KITTING_EVENT_KEY = 'aimes_shortage_kitting_event'
const BOM_KITTING_PACKAGE_KEY = 'aimes_bom_kitting_package'
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

export interface BomKittingPackageItem {
  materialCode: string
  materialName: string
  requiredQuantity: number
  availableQuantity: number
  inboundQuantity: number
  shortageQuantity: number
  unit: string
  action: string
}

export interface BomKittingPackage {
  id: string
  bomCode: string
  bomVersion: string
  productName: string
  workOrderNumber: string
  scheduleWindow: string
  statusLabel: string
  owner: string
  auditId: string
  traceId: string
  createdAt: string
  summary: string
  items: BomKittingPackageItem[]
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
  void import('../api/shortageEvidence')
    .then(({ upsertShortageRiskResolution }) => upsertShortageRiskResolution(resolution))
    .catch(() => undefined)
}

export function readShortageRiskResolution(): ShortageRiskResolution | null {
  if (typeof localStorage === 'undefined') return null
  const raw = localStorage.getItem(SHORTAGE_RISK_SYNC_KEY)
  if (!raw) return null

  try {
    const parsed = JSON.parse(raw)
    if (isShortageRiskResolution(parsed)) {
      return parsed
    }
    localStorage.removeItem(SHORTAGE_RISK_SYNC_KEY)
    return null
  } catch {
    localStorage.removeItem(SHORTAGE_RISK_SYNC_KEY)
    return null
  }
}

export async function readShortageRiskResolutionBackendFirst(): Promise<ShortageRiskResolution | null> {
  try {
    const { getLatestShortageRiskResolution } = await import('../api/shortageEvidence')
    return await getLatestShortageRiskResolution() ?? readShortageRiskResolution()
  } catch {
    return readShortageRiskResolution()
  }
}

export function writeShortageKittingEvent(event: ShortageKittingEvent) {
  if (typeof localStorage === 'undefined') return
  localStorage.setItem(SHORTAGE_KITTING_EVENT_KEY, JSON.stringify(event))
  void import('../api/shortageEvidence')
    .then(({ upsertShortageKitting }) => upsertShortageKitting(event))
    .catch(() => undefined)
}

export function readShortageKittingEvent(): ShortageKittingEvent | null {
  if (typeof localStorage === 'undefined') return null
  const raw = localStorage.getItem(SHORTAGE_KITTING_EVENT_KEY)
  if (!raw) return null

  try {
    const parsed = JSON.parse(raw)
    if (isShortageKittingEvent(parsed)) {
      return parsed
    }
    localStorage.removeItem(SHORTAGE_KITTING_EVENT_KEY)
    return null
  } catch {
    localStorage.removeItem(SHORTAGE_KITTING_EVENT_KEY)
    return null
  }
}

export async function readShortageKittingEventBackendFirst(): Promise<ShortageKittingEvent | null> {
  try {
    const { getLatestShortageKitting } = await import('../api/shortageEvidence')
    return await getLatestShortageKitting() ?? readShortageKittingEvent()
  } catch {
    return readShortageKittingEvent()
  }
}

export function writeBomKittingPackage(record: BomKittingPackage) {
  if (typeof localStorage === 'undefined') return
  localStorage.setItem(BOM_KITTING_PACKAGE_KEY, JSON.stringify(record))
  void import('../api/shortageEvidence')
    .then(({ upsertBomKittingPackage }) => upsertBomKittingPackage(record))
    .catch(() => undefined)
  const shortageItem = record.items.find(item => item.shortageQuantity > 0)
  if (!shortageItem) return

  writeShortageKittingEvent({
    materialCode: shortageItem.materialCode,
    materialName: shortageItem.materialName,
    workOrderNumber: record.workOrderNumber,
    affectedOrders: record.summary || record.workOrderNumber,
    requiredQuantity: shortageItem.requiredQuantity,
    availableQuantity: shortageItem.availableQuantity,
    inboundQuantity: shortageItem.inboundQuantity,
    shortageQuantity: shortageItem.shortageQuantity,
    window: record.scheduleWindow,
    suggestion: record.items.map(item => item.action).join('；'),
    createdAt: record.createdAt,
  })
}

export function readBomKittingPackage(): BomKittingPackage | null {
  if (typeof localStorage === 'undefined') return null
  const raw = localStorage.getItem(BOM_KITTING_PACKAGE_KEY)
  if (!raw) return null

  try {
    const parsed = JSON.parse(raw)
    if (isBomKittingPackage(parsed)) {
      return parsed
    }
    localStorage.removeItem(BOM_KITTING_PACKAGE_KEY)
    return null
  } catch {
    localStorage.removeItem(BOM_KITTING_PACKAGE_KEY)
    return null
  }
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value)
}

function isShortageRiskResolution(item: unknown): item is ShortageRiskResolution {
  if (!item || typeof item !== 'object') return false
  const candidate = item as Partial<ShortageRiskResolution>
  return isNonEmptyString(candidate.materialCode)
    && isNonEmptyString(candidate.materialName)
    && isNonEmptyString(candidate.affectedOrders)
    && isNonEmptyString(candidate.sourceOrderNumber)
    && isFiniteNumber(candidate.receivedQuantity)
    && isNonEmptyString(candidate.unit)
    && isFiniteNumber(candidate.availableQuantity)
    && isNonEmptyString(candidate.resolvedAt)
    && isNonEmptyString(candidate.message)
}

function isShortageKittingEvent(item: unknown): item is ShortageKittingEvent {
  if (!item || typeof item !== 'object') return false
  const candidate = item as Partial<ShortageKittingEvent>
  return isNonEmptyString(candidate.materialCode)
    && isNonEmptyString(candidate.materialName)
    && isNonEmptyString(candidate.workOrderNumber)
    && isNonEmptyString(candidate.affectedOrders)
    && isFiniteNumber(candidate.requiredQuantity)
    && isFiniteNumber(candidate.availableQuantity)
    && isFiniteNumber(candidate.inboundQuantity)
    && isFiniteNumber(candidate.shortageQuantity)
    && isNonEmptyString(candidate.window)
    && isNonEmptyString(candidate.suggestion)
    && isNonEmptyString(candidate.createdAt)
}

function isBomKittingPackageItem(item: unknown): item is BomKittingPackageItem {
  if (!item || typeof item !== 'object') return false
  const candidate = item as Partial<BomKittingPackageItem>
  return isNonEmptyString(candidate.materialCode)
    && isNonEmptyString(candidate.materialName)
    && isFiniteNumber(candidate.requiredQuantity)
    && isFiniteNumber(candidate.availableQuantity)
    && isFiniteNumber(candidate.inboundQuantity)
    && isFiniteNumber(candidate.shortageQuantity)
    && isNonEmptyString(candidate.unit)
    && isNonEmptyString(candidate.action)
}

function isBomKittingPackage(item: unknown): item is BomKittingPackage {
  if (!item || typeof item !== 'object') return false
  const candidate = item as Partial<BomKittingPackage>
  return isNonEmptyString(candidate.id)
    && isNonEmptyString(candidate.bomCode)
    && isNonEmptyString(candidate.bomVersion)
    && isNonEmptyString(candidate.productName)
    && isNonEmptyString(candidate.workOrderNumber)
    && isNonEmptyString(candidate.scheduleWindow)
    && isNonEmptyString(candidate.statusLabel)
    && isNonEmptyString(candidate.owner)
    && isNonEmptyString(candidate.auditId)
    && isNonEmptyString(candidate.traceId)
    && isNonEmptyString(candidate.createdAt)
    && isNonEmptyString(candidate.summary)
    && Array.isArray(candidate.items)
    && candidate.items.length > 0
    && candidate.items.every(isBomKittingPackageItem)
}

function isSupplyRiskDecision(value: unknown): value is SupplyRiskEscalation['decision'] {
  return value === 'escalated'
    || value === 'alternate_committed'
    || value === 'alternate_received'
}

function isSupplyRiskEscalation(item: unknown): item is SupplyRiskEscalation {
  if (!item || typeof item !== 'object') return false
  const candidate = item as Partial<SupplyRiskEscalation>
  return isNonEmptyString(candidate.purchaseOrderNumber)
    && isNonEmptyString(candidate.materialCode)
    && isNonEmptyString(candidate.materialName)
    && isNonEmptyString(candidate.supplierName)
    && isNonEmptyString(candidate.originalDeliveryDate)
    && isNonEmptyString(candidate.promisedDeliveryDate)
    && isFiniteNumber(candidate.delayDays)
    && isNonEmptyString(candidate.affectedOrders)
    && isNonEmptyString(candidate.alternateSupplierName)
    && isNonEmptyString(candidate.alternatePromiseDate)
    && isSupplyRiskDecision(candidate.decision)
    && isNonEmptyString(candidate.statusLabel)
    && isNonEmptyString(candidate.auditId)
    && isNonEmptyString(candidate.traceId)
    && isNonEmptyString(candidate.message)
    && isNonEmptyString(candidate.createdAt)
}

function isSlaStatus(value: unknown): value is SupplierNetworkCandidate['slaStatus'] {
  return value === 'breached'
    || value === 'watch'
    || value === 'healthy'
}

function isSupplierNetworkCandidate(item: unknown): item is SupplierNetworkCandidate {
  if (!item || typeof item !== 'object') return false
  const candidate = item as Partial<SupplierNetworkCandidate>
  return isNonEmptyString(candidate.supplierName)
    && isNonEmptyString(candidate.promiseDate)
    && isFiniteNumber(candidate.quotedPrice)
    && isFiniteNumber(candidate.capacityQuantity)
    && isFiniteNumber(candidate.onTimeRate)
    && isFiniteNumber(candidate.defectRate)
    && isFiniteNumber(candidate.performanceScore)
    && isFiniteNumber(candidate.slaLeadTimeHours)
    && isSlaStatus(candidate.slaStatus)
    && isNonEmptyString(candidate.riskNote)
}

function isSupplierNetworkDecision(item: unknown): item is SupplierNetworkDecision {
  if (!item || typeof item !== 'object') return false
  const candidate = item as Partial<SupplierNetworkDecision>
  return isNonEmptyString(candidate.materialCode)
    && isNonEmptyString(candidate.materialName)
    && isNonEmptyString(candidate.affectedOrders)
    && isNonEmptyString(candidate.selectedSupplierName)
    && isNonEmptyString(candidate.selectedPromiseDate)
    && isFiniteNumber(candidate.selectedPerformanceScore)
    && isFiniteNumber(candidate.selectedOnTimeRate)
    && isFiniteNumber(candidate.selectedQuotedPrice)
    && isFiniteNumber(candidate.selectedCapacityQuantity)
    && Array.isArray(candidate.candidates)
    && candidate.candidates.length > 0
    && candidate.candidates.every(isSupplierNetworkCandidate)
    && isNonEmptyString(candidate.statusLabel)
    && isNonEmptyString(candidate.auditId)
    && isNonEmptyString(candidate.traceId)
    && isNonEmptyString(candidate.message)
    && isNonEmptyString(candidate.createdAt)
}

export async function readBomKittingPackageBackendFirst(): Promise<BomKittingPackage | null> {
  try {
    const { getLatestBomKittingPackage } = await import('../api/shortageEvidence')
    return await getLatestBomKittingPackage() ?? readBomKittingPackage()
  } catch {
    return readBomKittingPackage()
  }
}

export function writeSupplyRiskEscalation(record: SupplyRiskEscalation) {
  if (typeof localStorage === 'undefined') return
  localStorage.setItem(SUPPLY_RISK_ESCALATION_KEY, JSON.stringify(record))
  void import('../api/shortageEvidence')
    .then(({ upsertSupplyRiskEscalation }) => upsertSupplyRiskEscalation(record))
    .catch(() => undefined)
}

export function readSupplyRiskEscalation(): SupplyRiskEscalation | null {
  if (typeof localStorage === 'undefined') return null
  const raw = localStorage.getItem(SUPPLY_RISK_ESCALATION_KEY)
  if (!raw) return null

  try {
    const parsed = JSON.parse(raw)
    if (isSupplyRiskEscalation(parsed)) {
      return parsed
    }
    localStorage.removeItem(SUPPLY_RISK_ESCALATION_KEY)
    return null
  } catch {
    localStorage.removeItem(SUPPLY_RISK_ESCALATION_KEY)
    return null
  }
}

export async function readSupplyRiskEscalationBackendFirst(): Promise<SupplyRiskEscalation | null> {
  try {
    const { getLatestSupplyRiskEscalation } = await import('../api/shortageEvidence')
    return await getLatestSupplyRiskEscalation() ?? readSupplyRiskEscalation()
  } catch {
    return readSupplyRiskEscalation()
  }
}

export function writeSupplierNetworkDecision(record: SupplierNetworkDecision) {
  if (typeof localStorage === 'undefined') return
  localStorage.setItem(SUPPLIER_NETWORK_DECISION_KEY, JSON.stringify(record))
  void import('../api/shortageEvidence')
    .then(({ upsertSupplierNetworkDecision }) => upsertSupplierNetworkDecision(record))
    .catch(() => undefined)
}

export function readSupplierNetworkDecision(): SupplierNetworkDecision | null {
  if (typeof localStorage === 'undefined') return null
  const raw = localStorage.getItem(SUPPLIER_NETWORK_DECISION_KEY)
  if (!raw) return null

  try {
    const parsed = JSON.parse(raw)
    if (isSupplierNetworkDecision(parsed)) {
      return parsed
    }
    localStorage.removeItem(SUPPLIER_NETWORK_DECISION_KEY)
    return null
  } catch {
    localStorage.removeItem(SUPPLIER_NETWORK_DECISION_KEY)
    return null
  }
}

export async function readSupplierNetworkDecisionBackendFirst(): Promise<SupplierNetworkDecision | null> {
  try {
    const { getLatestSupplierNetworkDecision } = await import('../api/shortageEvidence')
    return await getLatestSupplierNetworkDecision() ?? readSupplierNetworkDecision()
  } catch {
    return readSupplierNetworkDecision()
  }
}

export function matchesShortageMaterial(sourceCode: string, targetCode: string) {
  const normalize = (value: string) => value.replace(/^M-/, '').replace(/-/g, '').toLowerCase()
  return normalize(targetCode).includes(normalize(sourceCode))
}
