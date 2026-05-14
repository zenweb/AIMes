<template>
  <MainLayout>
    <div class="dashboard">
      <!-- 顶部指标卡片 -->
      <div class="kpi-row">
        <div class="kpi-card">
          <div class="kpi-icon" style="background:#e6f7ff;color:#1890ff">📊</div>
          <div class="kpi-body">
            <span class="kpi-value">{{ kpi.scheduleAdherence }}%</span>
            <span class="kpi-label">排产达成率</span>
          </div>
        </div>
        <div class="kpi-card">
          <div class="kpi-icon" style="background:#f6ffed;color:#52c41a">✅</div>
          <div class="kpi-body">
            <span class="kpi-value">{{ kpi.qualityPassRate }}%</span>
            <span class="kpi-label">质检合格率</span>
          </div>
        </div>
        <div class="kpi-card">
          <div class="kpi-icon" style="background:#fff7e6;color:#fa8c16">⚡</div>
          <div class="kpi-body">
            <span class="kpi-value">{{ kpi.equipmentUtilization }}%</span>
            <span class="kpi-label">设备利用率</span>
          </div>
        </div>
        <div class="kpi-card">
          <div class="kpi-icon" style="background:#fff0f6;color:#eb2f96">📦</div>
          <div class="kpi-body">
            <span class="kpi-value">{{ kpi.activeOrders }}</span>
            <span class="kpi-label">进行中工单</span>
          </div>
        </div>
      </div>

      <div class="widgets-grid">
        <!-- 设备状态 -->
        <div class="widget">
          <div class="widget-header">
            <h3>设备状态</h3>
            <router-link to="/scheduling" class="widget-link">查看排产 →</router-link>
          </div>
          <div class="widget-body">
            <div class="status-summary">
              <span class="status-dot running"></span> 运行 {{ statusCounts.running }}
              <span class="status-dot idle"></span> 空闲 {{ statusCounts.idle }}
              <span class="status-dot down"></span> 停机 {{ statusCounts.down }}
            </div>
            <div class="equip-list">
              <div v-for="eq in equipment" :key="eq.id" class="equip-item">
                <span class="eq-name">{{ eq.name }}</span>
                <span class="eq-type">{{ eq.type }}</span>
                <span class="eq-status" :class="eq.status">{{ eq.statusText }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 今日排产 -->
        <div class="widget">
          <div class="widget-header">
            <h3>今日排产</h3>
            <router-link to="/scheduling" class="widget-link">全部 →</router-link>
          </div>
          <div class="widget-body">
            <div class="today-list">
              <div v-for="task in todayTasks" :key="task.id" class="today-item">
                <span class="today-time">{{ task.time }}</span>
                <span class="today-name">{{ task.name }}</span>
                <span class="today-equip">{{ task.equip }}</span>
                <span class="today-status" :class="task.status">{{ task.statusText }}</span>
              </div>
              <div v-if="todayTasks.length === 0" class="empty-state">今日暂无排产任务</div>
            </div>
          </div>
        </div>

        <!-- 物料预警 -->
        <div class="widget">
          <div class="widget-header">
            <h3>物料预警</h3>
          </div>
          <div class="widget-body">
            <div v-for="mat in materialAlerts" :key="mat.code" class="alert-item" :class="mat.level">
              <span class="alert-icon">{{ mat.level === 'critical' ? '🔴' : '🟡' }}</span>
              <span class="alert-name">{{ mat.name }}</span>
              <span class="alert-qty">{{ mat.available }}/{{ mat.min }}</span>
            </div>
            <div v-if="materialAlerts.length === 0" class="empty-state">所有物料库存充足</div>
          </div>
        </div>

        <!-- 质量概览 -->
        <div class="widget">
          <div class="widget-header">
            <h3>质量概览</h3>
          </div>
          <div class="widget-body">
            <div class="quality-chart">
              <svg viewBox="0 0 100 100" class="donut">
                <circle cx="50" cy="50" r="40" fill="none" stroke="#f0f0f0" stroke-width="12"/>
                <circle cx="50" cy="50" r="40" fill="none" stroke="#52c41a" stroke-width="12"
                  :stroke-dasharray="`${qualityPass * 2.51} ${(100 - qualityPass) * 2.51}`"
                  transform="rotate(-90 50 50)"/>
                <text x="50" y="48" text-anchor="middle" font-size="18" font-weight="bold" fill="#333">
                  {{ qualityPass }}%
                </text>
                <text x="50" y="62" text-anchor="middle" font-size="9" fill="#888">合格率</text>
              </svg>
            </div>
            <div class="quality-stats">
              <div class="q-row"><span>检验批次</span><span>{{ qualityStats.totalInspections }}</span></div>
              <div class="q-row"><span>合格批次</span><span class="green">{{ qualityStats.passed }}</span></div>
              <div class="q-row"><span>缺陷数</span><span class="red">{{ qualityStats.defects }}</span></div>
              <div class="q-row"><span>待处理异常</span><span class="orange">{{ qualityStats.pendingAnomalies }}</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </MainLayout>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onBeforeUnmount } from 'vue'
import * as signalR from '@microsoft/signalr'
import MainLayout from '../layout/MainLayout.vue'
import { getDashboard } from '../../api/dashboard'
import type { DashboardData, KpiCard, EquipmentStatus, TodaySchedule, MaterialAlert, QualityStats } from '../../types/dashboard'

const kpi = reactive<KpiCard>({ scheduleAdherence: 0, qualityPassRate: 0, equipmentUtilization: 0, activeOrders: 0 })
const statusCounts = reactive({ running: 0, idle: 0, down: 0, maintenance: 0 })
const qualityPass = ref(0)
const qualityStats = reactive<QualityStats>({ totalInspections: 0, passed: 0, defects: 0, pendingAnomalies: 0, passRate: 0 })
const equipment = ref<EquipmentStatus[]>([])
const todayTasks = ref<TodaySchedule[]>([])
const materialAlerts = ref<MaterialAlert[]>([])
let connection: signalR.HubConnection | null = null

function applyDashboardData(d: DashboardData) {
  Object.assign(kpi, d.kpi)
  Object.assign(qualityStats, d.qualityStats)
  qualityPass.value = d.qualityStats.passRate
  equipment.value = d.equipment
  todayTasks.value = d.todaySchedule
  materialAlerts.value = d.materialAlerts

  statusCounts.running = d.equipment.filter(e => e.status === 'running').length
  statusCounts.idle = d.equipment.filter(e => e.status === 'idle').length
  statusCounts.down = d.equipment.filter(e => e.status === 'fault' || e.status === 'offline').length
  statusCounts.maintenance = d.equipment.filter(e => e.status === 'maintenance').length
}

function connectSignalR() {
  connection = new signalR.HubConnectionBuilder()
    .withUrl('/hubs/monitoring')
    .withAutomaticReconnect([0, 2000, 5000, 10000])
    .configureLogging(signalR.LogLevel.Warning)
    .build()

  connection.on('KpiUpdate', (data: Partial<KpiCard>) => {
    Object.assign(kpi, data)
  })

  connection.on('EquipmentMetrics', (data: EquipmentStatus[]) => {
    equipment.value = data
    statusCounts.running = data.filter(e => e.status === 'running').length
    statusCounts.idle = data.filter(e => e.status === 'idle').length
    statusCounts.down = data.filter(e => e.status === 'fault' || e.status === 'offline').length
    statusCounts.maintenance = data.filter(e => e.status === 'maintenance').length
  })

  connection.start().catch(() => {})
}

onMounted(async () => {
  try {
    const data = await getDashboard()
    applyDashboardData(data)
  } catch { /* use empty state */ }

  connectSignalR()
})

onBeforeUnmount(() => {
  connection?.stop().catch(() => {})
})
</script>

<style scoped>
.dashboard {
  padding: 24px;
  max-width: 1400px;
  margin: 0 auto;
  overflow-y: auto;
  height: 100%;
}

/* KPI */
.kpi-row {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
}

.kpi-card {
  display: flex;
  align-items: center;
  gap: 16px;
  background: #fff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
}

.kpi-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  flex-shrink: 0;
}

.kpi-body {
  display: flex;
  flex-direction: column;
}

.kpi-value {
  font-size: 28px;
  font-weight: 700;
  line-height: 1.2;
}

.kpi-label {
  font-size: 13px;
  color: #888;
}

/* Widgets */
.widgets-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
  gap: 16px;
}

.widget {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
  overflow: hidden;
}

.widget-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 16px;
  border-bottom: 1px solid #f5f5f5;
}

.widget-header h3 {
  margin: 0;
  font-size: 15px;
}

.widget-link {
  font-size: 12px;
  color: #1890ff;
  text-decoration: none;
}

.widget-body {
  padding: 12px 16px;
}

/* Equipment */
.status-summary {
  font-size: 13px;
  color: #666;
  margin-bottom: 12px;
  display: flex;
  gap: 16px;
}

.status-dot {
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  margin-right: 4px;
}

.status-dot.running { background: #52c41a; }
.status-dot.idle { background: #faad14; }
.status-dot.down { background: #ff4d4f; }

.equip-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.equip-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 10px;
  background: #fafafa;
  border-radius: 6px;
  font-size: 13px;
}

.eq-name { flex: 1; font-weight: 500; }
.eq-type { color: #888; font-size: 12px; width: 50px; }
.eq-status {
  padding: 2px 8px;
  border-radius: 3px;
  font-size: 11px;
  font-weight: 500;
}
.eq-status.running { background: #f6ffed; color: #52c41a; }
.eq-status.idle { background: #fffbe6; color: #d4b106; }
.eq-status.down { background: #fff2f0; color: #ff4d4f; }

/* Today */
.today-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.today-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 10px;
  background: #fafafa;
  border-radius: 6px;
  font-size: 12px;
}

.today-time { width: 90px; color: #666; flex-shrink: 0; }
.today-name { flex: 1; font-weight: 500; }
.today-equip { width: 60px; color: #888; }
.today-status {
  padding: 2px 6px;
  border-radius: 3px;
  font-size: 11px;
}
.today-status.in_progress { background: #e6f7ff; color: #1890ff; }
.today-status.completed { background: #f6ffed; color: #52c41a; }
.today-status.pending { background: #f5f5f5; color: #999; }

/* Material alerts */
.alert-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 10px;
  border-radius: 6px;
  margin-bottom: 6px;
  font-size: 13px;
}
.alert-item.critical { background: #fff2f0; }
.alert-item.warning { background: #fffbe6; }
.alert-icon { font-size: 14px; }
.alert-name { flex: 1; font-weight: 500; }
.alert-qty { color: #666; font-size: 12px; }

/* Quality */
.quality-chart {
  display: flex;
  justify-content: center;
  margin-bottom: 12px;
}

.donut {
  width: 100px;
  height: 100px;
}

.quality-stats {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.q-row {
  display: flex;
  justify-content: space-between;
  font-size: 13px;
  padding: 4px 0;
  border-bottom: 1px solid #f5f5f5;
}
.q-row .green { color: #52c41a; font-weight: 600; }
.q-row .red { color: #ff4d4f; font-weight: 600; }
.q-row .orange { color: #fa8c16; font-weight: 600; }

.empty-state {
  text-align: center;
  color: #ccc;
  padding: 24px;
  font-size: 14px;
}
</style>
