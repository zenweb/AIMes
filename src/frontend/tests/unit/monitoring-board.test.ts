import { flushPromises, mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import MonitoringBoard from '../../src/components/monitoring/MonitoringBoard.vue'

const readMonitoringSituationEscalationsBackendFirst = vi.hoisted(() => vi.fn())
const readPocHypercareAcceptanceRecordBackendFirst = vi.hoisted(() => vi.fn())
const upsertOtdEvidenceChainRecord = vi.hoisted(() => vi.fn())
const isOfflineDemoMode = vi.hoisted(() => vi.fn(() => true))
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
  readPocHypercareAcceptanceRecordBackendFirst,
}))

vi.mock('../../src/utils/auth-token', () => ({
  getLocalAccessToken: vi.fn(() => 'token'),
}))

vi.mock('../../src/utils/offline-demo-mode', () => ({
  isOfflineDemoMode,
}))

function mountMonitoringBoard() {
  return mount(MonitoringBoard, {
    global: {
      stubs: {
        RouterLink: {
          props: ['to'],
          template: '<a><slot /></a>',
        },
        Teleport: true,
      },
    },
  })
}

describe('MonitoringBoard', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    isOfflineDemoMode.mockReturnValue(true)
    startSignalRConnection.mockResolvedValue(undefined)
    buildSignalRConnection.mockReturnValue({
      on: signalROn,
      onreconnecting: signalROnReconnecting,
      onreconnected: signalROnReconnected,
      onclose: signalROnClose,
      start: startSignalRConnection,
      stop: stopSignalRConnection,
    })
    readMonitoringSituationEscalationsBackendFirst.mockResolvedValue([])
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

  it('shows a fail-loud message when initial monitoring governance records cannot be loaded', async () => {
    readPocHypercareAcceptanceRecordBackendFirst.mockRejectedValue(new Error('monitoring governance backend unavailable'))

    const wrapper = mountMonitoringBoard()
    await flushPromises()

    expect(readPocHypercareAcceptanceRecordBackendFirst).toHaveBeenCalledTimes(1)
    expect(wrapper.text()).toContain('现场态势初始化读取失败')
    expect(wrapper.text()).toContain('Hypercare 与现场处置包记录暂未加载')
    expect(wrapper.text()).toContain('monitoring governance backend unavailable')
  })

  it('shows the SignalR startup failure reason while falling back to demo monitoring data', async () => {
    isOfflineDemoMode.mockReturnValue(false)
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

    const wrapper = mountMonitoringBoard()
    await flushPromises()

    expect(HubConnectionBuilder).toHaveBeenCalledTimes(1)
    expect(startSignalRConnection).toHaveBeenCalledTimes(1)
    expect(wrapper.text()).toContain('实时监控已连接')
    vi.unstubAllEnvs()
  })

  it('shows the SignalR close reason when the realtime connection closes with an error', async () => {
    isOfflineDemoMode.mockReturnValue(false)

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
})
