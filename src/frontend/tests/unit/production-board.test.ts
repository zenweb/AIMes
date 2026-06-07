import { flushPromises, mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import ProductionBoard from '../../src/components/production/ProductionBoard.vue'

const getWorkOrders = vi.hoisted(() => vi.fn())
const scanOperation = vi.hoisted(() => vi.fn())
const startOperation = vi.hoisted(() => vi.fn())
const completeOperation = vi.hoisted(() => vi.fn())
const reportException = vi.hoisted(() => vi.fn())
const readLaborQualificationBlockForOperation = vi.hoisted(() => vi.fn())
const readLaborReassignmentForOperation = vi.hoisted(() => vi.fn())
const writeLaborReassignmentExecutionEvidence = vi.hoisted(() => vi.fn())
const readPocPilotRunRecordBackendFirst = vi.hoisted(() => vi.fn())
const writeProductionAnomalyEvent = vi.hoisted(() => vi.fn())
const upsertOtdEvidenceChainRecord = vi.hoisted(() => vi.fn())

vi.mock('../../src/api/production', () => ({
  getWorkOrders,
  scanOperation,
  startOperation,
  completeOperation,
  reportException,
}))

vi.mock('vue-router', () => ({
  useRoute: () => ({ query: {} }),
}))

vi.mock('../../src/stores/auth', () => ({
  useAuth: () => ({
    user: { value: { username: 'operator1' } },
  }),
}))

vi.mock('../../src/utils/poc-pilot-run-sync', () => ({
  readPocPilotRunRecordBackendFirst,
}))

vi.mock('../../src/utils/barcode-scan-evidence-sync', () => ({
  readBarcodeScanEvidenceRecords: vi.fn(() => []),
}))

vi.mock('../../src/utils/labor-assignment-sync', () => ({
  readLaborQualificationBlockForOperation,
  readLaborReassignmentForOperation,
  writeLaborReassignmentExecutionEvidence,
}))

vi.mock('../../src/utils/production-anomaly-sync', () => ({
  writeProductionAnomalyEvent,
}))

vi.mock('../../src/utils/otd-evidence-chain-sync', () => ({
  upsertOtdEvidenceChainRecord,
}))

function mountProductionBoard() {
  return mount(ProductionBoard, {
    global: {
      stubs: {
        ProductionExecutionTracePanel: true,
        StartQualificationPanel: true,
      },
    },
  })
}

function createDeferred<T>() {
  let resolve: (value: T) => void = () => undefined
  const promise = new Promise<T>(res => {
    resolve = res
  })
  return { promise, resolve }
}

describe('ProductionBoard', () => {
  beforeEach(() => {
    getWorkOrders.mockResolvedValue({ items: [], totalCount: 0 })
    scanOperation.mockRejectedValue(new Error('not found'))
    startOperation.mockResolvedValue({})
    completeOperation.mockResolvedValue({})
    reportException.mockResolvedValue({})
    writeProductionAnomalyEvent.mockReset()
    upsertOtdEvidenceChainRecord.mockReset()
    readLaborQualificationBlockForOperation.mockReturnValue(null)
    readLaborReassignmentForOperation.mockReturnValue(null)
    writeLaborReassignmentExecutionEvidence.mockReset()
    readPocPilotRunRecordBackendFirst.mockResolvedValue(null)
  })

  it('announces scan misses through an alert notification', async () => {
    const wrapper = mountProductionBoard()
    await flushPromises()

    await wrapper.get('.scan-input').setValue('WO-MISSING')
    await wrapper.get('.scan-btn').trigger('click')
    await flushPromises()

    const alert = wrapper.get('[role="alert"]')
    expect(alert.classes()).toContain('notification')
    expect(alert.classes()).toContain('error')
    expect(alert.text()).toContain('未找到匹配的工单或工序')
  })

  it('announces scan api failures before reporting no local match', async () => {
    scanOperation.mockRejectedValueOnce(new Error('scanner API unavailable'))
    const wrapper = mountProductionBoard()
    await flushPromises()

    await wrapper.get('.scan-input').setValue('WO-SCANNER-DOWN')
    await wrapper.get('.scan-btn').trigger('click')
    await flushPromises()

    expect(scanOperation).toHaveBeenCalledWith('WO-SCANNER-DOWN', 'operator1')
    expect(wrapper.find('.detail-title-row h3').exists()).toBe(false)
    const alert = wrapper.get('[role="alert"]')
    expect(alert.classes()).toContain('notification')
    expect(alert.classes()).toContain('error')
    expect(alert.text()).toContain('扫码查询失败，且本地未找到匹配的工单或工序')
    expect(alert.text()).toContain('scanner API unavailable')
  })

  it('fails loud while showing demo work orders when the work-order API is unavailable', async () => {
    getWorkOrders.mockRejectedValueOnce(new Error('work-order API unavailable'))
    const wrapper = mountProductionBoard()
    await flushPromises()

    expect(wrapper.findAll('.wo-card').length).toBeGreaterThan(0)
    expect(wrapper.get('.wo-number').text()).toBe('WO-001')
    const alert = wrapper.get('[role="alert"]')
    expect(alert.classes()).toContain('notification')
    expect(alert.classes()).toContain('error')
    expect(alert.text()).toContain('生产工单加载失败')
    expect(alert.text()).toContain('work-order API unavailable')
  })

  it('keeps production work orders visible when POC pilot evidence loading fails', async () => {
    getWorkOrders.mockResolvedValue({
      items: [
        {
          id: 'wo-poc-evidence',
          orderNumber: 'WO-POC-EVIDENCE',
          productCode: 'PRD-POC-EVIDENCE',
          productName: 'POC 试点件',
          plannedQuantity: 12,
          completedQuantity: 0,
          plannedStartDate: '2026-06-04T08:00:00',
          plannedEndDate: '2026-06-04T12:00:00',
          status: 'pending',
          workshopId: 'WS-001',
          priority: 1,
          progressPercentage: 0,
          createdAt: '2026-06-04T00:00:00',
        },
      ],
      totalCount: 1,
    })
    readPocPilotRunRecordBackendFirst.mockRejectedValueOnce(new Error('POC pilot evidence backend unavailable'))

    const wrapper = mountProductionBoard()
    await flushPromises()

    expect(wrapper.get('.wo-number').text()).toBe('WO-POC-EVIDENCE')
    const alert = wrapper.get('[role="alert"]')
    expect(alert.classes()).toContain('notification')
    expect(alert.classes()).toContain('error')
    expect(alert.text()).toContain('POC 试点运行证据加载失败')
    expect(alert.text()).toContain('POC pilot evidence backend unavailable')
  })

  it('links blocked start confirmation to the qualification block reason', async () => {
    getWorkOrders.mockResolvedValue({
      items: [
        {
          id: 'WO-013',
          orderNumber: 'WO-013',
          productCode: 'PRD-003',
          productName: '淬火热处理',
          plannedQuantity: 200,
          completedQuantity: 0,
          plannedStartDate: '2026-05-12T10:00:00',
          plannedEndDate: '2026-05-12T14:00:00',
          status: 'pending',
          workshopId: 'WS-001',
          priority: 3,
          progressPercentage: 0,
          createdAt: '2026-05-11T00:00:00',
        },
      ],
      totalCount: 1,
    })
    readLaborQualificationBlockForOperation.mockReturnValue({
      auditId: 'LAB-BLOCK-001',
      traceId: 'TRACE-LAB-BLOCK-001',
      status: 'blocked',
      workOrderNumber: 'WO-013',
      operationCode: 'OP-10',
      operationName: '淬火',
      blockedEmployeeNumber: 'EMP-003',
      blockedEmployeeName: '王五',
      blockedCertification: '热处理上岗证',
      blockedExpiresAt: '2026-05-25',
      requiredSkill: '热处理',
      requiredTeam: '乙班',
      requiredShift: '夜班',
      reviewerName: '赵主管',
      reviewerRole: '生产主管',
      reason: '热处理资质临期且无有效替班候选',
    })

    const wrapper = mountProductionBoard()
    await flushPromises()

    await wrapper.get('.wo-card').trigger('click')
    await flushPromises()
    await wrapper.get('.op-btn.start').trigger('click')
    await flushPromises()

    const confirm = wrapper.get('.dialog-confirm')
    expect(confirm.attributes('disabled')).toBeDefined()
    expect(confirm.attributes('aria-describedby')).toBe('start-qualification-block-reason')
    expect(wrapper.get('#start-qualification-block-reason').text()).toContain('热处理资质临期且无有效替班候选')
  })

  it('exposes work orders as keyboard-selectable options', async () => {
    getWorkOrders.mockResolvedValue({
      items: [
        {
          id: 'wo-1',
          orderNumber: 'WO-001',
          productCode: 'PRD-001',
          productName: '液压阀体',
          plannedQuantity: 100,
          completedQuantity: 48,
          plannedStartDate: '2026-05-12T08:00:00',
          plannedEndDate: '2026-05-12T18:00:00',
          status: 'in_progress',
          workshopId: 'WS-001',
          priority: 2,
          progressPercentage: 48,
          createdAt: '2026-05-11T00:00:00',
        },
        {
          id: 'wo-2',
          orderNumber: 'WO-002',
          productCode: 'PRD-002',
          productName: '伺服电机',
          plannedQuantity: 60,
          completedQuantity: 0,
          plannedStartDate: '2026-05-13T08:00:00',
          plannedEndDate: '2026-05-13T18:00:00',
          status: 'pending',
          workshopId: 'WS-001',
          priority: 1,
          progressPercentage: 0,
          createdAt: '2026-05-11T00:00:00',
        },
      ],
      totalCount: 2,
    })
    const wrapper = mountProductionBoard()
    await flushPromises()

    const list = wrapper.get('[role="listbox"]')
    expect(list.attributes('aria-label')).toBe('生产工单列表')
    const options = wrapper.findAll('[role="option"]')
    expect(options).toHaveLength(2)
    expect(options[1].attributes('tabindex')).toBe('0')
    expect(options[1].attributes('aria-selected')).toBe('false')
    expect(options[1].attributes('aria-label')).toBe('选择生产工单：WO-002 伺服电机，待生产，进度 0%')

    await options[1].trigger('keydown.enter')
    await flushPromises()

    expect(wrapper.get('.detail-title-row h3').text()).toBe('WO-002')
    expect(options[1].attributes('aria-selected')).toBe('true')
  })

  it('clears stale work-order detail when the status filter removes the selected order', async () => {
    getWorkOrders
      .mockResolvedValueOnce({
        items: [
          {
            id: 'wo-running',
            orderNumber: 'WO-RUNNING',
            productCode: 'PRD-RUNNING',
            productName: '运行中泵体',
            plannedQuantity: 80,
            completedQuantity: 20,
            plannedStartDate: '2026-06-02T08:00:00',
            plannedEndDate: '2026-06-02T18:00:00',
            status: 'in_progress',
            workshopId: 'WS-001',
            priority: 1,
            progressPercentage: 25,
            createdAt: '2026-06-01T00:00:00',
          },
          {
            id: 'wo-pending',
            orderNumber: 'WO-PENDING',
            productCode: 'PRD-PENDING',
            productName: '待生产泵体',
            plannedQuantity: 60,
            completedQuantity: 0,
            plannedStartDate: '2026-06-03T08:00:00',
            plannedEndDate: '2026-06-03T18:00:00',
            status: 'pending',
            workshopId: 'WS-001',
            priority: 2,
            progressPercentage: 0,
            createdAt: '2026-06-01T00:00:00',
          },
        ],
        totalCount: 2,
      })
      .mockResolvedValueOnce({
        items: [
          {
            id: 'wo-pending',
            orderNumber: 'WO-PENDING',
            productCode: 'PRD-PENDING',
            productName: '待生产泵体',
            plannedQuantity: 60,
            completedQuantity: 0,
            plannedStartDate: '2026-06-03T08:00:00',
            plannedEndDate: '2026-06-03T18:00:00',
            status: 'pending',
            workshopId: 'WS-001',
            priority: 2,
            progressPercentage: 0,
            createdAt: '2026-06-01T00:00:00',
          },
        ],
        totalCount: 1,
      })
    const wrapper = mountProductionBoard()
    await flushPromises()

    await wrapper.get('.wo-card').trigger('click')
    await flushPromises()
    expect(wrapper.get('.detail-title-row h3').text()).toBe('WO-RUNNING')

    await wrapper.get('.filter-select').setValue('pending')
    await flushPromises()

    expect(wrapper.find('.detail-title-row h3').exists()).toBe(false)
    expect(wrapper.get('.detail-empty').text()).toContain('选择工单或扫码开始')
    expect(wrapper.findAll('.wo-card')).toHaveLength(1)
    expect(wrapper.get('.wo-number').text()).toBe('WO-PENDING')
  })

  it('keeps the latest status filter result when an earlier request finishes later', async () => {
    const pendingRequest = createDeferred<{
      items: Array<{
        id: string
        orderNumber: string
        productCode: string
        productName: string
        plannedQuantity: number
        completedQuantity: number
        plannedStartDate: string
        plannedEndDate: string
        status: string
        workshopId: string
        priority: number
        progressPercentage: number
        createdAt: string
      }>
      totalCount: number
    }>()
    getWorkOrders
      .mockResolvedValueOnce({ items: [], totalCount: 0 })
      .mockReturnValueOnce(pendingRequest.promise)
      .mockResolvedValueOnce({
        items: [
          {
            id: 'wo-completed',
            orderNumber: 'WO-COMPLETED',
            productCode: 'PRD-COMPLETED',
            productName: '已完成泵体',
            plannedQuantity: 60,
            completedQuantity: 60,
            plannedStartDate: '2026-06-02T08:00:00',
            plannedEndDate: '2026-06-02T18:00:00',
            status: 'completed',
            workshopId: 'WS-001',
            priority: 1,
            progressPercentage: 100,
            createdAt: '2026-06-01T00:00:00',
          },
        ],
        totalCount: 1,
      })
    const wrapper = mountProductionBoard()
    await flushPromises()

    await wrapper.get('.filter-select').setValue('pending')
    await wrapper.get('.filter-select').setValue('completed')
    await flushPromises()

    expect(wrapper.findAll('.wo-card')).toHaveLength(1)
    expect(wrapper.get('.wo-number').text()).toBe('WO-COMPLETED')

    pendingRequest.resolve({
      items: [
        {
          id: 'wo-pending',
          orderNumber: 'WO-PENDING',
          productCode: 'PRD-PENDING',
          productName: '待生产泵体',
          plannedQuantity: 60,
          completedQuantity: 0,
          plannedStartDate: '2026-06-03T08:00:00',
          plannedEndDate: '2026-06-03T18:00:00',
          status: 'pending',
          workshopId: 'WS-001',
          priority: 2,
          progressPercentage: 0,
          createdAt: '2026-06-01T00:00:00',
        },
      ],
      totalCount: 1,
    })
    await flushPromises()

    expect(wrapper.findAll('.wo-card')).toHaveLength(1)
    expect(wrapper.get('.wo-number').text()).toBe('WO-COMPLETED')
  })

  it('selects the scanned work order and announces the matched operation', async () => {
    getWorkOrders.mockResolvedValue({
      items: [
        {
          id: 'wo-20',
          orderNumber: 'WO-020',
          productCode: 'PRD-020',
          productName: '泵体精加工',
          plannedQuantity: 80,
          completedQuantity: 12,
          plannedStartDate: '2026-06-02T08:00:00',
          plannedEndDate: '2026-06-02T18:00:00',
          status: 'in_progress',
          workshopId: 'WS-001',
          priority: 1,
          progressPercentage: 15,
          createdAt: '2026-06-01T00:00:00',
        },
      ],
      totalCount: 1,
    })
    scanOperation.mockResolvedValue({
      operationId: 'op-20',
      workOrderId: 'wo-20',
      workOrderNumber: 'WO-020',
      productCode: 'PRD-020',
      productName: '泵体精加工',
      operationCode: 'OP-20',
      operationName: '精加工',
      plannedQuantity: 80,
      completedQuantity: 12,
      status: 'in_progress',
    })
    const wrapper = mountProductionBoard()
    await flushPromises()

    await wrapper.get('.scan-input').setValue('WO-020-OP-20')
    await wrapper.get('.scan-btn').trigger('click')
    await flushPromises()

    expect(scanOperation).toHaveBeenCalledWith('WO-020-OP-20', 'operator1')
    expect(wrapper.get('.detail-title-row h3').text()).toBe('WO-020')
    expect(wrapper.get('.op-code').text()).toBe('OP-20')
    expect(wrapper.get('.op-name').text()).toBe('精加工')
    const status = wrapper.get('[role="status"]')
    expect(status.classes()).toContain('notification')
    expect(status.text()).toContain('已定位工序：WO-020 / OP-20')
  })

  it('keeps the latest scanned operation when an earlier scan finishes later', async () => {
    getWorkOrders.mockResolvedValue({
      items: [
        {
          id: 'wo-slow',
          orderNumber: 'WO-SLOW',
          productCode: 'PRD-SLOW',
          productName: '慢响应泵体',
          plannedQuantity: 80,
          completedQuantity: 12,
          plannedStartDate: '2026-06-02T08:00:00',
          plannedEndDate: '2026-06-02T18:00:00',
          status: 'in_progress',
          workshopId: 'WS-001',
          priority: 2,
          progressPercentage: 15,
          createdAt: '2026-06-01T00:00:00',
        },
        {
          id: 'wo-fast',
          orderNumber: 'WO-FAST',
          productCode: 'PRD-FAST',
          productName: '快响应泵体',
          plannedQuantity: 60,
          completedQuantity: 30,
          plannedStartDate: '2026-06-02T08:00:00',
          plannedEndDate: '2026-06-02T18:00:00',
          status: 'in_progress',
          workshopId: 'WS-001',
          priority: 1,
          progressPercentage: 50,
          createdAt: '2026-06-01T00:00:00',
        },
      ],
      totalCount: 2,
    })
    const slowOperation = {
      operationId: 'op-slow',
      workOrderId: 'wo-slow',
      workOrderNumber: 'WO-SLOW',
      productCode: 'PRD-SLOW',
      productName: '慢响应泵体',
      operationCode: 'OP-SLOW',
      operationName: '慢响应精加工',
      plannedQuantity: 80,
      completedQuantity: 12,
      status: 'in_progress',
    }
    const slowScan = createDeferred<typeof slowOperation>()
    scanOperation
      .mockReturnValueOnce(slowScan.promise)
      .mockResolvedValueOnce({
        operationId: 'op-fast',
        workOrderId: 'wo-fast',
        workOrderNumber: 'WO-FAST',
        productCode: 'PRD-FAST',
        productName: '快响应泵体',
        operationCode: 'OP-FAST',
        operationName: '快响应精加工',
        plannedQuantity: 60,
        completedQuantity: 30,
        status: 'in_progress',
      })
    const wrapper = mountProductionBoard()
    await flushPromises()

    await wrapper.get('.scan-input').setValue('WO-SLOW-OP-SLOW')
    await wrapper.get('.scan-btn').trigger('click')
    await wrapper.get('.scan-input').setValue('WO-FAST-OP-FAST')
    await wrapper.get('.scan-btn').trigger('click')
    await flushPromises()

    expect(wrapper.get('.detail-title-row h3').text()).toBe('WO-FAST')
    expect(wrapper.get('.op-code').text()).toBe('OP-FAST')

    slowScan.resolve(slowOperation)
    await flushPromises()

    expect(wrapper.get('.detail-title-row h3').text()).toBe('WO-FAST')
    expect(wrapper.get('.op-code').text()).toBe('OP-FAST')
  })

  it('keeps the latest selected work order operations when an earlier selection finishes later', async () => {
    getWorkOrders.mockResolvedValue({
      items: [
        {
          id: 'wo-select-slow',
          orderNumber: 'WO-SELECT-SLOW',
          productCode: 'PRD-SELECT-SLOW',
          productName: '慢响应点选泵体',
          plannedQuantity: 80,
          completedQuantity: 12,
          plannedStartDate: '2026-06-02T08:00:00',
          plannedEndDate: '2026-06-02T18:00:00',
          status: 'in_progress',
          workshopId: 'WS-001',
          priority: 2,
          progressPercentage: 15,
          createdAt: '2026-06-01T00:00:00',
        },
        {
          id: 'wo-select-fast',
          orderNumber: 'WO-SELECT-FAST',
          productCode: 'PRD-SELECT-FAST',
          productName: '快响应点选泵体',
          plannedQuantity: 60,
          completedQuantity: 30,
          plannedStartDate: '2026-06-02T08:00:00',
          plannedEndDate: '2026-06-02T18:00:00',
          status: 'in_progress',
          workshopId: 'WS-001',
          priority: 1,
          progressPercentage: 50,
          createdAt: '2026-06-01T00:00:00',
        },
      ],
      totalCount: 2,
    })
    const slowOperation = {
      operationId: 'op-select-slow',
      workOrderId: 'wo-select-slow',
      workOrderNumber: 'WO-SELECT-SLOW',
      productCode: 'PRD-SELECT-SLOW',
      productName: '慢响应点选泵体',
      operationCode: 'OP-SELECT-SLOW',
      operationName: '慢响应点选精加工',
      plannedQuantity: 80,
      completedQuantity: 12,
      status: 'in_progress',
    }
    const slowSelection = createDeferred<typeof slowOperation>()
    scanOperation
      .mockReturnValueOnce(slowSelection.promise)
      .mockResolvedValueOnce({
        operationId: 'op-select-fast',
        workOrderId: 'wo-select-fast',
        workOrderNumber: 'WO-SELECT-FAST',
        productCode: 'PRD-SELECT-FAST',
        productName: '快响应点选泵体',
        operationCode: 'OP-SELECT-FAST',
        operationName: '快响应点选精加工',
        plannedQuantity: 60,
        completedQuantity: 30,
        status: 'in_progress',
      })
    const wrapper = mountProductionBoard()
    await flushPromises()
    const cards = wrapper.findAll('.wo-card')

    await cards[0].trigger('click')
    await cards[1].trigger('click')
    await flushPromises()

    expect(wrapper.get('.detail-title-row h3').text()).toBe('WO-SELECT-FAST')
    expect(wrapper.get('.op-code').text()).toBe('OP-SELECT-FAST')

    slowSelection.resolve(slowOperation)
    await flushPromises()

    expect(wrapper.get('.detail-title-row h3').text()).toBe('WO-SELECT-FAST')
    expect(wrapper.get('.op-code').text()).toBe('OP-SELECT-FAST')
  })

  it('clears previous operations while loading a newly selected work order', async () => {
    getWorkOrders.mockResolvedValue({
      items: [
        {
          id: 'wo-loaded',
          orderNumber: 'WO-LOADED',
          productCode: 'PRD-LOADED',
          productName: '已加载泵体',
          plannedQuantity: 80,
          completedQuantity: 12,
          plannedStartDate: '2026-06-02T08:00:00',
          plannedEndDate: '2026-06-02T18:00:00',
          status: 'in_progress',
          workshopId: 'WS-001',
          priority: 2,
          progressPercentage: 15,
          createdAt: '2026-06-01T00:00:00',
        },
        {
          id: 'wo-loading',
          orderNumber: 'WO-LOADING',
          productCode: 'PRD-LOADING',
          productName: '加载中泵体',
          plannedQuantity: 60,
          completedQuantity: 30,
          plannedStartDate: '2026-06-02T08:00:00',
          plannedEndDate: '2026-06-02T18:00:00',
          status: 'in_progress',
          workshopId: 'WS-001',
          priority: 1,
          progressPercentage: 50,
          createdAt: '2026-06-01T00:00:00',
        },
      ],
      totalCount: 2,
    })
    const loadingOperation = {
      operationId: 'op-loading',
      workOrderId: 'wo-loading',
      workOrderNumber: 'WO-LOADING',
      productCode: 'PRD-LOADING',
      productName: '加载中泵体',
      operationCode: 'OP-LOADING',
      operationName: '加载中精加工',
      plannedQuantity: 60,
      completedQuantity: 30,
      status: 'in_progress',
    }
    const loadingSelection = createDeferred<typeof loadingOperation>()
    scanOperation
      .mockResolvedValueOnce({
        operationId: 'op-loaded',
        workOrderId: 'wo-loaded',
        workOrderNumber: 'WO-LOADED',
        productCode: 'PRD-LOADED',
        productName: '已加载泵体',
        operationCode: 'OP-LOADED',
        operationName: '已加载精加工',
        plannedQuantity: 80,
        completedQuantity: 12,
        status: 'in_progress',
      })
      .mockReturnValueOnce(loadingSelection.promise)
    const wrapper = mountProductionBoard()
    await flushPromises()
    const cards = wrapper.findAll('.wo-card')

    await cards[0].trigger('click')
    await flushPromises()
    expect(wrapper.get('.detail-title-row h3').text()).toBe('WO-LOADED')
    expect(wrapper.get('.op-code').text()).toBe('OP-LOADED')

    await cards[1].trigger('click')
    await flushPromises()

    expect(wrapper.get('.detail-title-row h3').text()).toBe('WO-LOADING')
    expect(wrapper.find('.op-code').exists()).toBe(false)

    loadingSelection.resolve(loadingOperation)
    await flushPromises()

    expect(wrapper.get('.op-code').text()).toBe('OP-LOADING')
  })

  it('keeps scanned operation when an earlier manual selection finishes later', async () => {
    getWorkOrders.mockResolvedValue({
      items: [
        {
          id: 'wo-manual-slow',
          orderNumber: 'WO-MANUAL-SLOW',
          productCode: 'PRD-MANUAL-SLOW',
          productName: '慢点选泵体',
          plannedQuantity: 80,
          completedQuantity: 12,
          plannedStartDate: '2026-06-02T08:00:00',
          plannedEndDate: '2026-06-02T18:00:00',
          status: 'in_progress',
          workshopId: 'WS-001',
          priority: 2,
          progressPercentage: 15,
          createdAt: '2026-06-01T00:00:00',
        },
        {
          id: 'wo-scan-fast',
          orderNumber: 'WO-SCAN-FAST',
          productCode: 'PRD-SCAN-FAST',
          productName: '快扫码泵体',
          plannedQuantity: 60,
          completedQuantity: 30,
          plannedStartDate: '2026-06-02T08:00:00',
          plannedEndDate: '2026-06-02T18:00:00',
          status: 'in_progress',
          workshopId: 'WS-001',
          priority: 1,
          progressPercentage: 50,
          createdAt: '2026-06-01T00:00:00',
        },
      ],
      totalCount: 2,
    })
    const manualOperation = {
      operationId: 'op-manual-slow',
      workOrderId: 'wo-manual-slow',
      workOrderNumber: 'WO-MANUAL-SLOW',
      productCode: 'PRD-MANUAL-SLOW',
      productName: '慢点选泵体',
      operationCode: 'OP-MANUAL-SLOW',
      operationName: '慢点选精加工',
      plannedQuantity: 80,
      completedQuantity: 12,
      status: 'in_progress',
    }
    const manualSelection = createDeferred<typeof manualOperation>()
    scanOperation
      .mockReturnValueOnce(manualSelection.promise)
      .mockResolvedValueOnce({
        operationId: 'op-scan-fast',
        workOrderId: 'wo-scan-fast',
        workOrderNumber: 'WO-SCAN-FAST',
        productCode: 'PRD-SCAN-FAST',
        productName: '快扫码泵体',
        operationCode: 'OP-SCAN-FAST',
        operationName: '快扫码精加工',
        plannedQuantity: 60,
        completedQuantity: 30,
        status: 'in_progress',
      })
    const wrapper = mountProductionBoard()
    await flushPromises()

    await wrapper.findAll('.wo-card')[0].trigger('click')
    await wrapper.get('.scan-input').setValue('WO-SCAN-FAST-OP-SCAN-FAST')
    await wrapper.get('.scan-btn').trigger('click')
    await flushPromises()

    expect(wrapper.get('.detail-title-row h3').text()).toBe('WO-SCAN-FAST')
    expect(wrapper.get('.op-code').text()).toBe('OP-SCAN-FAST')

    manualSelection.resolve(manualOperation)
    await flushPromises()

    expect(wrapper.get('.detail-title-row h3').text()).toBe('WO-SCAN-FAST')
    expect(wrapper.get('.op-code').text()).toBe('OP-SCAN-FAST')
  })

  it('keeps pending operation state when start api fails', async () => {
    getWorkOrders.mockResolvedValue({
      items: [
        {
          id: 'wo-start',
          orderNumber: 'WO-START',
          productCode: 'PRD-START',
          productName: '泵体开工件',
          plannedQuantity: 30,
          completedQuantity: 0,
          plannedStartDate: '2026-06-02T08:00:00',
          plannedEndDate: '2026-06-02T18:00:00',
          status: 'pending',
          workshopId: 'WS-001',
          priority: 1,
          progressPercentage: 0,
          createdAt: '2026-06-01T00:00:00',
        },
      ],
      totalCount: 1,
    })
    startOperation.mockRejectedValueOnce(new Error('设备 CNC-002 已被占用'))
    const wrapper = mountProductionBoard()
    await flushPromises()

    await wrapper.get('.wo-card').trigger('click')
    await flushPromises()
    await wrapper.get('.op-btn.start').trigger('click')
    await flushPromises()
    await wrapper.get('.dialog-confirm').trigger('click')
    await flushPromises()

    expect(startOperation).toHaveBeenCalledWith('OP-001', {
      operatorId: 'operator1',
      stationId: 'ST-001',
      equipmentId: 'EQ-001',
    })
    expect(wrapper.get('.op-badge').text()).toBe('待生产')
    expect(wrapper.get('.wo-badge.large').text()).toBe('待生产')
    const alert = wrapper.get('[role="alert"]')
    expect(alert.classes()).toContain('notification')
    expect(alert.text()).toContain('开工失败：设备 CNC-002 已被占用')
  })

  it('fails loud when barcode start evidence cannot be archived after backend start succeeds', async () => {
    getWorkOrders.mockResolvedValue({
      items: [
        {
          id: 'WO-RUSH-9001',
          orderNumber: 'WO-RUSH-9001',
          productCode: 'PROD-RUSH-01',
          productName: '急单阀体组件',
          plannedQuantity: 30,
          completedQuantity: 0,
          plannedStartDate: '2026-05-21T09:00:00',
          plannedEndDate: '2026-05-21T16:00:00',
          status: 'pending',
          workshopId: 'WS-001',
          priority: 0,
          progressPercentage: 0,
          createdAt: '2026-05-21T08:30:00',
        },
      ],
      totalCount: 1,
    })
    upsertOtdEvidenceChainRecord.mockImplementationOnce(() => {
      throw new Error('barcode start evidence storage unavailable')
    })
    const wrapper = mountProductionBoard()
    await flushPromises()

    await wrapper.get('.scan-input').setValue('WO-RUSH-9001')
    await wrapper.get('.scan-btn').trigger('click')
    await flushPromises()
    await wrapper.get('.barcode-context-actions button').trigger('click')
    await flushPromises()
    await wrapper.get('.dialog-confirm').trigger('click')
    await flushPromises()

    expect(startOperation).toHaveBeenCalledWith('OP-RUSH-10', {
      operatorId: 'operator1',
      stationId: 'ST-CNC-02',
      equipmentId: 'CNC-002',
    })
    const alert = wrapper.get('[role="alert"]')
    expect(alert.classes()).toContain('notification')
    expect(alert.classes()).toContain('error')
    expect(alert.text()).toContain('开工证据写入失败，后端开工已提交但人员替班/扫码/OTD 证据未归档')
    expect(alert.text()).toContain('barcode start evidence storage unavailable')
    expect(wrapper.text()).not.toContain('已开工：CNC 精加工')
    expect(wrapper.text()).not.toContain('已写入生产开工证据')
  })

  it('identifies labor reassignment evidence failures after backend start succeeds', async () => {
    getWorkOrders.mockResolvedValue({
      items: [
        {
          id: 'wo-reassigned-start',
          orderNumber: 'WO-013',
          productCode: 'PRD-003',
          productName: '淬火热处理',
          plannedQuantity: 200,
          completedQuantity: 0,
          plannedStartDate: '2026-05-12T10:00:00',
          plannedEndDate: '2026-05-12T14:00:00',
          status: 'pending',
          workshopId: 'WS-001',
          priority: 3,
          progressPercentage: 0,
          createdAt: '2026-05-11T00:00:00',
        },
      ],
      totalCount: 1,
    })
    readLaborReassignmentForOperation.mockReturnValue({
      id: 'labor-reassignment-WO-013-heat-treatment',
      workOrderNumber: 'WO-013',
      operationCode: 'OP-10',
      operationCodes: ['OP-10', 'OP-20'],
      operationName: '淬火 / 回火',
      blockedEmployeeNumber: 'EMP-003',
      blockedEmployeeName: '王五',
      blockedCertification: '热处理上岗证',
      blockedExpiresAt: '2026-05-25',
      replacementEmployeeNumber: 'EMP-006',
      replacementEmployeeName: '孙八',
      replacementTeam: '甲班',
      replacementShift: '白班',
      replacementSkill: '热处理替班复核 / 派工确认',
      replacementCertification: '班组长授权',
      replacementExpiresAt: '2026-09-30',
      reviewerEmployeeNumber: 'EMP-004',
      reviewerName: '赵六',
      reviewerRole: '工程放行',
      reason: '热处理临期人员已改由班组长替班复核。',
      auditId: 'AUD-LABOR-REASSIGN-20260520-001',
      traceId: 'TRACE-LABOR-REASSIGN-WO-013-OP-10',
      createdAt: '2026-05-31T09:00:00.000Z',
      status: 'approved',
    })
    writeLaborReassignmentExecutionEvidence.mockImplementationOnce(() => {
      throw new Error('labor reassignment evidence storage unavailable')
    })
    const wrapper = mountProductionBoard()
    await flushPromises()

    await wrapper.get('.wo-card').trigger('click')
    await flushPromises()
    await wrapper.get('.op-btn.start').trigger('click')
    await flushPromises()
    await wrapper.get('.dialog-confirm').trigger('click')
    await flushPromises()

    expect(startOperation).toHaveBeenCalledWith('OP-007', {
      operatorId: 'operator1',
      stationId: 'ST-HT-01',
      equipmentId: 'HT-001',
    })
    const alert = wrapper.get('[role="alert"]')
    expect(alert.classes()).toContain('notification')
    expect(alert.classes()).toContain('error')
    expect(alert.text()).toContain('开工证据写入失败，后端开工已提交但人员替班/扫码/OTD 证据未归档')
    expect(alert.text()).toContain('labor reassignment evidence storage unavailable')
    expect(wrapper.text()).not.toContain('已开工：淬火')
  })

  it('keeps in-progress operation state when completion api fails', async () => {
    getWorkOrders.mockResolvedValue({
      items: [
        {
          id: 'wo-complete',
          orderNumber: 'WO-COMPLETE',
          productCode: 'PRD-COMPLETE',
          productName: '泵体完工件',
          plannedQuantity: 30,
          completedQuantity: 10,
          plannedStartDate: '2026-06-02T08:00:00',
          plannedEndDate: '2026-06-02T18:00:00',
          status: 'in_progress',
          workshopId: 'WS-001',
          priority: 1,
          progressPercentage: 33,
          createdAt: '2026-06-01T00:00:00',
        },
      ],
      totalCount: 1,
    })
    completeOperation.mockRejectedValueOnce(new Error('质检结果未同步'))
    const wrapper = mountProductionBoard()
    await flushPromises()

    await wrapper.get('.wo-card').trigger('click')
    await flushPromises()
    await wrapper.get('.op-btn.complete').trigger('click')
    await flushPromises()
    await wrapper.get('.dialog-confirm').trigger('click')
    await flushPromises()

    expect(completeOperation).toHaveBeenCalledWith('OP-001', {
      quantity: 20,
      defectQuantity: 0,
      inspectionResult: 'Pass',
      reportedBy: 'operator1',
    })
    expect(wrapper.get('.op-badge').text()).toBe('生产中')
    expect(wrapper.get('.wo-badge.large').text()).toBe('生产中')
    expect(wrapper.get('.detail-progress-text').text()).toBe('进度 33%')
    const alert = wrapper.get('[role="alert"]')
    expect(alert.classes()).toContain('notification')
    expect(alert.text()).toContain('完工失败：质检结果未同步')
  })

  it('writes completion and OTD review evidence when an in-progress operation is completed', async () => {
    getWorkOrders.mockResolvedValue({
      items: [
        {
          id: 'wo-completion-success',
          orderNumber: 'WO-COMPLETE-SUCCESS',
          productCode: 'PRD-COMPLETE-SUCCESS',
          productName: '泵体完工闭环件',
          plannedQuantity: 30,
          completedQuantity: 10,
          plannedStartDate: '2099-06-02T08:00:00',
          plannedEndDate: '2099-06-02T18:00:00',
          status: 'in_progress',
          workshopId: 'WS-001',
          priority: 1,
          progressPercentage: 33,
          createdAt: '2099-06-01T00:00:00',
        },
      ],
      totalCount: 1,
    })
    const wrapper = mountProductionBoard()
    await flushPromises()

    await wrapper.get('.wo-card').trigger('click')
    await flushPromises()
    await wrapper.get('.op-btn.complete').trigger('click')
    await flushPromises()
    await wrapper.get('.dialog-confirm').trigger('click')
    await flushPromises()

    expect(completeOperation).toHaveBeenCalledWith('OP-001', {
      quantity: 20,
      defectQuantity: 0,
      inspectionResult: 'Pass',
      reportedBy: 'operator1',
    })
    expect(wrapper.get('.op-badge').text()).toBe('已完成')
    expect(wrapper.get('.wo-badge.large').text()).toBe('已完成')
    expect(wrapper.get('.detail-progress-text').text()).toBe('进度 100%')
    expect(upsertOtdEvidenceChainRecord).toHaveBeenCalledWith(expect.objectContaining({
      id: 'production-closeout-OP-001',
      stage: '生产复核',
      title: 'WO-COMPLETE-SUCCESS 工序 1 完工复核',
      status: 'closed',
      statusLabel: '完工复核已提交',
    }))
    expect(upsertOtdEvidenceChainRecord).toHaveBeenCalledWith(expect.objectContaining({
      id: 'production-completion-OP-001',
      stage: '生产完工',
      title: 'WO-COMPLETE-SUCCESS 工序 1 完工回写',
      status: 'closed',
      statusLabel: 'OTD 达成',
    }))
    const status = wrapper.get('[role="status"]')
    expect(status.classes()).toContain('notification')
    expect(status.text()).toContain('完工报告已提交：工序 1')
  })

  it('fails loud when completion evidence cannot be archived after backend completion succeeds', async () => {
    getWorkOrders.mockResolvedValue({
      items: [
        {
          id: 'wo-completion-evidence',
          orderNumber: 'WO-COMPLETE-EVIDENCE',
          productCode: 'PRD-COMPLETE-EVIDENCE',
          productName: '泵体证据件',
          plannedQuantity: 30,
          completedQuantity: 10,
          plannedStartDate: '2026-06-02T08:00:00',
          plannedEndDate: '2026-06-02T18:00:00',
          status: 'in_progress',
          workshopId: 'WS-001',
          priority: 1,
          progressPercentage: 33,
          createdAt: '2026-06-01T00:00:00',
        },
      ],
      totalCount: 1,
    })
    upsertOtdEvidenceChainRecord.mockImplementationOnce(() => {
      throw new Error('otd evidence storage unavailable')
    })
    const wrapper = mountProductionBoard()
    await flushPromises()

    await wrapper.get('.wo-card').trigger('click')
    await flushPromises()
    await wrapper.get('.op-btn.complete').trigger('click')
    await flushPromises()
    await wrapper.get('.dialog-confirm').trigger('click')
    await flushPromises()

    expect(completeOperation).toHaveBeenCalledWith('OP-001', {
      quantity: 20,
      defectQuantity: 0,
      inspectionResult: 'Pass',
      reportedBy: 'operator1',
    })
    const alert = wrapper.get('[role="alert"]')
    expect(alert.classes()).toContain('notification')
    expect(alert.classes()).toContain('error')
    expect(alert.text()).toContain('完工证据写入失败，后端完工已提交但 OTD/质量证据未归档')
    expect(alert.text()).toContain('otd evidence storage unavailable')
    expect(wrapper.text()).not.toContain('完工报告已提交')
  })

  it('does not write anomaly evidence when exception api fails', async () => {
    getWorkOrders.mockResolvedValue({
      items: [
        {
          id: 'wo-exception',
          orderNumber: 'WO-EXCEPTION',
          productCode: 'PRD-EXCEPTION',
          productName: '泵体异常件',
          plannedQuantity: 30,
          completedQuantity: 10,
          plannedStartDate: '2026-06-02T08:00:00',
          plannedEndDate: '2026-06-02T18:00:00',
          status: 'in_progress',
          workshopId: 'WS-001',
          priority: 1,
          progressPercentage: 33,
          createdAt: '2026-06-01T00:00:00',
        },
      ],
      totalCount: 1,
    })
    reportException.mockRejectedValueOnce(new Error('异常服务不可用'))
    const wrapper = mountProductionBoard()
    await flushPromises()

    await wrapper.get('.wo-card').trigger('click')
    await flushPromises()
    await wrapper.get('.op-btn.exception').trigger('click')
    await flushPromises()
    await wrapper.get('textarea').setValue('主轴温度异常升高')
    await wrapper.get('.dialog-confirm.danger').trigger('click')
    await flushPromises()

    expect(reportException).toHaveBeenCalledWith('OP-001', { reason: '主轴温度异常升高' })
    expect(writeProductionAnomalyEvent).not.toHaveBeenCalled()
    expect(upsertOtdEvidenceChainRecord).not.toHaveBeenCalled()
    const alert = wrapper.get('[role="alert"]')
    expect(alert.classes()).toContain('notification')
    expect(alert.text()).toContain('异常上报失败：异常服务不可用')
    expect(wrapper.text()).not.toContain('异常已进入处置队列')
  })

  it('exposes exception reporting as a labelled modal dialog', async () => {
    getWorkOrders.mockResolvedValue({
      items: [
        {
          id: 'wo-exception-dialog',
          orderNumber: 'WO-EXCEPTION-DIALOG',
          productCode: 'PRD-EXCEPTION-DIALOG',
          productName: '泵体异常弹窗件',
          plannedQuantity: 30,
          completedQuantity: 10,
          plannedStartDate: '2026-06-02T08:00:00',
          plannedEndDate: '2026-06-02T18:00:00',
          status: 'in_progress',
          workshopId: 'WS-001',
          priority: 1,
          progressPercentage: 33,
          createdAt: '2026-06-01T00:00:00',
        },
      ],
      totalCount: 1,
    })
    const wrapper = mountProductionBoard()
    await flushPromises()

    await wrapper.get('.wo-card').trigger('click')
    await flushPromises()
    await wrapper.get('.op-btn.exception').trigger('click')
    await flushPromises()

    const dialog = wrapper.get('[role="dialog"]')
    expect(dialog.attributes('aria-modal')).toBe('true')
    expect(dialog.attributes('aria-labelledby')).toBe('production-exception-dialog-title')
    expect(wrapper.get('#production-exception-dialog-title').text()).toBe('异常上报')
    expect(dialog.get('.dialog-cancel').attributes('aria-label')).toBe('取消异常上报')
  })

  it('writes anomaly management and OTD evidence when an in-progress operation reports an exception', async () => {
    getWorkOrders.mockResolvedValue({
      items: [
        {
          id: 'wo-exception-success',
          orderNumber: 'WO-EXCEPTION-SUCCESS',
          productCode: 'PRD-EXCEPTION-SUCCESS',
          productName: '泵体异常闭环件',
          plannedQuantity: 30,
          completedQuantity: 10,
          plannedStartDate: '2026-06-02T08:00:00',
          plannedEndDate: '2026-06-02T18:00:00',
          status: 'in_progress',
          workshopId: 'WS-001',
          priority: 1,
          progressPercentage: 33,
          createdAt: '2026-06-01T00:00:00',
        },
      ],
      totalCount: 1,
    })
    const wrapper = mountProductionBoard()
    await flushPromises()

    await wrapper.get('.wo-card').trigger('click')
    await flushPromises()
    await wrapper.get('.op-btn.exception').trigger('click')
    await flushPromises()
    await wrapper.get('textarea').setValue('主轴温度异常升高')
    await wrapper.get('.dialog-confirm.danger').trigger('click')
    await flushPromises()

    expect(reportException).toHaveBeenCalledWith('OP-001', { reason: '主轴温度异常升高' })
    expect(writeProductionAnomalyEvent).toHaveBeenCalledWith(expect.objectContaining({
      workOrderNumber: 'WO-EXCEPTION-SUCCESS',
      operationCode: 'OP-10',
      operationName: '工序 1',
      anomalyType: 'process',
      severity: 'High',
      description: '主轴温度异常升高',
      detectedBy: 'operator1',
    }))
    expect(upsertOtdEvidenceChainRecord).toHaveBeenCalledWith(expect.objectContaining({
      id: 'production-anomaly-WO-EXCEPTION-SUCCESS-OP-10',
      stage: '生产异常',
      title: 'WO-EXCEPTION-SUCCESS 工序 1 异常上报进入风险联动',
      object: 'WO-EXCEPTION-SUCCESS',
      status: 'active',
      statusLabel: '异常待分流',
    }))
    const alert = wrapper.get('[role="alert"]')
    expect(alert.classes()).toContain('notification')
    expect(alert.classes()).toContain('error')
    expect(alert.text()).toContain('异常已上报：主轴温度异常升高')
  })

  it('fails loud when exception evidence cannot be archived after backend exception succeeds', async () => {
    getWorkOrders.mockResolvedValue({
      items: [
        {
          id: 'wo-exception-evidence',
          orderNumber: 'WO-EXCEPTION-EVIDENCE',
          productCode: 'PRD-EXCEPTION-EVIDENCE',
          productName: '泵体异常证据件',
          plannedQuantity: 30,
          completedQuantity: 10,
          plannedStartDate: '2026-06-02T08:00:00',
          plannedEndDate: '2026-06-02T18:00:00',
          status: 'in_progress',
          workshopId: 'WS-001',
          priority: 1,
          progressPercentage: 33,
          createdAt: '2026-06-01T00:00:00',
        },
      ],
      totalCount: 1,
    })
    writeProductionAnomalyEvent.mockImplementationOnce(() => {
      throw new Error('production anomaly storage unavailable')
    })
    const wrapper = mountProductionBoard()
    await flushPromises()

    await wrapper.get('.wo-card').trigger('click')
    await flushPromises()
    await wrapper.get('.op-btn.exception').trigger('click')
    await flushPromises()
    await wrapper.get('textarea').setValue('主轴温度异常升高')
    await wrapper.get('.dialog-confirm.danger').trigger('click')
    await flushPromises()

    expect(reportException).toHaveBeenCalledWith('OP-001', { reason: '主轴温度异常升高' })
    const alert = wrapper.get('[role="alert"]')
    expect(alert.classes()).toContain('notification')
    expect(alert.classes()).toContain('error')
    expect(alert.text()).toContain('异常证据写入失败，后端异常已上报但异常管理/OTD 证据未归档')
    expect(alert.text()).toContain('production anomaly storage unavailable')
    expect(wrapper.text()).not.toContain('异常已上报：主轴温度异常升高')
  })
})
