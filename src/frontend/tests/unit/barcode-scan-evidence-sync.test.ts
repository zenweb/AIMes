import { beforeEach, describe, expect, it, vi } from 'vitest'
import { installMemoryLocalStorage } from './test-storage'
import {
  createBarcodeScanEvidenceRecord,
  readBarcodeScanEvidenceRecords,
  readBarcodeScanEvidenceRecordsBackendFirst,
  type BarcodeScanEvidenceRecord,
  writeBarcodeScanEvidenceRecordAndReadBack,
  writeBarcodeScanEvidenceRecord,
} from '../../src/utils/barcode-scan-evidence-sync'
import { readOtdEvidenceChainRecords } from '../../src/utils/otd-evidence-chain-sync'

const httpGet = vi.hoisted(() => vi.fn())
const httpPost = vi.hoisted(() => vi.fn())

vi.mock('../../src/api/http', () => ({
  default: {
    get: httpGet,
    post: httpPost,
  },
}))

function scanRecord(overrides: Partial<BarcodeScanEvidenceRecord> = {}): BarcodeScanEvidenceRecord {
  return {
    id: 'barcode-scan-workorder-WO-2026-0042',
    code: 'WO-2026-0042',
    type: 'WorkOrder',
    title: 'WO-2026-0042 工单扫码到站已确认',
    action: '工单到站报工入口确认',
    actor: 'operator-01',
    object: 'WO-2026-0042',
    source: '条码扫描 / 现场工位',
    summary: '现场扫描 WO-2026-0042 流转卡并确认已到达报工入口。',
    traceId: 'TRACE-QR-WO-2026-0042-ARRIVAL',
    statusLabel: '到站已确认',
    createdAt: '2026-05-31T08:00:00.000Z',
    nextCheck: '生产报工开工校验',
    ...overrides,
  }
}

describe('barcode scan evidence sync', () => {
  beforeEach(() => {
    installMemoryLocalStorage()
    localStorage.clear()
    httpGet.mockReset()
    httpPost.mockReset()
  })

  it('creates traceable scan evidence records for work orders, equipment, and materials', () => {
    expect(createBarcodeScanEvidenceRecord({
      code: ' wo-2026-0042 ',
      type: 'WorkOrder',
      name: '急单齿轮轴',
      actor: 'operator-01',
      scannedAt: '2026-05-31T08:00:00.000Z',
    })).toEqual(expect.objectContaining({
      id: 'barcode-scan-workorder-WO-2026-0042',
      code: 'WO-2026-0042',
      type: 'WorkOrder',
      traceId: 'TRACE-QR-WO-2026-0042-ARRIVAL',
      nextCheck: '生产报工开工校验',
    }))
    expect(createBarcodeScanEvidenceRecord({
      code: 'cnc/001',
      type: 'Equipment',
      name: 'CNC 加工中心',
      actor: 'operator-01',
    })).toEqual(expect.objectContaining({
      id: 'barcode-scan-equipment-CNC-001',
      type: 'Equipment',
      traceId: 'TRACE-QR-CNC-001-CHECK',
    }))
    expect(createBarcodeScanEvidenceRecord({
      code: 'al-6061 batch 7',
      type: 'Material',
      name: '铝棒批次',
      actor: 'operator-01',
    })).toEqual(expect.objectContaining({
      id: 'barcode-scan-material-AL-6061-BATCH-7',
      type: 'Material',
      traceId: 'TRACE-QR-AL-6061-BATCH-7-KIT',
    }))
  })

  it('writes scan evidence, mirrors closed OTD evidence, and syncs backend best-effort', async () => {
    const record = scanRecord()

    const written = writeBarcodeScanEvidenceRecord(record)
    await vi.dynamicImportSettled()

    expect(written).toEqual(record)
    expect(readBarcodeScanEvidenceRecords()).toEqual([record])
    expect(httpPost).toHaveBeenCalledWith('/scheduling/barcode-scan-evidence', record)
    expect(readOtdEvidenceChainRecords()).toEqual([
      expect.objectContaining({
        id: 'barcode-barcode-scan-workorder-WO-2026-0042',
        stage: '扫码执行',
        object: 'WO-2026-0042',
        traceId: 'TRACE-QR-WO-2026-0042-ARRIVAL',
        status: 'closed',
        statusLabel: '到站已确认',
      }),
    ])
  })

  it('writes scan evidence then reads back the fresh backend record for release evidence', async () => {
    const record = scanRecord()
    const backendRecord = scanRecord({
      title: '后端确认 WO-2026-0042 到站证据',
      traceId: 'TRACE-BACKEND-WO-2026-0042',
    })
    httpPost.mockResolvedValueOnce({ data: backendRecord })
    httpGet.mockResolvedValueOnce({ data: [backendRecord] })

    await expect(writeBarcodeScanEvidenceRecordAndReadBack(record))
      .resolves.toEqual(backendRecord)

    expect(httpPost).toHaveBeenCalledWith('/scheduling/barcode-scan-evidence', record)
    expect(httpGet).toHaveBeenCalledWith('/scheduling/barcode-scan-evidence', { params: { take: 20 } })
    expect(readBarcodeScanEvidenceRecords()).toEqual([backendRecord])
    expect(readOtdEvidenceChainRecords()).toEqual([
      expect.objectContaining({
        id: 'barcode-barcode-scan-workorder-WO-2026-0042',
        title: '后端确认 WO-2026-0042 到站证据',
        traceId: 'TRACE-BACKEND-WO-2026-0042',
      }),
    ])
  })

  it('deduplicates by scan evidence id and caps local records at 20', () => {
    writeBarcodeScanEvidenceRecord(scanRecord({ summary: '旧扫码' }))
    writeBarcodeScanEvidenceRecord(scanRecord({ summary: '新扫码' }))
    for (let index = 1; index < 20; index += 1) {
      writeBarcodeScanEvidenceRecord(scanRecord({
        id: `barcode-scan-workorder-WO-${index}`,
        code: `WO-${index}`,
        object: `WO-${index}`,
        traceId: `TRACE-QR-WO-${index}-ARRIVAL`,
      }))
    }

    const records = readBarcodeScanEvidenceRecords()
    expect(records).toHaveLength(20)
    expect(records.some(record => record.summary === '旧扫码')).toBe(false)
    expect(records.some(record => record.summary === '新扫码')).toBe(true)
  })

  it('falls back to local scan evidence when backend returns no records', async () => {
    const localRecord = scanRecord()
    writeBarcodeScanEvidenceRecord(localRecord)
    httpGet.mockResolvedValueOnce({ data: [] })

    await expect(readBarcodeScanEvidenceRecordsBackendFirst()).resolves.toEqual([localRecord])
    expect(httpGet).toHaveBeenCalledWith('/scheduling/barcode-scan-evidence', { params: { take: 20 } })
  })

  it('falls back to local scan evidence when backend lookup fails', async () => {
    const localRecord = scanRecord()
    writeBarcodeScanEvidenceRecord(localRecord)
    httpGet.mockRejectedValueOnce(new Error('network'))

    await expect(readBarcodeScanEvidenceRecordsBackendFirst()).resolves.toEqual([localRecord])
  })

  it('surfaces backend lookup failures when fail-loud scanner evidence is requested', async () => {
    const localRecord = scanRecord()
    writeBarcodeScanEvidenceRecord(localRecord)
    httpGet.mockRejectedValueOnce(new Error('barcode evidence backend unavailable'))

    await expect(readBarcodeScanEvidenceRecordsBackendFirst({ failLoud: true }))
      .rejects.toThrow('barcode evidence backend unavailable')
  })

  it('removes corrupt scan evidence JSON so execution boards do not render stale traces', () => {
    localStorage.setItem('aimes_barcode_scan_evidence', '{bad json')

    expect(readBarcodeScanEvidenceRecords()).toEqual([])
    expect(localStorage.getItem('aimes_barcode_scan_evidence')).toBeNull()
  })

  it('removes incomplete scan evidence that cannot explain trace or next check', () => {
    localStorage.setItem('aimes_barcode_scan_evidence', JSON.stringify([
      {
        id: 'barcode-scan-workorder-WO-2026-0042',
        code: 'WO-2026-0042',
        type: 'WorkOrder',
        title: 'WO-2026-0042 工单扫码到站已确认',
      },
    ]))

    expect(readBarcodeScanEvidenceRecords()).toEqual([])
    expect(localStorage.getItem('aimes_barcode_scan_evidence')).toBeNull()
  })
})
