import http, { type AimesRequestConfig } from './http'
import type { PagedResult } from '../types/common'
import type {
  SchedulePlanDto,
  SchedulingResultDto,
  EquipmentDto,
  WorkOrderDto,
  OptimizeScheduleRequest,
} from '../types/scheduling'

// 获取当前排产计划
export async function getCurrentPlan(): Promise<SchedulePlanDto> {
  const config: AimesRequestConfig = { suppressErrorToast: true }
  const { data } = await http.get<SchedulePlanDto>('/scheduling/current', config)
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
export async function getEquipmentList(page = 1, pageSize = 50): Promise<PagedResult<EquipmentDto>> {
  const { data } = await http.get<PagedResult<EquipmentDto>>('/equipment', {
    params: { page, pageSize },
  })
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
  recommendationScore: number
  recommendationScoreBreakdown: RecommendationScoreBreakdown
}

export interface RecommendationScoreBreakdown {
  utilizationContribution: number
  onTimeDeliveryContribution: number
  changeoverContribution: number
}

export interface RecommendationScoreFormula {
  version: string
  utilizationWeight: number
  onTimeDeliveryWeight: number
  changeoverWeight: number
  changeoverNormalizationMinutes: number
  description: string
}

export interface BatchOptimizeResult {
  items: ObjectiveCompareItem[]
  bestOverallObjective?: string
  recommendationScoreFormula: RecommendationScoreFormula
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

// 拖拽重排单个排产项
export async function rescheduleItem(
  planId: string,
  itemId: string,
  startTime: string,
  endTime: string
): Promise<void> {
  await http.patch(`/scheduling/plans/${planId}/items/${itemId}`, {
    plannedStartTime: startTime,
    plannedEndTime: endTime,
  })
}

export interface AgentRecommendRequest {
  workshopId: string
  eventType?: string
  sourceModule?: string
  businessKeyType?: string
  businessKeyValue?: string
  severity?: string
  workOrderIds?: string[]
  objective?: string
  payload?: Record<string, unknown>
}

export interface AgentDecisionScenario {
  id: string
  strategyName: string
  priorityRule?: string
  capacityStrategy?: string
  objective?: string
  otdProjection: number
  utilizationProjection: number
  changeoverProjection: number
  explanation?: string
  sacrificedObjectives?: string
}

export interface AgentDecision {
  id: string
  triggerEventId: string
  boundedContext: string
  decisionType: string
  status: string
  recommendedScenarioId?: string
  adoptedScenarioId?: string
  agentName: string
  agentVersion: string
  traceId?: string
  promptHash: string
  contextHash: string
  inputSummary?: string
  outputSummary?: string
  businessKey: string
  createdAt: string
  scenarios: AgentDecisionScenario[]
}

export interface AdoptionFeedbackSnapshot {
  decision: 'accepted' | 'rejected'
  decisionLabel: string
  reasonCategory: string
  categoryLabel: string
  reasonDetail?: string
  objectiveLabel: string
  createdAt: string
  traceId?: string
  source: 'backend'
  agentDecisionId?: string
}

export async function recommendAgentDecision(
  request: AgentRecommendRequest
): Promise<AgentDecision> {
  const { data } = await http.post<AgentDecision>('/scheduling/agent/recommend', request)
  return data
}

export async function getAgentDecisions(take = 20): Promise<AgentDecision[]> {
  const { data } = await http.get<AgentDecision[]>('/scheduling/agent/decisions', {
    params: { take },
  })
  return data
}

export async function getAgentDecision(decisionId: string): Promise<AgentDecision> {
  const { data } = await http.get<AgentDecision>(`/scheduling/agent/${decisionId}`)
  return data
}

export async function adoptAgentDecision(
  decisionId: string,
  scenarioId: string,
  reason?: string
): Promise<AgentDecision> {
  const { data } = await http.post<AgentDecision>(`/scheduling/agent/${decisionId}/adopt`, {
    scenarioId,
    reason,
  })
  return data
}

export async function rejectAgentDecision(
  decisionId: string,
  reason?: string
): Promise<AgentDecision> {
  const { data } = await http.post<AgentDecision>(`/scheduling/agent/${decisionId}/reject`, {
    reason,
  })
  return data
}

export async function getLatestAdoptionFeedback(): Promise<AdoptionFeedbackSnapshot | null> {
  try {
    const config: AimesRequestConfig = { suppressErrorToast: true }
    const { data } = await http.get<AdoptionFeedbackSnapshot>('/scheduling/adoption-feedback/latest', config)
    return data
  } catch (error: unknown) {
    if (isNotFoundResponse(error)) return null
    throw error
  }
}

function isNotFoundResponse(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false
  const candidate = error as { response?: { status?: unknown } }
  return candidate.response?.status === 404
}
