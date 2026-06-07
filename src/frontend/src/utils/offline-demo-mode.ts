import type { InternalAxiosRequestConfig } from 'axios'

export const OFFLINE_DEMO_ERROR_CODE = 'AIMES_OFFLINE_DEMO'

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

  const params = new URLSearchParams(window.location.search)
  const queryValue = params.get('offlineDemo') ?? params.get('demoMode')
  if (queryValue === '1' || queryValue === 'true' || queryValue === 'offline') {
    localStorage.setItem('aimes_offline_demo', 'true')
    return true
  }
  if (queryValue === '0' || queryValue === 'false') {
    localStorage.setItem('aimes_offline_demo', 'false')
    return false
  }

  const storedValue = localStorage.getItem('aimes_offline_demo')
  if (storedValue === 'true') return true
  if (storedValue === 'false') return false

  return import.meta.env.VITE_OFFLINE_DEMO === 'true'
}

export function setOfflineDemoMode(enabled: boolean): void {
  if (typeof window === 'undefined') return
  if (enabled) {
    localStorage.setItem('aimes_offline_demo', 'true')
    return
  }
  localStorage.setItem('aimes_offline_demo', 'false')
}

export function createOfflineDemoApiError(config?: InternalAxiosRequestConfig): OfflineDemoApiError {
  const url = `${config?.baseURL ?? ''}${config?.url ?? ''}`
  return new OfflineDemoApiError(url || 'unknown backend request')
}

export function isOfflineDemoError(error: unknown): error is OfflineDemoApiError {
  if (error instanceof OfflineDemoApiError) return true
  if (typeof error !== 'object' || error === null) return false

  const candidate = error as {
    code?: string
    isOfflineDemoApiError?: boolean
    name?: string
  }
  return candidate.code === OFFLINE_DEMO_ERROR_CODE
    || candidate.isOfflineDemoApiError === true
    || candidate.name === 'OfflineDemoApiError'
}

export function logUnlessOfflineDemo(level: 'error' | 'warn', message: string, error: unknown): void {
  if (isOfflineDemoError(error)) return
  console[level](message, error)
}

export function appAssetPath(path: string): string {
  const normalized = path.startsWith('/') ? path.slice(1) : path
  return `${import.meta.env.BASE_URL}${normalized}`
}
