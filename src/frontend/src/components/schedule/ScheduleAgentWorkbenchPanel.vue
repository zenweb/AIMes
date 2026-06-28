<template>
  <section class="agent-workbench-panel" aria-label="调度员 Agent 工作台">
    <div class="workbench-heading">
      <div>
        <span class="eyebrow">调度员 Agent 工作台</span>
        <h3>工单池、方案、解释与执行追踪</h3>
      </div>
      <span class="status-pill">{{ executionStatus }}</span>
    </div>

    <div class="workbench-grid">
      <div class="workbench-block order-pool">
        <div class="block-title">
          <h4>工单池</h4>
          <span>{{ orderPools.length }} 类状态</span>
        </div>
        <div class="pool-list">
          <div v-for="pool in orderPools" :key="pool.label" class="pool-row" :class="pool.tone">
            <strong>{{ pool.count }}</strong>
            <span>{{ pool.label }}</span>
            <em>{{ pool.example }}</em>
          </div>
        </div>
      </div>

      <div class="workbench-block plan-compare">
        <div class="block-title">
          <h4>排产方案</h4>
          <span>{{ decisionSourceLabel }}</span>
        </div>
        <div class="plan-grid">
          <div v-for="plan in planOptions" :key="plan.name" class="plan-card" :class="{ recommended: plan.recommended }">
            <span>{{ plan.name }}</span>
            <strong>{{ plan.otd }}</strong>
            <em>{{ plan.note }}</em>
          </div>
        </div>
        <div class="agent-actions">
          <button type="button" :disabled="actionBusy" @click="handleRecommend">
            {{ actionBusy && actionMode === 'recommend' ? '生成中...' : '生成后端建议' }}
          </button>
          <button type="button" :disabled="!canExecuteDecision || actionBusy" @click="handleAdopt">
            {{ actionBusy && actionMode === 'adopt' ? '采纳中...' : '采纳推荐' }}
          </button>
          <button type="button" :disabled="!canExecuteDecision || actionBusy" @click="handleReject">
            {{ actionBusy && actionMode === 'reject' ? '拒绝中...' : '拒绝建议' }}
          </button>
        </div>
        <p
          v-if="actionMessage || actionError"
          class="agent-action-note"
          :class="{ error: actionError }"
          :role="actionError ? 'alert' : 'status'"
          :aria-live="actionError ? 'assertive' : 'polite'"
        >
          {{ actionError || actionMessage }}
        </p>
      </div>

      <div class="workbench-block explanation">
        <div class="block-title">
          <h4>推荐解释</h4>
          <span>{{ apiDecision ? '后端证据已加载' : activeSuggestion ? '事件建议已生成' : '等待事件评估' }}</span>
        </div>
        <p class="suggestion-title">{{ recommendationTitle }}</p>
        <ul>
          <li v-for="item in explanationItems" :key="item">{{ item }}</li>
        </ul>
      </div>

      <div class="workbench-block execution-trace">
        <div class="block-title">
          <h4>执行追踪</h4>
          <span>采纳后回写复盘</span>
        </div>
        <ol>
          <li v-for="step in executionSteps" :key="step.label" :class="step.state">
            <span>{{ step.label }}</span>
            <em>{{ step.detail }}</em>
          </li>
        </ol>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import {
  adoptAgentDecision,
  getAgentDecisions,
  recommendAgentDecision,
  rejectAgentDecision,
  type AgentDecision,
} from '../../api/scheduling'
import type { ScheduleImpactComparison } from './ScheduleImpactPanel.vue'
import type { ScheduleFeedbackRecord } from './ScheduleFeedbackPanel.vue'
import type { ScheduleAgentSuggestion } from './ScheduleEventQueuePanel.vue'

const props = defineProps<{
  comparison: ScheduleImpactComparison
  latestFeedback: ScheduleFeedbackRecord | null
  activeSuggestion: ScheduleAgentSuggestion | null
  formalScheduleWriteback: 'pending' | 'saved'
}>()

const orderPools = [
  { label: '待排', count: 8, example: 'WO-DEMO-1008 等待齐套', tone: 'queued' },
  { label: '已排', count: 22, example: 'CNC / 热处理 / 装配已落位', tone: 'planned' },
  { label: '风险', count: 3, example: '缺料、设备、质量返工', tone: 'risk' },
  { label: '插单', count: 1, example: 'WO-RUSH-9001 客户承诺交期', tone: 'rush' },
]

const apiDecision = ref<AgentDecision | null>(null)
const apiAvailable = ref(false)
const actionBusy = ref(false)
const actionMode = ref<'recommend' | 'adopt' | 'reject' | ''>('')
const actionMessage = ref('')
const actionError = ref('')

onMounted(async () => {
  try {
    const decisions = await getAgentDecisions(5)
    apiDecision.value = decisions.find(item => item.boundedContext === 'Scheduling') ?? null
    apiAvailable.value = true
  } catch {
    apiDecision.value = null
    apiAvailable.value = false
  }
})

const canExecuteDecision = computed(() =>
  Boolean(apiDecision.value?.recommendedScenarioId) && apiDecision.value?.status === 'PendingReview'
)

const decisionSourceLabel = computed(() => {
  if (apiDecision.value) return `后端决策 / ${apiDecision.value.status}`
  return apiAvailable.value ? '后端暂无决策 / demo fallback' : 'API 不可用 / demo fallback'
})

const planOptions = computed(() => {
  if (apiDecision.value && apiDecision.value.scenarios.length > 0) {
    return apiDecision.value.scenarios.map(scenario => ({
      name: scenario.strategyName,
      otd: `${formatPercent(scenario.otdProjection)}%`,
      note: `利用率 ${formatPercent(scenario.utilizationProjection)}%，换线 ${Math.round(scenario.changeoverProjection)}min`,
      recommended: scenario.id === apiDecision.value?.recommendedScenarioId,
    }))
  }

  return [
    {
      name: '人工基线',
      otd: `${props.comparison.baseline.otd}%`,
      note: `延期 ${props.comparison.baseline.delayedOrders} 单`,
      recommended: false,
    },
    {
      name: 'Agent 推荐',
      otd: `${props.comparison.agent.otd}%`,
      note: `OTD +${props.comparison.otdImprovement}%`,
      recommended: true,
    },
    {
      name: '人工调整',
      otd: `${Math.max(props.comparison.agent.otd - 3, props.comparison.baseline.otd)}%`,
      note: '保留锁定期，局部改线',
      recommended: false,
    },
  ]
})

const recommendationTitle = computed(() => {
  const recommended = apiDecision.value?.scenarios.find(scenario => scenario.id === apiDecision.value?.recommendedScenarioId)
  if (recommended) return `后端推荐采用 ${recommended.strategyName}`
  return props.activeSuggestion?.title || '当前推荐采用 Agent 综合平衡方案'
})

const explanationItems = computed(() => {
  const recommended = apiDecision.value?.scenarios.find(scenario => scenario.id === apiDecision.value?.recommendedScenarioId)
  if (apiDecision.value && recommended) {
    return [
      recommended.explanation || `推荐方案 ${recommended.strategyName} 已生成。`,
      `证据链：${apiDecision.value.businessKey}；traceId ${apiDecision.value.traceId || '待生成'}。`,
      'Agent 只能给出建议，采纳或拒绝必须由有权限角色写入业务原因。',
    ]
  }

  if (props.activeSuggestion) {
    return [
      props.activeSuggestion.action,
      `影响分析：OTD ${props.activeSuggestion.otdImpact}，延期 ${props.activeSuggestion.delayImpact}，换线 ${props.activeSuggestion.changeoverImpact}。`,
      'Agent 只能给出建议，采纳或拒绝必须由调度员写入业务原因。',
    ]
  }

  return [
    '保护 8 小时锁定期内任务，避免直接改动现场已开工计划。',
    '优先保护临近交期工单，把急单放入锁定期后的第一个 CNC 空窗。',
    `牺牲项：换线 ${props.comparison.changeoverDeltaMinutes}min，换取延期减少 ${props.comparison.delayedOrdersReduced} 单。`,
  ]
})

const executionStatus = computed(() => props.latestFeedback ? '已进入反馈数据集' : '等待调度员决策')

const executionSteps = computed(() => [
  {
    label: '建议生成',
    detail: props.activeSuggestion?.title || 'Agent 综合平衡方案已生成',
    state: 'done',
  },
  {
    label: '人工决策',
    detail: props.latestFeedback?.decisionLabel || '等待采纳 / 拒绝原因',
    state: props.latestFeedback ? 'done' : 'current',
  },
  {
    label: '执行回写',
    detail: executionWritebackDetail.value,
    state: props.latestFeedback ? (requiresFormalScheduleSave.value ? 'current' : 'done') : 'pending',
  },
  {
    label: '审计复盘',
    detail: props.latestFeedback ? '可进入审计日志回放决策链' : '等待形成审计证据',
    state: props.latestFeedback ? 'current' : 'pending',
  },
])

const requiresFormalScheduleSave = computed(() =>
  props.latestFeedback?.decision === 'accepted'
  && props.latestFeedback.reasonCategory.endsWith('_event_agent')
  && props.formalScheduleWriteback !== 'saved'
)

const executionWritebackDetail = computed(() => {
  if (!props.latestFeedback) return '采纳后回写生产执行状态'
  if (props.formalScheduleWriteback === 'saved') {
    return '排产反馈已写入本地复盘记录；正式排产计划已更新'
  }
  if (requiresFormalScheduleSave.value) {
    return '排产反馈已写入本地复盘记录；正式计划待优化或保存'
  }
  return '排产反馈已写入本地复盘记录'
})

function formatPercent(value: number) {
  return Number.isFinite(value) ? Math.round(value) : 0
}

async function handleRecommend() {
  await runAction('recommend', async () => {
    const decision = await recommendAgentDecision({
      workshopId: 'ws-001',
      eventType: props.activeSuggestion ? 'EventReview' : 'ManualReview',
      sourceModule: props.activeSuggestion ? 'SchedulingEventQueue' : 'Scheduling',
      businessKeyType: 'Workshop',
      businessKeyValue: 'ws-001',
      severity: props.activeSuggestion ? 'Warning' : 'Info',
      objective: 'due_date',
      payload: props.activeSuggestion
        ? {
            eventId: props.activeSuggestion.eventId,
            title: props.activeSuggestion.title,
            action: props.activeSuggestion.action,
          }
        : undefined,
    })
    apiDecision.value = decision
    apiAvailable.value = true
    actionMessage.value = `后端已生成 ${decision.scenarios.length} 个方案，推荐 ${recommendedScenarioName(decision)}。`
  }, '后端建议生成失败，已保留 demo fallback。')
}

async function handleAdopt() {
  const decision = apiDecision.value
  const scenarioId = decision?.recommendedScenarioId
  if (!decision || !scenarioId) return

  await runAction('adopt', async () => {
    apiDecision.value = await adoptAgentDecision(
      decision.id,
      scenarioId,
      `调度员工作台采纳 ${recommendedScenarioName(decision)}。`
    )
    actionMessage.value = '推荐方案已采纳，后端已写入 Agent action、审计和采纳反馈。'
  }, '采纳失败，请确认当前用户具有 Admin 或 Planner 权限。')
}

async function handleReject() {
  const decision = apiDecision.value
  if (!decision) return

  await runAction('reject', async () => {
    apiDecision.value = await rejectAgentDecision(
      decision.id,
      '调度员工作台拒绝：保留人工锁定窗口，稍后重新评估。'
    )
    actionMessage.value = '推荐方案已拒绝，后端已写入 Agent action 和审计记录。'
  }, '拒绝失败，请确认当前用户具有 Admin 或 Planner 权限。')
}

async function runAction(
  mode: 'recommend' | 'adopt' | 'reject',
  action: () => Promise<void>,
  fallbackMessage: string
) {
  actionBusy.value = true
  actionMode.value = mode
  actionMessage.value = ''
  actionError.value = ''
  try {
    await action()
    apiAvailable.value = true
  } catch {
    apiAvailable.value = false
    actionError.value = fallbackMessage
  } finally {
    actionBusy.value = false
    actionMode.value = ''
  }
}

function recommendedScenarioName(decision: AgentDecision) {
  return decision.scenarios.find(scenario => scenario.id === decision.recommendedScenarioId)?.strategyName ?? '推荐方案'
}
</script>

<style scoped>
.agent-workbench-panel {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 12px 16px;
  border-bottom: 1px solid #e8e8e8;
  background: #f8fafc;
}

.workbench-heading,
.block-title {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: flex-start;
}

.eyebrow {
  display: block;
  margin-bottom: 3px;
  color: #0f766e;
  font-size: 12px;
  font-weight: 700;
}

h3,
h4,
p,
ul,
ol {
  margin: 0;
}

h3 {
  color: #0f172a;
  font-size: 16px;
}

h4 {
  color: #111827;
  font-size: 14px;
}

.status-pill,
.block-title span {
  flex: 0 0 auto;
  color: #64748b;
  font-size: 12px;
}

.status-pill {
  padding: 5px 10px;
  border: 1px solid #99f6e4;
  border-radius: 4px;
  background: #f0fdfa;
  color: #0f766e;
  font-weight: 700;
}

.workbench-grid {
  display: grid;
  grid-template-columns: minmax(240px, 0.9fr) minmax(280px, 1fr) minmax(320px, 1.25fr) minmax(260px, 0.95fr);
  gap: 10px;
}

.workbench-block {
  min-width: 0;
  padding: 12px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  background: #fff;
}

.pool-list,
.plan-grid,
.execution-trace ol {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 10px;
}

.pool-row,
.plan-card,
.execution-trace li {
  min-width: 0;
  padding: 8px;
  border-radius: 6px;
  background: #f8fafc;
}

.pool-row {
  display: grid;
  grid-template-columns: 34px 50px minmax(0, 1fr);
  gap: 8px;
  align-items: center;
}

.pool-row strong,
.plan-card strong {
  color: #0f172a;
  font-size: 20px;
  line-height: 1;
}

.pool-row span,
.plan-card span {
  color: #111827;
  font-size: 12px;
  font-weight: 700;
}

.pool-row em,
.plan-card em,
.execution-trace em {
  overflow: hidden;
  color: #64748b;
  font-size: 12px;
  font-style: normal;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.pool-row.risk {
  background: #fff7ed;
}

.pool-row.rush {
  background: #fff1f2;
}

.pool-row.planned {
  background: #f0fdf4;
}

.plan-card {
  border: 1px solid #e2e8f0;
}

.plan-card.recommended {
  border-color: #93c5fd;
  background: #eff6ff;
}

.agent-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 10px;
}

.agent-actions button {
  min-height: 30px;
  padding: 0 10px;
  border: 1px solid #cbd5e1;
  border-radius: 4px;
  background: #fff;
  color: #0f172a;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
}

.agent-actions button:first-child {
  border-color: #0f766e;
  background: #0f766e;
  color: #fff;
}

.agent-actions button:disabled {
  border-color: #e2e8f0;
  background: #f1f5f9;
  color: #94a3b8;
  cursor: not-allowed;
}

.agent-action-note {
  margin-top: 8px;
  color: #0f766e;
  font-size: 12px;
  line-height: 1.4;
}

.agent-action-note.error {
  color: #b45309;
}

.suggestion-title {
  margin-top: 10px;
  color: #0f172a;
  font-size: 13px;
  font-weight: 700;
}

.explanation ul {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-top: 8px;
  padding-left: 16px;
  color: #475569;
  font-size: 12px;
  line-height: 1.45;
}

.execution-trace ol {
  padding: 0;
  list-style: none;
}

.execution-trace li {
  display: flex;
  flex-direction: column;
  gap: 3px;
  border-left: 3px solid #cbd5e1;
}

.execution-trace li.done {
  border-left-color: #10b981;
}

.execution-trace li.current {
  border-left-color: #2563eb;
}

.execution-trace span {
  color: #111827;
  font-size: 12px;
  font-weight: 700;
}

@media (max-width: 1280px) {
  .workbench-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 760px) {
  .workbench-heading,
  .block-title {
    display: grid;
    grid-template-columns: 1fr;
  }

  .workbench-grid {
    grid-template-columns: 1fr;
  }
}
</style>
