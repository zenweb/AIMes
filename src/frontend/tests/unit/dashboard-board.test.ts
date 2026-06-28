import { flushPromises, mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import DashboardBoard from '../../src/components/dashboard/DashboardBoard.vue'

const getDashboard = vi.hoisted(() => vi.fn())
const readShortageRiskResolutionBackendFirst = vi.hoisted(() => vi.fn())
const readOtdEvidenceChainRecords = vi.hoisted(() => vi.fn())
const upsertOtdEvidenceChainRecord = vi.hoisted(() => vi.fn())
const readPocHypercareAcceptanceRecordBackendFirst = vi.hoisted(() => vi.fn())
const isOfflineDemoMode = vi.hoisted(() => vi.fn(() => true))
const shouldSkipBackendForOfflineDemo = vi.hoisted(() => vi.fn(() => true))
const isOfflineDemoError = vi.hoisted(() => vi.fn((error: unknown) => error instanceof Error && error.name === 'OfflineDemoApiError'))
const signalRHandlers = vi.hoisted(() => new Map<string, (payload: unknown) => void>())
const signalRMocks = vi.hoisted(() => {
  const connection = {
    on: vi.fn((event: string, handler: (payload: unknown) => void) => {
      signalRHandlers.set(event, handler)
    }),
    start: vi.fn(() => Promise.resolve()),
    stop: vi.fn(() => Promise.resolve()),
  }
  const builder = {
    withUrl: vi.fn(),
    withAutomaticReconnect: vi.fn(),
    configureLogging: vi.fn(),
    build: vi.fn(() => connection),
  }
  builder.withUrl.mockReturnValue(builder)
  builder.withAutomaticReconnect.mockReturnValue(builder)
  builder.configureLogging.mockReturnValue(builder)
  const HubConnectionBuilder = vi.fn()
  HubConnectionBuilder.mockImplementation(class {
    constructor() {
      return builder
    }
  })

  return {
    builder,
    connection,
    HubConnectionBuilder,
  }
})

vi.mock('../../src/api/dashboard', () => ({
  getDashboard,
}))

vi.mock('@microsoft/signalr', () => ({
  HubConnectionBuilder: signalRMocks.HubConnectionBuilder,
  LogLevel: { Warning: 2 },
}))

vi.mock('../../src/utils/shortage-risk-sync', () => ({
  readShortageRiskResolutionBackendFirst,
}))

vi.mock('../../src/utils/otd-evidence-chain-sync', () => ({
  readOtdEvidenceChainRecords,
  upsertOtdEvidenceChainRecord,
}))

vi.mock('../../src/utils/poc-hypercare-sync', () => ({
  readPocHypercareAcceptanceRecordBackendFirst,
}))

vi.mock('../../src/utils/auth-token', () => ({
  getLocalAccessToken: vi.fn(() => 'token'),
}))

vi.mock('../../src/utils/offline-demo-mode', () => ({
  appAssetPath: (path: string) => path,
  isOfflineDemoError,
  shouldSkipBackendForOfflineDemo,
}))

function mountDashboardBoard() {
  return mount(DashboardBoard, {
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

describe('DashboardBoard', () => {
  beforeEach(() => {
    signalRHandlers.clear()
    signalRMocks.HubConnectionBuilder.mockClear()
    signalRMocks.builder.withUrl.mockClear()
    signalRMocks.builder.withUrl.mockReturnValue(signalRMocks.builder)
    signalRMocks.builder.withAutomaticReconnect.mockClear()
    signalRMocks.builder.withAutomaticReconnect.mockReturnValue(signalRMocks.builder)
    signalRMocks.builder.configureLogging.mockClear()
    signalRMocks.builder.configureLogging.mockReturnValue(signalRMocks.builder)
    signalRMocks.builder.build.mockClear()
    signalRMocks.builder.build.mockReturnValue(signalRMocks.connection)
    signalRMocks.connection.on.mockClear()
    signalRMocks.connection.start.mockClear()
    signalRMocks.connection.start.mockResolvedValue(undefined)
    signalRMocks.connection.stop.mockClear()
    signalRMocks.connection.stop.mockResolvedValue(undefined)
    isOfflineDemoMode.mockReturnValue(true)
    shouldSkipBackendForOfflineDemo.mockReturnValue(true)
    isOfflineDemoError.mockImplementation((error: unknown) => error instanceof Error && error.name === 'OfflineDemoApiError')
    getDashboard.mockRejectedValue(new Error('offline'))
    readShortageRiskResolutionBackendFirst.mockResolvedValue(null)
    readOtdEvidenceChainRecords.mockReturnValue([])
    upsertOtdEvidenceChainRecord.mockReturnValue([])
    readPocHypercareAcceptanceRecordBackendFirst.mockResolvedValue(null)
    vi.stubGlobal('fetch', vi.fn(async () => ({
      ok: false,
      json: async () => null,
    })))
  })

  it('exposes the command center journey as an ordered navigation list', async () => {
    const wrapper = mountDashboardBoard()
    await flushPromises()

    const list = wrapper.get('[aria-label="AI MES 指挥中心主线"]')
    expect(list.element.tagName).toBe('OL')
    const steps = list.findAll('li')
    expect(steps).toHaveLength(5)
    expect(steps.map(step => step.find('strong').text())).toEqual([
      '风险识别',
      'Agent 重排',
      '采购协同',
      '生产执行',
      'OTD 复盘',
    ])
  })

  it('shows a fail-loud message when demo rehearsal evidence cannot be written', async () => {
    upsertOtdEvidenceChainRecord.mockImplementation(() => {
      throw new Error('dashboard evidence storage unavailable')
    })

    const wrapper = mountDashboardBoard()
    await flushPromises()

    await wrapper.get('.runbook-rehearsal button').trigger('click')
    await flushPromises()

    expect(upsertOtdEvidenceChainRecord).toHaveBeenCalledTimes(1)
    expect(wrapper.text()).toContain('彩排证据写入失败')
    expect(wrapper.text()).toContain('5 分钟 Demo 彩排尚未写入 OTD 证据链')
    expect(wrapper.text()).toContain('dashboard evidence storage unavailable')
    expect(wrapper.text()).not.toContain('5 分钟 Demo 彩排已确认')
  })

  it('shows a fail-loud message when POC Hypercare acceptance cannot be loaded during initialization', async () => {
    readPocHypercareAcceptanceRecordBackendFirst.mockRejectedValue(new Error('hypercare acceptance backend unavailable'))

    const wrapper = mountDashboardBoard()
    await flushPromises()

    expect(readPocHypercareAcceptanceRecordBackendFirst).toHaveBeenCalledTimes(1)
    expect(wrapper.text()).toContain('生产运营控制塔')
    expect(wrapper.text()).toContain('上线验收记录读取失败')
    expect(wrapper.text()).toContain('POC Hypercare 验收状态暂未加载')
    expect(wrapper.text()).toContain('hypercare acceptance backend unavailable')
  })

  it('shows a fail-loud message when dashboard data cannot be loaded during initialization', async () => {
    getDashboard.mockRejectedValue(new Error('dashboard backend unavailable'))

    const wrapper = mountDashboardBoard()
    await flushPromises()

    expect(getDashboard).toHaveBeenCalledTimes(1)
    expect(wrapper.text()).toContain('生产运营控制塔')
    expect(wrapper.text()).toContain('生产概览数据读取失败')
    expect(wrapper.text()).toContain('KPI、设备状态、今日排产与物料预警暂未加载')
    expect(wrapper.text()).toContain('dashboard backend unavailable')
  })

  it('keeps local dashboard data quiet when offline demo skips dashboard backend read', async () => {
    const offlineDemoError = new Error('Offline demo mode skipped backend request: /api/v1/dashboard')
    offlineDemoError.name = 'OfflineDemoApiError'
    getDashboard.mockRejectedValueOnce(offlineDemoError)

    const wrapper = mountDashboardBoard()
    await flushPromises()

    expect(getDashboard).toHaveBeenCalledTimes(1)
    expect(wrapper.text()).toContain('生产运营控制塔')
    expect(wrapper.find('.dashboard-data-alert').exists()).toBe(false)
    expect(wrapper.text()).not.toContain('Offline demo mode skipped backend request')
    expect(wrapper.text()).not.toContain('生产概览数据读取失败')
    expect(wrapper.text()).not.toContain('KPI、设备状态、今日排产与物料预警暂未加载')
  })

  it('renders backend dashboard data across KPI, equipment, schedule, material, and quality sections', async () => {
    shouldSkipBackendForOfflineDemo.mockReturnValue(false)
    getDashboard.mockResolvedValueOnce({
      kpi: {
        scheduleAdherence: 91.7,
        qualityPassRate: 88.4,
        equipmentUtilization: 63.2,
        activeOrders: 17,
      },
      equipment: [
        { id: 'EQ-DASH-1', name: 'DASH-CNC-001', type: 'CNC', status: 'running', statusText: '运行中' },
        { id: 'EQ-DASH-2', name: 'DASH-ASM-001', type: '装配', status: 'idle', statusText: '空闲' },
        { id: 'EQ-DASH-3', name: 'DASH-CNC-002', type: 'CNC', status: 'fault', statusText: '故障' },
        { id: 'EQ-DASH-4', name: 'DASH-PAINT-001', type: '喷涂', status: 'maintenance', statusText: '保养' },
      ],
      todaySchedule: [
        { id: 'TASK-DASH-1', time: '09:00', name: 'WO-DASH-9001 精加工', equip: 'DASH-CNC-001', status: 'running', statusText: '执行中' },
        { id: 'TASK-DASH-2', time: '13:30', name: 'WO-DASH-9002 装配', equip: 'DASH-ASM-001', status: 'pending', statusText: '待开工' },
      ],
      materialAlerts: [
        { code: 'MAT-DASH-6061', name: '铝棒 6061', level: 'critical', available: 8, min: 20 },
        { code: 'MAT-DASH-BOLT', name: '锁紧螺栓', level: 'warning', available: 45, min: 60 },
      ],
      qualityStats: {
        totalInspections: 43,
        passed: 38,
        defects: 5,
        pendingAnomalies: 2,
        passRate: 88.4,
      },
    })

    const wrapper = mountDashboardBoard()
    await flushPromises()

    const kpiCards = wrapper.findAll('.kpi-card')
    expect(kpiCards.map(card => card.text())).toEqual([
      '📊91.7%排产达成率',
      '✅88.4%质检合格率',
      '⚡63.2%设备利用率',
      '📦17进行中工单',
    ])
    expect(wrapper.find('.dashboard-data-alert').exists()).toBe(false)

    const statusSummary = wrapper.get('.status-summary').text()
    expect(statusSummary).toContain('运行 1')
    expect(statusSummary).toContain('空闲 1')
    expect(statusSummary).toContain('停机 1')
    expect(wrapper.findAll('.equip-item').map(item => item.text())).toEqual([
      'DASH-CNC-001CNC运行中',
      'DASH-ASM-001装配空闲',
      'DASH-CNC-002CNC故障',
      'DASH-PAINT-001喷涂保养',
    ])

    expect(wrapper.findAll('.today-item').map(item => item.text())).toEqual([
      '09:00WO-DASH-9001 精加工DASH-CNC-001执行中',
      '13:30WO-DASH-9002 装配DASH-ASM-001待开工',
    ])
    expect(wrapper.text()).not.toContain('今日暂无排产任务')

    expect(wrapper.findAll('.alert-item').map(item => item.text())).toEqual([
      '🔴铝棒 60618/20',
      '🟡锁紧螺栓45/60',
    ])
    expect(wrapper.text()).not.toContain('所有物料库存充足')

    expect(wrapper.get('.quality-chart').text()).toContain('88.4%')
    expect(wrapper.findAll('.quality-stats .q-row').map(row => row.text())).toEqual([
      '检验批次43',
      '合格批次38',
      '缺陷数5',
      '待处理异常2',
    ])
  })

  it('starts monitoring SignalR when stale offline demo storage coexists with a real token', async () => {
    shouldSkipBackendForOfflineDemo.mockReturnValue(false)
    getDashboard.mockResolvedValueOnce({
      kpi: { scheduleAdherence: 0, qualityPassRate: 0, equipmentUtilization: 0, activeOrders: 0 },
      equipment: [],
      todaySchedule: [],
      materialAlerts: [],
      qualityStats: { totalInspections: 0, passed: 0, defects: 0, pendingAnomalies: 0, passRate: 0 },
    })

    mountDashboardBoard()
    await flushPromises()

    expect(signalRMocks.HubConnectionBuilder).toHaveBeenCalledTimes(1)
    expect(signalRMocks.builder.withUrl).toHaveBeenCalledWith('/hubs/monitoring', {
      accessTokenFactory: expect.any(Function),
    })
    expect(signalRMocks.connection.start).toHaveBeenCalledTimes(1)
  })

  it('applies live SignalR KPI and equipment updates to the command tower and stops the connection on unmount', async () => {
    isOfflineDemoMode.mockReturnValue(false)
    shouldSkipBackendForOfflineDemo.mockReturnValue(false)
    getDashboard.mockResolvedValueOnce({
      kpi: {
        scheduleAdherence: 80,
        qualityPassRate: 81,
        equipmentUtilization: 82,
        activeOrders: 3,
      },
      equipment: [],
      todaySchedule: [],
      materialAlerts: [],
      qualityStats: {
        totalInspections: 10,
        passed: 8,
        defects: 2,
        pendingAnomalies: 1,
        passRate: 80,
      },
    })

    const wrapper = mountDashboardBoard()
    await flushPromises()

    expect(signalRMocks.HubConnectionBuilder).toHaveBeenCalledTimes(1)
    expect(signalRMocks.builder.withUrl).toHaveBeenCalledWith('/hubs/monitoring', {
      accessTokenFactory: expect.any(Function),
    })
    const [, options] = signalRMocks.builder.withUrl.mock.calls[0]
    expect(options.accessTokenFactory()).toBe('token')
    expect(signalRMocks.builder.withAutomaticReconnect).toHaveBeenCalledWith([0, 2000, 5000, 10000])
    expect(signalRMocks.connection.start).toHaveBeenCalledTimes(1)

    signalRHandlers.get('KpiUpdate')?.({
      scheduleAdherence: 94.6,
      activeOrders: 11,
    })
    signalRHandlers.get('EquipmentMetrics')?.([
      { id: 'EQ-LIVE-1', name: 'LIVE-CNC-001', type: 'CNC', status: 'running', statusText: '运行中' },
      { id: 'EQ-LIVE-2', name: 'LIVE-ASM-001', type: '装配', status: 'idle', statusText: '空闲' },
      { id: 'EQ-LIVE-3', name: 'LIVE-CNC-002', type: 'CNC', status: 'offline', statusText: '离线' },
      { id: 'EQ-LIVE-4', name: 'LIVE-MAINT-001', type: '维护', status: 'maintenance', statusText: '保养' },
    ])
    await flushPromises()

    expect(wrapper.findAll('.kpi-card').map(card => card.text())).toEqual([
      '📊94.6%排产达成率',
      '✅81%质检合格率',
      '⚡82%设备利用率',
      '📦11进行中工单',
    ])
    expect(wrapper.get('.ops-hero-status').text()).toContain('运行状态1设备在线 / 1 停机')
    expect(wrapper.get('.status-summary').text()).toContain('运行 1')
    expect(wrapper.get('.status-summary').text()).toContain('空闲 1')
    expect(wrapper.get('.status-summary').text()).toContain('停机 1')
    expect(wrapper.findAll('.equip-item').map(item => item.text())).toEqual([
      'LIVE-CNC-001CNC运行中',
      'LIVE-ASM-001装配空闲',
      'LIVE-CNC-002CNC离线',
      'LIVE-MAINT-001维护保养',
    ])

    wrapper.unmount()

    expect(signalRMocks.connection.stop).toHaveBeenCalledTimes(1)
  })

  it('shows a fail-loud message when the latest A/B report cannot be loaded', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => {
      throw new Error('latest A/B report asset unavailable')
    }))

    const wrapper = mountDashboardBoard()
    await flushPromises()

    expect(fetch).toHaveBeenCalledWith('reports/latest-ab-report.json', { cache: 'no-store' })
    expect(wrapper.text()).toContain('A/B 报告读取失败')
    expect(wrapper.text()).toContain('OTD 改善暂用默认演示值')
    expect(wrapper.text()).toContain('latest A/B report asset unavailable')
    expect(wrapper.text()).toContain('26.7% -> 30.0%')
  })
})
