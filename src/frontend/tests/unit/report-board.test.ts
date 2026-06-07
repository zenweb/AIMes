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
const writePocReviewSignoffRecord = vi.hoisted(() => vi.fn())
const writeOtdKpiCommitmentPackage = vi.hoisted(() => vi.fn())

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
  readQualityReworkImpactBackendFirst: vi.fn(async () => null),
}))

vi.mock('../../src/utils/quality-capa-sync', () => ({
  readQualityCapaClosureBackendFirst: vi.fn(async () => null),
}))

vi.mock('../../src/utils/quality-mrb-disposition-sync', () => ({
  readQualityMrbDispositionRecordBackendFirst: vi.fn(async () => null),
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
  readPocHypercareAcceptanceRecordBackendFirst: vi.fn(async () => null),
  writePocHypercareAcceptanceRecord,
}))

vi.mock('../../src/utils/risk-sla-review-sync', () => ({
  readRiskSlaReviewRecordBackendFirst: vi.fn(async () => null),
}))

vi.mock('../../src/utils/schedule-feedback-sync', () => ({
  readScheduleFeedbackSnapshot,
}))

vi.mock('../../src/utils/risk-action-sync', () => ({
  readRiskActionTracesBackendFirst: vi.fn(async () => []),
}))

vi.mock('../../src/utils/otd-evidence-chain-sync', () => ({
  readOtdEvidenceChainRecordsBackendFirst: vi.fn(async () => []),
}))

vi.mock('../../src/utils/otd-kpi-commitment-sync', () => ({
  readOtdKpiCommitmentPackagesBackendFirst: vi.fn(async () => []),
  writeOtdKpiCommitmentPackage,
}))

vi.mock('../../src/utils/outsourcing-commitment-sync', () => ({
  readOutsourcingCommitmentPackagesBackendFirst: vi.fn(async () => []),
  writeOutsourcingCommitmentPackage: vi.fn(),
}))

vi.mock('../../src/utils/offline-demo-mode', () => ({
  appAssetPath: (path: string) => path,
}))

vi.mock('../../src/utils/local-user', () => ({
  getLocalUserReportActor: vi.fn(() => 'admin'),
}))

vi.mock('../../src/utils/quality-knowledge-sample-sync', () => ({
  buildQualityKnowledgeRecommendationExperimentCandidateRecords: vi.fn(() => []),
  buildQualityKnowledgeGrayReleaseMonitorRecords: vi.fn(() => []),
  buildQualityKnowledgeRecommendationExperimentComparisonRecords: vi.fn(() => []),
  readQualityKnowledgeGrayReleaseDecisionRecordsBackendFirst: vi.fn(async () => []),
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
