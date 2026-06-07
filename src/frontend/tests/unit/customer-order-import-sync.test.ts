import { beforeEach, describe, expect, it, vi } from 'vitest'
import { installMemoryLocalStorage } from './test-storage'
import {
  readCustomerOrderImportEvidence,
  readCustomerOrderImportEvidenceBackendFirst,
  writeCustomerOrderImportEvidence,
  type CustomerOrderImportEvidence,
} from '../../src/utils/customer-order-import-sync'

const getLatestCustomerOrderImport = vi.hoisted(() => vi.fn())
const upsertCustomerOrderImport = vi.hoisted(() => vi.fn(() => Promise.resolve()))

vi.mock('../../src/api/pocEvidence', () => ({
  getLatestCustomerOrderImport,
  upsertCustomerOrderImport,
}))

function orderImport(overrides: Partial<CustomerOrderImportEvidence> = {}): CustomerOrderImportEvidence {
  return {
    batchId: 'IMP-POC-WO-20260520-001',
    fileName: '客户真实工单导入样例_30单.csv',
    source: '客户 IT / ERP 导出样例',
    importedOrders: 30,
    highRiskOrders: 6,
    mappedFields: ['工单号', '产品', '交期', '工艺路线', '物料缺口', '设备约束'],
    preparedAt: '2026-05-31T08:30:00.000Z',
    ...overrides,
  }
}

describe('customer order import sync', () => {
  beforeEach(() => {
    installMemoryLocalStorage()
    localStorage.clear()
    getLatestCustomerOrderImport.mockReset()
    upsertCustomerOrderImport.mockClear()
  })

  it('persists customer import evidence and syncs backend best-effort', async () => {
    const record = writeCustomerOrderImportEvidence(orderImport())
    await vi.dynamicImportSettled()

    expect(readCustomerOrderImportEvidence()).toEqual(record)
    expect(upsertCustomerOrderImport).toHaveBeenCalledWith(record)
  })

  it('falls back to local import evidence when backend returns no record', async () => {
    const localRecord = writeCustomerOrderImportEvidence(orderImport())
    getLatestCustomerOrderImport.mockResolvedValueOnce(null)

    await expect(readCustomerOrderImportEvidenceBackendFirst()).resolves.toEqual(localRecord)
  })

  it('falls back to local import evidence when backend fails but a local POC sample exists', async () => {
    const localRecord = writeCustomerOrderImportEvidence(orderImport())
    getLatestCustomerOrderImport.mockRejectedValueOnce(new Error('backend unavailable'))

    await expect(readCustomerOrderImportEvidenceBackendFirst()).resolves.toEqual(localRecord)
  })

  it('fails loud when backend fails and no local POC sample can explain the evidence', async () => {
    getLatestCustomerOrderImport.mockRejectedValueOnce(new Error('backend unavailable'))

    await expect(readCustomerOrderImportEvidenceBackendFirst()).rejects.toThrow('backend unavailable')
  })

  it('removes corrupt import JSON so POC evidence boards do not render stale samples', () => {
    localStorage.setItem('aimes_customer_order_import', '{bad json')

    expect(readCustomerOrderImportEvidence()).toBeNull()
    expect(localStorage.getItem('aimes_customer_order_import')).toBeNull()
  })

  it('removes incomplete import evidence that cannot explain the customer batch', () => {
    localStorage.setItem('aimes_customer_order_import', JSON.stringify({
      batchId: 'IMP-POC-WO-20260520-001',
      importedOrders: 30,
      highRiskOrders: 6,
    }))

    expect(readCustomerOrderImportEvidence()).toBeNull()
    expect(localStorage.getItem('aimes_customer_order_import')).toBeNull()
  })

  it('removes import evidence without mapped fields because POC governance cannot audit field lineage', () => {
    localStorage.setItem('aimes_customer_order_import', JSON.stringify(orderImport({
      mappedFields: [],
    })))

    expect(readCustomerOrderImportEvidence()).toBeNull()
    expect(localStorage.getItem('aimes_customer_order_import')).toBeNull()
  })
})
