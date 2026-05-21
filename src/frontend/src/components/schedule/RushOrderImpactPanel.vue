<template>
  <section class="rush-impact-panel" aria-label="插单影响分析">
    <div class="rush-header">
      <div>
        <span class="eyebrow">插单前先算账</span>
        <h3>{{ impact.orderNumber }} 急单影响分析</h3>
      </div>
      <div class="decision-badge">
        {{ impact.recommendation }}
      </div>
    </div>

    <div class="impact-grid">
      <div class="impact-card">
        <span>受影响工单</span>
        <strong>{{ impact.affectedOrders.length }}</strong>
        <em>{{ impact.affectedOrders.join(' / ') }}</em>
      </div>
      <div class="impact-card danger">
        <span>新增延期</span>
        <strong>{{ impact.delayHours }}h</strong>
        <em>锁定期外顺延</em>
      </div>
      <div class="impact-card warning">
        <span>换线增加</span>
        <strong>+{{ impact.changeoverIncreaseMinutes }}min</strong>
        <em>{{ impact.bottleneckEquipment }}</em>
      </div>
      <div class="impact-card material">
        <span>缺料变化</span>
        <strong>{{ impact.materialShortage }}</strong>
        <em>{{ impact.materialAction }}</em>
      </div>
    </div>

    <div class="option-list">
      <button
        v-for="option in impact.options"
        :key="option.name"
        class="option-chip"
        :class="{ recommended: option.recommended }"
        type="button"
      >
        <span>{{ option.name }}</span>
        <small>{{ option.result }}</small>
      </button>
    </div>
  </section>
</template>

<script setup lang="ts">
export interface RushOrderImpact {
  orderNumber: string
  affectedOrders: string[]
  delayHours: number
  changeoverIncreaseMinutes: number
  materialShortage: string
  materialAction: string
  bottleneckEquipment: string
  recommendation: string
  options: {
    name: string
    result: string
    recommended: boolean
  }[]
}

defineProps<{
  impact: RushOrderImpact
}>()
</script>

<style scoped>
.rush-impact-panel {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 12px 16px;
  background: #fff;
  border-bottom: 1px solid #e8e8e8;
}

.rush-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
}

.eyebrow {
  display: block;
  margin-bottom: 2px;
  color: #b45309;
  font-size: 12px;
  font-weight: 700;
}

h3 {
  margin: 0;
  color: #1f2937;
  font-size: 16px;
}

.decision-badge {
  flex: 0 0 auto;
  padding: 6px 12px;
  border-radius: 4px;
  background: #fff7e6;
  border: 1px solid #ffd591;
  color: #ad4e00;
  font-weight: 700;
}

.impact-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(130px, 1fr));
  gap: 8px;
}

.impact-card {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-height: 68px;
  padding: 8px 10px;
  border: 1px solid #f0f0f0;
  border-radius: 6px;
  background: #fafafa;
}

.impact-card.danger {
  background: #fff1f0;
  border-color: #ffa39e;
}

.impact-card.warning {
  background: #fffbe6;
  border-color: #ffe58f;
}

.impact-card.material {
  background: #f6ffed;
  border-color: #b7eb8f;
}

.impact-card span,
.impact-card em {
  color: #6b7280;
  font-size: 12px;
  font-style: normal;
}

.impact-card strong {
  color: #111827;
  font-size: 22px;
  line-height: 1.15;
}

.option-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.option-chip {
  display: flex;
  gap: 8px;
  align-items: center;
  padding: 6px 10px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  background: #fff;
  color: #374151;
  font-size: 12px;
}

.option-chip.recommended {
  border-color: #1677ff;
  background: #e6f4ff;
  color: #0958d9;
}

.option-chip span {
  font-weight: 700;
}

.option-chip small {
  color: inherit;
}

@media (max-width: 1100px) {
  .impact-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>
