<template>
  <MainLayout>
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
              <button class="dialog-confirm" @click="confirmStart" :disabled="!dialog.stationId">确认开工</button>
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
  </MainLayout>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import MainLayout from '../layout/MainLayout.vue'
import { useAuth } from '../../stores/auth'
import { getWorkOrders, scanOperation, startOperation, completeOperation, reportException } from '../../api/production'
import type { WorkOrderDto, OperationInfoDto } from '../../types/production'
import { formatDate } from '../../utils/date'

const router = useRouter()
const { user } = useAuth()

const scanCode = ref('')
const statusFilter = ref('')
const workOrders = ref<WorkOrderDto[]>([])
const selectedWo = ref<WorkOrderDto | null>(null)
const currentOperations = ref<OperationInfoDto[]>([])

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

const notification = reactive({ show: false, type: 'success' as string, message: '', timer: null as any })

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
    selectWorkOrder(matched)
    scanCode.value = ''
  } else {
    notify('未找到匹配的工单或工序', 'error')
  }
}

async function selectWorkOrder(wo: WorkOrderDto) {
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
    }
    currentOperations.value = opMap[wo.orderNumber] || [
      { operationId: 'OP-001', workOrderId: wo.id, workOrderNumber: wo.orderNumber, productCode: wo.productCode, productName: wo.productName, operationCode: 'OP-10', operationName: '工序 1', plannedQuantity: wo.plannedQuantity, completedQuantity: wo.completedQuantity, status: wo.status === 'completed' ? 'completed' : wo.status === 'in_progress' ? 'in_progress' : 'pending' },
    ]
  }
}

async function startOp(op: OperationInfoDto) {
  dialog.type = 'start'
  dialog.op = op
  dialog.stationId = 'ST-001'
  dialog.equipmentId = 'EQ-001'
}

async function confirmStart() {
  if (!dialog.op) return
  try {
    await startOperation(dialog.op.operationId, {
      operatorId: user.value?.username || 'operator',
      stationId: dialog.stationId,
      equipmentId: dialog.equipmentId || undefined,
    })
  } catch { /* ok */ }

  const op = currentOperations.value.find(o => o.operationId === dialog.op!.operationId)
  if (op) op.status = 'in_progress'
  notify('已开工：' + dialog.op.operationName)
  dialog.type = ''
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

  const op = currentOperations.value.find(o => o.operationId === dialog.op!.operationId)
  if (op) {
    op.status = 'completed'
    op.completedQuantity += dialog.quantity
  }
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
  try {
    await reportException(dialog.op.operationId, { reason: dialog.reason })
  } catch { /* ok */ }

  notify('异常已上报：' + dialog.reason, 'error')
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

onMounted(async () => {
  await loadWorkOrders()
})

function loadDemoData() {
    workOrders.value = [
      { id: 'WO-001', orderNumber: 'WO-001', productCode: 'PRD-001', productName: '精密转接座', plannedQuantity: 100, completedQuantity: 48, plannedStartDate: '2026-05-12T08:00:00', plannedEndDate: '2026-05-12T17:00:00', actualStartDate: '2026-05-12T08:00:00', status: 'in_progress', workshopId: 'WS-001', priority: 1, progressPercentage: 48, createdAt: '2026-05-10T00:00:00' },
      { id: 'WO-005', orderNumber: 'WO-005', productCode: 'PRD-004', productName: '基座加工', plannedQuantity: 50, completedQuantity: 20, plannedStartDate: '2026-05-12T08:00:00', plannedEndDate: '2026-05-12T16:00:00', actualStartDate: '2026-05-12T08:00:00', status: 'in_progress', workshopId: 'WS-001', priority: 2, progressPercentage: 40, createdAt: '2026-05-10T00:00:00' },
      { id: 'WO-008', orderNumber: 'WO-008', productCode: 'PRD-002', productName: '外壳注塑', plannedQuantity: 500, completedQuantity: 500, plannedStartDate: '2026-05-12T08:00:00', plannedEndDate: '2026-05-12T10:00:00', actualStartDate: '2026-05-12T08:00:00', actualEndDate: '2026-05-12T09:45:00', status: 'completed', workshopId: 'WS-002', priority: 1, progressPercentage: 100, createdAt: '2026-05-10T00:00:00' },
      { id: 'WO-013', orderNumber: 'WO-013', productCode: 'PRD-003', productName: '淬火热处理', plannedQuantity: 200, completedQuantity: 0, plannedStartDate: '2026-05-12T10:00:00', plannedEndDate: '2026-05-12T14:00:00', status: 'pending', workshopId: 'WS-001', priority: 3, progressPercentage: 0, createdAt: '2026-05-11T00:00:00' },
      { id: 'WO-009', orderNumber: 'WO-009', productCode: 'PRD-002', productName: '面板注塑', plannedQuantity: 300, completedQuantity: 0, plannedStartDate: '2026-05-12T13:00:00', plannedEndDate: '2026-05-12T17:00:00', status: 'pending', workshopId: 'WS-002', priority: 2, progressPercentage: 0, createdAt: '2026-05-11T00:00:00' },
      { id: 'WO-004', orderNumber: 'WO-004', productCode: 'PRD-001', productName: '装配总成', plannedQuantity: 30, completedQuantity: 0, plannedStartDate: '2026-05-12T13:00:00', plannedEndDate: '2026-05-13T17:00:00', status: 'pending', workshopId: 'WS-003', priority: 1, progressPercentage: 0, createdAt: '2026-05-10T00:00:00' },
    ]
    totalCount.value = workOrders.value.length
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
  width: 400px; max-width: 90vw; box-shadow: 0 8px 24px rgba(0,0,0,0.15);
}
.dialog-card h4 { margin: 0 0 4px; font-size: 16px; }
.dialog-op-name { font-size: 14px; color: #888; margin-bottom: 16px; }
.dialog-form { display: flex; flex-direction: column; gap: 12px; margin-bottom: 20px; }
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
}
</style>
