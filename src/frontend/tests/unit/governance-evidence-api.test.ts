import { beforeEach, describe, expect, it, vi } from 'vitest'
import { queryAgentConfigApprovals, upsertAgentConfigApproval } from '../../src/api/governanceEvidence'

const httpGet = vi.hoisted(() => vi.fn())
const httpPost = vi.hoisted(() => vi.fn())

vi.mock('../../src/api/http', () => ({
  default: {
    get: httpGet,
    post: httpPost,
  },
}))

describe('governance evidence api contract', () => {
  beforeEach(() => {
    httpGet.mockReset()
    httpPost.mockReset()
  })

  it('uses backend contract paths for agent config approval reads and writes', async () => {
    const item = { id: 'cfg-approval-001', status: 'approved' }
    httpGet.mockResolvedValueOnce({ data: [item] })
    httpPost.mockResolvedValueOnce({ data: item })

    await expect(queryAgentConfigApprovals(5)).resolves.toEqual([item])
    await expect(upsertAgentConfigApproval(item as never)).resolves.toBe(item)

    expect(httpGet).toHaveBeenCalledWith('/scheduling/agent-config-approvals', {
      params: { take: 5 },
    })
    expect(httpPost).toHaveBeenCalledWith('/scheduling/agent-config-approvals', item)
  })

  it('falls back to an empty approval list by default but fails loud when requested', async () => {
    const backendError = new Error('approval backend unavailable')
    httpGet.mockRejectedValue(backendError)

    await expect(queryAgentConfigApprovals()).resolves.toEqual([])
    await expect(queryAgentConfigApprovals(12, { failLoud: true })).rejects.toThrow('approval backend unavailable')
  })
})
