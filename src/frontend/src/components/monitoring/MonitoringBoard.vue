<template>
  <MainLayout>
    <div class="monitoring">
      <div class="page-header">
        <h2 class="page-title">生产实时监控</h2>
        <div class="header-right">
          <span class="live-badge" :class="{ connected }">
            <span class="live-dot"></span>
            {{ connected ? '实时' : '已断开' }}
          </span>
          <span class="update-time" v-if="lastUpdate">更新: {{ lastUpdate }}</span>
        </div>
      </div>

      <!-- KPI 条 -->
      <div class="kpi-row">
        <div class="kpi-card live">
          <div class="kpi-label">综合利用率</div>
          <div class="kpi-value">{{ kpi.totalUtilization }}%</div>
        </div>
        <div class="kpi-card live">
          <div class="kpi-label">设备运行</div>
          <div class="kpi-value">{{ kpi.runningCount }}<small>/{{ kpi.runningCount + kpi.idleCount }}</small></div>
        </div>
        <div class="kpi-card live">
          <div class="kpi-label">今日产量</div>
          <div class="kpi-value">{{ kpi.todayOutput }}</div>
        </div>
        <div class="kpi-card live" :class="{ 'kpi-warn': kpi.alertCount > 0 }">
          <div class="kpi-label">异常告警</div>
          <div class="kpi-value" :style="{ color: kpi.alertCount > 0 ? '#ff4d4f' : '#52c41a' }">{{ kpi.alertCount }}</div>
        </div>
        <div class="kpi-card live">
          <div class="kpi-label">OEE</div>
          <div class="kpi-value" :style="{ color: kpi.oee >= 85 ? '#52c41a' : kpi.oee >= 70 ? '#faad14' : '#ff4d4f' }">{{ kpi.oee }}%</div>
        </div>
        <div class="kpi-card live">
          <div class="kpi-label">良品率</div>
          <div class="kpi-value">{{ kpi.yieldRate }}%</div>
        </div>
      </div>

      <!-- 设备详情抽屉 -->
      <Teleport to="body">
        <div v-if="selectedEq" class="drawer-overlay" @click.self="selectedEq = null">
          <div class="drawer-panel">
            <div class="drawer-header">
              <span>{{ selectedEq.name }} <small>{{ selectedEq.code }}</small></span>
              <button class="drawer-close" @click="selectedEq = null">✕</button>
            </div>
            <div class="drawer-body">
              <div class="detail-row"><label>状态</label><span :class="'status-tag status-' + selectedEq.status">{{ statusLabel(selectedEq.status) }}</span></div>
              <div class="detail-row"><label>负载</label><span>{{ selectedEq.load }}%</span></div>
              <div class="detail-row"><label>温度</label><span>{{ selectedEq.temperature }}°C</span></div>
              <div class="detail-row"><label>转速</label><span>{{ selectedEq.rpm }} rpm</span></div>
              <div class="detail-row"><label>利用率</label><span>{{ selectedEq.utilization }}%</span></div>
            </div>
          </div>
        </div>
      </Teleport>

      <!-- 设备状态网格 + OEE 仪表盘 -->
      <div class="monitoring-columns">
        <div class="col-main">
          <div class="section">
            <h3>设备状态 <span class="count-badge">{{ equipment.length }} 台</span></h3>
            <div class="equip-grid">
              <div
                v-for="eq in equipment"
                :key="eq.id"
                class="equip-card"
                :class="'status-' + eq.status"
                @click="selectedEq = eq"
              >
                <div class="eq-header">
                  <span class="eq-code">{{ eq.code }}</span>
                  <span class="eq-status-dot" :class="eq.status"></span>
                </div>
                <div class="eq-name">{{ eq.name }}</div>
                <div class="eq-metrics">
                  <div class="metric">
                    <span class="metric-label">负载</span>
                    <div class="bar-wrap">
                      <div class="bar" :style="{ width: eq.load + '%', background: loadColor(eq.load) }"></div>
                    </div>
                    <span class="metric-val">{{ eq.load }}%</span>
                  </div>
                  <div class="metric-row">
                    <span>{{ eq.temperature }}°C</span>
                    <span>{{ eq.rpm }} rpm</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="col-side">
          <!-- OEE 简表 -->
          <div class="section">
            <h3>OEE 分解</h3>
            <div class="oee-breakdown">
              <div class="oee-row"><span>可用率</span><div class="bar-wrap"><div class="bar green" :style="{ width: kpi.oee * 1.05 + '%' }"></div></div><span>{{ Math.round(kpi.oee * 1.05) }}%</span></div>
              <div class="oee-row"><span>性能率</span><div class="bar-wrap"><div class="bar blue" :style="{ width: kpi.oee * 1.02 + '%' }"></div></div><span>{{ Math.round(kpi.oee * 1.02) }}%</span></div>
              <div class="oee-row"><span>良品率</span><div class="bar-wrap"><div class="bar orange" :style="{ width: kpi.yieldRate + '%' }"></div></div><span>{{ kpi.yieldRate }}%</span></div>
              <div class="oee-divider"></div>
              <div class="oee-row oee-total"><span>OEE</span><div class="bar-wrap"><div class="bar" :style="{ width: kpi.oee + '%', background: oeeColor }"></div></div><span :style="{ color: oeeColor }">{{ kpi.oee }}%</span></div>
            </div>
          </div>

          <!-- 实时事件 -->
          <div class="section">
            <h3>实时事件
              <span class="event-filter">
                <select v-model="eventFilter">
                  <option value="all">全部</option>
                  <option value="error">异常</option>
                  <option value="warning">警告</option>
                  <option value="info">信息</option>
                </select>
              </span>
            </h3>
            <div class="event-list">
              <div v-for="evt in filteredEvents" :key="evt.id" class="event-item" :class="evt.type">
                <span class="event-dot"></span>
                <span class="event-time">{{ evt.time }}</span>
                <span class="event-text">{{ evt.text }}</span>
              </div>
              <div v-if="!filteredEvents.length" class="event-empty">暂无事件</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </MainLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import * as signalR from '@microsoft/signalr'
import MainLayout from '../layout/MainLayout.vue'

interface EquipmentMetric {
  id: string
  name: string
  code: string
  status: string
  utilization: number
  temperature: number
  rpm: number
  load: number
}

interface KpiData {
  totalUtilization: number
  runningCount: number
  idleCount: number
  todayOutput: number
  alertCount: number
  oee: number
  yieldRate: number
  energyUsage: number
  timestamp: string
}

interface EventItem {
  id: string
  type: string
  time: string
  text: string
}

const connected = ref(false)
const lastUpdate = ref('')
const equipment = ref<EquipmentMetric[]>([])
const kpi = ref<KpiData>({ totalUtilization: 0, runningCount: 0, idleCount: 0, todayOutput: 0, alertCount: 0, oee: 0, yieldRate: 0, energyUsage: 0, timestamp: '' })
const events = ref<EventItem[]>([])
const selectedEq = ref<EquipmentMetric | null>(null)
const eventFilter = ref('all')
let connection: signalR.HubConnection | null = null
let demoInterval: ReturnType<typeof setInterval> | null = null

const filteredEvents = computed(() => {
  if (eventFilter.value === 'all') return events.value
  return events.value.filter(e => e.type === eventFilter.value)
})

const oeeColor = computed(() => {
  const v = kpi.value.oee
  if (v >= 85) return '#52c41a'
  if (v >= 70) return '#faad14'
  return '#ff4d4f'
})

const statusMap: Record<string, string> = {
  Available: 'running',
  Running: 'running',
  Idle: 'idle',
  Maintenance: 'maintenance',
  Fault: 'fault',
  Offline: 'offline',
}

function statusLabel(s: string) {
  const map: Record<string, string> = { running: '运行中', idle: '空闲', maintenance: '维护', fault: '故障', offline: '离线' }
  return map[s] || s
}

function loadColor(load: number) {
  if (load >= 85) return '#ff4d4f'
  if (load >= 60) return '#faad14'
  return '#52c41a'
}

function addEvent(type: string, text: string) {
  const now = new Date()
  events.value.unshift({
    id: `evt-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
    type,
    time: now.toLocaleTimeString('zh-CN'),
    text,
  })
  if (events.value.length > 50) events.value.length = 50
}

function connectSignalR() {
  connection = new signalR.HubConnectionBuilder()
    .withUrl('/hubs/monitoring')
    .withAutomaticReconnect([0, 2000, 5000, 10000, 30000])
    .configureLogging(signalR.LogLevel.Warning)
    .build()

  connection.on('EquipmentMetrics', (data: EquipmentMetric[]) => {
    equipment.value = data.map(eq => ({ ...eq, status: statusMap[eq.status] || eq.status }))
    lastUpdate.value = new Date().toLocaleTimeString('zh-CN')
  })

  connection.on('KpiUpdate', (data: KpiData) => {
    kpi.value = { ...kpi.value, ...data }
    lastUpdate.value = new Date().toLocaleTimeString('zh-CN')
  })

  connection.onreconnecting(() => {
    connected.value = false
    addEvent('warning', '实时连接断开，正在重连...')
  })

  connection.onreconnected(() => {
    connected.value = true
    addEvent('info', '实时连接已恢复')
  })

  connection.onclose(() => {
    connected.value = false
    addEvent('error', '实时连接已关闭')
  })

  connection.start()
    .then(() => {
      connected.value = true
      addEvent('info', '实时监控已连接')
    })
    .catch(() => {
      addEvent('error', '实时连接失败，使用演示数据')
      loadDemoData()
    })
}

function loadDemoData() {
  const names = ['CNC-001 加工中心', 'CNC-002 加工中心', '注塑机-1号', '注塑机-2号', '装配线-1号', '装配线-2号', '热处理炉', '检测仪']
  const codes = ['CNC-001', 'CNC-002', 'INJ-001', 'INJ-002', 'ASM-001', 'ASM-002', 'HT-001', 'INS-001']
  const statuses = ['running', 'running', 'running', 'maintenance', 'running', 'idle', 'idle', 'running']

  equipment.value = names.map((name, i) => ({
    id: `eq-${i + 1}`,
    name,
    code: codes[i],
    status: statuses[i],
    utilization: 0,
    temperature: 40 + Math.floor(Math.random() * 30),
    rpm: 1000 + Math.floor(Math.random() * 2000),
    load: statuses[i] === 'running' ? 50 + Math.floor(Math.random() * 45) : statuses[i] === 'idle' ? Math.floor(Math.random() * 15) : 0,
  }))

  kpi.value = {
    totalUtilization: 72.3,
    runningCount: 5,
    idleCount: 3,
    timestamp: new Date().toISOString(),
    todayOutput: 348,
    alertCount: 2,
    oee: 78.5,
    yieldRate: 96.2,
    energyUsage: 185.4,
  }

  demoInterval = setInterval(() => {
    equipment.value = equipment.value.map(eq => ({
      ...eq,
      load: eq.status === 'running' ? Math.min(95, Math.max(30, eq.load + Math.floor(Math.random() * 10 - 5))) : eq.load,
      temperature: eq.temperature + Math.floor(Math.random() * 6 - 3),
    }))
    lastUpdate.value = new Date().toLocaleTimeString('zh-CN')
  }, 5000)
}

onMounted(() => {
  connectSignalR()
})

onBeforeUnmount(() => {
  connection?.stop()
  if (demoInterval) clearInterval(demoInterval)
})
</script>

<style scoped>
.monitoring { padding: 16px; display: flex; flex-direction: column; gap: 16px; height: 100%; }
.page-header { display: flex; justify-content: space-between; align-items: center; flex-shrink: 0; }
.page-title { font-size: 16px; font-weight: 700; margin: 0; }
.header-right { display: flex; align-items: center; gap: 12px; }

.live-badge { display: flex; align-items: center; gap: 4px; font-size: 12px; padding: 2px 10px; border-radius: 10px; }
.live-badge.connected { background: #f6ffed; color: #52c41a; border: 1px solid #b7eb8f; }
.live-badge:not(.connected) { background: #fff2f0; color: #ff4d4f; border: 1px solid #ffccc7; }
.live-dot { width: 6px; height: 6px; border-radius: 50%; background: currentColor; animation: pulse 2s infinite; }
@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }

.update-time { font-size: 12px; color: #999; }

.kpi-row { display: grid; grid-template-columns: repeat(6, 1fr); gap: 12px; }
.kpi-card.live { background: #fff; border: 1px solid #f0f0f0; border-radius: 8px; padding: 16px 20px; display: flex; flex-direction: column; gap: 4px; transition: border-color 0.3s; }
.kpi-card.live:hover { border-color: #1890ff; }
.kpi-card.kpi-warn { border-color: #ffccc7; background: #fff2f0; }
.kpi-label { font-size: 13px; color: #888; }
.kpi-value { font-size: 28px; font-weight: 700; color: #333; }
.kpi-value small { font-size: 14px; color: #999; font-weight: 400; }

.monitoring-columns { display: flex; gap: 16px; flex: 1; min-height: 0; }
.col-main { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 16px; }
.col-side { width: 320px; flex-shrink: 0; display: flex; flex-direction: column; gap: 16px; }

.section { background: #fff; border-radius: 8px; padding: 16px; border: 1px solid #f0f0f0; }
.section h3 { margin: 0 0 12px; font-size: 15px; font-weight: 600; color: #333; display: flex; align-items: center; gap: 8px; }
.count-badge { font-size: 11px; font-weight: 400; color: #999; background: #f5f5f5; padding: 1px 8px; border-radius: 8px; }

.equip-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 10px; }
.equip-card { border: 1px solid #f0f0f0; border-radius: 8px; padding: 14px; cursor: pointer; transition: box-shadow 0.2s, border-color 0.2s; }
.equip-card:hover { box-shadow: 0 2px 8px rgba(0,0,0,0.08); border-color: #d9d9d9; }
.equip-card.status-running { border-left: 3px solid #52c41a; }
.equip-card.status-idle { border-left: 3px solid #faad14; }
.equip-card.status-maintenance { border-left: 3px solid #1890ff; }
.equip-card.status-fault { border-left: 3px solid #ff4d4f; animation: blink-border 1s infinite; }
.equip-card.status-offline { border-left: 3px solid #d9d9d9; }
@keyframes blink-border { 0%, 100% { border-left-color: #ff4d4f; } 50% { border-left-color: #ffccc7; } }

.eq-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px; }
.eq-code { font-family: monospace; font-size: 11px; color: #999; }
.eq-status-dot { width: 8px; height: 8px; border-radius: 50%; }
.eq-status-dot.running { background: #52c41a; }
.eq-status-dot.idle { background: #faad14; }
.eq-status-dot.maintenance { background: #1890ff; }
.eq-status-dot.fault { background: #ff4d4f; animation: pulse 1s infinite; }
.eq-status-dot.offline { background: #d9d9d9; }

.eq-name { font-size: 14px; font-weight: 600; color: #333; margin-bottom: 10px; }
.eq-metrics { display: flex; flex-direction: column; gap: 6px; }
.metric { display: flex; align-items: center; gap: 6px; font-size: 12px; }
.metric-label { color: #888; min-width: 30px; }
.bar-wrap { flex: 1; height: 6px; background: #f0f0f0; border-radius: 3px; overflow: hidden; }
.bar { height: 100%; border-radius: 3px; transition: width 0.5s ease; }
.metric-val { min-width: 32px; text-align: right; font-weight: 500; color: #333; }
.metric-row { display: flex; justify-content: space-between; font-size: 11px; color: #999; }

/* OEE 分解 */
.oee-breakdown { display: flex; flex-direction: column; gap: 8px; }
.oee-row { display: flex; align-items: center; gap: 8px; font-size: 12px; }
.oee-row span:first-child { min-width: 48px; color: #888; }
.oee-row span:last-child { min-width: 40px; text-align: right; font-weight: 600; color: #333; }
.oee-total { font-weight: 700; }
.oee-divider { height: 1px; background: #f0f0f0; margin: 4px 0; }
.bar.green { background: #52c41a; }
.bar.blue { background: #1890ff; }
.bar.orange { background: #faad14; }

/* 事件 */
.event-filter select { font-size: 12px; border: 1px solid #d9d9d9; border-radius: 4px; padding: 2px 6px; color: #666; outline: none; }
.event-list { display: flex; flex-direction: column; gap: 4px; max-height: 240px; overflow-y: auto; }
.event-item { display: flex; align-items: center; gap: 8px; padding: 6px 8px; border-radius: 4px; font-size: 13px; background: #fafafa; }
.event-item.info { border-left: 3px solid #1890ff; }
.event-item.warning { border-left: 3px solid #faad14; background: #fffbe6; }
.event-item.error { border-left: 3px solid #ff4d4f; background: #fff2f0; }
.event-dot { width: 6px; height: 6px; border-radius: 50%; background: #1890ff; flex-shrink: 0; }
.event-item.warning .event-dot { background: #faad14; }
.event-item.error .event-dot { background: #ff4d4f; }
.event-time { font-size: 11px; color: #999; font-family: monospace; flex-shrink: 0; }
.event-text { color: #333; }
.event-empty { color: #999; font-size: 13px; text-align: center; padding: 20px; }

/* 设备详情抽屉 */
.drawer-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.3); z-index: 1000; display: flex; justify-content: flex-end; }
.drawer-panel { width: 360px; background: #fff; height: 100%; display: flex; flex-direction: column; box-shadow: -4px 0 12px rgba(0,0,0,0.1); animation: slideIn 0.2s ease; }
@keyframes slideIn { from { transform: translateX(100%); } to { transform: translateX(0); } }
.drawer-header { display: flex; justify-content: space-between; align-items: center; padding: 16px 20px; border-bottom: 1px solid #f0f0f0; font-size: 16px; font-weight: 600; }
.drawer-header small { font-size: 12px; color: #999; font-weight: 400; }
.drawer-close { border: none; background: none; font-size: 16px; color: #999; cursor: pointer; padding: 4px; }
.drawer-close:hover { color: #333; }
.drawer-body { padding: 20px; display: flex; flex-direction: column; gap: 16px; }
.detail-row { display: flex; justify-content: space-between; align-items: center; padding: 8px 0; border-bottom: 1px solid #fafafa; }
.detail-row label { color: #888; font-size: 13px; }
.detail-row span { font-size: 14px; font-weight: 500; color: #333; }
.status-tag { padding: 2px 10px; border-radius: 10px; font-size: 12px; }
.status-tag.status-running { background: #f6ffed; color: #52c41a; }
.status-tag.status-idle { background: #fffbe6; color: #faad14; }
.status-tag.status-maintenance { background: #e6f7ff; color: #1890ff; }
.status-tag.status-fault { background: #fff2f0; color: #ff4d4f; }
.status-tag.status-offline { background: #f5f5f5; color: #999; }
</style>
