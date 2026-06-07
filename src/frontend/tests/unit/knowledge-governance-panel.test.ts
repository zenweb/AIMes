import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import KnowledgeGovernancePanel from '../../src/components/knowledge/KnowledgeGovernancePanel.vue'
import type {
  QualityKnowledgeAssetGovernanceRecord,
  QualityKnowledgeRetrainingVersionRecord,
} from '../../src/utils/quality-knowledge-sample-sync'

vi.mock('../../src/utils/knowledge-citations', () => ({
  readAssistantCitationTraces: vi.fn(() => []),
}))

vi.mock('../../src/utils/quality-knowledge-sample-sync', async importOriginal => {
  const actual = await importOriginal<typeof import('../../src/utils/quality-knowledge-sample-sync')>()
  return {
    ...actual,
    isQualityKnowledgeGrayRepublishEvidence: vi.fn(() => false),
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
})
