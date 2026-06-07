import http from './http'
import type { KnowledgeGovernanceReviewRecord } from '../utils/knowledge-governance-sync'

export async function queryKnowledgeGovernanceReviews(take = 12): Promise<KnowledgeGovernanceReviewRecord[]> {
  const { data } = await http.get<KnowledgeGovernanceReviewRecord[]>('/scheduling/knowledge-governance-reviews', { params: { take } })
  return data
}

export async function upsertKnowledgeGovernanceReview(item: KnowledgeGovernanceReviewRecord): Promise<KnowledgeGovernanceReviewRecord> {
  const { data } = await http.post<KnowledgeGovernanceReviewRecord>('/scheduling/knowledge-governance-reviews', item)
  return data
}
