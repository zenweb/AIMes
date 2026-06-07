<template>
  <section class="quality-mrb-panel" aria-label="质量 MRB 报废补料处置">
    <div class="panel-header">
      <div>
        <span class="eyebrow">质量 MRB</span>
        <h3>报废补料影响排产与 OTD</h3>
      </div>
      <span class="status-badge" :class="{ closed: record?.status === 'closed' }">
        {{ record?.statusLabel ?? '待 MRB 判定' }}
      </span>
    </div>

    <div class="mrb-grid">
      <div class="mrb-card">
        <label>质量事件</label>
        <strong>{{ preview.inspectionId }}</strong>
        <span>{{ preview.workOrderId }} · {{ preview.processName }}</span>
      </div>
      <div class="mrb-card">
        <label>不合格模式</label>
        <strong>{{ preview.defectQuantity }} 件</strong>
        <span>{{ preview.defectPattern }}</span>
      </div>
      <div class="mrb-card danger">
        <label>MRB 处置</label>
        <strong>{{ preview.dispositionLabel }}</strong>
        <span>{{ preview.materialBatchCode }} 补料</span>
      </div>
      <div class="mrb-card warning">
        <label>OTD 影响</label>
        <strong>{{ preview.otdImpact }}</strong>
        <span>{{ preview.dueAt }} 前复核</span>
      </div>
    </div>

    <div class="mrb-body">
      <div>
        <p>{{ preview.recommendedAction }}</p>
        <div class="trace-stack">
          <code>{{ preview.auditId }}</code>
          <code>{{ preview.traceId }}</code>
          <code>{{ preview.scheduleTraceId }}</code>
        </div>
      </div>
      <div class="action-list">
        <article v-for="action in preview.actions" :key="`${action.module}-${action.owner}`" class="action-card">
          <div>
            <span>{{ action.module }} · {{ action.owner }}</span>
            <strong>{{ action.action }}</strong>
          </div>
          <em>{{ action.result ?? action.dueAt }}</em>
          <code>{{ action.evidence }}</code>
        </article>
      </div>
    </div>

    <div class="button-row">
      <button v-if="!record" type="button" :aria-label="createActionLabel" @click="$emit('create')">
        生成 MRB 报废补料决策
      </button>
      <button v-else-if="record.status !== 'closed'" type="button" :aria-label="closeActionLabel" @click="$emit('close')">
        确认 MRB 处置闭环
      </button>
      <span v-else>闭环追踪：{{ record.closureAuditId }} / {{ record.closureTraceId }}</span>
    </div>

    <p v-if="syncMessage" class="sync-message" role="status" aria-live="polite">{{ syncMessage }}</p>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { QualityMrbDispositionRecord } from '../../utils/quality-mrb-disposition-sync'

const props = defineProps<{
  preview: QualityMrbDispositionRecord
  record: QualityMrbDispositionRecord | null
  syncMessage: string
}>()

defineEmits<{
  create: []
  close: []
}>()

const createActionLabel = computed(() => `生成 ${props.preview.workOrderId} ${props.preview.inspectionId} MRB 报废补料决策`)
const closeActionLabel = computed(() => `确认 ${props.preview.workOrderId} MRB 处置闭环`)
</script>

<style scoped>
.quality-mrb-panel {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 16px;
  padding: 14px 16px;
  border: 1px solid #fed7aa;
  border-radius: 8px;
  background: #fff7ed;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
}

.eyebrow {
  display: block;
  margin-bottom: 3px;
  color: #c2410c;
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

.status-badge {
  flex: 0 0 auto;
  padding: 5px 10px;
  border: 1px solid #fed7aa;
  border-radius: 4px;
  background: #ffedd5;
  color: #c2410c;
  font-size: 12px;
  font-weight: 700;
}

.status-badge.closed {
  border-color: #bbf7d0;
  background: #dcfce7;
  color: #15803d;
}

.mrb-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 8px;
}

.mrb-card {
  display: flex;
  flex-direction: column;
  gap: 3px;
  min-height: 78px;
  padding: 10px;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  background: #fff;
}

.mrb-card.warning {
  border-color: #fde68a;
  background: #fffbeb;
}

.mrb-card.danger {
  border-color: #fecaca;
  background: #fff1f2;
}

.mrb-card label,
.mrb-card span {
  color: #6b7280;
  font-size: 12px;
}

.mrb-card strong {
  color: #111827;
  font-size: 16px;
  line-height: 1.25;
}

.mrb-body {
  display: grid;
  grid-template-columns: minmax(0, 0.85fr) minmax(320px, 1.15fr);
  gap: 12px;
  padding: 10px;
  border: 1px solid #fed7aa;
  border-radius: 6px;
  background: #fff;
}

.mrb-body p,
.sync-message {
  color: #4b5563;
  font-size: 13px;
  line-height: 1.45;
}

.trace-stack,
.action-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.trace-stack {
  margin-top: 8px;
}

.trace-stack code,
.action-card code {
  color: #1d4ed8;
  font-size: 12px;
  overflow-wrap: anywhere;
}

.action-card {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 4px 8px;
  padding: 8px;
  border: 1px solid #fde68a;
  border-radius: 5px;
  background: #fffbeb;
}

.action-card span,
.action-card em {
  color: #92400e;
  font-size: 12px;
  font-style: normal;
  font-weight: 700;
}

.action-card strong {
  display: block;
  margin-top: 2px;
  color: #111827;
  font-size: 12px;
  line-height: 1.35;
}

.action-card code {
  grid-column: 1 / -1;
}

.button-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.button-row button {
  padding: 7px 12px;
  border: 1px solid #c2410c;
  border-radius: 4px;
  background: #c2410c;
  color: #fff;
  cursor: pointer;
  font-size: 12px;
  font-weight: 700;
}

.button-row span {
  color: #15803d;
  font-size: 12px;
  font-weight: 700;
}

.sync-message {
  color: #15803d;
  font-weight: 700;
}

@media (max-width: 1100px) {
  .mrb-grid,
  .mrb-body {
    grid-template-columns: 1fr;
  }
}
</style>
