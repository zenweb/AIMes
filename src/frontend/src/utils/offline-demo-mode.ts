import type { InternalAxiosRequestConfig } from 'axios'

export const OFFLINE_DEMO_ERROR_CODE = 'AIMES_OFFLINE_DEMO'
const OFFLINE_DEMO_ERROR_MESSAGE_PREFIX = 'Offline demo mode skipped backend request:'

export class OfflineDemoApiError extends Error {
  readonly code = OFFLINE_DEMO_ERROR_CODE
  readonly isOfflineDemoApiError = true

  constructor(readonly requestUrl: string) {
    super(`Offline demo mode skipped backend request: ${requestUrl}`)
    this.name = 'OfflineDemoApiError'
  }
}

export function isOfflineDemoMode(): boolean {
  if (typeof window === 'undefined') return false

  const queryIntent = readOfflineDemoQueryIntent()
  if (queryIntent === true) {
    persistOfflineDemoMode('true')
    return true
  }
  if (queryIntent === false) {
    persistOfflineDemoMode('false')
    return false
  }

  const storedValue = readOfflineDemoMode()
  if (storedValue === 'true') return true
  if (storedValue === 'false') return false

  return import.meta.env.VITE_OFFLINE_DEMO === 'true'
}

export function shouldSkipBackendForOfflineDemo(accessToken: string | null): boolean {
  if (typeof window === 'undefined') return false

  const queryIntent = readOfflineDemoQueryIntent()
  if (queryIntent === true) {
    persistOfflineDemoMode('true')
    return true
  }
  if (queryIntent === false) {
    persistOfflineDemoMode('false')
    return false
  }

  if (!isOfflineDemoMode()) return false
  return !accessToken || accessToken.startsWith('demo-token-')
}

export function setOfflineDemoMode(enabled: boolean): void {
  if (typeof window === 'undefined') return
  persistOfflineDemoMode(enabled ? 'true' : 'false')
}

function readOfflineDemoQueryIntent(): boolean | null {
  const params = new URLSearchParams(window.location.search)
  const queryValue = params.get('offlineDemo') ?? params.get('demoMode')
  if (queryValue === '1' || queryValue === 'true' || queryValue === 'offline') return true
  if (queryValue === '0' || queryValue === 'false') return false
  return null
}

function readOfflineDemoMode(): string | null {
  try {
    return localStorage.getItem('aimes_offline_demo')
  } catch {
    return 'false'
  }
}

function persistOfflineDemoMode(value: 'true' | 'false'): void {
  try {
    localStorage.setItem('aimes_offline_demo', value)
  } catch {
    // Storage can be unavailable in locked-down browsers; URL intent still wins.
  }
}

export function createOfflineDemoApiError(config?: InternalAxiosRequestConfig): OfflineDemoApiError {
  const url = `${config?.baseURL ?? ''}${config?.url ?? ''}`
  return new OfflineDemoApiError(url || 'unknown backend request')
}

export function isOfflineDemoError(error: unknown): error is OfflineDemoApiError {
  return isOfflineDemoErrorCore(error, 0)
}

function isOfflineDemoErrorCore(error: unknown, depth: number): error is OfflineDemoApiError {
  if (depth > 3) return false
  if (error instanceof OfflineDemoApiError) return true
  if (typeof error !== 'object' || error === null) return false

  const candidate = error as {
    code?: string
    cause?: unknown
    error?: unknown
    innerError?: unknown
    isOfflineDemoApiError?: boolean
    message?: string
    name?: string
    response?: {
      data?: {
        message?: unknown
        title?: unknown
      }
    }
  }
  return candidate.code === OFFLINE_DEMO_ERROR_CODE
    || candidate.isOfflineDemoApiError === true
    || candidate.name === 'OfflineDemoApiError'
    || (typeof candidate.message === 'string' && candidate.message.includes(OFFLINE_DEMO_ERROR_MESSAGE_PREFIX))
    || (typeof candidate.response?.data?.message === 'string' && candidate.response.data.message.includes(OFFLINE_DEMO_ERROR_MESSAGE_PREFIX))
    || (typeof candidate.response?.data?.title === 'string' && candidate.response.data.title.includes(OFFLINE_DEMO_ERROR_MESSAGE_PREFIX))
    || isOfflineDemoErrorCore(candidate.cause, depth + 1)
    || isOfflineDemoErrorCore(candidate.error, depth + 1)
    || isOfflineDemoErrorCore(candidate.innerError, depth + 1)
}

export function logUnlessOfflineDemo(level: 'error' | 'warn', message: string, error: unknown): void {
  if (isOfflineDemoError(error)) return
  console[level](message, error)
}

export function appAssetPath(path: string): string {
  const normalized = path.startsWith('/') ? path.slice(1) : path
  return `${import.meta.env.BASE_URL}${normalized}`
}
