export interface ProductionAnomaly {
  id: string
  workOrderNumber: string
  operationCode: string
  equipmentId: string | null
  anomalyType: string
  severity: string
  title: string
  description: string
  detectedAt: string
  detectedBy: string | null
  status: string
  rootCause: string | null
  resolution: string | null
  responseCount: number
}

export interface ProductionAnomalyDetail {
  id: string
  workOrderNumber: string
  operationCode: string
  equipmentId: string | null
  anomalyType: string
  severity: string
  title: string
  description: string
  detectedAt: string
  detectedBy: string | null
  status: string
  rootCause: string | null
  resolution: string | null
  resolvedAt: string | null
  resolvedBy: string | null
  responses: ProdAnomalyResponse[]
}

export interface ProdAnomalyResponse {
  id: string
  responseType: string
  description: string
  suggestedAction: string
  suggestedBy: string
  status: string
  executedAt: string | null
  executedBy: string | null
  createdAt: string
}

export interface AnalyzeAnomalyResult {
  anomalyId: string
  title: string
  suggestedRootCause: string | null
  suggestedResolution: string | null
  analysisSummary: string | null
  suggestedActions: AnomalySuggestedAction[]
}

export interface AnomalySuggestedAction {
  action: string
  reason: string
  priority: number
}
