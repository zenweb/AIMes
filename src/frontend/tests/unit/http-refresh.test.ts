import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { installMemoryLocalStorage } from './test-storage'

const axiosPost = vi.hoisted(() => vi.fn())
const axiosRetry = vi.hoisted(() => vi.fn())
const addToast = vi.hoisted(() => vi.fn())
const shouldSkipBackend = vi.hoisted(() => vi.fn(() => false))

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
  shouldSkipBackendForOfflineDemo: shouldSkipBackend,
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
    responseSuccess: created.interceptors.response.use.mock.calls[0][0] as (response: unknown) => unknown,
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
    shouldSkipBackend.mockReturnValue(false)
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
    expect(shouldSkipBackend).toHaveBeenCalledWith('access-token')
  })

  it('does not let stale offline demo storage skip live backend requests when a real token exists', async () => {
    const { request } = await loadHttpInterceptors()
    localStorage.setItem('aimes_token', 'backend-access-token')
    shouldSkipBackend.mockReturnValueOnce(false)

    expect(request({ url: '/employee' })).toEqual({
      url: '/employee',
      headers: { Authorization: 'Bearer backend-access-token' },
    })

    expect(shouldSkipBackend).toHaveBeenCalledWith('backend-access-token')
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

  it('shares a single refresh request across concurrent 401 responses before retrying each API call', async () => {
    const { responseError } = await loadHttpInterceptors()
    localStorage.setItem('aimes_token', 'expired-token')
    localStorage.setItem('aimes_refresh_token', 'refresh-token')
    let resolveRefresh!: (value: {
      data: {
        token: string
        refreshToken: string
        expiresAt: string
      }
    }) => void
    axiosPost.mockReturnValueOnce(new Promise((resolve) => {
      resolveRefresh = resolve
    }))

    const firstError = {
      isAxiosError: true,
      config: { url: '/scheduling/current', headers: {} },
      response: { status: 401 },
    }
    const secondError = {
      isAxiosError: true,
      config: { url: '/report/dashboard', headers: {} },
      response: { status: 401 },
    }

    const firstRetry = responseError(firstError)
    const secondRetry = responseError(secondError)
    expect(axiosPost).toHaveBeenCalledTimes(1)

    resolveRefresh({
      data: {
        token: 'shared-access-token',
        refreshToken: 'shared-refresh-token',
        expiresAt: '2026-06-01T00:00:00Z',
      },
    })

    await expect(Promise.all([firstRetry, secondRetry])).resolves.toEqual([
      { data: { ok: true } },
      { data: { ok: true } },
    ])
    expect(axiosRetry).toHaveBeenCalledTimes(2)
    expect(axiosRetry).toHaveBeenNthCalledWith(1, expect.objectContaining({
      url: '/scheduling/current',
      headers: { Authorization: 'Bearer shared-access-token' },
    }))
    expect(axiosRetry).toHaveBeenNthCalledWith(2, expect.objectContaining({
      url: '/report/dashboard',
      headers: { Authorization: 'Bearer shared-access-token' },
    }))
    expect(localStorage.getItem('aimes_token')).toBe('shared-access-token')
    expect(localStorage.getItem('aimes_refresh_token')).toBe('shared-refresh-token')
  })

  it('clears auth state without retrying when refresh token is blank', async () => {
    const { responseError } = await loadHttpInterceptors()
    localStorage.setItem('aimes_token', 'expired-token')
    localStorage.setItem('aimes_refresh_token', '   ')
    localStorage.setItem('aimes_user', JSON.stringify({ username: 'alice' }))

    const error = {
      isAxiosError: true,
      config: { url: '/work-orders', headers: {} },
      response: { status: 401 },
    }

    await expect(responseError(error)).rejects.toBe(error)

    expect(axiosPost).not.toHaveBeenCalled()
    expect(axiosRetry).not.toHaveBeenCalled()
    expect(localStorage.getItem('aimes_token')).toBeNull()
    expect(localStorage.getItem('aimes_refresh_token')).toBeNull()
    expect(localStorage.getItem('aimes_user')).toBeNull()
  })

  it('does not recursively refresh the refresh endpoint itself when it returns 401', async () => {
    const { responseError } = await loadHttpInterceptors()
    localStorage.setItem('aimes_token', 'expired-token')
    localStorage.setItem('aimes_refresh_token', 'refresh-token')
    localStorage.setItem('aimes_user', JSON.stringify({ username: 'alice' }))

    const error = {
      isAxiosError: true,
      config: { url: '/auth/refresh', headers: {} },
      response: { status: 401 },
    }

    await expect(responseError(error)).rejects.toBe(error)

    expect(axiosPost).not.toHaveBeenCalled()
    expect(axiosRetry).not.toHaveBeenCalled()
    expect(localStorage.getItem('aimes_token')).toBeNull()
    expect(localStorage.getItem('aimes_refresh_token')).toBeNull()
    expect(localStorage.getItem('aimes_user')).toBeNull()
  })

  it('shows backend ProblemDetails title as the toast message for non-auth API failures', async () => {
    const { responseError } = await loadHttpInterceptors()

    const error = {
      isAxiosError: true,
      message: 'Request failed with status code 500',
      config: { url: '/scheduling/current', headers: {} },
      response: {
        status: 500,
        data: { title: '排产服务暂时不可用' },
      },
    }

    await expect(responseError(error)).rejects.toBe(error)

    expect(addToast).toHaveBeenCalledWith('error', '请求错误', '排产服务暂时不可用')
    expect(axiosPost).not.toHaveBeenCalled()
    expect(axiosRetry).not.toHaveBeenCalled()
  })

  it('lets optional latest reads suppress global error toasts while still rejecting the response', async () => {
    const { responseError } = await loadHttpInterceptors()

    const error = {
      isAxiosError: true,
      message: 'Request failed with status code 404',
      config: { url: '/scheduling/quality-mrb-disposition/latest', headers: {}, suppressErrorToast: true },
      response: {
        status: 404,
        data: { title: 'Not Found' },
      },
    }

    await expect(responseError(error)).rejects.toBe(error)

    expect(addToast).not.toHaveBeenCalled()
    expect(axiosPost).not.toHaveBeenCalled()
    expect(axiosRetry).not.toHaveBeenCalled()
  })

  it('rejects HTML fallback responses even when the server omits text/html content type', async () => {
    const { responseSuccess } = await loadHttpInterceptors()

    const response = {
      data: '<html><body>SPA fallback</body></html>',
      headers: {},
      config: { url: '/dashboard' },
    }

    await expect(Promise.resolve(responseSuccess(response))).rejects.toThrow(
      'API 返回了 HTML fallback，疑似后端不可用：/dashboard',
    )
  })
})
