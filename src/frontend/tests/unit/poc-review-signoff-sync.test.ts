import { beforeEach, describe, expect, it, vi } from 'vitest'
import { installMemoryLocalStorage } from './test-storage'
import {
  readPocReviewSignoffRecord,
  readPocReviewSignoffRecordBackendFirst,
  writePocReviewSignoffRecord,
  type PocReviewSignoffRecord,
} from '../../src/utils/poc-review-signoff-sync'
import { readOtdEvidenceChainRecords } from '../../src/utils/otd-evidence-chain-sync'

const getLatestPocReviewSignoff = vi.hoisted(() => vi.fn())
const upsertPocReviewSignoff = vi.hoisted(() => vi.fn(() => Promise.resolve()))
const httpGet = vi.hoisted(() => vi.fn())
const httpPost = vi.hoisted(() => vi.fn(() => Promise.resolve({ data: null })))

vi.mock('../../src/api/pocEvidence', () => ({
  getLatestPocReviewSignoff,
  upsertPocReviewSignoff,
}))

vi.mock('../../src/api/http', () => ({
  default: {
    get: httpGet,
    post: httpPost,
  },
}))

function signoff(overrides: Partial<PocReviewSignoffRecord> = {}): PocReviewSignoffRecord {
  return {
    id: 'poc-review-signoff-20260520',
    meetingId: 'POC-REVIEW-20260520-001',
    targetCustomer: '华东示范工厂',
    totalScore: 100,
    passScore: 85,
    result: 'approved',
    signedBy: '项目经理 / 客户代表',
    signedAt: '2026-05-31T08:00:00.000Z',
    reviewers: ['客户厂长', 'MES 项目经理', '调度主管', '设备主管'],
    evidenceBatches: ['IMP-POC-WO-20260520-001', 'EQ-FAULT-20260520-001'],
    auditId: 'AUD-POC-REVIEW-20260520',
    summary: 'POC 验收证据齐套，评分达到通过线，进入复盘签署。',
    ...overrides,
  }
}

describe('poc review signoff sync', () => {
  beforeEach(() => {
    installMemoryLocalStorage()
    localStorage.clear()
    getLatestPocReviewSignoff.mockReset()
    upsertPocReviewSignoff.mockClear()
    httpGet.mockReset()
    httpPost.mockClear()
  })

  it('stores review signoff, mirrors OTD evidence, and syncs backend best-effort', async () => {
    const record = writePocReviewSignoffRecord(signoff())
    await vi.dynamicImportSettled()

    expect(readPocReviewSignoffRecord()).toEqual(record)
    expect(upsertPocReviewSignoff).toHaveBeenCalledWith(record)
    expect(readOtdEvidenceChainRecords()).toEqual([
      expect.objectContaining({
        id: 'poc-signoff',
        stage: '复盘归档',
        status: 'closed',
        statusLabel: '已签署',
        traceId: 'AUD-POC-REVIEW-20260520',
      }),
    ])
  })

  it('falls back to local review signoff when backend returns no record', async () => {
    const localRecord = writePocReviewSignoffRecord(signoff())
    getLatestPocReviewSignoff.mockResolvedValueOnce(null)

    await expect(readPocReviewSignoffRecordBackendFirst()).resolves.toEqual(localRecord)
  })

  it('ignores incomplete backend review signoff so score reviewers and evidence stay auditable', async () => {
    const localRecord = writePocReviewSignoffRecord(signoff())
    getLatestPocReviewSignoff.mockResolvedValueOnce({
      meetingId: 'POC-REVIEW-20260520-001',
      auditId: 'AUD-POC-REVIEW-BACKEND-PARTIAL',
      signedAt: '2026-06-01T08:00:00.000Z',
    })

    await expect(readPocReviewSignoffRecordBackendFirst()).resolves.toEqual(localRecord)
  })

  it('fails loud for incomplete backend review signoff when audit replay requires backend payload evidence', async () => {
    writePocReviewSignoffRecord(signoff())
    getLatestPocReviewSignoff.mockResolvedValueOnce({
      id: 'poc-review-signoff-missing-payload',
      meetingId: 'POC-REVIEW-MISSING-PAYLOAD',
      auditId: 'AUD-POC-REVIEW-MISSING-PAYLOAD',
      signedAt: '2026-06-02T01:20:00.000Z',
    })

    await expect(readPocReviewSignoffRecordBackendFirst({ failLoud: true }))
      .rejects.toThrow('poc-review-signoff-missing-payload 复盘签署审计载荷缺失')
  })

  it('removes corrupt signoff JSON so review boards do not render stale approval', () => {
    localStorage.setItem('aimes_poc_review_signoff', '{bad json')

    expect(readPocReviewSignoffRecord()).toBeNull()
    expect(localStorage.getItem('aimes_poc_review_signoff')).toBeNull()
  })

  it('removes incomplete signoff records that cannot explain score reviewers or evidence', () => {
    localStorage.setItem('aimes_poc_review_signoff', JSON.stringify({
      meetingId: 'POC-REVIEW-20260520-001',
      auditId: 'AUD-POC-REVIEW-20260520',
    }))

    expect(readPocReviewSignoffRecord()).toBeNull()
    expect(localStorage.getItem('aimes_poc_review_signoff')).toBeNull()
  })
})
