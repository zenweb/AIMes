const TOKEN_KEY = 'aimes_token'

export function getLocalAccessToken(): string | null {
  const token = localStorage.getItem(TOKEN_KEY)
  const normalizedToken = token?.trim()
  return normalizedToken ? normalizedToken : null
}
