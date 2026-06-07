import { beforeEach, describe, expect, it, vi } from 'vitest'
import { installMemoryLocalStorage } from './test-storage'
import {
  createDefaultKnowledgeGovernanceReview,
  readKnowledgeGovernanceReview,
  readKnowledgeGovernanceReviews,
  readKnowledgeGovernanceReviewsBackendFirst,
  writeKnowledgeGovernanceReview,
  type KnowledgeGovernanceReviewRecord,
} from '../../src/utils/knowledge-governance-sync'
import { readOtdEvidenceChainRecords } from '../../src/utils/otd-evidence-chain-sync'

const httpGet = vi.hoisted(() => vi.fn())
const httpPost = vi.hoisted(() => vi.fn())

vi.mock('../../src/api/http', () => ({
  default: {
    get: httpGet,
    post: httpPost,
  },
}))

function review(overrides: Partial<KnowledgeGovernanceReviewRecord> = {}): KnowledgeGovernanceReviewRecord {
  return createDefaultKnowledgeGovernanceReview('2026-05-31T08:00:00.000Z', overrides)
}

describe('knowledge governance sync', () => {
  beforeEach(() => {
    installMemoryLocalStorage()
    localStorage.clear()
    httpGet.mockReset()
    httpPost.mockReset()
  })

  it('stores knowledge governance reviews, mirrors OTD evidence, and syncs backend best-effort', async () => {
    const record = writeKnowledgeGovernanceReview(review())
    await vi.dynamicImportSettled()

    expect(readKnowledgeGovernanceReviews()).toEqual([record])
    expect(readKnowledgeGovernanceReview(record.documentId)).toEqual(record)
    expect(httpPost).toHaveBeenCalledWith('/scheduling/knowledge-governance-reviews', record)
    expect(readOtdEvidenceChainRecords()).toEqual([
      expect.objectContaining({
        id: 'knowledge-governance-kg-equipment-cnc-maint',
        stage: '知识治理',
        status: 'closed',
        statusLabel: '已复核',
        traceId: 'TRACE-KG-CNC-MAINT-REINDEX',
      }),
    ])
  })

  it('falls back to local governance reviews when backend returns no records', async () => {
    const localRecord = writeKnowledgeGovernanceReview(review())
    httpGet.mockResolvedValueOnce({ data: [] })

    await expect(readKnowledgeGovernanceReviewsBackendFirst()).resolves.toEqual([localRecord])
    expect(httpGet).toHaveBeenCalledWith('/scheduling/knowledge-governance-reviews', { params: { take: 12 } })
  })

  it('falls back to local governance reviews when backend fails but local audit records exist', async () => {
    const localRecord = writeKnowledgeGovernanceReview(review())
    httpGet.mockRejectedValueOnce(new Error('knowledge governance backend unavailable'))

    await expect(readKnowledgeGovernanceReviewsBackendFirst()).resolves.toEqual([localRecord])
  })

  it('fails loud when backend fails and no local governance audit record exists', async () => {
    httpGet.mockRejectedValueOnce(new Error('knowledge governance backend unavailable'))

    await expect(readKnowledgeGovernanceReviewsBackendFirst()).rejects.toThrow('knowledge governance backend unavailable')
  })

  it('writes back valid governance reviews when local storage also contains incomplete records', () => {
    const validRecord = review()
    localStorage.setItem('aimes_knowledge_governance_reviews', JSON.stringify([
      {
        id: 'knowledge-governance-review-kg-equipment-cnc-maint',
        documentId: 'kg-equipment-cnc-maint',
      },
      validRecord,
    ]))

    expect(readKnowledgeGovernanceReviews()).toEqual([validRecord])
    expect(JSON.parse(localStorage.getItem('aimes_knowledge_governance_reviews') ?? '[]')).toEqual([validRecord])
  })

  it('removes incomplete governance reviews that cannot explain reviewer or audit trace', () => {
    localStorage.setItem('aimes_knowledge_governance_reviews', JSON.stringify([
      {
        id: 'knowledge-governance-review-kg-equipment-cnc-maint',
        documentId: 'kg-equipment-cnc-maint',
        documentTitle: 'CNC-01 主轴维护手册',
      },
    ]))

    expect(readKnowledgeGovernanceReviews()).toEqual([])
    expect(localStorage.getItem('aimes_knowledge_governance_reviews')).toBeNull()
  })
})
