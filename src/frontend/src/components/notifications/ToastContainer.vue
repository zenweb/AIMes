<template>
  <Teleport to="body">
    <div class="toast-container">
      <TransitionGroup name="toast">
        <div
          v-for="t in toasts"
          :key="t.id"
          class="toast-item"
          :class="t.type"
          :role="t.type === 'error' ? 'alert' : 'status'"
          :aria-live="t.type === 'error' ? 'assertive' : 'polite'"
          aria-atomic="true"
        >
          <div class="toast-icon" aria-hidden="true">
            <template v-if="t.type === 'error'">✕</template>
            <template v-else-if="t.type === 'warning'">⚠</template>
            <template v-else-if="t.type === 'info'">ℹ</template>
            <template v-else>✓</template>
          </div>
          <div class="toast-body">
            <div class="toast-title">{{ t.title }}</div>
            <div class="toast-msg">{{ t.message }}</div>
          </div>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import type { Toast } from '../../stores/notifications'

defineProps<{ toasts: Toast[] }>()
</script>

<style scoped>
.toast-container {
  position: fixed;
  top: 60px;
  right: 20px;
  z-index: 5000;
  display: flex;
  flex-direction: column;
  gap: 8px;
  pointer-events: none;
}

.toast-item {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 10px 14px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
  min-width: 280px;
  max-width: 380px;
  pointer-events: auto;
  background: #fff;
  border-left: 4px solid;
}

.toast-item.success { border-color: #52c41a; }
.toast-item.warning { border-color: #faad14; }
.toast-item.error { border-color: #ff4d4f; }
.toast-item.info { border-color: #1890ff; }

.toast-icon {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 700;
  flex-shrink: 0;
  margin-top: 1px;
}

.toast-item.success .toast-icon { background: #f6ffed; color: #52c41a; }
.toast-item.warning .toast-icon { background: #fffbe6; color: #faad14; }
.toast-item.error .toast-icon { background: #fff2f0; color: #ff4d4f; }
.toast-item.info .toast-icon { background: #e6f7ff; color: #1890ff; }

.toast-body { flex: 1; }
.toast-title { font-size: 13px; font-weight: 600; color: #333; }
.toast-msg { font-size: 12px; color: #888; margin-top: 2px; }

.toast-enter-active { transition: all 0.3s ease-out; }
.toast-leave-active { transition: all 0.2s ease-in; }
.toast-enter-from { transform: translateX(100%); opacity: 0; }
.toast-leave-to { transform: translateX(100%); opacity: 0; }
</style>
