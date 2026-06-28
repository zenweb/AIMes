import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  getLatestQualityCapaClosure,
  queryBarcodeScanEvidence,
  queryLaborQualificationBlocks,
  queryLaborReassignments,
  upsertBarcodeScanEvidence,
  upsertLaborQualificationBlock,
  upsertLaborReassignment,
  upsertQualityCapaClosure,
} from '../../src/api/executionEvidence'

const httpGet = vi.hoisted(() => vi.fn())
const httpPost = vi.hoisted(() => vi.fn())

vi.mock('../../src/api/http', () => ({
  default: {
    get: httpGet,
    post: httpPost,
  },
}))

describe('execution evidence api contract', () => {
  beforeEach(() => {
    httpGet.mockReset()
    httpPost.mockReset()
  })

  it('uses backend contract paths for execution evidence reads and writes', async () => {
    const item = { id: 'execution-evidence-001', traceId: 'TRACE-EXEC-001' }
    httpGet.mockResolvedValue({ data: [item] })
    httpPost.mockResolvedValue({ data: item })

    await queryLaborReassignments(5)
    await upsertLaborReassignment(item as never)
    await queryLaborQualificationBlocks(6)
    await upsertLaborQualificationBlock(item as never)
    await queryBarcodeScanEvidence(7)
    await upsertBarcodeScanEvidence(item as never)
    await getLatestQualityCapaClosure()
    await upsertQualityCapaClosure(item as never)

    expect(httpGet.mock.calls).toEqual([
      ['/scheduling/labor-reassignments', { params: { take: 5 } }],
      ['/scheduling/labor-qualification-blocks', { params: { take: 6 } }],
      ['/scheduling/barcode-scan-evidence', { params: { take: 7 } }],
      ['/scheduling/quality-capa-closure/latest', { suppressErrorToast: true }],
    ])
    expect(httpPost.mock.calls).toEqual([
      ['/scheduling/labor-reassignments', item],
      ['/scheduling/labor-qualification-blocks', item],
      ['/scheduling/barcode-scan-evidence', item],
      ['/scheduling/quality-capa-closure', item],
    ])
  })

  it('falls back to empty or null reads when optional execution evidence endpoints fail', async () => {
    httpGet.mockRejectedValue(new Error('execution evidence backend unavailable'))

    await expect(queryLaborReassignments()).resolves.toEqual([])
    await expect(queryLaborQualificationBlocks()).resolves.toEqual([])
    await expect(queryBarcodeScanEvidence()).resolves.toEqual([])
    await expect(getLatestQualityCapaClosure()).resolves.toBeNull()
  })

  it('fails loud for labor evidence reads when audit refresh must not hide backend outages', async () => {
    const error = new Error('labor evidence backend unavailable')
    httpGet.mockRejectedValue(error)

    await expect(queryLaborReassignments(12, { failLoud: true })).rejects.toThrow(error)
    await expect(queryLaborQualificationBlocks(12, { failLoud: true })).rejects.toThrow(error)
  })
})
