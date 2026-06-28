import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  getLatestOutsourcingCommitment,
  queryOutsourcingCommitments,
  upsertOutsourcingCommitment,
} from '../../src/api/outsourcingEvidence'

const httpGet = vi.hoisted(() => vi.fn())
const httpPost = vi.hoisted(() => vi.fn())

vi.mock('../../src/api/http', () => ({
  default: {
    get: httpGet,
    post: httpPost,
  },
}))

describe('outsourcing evidence api contract', () => {
  beforeEach(() => {
    httpGet.mockReset()
    httpPost.mockReset()
  })

  it('uses backend contract paths for outsourcing commitment reads and writes', async () => {
    const item = {
      id: 'outsourcing-commitment-product-flange',
      sourceKpiId: 'product-flange',
      traceId: 'TRACE-OUTSOURCING-FLANGE-20260521',
    }
    httpGet.mockResolvedValueOnce({ data: [item] })
    httpGet.mockResolvedValueOnce({ data: item })
    httpPost.mockResolvedValueOnce({ data: item })

    await expect(queryOutsourcingCommitments(5)).resolves.toEqual([item])
    await expect(getLatestOutsourcingCommitment()).resolves.toBe(item)
    await expect(upsertOutsourcingCommitment(item as never)).resolves.toBe(item)

    expect(httpGet.mock.calls).toEqual([
      ['/scheduling/outsourcing-commitments', { params: { take: 5 } }],
      ['/scheduling/outsourcing-commitments/latest'],
    ])
    expect(httpPost).toHaveBeenCalledWith('/scheduling/outsourcing-commitments', item)
  })

  it('falls back to empty optional reads when outsourcing evidence backend is unavailable', async () => {
    httpGet.mockRejectedValue(new Error('outsourcing evidence backend unavailable'))

    await expect(queryOutsourcingCommitments()).resolves.toEqual([])
    await expect(getLatestOutsourcingCommitment()).resolves.toBeNull()
  })

  it('fails loud for outsourcing commitment reads when requested', async () => {
    httpGet.mockRejectedValueOnce(new Error('outsourcing list backend unavailable'))
    httpGet.mockRejectedValueOnce(new Error('outsourcing latest backend unavailable'))

    await expect(queryOutsourcingCommitments(8, { failLoud: true }))
      .rejects.toThrow('outsourcing list backend unavailable')
    await expect(getLatestOutsourcingCommitment({ failLoud: true }))
      .rejects.toThrow('outsourcing latest backend unavailable')
  })
})
