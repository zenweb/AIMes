import { flushPromises, mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import ScheduleBoard from '../../src/components/schedule/ScheduleBoard.vue'
import { OfflineDemoApiError } from '../../src/utils/offline-demo-mode'

const getCurrentPlan = vi.hoisted(() => vi.fn())
const getEquipmentList = vi.hoisted(() => vi.fn())
const getWorkOrderById = vi.hoisted(() => vi.fn())
const optimizeSchedule = vi.hoisted(() => vi.fn())
const rescheduleItem = vi.hoisted(() => vi.fn())
const submitAdoptionFeedback = vi.hoisted(() => vi.fn())
const getLatestAdoptionFeedback = vi.hoisted(() => vi.fn())
const getBottleneckEquipmentIds = vi.hoisted(() => vi.fn())
const getRiskDashboard = vi.hoisted(() => vi.fn())
const confirmOutsourcingScheduleRelease = vi.hoisted(() => vi.fn())
const readLatestOutsourcingCommitmentPackage = vi.hoisted(() => vi.fn())
const readLatestOutsourcingCommitmentPackageBackendFirst = vi.hoisted(() => vi.fn())
const writeScheduleFeedbackSnapshot = vi.hoisted(() => vi.fn())
const readScheduleFeedbackSnapshot = vi.hoisted(() => vi.fn())
const readAlternateMaterialApproval = vi.hoisted(() => vi.fn())
const readAlternateMaterialApprovalBackendFirst = vi.hoisted(() => vi.fn())
const readEngineeringChangeImpactAnalysis = vi.hoisted(() => vi.fn())
const readEngineeringChangeImpactAnalysisBackendFirst = vi.hoisted(() => vi.fn())
const readRouteCapabilityValidation = vi.hoisted(() => vi.fn())
const readRouteCapabilityValidationBackendFirst = vi.hoisted(() => vi.fn())
const readAssistantEngineeringConstraintPackagesBackendFirst = vi.hoisted(() => vi.fn())
const readQualityMrbDispositionRecord = vi.hoisted(() => vi.fn())
const readQualityMrbDispositionRecordBackendFirst = vi.hoisted(() => vi.fn())
const closeAssistantRecoveryPackage = vi.hoisted(() => vi.fn())
const readAssistantRecoveryPackagesBackendFirst = vi.hoisted(() => vi.fn(async () => []))
const readRiskSlaReviewRecordBackendFirst = vi.hoisted(() => vi.fn())
const readRiskSlaReviewRecord = vi.hoisted(() => vi.fn())
const readLaborQualificationBlock = vi.hoisted(() => vi.fn())
const readLaborQualificationBlocksBackendFirst = vi.hoisted(() => vi.fn())
const readLaborReassignment = vi.hoisted(() => vi.fn())
const readLaborReassignmentsBackendFirst = vi.hoisted(() => vi.fn())
const readOtdEvidenceChainRecords = vi.hoisted(() => vi.fn())
const readMonitoringSituationEscalations = vi.hoisted(() => vi.fn())
const readMonitoringSituationEscalationsBackendFirst = vi.hoisted(() => vi.fn())
const readSupplyRiskEscalation = vi.hoisted(() => vi.fn())
const readSupplyRiskEscalationBackendFirst = vi.hoisted(() => vi.fn())
const readLatestOtdKpiCommitmentPackage = vi.hoisted(() => vi.fn())
const readLatestOtdKpiCommitmentPackageBackendFirst = vi.hoisted(() => vi.fn())
const csvFilename = vi.hoisted(() => vi.fn((name: string) => `${name}.csv`))
const downloadCsv = vi.hoisted(() => vi.fn())

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
    csvFilename,
    downloadCsv,
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
  readSupplyRiskEscalation,
  readSupplyRiskEscalationBackendFirst,
}))

vi.mock('../../src/utils/quality-rework-sync', () => ({
  readQualityReworkImpactBackendFirst: emptyAsyncRecordMock(),
}))

vi.mock('../../src/utils/quality-mrb-disposition-sync', () => ({
  readQualityMrbDispositionRecord,
  readQualityMrbDispositionRecordBackendFirst,
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
  writeScheduleFeedbackSnapshot,
}))

vi.mock('../../src/utils/engineering-change-sync', () => ({
  readAlternateMaterialApproval,
  readAlternateMaterialApprovalBackendFirst,
  readEngineeringChangeImpactAnalysis,
  readEngineeringChangeImpactAnalysisBackendFirst,
  readRouteCapabilityValidation,
  readRouteCapabilityValidationBackendFirst,
}))

vi.mock('../../src/utils/outsourcing-commitment-sync', () => ({
  confirmOutsourcingScheduleRelease,
  readLatestOutsourcingCommitmentPackage,
  readLatestOutsourcingCommitmentPackageBackendFirst,
}))

vi.mock('../../src/utils/otd-kpi-commitment-sync', () => ({
  readLatestOtdKpiCommitmentPackage,
  readLatestOtdKpiCommitmentPackageBackendFirst,
}))

vi.mock('../../src/utils/otd-evidence-chain-sync', () => ({
  readOtdEvidenceChainRecords,
}))

vi.mock('../../src/utils/assistant-action-package-sync', () => ({
  closeAssistantRecoveryPackage,
  readAssistantRecoveryPackages: vi.fn(() => []),
  readAssistantRecoveryPackagesBackendFirst,
}))

vi.mock('../../src/utils/assistant-engineering-constraint-package-sync', () => ({
  readAssistantEngineeringConstraintPackagesBackendFirst,
}))

vi.mock('../../src/utils/monitoring-situation-escalation-sync', () => ({
  readMonitoringSituationEscalations,
  readMonitoringSituationEscalationsBackendFirst,
}))

vi.mock('../../src/utils/poc-pilot-run-sync', () => ({
  readPocPilotRunRecordBackendFirst: emptyAsyncRecordMock(),
}))

vi.mock('../../src/utils/risk-sla-review-sync', () => ({
  readRiskSlaReviewRecord,
  readRiskSlaReviewRecordBackendFirst,
}))

vi.mock('../../src/utils/labor-assignment-sync', () => ({
  readLaborQualificationBlock,
  readLaborQualificationBlocksBackendFirst,
  readLaborReassignment,
  readLaborReassignmentsBackendFirst,
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

function makeOtdKpiCommitment() {
  return {
    id: 'otd-kpi-commitment-east-customer',
    sourceKpiId: 'east-customer',
    dimensionLabel: '客户群',
    targetName: '华东新能源客户',
    title: '华东新能源客户交付恢复承诺',
    auditId: 'AUD-OTD-KPI-EAST-CUSTOMER-20260616',
    traceId: 'TRACE-OTD-KPI-EAST-CUSTOMER-20260616',
    actor: '调度员 李工',
    baselineOtd: 82,
    agentOtd: 94,
    lift: 12,
    delayedReduced: 3,
    statusLabel: '客户承诺已生成',
    commitment: '华东新能源客户交付恢复口径已生成。',
    owner: '计划 / 生产 / 质量联合确认',
    dueAt: '2026-06-18',
    summary: '承诺口径包含急单插入、缺料闭环、CNC 瓶颈保护和质量门保留。',
    actions: [
      {
        module: 'AI 排产',
        owner: '调度主管',
        action: '复核锁定期后急单插入窗口',
        evidence: 'TRACE-OTD-KPI-SCHEDULE-REVIEW-20260616',
      },
      {
        module: '质量门',
        owner: '质量主管',
        action: '确认质量冻结与复检边界',
        evidence: 'TRACE-OTD-KPI-QUALITY-GATE-20260616',
      },
    ],
  }
}

function makeRiskSlaReviewRecord() {
  return {
    id: 'risk-sla-review-20260615',
    title: '风险 SLA 逾期晨会复核包',
    status: 'closed',
    statusLabel: '晨会责任动作已闭环',
    reviewMeetingId: 'RISK-DAILY-20260615-001',
    owner: '生产经理 / 调度主管 / 采购主管 / 设备主管',
    overdueCount: 2,
    criticalCount: 3,
    affectedOrders: 'WO-2026-0042 / WO-RUSH-9001 / AL-6061',
    otdImpact: '+6% OTD 恢复动作已锁定，-2 单延期风险转入日终复盘',
    auditId: 'AUD-RISK-SLA-REVIEW-20260615',
    traceId: 'TRACE-RISK-SLA-DAILY-REVIEW-20260615',
    createdAt: '2026-06-15T08:30:00.000Z',
    summary: '风险处置队列把逾期、关键缺料和瓶颈设备风险升级为晨会复核包。',
    closedAt: '2026-06-15T10:30:00.000Z',
    closureAuditId: 'AUD-RISK-SLA-CLOSURE-20260615',
    closureTraceId: 'TRACE-RISK-SLA-DAILY-REVIEW-CLOSED-20260615',
    closureSummary: '生产经理已确认 4 项责任动作全部闭环，未关闭项转入日终复盘跟踪。',
    risks: [{
      id: 'risk-shortage-al6061',
      type: '缺料',
      title: 'AL-6061 今日短缺',
      owner: '采购主管',
      dueAt: '立即',
      workOrders: 'WO-2026-0042 / WO-RUSH-9001',
      deliveryImpact: '预计影响 2 单',
      statusLabel: '已升级',
      slaStatus: 'overdue',
      requiredAction: '确认替代料和加急到货承诺。',
    }],
    actions: [
      {
        module: 'AI 排产',
        owner: '调度主管',
        dueAt: '今日 10:30',
        action: '生成锁定期后排产保护建议，优先保护 WO-2026-0042 与急单窗口。',
        evidence: 'TRACE-RISK-SLA-SCHEDULE-REVIEW-20260615',
        result: '已锁定 WO-2026-0042 / WO-RUSH-9001 承诺窗口。',
      },
      {
        module: '采购协同',
        owner: '采购主管',
        dueAt: '今日 11:00',
        action: '确认 AL-6061 替代承诺或加急到货窗口。',
        evidence: 'TRACE-RISK-SLA-PURCHASE-COMMIT-20260615',
        result: 'AL-6061 替代承诺已确认。',
      },
    ],
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
    readAlternateMaterialApproval.mockReset()
    readAlternateMaterialApproval.mockReturnValue(null)
    readEngineeringChangeImpactAnalysisBackendFirst.mockReset()
    readEngineeringChangeImpactAnalysisBackendFirst.mockResolvedValue(null)
    readEngineeringChangeImpactAnalysis.mockReset()
    readEngineeringChangeImpactAnalysis.mockReturnValue(null)
    readRouteCapabilityValidationBackendFirst.mockReset()
    readRouteCapabilityValidationBackendFirst.mockResolvedValue(null)
    readRouteCapabilityValidation.mockReset()
    readRouteCapabilityValidation.mockReturnValue(null)
    readAssistantEngineeringConstraintPackagesBackendFirst.mockReset()
    readAssistantEngineeringConstraintPackagesBackendFirst.mockResolvedValue([])
    readQualityMrbDispositionRecord.mockReset()
    readQualityMrbDispositionRecord.mockReturnValue(null)
    readQualityMrbDispositionRecordBackendFirst.mockReset()
    readQualityMrbDispositionRecordBackendFirst.mockResolvedValue(null)
    closeAssistantRecoveryPackage.mockReset()
    closeAssistantRecoveryPackage.mockReturnValue(null)
    readAssistantRecoveryPackagesBackendFirst.mockReset()
    readAssistantRecoveryPackagesBackendFirst.mockResolvedValue([])
    readRiskSlaReviewRecord.mockReset()
    readRiskSlaReviewRecord.mockReturnValue(null)
    readRiskSlaReviewRecordBackendFirst.mockReset()
    readRiskSlaReviewRecordBackendFirst.mockResolvedValue(null)
    readLaborQualificationBlock.mockReset()
    readLaborQualificationBlock.mockReturnValue(null)
    readLaborQualificationBlocksBackendFirst.mockReset()
    readLaborQualificationBlocksBackendFirst.mockResolvedValue([])
    readLaborReassignment.mockReset()
    readLaborReassignment.mockReturnValue(null)
    readLaborReassignmentsBackendFirst.mockReset()
    readLaborReassignmentsBackendFirst.mockResolvedValue([])
    readOtdEvidenceChainRecords.mockReset()
    readOtdEvidenceChainRecords.mockReturnValue([])
    readMonitoringSituationEscalations.mockReset()
    readMonitoringSituationEscalations.mockReturnValue([])
    readMonitoringSituationEscalationsBackendFirst.mockReset()
    readMonitoringSituationEscalationsBackendFirst.mockResolvedValue([])
    readSupplyRiskEscalation.mockReset()
    readSupplyRiskEscalation.mockReturnValue(null)
    readSupplyRiskEscalationBackendFirst.mockReset()
    readSupplyRiskEscalationBackendFirst.mockResolvedValue(null)
    readLatestOtdKpiCommitmentPackage.mockReset()
    readLatestOtdKpiCommitmentPackage.mockReturnValue(null)
    readLatestOtdKpiCommitmentPackageBackendFirst.mockReset()
    readLatestOtdKpiCommitmentPackageBackendFirst.mockResolvedValue(null)
    csvFilename.mockClear()
    downloadCsv.mockClear()
    optimizeSchedule.mockReset()
    rescheduleItem.mockReset()
    getWorkOrderById.mockReset()
    submitAdoptionFeedback.mockReset()
    getLatestAdoptionFeedback.mockReset()
    getLatestAdoptionFeedback.mockResolvedValue(null)
    readScheduleFeedbackSnapshot.mockReset()
    readScheduleFeedbackSnapshot.mockReturnValue(null)
    writeScheduleFeedbackSnapshot.mockReset()
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        baseline: { otd: 0.2667, delayed: 22, changeoverMinutes: 2040 },
        agent: { otd: 0.3, delayed: 21, changeoverMinutes: 2040 },
        delta: { otd: 0.0333, delayedOrdersReduced: 1, changeoverMinutesReduced: 0 },
      }),
    }))
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

  it('restores the local batch adoption feedback snapshot after reloading the schedule page', async () => {
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
      ScheduleFeedbackPanel: false,
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
      ScheduleFeedbackPanel: false,
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
      ScheduleFeedbackPanel: false,
    })
    await flushPromises()

    const record = wrapper.get('.feedback-record')
    expect(record.text()).toContain('已采纳批量对比方案')
    expect(record.text()).toContain('批量对比采纳')
    expect(record.text()).toContain('综合平衡')
    expect(record.text()).toContain('从批量对比中选择此方案')
    expect(record.text()).not.toContain('后端正式采纳')

    const note = wrapper.get('.sync-note')
    expect(note.attributes('role')).toBe('status')
    expect(note.attributes('aria-live')).toBe('polite')
    expect(note.text()).toContain('后端最新采纳反馈不可审计')
    expect(note.text()).toContain('缺少原因说明')
    expect(note.text()).toContain('已回退本地最近反馈')
  })

  it('continues loading the schedule plan when latest feedback restore fails', async () => {
    getLatestAdoptionFeedback.mockRejectedValueOnce(new Error('latest feedback API unavailable'))

    const wrapper = mountScheduleBoard({
      ScheduleFeedbackPanel: false,
    })
    await flushPromises()

    expect(getCurrentPlan).toHaveBeenCalled()
    expect(wrapper.text()).toContain('OTD 预测90%')
    const note = wrapper.get('.sync-note')
    expect(note.text()).toContain('后端最新采纳反馈读取失败')
    expect(note.text()).toContain('latest feedback API unavailable')
  })

  it('quietly keeps loading the schedule plan when offline demo skips latest feedback restore', async () => {
    getLatestAdoptionFeedback.mockRejectedValueOnce(new OfflineDemoApiError('/api/v1/scheduling/adoption-feedback/latest'))

    const wrapper = mountScheduleBoard({
      ScheduleFeedbackPanel: false,
    })
    await flushPromises()

    expect(getCurrentPlan).toHaveBeenCalled()
    expect(wrapper.text()).toContain('OTD 预测90%')
    expect(wrapper.find('.sync-note').exists()).toBe(false)
    expect(wrapper.text()).not.toContain('后端最新采纳反馈读取失败')
    expect(wrapper.text()).not.toContain('Offline demo mode skipped backend request')
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

  it('fails loud when optimization succeeds without a schedule plan', async () => {
    optimizeSchedule.mockResolvedValueOnce({
      assignments: [],
      estimatedCompletionRate: 0.92,
      utilizationRate: 0.86,
      warnings: ['optimizer returned no plan'],
    })
    const wrapper = mountScheduleBoard()
    await flushPromises()

    await wrapper.get('.optimize-button').trigger('click')
    await flushPromises()

    const alert = wrapper.get('[role="alert"]')
    expect(alert.classes()).toContain('error-banner')
    expect(alert.text()).toContain('优化失败')
    expect(alert.text()).toContain('后端优化结果缺少排产计划')
    expect(wrapper.text()).toContain('OTD 预测90%')
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

  it('keeps the schedule plan usable when startup engineering constraint sync fails', async () => {
    readEngineeringChangeImpactAnalysisBackendFirst.mockRejectedValueOnce(new Error('engineering startup evidence unavailable'))

    const wrapper = mountScheduleBoard()
    await flushPromises()

    expect(getCurrentPlan).toHaveBeenCalled()
    expect(wrapper.text()).toContain('OTD 预测90%')
    const status = wrapper.get('.warnings-bar')
    expect(status.text()).toContain('工程约束启动证据加载失败')
    expect(status.text()).toContain('engineering startup evidence unavailable')
    expect(readAlternateMaterialApprovalBackendFirst).toHaveBeenCalledWith({ failLoud: true })
    expect(readEngineeringChangeImpactAnalysisBackendFirst).toHaveBeenCalledWith({ failLoud: true })
  })

  it('fails loud instead of using stale local alternate material evidence when generating a material suggestion', async () => {
    readAlternateMaterialApprovalBackendFirst.mockRejectedValueOnce(new Error('alternate startup evidence unavailable'))
    readEngineeringChangeImpactAnalysisBackendFirst.mockRejectedValueOnce(new Error('engineering startup evidence unavailable'))
    readAlternateMaterialApproval.mockReturnValue({
      id: 'alt-mat-stale-local',
      bomCode: 'BOM-A100',
      bomVersion: 'V1.0',
      sourceMaterialCode: 'M-AL-6061',
      alternateMaterialCode: 'M-AL-6061B',
      alternateMaterialName: '铝合金 6061B',
      affectedOrders: 'WO-RUSH-9001 / WO-DEMO-1002',
      approvedBy: '工程师 / EMP-004',
      approvedAt: '2026-06-01T08:00:00.000Z',
      auditId: 'AUD-ENG-ALT-STALE-LOCAL',
      traceId: 'TRACE-ENG-ALT-STALE-LOCAL',
      status: 'approved',
      summary: '本地旧替代料证据',
    })
    const wrapper = mountScheduleBoard({
      ScheduleFeedbackPanel: false,
      ScheduleEventQueuePanel: false,
    })
    await flushPromises()

    const materialEvent = wrapper.findAll('.event-card')
      .find(card => card.text().includes('M-AL-6061 齐套缺口'))
    expect(materialEvent).toBeTruthy()

    readAlternateMaterialApprovalBackendFirst.mockRejectedValueOnce(new Error('alternate approval readback unavailable'))
    await materialEvent!.get('button').trigger('click')
    await flushPromises()

    expect(readAlternateMaterialApprovalBackendFirst).toHaveBeenCalledWith({ failLoud: true })
    expect(wrapper.get('.agent-suggestion').text()).toContain('等待事件评估')
    const alert = wrapper.get('[role="alert"]')
    expect(alert.text()).toContain('替代料证据刷新失败')
    expect(alert.text()).toContain('alternate approval readback unavailable')
    expect(wrapper.text()).not.toContain('AUD-ENG-ALT-STALE-LOCAL')
  })

  it('fails loud when alternate material readback has no backend evidence for a material suggestion', async () => {
    const wrapper = mountScheduleBoard({
      ScheduleFeedbackPanel: false,
      ScheduleEventQueuePanel: false,
    })
    await flushPromises()

    const materialEvent = wrapper.findAll('.event-card')
      .find(card => card.text().includes('M-AL-6061 齐套缺口'))
    expect(materialEvent).toBeTruthy()

    await materialEvent!.get('button').trigger('click')
    await flushPromises()

    expect(readAlternateMaterialApprovalBackendFirst).toHaveBeenCalledWith({ failLoud: true })
    expect(wrapper.get('.agent-suggestion').text()).toContain('等待事件评估')
    expect(wrapper.get('.agent-suggestion').text()).not.toContain('缺料约束重排建议')
    const alert = wrapper.get('[role="alert"]')
    expect(alert.text()).toContain('替代料证据刷新失败')
    expect(alert.text()).toContain('后端未返回替代料放行证据')
  })

  it('keeps the schedule plan usable when assistant engineering package loading fails', async () => {
    readAssistantEngineeringConstraintPackagesBackendFirst.mockRejectedValueOnce(new Error('assistant engineering package unavailable'))

    const wrapper = mountScheduleBoard()
    await flushPromises()

    expect(getCurrentPlan).toHaveBeenCalled()
    expect(wrapper.text()).toContain('OTD 预测90%')
    const status = wrapper.get('.warnings-bar')
    expect(status.text()).toContain('工程约束启动证据加载失败')
    expect(status.text()).toContain('Assistant 工程约束包')
    expect(status.text()).toContain('assistant engineering package unavailable')
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

  it('quietly shows the demo schedule when offline demo skips current plan loading', async () => {
    getCurrentPlan.mockRejectedValueOnce(new OfflineDemoApiError('/api/v1/scheduling/current'))

    const wrapper = mountScheduleBoard()
    await flushPromises()

    expect(wrapper.text()).toContain('OTD 预测')
    expect(wrapper.find('[role="alert"]').exists()).toBe(false)
    expect(wrapper.text()).not.toContain('后端排产服务不可用')
    expect(wrapper.text()).not.toContain('Offline demo mode skipped backend request')
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
    submitAdoptionFeedback.mockResolvedValueOnce(undefined)
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
        emits: ['generate', 'adopt'],
        template: `
          <section class="event-queue-stub">
            <button type="button" class="generate-suggestion" @click="$emit('generate', events[0])">生成建议</button>
            <button
              type="button"
              class="accept-suggestion"
              @click="$emit('adopt', activeSuggestion)"
            >
              采纳建议
            </button>
            <p class="suggestion-title">{{ activeSuggestion?.title ?? '' }}</p>
            <p class="suggestion-action">{{ activeSuggestion?.action ?? '' }}</p>
            <p class="suggestion-recommended">{{ activeSuggestion?.recommendedScenarioName ?? '' }}</p>
            <p class="suggestion-rationale">{{ activeSuggestion?.decisionRationale ?? '' }}</p>
            <ul class="suggestion-scenarios">
              <li v-for="scenario in activeSuggestion?.scenarioOptions ?? []" :key="scenario.id">
                {{ scenario.name }} / {{ scenario.otdImpact }} / {{ scenario.delayImpact }} / {{ scenario.changeoverImpact }} / {{ scenario.rationale }}
              </li>
            </ul>
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
    expect(wrapper.get('.suggestion-recommended').text()).toContain('夜班维护 + CNC-003 分流')
    expect(wrapper.get('.suggestion-rationale').text()).toContain('设备故障事件')
    expect(wrapper.findAll('.suggestion-scenarios li')).toHaveLength(3)
    expect(wrapper.text()).toContain('立即停机维护')
    expect(wrapper.text()).toContain('外协临时分流')

    await wrapper.get('.accept-suggestion').trigger('click')
    await flushPromises()

    expect(writeScheduleFeedbackSnapshot).toHaveBeenCalledWith(expect.objectContaining({
      decision: 'accepted',
      reasonCategory: 'equipment_event_agent',
      reasonDetail: expect.stringContaining('推荐方案：夜班维护 + CNC-003 分流'),
    }))
    expect(writeScheduleFeedbackSnapshot).toHaveBeenCalledWith(expect.objectContaining({
      reasonDetail: expect.stringContaining('未选方案：立即停机维护'),
    }))
    expect(writeScheduleFeedbackSnapshot).toHaveBeenCalledWith(expect.objectContaining({
      reasonDetail: expect.stringContaining('外协临时分流'),
    }))
    expect(submitAdoptionFeedback).toHaveBeenCalledWith(expect.objectContaining({
      reasonCategory: 'accepted_equipment_event_agent',
      reasonDetail: expect.stringContaining('决策依据：推荐 夜班维护 + CNC-003 分流'),
    }))
  })

  it('persists material shortage agent adoption with alternate-material decision context', async () => {
    submitAdoptionFeedback.mockResolvedValueOnce(undefined)
    readAlternateMaterialApprovalBackendFirst.mockResolvedValue({
      id: 'alt-mat-approval-bom-a100-al6061b',
      bomCode: 'BOM-A100',
      bomVersion: 'V1.0',
      sourceMaterialCode: 'M-AL-6061',
      alternateMaterialCode: 'M-AL-6061B',
      alternateMaterialName: '铝合金 6061B',
      affectedOrders: 'WO-RUSH-9001 / WO-DEMO-1002',
      approvedBy: '工程师 / EMP-004',
      approvedAt: '2026-06-01T08:00:00.000Z',
      auditId: 'AUD-ENG-ALT-20260601-001',
      traceId: 'TRACE-ENG-ALT-BOM-A100-M-AL-6061B',
      status: 'approved',
      summary: '替代料 M-AL-6061B 已完成工程确认，可释放 M-AL-6061 缺料导致的 CNC 后段冻结约束。',
    })
    getRiskDashboard.mockResolvedValueOnce({
      materialRisks: [
        {
          materialCode: 'M-AL-6061',
          materialName: '铝合金 6061',
          available: 8,
          required: 40,
          riskDetail: '急单与 WO-DEMO-1002 共用铝合金 6061',
          affectedOrders: 'WO-RUSH-9001 / WO-DEMO-1002',
          level: 'critical',
        },
      ],
      equipmentRisks: [],
      orderRisks: [],
    })
    const wrapper = mountScheduleBoard({
      ScheduleEventQueuePanel: {
        props: {
          events: Array,
          activeSuggestion: Object,
        },
        emits: ['generate', 'adopt'],
        template: `
          <section class="event-queue-stub">
            <button type="button" class="generate-material-suggestion" @click="$emit('generate', events[0])">
              生成缺料建议
            </button>
            <button
              type="button"
              class="accept-material-suggestion"
              @click="$emit('adopt', activeSuggestion)"
            >
              采纳缺料建议
            </button>
            <p class="suggestion-title">{{ activeSuggestion?.title ?? '' }}</p>
            <p class="suggestion-action">{{ activeSuggestion?.action ?? '' }}</p>
          </section>
        `,
      },
    })
    await flushPromises()

    await wrapper.get('.generate-material-suggestion').trigger('click')
    await flushPromises()

    expect(readAlternateMaterialApprovalBackendFirst).toHaveBeenCalledWith({ failLoud: true })
    expect(wrapper.get('.suggestion-title').text()).toContain('替代料已放行后的缺料复核')
    expect(wrapper.get('.suggestion-action').text()).toContain('AUD-ENG-ALT-20260601-001')
    expect(wrapper.get('.suggestion-action').text()).toContain('M-AL-6061B 可替代 M-AL-6061')

    await wrapper.get('.accept-material-suggestion').trigger('click')
    await flushPromises()

    expect(writeScheduleFeedbackSnapshot).toHaveBeenCalledWith(expect.objectContaining({
      decision: 'accepted',
      reasonCategory: 'material_event_agent',
      reasonDetail: expect.stringContaining('替代料已放行后的缺料复核'),
    }))
    expect(writeScheduleFeedbackSnapshot).toHaveBeenCalledWith(expect.objectContaining({
      reasonDetail: expect.stringContaining('AUD-ENG-ALT-20260601-001'),
    }))
    expect(submitAdoptionFeedback).toHaveBeenCalledWith(expect.objectContaining({
      reasonCategory: 'accepted_material_event_agent',
      reasonDetail: expect.stringContaining('M-AL-6061B 可替代 M-AL-6061'),
    }))
  })

  it('persists route capability blocking adoption with validated engineering evidence', async () => {
    submitAdoptionFeedback.mockResolvedValueOnce(undefined)
    readRouteCapabilityValidationBackendFirst.mockResolvedValue({
      id: 'route-capability-ht-001',
      routeCode: 'R-HT-9001',
      routeVersion: 'v3',
      routeName: '热处理能力路线',
      operationCode: 'OP-090',
      operationName: '热处理',
      bottleneckResource: 'HT-01',
      candidateEquipment: 'HT-02',
      affectedOrders: 'WO-RUSH-9001 / WO-DEMO-1002',
      capacityGapHours: 6,
      changeoverMinutes: 18,
      batchWindow: '2026-06-02 夜班',
      decision: 'validated',
      validatedBy: '工艺工程师 周工',
      validatedAt: '2026-06-01T10:00:00.000Z',
      auditId: 'AUD-ROUTE-CAPABILITY-HT-001',
      traceId: 'TRACE-ROUTE-CAPABILITY-HT-001',
      statusLabel: '能力缺口已校验',
      summary: '热处理瓶颈资源存在 6h 能力缺口，需确认分流或外协。',
    })
    const wrapper = mountScheduleBoard({
      ScheduleEventQueuePanel: {
        props: {
          events: Array,
          activeSuggestion: Object,
        },
        emits: ['generate', 'adopt'],
        template: `
          <section class="event-queue-stub">
            <article
              v-for="event in events.filter((item) => item.type === 'route')"
              :key="event.id"
              class="route-event-probe"
            >
              <p class="route-event-title">{{ event.title }}</p>
              <p class="route-event-impact">{{ event.impact }}</p>
              <button type="button" class="generate-route-suggestion" @click="$emit('generate', event)">
                生成工艺建议
              </button>
            </article>
            <button
              type="button"
              class="accept-route-suggestion"
              @click="$emit('adopt', activeSuggestion)"
            >
              采纳工艺建议
            </button>
            <p class="suggestion-title">{{ activeSuggestion?.title ?? '' }}</p>
            <p class="suggestion-action">{{ activeSuggestion?.action ?? '' }}</p>
          </section>
        `,
      },
    })
    await flushPromises()

    expect(wrapper.get('.route-event-title').text()).toContain('R-HT-9001 OP-090 热处理能力缺口')
    expect(wrapper.get('.route-event-impact').text()).toContain('HT-01 存在 6h 缺口')
    expect(readRouteCapabilityValidationBackendFirst).toHaveBeenCalledWith({ failLoud: true })

    await wrapper.get('.generate-route-suggestion').trigger('click')
    await flushPromises()

    expect(wrapper.get('.suggestion-title').text()).toContain('热处理能力缺口阻断建议')
    expect(wrapper.get('.suggestion-action').text()).toContain('AUD-ROUTE-CAPABILITY-HT-001')
    expect(wrapper.get('.suggestion-action').text()).toContain('等待工艺/制造确认分流或外协兜底')

    await wrapper.get('.accept-route-suggestion').trigger('click')
    await flushPromises()

    expect(writeScheduleFeedbackSnapshot).toHaveBeenCalledWith(expect.objectContaining({
      decision: 'accepted',
      reasonCategory: 'route_event_agent',
      reasonDetail: expect.stringContaining('热处理能力缺口阻断建议'),
    }))
    expect(writeScheduleFeedbackSnapshot).toHaveBeenCalledWith(expect.objectContaining({
      reasonDetail: expect.stringContaining('AUD-ROUTE-CAPABILITY-HT-001'),
    }))
    expect(submitAdoptionFeedback).toHaveBeenCalledWith(expect.objectContaining({
      reasonCategory: 'accepted_route_event_agent',
      reasonDetail: expect.stringContaining('等待工艺/制造确认分流或外协兜底'),
    }))
    expect(readRouteCapabilityValidationBackendFirst).toHaveBeenCalledWith({ failLoud: true })
  })

  it('persists route capability release adoption with batch-window evidence', async () => {
    submitAdoptionFeedback.mockResolvedValueOnce(undefined)
    readRouteCapabilityValidationBackendFirst.mockResolvedValue({
      id: 'route-capability-ht-release-001',
      routeCode: 'R-HT-9001',
      routeVersion: 'v3',
      routeName: '热处理能力路线',
      operationCode: 'OP-090',
      operationName: '热处理',
      bottleneckResource: 'HT-01',
      candidateEquipment: 'HT-02',
      affectedOrders: 'WO-RUSH-9001 / WO-DEMO-1002',
      capacityGapHours: 6,
      changeoverMinutes: 18,
      batchWindow: '2026-06-02 夜班',
      decision: 'released',
      validatedBy: '工艺工程师 周工',
      validatedAt: '2026-06-01T10:00:00.000Z',
      approvedBy: '制造经理 王工',
      approvedAt: '2026-06-01T11:00:00.000Z',
      auditId: 'AUD-ROUTE-CAPABILITY-HT-RELEASE-001',
      traceId: 'TRACE-ROUTE-CAPABILITY-HT-RELEASE-001',
      statusLabel: '分流能力已放行',
      summary: 'HT-02 已确认可承接热处理分流/合批窗口。',
    })
    const wrapper = mountScheduleBoard({
      ScheduleEventQueuePanel: {
        props: {
          events: Array,
          activeSuggestion: Object,
        },
        emits: ['generate', 'adopt'],
        template: `
          <section class="event-queue-stub">
            <article
              v-for="event in events.filter((item) => item.type === 'route')"
              :key="event.id"
              class="route-event-probe"
            >
              <p class="route-event-title">{{ event.title }}</p>
              <p class="route-event-impact">{{ event.impact }}</p>
              <p class="route-event-resolution">{{ event.resolutionNote }}</p>
              <button type="button" class="generate-route-suggestion" @click="$emit('generate', event)">
                生成工艺建议
              </button>
            </article>
            <button
              type="button"
              class="accept-route-suggestion"
              @click="$emit('adopt', activeSuggestion)"
            >
              采纳工艺建议
            </button>
            <p class="suggestion-title">{{ activeSuggestion?.title ?? '' }}</p>
            <p class="suggestion-action">{{ activeSuggestion?.action ?? '' }}</p>
            <p class="suggestion-changeover">{{ activeSuggestion?.changeoverImpact ?? '' }}</p>
          </section>
        `,
      },
    })
    await flushPromises()

    expect(readRouteCapabilityValidationBackendFirst).toHaveBeenCalledWith({ failLoud: true })

    expect(wrapper.get('.route-event-impact').text()).toContain('HT-02 已确认')
    expect(wrapper.get('.route-event-resolution').text()).toContain('工艺分流/合批已确认')

    await wrapper.get('.generate-route-suggestion').trigger('click')
    await flushPromises()

    expect(wrapper.get('.suggestion-title').text()).toContain('热处理分流确认后的排产复核')
    expect(wrapper.get('.suggestion-action').text()).toContain('AUD-ROUTE-CAPABILITY-HT-RELEASE-001')
    expect(wrapper.get('.suggestion-action').text()).toContain('2026-06-02 夜班')
    expect(wrapper.get('.suggestion-changeover').text()).toContain('+18min')

    await wrapper.get('.accept-route-suggestion').trigger('click')
    await flushPromises()

    expect(writeScheduleFeedbackSnapshot).toHaveBeenCalledWith(expect.objectContaining({
      decision: 'accepted',
      reasonCategory: 'route_event_agent',
      reasonDetail: expect.stringContaining('热处理分流确认后的排产复核'),
    }))
    expect(writeScheduleFeedbackSnapshot).toHaveBeenCalledWith(expect.objectContaining({
      reasonDetail: expect.stringContaining('2026-06-02 夜班'),
    }))
    expect(submitAdoptionFeedback).toHaveBeenCalledWith(expect.objectContaining({
      reasonCategory: 'accepted_route_event_agent',
      reasonDetail: expect.stringContaining('TRACE-ROUTE-CAPABILITY-HT-RELEASE-001'),
    }))
  })

  it('persists labor qualification blocking adoption with supervisor review evidence', async () => {
    submitAdoptionFeedback.mockResolvedValueOnce(undefined)
    const laborBlock = {
      id: 'labor-block-WO-013-heat-treatment',
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
      reviewerEmployeeNumber: 'EMP-004',
      reviewerName: '赵六',
      reviewerRole: '工程放行',
      reason: '热处理上岗证临期且无有效替班候选。',
      auditId: 'AUD-LABOR-BLOCK-WO-013',
      traceId: 'TRACE-LABOR-BLOCK-WO-013-OP-10',
      createdAt: '2026-06-01T08:00:00.000Z',
      status: 'active',
    }
    readLaborQualificationBlock.mockReturnValue(laborBlock)
    readLaborQualificationBlocksBackendFirst.mockResolvedValue([laborBlock])
    const wrapper = mountScheduleBoard({
      ScheduleEventQueuePanel: {
        props: {
          events: Array,
          activeSuggestion: Object,
        },
        emits: ['generate', 'adopt'],
        template: `
          <section class="event-queue-stub">
            <article
              v-for="event in events.filter((item) => item.type === 'labor')"
              :key="event.id"
              class="labor-event-probe"
            >
              <p class="labor-event-title">{{ event.title }}</p>
              <p class="labor-event-impact">{{ event.impact }}</p>
              <p class="labor-event-resolution">{{ event.resolutionNote }}</p>
              <button type="button" class="generate-labor-suggestion" @click="$emit('generate', event)">
                生成人员建议
              </button>
            </article>
            <button
              type="button"
              class="accept-labor-suggestion"
              @click="$emit('adopt', activeSuggestion)"
            >
              采纳人员建议
            </button>
            <p class="suggestion-title">{{ activeSuggestion?.title ?? '' }}</p>
            <p class="suggestion-action">{{ activeSuggestion?.action ?? '' }}</p>
            <p class="suggestion-delay">{{ activeSuggestion?.delayImpact ?? '' }}</p>
          </section>
        `,
      },
    })
    await flushPromises()

    expect(wrapper.get('.labor-event-title').text()).toContain('WO-013 热处理无有效替班候选')
    expect(wrapper.get('.labor-event-impact').text()).toContain('系统未找到满足 热处理')
    expect(wrapper.get('.labor-event-resolution').text()).toContain('人员约束未闭环')

    await wrapper.get('.generate-labor-suggestion').trigger('click')
    await flushPromises()

    expect(readLaborQualificationBlocksBackendFirst).toHaveBeenCalledWith({ failLoud: true })
    expect(wrapper.get('.suggestion-title').text()).toContain('人员资质停工复核建议')
    expect(wrapper.get('.suggestion-action').text()).toContain('AUD-LABOR-BLOCK-WO-013')
    expect(wrapper.get('.suggestion-action').text()).toContain('复核通过前生产开工不得放行')
    expect(wrapper.get('.suggestion-delay').text()).toContain('+1 班次待复核')

    await wrapper.get('.accept-labor-suggestion').trigger('click')
    await flushPromises()

    expect(writeScheduleFeedbackSnapshot).toHaveBeenCalledWith(expect.objectContaining({
      decision: 'accepted',
      reasonCategory: 'labor_event_agent',
      reasonDetail: expect.stringContaining('人员资质停工复核建议'),
    }))
    expect(writeScheduleFeedbackSnapshot).toHaveBeenCalledWith(expect.objectContaining({
      reasonDetail: expect.stringContaining('AUD-LABOR-BLOCK-WO-013'),
    }))
    expect(submitAdoptionFeedback).toHaveBeenCalledWith(expect.objectContaining({
      reasonCategory: 'accepted_labor_event_agent',
      reasonDetail: expect.stringContaining('复核通过前生产开工不得放行'),
    }))
  })

  it('does not render stale local labor block evidence when backend confirms no active block', async () => {
    readLaborQualificationBlock.mockReturnValue({
      id: 'labor-block-WO-013-stale',
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
      reviewerEmployeeNumber: 'EMP-004',
      reviewerName: '赵六',
      reviewerRole: '工程放行',
      reason: '本地旧人员阻断证据。',
      auditId: 'AUD-LABOR-BLOCK-STALE-LOCAL',
      traceId: 'TRACE-LABOR-BLOCK-STALE-LOCAL',
      createdAt: '2026-06-01T08:00:00.000Z',
      status: 'active',
    })
    const wrapper = mountScheduleBoard({
      ScheduleFeedbackPanel: false,
      ScheduleEventQueuePanel: false,
    })
    await flushPromises()

    const laborEvent = wrapper.findAll('.event-card')
      .find(card => card.text().includes('WO-013 热处理无有效替班候选'))
    expect(laborEvent).toBeUndefined()
    expect(readLaborQualificationBlocksBackendFirst).toHaveBeenCalledWith({ failLoud: true })
    expect(wrapper.text()).not.toContain('AUD-LABOR-BLOCK-STALE-LOCAL')
    expect(wrapper.text()).not.toContain('本地旧人员阻断证据')
  })

  it('hydrates released labor block and approved reassignment from backend as a resolved labor event', async () => {
    readLaborQualificationBlocksBackendFirst.mockResolvedValue([
      {
        id: 'labor-qualification-block-WO-013-heat-treatment',
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
        reviewerEmployeeNumber: 'EMP-004',
        reviewerName: '赵六',
        reviewerRole: '工程放行',
        reason: '补证改派后重新放行。',
        auditId: 'AUD-LABOR-BLOCK-20260520-001',
        traceId: 'TRACE-LABOR-BLOCK-WO-013-OP-10',
        createdAt: '2026-06-21T01:40:55.043Z',
        status: 'released',
        releaseTraceId: 'TRACE-LABOR-RELEASE-WO-013-OP-10',
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

    const wrapper = mountScheduleBoard({
      ScheduleEventQueuePanel: {
        props: {
          events: Array,
          activeSuggestion: Object,
        },
        template: `
          <section class="event-queue-stub">
            <article
              v-for="event in events.filter((item) => item.type === 'labor')"
              :key="event.id"
              class="labor-event-probe"
            >
              <p class="labor-event-title">{{ event.title }}</p>
              <p class="labor-event-resolution">{{ event.resolutionNote }}</p>
            </article>
          </section>
        `,
      },
    })
    await flushPromises()

    expect(wrapper.get('.labor-event-title').text()).toContain('WO-013 热处理替班已确认')
    expect(wrapper.get('.labor-event-resolution').text()).toContain('人员约束已由替班建议转为开工校验')
    expect(wrapper.text()).not.toContain('WO-013 热处理无有效替班候选')
    expect(wrapper.text()).not.toContain('人员资质停工复核建议')
  })

  it('lets operators retry startup labor evidence after an initial backend read failure', async () => {
    readLaborQualificationBlocksBackendFirst
      .mockRejectedValueOnce(new Error('labor evidence backend unavailable'))
      .mockResolvedValueOnce([
        {
          id: 'labor-qualification-block-WO-013-heat-treatment',
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
          reviewerEmployeeNumber: 'EMP-004',
          reviewerName: '赵六',
          reviewerRole: '工程放行',
          reason: '补证改派后重新放行。',
          auditId: 'AUD-LABOR-BLOCK-20260520-001',
          traceId: 'TRACE-LABOR-BLOCK-WO-013-OP-10',
          createdAt: '2026-06-21T01:40:55.043Z',
          status: 'released',
          releaseTraceId: 'TRACE-LABOR-RELEASE-WO-013-OP-10',
        },
      ])
    const releasedReassignments = [
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
    ]
    readLaborReassignmentsBackendFirst
      .mockResolvedValueOnce(releasedReassignments)
      .mockResolvedValueOnce(releasedReassignments)
    const wrapper = mountScheduleBoard({
      ScheduleEventQueuePanel: {
        props: {
          events: Array,
          activeSuggestion: Object,
        },
        template: `
          <section class="event-queue-stub">
            <article
              v-for="event in events.filter((item) => item.type === 'labor')"
              :key="event.id"
              class="labor-event-probe"
            >
              <p class="labor-event-title">{{ event.title }}</p>
              <p class="labor-event-resolution">{{ event.resolutionNote }}</p>
            </article>
          </section>
        `,
      },
    })
    await flushPromises()

    const warning = wrapper.get('.warnings-bar')
    expect(warning.text()).toContain('人员约束启动证据加载失败')
    expect(warning.text()).toContain('labor evidence backend unavailable')
    expect(wrapper.find('.labor-event-probe').exists()).toBe(false)

    await wrapper.get('.warning-action').trigger('click')
    await flushPromises()

    expect(readLaborQualificationBlocksBackendFirst).toHaveBeenCalledTimes(2)
    expect(readLaborReassignmentsBackendFirst).toHaveBeenCalledTimes(2)
    expect(wrapper.find('.warning-action').exists()).toBe(false)
    expect(wrapper.text()).not.toContain('人员约束启动证据加载失败')
    expect(wrapper.get('.labor-event-title').text()).toContain('WO-013 热处理替班已确认')
    expect(wrapper.get('.labor-event-resolution').text()).toContain('人员约束已由替班建议转为开工校验')
  })

  it('keeps startup labor evidence fail-loud when retry also fails', async () => {
    readLaborQualificationBlocksBackendFirst
      .mockRejectedValueOnce(new Error('initial labor evidence backend unavailable'))
      .mockRejectedValueOnce(new Error('retry labor evidence backend unavailable'))
    readLaborReassignmentsBackendFirst.mockResolvedValue([])

    const wrapper = mountScheduleBoard()
    await flushPromises()

    expect(wrapper.get('.warnings-bar').text()).toContain('initial labor evidence backend unavailable')

    await wrapper.get('.warning-action').trigger('click')
    await flushPromises()

    const warning = wrapper.get('.warnings-bar')
    expect(warning.text()).toContain('人员约束启动证据加载失败')
    expect(warning.text()).toContain('retry labor evidence backend unavailable')
    expect(wrapper.get('.warning-action').text()).toContain('重试人员证据')
    expect(readLaborQualificationBlocksBackendFirst).toHaveBeenCalledTimes(2)
    expect(readLaborReassignmentsBackendFirst).toHaveBeenCalledTimes(2)
  })

  it('persists labor reassignment release adoption with startup review evidence', async () => {
    submitAdoptionFeedback.mockResolvedValueOnce(undefined)
    const laborReassignmentRecord = {
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
      reason: 'EMP-003 热处理上岗证临期，WO-013 热处理工序改由 EMP-006 班组长接管开工复核。',
      auditId: 'AUD-LABOR-REASSIGN-WO-013',
      traceId: 'TRACE-LABOR-REASSIGN-WO-013-OP-10',
      createdAt: '2026-06-01T08:00:00.000Z',
      status: 'approved',
    }
    readLaborReassignment.mockReturnValue(laborReassignmentRecord)
    readLaborReassignmentsBackendFirst.mockResolvedValue([laborReassignmentRecord])
    const wrapper = mountScheduleBoard({
      ScheduleEventQueuePanel: {
        props: {
          events: Array,
          activeSuggestion: Object,
        },
        emits: ['generate', 'adopt'],
        template: `
          <section class="event-queue-stub">
            <article
              v-for="event in events.filter((item) => item.type === 'labor')"
              :key="event.id"
              class="labor-event-probe"
            >
              <p class="labor-event-title">{{ event.title }}</p>
              <p class="labor-event-impact">{{ event.impact }}</p>
              <p class="labor-event-resolution">{{ event.resolutionNote }}</p>
              <button type="button" class="generate-labor-suggestion" @click="$emit('generate', event)">
                生成人员建议
              </button>
            </article>
            <button
              type="button"
              class="accept-labor-suggestion"
              @click="$emit('adopt', activeSuggestion)"
            >
              采纳人员建议
            </button>
            <p class="suggestion-title">{{ activeSuggestion?.title ?? '' }}</p>
            <p class="suggestion-action">{{ activeSuggestion?.action ?? '' }}</p>
            <p class="suggestion-otd">{{ activeSuggestion?.otdImpact ?? '' }}</p>
          </section>
        `,
      },
    })
    await flushPromises()

    expect(wrapper.get('.labor-event-title').text()).toContain('WO-013 热处理替班已确认')
    expect(wrapper.get('.labor-event-impact').text()).toContain('EMP-006 孙八 接管 淬火 / 回火 开工复核')
    expect(wrapper.get('.labor-event-resolution').text()).toContain('人员约束已由替班建议转为开工校验')

    await wrapper.get('.generate-labor-suggestion').trigger('click')
    await flushPromises()

    expect(readLaborReassignmentsBackendFirst).toHaveBeenCalledWith({ failLoud: true })
    expect(wrapper.get('.suggestion-title').text()).toContain('人员替班后的开工复核建议')
    expect(wrapper.get('.suggestion-action').text()).toContain('AUD-LABOR-REASSIGN-WO-013')
    expect(wrapper.get('.suggestion-action').text()).toContain('TRACE-LABOR-REASSIGN-WO-013-OP-10')
    expect(wrapper.get('.suggestion-otd').text()).toContain('+4%')

    await wrapper.get('.accept-labor-suggestion').trigger('click')
    await flushPromises()

    expect(writeScheduleFeedbackSnapshot).toHaveBeenCalledWith(expect.objectContaining({
      decision: 'accepted',
      reasonCategory: 'labor_event_agent',
      reasonDetail: expect.stringContaining('人员替班后的开工复核建议'),
    }))
    expect(writeScheduleFeedbackSnapshot).toHaveBeenCalledWith(expect.objectContaining({
      reasonDetail: expect.stringContaining('AUD-LABOR-REASSIGN-WO-013'),
    }))
    expect(submitAdoptionFeedback).toHaveBeenCalledWith(expect.objectContaining({
      reasonCategory: 'accepted_labor_event_agent',
      reasonDetail: expect.stringContaining('TRACE-LABOR-REASSIGN-WO-013-OP-10'),
    }))
  })

  it('persists barcode quality release adoption with OP-20 schedule recovery evidence', async () => {
    submitAdoptionFeedback.mockResolvedValueOnce(undefined)
    readOtdEvidenceChainRecords.mockReturnValue([
      {
        id: 'barcode-schedule-release-WO-RUSH-9001-OP-20',
        traceId: 'TRACE-QR-WO-RUSH-9001-OP-10-SCHEDULE-RELEASE',
        type: 'quality-gate',
        stage: '排产回写',
        title: 'WO-RUSH-9001 OP-20 接收窗口已恢复',
        summary: '质量冻结解除后，AI 排产可重新安排 OP-20 装配复检窗口，保留返工复验耗时并更新 OTD 复盘口径。',
        object: 'WO-RUSH-9001 / OP-20',
        source: '质量闭环 / AI 排产',
        status: 'ready',
        statusLabel: '后段可排',
        createdAt: '2026-06-01T08:30:00.000Z',
      },
    ])
    const wrapper = mountScheduleBoard({
      ScheduleEventQueuePanel: {
        props: {
          events: Array,
          activeSuggestion: Object,
        },
        emits: ['generate', 'adopt'],
        template: `
          <section class="event-queue-stub">
            <article
              v-for="event in events.filter((item) => item.id === 'evt-quality-release-WO-RUSH-9001-OP-20')"
              :key="event.id"
              class="quality-release-event-probe"
            >
              <p class="quality-release-title">{{ event.title }}</p>
              <p class="quality-release-impact">{{ event.impact }}</p>
              <p class="quality-release-resolution">{{ event.resolutionNote }}</p>
              <button type="button" class="generate-quality-release" @click="$emit('generate', event)">
                生成质量释放建议
              </button>
            </article>
            <button
              type="button"
              class="accept-quality-release"
              @click="$emit('adopt', activeSuggestion)"
            >
              采纳质量释放建议
            </button>
            <p class="suggestion-title">{{ activeSuggestion?.title ?? '' }}</p>
            <p class="suggestion-action">{{ activeSuggestion?.action ?? '' }}</p>
            <p class="suggestion-delay">{{ activeSuggestion?.delayImpact ?? '' }}</p>
          </section>
        `,
      },
    })
    await flushPromises()

    expect(wrapper.get('.quality-release-title').text()).toContain('WO-RUSH-9001 OP-20 排产窗口恢复')
    expect(wrapper.get('.quality-release-impact').text()).toContain('OP-20 接收窗口已恢复')
    expect(wrapper.get('.quality-release-resolution').text()).toContain('质量复验已释放 OP-20 接收')

    await wrapper.get('.generate-quality-release').trigger('click')
    await flushPromises()

    expect(wrapper.get('.suggestion-title').text()).toContain('质量复验放行后的排产复核')
    expect(wrapper.get('.suggestion-action').text()).toContain('TRACE-QR-WO-RUSH-9001-OP-10-SCHEDULE-RELEASE')
    expect(wrapper.get('.suggestion-action').text()).toContain('OP-20 装配复检窗口恢复')
    expect(wrapper.get('.suggestion-delay').text()).toContain('-1 单风险')

    await wrapper.get('.accept-quality-release').trigger('click')
    await flushPromises()

    expect(writeScheduleFeedbackSnapshot).toHaveBeenCalledWith(expect.objectContaining({
      decision: 'accepted',
      reasonCategory: 'quality_event_agent',
      reasonDetail: expect.stringContaining('质量复验放行后的排产复核'),
    }))
    expect(writeScheduleFeedbackSnapshot).toHaveBeenCalledWith(expect.objectContaining({
      reasonDetail: expect.stringContaining('TRACE-QR-WO-RUSH-9001-OP-10-SCHEDULE-RELEASE'),
    }))
    expect(submitAdoptionFeedback).toHaveBeenCalledWith(expect.objectContaining({
      reasonCategory: 'accepted_quality_event_agent',
      reasonDetail: expect.stringContaining('OP-20 装配复检窗口恢复'),
    }))
  })

  it('persists production closeout review adoption with OTD evidence-chain context', async () => {
    submitAdoptionFeedback.mockResolvedValueOnce(undefined)
    readOtdEvidenceChainRecords.mockReturnValue([
      {
        id: 'production-closeout-WO-RUSH-9001',
        stage: '生产复核',
        title: 'WO-RUSH-9001 完工回写复核',
        summary: '完工回写已进入 OTD 证据链，后续工序窗口和质量门需复核。',
        object: 'WO-RUSH-9001 / OP-20',
        source: '生产报工 / 完工复核',
        traceId: 'TRACE-PROD-CLOSEOUT-WO-RUSH-9001',
        status: 'closed',
        statusLabel: '已复核',
        createdAt: '2026-06-01T09:00:00.000Z',
      },
    ])
    const wrapper = mountScheduleBoard({
      ScheduleEventQueuePanel: {
        props: {
          events: Array,
          activeSuggestion: Object,
        },
        emits: ['generate', 'adopt'],
        template: `
          <section class="event-queue-stub">
            <article
              v-for="event in events.filter((item) => item.type === 'production')"
              :key="event.id"
              class="production-closeout-event-probe"
            >
              <p class="production-closeout-title">{{ event.title }}</p>
              <p class="production-closeout-impact">{{ event.impact }}</p>
              <p class="production-closeout-resolution">{{ event.resolutionNote }}</p>
              <p class="production-closeout-evidence">{{ event.evidence?.join(' / ') }}</p>
              <button type="button" class="generate-production-closeout" @click="$emit('generate', event)">
                生成生产复核建议
              </button>
            </article>
            <button
              type="button"
              class="accept-production-closeout"
              @click="$emit('adopt', activeSuggestion)"
            >
              采纳生产复核建议
            </button>
            <p class="suggestion-title">{{ activeSuggestion?.title ?? '' }}</p>
            <p class="suggestion-action">{{ activeSuggestion?.action ?? '' }}</p>
            <p class="suggestion-otd">{{ activeSuggestion?.otdImpact ?? '' }}</p>
            <p class="suggestion-delay">{{ activeSuggestion?.delayImpact ?? '' }}</p>
          </section>
        `,
      },
    })
    await flushPromises()

    expect(wrapper.get('.production-closeout-title').text()).toContain('WO-RUSH-9001 完工回写复核')
    expect(wrapper.get('.production-closeout-impact').text()).toContain('后续工序窗口和质量门需复核')
    expect(wrapper.get('.production-closeout-resolution').text()).toContain('生产完工已写入 OTD 证据链')
    expect(wrapper.get('.production-closeout-evidence').text()).toContain('TRACE-PROD-CLOSEOUT-WO-RUSH-9001')

    await wrapper.get('.generate-production-closeout').trigger('click')
    await flushPromises()

    expect(wrapper.get('.suggestion-title').text()).toContain('生产完工复核建议')
    expect(wrapper.get('.suggestion-action').text()).toContain('后续工序窗口、质量门和 OTD 证据链')
    expect(wrapper.get('.suggestion-otd').text()).toContain('+2% 已锁定')
    expect(wrapper.get('.suggestion-delay').text()).toContain('0 单新增风险')

    await wrapper.get('.accept-production-closeout').trigger('click')
    await flushPromises()

    expect(writeScheduleFeedbackSnapshot).toHaveBeenCalledWith(expect.objectContaining({
      decision: 'accepted',
      reasonCategory: 'production_event_agent',
      reasonDetail: expect.stringContaining('生产完工复核建议'),
    }))
    expect(writeScheduleFeedbackSnapshot).toHaveBeenCalledWith(expect.objectContaining({
      reasonDetail: expect.stringContaining('后续工序窗口、质量门和 OTD 证据链'),
    }))
    expect(submitAdoptionFeedback).toHaveBeenCalledWith(expect.objectContaining({
      reasonCategory: 'accepted_production_event_agent',
      reasonDetail: expect.stringContaining('后续工序窗口、质量门和 OTD 证据链'),
    }))
  })

  it('surfaces closed risk SLA review evidence as a schedule event and agent suggestion', async () => {
    const riskSlaReview = makeRiskSlaReviewRecord()
    readRiskSlaReviewRecord.mockReturnValue(riskSlaReview)
    readRiskSlaReviewRecordBackendFirst.mockResolvedValueOnce(riskSlaReview)

    const wrapper = mountScheduleBoard({
      ScheduleEventQueuePanel: {
        props: {
          events: Array,
          activeSuggestion: Object,
        },
        emits: ['generate'],
        template: `
          <section class="event-queue-stub">
            <article
              v-for="event in events"
              :key="event.id"
              class="event-card-probe"
              :data-id="event.id"
              :data-type="event.type"
              :data-severity="event.severity"
              :data-resolved="String(Boolean(event.resolved))"
            >
              <strong>{{ event.typeLabel }} / {{ event.severityLabel }}</strong>
              <p>{{ event.title }}</p>
              <p>{{ event.impact }}</p>
              <p>{{ event.affectedOrders }}</p>
              <p>{{ event.window }}</p>
              <code>{{ event.evidence?.join(' / ') }}</code>
              <em>{{ event.resolutionNote }}</em>
              <button type="button" class="generate-risk-sla" @click="$emit('generate', event)">生成建议</button>
            </article>
            <p class="suggestion-title">{{ activeSuggestion?.title ?? '' }}</p>
            <p class="suggestion-action">{{ activeSuggestion?.action ?? '' }}</p>
            <p class="suggestion-impact">{{ activeSuggestion?.otdImpact ?? '' }} / {{ activeSuggestion?.delayImpact ?? '' }} / {{ activeSuggestion?.changeoverImpact ?? '' }}</p>
          </section>
        `,
      },
    })
    await flushPromises()

    const event = wrapper.get('.event-card-probe')
    expect(event.attributes('data-id')).toBe('evt-risk-sla-risk-sla-review-20260615')
    expect(event.attributes('data-type')).toBe('risk')
    expect(event.attributes('data-severity')).toBe('warning')
    expect(event.attributes('data-resolved')).toBe('true')
    expect(event.text()).toContain('风险 SLA 复核 / 晨会责任动作已闭环')
    expect(event.text()).toContain('风险 SLA 逾期晨会复核包')
    expect(event.text()).toContain('生产经理已确认 4 项责任动作全部闭环')
    expect(event.text()).toContain('WO-2026-0042 / WO-RUSH-9001 / AL-6061')
    expect(event.text()).toContain('晨会闭环后复核')
    expect(event.text()).toContain('TRACE-RISK-SLA-DAILY-REVIEW-CLOSED-20260615')
    expect(event.text()).toContain('TRACE-RISK-SLA-PURCHASE-COMMIT-20260615')
    expect(event.text()).toContain('AI 排产需复核承诺窗口是否保持 OTD 恢复')

    await wrapper.get('.generate-risk-sla').trigger('click')
    await flushPromises()

    expect(wrapper.get('.suggestion-title').text()).toContain('风险 SLA 闭环后的排产复核建议')
    expect(wrapper.get('.suggestion-action').text()).toContain('TRACE-RISK-SLA-DAILY-REVIEW-CLOSED-20260615')
    expect(wrapper.get('.suggestion-action').text()).toContain('WO-2026-0042 与 WO-RUSH-9001')
    expect(wrapper.get('.suggestion-action').text()).toContain('采购协同-AL-6061 替代承诺已确认')
    expect(wrapper.get('.suggestion-impact').text()).toContain('+6% 已锁定')
    expect(wrapper.get('.suggestion-impact').text()).toContain('-2 单延期风险已转复盘')
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

  it('manual refresh recovers from an initial backend fallback and clears stale warning state', async () => {
    getCurrentPlan.mockRejectedValueOnce(new Error('current plan API unavailable'))
    const wrapper = mountScheduleBoard({
      GanttToolbar: {
        emits: ['refresh'],
        template: '<button type="button" class="refresh-schedule" @click="$emit(\'refresh\')">刷新</button>',
      },
      GanttChart: {
        props: ['data'],
        template: '<div class="gantt-chart-probe">{{ data.tasks.map((task) => task.text).join(" / ") }}</div>',
      },
    })
    await flushPromises()

    expect(getCurrentPlan).toHaveBeenCalledTimes(1)
    expect(wrapper.get('.warnings-bar').text()).toContain('current plan API unavailable')
    expect(wrapper.get('.gantt-chart-probe').text()).not.toContain('WO-001')

    await wrapper.get('.refresh-schedule').trigger('click')
    await flushPromises()

    expect(getCurrentPlan).toHaveBeenCalledTimes(2)
    expect(wrapper.find('.warnings-bar').exists()).toBe(false)
    expect(wrapper.find('[role="alert"]').exists()).toBe(false)
    expect(wrapper.get('.gantt-chart-probe').text()).toContain('WO-001')
  })

  it('retry button recovers from an optimization error without leaving a stale alert', async () => {
    optimizeSchedule
      .mockRejectedValueOnce(new Error('optimizer unavailable'))
      .mockResolvedValueOnce({
        plan: makePlan(),
        assignments: [],
        estimatedCompletionRate: 0.95,
        utilizationRate: 0.88,
        warnings: ['重试后已恢复可执行排产方案'],
      })
    const wrapper = mountScheduleBoard()
    await flushPromises()

    await wrapper.get('.optimize-button').trigger('click')
    await flushPromises()
    expect(wrapper.get('[role="alert"]').text()).toContain('optimizer unavailable')

    await wrapper.get('.error-banner button').trigger('click')
    await flushPromises()

    expect(wrapper.find('[role="alert"]').exists()).toBe(false)
    expect(wrapper.find('.warnings-bar').exists()).toBe(false)
  })

  it('exports the current schedule rows from the toolbar csv action', async () => {
    const wrapper = mountScheduleBoard({
      GanttToolbar: {
        emits: ['export-csv'],
        template: '<button type="button" class="export-schedule" @click="$emit(\'export-csv\')">导出</button>',
      },
    })
    await flushPromises()

    await wrapper.get('.export-schedule').trigger('click')
    await flushPromises()

    expect(csvFilename).toHaveBeenCalledWith('排产计划')
    expect(downloadCsv).toHaveBeenCalledWith(
      '排产计划.csv',
      ['工单号', '产品', '设备', '开始时间', '结束时间', '状态', '进度'],
      expect.arrayContaining([
        expect.arrayContaining(['WO-001']),
      ]),
    )
  })

  it('closes the adoption feedback modal after the feedback form submits successfully', async () => {
    const wrapper = mountScheduleBoard({
      GanttToolbar: {
        emits: ['feedback'],
        template: '<button type="button" class="open-feedback" @click="$emit(\'feedback\')">反馈</button>',
      },
      FeedbackForm: {
        props: ['visible'],
        emits: ['submitted'],
        template: `
          <section class="feedback-form-probe" :data-visible="String(visible)">
            <button v-if="visible" type="button" class="submit-feedback" @click="$emit('submitted')">提交反馈</button>
          </section>
        `,
      },
    })
    await flushPromises()

    expect(wrapper.get('.feedback-form-probe').attributes('data-visible')).toBe('false')

    await wrapper.get('.open-feedback').trigger('click')
    await flushPromises()

    expect(wrapper.get('.feedback-form-probe').attributes('data-visible')).toBe('true')

    await wrapper.get('.submit-feedback').trigger('click')
    await flushPromises()

    expect(wrapper.get('.feedback-form-probe').attributes('data-visible')).toBe('false')
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

  it('opens the same auditable task explanation on gantt task double click', async () => {
    getWorkOrderById.mockResolvedValueOnce({
      id: 'wo-1',
      orderNumber: 'WO-001',
      productCode: 'FG-A100',
      productName: '轴承组件',
      plannedQuantity: 120,
      completedQuantity: 0,
      plannedStartDate: '2026-06-01T08:00:00.000Z',
      plannedEndDate: '2026-06-01T12:00:00.000Z',
      status: 'scheduled',
      workshopId: 'workshop-1',
      routeCode: 'CNC-01',
      priority: 3,
      progressPercentage: 0,
      createdAt: '2026-06-01T08:00:00.000Z',
      updatedAt: '2026-06-01T08:00:00.000Z',
    })
    const wrapper = mountScheduleBoard({
      GanttChart: {
        emits: ['task-dbl-click'],
        template: '<button type="button" class="task-bar" @click="$emit(\'task-dbl-click\', \'item-1\')">WO-001</button>',
      },
      OrderDetailPanel: OrderDetailPanelProbe,
    })
    await flushPromises()

    await wrapper.get('.task-bar').trigger('click')
    await flushPromises()

    const detail = wrapper.get('.order-detail-probe')
    expect(getWorkOrderById).toHaveBeenCalledWith('wo-1')
    expect(detail.attributes('data-visible')).toBe('true')
    expect(detail.attributes('data-loading')).toBe('false')
    expect(detail.attributes('data-order-number')).toBe('WO-001')
    expect(detail.attributes('data-explanation-work-order')).toBe('WO-001')
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

  it('announces successful drag reschedule writeback with the saved window', async () => {
    rescheduleItem.mockResolvedValueOnce(undefined)
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

    const status = wrapper.get('.schedule-save-status')
    expect(status.attributes('role')).toBe('status')
    expect(status.attributes('aria-live')).toBe('polite')
    expect(status.text()).toContain('WO-001')
    expect(status.text()).toContain('2026-06-01 09:00')
    expect(status.text()).toContain('2026-06-01 13:00')
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

    const record = wrapper.get('.feedback-record')
    expect(record.text()).toContain('已采纳批量对比方案')
    expect(record.text()).toContain('批量对比采纳')
    expect(record.text()).toContain('综合平衡')
    expect(record.text()).toContain('从批量对比中选择此方案')
    expect(writeScheduleFeedbackSnapshot).toHaveBeenCalledWith(expect.objectContaining({
      decision: 'accepted',
      decisionLabel: '已采纳批量对比方案',
      reasonCategory: 'batch_optimize_apply',
      categoryLabel: '批量对比采纳',
      reasonDetail: '从批量对比中选择此方案',
      objectiveLabel: '综合平衡',
      traceId: 'TRACE-SCH-FEEDBACK-BATCH-balanced',
    }))
  })

  it('announces successful batch objective feedback sync after applying a compared plan', async () => {
    submitAdoptionFeedback.mockResolvedValueOnce(undefined)
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
    await flushPromises()

    expect(submitAdoptionFeedback).toHaveBeenCalledWith(expect.objectContaining({
      schedulePlanId: 'plan-1',
      workshopId: 'workshop-1',
      optimizationObjective: 'balanced',
      reasonCategory: 'batch_optimize_apply',
      reasonDetail: '从批量对比中选择此方案',
    }))
    const note = wrapper.get('.sync-note')
    expect(note.attributes('role')).toBe('status')
    expect(note.attributes('aria-live')).toBe('polite')
    expect(note.text()).toContain('批量方案采纳反馈已同步后台')
    expect(note.text()).not.toContain('同步失败')

    const record = wrapper.get('.feedback-record')
    expect(record.text()).toContain('已采纳批量对比方案')
    expect(record.text()).toContain('综合平衡')
  })

  it('keeps the applied compared plan warning when the initial schedule load fails late', async () => {
    let rejectInitialPlan!: (reason?: unknown) => void
    getCurrentPlan.mockReturnValueOnce(new Promise((_, reject) => {
      rejectInitialPlan = reject
    }))
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

    await wrapper.get('.apply-objective').trigger('click')
    await flushPromises()
    rejectInitialPlan(new Error('late initial schedule unavailable'))
    await flushPromises()

    expect(wrapper.get('.warnings-bar').text()).toContain('综合平衡方案已应用')
    expect(wrapper.get('.warnings-bar').text()).not.toContain('后端排产服务不可用')
  })

  it('keeps batch objective adoption pending when the compared optimization has no plan', async () => {
    optimizeSchedule.mockResolvedValueOnce({
      assignments: [],
      estimatedCompletionRate: 0.94,
      utilizationRate: 0.87,
      warnings: ['综合平衡方案缺少计划'],
    })
    const wrapper = mountScheduleBoard({
      GanttToolbar: {
        props: ['objective'],
        emits: ['optimize', 'compare'],
        template: `
          <div>
            <button type="button" class="toolbar-objective" @click="$emit('optimize')">{{ objective }}</button>
            <button type="button" class="open-compare" @click="$emit('compare')">多目标对比</button>
          </div>
        `,
      },
      ScheduleFeedbackPanel: false,
      ParetoCompare: {
        props: ['visible'],
        emits: ['apply'],
        template: '<button v-if="visible" type="button" class="apply-objective" @click="$emit(\'apply\', \'balanced\')">采用综合方案</button>',
      },
    })
    await flushPromises()

    await wrapper.get('.open-compare').trigger('click')
    await flushPromises()
    await wrapper.get('.apply-objective').trigger('click')
    await flushPromises()

    expect(submitAdoptionFeedback).not.toHaveBeenCalled()
    expect(wrapper.find('.apply-objective').exists()).toBe(true)
    expect(wrapper.get('.toolbar-objective').text()).toContain('due_date')
    const alert = wrapper.get('[role="alert"]')
    expect(alert.text()).toContain('优化失败')
    expect(alert.text()).toContain('后端优化结果缺少排产计划')
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

  it('fails loud when outsourcing schedule release cannot find a received commitment', async () => {
    const outsourcingCommitment = makeReceivedOutsourcingCommitment()
    readLatestOutsourcingCommitmentPackage.mockReturnValue(outsourcingCommitment)
    readLatestOutsourcingCommitmentPackageBackendFirst.mockResolvedValue(outsourcingCommitment)
    confirmOutsourcingScheduleRelease.mockReturnValueOnce(null)
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
    const note = wrapper.get('.sync-note')
    expect(note.attributes('role')).toBe('status')
    expect(note.attributes('aria-live')).toBe('polite')
    expect(note.text()).toContain('外协排产释放同步失败')
    expect(note.text()).toContain('未找到已到货的外协承诺包')
    expect(note.text()).toContain('product-flange')
    expect(wrapper.get('.agent-suggestion').text()).not.toContain('外协排产释放已确认')
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

  it('refreshes the event queue as released after archiving outsourcing schedule evidence', async () => {
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
      ScheduleEventQueuePanel: {
        props: {
          events: Array,
          activeSuggestion: Object,
        },
        emits: ['generate', 'adopt'],
        template: `
          <section class="event-queue-stub">
            <article
              v-for="event in events"
              :key="event.id"
              class="event-card-probe"
              :data-id="event.id"
              :data-severity-label="event.severityLabel"
              :data-window="event.window"
              :data-resolution-note="event.resolutionNote"
              :data-evidence="(event.evidence ?? []).join('|')"
            >
              <button type="button" class="generate-suggestion" @click="$emit('generate', event)">生成建议</button>
              <span class="event-title">{{ event.title }}</span>
              <span class="event-impact">{{ event.impact }}</span>
            </article>
            <button type="button" class="accept-suggestion" @click="$emit('adopt', activeSuggestion)">采纳建议</button>
          </section>
        `,
      },
    })
    await flushPromises()

    expect(wrapper.get('.event-card-probe').text()).toContain('法兰组件 外协到货已确认')

    await wrapper.get('.generate-suggestion').trigger('click')
    await flushPromises()
    await wrapper.get('.accept-suggestion').trigger('click')
    await flushPromises()

    const event = wrapper.get('.event-card-probe')
    expect(event.text()).toContain('法兰组件 外协排产释放已确认')
    expect(event.text()).toContain('OTD 证据链已关闭厂外等待口径')
    expect(event.attributes('data-severity-label')).toBe('已释放')
    expect(event.attributes('data-window')).toBe('排产释放已确认')
    expect(event.attributes('data-resolution-note')).toContain('AI 排产释放结论和 OTD 复盘证据已归档')
    expect(event.attributes('data-evidence')).toContain('TRACE-OUTSOURCING-FLANGE-SCHEDULE-RELEASE-20260521')
    expect(event.attributes('data-evidence')).toContain('AUD-OUTSOURCING-SCHEDULE-RELEASE-FLANGE-20260521-001')
  })

  it('generates an OTD review suggestion when outsourcing release evidence is already archived', async () => {
    const releasedCommitment = {
      ...makeReceivedOutsourcingCommitment(),
      statusLabel: '排产释放已确认',
      scheduleReleaseTraceId: 'TRACE-OUTSOURCING-FLANGE-SCHEDULE-RELEASE-20260521',
      scheduleReleaseAuditId: 'AUD-OUTSOURCING-SCHEDULE-RELEASE-FLANGE-20260521-001',
      scheduleReleaseMessage: '法兰组件外协到货已释放到排产窗口。',
    }
    readLatestOutsourcingCommitmentPackage.mockReturnValue(releasedCommitment)
    readLatestOutsourcingCommitmentPackageBackendFirst.mockResolvedValue(releasedCommitment)

    const wrapper = mountScheduleBoard({
      ScheduleEventQueuePanel: {
        props: {
          events: Array,
          activeSuggestion: Object,
        },
        emits: ['generate'],
        template: `
          <section class="event-queue-stub">
            <article
              v-for="event in events.filter((item) => item.id === 'evt-outsourcing-commitment-product-flange')"
              :key="event.id"
              class="outsourcing-release-event-probe"
              :data-resolution-note="event.resolutionNote"
            >
              <p class="outsourcing-release-title">{{ event.title }}</p>
              <p class="outsourcing-release-impact">{{ event.impact }}</p>
              <p class="outsourcing-release-evidence">{{ event.evidence?.join(' / ') }}</p>
              <button type="button" class="generate-outsourcing-release" @click="$emit('generate', event)">
                生成外协释放复盘
              </button>
            </article>
            <p class="suggestion-title">{{ activeSuggestion?.title ?? '' }}</p>
            <p class="suggestion-action">{{ activeSuggestion?.action ?? '' }}</p>
            <p class="suggestion-otd">{{ activeSuggestion?.otdImpact ?? '' }}</p>
            <p class="suggestion-delay">{{ activeSuggestion?.delayImpact ?? '' }}</p>
          </section>
        `,
      },
    })
    await flushPromises()

    const event = wrapper.get('.outsourcing-release-event-probe')
    expect(event.text()).toContain('法兰组件 外协排产释放已确认')
    expect(event.text()).toContain('OTD 证据链已关闭厂外等待口径')
    expect(event.text()).toContain('TRACE-OUTSOURCING-FLANGE-SCHEDULE-RELEASE-20260521')
    expect(event.text()).toContain('AUD-OUTSOURCING-SCHEDULE-RELEASE-FLANGE-20260521-001')
    expect(event.attributes('data-resolution-note')).toContain('AI 排产释放结论和 OTD 复盘证据已归档')

    await wrapper.get('.generate-outsourcing-release').trigger('click')
    await flushPromises()

    expect(confirmOutsourcingScheduleRelease).not.toHaveBeenCalled()
    expect(wrapper.get('.suggestion-title').text()).toContain('外协排产释放后的 OTD 复盘')
    expect(wrapper.get('.suggestion-action').text()).toContain('TRACE-OUTSOURCING-FLANGE-SCHEDULE-RELEASE-20260521')
    expect(wrapper.get('.suggestion-action').text()).toContain('AUD-OUTSOURCING-SCHEDULE-RELEASE-FLANGE-20260521-001')
    expect(wrapper.get('.suggestion-action').text()).toContain('客户交期')
    expect(wrapper.get('.suggestion-otd').text()).toContain('+2% 已释放归档')
    expect(wrapper.get('.suggestion-delay').text()).toContain('0 单外部等待')
  })

  it('generates a schedule review suggestion after customer delivery commitment is published', async () => {
    const customerCommitment = makeOtdKpiCommitment()
    readLatestOtdKpiCommitmentPackage.mockReturnValue(customerCommitment)
    readLatestOtdKpiCommitmentPackageBackendFirst.mockResolvedValue(customerCommitment)

    const wrapper = mountScheduleBoard({
      ScheduleEventQueuePanel: {
        props: {
          events: Array,
          activeSuggestion: Object,
        },
        emits: ['generate'],
        template: `
          <section class="event-queue-stub">
            <article
              v-for="event in events.filter((item) => item.id === 'evt-otd-kpi-commitment-east-customer')"
              :key="event.id"
              class="customer-commitment-event-probe"
              :data-severity-label="event.severityLabel"
              :data-resolution-note="event.resolutionNote"
              :data-evidence="(event.evidence ?? []).join('|')"
            >
              <p class="customer-commitment-title">{{ event.title }}</p>
              <p class="customer-commitment-impact">{{ event.impact }}</p>
              <button type="button" class="generate-customer-commitment" @click="$emit('generate', event)">
                生成客户承诺复核
              </button>
            </article>
            <p class="suggestion-title">{{ activeSuggestion?.title ?? '' }}</p>
            <p class="suggestion-action">{{ activeSuggestion?.action ?? '' }}</p>
            <p class="suggestion-otd">{{ activeSuggestion?.otdImpact ?? '' }}</p>
            <p class="suggestion-delay">{{ activeSuggestion?.delayImpact ?? '' }}</p>
            <p class="suggestion-changeover">{{ activeSuggestion?.changeoverImpact ?? '' }}</p>
          </section>
        `,
      },
    })
    await flushPromises()

    const event = wrapper.get('.customer-commitment-event-probe')
    expect(event.attributes('data-severity-label')).toBe('客户承诺已生成')
    expect(event.attributes('data-resolution-note')).toContain('急单插入、缺料闭环和质量门边界')
    expect(event.attributes('data-evidence')).toContain('AUD-OTD-KPI-EAST-CUSTOMER-20260616')
    expect(event.attributes('data-evidence')).toContain('TRACE-OTD-KPI-SCHEDULE-REVIEW-20260616')
    expect(event.text()).toContain('华东新能源客户交付恢复承诺')
    expect(event.text()).toContain('CNC 瓶颈保护')

    await wrapper.get('.generate-customer-commitment').trigger('click')
    await flushPromises()

    expect(wrapper.get('.suggestion-title').text()).toContain('客户交付恢复承诺后的排产复核')
    expect(wrapper.get('.suggestion-action').text()).toContain('TRACE-OTD-KPI-EAST-CUSTOMER-20260616')
    expect(wrapper.get('.suggestion-action').text()).toContain('华东新能源客户')
    expect(wrapper.get('.suggestion-action').text()).toContain('94% OTD 承诺')
    expect(wrapper.get('.suggestion-action').text()).toContain('锁定期后插单、缺料闭环、CNC 瓶颈保护和质量门保留')
    expect(wrapper.get('.suggestion-otd').text()).toContain('+12%')
    expect(wrapper.get('.suggestion-delay').text()).toContain('-3 单')
    expect(wrapper.get('.suggestion-changeover').text()).toContain('+10min 可控')
  })

  it('keeps vendor wait outside internal recovery before outsourcing receipt is confirmed', async () => {
    const pendingCommitment = {
      ...makeReceivedOutsourcingCommitment(),
      statusLabel: '外协承诺已锁定',
      commitment: '法兰组件外协承诺窗口已锁定。',
      summary: '外协承诺锁定后等待到货确认。',
      receiptTraceId: undefined,
      receiptAuditId: undefined,
      receivedAt: undefined,
      receivedBy: undefined,
    }
    readLatestOutsourcingCommitmentPackage.mockReturnValue(pendingCommitment)
    readLatestOutsourcingCommitmentPackageBackendFirst.mockResolvedValue(pendingCommitment)

    const wrapper = mountScheduleBoard({
      ScheduleEventQueuePanel: {
        props: {
          events: Array,
          activeSuggestion: Object,
        },
        emits: ['generate'],
        template: `
          <section class="event-queue-stub">
            <article
              v-for="event in events.filter((item) => item.id === 'evt-outsourcing-commitment-product-flange')"
              :key="event.id"
              class="outsourcing-commitment-event-probe"
              :data-resolution-note="event.resolutionNote"
              :data-evidence="(event.evidence ?? []).join('|')"
            >
              <p class="outsourcing-commitment-title">{{ event.title }}</p>
              <p class="outsourcing-commitment-impact">{{ event.impact }}</p>
              <button type="button" class="generate-outsourcing-commitment" @click="$emit('generate', event)">
                生成外协承诺复核
              </button>
            </article>
            <p class="suggestion-title">{{ activeSuggestion?.title ?? '' }}</p>
            <p class="suggestion-action">{{ activeSuggestion?.action ?? '' }}</p>
            <p class="suggestion-otd">{{ activeSuggestion?.otdImpact ?? '' }}</p>
            <p class="suggestion-delay">{{ activeSuggestion?.delayImpact ?? '' }}</p>
            <p class="suggestion-changeover">{{ activeSuggestion?.changeoverImpact ?? '' }}</p>
          </section>
        `,
      },
    })
    await flushPromises()

    const event = wrapper.get('.outsourcing-commitment-event-probe')
    expect(event.text()).toContain('法兰组件 外协承诺已锁定')
    expect(event.attributes('data-evidence')).toContain('TRACE-OUTSOURCING-FLANGE-20260521')

    await wrapper.get('.generate-outsourcing-commitment').trigger('click')
    await flushPromises()

    expect(confirmOutsourcingScheduleRelease).not.toHaveBeenCalled()
    expect(wrapper.get('.suggestion-title').text()).toContain('外协承诺后的排产复核建议')
    expect(wrapper.get('.suggestion-action').text()).toContain('TRACE-OUTSOURCING-FLANGE-20260521')
    expect(wrapper.get('.suggestion-action').text()).toContain('不将其计入厂内已恢复订单')
    expect(wrapper.get('.suggestion-action').text()).toContain('等待到货确认后再释放排产')
    expect(wrapper.get('.suggestion-otd').text()).toContain('+1% 外部约束保留')
    expect(wrapper.get('.suggestion-delay').text()).toContain('0 单厂内恢复')
    expect(wrapper.get('.suggestion-changeover').text()).toContain('0min')
  })

  it('keeps received outsourcing orders awaiting schedule release review before marking them archived', async () => {
    const receivedCommitment = makeReceivedOutsourcingCommitment()
    readLatestOutsourcingCommitmentPackage.mockReturnValue(receivedCommitment)
    readLatestOutsourcingCommitmentPackageBackendFirst.mockResolvedValue(receivedCommitment)

    const wrapper = mountScheduleBoard({
      ScheduleEventQueuePanel: {
        props: {
          events: Array,
          activeSuggestion: Object,
        },
        emits: ['generate'],
        template: `
          <section class="event-queue-stub">
            <article
              v-for="event in events.filter((item) => item.id === 'evt-outsourcing-commitment-product-flange')"
              :key="event.id"
              class="outsourcing-received-event-probe"
              :data-resolution-note="event.resolutionNote"
              :data-evidence="(event.evidence ?? []).join('|')"
            >
              <p class="outsourcing-received-title">{{ event.title }}</p>
              <p class="outsourcing-received-impact">{{ event.impact }}</p>
              <button type="button" class="generate-outsourcing-received" @click="$emit('generate', event)">
                生成外协到货释放复核
              </button>
            </article>
            <p class="suggestion-title">{{ activeSuggestion?.title ?? '' }}</p>
            <p class="suggestion-action">{{ activeSuggestion?.action ?? '' }}</p>
            <p class="suggestion-otd">{{ activeSuggestion?.otdImpact ?? '' }}</p>
            <p class="suggestion-delay">{{ activeSuggestion?.delayImpact ?? '' }}</p>
            <p class="suggestion-changeover">{{ activeSuggestion?.changeoverImpact ?? '' }}</p>
          </section>
        `,
      },
    })
    await flushPromises()

    const event = wrapper.get('.outsourcing-received-event-probe')
    expect(event.attributes('data-resolution-note')).toContain('外协到货已确认')
    expect(event.attributes('data-resolution-note')).not.toContain('AI 排产释放结论和 OTD 复盘证据已归档')
    expect(event.attributes('data-evidence')).toContain('TRACE-OUTSOURCING-FLANGE-RECEIPT-20260521')
    expect(event.text()).toContain('法兰组件 外协到货已确认')

    await wrapper.get('.generate-outsourcing-received').trigger('click')
    await flushPromises()

    expect(confirmOutsourcingScheduleRelease).not.toHaveBeenCalled()
    expect(wrapper.get('.suggestion-title').text()).toContain('外协到货后的排产释放复核')
    expect(wrapper.get('.suggestion-action').text()).toContain('TRACE-OUTSOURCING-FLANGE-RECEIPT-20260521')
    expect(wrapper.get('.suggestion-action').text()).toContain('按到货后最早可执行窗口释放排产')
    expect(wrapper.get('.suggestion-action').text()).toContain('AUD-OUTSOURCING-RECEIPT-FLANGE-20260521-001')
    expect(wrapper.get('.suggestion-otd').text()).toContain('+2% 已到货释放')
    expect(wrapper.get('.suggestion-delay').text()).toContain('-1 单外部等待')
    expect(wrapper.get('.suggestion-changeover').text()).toContain('+4min')
  })

  it('fails loud instead of using stale local outsourcing receipt evidence when generating a release suggestion', async () => {
    const receivedCommitment = makeReceivedOutsourcingCommitment()
    readLatestOutsourcingCommitmentPackage.mockReturnValue(receivedCommitment)
    readLatestOutsourcingCommitmentPackageBackendFirst
      .mockResolvedValueOnce(receivedCommitment)
      .mockResolvedValueOnce(null)

    const wrapper = mountScheduleBoard({
      ScheduleFeedbackPanel: false,
      ScheduleEventQueuePanel: false,
    })
    await flushPromises()

    const outsourcingEvent = wrapper.findAll('.event-card')
      .find(card => card.text().includes('法兰组件 外协到货已确认'))
    expect(outsourcingEvent).toBeTruthy()

    await outsourcingEvent!.get('button').trigger('click')
    await flushPromises()

    expect(readLatestOutsourcingCommitmentPackageBackendFirst).toHaveBeenCalledWith({ failLoud: true })
    expect(wrapper.get('.agent-suggestion').text()).toContain('等待事件评估')
    expect(wrapper.get('.agent-suggestion').text()).not.toContain('外协到货后的排产释放复核')
    const alert = wrapper.get('[role="alert"]')
    expect(alert.text()).toContain('外协承诺证据刷新失败')
    expect(alert.text()).toContain('后端未返回外协承诺证据')
  })

  it('generates a schedule review suggestion after an alternate supplier commitment lowers supply risk', async () => {
    const supplyRisk = {
      id: 'supply-risk-mat-b02',
      materialCode: 'MAT-B02',
      supplierName: '原供应商 A',
      alternateSupplierName: '替代供应商 B',
      purchaseOrderNumber: 'PO-MAT-B02-20260615',
      affectedOrders: 'WO-RUSH-9001 / WO-DEMO-1002',
      originalDeliveryDate: '2026-06-15',
      promisedDeliveryDate: '2026-06-18',
      alternatePromiseDate: '2026-06-16',
      delayDays: 3,
      decision: 'alternate_committed',
      auditId: 'AUD-SUPPLY-RISK-MAT-B02-COMMIT-20260615',
      traceId: 'TRACE-SUPPLY-RISK-MAT-B02-COMMIT-20260615',
    }
    readSupplyRiskEscalation.mockReturnValue(supplyRisk)
    readSupplyRiskEscalationBackendFirst.mockResolvedValue(supplyRisk)

    const wrapper = mountScheduleBoard({
      ScheduleEventQueuePanel: {
        props: {
          events: Array,
          activeSuggestion: Object,
        },
        emits: ['generate'],
        template: `
          <section class="event-queue-stub">
            <article
              v-for="event in events.filter((item) => item.id === 'evt-supply-risk-MAT-B02')"
              :key="event.id"
              class="supply-risk-event-probe"
              :data-severity-label="event.severityLabel"
              :data-resolution-note="event.resolutionNote"
              :data-evidence="(event.evidence ?? []).join('|')"
            >
              <p class="supply-risk-title">{{ event.title }}</p>
              <p class="supply-risk-impact">{{ event.impact }}</p>
              <button type="button" class="generate-supply-risk" @click="$emit('generate', event)">生成供应风险复核</button>
            </article>
            <p class="suggestion-title">{{ activeSuggestion?.title ?? '' }}</p>
            <p class="suggestion-action">{{ activeSuggestion?.action ?? '' }}</p>
            <p class="suggestion-otd">{{ activeSuggestion?.otdImpact ?? '' }}</p>
            <p class="suggestion-delay">{{ activeSuggestion?.delayImpact ?? '' }}</p>
            <p class="suggestion-changeover">{{ activeSuggestion?.changeoverImpact ?? '' }}</p>
          </section>
        `,
      },
    })
    await flushPromises()

    const event = wrapper.get('.supply-risk-event-probe')
    expect(event.attributes('data-severity-label')).toBe('风险下降')
    expect(event.attributes('data-resolution-note')).toContain('替代供应商已锁定')
    expect(event.attributes('data-evidence')).toContain('AUD-SUPPLY-RISK-MAT-B02-COMMIT-20260615')
    expect(event.text()).toContain('MAT-B02 供应延期风险')
    expect(event.text()).toContain('替代供应商 B 已承诺 2026-06-16 到料')

    await wrapper.get('.generate-supply-risk').trigger('click')
    await flushPromises()

    expect(wrapper.get('.suggestion-title').text()).toContain('替代供应商承诺后的排产复核')
    expect(wrapper.get('.suggestion-action').text()).toContain('TRACE-SUPPLY-RISK-MAT-B02-COMMIT-20260615')
    expect(wrapper.get('.suggestion-action').text()).toContain('替代供应商 B')
    expect(wrapper.get('.suggestion-action').text()).toContain('WO-RUSH-9001 / WO-DEMO-1002')
    expect(wrapper.get('.suggestion-action').text()).toContain('AUD-SUPPLY-RISK-MAT-B02-COMMIT-20260615')
    expect(wrapper.get('.suggestion-otd').text()).toContain('+5%')
    expect(wrapper.get('.suggestion-delay').text()).toContain('-1 单风险')
    expect(wrapper.get('.suggestion-changeover').text()).toContain('+6min')
  })

  it('generates a schedule release suggestion after alternate supplier receipt closes supply risk', async () => {
    const supplyRisk = {
      id: 'supply-risk-mat-b02-received',
      materialCode: 'MAT-B02',
      supplierName: '原供应商 A',
      alternateSupplierName: '替代供应商 B',
      purchaseOrderNumber: 'PO-MAT-B02-20260615',
      affectedOrders: 'WO-RUSH-9001 / WO-DEMO-1002',
      originalDeliveryDate: '2026-06-15',
      promisedDeliveryDate: '2026-06-18',
      alternatePromiseDate: '2026-06-16',
      delayDays: 3,
      decision: 'alternate_received',
      auditId: 'AUD-SUPPLY-RISK-MAT-B02-COMMIT-20260615',
      traceId: 'TRACE-SUPPLY-RISK-MAT-B02-COMMIT-20260615',
      receiptAuditId: 'AUD-SUPPLY-RISK-MAT-B02-RECEIPT-20260615',
      receiptTraceId: 'TRACE-SUPPLY-RISK-MAT-B02-RECEIPT-20260615',
    }
    readSupplyRiskEscalation.mockReturnValue(supplyRisk)
    readSupplyRiskEscalationBackendFirst.mockResolvedValue(supplyRisk)

    const wrapper = mountScheduleBoard({
      ScheduleEventQueuePanel: {
        props: {
          events: Array,
          activeSuggestion: Object,
        },
        emits: ['generate'],
        template: `
          <section class="event-queue-stub">
            <article
              v-for="event in events.filter((item) => item.id === 'evt-supply-risk-MAT-B02')"
              :key="event.id"
              class="supply-risk-event-probe"
              :data-severity-label="event.severityLabel"
              :data-resolution-note="event.resolutionNote"
              :data-evidence="(event.evidence ?? []).join('|')"
            >
              <p class="supply-risk-title">{{ event.title }}</p>
              <p class="supply-risk-impact">{{ event.impact }}</p>
              <button type="button" class="generate-supply-risk" @click="$emit('generate', event)">生成供应风险复核</button>
            </article>
            <p class="suggestion-title">{{ activeSuggestion?.title ?? '' }}</p>
            <p class="suggestion-action">{{ activeSuggestion?.action ?? '' }}</p>
            <p class="suggestion-otd">{{ activeSuggestion?.otdImpact ?? '' }}</p>
            <p class="suggestion-delay">{{ activeSuggestion?.delayImpact ?? '' }}</p>
            <p class="suggestion-changeover">{{ activeSuggestion?.changeoverImpact ?? '' }}</p>
          </section>
        `,
      },
    })
    await flushPromises()

    const event = wrapper.get('.supply-risk-event-probe')
    expect(event.attributes('data-severity-label')).toBe('已关闭')
    expect(event.attributes('data-resolution-note')).toContain('替代供应商到货已确认')
    expect(event.attributes('data-evidence')).toContain('AUD-SUPPLY-RISK-MAT-B02-RECEIPT-20260615')
    expect(event.text()).toContain('替代供应商 B 到货已确认')
    expect(event.text()).toContain('MAT-B02 供应风险关闭')

    await wrapper.get('.generate-supply-risk').trigger('click')
    await flushPromises()

    expect(wrapper.get('.suggestion-title').text()).toContain('替代供应商到货后的排产释放')
    expect(wrapper.get('.suggestion-action').text()).toContain('TRACE-SUPPLY-RISK-MAT-B02-RECEIPT-20260615')
    expect(wrapper.get('.suggestion-action').text()).toContain('建议释放 WO-RUSH-9001 / WO-DEMO-1002 的 MAT-B02 供应风险')
    expect(wrapper.get('.suggestion-action').text()).toContain('AUD-SUPPLY-RISK-MAT-B02-RECEIPT-20260615')
    expect(wrapper.get('.suggestion-otd').text()).toContain('+6%')
    expect(wrapper.get('.suggestion-delay').text()).toContain('-1 单风险')
    expect(wrapper.get('.suggestion-changeover').text()).toContain('+6min')
  })

  it('generates a closed monitoring situation review suggestion with closure evidence', async () => {
    const closedSituation = {
      id: 'monitoring-situation-sf-cnc-load',
      sourceEventId: 'sf-cnc-load',
      title: 'CNC 负载叠加现场态势升级处置包',
      source: '实时监控',
      workOrders: 'WO-RUSH-9001 / WO-2026-0042',
      priority: 'warning',
      owner: '生产经理 王工',
      dueAt: '今日 11:30',
      auditId: 'AUD-SF-ESC-SF-CNC-LOAD-20260521',
      traceId: 'TRACE-SF-ESC-SF-CNC-LOAD',
      status: 'closed',
      statusLabel: '已闭环',
      scheduleWindow: '锁定期后第一个 CNC 空窗 + 夜班复核',
      scheduleAction: '冻结当前瓶颈任务并把 WO-RUSH-9001 插入 CNC-003 夜班窗口。',
      riskImpact: 'CNC 负载、齐套缺口和返工窗口叠加。',
      riskSuggestion: '风险队列关闭现场处置包。',
      otdImpact: '+6% 已锁定',
      delayImpact: '-1 单延期风险已解除',
      changeoverImpact: '+10min 已纳入复盘',
      summary: '实时监控现场态势触发跨模块处置，风险队列已关闭处置。',
      evidence: [
        'TRACE-SF-SF-CNC-LOAD',
        'TRACE-SF-ESC-SF-CNC-LOAD-RISK-CLOSED',
      ],
      dispatchSteps: [
        '实时监控识别瓶颈负载、齐套缺口和返工窗口叠加。',
        '风险队列关闭现场处置包，确认生产经理审批与调度复核完成。',
      ],
      createdAt: '2026-06-01T08:00:00.000Z',
      closedAt: '2026-06-01T10:00:00.000Z',
      closureTrace: 'TRACE-SF-CNC-LOAD-CLOSED-20260601',
    }
    readMonitoringSituationEscalations.mockReturnValue([closedSituation])
    readMonitoringSituationEscalationsBackendFirst.mockResolvedValue([closedSituation])

    const wrapper = mountScheduleBoard({
      ScheduleEventQueuePanel: {
        props: {
          events: Array,
          activeSuggestion: Object,
        },
        emits: ['generate'],
        template: `
          <section class="event-queue-stub">
            <article
              v-for="event in events.filter((item) => item.id === 'evt-monitoring-situation-sf-cnc-load')"
              :key="event.id"
              class="monitoring-situation-event-probe"
              :data-severity="event.severity"
              :data-severity-label="event.severityLabel"
              :data-resolved="String(Boolean(event.resolved))"
              :data-window="event.window"
              :data-resolution-note="event.resolutionNote"
            >
              <p class="monitoring-title">{{ event.title }}</p>
              <p class="monitoring-impact">{{ event.impact }}</p>
              <p class="monitoring-evidence">{{ event.evidence?.join(' / ') }}</p>
              <button type="button" class="generate-monitoring-situation" @click="$emit('generate', event)">
                生成现场态势复核
              </button>
            </article>
            <p class="suggestion-title">{{ activeSuggestion?.title ?? '' }}</p>
            <p class="suggestion-action">{{ activeSuggestion?.action ?? '' }}</p>
            <p class="suggestion-otd">{{ activeSuggestion?.otdImpact ?? '' }}</p>
            <p class="suggestion-delay">{{ activeSuggestion?.delayImpact ?? '' }}</p>
          </section>
        `,
      },
    })
    await flushPromises()

    const event = wrapper.get('.monitoring-situation-event-probe')
    expect(event.attributes('data-severity')).toBe('warning')
    expect(event.attributes('data-severity-label')).toBe('已闭环')
    expect(event.attributes('data-resolved')).toBe('true')
    expect(event.attributes('data-window')).toBe('风险关闭后复核')
    expect(event.attributes('data-resolution-note')).toContain('AI 排产需复核已采用的 CNC 分流')
    expect(event.text()).toContain('CNC 负载叠加现场态势升级处置包')
    expect(event.text()).toContain('闭环留痕：TRACE-SF-CNC-LOAD-CLOSED-20260601')
    expect(event.text()).toContain('AUD-SF-ESC-SF-CNC-LOAD-20260521')
    expect(event.text()).toContain('TRACE-SF-ESC-SF-CNC-LOAD')

    await wrapper.get('.generate-monitoring-situation').trigger('click')
    await flushPromises()

    expect(wrapper.get('.suggestion-title').text()).toContain('CNC 负载叠加现场态势升级处置包闭环复核建议')
    expect(wrapper.get('.suggestion-action').text()).toContain('TRACE-SF-ESC-SF-CNC-LOAD 已由风险队列关闭')
    expect(wrapper.get('.suggestion-action').text()).toContain('WO-RUSH-9001 / WO-2026-0042')
    expect(wrapper.get('.suggestion-action').text()).toContain('关闭留痕：TRACE-SF-CNC-LOAD-CLOSED-20260601')
    expect(wrapper.get('.suggestion-otd').text()).toContain('+6% 已锁定')
    expect(wrapper.get('.suggestion-delay').text()).toContain('-1 单延期风险已解除')
  })

  it('generates a closed MRB disposition review suggestion with closure evidence', async () => {
    const closedMrbDisposition = {
      id: 'quality-mrb-disposition-20260521',
      title: 'WO-004 装配间隙超差 MRB 处置决策',
      inspectionId: 'INS-004',
      workOrderId: 'WO-004',
      productCode: 'PRD-001',
      processName: '装配',
      equipmentCode: 'ASM-01',
      materialBatchCode: 'MAT-STEEL-A12',
      batchCode: 'WO-004-ASM',
      inspectionPoint: '功能测试',
      defectPattern: '装配间隙超差 / 功能测试不合格',
      defectQuantity: 4,
      disposition: 'scrap_rebuild',
      dispositionLabel: '报废补料重建',
      status: 'closed',
      statusLabel: 'MRB 处置已闭环',
      owner: '质量经理 / 生产经理 / 采购主管',
      dueAt: '今日 15:00',
      otdImpact: 'WO-004 延期 +2 单风险已转复盘',
      scheduleImpact: '冻结 WO-004 原装配窗口，插入 MAT-STEEL-A12 补料 ETA、返工替代工单和终检复验窗口。',
      recommendedAction: '复核补料后装配与终检复验窗口。',
      auditId: 'AUD-QA-MRB-DISPOSITION-20260521',
      traceId: 'TRACE-QA-WO-004-MRB-DISPOSITION-20260521',
      scheduleTraceId: 'TRACE-QA-WO-004-MRB-SCHEDULE-IMPACT-20260521',
      createdAt: '2026-06-01T08:00:00.000Z',
      closureAuditId: 'AUD-QA-MRB-CLOSURE-20260521',
      closureTraceId: 'TRACE-QA-WO-004-MRB-CLOSURE-20260521',
      closureSummary: '质量隔离、补料 ETA、排产重建和客户说明均已确认，WO-004 转入补料后装配/复检窗口。',
      closedAt: '2026-06-01T10:00:00.000Z',
      closedBy: '生产经理',
      actions: [
        {
          module: '质量',
          owner: '质量经理',
          action: '隔离 4 件装配间隙超差品并完成 MRB 判废',
          dueAt: '今日 11:30',
          evidence: 'Q-HOLD-ASM-WO-004',
          result: '4 件已隔离判废',
        },
        {
          module: '采购',
          owner: '采购主管',
          action: '补料 MAT-STEEL-A12 4 件并确认 ETA',
          dueAt: '今日 13:30',
          evidence: 'PO-MRB-WO-004-MAT-STEEL-A12',
          result: '补料 ETA 已确认',
        },
        {
          module: '排产',
          owner: '生产经理',
          action: '冻结原装配窗口并重排补料后装配/复检',
          dueAt: '今日 15:00',
          evidence: 'SCHED-MRB-WO-004-REBUILD',
          result: '原装配窗口已冻结并重建',
        },
      ],
    }
    readQualityMrbDispositionRecord.mockReturnValue(closedMrbDisposition)
    readQualityMrbDispositionRecordBackendFirst.mockResolvedValue(closedMrbDisposition)

    const wrapper = mountScheduleBoard({
      ScheduleEventQueuePanel: {
        props: {
          events: Array,
          activeSuggestion: Object,
        },
        emits: ['generate'],
        template: `
          <section class="event-queue-stub">
            <article
              v-for="event in events.filter((item) => item.id === 'evt-quality-mrb-quality-mrb-disposition-20260521')"
              :key="event.id"
              class="mrb-event-probe"
              :data-severity="event.severity"
              :data-severity-label="event.severityLabel"
              :data-resolved="String(Boolean(event.resolved))"
              :data-window="event.window"
              :data-resolution-note="event.resolutionNote"
            >
              <p class="mrb-title">{{ event.title }}</p>
              <p class="mrb-impact">{{ event.impact }}</p>
              <p class="mrb-evidence">{{ event.evidence?.join(' / ') }}</p>
              <button type="button" class="generate-mrb-suggestion" @click="$emit('generate', event)">
                生成 MRB 复核
              </button>
            </article>
            <p class="suggestion-title">{{ activeSuggestion?.title ?? '' }}</p>
            <p class="suggestion-action">{{ activeSuggestion?.action ?? '' }}</p>
            <p class="suggestion-otd">{{ activeSuggestion?.otdImpact ?? '' }}</p>
            <p class="suggestion-delay">{{ activeSuggestion?.delayImpact ?? '' }}</p>
            <p class="suggestion-changeover">{{ activeSuggestion?.changeoverImpact ?? '' }}</p>
          </section>
        `,
      },
    })
    await flushPromises()

    const event = wrapper.get('.mrb-event-probe')
    expect(event.attributes('data-severity')).toBe('warning')
    expect(event.attributes('data-severity-label')).toBe('已闭环')
    expect(event.attributes('data-resolved')).toBe('true')
    expect(event.attributes('data-window')).toBe('补料后复核')
    expect(event.attributes('data-resolution-note')).toContain('WO-004 转入补料后装配/复检窗口')
    expect(event.text()).toContain('WO-004 MRB 报废补料重排')
    expect(event.text()).toContain('报废补料重建')
    expect(event.text()).toContain('AUD-QA-MRB-DISPOSITION-20260521')
    expect(event.text()).toContain('TRACE-QA-WO-004-MRB-CLOSURE-20260521')

    await wrapper.get('.generate-mrb-suggestion').trigger('click')
    await flushPromises()

    expect(wrapper.get('.suggestion-title').text()).toContain('MRB 处置闭环后的排产复核建议')
    expect(wrapper.get('.suggestion-action').text()).toContain('TRACE-QA-WO-004-MRB-CLOSURE-20260521')
    expect(wrapper.get('.suggestion-action').text()).toContain('WO-004 MRB 处置闭环')
    expect(wrapper.get('.suggestion-action').text()).toContain('质量-4 件已隔离判废')
    expect(wrapper.get('.suggestion-action').text()).toContain('采购-补料 ETA 已确认')
    expect(wrapper.get('.suggestion-action').text()).toContain('排产-原装配窗口已冻结并重建')
    expect(wrapper.get('.suggestion-otd').text()).toContain('+4% 已锁定')
    expect(wrapper.get('.suggestion-delay').text()).toContain('+2 单风险已转复盘')
    expect(wrapper.get('.suggestion-changeover').text()).toContain('+8min 已纳入复盘')
  })

  it('fails loud when assistant recovery closure refresh fails after closing the handoff', async () => {
    const closedPackage = {
      id: 'assistant-recovery-1',
      title: 'Assistant 恢复交接',
      traceId: 'TRACE-AST-RECOVERY-001',
      closureTraceId: 'TRACE-AST-RECOVERY-CLOSED-001',
      otdImpact: '+6%',
      delayImpact: '-1 单',
      changeoverImpact: '+8min',
      purchaseActionSummary: '采购已确认替代料到货',
      qualityActionSummary: '质量已完成 OP-20 复核',
    }
    closeAssistantRecoveryPackage.mockReturnValueOnce(closedPackage)
    const wrapper = mountScheduleBoard({
      ScheduleRecoveryHandoffPanel: {
        emits: ['close-handoff'],
        template: '<button type="button" class="close-handoff" @click="$emit(\'close-handoff\', \'assistant-recovery-1\')">close</button>',
      },
      ScheduleFeedbackPanel: false,
      ScheduleEventQueuePanel: false,
    })
    await flushPromises()
    readAssistantRecoveryPackagesBackendFirst.mockRejectedValueOnce(new Error('assistant recovery refresh unavailable'))

    await wrapper.get('.close-handoff').trigger('click')
    await flushPromises()

    expect(closeAssistantRecoveryPackage).toHaveBeenCalledWith('assistant-recovery-1', '调度员 李工')
    const note = wrapper.get('.sync-note')
    expect(note.attributes('role')).toBe('status')
    expect(note.attributes('aria-live')).toBe('polite')
    expect(note.text()).toContain('Assistant 恢复交接闭环刷新失败')
    expect(note.text()).toContain('assistant recovery refresh unavailable')
    const suggestion = wrapper.get('.agent-suggestion')
    expect(suggestion.text()).toContain('Assistant 恢复交接闭环复核建议')
    expect(suggestion.text()).toContain('TRACE-AST-RECOVERY-CLOSED-001')
  })

  it('keeps both assistant recovery and engineering refresh failures visible after closing the handoff', async () => {
    const closedPackage = {
      id: 'assistant-recovery-1',
      title: 'Assistant 恢复交接',
      traceId: 'TRACE-AST-RECOVERY-001',
      closureTraceId: 'TRACE-AST-RECOVERY-CLOSED-001',
      otdImpact: '+6%',
      delayImpact: '-1 单',
      changeoverImpact: '+8min',
      purchaseActionSummary: '采购已确认替代料到货',
      qualityActionSummary: '质量已完成 OP-20 复核',
    }
    closeAssistantRecoveryPackage.mockReturnValueOnce(closedPackage)
    const wrapper = mountScheduleBoard({
      ScheduleRecoveryHandoffPanel: {
        emits: ['close-handoff'],
        template: '<button type="button" class="close-handoff" @click="$emit(\'close-handoff\', \'assistant-recovery-1\')">close</button>',
      },
      ScheduleFeedbackPanel: false,
      ScheduleEventQueuePanel: false,
    })
    await flushPromises()
    readAssistantRecoveryPackagesBackendFirst.mockRejectedValueOnce(new Error('assistant recovery refresh unavailable'))
    readAssistantEngineeringConstraintPackagesBackendFirst.mockRejectedValueOnce(new Error('assistant engineering refresh unavailable'))

    await wrapper.get('.close-handoff').trigger('click')
    await flushPromises()

    const note = wrapper.get('.sync-note')
    expect(note.text()).toContain('Assistant 恢复交接闭环刷新失败')
    expect(note.text()).toContain('assistant recovery refresh unavailable')
    expect(note.text()).toContain('Assistant 工程约束闭环刷新失败')
    expect(note.text()).toContain('assistant engineering refresh unavailable')
  })

  it('fails loud when assistant recovery handoff closure cannot be persisted locally', async () => {
    closeAssistantRecoveryPackage.mockReturnValueOnce(null)
    const wrapper = mountScheduleBoard({
      ScheduleRecoveryHandoffPanel: {
        emits: ['close-handoff'],
        template: '<button type="button" class="close-handoff" @click="$emit(\'close-handoff\', \'missing-recovery-package\')">close</button>',
      },
      ScheduleFeedbackPanel: false,
      ScheduleEventQueuePanel: false,
    })
    await flushPromises()

    await wrapper.get('.close-handoff').trigger('click')
    await flushPromises()

    expect(closeAssistantRecoveryPackage).toHaveBeenCalledWith('missing-recovery-package', '调度员 李工')
    const note = wrapper.get('.sync-note')
    expect(note.attributes('role')).toBe('status')
    expect(note.attributes('aria-live')).toBe('polite')
    expect(note.text()).toContain('Assistant 恢复交接闭环保存失败')
    expect(note.text()).toContain('missing-recovery-package')
  })

  it('shows a recovery handoff review suggestion after closing the assistant package successfully', async () => {
    const closedPackage = {
      id: 'assistant-recovery-1',
      title: 'Assistant 恢复交接',
      traceId: 'TRACE-AST-RECOVERY-001',
      closureTraceId: 'TRACE-AST-RECOVERY-CLOSED-001',
      otdImpact: '+6%',
      delayImpact: '-1 单',
      changeoverImpact: '+8min',
      purchaseActionSummary: '采购已确认替代料到货',
      purchaseActionTraceId: 'TRACE-PUR-MAT-B02-ALT-SUPPLIER-RECEIVED',
      qualityActionSummary: '质量已完成 OP-20 复核',
      qualityActionTraceId: 'TRACE-QA-OP20-RECHECK-CLOSED',
    }
    closeAssistantRecoveryPackage.mockReturnValueOnce(closedPackage)
    readAssistantRecoveryPackagesBackendFirst.mockResolvedValueOnce([closedPackage])
    readAssistantEngineeringConstraintPackagesBackendFirst.mockResolvedValueOnce([])
    const wrapper = mountScheduleBoard({
      ScheduleRecoveryHandoffPanel: {
        emits: ['close-handoff'],
        template: '<button type="button" class="close-handoff" @click="$emit(\'close-handoff\', \'assistant-recovery-1\')">close</button>',
      },
      ScheduleFeedbackPanel: false,
      ScheduleEventQueuePanel: false,
    })
    await flushPromises()

    await wrapper.get('.close-handoff').trigger('click')
    await flushPromises()

    expect(closeAssistantRecoveryPackage).toHaveBeenCalledWith('assistant-recovery-1', '调度员 李工')
    expect(readAssistantRecoveryPackagesBackendFirst).toHaveBeenCalledWith({ failLoud: true })
    expect(readAssistantEngineeringConstraintPackagesBackendFirst).toHaveBeenCalled()
    const suggestion = wrapper.get('.agent-suggestion')
    expect(suggestion.text()).toContain('Assistant 恢复交接闭环复核建议')
    expect(suggestion.text()).toContain('TRACE-AST-RECOVERY-CLOSED-001')
    expect(suggestion.text()).toContain('采购责任动作：采购已确认替代料到货')
    expect(suggestion.text()).toContain('质量责任动作：质量已完成 OP-20 复核')
    expect(suggestion.text()).toContain('OTD +6%')
    expect(suggestion.text()).toContain('延期 -1 单')
  })

  it('keeps the closed assistant recovery package visible when backend refresh omits it', async () => {
    const closedPackage = {
      id: 'assistant-recovery-1',
      title: 'Assistant 恢复交接',
      traceId: 'TRACE-AST-RECOVERY-001',
      closureTraceId: 'TRACE-AST-RECOVERY-CLOSED-001',
      otdImpact: '+6%',
      delayImpact: '-1 单',
      changeoverImpact: '+8min',
      purchaseActionSummary: '采购已确认替代料到货',
      qualityActionSummary: '质量已完成 OP-20 复核',
    }
    closeAssistantRecoveryPackage.mockReturnValueOnce(closedPackage)
    readAssistantRecoveryPackagesBackendFirst.mockResolvedValueOnce([])
    const wrapper = mountScheduleBoard({
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
      ScheduleFeedbackPanel: false,
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

  it('persists rush-order scenario fit and tradeoff in the adoption feedback trail', async () => {
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

    expect(writeScheduleFeedbackSnapshot).toHaveBeenCalledWith(expect.objectContaining({
      reasonDetail: expect.stringContaining('推荐方案：加班插入'),
    }))
    expect(writeScheduleFeedbackSnapshot).toHaveBeenCalledWith(expect.objectContaining({
      reasonDetail: expect.stringContaining('适用条件：锁定期内任务不可动，且夜班 CNC 有可用加班窗口'),
    }))
    expect(writeScheduleFeedbackSnapshot).toHaveBeenCalledWith(expect.objectContaining({
      reasonDetail: expect.stringContaining('取舍代价：增加 20min 换线与夜班加班成本'),
    }))
    expect(writeScheduleFeedbackSnapshot).toHaveBeenCalledWith(expect.objectContaining({
      reasonDetail: expect.stringContaining('未选方案：强插当前窗口'),
    }))
    expect(writeScheduleFeedbackSnapshot).toHaveBeenCalledWith(expect.objectContaining({
      reasonDetail: expect.stringContaining('换设备插入'),
    }))
    expect(submitAdoptionFeedback).toHaveBeenCalledWith(expect.objectContaining({
      reasonDetail: expect.stringContaining('适用条件：锁定期内任务不可动，且夜班 CNC 有可用加班窗口'),
    }))
    expect(submitAdoptionFeedback).toHaveBeenCalledWith(expect.objectContaining({
      reasonDetail: expect.stringContaining('取舍代价：增加 20min 换线与夜班加班成本'),
    }))
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
