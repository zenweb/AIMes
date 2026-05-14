export interface WorkOrderDto {
  id: string
  orderNumber: string
  productCode: string
  productName: string
  plannedQuantity: number
  completedQuantity: number
  plannedStartDate: string
  plannedEndDate: string
  actualStartDate?: string
  actualEndDate?: string
  status: string
  workshopId: string
  routeCode?: string
  priority: number
  progressPercentage: number
  createdAt: string
  updatedAt?: string
}

export interface OperationInfoDto {
  operationId: string
  workOrderId: string
  workOrderNumber: string
  productCode: string
  productName: string
  operationCode: string
  operationName: string
  plannedQuantity: number
  completedQuantity: number
  status: string
}

export interface OperationResultDto {
  operationId: string
  status: string
  message?: string
}

export interface StartOperationRequest {
  operatorId: string
  stationId: string
  equipmentId?: string
}

export interface CompleteOperationRequest {
  quantity: number
  defectQuantity: number
  inspectionResult: string
  reportedBy?: string
}

export interface ReportExceptionRequest {
  reason: string
}
