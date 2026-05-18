<template>
  <div class="equipment-board">
      <!-- 顶部 KPI -->
      <div class="kpi-row">
        <div class="kpi-card">
          <div class="kpi-icon" style="background:#f6ffed;color:#52c41a">🟢</div>
          <div class="kpi-body">
            <span class="kpi-value">{{ stats.runningCount }}/{{ stats.totalCount }}</span>
            <span class="kpi-label">运行中</span>
          </div>
        </div>
        <div class="kpi-card">
          <div class="kpi-icon" style="background:#e6f7ff;color:#1890ff">⚡</div>
          <div class="kpi-body">
            <span class="kpi-value">{{ stats.utilizationRate }}%</span>
            <span class="kpi-label">设备利用率</span>
          </div>
        </div>
        <div class="kpi-card">
          <div class="kpi-icon" style="background:#f6ffed;color:#52c41a">✓</div>
          <div class="kpi-body">
            <span class="kpi-value">{{ stats.availabilityRate }}%</span>
            <span class="kpi-label">设备可动率</span>
          </div>
        </div>
        <div class="kpi-card">
          <div class="kpi-icon" style="background:#fff2f0;color:#ff4d4f">🔧</div>
          <div class="kpi-body">
            <span class="kpi-value">{{ stats.maintenanceCount + stats.faultCount }}</span>
            <span class="kpi-label">待修/故障</span>
          </div>
        </div>
      </div>

      <!-- 设备列表 -->
      <div class="card">
        <div class="card-header">
          <h3>设备列表</h3>
          <div class="eq-filters">
            <select v-model="typeFilter" class="filter-select">
              <option value="">全部类型</option>
              <option v-for="t in equipmentTypes" :key="t" :value="t">{{ t }}</option>
            </select>
            <select v-model="statusFilter" class="filter-select" @change="onFilterChange">
              <option value="">全部状态</option>
              <option value="running">运行中</option>
              <option value="idle">空闲</option>
              <option value="maintenance">维护中</option>
              <option value="fault">故障</option>
              <option value="offline">离线</option>
            </select>
          </div>
        </div>
        <div class="card-body">
          <div class="eq-grid">
            <div
              v-for="eq in filteredEquipment"
              :key="eq.id"
              class="eq-card"
              :class="{ selected: selectedId === eq.id }"
              @click="selectEquipment(eq.id)"
            >
              <div class="eq-top">
                <span class="eq-status-dot" :class="eq.status"></span>
                <span class="eq-name">{{ eq.equipmentName }}</span>
                <span class="eq-badge" :class="utilClass(eq.utilizationRate)">
                  {{ eq.utilizationRate }}%
                </span>
              </div>
              <div class="eq-mid">
                <span class="eq-code">{{ eq.equipmentCode }}</span>
                <span class="eq-type-tag">{{ eq.equipmentType }}</span>
              </div>
              <div class="eq-bar-container">
                <div class="eq-bar" :style="{ width: eq.utilizationRate + '%' }"
                  :class="utilClass(eq.utilizationRate)"></div>
              </div>
              <div class="eq-bottom">
                <span>当前工单: {{ eq.currentWorkOrderId || '—' }}</span>
              </div>
            </div>
          </div>
          <div v-if="!filteredEquipment.length" class="empty-state">无匹配设备</div>
        </div>
        <!-- 分页 -->
        <div v-if="totalPages > 1" class="pagination-bar">
          <button class="page-btn" :disabled="currentPage <= 1" @click="goToPage(currentPage - 1)">‹</button>
          <template v-for="p in displayedPages" :key="p">
            <span v-if="p === '...'" class="page-ellipsis">…</span>
            <button v-else class="page-btn" :class="{ active: p === currentPage }" @click="goToPage(p as number)">{{ p }}</button>
          </template>
          <button class="page-btn" :disabled="currentPage >= totalPages" @click="goToPage(currentPage + 1)">›</button>
          <span class="page-info">共 {{ totalCount }} 条</span>
        </div>
      </div>

      <!-- 详情面板 -->
      <Transition name="slide-up">
        <div v-if="selectedEq" class="detail-panel">
          <div class="detail-header">
            <div>
              <h4>{{ selectedEq.equipmentName }}</h4>
              <span class="eq-code-sm">{{ selectedEq.equipmentCode }}</span>
            </div>
            <button class="close-btn" @click="selectedId = null; selectedEq = null">✕</button>
          </div>
          <div class="detail-tabs">
            <button v-for="tab in tabs" :key="tab.key"
              :class="{ active: activeTab === tab.key }" @click="switchTab(tab.key)">
              {{ tab.label }}
            </button>
          </div>
          <div class="detail-body">
            <!-- 概览 -->
            <div v-if="activeTab === 'overview'" class="tab-content">
              <div class="info-grid">
                <div class="info-item"><label>设备编码</label><span>{{ selectedEq.equipmentCode }}</span></div>
                <div class="info-item"><label>设备类型</label><span>{{ selectedEq.equipmentType }}</span></div>
                <div class="info-item"><label>车间</label><span>{{ selectedEq.workshopName }}</span></div>
                <div class="info-item"><label>状态</label><span class="status-text" :class="selectedEq.status">{{ statusLabel(selectedEq.status) }}</span></div>
                <div class="info-item"><label>产能</label><span>{{ selectedEq.capacity }}</span></div>
                <div class="info-item"><label>利用率</label><span :class="utilClass(selectedEq.utilizationRate)">{{ selectedEq.utilizationRate }}%</span></div>
                <div class="info-item"><label>上次保养</label><span>{{ selectedEq.lastMaintenanceDate ? formatDate(selectedEq.lastMaintenanceDate) : '—' }}</span></div>
                <div class="info-item"><label>下次保养</label><span>{{ selectedEq.nextMaintenanceDate ? formatDate(selectedEq.nextMaintenanceDate) : '—' }}</span></div>
              </div>
            </div>

            <!-- 健康状态 -->
            <div v-if="activeTab === 'health'" class="tab-content">
              <div v-if="healthLoading" class="loading-state">加载中...</div>
              <div v-else-if="health" class="health-section">
                <div class="health-score-card" :class="health.healthStatus">
                  <span class="score-value">{{ health.healthScore }}</span>
                  <span class="score-label">健康分</span>
                  <span class="score-status">{{ health.healthStatus === 'healthy' ? '健康' : health.healthStatus === 'warning' ? '需关注' : '异常' }}</span>
                </div>
                <div v-if="health.anomalies.length" class="health-sub">
                  <h5>异常参数</h5>
                  <div v-for="a in health.anomalies" :key="a.parameterName" class="param-item" :class="a.severity">
                    <span class="param-name">{{ a.parameterName }}</span>
                    <span class="param-val">当前 {{ a.value }} (期望 {{ a.expectedValue }})</span>
                    <span class="param-dev">偏差 {{ a.deviation > 0 ? '+' : '' }}{{ a.deviation.toFixed(1) }}%</span>
                  </div>
                </div>
                <div v-if="health.predictedFailures.length" class="health-sub">
                  <h5>预测故障</h5>
                  <div v-for="pf in health.predictedFailures" :key="pf.failureType" class="pred-item">
                    <span class="pred-type">{{ pf.failureType }}</span>
                    <span class="pred-conf">置信度 {{ (pf.confidence * 100).toFixed(0) }}%</span>
                    <span class="pred-time">预计 {{ formatDate(pf.estimatedTimeToFailure) }}</span>
                    <div class="pred-recommend">💡 {{ pf.recommendation }}</div>
                  </div>
                </div>
              </div>
              <div v-else class="empty-state">健康数据不可用</div>
            </div>

            <!-- 维护记录 -->
            <div v-if="activeTab === 'maintenance'" class="tab-content">
              <div v-if="maintLoading" class="loading-state">加载中...</div>
              <div v-else-if="maintenanceRecords.length">
                <div v-for="m in maintenanceRecords" :key="m.id" class="maint-item">
                  <div class="maint-header">
                    <span class="maint-type-badge" :class="m.maintenanceType">{{ m.maintenanceType === 'preventive' ? '预防性' : '纠正性' }}</span>
                    <span class="maint-date">{{ formatDate(m.startTime) }}</span>
                    <span class="maint-result" :class="m.result">{{ m.result === 'completed' ? '完成' : m.result === 'pending' ? '待处理' : '失败' }}</span>
                  </div>
                  <div class="maint-desc">{{ m.description }}</div>
                  <div class="maint-meta">
                    <span>执行人: {{ m.performedBy }}</span>
                    <span>费用: ¥{{ m.cost.toLocaleString() }}</span>
                  </div>
                  <div v-if="m.sparePartsUsed.length" class="maint-parts">
                    备件: {{ m.sparePartsUsed.join('、') }}
                  </div>
                </div>
              </div>
              <div v-else class="empty-state">暂无维护记录</div>
            </div>

            <!-- 故障诊断 -->
            <div v-if="activeTab === 'diagnose'" class="tab-content">
              <div class="diagnose-form">
                <input v-model="errorCode" class="diag-input" placeholder="输入故障代码（可选）" @keydown.enter="runDiagnose" />
                <button class="diag-btn" @click="runDiagnose" :disabled="diagLoading">开始诊断</button>
              </div>
              <div v-if="diagLoading" class="loading-state">诊断分析中...</div>
              <div v-else-if="diagnosis" class="diag-result">
                <div class="diag-cause">
                  <strong>可能原因：</strong>{{ diagnosis.mostLikelyCause }}
                </div>
                <div class="diag-basis">
                  <strong>诊断依据：</strong>{{ diagnosis.diagnosticBasis }}
                </div>
                <div class="diag-section">
                  <h5>建议步骤</h5>
                  <ol><li v-for="s in diagnosis.suggestedSteps" :key="s">{{ s }}</li></ol>
                </div>
                <div v-if="diagnosis.requiredSpareParts.length" class="diag-section">
                  <h5>所需备件</h5>
                  <ul><li v-for="p in diagnosis.requiredSpareParts" :key="p">{{ p }}</li></ul>
                </div>
                <div class="diag-repair">
                  <strong>预计维修时间：</strong>{{ diagnosis.estimatedRepairTime }}
                </div>
              </div>
              <div v-else-if="!diagLoading" class="empty-state">点击"开始诊断"进行分析</div>
            </div>
          </div>
        </div>
      </Transition>
    </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { getEquipmentList, getEquipmentStatistics, getHealthReport, getMaintenanceHistory, diagnose } from '../../api/equipment'
import type { EquipmentDto, EquipmentStatisticsDto, EquipmentHealthDto, DiagnosticReportDto, MaintenanceRecordDto } from '../../types/equipment'
import { formatDate } from '../../utils/date'

const stats = reactive<EquipmentStatisticsDto>({
  totalCount: 0, runningCount: 0, idleCount: 0,
  maintenanceCount: 0, faultCount: 0, offlineCount: 0,
  utilizationRate: 0, availabilityRate: 0,
})

const equipment = ref<EquipmentDto[]>([])
const typeFilter = ref('')
const statusFilter = ref('')
const selectedId = ref<string | null>(null)
const selectedEq = ref<EquipmentDto | null>(null)
const activeTab = ref('overview')

const health = ref<EquipmentHealthDto | null>(null)
const healthLoading = ref(false)
const maintenanceRecords = ref<MaintenanceRecordDto[]>([])
const maintLoading = ref(false)
const diagnosis = ref<DiagnosticReportDto | null>(null)
const diagLoading = ref(false)
const errorCode = ref('')

// 分页状态
const currentPage = ref(1)
const pageSize = ref(20)
const totalCount = ref(0)
const totalPages = computed(() => Math.max(1, Math.ceil(totalCount.value / pageSize.value)))
const displayedPages = computed(() => {
  const total = totalPages.value
  const current = currentPage.value
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)
  const pages: (number | string)[] = [1]
  const start = Math.max(2, current - 1)
  const end = Math.min(total - 1, current + 1)
  if (current <= 3 && total > 4) { return [1, 2, 3, 4, '...', total] }
  if (current >= total - 2) { return [1, '...', total - 3, total - 2, total - 1, total] }
  if (start > 2) pages.push('...')
  for (let i = start; i <= end; i++) pages.push(i)
  if (end < total - 1) pages.push('...')
  pages.push(total)
  return pages
})

const tabs = [
  { key: 'overview', label: '概览' },
  { key: 'health', label: '健康监控' },
  { key: 'maintenance', label: '维护记录' },
  { key: 'diagnose', label: '故障诊断' },
]

const equipmentTypes = computed(() => {
  const types = new Set(equipment.value.map(e => e.equipmentType).filter(Boolean) as string[])
  return [...types].sort()
})

const filteredEquipment = computed(() => {
  if (!typeFilter.value) return equipment.value
  return equipment.value.filter(e => e.equipmentType !== typeFilter.value)
})

function goToPage(page: number) {
  if (page < 1 || page > totalPages.value) return
  currentPage.value = page
  loadEquipment()
}

async function loadEquipment() {
  try {
    const result = await getEquipmentList(undefined, statusFilter.value || undefined, currentPage.value, pageSize.value)
    equipment.value = result.items
    totalCount.value = result.totalCount
  } catch {
    // fallback demo data
    equipment.value = [
      { id: 'EQ-001', equipmentCode: 'CNC-001', equipmentName: 'CNC-001 加工中心', equipmentType: 'CNC', workshopId: 'WS-001', workshopName: '机加工车间', status: 'running', capacity: 100, utilizationRate: 85, currentWorkOrderId: 'WO-001', createdAt: '2025-01-01T00:00:00' },
      { id: 'EQ-002', equipmentCode: 'CNC-002', equipmentName: 'CNC-002 加工中心', equipmentType: 'CNC', workshopId: 'WS-001', workshopName: '机加工车间', status: 'running', capacity: 100, utilizationRate: 75, currentWorkOrderId: 'WO-005', createdAt: '2025-01-01T00:00:00' },
    ]
    totalCount.value = equipment.value.length
  }
}

// 状态变更时重置到第一页
function onFilterChange() { currentPage.value = 1; loadEquipment() }

function statusLabel(s: string) {
  const map: Record<string, string> = { running: '运行中', idle: '空闲', maintenance: '维护中', fault: '故障', offline: '离线' }
  return map[s] || s
}

function utilClass(rate: number) {
  if (rate >= 80) return 'high'
  if (rate >= 50) return 'mid'
  return 'low'
}

function selectEquipment(id: string) {
  selectedId.value = id
  const eq = equipment.value.find(e => e.id === id)
  if (!eq) return
  selectedEq.value = eq
  activeTab.value = 'overview'
  health.value = null
  maintenanceRecords.value = []
  diagnosis.value = null
}

async function switchTab(tab: string) {
  activeTab.value = tab
  if (!selectedEq.value) return
  if (tab === 'health' && !health.value) await loadHealth(selectedEq.value.id)
  if (tab === 'maintenance') await loadMaintenance(selectedEq.value.id)
}

async function loadHealth(id: string) {
  healthLoading.value = true
  try {
    health.value = await getHealthReport(id)
  } catch {
    health.value = {
      equipmentId: id, equipmentName: selectedEq.value?.equipmentName || '',
      healthScore: 78, healthStatus: 'warning',
      anomalies: [
        { parameterName: '主轴振动', value: 4.8, expectedValue: 3.5, deviation: 37.1, severity: 'warning' },
        { parameterName: '轴承温度', value: 62, expectedValue: 55, deviation: 12.7, severity: 'warning' },
      ],
      predictedFailures: [
        { failureType: '轴承磨损', confidence: 0.72, estimatedTimeToFailure: '2026-06-15T00:00:00', recommendation: '建议在下次保养时检查并更换轴承' },
      ],
      recommendedMaintenanceDate: '2026-06-01T00:00:00',
      maintenanceTasks: [
        { taskName: '主轴校准', description: '检查主轴同心度并校准', estimatedDuration: '2h', requiredParts: [] },
      ],
    }
  } finally {
    healthLoading.value = false
  }
}

async function loadMaintenance(id: string) {
  maintLoading.value = true
  try {
    maintenanceRecords.value = await getMaintenanceHistory(id)
  } catch {
    maintenanceRecords.value = [
      { id: 'MT-001', equipmentId: id, maintenanceType: 'preventive', description: '季度保养：更换润滑油、清洁滤网、检查传动系统', startTime: '2026-04-15T08:00:00', endTime: '2026-04-15T12:00:00', performedBy: '张工', result: 'completed', cost: 3500, sparePartsUsed: ['润滑油 HL-32', '空气滤芯'] },
      { id: 'MT-002', equipmentId: id, maintenanceType: 'preventive', description: '月度检查：电气系统检测、紧固件检查', startTime: '2026-03-20T09:00:00', endTime: '2026-03-20T11:00:00', performedBy: '李工', result: 'completed', cost: 1200, sparePartsUsed: [] },
    ]
  } finally {
    maintLoading.value = false
  }
}

async function runDiagnose() {
  if (!selectedEq.value) return
  diagLoading.value = true
  diagnosis.value = null
  try {
    diagnosis.value = await diagnose(selectedEq.value.id, errorCode.value || undefined)
  } catch {
    diagnosis.value = {
      equipmentId: selectedEq.value.id,
      equipmentName: selectedEq.value.equipmentName,
      errorCode: errorCode.value || 'E-0001',
      mostLikelyCause: '主轴轴承磨损导致加工精度偏差',
      diagnosticBasis: '振动频谱分析显示 2× 倍频分量增大，与轴承磨损特征一致；温度检测显示轴承位温升 7°C',
      suggestedSteps: ['1. 停机并断电挂牌', '2. 拆卸主轴护罩检查轴承外观', '3. 使用千分表测量主轴径向跳动', '4. 如跳动 > 0.02mm 则更换轴承', '5. 重新校准后试切验证'],
      requiredSpareParts: ['轴承 SKF-6205-2RS × 2', '高温润滑脂 500g'],
      estimatedRepairTime: '4 小时',
    }
  } finally {
    diagLoading.value = false
  }
}

onMounted(async () => {
  try {
    const s = await getEquipmentStatistics()
    Object.assign(stats, s)
  } catch {
    Object.assign(stats, { totalCount: 8, runningCount: 4, idleCount: 3, maintenanceCount: 0, faultCount: 1, offlineCount: 0, utilizationRate: 72, availabilityRate: 95 })
  }
  await loadEquipment()
})
</script>

<style scoped>
.equipment-board {
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
  display: flex; align-items: center; gap: 16px;
  background: #fff; padding: 20px; border-radius: 8px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.06);
}
.kpi-icon { width: 48px; height: 48px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 20px; flex-shrink: 0; }
.kpi-body { display: flex; flex-direction: column; }
.kpi-value { font-size: 28px; font-weight: 700; line-height: 1.2; }
.kpi-label { font-size: 13px; color: #888; }

/* Card */
.card { background: #fff; border-radius: 8px; box-shadow: 0 1px 4px rgba(0,0,0,0.06); overflow: hidden; }
.card-header { display: flex; justify-content: space-between; align-items: center; padding: 14px 16px; border-bottom: 1px solid #f5f5f5; }
.card-header h3 { margin: 0; font-size: 15px; }
.card-body { padding: 12px 16px; }

/* Filters */
.eq-filters { display: flex; gap: 8px; }
.filter-select { padding: 4px 8px; border: 1px solid #d9d9d9; border-radius: 4px; font-size: 13px; outline: none; }

/* Equipment Grid */
.eq-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 12px; }
.eq-card {
  padding: 14px; border-radius: 8px; background: #fafafa; border: 2px solid transparent;
  cursor: pointer; transition: all 0.2s;
}
.eq-card:hover { border-color: #e6f7ff; background: #f0f9ff; }
.eq-card.selected { border-color: #1890ff; background: #e6f7ff; }
.eq-top { display: flex; align-items: center; gap: 8px; margin-bottom: 6px; }
.eq-status-dot { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; }
.eq-status-dot.running { background: #52c41a; }
.eq-status-dot.idle { background: #faad14; }
.eq-status-dot.maintenance { background: #1890ff; }
.eq-status-dot.fault { background: #ff4d4f; }
.eq-status-dot.offline { background: #d9d9d9; }
.eq-name { font-weight: 600; font-size: 14px; flex: 1; }
.eq-badge { padding: 1px 6px; border-radius: 3px; font-size: 11px; font-weight: 600; }
.eq-badge.high { background: #fff2f0; color: #ff4d4f; }
.eq-badge.mid { background: #fffbe6; color: #d4b106; }
.eq-badge.low { background: #f6ffed; color: #52c41a; }
.eq-mid { display: flex; gap: 8px; align-items: center; margin-bottom: 8px; }
.eq-code { font-size: 12px; color: #999; }
.eq-type-tag { padding: 1px 6px; background: #e6f7ff; color: #1890ff; border-radius: 3px; font-size: 11px; }
.eq-bar-container { height: 6px; background: #f0f0f0; border-radius: 3px; margin-bottom: 6px; overflow: hidden; }
.eq-bar { height: 100%; border-radius: 3px; transition: width 0.5s; }
.eq-bar.high { background: #ff4d4f; }
.eq-bar.mid { background: #faad14; }
.eq-bar.low { background: #52c41a; }
.eq-bottom { font-size: 12px; color: #999; }

/* Detail Panel */
.detail-panel {
  position: fixed; right: 0; bottom: 0;
  width: 480px; max-width: 100vw; max-height: 80vh;
  background: #fff; border-radius: 12px 12px 0 0;
  box-shadow: 0 -4px 20px rgba(0,0,0,0.15); z-index: 1001;
  display: flex; flex-direction: column; overflow: hidden;
}
.detail-header {
  display: flex; justify-content: space-between; align-items: center;
  padding: 14px 20px; border-bottom: 1px solid #f0f0f0; background: #001529; color: #fff;
}
.detail-header h4 { margin: 0; font-size: 14px; }
.eq-code-sm { font-size: 11px; color: rgba(255,255,255,0.5); }
.detail-header .close-btn { background: none; border: none; color: rgba(255,255,255,0.65); font-size: 18px; cursor: pointer; padding: 4px 8px; border-radius: 4px; }
.detail-header .close-btn:hover { color: #fff; background: rgba(255,255,255,0.1); }

.detail-tabs { display: flex; border-bottom: 1px solid #f0f0f0; }
.detail-tabs button {
  flex: 1; padding: 10px; border: none; background: none; font-size: 13px;
  cursor: pointer; color: #888; border-bottom: 2px solid transparent; transition: all 0.2s;
}
.detail-tabs button.active { color: #1890ff; border-bottom-color: #1890ff; font-weight: 600; }
.detail-tabs button:hover { color: #1890ff; }

.detail-body { flex: 1; overflow-y: auto; padding: 16px 20px; }

/* Overview tab */
.info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.info-item { display: flex; flex-direction: column; }
.info-item label { font-size: 12px; color: #999; margin-bottom: 2px; }
.info-item span { font-size: 14px; font-weight: 500; }
.status-text { padding: 2px 8px; border-radius: 3px; font-size: 13px; font-weight: 600; width: fit-content; }
.status-text.running { background: #f6ffed; color: #52c41a; }
.status-text.idle { background: #fffbe6; color: #d4b106; }
.status-text.maintenance { background: #e6f7ff; color: #1890ff; }
.status-text.fault { background: #fff2f0; color: #ff4d4f; }

/* Health */
.health-score-card {
  text-align: center; padding: 20px; border-radius: 8px; margin-bottom: 16px;
}
.health-score-card.healthy { background: #f6ffed; }
.health-score-card.warning { background: #fffbe6; }
.health-score-card.critical { background: #fff2f0; }
.score-value { font-size: 36px; font-weight: 700; display: block; }
.health-score-card.healthy .score-value { color: #52c41a; }
.health-score-card.warning .score-value { color: #faad14; }
.health-score-card.critical .score-value { color: #ff4d4f; }
.score-label { font-size: 14px; color: #888; }
.score-status { display: block; font-size: 13px; font-weight: 600; margin-top: 4px; }
.health-sub { margin-bottom: 16px; }
.health-sub h5 { margin: 0 0 8px; font-size: 14px; }
.param-item { display: flex; gap: 12px; padding: 8px 10px; border-radius: 4px; margin-bottom: 4px; font-size: 13px; }
.param-item.warning { background: #fffbe6; }
.param-item.critical { background: #fff2f0; }
.param-name { font-weight: 500; flex: 1; }
.param-val { color: #555; }
.param-dev { color: #ff4d4f; font-weight: 600; }
.pred-item { padding: 10px; background: #f5f5f5; border-radius: 6px; margin-bottom: 8px; font-size: 13px; }
.pred-type { font-weight: 600; display: block; margin-bottom: 4px; }
.pred-conf { color: #1890ff; margin-right: 12px; }
.pred-time { color: #888; }
.pred-recommend { margin-top: 4px; color: #52c41a; }

/* Maintenance */
.maint-item { padding: 12px; border: 1px solid #f0f0f0; border-radius: 6px; margin-bottom: 8px; }
.maint-header { display: flex; gap: 8px; align-items: center; margin-bottom: 4px; }
.maint-type-badge { padding: 1px 6px; border-radius: 3px; font-size: 11px; font-weight: 600; }
.maint-type-badge.preventive { background: #e6f7ff; color: #1890ff; }
.maint-type-badge.corrective { background: #fff2f0; color: #ff4d4f; }
.maint-date { font-size: 12px; color: #888; flex: 1; }
.maint-result { font-size: 11px; padding: 1px 6px; border-radius: 3px; }
.maint-result.completed { background: #f6ffed; color: #52c41a; }
.maint-result.failed { background: #fff2f0; color: #ff4d4f; }
.maint-desc { font-size: 13px; margin-bottom: 4px; }
.maint-meta { font-size: 12px; color: #999; display: flex; gap: 16px; margin-bottom: 4px; }
.maint-parts { font-size: 12px; color: #1890ff; }

/* Diagnose */
.diagnose-form { display: flex; gap: 8px; margin-bottom: 16px; }
.diag-input { flex: 1; padding: 8px 12px; border: 1px solid #d9d9d9; border-radius: 6px; font-size: 13px; outline: none; }
.diag-input:focus { border-color: #1890ff; }
.diag-btn { padding: 8px 16px; background: #1890ff; color: #fff; border: none; border-radius: 6px; cursor: pointer; font-size: 13px; }
.diag-btn:hover:not(:disabled) { background: #40a9ff; }
.diag-btn:disabled { background: #d9d9d9; cursor: not-allowed; }
.diag-result { }
.diag-cause { padding: 10px 12px; background: #fff2f0; border-radius: 6px; font-size: 13px; margin-bottom: 12px; }
.diag-basis { padding: 10px 12px; background: #f5f5f5; border-radius: 6px; font-size: 13px; margin-bottom: 12px; }
.diag-section { margin-bottom: 12px; }
.diag-section h5 { margin: 0 0 6px; font-size: 14px; }
.diag-section ol, .diag-section ul { margin: 0; padding-left: 20px; }
.diag-section li { font-size: 13px; margin-bottom: 4px; }
.diag-repair { padding: 10px; background: #e6f7ff; border-radius: 6px; font-size: 13px; }

.loading-state { text-align: center; padding: 40px; color: #999; }
.empty-state { text-align: center; color: #ccc; padding: 24px; font-size: 14px; }

.pagination-bar {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 8px 12px;
  border-top: 1px solid #f0f0f0;
  flex-wrap: wrap;
}
.page-btn {
  min-width: 28px;
  height: 28px;
  padding: 0 6px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  background: #fff;
  font-size: 12px;
  cursor: pointer;
  color: #333;
  transition: all 0.15s;
}
.page-btn:hover:not(:disabled) { border-color: #1890ff; color: #1890ff; }
.page-btn:disabled { cursor: not-allowed; opacity: 0.5; }
.page-btn.active { background: #1890ff; color: #fff; border-color: #1890ff; }
.page-ellipsis { padding: 0 4px; color: #999; font-size: 12px; }
.page-info { margin-left: auto; font-size: 11px; color: #999; white-space: nowrap; }


.slide-up-enter-active { transition: all 0.25s ease-out; }
.slide-up-leave-active { transition: all 0.2s ease-in; }
.slide-up-enter-from, .slide-up-leave-to { transform: translateY(100%); opacity: 0; }
</style>
