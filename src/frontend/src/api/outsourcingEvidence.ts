import http from './http'
import type { OutsourcingCommitmentPackage } from '../utils/outsourcing-commitment-sync'

export async function queryOutsourcingCommitments(take = 8): Promise<OutsourcingCommitmentPackage[]> {
  try {
    const { data } = await http.get<OutsourcingCommitmentPackage[]>('/scheduling/outsourcing-commitments', {
      params: { take },
    })
    return data
  } catch {
    return []
  }
}

export async function getLatestOutsourcingCommitment(): Promise<OutsourcingCommitmentPackage | null> {
  try {
    const { data } = await http.get<OutsourcingCommitmentPackage>('/scheduling/outsourcing-commitments/latest')
    return data
  } catch {
    return null
  }
}

export async function upsertOutsourcingCommitment(item: OutsourcingCommitmentPackage): Promise<OutsourcingCommitmentPackage> {
  const { data } = await http.post<OutsourcingCommitmentPackage>('/scheduling/outsourcing-commitments', item)
  return data
}
