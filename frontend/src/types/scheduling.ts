// 映射后端 DTO

export interface SchedulePlanDto {
  id: string
  planName: string
  planStartDate: string
  planEndDate: string
  items: ScheduleItemDto[]
  overallUtilizationRate: number
  onTimeDeliveryRate: number
  optimizationNotes?: string
  createdAt: string
}

export interface ScheduleItemDto {
  id: string
  workOrderId: string
  workOrderNumber: string
  equipmentId: string
  equipmentName: string
  plannedStartTime: string
  plannedEndTime: string
  sequence: number
  setupTime: string
  dependentItems: string[]
}

export interface SchedulingResultDto {
  plan: SchedulePlanDto
  assignments: ScheduleAssignmentDto[]
  estimatedCompletionRate: number
  utilizationRate: number
  optimizationReason?: string
  warnings: string[]
}

export interface ScheduleAssignmentDto {
  workOrderId: string
  equipmentId: string
  startTime: string
  endTime: string
  dependencies: string[]
}

export interface EquipmentDto {
  id: string
  equipmentCode: string
  equipmentName: string
  equipmentType: string
  status: string
  capacity: number
  utilizationRate: number
  currentWorkOrderId?: string
}

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
  updatedAt: string
}

export interface OptimizeScheduleRequest {
  workshopId: string
  startDate?: string
  endDate?: string
  workOrderIds?: string[]
  considerHistoricalData?: boolean
  constraints?: Record<string, unknown>
}

// dhtmlx-gantt 数据格式
export interface GanttTask {
  id: string
  text: string
  start_date: string
  duration: number
  parent: string
  progress: number
  open?: boolean
  // 扩展字段
  workOrderId?: string
  equipmentId?: string
  equipmentName?: string
  setupMinutes?: number
  isOnBottleneck?: boolean
  priority?: number
  status?: string
  // 冲突标记
  hasConflict?: boolean
  conflictMessage?: string
}

export interface GanttLink {
  id: string
  source: string
  target: string
  type: string
}

export interface GanttData {
  tasks: GanttTask[]
  links: GanttLink[]
}
