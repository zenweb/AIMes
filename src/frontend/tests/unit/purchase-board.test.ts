import { flushPromises, mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import PurchaseBoard from '../../src/components/purchase/PurchaseBoard.vue'
import type { PurchaseOrderDetail, PurchaseOrderSummary } from '../../src/types/purchase'

const getPurchaseList = vi.hoisted(() => vi.fn())
const getPurchaseById = vi.hoisted(() => vi.fn())
const createPurchaseOrder = vi.hoisted(() => vi.fn())
const submitPurchaseOrder = vi.hoisted(() => vi.fn())
const confirmPurchaseOrder = vi.hoisted(() => vi.fn())
const receivePurchaseOrder = vi.hoisted(() => vi.fn())
const cancelPurchaseOrder = vi.hoisted(() => vi.fn())
const writeSupplyRiskEscalation = vi.hoisted(() => vi.fn())
const writeSupplierNetworkDecision = vi.hoisted(() => vi.fn())
const writeShortageRiskResolution = vi.hoisted(() => vi.fn())
const readSupplierNetworkDecision = vi.hoisted(() => vi.fn())
const readSupplierNetworkDecisionBackendFirst = vi.hoisted(() => vi.fn())
const readSupplyRiskEscalationBackendFirst = vi.hoisted(() => vi.fn())
const readAnomalyDispatchRecordByType = vi.hoisted(() => vi.fn())
const readAnomalyDispatchRecordByTypeBackendFirst = vi.hoisted(() => vi.fn())
const confirmOutsourcingCommitmentArrival = vi.hoisted(() => vi.fn())
const readLatestOutsourcingCommitmentPackage = vi.hoisted(() => vi.fn())
const readLatestOutsourcingCommitmentPackageBackendFirst = vi.hoisted(() => vi.fn())
const closeAssistantRecoveryPurchaseAction = vi.hoisted(() => vi.fn())
const readAssistantRecoveryPackagesBackendFirst = vi.hoisted(() => vi.fn())
const upsertOtdEvidenceChainRecord = vi.hoisted(() => vi.fn())
const exportToCsv = vi.hoisted(() => vi.fn())
const routeQuery = vi.hoisted(() => ({} as Record<string, string>))
const isOfflineDemoError = vi.hoisted(() =>
  vi.fn((error: unknown) => error instanceof Error && error.name === 'OfflineDemoApiError')
)

vi.mock('vue-router', () => ({
  useRoute: () => ({ query: routeQuery }),
}))

vi.mock('../../src/api/purchase', () => ({
  getPurchaseList,
  getPurchaseById,
  createPurchaseOrder,
  submitPurchaseOrder,
  confirmPurchaseOrder,
  receivePurchaseOrder,
  cancelPurchaseOrder,
}))

vi.mock('../../src/utils/export', () => ({
  exportToCsv,
}))

vi.mock('../../src/utils/offline-demo-mode', () => ({
  isOfflineDemoError,
}))

vi.mock('../../src/utils/date', () => ({
  formatDate: (value: string | null | undefined) => value ?? '-',
}))

vi.mock('../../src/utils/shortage-risk-sync', () => ({
  readSupplierNetworkDecision,
  readSupplierNetworkDecisionBackendFirst,
  readSupplyRiskEscalationBackendFirst,
  writeShortageRiskResolution,
  writeSupplierNetworkDecision,
  writeSupplyRiskEscalation,
}))

vi.mock('../../src/utils/otd-evidence-chain-sync', () => ({
  closeOtdEvidenceChainRecords: vi.fn(),
  upsertOtdEvidenceChainRecord,
}))

vi.mock('../../src/utils/anomaly-dispatch-sync', () => ({
  readAnomalyDispatchRecordByType,
  readAnomalyDispatchRecordByTypeBackendFirst,
}))

vi.mock('../../src/utils/assistant-action-package-sync', () => ({
  closeAssistantRecoveryPurchaseAction,
  readAssistantRecoveryPackagesBackendFirst,
}))

vi.mock('../../src/utils/outsourcing-commitment-sync', () => ({
  confirmOutsourcingCommitmentArrival,
  readLatestOutsourcingCommitmentPackage,
  readLatestOutsourcingCommitmentPackageBackendFirst,
}))

function mountPurchaseBoard() {
  return mount(PurchaseBoard, {
    global: {
      stubs: {
        RouterLink: {
          props: ['to'],
          template: '<a :href="to"><slot /></a>',
        },
      },
    },
  })
}

const purchaseOrders: PurchaseOrderSummary[] = [
  {
    id: 'po-a',
    orderNumber: 'PO-20260601',
    supplierName: '华东轴承有限公司',
    status: 'Confirmed',
    orderDate: '2026-06-01T00:00:00',
    expectedDeliveryDate: '2026-06-10',
    totalAmount: 45000,
    itemCount: 3,
    createdBy: 'operator1',
    createdAt: '2026-06-01T00:00:00',
  },
  {
    id: 'po-b',
    orderNumber: 'PO-20260602',
    supplierName: '南方钢材集团',
    status: 'Submitted',
    orderDate: '2026-06-02T00:00:00',
    expectedDeliveryDate: '2026-06-12',
    totalAmount: 128000,
    itemCount: 2,
    createdBy: 'operator1',
    createdAt: '2026-06-02T00:00:00',
  },
]

const purchaseDetails: Record<string, PurchaseOrderDetail> = Object.fromEntries(
  purchaseOrders.map(order => [
    order.id,
    {
      ...order,
      supplierContact: null,
      completedDate: null,
      remark: null,
      updatedAt: null,
      items: [],
    },
  ])
)

function makeOutsourcingCommitment() {
  return {
    id: 'outsourcing-commitment-product-flange',
    sourceKpiId: 'product-flange',
    dimensionLabel: '产品',
    targetName: '法兰盘',
    title: '法兰盘外协承诺包',
    auditId: 'AUD-OUTSOURCING-COMMITMENT-FLANGE-20260521-001',
    traceId: 'TRACE-OUTSOURCING-FLANGE-20260521',
    actor: '报表中心',
    baselineOtd: 82,
    agentOtd: 91,
    lift: 9,
    delayedReduced: 3,
    statusLabel: '外协承诺待到货',
    commitment: '法兰盘 外协承诺口径：华东外协厂将按 2026-05-24 交付，当前仍保留厂内延期口径。',
    owner: '采购 / 计划联合确认',
    dueAt: '2026-05-24',
    summary: 'KPI 钻取已转为外协承诺口径。',
    actions: [{
      module: '外协协同',
      owner: '采购 / 计划',
      action: '锁定法兰盘外协承诺',
      evidence: 'TRACE-OUTSOURCING-FLANGE-20260521',
    }],
    partnerName: '华东外协厂',
    promiseDate: '2026-05-24',
    affectedOrders: 'WO-RUSH-9001 / WO-DEMO-1002',
    sourceTraceId: 'TRACE-OTD-KPI-PRODUCT-FLANGE',
    createdAt: '2026-05-21T08:00:00.000Z',
  }
}

function makeReceivedSupplyRisk() {
  return {
    materialCode: 'MAT-B02',
    materialName: '轴承套件',
    supplierName: '原供应商',
    purchaseOrderNumber: 'PO-20260501',
    originalDeliveryDate: '2026-05-20',
    promisedDeliveryDate: '2026-05-26',
    delayDays: 6,
    affectedOrders: 'WO-DEMO-1002 / WO-DEMO-1005',
    alternateSupplierName: '华东快供二厂',
    alternatePromiseDate: '2026-05-21',
    decision: 'alternate_received',
    auditId: 'AUD-PUR-MAT-B02-ALT-SUPPLIER-20260521-001',
    traceId: 'TRACE-PUR-MAT-B02-ALT-SUPPLIER-COMMITTED',
    message: '替代供应商已锁定，等待到货确认。',
    receiptAuditId: 'AUD-PUR-MAT-B02-ALT-SUPPLIER-RECEIVED-20260521-001',
    receiptTraceId: 'TRACE-PUR-MAT-B02-ALT-SUPPLIER-RECEIVED',
    receiptMessage: 'MAT-B02 替代供应商到货已确认，WO-DEMO-1002 / WO-DEMO-1005 可释放排产复核。',
    createdAt: '2026-05-21T08:00:00.000Z',
    updatedAt: '2026-05-21T10:00:00.000Z',
  }
}

function makeSupplierNetworkDecision() {
  return {
    materialCode: 'MAT-B02',
    selectedSupplierName: '华东快供二厂',
    selectedPerformanceScore: 92,
    selectedOnTimeRate: 96,
    selectedDefectRate: 0.6,
    selectedSlaLeadTimeHours: 12,
    selectedPromiseDate: '2026-05-21',
    selectedCapacityQuantity: 180,
    selectedQuotedPrice: 126,
    originalSupplierName: '原供应商',
    affectedOrders: 'WO-DEMO-1002 / WO-DEMO-1005',
    statusLabel: '供应网络已选优',
    auditId: 'AUD-PUR-SUPPLIER-NETWORK-20260521-001',
    traceId: 'TRACE-PUR-MAT-B02-SUPPLIER-NETWORK-SLA',
    message: 'MAT-B02 已选择华东快供二厂，按 12h SLA 和 96% 准交率恢复交付承诺。',
    createdAt: '2026-05-21T09:00:00.000Z',
  }
}

describe('PurchaseBoard', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    for (const key of Object.keys(routeQuery)) delete routeQuery[key]
    isOfflineDemoError.mockImplementation((error: unknown) => error instanceof Error && error.name === 'OfflineDemoApiError')
    getPurchaseList.mockResolvedValue({ items: purchaseOrders, totalCount: purchaseOrders.length })
    getPurchaseById.mockImplementation((id: string) => Promise.resolve(purchaseDetails[id] ?? null))
    createPurchaseOrder.mockResolvedValue({})
    submitPurchaseOrder.mockResolvedValue({})
    confirmPurchaseOrder.mockResolvedValue({})
    receivePurchaseOrder.mockResolvedValue({})
    cancelPurchaseOrder.mockResolvedValue({})
    writeSupplyRiskEscalation.mockReset()
    writeSupplyRiskEscalation.mockImplementation(record => record)
    writeSupplierNetworkDecision.mockReset()
    writeSupplierNetworkDecision.mockImplementation(record => record)
    writeShortageRiskResolution.mockReset()
    writeShortageRiskResolution.mockImplementation(record => record)
    readSupplierNetworkDecision.mockReset()
    readSupplierNetworkDecision.mockReturnValue(null)
    readSupplierNetworkDecisionBackendFirst.mockReset()
    readSupplierNetworkDecisionBackendFirst.mockResolvedValue(null)
    readSupplyRiskEscalationBackendFirst.mockReset()
    readSupplyRiskEscalationBackendFirst.mockResolvedValue(null)
    readAnomalyDispatchRecordByType.mockReset()
    readAnomalyDispatchRecordByType.mockReturnValue(null)
    readAnomalyDispatchRecordByTypeBackendFirst.mockReset()
    readAnomalyDispatchRecordByTypeBackendFirst.mockResolvedValue(null)
    confirmOutsourcingCommitmentArrival.mockReset()
    confirmOutsourcingCommitmentArrival.mockReturnValue(null)
    readLatestOutsourcingCommitmentPackage.mockReset()
    readLatestOutsourcingCommitmentPackage.mockReturnValue(null)
    readLatestOutsourcingCommitmentPackageBackendFirst.mockReset()
    readLatestOutsourcingCommitmentPackageBackendFirst.mockResolvedValue(null)
    closeAssistantRecoveryPurchaseAction.mockReset()
    closeAssistantRecoveryPurchaseAction.mockReturnValue(null)
    readAssistantRecoveryPackagesBackendFirst.mockReset()
    readAssistantRecoveryPackagesBackendFirst.mockResolvedValue([])
  })

  it('exports visible purchase orders with supplier, status, date, and owner evidence', async () => {
    const wrapper = mountPurchaseBoard()
    await flushPromises()

    await wrapper.get('.btn-export').trigger('click')

    expect(exportToCsv).toHaveBeenCalledWith(
      '采购订单列表',
      ['订单号', '供应商', '状态', '金额', '订单日期', '预计交货', '创建人'],
      [
        ['PO-20260601', '华东轴承有限公司', 'Confirmed', 45000, '2026-06-01', '2026-06-10', 'operator1'],
        ['PO-20260602', '南方钢材集团', 'Submitted', 128000, '2026-06-02', '2026-06-12', 'operator1'],
      ],
    )
  })

  it('opens the create purchase order form as a labelled modal dialog', async () => {
    const wrapper = mountPurchaseBoard()
    await flushPromises()

    await wrapper.get('.btn-add').trigger('click')
    await flushPromises()

    const dialog = wrapper.get('[role="dialog"]')
    expect(dialog.attributes('aria-modal')).toBe('true')
    expect(dialog.attributes('aria-labelledby')).toBe('create-purchase-order-title')
    expect(dialog.get('#create-purchase-order-title').text()).toBe('新建采购订单')
  })

  it('submits a purchase order with edited material lines and closes the dialog after create succeeds', async () => {
    createPurchaseOrder.mockResolvedValueOnce({
      id: 'po-new',
      orderNumber: 'PO-20260603',
      supplierName: '西南锻造厂',
      supplierContact: '刘工',
      status: 'Draft',
      orderDate: '2026-06-03T00:00:00',
      expectedDeliveryDate: '2026-06-18',
      completedDate: null,
      totalAmount: 9600,
      remark: '新供应商首单',
      createdBy: 'operator1',
      createdAt: '2026-06-03T00:00:00',
      updatedAt: null,
      items: [],
    } satisfies PurchaseOrderDetail)
    const wrapper = mountPurchaseBoard()
    await flushPromises()

    await wrapper.get('.btn-add').trigger('click')
    await flushPromises()

    const fields = wrapper.findAll<HTMLInputElement>('.modal-content .form-input')
    await fields[0].setValue('PO-20260603')
    await fields[1].setValue('西南锻造厂')
    await fields[2].setValue('刘工')
    await fields[3].setValue('2026-06-18')
    await fields[4].setValue('新供应商首单')

    await wrapper.get('.btn-add-line').trigger('click')
    await wrapper.get('.btn-add-line').trigger('click')
    await wrapper.findAll('.btn-del')[1].trigger('click')

    const lineInputs = wrapper.findAll<HTMLInputElement>('.form-line input')
    await lineInputs[0].setValue('MAT-Z01')
    await lineInputs[1].setValue('应急锻件')
    await lineInputs[2].setValue(120)
    await lineInputs[3].setValue('件')
    await lineInputs[4].setValue(80)

    await wrapper.get('.modal-content .btn-ok').trigger('click')
    await flushPromises()

    expect(createPurchaseOrder).toHaveBeenCalledWith(expect.objectContaining({
      orderNumber: 'PO-20260603',
      supplierName: '西南锻造厂',
      supplierContact: '刘工',
      expectedDeliveryDate: '2026-06-18',
      remark: '新供应商首单',
      createdBy: 'operator1',
      items: [
        {
          materialCode: 'MAT-Z01',
          materialName: '应急锻件',
          quantity: 120,
          unit: '件',
          unitPrice: 80,
        },
      ],
    }))
    expect(wrapper.find('.modal-content').exists()).toBe(false)
    expect(wrapper.find('[role="alert"]').exists()).toBe(false)
  })

  it('lets keyboard users select purchase orders and exposes the active order state', async () => {
    const wrapper = mountPurchaseBoard()
    await flushPromises()

    const listbox = wrapper.get('[role="listbox"]')
    expect(listbox.attributes('aria-label')).toBe('采购订单列表')

    const options = wrapper.findAll('[role="option"]')
    expect(options).toHaveLength(2)
    expect(options[1].attributes('tabindex')).toBe('0')
    expect(options[1].attributes('aria-selected')).toBe('false')
    expect(options[1].attributes('aria-label')).toContain('PO-20260602')

    await options[1].trigger('keydown.enter')
    await flushPromises()

    expect(getPurchaseById).toHaveBeenCalledWith('po-b')
    expect(wrapper.get('.detail-header h3').text()).toBe('PO-20260602')
    expect(wrapper.findAll('[role="option"]')[1].attributes('aria-selected')).toBe('true')
  })

  it('lets keyboard users select purchase orders with Space', async () => {
    const wrapper = mountPurchaseBoard()
    await flushPromises()

    await wrapper.findAll('[role="option"]')[0].trigger('keydown.space')
    await flushPromises()

    expect(getPurchaseById).toHaveBeenCalledWith('po-a')
    expect(wrapper.get('.detail-header h3').text()).toBe('PO-20260601')
    expect(wrapper.findAll('[role="option"]')[0].attributes('aria-selected')).toBe('true')
  })

  it('requests the next purchase page and replaces the visible list when pagination advances', async () => {
    const pageTwoOrders: PurchaseOrderSummary[] = [
      {
        id: 'po-c',
        orderNumber: 'PO-20260611',
        supplierName: '华南电子有限公司',
        status: 'Draft',
        orderDate: '2026-06-11T00:00:00',
        expectedDeliveryDate: null,
        totalAmount: 3600,
        itemCount: 1,
        createdBy: 'buyer2',
        createdAt: '2026-06-11T00:00:00',
      },
    ]
    getPurchaseList
      .mockResolvedValueOnce({ items: purchaseOrders, totalCount: 12 })
      .mockResolvedValueOnce({ items: pageTwoOrders, totalCount: 12 })
    const wrapper = mountPurchaseBoard()
    await flushPromises()

    expect(wrapper.text()).toContain('PO-20260601')
    await wrapper.findAll('.page-btn').find(button => button.text() === '下一页')?.trigger('click')
    await flushPromises()

    expect(getPurchaseList).toHaveBeenLastCalledWith(2, 10)
    expect(wrapper.text()).toContain('PO-20260611')
    expect(wrapper.text()).not.toContain('PO-20260601')
    expect(wrapper.get('.page-info').text()).toBe('共 12 条')
  })

  it('locates an existing purchase order from audit replay query evidence', async () => {
    Object.assign(routeQuery, {
      auditObjectType: 'purchase-order',
      auditObjectId: 'po-a',
      auditTraceId: 'TRACE-AUDIT-PO-A',
      auditObjectLabel: 'PO-20260601',
    })
    const wrapper = mountPurchaseBoard()
    await flushPromises()

    expect(wrapper.get('.audit-focus-banner strong').text()).toBe('PO-20260601')
    expect(wrapper.get('.audit-focus-banner p').text()).toContain('TRACE-AUDIT-PO-A')
    expect(getPurchaseById).toHaveBeenCalledWith('po-a')
    expect(wrapper.get('.detail-header h3').text()).toBe('PO-20260601')
    expect(wrapper.findAll('[role="option"]')[0].attributes('aria-selected')).toBe('true')
  })

  it('creates an audit replay fallback detail when the referenced purchase order is absent from the list', async () => {
    Object.assign(routeQuery, {
      auditObjectType: 'purchase-order',
      auditObjectId: 'PO-MISSING-20260620',
      auditTraceId: 'TRACE-AUDIT-MISSING-PO',
      auditObjectLabel: 'PO-MISSING-20260620',
    })
    const wrapper = mountPurchaseBoard()
    await flushPromises()

    expect(getPurchaseById).not.toHaveBeenCalledWith('PO-MISSING-20260620')
    expect(wrapper.get('.detail-header h3').text()).toBe('PO-MISSING-20260620')
    expect(wrapper.get('.detail-header .tag').text()).toBe('已完成')
    expect(wrapper.text()).toContain('由审计回放 TRACE-AUDIT-MISSING-PO 定位的业务对象')
  })

  it('announces when purchase order detail loading fails', async () => {
    getPurchaseById.mockRejectedValueOnce(new Error('purchase detail API unavailable'))
    const wrapper = mountPurchaseBoard()
    await flushPromises()

    await wrapper.findAll('[role="option"]')[0].trigger('click')
    await flushPromises()

    expect(getPurchaseById).toHaveBeenCalledWith('po-a')
    expect(wrapper.find('.detail-header').exists()).toBe(false)
    const alert = wrapper.get('[role="alert"]')
    expect(alert.text()).toContain('采购订单详情加载失败')
    expect(alert.text()).toContain('purchase detail API unavailable')
  })

  it('clears stale purchase detail failure after a later detail selection succeeds while keeping startup evidence alerts', async () => {
    readSupplierNetworkDecision.mockImplementationOnce(() => {
      throw new Error('supplier network local storage unavailable')
    })
    getPurchaseById
      .mockRejectedValueOnce(new Error('purchase detail API unavailable'))
      .mockResolvedValueOnce(purchaseDetails['po-b'])
    const wrapper = mountPurchaseBoard()
    await flushPromises()

    await wrapper.findAll('[role="option"]')[0].trigger('click')
    await flushPromises()
    expect(wrapper.get('[role="alert"]').text()).toContain('采购订单详情加载失败')

    await wrapper.findAll('[role="option"]')[1].trigger('click')
    await flushPromises()

    expect(getPurchaseById).toHaveBeenLastCalledWith('po-b')
    expect(wrapper.get('.detail-header h3').text()).toBe('PO-20260602')
    const alert = wrapper.get('[role="alert"]')
    expect(alert.text()).toContain('供应网络本地决策读取失败')
    expect(alert.text()).toContain('supplier network local storage unavailable')
    expect(alert.text()).not.toContain('采购订单详情加载失败')
    expect(alert.text()).not.toContain('purchase detail API unavailable')
  })

  it('announces when the initial purchase list load falls back to demo data', async () => {
    getPurchaseList.mockRejectedValueOnce(new Error('purchase list API unavailable'))
    const wrapper = mountPurchaseBoard()
    await flushPromises()

    expect(wrapper.findAll('[role="option"]').length).toBeGreaterThan(0)
    const alert = wrapper.get('[role="alert"]')
    expect(alert.text()).toContain('采购订单列表加载失败')
    expect(alert.text()).toContain('purchase list API unavailable')
  })

  it('quietly shows demo purchase orders when offline demo skips initial purchase list loading', async () => {
    const offlineDemoError = new Error('Offline demo mode skipped backend request: /api/v1/purchase')
    offlineDemoError.name = 'OfflineDemoApiError'
    getPurchaseList.mockRejectedValueOnce(offlineDemoError)

    const wrapper = mountPurchaseBoard()
    await flushPromises()

    expect(wrapper.findAll('[role="option"]').length).toBeGreaterThan(0)
    expect(wrapper.text()).toContain('PO-20260501')
    expect(wrapper.find('[role="alert"]').exists()).toBe(false)
    expect(wrapper.text()).not.toContain('采购订单列表加载失败')
    expect(wrapper.text()).not.toContain('Offline demo mode skipped backend request')
  })

  it('keeps the initial purchase list fallback warning visible after a later confirmation succeeds', async () => {
    getPurchaseList
      .mockRejectedValueOnce(new Error('purchase list API unavailable'))
      .mockResolvedValueOnce({ items: purchaseOrders, totalCount: purchaseOrders.length })
    const confirmedDemoOrder: PurchaseOrderDetail = {
      id: 'po2',
      orderNumber: 'PO-20260502',
      supplierName: '南方钢材集团',
      supplierContact: null,
      status: 'Confirmed',
      orderDate: '2026-05-08T00:00:00',
      expectedDeliveryDate: '2026-05-25',
      completedDate: null,
      totalAmount: 128000,
      remark: null,
      createdBy: 'admin',
      createdAt: '2026-05-08T00:00:00',
      updatedAt: '2026-05-08T10:00:00',
      items: [],
    }
    getPurchaseById.mockResolvedValueOnce({
      ...confirmedDemoOrder,
      status: 'Submitted',
    })
    confirmPurchaseOrder.mockResolvedValueOnce({
      ...confirmedDemoOrder,
    })
    const wrapper = mountPurchaseBoard()
    await flushPromises()

    expect(wrapper.get('[role="alert"]').text()).toContain('采购订单列表加载失败')

    await wrapper.findAll('[role="option"]')[1].trigger('click')
    await flushPromises()
    await wrapper.get('.act-confirm').trigger('click')
    await flushPromises()

    expect(confirmPurchaseOrder).toHaveBeenCalledWith('po2')
    expect(wrapper.get('.detail-header .tag').text()).toBe('已确认')
    const alert = wrapper.get('[role="alert"]')
    expect(alert.text()).toContain('采购订单列表加载失败')
    expect(alert.text()).toContain('purchase list API unavailable')
  })

  it('keeps every startup evidence sync failure visible instead of overwriting earlier alerts', async () => {
    readSupplierNetworkDecision.mockImplementationOnce(() => {
      throw new Error('supplier network local storage unavailable')
    })
    readLatestOutsourcingCommitmentPackage.mockImplementationOnce(() => {
      throw new Error('outsourcing local storage unavailable')
    })
    readAnomalyDispatchRecordByType.mockImplementationOnce(() => {
      throw new Error('material dispatch local storage unavailable')
    })
    readSupplyRiskEscalationBackendFirst.mockRejectedValueOnce(new Error('supply risk backend unavailable'))
    readSupplierNetworkDecisionBackendFirst.mockRejectedValueOnce(new Error('supplier network backend unavailable'))
    readLatestOutsourcingCommitmentPackageBackendFirst.mockRejectedValueOnce(new Error('outsourcing backend unavailable'))
    readAnomalyDispatchRecordByTypeBackendFirst.mockRejectedValueOnce(new Error('material dispatch backend unavailable'))

    const wrapper = mountPurchaseBoard()
    await flushPromises()

    expect(getPurchaseList).toHaveBeenCalledWith(1, 10)
    expect(wrapper.findAll('[role="option"]')).toHaveLength(2)
    const alert = wrapper.get('[role="alert"]')
    expect(alert.text()).toContain('供应网络本地决策读取失败')
    expect(alert.text()).toContain('supplier network local storage unavailable')
    expect(alert.text()).toContain('外协承诺本地读取失败')
    expect(alert.text()).toContain('outsourcing local storage unavailable')
    expect(alert.text()).toContain('异常分流本地供应整改读取失败')
    expect(alert.text()).toContain('material dispatch local storage unavailable')
    expect(alert.text()).toContain('供应风险状态同步失败')
    expect(alert.text()).toContain('supply risk backend unavailable')
    expect(alert.text()).toContain('供应网络决策同步失败')
    expect(alert.text()).toContain('supplier network backend unavailable')
    expect(alert.text()).toContain('外协承诺同步失败')
    expect(alert.text()).toContain('outsourcing backend unavailable')
    expect(alert.text()).toContain('异常分流供应整改同步失败')
    expect(alert.text()).toContain('material dispatch backend unavailable')
  })

  it('restores backend supply, supplier network, and outsourcing evidence on startup without duplicate writes', async () => {
    const receivedSupplyRisk = makeReceivedSupplyRisk()
    const supplierDecision = makeSupplierNetworkDecision()
    const receivedOutsourcing = {
      ...makeOutsourcingCommitment(),
      statusLabel: '外协到货已确认',
      receivedAt: '2026-05-24T10:00:00.000Z',
      receivedBy: '采购 王工',
      receiptAuditId: 'AUD-OUTSOURCING-RECEIPT-FLANGE-20260521-001',
      receiptTraceId: 'TRACE-OUTSOURCING-FLANGE-RECEIPT-20260521',
      receiptMessage: '法兰盘外协到货已确认，等待调度员释放排产窗口。',
    }
    readSupplyRiskEscalationBackendFirst.mockResolvedValueOnce(receivedSupplyRisk)
    readSupplierNetworkDecisionBackendFirst.mockResolvedValueOnce(supplierDecision)
    readLatestOutsourcingCommitmentPackageBackendFirst.mockResolvedValueOnce(receivedOutsourcing)

    const wrapper = mountPurchaseBoard()
    await flushPromises()

    expect(readSupplyRiskEscalationBackendFirst).toHaveBeenCalled()
    expect(readSupplierNetworkDecisionBackendFirst).toHaveBeenCalled()
    expect(readLatestOutsourcingCommitmentPackageBackendFirst).toHaveBeenCalled()

    expect(wrapper.get('.supply-risk-heading .risk-badge').text()).toBe('替代已到货')
    expect(wrapper.get('.supply-risk-trace strong').text()).toBe('替代到货已确认')
    expect(wrapper.get('.supply-risk-trace p').text()).toContain('MAT-B02 替代供应商到货已确认')
    expect(wrapper.get('.supply-risk-trace code').text()).toBe('TRACE-PUR-MAT-B02-ALT-SUPPLIER-RECEIVED')
    expect(wrapper.find('.supply-receive').exists()).toBe(false)

    expect(wrapper.get('.supplier-network-heading .risk-badge').text()).toBe('已选优')
    expect(wrapper.get('.supplier-network-trace strong').text()).toBe('供应网络已选优')
    expect(wrapper.get('.supplier-network-trace p').text()).toContain('按 12h SLA 和 96% 准交率恢复交付承诺')
    expect(wrapper.get('.supplier-network-trace code').text()).toBe('TRACE-PUR-MAT-B02-SUPPLIER-NETWORK-SLA')
    expect(wrapper.get<HTMLButtonElement>('.supplier-network-commit').element.disabled).toBe(true)

    expect(wrapper.get('.outsourcing-receipt-heading .risk-badge').text()).toBe('外协到货已确认')
    expect(wrapper.get('.outsourcing-receipt-trace strong').text()).toBe('外协到货已确认')
    expect(wrapper.get('.outsourcing-receipt-trace p').text()).toContain('等待调度员释放排产窗口')
    expect(wrapper.get('.outsourcing-receipt-trace code').text()).toBe('TRACE-OUTSOURCING-FLANGE-RECEIPT-20260521')
    expect(wrapper.get<HTMLButtonElement>('.outsourcing-receive').element.disabled).toBe(true)

    expect(writeSupplyRiskEscalation).not.toHaveBeenCalled()
    expect(writeSupplierNetworkDecision).not.toHaveBeenCalled()
    expect(confirmOutsourcingCommitmentArrival).not.toHaveBeenCalled()
    expect(upsertOtdEvidenceChainRecord).not.toHaveBeenCalled()
    expect(wrapper.find('[role="alert"]').exists()).toBe(false)
  })

  it('guides outsourcing receipt confirmation with bilingual prompts, related links, and help support', async () => {
    readLatestOutsourcingCommitmentPackageBackendFirst.mockResolvedValueOnce(makeOutsourcingCommitment())
    const wrapper = mountPurchaseBoard()
    await flushPromises()

    const guidance = wrapper.get('.outsourcing-receipt-guidance')
    expect(guidance.attributes('id')).toBe('outsourcing-receipt-help')
    expect(guidance.text()).toContain('确认外协到货前，请核对承诺追踪、外协厂、影响工单、到货责任人和排产释放路径。')
    expect(guidance.text()).toContain('Before confirming outsourced receipt, verify commitment trace, partner, impacted work orders, receiver, and scheduling release path.')
    expect(wrapper.get('.outsourcing-receipt-panel').attributes('aria-describedby')).toBe('outsourcing-receipt-help')

    const links = guidance.findAll('a')
    expect(links.map(link => link.text())).toEqual([
      '风险预警 / Risk queue',
      'AI 排产 / Scheduling',
      '报表证据 / Report evidence',
      '帮助 / Help',
    ])
    expect(links.map(link => link.attributes('href'))).toEqual([
      '/risk',
      '/scheduling',
      '/report',
      '#outsourcing-receipt-help',
    ])
  })

  it('keeps the list status in sync when a submitted purchase order is confirmed', async () => {
    confirmPurchaseOrder.mockResolvedValue({
      ...purchaseDetails['po-b'],
      status: 'Confirmed',
      updatedAt: '2026-06-02T10:00:00',
    })
    getPurchaseList.mockResolvedValue({ items: purchaseOrders, totalCount: purchaseOrders.length })
    const wrapper = mountPurchaseBoard()
    await flushPromises()

    await wrapper.findAll('[role="option"]')[1].trigger('click')
    await flushPromises()

    await wrapper.get('.act-confirm').trigger('click')
    await flushPromises()

    expect(confirmPurchaseOrder).toHaveBeenCalledWith('po-b')
    expect(wrapper.get('.detail-header .tag').text()).toBe('已确认')
    const activeOrderTags = wrapper.findAll('[role="option"]')[1].findAll('.tag')
    expect(activeOrderTags[1].text()).toBe('已确认')
  })

  it('announces when the purchase list refresh fails after a confirmation succeeds', async () => {
    confirmPurchaseOrder.mockResolvedValue({
      ...purchaseDetails['po-b'],
      status: 'Confirmed',
      updatedAt: '2026-06-02T10:00:00',
    })
    getPurchaseList
      .mockResolvedValueOnce({ items: purchaseOrders, totalCount: purchaseOrders.length })
      .mockRejectedValueOnce(new Error('purchase list refresh unavailable'))
    const wrapper = mountPurchaseBoard()
    await flushPromises()

    await wrapper.findAll('[role="option"]')[1].trigger('click')
    await flushPromises()

    await wrapper.get('.act-confirm').trigger('click')
    await flushPromises()

    expect(confirmPurchaseOrder).toHaveBeenCalledWith('po-b')
    expect(wrapper.get('.detail-header .tag').text()).toBe('已确认')
    const alert = wrapper.get('[role="alert"]')
    expect(alert.text()).toContain('采购订单列表刷新失败')
    expect(alert.text()).toContain('purchase list refresh unavailable')
  })

  it('keeps create dialog open when create api fails', async () => {
    getPurchaseList.mockResolvedValueOnce({ items: [...purchaseOrders], totalCount: purchaseOrders.length })
    createPurchaseOrder.mockRejectedValueOnce(new Error('supplier master data missing'))
    const wrapper = mountPurchaseBoard()
    await flushPromises()

    await wrapper.get('.btn-add').trigger('click')
    await flushPromises()
    const inputs = wrapper.findAll('.modal-content .form-input')
    await inputs[0].setValue('PO-20260603')
    await inputs[1].setValue('西南锻造厂')
    await wrapper.get('.modal-content .btn-ok').trigger('click')
    await flushPromises()

    expect(createPurchaseOrder).toHaveBeenCalledWith(expect.objectContaining({
      orderNumber: 'PO-20260603',
      supplierName: '西南锻造厂',
    }))
    expect(wrapper.find('.modal-content').exists()).toBe(true)
    expect(wrapper.findAll('[role="option"]')).toHaveLength(2)
    expect(wrapper.text()).not.toContain('PO-20260603')
    const alert = wrapper.get('[role="alert"]')
    expect(alert.text()).toContain('创建失败：supplier master data missing')
  })

  it('keeps draft purchase order state when submit api fails', async () => {
    const draftOrder: PurchaseOrderSummary = {
      id: 'po-draft',
      orderNumber: 'PO-20260600',
      supplierName: '北方紧固件厂',
      status: 'Draft',
      orderDate: '2026-06-01T00:00:00',
      expectedDeliveryDate: '2026-06-09',
      totalAmount: 32000,
      itemCount: 1,
      createdBy: 'operator1',
      createdAt: '2026-06-01T00:00:00',
    }
    const draftDetail: PurchaseOrderDetail = {
      ...draftOrder,
      supplierContact: null,
      completedDate: null,
      remark: null,
      updatedAt: null,
      items: [],
    }
    getPurchaseList.mockResolvedValueOnce({ items: [draftOrder], totalCount: 1 })
    getPurchaseById.mockResolvedValueOnce(draftDetail)
    submitPurchaseOrder.mockRejectedValueOnce(new Error('supplier onboarding incomplete'))
    const wrapper = mountPurchaseBoard()
    await flushPromises()

    await wrapper.findAll('[role="option"]')[0].trigger('click')
    await flushPromises()

    await wrapper.get('.act-submit').trigger('click')
    await flushPromises()

    expect(submitPurchaseOrder).toHaveBeenCalledWith('po-draft')
    expect(wrapper.get('.detail-header .tag').text()).toBe('草稿')
    const activeOrderTags = wrapper.findAll('[role="option"]')[0].findAll('.tag')
    expect(activeOrderTags[1].text()).toBe('草稿')
    expect(wrapper.find('.act-submit').exists()).toBe(true)
    const alert = wrapper.get('[role="alert"]')
    expect(alert.text()).toContain('提交失败：supplier onboarding incomplete')
  })

  it('keeps submitted purchase order state when confirmation api fails', async () => {
    confirmPurchaseOrder.mockRejectedValueOnce(new Error('supplier credit hold'))
    const wrapper = mountPurchaseBoard()
    await flushPromises()

    await wrapper.findAll('[role="option"]')[1].trigger('click')
    await flushPromises()

    await wrapper.get('.act-confirm').trigger('click')
    await flushPromises()

    expect(confirmPurchaseOrder).toHaveBeenCalledWith('po-b')
    expect(wrapper.get('.detail-header .tag').text()).toBe('已提交')
    const activeOrderTags = wrapper.findAll('[role="option"]')[1].findAll('.tag')
    expect(activeOrderTags[1].text()).toBe('已提交')
    expect(wrapper.find('.act-confirm').exists()).toBe(true)
    const alert = wrapper.get('[role="alert"]')
    expect(alert.text()).toContain('确认失败：supplier credit hold')
  })

  it('keeps the purchase order active when cancellation api fails', async () => {
    cancelPurchaseOrder.mockRejectedValueOnce(new Error('供应商已发运，禁止取消'))
    const wrapper = mountPurchaseBoard()
    await flushPromises()

    await wrapper.findAll('[role="option"]')[0].trigger('click')
    await flushPromises()

    await wrapper.get('.act-cancel').trigger('click')
    await flushPromises()

    expect(cancelPurchaseOrder).toHaveBeenCalledWith('po-a')
    expect(wrapper.get('.detail-header .tag').text()).toBe('已确认')
    const activeOrderTags = wrapper.findAll('[role="option"]')[0].findAll('.tag')
    expect(activeOrderTags[1].text()).toBe('已确认')
    expect(wrapper.find('.act-cancel').exists()).toBe(true)
    const alert = wrapper.get('[role="alert"]')
    expect(alert.text()).toContain('取消失败：供应商已发运，禁止取消')
  })

  it('keeps the receive dialog open when receive api fails', async () => {
    const detailWithPendingItem: PurchaseOrderDetail = {
      ...purchaseDetails['po-a'],
      items: [
        {
          id: 'line-a',
          materialCode: 'MAT-A01',
          materialName: '轴承钢圈',
          unit: '个',
          quantity: 2000,
          receivedQuantity: 0,
          unitPrice: 15,
          totalPrice: 30000,
          expectedDate: '2026-06-10',
          remark: null,
        },
      ],
    }
    getPurchaseById.mockImplementation((id: string) => Promise.resolve(id === 'po-a' ? detailWithPendingItem : purchaseDetails[id]))
    receivePurchaseOrder.mockRejectedValueOnce(new Error('收货数量超过剩余未收数量'))
    const wrapper = mountPurchaseBoard()
    await flushPromises()

    await wrapper.findAll('[role="option"]')[0].trigger('click')
    await flushPromises()

    await wrapper.get('.act-receive').trigger('click')
    await wrapper.get('.modal-content select').setValue('MAT-A01')
    await wrapper.get('.modal-content input[type="number"]').setValue(2500)
    await wrapper.get('.modal-content .btn-ok').trigger('click')
    await flushPromises()

    expect(receivePurchaseOrder).toHaveBeenCalledWith('po-a', { materialCode: 'MAT-A01', quantity: 2500 })
    expect(wrapper.find('.modal-content').exists()).toBe(true)
    expect(wrapper.get('.detail-header .tag').text()).toBe('已确认')
    expect(wrapper.get('.items-table tbody').text()).toContain('0')
    const alert = wrapper.get('[role="alert"]')
    expect(alert.text()).toContain('收货失败：收货数量超过剩余未收数量')
  })

  it('keeps supply risk open when alternate supplier commitment cannot be audited', async () => {
    writeSupplyRiskEscalation.mockImplementationOnce(() => {
      throw new Error('supply risk audit storage unavailable')
    })
    const wrapper = mountPurchaseBoard()
    await flushPromises()

    await wrapper.get('.supply-commit').trigger('click')
    await flushPromises()

    expect(writeSupplyRiskEscalation).toHaveBeenCalledWith(expect.objectContaining({
      decision: 'alternate_committed',
      traceId: 'TRACE-PUR-MAT-B02-ALT-SUPPLIER-COMMITTED',
    }))
    expect(wrapper.get('.supply-risk-heading .risk-badge').text()).toBe('待识别')
    expect(wrapper.get('.supply-risk-trace').classes()).toContain('empty')
    expect(wrapper.find('.supply-receive').exists()).toBe(false)
    const alert = wrapper.get('[role="alert"]')
    expect(alert.text()).toContain('替代供应商锁定失败')
    expect(alert.text()).toContain('supply risk audit storage unavailable')
  })

  it('keeps supply risk open when escalation cannot be audited', async () => {
    writeSupplyRiskEscalation.mockImplementationOnce(() => {
      throw new Error('supply risk escalation storage unavailable')
    })
    const wrapper = mountPurchaseBoard()
    await flushPromises()

    await wrapper.get('.supply-escalate').trigger('click')
    await flushPromises()

    expect(writeSupplyRiskEscalation).toHaveBeenCalledWith(expect.objectContaining({
      decision: 'escalated',
      traceId: 'TRACE-PUR-MAT-B02-SUPPLY-RISK-ESCALATED',
    }))
    expect(wrapper.get('.supply-risk-heading .risk-badge').text()).toBe('待识别')
    expect(wrapper.get('.supply-risk-trace').classes()).toContain('empty')
    const alert = wrapper.get('[role="alert"]')
    expect(alert.text()).toContain('供应风险升级失败')
    expect(alert.text()).toContain('supply risk escalation storage unavailable')
  })

  it('keeps alternate supplier committed when receipt cannot be audited', async () => {
    writeSupplyRiskEscalation
      .mockImplementationOnce(record => record)
      .mockImplementationOnce(() => {
        throw new Error('alternate receipt audit storage unavailable')
      })
    const wrapper = mountPurchaseBoard()
    await flushPromises()

    await wrapper.get('.supply-commit').trigger('click')
    await flushPromises()

    expect(wrapper.get('.supply-risk-heading .risk-badge').text()).toBe('替代已锁定')
    await wrapper.get('.supply-receive').trigger('click')
    await flushPromises()

    expect(writeSupplyRiskEscalation).toHaveBeenLastCalledWith(expect.objectContaining({
      decision: 'alternate_received',
      receiptTraceId: 'TRACE-PUR-MAT-B02-ALT-SUPPLIER-RECEIVED',
    }))
    expect(wrapper.get('.supply-risk-heading .risk-badge').text()).toBe('替代已锁定')
    expect(wrapper.get('.supply-risk-trace strong').text()).toBe('替代供应商已锁定')
    const alert = wrapper.get('[role="alert"]')
    expect(alert.text()).toContain('替代供应商到货确认失败')
    expect(alert.text()).toContain('alternate receipt audit storage unavailable')
  })

  it('keeps supplier network decision pending when SLA decision cannot be audited', async () => {
    writeSupplierNetworkDecision.mockImplementationOnce(() => {
      throw new Error('supplier network audit storage unavailable')
    })
    const wrapper = mountPurchaseBoard()
    await flushPromises()

    await wrapper.get('.supplier-network-commit').trigger('click')
    await flushPromises()

    expect(writeSupplierNetworkDecision).toHaveBeenCalledWith(expect.objectContaining({
      selectedSupplierName: '华东快供二厂',
      traceId: 'TRACE-PUR-MAT-B02-SUPPLIER-NETWORK-SLA',
    }))
    expect(wrapper.get('.supplier-network-heading .risk-badge').text()).toBe('待决策')
    expect(wrapper.find('.supplier-network-trace').exists()).toBe(false)
    const alert = wrapper.get('[role="alert"]')
    expect(alert.text()).toContain('供应网络选优失败')
    expect(alert.text()).toContain('supplier network audit storage unavailable')
  })

  it('writes supplier network SLA decision and OTD evidence after supplier selection succeeds', async () => {
    const wrapper = mountPurchaseBoard()
    await flushPromises()

    await wrapper.get('.supplier-network-commit').trigger('click')
    await flushPromises()

    expect(writeSupplierNetworkDecision).toHaveBeenCalledWith(expect.objectContaining({
      materialCode: 'MAT-B02',
      selectedSupplierName: '华东快供二厂',
      selectedPerformanceScore: 92,
      selectedOnTimeRate: 96,
      selectedCapacityQuantity: 180,
      statusLabel: '供应网络已选优',
      auditId: 'AUD-PUR-SUPPLIER-NETWORK-20260521-001',
      traceId: 'TRACE-PUR-MAT-B02-SUPPLIER-NETWORK-SLA',
    }))
    expect(upsertOtdEvidenceChainRecord).toHaveBeenCalledWith(expect.objectContaining({
      id: 'supplier-network-MAT-B02',
      stage: '供应网络',
      title: 'MAT-B02 供应商绩效与 SLA 选优已确认',
      object: 'WO-DEMO-1002 / WO-DEMO-1005',
      source: '采购协同 / 供应网络治理',
      traceId: 'TRACE-PUR-MAT-B02-SUPPLIER-NETWORK-SLA',
      status: 'closed',
      statusLabel: '供应网络已选优',
    }))
    expect(wrapper.get('.supplier-network-heading .risk-badge').text()).toBe('已选优')
    expect(wrapper.get('.supplier-network-trace strong').text()).toBe('供应网络已选优')
    expect(wrapper.get('.supplier-network-trace code').text()).toBe('TRACE-PUR-MAT-B02-SUPPLIER-NETWORK-SLA')
  })

  it('locks supplier network SLA decision after selection succeeds so duplicate evidence is not written', async () => {
    const wrapper = mountPurchaseBoard()
    await flushPromises()

    await wrapper.get('.supplier-network-commit').trigger('click')
    await flushPromises()

    expect(wrapper.get<HTMLButtonElement>('.supplier-network-commit').element.disabled).toBe(true)

    await wrapper.get('.supplier-network-commit').trigger('click')
    await flushPromises()

    expect(writeSupplierNetworkDecision).toHaveBeenCalledTimes(1)
    expect(upsertOtdEvidenceChainRecord).toHaveBeenCalledTimes(1)
    expect(wrapper.get('.supplier-network-heading .risk-badge').text()).toBe('已选优')
    expect(wrapper.get('.supplier-network-trace code').text()).toBe('TRACE-PUR-MAT-B02-SUPPLIER-NETWORK-SLA')
  })

  it('keeps material supplier correction pending when audit write fails', async () => {
    readAnomalyDispatchRecordByType.mockReturnValue({
      id: 'dispatch-material-01',
      anomalyId: 'anom-material-01',
      type: 'material',
      typeLabel: '来料异常',
      title: '来料批次硬度异常',
      workOrderNumber: 'WO-RUSH-9001',
      operationCode: 'OP-020',
      route: '采购整改',
      owner: '采购 王工',
      dueAt: '2026-05-21 16:00',
      affectedOrders: 'WO-RUSH-9001 / WO-DEMO-1002',
      deliveryImpact: '影响今日夜班齐套',
      scheduleWindow: '今日 16:00 复检前',
      suggestedAction: '锁定供应商 8D 与备用批次',
      auditId: 'AUD-ANOM-MATERIAL-20260521-001',
      traceId: 'TRACE-ANOM-MATERIAL-20260521-001',
      status: 'routed',
      statusLabel: '已分流',
      createdAt: '2026-05-21T08:00:00.000Z',
      summary: '来料异常已分流采购整改。',
    })
    readAnomalyDispatchRecordByTypeBackendFirst.mockResolvedValueOnce(readAnomalyDispatchRecordByType())
    writeSupplyRiskEscalation.mockImplementationOnce(() => {
      throw new Error('material supplier correction audit unavailable')
    })
    const wrapper = mountPurchaseBoard()
    await flushPromises()

    await wrapper.get('.material-corrective').trigger('click')
    await flushPromises()

    expect(writeSupplyRiskEscalation).toHaveBeenCalledWith(expect.objectContaining({
      decision: 'alternate_committed',
      traceId: 'TRACE-ANOM-MATERIAL-20260521-001',
    }))
    expect(wrapper.get('.supply-risk-heading .risk-badge').text()).toBe('待识别')
    expect(wrapper.get('.supply-risk-trace').classes()).toContain('empty')
    const alert = wrapper.get('[role="alert"]')
    expect(alert.text()).toContain('供应商整改承诺锁定失败')
    expect(alert.text()).toContain('material supplier correction audit unavailable')
  })

  it('creates a local expedited shortage order when backend creation is unavailable', async () => {
    createPurchaseOrder.mockRejectedValueOnce(new Error('purchase create temporarily unavailable'))
    const wrapper = mountPurchaseBoard()
    await flushPromises()

    await wrapper.get('.shortage-actions .primary').trigger('click')
    await flushPromises()

    expect(createPurchaseOrder).toHaveBeenCalledWith(expect.objectContaining({
      supplierName: '华东铝材快供',
      supplierContact: '应急采购专员',
      createdBy: 'scheduler-agent',
      items: [expect.objectContaining({
        materialCode: 'M-AL-6061',
        quantity: 12,
        unitPrice: 128,
      })],
    }))
    expect(wrapper.get('.detail-header h3').text()).toContain('PO-RUSH-')
    expect(wrapper.get('.detail-header .tag').text()).toBe('已确认')
    expect(wrapper.get('.shortage-header .risk-badge').text()).toBe('已加急')
    expect(wrapper.get('.shortage-trace strong').text()).toBe('已生成采购加急单')
    expect(wrapper.text()).toContain('M-AL-6061')
    expect(wrapper.find('[role="alert"]').exists()).toBe(false)
  })

  it('locks material supplier correction and records OTD evidence after anomaly dispatch succeeds', async () => {
    readAnomalyDispatchRecordByType.mockReturnValue({
      id: 'dispatch-material-01',
      anomalyId: 'anom-material-01',
      type: 'material',
      typeLabel: '来料异常',
      title: '来料批次硬度异常',
      workOrderNumber: 'WO-RUSH-9001',
      operationCode: 'OP-020',
      route: '采购整改',
      owner: '采购 王工',
      dueAt: '2026-05-21 16:00',
      affectedOrders: 'WO-RUSH-9001 / WO-DEMO-1002',
      deliveryImpact: '影响今日夜班齐套',
      scheduleWindow: '今日 16:00 复检前',
      suggestedAction: '锁定供应商 8D 与备用批次',
      auditId: 'AUD-ANOM-MATERIAL-20260521-001',
      traceId: 'TRACE-ANOM-MATERIAL-20260521-001',
      status: 'routed',
      statusLabel: '已分流',
      createdAt: '2026-05-21T08:00:00.000Z',
      summary: '来料异常已分流采购整改。',
    })
    readAnomalyDispatchRecordByTypeBackendFirst.mockResolvedValueOnce(readAnomalyDispatchRecordByType())
    const wrapper = mountPurchaseBoard()
    await flushPromises()

    await wrapper.get('.material-corrective').trigger('click')
    await flushPromises()

    expect(writeSupplyRiskEscalation).toHaveBeenCalledWith(expect.objectContaining({
      purchaseOrderNumber: 'PO-MAT-BATCH-20260521',
      materialCode: 'LH-202605',
      decision: 'alternate_committed',
      statusLabel: '整改已锁定',
      auditId: 'AUD-ANOM-MATERIAL-20260521-001',
      traceId: 'TRACE-ANOM-MATERIAL-20260521-001',
    }))
    expect(upsertOtdEvidenceChainRecord).toHaveBeenCalledWith(expect.objectContaining({
      id: 'purchase-material-correction-anom-material-01',
      stage: '采购整改',
      title: '来料批次硬度异常供应商整改承诺已锁定',
      object: 'WO-RUSH-9001 / WO-DEMO-1002',
      source: '采购协同 / 采购 王工',
      traceId: 'TRACE-ANOM-MATERIAL-20260521-001',
      status: 'active',
      statusLabel: '整改已锁定',
    }))
    expect(wrapper.get('.supply-risk-heading .risk-badge').text()).toBe('替代已锁定')
    expect(wrapper.get('.supply-risk-trace strong').text()).toBe('来料异常整改承诺已锁定')
    expect(wrapper.get('.supply-risk-trace p').text()).toContain('备用批次 LH-202604B 今日 16:00 前复检入库')
    expect(wrapper.get('.supply-risk-trace code').text()).toBe('TRACE-ANOM-MATERIAL-20260521-001')
    expect(wrapper.find('[role="alert"]').exists()).toBe(false)
  })

  it('keeps expedited shortage ordered when receipt evidence cannot be audited', async () => {
    const rushDetail: PurchaseOrderDetail = {
      id: 'po-rush-al6061',
      orderNumber: 'PO-RUSH-AL6061-20260520',
      supplierName: '华东铝材快供',
      supplierContact: '王工',
      status: 'Confirmed',
      orderDate: '2026-05-20T08:00:00.000Z',
      expectedDeliveryDate: '2026-05-20',
      completedDate: null,
      totalAmount: 1536,
      remark: '排产缺料加急',
      createdBy: '采购 王工',
      createdAt: '2026-05-20T08:00:00.000Z',
      updatedAt: '2026-05-20T08:00:00.000Z',
      items: [{
        id: 'rush-line-0',
        materialCode: 'M-AL-6061',
        materialName: '铝合金 6061',
        unit: '件',
        quantity: 12,
        receivedQuantity: 0,
        unitPrice: 128,
        totalPrice: 1536,
        expectedDate: '2026-05-20',
        remark: '排产缺料加急',
      }],
    }
    createPurchaseOrder.mockResolvedValueOnce(rushDetail)
    receivePurchaseOrder.mockResolvedValueOnce({
      ...rushDetail,
      status: 'Completed',
      completedDate: '2026-05-20T10:00:00.000Z',
      items: rushDetail.items.map(item => ({ ...item, receivedQuantity: item.quantity })),
    })
    writeShortageRiskResolution.mockImplementationOnce(() => {
      throw new Error('shortage receipt audit unavailable')
    })
    const wrapper = mountPurchaseBoard()
    await flushPromises()

    await wrapper.get('.shortage-actions .primary').trigger('click')
    await flushPromises()
    expect(wrapper.get('.shortage-header .risk-badge').text()).toBe('已加急')

    await wrapper.get('.shortage-actions .receive').trigger('click')
    await flushPromises()

    expect(writeShortageRiskResolution).toHaveBeenCalledWith(expect.objectContaining({
      materialCode: 'M-AL-6061',
      sourceOrderNumber: 'PO-RUSH-AL6061-20260520',
    }))
    expect(wrapper.get('.shortage-header .risk-badge').text()).toBe('已加急')
    expect(wrapper.get('.shortage-trace strong').text()).toBe('已生成采购加急单')
    const alert = wrapper.get('[role="alert"]')
    expect(alert.text()).toContain('采购加急收货回写失败')
    expect(alert.text()).toContain('shortage receipt audit unavailable')
  })

  it('closes expedited shortage risk and appends assistant recovery evidence after receipt succeeds', async () => {
    const rushDetail: PurchaseOrderDetail = {
      id: 'po-rush-al6061',
      orderNumber: 'PO-RUSH-AL6061-20260520',
      supplierName: '华东铝材快供',
      supplierContact: '王工',
      status: 'Confirmed',
      orderDate: '2026-05-20T08:00:00.000Z',
      expectedDeliveryDate: '2026-05-20',
      completedDate: null,
      totalAmount: 1536,
      remark: '排产缺料加急',
      createdBy: '采购 王工',
      createdAt: '2026-05-20T08:00:00.000Z',
      updatedAt: '2026-05-20T08:00:00.000Z',
      items: [{
        id: 'rush-line-0',
        materialCode: 'M-AL-6061',
        materialName: '铝合金 6061',
        unit: '件',
        quantity: 12,
        receivedQuantity: 0,
        unitPrice: 128,
        totalPrice: 1536,
        expectedDate: '2026-05-20',
        remark: '排产缺料加急',
      }],
    }
    createPurchaseOrder.mockResolvedValueOnce(rushDetail)
    receivePurchaseOrder.mockResolvedValueOnce({
      ...rushDetail,
      status: 'Completed',
      completedDate: '2026-05-20T10:00:00.000Z',
      items: rushDetail.items.map(item => ({ ...item, receivedQuantity: item.quantity })),
    })
    readAssistantRecoveryPackagesBackendFirst.mockResolvedValueOnce([{
      id: 'assistant-recovery-rush-9001',
      workOrders: ['WO-RUSH-9001'],
      purchaseActionStatus: 'open',
    }])
    closeAssistantRecoveryPurchaseAction.mockReturnValueOnce({
      purchaseActionSummary: '助手闭环：采购动作已关闭，AI 排产可恢复。',
    })
    const wrapper = mountPurchaseBoard()
    await flushPromises()

    await wrapper.get('.shortage-actions .primary').trigger('click')
    await flushPromises()
    await wrapper.get('.shortage-actions .receive').trigger('click')
    await flushPromises()

    expect(receivePurchaseOrder).toHaveBeenCalledWith('po-rush-al6061', {
      materialCode: 'M-AL-6061',
      quantity: 12,
    })
    expect(writeShortageRiskResolution).toHaveBeenCalledWith(expect.objectContaining({
      materialCode: 'M-AL-6061',
      sourceOrderNumber: 'PO-RUSH-AL6061-20260520',
      receivedQuantity: 12,
      availableQuantity: 12,
      message: 'M-AL-6061 加急收货完成，缺口清零，排产缺料风险从高风险降为可执行。',
    }))
    expect(upsertOtdEvidenceChainRecord).toHaveBeenCalledWith(expect.objectContaining({
      id: 'purchase-receipt-PO-RUSH-AL6061-20260520',
      stage: '采购回写',
      title: 'M-AL-6061 加急采购收货已释放缺料风险',
      object: 'WO-RUSH-9001 / WO-DEMO-1002',
      source: '采购协同 / 华东铝材快供',
      traceId: 'PO-RUSH-AL6061-20260520',
      status: 'closed',
      statusLabel: '已收货',
    }))
    expect(closeAssistantRecoveryPurchaseAction).toHaveBeenCalledWith(
      'assistant-recovery-rush-9001',
      '采购 王工',
      'PO-RUSH-AL6061-20260520',
    )
    expect(wrapper.get('.shortage-header .risk-badge').text()).toBe('风险下降')
    expect(wrapper.get('.shortage-card.danger strong').text()).toBe('0 件')
    expect(wrapper.get('.shortage-card.danger em').text()).toBe('当前可用 12 件')
    expect(wrapper.get('.shortage-trace strong').text()).toBe('采购收货已回写风险')
    expect(wrapper.get('.shortage-trace p').text()).toContain('缺口清零，排产缺料风险从高风险降为可执行')
    expect(wrapper.get('.shortage-trace p').text()).toContain('助手闭环：采购动作已关闭')
    expect(wrapper.find('[role="alert"]').exists()).toBe(false)
  })

  it('keeps expedited receipt closed when assistant recovery package lookup fails', async () => {
    const rushDetail: PurchaseOrderDetail = {
      id: 'po-rush-al6061',
      orderNumber: 'PO-RUSH-AL6061-20260520',
      supplierName: '华东铝材快供',
      supplierContact: '王工',
      status: 'Confirmed',
      orderDate: '2026-05-20T08:00:00.000Z',
      expectedDeliveryDate: '2026-05-20',
      completedDate: null,
      totalAmount: 1536,
      remark: '排产缺料加急',
      createdBy: '采购 王工',
      createdAt: '2026-05-20T08:00:00.000Z',
      updatedAt: '2026-05-20T08:00:00.000Z',
      items: [{
        id: 'rush-line-0',
        materialCode: 'M-AL-6061',
        materialName: '铝合金 6061',
        unit: '件',
        quantity: 12,
        receivedQuantity: 0,
        unitPrice: 128,
        totalPrice: 1536,
        expectedDate: '2026-05-20',
        remark: '排产缺料加急',
      }],
    }
    createPurchaseOrder.mockResolvedValueOnce(rushDetail)
    receivePurchaseOrder.mockResolvedValueOnce({
      ...rushDetail,
      status: 'Completed',
      completedDate: '2026-05-20T10:00:00.000Z',
      items: rushDetail.items.map(item => ({ ...item, receivedQuantity: item.quantity })),
    })
    readAssistantRecoveryPackagesBackendFirst.mockRejectedValueOnce(new Error('assistant recovery backend unavailable'))
    const wrapper = mountPurchaseBoard()
    await flushPromises()

    await wrapper.get('.shortage-actions .primary').trigger('click')
    await flushPromises()
    await wrapper.get('.shortage-actions .receive').trigger('click')
    await flushPromises()

    expect(writeShortageRiskResolution).toHaveBeenCalledWith(expect.objectContaining({
      materialCode: 'M-AL-6061',
      sourceOrderNumber: 'PO-RUSH-AL6061-20260520',
    }))
    expect(upsertOtdEvidenceChainRecord).toHaveBeenCalledWith(expect.objectContaining({
      id: 'purchase-receipt-PO-RUSH-AL6061-20260520',
      status: 'closed',
      statusLabel: '已收货',
    }))
    expect(closeAssistantRecoveryPurchaseAction).not.toHaveBeenCalled()
    expect(wrapper.get('.shortage-header .risk-badge').text()).toBe('风险下降')
    expect(wrapper.get('.shortage-card.danger strong').text()).toBe('0 件')
    expect(wrapper.get('.shortage-trace strong').text()).toBe('采购收货已回写风险')
    const alert = wrapper.get('[role="alert"]')
    expect(alert.text()).toContain('采购收货已回写风险，但 AI 助手采购动作闭环失败')
    expect(alert.text()).toContain('assistant recovery backend unavailable')
  })

  it('keeps outsourcing commitment awaiting receipt when arrival evidence cannot be audited', async () => {
    const commitment = makeOutsourcingCommitment()
    readLatestOutsourcingCommitmentPackage.mockReturnValue(commitment)
    readLatestOutsourcingCommitmentPackageBackendFirst.mockResolvedValueOnce(commitment)
    confirmOutsourcingCommitmentArrival.mockImplementationOnce(() => {
      throw new Error('outsourcing receipt audit unavailable')
    })
    const wrapper = mountPurchaseBoard()
    await flushPromises()

    await wrapper.get('.outsourcing-receive').trigger('click')
    await flushPromises()

    expect(confirmOutsourcingCommitmentArrival).toHaveBeenCalledWith('product-flange', '采购 王工')
    expect(wrapper.get('.outsourcing-receipt-heading .risk-badge').text()).toBe('外协承诺待到货')
    expect(wrapper.get('.outsourcing-receipt-trace strong').text()).toBe('等待采购确认到货')
    const alert = wrapper.get('[role="alert"]')
    expect(alert.text()).toContain('外协到货确认失败')
    expect(alert.text()).toContain('outsourcing receipt audit unavailable')
  })

  it('marks outsourcing commitment as received and prevents duplicate arrival confirmation', async () => {
    const commitment = makeOutsourcingCommitment()
    const receivedCommitment = {
      ...commitment,
      statusLabel: '外协到货已确认',
      receivedAt: '2026-05-24T10:00:00.000Z',
      receivedBy: '采购 王工',
      receiptAuditId: 'AUD-OUTSOURCING-RECEIPT-FLANGE-20260521-001',
      receiptTraceId: 'TRACE-OUTSOURCING-FLANGE-RECEIPT-20260521',
      receiptMessage: '法兰盘外协到货已确认，等待调度员释放排产窗口。',
    }
    readLatestOutsourcingCommitmentPackage.mockReturnValue(commitment)
    readLatestOutsourcingCommitmentPackageBackendFirst.mockResolvedValueOnce(commitment)
    confirmOutsourcingCommitmentArrival.mockReturnValueOnce(receivedCommitment)
    const wrapper = mountPurchaseBoard()
    await flushPromises()

    await wrapper.get('.outsourcing-receive').trigger('click')
    await flushPromises()

    expect(confirmOutsourcingCommitmentArrival).toHaveBeenCalledWith('product-flange', '采购 王工')
    expect(wrapper.get('.outsourcing-receipt-heading .risk-badge').text()).toBe('外协到货已确认')
    expect(wrapper.get('.outsourcing-receipt-trace strong').text()).toBe('外协到货已确认')
    expect(wrapper.get('.outsourcing-receipt-trace p').text()).toContain('等待调度员释放排产窗口')
    expect(wrapper.get('.outsourcing-receipt-trace code').text()).toBe('TRACE-OUTSOURCING-FLANGE-RECEIPT-20260521')
    expect(wrapper.get<HTMLButtonElement>('.outsourcing-receive').element.disabled).toBe(true)
  })
})
