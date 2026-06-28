import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  getLatestOtdKpiCommitment,
  queryOtdKpiCommitments,
  upsertOtdKpiCommitment,
} from '../../src/api/otdKpiCommitmentEvidence'

const httpGet = vi.hoisted(() => vi.fn())
const httpPost = vi.hoisted(() => vi.fn())

vi.mock('../../src/api/http', () => ({
  default: {
    get: httpGet,
    post: httpPost,
  },
}))

describe('otd kpi commitment evidence api contract', () => {
  beforeEach(() => {
    httpGet.mockReset()
    httpPost.mockReset()
  })

  it('uses backend contract paths for OTD KPI commitment reads and writes', async () => {
    const item = {
      id: 'otd-kpi-commitment-customer-huadong',
      sourceKpiId: 'customer-huadong',
      traceId: 'TRACE-KPI-COMMITMENT-HUADONG-20260521',
    }
    httpGet.mockResolvedValueOnce({ data: [item] })
    httpGet.mockResolvedValueOnce({ data: item })
    httpPost.mockResolvedValueOnce({ data: item })

    await expect(queryOtdKpiCommitments(5)).resolves.toEqual([item])
    await expect(getLatestOtdKpiCommitment()).resolves.toBe(item)
    await expect(upsertOtdKpiCommitment(item as never)).resolves.toBe(item)

    expect(httpGet.mock.calls).toEqual([
      ['/scheduling/otd-kpi-commitments', { params: { take: 5 } }],
      ['/scheduling/otd-kpi-commitments/latest'],
    ])
    expect(httpPost).toHaveBeenCalledWith('/scheduling/otd-kpi-commitments', item)
  })

  it('falls back to empty optional reads when OTD KPI commitment backend is unavailable', async () => {
    httpGet.mockRejectedValue(new Error('otd kpi commitment backend unavailable'))

    await expect(queryOtdKpiCommitments()).resolves.toEqual([])
    await expect(getLatestOtdKpiCommitment()).resolves.toBeNull()
  })

  it('fails loud for OTD KPI commitment reads when requested', async () => {
    httpGet.mockRejectedValueOnce(new Error('otd kpi commitment list backend unavailable'))
    httpGet.mockRejectedValueOnce(new Error('otd kpi commitment latest backend unavailable'))

    await expect(queryOtdKpiCommitments(8, { failLoud: true }))
      .rejects.toThrow('otd kpi commitment list backend unavailable')
    await expect(getLatestOtdKpiCommitment({ failLoud: true }))
      .rejects.toThrow('otd kpi commitment latest backend unavailable')
  })
})
