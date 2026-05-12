import { reactive, computed } from 'vue'
import { login as apiLogin } from '../api/auth'
import type { LoginResponse } from '../api/auth'

const TOKEN_KEY = 'aimes_token'
const USER_KEY = 'aimes_user'

export interface AuthUser {
  token: string
  username: string
  displayName: string
  role: string
}

const state = reactive({
  user: loadUser(),
})

function loadUser(): AuthUser | null {
  try {
    const token = localStorage.getItem(TOKEN_KEY)
    const raw = localStorage.getItem(USER_KEY)
    if (token && raw) {
      return { token, ...JSON.parse(raw) }
    }
  } catch { /* ignore */ }
  return null
}

function saveUser(user: AuthUser) {
  localStorage.setItem(TOKEN_KEY, user.token)
  localStorage.setItem(USER_KEY, JSON.stringify({
    username: user.username,
    displayName: user.displayName,
    role: user.role,
  }))
}

function clearUser() {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
}

export function useAuth() {
  return {
    user: computed(() => state.user),
    isLoggedIn: computed(() => !!state.user?.token),

    async login(username: string, password: string) {
      // 先尝试后端登录
      try {
        const res = await apiLogin({ username, password })
        const user: AuthUser = {
          token: res.token,
          username: res.username,
          displayName: res.displayName,
          role: res.role,
        }
        state.user = user
        saveUser(user)
        return user
      } catch {
        // 后端不可用时使用演示登录
        if (username === 'admin' && password === 'admin123') {
          const user: AuthUser = {
            token: 'demo-token-' + Date.now(),
            username: 'admin',
            displayName: '系统管理员',
            role: 'Admin',
          }
          state.user = user
          saveUser(user)
          return user
        }
        throw new Error('用户名或密码错误')
      }
    },

    logout() {
      state.user = null
      clearUser()
    },
  }
}
