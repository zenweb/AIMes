import { flushPromises, mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import AnomalyBoard from '../../src/components/anomaly/AnomalyBoard.vue'
import type { ProductionAnomaly, ProductionAnomalyDetail } from '../../src/types/anomaly'

const getAnomalyList = vi.hoisted(() => vi.fn())
const getAnomalyById = vi.hoisted(() => vi.fn())
const analyzeAnomaly = vi.hoisted(() => vi.fn())
const readProductionAnomalyEventBackendFirst = vi.hoisted(() => vi.fn())
const readAnomalyDispatchRecordsBackendFirst = vi.hoisted(() => vi.fn())
const writeAnomalyDispatchRecord = vi.hoisted(() => vi.fn())

vi.mock('../../src/api/anomaly', () => ({
  analyzeAnomaly,
  getAnomalyById,
  getAnomalyList,
}))

vi.mock('../../src/utils/production-anomaly-sync', () => ({
  readProductionAnomalyEventBackendFirst,
  toProductionAnomaly: vi.fn(),
  toProductionAnomalyDetail: vi.fn(),
}))

vi.mock('../../src/utils/anomaly-dispatch-sync', () => ({
  readAnomalyDispatchRecordsBackendFirst,
  writeAnomalyDispatchRecord,
}))

const anomalies: ProductionAnomaly[] = [
  {
    id: 'a-1',
    workOrderNumber: 'WO-20260501',
    operationCode: 'OP-020',
    equipmentId: 'CNC-001',
    anomalyType: 'equipment',
    severity: 'Critical',
    title: 'CNC-001 主轴温升异常',
    description: '主轴温度持续上升至 85°C',
    detectedAt: '2026-05-12T09:30:00',
    detectedBy: 'operator1',
    status: 'Open',
    rootCause: null,
    resolution: null,
    responseCount: 1,
  },
]

const anomalyDetail: ProductionAnomalyDetail = {
  ...anomalies[0],
  resolvedAt: null,
  resolvedBy: null,
  responses: [],
}

function mountAnomalyBoard() {
  return mount(AnomalyBoard, {
    global: {
      stubs: {
        RouterLink: {
          props: ['to'],
          template: '<a><slot /></a>',
        },
      },
    },
  })
}

describe('AnomalyBoard', () => {
  beforeEach(() => {
    getAnomalyList.mockResolvedValue({
      items: anomalies,
      totalCount: anomalies.length,
    })
    getAnomalyById.mockResolvedValue(anomalyDetail)
    analyzeAnomaly.mockResolvedValue(null)
    readProductionAnomalyEventBackendFirst.mockResolvedValue(null)
    readAnomalyDispatchRecordsBackendFirst.mockResolvedValue([])
    writeAnomalyDispatchRecord.mockReturnValue(null)
  })

  it('lets keyboard users open anomaly details and exposes the selected record state', async () => {
    const wrapper = mountAnomalyBoard()
    await flushPromises()

    const options = wrapper.findAll('[role="option"]')
    expect(options).toHaveLength(1)
    expect(options[0].attributes('tabindex')).toBe('0')
    expect(options[0].attributes('aria-selected')).toBe('false')

    await options[0].trigger('keydown.enter')
    await flushPromises()

    expect(getAnomalyById).toHaveBeenCalledWith('a-1')
    expect(wrapper.get('.panel-header h3').text()).toBe('CNC-001 主轴温升异常')
    expect(wrapper.findAll('[role="option"]')[0].attributes('aria-selected')).toBe('true')
  })

  it('opens anomaly details as a labelled modal dialog', async () => {
    const wrapper = mountAnomalyBoard()
    await flushPromises()

    await wrapper.findAll('[role="option"]')[0].trigger('click')
    await flushPromises()

    const dialog = wrapper.get('[role="dialog"]')
    expect(dialog.classes()).toContain('panel-content')
    expect(dialog.attributes('aria-modal')).toBe('true')
    expect(dialog.attributes('aria-labelledby')).toBe('anomaly-detail-title')
    expect(dialog.get('#anomaly-detail-title').text()).toBe('CNC-001 主轴温升异常')
    expect(dialog.get('.close-btn').attributes('aria-label')).toBe('关闭异常详情')
  })

  it('exposes event dispatch lanes as a labelled list', async () => {
    const wrapper = mountAnomalyBoard()
    await flushPromises()

    const laneList = wrapper.get('.event-lanes')
    expect(laneList.attributes('role')).toBe('list')
    expect(laneList.attributes('aria-label')).toBe('异常分流事件队列：3 条')
    const lanes = wrapper.findAll('.event-lane')
    expect(lanes[0].attributes('role')).toBe('listitem')
    expect(lanes[0].attributes('aria-label')).toBe('设备事件：CNC-001 主轴温升异常，异常管理 -> 风险队列 -> AI 排产 -> 设备维护')
  })

  it('announces when the anomaly list load falls back to demo data', async () => {
    getAnomalyList.mockRejectedValueOnce(new Error('anomaly list API unavailable'))
    const wrapper = mountAnomalyBoard()
    await flushPromises()

    expect(wrapper.findAll('[role="option"]').length).toBeGreaterThan(0)
    expect(wrapper.text()).toContain('CNC-001 主轴温升异常')
    const alert = wrapper.get('[role="alert"]')
    expect(alert.text()).toContain('异常列表加载失败')
    expect(alert.text()).toContain('anomaly list API unavailable')
  })

  it('announces when anomaly detail load falls back to demo data', async () => {
    getAnomalyById.mockRejectedValueOnce(new Error('anomaly detail API unavailable'))
    const wrapper = mountAnomalyBoard()
    await flushPromises()

    await wrapper.findAll('[role="option"]')[0].trigger('click')
    await flushPromises()

    expect(getAnomalyById).toHaveBeenCalledWith('a-1')
    expect(wrapper.get('.panel-header h3').text()).toBe('CNC-001 主轴温升异常')
    const alert = wrapper.get('[role="alert"]')
    expect(alert.text()).toContain('异常详情加载失败')
    expect(alert.text()).toContain('anomaly detail API unavailable')
  })

  it('announces when AI analysis falls back to demo suggestions', async () => {
    analyzeAnomaly.mockRejectedValueOnce(new Error('anomaly analysis API unavailable'))
    const wrapper = mountAnomalyBoard()
    await flushPromises()

    await wrapper.findAll('[role="option"]')[0].trigger('click')
    await flushPromises()

    await wrapper.get('.btn-ai').trigger('click')
    await flushPromises()

    expect(analyzeAnomaly).toHaveBeenCalledWith('a-1')
    expect(wrapper.text()).toContain('立即停机检查主轴冷却系统')
    const alert = wrapper.get('[role="alert"]')
    expect(alert.text()).toContain('AI 分析加载失败')
    expect(alert.text()).toContain('anomaly analysis API unavailable')
  })
})
