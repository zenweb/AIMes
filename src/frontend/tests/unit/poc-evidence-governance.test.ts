import { beforeEach, describe, expect, it, vi } from 'vitest'
import { installMemoryLocalStorage } from './test-storage'
import { readPocEvidenceGovernanceRecords, readPocEvidenceGovernanceRecordsBackendFirst } from '../../src/utils/poc-evidence-governance'
import { writeCustomerOrderImportEvidence } from '../../src/utils/customer-order-import-sync'
import { writeCustomerEquipmentFaultEvidence } from '../../src/utils/equipment-risk-sync'

const httpGet = vi.hoisted(() => vi.fn())
const httpPost = vi.hoisted(() => vi.fn(() => Promise.resolve({ data: null })))

vi.mock('../../src/api/http', () => ({
  default: {
    get: httpGet,
    post: httpPost,
  },
}))

describe('poc evidence governance', () => {
  beforeEach(() => {
    installMemoryLocalStorage()
    localStorage.clear()
    httpGet.mockReset()
    httpPost.mockClear()
  })

  it('maps customer order import and equipment fault evidence into auditable POC governance records', () => {
    writeCustomerOrderImportEvidence({
      batchId: 'IMP-POC-WO-20260520-007',
      fileName: 'orders.csv',
      source: '客户 ERP',
      importedOrders: 30,
      highRiskOrders: 6,
      mappedFields: ['工单号', '交期'],
      preparedAt: '2026-05-31T08:00:00.000Z',
    })
    writeCustomerEquipmentFaultEvidence({
      batchId: 'IMP-POC-EQ-FAULT-20260520-008',
      fileName: 'faults.csv',
      source: '客户设备平台',
      equipmentCode: 'CNC-008',
      faultSamples: 12,
      affectedOrders: 'WO-008',
      downtimeHours: 4,
      capturedSignals: ['主轴振动', '维修工单'],
      preparedAt: '2026-05-31T09:00:00.000Z',
    })

    expect(readPocEvidenceGovernanceRecords()).toEqual([
      expect.objectContaining({
        id: 'poc-customer-order-import',
        auditId: 'AUD-POC-WO-007',
        object: '30 单客户工单 / 6 单高风险',
        evidence: '工单号 / 交期',
        steps: expect.arrayContaining(['客户 ERP 提供 orders.csv。']),
      }),
      expect.objectContaining({
        id: 'poc-customer-equipment-fault',
        auditId: 'AUD-POC-EQ-008',
        object: 'CNC-008 / WO-008',
        evidence: '主轴振动 / 维修工单',
        steps: expect.arrayContaining(['客户设备平台 提供 faults.csv。']),
      }),
    ])
  })

  it('falls back to local POC governance records when backend evidence is empty', async () => {
    const order = writeCustomerOrderImportEvidence({ batchId: 'IMP-POC-WO-20260520-007' })
    const fault = writeCustomerEquipmentFaultEvidence({ batchId: 'IMP-POC-EQ-FAULT-20260520-008' })
    httpGet.mockResolvedValue({ data: null })

    await expect(readPocEvidenceGovernanceRecordsBackendFirst()).resolves.toEqual([
      expect.objectContaining({
        id: 'poc-customer-order-import',
        batchId: order?.batchId,
      }),
      expect.objectContaining({
        id: 'poc-customer-equipment-fault',
        batchId: fault?.batchId,
      }),
    ])
    expect(httpGet).toHaveBeenCalledWith('/scheduling/customer-order-import/latest')
    expect(httpGet).toHaveBeenCalledWith('/scheduling/customer-equipment-fault/latest')
  })
})
