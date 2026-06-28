import { beforeEach, describe, expect, it, vi } from 'vitest'
import { installMemoryLocalStorage } from './test-storage'

const navigateTo = vi.hoisted(() => vi.fn((target: unknown) => target))
const middlewareRef = vi.hoisted(() => ({ value: null as ((to: {
  path: string
  query?: Record<string, unknown>
  meta: Record<string, unknown>
}) => unknown) | null }))

vi.stubGlobal('navigateTo', navigateTo)
vi.stubGlobal('defineNuxtRouteMiddleware', (middleware: typeof middlewareRef.value) => {
  middlewareRef.value = middleware
  return middleware
})

async function loadMiddleware() {
  vi.resetModules()
  middlewareRef.value = null
  await import('../../middleware/auth.global')
  if (!middlewareRef.value) throw new Error('Nuxt auth middleware was not registered')
  return middlewareRef.value
}

describe('Nuxt auth middleware', () => {
  beforeEach(() => {
    installMemoryLocalStorage()
    localStorage.clear()
    navigateTo.mockClear()
  })

  it('preserves explicit offline demo mode when protected route visitors are redirected to login', async () => {
    const middleware = await loadMiddleware()

    const result = middleware({
      path: '/employee',
      fullPath: '/employee?offlineDemo=1',
      query: { offlineDemo: '1' },
      meta: { roles: ['Admin'] },
    })

    expect(navigateTo).toHaveBeenCalledWith({
      path: '/login',
      query: { offlineDemo: '1', redirect: '/employee?offlineDemo=1' },
    })
    expect(result).toEqual({
      path: '/login',
      query: { offlineDemo: '1', redirect: '/employee?offlineDemo=1' },
    })
  })

  it('treats blank tokens as unauthenticated for protected routes', async () => {
    localStorage.setItem('aimes_token', '   ')
    localStorage.setItem('aimes_user', JSON.stringify({
      role: 'Admin',
      mustChangePassword: false,
    }))
    const middleware = await loadMiddleware()

    const result = middleware({
      path: '/employee',
      query: {},
      meta: { roles: ['Admin'] },
    })

    expect(navigateTo).toHaveBeenCalledWith({
      path: '/login',
      query: { redirect: '/employee' },
    })
    expect(result).toEqual({
      path: '/login',
      query: { redirect: '/employee' },
    })
  })

  it('treats missing cached role as unauthenticated before checking route roles', async () => {
    localStorage.setItem('aimes_token', 'stale-token')
    localStorage.setItem('aimes_user', JSON.stringify({
      mustChangePassword: false,
    }))
    const middleware = await loadMiddleware()

    const result = middleware({
      path: '/employee',
      query: {},
      meta: { roles: ['Admin'] },
    })

    expect(navigateTo).toHaveBeenCalledWith({
      path: '/login',
      query: { redirect: '/employee' },
    })
    expect(result).toEqual({
      path: '/login',
      query: { redirect: '/employee' },
    })
  })

  it('normalizes cached role whitespace before authorizing role-restricted routes', async () => {
    localStorage.setItem('aimes_token', 'admin-token')
    localStorage.setItem('aimes_user', JSON.stringify({
      username: 'admin',
      displayName: '管理员',
      role: '  Admin  ',
      mustChangePassword: false,
    }))
    const middleware = await loadMiddleware()

    const result = middleware({
      path: '/employee',
      query: {},
      meta: { roles: ['Admin'] },
    })

    expect(result).toBeUndefined()
    expect(navigateTo).not.toHaveBeenCalled()
  })

  it('clears stale demo sessions on plain login so live backend authentication can recover', async () => {
    localStorage.setItem('aimes_offline_demo', 'true')
    localStorage.setItem('aimes_token', 'demo-token-admin')
    localStorage.setItem('aimes_refresh_token', 'demo-refresh-admin')
    localStorage.setItem('aimes_user', JSON.stringify({
      username: 'admin',
      displayName: '管理员',
      role: 'Admin',
      mustChangePassword: false,
    }))
    const middleware = await loadMiddleware()

    const result = middleware({
      path: '/login',
      query: {},
      meta: {},
    })

    expect(result).toBeUndefined()
    expect(navigateTo).not.toHaveBeenCalled()
    expect(localStorage.getItem('aimes_token')).toBeNull()
    expect(localStorage.getItem('aimes_refresh_token')).toBeNull()
    expect(localStorage.getItem('aimes_user')).toBeNull()
    expect(localStorage.getItem('aimes_offline_demo')).toBe('false')
  })

  it('clears stale demo sessions on base-prefixed login so live employee reads are not skipped', async () => {
    localStorage.setItem('aimes_offline_demo', 'true')
    localStorage.setItem('aimes_token', 'demo-token-admin')
    localStorage.setItem('aimes_refresh_token', 'demo-refresh-admin')
    localStorage.setItem('aimes_user', JSON.stringify({
      username: 'admin',
      displayName: '管理员',
      role: 'Admin',
      mustChangePassword: false,
    }))
    const middleware = await loadMiddleware()

    const result = middleware({
      path: '/scheduling/login',
      query: { offlineDemo: '0', redirect: '/employee?offlineDemo=0' },
      meta: {},
    })

    expect(result).toBeUndefined()
    expect(navigateTo).not.toHaveBeenCalled()
    expect(localStorage.getItem('aimes_token')).toBeNull()
    expect(localStorage.getItem('aimes_refresh_token')).toBeNull()
    expect(localStorage.getItem('aimes_user')).toBeNull()
    expect(localStorage.getItem('aimes_offline_demo')).toBe('false')
  })

  it('clears stale demo sessions from protected live entries before employee requests can skip the backend', async () => {
    localStorage.setItem('aimes_offline_demo', 'true')
    localStorage.setItem('aimes_token', 'demo-token-admin')
    localStorage.setItem('aimes_refresh_token', 'demo-refresh-admin')
    localStorage.setItem('aimes_user', JSON.stringify({
      username: 'admin',
      displayName: '管理员',
      role: 'Admin',
      mustChangePassword: false,
    }))
    const middleware = await loadMiddleware()

    const result = middleware({
      path: '/employee',
      query: {},
      meta: { roles: ['Admin'] },
    })

    expect(navigateTo).toHaveBeenCalledWith('/login')
    expect(result).toBe('/login')
    expect(localStorage.getItem('aimes_token')).toBeNull()
    expect(localStorage.getItem('aimes_refresh_token')).toBeNull()
    expect(localStorage.getItem('aimes_user')).toBeNull()
    expect(localStorage.getItem('aimes_offline_demo')).toBe('false')
  })
})
