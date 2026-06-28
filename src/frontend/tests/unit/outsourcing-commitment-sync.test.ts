import { beforeEach, describe, expect, it, vi } from 'vitest'
import { installMemoryLocalStorage } from './test-storage'
import {
  confirmOutsourcingCommitmentArrival,
  confirmOutsourcingScheduleRelease,
  readLatestOutsourcingCommitmentPackage,
  readLatestOutsourcingCommitmentPackageBackendFirst,
  readOutsourcingCommitmentPackages,
  readOutsourcingCommitmentPackagesBackendFirst,
  writeOutsourcingCommitmentPackage,
} from '../../src/utils/outsourcing-commitment-sync'
import { readOtdEvidenceChainRecords } from '../../src/utils/otd-evidence-chain-sync'

const httpGet = vi.hoisted(() => vi.fn())
const httpPost = vi.hoisted(() => vi.fn())

vi.mock('../../src/api/http', () => ({
  default: {
    get: httpGet,
    post: httpPost,
  },
}))

function writeCommitment(overrides: Partial<Parameters<typeof writeOutsourcingCommitmentPackage>[0]> = {}) {
  return writeOutsourcingCommitmentPackage({
    sourceKpiId: 'product-flange',
    dimensionLabel: '产品',
    targetName: '法兰盘组件',
    baselineOtd: 26.67,
    agentOtd: 30,
    lift: 3.33,
    delayedReduced: 2,
    statusLabel: '外协承诺待到货',
    driver: 'DEMO-OTD-30-202605 样本',
    nextActions: ['锁定外协窗口', '复核外协到货后排产释放'],
    sourceTraceId: 'TRACE-KPI-PRODUCT-FLANGE-20260521',
    actor: 'admin',
    partnerName: '苏南热处理外协',
    promiseDate: '2026-05-31 18:00',
    affectedOrders: 'WO-DEMO-1007 / WO-RUSH-9001',
    ...overrides,
  })
}

describe('outsourcing commitment sync', () => {
  beforeEach(() => {
    installMemoryLocalStorage()
    localStorage.clear()
    httpGet.mockReset()
    httpPost.mockReset()
    vi.useRealTimers()
  })

  it('stores outsourcing commitments, mirrors OTD evidence, and syncs backend best-effort', async () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-05-31T08:00:00.000Z'))

    const record = writeCommitment()
    await vi.dynamicImportSettled()

    expect(readOutsourcingCommitmentPackages()).toEqual([record])
    expect(readLatestOutsourcingCommitmentPackage()).toEqual(record)
    expect(record).toEqual(expect.objectContaining({
      id: 'outsourcing-commitment-product-flange',
      auditId: 'AUD-OUTSOURCING-COMMITMENT-FLANGE-20260521-001',
      traceId: 'TRACE-OUTSOURCING-FLANGE-20260521',
      sourceTraceId: 'TRACE-KPI-PRODUCT-FLANGE-20260521',
      createdAt: '2026-05-31T08:00:00.000Z',
    }))
    expect(httpPost).toHaveBeenCalledWith('/scheduling/outsourcing-commitments', record)
    expect(readOtdEvidenceChainRecords()).toEqual([
      expect.objectContaining({
        id: 'outsourcing-commitment-product-flange',
        stage: '外协承诺',
        status: 'active',
        statusLabel: '外协承诺待到货',
        traceId: 'TRACE-OUTSOURCING-FLANGE-20260521',
        sourceTraceId: 'TRACE-KPI-PRODUCT-FLANGE-20260521',
      }),
    ])
  })

  it('confirms outsourcing arrival and schedule release with closed OTD evidence', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-05-31T09:00:00.000Z'))
    const record = writeCommitment()

    const arrived = confirmOutsourcingCommitmentArrival(record.sourceKpiId, '采购 王工')
    const released = confirmOutsourcingScheduleRelease(record.sourceKpiId, '调度员 李工')

    expect(arrived).toEqual(expect.objectContaining({
      statusLabel: '外协到货已确认',
      receivedBy: '采购 王工',
      receiptTraceId: 'TRACE-OUTSOURCING-FLANGE-RECEIVED-20260521',
    }))
    expect(released).toEqual(expect.objectContaining({
      statusLabel: '排产释放已确认',
      scheduleReleasedBy: '调度员 李工',
      scheduleReleaseTraceId: 'TRACE-OUTSOURCING-FLANGE-SCHEDULE-RELEASE-20260521',
    }))
    expect(readOtdEvidenceChainRecords()).toEqual(expect.arrayContaining([
      expect.objectContaining({
        id: 'outsourcing-receipt-product-flange',
        stage: '外协到货',
        status: 'closed',
        statusLabel: '外协到货已确认',
      }),
      expect.objectContaining({
        id: 'outsourcing-schedule-release-product-flange',
        stage: '外协排产释放',
        status: 'closed',
        statusLabel: '排产释放已确认',
      }),
    ]))
  })

  it('falls back to local outsourcing commitments when backend returns no records', async () => {
    const localRecord = writeCommitment()
    httpGet.mockResolvedValueOnce({ data: [] })

    await expect(readOutsourcingCommitmentPackagesBackendFirst()).resolves.toEqual([localRecord])
    expect(httpGet).toHaveBeenCalledWith('/scheduling/outsourcing-commitments', { params: { take: 8 } })
  })

  it('ignores incomplete backend outsourcing commitments so partner promise and release actions stay auditable', async () => {
    const localRecord = writeCommitment()
    httpGet.mockResolvedValueOnce({
      data: [
        {
          id: 'outsourcing-commitment-product-flange',
          sourceKpiId: 'product-flange',
          traceId: 'TRACE-OUTSOURCING-PARTIAL',
          partnerName: '苏南热处理外协',
        },
      ],
    })

    await expect(readOutsourcingCommitmentPackagesBackendFirst()).resolves.toEqual([localRecord])
  })

  it('fails loud when outsourcing commitments backend returns a non-array payload', async () => {
    httpGet.mockResolvedValueOnce({ data: { items: [] } })

    await expect(readOutsourcingCommitmentPackagesBackendFirst({ failLoud: true }))
      .rejects.toThrow('后端返回非数组外协承诺审计载荷')
  })

  it('fails loud for outsourcing commitment refresh when requested', async () => {
    httpGet.mockRejectedValueOnce(new Error('outsourcing commitment backend unavailable'))

    await expect(readOutsourcingCommitmentPackagesBackendFirst({ failLoud: true }))
      .rejects.toThrow('outsourcing commitment backend unavailable')
  })

  it('falls back to the latest local outsourcing commitment when backend latest is empty', async () => {
    const localRecord = writeCommitment()
    httpGet.mockResolvedValueOnce({ data: null })

    await expect(readLatestOutsourcingCommitmentPackageBackendFirst()).resolves.toEqual(localRecord)
    expect(httpGet).toHaveBeenCalledWith('/scheduling/outsourcing-commitments/latest')
  })

  it('ignores incomplete backend latest outsourcing commitment so customer-facing release evidence stays complete', async () => {
    const localRecord = writeCommitment()
    httpGet.mockResolvedValueOnce({
      data: {
        id: 'outsourcing-commitment-product-flange',
        sourceKpiId: 'product-flange',
        traceId: 'TRACE-OUTSOURCING-PARTIAL',
        partnerName: '苏南热处理外协',
      },
    })

    await expect(readLatestOutsourcingCommitmentPackageBackendFirst()).resolves.toEqual(localRecord)
  })

  it('fails loud for latest outsourcing commitment refresh when requested', async () => {
    httpGet.mockRejectedValueOnce(new Error('latest outsourcing backend unavailable'))

    await expect(readLatestOutsourcingCommitmentPackageBackendFirst({ failLoud: true }))
      .rejects.toThrow('latest outsourcing backend unavailable')
  })

  it('caps local outsourcing commitments at 8 records', () => {
    for (let index = 0; index < 9; index += 1) {
      writeCommitment({
        sourceKpiId: `outsourcing-${index}`,
        targetName: `外协件 ${index}`,
        sourceTraceId: `TRACE-OUTSOURCING-KPI-${index}`,
      })
    }

    const records = readOutsourcingCommitmentPackages()
    expect(records).toHaveLength(8)
    expect(records[0]?.sourceKpiId).toBe('outsourcing-8')
    expect(records.at(-1)?.sourceKpiId).toBe('outsourcing-1')
  })

  it('removes corrupt outsourcing commitment JSON so boards do not render stale promises', () => {
    localStorage.setItem('aimes_outsourcing_commitment_packages', '{bad json')

    expect(readOutsourcingCommitmentPackages()).toEqual([])
    expect(localStorage.getItem('aimes_outsourcing_commitment_packages')).toBeNull()
  })

  it('removes incomplete outsourcing commitments that cannot explain partner promise or affected orders', () => {
    localStorage.setItem('aimes_outsourcing_commitment_packages', JSON.stringify([
      {
        id: 'outsourcing-commitment-product-flange',
        sourceKpiId: 'product-flange',
        targetName: '法兰盘组件',
        auditId: 'AUD-OUTSOURCING-COMMITMENT-FLANGE-20260521-001',
        traceId: 'TRACE-OUTSOURCING-FLANGE-20260521',
        partnerName: '苏南热处理外协',
        promiseDate: '2026-05-31 18:00',
        affectedOrders: 'WO-DEMO-1007',
        sourceTraceId: 'TRACE-KPI-PRODUCT-FLANGE-20260521',
        actions: [],
      },
    ]))

    expect(readOutsourcingCommitmentPackages()).toEqual([])
    expect(localStorage.getItem('aimes_outsourcing_commitment_packages')).toBeNull()
  })
})
