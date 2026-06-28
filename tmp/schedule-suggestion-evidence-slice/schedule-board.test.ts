import { flushPromises, mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import ScheduleBoard from '../../src/components/schedule/ScheduleBoard.vue'

const getCurrentPlan = vi.hoisted(() => vi.fn())
const getEquipmentList = vi.hoisted(() => vi.fn())
const getWorkOrderById = vi.hoisted(() => vi.fn())
const optimizeSchedule = vi.hoisted(() => vi.fn())
const rescheduleItem = vi.hoisted(() => vi.fn())
const submitAdoptionFeedback = vi.hoisted(() => vi.fn())
const getLatestAdoptionFeedback = vi.hoisted(() => vi.fn())
const readScheduleFeedbackSnapshot = vi.hoisted(() => vi.fn())
const getBottleneckEquipmentIds = vi.hoisted(() => vi.fn())
const getRiskDashboard = vi.hoisted(() => vi.fn())
const confirmOutsourcingScheduleRelease = vi.hoisted(() => vi.fn())
const readLatestOutsourcingCommitmentPackage = vi.hoisted(() => vi.fn())
const readLatestOutsourcingCommitmentPackageBackendFirst = vi.hoisted(() => vi.fn())
const readAlternateMaterialApprovalBackendFirst = vi.hoisted(() => vi.fn())
const readEngineeringChangeImpactAnalysisBackendFirst = vi.hoisted(() => vi.fn())
const readRouteCapabilityValidationBackendFirst = vi.hoisted(() => vi.fn())
const closeAssistantRecoveryPackage = vi.hoisted(() => vi.fn())
const readAssistantRecoveryPackagesBackendFirst = vi.hoisted(() => vi.fn(async () => []))

vi.mock('../../src/components/gantt/GanttChart.vue', () => ({
  default: {
    emits: ['task-click', 'task-dbl-click', 'task-drag-end'],
    template: '<div class="gantt-chart-stub" />',
  },
}))

vi.mock('../../src/api/scheduling', () => ({
  getCurrentPlan,
  getEquipmentList,
  optimizeSchedule,
  getWorkOrderById,
  rescheduleItem,
  submitAdoptionFeedback,
  getLatestAdoptionFeedback,
}))

vi.mock('../../src/api/equipment', () => ({
  getBottleneckEquipmentIds,
}))

vi.mock('../../src/api/risk', () => ({
  getRiskDashboard,
}))

vi.mock('../../src/composables/useExport', () => ({
  useExport: () => ({
    csvFilename: (name: string) => `${name}.csv`,
    downloadCsv: vi.fn(),
  }),
}))

vi.mock('../../src/utils/offline-demo-mode', async () => {
  const actual = await vi.importActual<typeof import('../../src/utils/offline-demo-mode')>('../../src/utils/offline-demo-mode')
  return {
    ...actual,
    logUnlessOfflineDemo: vi.fn(),
  }
})

const emptyAsyncRecordMock = vi.hoisted(() => () => vi.fn().mockResolvedValue(null))

vi.mock('../../src/utils/shortage-risk-sync', () => ({
  matchesShortageMaterial: vi.fn(() => false),
  readBomKittingPackage: vi.fn(() => null),
  readBomKittingPackageBackendFirst: emptyAsyncRecordMock(),
  readShortageKittingEventBackendFirst: emptyAsyncRecordMock(),
  readShortageRiskResolutionBackendFirst: emptyAsyncRecordMock(),
  readSupplierNetworkDecision: vi.fn(() => null),
  readSupplierNetworkDecisionBackendFirst: emptyAsyncRecordMock(),
  readSupplyRiskEscalation: vi.fn(() => null),
  readSupplyRiskEscalationBackendFirst: emptyAsyncRecordMock(),
}))

vi.mock('../../src/utils/quality-rework-sync', () => ({
  readQualityReworkImpactBackendFirst: emptyAsyncRecordMock(),
}))

vi.mock('../../src/utils/quality-mrb-disposition-sync', () => ({
  readQualityMrbDispositionRecord: vi.fn(() => null),
  readQualityMrbDispositionRecordBackendFirst: emptyAsyncRecordMock(),
}))

vi.mock('../../src/utils/equipment-risk-sync', () => ({
  readEquipmentDowntimeEvent: vi.fn(() => null),
}))

vi.mock('../../src/utils/anomaly-dispatch-sync', () => ({
  readAnomalyDispatchRecords: vi.fn(() => []),
  readAnomalyDispatchRecordsBackendFirst: vi.fn(async () => []),
}))

vi.mock('../../src/utils/schedule-feedback-sync', () => ({
  readScheduleFeedbackSnapshot,
  writeScheduleFeedbackSnapshot: vi.fn(),
}))

vi.mock('../../src/utils/engineering-change-sync', () => ({
  readAlternateMaterialApproval: vi.fn(() => null),
  readAlternateMaterialApprovalBackendFirst,
  readEngineeringChangeImpactAnalysis: vi.fn(() => null),
  readEngineeringChangeImpactAnalysisBackendFirst,
  readRouteCapabilityValidation: vi.fn(() => null),
  readRouteCapabilityValidationBackendFirst,
}))

vi.mock('../../src/utils/outsourcing-commitment-sync', () => ({
  confirmOutsourcingScheduleRelease,
  readLatestOutsourcingCommitmentPackage,
  readLatestOutsourcingCommitmentPackageBackendFirst,
}))

vi.mock('../../src/utils/otd-kpi-commitment-sync', () => ({
  readLatestOtdKpiCommitmentPackage: vi.fn(() => null),
  readLatestOtdKpiCommitmentPackageBackendFirst: emptyAsyncRecordMock(),
}))

vi.mock('../../src/utils/otd-evidence-chain-sync', () => ({
  readOtdEvidenceChainRecords: vi.fn(() => []),
}))

vi.mock('../../src/utils/assistant-action-package-sync', () => ({
  closeAssistantRecoveryPackage,
  readAssistantRecoveryPackages: vi.fn(() => []),
  readAssistantRecoveryPackagesBackendFirst,
}))

vi.mock('../../src/utils/assistant-engineering-constraint-package-sync', () => ({
  readAssistantEngineeringConstraintPackagesBackendFirst: vi.fn(async () => []),
}))

vi.mock('../../src/utils/monitoring-situation-escalation-sync', () => ({
  readMonitoringSituationEscalations: vi.fn(() => []),
  readMonitoringSituationEscalationsBackendFirst: vi.fn(async () => []),
}))

vi.mock('../../src/utils/poc-pilot-run-sync', () => ({
  readPocPilotRunRecordBackendFirst: emptyAsyncRecordMock(),
}))

vi.mock('../../src/utils/risk-sla-review-sync', () => ({
  readRiskSlaReviewRecord: vi.fn(() => null),
  readRiskSlaReviewRecordBackendFirst: emptyAsyncRecordMock(),
}))

vi.mock('../../src/utils/labor-assignment-sync', () => ({
  readLaborQualificationBlock: vi.fn(() => null),
  readLaborReassignment: vi.fn(() => null),
}))

const ToolbarStub = {
  emits: ['optimize'],
  template: '<button type="button" class="optimize-button" @click="$emit(\'optimize\')">优化</button>',
}

const ScheduleMetricsStub = {
  props: {
    utilization: Number,
    onTimeDelivery: Number,
    changeoverMinutes: Number,
    groupCount: Number,
  },
  template: '<div />',
}

const OrderDetailPanelProbe = {
  props: {
    visible: Boolean,
    loading: Boolean,
    error: String,
    order: Object,
    explanation: Object,
  },
  template: `
    <section
      class="order-detail-probe"
      :data-visible="String(visible)"
      :data-loading="String(loading)"
      :data-error="error ?? ''"
      :data-order-number="order?.orderNumber ?? ''"
      :data-explanation-work-order="explanation?.workOrderNumber ?? ''"
    />
  `,
}

function mountScheduleBoard(stubs = {}) {
  return mount(ScheduleBoard, {
    global: {
      stubs: {
        GanttToolbar: ToolbarStub,
        ScheduleMetrics: ScheduleMetricsStub,
        ScheduleAgentWorkbenchPanel: true,
        ScheduleImpactPanel: true,
        RushOrderImpactPanel: true,
        EngineeringConstraintPanel: true,
        ScheduleFeedbackPanel: true,
        ScheduleEventQueuePanel: true,
        ScheduleRecoveryHandoffPanel: true,
        OrderDetailPanel: true,
        FeedbackForm: true,
        ParetoCompare: true,
        GanttChart: true,
        ...stubs,
      },
    },
  })
}

function makePlan() {
  const start = new Date('2026-06-01T08:00:00.000Z')
  const end = new Date('2026-06-01T12:00:00.000Z')

  return {
    id: 'plan-1',
    planName: 'AI 排产基线',
    planStartDate: start.toISOString(),
    planEndDate: end.toISOString(),
    overallUtilizationRate: 0.82,
    onTimeDeliveryRate: 0.9,
    totalChangeoverMinutes: 35,
    groupCount: 1,
    createdAt: start.toISOString(),
    items: [
      {
        id: 'item-1',
        workOrderId: 'wo-1',
        workOrderNumber: 'WO-001',
        equipmentId: 'eq-1',
        equipmentName: 'CNC-01',
        plannedStartTime: start.toISOString(),
        plannedEndTime: end.toISOString(),
        sequence: 1,
        setupTime: '30 分钟',
        dependentItems: [],
      },
    ],
  }
}

function makeReceivedOutsourcingCommitment() {
  return {
    id: 'outsourcing-commitment-product-flange',
    sourceKpiId: 'product-flange',
    dimensionLabel: '产品族',
    targetName: '法兰组件',
    title: '法兰组件外协承诺包',
    auditId: 'AUD-OUTSOURCING-COMMITMENT-FLANGE-20260521-001',
    traceId: 'TRACE-OUTSOURCING-FLANGE-20260521',
    actor: '调度员 李工',
    baselineOtd: 82,
    agentOtd: 88,
    lift: 6,
    delayedReduced: 1,
    statusLabel: '外协到货已确认',
    commitment: '法兰组件外协到货口径已确认。',
    owner: '采购 / 计划联合确认',
    dueAt: '2026-06-03',
    summary: '外协到货后等待排产释放。',
    actions: [
      {
        module: '外协协同',
        owner: '采购 / 计划',
        action: '确认法兰组件外协到货',
        evidence: 'TRACE-OUTSOURCING-FLANGE-RECEIPT-20260521',
      },
    ],
    partnerName: '苏州精工外协',
    promiseDate: '2026-06-03',
    affectedOrders: 'WO-RUSH-9001',
    sourceTraceId: 'TRACE-OTD-KPI-PRODUCT-FLANGE',
    createdAt: '2026-06-01T08:00:00.000Z',
    receivedAt: '2026-06-01T09:00:00.000Z',
    receivedBy: '采购 王工',
    receiptAuditId: 'AUD-OUTSOURCING-RECEIPT-FLANGE-20260521-001',
    receiptTraceId: 'TRACE-OUTSOURCING-FLANGE-RECEIPT-20260521',
    receiptMessage: '法兰组件外协到货已确认。',
  }
}

function makeClosedAssistantRecoveryPackage() {
  return {
    id: 'assistant-recovery-1',
    title: 'Assistant 恢复交接',
    auditCode: 'AUD-AST-RECOVERY-001',
    traceId: 'TRACE-AST-RECOVERY-001',
    actor: '调度员 李工',
    role: 'Scheduler',
    workOrders: 'WO-RUSH-9001',
    priority: 'critical',
    owner: '生产经理审批',
    dueAt: '今日 15:30',
    scheduleWindow: 'CNC-003 夜班窗口',
    scheduleAction: '插入 WO-RUSH-9001 并保留 OP-20 复核。',
    riskImpact: '急单恢复窗口依赖替代料和质量复核。',
    riskSuggestion: '闭环后复核排产窗口。',
    otdImpact: '+6%',
    delayImpact: '-1 单',
    changeoverImpact: '+8min',
    status: 'closed',
    statusLabel: '执行交接已闭环',
    purchaseActionStatus: 'closed',
    purchaseActionSummary: '采购已确认替代料到货',
    qualityActionStatus: 'closed',
    qualityActionSummary: '质量已完成 OP-20 复核',
    closureAuditCode: 'AUD-AST-RECOVERY-CLOSED-001',
    closureTraceId: 'TRACE-AST-RECOVERY-CLOSED-001',
    closureSummary: '执行交接闭环，等待排产复核。',
    closedAt: '2026-06-22T10:30:00.000Z',
    closedBy: '调度员 李工',
    summary: 'Assistant 恢复交接包已闭环，排产需要复核恢复窗口。',
    dispatchSteps: [
      {
        module: 'AI 排产',
        owner: '调度员 李工',
        action: '复核恢复窗口',
        evidence: 'TRACE-AST-RECOVERY-CLOSED-001',
        status: 'closed',
        result: '已闭环',
        closedAt: '2026-06-22T10:30:00.000Z',
      },
    ],
    createdAt: '2026-06-22T09:30:00.000Z',
  }
}

describe('ScheduleBoard', () => {
  beforeEach(() => {
    getCurrentPlan.mockResolvedValue(makePlan())
    getEquipmentList.mockResolvedValue({
      items: [
        {
          id: 'eq-1',
          equipmentCode: 'CNC-01',
          equipmentName: 'CNC-01',
          equipmentType: 'CNC',
          status: 'running',
          capacity: 100,
          utilizationRate: 0.82,
        },
      ],
      totalCount: 1,
    })
    getBottleneckEquipmentIds.mockResolvedValue(['eq-1'])
    getRiskDashboard.mockRejectedValue(new Error('risk unavailable'))
    confirmOutsourcingScheduleRelease.mockReset()
    readLatestOutsourcingCommitmentPackage.mockReset()
    readLatestOutsourcingCommitmentPackage.mockReturnValue(null)
    readLatestOutsourcingCommitmentPackageBackendFirst.mockReset()
    readLatestOutsourcingCommitmentPackageBackendFirst.mockResolvedValue(null)
    readAlternateMaterialApprovalBackendFirst.mockReset()
    readAlternateMaterialApprovalBackendFirst.mockResolvedValue(null)
    readEngineeringChangeImpactAnalysisBackendFirst.mockReset()
    readEngineeringChangeImpactAnalysisBackendFirst.mockResolvedValue(null)
    readRouteCapabilityValidationBackendFirst.mockReset()
    readRouteCapabilityValidationBackendFirst.mockResolvedValue(null)
    closeAssistantRecoveryPackage.mockReset()
    closeAssistantRecoveryPackage.mockReturnValue(null)
    readAssistantRecoveryPackagesBackendFirst.mockReset()
    readAssistantRecoveryPackagesBackendFirst.mockResolvedValue([])
    optimizeSchedule.mockReset()
    rescheduleItem.mockReset()
    getWorkOrderById.mockReset()
    submitAdoptionFeedback.mockReset()
    getLatestAdoptionFeedback.mockReset()
    getLatestAdoptionFeedback.mockResolvedValue(null)
    readScheduleFeedbackSnapshot.mockReset()
    readScheduleFeedbackSnapshot.mockReturnValue(null)
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        baseline: { otd: 0.2667, delayed: 22, changeoverMinutes: 2040 },
        agent: { otd: 0.3, delayed: 21, changeoverMinutes: 2040 },
        delta: { otd: 0.0333, delayedOrdersReduced: 1, changeoverMinutesReduced: 0 },
      }),
    }))
  })


  it('keeps the schedule plan usable when startup engineering constraint sync fails', async () => {
    readEngineeringChangeImpactAnalysisBackendFirst.mockRejectedValueOnce(new Error('engineering startup evidence unavailable'))

    const wrapper = mountScheduleBoard()
    await flushPromises()

    expect(getCurrentPlan).toHaveBeenCalled()
    expect(wrapper.text()).toContain('OTD 预测90%')
    const status = wrapper.get('.warnings-bar')
    expect(status.attributes('role')).toBe('status')
    expect(status.attributes('aria-live')).toBe('polite')
    expect(status.text()).toContain('工程约束启动证据加载失败')
    expect(status.text()).toContain('engineering startup evidence unavailable')
    expect(readAlternateMaterialApprovalBackendFirst).toHaveBeenCalledWith({ failLoud: true })
    expect(readEngineeringChangeImpactAnalysisBackendFirst).toHaveBeenCalledWith({ failLoud: true })
    expect(readRouteCapabilityValidationBackendFirst).toHaveBeenCalledWith({ failLoud: true })
  })
  it('restores the local adoption feedback snapshot after reloading the schedule page', async () => {
    readScheduleFeedbackSnapshot.mockReturnValueOnce({
      decision: 'accepted',
      decisionLabel: '已采纳批量对比方案',
      reasonCategory: 'batch_optimize_apply',
      categoryLabel: '批量对比采纳',
      reasonDetail: '从批量对比中选择此方案',
      objectiveLabel: '综合平衡',
      createdAt: '2026-06-14T10:30:00.000Z',
      traceId: 'TRACE-SCH-FEEDBACK-BATCH-balanced',
      source: 'local',
    })

    const wrapper = mountScheduleBoard({
      ScheduleFeedbackPanel: {
        props: ['latestFeedback', 'syncNote'],
        template: '<section class="feedback-probe"><p class="feedback-record">{{ latestFeedback?.decisionLabel }} {{ latestFeedback?.categoryLabel }} {{ latestFeedback?.objectiveLabel }} {{ latestFeedback?.reasonDetail }}</p><p class="sync-note" role="status" aria-live="polite">{{ syncNote }}</p></section>',
      },
    })
    await flushPromises()

    const record = wrapper.get('.feedback-record')
    expect(record.text()).toContain('已采纳批量对比方案')
    expect(record.text()).toContain('批量对比采纳')
    expect(record.text()).toContain('综合平衡')
    expect(record.text()).toContain('从批量对比中选择此方案')
  })

  it('prefers backend latest feedback over a stale local snapshot when reloading the schedule page', async () => {
    getLatestAdoptionFeedback.mockResolvedValueOnce({
      decision: 'accepted',
      decisionLabel: '后端已采纳 Agent 推荐',
      reasonCategory: 'backend_adoption',
      categoryLabel: '后端正式采纳',
      reasonDetail: '后台同步的最新调度员决策',
      objectiveLabel: 'OTD 优先',
      createdAt: '2026-06-14T11:30:00.000Z',
      traceId: 'TRACE-SCH-FEEDBACK-BACKEND',
      source: 'backend',
    })
    readScheduleFeedbackSnapshot.mockReturnValueOnce({
      decision: 'accepted',
      decisionLabel: '已采纳批量对比方案',
      reasonCategory: 'batch_optimize_apply',
      categoryLabel: '批量对比采纳',
      reasonDetail: '从批量对比中选择此方案',
      objectiveLabel: '综合平衡',
      createdAt: '2026-06-14T10:30:00.000Z',
      traceId: 'TRACE-SCH-FEEDBACK-BATCH-balanced',
      source: 'local',
    })

    const wrapper = mountScheduleBoard({
      ScheduleFeedbackPanel: {
        props: ['latestFeedback', 'syncNote'],
        template: '<section class="feedback-probe"><p class="feedback-record">{{ latestFeedback?.decisionLabel }} {{ latestFeedback?.categoryLabel }} {{ latestFeedback?.objectiveLabel }} {{ latestFeedback?.reasonDetail }}</p><p class="sync-note" role="status" aria-live="polite">{{ syncNote }}</p></section>',
      },
    })
    await flushPromises()

    const record = wrapper.get('.feedback-record')
    expect(record.text()).toContain('后端已采纳 Agent 推荐')
    expect(record.text()).toContain('后端正式采纳')
    expect(record.text()).toContain('OTD 优先')
    expect(record.text()).toContain('后台同步的最新调度员决策')
    expect(record.text()).not.toContain('批量对比采纳')
  })

  it('falls back to the local snapshot and fails loud when backend latest feedback is not auditable', async () => {
    getLatestAdoptionFeedback.mockResolvedValueOnce({
      decision: 'accepted',
      decisionLabel: '后端已采纳 Agent 推荐',
      reasonCategory: 'backend_adoption',
      categoryLabel: '后端正式采纳',
      reasonDetail: '',
      objectiveLabel: 'OTD 优先',
      createdAt: '2026-06-14T11:30:00.000Z',
      source: 'backend',
    })
    readScheduleFeedbackSnapshot.mockReturnValueOnce({
      decision: 'accepted',
      decisionLabel: '已采纳批量对比方案',
      reasonCategory: 'batch_optimize_apply',
      categoryLabel: '批量对比采纳',
      reasonDetail: '从批量对比中选择此方案',
      objectiveLabel: '综合平衡',
      createdAt: '2026-06-14T10:30:00.000Z',
      traceId: 'TRACE-SCH-FEEDBACK-BATCH-balanced',
      source: 'local',
    })

    const wrapper = mountScheduleBoard({
      ScheduleFeedbackPanel: {
        props: ['latestFeedback', 'syncNote'],
        template: '<section class="feedback-probe"><p class="feedback-record">{{ latestFeedback?.decisionLabel }} {{ latestFeedback?.categoryLabel }} {{ latestFeedback?.objectiveLabel }} {{ latestFeedback?.reasonDetail }}</p><p class="sync-note" role="status" aria-live="polite">{{ syncNote }}</p></section>',
      },
    })
    await flushPromises()

    const record = wrapper.get('.feedback-record')
    expect(record.text()).toContain('已采纳批量对比方案')
    expect(record.text()).toContain('批量对比采纳')
    expect(record.text()).toContain('综合平衡')
    expect(record.text()).not.toContain('后端正式采纳')
    const note = wrapper.get('.sync-note')
    expect(note.text()).toContain('后端最新采纳反馈不可审计')
    expect(note.text()).toContain('缺少原因说明')
    expect(note.text()).toContain('已回退本地最近反馈')
  })
  it('guides scheduler operators with bilingual links before optimization and adoption actions', async () => {
    const wrapper = mountScheduleBoard()
    await flushPromises()

    const guidance = wrapper.get('.schedule-workbench-guidance')
    expect(guidance.text()).toContain('优化或采纳前，请确认目标、锁定期、证据链和回写路径。')
    expect(guidance.text()).toContain('Before optimizing or adopting a plan, confirm objective, lock window, evidence trail, and writeback path.')

    const links = guidance.findAll('a')
    expect(links.map(link => link.attributes('href'))).toEqual([
      '/audit-logs',
      '/report',
      '#schedule-workbench-help',
    ])

    const help = wrapper.get('#schedule-workbench-help')
    expect(help.text()).toContain('先复核影响范围，再执行优化、采纳或拖拽回写。')
    expect(help.text()).toContain('Review impact scope before optimization, adoption, or drag writeback.')
  })

  it('announces optimization failures through an alert banner', async () => {
    optimizeSchedule.mockRejectedValueOnce(new Error('optimizer unavailable'))
    const wrapper = mountScheduleBoard()
    await flushPromises()

    await wrapper.get('.optimize-button').trigger('click')
    await flushPromises()

    const alert = wrapper.get('[role="alert"]')
    expect(alert.classes()).toContain('error-banner')
    expect(alert.text()).toContain('优化失败')
    expect(alert.text()).toContain('optimizer unavailable')
  })

  it('announces optimization warnings as a polite status update', async () => {
    optimizeSchedule.mockResolvedValueOnce({
      plan: makePlan(),
      assignments: [],
      estimatedCompletionRate: 0.92,
      utilizationRate: 0.86,
      warnings: ['CNC-01 瓶颈窗口冲突'],
    })
    const wrapper = mountScheduleBoard()
    await flushPromises()

    await wrapper.get('.optimize-button').trigger('click')
    await flushPromises()

    const status = wrapper.get('.warnings-bar')
    expect(status.attributes('role')).toBe('status')
    expect(status.attributes('aria-live')).toBe('polite')
    expect(status.attributes('aria-label')).toBe('排产预警')
    expect(status.text()).toContain('CNC-01 瓶颈窗口冲突')
  })

  it('announces risk event loading failures before showing local demo events', async () => {
    const wrapper = mountScheduleBoard()
    await flushPromises()

    const status = wrapper.get('.risk-event-sync-note')
    expect(status.attributes('role')).toBe('status')
    expect(status.attributes('aria-live')).toBe('polite')
    expect(status.text()).toContain('风险事件加载失败')
    expect(status.text()).toContain('已显示本地演示事件')
    expect(status.text()).toContain('risk unavailable')
  })

  it('keeps the backend load failure reason visible when falling back to the demo schedule', async () => {
    getCurrentPlan.mockRejectedValueOnce(new Error('current plan API unavailable'))

    const wrapper = mountScheduleBoard()
    await flushPromises()

    const status = wrapper.get('.warnings-bar')
    expect(status.attributes('role')).toBe('status')
    expect(status.attributes('aria-live')).toBe('polite')
    expect(status.text()).toContain('后端排产服务不可用')
    expect(status.text()).toContain('当前显示演示排产数据')
    expect(status.text()).toContain('current plan API unavailable')
  })

  it('warns when the latest A/B report cannot be loaded before using derived OTD comparison values', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => {
      throw new Error('schedule A/B report asset unavailable')
    }))

    const wrapper = mountScheduleBoard()
    await flushPromises()

    expect(fetch).toHaveBeenCalledWith('/reports/latest-ab-report.json', { cache: 'no-store' })
    const status = wrapper.get('.warnings-bar')
    expect(status.attributes('role')).toBe('status')
    expect(status.attributes('aria-live')).toBe('polite')
    expect(status.text()).toContain('A/B 报告读取失败')
    expect(status.text()).toContain('基线 vs Agent OTD 对比暂用排产计划推导值')
    expect(status.text()).toContain('schedule A/B report asset unavailable')
  })

  it('keeps real risk events visible when a secondary enrichment source fails', async () => {
    getRiskDashboard.mockResolvedValueOnce({
      materialRisks: [
        {
          materialCode: 'M-AL-6061',
          materialName: '铝合金 6061',
          available: 10,
          required: 100,
          riskDetail: '缺口 90，急单等待外协到货',
          affectedOrders: 'WO-RUSH-9001',
          level: 'critical',
        },
      ],
      equipmentRisks: [],
      orderRisks: [],
    })
    readLatestOutsourcingCommitmentPackageBackendFirst.mockRejectedValueOnce(new Error('outsourcing record unavailable'))

    const wrapper = mountScheduleBoard({
      ScheduleEventQueuePanel: {
        props: {
          events: Array,
          activeSuggestion: Object,
        },
        template: '<div class="event-queue-stub"><span class="event-title" v-for="event in events" :key="event.id">{{ event.title }}</span></div>',
      },
    })
    await flushPromises()

    expect(wrapper.get('.event-title').text()).toContain('M-AL-6061 齐套缺口')
    const note = wrapper.get('.risk-event-sync-note')
    expect(note.attributes('role')).toBe('status')
    expect(note.attributes('aria-live')).toBe('polite')
    expect(note.text()).toContain('风险事件增强失败')
    expect(note.text()).toContain('outsourcing record unavailable')
    expect(note.text()).not.toContain('风险事件加载失败，已显示本地演示事件')
  })

  it('maps material, equipment, and order risks into the schedule event queue', async () => {
    getRiskDashboard.mockResolvedValueOnce({
      materialRisks: [
        {
          materialCode: 'M-AL-6061',
          materialName: '铝合金 6061',
          available: 10,
          required: 100,
          riskDetail: '缺口 90，急单等待外协到货',
          affectedOrders: 'WO-RUSH-9001',
          level: 'critical',
        },
      ],
      equipmentRisks: [
        {
          id: 'eq-risk-cnc-01',
          equipmentName: 'CNC 加工中心 01',
          healthScore: 62,
          daysSinceMaintenance: 18,
          riskDetail: '主轴振动上升',
          level: 'warning',
        },
      ],
      orderRisks: [
        {
          orderNumber: 'WO-RUSH-9001',
          productName: '急单轴承组件',
          gapText: '距交期不足 24 小时',
          riskDetail: 'CNC 与装配窗口冲突',
          dueDate: '2026-06-02',
          level: 'critical',
        },
      ],
    })
    const wrapper = mountScheduleBoard({
      ScheduleEventQueuePanel: {
        props: {
          events: Array,
          activeSuggestion: Object,
        },
        template: `
          <div class="event-queue-stub">
            <article
              v-for="event in events"
              :key="event.id"
              class="event-card-probe"
              :data-type="event.type"
              :data-severity="event.severity"
            >
              <span class="event-title">{{ event.title }}</span>
              <span class="event-impact">{{ event.impact }}</span>
            </article>
          </div>
        `,
      },
    })
    await flushPromises()

    const events = wrapper.findAll('.event-card-probe')
    expect(events).toHaveLength(3)
    expect(events[0].attributes('data-type')).toBe('material')
    expect(events[0].attributes('data-severity')).toBe('critical')
    expect(events[0].text()).toContain('M-AL-6061 齐套缺口')
    expect(events[1].attributes('data-type')).toBe('equipment')
    expect(events[1].attributes('data-severity')).toBe('warning')
    expect(events[1].text()).toContain('CNC 加工中心 01 健康下降')
    expect(events[1].text()).toContain('健康 62 分')
    expect(events[2].attributes('data-type')).toBe('rush')
    expect(events[2].attributes('data-severity')).toBe('critical')
    expect(events[2].text()).toContain('WO-RUSH-9001 客户插单')
    expect(events[2].text()).toContain('距交期不足 24 小时')
  })

  it('generates an equipment-specific agent suggestion from a backend risk event', async () => {
    getRiskDashboard.mockResolvedValueOnce({
      materialRisks: [],
      equipmentRisks: [
        {
          id: 'eq-risk-cnc-01',
          equipmentName: 'CNC 加工中心 01',
          healthScore: 62,
          daysSinceMaintenance: 18,
          riskDetail: '主轴振动上升',
          level: 'warning',
        },
      ],
      orderRisks: [],
    })
    const wrapper = mountScheduleBoard({
      ScheduleEventQueuePanel: {
        props: {
          events: Array,
          activeSuggestion: Object,
        },
        emits: ['generate'],
        template: `
          <section class="event-queue-stub">
            <button type="button" class="generate-suggestion" @click="$emit('generate', events[0])">生成建议</button>
            <p class="suggestion-title">{{ activeSuggestion?.title ?? '' }}</p>
            <p class="suggestion-action">{{ activeSuggestion?.action ?? '' }}</p>
          </section>
        `,
      },
    })
    await flushPromises()

    await wrapper.get('.generate-suggestion').trigger('click')
    await flushPromises()

    expect(wrapper.get('.suggestion-title').text()).toContain('设备维护窗口重排建议')
    expect(wrapper.get('.suggestion-action').text()).toContain('CNC-002')
    expect(wrapper.get('.suggestion-action').text()).toContain('保护锁定期内任务不直接改动')
  })

  it('fails loud instead of generating a material suggestion when alternate-material evidence refresh fails', async () => {
    getRiskDashboard.mockResolvedValueOnce({
      materialRisks: [
        {
          materialCode: 'M-AL-6061',
          materialName: '铝合金 6061',
          available: 10,
          required: 100,
          riskDetail: '缺口 90，急单等待替代料放行',
          affectedOrders: 'WO-RUSH-9001',
          level: 'critical',
        },
      ],
      equipmentRisks: [],
      orderRisks: [],
    })
    const wrapper = mountScheduleBoard({
      ScheduleEventQueuePanel: {
        props: ['events', 'activeSuggestion'],
        emits: ['generate'],
        template: `
          <section class="event-queue-stub">
            <button type="button" class="generate-suggestion" @click="$emit('generate', events[0])">生成建议</button>
            <p class="suggestion-title">{{ activeSuggestion?.title ?? '' }}</p>
          </section>
        `,
      },
    })
    await flushPromises()
    readAlternateMaterialApprovalBackendFirst.mockClear()
    readAlternateMaterialApprovalBackendFirst.mockRejectedValueOnce(new Error('alternate material evidence unavailable'))

    await wrapper.get('.generate-suggestion').trigger('click')
    await flushPromises()

    expect(readAlternateMaterialApprovalBackendFirst).toHaveBeenCalledWith({ failLoud: true })
    expect(wrapper.get('[role="alert"]').text()).toContain('替代料证据刷新失败，未生成排产建议')
    expect(wrapper.get('[role="alert"]').text()).toContain('alternate material evidence unavailable')
    expect(wrapper.get('.suggestion-title').text()).toBe('')
  })

  it('falls back loudly when the schedule plan payload is not business data', async () => {
    getCurrentPlan.mockResolvedValueOnce('<!doctype html><html><body>SPA fallback</body></html>')

    const wrapper = mountScheduleBoard()
    await flushPromises()

    const status = wrapper.get('.warnings-bar')
    expect(status.attributes('role')).toBe('status')
    expect(status.attributes('aria-live')).toBe('polite')
    expect(status.text()).toContain('后端排产服务不可用')
    expect(status.text()).toContain('当前显示演示排产数据')
    expect(status.text()).toContain('后端排产计划载荷不完整')
  })

  it('falls back loudly when the equipment page payload is not business data', async () => {
    getEquipmentList.mockResolvedValueOnce('<!doctype html><html><body>SPA fallback</body></html>')

    const wrapper = mountScheduleBoard()
    await flushPromises()

    const status = wrapper.get('.warnings-bar')
    expect(status.attributes('role')).toBe('status')
    expect(status.attributes('aria-live')).toBe('polite')
    expect(status.text()).toContain('后端排产服务不可用')
    expect(status.text()).toContain('当前显示演示排产数据')
    expect(status.text()).toContain('后端设备列表载荷不完整')
  })

  it('falls back loudly when the schedule plan has no executable tasks', async () => {
    getCurrentPlan.mockResolvedValueOnce({
      ...makePlan(),
      id: 'empty-plan',
      planName: '空排产计划',
      items: [],
    })
    const wrapper = mountScheduleBoard({
      GanttChart: {
        props: {
          data: Object,
        },
        template: '<div class="gantt-chart-probe" :data-task-count="data?.tasks?.length ?? 0" />',
      },
    })
    await flushPromises()

    const status = wrapper.get('.warnings-bar')
    expect(status.attributes('role')).toBe('status')
    expect(status.attributes('aria-live')).toBe('polite')
    expect(status.text()).toContain('后端排产服务不可用')
    expect(status.text()).toContain('当前显示演示排产数据')
    expect(status.text()).toContain('后端排产计划缺少可执行任务')
    expect(Number(wrapper.get('.gantt-chart-probe').attributes('data-task-count'))).toBeGreaterThan(0)
  })

  it('keeps the plan visible and warns when bottleneck equipment lookup fails', async () => {
    getBottleneckEquipmentIds.mockRejectedValueOnce(new Error('bottleneck equipment API unavailable'))

    const wrapper = mountScheduleBoard()
    await flushPromises()

    const status = wrapper.get('.warnings-bar')
    expect(status.attributes('role')).toBe('status')
    expect(status.attributes('aria-live')).toBe('polite')
    expect(status.text()).toContain('瓶颈设备识别失败')
    expect(status.text()).toContain('bottleneck equipment API unavailable')
    expect(wrapper.find('[role="alert"]').exists()).toBe(false)
    expect(wrapper.find('gantt-chart-stub').exists()).toBe(true)
    expect(status.text()).not.toContain('当前显示演示排产数据')
  })

  it('clears a stale optimization error after a later optimization succeeds', async () => {
    optimizeSchedule
      .mockRejectedValueOnce(new Error('optimizer unavailable'))
      .mockResolvedValueOnce({
        plan: makePlan(),
        assignments: [],
        estimatedCompletionRate: 0.95,
        utilizationRate: 0.88,
        warnings: ['已生成新的可执行排产方案'],
      })
    const wrapper = mountScheduleBoard()
    await flushPromises()

    await wrapper.get('.optimize-button').trigger('click')
    await flushPromises()
    expect(wrapper.get('[role="alert"]').text()).toContain('optimizer unavailable')

    await wrapper.get('.optimize-button').trigger('click')
    await flushPromises()

    expect(wrapper.find('[role="alert"]').exists()).toBe(false)
    expect(wrapper.get('.warnings-bar').text()).toContain('已生成新的可执行排产方案')
  })

  it('keeps the order detail panel in a loading state while task detail is being fetched', async () => {
    getWorkOrderById.mockReturnValueOnce(new Promise(() => {}))
    const wrapper = mountScheduleBoard({
      GanttChart: {
        emits: ['task-click'],
        template: '<button type="button" class="task-bar" @click="$emit(\'task-click\', \'item-1\')">WO-001</button>',
      },
      OrderDetailPanel: OrderDetailPanelProbe,
    })
    await flushPromises()

    await wrapper.get('.task-bar').trigger('click')
    await flushPromises()

    const detail = wrapper.get('.order-detail-probe')
    expect(detail.attributes('data-visible')).toBe('true')
    expect(detail.attributes('data-loading')).toBe('true')
    expect(detail.attributes('data-explanation-work-order')).toBe('WO-001')
  })

  it('fails loud when task detail cannot be fetched from the backend', async () => {
    getWorkOrderById.mockRejectedValueOnce(new Error('work order API unavailable'))
    const wrapper = mountScheduleBoard({
      GanttChart: {
        emits: ['task-click'],
        template: '<button type="button" class="task-bar" @click="$emit(\'task-click\', \'item-1\')">WO-001</button>',
      },
      OrderDetailPanel: OrderDetailPanelProbe,
    })
    await flushPromises()

    await wrapper.get('.task-bar').trigger('click')
    await flushPromises()

    const detail = wrapper.get('.order-detail-probe')
    expect(detail.attributes('data-visible')).toBe('true')
    expect(detail.attributes('data-loading')).toBe('false')
    expect(detail.attributes('data-error')).toContain('工单详情加载失败')
    expect(detail.attributes('data-error')).toContain('work order API unavailable')
  })

  it('announces schedule feedback sync status as a polite update', async () => {
    submitAdoptionFeedback.mockResolvedValueOnce(undefined)
    const wrapper = mountScheduleBoard({
      ScheduleFeedbackPanel: false,
    })
    await flushPromises()

    await wrapper.get('.btn.accept').trigger('click')
    await flushPromises()

    const note = wrapper.get('.sync-note')
    expect(note.text()).toContain('反馈已同步后台')
    expect(note.attributes('role')).toBe('status')
    expect(note.attributes('aria-live')).toBe('polite')
  })

  it('includes the backend reason when schedule feedback sync fails', async () => {
    submitAdoptionFeedback.mockRejectedValueOnce(new Error('feedback API unavailable'))
    const wrapper = mountScheduleBoard({
      ScheduleFeedbackPanel: false,
    })
    await flushPromises()

    await wrapper.get('.btn.accept').trigger('click')
    await flushPromises()

    const note = wrapper.get('.sync-note')
    expect(note.text()).toContain('后台反馈接口不可用')
    expect(note.text()).toContain('feedback API unavailable')
    expect(note.attributes('role')).toBe('status')
    expect(note.attributes('aria-live')).toBe('polite')
  })

  it('keeps the closed assistant recovery suggestion visible when handoff refresh fails', async () => {
    const closedPackage = makeClosedAssistantRecoveryPackage()
    closeAssistantRecoveryPackage.mockReturnValueOnce(closedPackage)
    readAssistantRecoveryPackagesBackendFirst.mockRejectedValueOnce(new Error('assistant recovery refresh unavailable'))
    const wrapper = mountScheduleBoard({
      ScheduleFeedbackPanel: false,
      ScheduleRecoveryHandoffPanel: {
        emits: ['close-handoff'],
        template: '<button type="button" class="close-handoff" @click="$emit(\'close-handoff\', \'assistant-recovery-1\')">close</button>',
      },
      ScheduleEventQueuePanel: false,
    })
    await flushPromises()

    await wrapper.get('.close-handoff').trigger('click')
    await flushPromises()

    expect(closeAssistantRecoveryPackage).toHaveBeenCalledWith('assistant-recovery-1', '调度员 李工')
    expect(readAssistantRecoveryPackagesBackendFirst).toHaveBeenCalledWith({ failLoud: true })
    const note = wrapper.get('.sync-note')
    expect(note.attributes('role')).toBe('status')
    expect(note.attributes('aria-live')).toBe('polite')
    expect(note.text()).toContain('Assistant 恢复交接闭环刷新失败')
    expect(note.text()).toContain('assistant recovery refresh unavailable')
    const suggestion = wrapper.get('.agent-suggestion')
    expect(suggestion.text()).toContain('Assistant 恢复交接闭环复核建议')
    expect(suggestion.text()).toContain('TRACE-AST-RECOVERY-CLOSED-001')
  })

  it('keeps the closed assistant recovery package visible when backend refresh omits it', async () => {
    const closedPackage = makeClosedAssistantRecoveryPackage()
    closeAssistantRecoveryPackage.mockReturnValueOnce(closedPackage)
    readAssistantRecoveryPackagesBackendFirst.mockResolvedValueOnce([])
    const wrapper = mountScheduleBoard({
      ScheduleFeedbackPanel: false,
      ScheduleRecoveryHandoffPanel: {
        props: ['packages'],
        emits: ['close-handoff'],
        template: `
          <section class="handoff-probe">
            <button type="button" class="close-handoff" @click="$emit('close-handoff', 'assistant-recovery-1')">close</button>
            <span v-for="record in packages" :key="record.id" class="handoff-record">{{ record.id }} {{ record.closureTraceId }}</span>
          </section>
        `,
      },
      ScheduleEventQueuePanel: false,
    })
    await flushPromises()

    await wrapper.get('.close-handoff').trigger('click')
    await flushPromises()

    const note = wrapper.get('.sync-note')
    expect(note.text()).toContain('Assistant 恢复交接闭环刷新缺少刚闭环的执行包')
    expect(note.text()).toContain('assistant-recovery-1')
    expect(wrapper.get('.handoff-record').text()).toContain('assistant-recovery-1')
    expect(wrapper.get('.handoff-record').text()).toContain('TRACE-AST-RECOVERY-CLOSED-001')
  })

  it('fails loud when assistant recovery handoff closure cannot be persisted locally', async () => {
    closeAssistantRecoveryPackage.mockReturnValueOnce(null)
    const wrapper = mountScheduleBoard({
      ScheduleFeedbackPanel: false,
      ScheduleRecoveryHandoffPanel: {
        emits: ['close-handoff'],
        template: '<button type="button" class="close-handoff" @click="$emit(\'close-handoff\', \'missing-recovery-package\')">close</button>',
      },
      ScheduleEventQueuePanel: false,
    })
    await flushPromises()

    await wrapper.get('.close-handoff').trigger('click')
    await flushPromises()

    expect(closeAssistantRecoveryPackage).toHaveBeenCalledWith('missing-recovery-package', '调度员 李工')
    expect(readAssistantRecoveryPackagesBackendFirst).not.toHaveBeenCalledWith({ failLoud: true })
    const note = wrapper.get('.sync-note')
    expect(note.attributes('role')).toBe('status')
    expect(note.attributes('aria-live')).toBe('polite')
    expect(note.text()).toContain('Assistant 恢复交接闭环保存失败')
    expect(note.text()).toContain('missing-recovery-package')
  })

  it('keeps drag reschedule save failures visible after reloading the plan', async () => {
    rescheduleItem.mockRejectedValueOnce(new Error('reschedule API unavailable'))
    const wrapper = mountScheduleBoard({
      GanttChart: {
        emits: ['task-drag-end'],
        template: `
          <button
            type="button"
            class="drag-task"
            @click="$emit('task-drag-end', 'item-1', new Date('2026-06-01T09:00:00.000Z'), new Date('2026-06-01T13:00:00.000Z'))"
          >
            drag
          </button>
        `,
      },
    })
    await flushPromises()

    await wrapper.get('.drag-task').trigger('click')
    await flushPromises()

    expect(rescheduleItem).toHaveBeenCalledWith(
      'plan-1',
      'item-1',
      '2026-06-01T09:00:00.000Z',
      '2026-06-01T13:00:00.000Z',
    )
    const alert = wrapper.get('[role="alert"]')
    expect(alert.classes()).toContain('error-banner')
    expect(alert.text()).toContain('保存失败')
    expect(alert.text()).toContain('reschedule API unavailable')
  })

  it('fails loud when drag reschedule cannot write back without a schedule plan id', async () => {
    getCurrentPlan.mockResolvedValueOnce({
      ...makePlan(),
      id: '',
    })
    const wrapper = mountScheduleBoard({
      GanttChart: {
        emits: ['task-drag-end'],
        template: `
          <button
            type="button"
            class="drag-task"
            @click="$emit('task-drag-end', 'item-1', new Date('2026-06-01T09:00:00.000Z'), new Date('2026-06-01T13:00:00.000Z'))"
          >
            drag
          </button>
        `,
      },
    })
    await flushPromises()

    await wrapper.get('.drag-task').trigger('click')
    await flushPromises()

    expect(rescheduleItem).not.toHaveBeenCalled()
    const alert = wrapper.get('[role="alert"]')
    expect(alert.classes()).toContain('error-banner')
    expect(alert.text()).toContain('保存失败')
    expect(alert.text()).toContain('当前排产计划缺少 ID')
  })

  it('fails loud when drag reschedule cannot find a writable task', async () => {
    const wrapper = mountScheduleBoard({
      GanttChart: {
        emits: ['task-drag-end'],
        template: `
          <button
            type="button"
            class="drag-task"
            @click="$emit('task-drag-end', 'missing-item', new Date('2026-06-01T09:00:00.000Z'), new Date('2026-06-01T13:00:00.000Z'))"
          >
            drag
          </button>
        `,
      },
    })
    await flushPromises()

    await wrapper.get('.drag-task').trigger('click')
    await flushPromises()

    expect(rescheduleItem).not.toHaveBeenCalled()
    const alert = wrapper.get('[role="alert"]')
    expect(alert.classes()).toContain('error-banner')
    expect(alert.text()).toContain('保存失败')
    expect(alert.text()).toContain('未找到可写回的排产任务 missing-item')
  })
  it('announces batch objective feedback sync failures after applying a compared plan', async () => {
    submitAdoptionFeedback.mockRejectedValueOnce(new Error('batch feedback API unavailable'))
    optimizeSchedule.mockResolvedValueOnce({
      plan: makePlan(),
      assignments: [],
      estimatedCompletionRate: 0.94,
      utilizationRate: 0.87,
      warnings: ['综合平衡方案已应用'],
    })
    const wrapper = mountScheduleBoard({
      ScheduleFeedbackPanel: false,
      ParetoCompare: {
        emits: ['apply'],
        template: '<button type="button" class="apply-objective" @click="$emit(\'apply\', \'balanced\')">采用综合方案</button>',
      },
    })
    await flushPromises()

    await wrapper.get('.apply-objective').trigger('click')
    await flushPromises()

    expect(submitAdoptionFeedback).toHaveBeenCalledWith(expect.objectContaining({
      schedulePlanId: 'plan-1',
      workshopId: 'workshop-1',
      optimizationObjective: 'balanced',
      reasonCategory: 'batch_optimize_apply',
    }))
    const note = wrapper.get('.sync-note')
    expect(note.attributes('role')).toBe('status')
    expect(note.attributes('aria-live')).toBe('polite')
    expect(note.text()).toContain('批量方案采纳反馈同步失败')
    expect(note.text()).toContain('batch feedback API unavailable')
  })

  it('announces outsourcing schedule release failures after adopting an agent suggestion', async () => {
    const outsourcingCommitment = makeReceivedOutsourcingCommitment()
    readLatestOutsourcingCommitmentPackage.mockReturnValue(outsourcingCommitment)
    readLatestOutsourcingCommitmentPackageBackendFirst.mockResolvedValue(outsourcingCommitment)
    confirmOutsourcingScheduleRelease.mockImplementationOnce(() => {
      throw new Error('outsourcing release storage unavailable')
    })
    submitAdoptionFeedback.mockResolvedValueOnce(undefined)
    const wrapper = mountScheduleBoard({
      ScheduleFeedbackPanel: false,
      ScheduleEventQueuePanel: false,
    })
    await flushPromises()

    await wrapper.get('.event-card.resolved button').trigger('click')
    await flushPromises()
    await wrapper.get('.adopt-suggestion').trigger('click')
    await flushPromises()

    const note = wrapper.get('.sync-note')
    expect(note.attributes('role')).toBe('status')
    expect(note.attributes('aria-live')).toBe('polite')
    expect(note.text()).toContain('外协排产释放同步失败')
    expect(note.text()).toContain('outsourcing release storage unavailable')
  })

  it('archives outsourcing schedule release evidence after adopting the received commitment suggestion', async () => {
    const outsourcingCommitment = makeReceivedOutsourcingCommitment()
    const releasedCommitment = {
      ...outsourcingCommitment,
      statusLabel: '排产释放已确认',
      scheduleReleaseTraceId: 'TRACE-OUTSOURCING-FLANGE-SCHEDULE-RELEASE-20260521',
      scheduleReleaseAuditId: 'AUD-OUTSOURCING-SCHEDULE-RELEASE-FLANGE-20260521-001',
      scheduleReleaseMessage: '法兰组件外协到货已释放到排产窗口。',
    }
    readLatestOutsourcingCommitmentPackage.mockReturnValue(outsourcingCommitment)
    readLatestOutsourcingCommitmentPackageBackendFirst.mockResolvedValue(outsourcingCommitment)
    confirmOutsourcingScheduleRelease.mockReturnValueOnce(releasedCommitment)
    submitAdoptionFeedback.mockResolvedValueOnce(undefined)
    const wrapper = mountScheduleBoard({
      ScheduleFeedbackPanel: false,
      ScheduleEventQueuePanel: false,
    })
    await flushPromises()

    await wrapper.get('.event-card.resolved button').trigger('click')
    await flushPromises()
    await wrapper.get('.adopt-suggestion').trigger('click')
    await flushPromises()

    expect(confirmOutsourcingScheduleRelease).toHaveBeenCalledWith('product-flange', '调度员 李工')
    const suggestion = wrapper.get('.agent-suggestion')
    expect(suggestion.text()).toContain('外协排产释放已确认')
    expect(suggestion.text()).toContain('TRACE-OUTSOURCING-FLANGE-SCHEDULE-RELEASE-20260521')
    expect(suggestion.text()).toContain('AUD-OUTSOURCING-SCHEDULE-RELEASE-FLANGE-20260521-001')
    expect(suggestion.text()).toContain('OTD +2% 已释放归档')
    expect(suggestion.text()).toContain('延期 0 单外部等待')
  })

  it('keeps rush-order adoption separate from formal schedule execution', async () => {
    submitAdoptionFeedback.mockResolvedValueOnce(undefined)
    const wrapper = mountScheduleBoard({
      ScheduleFeedbackPanel: false,
      ScheduleEventQueuePanel: false,
    })
    await flushPromises()

    const rushEvent = wrapper.findAll('.event-card')
      .find(card => card.text().includes('WO-RUSH-9001 客户插单'))
    expect(rushEvent).toBeTruthy()
    await rushEvent!.get('button').trigger('click')
    await flushPromises()
    await wrapper.get('.adopt-suggestion').trigger('click')
    await flushPromises()

    const note = wrapper.get('.sync-note')
    expect(note.text()).toContain('反馈已同步后台')
    expect(note.text()).toContain('尚未写入正式排产计划')
    expect(note.text()).toContain('执行排产优化或拖拽保存')
  })

  it('marks rush-order adoption as formally saved after a successful optimization', async () => {
    submitAdoptionFeedback.mockResolvedValueOnce(undefined)
    optimizeSchedule.mockResolvedValueOnce({
      plan: {
        ...makePlan(),
        id: 'plan-optimized-after-rush',
        planName: '急单采纳后正式排产计划',
        onTimeDeliveryRate: 0.94,
      },
      assignments: [],
      estimatedCompletionRate: 0.95,
      utilizationRate: 0.88,
      warnings: ['急单采纳后正式计划已更新'],
    })
    const wrapper = mountScheduleBoard({
      ScheduleFeedbackPanel: false,
      ScheduleEventQueuePanel: false,
      ScheduleAgentWorkbenchPanel: {
        props: {
          latestFeedback: Object,
          formalScheduleWriteback: String,
        },
        template: `
          <section class="agent-workbench-probe" :data-writeback="formalScheduleWriteback">
            {{ latestFeedback?.reasonCategory ?? '' }}
          </section>
        `,
      },
    })
    await flushPromises()

    const rushEvent = wrapper.findAll('.event-card')
      .find(card => card.text().includes('WO-RUSH-9001 客户插单'))
    expect(rushEvent).toBeTruthy()
    await rushEvent!.get('button').trigger('click')
    await flushPromises()
    await wrapper.get('.adopt-suggestion').trigger('click')
    await flushPromises()
    expect(wrapper.get('.agent-workbench-probe').attributes('data-writeback')).toBe('pending')

    await wrapper.get('.optimize-button').trigger('click')
    await flushPromises()

    expect(optimizeSchedule).toHaveBeenCalled()
    expect(wrapper.get('.agent-workbench-probe').attributes('data-writeback')).toBe('saved')
  })

  it('marks rush-order adoption as formally saved after a successful drag reschedule', async () => {
    submitAdoptionFeedback.mockResolvedValueOnce(undefined)
    rescheduleItem.mockResolvedValueOnce(undefined)
    const wrapper = mountScheduleBoard({
      ScheduleFeedbackPanel: false,
      ScheduleEventQueuePanel: false,
      GanttChart: {
        props: ['data'],
        emits: ['task-drag-end'],
        methods: {
          formatWindowDate(value: Date | string | undefined) {
            return value instanceof Date ? value.toISOString() : value
          },
        },
        template: `
          <section>
            <button
              class="drag-save-task"
              @click="$emit('task-drag-end', 'item-1', new Date('2026-06-01T09:00:00.000Z'), new Date('2026-06-01T13:00:00.000Z'))"
            >
              drag save
            </button>
            <output class="drag-save-window">
              {{ formatWindowDate(data.tasks.find((task) => task.id === 'item-1')?.start_date) }}
              |
              {{ formatWindowDate(data.tasks.find((task) => task.id === 'item-1')?.end_date) }}
            </output>
          </section>
        `,
      },
      ScheduleAgentWorkbenchPanel: {
        props: {
          latestFeedback: Object,
          formalScheduleWriteback: String,
        },
        template: `
          <section class="agent-workbench-probe" :data-writeback="formalScheduleWriteback">
            {{ latestFeedback?.reasonCategory ?? '' }}
          </section>
        `,
      },
    })
    await flushPromises()

    const rushEvent = wrapper.findAll('.event-card')
      .find(card => card.text().includes('WO-RUSH-9001 客户插单'))
    expect(rushEvent).toBeTruthy()
    await rushEvent!.get('button').trigger('click')
    await flushPromises()
    await wrapper.get('.adopt-suggestion').trigger('click')
    await flushPromises()
    expect(wrapper.get('.agent-workbench-probe').attributes('data-writeback')).toBe('pending')

    await wrapper.get('.drag-save-task').trigger('click')
    await flushPromises()

    expect(rescheduleItem).toHaveBeenCalledWith(
      'plan-1',
      'item-1',
      '2026-06-01T09:00:00.000Z',
      '2026-06-01T13:00:00.000Z',
    )
    expect(wrapper.get('.agent-workbench-probe').attributes('data-writeback')).toBe('saved')
    expect(wrapper.get('.drag-save-window').text()).toContain('2026-06-01T09:00:00.000Z')
    expect(wrapper.get('.drag-save-window').text()).toContain('2026-06-01T13:00:00.000Z')
  })

})
