import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  queryQualityKnowledgeEvidence,
  upsertQualityKnowledgeEvidence,
  type QualityKnowledgeEvidenceEnvelope,
} from '../../src/api/qualityKnowledgeEvidence'

const httpGet = vi.hoisted(() => vi.fn())
const httpPost = vi.hoisted(() => vi.fn())

vi.mock('../../src/api/http', () => ({
  default: {
    get: httpGet,
    post: httpPost,
  },
}))

describe('quality knowledge evidence api contract', () => {
  beforeEach(() => {
    httpGet.mockReset()
    httpPost.mockReset()
  })

  it('uses backend contract paths and params for typed quality knowledge evidence reads and writes', async () => {
    const item: QualityKnowledgeEvidenceEnvelope<{ workOrderId: string }> = {
      id: 'quality-knowledge-evidence-001',
      evidenceType: 'QualityKnowledgeSample',
      title: '条码返工样本入库',
      auditId: 'AUD-QK-001',
      traceId: 'TRACE-QK-001',
      status: 'closed',
      createdAt: '2026-06-14T03:20:00.000Z',
      payload: { workOrderId: 'WO-DEMO-1018' },
    }
    httpGet.mockResolvedValueOnce({ data: [item] })
    httpPost.mockResolvedValueOnce({ data: item })

    await expect(queryQualityKnowledgeEvidence<{ workOrderId: string }>('QualityKnowledgeSample', 9)).resolves.toEqual([item])
    await expect(upsertQualityKnowledgeEvidence(item)).resolves.toBe(item)

    expect(httpGet).toHaveBeenCalledWith('/scheduling/quality-knowledge-evidence', {
      params: { evidenceType: 'QualityKnowledgeSample', take: 9 },
    })
    expect(httpPost).toHaveBeenCalledWith('/scheduling/quality-knowledge-evidence', item)
  })

  it('propagates backend read failures so quality governance surfaces can fail loud without local evidence', async () => {
    httpGet.mockRejectedValueOnce(new Error('quality knowledge evidence backend unavailable'))

    await expect(queryQualityKnowledgeEvidence('QualityKnowledgeGrayReleaseDecision')).rejects.toThrow('quality knowledge evidence backend unavailable')
  })
})
