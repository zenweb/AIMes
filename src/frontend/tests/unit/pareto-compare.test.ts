import { flushPromises, mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import ParetoCompare from '../../src/components/schedule/ParetoCompare.vue'

const batchOptimize = vi.hoisted(() => vi.fn())
const getEquipmentList = vi.hoisted(() => vi.fn())
const getBottleneckEquipmentIds = vi.hoisted(() => vi.fn())

vi.mock('../../src/api/scheduling', () => ({
  batchOptimize,
  getEquipmentList,
}))

vi.mock('../../src/api/equipment', () => ({
  getBottleneckEquipmentIds,
}))

vi.mock('../../src/utils/offline-demo-mode', () => ({
  isOfflineDemoError: (error: unknown) => error instanceof Error && error.name === 'OfflineDemoApiError',
  logUnlessOfflineDemo: vi.fn(),
}))

vi.mock('../../src/utils/gantt-mapper', () => ({
  planToGanttData: vi.fn(() => ({ tasks: [], links: [] })),
}))

vi.mock('../../src/components/gantt/GanttChart.vue', () => ({
  default: {
    props: {
      data: Object,
      lockPeriodHours: Number,
      scale: String,
    },
    template: '<div class="gantt-chart-stub" />',
  },
}))

function mountCompare(visible = true) {
  return mount(ParetoCompare, {
    props: {
      visible,
      workshopId: 'ws-001',
    },
    global: {
      stubs: {
        GanttChart: true,
        Teleport: true,
      },
    },
  })
}

const validRecommendationScoreFormula = {
  version: 'v1-weighted-kpi-40-40-20',
  utilizationWeight: 0.4,
  onTimeDeliveryWeight: 0.4,
  changeoverWeight: 0.2,
  changeoverNormalizationMinutes: 1000,
  description: '综合分 = 利用率 40% + 准时率 40% + 换线效率 20%；换线效率按 1000 分钟归一化。',
}

function buildComparableItem(
  objective: string,
  objectiveLabel: string,
  metrics: {
    utilizationRate: number
    onTimeDeliveryRate: number
    totalChangeoverMinutes: number
    groupCount: number
    estimatedCompletionRate: number
  },
) {
  const changeoverContribution = Math.max(0, 1 - metrics.totalChangeoverMinutes / 1000) * 0.2
  const recommendationScoreBreakdown = {
    utilizationContribution: metrics.utilizationRate * 0.4,
    onTimeDeliveryContribution: metrics.onTimeDeliveryRate * 0.4,
    changeoverContribution,
  }

  return {
    objective,
    objectiveLabel,
    plan: {
      id: `${objective}-valid-plan`,
      planName: `${objectiveLabel}方案`,
      planStartDate: '2026-06-01T08:00:00.000Z',
      planEndDate: '2026-06-01T12:00:00.000Z',
      overallUtilizationRate: metrics.utilizationRate,
      onTimeDeliveryRate: metrics.onTimeDeliveryRate,
      totalChangeoverMinutes: metrics.totalChangeoverMinutes,
      groupCount: metrics.groupCount,
      createdAt: '2026-06-01T08:00:00.000Z',
      items: [{
        id: `${objective}-valid-item-1`,
        workOrderId: `${objective}-valid-wo-1`,
        workOrderNumber: `WO-${objective.toUpperCase()}-VALID-001`,
        equipmentId: `${objective}-valid-eq-1`,
        equipmentName: `${objectiveLabel}对比机台`,
        plannedStartTime: '2026-06-01T08:00:00.000Z',
        plannedEndTime: '2026-06-01T12:00:00.000Z',
        sequence: 1,
        setupTime: '20 分钟',
        dependentItems: [],
      }],
    },
    ...metrics,
    totalWorkOrders: 1,
    recommendationScore: recommendationScoreBreakdown.utilizationContribution
      + recommendationScoreBreakdown.onTimeDeliveryContribution
      + recommendationScoreBreakdown.changeoverContribution,
    recommendationScoreBreakdown,
  }
}

describe('ParetoCompare', () => {
  beforeEach(() => {
    batchOptimize.mockReset()
    getEquipmentList.mockReset()
    getBottleneckEquipmentIds.mockReset()
    getEquipmentList.mockResolvedValue({ items: [], totalCount: 0, page: 1, pageSize: 20, totalPages: 0 })
    getBottleneckEquipmentIds.mockResolvedValue(undefined)
  })

  it('exposes the objective comparison overlay as a labelled modal dialog', () => {
    const wrapper = mountCompare()

    const dialog = wrapper.get('.compare-container')
    expect(dialog.attributes('role')).toBe('dialog')
    expect(dialog.attributes('aria-modal')).toBe('true')
    expect(dialog.attributes('aria-labelledby')).toBe('pareto-compare-title')
    expect(wrapper.get('#pareto-compare-title').text()).toBe('多目标方案对比')
    expect(wrapper.get('.close-btn').attributes('aria-label')).toBe('关闭多目标方案对比')
  })

  it('fails loud instead of showing a demo recommendation when backend comparison fails', async () => {
    batchOptimize.mockRejectedValueOnce(new Error('backend unavailable'))
    const wrapper = mountCompare(false)
    await wrapper.setProps({ visible: true })
    await flushPromises()

    const alert = wrapper.get('.error-msg')
    expect(alert.attributes('role')).toBe('alert')
    expect(alert.text()).toContain('批量优化对比失败')
    expect(alert.text()).toContain('backend unavailable')
    expect(wrapper.find('.recommend-card').exists()).toBe(false)
    expect(wrapper.find('.recommend-apply-btn').exists()).toBe(false)
    expect(wrapper.emitted('apply')).toBeUndefined()
  })

  it('fails loud when backend comparison succeeds without comparable plans', async () => {
    batchOptimize.mockResolvedValueOnce({
      bestOverallObjective: 'balanced',
      items: [],
    })
    const wrapper = mountCompare(false)
    await wrapper.setProps({ visible: true })
    await flushPromises()

    const alert = wrapper.get('.error-msg')
    expect(alert.attributes('role')).toBe('alert')
    expect(alert.text()).toContain('批量优化对比失败')
    expect(alert.text()).toContain('后端未返回可对比排产方案')
    expect(wrapper.find('.empty-state').exists()).toBe(false)
    expect(wrapper.find('.recommend-card').exists()).toBe(false)
    expect(wrapper.find('.recommend-apply-btn').exists()).toBe(false)
    expect(wrapper.emitted('apply')).toBeUndefined()
  })

  it('fails loud with a business-readable error when backend comparison omits the plan list', async () => {
    batchOptimize.mockResolvedValueOnce({
      bestOverallObjective: 'balanced',
    } as unknown)
    const wrapper = mountCompare(false)
    await wrapper.setProps({ visible: true })
    await flushPromises()

    const alert = wrapper.get('.error-msg')
    expect(alert.attributes('role')).toBe('alert')
    expect(alert.text()).toContain('批量优化对比失败')
    expect(alert.text()).toContain('后端对比结果缺少方案列表')
    expect(alert.text()).not.toContain('Cannot read')
    expect(wrapper.find('.empty-state').exists()).toBe(false)
    expect(wrapper.find('.recommend-card').exists()).toBe(false)
    expect(wrapper.find('.recommend-apply-btn').exists()).toBe(false)
    expect(wrapper.emitted('apply')).toBeUndefined()
  })

  it('fails loud when backend recommends an objective outside returned plans', async () => {
    batchOptimize.mockResolvedValueOnce({
      bestOverallObjective: 'balanced',
      recommendationScoreFormula: {
        version: 'v1-weighted-kpi-40-40-20',
        utilizationWeight: 0.4,
        onTimeDeliveryWeight: 0.4,
        changeoverWeight: 0.2,
        changeoverNormalizationMinutes: 1000,
        description: '综合分 = 利用率 40% + 准时率 40% + 换线效率 20%；换线效率按 1000 分钟归一化。',
      },
      items: [{
        objective: 'due_date',
        objectiveLabel: '交期优先',
        plan: {
          id: 'due-date-plan',
          planName: '交期优先方案',
          planStartDate: '2026-06-01T08:00:00.000Z',
          planEndDate: '2026-06-01T12:00:00.000Z',
          overallUtilizationRate: 0.7,
          onTimeDeliveryRate: 0.95,
          totalChangeoverMinutes: 45,
          groupCount: 1,
          createdAt: '2026-06-01T08:00:00.000Z',
          items: [],
        },
        utilizationRate: 0.7,
        onTimeDeliveryRate: 0.95,
        totalChangeoverMinutes: 45,
        groupCount: 1,
        estimatedCompletionRate: 0.9,
        totalWorkOrders: 1,
      }],
    })
    const wrapper = mountCompare(false)
    await wrapper.setProps({ visible: true })
    await flushPromises()

    const alert = wrapper.get('.error-msg')
    expect(alert.attributes('role')).toBe('alert')
    expect(alert.text()).toContain('批量优化对比失败')
    expect(alert.text()).toContain('后端推荐方案不在可对比排产方案中')
    expect(wrapper.find('.recommend-card').exists()).toBe(false)
    expect(wrapper.find('.recommend-apply-btn').exists()).toBe(false)
    expect(wrapper.emitted('apply')).toBeUndefined()
  })

  it('fails loud when backend omits the recommended objective', async () => {
    batchOptimize.mockResolvedValueOnce({
      items: [{
        objective: 'balanced',
        objectiveLabel: '综合平衡',
        plan: {
          id: 'balanced-plan-without-recommendation',
          planName: '综合平衡方案',
          planStartDate: '2026-06-01T08:00:00.000Z',
          planEndDate: '2026-06-01T12:00:00.000Z',
          overallUtilizationRate: 0.86,
          onTimeDeliveryRate: 0.93,
          totalChangeoverMinutes: 28,
          groupCount: 1,
          createdAt: '2026-06-01T08:00:00.000Z',
          items: [{
            id: 'balanced-without-recommendation-item-1',
            workOrderId: 'balanced-without-recommendation-wo-1',
            workOrderNumber: 'WO-BALANCED-WITHOUT-RECOMMENDATION-001',
            equipmentId: 'balanced-eq-1',
            equipmentName: 'CNC 多目标对比机台',
            plannedStartTime: '2026-06-01T08:00:00.000Z',
            plannedEndTime: '2026-06-01T12:00:00.000Z',
            sequence: 1,
            setupTime: '20 分钟',
            dependentItems: [],
          }],
        },
        utilizationRate: 0.86,
        onTimeDeliveryRate: 0.93,
        totalChangeoverMinutes: 28,
        groupCount: 1,
        estimatedCompletionRate: 0.91,
        totalWorkOrders: 1,
      }],
    })
    const wrapper = mountCompare(false)
    await wrapper.setProps({ visible: true })
    await flushPromises()

    const alert = wrapper.get('.error-msg')
    expect(alert.attributes('role')).toBe('alert')
    expect(alert.text()).toContain('批量优化对比失败')
    expect(alert.text()).toContain('后端对比结果缺少推荐方案')
    expect(wrapper.find('.recommend-card').exists()).toBe(false)
    expect(wrapper.find('.recommend-apply-btn').exists()).toBe(false)
    expect(wrapper.emitted('apply')).toBeUndefined()
  })

  it('fails loud when backend recommended objective is not the highest scoring plan', async () => {
    batchOptimize.mockResolvedValueOnce({
      bestOverallObjective: 'due_date',
      recommendationScoreFormula: {
        version: 'v1-weighted-kpi-40-40-20',
        utilizationWeight: 0.4,
        onTimeDeliveryWeight: 0.4,
        changeoverWeight: 0.2,
        changeoverNormalizationMinutes: 1000,
        description: '综合分 = 利用率 40% + 准时率 40% + 换线效率 20%；换线效率按 1000 分钟归一化。',
      },
      items: [{
        objective: 'due_date',
        objectiveLabel: '交期优先',
        plan: {
          id: 'due-date-lower-score-plan',
          planName: '交期优先方案',
          planStartDate: '2026-06-01T08:00:00.000Z',
          planEndDate: '2026-06-01T12:00:00.000Z',
          overallUtilizationRate: 0.62,
          onTimeDeliveryRate: 0.82,
          totalChangeoverMinutes: 600,
          groupCount: 1,
          createdAt: '2026-06-01T08:00:00.000Z',
          items: [{
            id: 'due-date-lower-score-item-1',
            workOrderId: 'due-date-lower-score-wo-1',
            workOrderNumber: 'WO-DUE-DATE-LOWER-SCORE-001',
            equipmentId: 'compare-eq-1',
            equipmentName: 'CNC 多目标对比机台',
            plannedStartTime: '2026-06-01T08:00:00.000Z',
            plannedEndTime: '2026-06-01T12:00:00.000Z',
            sequence: 1,
            setupTime: '20 分钟',
            dependentItems: [],
          }],
        },
        utilizationRate: 0.62,
        onTimeDeliveryRate: 0.82,
        totalChangeoverMinutes: 600,
        groupCount: 1,
        estimatedCompletionRate: 0.88,
        totalWorkOrders: 1,
        recommendationScore: 0.656,
        recommendationScoreBreakdown: {
          utilizationContribution: 0.248,
          onTimeDeliveryContribution: 0.328,
          changeoverContribution: 0.08,
        },
      }, {
        objective: 'balanced',
        objectiveLabel: '综合平衡',
        plan: {
          id: 'balanced-highest-score-plan',
          planName: '综合平衡方案',
          planStartDate: '2026-06-01T08:00:00.000Z',
          planEndDate: '2026-06-01T12:00:00.000Z',
          overallUtilizationRate: 0.9,
          onTimeDeliveryRate: 0.94,
          totalChangeoverMinutes: 40,
          groupCount: 1,
          createdAt: '2026-06-01T08:00:00.000Z',
          items: [{
            id: 'balanced-highest-score-item-1',
            workOrderId: 'balanced-highest-score-wo-1',
            workOrderNumber: 'WO-BALANCED-HIGHEST-SCORE-001',
            equipmentId: 'compare-eq-1',
            equipmentName: 'CNC 多目标对比机台',
            plannedStartTime: '2026-06-01T08:00:00.000Z',
            plannedEndTime: '2026-06-01T12:00:00.000Z',
            sequence: 1,
            setupTime: '20 分钟',
            dependentItems: [],
          }],
        },
        utilizationRate: 0.9,
        onTimeDeliveryRate: 0.94,
        totalChangeoverMinutes: 40,
        groupCount: 1,
        estimatedCompletionRate: 0.96,
        totalWorkOrders: 1,
        recommendationScore: 0.928,
        recommendationScoreBreakdown: {
          utilizationContribution: 0.36,
          onTimeDeliveryContribution: 0.376,
          changeoverContribution: 0.192,
        },
      }],
    })
    const wrapper = mountCompare(false)
    await wrapper.setProps({ visible: true })
    await flushPromises()

    const alert = wrapper.get('.error-msg')
    expect(alert.attributes('role')).toBe('alert')
    expect(alert.text()).toContain('批量优化对比失败')
    expect(alert.text()).toContain('后端推荐方案不是综合得分最高方案')
    expect(wrapper.find('.recommend-card').exists()).toBe(false)
    expect(wrapper.find('.recommend-apply-btn').exists()).toBe(false)
    expect(wrapper.emitted('apply')).toBeUndefined()
  })

  it('shows an auditable recommendation score breakdown for the best objective', async () => {
    batchOptimize.mockResolvedValueOnce({
      bestOverallObjective: 'balanced',
      recommendationScoreFormula: {
        version: 'v1-weighted-kpi-40-40-20',
        utilizationWeight: 0.4,
        onTimeDeliveryWeight: 0.4,
        changeoverWeight: 0.2,
        changeoverNormalizationMinutes: 1000,
        description: '综合分 = 利用率 40% + 准时率 40% + 换线效率 20%；换线效率按 1000 分钟归一化。',
      },
      items: [{
        objective: 'balanced',
        objectiveLabel: '综合平衡',
        plan: {
          id: 'balanced-score-breakdown-plan',
          planName: '综合平衡方案',
          planStartDate: '2026-06-01T08:00:00.000Z',
          planEndDate: '2026-06-01T12:00:00.000Z',
          overallUtilizationRate: 0.86,
          onTimeDeliveryRate: 0.93,
          totalChangeoverMinutes: 28,
          groupCount: 1,
          createdAt: '2026-06-01T08:00:00.000Z',
          items: [{
            id: 'balanced-score-breakdown-item-1',
            workOrderId: 'balanced-score-breakdown-wo-1',
            workOrderNumber: 'WO-BALANCED-SCORE-BREAKDOWN-001',
            equipmentId: 'balanced-score-breakdown-eq-1',
            equipmentName: 'CNC 多目标对比机台',
            plannedStartTime: '2026-06-01T08:00:00.000Z',
            plannedEndTime: '2026-06-01T12:00:00.000Z',
            sequence: 1,
            setupTime: '20 分钟',
            dependentItems: [],
          }],
        },
        utilizationRate: 0.86,
        onTimeDeliveryRate: 0.93,
        totalChangeoverMinutes: 28,
        groupCount: 1,
        estimatedCompletionRate: 0.95,
        totalWorkOrders: 1,
        recommendationScore: 0.91,
        recommendationScoreBreakdown: {
          utilizationContribution: 0.344,
          onTimeDeliveryContribution: 0.372,
          changeoverContribution: 0.194,
        },
      }],
    })
    const wrapper = mountCompare(false)
    await wrapper.setProps({ visible: true })
    await flushPromises()

    const reason = wrapper.get('.recommend-reason').text()
    expect(reason).toContain('综合分 91.0')
    expect(reason).toContain('利用率 86%')
    expect(reason).toContain('准时率 93%')
    expect(reason).toContain('换线 28 分钟')
    expect(reason).toContain('分组 1')
    expect(reason).toContain('完工率 95%')
    expect(reason).toContain('利用率贡献 34.4')
    expect(reason).toContain('准时率贡献 37.2')
    expect(reason).toContain('换线贡献 19.4')
    expect(reason).toContain('公式 v1-weighted-kpi-40-40-20')
    expect(reason).toContain('权重 40/40/20')
    expect(reason).toContain('换线 1000 分钟归一')
  })

  it('renders successful comparison evidence and applies the selected objective without mixing plans', async () => {
    const balanced = buildComparableItem('balanced', '综合平衡', {
      utilizationRate: 0.86,
      onTimeDeliveryRate: 0.93,
      totalChangeoverMinutes: 28,
      groupCount: 1,
      estimatedCompletionRate: 0.95,
    })
    const dueDate = buildComparableItem('due_date', '交期优先', {
      utilizationRate: 0.7,
      onTimeDeliveryRate: 0.95,
      totalChangeoverMinutes: 45,
      groupCount: 2,
      estimatedCompletionRate: 0.9,
    })
    batchOptimize.mockResolvedValueOnce({
      bestOverallObjective: 'balanced',
      recommendationScoreFormula: validRecommendationScoreFormula,
      items: [dueDate, balanced],
    })
    getEquipmentList.mockResolvedValueOnce({
      items: [{
        id: 'balanced-valid-eq-1',
        equipmentCode: 'CNC-BAL',
        equipmentName: '综合平衡对比机台',
        equipmentType: 'CNC',
        status: 'Running',
        capacity: 100,
        utilizationRate: 0.86,
      }],
      totalCount: 1,
      page: 1,
      pageSize: 20,
      totalPages: 1,
    })
    getBottleneckEquipmentIds.mockResolvedValueOnce(['balanced-valid-eq-1'])

    const wrapper = mountCompare(false)
    await wrapper.setProps({ visible: true })
    await flushPromises()

    const recommendation = wrapper.get('.recommend-card')
    expect(recommendation.attributes('role')).toBe('status')
    expect(recommendation.text()).toContain('推荐方案')
    expect(recommendation.text()).toContain('综合平衡')
    expect(recommendation.text()).toContain('综合分 91.0')

    const rows = wrapper.findAll('.kpi-table tbody tr')
    expect(rows).toHaveLength(2)
    expect(rows[0].text()).toContain('交期优先')
    expect(rows[0].text()).toContain('70%')
    expect(rows[0].text()).toContain('95%')
    expect(rows[1].classes()).toContain('best-row')
    expect(rows[1].text()).toContain('综合平衡')
    expect(rows[1].text()).toContain('86%')
    expect(rows[1].text()).toContain('93%')

    const tabs = wrapper.findAll('.tab-btn')
    expect(tabs).toHaveLength(2)
    await tabs[1].trigger('click')
    const updatedTabs = wrapper.findAll('.tab-btn')
    expect(updatedTabs[1].classes()).toContain('active')

    await recommendation.get('.recommend-apply-btn').trigger('click')
    await rows[0].get('.apply-btn').trigger('click')

    expect(wrapper.emitted('apply')).toEqual([['balanced'], ['due_date']])
  })

  it('fails loud when backend recommendation formula weights do not add up to one', async () => {
    batchOptimize.mockResolvedValueOnce({
      bestOverallObjective: 'balanced',
      recommendationScoreFormula: {
        version: 'v1-weighted-kpi-invalid-total',
        utilizationWeight: 0.4,
        onTimeDeliveryWeight: 0.3,
        changeoverWeight: 0.2,
        changeoverNormalizationMinutes: 1000,
        description: '综合分 = 利用率 40% + 准时率 30% + 换线效率 20%；换线效率按 1000 分钟归一化。',
      },
      items: [{
        objective: 'balanced',
        objectiveLabel: '综合平衡',
        plan: {
          id: 'balanced-invalid-formula-weight-plan',
          planName: '综合平衡方案',
          planStartDate: '2026-06-01T08:00:00.000Z',
          planEndDate: '2026-06-01T12:00:00.000Z',
          overallUtilizationRate: 0.86,
          onTimeDeliveryRate: 0.93,
          totalChangeoverMinutes: 28,
          groupCount: 1,
          createdAt: '2026-06-01T08:00:00.000Z',
          items: [{
            id: 'balanced-invalid-formula-weight-item-1',
            workOrderId: 'balanced-invalid-formula-weight-wo-1',
            workOrderNumber: 'WO-BALANCED-INVALID-FORMULA-WEIGHT-001',
            equipmentId: 'balanced-invalid-formula-weight-eq-1',
            equipmentName: 'CNC 多目标对比机台',
            plannedStartTime: '2026-06-01T08:00:00.000Z',
            plannedEndTime: '2026-06-01T12:00:00.000Z',
            sequence: 1,
            setupTime: '20 分钟',
            dependentItems: [],
          }],
        },
        utilizationRate: 0.86,
        onTimeDeliveryRate: 0.93,
        totalChangeoverMinutes: 28,
        groupCount: 1,
        estimatedCompletionRate: 0.95,
        totalWorkOrders: 1,
        recommendationScore: 0.91,
        recommendationScoreBreakdown: {
          utilizationContribution: 0.344,
          onTimeDeliveryContribution: 0.372,
          changeoverContribution: 0.194,
        },
      }],
    })
    const wrapper = mountCompare(false)
    await wrapper.setProps({ visible: true })
    await flushPromises()

    const alert = wrapper.get('.error-msg')
    expect(alert.attributes('role')).toBe('alert')
    expect(alert.text()).toContain('批量优化对比失败')
    expect(alert.text()).toContain('后端推荐公式权重合计无效')
    expect(wrapper.find('.recommend-card').exists()).toBe(false)
    expect(wrapper.find('.recommend-apply-btn').exists()).toBe(false)
    expect(wrapper.emitted('apply')).toBeUndefined()
  })

  it('fails loud when backend recommendation score breakdown does not match the formula', async () => {
    batchOptimize.mockResolvedValueOnce({
      bestOverallObjective: 'balanced',
      recommendationScoreFormula: {
        version: 'v1-weighted-kpi-40-40-20',
        utilizationWeight: 0.4,
        onTimeDeliveryWeight: 0.4,
        changeoverWeight: 0.2,
        changeoverNormalizationMinutes: 1000,
        description: '综合分 = 利用率 40% + 准时率 40% + 换线效率 20%；换线效率按 1000 分钟归一化。',
      },
      items: [{
        objective: 'balanced',
        objectiveLabel: '综合平衡',
        plan: {
          id: 'balanced-formula-mismatch-plan',
          planName: '综合平衡方案',
          planStartDate: '2026-06-01T08:00:00.000Z',
          planEndDate: '2026-06-01T12:00:00.000Z',
          overallUtilizationRate: 0.86,
          onTimeDeliveryRate: 0.93,
          totalChangeoverMinutes: 28,
          groupCount: 1,
          createdAt: '2026-06-01T08:00:00.000Z',
          items: [{
            id: 'balanced-formula-mismatch-item-1',
            workOrderId: 'balanced-formula-mismatch-wo-1',
            workOrderNumber: 'WO-BALANCED-FORMULA-MISMATCH-001',
            equipmentId: 'balanced-formula-mismatch-eq-1',
            equipmentName: 'CNC 多目标对比机台',
            plannedStartTime: '2026-06-01T08:00:00.000Z',
            plannedEndTime: '2026-06-01T12:00:00.000Z',
            sequence: 1,
            setupTime: '20 分钟',
            dependentItems: [],
          }],
        },
        utilizationRate: 0.86,
        onTimeDeliveryRate: 0.93,
        totalChangeoverMinutes: 28,
        groupCount: 1,
        estimatedCompletionRate: 0.95,
        totalWorkOrders: 1,
        recommendationScore: 0.91,
        recommendationScoreBreakdown: {
          utilizationContribution: 0.35,
          onTimeDeliveryContribution: 0.366,
          changeoverContribution: 0.194,
        },
      }],
    })
    const wrapper = mountCompare(false)
    await wrapper.setProps({ visible: true })
    await flushPromises()

    const alert = wrapper.get('.error-msg')
    expect(alert.attributes('role')).toBe('alert')
    expect(alert.text()).toContain('批量优化对比失败')
    expect(alert.text()).toContain('后端推荐分数组成与公式不一致')
    expect(wrapper.find('.recommend-card').exists()).toBe(false)
    expect(wrapper.find('.recommend-apply-btn').exists()).toBe(false)
    expect(wrapper.emitted('apply')).toBeUndefined()
  })

  it('fails loud when backend comparison omits the recommendation score', async () => {
    batchOptimize.mockResolvedValueOnce({
      bestOverallObjective: 'balanced',
      items: [{
        objective: 'balanced',
        objectiveLabel: '综合平衡',
        plan: {
          id: 'balanced-missing-score-plan',
          planName: '综合平衡方案',
          planStartDate: '2026-06-01T08:00:00.000Z',
          planEndDate: '2026-06-01T12:00:00.000Z',
          overallUtilizationRate: 0.86,
          onTimeDeliveryRate: 0.93,
          totalChangeoverMinutes: 28,
          groupCount: 1,
          createdAt: '2026-06-01T08:00:00.000Z',
          items: [{
            id: 'balanced-missing-score-item-1',
            workOrderId: 'balanced-missing-score-wo-1',
            workOrderNumber: 'WO-BALANCED-MISSING-SCORE-001',
            equipmentId: 'balanced-missing-score-eq-1',
            equipmentName: 'CNC 多目标对比机台',
            plannedStartTime: '2026-06-01T08:00:00.000Z',
            plannedEndTime: '2026-06-01T12:00:00.000Z',
            sequence: 1,
            setupTime: '20 分钟',
            dependentItems: [],
          }],
        },
        utilizationRate: 0.86,
        onTimeDeliveryRate: 0.93,
        totalChangeoverMinutes: 28,
        groupCount: 1,
        estimatedCompletionRate: 0.95,
        totalWorkOrders: 1,
      }],
    })
    const wrapper = mountCompare(false)
    await wrapper.setProps({ visible: true })
    await flushPromises()

    const alert = wrapper.get('.error-msg')
    expect(alert.attributes('role')).toBe('alert')
    expect(alert.text()).toContain('批量优化对比失败')
    expect(alert.text()).toContain('后端对比方案缺少推荐分数或组成')
    expect(wrapper.find('.recommend-card').exists()).toBe(false)
    expect(wrapper.find('.recommend-apply-btn').exists()).toBe(false)
    expect(wrapper.emitted('apply')).toBeUndefined()
  })

  it('fails loud when backend recommendation score does not match its breakdown', async () => {
    batchOptimize.mockResolvedValueOnce({
      bestOverallObjective: 'balanced',
      items: [{
        objective: 'balanced',
        objectiveLabel: '综合平衡',
        plan: {
          id: 'balanced-mismatched-score-plan',
          planName: '综合平衡方案',
          planStartDate: '2026-06-01T08:00:00.000Z',
          planEndDate: '2026-06-01T12:00:00.000Z',
          overallUtilizationRate: 0.86,
          onTimeDeliveryRate: 0.93,
          totalChangeoverMinutes: 28,
          groupCount: 1,
          createdAt: '2026-06-01T08:00:00.000Z',
          items: [{
            id: 'balanced-mismatched-score-item-1',
            workOrderId: 'balanced-mismatched-score-wo-1',
            workOrderNumber: 'WO-BALANCED-MISMATCHED-SCORE-001',
            equipmentId: 'balanced-mismatched-score-eq-1',
            equipmentName: 'CNC 多目标对比机台',
            plannedStartTime: '2026-06-01T08:00:00.000Z',
            plannedEndTime: '2026-06-01T12:00:00.000Z',
            sequence: 1,
            setupTime: '20 分钟',
            dependentItems: [],
          }],
        },
        utilizationRate: 0.86,
        onTimeDeliveryRate: 0.93,
        totalChangeoverMinutes: 28,
        groupCount: 1,
        estimatedCompletionRate: 0.95,
        totalWorkOrders: 1,
        recommendationScore: 0.91,
        recommendationScoreBreakdown: {
          utilizationContribution: 0.2,
          onTimeDeliveryContribution: 0.2,
          changeoverContribution: 0.1,
        },
      }],
    })
    const wrapper = mountCompare(false)
    await wrapper.setProps({ visible: true })
    await flushPromises()

    const alert = wrapper.get('.error-msg')
    expect(alert.attributes('role')).toBe('alert')
    expect(alert.text()).toContain('批量优化对比失败')
    expect(alert.text()).toContain('后端推荐分数与组成不一致')
    expect(wrapper.find('.recommend-card').exists()).toBe(false)
    expect(wrapper.find('.recommend-apply-btn').exists()).toBe(false)
    expect(wrapper.emitted('apply')).toBeUndefined()
  })

  it('fails loud when a comparable item is missing its objective label', async () => {
    batchOptimize.mockResolvedValueOnce({
      bestOverallObjective: 'balanced',
      items: [{
        objective: 'balanced',
        objectiveLabel: '',
        plan: {
          id: 'balanced-plan-without-objective-label',
          planName: '综合平衡方案',
          planStartDate: '2026-06-01T08:00:00.000Z',
          planEndDate: '2026-06-01T12:00:00.000Z',
          overallUtilizationRate: 0.86,
          onTimeDeliveryRate: 0.93,
          totalChangeoverMinutes: 28,
          groupCount: 1,
          createdAt: '2026-06-01T08:00:00.000Z',
          items: [{
            id: 'balanced-missing-objective-label-item-1',
            workOrderId: 'balanced-missing-objective-label-wo-1',
            workOrderNumber: 'WO-BALANCED-MISSING-OBJECTIVE-LABEL-001',
            equipmentId: 'balanced-eq-1',
            equipmentName: 'CNC 多目标对比机台',
            plannedStartTime: '2026-06-01T08:00:00.000Z',
            plannedEndTime: '2026-06-01T12:00:00.000Z',
            sequence: 1,
            setupTime: '20 分钟',
            dependentItems: [],
          }],
        },
        utilizationRate: 0.86,
        onTimeDeliveryRate: 0.93,
        totalChangeoverMinutes: 28,
        groupCount: 1,
        estimatedCompletionRate: 0.92,
        totalWorkOrders: 1,
      }],
    })
    const wrapper = mountCompare(false)
    await wrapper.setProps({ visible: true })
    await flushPromises()

    const alert = wrapper.get('.error-msg')
    expect(alert.attributes('role')).toBe('alert')
    expect(alert.text()).toContain('批量优化对比失败')
    expect(alert.text()).toContain('后端对比方案缺少目标标识或名称')
    expect(wrapper.find('.recommend-card').exists()).toBe(false)
    expect(wrapper.find('.recommend-apply-btn').exists()).toBe(false)
    expect(wrapper.emitted('apply')).toBeUndefined()
  })

  it('fails loud when comparable items reuse the same objective key', async () => {
    batchOptimize.mockResolvedValueOnce({
      bestOverallObjective: 'balanced',
      items: [
        {
          objective: 'balanced',
          objectiveLabel: '综合平衡 A',
          plan: {
            id: 'balanced-duplicate-objective-plan-a',
            planName: '综合平衡方案 A',
            planStartDate: '2026-06-01T08:00:00.000Z',
            planEndDate: '2026-06-01T12:00:00.000Z',
            overallUtilizationRate: 0.86,
            onTimeDeliveryRate: 0.93,
            totalChangeoverMinutes: 28,
            groupCount: 1,
            createdAt: '2026-06-01T08:00:00.000Z',
            items: [{
              id: 'balanced-duplicate-objective-a-item-1',
              workOrderId: 'balanced-duplicate-objective-a-wo-1',
              workOrderNumber: 'WO-BALANCED-DUPLICATE-A-001',
              equipmentId: 'balanced-eq-1',
              equipmentName: 'CNC 多目标对比机台 A',
              plannedStartTime: '2026-06-01T08:00:00.000Z',
              plannedEndTime: '2026-06-01T12:00:00.000Z',
              sequence: 1,
              setupTime: '20 分钟',
              dependentItems: [],
            }],
          },
          utilizationRate: 0.86,
          onTimeDeliveryRate: 0.93,
          totalChangeoverMinutes: 28,
          groupCount: 1,
          estimatedCompletionRate: 0.92,
          totalWorkOrders: 1,
        },
        {
          objective: 'balanced',
          objectiveLabel: '综合平衡 B',
          plan: {
            id: 'balanced-duplicate-objective-plan-b',
            planName: '综合平衡方案 B',
            planStartDate: '2026-06-01T13:00:00.000Z',
            planEndDate: '2026-06-01T17:00:00.000Z',
            overallUtilizationRate: 0.82,
            onTimeDeliveryRate: 0.9,
            totalChangeoverMinutes: 35,
            groupCount: 1,
            createdAt: '2026-06-01T08:00:00.000Z',
            items: [{
              id: 'balanced-duplicate-objective-b-item-1',
              workOrderId: 'balanced-duplicate-objective-b-wo-1',
              workOrderNumber: 'WO-BALANCED-DUPLICATE-B-001',
              equipmentId: 'balanced-eq-2',
              equipmentName: 'CNC 多目标对比机台 B',
              plannedStartTime: '2026-06-01T13:00:00.000Z',
              plannedEndTime: '2026-06-01T17:00:00.000Z',
              sequence: 1,
              setupTime: '20 分钟',
              dependentItems: [],
            }],
          },
          utilizationRate: 0.82,
          onTimeDeliveryRate: 0.9,
          totalChangeoverMinutes: 35,
          groupCount: 1,
          estimatedCompletionRate: 0.88,
          totalWorkOrders: 1,
        },
      ],
    })
    const wrapper = mountCompare(false)
    await wrapper.setProps({ visible: true })
    await flushPromises()

    const alert = wrapper.get('.error-msg')
    expect(alert.attributes('role')).toBe('alert')
    expect(alert.text()).toContain('批量优化对比失败')
    expect(alert.text()).toContain('后端对比方案目标标识重复')
    expect(wrapper.find('.recommend-card').exists()).toBe(false)
    expect(wrapper.find('.recommend-apply-btn').exists()).toBe(false)
    expect(wrapper.emitted('apply')).toBeUndefined()
  })

  it('fails loud when distinct objectives reuse the same plan id', async () => {
    batchOptimize.mockResolvedValueOnce({
      bestOverallObjective: 'balanced',
      items: [
        {
          objective: 'due_date',
          objectiveLabel: '交期优先',
          plan: {
            id: 'shared-plan-id',
            planName: '交期优先方案',
            planStartDate: '2026-06-01T08:00:00.000Z',
            planEndDate: '2026-06-01T12:00:00.000Z',
            overallUtilizationRate: 0.72,
            onTimeDeliveryRate: 0.96,
            totalChangeoverMinutes: 40,
            groupCount: 1,
            createdAt: '2026-06-01T08:00:00.000Z',
            items: [{
              id: 'duplicate-plan-id-due-date-item-1',
              workOrderId: 'duplicate-plan-id-due-date-wo-1',
              workOrderNumber: 'WO-DUPLICATE-PLAN-DUE-001',
              equipmentId: 'duplicate-plan-id-eq-1',
              equipmentName: 'CNC 多目标对比机台 A',
              plannedStartTime: '2026-06-01T08:00:00.000Z',
              plannedEndTime: '2026-06-01T12:00:00.000Z',
              sequence: 1,
              setupTime: '20 分钟',
              dependentItems: [],
            }],
          },
          utilizationRate: 0.72,
          onTimeDeliveryRate: 0.96,
          totalChangeoverMinutes: 40,
          groupCount: 1,
          estimatedCompletionRate: 0.9,
          totalWorkOrders: 1,
        },
        {
          objective: 'balanced',
          objectiveLabel: '综合平衡',
          plan: {
            id: 'shared-plan-id',
            planName: '综合平衡方案',
            planStartDate: '2026-06-01T13:00:00.000Z',
            planEndDate: '2026-06-01T17:00:00.000Z',
            overallUtilizationRate: 0.86,
            onTimeDeliveryRate: 0.93,
            totalChangeoverMinutes: 28,
            groupCount: 1,
            createdAt: '2026-06-01T08:00:00.000Z',
            items: [{
              id: 'duplicate-plan-id-balanced-item-1',
              workOrderId: 'duplicate-plan-id-balanced-wo-1',
              workOrderNumber: 'WO-DUPLICATE-PLAN-BALANCED-001',
              equipmentId: 'duplicate-plan-id-eq-2',
              equipmentName: 'CNC 多目标对比机台 B',
              plannedStartTime: '2026-06-01T13:00:00.000Z',
              plannedEndTime: '2026-06-01T17:00:00.000Z',
              sequence: 1,
              setupTime: '20 分钟',
              dependentItems: [],
            }],
          },
          utilizationRate: 0.86,
          onTimeDeliveryRate: 0.93,
          totalChangeoverMinutes: 28,
          groupCount: 1,
          estimatedCompletionRate: 0.92,
          totalWorkOrders: 1,
        },
      ],
    })
    const wrapper = mountCompare(false)
    await wrapper.setProps({ visible: true })
    await flushPromises()

    const alert = wrapper.get('.error-msg')
    expect(alert.attributes('role')).toBe('alert')
    expect(alert.text()).toContain('批量优化对比失败')
    expect(alert.text()).toContain('后端对比方案排产计划标识重复')
    expect(wrapper.find('.recommend-card').exists()).toBe(false)
    expect(wrapper.find('.recommend-apply-btn').exists()).toBe(false)
    expect(wrapper.emitted('apply')).toBeUndefined()
  })

  it('fails loud when a comparable item is missing its plan id', async () => {
    batchOptimize.mockResolvedValueOnce({
      bestOverallObjective: 'balanced',
      items: [{
        objective: 'balanced',
        objectiveLabel: '综合平衡',
        plan: {
          id: '   ',
          planName: '综合平衡方案',
          planStartDate: '2026-06-01T08:00:00.000Z',
          planEndDate: '2026-06-01T12:00:00.000Z',
          overallUtilizationRate: 0.86,
          onTimeDeliveryRate: 0.93,
          totalChangeoverMinutes: 28,
          groupCount: 1,
          createdAt: '2026-06-01T08:00:00.000Z',
          items: [{
            id: 'balanced-missing-plan-id-item-1',
            workOrderId: 'balanced-missing-plan-id-wo-1',
            workOrderNumber: 'WO-BALANCED-MISSING-PLAN-ID-001',
            equipmentId: 'balanced-eq-1',
            equipmentName: 'CNC 多目标对比机台',
            plannedStartTime: '2026-06-01T08:00:00.000Z',
            plannedEndTime: '2026-06-01T12:00:00.000Z',
            sequence: 1,
            setupTime: '20 分钟',
            dependentItems: [],
          }],
        },
        utilizationRate: 0.86,
        onTimeDeliveryRate: 0.93,
        totalChangeoverMinutes: 28,
        groupCount: 1,
        estimatedCompletionRate: 0.92,
        totalWorkOrders: 1,
      }],
    })
    const wrapper = mountCompare(false)
    await wrapper.setProps({ visible: true })
    await flushPromises()

    const alert = wrapper.get('.error-msg')
    expect(alert.attributes('role')).toBe('alert')
    expect(alert.text()).toContain('批量优化对比失败')
    expect(alert.text()).toContain('后端对比方案缺少排产计划标识')
    expect(wrapper.find('.recommend-card').exists()).toBe(false)
    expect(wrapper.find('.recommend-apply-btn').exists()).toBe(false)
    expect(wrapper.emitted('apply')).toBeUndefined()
  })

  it('fails loud when a comparable item is missing its schedule plan', async () => {
    batchOptimize.mockResolvedValueOnce({
      bestOverallObjective: 'balanced',
      items: [{
        objective: 'balanced',
        objectiveLabel: '综合平衡',
        utilizationRate: 0.86,
        onTimeDeliveryRate: 0.93,
        totalChangeoverMinutes: 28,
        groupCount: 1,
        estimatedCompletionRate: 0.92,
        totalWorkOrders: 1,
      }],
    })
    const wrapper = mountCompare(false)
    await wrapper.setProps({ visible: true })
    await flushPromises()

    const alert = wrapper.get('.error-msg')
    expect(alert.attributes('role')).toBe('alert')
    expect(alert.text()).toContain('批量优化对比失败')
    expect(alert.text()).toContain('后端对比方案缺少排产计划')
    expect(wrapper.find('.recommend-card').exists()).toBe(false)
    expect(wrapper.find('.recommend-apply-btn').exists()).toBe(false)
    expect(wrapper.emitted('apply')).toBeUndefined()
  })

  it('fails loud when a comparable item reports work orders without plan details', async () => {
    batchOptimize.mockResolvedValueOnce({
      bestOverallObjective: 'balanced',
      items: [{
        objective: 'balanced',
        objectiveLabel: '综合平衡',
        plan: {
          id: 'balanced-plan-without-items',
          planName: '综合平衡方案',
          planStartDate: '2026-06-01T08:00:00.000Z',
          planEndDate: '2026-06-01T12:00:00.000Z',
          overallUtilizationRate: 0.86,
          onTimeDeliveryRate: 0.93,
          totalChangeoverMinutes: 28,
          groupCount: 1,
          createdAt: '2026-06-01T08:00:00.000Z',
          items: [],
        },
        utilizationRate: 0.86,
        onTimeDeliveryRate: 0.93,
        totalChangeoverMinutes: 28,
        groupCount: 1,
        estimatedCompletionRate: 0.92,
        totalWorkOrders: 1,
      }],
    })
    const wrapper = mountCompare(false)
    await wrapper.setProps({ visible: true })
    await flushPromises()

    const alert = wrapper.get('.error-msg')
    expect(alert.attributes('role')).toBe('alert')
    expect(alert.text()).toContain('批量优化对比失败')
    expect(alert.text()).toContain('后端对比方案计划明细为空')
    expect(wrapper.find('.recommend-card').exists()).toBe(false)
    expect(wrapper.find('.recommend-apply-btn').exists()).toBe(false)
    expect(wrapper.emitted('apply')).toBeUndefined()
  })

  it('fails loud when a comparable item work order count differs from plan details', async () => {
    batchOptimize.mockResolvedValueOnce({
      bestOverallObjective: 'balanced',
      items: [{
        objective: 'balanced',
        objectiveLabel: '综合平衡',
        plan: {
          id: 'balanced-plan-with-workorder-count-mismatch',
          planName: '综合平衡方案',
          planStartDate: '2026-06-01T08:00:00.000Z',
          planEndDate: '2026-06-01T12:00:00.000Z',
          overallUtilizationRate: 0.86,
          onTimeDeliveryRate: 0.93,
          totalChangeoverMinutes: 28,
          groupCount: 1,
          createdAt: '2026-06-01T08:00:00.000Z',
          items: [{
            id: 'balanced-workorder-count-item-1',
            workOrderId: 'balanced-workorder-count-wo-1',
            workOrderNumber: 'WO-BALANCED-WORKORDER-COUNT-001',
            equipmentId: 'balanced-eq-1',
            equipmentName: 'CNC 多目标对比机台',
            plannedStartTime: '2026-06-01T08:00:00.000Z',
            plannedEndTime: '2026-06-01T12:00:00.000Z',
            sequence: 1,
            setupTime: '20 分钟',
            dependentItems: [],
          }],
        },
        utilizationRate: 0.86,
        onTimeDeliveryRate: 0.93,
        totalChangeoverMinutes: 28,
        groupCount: 1,
        estimatedCompletionRate: 0.92,
        totalWorkOrders: 2,
      }],
    })
    const wrapper = mountCompare(false)
    await wrapper.setProps({ visible: true })
    await flushPromises()

    const alert = wrapper.get('.error-msg')
    expect(alert.attributes('role')).toBe('alert')
    expect(alert.text()).toContain('批量优化对比失败')
    expect(alert.text()).toContain('后端对比方案工单数与计划明细不一致')
    expect(wrapper.find('.recommend-card').exists()).toBe(false)
    expect(wrapper.find('.recommend-apply-btn').exists()).toBe(false)
    expect(wrapper.emitted('apply')).toBeUndefined()
  })

  it('fails loud when comparable KPI rates exceed the valid ratio range', async () => {
    batchOptimize.mockResolvedValueOnce({
      bestOverallObjective: 'balanced',
      items: [{
        objective: 'balanced',
        objectiveLabel: '综合平衡',
        plan: {
          id: 'balanced-plan-with-invalid-kpi-rate',
          planName: '综合平衡方案',
          planStartDate: '2026-06-01T08:00:00.000Z',
          planEndDate: '2026-06-01T12:00:00.000Z',
          overallUtilizationRate: 0.86,
          onTimeDeliveryRate: 0.93,
          totalChangeoverMinutes: 28,
          groupCount: 1,
          createdAt: '2026-06-01T08:00:00.000Z',
          items: [{
            id: 'balanced-invalid-kpi-rate-item-1',
            workOrderId: 'balanced-invalid-kpi-rate-wo-1',
            workOrderNumber: 'WO-BALANCED-INVALID-KPI-RATE-001',
            equipmentId: 'balanced-eq-1',
            equipmentName: 'CNC 多目标对比机台',
            plannedStartTime: '2026-06-01T08:00:00.000Z',
            plannedEndTime: '2026-06-01T12:00:00.000Z',
            sequence: 1,
            setupTime: '20 分钟',
            dependentItems: [],
          }],
        },
        utilizationRate: 1.2,
        onTimeDeliveryRate: 0.93,
        totalChangeoverMinutes: 28,
        groupCount: 1,
        estimatedCompletionRate: 0.92,
        totalWorkOrders: 1,
      }],
    })
    const wrapper = mountCompare(false)
    await wrapper.setProps({ visible: true })
    await flushPromises()

    const alert = wrapper.get('.error-msg')
    expect(alert.attributes('role')).toBe('alert')
    expect(alert.text()).toContain('批量优化对比失败')
    expect(alert.text()).toContain('后端对比方案指标超出有效范围')
    expect(wrapper.find('.recommend-card').exists()).toBe(false)
    expect(wrapper.find('.recommend-apply-btn').exists()).toBe(false)
    expect(wrapper.emitted('apply')).toBeUndefined()
  })

  it('fails loud when a comparable item has an invalid group count', async () => {
    batchOptimize.mockResolvedValueOnce({
      bestOverallObjective: 'balanced',
      items: [{
        objective: 'balanced',
        objectiveLabel: '综合平衡',
        plan: {
          id: 'balanced-plan-with-invalid-group-count',
          planName: '综合平衡方案',
          planStartDate: '2026-06-01T08:00:00.000Z',
          planEndDate: '2026-06-01T12:00:00.000Z',
          overallUtilizationRate: 0.86,
          onTimeDeliveryRate: 0.93,
          totalChangeoverMinutes: 28,
          groupCount: -1,
          createdAt: '2026-06-01T08:00:00.000Z',
          items: [{
            id: 'balanced-invalid-group-count-item-1',
            workOrderId: 'balanced-invalid-group-count-wo-1',
            workOrderNumber: 'WO-BALANCED-INVALID-GROUP-COUNT-001',
            equipmentId: 'balanced-eq-1',
            equipmentName: 'CNC 多目标对比机台',
            plannedStartTime: '2026-06-01T08:00:00.000Z',
            plannedEndTime: '2026-06-01T12:00:00.000Z',
            sequence: 1,
            setupTime: '20 分钟',
            dependentItems: [],
          }],
        },
        utilizationRate: 0.86,
        onTimeDeliveryRate: 0.93,
        totalChangeoverMinutes: 28,
        groupCount: -1,
        estimatedCompletionRate: 0.92,
        totalWorkOrders: 1,
      }],
    })
    const wrapper = mountCompare(false)
    await wrapper.setProps({ visible: true })
    await flushPromises()

    const alert = wrapper.get('.error-msg')
    expect(alert.attributes('role')).toBe('alert')
    expect(alert.text()).toContain('批量优化对比失败')
    expect(alert.text()).toContain('后端对比方案分组数无效')
    expect(wrapper.find('.recommend-card').exists()).toBe(false)
    expect(wrapper.find('.recommend-apply-btn').exists()).toBe(false)
    expect(wrapper.emitted('apply')).toBeUndefined()
  })

  it('fails loud when a comparable item group count differs from its plan summary', async () => {
    batchOptimize.mockResolvedValueOnce({
      bestOverallObjective: 'balanced',
      items: [{
        objective: 'balanced',
        objectiveLabel: '综合平衡',
        plan: {
          id: 'balanced-plan-with-group-count-mismatch',
          planName: '综合平衡方案',
          planStartDate: '2026-06-01T08:00:00.000Z',
          planEndDate: '2026-06-01T12:00:00.000Z',
          overallUtilizationRate: 0.86,
          onTimeDeliveryRate: 0.93,
          totalChangeoverMinutes: 28,
          groupCount: 2,
          createdAt: '2026-06-01T08:00:00.000Z',
          items: [{
            id: 'balanced-group-count-mismatch-item-1',
            workOrderId: 'balanced-group-count-mismatch-wo-1',
            workOrderNumber: 'WO-BALANCED-GROUP-COUNT-MISMATCH-001',
            equipmentId: 'balanced-eq-1',
            equipmentName: 'CNC 多目标对比机台',
            plannedStartTime: '2026-06-01T08:00:00.000Z',
            plannedEndTime: '2026-06-01T12:00:00.000Z',
            sequence: 1,
            setupTime: '20 分钟',
            dependentItems: [],
          }],
        },
        utilizationRate: 0.86,
        onTimeDeliveryRate: 0.93,
        totalChangeoverMinutes: 28,
        groupCount: 1,
        estimatedCompletionRate: 0.92,
        totalWorkOrders: 1,
      }],
    })
    const wrapper = mountCompare(false)
    await wrapper.setProps({ visible: true })
    await flushPromises()

    const alert = wrapper.get('.error-msg')
    expect(alert.attributes('role')).toBe('alert')
    expect(alert.text()).toContain('批量优化对比失败')
    expect(alert.text()).toContain('后端对比方案分组数与计划摘要不一致')
    expect(wrapper.find('.recommend-card').exists()).toBe(false)
    expect(wrapper.find('.recommend-apply-btn').exists()).toBe(false)
    expect(wrapper.emitted('apply')).toBeUndefined()
  })

  it('fails loud when comparable utilization rate differs from its plan summary', async () => {
    batchOptimize.mockResolvedValueOnce({
      bestOverallObjective: 'balanced',
      items: [{
        objective: 'balanced',
        objectiveLabel: '综合平衡',
        plan: {
          id: 'balanced-plan-with-utilization-mismatch',
          planName: '综合平衡方案',
          planStartDate: '2026-06-01T08:00:00.000Z',
          planEndDate: '2026-06-01T12:00:00.000Z',
          overallUtilizationRate: 0.72,
          onTimeDeliveryRate: 0.93,
          totalChangeoverMinutes: 28,
          groupCount: 1,
          createdAt: '2026-06-01T08:00:00.000Z',
          items: [{
            id: 'balanced-utilization-mismatch-item-1',
            workOrderId: 'balanced-utilization-mismatch-wo-1',
            workOrderNumber: 'WO-BALANCED-UTILIZATION-MISMATCH-001',
            equipmentId: 'balanced-eq-1',
            equipmentName: 'CNC 多目标对比机台',
            plannedStartTime: '2026-06-01T08:00:00.000Z',
            plannedEndTime: '2026-06-01T12:00:00.000Z',
            sequence: 1,
            setupTime: '20 分钟',
            dependentItems: [],
          }],
        },
        utilizationRate: 0.86,
        onTimeDeliveryRate: 0.93,
        totalChangeoverMinutes: 28,
        groupCount: 1,
        estimatedCompletionRate: 0.92,
        totalWorkOrders: 1,
      }],
    })
    const wrapper = mountCompare(false)
    await wrapper.setProps({ visible: true })
    await flushPromises()

    const alert = wrapper.get('.error-msg')
    expect(alert.attributes('role')).toBe('alert')
    expect(alert.text()).toContain('批量优化对比失败')
    expect(alert.text()).toContain('后端对比方案利用率与计划摘要不一致')
    expect(wrapper.find('.recommend-card').exists()).toBe(false)
    expect(wrapper.find('.recommend-apply-btn').exists()).toBe(false)
    expect(wrapper.emitted('apply')).toBeUndefined()
  })

  it('fails loud when comparable on-time delivery rate differs from its plan summary', async () => {
    batchOptimize.mockResolvedValueOnce({
      bestOverallObjective: 'balanced',
      items: [{
        objective: 'balanced',
        objectiveLabel: '综合平衡',
        plan: {
          id: 'balanced-plan-with-otd-mismatch',
          planName: '综合平衡方案',
          planStartDate: '2026-06-01T08:00:00.000Z',
          planEndDate: '2026-06-01T12:00:00.000Z',
          overallUtilizationRate: 0.86,
          onTimeDeliveryRate: 0.74,
          totalChangeoverMinutes: 28,
          groupCount: 1,
          createdAt: '2026-06-01T08:00:00.000Z',
          items: [{
            id: 'balanced-otd-mismatch-item-1',
            workOrderId: 'balanced-otd-mismatch-wo-1',
            workOrderNumber: 'WO-BALANCED-OTD-MISMATCH-001',
            equipmentId: 'balanced-eq-1',
            equipmentName: 'CNC 多目标对比机台',
            plannedStartTime: '2026-06-01T08:00:00.000Z',
            plannedEndTime: '2026-06-01T12:00:00.000Z',
            sequence: 1,
            setupTime: '20 分钟',
            dependentItems: [],
          }],
        },
        utilizationRate: 0.86,
        onTimeDeliveryRate: 0.93,
        totalChangeoverMinutes: 28,
        groupCount: 1,
        estimatedCompletionRate: 0.92,
        totalWorkOrders: 1,
      }],
    })
    const wrapper = mountCompare(false)
    await wrapper.setProps({ visible: true })
    await flushPromises()

    const alert = wrapper.get('.error-msg')
    expect(alert.attributes('role')).toBe('alert')
    expect(alert.text()).toContain('批量优化对比失败')
    expect(alert.text()).toContain('后端对比方案准时率与计划摘要不一致')
    expect(wrapper.find('.recommend-card').exists()).toBe(false)
    expect(wrapper.find('.recommend-apply-btn').exists()).toBe(false)
    expect(wrapper.emitted('apply')).toBeUndefined()
  })

  it('fails loud when comparable changeover minutes are negative', async () => {
    batchOptimize.mockResolvedValueOnce({
      bestOverallObjective: 'balanced',
      items: [{
        objective: 'balanced',
        objectiveLabel: '综合平衡',
        plan: {
          id: 'balanced-plan-with-invalid-changeover-minutes',
          planName: '综合平衡方案',
          planStartDate: '2026-06-01T08:00:00.000Z',
          planEndDate: '2026-06-01T12:00:00.000Z',
          overallUtilizationRate: 0.86,
          onTimeDeliveryRate: 0.93,
          totalChangeoverMinutes: 28,
          groupCount: 1,
          createdAt: '2026-06-01T08:00:00.000Z',
          items: [{
            id: 'balanced-invalid-changeover-item-1',
            workOrderId: 'balanced-invalid-changeover-wo-1',
            workOrderNumber: 'WO-BALANCED-INVALID-CHANGEOVER-001',
            equipmentId: 'balanced-eq-1',
            equipmentName: 'CNC 多目标对比机台',
            plannedStartTime: '2026-06-01T08:00:00.000Z',
            plannedEndTime: '2026-06-01T12:00:00.000Z',
            sequence: 1,
            setupTime: '20 分钟',
            dependentItems: [],
          }],
        },
        utilizationRate: 0.86,
        onTimeDeliveryRate: 0.93,
        totalChangeoverMinutes: -5,
        groupCount: 1,
        estimatedCompletionRate: 0.92,
        totalWorkOrders: 1,
      }],
    })
    const wrapper = mountCompare(false)
    await wrapper.setProps({ visible: true })
    await flushPromises()

    const alert = wrapper.get('.error-msg')
    expect(alert.attributes('role')).toBe('alert')
    expect(alert.text()).toContain('批量优化对比失败')
    expect(alert.text()).toContain('后端对比方案换型分钟无效')
    expect(wrapper.find('.recommend-card').exists()).toBe(false)
    expect(wrapper.find('.recommend-apply-btn').exists()).toBe(false)
    expect(wrapper.emitted('apply')).toBeUndefined()
  })

  it('fails loud when comparable changeover minutes differ from its plan summary', async () => {
    batchOptimize.mockResolvedValueOnce({
      bestOverallObjective: 'balanced',
      items: [{
        objective: 'balanced',
        objectiveLabel: '综合平衡',
        plan: {
          id: 'balanced-plan-with-changeover-mismatch',
          planName: '综合平衡方案',
          planStartDate: '2026-06-01T08:00:00.000Z',
          planEndDate: '2026-06-01T12:00:00.000Z',
          overallUtilizationRate: 0.86,
          onTimeDeliveryRate: 0.93,
          totalChangeoverMinutes: 60,
          groupCount: 1,
          createdAt: '2026-06-01T08:00:00.000Z',
          items: [{
            id: 'balanced-changeover-mismatch-item-1',
            workOrderId: 'balanced-changeover-mismatch-wo-1',
            workOrderNumber: 'WO-BALANCED-CHANGEOVER-MISMATCH-001',
            equipmentId: 'balanced-eq-1',
            equipmentName: 'CNC 多目标对比机台',
            plannedStartTime: '2026-06-01T08:00:00.000Z',
            plannedEndTime: '2026-06-01T12:00:00.000Z',
            sequence: 1,
            setupTime: '20 分钟',
            dependentItems: [],
          }],
        },
        utilizationRate: 0.86,
        onTimeDeliveryRate: 0.93,
        totalChangeoverMinutes: 28,
        groupCount: 1,
        estimatedCompletionRate: 0.92,
        totalWorkOrders: 1,
      }],
    })
    const wrapper = mountCompare(false)
    await wrapper.setProps({ visible: true })
    await flushPromises()

    const alert = wrapper.get('.error-msg')
    expect(alert.attributes('role')).toBe('alert')
    expect(alert.text()).toContain('批量优化对比失败')
    expect(alert.text()).toContain('后端对比方案换型分钟与计划摘要不一致')
    expect(wrapper.find('.recommend-card').exists()).toBe(false)
    expect(wrapper.find('.recommend-apply-btn').exists()).toBe(false)
    expect(wrapper.emitted('apply')).toBeUndefined()
  })

  it('fails loud when a comparable item contains a plan task without a time window', async () => {
    batchOptimize.mockResolvedValueOnce({
      bestOverallObjective: 'balanced',
      items: [{
        objective: 'balanced',
        objectiveLabel: '综合平衡',
        plan: {
          id: 'balanced-plan-without-task-window',
          planName: '综合平衡方案',
          planStartDate: '2026-06-01T08:00:00.000Z',
          planEndDate: '2026-06-01T12:00:00.000Z',
          overallUtilizationRate: 0.86,
          onTimeDeliveryRate: 0.93,
          totalChangeoverMinutes: 28,
          groupCount: 1,
          createdAt: '2026-06-01T08:00:00.000Z',
          items: [{
            id: 'balanced-item-without-window',
            workOrderId: 'balanced-wo-without-window',
            workOrderNumber: 'WO-BALANCED-NO-WINDOW',
            equipmentId: 'balanced-eq-1',
            equipmentName: 'CNC 多目标对比机台',
            plannedEndTime: '2026-06-01T12:00:00.000Z',
            sequence: 1,
            setupTime: '20 分钟',
            dependentItems: [],
          } as unknown],
        },
        utilizationRate: 0.86,
        onTimeDeliveryRate: 0.93,
        totalChangeoverMinutes: 28,
        groupCount: 1,
        estimatedCompletionRate: 0.92,
        totalWorkOrders: 1,
      }],
    })
    const wrapper = mountCompare(false)
    await wrapper.setProps({ visible: true })
    await flushPromises()

    const alert = wrapper.get('.error-msg')
    expect(alert.attributes('role')).toBe('alert')
    expect(alert.text()).toContain('批量优化对比失败')
    expect(alert.text()).toContain('后端对比方案计划项缺少时间窗')
    expect(wrapper.find('.recommend-card').exists()).toBe(false)
    expect(wrapper.find('.recommend-apply-btn').exists()).toBe(false)
    expect(wrapper.emitted('apply')).toBeUndefined()
  })

  it('fails loud when a comparable item contains an invalid plan task time window', async () => {
    batchOptimize.mockResolvedValueOnce({
      bestOverallObjective: 'balanced',
      items: [{
        objective: 'balanced',
        objectiveLabel: '综合平衡',
        plan: {
          id: 'balanced-plan-with-invalid-task-window',
          planName: '综合平衡方案',
          planStartDate: '2026-06-01T08:00:00.000Z',
          planEndDate: '2026-06-01T12:00:00.000Z',
          overallUtilizationRate: 0.86,
          onTimeDeliveryRate: 0.93,
          totalChangeoverMinutes: 28,
          groupCount: 1,
          createdAt: '2026-06-01T08:00:00.000Z',
          items: [{
            id: 'balanced-item-invalid-window',
            workOrderId: 'balanced-wo-invalid-window',
            workOrderNumber: 'WO-BALANCED-INVALID-WINDOW',
            equipmentId: 'balanced-eq-1',
            equipmentName: 'CNC 多目标对比机台',
            plannedStartTime: '2026-06-01T12:00:00.000Z',
            plannedEndTime: '2026-06-01T08:00:00.000Z',
            sequence: 1,
            setupTime: '20 分钟',
            dependentItems: [],
          }],
        },
        utilizationRate: 0.86,
        onTimeDeliveryRate: 0.93,
        totalChangeoverMinutes: 28,
        groupCount: 1,
        estimatedCompletionRate: 0.92,
        totalWorkOrders: 1,
      }],
    })
    const wrapper = mountCompare(false)
    await wrapper.setProps({ visible: true })
    await flushPromises()

    const alert = wrapper.get('.error-msg')
    expect(alert.attributes('role')).toBe('alert')
    expect(alert.text()).toContain('批量优化对比失败')
    expect(alert.text()).toContain('后端对比方案计划项时间窗无效')
    expect(wrapper.find('.recommend-card').exists()).toBe(false)
    expect(wrapper.find('.recommend-apply-btn').exists()).toBe(false)
    expect(wrapper.emitted('apply')).toBeUndefined()
  })

  it('fails loud when a comparable item contains a plan task without a resource anchor', async () => {
    batchOptimize.mockResolvedValueOnce({
      bestOverallObjective: 'balanced',
      items: [{
        objective: 'balanced',
        objectiveLabel: '综合平衡',
        plan: {
          id: 'balanced-plan-without-resource-anchor',
          planName: '综合平衡方案',
          planStartDate: '2026-06-01T08:00:00.000Z',
          planEndDate: '2026-06-01T12:00:00.000Z',
          overallUtilizationRate: 0.86,
          onTimeDeliveryRate: 0.93,
          totalChangeoverMinutes: 28,
          groupCount: 1,
          createdAt: '2026-06-01T08:00:00.000Z',
          items: [{
            id: 'balanced-item-without-resource-anchor',
            workOrderId: 'balanced-wo-without-resource-anchor',
            workOrderNumber: 'WO-BALANCED-NO-RESOURCE',
            equipmentName: 'CNC 多目标对比机台',
            plannedStartTime: '2026-06-01T08:00:00.000Z',
            plannedEndTime: '2026-06-01T12:00:00.000Z',
            sequence: 1,
            setupTime: '20 分钟',
            dependentItems: [],
          } as unknown],
        },
        utilizationRate: 0.86,
        onTimeDeliveryRate: 0.93,
        totalChangeoverMinutes: 28,
        groupCount: 1,
        estimatedCompletionRate: 0.92,
        totalWorkOrders: 1,
      }],
    })
    const wrapper = mountCompare(false)
    await wrapper.setProps({ visible: true })
    await flushPromises()

    const alert = wrapper.get('.error-msg')
    expect(alert.attributes('role')).toBe('alert')
    expect(alert.text()).toContain('批量优化对比失败')
    expect(alert.text()).toContain('后端对比方案计划项缺少工单或设备锚点')
    expect(wrapper.find('.recommend-card').exists()).toBe(false)
    expect(wrapper.find('.recommend-apply-btn').exists()).toBe(false)
    expect(wrapper.emitted('apply')).toBeUndefined()
  })

  it('fails loud when a comparable item contains a plan task without a task identity', async () => {
    batchOptimize.mockResolvedValueOnce({
      bestOverallObjective: 'balanced',
      items: [{
        objective: 'balanced',
        objectiveLabel: '综合平衡',
        plan: {
          id: 'balanced-plan-without-task-identity',
          planName: '综合平衡方案',
          planStartDate: '2026-06-01T08:00:00.000Z',
          planEndDate: '2026-06-01T12:00:00.000Z',
          overallUtilizationRate: 0.86,
          onTimeDeliveryRate: 0.93,
          totalChangeoverMinutes: 28,
          groupCount: 1,
          createdAt: '2026-06-01T08:00:00.000Z',
          items: [{
            workOrderId: 'balanced-wo-without-task-identity',
            workOrderNumber: 'WO-BALANCED-NO-TASK-ID',
            equipmentId: 'balanced-eq-1',
            equipmentName: 'CNC 多目标对比机台',
            plannedStartTime: '2026-06-01T08:00:00.000Z',
            plannedEndTime: '2026-06-01T12:00:00.000Z',
            sequence: 1,
            setupTime: '20 分钟',
            dependentItems: [],
          } as unknown],
        },
        utilizationRate: 0.86,
        onTimeDeliveryRate: 0.93,
        totalChangeoverMinutes: 28,
        groupCount: 1,
        estimatedCompletionRate: 0.92,
        totalWorkOrders: 1,
      }],
    })
    const wrapper = mountCompare(false)
    await wrapper.setProps({ visible: true })
    await flushPromises()

    const alert = wrapper.get('.error-msg')
    expect(alert.attributes('role')).toBe('alert')
    expect(alert.text()).toContain('批量优化对比失败')
    expect(alert.text()).toContain('后端对比方案计划项缺少任务身份标识')
    expect(wrapper.find('.recommend-card').exists()).toBe(false)
    expect(wrapper.find('.recommend-apply-btn').exists()).toBe(false)
    expect(wrapper.emitted('apply')).toBeUndefined()
  })

  it('fails loud when a comparable item references a missing dependency task', async () => {
    batchOptimize.mockResolvedValueOnce({
      bestOverallObjective: 'balanced',
      items: [{
        objective: 'balanced',
        objectiveLabel: '综合平衡',
        plan: {
          id: 'balanced-plan-with-missing-dependency',
          planName: '综合平衡方案',
          planStartDate: '2026-06-01T08:00:00.000Z',
          planEndDate: '2026-06-01T12:00:00.000Z',
          overallUtilizationRate: 0.86,
          onTimeDeliveryRate: 0.93,
          totalChangeoverMinutes: 28,
          groupCount: 1,
          createdAt: '2026-06-01T08:00:00.000Z',
          items: [{
            id: 'balanced-item-with-missing-dependency',
            workOrderId: 'balanced-wo-with-missing-dependency',
            workOrderNumber: 'WO-BALANCED-MISSING-DEPENDENCY',
            equipmentId: 'balanced-eq-1',
            equipmentName: 'CNC 多目标对比机台',
            plannedStartTime: '2026-06-01T08:00:00.000Z',
            plannedEndTime: '2026-06-01T12:00:00.000Z',
            sequence: 1,
            setupTime: '20 分钟',
            dependentItems: ['missing-upstream-task'],
          }],
        },
        utilizationRate: 0.86,
        onTimeDeliveryRate: 0.93,
        totalChangeoverMinutes: 28,
        groupCount: 1,
        estimatedCompletionRate: 0.92,
        totalWorkOrders: 1,
      }],
    })
    const wrapper = mountCompare(false)
    await wrapper.setProps({ visible: true })
    await flushPromises()

    const alert = wrapper.get('.error-msg')
    expect(alert.attributes('role')).toBe('alert')
    expect(alert.text()).toContain('批量优化对比失败')
    expect(alert.text()).toContain('后端对比方案计划项依赖不存在')
    expect(wrapper.find('.recommend-card').exists()).toBe(false)
    expect(wrapper.find('.recommend-apply-btn').exists()).toBe(false)
    expect(wrapper.emitted('apply')).toBeUndefined()
  })

  it('fails loud when a comparable item depends on itself', async () => {
    batchOptimize.mockResolvedValueOnce({
      bestOverallObjective: 'balanced',
      items: [{
        objective: 'balanced',
        objectiveLabel: '综合平衡',
        plan: {
          id: 'balanced-plan-with-self-dependency',
          planName: '综合平衡方案',
          planStartDate: '2026-06-01T08:00:00.000Z',
          planEndDate: '2026-06-01T12:00:00.000Z',
          overallUtilizationRate: 0.86,
          onTimeDeliveryRate: 0.93,
          totalChangeoverMinutes: 28,
          groupCount: 1,
          createdAt: '2026-06-01T08:00:00.000Z',
          items: [{
            id: 'balanced-item-with-self-dependency',
            workOrderId: 'balanced-wo-with-self-dependency',
            workOrderNumber: 'WO-BALANCED-SELF-DEPENDENCY',
            equipmentId: 'balanced-eq-1',
            equipmentName: 'CNC 多目标对比机台',
            plannedStartTime: '2026-06-01T08:00:00.000Z',
            plannedEndTime: '2026-06-01T12:00:00.000Z',
            sequence: 1,
            setupTime: '20 分钟',
            dependentItems: ['balanced-item-with-self-dependency'],
          }],
        },
        utilizationRate: 0.86,
        onTimeDeliveryRate: 0.93,
        totalChangeoverMinutes: 28,
        groupCount: 1,
        estimatedCompletionRate: 0.92,
        totalWorkOrders: 1,
      }],
    })
    const wrapper = mountCompare(false)
    await wrapper.setProps({ visible: true })
    await flushPromises()

    const alert = wrapper.get('.error-msg')
    expect(alert.attributes('role')).toBe('alert')
    expect(alert.text()).toContain('批量优化对比失败')
    expect(alert.text()).toContain('后端对比方案计划项不能依赖自身')
    expect(wrapper.find('.recommend-card').exists()).toBe(false)
    expect(wrapper.find('.recommend-apply-btn').exists()).toBe(false)
    expect(wrapper.emitted('apply')).toBeUndefined()
  })

  it('fails loud when comparable items contain a dependency cycle', async () => {
    batchOptimize.mockResolvedValueOnce({
      bestOverallObjective: 'balanced',
      items: [{
        objective: 'balanced',
        objectiveLabel: '综合平衡',
        plan: {
          id: 'balanced-plan-with-dependency-cycle',
          planName: '综合平衡方案',
          planStartDate: '2026-06-01T08:00:00.000Z',
          planEndDate: '2026-06-01T16:00:00.000Z',
          overallUtilizationRate: 0.86,
          onTimeDeliveryRate: 0.93,
          totalChangeoverMinutes: 28,
          groupCount: 1,
          createdAt: '2026-06-01T08:00:00.000Z',
          items: [
            {
              id: 'balanced-cycle-item-a',
              workOrderId: 'balanced-cycle-wo-a',
              workOrderNumber: 'WO-BALANCED-CYCLE-A',
              equipmentId: 'balanced-eq-1',
              equipmentName: 'CNC 多目标对比机台',
              plannedStartTime: '2026-06-01T08:00:00.000Z',
              plannedEndTime: '2026-06-01T12:00:00.000Z',
              sequence: 1,
              setupTime: '20 分钟',
              dependentItems: ['balanced-cycle-item-b'],
            },
            {
              id: 'balanced-cycle-item-b',
              workOrderId: 'balanced-cycle-wo-b',
              workOrderNumber: 'WO-BALANCED-CYCLE-B',
              equipmentId: 'balanced-eq-1',
              equipmentName: 'CNC 多目标对比机台',
              plannedStartTime: '2026-06-01T12:00:00.000Z',
              plannedEndTime: '2026-06-01T16:00:00.000Z',
              sequence: 2,
              setupTime: '20 分钟',
              dependentItems: ['balanced-cycle-item-a'],
            },
          ],
        },
        utilizationRate: 0.86,
        onTimeDeliveryRate: 0.93,
        totalChangeoverMinutes: 28,
        groupCount: 1,
        estimatedCompletionRate: 0.92,
        totalWorkOrders: 2,
      }],
    })
    const wrapper = mountCompare(false)
    await wrapper.setProps({ visible: true })
    await flushPromises()

    const alert = wrapper.get('.error-msg')
    expect(alert.attributes('role')).toBe('alert')
    expect(alert.text()).toContain('批量优化对比失败')
    expect(alert.text()).toContain('后端对比方案计划项存在循环依赖')
    expect(wrapper.find('.recommend-card').exists()).toBe(false)
    expect(wrapper.find('.recommend-apply-btn').exists()).toBe(false)
    expect(wrapper.emitted('apply')).toBeUndefined()
  })

  it('fails loud when a comparable plan summary window does not cover its task windows', async () => {
    batchOptimize.mockResolvedValueOnce({
      bestOverallObjective: 'balanced',
      items: [{
        objective: 'balanced',
        objectiveLabel: '综合平衡',
        plan: {
          id: 'balanced-plan-with-short-summary-window',
          planName: '综合平衡方案',
          planStartDate: '2026-06-01T08:00:00.000Z',
          planEndDate: '2026-06-01T10:00:00.000Z',
          overallUtilizationRate: 0.86,
          onTimeDeliveryRate: 0.93,
          totalChangeoverMinutes: 28,
          groupCount: 1,
          createdAt: '2026-06-01T08:00:00.000Z',
          items: [{
            id: 'balanced-item-outside-summary-window',
            workOrderId: 'balanced-wo-outside-summary-window',
            workOrderNumber: 'WO-BALANCED-OUTSIDE-SUMMARY',
            equipmentId: 'balanced-eq-1',
            equipmentName: 'CNC 多目标对比机台',
            plannedStartTime: '2026-06-01T08:00:00.000Z',
            plannedEndTime: '2026-06-01T12:00:00.000Z',
            sequence: 1,
            setupTime: '20 分钟',
            dependentItems: [],
          }],
        },
        utilizationRate: 0.86,
        onTimeDeliveryRate: 0.93,
        totalChangeoverMinutes: 28,
        groupCount: 1,
        estimatedCompletionRate: 0.92,
        totalWorkOrders: 1,
      }],
    })
    const wrapper = mountCompare(false)
    await wrapper.setProps({ visible: true })
    await flushPromises()

    const alert = wrapper.get('.error-msg')
    expect(alert.attributes('role')).toBe('alert')
    expect(alert.text()).toContain('批量优化对比失败')
    expect(alert.text()).toContain('后端对比方案计划摘要时间窗未覆盖计划明细')
    expect(wrapper.find('.recommend-card').exists()).toBe(false)
    expect(wrapper.find('.recommend-apply-btn').exists()).toBe(false)
    expect(wrapper.emitted('apply')).toBeUndefined()
  })

  it('fails loud when comparable plan items overlap on the same equipment', async () => {
    batchOptimize.mockResolvedValueOnce({
      bestOverallObjective: 'balanced',
      items: [{
        objective: 'balanced',
        objectiveLabel: '综合平衡',
        plan: {
          id: 'balanced-plan-with-equipment-overlap',
          planName: '综合平衡方案',
          planStartDate: '2026-06-01T08:00:00.000Z',
          planEndDate: '2026-06-01T14:00:00.000Z',
          overallUtilizationRate: 0.86,
          onTimeDeliveryRate: 0.93,
          totalChangeoverMinutes: 28,
          groupCount: 1,
          createdAt: '2026-06-01T08:00:00.000Z',
          items: [
            {
              id: 'balanced-overlap-item-a',
              workOrderId: 'balanced-overlap-wo-a',
              workOrderNumber: 'WO-BALANCED-OVERLAP-A',
              equipmentId: 'balanced-eq-1',
              equipmentName: 'CNC 多目标对比机台',
              plannedStartTime: '2026-06-01T08:00:00.000Z',
              plannedEndTime: '2026-06-01T12:00:00.000Z',
              sequence: 1,
              setupTime: '20 分钟',
              dependentItems: [],
            },
            {
              id: 'balanced-overlap-item-b',
              workOrderId: 'balanced-overlap-wo-b',
              workOrderNumber: 'WO-BALANCED-OVERLAP-B',
              equipmentId: 'balanced-eq-1',
              equipmentName: 'CNC 多目标对比机台',
              plannedStartTime: '2026-06-01T10:00:00.000Z',
              plannedEndTime: '2026-06-01T14:00:00.000Z',
              sequence: 2,
              setupTime: '20 分钟',
              dependentItems: [],
            },
          ],
        },
        utilizationRate: 0.86,
        onTimeDeliveryRate: 0.93,
        totalChangeoverMinutes: 28,
        groupCount: 1,
        estimatedCompletionRate: 0.92,
        totalWorkOrders: 2,
      }],
    })
    const wrapper = mountCompare(false)
    await wrapper.setProps({ visible: true })
    await flushPromises()

    const alert = wrapper.get('.error-msg')
    expect(alert.attributes('role')).toBe('alert')
    expect(alert.text()).toContain('批量优化对比失败')
    expect(alert.text()).toContain('后端对比方案同设备计划项时间重叠')
    expect(wrapper.find('.recommend-card').exists()).toBe(false)
    expect(wrapper.find('.recommend-apply-btn').exists()).toBe(false)
    expect(wrapper.emitted('apply')).toBeUndefined()
  })

  it('fails loud when a comparable plan starts a dependent task before its dependency finishes', async () => {
    batchOptimize.mockResolvedValueOnce({
      bestOverallObjective: 'balanced',
      items: [{
        objective: 'balanced',
        objectiveLabel: '综合平衡',
        plan: {
          id: 'balanced-plan-with-dependency-window-conflict',
          planName: '综合平衡方案',
          planStartDate: '2026-06-01T08:00:00.000Z',
          planEndDate: '2026-06-01T14:00:00.000Z',
          overallUtilizationRate: 0.86,
          onTimeDeliveryRate: 0.93,
          totalChangeoverMinutes: 28,
          groupCount: 2,
          createdAt: '2026-06-01T08:00:00.000Z',
          items: [
            {
              id: 'balanced-dependency-upstream',
              workOrderId: 'balanced-dependency-upstream-wo',
              workOrderNumber: 'WO-BALANCED-DEPENDENCY-UPSTREAM',
              equipmentId: 'balanced-eq-1',
              equipmentName: 'CNC 多目标对比机台 A',
              plannedStartTime: '2026-06-01T08:00:00.000Z',
              plannedEndTime: '2026-06-01T12:00:00.000Z',
              sequence: 1,
              setupTime: '20 分钟',
              dependentItems: [],
            },
            {
              id: 'balanced-dependency-downstream',
              workOrderId: 'balanced-dependency-downstream-wo',
              workOrderNumber: 'WO-BALANCED-DEPENDENCY-DOWNSTREAM',
              equipmentId: 'balanced-eq-2',
              equipmentName: 'CNC 多目标对比机台 B',
              plannedStartTime: '2026-06-01T10:00:00.000Z',
              plannedEndTime: '2026-06-01T14:00:00.000Z',
              sequence: 1,
              setupTime: '20 分钟',
              dependentItems: ['balanced-dependency-upstream'],
            },
          ],
        },
        utilizationRate: 0.86,
        onTimeDeliveryRate: 0.93,
        totalChangeoverMinutes: 28,
        groupCount: 2,
        estimatedCompletionRate: 0.92,
        totalWorkOrders: 2,
      }],
    })
    const wrapper = mountCompare(false)
    await wrapper.setProps({ visible: true })
    await flushPromises()

    const alert = wrapper.get('.error-msg')
    expect(alert.attributes('role')).toBe('alert')
    expect(alert.text()).toContain('批量优化对比失败')
    expect(alert.text()).toContain('后端对比方案计划项依赖时间顺序无效')
    expect(wrapper.find('.recommend-card').exists()).toBe(false)
    expect(wrapper.find('.recommend-apply-btn').exists()).toBe(false)
    expect(wrapper.emitted('apply')).toBeUndefined()
  })

  it('fails loud when same-equipment plan item sequence runs against time order', async () => {
    batchOptimize.mockResolvedValueOnce({
      bestOverallObjective: 'balanced',
      items: [{
        objective: 'balanced',
        objectiveLabel: '综合平衡',
        plan: {
          id: 'balanced-plan-with-sequence-window-conflict',
          planName: '综合平衡方案',
          planStartDate: '2026-06-01T08:00:00.000Z',
          planEndDate: '2026-06-01T16:00:00.000Z',
          overallUtilizationRate: 0.86,
          onTimeDeliveryRate: 0.93,
          totalChangeoverMinutes: 28,
          groupCount: 1,
          createdAt: '2026-06-01T08:00:00.000Z',
          items: [
            {
              id: 'balanced-sequence-late-first',
              workOrderId: 'balanced-sequence-late-first-wo',
              workOrderNumber: 'WO-BALANCED-SEQUENCE-LATE-FIRST',
              equipmentId: 'balanced-eq-1',
              equipmentName: 'CNC 多目标对比机台',
              plannedStartTime: '2026-06-01T12:00:00.000Z',
              plannedEndTime: '2026-06-01T16:00:00.000Z',
              sequence: 1,
              setupTime: '20 分钟',
              dependentItems: [],
            },
            {
              id: 'balanced-sequence-early-second',
              workOrderId: 'balanced-sequence-early-second-wo',
              workOrderNumber: 'WO-BALANCED-SEQUENCE-EARLY-SECOND',
              equipmentId: 'balanced-eq-1',
              equipmentName: 'CNC 多目标对比机台',
              plannedStartTime: '2026-06-01T08:00:00.000Z',
              plannedEndTime: '2026-06-01T12:00:00.000Z',
              sequence: 2,
              setupTime: '20 分钟',
              dependentItems: [],
            },
          ],
        },
        utilizationRate: 0.86,
        onTimeDeliveryRate: 0.93,
        totalChangeoverMinutes: 28,
        groupCount: 1,
        estimatedCompletionRate: 0.92,
        totalWorkOrders: 2,
      }],
    })
    const wrapper = mountCompare(false)
    await wrapper.setProps({ visible: true })
    await flushPromises()

    const alert = wrapper.get('.error-msg')
    expect(alert.attributes('role')).toBe('alert')
    expect(alert.text()).toContain('批量优化对比失败')
    expect(alert.text()).toContain('后端对比方案同设备计划项顺序与时间不一致')
    expect(wrapper.find('.recommend-card').exists()).toBe(false)
    expect(wrapper.find('.recommend-apply-btn').exists()).toBe(false)
    expect(wrapper.emitted('apply')).toBeUndefined()
  })

  it('keeps the demo recommendation available for explicit offline demo mode', async () => {
    const offlineError = new Error('Offline demo mode skipped backend request: /api/v1/scheduling/optimize-compare')
    offlineError.name = 'OfflineDemoApiError'
    batchOptimize.mockRejectedValueOnce(offlineError)
    const wrapper = mountCompare(false)
    await wrapper.setProps({ visible: true })
    await flushPromises()

    const recommendation = wrapper.get('.recommend-card')
    expect(recommendation.attributes('role')).toBe('status')
    expect(recommendation.attributes('aria-live')).toBe('polite')
    expect(recommendation.text()).toContain('推荐方案')
    expect(recommendation.text()).toContain('综合平衡')

    await wrapper.get('.recommend-apply-btn').trigger('click')

    expect(wrapper.emitted('apply')).toEqual([['balanced']])
  })
})
