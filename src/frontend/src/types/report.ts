export interface ReportDashboard {
  production: ProductionSummary
  quality: QualitySummary
  equipment: EquipmentSummary
  anomaly: AnomalySummary
  otdImprovement?: OtdImprovementReport
  pocEvaluation?: PocEvaluationTemplate
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

export interface OtdImprovementReport {
  demoDatasetSize: number
  baselineOtd: number
  agentOtd: number
  otdLift: number
  baselineDelayedOrders: number
  agentDelayedOrders: number
  delayedOrdersReduced: number
  changeoverMinutesReduced: number
  protectedRushOrders: number
  decisionTraceCount: number
  headline: string
  reasons: OtdImprovementReason[]
  demoPath: string[]
  sampleOrders: OtdDemoOrder[]
}

export interface OtdImprovementReason {
  label: string
  contribution: string
}

export interface OtdDemoOrder {
  orderNumber: string
  productName: string
  dueDate: string
  baselineStatus: 'on_time' | 'delayed'
  agentStatus: 'on_time' | 'delayed' | 'recovered'
  risk: string
  action: string
}

export interface PocEvaluationTemplate {
  title: string
  targetCustomer: string
  duration: string
  passScore: number
  dimensions: PocEvaluationDimension[]
  evidenceChecklist: PocEvidenceItem[]
  demoChecklist: PocDemoStep[]
}

export interface PocEvaluationDimension {
  name: string
  weight: number
  actualScore?: number
  target: string
  evidence: string
  gap?: string
}

export interface PocEvidenceItem {
  item: string
  owner: string
  status: 'ready' | 'pending'
}

export interface PocDemoStep {
  step: string
  proof: string
  done: boolean
}
