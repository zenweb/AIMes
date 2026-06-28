import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { installMemoryLocalStorage } from './test-storage'
import {
  OFFLINE_DEMO_ERROR_CODE,
  OfflineDemoApiError,
  appAssetPath,
  createOfflineDemoApiError,
  isOfflineDemoError,
  isOfflineDemoMode,
  logUnlessOfflineDemo,
  setOfflineDemoMode,
  shouldSkipBackendForOfflineDemo,
} from '../../src/utils/offline-demo-mode'

describe('offline demo mode utilities', () => {
  beforeEach(() => {
    installMemoryLocalStorage()
    localStorage.clear()
    window.history.replaceState({}, '', '/')
    vi.unstubAllEnvs()
    vi.stubEnv('BASE_URL', '/scheduling/')
  })

  afterEach(() => {
    vi.unstubAllEnvs()
    localStorage.clear()
    window.history.replaceState({}, '', '/')
  })

  it('enables and persists demo mode from query parameters for screenshot/demo runs', () => {
    window.history.replaceState({}, '', '/dashboard?offlineDemo=offline')

    expect(isOfflineDemoMode()).toBe(true)
    expect(localStorage.getItem('aimes_offline_demo')).toBe('true')
  })

  it('disables persisted demo mode when the query parameter opts out', () => {
    setOfflineDemoMode(true)
    window.history.replaceState({}, '', '/dashboard?demoMode=false')

    expect(isOfflineDemoMode()).toBe(false)
    expect(localStorage.getItem('aimes_offline_demo')).toBe('false')
  })

  it('uses the build-time default when no browser override exists', () => {
    vi.stubEnv('VITE_OFFLINE_DEMO', 'true')

    expect(isOfflineDemoMode()).toBe(true)
  })

  it('honors explicit browser opt-out over the build-time default for backend-mocked tests', () => {
    vi.stubEnv('VITE_OFFLINE_DEMO', 'true')

    setOfflineDemoMode(false)

    expect(isOfflineDemoMode()).toBe(false)
    expect(localStorage.getItem('aimes_offline_demo')).toBe('false')
  })

  it('keeps live backend requests enabled when a real token outlives stale persisted demo mode', () => {
    setOfflineDemoMode(true)

    expect(shouldSkipBackendForOfflineDemo('backend-access-token')).toBe(false)
  })

  it('still skips backend requests for explicit demo entry or demo tokens', () => {
    setOfflineDemoMode(true)
    expect(shouldSkipBackendForOfflineDemo('demo-token-admin')).toBe(true)

    window.history.replaceState({}, '', '/dashboard?offlineDemo=1')
    expect(shouldSkipBackendForOfflineDemo('backend-access-token')).toBe(true)
  })

  it('falls back to live mode when offline demo storage cannot be read', () => {
    vi.stubEnv('VITE_OFFLINE_DEMO', 'true')
    vi.spyOn(localStorage, 'getItem').mockImplementation((key: string) => {
      if (key === 'aimes_offline_demo') {
        throw new Error('offline demo storage unavailable')
      }
      return null
    })

    expect(isOfflineDemoMode()).toBe(false)
  })

  it('keeps URL live opt-out usable when offline demo storage cannot persist the value', () => {
    vi.stubEnv('VITE_OFFLINE_DEMO', 'true')
    window.history.replaceState({}, '', '/dashboard?offlineDemo=false')
    vi.spyOn(localStorage, 'setItem').mockImplementation((key: string) => {
      if (key === 'aimes_offline_demo') {
        throw new Error('offline demo storage unavailable')
      }
    })

    expect(isOfflineDemoMode()).toBe(false)
  })

  it('classifies offline demo backend skips by class, code, marker, or name', () => {
    const error = new OfflineDemoApiError('/api/v1/dashboard')

    expect(isOfflineDemoError(error)).toBe(true)
    expect(isOfflineDemoError({ code: OFFLINE_DEMO_ERROR_CODE })).toBe(true)
    expect(isOfflineDemoError({ isOfflineDemoApiError: true })).toBe(true)
    expect(isOfflineDemoError({ name: 'OfflineDemoApiError' })).toBe(true)
    expect(isOfflineDemoError(new Error('network'))).toBe(false)
  })

  it('classifies wrapped offline demo backend skips by their preserved message', () => {
    expect(isOfflineDemoError(new Error('Offline demo mode skipped backend request: /api/v1/employee'))).toBe(true)
  })

  it('classifies offline demo backend skips when an HTTP layer wraps the message', () => {
    expect(isOfflineDemoError(new Error('Request failed: Offline demo mode skipped backend request: /api/v1/employee'))).toBe(true)
  })

  it('classifies offline demo backend skips from wrapped backend response messages', () => {
    expect(isOfflineDemoError({
      response: {
        data: {
          message: 'Offline demo mode skipped backend request: /api/v1/employee',
        },
      },
    })).toBe(true)
    expect(isOfflineDemoError({
      response: {
        data: {
          title: 'Offline demo mode skipped backend request: /api/v1/employee',
        },
      },
    })).toBe(true)
  })

  it('classifies offline demo backend skips when request layers preserve the original error as cause', () => {
    expect(isOfflineDemoError(new Error('Request failed', {
      cause: new OfflineDemoApiError('/api/v1/employee'),
    }))).toBe(true)
    expect(isOfflineDemoError({
      message: '员工列表加载失败',
      cause: {
        response: {
          data: {
            title: 'Offline demo mode skipped backend request: /api/v1/employee',
          },
        },
      },
    })).toBe(true)
  })

  it('builds a useful skipped request error from axios config', () => {
    const error = createOfflineDemoApiError({
      baseURL: '/api/v1',
      url: '/inventory',
    } as never)

    expect(error.requestUrl).toBe('/api/v1/inventory')
    expect(error.message).toContain('/api/v1/inventory')
  })

  it('suppresses expected offline demo logs but keeps real errors visible', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined)

    logUnlessOfflineDemo('warn', 'skipped request', new OfflineDemoApiError('/api/v1/report'))
    logUnlessOfflineDemo('warn', 'real request failure', new Error('network'))

    expect(warn).toHaveBeenCalledTimes(1)
    expect(warn).toHaveBeenCalledWith('real request failure', expect.any(Error))
  })

  it('resolves app assets under the configured Nuxt base URL', () => {
    expect(appAssetPath('/reports/latest-ab-report.json')).toBe('/scheduling/reports/latest-ab-report.json')
    expect(appAssetPath('favicon.ico')).toBe('/scheduling/favicon.ico')
  })
})
