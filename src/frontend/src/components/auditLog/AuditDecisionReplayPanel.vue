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
  const isAnomalyCard = record.type === 'create_anomaly_card'
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
        : isAnomalyCard
          ? '助手异常处置卡已同步异常管理、风险队列、AI 排产和 OTD 证据链，可追溯现场处置责任。'
          : '助手动作已进入审计回放，后续可追溯执行人与入口。'
      : '权限阻断已留痕，未改变业务数据。',
    auditState: record.permitted
      ? isRecoveryPackage
        ? 'AI 助手意图、权限校验、跨模块执行包和 OTD 证据已归档'
        : isAnomalyCard
          ? 'AI 助手意图、权限校验、异常处置卡、风险和排产证据已归档'
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
      : isAnomalyCard
        ? [
            `AI 生产助手识别可执行意图：${record.label}。`,
            `当前用户 ${record.actor} 以 ${record.role} 角色触发动作，系统完成权限校验。`,
            `${statusText}，${routeText}。`,
            '异常处置卡已写入异常管理现场事件中心，并分解为风险升级、AI 排产冻结复核和设备维护确认。',
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

function mapBarcodeReworkReleaseEvidenceToReplay(record: OtdEvidenceChainItem): ReplayItem {
  let risk = '返工复验放行后，OP-20 接收、排产回写和标签状态必须同步。'
  let steps: string[] = []

  switch (record.stage) {
    case '质量复验':
      risk = '返工复验合格后可继续释放 OP-20 接收，但必须确认交接释放、排产回写和标签解冻同步完成。'
      steps = [
        `质量闭环读取 ${record.source} 的扫码返工冻结、复验结论和下道接收条件。`,
        `追踪编号 ${record.traceId} 对应的复验结果已确认，允许进入交接释放。`,
        `复验结论写入统一 OTD 证据链，并同步给交接释放、排产回写和标签状态。`,
        `当前状态为 ${record.statusLabel}，审计回放要求核对复验结果、冻结解除和后续排产窗口是否一致。`,
      ]
      break
    case '交接释放':
      risk = 'OP-20 接收已放行，但仍需确认排产回写和标签解冻是否同步完成。'
      steps = [
        `质量闭环读取 ${record.source} 的复验放行结果和 OP-20 接收冻结。`,
        `追踪编号 ${record.traceId} 已解冻 OP-20 接收并恢复下道交接。`,
        `交接释放结果同步给排产回写和标签状态，避免单点放行后留下未回写窗口。`,
        `当前状态为 ${record.statusLabel}，审计回放要求核对接收数量、窗口恢复和实物标签是否一致。`,
      ]
      break
    case '排产回写':
      risk = '排产窗口已恢复，但仍需确认标签状态和交接释放与同一条复验链同步。'
      steps = [
        `AI 排产读取 ${record.source} 的交接释放结果和返工复验耗时。`,
        `追踪编号 ${record.traceId} 已把 OP-20 接收窗口回写为可排。`,
        `排产恢复信息同步给标签状态和审计回放，保留复验耗时口径。`,
        `当前状态为 ${record.statusLabel}，审计回放要求核对窗口、节拍和 OTD 复盘口径是否一致。`,
      ]
      break
    case '标签状态':
    default:
      risk = '标签解冻已完成，但必须与交接释放和排产回写保持同源。'
      steps = [
        `条码 / QR 打印读取 ${record.source} 的复验放行结果和流转卡绑定状态。`,
        `追踪编号 ${record.traceId} 已把流转卡标签从质量冻结更新为复验放行。`,
        `标签状态同步给交接释放和排产回写，现场扫码可以继续进入 OP-20 接收确认。`,
        `当前状态为 ${record.statusLabel}，审计回放要求核对现场标签、接收状态和排产窗口是否一致。`,
      ]
      break
  }

  return {
    id: `otd-${record.id}`,
    type: '质量复验释放证据',
    title: `${record.stage}：${record.title}`,
    summary: record.summary,
    object: record.object,
    actor: record.source,
    evidence: record.traceId,
    time: new Date(record.createdAt).toLocaleString('zh-CN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }),
    status: 'otd',
    traceId: record.traceId,
    risk,
    auditState: '返工复验、交接释放、排产回写和标签状态已归档',
    steps,
  }
}

function mapOutsourcingCommitmentToReplay(record: OtdEvidenceChainItem): ReplayItem {
  return {
    id: `otd-${record.id}`,
    type: '外协承诺包',
    title: `外协承诺包：${record.title}`,
    summary: record.summary,
    object: record.object,
    actor: record.source,
    evidence: record.traceId,
    time: new Date(record.createdAt).toLocaleString('zh-CN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }),
    status: 'otd',
    traceId: record.traceId,
    risk: '外协承诺已锁定，但仍属于厂外等待，不应计为厂内恢复。',
    auditState: '外协承诺、计划复核和厂外等待口径已归档',
    steps: [
      `报表中心从 OTD KPI 多维钻取生成外协承诺包：${record.title}。`,
      `对象 ${record.object} 来自 ${record.source}，承诺摘要：${record.summary}`,
      `追踪编号 ${record.traceId} 对应的原始 KPI 证据追踪号已同步写入统一 OTD 证据链，必须保留厂外等待口径。`,
      'AI 排产可读取该承诺包生成外协复核建议，但不能把厂外等待误判为厂内恢复。',
    ],
  }
}

function mapOutsourcingReceiptToReplay(record: OtdEvidenceChainItem): ReplayItem {
  return {
    id: `otd-${record.id}`,
    type: '采购收货证据',
    title: `外协到货：${record.title}`,
    summary: record.summary,
    object: record.object,
    actor: record.source,
    evidence: record.traceId,
    time: new Date(record.createdAt).toLocaleString('zh-CN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }),
    status: 'otd',
    traceId: record.traceId,
    risk: '外协到货已确认，仍需由 AI 排产复核释放窗口和后续工序承诺。',
    auditState: '外协到货、采购确认、排产释放复核和 OTD 口径已归档',
    steps: [
      `采购协同确认外协到货：${record.title}。`,
      `对象 ${record.object} 来自 ${record.source}，到货摘要：${record.summary}`,
      `追踪编号 ${record.traceId} 写入统一 OTD 证据链，原外协承诺追踪 ${record.sourceTraceId ?? '已同步'} 保留为前置证据。`,
      'AI 排产可关闭厂外等待口径，并按到货后最早可执行窗口复核释放排产。',
    ],
  }
}

function mapOutsourcingScheduleReleaseToReplay(record: OtdEvidenceChainItem): ReplayItem {
  return {
    id: `otd-${record.id}`,
    type: '排产释放证据',
    title: `外协排产释放：${record.title}`,
    summary: record.summary,
    object: record.object,
    actor: record.source,
    evidence: record.traceId,
    time: new Date(record.createdAt).toLocaleString('zh-CN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }),
    status: 'otd',
    traceId: record.traceId,
    risk: '外协到货已由 AI 排产采纳释放，审计需确认厂外等待口径已关闭且未误计为厂内提前恢复。',
    auditState: '外协承诺、采购到货、排产采纳、厂外等待口径关闭和 OTD 口径已归档',
    steps: [
      `AI 排产采纳外协释放建议：${record.title}。`,
      `对象 ${record.object} 来自 ${record.source}，释放摘要：${record.summary}`,
      `追踪编号 ${record.traceId} 写入统一 OTD 证据链，前置外协到货追踪 ${record.sourceTraceId ?? '已同步'} 保留为来源证据。`,
      '审计回放要求核对外协承诺、采购到货、排产采纳、厂外等待口径关闭和 OTD 口径归档是否连续闭环。',
    ],
  }
}

function mapOtdEvidenceToReplay(record: OtdEvidenceChainItem): ReplayItem {
  const isCommitmentPackage = record.stage === '客户承诺包'
  const isOutsourcingCommitment = record.stage === '外协承诺'
  const isOutsourcingReceipt = record.stage === '外协到货'
  const isOutsourcingScheduleRelease = record.stage === '外协排产释放'
  const isKittingEvidence = record.stage === '库存齐套'
  const isEquipmentEvidence = record.stage === '设备维护' || record.stage === '设备实证'
  const isProductionAnomalyEvidence = record.stage === '生产异常'
  const isProductionCompletionEvidence = record.stage === '生产完工'
  const isProductionCloseoutEvidence = record.stage === '生产复核'
  const isShopfloorSituationEvidence = record.stage === '现场态势'
  const isShopfloorEscalationEvidence = record.stage === '现场处置包'
  const isAnomalyDispatchEvidence = record.stage === '异常分流'
  const isRiskSlaReviewEvidence = record.stage === '风险 SLA 复核'
  const isAssistantQualityEvidence = record.stage === '助手质量回写'
  const isBarcodeExecutionEvidence = record.stage === '扫码执行'
  const isBarcodeCompletionEvidence = record.stage === '扫码完工'
  const isBarcodeMaterialEvidence = record.stage === '物料消耗'
  const isBarcodeQualityGateEvidence = record.stage === '质量门'
  const isBarcodeHandoffEvidence = record.stage === '工序交接'
  const isBarcodeReworkReleaseEvidence = [
    'TRACE-QR-WO-RUSH-9001-OP-10-RECHECK',
    'TRACE-QR-WO-RUSH-9001-OP-10-RELEASE-OP-20',
    'TRACE-QR-WO-RUSH-9001-OP-10-SCHEDULE-RELEASE',
    'TRACE-QR-WO-RUSH-9001-OP-10-LABEL-RELEASE',
  ].includes(record.traceId)
  const isEngineeringConstraintEvidence = record.stage === '工程约束' || record.stage === '工程放行'
  const isEngineeringChangeEvidence = record.stage === '工程变更影响' || record.stage === '工程变更批准' || record.stage === '工程变更驳回'
  const isRouteCapabilityEvidence = record.stage === '工艺能力校验' || record.stage === '工艺能力放行'
  const isPurchaseReceiptEvidence = record.stage === '采购回写' || record.stage === '供应到货' || isOutsourcingReceipt
  const isSupplyRiskEvidence = record.stage === '供应风险'
  const isSupplierNetworkEvidence = record.stage === '供应网络'
  const isPurchaseCorrectionEvidence = record.stage === '采购整改'
  const isLaborCapabilityEvidence = record.stage === '人员能力'
  const isLaborAssignmentEvidence = record.stage === '人员替班' || record.stage === '人员复核' || record.stage === '人员放行'
  const isLaborBlockEvidence = record.stage === '人员阻断'
  const isLaborStartEvidence = record.stage === '生产开工'
  if (isBarcodeReworkReleaseEvidence) return mapBarcodeReworkReleaseEvidenceToReplay(record)
  if (isOutsourcingCommitment) return mapOutsourcingCommitmentToReplay(record)
  if (isOutsourcingReceipt) return mapOutsourcingReceiptToReplay(record)
  if (isOutsourcingScheduleRelease) return mapOutsourcingScheduleReleaseToReplay(record)
  if (isProductionAnomalyEvidence) return mapProductionAnomalyEvidenceToReplay(record)
  return {
    id: `otd-${record.id}`,
    type: isCommitmentPackage
      ? '客户承诺包'
      : isOutsourcingCommitment
        ? '外协承诺包'
      : isKittingEvidence
        ? '库存齐套证据'
      : isEquipmentEvidence
        ? '设备停机证据'
        : isProductionCompletionEvidence
          ? '生产完工证据'
          : isProductionCloseoutEvidence
            ? '生产复核证据'
            : isShopfloorSituationEvidence
              ? '现场态势证据'
              : isShopfloorEscalationEvidence
                ? '现场处置证据'
                : isAnomalyDispatchEvidence
                  ? '异常分流证据'
                  : isRiskSlaReviewEvidence
                    ? '风险SLA证据'
                    : isAssistantQualityEvidence
                      ? '助手质量责任证据'
                    : isBarcodeExecutionEvidence
                      ? '扫码执行证据'
                      : isBarcodeCompletionEvidence
                        ? '扫码完工证据'
                        : isBarcodeMaterialEvidence
                          ? '扫码物料证据'
                          : isBarcodeQualityGateEvidence
                            ? '扫码质量门证据'
                            : isBarcodeHandoffEvidence
                              ? '扫码交接证据'
                              : isEngineeringConstraintEvidence
                                ? '工程约束证据'
                                : isEngineeringChangeEvidence
                                  ? '工程变更证据'
                                  : isRouteCapabilityEvidence
                                    ? '工艺能力证据'
                                    : isPurchaseReceiptEvidence
                                      ? '采购收货证据'
                                      : isSupplyRiskEvidence
                                        ? '供应风险证据'
                                        : isSupplierNetworkEvidence
                                          ? '供应网络证据'
                                          : isPurchaseCorrectionEvidence
                                            ? '采购整改证据'
                                            : isLaborCapabilityEvidence
                                              ? '人员能力证据'
                                              : isLaborAssignmentEvidence
                                                ? '人员替班证据'
                                                : isLaborBlockEvidence
                                                  ? '人员阻断证据'
                                                  : isLaborStartEvidence
                                                    ? '人员开工证据'
                                                    : 'OTD 证据链',
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
      : isOutsourcingCommitment
        ? `当前状态：${record.statusLabel}。外协承诺只能说明外部供应窗口已锁定，不能替代厂内恢复。`
      : isKittingEvidence
        ? `当前状态：${record.statusLabel}。该齐套证据必须同时核对 BOM 版本、可用库存、在途量和排产时间窗，避免缺料工单被误排。`
        : isEquipmentEvidence
          ? `当前状态：${record.statusLabel}。该设备证据必须核对停机时长、影响工单、替代设备、维护窗口和瓶颈保护策略。`
          : isProductionCompletionEvidence
            ? `当前状态：${record.statusLabel}。该生产证据必须核对完工数量、工单进度、质量门、后续工序窗口和 OTD 承诺。`
            : isProductionCloseoutEvidence
              ? `当前状态：${record.statusLabel}。该生产复核证据必须核对完工回写、排产页复核、质量门放行和承诺交期是否仍成立。`
          : isShopfloorSituationEvidence
            ? `当前状态：${record.statusLabel}。该现场态势证据必须核对瓶颈负载、齐套缺口、质量返工、责任人、动作入口和排产影响。`
              : isShopfloorEscalationEvidence
                ? `当前状态：${record.statusLabel}。该现场处置证据必须核对生产经理审批、风险队列、AI 排产分流、物料/质量复核和关闭留痕。`
                : isAnomalyDispatchEvidence
                  ? `当前状态：${record.statusLabel}。该异常分流证据必须核对异常来源、影响工单、风险队列、AI 排产复核、责任人和下游质量/设备/物料处置。`
                  : isRiskSlaReviewEvidence
                    ? `当前状态：${record.statusLabel}。该风险 SLA 证据必须核对逾期风险、关键风险、晨会编号、责任动作、排产保护、采购承诺和设备窗口。`
                    : isAssistantQualityEvidence
                      ? `当前状态：${record.statusLabel}。该助手质量回写必须核对首件检验、OP-20 扭矩复核窗口、执行包追踪和排产释放条件。`
                    : isBarcodeExecutionEvidence
                      ? `当前状态：${record.statusLabel}。该扫码执行证据必须核对扫码对象、现场入口、执行人、下一核对点、生产报工入口和排产影响复核。`
                      : isBarcodeCompletionEvidence
                        ? `当前状态：${record.statusLabel}。该扫码完工证据必须核对扫码开工追踪、完工数量、不良数量、质检结论和 OTD 达成状态。`
                        : isBarcodeMaterialEvidence
                          ? `当前状态：${record.statusLabel}。该扫码物料证据必须核对物料批次、BOM 用量、齐套状态、质量追溯和完工记录绑定关系。`
                          : isBarcodeQualityGateEvidence
                            ? `当前状态：${record.statusLabel}。该扫码质量门证据必须核对首件尺寸复检、Ra 粗糙度抽检、不良数量、放行结论和下道交接条件。`
                            : isBarcodeHandoffEvidence
                              ? `当前状态：${record.statusLabel}。该扫码交接证据必须核对上道完工、物料消耗、质量门放行、下道接收数量和待开工状态。`
                              : isEngineeringConstraintEvidence
                                ? `当前状态：${record.statusLabel}。该工程证据必须核对 BOM/工艺路线版本、替代料放行、质量门、人员/设备能力和排产可用窗口。`
                                : isEngineeringChangeEvidence
                                  ? `当前状态：${record.statusLabel}。该 ECN 证据必须核对库存缺口、替代料可用量、质量门、供应批次、成本影响和 OTD 模拟/释放结论。`
                                  : isRouteCapabilityEvidence
                                    ? `当前状态：${record.statusLabel}。该工艺证据必须核对瓶颈资源、候选设备/外协、能力缺口、合批窗口和排产释放条件。`
                                    : isPurchaseReceiptEvidence
                                      ? `当前状态：${record.statusLabel}。该采购收货证据必须核对 PO/替代供应商、到货数量、齐套缺口、影响工单和排产释放条件。`
                                      : isSupplyRiskEvidence
                                        ? `当前状态：${record.statusLabel}。该供应风险证据必须核对原供应商延期、替代供应商承诺、受影响工单和排产保护建议。`
                                        : isSupplierNetworkEvidence
                                          ? `当前状态：${record.statusLabel}。该供应网络证据必须核对供应商绩效、准交率、SLA、报价/产能和违约复盘。`
                                          : isPurchaseCorrectionEvidence
                                            ? `当前状态：${record.statusLabel}。该采购整改证据必须核对来料异常、8D 承诺、备用批次、复检入库和排产复核。`
                                            : isLaborCapabilityEvidence
                                              ? `当前状态：${record.statusLabel}。该人员能力证据必须核对技能、资质有效期、排班窗口、可用工时和开工约束。`
                                              : isLaborAssignmentEvidence
                                                ? `当前状态：${record.statusLabel}。该替班证据必须核对临期资质、候选评分、替班人员、主管复核和放行窗口。`
                                                : isLaborBlockEvidence
                                                  ? `当前状态：${record.statusLabel}。该人员阻断证据必须核对无有效候选、停工复核责任人、阻断工序和恢复条件。`
                                                  : isLaborStartEvidence
                                                    ? `当前状态：${record.statusLabel}。该开工证据必须核对替班执行人、工位设备、工程复核和生产开工放行。`
      : `当前状态：${record.statusLabel}。该证据用于证明 ${record.object} 的 OTD 影响已进入复盘口径。`,
    auditState: isCommitmentPackage
      ? 'KPI 钻取、客户承诺、责任动作和报表导出已归档'
      : isOutsourcingCommitment
        ? '外协承诺、排产复核和厂外等待口径已归档'
      : isKittingEvidence
        ? '库存齐套、BOM 版本、在途量、缺口处置和排产复核已归档'
        : isEquipmentEvidence
          ? '设备停机、替代设备、维护窗口、瓶颈保护和排产复核已归档'
          : isProductionCompletionEvidence
            ? '生产完工、工单进度、质量联动、排产复核和 OTD 证据已归档'
            : isProductionCloseoutEvidence
              ? '完工复核、排产窗口、质量门和承诺交期已归档'
          : isShopfloorSituationEvidence
            ? '现场态势、事件来源、责任人、动作入口和排产影响已归档'
              : isShopfloorEscalationEvidence
                ? '现场处置包、生产经理审批、排产分流、风险关闭和跨模块回写已归档'
                : isAnomalyDispatchEvidence
                  ? '异常确认、风险队列、AI 排产复核、责任人和下游处置已归档'
                  : isRiskSlaReviewEvidence
                    ? '风险 SLA 晨会、逾期风险、责任动作、闭环追踪和 OTD 恢复已归档'
                    : isAssistantQualityEvidence
                      ? '助手执行包、首件检验、质量复核窗口和排产释放条件已归档'
                    : isBarcodeExecutionEvidence
                      ? '扫码对象、现场入口、执行人、下一核对点和生产入口已归档'
                      : isBarcodeCompletionEvidence
                        ? '扫码开工追踪、完工数量、质检结论和 OTD 达成状态已归档'
                        : isBarcodeMaterialEvidence
                          ? '物料批次、BOM 用量、齐套状态、质量追溯和完工绑定已归档'
                          : isBarcodeQualityGateEvidence
                            ? '首件复检、粗糙度抽检、不良数量、放行结论和交接条件已归档'
                            : isBarcodeHandoffEvidence
                              ? '上道完工、物料消耗、质量门放行、下道接收和待开工状态已归档'
                              : isEngineeringConstraintEvidence
                                ? '工程约束来源、替代料放行、质量门、能力口径和排产复核已归档'
                                : isEngineeringChangeEvidence
                                  ? '工程变更影响、审批结论、质量门、成本供应和排产模拟/释放已归档'
                                  : isRouteCapabilityEvidence
                                    ? '工艺能力校验、瓶颈资源、分流合批、外协兜底和排产复核已归档'
                                    : isPurchaseReceiptEvidence
                                      ? '采购收货、齐套缺口、替代到货、排产释放和 OTD 证据已归档'
                                      : isSupplyRiskEvidence
                                        ? '供应延期、替代承诺、排产保护、责任复核和 OTD 证据已归档'
                                        : isSupplierNetworkEvidence
                                          ? '供应商绩效、SLA 选优、违约复盘、二供观察和排产复核已归档'
                                          : isPurchaseCorrectionEvidence
                                            ? '来料异常、供应商 8D、备用批次、复检入库和排产复核已归档'
                                            : isLaborCapabilityEvidence
                                              ? '人员技能、资质、排班、可用工时和开工约束已归档'
                                              : isLaborAssignmentEvidence
                                                ? '临期资质、替班评分、主管复核、补证放行和排产复核已归档'
                                                : isLaborBlockEvidence
                                                  ? '无有效候选、停工复核、阻断工序、责任人和恢复条件已归档'
                                                  : isLaborStartEvidence
                                                    ? '替班执行、工位设备、工程复核、生产开工和 OTD 证据已归档'
      : 'OTD 复盘证据链已归档，可从治理、审计和报表三处核对',
    steps: isCommitmentPackage
      ? [
          `报表中心从 OTD KPI 多维钻取生成客户承诺包：${record.title}。`,
          `对象 ${record.object} 来自 ${record.source}，承诺摘要：${record.summary}`,
          `追踪编号 ${record.traceId} 写入统一 OTD 证据链。`,
          `AI 生产助手可读取该承诺包回答客户交付恢复口径，报表 CSV 可导出审计编号。`,
        ]
      : isOutsourcingCommitment
        ? [
            `报表中心从 OTD KPI 多维钻取生成外协承诺包：${record.title}。`,
            `对象 ${record.object} 来自 ${record.source}，承诺摘要：${record.summary}`,
            `追踪编号 ${record.traceId} 写入统一 OTD 证据链，原始 KPI 追踪已同步保留外部约束口径。`,
            `AI 排产可读取该承诺包生成外协复核建议，但不会把厂外等待误判为厂内恢复。`,
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
      : isProductionCompletionEvidence
        ? [
            `生产报工读取 ${record.source} 的完工数量、工单进度、质量结果和后续工序窗口。`,
            `${record.stage} 阶段生成执行证据：${record.title}。`,
            `对象 ${record.object} 的执行摘要：${record.summary}`,
            `追踪编号 ${record.traceId} 写入统一 OTD 证据链，并同步给 AI 排产事件队列。`,
            `当前状态为 ${record.statusLabel}，审计回放要求核对排产页复核、质量门放行和承诺交期是否仍成立。`,
          ]
      : isProductionCloseoutEvidence
        ? [
            `生产报工读取 ${record.source} 的完工回写、排产页复核、质量门和承诺交期。`,
            `${record.stage} 阶段生成完工复核证据：${record.title}。`,
            `对象 ${record.object} 的复核摘要：${record.summary}`,
            `追踪编号 ${record.traceId} 写入统一 OTD 证据链，并同步给排产复核、报表和审计回放。`,
            `当前状态为 ${record.statusLabel}，审计回放要求核对完工回写、排产页复核、质量门放行和承诺交期是否仍成立。`,
          ]
      : isShopfloorSituationEvidence
        ? [
            `实时监控读取 ${record.source} 的瓶颈负载、物料齐套、质量返工和现场负责人。`,
            `${record.stage} 阶段生成现场态势证据：${record.title}。`,
            `对象 ${record.object} 的现场影响：${record.summary}`,
            `追踪编号 ${record.traceId} 写入统一 OTD 证据链，并同步给报表和审计回放。`,
            `当前状态为 ${record.statusLabel}，审计回放要求核对事件是否已生成排产动作、责任人响应和处置包升级路径。`,
          ]
      : isShopfloorEscalationEvidence
        ? [
            `现场处置包读取 ${record.source} 的升级来源、生产经理审批、排产动作和风险关闭状态。`,
            `${record.stage} 阶段生成跨模块处置证据：${record.title}。`,
            `对象 ${record.object} 的处置摘要：${record.summary}`,
            `追踪编号 ${record.traceId} 写入统一 OTD 证据链，并同步给风险处置队列和 AI 排产事件队列。`,
            `当前状态为 ${record.statusLabel}，审计回放要求核对 CNC 分流、急单窗口、物料/质量复核和关闭留痕是否闭环。`,
          ]
      : isAnomalyDispatchEvidence
        ? [
            `异常管理读取 ${record.source} 的异常来源、影响工单、责任人、处置时限和建议动作。`,
            `${record.stage} 阶段生成分流证据：${record.title}。`,
            `对象 ${record.object} 的分流摘要：${record.summary}`,
            `追踪编号 ${record.traceId} 写入统一 OTD 证据链，并同步给风险处置队列和 AI 排产事件队列。`,
            `当前状态为 ${record.statusLabel}，审计回放要求核对质量返工、设备维护、库存隔离或采购整改是否进入下游闭环。`,
          ]
      : isRiskSlaReviewEvidence
        ? [
            `风险预警读取 ${record.source} 的逾期风险、关键风险、晨会责任人和 OTD 恢复目标。`,
            `${record.stage} 阶段生成晨会复核证据：${record.title}。`,
            `对象 ${record.object} 的风险摘要：${record.summary}`,
            `追踪编号 ${record.traceId} 写入统一 OTD 证据链，并同步给 AI 排产、AI 生产助手、Agent 治理和报表 CSV。`,
            `当前状态为 ${record.statusLabel}，审计回放要求核对排产保护、采购承诺、设备窗口和责任动作闭环是否支撑 OTD 恢复。`,
          ]
      : isAssistantQualityEvidence
        ? [
            `质量闭环读取 ${record.source} 的首件检验、OP-20 扭矩复核窗口和执行包责任动作。`,
            `${record.stage} 阶段生成助手执行包质量回写：${record.title}。`,
            `对象 ${record.object} 的质量闭环摘要：${record.summary}`,
            `追踪编号 ${record.traceId} 写入统一 OTD 证据链，并同步给 AI 排产交接面板和风险处置队列。`,
            `当前状态为 ${record.statusLabel}，审计回放要求核对质量复核是否支撑交期恢复执行包释放。`,
          ]
      : isBarcodeExecutionEvidence
        ? [
            `条码扫描读取 ${record.source} 的扫码对象、现场工位、执行人和下一核对点。`,
            `${record.stage} 阶段生成现场执行证据：${record.title}。`,
            `对象 ${record.object} 的扫码摘要：${record.summary}`,
            `追踪编号 ${record.traceId} 写入统一 OTD 证据链，并同步给报表、审计回放和生产报工入口。`,
            `当前状态为 ${record.statusLabel}，审计回放要求核对扫码到站、报工入口、开工校验和后续工序是否连续。`,
          ]
      : isBarcodeCompletionEvidence
        ? [
            `生产报工读取 ${record.source} 的扫码开工追踪、报工数量、不良数量和质检结论。`,
            `${record.stage} 阶段生成扫码完工证据：${record.title}。`,
            `对象 ${record.object} 的完工摘要：${record.summary}`,
            `追踪编号 ${record.traceId} 写入统一 OTD 证据链，并同步给报表、审计回放、质量门和物料批次追溯。`,
            `当前状态为 ${record.statusLabel}，审计回放要求核对扫码开工、完工报数、首件质检、物料消耗和 OTD 达成是否一致。`,
          ]
      : isBarcodeMaterialEvidence
        ? [
            `生产报工读取 ${record.source} 的物料批次、BOM 用量、齐套状态和扫码完工记录。`,
            `${record.stage} 阶段生成扫码物料证据：${record.title}。`,
            `对象 ${record.object} 的批次摘要：${record.summary}`,
            `追踪编号 ${record.traceId} 写入统一 OTD 证据链，并同步给库存齐套、BOM 用量、质量追溯和报表审计。`,
            `当前状态为 ${record.statusLabel}，审计回放要求核对批次消耗、完工数量、齐套扣减和质量追溯是否绑定同一张扫码流转卡。`,
          ]
      : isBarcodeQualityGateEvidence
        ? [
            `质量门读取 ${record.source} 的扫码完工证据、首件尺寸复检、Ra 粗糙度抽检和不良数量。`,
            `${record.stage} 阶段生成扫码质量门证据：${record.title}。`,
            `对象 ${record.object} 的质检摘要：${record.summary}`,
            `追踪编号 ${record.traceId} 写入统一 OTD 证据链，并同步给质量闭环、报表和审计回放。`,
            `当前状态为 ${record.statusLabel}，审计回放要求核对质量门放行、返工阻断、工序交接和后续排产窗口是否一致。`,
          ]
      : isBarcodeHandoffEvidence
        ? [
            `工序交接读取 ${record.source} 的上道扫码完工、物料消耗、质量门放行和下道接收条件。`,
            `${record.stage} 阶段生成扫码交接证据：${record.title}。`,
            `对象 ${record.object} 的交接摘要：${record.summary}`,
            `追踪编号 ${record.traceId} 写入统一 OTD 证据链，并同步给质量闭环、AI 排产后续窗口和报表审计。`,
            `当前状态为 ${record.statusLabel}，审计回放要求核对下道工序是否只在质量门放行后接收，并保持数量、批次和排产窗口连续。`,
          ]
      : isEngineeringConstraintEvidence
        ? [
            `工程数据读取 ${record.source} 的 BOM/工艺路线版本、替代料、质量门和能力约束。`,
            `${record.stage} 阶段生成证据：${record.title}。`,
            `对象 ${record.object} 的工程摘要：${record.summary}`,
            `追踪编号 ${record.traceId} 写入统一 OTD 证据链，并同步给 AI 排产约束解释。`,
            `当前状态为 ${record.statusLabel}，审计回放要求核对替代料放行、质量门保留、人员/设备能力和排产释放窗口。`,
          ]
      : isEngineeringChangeEvidence
        ? [
            `工程变更读取 ${record.source} 的库存缺口、替代料可用量、质量影响、供应批次、成本和 OTD 模拟。`,
            `${record.stage} 阶段生成证据：${record.title}。`,
            `对象 ${record.object} 的 ECN 摘要：${record.summary}`,
            `追踪编号 ${record.traceId} 写入统一 OTD 证据链，并同步给 AI 排产事件队列。`,
            `当前状态为 ${record.statusLabel}，审计回放要求核对审批前模拟、正式放行或驳回撤回是否已同步 AI 排产。`,
          ]
      : isRouteCapabilityEvidence
        ? [
            `工艺路线读取 ${record.source} 的瓶颈资源、候选设备/外协、能力缺口和合批窗口。`,
            `${record.stage} 阶段生成证据：${record.title}。`,
            `对象 ${record.object} 的工艺能力摘要：${record.summary}`,
            `追踪编号 ${record.traceId} 写入统一 OTD 证据链，并同步给 AI 排产事件队列。`,
            `当前状态为 ${record.statusLabel}，审计回放要求核对分流/合批方案、外协兜底和排产释放条件。`,
          ]
      : isPurchaseReceiptEvidence
        ? [
            `采购协同读取 ${record.source} 的 PO/替代供应商、到货数量、齐套缺口和受影响工单。`,
            `${record.stage} 阶段生成收货证据：${record.title}。`,
            `对象 ${record.object} 的收货摘要：${record.summary}`,
            `追踪编号 ${record.traceId} 写入统一 OTD 证据链，并同步给 AI 排产事件队列。`,
            `当前状态为 ${record.statusLabel}，审计回放要求核对齐套缺口是否清零、供应风险是否关闭、排产窗口是否可释放。`,
          ]
      : isSupplyRiskEvidence
        ? [
            `采购协同读取 ${record.source} 的供应延期、替代供应商承诺、原交期和影响工单。`,
            `${record.stage} 阶段生成供应风险证据：${record.title}。`,
            `对象 ${record.object} 的供应摘要：${record.summary}`,
            `追踪编号 ${record.traceId} 写入统一 OTD 证据链，并同步给 AI 排产事件队列。`,
            `当前状态为 ${record.statusLabel}，审计回放要求核对冻结窗口、替代承诺、加急到货和排产复核是否闭环。`,
          ]
      : isSupplierNetworkEvidence
        ? [
            `供应网络读取 ${record.source} 的供应商绩效、准交率、SLA、报价、产能和违约状态。`,
            `${record.stage} 阶段生成选优证据：${record.title}。`,
            `对象 ${record.object} 的供应网络摘要：${record.summary}`,
            `追踪编号 ${record.traceId} 写入统一 OTD 证据链，并同步给 AI 排产事件队列。`,
            `当前状态为 ${record.statusLabel}，审计回放要求核对首选恢复供应商、原供应商 SLA 违约和二供观察是否进入复盘。`,
          ]
      : isPurchaseCorrectionEvidence
        ? [
            `采购整改读取 ${record.source} 的来料异常、供应商 8D、备用批次、复检入库和库存齐套回写。`,
            `${record.stage} 阶段生成整改证据：${record.title}。`,
            `对象 ${record.object} 的整改摘要：${record.summary}`,
            `追踪编号 ${record.traceId} 写入统一 OTD 证据链，并同步给 AI 排产事件队列。`,
            `当前状态为 ${record.statusLabel}，审计回放要求核对隔离、复检、备用批次和排产复核是否闭环。`,
          ]
      : isLaborCapabilityEvidence
        ? [
            `人员管理读取 ${record.source} 的技能、资质有效期、排班窗口、可用工时和排班来源。`,
            `${record.stage} 阶段生成能力证据：${record.title}。`,
            `对象 ${record.object} 的能力摘要：${record.summary}`,
            `追踪编号 ${record.traceId} 写入统一 OTD 证据链，并同步给 AI 排产人员约束解释。`,
            `当前状态为 ${record.statusLabel}，审计回放要求核对该人员是否可进入开工、替班或停工复核。`,
          ]
      : isLaborAssignmentEvidence
        ? [
            `人员管理读取 ${record.source} 的临期资质、候选评分、替班人员、主管复核和补证放行状态。`,
            `${record.stage} 阶段生成替班证据：${record.title}。`,
            `对象 ${record.object} 的替班摘要：${record.summary}`,
            `追踪编号 ${record.traceId} 写入统一 OTD 证据链，并同步给生产开工和 AI 排产事件队列。`,
            `当前状态为 ${record.statusLabel}，审计回放要求核对替班人员、工程确认、复核状态和排产释放窗口。`,
          ]
      : isLaborBlockEvidence
        ? [
            `人员管理读取 ${record.source} 的技能缺口、证书临期、班组/班次、排班可用性和复核授权。`,
            `${record.stage} 阶段生成阻断证据：${record.title}。`,
            `对象 ${record.object} 的阻断摘要：${record.summary}`,
            `追踪编号 ${record.traceId} 写入统一 OTD 证据链，并同步给生产开工禁用和 AI 排产事件队列。`,
            `当前状态为 ${record.statusLabel}，审计回放要求核对停工复核责任人、阻断工序和重新放行条件。`,
          ]
      : isLaborStartEvidence
        ? [
            `生产报工读取 ${record.source} 的替班执行人、工位、设备和工程复核状态。`,
            `${record.stage} 阶段生成开工证据：${record.title}。`,
            `对象 ${record.object} 的开工摘要：${record.summary}`,
            `追踪编号 ${record.traceId} 写入统一 OTD 证据链，并同步给报表和审计回放。`,
            `当前状态为 ${record.statusLabel}，审计回放要求核对替班复核已执行且生产开工未绕过人员约束。`,
          ]
      : [
          `${record.stage} 阶段生成证据：${record.title}。`,
          `对象 ${record.object} 来自 ${record.source}，证据摘要：${record.summary}`,
          `追踪编号 ${record.traceId} 写入统一 OTD 证据链。`,
          `当前状态为 ${record.statusLabel}，报表中心 CSV 与审计回放均可核对该记录。`,
        ],
  }
}

function mapProductionAnomalyEvidenceToReplay(record: OtdEvidenceChainItem): ReplayItem {
  return {
    id: `otd-${record.id}`,
    type: '生产异常证据',
    title: `${record.stage}：${record.title}`,
    summary: record.summary,
    object: record.object,
    actor: record.source,
    evidence: record.traceId,
    time: new Date(record.createdAt).toLocaleString('zh-CN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }),
    status: 'otd',
    traceId: record.traceId,
    risk: `当前状态：${record.statusLabel}。该生产异常证据必须核对异常上报、风险处置队列、异常中心、AI 排产复核和班组长现场处置是否连续。`,
    auditState: '生产异常上报、风险队列、异常中心、AI 排产复核和 OTD 证据已归档',
    steps: [
      `生产报工读取 ${record.source} 的异常上报、异常管理事件、风险处置队列和 AI 排产影响。`,
      `${record.stage} 阶段生成异常证据：${record.title}。`,
      `对象 ${record.object} 的异常摘要：${record.summary}`,
      `追踪编号 ${record.traceId} 写入统一 OTD 证据链，来源事件 ${record.sourceTraceId ?? '已同步'} 保留为异常管理事件。`,
      `当前状态为 ${record.statusLabel}，审计回放要求核对风险处置队列 / AI 排产 / 异常中心是否围绕同一异常追踪闭环。`,
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
  { label: '外协承诺包', value: replayItems.value.filter(item => item.type === '外协承诺包').length },
  { label: '外协释放回放', value: replayItems.value.filter(item => item.type === '排产释放证据').length },
  { label: '库存齐套回放', value: replayItems.value.filter(item => item.type === '库存齐套证据').length },
  { label: '设备停机回放', value: replayItems.value.filter(item => item.type === '设备停机证据').length },
  { label: '生产异常回放', value: replayItems.value.filter(item => item.type === '生产异常证据').length },
  { label: '生产完工回放', value: replayItems.value.filter(item => item.type === '生产完工证据').length },
  { label: '生产复核回放', value: replayItems.value.filter(item => item.type === '生产复核证据').length },
  { label: '现场态势回放', value: replayItems.value.filter(item => item.type === '现场态势证据').length },
  { label: '现场处置回放', value: replayItems.value.filter(item => item.type === '现场处置证据').length },
  { label: '异常分流回放', value: replayItems.value.filter(item => item.type === '异常分流证据').length },
  { label: '风险SLA回放', value: replayItems.value.filter(item => item.type === '风险SLA证据').length },
  { label: '扫码执行回放', value: replayItems.value.filter(item => item.type === '扫码执行证据').length },
  { label: '扫码完工回放', value: replayItems.value.filter(item => item.type === '扫码完工证据').length },
  { label: '扫码物料回放', value: replayItems.value.filter(item => item.type === '扫码物料证据').length },
  { label: '扫码质量门回放', value: replayItems.value.filter(item => item.type === '扫码质量门证据').length },
  { label: '质量复验释放回放', value: replayItems.value.filter(item => item.type === '质量复验释放证据').length },
  { label: '扫码交接回放', value: replayItems.value.filter(item => item.type === '扫码交接证据').length },
  { label: '工程约束回放', value: replayItems.value.filter(item => item.type === '工程约束证据').length },
  { label: '工程变更回放', value: replayItems.value.filter(item => item.type === '工程变更证据').length },
  { label: '工艺能力回放', value: replayItems.value.filter(item => item.type === '工艺能力证据').length },
  { label: '采购收货回放', value: replayItems.value.filter(item => item.type === '采购收货证据').length },
  { label: '供应风险回放', value: replayItems.value.filter(item => item.type === '供应风险证据').length },
  { label: '供应网络回放', value: replayItems.value.filter(item => item.type === '供应网络证据').length },
  { label: '采购整改回放', value: replayItems.value.filter(item => item.type === '采购整改证据').length },
  { label: '人员能力回放', value: replayItems.value.filter(item => item.type === '人员能力证据').length },
  { label: '人员替班回放', value: replayItems.value.filter(item => item.type === '人员替班证据').length },
  { label: '人员阻断回放', value: replayItems.value.filter(item => item.type === '人员阻断证据').length },
  { label: '人员开工回放', value: replayItems.value.filter(item => item.type === '人员开工证据').length },
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
  else if (otdEvidenceRecords.value.find(item => item.stage === '外协排产释放')) selectedId.value = `otd-${otdEvidenceRecords.value.find(item => item.stage === '外协排产释放')?.id}`
  else if (otdEvidenceRecords.value.find(item => item.stage === '外协承诺')) selectedId.value = `otd-${otdEvidenceRecords.value.find(item => item.stage === '外协承诺')?.id}`
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
