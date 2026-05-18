const publicRoutes = new Set(['/login'])

export default defineNuxtRouteMiddleware((to) => {
  if (import.meta.server) return

  const token = localStorage.getItem('aimes_token')
  const isPublic = publicRoutes.has(to.path)

  if (!token && !isPublic) {
    return navigateTo('/login')
  }

  if (token && to.path === '/login') {
    return navigateTo('/dashboard')
  }

  const roles = to.meta.roles as string[] | undefined
  if (roles?.length) {
    try {
      const raw = localStorage.getItem('aimes_user')
      const userRole = raw ? JSON.parse(raw).role : null
      if (!userRole || !roles.includes(userRole)) {
        return navigateTo('/dashboard')
      }
    } catch {
      return navigateTo('/dashboard')
    }
  }
})
