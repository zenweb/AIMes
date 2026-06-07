import { flushPromises, mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import ChatPanel from '../../src/components/chat/ChatPanel.vue'

const routerPush = vi.hoisted(() => vi.fn())
const getChatHistory = vi.hoisted(() => vi.fn())
const queryKnowledge = vi.hoisted(() => vi.fn())
const getLlmStatus = vi.hoisted(() => vi.fn())
const readAnomalyDispatchRecordsBackendFirst = vi.hoisted(() => vi.fn())
const readMonitoringSituationEscalationsBackendFirst = vi.hoisted(() => vi.fn())
const readRiskSlaReviewRecordBackendFirst = vi.hoisted(() => vi.fn())
const recordAssistantActionAudit = vi.hoisted(() => vi.fn())
const writeAssistantRecoveryPackage = vi.hoisted(() => vi.fn())
const writeAssistantAnomalyDispositionPackage = vi.hoisted(() => vi.fn())
const writeAssistantEngineeringConstraintPackage = vi.hoisted(() => vi.fn())
const writeOtdKpiCommitmentPackage = vi.hoisted(() => vi.fn())
const upsertOtdEvidenceChainRecord = vi.hoisted(() => vi.fn())
const readOtdEvidenceChainRecords = vi.hoisted(() => vi.fn())
const writeBomKittingPackage = vi.hoisted(() => vi.fn())
const writeEquipmentDowntimeEvent = vi.hoisted(() => vi.fn())
const getLocalUserDisplayName = vi.hoisted(() => vi.fn())
const getLocalUserRole = vi.hoisted(() => vi.fn())

vi.mock('vue-router', () => ({
  useRouter: () => ({ push: routerPush }),
}))

vi.mock('../../src/api/knowledge', () => ({
  getChatHistory,
  queryKnowledge,
}))

vi.mock('../../src/api/llm', () => ({
  getLlmStatus,
}))

vi.mock('../../src/utils/anomaly-dispatch-sync', () => ({
  readAnomalyDispatchRecords: vi.fn(() => []),
  readAnomalyDispatchRecordsBackendFirst,
}))

vi.mock('../../src/utils/monitoring-situation-escalation-sync', () => ({
  readMonitoringSituationEscalations: vi.fn(() => []),
  readMonitoringSituationEscalationsBackendFirst,
}))

vi.mock('../../src/utils/risk-sla-review-sync', () => ({
  readRiskSlaReviewRecord: vi.fn(() => null),
  readRiskSlaReviewRecordBackendFirst,
}))

vi.mock('../../src/utils/assistant-anomaly-card-sync', () => ({
  writeAssistantAnomalyDispositionPackage,
}))

vi.mock('../../src/utils/assistant-engineering-constraint-package-sync', () => ({
  writeAssistantEngineeringConstraintPackage,
}))

vi.mock('../../src/utils/assistant-action-audit', () => ({
  recordAssistantActionAudit,
}))

vi.mock('../../src/utils/assistant-action-package-sync', () => ({
  writeAssistantRecoveryPackage,
}))

vi.mock('../../src/utils/knowledge-citations', () => ({
  findAssistantCitationTrace: vi.fn(() => null),
}))

vi.mock('../../src/utils/otd-kpi-commitment-sync', () => ({
  readLatestOtdKpiCommitmentPackage: vi.fn(() => null),
  writeOtdKpiCommitmentPackage,
}))

vi.mock('../../src/utils/poc-rollout-package-sync', () => ({
  readPocRolloutPackageRecord: vi.fn(() => null),
}))

vi.mock('../../src/utils/poc-pilot-run-sync', () => ({
  readPocPilotRunRecord: vi.fn(() => null),
}))

vi.mock('../../src/utils/poc-hypercare-sync', () => ({
  readPocHypercareAcceptanceRecord: vi.fn(() => null),
}))

vi.mock('../../src/utils/outsourcing-commitment-sync', () => ({
  readLatestOutsourcingCommitmentPackage: vi.fn(() => null),
}))

vi.mock('../../src/utils/quality-mrb-disposition-sync', () => ({
  readQualityMrbDispositionRecord: vi.fn(() => null),
}))

vi.mock('../../src/utils/quality-rework-sync', () => ({
  readQualityReworkImpact: vi.fn(() => null),
}))

vi.mock('../../src/utils/otd-evidence-chain-sync', () => ({
  readOtdEvidenceChainRecords,
  upsertOtdEvidenceChainRecord,
}))

vi.mock('../../src/utils/engineering-change-sync', () => ({
  readEngineeringChangeImpactAnalysis: vi.fn(() => null),
  readRouteCapabilityValidation: vi.fn(() => null),
}))

vi.mock('../../src/utils/shortage-risk-sync', () => ({
  readBomKittingPackage: vi.fn(() => null),
  writeBomKittingPackage,
}))

vi.mock('../../src/utils/equipment-risk-sync', () => ({
  writeEquipmentDowntimeEvent,
}))

vi.mock('../../src/utils/labor-assignment-sync', () => ({
  readLaborQualificationBlocks: vi.fn(() => []),
  readLaborReassignments: vi.fn(() => []),
}))

vi.mock('../../src/utils/local-user', () => ({
  getLocalUserDisplayName,
  getLocalUserRole,
}))

vi.mock('../../src/utils/quality-knowledge-sample-sync', () => ({
  qualityKnowledgeRecommendationReleaseScopeLabel: vi.fn(() => '正式范围'),
  readLatestQualityKnowledgeRecommendationFeedbackRecord: vi.fn(() => null),
  readLatestQualityKnowledgeReuseClosure: vi.fn(() => null),
  readLatestQualityKnowledgeReuseDraft: vi.fn(() => null),
  readLatestQualityKnowledgeReviewQueueRecord: vi.fn(() => null),
  readLatestQualityKnowledgeSample: vi.fn(() => null),
  readQualityKnowledgeRetrainingVersionRecords: vi.fn(() => []),
  selectPrioritizedQualityKnowledgeRecommendationVersion: vi.fn(() => null),
}))

function mountChatPanel() {
  return mount(ChatPanel, {
    props: {
      visible: true,
    },
  })
}

describe('ChatPanel', () => {
  beforeEach(() => {
    routerPush.mockReset()
    queryKnowledge.mockReset()
    recordAssistantActionAudit.mockReset()
    writeAssistantRecoveryPackage.mockReset()
    writeAssistantAnomalyDispositionPackage.mockReset()
    writeAssistantEngineeringConstraintPackage.mockReset()
    writeOtdKpiCommitmentPackage.mockReset()
    upsertOtdEvidenceChainRecord.mockReset()
    writeBomKittingPackage.mockReset()
    writeEquipmentDowntimeEvent.mockReset()
    getLocalUserDisplayName.mockReturnValue('王工')
    getLocalUserRole.mockReturnValue('Planner')
    getChatHistory.mockResolvedValue({ messages: [] })
    queryKnowledge.mockResolvedValue({ answer: '默认回答', sources: [] })
    getLlmStatus.mockResolvedValue({ provider: 'Ollama', model: 'qwen2.5' })
    readAnomalyDispatchRecordsBackendFirst.mockResolvedValue([])
    readMonitoringSituationEscalationsBackendFirst.mockResolvedValue([])
    readRiskSlaReviewRecordBackendFirst.mockResolvedValue(null)
    readOtdEvidenceChainRecords.mockReturnValue([])
    writeBomKittingPackage.mockImplementation(record => record)
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
  })

  it('exposes the assistant panel as a labelled modal dialog', async () => {
    const wrapper = mountChatPanel()

    const panel = wrapper.get('.chat-panel')
    expect(panel.attributes('role')).toBe('dialog')
    expect(panel.attributes('aria-modal')).toBe('true')
    expect(panel.attributes('aria-labelledby')).toBe('chat-panel-title')
    expect(wrapper.get('#chat-panel-title').text()).toBe('AI 生产助手')
    expect(wrapper.get('textarea').attributes('aria-label')).toBe('输入生产相关问题')

    await wrapper.get('.close-btn').trigger('click')

    expect(wrapper.emitted('close')).toHaveLength(1)
  })

  it('announces assistant conversation updates as a polite message log', () => {
    const wrapper = mountChatPanel()

    const messages = wrapper.get('.chat-messages')
    expect(messages.attributes('role')).toBe('log')
    expect(messages.attributes('aria-live')).toBe('polite')
    expect(messages.attributes('aria-label')).toBe('AI 生产助手消息')
  })

  it('alerts instead of crashing when startup context sync fails', async () => {
    readAnomalyDispatchRecordsBackendFirst.mockRejectedValueOnce(new Error('anomaly context unavailable'))
    const wrapper = mountChatPanel()

    await flushPromises()

    const alert = wrapper.get('.message.assistant[role="alert"]')
    expect(alert.attributes('aria-live')).toBe('assertive')
    expect(alert.text()).toContain('助手上下文同步失败')
    expect(alert.text()).toContain('anomaly context unavailable')
    expect(wrapper.get('.chat-input').attributes('disabled')).toBeUndefined()
  })

  it('continues loading other startup context sources when one source fails', async () => {
    readAnomalyDispatchRecordsBackendFirst.mockRejectedValueOnce(new Error('anomaly context unavailable'))
    readMonitoringSituationEscalationsBackendFirst.mockResolvedValueOnce([{
      id: 'monitoring-situation-sf-001',
      sourceEventId: 'sf-001',
      title: 'CNC 现场态势升级处置包',
      source: '实时监控',
      workOrders: 'WO-RUSH-9001',
      priority: 'critical',
      owner: '生产经理审批',
      dueAt: '今日 11:30',
      auditId: 'AUD-SF-ESC-SF-001-20260521',
      traceId: 'TRACE-SF-ESC-SF-001',
      status: 'escalated',
      statusLabel: '待跨模块处置',
      scheduleWindow: '锁定期后第一个 CNC 空窗 + 夜班复核',
      scheduleAction: '冻结当前瓶颈任务并复核缺料窗口。',
      riskImpact: '现场态势已升级为跨模块处置包。',
      riskSuggestion: '风险队列升级给生产经理。',
      otdImpact: '+6%',
      delayImpact: '-1 单延期风险 / -4h 瓶颈等待',
      changeoverImpact: '+10min 可控',
      summary: '现场态势触发跨模块处置。',
      evidence: ['TRACE-SF-SF-001'],
      dispatchSteps: ['实时监控识别风险。'],
      createdAt: '2026-06-05T02:00:00.000Z',
    }])
    readRiskSlaReviewRecordBackendFirst.mockResolvedValueOnce({
      title: '风险 SLA 逾期晨会复核包',
      reviewMeetingId: 'RISK-SLA-20260601',
      auditId: 'AUD-RISK-SLA-001',
    })

    mountChatPanel()
    await flushPromises()

    expect(readMonitoringSituationEscalationsBackendFirst).toHaveBeenCalledTimes(1)
    expect(readRiskSlaReviewRecordBackendFirst).toHaveBeenCalledTimes(1)
  })

  it('alerts instead of showing an empty state silently when chat history loading fails', async () => {
    getChatHistory.mockRejectedValueOnce(new Error('chat history unavailable'))
    const wrapper = mount(ChatPanel, {
      props: {
        visible: false,
      },
    })

    await wrapper.setProps({ visible: true })
    await flushPromises()

    const alert = wrapper.get('.message.assistant[role="alert"]')
    expect(alert.attributes('aria-live')).toBe('assertive')
    expect(alert.text()).toContain('聊天历史加载失败')
    expect(alert.text()).toContain('chat history unavailable')
    expect(wrapper.get('.chat-input').attributes('disabled')).toBeUndefined()
  })

  it('alerts instead of showing an empty state silently when chat history payload is not business data', async () => {
    getChatHistory.mockResolvedValueOnce('<!doctype html><html><body>SPA fallback</body></html>')
    const wrapper = mount(ChatPanel, {
      props: {
        visible: false,
      },
    })

    await wrapper.setProps({ visible: true })
    await flushPromises()

    const alert = wrapper.get('.message.assistant[role="alert"]')
    expect(alert.attributes('aria-live')).toBe('assertive')
    expect(alert.text()).toContain('聊天历史加载失败')
    expect(alert.text()).toContain('后端返回非聊天历史载荷')
    expect(wrapper.get('.chat-input').attributes('disabled')).toBeUndefined()
  })

  it('alerts instead of silently hiding the model badge when LLM status loading fails', async () => {
    getLlmStatus.mockRejectedValueOnce(new Error('llm status unavailable'))
    const wrapper = mountChatPanel()

    await flushPromises()

    expect(wrapper.find('.model-badge').exists()).toBe(false)
    const alert = wrapper.get('.message.assistant[role="alert"]')
    expect(alert.attributes('aria-live')).toBe('assertive')
    expect(alert.text()).toContain('LLM 状态加载失败')
    expect(alert.text()).toContain('llm status unavailable')
    expect(wrapper.get('.chat-input').attributes('disabled')).toBeUndefined()
  })

  it('sends the current question and exposes backend sources as a focusable disclosure', async () => {
    queryKnowledge.mockResolvedValueOnce({
      answer: '当前产能稳定，CNC 产线负荷 82%。',
      sources: [
        {
          sourceId: 'SRC-001',
          sourceName: '生产日报 2026-06-02',
          content: '',
          relevanceScore: 0.91,
        },
      ],
    })
    const wrapper = mountChatPanel()

    await wrapper.get('.chat-input').setValue(' 当前产能如何？ ')
    await wrapper.get('.send-btn').trigger('click')
    await flushPromises()

    expect(queryKnowledge).toHaveBeenCalledWith({
      question: '当前产能如何？',
      sessionId: expect.stringMatching(/^session-/),
      topK: 5,
    })
    expect(wrapper.text()).toContain('当前产能如何？')
    expect(wrapper.text()).toContain('当前产能稳定，CNC 产线负荷 82%。')

    const sourceToggle = wrapper.get('button.sources-toggle')
    expect(sourceToggle.text()).toBe('参考来源 (1)')

    await sourceToggle.trigger('click')

    expect(wrapper.text()).toContain('生产日报 2026-06-02')
    expect(wrapper.text()).toContain('91%')
  })

  it('announces that the assistant is working while a knowledge query is pending', async () => {
    let resolveQuery: (value: { answer: string; sources: [] }) => void = () => {}
    queryKnowledge.mockReturnValueOnce(new Promise(resolve => {
      resolveQuery = resolve
    }))
    const wrapper = mountChatPanel()

    await wrapper.get('.chat-input').setValue('当前产能如何？')
    await wrapper.get('.send-btn').trigger('click')
    await flushPromises()

    const typing = wrapper.get('.message.assistant.typing')
    expect(typing.attributes('role')).toBe('status')
    expect(typing.attributes('aria-live')).toBe('polite')
    expect(typing.attributes('aria-label')).toBe('AI 生产助手正在生成回复')

    resolveQuery({ answer: '当前产能稳定。', sources: [] })
    await flushPromises()

    expect(wrapper.find('.message.assistant.typing').exists()).toBe(false)
    expect(wrapper.text()).toContain('当前产能稳定。')
  })

  it('announces knowledge query failures before using the demo fallback', async () => {
    queryKnowledge.mockRejectedValueOnce(new Error('RAG 服务不可用'))
    const wrapper = mountChatPanel()

    await wrapper.get('.chat-input').setValue('当前产能如何？')
    await wrapper.get('.send-btn').trigger('click')
    await flushPromises()

    expect(queryKnowledge).toHaveBeenCalledWith({
      question: '当前产能如何？',
      sessionId: expect.stringMatching(/^session-/),
      topK: 5,
    })
    const alert = wrapper.get('.message.assistant[role="alert"]')
    expect(alert.attributes('aria-live')).toBe('assertive')
    expect(alert.text()).toContain('知识问答服务暂不可用，已切换到离线演示回答。')
    expect(alert.text()).toContain('RAG 服务不可用')
    expect(alert.text()).toContain('当前车间整体设备利用率')
  })

  it('announces malformed knowledge query payloads before using the demo fallback', async () => {
    queryKnowledge.mockResolvedValueOnce('<!doctype html><html><body>SPA fallback</body></html>')
    const wrapper = mountChatPanel()

    await wrapper.get('.chat-input').setValue('当前产能如何？')
    await wrapper.get('.send-btn').trigger('click')
    await flushPromises()

    const alert = wrapper.get('.message.assistant[role="alert"]')
    expect(alert.attributes('aria-live')).toBe('assertive')
    expect(alert.text()).toContain('知识问答服务暂不可用，已切换到离线演示回答。')
    expect(alert.text()).toContain('后端返回非知识问答载荷')
    expect(alert.text()).toContain('当前车间整体设备利用率')
  })

  it('uses the latest production completion and review evidence when RAG falls back to demo analysis', async () => {
    queryKnowledge.mockRejectedValueOnce(new Error('RAG 服务不可用'))
    readOtdEvidenceChainRecords.mockReturnValue([
      {
        id: 'old-completion',
        stage: '生产完工',
        title: 'WO-OLD 完工证据',
        summary: '旧完工证据不应出现在回答中。',
        object: 'WO-OLD',
        source: '生产报工 / 旧记录',
        traceId: 'TRACE-OLD-COMPLETE',
        status: 'closed',
        statusLabel: '旧记录',
        createdAt: '2026-06-01T01:00:00.000Z',
      },
      {
        id: 'completion',
        stage: '生产完工',
        title: 'WO-RUSH-9001 OP-030 完工已写入 OTD 复盘',
        summary: 'OP-030 精加工完工，后续质量门需要复核。',
        object: 'WO-RUSH-9001',
        source: '生产报工 / 王工',
        traceId: 'TRACE-PROD-COMPLETE-WO-RUSH-9001-OP030',
        status: 'active',
        statusLabel: '待复核',
        createdAt: '2026-06-05T08:00:00.000Z',
      },
      {
        id: 'review',
        stage: '生产复核',
        title: 'WO-RUSH-9001 质量门复核',
        summary: '质量门已保留，AI 排产等待复核放行。',
        object: 'WO-RUSH-9001',
        source: 'AI 排产 / 质量门',
        traceId: 'TRACE-PROD-REVIEW-WO-RUSH-9001-OP030',
        status: 'active',
        statusLabel: '待质量门放行',
        createdAt: '2026-06-05T08:30:00.000Z',
      },
    ])
    const wrapper = mountChatPanel()

    await wrapper.get('.chat-input').setValue('WO-RUSH-9001 生产完工对 OTD 复核有什么影响？')
    await wrapper.get('.send-btn').trigger('click')
    await flushPromises()

    const alert = wrapper.get('.message.assistant[role="alert"]')
    expect(alert.attributes('aria-live')).toBe('assertive')
    expect(alert.text()).toContain('知识问答服务暂不可用，已切换到离线演示回答。')
    expect(alert.text()).toContain('WO-RUSH-9001 已进入 OTD 复盘')
    expect(alert.text()).toContain('OP-030 精加工完工，后续质量门需要复核。')
    expect(alert.text()).toContain('WO-RUSH-9001 质量门复核')
    expect(alert.text()).toContain('TRACE-PROD-COMPLETE-WO-RUSH-9001-OP030 / TRACE-PROD-REVIEW-WO-RUSH-9001-OP030')
    expect(alert.text()).not.toContain('TRACE-OLD-COMPLETE')
  })

  it('uses production anomaly evidence when RAG falls back to demo analysis', async () => {
    queryKnowledge.mockRejectedValueOnce(new Error('RAG 服务不可用'))
    readOtdEvidenceChainRecords.mockReturnValue([
      {
        id: 'production-anomaly',
        stage: '生产异常',
        title: 'CNC-001 主轴温升异常已上报',
        summary: '班组长已冻结 OP-020 精加工窗口，并同步风险队列。',
        object: 'WO-RUSH-9001 / OP-020 / CNC-001',
        source: '生产报工 / 班组长',
        traceId: 'TRACE-PROD-ANOMALY-CNC001-TEMP',
        sourceTraceId: 'TRACE-RISK-CNC001-TEMP',
        status: 'active',
        statusLabel: '待处置',
        createdAt: '2026-06-05T09:00:00.000Z',
      },
    ])
    const wrapper = mountChatPanel()

    await wrapper.get('.chat-input').setValue('生产异常上报后对排产和 OTD 证据有什么影响？')
    await wrapper.get('.send-btn').trigger('click')
    await flushPromises()

    const alert = wrapper.get('.message.assistant[role="alert"]')
    expect(alert.attributes('aria-live')).toBe('assertive')
    expect(alert.text()).toContain('CNC-001 主轴温升异常已上报')
    expect(alert.text()).toContain('班组长已冻结 OP-020 精加工窗口，并同步风险队列。')
    expect(alert.text()).toContain('TRACE-PROD-ANOMALY-CNC001-TEMP / TRACE-RISK-CNC001-TEMP')
    expect(alert.text()).toContain('系统管理 Agent 治理、报表 OTD 证据链和审计回放必须核对同一生产异常追踪编号')
  })

  it('announces when a plain navigation action fails instead of crashing', async () => {
    routerPush.mockRejectedValueOnce(new Error('risk route unavailable'))
    const wrapper = mountChatPanel()

    await wrapper.get('.chat-input').setValue('打开风险预警')
    await wrapper.get('.send-btn').trigger('click')
    await flushPromises()

    const actionButton = wrapper.findAll('.action-btn')
      .find(button => button.text() === '打开风险预警')
    expect(actionButton).toBeDefined()
    await actionButton!.trigger('click')
    await flushPromises()

    expect(routerPush).toHaveBeenCalledWith('/risk')
    const alert = wrapper.get('.message.assistant[role="alert"]')
    expect(alert.attributes('aria-live')).toBe('assertive')
    expect(alert.text()).toContain('打开风险预警页面跳转失败')
    expect(alert.text()).toContain('risk route unavailable')
  })

  it('refuses restricted actions with an audited alert instead of navigating', async () => {
    const wrapper = mountChatPanel()

    await wrapper.get('.chat-input').setValue('帮我生成交期恢复执行包')
    await wrapper.get('.send-btn').trigger('click')
    await flushPromises()

    await wrapper.get('.action-btn').trigger('click')
    await flushPromises()

    expect(routerPush).not.toHaveBeenCalled()
    expect(recordAssistantActionAudit).toHaveBeenCalledWith(expect.objectContaining({
      actor: '王工',
      role: 'Planner',
      permitted: false,
      action: expect.objectContaining({
        id: 'create-delivery-recovery-package',
        requiredRole: 'Admin',
      }),
    }))
    const alert = wrapper.get('.message.assistant[role="alert"]')
    expect(alert.text()).toContain('动作已拒绝：当前用户缺少 Admin 权限')
    expect(alert.text()).toContain('未执行 生成交期恢复执行包')
  })

  it('fails loud when restricted action denial audit cannot be written', async () => {
    recordAssistantActionAudit.mockImplementationOnce(() => {
      throw new Error('audit storage unavailable')
    })
    const wrapper = mountChatPanel()

    await wrapper.get('.chat-input').setValue('帮我生成交期恢复执行包')
    await wrapper.get('.send-btn').trigger('click')
    await flushPromises()

    await wrapper.get('.action-btn').trigger('click')
    await flushPromises()

    expect(routerPush).not.toHaveBeenCalled()
    expect(writeAssistantRecoveryPackage).not.toHaveBeenCalled()
    const alert = wrapper.get('.message.assistant[role="alert"]')
    expect(alert.attributes('aria-live')).toBe('assertive')
    expect(alert.text()).toContain('动作已拒绝：当前用户缺少 Admin 权限')
    expect(alert.text()).toContain('拒绝审计写入失败')
    expect(alert.text()).toContain('audit storage unavailable')
  })

  it('creates a delivery recovery package and announces the completed action as a status update', async () => {
    getLocalUserRole.mockReturnValue('Admin')
    writeAssistantRecoveryPackage.mockReturnValue({
      id: 'assistant-recovery-wo-rush-9001',
      title: 'WO-RUSH-9001 交期恢复执行包',
      auditCode: 'AUD-CHAT-RECOVERY-20260521-001',
      traceId: 'TRACE-CHAT-RECOVERY-WO-RUSH-9001',
      actor: '王工',
      role: 'Admin',
      workOrders: 'WO-RUSH-9001 / WO-20260501',
      priority: 'critical',
      owner: '交付 PM / 调度员 李工',
      dueAt: '今日 18:00',
      scheduleWindow: '今日夜班 CNC-003 20:00-02:00',
      scheduleAction: '锁定急单并触发换设备重排',
      riskImpact: '延期风险从 3 单降至 1 单',
      riskSuggestion: '采购、质量、排产三线并行闭环',
      otdImpact: '+14% OTD 恢复模拟',
      delayImpact: '减少 2 单延期',
      changeoverImpact: '换线增加 0.5h',
      status: 'active',
      statusLabel: '待跨部门闭环',
      summary: '交期恢复执行包已同步到 AI 排产、风险队列、采购和质量责任动作。',
      dispatchSteps: [
        {
          module: 'AI 排产',
          owner: '调度员 李工',
          action: '将 WO-RUSH-9001 插入 CNC-003 夜班窗口',
          evidence: 'TRACE-CHAT-RECOVERY-WO-RUSH-9001-SCHEDULE',
        },
      ],
      createdAt: '2026-06-02T04:50:00.000Z',
    })
    const wrapper = mountChatPanel()

    await wrapper.get('.chat-input').setValue('帮我生成交期恢复执行包')
    await wrapper.get('.send-btn').trigger('click')
    await flushPromises()

    await wrapper.get('.action-btn').trigger('click')
    await flushPromises()

    expect(writeAssistantRecoveryPackage).toHaveBeenCalledWith({
      actor: '王工',
      role: 'Admin',
    })
    expect(routerPush).toHaveBeenCalledWith('/scheduling')
    expect(recordAssistantActionAudit).toHaveBeenCalledWith(expect.objectContaining({
      actor: '王工',
      role: 'Admin',
      permitted: true,
      action: expect.objectContaining({
        id: 'create-delivery-recovery-package',
        type: 'delivery_recovery_package',
      }),
    }))

    const status = wrapper.get('.message.assistant[role="status"]')
    expect(status.attributes('aria-live')).toBe('polite')
    expect(status.text()).toContain('动作已执行：已生成 WO-RUSH-9001 交期恢复执行包')
    expect(status.text()).toContain('WO-RUSH-9001 交期恢复执行包')
    expect(status.text()).toContain('TRACE-CHAT-RECOVERY-WO-RUSH-9001')
  })

  it('announces when delivery recovery package creation fails without navigating', async () => {
    getLocalUserRole.mockReturnValue('Admin')
    writeAssistantRecoveryPackage.mockImplementationOnce(() => {
      throw new Error('recovery package storage unavailable')
    })
    const wrapper = mountChatPanel()

    await wrapper.get('.chat-input').setValue('帮我生成交期恢复执行包')
    await wrapper.get('.send-btn').trigger('click')
    await flushPromises()

    await wrapper.get('.action-btn').trigger('click')
    await flushPromises()

    expect(writeAssistantRecoveryPackage).toHaveBeenCalledWith({
      actor: '王工',
      role: 'Admin',
    })
    expect(routerPush).not.toHaveBeenCalledWith('/scheduling')
    expect(recordAssistantActionAudit).toHaveBeenCalledWith(expect.objectContaining({
      actor: '王工',
      role: 'Admin',
      permitted: false,
      action: expect.objectContaining({
        id: 'create-delivery-recovery-package',
        type: 'delivery_recovery_package',
      }),
    }))

    const alert = wrapper.get('.message.assistant[role="alert"]')
    expect(alert.attributes('aria-live')).toBe('assertive')
    expect(alert.text()).toContain('动作执行失败：生成交期恢复执行包')
    expect(alert.text()).toContain('recovery package storage unavailable')
  })

  it('keeps the completed action visible when the success audit cannot be written', async () => {
    getLocalUserRole.mockReturnValue('Admin')
    writeAssistantRecoveryPackage.mockReturnValue({
      id: 'assistant-recovery-wo-rush-9001',
      title: 'WO-RUSH-9001 交期恢复执行包',
      auditCode: 'AUD-CHAT-RECOVERY-20260521-001',
      traceId: 'TRACE-CHAT-RECOVERY-WO-RUSH-9001',
      actor: '王工',
      role: 'Admin',
      workOrders: 'WO-RUSH-9001 / WO-20260501',
      priority: 'critical',
      owner: '交付 PM / 调度员 李工',
      dueAt: '今日 18:00',
      scheduleWindow: '今日夜班 CNC-003 20:00-02:00',
      scheduleAction: '锁定急单并触发换设备重排',
      riskImpact: '延期风险从 3 单降至 1 单',
      riskSuggestion: '采购、质量、排产三线并行闭环',
      otdImpact: '+14% OTD 恢复模拟',
      delayImpact: '减少 2 单延期',
      changeoverImpact: '换线增加 0.5h',
      status: 'active',
      statusLabel: '待跨部门闭环',
      summary: '交期恢复执行包已同步到 AI 排产、风险队列、采购和质量责任动作。',
      dispatchSteps: [
        {
          module: 'AI 排产',
          owner: '调度员 李工',
          action: '将 WO-RUSH-9001 插入 CNC-003 夜班窗口',
          evidence: 'TRACE-CHAT-RECOVERY-WO-RUSH-9001-SCHEDULE',
        },
      ],
      createdAt: '2026-06-02T04:50:00.000Z',
    })
    recordAssistantActionAudit.mockImplementationOnce(() => {
      throw new Error('success audit storage unavailable')
    })
    const wrapper = mountChatPanel()

    await wrapper.get('.chat-input').setValue('帮我生成交期恢复执行包')
    await wrapper.get('.send-btn').trigger('click')
    await flushPromises()

    await wrapper.get('.action-btn').trigger('click')
    await flushPromises()

    expect(writeAssistantRecoveryPackage).toHaveBeenCalledWith({
      actor: '王工',
      role: 'Admin',
    })
    expect(routerPush).toHaveBeenCalledWith('/scheduling')
    expect(recordAssistantActionAudit).toHaveBeenCalledTimes(1)
    expect(recordAssistantActionAudit).toHaveBeenCalledWith(expect.objectContaining({
      actor: '王工',
      role: 'Admin',
      permitted: true,
      action: expect.objectContaining({
        id: 'create-delivery-recovery-package',
        type: 'delivery_recovery_package',
      }),
    }))

    const status = wrapper.get('.message.assistant[role="status"]')
    expect(status.text()).toContain('动作已执行：已生成 WO-RUSH-9001 交期恢复执行包')
    const alert = wrapper.get('.message.assistant[role="alert"]')
    expect(alert.attributes('aria-live')).toBe('assertive')
    expect(alert.text()).toContain('动作已执行，但成功审计写入失败')
    expect(alert.text()).toContain('success audit storage unavailable')
    expect(alert.text()).not.toContain('动作执行失败：生成交期恢复执行包')
  })

  it('keeps the completed delivery recovery package visible when navigation fails', async () => {
    getLocalUserRole.mockReturnValue('Admin')
    writeAssistantRecoveryPackage.mockReturnValue({
      id: 'assistant-recovery-wo-rush-9001',
      title: 'WO-RUSH-9001 交期恢复执行包',
      auditCode: 'AUD-CHAT-RECOVERY-20260521-001',
      traceId: 'TRACE-CHAT-RECOVERY-WO-RUSH-9001',
      actor: '王工',
      role: 'Admin',
      workOrders: 'WO-RUSH-9001 / WO-20260501',
      priority: 'critical',
      owner: '交付 PM / 调度员 李工',
      dueAt: '今日 18:00',
      scheduleWindow: '今日夜班 CNC-003 20:00-02:00',
      scheduleAction: '锁定急单并触发换设备重排',
      riskImpact: '延期风险从 3 单降至 1 单',
      riskSuggestion: '采购、质量、排产三线并行闭环',
      otdImpact: '+14% OTD 恢复模拟',
      delayImpact: '减少 2 单延期',
      changeoverImpact: '换线增加 0.5h',
      status: 'active',
      statusLabel: '待跨部门闭环',
      summary: '交期恢复执行包已同步到 AI 排产、风险队列、采购和质量责任动作。',
      dispatchSteps: [
        {
          module: 'AI 排产',
          owner: '调度员 李工',
          action: '将 WO-RUSH-9001 插入 CNC-003 夜班窗口',
          evidence: 'TRACE-CHAT-RECOVERY-WO-RUSH-9001-SCHEDULE',
        },
      ],
      createdAt: '2026-06-02T04:50:00.000Z',
    })
    routerPush.mockRejectedValueOnce(new Error('scheduling route unavailable'))
    const wrapper = mountChatPanel()

    await wrapper.get('.chat-input').setValue('帮我生成交期恢复执行包')
    await wrapper.get('.send-btn').trigger('click')
    await flushPromises()

    await wrapper.get('.action-btn').trigger('click')
    await flushPromises()

    expect(writeAssistantRecoveryPackage).toHaveBeenCalledWith({
      actor: '王工',
      role: 'Admin',
    })
    expect(routerPush).toHaveBeenCalledWith('/scheduling')
    expect(recordAssistantActionAudit).toHaveBeenCalledWith(expect.objectContaining({
      actor: '王工',
      role: 'Admin',
      permitted: true,
      action: expect.objectContaining({
        id: 'create-delivery-recovery-package',
        type: 'delivery_recovery_package',
      }),
    }))

    const status = wrapper.get('.message.assistant[role="status"]')
    expect(status.text()).toContain('动作已执行：已生成 WO-RUSH-9001 交期恢复执行包')
    expect(status.text()).toContain('WO-RUSH-9001 交期恢复执行包')
    const alert = wrapper.get('.message.assistant[role="alert"]')
    expect(alert.attributes('aria-live')).toBe('assertive')
    expect(alert.text()).toContain('交期恢复执行包已生成，但页面跳转失败')
    expect(alert.text()).toContain('scheduling route unavailable')
    expect(alert.text()).not.toContain('动作执行失败：生成交期恢复执行包')
  })

  it('fails loud when failed action audit cannot be written', async () => {
    getLocalUserRole.mockReturnValue('Admin')
    writeAssistantRecoveryPackage.mockImplementationOnce(() => {
      throw new Error('recovery package storage unavailable')
    })
    recordAssistantActionAudit.mockImplementationOnce(() => {
      throw new Error('failed action audit storage unavailable')
    })
    const wrapper = mountChatPanel()

    await wrapper.get('.chat-input').setValue('帮我生成交期恢复执行包')
    await wrapper.get('.send-btn').trigger('click')
    await flushPromises()

    await wrapper.get('.action-btn').trigger('click')
    await flushPromises()

    expect(writeAssistantRecoveryPackage).toHaveBeenCalledWith({
      actor: '王工',
      role: 'Admin',
    })
    expect(routerPush).not.toHaveBeenCalledWith('/scheduling')
    const alert = wrapper.get('.message.assistant[role="alert"]')
    expect(alert.attributes('aria-live')).toBe('assertive')
    expect(alert.text()).toContain('动作执行失败：生成交期恢复执行包')
    expect(alert.text()).toContain('recovery package storage unavailable')
    expect(alert.text()).toContain('失败审计写入失败')
    expect(alert.text()).toContain('failed action audit storage unavailable')
  })

  it('creates an anomaly disposition package and announces the completed action as a status update', async () => {
    getLocalUserRole.mockReturnValue('Admin')
    writeAssistantAnomalyDispositionPackage.mockReturnValue({
      id: 'assistant-anomaly-cnc001-temperature',
      title: 'CNC-001 主轴温升异常处置卡',
      auditCode: 'AUD-CHAT-ANOMALY-20260522-001',
      traceId: 'TRACE-CHAT-ANOMALY-CNC001-TEMP-20260522',
      actor: '王工',
      role: 'Admin',
      workOrders: 'WO-RUSH-9001 / WO-20260501',
      priority: 'critical',
      owner: '设备主管 赵工',
      dueAt: '今日 14:00',
      anomalyTitle: 'CNC-001 主轴温升异常',
      operationCode: 'OP-020',
      equipmentId: 'CNC-001',
      deliveryImpact: '预计影响 2h 瓶颈设备窗口',
      scheduleWindow: '当前 CNC 精加工窗口立即冻结',
      statusLabel: '助手已创建待分流',
      summary: '异常处置卡已同步到现场异常、风险队列、AI 排产复核和 OTD 证据链。',
      dispatchSteps: [
        {
          module: '异常管理',
          owner: '班组长 孙八',
          action: '登记 CNC-001 主轴温升异常',
          evidence: 'TRACE-CHAT-ANOMALY-CNC001-TEMP-20260522',
        },
      ],
      createdAt: '2026-06-02T04:20:00.000Z',
    })
    const wrapper = mountChatPanel()

    await wrapper.get('.chat-input').setValue('请创建异常处置卡')
    await wrapper.get('.send-btn').trigger('click')
    await flushPromises()

    const createPackageButton = wrapper.findAll('.action-btn')
      .find(button => button.text() === '创建异常处置卡')
    expect(createPackageButton).toBeDefined()
    await createPackageButton!.trigger('click')
    await flushPromises()

    expect(writeAssistantAnomalyDispositionPackage).toHaveBeenCalledWith({
      actor: '王工',
      role: 'Admin',
    })
    expect(routerPush).toHaveBeenCalledWith('/anomaly')
    expect(recordAssistantActionAudit).toHaveBeenCalledWith(expect.objectContaining({
      actor: '王工',
      role: 'Admin',
      permitted: true,
      action: expect.objectContaining({
        id: 'create-anomaly-card',
        type: 'create_anomaly_card',
      }),
    }))

    const status = wrapper.get('.message.assistant[role="status"]')
    expect(status.attributes('aria-live')).toBe('polite')
    expect(status.text()).toContain('动作已执行：已创建 CNC-001 主轴温升异常处置卡')
    expect(status.text()).toContain('CNC-001 主轴温升异常处置卡')
    expect(status.text()).toContain('TRACE-CHAT-ANOMALY-CNC001-TEMP-20260522')
  })

  it('keeps the completed anomaly disposition package visible when navigation fails', async () => {
    getLocalUserRole.mockReturnValue('Admin')
    writeAssistantAnomalyDispositionPackage.mockReturnValue({
      id: 'assistant-anomaly-cnc001-temperature',
      title: 'CNC-001 主轴温升异常处置卡',
      auditCode: 'AUD-CHAT-ANOMALY-20260522-001',
      traceId: 'TRACE-CHAT-ANOMALY-CNC001-TEMP-20260522',
      actor: '王工',
      role: 'Admin',
      workOrders: 'WO-RUSH-9001 / WO-20260501',
      priority: 'critical',
      owner: '设备主管 赵工',
      dueAt: '今日 14:00',
      anomalyTitle: 'CNC-001 主轴温升异常',
      operationCode: 'OP-020',
      equipmentId: 'CNC-001',
      deliveryImpact: '预计影响 2h 瓶颈设备窗口',
      scheduleWindow: '当前 CNC 精加工窗口立即冻结',
      statusLabel: '助手已创建待分流',
      summary: '异常处置卡已同步到现场异常、风险队列、AI 排产复核和 OTD 证据链。',
      dispatchSteps: [
        {
          module: '异常管理',
          owner: '班组长 孙八',
          action: '登记 CNC-001 主轴温升异常',
          evidence: 'TRACE-CHAT-ANOMALY-CNC001-TEMP-20260522',
        },
      ],
      createdAt: '2026-06-02T04:20:00.000Z',
    })
    routerPush.mockRejectedValueOnce(new Error('anomaly route unavailable'))
    const wrapper = mountChatPanel()

    await wrapper.get('.chat-input').setValue('请创建异常处置卡')
    await wrapper.get('.send-btn').trigger('click')
    await flushPromises()

    const createPackageButton = wrapper.findAll('.action-btn')
      .find(button => button.text() === '创建异常处置卡')
    expect(createPackageButton).toBeDefined()
    await createPackageButton!.trigger('click')
    await flushPromises()

    expect(writeAssistantAnomalyDispositionPackage).toHaveBeenCalledWith({
      actor: '王工',
      role: 'Admin',
    })
    expect(routerPush).toHaveBeenCalledWith('/anomaly')
    expect(recordAssistantActionAudit).toHaveBeenCalledWith(expect.objectContaining({
      actor: '王工',
      role: 'Admin',
      permitted: true,
      action: expect.objectContaining({
        id: 'create-anomaly-card',
        type: 'create_anomaly_card',
      }),
    }))

    const status = wrapper.get('.message.assistant[role="status"]')
    expect(status.text()).toContain('动作已执行：已创建 CNC-001 主轴温升异常处置卡')
    expect(status.text()).toContain('CNC-001 主轴温升异常处置卡')
    const alert = wrapper.get('.message.assistant[role="alert"]')
    expect(alert.attributes('aria-live')).toBe('assertive')
    expect(alert.text()).toContain('异常处置卡已创建，但页面跳转失败')
    expect(alert.text()).toContain('anomaly route unavailable')
    expect(alert.text()).not.toContain('动作执行失败：创建异常处置卡')
  })

  it('creates an engineering constraint package and announces the completed action as a status update', async () => {
    getLocalUserRole.mockReturnValue('Admin')
    writeAssistantEngineeringConstraintPackage.mockReturnValue({
      id: 'assistant-engineering-constraint-a100-rb200',
      title: 'BOM-A100 / R-B200 工程约束复核包',
      auditCode: 'AUD-CHAT-ENG-CONSTRAINT-20260523-001',
      traceId: 'TRACE-CHAT-ENG-CONSTRAINT-PACKAGE-20260523',
      actor: '王工',
      role: 'Admin',
      workOrders: 'WO-RUSH-9001 / WO-DEMO-1002',
      priority: 'warning',
      owner: '工程经理 / 制造经理联合复核',
      dueAt: '今日 16:30',
      bomCode: 'BOM-A100',
      ecnCode: 'ECN-BOM-A100-6061B-20260521',
      routeCode: 'R-B200',
      operationCode: 'OP-090',
      otdImpact: '+7% OTD 模拟，减少 1 单延期风险',
      statusLabel: '待工程约束复核',
      summary: '工程约束复核包已同步到 BOM、工艺路线、AI 排产和 OTD 证据链。',
      dispatchSteps: [
        {
          module: 'BOM 管理',
          owner: '工程经理 / EMP-004',
          action: '复核 BOM-A100 替代规则',
          evidence: 'TRACE-ENG-ECN-BOM-A100-6061B',
        },
      ],
      createdAt: '2026-06-02T04:30:00.000Z',
    })
    const wrapper = mountChatPanel()

    await wrapper.get('.chat-input').setValue('请生成工程约束复核包')
    await wrapper.get('.send-btn').trigger('click')
    await flushPromises()

    const createPackageButton = wrapper.findAll('.action-btn')
      .find(button => button.text() === '生成工程约束复核包')
    expect(createPackageButton).toBeDefined()
    await createPackageButton!.trigger('click')
    await flushPromises()

    expect(writeAssistantEngineeringConstraintPackage).toHaveBeenCalledWith({
      actor: '王工',
      role: 'Admin',
    })
    expect(routerPush).toHaveBeenCalledWith('/scheduling')
    expect(recordAssistantActionAudit).toHaveBeenCalledWith(expect.objectContaining({
      actor: '王工',
      role: 'Admin',
      permitted: true,
      action: expect.objectContaining({
        id: 'create-engineering-constraint-package',
        type: 'engineering_constraint_package',
      }),
    }))

    const status = wrapper.get('.message.assistant[role="status"]')
    expect(status.attributes('aria-live')).toBe('polite')
    expect(status.text()).toContain('动作已执行：已生成 BOM-A100 / R-B200 工程约束复核包')
    expect(status.text()).toContain('BOM-A100 / R-B200 工程约束复核包')
    expect(status.text()).toContain('TRACE-CHAT-ENG-CONSTRAINT-PACKAGE-20260523')
  })

  it('keeps the completed engineering constraint package visible when navigation fails', async () => {
    getLocalUserRole.mockReturnValue('Admin')
    writeAssistantEngineeringConstraintPackage.mockReturnValue({
      id: 'assistant-engineering-constraint-a100-rb200',
      title: 'BOM-A100 / R-B200 工程约束复核包',
      auditCode: 'AUD-CHAT-ENG-CONSTRAINT-20260523-001',
      traceId: 'TRACE-CHAT-ENG-CONSTRAINT-PACKAGE-20260523',
      actor: '王工',
      role: 'Admin',
      workOrders: 'WO-RUSH-9001 / WO-DEMO-1002',
      priority: 'warning',
      owner: '工程经理 / 制造经理联合复核',
      dueAt: '今日 16:30',
      bomCode: 'BOM-A100',
      ecnCode: 'ECN-BOM-A100-6061B-20260521',
      routeCode: 'R-B200',
      operationCode: 'OP-090',
      otdImpact: '+7% OTD 模拟，减少 1 单延期风险',
      statusLabel: '待工程约束复核',
      summary: '工程约束复核包已同步到 BOM、工艺路线、AI 排产和 OTD 证据链。',
      dispatchSteps: [
        {
          module: 'BOM 管理',
          owner: '工程经理 / EMP-004',
          action: '复核 BOM-A100 替代规则',
          evidence: 'TRACE-ENG-ECN-BOM-A100-6061B',
        },
      ],
      createdAt: '2026-06-02T04:30:00.000Z',
    })
    routerPush.mockRejectedValueOnce(new Error('engineering route unavailable'))
    const wrapper = mountChatPanel()

    await wrapper.get('.chat-input').setValue('请生成工程约束复核包')
    await wrapper.get('.send-btn').trigger('click')
    await flushPromises()

    const createPackageButton = wrapper.findAll('.action-btn')
      .find(button => button.text() === '生成工程约束复核包')
    expect(createPackageButton).toBeDefined()
    await createPackageButton!.trigger('click')
    await flushPromises()

    expect(writeAssistantEngineeringConstraintPackage).toHaveBeenCalledWith({
      actor: '王工',
      role: 'Admin',
    })
    expect(routerPush).toHaveBeenCalledWith('/scheduling')
    expect(recordAssistantActionAudit).toHaveBeenCalledWith(expect.objectContaining({
      actor: '王工',
      role: 'Admin',
      permitted: true,
      action: expect.objectContaining({
        id: 'create-engineering-constraint-package',
        type: 'engineering_constraint_package',
      }),
    }))

    const status = wrapper.get('.message.assistant[role="status"]')
    expect(status.text()).toContain('动作已执行：已生成 BOM-A100 / R-B200 工程约束复核包')
    expect(status.text()).toContain('BOM-A100 / R-B200 工程约束复核包')
    const alert = wrapper.get('.message.assistant[role="alert"]')
    expect(alert.attributes('aria-live')).toBe('assertive')
    expect(alert.text()).toContain('工程约束复核包已生成，但页面跳转失败')
    expect(alert.text()).toContain('engineering route unavailable')
    expect(alert.text()).not.toContain('动作执行失败：生成工程约束复核包')
  })

  it('creates a customer commitment package and announces the completed action as a status update', async () => {
    getLocalUserRole.mockReturnValue('Admin')
    writeOtdKpiCommitmentPackage.mockReturnValue({
      id: 'otd-kpi-commitment-customer-huadong',
      sourceKpiId: 'customer-huadong',
      dimensionLabel: '客户',
      targetName: '华东新能源',
      title: '华东新能源 交付恢复承诺包',
      auditId: 'AUD-KPI-COMMITMENT-HUADONG-20260521-001',
      traceId: 'TRACE-KPI-COMMITMENT-HUADONG-20260521',
      actor: '王工',
      baselineOtd: 76,
      agentOtd: 94,
      lift: 18,
      delayedReduced: 3,
      statusLabel: '待客户确认',
      commitment: '华东新能源 交付恢复口径：Agent OTD 94%（基线 76%），提升 +18%，延期减少 3 单。',
      owner: '客户成功 / 售前顾问',
      dueAt: '今日 17:00',
      summary: '客户交付恢复承诺包已同步到报表中心、AI 排产、OTD 证据链和审计回放。',
      actions: [
        {
          module: '客户交付',
          owner: '客户成功 / 售前顾问',
          action: '向华东新能源输出 94% OTD 恢复承诺',
          evidence: 'TRACE-KPI-COMMITMENT-HUADONG-20260521',
        },
      ],
      createdAt: '2026-06-02T04:40:00.000Z',
    })
    const wrapper = mountChatPanel()

    await wrapper.get('.chat-input').setValue('请生成华东新能源客户交付恢复承诺包')
    await wrapper.get('.send-btn').trigger('click')
    await flushPromises()

    const createPackageButton = wrapper.findAll('.action-btn')
      .find(button => button.text() === '生成客户交付恢复承诺包')
    expect(createPackageButton).toBeDefined()
    await createPackageButton!.trigger('click')
    await flushPromises()

    expect(writeOtdKpiCommitmentPackage).toHaveBeenCalledWith(expect.objectContaining({
      sourceKpiId: 'customer-huadong',
      targetName: '华东新能源',
      actor: '王工',
    }))
    expect(routerPush).toHaveBeenCalledWith('/report')
    expect(recordAssistantActionAudit).toHaveBeenCalledWith(expect.objectContaining({
      actor: '王工',
      role: 'Admin',
      permitted: true,
      action: expect.objectContaining({
        id: 'create-customer-commitment-package',
        type: 'customer_commitment_package',
      }),
    }))

    const status = wrapper.get('.message.assistant[role="status"]')
    expect(status.attributes('aria-live')).toBe('polite')
    expect(status.text()).toContain('动作已执行：已生成华东新能源交付恢复承诺包')
    expect(status.text()).toContain('华东新能源 交付恢复承诺包')
    expect(status.text()).toContain('TRACE-KPI-COMMITMENT-HUADONG-20260521')
  })

  it('keeps the completed customer commitment package visible when navigation fails', async () => {
    getLocalUserRole.mockReturnValue('Admin')
    writeOtdKpiCommitmentPackage.mockReturnValue({
      id: 'otd-kpi-commitment-customer-huadong',
      sourceKpiId: 'customer-huadong',
      dimensionLabel: '客户',
      targetName: '华东新能源',
      title: '华东新能源 交付恢复承诺包',
      auditId: 'AUD-KPI-COMMITMENT-HUADONG-20260521-001',
      traceId: 'TRACE-KPI-COMMITMENT-HUADONG-20260521',
      actor: '王工',
      baselineOtd: 76,
      agentOtd: 94,
      lift: 18,
      delayedReduced: 3,
      statusLabel: '待客户确认',
      commitment: '华东新能源 交付恢复口径：Agent OTD 94%（基线 76%），提升 +18%，延期减少 3 单。',
      owner: '客户成功 / 售前顾问',
      dueAt: '今日 17:00',
      summary: '客户交付恢复承诺包已同步到报表中心、AI 排产、OTD 证据链和审计回放。',
      actions: [
        {
          module: '客户交付',
          owner: '客户成功 / 售前顾问',
          action: '向华东新能源输出 94% OTD 恢复承诺',
          evidence: 'TRACE-KPI-COMMITMENT-HUADONG-20260521',
        },
      ],
      createdAt: '2026-06-02T04:40:00.000Z',
    })
    routerPush.mockRejectedValueOnce(new Error('report route unavailable'))
    const wrapper = mountChatPanel()

    await wrapper.get('.chat-input').setValue('请生成华东新能源客户交付恢复承诺包')
    await wrapper.get('.send-btn').trigger('click')
    await flushPromises()

    const createPackageButton = wrapper.findAll('.action-btn')
      .find(button => button.text() === '生成客户交付恢复承诺包')
    expect(createPackageButton).toBeDefined()
    await createPackageButton!.trigger('click')
    await flushPromises()

    expect(writeOtdKpiCommitmentPackage).toHaveBeenCalledWith(expect.objectContaining({
      sourceKpiId: 'customer-huadong',
      targetName: '华东新能源',
      actor: '王工',
    }))
    expect(routerPush).toHaveBeenCalledWith('/report')
    expect(recordAssistantActionAudit).toHaveBeenCalledWith(expect.objectContaining({
      actor: '王工',
      role: 'Admin',
      permitted: true,
      action: expect.objectContaining({
        id: 'create-customer-commitment-package',
        type: 'customer_commitment_package',
      }),
    }))

    const status = wrapper.get('.message.assistant[role="status"]')
    expect(status.text()).toContain('动作已执行：已生成华东新能源交付恢复承诺包')
    expect(status.text()).toContain('华东新能源 交付恢复承诺包')
    const alert = wrapper.get('.message.assistant[role="alert"]')
    expect(alert.attributes('aria-live')).toBe('assertive')
    expect(alert.text()).toContain('客户交付恢复承诺包已生成，但页面跳转失败')
    expect(alert.text()).toContain('report route unavailable')
    expect(alert.text()).not.toContain('动作执行失败：生成客户交付恢复承诺包')
  })

  it('creates a BOM kitting package and announces the completed action as a status update', async () => {
    getLocalUserRole.mockReturnValue('Admin')
    const wrapper = mountChatPanel()

    await wrapper.get('.chat-input').setValue('请生成 BOM 展开齐套检查包')
    await wrapper.get('.send-btn').trigger('click')
    await flushPromises()

    const createPackageButton = wrapper.findAll('.action-btn')
      .find(button => button.text() === '生成 BOM 展开齐套检查包')
    expect(createPackageButton).toBeDefined()
    await createPackageButton!.trigger('click')
    await flushPromises()

    expect(routerPush).toHaveBeenCalledWith('/bom')
    expect(recordAssistantActionAudit).toHaveBeenCalledWith(expect.objectContaining({
      actor: '王工',
      role: 'Admin',
      permitted: true,
      action: expect.objectContaining({
        id: 'create-bom-kitting-package',
        type: 'bom_kitting_package',
      }),
    }))

    const status = wrapper.get('.message.assistant[role="status"]')
    expect(status.attributes('aria-live')).toBe('polite')
    expect(status.text()).toContain('动作已执行：已生成 BOM-A100 / WO-RUSH-9001 展开齐套检查包')
    expect(status.text()).toContain('BOM-A100 WO-RUSH-9001 展开齐套检查包')
    expect(status.text()).toContain('TRACE-BOM-KIT-BOM-A100-WO-RUSH-9001')
  })

  it('keeps the BOM kitting package visible when OTD evidence cannot be written', async () => {
    getLocalUserRole.mockReturnValue('Admin')
    upsertOtdEvidenceChainRecord.mockImplementationOnce(() => {
      throw new Error('otd evidence storage unavailable')
    })
    const wrapper = mountChatPanel()

    await wrapper.get('.chat-input').setValue('请生成 BOM 展开齐套检查包')
    await wrapper.get('.send-btn').trigger('click')
    await flushPromises()

    const createPackageButton = wrapper.findAll('.action-btn')
      .find(button => button.text() === '生成 BOM 展开齐套检查包')
    expect(createPackageButton).toBeDefined()
    await createPackageButton!.trigger('click')
    await flushPromises()

    expect(writeBomKittingPackage).toHaveBeenCalledWith(expect.objectContaining({
      auditId: 'AUD-BOM-KIT-BOM-A100-WO-RUSH-9001-20260522',
      traceId: 'TRACE-BOM-KIT-BOM-A100-WO-RUSH-9001',
    }))
    expect(routerPush).toHaveBeenCalledWith('/bom')
    expect(recordAssistantActionAudit).toHaveBeenCalledWith(expect.objectContaining({
      actor: '王工',
      role: 'Admin',
      permitted: true,
      action: expect.objectContaining({
        id: 'create-bom-kitting-package',
        type: 'bom_kitting_package',
      }),
    }))

    const status = wrapper.get('.message.assistant[role="status"]')
    expect(status.text()).toContain('动作已执行：已生成 BOM-A100 / WO-RUSH-9001 展开齐套检查包')
    expect(status.text()).toContain('BOM-A100 WO-RUSH-9001 展开齐套检查包')
    const alert = wrapper.get('.message.assistant[role="alert"]')
    expect(alert.attributes('aria-live')).toBe('assertive')
    expect(alert.text()).toContain('BOM 齐套包已生成，但 OTD 证据写入失败')
    expect(alert.text()).toContain('otd evidence storage unavailable')
    expect(alert.text()).not.toContain('动作执行失败：生成 BOM 展开齐套检查包')
  })

  it('keeps the completed BOM kitting package visible when navigation fails', async () => {
    getLocalUserRole.mockReturnValue('Admin')
    routerPush.mockRejectedValueOnce(new Error('bom route unavailable'))
    const wrapper = mountChatPanel()

    await wrapper.get('.chat-input').setValue('请生成 BOM 展开齐套检查包')
    await wrapper.get('.send-btn').trigger('click')
    await flushPromises()

    const createPackageButton = wrapper.findAll('.action-btn')
      .find(button => button.text() === '生成 BOM 展开齐套检查包')
    expect(createPackageButton).toBeDefined()
    await createPackageButton!.trigger('click')
    await flushPromises()

    expect(writeBomKittingPackage).toHaveBeenCalledWith(expect.objectContaining({
      auditId: 'AUD-BOM-KIT-BOM-A100-WO-RUSH-9001-20260522',
      traceId: 'TRACE-BOM-KIT-BOM-A100-WO-RUSH-9001',
    }))
    expect(upsertOtdEvidenceChainRecord).toHaveBeenCalledWith(expect.objectContaining({
      traceId: 'TRACE-BOM-KIT-BOM-A100-WO-RUSH-9001',
      status: 'active',
    }))
    expect(routerPush).toHaveBeenCalledWith('/bom')
    expect(recordAssistantActionAudit).toHaveBeenCalledWith(expect.objectContaining({
      actor: '王工',
      role: 'Admin',
      permitted: true,
      action: expect.objectContaining({
        id: 'create-bom-kitting-package',
        type: 'bom_kitting_package',
      }),
    }))

    const status = wrapper.get('.message.assistant[role="status"]')
    expect(status.text()).toContain('动作已执行：已生成 BOM-A100 / WO-RUSH-9001 展开齐套检查包')
    expect(status.text()).toContain('BOM-A100 WO-RUSH-9001 展开齐套检查包')
    const alert = wrapper.get('.message.assistant[role="alert"]')
    expect(alert.attributes('aria-live')).toBe('assertive')
    expect(alert.text()).toContain('BOM 齐套包已生成，但页面跳转失败')
    expect(alert.text()).toContain('bom route unavailable')
    expect(alert.text()).not.toContain('动作执行失败：生成 BOM 展开齐套检查包')
  })

  it('creates an equipment downtime package and announces the completed action as a status update', async () => {
    getLocalUserRole.mockReturnValue('Admin')
    const wrapper = mountChatPanel()

    await wrapper.get('.chat-input').setValue('请生成 CNC-001 设备停机复核包')
    await wrapper.get('.send-btn').trigger('click')
    await flushPromises()

    const createPackageButton = wrapper.findAll('.action-btn')
      .find(button => button.text() === '生成设备停机复核包')
    expect(createPackageButton).toBeDefined()
    await createPackageButton!.trigger('click')
    await flushPromises()

    expect(routerPush).toHaveBeenCalledWith('/equipment')
    expect(recordAssistantActionAudit).toHaveBeenCalledWith(expect.objectContaining({
      actor: '王工',
      role: 'Admin',
      permitted: true,
      action: expect.objectContaining({
        id: 'create-equipment-downtime-package',
        type: 'equipment_downtime_package',
      }),
    }))

    const status = wrapper.get('.message.assistant[role="status"]')
    expect(status.attributes('aria-live')).toBe('polite')
    expect(status.text()).toContain('动作已执行：已生成 CNC-001 设备停机复核包')
    expect(status.text()).toContain('CNC-001 设备停机复核包')
    expect(status.text()).toContain('TRACE-EQ-DOWNTIME-CNC-001')
  })

  it('keeps the equipment downtime package visible when OTD evidence cannot be written', async () => {
    getLocalUserRole.mockReturnValue('Admin')
    upsertOtdEvidenceChainRecord.mockImplementationOnce(() => {
      throw new Error('otd evidence storage unavailable')
    })
    const wrapper = mountChatPanel()

    await wrapper.get('.chat-input').setValue('请生成 CNC-001 设备停机复核包')
    await wrapper.get('.send-btn').trigger('click')
    await flushPromises()

    const createPackageButton = wrapper.findAll('.action-btn')
      .find(button => button.text() === '生成设备停机复核包')
    expect(createPackageButton).toBeDefined()
    await createPackageButton!.trigger('click')
    await flushPromises()

    expect(writeEquipmentDowntimeEvent).toHaveBeenCalledWith(expect.objectContaining({
      equipmentCode: 'CNC-001',
      affectedOrders: 'WO-2026-0042 / WO-RUSH-9001 / WO-DEMO-1001',
    }))
    expect(routerPush).toHaveBeenCalledWith('/equipment')
    expect(recordAssistantActionAudit).toHaveBeenCalledWith(expect.objectContaining({
      actor: '王工',
      role: 'Admin',
      permitted: true,
      action: expect.objectContaining({
        id: 'create-equipment-downtime-package',
        type: 'equipment_downtime_package',
      }),
    }))

    const status = wrapper.get('.message.assistant[role="status"]')
    expect(status.text()).toContain('动作已执行：已生成 CNC-001 设备停机复核包')
    expect(status.text()).toContain('CNC-001 设备停机复核包')
    const alert = wrapper.get('.message.assistant[role="alert"]')
    expect(alert.attributes('aria-live')).toBe('assertive')
    expect(alert.text()).toContain('设备停机复核包已生成，但 OTD 证据写入失败')
    expect(alert.text()).toContain('otd evidence storage unavailable')
    expect(alert.text()).not.toContain('动作执行失败：生成设备停机复核包')
  })

  it('keeps the completed equipment downtime package visible when navigation fails', async () => {
    getLocalUserRole.mockReturnValue('Admin')
    routerPush.mockRejectedValueOnce(new Error('equipment route unavailable'))
    const wrapper = mountChatPanel()

    await wrapper.get('.chat-input').setValue('请生成 CNC-001 设备停机复核包')
    await wrapper.get('.send-btn').trigger('click')
    await flushPromises()

    const createPackageButton = wrapper.findAll('.action-btn')
      .find(button => button.text() === '生成设备停机复核包')
    expect(createPackageButton).toBeDefined()
    await createPackageButton!.trigger('click')
    await flushPromises()

    expect(writeEquipmentDowntimeEvent).toHaveBeenCalledWith(expect.objectContaining({
      equipmentCode: 'CNC-001',
      affectedOrders: 'WO-2026-0042 / WO-RUSH-9001 / WO-DEMO-1001',
    }))
    expect(upsertOtdEvidenceChainRecord).toHaveBeenCalled()
    expect(routerPush).toHaveBeenCalledWith('/equipment')
    expect(recordAssistantActionAudit).toHaveBeenCalledWith(expect.objectContaining({
      actor: '王工',
      role: 'Admin',
      permitted: true,
      action: expect.objectContaining({
        id: 'create-equipment-downtime-package',
        type: 'equipment_downtime_package',
      }),
    }))

    const status = wrapper.get('.message.assistant[role="status"]')
    expect(status.text()).toContain('动作已执行：已生成 CNC-001 设备停机复核包')
    expect(status.text()).toContain('CNC-001 设备停机复核包')
    const alert = wrapper.get('.message.assistant[role="alert"]')
    expect(alert.attributes('aria-live')).toBe('assertive')
    expect(alert.text()).toContain('设备停机复核包已生成，但页面跳转失败')
    expect(alert.text()).toContain('equipment route unavailable')
    expect(alert.text()).not.toContain('动作执行失败：生成设备停机复核包')
  })

  it('exports the OTD report and announces the completed action as a status update', async () => {
    const createObjectUrl = vi.fn(() => 'blob:otd-report')
    const revokeObjectUrl = vi.fn()
    const click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => undefined)
    vi.stubGlobal('URL', {
      ...URL,
      createObjectURL: createObjectUrl,
      revokeObjectURL: revokeObjectUrl,
    })
    const wrapper = mountChatPanel()

    await wrapper.get('.chat-input').setValue('请导出 POC 复盘报告')
    await wrapper.get('.send-btn').trigger('click')
    await flushPromises()

    await wrapper.get('.action-btn').trigger('click')
    await flushPromises()

    expect(createObjectUrl).toHaveBeenCalledWith(expect.any(Blob))
    expect(click).toHaveBeenCalledTimes(1)
    expect(revokeObjectUrl).toHaveBeenCalledWith('blob:otd-report')
    expect(routerPush).toHaveBeenCalledWith('/report')
    expect(recordAssistantActionAudit).toHaveBeenCalledWith(expect.objectContaining({
      actor: '王工',
      role: 'Planner',
      permitted: true,
      action: expect.objectContaining({
        id: 'export-otd-report',
        type: 'export_report',
      }),
    }))
    const status = wrapper.get('.message.assistant[role="status"]')
    expect(status.attributes('aria-live')).toBe('polite')
    expect(status.text()).toContain('动作已执行：已生成 OTD/POC 复盘 CSV，并打开报表中心。')
  })

  it('keeps the exported OTD report visible when report navigation fails', async () => {
    const createObjectUrl = vi.fn(() => 'blob:otd-report')
    const revokeObjectUrl = vi.fn()
    const click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => undefined)
    routerPush.mockRejectedValueOnce(new Error('report route unavailable'))
    vi.stubGlobal('URL', {
      ...URL,
      createObjectURL: createObjectUrl,
      revokeObjectURL: revokeObjectUrl,
    })
    const wrapper = mountChatPanel()

    await wrapper.get('.chat-input').setValue('请导出 POC 复盘报告')
    await wrapper.get('.send-btn').trigger('click')
    await flushPromises()

    await wrapper.get('.action-btn').trigger('click')
    await flushPromises()

    expect(createObjectUrl).toHaveBeenCalledWith(expect.any(Blob))
    expect(click).toHaveBeenCalledTimes(1)
    expect(revokeObjectUrl).toHaveBeenCalledWith('blob:otd-report')
    expect(recordAssistantActionAudit).toHaveBeenCalledWith(expect.objectContaining({
      actor: '王工',
      role: 'Planner',
      permitted: true,
      action: expect.objectContaining({
        id: 'export-otd-report',
        type: 'export_report',
      }),
    }))

    const status = wrapper.get('.message.assistant[role="status"]')
    expect(status.text()).toContain('动作已执行：已生成 OTD/POC 复盘 CSV，并打开报表中心。')
    const alert = wrapper.get('.message.assistant[role="alert"]')
    expect(alert.attributes('aria-live')).toBe('assertive')
    expect(alert.text()).toContain('OTD/POC 复盘 CSV 已生成，但报表中心跳转失败')
    expect(alert.text()).toContain('report route unavailable')
    expect(alert.text()).not.toContain('动作执行失败：已生成 OTD/POC 复盘 CSV')
  })

  it('keeps the exported OTD report visible when object URL cleanup fails', async () => {
    const createObjectUrl = vi.fn(() => 'blob:otd-report')
    const revokeObjectUrl = vi.fn(() => {
      throw new Error('object URL cleanup unavailable')
    })
    const click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => undefined)
    vi.stubGlobal('URL', {
      ...URL,
      createObjectURL: createObjectUrl,
      revokeObjectURL: revokeObjectUrl,
    })
    const wrapper = mountChatPanel()

    await wrapper.get('.chat-input').setValue('请导出 POC 复盘报告')
    await wrapper.get('.send-btn').trigger('click')
    await flushPromises()

    await wrapper.get('.action-btn').trigger('click')
    await flushPromises()

    expect(createObjectUrl).toHaveBeenCalledWith(expect.any(Blob))
    expect(click).toHaveBeenCalledTimes(1)
    expect(revokeObjectUrl).toHaveBeenCalledWith('blob:otd-report')
    expect(recordAssistantActionAudit).toHaveBeenCalledWith(expect.objectContaining({
      actor: '王工',
      role: 'Planner',
      permitted: true,
      action: expect.objectContaining({
        id: 'export-otd-report',
        type: 'export_report',
      }),
    }))

    const status = wrapper.get('.message.assistant[role="status"]')
    expect(status.text()).toContain('动作已执行：已生成 OTD/POC 复盘 CSV，并打开报表中心。')
    const alert = wrapper.get('.message.assistant[role="alert"]')
    expect(alert.attributes('aria-live')).toBe('assertive')
    expect(alert.text()).toContain('OTD/POC 复盘 CSV 已生成，但下载链接清理失败')
    expect(alert.text()).toContain('object URL cleanup unavailable')
    expect(alert.text()).not.toContain('动作执行失败：已生成 OTD/POC 复盘 CSV')
  })

  it('alerts with a download preparation failure when report blob creation fails', async () => {
    const createObjectUrl = vi.fn(() => {
      throw new Error('blob quota exceeded')
    })
    const revokeObjectUrl = vi.fn()
    const click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => undefined)
    vi.stubGlobal('URL', {
      ...URL,
      createObjectURL: createObjectUrl,
      revokeObjectURL: revokeObjectUrl,
    })
    const wrapper = mountChatPanel()

    await wrapper.get('.chat-input').setValue('请导出 POC 复盘报告')
    await wrapper.get('.send-btn').trigger('click')
    await flushPromises()

    await wrapper.get('.action-btn').trigger('click')
    await flushPromises()

    expect(createObjectUrl).toHaveBeenCalledWith(expect.any(Blob))
    expect(click).not.toHaveBeenCalled()
    expect(revokeObjectUrl).not.toHaveBeenCalled()
    expect(routerPush).not.toHaveBeenCalledWith('/report')
    expect(recordAssistantActionAudit).toHaveBeenCalledWith(expect.objectContaining({
      actor: '王工',
      role: 'Planner',
      permitted: false,
      action: expect.objectContaining({
        id: 'export-otd-report',
        type: 'export_report',
      }),
    }))

    expect(wrapper.find('.message.assistant[role="status"]').exists()).toBe(false)
    const alert = wrapper.get('.message.assistant[role="alert"]')
    expect(alert.attributes('aria-live')).toBe('assertive')
    expect(alert.text()).toContain('OTD/POC 复盘 CSV 下载准备失败')
    expect(alert.text()).toContain('blob quota exceeded')
    expect(alert.text()).not.toContain('已生成 OTD/POC 复盘 CSV')
  })

  it('releases the prepared report object URL when download click fails', async () => {
    const createObjectUrl = vi.fn(() => 'blob:otd-report')
    const revokeObjectUrl = vi.fn()
    const click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {
      throw new Error('download gesture blocked')
    })
    vi.stubGlobal('URL', {
      ...URL,
      createObjectURL: createObjectUrl,
      revokeObjectURL: revokeObjectUrl,
    })
    const wrapper = mountChatPanel()

    await wrapper.get('.chat-input').setValue('请导出 POC 复盘报告')
    await wrapper.get('.send-btn').trigger('click')
    await flushPromises()

    await wrapper.get('.action-btn').trigger('click')
    await flushPromises()

    expect(createObjectUrl).toHaveBeenCalledWith(expect.any(Blob))
    expect(click).toHaveBeenCalledTimes(1)
    expect(revokeObjectUrl).toHaveBeenCalledWith('blob:otd-report')
    expect(routerPush).not.toHaveBeenCalledWith('/report')
    expect(recordAssistantActionAudit).toHaveBeenCalledWith(expect.objectContaining({
      actor: '王工',
      role: 'Planner',
      permitted: false,
      action: expect.objectContaining({
        id: 'export-otd-report',
        type: 'export_report',
      }),
    }))

    expect(wrapper.find('.message.assistant[role="status"]').exists()).toBe(false)
    const alert = wrapper.get('.message.assistant[role="alert"]')
    expect(alert.attributes('aria-live')).toBe('assertive')
    expect(alert.text()).toContain('OTD/POC 复盘 CSV 下载准备失败')
    expect(alert.text()).toContain('download gesture blocked')
    expect(alert.text()).not.toContain('已生成 OTD/POC 复盘 CSV')
  })
})
