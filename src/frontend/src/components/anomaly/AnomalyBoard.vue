<template>
  <div class="anomaly-board">
    <h2 class="page-title">异常管理</h2>

    <div class="toolbar">
      <button class="btn" :class="{ active: filter === 'all' }" @click="filter = 'all'">全部 ({{ anomalies.length }})</button>
      <button class="btn" :class="{ active: filter === 'critical' }" @click="filter = 'critical'">紧急 ({{ criticalCount }})</button>
      <button class="btn" :class="{ active: filter === 'open' }" @click="filter = 'open'">待处理 ({{ openCount }})</button>
    </div>

    <div v-if="notification" class="anomaly-notification" role="alert">
      {{ notification }}
    </div>

    <section class="event-center" aria-label="现场事件中心">
      <div class="event-center-head">
        <div>
          <span class="eyebrow">现场事件中心</span>
          <h3>异常到处置闭环</h3>
        </div>
        <span class="event-center-status">{{ openCount }} 个待闭环</span>
      </div>
      <div id="anomaly-dispatch-help" class="dispatch-guidance">
        <p>
          确认分流前，请核对异常类型、影响工单、目标模块、责任人和审计追踪。
          Before confirming dispatch, verify anomaly type, impacted work orders, target modules, owner, and audit trace.
        </p>
        <nav aria-label="异常分流相关入口">
          <router-link :to="linkedRoute('/risk')">风险预警 / Risk queue</router-link>
          <router-link to="/quality">质量闭环 / Quality closure</router-link>
          <router-link to="/scheduling">AI 排产 / Scheduling</router-link>
          <a href="#anomaly-dispatch-help">帮助 / Help</a>
        </nav>
      </div>
      <div class="event-lanes" role="list" :aria-label="eventLaneListLabel" aria-describedby="anomaly-dispatch-help">
        <div
          v-for="lane in eventLanes"
          :key="lane.title"
          class="event-lane"
          :class="lane.level"
          role="listitem"
          :aria-label="eventLaneLabel(lane)"
        >
          <span>{{ lane.type }}</span>
          <strong>{{ lane.title }}</strong>
          <p>{{ lane.detail }}</p>
          <div class="lane-route">{{ lane.route }}</div>
          <button
            type="button"
            :disabled="dispatchedLaneIds.includes(lane.id)"
            @click="dispatchEventLane(lane.id)"
          >
            {{ dispatchedLaneIds.includes(lane.id) ? '已确认分流' : '确认分流' }}
          </button>
        </div>
      </div>
      <div class="event-bridge">
        <span>Agent 分流</span>
        <strong>设备异常进入风险队列和排产复核，质量异常进入隔离/返工窗口，物料异常进入采购协同与库存齐套。</strong>
        <router-link :to="linkedRoute('/risk')">查看风险处置队列</router-link>
      </div>
      <div v-if="latestDispatch" class="dispatch-trace">
        <span>{{ latestDispatch.statusLabel }}</span>
        <strong>{{ latestDispatch.title }}</strong>
        <p>{{ latestDispatch.summary }}</p>
        <code>{{ latestDispatch.traceId }}</code>
      </div>
    </section>

    <div class="anomaly-content">
      <div class="anomaly-list" role="listbox" aria-label="异常记录列表">
        <div
          v-for="a in filteredAnomalies"
          :key="a.id"
          class="anomaly-card"
          :class="'sev-' + a.severity.toLowerCase()"
          role="option"
          tabindex="0"
          :aria-selected="detail?.id === a.id"
          @click="selectAnomaly(a)"
          @keydown.enter="selectAnomaly(a)"
          @keydown.space.prevent="selectAnomaly(a)"
        >
          <div class="card-left">
            <div class="sev-badge" :class="'sev-' + a.severity.toLowerCase()">{{ sevLabel(a.severity) }}</div>
          </div>
          <div class="card-body">
            <div class="card-title">{{ a.title }}</div>
            <div class="card-meta">
              <span>{{ a.anomalyType }}</span>
              <span>工单: {{ a.workOrderNumber }}</span>
              <span v-if="a.equipmentId">设备: {{ a.equipmentId }}</span>
            </div>
          </div>
          <div class="card-right">
            <span class="status-badge" :class="'st-' + a.status.toLowerCase()">{{ statusLabel(a.status) }}</span>
            <span class="card-time">{{ formatTime(a.detectedAt) }}</span>
          </div>
        </div>
        <div v-if="!filteredAnomalies.length" class="empty-state">暂无异常记录</div>
      </div>

      <div class="pagination-bar" v-if="totalPages > 1">
        <button class="page-btn" :disabled="currentPage <= 1" @click="goToPage(currentPage - 1)">上一页</button>
        <template v-for="p in displayedPages" :key="p">
          <span v-if="p === '...'" class="page-ellipsis">...</span>
          <button v-else class="page-btn" :class="{ active: p === currentPage }" @click="goToPage(p)">{{ p }}</button>
        </template>
        <button class="page-btn" :disabled="currentPage >= totalPages" @click="goToPage(currentPage + 1)">下一页</button>
        <span class="page-info">共 {{ totalCount }} 条</span>
      </div>
    </div>

    <!-- 详情滑出面板 -->
    <div v-if="detail" class="slide-panel" @click.self="detail = null">
      <div class="panel-content" role="dialog" aria-modal="true" aria-labelledby="anomaly-detail-title">
        <div class="panel-header">
          <h3 id="anomaly-detail-title">{{ detail.title }}</h3>
          <button class="close-btn" aria-label="关闭异常详情" @click="detail = null">✕</button>
        </div>

        <div class="detail-grid">
          <div><label>工单</label><span>{{ detail.workOrderNumber }}</span></div>
          <div><label>工序</label><span>{{ detail.operationCode }}</span></div>
          <div><label>类型</label><span>{{ detail.anomalyType }}</span></div>
          <div><label>等级</label><span class="sev-text" :class="'sev-' + detail.severity.toLowerCase()">{{ sevLabel(detail.severity) }}</span></div>
          <div><label>状态</label><span>{{ statusLabel(detail.status) }}</span></div>
          <div><label>发现人</label><span>{{ detail.detectedBy || '-' }}</span></div>
          <div v-if="detail.equipmentId"><label>设备</label><span>{{ detail.equipmentId }}</span></div>
          <div v-if="detail.resolvedBy"><label>解决人</label><span>{{ detail.resolvedBy }}</span></div>
        </div>
        <div class="detail-desc">
          <label>描述</label>
          <p>{{ detail.description }}</p>
        </div>

        <div v-if="detail.rootCause" class="detail-section">
          <label>根因</label>
          <p>{{ detail.rootCause }}</p>
        </div>
        <div v-if="detail.resolution" class="detail-section">
          <label>解决方案</label>
          <p>{{ detail.resolution }}</p>
        </div>

        <!-- AI 分析 -->
        <div class="section">
          <button class="btn-ai" :disabled="analyzing" @click="handleAnalyze">
            {{ analyzing ? 'AI 分析中...' : 'AI 分析建议' }}
          </button>
        </div>
        <div v-if="analysis" class="analysis-results">
          <div v-for="(act, idx) in analysis.suggestedActions" :key="idx" class="action-card" :class="'pri-' + act.priority">
            <div class="action-pri">P{{ act.priority }}</div>
            <div class="action-body">
              <div class="action-text">{{ act.action }}</div>
              <div class="action-reason">{{ act.reason }}</div>
            </div>
          </div>
        </div>

        <!-- 响应记录 -->
        <div class="section">
          <h4>响应记录 ({{ detail.responses.length }})</h4>
          <div v-for="r in detail.responses" :key="r.id" class="response-item">
            <div class="resp-header">
              <span class="resp-type">{{ r.responseType }}</span>
              <span class="resp-status">{{ r.status }}</span>
            </div>
            <div class="resp-body">{{ r.suggestedAction }}</div>
            <div class="resp-by">{{ r.suggestedBy }} · {{ formatTime(r.createdAt) }}</div>
          </div>
          <div v-if="!detail.responses.length" class="no-data">暂无响应记录</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import type { ProductionAnomaly, ProductionAnomalyDetail, AnalyzeAnomalyResult } from '../../types/anomaly'
import { getAnomalyList, getAnomalyById, analyzeAnomaly } from '../../api/anomaly'
import { errorMessage } from '../../utils/error-message'
import { isOfflineDemoError } from '../../utils/offline-demo-mode'
import {
  readProductionAnomalyEventBackendFirst,
  toProductionAnomaly,
  toProductionAnomalyDetail,
} from '../../utils/production-anomaly-sync'
import {
  readAnomalyDispatchRecordsBackendFirst,
  writeAnomalyDispatchRecord,
  type AnomalyDispatchRecord,
} from '../../utils/anomaly-dispatch-sync'

const loading = ref(false)
const filter = ref('all')
const anomalies = ref<ProductionAnomaly[]>([])
const currentPage = ref(1)
const pageSize = ref(10)
const totalCount = ref(0)
const totalPages = computed(() => Math.max(1, Math.ceil(totalCount.value / pageSize.value)))
const displayedPages = computed(() => {
  const tp = totalPages.value; const cp = currentPage.value
  if (tp <= 7) return Array.from({ length: tp }, (_, i) => i + 1)
  const pages: (number | string)[] = [1]
  if (cp > 3) pages.push('...')
  const start = Math.max(2, cp - 1); const end = Math.min(tp - 1, cp + 1)
  for (let i = start; i <= end; i++) pages.push(i)
  if (cp < tp - 2) pages.push('...')
  if (tp > 1) pages.push(tp)
  return pages
})
function goToPage(p: number | string) {
  if (typeof p === "string") return
  if (p < 1 || p > totalPages.value) return
  currentPage.value = p
  loadAnomalies()
}
const detail = ref<ProductionAnomalyDetail | null>(null)
const analysis = ref<AnalyzeAnomalyResult | null>(null)
const analyzing = ref(false)
const latestDispatch = ref<AnomalyDispatchRecord | null>(null)
const dispatchedLaneIds = ref<string[]>([])
const notification = ref('')
const startupNotifications = ref<string[]>([])
const detailNotification = ref('')
const analysisNotification = ref('')
const operationNotification = ref('')

const eventLanes = [
  {
    id: 'equipment-cnc001',
    type: '设备事件',
    title: 'CNC-001 主轴温升异常',
    detail: '先停机保护瓶颈设备，再触发排产复核和维护窗口确认。',
    route: '异常管理 -> 风险队列 -> AI 排产 -> 设备维护',
    level: 'critical',
  },
  {
    id: 'quality-gap',
    type: '质量事件',
    title: '装配间隙超差',
    detail: '隔离在制品，生成返工/复验窗口，并把延期影响写入 OTD 复盘。',
    route: '异常管理 -> 质量闭环 -> AI 排产 -> 报表中心',
    level: 'warning',
  },
  {
    id: 'material-batch',
    type: '物料事件',
    title: '原料批次来料异常',
    detail: '隔离批次并启用备用物料，采购协同跟踪供应商整改。',
    route: '异常管理 -> 库存齐套 -> 采购协同 -> 风险下降',
    level: 'info',
  },
]

const eventLaneListLabel = computed(() => `异常分流事件队列：${eventLanes.length} 条`)

function linkedRoute(path: string) {
  const query: Record<string, string> = {}
  const params = typeof window === 'undefined' ? new URLSearchParams() : new URLSearchParams(window.location.search)
  for (const key of ['offlineDemo', 'demoMode']) {
    const value = params.get(key)
    if (value) query[key] = value
  }
  return Object.keys(query).length ? { path, query } : path
}

function eventLaneLabel(lane: typeof eventLanes[number]) {
  return `${lane.type}：${lane.title}，${lane.route}`
}

const demoAnomalies: ProductionAnomaly[] = [
  { id: 'a-1', workOrderNumber: 'WO-20260501', operationCode: 'OP-020', equipmentId: 'CNC-001', anomalyType: 'equipment', severity: 'Critical', title: 'CNC-001 主轴温升异常', description: '主轴温度持续上升至 85°C，超过警戒线 75°C，可能导致轴承烧毁', detectedAt: '2026-05-12T09:30:00', detectedBy: 'operator1', status: 'Open', rootCause: null, resolution: null, responseCount: 1 },
  { id: 'a-2', workOrderNumber: 'WO-20260502', operationCode: 'OP-030', equipmentId: null, anomalyType: 'quality', severity: 'High', title: '装配间隙超差', description: '精密轴承组件 A 装配后径向间隙 0.05mm，超出规格上限 0.03mm', detectedAt: '2026-05-12T10:15:00', detectedBy: 'qc1', status: 'Acknowledged', rootCause: null, resolution: null, responseCount: 0 },
  { id: 'a-3', workOrderNumber: 'WO-20260501', operationCode: 'OP-040', equipmentId: 'INJ-001', anomalyType: 'material', severity: 'Medium', title: '原料批次来料异常', description: '润滑脂批次 LH-202605 粘度检测不合格，超出规格 12%', detectedAt: '2026-05-11T14:00:00', detectedBy: 'operator1', status: 'Resolved', rootCause: '供应商工艺参数变更未通知', resolution: '更换为备用批次 LH-202604，已联系供应商整改', responseCount: 2 },
  { id: 'a-4', workOrderNumber: 'WO-20260503', operationCode: 'OP-010', equipmentId: null, anomalyType: 'process', severity: 'Low', title: '作业指导书版本不符', description: '现场使用的作业指导书版本为 V1.2，最新版本为 V2.0', detectedAt: '2026-05-10T08:00:00', detectedBy: 'auditor', status: 'Resolved', rootCause: '文件更新后未及时替换现场版本', resolution: '已替换为最新版本，并对操作员进行培训', responseCount: 1 },
]

const demoDetail: Record<string, ProductionAnomalyDetail> = {
  'a-1': {
    id: 'a-1', workOrderNumber: 'WO-20260501', operationCode: 'OP-020', equipmentId: 'CNC-001', anomalyType: 'equipment', severity: 'Critical', title: 'CNC-001 主轴温升异常', description: '主轴温度持续上升至 85°C，超过警戒线 75°C，可能导致轴承烧毁', detectedAt: '2026-05-12T09:30:00', detectedBy: 'operator1', status: 'Open', rootCause: null, resolution: null, resolvedAt: null, resolvedBy: null,
    responses: [{ id: 'r1', responseType: 'AiSuggestion', description: '设备异常建议', suggestedAction: '立即停机检查主轴冷却系统，检查冷却液流量和温度', suggestedBy: 'AI Agent', status: 'Pending', executedAt: null, executedBy: null, createdAt: '2026-05-12T09:30:30' }],
  },
  'a-2': {
    id: 'a-2', workOrderNumber: 'WO-20260502', operationCode: 'OP-030', equipmentId: null, anomalyType: 'quality', severity: 'High', title: '装配间隙超差', description: '精密轴承组件 A 装配后径向间隙 0.05mm，超出规格上限 0.03mm', detectedAt: '2026-05-12T10:15:00', detectedBy: 'qc1', status: 'Acknowledged', rootCause: null, resolution: null, resolvedAt: null, resolvedBy: null,
    responses: [],
  },
  'a-3': {
    id: 'a-3', workOrderNumber: 'WO-20260501', operationCode: 'OP-040', equipmentId: 'INJ-001', anomalyType: 'material', severity: 'Medium', title: '原料批次来料异常', description: '润滑脂批次 LH-202605 粘度检测不合格，超出规格 12%', detectedAt: '2026-05-11T14:00:00', detectedBy: 'operator1', status: 'Resolved', rootCause: '供应商工艺参数变更未通知', resolution: '更换为备用批次 LH-202604，已联系供应商整改', resolvedAt: '2026-05-11T16:00:00', resolvedBy: 'leader1',
    responses: [
      { id: 'r2', responseType: 'AiSuggestion', description: '来料异常建议', suggestedAction: '隔离该批次原料，启动备用批次，通知采购部联系供应商', suggestedBy: 'AI Agent', status: 'Executed', executedAt: '2026-05-11T14:30:00', executedBy: 'leader1', createdAt: '2026-05-11T14:01:00' },
      { id: 'r3', responseType: 'Manual', description: '主管确认', suggestedAction: '已执行隔离措施，备用批次已上线', suggestedBy: 'leader1', status: 'Executed', executedAt: '2026-05-11T15:00:00', executedBy: 'leader1', createdAt: '2026-05-11T14:35:00' },
    ],
  },
}

async function currentProductionAnomalyDetail() {
  const event = await readProductionAnomalyEventBackendFirst()
  return event ? toProductionAnomalyDetail(event) : null
}

const criticalCount = computed(() => anomalies.value.filter(a => a.severity === 'Critical').length)
const openCount = computed(() => anomalies.value.filter(a => a.status === 'Open' || a.status === 'Acknowledged').length)
const filteredAnomalies = computed(() => {
  if (filter.value === 'critical') return anomalies.value.filter(a => a.severity === 'Critical')
  if (filter.value === 'open') return anomalies.value.filter(a => a.status === 'Open' || a.status === 'Acknowledged')
  return anomalies.value
})

function sevLabel(s: string) {
  return { Critical: '紧急', High: '严重', Medium: '一般', Low: '轻微' }[s] || s
}

function statusLabel(s: string) {
  return { Open: '待处理', Acknowledged: '调查中', Resolved: '已解决', Closed: '已关闭' }[s] || s
}

function formatTime(t: string) {
  return t?.slice(5, 16).replace('T', ' ') || ''
}

async function selectAnomaly(a: ProductionAnomaly) {
  analysis.value = null
  detailNotification.value = ''
  analysisNotification.value = ''
  syncNotification()
  const eventDetail = await currentProductionAnomalyDetail()
  if (eventDetail?.id === a.id) {
    detail.value = eventDetail
    return
  }
  try {
    detail.value = await getAnomalyById(a.id)
  } catch (error: unknown) {
    detail.value = demoDetail[a.id] || null
    detailNotification.value = `异常详情加载失败，已显示本地演示详情：${errorMessage(error, '请稍后重试')}`
    syncNotification()
  }
}

async function handleAnalyze() {
  if (!detail.value) return
  analyzing.value = true
  analysis.value = null
  analysisNotification.value = ''
  syncNotification()
  try {
    analysis.value = await analyzeAnomaly(detail.value.id)
  } catch (error: unknown) {
    analysisNotification.value = `AI 分析加载失败，已显示本地演示建议：${errorMessage(error, '请稍后重试')}`
    syncNotification()
    // demo AI analysis
    const type = detail.value.anomalyType
    if (type === 'equipment') {
      analysis.value = {
        anomalyId: detail.value.id, title: detail.value.title,
        suggestedRootCause: null, suggestedResolution: null,
        analysisSummary: 'AI 分析了 2 个建议方案',
        suggestedActions: [
          { action: '立即停机检查主轴冷却系统，检查冷却液位和循环泵', reason: '主轴温升通常由冷却系统故障引起', priority: 1 },
          { action: '检查主轴轴承状态，必要时更换并记录运行参数', reason: '轴承磨损会导致摩擦发热', priority: 2 },
        ],
      }
    } else if (type === 'quality') {
      analysis.value = {
        anomalyId: detail.value.id, title: detail.value.title,
        suggestedRootCause: null, suggestedResolution: null,
        analysisSummary: 'AI 分析了 2 个建议方案',
        suggestedActions: [
          { action: '检查上一工序加工参数，确认是否存在偏差', reason: '装配间隙超差通常由前道工序尺寸异常导致', priority: 1 },
          { action: '对在制品进行全检，隔离不合格品', reason: '防止不合格品流入下道工序', priority: 2 },
        ],
      }
    } else {
      analysis.value = {
        anomalyId: detail.value.id, title: detail.value.title,
        suggestedRootCause: null, suggestedResolution: null,
        analysisSummary: 'AI 分析了 1 个建议方案',
        suggestedActions: [
          { action: '隔离异常批次，启动备用物料方案', reason: '来料异常需防止不合格物料投入生产', priority: 1 },
        ],
      }
    }
  }
  analyzing.value = false
}

async function loadAnomalies() {
  loading.value = true
  const event = await readProductionAnomalyEventBackendFirst()
  try {
    const result = await getAnomalyList(currentPage.value, pageSize.value)
    anomalies.value = event
      ? [toProductionAnomaly(event), ...result.items.filter(item => item.id !== event.id)]
      : result.items
    totalCount.value = event ? result.totalCount + 1 : result.totalCount
  } catch (error: unknown) {
    anomalies.value = event
      ? [toProductionAnomaly(event), ...demoAnomalies.filter(item => item.id !== event.id)]
      : demoAnomalies
    totalCount.value = anomalies.value.length
    if (isOfflineDemoError(error)) {
      loading.value = false
      return
    }
    pushStartupNotification(`异常列表加载失败，已显示本地演示异常：${errorMessage(error, '请稍后重试')}`)
  }
  loading.value = false
}

function dispatchEventLane(laneId: string) {
  if (dispatchedLaneIds.value.includes(laneId)) return
  const lane = eventLanes.find(item => item.id === laneId)
  if (!lane) return
  operationNotification.value = ''
  syncNotification()
  let record: AnomalyDispatchRecord | null = null
  try {
    record = writeAnomalyDispatchRecord(dispatchRecordForLane(laneId))
  } catch (error: unknown) {
    operationNotification.value = `异常分流确认失败，未写入下游处置证据：${errorMessage(error, '请稍后重试')}`
    syncNotification()
    return
  }
  if (!record) {
    operationNotification.value = '异常分流确认失败，未写入下游处置证据：浏览器存储不可用'
    syncNotification()
    return
  }
  latestDispatch.value = record
  dispatchedLaneIds.value = Array.from(new Set([record.anomalyId, ...dispatchedLaneIds.value]))
}

function dispatchRecordForLane(laneId: string): Omit<AnomalyDispatchRecord, 'id' | 'status' | 'createdAt'> {
  if (laneId === 'quality-gap') {
    return {
      anomalyId: laneId,
      type: 'quality',
      typeLabel: '质量异常',
      title: '装配间隙超差已分流到质量返工与排产复核',
      workOrderNumber: 'WO-20260502',
      operationCode: 'OP-030',
      route: '异常管理 -> 质量闭环 -> AI 排产 -> OTD 复盘',
      owner: '质量工程师 周工',
      dueAt: '今日 15:00',
      affectedOrders: 'WO-20260502 / WO-RUSH-9001',
      deliveryImpact: '预计影响 1 个装配窗口',
      scheduleWindow: 'OP-030 复验前',
      suggestedAction: '隔离当前批次，插入返工/复验窗口，并让 AI 排产保护 WO-RUSH-9001 后段装配承诺。',
      auditId: 'AUD-ANOMALY-DISPATCH-20260521-001',
      traceId: 'TRACE-ANOMALY-DISPATCH-QUALITY-GAP-20260521',
      statusLabel: '质量分流已确认',
      summary: '现场事件中心确认质量异常分流，质量闭环、AI 排产、风险处置和 OTD 复盘读取同一条异常分流证据。',
    }
  }
  if (laneId === 'equipment-cnc001') {
    return {
      anomalyId: laneId,
      type: 'equipment',
      typeLabel: '设备异常',
      title: 'CNC-001 主轴温升异常已分流到设备维护与排产复核',
      workOrderNumber: 'WO-20260501',
      operationCode: 'OP-020',
      route: '异常管理 -> 风险队列 -> AI 排产 -> 设备维护',
      owner: '设备主管 赵工',
      dueAt: '今日 14:00',
      affectedOrders: 'WO-20260501 / WO-2026-0042',
      deliveryImpact: '预计停机 2h',
      scheduleWindow: '今日夜班维护窗口',
      suggestedAction: '停机保护 CNC-001，切换 CNC-003 分流，并提交调度员复核瓶颈设备保护策略。',
      auditId: 'AUD-ANOMALY-DISPATCH-20260521-002',
      traceId: 'TRACE-ANOMALY-DISPATCH-EQUIPMENT-CNC001-20260521',
      statusLabel: '设备分流已确认',
      summary: '现场事件中心确认设备异常分流，风险队列和 AI 排产按设备停机影响生成复核动作。',
    }
  }
  return {
    anomalyId: laneId,
    type: 'material',
    typeLabel: '物料异常',
    title: '原料批次来料异常已分流到库存与采购协同',
    workOrderNumber: 'WO-20260501',
    operationCode: 'OP-040',
    route: '异常管理 -> 库存齐套 -> 采购协同 -> 风险下降',
    owner: '采购 王工',
    dueAt: '今日 16:00',
    affectedOrders: 'WO-20260501 / WO-DEMO-1002',
    deliveryImpact: '预计影响 1 个物料批次窗口',
    scheduleWindow: '来料复检前',
    suggestedAction: '隔离 LH-202605 批次，启用备用批次，并要求采购协同追踪供应商整改承诺。',
    auditId: 'AUD-ANOMALY-DISPATCH-20260521-003',
    traceId: 'TRACE-ANOMALY-DISPATCH-MATERIAL-BATCH-20260521',
    statusLabel: '物料分流已确认',
    summary: '现场事件中心确认物料异常分流，库存齐套和采购协同按批次隔离结果回写风险状态。',
  }
}

async function applyStoredDispatchRecords() {
  try {
    const records = await readAnomalyDispatchRecordsBackendFirst()
    latestDispatch.value = records[0] ?? null
    dispatchedLaneIds.value = records.map(record => record.anomalyId)
  } catch (error: unknown) {
    latestDispatch.value = null
    dispatchedLaneIds.value = []
    pushStartupNotification(`异常分流记录加载失败，仍可继续确认新的分流：${errorMessage(error, '请稍后重试')}`)
  }
}

function pushStartupNotification(message: string) {
  if (!startupNotifications.value.includes(message)) {
    startupNotifications.value = [...startupNotifications.value, message]
  }
  syncNotification()
}

function syncNotification() {
  notification.value = [
    ...startupNotifications.value,
    detailNotification.value,
    analysisNotification.value,
    operationNotification.value,
  ].filter(Boolean).join('；')
}

onMounted(async () => {
  await applyStoredDispatchRecords()
  await loadAnomalies()
})
</script>

<style scoped>
.anomaly-board { height: 100%; display: flex; flex-direction: column; overflow: hidden; padding: 16px; }
.page-title { font-size: 16px; font-weight: 700; margin-bottom: 12px; }
.toolbar { display: flex; gap: 8px; margin-bottom: 12px; }
.btn { padding: 6px 14px; border: 1px solid #d9d9d9; background: #fff; border-radius: 4px; cursor: pointer; font-size: 13px; }
.btn.active { background: #1890ff; color: #fff; border-color: #1890ff; }
.anomaly-notification { margin-bottom: 12px; padding: 10px 12px; border: 1px solid #ffccc7; border-radius: 6px; background: #fff2f0; color: #a8071a; font-size: 13px; }
.event-center { position: relative; z-index: 0; flex: 0 0 auto; background: #fff; border: 1px solid #e6edf5; border-radius: 8px; padding: 14px; margin-bottom: 12px; }
.event-center-head { display: flex; justify-content: space-between; align-items: flex-start; gap: 12px; margin-bottom: 12px; }
.eyebrow { display: block; font-size: 11px; color: #1677ff; font-weight: 700; margin-bottom: 3px; }
.event-center h3 { margin: 0; font-size: 14px; }
.event-center-status { background: #fff7e6; border: 1px solid #ffd591; color: #d46b08; border-radius: 4px; padding: 3px 8px; font-size: 12px; white-space: nowrap; }
.dispatch-guidance { display: grid; grid-template-columns: minmax(0, 1fr) auto; gap: 12px; align-items: center; margin-bottom: 12px; padding: 10px 12px; border: 1px solid #d6e4ff; border-radius: 6px; background: #f5f9ff; font-size: 12px; }
.dispatch-guidance p { margin: 0; color: #344054; line-height: 1.5; }
.dispatch-guidance nav { display: flex; gap: 8px; flex-wrap: wrap; justify-content: flex-end; }
.dispatch-guidance a { color: #1677ff; font-weight: 700; text-decoration: none; white-space: nowrap; }
.event-lanes { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 10px; }
.event-lane { border: 1px solid #edf1f5; border-radius: 6px; padding: 10px; min-height: 120px; }
.event-lane span { display: block; color: #667085; font-size: 11px; margin-bottom: 6px; }
.event-lane strong { display: block; color: #1f2937; font-size: 13px; margin-bottom: 6px; }
.event-lane p { margin: 0 0 8px; color: #667085; font-size: 12px; line-height: 1.5; }
.event-lane.critical { border-top: 3px solid #ff4d4f; }
.event-lane.warning { border-top: 3px solid #faad14; }
.event-lane.info { border-top: 3px solid #1890ff; }
.lane-route { color: #1677ff; font-size: 11px; background: #eef6ff; border-radius: 4px; padding: 5px 6px; }
.event-lane button { margin-top: 8px; min-height: 28px; padding: 0 10px; border: 1px solid #1677ff; border-radius: 4px; background: #fff; color: #1677ff; cursor: pointer; font-size: 12px; font-weight: 700; }
.event-bridge { display: flex; align-items: center; gap: 10px; margin-top: 12px; padding: 10px 12px; background: #f6f9fc; border-radius: 6px; font-size: 12px; }
.event-bridge span { color: #1677ff; font-weight: 700; white-space: nowrap; }
.event-bridge strong { flex: 1; color: #1f2937; font-weight: 600; }
.event-bridge a { color: #1677ff; text-decoration: none; white-space: nowrap; }
.dispatch-trace { display: grid; grid-template-columns: auto minmax(0, 1fr) auto; gap: 8px; align-items: center; margin-top: 10px; padding: 10px 12px; border: 1px solid #bbf7d0; border-radius: 6px; background: #f0fdf4; font-size: 12px; }
.dispatch-trace span { padding: 2px 6px; border-radius: 4px; background: #dcfce7; color: #15803d; font-weight: 700; }
.dispatch-trace strong { color: #111827; }
.dispatch-trace p { grid-column: 1 / -1; margin: 0; color: #4b5563; line-height: 1.45; }
.dispatch-trace code { color: #1677ff; font-size: 12px; }
.anomaly-content { position: relative; z-index: 1; flex: 1 1 320px; min-height: 260px; display: flex; flex-direction: column; overflow: hidden; }
.anomaly-list { flex: 1; min-height: 0; overflow-y: auto; display: flex; flex-direction: column; gap: 8px; padding-bottom: 8px; }
.anomaly-card { position: relative; z-index: 1; display: flex; gap: 12px; padding: 12px 16px; background: #fff; border-radius: 6px; cursor: pointer; border-left: 4px solid #d9d9d9; transition: box-shadow 0.15s; }
.anomaly-card:hover { box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
.anomaly-card.sev-critical { border-left-color: #ff4d4f; }
.anomaly-card.sev-high { border-left-color: #ff7a45; }
.anomaly-card.sev-medium { border-left-color: #faad14; }
.anomaly-card.sev-low { border-left-color: #1890ff; }
.sev-badge { font-size: 11px; font-weight: 700; padding: 2px 8px; border-radius: 3px; white-space: nowrap; }
.sev-badge.sev-critical { background: #fff2f0; color: #ff4d4f; }
.sev-badge.sev-high { background: #fff7e6; color: #ff7a45; }
.sev-badge.sev-medium { background: #fffbe6; color: #faad14; }
.sev-badge.sev-low { background: #e6f7ff; color: #1890ff; }
.card-left { display: flex; align-items: flex-start; padding-top: 2px; }
.card-body { flex: 1; }
.card-title { font-weight: 600; font-size: 13px; margin-bottom: 4px; }
.card-meta { display: flex; gap: 12px; font-size: 12px; color: #888; }
.card-right { text-align: right; display: flex; flex-direction: column; gap: 4px; flex-shrink: 0; }
.status-badge { font-size: 11px; padding: 1px 6px; border-radius: 3px; background: #f5f5f5; color: #666; text-align: center; }
.status-badge.st-open { background: #fff2f0; color: #ff4d4f; }
.status-badge.st-acknowledged { background: #fffbe6; color: #faad14; }
.status-badge.st-resolved { background: #f6ffed; color: #52c41a; }
.card-time { font-size: 11px; color: #bbb; }
.empty-state { text-align: center; color: #bbb; padding-top: 40px; }

/* 滑出面板 */
.slide-panel { position: fixed; inset: 0; background: rgba(0,0,0,0.3); z-index: 1000; display: flex; justify-content: flex-end; }
.panel-content { width: 480px; max-width: 90vw; background: #fff; height: 100%; overflow-y: auto; padding: 20px; }
.panel-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
.panel-header h3 { margin: 0; font-size: 16px; }
.close-btn { background: none; border: none; font-size: 18px; cursor: pointer; color: #999; }
.detail-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px 16px; margin-bottom: 16px; font-size: 13px; }
.detail-grid label { display: block; font-size: 11px; color: #999; }
.sev-text { font-weight: 600; }
.sev-text.sev-critical { color: #ff4d4f; }
.detail-desc, .detail-section { margin-bottom: 16px; }
.detail-desc label, .detail-section label { display: block; font-size: 11px; color: #999; margin-bottom: 4px; }
.detail-desc p, .detail-section p { font-size: 13px; margin: 0; line-height: 1.6; }
.section { margin: 16px 0; }
.section h4 { font-size: 13px; margin: 0 0 8px; }
.btn-ai { padding: 8px 20px; background: #722ed1; color: #fff; border: none; border-radius: 4px; cursor: pointer; font-size: 13px; }
.btn-ai:hover { background: #9254de; }
.btn-ai:disabled { background: #d3adf7; cursor: not-allowed; }
.analysis-results { display: flex; flex-direction: column; gap: 8px; margin-bottom: 16px; }
.action-card { display: flex; gap: 10px; padding: 10px; border-radius: 6px; background: #fafafa; border-left: 3px solid #d9d9d9; }
.action-card.pri-1 { border-left-color: #ff4d4f; }
.action-card.pri-2 { border-left-color: #faad14; }
.action-pri { font-size: 11px; font-weight: 700; color: #999; flex-shrink: 0; }
.action-body { flex: 1; }
.action-text { font-size: 13px; margin-bottom: 2px; }
.action-reason { font-size: 11px; color: #888; }
.response-item { padding: 8px 0; border-bottom: 1px solid #f5f5f5; font-size: 13px; }
.resp-header { display: flex; gap: 8px; margin-bottom: 4px; }
.resp-type { font-size: 11px; background: #e6f7ff; color: #1890ff; padding: 0 6px; border-radius: 3px; }
.resp-status { font-size: 11px; color: #999; }
.resp-body { margin-bottom: 2px; }
.resp-by { font-size: 11px; color: #bbb; }
.no-data { color: #bbb; font-size: 12px; }
.pagination-bar { display: flex; align-items: center; gap: 4px; padding: 10px 16px; border-top: 1px solid #f0f0f0; flex-wrap: wrap; }
.page-btn { min-width: 28px; height: 28px; padding: 0 8px; border: 1px solid #d9d9d9; background: #fff; border-radius: 4px; font-size: 12px; cursor: pointer; }
.page-btn.active { background: #1890ff; color: #fff; border-color: #1890ff; }
.page-btn:disabled { color: #d9d9d9; cursor: not-allowed; }
.page-ellipsis { width: 28px; text-align: center; color: #999; font-size: 12px; }
.page-info { margin-left: auto; font-size: 12px; color: #999; }
@media (max-width: 1100px) {
  .dispatch-guidance { grid-template-columns: 1fr; }
  .dispatch-guidance nav { justify-content: flex-start; }
  .event-lanes { grid-template-columns: 1fr; }
  .event-bridge { align-items: flex-start; flex-direction: column; }
}
</style>
