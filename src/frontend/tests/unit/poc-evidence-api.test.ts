import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  getLatestCustomerOrderImport,
  getLatestPocHypercareAcceptance,
  getLatestPocPilotRun,
  getLatestPocReviewSignoff,
  getLatestPocRolloutPackage,
  upsertCustomerOrderImport,
  upsertPocHypercareAcceptance,
  upsertPocPilotRun,
  upsertPocReviewSignoff,
  upsertPocRolloutPackage,
} from '../../src/api/pocEvidence'

const httpGet = vi.hoisted(() => vi.fn())
const httpPost = vi.hoisted(() => vi.fn())

vi.mock('../../src/api/http', () => ({
  default: {
    get: httpGet,
    post: httpPost,
  },
}))

describe('poc evidence api contract', () => {
  beforeEach(() => {
    httpGet.mockReset()
    httpPost.mockReset()
  })

  it('uses backend contract paths for customer import and POC package writes', async () => {
    const item = { id: 'record-001', status: 'Ready' }
    httpGet.mockResolvedValue({ data: item })
    httpPost.mockResolvedValue({ data: item })

    await getLatestCustomerOrderImport()
    await upsertCustomerOrderImport(item as never)
    await getLatestPocReviewSignoff()
    await upsertPocReviewSignoff(item as never)
    await getLatestPocRolloutPackage()
    await upsertPocRolloutPackage(item as never)
    await getLatestPocPilotRun()
    await upsertPocPilotRun(item as never)
    await getLatestPocHypercareAcceptance()
    await upsertPocHypercareAcceptance(item as never)

    expect(httpGet.mock.calls.map(call => call[0])).toEqual([
      '/scheduling/customer-order-import/latest',
      '/scheduling/poc-review-signoff/latest',
      '/scheduling/poc-rollout-package/latest',
      '/scheduling/poc-pilot-run/latest',
      '/scheduling/poc-hypercare-acceptance/latest',
    ])
    expect(httpGet.mock.calls.every(call => call[1]?.suppressErrorToast === true)).toBe(true)
    expect(httpPost.mock.calls).toEqual([
      ['/scheduling/customer-order-import', item],
      ['/scheduling/poc-review-signoff', item],
      ['/scheduling/poc-rollout-package', item],
      ['/scheduling/poc-pilot-run', item],
      ['/scheduling/poc-hypercare-acceptance', item],
    ])
  })

  it('returns null for optional latest POC reads but fails loud for hypercare when requested', async () => {
    const backendError = new Error('hypercare backend unavailable')
    httpGet.mockRejectedValue(backendError)

    await expect(getLatestPocReviewSignoff()).resolves.toBeNull()
    await expect(getLatestPocRolloutPackage()).resolves.toBeNull()
    await expect(getLatestPocPilotRun()).resolves.toBeNull()
    await expect(getLatestPocHypercareAcceptance()).resolves.toBeNull()
    await expect(getLatestPocHypercareAcceptance({ failLoud: true })).rejects.toThrow('hypercare backend unavailable')
  })

  it('treats missing latest customer import as an empty optional state without toast noise', async () => {
    httpGet.mockRejectedValueOnce({ response: { status: 404 } })

    await expect(getLatestCustomerOrderImport({ failLoud: true })).resolves.toBeNull()
    expect(httpGet).toHaveBeenCalledWith(
      '/scheduling/customer-order-import/latest',
      expect.objectContaining({ suppressErrorToast: true }),
    )
  })

  it('treats missing latest hypercare acceptance as an empty state even in fail-loud reads', async () => {
    httpGet.mockRejectedValue({ response: { status: 404 } })

    await expect(getLatestPocHypercareAcceptance({ failLoud: true })).resolves.toBeNull()
  })
})
