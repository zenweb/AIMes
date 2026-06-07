import axios, { AxiosError, AxiosRequestConfig, InternalAxiosRequestConfig } from 'axios'
import { addToast } from '../stores/notifications'
import { getLocalAccessToken } from '../utils/auth-token'
import { createOfflineDemoApiError, isOfflineDemoError, isOfflineDemoMode } from '../utils/offline-demo-mode'

const TOKEN_KEY = 'aimes_token'
const REFRESH_TOKEN_KEY = 'aimes_refresh_token'
const USER_KEY = 'aimes_user'

const http = axios.create({
  baseURL: '/api/v1',
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
})

// 请求拦截器：自动附加 Authorization header
http.interceptors.request.use((config) => {
  if (isOfflineDemoMode()) {
    throw createOfflineDemoApiError(config)
  }

  const token = getLocalAccessToken()
  if (token) {
    config.headers = config.headers ?? {}
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// refresh token 共享 promise，防止并发 401 触发多次 /auth/refresh
let refreshing: Promise<string> | null = null

function clearAuthAndRedirect() {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(REFRESH_TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
  if (window.location.pathname !== '/scheduling/login') {
    window.location.href = '/scheduling/login'
  }
}

async function performRefresh(): Promise<string> {
  const refreshTokenStr = localStorage.getItem(REFRESH_TOKEN_KEY)
  const refreshTokenForRequest = refreshTokenStr?.trim()
  if (!refreshTokenForRequest) {
    throw new Error('no refresh token')
  }
  // 直接用裸 axios 调用避免拦截器递归（如果 /refresh 也 401，避免无限循环）
  const { data } = await axios.post<{
    token: string
    refreshToken: string
    expiresAt: string
  }>('/api/v1/auth/refresh', { refreshToken: refreshTokenForRequest })
  if (!isValidRefreshResponse(data)) {
    throw new Error('invalid refresh token response')
  }
  const token = data.token.trim()
  const refreshToken = data.refreshToken.trim()
  localStorage.setItem(TOKEN_KEY, token)
  localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken)
  return token
}

function isValidRefreshResponse(data: unknown): data is { token: string; refreshToken: string } {
  if (!data || typeof data !== 'object') return false
  const response = data as { token?: unknown; refreshToken?: unknown }
  return typeof response.token === 'string'
    && response.token.trim().length > 0
    && typeof response.refreshToken === 'string'
    && response.refreshToken.trim().length > 0
}

function getOrStartRefresh(): Promise<string> {
  if (refreshing) return refreshing
  refreshing = performRefresh().finally(() => { refreshing = null })
  return refreshing
}

interface RetriableConfig extends InternalAxiosRequestConfig {
  _retry?: boolean
}

function isHtmlFallbackResponse(data: unknown, contentType: unknown): boolean {
  const contentTypeText = typeof contentType === 'string' ? contentType.toLowerCase() : ''
  return contentTypeText.includes('text/html')
    || (typeof data === 'string' && data.trimStart().toLowerCase().startsWith('<!doctype html'))
}

// 响应拦截器：401 → /auth/refresh → retry；其他错误 → toast
http.interceptors.response.use(
  (res) => {
    if (isHtmlFallbackResponse(res.data, res.headers['content-type'])) {
      return Promise.reject(new Error(`API 返回了 HTML fallback，疑似后端不可用：${res.config.url ?? 'unknown request'}`))
    }
    return res
  },
  async (error: AxiosError) => {
    if (!axios.isAxiosError(error)) {
      return Promise.reject(error)
    }

    if (isOfflineDemoError(error)) {
      return Promise.reject(error)
    }

    const config = error.config as RetriableConfig | undefined
    const status = error.response?.status

    // 401 + 还没重试过 + 不是 /auth/refresh 自身 → 尝试 refresh
    if (status === 401 && config && !config._retry && !config.url?.includes('/auth/refresh')) {
      config._retry = true
      try {
        const newToken = await getOrStartRefresh()
        config.headers = config.headers ?? {}
        config.headers.Authorization = `Bearer ${newToken}`
        return http(config as AxiosRequestConfig)
      } catch {
        // refresh 失败（refresh token 也过期 / 缺失）→ 清空登录并跳转
        clearAuthAndRedirect()
        return Promise.reject(error)
      }
    }

    // 401 但 refresh 也已失败，或 /auth/refresh 自身 401 → 清空跳转
    if (status === 401) {
      clearAuthAndRedirect()
      return Promise.reject(error)
    }

    // 其他错误：提取后端 ProblemDetails 消息或 fallback
    const data = error.response?.data as { message?: string; title?: string } | string | undefined
    const msg =
      (typeof data === 'object' && (data?.message || data?.title)) ||
      (typeof data === 'string' ? data : null) ||
      error.message ||
      '请求失败'

    addToast('error', '请求错误', msg)
    return Promise.reject(error)
  },
)

export default http
