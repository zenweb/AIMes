<template>
  <div class="anomaly-board">
    <h2 class="page-title">异常管理</h2>

    <div class="toolbar">
      <button class="btn" :class="{ active: filter === 'all' }" @click="filter = 'all'">全部 ({{ anomalies.length }})</button>
      <button class="btn" :class="{ active: filter === 'critical' }" @click="filter = 'critical'">紧急 ({{ criticalCount }})</button>
      <button class="btn" :class="{ active: filter === 'open' }" @click="filter = 'open'">待处理 ({{ openCount }})</button>
    </div>

    <div class="anomaly-list">
      <div
        v-for="a in filteredAnomalies"
        :key="a.id"
        class="anomaly-card"
        :class="'sev-' + a.severity.toLowerCase()"
        @click="selectAnomaly(a)"
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

    <!-- 详情滑出面板 -->
    <div v-if="detail" class="slide-panel" @click.self="detail = null">
      <div class="panel-content">
        <div class="panel-header">
          <h3>{{ detail.title }}</h3>
          <button class="close-btn" @click="detail = null">✕</button>
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
import { getAnomalyList, getCriticalAnomalies, getAnomalyById, analyzeAnomaly } from '../../api/anomaly'

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

const demoAnomalies: ProductionAnomaly[] = [
  { id: 'a-1', workOrderNumber: 'WO-20260501', operationCode: 'OP-020', equipmentId: 'CNC-001', anomalyType: 'equipment', severity: 'Critical', title: 'CNC-001 主轴温升异常', description: '主轴温度持续上升至 85°C，超过警戒线 75°C，可能导致轴承烧毁', detectedAt: '2026-05-12T09:30:00', detectedBy: 'operator1', status: 'Open', rootCause: null, resolution: null, responseCount: 1 },
  { id: 'a-2', workOrderNumber: 'WO-20260502', operationCode: 'OP-030', equipmentId: null, anomalyType: 'quality', severity: 'High', title: '装配间隙超差', description: '精密轴承组件 A 装配后径向间隙 0.05mm，超出规格上限 0.03mm', detectedAt: '2026-05-12T10:15:00', detectedBy: 'qc1', status: 'Acknowledged', rootCause: null, resolution: null, responseCount: 0 },
  { id: 'a-3', workOrderNumber: 'WO-20260501', operationCode: 'OP-040', equipmentId: 'INJ-001', anomalyType: 'material', severity: 'Medium', title: '原料批次来料异常', description: '润滑脂批次 LH-202605 粘度检测不合格，超出规格 12%', detectedAt: '2026-05-11T14:00:00', detectedBy: 'operator1', status: 'Resolved', rootCause: '供应商工艺参数变更未通知', resolution: '更换为备用批次 LH-202604，已联系供应商整改', responseCount: 2 },
  { id: 'a-4', workOrderNumber: 'WO-20260503', operationCode: 'OP-010', equipmentId: null, anomalyType: 'process', severity: 'Low', title: '作业指导书版本不符', description: '现场使用的作业指导书版本为 V1.2，最新版本为 V2.0', detectedAt: '2026-05-10T08:00:00', detectedBy: 'auditor', status: 'Resolved', rootCause: '文件更新后未及时替换现场版本', resolution: '已替换为最新版本，并对操作员进行培训', responseCount: 1 },
]

const demoDetail: Record<string, any> = {
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
  try {
    detail.value = await getAnomalyById(a.id)
  } catch {
    detail.value = demoDetail[a.id] || null
  }
}

async function handleAnalyze() {
  if (!detail.value) return
  analyzing.value = true
  analysis.value = null
  try {
    analysis.value = await analyzeAnomaly(detail.value.id)
  } catch {
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
  try {
    const result = await getAnomalyList(currentPage.value, pageSize.value)
    anomalies.value = result.items
    totalCount.value = result.totalCount
  } catch {
    anomalies.value = demoAnomalies
    totalCount.value = demoAnomalies.length
  }
  loading.value = false
}

onMounted(loadAnomalies)
</script>

<style scoped>
.anomaly-board { height: 100%; display: flex; flex-direction: column; padding: 16px; }
.page-title { font-size: 16px; font-weight: 700; margin-bottom: 12px; }
.toolbar { display: flex; gap: 8px; margin-bottom: 12px; }
.btn { padding: 6px 14px; border: 1px solid #d9d9d9; background: #fff; border-radius: 4px; cursor: pointer; font-size: 13px; }
.btn.active { background: #1890ff; color: #fff; border-color: #1890ff; }
.anomaly-list { flex: 1; overflow-y: auto; display: flex; flex-direction: column; gap: 8px; }
.anomaly-card { display: flex; gap: 12px; padding: 12px 16px; background: #fff; border-radius: 6px; cursor: pointer; border-left: 4px solid #d9d9d9; transition: box-shadow 0.15s; }
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
</style>
