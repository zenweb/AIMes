import { flushPromises, mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import ReportBoard from '../../src/components/report/ReportBoard.vue'

const getReportDashboard = vi.hoisted(() => vi.fn())
const getLatestAdoptionFeedback = vi.hoisted(() => vi.fn())
const downloadCsv = vi.hoisted(() => vi.fn())
const readCustomerOrderImportEvidenceBackendFirst = vi.hoisted(() => vi.fn())
const readCustomerEquipmentFaultEvidenceBackendFirst = vi.hoisted(() => vi.fn())
const readScheduleFeedbackSnapshot = vi.hoisted(() => vi.fn())
const readPocReviewSignoffRecordBackendFirst = vi.hoisted(() => vi.fn())
const readPocRolloutPackageRecordBackendFirst = vi.hoisted(() => vi.fn())
const readPocPilotRunRecordBackendFirst = vi.hoisted(() => vi.fn())
const writePocRolloutPackageRecord = vi.hoisted(() => vi.fn())
const writePocPilotRunRecord = vi.hoisted(() => vi.fn())
const writePocHypercareAcceptanceRecord = vi.hoisted(() => vi.fn())
const readPocHypercareAcceptanceRecordBackendFirst = vi.hoisted(() => vi.fn())
const writePocReviewSignoffRecord = vi.hoisted(() => vi.fn())
const writeOtdKpiCommitmentPackage = vi.hoisted(() => vi.fn())
const readOtdEvidenceChainRecordsBackendFirst = vi.hoisted(() => vi.fn())
const readOutsourcingCommitmentPackagesBackendFirst = vi.hoisted(() => vi.fn())
const readQualityReworkImpactBackendFirst = vi.hoisted(() => vi.fn())
const readQualityCapaClosureBackendFirst = vi.hoisted(() => vi.fn())
const readQualityMrbDispositionRecordBackendFirst = vi.hoisted(() => vi.fn())
const readRiskSlaReviewRecordBackendFirst = vi.hoisted(() => vi.fn())
const buildQualityKnowledgeRecommendationExperimentCandidateRecords = vi.hoisted(() => vi.fn(() => []))
const buildQualityKnowledgeGrayReleaseMonitorRecords = vi.hoisted(() => vi.fn(() => []))
const buildQualityKnowledgeRecommendationExperimentComparisonRecords = vi.hoisted(() => vi.fn(() => []))
const readQualityKnowledgeGrayReleaseDecisionRecordsBackendFirst = vi.hoisted(() => vi.fn())

vi.mock('../../src/api/report', () => ({
  getReportDashboard,
}))

vi.mock('../../src/api/scheduling', () => ({
  getLatestAdoptionFeedback,
}))

vi.mock('../../src/composables/useExport', () => ({
  useExport: () => ({
    csvFilename: (name: string) => `${name}.csv`,
    downloadCsv,
  }),
}))

vi.mock('../../src/utils/quality-rework-sync', () => ({
  readQualityReworkImpactBackendFirst,
}))

vi.mock('../../src/utils/quality-capa-sync', () => ({
  readQualityCapaClosureBackendFirst,
}))

vi.mock('../../src/utils/quality-mrb-disposition-sync', () => ({
  readQualityMrbDispositionRecordBackendFirst,
}))

vi.mock('../../src/utils/customer-order-import-sync', () => ({
  readCustomerOrderImportEvidenceBackendFirst,
}))

vi.mock('../../src/utils/equipment-risk-sync', () => ({
  readCustomerEquipmentFaultEvidenceBackendFirst,
}))

vi.mock('../../src/utils/poc-review-signoff-sync', () => ({
  readPocReviewSignoffRecordBackendFirst,
  writePocReviewSignoffRecord,
}))

vi.mock('../../src/utils/poc-rollout-package-sync', () => ({
  readPocRolloutPackageRecordBackendFirst,
  writePocRolloutPackageRecord,
}))

vi.mock('../../src/utils/poc-pilot-run-sync', () => ({
  readPocPilotRunRecordBackendFirst,
  writePocPilotRunRecord,
}))

vi.mock('../../src/utils/poc-hypercare-sync', () => ({
  readPocHypercareAcceptanceRecordBackendFirst,
  writePocHypercareAcceptanceRecord,
}))

vi.mock('../../src/utils/risk-sla-review-sync', () => ({
  readRiskSlaReviewRecordBackendFirst,
}))

vi.mock('../../src/utils/schedule-feedback-sync', () => ({
  readScheduleFeedbackSnapshot,
}))

vi.mock('../../src/utils/risk-action-sync', () => ({
  readRiskActionTracesBackendFirst: vi.fn(async () => []),
}))

vi.mock('../../src/utils/otd-evidence-chain-sync', () => ({
  readOtdEvidenceChainRecordsBackendFirst,
}))

vi.mock('../../src/utils/otd-kpi-commitment-sync', () => ({
  readOtdKpiCommitmentPackagesBackendFirst: vi.fn(async () => []),
  writeOtdKpiCommitmentPackage,
}))

vi.mock('../../src/utils/outsourcing-commitment-sync', () => ({
  readOutsourcingCommitmentPackagesBackendFirst,
  writeOutsourcingCommitmentPackage: vi.fn(),
}))

vi.mock('../../src/utils/offline-demo-mode', () => ({
  appAssetPath: (path: string) => path,
  isOfflineDemoError: (error: unknown) => error instanceof Error && error.name === 'OfflineDemoApiError',
}))

vi.mock('../../src/utils/local-user', () => ({
  getLocalUserReportActor: vi.fn(() => 'admin'),
}))

vi.mock('../../src/utils/quality-knowledge-sample-sync', () => ({
  buildQualityKnowledgeRecommendationExperimentCandidateRecords,
  buildQualityKnowledgeGrayReleaseMonitorRecords,
  buildQualityKnowledgeRecommendationExperimentComparisonRecords,
  readQualityKnowledgeGrayReleaseDecisionRecordsBackendFirst,
  readQualityKnowledgeRecommendationFeedbackRecordsBackendFirst: vi.fn(async () => []),
  readQualityKnowledgeRetrainingVersionRecordsBackendFirst: vi.fn(async () => []),
}))

function mountReportBoard() {
  return mount(ReportBoard, {
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

function reportDashboardFixture() {
  return {
    production: {
      totalWorkOrders: 48,
      completedOrders: 32,
      inProgressOrders: 12,
      onTimeRate: 0.85,
      dailyOutput: [{ label: '5/1', value: 20 }],
    },
    quality: {
      passRate: 0.976,
      defectRate: 0.024,
      totalInspections: 1250,
      defectCount: 30,
      dailyDefects: [{ label: '5/1', value: 2 }],
    },
    equipment: {
      totalEquipment: 24,
      runningCount: 18,
      utilizationRate: 0.78,
      availabilityRate: 0.94,
      utilizationTrend: [{ label: '第1周', value: 72 }],
    },
    anomaly: {
      totalAnomalies: 36,
      openCount: 5,
      resolvedCount: 28,
      avgResolveHours: 3.5,
      anomalyByType: [{ label: '设备', value: 14 }],
    },
  }
}

function pocReviewSignoffFixture() {
  return {
    id: 'poc-review-signoff-20260520',
    meetingId: 'POC-REVIEW-20260520-001',
    targetCustomer: '离散制造工厂 POC',
    totalScore: 96,
    passScore: 85,
    result: 'approved',
    signedBy: '项目经理 / 客户代表',
    signedAt: '2026-05-20T00:00:00.000Z',
    reviewers: ['客户厂长', 'MES 项目经理'],
    evidenceBatches: ['IMP-POC-WO-20260520-001', 'IMP-POC-EQ-FAULT-20260520-001'],
    auditId: 'AUD-POC-REVIEW-20260520',
    summary: 'POC 验收证据齐套，评分达到通过线，进入复盘签署。',
  }
}

function pocRolloutPackageFixture() {
  return {
    id: 'poc-rollout-package-20260521',
    title: 'POC 成功转上线交付行动包',
    targetCustomer: '离散制造工厂 POC',
    sourceMeetingId: 'POC-REVIEW-20260520-001',
    sourceAuditId: 'AUD-POC-REVIEW-20260520',
    status: 'ready',
    statusLabel: '待客户交付启动会确认',
    rolloutWindow: 'T+7 天完成试点上线准备，T+14 天进入首批真实工单运行',
    goLiveGate: 'POC 评分通过、客户工单/设备样例齐套、OTD 证据链可审计',
    owner: '交付经理 / 客户厂长 / IT 负责人',
    successCriteria: ['首批真实工单 >= 30 单'],
    actions: [{
      module: '现场运行',
      owner: '调度主管 / 班组长',
      action: '用首批真实工单跑通排产建议采纳、现场执行和异常回写。',
      dueAt: 'T+7',
      evidence: 'TRACE-POC-ROLLOUT-PILOT-RUN-20260521',
    }],
    auditId: 'AUD-POC-ROLLOUT-20260521',
    traceId: 'TRACE-POC-ROLLOUT-DELIVERY-PACKAGE-20260521',
    createdAt: '2026-05-21T00:00:00.000Z',
    summary: 'POC 已从签署进入试点上线准备。',
  }
}

function pocPilotRunFixture() {
  return {
    id: 'poc-pilot-run-20260521',
    title: 'POC 首批真实工单试点运行确认',
    targetCustomer: '离散制造工厂 POC',
    sourcePackageId: 'poc-rollout-package-20260521',
    sourceAuditId: 'AUD-POC-ROLLOUT-20260521',
    status: 'closed',
    statusLabel: '首批真实工单已跑通',
    runWindow: 'T+14 首批真实工单上线班次',
    batchId: 'PILOT-WO-BATCH-20260521-001',
    sampleSize: 30,
    otdTarget: '>= 96%',
    actualOtd: '97%',
    owner: '调度主管 / 生产班组长 / 交付经理',
    workOrders: [{
      workOrderNumber: 'WO-PILOT-2101',
      productName: '急单阀体组件',
      quantity: 12,
      route: 'CNC 精加工 -> OP-20 装配 -> 首件复检',
      scheduleDecision: '采纳 Agent 锁定期后插入建议',
      executionStatus: '已完工回写',
    }],
    checkpoints: [{
      module: 'AI 排产',
      owner: '调度主管',
      status: 'closed',
      evidence: 'TRACE-POC-PILOT-SCHEDULE-20260521',
      summary: '30 单真实工单已生成排产建议并闭环。',
    }],
    acceptanceCriteria: ['30 单真实工单样本全部完成排产建议、人工确认和执行回写。'],
    auditId: 'AUD-POC-PILOT-RUN-20260521',
    traceId: 'TRACE-POC-PILOT-RUN-CLOSED-20260521',
    createdAt: '2026-05-21T00:00:00.000Z',
    summary: '首批 30 单真实工单已跑通。',
  }
}

function qualityMrbDispositionFixture() {
  return {
    id: 'quality-mrb-disposition-20260615',
    title: 'WO-004 装配间隙超差 MRB 处置决策',
    inspectionId: 'INS-MRB-004',
    workOrderId: 'WO-004',
    productCode: 'PRD-ASM-004',
    processName: '装配终检',
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
    otdImpact: 'WO-004 延期 +2 单风险，补料后恢复交付承诺',
    scheduleImpact: '冻结 WO-004 原装配窗口，插入 MAT-STEEL-A12 补料 ETA、返工替代工单和终检复验窗口。',
    recommendedAction: '建议先隔离 4 件不合格品并判废，采购补齐 MAT-STEEL-A12，排产重建 WO-004 装配与复检窗口。',
    auditId: 'AUD-QA-MRB-DISPOSITION-20260615',
    traceId: 'TRACE-QA-WO-004-MRB-DISPOSITION-20260615',
    scheduleTraceId: 'TRACE-QA-WO-004-MRB-SCHEDULE-20260615',
    createdAt: '2026-06-15T08:00:00.000Z',
    closureAuditId: 'AUD-QA-MRB-CLOSURE-20260615',
    closureTraceId: 'TRACE-QA-WO-004-MRB-CLOSURE-20260615',
    closureSummary: '质量隔离、补料 ETA、排产重建和客户说明均已确认。',
    closedAt: '2026-06-15T10:00:00.000Z',
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
        module: '排产',
        owner: '生产经理',
        action: '冻结原装配窗口并重排补料后装配/复检',
        dueAt: '今日 15:00',
        evidence: 'SCHED-MRB-WO-004-REBUILD',
        result: '原装配窗口已冻结并重建',
      },
    ],
  }
}

function riskSlaReviewFixture() {
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
    risks: [
      {
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
      },
    ],
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

function qualityGrayReleaseMonitorFixture() {
  return {
    id: 'quality-gray-monitor-r4',
    title: 'R4 质量推荐灰度监控',
    trainingSetVersion: 'R4',
    targetWorkOrderId: 'WO-QA-101',
    operationCode: 'OP-20',
    publishedAt: '2026-06-15T08:00:00.000Z',
    releaseCycleLabel: '首次灰度发布',
    statusLabel: '灰度稳定',
    statusClass: 'accepted',
    versionLabel: 'R4 / 首次灰度',
    scopeLabel: '装配终检 / 高风险工单',
    recommendationScope: ['OP-20 装配复检', 'OP-30 终检'],
    adoptionRateLabel: '88%',
    recheckPassRateLabel: '96%',
    falseRecallLabel: '1.2%',
    negativeSampleLabel: '18 个负样本',
    summary: 'R4 在高风险装配工单中稳定提升复验通过率，误召回保持在门禁内。',
    auditId: 'AUD-QA-GRAY-R4-20260615',
    traceId: 'TRACE-QA-GRAY-R4-20260615',
    metrics: [
      { label: '推荐采纳率', value: '88%', statusClass: 'accepted' },
      { label: '复验通过率', value: '96%', statusClass: 'accepted' },
    ],
  }
}

function qualityGrayReleaseDecisionFixtures() {
  return [
    {
      id: 'quality-gray-decision-r4-expand',
      monitorId: 'quality-gray-monitor-r4',
      trainingSetVersion: 'R4',
      targetWorkOrderId: 'WO-QA-101',
      operationCode: 'OP-20',
      releaseCycleLabel: '首次灰度发布',
      releaseAuditId: 'AUD-QA-GRAY-R4-RELEASE-20260615',
      releaseTraceId: 'TRACE-QA-GRAY-R4-RELEASE-20260615',
      releaseScopeLabel: '装配终检 / 高风险工单',
      decision: 'expanded',
      decisionLabel: '扩大灰度',
      statusClass: 'accepted',
      decidedBy: '质量经理',
      decidedAt: '2026-06-15T10:00:00.000Z',
      auditId: 'AUD-QA-GRAY-R4-DECISION-20260615',
      traceId: 'TRACE-QA-GRAY-R4-DECISION-20260615',
      reason: '采纳率和复验通过率连续两班达标，扩大到 OP-30 终检。',
      approvalStatus: 'approved',
      approvalLabel: '主管已确认',
      approvedBy: '质量总监',
      approvedAt: '2026-06-15T10:30:00.000Z',
      expansionScope: ['OP-30 终检', '夜班高风险工单'],
      metricSnapshot: [
        { label: '采纳率', value: '88%' },
        { label: '复验通过率', value: '96%' },
      ],
      actions: ['扩大到 OP-30 终检', '保留夜班监控'],
    },
    {
      id: 'quality-gray-decision-r5-rollback',
      monitorId: 'quality-gray-monitor-r5',
      trainingSetVersion: 'R5',
      targetWorkOrderId: 'WO-QA-205',
      operationCode: 'OP-30',
      releaseCycleLabel: '重新灰度发布',
      releaseAuditId: 'AUD-QA-GRAY-R5-RELEASE-20260615',
      releaseTraceId: 'TRACE-QA-GRAY-R5-RELEASE-20260615',
      releaseScopeLabel: '终检异常样本',
      decision: 'rolled_back',
      decisionLabel: '回滚并补负样本',
      statusClass: 'guarded',
      decidedBy: '质量经理',
      decidedAt: '2026-06-15T11:00:00.000Z',
      auditId: 'AUD-QA-GRAY-R5-DECISION-20260615',
      traceId: 'TRACE-QA-GRAY-R5-DECISION-20260615',
      reason: '负样本误召回高于门禁，回滚 R5 并补齐误召回样本。',
      approvalStatus: 'pending',
      approvalLabel: '待主管确认',
      rollbackTargetVersion: 'R4',
      reviewIssueId: 'QA-GRAY-R5-ISSUE-001',
      reviewIssueTraceId: 'TRACE-QA-GRAY-R5-ISSUE-001',
      reviewIssueStatus: 'open',
      reviewIssueLabel: '待补负样本',
      metricSnapshot: [
        { label: '误召回', value: '4.8%' },
        { label: '覆盖缺口', value: '12 件' },
      ],
      actions: ['回滚到 R4', '补齐 R5 负样本'],
    },
  ]
}

function qualityExperimentComparisonFixture() {
  return {
    id: 'quality-experiment-r4',
    title: 'R4 灰度实验优于 R3',
    trainingSetVersion: 'R4',
    targetWorkOrderId: 'WO-QA-101',
    operationCode: 'OP-20',
    releaseCycleLabel: '首次灰度发布',
    releaseScopeLabel: '装配终检 / 高风险工单',
    recommendationScope: ['OP-20 装配复检'],
    statusLabel: '实验胜出',
    statusClass: 'accepted',
    decisionLabel: '进入扩大灰度',
    decisionStatusClass: 'accepted',
    adoptionRateLabel: '88%',
    recheckPassRateLabel: '96%',
    falseRecallLabel: '1.2%',
    effectTrendLabel: '持续改善',
    experimentScoreLabel: '92',
    gatePolicyLabel: '采纳 >= 85% 且误召回 <= 2%',
    gateAuditLabel: 'AUD-QA-GATE-R4-20260615',
    gatePassLabel: '通过',
    feedbackAuditLabel: 'AUD-QA-FEEDBACK-R4-20260615',
    feedbackTraceLabel: 'TRACE-QA-FEEDBACK-R4-20260615',
    releaseAuditId: 'AUD-QA-GRAY-R4-RELEASE-20260615',
    releaseTraceId: 'TRACE-QA-GRAY-R4-RELEASE-20260615',
    decisionAuditId: 'AUD-QA-GRAY-R4-DECISION-20260615',
    decisionTraceId: 'TRACE-QA-GRAY-R4-DECISION-20260615',
    summary: 'R4 在灰度实验中采纳、复验和误召回均优于 R3。',
  }
}

function qualityExperimentCandidateFixture() {
  return {
    id: 'quality-experiment-candidate-r6',
    title: 'R6 负样本补丁影子验证',
    candidateTrainingSetVersion: 'R6',
    sourceTrainingSetVersion: 'R5',
    targetWorkOrderId: 'WO-QA-205',
    operationCode: 'OP-30',
    candidateType: 'negative_sample_patch',
    statusLabel: '影子验证中',
    statusClass: 'logged',
    triggerLabel: 'R5 回滚后补负样本',
    negativeCoverageLabel: '24 件',
    coveragePercentLabel: '92%',
    gapLabel: '还差 2 件边界样本',
    adoptionRateLabel: '84%',
    recheckPassRateLabel: '94%',
    falseRecallLabel: '1.8%',
    gatePolicyLabel: '影子验证两班后再灰度',
    sourceAuditId: 'AUD-QA-GRAY-R5-DECISION-20260615',
    sourceTraceId: 'TRACE-QA-GRAY-R5-DECISION-20260615',
    auditId: 'AUD-QA-CANDIDATE-R6-20260615',
    traceId: 'TRACE-QA-CANDIDATE-R6-20260615',
    nextAction: '补齐 2 件边界样本后重新进入灰度前校验。',
    summary: 'R6 聚焦 R5 误召回负样本补丁，先以影子模式验证。',
    references: ['QA-GRAY-R5-ISSUE-001'],
  }
}

function pocHypercareAcceptanceFixture() {
  return {
    id: 'poc-hypercare-acceptance-20260615',
    title: 'POC 正式上线验收与 Hypercare 稳定运行监控包',
    targetCustomer: '离散制造工厂 POC',
    sourcePilotRunId: 'poc-pilot-run-20260521',
    sourcePilotAuditId: 'AUD-POC-PILOT-RUN-20260521',
    status: 'active',
    statusLabel: 'Hypercare 7 天稳定运行中',
    goLiveWindow: 'T+15 正式上线，T+21 完成 7 天 Hypercare 验收',
    hypercareDays: 7,
    otdTarget: '>= 96%',
    actualOtd: '97%',
    oeeTarget: '>= 78%',
    currentOee: '82%',
    incidentCount: 1,
    unresolvedP1P2: 0,
    acceptanceGate: '首批真实工单 OTD >= 96%、P1/P2 未关闭事件 = 0、审计导出可交付',
    owner: '客户厂长 / 交付经理 / 调度主管',
    monitors: [
      {
        label: 'OTD 稳定性',
        target: '>= 96%',
        current: '97%',
        status: 'stable',
        statusLabel: '达标',
        evidence: 'TRACE-POC-HYPERCARE-OTD-20260615',
      },
      {
        label: '异常告警',
        target: 'P1/P2 未关闭 = 0',
        current: '0 个未关闭，1 个 P3 已派单',
        status: 'watch',
        statusLabel: '持续观察',
        evidence: 'TRACE-POC-HYPERCARE-INCIDENT-20260615',
      },
    ],
    checkpoints: [
      {
        module: '生产概览',
        owner: '客户厂长',
        action: '在首页指挥中心复核上线后 OTD、P1/P2 事件和负责人。',
        status: 'active',
        evidence: 'TRACE-POC-HYPERCARE-DASHBOARD-20260615',
        summary: '正式上线状态进入生产概览。',
      },
      {
        module: '治理审计',
        owner: '交付经理 / 项目经理',
        action: '导出上线验收、指标快照、责任动作和审计追踪给客户复盘。',
        status: 'active',
        evidence: 'TRACE-POC-HYPERCARE-AUDIT-20260615',
        summary: '上线验收记录写入统一 OTD 证据链。',
      },
    ],
    auditId: 'AUD-POC-HYPERCARE-20260615',
    traceId: 'TRACE-POC-HYPERCARE-ACCEPTANCE-20260615',
    createdAt: '2026-06-15T11:00:00.000Z',
    summary: '离散制造工厂 POC 已从首批真实工单试点进入正式上线验收，Hypercare 监控跟踪 OTD 97%、OEE 82%、P1/P2 未关闭 0 个。',
  }
}

describe('ReportBoard', () => {
  beforeEach(() => {
    getReportDashboard.mockRejectedValue(new Error('offline'))
    getLatestAdoptionFeedback.mockResolvedValue(null)
    downloadCsv.mockReset()
    readCustomerOrderImportEvidenceBackendFirst.mockResolvedValue(null)
    readCustomerEquipmentFaultEvidenceBackendFirst.mockResolvedValue(null)
    readScheduleFeedbackSnapshot.mockReturnValue(null)
    readPocReviewSignoffRecordBackendFirst.mockResolvedValue(null)
    readPocRolloutPackageRecordBackendFirst.mockResolvedValue(null)
    readPocPilotRunRecordBackendFirst.mockResolvedValue(null)
    readPocHypercareAcceptanceRecordBackendFirst.mockResolvedValue(null)
    readOtdEvidenceChainRecordsBackendFirst.mockResolvedValue([])
    readOutsourcingCommitmentPackagesBackendFirst.mockResolvedValue([])
    readQualityReworkImpactBackendFirst.mockResolvedValue(null)
    readQualityCapaClosureBackendFirst.mockResolvedValue(null)
    readQualityMrbDispositionRecordBackendFirst.mockResolvedValue(null)
    readRiskSlaReviewRecordBackendFirst.mockResolvedValue(null)
    buildQualityKnowledgeGrayReleaseMonitorRecords.mockReturnValue([])
    buildQualityKnowledgeRecommendationExperimentComparisonRecords.mockReturnValue([])
    buildQualityKnowledgeRecommendationExperimentCandidateRecords.mockReturnValue([])
    readQualityKnowledgeGrayReleaseDecisionRecordsBackendFirst.mockResolvedValue([])
    writePocRolloutPackageRecord.mockReset()
    writePocPilotRunRecord.mockReset()
    writePocHypercareAcceptanceRecord.mockReset()
    writePocReviewSignoffRecord.mockReset()
    writeOtdKpiCommitmentPackage.mockReset()
    vi.stubGlobal('fetch', vi.fn(async () => ({
      ok: false,
      json: async () => null,
    })))
  })

  it('marks the active OTD KPI dimension tab for assistive technology', async () => {
    const wrapper = mountReportBoard()
    await flushPromises()

    const tablist = wrapper.get('[aria-label="OTD KPI 钻取维度"]')
    const tabs = tablist.findAll('[role="tab"]')
    expect(tabs.map(tab => tab.text())).toEqual(['客户', '产线', '产品族', '时间窗口'])
    expect(tabs[0].attributes('aria-selected')).toBe('true')

    await tabs[1].trigger('click')
    await flushPromises()

    expect(tabs[0].attributes('aria-selected')).toBe('false')
    expect(tabs[1].attributes('aria-selected')).toBe('true')
  })

  it('keeps loading the dashboard when optional POC evidence is unavailable', async () => {
    readCustomerOrderImportEvidenceBackendFirst.mockRejectedValueOnce(new Error('customer import evidence unavailable'))
    getReportDashboard.mockResolvedValueOnce(reportDashboardFixture())

    const wrapper = mountReportBoard()
    await flushPromises()

    expect(getReportDashboard).toHaveBeenCalled()
    expect(wrapper.text()).toContain('工单总数')
    expect(wrapper.text()).toContain('48')
  })

  it('aggregates optional report evidence failures into one fail-loud alert', async () => {
    readCustomerOrderImportEvidenceBackendFirst.mockRejectedValueOnce(new Error('customer import evidence unavailable'))
    readCustomerEquipmentFaultEvidenceBackendFirst.mockRejectedValueOnce(new Error('equipment fault evidence unavailable'))
    readOtdEvidenceChainRecordsBackendFirst.mockRejectedValueOnce(new Error('otd evidence chain unavailable'))
    getReportDashboard.mockResolvedValueOnce(reportDashboardFixture())

    const wrapper = mountReportBoard()
    await flushPromises()

    const alerts = wrapper.findAll('[role="alert"]')
    expect(alerts).toHaveLength(1)
    expect(alerts[0].text()).toContain('报表证据加载失败')
    expect(alerts[0].text()).toContain('客户工单导入证据加载失败：customer import evidence unavailable')
    expect(alerts[0].text()).toContain('客户设备故障证据加载失败：equipment fault evidence unavailable')
    expect(alerts[0].text()).toContain('OTD 证据链加载失败：otd evidence chain unavailable')
    expect(wrapper.text()).toContain('工单总数')
    expect(wrapper.text()).toContain('48')
  })

  it('keeps report evidence quiet when offline demo skips latest adoption feedback backend read', async () => {
    const offlineDemoError = new Error('Offline demo mode skipped backend request: /api/v1/scheduling/adoption-feedback/latest')
    offlineDemoError.name = 'OfflineDemoApiError'
    getLatestAdoptionFeedback.mockRejectedValueOnce(offlineDemoError)
    readScheduleFeedbackSnapshot.mockReturnValueOnce(null)
    getReportDashboard.mockResolvedValueOnce(reportDashboardFixture())

    const wrapper = mountReportBoard()
    await flushPromises()

    expect(wrapper.find('[role="alert"]').exists()).toBe(false)
    expect(wrapper.text()).not.toContain('Offline demo mode skipped backend request')
    expect(wrapper.text()).not.toContain('报表证据加载失败')
    expect(wrapper.text()).toContain('工单总数')
    expect(wrapper.text()).toContain('48')
  })

  it('keeps report startup quiet when optional latest records are missing in the backend', async () => {
    readQualityReworkImpactBackendFirst.mockResolvedValueOnce(null)
    readQualityCapaClosureBackendFirst.mockResolvedValueOnce(null)
    readQualityMrbDispositionRecordBackendFirst.mockResolvedValueOnce(null)
    readCustomerOrderImportEvidenceBackendFirst.mockResolvedValueOnce(null)
    readCustomerEquipmentFaultEvidenceBackendFirst.mockResolvedValueOnce(null)
    readPocReviewSignoffRecordBackendFirst.mockResolvedValueOnce(null)
    readPocRolloutPackageRecordBackendFirst.mockResolvedValueOnce(null)
    readPocPilotRunRecordBackendFirst.mockResolvedValueOnce(null)
    readPocHypercareAcceptanceRecordBackendFirst.mockResolvedValueOnce(null)
    readRiskSlaReviewRecordBackendFirst.mockResolvedValueOnce(null)
    getLatestAdoptionFeedback.mockResolvedValueOnce(null)
    getReportDashboard.mockResolvedValueOnce(reportDashboardFixture())

    const wrapper = mountReportBoard()
    await flushPromises()

    expect(wrapper.find('[role="alert"]').exists()).toBe(false)
    expect(wrapper.text()).not.toContain('报表证据加载失败')
    expect(wrapper.text()).not.toContain('Request failed with status code 404')
    expect(wrapper.text()).toContain('工单总数')
    expect(wrapper.text()).toContain('48')
  })

  it('keeps report evidence load failures visible after a successful CSV export', async () => {
    readCustomerOrderImportEvidenceBackendFirst.mockRejectedValueOnce(new Error('customer import evidence unavailable'))
    getReportDashboard.mockResolvedValueOnce(reportDashboardFixture())
    const wrapper = mountReportBoard()
    await flushPromises()

    expect(wrapper.get('[role="alert"]').text()).toContain('报表证据加载失败')

    const csvButton = wrapper.findAll('.btn-export').find(button => button.text() === 'CSV')
    expect(csvButton).toBeTruthy()
    await csvButton!.trigger('click')
    await flushPromises()

    expect(downloadCsv).toHaveBeenCalled()
    const alert = wrapper.get('[role="alert"]')
    expect(alert.text()).toContain('报表证据加载失败')
    expect(alert.text()).toContain('客户工单导入证据加载失败：customer import evidence unavailable')
  })

  it('surfaces quality rework impact evidence in the OTD review report', async () => {
    readQualityReworkImpactBackendFirst.mockResolvedValueOnce({
      inspectionId: 'INS-REWORK-001',
      workOrderId: 'WO-RUSH-9001',
      productCode: 'PROD-RUSH-01',
      processName: 'CNC 精加工',
      equipmentCode: 'CNC-002',
      materialBatchCode: 'MAT-AL6061-B03',
      batchCode: 'WO-RUSH-9001-FIRST',
      inspectionPoint: '首件尺寸复检',
      defectQuantity: 2,
      reworkHours: 6,
      otdImpact: 'WO-RUSH-9001 延期 +1 单风险',
      recommendedAction: '建议插入返工与复验窗口，锁定质检复验时间。',
      rootCause: '尺寸超差 / 工序控制失稳',
      evidence: ['首件尺寸复检 检验结果 rework', 'CNC-002 关联工序 CNC 精加工'],
      createdAt: '2026-06-15T09:30:00.000Z',
    })
    getReportDashboard.mockResolvedValueOnce(reportDashboardFixture())

    const wrapper = mountReportBoard()
    await flushPromises()

    const report = wrapper.get('.quality-rework-report')
    expect(report.text()).toContain('质量返工影响')
    expect(report.text()).toContain('WO-RUSH-9001 返工对 OTD 的影响')
    expect(report.text()).toContain('建议插入返工与复验窗口，锁定质检复验时间。')
    expect(report.text()).toContain('CNC 精加工')
    expect(report.text()).toContain('6h 返工窗口')
    expect(report.text()).toContain('WO-RUSH-9001 延期 +1 单风险')
    expect(wrapper.find('[role="alert"]').exists()).toBe(false)
  })

  it('surfaces quality CAPA closure evidence in the OTD review report', async () => {
    readQualityCapaClosureBackendFirst.mockResolvedValueOnce({
      inspectionId: 'QI-CAPA-9001',
      workOrderId: 'WO-RUSH-9001',
      traceId: 'TRACE-QA-CAPA-WO-RUSH-9001',
      rootCause: '夹具磨损导致首件尺寸偏移',
      evidenceStrength: 0.92,
      taskTitle: 'WO-RUSH-9001 首件尺寸 CAPA 关闭验证',
      taskKind: 'fixture-corrective-action',
      owner: '质量工程师',
      dueAt: '2026-06-15T10:00:00.000Z',
      verification: '首件复检通过，返工批次恢复放行',
      verifiedAt: '2026-06-15T09:45:00.000Z',
      auditState: 'CAPA 已验证，根因证据、责任人、验证标准和 OTD 复盘已归档',
      otdImpact: 'WO-RUSH-9001 返工批次恢复交付节拍',
      reviewAction: 'CAPA 已关闭，OTD 复盘按恢复后的返工窗口更新承诺。',
    })
    getReportDashboard.mockResolvedValueOnce(reportDashboardFixture())

    const wrapper = mountReportBoard()
    await flushPromises()

    const report = wrapper.get('.quality-capa-report')
    expect(report.text()).toContain('CAPA 验证回写')
    expect(report.text()).toContain('WO-RUSH-9001 质量 CAPA 已进入 OTD 复盘')
    expect(report.text()).toContain('CAPA 已关闭，OTD 复盘按恢复后的返工窗口更新承诺。')
    expect(report.text()).toContain('夹具磨损导致首件尺寸偏移')
    expect(report.text()).toContain('92% 证据强度')
    expect(report.text()).toContain('WO-RUSH-9001 返工批次恢复交付节拍')
    expect(wrapper.find('[role="alert"]').exists()).toBe(false)
  })

  it('exports quality CAPA closure review evidence with the CSV report pack', async () => {
    readQualityCapaClosureBackendFirst.mockResolvedValueOnce({
      inspectionId: 'QI-CAPA-9001',
      workOrderId: 'WO-RUSH-9001',
      traceId: 'TRACE-QA-CAPA-WO-RUSH-9001',
      rootCause: '夹具磨损导致首件尺寸偏移',
      evidenceStrength: 0.92,
      taskTitle: 'WO-RUSH-9001 首件尺寸 CAPA 关闭验证',
      taskKind: 'fixture-corrective-action',
      owner: '质量工程师',
      dueAt: '2026-06-15T10:00:00.000Z',
      verification: '首件复检通过，返工批次恢复放行',
      verifiedAt: '2026-06-15T09:45:00.000Z',
      auditState: 'CAPA 已验证，根因证据、责任人、验证标准和 OTD 复盘已归档',
      otdImpact: 'WO-RUSH-9001 返工批次恢复交付节拍',
      reviewAction: 'CAPA 已关闭，OTD 复盘按恢复后的返工窗口更新承诺。',
    })
    getReportDashboard.mockResolvedValueOnce(reportDashboardFixture())

    const wrapper = mountReportBoard()
    await flushPromises()

    const csvButton = wrapper.findAll('.btn-export').find(button => button.text() === 'CSV')
    expect(csvButton).toBeTruthy()

    await csvButton!.trigger('click')
    await flushPromises()

    expect(downloadCsv).toHaveBeenCalledWith(
      '报表.csv',
      expect.any(Array),
      expect.arrayContaining([
        ['质量CAPA', '复盘动作', 'CAPA 已关闭，OTD 复盘按恢复后的返工窗口更新承诺。'],
        ['质量CAPA', '根因与证据强度', '夹具磨损导致首件尺寸偏移 / 92% / 质量工程师'],
        ['质量CAPA', '审计编号', 'TRACE-QA-CAPA-WO-RUSH-9001'],
      ])
    )
  })

  it('surfaces quality MRB disposition closure evidence in the OTD review report and CSV pack', async () => {
    readQualityMrbDispositionRecordBackendFirst.mockResolvedValueOnce(qualityMrbDispositionFixture())
    getReportDashboard.mockResolvedValueOnce(reportDashboardFixture())

    const wrapper = mountReportBoard()
    await flushPromises()

    const report = wrapper.get('.quality-mrb-report')
    expect(report.text()).toContain('质量 MRB 处置')
    expect(report.text()).toContain('WO-004 MRB 报废补料进入 OTD 复盘')
    expect(report.text()).toContain('冻结 WO-004 原装配窗口')
    expect(report.text()).toContain('报废补料重建 / MRB 处置已闭环')
    expect(report.text()).toContain('4 件报废补料')
    expect(report.text()).toContain('WO-004 延期 +2 单风险，补料后恢复交付承诺')
    expect(report.text()).toContain('TRACE-QA-WO-004-MRB-CLOSURE-20260615')

    const csvButton = wrapper.findAll('.btn-export').find(button => button.text() === 'CSV')
    expect(csvButton).toBeTruthy()

    await csvButton!.trigger('click')
    await flushPromises()

    expect(downloadCsv).toHaveBeenCalledWith(
      '报表.csv',
      expect.any(Array),
      expect.arrayContaining([
        ['质量MRB处置', '标题', 'WO-004 装配间隙超差 MRB 处置决策'],
        ['质量MRB处置', 'OTD影响', 'WO-004 延期 +2 单风险，补料后恢复交付承诺'],
        ['质量MRB处置', '闭环追踪', 'AUD-QA-MRB-CLOSURE-20260615 / TRACE-QA-WO-004-MRB-CLOSURE-20260615'],
        ['质量MRB处置', '闭环结论', '质量隔离、补料 ETA、排产重建和客户说明均已确认。'],
        ['质量MRB动作', '排产 / 生产经理', '冻结原装配窗口并重排补料后装配/复检 / 今日 15:00 / SCHED-MRB-WO-004-REBUILD / 原装配窗口已冻结并重建'],
      ])
    )
    expect(wrapper.find('[role="alert"]').exists()).toBe(false)
  })

  it('surfaces risk SLA closure evidence in the OTD review report and CSV pack', async () => {
    readRiskSlaReviewRecordBackendFirst.mockResolvedValueOnce(riskSlaReviewFixture())
    getReportDashboard.mockResolvedValueOnce(reportDashboardFixture())

    const wrapper = mountReportBoard()
    await flushPromises()

    const report = wrapper.get('.risk-sla-report')
    expect(report.text()).toContain('风险 SLA 复核')
    expect(report.text()).toContain('RISK-DAILY-20260615-001 晨会责任动作进入 OTD 复盘')
    expect(report.text()).toContain('生产经理已确认 4 项责任动作全部闭环')
    expect(report.text()).toContain('逾期 2 项 / 关键 3 项')
    expect(report.text()).toContain('+6% OTD 恢复动作已锁定')
    expect(report.text()).toContain('TRACE-RISK-SLA-DAILY-REVIEW-CLOSED-20260615')

    const csvButton = wrapper.findAll('.btn-export').find(button => button.text() === 'CSV')
    expect(csvButton).toBeTruthy()

    await csvButton!.trigger('click')
    await flushPromises()

    expect(downloadCsv).toHaveBeenCalledWith(
      '报表.csv',
      expect.any(Array),
      expect.arrayContaining([
        ['风险SLA复核', '标题', '风险 SLA 逾期晨会复核包'],
        ['风险SLA复核', '闭环追踪', 'AUD-RISK-SLA-CLOSURE-20260615 / TRACE-RISK-SLA-DAILY-REVIEW-CLOSED-20260615'],
        ['风险SLA复核', '闭环结论', '生产经理已确认 4 项责任动作全部闭环，未关闭项转入日终复盘跟踪。'],
        ['风险SLA风险项', '缺料 / AL-6061 今日短缺', '采购主管 / 立即 / 预计影响 2 单'],
        ['风险SLA责任动作', '采购协同 / 采购主管', '确认 AL-6061 替代承诺或加急到货窗口。 / 今日 11:00 / TRACE-RISK-SLA-PURCHASE-COMMIT-20260615 / AL-6061 替代承诺已确认。'],
      ])
    )
    expect(wrapper.find('[role="alert"]').exists()).toBe(false)
  })

  it('surfaces quality gray release and experiment governance evidence in the report and CSV pack', async () => {
    buildQualityKnowledgeGrayReleaseMonitorRecords.mockReturnValue([qualityGrayReleaseMonitorFixture()])
    readQualityKnowledgeGrayReleaseDecisionRecordsBackendFirst.mockResolvedValueOnce(qualityGrayReleaseDecisionFixtures())
    buildQualityKnowledgeRecommendationExperimentComparisonRecords.mockReturnValue([qualityExperimentComparisonFixture()])
    buildQualityKnowledgeRecommendationExperimentCandidateRecords.mockReturnValue([qualityExperimentCandidateFixture()])
    getReportDashboard.mockResolvedValueOnce(reportDashboardFixture())

    const wrapper = mountReportBoard()
    await flushPromises()

    const monitorReport = wrapper.get('.quality-gray-monitor-report')
    expect(monitorReport.text()).toContain('质量推荐灰度监控')
    expect(monitorReport.text()).toContain('R4 质量推荐灰度监控')
    expect(monitorReport.text()).toContain('装配终检 / 高风险工单')
    expect(monitorReport.text()).toContain('推荐采纳率 88%')
    expect(monitorReport.text()).toContain('TRACE-QA-GRAY-R4-20260615')

    const decisionReport = wrapper.get('.quality-gray-decision-report')
    expect(decisionReport.text()).toContain('质量灰度决策统计')
    expect(decisionReport.text()).toContain('1 次扩大 / 1 次回滚')
    expect(decisionReport.text()).toContain('待主管确认')
    expect(decisionReport.text()).toContain('R4 · 首次灰度发布 · 扩大灰度 · 主管已确认')
    expect(decisionReport.text()).toContain('R5 · 重新灰度发布 · 回滚并补负样本 · 待主管确认')
    expect(decisionReport.text()).toContain('QA-GRAY-R5-ISSUE-001')

    const experimentReport = wrapper.get('.quality-experiment-report')
    expect(experimentReport.text()).toContain('质量推荐多版本实验对比')
    expect(experimentReport.text()).toContain('R4 灰度实验优于 R3')
    expect(experimentReport.text()).toContain('实验胜出')
    expect(experimentReport.text()).toContain('实验评分')
    expect(experimentReport.text()).toContain('92')
    expect(experimentReport.text()).toContain('AUD-QA-GRAY-R4-DECISION-20260615')

    const candidateReport = wrapper.get('.quality-experiment-candidate-report')
    expect(candidateReport.text()).toContain('质量推荐实验候选治理')
    expect(candidateReport.text()).toContain('R6 负样本补丁影子验证')
    expect(candidateReport.text()).toContain('R5 回滚后补负样本')
    expect(candidateReport.text()).toContain('还差 2 件边界样本')
    expect(candidateReport.text()).toContain('TRACE-QA-CANDIDATE-R6-20260615')

    const csvButton = wrapper.findAll('.btn-export').find(button => button.text() === 'CSV')
    expect(csvButton).toBeTruthy()

    await csvButton!.trigger('click')
    await flushPromises()

    expect(downloadCsv).toHaveBeenCalledWith(
      '报表.csv',
      expect.any(Array),
      expect.arrayContaining([
        ['质量推荐灰度监控', 'R4 质量推荐灰度监控 / 装配终检 / 高风险工单', '灰度稳定 / 推荐采纳率 88% / 复验通过率 96% / 负样本误召回 1.2%'],
        ['质量推荐灰度监控', '灰度审计追踪', 'AUD-QA-GRAY-R4-20260615 / TRACE-QA-GRAY-R4-20260615'],
        ['质量灰度决策统计', '扩大/回滚', '1 次扩大 / 1 次回滚'],
        ['质量灰度决策', 'R5 / 重新灰度发布 / 回滚并补负样本', '待主管确认 / AUD-QA-GRAY-R5-DECISION-20260615 / TRACE-QA-GRAY-R5-DECISION-20260615'],
        ['质量灰度决策', '待复核问题单', 'QA-GRAY-R5-ISSUE-001 / TRACE-QA-GRAY-R5-ISSUE-001 / 待补负样本'],
        ['质量推荐实验对比', 'R4 / 首次灰度发布 / 装配终检 / 高风险工单', '实验胜出 / 采纳率 88% / 复验通过率 96% / 误召回 1.2% / 实验评分 92'],
        ['质量推荐实验对比', 'R4 决策', '进入扩大灰度 / AUD-QA-GRAY-R4-DECISION-20260615 / TRACE-QA-GRAY-R4-DECISION-20260615'],
        ['质量推荐实验候选', 'R6 / R5 回滚后补负样本', '影子验证中 / 负样本覆盖 24 件 / 覆盖率 92% / 还差 2 件边界样本'],
        ['质量推荐实验候选', 'R6 审计', 'AUD-QA-GRAY-R5-DECISION-20260615 / TRACE-QA-GRAY-R5-DECISION-20260615 / AUD-QA-CANDIDATE-R6-20260615 / TRACE-QA-CANDIDATE-R6-20260615'],
      ])
    )
    expect(wrapper.find('[role="alert"]').exists()).toBe(false)
  })

  it('surfaces POC Hypercare acceptance evidence in the report and CSV pack', async () => {
    readPocHypercareAcceptanceRecordBackendFirst.mockResolvedValueOnce(pocHypercareAcceptanceFixture())
    getReportDashboard.mockResolvedValueOnce(reportDashboardFixture())

    const wrapper = mountReportBoard()
    await flushPromises()

    const panel = wrapper.get('.poc-hypercare-panel.active')
    expect(panel.text()).toContain('POC 正式上线验收与 Hypercare 稳定运行监控包')
    expect(panel.text()).toContain('离散制造工厂 POC 已从首批真实工单试点进入正式上线验收')
    expect(panel.text()).toContain('97% / OEE 82%')
    expect(panel.text()).toContain('Hypercare 7 天稳定运行中')
    expect(panel.text()).toContain('客户厂长 / 交付经理 / 调度主管')

    const hypercarePackage = wrapper.get('.poc-hypercare-package')
    expect(hypercarePackage.text()).toContain('Hypercare 稳定运行监控')
    expect(hypercarePackage.text()).toContain('TRACE-POC-HYPERCARE-ACCEPTANCE-20260615')
    expect(hypercarePackage.text()).toContain('OTD 稳定性')
    expect(hypercarePackage.text()).toContain('97%')
    expect(hypercarePackage.text()).toContain('异常告警')
    expect(hypercarePackage.text()).toContain('持续观察')
    expect(hypercarePackage.text()).toContain('治理审计')
    expect(hypercarePackage.text()).toContain('TRACE-POC-HYPERCARE-AUDIT-20260615')

    const csvButton = wrapper.findAll('.btn-export').find(button => button.text() === 'CSV')
    expect(csvButton).toBeTruthy()

    await csvButton!.trigger('click')
    await flushPromises()

    expect(downloadCsv).toHaveBeenCalledWith(
      '报表.csv',
      expect.any(Array),
      expect.arrayContaining([
        ['POCHypercare验收', '标题', 'POC 正式上线验收与 Hypercare 稳定运行监控包'],
        ['POCHypercare验收', '审计编号', 'AUD-POC-HYPERCARE-20260615 / TRACE-POC-HYPERCARE-ACCEPTANCE-20260615'],
        ['POCHypercare指标', 'OTD 稳定性 / 达标', '97% / 目标 >= 96% / TRACE-POC-HYPERCARE-OTD-20260615'],
        ['POCHypercare动作', '治理审计 / 交付经理 / 项目经理', '导出上线验收、指标快照、责任动作和审计追踪给客户复盘。 / TRACE-POC-HYPERCARE-AUDIT-20260615'],
      ])
    )
    expect(wrapper.find('[role="alert"]').exists()).toBe(false)
  })

  it('surfaces POC rollout and pilot run evidence in the report and CSV pack', async () => {
    readPocReviewSignoffRecordBackendFirst.mockResolvedValueOnce(pocReviewSignoffFixture())
    readPocRolloutPackageRecordBackendFirst.mockResolvedValueOnce(pocRolloutPackageFixture())
    readPocPilotRunRecordBackendFirst.mockResolvedValueOnce(pocPilotRunFixture())
    getReportDashboard.mockResolvedValueOnce(reportDashboardFixture())

    const wrapper = mountReportBoard()
    await flushPromises()

    const rolloutPanel = wrapper.get('.poc-rollout-panel.ready')
    expect(rolloutPanel.text()).toContain('POC 成功转上线交付行动包')
    expect(rolloutPanel.text()).toContain('POC 已从签署进入试点上线准备。')
    expect(rolloutPanel.text()).toContain('待客户交付启动会确认')
    expect(rolloutPanel.text()).toContain('交付经理 / 客户厂长 / IT 负责人')

    const rolloutPackage = wrapper.get('.poc-rollout-package')
    expect(rolloutPackage.text()).toContain('客户上线交付动作')
    expect(rolloutPackage.text()).toContain('TRACE-POC-ROLLOUT-DELIVERY-PACKAGE-20260521')
    expect(rolloutPackage.text()).toContain('现场运行')
    expect(rolloutPackage.text()).toContain('TRACE-POC-ROLLOUT-PILOT-RUN-20260521')

    const pilotPanel = wrapper.get('.poc-pilot-panel.closed')
    expect(pilotPanel.text()).toContain('POC 首批真实工单试点运行确认')
    expect(pilotPanel.text()).toContain('首批 30 单真实工单已跑通。')
    expect(pilotPanel.text()).toContain('97% / 30 单')
    expect(pilotPanel.text()).toContain('首批真实工单已跑通')

    const pilotPackage = wrapper.get('.poc-pilot-run-package')
    expect(pilotPackage.text()).toContain('首批真实工单运行结果')
    expect(pilotPackage.text()).toContain('PILOT-WO-BATCH-20260521-001')
    expect(pilotPackage.text()).toContain('WO-PILOT-2101')
    expect(pilotPackage.text()).toContain('采纳 Agent 锁定期后插入建议')
    expect(pilotPackage.text()).toContain('TRACE-POC-PILOT-SCHEDULE-20260521')

    const csvButton = wrapper.findAll('.btn-export').find(button => button.text() === 'CSV')
    expect(csvButton).toBeTruthy()

    await csvButton!.trigger('click')
    await flushPromises()

    expect(downloadCsv).toHaveBeenCalledWith(
      '报表.csv',
      expect.any(Array),
      expect.arrayContaining([
        ['POC上线交付包', '标题', 'POC 成功转上线交付行动包'],
        ['POC上线交付包', '审计编号', 'AUD-POC-ROLLOUT-20260521 / TRACE-POC-ROLLOUT-DELIVERY-PACKAGE-20260521'],
        ['POC上线交付动作', '现场运行 / 调度主管 / 班组长', '用首批真实工单跑通排产建议采纳、现场执行和异常回写。 / T+7 / TRACE-POC-ROLLOUT-PILOT-RUN-20260521'],
        ['POC试点运行', '批次', 'PILOT-WO-BATCH-20260521-001 / 30 单 / OTD 97%'],
        ['POC试点工单', 'WO-PILOT-2101 / 急单阀体组件', '12 件 / CNC 精加工 -> OP-20 装配 -> 首件复检 / 采纳 Agent 锁定期后插入建议 / 已完工回写'],
        ['POC试点检查点', 'AI 排产 / 调度主管', '30 单真实工单已生成排产建议并闭环。 / TRACE-POC-PILOT-SCHEDULE-20260521'],
      ])
    )
    expect(wrapper.find('[role="alert"]').exists()).toBe(false)
  })

  it('uses the local schedule feedback snapshot when backend feedback is unavailable', async () => {
    getLatestAdoptionFeedback.mockRejectedValueOnce(new Error('schedule feedback backend unavailable'))
    readScheduleFeedbackSnapshot.mockReturnValueOnce({
      decision: 'accepted',
      decisionLabel: '已采纳 Agent 推荐',
      reasonCategory: 'delivery-risk',
      categoryLabel: '交付风险降低',
      reasonDetail: '本地快照保留调度员采纳原因',
      objectiveLabel: 'OTD 优先',
      createdAt: '2026-06-05T09:30:00.000Z',
      traceId: 'TRACE-SCH-FEEDBACK-LOCAL',
      source: 'local',
    })
    getReportDashboard.mockResolvedValueOnce(reportDashboardFixture())

    const wrapper = mountReportBoard()
    await flushPromises()

    expect(readScheduleFeedbackSnapshot).toHaveBeenCalled()
    expect(wrapper.text()).toContain('人工采纳')
    expect(wrapper.text()).toContain('已采纳 Agent 推荐')
    expect(wrapper.text()).toContain('TRACE-SCH-FEEDBACK-LOCAL')
  })

  it('surfaces batch objective adoption snapshots in the OTD evidence chain when backend feedback is unavailable', async () => {
    getLatestAdoptionFeedback.mockRejectedValueOnce(new Error('schedule feedback backend unavailable'))
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
    getReportDashboard.mockResolvedValueOnce(reportDashboardFixture())

    const wrapper = mountReportBoard()
    await flushPromises()

    const evidenceCard = wrapper.findAll('.evidence-chain-card').find(card => card.text().includes('已采纳批量对比方案'))
    expect(evidenceCard?.text()).toContain('人工采纳')
    expect(evidenceCard?.text()).toContain('批量对比采纳：从批量对比中选择此方案')
    expect(evidenceCard?.text()).toContain('对象：综合平衡')
    expect(evidenceCard?.text()).toContain('TRACE-SCH-FEEDBACK-BATCH-balanced')
    expect(wrapper.text()).toContain('批量对比采纳是否已进入 OTD 复盘？')

    await evidenceCard?.trigger('click')

    const detail = wrapper.get('.drilldown-detail')
    expect(detail.text()).toContain('批量对比采纳是否已进入 OTD 复盘？')
    expect(detail.text()).toContain('在AI 排产核对批量对比采纳记录，确认目标、原因和 traceId 是否已同步到 OTD 证据链。')
    expect(wrapper.text()).toContain('本地采纳证据随 CSV 导出；Excel/PDF 为后端报表快照。')
  })

  it('exports schedule feedback agent decision evidence with the OTD drilldown CSV', async () => {
    getLatestAdoptionFeedback.mockRejectedValueOnce(new Error('schedule feedback backend unavailable'))
    readScheduleFeedbackSnapshot.mockReturnValueOnce({
      decision: 'accepted',
      decisionLabel: '已采纳批量对比方案',
      reasonCategory: 'batch_optimize_apply',
      categoryLabel: '批量对比采纳',
      reasonDetail: '从批量对比中选择此方案',
      objectiveLabel: '综合平衡',
      createdAt: '2026-06-14T10:30:00.000Z',
      traceId: 'TRACE-SCH-FEEDBACK-BATCH-balanced',
      agentDecisionId: 'decision-batch-balanced-001',
      source: 'local',
    })
    getReportDashboard.mockResolvedValueOnce(reportDashboardFixture())

    const wrapper = mountReportBoard()
    await flushPromises()

    const evidenceCard = wrapper.findAll('.evidence-chain-card').find(card => card.text().includes('已采纳批量对比方案'))
    await evidenceCard?.trigger('click')

    expect(wrapper.get('.drilldown-detail').text()).toContain('decision-batch-balanced-001')

    const csvButton = wrapper.findAll('.btn-export').find(button => button.text() === 'CSV')
    expect(csvButton).toBeTruthy()

    await csvButton!.trigger('click')
    await flushPromises()

    expect(downloadCsv).toHaveBeenCalledWith(
      '报表.csv',
      expect.any(Array),
      expect.arrayContaining([
        ['OTD复盘证据链', '人工采纳 / 已采纳批量对比方案', '已采纳 / 综合平衡 / TRACE-SCH-FEEDBACK-BATCH-balanced / decision-batch-balanced-001'],
      ])
    )
  })

  it('keeps Excel and PDF exports explicit about backend snapshot boundaries', async () => {
    const clickSpy = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {})
    const wrapper = mountReportBoard()
    await flushPromises()

    const excelButton = wrapper.findAll('.btn-export').find(button => button.text() === 'Excel')
    expect(excelButton).toBeTruthy()

    await excelButton!.trigger('click')
    await flushPromises()

    expect(wrapper.get('[role="alert"]').text()).toContain('报表 Excel 已请求后端快照导出；本地批量采纳证据请使用 CSV 导出。')

    const pdfButton = wrapper.findAll('.btn-export').find(button => button.text() === 'PDF')
    expect(pdfButton).toBeTruthy()

    await pdfButton!.trigger('click')
    await flushPromises()
    clickSpy.mockRestore()

    expect(wrapper.get('[role="alert"]').text()).toContain('报表 PDF 已请求后端快照导出；本地批量采纳证据请使用 CSV 导出。')
  })

  it('keeps the POC review unsigned when signoff evidence cannot be archived', async () => {
    readCustomerOrderImportEvidenceBackendFirst.mockResolvedValue({
      batchId: 'IMP-POC-WO-20260520-001',
      fileName: 'customer-orders.csv',
      source: '客户 ERP',
      importedOrders: 30,
      highRiskOrders: 6,
      mappedFields: ['工单', '交期', '数量'],
      createdAt: '2026-05-20T00:00:00.000Z',
    })
    readCustomerEquipmentFaultEvidenceBackendFirst.mockResolvedValue({
      batchId: 'IMP-POC-EQ-FAULT-20260520-001',
      fileName: 'equipment-fault.csv',
      source: '客户设备台账',
      faultSamples: 8,
      affectedOrders: 'WO-001 / WO-002',
      capturedSignals: ['振动', '温度'],
      createdAt: '2026-05-20T00:00:00.000Z',
    })
    writePocReviewSignoffRecord.mockImplementationOnce(() => {
      throw new Error('poc signoff storage unavailable')
    })
    const wrapper = mountReportBoard()
    await flushPromises()

    const signoffButton = wrapper.get('.review-signoff-btn')
    expect(signoffButton.text()).toBe('生成 POC 复盘签署记录')

    await signoffButton.trigger('click')
    await flushPromises()

    const alert = wrapper.get('[role="alert"]')
    expect(alert.text()).toContain('POC 复盘签署失败')
    expect(alert.text()).toContain('poc signoff storage unavailable')
    expect(wrapper.text()).not.toContain('POC 复盘已签署')
  })

  it('keeps the POC rollout package ungenerated when rollout evidence cannot be archived', async () => {
    readPocReviewSignoffRecordBackendFirst.mockResolvedValueOnce(pocReviewSignoffFixture())
    writePocRolloutPackageRecord.mockReturnValueOnce(null)

    const wrapper = mountReportBoard()
    await flushPromises()

    const rolloutButton = wrapper.get('.poc-rollout-panel .review-signoff-btn')
    expect(rolloutButton.text()).toBe('生成上线交付行动包')

    await rolloutButton.trigger('click')
    await flushPromises()

    const alert = wrapper.get('[role="alert"]')
    expect(alert.text()).toContain('POC 上线交付包生成失败')
    expect(alert.text()).toContain('交付包未写入')
    expect(wrapper.text()).not.toContain('客户上线交付动作')
  })

  it('keeps the POC pilot run unconfirmed when pilot evidence cannot be archived', async () => {
    readPocReviewSignoffRecordBackendFirst.mockResolvedValueOnce(pocReviewSignoffFixture())
    readPocRolloutPackageRecordBackendFirst.mockResolvedValueOnce(pocRolloutPackageFixture())
    writePocPilotRunRecord.mockReturnValueOnce(null)

    const wrapper = mountReportBoard()
    await flushPromises()

    const pilotButton = wrapper.get('.poc-pilot-panel .review-signoff-btn')
    expect(pilotButton.text()).toBe('确认试点运行闭环')

    await pilotButton.trigger('click')
    await flushPromises()

    const alert = wrapper.get('[role="alert"]')
    expect(alert.text()).toContain('POC 试点运行确认失败')
    expect(alert.text()).toContain('试点运行记录未写入')
    expect(wrapper.text()).not.toContain('首批真实工单运行结果')
  })

  it('keeps the POC hypercare package ungenerated when hypercare evidence cannot be archived', async () => {
    readPocReviewSignoffRecordBackendFirst.mockResolvedValueOnce(pocReviewSignoffFixture())
    readPocRolloutPackageRecordBackendFirst.mockResolvedValueOnce(pocRolloutPackageFixture())
    readPocPilotRunRecordBackendFirst.mockResolvedValueOnce(pocPilotRunFixture())
    writePocHypercareAcceptanceRecord.mockReturnValueOnce(null)

    const wrapper = mountReportBoard()
    await flushPromises()

    const hypercareButton = wrapper.get('.poc-hypercare-panel .review-signoff-btn')
    expect(hypercareButton.text()).toBe('生成上线验收与 Hypercare 监控包')

    await hypercareButton.trigger('click')
    await flushPromises()

    const alert = wrapper.get('[role="alert"]')
    expect(alert.text()).toContain('POC Hypercare 验收包生成失败')
    expect(alert.text()).toContain('Hypercare 验收记录未写入')
    expect(wrapper.text()).not.toContain('Hypercare 稳定运行监控')
  })

  it('keeps the OTD KPI commitment package ungenerated when commitment evidence cannot be archived', async () => {
    writeOtdKpiCommitmentPackage.mockImplementationOnce(() => {
      throw new Error('kpi commitment storage unavailable')
    })

    const wrapper = mountReportBoard()
    await flushPromises()

    const commitmentButton = wrapper.get('.kpi-commitment-btn')
    expect(commitmentButton.text()).toBe('生成客户交付恢复承诺包')

    await commitmentButton.trigger('click')
    await flushPromises()

    const alert = wrapper.get('[role="alert"]')
    expect(alert.text()).toContain('OTD KPI 承诺包生成失败')
    expect(alert.text()).toContain('kpi commitment storage unavailable')
    expect(wrapper.find('.kpi-commitment-card').exists()).toBe(false)
  })

  it('treats released outsourcing as recovered OTD evidence and exports the adjusted drilldown', async () => {
    readOutsourcingCommitmentPackagesBackendFirst.mockResolvedValueOnce([
      {
        id: 'outsourcing-flange-1001',
        sourceKpiId: 'product-flange',
        dimensionLabel: '产品族',
        targetName: '法兰盘 DN100',
        title: '法兰盘 DN100 外协到货承诺包',
        auditId: 'AUD-OUTSOURCING-FLANGE-20260521-001',
        traceId: 'TRACE-OUTSOURCING-FLANGE-20260521',
        scheduleReleaseTraceId: 'TRACE-OUTSOURCE-SCHEDULE-RELEASE-20260614',
        affectedOrders: 'WO-DEMO-1009',
        actor: 'admin',
        baselineOtd: 68,
        agentOtd: 90,
        lift: 22,
        delayedReduced: 1,
        statusLabel: '待客户确认',
        commitment: '法兰盘 DN100 外协到货后关闭厂外等待口径。',
        owner: '采购 / 计划 / 客户成功',
        dueAt: '今日 18:00 前',
        summary: '外协到货释放已闭环。',
        actions: [],
        createdAt: '2026-06-14T10:40:00.000Z',
      },
    ])
    getReportDashboard.mockResolvedValueOnce(reportDashboardFixture())

    const wrapper = mountReportBoard()
    await flushPromises()

    expect(wrapper.text()).toContain('法兰盘 DN100')
    expect(wrapper.text()).toContain('TRACE-OUTSOURCE-SCHEDULE-RELEASE-20260614')
    expect(wrapper.text()).toContain('法兰盘 DN100 从延期样本转为已恢复')

    const productTab = wrapper.get('[role="tablist"]').findAll('[role="tab"]').find(tab => tab.text() === '产品族')
    expect(productTab).toBeTruthy()
    await productTab!.trigger('click')
    await flushPromises()

    const flangeCard = wrapper.findAll('.kpi-drilldown-card').find(card => card.text().includes('法兰盘 DN100'))
    expect(flangeCard).toBeTruthy()
    expect(flangeCard!.classes()).toContain('recovered')
    expect(flangeCard!.text()).toContain('Agent 90%')
    expect(flangeCard!.text()).toContain('提升 +22%')
    expect(flangeCard!.text()).toContain('外协到货 + AI 排产释放')

    await flangeCard!.trigger('click')
    await flushPromises()

    expect(wrapper.get('.kpi-drilldown-detail').text()).toContain('TRACE-KPI-PRODUCT-FLANGE-OTD-20260521')
    expect(wrapper.get('.kpi-drilldown-detail').text()).toContain('外协到货 + AI 排产释放')
    expect(wrapper.get('.kpi-drilldown-detail').text()).toContain('外协到货和 AI 排产采纳释放')
    expect(wrapper.get('.kpi-drilldown-detail').text()).toContain('生成外协承诺包')

    const csvButton = wrapper.findAll('.btn-export').find(button => button.text() === 'CSV')
    expect(csvButton).toBeTruthy()

    await csvButton!.trigger('click')
    await flushPromises()

    expect(downloadCsv).toHaveBeenCalledWith(
      '报表.csv',
      expect.any(Array),
      expect.arrayContaining([
        ['OTD KPI多维钻取', '产品族 / 法兰盘 DN100', '基线 68% / Agent 90% / 提升 +22% / 延期减少 1 单 / 外协已释放'],
        ['外协承诺包', '法兰盘 DN100 审计', 'AUD-OUTSOURCING-FLANGE-20260521-001 / TRACE-OUTSOURCING-FLANGE-20260521'],
      ])
    )
  })

  it('generates an OTD KPI commitment package and refreshes the evidence chain', async () => {
    const commitmentRecord = {
      id: 'otd-kpi-commitment-customer-huadong',
      sourceKpiId: 'customer-huadong',
      dimensionLabel: '客户',
      targetName: '华东新能源',
      title: '华东新能源 交付恢复承诺包',
      auditId: 'AUD-KPI-COMMITMENT-HUADONG-20260521-001',
      traceId: 'TRACE-KPI-COMMITMENT-HUADONG-20260521',
      actor: 'admin',
      baselineOtd: 76,
      agentOtd: 94,
      lift: 18,
      delayedReduced: 3,
      statusLabel: '待客户确认',
      commitment: '华东新能源 交付恢复口径：Agent OTD 94%（基线 76%），提升 +18%，延期减少 3 单。',
      owner: '客户成功 / 调度主管联合确认',
      dueAt: '今日 17:30 前',
      summary: '急单插入与缺料承诺已形成客户可复盘承诺包。',
      actions: [{
        module: '客户交付',
        owner: '客户成功 / 售前顾问',
        action: '输出华东新能源交付恢复承诺',
        evidence: 'TRACE-KPI-COMMITMENT-HUADONG-20260521',
      }],
      createdAt: '2026-05-21T10:00:00.000Z',
    }
    writeOtdKpiCommitmentPackage.mockReturnValueOnce(commitmentRecord)
    readOtdEvidenceChainRecordsBackendFirst.mockResolvedValueOnce([]).mockResolvedValueOnce([{
      id: 'otd-kpi-commitment-customer-huadong',
      stage: '客户承诺包',
      title: '华东新能源 交付恢复承诺包',
      summary: '华东新能源 交付恢复口径：Agent OTD 94%（基线 76%），提升 +18%，延期减少 3 单。',
      object: '客户 / 华东新能源',
      source: '报表中心 / admin',
      traceId: 'TRACE-KPI-COMMITMENT-HUADONG-20260521',
      status: 'active',
      statusLabel: '待客户确认',
      createdAt: '2026-05-21T10:00:00.000Z',
    }])

    const wrapper = mountReportBoard()
    await flushPromises()

    const commitmentButton = wrapper.get('.kpi-commitment-btn')
    expect(commitmentButton.text()).toBe('生成客户交付恢复承诺包')

    await commitmentButton.trigger('click')
    await flushPromises()

    expect(writeOtdKpiCommitmentPackage).toHaveBeenCalledWith(expect.objectContaining({
      sourceKpiId: 'customer-huadong',
      dimensionLabel: '客户',
      targetName: '华东新能源',
      sourceTraceId: 'TRACE-KPI-CUSTOMER-HUADONG-OTD-20260521',
      actor: 'admin',
    }))
    expect(readOtdEvidenceChainRecordsBackendFirst).toHaveBeenCalledTimes(2)
    expect(wrapper.find('[role="alert"]').exists()).toBe(false)
    expect(wrapper.get('.kpi-commitment-card').text()).toContain('华东新能源 交付恢复承诺包')
    expect(wrapper.get('.kpi-commitment-card').text()).toContain('TRACE-KPI-COMMITMENT-HUADONG-20260521')
    const evidenceCard = wrapper.findAll('.evidence-chain-card').find(card => card.text().includes('客户承诺包'))
    expect(evidenceCard?.text()).toContain('华东新能源 交付恢复承诺包')
    expect(evidenceCard?.text()).toContain('TRACE-KPI-COMMITMENT-HUADONG-20260521')
  })

  it('locks an OTD KPI commitment package after it is generated so duplicate evidence is not written', async () => {
    const commitmentRecord = {
      id: 'otd-kpi-commitment-customer-huadong',
      sourceKpiId: 'customer-huadong',
      dimensionLabel: '客户',
      targetName: '华东新能源',
      title: '华东新能源 交付恢复承诺包',
      auditId: 'AUD-KPI-COMMITMENT-HUADONG-20260521-001',
      traceId: 'TRACE-KPI-COMMITMENT-HUADONG-20260521',
      actor: 'admin',
      baselineOtd: 76,
      agentOtd: 94,
      lift: 18,
      delayedReduced: 3,
      statusLabel: '待客户确认',
      commitment: '华东新能源 交付恢复口径：Agent OTD 94%（基线 76%），提升 +18%，延期减少 3 单。',
      owner: '客户成功 / 调度主管联合确认',
      dueAt: '今日 17:30 前',
      summary: '急单插入与缺料承诺已形成客户可复盘承诺包。',
      actions: [{
        module: '客户交付',
        owner: '客户成功 / 售前顾问',
        action: '输出华东新能源交付恢复承诺',
        evidence: 'TRACE-KPI-COMMITMENT-HUADONG-20260521',
      }],
      createdAt: '2026-05-21T10:00:00.000Z',
    }
    writeOtdKpiCommitmentPackage.mockReturnValue(commitmentRecord)

    const wrapper = mountReportBoard()
    await flushPromises()

    const commitmentButton = wrapper.get<HTMLButtonElement>('.kpi-commitment-btn')
    await commitmentButton.trigger('click')
    await flushPromises()

    expect(wrapper.get<HTMLButtonElement>('.kpi-commitment-btn').element.disabled).toBe(true)

    await wrapper.get('.kpi-commitment-btn').trigger('click')
    await flushPromises()

    expect(writeOtdKpiCommitmentPackage).toHaveBeenCalledTimes(1)
    expect(wrapper.find('[role="alert"]').exists()).toBe(false)
    expect(wrapper.findAll('.kpi-commitment-card')).toHaveLength(1)
  })

  it('reports when CSV export cannot be downloaded', async () => {
    downloadCsv.mockImplementationOnce(() => {
      throw new Error('csv download unavailable')
    })

    const wrapper = mountReportBoard()
    await flushPromises()

    const csvButton = wrapper.findAll('.btn-export').find(button => button.text() === 'CSV')
    expect(csvButton).toBeTruthy()

    await csvButton!.trigger('click')
    await flushPromises()

    const alert = wrapper.get('[role="alert"]')
    expect(alert.text()).toContain('报表 CSV 导出失败')
    expect(alert.text()).toContain('csv download unavailable')
  })

  it('reports when Excel export cannot be opened', async () => {
    const clickSpy = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementationOnce(() => {
      throw new Error('excel download unavailable')
    })

    const wrapper = mountReportBoard()
    await flushPromises()

    const excelButton = wrapper.findAll('.btn-export').find(button => button.text() === 'Excel')
    expect(excelButton).toBeTruthy()

    await excelButton!.trigger('click')
    await flushPromises()
    clickSpy.mockRestore()

    const alert = wrapper.get('[role="alert"]')
    expect(alert.text()).toContain('报表 Excel 导出失败')
    expect(alert.text()).toContain('excel download unavailable')
  })

  it('reports when PDF export cannot be opened', async () => {
    const clickSpy = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementationOnce(() => {
      throw new Error('pdf download unavailable')
    })

    const wrapper = mountReportBoard()
    await flushPromises()

    const pdfButton = wrapper.findAll('.btn-export').find(button => button.text() === 'PDF')
    expect(pdfButton).toBeTruthy()

    await pdfButton!.trigger('click')
    await flushPromises()
    clickSpy.mockRestore()

    const alert = wrapper.get('[role="alert"]')
    expect(alert.text()).toContain('报表 PDF 导出失败')
    expect(alert.text()).toContain('pdf download unavailable')
  })
})
