import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  adoptAgentDecision,
  batchOptimize,
  getAgentDecision,
  getAgentDecisions,
  getAllPlans,
  getCurrentPlan,
  getEquipmentList,
  getLatestAdoptionFeedback,
  getPlanById,
  getWorkOrderById,
  getWorkOrders,
  optimizeSchedule,
  recommendAgentDecision,
  rejectAgentDecision,
  rescheduleItem,
  submitAdoptionFeedback,
} from '../../src/api/scheduling'

const httpGet = vi.hoisted(() => vi.fn())
const httpPost = vi.hoisted(() => vi.fn())
const httpPatch = vi.hoisted(() => vi.fn())

vi.mock('../../src/api/http', () => ({
  default: {
    get: httpGet,
    post: httpPost,
    patch: httpPatch,
  },
}))

describe('scheduling api', () => {
  beforeEach(() => {
    httpGet.mockReset()
    httpPost.mockReset()
    httpPatch.mockReset()
  })

  it('does not hide latest adoption feedback backend failures from callers', async () => {
    httpGet.mockRejectedValueOnce(new Error('latest feedback backend unavailable'))

    await expect(getLatestAdoptionFeedback()).rejects.toThrow('latest feedback backend unavailable')
    expect(httpGet).toHaveBeenCalledWith(
      '/scheduling/adoption-feedback/latest',
      expect.objectContaining({ suppressErrorToast: true }),
    )
  })

  it('treats missing latest adoption feedback as an empty optional state', async () => {
    httpGet.mockRejectedValueOnce({ response: { status: 404 } })

    await expect(getLatestAdoptionFeedback()).resolves.toBeNull()
  })

  it('maps read endpoints to the scheduling backend contract', async () => {
    const currentPlan = { id: 'plan-current', items: [] }
    const allPlans = [{ id: 'plan-a', items: [] }]
    const selectedPlan = { id: 'plan-42', items: [] }
    const equipmentPage = { items: [{ id: 'eq-1' }], totalCount: 1, page: 2, pageSize: 10, totalPages: 1 }
    const workOrder = { id: 'wo-1', orderNumber: 'WO-1' }
    const workOrders = { items: [{ id: 'wo-2' }], totalCount: 1 }
    const latestFeedback = {
      decision: 'accepted',
      decisionLabel: '已采纳',
      reasonCategory: 'capacity',
      categoryLabel: '产能',
      objectiveLabel: '准交',
      createdAt: '2026-06-14T00:00:00Z',
      source: 'backend',
    }
    httpGet
      .mockResolvedValueOnce({ data: currentPlan })
      .mockResolvedValueOnce({ data: allPlans })
      .mockResolvedValueOnce({ data: selectedPlan })
      .mockResolvedValueOnce({ data: equipmentPage })
      .mockResolvedValueOnce({ data: workOrder })
      .mockResolvedValueOnce({ data: workOrders })
      .mockResolvedValueOnce({ data: latestFeedback })

    await expect(getCurrentPlan()).resolves.toBe(currentPlan)
    await expect(getAllPlans()).resolves.toBe(allPlans)
    await expect(getPlanById('plan-42')).resolves.toBe(selectedPlan)
    await expect(getEquipmentList(2, 10)).resolves.toBe(equipmentPage)
    await expect(getWorkOrderById('wo-1')).resolves.toBe(workOrder)
    await expect(getWorkOrders({ status: 'Released', workshopId: 'WS-01', page: 3, pageSize: 25 })).resolves.toBe(workOrders)
    await expect(getLatestAdoptionFeedback()).resolves.toBe(latestFeedback)

    expect(httpGet).toHaveBeenNthCalledWith(
      1,
      '/scheduling/current',
      expect.objectContaining({ suppressErrorToast: true }),
    )
    expect(httpGet).toHaveBeenNthCalledWith(2, '/scheduling/plans')
    expect(httpGet).toHaveBeenNthCalledWith(3, '/scheduling/plans/plan-42')
    expect(httpGet).toHaveBeenNthCalledWith(4, '/equipment', { params: { page: 2, pageSize: 10 } })
    expect(httpGet).toHaveBeenNthCalledWith(5, '/scheduling/workorders/wo-1')
    expect(httpGet).toHaveBeenNthCalledWith(6, '/scheduling/workorders', {
      params: { status: 'Released', workshopId: 'WS-01', page: 3, pageSize: 25 },
    })
    expect(httpGet).toHaveBeenNthCalledWith(
      7,
      '/scheduling/adoption-feedback/latest',
      expect.objectContaining({ suppressErrorToast: true }),
    )
  })

  it('uses stable default paging for equipment and agent decision reads', async () => {
    httpGet
      .mockResolvedValueOnce({ data: { items: [], totalCount: 0, page: 1, pageSize: 50, totalPages: 0 } })
      .mockResolvedValueOnce({ data: [] })

    await getEquipmentList()
    await getAgentDecisions()

    expect(httpGet).toHaveBeenNthCalledWith(1, '/equipment', { params: { page: 1, pageSize: 50 } })
    expect(httpGet).toHaveBeenNthCalledWith(2, '/scheduling/agent/decisions', { params: { take: 20 } })
  })

  it('maps optimize, compare, and feedback writes without reshaping payloads', async () => {
    const optimizeRequest = {
      workshopId: 'WS-01',
      optimizationObjective: 'delivery',
      workOrderIds: ['wo-1'],
      constraints: { bottleneck: 'eq-1' },
    }
    const optimizeResult = { plan: { id: 'plan-optimized', items: [] }, assignments: [], estimatedCompletionRate: 0.9, utilizationRate: 0.8, warnings: [] }
    const compareRequest = {
      workshopId: 'WS-01',
      objectives: ['delivery', 'utilization'],
      workOrderIds: ['wo-1', 'wo-2'],
    }
    const compareResult = { items: [], bestOverallObjective: 'delivery' }
    const feedbackRequest = {
      schedulePlanId: 'plan-optimized',
      workshopId: 'WS-01',
      optimizationObjective: 'delivery',
      reasonCategory: 'capacity',
      reasonDetail: 'bottleneck protected',
      movedOrderIds: ['wo-1'],
      aiTraceId: 'trace-1',
    }
    httpPost
      .mockResolvedValueOnce({ data: optimizeResult })
      .mockResolvedValueOnce({ data: compareResult })
      .mockResolvedValueOnce({ data: undefined })

    await expect(optimizeSchedule(optimizeRequest)).resolves.toBe(optimizeResult)
    await expect(batchOptimize(compareRequest)).resolves.toBe(compareResult)
    await expect(submitAdoptionFeedback(feedbackRequest)).resolves.toBeUndefined()

    expect(httpPost).toHaveBeenNthCalledWith(1, '/scheduling/optimize', optimizeRequest)
    expect(httpPost).toHaveBeenNthCalledWith(2, '/scheduling/optimize-compare', compareRequest)
    expect(httpPost).toHaveBeenNthCalledWith(3, '/scheduling/adoption-feedback', feedbackRequest)
  })

  it('maps reschedule writes to the plan item patch contract', async () => {
    httpPatch.mockResolvedValueOnce({ data: undefined })

    await expect(rescheduleItem('plan-1', 'item-1', '2026-06-14T08:00:00Z', '2026-06-14T10:00:00Z')).resolves.toBeUndefined()

    expect(httpPatch).toHaveBeenCalledWith('/scheduling/plans/plan-1/items/item-1', {
      plannedStartTime: '2026-06-14T08:00:00Z',
      plannedEndTime: '2026-06-14T10:00:00Z',
    })
  })

  it('maps agent recommendation and decision lifecycle endpoints', async () => {
    const recommendRequest = {
      workshopId: 'WS-01',
      eventType: 'rush_order',
      sourceModule: 'schedule',
      businessKeyType: 'workOrder',
      businessKeyValue: 'wo-1',
      severity: 'High',
      workOrderIds: ['wo-1'],
      objective: 'delivery',
      payload: { dueDate: '2026-06-15' },
    }
    const decision = {
      id: 'decision-1',
      triggerEventId: 'event-1',
      boundedContext: 'Scheduling',
      decisionType: 'RushOrderRecovery',
      status: 'Recommended',
      agentName: 'SchedulingAgent',
      agentVersion: '1.0',
      promptHash: 'prompt',
      contextHash: 'context',
      businessKey: 'wo-1',
      createdAt: '2026-06-14T00:00:00Z',
      scenarios: [],
    }
    httpPost
      .mockResolvedValueOnce({ data: decision })
      .mockResolvedValueOnce({ data: { ...decision, status: 'Adopted', adoptedScenarioId: 'scenario-1' } })
      .mockResolvedValueOnce({ data: { ...decision, status: 'Rejected' } })
    httpGet
      .mockResolvedValueOnce({ data: [decision] })
      .mockResolvedValueOnce({ data: decision })

    await expect(recommendAgentDecision(recommendRequest)).resolves.toBe(decision)
    await expect(getAgentDecisions(7)).resolves.toEqual([decision])
    await expect(getAgentDecision('decision-1')).resolves.toBe(decision)
    await expect(adoptAgentDecision('decision-1', 'scenario-1', 'protect OTD')).resolves.toMatchObject({ status: 'Adopted' })
    await expect(rejectAgentDecision('decision-1', 'capacity risk')).resolves.toMatchObject({ status: 'Rejected' })

    expect(httpPost).toHaveBeenNthCalledWith(1, '/scheduling/agent/recommend', recommendRequest)
    expect(httpGet).toHaveBeenNthCalledWith(1, '/scheduling/agent/decisions', { params: { take: 7 } })
    expect(httpGet).toHaveBeenNthCalledWith(2, '/scheduling/agent/decision-1')
    expect(httpPost).toHaveBeenNthCalledWith(2, '/scheduling/agent/decision-1/adopt', {
      scenarioId: 'scenario-1',
      reason: 'protect OTD',
    })
    expect(httpPost).toHaveBeenNthCalledWith(3, '/scheduling/agent/decision-1/reject', {
      reason: 'capacity risk',
    })
  })
})
