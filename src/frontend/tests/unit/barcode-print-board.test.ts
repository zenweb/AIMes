import { flushPromises, mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import BarcodePrintBoard from '../../src/components/barcode/BarcodePrintBoard.vue'
import type { InventoryItem } from '../../src/types/inventory'

const getInventoryList = vi.hoisted(() => vi.fn())
const toCanvas = vi.hoisted(() => vi.fn(() => Promise.resolve()))
const toDataURL = vi.hoisted(() => vi.fn(() => Promise.resolve('data:image/png;base64,test')))
const readOtdEvidenceChainRecords = vi.hoisted(() => vi.fn(() => []))
const isOfflineDemoError = vi.hoisted(() =>
  vi.fn((error: unknown) => error instanceof Error && error.name === 'OfflineDemoApiError')
)

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

vi.mock('../../src/utils/offline-demo-mode', () => ({
  isOfflineDemoError,
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
          computed: {
            href() {
              if (typeof this.to === 'string') return this.to
              return `${this.to.path}?offlineDemo=${this.to.query.offlineDemo}`
            },
          },
          template: '<a :href="href"><slot /></a>',
        },
      },
    },
  })
}

function clearDemoStorage() {
  localStorage.removeItem('aimes_offline_demo')
}

function installLocalStorageMock() {
  const storage = new Map<string, string>()
  vi.stubGlobal('localStorage', {
    getItem: vi.fn((key: string) => storage.get(key) ?? null),
    setItem: vi.fn((key: string, value: string) => storage.set(key, value)),
    removeItem: vi.fn((key: string) => storage.delete(key)),
  })
}

describe('BarcodePrintBoard', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    installLocalStorageMock()
    getInventoryList.mockResolvedValue(items)
    readOtdEvidenceChainRecords.mockReturnValue([])
    isOfflineDemoError.mockImplementation((error: unknown) => error instanceof Error && error.name === 'OfflineDemoApiError')
    toCanvas.mockClear()
    toDataURL.mockResolvedValue('data:image/png;base64,test')
    clearDemoStorage()
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

  it('filters labels by type and search while keeping selection count explicit', async () => {
    const wrapper = mountBarcodePrintBoard()
    await flushPromises()

    await wrapper.get('.filter-select').setValue('Finished')
    expect(wrapper.findAll('.label-card')).toHaveLength(1)
    expect(wrapper.get('.label-card').text()).toContain('WO-RUSH-9001')
    expect(wrapper.get('.label-card').text()).toContain('扫码后进入生产报工')

    await wrapper.get('.search-input').setValue('铝合金')
    expect(wrapper.findAll('.label-card')).toHaveLength(0)

    await wrapper.get('.filter-select').setValue('')
    expect(wrapper.findAll('.label-card')).toHaveLength(1)
    await wrapper.get('.label-card').trigger('keydown.space')

    expect(wrapper.get('.sel-count').text()).toBe('已选 1 项')
    expect(wrapper.get('.label-card').classes()).toContain('selected')
    expect(wrapper.get('.label-card').attributes('aria-checked')).toBe('true')
  })

  it('shows the newest OTD label status and release trace on trace cards', async () => {
    readOtdEvidenceChainRecords.mockReturnValueOnce([
      {
        id: 'old-label-status',
        stage: '标签状态',
        object: 'M-AL-6061',
        traceId: 'TRACE-QR-M-AL-6061-KIT-LABEL-PENDING',
        status: 'active',
        statusLabel: '旧标签待确认',
        createdAt: '2026-06-14T08:00:00.000Z',
      },
      {
        id: 'latest-label-status',
        stage: '标签状态',
        object: 'M-AL-6061',
        traceId: 'TRACE-QR-M-AL-6061-KIT-LABEL-RELEASE',
        status: 'closed',
        statusLabel: '标签已释放到库存齐套',
        createdAt: '2026-06-15T08:00:00.000Z',
      },
    ])
    const wrapper = mountBarcodePrintBoard()
    await flushPromises()

    const status = wrapper.get('.trace-label-status')
    expect(status.classes()).toContain('released')
    expect(status.text()).toContain('标签已释放到库存齐套')
    expect(status.text()).toContain('TRACE-QR-M-AL-6061-KIT-LABEL-RELEASE')
    expect(status.text()).not.toContain('旧标签待确认')
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

  it('prints selected labels with generated QR images and business text', async () => {
    const printWindow = {
      document: {
        write: vi.fn(),
        close: vi.fn(),
      },
      print: vi.fn(),
    }
    vi.spyOn(window, 'open').mockReturnValue(printWindow as unknown as Window)
    toDataURL
      .mockResolvedValueOnce('data:image/png;base64,mat1')
      .mockResolvedValueOnce('data:image/png;base64,mat2')

    const wrapper = mountBarcodePrintBoard()
    await flushPromises()

    const cards = wrapper.findAll('.label-card')
    await cards[0].trigger('click')
    await cards[1].trigger('click')
    await wrapper.get('.btn-print').trigger('click')
    await flushPromises()

    expect(toDataURL).toHaveBeenCalledWith('M-AL-6061', { width: 160, margin: 2 })
    expect(toDataURL).toHaveBeenCalledWith('WO-RUSH-9001', { width: 160, margin: 2 })
    expect(printWindow.document.write).toHaveBeenCalledWith(expect.stringContaining('M-AL-6061'))
    expect(printWindow.document.write).toHaveBeenCalledWith(expect.stringContaining('急单阀体组件流转卡'))
    expect(printWindow.document.close).toHaveBeenCalledOnce()
    expect(printWindow.print).toHaveBeenCalledOnce()
    expect(wrapper.find('[role="alert"]').exists()).toBe(false)
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

  it('quietly shows demo labels when offline demo skips initial inventory loading', async () => {
    const offlineDemoError = new Error('Offline demo mode skipped backend request: /api/v1/inventory')
    offlineDemoError.name = 'OfflineDemoApiError'
    getInventoryList.mockRejectedValueOnce(offlineDemoError)

    const wrapper = mountBarcodePrintBoard()
    await flushPromises()

    expect(wrapper.findAll('.label-card')).toHaveLength(4)
    expect(wrapper.text()).toContain('M-AL-6061')
    expect(wrapper.find('[role="alert"]').exists()).toBe(false)
    expect(wrapper.text()).not.toContain('标签列表加载失败')
    expect(wrapper.text()).not.toContain('Offline demo mode skipped backend request')
  })

  it('keeps the scanner link inside offline demo context so demo sessions are not cleared by auth guards', async () => {
    localStorage.setItem('aimes_offline_demo', 'true')

    const wrapper = mountBarcodePrintBoard()
    await flushPromises()

    expect(wrapper.get('.trace-bridge a').attributes('href')).toBe('/scanner?offlineDemo=1')
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
