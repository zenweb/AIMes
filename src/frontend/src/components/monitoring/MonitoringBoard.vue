<template>
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

      <section class="shopfloor-situation" aria-label="现场态势图">
        <div class="situation-header">
          <div>
            <span class="situation-eyebrow">现场态势图</span>
            <h3>事件流驱动排产响应</h3>
          </div>
          <div class="situation-score">
            <span>OTD 风险</span>
            <strong>中</strong>
          </div>
        </div>

        <div class="situation-flow">
          <div
            v-for="event in situationEvents"
            :key="event.id"
            class="situation-card"
            :class="event.level"
          >
            <div class="situation-topline">
              <span>{{ event.time }}</span>
              <strong>{{ event.source }}</strong>
            </div>
            <h4>{{ event.title }}</h4>
            <p>{{ event.impact }}</p>
            <div class="situation-meta">
              <span>{{ event.workOrder }}</span>
              <span>{{ event.owner }}</span>
              <span>{{ event.action }}</span>
            </div>
          </div>
        </div>

        <div class="situation-response">
          <div>
            <span>Agent 建议</span>
            <strong>锁定 CNC-001 当前任务，把 WO-RUSH-9001 插入锁定期后第一个 CNC 空窗。</strong>
          </div>
          <div class="situation-actions">
            <button type="button" @click="syncSituationEvidence">同步态势证据</button>
            <button type="button" class="escalate-btn" @click="escalateSituationResponse">升级为跨模块处置包</button>
            <router-link to="/scheduling">查看重排建议</router-link>
          </div>
        </div>

        <div class="situation-sync-note">
          <strong>{{ situationSyncTitle }}</strong>
          <span>{{ situationSyncMessage }}</span>
        </div>

        <div v-if="activeSituationEscalation" class="situation-escalation-card" aria-label="现场态势升级处置包">
          <div>
            <span>{{ activeSituationEscalation.statusLabel }}</span>
            <strong>{{ activeSituationEscalation.title }}</strong>
            <p>{{ activeSituationEscalation.summary }}</p>
          </div>
          <div class="escalation-meta">
            <span>负责人：{{ activeSituationEscalation.owner }}</span>
            <span>截止：{{ activeSituationEscalation.dueAt }}</span>
            <span>影响：{{ activeSituationEscalation.workOrders }}</span>
            <code>{{ activeSituationEscalation.auditId }} / {{ activeSituationEscalation.traceId }}</code>
          </div>
        </div>
      </section>

      <section v-if="pocHypercareAcceptance" class="hypercare-watch" aria-label="POC Hypercare 稳定运行监控">
        <div class="hypercare-watch-header">
          <div>
            <span class="situation-eyebrow">POC Hypercare</span>
            <h3>上线后稳定运行监控</h3>
            <p>{{ pocHypercareAcceptance.acceptanceGate }}</p>
          </div>
          <div class="hypercare-watch-state">
            <span>{{ pocHypercareAcceptance.statusLabel }}</span>
            <strong>{{ pocHypercareAcceptance.actualOtd }}</strong>
            <em>{{ pocHypercareAcceptance.auditId }}</em>
          </div>
        </div>
        <div class="hypercare-watch-grid">
          <article v-for="monitor in pocHypercareAcceptance.monitors" :key="monitor.evidence" class="hypercare-watch-card" :class="monitor.status">
            <span>{{ monitor.label }}</span>
            <strong>{{ monitor.current }}</strong>
            <p>目标 {{ monitor.target }}</p>
            <code>{{ monitor.evidence }}</code>
          </article>
        </div>
        <div class="hypercare-watch-actions">
          <span>负责人：{{ pocHypercareAcceptance.owner }}</span>
          <code>{{ pocHypercareAcceptance.traceId }}</code>
        </div>
      </section>

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
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import * as signalR from '@microsoft/signalr'
import { upsertOtdEvidenceChainRecord } from '../../utils/otd-evidence-chain-sync'
import {
  readMonitoringSituationEscalations,
  writeMonitoringSituationEscalation,
  type MonitoringSituationEscalation,
} from '../../utils/monitoring-situation-escalation-sync'
import { readPocHypercareAcceptanceRecord, type PocHypercareAcceptanceRecord } from '../../utils/poc-hypercare-sync'

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

type SituationLevel = 'critical' | 'warning' | 'info'

interface SituationEvent {
  id: string
  time: string
  source: string
  title: string
  impact: string
  workOrder: string
  owner: string
  action: string
  level: SituationLevel
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
const useDemoMonitoring = import.meta.env.VITE_SHOW_DEMO_HINTS === 'true'
const situationSyncTitle = ref('等待同步')
const situationSyncMessage = ref('同步后，现场事件会进入 OTD 复盘证据链，并可在审计回放中核对来源、对象和追踪编号。')
const activeSituationEscalation = ref<MonitoringSituationEscalation | null>(null)
const pocHypercareAcceptance = ref<PocHypercareAcceptanceRecord | null>(null)

const situationEvents: SituationEvent[] = [
  {
    id: 'sf-cnc-load',
    time: '08:42',
    source: 'CNC-001',
    title: '瓶颈负载超过 90%',
    impact: '影响 WO-RUSH-9001 与 WO-DEMO-1002 的 CNC 精加工窗口，预计延期风险 +4h。',
    workOrder: '影响 2 单',
    owner: '调度员',
    action: '生成重排',
    level: 'critical',
  },
  {
    id: 'sf-material',
    time: '08:46',
    source: 'M-AL-6061',
    title: '齐套缺口仍需复核',
    impact: '采购加急到料前，Agent 建议冻结急单后段并评估替代料 M-AL-6061B。',
    workOrder: 'WO-RUSH-9001',
    owner: '采购',
    action: '加急收货',
    level: 'warning',
  },
  {
    id: 'sf-quality',
    time: '08:51',
    source: 'INS-003',
    title: '热处理返工占用窗口',
    impact: '返工任务需插入复验窗口，OTD 复盘需记录质量事件对排产的影响。',
    workOrder: 'WO-003',
    owner: '质量',
    action: '复验排程',
    level: 'info',
  },
]

function syncSituationEvidence() {
  const createdAt = new Date().toISOString()
  for (const event of situationEvents) {
    upsertOtdEvidenceChainRecord({
      id: `monitoring-${event.id}`,
      stage: '现场态势',
      title: event.title,
      summary: `${event.impact} 责任人：${event.owner}；响应动作：${event.action}。`,
      object: event.workOrder,
      source: `实时监控 / ${event.source}`,
      traceId: `TRACE-SF-${event.id.toUpperCase()}`,
      status: event.level === 'info' ? 'ready' : 'active',
      statusLabel: event.level === 'info' ? '已纳入复盘' : '待处置',
      createdAt,
    })
  }
  situationSyncTitle.value = '现场态势证据已同步 OTD 复盘'
  situationSyncMessage.value = `${situationEvents.length} 条现场事件已写入统一证据链，可在报表中心与审计日志核对。`
}

function escalateSituationResponse() {
  const sourceEvent = situationEvents[0]
  const record = writeMonitoringSituationEscalation({
    sourceEventId: sourceEvent.id,
    source: sourceEvent.source,
    eventTitle: sourceEvent.title,
    eventImpact: sourceEvent.impact,
    workOrders: 'WO-RUSH-9001 / WO-DEMO-1002',
    owner: sourceEvent.owner,
    action: sourceEvent.action,
    relatedEvents: situationEvents.map(event => ({
      source: event.source,
      title: event.title,
      impact: event.impact,
      owner: event.owner,
    })),
  })
  activeSituationEscalation.value = record
  situationSyncTitle.value = '现场态势已升级为跨模块处置包'
  situationSyncMessage.value = `${record.auditId} 已写入风险队列、AI 排产事件队列和统一 OTD 证据链。`
}

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
  if (useDemoMonitoring) {
    connected.value = true
    loadDemoData()
    addEvent('info', '实时监控演示数据已加载')
    return
  }

  connection = new signalR.HubConnectionBuilder()
    .withUrl('/hubs/monitoring', {
      accessTokenFactory: () => localStorage.getItem('aimes_token') ?? '',
    })
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
  if (demoInterval) clearInterval(demoInterval)

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
  lastUpdate.value = new Date().toLocaleTimeString('zh-CN')

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
  pocHypercareAcceptance.value = readPocHypercareAcceptanceRecord()
  const latestEscalation = readMonitoringSituationEscalations()[0]
  if (latestEscalation) {
    activeSituationEscalation.value = latestEscalation
    situationSyncTitle.value = latestEscalation.status === 'closed'
      ? '现场态势处置包已闭环'
      : '现场态势处置包待跨模块处置'
    situationSyncMessage.value = latestEscalation.status === 'closed'
      ? `${latestEscalation.traceId} 已由风险队列关闭，现场态势保留已闭环留痕。`
      : `${latestEscalation.auditId} 已写入风险队列、AI 排产和统一 OTD 证据链。`
  }
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

.shopfloor-situation {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 14px 16px;
  border: 1px solid #dbeafe;
  border-radius: 8px;
  background: #fff;
}

.situation-header {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: center;
}

.situation-eyebrow {
  display: block;
  margin-bottom: 2px;
  color: #1d4ed8;
  font-size: 12px;
  font-weight: 700;
}

.situation-header h3,
.situation-card h4,
.situation-card p,
.situation-response strong {
  margin: 0;
}

.situation-header h3 {
  color: #111827;
  font-size: 16px;
}

.situation-score {
  display: flex;
  gap: 8px;
  align-items: center;
  padding: 7px 10px;
  border-radius: 6px;
  background: #fff7ed;
  color: #9a3412;
  font-size: 12px;
}

.situation-score strong {
  font-size: 16px;
}

.situation-flow {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
}

.situation-card {
  display: flex;
  flex-direction: column;
  gap: 7px;
  min-height: 132px;
  padding: 11px;
  border: 1px solid #e5e7eb;
  border-radius: 7px;
  background: #fafafa;
}

.situation-card.critical {
  border-color: #fecaca;
  background: #fff1f2;
}

.situation-card.warning {
  border-color: #fde68a;
  background: #fffbeb;
}

.situation-card.info {
  border-color: #bfdbfe;
  background: #eff6ff;
}

.situation-topline,
.situation-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  align-items: center;
}

.situation-topline span,
.situation-meta span {
  padding: 2px 6px;
  border-radius: 4px;
  background: rgba(255, 255, 255, 0.78);
  color: #4b5563;
  font-size: 12px;
}

.situation-topline strong {
  color: #111827;
  font-size: 12px;
}

.situation-card h4 {
  color: #111827;
  font-size: 14px;
}

.situation-card p {
  color: #4b5563;
  font-size: 12px;
  line-height: 1.45;
}

.situation-response {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: center;
  padding: 10px 12px;
  border: 1px solid #bfdbfe;
  border-radius: 6px;
  background: #eff6ff;
}

.situation-response div {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.situation-response .situation-actions {
  flex: 0 0 auto;
  display: flex;
  flex-direction: row;
  gap: 8px;
  align-items: center;
}

.situation-response span {
  color: #1d4ed8;
  font-size: 12px;
  font-weight: 700;
}

.situation-response strong {
  color: #111827;
  font-size: 13px;
  line-height: 1.45;
}

.situation-response a,
.situation-response button {
  padding: 6px 10px;
  border: 1px solid #2563eb;
  border-radius: 4px;
  background: #2563eb;
  color: #fff;
  cursor: pointer;
  font-size: 12px;
  font-weight: 700;
  text-decoration: none;
}

.situation-response button {
  border-color: #1d4ed8;
  background: #fff;
  color: #1d4ed8;
}

.situation-response button.escalate-btn {
  border-color: #b45309;
  background: #fff7ed;
  color: #9a3412;
}

.situation-sync-note {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 9px 11px;
  border: 1px solid #dbeafe;
  border-radius: 6px;
  background: #fff;
}

.situation-sync-note strong {
  color: #111827;
  font-size: 13px;
}

.situation-sync-note span {
  color: #4b5563;
  font-size: 12px;
  line-height: 1.45;
}

.situation-escalation-card {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(280px, 0.55fr);
  gap: 12px;
  padding: 11px 12px;
  border: 1px solid #fed7aa;
  border-radius: 6px;
  background: #fff7ed;
}

.situation-escalation-card div {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.situation-escalation-card span {
  color: #9a3412;
  font-size: 12px;
  font-weight: 700;
}

.situation-escalation-card strong {
  color: #111827;
  font-size: 14px;
}

.situation-escalation-card p {
  margin: 0;
  color: #4b5563;
  font-size: 12px;
  line-height: 1.45;
}

.situation-escalation-card code {
  color: #1d4ed8;
  font-family: monospace;
  font-size: 12px;
  overflow-wrap: anywhere;
}

.hypercare-watch {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 14px 16px;
  border: 1px solid #a7f3d0;
  border-radius: 8px;
  background: #ecfdf5;
}

.hypercare-watch-header {
  display: flex;
  justify-content: space-between;
  gap: 14px;
  align-items: flex-start;
}

.hypercare-watch-header h3,
.hypercare-watch-header p {
  margin: 0;
}

.hypercare-watch-header h3 {
  color: #064e3b;
  font-size: 16px;
}

.hypercare-watch-header p {
  margin-top: 4px;
  color: #475569;
  font-size: 12px;
  line-height: 1.45;
}

.hypercare-watch-state {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 190px;
  padding: 10px 12px;
  border: 1px solid #a7f3d0;
  border-radius: 6px;
  background: #fff;
}

.hypercare-watch-state span,
.hypercare-watch-state em {
  color: #047857;
  font-size: 12px;
  font-style: normal;
  overflow-wrap: anywhere;
}

.hypercare-watch-state strong {
  color: #064e3b;
  font-size: 24px;
}

.hypercare-watch-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 10px;
}

.hypercare-watch-card {
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-height: 118px;
  padding: 10px;
  border: 1px solid #a7f3d0;
  border-radius: 6px;
  background: #fff;
}

.hypercare-watch-card.watch {
  border-color: #fed7aa;
  background: #fffaf5;
}

.hypercare-watch-card span {
  color: #047857;
  font-size: 12px;
  font-weight: 700;
}

.hypercare-watch-card.watch span {
  color: #c2410c;
}

.hypercare-watch-card strong {
  color: #111827;
  font-size: 16px;
}

.hypercare-watch-card p {
  flex: 1;
  margin: 0;
  color: #475569;
  font-size: 12px;
  line-height: 1.4;
}

.hypercare-watch-card code,
.hypercare-watch-actions code {
  color: #047857;
  font-family: monospace;
  font-size: 12px;
  overflow-wrap: anywhere;
}

.hypercare-watch-actions {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  padding: 9px 11px;
  border: 1px solid #a7f3d0;
  border-radius: 6px;
  background: #fff;
}

.hypercare-watch-actions span {
  color: #475569;
  font-size: 12px;
  font-weight: 700;
}

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

@media (max-width: 1180px) {
  .kpi-row,
  .situation-flow {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .monitoring-columns {
    flex-direction: column;
  }

  .col-side {
    width: auto;
  }
}

@media (max-width: 720px) {
  .kpi-row,
  .situation-flow {
    grid-template-columns: 1fr;
  }

  .situation-header,
  .situation-response,
  .situation-escalation-card {
    align-items: stretch;
    grid-template-columns: 1fr;
    flex-direction: column;
  }

  .hypercare-watch-header,
  .hypercare-watch-actions {
    flex-direction: column;
  }

  .hypercare-watch-grid {
    grid-template-columns: 1fr;
  }

  .situation-response .situation-actions {
    align-items: stretch;
    flex-direction: column;
  }
}
</style>
