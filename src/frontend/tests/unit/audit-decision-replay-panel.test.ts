import { flushPromises, mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import AuditDecisionReplayPanel from '../../src/components/auditLog/AuditDecisionReplayPanel.vue'
import type { AuditLog, AuditLogDetail } from '../../src/types/auditLog'
import { useLocale } from '../../src/composables/useLocale'

const getAuditLogDetail = vi.hoisted(() => vi.fn())
const getAuditLogs = vi.hoisted(() => vi.fn())
const readAssistantActionAudits = vi.hoisted(() => vi.fn(() => []))
const readAssistantActionAuditsBackendFirst = vi.hoisted(() => vi.fn(async () => []))
const readQualityCapaClosureBackendFirst = vi.hoisted(() => vi.fn(async () => null))
const readPocEvidenceGovernanceRecordsBackendFirst = vi.hoisted(() => vi.fn(async () => []))
const readAgentConfigApprovalsBackendFirst = vi.hoisted(() => vi.fn(async () => []))
const readStoredAgentConfigApprovals = vi.hoisted(() => vi.fn(() => []))
const readPocReviewSignoffRecordBackendFirst = vi.hoisted(() => vi.fn(async () => null))
const readOtdEvidenceChainRecords = vi.hoisted(() => vi.fn(() => []))
const readKnowledgeGovernanceReviewsBackendFirst = vi.hoisted(() => vi.fn(async () => []))
const buildQualityKnowledgeRecommendationExperimentCandidateRecords = vi.hoisted(() => vi.fn(() => []))
const buildQualityKnowledgeGrayReleaseMonitorRecords = vi.hoisted(() => vi.fn(() => []))
const qualityKnowledgeGrayReleaseCycleLabel = vi.hoisted(() => vi.fn(() => ''))
const readQualityKnowledgeGrayReleaseDecisionRecordsBackendFirst = vi.hoisted(() => vi.fn(async () => []))
const readQualityKnowledgeRecommendationFeedbackRecordsBackendFirst = vi.hoisted(() => vi.fn(async () => []))
const readQualityKnowledgeRetrainingVersionRecordsBackendFirst = vi.hoisted(() => vi.fn(async () => []))
const isOfflineDemoError = vi.hoisted(() =>
  vi.fn((error: unknown) => error instanceof Error && error.name === 'OfflineDemoApiError'),
)

vi.mock('../../src/api/auditLog', () => ({
  getAuditLogDetail,
  getAuditLogs,
}))

vi.mock('../../src/utils/assistant-action-audit', () => ({
  readAssistantActionAudits,
  readAssistantActionAuditsBackendFirst,
}))

vi.mock('../../src/utils/quality-capa-sync', () => ({
  readQualityCapaClosureBackendFirst,
}))

vi.mock('../../src/utils/poc-evidence-governance', () => ({
  readPocEvidenceGovernanceRecordsBackendFirst,
}))

vi.mock('../../src/utils/agent-config-approval-sync', () => ({
  approvalStatusLabel: (status: string) => status,
  isApprovalOpen: vi.fn((status: string) => status === 'pending' || status === 'reviewing'),
  readAgentConfigApprovalsBackendFirst,
  readStoredAgentConfigApprovals,
}))

vi.mock('../../src/utils/poc-review-signoff-sync', () => ({
  readPocReviewSignoffRecordBackendFirst,
}))

vi.mock('../../src/utils/otd-evidence-chain-sync', () => ({
  readOtdEvidenceChainRecords,
}))

vi.mock('../../src/utils/knowledge-governance-sync', () => ({
  readKnowledgeGovernanceReviewsBackendFirst,
}))

vi.mock('../../src/utils/quality-knowledge-sample-sync', () => ({
  buildQualityKnowledgeRecommendationExperimentCandidateRecords,
  buildQualityKnowledgeGrayReleaseMonitorRecords,
  qualityKnowledgeGrayReleaseCycleLabel,
  readQualityKnowledgeGrayReleaseDecisionRecordsBackendFirst,
  readQualityKnowledgeRecommendationFeedbackRecordsBackendFirst,
  readQualityKnowledgeRetrainingVersionRecordsBackendFirst,
}))

vi.mock('../../src/utils/offline-demo-mode', () => ({
  isOfflineDemoError,
}))

function mountAuditDecisionReplayPanel() {
  return mount(AuditDecisionReplayPanel, {
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

describe('AuditDecisionReplayPanel', () => {
  beforeEach(() => {
    const localStorageStub = {
      getItem: vi.fn(() => null),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
    }
    vi.stubGlobal('localStorage', localStorageStub)
    Object.defineProperty(window, 'localStorage', {
      configurable: true,
      value: localStorageStub,
    })
    getAuditLogs.mockResolvedValue({ items: [] })
    getAuditLogDetail.mockResolvedValue(null)
    readAssistantActionAudits.mockReturnValue([])
    readAssistantActionAuditsBackendFirst.mockResolvedValue([])
    readQualityCapaClosureBackendFirst.mockResolvedValue(null)
    readPocEvidenceGovernanceRecordsBackendFirst.mockResolvedValue([])
    readAgentConfigApprovalsBackendFirst.mockResolvedValue([])
    readStoredAgentConfigApprovals.mockReturnValue([])
    readPocReviewSignoffRecordBackendFirst.mockResolvedValue(null)
    readOtdEvidenceChainRecords.mockReturnValue([])
    readKnowledgeGovernanceReviewsBackendFirst.mockResolvedValue([])
    buildQualityKnowledgeRecommendationExperimentCandidateRecords.mockReturnValue([])
    buildQualityKnowledgeGrayReleaseMonitorRecords.mockReturnValue([])
    qualityKnowledgeGrayReleaseCycleLabel.mockReturnValue('')
    readQualityKnowledgeGrayReleaseDecisionRecordsBackendFirst.mockResolvedValue([])
    readQualityKnowledgeRecommendationFeedbackRecordsBackendFirst.mockResolvedValue([])
    readQualityKnowledgeRetrainingVersionRecordsBackendFirst.mockResolvedValue([])
    isOfflineDemoError.mockImplementation(
      (error: unknown) => error instanceof Error && error.name === 'OfflineDemoApiError',
    )
  })

  it('marks the selected replay action for assistive technology', async () => {
    const wrapper = mountAuditDecisionReplayPanel()
    await flushPromises()

    const buttons = wrapper.findAll('.replay-btn')
    expect(buttons).toHaveLength(2)
    expect(buttons[0].attributes('aria-pressed')).toBe('true')
    expect(buttons[1].attributes('aria-label')).toBe('回放决策链：M-AL-6061 收货后释放冻结工序')

    await buttons[1].trigger('click')
    await flushPromises()

    expect(buttons[0].attributes('aria-pressed')).toBe('false')
    expect(buttons[1].attributes('aria-pressed')).toBe('true')
    expect(wrapper.get('.replay-detail').text()).toContain('M-AL-6061 收货后释放冻结工序 回放链')
  })

  it('exposes the selected replay chain as a named status region', async () => {
    const wrapper = mountAuditDecisionReplayPanel()
    await flushPromises()

    const detail = wrapper.get('.replay-detail')
    expect(detail.attributes('role')).toBe('region')
    expect(detail.attributes('aria-live')).toBe('polite')
    expect(detail.attributes('aria-labelledby')).toBe('audit-replay-detail-title')
    expect(detail.get('#audit-replay-detail-title').text()).toBe('WO-RUSH-9001 急单插入重排建议 回放链')
  })

  it('shows bilingual audit replay guidance with contextual links and help support', async () => {
    const wrapper = mountAuditDecisionReplayPanel()
    await flushPromises()

    const guidance = wrapper.get('.audit-replay-guidance')
    expect(guidance.attributes('id')).toBe('audit-replay-help')
    expect(guidance.text()).toContain('回放前请核对决策对象、执行人、证据编号、风险口径和留痕状态。')
    expect(guidance.text()).toContain(
      'Before replay, verify decision object, actor, evidence id, risk wording, and audit state.',
    )

    const links = guidance.findAll('a')
    expect(links.map((link) => link.text())).toEqual([
      '生产报工 / Production',
      '报表中心 / Reports',
      '配置审批 / Approvals',
      '帮助 / Help',
    ])
    expect(links.map((link) => link.attributes('href'))).toEqual([
      '/scheduling/production',
      '/scheduling/report',
      '#audit-config-approvals',
      '#audit-replay-help',
    ])
    expect(wrapper.get('.replay-detail').attributes('aria-describedby')).toBe('audit-replay-help')
  })

  it('renders replay controls in English while preserving original evidence content', async () => {
    const { setLocale } = useLocale()
    setLocale('en-US')

    try {
      const wrapper = mountAuditDecisionReplayPanel()
      await flushPromises()

      expect(wrapper.get('.replay-heading h3').text()).toBe(
        'Replay suggestions, adoption, rescheduling actions, and configuration approvals',
      )
      expect(wrapper.findAll('.replay-btn')[0].text()).toBe('Replay decision chain')
      expect(wrapper.findAll('.replay-btn')[0].attributes('aria-label')).toContain('Replay decision chain:')
      expect(wrapper.get('.decision-meta').text()).toContain('Object:')
      expect(wrapper.get('.trace-footer').text()).toContain('Risk statement:')
      expect(wrapper.get('.approval-lane h4').text()).toBe('Critical configuration change approvals')
      expect(wrapper.text()).toContain('WO-RUSH-9001')
    } finally {
      setLocale('zh-CN')
    }
  })

  it('replays backend business-write audit entries with a labelled business-object link', async () => {
    const auditListItem: AuditLog = {
      id: 'audit-po-1',
      userId: 'agent.service',
      action: 'AgentExecutePurchaseAction',
      resource: 'AgentDecision',
      resourceId: 'decision-1',
      createdAt: '2026-06-01T09:30:00Z',
      traceId: 'TRACE-PO-001',
    }
    const auditDetail: AuditLogDetail = {
      ...auditListItem,
      oldValues: null,
      newValues: JSON.stringify({
        requestActionName: 'ConfirmPurchaseReceipt',
        reason: '供应商到货后释放缺料工序',
        businessWrite: {
          resource: 'purchase-order',
          purchaseOrderId: 'po-1',
          orderNumber: 'PO-RUSH-20260519',
          materialCode: 'M-AL-6061',
          receivedQuantity: 64,
          status: 'Received',
        },
      }),
      ipAddress: '10.0.0.8',
      userAgent: 'AgentExecutor',
    }

    getAuditLogs.mockImplementation(async (action: string) => ({
      items: action === 'AgentExecutePurchaseAction' ? [auditListItem] : [],
      totalCount: action === 'AgentExecutePurchaseAction' ? 1 : 0,
      totalPages: 1,
    }))
    getAuditLogDetail.mockResolvedValue(auditDetail)

    const wrapper = mountAuditDecisionReplayPanel()
    await flushPromises()

    expect(wrapper.get('.replay-detail h4').text()).toBe('采购收货落库：PO-RUSH-20260519 回放链')
    expect(wrapper.get('.replay-detail').text()).toContain('业务写入 purchase-order：po-1 / M-AL-6061 / 收货 64')

    const link = wrapper.get('.trace-link')
    expect(link.text()).toBe('打开采购协同')
    expect(link.attributes('aria-label')).toBe('打开采购协同：PO-RUSH-20260519')
  })

  it('replays schedule adoption feedback audits with the required reason detail', async () => {
    const auditListItem: AuditLog = {
      id: 'audit-schedule-feedback-1',
      userId: 'planner.li',
      action: 'ScheduleAdoptionFeedbackUpsert',
      resource: 'schedule-adoption-feedback',
      resourceId: 'feedback-1',
      createdAt: '2026-06-14T10:15:00Z',
      traceId: 'TRACE-SCHEDULE-FEEDBACK-1',
    }
    const auditDetail: AuditLogDetail = {
      ...auditListItem,
      oldValues: null,
      newValues: JSON.stringify({
        Id: 'feedback-1',
        SchedulePlanId: 'plan-1',
        WorkshopId: 'WS-001',
        OptimizationObjective: 'balanced',
        Decision: 'accepted',
        DecisionLabel: '已采纳 Agent 排产建议',
        ReasonCategory: 'UrgentInsertion',
        CategoryLabel: '紧急插单',
        ReasonDetail: '急单插入后采纳综合平衡方案',
        ObjectiveLabel: '综合平衡',
        OperatorUser: 'planner.li',
        AiTraceId: 'TRACE-SCHEDULE-FEEDBACK-1',
        AgentDecisionId: 'decision-1',
        CreatedAt: '2026-06-14T10:15:00Z',
      }),
      ipAddress: '10.0.0.8',
      userAgent: 'AIMes',
    }

    getAuditLogs.mockImplementation(async (action: string) => ({
      items: action === 'ScheduleAdoptionFeedbackUpsert' ? [auditListItem] : [],
      totalCount: action === 'ScheduleAdoptionFeedbackUpsert' ? 1 : 0,
      totalPages: 1,
    }))
    getAuditLogDetail.mockResolvedValue(auditDetail)

    const wrapper = mountAuditDecisionReplayPanel()
    await flushPromises()

    expect(wrapper.get('.replay-detail h4').text()).toBe('排产采纳反馈：已采纳 Agent 排产建议 回放链')
    expect(wrapper.get('.replay-detail').text()).toContain('急单插入后采纳综合平衡方案')
    expect(wrapper.get('.replay-detail').text()).toContain('紧急插单')
    expect(wrapper.get('.replay-detail').text()).toContain('综合平衡')
    expect(wrapper.get('.replay-metrics').text()).toContain('排产反馈回放')
  })

  it('keeps base replay cards visible and alerts when schedule adoption feedback payload is valid JSON but not an object', async () => {
    const auditListItem: AuditLog = {
      id: 'audit-schedule-feedback-scalar',
      userId: 'planner.li',
      action: 'ScheduleAdoptionFeedbackUpsert',
      resource: 'schedule-adoption-feedback',
      resourceId: 'feedback-scalar',
      createdAt: '2026-06-14T10:20:00Z',
      traceId: 'TRACE-SCHEDULE-FEEDBACK-SCALAR',
    }
    const auditDetail: AuditLogDetail = {
      ...auditListItem,
      oldValues: null,
      newValues: '"not-an-object"',
      ipAddress: '10.0.0.8',
      userAgent: 'AIMes',
    }

    getAuditLogs.mockImplementation(async (action: string) => ({
      items: action === 'ScheduleAdoptionFeedbackUpsert' ? [auditListItem] : [],
      totalCount: action === 'ScheduleAdoptionFeedbackUpsert' ? 1 : 0,
      totalPages: 1,
    }))
    getAuditLogDetail.mockResolvedValue(auditDetail)

    const wrapper = mountAuditDecisionReplayPanel()
    await flushPromises()

    expect(wrapper.findAll('.decision-card')).toHaveLength(2)
    expect(wrapper.get('.replay-detail h4').text()).toContain('WO-RUSH-9001 急单插入重排建议 回放链')
    const alert = wrapper.get('.replay-sync-alert')
    expect(alert.attributes('role')).toBe('alert')
    expect(alert.attributes('aria-live')).toBe('assertive')
    expect(alert.text()).toContain('排产采纳反馈审计详情加载失败')
    expect(alert.text()).toContain('audit-schedule-feedback-scalar 审计载荷不是对象')
  })

  it('replays assistant equipment downtime package audits with route and trace evidence', async () => {
    readAssistantActionAuditsBackendFirst.mockResolvedValue([
      {
        id: 'assistant-audit-equipment-downtime',
        actionId: 'create-equipment-downtime-package',
        label: '生成设备停机复核包',
        type: 'equipment_downtime_package',
        actor: '王工',
        role: 'Admin',
        permitted: true,
        targetRoute: '/equipment',
        resultMessage: '已生成 CNC-001 设备停机复核包',
        auditCode: 'AUD-CHAT-EQ-DOWNTIME-20260615',
        traceId: 'TRACE-CHAT-EQ-DOWNTIME-20260615',
        createdAt: '2026-06-15T09:30:00.000Z',
      },
    ])

    const wrapper = mountAuditDecisionReplayPanel()
    await flushPromises()

    expect(wrapper.get('.replay-detail h4').text()).toBe('AI 助手生成设备停机复核包 回放链')
    expect(wrapper.get('.decision-card.assistant').text()).toContain('已生成 CNC-001 设备停机复核包；权限通过并已执行')
    expect(wrapper.get('.replay-detail').text()).toContain(
      '助手设备停机复核包已同步设备维护、AI 排产、风险预警和 OTD 证据链',
    )
    expect(wrapper.get('.replay-detail').text()).toContain('目标页面 /equipment')
    expect(wrapper.get('.replay-detail').text()).toContain('TRACE-CHAT-EQ-DOWNTIME-20260615')
    expect(wrapper.get('.replay-metrics').text()).toContain('助手动作审计')
  })

  it('selects quality CAPA closure replay before base cards when closure evidence exists', async () => {
    readQualityCapaClosureBackendFirst.mockResolvedValue({
      inspectionId: 'INS-003',
      workOrderId: 'WO-003',
      traceId: 'TRACE-QA-CAPA-CLOSURE-WO-003',
      rootCause: '热处理保温时间偏短',
      evidenceStrength: 0.92,
      taskTitle: 'INS-003 热处理返工 CAPA 验证',
      taskKind: 'CAPA',
      owner: '质量工程师 刘工',
      dueAt: '今日 16:00',
      verification: '复验硬度达标且 OP-20 接收窗口恢复',
      verifiedAt: '2026-06-15T10:00:00.000Z',
      auditState: 'CAPA 根因、验证标准、OTD 影响和复核动作已归档',
      otdImpact: 'WO-003 延期风险从 +1 单降为观察项',
      reviewAction: '质量主管复核后释放热处理复验窗口。',
    })

    const wrapper = mountAuditDecisionReplayPanel()
    await flushPromises()

    expect(wrapper.get('.replay-detail h4').text()).toBe('WO-003 CAPA验证闭环 回放链')
    expect(wrapper.get('.replay-detail').text()).toContain('INS-003 根因分析锁定 热处理保温时间偏短，证据强度 92%。')
    expect(wrapper.get('.replay-detail').text()).toContain('复验硬度达标且 OP-20 接收窗口恢复')
    expect(wrapper.get('.replay-detail').text()).toContain('WO-003 延期风险从 +1 单降为观察项')
    expect(wrapper.get('.replay-detail').text()).toContain('CAPA 根因、验证标准、OTD 影响和复核动作已归档')
  })

  it('keeps base replay cards visible and alerts when quality CAPA closure payload is incomplete', async () => {
    readQualityCapaClosureBackendFirst.mockResolvedValue({
      inspectionId: 'INS-003',
      workOrderId: 'WO-003',
      traceId: 'TRACE-QA-CAPA-INCOMPLETE',
      rootCause: '热处理保温时间偏短',
    })

    const wrapper = mountAuditDecisionReplayPanel()
    await flushPromises()

    expect(wrapper.findAll('.decision-card')).toHaveLength(2)
    expect(wrapper.get('.replay-detail h4').text()).toContain('WO-RUSH-9001 急单插入重排建议 回放链')
    const alert = wrapper.get('.replay-sync-alert')
    expect(alert.attributes('role')).toBe('alert')
    expect(alert.attributes('aria-live')).toBe('assertive')
    expect(alert.text()).toContain('质量 CAPA 闭环加载失败')
    expect(alert.text()).toContain('后端返回不完整审计载荷')
  })

  it('keeps base replay cards visible and alerts when quality CAPA closure payload is not an object', async () => {
    readQualityCapaClosureBackendFirst.mockResolvedValue('not-a-capa-payload')

    const wrapper = mountAuditDecisionReplayPanel()
    await flushPromises()

    expect(wrapper.findAll('.decision-card')).toHaveLength(2)
    expect(wrapper.get('.replay-detail h4').text()).toContain('WO-RUSH-9001 急单插入重排建议 回放链')
    const alert = wrapper.get('.replay-sync-alert')
    expect(alert.attributes('role')).toBe('alert')
    expect(alert.attributes('aria-live')).toBe('assertive')
    expect(alert.text()).toContain('质量 CAPA 闭环加载失败')
    expect(alert.text()).toContain('后端返回非对象审计载荷')
  })

  it('keeps base replay cards visible and alerts when quality CAPA closure loading throws', async () => {
    readQualityCapaClosureBackendFirst.mockRejectedValue(new Error('quality CAPA API unavailable'))

    const wrapper = mountAuditDecisionReplayPanel()
    await flushPromises()

    expect(wrapper.findAll('.decision-card')).toHaveLength(2)
    expect(wrapper.get('.replay-detail h4').text()).toContain('WO-RUSH-9001 急单插入重排建议 回放链')
    const alert = wrapper.get('.replay-sync-alert')
    expect(alert.attributes('role')).toBe('alert')
    expect(alert.attributes('aria-live')).toBe('assertive')
    expect(alert.text()).toContain('质量 CAPA 闭环加载失败')
    expect(alert.text()).toContain('quality CAPA API unavailable')
  })

  it('replays quality inspection and equipment business-write audits with their own object links', async () => {
    const qualityListItem: AuditLog = {
      id: 'audit-quality-1',
      userId: 'agent.service',
      action: 'AgentExecuteQualityDisposition',
      resource: 'AgentDecision',
      resourceId: 'decision-quality-1',
      createdAt: '2026-06-15T10:30:00Z',
      traceId: 'TRACE-QA-BUSINESS-WRITE-1',
    }
    const equipmentListItem: AuditLog = {
      id: 'audit-equipment-1',
      userId: 'agent.service',
      action: 'AgentExecuteMaintenanceAction',
      resource: 'AgentDecision',
      resourceId: 'decision-equipment-1',
      createdAt: '2026-06-15T10:45:00Z',
      traceId: 'TRACE-EQ-BUSINESS-WRITE-1',
    }
    const qualityDetail: AuditLogDetail = {
      ...qualityListItem,
      oldValues: null,
      newValues: JSON.stringify({
        requestActionName: 'RecordQualityDefect',
        reason: '质检发现硬度返工，需要同步 CAPA 与排产影响',
        businessWrite: {
          resource: 'quality-inspection',
          inspectionId: 'INS-003',
          defectType: '硬度不足',
          quantity: 6,
          severity: 'High',
          result: 'ReworkRequired',
        },
      }),
      ipAddress: '10.0.0.8',
      userAgent: 'AgentExecutor',
    }
    const equipmentDetail: AuditLogDetail = {
      ...equipmentListItem,
      oldValues: null,
      newValues: JSON.stringify({
        requestActionName: 'TransitionEquipmentStatus',
        reason: 'CNC-001 主轴温升，需要切换维护状态并触发排产复核',
        businessWrite: {
          resource: 'equipment',
          equipmentId: 'eq-cnc-001',
          equipmentCode: 'CNC-001',
          targetStatus: 'Maintenance',
        },
      }),
      ipAddress: '10.0.0.8',
      userAgent: 'AgentExecutor',
    }
    getAuditLogs.mockImplementation(async (action: string) => ({
      items:
        action === 'AgentExecuteQualityDisposition'
          ? [qualityListItem]
          : action === 'AgentExecuteMaintenanceAction'
            ? [equipmentListItem]
            : [],
      totalCount: action === 'AgentExecuteQualityDisposition' || action === 'AgentExecuteMaintenanceAction' ? 1 : 0,
      totalPages: 1,
    }))
    getAuditLogDetail.mockImplementation(async (id: string) => {
      if (id === 'audit-quality-1') return qualityDetail
      if (id === 'audit-equipment-1') return equipmentDetail
      return null
    })

    const wrapper = mountAuditDecisionReplayPanel()
    await flushPromises()

    const replayButtons = wrapper
      .findAll('.decision-card')
      .filter((card) => card.text().includes('业务落库动作'))
      .map((card) => card.get('.replay-btn'))
    expect(replayButtons).toHaveLength(2)

    await replayButtons[0].trigger('click')
    await flushPromises()

    expect(wrapper.get('.replay-detail h4').text()).toBe('质量处置落库：INS-003 回放链')
    expect(wrapper.get('.replay-detail').text()).toContain(
      '业务写入 quality-inspection：INS-003，缺陷 硬度不足 / 数量 6。',
    )
    expect(wrapper.get('.trace-link').text()).toBe('打开质量闭环')
    expect(wrapper.get('.trace-link').attributes('aria-label')).toBe('打开质量闭环：INS-003')

    await replayButtons[1].trigger('click')
    await flushPromises()

    expect(wrapper.get('.replay-detail h4').text()).toBe('设备状态落库：CNC-001 回放链')
    expect(wrapper.get('.replay-detail').text()).toContain('业务写入 equipment：eq-cnc-001 / CNC-001。')
    expect(wrapper.get('.trace-link').text()).toBe('打开设备维护')
    expect(wrapper.get('.trace-link').attributes('aria-label')).toBe('打开设备维护：CNC-001')
    expect(wrapper.get('.replay-metrics').text()).toContain('业务落库回放')
  })

  it('keeps replay cards visible and alerts when backend business-write audits fail to load', async () => {
    getAuditLogs.mockImplementation(async (action: string) => {
      if (action === 'AgentExecutePurchaseAction') throw new Error('audit log API unavailable')
      return {
        items: [],
        totalCount: 0,
        totalPages: 1,
      }
    })

    const wrapper = mountAuditDecisionReplayPanel()
    await flushPromises()

    expect(wrapper.findAll('.decision-card')).toHaveLength(2)
    expect(wrapper.get('.replay-detail h4').text()).toContain('WO-RUSH-9001 急单插入重排建议 回放链')
    const alert = wrapper.get('.replay-sync-alert')
    expect(alert.attributes('role')).toBe('alert')
    expect(alert.attributes('aria-live')).toBe('assertive')
    expect(alert.text()).toContain('业务落库审计加载失败')
    expect(alert.text()).toContain('audit log API unavailable')
  })

  it('keeps replay cards visible and alerts when backend business-write audit list payload is not an array', async () => {
    getAuditLogs.mockImplementation(async (action: string) => {
      if (action === 'AgentExecutePurchaseAction') {
        return {
          items: { rows: [] },
          totalCount: 1,
          totalPages: 1,
        }
      }
      return {
        items: [],
        totalCount: 0,
        totalPages: 1,
      }
    })

    const wrapper = mountAuditDecisionReplayPanel()
    await flushPromises()

    expect(wrapper.findAll('.decision-card')).toHaveLength(2)
    expect(wrapper.get('.replay-detail h4').text()).toContain('WO-RUSH-9001 急单插入重排建议 回放链')
    const alert = wrapper.get('.replay-sync-alert')
    expect(alert.attributes('role')).toBe('alert')
    expect(alert.attributes('aria-live')).toBe('assertive')
    expect(alert.text()).toContain('业务落库审计加载失败')
    expect(alert.text()).toContain('后端返回非数组审计载荷')
  })

  it('keeps successful business-write replay entries when one audit action fails to load', async () => {
    const auditListItem: AuditLog = {
      id: 'audit-po-partial',
      userId: 'agent.service',
      action: 'AgentExecutePurchaseAction',
      resource: 'AgentDecision',
      resourceId: 'decision-partial',
      createdAt: '2026-06-01T09:40:00Z',
      traceId: 'TRACE-PO-PARTIAL',
    }
    const auditDetail: AuditLogDetail = {
      ...auditListItem,
      oldValues: null,
      newValues: JSON.stringify({
        requestActionName: 'ConfirmPurchaseReceipt',
        reason: '供应商部分到货后释放缺料工序',
        businessWrite: {
          resource: 'purchase-order',
          purchaseOrderId: 'po-partial',
          orderNumber: 'PO-PARTIAL-20260520',
          materialCode: 'M-AL-6061',
          receivedQuantity: 32,
          status: 'PartiallyReceived',
        },
      }),
      ipAddress: '10.0.0.8',
      userAgent: 'AgentExecutor',
    }
    getAuditLogs.mockImplementation(async (action: string) => {
      if (action === 'AgentExecutePurchaseAction') {
        return {
          items: [auditListItem],
          totalCount: 1,
          totalPages: 1,
        }
      }
      if (action === 'AgentExecuteQualityDisposition') throw new Error('quality audit API unavailable')
      return {
        items: [],
        totalCount: 0,
        totalPages: 1,
      }
    })
    getAuditLogDetail.mockResolvedValue(auditDetail)

    const wrapper = mountAuditDecisionReplayPanel()
    await flushPromises()

    expect(wrapper.get('.replay-detail h4').text()).toBe('采购收货落库：PO-PARTIAL-20260520 回放链')
    expect(wrapper.get('.replay-detail').text()).toContain('业务写入 purchase-order：po-partial / M-AL-6061 / 收货 32')
    const alert = wrapper.get('.replay-sync-alert')
    expect(alert.attributes('role')).toBe('alert')
    expect(alert.attributes('aria-live')).toBe('assertive')
    expect(alert.text()).toContain('业务落库审计加载失败')
    expect(alert.text()).toContain('quality audit API unavailable')
  })

  it('keeps successful business-write replay entries and alerts when one audit detail fails to load', async () => {
    const successfulAuditListItem: AuditLog = {
      id: 'audit-po-detail-ok',
      userId: 'agent.service',
      action: 'AgentExecutePurchaseAction',
      resource: 'AgentDecision',
      resourceId: 'decision-detail-ok',
      createdAt: '2026-06-01T09:45:00Z',
      traceId: 'TRACE-PO-DETAIL-OK',
    }
    const failedAuditListItem: AuditLog = {
      id: 'audit-po-detail-failed',
      userId: 'agent.service',
      action: 'AgentExecutePurchaseAction',
      resource: 'AgentDecision',
      resourceId: 'decision-detail-failed',
      createdAt: '2026-06-01T09:46:00Z',
      traceId: 'TRACE-PO-DETAIL-FAILED',
    }
    const auditDetail: AuditLogDetail = {
      ...successfulAuditListItem,
      oldValues: null,
      newValues: JSON.stringify({
        requestActionName: 'ConfirmPurchaseReceipt',
        reason: '供应商到货后释放缺料工序',
        businessWrite: {
          resource: 'purchase-order',
          purchaseOrderId: 'po-detail-ok',
          orderNumber: 'PO-DETAIL-OK-20260520',
          materialCode: 'M-AL-6061',
          receivedQuantity: 48,
          status: 'Received',
        },
      }),
      ipAddress: '10.0.0.8',
      userAgent: 'AgentExecutor',
    }
    getAuditLogs.mockImplementation(async (action: string) => ({
      items: action === 'AgentExecutePurchaseAction' ? [successfulAuditListItem, failedAuditListItem] : [],
      totalCount: action === 'AgentExecutePurchaseAction' ? 2 : 0,
      totalPages: 1,
    }))
    getAuditLogDetail.mockImplementation(async (id: string) => {
      if (id === 'audit-po-detail-failed') throw new Error('audit detail unavailable')
      return auditDetail
    })

    const wrapper = mountAuditDecisionReplayPanel()
    await flushPromises()

    expect(wrapper.get('.replay-detail h4').text()).toBe('采购收货落库：PO-DETAIL-OK-20260520 回放链')
    expect(wrapper.get('.replay-detail').text()).toContain(
      '业务写入 purchase-order：po-detail-ok / M-AL-6061 / 收货 48',
    )
    const alert = wrapper.get('.replay-sync-alert')
    expect(alert.attributes('role')).toBe('alert')
    expect(alert.attributes('aria-live')).toBe('assertive')
    expect(alert.text()).toContain('业务落库审计详情加载失败')
    expect(alert.text()).toContain('audit detail unavailable')
  })

  it('keeps successful business-write replay entries and alerts when one audit detail payload is not a detail object', async () => {
    const successfulAuditListItem: AuditLog = {
      id: 'audit-po-detail-shape-ok',
      userId: 'agent.service',
      action: 'AgentExecutePurchaseAction',
      resource: 'AgentDecision',
      resourceId: 'decision-detail-shape-ok',
      createdAt: '2026-06-01T09:45:00Z',
      traceId: 'TRACE-PO-DETAIL-SHAPE-OK',
    }
    const malformedDetailAuditListItem: AuditLog = {
      id: 'audit-po-detail-shape-broken',
      userId: 'agent.service',
      action: 'AgentExecutePurchaseAction',
      resource: 'AgentDecision',
      resourceId: 'decision-detail-shape-broken',
      createdAt: '2026-06-01T09:46:00Z',
      traceId: 'TRACE-PO-DETAIL-SHAPE-BROKEN',
    }
    const auditDetail: AuditLogDetail = {
      ...successfulAuditListItem,
      oldValues: null,
      newValues: JSON.stringify({
        requestActionName: 'ConfirmPurchaseReceipt',
        reason: '供应商到货后释放缺料工序',
        businessWrite: {
          resource: 'purchase-order',
          purchaseOrderId: 'po-detail-shape-ok',
          orderNumber: 'PO-DETAIL-SHAPE-OK-20260520',
          materialCode: 'M-AL-6061',
          receivedQuantity: 44,
          status: 'Received',
        },
      }),
      ipAddress: '10.0.0.8',
      userAgent: 'AgentExecutor',
    }
    getAuditLogs.mockImplementation(async (action: string) => ({
      items: action === 'AgentExecutePurchaseAction' ? [successfulAuditListItem, malformedDetailAuditListItem] : [],
      totalCount: action === 'AgentExecutePurchaseAction' ? 2 : 0,
      totalPages: 1,
    }))
    getAuditLogDetail.mockImplementation(async (id: string) =>
      id === 'audit-po-detail-shape-broken' ? { items: [] } : auditDetail,
    )

    const wrapper = mountAuditDecisionReplayPanel()
    await flushPromises()

    expect(wrapper.get('.replay-detail h4').text()).toBe('采购收货落库：PO-DETAIL-SHAPE-OK-20260520 回放链')
    expect(wrapper.get('.replay-detail').text()).toContain(
      '业务写入 purchase-order：po-detail-shape-ok / M-AL-6061 / 收货 44',
    )
    const alert = wrapper.get('.replay-sync-alert')
    expect(alert.attributes('role')).toBe('alert')
    expect(alert.attributes('aria-live')).toBe('assertive')
    expect(alert.text()).toContain('业务落库审计详情加载失败')
    expect(alert.text()).toContain('audit-po-detail-shape-broken 后端返回非对象审计载荷')
  })

  it('keeps successful business-write replay entries and alerts when one audit detail payload is malformed', async () => {
    const successfulAuditListItem: AuditLog = {
      id: 'audit-po-payload-ok',
      userId: 'agent.service',
      action: 'AgentExecutePurchaseAction',
      resource: 'AgentDecision',
      resourceId: 'decision-payload-ok',
      createdAt: '2026-06-01T09:50:00Z',
      traceId: 'TRACE-PO-PAYLOAD-OK',
    }
    const malformedAuditListItem: AuditLog = {
      id: 'audit-po-payload-broken',
      userId: 'agent.service',
      action: 'AgentExecutePurchaseAction',
      resource: 'AgentDecision',
      resourceId: 'decision-payload-broken',
      createdAt: '2026-06-01T09:51:00Z',
      traceId: 'TRACE-PO-PAYLOAD-BROKEN',
    }
    const successfulAuditDetail: AuditLogDetail = {
      ...successfulAuditListItem,
      oldValues: null,
      newValues: JSON.stringify({
        requestActionName: 'ConfirmPurchaseReceipt',
        reason: '供应商到货后释放缺料工序',
        businessWrite: {
          resource: 'purchase-order',
          purchaseOrderId: 'po-payload-ok',
          orderNumber: 'PO-PAYLOAD-OK-20260520',
          materialCode: 'M-AL-6061',
          receivedQuantity: 40,
          status: 'Received',
        },
      }),
      ipAddress: '10.0.0.8',
      userAgent: 'AgentExecutor',
    }
    const malformedAuditDetail: AuditLogDetail = {
      ...malformedAuditListItem,
      oldValues: null,
      newValues: '{broken-business-write-payload',
      ipAddress: '10.0.0.8',
      userAgent: 'AgentExecutor',
    }
    getAuditLogs.mockImplementation(async (action: string) => ({
      items: action === 'AgentExecutePurchaseAction' ? [successfulAuditListItem, malformedAuditListItem] : [],
      totalCount: action === 'AgentExecutePurchaseAction' ? 2 : 0,
      totalPages: 1,
    }))
    getAuditLogDetail.mockImplementation(async (id: string) =>
      id === 'audit-po-payload-broken' ? malformedAuditDetail : successfulAuditDetail,
    )

    const wrapper = mountAuditDecisionReplayPanel()
    await flushPromises()

    expect(wrapper.get('.replay-detail h4').text()).toBe('采购收货落库：PO-PAYLOAD-OK-20260520 回放链')
    expect(wrapper.get('.replay-detail').text()).toContain(
      '业务写入 purchase-order：po-payload-ok / M-AL-6061 / 收货 40',
    )
    const alert = wrapper.get('.replay-sync-alert')
    expect(alert.attributes('role')).toBe('alert')
    expect(alert.attributes('aria-live')).toBe('assertive')
    expect(alert.text()).toContain('业务落库审计详情加载失败')
    expect(alert.text()).toContain('audit-po-payload-broken 审计载荷解析失败')
  })

  it('keeps successful business-write replay entries and alerts when one business-write resource is unsupported', async () => {
    const successfulAuditListItem: AuditLog = {
      id: 'audit-po-resource-ok',
      userId: 'agent.service',
      action: 'AgentExecutePurchaseAction',
      resource: 'AgentDecision',
      resourceId: 'decision-resource-ok',
      createdAt: '2026-06-01T09:55:00Z',
      traceId: 'TRACE-PO-RESOURCE-OK',
    }
    const unsupportedAuditListItem: AuditLog = {
      id: 'audit-unsupported-resource',
      userId: 'agent.service',
      action: 'AgentExecutePurchaseAction',
      resource: 'AgentDecision',
      resourceId: 'decision-unsupported-resource',
      createdAt: '2026-06-01T09:56:00Z',
      traceId: 'TRACE-UNSUPPORTED-RESOURCE',
    }
    const successfulAuditDetail: AuditLogDetail = {
      ...successfulAuditListItem,
      oldValues: null,
      newValues: JSON.stringify({
        requestActionName: 'ConfirmPurchaseReceipt',
        reason: '供应商到货后释放缺料工序',
        businessWrite: {
          resource: 'purchase-order',
          purchaseOrderId: 'po-resource-ok',
          orderNumber: 'PO-RESOURCE-OK-20260520',
          materialCode: 'M-AL-6061',
          receivedQuantity: 36,
          status: 'Received',
        },
      }),
      ipAddress: '10.0.0.8',
      userAgent: 'AgentExecutor',
    }
    const unsupportedAuditDetail: AuditLogDetail = {
      ...unsupportedAuditListItem,
      oldValues: null,
      newValues: JSON.stringify({
        requestActionName: 'TransferWarehouseStock',
        reason: '仓库间调拨释放缺料工序',
        businessWrite: {
          resource: 'warehouse-transfer',
          materialCode: 'M-AL-6061',
          receivedQuantity: 12,
          status: 'Transferred',
        },
      }),
      ipAddress: '10.0.0.8',
      userAgent: 'AgentExecutor',
    }
    getAuditLogs.mockImplementation(async (action: string) => ({
      items: action === 'AgentExecutePurchaseAction' ? [successfulAuditListItem, unsupportedAuditListItem] : [],
      totalCount: action === 'AgentExecutePurchaseAction' ? 2 : 0,
      totalPages: 1,
    }))
    getAuditLogDetail.mockImplementation(async (id: string) =>
      id === 'audit-unsupported-resource' ? unsupportedAuditDetail : successfulAuditDetail,
    )

    const wrapper = mountAuditDecisionReplayPanel()
    await flushPromises()

    expect(wrapper.get('.replay-detail h4').text()).toBe('采购收货落库：PO-RESOURCE-OK-20260520 回放链')
    expect(wrapper.get('.replay-detail').text()).toContain(
      '业务写入 purchase-order：po-resource-ok / M-AL-6061 / 收货 36',
    )
    const alert = wrapper.get('.replay-sync-alert')
    expect(alert.attributes('role')).toBe('alert')
    expect(alert.attributes('aria-live')).toBe('assertive')
    expect(alert.text()).toContain('业务落库审计详情加载失败')
    expect(alert.text()).toContain('audit-unsupported-resource 不支持的业务落库资源：warehouse-transfer')
  })

  it('keeps successful business-write replay entries and alerts when one audit detail payload is missing', async () => {
    const successfulAuditListItem: AuditLog = {
      id: 'audit-po-missing-payload-ok',
      userId: 'agent.service',
      action: 'AgentExecutePurchaseAction',
      resource: 'AgentDecision',
      resourceId: 'decision-missing-payload-ok',
      createdAt: '2026-06-01T10:00:00Z',
      traceId: 'TRACE-PO-MISSING-PAYLOAD-OK',
    }
    const missingPayloadAuditListItem: AuditLog = {
      id: 'audit-missing-payload',
      userId: 'agent.service',
      action: 'AgentExecutePurchaseAction',
      resource: 'AgentDecision',
      resourceId: 'decision-missing-payload',
      createdAt: '2026-06-01T10:01:00Z',
      traceId: 'TRACE-MISSING-PAYLOAD',
    }
    const successfulAuditDetail: AuditLogDetail = {
      ...successfulAuditListItem,
      oldValues: null,
      newValues: JSON.stringify({
        requestActionName: 'ConfirmPurchaseReceipt',
        reason: '供应商到货后释放缺料工序',
        businessWrite: {
          resource: 'purchase-order',
          purchaseOrderId: 'po-missing-payload-ok',
          orderNumber: 'PO-MISSING-PAYLOAD-OK-20260520',
          materialCode: 'M-AL-6061',
          receivedQuantity: 28,
          status: 'Received',
        },
      }),
      ipAddress: '10.0.0.8',
      userAgent: 'AgentExecutor',
    }
    const missingPayloadAuditDetail: AuditLogDetail = {
      ...missingPayloadAuditListItem,
      oldValues: null,
      newValues: null,
      ipAddress: '10.0.0.8',
      userAgent: 'AgentExecutor',
    }
    getAuditLogs.mockImplementation(async (action: string) => ({
      items: action === 'AgentExecutePurchaseAction' ? [successfulAuditListItem, missingPayloadAuditListItem] : [],
      totalCount: action === 'AgentExecutePurchaseAction' ? 2 : 0,
      totalPages: 1,
    }))
    getAuditLogDetail.mockImplementation(async (id: string) =>
      id === 'audit-missing-payload' ? missingPayloadAuditDetail : successfulAuditDetail,
    )

    const wrapper = mountAuditDecisionReplayPanel()
    await flushPromises()

    expect(wrapper.get('.replay-detail h4').text()).toBe('采购收货落库：PO-MISSING-PAYLOAD-OK-20260520 回放链')
    expect(wrapper.get('.replay-detail').text()).toContain(
      '业务写入 purchase-order：po-missing-payload-ok / M-AL-6061 / 收货 28',
    )
    const alert = wrapper.get('.replay-sync-alert')
    expect(alert.attributes('role')).toBe('alert')
    expect(alert.attributes('aria-live')).toBe('assertive')
    expect(alert.text()).toContain('业务落库审计详情加载失败')
    expect(alert.text()).toContain('audit-missing-payload 审计载荷缺失')
  })

  it('keeps successful business-write replay entries and alerts when one audit detail payload is valid JSON but not an object', async () => {
    const successfulAuditListItem: AuditLog = {
      id: 'audit-po-scalar-payload-ok',
      userId: 'agent.service',
      action: 'AgentExecutePurchaseAction',
      resource: 'AgentDecision',
      resourceId: 'decision-scalar-payload-ok',
      createdAt: '2026-06-01T10:05:00Z',
      traceId: 'TRACE-PO-SCALAR-PAYLOAD-OK',
    }
    const scalarPayloadAuditListItem: AuditLog = {
      id: 'audit-scalar-payload',
      userId: 'agent.service',
      action: 'AgentExecutePurchaseAction',
      resource: 'AgentDecision',
      resourceId: 'decision-scalar-payload',
      createdAt: '2026-06-01T10:06:00Z',
      traceId: 'TRACE-SCALAR-PAYLOAD',
    }
    const successfulAuditDetail: AuditLogDetail = {
      ...successfulAuditListItem,
      oldValues: null,
      newValues: JSON.stringify({
        requestActionName: 'ConfirmPurchaseReceipt',
        reason: '供应商到货后释放缺料工序',
        businessWrite: {
          resource: 'purchase-order',
          purchaseOrderId: 'po-scalar-payload-ok',
          orderNumber: 'PO-SCALAR-PAYLOAD-OK-20260520',
          materialCode: 'M-AL-6061',
          receivedQuantity: 26,
          status: 'Received',
        },
      }),
      ipAddress: '10.0.0.8',
      userAgent: 'AgentExecutor',
    }
    const scalarPayloadAuditDetail: AuditLogDetail = {
      ...scalarPayloadAuditListItem,
      oldValues: null,
      newValues: '42',
      ipAddress: '10.0.0.8',
      userAgent: 'AgentExecutor',
    }
    getAuditLogs.mockImplementation(async (action: string) => ({
      items: action === 'AgentExecutePurchaseAction' ? [successfulAuditListItem, scalarPayloadAuditListItem] : [],
      totalCount: action === 'AgentExecutePurchaseAction' ? 2 : 0,
      totalPages: 1,
    }))
    getAuditLogDetail.mockImplementation(async (id: string) =>
      id === 'audit-scalar-payload' ? scalarPayloadAuditDetail : successfulAuditDetail,
    )

    const wrapper = mountAuditDecisionReplayPanel()
    await flushPromises()

    expect(wrapper.get('.replay-detail h4').text()).toBe('采购收货落库：PO-SCALAR-PAYLOAD-OK-20260520 回放链')
    expect(wrapper.get('.replay-detail').text()).toContain(
      '业务写入 purchase-order：po-scalar-payload-ok / M-AL-6061 / 收货 26',
    )
    const alert = wrapper.get('.replay-sync-alert')
    expect(alert.attributes('role')).toBe('alert')
    expect(alert.attributes('aria-live')).toBe('assertive')
    expect(alert.text()).toContain('业务落库审计详情加载失败')
    expect(alert.text()).toContain('audit-scalar-payload 审计载荷不是对象')
  })

  it('exposes pending configuration approvals as a labelled review list', async () => {
    readAgentConfigApprovalsBackendFirst.mockResolvedValue([
      {
        id: 'cfg-lock-window',
        title: 'Scheduling.LockWindowHours 8h -> 10h',
        replayTitle: '锁定期保护从 8 小时调整为 10 小时',
        configKey: 'Scheduling.LockWindowHours',
        fromValue: '8h',
        toValue: '10h',
        reason: '客户要求冻结当天早班计划，降低现场频繁换线。',
        owner: '生产经理审批',
        status: 'pending',
        auditId: 'TRACE-CFG-20260520-002',
        submittedBy: 'admin',
        submittedAt: '2026-05-20T10:30:00.000Z',
        risk: '锁定期扩大可能降低急单响应速度。',
      },
    ])

    const wrapper = mountAuditDecisionReplayPanel()
    await flushPromises()

    const approvalList = wrapper.get('.approval-lane')
    expect(approvalList.attributes('role')).toBe('list')
    expect(approvalList.attributes('aria-label')).toBe('关键配置变更审批')

    const approvalBadge = wrapper.get('.approval-badge')
    expect(approvalBadge.attributes('role')).toBe('status')
    expect(approvalBadge.attributes('aria-live')).toBe('polite')
    expect(approvalBadge.text()).toBe('1 个配置待审批')

    const approvalRow = wrapper.get('.approval-row')
    expect(approvalRow.attributes('role')).toBe('listitem')
    expect(approvalRow.attributes('aria-label')).toBe(
      '审批项：Scheduling.LockWindowHours 8h -> 10h，状态 pending，责任人 生产经理审批',
    )
  })

  it('keeps replay cards visible and alerts when configuration approvals fail to load', async () => {
    readAgentConfigApprovalsBackendFirst.mockRejectedValueOnce(new Error('approval backend unavailable'))

    const wrapper = mountAuditDecisionReplayPanel()
    await flushPromises()

    expect(wrapper.findAll('.decision-card')).toHaveLength(2)
    expect(wrapper.get('.replay-detail h4').text()).toContain('WO-RUSH-9001 急单插入重排建议 回放链')
    const alert = wrapper.get('.replay-sync-alert')
    expect(alert.attributes('role')).toBe('alert')
    expect(alert.attributes('aria-live')).toBe('assertive')
    expect(alert.text()).toContain('配置审批加载失败')
    expect(alert.text()).toContain('approval backend unavailable')
    expect(wrapper.get('.approval-badge').text()).toBe('0 个配置待审批')
  })

  it('keeps replay cards visible and alerts when configuration approval payload is not an array', async () => {
    readAgentConfigApprovalsBackendFirst.mockResolvedValueOnce({ items: [] })

    const wrapper = mountAuditDecisionReplayPanel()
    await flushPromises()

    expect(wrapper.findAll('.decision-card')).toHaveLength(2)
    expect(wrapper.get('.replay-detail h4').text()).toContain('WO-RUSH-9001 急单插入重排建议 回放链')
    const alert = wrapper.get('.replay-sync-alert')
    expect(alert.attributes('role')).toBe('alert')
    expect(alert.attributes('aria-live')).toBe('assertive')
    expect(alert.text()).toContain('配置审批加载失败')
    expect(alert.text()).toContain('后端返回非数组审计载荷')
    expect(wrapper.get('.approval-badge').text()).toBe('0 个配置待审批')
  })

  it('keeps local configuration approval evidence when backend payload is invalid', async () => {
    readAgentConfigApprovalsBackendFirst.mockResolvedValueOnce({ items: [] })
    readStoredAgentConfigApprovals.mockReturnValue([
      {
        id: 'cfg-quality-experiment-gate',
        title: 'Quality.RecommendationExperimentExpansionGate 灰度扩大门禁',
        replayTitle: '质量推荐实验扩大门禁审批',
        configKey: 'Quality.RecommendationExperimentExpansionGate',
        fromValue: '采纳 100% / 复验 100% / 误召回 0',
        toValue: '采纳 100% / 复验 >=95% / 误召回 0',
        reason: 'R4 灰度样本稳定，允许同类终检推荐扩大。',
        owner: '质量主管审批',
        status: 'reviewing',
        auditId: 'TRACE-CFG-QA-EXPERIMENT-GATE-LOCAL',
        submittedBy: 'admin',
        submittedAt: '2026-06-15T02:20:00.000Z',
        risk: '扩大质量推荐灰度时必须保留复验通过率和误召回约束。',
        policyArea: 'quality',
        policyMetrics: [
          { label: '复验通过率', fromValue: '100%', toValue: '>=95%' },
          { label: '负样本误召回', fromValue: '0 次', toValue: '0 次' },
        ],
        controlSummary: '灰度扩大仍需质量主管复核，且每批推荐保留误召回审计。',
      },
    ])

    const wrapper = mountAuditDecisionReplayPanel()
    await flushPromises()

    expect(wrapper.get('.approval-badge').text()).toBe('1 个配置待审批')
    expect(wrapper.get('.approval-row').attributes('aria-label')).toBe(
      '审批项：Quality.RecommendationExperimentExpansionGate 灰度扩大门禁，状态 reviewing，责任人 质量主管审批',
    )

    const configCard = wrapper
      .findAll('.decision-card')
      .find((card) => card.text().includes('质量推荐实验扩大门禁审批'))
    expect(configCard?.exists()).toBe(true)
    await configCard!.get('.replay-btn').trigger('click')
    await flushPromises()

    expect(wrapper.get('.replay-detail h4').text()).toBe('配置审批：质量推荐实验扩大门禁审批 回放链')
    expect(wrapper.get('.replay-detail').text()).toContain('TRACE-CFG-QA-EXPERIMENT-GATE-LOCAL')
    expect(wrapper.get('.replay-detail').text()).toContain(
      '门禁指标调整：复验通过率 100% -> >=95% / 负样本误召回 0 次 -> 0 次。',
    )
    expect(wrapper.get('.replay-detail').text()).toContain('灰度扩大仍需质量主管复核')

    const alert = wrapper.get('.replay-sync-alert')
    expect(alert.attributes('role')).toBe('alert')
    expect(alert.attributes('aria-live')).toBe('assertive')
    expect(alert.text()).toContain('配置审批加载失败')
    expect(alert.text()).toContain('后端返回非数组审计载荷')
  })

  it('keeps local configuration approval evidence when backend approval loading fails', async () => {
    readAgentConfigApprovalsBackendFirst.mockRejectedValueOnce(new Error('approval backend timeout'))
    readStoredAgentConfigApprovals.mockReturnValue([
      {
        id: 'cfg-schedule-lock-local',
        title: 'Scheduling.LockWindowHours 8h -> 10h',
        replayTitle: '排产锁定窗口审批',
        configKey: 'Scheduling.LockWindowHours',
        fromValue: '8h',
        toValue: '10h',
        reason: '急单插入后需要延长锁定窗口，防止已承诺计划被自动覆盖。',
        owner: '生产经理审批',
        status: 'pending',
        auditId: 'TRACE-CFG-SCHEDULE-LOCK-LOCAL',
        submittedBy: 'planner.li',
        submittedAt: '2026-06-15T03:20:00.000Z',
        risk: '锁定窗口扩大后必须保留人工审批和回滚窗口。',
        policyArea: 'schedule',
        policyMetrics: [{ label: '锁定窗口', fromValue: '8h', toValue: '10h' }],
        controlSummary: '审批前保持旧配置，审批后写入审计回放。',
      },
    ])

    const wrapper = mountAuditDecisionReplayPanel()
    await flushPromises()

    expect(wrapper.get('.approval-badge').text()).toBe('1 个配置待审批')
    expect(wrapper.get('.approval-row').attributes('aria-label')).toBe(
      '审批项：Scheduling.LockWindowHours 8h -> 10h，状态 pending，责任人 生产经理审批',
    )

    const configCard = wrapper.findAll('.decision-card').find((card) => card.text().includes('排产锁定窗口审批'))
    expect(configCard?.exists()).toBe(true)
    await configCard!.get('.replay-btn').trigger('click')
    await flushPromises()

    expect(wrapper.get('.replay-detail h4').text()).toBe('配置审批：排产锁定窗口审批 回放链')
    expect(wrapper.get('.replay-detail').text()).toContain('TRACE-CFG-SCHEDULE-LOCK-LOCAL')
    expect(wrapper.get('.replay-detail').text()).toContain('审批前保持旧配置，审批后写入审计回放')

    const alert = wrapper.get('.replay-sync-alert')
    expect(alert.attributes('role')).toBe('alert')
    expect(alert.attributes('aria-live')).toBe('assertive')
    expect(alert.text()).toContain('配置审批加载失败')
    expect(alert.text()).toContain('approval backend timeout')
  })

  it('keeps base replay cards visible and alerts when schedule adoption feedback fails to load', async () => {
    getAuditLogs.mockImplementation(async (action: string) => {
      if (action === 'ScheduleAdoptionFeedbackUpsert') throw new Error('schedule feedback API unavailable')
      return {
        items: [],
        totalCount: 0,
        totalPages: 1,
      }
    })

    const wrapper = mountAuditDecisionReplayPanel()
    await flushPromises()

    expect(wrapper.findAll('.decision-card')).toHaveLength(2)
    expect(wrapper.get('.replay-detail h4').text()).toContain('WO-RUSH-9001 急单插入重排建议 回放链')
    const alert = wrapper.get('.replay-sync-alert')
    expect(alert.attributes('role')).toBe('alert')
    expect(alert.attributes('aria-live')).toBe('assertive')
    expect(alert.text()).toContain('排产采纳反馈审计加载失败')
    expect(alert.text()).toContain('schedule feedback API unavailable')
  })

  it('keeps base replay cards visible and alerts when POC evidence governance fails to load', async () => {
    readPocEvidenceGovernanceRecordsBackendFirst.mockRejectedValue(new Error('POC evidence governance API unavailable'))

    const wrapper = mountAuditDecisionReplayPanel()
    await flushPromises()

    expect(wrapper.findAll('.decision-card')).toHaveLength(2)
    expect(wrapper.get('.replay-detail h4').text()).toContain('WO-RUSH-9001 急单插入重排建议 回放链')
    const alert = wrapper.get('.replay-sync-alert')
    expect(alert.attributes('role')).toBe('alert')
    expect(alert.attributes('aria-live')).toBe('assertive')
    expect(alert.text()).toContain('POC 证据治理加载失败')
    expect(alert.text()).toContain('POC evidence governance API unavailable')
  })

  it('replays POC evidence governance records with batch and audit trace evidence', async () => {
    readPocEvidenceGovernanceRecordsBackendFirst.mockResolvedValue([
      {
        id: 'poc-evidence-batch-otd-20260615',
        title: 'POC OTD 恢复证据包',
        description: '客户 POC 复盘所需 OTD 恢复、调度采纳和现场执行证据',
        batchId: 'BATCH-POC-OTD-20260615',
        object: 'POC-CUSTOMER / WO-RUSH-9001',
        owner: '项目经理 陈工',
        preparedAt: '2026-06-15T06:00:00.000Z',
        auditId: 'AUD-POC-EVIDENCE-20260615',
        risk: 'POC 证据包必须保留批次、责任人和审计号，避免复盘时无法追溯。',
        auditState: 'POC 证据批次、责任人、审计号和复盘入口已归档',
        steps: [
          '汇总 OTD 恢复、排产采纳和现场执行证据。',
          '写入 POC 复盘证据批次 BATCH-POC-OTD-20260615 并绑定审计号 AUD-POC-EVIDENCE-20260615。',
        ],
      },
    ])

    const wrapper = mountAuditDecisionReplayPanel()
    await flushPromises()

    expect(wrapper.get('.replay-detail h4').text()).toBe('POC OTD 恢复证据包 回放链')
    expect(wrapper.get('.replay-detail').text()).toContain('BATCH-POC-OTD-20260615')
    expect(wrapper.get('.replay-detail').text()).toContain('AUD-POC-EVIDENCE-20260615')
    expect(wrapper.get('.replay-detail').text()).toContain('POC 证据批次、责任人、审计号和复盘入口已归档')
    expect(wrapper.get('.replay-metrics').text()).toContain('POC 证据回放')
  })

  it('keeps replay cards visible and alerts when the local OTD evidence chain payload is corrupt', async () => {
    const localStorageStub = {
      getItem: vi.fn((key: string) => (key === 'aimes_otd_evidence_chain' ? '{"broken":true' : null)),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
    }
    vi.stubGlobal('localStorage', localStorageStub)
    Object.defineProperty(window, 'localStorage', {
      configurable: true,
      value: localStorageStub,
    })

    const wrapper = mountAuditDecisionReplayPanel()
    await flushPromises()

    expect(wrapper.findAll('.decision-card')).toHaveLength(2)
    expect(wrapper.get('.replay-detail h4').text()).toContain('WO-RUSH-9001 急单插入重排建议 回放链')
    const alert = wrapper.get('.replay-sync-alert')
    expect(alert.attributes('role')).toBe('alert')
    expect(alert.attributes('aria-live')).toBe('assertive')
    expect(alert.text()).toContain('OTD 证据链加载失败')
    expect(alert.text()).toContain('本地审计证据链载荷损坏')
  })

  it('keeps replay cards visible and alerts when the local OTD evidence chain payload is not an array', async () => {
    const localStorageStub = {
      getItem: vi.fn((key: string) => (key === 'aimes_otd_evidence_chain' ? '{"items":[]}' : null)),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
    }
    vi.stubGlobal('localStorage', localStorageStub)
    Object.defineProperty(window, 'localStorage', {
      configurable: true,
      value: localStorageStub,
    })

    const wrapper = mountAuditDecisionReplayPanel()
    await flushPromises()

    expect(wrapper.findAll('.decision-card')).toHaveLength(2)
    expect(wrapper.get('.replay-detail h4').text()).toContain('WO-RUSH-9001 急单插入重排建议 回放链')
    const alert = wrapper.get('.replay-sync-alert')
    expect(alert.attributes('role')).toBe('alert')
    expect(alert.attributes('aria-live')).toBe('assertive')
    expect(alert.text()).toContain('OTD 证据链加载失败')
    expect(alert.text()).toContain('本地审计证据链载荷损坏')
  })

  it('keeps base replay cards visible and alerts when OTD evidence chain records fail to load', async () => {
    readOtdEvidenceChainRecords.mockImplementation(() => {
      throw new Error('OTD evidence chain API unavailable')
    })

    const wrapper = mountAuditDecisionReplayPanel()
    await flushPromises()

    expect(wrapper.findAll('.decision-card')).toHaveLength(2)
    expect(wrapper.get('.replay-detail h4').text()).toContain('WO-RUSH-9001 急单插入重排建议 回放链')
    const alert = wrapper.get('.replay-sync-alert')
    expect(alert.attributes('role')).toBe('alert')
    expect(alert.attributes('aria-live')).toBe('assertive')
    expect(alert.text()).toContain('OTD 证据链加载失败')
    expect(alert.text()).toContain('OTD evidence chain API unavailable')
  })

  it('does not let delayed startup default selection override a user replay choice', async () => {
    let resolveKnowledgeReviews: (records: []) => void = () => undefined
    readKnowledgeGovernanceReviewsBackendFirst.mockReturnValue(
      new Promise((resolve) => {
        resolveKnowledgeReviews = resolve
      }),
    )
    readOtdEvidenceChainRecords.mockReturnValue([
      {
        id: 'quality-retraining-candidate',
        stage: '知识再训练',
        title: 'WO-DEMO-1018 OP-20 进入再训练候选',
        summary: '低分复用样本进入再训练候选。',
        object: 'WO-DEMO-1018 / OP-20',
        source: '质量知识反馈 / 样本治理',
        traceId: 'TRACE-KG-QA-WO-DEMO-1018-OP-20-RETRAINING-CANDIDATE',
        status: 'active',
        statusLabel: '待再训练样本确认',
        createdAt: '2026-05-21T10:00:00.000Z',
      },
      {
        id: 'quality-reuse-draft',
        stage: '质量处置草案',
        title: 'WO-DEMO-1012 同类缺陷处置草案已生成',
        summary: 'AUD-KG-QA-REUSE-20260521-001 命中 92%。',
        object: 'WO-DEMO-1012 / OP-10',
        source: '质量闭环 / 知识命中 / AI 处置草案',
        traceId: 'TRACE-KG-QA-WO-DEMO-1012-OP-10-REUSE-DRAFT',
        status: 'active',
        statusLabel: '草案待复核',
        createdAt: '2026-05-21T10:00:00.000Z',
      },
    ])

    const wrapper = mountAuditDecisionReplayPanel()
    await flushPromises()

    const draftCard = wrapper
      .findAll('.decision-card')
      .find((card) => card.text().includes('质量处置草案：WO-DEMO-1012 同类缺陷处置草案已生成'))
    expect(draftCard?.exists()).toBe(true)
    await draftCard!.get('.replay-btn').trigger('click')
    await flushPromises()
    expect(wrapper.get('.replay-detail h4').text()).toBe('质量处置草案：WO-DEMO-1012 同类缺陷处置草案已生成 回放链')

    resolveKnowledgeReviews([])
    await flushPromises()

    expect(wrapper.get('.replay-detail h4').text()).toBe('质量处置草案：WO-DEMO-1012 同类缺陷处置草案已生成 回放链')
    expect(wrapper.get('.replay-detail').text()).toContain('TRACE-KG-QA-WO-DEMO-1012-OP-10-REUSE-DRAFT')
  })

  it('keeps base replay cards visible and alerts when assistant action audit payload is not an array', async () => {
    readAssistantActionAuditsBackendFirst.mockResolvedValueOnce({ items: [] })

    const wrapper = mountAuditDecisionReplayPanel()
    await flushPromises()

    expect(wrapper.findAll('.decision-card')).toHaveLength(2)
    expect(wrapper.get('.replay-detail h4').text()).toContain('WO-RUSH-9001 急单插入重排建议 回放链')
    const alert = wrapper.get('.replay-sync-alert')
    expect(alert.attributes('role')).toBe('alert')
    expect(alert.attributes('aria-live')).toBe('assertive')
    expect(alert.text()).toContain('助手动作审计加载失败')
    expect(alert.text()).toContain('后端返回非数组审计载荷')
  })

  it('keeps replay evidence quiet when offline demo skips startup audit evidence reads', async () => {
    const createOfflineDemoError = (url: string) => {
      const error = new Error(`Offline demo mode skipped backend request: ${url}`)
      error.name = 'OfflineDemoApiError'
      return error
    }
    readAssistantActionAuditsBackendFirst.mockRejectedValueOnce(
      createOfflineDemoError('/api/v1/scheduling/assistant-action-audits'),
    )
    readAgentConfigApprovalsBackendFirst.mockRejectedValueOnce(
      createOfflineDemoError('/api/v1/scheduling/agent-config-approvals'),
    )
    readKnowledgeGovernanceReviewsBackendFirst.mockRejectedValueOnce(
      createOfflineDemoError('/api/v1/scheduling/knowledge-governance-reviews'),
    )
    getAuditLogs.mockRejectedValue(createOfflineDemoError('/api/v1/audit-logs'))

    const wrapper = mountAuditDecisionReplayPanel()
    await flushPromises()

    expect(wrapper.find('.replay-sync-alert').exists()).toBe(false)
    expect(wrapper.text()).toContain('AI 决策审计')
    expect(wrapper.text()).not.toContain('Offline demo mode skipped backend request')
    expect(wrapper.text()).not.toContain('助手动作审计加载失败')
    expect(wrapper.text()).not.toContain('配置审批加载失败')
    expect(wrapper.text()).not.toContain('知识治理加载失败')
    expect(wrapper.text()).not.toContain('业务落库审计加载失败')
    expect(wrapper.text()).not.toContain('排产采纳反馈审计加载失败')
  })

  it('keeps local assistant action replay evidence when backend payload is invalid', async () => {
    readAssistantActionAuditsBackendFirst.mockResolvedValueOnce({ items: [] })
    readAssistantActionAudits.mockReturnValue([
      {
        id: 'local-assistant-customer-commitment',
        actionId: 'create-customer-commitment-package',
        label: '生成客户交付承诺包',
        type: 'customer_commitment_package',
        actor: '王工',
        role: 'Admin',
        targetRoute: '/report',
        auditCode: 'AUD-CHAT-CUSTOMER-COMMITMENT-LOCAL',
        traceId: 'TRACE-CHAT-CUSTOMER-COMMITMENT-LOCAL',
        resultMessage: '已生成客户交付承诺包并同步报表中心',
        permitted: true,
        createdAt: '2026-06-15T02:00:00.000Z',
      },
    ])

    const wrapper = mountAuditDecisionReplayPanel()
    await flushPromises()

    expect(wrapper.get('.replay-detail h4').text()).toBe('AI 助手生成客户交付承诺包 回放链')
    expect(wrapper.get('.replay-detail').text()).toContain('已生成客户交付承诺包并同步报表中心')
    expect(wrapper.get('.replay-detail').text()).toContain('TRACE-CHAT-CUSTOMER-COMMITMENT-LOCAL')
    expect(wrapper.get('.replay-metrics').text()).toContain('助手动作审计')
    const alert = wrapper.get('.replay-sync-alert')
    expect(alert.attributes('role')).toBe('alert')
    expect(alert.attributes('aria-live')).toBe('assertive')
    expect(alert.text()).toContain('助手动作审计加载失败')
    expect(alert.text()).toContain('后端返回非数组审计载荷')
  })

  it('keeps local assistant action replay evidence when backend audit loading throws', async () => {
    readAssistantActionAuditsBackendFirst.mockRejectedValueOnce(new Error('assistant audit API unavailable'))
    readAssistantActionAudits.mockReturnValue([
      {
        id: 'local-assistant-maintenance-release',
        actionId: 'equipment-downtime-action',
        label: '生成设备停机处置',
        type: 'equipment_downtime_action',
        actor: '王工',
        role: 'Admin',
        targetRoute: '/equipment',
        auditCode: 'AUD-CHAT-EQUIPMENT-LOCAL',
        traceId: 'TRACE-CHAT-EQUIPMENT-LOCAL',
        resultMessage: '已生成 CNC-01 主轴停机处置并同步设备看板',
        permitted: true,
        createdAt: '2026-06-15T02:30:00.000Z',
      },
    ])

    const wrapper = mountAuditDecisionReplayPanel()
    await flushPromises()

    expect(wrapper.get('.replay-detail h4').text()).toBe('AI 助手生成设备停机处置 回放链')
    expect(wrapper.get('.replay-detail').text()).toContain('目标页面 /equipment')
    expect(wrapper.get('.replay-detail').text()).toContain('TRACE-CHAT-EQUIPMENT-LOCAL')
    const alert = wrapper.get('.replay-sync-alert')
    expect(alert.attributes('role')).toBe('alert')
    expect(alert.attributes('aria-live')).toBe('assertive')
    expect(alert.text()).toContain('助手动作审计加载失败')
    expect(alert.text()).toContain('assistant audit API unavailable')
  })

  it('links POC review signoff replay back to report evidence', async () => {
    readPocReviewSignoffRecordBackendFirst.mockResolvedValue({
      id: 'poc-review-signoff-20260602',
      meetingId: 'POC-REVIEW-20260602-001',
      targetCustomer: '离散制造工厂 POC',
      totalScore: 92,
      passScore: 85,
      result: 'approved',
      signedBy: '客户代表 / 项目经理',
      signedAt: '2026-06-02T01:20:00.000Z',
      reviewers: ['客户厂长', '调度主管'],
      evidenceBatches: ['BATCH-OTD-20260602', 'BATCH-AUDIT-20260602'],
      auditId: 'AUD-POC-REVIEW-20260602',
      summary: '复盘证据齐套，评分达到通过线。',
    })

    const wrapper = mountAuditDecisionReplayPanel()
    await flushPromises()

    expect(wrapper.get('.replay-detail h4').text()).toBe('POC 复盘会评分表签署 回放链')
    expect(wrapper.get('.replay-detail').text()).toContain('核对证据批次：BATCH-OTD-20260602、BATCH-AUDIT-20260602。')

    const link = wrapper.get('.trace-link')
    expect(link.text()).toBe('打开报表中心')
    expect(link.attributes('aria-label')).toBe('打开报表中心：POC-REVIEW-20260602-001')
  })

  it('keeps base replay cards visible and alerts when POC review signoff fails to load', async () => {
    readPocReviewSignoffRecordBackendFirst.mockRejectedValue(new Error('POC signoff API unavailable'))

    const wrapper = mountAuditDecisionReplayPanel()
    await flushPromises()

    expect(wrapper.findAll('.decision-card')).toHaveLength(2)
    expect(wrapper.get('.replay-detail h4').text()).toContain('WO-RUSH-9001 急单插入重排建议 回放链')
    const alert = wrapper.get('.replay-sync-alert')
    expect(alert.attributes('role')).toBe('alert')
    expect(alert.attributes('aria-live')).toBe('assertive')
    expect(alert.text()).toContain('POC 复盘签署加载失败')
    expect(alert.text()).toContain('POC signoff API unavailable')
  })

  it('links knowledge governance replay back to the reviewed source document', async () => {
    readKnowledgeGovernanceReviewsBackendFirst.mockResolvedValue([
      {
        id: 'knowledge-governance-review-kg-equipment-cnc-maint',
        documentId: 'kg-equipment-cnc-maint',
        documentTitle: 'CNC-01 主轴维护手册',
        version: 'V1.1',
        reviewedVersion: 'V1.2',
        validUntil: '2026-12-31',
        reviewer: '设备主管 / 知识库管理员',
        reviewedAt: '2026-06-15T01:30:00.000Z',
        auditId: 'AUD-KG-REINDEX-20260615-001',
        traceId: 'TRACE-KG-CNC-MAINT-REINDEX-20260615',
        action: '复核有效期并重建 RAG 索引',
        status: 'approved',
        summary: 'CNC-01 主轴维护手册已完成复核和分块索引。',
        references: ['AI 生产助手', '设备维护', '风险预警'],
      },
    ])

    const wrapper = mountAuditDecisionReplayPanel()
    await flushPromises()

    expect(wrapper.get('.replay-detail h4').text()).toBe('CNC-01 主轴维护手册 V1.1 -> V1.2 复核重建索引 回放链')
    expect(wrapper.get('.replay-detail').text()).toContain('AUD-KG-REINDEX-20260615-001')
    expect(wrapper.get('.replay-detail').text()).toContain('TRACE-KG-CNC-MAINT-REINDEX-20260615')
    expect(wrapper.get('.replay-detail').text()).toContain('有效期延至 2026-12-31')
    expect(wrapper.get('.replay-detail').text()).toContain('AI 生产助手、设备维护、风险预警')

    const link = wrapper.get('.trace-link')
    expect(link.text()).toBe('打开文档治理')
    expect(link.attributes('aria-label')).toBe('打开文档治理：kg-equipment-cnc-maint')
  })

  it('keeps base replay cards visible and alerts when knowledge governance reviews fail to load', async () => {
    readKnowledgeGovernanceReviewsBackendFirst.mockRejectedValue(new Error('knowledge governance API unavailable'))

    const wrapper = mountAuditDecisionReplayPanel()
    await flushPromises()

    expect(wrapper.findAll('.decision-card')).toHaveLength(2)
    expect(wrapper.get('.replay-detail h4').text()).toContain('WO-RUSH-9001 急单插入重排建议 回放链')
    const alert = wrapper.get('.replay-sync-alert')
    expect(alert.attributes('role')).toBe('alert')
    expect(alert.attributes('aria-live')).toBe('assertive')
    expect(alert.text()).toContain('知识治理加载失败')
    expect(alert.text()).toContain('knowledge governance API unavailable')
  })

  it('selects customer commitment package evidence as the default OTD replay chain', async () => {
    readOtdEvidenceChainRecords.mockReturnValue([
      {
        id: 'commitment-east-customer',
        stage: '客户承诺包',
        title: '华东客户交付恢复承诺',
        summary: '承诺 WO-RUSH-9001 在夜班插单后恢复到 6 月 5 日交付。',
        object: 'CUSTOMER-EAST / WO-RUSH-9001',
        source: 'OTD KPI 钻取 / AI 生产助手',
        traceId: 'TRACE-KPI-COMMITMENT-EAST-20260614',
        status: 'closed',
        statusLabel: '承诺已归档',
        createdAt: '2026-06-14T02:10:00.000Z',
      },
    ])

    const wrapper = mountAuditDecisionReplayPanel()
    await flushPromises()

    expect(wrapper.get('.replay-detail h4').text()).toBe('客户承诺包：华东客户交付恢复承诺 回放链')
    expect(wrapper.get('.replay-detail').text()).toContain('AI 生产助手可读取该承诺包回答客户交付恢复口径')
    expect(wrapper.get('.replay-detail').text()).toContain('TRACE-KPI-COMMITMENT-EAST-20260614')
    expect(wrapper.get('.replay-detail').text()).toContain('KPI 钻取、客户承诺、责任动作和报表导出已归档')
    expect(wrapper.get('.replay-metrics').text()).toContain('客户承诺包')
  })

  it('replays outsourcing schedule release without treating vendor wait as internal recovery', async () => {
    readOtdEvidenceChainRecords.mockReturnValue([
      {
        id: 'outsourcing-release-wo-1009',
        stage: '外协排产释放',
        title: 'WO-DEMO-1009 外协到货后释放 OP-30',
        summary: '外协热处理件到货，AI 排产采纳释放 OP-30 后续窗口。',
        object: 'WO-DEMO-1009 / OP-30',
        source: 'AI 排产 / 采购协同',
        traceId: 'TRACE-OUTSOURCE-SCHEDULE-RELEASE-20260614',
        sourceTraceId: 'TRACE-OUTSOURCE-RECEIPT-20260614',
        status: 'closed',
        statusLabel: '厂外等待已关闭',
        createdAt: '2026-06-14T02:20:00.000Z',
      },
    ])

    const wrapper = mountAuditDecisionReplayPanel()
    await flushPromises()

    expect(wrapper.get('.replay-detail h4').text()).toBe('外协排产释放：WO-DEMO-1009 外协到货后释放 OP-30 回放链')
    expect(wrapper.get('.replay-detail').text()).toContain('前置外协到货追踪 TRACE-OUTSOURCE-RECEIPT-20260614')
    expect(wrapper.get('.replay-detail').text()).toContain('厂外等待口径关闭')
    expect(wrapper.get('.replay-detail').text()).toContain('未误计为厂内提前恢复')
    expect(wrapper.get('.replay-metrics').text()).toContain('外协释放回放')
  })

  it('replays outsourcing commitment evidence without counting vendor wait as internal recovery', async () => {
    readOtdEvidenceChainRecords.mockReturnValue([
      {
        id: 'outsourcing-commitment-wo-1009',
        stage: '外协承诺',
        title: 'WO-DEMO-1009 外协热处理承诺',
        summary: '供应商承诺 6 月 15 日 18:00 前回厂，排产仍按厂外等待口径观察。',
        object: 'WO-DEMO-1009 / OP-30',
        source: '采购协同 / OTD KPI 钻取',
        traceId: 'TRACE-OUTSOURCE-COMMITMENT-20260615',
        status: 'open',
        statusLabel: '厂外等待承诺已锁定',
        createdAt: '2026-06-15T04:00:00.000Z',
      },
    ])

    const wrapper = mountAuditDecisionReplayPanel()
    await flushPromises()

    expect(wrapper.get('.replay-detail h4').text()).toBe('外协承诺包：WO-DEMO-1009 外协热处理承诺 回放链')
    expect(wrapper.get('.replay-detail').text()).toContain('TRACE-OUTSOURCE-COMMITMENT-20260615')
    expect(wrapper.get('.replay-detail').text()).toContain('外协承诺、计划复核和厂外等待口径已归档')
    expect(wrapper.get('.replay-detail').text()).toContain('不能把厂外等待误判为厂内恢复')
    expect(wrapper.get('.replay-metrics').text()).toContain('外协承诺包')
  })

  it('replays outsourcing receipt evidence with the previous vendor commitment trace', async () => {
    readOtdEvidenceChainRecords.mockReturnValue([
      {
        id: 'outsourcing-receipt-wo-1009',
        stage: '外协到货',
        title: 'WO-DEMO-1009 外协热处理到货',
        summary: '外协热处理件已回厂，采购确认后等待 AI 排产释放 OP-30。',
        object: 'WO-DEMO-1009 / OP-30',
        source: '采购协同 / 到货确认',
        traceId: 'TRACE-OUTSOURCE-RECEIPT-20260615',
        sourceTraceId: 'TRACE-OUTSOURCE-COMMITMENT-20260615',
        status: 'closed',
        statusLabel: '厂外等待已关闭',
        createdAt: '2026-06-15T04:30:00.000Z',
      },
    ])

    const wrapper = mountAuditDecisionReplayPanel()
    await flushPromises()

    expect(wrapper.get('.replay-detail h4').text()).toBe('外协到货：WO-DEMO-1009 外协热处理到货 回放链')
    expect(wrapper.get('.replay-detail').text()).toContain('TRACE-OUTSOURCE-RECEIPT-20260615')
    expect(wrapper.get('.replay-detail').text()).toContain(
      '原外协承诺追踪 TRACE-OUTSOURCE-COMMITMENT-20260615 保留为前置证据',
    )
    expect(wrapper.get('.replay-detail').text()).toContain('按到货后最早可执行窗口复核释放排产')
    expect(wrapper.get('.replay-metrics').text()).toContain('采购收货回放')
  })

  it('replays production anomaly OTD evidence with risk queue continuity', async () => {
    readOtdEvidenceChainRecords.mockReturnValue([
      {
        id: 'production-anomaly-cnc-01-spindle',
        stage: '生产异常',
        title: 'CNC-01 主轴停机异常上报',
        summary: '班组长上报 CNC-01 主轴温升异常，AI 排产复核转入风险处置队列。',
        object: 'CNC-01 / WO-RUSH-9001',
        source: '生产报工 / 异常中心 / AI 排产',
        traceId: 'TRACE-PROD-ANOMALY-CNC01-20260615',
        status: 'open',
        statusLabel: '风险处置中',
        createdAt: '2026-06-15T03:10:00.000Z',
      },
    ])

    const wrapper = mountAuditDecisionReplayPanel()
    await flushPromises()

    expect(wrapper.get('.replay-detail h4').text()).toBe('生产异常：CNC-01 主轴停机异常上报 回放链')
    expect(wrapper.get('.replay-detail').text()).toContain('TRACE-PROD-ANOMALY-CNC01-20260615')
    expect(wrapper.get('.replay-detail').text()).toContain(
      '生产异常上报、风险队列、异常中心、AI 排产复核和 OTD 证据已归档',
    )
    expect(wrapper.get('.replay-detail').text()).toContain(
      '该生产异常证据必须核对异常上报、风险处置队列、异常中心、AI 排产复核和班组长现场处置是否连续',
    )
    expect(wrapper.get('.replay-metrics').text()).toContain('生产异常回放')
  })

  it('replays barcode quality gate evidence with downstream handoff safeguards', async () => {
    readOtdEvidenceChainRecords.mockReturnValue([
      {
        id: 'barcode-quality-gate-wo-rush-9001',
        stage: '质量门',
        title: 'WO-RUSH-9001 OP-10 扫码质量门放行',
        summary: '首件尺寸复检通过，Ra 抽检合格，不良数量归零后允许下道交接。',
        object: 'WO-RUSH-9001 / OP-10',
        source: '扫码完工 / 质量闭环',
        traceId: 'TRACE-QR-WO-RUSH-9001-OP-10-QUALITY-GATE',
        status: 'closed',
        statusLabel: '质量门已放行',
        createdAt: '2026-06-14T02:30:00.000Z',
      },
    ])

    const wrapper = mountAuditDecisionReplayPanel()
    await flushPromises()

    expect(wrapper.get('.replay-detail h4').text()).toBe('质量门：WO-RUSH-9001 OP-10 扫码质量门放行 回放链')
    expect(wrapper.get('.replay-detail').text()).toContain('质量门放行、返工阻断、工序交接和后续排产窗口是否一致')
    expect(wrapper.get('.replay-detail').text()).toContain('首件复检、粗糙度抽检、不良数量、放行结论和交接条件已归档')
    expect(wrapper.get('.replay-detail').text()).toContain('TRACE-QR-WO-RUSH-9001-OP-10-QUALITY-GATE')
    expect(wrapper.get('.replay-metrics').text()).toContain('扫码质量门回放')
  })

  it('replays barcode rework label release evidence with shopfloor label safeguards', async () => {
    readOtdEvidenceChainRecords.mockReturnValue([
      {
        id: 'barcode-rework-label-release-wo-rush-9001',
        stage: '标签状态',
        title: 'WO-RUSH-9001 OP-10 复验放行标签解冻',
        summary: '流转卡标签从质量冻结更新为复验放行，现场扫码可继续进入 OP-20 接收确认。',
        object: 'WO-RUSH-9001 / OP-10 -> OP-20',
        source: '条码 / QR 打印 / 质量闭环',
        traceId: 'TRACE-QR-WO-RUSH-9001-OP-10-LABEL-RELEASE',
        status: 'closed',
        statusLabel: '标签已解冻',
        createdAt: '2026-06-15T05:00:00.000Z',
      },
    ])

    const wrapper = mountAuditDecisionReplayPanel()
    await flushPromises()

    expect(wrapper.get('.replay-detail h4').text()).toBe('标签状态：WO-RUSH-9001 OP-10 复验放行标签解冻 回放链')
    expect(wrapper.get('.replay-detail').text()).toContain('TRACE-QR-WO-RUSH-9001-OP-10-LABEL-RELEASE')
    expect(wrapper.get('.replay-detail').text()).toContain('标签状态同步给交接释放和排产回写')
    expect(wrapper.get('.replay-detail').text()).toContain('审计回放要求核对现场标签、接收状态和排产窗口是否一致')
    expect(wrapper.get('.replay-metrics').text()).toContain('质量复验释放回放')
  })

  it('replays barcode rework schedule release evidence with recovered schedule window safeguards', async () => {
    readOtdEvidenceChainRecords.mockReturnValue([
      {
        id: 'barcode-rework-schedule-release-wo-rush-9001',
        stage: '排产回写',
        title: 'WO-RUSH-9001 OP-10 复验后排产窗口恢复',
        summary: '返工复验合格后，AI 排产将 OP-20 接收窗口回写为可排。',
        object: 'WO-RUSH-9001 / OP-20',
        source: 'AI 排产 / 质量闭环',
        traceId: 'TRACE-QR-WO-RUSH-9001-OP-10-SCHEDULE-RELEASE',
        status: 'closed',
        statusLabel: '排产窗口已恢复',
        createdAt: '2026-06-15T05:10:00.000Z',
      },
    ])

    const wrapper = mountAuditDecisionReplayPanel()
    await flushPromises()

    expect(wrapper.get('.replay-detail h4').text()).toBe('排产回写：WO-RUSH-9001 OP-10 复验后排产窗口恢复 回放链')
    expect(wrapper.get('.replay-detail').text()).toContain('TRACE-QR-WO-RUSH-9001-OP-10-SCHEDULE-RELEASE')
    expect(wrapper.get('.replay-detail').text()).toContain('已把 OP-20 接收窗口回写为可排')
    expect(wrapper.get('.replay-detail').text()).toContain('审计回放要求核对窗口、节拍和 OTD 复盘口径是否一致')
    expect(wrapper.get('.replay-metrics').text()).toContain('质量复验释放回放')
  })

  it('replays barcode rework handoff release evidence with downstream receiving safeguards', async () => {
    readOtdEvidenceChainRecords.mockReturnValue([
      {
        id: 'barcode-rework-handoff-release-wo-rush-9001',
        stage: '交接释放',
        title: 'WO-RUSH-9001 OP-20 接收解冻',
        summary: '复验放行后 OP-20 接收冻结解除，下道工序可恢复交接。',
        object: 'WO-RUSH-9001 / OP-20',
        source: '质量闭环 / 工序交接',
        traceId: 'TRACE-QR-WO-RUSH-9001-OP-10-RELEASE-OP-20',
        status: 'closed',
        statusLabel: '下道接收已放行',
        createdAt: '2026-06-15T05:20:00.000Z',
      },
    ])

    const wrapper = mountAuditDecisionReplayPanel()
    await flushPromises()

    expect(wrapper.get('.replay-detail h4').text()).toBe('交接释放：WO-RUSH-9001 OP-20 接收解冻 回放链')
    expect(wrapper.get('.replay-detail').text()).toContain('TRACE-QR-WO-RUSH-9001-OP-10-RELEASE-OP-20')
    expect(wrapper.get('.replay-detail').text()).toContain('已解冻 OP-20 接收并恢复下道交接')
    expect(wrapper.get('.replay-detail').text()).toContain('审计回放要求核对接收数量、窗口恢复和实物标签是否一致')
    expect(wrapper.get('.replay-metrics').text()).toContain('质量复验释放回放')
  })

  it('replays barcode rework quality recheck evidence with release synchronization safeguards', async () => {
    readOtdEvidenceChainRecords.mockReturnValue([
      {
        id: 'barcode-rework-quality-recheck-wo-rush-9001',
        stage: '质量复验',
        title: 'WO-RUSH-9001 OP-10 返工复验合格',
        summary: '返工复验硬度和尺寸均合格，可释放 OP-20 接收但必须同步交接和排产。',
        object: 'WO-RUSH-9001 / OP-10',
        source: '质量闭环 / 复验记录',
        traceId: 'TRACE-QR-WO-RUSH-9001-OP-10-RECHECK',
        status: 'closed',
        statusLabel: '复验合格',
        createdAt: '2026-06-15T05:30:00.000Z',
      },
    ])

    const wrapper = mountAuditDecisionReplayPanel()
    await flushPromises()

    expect(wrapper.get('.replay-detail h4').text()).toBe('质量复验：WO-RUSH-9001 OP-10 返工复验合格 回放链')
    expect(wrapper.get('.replay-detail').text()).toContain('TRACE-QR-WO-RUSH-9001-OP-10-RECHECK')
    expect(wrapper.get('.replay-detail').text()).toContain('复验结果已确认，允许进入交接释放')
    expect(wrapper.get('.replay-detail').text()).toContain('审计回放要求核对复验结果、冻结解除和后续排产窗口是否一致')
    expect(wrapper.get('.replay-metrics').text()).toContain('质量复验释放回放')
  })

  it('keeps base replay cards visible and alerts when the POC review signoff payload is malformed', async () => {
    readPocReviewSignoffRecordBackendFirst.mockResolvedValue({
      id: 'poc-review-signoff-malformed',
      meetingId: 'POC-REVIEW-MALFORMED',
      targetCustomer: '离散制造工厂 POC',
      totalScore: 92,
      passScore: 85,
      result: 'approved',
      signedBy: '客户代表 / 项目经理',
      signedAt: '2026-06-02T01:20:00.000Z',
      auditId: 'AUD-POC-REVIEW-MALFORMED',
      summary: '复盘证据齐套，评分达到通过线。',
    } as never)

    const wrapper = mountAuditDecisionReplayPanel()
    await flushPromises()

    expect(wrapper.findAll('.decision-card')).toHaveLength(2)
    expect(wrapper.get('.replay-detail h4').text()).toContain('WO-RUSH-9001 急单插入重排建议 回放链')
    const alert = wrapper.get('.replay-sync-alert')
    expect(alert.attributes('role')).toBe('alert')
    expect(alert.attributes('aria-live')).toBe('assertive')
    expect(alert.text()).toContain('POC 复盘签署加载失败')
    expect(alert.text()).toContain('poc-review-signoff-malformed 复盘签署审计载荷缺失')
  })

  it('selects a quality gray release rollback decision as the default replay chain', async () => {
    readQualityKnowledgeGrayReleaseDecisionRecordsBackendFirst.mockResolvedValue([
      {
        id: 'quality-gray-release-decision-r3-rollback',
        monitorId: 'quality-gray-release-monitor-r3',
        trainingSetVersion: 'QK-TRAIN-20260521-R3',
        targetWorkOrderId: 'WO-DEMO-1018',
        operationCode: 'OP-20',
        releaseCycleLabel: '重新灰度发布',
        releaseAuditId: 'AUD-KG-QA-RETRAINING-R3-GRAY-REPUBLISH-20260521-001',
        releaseTraceId: 'TRACE-KG-QA-WO-DEMO-1018-OP-20-R3-GRAY-REPUBLISHED',
        releaseScopeLabel: 'OP-20 装配扭矩推荐链路',
        decision: 'rolled_back',
        decisionLabel: '回滚到 R2 正式版',
        statusClass: 'guarded',
        decidedBy: '质量主管 刘工 / 知识库管理员',
        decidedAt: '2026-05-21T15:55:00.000Z',
        auditId: 'AUD-KG-QA-RETRAINING-R3-GRAY-REPUBLISH-ROLLBACK-20260521-001',
        traceId: 'TRACE-KG-QA-WO-DEMO-1018-OP-20-R3-GRAY-REPUBLISH-ROLLED-BACK',
        reason: '重新灰度发布后仍要求保守验证，二次回滚到 R2 正式版。',
        approvalStatus: 'not_required',
        approvalLabel: '回滚无需扩大审批',
        rollbackTargetVersion: 'QK-TRAIN-20260521-R2',
        reviewIssueId: 'R3-REPUBLISH-REVIEW-ISSUE-20260521-001',
        reviewIssueTraceId: 'TRACE-KG-QA-WO-DEMO-1018-OP-20-R3-REPUBLISH-REVIEW-ISSUE',
        reviewIssueStatus: 'open',
        reviewIssueLabel: '待复核',
        metricSnapshot: [
          { label: '推荐采纳率', value: '100%' },
          { label: '复验通过率', value: '100%' },
          { label: '负样本误召回', value: '0 次' },
        ],
        actions: ['重新灰度发布周期从 active 推荐选择中排除 QK-TRAIN-20260521-R3。'],
      },
    ])

    const wrapper = mountAuditDecisionReplayPanel()
    await flushPromises()

    expect(wrapper.get('.replay-detail h4').text()).toBe(
      'QK-TRAIN-20260521-R3 回滚到 R2 正式版回放 · 重新灰度发布 回放链',
    )
    expect(wrapper.get('.replay-detail').text()).toContain(
      'TRACE-KG-QA-WO-DEMO-1018-OP-20-R3-GRAY-REPUBLISH-ROLLED-BACK',
    )
    expect(wrapper.get('.replay-detail').text()).toContain(
      '重新灰度发布发布证据：AUD-KG-QA-RETRAINING-R3-GRAY-REPUBLISH-20260521-001',
    )
    expect(wrapper.get('.replay-detail').text()).toContain('QK-TRAIN-20260521-R3 已从 active 推荐中排除')
    expect(wrapper.get('.replay-detail').text()).toContain('R3-REPUBLISH-REVIEW-ISSUE-20260521-001 待复核问题单已打开')
    expect(wrapper.get('.replay-metrics').text()).toContain('质量灰度回放')
    expect(wrapper.find('.replay-sync-alert').exists()).toBe(false)
  })

  it('replays approved quality gray release expansion scope with decision evidence', async () => {
    readQualityKnowledgeGrayReleaseDecisionRecordsBackendFirst.mockResolvedValue([
      {
        id: 'quality-gray-release-decision-r4-expanded',
        monitorId: 'quality-gray-release-monitor-r4',
        trainingSetVersion: 'QK-TRAIN-20260522-R4',
        targetWorkOrderId: 'WO-DEMO-1024',
        operationCode: 'OP-30',
        releaseCycleLabel: '扩大灰度发布',
        releaseAuditId: 'AUD-KG-QA-RETRAINING-R4-GRAY-EXPAND-20260522-001',
        releaseTraceId: 'TRACE-KG-QA-WO-DEMO-1024-OP-30-R4-GRAY-EXPANDED',
        releaseScopeLabel: 'OP-30 终检缺陷推荐链路',
        decision: 'expanded',
        decisionLabel: '扩大推荐范围',
        statusClass: 'approved',
        decidedBy: '质量主管 刘工 / 知识库管理员',
        decidedAt: '2026-05-22T16:10:00.000Z',
        auditId: 'AUD-KG-QA-RETRAINING-R4-GRAY-EXPAND-APPROVED-20260522-001',
        traceId: 'TRACE-KG-QA-WO-DEMO-1024-OP-30-R4-GRAY-EXPAND-APPROVED',
        reason: '灰度样本稳定，允许扩大到同类终检缺陷推荐。',
        approvalStatus: 'approved',
        approvalLabel: '质量主管已批准扩大',
        expansionScope: ['OP-30 终检缺陷推荐', 'OP-35 包装复检推荐'],
        metricSnapshot: [
          { label: '推荐采纳率', value: '96%' },
          { label: '复验通过率', value: '99%' },
          { label: '负样本误召回', value: '0 次' },
        ],
        actions: ['QK-TRAIN-20260522-R4 已加入同类工序 active 推荐候选。'],
      },
    ])

    const wrapper = mountAuditDecisionReplayPanel()
    await flushPromises()

    expect(wrapper.get('.replay-detail h4').text()).toBe('QK-TRAIN-20260522-R4 扩大推荐范围回放 · 扩大灰度发布 回放链')
    expect(wrapper.get('.replay-detail').text()).toContain('TRACE-KG-QA-WO-DEMO-1024-OP-30-R4-GRAY-EXPAND-APPROVED')
    expect(wrapper.get('.replay-detail').text()).toContain(
      'QK-TRAIN-20260522-R4 灰度已确认扩大到 OP-30 终检缺陷推荐 / OP-35 包装复检推荐',
    )
    expect(wrapper.get('.replay-detail').text()).toContain(
      '审批状态 质量主管已批准扩大，审计编号 AUD-KG-QA-RETRAINING-R4-GRAY-EXPAND-APPROVED-20260522-001',
    )
    expect(wrapper.get('.replay-detail').text()).toContain('QK-TRAIN-20260522-R4 已加入同类工序 active 推荐候选')
    expect(wrapper.find('.replay-sync-alert').exists()).toBe(false)
  })

  it('keeps base replay cards visible and alerts when quality gray release decisions are not an array', async () => {
    readQualityKnowledgeGrayReleaseDecisionRecordsBackendFirst.mockResolvedValueOnce({ items: [] })

    const wrapper = mountAuditDecisionReplayPanel()
    await flushPromises()

    expect(wrapper.findAll('.decision-card')).toHaveLength(2)
    expect(wrapper.get('.replay-detail h4').text()).toContain('WO-RUSH-9001 急单插入重排建议 回放链')
    const alert = wrapper.get('.replay-sync-alert')
    expect(alert.attributes('role')).toBe('alert')
    expect(alert.attributes('aria-live')).toBe('assertive')
    expect(alert.text()).toContain('质量灰度决策加载失败')
    expect(alert.text()).toContain('后端返回非数组审计载荷')
  })

  it('keeps base replay cards visible and alerts when quality gray release decisions fail to load', async () => {
    readQualityKnowledgeGrayReleaseDecisionRecordsBackendFirst.mockRejectedValue(
      new Error('gray decision API unavailable'),
    )

    const wrapper = mountAuditDecisionReplayPanel()
    await flushPromises()

    expect(wrapper.findAll('.decision-card')).toHaveLength(2)
    expect(wrapper.get('.replay-detail h4').text()).toContain('WO-RUSH-9001 急单插入重排建议 回放链')
    const alert = wrapper.get('.replay-sync-alert')
    expect(alert.attributes('role')).toBe('alert')
    expect(alert.attributes('aria-live')).toBe('assertive')
    expect(alert.text()).toContain('质量灰度决策加载失败')
    expect(alert.text()).toContain('gray decision API unavailable')
  })

  it('selects quality recommendation feedback as the default replay chain with next-training evidence', async () => {
    readQualityKnowledgeRecommendationFeedbackRecordsBackendFirst.mockResolvedValue([
      {
        id: 'quality-feedback-r3-adoption',
        rankingId: 'reuse-rank-published-torque-retraining',
        trainingSetVersion: 'QK-TRAIN-20260521-R3',
        targetWorkOrderId: 'WO-DEMO-1018',
        operationCode: 'OP-20',
        decision: 'accepted',
        decisionLabel: '现场已采纳推荐',
        owner: '质量工程师 周工 / 装配班长 王工',
        reason: '现场采用再训练推荐替代原扫码返工泛化建议。',
        decidedAt: '2026-05-31T11:00:00.000Z',
        auditId: 'AUD-KG-QA-FEEDBACK-R3-20260531-001',
        traceId: 'TRACE-KG-QA-FEEDBACK-R3',
        effectScoreBefore: 89,
        effectScoreAfter: 94,
        effectTrendLabel: '89 -> 94 分',
        nextTrainingSetVersion: 'QK-TRAIN-20260521-R4',
        nextTrainingTraceId: 'TRACE-KG-QA-WO-DEMO-1018-OP-20-NEXT-TRAINING-R4',
        feedbackActions: ['把采纳结果、复验指标和负样本对照写入 R4。'],
        feedbackMetrics: [
          { label: '推荐采纳率', value: '100%' },
          { label: '复验通过率', value: '100%' },
          { label: '负样本误召回', value: '0 次' },
        ],
      },
    ])

    const wrapper = mountAuditDecisionReplayPanel()
    await flushPromises()

    expect(wrapper.get('.replay-detail h4').text()).toBe('WO-DEMO-1018 OP-20 QK-TRAIN-20260521-R3 推荐采纳回放 回放链')
    expect(wrapper.get('.replay-detail').text()).toContain('TRACE-KG-QA-FEEDBACK-R3')
    expect(wrapper.get('.replay-detail').text()).toContain('效果趋势 89 -> 94 分')
    expect(wrapper.get('.replay-detail').text()).toContain(
      '反馈指标：推荐采纳率 100% / 复验通过率 100% / 负样本误召回 0 次。',
    )
    expect(wrapper.get('.replay-detail').text()).toContain('QK-TRAIN-20260521-R4 下一轮训练集候选生成')
    expect(wrapper.get('.replay-detail').text()).toContain('TRACE-KG-QA-WO-DEMO-1018-OP-20-NEXT-TRAINING-R4')
    expect(wrapper.get('.replay-metrics').text()).toContain('质量推荐回放')
  })

  it('selects quality experiment candidate replay with rollback source and negative sample evidence', async () => {
    buildQualityKnowledgeRecommendationExperimentCandidateRecords.mockReturnValue([
      {
        id: 'quality-experiment-candidate-r4-negative',
        title: 'R4 负样本补丁实验候选',
        candidateTrainingSetVersion: 'QK-TRAIN-20260521-R4',
        sourceTrainingSetVersion: 'QK-TRAIN-20260521-R3',
        targetWorkOrderId: 'WO-DEMO-1018',
        operationCode: 'OP-20',
        candidateType: 'negative_sample_patch',
        statusLabel: '负样本补丁候选',
        statusClass: 'guarded',
        triggerLabel: 'R3 灰度回滚',
        negativeCoverageLabel: '硬度不足 / 扭矩偏移负样本',
        coveragePercentLabel: '覆盖 82%',
        gapLabel: '仍缺 3 条夜班返工误召回样本',
        adoptionRateLabel: '72%',
        recheckPassRateLabel: '88%',
        falseRecallLabel: '2 次',
        gatePolicyLabel: '采纳 >=95% / 复验 >=98% / 误召回 0',
        sourceAuditId: 'AUD-KG-QA-R3-ROLLBACK-20260521-001',
        sourceTraceId: 'TRACE-KG-QA-R3-ROLLBACK',
        auditId: 'AUD-KG-QA-R4-CANDIDATE-20260521-001',
        traceId: 'TRACE-KG-QA-R4-CANDIDATE',
        nextAction: '补齐夜班返工负样本后进入影子验证。',
        summary: 'R3 回滚后生成 R4 负样本补丁候选。',
        references: ['R3 灰度回滚审计', '夜班返工复验记录', '负样本误召回复盘'],
      },
    ])

    const wrapper = mountAuditDecisionReplayPanel()
    await flushPromises()

    expect(wrapper.get('.replay-detail h4').text()).toBe('QK-TRAIN-20260521-R4 负样本补丁候选回放 回放链')
    expect(wrapper.get('.replay-detail').text()).toContain(
      'QK-TRAIN-20260521-R3 回滚审计 AUD-KG-QA-R3-ROLLBACK-20260521-001 / TRACE-KG-QA-R3-ROLLBACK 触发候选生成。',
    )
    expect(wrapper.get('.replay-detail').text()).toContain(
      '指标快照：推荐采纳率 72% / 复验通过率 88% / 负样本误召回 2 次。',
    )
    expect(wrapper.get('.replay-detail').text()).toContain(
      '负样本覆盖 硬度不足 / 扭矩偏移负样本，覆盖率 覆盖 82%，仍缺 3 条夜班返工误召回样本。',
    )
    expect(wrapper.get('.replay-detail').text()).toContain(
      '候选审计 AUD-KG-QA-R4-CANDIDATE-20260521-001 / TRACE-KG-QA-R4-CANDIDATE；补齐夜班返工负样本后进入影子验证。',
    )
    expect(wrapper.get('.replay-detail').text()).toContain(
      '引用证据：R3 灰度回滚审计；夜班返工复验记录；负样本误召回复盘',
    )
    expect(wrapper.get('.replay-detail').text()).toContain(
      'QK-TRAIN-20260521-R4 未通过 采纳 >=95% / 复验 >=98% / 误召回 0 前不得进入主动推荐扩大。',
    )
    expect(wrapper.get('.replay-metrics').text()).toContain('质量实验候选')
  })

  it('selects quality gray release monitor replay with republish scope and monitoring evidence', async () => {
    qualityKnowledgeGrayReleaseCycleLabel.mockReturnValue('重新灰度发布')
    buildQualityKnowledgeGrayReleaseMonitorRecords.mockReturnValue([
      {
        id: 'quality-gray-release-monitor-r4-reopened',
        title: 'R4 重新灰度发布监控',
        trainingSetVersion: 'QK-TRAIN-20260521-R4',
        targetWorkOrderId: 'WO-DEMO-1018',
        operationCode: 'OP-20',
        publishedAt: '2026-05-22T10:30:00.000Z',
        releaseCycleLabel: '重新灰度发布',
        statusLabel: '重新灰度监控中',
        statusClass: 'guarded',
        versionLabel: 'R4 负样本补丁版',
        scopeLabel: 'OP-20 装配扭矩推荐灰度',
        recommendationScope: ['WO-DEMO-1018 OP-20', 'WO-DEMO-1020 OP-20'],
        adoptionRateLabel: '96%',
        recheckPassRateLabel: '99%',
        falseRecallLabel: '0 次',
        negativeSampleLabel: '夜班返工负样本已补齐',
        summary: '回滚问题单关闭后重新进入受控灰度。',
        auditId: 'AUD-KG-QA-R4-GRAY-REPUBLISH-20260522-001',
        traceId: 'TRACE-KG-QA-R4-GRAY-REPUBLISH',
        metrics: [
          { label: '推荐采纳率', value: '96%', statusClass: 'accepted' },
          { label: '复验通过率', value: '99%', statusClass: 'accepted' },
          { label: '负样本误召回', value: '0 次', statusClass: 'accepted' },
        ],
      },
    ])

    const wrapper = mountAuditDecisionReplayPanel()
    await flushPromises()

    expect(wrapper.get('.replay-detail h4').text()).toBe('QK-TRAIN-20260521-R4 重新灰度发布回放 回放链')
    expect(wrapper.get('.replay-detail').text()).toContain(
      'QK-TRAIN-20260521-R4 完成重新灰度发布，发布审计 AUD-KG-QA-R4-GRAY-REPUBLISH-20260522-001。',
    )
    expect(wrapper.get('.replay-detail').text()).toContain(
      '灰度范围：OP-20 装配扭矩推荐灰度，版本策略：R4 负样本补丁版。',
    )
    expect(wrapper.get('.replay-detail').text()).toContain('灰度范围明细：WO-DEMO-1018 OP-20 / WO-DEMO-1020 OP-20。')
    expect(wrapper.get('.replay-detail').text()).toContain(
      '监控指标：推荐采纳率 96% / 复验通过率 99% / 负样本误召回 0 次。',
    )
    expect(wrapper.get('.replay-detail').text()).toContain(
      'QK-TRAIN-20260521-R4 已在调整范围并重新校验后恢复灰度推荐，旧回滚问题单不再阻断本轮 active 选择。',
    )
    expect(wrapper.get('.replay-detail').text()).toContain('TRACE-KG-QA-R4-GRAY-REPUBLISH')
    expect(wrapper.get('.replay-metrics').text()).toContain('质量灰度发布')
  })

  it('keeps base replay cards visible and alerts when quality feedback inputs fail to load', async () => {
    readQualityKnowledgeRecommendationFeedbackRecordsBackendFirst.mockRejectedValue(
      new Error('feedback API unavailable'),
    )
    readQualityKnowledgeRetrainingVersionRecordsBackendFirst.mockResolvedValueOnce({ items: [] })

    const wrapper = mountAuditDecisionReplayPanel()
    await flushPromises()

    expect(wrapper.findAll('.decision-card')).toHaveLength(2)
    expect(wrapper.get('.replay-detail h4').text()).toContain('WO-RUSH-9001 急单插入重排建议 回放链')
    const alert = wrapper.get('.replay-sync-alert')
    expect(alert.attributes('role')).toBe('alert')
    expect(alert.attributes('aria-live')).toBe('assertive')
    expect(alert.text()).toContain('质量推荐反馈加载失败')
    expect(alert.text()).toContain('feedback API unavailable')
    expect(alert.text()).toContain('质量再训练版本加载失败')
    expect(alert.text()).toContain('后端返回非数组审计载荷')
  })

  it('keeps base replay cards visible and alerts when quality retraining versions fail to load', async () => {
    readQualityKnowledgeRetrainingVersionRecordsBackendFirst.mockRejectedValue(
      new Error('retraining version API unavailable'),
    )

    const wrapper = mountAuditDecisionReplayPanel()
    await flushPromises()

    expect(wrapper.findAll('.decision-card')).toHaveLength(2)
    expect(wrapper.get('.replay-detail h4').text()).toContain('WO-RUSH-9001 急单插入重排建议 回放链')
    const alert = wrapper.get('.replay-sync-alert')
    expect(alert.attributes('role')).toBe('alert')
    expect(alert.attributes('aria-live')).toBe('assertive')
    expect(alert.text()).toContain('质量再训练版本加载失败')
    expect(alert.text()).toContain('retraining version API unavailable')
  })
})
