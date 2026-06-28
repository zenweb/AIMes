import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  getLatestProductionAnomalyEvent,
  getLatestRiskSlaReview,
  queryAnomalyDispatchRecords,
  queryMonitoringSituationEscalations,
  queryRiskActionTraces,
  upsertAnomalyDispatchRecord,
  upsertMonitoringSituationEscalation,
  upsertProductionAnomalyEvent,
  upsertRiskActionTrace,
  upsertRiskSlaReview,
} from '../../src/api/riskEvidence'

const httpGet = vi.hoisted(() => vi.fn())
const httpPost = vi.hoisted(() => vi.fn())

vi.mock('../../src/api/http', () => ({
  default: {
    get: httpGet,
    post: httpPost,
  },
}))

describe('risk evidence api contract', () => {
  beforeEach(() => {
    httpGet.mockReset()
    httpPost.mockReset()
  })

  it('uses backend contract paths for risk and monitoring evidence reads and writes', async () => {
    const item = { id: 'risk-evidence-001', traceId: 'TRACE-RISK-001' }
    httpGet.mockResolvedValue({ data: [item] })
    httpPost.mockResolvedValue({ data: item })

    await getLatestProductionAnomalyEvent()
    await upsertProductionAnomalyEvent(item as never)
    await queryAnomalyDispatchRecords(6)
    await upsertAnomalyDispatchRecord(item as never)
    await queryMonitoringSituationEscalations(7)
    await upsertMonitoringSituationEscalation(item as never)
    await getLatestRiskSlaReview()
    await upsertRiskSlaReview(item as never)
    await queryRiskActionTraces(8)
    await upsertRiskActionTrace(item as never)

    expect(httpGet.mock.calls).toEqual([
      ['/scheduling/production-anomaly-event/latest', { suppressErrorToast: true }],
      ['/scheduling/anomaly-dispatch-records', { params: { take: 6 } }],
      ['/scheduling/monitoring-situation-escalations', { params: { take: 7 } }],
      ['/scheduling/risk-sla-review/latest', { suppressErrorToast: true }],
      ['/scheduling/risk-action-traces', { params: { take: 8 } }],
    ])
    expect(httpPost.mock.calls).toEqual([
      ['/scheduling/production-anomaly-event', item],
      ['/scheduling/anomaly-dispatch-records', item],
      ['/scheduling/monitoring-situation-escalations', item],
      ['/scheduling/risk-sla-review', item],
      ['/scheduling/risk-action-traces', item],
    ])
  })

  it('falls back for optional risk reads and fails loud for monitoring when requested', async () => {
    const backendError = new Error('monitoring escalation backend unavailable')
    httpGet.mockRejectedValue(backendError)

    await expect(getLatestProductionAnomalyEvent()).resolves.toBeNull()
    await expect(queryAnomalyDispatchRecords()).resolves.toEqual([])
    await expect(queryMonitoringSituationEscalations()).resolves.toEqual([])
    await expect(getLatestRiskSlaReview()).resolves.toBeNull()
    await expect(queryRiskActionTraces()).resolves.toEqual([])
    await expect(queryMonitoringSituationEscalations(8, { failLoud: true })).rejects.toThrow('monitoring escalation backend unavailable')
  })

  it('fails loud for risk SLA review latest reads when requested', async () => {
    httpGet.mockRejectedValueOnce(new Error('risk sla backend unavailable'))

    await expect(getLatestRiskSlaReview({ failLoud: true }))
      .rejects.toThrow('risk sla backend unavailable')
  })

  it('fails loud for production anomaly latest reads when requested', async () => {
    httpGet.mockRejectedValueOnce(new Error('production anomaly backend unavailable'))

    await expect(getLatestProductionAnomalyEvent({ failLoud: true }))
      .rejects.toThrow('production anomaly backend unavailable')
  })

  it('fails loud for anomaly dispatch reads when requested', async () => {
    httpGet.mockRejectedValueOnce(new Error('anomaly dispatch backend unavailable'))

    await expect(queryAnomalyDispatchRecords(12, { failLoud: true }))
      .rejects.toThrow('anomaly dispatch backend unavailable')
  })

  it('fails loud for risk action trace reads when requested', async () => {
    httpGet.mockRejectedValueOnce(new Error('risk action trace backend unavailable'))

    await expect(queryRiskActionTraces(12, { failLoud: true }))
      .rejects.toThrow('risk action trace backend unavailable')
  })
})
