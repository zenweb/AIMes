import { beforeEach, describe, expect, it, vi } from 'vitest'
import { installMemoryLocalStorage } from './test-storage'
import {
  matchesShortageMaterial,
  readBomKittingPackage,
  readBomKittingPackageBackendFirst,
  readShortageKittingEventBackendFirst,
  readShortageKittingEvent,
  readShortageRiskResolution,
  readShortageRiskResolutionBackendFirst,
  readSupplyRiskEscalationBackendFirst,
  readSupplierNetworkDecisionBackendFirst,
  readSupplyRiskEscalation,
  readSupplierNetworkDecision,
  type BomKittingPackage,
  type ShortageKittingEvent,
  type ShortageRiskResolution,
  type SupplierNetworkDecision,
  type SupplyRiskEscalation,
  writeBomKittingPackage,
  writeShortageKittingEvent,
  writeShortageRiskResolution,
  writeSupplierNetworkDecision,
  writeSupplyRiskEscalation,
} from '../../src/utils/shortage-risk-sync'

const httpGet = vi.hoisted(() => vi.fn())
const httpPost = vi.hoisted(() => vi.fn())

vi.mock('../../src/api/http', () => ({
  default: {
    get: httpGet,
    post: httpPost,
  },
}))

function bomPackage(overrides: Partial<BomKittingPackage> = {}): BomKittingPackage {
  return {
    id: 'BOM-KIT-001',
    bomCode: 'BOM-PUMP-A',
    bomVersion: 'V2',
    productName: '液压泵总成',
    workOrderNumber: 'WO-2026-0042',
    scheduleWindow: '今日白班 10:00-14:00',
    statusLabel: '待齐套',
    owner: '计划员',
    auditId: 'AUD-BOM-KIT-001',
    traceId: 'TRACE-BOM-KIT-001',
    createdAt: '2026-05-31T08:00:00.000Z',
    summary: 'WO-2026-0042 / WO-RUSH-9001 同受 AL-6061 缺料影响',
    items: [
      {
        materialCode: 'AL-6061',
        materialName: '铝合金',
        requiredQuantity: 22,
        availableQuantity: 20,
        inboundQuantity: 0,
        shortageQuantity: 2,
        unit: 'KG',
        action: '触发采购加急并评估替代料',
      },
      {
        materialCode: 'BOLT-01',
        materialName: '螺栓',
        requiredQuantity: 10,
        availableQuantity: 50,
        inboundQuantity: 0,
        shortageQuantity: 0,
        unit: 'PCS',
        action: '库存满足',
      },
    ],
    ...overrides,
  }
}

function shortageRiskResolution(overrides: Partial<ShortageRiskResolution> = {}): ShortageRiskResolution {
  return {
    materialCode: 'AL-6061',
    materialName: '铝合金',
    affectedOrders: 'WO-2026-0042 / WO-RUSH-9001',
    sourceOrderNumber: 'PO-AL-6061-001',
    receivedQuantity: 22,
    unit: 'KG',
    availableQuantity: 42,
    resolvedAt: '2026-06-01T10:00:00.000Z',
    message: '加急到货完成，缺料风险已关闭。',
    ...overrides,
  }
}

function shortageKittingEvent(overrides: Partial<ShortageKittingEvent> = {}): ShortageKittingEvent {
  return {
    materialCode: 'AL-6061',
    materialName: '铝合金',
    workOrderNumber: 'WO-2026-0042',
    affectedOrders: 'WO-2026-0042 / WO-RUSH-9001',
    requiredQuantity: 22,
    availableQuantity: 20,
    inboundQuantity: 0,
    shortageQuantity: 2,
    window: '今日白班 10:00-14:00',
    suggestion: '触发采购加急并评估替代料',
    createdAt: '2026-05-31T08:00:00.000Z',
    ...overrides,
  }
}

function supplyRiskEscalation(overrides: Partial<SupplyRiskEscalation> = {}): SupplyRiskEscalation {
  return {
    purchaseOrderNumber: 'PO-AL-6061-001',
    materialCode: 'AL-6061',
    materialName: '铝合金',
    supplierName: '华东铝材',
    originalDeliveryDate: '2026-06-03',
    promisedDeliveryDate: '2026-06-08',
    delayDays: 5,
    affectedOrders: 'WO-2026-0042 / WO-RUSH-9001',
    alternateSupplierName: '苏南铝材',
    alternatePromiseDate: '2026-06-04',
    decision: 'alternate_committed',
    statusLabel: '替代供应商已承诺',
    auditId: 'AUD-SUPPLY-RISK-001',
    traceId: 'TRACE-SUPPLY-RISK-001',
    message: '主供应商延期，已切换替代供应商保护急单交期。',
    createdAt: '2026-06-01T08:30:00.000Z',
    ...overrides,
  }
}

function supplierNetworkDecision(overrides: Partial<SupplierNetworkDecision> = {}): SupplierNetworkDecision {
  return {
    materialCode: 'AL-6061',
    materialName: '铝合金',
    affectedOrders: 'WO-2026-0042 / WO-RUSH-9001',
    selectedSupplierName: '苏南铝材',
    selectedPromiseDate: '2026-06-04',
    selectedPerformanceScore: 94,
    selectedOnTimeRate: 0.98,
    selectedQuotedPrice: 128,
    selectedCapacityQuantity: 80,
    candidates: [
      {
        supplierName: '苏南铝材',
        promiseDate: '2026-06-04',
        quotedPrice: 128,
        capacityQuantity: 80,
        onTimeRate: 0.98,
        defectRate: 0.01,
        performanceScore: 94,
        slaLeadTimeHours: 18,
        slaStatus: 'healthy',
        riskNote: '可覆盖急单缺口。',
      },
    ],
    statusLabel: '网络供应商已锁定',
    auditId: 'AUD-SUPPLIER-NETWORK-001',
    traceId: 'TRACE-SUPPLIER-NETWORK-001',
    message: '按交期、价格、产能和质量评分选择替代供应商。',
    createdAt: '2026-06-01T08:45:00.000Z',
    ...overrides,
  }
}

describe('shortage risk sync', () => {
  beforeEach(() => {
    installMemoryLocalStorage()
    localStorage.clear()
    httpGet.mockReset()
    httpPost.mockReset()
  })

  it('persists BOM kitting package, syncs backend, and derives a shortage event with the full impact summary', async () => {
    const record = bomPackage()

    writeBomKittingPackage(record)
    await vi.dynamicImportSettled()

    expect(readBomKittingPackage()).toEqual(record)
    expect(httpPost).toHaveBeenCalledWith('/scheduling/bom-kitting-package', record)
    expect(readShortageKittingEvent()).toEqual(expect.objectContaining({
      materialCode: 'AL-6061',
      workOrderNumber: 'WO-2026-0042',
      affectedOrders: 'WO-2026-0042 / WO-RUSH-9001 同受 AL-6061 缺料影响',
      requiredQuantity: 22,
      shortageQuantity: 2,
      suggestion: '触发采购加急并评估替代料；库存满足',
      createdAt: '2026-05-31T08:00:00.000Z',
    }))
  })

  it('falls back to the local BOM kitting package when backend returns no record', async () => {
    const localRecord = bomPackage()
    writeBomKittingPackage(localRecord)
    httpGet.mockResolvedValueOnce({ data: null })

    await expect(readBomKittingPackageBackendFirst()).resolves.toEqual(localRecord)
  })

  it('falls back to local auditable shortage evidence when backend returns an incomplete latest record', async () => {
    const localResolution = shortageRiskResolution()
    const localKittingEvent = shortageKittingEvent()
    const localBomPackage = bomPackage()
    const localSupplyRisk = supplyRiskEscalation()
    const localSupplierDecision = supplierNetworkDecision()

    writeShortageRiskResolution(localResolution)
    writeBomKittingPackage(localBomPackage)
    writeShortageKittingEvent(localKittingEvent)
    writeSupplyRiskEscalation(localSupplyRisk)
    writeSupplierNetworkDecision(localSupplierDecision)
    await vi.dynamicImportSettled()
    httpGet.mockReset()
    httpGet
      .mockResolvedValueOnce({ data: { materialCode: 'AL-6061', receivedQuantity: 22 } })
      .mockResolvedValueOnce({ data: { materialCode: 'AL-6061', shortageQuantity: 2 } })
      .mockResolvedValueOnce({ data: { id: 'backend-bom-without-items' } })
      .mockResolvedValueOnce({ data: { materialCode: 'AL-6061', delayDays: 5 } })
      .mockResolvedValueOnce({ data: { materialCode: 'AL-6061', selectedSupplierName: '苏南铝材' } })

    await expect(readShortageRiskResolutionBackendFirst()).resolves.toEqual(localResolution)
    await expect(readShortageKittingEventBackendFirst()).resolves.toEqual(localKittingEvent)
    await expect(readBomKittingPackageBackendFirst()).resolves.toEqual(localBomPackage)
    await expect(readSupplyRiskEscalationBackendFirst()).resolves.toEqual(localSupplyRisk)
    await expect(readSupplierNetworkDecisionBackendFirst()).resolves.toEqual(localSupplierDecision)
  })

  it('fails loud for shortage and supply backend evidence refresh when requested', async () => {
    httpGet
      .mockRejectedValueOnce(new Error('shortage resolution backend unavailable'))
      .mockRejectedValueOnce(new Error('shortage kitting backend unavailable'))
      .mockRejectedValueOnce(new Error('bom kitting backend unavailable'))
      .mockRejectedValueOnce(new Error('supply risk backend unavailable'))
      .mockRejectedValueOnce(new Error('supplier network backend unavailable'))

    await expect(readShortageRiskResolutionBackendFirst({ failLoud: true }))
      .rejects.toThrow('shortage resolution backend unavailable')
    await expect(readShortageKittingEventBackendFirst({ failLoud: true }))
      .rejects.toThrow('shortage kitting backend unavailable')
    await expect(readBomKittingPackageBackendFirst({ failLoud: true }))
      .rejects.toThrow('bom kitting backend unavailable')
    await expect(readSupplyRiskEscalationBackendFirst({ failLoud: true }))
      .rejects.toThrow('supply risk backend unavailable')
    await expect(readSupplierNetworkDecisionBackendFirst({ failLoud: true }))
      .rejects.toThrow('supplier network backend unavailable')
  })

  it('removes corrupt BOM package JSON so shortage panels do not reuse stale evidence', () => {
    localStorage.setItem('aimes_bom_kitting_package', '{bad json')

    expect(readBomKittingPackage()).toBeNull()
    expect(localStorage.getItem('aimes_bom_kitting_package')).toBeNull()
  })

  it('removes incomplete BOM package items so shortage panels do not reuse unauditable evidence', () => {
    localStorage.setItem('aimes_bom_kitting_package', JSON.stringify({
      ...bomPackage(),
      items: [
        {
          materialCode: 'AL-6061',
          shortageQuantity: 2,
        },
      ],
    }))

    expect(readBomKittingPackage()).toBeNull()
    expect(localStorage.getItem('aimes_bom_kitting_package')).toBeNull()
  })

  it('removes incomplete shortage resolution records so closed-loop evidence stays auditable', () => {
    localStorage.setItem('aimes_shortage_risk_resolution', JSON.stringify({
      materialCode: 'AL-6061',
      receivedQuantity: 20,
    }))

    expect(readShortageRiskResolution()).toBeNull()
    expect(localStorage.getItem('aimes_shortage_risk_resolution')).toBeNull()
  })

  it('removes incomplete shortage kitting events so shortage panels do not reuse partial evidence', () => {
    localStorage.setItem('aimes_shortage_kitting_event', JSON.stringify({
      materialCode: 'AL-6061',
      shortageQuantity: 2,
    }))

    expect(readShortageKittingEvent()).toBeNull()
    expect(localStorage.getItem('aimes_shortage_kitting_event')).toBeNull()
  })

  it('removes incomplete supply risk escalations so escalation panels do not reuse partial evidence', () => {
    localStorage.setItem('aimes_supply_risk_escalation', JSON.stringify({
      materialCode: 'AL-6061',
      delayDays: 3,
    }))

    expect(readSupplyRiskEscalation()).toBeNull()
    expect(localStorage.getItem('aimes_supply_risk_escalation')).toBeNull()
  })

  it('removes incomplete supplier network decisions so network panels do not reuse partial evidence', () => {
    localStorage.setItem('aimes_supplier_network_decision', JSON.stringify({
      materialCode: 'AL-6061',
      selectedSupplierName: '华东铝材',
    }))

    expect(readSupplierNetworkDecision()).toBeNull()
    expect(localStorage.getItem('aimes_supplier_network_decision')).toBeNull()
  })

  it('persists supply risk escalation locally, syncs backend, and falls back when backend has no latest record', async () => {
    const record = supplyRiskEscalation()

    writeSupplyRiskEscalation(record)
    await vi.dynamicImportSettled()
    httpGet.mockResolvedValueOnce({ data: null })

    expect(readSupplyRiskEscalation()).toEqual(record)
    expect(httpPost).toHaveBeenCalledWith('/scheduling/supply-risk-escalation', record)
    await expect(readSupplyRiskEscalationBackendFirst()).resolves.toEqual(record)
  })

  it('persists supplier network decision with candidate scoring and falls back when backend has no latest record', async () => {
    const record = supplierNetworkDecision()

    writeSupplierNetworkDecision(record)
    await vi.dynamicImportSettled()
    httpGet.mockResolvedValueOnce({ data: null })

    expect(readSupplierNetworkDecision()).toEqual(record)
    expect(httpPost).toHaveBeenCalledWith('/scheduling/supplier-network-decision', record)
    await expect(readSupplierNetworkDecisionBackendFirst()).resolves.toEqual(record)
  })

  it('matches shortage materials despite common MES code formatting differences', () => {
    expect(matchesShortageMaterial('M-AL-6061', 'evt-shortage-al6061')).toBe(true)
    expect(matchesShortageMaterial('AL-6061', 'shortage:BOLT-01')).toBe(false)
  })
})
