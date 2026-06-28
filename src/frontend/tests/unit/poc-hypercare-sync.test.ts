import { beforeEach, describe, expect, it, vi } from 'vitest'
import { installMemoryLocalStorage } from './test-storage'
import {
  readPocHypercareAcceptanceRecord,
  readPocHypercareAcceptanceRecordBackendFirst,
  writePocHypercareAcceptanceRecord,
  type PocHypercareAcceptanceRecord,
} from '../../src/utils/poc-hypercare-sync'
import type { PocPilotRunRecord } from '../../src/utils/poc-pilot-run-sync'
import { readOtdEvidenceChainRecords } from '../../src/utils/otd-evidence-chain-sync'

const getLatestPocHypercareAcceptance = vi.hoisted(() => vi.fn())
const upsertPocHypercareAcceptance = vi.hoisted(() => vi.fn(() => Promise.resolve()))
const httpGet = vi.hoisted(() => vi.fn())
const httpPost = vi.hoisted(() => vi.fn(() => Promise.resolve({ data: null })))

vi.mock('../../src/api/pocEvidence', () => ({
  getLatestPocHypercareAcceptance,
  upsertPocHypercareAcceptance,
}))

vi.mock('../../src/api/http', () => ({
  default: {
    get: httpGet,
    post: httpPost,
  },
}))

function pilotRun(overrides: Partial<PocPilotRunRecord> = {}): PocPilotRunRecord {
  return {
    id: 'poc-pilot-run-20260521',
    title: 'POC 首批真实工单试点运行确认',
    targetCustomer: '华东示范工厂',
    sourcePackageId: 'poc-rollout-package-20260521',
    sourceAuditId: 'AUD-POC-ROLLOUT-20260521',
    status: 'closed',
    statusLabel: '首批真实工单已跑通',
    runWindow: 'T+14 首批真实工单上线班次',
    batchId: 'PILOT-WO-BATCH-20260521-001',
    sampleSize: 30,
    otdTarget: '>= 96%',
    actualOtd: '97%',
    owner: '调度主管 / 生产班组长 / 交付经理',
    workOrders: [],
    checkpoints: [],
    acceptanceCriteria: ['OTD 实测 97%，高于上线门禁 >= 96%。'],
    auditId: 'AUD-POC-PILOT-RUN-20260521',
    traceId: 'TRACE-POC-PILOT-RUN-CLOSED-20260521',
    createdAt: '2026-05-31T08:00:00.000Z',
    summary: '首批 30 单真实工单已跑通。',
    ...overrides,
  }
}

function hypercare(overrides: Partial<PocHypercareAcceptanceRecord> = {}): PocHypercareAcceptanceRecord {
  const record = writePocHypercareAcceptanceRecord(pilotRun()) as PocHypercareAcceptanceRecord
  localStorage.removeItem('aimes_poc_hypercare_acceptance')
  localStorage.removeItem('aimes_otd_evidence_chain')
  return { ...record, ...overrides }
}

describe('poc hypercare sync', () => {
  beforeEach(() => {
    installMemoryLocalStorage()
    localStorage.clear()
    getLatestPocHypercareAcceptance.mockReset()
    upsertPocHypercareAcceptance.mockClear()
    httpGet.mockReset()
    httpPost.mockClear()
    vi.useRealTimers()
  })

  it('stores hypercare acceptance, mirrors OTD evidence, and syncs backend best-effort', async () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-05-31T08:00:00.000Z'))

    const record = writePocHypercareAcceptanceRecord(pilotRun())
    await vi.dynamicImportSettled()

    expect(readPocHypercareAcceptanceRecord()).toEqual(record)
    expect(upsertPocHypercareAcceptance).toHaveBeenCalledWith(record)
    expect(readOtdEvidenceChainRecords()).toEqual([
      expect.objectContaining({
        id: 'poc-hypercare-acceptance-20260521',
        stage: 'POC 上线验收',
        status: 'active',
        statusLabel: 'Hypercare 7 天稳定运行中',
        traceId: 'TRACE-POC-HYPERCARE-ACCEPTANCE-20260521',
      }),
    ])
  })

  it('falls back to local hypercare acceptance when backend returns no record', async () => {
    const localRecord = writePocHypercareAcceptanceRecord(pilotRun())
    getLatestPocHypercareAcceptance.mockResolvedValueOnce(null)

    await expect(readPocHypercareAcceptanceRecordBackendFirst()).resolves.toEqual(localRecord)
  })

  it('ignores incomplete backend hypercare acceptance so gates monitors and owners stay auditable', async () => {
    const localRecord = writePocHypercareAcceptanceRecord(pilotRun())
    getLatestPocHypercareAcceptance.mockResolvedValueOnce({
      id: 'poc-hypercare-acceptance-20260521',
      title: 'POC 正式上线验收与 Hypercare 稳定运行监控包',
      status: 'active',
      createdAt: '2099-01-01T00:00:00.000Z',
    })

    await expect(readPocHypercareAcceptanceRecordBackendFirst()).resolves.toEqual(localRecord)
  })

  it('throws hypercare backend failures when fail-loud evidence is required', async () => {
    const localRecord = writePocHypercareAcceptanceRecord(pilotRun())
    getLatestPocHypercareAcceptance.mockRejectedValueOnce(new Error('hypercare backend unavailable'))

    await expect(readPocHypercareAcceptanceRecordBackendFirst({ failLoud: true })).rejects.toThrow('hypercare backend unavailable')
    expect(readPocHypercareAcceptanceRecord()).toEqual(localRecord)
  })

  it('keeps local hypercare acceptance when backend latest returns a missing-record empty state', async () => {
    const localRecord = writePocHypercareAcceptanceRecord(pilotRun())
    getLatestPocHypercareAcceptance.mockResolvedValueOnce(null)

    await expect(readPocHypercareAcceptanceRecordBackendFirst({ failLoud: true })).resolves.toEqual(localRecord)
  })

  it('removes corrupt hypercare JSON so dashboards do not render stale acceptance', () => {
    localStorage.setItem('aimes_poc_hypercare_acceptance', '{bad json')

    expect(readPocHypercareAcceptanceRecord()).toBeNull()
    expect(localStorage.getItem('aimes_poc_hypercare_acceptance')).toBeNull()
  })

  it('removes incomplete hypercare acceptance that cannot explain the acceptance gate', () => {
    localStorage.setItem('aimes_poc_hypercare_acceptance', JSON.stringify({
      id: 'poc-hypercare-acceptance-20260521',
      title: 'POC 正式上线验收与 Hypercare 稳定运行监控包',
      status: 'active',
    }))

    expect(readPocHypercareAcceptanceRecord()).toBeNull()
    expect(localStorage.getItem('aimes_poc_hypercare_acceptance')).toBeNull()
  })

  it('removes hypercare acceptance with incomplete monitor or checkpoint evidence', () => {
    localStorage.setItem('aimes_poc_hypercare_acceptance', JSON.stringify(hypercare({
      monitors: [{ label: 'OTD 稳定性' } as PocHypercareAcceptanceRecord['monitors'][number]],
      checkpoints: [{ module: '治理审计' } as PocHypercareAcceptanceRecord['checkpoints'][number]],
    })))

    expect(readPocHypercareAcceptanceRecord()).toBeNull()
    expect(localStorage.getItem('aimes_poc_hypercare_acceptance')).toBeNull()
  })
})
