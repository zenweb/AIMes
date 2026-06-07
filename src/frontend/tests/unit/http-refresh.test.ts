import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { installMemoryLocalStorage } from './test-storage'

const axiosPost = vi.hoisted(() => vi.fn())
const axiosRetry = vi.hoisted(() => vi.fn())
const addToast = vi.hoisted(() => vi.fn())
const offlineDemoMode = vi.hoisted(() => vi.fn(() => false))

vi.mock('axios', async (importOriginal) => {
  const actual = await importOriginal<typeof import('axios')>()
  const instance = Object.assign(axiosRetry, {
    interceptors: {
      request: { use: vi.fn() },
      response: { use: vi.fn() },
    },
  })
  const axiosMock = {
    ...actual.default,
    create: vi.fn(() => instance),
    post: axiosPost,
    isAxiosError: actual.default.isAxiosError,
    AxiosError: actual.AxiosError,
  }
  return {
    ...actual,
    default: axiosMock,
  }
})

vi.mock('../../src/stores/notifications', () => ({
  addToast,
}))

vi.mock('../../src/utils/offline-demo-mode', () => ({
  createOfflineDemoApiError: vi.fn(),
  isOfflineDemoError: vi.fn(() => false),
  isOfflineDemoMode: offlineDemoMode,
}))

async function loadHttpInterceptors() {
  vi.resetModules()
  await import('../../src/api/http')
  const axios = await import('axios')
  const created = vi.mocked(axios.default.create).mock.results.at(-1)?.value as {
    interceptors: {
      request: { use: ReturnType<typeof vi.fn> }
      response: { use: ReturnType<typeof vi.fn> }
    }
  }
  return {
    request: created.interceptors.request.use.mock.calls[0][0] as (config: { headers?: Record<string, string> }) => unknown,
    responseError: created.interceptors.response.use.mock.calls[0][1] as (error: unknown) => Promise<unknown>,
  }
}

describe('http refresh token interceptor', () => {
  beforeEach(() => {
    installMemoryLocalStorage()
    localStorage.clear()
    axiosPost.mockReset()
    axiosRetry.mockReset()
    axiosRetry.mockResolvedValue({ data: { ok: true } })
    addToast.mockReset()
    offlineDemoMode.mockReturnValue(false)
    window.history.replaceState({}, '', '/scheduling/login')
  })

  afterEach(() => {
    localStorage.clear()
    window.history.replaceState({}, '', '/')
  })

  it('clears auth state instead of persisting malformed refresh responses', async () => {
    const { responseError } = await loadHttpInterceptors()
    localStorage.setItem('aimes_token', 'expired-token')
    localStorage.setItem('aimes_refresh_token', 'refresh-token')
    localStorage.setItem('aimes_user', JSON.stringify({ username: 'alice' }))
    axiosPost.mockResolvedValueOnce({
      data: {
        refreshToken: 'new-refresh-token',
        expiresAt: '2026-06-01T00:00:00Z',
      },
    })

    const error = {
      isAxiosError: true,
      config: { url: '/work-orders', headers: {} },
      response: { status: 401 },
    }

    await expect(responseError(error)).rejects.toBe(error)

    expect(localStorage.getItem('aimes_token')).toBeNull()
    expect(localStorage.getItem('aimes_refresh_token')).toBeNull()
    expect(localStorage.getItem('aimes_user')).toBeNull()
    expect(axiosRetry).not.toHaveBeenCalled()
  })

  it('attaches Authorization on requests even when the config has no headers object', async () => {
    const { request } = await loadHttpInterceptors()
    localStorage.setItem('aimes_token', 'access-token')

    const config = {}

    expect(request(config)).toEqual({
      headers: { Authorization: 'Bearer access-token' },
    })
  })

  it('retries with a refreshed Authorization header when the failed request has no headers object', async () => {
    const { responseError } = await loadHttpInterceptors()
    localStorage.setItem('aimes_token', 'expired-token')
    localStorage.setItem('aimes_refresh_token', 'refresh-token')
    axiosPost.mockResolvedValueOnce({
      data: {
        token: 'new-access-token',
        refreshToken: 'new-refresh-token',
        expiresAt: '2026-06-01T00:00:00Z',
      },
    })

    const error = {
      isAxiosError: true,
      config: { url: '/work-orders' },
      response: { status: 401 },
    }

    await expect(responseError(error)).resolves.toEqual({ data: { ok: true } })

    expect(axiosRetry).toHaveBeenCalledWith(expect.objectContaining({
      headers: { Authorization: 'Bearer new-access-token' },
    }))
    expect(localStorage.getItem('aimes_token')).toBe('new-access-token')
    expect(localStorage.getItem('aimes_refresh_token')).toBe('new-refresh-token')
  })

  it('normalizes refreshed tokens before persisting and retrying requests', async () => {
    const { responseError } = await loadHttpInterceptors()
    localStorage.setItem('aimes_token', 'expired-token')
    localStorage.setItem('aimes_refresh_token', 'refresh-token')
    axiosPost.mockResolvedValueOnce({
      data: {
        token: '  new-access-token  ',
        refreshToken: '  new-refresh-token  ',
        expiresAt: '2026-06-01T00:00:00Z',
      },
    })

    const error = {
      isAxiosError: true,
      config: { url: '/work-orders', headers: {} },
      response: { status: 401 },
    }

    await expect(responseError(error)).resolves.toEqual({ data: { ok: true } })

    expect(axiosRetry).toHaveBeenCalledWith(expect.objectContaining({
      headers: { Authorization: 'Bearer new-access-token' },
    }))
    expect(localStorage.getItem('aimes_token')).toBe('new-access-token')
    expect(localStorage.getItem('aimes_refresh_token')).toBe('new-refresh-token')
  })

  it('normalizes the cached refresh token before sending the refresh request', async () => {
    const { responseError } = await loadHttpInterceptors()
    localStorage.setItem('aimes_token', 'expired-token')
    localStorage.setItem('aimes_refresh_token', '  refresh-token  ')
    axiosPost.mockResolvedValueOnce({
      data: {
        token: 'new-access-token',
        refreshToken: 'new-refresh-token',
        expiresAt: '2026-06-01T00:00:00Z',
      },
    })

    const error = {
      isAxiosError: true,
      config: { url: '/work-orders', headers: {} },
      response: { status: 401 },
    }

    await expect(responseError(error)).resolves.toEqual({ data: { ok: true } })

    expect(axiosPost).toHaveBeenCalledWith('/api/v1/auth/refresh', { refreshToken: 'refresh-token' })
  })
})
