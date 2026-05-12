<template>
  <MainLayout>
    <div class="risk-board">
      <!-- 风险概览 KPI -->
      <div class="kpi-row">
        <div class="kpi-card critical">
          <div class="kpi-icon">🔴</div>
          <div class="kpi-body">
            <span class="kpi-value">{{ riskCounts.critical }}</span>
            <span class="kpi-label">严重风险</span>
          </div>
        </div>
        <div class="kpi-card warning">
          <div class="kpi-icon">🟡</div>
          <div class="kpi-body">
            <span class="kpi-value">{{ riskCounts.warning }}</span>
            <span class="kpi-label">一般预警</span>
          </div>
        </div>
        <div class="kpi-card healthy">
          <div class="kpi-icon">🟢</div>
          <div class="kpi-body">
            <span class="kpi-value">{{ riskCounts.healthy }}</span>
            <span class="kpi-label">正常</span>
          </div>
        </div>
        <div class="kpi-card info">
          <div class="kpi-icon">📋</div>
          <div class="kpi-body">
            <span class="kpi-value">{{ riskCounts.total }}</span>
            <span class="kpi-label">监控总数</span>
          </div>
        </div>
      </div>

      <!-- 风险分类面板 -->
      <div class="risk-grid">
        <!-- 工单准时风险 -->
        <div class="risk-section">
          <div class="section-header">
            <h3>📅 工单延期风险</h3>
            <span class="section-badge" :class="orderRiskBadge">{{ orderRiskSummary }}</span>
          </div>
          <div class="section-body">
            <div v-for="item in orderRisks" :key="item.id" class="risk-row" :class="item.level">
              <span class="risk-indicator"></span>
              <span class="risk-order">{{ item.orderNumber }}</span>
              <span class="risk-product">{{ item.productName }}</span>
              <span class="risk-progress">
                <div class="progress-bar">
                  <div class="progress-fill" :style="{ width: item.progress + '%', background: item.level === 'critical' ? '#ff4d4f' : item.level === 'warning' ? '#faad14' : '#52c41a' }"></div>
                </div>
                <span class="progress-text">{{ item.progress }}%</span>
              </span>
              <span class="risk-duedate">{{ item.dueDate }}</span>
              <span class="risk-gap" :class="item.level">{{ item.gapText }}</span>
              <span class="risk-detail">{{ item.riskDetail }}</span>
            </div>
            <div v-if="orderRisks.length === 0" class="empty-state">暂无工单延期风险</div>
          </div>
        </div>

        <!-- 设备故障预警 -->
        <div class="risk-section">
          <div class="section-header">
            <h3>⚙️ 设备故障预警</h3>
            <span class="section-badge" :class="equipRiskBadge">{{ equipRiskSummary }}</span>
          </div>
          <div class="section-body">
            <div v-for="item in equipmentRisks" :key="item.id" class="risk-row" :class="item.level">
              <span class="risk-indicator"></span>
              <span class="risk-order">{{ item.equipmentName }}</span>
              <span class="risk-product">{{ item.type }}</span>
              <span class="risk-progress">
                <div class="progress-bar">
                  <div class="progress-fill" :style="{ width: item.healthScore + '%', background: item.healthScore < 40 ? '#ff4d4f' : item.healthScore < 70 ? '#faad14' : '#52c41a' }"></div>
                </div>
                <span class="progress-text">{{ item.healthScore }}分</span>
              </span>
              <span class="risk-duedate">{{ item.lastMaintenance }}</span>
              <span class="risk-gap" :class="item.level">{{ item.daysSinceMaintenance }}天未维护</span>
              <span class="risk-detail">{{ item.riskDetail }}</span>
            </div>
            <div v-if="equipmentRisks.length === 0" class="empty-state">暂无设备故障预警</div>
          </div>
        </div>

        <!-- 物料齐套风险 -->
        <div class="risk-section">
          <div class="section-header">
            <h3>📦 物料齐套风险</h3>
            <span class="section-badge" :class="materialRiskBadge">{{ materialRiskSummary }}</span>
          </div>
          <div class="section-body">
            <div v-for="item in materialRisks" :key="item.code" class="risk-row" :class="item.level">
              <span class="risk-indicator"></span>
              <span class="risk-order">{{ item.materialName }}</span>
              <span class="risk-product">{{ item.materialCode }}</span>
              <span class="risk-progress">
                <div class="progress-bar">
                  <div class="progress-fill" :style="{ width: item.stockPercent + '%', background: item.level === 'critical' ? '#ff4d4f' : item.level === 'warning' ? '#faad14' : '#52c41a' }"></div>
                </div>
                <span class="progress-text">{{ item.available }}/{{ item.required }}</span>
              </span>
              <span class="risk-duedate">{{ item.affectedOrders }}</span>
              <span class="risk-gap" :class="item.level">{{ item.stockPercent < 30 ? '缺料' : item.stockPercent < 60 ? '紧张' : '充足' }}</span>
              <span class="risk-detail">{{ item.riskDetail }}</span>
            </div>
            <div v-if="materialRisks.length === 0" class="empty-state">暂无物料齐套风险</div>
          </div>
        </div>

        <!-- 产能瓶颈预警 -->
        <div class="risk-section">
          <div class="section-header">
            <h3>🏭 产能瓶颈预警</h3>
            <span class="section-badge" :class="bottleneckRiskBadge">{{ bottleneckRiskSummary }}</span>
          </div>
          <div class="section-body">
            <div v-for="item in bottleneckRisks" :key="item.id" class="risk-row" :class="item.level">
              <span class="risk-indicator"></span>
              <span class="risk-order">{{ item.equipmentName }}</span>
              <span class="risk-product">{{ item.type }}</span>
              <span class="risk-progress">
                <div class="progress-bar">
                  <div class="progress-fill" :style="{ width: item.utilization + '%', background: item.utilization > 90 ? '#ff4d4f' : item.utilization > 75 ? '#faad14' : '#52c41a' }"></div>
                </div>
                <span class="progress-text">{{ item.utilization }}%</span>
              </span>
              <span class="risk-duedate">{{ item.queueOrders }}单排队</span>
              <span class="risk-gap" :class="item.level">{{ item.queueHours }}h积压</span>
              <span class="risk-detail">{{ item.riskDetail }}</span>
            </div>
            <div v-if="bottleneckRisks.length === 0" class="empty-state">暂无产能瓶颈</div>
          </div>
        </div>
      </div>
    </div>
  </MainLayout>
</template>

<script setup lang="ts">
import { reactive } from 'vue'
import MainLayout from '../layout/MainLayout.vue'

// ---- 风险计数 ----
const riskCounts = reactive({
  critical: 3,
  warning: 5,
  healthy: 12,
  total: 20,
})

// ---- 工单延期风险 ----
const orderRisks = [
  { id: '1', orderNumber: 'WO-2026-0042', productName: '精密转接座', progress: 35, dueDate: '2026-05-14', gapText: '滞后2天', level: 'critical', riskDetail: 'CNC-001 故障导致停工8小时，预计延期2天' },
  { id: '2', orderNumber: 'WO-2026-0045', productName: '壳体组件A型', progress: 60, dueDate: '2026-05-15', gapText: '滞后1天', level: 'warning', riskDetail: '前道工序未完成，物料未齐套' },
  { id: '3', orderNumber: 'WO-2026-0048', productName: '传动轴总成', progress: 80, dueDate: '2026-05-16', gapText: '进度正常', level: 'healthy', riskDetail: '按计划推进中' },
  { id: '4', orderNumber: 'WO-2026-0039', productName: '液压阀体', progress: 10, dueDate: '2026-05-13', gapText: '滞后3天', level: 'critical', riskDetail: '来料检验不合格，需重新采购' },
  { id: '5', orderNumber: 'WO-2026-0050', productName: '法兰盘DN100', progress: 50, dueDate: '2026-05-17', gapText: '进度正常', level: 'healthy', riskDetail: '按计划推进中' },
  { id: '6', orderNumber: 'WO-2026-0041', productName: '轴承座总成', progress: 45, dueDate: '2026-05-14', gapText: '滞后1天', level: 'warning', riskDetail: 'CNC-003 排队积压，排程等待中' },
]

// ---- 设备故障预警 ----
const equipmentRisks = [
  { id: 'EQ-001', equipmentName: 'CNC-001 加工中心', type: 'CNC', healthScore: 32, lastMaintenance: '2026-04-10', daysSinceMaintenance: 32, level: 'critical', riskDetail: '主轴振动异常（+47%），建议本周检修' },
  { id: 'EQ-005', equipmentName: '注塑机-2号', type: '注塑', healthScore: 55, lastMaintenance: '2026-03-25', daysSinceMaintenance: 48, level: 'warning', riskDetail: '液压油温度偏高，已超保养周期18天' },
  { id: 'EQ-008', equipmentName: '热处理炉', type: '热处理', healthScore: 78, lastMaintenance: '2026-04-28', daysSinceMaintenance: 14, level: 'healthy', riskDetail: '运行正常，下次保养剩余16天' },
  { id: 'EQ-003', equipmentName: 'CNC-003 加工中心', type: 'CNC', healthScore: 45, lastMaintenance: '2026-04-05', daysSinceMaintenance: 37, level: 'warning', riskDetail: '冷却液位偏低，刀库换刀异响' },
]

// ---- 物料齐套风险 ----
const materialRisks = [
  { code: 'AL-6061', materialName: '铝合金6061', materialCode: 'AL-6061', available: 45, required: 200, stockPercent: 22, affectedOrders: '影响3个工单', level: 'critical', riskDetail: '供应商交期延误5天，建议紧急调拨' },
  { code: 'OIL-HM46', materialName: '抗磨液压油', materialCode: 'OIL-HM46', available: 35, required: 50, stockPercent: 70, affectedOrders: '设备维护用', level: 'warning', riskDetail: '库存低于安全库存线，建议本周补货' },
  { code: 'BRG-6205', materialName: '6205轴承', materialCode: 'BRG-6205', available: 85, required: 100, stockPercent: 85, affectedOrders: '装配线备用', level: 'healthy', riskDetail: '库存充足，可维持正常生产' },
]

// ---- 产能瓶颈预警 ----
const bottleneckRisks = [
  { id: 'BN-01', equipmentName: '热处理炉', type: '热处理', utilization: 95, queueOrders: 4, queueHours: 16, level: 'critical', riskDetail: '唯一热处理设备，超负荷运行，建议评估外协' },
  { id: 'BN-02', equipmentName: 'CNC-001 加工中心', type: 'CNC', utilization: 88, queueOrders: 3, queueHours: 8, level: 'warning', riskDetail: '关键工序设备，即将满负荷运转' },
  { id: 'BN-03', equipmentName: '装配线-1号', type: '装配', utilization: 72, queueOrders: 2, queueHours: 4, level: 'healthy', riskDetail: '产能充足，可承接更多订单' },
]

// ---- 派生状态 ----
const orderRiskSummary = orderRisks.filter(r => r.level !== 'healthy').length
  ? `${orderRisks.filter(r => r.level !== 'healthy').length}个工单风险`
  : '全部正常'
const orderRiskBadge = orderRisks.some(r => r.level === 'critical') ? 'critical' : orderRisks.some(r => r.level === 'warning') ? 'warning' : 'healthy'

const equipRiskSummary = equipmentRisks.filter(r => r.level !== 'healthy').length
  ? `${equipmentRisks.filter(r => r.level !== 'healthy').length}台设备预警`
  : '全部正常'
const equipRiskBadge = equipmentRisks.some(r => r.level === 'critical') ? 'critical' : equipmentRisks.some(r => r.level === 'warning') ? 'warning' : 'healthy'

const materialRiskSummary = materialRisks.filter(r => r.level !== 'healthy').length
  ? `${materialRisks.filter(r => r.level !== 'healthy').length}种物料预警`
  : '全部充足'
const materialRiskBadge = materialRisks.some(r => r.level === 'critical') ? 'critical' : materialRisks.some(r => r.level === 'warning') ? 'warning' : 'healthy'

const bottleneckRiskSummary = bottleneckRisks.filter(r => r.level !== 'healthy').length
  ? `${bottleneckRisks.filter(r => r.level !== 'healthy').length}个瓶颈预警`
  : '产能均衡'
const bottleneckRiskBadge = bottleneckRisks.some(r => r.level === 'critical') ? 'critical' : bottleneckRisks.some(r => r.level === 'warning') ? 'warning' : 'healthy'
</script>

<style scoped>
.risk-board {
  padding: 24px;
  max-width: 1400px;
  margin: 0 auto;
  overflow-y: auto;
  height: 100%;
}

/* KPI */
.kpi-row {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 16px;
  margin-bottom: 20px;
}

.kpi-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 18px 20px;
  border-radius: 8px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
}

.kpi-card.critical { background: #fff2f0; }
.kpi-card.warning { background: #fffbe6; }
.kpi-card.healthy { background: #f6ffed; }
.kpi-card.info { background: #e6f7ff; }

.kpi-icon {
  width: 44px;
  height: 44px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  flex-shrink: 0;
}

.kpi-body { display: flex; flex-direction: column; gap: 2px; }
.kpi-value { font-size: 28px; font-weight: 700; line-height: 1.2; }
.kpi-card.critical .kpi-value { color: #ff4d4f; }
.kpi-card.warning .kpi-value { color: #faad14; }
.kpi-card.healthy .kpi-value { color: #52c41a; }
.kpi-card.info .kpi-value { color: #1890ff; }
.kpi-label { font-size: 13px; color: #666; }

/* 风险分类网格 */
.risk-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

@media (max-width: 1000px) {
  .risk-grid { grid-template-columns: 1fr; }
}

.risk-section {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
  overflow: hidden;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px;
  border-bottom: 1px solid #f0f0f0;
}

.section-header h3 {
  margin: 0;
  font-size: 15px;
  font-weight: 600;
  color: #333;
}

.section-badge {
  font-size: 12px;
  padding: 2px 10px;
  border-radius: 10px;
  font-weight: 500;
}

.section-badge.critical { background: #fff2f0; color: #ff4d4f; }
.section-badge.warning { background: #fffbe6; color: #faad14; }
.section-badge.healthy { background: #f6ffed; color: #52c41a; }

.section-body {
  padding: 4px 0;
}

.risk-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 16px;
  border-bottom: 1px solid #fafafa;
  font-size: 13px;
  transition: background 0.15s;
}

.risk-row:last-child { border-bottom: none; }
.risk-row:hover { background: #fafafa; }
.risk-row.critical { background: #fff2f0; }
.risk-row.warning { background: #fffbe6; }

.risk-indicator {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  flex-shrink: 0;
}

.risk-row.critical .risk-indicator { background: #ff4d4f; }
.risk-row.warning .risk-indicator { background: #faad14; }
.risk-row.healthy .risk-indicator { background: #52c41a; }

.risk-order {
  font-weight: 500;
  min-width: 100px;
  color: #333;
}

.risk-product {
  color: #666;
  min-width: 80px;
}

.risk-progress {
  display: flex;
  align-items: center;
  gap: 6px;
  min-width: 120px;
}

.progress-bar {
  flex: 1;
  height: 6px;
  background: #f0f0f0;
  border-radius: 3px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  border-radius: 3px;
  transition: width 0.3s;
}

.progress-text {
  min-width: 36px;
  font-size: 12px;
  color: #888;
  text-align: right;
}

.risk-duedate {
  color: #888;
  min-width: 80px;
  font-size: 12px;
}

.risk-gap {
  min-width: 60px;
  font-weight: 500;
  font-size: 12px;
  text-align: center;
}

.risk-gap.critical { color: #ff4d4f; }
.risk-gap.warning { color: #faad14; }
.risk-gap.healthy { color: #52c41a; }

.risk-detail {
  flex: 1;
  color: #999;
  font-size: 12px;
  text-align: right;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.empty-state {
  padding: 32px 16px;
  text-align: center;
  color: #bbb;
  font-size: 13px;
}

/* 暗色兼容 */
:root.dark .kpi-card.critical { background: #2a1f1e; }
:root.dark .kpi-card.warning { background: #2a2419; }
:root.dark .kpi-card.healthy { background: #1a241a; }
:root.dark .kpi-card.info { background: #1a202c; }
:root.dark .risk-section { background: var(--bg-card); }
:root.dark .section-header { border-bottom-color: var(--border-color); }
:root.dark .section-header h3 { color: var(--text-primary); }
:root.dark .risk-row:hover { background: var(--bg-primary); }
:root.dark .risk-row.critical { background: #2a1f1e; }
:root.dark .risk-row.warning { background: #2a2419; }
:root.dark .risk-order { color: var(--text-primary); }
:root.dark .risk-product,
:root.dark .risk-progress .progress-text,
:root.dark .risk-duedate,
:root.dark .risk-detail { color: var(--text-secondary); }
:root.dark .kpi-label { color: var(--text-secondary); }
</style>
