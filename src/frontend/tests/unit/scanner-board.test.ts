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
const isOfflineDemoError = vi.hoisted(() =>
  vi.fn((error: unknown) => error instanceof Error && error.name === 'OfflineDemoApiError')
)

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

vi.mock('../../src/utils/offline-demo-mode', () => ({
  isOfflineDemoError,
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
    isOfflineDemoError.mockImplementation((error: unknown) => error instanceof Error && error.name === 'OfflineDemoApiError')
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

  it('guides shop-floor scanning with bilingual evidence links and help support', async () => {
    const wrapper = mountScannerBoard()
    await flushPromises()

    const guidance = wrapper.get('.scanner-guidance')
    expect(guidance.text()).toContain('扫码或手动查询前，请确认条码类型、现场工位和证据写入责任人。')
    expect(guidance.text()).toContain('Before scanning or manual lookup, confirm barcode type, workstation, and evidence owner.')

    const links = guidance.findAll('a')
    expect(links.map(link => link.attributes('href'))).toEqual([
      '/production',
      '/audit-logs',
      '/report',
      '#scanner-help',
    ])

    const help = wrapper.get('#scanner-help')
    expect(help.text()).toContain('扫描后先核对上下文，再进入生产报工、排产影响或库存齐套。')
    expect(help.text()).toContain('After scanning, verify context before production reporting, scheduling impact, or kitting review.')
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
    expect(readBarcodeScanEvidenceRecordsBackendFirst).toHaveBeenLastCalledWith({ failLoud: true })
    expect(wrapper.get('.field-evidence-panel').classes()).toContain('synced')
    expect(wrapper.get('.field-evidence-panel strong').text()).toBe('WO-RUSH-9001 工单扫码到站已确认')
  })

  it('refreshes confirmed scan evidence from backend after a successful write', async () => {
    httpGet.mockRejectedValue(new Error('offline demo'))
    const backendEvidence = {
      id: 'barcode-scan-workorder-WO-RUSH-9001-backend',
      code: 'WO-RUSH-9001',
      type: 'WorkOrder',
      title: '后端确认 WO-RUSH-9001 到站证据',
      action: '工单到站报工入口确认',
      actor: '现场主管',
      object: 'WO-RUSH-9001',
      source: '后端扫码证据',
      summary: '后端已确认扫码到站。',
      traceId: 'TRACE-BACKEND-WO-RUSH-9001',
      statusLabel: '到站已确认',
      createdAt: '2026-06-05T01:00:00.000Z',
      nextCheck: '报工开工校验',
    }
    readBarcodeScanEvidenceRecordsBackendFirst
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([backendEvidence])
    const wrapper = mountScannerBoard()
    await flushPromises()

    await wrapper.get('.code-input').setValue('WO-RUSH-9001')
    await wrapper.get('.btn-lookup').trigger('click')
    await flushPromises()

    await wrapper.get('.field-evidence-panel button').trigger('click')
    await flushPromises()

    expect(writeBarcodeScanEvidenceRecord).toHaveBeenCalledWith(expect.objectContaining({
      code: 'WO-RUSH-9001',
      type: 'WorkOrder',
      actor: '现场操作员',
    }))
    expect(wrapper.find('[role="alert"]').exists()).toBe(false)
    expect(wrapper.get('.field-evidence-panel').classes()).toContain('synced')
    expect(wrapper.get('.field-evidence-panel strong').text()).toBe('后端确认 WO-RUSH-9001 到站证据')
    expect(wrapper.get('.field-evidence-panel').text()).toContain('TRACE-BACKEND-WO-RUSH-9001')
  })

  it('keeps local scan evidence visible and alerts when backend readback omits the written record', async () => {
    httpGet.mockRejectedValue(new Error('offline demo'))
    readBarcodeScanEvidenceRecordsBackendFirst
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([])
    const wrapper = mountScannerBoard()
    await flushPromises()

    await wrapper.get('.code-input').setValue('WO-RUSH-9001')
    await wrapper.get('.btn-lookup').trigger('click')
    await flushPromises()

    await wrapper.get('.field-evidence-panel button').trigger('click')
    await flushPromises()

    const alert = wrapper.get('[role="alert"]')
    expect(alert.text()).toContain('扫码证据读回缺失')
    expect(alert.text()).toContain('WO-RUSH-9001')
    expect(wrapper.get('.field-evidence-panel').classes()).toContain('synced')
    expect(wrapper.get('.field-evidence-panel strong').text()).toBe('WO-RUSH-9001 工单扫码到站已确认')
    expect(wrapper.get('.field-evidence-panel').text()).toContain('TRACE-QR-WO-RUSH-9001-ARRIVAL')
  })

  it('keeps local scan evidence visible and alerts when startup backend evidence refresh fails', async () => {
    httpGet.mockRejectedValue(new Error('offline demo'))
    readBarcodeScanEvidenceRecords.mockReturnValueOnce([{
      id: 'barcode-scan-workorder-WO-RUSH-9001-local',
      code: 'WO-RUSH-9001',
      type: 'WorkOrder',
      title: '本地保留 WO-RUSH-9001 到站证据',
      action: '工单到站报工入口确认',
      actor: '现场操作员',
      object: 'WO-RUSH-9001',
      source: '本地扫码证据',
      summary: '本地已确认扫码到站。',
      traceId: 'TRACE-LOCAL-WO-RUSH-9001',
      statusLabel: '到站已确认',
      createdAt: '2026-06-05T01:00:00.000Z',
      nextCheck: '报工开工校验',
    }])
    readBarcodeScanEvidenceRecordsBackendFirst.mockRejectedValueOnce(new Error('startup backend evidence unavailable'))

    const wrapper = mountScannerBoard()
    await flushPromises()

    await wrapper.get('.code-input').setValue('WO-RUSH-9001')
    await wrapper.get('.btn-lookup').trigger('click')
    await flushPromises()

    const alert = wrapper.get('[role="alert"]')
    expect(alert.text()).toContain('扫码证据启动刷新失败')
    expect(alert.text()).toContain('startup backend evidence unavailable')
    expect(readBarcodeScanEvidenceRecordsBackendFirst).toHaveBeenCalledWith({ failLoud: true })
    expect(wrapper.get('.field-evidence-panel').classes()).toContain('synced')
    expect(wrapper.get('.field-evidence-panel strong').text()).toBe('本地保留 WO-RUSH-9001 到站证据')
    expect(wrapper.get('.field-evidence-panel').text()).toContain('TRACE-LOCAL-WO-RUSH-9001')
  })

  it('quietly keeps local scan evidence when offline demo skips startup backend evidence refresh', async () => {
    httpGet.mockRejectedValue(new Error('offline demo'))
    readBarcodeScanEvidenceRecords.mockReturnValueOnce([{
      id: 'barcode-scan-workorder-WO-RUSH-9001-local',
      code: 'WO-RUSH-9001',
      type: 'WorkOrder',
      title: '本地保留 WO-RUSH-9001 到站证据',
      action: '工单到站报工入口确认',
      actor: '现场操作员',
      object: 'WO-RUSH-9001',
      source: '本地扫码证据',
      summary: '本地已确认扫码到站。',
      traceId: 'TRACE-LOCAL-WO-RUSH-9001',
      statusLabel: '到站已确认',
      createdAt: '2026-06-05T01:00:00.000Z',
      nextCheck: '报工开工校验',
    }])
    const offlineDemoError = new Error('Offline demo mode skipped backend request: /api/v1/scheduling/barcode-scan-evidence')
    offlineDemoError.name = 'OfflineDemoApiError'
    readBarcodeScanEvidenceRecordsBackendFirst.mockRejectedValueOnce(offlineDemoError)

    const wrapper = mountScannerBoard()
    await flushPromises()

    await wrapper.get('.code-input').setValue('WO-RUSH-9001')
    await wrapper.get('.btn-lookup').trigger('click')
    await flushPromises()

    expect(readBarcodeScanEvidenceRecordsBackendFirst).toHaveBeenCalledWith({ failLoud: true })
    expect(wrapper.find('[role="alert"]').exists()).toBe(false)
    expect(wrapper.text()).not.toContain('扫码证据启动刷新失败')
    expect(wrapper.text()).not.toContain('Offline demo mode skipped backend request')
    expect(wrapper.get('.field-evidence-panel').classes()).toContain('synced')
    expect(wrapper.get('.field-evidence-panel strong').text()).toBe('本地保留 WO-RUSH-9001 到站证据')
    expect(wrapper.get('.field-evidence-panel').text()).toContain('TRACE-LOCAL-WO-RUSH-9001')
  })

  it('routes work-order scans to production and scheduling with scanCode context', async () => {
    httpGet.mockRejectedValue(new Error('offline demo'))
    const wrapper = mountScannerBoard()
    await flushPromises()

    await wrapper.get('.code-input').setValue('WO-RUSH-9001')
    await wrapper.get('.btn-lookup').trigger('click')
    await flushPromises()

    expect(wrapper.get('.result-type').text()).toBe('工单')
    expect(wrapper.get('.result-name').text()).toBe('急单阀体组件')
    expect(wrapper.get('.field-evidence-panel strong').text()).toBe('确认工单到站并进入报工入口')

    const actions = wrapper.findAll('.context-actions button')
    expect(actions.map(action => action.text())).toEqual(['进入生产报工', '查看排产影响'])

    await actions[0].trigger('click')
    await actions[1].trigger('click')

    expect(routerPush).toHaveBeenNthCalledWith(1, {
      path: '/production',
      query: { scanCode: 'WO-RUSH-9001' },
    })
    expect(routerPush).toHaveBeenNthCalledWith(2, {
      path: '/scheduling',
      query: { scanCode: 'WO-RUSH-9001' },
    })
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

  it('fails loud when the scan API returns a non-scan payload', async () => {
    httpGet.mockResolvedValueOnce({
      data: '<!doctype html><title>SPA fallback</title>',
    })
    const wrapper = mountScannerBoard()
    await flushPromises()

    await wrapper.get('.code-input').setValue('WO-RUSH-9001')
    await wrapper.get('.btn-lookup').trigger('click')
    await flushPromises()

    const alert = wrapper.get('[role="alert"]')
    expect(alert.text()).toContain('扫码查询返回非扫码结果载荷')
    expect(wrapper.find('.scan-result').exists()).toBe(false)
    expect(wrapper.find('.history-item').exists()).toBe(false)
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

  it('routes material scans to inventory and BOM context actions with material evidence hints', async () => {
    httpGet.mockRejectedValue(new Error('offline demo'))
    const wrapper = mountScannerBoard()
    await flushPromises()

    await wrapper.get('.code-input').setValue('M-AL-6061')
    await wrapper.get('.btn-lookup').trigger('click')
    await flushPromises()

    expect(wrapper.get('.result-type').text()).toBe('物料')
    expect(wrapper.get('.result-name').text()).toBe('铝合金 6061')
    expect(wrapper.text()).toContain('缺料预警 / 待采购收货')
    expect(wrapper.get('.field-evidence-panel strong').text()).toBe('确认物料批次并进入齐套复核')

    const actions = wrapper.findAll('.context-actions button')
    expect(actions.map(action => action.text())).toEqual(['查看库存齐套', '查看 BOM 用量'])

    await actions[0].trigger('click')
    await actions[1].trigger('click')

    expect(routerPush).toHaveBeenNthCalledWith(1, '/inventory')
    expect(routerPush).toHaveBeenNthCalledWith(2, '/bom')
  })

  it('routes equipment scans to equipment and monitoring context actions with equipment evidence hints', async () => {
    httpGet.mockRejectedValue(new Error('offline demo'))
    const wrapper = mountScannerBoard()
    await flushPromises()

    await wrapper.get('.code-input').setValue('CNC-01')
    await wrapper.get('.btn-lookup').trigger('click')
    await flushPromises()

    expect(wrapper.get('.result-type').text()).toBe('设备')
    expect(wrapper.get('.result-name').text()).toBe('CNC 加工中心 01')
    expect(wrapper.text()).toContain('运行中 / 瓶颈设备')
    expect(wrapper.get('.field-evidence-panel strong').text()).toBe('确认设备点检入口并进入维护核对')

    const actions = wrapper.findAll('.context-actions button')
    expect(actions.map(action => action.text())).toEqual(['查看设备详情', '查看实时监控'])

    await actions[0].trigger('click')
    await actions[1].trigger('click')

    expect(routerPush).toHaveBeenNthCalledWith(1, '/equipment')
    expect(routerPush).toHaveBeenNthCalledWith(2, '/monitoring')
  })
})
