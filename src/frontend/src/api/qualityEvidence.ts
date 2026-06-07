import http from './http'
import type { QualityMrbDispositionRecord } from '../utils/quality-mrb-disposition-sync'
import type { QualityReworkImpact } from '../utils/quality-rework-sync'

export async function getLatestQualityReworkImpact(): Promise<QualityReworkImpact | null> {
  try {
    const { data } = await http.get<QualityReworkImpact>('/scheduling/quality-rework-impact/latest')
    return data
  } catch {
    return null
  }
}

export async function upsertQualityReworkImpact(item: QualityReworkImpact): Promise<QualityReworkImpact> {
  const { data } = await http.post<QualityReworkImpact>('/scheduling/quality-rework-impact', item)
  return data
}

export async function getLatestQualityMrbDisposition(): Promise<QualityMrbDispositionRecord | null> {
  try {
    const { data } = await http.get<QualityMrbDispositionRecord>('/scheduling/quality-mrb-disposition/latest')
    return data
  } catch {
    return null
  }
}

export async function upsertQualityMrbDisposition(item: QualityMrbDispositionRecord): Promise<QualityMrbDispositionRecord> {
  const { data } = await http.post<QualityMrbDispositionRecord>('/scheduling/quality-mrb-disposition', item)
  return data
}
