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
  exportToCsv: vi.fn(),
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
