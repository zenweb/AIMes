import { beforeEach, describe, expect, it, vi } from 'vitest'
import { installMemoryLocalStorage } from './test-storage'
import {
  readLatestOtdKpiCommitmentPackage,
  readLatestOtdKpiCommitmentPackageBackendFirst,
  readOtdKpiCommitmentPackages,
  readOtdKpiCommitmentPackagesBackendFirst,
  writeOtdKpiCommitmentPackage,
} from '../../src/utils/otd-kpi-commitment-sync'
import { readOtdEvidenceChainRecords } from '../../src/utils/otd-evidence-chain-sync'

const httpGet = vi.hoisted(() => vi.fn())
const httpPost = vi.hoisted(() => vi.fn())

vi.mock('../../src/api/http', () => ({
  default: {
    get: httpGet,
    post: httpPost,
  },
}))

function writeCommitment(overrides: Partial<Parameters<typeof writeOtdKpiCommitmentPackage>[0]> = {}) {
  return writeOtdKpiCommitmentPackage({
    sourceKpiId: 'customer-huadong',
    dimensionLabel: '客户',
    targetName: '华东客户群',
    baselineOtd: 26.67,
    agentOtd: 30,
    lift: 3.33,
    delayedReduced: 4,
    statusLabel: '延期风险待确认',
    driver: 'DEMO-OTD-30-202605 样本',
    nextActions: ['输出客户承诺', '复核急单插单窗口', '确认替代料与质量首件'],
    sourceTraceId: 'TRACE-KPI-CUSTOMER-HUADONG-20260521',
    actor: 'admin',
    ...overrides,
  })
}

describe('otd kpi commitment sync', () => {
  beforeEach(() => {
    installMemoryLocalStorage()
    localStorage.clear()
    httpGet.mockReset()
    httpPost.mockReset()
    vi.useRealTimers()
  })

  it('stores customer commitment packages, mirrors OTD evidence, and syncs backend best-effort', async () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-05-31T08:00:00.000Z'))

    const record = writeCommitment()
    await vi.dynamicImportSettled()

    expect(readOtdKpiCommitmentPackages()).toEqual([record])
    expect(readLatestOtdKpiCommitmentPackage()).toEqual(record)
    expect(record).toEqual(expect.objectContaining({
      id: 'otd-kpi-commitment-customer-huadong',
      auditId: 'AUD-KPI-COMMITMENT-HUADONG-20260521-001',
      traceId: 'TRACE-KPI-COMMITMENT-HUADONG-20260521',
      statusLabel: '带外部约束承诺',
      createdAt: '2026-05-31T08:00:00.000Z',
    }))
    expect(httpPost).toHaveBeenCalledWith('/scheduling/otd-kpi-commitments', record)
    expect(readOtdEvidenceChainRecords()).toEqual([
      expect.objectContaining({
        id: 'otd-kpi-commitment-customer-huadong',
        stage: '客户承诺包',
        status: 'active',
        statusLabel: '带外部约束承诺',
        traceId: 'TRACE-KPI-COMMITMENT-HUADONG-20260521',
      }),
    ])
  })

  it('falls back to local commitment packages when backend returns no records', async () => {
    const localRecord = writeCommitment()
    httpGet.mockResolvedValueOnce({ data: [] })

    await expect(readOtdKpiCommitmentPackagesBackendFirst()).resolves.toEqual([localRecord])
    expect(httpGet).toHaveBeenCalledWith('/scheduling/otd-kpi-commitments', { params: { take: 8 } })
  })

  it('ignores incomplete backend commitment packages so OTD lift and owner actions stay auditable', async () => {
    const localRecord = writeCommitment()
    httpGet.mockResolvedValueOnce({
      data: [
        {
          id: 'otd-kpi-commitment-customer-huadong',
          sourceKpiId: 'customer-huadong',
          traceId: 'TRACE-KPI-COMMITMENT-PARTIAL',
        },
      ],
    })

    await expect(readOtdKpiCommitmentPackagesBackendFirst()).resolves.toEqual([localRecord])
  })

  it('fails loud when OTD KPI commitment backend returns a non-array payload', async () => {
    httpGet.mockResolvedValueOnce({ data: { items: [] } })

    await expect(readOtdKpiCommitmentPackagesBackendFirst({ failLoud: true }))
      .rejects.toThrow('后端返回非数组 OTD KPI 承诺审计载荷')
  })

  it('fails loud for OTD KPI commitment refresh when requested', async () => {
    httpGet.mockRejectedValueOnce(new Error('otd kpi commitment backend unavailable'))

    await expect(readOtdKpiCommitmentPackagesBackendFirst({ failLoud: true }))
      .rejects.toThrow('otd kpi commitment backend unavailable')
  })

  it('falls back to the latest local commitment when backend latest is empty', async () => {
    const localRecord = writeCommitment()
    httpGet.mockResolvedValueOnce({ data: null })

    await expect(readLatestOtdKpiCommitmentPackageBackendFirst()).resolves.toEqual(localRecord)
    expect(httpGet).toHaveBeenCalledWith('/scheduling/otd-kpi-commitments/latest')
  })

  it('ignores incomplete backend latest commitment so customer promise evidence stays complete', async () => {
    const localRecord = writeCommitment()
    httpGet.mockResolvedValueOnce({
      data: {
        id: 'otd-kpi-commitment-customer-huadong',
        sourceKpiId: 'customer-huadong',
        traceId: 'TRACE-KPI-COMMITMENT-PARTIAL',
      },
    })

    await expect(readLatestOtdKpiCommitmentPackageBackendFirst()).resolves.toEqual(localRecord)
  })

  it('fails loud for latest OTD KPI commitment refresh when requested', async () => {
    httpGet.mockRejectedValueOnce(new Error('latest otd kpi commitment backend unavailable'))

    await expect(readLatestOtdKpiCommitmentPackageBackendFirst({ failLoud: true }))
      .rejects.toThrow('latest otd kpi commitment backend unavailable')
  })

  it('caps local commitment packages at 8 records', () => {
    for (let index = 0; index < 9; index += 1) {
      writeCommitment({
        sourceKpiId: `customer-${index}`,
        targetName: `客户 ${index}`,
        sourceTraceId: `TRACE-KPI-${index}`,
      })
    }

    const records = readOtdKpiCommitmentPackages()
    expect(records).toHaveLength(8)
    expect(records[0]?.sourceKpiId).toBe('customer-8')
    expect(records.at(-1)?.sourceKpiId).toBe('customer-1')
  })

  it('removes corrupt commitment JSON so report boards do not render stale promises', () => {
    localStorage.setItem('aimes_otd_kpi_commitment_packages', '{bad json')

    expect(readOtdKpiCommitmentPackages()).toEqual([])
    expect(localStorage.getItem('aimes_otd_kpi_commitment_packages')).toBeNull()
  })

  it('removes incomplete commitment packages that cannot explain OTD lift or owner actions', () => {
    localStorage.setItem('aimes_otd_kpi_commitment_packages', JSON.stringify([
      {
        id: 'otd-kpi-commitment-customer-huadong',
        sourceKpiId: 'customer-huadong',
        targetName: '华东客户群',
        auditId: 'AUD-KPI-COMMITMENT-HUADONG-20260521-001',
        traceId: 'TRACE-KPI-COMMITMENT-HUADONG-20260521',
        actions: [],
      },
    ]))

    expect(readOtdKpiCommitmentPackages()).toEqual([])
    expect(localStorage.getItem('aimes_otd_kpi_commitment_packages')).toBeNull()
  })
})
