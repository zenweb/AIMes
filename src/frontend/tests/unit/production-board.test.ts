import { flushPromises, mount } from '@vue/test-utils'
import { reactive } from 'vue'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import ProductionBoard from '../../src/components/production/ProductionBoard.vue'

const getWorkOrders = vi.hoisted(() => vi.fn())
const scanOperation = vi.hoisted(() => vi.fn())
const startOperation = vi.hoisted(() => vi.fn())
const completeOperation = vi.hoisted(() => vi.fn())
const reportException = vi.hoisted(() => vi.fn())
const readLaborQualificationBlockForOperation = vi.hoisted(() => vi.fn())
const readLaborReassignmentForOperation = vi.hoisted(() => vi.fn())
const readLaborQualificationBlocksBackendFirst = vi.hoisted(() => vi.fn())
const readLaborReassignmentsBackendFirst = vi.hoisted(() => vi.fn())
const isLaborQualificationBlockForOperation = vi.hoisted(() => vi.fn())
const isLaborReassignmentForOperation = vi.hoisted(() => vi.fn())
const writeLaborReassignmentExecutionEvidence = vi.hoisted(() => vi.fn())
const readPocPilotRunRecordBackendFirst = vi.hoisted(() => vi.fn())
const writeProductionAnomalyEvent = vi.hoisted(() => vi.fn())
const upsertOtdEvidenceChainRecord = vi.hoisted(() => vi.fn())
const readBarcodeScanEvidenceRecords = vi.hoisted(() => vi.fn(() => []))
const mockRouteQueryState = vi.hoisted(() => ({} as Record<string, unknown>))
const mockRouteQuery = reactive(mockRouteQueryState)
const isOfflineDemoError = vi.hoisted(() =>
  vi.fn((error: unknown) => error instanceof Error && error.name === 'OfflineDemoApiError')
)

vi.mock('../../src/api/production', () => ({
  getWorkOrders,
  scanOperation,
  startOperation,
  completeOperation,
  reportException,
}))

vi.mock('vue-router', () => ({
  useRoute: () => ({ query: mockRouteQuery }),
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
  readBarcodeScanEvidenceRecords,
}))

vi.mock('../../src/utils/labor-assignment-sync', () => ({
  isLaborQualificationBlockForOperation,
  isLaborReassignmentForOperation,
  readLaborQualificationBlocksBackendFirst,
  readLaborQualificationBlockForOperation,
  readLaborReassignmentsBackendFirst,
  readLaborReassignmentForOperation,
  writeLaborReassignmentExecutionEvidence,
}))

vi.mock('../../src/utils/production-anomaly-sync', () => ({
  writeProductionAnomalyEvent,
}))

vi.mock('../../src/utils/otd-evidence-chain-sync', () => ({
  upsertOtdEvidenceChainRecord,
}))

vi.mock('../../src/utils/offline-demo-mode', () => ({
  isOfflineDemoError,
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

function defaultOperationForCode(code: string) {
  const workOrderNumber = code.toUpperCase()
  const isActiveOperation = /COMPLETE|COMPLETION|EXCEPTION|ANOMALY|RUNNING|PROGRESS/.test(workOrderNumber)
  const isCompletedOperation = /COMPLETED|READONLY|DUPLICATE/.test(workOrderNumber)
  const knownOperations: Record<string, {
    operationId: string
    operationCode: string
    operationName: string
    productCode: string
    productName: string
    plannedQuantity: number
    completedQuantity: number
    status: string
  }> = {
    'WO-013': {
      operationId: 'OP-007',
      operationCode: 'OP-10',
      operationName: '淬火',
      productCode: 'PRD-003',
      productName: '淬火热处理',
      plannedQuantity: 200,
      completedQuantity: 0,
      status: 'pending',
      nextOperation: {
        operationId: 'OP-008',
        operationCode: 'OP-20',
        operationName: '回火',
      },
    },
    'WO-008': {
      operationId: 'OP-006',
      operationCode: 'OP-10',
      operationName: '注塑成型',
      productCode: 'PRD-002',
      productName: '外壳注塑',
      plannedQuantity: 500,
      completedQuantity: 500,
      status: 'completed',
    },
    'WO-RUSH-9001': {
      operationId: 'OP-RUSH-10',
      operationCode: 'OP-10',
      operationName: 'CNC 精加工',
      productCode: 'PROD-RUSH-01',
      productName: '急单阀体组件',
      plannedQuantity: 30,
      completedQuantity: 0,
      status: 'pending',
      nextOperation: {
        operationId: 'OP-RUSH-20',
        operationCode: 'OP-20',
        operationName: '装配复检',
      },
    },
  }
  const known = knownOperations[workOrderNumber]
  if (known) {
    return {
      ...known,
      workOrderId: workOrderNumber,
      workOrderNumber,
      nextOperation: known.nextOperation
        ? {
            ...known.nextOperation,
            workOrderId: workOrderNumber,
            workOrderNumber,
            productCode: known.productCode,
            productName: known.productName,
            plannedQuantity: known.plannedQuantity,
            completedQuantity: 0,
            status: 'pending',
          }
        : null,
    }
  }
  return {
    operationId: 'OP-001',
    workOrderId: `wo-${workOrderNumber.toLowerCase()}`,
    workOrderNumber,
    productCode: 'PRD-DEFAULT',
    productName: '后端工单',
    operationCode: 'OP-10',
    operationName: '工序 1',
    plannedQuantity: 30,
    completedQuantity: isCompletedOperation ? 30 : isActiveOperation ? 10 : 0,
    status: isCompletedOperation ? 'completed' : isActiveOperation ? 'in_progress' : 'pending',
  }
}

describe('ProductionBoard', () => {
  beforeEach(() => {
    Object.keys(mockRouteQuery).forEach(key => delete mockRouteQuery[key])
    getWorkOrders.mockResolvedValue({ items: [], totalCount: 0 })
    scanOperation.mockImplementation((code: string) => Promise.resolve(defaultOperationForCode(code)))
    startOperation.mockResolvedValue({})
    completeOperation.mockResolvedValue({})
    reportException.mockResolvedValue({})
    writeProductionAnomalyEvent.mockReset()
    upsertOtdEvidenceChainRecord.mockReset()
    readBarcodeScanEvidenceRecords.mockReset()
    readBarcodeScanEvidenceRecords.mockReturnValue([])
    isOfflineDemoError.mockImplementation((error: unknown) => error instanceof Error && error.name === 'OfflineDemoApiError')
    readLaborQualificationBlockForOperation.mockReturnValue(null)
    readLaborReassignmentForOperation.mockReturnValue(null)
    readLaborQualificationBlocksBackendFirst.mockResolvedValue([])
    readLaborReassignmentsBackendFirst.mockResolvedValue([])
    isLaborQualificationBlockForOperation.mockImplementation((record, workOrderNumber, operationCode, operationName) =>
      record.workOrderNumber === workOrderNumber
      && (record.operationCodes?.includes(operationCode) || `${operationCode} ${operationName}`.includes('淬火') || `${operationCode} ${operationName}`.includes('回火'))
    )
    isLaborReassignmentForOperation.mockImplementation((record, workOrderNumber, operationCode, operationName) =>
      record.workOrderNumber === workOrderNumber
      && (record.operationCodes?.includes(operationCode) || `${operationCode} ${operationName}`.includes('淬火') || `${operationCode} ${operationName}`.includes('回火'))
    )
    writeLaborReassignmentExecutionEvidence.mockReset()
    readPocPilotRunRecordBackendFirst.mockResolvedValue(null)
  })

  it('announces scan misses through an alert notification', async () => {
    scanOperation.mockRejectedValueOnce(new Error('not found'))
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

  it('does not mask live scan API failures with local WO-013 operation fallback', async () => {
    getWorkOrders.mockResolvedValue({
      items: [
        {
          id: 'wo-live-013',
          orderNumber: 'WO-013',
          productCode: 'PRD-003',
          productName: '淬火热处理',
          plannedQuantity: 200,
          completedQuantity: 0,
          plannedStartDate: '2026-06-21T10:00:00',
          plannedEndDate: '2026-06-21T14:00:00',
          status: 'pending',
          workshopId: 'WS-001',
          priority: 3,
          progressPercentage: 0,
          createdAt: '2026-06-21T00:00:00',
        },
      ],
      totalCount: 1,
    })
    scanOperation.mockRejectedValue(new Error('production scan backend unavailable'))
    const wrapper = mountProductionBoard()
    await flushPromises()

    await wrapper.get('.scan-input').setValue('WO-013')
    await wrapper.get('.scan-btn').trigger('click')
    await flushPromises()

    const alert = wrapper.get('[role="alert"]')
    expect(alert.classes()).toContain('notification')
    expect(alert.classes()).toContain('error')
    expect(alert.text()).toContain('production scan backend unavailable')
    expect(wrapper.text()).not.toContain('OP-007')
    expect(wrapper.text()).not.toContain('OP-10')
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

  it('quietly shows demo work orders when offline demo skips initial work-order loading', async () => {
    const offlineDemoError = new Error('Offline demo mode skipped backend request: /api/v1/scheduling/workorders')
    offlineDemoError.name = 'OfflineDemoApiError'
    getWorkOrders.mockRejectedValueOnce(offlineDemoError)

    const wrapper = mountProductionBoard()
    await flushPromises()

    expect(wrapper.findAll('.wo-card').length).toBeGreaterThan(0)
    expect(wrapper.get('.wo-number').text()).toBe('WO-001')
    expect(wrapper.find('[role="alert"]').exists()).toBe(false)
    expect(wrapper.text()).not.toContain('生产工单加载失败')
    expect(wrapper.text()).not.toContain('Offline demo mode skipped backend request')
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

  it('renders POC pilot run evidence in the production execution trace panel', async () => {
    getWorkOrders.mockResolvedValue({
      items: [
        {
          id: 'wo-poc-success',
          orderNumber: 'WO-POC-SUCCESS',
          productCode: 'PRD-POC-SUCCESS',
          productName: 'POC 成功件',
          plannedQuantity: 12,
          completedQuantity: 12,
          plannedStartDate: '2026-06-04T08:00:00',
          plannedEndDate: '2026-06-04T12:00:00',
          status: 'completed',
          workshopId: 'WS-001',
          priority: 1,
          progressPercentage: 100,
          createdAt: '2026-06-04T00:00:00',
        },
      ],
      totalCount: 1,
    })
    readPocPilotRunRecordBackendFirst.mockResolvedValueOnce({
      id: 'poc-pilot-run-test',
      title: 'POC 首批真实工单试点运行确认',
      targetCustomer: '华东客户群',
      sourcePackageId: 'poc-rollout-package-test',
      sourceAuditId: 'AUD-POC-ROLLOUT-TEST',
      status: 'closed',
      statusLabel: '首批真实工单已跑通',
      runWindow: 'T+14 首批真实工单上线班次',
      batchId: 'PILOT-WO-BATCH-TEST',
      sampleSize: 30,
      otdTarget: '>= 96%',
      actualOtd: '97%',
      owner: '调度主管 / 生产班组长 / 交付经理',
      workOrders: [],
      checkpoints: [
        {
          module: 'AI 排产',
          owner: '调度主管',
          status: 'closed',
          evidence: 'TRACE-POC-PILOT-SCHEDULE-TEST',
          summary: '排产建议已采纳。',
        },
        {
          module: '生产报工',
          owner: '班组长',
          status: 'closed',
          evidence: 'TRACE-POC-PILOT-PRODUCTION-TEST',
          summary: '生产执行已回写。',
        },
      ],
      acceptanceCriteria: ['30 单真实工单完成排产建议、人工确认和执行回写。'],
      auditId: 'AUD-POC-PILOT-RUN-TEST',
      traceId: 'TRACE-POC-PILOT-RUN-CLOSED-TEST',
      createdAt: '2026-06-04T09:30:00.000Z',
      summary: '首批真实工单已跑通。',
    })

    const wrapper = mountProductionBoard()
    await flushPromises()

    const tracePanel = wrapper.getComponent({ name: 'ProductionExecutionTracePanel' })
    const traces = tracePanel.props('traces') as Array<{
      id: string
      typeLabel: string
      title: string
      detail: string
      tags: string[]
      createdAt: string
    }>
    expect(traces[0]).toEqual(expect.objectContaining({
      id: 'poc-pilot-PILOT-WO-BATCH-TEST',
      typeLabel: 'POC 试点',
      title: 'POC 首批真实工单试点运行确认',
      createdAt: new Date('2026-06-04T09:30:00.000Z').toLocaleString('zh-CN', { hour12: false }),
    }))
    expect(traces[0].detail).toContain('PILOT-WO-BATCH-TEST 已完成 30 单真实工单运行，OTD 97%')
    expect(traces[0].detail).toContain('AI 排产 TRACE-POC-PILOT-SCHEDULE-TEST')
    expect(traces[0].detail).toContain('生产报工 TRACE-POC-PILOT-PRODUCTION-TEST')
    expect(traces[0].tags).toEqual(['真实工单', '排产采纳', '执行回写', '审计复盘'])
    expect(wrapper.find('[role="alert"]').exists()).toBe(false)
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

  it('hydrates labor release evidence from backend after refresh and allows reassigned heat treatment start', async () => {
    getWorkOrders.mockResolvedValue({
      items: [
        {
          id: 'wo-released-start',
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
    readLaborQualificationBlocksBackendFirst.mockResolvedValue([
      {
        id: 'labor-qualification-block-WO-013-heat-treatment',
        auditId: 'AUD-LABOR-BLOCK-20260520-001',
        traceId: 'TRACE-LABOR-BLOCK-WO-013-OP-10',
        releaseTraceId: 'TRACE-LABOR-RELEASE-WO-013-OP-10',
        status: 'released',
        workOrderNumber: 'WO-013',
        operationCode: 'OP-10',
        operationCodes: ['OP-10', 'OP-20'],
        operationName: '淬火 / 回火',
        blockedEmployeeNumber: 'EMP-003',
        blockedEmployeeName: '王五',
        blockedCertification: '热处理上岗证',
        blockedExpiresAt: '2026-05-25',
        requiredSkill: '热处理',
        requiredTeam: '乙班',
        requiredShift: '夜班',
        reviewerName: '赵六',
        reviewerRole: '工程放行',
        reason: '已补证改派并重新放行',
      },
    ])
    readLaborReassignmentsBackendFirst.mockResolvedValue([
      {
        id: 'labor-reassignment-release-WO-013-heat-treatment',
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
        replacementSkill: '热处理补证改派 / 主管复核放行',
        replacementCertification: '热处理上岗证',
        replacementExpiresAt: '2026-12-31',
        reviewerEmployeeNumber: 'EMP-004',
        reviewerName: '赵六',
        reviewerRole: '工程放行',
        reason: '补证改派后由孙八接管热处理开工复核。',
        auditId: 'AUD-LABOR-RELEASE-20260520-001',
        traceId: 'TRACE-LABOR-RELEASE-WO-013-OP-10',
        createdAt: '2026-06-21T01:40:55.043Z',
        status: 'approved',
      },
    ])

    const wrapper = mountProductionBoard()
    await flushPromises()

    expect(readLaborReassignmentsBackendFirst).toHaveBeenCalledWith({ failLoud: true })
    expect(readLaborQualificationBlocksBackendFirst).toHaveBeenCalledWith({ failLoud: true })
    await wrapper.get('.wo-card').trigger('click')
    await flushPromises()

    expect(wrapper.get('.op-constraints').text()).toContain('人员: EMP-006 替班已确认')
    expect(wrapper.get('.op-constraints').text()).not.toContain('停工复核')

    await wrapper.get('.op-btn.start').trigger('click')
    await flushPromises()

    expect(wrapper.get('.dialog-confirm').attributes('disabled')).toBeUndefined()
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

  it('clears stale work-order detail immediately while loading another page', async () => {
    const pageTwo = createDeferred<{
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
      .mockResolvedValueOnce({
        items: [
          {
            id: 'wo-page-1',
            orderNumber: 'WO-PAGE-001',
            productCode: 'PRD-PAGE-001',
            productName: '第一页泵体',
            plannedQuantity: 20,
            completedQuantity: 4,
            plannedStartDate: '2026-06-04T08:00:00',
            plannedEndDate: '2026-06-04T12:00:00',
            status: 'in_progress',
            workshopId: 'WS-001',
            priority: 1,
            progressPercentage: 20,
            createdAt: '2026-06-04T00:00:00',
          },
        ],
        totalCount: 21,
      })
      .mockReturnValueOnce(pageTwo.promise)
    scanOperation.mockResolvedValueOnce({
      operationId: 'op-page-1',
      workOrderId: 'wo-page-1',
      workOrderNumber: 'WO-PAGE-001',
      productCode: 'PRD-PAGE-001',
      productName: '第一页泵体',
      operationCode: 'OP-PAGE-001',
      operationName: '第一页精加工',
      plannedQuantity: 20,
      completedQuantity: 4,
      status: 'in_progress',
    })
    const wrapper = mountProductionBoard()
    await flushPromises()

    await wrapper.get('.wo-card').trigger('click')
    await flushPromises()
    expect(wrapper.get('.detail-title-row h3').text()).toBe('WO-PAGE-001')

    await wrapper.findAll('.page-btn').find(button => button.text() === '2')!.trigger('click')
    await flushPromises()

    expect(wrapper.find('.detail-title-row h3').exists()).toBe(false)
    expect(wrapper.get('.detail-empty').text()).toContain('选择工单或扫码开始')

    pageTwo.resolve({
      items: [
        {
          id: 'wo-page-2',
          orderNumber: 'WO-PAGE-002',
          productCode: 'PRD-PAGE-002',
          productName: '第二页泵体',
          plannedQuantity: 30,
          completedQuantity: 0,
          plannedStartDate: '2026-06-05T08:00:00',
          plannedEndDate: '2026-06-05T12:00:00',
          status: 'pending',
          workshopId: 'WS-001',
          priority: 1,
          progressPercentage: 0,
          createdAt: '2026-06-05T00:00:00',
        },
      ],
      totalCount: 21,
    })
    await flushPromises()

    expect(wrapper.find('.detail-title-row h3').exists()).toBe(false)
    expect(wrapper.get('.wo-number').text()).toBe('WO-PAGE-002')
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
    const context = wrapper.get('.barcode-start-context')
    expect(context.text()).toContain('WO-020 工单扫码上下文')
    expect(context.text()).toContain('OP-20 · 精加工')
    expect(context.text()).toContain('扫码上下文待确认')
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

  it('applies route scanCode as production reporting context on first load', async () => {
    mockRouteQuery.scanCode = 'wo-rush-9001'
    getWorkOrders.mockResolvedValue({
      items: [],
      totalCount: 0,
    })
    const wrapper = mountProductionBoard()
    await flushPromises()

    expect(scanOperation).toHaveBeenCalledWith('WO-RUSH-9001')
    expect(wrapper.get('.wo-number').text()).toBe('WO-RUSH-9001')
    expect(wrapper.get('.detail-title-row h3').text()).toBe('WO-RUSH-9001')
    const context = wrapper.get('.barcode-start-context')
    expect(context.text()).toContain('WO-RUSH-9001 工单扫码上下文')
    expect(context.text()).toContain('TRACE-QR-WO-RUSH-9001-ARRIVAL')
    expect(context.text()).toContain('OP-10 · CNC 精加工')
    expect(context.text()).toContain('CNC-002')
    expect(context.get('.barcode-context-actions button').text()).toBe('按扫码上下文开工')
    const status = wrapper.get('[role="status"]')
    expect(status.classes()).toContain('notification')
    expect(status.text()).toContain('WO-RUSH-9001 扫码上下文已带入生产报工')
  })

  it('uses confirmed barcode scan evidence when route scanCode enters production reporting', async () => {
    mockRouteQuery.scanCode = 'wo-rush-9001'
    readBarcodeScanEvidenceRecords.mockReturnValue([{
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
    }])
    getWorkOrders.mockResolvedValue({
      items: [],
      totalCount: 0,
    })
    const wrapper = mountProductionBoard()
    await flushPromises()

    const context = wrapper.get('.barcode-start-context')
    expect(readBarcodeScanEvidenceRecords).toHaveBeenCalled()
    expect(context.text()).toContain('WO-RUSH-9001 工单扫码到站已确认')
    expect(context.get('.barcode-context-heading em').text()).toBe('到站已确认')
    expect(context.text()).toContain('TRACE-QR-WO-RUSH-9001-ARRIVAL')
    expect(context.text()).not.toContain('扫码上下文待确认')
  })

  it('refreshes production reporting context when route scanCode changes after load', async () => {
    getWorkOrders.mockResolvedValue({
      items: [
        {
          id: 'wo-existing',
          orderNumber: 'WO-EXISTING',
          productCode: 'PRD-EXISTING',
          productName: '已加载工单',
          plannedQuantity: 10,
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
    const wrapper = mountProductionBoard()
    await flushPromises()

    expect(wrapper.get('.wo-number').text()).toBe('WO-EXISTING')
    expect(wrapper.find('.barcode-start-context').exists()).toBe(false)

    mockRouteQuery.scanCode = 'wo-rush-9001'
    await flushPromises()

    expect(scanOperation).toHaveBeenCalledWith('WO-RUSH-9001')
    expect(wrapper.findAll('.wo-card')).toHaveLength(2)
    expect(wrapper.findAll('.wo-card')[0].text()).toContain('WO-RUSH-9001')
    expect(wrapper.get('.detail-title-row h3').text()).toBe('WO-RUSH-9001')
    const context = wrapper.get('.barcode-start-context')
    expect(context.text()).toContain('WO-RUSH-9001 工单扫码上下文')
    expect(context.text()).toContain('OP-10 · CNC 精加工')
    expect(context.text()).toContain('CNC-002')
    const status = wrapper.get('[role="status"]')
    expect(status.text()).toContain('WO-RUSH-9001 扫码上下文已带入生产报工')
  })

  it('ignores invalid route scanCode changes without disturbing the current work order', async () => {
    getWorkOrders.mockResolvedValue({
      items: [
        {
          id: 'wo-existing-invalid-scan',
          orderNumber: 'WO-EXISTING-INVALID-SCAN',
          productCode: 'PRD-EXISTING',
          productName: '已加载工单',
          plannedQuantity: 10,
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
    const wrapper = mountProductionBoard()
    await flushPromises()

    await wrapper.get('.wo-card').trigger('click')
    await flushPromises()
    expect(wrapper.get('.detail-title-row h3').text()).toBe('WO-EXISTING-INVALID-SCAN')
    const callsBeforeRouteChange = scanOperation.mock.calls.length

    mockRouteQuery.scanCode = 'BAD-CODE-001'
    await flushPromises()

    expect(scanOperation).toHaveBeenCalledTimes(callsBeforeRouteChange)
    expect(wrapper.findAll('.wo-card')).toHaveLength(1)
    expect(wrapper.get('.detail-title-row h3').text()).toBe('WO-EXISTING-INVALID-SCAN')
    expect(wrapper.find('.barcode-start-context').exists()).toBe(false)
    expect(wrapper.find('[role="status"]').exists()).toBe(false)
    expect(wrapper.find('[role="alert"]').exists()).toBe(false)
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

  it('locks a completed operation confirmation so duplicate completion evidence is not written', async () => {
    getWorkOrders.mockResolvedValue({
      items: [
        {
          id: 'wo-completion-lock',
          orderNumber: 'WO-COMPLETE-LOCK',
          productCode: 'PRD-COMPLETE-LOCK',
          productName: '泵体完工防重复件',
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

    const confirm = wrapper.get('.dialog-confirm')
    await confirm.trigger('click')
    await flushPromises()
    await confirm.trigger('click')
    await flushPromises()

    expect(completeOperation).toHaveBeenCalledTimes(1)
    expect(upsertOtdEvidenceChainRecord).toHaveBeenCalledWith(expect.objectContaining({
      id: 'production-closeout-OP-001',
      stage: '生产复核',
      title: 'WO-COMPLETE-LOCK 工序 1 完工复核',
    }))
    expect(upsertOtdEvidenceChainRecord).toHaveBeenCalledWith(expect.objectContaining({
      id: 'production-completion-OP-001',
      stage: '生产完工',
      title: 'WO-COMPLETE-LOCK 工序 1 完工回写',
    }))
    expect(upsertOtdEvidenceChainRecord).toHaveBeenCalledTimes(2)
    expect(wrapper.get('.op-badge').text()).toBe('已完成')
  })

  it('updates the work-order list card and summary after completion succeeds', async () => {
    getWorkOrders.mockResolvedValue({
      items: [
        {
          id: 'wo-completion-list-sync',
          orderNumber: 'WO-COMPLETE-LIST-SYNC',
          productCode: 'PRD-COMPLETE-LIST-SYNC',
          productName: '泵体列表同步件',
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

    const summaryValues = wrapper.findAll('.summary-value').map(item => item.text())
    expect(summaryValues).toContain('0')
    expect(summaryValues).toContain('1')
    expect(summaryValues).toContain('30')
    const card = wrapper.get('.wo-card')
    expect(card.classes()).toContain('completed')
    expect(card.get('.wo-badge').text()).toBe('已完成')
    expect(card.get('.wo-progress-text').text()).toBe('100%')
    expect(card.text()).toContain('完成 30')
  })

  it('writes barcode completion, material, quality gate, and handoff evidence after scanned completion succeeds', async () => {
    getWorkOrders.mockResolvedValue({
      items: [
        {
          id: 'WO-RUSH-9001',
          orderNumber: 'WO-RUSH-9001',
          productCode: 'PROD-RUSH-01',
          productName: '急单阀体组件',
          plannedQuantity: 30,
          completedQuantity: 0,
          plannedStartDate: '2099-05-21T09:00:00',
          plannedEndDate: '2099-05-21T16:00:00',
          status: 'in_progress',
          workshopId: 'WS-001',
          priority: 0,
          progressPercentage: 50,
          createdAt: '2099-05-21T08:30:00',
        },
      ],
      totalCount: 1,
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
    await wrapper.get('.barcode-context-actions button.secondary').trigger('click')
    await flushPromises()
    await wrapper.get('.dialog-confirm').trigger('click')
    await flushPromises()

    expect(startOperation).toHaveBeenCalledWith('OP-RUSH-10', {
      operatorId: 'operator1',
      stationId: 'ST-CNC-02',
      equipmentId: 'CNC-002',
    })
    expect(completeOperation).toHaveBeenCalledWith('OP-RUSH-10', {
      quantity: 30,
      defectQuantity: 0,
      inspectionResult: 'Pass',
      reportedBy: 'operator1',
    })
    expect(upsertOtdEvidenceChainRecord).toHaveBeenCalledWith(expect.objectContaining({
      id: 'barcode-complete-WO-RUSH-9001-OP-10',
      stage: '扫码完工',
      statusLabel: '扫码完工 OTD 达成',
      traceId: 'TRACE-QR-WO-RUSH-9001-OP-10-COMPLETE',
    }))
    expect(upsertOtdEvidenceChainRecord).toHaveBeenCalledWith(expect.objectContaining({
      id: 'barcode-material-WO-RUSH-9001-OP-10',
      stage: '物料消耗',
      object: 'M-AL-6061 / AL-202605',
      traceId: 'TRACE-QR-WO-RUSH-9001-OP-10-MATERIAL',
    }))
    expect(upsertOtdEvidenceChainRecord).toHaveBeenCalledWith(expect.objectContaining({
      id: 'barcode-quality-WO-RUSH-9001-OP-10',
      stage: '质量门',
      statusLabel: '首件巡检已放行',
      traceId: 'TRACE-QR-WO-RUSH-9001-OP-10-QUALITY',
    }))
    expect(upsertOtdEvidenceChainRecord).toHaveBeenCalledWith(expect.objectContaining({
      id: 'barcode-handoff-WO-RUSH-9001-OP-10-OP-20',
      stage: '工序交接',
      statusLabel: 'OP-20 待接收开工',
      traceId: 'TRACE-QR-WO-RUSH-9001-OP-10-HANDOFF-OP-20',
    }))
    expect(wrapper.text()).toContain('TRACE-QR-WO-RUSH-9001-OP-10-COMPLETE 已写入扫码完工证据')
    expect(wrapper.text()).toContain('TRACE-QR-WO-RUSH-9001-OP-10-QUALITY 已触发首件巡检质量门')
    expect(wrapper.text()).toContain('TRACE-QR-WO-RUSH-9001-OP-10-HANDOFF-OP-20 已生成下道工序交接')
  })

  it('freezes scanned completion handoff and exposes rework evidence when quality gate fails', async () => {
    getWorkOrders.mockResolvedValue({
      items: [
        {
          id: 'WO-RUSH-9001',
          orderNumber: 'WO-RUSH-9001',
          productCode: 'PROD-RUSH-01',
          productName: '急单阀体组件',
          plannedQuantity: 30,
          completedQuantity: 0,
          plannedStartDate: '2099-05-21T09:00:00',
          plannedEndDate: '2099-05-21T16:00:00',
          status: 'in_progress',
          workshopId: 'WS-001',
          priority: 0,
          progressPercentage: 50,
          createdAt: '2099-05-21T08:30:00',
        },
      ],
      totalCount: 1,
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
    await wrapper.get('.barcode-context-actions button.secondary').trigger('click')
    await flushPromises()
    const dialog = wrapper.get('[role="dialog"]')
    await dialog.findAll('input[type="number"]')[0].setValue('28')
    await dialog.findAll('input[type="number"]')[1].setValue('2')
    await dialog.get('select').setValue('Fail')
    await dialog.get('.dialog-confirm').trigger('click')
    await flushPromises()

    expect(completeOperation).toHaveBeenCalledWith('OP-RUSH-10', {
      quantity: 28,
      defectQuantity: 2,
      inspectionResult: 'Fail',
      reportedBy: 'operator1',
    })
    expect(upsertOtdEvidenceChainRecord).toHaveBeenCalledWith(expect.objectContaining({
      id: 'barcode-quality-WO-RUSH-9001-OP-10',
      stage: '质量门',
      status: 'active',
      statusLabel: '质量门待复核',
      traceId: 'TRACE-QR-WO-RUSH-9001-OP-10-QUALITY',
    }))
    expect(upsertOtdEvidenceChainRecord).toHaveBeenCalledWith(expect.objectContaining({
      id: 'barcode-rework-WO-RUSH-9001-OP-10',
      stage: '扫码返工',
      statusLabel: '返工待复验',
      traceId: 'TRACE-QR-WO-RUSH-9001-OP-10-REWORK',
    }))
    expect(upsertOtdEvidenceChainRecord).toHaveBeenCalledWith(expect.objectContaining({
      id: 'barcode-hold-WO-RUSH-9001-OP-10-OP-20',
      stage: '交接冻结',
      statusLabel: '下道接收冻结',
      traceId: 'TRACE-QR-WO-RUSH-9001-OP-10-HOLD-OP-20',
    }))
    expect(upsertOtdEvidenceChainRecord).toHaveBeenCalledWith(expect.objectContaining({
      id: 'barcode-capa-WO-RUSH-9001-OP-10',
      stage: '质量CAPA',
      statusLabel: 'CAPA 待验证',
      traceId: 'TRACE-QR-WO-RUSH-9001-OP-10-CAPA',
    }))
    expect(upsertOtdEvidenceChainRecord).toHaveBeenCalledWith(expect.objectContaining({
      id: 'barcode-isolation-WO-RUSH-9001-OP-10',
      stage: '质量隔离',
      statusLabel: '隔离待复验',
      traceId: 'TRACE-QR-WO-RUSH-9001-OP-10-ISOLATION',
    }))
    expect(upsertOtdEvidenceChainRecord).toHaveBeenCalledWith(expect.objectContaining({
      id: 'barcode-rework-cost-WO-RUSH-9001-OP-10',
      stage: '返工成本',
      statusLabel: '成本待结算',
      traceId: 'TRACE-QR-WO-RUSH-9001-OP-10-REWORK-COST',
    }))
    expect(upsertOtdEvidenceChainRecord).toHaveBeenCalledWith(expect.objectContaining({
      id: 'barcode-label-hold-WO-RUSH-9001-OP-10',
      stage: '标签状态',
      statusLabel: '质量冻结标签已更新',
      traceId: 'TRACE-QR-WO-RUSH-9001-OP-10-LABEL-HOLD',
    }))
    expect(wrapper.text()).toContain('TRACE-QR-WO-RUSH-9001-OP-10-REWORK 已生成质量返工证据')
    expect(wrapper.text()).toContain('TRACE-QR-WO-RUSH-9001-OP-10-HOLD-OP-20 已冻结下道交接')
    expect(wrapper.text()).toContain('TRACE-QR-WO-RUSH-9001-OP-10-CAPA 已生成扫码 CAPA 处置')
    expect(wrapper.text()).toContain('TRACE-QR-WO-RUSH-9001-OP-10-ISOLATION 已生成批次隔离')
    expect(wrapper.text()).toContain('TRACE-QR-WO-RUSH-9001-OP-10-REWORK-COST 已估算返工工时成本')
    expect(wrapper.text()).toContain('TRACE-QR-WO-RUSH-9001-OP-10-LABEL-HOLD 已更新实物标签状态')
    expect(wrapper.text()).not.toContain('TRACE-QR-WO-RUSH-9001-OP-10-HANDOFF-OP-20 已生成下道工序交接')
    expect(wrapper.get('.barcode-context-actions').text()).toContain('扫码质量冻结，需返工复验后再释放交接')
  })

  it('fails loud when scanned quality-fail freeze evidence cannot be archived after backend completion succeeds', async () => {
    getWorkOrders.mockResolvedValue({
      items: [
        {
          id: 'WO-RUSH-9001',
          orderNumber: 'WO-RUSH-9001',
          productCode: 'PROD-RUSH-01',
          productName: '急单阀体组件',
          plannedQuantity: 30,
          completedQuantity: 0,
          plannedStartDate: '2099-05-21T09:00:00',
          plannedEndDate: '2099-05-21T16:00:00',
          status: 'in_progress',
          workshopId: 'WS-001',
          priority: 0,
          progressPercentage: 50,
          createdAt: '2099-05-21T08:30:00',
        },
      ],
      totalCount: 1,
    })
    upsertOtdEvidenceChainRecord.mockImplementation(record => {
      if (record.id === 'barcode-hold-WO-RUSH-9001-OP-10-OP-20') {
        throw new Error('barcode handoff freeze evidence storage unavailable')
      }
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
    await wrapper.get('.barcode-context-actions button.secondary').trigger('click')
    await flushPromises()
    const dialog = wrapper.get('[role="dialog"]')
    await dialog.findAll('input[type="number"]')[0].setValue('28')
    await dialog.findAll('input[type="number"]')[1].setValue('2')
    await dialog.get('select').setValue('Fail')
    await dialog.get('.dialog-confirm').trigger('click')
    await flushPromises()

    expect(completeOperation).toHaveBeenCalledWith('OP-RUSH-10', {
      quantity: 28,
      defectQuantity: 2,
      inspectionResult: 'Fail',
      reportedBy: 'operator1',
    })
    const alert = wrapper.get('[role="alert"]')
    expect(alert.classes()).toContain('notification')
    expect(alert.classes()).toContain('error')
    expect(alert.text()).toContain('完工证据写入失败，后端完工已提交但 OTD/质量证据未归档')
    expect(alert.text()).toContain('barcode handoff freeze evidence storage unavailable')
    expect(wrapper.text()).not.toContain('完工报告已提交：CNC 精加工')
    expect(wrapper.text()).not.toContain('已冻结下道交接')
    expect(wrapper.text()).not.toContain('已生成扫码 CAPA 处置')
    expect(wrapper.text()).not.toContain('已更新实物标签状态')
  })

  it('shows completed barcode operations as read-only so operators cannot duplicate production actions', async () => {
    getWorkOrders.mockResolvedValue({
      items: [
        {
          id: 'WO-008',
          orderNumber: 'WO-008',
          productCode: 'PRD-002',
          productName: '外壳注塑',
          plannedQuantity: 500,
          completedQuantity: 500,
          plannedStartDate: '2026-05-12T08:00:00',
          plannedEndDate: '2026-05-12T10:00:00',
          actualStartDate: '2026-05-12T08:00:00',
          actualEndDate: '2026-05-12T09:45:00',
          status: 'completed',
          workshopId: 'WS-002',
          priority: 1,
          progressPercentage: 100,
          createdAt: '2026-05-10T00:00:00',
        },
      ],
      totalCount: 1,
    })
    const wrapper = mountProductionBoard()
    await flushPromises()

    await wrapper.get('.scan-input').setValue('WO-008')
    await wrapper.get('.scan-btn').trigger('click')
    await flushPromises()

    const context = wrapper.get('.barcode-start-context')
    expect(context.text()).toContain('WO-008 工单扫码上下文')
    expect(context.text()).toContain('OP-10 · 注塑成型')
    expect(context.text()).toContain('扫码工序已完成，不能重复开工或完工')
    expect(context.findAll('.barcode-context-actions button')).toHaveLength(0)
    expect(startOperation).not.toHaveBeenCalled()
    expect(completeOperation).not.toHaveBeenCalled()
    expect(reportException).not.toHaveBeenCalled()
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

  it('lets operators retry completion after evidence archival fails', async () => {
    getWorkOrders.mockResolvedValue({
      items: [
        {
          id: 'wo-completion-retry',
          orderNumber: 'WO-COMPLETE-RETRY',
          productCode: 'PRD-COMPLETE-RETRY',
          productName: '泵体补证件',
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

    expect(completeOperation).toHaveBeenCalledTimes(1)
    expect(wrapper.get('[role="alert"]').text()).toContain('完工证据写入失败')

    await wrapper.get('.dialog-confirm').trigger('click')
    await flushPromises()

    expect(completeOperation).toHaveBeenCalledTimes(2)
    expect(wrapper.text()).toContain('完工报告已提交：工序 1')
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

  it('fails loud when scanned exception barcode evidence cannot be archived after backend exception succeeds', async () => {
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
          status: 'in_progress',
          workshopId: 'WS-001',
          priority: 0,
          progressPercentage: 50,
          createdAt: '2026-05-21T08:30:00',
        },
      ],
      totalCount: 1,
    })
    upsertOtdEvidenceChainRecord.mockImplementation(record => {
      if (record.id === 'barcode-anomaly-WO-RUSH-9001-OP-10') {
        throw new Error('barcode anomaly evidence storage unavailable')
      }
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
    await wrapper.get('.barcode-context-actions button.danger').trigger('click')
    await flushPromises()
    await wrapper.get('textarea').setValue('扫码发现夹具松动')
    await wrapper.get('.dialog-confirm.danger').trigger('click')
    await flushPromises()

    expect(reportException).toHaveBeenCalledWith('OP-RUSH-10', { reason: '扫码发现夹具松动' })
    const alert = wrapper.get('[role="alert"]')
    expect(alert.classes()).toContain('notification')
    expect(alert.classes()).toContain('error')
    expect(alert.text()).toContain('异常证据写入失败，后端异常已上报但异常管理/OTD 证据未归档')
    expect(alert.text()).toContain('barcode anomaly evidence storage unavailable')
    expect(wrapper.text()).not.toContain('异常已上报：扫码发现夹具松动')
    expect(wrapper.text()).not.toContain('已写入扫码异常分流')
  })

  it('writes scanned exception barcode evidence and keeps the scan context in anomaly follow-up', async () => {
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
          status: 'in_progress',
          workshopId: 'WS-001',
          priority: 0,
          progressPercentage: 50,
          createdAt: '2026-05-21T08:30:00',
        },
      ],
      totalCount: 1,
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
    await wrapper.get('.barcode-context-actions button.danger').trigger('click')
    await flushPromises()
    await wrapper.get('textarea').setValue('扫码发现夹具松动')
    await wrapper.get('.dialog-confirm.danger').trigger('click')
    await flushPromises()

    expect(reportException).toHaveBeenCalledWith('OP-RUSH-10', { reason: '扫码发现夹具松动' })
    expect(writeProductionAnomalyEvent).toHaveBeenCalledWith(expect.objectContaining({
      workOrderNumber: 'WO-RUSH-9001',
      operationCode: 'OP-10',
      operationName: 'CNC 精加工',
      equipmentId: 'CNC-002',
      description: '扫码发现夹具松动',
      detectedBy: 'operator1',
    }))
    expect(upsertOtdEvidenceChainRecord).toHaveBeenCalledWith(expect.objectContaining({
      id: 'barcode-anomaly-WO-RUSH-9001-OP-10',
      stage: '扫码异常',
      title: 'WO-RUSH-9001 CNC 精加工 扫码异常分流',
      object: 'WO-RUSH-9001',
      source: '生产报工 / 条码流转卡 / operator1',
      traceId: 'TRACE-QR-WO-RUSH-9001-OP-10-ANOMALY',
      status: 'active',
      statusLabel: '扫码异常待闭环',
    }))
    expect(upsertOtdEvidenceChainRecord).toHaveBeenCalledWith(expect.objectContaining({
      id: 'production-anomaly-WO-RUSH-9001-OP-10',
      stage: '生产异常',
      title: 'WO-RUSH-9001 CNC 精加工 异常上报进入风险联动',
      object: 'WO-RUSH-9001',
      traceId: 'TRACE-PROD-ANOMALY-WO-RUSH-9001-OP-10',
      status: 'active',
      statusLabel: '异常待分流',
    }))
    expect(wrapper.text()).toContain('异常已上报：扫码发现夹具松动')
    expect(wrapper.text()).toContain('TRACE-QR-WO-RUSH-9001-OP-10-ANOMALY 已写入扫码异常分流')
    expect(wrapper.get('.barcode-start-context').classes()).toContain('synced')
    expect(wrapper.get('.barcode-context-heading em').text()).toBe('扫码异常待闭环')
    expect(wrapper.getComponent({ name: 'ProductionExecutionTracePanel' }).props('traces')).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          typeLabel: '风险联动',
          title: 'WO-RUSH-9001 异常已进入处置队列',
          tags: expect.arrayContaining(['扫码异常']),
        }),
      ]),
    )
  })
})
