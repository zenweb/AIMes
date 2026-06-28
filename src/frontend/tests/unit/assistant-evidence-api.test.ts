import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  queryAssistantActionAudits,
  queryAssistantAnomalyPackages,
  queryAssistantEngineeringConstraintPackages,
  queryAssistantRecoveryPackages,
  upsertAssistantActionAudit,
  upsertAssistantAnomalyPackage,
  upsertAssistantEngineeringConstraintPackage,
  upsertAssistantRecoveryPackage,
} from '../../src/api/assistantEvidence'

const httpGet = vi.hoisted(() => vi.fn())
const httpPost = vi.hoisted(() => vi.fn())

vi.mock('../../src/api/http', () => ({
  default: {
    get: httpGet,
    post: httpPost,
  },
}))

describe('assistant evidence api contract', () => {
  beforeEach(() => {
    httpGet.mockReset()
    httpPost.mockReset()
  })

  it('uses backend contract paths for assistant audit and package reads and writes', async () => {
    const item = { id: 'assistant-evidence-001', traceId: 'TRACE-AI-001' }
    httpGet.mockResolvedValue({ data: [item] })
    httpPost.mockResolvedValue({ data: item })

    await queryAssistantActionAudits(9)
    await upsertAssistantActionAudit(item as never)
    await queryAssistantRecoveryPackages(7)
    await upsertAssistantRecoveryPackage(item as never)
    await queryAssistantAnomalyPackages(6)
    await upsertAssistantAnomalyPackage(item as never)
    await queryAssistantEngineeringConstraintPackages(5)
    await upsertAssistantEngineeringConstraintPackage(item as never)

    expect(httpGet.mock.calls).toEqual([
      ['/scheduling/assistant-action-audits', { params: { take: 9 } }],
      ['/scheduling/assistant-recovery-packages', { params: { take: 7 } }],
      ['/scheduling/assistant-anomaly-packages', { params: { take: 6 } }],
      ['/scheduling/assistant-engineering-constraint-packages', { params: { take: 5 } }],
    ])
    expect(httpPost.mock.calls).toEqual([
      ['/scheduling/assistant-action-audits', item],
      ['/scheduling/assistant-recovery-packages', item],
      ['/scheduling/assistant-anomaly-packages', item],
      ['/scheduling/assistant-engineering-constraint-packages', item],
    ])
  })

  it('falls back for optional assistant reads and fails loud for audit replay when requested', async () => {
    const backendError = new Error('assistant audit backend unavailable')
    httpGet.mockRejectedValue(backendError)

    await expect(queryAssistantActionAudits()).resolves.toEqual([])
    await expect(queryAssistantRecoveryPackages()).resolves.toEqual([])
    await expect(queryAssistantAnomalyPackages()).resolves.toEqual([])
    await expect(queryAssistantEngineeringConstraintPackages()).resolves.toEqual([])
    await expect(queryAssistantActionAudits(12, { failLoud: true })).rejects.toThrow('assistant audit backend unavailable')
  })

  it('fails loud for assistant recovery package reads when requested', async () => {
    httpGet.mockRejectedValueOnce(new Error('assistant recovery backend unavailable'))

    await expect(queryAssistantRecoveryPackages(8, { failLoud: true }))
      .rejects.toThrow('assistant recovery backend unavailable')
  })

  it('fails loud for assistant anomaly package reads when requested', async () => {
    httpGet.mockRejectedValueOnce(new Error('assistant anomaly backend unavailable'))

    await expect(queryAssistantAnomalyPackages(8, { failLoud: true }))
      .rejects.toThrow('assistant anomaly backend unavailable')
  })

  it('fails loud for assistant engineering constraint package reads when requested', async () => {
    httpGet.mockRejectedValueOnce(new Error('assistant engineering backend unavailable'))

    await expect(queryAssistantEngineeringConstraintPackages(8, { failLoud: true }))
      .rejects.toThrow('assistant engineering backend unavailable')
  })
})
