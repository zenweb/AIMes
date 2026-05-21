<template>
  <div class="production-board">
      <!-- 产量摘要 -->
      <div class="summary-bar">
        <div class="summary-item">
          <span class="summary-value">{{ summary.total }}</span>
          <span class="summary-label">总工单</span>
        </div>
        <div class="summary-divider"></div>
        <div class="summary-item">
          <span class="summary-value in-progress">{{ summary.inProgress }}</span>
          <span class="summary-label">生产中</span>
        </div>
        <div class="summary-divider"></div>
        <div class="summary-item">
          <span class="summary-value done">{{ summary.completed }}</span>
          <span class="summary-label">已完成</span>
        </div>
        <div class="summary-divider"></div>
        <div class="summary-item">
          <span class="summary-value pending">{{ summary.pending }}</span>
          <span class="summary-label">待生产</span>
        </div>
        <div class="summary-divider"></div>
        <div class="summary-item">
          <span class="summary-value">{{ summary.completedQty }}</span>
          <span class="summary-label">完成数</span>
        </div>
        <div class="summary-divider"></div>
        <div class="summary-item">
          <span class="summary-value otd">{{ summary.otd }}%</span>
          <span class="summary-label">准时率</span>
        </div>
      </div>

      <!-- 顶部操作栏 -->
      <div class="action-bar">
        <div class="scan-input-group">
          <input v-model="scanCode" class="scan-input" placeholder="扫码或输入工单号/工序码" @keydown.enter="handleScan" />
          <button class="scan-btn" @click="handleScan" :disabled="!scanCode.trim()">查询</button>
        </div>
        <div class="action-filters">
          <select v-model="statusFilter" class="filter-select">
            <option value="">全部状态</option>
            <option value="pending">待生产</option>
            <option value="in_progress">生产中</option>
            <option value="completed">已完成</option>
            <option value="paused">已暂停</option>
          </select>
        </div>
      </div>

      <div class="board-body">
        <!-- 左侧工单列表 -->
        <div class="wo-list-panel">
          <div class="panel-header">
            <h3>工单列表</h3>
            <span class="panel-count">{{ totalCount || workOrders.length }}</span>
          </div>
          <div class="wo-list">
            <div
              v-for="wo in filteredWorkOrders"
              :key="wo.id"
              class="wo-card"
              :class="{ selected: selectedWo?.id === wo.id, [wo.status]: true }"
              @click="selectWorkOrder(wo)"
            >
              <div class="wo-top">
                <span class="wo-number">{{ wo.orderNumber }}</span>
                <span class="wo-badge" :class="wo.status">{{ statusLabel(wo.status) }}</span>
              </div>
              <div class="wo-product">{{ wo.productName }}</div>
              <div class="wo-progress-row">
                <div class="wo-progress-bar">
                  <div class="wo-progress-fill" :style="{ width: wo.progressPercentage + '%' }" :class="progressClass(wo.progressPercentage)"></div>
                </div>
                <span class="wo-progress-text">{{ wo.progressPercentage }}%</span>
              </div>
              <div class="wo-meta">
                <span>计划 {{ wo.plannedQuantity }}</span>
                <span>完成 {{ wo.completedQuantity }}</span>
              </div>
            </div>
          </div>
          <!-- 分页 -->
          <div class="pagination-bar" v-if="totalPages > 1">
            <button class="page-btn" :disabled="currentPage <= 1" @click="goToPage(currentPage - 1)">上一页</button>
            <template v-for="p in displayedPages" :key="p">
              <span v-if="p === '...'" class="page-ellipsis">...</span>
              <button v-else class="page-btn" :class="{ active: p === currentPage }" @click="goToPage(p)">{{ p }}</button>
            </template>
            <button class="page-btn" :disabled="currentPage >= totalPages" @click="goToPage(currentPage + 1)">下一页</button>
            <span class="page-info">{{ currentPage }} / {{ totalPages }} 页（共 {{ totalCount }} 条）</span>
          </div>
          <div v-if="!filteredWorkOrders.length" class="empty-state">暂无工单</div>
        </div>

        <!-- 右侧详情 + 操作 -->
        <div class="wo-detail-panel">
          <div v-if="!selectedWo" class="detail-empty">
            <div class="empty-icon">📋</div>
            <p>选择工单或扫码开始</p>
          </div>

          <template v-else>
            <!-- 工单头部信息 -->
            <div class="detail-header">
              <div class="detail-title-row">
                <h3>{{ selectedWo.orderNumber }}</h3>
                <span class="wo-badge large" :class="selectedWo.status">{{ statusLabel(selectedWo.status) }}</span>
              </div>
              <div class="detail-info-grid">
                <div class="di"><label>产品</label><span>{{ selectedWo.productName }}</span></div>
                <div class="di"><label>产品编码</label><span>{{ selectedWo.productCode }}</span></div>
                <div class="di"><label>计划数量</label><span>{{ selectedWo.plannedQuantity }}</span></div>
                <div class="di"><label>完成数量</label><span class="green">{{ selectedWo.completedQuantity }}</span></div>
                <div class="di"><label>计划开始</label><span>{{ formatDate(selectedWo.plannedStartDate) }}</span></div>
                <div class="di"><label>计划结束</label><span>{{ formatDate(selectedWo.plannedEndDate) }}</span></div>
              </div>
              <div class="detail-progress">
                <div class="detail-progress-bar">
                  <div class="detail-progress-fill" :style="{ width: selectedWo.progressPercentage + '%' }" :class="progressClass(selectedWo.progressPercentage)"></div>
                </div>
                <span class="detail-progress-text">进度 {{ selectedWo.progressPercentage }}%</span>
              </div>
            </div>

            <section v-if="barcodeProductionContext" class="barcode-start-context" :class="{ synced: barcodeStartEvidenceTraceId || barcodeCompletionEvidenceTraceId || barcodeAnomalyEvidenceTraceId || barcodeQualityGateTraceId || barcodeHandoffTraceId || barcodeReworkEvidenceTraceId || barcodeHandoffFreezeTraceId || barcodeCapaEvidenceTraceId || barcodeIsolationEvidenceTraceId || barcodeReworkCostTraceId || barcodeLabelStatusTraceId }" aria-label="扫码开工上下文">
              <div class="barcode-context-heading">
                <div>
                  <span>扫码流转卡</span>
                  <h4>{{ barcodeProductionContext.sourceTitle }}</h4>
                </div>
                <em>{{ barcodeProductionContext.sourceLabel }}</em>
              </div>
              <div class="barcode-context-grid">
                <div>
                  <label>扫码追踪</label>
                  <strong>{{ barcodeProductionContext.scanTraceId }}</strong>
                </div>
                <div>
                  <label>目标工序</label>
                  <strong>{{ barcodeProductionContext.operationCode }} · {{ barcodeProductionContext.operationName }}</strong>
                </div>
                <div>
                  <label>推荐设备</label>
                  <strong>{{ barcodeProductionContext.equipmentId }}</strong>
                </div>
                <div>
                  <label>推荐人员</label>
                  <strong>{{ barcodeProductionContext.operatorLabel }}</strong>
                </div>
              </div>
              <p>
                下一核对点：{{ barcodeProductionContext.nextCheck }}。现场扫码动作会把开工、完工、物料批次和异常分流写入同一条 OTD 复盘证据链。
              </p>
              <div class="barcode-context-actions">
                <button v-if="barcodeContextOperation?.status === 'pending'" type="button" @click="openBarcodeStartDialog">按扫码上下文开工</button>
                <button v-if="barcodeContextOperation?.status === 'in_progress'" type="button" class="secondary" @click="openBarcodeCompleteDialog">扫码完工报数</button>
                <button v-if="barcodeContextOperation?.status === 'in_progress'" type="button" class="danger" @click="openBarcodeExceptionDialog">扫码异常上报</button>
                <span v-if="barcodeStartEvidenceTraceId">{{ barcodeStartEvidenceTraceId }} 已写入生产开工证据</span>
              </div>
              <div v-if="barcodeCompletionEvidenceTraceId || barcodeMaterialEvidenceTraceId || barcodeAnomalyEvidenceTraceId || barcodeQualityGateTraceId || barcodeHandoffTraceId || barcodeReworkEvidenceTraceId || barcodeHandoffFreezeTraceId || barcodeCapaEvidenceTraceId || barcodeIsolationEvidenceTraceId || barcodeReworkCostTraceId || barcodeLabelStatusTraceId" class="barcode-context-evidence">
                <span v-if="barcodeCompletionEvidenceTraceId">{{ barcodeCompletionEvidenceTraceId }} 已写入扫码完工证据</span>
                <span v-if="barcodeMaterialEvidenceTraceId">{{ barcodeMaterialEvidenceTraceId }} 已写入物料批次消耗</span>
                <span v-if="barcodeQualityGateTraceId">{{ barcodeQualityGateTraceId }} 已触发首件巡检质量门</span>
                <span v-if="barcodeHandoffTraceId">{{ barcodeHandoffTraceId }} 已生成下道工序交接</span>
                <span v-if="barcodeReworkEvidenceTraceId">{{ barcodeReworkEvidenceTraceId }} 已生成质量返工证据</span>
                <span v-if="barcodeHandoffFreezeTraceId">{{ barcodeHandoffFreezeTraceId }} 已冻结下道交接</span>
                <span v-if="barcodeCapaEvidenceTraceId">{{ barcodeCapaEvidenceTraceId }} 已生成扫码 CAPA 处置</span>
                <span v-if="barcodeIsolationEvidenceTraceId">{{ barcodeIsolationEvidenceTraceId }} 已生成批次隔离</span>
                <span v-if="barcodeReworkCostTraceId">{{ barcodeReworkCostTraceId }} 已估算返工工时成本</span>
                <span v-if="barcodeLabelStatusTraceId">{{ barcodeLabelStatusTraceId }} 已更新实物标签状态</span>
                <span v-if="barcodeAnomalyEvidenceTraceId">{{ barcodeAnomalyEvidenceTraceId }} 已写入扫码异常分流</span>
              </div>
            </section>

            <ProductionExecutionTracePanel :traces="executionTraces" />

            <!-- 工序列表 (模拟) -->
            <div class="operations-section">
              <h4>工序</h4>
              <div class="op-list">
                <div v-for="op in currentOperations" :key="op.operationId" class="op-card" :class="op.status">
                  <div class="op-header">
                    <span class="op-code">{{ op.operationCode }}</span>
                    <span class="op-name">{{ op.operationName }}</span>
                    <span class="op-badge" :class="op.status">{{ statusLabel(op.status) }}</span>
                  </div>
                  <div class="op-meta">
                    <span>计划 {{ op.plannedQuantity }}</span>
                    <span>完成 {{ op.completedQuantity }}</span>
                  </div>
                  <div class="op-constraints">
                    <span v-for="item in operationConstraints(op)" :key="item">{{ item }}</span>
                  </div>
                  <div class="op-actions">
                    <button v-if="op.status === 'pending'" class="op-btn start" @click="startOp(op)">开工</button>
                    <button v-if="op.status === 'in_progress'" class="op-btn complete" @click="showCompleteDialog(op)">完工</button>
                    <button v-if="op.status === 'in_progress'" class="op-btn exception" @click="showExceptionDialog(op)">异常</button>
                  </div>
                </div>
              </div>
            </div>
          </template>
        </div>
      </div>

      <!-- 开工对话框 -->
      <Transition name="fade">
        <div v-if="dialog.type === 'start'" class="dialog-overlay" @click.self="dialog.type = ''">
          <div class="dialog-card">
            <h4>开工确认</h4>
            <p class="dialog-op-name">{{ dialog.op?.operationName }}</p>
            <div class="dialog-form">
              <StartQualificationPanel :check="startQualificationCheck" />
              <div v-if="dialogBarcodeContext" class="barcode-dialog-evidence">
                <label>扫码证据</label>
                <strong>{{ dialogBarcodeContext.scanTraceId }}</strong>
                <p>开工将绑定 {{ dialogBarcodeContext.code }}、{{ dialogBarcodeContext.operationCode }}、{{ dialogBarcodeContext.equipmentId }} 和 {{ dialogBarcodeContext.operatorLabel }}，生成 {{ dialogBarcodeContext.integratedTraceId }}。</p>
              </div>
              <div class="form-row">
                <label>工位</label>
                <input v-model="dialog.stationId" placeholder="例如: ST-001" />
              </div>
              <div class="form-row">
                <label>设备</label>
                <input v-model="dialog.equipmentId" placeholder="例如: EQ-001" />
              </div>
            </div>
            <div class="dialog-actions">
              <button class="dialog-cancel" @click="dialog.type = ''">取消</button>
              <button class="dialog-confirm" @click="confirmStart" :disabled="isStartConfirmationDisabled">确认开工</button>
            </div>
          </div>
        </div>
      </Transition>

      <!-- 完工对话框 -->
      <Transition name="fade">
        <div v-if="dialog.type === 'complete'" class="dialog-overlay" @click.self="dialog.type = ''">
          <div class="dialog-card">
            <h4>完工报告</h4>
            <p class="dialog-op-name">{{ dialog.op?.operationName }}</p>
            <div class="dialog-form">
              <div v-if="dialogBarcodeContext" class="barcode-dialog-evidence">
                <label>扫码证据</label>
                <strong>{{ dialogBarcodeContext.integratedTraceId }}</strong>
                <p>完工将绑定 {{ dialogBarcodeContext.code }}、{{ dialogBarcodeContext.operationCode }}、{{ dialogBarcodeContext.equipmentId }}、{{ dialogBarcodeContext.operatorLabel }} 和物料批次 AL-202605。</p>
              </div>
              <div class="form-row">
                <label>完成数量</label>
                <input v-model.number="dialog.quantity" type="number" min="0" placeholder="合格品数量" />
              </div>
              <div class="form-row">
                <label>不良数量</label>
                <input v-model.number="dialog.defectQty" type="number" min="0" placeholder="不良品数量" />
              </div>
              <div class="form-row">
                <label>质检结果</label>
                <select v-model="dialog.inspectionResult">
                  <option value="Pass">合格</option>
                  <option value="Fail">不合格</option>
                  <option value="Rework">返工</option>
                </select>
              </div>
            </div>
            <div class="dialog-actions">
              <button class="dialog-cancel" @click="dialog.type = ''">取消</button>
              <button class="dialog-confirm" @click="confirmComplete" :disabled="!dialog.quantity">确认完工</button>
            </div>
          </div>
        </div>
      </Transition>

      <!-- 异常对话框 -->
      <Transition name="fade">
        <div v-if="dialog.type === 'exception'" class="dialog-overlay" @click.self="dialog.type = ''">
          <div class="dialog-card">
            <h4>异常上报</h4>
            <p class="dialog-op-name">{{ dialog.op?.operationName }}</p>
            <div class="dialog-form">
              <div v-if="dialogBarcodeContext" class="barcode-dialog-evidence">
                <label>扫码证据</label>
                <strong>{{ dialogBarcodeContext.integratedTraceId }}</strong>
                <p>异常将绑定 {{ dialogBarcodeContext.code }}、{{ dialogBarcodeContext.operationCode }}、{{ dialogBarcodeContext.equipmentId }} 和现场扫码流转卡，进入异常管理与风险处置队列。</p>
              </div>
              <div class="form-row">
                <label>异常原因</label>
                <textarea v-model="dialog.reason" rows="3" placeholder="描述异常情况..." />
              </div>
            </div>
            <div class="dialog-actions">
              <button class="dialog-cancel" @click="dialog.type = ''">取消</button>
              <button class="dialog-confirm danger" @click="confirmException" :disabled="!dialog.reason.trim()">上报异常</button>
            </div>
          </div>
        </div>
      </Transition>

      <!-- 通知 -->
      <Transition name="fade">
        <div v-if="notification.show" class="notification" :class="notification.type">{{ notification.message }}</div>
      </Transition>
    </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuth } from '../../stores/auth'
import { getWorkOrders, scanOperation, startOperation, completeOperation, reportException } from '../../api/production'
import type { WorkOrderDto, OperationInfoDto } from '../../types/production'
import { formatDate } from '../../utils/date'
import ProductionExecutionTracePanel, {
  type ProductionExecutionTrace,
} from './ProductionExecutionTracePanel.vue'
import StartQualificationPanel, {
  type StartQualificationCheck,
} from './StartQualificationPanel.vue'
import { writeProductionAnomalyEvent } from '../../utils/production-anomaly-sync'
import { upsertOtdEvidenceChainRecord } from '../../utils/otd-evidence-chain-sync'
import {
  readLaborQualificationBlockForOperation,
  readLaborReassignmentForOperation,
  writeLaborReassignmentExecutionEvidence,
} from '../../utils/labor-assignment-sync'
import {
  readBarcodeScanEvidenceRecords,
  type BarcodeScanEvidenceRecord,
} from '../../utils/barcode-scan-evidence-sync'

const router = useRouter()
const route = useRoute()
const { user } = useAuth()

interface BarcodeProductionContext {
  code: string
  scanTraceId: string
  sourceTitle: string
  sourceLabel: string
  nextCheck: string
  operationCode: string
  operationName: string
  stationId: string
  equipmentId: string
  operatorLabel: string
  actor: string
  integratedTraceId: string
  confirmed: boolean
}

const scanCode = ref('')
const statusFilter = ref('')
const workOrders = ref<WorkOrderDto[]>([])
const selectedWo = ref<WorkOrderDto | null>(null)
const currentOperations = ref<OperationInfoDto[]>([])
const executionTraces = ref<ProductionExecutionTrace[]>([])
const barcodeProductionContext = ref<BarcodeProductionContext | null>(null)
const barcodeStartEvidenceTraceId = ref('')
const barcodeCompletionEvidenceTraceId = ref('')
const barcodeMaterialEvidenceTraceId = ref('')
const barcodeAnomalyEvidenceTraceId = ref('')
const barcodeQualityGateTraceId = ref('')
const barcodeHandoffTraceId = ref('')
const barcodeReworkEvidenceTraceId = ref('')
const barcodeHandoffFreezeTraceId = ref('')
const barcodeCapaEvidenceTraceId = ref('')
const barcodeIsolationEvidenceTraceId = ref('')
const barcodeReworkCostTraceId = ref('')
const barcodeLabelStatusTraceId = ref('')
const startQualificationCheck = ref<StartQualificationCheck>({
  status: 'pass',
  statusLabel: '校验通过',
  operatorName: '张三',
  employeeNumber: 'EMP-001',
  team: '甲班',
  shift: '白班',
  requiredSkill: 'CNC 精加工',
  certificationName: 'CNC-2 级',
  expiresAt: '2026-12-31',
  requiredEquipment: 'CNC-002 可用，CNC-001 禁止派工',
  materialKitting: 'M-AL-6061 已齐套，批次 AL-202605',
  sopDocument: 'CNC 精加工 SOP V2.3',
  qualityGate: '首件尺寸复检 + Ra 粗糙度抽检',
  gates: [
    { label: '人员资质', result: '通过', status: 'pass' },
    { label: '设备状态', result: '通过', status: 'pass' },
    { label: '物料齐套', result: '通过', status: 'pass' },
    { label: '上道工序', result: '已完成', status: 'pass' },
  ],
  note: '人员技能、设备能力、物料齐套、SOP 版本和首件质检点均满足当前工序开工要求。',
})

// 分页状态
const currentPage = ref(1)
const pageSize = 20
const totalCount = ref(0)
const totalPages = computed(() => Math.max(1, Math.ceil(totalCount.value / pageSize)))

// 显示的页码（带省略号）
const displayedPages = computed<(number | '...')[]>(() => {
  const tp = totalPages.value
  const cur = currentPage.value
  if (tp <= 7) return Array.from({ length: tp }, (_, i) => i + 1)
  const pages: (number | '...')[] = [1]
  if (cur > 3) pages.push('...')
  const start = Math.max(2, cur - 1)
  const end = Math.min(tp - 1, cur + 1)
  for (let i = start; i <= end; i++) pages.push(i)
  if (cur < tp - 2) pages.push('...')
  if (tp > 1) pages.push(tp)
  return pages
})

const dialog = reactive({
  type: '' as 'start' | 'complete' | 'exception' | '',
  op: null as OperationInfoDto | null,
  stationId: '',
  equipmentId: '',
  quantity: 0,
  defectQty: 0,
  inspectionResult: 'Pass',
  reason: '',
})

const isStartConfirmationDisabled = computed(() =>
  !dialog.stationId || startQualificationCheck.value.status === 'blocked'
)

const dialogBarcodeContext = computed(() => {
  if (!dialog.op || !barcodeProductionContext.value) return null
  return barcodeProductionContext.value.code === dialog.op.workOrderNumber.toUpperCase()
    && barcodeProductionContext.value.operationCode === dialog.op.operationCode
    ? barcodeProductionContext.value
    : null
})

const barcodeContextOperation = computed(() => {
  const context = barcodeProductionContext.value
  if (!context) return null
  return currentOperations.value.find(
    op => op.workOrderNumber.toUpperCase() === context.code && op.operationCode === context.operationCode
  ) ?? null
})

const notification = reactive({ show: false, type: 'success' as string, message: '', timer: null as any })

const workforce = [
  {
    employeeNumber: 'EMP-001',
    name: '张三',
    team: '甲班',
    shift: '白班',
    skills: ['CNC 精加工', '首件自检'],
    certificationName: 'CNC-2 级',
    expiresAt: '2026-12-31',
  },
  {
    employeeNumber: 'EMP-002',
    name: '李四',
    team: '甲班',
    shift: '白班',
    skills: ['装配', '扭矩复检'],
    certificationName: '装配资质',
    expiresAt: '2026-11-30',
  },
  {
    employeeNumber: 'EMP-003',
    name: '王五',
    team: '乙班',
    shift: '夜班',
    skills: ['热处理', '炉温曲线确认'],
    certificationName: '热处理上岗证',
    expiresAt: '2026-05-25',
  },
]

const filteredWorkOrders = computed(() => {
  if (!statusFilter.value) return workOrders.value
  return workOrders.value.filter(wo => wo.status === statusFilter.value)
})

// 产量摘要统计
const summary = computed(() => {
  const all = workOrders.value
  const total = all.length
  const inProgress = all.filter(w => w.status === 'in_progress').length
  const completed = all.filter(w => w.status === 'completed').length
  const pending = all.filter(w => w.status === 'pending' || w.status === 'paused').length
  const completedQty = all.reduce((s, w) => s + (w.completedQuantity || 0), 0)
  const onTime = all.filter(w => w.status === 'completed' && w.actualEndDate && w.plannedEndDate
    ? new Date(w.actualEndDate) <= new Date(w.plannedEndDate) : false).length
  const otd = completed > 0 ? Math.round(onTime / completed * 100) : 0
  return { total, inProgress, completed, pending, completedQty, otd }
})

// 分页切换
function goToPage(page: number) {
  if (page < 1 || page > totalPages.value) return
  currentPage.value = page
  loadWorkOrders()
}

// 监听状态筛选变更，重置到第一页
watch(statusFilter, () => {
  currentPage.value = 1
  loadWorkOrders()
})

function statusLabel(s: string) {
  const map: Record<string, string> = {
    pending: '待生产', in_progress: '生产中', completed: '已完成',
    paused: '已暂停', cancelled: '已取消',
    idle: '空闲', running: '运行中',
  }
  return map[s] || s
}

function progressClass(pct: number) {
  if (pct >= 100) return 'done'
  if (pct >= 60) return 'mid'
  return 'low'
}

function notify(msg: string, type = 'success') {
  notification.show = true
  notification.message = msg
  notification.type = type
  if (notification.timer) clearTimeout(notification.timer)
  notification.timer = setTimeout(() => { notification.show = false }, 3000)
}

function formatTraceTime() {
  return new Date().toLocaleString('zh-CN', { hour12: false })
}

function prependTrace(trace: Omit<ProductionExecutionTrace, 'id' | 'createdAt'>) {
  executionTraces.value = [
    {
      ...trace,
      id: `trace-${Date.now()}-${executionTraces.value.length}`,
      createdAt: formatTraceTime(),
    },
    ...executionTraces.value,
  ].slice(0, 5)
}

function normalizeBarcodeCode(value: unknown) {
  const raw = Array.isArray(value) ? value[0] : value
  return typeof raw === 'string' ? raw.trim().toUpperCase() : ''
}

function barcodeTracePart(code: string) {
  return code.trim().toUpperCase().replace(/[^A-Z0-9]+/g, '-').replace(/^-|-$/g, '')
}

function barcodeStartTraceId(evidence: BarcodeScanEvidenceRecord | null, code: string, operationCode: string) {
  if (evidence?.traceId.endsWith('-ARRIVAL')) {
    return evidence.traceId.replace(/-ARRIVAL$/, `-${operationCode}-START`)
  }
  return `TRACE-QR-${barcodeTracePart(code)}-${operationCode}-START`
}

function barcodeOperationTraceId(context: BarcodeProductionContext, suffix: string) {
  return context.integratedTraceId.endsWith('-START')
    ? context.integratedTraceId.replace(/-START$/, `-${suffix}`)
    : `${context.integratedTraceId}-${suffix}`
}

function recommendedExecutionDefaults(op: OperationInfoDto) {
  if (isHeatTreatmentOperation(op)) {
    return { stationId: 'ST-HT-01', equipmentId: 'HT-001' }
  }
  if (op.operationName.includes('装配')) {
    return { stationId: 'ST-ASM-01', equipmentId: 'ASM-001' }
  }
  if (op.operationName.includes('CNC')) {
    return { stationId: 'ST-CNC-02', equipmentId: 'CNC-002' }
  }
  return { stationId: 'ST-001', equipmentId: 'EQ-001' }
}

function findBarcodeEvidence(code: string) {
  return readBarcodeScanEvidenceRecords().find(
    record => record.type === 'WorkOrder' && record.code === code
  ) ?? null
}

function pickStartOperation() {
  return currentOperations.value.find(op => op.status === 'pending')
    ?? currentOperations.value.find(op => op.status === 'in_progress')
    ?? currentOperations.value[0]
    ?? null
}

function buildBarcodeProductionContext(code: string) {
  const op = pickStartOperation()
  if (!op) {
    barcodeProductionContext.value = null
    return
  }
  const evidence = findBarcodeEvidence(code)
  const check = buildQualificationCheck(op)
  const defaults = recommendedExecutionDefaults(op)
  barcodeProductionContext.value = {
    code,
    scanTraceId: evidence?.traceId ?? `TRACE-QR-${barcodeTracePart(code)}-ARRIVAL`,
    sourceTitle: evidence?.title ?? `${code} 工单扫码上下文`,
    sourceLabel: evidence?.statusLabel ?? '扫码上下文待确认',
    nextCheck: evidence?.nextCheck ?? '生产报工开工校验',
    operationCode: op.operationCode,
    operationName: op.operationName,
    stationId: defaults.stationId,
    equipmentId: defaults.equipmentId,
    operatorLabel: `${check.operatorName} · ${check.employeeNumber}`,
    actor: evidence?.actor ?? user.value?.username ?? 'operator',
    integratedTraceId: barcodeStartTraceId(evidence, code, op.operationCode),
    confirmed: !!evidence,
  }
  barcodeStartEvidenceTraceId.value = ''
  barcodeCompletionEvidenceTraceId.value = ''
  barcodeMaterialEvidenceTraceId.value = ''
  barcodeAnomalyEvidenceTraceId.value = ''
  barcodeQualityGateTraceId.value = ''
  barcodeHandoffTraceId.value = ''
  barcodeReworkEvidenceTraceId.value = ''
  barcodeHandoffFreezeTraceId.value = ''
  barcodeCapaEvidenceTraceId.value = ''
  barcodeIsolationEvidenceTraceId.value = ''
  barcodeReworkCostTraceId.value = ''
  barcodeLabelStatusTraceId.value = ''
}

function getBarcodeStartContextForOperation(op: OperationInfoDto) {
  const context = barcodeProductionContext.value
  if (!context) return null
  return context.code === op.workOrderNumber.toUpperCase() && context.operationCode === op.operationCode
    ? context
    : null
}

async function openBarcodeStartDialog() {
  if (!barcodeProductionContext.value) return
  const op = currentOperations.value.find(
    item => item.operationCode === barcodeProductionContext.value?.operationCode
  )
  if (!op || op.status !== 'pending') {
    notify('扫码上下文对应工序当前不可开工', 'error')
    return
  }
  await startOp(op)
  dialog.stationId = barcodeProductionContext.value.stationId
  dialog.equipmentId = barcodeProductionContext.value.equipmentId
}

function getBarcodeOperationForAction(requiredStatus: 'pending' | 'in_progress') {
  const op = barcodeContextOperation.value
  if (!op || op.status !== requiredStatus) return null
  return op
}

function openBarcodeCompleteDialog() {
  const op = getBarcodeOperationForAction('in_progress')
  if (!op) {
    notify('扫码上下文对应工序当前不可完工', 'error')
    return
  }
  showCompleteDialog(op)
}

function openBarcodeExceptionDialog() {
  const op = getBarcodeOperationForAction('in_progress')
  if (!op) {
    notify('扫码上下文对应工序当前不可上报异常', 'error')
    return
  }
  showExceptionDialog(op)
  dialog.reason = '扫码流转卡异常：AL-202605 批次首件尺寸复核偏差，需暂停并复核物料批次。'
}

function writeBarcodeStartEvidence(op: OperationInfoDto, context: BarcodeProductionContext) {
  const createdAt = new Date().toISOString()
  upsertOtdEvidenceChainRecord({
    id: `barcode-start-${context.code}-${op.operationCode}`,
    stage: '生产开工',
    title: `${op.workOrderNumber} ${op.operationName} 扫码开工已确认`,
    summary: `扫码追踪 ${context.scanTraceId} 完成下一核对点：${context.nextCheck}；${context.operatorLabel} 在 ${dialog.stationId} 使用 ${dialog.equipmentId || context.equipmentId} 开工，SOP、质检点和物料齐套已随开工校验归档。`,
    object: op.workOrderNumber,
    source: `生产报工 / 条码流转卡 / ${user.value?.username ?? context.actor}`,
    traceId: context.integratedTraceId,
    status: 'active',
    statusLabel: '扫码开工已确认',
    createdAt,
  })
  barcodeStartEvidenceTraceId.value = context.integratedTraceId
  barcodeProductionContext.value = {
    ...context,
    sourceLabel: '扫码开工已确认',
  }
  return context.integratedTraceId
}

function writeBarcodeCompletionEvidence(op: OperationInfoDto, context: BarcodeProductionContext, onTime: boolean) {
  const createdAt = new Date().toISOString()
  const completeTraceId = barcodeOperationTraceId(context, 'COMPLETE')
  const materialTraceId = barcodeOperationTraceId(context, 'MATERIAL')
  upsertOtdEvidenceChainRecord({
    id: `barcode-complete-${context.code}-${op.operationCode}`,
    stage: '扫码完工',
    title: `${op.workOrderNumber} ${op.operationName} 扫码完工报数`,
    summary: `扫码开工证据 ${context.integratedTraceId} 已闭环到完工报数：合格 ${dialog.quantity} 件，不良 ${dialog.defectQty} 件，质检结果 ${dialog.inspectionResult}。`,
    object: op.workOrderNumber,
    source: `生产报工 / 条码流转卡 / ${user.value?.username ?? context.actor}`,
    traceId: completeTraceId,
    status: onTime ? 'closed' : 'active',
    statusLabel: onTime ? '扫码完工 OTD 达成' : '扫码完工 OTD 风险',
    createdAt,
  })
  upsertOtdEvidenceChainRecord({
    id: `barcode-material-${context.code}-${op.operationCode}`,
    stage: '物料消耗',
    title: `${op.workOrderNumber} ${op.operationName} 物料批次消耗`,
    summary: `扫码流转卡确认 M-AL-6061 / 批次 AL-202605 已按 ${op.operationName} 消耗 ${dialog.quantity} 件，BOM 用量、齐套状态和质量追溯已绑定到完工记录。`,
    object: 'M-AL-6061 / AL-202605',
    source: `生产报工 / 条码流转卡 / ${op.workOrderNumber}`,
    traceId: materialTraceId,
    status: 'closed',
    statusLabel: '批次消耗已追溯',
    createdAt,
  })
  barcodeCompletionEvidenceTraceId.value = completeTraceId
  barcodeMaterialEvidenceTraceId.value = materialTraceId
  barcodeProductionContext.value = {
    ...context,
    sourceLabel: onTime ? '扫码完工 OTD 达成' : '扫码完工 OTD 风险',
  }
  return { completeTraceId, materialTraceId }
}

function findNextBarcodeOperation(op: OperationInfoDto) {
  const sameWorkOrderOps = currentOperations.value.filter(item => item.workOrderNumber === op.workOrderNumber)
  const index = sameWorkOrderOps.findIndex(item => item.operationId === op.operationId)
  return index >= 0 ? sameWorkOrderOps[index + 1] ?? null : null
}

function writeBarcodeQualityGateEvidence(op: OperationInfoDto, context: BarcodeProductionContext, onTime: boolean) {
  const qualityTraceId = barcodeOperationTraceId(context, 'QUALITY')
  const passed = dialog.inspectionResult === 'Pass' && dialog.defectQty === 0
  upsertOtdEvidenceChainRecord({
    id: `barcode-quality-${context.code}-${op.operationCode}`,
    stage: '质量门',
    title: `${op.workOrderNumber} ${op.operationName} ${passed ? '首件巡检放行' : '首件巡检待复核'}`,
    summary: `扫码完工证据 ${barcodeOperationTraceId(context, 'COMPLETE')} 已触发首件尺寸复检与 Ra 粗糙度抽检；合格 ${dialog.quantity} 件，不良 ${dialog.defectQty} 件，检验结论 ${dialog.inspectionResult}。`,
    object: `${op.workOrderNumber} / ${op.operationCode}`,
    source: `生产报工 / 质量门 / ${context.operatorLabel}`,
    traceId: qualityTraceId,
    status: passed ? 'closed' : 'active',
    statusLabel: passed ? '首件巡检已放行' : '质量门待复核',
    createdAt: new Date().toISOString(),
  })
  barcodeQualityGateTraceId.value = qualityTraceId
  barcodeProductionContext.value = {
    ...context,
    sourceLabel: passed && onTime ? '质量门已放行' : '质量门待复核',
  }
  return { qualityTraceId, passed }
}

function writeBarcodeHandoffEvidence(op: OperationInfoDto, context: BarcodeProductionContext, nextOp: OperationInfoDto | null) {
  if (!nextOp) return null
  const handoffTraceId = `${barcodeOperationTraceId(context, 'HANDOFF')}-${nextOp.operationCode}`
  upsertOtdEvidenceChainRecord({
    id: `barcode-handoff-${context.code}-${op.operationCode}-${nextOp.operationCode}`,
    stage: '工序交接',
    title: `${op.workOrderNumber} ${op.operationCode} 到 ${nextOp.operationCode} 扫码交接`,
    summary: `${op.operationName} 已完成扫码完工、物料批次消耗和首件巡检质量门，${nextOp.operationCode} ${nextOp.operationName} 接收 ${dialog.quantity} 件待开工，交接依据为 ${barcodeOperationTraceId(context, 'QUALITY')}。`,
    object: op.workOrderNumber,
    source: `生产报工 / 工序交接 / ${context.equipmentId}`,
    traceId: handoffTraceId,
    status: 'ready',
    statusLabel: `${nextOp.operationCode} 待接收开工`,
    createdAt: new Date().toISOString(),
  })
  barcodeHandoffTraceId.value = handoffTraceId
  return { handoffTraceId, nextOperationCode: nextOp.operationCode, nextOperationName: nextOp.operationName }
}

function writeBarcodeNonconformanceEvidence(op: OperationInfoDto, context: BarcodeProductionContext, nextOp: OperationInfoDto | null) {
  const createdAt = new Date().toISOString()
  const reworkTraceId = barcodeOperationTraceId(context, 'REWORK')
  const holdTraceId = `${barcodeOperationTraceId(context, 'HOLD')}-${nextOp?.operationCode ?? 'NEXT'}`
  const capaTraceId = barcodeOperationTraceId(context, 'CAPA')
  const isolationTraceId = barcodeOperationTraceId(context, 'ISOLATION')
  const costTraceId = barcodeOperationTraceId(context, 'REWORK-COST')
  const labelTraceId = barcodeOperationTraceId(context, 'LABEL-HOLD')
  const reworkHours = Math.max(1, dialog.defectQty * 0.75 + 0.5)
  const reworkCost = Math.round(reworkHours * 180)
  upsertOtdEvidenceChainRecord({
    id: `barcode-rework-${context.code}-${op.operationCode}`,
    stage: '扫码返工',
    title: `${op.workOrderNumber} ${op.operationName} 扫码返工冻结`,
    summary: `扫码质量门 ${barcodeOperationTraceId(context, 'QUALITY')} 未放行：不良 ${dialog.defectQty} 件，检验结论 ${dialog.inspectionResult}。系统已生成返工工序、复验要求和交接冻结，禁止下道接收。`,
    object: `${op.workOrderNumber} / ${op.operationCode}`,
    source: `生产报工 / 质量门 / ${context.operatorLabel}`,
    traceId: reworkTraceId,
    status: 'active',
    statusLabel: '返工待复验',
    createdAt,
  })
  upsertOtdEvidenceChainRecord({
    id: `barcode-hold-${context.code}-${op.operationCode}-${nextOp?.operationCode ?? 'NEXT'}`,
    stage: '交接冻结',
    title: `${op.workOrderNumber} ${op.operationCode} 到 ${nextOp?.operationCode ?? '下道'} 交接冻结`,
    summary: `${nextOp ? `${nextOp.operationCode} ${nextOp.operationName}` : '下道工序'} 因质量门未放行被禁止接收，需等待返工复验和 CAPA 处置完成后再释放交接。`,
    object: op.workOrderNumber,
    source: `生产报工 / 工序交接 / ${context.equipmentId}`,
    traceId: holdTraceId,
    status: 'active',
    statusLabel: '下道接收冻结',
    createdAt,
  })
  upsertOtdEvidenceChainRecord({
    id: `barcode-capa-${context.code}-${op.operationCode}`,
    stage: '质量CAPA',
    title: `${op.workOrderNumber} ${op.operationName} 扫码 CAPA 处置`,
    summary: `质量门不合格已生成 CAPA 任务：复核首件尺寸、隔离 AL-202605 批次、确认返工后复验标准，并把处置状态回写 OTD 复盘。`,
    object: `${op.workOrderNumber} / AL-202605`,
    source: `质量闭环 / 扫码质量门 / ${context.operatorLabel}`,
    traceId: capaTraceId,
    status: 'active',
    statusLabel: 'CAPA 待验证',
    createdAt,
  })
  upsertOtdEvidenceChainRecord({
    id: `barcode-isolation-${context.code}-${op.operationCode}`,
    stage: '质量隔离',
    title: `${op.workOrderNumber} ${op.operationName} AL-202605 批次隔离`,
    summary: `扫码质量门未放行后，AL-202605 批次中 ${dialog.defectQty} 件不良品和 ${dialog.quantity} 件待复验品进入隔离区 Q-HOLD-01；隔离状态绑定 ${capaTraceId}，复验放行前禁止与合格批混放。`,
    object: `${op.workOrderNumber} / AL-202605 / Q-HOLD-01`,
    source: `质量闭环 / 隔离处置 / ${context.operatorLabel}`,
    traceId: isolationTraceId,
    status: 'active',
    statusLabel: '隔离待复验',
    createdAt,
  })
  upsertOtdEvidenceChainRecord({
    id: `barcode-rework-cost-${context.code}-${op.operationCode}`,
    stage: '返工成本',
    title: `${op.workOrderNumber} ${op.operationName} 返工工时成本预估`,
    summary: `不良 ${dialog.defectQty} 件按返工 ${reworkHours.toFixed(1)}h、标准人工费 180 元/h 估算，预计返工成本 ${reworkCost} 元；该成本将随 ${barcodeOperationTraceId(context, 'SCHEDULE-RELEASE')} 一并进入 OTD 复盘和排产复核。`,
    object: `${op.workOrderNumber} / ${op.operationCode}`,
    source: `质量闭环 / 返工成本 / ${context.operatorLabel}`,
    traceId: costTraceId,
    status: 'active',
    statusLabel: '成本待结算',
    createdAt,
  })
  upsertOtdEvidenceChainRecord({
    id: `barcode-label-hold-${context.code}-${op.operationCode}`,
    stage: '标签状态',
    title: `${op.workOrderNumber} 流转卡标签冻结`,
    summary: `实物流转卡标签状态已从“可交接”更新为“质量冻结”，标签继续绑定 ${reworkTraceId}，现场扫码时需先完成返工复验。`,
    object: op.workOrderNumber,
    source: `条码 / QR 打印 / ${context.operatorLabel}`,
    traceId: labelTraceId,
    status: 'active',
    statusLabel: '质量冻结标签已更新',
    createdAt,
  })
  barcodeReworkEvidenceTraceId.value = reworkTraceId
  barcodeHandoffFreezeTraceId.value = holdTraceId
  barcodeCapaEvidenceTraceId.value = capaTraceId
  barcodeIsolationEvidenceTraceId.value = isolationTraceId
  barcodeReworkCostTraceId.value = costTraceId
  barcodeLabelStatusTraceId.value = labelTraceId
  barcodeProductionContext.value = {
    ...context,
    sourceLabel: '质量冻结待返工',
  }
  return {
    reworkTraceId,
    holdTraceId,
    capaTraceId,
    isolationTraceId,
    costTraceId,
    labelTraceId,
    nextOperationCode: nextOp?.operationCode ?? '下道',
    nextOperationName: nextOp?.operationName ?? '待定工序',
  }
}

function writeBarcodeAnomalyEvidence(op: OperationInfoDto, context: BarcodeProductionContext, eventId: string) {
  const anomalyTraceId = barcodeOperationTraceId(context, 'ANOMALY')
  upsertOtdEvidenceChainRecord({
    id: `barcode-anomaly-${context.code}-${op.operationCode}`,
    stage: '扫码异常',
    title: `${op.workOrderNumber} ${op.operationName} 扫码异常分流`,
    summary: `扫码开工证据 ${context.integratedTraceId} 上报现场异常：${dialog.reason}。异常事件 ${eventId} 已进入异常管理与风险处置队列，需复核设备 ${dialog.equipmentId || context.equipmentId} 和物料批次 AL-202605。`,
    object: op.workOrderNumber,
    source: `生产报工 / 条码流转卡 / ${user.value?.username ?? context.actor}`,
    traceId: anomalyTraceId,
    status: 'active',
    statusLabel: '扫码异常待闭环',
    createdAt: new Date().toISOString(),
  })
  barcodeAnomalyEvidenceTraceId.value = anomalyTraceId
  barcodeProductionContext.value = {
    ...context,
    sourceLabel: '扫码异常待闭环',
  }
  return anomalyTraceId
}

function operationConstraints(op: OperationInfoDto) {
  if (isHeatTreatmentOperation(op)) {
    const block = readLaborQualificationBlockForOperation(op.workOrderNumber, op.operationCode, op.operationName)
    const reassignment = readLaborReassignmentForOperation(op.workOrderNumber, op.operationCode, op.operationName)
    const baseConstraints = ['SOP: 热处理作业 V1.8', '质检: 硬度 HB95+', '设备: HT-001', '物料: 炉批待确认']
    if (block) return [...baseConstraints, `人员: ${block.blockedEmployeeNumber} 停工复核`]
    return reassignment
      ? [...baseConstraints, `人员: ${reassignment.replacementEmployeeNumber} 替班已确认`]
      : baseConstraints
  }

  if (op.operationName.includes('装配')) {
    return ['SOP: 装配扭矩 V2.0', '质检: 扭矩复检', '设备: ASM-001', '物料: 套件齐套']
  }

  if (op.operationName.includes('CNC')) {
    return ['SOP: CNC 精加工 V2.3', '质检: 首件尺寸', '设备: CNC-002', '物料: AL-6061 齐套']
  }

  return ['SOP: 标准作业', '质检: 过程抽检', '设备: 标准工位', '物料: 已备料']
}

function isHeatTreatmentOperation(op: OperationInfoDto) {
  return op.operationName.includes('热处理') || op.operationName.includes('淬火') || op.operationName.includes('回火')
}

function refreshSelectedWorkOrderFromOperations() {
  if (!selectedWo.value) return
  const planned = Math.max(selectedWo.value.plannedQuantity, 1)
  const completed = Math.min(
    selectedWo.value.plannedQuantity,
    Math.max(...currentOperations.value.map(op => op.completedQuantity), selectedWo.value.completedQuantity)
  )
  selectedWo.value.completedQuantity = completed
  selectedWo.value.progressPercentage = Math.min(100, Math.round(completed / planned * 100))
  if (selectedWo.value.progressPercentage >= 100) {
    selectedWo.value.status = 'completed'
    selectedWo.value.actualEndDate = new Date().toISOString()
  } else if (selectedWo.value.progressPercentage > 0) {
    selectedWo.value.status = 'in_progress'
  }
}

function isSelectedWorkOrderOnTime() {
  if (!selectedWo.value?.plannedEndDate) return true
  return new Date() <= new Date(selectedWo.value.plannedEndDate)
}

// 扫码/搜索
async function handleScan() {
  const code = scanCode.value.trim()
  if (!code) return

  // 先扫工单
  try {
    const op = await scanOperation(code, user.value?.username)
    currentOperations.value = [op]
    return
  } catch { /* fall through */ }

  // 本地搜索工单
  const matched = workOrders.value.find(
    wo => wo.orderNumber.toLowerCase().includes(code.toLowerCase()) || wo.id === code
  )
  if (matched) {
    await selectWorkOrder(matched)
    if (/^WO[-_]/i.test(code)) {
      buildBarcodeProductionContext(matched.orderNumber.toUpperCase())
    }
    scanCode.value = ''
  } else {
    notify('未找到匹配的工单或工序', 'error')
  }
}

async function selectWorkOrder(wo: WorkOrderDto) {
  if (barcodeProductionContext.value && barcodeProductionContext.value.code !== wo.orderNumber.toUpperCase()) {
    barcodeProductionContext.value = null
    barcodeStartEvidenceTraceId.value = ''
    barcodeCompletionEvidenceTraceId.value = ''
    barcodeMaterialEvidenceTraceId.value = ''
    barcodeAnomalyEvidenceTraceId.value = ''
    barcodeQualityGateTraceId.value = ''
    barcodeHandoffTraceId.value = ''
    barcodeReworkEvidenceTraceId.value = ''
    barcodeHandoffFreezeTraceId.value = ''
    barcodeCapaEvidenceTraceId.value = ''
    barcodeIsolationEvidenceTraceId.value = ''
    barcodeReworkCostTraceId.value = ''
    barcodeLabelStatusTraceId.value = ''
  }
  selectedWo.value = wo
  scanCode.value = ''

  // 加载工序
  try {
    const result = await scanOperation(wo.orderNumber)
    currentOperations.value = [result]
  } catch {
    // 演示工序数据
    const opMap: Record<string, OperationInfoDto[]> = {
      'WO-001': [
        { operationId: 'OP-001', workOrderId: wo.id, workOrderNumber: wo.orderNumber, productCode: wo.productCode, productName: wo.productName, operationCode: 'OP-10', operationName: 'CNC 粗加工', plannedQuantity: 100, completedQuantity: 100, status: 'completed' },
        { operationId: 'OP-002', workOrderId: wo.id, workOrderNumber: wo.orderNumber, productCode: wo.productCode, productName: wo.productName, operationCode: 'OP-20', operationName: 'CNC 精加工', plannedQuantity: 100, completedQuantity: 48, status: 'in_progress' },
        { operationId: 'OP-003', workOrderId: wo.id, workOrderNumber: wo.orderNumber, productCode: wo.productCode, productName: wo.productName, operationCode: 'OP-30', operationName: '去毛刺', plannedQuantity: 100, completedQuantity: 0, status: 'pending' },
      ],
      'WO-005': [
        { operationId: 'OP-004', workOrderId: wo.id, workOrderNumber: wo.orderNumber, productCode: wo.productCode, productName: wo.productName, operationCode: 'OP-10', operationName: '下料', plannedQuantity: 50, completedQuantity: 50, status: 'completed' },
        { operationId: 'OP-005', workOrderId: wo.id, workOrderNumber: wo.orderNumber, productCode: wo.productCode, productName: wo.productName, operationCode: 'OP-20', operationName: 'CNC 加工', plannedQuantity: 50, completedQuantity: 20, status: 'in_progress' },
      ],
      'WO-008': [
        { operationId: 'OP-006', workOrderId: wo.id, workOrderNumber: wo.orderNumber, productCode: wo.productCode, productName: wo.productName, operationCode: 'OP-10', operationName: '注塑成型', plannedQuantity: 500, completedQuantity: 500, status: 'completed' },
      ],
      'WO-013': [
        { operationId: 'OP-007', workOrderId: wo.id, workOrderNumber: wo.orderNumber, productCode: wo.productCode, productName: wo.productName, operationCode: 'OP-10', operationName: '淬火', plannedQuantity: 200, completedQuantity: 0, status: 'pending' },
        { operationId: 'OP-008', workOrderId: wo.id, workOrderNumber: wo.orderNumber, productCode: wo.productCode, productName: wo.productName, operationCode: 'OP-20', operationName: '回火', plannedQuantity: 200, completedQuantity: 0, status: 'pending' },
      ],
      'WO-RUSH-9001': [
        { operationId: 'OP-RUSH-10', workOrderId: wo.id, workOrderNumber: wo.orderNumber, productCode: wo.productCode, productName: wo.productName, operationCode: 'OP-10', operationName: 'CNC 精加工', plannedQuantity: 30, completedQuantity: 0, status: 'pending' },
        { operationId: 'OP-RUSH-20', workOrderId: wo.id, workOrderNumber: wo.orderNumber, productCode: wo.productCode, productName: wo.productName, operationCode: 'OP-20', operationName: '装配复检', plannedQuantity: 30, completedQuantity: 0, status: 'pending' },
      ],
    }
    currentOperations.value = opMap[wo.orderNumber] || [
      { operationId: 'OP-001', workOrderId: wo.id, workOrderNumber: wo.orderNumber, productCode: wo.productCode, productName: wo.productName, operationCode: 'OP-10', operationName: '工序 1', plannedQuantity: wo.plannedQuantity, completedQuantity: wo.completedQuantity, status: wo.status === 'completed' ? 'completed' : wo.status === 'in_progress' ? 'in_progress' : 'pending' },
    ]
  }
}

async function startOp(op: OperationInfoDto) {
  const defaults = recommendedExecutionDefaults(op)
  dialog.type = 'start'
  dialog.op = op
  dialog.stationId = defaults.stationId
  dialog.equipmentId = defaults.equipmentId
  startQualificationCheck.value = buildQualificationCheck(op)
}

async function confirmStart() {
  if (!dialog.op) return
  if (startQualificationCheck.value.status === 'blocked') {
    notify('人员资质未找到有效替班候选，需停工复核后才能开工', 'error')
    return
  }
  const reassignment = readLaborReassignmentForOperation(
    dialog.op.workOrderNumber,
    dialog.op.operationCode,
    dialog.op.operationName
  )
  const barcodeContext = getBarcodeStartContextForOperation(dialog.op)
  try {
    await startOperation(dialog.op.operationId, {
      operatorId: user.value?.username || 'operator',
      stationId: dialog.stationId,
      equipmentId: dialog.equipmentId || undefined,
    })
  } catch { /* ok */ }

  const op = currentOperations.value.find(o => o.operationId === dialog.op!.operationId)
  if (op) op.status = 'in_progress'
  if (selectedWo.value?.orderNumber === dialog.op.workOrderNumber && selectedWo.value.status === 'pending') {
    selectedWo.value.status = 'in_progress'
    selectedWo.value.actualStartDate = new Date().toISOString()
  }
  if (reassignment) {
    writeLaborReassignmentExecutionEvidence(reassignment, {
      operationCode: dialog.op.operationCode,
      operationName: dialog.op.operationName,
      stationId: dialog.stationId,
      equipmentId: dialog.equipmentId || undefined,
      reportedBy: user.value?.username,
    })
  }
  const barcodeStartTraceId = barcodeContext ? writeBarcodeStartEvidence(dialog.op, barcodeContext) : ''
  prependTrace({
    type: 'schedule',
    typeLabel: '排产回写',
    title: `${dialog.op.workOrderNumber} 已开工`,
    detail: `${dialog.op.operationName} 在 ${dialog.stationId} 开工，设备 ${dialog.equipmentId || '未指定'} 已占用；${startQualificationCheck.value.sopDocument}、${startQualificationCheck.value.qualityGate}、${startQualificationCheck.value.materialKitting} 均已校验${reassignment ? `；${reassignment.auditId} 已执行 ${reassignment.replacementEmployeeName} 替班复核` : ''}${barcodeStartTraceId ? `；扫码开工证据 ${barcodeStartTraceId} 已进入 OTD 复盘。` : '。'}`,
    tags: ['进度回写', '设备占用', '人员资质', 'SOP', '物料齐套', ...(reassignment ? ['人员替班'] : []), ...(barcodeContext ? ['扫码流转卡'] : [])],
  })
  notify('已开工：' + dialog.op.operationName)
  dialog.type = ''
}

function buildQualificationCheck(op: OperationInfoDto): StartQualificationCheck {
  const matchedWorker = matchWorkforce(op)
  const workerSkill = matchedWorker.skills[0] || matchedWorker.roleHint
  const block = readLaborQualificationBlockForOperation(op.workOrderNumber, op.operationCode, op.operationName)
  const reassignment = readLaborReassignmentForOperation(op.workOrderNumber, op.operationCode, op.operationName)

  if (isHeatTreatmentOperation(op) && block) {
    const isReviewing = block.status === 'reviewing'
    return {
      status: 'blocked',
      statusLabel: isReviewing ? '主管复核中' : '停工复核',
      operatorName: block.blockedEmployeeName,
      employeeNumber: block.blockedEmployeeNumber,
      team: block.requiredTeam,
      shift: block.requiredShift,
      requiredSkill: block.requiredSkill,
      certificationName: block.blockedCertification,
      expiresAt: block.blockedExpiresAt,
      requiredEquipment: 'HT-001 暂不占用，待主管复核后重新派工',
      materialKitting: '炉批料框保持冻结，不释放到热处理工序',
      sopDocument: '热处理作业指导书 V1.8',
      qualityGate: '硬度 HB95+ 与金相抽检需复核后重排',
      qualificationBlockAuditId: block.auditId,
      qualificationBlockTraceId: block.traceId,
      qualificationBlockReason: block.reason,
      blockedOperator: `${block.blockedEmployeeName} · ${block.blockedEmployeeNumber}`,
      replacementReviewer: `${block.reviewerName} · ${block.reviewerRole}`,
      gates: [
        { label: '人员资质', result: isReviewing ? '主管复核中' : '停工复核', status: 'blocked' },
        { label: '替班候选', result: '无有效候选', status: 'blocked' },
        { label: '设备状态', result: '暂不占用', status: 'warning' },
        { label: '主管复核', result: isReviewing ? '已受理' : '必须升级', status: isReviewing ? 'warning' : 'blocked' },
      ],
      note: isReviewing
        ? `${block.auditId} 已由 ${block.reviewerName} 主管受理复核，但补证/改派尚未闭环；${block.traceId}-REVIEW 已进入 OTD 证据链，重新放行前不能开工。`
        : `${block.auditId} 已阻断 ${block.workOrderNumber} ${block.operationName}：${block.blockedEmployeeNumber} ${block.blockedEmployeeName} 的 ${block.blockedCertification} 临期，系统未找到有效替班候选；${block.traceId} 已进入 OTD 证据链，复核完成前不能开工。`,
    }
  }

  if (isHeatTreatmentOperation(op) && reassignment) {
    return {
      status: 'pass',
      statusLabel: '替班已确认',
      operatorName: reassignment.replacementEmployeeName,
      employeeNumber: reassignment.replacementEmployeeNumber,
      team: reassignment.replacementTeam,
      shift: reassignment.replacementShift,
      requiredSkill: reassignment.replacementSkill,
      certificationName: reassignment.replacementCertification,
      expiresAt: reassignment.replacementExpiresAt,
      requiredEquipment: 'HT-001 可用，温控曲线需复核',
      materialKitting: '炉批料框已备，淬火油批次由班组长复核',
      sopDocument: '热处理作业指导书 V1.8',
      qualityGate: '硬度 HB95+ 与金相抽检',
      reassignmentAuditId: reassignment.auditId,
      reassignmentTraceId: reassignment.traceId,
      blockedOperator: `${reassignment.blockedEmployeeName} · ${reassignment.blockedEmployeeNumber}`,
      replacementReviewer: `${reassignment.reviewerName} · ${reassignment.reviewerRole}`,
      gates: [
        { label: '人员资质', result: '替班已确认', status: 'pass' },
        { label: '设备状态', result: '通过', status: 'pass' },
        { label: '物料齐套', result: '批次复核', status: 'warning' },
        { label: '工程复核', result: '已安排', status: 'pass' },
      ],
      note: `${reassignment.auditId} 已将 ${reassignment.blockedEmployeeNumber} ${reassignment.blockedEmployeeName} 的临期资质风险转为 ${reassignment.replacementEmployeeNumber} ${reassignment.replacementEmployeeName} 替班复核；${reassignment.reviewerName} 保留 SOP 与炉批工程复核，${reassignment.traceId} 已进入 OTD 证据链。`,
    }
  }

  if (isHeatTreatmentOperation(op)) {
    return {
      status: 'warning',
      statusLabel: '临期可开工',
      operatorName: matchedWorker.name,
      employeeNumber: matchedWorker.employeeNumber,
      team: matchedWorker.team,
      shift: matchedWorker.shift,
      requiredSkill: workerSkill,
      certificationName: matchedWorker.certificationName,
      expiresAt: matchedWorker.expiresAt,
      requiredEquipment: 'HT-001 可用，温控曲线需复核',
      materialKitting: '炉批料框已备，淬火油批次待复核',
      sopDocument: '热处理作业指导书 V1.8',
      qualityGate: '硬度 HB95+ 与金相抽检',
      gates: [
        { label: '人员资质', result: '临期', status: 'warning' },
        { label: '设备状态', result: '通过', status: 'pass' },
        { label: '物料齐套', result: '需复核批次', status: 'warning' },
        { label: '上道工序', result: '已完成', status: 'pass' },
      ],
      note: `${matchedWorker.name} 当前匹配 ${workerSkill} 资质；热处理上岗证临期，淬火油批次需要班组长复核，排产应避免把下周关键热处理任务继续分配给该人员。`,
    }
  }

  if (op.operationName.includes('装配')) {
    return {
      status: 'pass',
      statusLabel: '校验通过',
      operatorName: matchedWorker.name,
      employeeNumber: matchedWorker.employeeNumber,
      team: matchedWorker.team,
      shift: matchedWorker.shift,
      requiredSkill: workerSkill,
      certificationName: matchedWorker.certificationName,
      expiresAt: matchedWorker.expiresAt,
      requiredEquipment: 'ASM-001 扭矩工具校准有效',
      materialKitting: '装配套件 30 套齐套',
      sopDocument: '装配扭矩 SOP V2.0',
      qualityGate: '扭矩复检 + 间隙抽检',
      gates: [
        { label: '人员资质', result: '通过', status: 'pass' },
        { label: '设备状态', result: '通过', status: 'pass' },
        { label: '物料齐套', result: '通过', status: 'pass' },
        { label: '上道工序', result: '已完成', status: 'pass' },
      ],
      note: `${matchedWorker.name} 的 ${workerSkill} 技能与装配班组要求匹配，扭矩工具校准、套件齐套与扭矩复检要求均满足，可直接开工。`,
    }
  }

  return {
    status: 'pass',
    statusLabel: '校验通过',
    operatorName: matchedWorker.name,
    employeeNumber: matchedWorker.employeeNumber,
    team: matchedWorker.team,
    shift: matchedWorker.shift,
    requiredSkill: workerSkill,
    certificationName: matchedWorker.certificationName,
    expiresAt: matchedWorker.expiresAt,
    requiredEquipment: 'CNC-002 可用，CNC-001 故障不可派工',
    materialKitting: 'M-AL-6061 已齐套，批次 AL-202605',
    sopDocument: 'CNC 精加工 SOP V2.3',
    qualityGate: '首件尺寸复检 + Ra 粗糙度抽检',
    gates: [
      { label: '人员资质', result: '通过', status: 'pass' },
      { label: '设备状态', result: '通过', status: 'pass' },
      { label: '物料齐套', result: '通过', status: 'pass' },
      { label: '上道工序', result: '已完成', status: 'pass' },
    ],
    note: `${matchedWorker.name} 的 ${workerSkill} 技能、班组班次、设备能力、物料齐套、SOP 版本和首件质检点均满足当前工序开工要求。`,
  }
}

function matchWorkforce(op: OperationInfoDto) {
  const normalized = op.operationName.toLowerCase()
  if (normalized.includes('热处理') || normalized.includes('淬火') || normalized.includes('回火')) {
    return {
      employeeNumber: 'EMP-003',
      name: '王五',
      team: '乙班',
      shift: '夜班',
      skills: ['热处理', '炉温曲线确认'],
      certificationName: '热处理上岗证',
      expiresAt: '2026-05-25',
      roleHint: '热处理',
    }
  }
  if (normalized.includes('装配')) {
    return {
      employeeNumber: 'EMP-002',
      name: '李四',
      team: '甲班',
      shift: '白班',
      skills: ['装配', '扭矩复检'],
      certificationName: '装配资质',
      expiresAt: '2026-11-30',
      roleHint: '装配',
    }
  }
  return {
    employeeNumber: 'EMP-001',
    name: '张三',
    team: '甲班',
    shift: '白班',
    skills: ['CNC 精加工', '首件自检'],
    certificationName: 'CNC-2 级',
    expiresAt: '2026-12-31',
    roleHint: 'CNC 精加工',
  }
}

function showCompleteDialog(op: OperationInfoDto) {
  dialog.type = 'complete'
  dialog.op = op
  dialog.quantity = op.plannedQuantity - op.completedQuantity
  dialog.defectQty = 0
  dialog.inspectionResult = 'Pass'
}

async function confirmComplete() {
  if (!dialog.op) return
  try {
    await completeOperation(dialog.op.operationId, {
      quantity: dialog.quantity,
      defectQuantity: dialog.defectQty,
      inspectionResult: dialog.inspectionResult,
      reportedBy: user.value?.username,
    })
  } catch { /* ok */ }

  const qualityPassed = dialog.inspectionResult === 'Pass' && dialog.defectQty === 0
  const op = currentOperations.value.find(o => o.operationId === dialog.op!.operationId)
  if (op) {
    op.status = qualityPassed ? 'completed' : 'paused'
    op.completedQuantity = Math.min(op.plannedQuantity, op.completedQuantity + dialog.quantity)
  }
  refreshSelectedWorkOrderFromOperations()
  const onTime = isSelectedWorkOrderOnTime()
  const barcodeContext = getBarcodeStartContextForOperation(dialog.op)
  const barcodeCompletionEvidence = barcodeContext
    ? writeBarcodeCompletionEvidence(dialog.op, barcodeContext, onTime)
    : null
  const barcodeQualityGateEvidence = barcodeContext
    ? writeBarcodeQualityGateEvidence(dialog.op, barcodeContext, onTime)
    : null
  const nextBarcodeOperation = findNextBarcodeOperation(dialog.op)
  const barcodeHandoffEvidence = barcodeContext && barcodeQualityGateEvidence?.passed
    ? writeBarcodeHandoffEvidence(dialog.op, barcodeContext, nextBarcodeOperation)
    : null
  const barcodeNonconformanceEvidence = barcodeContext && barcodeQualityGateEvidence && !barcodeQualityGateEvidence.passed
    ? writeBarcodeNonconformanceEvidence(dialog.op, barcodeContext, nextBarcodeOperation)
    : null
  prependTrace({
    type: 'schedule',
    typeLabel: '排产回写',
    title: `${dialog.op.workOrderNumber} 完工进度已回写`,
    detail: `${dialog.op.operationName} 完成 ${dialog.quantity} 件，工单进度更新为 ${selectedWo.value?.progressPercentage ?? 0}%。${barcodeCompletionEvidence ? `扫码完工 ${barcodeCompletionEvidence.completeTraceId} 与物料批次 ${barcodeCompletionEvidence.materialTraceId} 已进入 OTD 复盘。` : ''}${barcodeHandoffEvidence ? `下道 ${barcodeHandoffEvidence.nextOperationCode} ${barcodeHandoffEvidence.nextOperationName} 已生成交接证据 ${barcodeHandoffEvidence.handoffTraceId}。` : ''}${barcodeNonconformanceEvidence ? `质量门未放行，下道 ${barcodeNonconformanceEvidence.nextOperationCode} 已冻结，返工证据 ${barcodeNonconformanceEvidence.reworkTraceId}、隔离证据 ${barcodeNonconformanceEvidence.isolationTraceId}、成本证据 ${barcodeNonconformanceEvidence.costTraceId} 和标签状态 ${barcodeNonconformanceEvidence.labelTraceId} 已归档。` : ''}`,
    tags: ['进度回写', onTime ? 'OTD 达成' : 'OTD 风险', ...(barcodeCompletionEvidence ? ['扫码完工', '批次追溯'] : []), ...(barcodeHandoffEvidence ? ['工序交接'] : []), ...(barcodeNonconformanceEvidence ? ['交接冻结', '返工分流', '质量隔离', '返工成本'] : [])],
  })
  prependTrace({
    type: 'quality',
    typeLabel: '质量联动',
    title: `${dialog.inspectionResult === 'Pass' ? '质检放行' : '质检异常'}：${dialog.op.operationName}`,
    detail: `合格 ${dialog.quantity} 件，不良 ${dialog.defectQty} 件，结果 ${dialog.inspectionResult}。${barcodeQualityGateEvidence ? `首件巡检质量门 ${barcodeQualityGateEvidence.qualityTraceId} 已进入质量闭环、报表和审计回放。` : ''}${barcodeNonconformanceEvidence ? `扫码 CAPA ${barcodeNonconformanceEvidence.capaTraceId} 已生成，批次隔离 ${barcodeNonconformanceEvidence.isolationTraceId} 与返工成本 ${barcodeNonconformanceEvidence.costTraceId} 已进入 OTD 复盘，需返工复验后释放标签和交接。` : ''}`,
    tags: ['质检触发', dialog.defectQty > 0 ? '不良品' : '合格批次', ...(barcodeQualityGateEvidence ? ['质量门', '首件巡检'] : []), ...(barcodeNonconformanceEvidence ? ['质量CAPA', '质量隔离', '返工成本', '标签冻结'] : [])],
  })
  upsertOtdEvidenceChainRecord({
    id: `production-completion-${dialog.op.operationId}`,
    stage: '生产完工',
    title: `${dialog.op.workOrderNumber} ${dialog.op.operationName} 完工回写`,
    summary: `${dialog.quantity} 件完工，工单进度更新为 ${selectedWo.value?.progressPercentage ?? 0}%，质检结果 ${dialog.inspectionResult}。`,
    object: dialog.op.workOrderNumber,
    source: `生产报工 / ${user.value?.username ?? 'operator'}`,
    traceId: `TRACE-PROD-COMPLETE-${dialog.op.operationCode}`,
    status: onTime ? 'closed' : 'active',
    statusLabel: onTime ? 'OTD 达成' : 'OTD 风险',
    createdAt: new Date().toISOString(),
  })
  notify('完工报告已提交：' + dialog.op.operationName)
  dialog.type = ''
}

function showExceptionDialog(op: OperationInfoDto) {
  dialog.type = 'exception'
  dialog.op = op
  dialog.reason = ''
}

async function confirmException() {
  if (!dialog.op) return
  const op = dialog.op
  const reason = dialog.reason
  const eventId = `prod-anomaly-${Date.now()}`
  const detectedAt = new Date().toISOString()
  const barcodeContext = getBarcodeStartContextForOperation(op)

  writeProductionAnomalyEvent({
    id: eventId,
    workOrderNumber: op.workOrderNumber,
    operationCode: op.operationCode,
    operationName: op.operationName,
    equipmentId: dialog.equipmentId || 'CNC-002',
    anomalyType: 'process',
    severity: 'High',
    title: `${op.workOrderNumber} ${op.operationName} 现场异常`,
    description: reason,
    detectedAt,
    detectedBy: user.value?.username || 'operator',
    suggestedAction: '冻结当前工序，通知班组长复核 SOP、设备状态和物料批次；同步 AI 排产风险队列评估延期。',
  })
  const barcodeAnomalyTraceId = barcodeContext ? writeBarcodeAnomalyEvidence(op, barcodeContext, eventId) : ''

  try {
    await reportException(op.operationId, { reason })
  } catch { /* ok */ }

  prependTrace({
    type: 'risk',
    typeLabel: '风险联动',
    title: `${op.workOrderNumber} 异常已进入处置队列`,
    detail: `${op.operationName} 上报异常：${reason}。已生成异常管理事件 ${eventId}，建议触发排产风险复核${barcodeAnomalyTraceId ? `；扫码异常证据 ${barcodeAnomalyTraceId} 已进入 OTD 复盘。` : '。'}`,
    tags: ['异常管理', '排产风险', '事件回写', ...(barcodeAnomalyTraceId ? ['扫码异常'] : [])],
  })
  notify('异常已上报：' + reason, 'error')
  dialog.type = ''
}

async function loadWorkOrders() {
  try {
    const result = await getWorkOrders({
      status: statusFilter.value || undefined,
      page: currentPage.value,
      pageSize,
    })
    workOrders.value = result.items
    totalCount.value = result.totalCount
  } catch {
    loadDemoData()
  }
}

function buildDemoWorkOrderFromBarcode(code: string): WorkOrderDto | null {
  if (!/^WO[-_]/.test(code)) return null
  if (code === 'WO-RUSH-9001') {
    return {
      id: 'WO-RUSH-9001',
      orderNumber: 'WO-RUSH-9001',
      productCode: 'PROD-RUSH-01',
      productName: '急单阀体组件',
      plannedQuantity: 30,
      completedQuantity: 0,
      plannedStartDate: '2026-05-21T09:00:00',
      plannedEndDate: '2026-05-21T16:00:00',
      status: 'pending',
      workshopId: 'WS-001',
      priority: 0,
      progressPercentage: 0,
      createdAt: '2026-05-21T08:30:00',
    }
  }
  return {
    id: code,
    orderNumber: code,
    productCode: 'PRD-SCAN',
    productName: '扫码导入工单',
    plannedQuantity: 1,
    completedQuantity: 0,
    plannedStartDate: new Date().toISOString(),
    plannedEndDate: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(),
    status: 'pending',
    workshopId: 'WS-001',
    priority: 2,
    progressPercentage: 0,
    createdAt: new Date().toISOString(),
  }
}

function ensureBarcodeWorkOrder(code: string) {
  const existing = workOrders.value.find(wo => wo.orderNumber.toUpperCase() === code)
  if (existing) return existing
  const demo = buildDemoWorkOrderFromBarcode(code)
  if (!demo) return null
  workOrders.value = [demo, ...workOrders.value]
  totalCount.value = Math.max(totalCount.value + 1, workOrders.value.length)
  return demo
}

async function applyBarcodeRouteContext() {
  const code = normalizeBarcodeCode(route.query.scanCode)
  if (!code) return
  const wo = ensureBarcodeWorkOrder(code)
  if (!wo) return
  await selectWorkOrder(wo)
  buildBarcodeProductionContext(code)
  notify(`${code} 扫码上下文已带入生产报工`)
}

onMounted(async () => {
  await loadWorkOrders()
  await applyBarcodeRouteContext()
})

watch(() => route.query.scanCode, async () => {
  if (!workOrders.value.length) return
  await applyBarcodeRouteContext()
})

function loadDemoData() {
    workOrders.value = [
      { id: 'WO-001', orderNumber: 'WO-001', productCode: 'PRD-001', productName: '精密转接座', plannedQuantity: 100, completedQuantity: 48, plannedStartDate: '2026-05-12T08:00:00', plannedEndDate: '2026-05-12T17:00:00', actualStartDate: '2026-05-12T08:00:00', status: 'in_progress', workshopId: 'WS-001', priority: 1, progressPercentage: 48, createdAt: '2026-05-10T00:00:00' },
      { id: 'WO-005', orderNumber: 'WO-005', productCode: 'PRD-004', productName: '基座加工', plannedQuantity: 50, completedQuantity: 20, plannedStartDate: '2026-05-12T08:00:00', plannedEndDate: '2026-05-12T16:00:00', actualStartDate: '2026-05-12T08:00:00', status: 'in_progress', workshopId: 'WS-001', priority: 2, progressPercentage: 40, createdAt: '2026-05-10T00:00:00' },
      { id: 'WO-008', orderNumber: 'WO-008', productCode: 'PRD-002', productName: '外壳注塑', plannedQuantity: 500, completedQuantity: 500, plannedStartDate: '2026-05-12T08:00:00', plannedEndDate: '2026-05-12T10:00:00', actualStartDate: '2026-05-12T08:00:00', actualEndDate: '2026-05-12T09:45:00', status: 'completed', workshopId: 'WS-002', priority: 1, progressPercentage: 100, createdAt: '2026-05-10T00:00:00' },
      { id: 'WO-013', orderNumber: 'WO-013', productCode: 'PRD-003', productName: '淬火热处理', plannedQuantity: 200, completedQuantity: 0, plannedStartDate: '2026-05-12T10:00:00', plannedEndDate: '2026-05-12T14:00:00', status: 'pending', workshopId: 'WS-001', priority: 3, progressPercentage: 0, createdAt: '2026-05-11T00:00:00' },
      { id: 'WO-009', orderNumber: 'WO-009', productCode: 'PRD-002', productName: '面板注塑', plannedQuantity: 300, completedQuantity: 0, plannedStartDate: '2026-05-12T13:00:00', plannedEndDate: '2026-05-12T17:00:00', status: 'pending', workshopId: 'WS-002', priority: 2, progressPercentage: 0, createdAt: '2026-05-11T00:00:00' },
      { id: 'WO-004', orderNumber: 'WO-004', productCode: 'PRD-001', productName: '装配总成', plannedQuantity: 30, completedQuantity: 0, plannedStartDate: '2026-05-12T13:00:00', plannedEndDate: '2026-05-13T17:00:00', status: 'pending', workshopId: 'WS-003', priority: 1, progressPercentage: 0, createdAt: '2026-05-10T00:00:00' },
      { id: 'WO-RUSH-9001', orderNumber: 'WO-RUSH-9001', productCode: 'PROD-RUSH-01', productName: '急单阀体组件', plannedQuantity: 30, completedQuantity: 0, plannedStartDate: '2026-05-21T09:00:00', plannedEndDate: '2026-05-21T16:00:00', status: 'pending', workshopId: 'WS-001', priority: 0, progressPercentage: 0, createdAt: '2026-05-21T08:30:00' },
    ]
    totalCount.value = workOrders.value.length
    if (!selectedWo.value && workOrders.value.length) {
      executionTraces.value = []
    }
  }
</script>

<style scoped>
/* 产量摘要 */
.summary-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 14px 20px;
  margin-bottom: 12px;
  background: linear-gradient(135deg, #fafafa, #fff);
  border: 1px solid #f0f0f0;
  border-radius: 8px;
}

.summary-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 64px;
}

.summary-value {
  font-size: 22px;
  font-weight: 700;
  color: #333;
  line-height: 1.2;
}

.summary-value.in-progress { color: #1890ff; }
.summary-value.done { color: #52c41a; }
.summary-value.pending { color: #faad14; }
.summary-value.otd { font-size: 20px; }

.summary-label {
  font-size: 11px;
  color: #999;
  margin-top: 2px;
}

.summary-divider {
  width: 1px;
  height: 36px;
  background: #e8e8e8;
}

.production-board {
  padding: 20px;
  max-width: 1400px;
  margin: 0 auto;
  height: 100%;
  display: flex;
  flex-direction: column;
}

/* 顶部操作栏 */
.action-bar {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
  align-items: center;
}

.scan-input-group {
  display: flex;
  gap: 8px;
  flex: 1;
}

.scan-input {
  flex: 1;
  max-width: 360px;
  padding: 10px 14px;
  border: 1px solid #d9d9d9;
  border-radius: 6px;
  font-size: 14px;
  outline: none;
  transition: border-color 0.2s;
}

.scan-input:focus {
  border-color: #1890ff;
  box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.1);
}

.scan-btn {
  padding: 8px 20px;
  background: #1890ff;
  color: #fff;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
}

.scan-btn:hover:not(:disabled) { background: #40a9ff; }
.scan-btn:disabled { background: #d9d9d9; cursor: not-allowed; }

.action-filters { display: flex; gap: 8px; }
.filter-select {
  padding: 8px 12px; border: 1px solid #d9d9d9; border-radius: 6px;
  font-size: 13px; outline: none;
}

/* 主体 */
.board-body {
  flex: 1;
  display: grid;
  grid-template-columns: 360px 1fr;
  gap: 16px;
  overflow: hidden;
}

/* 左侧工单列表 */
.wo-list-panel {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.06);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 16px;
  border-bottom: 1px solid #f5f5f5;
}

.panel-header h3 { margin: 0; font-size: 15px; }
.panel-count {
  background: #f0f0f0; color: #888; padding: 2px 10px;
  border-radius: 10px; font-size: 12px; font-weight: 600;
}

.wo-list {
  flex: 1;
  overflow-y: auto;
  padding: 8px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.wo-card {
  padding: 12px;
  border-radius: 6px;
  background: #fafafa;
  border: 2px solid transparent;
  cursor: pointer;
  transition: all 0.15s;
}

.wo-card:hover { border-color: #e6f7ff; background: #f0f9ff; }
.wo-card.selected { border-color: #1890ff; background: #e6f7ff; }
.wo-card.completed { opacity: 0.7; }

.wo-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px; }
.wo-number { font-weight: 600; font-size: 14px; }
.wo-product { font-size: 13px; color: #666; margin-bottom: 8px; }
.wo-progress-row { display: flex; align-items: center; gap: 8px; margin-bottom: 6px; }
.wo-progress-bar { flex: 1; height: 6px; background: #f0f0f0; border-radius: 3px; overflow: hidden; }
.wo-progress-fill { height: 100%; border-radius: 3px; transition: width 0.3s; }
.wo-progress-fill.done { background: #52c41a; }
.wo-progress-fill.mid { background: #1890ff; }
.wo-progress-fill.low { background: #faad14; }
.wo-progress-text { font-size: 11px; color: #999; width: 32px; text-align: right; }
.wo-meta { display: flex; gap: 16px; font-size: 11px; color: #bbb; }

/* 右侧详情 */
.wo-detail-panel {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.06);
  overflow-y: auto;
  padding: 20px;
}

.detail-empty {
  display: flex; flex-direction: column; align-items: center;
  justify-content: center; height: 100%; color: #ccc;
}
.detail-empty .empty-icon { font-size: 48px; margin-bottom: 12px; }
.detail-empty p { font-size: 15px; }

.detail-title-row { display: flex; align-items: center; gap: 12px; margin-bottom: 16px; }
.detail-title-row h3 { margin: 0; font-size: 18px; }
.detail-info-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  margin-bottom: 16px;
}
.di { display: flex; flex-direction: column; }
.di label { font-size: 12px; color: #999; margin-bottom: 2px; }
.di span { font-size: 14px; font-weight: 500; }
.di span.green { color: #52c41a; }

.detail-progress { display: flex; align-items: center; gap: 12px; margin-bottom: 20px; }
.detail-progress-bar { flex: 1; height: 10px; background: #f0f0f0; border-radius: 5px; overflow: hidden; }
.detail-progress-fill { height: 100%; border-radius: 5px; transition: width 0.5s; }
.detail-progress-fill.done { background: #52c41a; }
.detail-progress-fill.mid { background: #1890ff; }
.detail-progress-fill.low { background: #faad14; }
.detail-progress-text { font-size: 14px; font-weight: 600; color: #333; }

.barcode-start-context {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 16px;
  padding: 12px;
  border: 1px solid #fed7aa;
  border-radius: 8px;
  background: #fff7ed;
}

.barcode-start-context.synced {
  border-color: #bbf7d0;
  background: #f0fdf4;
}

.barcode-context-heading,
.barcode-context-actions {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: center;
}

.barcode-context-heading span {
  display: block;
  margin-bottom: 2px;
  color: #c2410c;
  font-size: 12px;
  font-weight: 700;
}

.barcode-start-context.synced .barcode-context-heading span {
  color: #15803d;
}

.barcode-context-heading h4,
.barcode-start-context p,
.barcode-dialog-evidence p {
  margin: 0;
}

.barcode-context-heading h4 {
  color: #111827;
  font-size: 15px;
}

.barcode-context-heading em {
  flex: 0 0 auto;
  padding: 3px 8px;
  border-radius: 4px;
  background: #ffedd5;
  color: #c2410c;
  font-size: 12px;
  font-style: normal;
  font-weight: 700;
}

.barcode-start-context.synced .barcode-context-heading em {
  background: #dcfce7;
  color: #15803d;
}

.barcode-context-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 8px;
}

.barcode-context-grid div {
  display: flex;
  flex-direction: column;
  gap: 3px;
  padding: 8px;
  border: 1px solid #fed7aa;
  border-radius: 6px;
  background: #fff;
}

.barcode-start-context.synced .barcode-context-grid div {
  border-color: #bbf7d0;
}

.barcode-context-grid label,
.barcode-dialog-evidence label {
  color: #6b7280;
  font-size: 12px;
}

.barcode-context-grid strong,
.barcode-dialog-evidence strong {
  color: #111827;
  font-size: 13px;
}

.barcode-start-context p,
.barcode-context-actions span,
.barcode-dialog-evidence p {
  color: #64748b;
  font-size: 12px;
  line-height: 1.45;
}

.barcode-context-actions button {
  padding: 7px 12px;
  border: none;
  border-radius: 4px;
  background: #f97316;
  color: #fff;
  cursor: pointer;
  font-size: 12px;
  font-weight: 700;
}

.barcode-context-actions button:hover {
  background: #ea580c;
}

.barcode-context-actions button.secondary {
  background: #2563eb;
}

.barcode-context-actions button.secondary:hover {
  background: #1d4ed8;
}

.barcode-context-actions button.danger {
  background: #dc2626;
}

.barcode-context-actions button.danger:hover {
  background: #b91c1c;
}

.barcode-context-evidence {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.barcode-context-evidence span {
  padding: 3px 7px;
  border-radius: 4px;
  background: #dcfce7;
  color: #15803d;
  font-size: 12px;
  font-weight: 700;
}

/* 工序 */
.operations-section { }
.operations-section h4 { margin: 0 0 12px; font-size: 15px; }
.op-list { display: flex; flex-direction: column; gap: 8px; }
.op-card {
  display: flex; align-items: center; gap: 12px;
  padding: 14px; border-radius: 8px; border: 1px solid #f0f0f0;
}
.op-card.completed { background: #f6ffed; }
.op-card.in_progress { background: #e6f7ff; border-color: #91d5ff; }
.op-card.pending { background: #fafafa; }
.op-header { display: flex; align-items: center; gap: 8px; flex: 1; }
.op-code { font-size: 12px; color: #999; font-family: monospace; }
.op-name { font-weight: 500; flex: 1; }
.op-meta { display: flex; gap: 12px; font-size: 12px; color: #999; white-space: nowrap; }
.op-constraints {
  display: flex;
  flex: 1.2;
  flex-wrap: wrap;
  gap: 5px;
}
.op-constraints span {
  padding: 2px 6px;
  border-radius: 4px;
  background: #f3f4f6;
  color: #4b5563;
  font-size: 11px;
  white-space: nowrap;
}
.op-actions { display: flex; gap: 6px; }

.op-btn {
  padding: 4px 12px; border: none; border-radius: 4px;
  font-size: 12px; cursor: pointer; font-weight: 500;
}
.op-btn.start { background: #1890ff; color: #fff; }
.op-btn.start:hover { background: #40a9ff; }
.op-btn.complete { background: #52c41a; color: #fff; }
.op-btn.complete:hover { background: #73d13d; }
.op-btn.exception { background: #ff4d4f; color: #fff; }
.op-btn.exception:hover { background: #ff7875; }

/* Badges */
.wo-badge {
  padding: 2px 8px; border-radius: 3px; font-size: 11px; font-weight: 600;
}
.wo-badge.large { padding: 3px 12px; font-size: 13px; }
.wo-badge.pending { background: #f5f5f5; color: #999; }
.wo-badge.in_progress { background: #e6f7ff; color: #1890ff; }
.wo-badge.completed { background: #f6ffed; color: #52c41a; }
.wo-badge.paused { background: #fffbe6; color: #d4b106; }
.wo-badge.cancelled { background: #fff2f0; color: #ff4d4f; }
.op-badge { padding: 1px 6px; border-radius: 3px; font-size: 11px; }
.op-badge.pending { background: #f5f5f5; color: #999; }
.op-badge.in_progress { background: #e6f7ff; color: #1890ff; }
.op-badge.completed { background: #f6ffed; color: #52c41a; }

/* 对话框 */
.dialog-overlay {
  position: fixed; inset: 0; background: rgba(0,0,0,0.4);
  display: flex; align-items: center; justify-content: center; z-index: 2000;
}
.dialog-card {
  background: #fff; border-radius: 12px; padding: 24px;
  width: 400px; max-width: 90vw; max-height: 88vh; overflow-y: auto;
  box-shadow: 0 8px 24px rgba(0,0,0,0.15);
}
.dialog-card h4 { margin: 0 0 4px; font-size: 16px; }
.dialog-op-name { font-size: 14px; color: #888; margin-bottom: 16px; }
.dialog-form { display: flex; flex-direction: column; gap: 12px; margin-bottom: 20px; }
.barcode-dialog-evidence {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 9px 10px;
  border: 1px solid #fed7aa;
  border-radius: 6px;
  background: #fff7ed;
}
.form-row { display: flex; flex-direction: column; gap: 4px; }
.form-row label { font-size: 13px; color: #555; font-weight: 500; }
.form-row input,
.form-row select,
.form-row textarea {
  padding: 8px 12px; border: 1px solid #d9d9d9; border-radius: 6px; font-size: 14px; outline: none; font-family: inherit;
}
.form-row input:focus,
.form-row select:focus,
.form-row textarea:focus { border-color: #1890ff; box-shadow: 0 0 0 2px rgba(24,144,255,0.1); }
.form-row textarea { resize: vertical; }
.dialog-actions { display: flex; gap: 8px; justify-content: flex-end; }
.dialog-cancel {
  padding: 8px 20px; background: #f5f5f5; border: 1px solid #d9d9d9;
  border-radius: 6px; cursor: pointer; font-size: 14px;
}
.dialog-confirm {
  padding: 8px 20px; background: #1890ff; color: #fff;
  border: none; border-radius: 6px; cursor: pointer; font-size: 14px;
}
.dialog-confirm:disabled { background: #d9d9d9; cursor: not-allowed; }
.dialog-confirm.danger { background: #ff4d4f; }
.dialog-confirm.danger:hover:not(:disabled) { background: #ff7875; }

/* 通知 */
.notification {
  position: fixed; top: 64px; right: 24px;
  padding: 12px 20px; border-radius: 6px;
  font-size: 14px; z-index: 3000; box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}
.notification.success { background: #f6ffed; color: #52c41a; border: 1px solid #b7eb8f; }
.notification.error { background: #fff2f0; color: #ff4d4f; border: 1px solid #ffccc7; }

.fade-enter-active { transition: all 0.2s ease-out; }
.fade-leave-active { transition: all 0.15s ease-in; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

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

@media (max-width: 860px) {
  .board-body { grid-template-columns: 1fr; }
  .barcode-context-grid { grid-template-columns: 1fr 1fr; }
  .barcode-context-heading,
  .barcode-context-actions {
    align-items: flex-start;
    flex-direction: column;
  }
}
</style>
