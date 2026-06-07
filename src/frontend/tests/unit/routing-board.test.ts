import { flushPromises, mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import RoutingBoard from '../../src/components/routing/RoutingBoard.vue'
import type { ProcessRoute, RouteDetail } from '../../src/types/routing'
import type { RouteCapabilityValidation } from '../../src/utils/engineering-change-sync'

const getRouteList = vi.hoisted(() => vi.fn())
const getRouteById = vi.hoisted(() => vi.fn())
const readRouteCapabilityValidationBackendFirst = vi.hoisted(() => vi.fn())
const writeRouteCapabilityValidation = vi.hoisted(() => vi.fn())

vi.mock('../../src/api/routing', () => ({
  getRouteById,
  getRouteList,
}))

vi.mock('../../src/utils/engineering-change-sync', () => ({
  readRouteCapabilityValidationBackendFirst,
  writeRouteCapabilityValidation,
}))

const routes: ProcessRoute[] = [
  {
    id: 'route-a',
    routeCode: 'R-A100',
    routeName: '精密轴承组件工艺路线',
    productCode: 'PROD-A1',
    productName: '精密轴承组件 A',
    version: 'V1.0',
    status: 'Released',
    totalLeadTimeMinutes: 45,
    stepCount: 1,
  },
  {
    id: 'route-b',
    routeCode: 'R-B200',
    routeName: '传动轴总成工艺路线',
    productCode: 'PROD-B1',
    productName: '传动轴总成 B',
    version: 'V2.1',
    status: 'Released',
    totalLeadTimeMinutes: 120,
    stepCount: 1,
  },
]

const routeDetail: RouteDetail = {
  ...routes[1],
  steps: [
    {
      id: 'step-b-1',
      stepSequence: 1,
      operationCode: 'OP-090',
      operationName: '热处理',
      workstationType: '热处理炉',
      standardSetupMinutes: 30,
      standardRunMinutesPerUnit: 15,
      equipmentType: '加热炉',
      inspectionRequired: false,
      parameters: [],
    },
  ],
}

const validatedCapabilityRecord: RouteCapabilityValidation = {
  id: 'route-capability-rb200-op090',
  routeCode: 'R-B200',
  routeVersion: 'V2.1',
  routeName: '传动轴总成工艺路线',
  operationCode: 'OP-090',
  operationName: '热处理',
  bottleneckResource: '热处理炉 HT-01',
  candidateEquipment: 'HT-02 夜班窗口 / 外协 HT-SUP-01',
  affectedOrders: 'WO-DEMO-1007 / WO-DEMO-1010 / WO-RUSH-9001',
  capacityGapHours: 4.5,
  changeoverMinutes: 35,
  batchWindow: '2026-05-21 22:00-02:00',
  decision: 'validated',
  validatedBy: '工艺工程师 陈工',
  validatedAt: '2026-05-21T10:00:00.000Z',
  auditId: 'AUD-ROUTE-CAP-20260521-001',
  traceId: 'TRACE-ROUTE-CAP-R-B200-OP-090',
  statusLabel: '瓶颈已校验',
  summary: 'R-B200 OP-090 热处理炉能力存在 4.5h 缺口，需确认 HT-02 夜班窗口或外协兜底后再释放排产。',
}

function mountRoutingBoard() {
  return mount(RoutingBoard, {
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

describe('RoutingBoard', () => {
  beforeEach(() => {
    getRouteList.mockResolvedValue({
      items: routes,
      totalCount: routes.length,
    })
    getRouteById.mockResolvedValue(routeDetail)
    readRouteCapabilityValidationBackendFirst.mockResolvedValue(null)
    writeRouteCapabilityValidation.mockReturnValue(null)
  })

  it('lets keyboard users select routes and exposes the active route state', async () => {
    const wrapper = mountRoutingBoard()
    await flushPromises()

    const listbox = wrapper.get('[role="listbox"]')
    expect(listbox.attributes('aria-label')).toBe('工艺路线列表')

    const options = wrapper.findAll('[role="option"]')
    expect(options).toHaveLength(2)
    expect(options[1].attributes('tabindex')).toBe('0')
    expect(options[1].attributes('aria-selected')).toBe('false')

    await options[1].trigger('keydown.enter')
    await flushPromises()

    expect(getRouteById).toHaveBeenCalledWith('route-b')
    expect(wrapper.get('.detail-panel h3').text()).toBe('传动轴总成工艺路线')
    expect(wrapper.findAll('[role="option"]')[1].attributes('aria-selected')).toBe('true')
  })

  it('alerts and keeps demo routes visible when route list loading fails', async () => {
    getRouteList.mockRejectedValueOnce(new Error('route list unavailable'))

    const wrapper = mountRoutingBoard()
    await flushPromises()

    const alert = wrapper.get('[role="alert"]')
    expect(alert.attributes('aria-live')).toBe('assertive')
    expect(alert.text()).toContain('工艺路线列表加载失败')
    expect(alert.text()).toContain('route list unavailable')
    expect(wrapper.findAll('[role="option"]')).toHaveLength(3)
    expect(wrapper.text()).toContain('精密轴承组件工艺路线')
  })

  it('alerts and keeps a demo detail visible when route detail loading fails', async () => {
    getRouteById.mockRejectedValueOnce(new Error('route detail unavailable'))
    const wrapper = mountRoutingBoard()
    await flushPromises()

    await wrapper.findAll('[role="option"]')[0].trigger('click')
    await flushPromises()

    expect(getRouteById).toHaveBeenCalledWith('route-a')
    const alert = wrapper.get('[role="alert"]')
    expect(alert.attributes('aria-live')).toBe('assertive')
    expect(alert.text()).toContain('工艺路线详情加载失败')
    expect(alert.text()).toContain('route detail unavailable')
    expect(wrapper.get('.detail-panel h3').text()).toBe('精密轴承组件工艺路线')
    expect(wrapper.text()).toContain('工序列表')
  })

  it('alerts without blocking the route list when capability validation history loading fails', async () => {
    readRouteCapabilityValidationBackendFirst.mockRejectedValueOnce(new Error('capability validation unavailable'))

    const wrapper = mountRoutingBoard()
    await flushPromises()

    const alert = wrapper.get('[role="alert"]')
    expect(alert.attributes('aria-live')).toBe('assertive')
    expect(alert.text()).toContain('能力校验记录加载失败')
    expect(alert.text()).toContain('capability validation unavailable')
    expect(wrapper.findAll('[role="option"]')).toHaveLength(2)
    expect(wrapper.text()).toContain('传动轴总成工艺路线')
  })

  it('loads the route list while capability validation history is still pending', async () => {
    let resolveCapabilityValidation: (value: null) => void = () => undefined
    const capabilityValidation = new Promise<null>((resolve) => {
      resolveCapabilityValidation = resolve
    })
    readRouteCapabilityValidationBackendFirst.mockReturnValueOnce(capabilityValidation)

    const wrapper = mountRoutingBoard()
    await flushPromises()

    expect(getRouteList).toHaveBeenCalledWith(1, 10)
    expect(wrapper.findAll('[role="option"]')).toHaveLength(2)
    expect(wrapper.text()).toContain('传动轴总成工艺路线')

    resolveCapabilityValidation(null)
    await flushPromises()
  })

  it('alerts and keeps the route pending when capability validation evidence cannot be saved', async () => {
    const wrapper = mountRoutingBoard()
    await flushPromises()

    await wrapper.findAll('[role="option"]')[1].trigger('click')
    await flushPromises()
    const validateButton = wrapper.findAll('button').find((button) => button.text() === '运行能力校验')
    if (!validateButton) throw new Error('运行能力校验 button not found')
    await validateButton.trigger('click')
    await flushPromises()

    expect(writeRouteCapabilityValidation).toHaveBeenCalledWith(expect.objectContaining({
      decision: 'validated',
      statusLabel: '瓶颈已校验',
    }))
    const alert = wrapper.get('[role="alert"]')
    expect(alert.attributes('aria-live')).toBe('assertive')
    expect(alert.text()).toContain('能力校验证据保存失败')
    expect(wrapper.text()).toContain('待校验')
    expect(wrapper.text()).not.toContain('瓶颈已校验')
  })

  it('alerts and keeps the route unreleased when capability release evidence cannot be saved', async () => {
    writeRouteCapabilityValidation
      .mockReturnValueOnce(validatedCapabilityRecord)
      .mockReturnValueOnce(null)
    const wrapper = mountRoutingBoard()
    await flushPromises()

    await wrapper.findAll('[role="option"]')[1].trigger('click')
    await flushPromises()
    const validateButton = wrapper.findAll('button').find((button) => button.text() === '运行能力校验')
    if (!validateButton) throw new Error('运行能力校验 button not found')
    await validateButton.trigger('click')
    await flushPromises()

    const releaseButton = wrapper.findAll('button').find((button) => button.text() === '确认分流/合批方案')
    if (!releaseButton) throw new Error('确认分流/合批方案 button not found')
    await releaseButton.trigger('click')
    await flushPromises()

    expect(writeRouteCapabilityValidation).toHaveBeenCalledWith(expect.objectContaining({
      decision: 'released',
      statusLabel: '分流已确认',
    }))
    const alert = wrapper.get('[role="alert"]')
    expect(alert.attributes('aria-live')).toBe('assertive')
    expect(alert.text()).toContain('分流/合批证据保存失败')
    expect(wrapper.text()).toContain('瓶颈已校验')
    expect(wrapper.text()).not.toContain('分流已确认')
  })

  it('requires a saved capability validation before releasing the split or batch plan', async () => {
    const wrapper = mountRoutingBoard()
    await flushPromises()

    await wrapper.findAll('[role="option"]')[1].trigger('click')
    await flushPromises()

    const releaseButton = wrapper.findAll('button').find((button) => button.text() === '确认分流/合批方案')
    if (!releaseButton) throw new Error('确认分流/合批方案 button not found')
    expect(releaseButton.attributes('disabled')).toBeDefined()
    expect(writeRouteCapabilityValidation).not.toHaveBeenCalledWith(expect.objectContaining({
      decision: 'released',
    }))
  })
})
