import { flushPromises, mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import RoutingBoard from '../../src/components/routing/RoutingBoard.vue'
import type { ProcessRoute, RouteDetail } from '../../src/types/routing'
import type { RouteCapabilityValidation } from '../../src/utils/engineering-change-sync'

const getRouteList = vi.hoisted(() => vi.fn())
const getRouteById = vi.hoisted(() => vi.fn())
const readRouteCapabilityValidationBackendFirst = vi.hoisted(() => vi.fn())
const writeRouteCapabilityValidation = vi.hoisted(() => vi.fn())
const isOfflineDemoError = vi.hoisted(() =>
  vi.fn((error: unknown) => error instanceof Error && error.name === 'OfflineDemoApiError'),
)

vi.mock('../../src/api/routing', () => ({
  getRouteById,
  getRouteList,
}))

vi.mock('../../src/utils/engineering-change-sync', () => ({
  readRouteCapabilityValidationBackendFirst,
  writeRouteCapabilityValidation,
}))

vi.mock('../../src/utils/offline-demo-mode', () => ({
  isOfflineDemoError,
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
    isOfflineDemoError.mockImplementation(
      (error: unknown) => error instanceof Error && error.name === 'OfflineDemoApiError',
    )
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

  it('quietly shows demo routes when offline demo skips route list loading', async () => {
    const offlineDemoError = new Error('Offline demo mode skipped backend request: /api/v1/routing')
    offlineDemoError.name = 'OfflineDemoApiError'
    getRouteList.mockRejectedValueOnce(offlineDemoError)

    const wrapper = mountRoutingBoard()
    await flushPromises()

    expect(wrapper.findAll('[role="option"]')).toHaveLength(3)
    expect(wrapper.text()).toContain('精密轴承组件工艺路线')
    expect(wrapper.find('[role="alert"]').exists()).toBe(false)
    expect(wrapper.text()).not.toContain('工艺路线列表加载失败')
    expect(wrapper.text()).not.toContain('Offline demo mode skipped backend request')
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

  it('quietly keeps route capability open when offline demo skips capability history loading', async () => {
    const offlineDemoError = new Error('Offline demo mode skipped backend request: /api/v1/scheduling/route-capability-validation/latest')
    offlineDemoError.name = 'OfflineDemoApiError'
    readRouteCapabilityValidationBackendFirst.mockRejectedValueOnce(offlineDemoError)

    const wrapper = mountRoutingBoard()
    await flushPromises()

    expect(wrapper.findAll('[role="option"]')).toHaveLength(2)
    expect(wrapper.text()).toContain('传动轴总成工艺路线')
    expect(wrapper.find('[role="alert"]').exists()).toBe(false)
    expect(wrapper.text()).not.toContain('能力校验记录加载失败')
    expect(wrapper.text()).not.toContain('Offline demo mode skipped backend request')
  })

  it('loads a saved capability validation and explains why scheduling must wait for release', async () => {
    readRouteCapabilityValidationBackendFirst.mockResolvedValue(validatedCapabilityRecord)

    const wrapper = mountRoutingBoard()
    await flushPromises()

    await wrapper.findAll('[role="option"]')[1].trigger('click')
    await flushPromises()

    expect(wrapper.get('.validation-status').text()).toBe('瓶颈已校验')
    expect(wrapper.get('.validation-trace').text()).toContain('AUD-ROUTE-CAP-20260521-001')
    expect(wrapper.get('.validation-trace').text()).toContain('TRACE-ROUTE-CAP-R-B200-OP-090')
    expect(wrapper.get('.agent-bridge').text()).toContain('已识别热处理能力缺口')
    expect(wrapper.get('.agent-bridge').text()).toContain('需等待分流/合批确认后释放窗口')
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

  it('saves capability validation evidence before enabling split and batch release', async () => {
    writeRouteCapabilityValidation.mockReturnValueOnce(validatedCapabilityRecord)
    const wrapper = mountRoutingBoard()
    await flushPromises()

    await wrapper.findAll('[role="option"]')[1].trigger('click')
    await flushPromises()
    const validateButton = wrapper.findAll('button').find((button) => button.text() === '运行能力校验')
    if (!validateButton) throw new Error('运行能力校验 button not found')
    await validateButton.trigger('click')
    await flushPromises()

    expect(writeRouteCapabilityValidation).toHaveBeenCalledWith(expect.objectContaining({
      routeCode: 'R-B200',
      operationCode: 'OP-090',
      decision: 'validated',
      statusLabel: '瓶颈已校验',
    }))
    expect(wrapper.get('.validation-status').text()).toBe('瓶颈已校验')
    expect(wrapper.get('.validation-trace').text()).toContain('AUD-ROUTE-CAP-20260521-001')
    expect(wrapper.get('.agent-bridge').text()).toContain('已识别热处理能力缺口')
    const releaseButton = wrapper.findAll('button').find((button) => button.text() === '确认分流/合批方案')
    if (!releaseButton) throw new Error('确认分流/合批方案 button not found')
    expect(releaseButton.attributes('disabled')).toBeUndefined()
  })

  it('guides route capability release with bilingual prompts, related evidence links, and help support', async () => {
    const wrapper = mountRoutingBoard()
    await flushPromises()

    await wrapper.findAll('[role="option"]')[1].trigger('click')
    await flushPromises()

    const guidance = wrapper.get('.validation-guidance')
    expect(guidance.text()).toContain('先运行能力校验，确认瓶颈、夜班窗口和外协兜底后，再确认分流/合批方案。')
    expect(guidance.text()).toContain('Run capability validation first, then confirm split or batch release with trace evidence.')

    const links = wrapper.findAll('.validation-links a')
    expect(links).toHaveLength(3)
    expect(links.map(link => link.text())).toEqual(['AI 排产复核', '审计回放', '报表证据'])

    const help = wrapper.get('.validation-help')
    expect(help.attributes('href')).toBe('#route-capability-help')
    expect(help.attributes('aria-label')).toBe('打开工艺能力校验帮助')
    expect(help.text()).toContain('帮助：能力校验支持')
  })

  it('saves release evidence and lets the scheduling bridge use the confirmed split plan', async () => {
    const releasedCapabilityRecord: RouteCapabilityValidation = {
      ...validatedCapabilityRecord,
      decision: 'released',
      statusLabel: '分流已确认',
      auditId: 'AUD-ROUTE-CAP-RELEASE-20260521-001',
      traceId: 'TRACE-ROUTE-CAP-R-B200-OP-090-RELEASED',
      summary: 'R-B200 OP-090 已确认 HT-02 夜班窗口和外协兜底，可释放排产窗口。',
    }
    writeRouteCapabilityValidation
      .mockReturnValueOnce(validatedCapabilityRecord)
      .mockReturnValueOnce(releasedCapabilityRecord)
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
      routeCode: 'R-B200',
      operationCode: 'OP-090',
      decision: 'released',
      statusLabel: '分流已确认',
    }))
    expect(wrapper.get('.validation-status').text()).toBe('分流已确认')
    expect(wrapper.get('.validation-trace').text()).toContain('AUD-ROUTE-CAP-RELEASE-20260521-001')
    expect(wrapper.get('.agent-bridge').text()).toContain('已确认热处理分流/合批方案')
    expect(wrapper.get('.agent-bridge').text()).toContain('可把 OP-090 从能力缺口转为夜班窗口复核')
  })

  it('fails loud but keeps local release evidence when release readback fails', async () => {
    const releasedCapabilityRecord: RouteCapabilityValidation = {
      ...validatedCapabilityRecord,
      decision: 'released',
      statusLabel: '分流已确认',
      auditId: 'AUD-ROUTE-CAP-RELEASE-20260521-001',
      traceId: 'TRACE-ROUTE-CAP-R-B200-OP-090-RELEASED',
      summary: 'R-B200 OP-090 已确认 HT-02 夜班窗口和外协兜底，可释放排产窗口。',
    }
    writeRouteCapabilityValidation
      .mockReturnValueOnce(validatedCapabilityRecord)
      .mockReturnValueOnce(releasedCapabilityRecord)
    readRouteCapabilityValidationBackendFirst
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(validatedCapabilityRecord)
      .mockRejectedValueOnce(new Error('route capability readback unavailable'))

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

    expect(readRouteCapabilityValidationBackendFirst).toHaveBeenLastCalledWith({ failLoud: true })
    expect(wrapper.get('[role="alert"]').text()).toContain('分流/合批证据读回失败')
    expect(wrapper.get('[role="alert"]').text()).toContain('route capability readback unavailable')
    expect(wrapper.get('.validation-status').text()).toBe('分流已确认')
    expect(wrapper.get('.validation-trace').text()).toContain('AUD-ROUTE-CAP-RELEASE-20260521-001')
  })

  it('loads the requested page when operators use pagination', async () => {
    getRouteList
      .mockResolvedValueOnce({
        items: routes,
        totalCount: 12,
      })
      .mockResolvedValueOnce({
        items: [{
          id: 'route-c',
          routeCode: 'R-C300',
          routeName: '液压阀体工艺路线',
          productCode: 'PROD-C1',
          productName: '液压阀体 C',
          version: 'V1.0',
          status: 'Draft',
          totalLeadTimeMinutes: 90,
          stepCount: 5,
        }],
        totalCount: 12,
      })

    const wrapper = mountRoutingBoard()
    await flushPromises()

    await wrapper.findAll('[role="option"]')[1].trigger('click')
    await flushPromises()
    expect(wrapper.get('.detail-panel h3').text()).toBe('传动轴总成工艺路线')

    const nextButton = wrapper.findAll('.page-btn').find(button => button.text() === '下一页')
    if (!nextButton) throw new Error('下一页 button not found')
    await nextButton.trigger('click')
    await flushPromises()

    expect(getRouteList).toHaveBeenLastCalledWith(2, 10)
    expect(wrapper.findAll('[role="option"]')).toHaveLength(1)
    expect(wrapper.text()).toContain('液压阀体工艺路线')
    expect(wrapper.text()).toContain('选择一个工艺路线查看详情')
    expect(wrapper.find('.detail-panel h3').exists()).toBe(false)
    expect(wrapper.get('.page-info').text()).toBe('共 12 条')
  })
})
