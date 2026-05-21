<template>
  <section class="feedback-panel" aria-label="排产方案反馈">
    <div class="feedback-copy">
      <span class="eyebrow">人机协同复盘</span>
      <h3>采纳 / 拒绝原因</h3>
      <p>每次调度员选择都会沉淀为反馈记录，用于后续审计、复盘和模型改进。</p>
    </div>

    <div class="feedback-controls">
      <label>
        原因
        <select v-model="selectedCategory">
          <option v-for="category in categories" :key="category.value" :value="category.value">
            {{ category.label }}
          </option>
        </select>
      </label>

      <label class="detail-field">
        说明
        <input
          v-model.trim="reasonDetail"
          type="text"
          placeholder="例如：保护临近交期订单，接受少量加班"
        />
      </label>

      <div class="decision-actions">
        <button class="btn reject" type="button" :disabled="submitting" @click="submitDecision('rejected')">
          拒绝方案
        </button>
        <button class="btn accept" type="button" :disabled="submitting" @click="submitDecision('accepted')">
          采纳方案
        </button>
      </div>
    </div>

    <div class="feedback-record" :class="{ empty: !latestFeedback }">
      <template v-if="latestFeedback">
        <span class="record-label">最近反馈</span>
        <strong>{{ latestFeedback.decisionLabel }}</strong>
        <span>{{ latestFeedback.categoryLabel }} · {{ latestFeedback.objectiveLabel }}</span>
        <em>{{ latestFeedback.reasonDetail || '未填写补充说明' }}</em>
        <small>{{ latestFeedback.createdAt }}</small>
      </template>
      <template v-else>
        <span class="record-label">最近反馈</span>
        <strong>等待调度员决策</strong>
        <span>当前 Agent 推荐尚未进入反馈数据集</span>
      </template>
    </div>

    <p v-if="syncNote" class="sync-note">{{ syncNote }}</p>
  </section>
</template>

<script setup lang="ts">
import { ref } from 'vue'

export type ScheduleFeedbackDecision = 'accepted' | 'rejected'

export interface ScheduleFeedbackPayload {
  decision: ScheduleFeedbackDecision
  reasonCategory: string
  categoryLabel: string
  reasonDetail: string
}

export interface ScheduleFeedbackRecord {
  decision: ScheduleFeedbackDecision
  decisionLabel: string
  reasonCategory: string
  categoryLabel: string
  reasonDetail: string
  objectiveLabel: string
  createdAt: string
}

defineProps<{
  latestFeedback: ScheduleFeedbackRecord | null
  submitting: boolean
  syncNote: string
}>()

const emit = defineEmits<{
  decision: [payload: ScheduleFeedbackPayload]
}>()

const categories = [
  { value: 'due_date_protection', label: '保护交期' },
  { value: 'rush_order', label: '急单插入' },
  { value: 'material_shortage', label: '物料约束' },
  { value: 'equipment_bottleneck', label: '瓶颈设备' },
  { value: 'changeover_cost', label: '换线成本' },
  { value: 'manual_override', label: '人工经验' },
]

const selectedCategory = ref(categories[0].value)
const reasonDetail = ref('保护临近交期订单，接受少量加班')

function submitDecision(decision: ScheduleFeedbackDecision) {
  const category = categories.find(item => item.value === selectedCategory.value) ?? categories[0]
  emit('decision', {
    decision,
    reasonCategory: category.value,
    categoryLabel: category.label,
    reasonDetail: reasonDetail.value,
  })
}
</script>

<style scoped>
.feedback-panel {
  display: grid;
  grid-template-columns: minmax(180px, 0.7fr) minmax(0, 1.8fr) minmax(240px, 0.9fr);
  gap: 12px;
  align-items: stretch;
  padding: 12px 16px;
  background: #fff;
  border-bottom: 1px solid #e8e8e8;
}

.feedback-copy {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.eyebrow {
  color: #0f766e;
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

p,
.feedback-record span,
.feedback-record em,
.feedback-record small {
  color: #6b7280;
  font-size: 12px;
  font-style: normal;
}

.feedback-controls {
  display: grid;
  grid-template-columns: minmax(104px, 0.55fr) minmax(180px, 1fr) max-content;
  gap: 8px;
  align-items: end;
  min-width: 0;
}

label {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
  color: #374151;
  font-size: 12px;
  font-weight: 700;
}

select,
input {
  height: 34px;
  padding: 0 10px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  color: #111827;
  font-size: 13px;
}

select:focus,
input:focus {
  border-color: #0f766e;
  outline: none;
  box-shadow: 0 0 0 2px rgba(15, 118, 110, 0.14);
}

.decision-actions {
  display: flex;
  gap: 8px;
  min-width: max-content;
}

.btn {
  height: 34px;
  padding: 0 12px;
  border: 1px solid transparent;
  border-radius: 4px;
  cursor: pointer;
  font-size: 13px;
  font-weight: 700;
  transition: background 0.2s, border-color 0.2s, color 0.2s;
  white-space: nowrap;
}

.btn:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

.btn.accept {
  background: #0f766e;
  border-color: #0f766e;
  color: #fff;
}

.btn.accept:hover:not(:disabled) {
  background: #115e59;
}

.btn.reject {
  background: #fff;
  border-color: #fca5a5;
  color: #b91c1c;
}

.btn.reject:hover:not(:disabled) {
  background: #fff1f2;
}

.feedback-record {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
  min-height: 76px;
  padding: 8px 10px;
  border: 1px solid #99f6e4;
  border-radius: 6px;
  background: #f0fdfa;
}

.feedback-record.empty {
  border-color: #e5e7eb;
  background: #fafafa;
}

.record-label {
  font-weight: 700;
}

.feedback-record strong {
  color: #111827;
  font-size: 15px;
}

.sync-note {
  grid-column: 1 / -1;
  color: #0f766e;
  font-size: 12px;
}

@media (max-width: 1180px) {
  .feedback-panel,
  .feedback-controls {
    grid-template-columns: 1fr;
  }

  .decision-actions {
    justify-content: flex-start;
  }
}
</style>
