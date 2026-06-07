import http from './http'
import type { OtdKpiCommitmentPackage } from '../utils/otd-kpi-commitment-sync'

export async function queryOtdKpiCommitments(take = 8): Promise<OtdKpiCommitmentPackage[]> {
  try {
    const { data } = await http.get<OtdKpiCommitmentPackage[]>('/scheduling/otd-kpi-commitments', { params: { take } })
    return data
  } catch {
    return []
  }
}

export async function getLatestOtdKpiCommitment(): Promise<OtdKpiCommitmentPackage | null> {
  try {
    const { data } = await http.get<OtdKpiCommitmentPackage>('/scheduling/otd-kpi-commitments/latest')
    return data
  } catch {
    return null
  }
}

export async function upsertOtdKpiCommitment(item: OtdKpiCommitmentPackage): Promise<OtdKpiCommitmentPackage> {
  const { data } = await http.post<OtdKpiCommitmentPackage>('/scheduling/otd-kpi-commitments', item)
  return data
}
