<template>
  <section class="quality-rework-panel" aria-label="质量返工排产影响">
    <div class="panel-header">
      <div>
        <span class="eyebrow">质量事件闭环</span>
        <h3>返工影响排产与 OTD</h3>
      </div>
      <span class="status-badge">待调度复核</span>
    </div>

    <div class="impact-grid">
      <div class="impact-card">
        <label>质量事件</label>
        <strong>{{ event.inspectionId }}</strong>
        <span>{{ event.workOrderId }} · {{ event.processName }}</span>
      </div>
      <div class="impact-card">
        <label>关联对象</label>
        <strong>{{ event.equipmentCode }}</strong>
        <span>{{ event.materialBatchCode }} · {{ event.batchCode }}</span>
      </div>
      <div class="impact-card warning">
        <label>返工数量</label>
        <strong>{{ event.defectQuantity }} 件</strong>
        <span>预计返工 {{ event.reworkHours }}h</span>
      </div>
      <div class="impact-card danger">
        <label>OTD 影响</label>
        <strong>{{ event.otdImpact }}</strong>
        <span>若不插入返工窗口</span>
      </div>
      <div class="impact-card">
        <label>根因证据</label>
        <strong>{{ event.rootCause }}</strong>
        <span>来自根因分析</span>
      </div>
    </div>

    <div class="action-row">
      <div class="action-copy">
        <p>{{ event.recommendedAction }}</p>
        <ul>
          <li v-for="item in event.evidence" :key="item">{{ item }}</li>
        </ul>
      </div>
      <button type="button" :aria-label="createActionLabel" @click="$emit('create', event)">生成返工排产事件</button>
    </div>

    <div v-if="syncMessage" class="sync-message" role="status" aria-live="polite">{{ syncMessage }}</div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { QualityReworkImpact } from '../../utils/quality-rework-sync'

const props = defineProps<{
  event: QualityReworkImpact
  syncMessage: string
}>()

defineEmits<{
  create: [event: QualityReworkImpact]
}>()

const createActionLabel = computed(() => `生成返工排产事件：${props.event.workOrderId} ${props.event.inspectionId}`)
</script>

<style scoped>
.quality-rework-panel {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 16px;
  padding: 14px 16px;
  border: 1px solid #fecaca;
  border-radius: 8px;
  background: #fff7f7;
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
  color: #be123c;
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
  border: 1px solid #fecaca;
  border-radius: 4px;
  background: #fff1f2;
  color: #be123c;
  font-size: 12px;
  font-weight: 700;
}

.impact-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 8px;
}

.impact-card {
  display: flex;
  flex-direction: column;
  gap: 3px;
  min-height: 76px;
  padding: 10px;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  background: #fff;
}

.impact-card.warning {
  border-color: #fde68a;
  background: #fffbeb;
}

.impact-card.danger {
  border-color: #fecaca;
  background: #fff1f2;
}

.impact-card label,
.impact-card span {
  color: #6b7280;
  font-size: 12px;
}

.impact-card strong {
  color: #111827;
  font-size: 18px;
  line-height: 1.2;
}

.action-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  padding: 10px;
  border: 1px solid #fecaca;
  border-radius: 6px;
  background: #fff;
}

.action-row p,
.sync-message {
  color: #4b5563;
  font-size: 13px;
  line-height: 1.45;
}

.action-copy {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.action-copy ul {
  margin: 0;
  padding-left: 16px;
  color: #6b7280;
  font-size: 12px;
  line-height: 1.5;
}

.action-row button {
  flex: 0 0 auto;
  padding: 7px 12px;
  border: 1px solid #be123c;
  border-radius: 4px;
  background: #be123c;
  color: #fff;
  cursor: pointer;
  font-size: 12px;
  font-weight: 700;
}

.sync-message {
  color: #15803d;
  font-weight: 700;
}

@media (max-width: 1100px) {
  .impact-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .action-row {
    align-items: flex-start;
    flex-direction: column;
  }
}
</style>
