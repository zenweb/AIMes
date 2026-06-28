import http, { type AimesRequestConfig } from './http'
import type { QualityMrbDispositionRecord } from '../utils/quality-mrb-disposition-sync'
import type { QualityReworkImpact } from '../utils/quality-rework-sync'

export async function getLatestQualityReworkImpact(options?: { failLoud?: boolean }): Promise<QualityReworkImpact | null> {
  try {
    const config: AimesRequestConfig = { suppressErrorToast: true }
    const { data } = await http.get<QualityReworkImpact>('/scheduling/quality-rework-impact/latest', config)
    return data
  } catch (error: unknown) {
    if (isNotFoundResponse(error)) return null
    if (options?.failLoud) throw error
    return null
  }
}

export async function upsertQualityReworkImpact(item: QualityReworkImpact): Promise<QualityReworkImpact> {
  const { data } = await http.post<QualityReworkImpact>('/scheduling/quality-rework-impact', item)
  return data
}

export async function getLatestQualityMrbDisposition(options?: { failLoud?: boolean }): Promise<QualityMrbDispositionRecord | null> {
  try {
    const config: AimesRequestConfig = { suppressErrorToast: true }
    const { data } = await http.get<QualityMrbDispositionRecord>('/scheduling/quality-mrb-disposition/latest', config)
    return data
  } catch (error: unknown) {
    if (isNotFoundResponse(error)) return null
    if (options?.failLoud) throw error
    return null
  }
}

export async function upsertQualityMrbDisposition(item: QualityMrbDispositionRecord): Promise<QualityMrbDispositionRecord> {
  const { data } = await http.post<QualityMrbDispositionRecord>('/scheduling/quality-mrb-disposition', item)
  return data
}

function isNotFoundResponse(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false
  const candidate = error as { response?: { status?: unknown } }
  return candidate.response?.status === 404
}
