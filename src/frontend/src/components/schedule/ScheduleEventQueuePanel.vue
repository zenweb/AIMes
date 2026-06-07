<template>
  <section class="event-queue-panel" aria-label="事件触发 Agent">
    <div class="queue-heading">
      <div>
        <span class="eyebrow">事件触发 Agent</span>
        <h3>三类事件重排队列</h3>
      </div>
      <span class="queue-count">{{ events.length }} 个待评估事件</span>
    </div>

    <div class="event-grid" role="list" :aria-label="eventListLabel(events.length)">
      <article
        v-for="event in events"
        :key="event.id"
        class="event-card"
        :class="[event.severity, { active: activeSuggestion?.eventId === event.id, resolved: event.resolved }]"
        role="listitem"
        :aria-label="eventItemLabel(event)"
      >
        <div class="event-topline">
          <span class="event-type">{{ event.typeLabel }}</span>
          <span class="event-severity">{{ event.severityLabel }}</span>
          <span v-if="event.resolved" class="event-resolved">已缓解</span>
        </div>
        <strong>{{ event.title }}</strong>
        <p>{{ event.impact }}</p>
        <ul v-if="event.evidence?.length" class="event-evidence">
          <li v-for="item in event.evidence" :key="item">{{ item }}</li>
        </ul>
        <p v-if="event.resolutionNote" class="resolution-note">{{ event.resolutionNote }}</p>
        <div class="event-meta">
          <span>{{ event.affectedOrders }}</span>
          <span>{{ event.window }}</span>
        </div>
        <button type="button" @click="$emit('generate', event)">
          {{ event.resolved ? '复核排产影响' : '生成重排建议' }}
        </button>
      </article>
    </div>

    <div
      class="agent-suggestion"
      :class="{ empty: !activeSuggestion }"
      role="status"
      aria-live="polite"
      aria-label="当前 Agent 建议"
    >
      <template v-if="activeSuggestion">
        <span class="record-label">当前 Agent 建议</span>
        <strong>{{ activeSuggestion.title }}</strong>
        <p>{{ activeSuggestion.action }}</p>
        <div class="suggestion-metrics">
          <span>OTD {{ activeSuggestion.otdImpact }}</span>
          <span>延期 {{ activeSuggestion.delayImpact }}</span>
          <span>换线 {{ activeSuggestion.changeoverImpact }}</span>
        </div>
        <div v-if="activeSuggestion.scenarioOptions?.length" class="scenario-package" aria-label="Agent 多方案决策包">
          <div class="scenario-package-heading">
            <span>Agent 多方案决策包</span>
            <strong>{{ activeSuggestion.recommendedScenarioName || '推荐方案' }}</strong>
          </div>
          <div class="scenario-grid">
            <article
              v-for="scenario in activeSuggestion.scenarioOptions"
              :key="scenario.id"
              class="scenario-row"
              :class="{ recommended: scenario.recommended }"
            >
              <div class="scenario-title">
                <strong>{{ scenario.name }}</strong>
                <span v-if="scenario.recommended">推荐</span>
              </div>
              <p>{{ scenario.strategy }}</p>
              <div class="scenario-metrics">
                <span>OTD {{ scenario.otdImpact }}</span>
                <span>延期 {{ scenario.delayImpact }}</span>
                <span>换线 {{ scenario.changeoverImpact }}</span>
              </div>
              <em>{{ scenario.rationale }}</em>
            </article>
          </div>
          <p v-if="activeSuggestion.decisionRationale" class="decision-rationale">
            {{ activeSuggestion.decisionRationale }}
          </p>
        </div>
        <button class="adopt-suggestion" type="button" @click="$emit('adopt', activeSuggestion)">
          采纳此建议
        </button>
      </template>
      <template v-else>
        <span class="record-label">当前 Agent 建议</span>
        <strong>等待事件评估</strong>
        <p>选择任一事件生成重排建议。</p>
      </template>
    </div>
  </section>
</template>

<script setup lang="ts">
export type ScheduleEventType = 'material' | 'equipment' | 'rush' | 'quality' | 'labor' | 'route' | 'anomaly' | 'monitoring' | 'engineering' | 'pilot' | 'risk' | 'production'
export type ScheduleEventSeverity = 'critical' | 'warning'

export interface ScheduleEventItem {
  id: string
  type: ScheduleEventType
  typeLabel: string
  severity: ScheduleEventSeverity
  severityLabel: string
  title: string
  impact: string
  affectedOrders: string
  window: string
  evidence?: string[]
  resolved?: boolean
  resolutionNote?: string
}

export interface ScheduleAgentSuggestion {
  eventId: string
  title: string
  action: string
  otdImpact: string
  delayImpact: string
  changeoverImpact: string
  recommendedScenarioName?: string
  decisionRationale?: string
  scenarioOptions?: ScheduleAgentScenario[]
}

export interface ScheduleAgentScenario {
  id: string
  selected?: boolean
  name: string
  strategy: string
  otdImpact: string
  delayImpact: string
  changeoverImpact: string
  rationale: string
  recommended?: boolean
}

defineProps<{
  events: ScheduleEventItem[]
  activeSuggestion: ScheduleAgentSuggestion | null
}>()

defineEmits<{
  generate: [event: ScheduleEventItem]
  adopt: [suggestion: ScheduleAgentSuggestion]
}>()

function eventListLabel(count: number) {
  return `排产事件重排队列：${count} 个待评估事件`
}

function eventItemLabel(event: ScheduleEventItem) {
  const resolved = event.resolved ? '，已缓解' : ''
  return `${event.typeLabel}：${event.title}，${event.severityLabel}，${event.affectedOrders}，${event.window}${resolved}`
}
</script>

<style scoped>
.event-queue-panel {
  display: grid;
  grid-template-columns: minmax(0, 1.8fr) minmax(260px, 0.8fr);
  gap: 12px;
  padding: 12px 16px;
  background: #fff;
  border-bottom: 1px solid #e8e8e8;
}

.queue-heading {
  grid-column: 1 / -1;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
}

.eyebrow {
  display: block;
  margin-bottom: 2px;
  color: #1d4ed8;
  font-size: 12px;
  font-weight: 700;
}

h3,
p {
  margin: 0;
}

h3 {
  color: #111827;
  font-size: 16px;
}

.queue-count {
  flex: 0 0 auto;
  padding: 5px 10px;
  border: 1px solid #bfdbfe;
  border-radius: 4px;
  background: #eff6ff;
  color: #1d4ed8;
  font-size: 12px;
  font-weight: 700;
}

.event-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 8px;
}

.event-card {
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 0;
  padding: 10px;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  background: #fafafa;
}

.event-card.critical {
  border-color: #fecaca;
  background: #fff1f2;
}

.event-card.warning {
  border-color: #fde68a;
  background: #fffbeb;
}

.event-card.resolved {
  border-color: #bbf7d0;
  background: #f0fdf4;
}

.event-card.active {
  border-color: #60a5fa;
  box-shadow: inset 0 0 0 1px #60a5fa;
}

.event-topline,
.event-meta,
.suggestion-metrics {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.event-type,
.event-severity,
.event-resolved,
.event-meta span,
.suggestion-metrics span {
  padding: 2px 6px;
  border-radius: 4px;
  background: rgba(255, 255, 255, 0.75);
  color: #4b5563;
  font-size: 12px;
}

.scenario-package {
  display: grid;
  gap: 8px;
  margin-top: 4px;
  padding: 8px;
  border: 1px solid #bfdbfe;
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.82);
}

.scenario-package-heading {
  display: flex;
  justify-content: space-between;
  gap: 8px;
  align-items: center;
}

.scenario-package-heading span {
  color: #1d4ed8;
  font-size: 12px;
  font-weight: 700;
}

.scenario-package-heading strong {
  color: #0f172a;
  font-size: 12px;
}

.scenario-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 6px;
}

.scenario-row {
  display: grid;
  gap: 5px;
  min-width: 0;
  padding: 7px;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  background: #f8fafc;
}

.scenario-row.recommended {
  border-color: #60a5fa;
  background: #eff6ff;
}

.scenario-title,
.scenario-metrics {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
  align-items: center;
}

.scenario-title strong {
  color: #111827;
  font-size: 12px;
}

.scenario-title span,
.scenario-metrics span {
  padding: 2px 5px;
  border-radius: 4px;
  background: #dbeafe;
  color: #1d4ed8;
  font-size: 11px;
  font-weight: 700;
}

.scenario-row p,
.scenario-row em,
.decision-rationale {
  color: #475569;
  font-size: 11px;
  line-height: 1.4;
}

.scenario-row em {
  font-style: normal;
}

.decision-rationale {
  padding-top: 2px;
  color: #1e40af;
  font-weight: 700;
}

.event-resolved {
  background: #dcfce7;
  color: #15803d;
  font-weight: 700;
}

.event-card strong,
.agent-suggestion strong {
  color: #111827;
  font-size: 14px;
}

.event-card p,
.agent-suggestion p {
  color: #4b5563;
  font-size: 12px;
  line-height: 1.45;
}

.event-evidence {
  margin: 0;
  padding-left: 16px;
  color: #6b7280;
  font-size: 12px;
  line-height: 1.45;
}

.event-card .resolution-note {
  color: #15803d;
  font-weight: 700;
}

.event-card button {
  align-self: flex-start;
  margin-top: auto;
  padding: 5px 10px;
  border: 1px solid #2563eb;
  border-radius: 4px;
  background: #fff;
  color: #1d4ed8;
  cursor: pointer;
  font-size: 12px;
  font-weight: 700;
  transition: background 0.2s, color 0.2s;
}

.event-card button:hover {
  background: #2563eb;
  color: #fff;
}

.agent-suggestion {
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 0;
  padding: 10px;
  border: 1px solid #bfdbfe;
  border-radius: 6px;
  background: #eff6ff;
}

.adopt-suggestion {
  align-self: flex-start;
  padding: 6px 12px;
  border: 1px solid #1d4ed8;
  border-radius: 4px;
  background: #1d4ed8;
  color: #fff;
  cursor: pointer;
  font-size: 12px;
  font-weight: 700;
  transition: background 0.2s;
}

.adopt-suggestion:hover {
  background: #1e40af;
}

.agent-suggestion.empty {
  border-color: #e5e7eb;
  background: #fafafa;
}

.record-label {
  color: #1d4ed8;
  font-size: 12px;
  font-weight: 700;
}

@media (max-width: 1180px) {
  .event-queue-panel,
  .event-grid,
  .scenario-grid {
    grid-template-columns: 1fr;
  }
}
</style>
