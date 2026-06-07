import { getLatestCustomerOrderImport, upsertCustomerOrderImport } from '../api/pocEvidence'

const STORAGE_KEY = 'aimes_customer_order_import'

export interface CustomerOrderImportEvidence {
  batchId: string
  fileName: string
  source: string
  importedOrders: number
  highRiskOrders: number
  mappedFields: string[]
  preparedAt: string
}

function canUseStorage() {
  return typeof window !== 'undefined' && !!window.localStorage
}

function isCustomerOrderImportEvidence(value: unknown): value is CustomerOrderImportEvidence {
  if (!value || typeof value !== 'object') return false
  const evidence = value as Partial<CustomerOrderImportEvidence>
  return !!evidence.batchId
    && !!evidence.fileName
    && !!evidence.source
    && typeof evidence.importedOrders === 'number'
    && typeof evidence.highRiskOrders === 'number'
    && Array.isArray(evidence.mappedFields)
    && evidence.mappedFields.length > 0
    && evidence.mappedFields.every(field => typeof field === 'string' && field.trim().length > 0)
    && !!evidence.preparedAt
}

export function readCustomerOrderImportEvidence(): CustomerOrderImportEvidence | null {
  if (!canUseStorage()) return null
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (isCustomerOrderImportEvidence(parsed)) return parsed
    window.localStorage.removeItem(STORAGE_KEY)
    return null
  } catch {
    window.localStorage.removeItem(STORAGE_KEY)
    return null
  }
}

export async function readCustomerOrderImportEvidenceBackendFirst(): Promise<CustomerOrderImportEvidence | null> {
  try {
    const record = await getLatestCustomerOrderImport()
    return record ?? readCustomerOrderImportEvidence()
  } catch (error: unknown) {
    const localRecord = readCustomerOrderImportEvidence()
    if (localRecord) return localRecord
    throw error
  }
}

export function writeCustomerOrderImportEvidence(evidence?: Partial<CustomerOrderImportEvidence>) {
  if (!canUseStorage()) return null
  const next: CustomerOrderImportEvidence = {
    batchId: evidence?.batchId ?? 'IMP-POC-WO-20260520-001',
    fileName: evidence?.fileName ?? '客户真实工单导入样例_30单.csv',
    source: evidence?.source ?? '客户 IT / ERP 导出样例',
    importedOrders: evidence?.importedOrders ?? 30,
    highRiskOrders: evidence?.highRiskOrders ?? 6,
    mappedFields: evidence?.mappedFields ?? ['工单号', '产品', '交期', '工艺路线', '物料缺口', '设备约束'],
    preparedAt: evidence?.preparedAt ?? new Date().toISOString(),
  }
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  void upsertCustomerOrderImport(next).catch(() => undefined)
  return next
}
