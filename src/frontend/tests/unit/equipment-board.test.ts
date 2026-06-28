import { flushPromises, mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import EquipmentBoard from '../../src/components/equipment/EquipmentBoard.vue'
import type { EquipmentDto, EquipmentStatisticsDto } from '../../src/types/equipment'

const getEquipmentList = vi.hoisted(() => vi.fn())
const getEquipmentStatistics = vi.hoisted(() => vi.fn())
const getHealthReport = vi.hoisted(() => vi.fn())
const getMaintenanceHistory = vi.hoisted(() => vi.fn())
const diagnose = vi.hoisted(() => vi.fn())
const routeQuery = vi.hoisted(() => ({ value: {} as Record<string, string> }))
const isOfflineDemoError = vi.hoisted(() =>
  vi.fn((error: unknown) => error instanceof Error && error.name === 'OfflineDemoApiError'),
)

vi.mock('vue-router', () => ({
  useRoute: () => ({ query: routeQuery.value }),
}))

vi.mock('../../src/api/equipment', () => ({
  diagnose,
  getEquipmentList,
  getEquipmentStatistics,
  getHealthReport,
  getMaintenanceHistory,
}))

vi.mock('../../src/utils/offline-demo-mode', () => ({
  isOfflineDemoError,
}))

vi.mock('../../src/components/equipment/EquipmentScheduleImpactPanel.vue', () => ({
  default: {
    template: '<section data-testid="equipment-schedule-impact-panel" />',
  },
}))

const stats: EquipmentStatisticsDto = {
  totalCount: 2,
  runningCount: 1,
  idleCount: 1,
  maintenanceCount: 0,
  faultCount: 0,
  offlineCount: 0,
  utilizationRate: 70,
  availabilityRate: 98,
}

const equipment: EquipmentDto[] = [
  {
    id: 'eq-cnc-1',
    equipmentCode: 'CNC-001',
    equipmentName: 'CNC-001 加工中心',
    equipmentType: 'CNC',
    workshopId: 'WS-001',
    workshopName: '机加工车间',
    status: 'running',
    capacity: 100,
    utilizationRate: 85,
    currentWorkOrderId: 'WO-001',
    createdAt: '2026-01-01T00:00:00',
  },
  {
    id: 'eq-asm-1',
    equipmentCode: 'ASM-001',
    equipmentName: 'ASM-001 装配线',
    equipmentType: 'Assembly',
    workshopId: 'WS-002',
    workshopName: '装配车间',
    status: 'idle',
    capacity: 60,
    utilizationRate: 45,
    currentWorkOrderId: '',
    createdAt: '2026-01-01T00:00:00',
  },
]

function mountEquipmentBoard() {
  return mount(EquipmentBoard)
}

describe('EquipmentBoard', () => {
  beforeEach(() => {
    routeQuery.value = {}
    getEquipmentStatistics.mockResolvedValue(stats)
    getEquipmentList.mockResolvedValue({
      items: equipment,
      totalCount: equipment.length,
    })
    getHealthReport.mockResolvedValue(null)
    getMaintenanceHistory.mockResolvedValue([])
    diagnose.mockResolvedValue(null)
    isOfflineDemoError.mockImplementation(
      (error: unknown) => error instanceof Error && error.name === 'OfflineDemoApiError',
    )
  })

  it('keeps only the selected equipment type when operators filter the list', async () => {
    const wrapper = mountEquipmentBoard()
    await flushPromises()

    const typeFilter = wrapper.findAll('.filter-select')[0]
    await typeFilter.setValue('CNC')

    const cards = wrapper.findAll('.eq-card')
    expect(cards).toHaveLength(1)
    expect(cards[0].text()).toContain('CNC-001 加工中心')
    expect(cards[0].text()).not.toContain('ASM-001 装配线')
  })

  it('alerts when the equipment list falls back after the backend is unavailable', async () => {
    getEquipmentList.mockRejectedValueOnce(new Error('equipment list api unavailable'))

    const wrapper = mountEquipmentBoard()
    await flushPromises()

    const alert = wrapper.get('[role="alert"]')
    expect(alert.text()).toContain('设备列表加载失败')
    expect(alert.text()).toContain('equipment list api unavailable')
    expect(wrapper.findAll('.eq-card')).toHaveLength(2)
    expect(wrapper.text()).toContain('CNC-001 加工中心')
  })

  it('quietly shows demo equipment when offline demo skips equipment list loading', async () => {
    const offlineDemoError = new Error('Offline demo mode skipped backend request: /api/v1/equipment')
    offlineDemoError.name = 'OfflineDemoApiError'
    getEquipmentList.mockRejectedValueOnce(offlineDemoError)

    const wrapper = mountEquipmentBoard()
    await flushPromises()

    expect(wrapper.findAll('.eq-card')).toHaveLength(2)
    expect(wrapper.text()).toContain('CNC-001 加工中心')
    expect(wrapper.find('[role="alert"]').exists()).toBe(false)
    expect(wrapper.text()).not.toContain('设备列表加载失败')
    expect(wrapper.text()).not.toContain('Offline demo mode skipped backend request')
  })

  it('alerts when equipment statistics fall back after the backend is unavailable', async () => {
    getEquipmentStatistics.mockRejectedValueOnce(new Error('statistics api unavailable'))

    const wrapper = mountEquipmentBoard()
    await flushPromises()

    const alert = wrapper.get('[role="alert"]')
    expect(alert.text()).toContain('设备统计加载失败')
    expect(alert.text()).toContain('statistics api unavailable')
    expect(wrapper.text()).toContain('4/8')
    expect(wrapper.text()).toContain('72%')
  })

  it('quietly shows demo statistics when offline demo skips equipment statistics loading', async () => {
    const offlineDemoError = new Error('Offline demo mode skipped backend request: /api/v1/equipment/statistics')
    offlineDemoError.name = 'OfflineDemoApiError'
    getEquipmentStatistics.mockRejectedValueOnce(offlineDemoError)

    const wrapper = mountEquipmentBoard()
    await flushPromises()

    expect(wrapper.text()).toContain('4/8')
    expect(wrapper.text()).toContain('72%')
    expect(wrapper.find('[role="alert"]').exists()).toBe(false)
    expect(wrapper.text()).not.toContain('设备统计加载失败')
    expect(wrapper.text()).not.toContain('Offline demo mode skipped backend request')
  })

  it('keeps the statistics fallback alert after a later equipment list refresh succeeds', async () => {
    getEquipmentStatistics.mockRejectedValueOnce(new Error('statistics api unavailable'))
    getEquipmentList
      .mockResolvedValueOnce({
        items: equipment,
        totalCount: equipment.length,
      })
      .mockResolvedValueOnce({
        items: [equipment[1]],
        totalCount: 1,
      })

    const wrapper = mountEquipmentBoard()
    await flushPromises()

    const statusFilter = wrapper.findAll('.filter-select')[1]
    await statusFilter.setValue('idle')
    await flushPromises()

    const alert = wrapper.get('[role="alert"]')
    expect(alert.text()).toContain('设备统计加载失败')
    expect(alert.text()).toContain('statistics api unavailable')
    expect(wrapper.text()).toContain('4/8')
  })

  it('clears the selected equipment detail when status filters remove it from the list', async () => {
    getEquipmentList
      .mockResolvedValueOnce({
        items: equipment,
        totalCount: equipment.length,
      })
      .mockResolvedValueOnce({
        items: [equipment[1]],
        totalCount: 1,
      })

    const wrapper = mountEquipmentBoard()
    await flushPromises()

    await wrapper.findAll('.eq-card')[0].trigger('click')
    expect(wrapper.get('.detail-panel').text()).toContain('CNC-001 加工中心')

    const statusFilter = wrapper.findAll('.filter-select')[1]
    await statusFilter.setValue('idle')
    await flushPromises()

    expect(wrapper.find('.detail-panel').exists()).toBe(false)
    expect(wrapper.text()).not.toContain('CNC-001 加工中心')
  })

  it('clears the selected equipment detail when type filters hide it from the visible list', async () => {
    const wrapper = mountEquipmentBoard()
    await flushPromises()

    await wrapper.findAll('.eq-card')[1].trigger('click')
    expect(wrapper.get('.detail-panel').text()).toContain('ASM-001 装配线')

    const typeFilter = wrapper.findAll('.filter-select')[0]
    await typeFilter.setValue('CNC')
    await flushPromises()

    expect(wrapper.find('.detail-panel').exists()).toBe(false)
    expect(wrapper.text()).not.toContain('ASM-001 装配线')
  })

  it('loads the next equipment page without carrying stale cards from the previous page', async () => {
    getEquipmentList
      .mockResolvedValueOnce({
        items: equipment,
        totalCount: 42,
      })
      .mockResolvedValueOnce({
        items: [
          {
            id: 'eq-laser-21',
            equipmentCode: 'LASER-021',
            equipmentName: 'LASER-021 激光切割站',
            equipmentType: 'Laser',
            workshopId: 'WS-003',
            workshopName: '钣金车间',
            status: 'maintenance',
            capacity: 40,
            utilizationRate: 32,
            currentWorkOrderId: 'WO-021',
            createdAt: '2026-01-02T00:00:00',
          },
        ],
        totalCount: 42,
      })

    const wrapper = mountEquipmentBoard()
    await flushPromises()

    expect(wrapper.get('.pagination-bar').text()).toContain('共 42 条')
    await wrapper.findAll('.page-btn').find(button => button.text() === '2')!.trigger('click')
    await flushPromises()

    expect(getEquipmentList).toHaveBeenLastCalledWith(undefined, undefined, 2, 20)
    expect(wrapper.findAll('.eq-card')).toHaveLength(1)
    expect(wrapper.text()).toContain('LASER-021 激光切割站')
    expect(wrapper.text()).not.toContain('CNC-001 加工中心')
  })

  it('alerts when health data falls back after the backend is unavailable', async () => {
    getHealthReport.mockRejectedValueOnce(new Error('health api unavailable'))

    const wrapper = mountEquipmentBoard()
    await flushPromises()

    await wrapper.findAll('.eq-card')[0].trigger('click')
    const healthTab = wrapper
      .findAll('.detail-tabs button')
      .find(button => button.text() === '健康监控')
    expect(healthTab).toBeTruthy()

    await healthTab!.trigger('click')
    await flushPromises()

    const alert = wrapper.get('[role="alert"]')
    expect(alert.text()).toContain('设备健康数据加载失败')
    expect(alert.text()).toContain('health api unavailable')
    expect(wrapper.get('.health-section').text()).toContain('健康分')
  })

  it('renders backend health anomalies and predicted failures for the selected equipment', async () => {
    getHealthReport.mockResolvedValueOnce({
      equipmentId: 'eq-cnc-1',
      equipmentName: 'CNC-001 加工中心',
      healthScore: 91,
      healthStatus: 'healthy',
      anomalies: [
        {
          parameterName: '主轴振动',
          value: 2.8,
          expectedValue: 3.5,
          deviation: -20,
          severity: 'normal',
        },
      ],
      predictedFailures: [
        {
          failureType: '冷却泵磨损',
          confidence: 0.84,
          estimatedTimeToFailure: '2026-06-20T08:00:00',
          recommendation: '下次停机窗口检查冷却泵叶轮。',
        },
      ],
      recommendedMaintenanceDate: '2026-06-18T08:00:00',
      maintenanceTasks: [],
    })
    const wrapper = mountEquipmentBoard()
    await flushPromises()

    await wrapper.findAll('.eq-card')[0].trigger('click')
    const healthTab = wrapper
      .findAll('.detail-tabs button')
      .find(button => button.text() === '健康监控')
    await healthTab!.trigger('click')
    await flushPromises()

    const section = wrapper.get('.health-section')
    expect(getHealthReport).toHaveBeenCalledWith('eq-cnc-1')
    expect(wrapper.find('[role="alert"]').exists()).toBe(false)
    expect(section.text()).toContain('91')
    expect(section.text()).toContain('健康')
    expect(section.text()).toContain('主轴振动')
    expect(section.text()).toContain('偏差 -20.0%')
    expect(section.text()).toContain('冷却泵磨损')
    expect(section.text()).toContain('置信度 84%')
    expect(section.text()).toContain('下次停机窗口检查冷却泵叶轮')
  })

  it('alerts when maintenance records fall back after the backend is unavailable', async () => {
    getMaintenanceHistory.mockRejectedValueOnce(new Error('maintenance api unavailable'))

    const wrapper = mountEquipmentBoard()
    await flushPromises()

    await wrapper.findAll('.eq-card')[0].trigger('click')
    const maintenanceTab = wrapper
      .findAll('.detail-tabs button')
      .find(button => button.text() === '维护记录')
    expect(maintenanceTab).toBeTruthy()

    await maintenanceTab!.trigger('click')
    await flushPromises()

    const alert = wrapper.get('[role="alert"]')
    expect(alert.text()).toContain('设备维护记录加载失败')
    expect(alert.text()).toContain('maintenance api unavailable')
    expect(wrapper.get('.maint-item').text()).toContain('季度保养')
  })

  it('renders backend maintenance records with result, cost, and spare parts', async () => {
    getMaintenanceHistory.mockResolvedValueOnce([
      {
        id: 'MT-CNC-20260615',
        equipmentId: 'eq-cnc-1',
        maintenanceType: 'corrective',
        description: '更换冷却泵并校准压力传感器',
        startTime: '2026-06-15T09:30:00',
        endTime: '2026-06-15T11:30:00',
        performedBy: '设备 张工',
        result: 'pending',
        cost: 6800,
        sparePartsUsed: ['冷却泵 P-220', '压力传感器 PS-08'],
      },
    ])
    const wrapper = mountEquipmentBoard()
    await flushPromises()

    await wrapper.findAll('.eq-card')[0].trigger('click')
    const maintenanceTab = wrapper
      .findAll('.detail-tabs button')
      .find(button => button.text() === '维护记录')
    await maintenanceTab!.trigger('click')
    await flushPromises()

    const item = wrapper.get('.maint-item')
    expect(getMaintenanceHistory).toHaveBeenCalledWith('eq-cnc-1')
    expect(wrapper.find('[role="alert"]').exists()).toBe(false)
    expect(item.text()).toContain('纠正性')
    expect(item.text()).toContain('待处理')
    expect(item.text()).toContain('更换冷却泵并校准压力传感器')
    expect(item.text()).toContain('执行人: 设备 张工')
    expect(item.text()).toContain('费用: ¥6,800')
    expect(item.text()).toContain('冷却泵 P-220、压力传感器 PS-08')
  })

  it('opens an audit-focused synthetic equipment detail when replay evidence targets a missing device', async () => {
    routeQuery.value = {
      auditObjectType: 'equipment',
      auditObjectId: 'eq-audit-missing-001',
      auditObjectLabel: 'CNC-AUDIT-09',
      auditTraceId: 'TRACE-EQ-DOWNTIME-20260615',
    }
    const wrapper = mountEquipmentBoard()
    await flushPromises()

    const banner = wrapper.get('.audit-focus-banner')
    expect(banner.text()).toContain('来自审计回放')
    expect(banner.text()).toContain('CNC-AUDIT-09')
    expect(banner.text()).toContain('eq-audit-missing-001')
    expect(banner.text()).toContain('TRACE-EQ-DOWNTIME-20260615')

    const cards = wrapper.findAll('.eq-card')
    expect(cards[0].text()).toContain('CNC-AUDIT-09 审计定位设备')
    expect(cards[0].classes()).toContain('selected')

    const detail = wrapper.get('.detail-panel')
    expect(detail.text()).toContain('CNC-AUDIT-09 审计定位设备')
    expect(detail.text()).toContain('Agent 维护')
    expect(detail.text()).toContain('审计回放来源')
    expect(detail.text()).toContain('维护中')
    expect(detail.text()).toContain('TRACE-EQ-DOWNTIME-20260615')
  })

  it('alerts when diagnosis falls back after the backend is unavailable', async () => {
    diagnose.mockRejectedValueOnce(new Error('diagnosis api unavailable'))

    const wrapper = mountEquipmentBoard()
    await flushPromises()

    await wrapper.findAll('.eq-card')[0].trigger('click')
    const diagnoseTab = wrapper
      .findAll('.detail-tabs button')
      .find(button => button.text() === '故障诊断')
    expect(diagnoseTab).toBeTruthy()

    await diagnoseTab!.trigger('click')
    await wrapper.get('.diag-input').setValue('E-0009')
    await wrapper.get('.diag-btn').trigger('click')
    await flushPromises()

    const alert = wrapper.get('[role="alert"]')
    expect(alert.text()).toContain('设备故障诊断失败')
    expect(alert.text()).toContain('diagnosis api unavailable')
    expect(wrapper.get('.diag-result').text()).toContain('可能原因')
  })

  it('guides equipment diagnosis with bilingual prompts, related links, and help support', async () => {
    const wrapper = mountEquipmentBoard()
    await flushPromises()

    await wrapper.findAll('.eq-card')[0].trigger('click')
    const diagnoseTab = wrapper
      .findAll('.detail-tabs button')
      .find(button => button.text() === '故障诊断')
    await diagnoseTab!.trigger('click')

    const guidance = wrapper.get('.diagnosis-guidance')
    expect(guidance.attributes('id')).toBe('equipment-diagnosis-help')
    expect(guidance.text()).toContain('诊断前请核对当前工单、健康异常、维护记录和停机影响。')
    expect(guidance.text()).toContain('Before diagnosis, verify current work order, health anomalies, maintenance history, and downtime impact.')

    const links = guidance.findAll('a')
    expect(links.map(link => link.text())).toEqual(['排产影响 / Schedule impact', '维护记录 / Maintenance history', '帮助 / Help'])
    expect(links.map(link => link.attributes('href'))).toEqual([
      '#equipment-schedule-impact',
      '#equipment-maintenance-history',
      '#equipment-diagnosis-help',
    ])
    expect(wrapper.get('.diagnose-form').attributes('aria-describedby')).toBe('equipment-diagnosis-help')
  })

  it('renders backend diagnosis advice with spare parts after a successful equipment fault analysis', async () => {
    diagnose.mockResolvedValueOnce({
      equipmentId: 'eq-cnc-1',
      equipmentName: 'CNC-001 加工中心',
      errorCode: 'E-SPINDLE-22',
      mostLikelyCause: '主轴冷却泵压力不足',
      diagnosticBasis: '报警代码与过去 3 次温升曲线一致，冷却回路压力低于阈值。',
      suggestedSteps: ['复核冷却液液位', '检查冷却泵叶轮', '恢复后执行 15 分钟空载试车'],
      requiredSpareParts: ['冷却泵 P-220', '滤芯 F-08'],
      estimatedRepairTime: '2 小时',
    })

    const wrapper = mountEquipmentBoard()
    await flushPromises()

    await wrapper.findAll('.eq-card')[0].trigger('click')
    const diagnoseTab = wrapper
      .findAll('.detail-tabs button')
      .find(button => button.text() === '故障诊断')
    await diagnoseTab!.trigger('click')
    await wrapper.get('.diag-input').setValue('E-SPINDLE-22')
    await wrapper.get('.diag-btn').trigger('click')
    await flushPromises()

    const result = wrapper.get('.diag-result')
    expect(diagnose).toHaveBeenCalledWith('eq-cnc-1', 'E-SPINDLE-22')
    expect(wrapper.find('[role="alert"]').exists()).toBe(false)
    expect(result.text()).toContain('主轴冷却泵压力不足')
    expect(result.text()).toContain('报警代码与过去 3 次温升曲线一致')
    expect(result.text()).toContain('复核冷却液液位')
    expect(result.text()).toContain('冷却泵 P-220')
    expect(result.text()).toContain('2 小时')
  })
})
