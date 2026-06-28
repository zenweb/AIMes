import { beforeEach, describe, expect, it, vi } from 'vitest'
import { installMemoryLocalStorage } from './test-storage'
import {
  readQualityCapaClosure,
  readQualityCapaClosureBackendFirst,
  type QualityCapaClosure,
  writeQualityCapaClosure,
} from '../../src/utils/quality-capa-sync'
import { readOtdEvidenceChainRecords } from '../../src/utils/otd-evidence-chain-sync'

const getLatestQualityCapaClosure = vi.hoisted(() => vi.fn())
const upsertQualityCapaClosure = vi.hoisted(() => vi.fn(() => Promise.resolve()))
const upsertOtdEvidence = vi.hoisted(() => vi.fn(() => Promise.resolve()))

vi.mock('../../src/api/executionEvidence', () => ({
  getLatestQualityCapaClosure,
  upsertQualityCapaClosure,
}))

vi.mock('../../src/api/otdEvidence', () => ({
  upsertOtdEvidence,
}))

function closure(overrides: Partial<QualityCapaClosure> = {}): QualityCapaClosure {
  return {
    inspectionId: 'QI-001',
    workOrderId: 'WO-001',
    traceId: 'TRACE-QA-CAPA-001',
    rootCause: '夹具磨损导致尺寸偏移',
    evidenceStrength: 92,
    taskTitle: '复核夹具并完成首件验证',
    taskKind: 'fixture',
    owner: '质量工程师',
    dueAt: '2026-05-31T10:00:00.000Z',
    verification: '首件复检通过',
    verifiedAt: '2026-05-31T09:30:00.000Z',
    auditState: 'verified',
    otdImpact: '释放返工批次，恢复交付节拍',
    reviewAction: 'CAPA 已验证并关闭',
    ...overrides,
  }
}

describe('quality CAPA sync', () => {
  beforeEach(() => {
    installMemoryLocalStorage()
    localStorage.clear()
    getLatestQualityCapaClosure.mockReset()
    upsertQualityCapaClosure.mockClear()
    upsertOtdEvidence.mockClear()
  })

  it('persists the CAPA closure, mirrors it into OTD evidence, and syncs backend best-effort', async () => {
    const record = closure()

    writeQualityCapaClosure(record)
    await vi.dynamicImportSettled()

    expect(readQualityCapaClosure()).toEqual(record)
    expect(upsertQualityCapaClosure).toHaveBeenCalledWith(record)
    expect(readOtdEvidenceChainRecords()).toEqual([
      expect.objectContaining({
        id: 'quality-capa',
        stage: '质量回写',
        title: '复核夹具并完成首件验证',
        object: 'WO-001',
        traceId: 'TRACE-QA-CAPA-001',
        status: 'closed',
        statusLabel: '已验证',
        createdAt: '2026-05-31T09:30:00.000Z',
      }),
    ])
    expect(upsertOtdEvidence).toHaveBeenCalledWith(expect.objectContaining({
      id: 'quality-capa',
      traceId: 'TRACE-QA-CAPA-001',
    }))
  })

  it('falls back to the local CAPA closure when backend lookup fails', async () => {
    const localClosure = closure()
    writeQualityCapaClosure(localClosure)
    getLatestQualityCapaClosure.mockRejectedValueOnce(new Error('network'))

    await expect(readQualityCapaClosureBackendFirst()).resolves.toEqual(localClosure)
  })

  it('ignores incomplete backend CAPA closures so ownership and audit action stay auditable', async () => {
    const localClosure = closure()
    writeQualityCapaClosure(localClosure)
    getLatestQualityCapaClosure.mockResolvedValueOnce({
      inspectionId: 'QI-001',
      workOrderId: 'WO-001',
      traceId: 'TRACE-QA-CAPA-001',
      evidenceStrength: 92,
      verifiedAt: '2026-06-01T08:00:00.000Z',
    })

    await expect(readQualityCapaClosureBackendFirst()).resolves.toEqual(localClosure)
  })

  it('removes corrupt closure JSON so quality boards do not render stale evidence', () => {
    localStorage.setItem('aimes_quality_capa_closure', '{bad json')

    expect(readQualityCapaClosure()).toBeNull()
    expect(localStorage.getItem('aimes_quality_capa_closure')).toBeNull()
  })

  it('removes incomplete CAPA closures that cannot explain task ownership or audit state', () => {
    localStorage.setItem('aimes_quality_capa_closure', JSON.stringify({
      inspectionId: 'QI-001',
      evidenceStrength: 92,
    }))

    expect(readQualityCapaClosure()).toBeNull()
    expect(localStorage.getItem('aimes_quality_capa_closure')).toBeNull()
  })
})
