import { beforeEach, describe, expect, it, vi } from 'vitest'
import { installMemoryLocalStorage } from './test-storage'

type SignalRHandler = (payload: unknown) => void

const signalRHandlers = vi.hoisted(() => new Map<string, SignalRHandler>())
const signalRStart = vi.hoisted(() => vi.fn(() => Promise.resolve()))
const signalRStop = vi.hoisted(() => vi.fn(() => Promise.resolve()))

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
        state: 'Disconnected',
        on: (eventName: string, handler: SignalRHandler) => {
          signalRHandlers.set(eventName, handler)
        },
        onreconnecting: vi.fn(),
        onreconnected: vi.fn(),
        onclose: vi.fn(),
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
    signalRStart.mockClear()
    signalRStop.mockClear()
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
})
