import { flushPromises, mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import QualityCapaTaskPanel from '../../src/components/quality/QualityCapaTaskPanel.vue'

const readAssistantRecoveryPackagesBackendFirst = vi.hoisted(() => vi.fn())
const readQualityKnowledgeReuseClosuresBackendFirst = vi.hoisted(() => vi.fn())
const readQualityKnowledgeReviewQueueRecordsBackendFirst = vi.hoisted(() => vi.fn())
const readQualityKnowledgeRecommendationFeedbackRecordsBackendFirst = vi.hoisted(() => vi.fn())
const readQualityKnowledgeGrayReleaseDecisionRecordsBackendFirst = vi.hoisted(() => vi.fn())
const writeQualityCapaClosure = vi.hoisted(() => vi.fn())
const writeQualityKnowledgeReuseClosure = vi.hoisted(() => vi.fn())
const verifyQualityKnowledgeReuseClosure = vi.hoisted(() => vi.fn())
const writeQualityKnowledgeReviewQueueRecord = vi.hoisted(() => vi.fn())
const closeLowScoreQualityKnowledgeReviewQueueRecord = vi.hoisted(() => vi.fn())
const acceptQualityKnowledgeRecommendation = vi.hoisted(() => vi.fn())
const buildQualityKnowledgeReuseRanking = vi.hoisted(() => vi.fn())
const closeAssistantRecoveryQualityAction = vi.hoisted(() => vi.fn())
const createBarcodeQualityReuseClosure = vi.hoisted(() => vi.fn())

vi.mock('../../src/utils/quality-capa-sync', () => ({
  writeQualityCapaClosure,
}))

vi.mock('../../src/utils/assistant-action-package-sync', () => ({
  closeAssistantRecoveryQualityAction,
  readAssistantRecoveryPackages: vi.fn(() => []),
  readAssistantRecoveryPackagesBackendFirst,
}))

vi.mock('../../src/utils/quality-knowledge-sample-sync', () => ({
  acceptQualityKnowledgeRecommendation,
  buildQualityKnowledgeReuseRanking,
  closeLowScoreQualityKnowledgeReviewQueueRecord,
  createBarcodeQualityReuseClosure,
  readLatestQualityKnowledgeReuseClosure: vi.fn(() => null),
  readLatestQualityKnowledgeReviewQueueRecord: vi.fn(() => null),
  readQualityKnowledgeGrayReleaseDecisionRecords: vi.fn(() => []),
  readQualityKnowledgeGrayReleaseDecisionRecordsBackendFirst,
  readQualityKnowledgeRecommendationFeedbackRecords: vi.fn(() => []),
  readQualityKnowledgeRecommendationFeedbackRecordsBackendFirst,
  readQualityKnowledgeReuseClosuresBackendFirst,
  readQualityKnowledgeReviewQueueRecordsBackendFirst,
  verifyQualityKnowledgeReuseClosure,
  writeQualityKnowledgeReviewQueueRecord,
  writeQualityKnowledgeReuseClosure,
}))

describe('QualityCapaTaskPanel', () => {
  beforeEach(() => {
    readAssistantRecoveryPackagesBackendFirst.mockResolvedValue([])
    readQualityKnowledgeReuseClosuresBackendFirst.mockResolvedValue([])
    readQualityKnowledgeReviewQueueRecordsBackendFirst.mockResolvedValue([])
    readQualityKnowledgeRecommendationFeedbackRecordsBackendFirst.mockResolvedValue([])
    readQualityKnowledgeGrayReleaseDecisionRecordsBackendFirst.mockResolvedValue([])
    writeQualityCapaClosure.mockReset()
    writeQualityKnowledgeReuseClosure.mockReset()
    verifyQualityKnowledgeReuseClosure.mockReset()
    writeQualityKnowledgeReviewQueueRecord.mockReset()
    closeLowScoreQualityKnowledgeReviewQueueRecord.mockReset()
    acceptQualityKnowledgeRecommendation.mockReset()
    buildQualityKnowledgeReuseRanking.mockReset()
    buildQualityKnowledgeReuseRanking.mockReturnValue([])
    closeAssistantRecoveryQualityAction.mockReset()
    createBarcodeQualityReuseClosure.mockReset()
  })

  it('announces the open CAPA verification count as a status', async () => {
    const wrapper = mount(QualityCapaTaskPanel)
    await flushPromises()

    const badge = wrapper.get('.status-badge')
    expect(badge.text()).toBe('3 个待验证')
    expect(badge.attributes('role')).toBe('status')
    expect(badge.attributes('aria-live')).toBe('polite')
  })

  it('keeps local CAPA state visible and fails loud when startup evidence refresh fails', async () => {
    readQualityKnowledgeReuseClosuresBackendFirst.mockRejectedValueOnce(new Error('quality reuse closure API unavailable'))
    readQualityKnowledgeRecommendationFeedbackRecordsBackendFirst.mockRejectedValueOnce(new Error('quality feedback API unavailable'))

    const wrapper = mount(QualityCapaTaskPanel)
    await flushPromises()

    expect(wrapper.get('.status-badge').text()).toBe('3 个待验证')
    expect(wrapper.get('.task-grid').text()).toContain('复核 HT-01 炉温曲线并锁定返工参数')
    const alert = wrapper.get('[role="alert"]')
    expect(alert.attributes('aria-live')).toBe('assertive')
    expect(alert.text()).toContain('质量 CAPA 启动证据刷新失败，已保留本地处置状态')
    expect(alert.text()).toContain('质量知识复用闭环: quality reuse closure API unavailable')
    expect(alert.text()).toContain('质量推荐采纳反馈: quality feedback API unavailable')
  })

  it('keeps startup fallback quiet when offline demo skips quality knowledge evidence reads', async () => {
    const offlineDemoError = new Error('Offline demo mode skipped backend request: /api/v1/scheduling/quality-knowledge-evidence')
    offlineDemoError.name = 'OfflineDemoApiError'
    readQualityKnowledgeReuseClosuresBackendFirst.mockRejectedValueOnce(offlineDemoError)
    readQualityKnowledgeReviewQueueRecordsBackendFirst.mockRejectedValueOnce(offlineDemoError)
    readQualityKnowledgeRecommendationFeedbackRecordsBackendFirst.mockRejectedValueOnce(offlineDemoError)
    readQualityKnowledgeGrayReleaseDecisionRecordsBackendFirst.mockRejectedValueOnce(offlineDemoError)

    const wrapper = mount(QualityCapaTaskPanel)
    await flushPromises()

    expect(wrapper.get('.status-badge').text()).toBe('3 个待验证')
    expect(wrapper.find('[role="alert"]').exists()).toBe(false)
    expect(wrapper.text()).not.toContain('Offline demo mode skipped backend request')
    expect(wrapper.text()).not.toContain('质量 CAPA 启动证据刷新失败')
  })

  it('shows bilingual guidance, contextual evidence links, and help before complex CAPA writebacks', async () => {
    const wrapper = mount(QualityCapaTaskPanel, {
      props: {
        qualityKnowledgeReuseDraft: {
          id: 'reuse-draft-guidance',
          sourceSampleId: 'sample-guidance',
          sourceTraceId: 'TRACE-SAMPLE-GUIDANCE',
          targetWorkOrderId: 'WO-DEMO-1012',
          targetOperationCode: 'OP-10',
          targetProcessName: 'CNC 精加工',
          targetEquipmentCode: 'CNC-002',
          targetMaterialBatch: 'AL-202605-B',
          targetDefectPattern: '首件尺寸偏差',
          matchScore: 92,
          effectScore: 88,
          auditId: 'AUD-REUSE-DRAFT-GUIDANCE',
          traceId: 'TRACE-REUSE-DRAFT-GUIDANCE',
          createdAt: '2026-06-02T08:00:00',
          summary: '同类首件尺寸偏差可复用扫码返工 CAPA。',
          matchDimensions: [],
          dispositionDraft: ['冻结下道交接', '复验首件尺寸'],
          effectMetrics: [{ label: '分析节省', value: '45 分钟' }],
          evidenceTraceIds: ['TRACE-SAMPLE-GUIDANCE'],
        },
      },
    })
    await flushPromises()

    const guidance = wrapper.get('.capa-operation-guidance')
    expect(guidance.attributes('id')).toBe('quality-capa-operation-help')
    expect(guidance.text()).toContain('操作前提示')
    expect(guidance.text()).toContain('Before writeback')
    expect(guidance.text()).toContain('正式 CAPA、低分复核队列、发布推荐采纳都会回写质量知识、审计留痕与后续训练排序。')
    expect(guidance.text()).toContain('These actions update quality knowledge, audit evidence, and future recommendation ranking.')

    const links = guidance.findAll('a')
    expect(links.map((link) => link.text())).toEqual([
      '查看草案证据 TRACE-REUSE-DRAFT-GUIDANCE',
      '查看审计 AUD-REUSE-DRAFT-GUIDANCE',
      '帮助 / Help',
    ])
    expect(links.map((link) => link.attributes('href'))).toEqual([
      '#quality-capa-evidence-TRACE-REUSE-DRAFT-GUIDANCE',
      '#quality-capa-audit-AUD-REUSE-DRAFT-GUIDANCE',
      '#quality-capa-operation-help',
    ])
    expect(wrapper.get('.formal-capa-flow').attributes('aria-describedby')).toBe('quality-capa-operation-help')
  })

  it('records verified CAPA closure as a status update', async () => {
    const wrapper = mount(QualityCapaTaskPanel)
    await flushPromises()

    const taskCards = wrapper.findAll('.task-card')
    expect(taskCards).toHaveLength(3)

    await taskCards[2].get('button').trigger('click')
    await flushPromises()

    expect(writeQualityCapaClosure).toHaveBeenCalledWith(expect.objectContaining({
      inspectionId: 'INS-003',
      workOrderId: 'WO-003',
      taskTitle: '新增热处理硬度 SPC 预警点',
      verification: 'SPC 连续 6 点无上升风险',
      auditState: 'CAPA 已验证，根因证据、责任人、验证标准和 OTD 复盘已归档',
    }))
    expect(taskCards[2].classes()).toContain('verified')
    expect(taskCards[2].get('button').text()).toBe('已验证')

    const status = wrapper.get('.closure-sync-message')
    expect(status.attributes('role')).toBe('status')
    expect(status.attributes('aria-live')).toBe('polite')
    expect(status.text()).toContain('新增热处理硬度 SPC 预警点 已同步到审计回放与 OTD 复盘')
  })

  it('starts an open CAPA task without writing closure evidence before verification', async () => {
    const wrapper = mount(QualityCapaTaskPanel)
    await flushPromises()

    const taskCards = wrapper.findAll('.task-card')
    await taskCards[0].get('button').trigger('click')
    await flushPromises()

    expect(writeQualityCapaClosure).not.toHaveBeenCalled()
    expect(taskCards[0].classes()).toContain('doing')
    expect(taskCards[0].get('.task-topline em').text()).toBe('执行中')
    expect(wrapper.get('.capa-trace li').text()).toContain('复核 HT-01 炉温曲线并锁定返工参数 已开始执行')
    expect(wrapper.find('[role="alert"]').exists()).toBe(false)
  })

  it('does not rewrite evidence when a verified CAPA task button is clicked again', async () => {
    const wrapper = mount(QualityCapaTaskPanel)
    await flushPromises()

    const taskCards = wrapper.findAll('.task-card')
    await taskCards[2].get('button').trigger('click')
    await flushPromises()
    await taskCards[2].get('button').trigger('click')
    await flushPromises()

    expect(writeQualityCapaClosure).toHaveBeenCalledTimes(1)
    expect(taskCards[2].classes()).toContain('verified')
    expect(taskCards[2].get('button').text()).toBe('已验证')
  })

  it('keeps CAPA task in progress and alerts when closure sync fails', async () => {
    writeQualityCapaClosure.mockImplementationOnce(() => {
      throw new Error('CAPA closure storage unavailable')
    })
    const wrapper = mount(QualityCapaTaskPanel)
    await flushPromises()

    const taskCards = wrapper.findAll('.task-card')
    await taskCards[2].get('button').trigger('click')
    await flushPromises()

    expect(writeQualityCapaClosure).toHaveBeenCalledWith(expect.objectContaining({
      taskTitle: '新增热处理硬度 SPC 预警点',
      verification: 'SPC 连续 6 点无上升风险',
    }))
    expect(taskCards[2].classes()).not.toContain('verified')
    expect(taskCards[2].classes()).toContain('doing')
    expect(taskCards[2].get('button').text()).toBe('推进处置')

    const alert = wrapper.get('[role="alert"]')
    expect(alert.attributes('aria-live')).toBe('assertive')
    expect(alert.text()).toContain('CAPA 验证同步失败')
    expect(alert.text()).toContain('CAPA closure storage unavailable')
    expect(wrapper.find('.closure-sync-message').exists()).toBe(false)
  })

  it('keeps reuse draft pending and alerts when formal CAPA sync fails', async () => {
    writeQualityKnowledgeReuseClosure.mockImplementationOnce(() => {
      throw new Error('reuse closure storage unavailable')
    })
    const wrapper = mount(QualityCapaTaskPanel, {
      props: {
        qualityKnowledgeReuseDraft: {
          id: 'reuse-draft-test',
          sourceSampleId: 'sample-test',
          sourceTraceId: 'TRACE-SAMPLE-TEST',
          targetWorkOrderId: 'WO-DEMO-1012',
          targetOperationCode: 'OP-10',
          targetProcessName: 'CNC 精加工',
          targetEquipmentCode: 'CNC-002',
          targetMaterialBatch: 'AL-202605-B',
          targetDefectPattern: '首件尺寸偏差',
          matchScore: 92,
          effectScore: 88,
          auditId: 'AUD-REUSE-DRAFT-TEST',
          traceId: 'TRACE-REUSE-DRAFT-TEST',
          createdAt: '2026-06-02T08:00:00',
          summary: '同类首件尺寸偏差可复用扫码返工 CAPA。',
          matchDimensions: [],
          dispositionDraft: ['冻结下道交接', '复验首件尺寸'],
          effectMetrics: [{ label: '分析节省', value: '45 分钟' }],
          evidenceTraceIds: ['TRACE-SAMPLE-TEST'],
        },
      },
    })
    await flushPromises()

    await wrapper.get('.formal-capa-flow button').trigger('click')
    await flushPromises()

    expect(writeQualityKnowledgeReuseClosure).toHaveBeenCalled()
    expect(wrapper.get('.formal-capa-flow strong').text()).toContain('草案待质量工程师复核')
    expect(wrapper.get('.formal-capa-flow button').text()).toBe('复核草案并转正式 CAPA')
    expect(wrapper.find('.formal-capa-meta').exists()).toBe(false)

    const alert = wrapper.get('[role="alert"]')
    expect(alert.attributes('aria-live')).toBe('assertive')
    expect(alert.text()).toContain('质量知识复用转正式 CAPA 失败')
    expect(alert.text()).toContain('reuse closure storage unavailable')
    expect(wrapper.find('.closure-sync-message').exists()).toBe(false)
  })

  it('turns a reviewed reuse draft into formal CAPA and records ownership evidence', async () => {
    const draft = {
      id: 'reuse-draft-success',
      sourceSampleId: 'sample-success',
      sourceTraceId: 'TRACE-SAMPLE-SUCCESS',
      targetWorkOrderId: 'WO-DEMO-1012',
      targetOperationCode: 'OP-10',
      targetProcessName: 'CNC 精加工',
      targetEquipmentCode: 'CNC-002',
      targetMaterialBatch: 'AL-202605-B',
      targetDefectPattern: '首件尺寸偏差',
      matchScore: 92,
      effectScore: 88,
      auditId: 'AUD-REUSE-DRAFT-SUCCESS',
      traceId: 'TRACE-REUSE-DRAFT-SUCCESS',
      createdAt: '2026-06-02T08:00:00',
      summary: '同类首件尺寸偏差可复用扫码返工 CAPA。',
      matchDimensions: [],
      dispositionDraft: ['冻结下道交接', '复验首件尺寸'],
      effectMetrics: [{ label: '分析节省', value: '45 分钟' }],
      evidenceTraceIds: ['TRACE-SAMPLE-SUCCESS'],
    }
    const closure = {
      id: 'reuse-closure-success',
      draftId: draft.id,
      draftTraceId: draft.traceId,
      targetWorkOrderId: draft.targetWorkOrderId,
      targetOperationCode: draft.targetOperationCode,
      formalCapaTitle: 'WO-DEMO-1012 OP-10 首件尺寸复用 CAPA',
      owner: '质量工程师 周工',
      dueAt: '今日 16:00',
      verification: '复验首件尺寸合格',
      auditId: 'AUD-REUSE-CLOSURE-SUCCESS',
      traceId: 'TRACE-REUSE-CLOSURE-SUCCESS',
      effectTraceId: 'TRACE-REUSE-EFFECT-SUCCESS',
      approvedAt: '2026-06-02T09:00:00',
      status: 'approved' as const,
      statusLabel: '待验证',
      effectScoreBefore: 88,
      effectScoreAfter: 92,
      effectReview: '同类缺陷复用 CAPA 待复验。',
      feedbackActions: ['复验首件尺寸'],
      feedbackMetrics: [{ label: '返工节省', value: '45 分钟' }],
    }
    createBarcodeQualityReuseClosure.mockReturnValueOnce(closure)
    writeQualityKnowledgeReuseClosure.mockReturnValueOnce(closure)
    const wrapper = mount(QualityCapaTaskPanel, {
      props: { qualityKnowledgeReuseDraft: draft },
    })
    await flushPromises()

    await wrapper.get('.formal-capa-flow button').trigger('click')
    await flushPromises()

    expect(createBarcodeQualityReuseClosure).toHaveBeenCalledWith(draft, expect.any(String))
    expect(writeQualityKnowledgeReuseClosure).toHaveBeenCalledWith(closure)
    expect(wrapper.get('.formal-capa-flow strong').text()).toBe('WO-DEMO-1012 OP-10 首件尺寸复用 CAPA')
    expect(wrapper.get('.formal-capa-flow button').text()).toBe('验证复用效果并回写')
    expect(wrapper.get('.formal-capa-meta').text()).toContain('AUD-REUSE-CLOSURE-SUCCESS')
    expect(wrapper.get('.closure-sync-message').text()).toContain('已转正式 CAPA')
    expect(wrapper.get('.capa-trace li').text()).toContain('AUD-REUSE-CLOSURE-SUCCESS 复核通过')
  })

  it('keeps approved reuse closure pending and alerts when effect verification sync fails', async () => {
    const approvedClosure = {
      id: 'reuse-closure-test',
      draftId: 'reuse-draft-test',
      draftTraceId: 'TRACE-REUSE-DRAFT-TEST',
      targetWorkOrderId: 'WO-DEMO-1012',
      targetOperationCode: 'OP-10',
      formalCapaTitle: 'WO-DEMO-1012 OP-10 首件尺寸复用 CAPA',
      owner: '质量工程师 周工',
      dueAt: '今日 16:00',
      verification: '复验首件尺寸合格',
      auditId: 'AUD-REUSE-CLOSURE-TEST',
      traceId: 'TRACE-REUSE-CLOSURE-TEST',
      effectTraceId: 'TRACE-REUSE-EFFECT-TEST',
      approvedAt: '2026-06-02T09:00:00',
      status: 'approved' as const,
      statusLabel: '待验证',
      effectScoreBefore: 88,
      effectScoreAfter: 92,
      effectReview: '同类缺陷复用 CAPA 待复验。',
      feedbackActions: ['复验首件尺寸'],
      feedbackMetrics: [{ label: '返工节省', value: '45 分钟' }],
    }
    readQualityKnowledgeReuseClosuresBackendFirst.mockResolvedValueOnce([approvedClosure])
    verifyQualityKnowledgeReuseClosure.mockImplementationOnce(() => {
      throw new Error('reuse effect verification storage unavailable')
    })
    const wrapper = mount(QualityCapaTaskPanel, {
      props: {
        qualityKnowledgeReuseDraft: {
          id: 'reuse-draft-test',
          sourceSampleId: 'sample-test',
          sourceTraceId: 'TRACE-SAMPLE-TEST',
          targetWorkOrderId: 'WO-DEMO-1012',
          targetOperationCode: 'OP-10',
          targetProcessName: 'CNC 精加工',
          targetEquipmentCode: 'CNC-002',
          targetMaterialBatch: 'AL-202605-B',
          targetDefectPattern: '首件尺寸偏差',
          matchScore: 92,
          effectScore: 88,
          auditId: 'AUD-REUSE-DRAFT-TEST',
          traceId: 'TRACE-REUSE-DRAFT-TEST',
          createdAt: '2026-06-02T08:00:00',
          summary: '同类首件尺寸偏差可复用扫码返工 CAPA。',
          matchDimensions: [],
          dispositionDraft: ['冻结下道交接', '复验首件尺寸'],
          effectMetrics: [{ label: '分析节省', value: '45 分钟' }],
          evidenceTraceIds: ['TRACE-SAMPLE-TEST'],
        },
      },
    })
    await flushPromises()

    await wrapper.get('.formal-capa-flow button').trigger('click')
    await flushPromises()

    expect(verifyQualityKnowledgeReuseClosure).toHaveBeenCalledWith(approvedClosure, expect.any(String))
    expect(wrapper.get('.formal-capa-flow').classes()).not.toContain('verified')
    expect(wrapper.get('.formal-capa-flow button').text()).toBe('验证复用效果并回写')

    const alert = wrapper.get('[role="alert"]')
    expect(alert.attributes('aria-live')).toBe('assertive')
    expect(alert.text()).toContain('质量知识复用效果验证失败')
    expect(alert.text()).toContain('reuse effect verification storage unavailable')
    expect(wrapper.find('.closure-sync-message').exists()).toBe(false)
  })

  it('verifies reuse effect and renders the before-after quality score', async () => {
    const approvedClosure = {
      id: 'reuse-closure-verify',
      draftId: 'reuse-draft-verify',
      draftTraceId: 'TRACE-REUSE-DRAFT-VERIFY',
      targetWorkOrderId: 'WO-DEMO-1012',
      targetOperationCode: 'OP-10',
      formalCapaTitle: 'WO-DEMO-1012 OP-10 首件尺寸复用 CAPA',
      owner: '质量工程师 周工',
      dueAt: '今日 16:00',
      verification: '复验首件尺寸合格',
      auditId: 'AUD-REUSE-CLOSURE-VERIFY',
      traceId: 'TRACE-REUSE-CLOSURE-VERIFY',
      effectTraceId: 'TRACE-REUSE-EFFECT-VERIFY',
      approvedAt: '2026-06-02T09:00:00',
      status: 'approved' as const,
      statusLabel: '待验证',
      effectScoreBefore: 88,
      effectScoreAfter: 92,
      effectReview: '同类缺陷复用 CAPA 待复验。',
      feedbackActions: ['复验首件尺寸'],
      feedbackMetrics: [{ label: '返工节省', value: '45 分钟' }],
    }
    const verifiedClosure = {
      ...approvedClosure,
      status: 'verified' as const,
      statusLabel: '已验证',
      verifiedAt: '2026-06-02T10:00:00',
      effectReview: '复验首件尺寸合格，复用 CAPA 可进入知识反馈。',
    }
    readQualityKnowledgeReuseClosuresBackendFirst.mockResolvedValueOnce([approvedClosure])
    verifyQualityKnowledgeReuseClosure.mockReturnValueOnce(verifiedClosure)
    const wrapper = mount(QualityCapaTaskPanel, {
      props: {
        qualityKnowledgeReuseDraft: {
          id: 'reuse-draft-verify',
          sourceSampleId: 'sample-verify',
          sourceTraceId: 'TRACE-SAMPLE-VERIFY',
          targetWorkOrderId: 'WO-DEMO-1012',
          targetOperationCode: 'OP-10',
          targetProcessName: 'CNC 精加工',
          targetEquipmentCode: 'CNC-002',
          targetMaterialBatch: 'AL-202605-B',
          targetDefectPattern: '首件尺寸偏差',
          matchScore: 92,
          effectScore: 88,
          auditId: 'AUD-REUSE-DRAFT-VERIFY',
          traceId: 'TRACE-REUSE-DRAFT-VERIFY',
          createdAt: '2026-06-02T08:00:00',
          summary: '同类首件尺寸偏差可复用扫码返工 CAPA。',
          matchDimensions: [],
          dispositionDraft: ['冻结下道交接', '复验首件尺寸'],
          effectMetrics: [{ label: '分析节省', value: '45 分钟' }],
          evidenceTraceIds: ['TRACE-SAMPLE-VERIFY'],
        },
      },
    })
    await flushPromises()

    await wrapper.get('.formal-capa-flow button').trigger('click')
    await flushPromises()

    expect(verifyQualityKnowledgeReuseClosure).toHaveBeenCalledWith(approvedClosure, expect.any(String))
    expect(wrapper.get('.formal-capa-flow').classes()).toContain('verified')
    expect(wrapper.get('.formal-capa-result').text()).toContain('复用评分 88 -> 92 分')
    expect(wrapper.get('.formal-capa-result code').text()).toBe('TRACE-REUSE-EFFECT-VERIFY')
    expect(wrapper.get('.closure-sync-message').text()).toContain('已验证并回写复用效果')
    expect(wrapper.get('.capa-trace li').text()).toContain('TRACE-REUSE-EFFECT-VERIFY 已回写')
  })

  it('keeps low score review queue uncreated and alerts when queue sync fails', async () => {
    writeQualityKnowledgeReviewQueueRecord.mockImplementationOnce(() => {
      throw new Error('review queue storage unavailable')
    })
    const wrapper = mount(QualityCapaTaskPanel, {
      props: {
        qualityKnowledgeReuseDraft: {
          id: 'reuse-draft-test',
          sourceSampleId: 'sample-test',
          sourceTraceId: 'TRACE-SAMPLE-TEST',
          targetWorkOrderId: 'WO-DEMO-1012',
          targetOperationCode: 'OP-10',
          targetProcessName: 'CNC 精加工',
          targetEquipmentCode: 'CNC-002',
          targetMaterialBatch: 'AL-202605-B',
          targetDefectPattern: '首件尺寸偏差',
          matchScore: 92,
          effectScore: 88,
          auditId: 'AUD-REUSE-DRAFT-TEST',
          traceId: 'TRACE-REUSE-DRAFT-TEST',
          createdAt: '2026-06-02T08:00:00',
          summary: '同类首件尺寸偏差可复用扫码返工 CAPA。',
          matchDimensions: [],
          dispositionDraft: ['冻结下道交接', '复验首件尺寸'],
          effectMetrics: [{ label: '分析节省', value: '45 分钟' }],
          evidenceTraceIds: ['TRACE-SAMPLE-TEST'],
        },
      },
    })
    await flushPromises()

    await wrapper.get('.ranking-heading button').trigger('click')
    await flushPromises()

    expect(writeQualityKnowledgeReviewQueueRecord).toHaveBeenCalledOnce()
    expect(wrapper.find('.low-score-review-card').exists()).toBe(false)
    expect(wrapper.get('.ranking-heading button').text()).toBe('生成低分样本复核队列')

    const alert = wrapper.get('[role="alert"]')
    expect(alert.attributes('aria-live')).toBe('assertive')
    expect(alert.text()).toContain('低分样本复核队列生成失败')
    expect(alert.text()).toContain('review queue storage unavailable')
    expect(wrapper.find('.closure-sync-message').exists()).toBe(false)
  })

  it('creates a low score review queue and includes it in the open verification count', async () => {
    const queue = {
      id: 'review-queue-created',
      sourceRankingId: 'reuse-rank-low-score-test',
      targetWorkOrderId: 'WO-DEMO-1012',
      operationCode: 'OP-10',
      title: 'WO-DEMO-1012 OP-10 低分样本复核',
      reason: '复用效果低于阈值，需要人工复核后再进入训练候选。',
      owner: '质量主管 刘工',
      dueAt: '今日 17:00',
      auditId: 'AUD-REVIEW-QUEUE-CREATED',
      traceId: 'TRACE-REVIEW-QUEUE-CREATED',
      createdAt: '2026-06-02T10:00:00',
      status: 'open' as const,
      statusLabel: '待复核',
      effectScore: 61,
      reviewActions: ['复核低分样本', '禁用直接复用'],
    }
    writeQualityKnowledgeReviewQueueRecord.mockReturnValueOnce(queue)
    const wrapper = mount(QualityCapaTaskPanel, {
      props: {
        qualityKnowledgeReuseDraft: {
          id: 'reuse-draft-queue',
          sourceSampleId: 'sample-queue',
          sourceTraceId: 'TRACE-SAMPLE-QUEUE',
          targetWorkOrderId: 'WO-DEMO-1012',
          targetOperationCode: 'OP-10',
          targetProcessName: 'CNC 精加工',
          targetEquipmentCode: 'CNC-002',
          targetMaterialBatch: 'AL-202605-B',
          targetDefectPattern: '首件尺寸偏差',
          matchScore: 92,
          effectScore: 88,
          auditId: 'AUD-REUSE-DRAFT-QUEUE',
          traceId: 'TRACE-REUSE-DRAFT-QUEUE',
          createdAt: '2026-06-02T08:00:00',
          summary: '同类首件尺寸偏差可复用扫码返工 CAPA。',
          matchDimensions: [],
          dispositionDraft: ['冻结下道交接', '复验首件尺寸'],
          effectMetrics: [{ label: '分析节省', value: '45 分钟' }],
          evidenceTraceIds: ['TRACE-SAMPLE-QUEUE'],
        },
      },
    })
    await flushPromises()

    await wrapper.get('.ranking-heading button').trigger('click')
    await flushPromises()

    expect(writeQualityKnowledgeReviewQueueRecord).toHaveBeenCalledOnce()
    expect(wrapper.get('.low-score-review-card strong').text()).toBe('WO-DEMO-1012 OP-10 低分样本复核')
    expect(wrapper.get('.low-score-review-card code').text()).toBe('TRACE-REVIEW-QUEUE-CREATED')
    expect(wrapper.get('.status-badge').text()).toBe('4 个待验证')
    expect(wrapper.get('.closure-sync-message').text()).toContain('已进入低分样本复核队列')
  })

  it('keeps low score review queue open and alerts when queue closure sync fails', async () => {
    const openQueue = {
      id: 'review-queue-test',
      sourceRankingId: 'reuse-rank-low-score-test',
      targetWorkOrderId: 'WO-DEMO-1012',
      operationCode: 'OP-10',
      title: 'WO-DEMO-1012 OP-10 低分样本复核',
      reason: '复用效果低于阈值，需要人工复核后再进入训练候选。',
      owner: '质量主管 刘工',
      dueAt: '今日 17:00',
      auditId: 'AUD-REVIEW-QUEUE-TEST',
      traceId: 'TRACE-REVIEW-QUEUE-TEST',
      createdAt: '2026-06-02T10:00:00',
      status: 'open' as const,
      statusLabel: '待复核',
      effectScore: 61,
      reviewActions: ['复核低分样本', '禁用直接复用'],
    }
    readQualityKnowledgeReviewQueueRecordsBackendFirst.mockResolvedValueOnce([openQueue])
    closeLowScoreQualityKnowledgeReviewQueueRecord.mockImplementationOnce(() => {
      throw new Error('review queue closure storage unavailable')
    })
    const wrapper = mount(QualityCapaTaskPanel, {
      props: {
        qualityKnowledgeReuseDraft: {
          id: 'reuse-draft-test',
          sourceSampleId: 'sample-test',
          sourceTraceId: 'TRACE-SAMPLE-TEST',
          targetWorkOrderId: 'WO-DEMO-1012',
          targetOperationCode: 'OP-10',
          targetProcessName: 'CNC 精加工',
          targetEquipmentCode: 'CNC-002',
          targetMaterialBatch: 'AL-202605-B',
          targetDefectPattern: '首件尺寸偏差',
          matchScore: 92,
          effectScore: 88,
          auditId: 'AUD-REUSE-DRAFT-TEST',
          traceId: 'TRACE-REUSE-DRAFT-TEST',
          createdAt: '2026-06-02T08:00:00',
          summary: '同类首件尺寸偏差可复用扫码返工 CAPA。',
          matchDimensions: [],
          dispositionDraft: ['冻结下道交接', '复验首件尺寸'],
          effectMetrics: [{ label: '分析节省', value: '45 分钟' }],
          evidenceTraceIds: ['TRACE-SAMPLE-TEST'],
        },
      },
    })
    await flushPromises()

    await wrapper.get('.low-score-review-card button').trigger('click')
    await flushPromises()

    expect(closeLowScoreQualityKnowledgeReviewQueueRecord).toHaveBeenCalledWith(openQueue, expect.any(String))
    expect(wrapper.get('.low-score-review-card button').text()).toBe('完成复核并禁用直接复用')
    expect(wrapper.get('.low-score-review-card').text()).not.toContain('已完成复核')

    const alert = wrapper.get('[role="alert"]')
    expect(alert.attributes('aria-live')).toBe('assertive')
    expect(alert.text()).toContain('低分样本复核队列关闭失败')
    expect(alert.text()).toContain('review queue closure storage unavailable')
    expect(wrapper.find('.closure-sync-message').exists()).toBe(false)
  })

  it('closes a low score review queue and records the retraining decision', async () => {
    const openQueue = {
      id: 'review-queue-close',
      sourceRankingId: 'reuse-rank-low-score-test',
      targetWorkOrderId: 'WO-DEMO-1012',
      operationCode: 'OP-10',
      title: 'WO-DEMO-1012 OP-10 低分样本复核',
      reason: '复用效果低于阈值，需要人工复核后再进入训练候选。',
      owner: '质量主管 刘工',
      dueAt: '今日 17:00',
      auditId: 'AUD-REVIEW-QUEUE-CLOSE',
      traceId: 'TRACE-REVIEW-QUEUE-CLOSE',
      createdAt: '2026-06-02T10:00:00',
      status: 'open' as const,
      statusLabel: '待复核',
      effectScore: 61,
      reviewActions: ['复核低分样本', '禁用直接复用'],
    }
    const closedQueue = {
      ...openQueue,
      status: 'closed' as const,
      statusLabel: '已关闭',
      decisionLabel: '禁用直接复用',
      decisionSummary: '低分样本已禁用直接复用，并进入知识再训练候选。',
      decisionAuditId: 'AUD-REVIEW-QUEUE-DECISION',
      decisionTraceId: 'TRACE-REVIEW-QUEUE-DECISION',
      retrainingTraceId: 'TRACE-REVIEW-QUEUE-RETRAINING',
      retrainingPlan: ['补充独立扭矩 CAPA 样本', '重新评估 Top-3 召回'],
    }
    readQualityKnowledgeReviewQueueRecordsBackendFirst.mockResolvedValueOnce([openQueue])
    closeLowScoreQualityKnowledgeReviewQueueRecord.mockReturnValueOnce(closedQueue)
    const wrapper = mount(QualityCapaTaskPanel, {
      props: {
        qualityKnowledgeReuseDraft: {
          id: 'reuse-draft-close',
          sourceSampleId: 'sample-close',
          sourceTraceId: 'TRACE-SAMPLE-CLOSE',
          targetWorkOrderId: 'WO-DEMO-1012',
          targetOperationCode: 'OP-10',
          targetProcessName: 'CNC 精加工',
          targetEquipmentCode: 'CNC-002',
          targetMaterialBatch: 'AL-202605-B',
          targetDefectPattern: '首件尺寸偏差',
          matchScore: 92,
          effectScore: 88,
          auditId: 'AUD-REUSE-DRAFT-CLOSE',
          traceId: 'TRACE-REUSE-DRAFT-CLOSE',
          createdAt: '2026-06-02T08:00:00',
          summary: '同类首件尺寸偏差可复用扫码返工 CAPA。',
          matchDimensions: [],
          dispositionDraft: ['冻结下道交接', '复验首件尺寸'],
          effectMetrics: [{ label: '分析节省', value: '45 分钟' }],
          evidenceTraceIds: ['TRACE-SAMPLE-CLOSE'],
        },
      },
    })
    await flushPromises()

    await wrapper.get('.low-score-review-card button').trigger('click')
    await flushPromises()

    expect(closeLowScoreQualityKnowledgeReviewQueueRecord).toHaveBeenCalledWith(openQueue, expect.any(String))
    expect(wrapper.get('.low-score-review-card').text()).toContain('低分样本已禁用直接复用')
    expect(wrapper.find('.low-score-review-card button').exists()).toBe(false)
    expect(wrapper.get('.low-score-review-card').text()).toContain('TRACE-REVIEW-QUEUE-RETRAINING')
    expect(wrapper.get('.closure-sync-message').text()).toContain('已完成复核')
    expect(wrapper.get('.capa-trace li').text()).toContain('AUD-REVIEW-QUEUE-DECISION 已回写低分复核结论')
  })

  it('keeps published recommendation available and alerts when adoption sync fails', async () => {
    const publishedRecommendation = {
      id: 'reuse-rank-published-torque-retraining',
      title: 'OP-20 扭矩推荐',
      targetWorkOrderId: 'WO-DEMO-1018',
      operationCode: 'OP-20',
      matchScore: 94,
      effectScore: 89,
      statusLabel: '已发布到 AI 推荐',
      recommendation: '采用 R3 训练集推荐的扭矩复验和隔离窗口。',
      evidenceTraceId: 'TRACE-QK-PUBLISHED-RECOMMENDATION',
      rankReason: '验证效果和匹配质量最高。',
      reviewRequired: false,
      riskTags: ['正式发布', '扭矩复验'],
      trainingSetVersion: 'QK-TRAIN-20260521-R3',
      releaseScopeLabel: 'OP-20 装配扭矩推荐链路',
      auditId: 'AUD-QK-PUBLISHED-RECOMMENDATION',
    }
    buildQualityKnowledgeReuseRanking.mockReturnValue([publishedRecommendation])
    acceptQualityKnowledgeRecommendation.mockImplementationOnce(() => {
      throw new Error('published recommendation adoption storage unavailable')
    })
    const wrapper = mount(QualityCapaTaskPanel)
    await flushPromises()

    await wrapper.get('.ranking-adopt-action').trigger('click')
    await flushPromises()

    expect(acceptQualityKnowledgeRecommendation).toHaveBeenCalledWith(publishedRecommendation, expect.any(String))
    expect(wrapper.get('.ranking-adopt-action').text()).toBe('采纳发布推荐并回写效果')
    expect(wrapper.find('.ranking-feedback').exists()).toBe(false)

    const alert = wrapper.get('[role="alert"]')
    expect(alert.attributes('aria-live')).toBe('assertive')
    expect(alert.text()).toContain('质量知识发布推荐采纳失败')
    expect(alert.text()).toContain('published recommendation adoption storage unavailable')
    expect(wrapper.find('.closure-sync-message').exists()).toBe(false)
  })

  it('renders gray release governance and records successful published recommendation adoption', async () => {
    const publishedRecommendation = {
      id: 'reuse-rank-published-torque-retraining',
      title: 'OP-20 扭矩推荐',
      targetWorkOrderId: 'WO-DEMO-1018',
      operationCode: 'OP-20',
      matchScore: 94,
      effectScore: 89,
      statusLabel: '已发布到 AI 推荐',
      recommendation: '采用 R3 训练集推荐的扭矩复验和隔离窗口。',
      evidenceTraceId: 'TRACE-QK-PUBLISHED-RECOMMENDATION',
      rankReason: '验证效果和匹配质量最高。',
      reviewRequired: false,
      riskTags: ['正式发布', '扭矩复验'],
      trainingSetVersion: 'QK-TRAIN-20260521-R3',
      releaseScopeLabel: 'OP-20 装配扭矩推荐链路',
      auditId: 'AUD-QK-PUBLISHED-RECOMMENDATION',
    }
    const grayDecision = {
      id: 'gray-decision-r3',
      trainingSetVersion: 'QK-TRAIN-20260521-R3',
      targetWorkOrderId: 'WO-DEMO-1018',
      operationCode: 'OP-20',
      decision: 'expanded' as const,
      decisionLabel: '扩大灰度',
      reason: '连续复验通过，推荐可扩大到 OP-20 扭矩复核链路。',
      auditId: 'AUD-QK-GRAY-R3-EXPAND',
      traceId: 'TRACE-QK-GRAY-R3-EXPAND',
      decidedAt: '2026-06-02T11:00:00',
      reviewer: '质量主管 刘工',
    }
    const feedback = {
      id: 'feedback-published-recommendation',
      recommendationId: publishedRecommendation.id,
      targetWorkOrderId: 'WO-DEMO-1018',
      operationCode: 'OP-20',
      trainingSetVersion: 'QK-TRAIN-20260521-R3',
      effectTrendLabel: '效果提升',
      nextTrainingSetVersion: 'QK-TRAIN-20260522-R4',
      nextTrainingTraceId: 'TRACE-QK-NEXT-TRAINING-R4',
      auditId: 'AUD-QK-RECOMMENDATION-FEEDBACK',
      traceId: 'TRACE-QK-RECOMMENDATION-FEEDBACK',
      acceptedAt: '2026-06-02T12:00:00',
      acceptedBy: '质量工程师 周工',
      summary: 'OP-20 扭矩推荐已采纳，复验窗口缩短。',
    }
    buildQualityKnowledgeReuseRanking.mockReturnValue([publishedRecommendation])
    readQualityKnowledgeGrayReleaseDecisionRecordsBackendFirst.mockResolvedValueOnce([grayDecision])
    acceptQualityKnowledgeRecommendation.mockReturnValueOnce(feedback)
    const wrapper = mount(QualityCapaTaskPanel)
    await flushPromises()

    expect(wrapper.get('.gray-release-decision-banner').classes()).toContain('expanded')
    expect(wrapper.get('.gray-release-decision-banner').text()).toContain('QK-TRAIN-20260521-R3 / 扩大灰度')
    expect(wrapper.get('.gray-release-decision-banner').text()).toContain('TRACE-QK-GRAY-R3-EXPAND')

    await wrapper.get('.ranking-adopt-action').trigger('click')
    await flushPromises()

    expect(acceptQualityKnowledgeRecommendation).toHaveBeenCalledWith(publishedRecommendation, expect.any(String))
    expect(wrapper.get('.closure-sync-message').text()).toContain('WO-DEMO-1018 OP-20 已采纳 QK-TRAIN-20260521-R3 推荐')
    expect(wrapper.get('.capa-trace li').text()).toContain('AUD-QK-RECOMMENDATION-FEEDBACK 已回写推荐采纳')
  })

  it('keeps assistant quality action open and alerts when closure sync fails', async () => {
    const recoveryPackage = {
      id: 'recovery-package-test',
      title: 'WO-RUSH-9001 交期恢复执行包',
      auditCode: 'AUD-RECOVERY-TEST',
      traceId: 'TRACE-RECOVERY-TEST',
      statusLabel: '待跨模块复核',
      workOrders: ['WO-RUSH-9001'],
      otdImpact: '+12%',
      owner: '质量工程师 周工',
      dueAt: '今日 16:00',
      dispatchSteps: [],
      qualityActionStatus: 'pending' as const,
      qualityActionSummary: '质量闭环需确认替代料首件检验。',
      qualityActionTraceId: 'TRACE-QA-RECOVERY-FIRST-ARTICLE',
      qualityActionAuditCode: 'AUD-QA-RECOVERY-FIRST-ARTICLE',
      firstArticleRecord: 'FAI-WO-RUSH-9001-OP-10',
    }
    readAssistantRecoveryPackagesBackendFirst.mockResolvedValueOnce([recoveryPackage])
    closeAssistantRecoveryQualityAction.mockImplementationOnce(() => {
      throw new Error('assistant quality action closure unavailable')
    })
    const wrapper = mount(QualityCapaTaskPanel)
    await flushPromises()

    await wrapper.get('.assistant-quality-closure-card button').trigger('click')
    await flushPromises()

    expect(closeAssistantRecoveryQualityAction).toHaveBeenCalledWith('recovery-package-test')
    expect(wrapper.get('.assistant-quality-closure-card button').text()).toBe('确认首件复核闭环')
    expect(wrapper.find('.assistant-quality-result').exists()).toBe(false)

    const alert = wrapper.get('[role="alert"]')
    expect(alert.attributes('aria-live')).toBe('assertive')
    expect(alert.text()).toContain('助手执行包质量责任闭环失败')
    expect(alert.text()).toContain('assistant quality action closure unavailable')
    expect(wrapper.find('.closure-sync-message').exists()).toBe(false)
  })

  it('closes assistant quality action and renders first article evidence', async () => {
    const recoveryPackage = {
      id: 'recovery-package-success',
      title: 'WO-RUSH-9001 交期恢复执行包',
      auditCode: 'AUD-RECOVERY-SUCCESS',
      traceId: 'TRACE-RECOVERY-SUCCESS',
      statusLabel: '待跨模块复核',
      workOrders: ['WO-RUSH-9001'],
      otdImpact: '+12%',
      owner: '质量工程师 周工',
      dueAt: '今日 16:00',
      dispatchSteps: [],
      qualityActionStatus: 'pending' as const,
      qualityActionSummary: '质量闭环需确认替代料首件检验。',
      qualityActionTraceId: 'TRACE-QA-RECOVERY-FIRST-ARTICLE',
      qualityActionAuditCode: 'AUD-QA-RECOVERY-FIRST-ARTICLE',
      firstArticleRecord: 'FAI-WO-RUSH-9001-OP-10',
    }
    const closedPackage = {
      ...recoveryPackage,
      qualityActionStatus: 'closed' as const,
      qualityActionSummary: '替代料首件检验已闭环，排产和风险队列可读取质量责任动作结果。',
    }
    readAssistantRecoveryPackagesBackendFirst
      .mockResolvedValueOnce([recoveryPackage])
      .mockResolvedValueOnce([closedPackage])
    closeAssistantRecoveryQualityAction.mockReturnValueOnce(closedPackage)
    const wrapper = mount(QualityCapaTaskPanel)
    await flushPromises()

    await wrapper.get('.assistant-quality-closure-card button').trigger('click')
    await flushPromises()

    expect(closeAssistantRecoveryQualityAction).toHaveBeenCalledWith('recovery-package-success')
    expect(readAssistantRecoveryPackagesBackendFirst).toHaveBeenCalledTimes(2)
    expect(wrapper.get('.assistant-quality-closure-card').classes()).toContain('closed')
    expect(wrapper.get('.assistant-quality-result').text()).toContain('AUD-QA-RECOVERY-FIRST-ARTICLE')
    expect(wrapper.get('.assistant-quality-result').text()).toContain('FAI-WO-RUSH-9001-OP-10')
    expect(wrapper.get('.closure-sync-message').text()).toContain('替代料首件检验已闭环')
    expect(wrapper.get('.capa-trace li').text()).toContain('AUD-QA-RECOVERY-FIRST-ARTICLE 已回写助手执行包质量责任动作')
  })
})
