const publicRoutes = new Set(['/login'])

function readCachedUser(): { role?: string; mustChangePassword?: boolean } | null {
  const raw = localStorage.getItem('aimes_user')
  if (!raw) return null

  try {
    const parsed = JSON.parse(raw)
    return parsed && typeof parsed === 'object'
      ? parsed as { role?: string; mustChangePassword?: boolean }
      : null
  } catch {
    return null
  }
}

export default defineNuxtRouteMiddleware((to) => {
  if (import.meta.server) return

  const token = localStorage.getItem('aimes_token')
  const cachedUser = readCachedUser()
  const mustChangePassword = cachedUser?.mustChangePassword === true
  const isPublic = publicRoutes.has(to.path)

  if (!token && !isPublic) {
    return navigateTo('/login')
  }

  if (mustChangePassword && to.path !== '/change-password' && to.path !== '/login') {
    return navigateTo('/change-password')
  }

  if (token && to.path === '/login') {
    return navigateTo(mustChangePassword ? '/change-password' : '/dashboard')
  }

  const roles = to.meta.roles as string[] | undefined
  if (roles?.length) {
    const userRole = cachedUser?.role
    if (!userRole || !roles.includes(userRole)) {
      return navigateTo('/dashboard')
    }
  }
})
