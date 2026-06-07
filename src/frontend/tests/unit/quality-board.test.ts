import { flushPromises, mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import QualityBoard from '../../src/components/quality/QualityBoard.vue'

const getInspections = vi.hoisted(() => vi.fn())
const getQualityStatistics = vi.hoisted(() => vi.fn())
const analyzeRootCause = vi.hoisted(() => vi.fn())
const analyzeSpcTrend = vi.hoisted(() => vi.fn())
const httpGet = vi.hoisted(() => vi.fn())
const readQualityMrbDispositionRecordBackendFirst = vi.hoisted(() => vi.fn())
const closeQualityMrbDispositionRecord = vi.hoisted(() => vi.fn())
const writeQualityMrbDispositionRecord = vi.hoisted(() => vi.fn())
const createBarcodeQualityKnowledgeSample = vi.hoisted(() => vi.fn())
const writeQualityKnowledgeSample = vi.hoisted(() => vi.fn())
const createBarcodeQualityReuseDraft = vi.hoisted(() => vi.fn())
const writeQualityKnowledgeReuseDraft = vi.hoisted(() => vi.fn())
const readOtdEvidenceChainRecords = vi.hoisted(() => vi.fn())
const upsertOtdEvidenceChainRecord = vi.hoisted(() => vi.fn())

function createDeferred<T>() {
  let resolve!: (value: T) => void
  const promise = new Promise<T>(innerResolve => {
    resolve = innerResolve
  })
  return { promise, resolve }
}

vi.mock('vue-router', () => ({
  useRoute: () => ({ query: {} }),
}))

vi.mock('../../src/api/http', () => ({
  default: {
    get: httpGet,
  },
}))

vi.mock('../../src/api/quality', () => ({
  getInspections,
  getQualityStatistics,
  analyzeRootCause,
  analyzeSpcTrend,
}))

vi.mock('../../src/utils/quality-rework-sync', () => ({
  buildQualityReworkImpact: vi.fn(record => ({
    inspectionId: record.id,
    workOrderId: record.workOrderId,
    productCode: record.productCode,
    processName: record.processName,
    equipmentCode: 'CNC-001',
    materialBatchCode: 'MAT-001',
    batchCode: 'BATCH-001',
    inspectionPoint: record.inspectionPoint,
    defectQuantity: record.defectQuantity,
    reworkHours: 2,
    otdImpact: '待复核',
    recommendedAction: '复核',
    rootCause: '待分析',
    evidence: [],
    createdAt: '2026-05-12T08:00:00',
  })),
  selectQualityReworkInspection: vi.fn(() => null),
  writeQualityReworkImpact: vi.fn(),
}))

vi.mock('../../src/utils/quality-mrb-disposition-sync', () => ({
  buildQualityMrbDispositionRecord: vi.fn(createdAt => ({
    id: 'MRB-001',
    traceId: 'TRACE-MRB-001',
    createdAt,
  })),
  closeQualityMrbDispositionRecord,
  readQualityMrbDispositionRecord: vi.fn(() => null),
  readQualityMrbDispositionRecordBackendFirst,
  writeQualityMrbDispositionRecord,
}))

vi.mock('../../src/utils/otd-evidence-chain-sync', () => ({
  readOtdEvidenceChainRecords,
  upsertOtdEvidenceChainRecord,
}))

vi.mock('../../src/utils/quality-knowledge-sample-sync', () => ({
  createBarcodeQualityReuseDraft,
  createBarcodeQualityKnowledgeSample,
  readLatestQualityKnowledgeReuseDraft: vi.fn(() => null),
  readLatestQualityKnowledgeSample: vi.fn(() => null),
  writeQualityKnowledgeReuseDraft,
  writeQualityKnowledgeSample,
}))

function mountQualityBoard() {
  return mount(QualityBoard, {
    global: {
      stubs: {
        QualityReworkImpactPanel: true,
        QualityMrbDispositionPanel: true,
        QualityCapaTaskPanel: true,
      },
    },
  })
}

describe('QualityBoard', () => {
  beforeEach(() => {
    getQualityStatistics.mockResolvedValue({
      totalInspections: 1,
      passedCount: 0,
      failedCount: 1,
      reworkCount: 0,
      passRate: 0,
      defectRate: 100,
      reworkRate: 0,
    })
    getInspections.mockResolvedValue([
      {
        id: 'INS-FAIL-001',
        workOrderId: 'WO-FAIL-001',
        productCode: 'PRD-FAIL',
        processName: 'CNC精加工',
        inspectionPoint: '尺寸检验',
        inspectionQuantity: 10,
        qualifiedQuantity: 8,
        defectQuantity: 2,
        result: 'fail',
        inspectorId: 'USR-001',
        inspectedAt: '2026-05-12T09:00:00',
        passRate: 80,
      },
    ])
    analyzeRootCause.mockResolvedValue({
      inspectionId: 'INS-FAIL-001',
      rootCauses: [
        { cause: '刀具磨损超差', probability: 0.65, evidence: '连续运行超过推荐换刀周期' },
      ],
      correctiveActions: ['立即更换刀具'],
      preventiveMeasures: ['建立刀具寿命看板'],
      analysisSummary: '主要根因为刀具磨损导致尺寸异常。',
    })
    analyzeSpcTrend.mockResolvedValue({
      dataPoints: [10, 20, 30],
      hasTrend: false,
      trendDirection: '',
      recommendedAction: '',
    })
    httpGet.mockResolvedValue({ data: [] })
    readQualityMrbDispositionRecordBackendFirst.mockResolvedValue(null)
    closeQualityMrbDispositionRecord.mockReturnValue(null)
    writeQualityMrbDispositionRecord.mockImplementation(record => record)
    readOtdEvidenceChainRecords.mockReturnValue([])
    createBarcodeQualityKnowledgeSample.mockReturnValue({
      auditId: 'QKS-001',
      traceId: 'TRACE-QKS-001',
      reuseTargets: ['同类批次', '同设备'],
    })
    writeQualityKnowledgeSample.mockImplementation(record => record)
    createBarcodeQualityReuseDraft.mockReturnValue({
      auditId: 'QKD-001',
      traceId: 'TRACE-QKD-001',
      targetWorkOrderId: 'WO-DEMO-1012',
      summary: '同类缺陷处置草案。',
      matchScore: 92,
      effectScore: 88,
      matchDimensions: [{ label: '设备', target: 'CNC-002' }],
      dispositionDraft: ['复核首件尺寸'],
      effectMetrics: [{ label: '返工节省', value: '2h' }],
    })
    writeQualityKnowledgeReuseDraft.mockImplementation(record => record)
    upsertOtdEvidenceChainRecord.mockImplementation(() => undefined)
  })

  it('opens root cause analysis as a labelled dialog', async () => {
    const wrapper = mountQualityBoard()
    await flushPromises()

    await wrapper.get('.action-btn').trigger('click')
    await flushPromises()

    const dialog = wrapper.get('[role="dialog"]')
    expect(dialog.classes()).toContain('analysis-panel')
    expect(dialog.attributes('aria-modal')).toBe('true')
    expect(dialog.attributes('aria-labelledby')).toBe('root-cause-analysis-title')
    expect(dialog.get('#root-cause-analysis-title').text()).toBe('根因分析 — INS-FAIL-001')
  })

  it('explains when the inspection result filter has no matching records', async () => {
    const wrapper = mountQualityBoard()
    await flushPromises()

    await wrapper.get('.filter-select').setValue('pass')
    await flushPromises()

    expect(wrapper.findAll('.ins-row')).toHaveLength(0)
    expect(wrapper.get('.inspection-table .empty-state').text()).toBe('暂无匹配检验记录')
  })

  it('keeps inspection records visible when MRB disposition evidence loading fails', async () => {
    readQualityMrbDispositionRecordBackendFirst.mockRejectedValueOnce(new Error('MRB evidence backend unavailable'))

    const wrapper = mountQualityBoard()
    await flushPromises()

    expect(getQualityStatistics).toHaveBeenCalledTimes(1)
    expect(getInspections).toHaveBeenCalledTimes(1)
    expect(wrapper.get('.inspection-table').text()).toContain('WO-FAIL-001')
    const alert = wrapper.get('[role="alert"]')
    expect(alert.text()).toContain('MRB 处置证据加载失败')
    expect(alert.text()).toContain('MRB evidence backend unavailable')
  })

  it('fails loud when MRB disposition evidence cannot be archived', async () => {
    writeQualityMrbDispositionRecord.mockImplementationOnce(() => {
      throw new Error('MRB disposition storage unavailable')
    })

    const wrapper = mountQualityBoard()
    await flushPromises()

    let thrown: unknown
    try {
      wrapper.findComponent({ name: 'QualityMrbDispositionPanel' }).vm.$emit('create')
      await flushPromises()
    } catch (e: unknown) {
      thrown = e
    }

    expect(thrown).toBeUndefined()
    const alert = wrapper.get('[role="alert"]')
    expect(alert.text()).toContain('MRB 处置证据写入失败')
    expect(alert.text()).toContain('MRB disposition storage unavailable')
    expect(wrapper.findComponent({ name: 'QualityMrbDispositionPanel' }).props('record')).toBeNull()
  })

  it('fails loud when MRB disposition closure evidence cannot be archived', async () => {
    readQualityMrbDispositionRecordBackendFirst.mockResolvedValueOnce({
      id: 'MRB-OPEN',
      traceId: 'TRACE-MRB-OPEN',
      createdAt: '2026-05-21T09:30:00.000Z',
      status: 'open',
      statusLabel: '待闭环',
    })
    closeQualityMrbDispositionRecord.mockImplementationOnce(() => {
      throw new Error('MRB closure storage unavailable')
    })

    const wrapper = mountQualityBoard()
    await flushPromises()

    let thrown: unknown
    try {
      wrapper.findComponent({ name: 'QualityMrbDispositionPanel' }).vm.$emit('close')
      await flushPromises()
    } catch (e: unknown) {
      thrown = e
    }

    expect(thrown).toBeUndefined()
    const alert = wrapper.get('[role="alert"]')
    expect(alert.text()).toContain('MRB 处置闭环写入失败')
    expect(alert.text()).toContain('MRB closure storage unavailable')
    expect(wrapper.findComponent({ name: 'QualityMrbDispositionPanel' }).props('record')).toMatchObject({
      id: 'MRB-OPEN',
      status: 'open',
    })
  })

  it('fails loud when barcode quality knowledge sample cannot be archived', async () => {
    readOtdEvidenceChainRecords.mockReturnValue([
      {
        id: 'barcode-rework-WO-RUSH-9001-OP-10',
        traceId: 'TRACE-QR-WO-RUSH-9001-OP-10-REWORK',
        type: 'quality-gate',
        stage: '扫码返工',
        title: 'WO-RUSH-9001 CNC 精加工 扫码返工冻结',
        summary: '扫码返工证据等待复用。',
        status: 'active',
        statusLabel: '返工中',
        object: 'WO-RUSH-9001 / OP-10',
        createdAt: '2026-05-20T10:00:00.000Z',
      },
    ])
    writeQualityKnowledgeSample.mockImplementationOnce(() => {
      throw new Error('quality knowledge storage unavailable')
    })

    const wrapper = mountQualityBoard()
    await flushPromises()

    let thrown: unknown
    try {
      await wrapper.get('.barcode-knowledge-sample-panel button').trigger('click')
      await flushPromises()
    } catch (e: unknown) {
      thrown = e
    }

    expect(thrown).toBeUndefined()
    const alert = wrapper.get('[role="alert"]')
    expect(alert.text()).toContain('质量知识样本写入失败')
    expect(alert.text()).toContain('quality knowledge storage unavailable')
    expect(wrapper.get('.barcode-knowledge-sample-panel').text()).toContain('沉淀为 CAPA 知识样本')
    expect(wrapper.find('.sample-synced').exists()).toBe(false)
  })

  it('fails loud when barcode quality knowledge reuse draft cannot be archived', async () => {
    readOtdEvidenceChainRecords.mockReturnValue([
      {
        id: 'barcode-rework-WO-RUSH-9001-OP-10',
        traceId: 'TRACE-QR-WO-RUSH-9001-OP-10-REWORK',
        type: 'quality-gate',
        stage: '扫码返工',
        title: 'WO-RUSH-9001 CNC 精加工 扫码返工冻结',
        summary: '扫码返工证据等待复用。',
        status: 'active',
        statusLabel: '返工中',
        object: 'WO-RUSH-9001 / OP-10',
        createdAt: '2026-05-20T10:00:00.000Z',
      },
    ])
    writeQualityKnowledgeReuseDraft.mockImplementationOnce(() => {
      throw new Error('quality reuse draft storage unavailable')
    })

    const wrapper = mountQualityBoard()
    await flushPromises()

    await wrapper.get('.barcode-knowledge-sample-panel button').trigger('click')
    await flushPromises()

    let thrown: unknown
    try {
      await wrapper.get('.barcode-knowledge-sample-panel button').trigger('click')
      await flushPromises()
    } catch (e: unknown) {
      thrown = e
    }

    expect(thrown).toBeUndefined()
    const alert = wrapper.get('[role="alert"]')
    expect(alert.text()).toContain('质量知识复用草案写入失败')
    expect(alert.text()).toContain('quality reuse draft storage unavailable')
    expect(wrapper.get('.barcode-knowledge-sample-panel').text()).toContain('生成同类缺陷处置草案')
    expect(wrapper.find('.reuse-draft-result').exists()).toBe(false)
  })

  it('fails loud when barcode quality gate release evidence cannot be archived', async () => {
    readOtdEvidenceChainRecords.mockReturnValue([
      {
        id: 'barcode-rework-WO-RUSH-9001-OP-10',
        traceId: 'TRACE-QR-WO-RUSH-9001-OP-10-REWORK',
        type: 'quality-gate',
        stage: '扫码返工',
        title: 'WO-RUSH-9001 CNC 精加工 扫码返工冻结',
        summary: '扫码返工证据等待复验释放。',
        status: 'active',
        statusLabel: '返工中',
        object: 'WO-RUSH-9001 / OP-10',
        createdAt: '2026-05-20T10:00:00.000Z',
      },
    ])
    upsertOtdEvidenceChainRecord.mockImplementationOnce(() => {
      throw new Error('barcode release storage unavailable')
    })

    const wrapper = mountQualityBoard()
    await flushPromises()

    let thrown: unknown
    try {
      await wrapper.get('.barcode-release-banner button').trigger('click')
      await flushPromises()
    } catch (e: unknown) {
      thrown = e
    }

    expect(thrown).toBeUndefined()
    const alert = wrapper.get('[role="alert"]')
    expect(alert.text()).toContain('扫码质量门释放写入失败')
    expect(alert.text()).toContain('barcode release storage unavailable')
    expect(wrapper.get('.barcode-release-banner').text()).toContain('返工复验待放行')
    expect(wrapper.find('.barcode-release-message').exists()).toBe(false)
  })

  it('alerts while showing fallback anomalies when the anomaly API is unavailable', async () => {
    httpGet.mockRejectedValueOnce(new Error('anomaly API unavailable'))

    const wrapper = mountQualityBoard()
    await flushPromises()

    expect(wrapper.get('.anomalies-body').text()).toContain('装配后轴孔配合间隙')
    const alert = wrapper.get('[role="alert"]')
    expect(alert.text()).toContain('质量异常告警加载失败')
    expect(alert.text()).toContain('anomaly API unavailable')
  })

  it('alerts while showing fallback SPC data when trend analysis is unavailable', async () => {
    analyzeSpcTrend.mockRejectedValueOnce(new Error('SPC backend unavailable'))

    const wrapper = mountQualityBoard()
    await flushPromises()

    expect(wrapper.findAll('.spc-chart circle').length).toBeGreaterThan(0)
    const alert = wrapper.get('[role="alert"]')
    expect(alert.text()).toContain('SPC 趋势分析加载失败')
    expect(alert.text()).toContain('SPC backend unavailable')
  })

  it('clears the stale SPC fallback alert after a later trend analysis succeeds', async () => {
    analyzeSpcTrend.mockRejectedValueOnce(new Error('SPC backend unavailable'))

    const wrapper = mountQualityBoard()
    await flushPromises()

    expect(wrapper.get('[role="alert"]').text()).toContain('SPC 趋势分析加载失败')

    await wrapper.get('.param-select').setValue('hardness')
    await flushPromises()

    expect(wrapper.find('[role="alert"]').exists()).toBe(false)
    expect(wrapper.findAll('.spc-chart circle')).toHaveLength(3)
  })

  it('alerts while showing fallback root cause analysis when AI analysis is unavailable', async () => {
    analyzeRootCause.mockRejectedValueOnce(new Error('root cause API unavailable'))

    const wrapper = mountQualityBoard()
    await flushPromises()

    await wrapper.get('.action-btn').trigger('click')
    await flushPromises()

    expect(wrapper.get('[role="dialog"]').text()).toContain('刀具磨损超差')
    const alert = wrapper.get('[role="alert"]')
    expect(alert.text()).toContain('根因分析加载失败')
    expect(alert.text()).toContain('root cause API unavailable')
  })

  it('clears the stale root cause fallback alert after a later analysis succeeds', async () => {
    getInspections.mockResolvedValueOnce([
      {
        id: 'INS-ROOT-FAIL',
        workOrderId: 'WO-ROOT-FAIL',
        productCode: 'PRD-ROOT',
        processName: 'CNC精加工',
        inspectionPoint: '尺寸检验',
        inspectionQuantity: 10,
        qualifiedQuantity: 8,
        defectQuantity: 2,
        result: 'fail',
        inspectorId: 'USR-001',
        inspectedAt: '2026-05-12T09:00:00',
        passRate: 80,
      },
      {
        id: 'INS-ROOT-OK',
        workOrderId: 'WO-ROOT-OK',
        productCode: 'PRD-ROOT',
        processName: '装配',
        inspectionPoint: '功能测试',
        inspectionQuantity: 8,
        qualifiedQuantity: 7,
        defectQuantity: 1,
        result: 'fail',
        inspectorId: 'USR-002',
        inspectedAt: '2026-05-12T10:00:00',
        passRate: 87.5,
      },
    ])
    analyzeRootCause.mockImplementation((inspectionId: string) => {
      if (inspectionId === 'INS-ROOT-FAIL') return Promise.reject(new Error('root cause API unavailable'))
      return Promise.resolve({
        inspectionId: 'INS-ROOT-OK',
        rootCauses: [
          { cause: '装配扭矩异常', probability: 0.7, evidence: '复测扭矩偏低' },
        ],
        correctiveActions: ['复核装配扭矩'],
        preventiveMeasures: ['校准扭矩扳手'],
        analysisSummary: '主要根因为装配扭矩异常。',
      })
    })

    const wrapper = mountQualityBoard()
    await flushPromises()

    await wrapper.get('[aria-label="查看 INS-ROOT-FAIL 根因分析"]').trigger('click')
    await flushPromises()

    expect(wrapper.get('[role="alert"]').text()).toContain('根因分析加载失败')

    await wrapper.get('[aria-label="查看 INS-ROOT-OK 根因分析"]').trigger('click')
    await flushPromises()

    expect(wrapper.find('[role="alert"]').exists()).toBe(false)
    expect(wrapper.get('[role="dialog"]').text()).toContain('INS-ROOT-OK')
  })

  it('reopens cached root cause analysis without refetching after the panel is closed', async () => {
    const wrapper = mountQualityBoard()
    await flushPromises()

    const action = wrapper.get('.action-btn')
    await action.trigger('click')
    await flushPromises()

    expect(analyzeRootCause).toHaveBeenCalledTimes(1)
    await wrapper.get('.close-btn').trigger('click')
    await flushPromises()
    expect(wrapper.find('[role="dialog"]').exists()).toBe(false)

    expect(action.attributes('disabled')).toBeUndefined()
    await action.trigger('click')
    await flushPromises()

    expect(analyzeRootCause).toHaveBeenCalledTimes(1)
    expect(wrapper.get('[role="dialog"]').text()).toContain('INS-FAIL-001')
  })

  it('reuses an in-flight root cause analysis request for repeated clicks on the same inspection', async () => {
    const pendingAnalysis = createDeferred<{
      inspectionId: string
      rootCauses: Array<{ cause: string; probability: number; evidence: string }>
      correctiveActions: string[]
      preventiveMeasures: string[]
      analysisSummary: string
    }>()
    analyzeRootCause.mockReturnValueOnce(pendingAnalysis.promise)

    const wrapper = mountQualityBoard()
    await flushPromises()

    const action = wrapper.get('.action-btn')
    await action.trigger('click')
    await action.trigger('click')

    expect(analyzeRootCause).toHaveBeenCalledTimes(1)

    pendingAnalysis.resolve({
      inspectionId: 'INS-FAIL-001',
      rootCauses: [
        { cause: '刀具磨损超差', probability: 0.65, evidence: '连续运行超过推荐换刀周期' },
      ],
      correctiveActions: ['立即更换刀具'],
      preventiveMeasures: ['建立刀具寿命看板'],
      analysisSummary: '主要根因为刀具磨损导致尺寸异常。',
    })
    await flushPromises()

    expect(wrapper.get('[role="dialog"]').text()).toContain('INS-FAIL-001')
  })

  it('keeps the latest root cause analysis visible when an earlier request finishes later', async () => {
    const slowAnalysis = createDeferred<{
      inspectionId: string
      rootCauses: Array<{ cause: string; probability: number; evidence: string }>
      correctiveActions: string[]
      preventiveMeasures: string[]
      analysisSummary: string
    }>()
    getInspections.mockResolvedValueOnce([
      {
        id: 'INS-SLOW-001',
        workOrderId: 'WO-SLOW-001',
        productCode: 'PRD-SLOW',
        processName: 'CNC精加工',
        inspectionPoint: '尺寸检验',
        inspectionQuantity: 10,
        qualifiedQuantity: 7,
        defectQuantity: 3,
        result: 'fail',
        inspectorId: 'USR-001',
        inspectedAt: '2026-05-12T09:00:00',
        passRate: 70,
      },
      {
        id: 'INS-FAST-001',
        workOrderId: 'WO-FAST-001',
        productCode: 'PRD-FAST',
        processName: '装配',
        inspectionPoint: '功能测试',
        inspectionQuantity: 8,
        qualifiedQuantity: 6,
        defectQuantity: 2,
        result: 'fail',
        inspectorId: 'USR-002',
        inspectedAt: '2026-05-12T10:00:00',
        passRate: 75,
      },
    ])
    analyzeRootCause.mockImplementation((inspectionId: string) => {
      if (inspectionId === 'INS-SLOW-001') return slowAnalysis.promise
      return Promise.resolve({
        inspectionId: 'INS-FAST-001',
        rootCauses: [
          { cause: '装配扭矩异常', probability: 0.7, evidence: '复测扭矩偏低' },
        ],
        correctiveActions: ['复核装配扭矩'],
        preventiveMeasures: ['校准扭矩扳手'],
        analysisSummary: '主要根因为装配扭矩异常。',
      })
    })

    const wrapper = mountQualityBoard()
    await flushPromises()

    await wrapper.get('[aria-label="查看 INS-SLOW-001 根因分析"]').trigger('click')
    await wrapper.get('[aria-label="查看 INS-FAST-001 根因分析"]').trigger('click')
    await flushPromises()

    expect(wrapper.get('[role="dialog"]').text()).toContain('INS-FAST-001')

    slowAnalysis.resolve({
      inspectionId: 'INS-SLOW-001',
      rootCauses: [
        { cause: '刀具磨损超差', probability: 0.65, evidence: '连续运行超过推荐换刀周期' },
      ],
      correctiveActions: ['立即更换刀具'],
      preventiveMeasures: ['建立刀具寿命看板'],
      analysisSummary: '主要根因为刀具磨损导致尺寸异常。',
    })
    await flushPromises()

    expect(wrapper.get('[role="dialog"]').text()).toContain('INS-FAST-001')
  })

  it('clears the previous root cause dialog while loading a different inspection analysis', async () => {
    const pendingNewAnalysis = createDeferred<{
      inspectionId: string
      rootCauses: Array<{ cause: string; probability: number; evidence: string }>
      correctiveActions: string[]
      preventiveMeasures: string[]
      analysisSummary: string
    }>()
    getInspections.mockResolvedValueOnce([
      {
        id: 'INS-OLD-001',
        workOrderId: 'WO-OLD-001',
        productCode: 'PRD-OLD',
        processName: 'CNC精加工',
        inspectionPoint: '尺寸检验',
        inspectionQuantity: 10,
        qualifiedQuantity: 8,
        defectQuantity: 2,
        result: 'fail',
        inspectorId: 'USR-001',
        inspectedAt: '2026-05-12T09:00:00',
        passRate: 80,
      },
      {
        id: 'INS-NEW-001',
        workOrderId: 'WO-NEW-001',
        productCode: 'PRD-NEW',
        processName: '装配',
        inspectionPoint: '功能测试',
        inspectionQuantity: 8,
        qualifiedQuantity: 5,
        defectQuantity: 3,
        result: 'fail',
        inspectorId: 'USR-002',
        inspectedAt: '2026-05-12T10:00:00',
        passRate: 62.5,
      },
    ])
    analyzeRootCause.mockImplementation((inspectionId: string) => {
      if (inspectionId === 'INS-NEW-001') return pendingNewAnalysis.promise
      return Promise.resolve({
        inspectionId: 'INS-OLD-001',
        rootCauses: [
          { cause: '旧批次尺寸异常', probability: 0.6, evidence: '旧批次证据' },
        ],
        correctiveActions: ['复核旧批次'],
        preventiveMeasures: ['监控旧批次'],
        analysisSummary: '旧批次分析。',
      })
    })

    const wrapper = mountQualityBoard()
    await flushPromises()

    await wrapper.get('[aria-label="查看 INS-OLD-001 根因分析"]').trigger('click')
    await flushPromises()
    expect(wrapper.get('[role="dialog"]').text()).toContain('INS-OLD-001')

    await wrapper.get('[aria-label="查看 INS-NEW-001 根因分析"]').trigger('click')
    await flushPromises()

    expect(wrapper.find('[role="dialog"]').exists()).toBe(false)

    pendingNewAnalysis.resolve({
      inspectionId: 'INS-NEW-001',
      rootCauses: [
        { cause: '新批次功能异常', probability: 0.75, evidence: '新批次证据' },
      ],
      correctiveActions: ['复核新批次'],
      preventiveMeasures: ['监控新批次'],
      analysisSummary: '新批次分析。',
    })
    await flushPromises()

    expect(wrapper.get('[role="dialog"]').text()).toContain('INS-NEW-001')
  })

  it('names the root cause analysis close button for assistive technology', async () => {
    const wrapper = mountQualityBoard()
    await flushPromises()

    await wrapper.get('.action-btn').trigger('click')
    await flushPromises()

    expect(wrapper.get('.close-btn').attributes('aria-label')).toBe('关闭根因分析')
  })

  it('names each root cause analysis action with the inspection id', async () => {
    const wrapper = mountQualityBoard()
    await flushPromises()

    expect(wrapper.get('.action-btn').attributes('aria-label')).toBe('查看 INS-FAIL-001 根因分析')
  })

  it('names the inspection result filter for assistive technology', async () => {
    const wrapper = mountQualityBoard()
    await flushPromises()

    expect(wrapper.get('.filter-select').attributes('aria-label')).toBe('筛选检验结果')
  })

  it('names the SPC parameter selector for assistive technology', async () => {
    const wrapper = mountQualityBoard()
    await flushPromises()

    expect(wrapper.get('.param-select').attributes('aria-label')).toBe('选择 SPC 参数')
  })

  it('explains when SPC analysis returns no data points', async () => {
    analyzeSpcTrend.mockResolvedValueOnce({
      dataPoints: [],
      hasTrend: false,
      trendDirection: '',
      recommendedAction: '',
    })

    const wrapper = mountQualityBoard()
    await flushPromises()

    expect(wrapper.findAll('.spc-chart circle')).toHaveLength(0)
    expect(wrapper.get('.spc-empty-state').text()).toBe('暂无 SPC 数据')
  })

  it('keeps the latest SPC parameter result when an earlier request finishes later', async () => {
    const slowSurface = createDeferred<{
      dataPoints: number[]
      hasTrend: boolean
      trendDirection: string
      recommendedAction: string
    }>()
    analyzeSpcTrend.mockImplementation((parameter: string) => {
      if (parameter === 'surface_roughness') return slowSurface.promise
      return Promise.resolve({
        dataPoints: [80, 90],
        hasTrend: true,
        trendDirection: '硬度',
        recommendedAction: '复核硬度趋势',
      })
    })

    const wrapper = mountQualityBoard()
    await flushPromises()

    await wrapper.get('.param-select').setValue('hardness')
    await flushPromises()

    expect(wrapper.get('.spc-alert').text()).toContain('硬度趋势')
    expect(wrapper.get('.spc-recommend').text()).toContain('复核硬度趋势')

    slowSurface.resolve({
      dataPoints: [10, 20],
      hasTrend: true,
      trendDirection: '表面粗糙度',
      recommendedAction: '复核粗糙度趋势',
    })
    await flushPromises()

    expect(wrapper.get('.spc-alert').text()).toContain('硬度趋势')
    expect(wrapper.get('.spc-recommend').text()).toContain('复核硬度趋势')
  })
})
