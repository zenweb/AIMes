import { beforeEach, describe, expect, it, vi } from 'vitest'
import { installMemoryLocalStorage } from './test-storage'
import {
  createDefaultKnowledgeGovernanceReview,
  readKnowledgeGovernanceDocuments,
  readKnowledgeGovernanceReview,
  readKnowledgeGovernancePendingDocuments,
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

  it('ignores incomplete backend governance reviews so reviewer audit trace and references stay auditable', async () => {
    const localRecord = writeKnowledgeGovernanceReview(review())
    httpGet.mockResolvedValueOnce({
      data: [
        {
          id: 'knowledge-governance-review-kg-equipment-cnc-maint',
          documentId: 'kg-equipment-cnc-maint',
          auditId: 'AUD-KG-PARTIAL',
        },
      ],
    })

    await expect(readKnowledgeGovernanceReviewsBackendFirst()).resolves.toEqual([localRecord])
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

  it('applies approved review evidence so expired maintenance documents become indexed audit sources', () => {
    const record = writeKnowledgeGovernanceReview(review({
      summary: 'CNC-01 主轴维护手册已完成 V1.2 复核，可解释主轴振动停机影响和维护窗口。',
      references: ['AI 生产助手', '设备维护', '风险预警', 'AI 排产', '审计回放'],
    }))

    const reviewedDocument = readKnowledgeGovernanceDocuments()
      .find(document => document.id === record.documentId)
    const pendingDocuments = readKnowledgeGovernancePendingDocuments()

    expect(reviewedDocument).toEqual(expect.objectContaining({
      id: 'kg-equipment-cnc-maint',
      version: 'V1.2',
      indexStatus: 'indexed',
      validUntil: '2026-12-31',
      freshnessStatus: '有效',
      owner: '设备主管 / 知识库管理员',
      auditHint: 'AUD-KG-REINDEX-20260520-001',
      recommendedAction: '已复核并重建索引，可作为 AI 助手、排产和风险复核的正式引用来源。',
    }))
    expect(reviewedDocument?.summary).toContain('主轴振动停机影响')
    expect(reviewedDocument?.references).toContain('审计回放')
    expect(pendingDocuments.map(document => document.id)).not.toContain('kg-equipment-cnc-maint')
    expect(pendingDocuments.map(document => document.id)).toEqual(['kg-quality-torque'])
  })
})
