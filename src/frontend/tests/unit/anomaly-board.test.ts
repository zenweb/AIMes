import { flushPromises, mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import AnomalyBoard from '../../src/components/anomaly/AnomalyBoard.vue'
import type { ProductionAnomaly, ProductionAnomalyDetail } from '../../src/types/anomaly'

const getAnomalyList = vi.hoisted(() => vi.fn())
const getAnomalyById = vi.hoisted(() => vi.fn())
const analyzeAnomaly = vi.hoisted(() => vi.fn())
const readProductionAnomalyEventBackendFirst = vi.hoisted(() => vi.fn())
const toProductionAnomaly = vi.hoisted(() => vi.fn())
const toProductionAnomalyDetail = vi.hoisted(() => vi.fn())
const readAnomalyDispatchRecordsBackendFirst = vi.hoisted(() => vi.fn())
const writeAnomalyDispatchRecord = vi.hoisted(() => vi.fn())
const isOfflineDemoError = vi.hoisted(() => vi.fn((error: unknown) => error instanceof Error && error.name === 'OfflineDemoApiError'))

vi.mock('../../src/api/anomaly', () => ({
  analyzeAnomaly,
  getAnomalyById,
  getAnomalyList,
}))

vi.mock('../../src/utils/production-anomaly-sync', () => ({
  readProductionAnomalyEventBackendFirst,
  toProductionAnomaly,
  toProductionAnomalyDetail,
}))

vi.mock('../../src/utils/anomaly-dispatch-sync', () => ({
  readAnomalyDispatchRecordsBackendFirst,
  writeAnomalyDispatchRecord,
}))

vi.mock('../../src/utils/offline-demo-mode', () => ({
  isOfflineDemoError,
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
          template: '<a :href="to"><slot /></a>',
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
    toProductionAnomaly.mockReset()
    toProductionAnomalyDetail.mockReset()
    readAnomalyDispatchRecordsBackendFirst.mockResolvedValue([])
    writeAnomalyDispatchRecord.mockReturnValue(null)
    isOfflineDemoError.mockImplementation((error: unknown) => error instanceof Error && error.name === 'OfflineDemoApiError')
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

  it('also opens anomaly details with Space for keyboard parity', async () => {
    const wrapper = mountAnomalyBoard()
    await flushPromises()

    await wrapper.findAll('[role="option"]')[0].trigger('keydown.space')
    await flushPromises()

    expect(getAnomalyById).toHaveBeenCalledWith('a-1')
    expect(wrapper.get('.panel-header h3').text()).toBe('CNC-001 主轴温升异常')
    expect(wrapper.findAll('[role="option"]')[0].attributes('aria-selected')).toBe('true')
  })

  it('filters open anomalies and keeps pagination readback tied to the requested page', async () => {
    const pageOne = Array.from({ length: 10 }, (_, index): ProductionAnomaly => ({
      ...anomalies[0],
      id: `a-page-1-${index}`,
      title: `第一页异常 ${index + 1}`,
      severity: index === 0 ? 'Critical' : 'High',
      status: index === 2 ? 'Resolved' : 'Open',
    }))
    const pageTwo: ProductionAnomaly[] = [
      {
        ...anomalies[0],
        id: 'a-page-2-1',
        title: '第二页异常：CNC-003 夜班复核',
        workOrderNumber: 'WO-PAGE-2',
        equipmentId: 'CNC-003',
        severity: 'Medium',
        status: 'Acknowledged',
      },
    ]
    getAnomalyList
      .mockResolvedValueOnce({ items: pageOne, totalCount: 95 })
      .mockResolvedValueOnce({ items: pageTwo, totalCount: 95 })
    const wrapper = mountAnomalyBoard()
    await flushPromises()

    expect(wrapper.findAll('[role="option"]')).toHaveLength(10)
    expect(wrapper.findAll('.page-ellipsis')).toHaveLength(1)

    await wrapper.findAll('.toolbar .btn')[2].trigger('click')

    expect(wrapper.findAll('[role="option"]')).toHaveLength(9)
    expect(wrapper.text()).not.toContain('第一页异常 3')

    await wrapper.findAll('.page-btn').find(button => button.text() === '2')!.trigger('click')
    await flushPromises()

    expect(getAnomalyList).toHaveBeenLastCalledWith(2, 10)
    expect(wrapper.findAll('[role="option"]')).toHaveLength(1)
    expect(wrapper.text()).toContain('第二页异常：CNC-003 夜班复核')
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

  it('places the latest production anomaly event first and opens its mapped detail without refetching', async () => {
    const productionEvent = {
      id: 'a-live',
      workOrderNumber: 'WO-LIVE-9001',
      operationCode: 'OP-090',
      operationName: '终检',
      equipmentId: 'AOI-02',
      anomalyType: 'quality',
      severity: 'High',
      title: '后端联动异常：AOI 漏检复核',
      description: 'AOI 复核发现漏检风险',
      detectedAt: '2026-06-15T09:00:00',
      detectedBy: 'risk-agent',
      suggestedAction: '插入 AOI 复检窗口并锁定出货承诺。',
    }
    const mappedAnomaly: ProductionAnomaly = {
      id: 'a-live',
      workOrderNumber: 'WO-LIVE-9001',
      operationCode: 'OP-090',
      equipmentId: 'AOI-02',
      anomalyType: 'quality',
      severity: 'High',
      title: '后端联动异常：AOI 漏检复核',
      description: 'AOI 复核发现漏检风险',
      detectedAt: '2026-06-15T09:00:00',
      detectedBy: 'risk-agent',
      status: 'Open',
      rootCause: null,
      resolution: null,
      responseCount: 1,
    }
    const mappedDetail: ProductionAnomalyDetail = {
      ...mappedAnomaly,
      resolvedAt: null,
      resolvedBy: null,
      responses: [
        {
          id: 'a-live-ai-response',
          responseType: 'AiSuggestion',
          description: '生产异常联动建议',
          suggestedAction: '插入 AOI 复检窗口并锁定出货承诺。',
          suggestedBy: 'AI Agent',
          status: 'Pending',
          executedAt: null,
          executedBy: null,
          createdAt: '2026-06-15T09:00:00',
        },
      ],
    }
    readProductionAnomalyEventBackendFirst.mockResolvedValue(productionEvent)
    toProductionAnomaly.mockReturnValue(mappedAnomaly)
    toProductionAnomalyDetail.mockReturnValue(mappedDetail)
    getAnomalyList.mockResolvedValue({
      items: [anomalies[0], { ...anomalies[0], id: 'a-live', title: '旧列表异常应被后端事件替换' }],
      totalCount: 2,
    })

    const wrapper = mountAnomalyBoard()
    await flushPromises()

    const options = wrapper.findAll('[role="option"]')
    expect(options).toHaveLength(2)
    expect(options[0].text()).toContain('后端联动异常：AOI 漏检复核')
    expect(options[1].text()).toContain('CNC-001 主轴温升异常')
    expect(wrapper.text()).not.toContain('旧列表异常应被后端事件替换')
    expect(toProductionAnomaly).toHaveBeenCalledWith(productionEvent)

    await options[0].trigger('click')
    await flushPromises()

    expect(toProductionAnomalyDetail).toHaveBeenCalledWith(productionEvent)
    expect(getAnomalyById).not.toHaveBeenCalledWith('a-live')
    expect(wrapper.get('#anomaly-detail-title').text()).toBe('后端联动异常：AOI 漏检复核')
    expect(wrapper.text()).toContain('插入 AOI 复检窗口并锁定出货承诺。')
  })

  it('keeps the production anomaly event visible when the anomaly list falls back to demo data', async () => {
    const productionEvent = {
      id: 'a-live-fallback',
      workOrderNumber: 'WO-LIVE-FALLBACK',
      operationCode: 'OP-040',
      operationName: '终检',
      equipmentId: 'AOI-03',
      anomalyType: 'quality',
      severity: 'High',
      title: '后端联动异常：终检复核失败',
      description: '终检复核失败后需要保留最新生产异常入口',
      detectedAt: '2026-06-15T10:00:00',
      detectedBy: 'risk-agent',
      suggestedAction: '保留终检复核窗口并同步风险队列。',
    }
    const mappedAnomaly: ProductionAnomaly = {
      id: 'a-live-fallback',
      workOrderNumber: 'WO-LIVE-FALLBACK',
      operationCode: 'OP-040',
      equipmentId: 'AOI-03',
      anomalyType: 'quality',
      severity: 'High',
      title: '后端联动异常：终检复核失败',
      description: '终检复核失败后需要保留最新生产异常入口',
      detectedAt: '2026-06-15T10:00:00',
      detectedBy: 'risk-agent',
      status: 'Open',
      rootCause: null,
      resolution: null,
      responseCount: 1,
    }
    readProductionAnomalyEventBackendFirst.mockResolvedValue(productionEvent)
    toProductionAnomaly.mockReturnValue(mappedAnomaly)
    getAnomalyList.mockRejectedValueOnce(new Error('anomaly list API unavailable'))
    const wrapper = mountAnomalyBoard()
    await flushPromises()

    const options = wrapper.findAll('[role="option"]')
    expect(options[0].text()).toContain('后端联动异常：终检复核失败')
    expect(wrapper.text()).toContain('CNC-001 主轴温升异常')
    expect(wrapper.text()).toContain('异常列表加载失败')
    expect(wrapper.text()).toContain('anomaly list API unavailable')
    expect(toProductionAnomaly).toHaveBeenCalledWith(productionEvent)
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

  it('guides anomaly dispatch with bilingual prompts, related links, and help support', async () => {
    const wrapper = mountAnomalyBoard()
    await flushPromises()

    const guidance = wrapper.get('.dispatch-guidance')
    expect(guidance.attributes('id')).toBe('anomaly-dispatch-help')
    expect(guidance.text()).toContain('确认分流前，请核对异常类型、影响工单、目标模块、责任人和审计追踪。')
    expect(guidance.text()).toContain('Before confirming dispatch, verify anomaly type, impacted work orders, target modules, owner, and audit trace.')
    expect(wrapper.get('.event-lanes').attributes('aria-describedby')).toBe('anomaly-dispatch-help')

    const links = guidance.findAll('a')
    expect(links.map(link => link.text())).toEqual([
      '风险预警 / Risk queue',
      '质量闭环 / Quality closure',
      'AI 排产 / Scheduling',
      '帮助 / Help',
    ])
    expect(links.map(link => link.attributes('href'))).toEqual([
      '/risk',
      '/quality',
      '/scheduling',
      '#anomaly-dispatch-help',
    ])
  })

  it('writes and displays a quality dispatch trace when users confirm event routing', async () => {
    writeAnomalyDispatchRecord.mockReturnValue({
      id: 'dispatch-quality-gap',
      anomalyId: 'quality-gap',
      type: 'quality',
      typeLabel: '质量异常',
      title: '装配间隙超差已分流到质量返工与排产复核',
      sourceModule: '异常管理',
      targetModules: ['质量闭环', 'AI 排产', '风险处置', '报表中心'],
      workOrderId: 'WO-DEMO-1003',
      operationCode: 'OP-30',
      suggestedAction: '隔离当前批次，插入返工/复验窗口，并让 AI 排产保护 WO-RUSH-9001 后段装配承诺。',
      auditId: 'AUD-ANOMALY-DISPATCH-20260521-001',
      traceId: 'TRACE-ANOMALY-DISPATCH-QUALITY-GAP-20260521',
      status: 'confirmed',
      statusLabel: '质量分流已确认',
      summary: '现场事件中心确认质量异常分流，质量闭环、AI 排产、风险处置和 OTD 复盘读取同一条异常分流证据。',
      createdAt: '2026-05-21T09:00:00.000Z',
    })

    const wrapper = mountAnomalyBoard()
    await flushPromises()

    const qualityLane = wrapper.findAll('.event-lane').find(lane => lane.text().includes('装配间隙超差'))
    expect(qualityLane).toBeTruthy()

    await qualityLane!.get('button').trigger('click')
    await flushPromises()

    expect(writeAnomalyDispatchRecord).toHaveBeenCalledWith(expect.objectContaining({
      anomalyId: 'quality-gap',
      type: 'quality',
      auditId: 'AUD-ANOMALY-DISPATCH-20260521-001',
      traceId: 'TRACE-ANOMALY-DISPATCH-QUALITY-GAP-20260521',
    }))
    expect(qualityLane!.get('button').text()).toBe('已确认分流')
    expect(wrapper.get('.dispatch-trace').text()).toContain('质量分流已确认')
    expect(wrapper.get('.dispatch-trace').text()).toContain('装配间隙超差已分流到质量返工与排产复核')
    expect(wrapper.get('.dispatch-trace code').text()).toBe('TRACE-ANOMALY-DISPATCH-QUALITY-GAP-20260521')
    expect(wrapper.find('[role="alert"]').exists()).toBe(false)
  })

  it('writes and displays an equipment dispatch trace with the equipment-specific audit route', async () => {
    writeAnomalyDispatchRecord.mockReturnValue({
      id: 'dispatch-equipment-cnc001',
      anomalyId: 'equipment-cnc001',
      type: 'equipment',
      typeLabel: '设备异常',
      title: 'CNC-001 主轴温升异常已分流到设备维护与排产复核',
      sourceModule: '异常管理',
      targetModules: ['风险队列', 'AI 排产', '设备维护'],
      workOrderId: 'WO-20260501',
      operationCode: 'OP-020',
      suggestedAction: '停机保护 CNC-001，切换 CNC-003 分流，并提交调度员复核瓶颈设备保护策略。',
      auditId: 'AUD-ANOMALY-DISPATCH-20260521-002',
      traceId: 'TRACE-ANOMALY-DISPATCH-EQUIPMENT-CNC001-20260521',
      status: 'confirmed',
      statusLabel: '设备分流已确认',
      summary: '现场事件中心确认设备异常分流，风险队列和 AI 排产按设备停机影响生成复核动作。',
      createdAt: '2026-05-21T09:10:00.000Z',
    })

    const wrapper = mountAnomalyBoard()
    await flushPromises()

    const equipmentLane = wrapper.findAll('.event-lane').find(lane => lane.text().includes('CNC-001 主轴温升异常'))
    expect(equipmentLane).toBeTruthy()

    await equipmentLane!.get('button').trigger('click')
    await flushPromises()

    expect(writeAnomalyDispatchRecord).toHaveBeenCalledWith(expect.objectContaining({
      anomalyId: 'equipment-cnc001',
      type: 'equipment',
      route: '异常管理 -> 风险队列 -> AI 排产 -> 设备维护',
      auditId: 'AUD-ANOMALY-DISPATCH-20260521-002',
      traceId: 'TRACE-ANOMALY-DISPATCH-EQUIPMENT-CNC001-20260521',
    }))
    expect(equipmentLane!.get('button').text()).toBe('已确认分流')
    expect(wrapper.get('.dispatch-trace').text()).toContain('设备分流已确认')
    expect(wrapper.get('.dispatch-trace').text()).toContain('风险队列和 AI 排产按设备停机影响生成复核动作')
  })

  it('locks a confirmed dispatch lane so duplicate downstream evidence is not written', async () => {
    writeAnomalyDispatchRecord.mockReturnValue({
      id: 'dispatch-quality-gap',
      anomalyId: 'quality-gap',
      type: 'quality',
      typeLabel: '质量异常',
      title: '装配间隙超差已分流到质量返工与排产复核',
      sourceModule: '异常管理',
      targetModules: ['质量闭环', 'AI 排产', '风险处置', '报表中心'],
      workOrderId: 'WO-DEMO-1003',
      operationCode: 'OP-30',
      suggestedAction: '隔离当前批次，插入返工/复验窗口，并让 AI 排产保护 WO-RUSH-9001 后段装配承诺。',
      auditId: 'AUD-ANOMALY-DISPATCH-20260521-001',
      traceId: 'TRACE-ANOMALY-DISPATCH-QUALITY-GAP-20260521',
      status: 'confirmed',
      statusLabel: '质量分流已确认',
      summary: '现场事件中心确认质量异常分流，质量闭环、AI 排产、风险处置和 OTD 复盘读取同一条异常分流证据。',
      createdAt: '2026-05-21T09:00:00.000Z',
    })
    const wrapper = mountAnomalyBoard()
    await flushPromises()

    const qualityLane = wrapper.findAll('.event-lane').find(lane => lane.text().includes('装配间隙超差'))
    expect(qualityLane).toBeTruthy()

    await qualityLane!.get('button').trigger('click')
    await flushPromises()

    const lockedButton = qualityLane!.get('button')
    expect(lockedButton.text()).toBe('已确认分流')
    expect(lockedButton.attributes('disabled')).toBeDefined()

    await lockedButton.trigger('click')
    await flushPromises()

    expect(writeAnomalyDispatchRecord).toHaveBeenCalledTimes(1)
    expect(wrapper.findAll('.dispatch-trace')).toHaveLength(1)
  })

  it('keeps a dispatch lane actionable when confirmation evidence cannot be written', async () => {
    writeAnomalyDispatchRecord.mockReturnValueOnce(null)
    const wrapper = mountAnomalyBoard()
    await flushPromises()

    const qualityLane = wrapper.findAll('.event-lane').find(lane => lane.text().includes('装配间隙超差'))
    expect(qualityLane).toBeTruthy()

    await qualityLane!.get('button').trigger('click')
    await flushPromises()

    expect(writeAnomalyDispatchRecord).toHaveBeenCalledWith(expect.objectContaining({
      anomalyId: 'quality-gap',
      auditId: 'AUD-ANOMALY-DISPATCH-20260521-001',
    }))
    expect(qualityLane!.get('button').text()).toBe('确认分流')
    expect(qualityLane!.get('button').attributes('disabled')).toBeUndefined()
    expect(wrapper.find('.dispatch-trace').exists()).toBe(false)
    expect(wrapper.get('[role="alert"]').text()).toContain('异常分流确认失败，未写入下游处置证据：浏览器存储不可用')
  })

  it('keeps a dispatch lane actionable when confirmation evidence write throws', async () => {
    writeAnomalyDispatchRecord.mockImplementationOnce(() => {
      throw new Error('dispatch audit backend unavailable')
    })
    const wrapper = mountAnomalyBoard()
    await flushPromises()

    const qualityLane = wrapper.findAll('.event-lane').find(lane => lane.text().includes('装配间隙超差'))
    expect(qualityLane).toBeTruthy()

    await qualityLane!.get('button').trigger('click')
    await flushPromises()

    expect(writeAnomalyDispatchRecord).toHaveBeenCalledWith(expect.objectContaining({
      anomalyId: 'quality-gap',
      auditId: 'AUD-ANOMALY-DISPATCH-20260521-001',
    }))
    expect(qualityLane!.get('button').text()).toBe('确认分流')
    expect(qualityLane!.get('button').attributes('disabled')).toBeUndefined()
    expect(wrapper.find('.dispatch-trace').exists()).toBe(false)
    const alert = wrapper.get('[role="alert"]')
    expect(alert.text()).toContain('异常分流确认失败，未写入下游处置证据')
    expect(alert.text()).toContain('dispatch audit backend unavailable')
  })

  it('restores confirmed dispatch lanes and the latest trace on startup', async () => {
    readAnomalyDispatchRecordsBackendFirst.mockResolvedValueOnce([
      {
        id: 'dispatch-equipment-cnc001',
        anomalyId: 'equipment-cnc001',
        type: 'equipment',
        typeLabel: '设备异常',
        title: 'CNC-001 主轴温升异常已分流到设备维护与排产复核',
        sourceModule: '异常管理',
        targetModules: ['风险队列', 'AI 排产', '设备维护'],
        workOrderId: 'WO-20260501',
        operationCode: 'OP-020',
        suggestedAction: '停机保护 CNC-001，切换 CNC-003 分流。',
        auditId: 'AUD-ANOMALY-DISPATCH-20260521-002',
        traceId: 'TRACE-ANOMALY-DISPATCH-EQUIPMENT-CNC001-20260521',
        status: 'confirmed',
        statusLabel: '设备分流已确认',
        summary: '风险队列和 AI 排产按设备停机影响生成复核动作。',
        createdAt: '2026-05-21T09:10:00.000Z',
      },
      {
        id: 'dispatch-material-batch',
        anomalyId: 'material-batch',
        type: 'material',
        typeLabel: '物料异常',
        title: '原料批次来料异常已分流到库存与采购协同',
        sourceModule: '异常管理',
        targetModules: ['库存齐套', '采购协同'],
        workOrderId: 'WO-20260501',
        operationCode: 'OP-040',
        suggestedAction: '隔离 LH-202605 批次，启用备用批次。',
        auditId: 'AUD-ANOMALY-DISPATCH-20260521-003',
        traceId: 'TRACE-ANOMALY-DISPATCH-MATERIAL-BATCH-20260521',
        status: 'confirmed',
        statusLabel: '物料分流已确认',
        summary: '库存齐套和采购协同按批次隔离结果回写风险状态。',
        createdAt: '2026-05-21T09:20:00.000Z',
      },
    ])

    const wrapper = mountAnomalyBoard()
    await flushPromises()

    expect(wrapper.findAll('.event-lane button').map(button => button.text())).toEqual([
      '已确认分流',
      '确认分流',
      '已确认分流',
    ])
    expect(wrapper.get('.dispatch-trace').text()).toContain('设备分流已确认')
    expect(wrapper.get('.dispatch-trace').text()).toContain('CNC-001 主轴温升异常已分流到设备维护与排产复核')
    expect(wrapper.get('.dispatch-trace code').text()).toBe('TRACE-ANOMALY-DISPATCH-EQUIPMENT-CNC001-20260521')
    expect(wrapper.find('[role="alert"]').exists()).toBe(false)
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

  it('keeps demo anomalies quiet when offline demo skips anomaly list backend read', async () => {
    const offlineDemoError = new Error('Offline demo mode skipped backend request: /api/v1/anomaly')
    offlineDemoError.name = 'OfflineDemoApiError'
    getAnomalyList.mockRejectedValueOnce(offlineDemoError)

    const wrapper = mountAnomalyBoard()
    await flushPromises()

    expect(wrapper.findAll('[role="option"]').length).toBeGreaterThan(0)
    expect(wrapper.text()).toContain('CNC-001 主轴温升异常')
    expect(wrapper.find('[role="alert"]').exists()).toBe(false)
    expect(wrapper.text()).not.toContain('Offline demo mode skipped backend request')
    expect(wrapper.text()).not.toContain('异常列表加载失败')
  })

  it('keeps anomaly loading usable when stored dispatch records fail on startup', async () => {
    readAnomalyDispatchRecordsBackendFirst.mockRejectedValueOnce(new Error('dispatch backend unavailable'))
    const wrapper = mountAnomalyBoard()
    await flushPromises()

    expect(getAnomalyList).toHaveBeenCalledWith(1, 10)
    expect(wrapper.findAll('[role="option"]')).toHaveLength(1)
    expect(wrapper.text()).toContain('CNC-001 主轴温升异常')
    expect(wrapper.findAll('.event-lane button').map(button => button.text())).toEqual([
      '确认分流',
      '确认分流',
      '确认分流',
    ])
    const alert = wrapper.get('[role="alert"]')
    expect(alert.text()).toContain('异常分流记录加载失败')
    expect(alert.text()).toContain('dispatch backend unavailable')
  })

  it('keeps both startup dispatch and anomaly list failures visible', async () => {
    readAnomalyDispatchRecordsBackendFirst.mockRejectedValueOnce(new Error('dispatch backend unavailable'))
    getAnomalyList.mockRejectedValueOnce(new Error('anomaly list API unavailable'))

    const wrapper = mountAnomalyBoard()
    await flushPromises()

    expect(wrapper.findAll('[role="option"]').length).toBeGreaterThan(0)
    expect(wrapper.text()).toContain('CNC-001 主轴温升异常')
    const alert = wrapper.get('[role="alert"]')
    expect(alert.text()).toContain('异常分流记录加载失败')
    expect(alert.text()).toContain('dispatch backend unavailable')
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

  it('keeps anomaly detail load failures visible after a later AI analysis succeeds', async () => {
    getAnomalyById.mockRejectedValueOnce(new Error('anomaly detail API unavailable'))
    analyzeAnomaly.mockResolvedValueOnce({
      anomalyId: 'a-1',
      title: 'CNC-001 主轴温升异常',
      suggestedRootCause: null,
      suggestedResolution: null,
      analysisSummary: 'AI 分析已完成',
      suggestedActions: [
        {
          action: '检查冷却液循环',
          reason: '冷却不足可能导致主轴温升',
          priority: 1,
        },
      ],
    })
    const wrapper = mountAnomalyBoard()
    await flushPromises()

    await wrapper.findAll('[role="option"]')[0].trigger('click')
    await flushPromises()

    expect(wrapper.get('[role="alert"]').text()).toContain('异常详情加载失败')

    await wrapper.get('.btn-ai').trigger('click')
    await flushPromises()

    expect(wrapper.text()).toContain('检查冷却液循环')
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

  it('falls back to material isolation suggestions for non-equipment and non-quality anomalies', async () => {
    const materialAnomaly: ProductionAnomaly = {
      id: 'a-material',
      workOrderNumber: 'WO-MAT-001',
      operationCode: 'OP-040',
      equipmentId: 'INJ-001',
      anomalyType: 'material',
      severity: 'Medium',
      title: '原料批次来料异常',
      description: '润滑脂批次 LH-202605 粘度检测不合格。',
      detectedAt: '2026-05-11T14:00:00',
      detectedBy: 'operator1',
      status: 'Resolved',
      rootCause: '供应商工艺参数变更未通知',
      resolution: '更换为备用批次 LH-202604，已联系供应商整改',
      responseCount: 2,
    }
    getAnomalyList.mockResolvedValueOnce({ items: [materialAnomaly], totalCount: 1 })
    getAnomalyById.mockResolvedValueOnce({
      ...materialAnomaly,
      resolvedAt: '2026-05-11T16:00:00',
      resolvedBy: 'leader1',
      responses: [],
    })
    analyzeAnomaly.mockRejectedValueOnce(new Error('material analysis API unavailable'))
    const wrapper = mountAnomalyBoard()
    await flushPromises()

    await wrapper.findAll('[role="option"]')[0].trigger('click')
    await flushPromises()

    expect(wrapper.text()).toContain('供应商工艺参数变更未通知')
    expect(wrapper.text()).toContain('更换为备用批次 LH-202604，已联系供应商整改')
    expect(wrapper.text()).toContain('leader1')

    await wrapper.get('.btn-ai').trigger('click')
    await flushPromises()

    expect(analyzeAnomaly).toHaveBeenCalledWith('a-material')
    expect(wrapper.text()).toContain('隔离异常批次，启动备用物料方案')
    expect(wrapper.text()).toContain('来料异常需防止不合格物料投入生产')
    const alert = wrapper.get('[role="alert"]')
    expect(alert.text()).toContain('AI 分析加载失败')
    expect(alert.text()).toContain('material analysis API unavailable')
  })
})
