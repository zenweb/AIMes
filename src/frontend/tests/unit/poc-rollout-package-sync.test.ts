import { beforeEach, describe, expect, it, vi } from 'vitest'
import { installMemoryLocalStorage } from './test-storage'
import {
  readPocRolloutPackageRecord,
  readPocRolloutPackageRecordBackendFirst,
  writePocRolloutPackageRecord,
  type PocRolloutPackageRecord,
} from '../../src/utils/poc-rollout-package-sync'
import type { PocReviewSignoffRecord } from '../../src/utils/poc-review-signoff-sync'
import { readOtdEvidenceChainRecords } from '../../src/utils/otd-evidence-chain-sync'

const getLatestPocRolloutPackage = vi.hoisted(() => vi.fn())
const upsertPocRolloutPackage = vi.hoisted(() => vi.fn(() => Promise.resolve()))
const httpGet = vi.hoisted(() => vi.fn())
const httpPost = vi.hoisted(() => vi.fn(() => Promise.resolve({ data: null })))

vi.mock('../../src/api/pocEvidence', () => ({
  getLatestPocRolloutPackage,
  upsertPocRolloutPackage,
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
    reviewers: ['客户厂长', 'MES 项目经理'],
    evidenceBatches: ['IMP-POC-WO-20260520-001'],
    auditId: 'AUD-POC-REVIEW-20260520',
    summary: 'POC 验收证据齐套，评分达到通过线，进入复盘签署。',
    ...overrides,
  }
}

function rolloutPackage(overrides: Partial<PocRolloutPackageRecord> = {}): PocRolloutPackageRecord {
  const record = writePocRolloutPackageRecord(signoff()) as PocRolloutPackageRecord
  localStorage.removeItem('aimes_poc_rollout_package')
  localStorage.removeItem('aimes_otd_evidence_chain')
  return { ...record, ...overrides }
}

describe('poc rollout package sync', () => {
  beforeEach(() => {
    installMemoryLocalStorage()
    localStorage.clear()
    getLatestPocRolloutPackage.mockReset()
    upsertPocRolloutPackage.mockClear()
    httpGet.mockReset()
    httpPost.mockClear()
    vi.useRealTimers()
  })

  it('stores rollout package, mirrors OTD evidence, and syncs backend best-effort', async () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-05-31T08:00:00.000Z'))

    const record = writePocRolloutPackageRecord(signoff())
    await vi.dynamicImportSettled()

    expect(readPocRolloutPackageRecord()).toEqual(record)
    expect(upsertPocRolloutPackage).toHaveBeenCalledWith(record)
    expect(readOtdEvidenceChainRecords()).toEqual([
      expect.objectContaining({
        id: 'poc-rollout-package-20260521',
        stage: 'POC 上线交付包',
        status: 'ready',
        statusLabel: '待客户交付启动会确认',
        traceId: 'TRACE-POC-ROLLOUT-DELIVERY-PACKAGE-20260521',
      }),
    ])
  })

  it('falls back to local rollout package when backend returns no record', async () => {
    const localRecord = writePocRolloutPackageRecord(signoff())
    getLatestPocRolloutPackage.mockResolvedValueOnce(null)

    await expect(readPocRolloutPackageRecordBackendFirst()).resolves.toEqual(localRecord)
  })

  it('removes corrupt rollout JSON so boards do not render stale go-live actions', () => {
    localStorage.setItem('aimes_poc_rollout_package', '{bad json')

    expect(readPocRolloutPackageRecord()).toBeNull()
    expect(localStorage.getItem('aimes_poc_rollout_package')).toBeNull()
  })

  it('removes incomplete rollout packages that cannot explain go-live gate or ownership', () => {
    localStorage.setItem('aimes_poc_rollout_package', JSON.stringify({
      id: 'poc-rollout-package-20260521',
      title: 'POC 成功转上线交付行动包',
      status: 'ready',
    }))

    expect(readPocRolloutPackageRecord()).toBeNull()
    expect(localStorage.getItem('aimes_poc_rollout_package')).toBeNull()
  })

  it('removes rollout packages with incomplete action evidence', () => {
    localStorage.setItem('aimes_poc_rollout_package', JSON.stringify(rolloutPackage({
      actions: [{ module: '交付项目' } as PocRolloutPackageRecord['actions'][number]],
    })))

    expect(readPocRolloutPackageRecord()).toBeNull()
    expect(localStorage.getItem('aimes_poc_rollout_package')).toBeNull()
  })
})
