import { flushPromises, mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import InventoryBoard from '../../src/components/inventory/InventoryBoard.vue'
import type { InventoryDashboard, InventoryItem, StockTransaction } from '../../src/types/inventory'

const getInventoryDashboard = vi.hoisted(() => vi.fn())
const getInventoryList = vi.hoisted(() => vi.fn())
const getStockTransactions = vi.hoisted(() => vi.fn())
const stockIn = vi.hoisted(() => vi.fn())
const stockOut = vi.hoisted(() => vi.fn())
const transferStock = vi.hoisted(() => vi.fn())
const adjustStock = vi.hoisted(() => vi.fn())
const exportToCsv = vi.hoisted(() => vi.fn())
const isOfflineDemoError = vi.hoisted(() =>
  vi.fn((error: unknown) => error instanceof Error && error.name === 'OfflineDemoApiError'),
)

vi.mock('../../src/api/inventory', () => ({
  adjustStock,
  getInventoryDashboard,
  getInventoryList,
  getStockTransactions,
  stockIn,
  stockOut,
  transferStock,
}))

vi.mock('../../src/utils/export', () => ({
  exportToCsv,
}))

vi.mock('../../src/utils/offline-demo-mode', () => ({
  isOfflineDemoError,
}))

const dashboard: InventoryDashboard = {
  lowStockCount: 1,
  outOfStockCount: 0,
  todayTransactions: 2,
  totalMaterials: 2,
}

const inventoryItems: InventoryItem[] = [
  {
    id: 'mat-a',
    availableQuantity: 120,
    createdAt: '2026-01-01T00:00:00',
    expiryDate: null,
    materialCode: 'MAT-A01',
    materialName: '轴承钢圈',
    materialType: 'Raw',
    realQuantity: 100,
    reservedQuantity: 20,
    safetyStock: 50,
    storageLocation: 'A-01-01',
    unit: '个',
  },
  {
    id: 'mat-b',
    availableQuantity: 40,
    createdAt: '2026-01-01T00:00:00',
    expiryDate: null,
    materialCode: 'MAT-B02',
    materialName: '花键套',
    materialType: 'Semi',
    realQuantity: 30,
    reservedQuantity: 10,
    safetyStock: 80,
    storageLocation: 'B-01-01',
    unit: '个',
  },
]

const transactions: StockTransaction[] = [
  {
    id: 'tx-b',
    balanceAfter: 30,
    balanceBefore: 40,
    createdAt: '2026-05-12T08:30:00',
    materialCode: 'MAT-B02',
    materialName: '花键套',
    operator: 'operator1',
    quantity: 10,
    referenceNumber: 'WO-20260501',
    referenceType: 'WorkOrder',
    remark: '生产领料',
    transactionType: 'StockOut',
    warehouse: null,
  },
]

function mountInventoryBoard(options: { attachTo?: HTMLElement } = {}) {
  return mount(InventoryBoard, {
    attachTo: options.attachTo,
    global: {
      stubs: {
        KittingClosurePanel: true,
      },
    },
  })
}

describe('InventoryBoard', () => {
  beforeEach(() => {
    getInventoryDashboard.mockResolvedValue(dashboard)
    getInventoryList.mockResolvedValue(inventoryItems)
    getStockTransactions.mockResolvedValue(transactions)
    stockIn.mockResolvedValue(transactions[0])
    stockOut.mockResolvedValue(transactions[0])
    transferStock.mockResolvedValue(transactions[0])
    adjustStock.mockResolvedValue(transactions[0])
    exportToCsv.mockReset()
    isOfflineDemoError.mockImplementation(
      (error: unknown) => error instanceof Error && error.name === 'OfflineDemoApiError',
    )
  })

  it('lets keyboard users select inventory materials and exposes the active material state', async () => {
    const wrapper = mountInventoryBoard()
    await flushPromises()

    const listbox = wrapper.get('[role="listbox"]')
    expect(listbox.attributes('aria-label')).toBe('物料库存列表')

    const options = wrapper.findAll('[role="option"]')
    expect(options).toHaveLength(2)
    expect(options[1].attributes('tabindex')).toBe('0')
    expect(options[1].attributes('aria-selected')).toBe('false')

    await options[1].trigger('keydown.enter')
    await flushPromises()

    expect(getStockTransactions).toHaveBeenCalledWith('MAT-B02')
    expect(wrapper.get('.detail-header h3').text()).toBe('花键套')
    expect(wrapper.findAll('[role="option"]')[1].attributes('aria-selected')).toBe('true')
  })

  it('announces when the inventory list load falls back to demo data', async () => {
    getInventoryList.mockRejectedValueOnce(new Error('inventory list API unavailable'))
    const wrapper = mountInventoryBoard()
    await flushPromises()

    expect(wrapper.findAll('[role="option"]').length).toBeGreaterThan(0)
    const alert = wrapper.get('[role="alert"]')
    expect(alert.text()).toContain('库存列表加载失败')
    expect(alert.text()).toContain('inventory list API unavailable')
  })

  it('quietly shows demo inventory when offline demo skips the inventory list request', async () => {
    const offlineDemoError = new Error('Offline demo mode skipped backend request: /api/v1/inventory')
    offlineDemoError.name = 'OfflineDemoApiError'
    getInventoryList.mockRejectedValueOnce(offlineDemoError)

    const wrapper = mountInventoryBoard()
    await flushPromises()

    expect(wrapper.text()).toContain('MAT-A01')
    expect(wrapper.text()).toContain('轴承钢圈')
    expect(wrapper.find('[role="alert"]').exists()).toBe(false)
    expect(wrapper.text()).not.toContain('库存列表加载失败')
    expect(wrapper.text()).not.toContain('Offline demo mode skipped backend request')
  })

  it('announces when stock transactions fall back to demo records', async () => {
    getStockTransactions.mockRejectedValueOnce(new Error('stock transactions API unavailable'))
    const wrapper = mountInventoryBoard()
    await flushPromises()

    await wrapper.findAll('[role="option"]')[0].trigger('click')
    await flushPromises()

    expect(getStockTransactions).toHaveBeenCalledWith('MAT-A01')
    expect(wrapper.get('.tx-item').text()).toContain('采购入库')
    const alert = wrapper.get('[role="alert"]')
    expect(alert.text()).toContain('库存交易记录加载失败')
    expect(alert.text()).toContain('stock transactions API unavailable')
  })

  it('filters inventory by search text and material type without losing the empty state', async () => {
    const wrapper = mountInventoryBoard()
    await flushPromises()

    await wrapper.get('.search-input').setValue('花键')
    await flushPromises()

    expect(wrapper.findAll('[role="option"]')).toHaveLength(1)
    expect(wrapper.get('[role="option"]').text()).toContain('MAT-B02')

    await wrapper.get('.filter-select').setValue('Raw')
    await flushPromises()

    expect(wrapper.findAll('[role="option"]')).toHaveLength(0)
    expect(wrapper.get('.empty-state').text()).toContain('无匹配物料')
  })

  it('exports the current inventory list with the auditable stock fields', async () => {
    const wrapper = mountInventoryBoard()
    await flushPromises()

    await wrapper.get('.btn-export').trigger('click')

    expect(exportToCsv).toHaveBeenCalledWith(
      '库存物料列表',
      ['物料编码', '物料名称', '类型', '库存量', '已预占', '可用量', '安全库存', '库位', '单位'],
      [
        ['MAT-A01', '轴承钢圈', 'Raw', 120, 20, 100, 50, 'A-01-01', '个'],
        ['MAT-B02', '花键套', 'Semi', 40, 10, 30, 80, 'B-01-01', '个'],
      ],
    )
  })

  it('keeps the stock out dialog open and announces when the operation fails', async () => {
    stockOut.mockRejectedValueOnce(new Error('stock out API unavailable'))
    const wrapper = mountInventoryBoard()
    await flushPromises()

    await wrapper.findAll('[role="option"]')[1].trigger('click')
    await flushPromises()
    await wrapper.get('.btn-out').trigger('click')
    await wrapper.get('.btn-ok').trigger('click')
    await flushPromises()

    expect(stockOut).toHaveBeenCalledWith({
      materialCode: 'MAT-B02',
      quantity: 1,
      remark: undefined,
    })
    const dialog = wrapper.get('.modal-content')
    expect(dialog.text()).toContain('出库')
    const alert = dialog.get('[role="alert"]')
    expect(alert.text()).toContain('stock out API unavailable')
  })

  it('refreshes inventory data after successful stock in and transfer operations', async () => {
    getInventoryDashboard
      .mockResolvedValueOnce(dashboard)
      .mockResolvedValueOnce({ ...dashboard, todayTransactions: 3 })
      .mockResolvedValueOnce({ ...dashboard, todayTransactions: 4 })
    getInventoryList
      .mockResolvedValueOnce(inventoryItems)
      .mockResolvedValueOnce([{ ...inventoryItems[0], availableQuantity: 135, realQuantity: 115 }, inventoryItems[1]])
      .mockResolvedValueOnce([{ ...inventoryItems[0], storageLocation: 'B-02-02' }, inventoryItems[1]])
    const wrapper = mountInventoryBoard()
    await flushPromises()

    await wrapper.findAll('[role="option"]')[0].trigger('click')
    await flushPromises()

    await wrapper.get('.btn-in').trigger('click')
    let inputs = wrapper.findAll('.modal-content .form-input')
    await inputs[0].setValue('15')
    await inputs[1].setValue('主仓库')
    await inputs[2].setValue('采购补料')
    await wrapper.get('.btn-ok').trigger('click')
    await flushPromises()

    expect(stockIn).toHaveBeenCalledWith({
      materialCode: 'MAT-A01',
      quantity: 15,
      warehouse: '主仓库',
      remark: '采购补料',
    })
    expect(getInventoryDashboard).toHaveBeenCalledTimes(2)
    expect(wrapper.find('[role="dialog"]').exists()).toBe(false)

    await wrapper.get('.btn-trf').trigger('click')
    inputs = wrapper.findAll('.modal-content .form-input')
    await inputs[0].setValue('8')
    await inputs[1].setValue('A-01-01')
    await inputs[2].setValue('B-02-02')
    await inputs[3].setValue('产线备料')
    await wrapper.get('.btn-ok').trigger('click')
    await flushPromises()

    expect(transferStock).toHaveBeenCalledWith({
      materialCode: 'MAT-A01',
      quantity: 8,
      fromWarehouse: 'A-01-01',
      toWarehouse: 'B-02-02',
      remark: '产线备料',
    })
    expect(getInventoryDashboard).toHaveBeenCalledTimes(3)
    expect(getInventoryList).toHaveBeenCalledTimes(3)
  })

  it('refreshes inventory data and keeps the adjusted material selected after a successful stock adjustment', async () => {
    const adjustedItems = [
      inventoryItems[0],
      {
        ...inventoryItems[1],
        availableQuantity: 76,
        realQuantity: 76,
        reservedQuantity: 0,
      },
    ]
    getInventoryDashboard
      .mockResolvedValueOnce(dashboard)
      .mockResolvedValueOnce({
        lowStockCount: 0,
        outOfStockCount: 0,
        todayTransactions: 3,
        totalMaterials: 2,
      })
    getInventoryList
      .mockResolvedValueOnce(inventoryItems)
      .mockResolvedValueOnce(adjustedItems)
    getStockTransactions
      .mockResolvedValueOnce(transactions)
      .mockResolvedValueOnce([
        {
          ...transactions[0],
          id: 'tx-adjusted',
          balanceBefore: 30,
          balanceAfter: 76,
          quantity: 46,
          remark: '盘点修正',
          transactionType: 'Adjustment',
        },
      ])
    adjustStock.mockResolvedValueOnce({
      ...transactions[0],
      id: 'tx-adjusted',
      balanceAfter: 76,
      quantity: 46,
      remark: '盘点修正',
      transactionType: 'Adjustment',
    })
    const wrapper = mountInventoryBoard()
    await flushPromises()

    await wrapper.findAll('[role="option"]')[1].trigger('click')
    await flushPromises()
    await wrapper.get('.btn-adj').trigger('click')
    await wrapper.get('.form-input').setValue('76')
    await wrapper.get('.btn-ok').trigger('click')
    await flushPromises()

    expect(adjustStock).toHaveBeenCalledWith({
      materialCode: 'MAT-B02',
      newQuantity: 76,
      remark: undefined,
    })
    expect(getInventoryDashboard).toHaveBeenCalledTimes(2)
    expect(getInventoryList).toHaveBeenCalledTimes(2)
    expect(wrapper.find('[role="dialog"]').exists()).toBe(false)
    expect(wrapper.get('.detail-header h3').text()).toBe('花键套')
    expect(wrapper.get('.detail-meta').text()).toContain('可用量76')
  })

  it('falls back to demo KPI counts when the inventory dashboard fails to load', async () => {
    getInventoryDashboard.mockRejectedValueOnce(new Error('dashboard unavailable'))
    getInventoryList.mockRejectedValueOnce(new Error('inventory list unavailable'))
    const wrapper = mountInventoryBoard()
    await flushPromises()

    const cards = wrapper.findAll('.kpi-card')
    expect(cards[0].text()).toContain('8')
    expect(cards[1].text()).toContain('2')
    expect(cards[2].text()).toContain('1')
    expect(cards[3].text()).toContain('2')
    expect(wrapper.get('[role="alert"]').text()).toContain('inventory list unavailable')
  })

  it('focuses the stock operation dialog and returns focus to the trigger after Escape', async () => {
    const wrapper = mountInventoryBoard({ attachTo: document.body })
    await flushPromises()

    await wrapper.findAll('[role="option"]')[0].trigger('click')
    await flushPromises()

    const stockInButton = wrapper.get<HTMLElement>('.btn-in')
    stockInButton.element.focus()
    await stockInButton.trigger('click')
    await flushPromises()

    const dialog = wrapper.get<HTMLElement>('[role="dialog"]')
    expect(dialog.attributes('aria-modal')).toBe('true')
    expect(dialog.attributes('aria-labelledby')).toBe('inventory-operation-dialog-title')
    expect(dialog.get('h3').attributes('id')).toBe('inventory-operation-dialog-title')
    expect(dialog.text()).toContain('入库')
    expect(document.activeElement).toBe(dialog.element)

    await dialog.trigger('keydown.escape')
    await flushPromises()

    expect(wrapper.find('[role="dialog"]').exists()).toBe(false)
    expect(document.activeElement).toBe(stockInButton.element)

    wrapper.unmount()
  })

})
