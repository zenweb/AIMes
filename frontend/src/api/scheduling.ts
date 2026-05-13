import axios from 'axios'
import type {
  SchedulePlanDto,
  SchedulingResultDto,
  EquipmentDto,
  WorkOrderDto,
  OptimizeScheduleRequest,
} from '../types/scheduling'

const http = axios.create({
  baseURL: '/api/v1',
  timeout: 30000,
})

// 获取当前排产计划
export async function getCurrentPlan(): Promise<SchedulePlanDto> {
  const { data } = await http.get<SchedulePlanDto>('/scheduling/current')
  return data
}

// 获取所有排产计划
export async function getAllPlans(): Promise<SchedulePlanDto[]> {
  const { data } = await http.get<SchedulePlanDto[]>('/scheduling/plans')
  return data
}

// 根据 ID 获取排产计划
export async function getPlanById(id: string): Promise<SchedulePlanDto> {
  const { data } = await http.get<SchedulePlanDto>(`/scheduling/plans/${id}`)
  return data
}

// 触发排产优化
export async function optimizeSchedule(
  request: OptimizeScheduleRequest
): Promise<SchedulingResultDto> {
  const { data } = await http.post<SchedulingResultDto>(
    '/scheduling/optimize',
    request
  )
  return data
}

// 获取设备列表
export async function getEquipmentList(): Promise<EquipmentDto[]> {
  const { data } = await http.get<EquipmentDto[]>('/equipment')
  return data
}

// 获取工单详情
export async function getWorkOrderById(
  id: string
): Promise<WorkOrderDto> {
  const { data } = await http.get<WorkOrderDto>(
    `/scheduling/workorders/${id}`
  )
  return data
}

export interface BatchOptimizeRequest {
  workshopId: string
  startDate?: string
  endDate?: string
  objectives?: string[]
  workOrderIds?: string[]
}

export interface ObjectiveCompareItem {
  objective: string
  objectiveLabel: string
  plan: SchedulePlanDto
  utilizationRate: number
  onTimeDeliveryRate: number
  totalChangeoverMinutes: number
  groupCount: number
  estimatedCompletionRate: number
  totalWorkOrders: number
}

export interface BatchOptimizeResult {
  items: ObjectiveCompareItem[]
  bestOverallObjective?: string
}

// 批量优化对比
export async function batchOptimize(
  request: BatchOptimizeRequest
): Promise<BatchOptimizeResult> {
  const { data } = await http.post<BatchOptimizeResult>(
    '/scheduling/optimize-compare',
    request
  )
  return data
}

export interface AdoptionFeedbackRequest {
  schedulePlanId: string
  workshopId: string
  optimizationObjective?: string
  reasonCategory: string
  reasonDetail?: string
  movedOrderIds?: string[]
  aiTraceId?: string
}

// 提交排产方案采纳反馈
export async function submitAdoptionFeedback(
  request: AdoptionFeedbackRequest
): Promise<void> {
  await http.post('/scheduling/adoption-feedback', request)
}

// 获取工单列表
export async function getWorkOrders(params?: {
  status?: string
  workshopId?: string
  page?: number
  pageSize?: number
}): Promise<{ items: WorkOrderDto[]; totalCount: number }> {
  const { data } = await http.get('/scheduling/workorders', { params })
  return data
}
