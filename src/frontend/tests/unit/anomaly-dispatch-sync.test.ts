import { beforeEach, describe, expect, it, vi } from 'vitest'
import { installMemoryLocalStorage } from './test-storage'
import {
  readAnomalyDispatchRecordByType,
  readAnomalyDispatchRecordByTypeBackendFirst,
  readAnomalyDispatchRecords,
  readAnomalyDispatchRecordsBackendFirst,
  type AnomalyDispatchRecord,
  writeAnomalyDispatchRecord,
} from '../../src/utils/anomaly-dispatch-sync'
import { readOtdEvidenceChainRecords } from '../../src/utils/otd-evidence-chain-sync'

const httpGet = vi.hoisted(() => vi.fn())
const httpPost = vi.hoisted(() => vi.fn())

vi.mock('../../src/api/http', () => ({
  default: {
    get: httpGet,
    post: httpPost,
  },
}))

function dispatch(overrides: Partial<AnomalyDispatchRecord> = {}): AnomalyDispatchRecord {
  return {
    id: 'anomaly-dispatch-AN-001',
    anomalyId: 'AN-001',
    type: 'equipment',
    typeLabel: '设备异常',
    title: 'CNC-001 主轴温升异常',
    workOrderNumber: 'WO-2026-0042',
    operationCode: 'OP-20',
    route: 'CNC 精加工',
    owner: '设备主管',
    dueAt: '今日 10:30',
    affectedOrders: 'WO-2026-0042 / WO-RUSH-9001',
    deliveryImpact: '预计影响 2 单交付',
    scheduleWindow: '夜班维护窗口 22:00-02:00',
    suggestedAction: '分流到 CNC-003 并锁定维护窗口。',
    auditId: 'AUD-ANOMALY-DISPATCH-001',
    traceId: 'TRACE-ANOMALY-DISPATCH-001',
    status: 'routed',
    statusLabel: '已分流',
    createdAt: '2026-05-31T08:00:00.000Z',
    summary: '设备异常已分流给设备主管，并同步排产保护窗口。',
    ...overrides,
  }
}

describe('anomaly dispatch sync', () => {
  beforeEach(() => {
    installMemoryLocalStorage()
    localStorage.clear()
    httpGet.mockReset()
    httpPost.mockReset()
  })

  it('writes a dispatch record, mirrors it into OTD evidence, and syncs backend best-effort', async () => {
    const record = dispatch()

    const written = writeAnomalyDispatchRecord(record)
    await vi.dynamicImportSettled()

    expect(written).toEqual(record)
    expect(readAnomalyDispatchRecords()).toEqual([record])
    expect(readAnomalyDispatchRecordByType('equipment')).toEqual(record)
    expect(httpPost).toHaveBeenCalledWith('/scheduling/anomaly-dispatch-records', record)
    expect(readOtdEvidenceChainRecords()).toEqual([
      expect.objectContaining({
        id: 'anomaly-dispatch-AN-001',
        stage: '异常分流',
        object: 'WO-2026-0042 / WO-RUSH-9001',
        traceId: 'TRACE-ANOMALY-DISPATCH-001',
        status: 'active',
        statusLabel: '已分流',
      }),
    ])
  })

  it('falls back to local dispatch records when backend returns no records', async () => {
    const localRecord = dispatch()
    writeAnomalyDispatchRecord(localRecord)
    httpGet.mockResolvedValueOnce({ data: [] })

    await expect(readAnomalyDispatchRecordsBackendFirst()).resolves.toEqual([localRecord])
    await expect(readAnomalyDispatchRecordByTypeBackendFirst('equipment')).resolves.toEqual(localRecord)
    expect(httpGet).toHaveBeenCalledWith('/scheduling/anomaly-dispatch-records', { params: { take: 12 } })
  })

  it('ignores incomplete backend dispatch records so owner action and affected orders stay auditable', async () => {
    const localRecord = dispatch()
    writeAnomalyDispatchRecord(localRecord)
    httpGet.mockResolvedValueOnce({
      data: [
        {
          id: 'anomaly-dispatch-AN-001',
          anomalyId: 'AN-001',
          type: 'equipment',
          title: 'CNC-001 主轴温升异常',
          traceId: 'TRACE-ANOMALY-DISPATCH-001',
          createdAt: '2026-06-01T08:00:00.000Z',
        },
      ],
    })

    await expect(readAnomalyDispatchRecordsBackendFirst()).resolves.toEqual([localRecord])
    await expect(readAnomalyDispatchRecordByTypeBackendFirst('equipment')).resolves.toEqual(localRecord)
  })

  it('fails loud when anomaly dispatch backend returns a non-array payload', async () => {
    httpGet.mockResolvedValueOnce({ data: { items: [] } })

    await expect(readAnomalyDispatchRecordsBackendFirst({ failLoud: true }))
      .rejects.toThrow('后端返回非数组异常分流审计载荷')
  })

  it('fails loud for anomaly dispatch refresh when requested', async () => {
    httpGet.mockRejectedValueOnce(new Error('anomaly dispatch backend unavailable'))

    await expect(readAnomalyDispatchRecordsBackendFirst({ failLoud: true }))
      .rejects.toThrow('anomaly dispatch backend unavailable')
  })

  it('keeps only the latest dispatch for the same id and caps local records at 12', () => {
    writeAnomalyDispatchRecord(dispatch({ id: 'same-id', anomalyId: 'AN-001', summary: '旧分流' }))
    writeAnomalyDispatchRecord(dispatch({ id: 'same-id', anomalyId: 'AN-001', summary: '新分流' }))
    for (let index = 2; index < 13; index += 1) {
      writeAnomalyDispatchRecord(dispatch({
        id: `anomaly-dispatch-AN-${index}`,
        anomalyId: `AN-${index}`,
        traceId: `TRACE-ANOMALY-DISPATCH-${index}`,
      }))
    }

    const records = readAnomalyDispatchRecords()
    expect(records).toHaveLength(12)
    expect(records.some(record => record.summary === '旧分流')).toBe(false)
    expect(records.some(record => record.summary === '新分流')).toBe(true)
  })

  it('removes corrupt dispatch JSON so anomaly boards do not render stale routing', () => {
    localStorage.setItem('aimes_anomaly_dispatch_records', '{bad json')

    expect(readAnomalyDispatchRecords()).toEqual([])
    expect(localStorage.getItem('aimes_anomaly_dispatch_records')).toBeNull()
  })

  it('removes incomplete dispatch records that cannot explain owner action or affected orders', () => {
    localStorage.setItem('aimes_anomaly_dispatch_records', JSON.stringify([
      {
        id: 'anomaly-dispatch-AN-001',
        anomalyId: 'AN-001',
        type: 'equipment',
        title: 'CNC-001 主轴温升异常',
        traceId: 'TRACE-ANOMALY-DISPATCH-001',
      },
    ]))

    expect(readAnomalyDispatchRecords()).toEqual([])
    expect(localStorage.getItem('aimes_anomaly_dispatch_records')).toBeNull()
  })
})
