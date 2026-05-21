import type { ProductionAnomaly, ProductionAnomalyDetail } from '../types/anomaly'

const STORAGE_KEY = 'aimes_production_anomaly_event'

export interface ProductionAnomalyEvent {
  id: string
  workOrderNumber: string
  operationCode: string
  operationName: string
  equipmentId: string | null
  anomalyType: string
  severity: string
  title: string
  description: string
  detectedAt: string
  detectedBy: string
  suggestedAction: string
}

export function writeProductionAnomalyEvent(event: ProductionAnomalyEvent) {
  if (typeof localStorage === 'undefined') return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(event))
}

export function readProductionAnomalyEvent(): ProductionAnomalyEvent | null {
  if (typeof localStorage === 'undefined') return null
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw) as ProductionAnomalyEvent
  } catch {
    return null
  }
}

export function toProductionAnomaly(event: ProductionAnomalyEvent): ProductionAnomaly {
  return {
    id: event.id,
    workOrderNumber: event.workOrderNumber,
    operationCode: event.operationCode,
    equipmentId: event.equipmentId,
    anomalyType: event.anomalyType,
    severity: event.severity,
    title: event.title,
    description: event.description,
    detectedAt: event.detectedAt,
    detectedBy: event.detectedBy,
    status: 'Open',
    rootCause: null,
    resolution: null,
    responseCount: 1,
  }
}

export function toProductionAnomalyDetail(event: ProductionAnomalyEvent): ProductionAnomalyDetail {
  return {
    ...toProductionAnomaly(event),
    resolvedAt: null,
    resolvedBy: null,
    responses: [
      {
        id: `${event.id}-ai-response`,
        responseType: 'AiSuggestion',
        description: '生产异常联动建议',
        suggestedAction: event.suggestedAction,
        suggestedBy: 'AI Agent',
        status: 'Pending',
        executedAt: null,
        executedBy: null,
        createdAt: event.detectedAt,
      },
    ],
  }
}
