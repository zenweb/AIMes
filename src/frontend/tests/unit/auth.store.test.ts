import { mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { defineComponent, nextTick } from 'vue'
import { installMemoryLocalStorage } from './test-storage'

type LoginRequest = {
  username: string
  password: string
}

const backendLogin = vi.hoisted(() => vi.fn())

vi.mock('../../src/api/auth', () => ({
  login: backendLogin,
}))

async function loadAuthStore() {
  vi.resetModules()
  return await import('../../src/stores/auth')
}

describe('useAuth', () => {
  beforeEach(() => {
    backendLogin.mockReset()
    installMemoryLocalStorage()
    localStorage.clear()
    window.history.replaceState({}, '', '/')
  })

  afterEach(() => {
    localStorage.clear()
    window.history.replaceState({}, '', '/')
  })

  it('persists backend login tokens so page reload keeps the authenticated user', async () => {
    backendLogin.mockResolvedValueOnce({
      token: 'backend-access-token',
      refreshToken: 'backend-refresh-token',
      username: 'alice',
      displayName: 'Alice Zhang',
      role: 'Engineer',
      expiresAt: '2026-06-01T00:00:00Z',
      mustChangePassword: false,
    })
    const { useAuth } = await loadAuthStore()

    const auth = useAuth()
    const user = await auth.login('alice', 'correct-password')

    expect(backendLogin).toHaveBeenCalledWith<LoginRequest[]>({
      username: 'alice',
      password: 'correct-password',
    })
    expect(user).toMatchObject({
      token: 'backend-access-token',
      username: 'alice',
      displayName: 'Alice Zhang',
      role: 'Engineer',
      mustChangePassword: false,
    })
    expect(localStorage.getItem('aimes_token')).toBe('backend-access-token')
    expect(localStorage.getItem('aimes_refresh_token')).toBe('backend-refresh-token')

    const reloaded = await loadAuthStore()
    expect(reloaded.useAuth().user.value).toMatchObject({
      token: 'backend-access-token',
      username: 'alice',
      displayName: 'Alice Zhang',
      role: 'Engineer',
      mustChangePassword: false,
    })
  })

  it('normalizes backend login tokens before persisting reload credentials', async () => {
    backendLogin.mockResolvedValueOnce({
      token: '  backend-access-token  ',
      refreshToken: '  backend-refresh-token  ',
      username: 'alice',
      displayName: 'Alice Zhang',
      role: 'Engineer',
      expiresAt: '2026-06-01T00:00:00Z',
      mustChangePassword: false,
    })
    const { useAuth } = await loadAuthStore()

    const user = await useAuth().login('alice', 'correct-password')

    expect(user.token).toBe('backend-access-token')
    expect(localStorage.getItem('aimes_token')).toBe('backend-access-token')
    expect(localStorage.getItem('aimes_refresh_token')).toBe('backend-refresh-token')
  })

  it('normalizes backend login identity fields before persisting auth evidence', async () => {
    backendLogin.mockResolvedValueOnce({
      token: 'backend-access-token',
      refreshToken: 'backend-refresh-token',
      username: '  alice  ',
      displayName: '  Alice Zhang  ',
      role: '  Engineer  ',
      expiresAt: '2026-06-01T00:00:00Z',
      mustChangePassword: false,
    })
    const { useAuth } = await loadAuthStore()

    const user = await useAuth().login('alice', 'correct-password')

    expect(user).toMatchObject({
      token: 'backend-access-token',
      username: 'alice',
      displayName: 'Alice Zhang',
      role: 'Engineer',
      mustChangePassword: false,
    })
    expect(JSON.parse(localStorage.getItem('aimes_user') ?? '{}')).toMatchObject({
      username: 'alice',
      displayName: 'Alice Zhang',
      role: 'Engineer',
      mustChangePassword: false,
    })
  })

  it('rejects backend login responses with blank identity fields without persisting auth evidence', async () => {
    backendLogin.mockResolvedValueOnce({
      token: 'backend-access-token',
      refreshToken: 'backend-refresh-token',
      username: '   ',
      displayName: 'Alice Zhang',
      role: 'Engineer',
      expiresAt: '2026-06-01T00:00:00Z',
      mustChangePassword: false,
    })
    const { useAuth } = await loadAuthStore()

    await expect(useAuth().login('alice', 'correct-password')).rejects.toThrow('用户名或密码错误')

    expect(localStorage.getItem('aimes_token')).toBeNull()
    expect(localStorage.getItem('aimes_refresh_token')).toBeNull()
    expect(localStorage.getItem('aimes_user')).toBeNull()
    expect(useAuth().user.value).toBeNull()
  })

  it('rejects backend login responses with blank refresh token without persisting partial auth evidence', async () => {
    backendLogin.mockResolvedValueOnce({
      token: 'backend-access-token',
      refreshToken: '   ',
      username: 'alice',
      displayName: 'Alice Zhang',
      role: 'Engineer',
      expiresAt: '2026-06-01T00:00:00Z',
      mustChangePassword: false,
    })
    const { useAuth } = await loadAuthStore()

    await expect(useAuth().login('alice', 'correct-password')).rejects.toThrow('用户名或密码错误')

    expect(localStorage.getItem('aimes_token')).toBeNull()
    expect(localStorage.getItem('aimes_refresh_token')).toBeNull()
    expect(localStorage.getItem('aimes_user')).toBeNull()
    expect(useAuth().user.value).toBeNull()
  })

  it('clears malformed cached users because auth boot must not reuse corrupt identity evidence', async () => {
    localStorage.setItem('aimes_token', 'stale-token')
    localStorage.setItem('aimes_user', '{bad json')

    const { useAuth } = await loadAuthStore()

    expect(useAuth().user.value).toBeNull()
    expect(localStorage.getItem('aimes_user')).toBeNull()
  })

  it('does not restore a cached user when the access token is blank', async () => {
    localStorage.setItem('aimes_token', '   ')
    localStorage.setItem('aimes_user', JSON.stringify({
      username: 'alice',
      displayName: 'Alice Zhang',
      role: 'Engineer',
      mustChangePassword: false,
    }))

    const { useAuth } = await loadAuthStore()

    expect(useAuth().user.value).toBeNull()
  })

  it('normalizes cached identity on boot so restored auth evidence matches backend fields', async () => {
    localStorage.setItem('aimes_token', '  cached-token  ')
    localStorage.setItem('aimes_user', JSON.stringify({
      username: '  alice  ',
      displayName: '  Alice Zhang  ',
      role: '  Engineer  ',
      mustChangePassword: false,
    }))

    const { useAuth } = await loadAuthStore()

    expect(useAuth().user.value).toMatchObject({
      token: 'cached-token',
      username: 'alice',
      displayName: 'Alice Zhang',
      role: 'Engineer',
      mustChangePassword: false,
    })
  })

  it('uses the offline demo account without calling the backend when demo mode is requested', async () => {
    window.history.replaceState({}, '', '/login?offlineDemo=1')
    const { useAuth } = await loadAuthStore()

    const auth = useAuth()
    const user = await auth.login('operator', 'operator-demo-2026')

    expect(backendLogin).not.toHaveBeenCalled()
    expect(user).toMatchObject({
      token: 'demo-token-operator',
      username: 'operator',
      displayName: '操作员',
      role: 'Operator',
      mustChangePassword: false,
    })
    expect(localStorage.getItem('aimes_offline_demo')).toBe('true')
    expect(localStorage.getItem('aimes_token')).toBe('demo-token-operator')
  })

  it('keeps ordinary preview login backend-first so employee reads do not get trapped in offline demo mode', async () => {
    backendLogin.mockResolvedValueOnce({
      token: 'backend-access-token',
      refreshToken: 'backend-refresh-token',
      username: 'admin',
      displayName: 'Backend Admin',
      role: 'Admin',
      expiresAt: '2026-06-01T00:00:00Z',
      mustChangePassword: false,
    })
    const { useAuth } = await loadAuthStore()

    const user = await useAuth().login('admin', 'admin123')

    expect(backendLogin).toHaveBeenCalledWith<LoginRequest[]>({
      username: 'admin',
      password: 'admin123',
    })
    expect(user).toMatchObject({
      token: 'backend-access-token',
      displayName: 'Backend Admin',
    })
    expect(localStorage.getItem('aimes_offline_demo')).not.toBe('true')
  })

  it('normalizes demo login username before storing auth evidence', async () => {
    window.history.replaceState({}, '', '/login?offlineDemo=1')
    const { useAuth } = await loadAuthStore()

    const user = await useAuth().login('  Operator  ', 'operator-demo-2026')

    expect(backendLogin).not.toHaveBeenCalled()
    expect(user.username).toBe('operator')
    expect(JSON.parse(localStorage.getItem('aimes_user') ?? '{}')).toMatchObject({
      username: 'operator',
      displayName: '操作员',
      role: 'Operator',
      mustChangePassword: false,
    })
  })

  it('exposes reactive login state to Vue components and clears storage on logout', async () => {
    backendLogin.mockResolvedValueOnce({
      token: 'backend-access-token',
      refreshToken: 'backend-refresh-token',
      username: 'admin',
      displayName: 'Backend Admin',
      role: 'Admin',
      expiresAt: '2026-06-01T00:00:00Z',
      mustChangePassword: false,
    })
    const { useAuth } = await loadAuthStore()
    const Probe = defineComponent({
      setup() {
        return useAuth()
      },
      template: '<button data-test="state" @click="logout">{{ isLoggedIn ? user?.role : "Guest" }}</button>',
    })

    const auth = useAuth()
    await auth.login('admin', 'admin123')

    const wrapper = mount(Probe)
    expect(wrapper.get('[data-test="state"]').text()).toBe('Admin')

    await wrapper.get('[data-test="state"]').trigger('click')
    await nextTick()

    expect(wrapper.get('[data-test="state"]').text()).toBe('Guest')
    expect(localStorage.getItem('aimes_token')).toBeNull()
    expect(localStorage.getItem('aimes_refresh_token')).toBeNull()
    expect(localStorage.getItem('aimes_user')).toBeNull()
  })
})
