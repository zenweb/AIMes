import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  queryKnowledgeGovernanceReviews,
  upsertKnowledgeGovernanceReview,
} from '../../src/api/knowledgeGovernanceEvidence'

const httpGet = vi.hoisted(() => vi.fn())
const httpPost = vi.hoisted(() => vi.fn())

vi.mock('../../src/api/http', () => ({
  default: {
    get: httpGet,
    post: httpPost,
  },
}))

describe('knowledge governance evidence api contract', () => {
  beforeEach(() => {
    httpGet.mockReset()
    httpPost.mockReset()
  })

  it('uses backend contract paths for governance review reads and writes', async () => {
    const item = {
      id: 'knowledge-governance-review-001',
      documentId: 'kg-equipment-cnc-maint',
      traceId: 'TRACE-KG-CNC-MAINT-REINDEX',
    }
    httpGet.mockResolvedValueOnce({ data: [item] })
    httpPost.mockResolvedValueOnce({ data: item })

    await expect(queryKnowledgeGovernanceReviews(6)).resolves.toEqual([item])
    await expect(upsertKnowledgeGovernanceReview(item as never)).resolves.toBe(item)

    expect(httpGet).toHaveBeenCalledWith('/scheduling/knowledge-governance-reviews', {
      params: { take: 6 },
    })
    expect(httpPost).toHaveBeenCalledWith('/scheduling/knowledge-governance-reviews', item)
  })

  it('propagates backend read failures so governance replay can fail loud when no local evidence exists', async () => {
    httpGet.mockRejectedValueOnce(new Error('knowledge governance backend unavailable'))

    await expect(queryKnowledgeGovernanceReviews()).rejects.toThrow('knowledge governance backend unavailable')
  })
})
