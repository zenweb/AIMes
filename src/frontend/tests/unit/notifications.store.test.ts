import { beforeEach, describe, expect, it, vi } from 'vitest'
import { installMemoryLocalStorage } from './test-storage'

type SignalRHandler = (payload: unknown) => void

const signalRHandlers = vi.hoisted(() => new Map<string, SignalRHandler>())
const signalRLifecycleHandlers = vi.hoisted(() => new Map<string, () => void>())
const signalRStart = vi.hoisted(() => vi.fn(() => Promise.resolve()))
const signalRStop = vi.hoisted(() => vi.fn(() => Promise.resolve()))
const signalRConnectionState = vi.hoisted(() => ({ value: 'Disconnected' }))

vi.mock('@microsoft/signalr', () => {
  class HubConnectionBuilder {
    withUrl() {
      return this
    }

    withAutomaticReconnect() {
      return this
    }

    configureLogging() {
      return this
    }

    build() {
      return {
        get state() {
          return signalRConnectionState.value
        },
        on: (eventName: string, handler: SignalRHandler) => {
          signalRHandlers.set(eventName, handler)
        },
        onreconnecting: (handler: () => void) => {
          signalRLifecycleHandlers.set('reconnecting', handler)
        },
        onreconnected: (handler: () => void) => {
          signalRLifecycleHandlers.set('reconnected', handler)
        },
        onclose: (handler: () => void) => {
          signalRLifecycleHandlers.set('close', handler)
        },
        start: signalRStart,
        stop: signalRStop,
      }
    }
  }

  return {
    HubConnectionBuilder,
    HubConnectionState: {
      Connected: 'Connected',
    },
    LogLevel: {
      Warning: 3,
    },
  }
})

async function loadNotificationsStore() {
  vi.resetModules()
  return await import('../../src/stores/notifications')
}

describe('useNotifications', () => {
  beforeEach(() => {
    vi.unstubAllGlobals()
    installMemoryLocalStorage()
    localStorage.clear()
    signalRHandlers.clear()
    signalRLifecycleHandlers.clear()
    signalRStart.mockClear()
    signalRStop.mockClear()
    signalRConnectionState.value = 'Disconnected'
    vi.stubEnv('BASE_URL', '/scheduling/')
  })

  it('uses the configured app base path for browser notification icons', async () => {
    const notificationConstructor = vi.fn(function Notification() {
      return {}
    })
    notificationConstructor.permission = 'granted'
    vi.stubGlobal('Notification', notificationConstructor)
    const { useNotifications } = await loadNotificationsStore()

    useNotifications().connect()
    signalRHandlers.get('QualityAlert')?.({
      inspectionId: 'QI-001',
      productCode: 'P-001',
      productName: '驱动电机',
      severity: 'critical',
    })

    expect(notificationConstructor).toHaveBeenCalledWith('质量预警', {
      body: '驱动电机: 紧急',
      icon: '/scheduling/favicon.ico',
    })
  })

  it('emits high-severity anomaly toasts with sound and browser notification', async () => {
    const notificationConstructor = vi.fn(function Notification() {
      return {}
    })
    notificationConstructor.permission = 'granted'
    vi.stubGlobal('Notification', notificationConstructor)
    const oscillator = {
      connect: vi.fn(),
      frequency: { setValueAtTime: vi.fn() },
      start: vi.fn(),
      stop: vi.fn(),
      type: '',
    }
    const gain = {
      connect: vi.fn(),
      gain: {
        setValueAtTime: vi.fn(),
        exponentialRampToValueAtTime: vi.fn(),
      },
    }
    const audioContext = {
      currentTime: 12,
      destination: {},
      createOscillator: vi.fn(() => oscillator),
      createGain: vi.fn(() => gain),
    }
    vi.stubGlobal('AudioContext', vi.fn(function AudioContext() {
      return audioContext
    }))
    const { useNotifications } = await loadNotificationsStore()
    const notifications = useNotifications()

    notifications.connect()
    signalRHandlers.get('AnomalyAlert')?.({
      workOrderId: 'WO-RUSH-9001',
      severity: 'high',
      description: 'CNC-001 主轴温升异常，需要班组长立即处置。',
    })

    expect(notifications.toasts.value.at(-1)).toEqual(expect.objectContaining({
      type: 'warning',
      title: '异常告警 [high]',
      message: 'CNC-001 主轴温升异常，需要班组长立即处置。',
    }))
    expect(audioContext.createOscillator).toHaveBeenCalledTimes(1)
    expect(oscillator.frequency.setValueAtTime).toHaveBeenCalledWith(880, 12)
    expect(oscillator.start).toHaveBeenCalledWith(12)
    expect(oscillator.stop).toHaveBeenCalledWith(12.5)
    expect(notificationConstructor).toHaveBeenCalledWith('异常告警 [high]', {
      body: 'CNC-001 主轴温升异常，需要班组长立即处置。',
      icon: '/scheduling/favicon.ico',
    })
  })

  it('keeps only the latest five toasts and automatically removes expired entries', async () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-06-14T08:00:00.000Z'))
    vi.spyOn(Math, 'random')
      .mockReturnValueOnce(0.01)
      .mockReturnValueOnce(0.02)
      .mockReturnValueOnce(0.03)
      .mockReturnValueOnce(0.04)
      .mockReturnValueOnce(0.05)
      .mockReturnValueOnce(0.06)
    const { useNotifications } = await loadNotificationsStore()
    const notifications = useNotifications()

    notifications.addToast('info', '消息 1', '第一条应被容量上限移除')
    notifications.addToast('info', '消息 2', '第二条')
    notifications.addToast('warning', '消息 3', '第三条')
    notifications.addToast('error', '消息 4', '第四条')
    notifications.addToast('success', '消息 5', '第五条')
    notifications.addToast('info', '消息 6', '第六条')

    expect(notifications.toasts.value).toHaveLength(5)
    expect(notifications.toasts.value.map(toast => toast.title)).toEqual([
      '消息 2',
      '消息 3',
      '消息 4',
      '消息 5',
      '消息 6',
    ])
    expect(notifications.toasts.value[0]).toEqual(expect.objectContaining({
      id: expect.stringMatching(/^toast-1781424000000-/),
      type: 'info',
      timestamp: new Date('2026-06-14T08:00:00.000Z'),
    }))

    vi.advanceTimersByTime(3000)

    expect(notifications.toasts.value).toHaveLength(0)
    vi.useRealTimers()
  })

  it('requests browser notification permission before showing a critical quality alert', async () => {
    let resolvePermission!: (value: NotificationPermission) => void
    const requestPermission = vi.fn(() => new Promise<NotificationPermission>((resolve) => {
      resolvePermission = resolve
    }))
    const notificationConstructor = vi.fn(function Notification() {
      return {}
    })
    notificationConstructor.permission = 'default'
    notificationConstructor.requestPermission = requestPermission
    vi.stubGlobal('Notification', notificationConstructor)
    const { useNotifications } = await loadNotificationsStore()
    const notifications = useNotifications()

    notifications.connect()
    signalRHandlers.get('QualityAlert')?.({
      inspectionId: 'QI-CRITICAL-001',
      productCode: 'P-CRITICAL',
      productName: '急单阀体组件',
      severity: 'critical',
    })

    expect(requestPermission).toHaveBeenCalledTimes(1)
    expect(notificationConstructor).not.toHaveBeenCalled()

    resolvePermission('granted')
    await Promise.resolve()

    expect(notificationConstructor).toHaveBeenCalledWith('质量预警', {
      body: '急单阀体组件: 紧急',
      icon: '/scheduling/favicon.ico',
    })
  })

  it('does not mark notifications connected when disconnected before SignalR start resolves', async () => {
    let resolveStart!: () => void
    signalRStart.mockImplementationOnce(() => new Promise<void>((resolve) => {
      resolveStart = resolve
    }))
    const { useNotifications } = await loadNotificationsStore()
    const notifications = useNotifications()

    notifications.connect()
    notifications.disconnect()
    resolveStart()
    await Promise.resolve()

    expect(notifications.connected.value).toBe(false)
  })

  it('allows reconnect after disconnect even when the old SignalR connection still reports connected', async () => {
    signalRConnectionState.value = 'Connected'
    const { useNotifications } = await loadNotificationsStore()
    const notifications = useNotifications()

    notifications.connect()
    notifications.disconnect()
    notifications.connect()

    expect(signalRStart).toHaveBeenCalledTimes(2)
  })

  it('does not start a duplicate SignalR connection when the current connection is already connected', async () => {
    signalRConnectionState.value = 'Connected'
    const { useNotifications } = await loadNotificationsStore()
    const notifications = useNotifications()

    notifications.connect()
    notifications.connect()

    expect(signalRStart).toHaveBeenCalledTimes(1)
  })

  it('does not build or start SignalR when offline demo mode is enabled before connecting', async () => {
    localStorage.setItem('aimes_offline_demo', 'true')
    const { useNotifications } = await loadNotificationsStore()
    const notifications = useNotifications()

    notifications.connect()

    expect(signalRStart).not.toHaveBeenCalled()
    expect(signalRHandlers.size).toBe(0)
    expect(notifications.connected.value).toBe(false)
  })

  it('starts SignalR when stale offline demo mode remains after a real backend login', async () => {
    localStorage.setItem('aimes_offline_demo', 'true')
    localStorage.setItem('aimes_token', 'backend-access-token')
    const { useNotifications } = await loadNotificationsStore()
    const notifications = useNotifications()

    notifications.connect()
    await Promise.resolve()

    expect(signalRStart).toHaveBeenCalledTimes(1)
    expect(signalRHandlers.size).toBeGreaterThan(0)
    expect(notifications.connected.value).toBe(true)
  })

  it('ignores stale reconnected callbacks after disconnect', async () => {
    const { useNotifications } = await loadNotificationsStore()
    const notifications = useNotifications()

    notifications.connect()
    notifications.disconnect()
    signalRLifecycleHandlers.get('reconnected')?.()

    expect(notifications.connected.value).toBe(false)
  })

  it('maps ordinary production, inventory, purchase, and equipment events into operator toasts', async () => {
    const { useNotifications } = await loadNotificationsStore()
    const notifications = useNotifications()

    notifications.connect()
    signalRHandlers.get('EquipmentStatusChanged')?.({
      equipmentId: 'eq-1',
      equipmentName: 'CNC-01',
      status: 'fault',
      previousStatus: 'running',
      timestamp: '2026-06-15T08:00:00.000Z',
    })
    signalRHandlers.get('ProductionProgress')?.({
      workOrderId: 'wo-1',
      orderNumber: 'WO-001',
      productCode: 'FG-A100',
      progress: 65,
      completedQuantity: 65,
      plannedQuantity: 100,
    })
    signalRHandlers.get('InventoryChanged')?.({
      materialId: 'mat-1',
      materialCode: 'M-AL-6061',
      materialName: '铝合金 6061',
      transactionType: 'StockOut',
      quantity: 12,
      newStock: 8,
    })
    signalRHandlers.get('PurchaseOrderStatusChanged')?.({
      orderId: 'po-1',
      orderNumber: 'PO-001',
      status: '已确认',
      previousStatus: '已提交',
    })

    expect(notifications.toasts.value.map(toast => ({
      type: toast.type,
      title: toast.title,
      message: toast.message,
    }))).toEqual([
      {
        type: 'error',
        title: '设备状态变更',
        message: 'CNC-01 → 故障',
      },
      {
        type: 'info',
        title: '工单 WO-001',
        message: '进度更新: 65%',
      },
      {
        type: 'info',
        title: '库存变更 [出库]',
        message: '铝合金 6061(M-AL-6061) 数量: 12',
      },
      {
        type: 'success',
        title: '采购单 PO-001',
        message: '状态更新: 已确认',
      },
    ])
  })

  it('keeps unknown status and severity labels visible instead of dropping backend values', async () => {
    const { useNotifications } = await loadNotificationsStore()
    const notifications = useNotifications()

    notifications.connect()
    signalRHandlers.get('EquipmentStatusChanged')?.({
      equipmentId: 'eq-unknown',
      equipmentName: 'CNC-UNKNOWN',
      status: 'calibrating',
      timestamp: '2026-06-15T08:00:00.000Z',
    })
    signalRHandlers.get('QualityAlert')?.({
      inspectionId: 'QI-UNKNOWN',
      productCode: 'P-UNKNOWN',
      productName: '未知新品',
      severity: 'blocked',
    })

    expect(notifications.toasts.value.at(-2)).toEqual(expect.objectContaining({
      type: 'info',
      title: '设备状态变更',
      message: 'CNC-UNKNOWN → calibrating',
    }))
    expect(notifications.toasts.value.at(-1)).toEqual(expect.objectContaining({
      type: 'warning',
      title: '质量预警',
      message: '未知新品: blocked',
    }))
  })

  it('invalidates pending SignalR starts when offline demo mode is enabled', async () => {
    let resolveStart!: () => void
    signalRStart.mockImplementationOnce(() => new Promise<void>((resolve) => {
      resolveStart = resolve
    }))
    const { useNotifications } = await loadNotificationsStore()
    const notifications = useNotifications()

    notifications.connect()
    localStorage.setItem('aimes_offline_demo', 'true')
    notifications.connect()
    resolveStart()
    await Promise.resolve()

    expect(notifications.connected.value).toBe(false)
  })
})
