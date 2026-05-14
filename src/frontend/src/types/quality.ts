export interface InspectionDto {
  id: string
  workOrderId: string
  productCode: string
  processName: string
  inspectionPoint: string
  inspectionQuantity: number
  qualifiedQuantity: number
  defectQuantity: number
  result: string
  inspectorId: string
  inspectedAt: string
  passRate: number
}

export interface QualityStatisticsDto {
  totalInspections: number
  passedCount: number
  failedCount: number
  reworkCount: number
  passRate: number
  defectRate: number
  reworkRate: number
}

export interface RootCauseAnalysisDto {
  inspectionId: string
  rootCauses: RootCauseItemDto[]
  correctiveActions: string[]
  preventiveMeasures: string[]
  analysisSummary: string
}

export interface RootCauseItemDto {
  cause: string
  probability: number
  evidence: string
}

export interface SpcAnalysisDto {
  processParameter: string
  hasTrend: boolean
  hasDrift: boolean
  hasCycle: boolean
  isNearLimit: boolean
  trendDirection: string
  recommendedAction: string
  dataPoints: number[]
}

export interface AnomalyDto {
  id: string
  workOrderId: string
  anomalyType: string
  severity: 'critical' | 'major' | 'minor'
  description: string
  status: 'open' | 'investigating' | 'resolved'
  detectedAt: string
  resolvedAt?: string
}
