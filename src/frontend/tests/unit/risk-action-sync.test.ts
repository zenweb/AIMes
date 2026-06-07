import { beforeEach, describe, expect, it, vi } from 'vitest'
import { installMemoryLocalStorage } from './test-storage'
import {
  appendRiskActionTrace,
  readRiskActionTraces,
  readRiskActionTracesBackendFirst,
  type RiskActionTrace,
} from '../../src/utils/risk-action-sync'
import { readOtdEvidenceChainRecords } from '../../src/utils/otd-evidence-chain-sync'

const httpGet = vi.hoisted(() => vi.fn())
const httpPost = vi.hoisted(() => vi.fn())

vi.mock('../../src/api/http', () => ({
  default: {
    get: httpGet,
    post: httpPost,
  },
}))

function trace(overrides: Partial<RiskActionTrace> = {}): RiskActionTrace {
  return {
    id: 'RISK-001',
    title: '物料短缺处置',
    type: 'shortage',
    status: 'assigned',
    statusLabel: '已派工',
    owner: '计划员',
    workOrders: 'WO-001',
    deliveryImpact: 'TRACE-RISK-001',
    suggestion: '调拨替代料',
    trace: '短缺风险已派发现场处置',
    createdAt: '2026-05-31T08:00:00.000Z',
    ...overrides,
  }
}

describe('risk action sync', () => {
  beforeEach(() => {
    installMemoryLocalStorage()
    localStorage.clear()
    httpGet.mockReset()
    httpPost.mockReset()
  })

  it('stores the latest risk action trace, mirrors it into OTD evidence, and syncs backend best-effort', async () => {
    const record = trace()

    const next = appendRiskActionTrace(record)
    await vi.dynamicImportSettled()

    expect(next).toEqual([record])
    expect(readRiskActionTraces()).toEqual([record])
    expect(httpPost).toHaveBeenCalledWith('/scheduling/risk-action-traces', record)
    expect(readOtdEvidenceChainRecords()).toEqual([
      expect.objectContaining({
        id: 'risk-action-RISK-001',
        stage: '现场处置',
        title: '物料短缺处置',
        status: 'active',
        statusLabel: '已派工',
        traceId: 'TRACE-RISK-001',
      }),
    ])
  })

  it('deduplicates the same risk id and status while keeping status transitions', () => {
    appendRiskActionTrace(trace({ trace: '第一次派工' }))
    appendRiskActionTrace(trace({ trace: '第二次派工' }))
    appendRiskActionTrace(trace({ status: 'closed', statusLabel: '已关闭', trace: '闭环完成' }))

    expect(readRiskActionTraces()).toEqual([
      expect.objectContaining({ status: 'closed', trace: '闭环完成' }),
      expect.objectContaining({ status: 'assigned', trace: '第二次派工' }),
    ])
  })

  it('caps local risk action traces at 12 records to keep demo state bounded', () => {
    for (let index = 0; index < 13; index += 1) {
      appendRiskActionTrace(trace({ id: `RISK-${index}`, trace: `处置记录 ${index}` }))
    }

    const records = readRiskActionTraces()
    expect(records).toHaveLength(12)
    expect(records[0]?.id).toBe('RISK-12')
    expect(records.at(-1)?.id).toBe('RISK-1')
  })

  it('falls back to local traces when backend returns no records', async () => {
    const localTrace = trace()
    appendRiskActionTrace(localTrace)
    httpGet.mockResolvedValueOnce({ data: [] })

    await expect(readRiskActionTracesBackendFirst()).resolves.toEqual([localTrace])
    expect(httpGet).toHaveBeenCalledWith('/scheduling/risk-action-traces', { params: { take: 12 } })
  })

  it('removes corrupt trace JSON so risk boards do not render stale evidence', () => {
    localStorage.setItem('aimes_risk_action_traces', '{bad json')

    expect(readRiskActionTraces()).toEqual([])
    expect(localStorage.getItem('aimes_risk_action_traces')).toBeNull()
  })
})
