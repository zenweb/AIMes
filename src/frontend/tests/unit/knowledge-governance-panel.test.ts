import { mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import KnowledgeGovernancePanel from '../../src/components/knowledge/KnowledgeGovernancePanel.vue'
import type {
  QualityKnowledgeGrayReleaseDecisionRecord,
  QualityKnowledgeAssetGovernanceRecord,
  QualityKnowledgeRetrainingVersionRecord,
} from '../../src/utils/quality-knowledge-sample-sync'

const knowledgeGovernancePanelMocks = vi.hoisted(() => ({
  readAssistantCitationTraces: vi.fn(() => []),
  isQualityKnowledgeGrayRepublishEvidence: vi.fn(() => false),
}))

vi.mock('../../src/utils/knowledge-citations', () => ({
  readAssistantCitationTraces: knowledgeGovernancePanelMocks.readAssistantCitationTraces,
}))

vi.mock('../../src/utils/quality-knowledge-sample-sync', async importOriginal => {
  const actual = await importOriginal<typeof import('../../src/utils/quality-knowledge-sample-sync')>()
  return {
    ...actual,
    isQualityKnowledgeGrayRepublishEvidence: knowledgeGovernancePanelMocks.isQualityKnowledgeGrayRepublishEvidence,
  }
})

const staleDocument = {
  id: 'kg-cnc-maint',
  category: '设备维护',
  title: 'CNC-01 主轴维护手册',
  summary: '主轴点检、润滑和异常振动处理流程。',
  version: 'v1.4',
  indexStatus: 'pending',
  freshnessStatus: '即将过期',
  validUntil: '2026-06-10',
  references: ['SOP-MAINT-001'],
} as const

function mountKnowledgeGovernancePanel() {
  return mount(KnowledgeGovernancePanel, {
    props: {
      documents: [staleDocument],
    },
  })
}

const nextTrainingAsset: QualityKnowledgeAssetGovernanceRecord = {
  id: 'quality-asset-next-training-feedback-r3-001',
  title: 'R3 下一轮训练集：现场复核反馈',
  assetStage: '下一轮训练集',
  statusLabel: '待合并',
  statusClass: 'logged',
  summary: '现场复核反馈需要先合并为下一轮训练集候选。',
  auditId: 'AUD-KG-R3-001',
  traceId: 'TRACE-KG-R3-001',
  scoreLabel: '采纳率 82%',
  owner: '质量主管',
  nextAction: '合并现场反馈',
  sourceDocumentTitle: '质量复核反馈',
  references: ['QK-R3-FEEDBACK'],
}

function makeRetrainingAsset(
  id = 'quality-asset-retraining-review-r2-001',
  title = 'QK-TRAIN-20260521-R2 再训练候选'
): QualityKnowledgeAssetGovernanceRecord {
  return {
    id,
    title,
    assetStage: '再训练候选',
    statusLabel: '待审批',
    statusClass: 'guarded',
    summary: '低分复核后需要进入再训练审批。',
    auditId: `AUD-${id}`,
    traceId: `TRACE-${id}`,
    scoreLabel: '效果分 61',
    owner: '质量主管',
    nextAction: '批准进入训练集',
    sourceDocumentTitle: '低分复核队列',
    references: ['QK-RETRAINING'],
  }
}

function makeExperimentAsset(
  id: string,
  title: string,
  experimentCandidateType: QualityKnowledgeAssetGovernanceRecord['experimentCandidateType']
): QualityKnowledgeAssetGovernanceRecord {
  return {
    id,
    title,
    assetStage: '实验候选',
    statusLabel: '待执行',
    statusClass: 'guarded',
    summary: `${title} 需要质量主管复核后继续推进。`,
    auditId: `AUD-${id}`,
    traceId: `TRACE-${id}`,
    scoreLabel: '负样本覆盖 80%',
    owner: '质量主管',
    nextAction: '补齐实验候选证据',
    sourceDocumentTitle: '质量推荐实验候选',
    references: ['QK-EXPERIMENT'],
    experimentCandidateType,
  }
}

function makeExperimentVersion(
  trainingSetVersion: string,
  sourceReviewQueueId: string,
  status: QualityKnowledgeRetrainingVersionRecord['status']
): QualityKnowledgeRetrainingVersionRecord {
  return {
    id: `quality-retraining-version-${trainingSetVersion.toLowerCase()}`,
    sourceReviewQueueId,
    targetWorkOrderId: 'WO-DEMO-1018',
    operationCode: 'OP-20',
    candidateTraceId: `TRACE-${trainingSetVersion}-CANDIDATE`,
    trainingSetVersion,
    trainingSetName: `${trainingSetVersion} 实验候选`,
    status,
    statusLabel: status === 'validation_passed' ? '影子验证已通过' : '补样已合并',
    approvedBy: '质量主管',
    approvedAt: '2026-06-01T00:00:00.000Z',
    approvalAuditId: `AUD-${trainingSetVersion}-APPROVAL`,
    approvalTraceId: `TRACE-${trainingSetVersion}-APPROVAL`,
    positiveSampleCount: 38,
    negativeSampleCount: 8,
    featurePolicy: '影子验证前不得进入主动推荐。',
    changeSummary: ['补齐跨线负样本。'],
    validationGates: ['误召回 0 次。'],
    validationStatus: status === 'validation_passed' ? 'passed' : undefined,
    validationAuditId: status === 'validation_passed' ? `AUD-${trainingSetVersion}-VALIDATION` : undefined,
    validationTraceId: status === 'validation_passed' ? `TRACE-${trainingSetVersion}-VALIDATION` : undefined,
  }
}

function makeLifecycleVersion(
  id: string,
  sourceReviewQueueId: string,
  status: QualityKnowledgeRetrainingVersionRecord['status'],
  trainingSetVersion = 'QK-TRAIN-20260521-R2'
): QualityKnowledgeRetrainingVersionRecord {
  return {
    id,
    sourceReviewQueueId,
    targetWorkOrderId: 'WO-DEMO-1018',
    operationCode: 'OP-20',
    candidateTraceId: `TRACE-${trainingSetVersion}-CANDIDATE`,
    trainingSetVersion,
    trainingSetName: `${trainingSetVersion} 生命周期测试`,
    status,
    statusLabel: status,
    approvedBy: '质量主管',
    approvedAt: '2026-06-01T00:00:00.000Z',
    approvalAuditId: `AUD-${trainingSetVersion}-APPROVAL`,
    approvalTraceId: `TRACE-${trainingSetVersion}-APPROVAL`,
    positiveSampleCount: 20,
    negativeSampleCount: 8,
    featurePolicy: '校验通过前不得发布。',
    changeSummary: ['生命周期测试'],
    validationGates: ['字段完整'],
  }
}

describe('KnowledgeGovernancePanel', () => {
  beforeEach(() => {
    knowledgeGovernancePanelMocks.readAssistantCitationTraces.mockReturnValue([])
    knowledgeGovernancePanelMocks.isQualityKnowledgeGrayRepublishEvidence.mockReturnValue(false)
  })

  it('labels stale document review actions with the document title', async () => {
    const wrapper = mountKnowledgeGovernancePanel()

    const riskBadge = wrapper.get('.risk-badge')
    expect(riskBadge.text()).toBe('1 个过期风险')
    expect(riskBadge.attributes('role')).toBe('status')
    expect(riskBadge.attributes('aria-live')).toBe('polite')
    expect(riskBadge.attributes('aria-label')).toBe('知识库过期风险数量')

    const button = wrapper.get('.governance-card .review-button')
    expect(button.attributes('aria-label')).toBe('复核并重建索引：CNC-01 主轴维护手册')

    await button.trigger('click')

    expect(wrapper.emitted('document-reviewed')?.[0]).toEqual([staleDocument])
  })

  it('labels next-training merge actions with the asset title and emits the feedback id', async () => {
    const wrapper = mount(KnowledgeGovernancePanel, {
      props: {
        documents: [],
        qualityAssets: [nextTrainingAsset],
      },
    })

    const button = wrapper.get('.quality-asset-panel .review-button')
    expect(button.attributes('aria-label')).toBe('合并现场反馈：R3 下一轮训练集：现场复核反馈')

    await button.trigger('click')

    expect(wrapper.emitted('quality-next-training-merged')?.[0]).toEqual(['feedback-r3-001'])
  })

  it('labels next-training lifecycle actions with the asset title and emits traceable version ids', async () => {
    const mergedAsset = {
      ...nextTrainingAsset,
      id: 'quality-asset-next-training-feedback-r3-merged',
      title: 'QK-TRAIN-20260521-R3 已合并训练集',
    }
    const approvedAsset = {
      ...nextTrainingAsset,
      id: 'quality-asset-next-training-feedback-r3-approved',
      title: 'QK-TRAIN-20260521-R3 已审批训练集',
    }
    const passedAsset = {
      ...nextTrainingAsset,
      id: 'quality-asset-next-training-feedback-r3-passed',
      title: 'QK-TRAIN-20260521-R3 已校验训练集',
    }
    const mergedVersion = makeLifecycleVersion(
      'quality-next-version-merged',
      'recommendation-feedback-feedback-r3-merged',
      'merged',
      'QK-TRAIN-20260521-R3'
    )
    const approvedVersion = makeLifecycleVersion(
      'quality-next-version-approved',
      'recommendation-feedback-feedback-r3-approved',
      'approved',
      'QK-TRAIN-20260521-R3'
    )
    const passedVersion = makeLifecycleVersion(
      'quality-next-version-passed',
      'recommendation-feedback-feedback-r3-passed',
      'validation_passed',
      'QK-TRAIN-20260521-R3'
    )
    const wrapper = mount(KnowledgeGovernancePanel, {
      props: {
        documents: [],
        qualityAssets: [mergedAsset, approvedAsset, passedAsset],
        qualityRetrainingVersions: [mergedVersion, approvedVersion, passedVersion],
      },
    })

    const approveButton = wrapper.get('button[aria-label="批准 R3 训练集：QK-TRAIN-20260521-R3 已合并训练集"]')
    const validateButton = wrapper.get('button[aria-label="运行灰度前校验：QK-TRAIN-20260521-R3 已审批训练集"]')
    const grayPublishButton = wrapper.get('button[aria-label="灰度发布 R3：QK-TRAIN-20260521-R3 已校验训练集"]')

    await approveButton.trigger('click')
    await validateButton.trigger('click')
    await grayPublishButton.trigger('click')

    expect(wrapper.emitted('quality-next-training-approved')?.[0]).toEqual([mergedVersion.id])
    expect(wrapper.emitted('quality-next-training-validated')?.[0]).toEqual([approvedVersion.id])
    expect(wrapper.emitted('quality-next-training-gray-published')?.[0]).toEqual([passedVersion.id])
  })

  it('labels experiment candidate actions and emits traceable candidate ids', async () => {
    const negativePatchAsset = makeExperimentAsset(
      'quality-asset-quality-experiment-candidate-qk-train-20260521-r10-negative-coverage',
      'QK-TRAIN-20260521-R10 补样实验候选',
      'negative_sample_patch'
    )
    const shadowValidationAsset = makeExperimentAsset(
      'quality-asset-quality-experiment-candidate-qk-train-20260521-r7-shadow-validation',
      'QK-TRAIN-20260521-R7 影子验证候选',
      'shadow_validation'
    )
    const shadowPublishAsset = makeExperimentAsset(
      'quality-asset-quality-experiment-candidate-qk-train-20260521-r9-shadow-validation',
      'QK-TRAIN-20260521-R9 影子验证候选',
      'shadow_validation'
    )
    const mergedR6 = makeExperimentVersion(
      'QK-TRAIN-20260521-R6',
      'experiment-candidate-quality-experiment-candidate-qk-train-20260521-r6-negative-coverage',
      'merged'
    )
    const mergedR8 = makeExperimentVersion(
      'QK-TRAIN-20260521-R8',
      'experiment-candidate-quality-experiment-candidate-qk-train-20260521-r8-negative-coverage',
      'merged'
    )
    const validatedR9 = makeExperimentVersion(
      'QK-TRAIN-20260521-R9',
      'experiment-candidate-quality-experiment-candidate-qk-train-20260521-r9-shadow-validation',
      'validation_passed'
    )
    const wrapper = mount(KnowledgeGovernancePanel, {
      props: {
        documents: [],
        qualityAssets: [negativePatchAsset, shadowValidationAsset, shadowPublishAsset],
        qualityRetrainingVersions: [mergedR6, mergedR8, validatedR9],
      },
    })

    const mergeButton = wrapper.get('button[aria-label="合并 R10 负样本：QK-TRAIN-20260521-R10 补样实验候选"]')
    const validateButton = wrapper.get('button[aria-label="运行 R7 影子验证：QK-TRAIN-20260521-R7 影子验证候选"]')
    const publishButton = wrapper.get('button[aria-label="发布 R9 影子灰度：QK-TRAIN-20260521-R9 影子验证候选"]')

    await mergeButton.trigger('click')
    await validateButton.trigger('click')
    await publishButton.trigger('click')

    expect(wrapper.emitted('quality-experiment-candidate-merged')?.[0]).toEqual([
      'quality-experiment-candidate-qk-train-20260521-r10-negative-coverage',
    ])
    expect(wrapper.emitted('quality-experiment-shadow-validated')?.[0]).toEqual([
      'quality-experiment-candidate-qk-train-20260521-r7-shadow-validation',
    ])
    expect(wrapper.emitted('quality-experiment-shadow-gray-published')?.[0]).toEqual([
      validatedR9.id,
    ])
  })

  it('labels retraining lifecycle actions and emits traceable version ids', async () => {
    const pendingAsset = makeRetrainingAsset()
    const approvedAsset = makeRetrainingAsset('quality-asset-retraining-review-r2-approved', 'QK-TRAIN-20260521-R2 已审批候选')
    const failedAsset = makeRetrainingAsset('quality-asset-retraining-review-r2-failed', 'QK-TRAIN-20260521-R2 校验失败候选')
    const passedAsset = makeRetrainingAsset('quality-asset-retraining-review-r2-passed', 'QK-TRAIN-20260521-R2 校验通过候选')
    const publishedAsset = makeRetrainingAsset('quality-asset-retraining-review-r2-published', 'QK-TRAIN-20260521-R2 已发布候选')
    const approvedVersion = makeLifecycleVersion('quality-version-approved', 'review-r2-approved', 'approved')
    const failedVersion = makeLifecycleVersion('quality-version-failed', 'review-r2-failed', 'validation_failed')
    const passedVersion = makeLifecycleVersion('quality-version-passed', 'review-r2-passed', 'validation_passed')
    const publishedVersion = makeLifecycleVersion('quality-version-published', 'review-r2-published', 'published')
    const wrapper = mount(KnowledgeGovernancePanel, {
      props: {
        documents: [],
        qualityAssets: [pendingAsset, approvedAsset, failedAsset, passedAsset, publishedAsset],
        qualityRetrainingVersions: [approvedVersion, failedVersion, passedVersion, publishedVersion],
      },
    })

    const approveButton = wrapper.get('button[aria-label="批准进入训练集：QK-TRAIN-20260521-R2 再训练候选"]')
    const validateButton = wrapper.get('button[aria-label="运行发布前校验：QK-TRAIN-20260521-R2 已审批候选"]')
    const passButton = wrapper.get('button[aria-label="补齐字段并重新校验：QK-TRAIN-20260521-R2 校验失败候选"]')
    const publishButton = wrapper.get('button[aria-label="发布到 AI 推荐：QK-TRAIN-20260521-R2 校验通过候选"]')
    const rollbackButton = wrapper.get('button[aria-label="回滚训练集版本：QK-TRAIN-20260521-R2 已审批候选"]')
    const publishedNote = wrapper.get('.publish-note')

    await approveButton.trigger('click')
    await validateButton.trigger('click')
    await passButton.trigger('click')
    await publishButton.trigger('click')
    await rollbackButton.trigger('click')

    expect(wrapper.emitted('quality-retraining-approved')?.[0]).toEqual(['review-r2-001'])
    expect(wrapper.emitted('quality-retraining-validated')?.[0]).toEqual([approvedVersion.id])
    expect(wrapper.emitted('quality-retraining-validation-passed')?.[0]).toEqual([failedVersion.id])
    expect(wrapper.emitted('quality-retraining-published')?.[0]).toEqual([passedVersion.id])
    expect(wrapper.emitted('quality-retraining-rolled-back')?.[0]).toEqual([approvedVersion.id])
    expect(publishedNote.text()).toContain('已发布到 AI 推荐链路')
  })

  it('renders assistant citation traces with blocked-source governance evidence', () => {
    knowledgeGovernancePanelMocks.readAssistantCitationTraces.mockReturnValue([
      {
        id: 'trace-quality-reuse',
        question: '扫码返工同类质量问题如何复用 CAPA 推荐？',
        status: '需复核',
        answerIntent: '把现场扫码不合格、批次隔离、返工成本和复验释放沉淀为 CAPA 推荐样本',
        sources: [
          {
            sourceId: 'QK-REWORK-001',
            sourceName: '扫码返工知识样本',
          },
        ],
        blockedSource: 'AUD-QK-REUSE-001 / TRACE-QK-REUSE-001 需质量工程师复核后才能正式引用。',
      },
    ])

    const wrapper = mount(KnowledgeGovernancePanel, {
      props: {
        documents: [],
      },
    })

    const traceCard = wrapper.get('.trace-card')
    expect(traceCard.text()).toContain('扫码返工同类质量问题如何复用 CAPA 推荐？')
    expect(traceCard.text()).toContain('扫码返工知识样本')
    expect(traceCard.text()).toContain('AUD-QK-REUSE-001 / TRACE-QK-REUSE-001')
    expect(traceCard.get('.trace-topline span').classes()).toContain('review')
  })

  it('labels rolled-back retraining versions as waiting for corrected reapproval', () => {
    const rolledBackAsset = makeRetrainingAsset(
      'quality-asset-retraining-review-r2-rolled-back',
      'QK-TRAIN-20260521-R2 已回滚候选'
    )
    const rolledBackVersion = makeLifecycleVersion(
      'quality-version-rolled-back',
      'review-r2-rolled-back',
      'rolled_back'
    )

    const wrapper = mount(KnowledgeGovernancePanel, {
      props: {
        documents: [],
        qualityAssets: [rolledBackAsset],
        qualityRetrainingVersions: [rolledBackVersion],
      },
    })

    expect(wrapper.get('.rollback-note').text()).toBe('已回滚，等待字段补齐后重新审批。')
    expect(wrapper.find('button[aria-label="回滚训练集版本：QK-TRAIN-20260521-R2 已回滚候选"]').exists()).toBe(false)
  })

  it('routes reopened R3 gray decisions through revalidation before republish evidence exists', async () => {
    const reopenedAsset = {
      ...nextTrainingAsset,
      id: 'quality-asset-next-training-feedback-r3-reopened-pending',
      title: 'QK-TRAIN-20260521-R3 已重开训练集',
    }
    const grayPublishedVersion = makeLifecycleVersion(
      'quality-next-version-r3-gray-published',
      'recommendation-feedback-feedback-r3-reopened-pending',
      'gray_published',
      'QK-TRAIN-20260521-R3'
    )
    const reopenedDecision = makeReopenedGrayDecision(grayPublishedVersion)
    const wrapper = mount(KnowledgeGovernancePanel, {
      props: {
        documents: [],
        qualityAssets: [reopenedAsset],
        qualityRetrainingVersions: [grayPublishedVersion],
        qualityGrayReleaseDecisions: [reopenedDecision],
      },
    })

    const revalidateButton = wrapper.get('button[aria-label="重新运行灰度前校验：QK-TRAIN-20260521-R3 已重开训练集"]')
    await revalidateButton.trigger('click')

    expect(wrapper.emitted('quality-next-training-validated')?.[0]).toEqual([grayPublishedVersion.id])
    expect(wrapper.find('button[aria-label="重新灰度发布 R3：QK-TRAIN-20260521-R3 已重开训练集"]').exists()).toBe(false)
  })

  it('labels reopened R3 gray publish after republish evidence exists', async () => {
    knowledgeGovernancePanelMocks.isQualityKnowledgeGrayRepublishEvidence.mockReturnValue(true)
    const reopenedAsset = {
      ...nextTrainingAsset,
      id: 'quality-asset-next-training-feedback-r3-reopened-ready',
      title: 'QK-TRAIN-20260521-R3 已复验训练集',
    }
    const validationPassedVersion = makeLifecycleVersion(
      'quality-next-version-r3-validation-passed',
      'recommendation-feedback-feedback-r3-reopened-ready',
      'validation_passed',
      'QK-TRAIN-20260521-R3'
    )
    const reopenedDecision = makeReopenedGrayDecision(validationPassedVersion)
    const wrapper = mount(KnowledgeGovernancePanel, {
      props: {
        documents: [],
        qualityAssets: [reopenedAsset],
        qualityRetrainingVersions: [validationPassedVersion],
        qualityGrayReleaseDecisions: [reopenedDecision],
      },
    })

    const republishButton = wrapper.get('button[aria-label="重新灰度发布 R3：QK-TRAIN-20260521-R3 已复验训练集"]')
    await republishButton.trigger('click')

    expect(wrapper.emitted('quality-next-training-gray-published')?.[0]).toEqual([validationPassedVersion.id])
    expect(wrapper.find('button[aria-label="重新运行灰度前校验：QK-TRAIN-20260521-R3 已复验训练集"]').exists()).toBe(false)
  })
})

function makeReopenedGrayDecision(
  version: QualityKnowledgeRetrainingVersionRecord
): QualityKnowledgeGrayReleaseDecisionRecord {
  return {
    id: `gray-decision-${version.id}`,
    monitorId: `gray-monitor-${version.id}`,
    trainingSetVersion: version.trainingSetVersion,
    targetWorkOrderId: version.targetWorkOrderId,
    operationCode: version.operationCode,
    releaseCycleLabel: '重新灰度发布',
    releaseAuditId: `AUD-${version.id}-RELEASE`,
    releaseTraceId: `TRACE-${version.id}-RELEASE`,
    releaseScopeLabel: '扫码返工推荐灰度范围',
    decision: 'rolled_back',
    decisionLabel: '重开灰度前校验',
    statusClass: 'guarded',
    decidedBy: '质量主管',
    decidedAt: '2026-06-03T00:00:00.000Z',
    auditId: `AUD-${version.id}-REOPENED`,
    traceId: `TRACE-${version.id}-REOPENED`,
    reason: 'R3 灰度问题单重开后必须先完成灰度前校验，再允许重新灰度发布。',
    approvalStatus: 'approved',
    approvalLabel: '已批准',
    reviewIssueId: `ISSUE-${version.id}`,
    reviewIssueTraceId: `TRACE-${version.id}-ISSUE`,
    reviewIssueStatus: 'prevalidation_reopened',
    reviewIssueLabel: '已重开灰度前校验',
    metricSnapshot: [
      {
        label: '误召回',
        value: '0',
      },
    ],
    actions: ['重新运行灰度前校验', '重新灰度发布'],
  }
}
