import { beforeEach, describe, expect, it, vi } from 'vitest'
import { installMemoryLocalStorage } from './test-storage'
import {
  buildQualityMrbDispositionRecord,
  closeQualityMrbDispositionRecord,
  readQualityMrbDispositionRecord,
  readQualityMrbDispositionRecordBackendFirst,
  writeQualityMrbDispositionRecord,
  type QualityMrbDispositionRecord,
} from '../../src/utils/quality-mrb-disposition-sync'
import { readOtdEvidenceChainRecords } from '../../src/utils/otd-evidence-chain-sync'

const httpGet = vi.hoisted(() => vi.fn())
const httpPost = vi.hoisted(() => vi.fn(() => Promise.resolve({ data: null })))

vi.mock('../../src/api/http', () => ({
  default: {
    get: httpGet,
    post: httpPost,
  },
}))

function record(overrides: Partial<QualityMrbDispositionRecord> = {}): QualityMrbDispositionRecord {
  return {
    ...buildQualityMrbDispositionRecord('2026-05-31T08:00:00.000Z'),
    ...overrides,
  }
}

describe('quality mrb disposition sync', () => {
  beforeEach(() => {
    installMemoryLocalStorage()
    localStorage.clear()
    httpGet.mockReset()
    httpPost.mockClear()
  })

  it('stores MRB disposition and syncs backend and active OTD evidence best-effort', async () => {
    const item = record()

    writeQualityMrbDispositionRecord(item)
    await vi.dynamicImportSettled()

    expect(readQualityMrbDispositionRecord()).toEqual(item)
    expect(httpPost).toHaveBeenCalledWith('/scheduling/quality-mrb-disposition', item)
    expect(readOtdEvidenceChainRecords()).toEqual([
      expect.objectContaining({
        id: 'quality-mrb-disposition',
        status: 'active',
        traceId: 'TRACE-QA-WO-004-MRB-DISPOSITION-20260521',
        title: 'WO-004 装配间隙超差 MRB 处置决策',
      }),
    ])
  })

  it('falls back to local MRB disposition when backend returns no record', async () => {
    const localRecord = record()
    writeQualityMrbDispositionRecord(localRecord)
    httpGet.mockResolvedValueOnce({ data: null })

    await expect(readQualityMrbDispositionRecordBackendFirst()).resolves.toEqual(localRecord)
    expect(httpGet).toHaveBeenCalledWith('/scheduling/quality-mrb-disposition/latest')
  })

  it('closes MRB disposition with action results and closed OTD evidence', async () => {
    writeQualityMrbDispositionRecord(record())
    httpPost.mockClear()

    const closed = closeQualityMrbDispositionRecord('生产经理', '2026-05-31T10:00:00.000Z')
    await vi.dynamicImportSettled()

    expect(closed).toEqual(expect.objectContaining({
      status: 'closed',
      closedBy: '生产经理',
      closedAt: '2026-05-31T10:00:00.000Z',
      closureTraceId: 'TRACE-QA-WO-004-MRB-CLOSURE-20260521',
    }))
    expect(closed?.actions.every(action => typeof action.result === 'string')).toBe(true)
    expect(httpPost).toHaveBeenCalledWith('/scheduling/quality-mrb-disposition', closed)
    expect(readOtdEvidenceChainRecords()[0]).toEqual(expect.objectContaining({
      id: 'quality-mrb-disposition',
      status: 'closed',
      traceId: 'TRACE-QA-WO-004-MRB-CLOSURE-20260521',
      createdAt: '2026-05-31T10:00:00.000Z',
    }))
  })

  it('removes corrupt MRB disposition JSON', () => {
    localStorage.setItem('aimes_quality_mrb_disposition', '{bad json')

    expect(readQualityMrbDispositionRecord()).toBeNull()
    expect(localStorage.getItem('aimes_quality_mrb_disposition')).toBeNull()
  })

  it('removes incomplete MRB disposition that cannot explain disposition, schedule, or audit impact', () => {
    localStorage.setItem('aimes_quality_mrb_disposition', JSON.stringify({
      id: 'quality-mrb-disposition-20260521',
      title: 'WO-004 装配间隙超差 MRB 处置决策',
      workOrderId: 'WO-004',
    }))

    expect(readQualityMrbDispositionRecord()).toBeNull()
    expect(localStorage.getItem('aimes_quality_mrb_disposition')).toBeNull()
  })

  it('removes MRB disposition with incomplete action evidence', () => {
    localStorage.setItem('aimes_quality_mrb_disposition', JSON.stringify(record({
      actions: [{
        module: '质量',
        owner: '质量经理',
        action: '隔离 4 件装配间隙超差品并完成 MRB 判废',
        dueAt: '今日 11:30',
        evidence: '',
      }],
    })))

    expect(readQualityMrbDispositionRecord()).toBeNull()
    expect(localStorage.getItem('aimes_quality_mrb_disposition')).toBeNull()
  })
})
