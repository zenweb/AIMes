import type { KnowledgeSourceDto } from '../types/knowledge'
import { readKnowledgeGovernanceReview } from './knowledge-governance-sync'
import {
  readLatestQualityKnowledgeReuseClosure,
  readLatestQualityKnowledgeReuseDraft,
  readLatestQualityKnowledgeReviewQueueRecord,
  readLatestQualityKnowledgeSample,
  readLatestQualityKnowledgeRecommendationFeedbackRecord,
  readQualityKnowledgeRetrainingVersionRecords,
  qualityKnowledgeRecommendationReleaseScopeLabel,
  selectPrioritizedQualityKnowledgeRecommendationVersion,
} from './quality-knowledge-sample-sync'

export interface AssistantCitationTrace {
  id: string
  question: string
  answerIntent: string
  sources: KnowledgeSourceDto[]
  blockedSource: string
  status: '可引用' | '需复核'
}

export const assistantCitationTraces: AssistantCitationTrace[] = [
  {
    id: 'rush-delay',
    question: '为什么 WO-RUSH-9001 会延期？',
    answerIntent: '解释急单延期主因、替代料与 OTD 恢复路径',
    sources: [
      {
        sourceId: 'kg-sop-cnc',
        sourceName: 'CNC 精加工 SOP V2.3',
        content: 'OP-020 CNC 精加工参数、首件确认和刀具寿命预警。',
        relevanceScore: 0.94,
      },
      {
        sourceId: 'kg-bom-a100',
        sourceName: 'BOM-A100 替代料规则 V1.0',
        content: 'M-AL-6061B 可进入替代料评估，但需质量复核。',
        relevanceScore: 0.9,
      },
      {
        sourceId: 'kg-otd-replay',
        sourceName: 'OTD 改善复盘样本 2026-05-20',
        content: '人工基线 OTD 82%，Agent 推荐方案 OTD 96%。',
        relevanceScore: 0.87,
      },
    ],
    blockedSource: 'CNC-01 主轴维护手册 V1.1 已过期，不能作为延期结论主证据。',
    status: '可引用',
  },
  {
    id: 'top-risk-orders',
    question: '今天最危险的 3 个工单是什么？',
    answerIntent: '按交期、瓶颈设备、缺料和质量返工排序工单风险',
    sources: [
      {
        sourceId: 'kg-risk-queue',
        sourceName: '风险处置队列 2026-05-20',
        content: 'WO-RUSH-9001、WO-2026-0042 和 WO-003 位于今日高风险队列。',
        relevanceScore: 0.93,
      },
      {
        sourceId: 'kg-quality-torque',
        sourceName: '装配扭矩检验规范 V1.8',
        content: 'OP-040 扭矩 32-36 N.m 的检验窗口和复验规则。',
        relevanceScore: 0.82,
      },
      {
        sourceId: 'kg-capa-closure',
        sourceName: '质量 CAPA 验证记录 TRACE-QA-CAPA',
        content: '热处理返工已进入 CAPA 验证和 OTD 复盘。',
        relevanceScore: 0.8,
      },
    ],
    blockedSource: '即将过期的检验规范只可辅助解释，需质量负责人复核后用于正式报告。',
    status: '需复核',
  },
  {
    id: 'cnc-four-hour-fault',
    question: '如果 CNC-001 故障 4 小时会怎样？',
    answerIntent: '模拟停机影响、替代设备、换线代价和审计要求',
    sources: [
      {
        sourceId: 'kg-sop-cnc',
        sourceName: 'CNC 精加工 SOP V2.3',
        content: 'CNC 精加工设备能力、首件确认和刀具寿命约束。',
        relevanceScore: 0.91,
      },
      {
        sourceId: 'kg-equipment-impact',
        sourceName: '设备维护影响记录 2026-05-20',
        content: 'CNC-001 夜班维护窗口影响 WO-2026-0042 和 WO-RUSH-9001。',
        relevanceScore: 0.88,
      },
      {
        sourceId: 'kg-schedule-lock',
        sourceName: '排产锁定期策略 8h',
        content: '锁定期内任务不自动改动，锁定期后进入人工复核。',
        relevanceScore: 0.84,
      },
    ],
    blockedSource: 'CNC-01 主轴维护手册 V1.1 待索引且已过期，只能提示维护风险，不能自动生成工艺结论。',
    status: '可引用',
  },
  {
    id: 'engineering-constraints',
    question: 'BOM 与工艺路线如何约束排产？',
    answerIntent: '解释 BOM 替代料、工艺路线设备能力、质量门和瓶颈能力如何进入 AI 排产',
    sources: [
      {
        sourceId: 'kg-bom-a100',
        sourceName: 'BOM-A100 替代料规则 V1.0',
        content: 'M-AL-6061B 只有工程确认后才能释放 M-AL-6061 缺料冻结约束。',
        relevanceScore: 0.95,
      },
      {
        sourceId: 'kg-route-a100',
        sourceName: 'R-A100 精密轴承组件工艺路线',
        content: 'CNC 设备能力、来料检验和最终检验共同约束 OP-020 / OP-040 排产。',
        relevanceScore: 0.91,
      },
      {
        sourceId: 'kg-route-b200',
        sourceName: 'R-B200 传动轴总成工艺路线',
        content: 'OP-090 热处理形成瓶颈，需分流/合批和夜班窗口兜底。',
        relevanceScore: 0.9,
      },
    ],
    blockedSource: 'BOM-C300 草稿与未发布工艺路线只能作为工程评审参考，不能直接作为正式排产约束。',
    status: '可引用',
  },
]

export function findAssistantCitationTrace(question: string) {
  const q = question.toLowerCase()
  if (
    (q.includes('扫码') || q.includes('返工') || q.includes('capa') || q.includes('质量'))
    && (q.includes('复用') || q.includes('同类') || q.includes('知识') || q.includes('根因') || q.includes('推荐'))
  ) {
    return buildBarcodeQualityReuseTrace()
  }
  if ((q.includes('为什么') || q.includes('原因')) && (q.includes('延期') || q.includes('延误'))) {
    return resolveGovernedTrace(assistantCitationTraces[0])
  }
  if ((q.includes('最危险') || q.includes('最高风险') || q.includes('top') || q.includes('前三') || q.includes('3 个')) && q.includes('工单')) {
    return assistantCitationTraces[1]
  }
  if ((q.includes('cnc-01') || q.includes('cnc-001') || q.includes('cnc')) && (q.includes('故障') || q.includes('停机')) && (q.includes('4') || q.includes('四'))) {
    return resolveGovernedTrace(assistantCitationTraces[2])
  }
  if (
    (q.includes('bom') || q.includes('物料清单') || q.includes('工艺路线') || q.includes('工程数据') || q.includes('替代料'))
    && (q.includes('排产') || q.includes('约束') || q.includes('解释') || q.includes('影响') || q.includes('如何'))
  ) {
    return resolveGovernedTrace(assistantCitationTraces[3])
  }
  return undefined
}

export function readAssistantCitationTraces() {
  return [
    ...assistantCitationTraces.map(resolveGovernedTrace),
    buildBarcodeQualityReuseTrace(),
  ]
}

export function resolveGovernedTrace(trace: AssistantCitationTrace): AssistantCitationTrace {
  const review = readKnowledgeGovernanceReview('kg-equipment-cnc-maint')
  if (!review) return trace

  const reviewedSource: KnowledgeSourceDto = {
    sourceId: review.documentId,
    sourceName: `${review.documentTitle} ${review.reviewedVersion}`,
    content: review.summary,
    relevanceScore: 0.86,
  }
  const sources = trace.sources.some(source => source.sourceId === reviewedSource.sourceId)
    ? trace.sources
    : [...trace.sources, reviewedSource]
  return {
    ...trace,
    sources,
    blockedSource: `${review.auditId} 已完成知识治理复核：${review.documentTitle} ${review.reviewedVersion} 已索引且有效期至 ${review.validUntil}，可作为正式引用来源。`,
    status: '可引用',
  }
}

function buildBarcodeQualityReuseTrace(): AssistantCitationTrace {
  const sample = readLatestQualityKnowledgeSample()
  if (!sample) {
    return {
      id: 'barcode-quality-reuse',
      question: '扫码返工同类问题如何复用 CAPA？',
      answerIntent: '把现场扫码不合格、批次隔离、返工成本和复验释放沉淀为 CAPA 推荐样本',
      sources: [
        {
          sourceId: 'kg-quality-torque',
          sourceName: '装配扭矩检验规范 V1.8',
          content: '复验窗口和质量放行规则可作为辅助来源。',
          relevanceScore: 0.82,
        },
        {
          sourceId: 'kg-capa-closure',
          sourceName: '质量 CAPA 验证记录 TRACE-QA-CAPA',
          content: '现有 CAPA 验证可辅助判断任务闭环，但缺少扫码现场样本。',
          relevanceScore: 0.78,
        },
      ],
      blockedSource: '扫码返工样本尚未沉淀为知识来源，需在质量闭环中生成 CAPA 知识样本后再正式引用。',
      status: '需复核',
    }
  }

  const draft = readLatestQualityKnowledgeReuseDraft()
  const draftSources: KnowledgeSourceDto[] = draft
    ? [
        {
          sourceId: 'kg-quality-reuse-draft',
          sourceName: `${draft.targetWorkOrderId} 同类缺陷处置草案`,
          content: `${draft.summary} 复用效果 ${draft.effectScore} 分。`,
          relevanceScore: 0.92,
        },
      ]
    : []
  const closure = readLatestQualityKnowledgeReuseClosure()
  const closureSources: KnowledgeSourceDto[] = closure
    ? [
        {
          sourceId: 'kg-quality-reuse-feedback',
          sourceName: `${closure.targetWorkOrderId} 正式 CAPA 与复用效果反馈`,
          content: `${closure.formalCapaTitle}，状态 ${closure.statusLabel}，复用评分 ${closure.effectScoreBefore} -> ${closure.effectScoreAfter}。`,
          relevanceScore: closure.status === 'verified' ? 0.95 : 0.9,
        },
      ]
    : []
  const reviewQueue = readLatestQualityKnowledgeReviewQueueRecord()
  const publishedRetrainingVersion = selectPrioritizedQualityKnowledgeRecommendationVersion(readQualityKnowledgeRetrainingVersionRecords())
  const recommendationFeedback = readLatestQualityKnowledgeRecommendationFeedbackRecord()
  const reviewQueueSources: KnowledgeSourceDto[] = reviewQueue
    ? [
        {
          sourceId: 'kg-quality-low-score-review',
          sourceName: `${reviewQueue.targetWorkOrderId} 低分复用复核队列`,
          content: reviewQueue.status === 'closed'
            ? `${reviewQueue.title}，结论 ${reviewQueue.decisionLabel}，复用效果 ${reviewQueue.effectScore} 分；${reviewQueue.decisionSummary}`
            : `${reviewQueue.title}，状态 ${reviewQueue.statusLabel}，复用效果 ${reviewQueue.effectScore} 分；降权原因：${reviewQueue.reason}。`,
          relevanceScore: 0.61,
        },
      ]
    : []
  const retrainingSources: KnowledgeSourceDto[] = publishedRetrainingVersion
    ? [
        {
          sourceId: publishedRetrainingVersion.status === 'gray_published' ? 'kg-quality-retraining-gray-published' : 'kg-quality-retraining-published',
          sourceName: `${publishedRetrainingVersion.trainingSetVersion} ${publishedRetrainingVersion.status === 'gray_published' ? '已灰度发布训练集' : '已发布训练集'}`,
          content: `${publishedRetrainingVersion.publishSummary} 推荐范围：${qualityKnowledgeRecommendationReleaseScopeLabel(publishedRetrainingVersion)}。`,
          relevanceScore: 0.96,
        },
      ]
    : []
  const recommendationFeedbackSources: KnowledgeSourceDto[] = recommendationFeedback
    ? [
        {
          sourceId: 'kg-quality-recommendation-feedback',
          sourceName: `${recommendationFeedback.targetWorkOrderId} ${recommendationFeedback.operationCode} 推荐采纳效果`,
          content: `${recommendationFeedback.decisionLabel}，效果趋势 ${recommendationFeedback.effectTrendLabel}，下一轮训练集 ${recommendationFeedback.nextTrainingSetVersion}。`,
          relevanceScore: 0.97,
        },
      ]
    : []

  return {
    id: 'barcode-quality-reuse',
    question: '扫码返工同类问题如何复用 CAPA？',
    answerIntent: `${sample.workOrderId} ${sample.processName} 扫码返工样本可用于同批次、同设备和同缺陷的 CAPA 推荐`,
    sources: [
      {
        sourceId: sample.documentId,
        sourceName: `${sample.documentTitle} ${sample.version}`,
        content: sample.summary,
        relevanceScore: 0.94,
      },
      {
        sourceId: `${sample.documentId}-recommendations`,
        sourceName: '扫码返工 CAPA 推荐',
        content: sample.capaRecommendations.join('；'),
        relevanceScore: 0.9,
      },
      {
        sourceId: `${sample.documentId}-evidence`,
        sourceName: '扫码质量证据链',
        content: sample.evidenceTraceIds.join(' / '),
        relevanceScore: 0.88,
      },
      ...draftSources,
      ...closureSources,
      ...reviewQueueSources,
      ...retrainingSources,
      ...recommendationFeedbackSources,
    ],
    blockedSource: buildQualityReuseBlockedSource(sample.auditId, sample.defectPattern, sample.traceId, draft, closure, reviewQueue, publishedRetrainingVersion, recommendationFeedback),
    status: '可引用',
  }
}

function buildQualityReuseBlockedSource(
  sampleAuditId: string,
  defectPattern: string,
  sampleTraceId: string,
  draft: ReturnType<typeof readLatestQualityKnowledgeReuseDraft>,
  closure: ReturnType<typeof readLatestQualityKnowledgeReuseClosure>,
  reviewQueue: ReturnType<typeof readLatestQualityKnowledgeReviewQueueRecord>,
  publishedRetrainingVersion: ReturnType<typeof readQualityKnowledgeRetrainingVersionRecords>[number] | undefined,
  recommendationFeedback: ReturnType<typeof readLatestQualityKnowledgeRecommendationFeedbackRecord>
) {
  const base = closure?.status === 'verified'
    ? `${closure.auditId} 已完成正式 CAPA 验证并回写 ${closure.effectTraceId}，复用评分从 ${closure.effectScoreBefore} 分提升到 ${closure.effectScoreAfter} 分。`
    : closure
      ? `${closure.auditId} 已将同类缺陷草案转正式 CAPA：${closure.traceId}，仍需按 ${closure.verification} 验证后回写效果。`
      : draft
        ? `${draft.auditId} 已基于 ${sampleAuditId} 生成同类缺陷处置草案：${draft.traceId}，草案仍需质量工程师复核后转正式 CAPA。`
        : `${sampleAuditId} 已沉淀扫码质量样本：${defectPattern}，可引用 ${sampleTraceId} 作为正式知识来源。`

  if (publishedRetrainingVersion) {
    const releaseVerb = publishedRetrainingVersion.status === 'gray_published' ? '已灰度发布' : '已发布'
    const releaseScope = qualityKnowledgeRecommendationReleaseScopeLabel(publishedRetrainingVersion)
    if (recommendationFeedback) {
      return `${base} ${publishedRetrainingVersion.publishAuditId} ${releaseVerb} ${publishedRetrainingVersion.trainingSetVersion} 到 ${releaseScope}：${publishedRetrainingVersion.publishTraceId}。${recommendationFeedback.auditId} 已回写现场采纳效果：${recommendationFeedback.traceId}，效果趋势 ${recommendationFeedback.effectTrendLabel}，下一轮训练集 ${recommendationFeedback.nextTrainingSetVersion} 已入池。`
    }
    return `${base} ${publishedRetrainingVersion.publishAuditId} ${releaseVerb} ${publishedRetrainingVersion.trainingSetVersion} 到 ${releaseScope}：${publishedRetrainingVersion.publishTraceId}，OP-20 装配扭矩偏移优先匹配独立 CAPA 样本。`
  }
  if (!reviewQueue) return base
  if (reviewQueue.status === 'closed' && reviewQueue.decisionAuditId && reviewQueue.decisionTraceId && reviewQueue.disabledReuseRule) {
    return `${base} ${reviewQueue.decisionAuditId} 已完成低分复核结论回写：${reviewQueue.decisionTraceId}，${reviewQueue.disabledReuseRule}`
  }
  return `${base} ${reviewQueue.auditId} 已把 ${reviewQueue.targetWorkOrderId} ${reviewQueue.operationCode} 的低分复用样本降权到复核队列：${reviewQueue.traceId}，${reviewQueue.reason}`
}
