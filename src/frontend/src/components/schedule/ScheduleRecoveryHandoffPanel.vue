<template>
  <section v-if="activePackage" class="recovery-handoff-panel" aria-label="交期恢复执行包交接">
    <div class="handoff-heading">
      <div>
        <span class="eyebrow">交付恢复交接</span>
        <h3>交期恢复执行包交接</h3>
      </div>
      <span class="status-pill">{{ activePackage.statusLabel }}</span>
    </div>

    <div class="handoff-summary">
      <div class="summary-main">
        <strong>{{ activePackage.title }}</strong>
        <p>{{ activePackage.summary }}</p>
        <div class="trace-row">
          <code>{{ activePackage.auditCode }}</code>
          <code>{{ activePackage.traceId }}</code>
        </div>
        <div v-if="activePackage.purchaseActionSummary" class="purchase-closure-summary">
          <strong>采购责任动作：{{ activePackage.purchaseActionSummary }}</strong>
          <code>{{ activePackage.purchaseActionAuditCode }} / {{ activePackage.purchaseActionTraceId }}</code>
        </div>
        <div v-if="activePackage.qualityActionSummary" class="quality-closure-summary">
          <strong>质量责任动作：{{ activePackage.qualityActionSummary }}</strong>
          <code>{{ activePackage.qualityActionAuditCode }} / {{ activePackage.qualityActionTraceId }}</code>
        </div>
      </div>
      <div class="metric-strip">
        <span>OTD {{ activePackage.otdImpact }}</span>
        <span>延期 {{ activePackage.delayImpact }}</span>
        <span>换线 {{ activePackage.changeoverImpact }}</span>
      </div>
    </div>

    <div class="handoff-grid">
      <article class="handoff-block execution-gate">
        <div class="block-title">
          <h4>执行门禁</h4>
          <span>{{ activePackage.owner }} / {{ activePackage.dueAt }}</span>
        </div>
        <dl>
          <div>
            <dt>排产窗口</dt>
            <dd>{{ activePackage.scheduleWindow }}</dd>
          </div>
          <div>
            <dt>排产动作</dt>
            <dd>{{ activePackage.scheduleAction }}</dd>
          </div>
          <div>
            <dt>风险门禁</dt>
            <dd>{{ activePackage.riskSuggestion }}</dd>
          </div>
        </dl>
      </article>

      <article class="handoff-block module-handoff">
        <div class="block-title">
          <h4>模块交接</h4>
          <span>{{ activePackage.dispatchSteps.length }} 个责任动作</span>
        </div>
        <ol>
          <li v-for="step in activePackage.dispatchSteps" :key="step.evidence" class="handoff-step">
            <div>
              <strong>{{ step.module }}</strong>
              <span>{{ step.status === 'closed' ? '已闭合' : step.owner }}</span>
            </div>
            <p>{{ step.action }}</p>
            <p v-if="step.result" class="handoff-result">{{ step.result }}</p>
            <code>{{ step.evidence }}</code>
          </li>
        </ol>
      </article>

      <article class="handoff-block audit-state">
        <div class="block-title">
          <h4>采纳与审计</h4>
          <span>{{ activePackage.status === 'closed' ? '交接已闭环' : activeRecoverySuggestion ? '排产建议已生成' : '等待排产复核' }}</span>
        </div>
        <ul>
          <li>
            <strong>Agent 建议</strong>
            <span>{{ activeRecoverySuggestion?.title || '等待调度员在事件队列生成重排建议' }}</span>
          </li>
          <li>
            <strong>人工决策</strong>
            <span>{{ latestFeedback?.decisionLabel || '等待采纳 / 调整原因' }}</span>
          </li>
          <li>
            <strong>审计去向</strong>
            <span>{{ activePackage.closureTraceId || 'OTD 证据链、风险队列和审计回放已挂载同一追踪号' }}</span>
          </li>
          <li v-if="activePackage.purchaseActionSummary">
            <strong>采购动作</strong>
            <span>{{ activePackage.purchaseActionSummary }}</span>
          </li>
          <li v-if="activePackage.qualityActionSummary">
            <strong>质量动作</strong>
            <span>{{ activePackage.qualityActionSummary }}</span>
          </li>
        </ul>
        <div v-if="activePackage.closureSummary" class="closure-summary">
          <strong>{{ activePackage.closureSummary }}</strong>
          <code>{{ activePackage.closureAuditCode }}</code>
        </div>
        <button
          v-if="!activePackage.closureSummary"
          type="button"
          class="close-handoff"
          @click="$emit('close-handoff', activePackage.id)"
        >
          确认执行交接闭环
        </button>
      </article>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { AssistantRecoveryPackage } from '../../utils/assistant-action-package-sync'
import type { ScheduleAgentSuggestion } from './ScheduleEventQueuePanel.vue'
import type { ScheduleFeedbackRecord } from './ScheduleFeedbackPanel.vue'

const props = defineProps<{
  packages: AssistantRecoveryPackage[]
  activeSuggestion: ScheduleAgentSuggestion | null
  latestFeedback: ScheduleFeedbackRecord | null
}>()

defineEmits<{
  'close-handoff': [id: string]
}>()

const activePackage = computed(() => props.packages[0] ?? null)
const activeRecoverySuggestion = computed(() => {
  if (!activePackage.value || !props.activeSuggestion) return null
  return props.activeSuggestion.eventId === `evt-assistant-recovery-${activePackage.value.id}`
    ? props.activeSuggestion
    : null
})
</script>

<style scoped>
.recovery-handoff-panel {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 12px 16px;
  border-bottom: 1px solid #dbeafe;
  background: #f8fbff;
}

.handoff-heading,
.block-title {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: flex-start;
}

.eyebrow {
  display: block;
  margin-bottom: 3px;
  color: #1d4ed8;
  font-size: 12px;
  font-weight: 700;
}

h3,
h4,
p,
dl,
dd,
ol,
ul {
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
  color: #475569;
  font-size: 12px;
}

.status-pill {
  padding: 5px 10px;
  border: 1px solid #bfdbfe;
  border-radius: 4px;
  background: #eff6ff;
  color: #1d4ed8;
  font-weight: 700;
}

.handoff-summary,
.handoff-grid {
  display: grid;
  gap: 10px;
}

.handoff-summary {
  grid-template-columns: minmax(0, 1fr) minmax(220px, 0.35fr);
  align-items: stretch;
}

.summary-main,
.metric-strip,
.handoff-block {
  min-width: 0;
  border: 1px solid #dbeafe;
  border-radius: 8px;
  background: #fff;
}

.summary-main {
  display: flex;
  flex-direction: column;
  gap: 7px;
  padding: 12px;
}

.summary-main strong {
  color: #0f172a;
  font-size: 15px;
}

.summary-main p,
.handoff-block dd,
.handoff-step p,
.audit-state li span {
  color: #475569;
  font-size: 12px;
  line-height: 1.45;
}

.trace-row,
.metric-strip {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.trace-row code,
.handoff-step code {
  padding: 2px 6px;
  border-radius: 4px;
  background: #eff6ff;
  color: #1e40af;
  font-size: 11px;
  word-break: break-all;
}

.metric-strip {
  align-content: center;
  padding: 12px;
}

.metric-strip span {
  flex: 1 1 88px;
  padding: 8px;
  border-radius: 6px;
  background: #ecfeff;
  color: #0f766e;
  font-size: 12px;
  font-weight: 700;
  text-align: center;
}

.handoff-grid {
  grid-template-columns: minmax(260px, 0.9fr) minmax(360px, 1.35fr) minmax(260px, 0.9fr);
}

.handoff-block {
  padding: 12px;
}

.execution-gate dl,
.module-handoff ol,
.audit-state ul {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 10px;
  padding: 0;
  list-style: none;
}

.execution-gate dl div,
.handoff-step,
.audit-state li {
  min-width: 0;
  padding: 8px;
  border-radius: 6px;
  background: #f8fafc;
}

.execution-gate dt,
.handoff-step strong,
.audit-state li strong {
  color: #111827;
  font-size: 12px;
  font-weight: 700;
}

.handoff-step {
  display: flex;
  flex-direction: column;
  gap: 5px;
  border-left: 3px solid #2563eb;
}

.handoff-step div {
  display: flex;
  justify-content: space-between;
  gap: 8px;
}

.handoff-step div span {
  overflow: hidden;
  color: #64748b;
  font-size: 12px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.handoff-result {
  color: #166534;
  font-size: 12px;
  line-height: 1.45;
}

.audit-state li {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.closure-summary {
  display: grid;
  gap: 5px;
  margin-top: 10px;
  padding: 8px;
  border: 1px solid #bbf7d0;
  border-radius: 6px;
  background: #f0fdf4;
}

.closure-summary strong {
  color: #166534;
  font-size: 12px;
  line-height: 1.45;
}

.closure-summary code {
  color: #15803d;
  font-size: 11px;
  word-break: break-all;
}

.purchase-closure-summary,
.quality-closure-summary {
  display: grid;
  gap: 5px;
  margin-top: 10px;
  padding: 8px;
  border: 1px solid #bfdbfe;
  border-radius: 6px;
  background: #eff6ff;
}

.purchase-closure-summary strong,
.quality-closure-summary strong {
  color: #1d4ed8;
  font-size: 12px;
  line-height: 1.45;
}

.purchase-closure-summary code,
.quality-closure-summary code {
  color: #1d4ed8;
  font-size: 11px;
  word-break: break-all;
}

.quality-closure-summary {
  border-color: #bbf7d0;
  background: #f0fdf4;
}

.quality-closure-summary strong,
.quality-closure-summary code {
  color: #166534;
}

.close-handoff {
  margin-top: 10px;
  padding: 7px 12px;
  border: 1px solid #15803d;
  border-radius: 4px;
  background: #15803d;
  color: #fff;
  cursor: pointer;
  font-size: 12px;
  font-weight: 700;
}

.close-handoff:hover {
  background: #166534;
}

@media (max-width: 1180px) {
  .handoff-summary,
  .handoff-grid {
    grid-template-columns: 1fr;
  }
}
</style>
