import axios, { AxiosError, AxiosRequestConfig, InternalAxiosRequestConfig } from 'axios'
import { addToast } from '../stores/notifications'

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
  const token = localStorage.getItem(TOKEN_KEY)
  if (token) {
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
  if (!refreshTokenStr) {
    throw new Error('no refresh token')
  }
  // 直接用裸 axios 调用避免拦截器递归（如果 /refresh 也 401，避免无限循环）
  const { data } = await axios.post<{
    token: string
    refreshToken: string
    expiresAt: string
  }>('/api/v1/auth/refresh', { refreshToken: refreshTokenStr })
  localStorage.setItem(TOKEN_KEY, data.token)
  localStorage.setItem(REFRESH_TOKEN_KEY, data.refreshToken)
  return data.token
}

function getOrStartRefresh(): Promise<string> {
  if (refreshing) return refreshing
  refreshing = performRefresh().finally(() => { refreshing = null })
  return refreshing
}

interface RetriableConfig extends InternalAxiosRequestConfig {
  _retry?: boolean
}

// 响应拦截器：401 → /auth/refresh → retry；其他错误 → toast
http.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    if (!axios.isAxiosError(error)) {
      return Promise.reject(error)
    }

    const config = error.config as RetriableConfig | undefined
    const status = error.response?.status

    // 401 + 还没重试过 + 不是 /auth/refresh 自身 → 尝试 refresh
    if (status === 401 && config && !config._retry && !config.url?.includes('/auth/refresh')) {
      config._retry = true
      try {
        const newToken = await getOrStartRefresh()
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
