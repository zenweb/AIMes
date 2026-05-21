<template>
  <section class="shortage-action-panel" aria-label="缺料采购协同">
    <div class="shortage-header">
      <div>
        <span class="eyebrow">缺料采购协同</span>
        <h3>{{ shortage.materialCode }} 排产缺口处置</h3>
      </div>
      <span class="risk-badge" :class="shortage.status">{{ statusText }}</span>
    </div>

    <div class="shortage-grid">
      <div class="shortage-card">
        <span>影响工单</span>
        <strong>{{ shortage.affectedOrders }}</strong>
        <em>{{ shortage.scheduleWindow }}</em>
      </div>
      <div class="shortage-card danger">
        <span>缺口</span>
        <strong>{{ shortage.shortageQuantity }} {{ shortage.unit }}</strong>
        <em>当前可用 {{ shortage.availableQuantity }} {{ shortage.unit }}</em>
      </div>
      <div class="shortage-card">
        <span>建议动作</span>
        <strong>{{ shortage.recommendation }}</strong>
        <em>{{ shortage.supplierName }}</em>
      </div>
      <div class="shortage-card alternate">
        <span>替代料</span>
        <strong>{{ shortage.alternateMaterialCode }}</strong>
        <em>{{ shortage.alternateMaterialName }}</em>
      </div>
    </div>

    <div class="shortage-actions">
      <button type="button" class="btn primary" @click="$emit('expedite')">生成采购加急单</button>
      <button type="button" class="btn secondary" @click="$emit('alternate')">启用替代料建议</button>
      <button type="button" class="btn receive" :disabled="!hasExpediteOrder" @click="$emit('receive')">模拟加急收货</button>
    </div>

    <div class="shortage-trace" :class="{ empty: !trace }">
      <template v-if="trace">
        <span>最近联动</span>
        <strong>{{ trace.title }}</strong>
        <p>{{ trace.detail }}</p>
      </template>
      <template v-else>
        <span>最近联动</span>
        <strong>等待采购动作</strong>
        <p>缺料事件尚未生成采购处置动作。</p>
      </template>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'

export interface ShortageAction {
  materialCode: string
  materialName: string
  shortageQuantity: number
  availableQuantity: number
  unit: string
  affectedOrders: string
  scheduleWindow: string
  recommendation: string
  supplierName: string
  alternateMaterialCode: string
  alternateMaterialName: string
  status: 'open' | 'ordered' | 'mitigated'
}

export interface ShortageTrace {
  title: string
  detail: string
}

const props = defineProps<{
  shortage: ShortageAction
  trace: ShortageTrace | null
  hasExpediteOrder: boolean
}>()

defineEmits<{
  expedite: []
  alternate: []
  receive: []
}>()

const statusText = computed(() => {
  if (props.shortage.status === 'mitigated') return '风险下降'
  if (props.shortage.status === 'ordered') return '已加急'
  return '待处置'
})
</script>

<style scoped>
.shortage-action-panel {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 14px;
  padding: 12px 14px;
  border: 1px solid #fed7aa;
  border-radius: 8px;
  background: #fffaf5;
}

.shortage-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
}

.eyebrow {
  display: block;
  margin-bottom: 2px;
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

.risk-badge {
  flex: 0 0 auto;
  padding: 4px 9px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 700;
}

.risk-badge.open {
  background: #fff1f2;
  color: #be123c;
}

.risk-badge.ordered {
  background: #fffbeb;
  color: #b45309;
}

.risk-badge.mitigated {
  background: #f0fdf4;
  color: #15803d;
}

.shortage-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 8px;
}

.shortage-card {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-height: 66px;
  padding: 8px 10px;
  border: 1px solid #fde68a;
  border-radius: 6px;
  background: #fff;
}

.shortage-card.danger {
  border-color: #fecaca;
  background: #fff1f2;
}

.shortage-card.alternate {
  border-color: #bfdbfe;
  background: #eff6ff;
}

.shortage-card span,
.shortage-card em,
.shortage-trace span,
.shortage-trace p {
  color: #6b7280;
  font-size: 12px;
  font-style: normal;
}

.shortage-card strong {
  color: #111827;
  font-size: 16px;
}

.shortage-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.btn {
  padding: 6px 12px;
  border: 1px solid transparent;
  border-radius: 4px;
  cursor: pointer;
  font-size: 13px;
  font-weight: 700;
}

.btn:disabled {
  cursor: not-allowed;
  opacity: 0.55;
}

.btn.primary {
  background: #ea580c;
  border-color: #ea580c;
  color: #fff;
}

.btn.secondary {
  background: #fff;
  border-color: #2563eb;
  color: #1d4ed8;
}

.btn.receive {
  background: #16a34a;
  border-color: #16a34a;
  color: #fff;
}

.shortage-trace {
  display: flex;
  flex-direction: column;
  gap: 3px;
  padding: 8px 10px;
  border: 1px solid #bbf7d0;
  border-radius: 6px;
  background: #f0fdf4;
}

.shortage-trace.empty {
  border-color: #e5e7eb;
  background: #fff;
}

.shortage-trace strong {
  color: #111827;
  font-size: 14px;
}

@media (max-width: 1100px) {
  .shortage-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>
