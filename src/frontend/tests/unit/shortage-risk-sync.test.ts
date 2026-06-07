import { beforeEach, describe, expect, it, vi } from 'vitest'
import { installMemoryLocalStorage } from './test-storage'
import {
  matchesShortageMaterial,
  readBomKittingPackage,
  readBomKittingPackageBackendFirst,
  readShortageKittingEvent,
  readShortageRiskResolution,
  readSupplyRiskEscalation,
  readSupplierNetworkDecision,
  type BomKittingPackage,
  writeBomKittingPackage,
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

  it('matches shortage materials despite common MES code formatting differences', () => {
    expect(matchesShortageMaterial('M-AL-6061', 'evt-shortage-al6061')).toBe(true)
    expect(matchesShortageMaterial('AL-6061', 'shortage:BOLT-01')).toBe(false)
  })
})
