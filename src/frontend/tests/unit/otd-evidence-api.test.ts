import { beforeEach, describe, expect, it, vi } from 'vitest'
import { getOtdEvidenceChain, upsertOtdEvidence } from '../../src/api/otdEvidence'

const httpGet = vi.hoisted(() => vi.fn())
const httpPost = vi.hoisted(() => vi.fn())

vi.mock('../../src/api/http', () => ({
  default: {
    get: httpGet,
    post: httpPost,
  },
}))

describe('otd evidence api contract', () => {
  beforeEach(() => {
    httpGet.mockReset()
    httpPost.mockReset()
  })

  it('uses backend contract path and take param for OTD evidence reads and writes', async () => {
    const item = {
      id: 'otd-evidence-001',
      stage: '质量知识',
      title: '质量推荐灰度决策进入 OTD 复盘',
      summary: '灰度决策和回滚证据已进入 OTD 复盘。',
      object: 'QK-TRAIN-20260521-R3',
      source: '质量知识治理',
      traceId: 'TRACE-OTD-QK-001',
      status: 'closed',
      statusLabel: '已关闭',
      createdAt: '2026-06-14T03:25:00.000Z',
    }
    httpGet.mockResolvedValueOnce({ data: [item] })
    httpPost.mockResolvedValueOnce({ data: item })

    await expect(getOtdEvidenceChain(11)).resolves.toEqual([item])
    await expect(upsertOtdEvidence(item as never)).resolves.toBe(item)

    expect(httpGet).toHaveBeenCalledWith('/scheduling/otd-evidence', {
      params: { take: 11 },
    })
    expect(httpPost).toHaveBeenCalledWith('/scheduling/otd-evidence', item)
  })

  it('propagates backend read failures so the sync layer owns local fallback decisions', async () => {
    httpGet.mockRejectedValueOnce(new Error('otd evidence backend unavailable'))

    await expect(getOtdEvidenceChain()).rejects.toThrow('otd evidence backend unavailable')
  })
})
