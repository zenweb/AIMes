<template>
  <Teleport to="body">
    <div v-if="visible" class="modal-overlay" @click.self="$emit('close')">
      <div class="modal-container">
        <div class="modal-header">
          <h3>排产方案采纳反馈</h3>
          <button class="close-btn" @click="$emit('close')">✕</button>
        </div>
        <div class="modal-body">
          <p class="desc">记录您对 AI 排产方案的调整原因，用于持续改进排产模型。</p>

          <div class="form-group">
            <label>调整原因分类 <span class="required">*</span></label>
            <select v-model="selectedCategory" class="form-select">
              <option value="" disabled>请选择原因分类</option>
              <option v-for="cat in categories" :key="cat.value" :value="cat.value">
                {{ cat.label }}
              </option>
            </select>
          </div>

          <div class="form-group">
            <label>详细说明</label>
            <textarea
              v-model="reasonDetail"
              class="form-textarea"
              rows="3"
              placeholder="请详细描述调整原因（可选）"
            ></textarea>
          </div>

          <div v-if="error" class="error-msg" role="alert" aria-live="assertive">{{ error }}</div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-cancel" @click="$emit('close')">取消</button>
          <button
            class="btn btn-submit"
            :disabled="!selectedCategory || submitting"
            @click="handleSubmit"
          >
            {{ submitting ? '提交中...' : '提交反馈' }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import * as api from '../../api/scheduling'
import { errorMessage } from '../../utils/error-message'

const props = defineProps<{
  visible: boolean
  schedulePlanId: string
  workshopId: string
  optimizationObjective?: string
  movedOrderIds?: string[]
  aiTraceId?: string
}>()

const emit = defineEmits<{
  close: []
  submitted: []
}>()

const categories = [
  { value: 'dueDateAdvanced', label: '交期提前' },
  { value: 'dueDatePostponed', label: '交期推迟' },
  { value: 'urgentInsertion', label: '紧急插单' },
  { value: 'materialShortage', label: '物料未齐套' },
  { value: 'equipmentFailure', label: '设备故障' },
  { value: 'capacityInsufficient', label: '产能不足' },
  { value: 'staffShortage', label: '人员缺勤' },
  { value: 'rework', label: '质量返工' },
  { value: 'other', label: '其他' },
]

const selectedCategory = ref('')
const reasonDetail = ref('')
const submitting = ref(false)
const error = ref('')

async function handleSubmit() {
  if (!selectedCategory.value) return

  submitting.value = true
  error.value = ''

  try {
    await api.submitAdoptionFeedback({
      schedulePlanId: props.schedulePlanId,
      workshopId: props.workshopId,
      optimizationObjective: props.optimizationObjective,
      reasonCategory: selectedCategory.value,
      reasonDetail: reasonDetail.value || undefined,
      movedOrderIds: props.movedOrderIds,
      aiTraceId: props.aiTraceId,
    })
    emit('submitted')
  } catch (e: unknown) {
    error.value = `提交失败: ${errorMessage(e, '未知错误')}`
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-container {
  background: white;
  border-radius: 8px;
  width: 480px;
  max-width: 90vw;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.15);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #f0f0f0;
}

.modal-header h3 {
  margin: 0;
  font-size: 16px;
  color: #333;
}

.close-btn {
  background: none;
  border: none;
  font-size: 18px;
  cursor: pointer;
  color: #999;
  padding: 4px;
  line-height: 1;
}

.close-btn:hover {
  color: #333;
}

.modal-body {
  padding: 20px;
}

.desc {
  margin: 0 0 16px;
  font-size: 13px;
  color: #666;
  line-height: 1.5;
}

.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  margin-bottom: 6px;
  font-size: 14px;
  color: #333;
  font-weight: 500;
}

.required {
  color: #ff4d4f;
}

.form-select {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  font-size: 14px;
  color: #333;
  background: white;
}

.form-select:focus {
  border-color: #1890ff;
  outline: none;
  box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
}

.form-textarea {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  font-size: 14px;
  color: #333;
  resize: vertical;
  font-family: inherit;
  box-sizing: border-box;
}

.form-textarea:focus {
  border-color: #1890ff;
  outline: none;
  box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
}

.error-msg {
  padding: 8px 12px;
  background: #fff2f0;
  border: 1px solid #ffccc7;
  border-radius: 4px;
  color: #ff4d4f;
  font-size: 13px;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  padding: 12px 20px;
  border-top: 1px solid #f0f0f0;
}

.btn {
  padding: 6px 16px;
  border: 1px solid transparent;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: background 0.2s;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-submit {
  background: #1890ff;
  color: white;
  border-color: #1890ff;
}

.btn-submit:hover:not(:disabled) {
  background: #40a9ff;
}

.btn-cancel {
  background: #fff;
  color: #333;
  border-color: #d9d9d9;
}

.btn-cancel:hover {
  border-color: #1890ff;
  color: #1890ff;
}
</style>
