import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  getLatestAlternateMaterialApproval,
  getLatestEngineeringChangeImpact,
  getLatestRouteCapabilityValidation,
  upsertAlternateMaterialApproval,
  upsertEngineeringChangeImpact,
  upsertRouteCapabilityValidation,
} from '../../src/api/engineeringEvidence'

const httpGet = vi.hoisted(() => vi.fn())
const httpPost = vi.hoisted(() => vi.fn())

vi.mock('../../src/api/http', () => ({
  default: {
    get: httpGet,
    post: httpPost,
  },
}))

describe('engineering evidence api contract', () => {
  beforeEach(() => {
    httpGet.mockReset()
    httpPost.mockReset()
  })

  it('uses backend contract paths for engineering evidence reads and writes', async () => {
    const item = { id: 'engineering-evidence-001', traceId: 'TRACE-ENG-001' }
    httpGet.mockResolvedValue({ data: item })
    httpPost.mockResolvedValue({ data: item })

    await expect(getLatestAlternateMaterialApproval()).resolves.toBe(item)
    await expect(upsertAlternateMaterialApproval(item as never)).resolves.toBe(item)
    await expect(getLatestEngineeringChangeImpact()).resolves.toBe(item)
    await expect(upsertEngineeringChangeImpact(item as never)).resolves.toBe(item)
    await expect(getLatestRouteCapabilityValidation()).resolves.toBe(item)
    await expect(upsertRouteCapabilityValidation(item as never)).resolves.toBe(item)

    expect(httpGet.mock.calls).toEqual([
      ['/scheduling/alternate-material-approval/latest', { suppressErrorToast: true }],
      ['/scheduling/engineering-change-impact/latest', { suppressErrorToast: true }],
      ['/scheduling/route-capability-validation/latest', { suppressErrorToast: true }],
    ])
    expect(httpPost.mock.calls).toEqual([
      ['/scheduling/alternate-material-approval', item],
      ['/scheduling/engineering-change-impact', item],
      ['/scheduling/route-capability-validation', item],
    ])
  })

  it('keeps optional engineering evidence reads quiet unless fail loud is requested', async () => {
    const backendError = new Error('engineering evidence backend unavailable')
    httpGet.mockRejectedValue(backendError)

    await expect(getLatestAlternateMaterialApproval()).resolves.toBeNull()
    await expect(getLatestEngineeringChangeImpact()).resolves.toBeNull()
    await expect(getLatestRouteCapabilityValidation()).resolves.toBeNull()

    await expect(getLatestAlternateMaterialApproval({ failLoud: true }))
      .rejects.toThrow('engineering evidence backend unavailable')
    await expect(getLatestEngineeringChangeImpact({ failLoud: true }))
      .rejects.toThrow('engineering evidence backend unavailable')
    await expect(getLatestRouteCapabilityValidation({ failLoud: true }))
      .rejects.toThrow('engineering evidence backend unavailable')
  })

  it('treats missing optional engineering evidence latest reads as empty states without toast noise', async () => {
    httpGet.mockRejectedValue({ response: { status: 404 } })

    await expect(getLatestAlternateMaterialApproval({ failLoud: true })).resolves.toBeNull()
    await expect(getLatestEngineeringChangeImpact({ failLoud: true })).resolves.toBeNull()
    await expect(getLatestRouteCapabilityValidation({ failLoud: true })).resolves.toBeNull()

    expect(httpGet.mock.calls.every(call => call[1]?.suppressErrorToast === true)).toBe(true)
  })
})
