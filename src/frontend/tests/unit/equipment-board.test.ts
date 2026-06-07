import { flushPromises, mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import EquipmentBoard from '../../src/components/equipment/EquipmentBoard.vue'
import type { EquipmentDto, EquipmentStatisticsDto } from '../../src/types/equipment'

const getEquipmentList = vi.hoisted(() => vi.fn())
const getEquipmentStatistics = vi.hoisted(() => vi.fn())
const getHealthReport = vi.hoisted(() => vi.fn())
const getMaintenanceHistory = vi.hoisted(() => vi.fn())
const diagnose = vi.hoisted(() => vi.fn())

vi.mock('vue-router', () => ({
  useRoute: () => ({ query: {} }),
}))

vi.mock('../../src/api/equipment', () => ({
  diagnose,
  getEquipmentList,
  getEquipmentStatistics,
  getHealthReport,
  getMaintenanceHistory,
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
  return mount(EquipmentBoard, {
    global: {
      stubs: {
        EquipmentScheduleImpactPanel: true,
      },
    },
  })
}

describe('EquipmentBoard', () => {
  beforeEach(() => {
    getEquipmentStatistics.mockResolvedValue(stats)
    getEquipmentList.mockResolvedValue({
      items: equipment,
      totalCount: equipment.length,
    })
    getHealthReport.mockResolvedValue(null)
    getMaintenanceHistory.mockResolvedValue([])
    diagnose.mockResolvedValue(null)
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
})
