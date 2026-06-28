const LOCAL_USER_KEY = 'aimes_user'

interface CachedUser {
  username?: string
  displayName?: string
  role?: string
  mustChangePassword?: boolean
}

function canUseStorage() {
  return typeof localStorage !== 'undefined'
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0
}

function normalizeOptionalString(value: unknown): string | undefined {
  return isNonEmptyString(value) ? value.trim() : undefined
}

function normalizeCachedUser(user: CachedUser): CachedUser {
  return {
    username: normalizeOptionalString(user.username),
    displayName: normalizeOptionalString(user.displayName),
    role: normalizeOptionalString(user.role),
    mustChangePassword: user.mustChangePassword,
  }
}

function isCompleteCachedUser(user: CachedUser): boolean {
  return isNonEmptyString(user.username)
    && isNonEmptyString(user.displayName)
    && isNonEmptyString(user.role)
    && typeof user.mustChangePassword === 'boolean'
}

function readCachedUser(): CachedUser | null {
  if (!canUseStorage()) return null
  const raw = localStorage.getItem(LOCAL_USER_KEY)
  if (!raw) return null

  try {
    const parsed = JSON.parse(raw)
    return parsed && typeof parsed === 'object' ? normalizeCachedUser(parsed as CachedUser) : null
  } catch {
    localStorage.removeItem(LOCAL_USER_KEY)
    return null
  }
}

export function getLocalUser(): CachedUser | null {
  const user = readCachedUser()
  if (!user) return null
  if (!isCompleteCachedUser(user)) {
    localStorage.removeItem(LOCAL_USER_KEY)
    return null
  }
  return user
}

export function getLocalUserRole(): string | null {
  const role = readCachedUser()?.role
  return isNonEmptyString(role) ? role.trim() : null
}

export function getLocalUserDisplayName(fallback = 'Unknown'): string {
  const user = readCachedUser()
  if (isNonEmptyString(user?.displayName)) return user.displayName.trim()
  if (isNonEmptyString(user?.username)) return user.username.trim()
  return fallback
}

export function getLocalUserReportActor(fallback = 'report.viewer'): string {
  const user = readCachedUser()
  if (isNonEmptyString(user?.username)) return user.username.trim()
  if (isNonEmptyString(user?.displayName)) return user.displayName.trim()
  return fallback
}
