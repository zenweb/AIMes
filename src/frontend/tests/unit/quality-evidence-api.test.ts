import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  getLatestQualityMrbDisposition,
  getLatestQualityReworkImpact,
  upsertQualityMrbDisposition,
  upsertQualityReworkImpact,
} from '../../src/api/qualityEvidence'

const httpGet = vi.hoisted(() => vi.fn())
const httpPost = vi.hoisted(() => vi.fn())

vi.mock('../../src/api/http', () => ({
  default: {
    get: httpGet,
    post: httpPost,
  },
}))

describe('quality evidence api contract', () => {
  beforeEach(() => {
    httpGet.mockReset()
    httpPost.mockReset()
  })

  it('uses backend contract paths for quality rework and MRB evidence reads and writes', async () => {
    const item = { id: 'quality-evidence-001', traceId: 'TRACE-QA-001' }
    httpGet.mockResolvedValue({ data: item })
    httpPost.mockResolvedValue({ data: item })

    await getLatestQualityReworkImpact()
    await upsertQualityReworkImpact(item as never)
    await getLatestQualityMrbDisposition()
    await upsertQualityMrbDisposition(item as never)

    expect(httpGet.mock.calls).toEqual([
      ['/scheduling/quality-rework-impact/latest', { suppressErrorToast: true }],
      ['/scheduling/quality-mrb-disposition/latest', { suppressErrorToast: true }],
    ])
    expect(httpPost.mock.calls).toEqual([
      ['/scheduling/quality-rework-impact', item],
      ['/scheduling/quality-mrb-disposition', item],
    ])
  })

  it('returns null when optional quality evidence latest reads fail', async () => {
    httpGet.mockRejectedValue(new Error('quality evidence backend unavailable'))

    await expect(getLatestQualityReworkImpact()).resolves.toBeNull()
    await expect(getLatestQualityMrbDisposition()).resolves.toBeNull()
  })

  it('fails loud for quality rework latest reads when requested', async () => {
    httpGet.mockRejectedValueOnce(new Error('quality rework backend unavailable'))

    await expect(getLatestQualityReworkImpact({ failLoud: true }))
      .rejects.toThrow('quality rework backend unavailable')
  })

  it('fails loud for quality MRB latest reads when requested', async () => {
    httpGet.mockRejectedValueOnce(new Error('quality mrb backend unavailable'))

    await expect(getLatestQualityMrbDisposition({ failLoud: true }))
      .rejects.toThrow('quality mrb backend unavailable')
  })

  it('treats missing optional quality latest reads as empty states even when fail loud is requested', async () => {
    httpGet.mockRejectedValue({ response: { status: 404 } })

    await expect(getLatestQualityReworkImpact({ failLoud: true })).resolves.toBeNull()
    await expect(getLatestQualityMrbDisposition({ failLoud: true })).resolves.toBeNull()
  })
})
