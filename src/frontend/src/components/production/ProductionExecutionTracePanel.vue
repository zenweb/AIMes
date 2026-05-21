<template>
  <section class="execution-trace-panel" aria-label="生产执行闭环">
    <div class="trace-heading">
      <div>
        <span class="eyebrow">执行闭环</span>
        <h4>排产回写与 OTD 复盘</h4>
      </div>
      <span class="trace-count">{{ traces.length }} 条记录</span>
    </div>

    <div v-if="traces.length" class="trace-list">
      <article v-for="trace in traces" :key="trace.id" class="trace-card" :class="trace.type">
        <div class="trace-topline">
          <span class="trace-type">{{ trace.typeLabel }}</span>
          <span class="trace-time">{{ trace.createdAt }}</span>
        </div>
        <strong>{{ trace.title }}</strong>
        <p>{{ trace.detail }}</p>
        <div class="trace-tags">
          <span v-for="tag in trace.tags" :key="tag">{{ tag }}</span>
        </div>
      </article>
    </div>

    <div v-else class="trace-empty">
      <strong>等待执行回写</strong>
      <span>开工、完工或异常上报后会生成排产、质量、风险的联动记录。</span>
    </div>
  </section>
</template>

<script setup lang="ts">
export type ProductionTraceType = 'schedule' | 'quality' | 'risk'

export interface ProductionExecutionTrace {
  id: string
  type: ProductionTraceType
  typeLabel: string
  title: string
  detail: string
  tags: string[]
  createdAt: string
}

defineProps<{
  traces: ProductionExecutionTrace[]
}>()
</script>

<style scoped>
.execution-trace-panel {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 16px;
  padding: 12px;
  border: 1px solid #dbeafe;
  border-radius: 8px;
  background: #f8fbff;
}

.trace-heading {
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

h4,
p {
  margin: 0;
}

h4 {
  color: #111827;
  font-size: 15px;
}

.trace-count {
  flex: 0 0 auto;
  padding: 3px 8px;
  border-radius: 4px;
  background: #dbeafe;
  color: #1d4ed8;
  font-size: 12px;
  font-weight: 700;
}

.trace-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 8px;
}

.trace-card {
  display: flex;
  flex-direction: column;
  gap: 5px;
  padding: 10px;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  background: #fff;
}

.trace-card.schedule {
  border-color: #bfdbfe;
}

.trace-card.quality {
  border-color: #bbf7d0;
}

.trace-card.risk {
  border-color: #fecaca;
}

.trace-topline,
.trace-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.trace-type,
.trace-time,
.trace-tags span {
  padding: 2px 6px;
  border-radius: 4px;
  background: #f3f4f6;
  color: #4b5563;
  font-size: 12px;
}

.trace-card strong {
  color: #111827;
  font-size: 14px;
}

.trace-card p,
.trace-empty span {
  color: #4b5563;
  font-size: 12px;
  line-height: 1.45;
}

.trace-empty {
  display: flex;
  flex-direction: column;
  gap: 3px;
  padding: 10px;
  border: 1px dashed #cbd5e1;
  border-radius: 6px;
  background: #fff;
}

.trace-empty strong {
  color: #111827;
  font-size: 14px;
}
</style>
