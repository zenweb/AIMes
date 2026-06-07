import { beforeEach, describe, expect, it, vi } from 'vitest'
import { installMemoryLocalStorage } from './test-storage'
import {
  closeOtdEvidenceChainRecords,
  readOtdEvidenceChainRecords,
  readOtdEvidenceChainRecordsBackendFirst,
  type OtdEvidenceChainItem,
  upsertOtdEvidenceChainRecord,
} from '../../src/utils/otd-evidence-chain-sync'

const httpGet = vi.hoisted(() => vi.fn())
const httpPost = vi.hoisted(() => vi.fn())

vi.mock('../../src/api/http', () => ({
  default: {
    get: httpGet,
    post: httpPost,
  },
}))

function evidence(overrides: Partial<OtdEvidenceChainItem> = {}): OtdEvidenceChainItem {
  return {
    id: 'otd-evidence-001',
    stage: '客户承诺包',
    title: '华东客户群 交付恢复承诺包',
    summary: 'Agent OTD 从 26.67% 提升到 30%，延期减少 4 单。',
    object: '客户 / 华东客户群',
    source: '报表中心 / admin',
    traceId: 'TRACE-KPI-COMMITMENT-HUADONG-20260521',
    status: 'active',
    statusLabel: '带外部约束承诺',
    createdAt: '2026-05-31T08:00:00.000Z',
    ...overrides,
  }
}

describe('otd evidence chain sync', () => {
  beforeEach(() => {
    installMemoryLocalStorage()
    localStorage.clear()
    httpGet.mockReset()
    httpPost.mockReset()
  })

  it('upserts OTD evidence, deduplicates by id, caps records, and syncs backend best-effort', async () => {
    upsertOtdEvidenceChainRecord(evidence({ summary: '旧承诺' }))
    const next = upsertOtdEvidenceChainRecord(evidence({ summary: '新承诺' }))
    for (let index = 0; index < 24; index += 1) {
      upsertOtdEvidenceChainRecord(evidence({
        id: `otd-evidence-${index}`,
        traceId: `TRACE-OTD-${index}`,
      }))
    }
    await vi.dynamicImportSettled()

    const records = readOtdEvidenceChainRecords()
    expect(next[0]).toEqual(expect.objectContaining({ summary: '新承诺' }))
    expect(records).toHaveLength(24)
    expect(records[0]?.id).toBe('otd-evidence-23')
    expect(records.some(record => record.summary === '旧承诺')).toBe(false)
    expect(httpPost).toHaveBeenCalledWith('/scheduling/otd-evidence', expect.objectContaining({
      id: 'otd-evidence-001',
      summary: '新承诺',
    }))
  })

  it('falls back to local evidence chain when backend returns no records', async () => {
    const localRecord = evidence()
    upsertOtdEvidenceChainRecord(localRecord)
    httpGet.mockResolvedValueOnce({ data: [] })

    await expect(readOtdEvidenceChainRecordsBackendFirst()).resolves.toEqual([localRecord])
    expect(httpGet).toHaveBeenCalledWith('/scheduling/otd-evidence', { params: { take: 24 } })
  })

  it('falls back to local evidence chain when offline preview returns SPA HTML', async () => {
    const localRecord = evidence()
    upsertOtdEvidenceChainRecord(localRecord)
    httpGet.mockResolvedValueOnce({ data: '<!DOCTYPE html><html><body>AIMes</body></html>' })

    await expect(readOtdEvidenceChainRecordsBackendFirst()).resolves.toEqual([localRecord])
  })

  it('closes matching OTD evidence without changing unrelated records', () => {
    upsertOtdEvidenceChainRecord(evidence({ id: 'match', traceId: 'TRACE-MATCH' }))
    upsertOtdEvidenceChainRecord(evidence({ id: 'other', traceId: 'TRACE-OTHER' }))

    const next = closeOtdEvidenceChainRecords(
      record => record.id === 'match',
      {
        statusLabel: '客户承诺已闭环',
        summary: record => `${record.summary} 已完成客户确认。`,
        sourceTraceId: 'TRACE-CLOSURE',
      },
    )

    expect(next).toEqual([
      expect.objectContaining({ id: 'other', status: 'active' }),
      expect.objectContaining({
        id: 'match',
        status: 'closed',
        statusLabel: '客户承诺已闭环',
        sourceTraceId: 'TRACE-CLOSURE',
        summary: expect.stringContaining('已完成客户确认'),
      }),
    ])
  })

  it('removes corrupt evidence JSON so boards do not render stale OTD chain state', () => {
    localStorage.setItem('aimes_otd_evidence_chain', '{bad json')

    expect(readOtdEvidenceChainRecords()).toEqual([])
    expect(localStorage.getItem('aimes_otd_evidence_chain')).toBeNull()
  })

  it('removes incomplete evidence records that cannot explain trace or status', () => {
    localStorage.setItem('aimes_otd_evidence_chain', JSON.stringify([
      {
        id: 'otd-evidence-001',
        stage: '客户承诺包',
        title: '华东客户群 交付恢复承诺包',
      },
    ]))

    expect(readOtdEvidenceChainRecords()).toEqual([])
    expect(localStorage.getItem('aimes_otd_evidence_chain')).toBeNull()
  })
})
