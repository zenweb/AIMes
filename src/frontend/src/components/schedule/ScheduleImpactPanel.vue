<template>
  <section class="impact-panel" aria-label="排产影响分析">
    <div class="impact-summary">
      <div>
        <span class="eyebrow">调度员 Agent</span>
        <h3>基线 vs Agent 方案</h3>
      </div>
      <div class="improvement-badge">
        OTD +{{ comparison.otdImprovement }}%
      </div>
    </div>

    <div class="comparison-grid">
      <div class="comparison-card baseline">
        <span class="card-label">人工基线</span>
        <strong>{{ comparison.baseline.otd }}%</strong>
        <span>延期 {{ comparison.baseline.delayedOrders }} 单</span>
      </div>
      <div class="comparison-card agent">
        <span class="card-label">Agent 推荐</span>
        <strong>{{ comparison.agent.otd }}%</strong>
        <span>延期 {{ comparison.agent.delayedOrders }} 单</span>
      </div>
      <div class="comparison-card">
        <span class="card-label">延期减少</span>
        <strong>{{ comparison.delayedOrdersReduced }}</strong>
        <span>重点订单优先保护</span>
      </div>
      <div class="comparison-card">
        <span class="card-label">换线变化</span>
        <strong>{{ comparison.changeoverDeltaMinutes }}min</strong>
        <span>瓶颈设备批次合并</span>
      </div>
      <div class="comparison-card">
        <span class="card-label">利用率变化</span>
        <strong>+{{ comparison.utilizationDelta }}%</strong>
        <span>空闲窗口再分配</span>
      </div>
    </div>

    <div class="reason-strip">
      <div v-for="reason in comparison.reasons" :key="reason" class="reason-item">
        {{ reason }}
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
export interface ScheduleImpactComparison {
  baseline: {
    otd: number
    delayedOrders: number
  }
  agent: {
    otd: number
    delayedOrders: number
  }
  otdImprovement: number
  delayedOrdersReduced: number
  changeoverDeltaMinutes: number
  utilizationDelta: number
  reasons: string[]
}

defineProps<{
  comparison: ScheduleImpactComparison
}>()
</script>

<style scoped>
.impact-panel {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 12px 16px;
  background: #fff;
  border-bottom: 1px solid #e8e8e8;
}

.impact-summary {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
}

.eyebrow {
  display: block;
  margin-bottom: 2px;
  color: #1677ff;
  font-size: 12px;
  font-weight: 700;
}

h3 {
  margin: 0;
  color: #1f2937;
  font-size: 16px;
}

.improvement-badge {
  flex: 0 0 auto;
  padding: 6px 12px;
  border-radius: 4px;
  background: #f6ffed;
  border: 1px solid #b7eb8f;
  color: #237804;
  font-weight: 700;
}

.comparison-grid {
  display: grid;
  grid-template-columns: repeat(5, minmax(120px, 1fr));
  gap: 8px;
}

.comparison-card {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-height: 64px;
  padding: 8px 10px;
  border: 1px solid #f0f0f0;
  border-radius: 6px;
  background: #fafafa;
}

.comparison-card.baseline {
  background: #fff7e6;
  border-color: #ffd591;
}

.comparison-card.agent {
  background: #e6f4ff;
  border-color: #91caff;
}

.card-label,
.comparison-card span:last-child {
  color: #6b7280;
  font-size: 12px;
}

.comparison-card strong {
  color: #111827;
  font-size: 22px;
  line-height: 1.15;
}

.reason-strip {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.reason-item {
  padding: 4px 8px;
  border-radius: 4px;
  background: #f5f5f5;
  color: #374151;
  font-size: 12px;
}

@media (max-width: 1100px) {
  .comparison-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>
