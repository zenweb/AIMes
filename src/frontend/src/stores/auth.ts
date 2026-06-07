import { reactive, computed } from 'vue'
import { AxiosError } from 'axios'
import { login as apiLogin } from '../api/auth'
import { getLocalAccessToken } from '../utils/auth-token'
import { isOfflineDemoMode, setOfflineDemoMode } from '../utils/offline-demo-mode'
import { getLocalUser } from '../utils/local-user'

const TOKEN_KEY = 'aimes_token'
const REFRESH_TOKEN_KEY = 'aimes_refresh_token'
const USER_KEY = 'aimes_user'

export interface AuthUser {
  token: string
  username: string
  displayName: string
  role: string
  mustChangePassword: boolean
}

const state = reactive({
  user: loadUser(),
})

const demoUsers: Record<string, { password: string; displayName: string; role: string }> = {
  admin: { password: 'admin123', displayName: '管理员', role: 'Admin' },
  operator: { password: 'operator-demo-2026', displayName: '操作员', role: 'Operator' },
  engineer: { password: 'engineer-demo-2026', displayName: '工程师', role: 'Engineer' },
  lead: { password: 'lead-demo-2026', displayName: '组长', role: 'Lead' },
}

function loadUser(): AuthUser | null {
  const token = getLocalAccessToken()
  const cachedUser = getLocalUser()
  if (!token || !isCachedAuthUser(cachedUser)) return null
  return { token, ...cachedUser }
}

function isCachedAuthUser(user: ReturnType<typeof getLocalUser>): user is Omit<AuthUser, 'token'> {
  return typeof user?.username === 'string'
    && typeof user.displayName === 'string'
    && typeof user.role === 'string'
    && typeof user.mustChangePassword === 'boolean'
}

function normalizeToken(value: string): string {
  return value.trim()
}

function saveUser(user: AuthUser, refreshToken: string) {
  localStorage.setItem(TOKEN_KEY, normalizeToken(user.token))
  localStorage.setItem(REFRESH_TOKEN_KEY, normalizeToken(refreshToken))
  localStorage.setItem(USER_KEY, JSON.stringify({
    username: user.username,
    displayName: user.displayName,
    role: user.role,
    mustChangePassword: user.mustChangePassword,
  }))
}

function clearUser() {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(REFRESH_TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
}

function isBackendUnavailable(error: unknown): boolean {
  if (!(error instanceof AxiosError)) return false
  return !error.response || error.response.status >= 500
}

function tryDemoLogin(username: string, password: string): AuthUser | null {
  const account = demoUsers[username.trim().toLowerCase()]
  if (!account || account.password !== password) return null
  return {
    token: `demo-token-${account.role.toLowerCase()}`,
    username,
    displayName: account.displayName,
    role: account.role,
    mustChangePassword: true,
  }
}

function shouldPreferDemoLogin(): boolean {
  return isOfflineDemoMode() || import.meta.env.DEV || import.meta.env.VITE_SHOW_DEMO_HINTS === 'true'
}

function saveDemoUser(user: AuthUser): AuthUser {
  setOfflineDemoMode(true)
  state.user = user
  saveUser(user, `demo-refresh-${user.role.toLowerCase()}`)
  return user
}

export function useAuth() {
  return {
    user: computed(() => state.user),
    isLoggedIn: computed(() => !!state.user?.token),

    async login(username: string, password: string) {
      const preferredDemoUser = shouldPreferDemoLogin() ? tryDemoLogin(username, password) : null
      if (preferredDemoUser) return saveDemoUser(preferredDemoUser)

      // 先尝试后端登录
      try {
        const res = await apiLogin({ username, password })
        const user: AuthUser = {
          token: normalizeToken(res.token),
          username: res.username,
          displayName: res.displayName,
          role: res.role,
          mustChangePassword: res.mustChangePassword,
        }
        state.user = user
        saveUser(user, res.refreshToken)
        return user
      } catch (error) {
        const demoUser = isBackendUnavailable(error) ? tryDemoLogin(username, password) : null
        if (!demoUser) {
          throw new Error('用户名或密码错误')
        }
        return saveDemoUser(demoUser)
      }
    },

    logout() {
      state.user = null
      clearUser()
    },
  }
}
