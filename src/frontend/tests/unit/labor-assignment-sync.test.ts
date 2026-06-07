import { beforeEach, describe, expect, it, vi } from 'vitest'
import { installMemoryLocalStorage } from './test-storage'
import {
  createDefaultLaborQualificationBlock,
  createDefaultLaborReassignment,
  readLaborQualificationBlock,
  readLaborQualificationBlocks,
  readLaborQualificationBlocksBackendFirst,
  readLaborReassignment,
  readLaborReassignmentForOperation,
  readLaborReassignments,
  readLaborReassignmentsBackendFirst,
  releaseLaborQualificationBlock,
  writeLaborQualificationBlock,
  writeLaborQualificationBlockReview,
  writeLaborReassignment,
  writeLaborReassignmentExecutionEvidence,
} from '../../src/utils/labor-assignment-sync'
import { readOtdEvidenceChainRecords } from '../../src/utils/otd-evidence-chain-sync'

const httpGet = vi.hoisted(() => vi.fn())
const httpPost = vi.hoisted(() => vi.fn())

vi.mock('../../src/api/http', () => ({
  default: {
    get: httpGet,
    post: httpPost,
  },
}))

describe('labor assignment sync', () => {
  beforeEach(() => {
    installMemoryLocalStorage()
    localStorage.clear()
    httpGet.mockReset()
    httpPost.mockReset()
  })

  it('writes a qualification block, mirrors active OTD evidence, and syncs backend best-effort', () => {
    const block = createDefaultLaborQualificationBlock('2026-05-31T08:00:00.000Z')

    const written = writeLaborQualificationBlock(block)

    expect(written).toEqual(block)
    expect(readLaborQualificationBlock()).toEqual(block)
    expect(readLaborQualificationBlocks()).toEqual([block])
    expect(httpPost).toHaveBeenCalledWith('/scheduling/labor-qualification-blocks', block)
    expect(readOtdEvidenceChainRecords()).toEqual([
      expect.objectContaining({
        id: `labor-qualification-block-${block.id}`,
        stage: '人员阻断',
        object: 'WO-013',
        traceId: 'TRACE-LABOR-BLOCK-WO-013-OP-10',
        status: 'active',
        statusLabel: '停工复核',
      }),
    ])
  })

  it('writes a reassignment, clears matching blocks, and mirrors closed OTD evidence', () => {
    const block = createDefaultLaborQualificationBlock('2026-05-31T08:00:00.000Z')
    const reassignment = createDefaultLaborReassignment('2026-05-31T09:00:00.000Z')
    writeLaborQualificationBlock(block)

    const written = writeLaborReassignment(reassignment)

    expect(written).toEqual(reassignment)
    expect(readLaborQualificationBlock()).toBeNull()
    expect(readLaborReassignment()).toEqual(reassignment)
    expect(readLaborReassignmentForOperation('WO-013', 'OP-20', '回火')).toEqual(reassignment)
    expect(httpPost).toHaveBeenCalledWith('/scheduling/labor-reassignments', reassignment)
    expect(readOtdEvidenceChainRecords()[0]).toEqual(expect.objectContaining({
      id: `labor-reassignment-${reassignment.id}`,
      stage: '人员替班',
      status: 'closed',
      statusLabel: '已替班',
      traceId: 'TRACE-LABOR-REASSIGN-WO-013-OP-10',
    }))
  })

  it('reviews and releases a qualification block with reassignment evidence', () => {
    const block = writeLaborQualificationBlock(createDefaultLaborQualificationBlock('2026-05-31T08:00:00.000Z'))
    const reviewed = writeLaborQualificationBlockReview(block)
    const reassignment = createDefaultLaborReassignment('2026-05-31T10:00:00.000Z')

    const released = releaseLaborQualificationBlock(reviewed, reassignment, '补证通过后重新放行。')
    writeLaborReassignmentExecutionEvidence(reassignment, {
      operationCode: 'OP-10',
      operationName: '淬火',
      stationId: 'ST-HEAT-01',
      equipmentId: 'FURNACE-01',
      reportedBy: 'operator-01',
    })

    expect(released.block).toEqual(expect.objectContaining({
      status: 'released',
      releaseAuditId: 'AUD-LABOR-REASSIGN-20260520-001',
      releaseTraceId: 'TRACE-LABOR-REASSIGN-WO-013-OP-10',
      releaseReason: '补证通过后重新放行。',
    }))
    expect(released.reassignment).toEqual(reassignment)
    expect(readLaborQualificationBlock()).toBeNull()
    expect(readOtdEvidenceChainRecords()).toEqual(expect.arrayContaining([
      expect.objectContaining({ id: `labor-qualification-review-${block.id}`, status: 'active' }),
      expect.objectContaining({ id: `labor-qualification-release-${block.id}`, status: 'closed' }),
      expect.objectContaining({ id: 'labor-reassignment-start-WO-013-OP-10', status: 'closed' }),
    ]))
  })

  it('falls back to local labor records when backend returns no records', async () => {
    const block = writeLaborQualificationBlock(createDefaultLaborQualificationBlock('2026-05-31T08:00:00.000Z'))
    const reassignment = writeLaborReassignment(createDefaultLaborReassignment('2026-05-31T09:00:00.000Z'))
    httpGet.mockResolvedValue({ data: [] })

    await expect(readLaborReassignmentsBackendFirst()).resolves.toEqual([reassignment])
    await expect(readLaborQualificationBlocksBackendFirst()).resolves.toEqual([])
    expect(readLaborQualificationBlocks()).toEqual([])
    expect(httpGet).toHaveBeenCalledWith('/scheduling/labor-reassignments', { params: { take: 12 } })
    expect(httpGet).toHaveBeenCalledWith('/scheduling/labor-qualification-blocks', { params: { take: 12 } })
    expect(block.id).toBe('labor-qualification-block-WO-013-heat-treatment')
  })

  it('removes corrupt labor JSON so production boards do not render stale assignment state', () => {
    localStorage.setItem('aimes_labor_reassignment', '{bad json')
    localStorage.setItem('aimes_labor_qualification_block', '{bad json')

    expect(readLaborReassignments()).toEqual([])
    expect(readLaborQualificationBlocks()).toEqual([])
    expect(localStorage.getItem('aimes_labor_reassignment')).toBeNull()
    expect(localStorage.getItem('aimes_labor_qualification_block')).toBeNull()
  })

  it('removes incomplete labor records that cannot explain qualification risk or replacement owner', () => {
    localStorage.setItem('aimes_labor_reassignment', JSON.stringify([
      {
        id: 'labor-reassignment-WO-013-heat-treatment',
        workOrderNumber: 'WO-013',
        operationCode: 'OP-10',
        status: 'approved',
      },
    ]))
    localStorage.setItem('aimes_labor_qualification_block', JSON.stringify([
      {
        id: 'labor-qualification-block-WO-013-heat-treatment',
        workOrderNumber: 'WO-013',
        operationCode: 'OP-10',
        status: 'active',
      },
    ]))

    expect(readLaborReassignments()).toEqual([])
    expect(readLaborQualificationBlocks()).toEqual([])
    expect(localStorage.getItem('aimes_labor_reassignment')).toBeNull()
    expect(localStorage.getItem('aimes_labor_qualification_block')).toBeNull()
  })
})
