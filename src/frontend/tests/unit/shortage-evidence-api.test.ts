import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  getLatestBomKittingPackage,
  getLatestShortageKitting,
  getLatestShortageRiskResolution,
  getLatestSupplierNetworkDecision,
  getLatestSupplyRiskEscalation,
  upsertBomKittingPackage,
  upsertShortageKitting,
  upsertShortageRiskResolution,
  upsertSupplierNetworkDecision,
  upsertSupplyRiskEscalation,
} from '../../src/api/shortageEvidence'

const httpGet = vi.hoisted(() => vi.fn())
const httpPost = vi.hoisted(() => vi.fn())

vi.mock('../../src/api/http', () => ({
  default: {
    get: httpGet,
    post: httpPost,
  },
}))

describe('shortage evidence api contract', () => {
  beforeEach(() => {
    httpGet.mockReset()
    httpPost.mockReset()
  })

  it('uses backend contract paths for shortage and supply evidence reads and writes', async () => {
    const item = { id: 'shortage-evidence-001', traceId: 'TRACE-SHORTAGE-001' }
    httpGet.mockResolvedValue({ data: item })
    httpPost.mockResolvedValue({ data: item })

    await getLatestShortageKitting()
    await upsertShortageKitting(item as never)
    await getLatestShortageRiskResolution()
    await upsertShortageRiskResolution(item as never)
    await getLatestBomKittingPackage()
    await upsertBomKittingPackage(item as never)
    await getLatestSupplyRiskEscalation()
    await upsertSupplyRiskEscalation(item as never)
    await getLatestSupplierNetworkDecision()
    await upsertSupplierNetworkDecision(item as never)

    expect(httpGet.mock.calls).toEqual([
      ['/scheduling/shortage-kitting/latest', { suppressErrorToast: true }],
      ['/scheduling/shortage-risk-resolution/latest', { suppressErrorToast: true }],
      ['/scheduling/bom-kitting-package/latest', { suppressErrorToast: true }],
      ['/scheduling/supply-risk-escalation/latest', { suppressErrorToast: true }],
      ['/scheduling/supplier-network-decision/latest', { suppressErrorToast: true }],
    ])
    expect(httpPost.mock.calls).toEqual([
      ['/scheduling/shortage-kitting', item],
      ['/scheduling/shortage-risk-resolution', item],
      ['/scheduling/bom-kitting-package', item],
      ['/scheduling/supply-risk-escalation', item],
      ['/scheduling/supplier-network-decision', item],
    ])
  })

  it('falls back to null for optional latest reads so stale shortage evidence is not presented as live backend proof', async () => {
    httpGet.mockRejectedValue(new Error('shortage evidence backend unavailable'))

    await expect(getLatestShortageKitting()).resolves.toBeNull()
    await expect(getLatestShortageRiskResolution()).resolves.toBeNull()
    await expect(getLatestBomKittingPackage()).resolves.toBeNull()
    await expect(getLatestSupplyRiskEscalation()).resolves.toBeNull()
    await expect(getLatestSupplierNetworkDecision()).resolves.toBeNull()
  })

  it('treats missing optional shortage latest reads as empty states without toast noise', async () => {
    httpGet.mockRejectedValue({ response: { status: 404 } })

    await expect(getLatestShortageKitting({ failLoud: true })).resolves.toBeNull()
    await expect(getLatestShortageRiskResolution({ failLoud: true })).resolves.toBeNull()
    await expect(getLatestBomKittingPackage({ failLoud: true })).resolves.toBeNull()
    await expect(getLatestSupplyRiskEscalation({ failLoud: true })).resolves.toBeNull()
    await expect(getLatestSupplierNetworkDecision({ failLoud: true })).resolves.toBeNull()

    expect(httpGet.mock.calls.every(call => call[1]?.suppressErrorToast === true)).toBe(true)
  })

  it('fails loud for shortage and supply latest reads when requested', async () => {
    httpGet
      .mockRejectedValueOnce(new Error('shortage kitting backend unavailable'))
      .mockRejectedValueOnce(new Error('shortage resolution backend unavailable'))
      .mockRejectedValueOnce(new Error('bom kitting backend unavailable'))
      .mockRejectedValueOnce(new Error('supply risk backend unavailable'))
      .mockRejectedValueOnce(new Error('supplier network backend unavailable'))

    await expect(getLatestShortageKitting({ failLoud: true }))
      .rejects.toThrow('shortage kitting backend unavailable')
    await expect(getLatestShortageRiskResolution({ failLoud: true }))
      .rejects.toThrow('shortage resolution backend unavailable')
    await expect(getLatestBomKittingPackage({ failLoud: true }))
      .rejects.toThrow('bom kitting backend unavailable')
    await expect(getLatestSupplyRiskEscalation({ failLoud: true }))
      .rejects.toThrow('supply risk backend unavailable')
    await expect(getLatestSupplierNetworkDecision({ failLoud: true }))
      .rejects.toThrow('supplier network backend unavailable')
  })
})
