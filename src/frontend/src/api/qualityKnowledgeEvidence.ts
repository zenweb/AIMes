import http from './http'

export interface QualityKnowledgeEvidenceEnvelope<T = unknown> {
  id: string
  evidenceType: string
  title: string
  auditId: string
  traceId: string
  status: string
  createdAt: string
  payload: T
}

export async function queryQualityKnowledgeEvidence<T = unknown>(
  evidenceType: string,
  take = 20
): Promise<Array<QualityKnowledgeEvidenceEnvelope<T>>> {
  const { data } = await http.get<Array<QualityKnowledgeEvidenceEnvelope<T>>>('/scheduling/quality-knowledge-evidence', {
    params: { evidenceType, take },
  })
  return data
}

export async function upsertQualityKnowledgeEvidence<T>(
  item: QualityKnowledgeEvidenceEnvelope<T>
): Promise<QualityKnowledgeEvidenceEnvelope<T>> {
  const { data } = await http.post<QualityKnowledgeEvidenceEnvelope<T>>('/scheduling/quality-knowledge-evidence', item)
  return data
}
