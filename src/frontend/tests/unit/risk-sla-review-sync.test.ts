import { beforeEach, describe, expect, it, vi } from 'vitest'
import { installMemoryLocalStorage } from './test-storage'
import {
  closeRiskSlaReviewRecord,
  readRiskSlaReviewRecord,
  readRiskSlaReviewRecordBackendFirst,
  writeRiskSlaReviewRecord,
} from '../../src/utils/risk-sla-review-sync'
import { readOtdEvidenceChainRecords } from '../../src/utils/otd-evidence-chain-sync'

const httpGet = vi.hoisted(() => vi.fn())
const httpPost = vi.hoisted(() => vi.fn())

vi.mock('../../src/api/http', () => ({
  default: {
    get: httpGet,
    post: httpPost,
  },
}))

const inputRisk = {
  id: 'risk-shortage-al6061',
  type: '缺料',
  title: 'AL-6061 今日短缺',
  level: 'critical' as const,
  owner: '采购主管',
  dueAt: '立即',
  workOrders: 'WO-2026-0042 / WO-RUSH-9001',
  deliveryImpact: '预计影响 2 单',
  status: 'active',
  statusLabel: '待升级',
  suggestion: '确认替代料和加急到货承诺。',
}

describe('risk SLA review sync', () => {
  beforeEach(() => {
    installMemoryLocalStorage()
    localStorage.clear()
    httpGet.mockReset()
    httpPost.mockReset()
  })

  it('writes a review package, mirrors active OTD evidence, and syncs backend best-effort', async () => {
    const record = writeRiskSlaReviewRecord({ risks: [inputRisk] })
    await vi.dynamicImportSettled()

    expect(readRiskSlaReviewRecord()).toEqual(record)
    expect(record).toEqual(expect.objectContaining({
      status: 'escalated',
      overdueCount: 1,
      criticalCount: 1,
    }))
    expect(record.risks).toContainEqual(expect.objectContaining({
      id: 'risk-shortage-al6061',
      slaStatus: 'overdue',
      requiredAction: '确认替代料和加急到货承诺。',
    }))
    expect(httpPost).toHaveBeenCalledWith('/scheduling/risk-sla-review', record)
    expect(readOtdEvidenceChainRecords()).toEqual([
      expect.objectContaining({
        id: 'risk-sla-review-20260521',
        stage: '风险 SLA 复核',
        status: 'active',
        statusLabel: '已升级晨会复核',
        traceId: 'TRACE-RISK-SLA-DAILY-REVIEW-20260521',
      }),
    ])
  })

  it('falls back to the local review package when backend returns no record', async () => {
    const localRecord = writeRiskSlaReviewRecord({ risks: [inputRisk] })
    httpGet.mockResolvedValueOnce({ data: null })

    await expect(readRiskSlaReviewRecordBackendFirst()).resolves.toEqual(localRecord)
    expect(httpGet).toHaveBeenCalledWith('/scheduling/risk-sla-review/latest')
  })

  it('closes the review package, records action results, and mirrors closed OTD evidence', async () => {
    writeRiskSlaReviewRecord({ risks: [inputRisk] })

    const closed = closeRiskSlaReviewRecord('生产经理')
    await vi.dynamicImportSettled()

    expect(closed).toEqual(expect.objectContaining({
      status: 'closed',
      statusLabel: '晨会责任动作已闭环',
      closureTraceId: 'TRACE-RISK-SLA-DAILY-REVIEW-CLOSED-20260521',
    }))
    expect(closed?.actions.every(action => typeof action.result === 'string' && action.result.length > 0)).toBe(true)
    expect(readRiskSlaReviewRecord()).toEqual(closed)
    expect(readOtdEvidenceChainRecords()[0]).toEqual(expect.objectContaining({
      id: 'risk-sla-review-20260521',
      status: 'closed',
      statusLabel: '晨会责任动作已闭环',
      traceId: 'TRACE-RISK-SLA-DAILY-REVIEW-CLOSED-20260521',
    }))
    expect(httpPost).toHaveBeenCalledWith('/scheduling/risk-sla-review', closed)
  })

  it('removes corrupt review JSON so risk boards do not render stale escalation state', () => {
    localStorage.setItem('aimes_risk_sla_review', '{bad json')

    expect(readRiskSlaReviewRecord()).toBeNull()
    expect(localStorage.getItem('aimes_risk_sla_review')).toBeNull()
  })

  it('removes incomplete review records that cannot explain the affected orders', () => {
    localStorage.setItem('aimes_risk_sla_review', JSON.stringify({
      id: 'risk-sla-review-20260521',
      title: '风险 SLA 逾期晨会复核包',
      status: 'escalated',
      statusLabel: '已升级晨会复核',
    }))

    expect(readRiskSlaReviewRecord()).toBeNull()
    expect(localStorage.getItem('aimes_risk_sla_review')).toBeNull()
  })
})
