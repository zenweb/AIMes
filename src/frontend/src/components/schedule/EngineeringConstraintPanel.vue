<template>
  <section class="engineering-constraint-panel" aria-label="工程数据约束解释">
    <div class="constraint-heading">
      <div>
        <span class="eyebrow">工程数据约束</span>
        <h3>BOM 与工艺路线进入排产解释</h3>
      </div>
      <div class="constraint-actions">
        <span class="constraint-count">{{ constraints.length }} 条约束命中</span>
        <button type="button" class="sync-button" @click="syncEngineeringEvidence">同步工程证据</button>
      </div>
    </div>

    <div class="constraint-grid">
      <article
        v-for="constraint in constraints"
        :key="constraint.id"
        class="constraint-item"
        :class="constraint.kind"
      >
        <div class="constraint-topline">
          <span>{{ constraint.kindLabel }}</span>
          <strong>{{ constraint.sourceCode }}</strong>
        </div>
        <h4>{{ constraint.title }}</h4>
        <p>{{ constraint.explanation }}</p>
        <div v-if="constraint.evidence?.length" class="constraint-evidence">
          <span v-for="item in constraint.evidence" :key="item">{{ item }}</span>
        </div>
        <div class="constraint-meta">
          <span>{{ constraint.affectedOrders }}</span>
          <span>{{ constraint.agentUsage }}</span>
        </div>
      </article>
    </div>

    <div class="constraint-trace">
      <span>排产解释引用</span>
      <strong>{{ trace.summary }}</strong>
      <p>{{ trace.detail }}</p>
    </div>

    <div class="sync-note">
      <strong>{{ syncTitle }}</strong>
      <span>{{ syncMessage }}</span>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { upsertOtdEvidenceChainRecord } from '../../utils/otd-evidence-chain-sync'

export type EngineeringConstraintKind = 'bom' | 'route' | 'labor'

export interface EngineeringConstraintItem {
  id: string
  kind: EngineeringConstraintKind
  kindLabel: string
  sourceCode: string
  title: string
  explanation: string
  evidence?: string[]
  affectedOrders: string
  agentUsage: string
}

export interface EngineeringConstraintTrace {
  summary: string
  detail: string
}

const props = defineProps<{
  constraints: EngineeringConstraintItem[]
  trace: EngineeringConstraintTrace
}>()

const syncTitle = ref('等待同步')
const syncMessage = ref('同步后，BOM、工艺路线、质量门和技能资质约束会进入 OTD 复盘证据链。')

function traceIdFor(constraint: EngineeringConstraintItem) {
  return `TRACE-ENG-${constraint.id.replace(/[^a-z0-9]+/gi, '-').toUpperCase()}`
}

function statusLabelFor(constraint: EngineeringConstraintItem) {
  if (constraint.kind === 'labor') return '待资质复核'
  if (constraint.kind === 'route') return '已约束排产'
  return '已引用'
}

function syncEngineeringEvidence() {
  const createdAt = new Date().toISOString()
  props.constraints.forEach((constraint) => {
    upsertOtdEvidenceChainRecord({
      id: `engineering-constraint-${constraint.id}`,
      stage: '工程约束',
      title: `${constraint.kindLabel}：${constraint.title}`,
      summary: `${constraint.explanation} 影响：${constraint.affectedOrders}；Agent 用途：${constraint.agentUsage}。`,
      object: constraint.sourceCode,
      source: 'AI 排产 / 工程数据约束',
      traceId: traceIdFor(constraint),
      status: constraint.kind === 'labor' ? 'active' : 'ready',
      statusLabel: statusLabelFor(constraint),
      createdAt,
    })
  })
  syncTitle.value = '工程约束证据已同步 OTD 复盘'
  syncMessage.value = `${props.constraints.length} 条工程约束已写入统一证据链，可在报表中心、Agent 治理和审计回放核对。`
}
</script>

<style scoped>
.engineering-constraint-panel {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 12px 16px;
  background: #fff;
  border-bottom: 1px solid #e8e8e8;
}

.constraint-heading {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
}

.constraint-actions {
  display: flex;
  flex: 0 0 auto;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 8px;
}

.eyebrow {
  display: block;
  margin-bottom: 2px;
  color: #047857;
  font-size: 12px;
  font-weight: 700;
}

h3,
h4,
p {
  margin: 0;
}

h3 {
  color: #111827;
  font-size: 16px;
}

.constraint-count {
  flex: 0 0 auto;
  padding: 5px 10px;
  border: 1px solid #a7f3d0;
  border-radius: 4px;
  background: #ecfdf5;
  color: #047857;
  font-size: 12px;
  font-weight: 700;
}

.sync-button {
  padding: 5px 10px;
  border: 1px solid #047857;
  border-radius: 4px;
  background: #047857;
  color: #fff;
  cursor: pointer;
  font-size: 12px;
  font-weight: 700;
}

.constraint-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 8px;
}

.constraint-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 0;
  min-height: 112px;
  padding: 10px;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  background: #fafafa;
}

.constraint-item.bom {
  border-color: #a7f3d0;
  background: #f0fdf4;
}

.constraint-item.route {
  border-color: #bfdbfe;
  background: #eff6ff;
}

.constraint-item.labor {
  border-color: #ddd6fe;
  background: #f5f3ff;
}

.constraint-topline,
.constraint-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  align-items: center;
}

.constraint-evidence {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.constraint-evidence span {
  padding: 2px 6px;
  border-radius: 4px;
  background: rgba(255, 255, 255, 0.75);
  color: #6b7280;
  font-size: 12px;
}

.constraint-topline span,
.constraint-meta span {
  padding: 2px 6px;
  border-radius: 4px;
  background: rgba(255, 255, 255, 0.75);
  color: #4b5563;
  font-size: 12px;
}

.constraint-topline strong {
  color: #111827;
  font-size: 12px;
}

.constraint-item h4 {
  color: #111827;
  font-size: 14px;
}

.constraint-item p,
.constraint-trace p {
  color: #4b5563;
  font-size: 12px;
  line-height: 1.45;
}

.constraint-trace,
.sync-note {
  display: grid;
  grid-template-columns: auto minmax(180px, 0.35fr) minmax(0, 1fr);
  gap: 8px;
  align-items: center;
  padding: 8px 10px;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  background: #f9fafb;
}

.sync-note {
  grid-template-columns: minmax(120px, 0.25fr) minmax(0, 1fr);
  border-color: #a7f3d0;
  background: #f0fdf4;
}

.constraint-trace span {
  color: #047857;
  font-size: 12px;
  font-weight: 700;
}

.constraint-trace strong,
.sync-note strong {
  color: #111827;
  font-size: 13px;
}

.sync-note span {
  color: #4b5563;
  font-size: 12px;
  line-height: 1.45;
}

@media (max-width: 1180px) {
  .constraint-grid,
  .constraint-trace,
  .sync-note {
    grid-template-columns: 1fr;
  }
}
</style>
