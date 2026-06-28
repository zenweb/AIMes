import { beforeEach, describe, expect, it, vi } from 'vitest'
import { installMemoryLocalStorage } from './test-storage'
import {
  readPocPilotRunRecord,
  readPocPilotRunRecordBackendFirst,
  writePocPilotRunRecord,
  type PocPilotRunRecord,
} from '../../src/utils/poc-pilot-run-sync'
import type { PocRolloutPackageRecord } from '../../src/utils/poc-rollout-package-sync'
import { readOtdEvidenceChainRecords } from '../../src/utils/otd-evidence-chain-sync'

const getLatestPocPilotRun = vi.hoisted(() => vi.fn())
const upsertPocPilotRun = vi.hoisted(() => vi.fn(() => Promise.resolve()))
const httpGet = vi.hoisted(() => vi.fn())
const httpPost = vi.hoisted(() => vi.fn(() => Promise.resolve({ data: null })))

vi.mock('../../src/api/pocEvidence', () => ({
  getLatestPocPilotRun,
  upsertPocPilotRun,
}))

vi.mock('../../src/api/http', () => ({
  default: {
    get: httpGet,
    post: httpPost,
  },
}))

function rollout(overrides: Partial<PocRolloutPackageRecord> = {}): PocRolloutPackageRecord {
  return {
    id: 'poc-rollout-package-20260521',
    title: 'POC 成功转上线交付行动包',
    targetCustomer: '华东示范工厂',
    sourceMeetingId: 'POC-REVIEW-20260521',
    sourceAuditId: 'AUD-POC-SIGNOFF-20260521',
    status: 'ready',
    statusLabel: '待客户交付启动会确认',
    rolloutWindow: 'T+7 天完成试点上线准备，T+14 天进入首批真实工单运行',
    goLiveGate: 'POC 评分通过、客户工单/设备样例齐套、OTD 证据链可审计',
    owner: '交付经理 / 客户厂长 / IT 负责人',
    successCriteria: ['首批真实工单 >= 30 单'],
    actions: [],
    auditId: 'AUD-POC-ROLLOUT-20260521',
    traceId: 'TRACE-POC-ROLLOUT-DELIVERY-PACKAGE-20260521',
    createdAt: '2026-05-31T08:00:00.000Z',
    summary: '上线准备完成。',
    ...overrides,
  }
}

function pilotRunRecord(overrides: Partial<PocPilotRunRecord> = {}): PocPilotRunRecord {
  const record = writePocPilotRunRecord(rollout()) as PocPilotRunRecord
  localStorage.removeItem('aimes_poc_pilot_run')
  localStorage.removeItem('aimes_otd_evidence_chain')
  return { ...record, ...overrides }
}

describe('poc pilot run sync', () => {
  beforeEach(() => {
    installMemoryLocalStorage()
    localStorage.clear()
    getLatestPocPilotRun.mockReset()
    upsertPocPilotRun.mockClear()
    httpGet.mockReset()
    httpPost.mockClear()
    vi.useRealTimers()
  })

  it('stores pilot run evidence, mirrors OTD evidence, and syncs backend best-effort', async () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-05-31T08:00:00.000Z'))

    const record = writePocPilotRunRecord(rollout())
    await vi.dynamicImportSettled()

    expect(readPocPilotRunRecord()).toEqual(record)
    expect(upsertPocPilotRun).toHaveBeenCalledWith(record)
    expect(readOtdEvidenceChainRecords()).toEqual([
      expect.objectContaining({
        id: 'poc-pilot-run-20260521',
        stage: 'POC 试点运行',
        status: 'closed',
        statusLabel: '首批真实工单已跑通',
        traceId: 'TRACE-POC-PILOT-RUN-CLOSED-20260521',
      }),
    ])
  })

  it('falls back to local pilot run evidence when backend returns no record', async () => {
    const localRecord = writePocPilotRunRecord(rollout())
    getLatestPocPilotRun.mockResolvedValueOnce(null)

    await expect(readPocPilotRunRecordBackendFirst()).resolves.toEqual(localRecord)
  })

  it('ignores incomplete backend pilot runs so work orders and checkpoints stay auditable', async () => {
    const localRecord = writePocPilotRunRecord(rollout())
    getLatestPocPilotRun.mockResolvedValueOnce({
      id: 'poc-pilot-run-20260521',
      title: 'POC 首批真实工单试点运行确认',
      status: 'closed',
      createdAt: '2099-01-01T00:00:00.000Z',
    })

    await expect(readPocPilotRunRecordBackendFirst()).resolves.toEqual(localRecord)
  })

  it('removes corrupt pilot run JSON so boards do not render stale trial state', () => {
    localStorage.setItem('aimes_poc_pilot_run', '{bad json')

    expect(readPocPilotRunRecord()).toBeNull()
    expect(localStorage.getItem('aimes_poc_pilot_run')).toBeNull()
  })

  it('removes incomplete pilot run records that cannot explain run evidence', () => {
    localStorage.setItem('aimes_poc_pilot_run', JSON.stringify({
      id: 'poc-pilot-run-20260521',
      title: 'POC 首批真实工单试点运行确认',
      status: 'closed',
    }))

    expect(readPocPilotRunRecord()).toBeNull()
    expect(localStorage.getItem('aimes_poc_pilot_run')).toBeNull()
  })

  it('removes pilot runs with incomplete work order or checkpoint evidence', () => {
    localStorage.setItem('aimes_poc_pilot_run', JSON.stringify(pilotRunRecord({
      workOrders: [{ workOrderNumber: 'WO-PILOT-2101' } as PocPilotRunRecord['workOrders'][number]],
      checkpoints: [{ module: '治理审计' } as PocPilotRunRecord['checkpoints'][number]],
    })))

    expect(readPocPilotRunRecord()).toBeNull()
    expect(localStorage.getItem('aimes_poc_pilot_run')).toBeNull()
  })
})
