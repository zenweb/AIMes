import { flushPromises, mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import BarcodePrintBoard from '../../src/components/barcode/BarcodePrintBoard.vue'
import type { InventoryItem } from '../../src/types/inventory'

const getInventoryList = vi.hoisted(() => vi.fn())
const toCanvas = vi.hoisted(() => vi.fn(() => Promise.resolve()))
const toDataURL = vi.hoisted(() => vi.fn(() => Promise.resolve('data:image/png;base64,test')))
const readOtdEvidenceChainRecords = vi.hoisted(() => vi.fn(() => []))

vi.mock('qrcode', () => ({
  default: {
    toCanvas,
    toDataURL,
  },
}))

vi.mock('../../src/api/inventory', () => ({
  getInventoryList,
}))

vi.mock('../../src/utils/otd-evidence-chain-sync', () => ({
  readOtdEvidenceChainRecords,
}))

const items: InventoryItem[] = [
  {
    id: 'mat-1',
    availableQuantity: 45,
    createdAt: '2026-01-01T00:00:00',
    expiryDate: null,
    materialCode: 'M-AL-6061',
    materialName: '铝合金 6061',
    materialType: 'RawMaterial',
    realQuantity: 15,
    reservedQuantity: 30,
    safetyStock: 64,
    storageLocation: 'A-01',
    unit: '件',
  },
  {
    id: 'mat-2',
    availableQuantity: 1,
    createdAt: '2026-01-01T00:00:00',
    expiryDate: null,
    materialCode: 'WO-RUSH-9001',
    materialName: '急单阀体组件流转卡',
    materialType: 'Finished',
    realQuantity: 1,
    reservedQuantity: 0,
    safetyStock: 1,
    storageLocation: '生产一线',
    unit: '单',
  },
]

function mountBarcodePrintBoard() {
  return mount(BarcodePrintBoard, {
    global: {
      stubs: {
        RouterLink: {
          props: ['to'],
          template: '<a><slot /></a>',
        },
      },
    },
  })
}

describe('BarcodePrintBoard', () => {
  beforeEach(() => {
    getInventoryList.mockResolvedValue(items)
    readOtdEvidenceChainRecords.mockReturnValue([])
    toCanvas.mockClear()
    toDataURL.mockResolvedValue('data:image/png;base64,test')
    vi.restoreAllMocks()
  })

  it('lets keyboard users select trace labels for printing', async () => {
    const wrapper = mountBarcodePrintBoard()
    await flushPromises()

    const cards = wrapper.findAll('.label-card')
    expect(cards).toHaveLength(2)
    expect(cards[0].attributes('role')).toBe('checkbox')
    expect(cards[0].attributes('tabindex')).toBe('0')
    expect(cards[0].attributes('aria-checked')).toBe('false')
    expect(cards[0].attributes('aria-label')).toBe('选择打印标签：M-AL-6061 铝合金 6061')

    await cards[0].trigger('keydown.enter')
    await flushPromises()

    expect(wrapper.findAll('.label-card')[0].attributes('aria-checked')).toBe('true')
    expect(wrapper.get('.sel-count').text()).toBe('已选 1 项')
  })

  it('alerts when the print window cannot be opened', async () => {
    vi.spyOn(window, 'open').mockReturnValue(null)

    const wrapper = mountBarcodePrintBoard()
    await flushPromises()

    await wrapper.findAll('.label-card')[0].trigger('click')
    await wrapper.get('.btn-print').trigger('click')
    await flushPromises()

    const alert = wrapper.get('[role="alert"]')
    expect(alert.attributes('aria-live')).toBe('assertive')
    expect(alert.text()).toContain('标签打印窗口打开失败')
  })

  it('alerts when QR images cannot be generated for printing', async () => {
    toDataURL.mockRejectedValueOnce(new Error('qr render unavailable'))
    const printWindow = {
      document: {
        write: vi.fn(),
        close: vi.fn(),
      },
      print: vi.fn(),
    }
    vi.spyOn(window, 'open').mockReturnValue(printWindow as unknown as Window)

    const wrapper = mountBarcodePrintBoard()
    await flushPromises()

    await wrapper.findAll('.label-card')[0].trigger('click')
    await wrapper.get('.btn-print').trigger('click')
    await flushPromises()

    const alert = wrapper.get('[role="alert"]')
    expect(alert.text()).toContain('标签二维码生成失败')
    expect(alert.text()).toContain('qr render unavailable')
    expect(printWindow.print).not.toHaveBeenCalled()
  })

  it('alerts when the initial inventory list cannot be loaded and keeps the demo labels visible', async () => {
    getInventoryList.mockRejectedValueOnce(new Error('inventory api unavailable'))

    const wrapper = mountBarcodePrintBoard()
    await flushPromises()

    const alert = wrapper.get('[role="alert"]')
    expect(alert.attributes('aria-live')).toBe('assertive')
    expect(alert.text()).toContain('标签列表加载失败')
    expect(alert.text()).toContain('inventory api unavailable')
    expect(wrapper.findAll('.label-card')).toHaveLength(4)
    expect(wrapper.get('.trace-bridge').text()).toContain('工单标签进入生产报工')
  })

  it('retries inventory loading after an initial failure and replaces the demo labels with live data', async () => {
    const retryItems: InventoryItem[] = [
      {
        id: 'mat-9',
        availableQuantity: 12,
        createdAt: '2026-02-01T00:00:00',
        expiryDate: null,
        materialCode: 'M-RETRY-001',
        materialName: '重试后真实库存',
        materialType: 'Consumable',
        realQuantity: 12,
        reservedQuantity: 0,
        safetyStock: 5,
        storageLocation: 'R-01',
        unit: '件',
      },
    ]
    getInventoryList
      .mockRejectedValueOnce(new Error('inventory api unavailable'))
      .mockResolvedValueOnce(retryItems)

    const wrapper = mountBarcodePrintBoard()
    await flushPromises()

    await wrapper.get('.print-error .btn-retry').trigger('click')
    await flushPromises()

    expect(getInventoryList).toHaveBeenCalledTimes(2)
    expect(wrapper.find('[role="alert"]').exists()).toBe(false)
    const cards = wrapper.findAll('.label-card')
    expect(cards).toHaveLength(1)
    expect(cards[0].text()).toContain('M-RETRY-001')
    expect(cards[0].text()).toContain('重试后真实库存')
  })
})
