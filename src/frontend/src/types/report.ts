export interface ReportDashboard {
  production: ProductionSummary
  quality: QualitySummary
  equipment: EquipmentSummary
  anomaly: AnomalySummary
}

export interface ProductionSummary {
  totalWorkOrders: number
  completedOrders: number
  inProgressOrders: number
  onTimeRate: number
  dailyOutput: ChartDataPoint[]
}

export interface QualitySummary {
  passRate: number
  defectRate: number
  totalInspections: number
  defectCount: number
  dailyDefects: ChartDataPoint[]
}

export interface EquipmentSummary {
  totalEquipment: number
  runningCount: number
  utilizationRate: number
  availabilityRate: number
  utilizationTrend: ChartDataPoint[]
}

export interface AnomalySummary {
  totalAnomalies: number
  openCount: number
  resolvedCount: number
  avgResolveHours: number
  anomalyByType: ChartDataPoint[]
}

export interface ChartDataPoint {
  label: string
  value: number
}
