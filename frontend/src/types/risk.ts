export interface RiskDashboardDto {
  counts: RiskCountsDto
  orderRisks: OrderRiskDto[]
  equipmentRisks: EquipmentRiskDto[]
  materialRisks: MaterialRiskDto[]
  bottleneckRisks: BottleneckRiskDto[]
  generatedAt: string
}

export interface RiskCountsDto {
  critical: number
  warning: number
  healthy: number
  total: number
}

export interface OrderRiskDto {
  id: string
  orderNumber: string
  productName: string
  progress: number
  dueDate: string
  gapText: string
  level: string
  riskDetail: string
}

export interface EquipmentRiskDto {
  id: string
  equipmentName: string
  type: string
  healthScore: number
  lastMaintenance: string
  daysSinceMaintenance: number
  level: string
  riskDetail: string
}

export interface MaterialRiskDto {
  code: string
  materialName: string
  materialCode: string
  available: number
  required: number
  stockPercent: number
  affectedOrders: string
  level: string
  riskDetail: string
}

export interface BottleneckRiskDto {
  id: string
  equipmentName: string
  type: string
  utilization: number
  queueOrders: number
  queueHours: number
  level: string
  riskDetail: string
}
