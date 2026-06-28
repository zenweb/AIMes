<template>
  <section class="quality-capa-panel" aria-label="质量 CAPA 处置闭环">
    <div class="panel-header">
      <div>
        <span class="eyebrow">CAPA 闭环</span>
        <h3>根因证据转纠正措施任务</h3>
      </div>
      <span class="status-badge" role="status" aria-live="polite">{{ openCount }} 个待验证</span>
    </div>

    <div class="root-cause-strip">
      <div>
        <span>主因</span>
        <strong>{{ primaryCause.cause }}</strong>
      </div>
      <div>
        <span>证据强度</span>
        <strong>{{ Math.round(primaryCause.probability * 100) }}%</strong>
      </div>
      <p>{{ primaryCause.evidence }}</p>
    </div>

    <div
      v-if="assistantRecoveryPackage"
      class="assistant-quality-closure-card"
      :class="{ closed: assistantRecoveryPackage.qualityActionStatus === 'closed' }"
    >
      <div>
        <span>助手执行包质量责任</span>
        <strong>{{ assistantRecoveryPackage.title }}</strong>
        <p>{{ assistantRecoveryPackage.qualityActionSummary ?? '质量闭环需确认替代料首件检验与 OP-20 装配扭矩复核窗口，回写后排产和风险队列会读取同一责任动作结果。' }}</p>
        <div class="assistant-quality-meta">
          <code>{{ assistantRecoveryPackage.auditCode }}</code>
          <code>{{ assistantRecoveryPackage.qualityActionTraceId ?? 'TRACE-QA-RECOVERY-FIRST-ARTICLE' }}</code>
        </div>
      </div>
      <button
        v-if="assistantRecoveryPackage.qualityActionStatus !== 'closed'"
        type="button"
        @click="closeAssistantQualityAction"
      >
        确认首件复核闭环
      </button>
      <div v-else class="assistant-quality-result">
        <span>{{ assistantRecoveryPackage.qualityActionAuditCode }}</span>
        <strong>{{ assistantRecoveryPackage.firstArticleRecord }}</strong>
      </div>
    </div>

    <div v-if="props.qualityKnowledgeSample" class="sample-reuse-card">
      <div>
        <span>扫码质量样本</span>
        <strong>{{ props.qualityKnowledgeSample.documentTitle }} {{ props.qualityKnowledgeSample.version }}</strong>
        <p>{{ props.qualityKnowledgeSample.summary }}</p>
      </div>
      <ul>
        <li v-for="recommendation in props.qualityKnowledgeSample.capaRecommendations" :key="recommendation">
          {{ recommendation }}
        </li>
      </ul>
      <code>{{ props.qualityKnowledgeSample.traceId }}</code>
    </div>

    <div v-if="props.qualityKnowledgeReuseDraft" class="sample-reuse-card draft-reuse-card">
      <div>
        <span>知识命中草案</span>
        <strong>{{ props.qualityKnowledgeReuseDraft.targetWorkOrderId }} 匹配 {{ props.qualityKnowledgeReuseDraft.matchScore }}%</strong>
        <p>{{ props.qualityKnowledgeReuseDraft.summary }}</p>
      </div>
      <ul>
        <li v-for="action in props.qualityKnowledgeReuseDraft.dispositionDraft" :key="action">
          {{ action }}
        </li>
      </ul>
      <div class="draft-effect-row">
        <span v-for="metric in props.qualityKnowledgeReuseDraft.effectMetrics" :key="metric.label">
          {{ metric.label }}：{{ metric.value }}
        </span>
        <strong>复用效果 {{ props.qualityKnowledgeReuseDraft.effectScore }} 分</strong>
      </div>
      <div id="quality-capa-operation-help" class="capa-operation-guidance">
        <div>
          <span>操作前提示 / Before writeback</span>
          <p>正式 CAPA、低分复核队列、发布推荐采纳都会回写质量知识、审计留痕与后续训练排序。</p>
          <p>These actions update quality knowledge, audit evidence, and future recommendation ranking.</p>
        </div>
        <nav aria-label="质量 CAPA 操作关联链接">
          <a :href="`#quality-capa-evidence-${props.qualityKnowledgeReuseDraft.traceId}`">
            查看草案证据 {{ props.qualityKnowledgeReuseDraft.traceId }}
          </a>
          <a :href="`#quality-capa-audit-${props.qualityKnowledgeReuseDraft.auditId}`">
            查看审计 {{ props.qualityKnowledgeReuseDraft.auditId }}
          </a>
          <a href="#quality-capa-operation-help">帮助 / Help</a>
        </nav>
      </div>
      <div
        class="formal-capa-flow"
        :class="{ verified: reuseClosure?.status === 'verified' }"
        aria-describedby="quality-capa-operation-help"
      >
        <div>
          <span>人工复核与效果回写</span>
          <strong>{{ reuseClosure ? reuseClosure.formalCapaTitle : '草案待质量工程师复核' }}</strong>
          <p>{{ reuseClosure ? reuseClosure.effectReview : '复核通过后会把同类缺陷草案转成正式 CAPA，并在复验后把效果评分回写到质量知识反馈。' }}</p>
          <div v-if="reuseClosure" class="formal-capa-meta">
            <span>{{ reuseClosure.auditId }}</span>
            <code>{{ reuseClosure.traceId }}</code>
          </div>
        </div>
        <button v-if="!reuseClosure" type="button" @click="approveReuseDraft">
          复核草案并转正式 CAPA
        </button>
        <button v-else-if="reuseClosure.status === 'approved'" type="button" @click="verifyReuseEffect">
          验证复用效果并回写
        </button>
        <div v-else class="formal-capa-result">
          <span>{{ reuseClosure.auditId }}</span>
          <code>{{ reuseClosure.effectTraceId }}</code>
          <strong>复用评分 {{ reuseClosure.effectScoreBefore }} -> {{ reuseClosure.effectScoreAfter }} 分</strong>
        </div>
      </div>
      <div class="reuse-ranking-panel">
        <div class="ranking-heading">
          <div>
            <span>质量知识复用排序</span>
            <strong>按验证效果与匹配质量排序后续推荐</strong>
          </div>
          <button v-if="!reviewQueue" type="button" @click="createLowScoreReviewQueue">
            生成低分样本复核队列
          </button>
        </div>
        <div v-if="latestGrayReleaseDecision" class="gray-release-decision-banner" :class="latestGrayReleaseDecision.decision">
          <div>
            <span>R3 灰度治理决策</span>
            <strong>{{ latestGrayReleaseDecision.trainingSetVersion }} / {{ latestGrayReleaseDecision.decisionLabel }}</strong>
            <p>{{ latestGrayReleaseDecision.reason }}</p>
          </div>
          <div>
            <code>{{ latestGrayReleaseDecision.auditId }}</code>
            <code>{{ latestGrayReleaseDecision.traceId }}</code>
            <code v-if="latestGrayReleaseDecision.reviewIssueId">
              {{ latestGrayReleaseDecision.reviewIssueId }} / {{ latestGrayReleaseDecision.reviewIssueLabel ?? '待复核' }}
            </code>
          </div>
        </div>
        <div class="ranking-grid">
          <article
            v-for="item in reuseRanking"
            :key="item.id"
            class="ranking-card"
            :class="{ review: item.reviewRequired }"
          >
            <div class="ranking-topline">
              <span>{{ item.statusLabel }}</span>
              <strong>{{ item.effectScore }} 分</strong>
            </div>
            <h4>{{ item.title }}</h4>
            <p>{{ item.recommendation }}</p>
            <div class="ranking-tags">
              <span v-for="tag in item.riskTags" :key="tag">{{ tag }}</span>
            </div>
            <div v-if="item.trainingSetVersion" class="ranking-training-release">
              <span>{{ item.trainingSetVersion }}</span>
              <span v-if="item.releaseScopeLabel">{{ item.releaseScopeLabel }}</span>
              <code>{{ item.auditId }}</code>
            </div>
            <div v-if="item.feedbackTraceId" class="ranking-feedback">
              <span>采纳效果 {{ item.effectTrendLabel }}</span>
              <code>{{ item.feedbackAuditId }}</code>
              <code>{{ item.feedbackTraceId }}</code>
              <strong>{{ item.nextTrainingSetVersion }}</strong>
            </div>
            <div v-if="item.experimentDecisionAuditId" class="ranking-experiment-decision">
              <span>实验决策 {{ item.experimentDecisionLabel }}</span>
              <code>{{ item.experimentDecisionAuditId }}</code>
              <code>{{ item.experimentDecisionTraceId }}</code>
            </div>
            <div v-if="item.excludedExperimentVersions?.length" class="ranking-excluded-experiments">
              <span v-for="version in item.excludedExperimentVersions" :key="version">{{ version }}</span>
            </div>
            <button
              v-if="!item.feedbackTraceId && item.id === 'reuse-rank-published-torque-retraining'"
              class="ranking-adopt-action"
              type="button"
              @click="acceptPublishedRecommendation(item)"
            >
              采纳发布推荐并回写效果
            </button>
            <code>{{ item.evidenceTraceId }}</code>
          </article>
        </div>
        <div v-if="reviewQueue" class="low-score-review-card">
          <span>低分样本复核队列</span>
          <strong>{{ reviewQueue.title }}</strong>
          <p>{{ reviewQueue.reason }}</p>
          <p v-if="reviewQueue.decisionSummary" class="review-decision">
            {{ reviewQueue.decisionSummary }}
          </p>
          <ul v-if="reviewQueue.retrainingPlan?.length" class="review-retraining-list">
            <li v-for="step in reviewQueue.retrainingPlan" :key="step">{{ step }}</li>
          </ul>
          <div class="formal-capa-meta">
            <span>{{ reviewQueue.auditId }}</span>
            <code>{{ reviewQueue.traceId }}</code>
          </div>
          <div v-if="reviewQueue.decisionTraceId" class="formal-capa-meta">
            <span>{{ reviewQueue.decisionAuditId }}</span>
            <code>{{ reviewQueue.decisionTraceId }}</code>
            <code>{{ reviewQueue.retrainingTraceId }}</code>
          </div>
          <button v-if="reviewQueue.status === 'open'" type="button" @click="closeLowScoreReviewQueue">
            完成复核并禁用直接复用
          </button>
        </div>
      </div>
      <div class="capa-draft-links">
        <code :id="`quality-capa-evidence-${props.qualityKnowledgeReuseDraft.traceId}`">{{ props.qualityKnowledgeReuseDraft.traceId }}</code>
        <code :id="`quality-capa-audit-${props.qualityKnowledgeReuseDraft.auditId}`">{{ props.qualityKnowledgeReuseDraft.auditId }}</code>
      </div>
    </div>

    <div v-if="showStandaloneReuseRanking" class="reuse-ranking-panel standalone-ranking-panel">
      <div class="ranking-heading">
        <div>
          <span>质量知识复用排序</span>
          <strong>按验证效果与匹配质量排序后续推荐</strong>
        </div>
      </div>
      <div v-if="latestGrayReleaseDecision" class="gray-release-decision-banner" :class="latestGrayReleaseDecision.decision">
        <div>
          <span>R3 灰度治理决策</span>
          <strong>{{ latestGrayReleaseDecision.trainingSetVersion }} / {{ latestGrayReleaseDecision.decisionLabel }}</strong>
          <p>{{ latestGrayReleaseDecision.reason }}</p>
        </div>
        <div>
          <code>{{ latestGrayReleaseDecision.auditId }}</code>
          <code>{{ latestGrayReleaseDecision.traceId }}</code>
          <code v-if="latestGrayReleaseDecision.reviewIssueId">
            {{ latestGrayReleaseDecision.reviewIssueId }} / {{ latestGrayReleaseDecision.reviewIssueLabel ?? '待复核' }}
          </code>
        </div>
      </div>
      <div class="ranking-grid">
        <article
          v-for="item in reuseRanking"
          :key="item.id"
          class="ranking-card"
          :class="{ review: item.reviewRequired }"
        >
          <div class="ranking-topline">
            <span>{{ item.statusLabel }}</span>
            <strong>{{ item.effectScore }} 分</strong>
          </div>
          <h4>{{ item.title }}</h4>
          <p>{{ item.recommendation }}</p>
          <div class="ranking-tags">
            <span v-for="tag in item.riskTags" :key="tag">{{ tag }}</span>
          </div>
          <div v-if="item.trainingSetVersion" class="ranking-training-release">
            <span>{{ item.trainingSetVersion }}</span>
            <span v-if="item.releaseScopeLabel">{{ item.releaseScopeLabel }}</span>
            <code>{{ item.auditId }}</code>
          </div>
          <div v-if="item.feedbackTraceId" class="ranking-feedback">
            <span>采纳效果 {{ item.effectTrendLabel }}</span>
            <code>{{ item.feedbackAuditId }}</code>
            <code>{{ item.feedbackTraceId }}</code>
            <strong>{{ item.nextTrainingSetVersion }}</strong>
          </div>
          <div v-if="item.experimentDecisionAuditId" class="ranking-experiment-decision">
            <span>实验决策 {{ item.experimentDecisionLabel }}</span>
            <code>{{ item.experimentDecisionAuditId }}</code>
            <code>{{ item.experimentDecisionTraceId }}</code>
          </div>
          <div v-if="item.excludedExperimentVersions?.length" class="ranking-excluded-experiments">
            <span v-for="version in item.excludedExperimentVersions" :key="version">{{ version }}</span>
          </div>
          <button
            v-if="!item.feedbackTraceId && item.id === 'reuse-rank-published-torque-retraining'"
            class="ranking-adopt-action"
            type="button"
            @click="acceptPublishedRecommendation(item)"
          >
            采纳发布推荐并回写效果
          </button>
          <code>{{ item.evidenceTraceId }}</code>
        </article>
      </div>
    </div>

    <div class="task-grid">
      <article
        v-for="task in tasks"
        :key="task.id"
        class="task-card"
        :class="task.status"
      >
        <div class="task-topline">
          <span>{{ task.kind }}</span>
          <em>{{ statusText(task.status) }}</em>
        </div>
        <h4>{{ task.title }}</h4>
        <p>{{ task.evidence }}</p>
        <div class="task-meta">
          <span>负责人：{{ task.owner }}</span>
          <span>截止：{{ task.dueAt }}</span>
          <span>验证：{{ task.verification }}</span>
        </div>
        <button type="button" @click="advanceTask(task.id)">
          {{ task.status === 'verified' ? '已验证' : '推进处置' }}
        </button>
      </article>
    </div>

    <div class="capa-trace">
      <h4>处置与验证留痕</h4>
      <p v-if="latestClosureMessage" class="closure-sync-message" role="status" aria-live="polite">{{ latestClosureMessage }}</p>
      <p v-if="closureErrorMessage" class="closure-sync-error" role="alert" aria-live="assertive">{{ closureErrorMessage }}</p>
      <ul>
        <li v-for="record in records" :key="record">{{ record }}</li>
      </ul>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import type { RootCauseItemDto } from '../../types/quality'
import { errorMessage } from '../../utils/error-message'
import { isOfflineDemoError } from '../../utils/offline-demo-mode'
import { writeQualityCapaClosure } from '../../utils/quality-capa-sync'
import {
  closeAssistantRecoveryQualityAction,
  readAssistantRecoveryPackages,
  readAssistantRecoveryPackagesBackendFirst,
  type AssistantRecoveryPackage,
} from '../../utils/assistant-action-package-sync'
import {
  acceptQualityKnowledgeRecommendation,
  buildQualityKnowledgeReuseRanking,
  closeLowScoreQualityKnowledgeReviewQueueRecord,
  createBarcodeQualityReuseClosure,
  readQualityKnowledgeGrayReleaseDecisionRecords,
  readQualityKnowledgeGrayReleaseDecisionRecordsBackendFirst,
  readLatestQualityKnowledgeReuseClosure,
  readQualityKnowledgeReuseClosuresBackendFirst,
  readLatestQualityKnowledgeReviewQueueRecord,
  readQualityKnowledgeReviewQueueRecordsBackendFirst,
  readQualityKnowledgeRecommendationFeedbackRecords,
  readQualityKnowledgeRecommendationFeedbackRecordsBackendFirst,
  verifyQualityKnowledgeReuseClosure,
  writeQualityKnowledgeReviewQueueRecord,
  writeQualityKnowledgeReuseClosure,
  type QualityKnowledgeGrayReleaseDecisionRecord,
  type QualityKnowledgeRecommendationFeedbackRecord,
  type QualityKnowledgeReviewQueueRecord,
  type QualityKnowledgeReuseRankingItem,
  type QualityKnowledgeReuseClosureRecord,
  type QualityKnowledgeReuseDraftRecord,
  type QualityKnowledgeSampleRecord,
} from '../../utils/quality-knowledge-sample-sync'

const props = defineProps<{
  qualityKnowledgeSample?: QualityKnowledgeSampleRecord | null
  qualityKnowledgeReuseDraft?: QualityKnowledgeReuseDraftRecord | null
}>()

type CapaStatus = 'open' | 'doing' | 'verified'

interface CapaTask {
  id: string
  kind: string
  title: string
  evidence: string
  owner: string
  dueAt: string
  verification: string
  status: CapaStatus
}

const primaryCause = ref<RootCauseItemDto>({
  cause: '硬度不足 / 热处理参数漂移',
  probability: 0.72,
  evidence: 'INS-003 硬度检测低于 HB95，HT-01 炉温曲线末段波动，物料批次 MAT-AL6061-B03 受影响。',
})

const tasks = ref<CapaTask[]>([
  {
    id: 'capa-heat-param',
    kind: '纠正措施',
    title: '复核 HT-01 炉温曲线并锁定返工参数',
    evidence: '根因证据指向热处理参数漂移，需先冻结当前参数并由工艺工程师确认返工窗口。',
    owner: '质量工程师 周工',
    dueAt: '今日 15:00',
    verification: '返工后硬度 HB95+',
    status: 'open',
  },
  {
    id: 'capa-batch-isolation',
    kind: '隔离措施',
    title: '隔离 MAT-AL6061-B03 批次并追溯同批工单',
    evidence: '同批次物料进入 WO-003 与 WO-DEMO-1007，需隔离未投入数量并检查已投入工序。',
    owner: '仓库主管 赵工',
    dueAt: '今日 16:00',
    verification: '隔离单和批次追溯记录完成',
    status: 'open',
  },
  {
    id: 'capa-spc-monitor',
    kind: '预防措施',
    title: '新增热处理硬度 SPC 预警点',
    evidence: '预防同类波动再次影响 OTD，需把硬度趋势和炉温偏移纳入质量预警。',
    owner: '质量主管 刘工',
    dueAt: '明日 10:00',
    verification: 'SPC 连续 6 点无上升风险',
    status: 'doing',
  },
])

const records = ref<string[]>([
  'INS-003 已生成 3 条 CAPA 任务，并绑定返工排产事件与 OTD 复盘。',
])

const latestClosureMessage = ref('')
const closureErrorMessage = ref('')
const reuseClosure = ref<QualityKnowledgeReuseClosureRecord | null>(readLatestQualityKnowledgeReuseClosure())
const reviewQueue = ref<QualityKnowledgeReviewQueueRecord | null>(readLatestQualityKnowledgeReviewQueueRecord())
const recommendationFeedbackRecords = ref<QualityKnowledgeRecommendationFeedbackRecord[]>(readQualityKnowledgeRecommendationFeedbackRecords())
const grayReleaseDecisionRecords = ref<QualityKnowledgeGrayReleaseDecisionRecord[]>(readQualityKnowledgeGrayReleaseDecisionRecords())
const assistantRecoveryPackages = ref<AssistantRecoveryPackage[]>(readAssistantRecoveryPackages())

const openCount = computed(() =>
  tasks.value.filter(task => task.status !== 'verified').length
  + (reuseClosure.value?.status === 'approved' ? 1 : 0)
  + (reviewQueue.value?.status === 'open' ? 1 : 0)
)
const reuseRanking = computed(() =>
  buildQualityKnowledgeReuseRanking(
    reuseClosure.value,
    props.qualityKnowledgeReuseDraft ?? null,
    undefined,
    recommendationFeedbackRecords.value,
    grayReleaseDecisionRecords.value
  )
)
const showStandaloneReuseRanking = computed(() =>
  !props.qualityKnowledgeReuseDraft
  && reuseRanking.value.some(item =>
    item.id === 'reuse-rank-published-torque-retraining'
    && !!item.trainingSetVersion
  )
)
const latestGrayReleaseDecision = computed(() =>
  grayReleaseDecisionRecords.value.find(record =>
    record.targetWorkOrderId === 'WO-DEMO-1018'
    && record.operationCode === 'OP-20'
  ) ?? null
)
const assistantRecoveryPackage = computed(() =>
  assistantRecoveryPackages.value.find(record => record.workOrders.includes('WO-RUSH-9001')) ?? null
)

async function refreshStartupEvidence() {
  const failures: string[] = []

  await refreshStartupSource(
    '质量知识复用闭环',
    () => readQualityKnowledgeReuseClosuresBackendFirst(),
    records => { reuseClosure.value = records[0] ?? readLatestQualityKnowledgeReuseClosure() },
    failures
  )
  await refreshStartupSource(
    '低分样本复核队列',
    () => readQualityKnowledgeReviewQueueRecordsBackendFirst(),
    records => { reviewQueue.value = records[0] ?? readLatestQualityKnowledgeReviewQueueRecord() },
    failures
  )
  await refreshStartupSource(
    '质量推荐采纳反馈',
    () => readQualityKnowledgeRecommendationFeedbackRecordsBackendFirst(),
    records => { recommendationFeedbackRecords.value = records },
    failures
  )
  await refreshStartupSource(
    '质量知识灰度决策',
    () => readQualityKnowledgeGrayReleaseDecisionRecordsBackendFirst(),
    records => { grayReleaseDecisionRecords.value = records },
    failures
  )
  await refreshStartupSource(
    '助手执行包质量责任',
    () => readAssistantRecoveryPackagesBackendFirst(),
    records => { assistantRecoveryPackages.value = records },
    failures
  )

  if (failures.length > 0) {
    closureErrorMessage.value = `质量 CAPA 启动证据刷新失败，已保留本地处置状态：${failures.join('；')}`
  }
}

async function refreshStartupSource<T>(
  label: string,
  read: () => Promise<T[]>,
  apply: (records: T[]) => void,
  failures: string[]
) {
  try {
    apply(await read())
  } catch (error: unknown) {
    if (isOfflineDemoError(error)) return
    failures.push(`${label}: ${errorMessage(error, '请稍后重试')}`)
  }
}

function statusText(status: CapaStatus) {
  return {
    open: '待执行',
    doing: '执行中',
    verified: '已验证',
  }[status]
}

function advanceTask(id: string) {
  const task = tasks.value.find(item => item.id === id)
  if (!task || task.status === 'verified') return
  closureErrorMessage.value = ''

  if (task.status === 'open') {
    task.status = 'doing'
    records.value.unshift(`${task.title} 已开始执行，负责人 ${task.owner} 需在 ${task.dueAt} 前回写证据。`)
    return
  }

  try {
    writeQualityCapaClosure({
      inspectionId: 'INS-003',
      workOrderId: 'WO-003',
      traceId: `TRACE-QA-CAPA-20260520-${task.id.toUpperCase()}`,
      rootCause: primaryCause.value.cause,
      evidenceStrength: primaryCause.value.probability,
      taskTitle: task.title,
      taskKind: task.kind,
      owner: task.owner,
      dueAt: task.dueAt,
      verification: task.verification,
      verifiedAt: new Date().toISOString(),
      auditState: 'CAPA 已验证，根因证据、责任人、验证标准和 OTD 复盘已归档',
      otdImpact: 'WO-003 热处理返工风险从 +1 单延期降为待复验观察',
      reviewAction: '报表中心需在 OTD 复盘中标注质量 CAPA 验证结果，并复核同批 WO-DEMO-1007 热处理窗口。',
    })
  } catch (error) {
    closureErrorMessage.value = `CAPA 验证同步失败：${errorMessage(error, '请稍后重试')}`
    return
  }

  task.status = 'verified'
  latestClosureMessage.value = `${task.title} 已同步到审计回放与 OTD 复盘。`
  records.value.unshift(`${task.title} 已完成验证：${task.verification}，结果进入质量审计与 OTD 复盘。`)
}

function approveReuseDraft() {
  if (!props.qualityKnowledgeReuseDraft) return
  closureErrorMessage.value = ''
  let closure: QualityKnowledgeReuseClosureRecord
  try {
    closure = writeQualityKnowledgeReuseClosure(
      createBarcodeQualityReuseClosure(props.qualityKnowledgeReuseDraft, new Date().toISOString())
    )
  } catch (error) {
    closureErrorMessage.value = `质量知识复用转正式 CAPA 失败：${errorMessage(error, '请稍后重试')}`
    return
  }
  reuseClosure.value = closure
  latestClosureMessage.value = `${closure.formalCapaTitle} 已转正式 CAPA，等待按 ${closure.verification} 验证。`
  records.value.unshift(`${closure.auditId} 复核通过：草案 ${closure.draftTraceId} 已转正式 CAPA，负责人 ${closure.owner}。`)
}

function verifyReuseEffect() {
  if (!reuseClosure.value) return
  closureErrorMessage.value = ''
  let closure: QualityKnowledgeReuseClosureRecord
  try {
    closure = verifyQualityKnowledgeReuseClosure(reuseClosure.value, new Date().toISOString())
  } catch (error) {
    closureErrorMessage.value = `质量知识复用效果验证失败：${errorMessage(error, '请稍后重试')}`
    return
  }
  reuseClosure.value = closure
  latestClosureMessage.value = `${closure.formalCapaTitle} 已验证并回写复用效果，评分 ${closure.effectScoreBefore} -> ${closure.effectScoreAfter} 分。`
  records.value.unshift(`${closure.effectTraceId} 已回写：${closure.effectReview}`)
}

function createLowScoreReviewQueue() {
  closureErrorMessage.value = ''
  let record: QualityKnowledgeReviewQueueRecord
  try {
    record = writeQualityKnowledgeReviewQueueRecord()
  } catch (error) {
    closureErrorMessage.value = `低分样本复核队列生成失败：${errorMessage(error, '请稍后重试')}`
    return
  }
  reviewQueue.value = record
  latestClosureMessage.value = `${record.title} 已进入低分样本复核队列，${record.owner} 需在 ${record.dueAt} 前处理。`
  records.value.unshift(`${record.auditId} 已生成低分复核：${record.reason}`)
}

function closeLowScoreReviewQueue() {
  if (!reviewQueue.value) return
  closureErrorMessage.value = ''
  let record: QualityKnowledgeReviewQueueRecord
  try {
    record = closeLowScoreQualityKnowledgeReviewQueueRecord(reviewQueue.value, new Date().toISOString())
  } catch (error) {
    closureErrorMessage.value = `低分样本复核队列关闭失败：${errorMessage(error, '请稍后重试')}`
    return
  }
  reviewQueue.value = record
  latestClosureMessage.value = `${record.title} 已完成复核：${record.decisionLabel}，并进入知识再训练候选。`
  records.value.unshift(`${record.decisionAuditId} 已回写低分复核结论：${record.decisionSummary}`)
}

function acceptPublishedRecommendation(item: QualityKnowledgeReuseRankingItem) {
  closureErrorMessage.value = ''
  let feedback: QualityKnowledgeRecommendationFeedbackRecord
  try {
    feedback = acceptQualityKnowledgeRecommendation(item, new Date().toISOString())
  } catch (error) {
    closureErrorMessage.value = `质量知识发布推荐采纳失败：${errorMessage(error, '请稍后重试')}`
    return
  }
  recommendationFeedbackRecords.value = readQualityKnowledgeRecommendationFeedbackRecords()
  latestClosureMessage.value = `${feedback.targetWorkOrderId} ${feedback.operationCode} 已采纳 ${feedback.trainingSetVersion} 推荐，效果趋势 ${feedback.effectTrendLabel}，进入 ${feedback.nextTrainingSetVersion}。`
  records.value.unshift(`${feedback.auditId} 已回写推荐采纳：${feedback.traceId}，下一轮训练 ${feedback.nextTrainingTraceId}。`)
}

async function closeAssistantQualityAction() {
  if (!assistantRecoveryPackage.value) return
  closureErrorMessage.value = ''
  let updated: AssistantRecoveryPackage | null
  try {
    updated = closeAssistantRecoveryQualityAction(assistantRecoveryPackage.value.id)
  } catch (error) {
    closureErrorMessage.value = `助手执行包质量责任闭环失败：${errorMessage(error, '请稍后重试')}`
    return
  }
  if (!updated) return
  assistantRecoveryPackages.value = await readAssistantRecoveryPackagesBackendFirst()
  latestClosureMessage.value = updated.qualityActionSummary ?? '交期恢复执行包质量责任动作已闭合。'
  records.value.unshift(`${updated.qualityActionAuditCode} 已回写助手执行包质量责任动作：${updated.qualityActionTraceId}`)
}

onMounted(refreshStartupEvidence)
</script>

<style scoped>
.quality-capa-panel {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 16px;
  padding: 14px 16px;
  border: 1px solid #bbf7d0;
  border-radius: 8px;
  background: #f7fef9;
}

.panel-header,
.task-topline {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: flex-start;
}

.eyebrow {
  display: block;
  margin-bottom: 3px;
  color: #15803d;
  font-size: 12px;
  font-weight: 700;
}

h3,
h4,
p,
ul {
  margin: 0;
}

h3 {
  color: #111827;
  font-size: 16px;
}

.status-badge,
.task-topline span,
.task-topline em,
.task-meta span {
  padding: 3px 7px;
  border-radius: 4px;
  background: #dcfce7;
  color: #166534;
  font-size: 12px;
  font-weight: 700;
}

.root-cause-strip {
  display: grid;
  grid-template-columns: 1fr 120px 2fr;
  gap: 10px;
  align-items: stretch;
}

.root-cause-strip div,
.root-cause-strip p,
.task-card,
.capa-trace,
.sample-reuse-card,
.assistant-quality-closure-card {
  padding: 10px;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  background: #fff;
}

.root-cause-strip span,
.task-card p,
.task-meta span,
.capa-trace li,
.sample-reuse-card p,
.sample-reuse-card li {
  color: #4b5563;
  font-size: 12px;
  line-height: 1.45;
}

.root-cause-strip strong {
  display: block;
  margin-top: 4px;
  color: #111827;
  font-size: 16px;
}

.assistant-quality-closure-card {
  display: grid;
  grid-template-columns: minmax(0, 1fr) max-content;
  gap: 10px;
  align-items: center;
  border-color: #fed7aa;
  background: #fff7ed;
}

.assistant-quality-closure-card.closed {
  border-color: #86efac;
  background: #f0fdf4;
}

.assistant-quality-closure-card span {
  display: block;
  margin-bottom: 4px;
  color: #c2410c;
  font-size: 12px;
  font-weight: 700;
}

.assistant-quality-closure-card strong {
  display: block;
  margin-bottom: 5px;
  color: #111827;
  font-size: 14px;
}

.assistant-quality-closure-card p {
  margin: 0;
  color: #4b5563;
  font-size: 12px;
  line-height: 1.45;
}

.assistant-quality-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 7px;
}

.assistant-quality-meta code,
.assistant-quality-result span,
.assistant-quality-result strong {
  padding: 2px 6px;
  border-radius: 4px;
  background: #ffedd5;
  color: #9a3412;
  font-size: 12px;
  overflow-wrap: anywhere;
}

.assistant-quality-closure-card button {
  padding: 7px 10px;
  border: 1px solid #ea580c;
  border-radius: 4px;
  background: #ea580c;
  color: #fff;
  cursor: pointer;
  font-size: 12px;
  font-weight: 700;
}

.assistant-quality-result {
  display: grid;
  gap: 5px;
  min-width: 220px;
}

.assistant-quality-result span,
.assistant-quality-result strong {
  background: #dcfce7;
  color: #166534;
}

.sample-reuse-card {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(260px, 0.9fr);
  gap: 10px;
  border-color: #bae6fd;
  background: #f8fbff;
}

.draft-reuse-card {
  border-color: #86efac;
  background: #f7fef9;
}

.sample-reuse-card span {
  display: block;
  margin-bottom: 4px;
  color: #0369a1;
  font-size: 12px;
  font-weight: 700;
}

.sample-reuse-card strong {
  display: block;
  margin-bottom: 5px;
  color: #111827;
  font-size: 14px;
}

.sample-reuse-card ul {
  display: grid;
  gap: 4px;
  margin: 0;
  padding-left: 18px;
}

.sample-reuse-card code {
  grid-column: 1 / -1;
  color: #1d4ed8;
  font-size: 12px;
  overflow-wrap: anywhere;
}

.draft-effect-row {
  grid-column: 1 / -1;
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.draft-effect-row span,
.draft-effect-row strong {
  padding: 3px 7px;
  border-radius: 4px;
  background: #dcfce7;
  color: #166534;
  font-size: 12px;
}

.capa-operation-guidance {
  grid-column: 1 / -1;
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(220px, 0.38fr);
  gap: 10px;
  align-items: start;
  padding: 9px;
  border: 1px solid #bae6fd;
  border-radius: 6px;
  background: #f0f9ff;
}

.capa-operation-guidance span {
  color: #075985;
  font-size: 12px;
  font-weight: 800;
}

.capa-operation-guidance p {
  margin: 4px 0 0;
  color: #0f172a;
  font-size: 12px;
}

.capa-operation-guidance nav {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.capa-operation-guidance a {
  color: #1d4ed8;
  font-size: 12px;
  font-weight: 700;
  overflow-wrap: anywhere;
  text-decoration: underline;
}

.capa-draft-links {
  grid-column: 1 / -1;
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.formal-capa-flow {
  grid-column: 1 / -1;
  display: grid;
  grid-template-columns: minmax(0, 1fr) max-content;
  gap: 10px;
  align-items: center;
  padding: 9px;
  border: 1px solid #fed7aa;
  border-radius: 6px;
  background: #fff7ed;
}

.formal-capa-flow.verified {
  border-color: #86efac;
  background: #f0fdf4;
}

.formal-capa-flow button {
  padding: 7px 10px;
  border: 1px solid #ea580c;
  border-radius: 4px;
  background: #ea580c;
  color: #fff;
  cursor: pointer;
  font-size: 12px;
  font-weight: 700;
}

.formal-capa-flow.verified button {
  border-color: #16a34a;
  background: #16a34a;
}

.formal-capa-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 6px;
}

.formal-capa-meta span,
.formal-capa-meta code {
  padding: 2px 6px;
  border-radius: 4px;
  background: #ffedd5;
  color: #9a3412;
  font-size: 12px;
}

.formal-capa-meta code {
  color: #1d4ed8;
  overflow-wrap: anywhere;
}

.formal-capa-result {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 220px;
}

.formal-capa-result span,
.formal-capa-result strong {
  color: #166534;
  font-size: 12px;
}

.formal-capa-result code {
  color: #1d4ed8;
  font-size: 12px;
  overflow-wrap: anywhere;
}

.reuse-ranking-panel {
  grid-column: 1 / -1;
  display: flex;
  flex-direction: column;
  gap: 9px;
  padding: 9px;
  border: 1px solid #bfdbfe;
  border-radius: 6px;
  background: #f8fbff;
}

.ranking-heading,
.ranking-topline {
  display: flex;
  justify-content: space-between;
  gap: 10px;
  align-items: flex-start;
}

.ranking-heading button {
  flex: 0 0 auto;
  padding: 7px 10px;
  border: 1px solid #2563eb;
  border-radius: 4px;
  background: #2563eb;
  color: #fff;
  cursor: pointer;
  font-size: 12px;
  font-weight: 700;
}

.gray-release-decision-banner {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(260px, 0.45fr);
  gap: 10px;
  padding: 10px;
  border: 1px solid #fed7aa;
  border-radius: 6px;
  background: #fff7ed;
}

.gray-release-decision-banner.expanded {
  border-color: #bbf7d0;
  background: #f0fdf4;
}

.gray-release-decision-banner.rolled_back {
  border-color: #fecaca;
  background: #fff1f2;
}

.gray-release-decision-banner span {
  color: #64748b;
  font-size: 12px;
  font-weight: 700;
}

.gray-release-decision-banner strong {
  display: block;
  margin: 3px 0;
  color: #111827;
  font-size: 13px;
}

.gray-release-decision-banner p {
  margin: 0;
  color: #475569;
  font-size: 12px;
  line-height: 1.45;
}

.gray-release-decision-banner code {
  display: block;
  margin-bottom: 4px;
  overflow-wrap: anywhere;
  color: #1d4ed8;
  font-family: monospace;
  font-size: 12px;
}

.ranking-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 8px;
}

.ranking-card {
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-height: 158px;
  padding: 9px;
  border: 1px solid #bbf7d0;
  border-radius: 6px;
  background: #fff;
}

.ranking-card.review {
  border-color: #fed7aa;
  background: #fff7ed;
}

.ranking-topline span,
.ranking-tags span {
  padding: 2px 6px;
  border-radius: 4px;
  background: #dcfce7;
  color: #166534;
  font-size: 12px;
  font-weight: 700;
}

.ranking-card.review .ranking-topline span,
.ranking-card.review .ranking-tags span {
  background: #ffedd5;
  color: #9a3412;
}

.ranking-topline strong {
  color: #047857;
  font-size: 18px;
}

.ranking-card.review .ranking-topline strong {
  color: #c2410c;
}

.ranking-card h4 {
  color: #111827;
  font-size: 13px;
}

.ranking-card p {
  color: #4b5563;
  font-size: 12px;
  line-height: 1.45;
}

.ranking-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
}

.ranking-training-release {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
  align-items: center;
  padding: 6px;
  border-radius: 4px;
  background: #ecfdf5;
}

.ranking-training-release span,
.ranking-training-release code {
  color: #047857;
  font-size: 12px;
  font-weight: 700;
}

.ranking-feedback,
.ranking-experiment-decision {
  display: grid;
  gap: 4px;
  padding: 6px;
  border: 1px solid #86efac;
  border-radius: 4px;
  background: #f0fdf4;
}

.ranking-experiment-decision {
  border-color: #c7d2fe;
  background: #eef2ff;
}

.ranking-feedback span,
.ranking-feedback strong,
.ranking-feedback code,
.ranking-experiment-decision span,
.ranking-experiment-decision code {
  color: #166534;
  font-size: 12px;
  font-weight: 700;
  overflow-wrap: anywhere;
}

.ranking-feedback code,
.ranking-experiment-decision code {
  color: #1d4ed8;
}

.ranking-excluded-experiments {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.ranking-excluded-experiments span {
  padding: 3px 6px;
  border-radius: 4px;
  background: #fee2e2;
  color: #991b1b;
  font-size: 11px;
  font-weight: 700;
}

.ranking-adopt-action {
  align-self: flex-start;
  padding: 6px 9px;
  border: 1px solid #059669;
  border-radius: 4px;
  background: #059669;
  color: #fff;
  cursor: pointer;
  font-size: 12px;
  font-weight: 700;
}

.ranking-card code {
  margin-top: auto;
  color: #1d4ed8;
  font-size: 12px;
  overflow-wrap: anywhere;
}

.low-score-review-card {
  padding: 9px;
  border: 1px solid #fed7aa;
  border-radius: 6px;
  background: #fff;
}

.low-score-review-card span {
  color: #c2410c;
}

.low-score-review-card strong {
  color: #111827;
}

.low-score-review-card p {
  margin-top: 4px;
  color: #4b5563;
  font-size: 12px;
  line-height: 1.45;
}

.low-score-review-card .review-decision {
  color: #9a3412;
  font-weight: 700;
}

.review-retraining-list {
  display: grid;
  gap: 4px;
  margin: 6px 0 0;
  padding-left: 18px;
}

.review-retraining-list li {
  color: #4b5563;
  font-size: 12px;
  line-height: 1.45;
}

.low-score-review-card button {
  margin-top: 8px;
  padding: 7px 10px;
  border: 1px solid #c2410c;
  border-radius: 4px;
  background: #c2410c;
  color: #fff;
  cursor: pointer;
  font-size: 12px;
  font-weight: 700;
}

.task-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
}

.task-card {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.task-card.doing {
  border-color: #fde68a;
}

.task-card.verified {
  border-color: #bbf7d0;
  opacity: 0.82;
}

.task-topline em {
  background: #eff6ff;
  color: #1d4ed8;
  font-style: normal;
}

.task-card.doing .task-topline em {
  background: #fff7ed;
  color: #c2410c;
}

.task-card.verified .task-topline em {
  background: #dcfce7;
  color: #166534;
}

.task-card h4,
.capa-trace h4 {
  color: #111827;
  font-size: 14px;
}

.closure-sync-message {
  padding: 7px 9px;
  border-radius: 4px;
  background: #ecfdf5;
  color: #047857;
  font-size: 12px;
  font-weight: 700;
}

.closure-sync-error {
  padding: 7px 9px;
  border-radius: 4px;
  background: #fef2f2;
  color: #b91c1c;
  font-size: 12px;
  font-weight: 700;
}

.task-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.task-meta span {
  background: #f3f4f6;
  color: #374151;
  font-weight: 500;
}

.task-card button {
  margin-top: auto;
  padding: 7px 10px;
  border: 1px solid #16a34a;
  border-radius: 4px;
  background: #16a34a;
  color: #fff;
  cursor: pointer;
  font-size: 12px;
  font-weight: 700;
}

.task-card.verified button {
  border-color: #d1d5db;
  background: #f3f4f6;
  color: #6b7280;
  cursor: default;
}

.capa-trace {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.capa-trace ul {
  display: grid;
  gap: 5px;
  padding-left: 18px;
}

@media (max-width: 1100px) {
  .root-cause-strip,
  .task-grid,
  .sample-reuse-card,
  .capa-operation-guidance,
  .formal-capa-flow,
  .ranking-grid {
    grid-template-columns: 1fr;
  }
}
</style>
