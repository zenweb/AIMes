import http from './http'
import type { OtdKpiCommitmentPackage } from '../utils/otd-kpi-commitment-sync'

export async function queryOtdKpiCommitments(take = 8, options?: { failLoud?: boolean }): Promise<OtdKpiCommitmentPackage[]> {
  try {
    const { data } = await http.get<OtdKpiCommitmentPackage[]>('/scheduling/otd-kpi-commitments', { params: { take } })
    return data
  } catch (error: unknown) {
    if (options?.failLoud) throw error
    return []
  }
}

export async function getLatestOtdKpiCommitment(options?: { failLoud?: boolean }): Promise<OtdKpiCommitmentPackage | null> {
  try {
    const { data } = await http.get<OtdKpiCommitmentPackage>('/scheduling/otd-kpi-commitments/latest')
    return data
  } catch (error: unknown) {
    if (options?.failLoud) throw error
    return null
  }
}

export async function upsertOtdKpiCommitment(item: OtdKpiCommitmentPackage): Promise<OtdKpiCommitmentPackage> {
  const { data } = await http.post<OtdKpiCommitmentPackage>('/scheduling/otd-kpi-commitments', item)
  return data
}
