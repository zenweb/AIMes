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
          <span>基线 / Agent / 人工</span>
        </div>
        <div class="plan-grid">
          <div v-for="plan in planOptions" :key="plan.name" class="plan-card" :class="{ recommended: plan.recommended }">
            <span>{{ plan.name }}</span>
            <strong>{{ plan.otd }}</strong>
            <em>{{ plan.note }}</em>
          </div>
        </div>
      </div>

      <div class="workbench-block explanation">
        <div class="block-title">
          <h4>推荐解释</h4>
          <span>{{ activeSuggestion ? '事件建议已生成' : '等待事件评估' }}</span>
        </div>
        <p class="suggestion-title">{{ activeSuggestion?.title || '当前推荐采用 Agent 综合平衡方案' }}</p>
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
import { computed } from 'vue'
import type { ScheduleImpactComparison } from './ScheduleImpactPanel.vue'
import type { ScheduleFeedbackRecord } from './ScheduleFeedbackPanel.vue'
import type { ScheduleAgentSuggestion } from './ScheduleEventQueuePanel.vue'

const props = defineProps<{
  comparison: ScheduleImpactComparison
  latestFeedback: ScheduleFeedbackRecord | null
  activeSuggestion: ScheduleAgentSuggestion | null
}>()

const orderPools = [
  { label: '待排', count: 8, example: 'WO-DEMO-1008 等待齐套', tone: 'queued' },
  { label: '已排', count: 22, example: 'CNC / 热处理 / 装配已落位', tone: 'planned' },
  { label: '风险', count: 3, example: '缺料、设备、质量返工', tone: 'risk' },
  { label: '插单', count: 1, example: 'WO-RUSH-9001 客户承诺交期', tone: 'rush' },
]

const planOptions = computed(() => [
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
])

const explanationItems = computed(() => {
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
    detail: props.latestFeedback ? '排产反馈已写入本地复盘记录' : '采纳后回写生产执行状态',
    state: props.latestFeedback ? 'done' : 'pending',
  },
  {
    label: '审计复盘',
    detail: props.latestFeedback ? '可进入审计日志回放决策链' : '等待形成审计证据',
    state: props.latestFeedback ? 'current' : 'pending',
  },
])
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
