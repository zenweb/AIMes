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
const readLatestOutsourcingCommitmentPackage = vi.hoisted(() => vi.fn())
const upsertOtdEvidenceChainRecord = vi.hoisted(() => vi.fn())
const readOtdEvidenceChainRecords = vi.hoisted(() => vi.fn())
const writeBomKittingPackage = vi.hoisted(() => vi.fn())
const writeEquipmentDowntimeEvent = vi.hoisted(() => vi.fn())
const readQualityMrbDispositionRecord = vi.hoisted(() => vi.fn())
const readQualityReworkImpact = vi.hoisted(() => vi.fn())
const readLaborQualificationBlocks = vi.hoisted(() => vi.fn())
const readLaborReassignments = vi.hoisted(() => vi.fn())
const getLocalUserDisplayName = vi.hoisted(() => vi.fn())
const getLocalUserRole = vi.hoisted(() => vi.fn())
const readLatestQualityKnowledgeRecommendationFeedbackRecord = vi.hoisted(() => vi.fn())
const readLatestQualityKnowledgeReuseClosure = vi.hoisted(() => vi.fn())
const readLatestQualityKnowledgeReuseDraft = vi.hoisted(() => vi.fn())
const readLatestQualityKnowledgeReviewQueueRecord = vi.hoisted(() => vi.fn())
const readLatestQualityKnowledgeSample = vi.hoisted(() => vi.fn())
const readQualityKnowledgeRetrainingVersionRecords = vi.hoisted(() => vi.fn())
const selectPrioritizedQualityKnowledgeRecommendationVersion = vi.hoisted(() => vi.fn())

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
  readLatestOutsourcingCommitmentPackage,
}))

vi.mock('../../src/utils/quality-mrb-disposition-sync', () => ({
  readQualityMrbDispositionRecord,
}))

vi.mock('../../src/utils/quality-rework-sync', () => ({
  readQualityReworkImpact,
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
  readLaborQualificationBlocks,
  readLaborReassignments,
}))

vi.mock('../../src/utils/local-user', () => ({
  getLocalUserDisplayName,
  getLocalUserRole,
}))

vi.mock('../../src/utils/quality-knowledge-sample-sync', () => ({
  qualityKnowledgeRecommendationReleaseScopeLabel: vi.fn(() => '正式范围'),
  readLatestQualityKnowledgeRecommendationFeedbackRecord,
  readLatestQualityKnowledgeReuseClosure,
  readLatestQualityKnowledgeReuseDraft,
  readLatestQualityKnowledgeReviewQueueRecord,
  readLatestQualityKnowledgeSample,
  readQualityKnowledgeRetrainingVersionRecords,
  selectPrioritizedQualityKnowledgeRecommendationVersion,
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
    readLatestOutsourcingCommitmentPackage.mockReset()
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
    readLatestOutsourcingCommitmentPackage.mockReturnValue(null)
    readQualityMrbDispositionRecord.mockReturnValue(null)
    readQualityReworkImpact.mockReturnValue(null)
    readLaborQualificationBlocks.mockReturnValue([])
    readLaborReassignments.mockReturnValue([])
    readOtdEvidenceChainRecords.mockReturnValue([])
    readLatestQualityKnowledgeRecommendationFeedbackRecord.mockReturnValue(null)
    readLatestQualityKnowledgeReuseClosure.mockReturnValue(null)
    readLatestQualityKnowledgeReuseDraft.mockReturnValue(null)
    readLatestQualityKnowledgeReviewQueueRecord.mockReturnValue(null)
    readLatestQualityKnowledgeSample.mockReturnValue(null)
    readQualityKnowledgeRetrainingVersionRecords.mockReturnValue([])
    selectPrioritizedQualityKnowledgeRecommendationVersion.mockReturnValue(null)
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

  it('guides first-time assistant use with bilingual examples and a clickable help entry', () => {
    const wrapper = mountChatPanel()

    const emptyChat = wrapper.get('.empty-chat')
    expect(emptyChat.text()).toContain('有什么生产相关的问题？')
    expect(emptyChat.text()).toContain('Ask about production status, evidence, or next actions.')
    expect(emptyChat.text()).toContain('例如：当前产能如何？设备利用率是多少？')
    expect(emptyChat.text()).toContain('Example: Which work order needs action first?')

    const helpLink = emptyChat.get('a.empty-help-link')
    expect(helpLink.attributes('href')).toBe('#assistant-help')
    expect(helpLink.text()).toBe('帮助：AI 助手使用支持')
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

  it('aggregates every startup context sync failure into one fail-loud alert', async () => {
    readAnomalyDispatchRecordsBackendFirst.mockRejectedValueOnce(new Error('anomaly context unavailable'))
    readMonitoringSituationEscalationsBackendFirst.mockRejectedValueOnce(new Error('monitoring context unavailable'))
    readRiskSlaReviewRecordBackendFirst.mockRejectedValueOnce(new Error('risk SLA context unavailable'))
    const wrapper = mountChatPanel()

    await flushPromises()

    const alerts = wrapper.findAll('.message.assistant[role="alert"]').filter(alert =>
      alert.text().includes('助手上下文同步失败'),
    )
    expect(alerts).toHaveLength(1)
    expect(alerts[0].attributes('aria-live')).toBe('assertive')
    expect(alerts[0].text()).toContain('anomaly context unavailable')
    expect(alerts[0].text()).toContain('monitoring context unavailable')
    expect(alerts[0].text()).toContain('risk SLA context unavailable')
    expect(wrapper.get('.chat-input').attributes('disabled')).toBeUndefined()
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

  it('restores historical conversation messages when the panel becomes visible', async () => {
    getChatHistory.mockResolvedValueOnce({
      messages: [
        {
          role: 'user',
          content: '昨天的瓶颈设备是什么？',
          timestamp: '2026-06-15T08:30:00.000Z',
        },
        {
          role: 'assistant',
          content: '昨天瓶颈设备是 CNC-02，建议优先复核换刀窗口。',
          timestamp: '2026-06-15T08:31:00.000Z',
        },
      ],
    })
    const wrapper = mount(ChatPanel, {
      props: {
        visible: false,
      },
    })

    await wrapper.setProps({ visible: true })
    await flushPromises()

    const userMessages = wrapper.findAll('.message.user .msg-content').map(message => message.text())
    const assistantMessages = wrapper.findAll('.message.assistant .msg-content').map(message => message.text())
    expect(userMessages).toContain('昨天的瓶颈设备是什么？')
    expect(assistantMessages).toContain('昨天瓶颈设备是 CNC-02，建议优先复核换刀窗口。')
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

  it('shows a non-Ollama provider and model in the assistant badge after startup', async () => {
    getLlmStatus.mockResolvedValueOnce({ provider: 'Claude', model: 'opus-4.8' })
    const wrapper = mountChatPanel()

    await flushPromises()

    const badge = wrapper.get('.model-badge')
    expect(badge.text()).toBe('Claude')
    expect(badge.attributes('title')).toBe('Claude / opus-4.8')
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

  it('normalizes sparse backend sources before rendering evidence scores', async () => {
    queryKnowledge.mockResolvedValueOnce({
      answer: '当前产能稳定，CNC 产线负荷 82%。',
      sources: [
        {
          sourceId: 'SRC-SPARSE',
          sourceName: '生产日报缺少相似度',
          content: '',
        },
      ],
    })
    const wrapper = mountChatPanel()

    await wrapper.get('.chat-input').setValue('当前产能如何？')
    await wrapper.get('.send-btn').trigger('click')
    await flushPromises()

    await wrapper.get('button.sources-toggle').trigger('click')

    expect(wrapper.text()).toContain('生产日报缺少相似度')
    expect(wrapper.text()).toContain('0%')
    expect(wrapper.text()).not.toContain('NaN%')
  })

  it('deduplicates overlapping navigation actions for engineering constraint questions', async () => {
    const wrapper = mountChatPanel()

    await wrapper.get('.chat-input').setValue('打开工程约束排产和 BOM 工艺路线')
    await wrapper.get('.send-btn').trigger('click')
    await flushPromises()

    const actionLabels = wrapper.findAll('.action-btn').map(button => button.text())
    expect(actionLabels.filter(label => label === '打开 AI 排产')).toHaveLength(1)
    expect(actionLabels.filter(label => label === '打开 BOM 管理')).toHaveLength(1)
    expect(actionLabels.filter(label => label === '打开工艺路线')).toHaveLength(1)
  })

  it('offers role, monitoring, and OTD report navigation from a shift-review request', async () => {
    const wrapper = mountChatPanel()

    await wrapper.get('.chat-input').setValue('打开人员资质、实时监控、AI 排产和 OTD 报表，复核今天现场处置')
    await wrapper.get('.send-btn').trigger('click')
    await flushPromises()

    const actionLabels = wrapper.findAll('.action-btn').map(button => button.text())
    expect(actionLabels).toContain('打开人员管理')
    expect(actionLabels).toContain('打开实时监控')
    expect(actionLabels).toContain('打开 AI 排产')
    expect(actionLabels).toContain('打开 OTD 报告')
    expect(actionLabels.filter(label => label === '打开 AI 排产')).toHaveLength(1)
  })

  it('offers anomaly center and production reporting navigation from a shopfloor incident request', async () => {
    const wrapper = mountChatPanel()

    await wrapper.get('.chat-input').setValue('打开现场事件异常中心和生产报工，处理 CNC-001 完工异常')
    await wrapper.get('.send-btn').trigger('click')
    await flushPromises()

    const actionLabels = wrapper.findAll('.action-btn').map(button => button.text())
    expect(actionLabels).toContain('打开异常中心')
    expect(actionLabels).toContain('打开生产报工')
    expect(actionLabels.filter(label => label === '打开异常中心')).toHaveLength(1)
    expect(actionLabels.filter(label => label === '打开生产报工')).toHaveLength(1)
  })

  it('clamps out-of-range backend source scores before rendering evidence confidence', async () => {
    queryKnowledge.mockResolvedValueOnce({
      answer: '当前产能稳定，CNC 产线负荷 82%。',
      sources: [
        {
          sourceId: 'SRC-OVER-CONFIDENT',
          sourceName: '后端超过 100% 的来源',
          content: '',
          relevanceScore: 1.7,
        },
        {
          sourceId: 'SRC-NEGATIVE',
          sourceName: '后端负分来源',
          content: '',
          relevanceScore: -0.4,
        },
      ],
    })
    const wrapper = mountChatPanel()

    await wrapper.get('.chat-input').setValue('当前产能如何？')
    await wrapper.get('.send-btn').trigger('click')
    await flushPromises()

    await wrapper.get('button.sources-toggle').trigger('click')

    expect(wrapper.text()).toContain('后端超过 100% 的来源')
    expect(wrapper.text()).toContain('后端负分来源')
    const sourceScores = wrapper.findAll('.source-score').map(score => score.text())
    expect(sourceScores).toEqual(['100%', '0%'])
    expect(wrapper.text()).not.toContain('170%')
    expect(wrapper.text()).not.toContain('-40%')
  })

  it('does not send whitespace-only questions to the knowledge service', async () => {
    const wrapper = mountChatPanel()

    await wrapper.get('.chat-input').setValue('   ')
    await wrapper.get('.chat-input').trigger('keydown.enter')
    await flushPromises()

    expect(queryKnowledge).not.toHaveBeenCalled()
    expect(wrapper.find('.message.user').exists()).toBe(false)
  })

  it('does not start a second knowledge query while the first one is still loading', async () => {
    let resolveQuery: (value: { answer: string; sources: [] }) => void = () => {}
    queryKnowledge.mockReturnValueOnce(new Promise(resolve => {
      resolveQuery = resolve
    }))
    const wrapper = mountChatPanel()

    await wrapper.get('.chat-input').setValue('当前产能如何？')
    await wrapper.get('.send-btn').trigger('click')
    await flushPromises()

    await wrapper.get('.chat-input').setValue('再查一次产能')
    await wrapper.get('.chat-input').trigger('keydown.enter')
    await flushPromises()

    expect(queryKnowledge).toHaveBeenCalledTimes(1)

    resolveQuery({ answer: '当前产能稳定。', sources: [] })
    await flushPromises()
  })

  it('escapes unsafe backend HTML before rendering limited markdown', async () => {
    queryKnowledge.mockResolvedValueOnce({
      answer: '**安全摘要**\n<script>alert(1)</script><img src=x onerror=alert(2)>',
      sources: [],
    })
    const wrapper = mountChatPanel()

    await wrapper.get('.chat-input').setValue('渲染安全复核')
    await wrapper.get('.send-btn').trigger('click')
    await flushPromises()

    const assistantContent = wrapper.findAll('.message.assistant .msg-content').at(-1)
    expect(assistantContent).toBeDefined()
    const html = assistantContent!.html()
    expect(html).toContain('<strong>安全摘要</strong>')
    expect(html).toContain('&lt;script&gt;alert(1)&lt;')
    expect(html).toContain('&lt;img src=x onerror=alert(2)&gt;')
    expect(html).not.toContain('<script')
    expect(html).not.toContain('<img')
    expect(assistantContent!.text()).toContain('<script>alert(1)</script>')
    expect(assistantContent!.text()).toContain('<img src=x onerror=alert(2)>')
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

  it('answers BOM kitting impact with a fail-loud next step when no kitting package exists', async () => {
    queryKnowledge.mockRejectedValueOnce(new Error('RAG 服务不可用'))
    const wrapper = mountChatPanel()

    await wrapper.get('.chat-input').setValue('请生成 BOM 展开齐套检查包并解释排产影响')
    await wrapper.get('.send-btn').trigger('click')
    await flushPromises()

    const alert = wrapper.get('.message.assistant[role="alert"]')
    expect(alert.text()).toContain('BOM 展开齐套：当前还没有生成齐套检查包。')
    expect(alert.text()).toContain('请先在 BOM 管理选择')
    const actionLabels = wrapper.findAll('.action-btn').map(button => button.text())
    expect(actionLabels).toContain('打开 BOM 管理')
    expect(actionLabels).toContain('生成 BOM 展开齐套检查包')
  })

  it('surfaces engineering change and route capability actions from offline business intent', async () => {
    queryKnowledge.mockRejectedValueOnce(new Error('RAG 服务不可用'))
    const wrapper = mountChatPanel()

    await wrapper.get('.chat-input').setValue('ECN 工程变更和 R-B200 OP-090 工艺能力校验对排产影响如何解释？')
    await wrapper.get('.send-btn').trigger('click')
    await flushPromises()

    const alert = wrapper.get('.message.assistant[role="alert"]')
    expect(alert.text()).toContain('工艺能力影响：当前还没有运行能力校验。')
    const actionLabels = wrapper.findAll('.action-btn').map(button => button.text())
    expect(actionLabels).toContain('打开 BOM 管理')
    expect(actionLabels).toContain('打开工艺路线')
    expect(actionLabels).toContain('打开 OTD 报告')
    expect(actionLabels).toContain('打开系统治理')
  })

  it('surfaces Hypercare and Agent governance entry points from rollout acceptance intent', async () => {
    queryKnowledge.mockRejectedValueOnce(new Error('RAG 服务不可用'))
    const wrapper = mountChatPanel()

    await wrapper.get('.chat-input').setValue('打开上线验收稳定运行 hypercare 和 agent 治理入口')
    await wrapper.get('.send-btn').trigger('click')
    await flushPromises()

    const alert = wrapper.get('.message.assistant[role="alert"]')
    expect(alert.text()).toContain('知识问答服务暂不可用，已切换到离线演示回答。')
    const actionLabels = wrapper.findAll('.action-btn').map(button => button.text())
    expect(actionLabels).toContain('打开生产概览')
    expect(actionLabels).toContain('打开实时监控')
    expect(actionLabels).toContain('打开系统治理')
    expect(actionLabels.filter(label => label === '打开实时监控')).toHaveLength(1)
  })

  it('answers top rush-order risks with kitting, purchase and scheduling action entry points', async () => {
    queryKnowledge.mockRejectedValueOnce(new Error('RAG 服务不可用'))
    const wrapper = mountChatPanel()

    await wrapper.get('.chat-input').setValue('今天最高风险的 3 个工单是什么？')
    await wrapper.get('.send-btn').trigger('click')
    await flushPromises()

    const alert = wrapper.get('.message.assistant[role="alert"]')
    expect(alert.text()).toContain('今天最危险的 3 个工单')
    expect(alert.text()).toContain('WO-RUSH-9001')
    expect(alert.text()).toContain('尚未生成库存齐套证据')
    const actionLabels = wrapper.findAll('.action-btn').map(button => button.text())
    expect(actionLabels).toEqual(['打开风险预警', '打开库存齐套', '打开采购协同', '打开 AI 排产'])
  })

  it('answers anomaly dispatch impact loudly when no dispatch record has been confirmed', async () => {
    queryKnowledge.mockRejectedValueOnce(new Error('RAG 服务不可用'))
    const wrapper = mountChatPanel()

    await wrapper.get('.chat-input').setValue('装配间隙异常影响闭环怎么处置？')
    await wrapper.get('.send-btn').trigger('click')
    await flushPromises()

    const alert = wrapper.get('.message.assistant[role="alert"]')
    expect(alert.text()).toContain('异常分流影响：当前还没有确认分流记录。')
    expect(alert.text()).toContain('请先在异常管理的现场事件中心点击')
    const actionLabels = wrapper.findAll('.action-btn').map(button => button.text())
    expect(actionLabels).toEqual(['打开异常中心', '打开风险预警', '打开 AI 排产', '打开 OTD 报告'])
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

  it('uses the latest equipment downtime evidence when RAG falls back to demo analysis', async () => {
    queryKnowledge.mockRejectedValueOnce(new Error('RAG 服务不可用'))
    readOtdEvidenceChainRecords.mockReturnValue([
      {
        id: 'assistant-equipment-downtime-old',
        stage: '设备维护',
        title: 'CNC-001 旧停机窗口',
        summary: '旧停机证据不应出现在回答中。',
        object: 'WO-OLD',
        source: '设备维护 / 旧记录',
        traceId: 'TRACE-EQ-DOWNTIME-CNC-001-OLD',
        status: 'closed',
        statusLabel: '旧记录',
        createdAt: '2026-06-01T01:00:00.000Z',
      },
      {
        id: 'assistant-equipment-downtime-cnc-001',
        stage: '设备维护',
        title: 'CNC-001 停机窗口已同步排产复核',
        summary: '4h 停机影响 WO-2026-0042 / WO-RUSH-9001 / WO-DEMO-1001，替代设备 CNC-002 / CNC-003，按减少换线、优先关键订单、推荐预防维护窗口保护瓶颈设备。',
        object: 'WO-2026-0042 / WO-RUSH-9001 / WO-DEMO-1001',
        source: '设备维护 / 瓶颈保护',
        traceId: 'TRACE-EQ-DOWNTIME-CNC-001',
        status: 'active',
        statusLabel: '待维护',
        createdAt: '2026-06-05T09:00:00.000Z',
      },
    ])
    const wrapper = mountChatPanel()

    await wrapper.get('.chat-input').setValue('如果 CNC-001 故障 4 小时会怎样？')
    await wrapper.get('.send-btn').trigger('click')
    await flushPromises()

    const alert = wrapper.get('.message.assistant[role="alert"]')
    expect(alert.attributes('aria-live')).toBe('assertive')
    expect(alert.text()).toContain('设备停机影响：CNC-001 4 小时场景。')
    expect(alert.text()).toContain('4h 停机影响 WO-2026-0042 / WO-RUSH-9001 / WO-DEMO-1001')
    expect(alert.text()).toContain('TRACE-EQ-DOWNTIME-CNC-001 / 待维护 / 设备维护 / 瓶颈保护')
    expect(alert.text()).toContain('影响对象：WO-2026-0042 / WO-RUSH-9001 / WO-DEMO-1001。')
    expect(alert.text()).not.toContain('TRACE-EQ-DOWNTIME-CNC-001-OLD')
    expect(alert.text()).not.toContain('尚未读取到设备停机证据')
  })

  it('uses labor reassignment and qualification evidence when RAG falls back to demo analysis', async () => {
    queryKnowledge.mockRejectedValueOnce(new Error('RAG 服务不可用'))
    readLaborReassignments.mockReturnValue([
      {
        id: 'labor-reassign-wo-013-op-10',
        workOrderNumber: 'WO-013',
        operationCode: 'OP-10',
        operationName: '淬火 / 回火',
        blockedEmployeeNumber: 'EMP-003',
        blockedEmployeeName: '王五',
        blockedCertification: '热处理上岗证',
        blockedExpiresAt: '2026-05-25',
        replacementEmployeeNumber: 'EMP-006',
        replacementEmployeeName: '孙八',
        reviewerName: '赵六',
        traceId: 'TRACE-LABOR-REASSIGN-WO-013-OP-10',
        auditId: 'AUD-LABOR-REASSIGN-WO-013-OP-10',
        createdAt: '2026-06-05T09:30:00.000Z',
      },
    ])
    readLaborQualificationBlocks.mockReturnValue([
      {
        id: 'labor-block-wo-013-op-10',
        workOrderNumber: 'WO-013',
        operationName: '淬火 / 回火',
        status: 'released',
        auditId: 'AUD-LABOR-BLOCK-WO-013-OP-10',
        traceId: 'TRACE-LABOR-BLOCK-WO-013-OP-10',
        releaseTraceId: 'TRACE-LABOR-RELEASE-WO-013-OP-10',
        createdAt: '2026-06-05T09:00:00.000Z',
      },
    ])
    readOtdEvidenceChainRecords.mockReturnValue([
      {
        id: 'labor-old',
        stage: '人员替班',
        title: '旧人员替班证据',
        summary: '旧证据不应出现在回答中。',
        object: 'WO-OLD',
        source: '人员管理 / 旧记录',
        traceId: 'TRACE-LABOR-OLD',
        status: 'closed',
        statusLabel: '旧记录',
        createdAt: '2026-06-01T01:00:00.000Z',
      },
      {
        id: 'labor-latest',
        stage: '人员替班',
        title: 'WO-013 热处理替班已释放',
        summary: 'EMP-006 孙八接管 WO-013 OP-10，热处理开工已重新放行。',
        object: 'WO-013 / OP-10',
        source: '人员管理 / 赵六',
        traceId: 'TRACE-LABOR-REASSIGN-WO-013-OP-10',
        status: 'closed',
        statusLabel: '已释放',
        createdAt: '2026-06-05T10:00:00.000Z',
      },
    ])
    const wrapper = mountChatPanel()

    await wrapper.get('.chat-input').setValue('人员资质临期对 WO-013 开工和排产有什么影响？')
    await wrapper.get('.send-btn').trigger('click')
    await flushPromises()

    const alert = wrapper.get('.message.assistant[role="alert"]')
    expect(alert.attributes('aria-live')).toBe('assertive')
    expect(alert.text()).toContain('人员能力影响：WO-013 热处理开工受人员资质约束。')
    expect(alert.text()).toContain('EMP-003 王五 的 热处理上岗证 2026-05-25 临期')
    expect(alert.text()).toContain('已由 EMP-006 孙八 接管 淬火 / 回火，审核人 赵六')
    expect(alert.text()).toContain('AUD-LABOR-BLOCK-WO-013-OP-10 已重新放行，释放追踪 TRACE-LABOR-RELEASE-WO-013-OP-10')
    expect(alert.text()).toContain('人员替班 / TRACE-LABOR-REASSIGN-WO-013-OP-10 / 已释放')
    expect(alert.text()).toContain('EMP-006 孙八接管 WO-013 OP-10，热处理开工已重新放行。')
    expect(alert.text()).toContain('系统管理 Agent 治理、报表 OTD 证据链和审计回放需要核对同一追踪编号')
    expect(alert.text()).not.toContain('TRACE-LABOR-OLD')
    expect(alert.text()).not.toContain('当前还没有人员约束证据')
  })

  it('uses closed monitoring situation evidence when RAG falls back to demo analysis', async () => {
    queryKnowledge.mockRejectedValueOnce(new Error('RAG 服务不可用'))
    readMonitoringSituationEscalationsBackendFirst.mockResolvedValueOnce([
      {
        id: 'monitoring-situation-cnc-quality-shortage',
        sourceEventId: 'MON-ALERT-CNC-001',
        title: 'CNC-001 负载、M-AL-6061 齐套和 INS-003 返工联动处置',
        source: '实时监控 / 现场态势图',
        workOrders: 'WO-RUSH-9001 / WO-003 / WO-2026-0042',
        priority: 'critical',
        owner: '生产经理',
        dueAt: '今日 15:30',
        auditId: 'AUD-MONITORING-SITUATION-20260615',
        traceId: 'TRACE-MONITORING-SITUATION-20260615',
        status: 'closed',
        statusLabel: '现场处置已闭环',
        scheduleWindow: '今日夜班',
        scheduleAction: '锁定 CNC-001 维护窗口，WO-RUSH-9001 后移到 CNC-003 空窗，INS-003 保留复验窗口。',
        riskImpact: '急单缺料、瓶颈设备和返工复验叠加。',
        riskSuggestion: '跨模块闭环后再释放排产建议。',
        otdImpact: 'OTD 风险从 3 单降为 1 单观察。',
        delayImpact: '急单延期风险下降 4h。',
        changeoverImpact: 'CNC-003 换线增加 25 分钟。',
        summary: '现场态势已完成跨模块处置。',
        evidence: ['TRACE-CNC-001', 'TRACE-KITTING-M-AL-6061', 'TRACE-INS-003-REWORK'],
        dispatchSteps: ['采购确认替代批次', '质量确认复验窗口', '生产经理关闭现场态势'],
        createdAt: '2026-06-15T08:00:00.000Z',
        closedAt: '2026-06-15T10:00:00.000Z',
        closureTrace: 'TRACE-MONITORING-SITUATION-CLOSURE-20260615',
      },
    ])
    const wrapper = mountChatPanel()
    await flushPromises()

    await wrapper.get('.chat-input').setValue('实时监控现场态势联动证据对排产和 OTD 有什么影响？')
    await wrapper.get('.send-btn').trigger('click')
    await flushPromises()

    const alert = wrapper.get('.message.assistant[role="alert"]')
    expect(alert.text()).toContain('知识问答服务暂不可用，已切换到离线演示回答。')
    expect(alert.text()).toContain('实时监控现场态势：CNC-001 负载、M-AL-6061 齐套和 INS-003 返工联动处置。')
    expect(alert.text()).toContain('OTD 影响：OTD 风险从 3 单降为 1 单观察。')
    expect(alert.text()).toContain('审计追踪：AUD-MONITORING-SITUATION-20260615 / TRACE-MONITORING-SITUATION-20260615')
    expect(alert.text()).toContain('闭环结论：现场处置已闭环，关闭追踪 TRACE-MONITORING-SITUATION-CLOSURE-20260615')
    expect(alert.text()).toContain('处置结果：生产经理关闭现场态势')
    expect(alert.text()).not.toContain('当前还没有生成处置包')

    const actionLabels = wrapper.findAll('.action-btn').map(button => button.text())
    expect(actionLabels).toContain('打开实时监控')
    expect(actionLabels).toContain('打开风险预警')
    expect(actionLabels).toContain('打开 AI 排产')
    expect(actionLabels).toContain('打开审计回放')
  })

  it('uses quality rework impact evidence when RAG falls back to demo analysis', async () => {
    queryKnowledge.mockRejectedValueOnce(new Error('RAG 服务不可用'))
    readQualityReworkImpact.mockReturnValue({
      inspectionId: 'INS-003',
      workOrderId: 'WO-003',
      productCode: 'PRD-HT-003',
      processName: '热处理',
      equipmentCode: 'HT-01',
      materialBatchCode: 'MAT-HT-20260615',
      batchCode: 'WO-003-HT',
      inspectionPoint: '硬度复验',
      defectQuantity: 6,
      reworkHours: 3.5,
      otdImpact: 'WO-003 延期 +1 单风险，复验窗口占用同批热处理资源。',
      recommendedAction: '插入 3.5h 返工与复验窗口，冻结 HT-01 低优先级工单。',
      rootCause: '热处理保温时间偏短导致硬度不足。',
      evidence: ['INS-003-HARDNESS', 'CAPA-HT-ROOT-CAUSE', 'TRACE-QA-REWORK-WO-003'],
      createdAt: '2026-06-15T09:00:00.000Z',
    })
    const wrapper = mountChatPanel()

    await wrapper.get('.chat-input').setValue('质量返工 INS-003 对 WO-003 排产和 OTD 有什么影响？')
    await wrapper.get('.send-btn').trigger('click')
    await flushPromises()

    const alert = wrapper.get('.message.assistant[role="alert"]')
    expect(alert.text()).toContain('质量返工影响：INS-003 / WO-003 已进入排产复核。')
    expect(alert.text()).toContain('质量事件：热处理 / 硬度复验，6 件返工，预计占用 3.5h。')
    expect(alert.text()).toContain('关联对象：设备 HT-01，物料批次 MAT-HT-20260615，批次号 WO-003-HT。')
    expect(alert.text()).toContain('根因证据：热处理保温时间偏短导致硬度不足。；INS-003-HARDNESS；CAPA-HT-ROOT-CAUSE；TRACE-QA-REWORK-WO-003。')
    expect(alert.text()).toContain('排产建议：插入 3.5h 返工与复验窗口，冻结 HT-01 低优先级工单。')
    expect(alert.text()).not.toContain('当前还没有生成返工排产事件')

    const actionLabels = wrapper.findAll('.action-btn').map(button => button.text())
    expect(actionLabels).toEqual(['打开质量闭环', '打开 AI 排产', '打开 OTD 报告'])
  })

  it('uses published quality knowledge reuse evidence when RAG falls back to demo analysis', async () => {
    queryKnowledge.mockRejectedValueOnce(new Error('RAG 服务不可用'))
    readLatestQualityKnowledgeSample.mockReturnValue({
      id: 'quality-knowledge-sample-wo-003-op20',
      workOrderId: 'WO-003',
      operationCode: 'OP-20',
      processName: '装配',
      equipmentCode: 'ASM-01',
      materialBatch: 'MAT-ASM-20260615',
      defectPattern: '装配扭矩偏移',
      documentId: 'QK-WO-003-OP20',
      documentTitle: 'WO-003 OP-20 扫码返工 CAPA 样本',
      version: 'v2.1',
      validUntil: '2026-12-31',
      auditId: 'AUD-QK-SAMPLE-WO-003-OP20',
      traceId: 'TRACE-QK-SAMPLE-WO-003-OP20',
      createdAt: '2026-06-15T09:00:00.000Z',
      summary: '扫码不合格、批次隔离和复验释放形成可复用 CAPA 样本。',
      capaRecommendations: ['隔离同批次', '复核扭矩工装', '复验后释放'],
      reuseTargets: ['同批次装配', 'ASM-01 同类缺陷'],
      evidenceTraceIds: ['TRACE-QA-REWORK-WO-003'],
    })
    readLatestQualityKnowledgeReuseDraft.mockReturnValue({
      id: 'quality-knowledge-reuse-draft-wo-018',
      sourceSampleId: 'quality-knowledge-sample-wo-003-op20',
      sourceTraceId: 'TRACE-QK-SAMPLE-WO-003-OP20',
      targetWorkOrderId: 'WO-018',
      targetOperationCode: 'OP-20',
      targetProcessName: '装配',
      targetEquipmentCode: 'ASM-01',
      targetMaterialBatch: 'MAT-ASM-20260618',
      targetDefectPattern: '装配扭矩偏移',
      matchScore: 94,
      effectScore: 88,
      auditId: 'AUD-QK-REUSE-DRAFT-WO-018',
      traceId: 'TRACE-QK-REUSE-DRAFT-WO-018',
      createdAt: '2026-06-16T08:30:00.000Z',
      summary: 'WO-018 命中同类扭矩偏移 CAPA 复用。',
      matchDimensions: [],
      dispositionDraft: ['隔离 WO-018 同批件', '复核 ASM-01 扭矩夹具'],
      effectMetrics: [],
      evidenceTraceIds: ['TRACE-QK-SAMPLE-WO-003-OP20'],
    })
    readLatestQualityKnowledgeReuseClosure.mockReturnValue({
      id: 'quality-knowledge-reuse-closure-wo-018',
      draftId: 'quality-knowledge-reuse-draft-wo-018',
      draftTraceId: 'TRACE-QK-REUSE-DRAFT-WO-018',
      targetWorkOrderId: 'WO-018',
      targetOperationCode: 'OP-20',
      formalCapaTitle: 'WO-018 装配扭矩 CAPA',
      owner: '质量工程师',
      dueAt: '2026-06-16T12:00:00.000Z',
      verification: '复验扭矩通过且无同类缺陷复发。',
      auditId: 'AUD-QK-REUSE-CAPA-WO-018',
      traceId: 'TRACE-QK-REUSE-CAPA-WO-018',
      effectTraceId: 'TRACE-QK-REUSE-EFFECT-WO-018',
      approvedAt: '2026-06-16T09:00:00.000Z',
      verifiedAt: '2026-06-16T11:30:00.000Z',
      status: 'verified',
      statusLabel: '已验证',
      effectScoreBefore: 61,
      effectScoreAfter: 90,
      effectReview: '复验释放后未再触发同类缺陷。',
      feedbackActions: [],
      feedbackMetrics: [],
    })
    readLatestQualityKnowledgeReviewQueueRecord.mockReturnValue({
      id: 'quality-review-queue-wo-003-op20',
      sourceRankingId: 'quality-reuse-ranking-wo-003',
      targetWorkOrderId: 'WO-003',
      operationCode: 'OP-20',
      title: 'WO-003 OP-20 低分复核',
      reason: '跨工序复用命中低分样本，需要降权。',
      owner: '质量主管',
      dueAt: '2026-06-16T18:00:00.000Z',
      auditId: 'AUD-QK-REVIEW-WO-003',
      traceId: 'TRACE-QK-REVIEW-WO-003',
      createdAt: '2026-06-16T08:00:00.000Z',
      status: 'closed',
      statusLabel: '已关闭',
      effectScore: 61,
      reviewActions: ['禁用跨工序低分样本', '进入 R3 再训练'],
      closedAt: '2026-06-16T10:00:00.000Z',
      decisionAuditId: 'AUD-QK-REVIEW-DECISION-WO-003',
      decisionTraceId: 'TRACE-QK-REVIEW-DECISION-WO-003',
      decisionLabel: '低分样本降权',
      decisionSummary: '保留同工序 CAPA，禁用跨工序复用。',
      disabledReuseRule: '禁止 OP-10 热处理样本直接复用到 OP-20 装配。',
      retrainingTraceId: 'TRACE-QK-R3-RETRAINING-CANDIDATE',
      retrainingPlan: ['加入独立装配负样本', '灰度前复核 OP-20 推荐'],
    })
    const publishedVersion = {
      id: 'quality-retraining-version-r3',
      sourceReviewQueueId: 'recommendation-feedback-feedback-r3-001',
      targetWorkOrderId: 'WO-DEMO-1018',
      operationCode: 'OP-20',
      candidateTraceId: 'TRACE-QK-R3-RETRAINING-CANDIDATE',
      trainingSetVersion: 'QK-TRAIN-20260521-R3',
      trainingSetName: 'R3 装配推荐样本',
      status: 'gray_published',
      statusLabel: '已灰度发布',
      approvedBy: '质量主管',
      approvedAt: '2026-06-16T10:30:00.000Z',
      approvalAuditId: 'AUD-QK-R3-APPROVAL',
      approvalTraceId: 'TRACE-QK-R3-APPROVAL',
      positiveSampleCount: 42,
      negativeSampleCount: 12,
      featurePolicy: '仅在 OP-20 装配推荐灰度启用。',
      changeSummary: ['降权跨工序低分样本'],
      validationGates: ['误召回 0 次'],
      validationStatus: 'passed',
      publishAuditId: 'AUD-QK-R3-GRAY-PUBLISH',
      publishTraceId: 'TRACE-QK-R3-GRAY-PUBLISH',
    }
    readQualityKnowledgeRetrainingVersionRecords.mockReturnValue([publishedVersion])
    selectPrioritizedQualityKnowledgeRecommendationVersion.mockReturnValue(publishedVersion)
    readLatestQualityKnowledgeRecommendationFeedbackRecord.mockReturnValue({
      id: 'quality-recommendation-feedback-r3',
      recommendationId: 'quality-recommendation-op20-r3',
      targetWorkOrderId: 'WO-018',
      operationCode: 'OP-20',
      trainingSetVersion: 'QK-TRAIN-20260521-R3',
      recommendationSummary: '优先匹配独立装配 CAPA 样本。',
      decision: 'accepted',
      decisionLabel: '已采纳',
      decidedBy: '质量主管',
      decidedAt: '2026-06-16T13:00:00.000Z',
      auditId: 'AUD-QK-R3-FEEDBACK',
      traceId: 'TRACE-QK-R3-FEEDBACK',
      effectTrendLabel: '误召回下降',
      nextTrainingSetVersion: 'QK-TRAIN-20260521-R4',
      nextTrainingTraceId: 'TRACE-QK-R4-NEXT-TRAINING',
    })
    const wrapper = mountChatPanel()

    await wrapper.get('.chat-input').setValue('扫码返工同类质量问题如何复用 CAPA 推荐？')
    await wrapper.get('.send-btn').trigger('click')
    await flushPromises()

    const alert = wrapper.get('.message.assistant[role="alert"]')
    expect(alert.text()).toContain('扫码质量复用建议：WO-003 的返工样本已可复用。')
    expect(alert.text()).toContain('样本：WO-003 OP-20 扫码返工 CAPA 样本 v2.1，审计编号 AUD-QK-SAMPLE-WO-003-OP20。')
    expect(alert.text()).toContain('草案动作：隔离 WO-018 同批件；复核 ASM-01 扭矩夹具')
    expect(alert.text()).toContain('正式 CAPA：WO-018 装配扭矩 CAPA 已验证，复用评分 61 -> 90 分。')
    expect(alert.text()).toContain('再训练发布：QK-TRAIN-20260521-R3 已灰度发布，正式范围 已启用。')
    expect(alert.text()).toContain('发布审计：AUD-QK-R3-GRAY-PUBLISH / TRACE-QK-R3-GRAY-PUBLISH。')
    expect(alert.text()).toContain('采纳反馈：已采纳，效果趋势 误召回下降，进入 QK-TRAIN-20260521-R4。')
    expect(alert.text()).toContain('反馈审计：AUD-QK-R3-FEEDBACK / TRACE-QK-R3-FEEDBACK / TRACE-QK-R4-NEXT-TRAINING。')
    expect(alert.text()).not.toContain('当前缺少可正式引用的扫码返工样本')
  })

  it('uses closed MRB disposition evidence when RAG falls back to demo analysis', async () => {
    queryKnowledge.mockRejectedValueOnce(new Error('RAG 服务不可用'))
    readQualityMrbDispositionRecord.mockReturnValue({
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
      otdImpact: 'WO-004 延期 +2 单风险，需补料与重排',
      scheduleImpact: '冻结 WO-004 原装配窗口，插入 MAT-STEEL-A12 补料 ETA、返工替代工单和终检复验窗口。',
      recommendedAction: '排产重建 WO-004 装配与复检窗口。',
      auditId: 'AUD-QA-MRB-DISPOSITION-20260521',
      traceId: 'TRACE-QA-WO-004-MRB-DISPOSITION-20260521',
      scheduleTraceId: 'TRACE-QA-WO-004-MRB-SCHEDULE-IMPACT-20260521',
      createdAt: '2026-05-21T09:00:00.000Z',
      closureAuditId: 'AUD-QA-MRB-CLOSURE-20260521',
      closureTraceId: 'TRACE-QA-WO-004-MRB-CLOSURE-20260521',
      closureSummary: '质量隔离、补料 ETA、排产重建和客户说明均已确认，WO-004 转入补料后装配/复检窗口。',
      closedAt: '2026-05-21T15:30:00.000Z',
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
      ],
    })
    const wrapper = mountChatPanel()

    await wrapper.get('.chat-input').setValue('质量 MRB 报废补料闭环后对 OTD 和重排有什么影响？')
    await wrapper.get('.send-btn').trigger('click')
    await flushPromises()

    const alert = wrapper.get('.message.assistant[role="alert"]')
    expect(alert.attributes('aria-live')).toBe('assertive')
    expect(alert.text()).toContain('知识问答服务暂不可用，已切换到离线演示回答。')
    expect(alert.text()).toContain('WO-004 装配间隙超差 MRB 处置决策 已闭环')
    expect(alert.text()).toContain('处置结论：报废补料重建，状态 MRB 处置已闭环')
    expect(alert.text()).toContain('质量事件：INS-004 / WO-004 / 装配，4 件 装配间隙超差 / 功能测试不合格')
    expect(alert.text()).toContain('OTD 影响：WO-004 延期 +2 单风险，需补料与重排')
    expect(alert.text()).toContain('排产影响：冻结 WO-004 原装配窗口')
    expect(alert.text()).toContain('审计追踪：AUD-QA-MRB-DISPOSITION-20260521 / TRACE-QA-WO-004-MRB-DISPOSITION-20260521 / TRACE-QA-WO-004-MRB-SCHEDULE-IMPACT-20260521')
    expect(alert.text()).toContain('闭环结论：质量隔离、补料 ETA、排产重建和客户说明均已确认')
    expect(alert.text()).toContain('闭环追踪：AUD-QA-MRB-CLOSURE-20260521 / TRACE-QA-WO-004-MRB-CLOSURE-20260521')
    expect(alert.text()).toContain('动作结果：质量：4 件已隔离判废；采购：补料 ETA 已确认')
    expect(alert.text()).not.toContain('当前还没有生成处置决策')
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
    expect(wrapper.find('.message.assistant[role="status"]').exists()).toBe(false)
    expect(recordAssistantActionAudit).toHaveBeenCalledWith(expect.objectContaining({
      actor: '王工',
      role: 'Planner',
      permitted: false,
      action: expect.objectContaining({
        id: 'open-risk',
        type: 'navigate',
      }),
    }))
  })

  it('fails loud when a plain navigation failure audit cannot be written', async () => {
    routerPush.mockRejectedValueOnce(new Error('risk route unavailable'))
    recordAssistantActionAudit.mockImplementationOnce(() => {
      throw new Error('navigation failure audit unavailable')
    })
    const wrapper = mountChatPanel()

    await wrapper.get('.chat-input').setValue('打开风险预警')
    await wrapper.get('.send-btn').trigger('click')
    await flushPromises()

    const actionButton = wrapper.findAll('.action-btn')
      .find(button => button.text() === '打开风险预警')
    expect(actionButton).toBeDefined()
    await actionButton!.trigger('click')
    await flushPromises()

    expect(wrapper.find('.message.assistant[role="status"]').exists()).toBe(false)
    const alerts = wrapper.findAll('.message.assistant[role="alert"]')
    expect(alerts.map(alert => alert.text()).join('\n')).toContain('打开风险预警页面跳转失败')
    expect(alerts.map(alert => alert.text()).join('\n')).toContain('页面跳转失败，失败审计写入失败')
    expect(alerts.map(alert => alert.text()).join('\n')).toContain('navigation failure audit unavailable')
  })

  it('locks a successful plain navigation action so repeated clicks do not duplicate audit evidence', async () => {
    const wrapper = mountChatPanel()

    await wrapper.get('.chat-input').setValue('打开风险预警')
    await wrapper.get('.send-btn').trigger('click')
    await flushPromises()

    const actionButton = wrapper.findAll('.action-btn')
      .find(button => button.text() === '打开风险预警')
    expect(actionButton).toBeDefined()
    await actionButton!.trigger('click')
    await flushPromises()

    expect(actionButton!.attributes('disabled')).toBeDefined()

    await actionButton!.trigger('click')
    await flushPromises()

    expect(routerPush).toHaveBeenCalledTimes(1)
    expect(routerPush).toHaveBeenCalledWith('/risk')
    expect(recordAssistantActionAudit).toHaveBeenCalledTimes(1)
    expect(recordAssistantActionAudit).toHaveBeenCalledWith(expect.objectContaining({
      actor: '王工',
      role: 'Planner',
      permitted: true,
      action: expect.objectContaining({
        id: 'open-risk',
        type: 'navigate',
      }),
    }))
    const statusMessages = wrapper.findAll('.message.assistant[role="status"]')
      .filter(message => message.text().includes('已打开风险预警页面'))
    expect(statusMessages).toHaveLength(1)
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

  it('locks a restricted action after denial so repeated clicks do not duplicate audit evidence', async () => {
    const wrapper = mountChatPanel()

    await wrapper.get('.chat-input').setValue('帮我生成交期恢复执行包')
    await wrapper.get('.send-btn').trigger('click')
    await flushPromises()

    const actionButton = wrapper.get('.action-btn')
    await actionButton.trigger('click')
    await flushPromises()

    expect(actionButton.attributes('disabled')).toBeDefined()

    await actionButton.trigger('click')
    await flushPromises()

    expect(recordAssistantActionAudit).toHaveBeenCalledTimes(1)
    expect(wrapper.findAll('.message.assistant[role="alert"]')
      .filter(message => message.text().includes('动作已拒绝：当前用户缺少 Admin 权限'))).toHaveLength(1)
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

  it('locks the delivery recovery package action after success so duplicate evidence is not written', async () => {
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

    const createPackageButton = wrapper.findAll('.action-btn')
      .find(button => button.text() === '生成交期恢复执行包')
    expect(createPackageButton).toBeDefined()
    await createPackageButton!.trigger('click')
    await flushPromises()

    expect(createPackageButton!.attributes('disabled')).toBeDefined()

    await createPackageButton!.trigger('click')
    await flushPromises()

    expect(writeAssistantRecoveryPackage).toHaveBeenCalledTimes(1)
    expect(recordAssistantActionAudit).toHaveBeenCalledTimes(1)
    expect(routerPush).toHaveBeenCalledTimes(1)
    const statusMessages = wrapper.findAll('.message.assistant[role="status"]')
      .filter(message => message.text().includes('动作已执行：已生成 WO-RUSH-9001 交期恢复执行包'))
    expect(statusMessages).toHaveLength(1)
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

  it('locks the anomaly disposition package action after success so duplicate evidence is not written', async () => {
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

    expect(createPackageButton!.attributes('disabled')).toBeDefined()

    await createPackageButton!.trigger('click')
    await flushPromises()

    expect(writeAssistantAnomalyDispositionPackage).toHaveBeenCalledTimes(1)
    expect(recordAssistantActionAudit).toHaveBeenCalledTimes(1)
    expect(routerPush).toHaveBeenCalledTimes(1)
    const statusMessages = wrapper.findAll('.message.assistant[role="status"]')
      .filter(message => message.text().includes('动作已执行：已创建 CNC-001 主轴温升异常处置卡'))
    expect(statusMessages).toHaveLength(1)
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

  it('locks the engineering constraint package action after success so duplicate evidence is not written', async () => {
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

    expect(createPackageButton!.attributes('disabled')).toBeDefined()

    await createPackageButton!.trigger('click')
    await flushPromises()

    expect(writeAssistantEngineeringConstraintPackage).toHaveBeenCalledTimes(1)
    expect(recordAssistantActionAudit).toHaveBeenCalledTimes(1)
    expect(routerPush).toHaveBeenCalledTimes(1)
    const statusMessages = wrapper.findAll('.message.assistant[role="status"]')
      .filter(message => message.text().includes('动作已执行：已生成 BOM-A100 / R-B200 工程约束复核包'))
    expect(statusMessages).toHaveLength(1)
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

  it('locks the customer commitment package action after success so duplicate evidence is not written', async () => {
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

    expect(createPackageButton!.attributes('disabled')).toBeDefined()

    await createPackageButton!.trigger('click')
    await flushPromises()

    expect(writeOtdKpiCommitmentPackage).toHaveBeenCalledTimes(1)
    expect(recordAssistantActionAudit).toHaveBeenCalledTimes(1)
    expect(routerPush).toHaveBeenCalledTimes(1)
    const statusMessages = wrapper.findAll('.message.assistant[role="status"]')
      .filter(message => message.text().includes('动作已执行：已生成华东新能源交付恢复承诺包'))
    expect(statusMessages).toHaveLength(1)
  })

  it('answers outsourcing commitment status with delivery-accounting safeguards and workflow actions', async () => {
    queryKnowledge.mockRejectedValueOnce(new Error('RAG 服务不可用'))
    readLatestOutsourcingCommitmentPackage.mockReturnValue({
      id: 'outsourcing-commitment-flange-dn100',
      sourceKpiId: 'product-flange-dn100',
      dimensionLabel: '产品族',
      targetName: '法兰盘 DN100',
      title: '法兰盘 DN100 外协承诺包',
      partnerName: '华东精密外协厂',
      promiseDate: '2026-06-05',
      affectedOrders: 'WO-DEMO-1013 / WO-DEMO-1014',
      sourceTraceId: 'TRACE-KPI-PRODUCT-FLANGE-DN100',
      auditId: 'AUD-OUTSOURCING-COMMITMENT-FLANGE-DN100',
      traceId: 'TRACE-OUTSOURCING-COMMITMENT-FLANGE-DN100',
      statusLabel: '外协承诺已锁定',
      message: '华东精密外协厂已承诺 6 月 5 日到货。',
      createdAt: '2026-06-02T05:00:00.000Z',
    })
    const wrapper = mountChatPanel()

    await wrapper.get('.chat-input').setValue('外协承诺现在能不能算 OTD 恢复？')
    await wrapper.get('.send-btn').trigger('click')
    await flushPromises()

    const alert = wrapper.get('.message.assistant[role="alert"]')
    expect(alert.text()).toContain('知识问答服务暂不可用，已切换到离线演示回答。')
    expect(alert.text()).toContain('外协承诺口径：法兰盘 DN100 当前状态为 外协承诺已锁定')
    expect(alert.text()).toContain('厂外等待口径尚未关闭')
    expect(alert.text()).toContain('不能计入厂内已恢复订单')
    expect(alert.text()).toContain('TRACE-OUTSOURCING-COMMITMENT-FLANGE-DN100')

    const actionLabels = wrapper.findAll('.action-btn').map(button => button.text())
    expect(actionLabels).toEqual([
      '打开采购协同',
      '打开 AI 排产',
      '打开 OTD 报告',
      '打开系统治理',
      '打开审计回放',
    ])

    await wrapper.findAll('.action-btn')[0].trigger('click')
    await flushPromises()

    expect(routerPush).toHaveBeenCalledWith('/purchase')
    expect(wrapper.get('.message.assistant[role="status"]').text()).toContain('已打开采购协同页面，核对 法兰盘 DN100 外协到货与收货闭环。')
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

  it('locks the BOM kitting package action after it succeeds to avoid duplicate evidence writes', async () => {
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

    const lockedButton = wrapper.findAll('.action-btn')
      .find(button => button.text() === '生成 BOM 展开齐套检查包')
    expect(lockedButton?.attributes('disabled')).toBeDefined()
    await lockedButton!.trigger('click')
    await flushPromises()

    expect(writeBomKittingPackage).toHaveBeenCalledTimes(1)
    expect(upsertOtdEvidenceChainRecord).toHaveBeenCalledTimes(1)
    expect(recordAssistantActionAudit).toHaveBeenCalledTimes(1)
    expect(wrapper.findAll('.message.assistant[role="status"]')).toHaveLength(1)
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

  it('locks the equipment downtime package action after success so duplicate evidence is not written', async () => {
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

    expect(createPackageButton!.attributes('disabled')).toBeDefined()

    await createPackageButton!.trigger('click')
    await flushPromises()

    expect(writeEquipmentDowntimeEvent).toHaveBeenCalledTimes(1)
    expect(upsertOtdEvidenceChainRecord).toHaveBeenCalledTimes(1)
    expect(recordAssistantActionAudit).toHaveBeenCalledTimes(1)
    expect(routerPush).toHaveBeenCalledTimes(1)
    const statusMessages = wrapper.findAll('.message.assistant[role="status"]')
      .filter(message => message.text().includes('动作已执行：已生成 CNC-001 设备停机复核包'))
    expect(statusMessages).toHaveLength(1)
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
