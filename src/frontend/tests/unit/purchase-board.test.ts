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
const readAnomalyDispatchRecordByType = vi.hoisted(() => vi.fn())
const readAnomalyDispatchRecordByTypeBackendFirst = vi.hoisted(() => vi.fn())
const confirmOutsourcingCommitmentArrival = vi.hoisted(() => vi.fn())
const readLatestOutsourcingCommitmentPackage = vi.hoisted(() => vi.fn())
const readLatestOutsourcingCommitmentPackageBackendFirst = vi.hoisted(() => vi.fn())

vi.mock('vue-router', () => ({
  useRoute: () => ({ query: {} }),
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
  exportToCsv: vi.fn(),
}))

vi.mock('../../src/utils/date', () => ({
  formatDate: (value: string | null | undefined) => value ?? '-',
}))

vi.mock('../../src/utils/shortage-risk-sync', () => ({
  readSupplierNetworkDecision: vi.fn(() => null),
  readSupplierNetworkDecisionBackendFirst: vi.fn(async () => null),
  readSupplyRiskEscalationBackendFirst: vi.fn(async () => null),
  writeShortageRiskResolution,
  writeSupplierNetworkDecision,
  writeSupplyRiskEscalation,
}))

vi.mock('../../src/utils/otd-evidence-chain-sync', () => ({
  closeOtdEvidenceChainRecords: vi.fn(),
  upsertOtdEvidenceChainRecord: vi.fn(),
}))

vi.mock('../../src/utils/anomaly-dispatch-sync', () => ({
  readAnomalyDispatchRecordByType,
  readAnomalyDispatchRecordByTypeBackendFirst,
}))

vi.mock('../../src/utils/assistant-action-package-sync', () => ({
  closeAssistantRecoveryPurchaseAction: vi.fn(() => null),
  readAssistantRecoveryPackagesBackendFirst: vi.fn(async () => []),
}))

vi.mock('../../src/utils/outsourcing-commitment-sync', () => ({
  confirmOutsourcingCommitmentArrival,
  readLatestOutsourcingCommitmentPackage,
  readLatestOutsourcingCommitmentPackageBackendFirst,
}))

function mountPurchaseBoard() {
  return mount(PurchaseBoard)
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

describe('PurchaseBoard', () => {
  beforeEach(() => {
    vi.clearAllMocks()
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

  it('announces when the initial purchase list load falls back to demo data', async () => {
    getPurchaseList.mockRejectedValueOnce(new Error('purchase list API unavailable'))
    const wrapper = mountPurchaseBoard()
    await flushPromises()

    expect(wrapper.findAll('[role="option"]').length).toBeGreaterThan(0)
    const alert = wrapper.get('[role="alert"]')
    expect(alert.text()).toContain('采购订单列表加载失败')
    expect(alert.text()).toContain('purchase list API unavailable')
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

  it('keeps outsourcing commitment awaiting receipt when arrival evidence cannot be audited', async () => {
    const commitment = {
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
})
