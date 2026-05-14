export interface EquipmentDto {
  id: string
  equipmentCode: string
  equipmentName: string
  equipmentType?: string
  workshopId: string
  workshopName?: string
  status: string
  capacity: number
  utilizationRate: number
  lastMaintenanceDate?: string
  nextMaintenanceDate?: string
  currentWorkOrderId?: string
  createdAt: string
}

export interface EquipmentStatisticsDto {
  totalCount: number
  runningCount: number
  idleCount: number
  maintenanceCount: number
  faultCount: number
  offlineCount: number
  utilizationRate: number
  availabilityRate: number
}

export interface EquipmentHealthDto {
  equipmentId: string
  equipmentName: string
  healthScore: number
  healthStatus: string
  anomalies: AnomalyDto[]
  predictedFailures: PredictedFailureDto[]
  recommendedMaintenanceDate: string
  maintenanceTasks: MaintenanceTaskDto[]
}

export interface AnomalyDto {
  parameterName: string
  value: number
  expectedValue: number
  deviation: number
  severity: string
}

export interface PredictedFailureDto {
  failureType: string
  confidence: number
  estimatedTimeToFailure: string
  recommendation: string
}

export interface MaintenanceTaskDto {
  taskName: string
  description: string
  estimatedDuration: string
  requiredParts: string[]
}

export interface MaintenanceRecordDto {
  id: string
  equipmentId: string
  maintenanceType: string
  description: string
  startTime: string
  endTime?: string
  performedBy: string
  result: string
  cost: number
  sparePartsUsed: string[]
}

export interface DiagnosticReportDto {
  equipmentId: string
  equipmentName: string
  errorCode: string
  mostLikelyCause: string
  diagnosticBasis: string
  suggestedSteps: string[]
  requiredSpareParts: string[]
  estimatedRepairTime: string
}
