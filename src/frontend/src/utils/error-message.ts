type ErrorPayload = {
  response?: {
    data?: {
      message?: unknown
      title?: unknown
    }
  }
  message?: unknown
}

function asNonEmptyString(value: unknown): string | null {
  return typeof value === 'string' && value.trim() ? value : null
}

export function errorMessage(error: unknown, fallback: string, responseField: 'message' | 'title' = 'message'): string {
  const payload = typeof error === 'object' && error !== null ? error as ErrorPayload : null
  return asNonEmptyString(payload?.response?.data?.[responseField])
    ?? asNonEmptyString(payload?.message)
    ?? (error instanceof Error ? asNonEmptyString(error.message) : null)
    ?? fallback
}
