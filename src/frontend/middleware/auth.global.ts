import { getLocalAccessToken } from '../src/utils/auth-token'
import { getLocalUser, getLocalUserRole } from '../src/utils/local-user'
import { setOfflineDemoMode } from '../src/utils/offline-demo-mode'

const publicRoutes = new Set(['/login'])
const appBasePath = '/scheduling'

function normalizeRoutePath(path: string) {
  if (path === appBasePath) return '/'
  if (path.startsWith(`${appBasePath}/`)) return path.slice(appBasePath.length)
  return path
}

function demoEntryQuery(query: Record<string, unknown>) {
  const result: Record<string, string> = {}
  for (const key of ['offlineDemo', 'demoMode']) {
    const value = query[key]
    if (typeof value === 'string') result[key] = value
  }
  return result
}

function protectedEntryQuery(to: { path: string; fullPath?: string; query?: Record<string, unknown> }) {
  const query = demoEntryQuery(to.query ?? {})
  query.redirect = to.fullPath || to.path
  return query
}

function isExplicitDemoEntry(query: Record<string, unknown>) {
  const value = query.offlineDemo ?? query.demoMode
  return value === '1' || value === 'true' || value === 'offline'
}

function clearCachedAuth() {
  localStorage.removeItem('aimes_token')
  localStorage.removeItem('aimes_refresh_token')
  localStorage.removeItem('aimes_user')
}

export default defineNuxtRouteMiddleware((to) => {
  if (import.meta.server) return

  const routePath = normalizeRoutePath(to.path)
  const token = getLocalAccessToken()
  const cachedUser = getLocalUser()
  const userRole = getLocalUserRole()
  const isAuthenticated = !!token && !!cachedUser && !!userRole
  const mustChangePassword = cachedUser?.mustChangePassword === true
  const isPublic = publicRoutes.has(routePath)

  if (token?.startsWith('demo-token-') && !isExplicitDemoEntry(to.query) && (routePath === '/login' || !isPublic)) {
    clearCachedAuth()
    setOfflineDemoMode(false)
    if (!isPublic) {
      return navigateTo('/login')
    }
    return
  }

  if (!isAuthenticated && !isPublic) {
    return navigateTo({ path: '/login', query: protectedEntryQuery(to) })
  }

  if (mustChangePassword && routePath !== '/change-password' && routePath !== '/login') {
    return navigateTo('/change-password')
  }

  if (token && routePath === '/login') {
    return navigateTo(mustChangePassword ? '/change-password' : '/dashboard')
  }

  const roles = to.meta.roles as string[] | undefined
  if (roles?.length) {
    if (!userRole || !roles.includes(userRole)) {
      return navigateTo('/dashboard')
    }
  }
})
