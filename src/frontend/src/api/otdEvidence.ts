import http from './http'
import type { OtdEvidenceChainItem } from '../utils/otd-evidence-chain-sync'

export async function getOtdEvidenceChain(take = 24): Promise<OtdEvidenceChainItem[]> {
  const { data } = await http.get<OtdEvidenceChainItem[]>('/scheduling/otd-evidence', {
    params: { take },
  })
  return data
}

export async function upsertOtdEvidence(item: OtdEvidenceChainItem): Promise<OtdEvidenceChainItem> {
  const { data } = await http.post<OtdEvidenceChainItem>('/scheduling/otd-evidence', item)
  return data
}
