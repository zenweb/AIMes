<template>
  <section class="audit-replay-panel" aria-label="AI 决策回放">
    <div class="replay-heading">
      <div>
        <span class="eyebrow">AI 决策审计</span>
        <h3>建议、采纳、重排动作与配置审批可回放</h3>
      </div>
      <span class="approval-badge">{{ pendingApprovalCount }} 个配置待审批</span>
    </div>

    <div class="replay-metrics">
      <div v-for="metric in metrics" :key="metric.label" class="metric-chip">
        <strong>{{ metric.value }}</strong>
        <span>{{ metric.label }}</span>
      </div>
    </div>

    <div class="replay-grid">
      <article v-for="item in replayItems" :key="item.id" class="decision-card" :class="item.status">
        <div class="decision-topline">
          <span>{{ item.type }}</span>
          <strong>{{ item.time }}</strong>
        </div>
        <h4>{{ item.title }}</h4>
        <p>{{ item.summary }}</p>
        <div class="decision-meta">
          <span>对象：{{ item.object }}</span>
          <span>执行人：{{ item.actor }}</span>
          <span>证据：{{ item.evidence }}</span>
        </div>
        <button type="button" class="replay-btn" @click="selectedId = item.id">回放决策链</button>
      </article>
    </div>

    <div v-if="selectedItem" class="replay-detail">
      <div class="detail-title">
        <h4>{{ selectedItem.title }} 回放链</h4>
        <span>{{ selectedItem.traceId }}</span>
      </div>
      <ol>
        <li v-for="step in selectedItem.steps" :key="step">{{ step }}</li>
      </ol>
      <div class="trace-footer">
        <span>风险口径：{{ selectedItem.risk }}</span>
        <span>留痕状态：{{ selectedItem.auditState }}</span>
      </div>
    </div>

    <div class="approval-lane">
      <h4>关键配置变更审批</h4>
      <div v-for="approval in approvals" :key="approval.id" class="approval-row">
        <div>
          <strong>{{ approval.title }}</strong>
          <p>{{ approval.reason }}</p>
        </div>
        <span>{{ approval.owner }}</span>
        <em>{{ approval.status }}</em>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { readAssistantActionAudits, type AssistantActionAuditRecord } from '../../utils/assistant-action-audit'
import { readQualityCapaClosure, type QualityCapaClosure } from '../../utils/quality-capa-sync'
import { readPocEvidenceGovernanceRecords, type PocEvidenceGovernanceRecord } from '../../utils/poc-evidence-governance'
import { approvalStatusLabel, isApprovalOpen, readAgentConfigApprovals, type AgentConfigApprovalRecord } from '../../utils/agent-config-approval-sync'
import { readPocReviewSignoffRecord, type PocReviewSignoffRecord } from '../../utils/poc-review-signoff-sync'
import { readOtdEvidenceChainRecords, type OtdEvidenceChainItem } from '../../utils/otd-evidence-chain-sync'
import { readKnowledgeGovernanceReviews, type KnowledgeGovernanceReviewRecord } from '../../utils/knowledge-governance-sync'
import {
  buildQualityKnowledgeRecommendationExperimentCandidateRecords,
  buildQualityKnowledgeGrayReleaseMonitorRecords,
  qualityKnowledgeGrayReleaseCycleLabel,
  readQualityKnowledgeGrayReleaseDecisionRecords,
  readQualityKnowledgeRecommendationFeedbackRecords,
  readQualityKnowledgeRetrainingVersionRecords,
  type QualityKnowledgeGrayReleaseDecisionRecord,
  type QualityKnowledgeGrayReleaseMonitorRecord,
  type QualityKnowledgeRecommendationExperimentCandidateRecord,
  type QualityKnowledgeRecommendationFeedbackRecord,
  type QualityKnowledgeRetrainingVersionRecord,
} from '../../utils/quality-knowledge-sample-sync'

interface ReplayItem {
  id: string
  type: string
  title: string
  summary: string
  object: string
  actor: string
  evidence: string
  time: string
  status: 'accepted' | 'executed' | 'approval' | 'assistant' | 'evidence' | 'signoff' | 'otd' | 'knowledge' | 'quality'
  traceId: string
  risk: string
  auditState: string
  steps: string[]
}

interface ApprovalItem {
  id: string
  title: string
  reason: string
  owner: string
  status: string
}

const qualityCapaClosure = ref<QualityCapaClosure | null>(null)
const assistantActionAudits = ref<AssistantActionAuditRecord[]>([])
const pocEvidenceRecords = ref<PocEvidenceGovernanceRecord[]>([])
const configApprovals = ref<AgentConfigApprovalRecord[]>([])
const pocReviewSignoff = ref<PocReviewSignoffRecord | null>(null)
const otdEvidenceRecords = ref<OtdEvidenceChainItem[]>([])
const knowledgeReviewRecords = ref<KnowledgeGovernanceReviewRecord[]>([])
const qualityRecommendationFeedbackRecords = ref<QualityKnowledgeRecommendationFeedbackRecord[]>([])
const qualityGrayReleaseDecisionRecords = ref<QualityKnowledgeGrayReleaseDecisionRecord[]>([])
const qualityRetrainingVersionRecords = ref<QualityKnowledgeRetrainingVersionRecord[]>([])

const qualityGrayReleaseMonitorRecords = computed<QualityKnowledgeGrayReleaseMonitorRecord[]>(() =>
  buildQualityKnowledgeGrayReleaseMonitorRecords(qualityRetrainingVersionRecords.value, qualityRecommendationFeedbackRecords.value)
)
const qualityExperimentCandidateRecords = computed<QualityKnowledgeRecommendationExperimentCandidateRecord[]>(() =>
  buildQualityKnowledgeRecommendationExperimentCandidateRecords(
    qualityRetrainingVersionRecords.value,
    qualityRecommendationFeedbackRecords.value,
    qualityGrayReleaseDecisionRecords.value
  )
)

const baseReplayItems: ReplayItem[] = [
  {
    id: 'rush-replan',
    type: 'AI 建议',
    title: 'WO-RUSH-9001 急单插入重排建议',
    summary: 'Agent 基于锁定期、CNC 空窗和 M-AL-6061 齐套缺口生成加班插入方案。',
    object: 'WO-RUSH-9001 / CNC-01',
    actor: 'scheduler.li',
    evidence: 'OTD +14% / 延期减少 4 单',
    time: '2026-05-20 09:14',
    status: 'accepted',
    traceId: 'TRACE-SCH-20260520-001',
    risk: '接受夜班加班，保护 2 张急单承诺交期',
    auditState: 'AI 建议、人工采纳、反馈原因已归档',
    steps: [
      '风险队列收到 WO-RUSH-9001 客户插单事件。',
      'Agent 生成急单插入重排建议，并解释锁定期后第一个 CNC 空窗。',
      '调度员填写“急单客户承诺交期优先，接受加班插入”后采纳。',
      '排产反馈记录写入 OTD 复盘和后续模型改进数据集。',
    ],
  },
  {
    id: 'material-recovery',
    type: '重排动作',
    title: 'M-AL-6061 收货后释放冻结工序',
    summary: '采购加急收货回写后，缺料事件从高风险变为已缓解，并触发排产窗口复核。',
    object: 'M-AL-6061 / WO-DEMO-1002',
    actor: 'purchase.wang',
    evidence: 'PO-RUSH-20260519',
    time: '2026-05-20 10:02',
    status: 'executed',
    traceId: 'TRACE-MAT-20260520-004',
    risk: '缺口清零后仍需确认首件检验窗口',
    auditState: '采购动作、风险下降、排产复核已串联',
    steps: [
      '缺料事件生成采购加急单 PO-RUSH-20260519。',
      '采购收货后把 M-AL-6061 缺口更新为 0。',
      '生产概览和 AI 排产同步展示风险下降。',
      '调度员复核冻结工序的最早可执行窗口。',
    ],
  },
]

const replayItems = computed<ReplayItem[]>(() => {
  const closure = qualityCapaClosure.value
  const assistantItems = assistantActionAudits.value.map(mapAssistantAuditToReplay)
  const pocEvidenceItems = pocEvidenceRecords.value.map(mapPocEvidenceToReplay)
  const knowledgeItems = knowledgeReviewRecords.value.map(mapKnowledgeGovernanceReviewToReplay)
  const qualityRecommendationFeedbackItems = qualityRecommendationFeedbackRecords.value.map(mapQualityRecommendationFeedbackToReplay)
  const qualityGrayReleaseMonitorItems = qualityGrayReleaseMonitorRecords.value.map(mapQualityGrayReleaseMonitorToReplay)
  const qualityGrayReleaseDecisionItems = qualityGrayReleaseDecisionRecords.value.map(mapQualityGrayReleaseDecisionToReplay)
  const qualityExperimentCandidateItems = qualityExperimentCandidateRecords.value.map(mapQualityExperimentCandidateToReplay)
  const otdEvidenceItems = otdEvidenceRecords.value.map(mapOtdEvidenceToReplay)
  const configApprovalItems = configApprovals.value.map(mapConfigApprovalToReplay)
  const signoffItems = pocReviewSignoff.value ? [mapPocReviewSignoffToReplay(pocReviewSignoff.value)] : []
  const baseItems = [...qualityExperimentCandidateItems, ...qualityGrayReleaseMonitorItems, ...qualityGrayReleaseDecisionItems, ...qualityRecommendationFeedbackItems, ...knowledgeItems, ...otdEvidenceItems, ...signoffItems, ...pocEvidenceItems, ...assistantItems, ...configApprovalItems, ...baseReplayItems]
  if (!closure) return baseItems

  return [
    {
      id: 'quality-capa-closure',
      type: '质量 CAPA',
      title: `${closure.workOrderId} ${closure.taskKind}验证闭环`,
      summary: `${closure.taskTitle} 已完成，根因 ${closure.rootCause} 证据强度 ${Math.round(closure.evidenceStrength * 100)}%。`,
      object: `${closure.inspectionId} / ${closure.workOrderId}`,
      actor: closure.owner,
      evidence: closure.verification,
      time: new Date(closure.verifiedAt).toLocaleString('zh-CN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }),
      status: 'executed',
      traceId: closure.traceId,
      risk: closure.otdImpact,
      auditState: closure.auditState,
      steps: [
        `${closure.inspectionId} 根因分析锁定 ${closure.rootCause}，证据强度 ${Math.round(closure.evidenceStrength * 100)}%。`,
        `${closure.taskKind}任务分派给 ${closure.owner}，截止 ${closure.dueAt}。`,
        `验证标准 ${closure.verification} 已回写，CAPA 状态变为已验证。`,
        closure.reviewAction,
      ],
    },
    ...baseItems,
  ]
})

function mapAssistantAuditToReplay(record: AssistantActionAuditRecord): ReplayItem {
  const statusText = record.permitted ? '权限通过并已执行' : '权限拒绝，动作未执行'
  const routeText = record.targetRoute ? `目标页面 ${record.targetRoute}` : '无页面跳转'
  const isRecoveryPackage = record.type === 'delivery_recovery_package'
  return {
    id: record.id,
    type: 'AI 助手动作',
    title: `AI 助手${record.label}`,
    summary: `${record.resultMessage}；${statusText}，审计号 ${record.auditCode}。`,
    object: record.actionId,
    actor: `${record.actor} / ${record.role}`,
    evidence: record.auditCode,
    time: new Date(record.createdAt).toLocaleString('zh-CN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }),
    status: 'assistant',
    traceId: record.traceId ?? record.auditCode,
    risk: record.permitted
      ? isRecoveryPackage
        ? '助手执行包已同步排产、风险、OTD 证据链和审计回放，可追溯每个责任动作。'
        : '助手动作已进入审计回放，后续可追溯执行人与入口。'
      : '权限阻断已留痕，未改变业务数据。',
    auditState: record.permitted
      ? isRecoveryPackage
        ? 'AI 助手意图、权限校验、跨模块执行包和 OTD 证据已归档'
        : 'AI 助手意图、权限校验、执行结果已归档'
      : 'AI 助手意图与权限拒绝已归档',
    steps: isRecoveryPackage
      ? [
          `AI 生产助手识别可执行意图：${record.label}。`,
          `当前用户 ${record.actor} 以 ${record.role} 角色触发动作，系统完成权限校验。`,
          `${statusText}，${routeText}。`,
          '执行包已分解为 AI 排产重排、风险升级、采购替代批次确认和质量首件复核四个责任动作。',
          `执行反馈写入聊天记录，并同步为审计回放记录 ${record.auditCode} / ${record.traceId ?? record.auditCode}。`,
        ]
      : [
          `AI 生产助手识别可执行意图：${record.label}。`,
          `当前用户 ${record.actor} 以 ${record.role} 角色触发动作，系统完成权限校验。`,
          `${statusText}，${routeText}。`,
          `执行反馈写入聊天记录，并同步为审计回放记录 ${record.auditCode}。`,
        ],
  }
}

function mapPocEvidenceToReplay(record: PocEvidenceGovernanceRecord): ReplayItem {
  return {
    id: record.id,
    type: 'POC 证据',
    title: record.title,
    summary: `${record.description} 批次 ${record.batchId} 已进入 POC 复盘证据包。`,
    object: record.object,
    actor: record.owner,
    evidence: record.batchId,
    time: new Date(record.preparedAt).toLocaleString('zh-CN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }),
    status: 'evidence',
    traceId: record.auditId,
    risk: record.risk,
    auditState: record.auditState,
    steps: record.steps,
  }
}

function mapKnowledgeGovernanceReviewToReplay(record: KnowledgeGovernanceReviewRecord): ReplayItem {
  return {
    id: record.id,
    type: '知识治理',
    title: `${record.documentTitle} ${record.version} -> ${record.reviewedVersion} 复核重建索引`,
    summary: `${record.summary} 审计编号 ${record.auditId}。`,
    object: record.documentId,
    actor: record.reviewer,
    evidence: record.auditId,
    time: new Date(record.reviewedAt).toLocaleString('zh-CN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }),
    status: 'knowledge',
    traceId: record.traceId,
    risk: `有效期延至 ${record.validUntil}，可引用范围：${record.references.join(' / ')}。`,
    auditState: '知识复核、版本升级、索引重建和引用范围已归档',
    steps: [
      `${record.documentTitle} ${record.version} 被识别为过期或待索引知识来源。`,
      `${record.reviewer} 执行“${record.action}”，生成审计编号 ${record.auditId}。`,
      `文档升级为 ${record.reviewedVersion}，有效期延至 ${record.validUntil}，并完成 RAG 分块索引。`,
      `引用范围更新为 ${record.references.join('、')}，AI 生产助手和知识治理页读取同一复核记录。`,
    ],
  }
}

function mapOtdEvidenceToReplay(record: OtdEvidenceChainItem): ReplayItem {
  const isCommitmentPackage = record.stage === '客户承诺包'
  const isKittingEvidence = record.stage === '库存齐套'
  const isEquipmentEvidence = record.stage === '设备维护' || record.stage === '设备实证'
  return {
    id: `otd-${record.id}`,
    type: isCommitmentPackage ? '客户承诺包' : isKittingEvidence ? '库存齐套证据' : isEquipmentEvidence ? '设备停机证据' : 'OTD 证据链',
    title: `${record.stage}：${record.title}`,
    summary: record.summary,
    object: record.object,
    actor: record.source,
    evidence: record.traceId,
    time: new Date(record.createdAt).toLocaleString('zh-CN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }),
    status: 'otd',
    traceId: record.traceId,
    risk: isCommitmentPackage
      ? `当前状态：${record.statusLabel}。承诺包只能基于 KPI 钻取、责任动作和 OTD 证据链对外复盘。`
      : isKittingEvidence
        ? `当前状态：${record.statusLabel}。该齐套证据必须同时核对 BOM 版本、可用库存、在途量和排产时间窗，避免缺料工单被误排。`
        : isEquipmentEvidence
          ? `当前状态：${record.statusLabel}。该设备证据必须核对停机时长、影响工单、替代设备、维护窗口和瓶颈保护策略。`
      : `当前状态：${record.statusLabel}。该证据用于证明 ${record.object} 的 OTD 影响已进入复盘口径。`,
    auditState: isCommitmentPackage
      ? 'KPI 钻取、客户承诺、责任动作和报表导出已归档'
      : isKittingEvidence
        ? '库存齐套、BOM 版本、在途量、缺口处置和排产复核已归档'
        : isEquipmentEvidence
          ? '设备停机、替代设备、维护窗口、瓶颈保护和排产复核已归档'
      : 'OTD 复盘证据链已归档，可从治理、审计和报表三处核对',
    steps: isCommitmentPackage
      ? [
          `报表中心从 OTD KPI 多维钻取生成客户承诺包：${record.title}。`,
          `对象 ${record.object} 来自 ${record.source}，承诺摘要：${record.summary}`,
          `追踪编号 ${record.traceId} 写入统一 OTD 证据链。`,
          `AI 生产助手可读取该承诺包回答客户交付恢复口径，报表 CSV 可导出审计编号。`,
        ]
      : isKittingEvidence
        ? [
            `库存齐套读取 ${record.source} 的 BOM 版本、库存可用量、在途量和排产时间窗。`,
            `${record.stage} 阶段生成缺口证据：${record.title}。`,
            `对象 ${record.object} 的齐套摘要：${record.summary}`,
            `追踪编号 ${record.traceId} 写入统一 OTD 证据链，并同步给 AI 排产事件队列。`,
            `当前状态为 ${record.statusLabel}，审计回放要求核对调拨、替代料、采购加急和排产顺序调整是否闭环。`,
          ]
      : isEquipmentEvidence
        ? [
            `设备维护读取 ${record.source} 的停机诊断、可替代设备、维护窗口和瓶颈保护策略。`,
            `${record.stage} 阶段生成停机证据：${record.title}。`,
            `对象 ${record.object} 的排产影响：${record.summary}`,
            `追踪编号 ${record.traceId} 写入统一 OTD 证据链，并同步给 AI 排产事件队列。`,
            `当前状态为 ${record.statusLabel}，审计回放要求核对换设备、延后、加班和拆单建议是否被调度员复核。`,
          ]
      : [
          `${record.stage} 阶段生成证据：${record.title}。`,
          `对象 ${record.object} 来自 ${record.source}，证据摘要：${record.summary}`,
          `追踪编号 ${record.traceId} 写入统一 OTD 证据链。`,
          `当前状态为 ${record.statusLabel}，报表中心 CSV 与审计回放均可核对该记录。`,
        ],
  }
}

function mapQualityRecommendationFeedbackToReplay(record: QualityKnowledgeRecommendationFeedbackRecord): ReplayItem {
  return {
    id: `quality-recommendation-feedback-${record.id}`,
    type: '质量推荐',
    title: `${record.targetWorkOrderId} ${record.operationCode} ${record.trainingSetVersion} 推荐采纳回放`,
    summary: `${record.decisionLabel}，效果趋势 ${record.effectTrendLabel}，下一轮训练集 ${record.nextTrainingSetVersion}。`,
    object: `${record.targetWorkOrderId} / ${record.operationCode}`,
    actor: record.owner,
    evidence: record.auditId,
    time: new Date(record.decidedAt).toLocaleString('zh-CN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }),
    status: 'quality',
    traceId: record.traceId,
    risk: `${record.trainingSetVersion} -> ${record.nextTrainingSetVersion} 已纳入持续学习闭环，下一轮训练追踪 ${record.nextTrainingTraceId}。`,
    auditState: '质量推荐采纳、效果趋势、下一轮训练集候选已归档',
    steps: [
      `${record.trainingSetVersion} 已发布到质量知识复用排序和 AI 推荐链路。`,
      `${record.owner} 记录${record.decisionLabel}：${record.reason}`,
      `效果趋势 ${record.effectTrendLabel}，反馈指标：${record.feedbackMetrics.map(metric => `${metric.label} ${metric.value}`).join(' / ')}。`,
      `${record.nextTrainingSetVersion} 下一轮训练集候选生成，追踪编号 ${record.nextTrainingTraceId}。`,
    ],
  }
}

function mapQualityGrayReleaseDecisionToReplay(record: QualityKnowledgeGrayReleaseDecisionRecord): ReplayItem {
  return {
    id: `quality-gray-release-decision-${record.id}`,
    type: '质量灰度',
    title: `${record.trainingSetVersion} ${record.decisionLabel}回放 · ${record.releaseCycleLabel}`,
    summary: `${record.reason} 审批状态 ${record.approvalLabel}，发布审计 ${record.releaseAuditId}，决策审计 ${record.auditId}。${record.reviewIssueId ? `复核问题单 ${record.reviewIssueId} 当前 ${record.reviewIssueLabel ?? '待复核'}。` : ''}`,
    object: `${record.targetWorkOrderId} / ${record.operationCode}`,
    actor: record.decidedBy,
    evidence: record.auditId,
    time: new Date(record.decidedAt).toLocaleString('zh-CN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }),
    status: 'quality',
    traceId: record.traceId,
    risk: record.decision === 'rolled_back'
      ? `${record.trainingSetVersion} 已从 active 推荐中排除，推荐链路回到 ${record.rollbackTargetVersion ?? 'QK-TRAIN-20260521-R2'}。`
      : record.approvalStatus === 'approved'
        ? `${record.trainingSetVersion} 灰度已确认扩大到 ${record.expansionScope?.join(' / ') ?? '同类 OP-20 装配扭矩推荐'}。`
        : `${record.trainingSetVersion} 灰度扩大仍待质量主管确认，未确认前继续保持受控范围。`,
    auditState: record.decision === 'rolled_back'
      ? '灰度监控、回滚审批、推荐降级和证据链已归档'
      : '灰度监控、扩大审批、推荐范围和证据链已归档',
    steps: [
      `${record.releaseCycleLabel}发布证据：${record.releaseAuditId} / ${record.releaseTraceId}，范围 ${record.releaseScopeLabel}。`,
      `${record.trainingSetVersion} 灰度监控形成指标快照：${record.metricSnapshot.map(metric => `${metric.label} ${metric.value}`).join(' / ')}。`,
      `${record.decidedBy} 执行${record.decisionLabel}，审批状态 ${record.approvalLabel}，审计编号 ${record.auditId}。`,
      ...record.actions,
      ...(record.reviewIssueId
        ? [record.reviewIssueStatus === 'open'
            ? `${record.reviewIssueId} 待复核问题单已打开，追踪编号 ${record.reviewIssueTraceId}。`
            : `${record.reviewIssueId} 复核问题单状态 ${record.reviewIssueLabel ?? '待复核'}，追踪编号 ${record.reviewIssueTraceId}。`]
        : []),
      ...(record.reviewIssueActions ?? []),
      ...(record.reviewIssueValidationAuditId ? [`复核处置审计 ${record.reviewIssueValidationAuditId}，处置追踪 ${record.reviewIssueValidationTraceId}。`] : []),
      `决策追踪编号 ${record.traceId} 已写入 OTD 证据链、Agent 治理和质量推荐页。`,
    ],
  }
}

function mapQualityExperimentCandidateToReplay(record: QualityKnowledgeRecommendationExperimentCandidateRecord): ReplayItem {
  return {
    id: `quality-experiment-candidate-${record.id}`,
    type: '质量实验候选',
    title: `${record.candidateTrainingSetVersion} ${record.statusLabel}回放`,
    summary: `${record.title} 来源 ${record.sourceTrainingSetVersion}，负样本覆盖 ${record.negativeCoverageLabel}（${record.coveragePercentLabel}），${record.gapLabel}。`,
    object: `${record.targetWorkOrderId} / ${record.operationCode}`,
    actor: '知识库管理员 / 质量主管',
    evidence: record.auditId,
    time: '05/21 18:50',
    status: 'quality',
    traceId: record.traceId,
    risk: `${record.candidateTrainingSetVersion} 未通过 ${record.gatePolicyLabel} 前不得进入主动推荐扩大。`,
    auditState: '实验回滚、负样本覆盖率、下一轮候选和影子验证策略已归档',
    steps: [
      `${record.sourceTrainingSetVersion} 回滚审计 ${record.sourceAuditId} / ${record.sourceTraceId} 触发候选生成。`,
      `指标快照：推荐采纳率 ${record.adoptionRateLabel} / 复验通过率 ${record.recheckPassRateLabel} / 负样本误召回 ${record.falseRecallLabel}。`,
      `负样本覆盖 ${record.negativeCoverageLabel}，覆盖率 ${record.coveragePercentLabel}，${record.gapLabel}。`,
      `候选审计 ${record.auditId} / ${record.traceId}；${record.nextAction}`,
      `引用证据：${record.references.join('；')}`,
    ],
  }
}

function mapQualityGrayReleaseMonitorToReplay(record: QualityKnowledgeGrayReleaseMonitorRecord): ReplayItem {
  const releaseCycleLabel = qualityKnowledgeGrayReleaseCycleLabel(record)
  return {
    id: `quality-gray-release-monitor-${record.id}`,
    type: '质量灰度发布',
    title: `${record.trainingSetVersion} ${releaseCycleLabel}回放`,
    summary: `${record.trainingSetVersion} ${releaseCycleLabel}进入 ${record.scopeLabel}；${record.summary}`,
    object: `${record.targetWorkOrderId} / ${record.operationCode}`,
    actor: '知识库管理员 / 质量主管',
    evidence: record.auditId,
    time: record.publishedAt
      ? new Date(record.publishedAt).toLocaleString('zh-CN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })
      : '-',
    status: 'quality',
    traceId: record.traceId,
    risk: releaseCycleLabel === '重新灰度发布'
      ? `${record.trainingSetVersion} 已在调整范围并重新校验后恢复灰度推荐，旧回滚问题单不再阻断本轮 active 选择。`
      : `${record.trainingSetVersion} 首次进入受控灰度范围，继续监控推荐采纳、复验通过和负样本误召回。`,
    auditState: `${releaseCycleLabel}审计、灰度范围、监控指标和回滚目标已归档`,
    steps: [
      `${record.trainingSetVersion} 完成${releaseCycleLabel}，发布审计 ${record.auditId}。`,
      `灰度范围：${record.scopeLabel}，版本策略：${record.versionLabel}。`,
      `灰度范围明细：${record.recommendationScope.join(' / ')}。`,
      `监控指标：推荐采纳率 ${record.adoptionRateLabel} / 复验通过率 ${record.recheckPassRateLabel} / 负样本误召回 ${record.falseRecallLabel}。`,
      `发布追踪编号 ${record.traceId} 已进入报表灰度监控、Agent 治理和 OTD 证据链。`,
    ],
  }
}

function mapPocReviewSignoffToReplay(record: PocReviewSignoffRecord): ReplayItem {
  return {
    id: record.id,
    type: 'POC 签署',
    title: 'POC 复盘会评分表签署',
    summary: `${record.targetCustomer} POC 评分 ${record.totalScore}/${record.passScore}，${record.summary}`,
    object: record.meetingId,
    actor: record.signedBy,
    evidence: record.auditId,
    time: new Date(record.signedAt).toLocaleString('zh-CN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }),
    status: 'signoff',
    traceId: record.auditId,
    risk: 'POC 已通过签署，后续交付需以本次证据包和评分表作为验收基线。',
    auditState: 'POC 评分、证据批次、签署人和复盘结论已归档',
    steps: [
      `${record.meetingId} 复盘会确认目标客户：${record.targetCustomer}。`,
      `评分结果 ${record.totalScore} / 100，通过线 ${record.passScore} 分。`,
      `核对证据批次：${record.evidenceBatches.join('、')}。`,
      `${record.reviewers.join('、')} 参与复盘，${record.signedBy} 完成签署，审计编号 ${record.auditId}。`,
    ],
  }
}

function mapConfigApprovalToReplay(record: AgentConfigApprovalRecord): ReplayItem {
  const statusLabel = approvalStatusLabel(record.status)
  const policyObject = record.policyArea === 'quality'
    ? '质量推荐实验扩大门禁'
    : record.configKey
  const policyScopeLabel = record.policyArea === 'quality'
    ? '质量推荐实验策略'
    : 'Agent 排产建议'
  const policyMetricSteps = record.policyMetrics?.length
    ? [`门禁指标调整：${record.policyMetrics.map(metric => `${metric.label} ${metric.fromValue} -> ${metric.toValue}`).join(' / ')}。`]
    : []
  const finalStep = record.status === 'approved'
    ? `${record.decidedBy ?? record.owner} 审批通过，${record.configKey} 从 ${record.fromValue} 生效为 ${record.toValue}。`
    : record.status === 'rejected'
      ? `${record.decidedBy ?? record.owner} 驳回变更，${record.configKey} 继续保持 ${record.fromValue}。`
      : `变更仍处于${statusLabel}状态，当前 Agent 继续使用 ${record.fromValue}。`

  return {
    id: `config-${record.id}`,
    type: '配置审批',
    title: `配置审批：${record.replayTitle}`,
    summary: `${record.configKey} ${record.fromValue} -> ${record.toValue}，当前状态：${statusLabel}。`,
    object: policyObject,
    actor: record.decidedBy ? `${record.submittedBy} / ${record.decidedBy}` : record.submittedBy,
    evidence: record.auditId,
    time: new Date(record.decidedAt ?? record.submittedAt).toLocaleString('zh-CN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }),
    status: 'approval',
    traceId: record.auditId,
    risk: record.risk,
    auditState: record.status === 'approved'
      ? '关键配置审批通过，变更已进入配置审计'
      : record.status === 'rejected'
        ? '关键配置审批驳回，原策略继续生效'
        : `关键配置仍在审批链路中，未影响${policyScopeLabel}`,
    steps: [
      `${record.submittedBy} 提交 ${record.configKey} 变更：${record.fromValue} -> ${record.toValue}。`,
      `系统识别为影响${policyScopeLabel}的关键配置，生成审计编号 ${record.auditId}。`,
      `审批责任人：${record.owner}；业务原因：${record.reason}`,
      ...policyMetricSteps,
      ...(record.controlSummary ? [record.controlSummary] : []),
      finalStep,
    ],
  }
}

const approvals = computed<ApprovalItem[]>(() => configApprovals.value.map(record => ({
  id: record.id,
  title: record.title,
  reason: record.reason,
  owner: record.owner,
  status: approvalStatusLabel(record.status),
})))

const selectedId = ref(baseReplayItems[0].id)

const selectedItem = computed(() => replayItems.value.find(item => item.id === selectedId.value) || replayItems.value[0])
const pendingApprovalCount = computed(() => configApprovals.value.filter(item => isApprovalOpen(item.status)).length)
const metrics = computed(() => [
  { label: 'AI 建议留痕', value: replayItems.value.filter(item => item.type === 'AI 建议').length },
  { label: '助手动作审计', value: replayItems.value.filter(item => item.type === 'AI 助手动作').length },
  { label: '重排动作回放', value: replayItems.value.filter(item => item.type === '重排动作').length },
  { label: 'POC 证据回放', value: replayItems.value.filter(item => item.type === 'POC 证据').length },
  { label: '知识治理回放', value: replayItems.value.filter(item => item.type === '知识治理').length },
  { label: '质量推荐回放', value: replayItems.value.filter(item => item.type === '质量推荐').length },
  { label: '质量实验候选', value: replayItems.value.filter(item => item.type === '质量实验候选').length },
  { label: '质量灰度回放', value: replayItems.value.filter(item => item.type === '质量灰度').length },
  { label: '质量灰度发布', value: replayItems.value.filter(item => item.type === '质量灰度发布').length },
  { label: '客户承诺包', value: replayItems.value.filter(item => item.type === '客户承诺包').length },
  { label: '库存齐套回放', value: replayItems.value.filter(item => item.type === '库存齐套证据').length },
  { label: '设备停机回放', value: replayItems.value.filter(item => item.type === '设备停机证据').length },
  { label: 'OTD 证据回放', value: replayItems.value.filter(item => item.type === 'OTD 证据链').length },
  { label: 'POC 复盘签署', value: replayItems.value.filter(item => item.type === 'POC 签署').length },
  { label: '配置审批中', value: pendingApprovalCount.value },
  { label: '证据链覆盖', value: '100%' },
])

onMounted(() => {
  qualityCapaClosure.value = readQualityCapaClosure()
  assistantActionAudits.value = readAssistantActionAudits()
  pocEvidenceRecords.value = readPocEvidenceGovernanceRecords()
  configApprovals.value = readAgentConfigApprovals()
  pocReviewSignoff.value = readPocReviewSignoffRecord()
  otdEvidenceRecords.value = readOtdEvidenceChainRecords()
  knowledgeReviewRecords.value = readKnowledgeGovernanceReviews()
  qualityRecommendationFeedbackRecords.value = readQualityKnowledgeRecommendationFeedbackRecords()
  qualityRetrainingVersionRecords.value = readQualityKnowledgeRetrainingVersionRecords()
  qualityGrayReleaseDecisionRecords.value = readQualityKnowledgeGrayReleaseDecisionRecords()
  if (qualityCapaClosure.value) selectedId.value = 'quality-capa-closure'
  else if (qualityExperimentCandidateRecords.value[0]) selectedId.value = `quality-experiment-candidate-${qualityExperimentCandidateRecords.value[0].id}`
  else if (qualityGrayReleaseMonitorRecords.value[0]) selectedId.value = `quality-gray-release-monitor-${qualityGrayReleaseMonitorRecords.value[0].id}`
  else if (qualityGrayReleaseDecisionRecords.value[0]) selectedId.value = `quality-gray-release-decision-${qualityGrayReleaseDecisionRecords.value[0].id}`
  else if (qualityRecommendationFeedbackRecords.value[0]) selectedId.value = `quality-recommendation-feedback-${qualityRecommendationFeedbackRecords.value[0].id}`
  else if (knowledgeReviewRecords.value[0]) selectedId.value = knowledgeReviewRecords.value[0].id
  else if (otdEvidenceRecords.value.find(item => item.stage === '客户承诺包')) selectedId.value = `otd-${otdEvidenceRecords.value.find(item => item.stage === '客户承诺包')?.id}`
  else if (otdEvidenceRecords.value[0]) selectedId.value = `otd-${otdEvidenceRecords.value[0].id}`
  else if (pocReviewSignoff.value) selectedId.value = pocReviewSignoff.value.id
  else if (pocEvidenceRecords.value[0]) selectedId.value = pocEvidenceRecords.value[0].id
  else if (assistantActionAudits.value[0]) selectedId.value = assistantActionAudits.value[0].id
})
</script>

<style scoped>
.audit-replay-panel {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 16px;
  padding: 14px;
  border: 1px solid #c7d2fe;
  border-radius: 8px;
  background: #f8faff;
}

.replay-heading,
.detail-title,
.approval-row {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: flex-start;
}

.eyebrow {
  display: block;
  margin-bottom: 3px;
  color: #4338ca;
  font-size: 12px;
  font-weight: 700;
}

h3,
h4,
p,
ol {
  margin: 0;
}

h3 {
  color: #111827;
  font-size: 16px;
}

.approval-badge {
  flex: 0 0 auto;
  padding: 5px 10px;
  border: 1px solid #fed7aa;
  border-radius: 4px;
  background: #fff7ed;
  color: #c2410c;
  font-size: 12px;
  font-weight: 700;
}

.replay-metrics,
.decision-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.metric-chip {
  min-width: 132px;
  padding: 8px 10px;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  background: #fff;
}

.metric-chip strong {
  display: block;
  color: #111827;
  font-size: 18px;
}

.metric-chip span,
.decision-card p,
.decision-meta span,
.trace-footer span,
.approval-row p,
.approval-row span,
.approval-row em {
  color: #4b5563;
  font-size: 12px;
  line-height: 1.45;
}

.replay-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
}

.decision-card {
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-height: 202px;
  padding: 11px;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  background: #fff;
}

.decision-card.accepted {
  border-color: #bbf7d0;
}

.decision-card.executed {
  border-color: #bae6fd;
}

.decision-card.approval {
  border-color: #fed7aa;
}

.decision-card.assistant {
  border-color: #c4b5fd;
}

.decision-card.evidence {
  border-color: #86efac;
}

.decision-card.signoff {
  border-color: #22c55e;
  background: #f0fdf4;
}

.decision-card.otd {
  border-color: #93c5fd;
  background: #f8fbff;
}

.decision-card.knowledge {
  border-color: #5eead4;
  background: #f0fdfa;
}

.decision-card.quality {
  border-color: #a7f3d0;
  background: #f0fdf4;
}

.decision-topline {
  display: flex;
  justify-content: space-between;
  gap: 8px;
}

.decision-topline span,
.decision-meta span,
.detail-title span {
  padding: 2px 6px;
  border-radius: 4px;
  background: #f3f4f6;
  color: #4b5563;
  font-size: 12px;
}

.decision-topline strong {
  color: #6b7280;
  font-size: 12px;
  font-weight: 600;
}

.decision-card h4,
.approval-lane h4,
.detail-title h4,
.approval-row strong {
  color: #111827;
  font-size: 14px;
}

.replay-btn {
  margin-top: auto;
  padding: 6px 10px;
  border: 1px solid #4f46e5;
  border-radius: 4px;
  background: #4f46e5;
  color: #fff;
  cursor: pointer;
  font-size: 12px;
  font-weight: 700;
}

.replay-detail,
.approval-lane {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 12px;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  background: #fff;
}

.replay-detail ol {
  display: grid;
  gap: 6px;
  padding-left: 18px;
}

.replay-detail li {
  color: #374151;
  font-size: 12px;
  line-height: 1.45;
}

.trace-footer {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.approval-row {
  padding: 9px;
  border: 1px solid #f3f4f6;
  border-radius: 6px;
  background: #fafafa;
}

.approval-row em {
  flex: 0 0 auto;
  padding: 3px 7px;
  border-radius: 4px;
  background: #fff7ed;
  color: #c2410c;
  font-style: normal;
  font-weight: 700;
}

@media (max-width: 1180px) {
  .replay-grid {
    grid-template-columns: 1fr;
  }
}
</style>
