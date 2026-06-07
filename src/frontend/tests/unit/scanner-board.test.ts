import { flushPromises, mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import ScannerBoard from '../../src/components/scanner/ScannerBoard.vue'

const routerPush = vi.hoisted(() => vi.fn())
const httpGet = vi.hoisted(() => vi.fn())
const qrStart = vi.hoisted(() => vi.fn(() => Promise.resolve()))
const qrStop = vi.hoisted(() => vi.fn(() => Promise.resolve()))
const readBarcodeScanEvidenceRecords = vi.hoisted(() => vi.fn(() => []))
const readBarcodeScanEvidenceRecordsBackendFirst = vi.hoisted(() => vi.fn(async () => []))
const createBarcodeScanEvidenceRecord = vi.hoisted(() => vi.fn())
const writeBarcodeScanEvidenceRecord = vi.hoisted(() => vi.fn())

vi.mock('vue-router', () => ({
  useRouter: () => ({ push: routerPush }),
}))

vi.mock('html5-qrcode', () => ({
  Html5Qrcode: vi.fn(function Html5Qrcode() {
    return {
    isScanning: true,
    start: qrStart,
    stop: qrStop,
    }
  }),
}))

vi.mock('../../src/api/http', () => ({
  default: {
    get: httpGet,
  },
}))

vi.mock('../../src/utils/barcode-scan-evidence-sync', () => ({
  createBarcodeScanEvidenceRecord,
  readBarcodeScanEvidenceRecords,
  readBarcodeScanEvidenceRecordsBackendFirst,
  writeBarcodeScanEvidenceRecord,
}))

vi.mock('../../src/utils/local-user', () => ({
  getLocalUserDisplayName: vi.fn(() => '现场操作员'),
}))

function mountScannerBoard() {
  return mount(ScannerBoard)
}

describe('ScannerBoard', () => {
  beforeEach(() => {
    routerPush.mockReset()
    httpGet.mockReset()
    qrStart.mockClear()
    qrStop.mockClear()
    readBarcodeScanEvidenceRecords.mockClear()
    readBarcodeScanEvidenceRecordsBackendFirst.mockClear()
    createBarcodeScanEvidenceRecord.mockReturnValue({
      id: 'barcode-scan-workorder-WO-RUSH-9001',
      code: 'WO-RUSH-9001',
      type: 'WorkOrder',
      title: 'WO-RUSH-9001 工单扫码到站已确认',
      action: '工单到站报工入口确认',
      actor: '现场操作员',
      object: 'WO-RUSH-9001',
      source: '条码扫描 / 现场工位',
      summary: '现场扫描 WO-RUSH-9001 流转卡并确认已到达报工入口。',
      traceId: 'TRACE-QR-WO-RUSH-9001-ARRIVAL',
      statusLabel: '到站已确认',
      createdAt: '2026-06-05T00:00:00.000Z',
      nextCheck: '生产报工开工校验',
    })
    writeBarcodeScanEvidenceRecord.mockReset()
  })

  it('lets keyboard users activate the camera scanner placeholder', async () => {
    const wrapper = mountScannerBoard()
    await flushPromises()

    const placeholder = wrapper.get('.scanner-placeholder')
    expect(placeholder.attributes('role')).toBe('button')
    expect(placeholder.attributes('tabindex')).toBe('0')
    expect(placeholder.attributes('aria-label')).toBe('开启摄像头扫描')

    await placeholder.trigger('keydown.enter')
    await flushPromises()

    expect(wrapper.find('#qr-reader').exists()).toBe(true)
    expect(qrStart).toHaveBeenCalled()
  })

  it('lets keyboard users replay manual scan history items', async () => {
    httpGet.mockRejectedValue(new Error('offline demo'))
    const wrapper = mountScannerBoard()
    await flushPromises()

    await wrapper.get('.code-input').setValue('WO-RUSH-9001')
    await wrapper.get('.btn-lookup').trigger('click')
    await flushPromises()

    expect(wrapper.get('.result-name').text()).toBe('急单阀体组件')

    const historyItem = wrapper.get('.history-item')
    expect(historyItem.attributes('role')).toBe('button')
    expect(historyItem.attributes('tabindex')).toBe('0')
    expect(historyItem.attributes('aria-label')).toBe('重新扫描工单 WO-RUSH-9001 急单阀体组件')

    await historyItem.trigger('keydown.enter')
    await flushPromises()

    expect(wrapper.get('.result-name').text()).toBe('急单阀体组件')
    expect(httpGet).toHaveBeenCalledTimes(2)
  })

  it('keeps scan evidence unconfirmed and alerts when evidence storage fails', async () => {
    httpGet.mockRejectedValue(new Error('offline demo'))
    writeBarcodeScanEvidenceRecord.mockImplementationOnce(() => {
      throw new Error('scan evidence storage unavailable')
    })
    const wrapper = mountScannerBoard()
    await flushPromises()

    await wrapper.get('.code-input').setValue('WO-RUSH-9001')
    await wrapper.get('.btn-lookup').trigger('click')
    await flushPromises()

    await wrapper.get('.field-evidence-panel button').trigger('click')
    await flushPromises()

    const alert = wrapper.get('[role="alert"]')
    expect(alert.text()).toContain('扫码证据写入失败')
    expect(alert.text()).toContain('scan evidence storage unavailable')
    expect(wrapper.get('.field-evidence-panel strong').text()).toBe('确认工单到站并进入报工入口')
  })

  it('keeps locally written scan evidence confirmed when backend refresh fails', async () => {
    httpGet.mockRejectedValue(new Error('offline demo'))
    const wrapper = mountScannerBoard()
    await flushPromises()

    await wrapper.get('.code-input').setValue('WO-RUSH-9001')
    await wrapper.get('.btn-lookup').trigger('click')
    await flushPromises()

    readBarcodeScanEvidenceRecordsBackendFirst.mockRejectedValueOnce(new Error('backend evidence refresh unavailable'))
    await wrapper.get('.field-evidence-panel button').trigger('click')
    await flushPromises()

    const alert = wrapper.get('[role="alert"]')
    expect(alert.text()).toContain('扫码证据刷新失败')
    expect(alert.text()).toContain('backend evidence refresh unavailable')
    expect(wrapper.get('.field-evidence-panel').classes()).toContain('synced')
    expect(wrapper.get('.field-evidence-panel strong').text()).toBe('WO-RUSH-9001 工单扫码到站已确认')
  })

  it('clears the previous scan result when a later manual scan has no match', async () => {
    httpGet.mockRejectedValue(new Error('offline demo'))
    const wrapper = mountScannerBoard()
    await flushPromises()

    await wrapper.get('.code-input').setValue('WO-RUSH-9001')
    await wrapper.get('.btn-lookup').trigger('click')
    await flushPromises()

    expect(wrapper.get('.result-name').text()).toBe('急单阀体组件')

    await wrapper.get('.code-input').setValue('UNKNOWN-CODE')
    await wrapper.get('.btn-lookup').trigger('click')
    await flushPromises()

    expect(wrapper.get('[role="alert"]').text()).toContain('未找到 "UNKNOWN-CODE" 对应的物料、设备或工单')
    expect(wrapper.find('.scan-result').exists()).toBe(false)
  })

  it('alerts when the camera cannot be stopped after a successful scan', async () => {
    httpGet.mockRejectedValue(new Error('offline demo'))
    qrStop.mockRejectedValueOnce(new Error('camera stop unavailable'))
    const wrapper = mountScannerBoard()
    await flushPromises()

    await wrapper.get('.scanner-placeholder').trigger('click')
    await flushPromises()

    const decoded = qrStart.mock.calls[0][2] as (decodedText: string) => Promise<void>
    await decoded('WO-RUSH-9001')
    await flushPromises()

    const alert = wrapper.get('[role="alert"]')
    expect(alert.text()).toContain('摄像头关闭失败')
    expect(alert.text()).toContain('camera stop unavailable')
    expect(wrapper.get('.result-name').text()).toBe('急单阀体组件')
  })
})
