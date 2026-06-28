import { flushPromises, mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import MonitoringBoard from '../../src/components/monitoring/MonitoringBoard.vue'

const readMonitoringSituationEscalationsBackendFirst = vi.hoisted(() => vi.fn())
const readPocHypercareAcceptanceRecord = vi.hoisted(() => vi.fn(() => null))
const readPocHypercareAcceptanceRecordBackendFirst = vi.hoisted(() => vi.fn())
const upsertOtdEvidenceChainRecord = vi.hoisted(() => vi.fn())
const isOfflineDemoMode = vi.hoisted(() => vi.fn(() => true))
const shouldSkipBackendForOfflineDemo = vi.hoisted(() => vi.fn(() => true))
const isOfflineDemoError = vi.hoisted(() =>
  vi.fn((error: unknown) => error instanceof Error && error.name === 'OfflineDemoApiError'),
)
const startSignalRConnection = vi.hoisted(() => vi.fn(() => Promise.resolve()))
const signalROn = vi.hoisted(() => vi.fn())
const signalROnReconnecting = vi.hoisted(() => vi.fn())
const signalROnReconnected = vi.hoisted(() => vi.fn())
const signalROnClose = vi.hoisted(() => vi.fn())
const stopSignalRConnection = vi.hoisted(() => vi.fn())
const withSignalRUrl = vi.hoisted(() => vi.fn())
const withSignalRAutomaticReconnect = vi.hoisted(() => vi.fn())
const configureSignalRLogging = vi.hoisted(() => vi.fn())
const buildSignalRConnection = vi.hoisted(() => vi.fn())
const HubConnectionBuilder = vi.hoisted(() => vi.fn(function () {
  return {
    withUrl: withSignalRUrl.mockReturnThis(),
    withAutomaticReconnect: withSignalRAutomaticReconnect.mockReturnThis(),
    configureLogging: configureSignalRLogging.mockReturnThis(),
    build: buildSignalRConnection,
  }
}))
const writeMonitoringSituationEscalation = vi.hoisted(() => vi.fn(record => ({
  auditId: 'MON-ESC-001',
  traceId: 'TRACE-MON-ESC-001',
  status: 'active',
  statusLabel: '待处置',
  title: record.eventTitle,
  summary: record.eventImpact,
  owner: record.owner,
  dueAt: '2026-05-20 18:00',
  workOrders: record.workOrders,
})))

vi.mock('@microsoft/signalr', () => ({
  HubConnectionBuilder,
  LogLevel: { Warning: 2 },
}))

vi.mock('../../src/utils/otd-evidence-chain-sync', () => ({
  upsertOtdEvidenceChainRecord,
}))

vi.mock('../../src/utils/monitoring-situation-escalation-sync', () => ({
  readMonitoringSituationEscalationsBackendFirst,
  writeMonitoringSituationEscalation,
}))

vi.mock('../../src/utils/poc-hypercare-sync', () => ({
  readPocHypercareAcceptanceRecord,
  readPocHypercareAcceptanceRecordBackendFirst,
}))

vi.mock('../../src/utils/auth-token', () => ({
  getLocalAccessToken: vi.fn(() => 'token'),
}))

vi.mock('../../src/utils/offline-demo-mode', () => ({
  isOfflineDemoError,
  shouldSkipBackendForOfflineDemo,
}))

function mountMonitoringBoard() {
  return mount(MonitoringBoard, {
    global: {
      stubs: {
        RouterLink: {
          props: ['to'],
          template: '<a :href="to"><slot /></a>',
        },
        Teleport: true,
      },
    },
  })
}

describe('MonitoringBoard', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.unstubAllEnvs()
    isOfflineDemoMode.mockReturnValue(true)
    shouldSkipBackendForOfflineDemo.mockReturnValue(true)
    isOfflineDemoError.mockImplementation(
      (error: unknown) => error instanceof Error && error.name === 'OfflineDemoApiError',
    )
    startSignalRConnection.mockResolvedValue(undefined)
    upsertOtdEvidenceChainRecord.mockImplementation(() => undefined)
    writeMonitoringSituationEscalation.mockImplementation(record => ({
      auditId: 'MON-ESC-001',
      traceId: 'TRACE-MON-ESC-001',
      status: 'active',
      statusLabel: '待处置',
      title: record.eventTitle,
      summary: record.eventImpact,
      owner: record.owner,
      dueAt: '2026-05-20 18:00',
      workOrders: record.workOrders,
    }))
    buildSignalRConnection.mockReturnValue({
      on: signalROn,
      onreconnecting: signalROnReconnecting,
      onreconnected: signalROnReconnected,
      onclose: signalROnClose,
      start: startSignalRConnection,
      stop: stopSignalRConnection,
    })
    readMonitoringSituationEscalationsBackendFirst.mockResolvedValue([])
    readPocHypercareAcceptanceRecord.mockReturnValue(null)
    readPocHypercareAcceptanceRecordBackendFirst.mockResolvedValue(null)
  })

  it('opens equipment details from a keyboard-accessible equipment card', async () => {
    const wrapper = mountMonitoringBoard()
    await flushPromises()

    const card = wrapper.get('.equip-card')
    expect(card.attributes('role')).toBe('button')
    expect(card.attributes('tabindex')).toBe('0')
    expect(card.attributes('aria-label')).toContain('CNC-001')

    await card.trigger('keydown.enter')
    await flushPromises()

    const dialog = wrapper.get('[role="dialog"]')
    expect(dialog.classes()).toContain('drawer-panel')
    expect(dialog.attributes('aria-modal')).toBe('true')
    expect(dialog.attributes('aria-labelledby')).toBe('equipment-detail-title')
    expect(dialog.get('#equipment-detail-title').text()).toContain('CNC-001')
  })

  it('shows a fail-loud message when situation evidence cannot be synced to the OTD evidence chain', async () => {
    upsertOtdEvidenceChainRecord.mockImplementation(() => {
      throw new Error('monitoring evidence storage unavailable')
    })

    const wrapper = mountMonitoringBoard()
    await flushPromises()

    await wrapper.get('button').trigger('click')
    await flushPromises()

    expect(upsertOtdEvidenceChainRecord).toHaveBeenCalledTimes(1)
    expect(wrapper.text()).toContain('现场态势证据同步失败')
    expect(wrapper.text()).toContain('现场事件未完整写入 OTD 证据链')
    expect(wrapper.text()).toContain('monitoring evidence storage unavailable')
    expect(wrapper.text()).not.toContain('现场态势证据已同步 OTD 复盘')
  })

  it('guides shopfloor situation escalation with bilingual prompts, related links, and help support', async () => {
    const wrapper = mountMonitoringBoard()
    await flushPromises()

    const guidance = wrapper.get('.situation-guidance')
    expect(guidance.attributes('id')).toBe('shopfloor-situation-help')
    expect(guidance.text()).toContain('同步或升级现场态势前，请核对事件来源、影响工单、责任人和审计追踪。')
    expect(guidance.text()).toContain('Before syncing or escalating a shopfloor situation, verify event source, impacted work orders, owner, and audit trace.')

    const links = guidance.findAll('a')
    expect(links.map(link => link.text())).toEqual(['重排建议 / Scheduling', '风险预警 / Risk queue', '帮助 / Help'])
    expect(links.map(link => link.attributes('href'))).toEqual([
      '/scheduling',
      '/risk',
      '#shopfloor-situation-help',
    ])
    expect(wrapper.get('.situation-actions').attributes('aria-describedby')).toBe('shopfloor-situation-help')
  })

  it('syncs every shopfloor situation event into the OTD evidence chain', async () => {
    const wrapper = mountMonitoringBoard()
    await flushPromises()

    await wrapper.get('button').trigger('click')
    await flushPromises()

    expect(upsertOtdEvidenceChainRecord).toHaveBeenCalledTimes(3)
    expect(upsertOtdEvidenceChainRecord).toHaveBeenCalledWith(expect.objectContaining({
      id: 'monitoring-sf-cnc-load',
      stage: '现场态势',
      source: '实时监控 / CNC-001',
      traceId: 'TRACE-SF-SF-CNC-LOAD',
      status: 'active',
      statusLabel: '待处置',
    }))
    expect(wrapper.text()).toContain('现场态势证据已同步 OTD 复盘')
    expect(wrapper.text()).toContain('3 条现场事件已写入统一证据链')
  })

  it('shows a fail-loud message when situation escalation cannot be written', async () => {
    writeMonitoringSituationEscalation.mockImplementation(() => {
      throw new Error('monitoring escalation storage unavailable')
    })

    const wrapper = mountMonitoringBoard()
    await flushPromises()

    await wrapper.get('button.escalate-btn').trigger('click')
    await flushPromises()

    expect(writeMonitoringSituationEscalation).toHaveBeenCalledTimes(1)
    expect(wrapper.text()).toContain('现场态势升级失败')
    expect(wrapper.text()).toContain('跨模块处置包未写入风险队列和排产事件队列')
    expect(wrapper.text()).toContain('monitoring escalation storage unavailable')
    expect(wrapper.text()).not.toContain('现场态势已升级为跨模块处置包')
  })

  it('writes and renders a cross-module situation escalation package', async () => {
    const wrapper = mountMonitoringBoard()
    await flushPromises()

    await wrapper.get('button.escalate-btn').trigger('click')
    await flushPromises()

    expect(writeMonitoringSituationEscalation).toHaveBeenCalledWith(expect.objectContaining({
      sourceEventId: 'sf-cnc-load',
      source: 'CNC-001',
      eventTitle: '瓶颈负载超过 90%',
      workOrders: 'WO-RUSH-9001 / WO-DEMO-1002',
      owner: '调度员',
      action: '生成重排',
    }))
    expect(wrapper.get('[aria-label="现场态势升级处置包"]').text()).toContain('TRACE-MON-ESC-001')
    expect(wrapper.text()).toContain('现场态势已升级为跨模块处置包')
    expect(wrapper.text()).toContain('MON-ESC-001 已写入风险队列、AI 排产事件队列和统一 OTD 证据链')
  })

  it('shows a fail-loud message when initial monitoring governance records cannot be loaded', async () => {
    readPocHypercareAcceptanceRecordBackendFirst.mockRejectedValue(new Error('monitoring governance backend unavailable'))

    const wrapper = mountMonitoringBoard()
    await flushPromises()

    expect(readPocHypercareAcceptanceRecordBackendFirst).toHaveBeenCalledTimes(1)
    expect(wrapper.text()).toContain('现场态势初始化读取失败')
    expect(wrapper.text()).toContain('Hypercare 与现场处置包记录暂未加载')
    expect(wrapper.text()).toContain('monitoring governance backend unavailable')
  })

  it('quietly keeps demo monitoring when offline demo skips initial governance reads', async () => {
    const offlineDemoError = new Error('Offline demo mode skipped backend request: /api/v1/scheduling/poc-hypercare-acceptance/latest')
    offlineDemoError.name = 'OfflineDemoApiError'
    readPocHypercareAcceptanceRecordBackendFirst.mockRejectedValue(offlineDemoError)

    const wrapper = mountMonitoringBoard()
    await flushPromises()

    expect(readPocHypercareAcceptanceRecordBackendFirst).toHaveBeenCalledTimes(1)
    expect(wrapper.text()).toContain('CNC-001 加工中心')
    expect(wrapper.text()).toContain('实时监控演示数据已加载')
    expect(wrapper.text()).not.toContain('现场态势初始化读取失败')
    expect(wrapper.text()).not.toContain('Offline demo mode skipped backend request')
  })

  it('renders existing Hypercare and closed situation governance records during startup', async () => {
    readPocHypercareAcceptanceRecordBackendFirst.mockResolvedValue({
      title: 'POC Hypercare 第 1 周验收',
      acceptanceGate: '连续 2 周无 P0/P1，OTD 与 OEE 达标。',
      statusLabel: '运行中',
      actualOtd: '94%',
      auditId: 'AUD-HYPERCARE-001',
      traceId: 'TRACE-HYPERCARE-001',
      owner: '交付 PM',
      monitors: [
        {
          label: 'P0/P1 未关闭',
          current: '0',
          target: '0',
          evidence: 'EVD-HYPERCARE-P0P1',
          status: 'ok',
        },
      ],
    })
    readMonitoringSituationEscalationsBackendFirst.mockResolvedValue([
      {
        auditId: 'MON-ESC-CLOSED',
        traceId: 'TRACE-MON-ESC-CLOSED',
        status: 'closed',
        statusLabel: '已闭环',
        title: 'CNC-001 瓶颈处置包',
        summary: '风险队列已关闭，排产窗口已释放。',
        owner: '调度',
        dueAt: '2026-06-15 18:00',
        workOrders: 'WO-RUSH-9001',
      },
    ])

    const wrapper = mountMonitoringBoard()
    await flushPromises()

    expect(readPocHypercareAcceptanceRecordBackendFirst).toHaveBeenCalledWith({ failLoud: true })
    expect(readMonitoringSituationEscalationsBackendFirst).toHaveBeenCalledWith({ failLoud: true })
    expect(wrapper.get('[aria-label="POC Hypercare 稳定运行监控"]').text()).toContain('AUD-HYPERCARE-001')
    expect(wrapper.get('[aria-label="现场态势升级处置包"]').text()).toContain('TRACE-MON-ESC-CLOSED')
    expect(wrapper.text()).toContain('现场态势处置包已闭环')
    expect(wrapper.text()).toContain('TRACE-MON-ESC-CLOSED 已由风险队列关闭')
  })

  it('shows the SignalR startup failure reason while falling back to demo monitoring data', async () => {
    isOfflineDemoMode.mockReturnValue(false)
    shouldSkipBackendForOfflineDemo.mockReturnValue(false)
    startSignalRConnection.mockRejectedValue(new Error('signalr gateway unavailable'))

    const wrapper = mountMonitoringBoard()
    await flushPromises()
    await flushPromises()

    expect(HubConnectionBuilder).toHaveBeenCalledTimes(1)
    expect(startSignalRConnection).toHaveBeenCalledTimes(1)
    expect(wrapper.text()).toContain('实时连接失败，使用演示数据')
    expect(wrapper.text()).toContain('signalr gateway unavailable')
    expect(wrapper.text()).toContain('CNC-001 加工中心')
  })

  it('starts SignalR when offline demo is disabled even if demo hints are enabled', async () => {
    vi.stubEnv('VITE_SHOW_DEMO_HINTS', 'true')
    isOfflineDemoMode.mockReturnValue(false)
    shouldSkipBackendForOfflineDemo.mockReturnValue(false)

    const wrapper = mountMonitoringBoard()
    await flushPromises()

    expect(HubConnectionBuilder).toHaveBeenCalledTimes(1)
    expect(startSignalRConnection).toHaveBeenCalledTimes(1)
    expect(wrapper.text()).toContain('实时监控已连接')
  })

  it('applies realtime equipment and KPI pushes from SignalR handlers', async () => {
    isOfflineDemoMode.mockReturnValue(false)
    shouldSkipBackendForOfflineDemo.mockReturnValue(false)
    const wrapper = mountMonitoringBoard()
    await flushPromises()

    const equipmentHandler = signalROn.mock.calls.find(call => call[0] === 'EquipmentMetrics')?.[1]
    const kpiHandler = signalROn.mock.calls.find(call => call[0] === 'KpiUpdate')?.[1]
    expect(equipmentHandler).toBeTypeOf('function')
    expect(kpiHandler).toBeTypeOf('function')

    equipmentHandler([
      {
        id: 'eq-live-1',
        name: '激光切割机',
        code: 'LASER-001',
        status: 'Fault',
        utilization: 12,
        temperature: 88,
        rpm: 0,
        load: 92,
      },
    ])
    kpiHandler({
      totalUtilization: 64.5,
      runningCount: 0,
      idleCount: 1,
      todayOutput: 128,
      alertCount: 3,
      oee: 68,
      yieldRate: 91.5,
      energyUsage: 99,
      timestamp: '2026-06-15T10:00:00.000Z',
    })
    await flushPromises()

    expect(wrapper.text()).toContain('激光切割机')
    expect(wrapper.text()).toContain('LASER-001')
    expect(wrapper.text()).toContain('64.5%')
    expect(wrapper.text()).toContain('异常告警')
    expect(wrapper.text()).toContain('3')
    expect(wrapper.get('.equip-card').classes()).toContain('status-fault')
  })

  it('shows the SignalR close reason when the realtime connection closes with an error', async () => {
    isOfflineDemoMode.mockReturnValue(false)
    shouldSkipBackendForOfflineDemo.mockReturnValue(false)

    const wrapper = mountMonitoringBoard()
    await flushPromises()

    const closeHandler = signalROnClose.mock.calls[0]?.[0]
    expect(closeHandler).toBeTypeOf('function')

    closeHandler(new Error('signalr transport closed by gateway'))
    await flushPromises()

    expect(wrapper.text()).toContain('已断开')
    expect(wrapper.text()).toContain('实时连接已关闭')
    expect(wrapper.text()).toContain('signalr transport closed by gateway')
  })

  it('shows the SignalR reconnecting reason when the realtime connection starts reconnecting with an error', async () => {
    isOfflineDemoMode.mockReturnValue(false)
    shouldSkipBackendForOfflineDemo.mockReturnValue(false)

    const wrapper = mountMonitoringBoard()
    await flushPromises()

    const reconnectingHandler = signalROnReconnecting.mock.calls[0]?.[0]
    expect(reconnectingHandler).toBeTypeOf('function')

    reconnectingHandler(new Error('signalr reconnect token expired'))
    await flushPromises()

    expect(wrapper.text()).toContain('已断开')
    expect(wrapper.text()).toContain('实时连接断开，正在重连')
    expect(wrapper.text()).toContain('signalr reconnect token expired')
  })

  it('filters realtime event history and stops the SignalR connection on unmount', async () => {
    isOfflineDemoMode.mockReturnValue(false)
    shouldSkipBackendForOfflineDemo.mockReturnValue(false)
    const wrapper = mountMonitoringBoard()
    await flushPromises()

    const reconnectedHandler = signalROnReconnected.mock.calls[0]?.[0]
    const closeHandler = signalROnClose.mock.calls[0]?.[0]
    reconnectedHandler()
    closeHandler(new Error('gateway closed after recovery'))
    await flushPromises()

    await wrapper.get('.event-filter select').setValue('error')
    await flushPromises()

    expect(wrapper.findAll('.event-item')).toHaveLength(1)
    expect(wrapper.get('.event-item.error').text()).toContain('gateway closed after recovery')

    wrapper.unmount()

    expect(stopSignalRConnection).toHaveBeenCalledTimes(1)
  })
})
