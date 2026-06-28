<template>
  <div class="po-board">
    <div class="page-header">
      <h2 class="page-title">采购管理</h2>
      <button class="btn btn-export" @click="handleExport" v-if="orders.length">导出 CSV</button>
    </div>

    <section v-if="auditFocus" class="audit-focus-banner" aria-label="审计对象定位">
      <div>
        <span>来自审计回放</span>
        <strong>{{ auditFocus.label }}</strong>
        <p>对象 {{ auditFocus.objectId }} 已定位到采购单详情，追踪号 {{ auditFocus.traceId }}。</p>
      </div>
      <code>{{ auditFocus.objectType }}</code>
    </section>

    <div v-if="notification" class="purchase-notification" role="alert">
      {{ notification }}
    </div>

    <ShortageActionPanel
      :shortage="shortageAction"
      :trace="shortageTrace"
      :has-expedite-order="Boolean(expediteOrderId)"
      @expedite="handleExpediteShortage"
      @alternate="handleAlternateMaterial"
      @receive="handleReceiveExpedite"
    />

    <section class="supply-risk-panel" aria-label="供应风险控制塔">
      <div class="supply-risk-heading">
        <div>
          <span class="eyebrow">供应风险控制塔</span>
          <h3>供应延期、替代供应商与排产复核</h3>
        </div>
        <span class="risk-badge" :class="supplyRiskStatusClass">{{ supplyRiskStatusText }}</span>
      </div>

      <div class="supply-risk-grid">
        <article class="supply-risk-card danger">
          <span>延期风险</span>
          <strong>{{ supplyRisk.purchaseOrderNumber }}</strong>
          <em>{{ supplyRisk.supplierName }} / {{ supplyRisk.delayDays }} 天</em>
        </article>
        <article class="supply-risk-card">
          <span>影响对象</span>
          <strong>{{ supplyRisk.materialCode }}</strong>
          <em>{{ supplyRisk.affectedOrders }}</em>
        </article>
        <article class="supply-risk-card alternate">
          <span>替代供应商</span>
          <strong>{{ supplyRisk.alternateSupplierName }}</strong>
          <em>{{ supplyRisk.alternatePromiseDate }} 可到料</em>
        </article>
        <article class="supply-risk-card">
          <span>承诺窗口</span>
          <strong>{{ supplyRisk.originalDeliveryDate }} -> {{ supplyRisk.promisedDeliveryDate }}</strong>
          <em>锁定期后排产需复核</em>
        </article>
      </div>

      <div class="supply-risk-actions">
        <button type="button" class="btn supply-escalate" @click="handleEscalateSupplyRisk">升级供应风险</button>
        <button type="button" class="btn supply-commit" @click="handleCommitAlternateSupplier">锁定替代供应商</button>
        <button
          v-if="supplyRiskDecision === 'alternate_committed'"
          type="button"
          class="btn supply-receive"
          @click="handleReceiveAlternateSupplier"
        >
          确认替代到货
        </button>
      </div>

      <div class="supply-risk-trace" :class="{ empty: !supplyRiskTrace }">
        <template v-if="supplyRiskTrace">
          <span>供应联动</span>
          <strong>{{ supplyRiskTrace.title }}</strong>
          <p>{{ supplyRiskTrace.detail }}</p>
          <code>{{ supplyRiskTrace.traceId }}</code>
        </template>
        <template v-else>
          <span>供应联动</span>
          <strong>等待供应风险动作</strong>
          <p>供应延期尚未进入 Agent 排产复核。</p>
        </template>
      </div>
    </section>

    <section class="supplier-network-panel" aria-label="供应网络治理">
      <div class="supplier-network-heading">
        <div>
          <span class="eyebrow">供应网络治理</span>
          <h3>供应商绩效、交付 SLA 与多承诺比较</h3>
        </div>
        <span class="risk-badge" :class="supplierNetworkDecision ? 'mitigated' : 'ordered'">
          {{ supplierNetworkDecision ? '已选优' : '待决策' }}
        </span>
      </div>

      <div class="supplier-network-grid">
        <article
          v-for="candidate in supplierNetworkCandidates"
          :key="candidate.supplierName"
          class="supplier-candidate-card"
          :class="{ selected: supplierNetworkDecision?.selectedSupplierName === candidate.supplierName }"
        >
          <div class="candidate-topline">
            <strong>{{ candidate.supplierName }}</strong>
            <span>{{ supplierSlaStatusText(candidate.slaStatus) }}</span>
          </div>
          <div class="candidate-metrics">
            <span>绩效 {{ candidate.performanceScore }}</span>
            <span>准交 {{ candidate.onTimeRate }}%</span>
            <span>不良 {{ candidate.defectRate }}%</span>
            <span>{{ candidate.slaLeadTimeHours }}h SLA</span>
          </div>
          <p>{{ candidate.promiseDate }} 可供 {{ candidate.capacityQuantity }} 件，报价 ¥{{ candidate.quotedPrice }}</p>
          <em>{{ candidate.riskNote }}</em>
        </article>
      </div>

      <div class="supplier-network-actions">
        <button
          type="button"
          class="btn supplier-network-commit"
          :disabled="Boolean(supplierNetworkDecision)"
          @click="handleSupplierNetworkDecision"
        >
          选优供应商并生成 SLA 决策
        </button>
      </div>

      <div v-if="supplierNetworkDecision" class="supplier-network-trace">
        <span>网络决策</span>
        <strong>{{ supplierNetworkDecision.statusLabel }}</strong>
        <p>{{ supplierNetworkDecision.message }}</p>
        <code>{{ supplierNetworkDecision.traceId }}</code>
      </div>
    </section>

    <section
      v-if="outsourcingCommitment"
      class="outsourcing-receipt-panel"
      aria-label="外协承诺到货确认"
      aria-describedby="outsourcing-receipt-help"
    >
      <div class="outsourcing-receipt-heading">
        <div>
          <span class="eyebrow">外协协同</span>
          <h3>外协承诺到货确认与排产释放</h3>
        </div>
        <span class="risk-badge" :class="outsourcingCommitment.receiptTraceId ? 'mitigated' : 'ordered'">
          {{ outsourcingCommitment.statusLabel }}
        </span>
      </div>

      <div id="outsourcing-receipt-help" class="outsourcing-receipt-guidance">
        <p>
          确认外协到货前，请核对承诺追踪、外协厂、影响工单、到货责任人和排产释放路径。
          Before confirming outsourced receipt, verify commitment trace, partner, impacted work orders, receiver, and scheduling release path.
        </p>
        <nav aria-label="外协到货相关入口">
          <RouterLink to="/risk">风险预警 / Risk queue</RouterLink>
          <RouterLink to="/scheduling">AI 排产 / Scheduling</RouterLink>
          <RouterLink to="/report">报表证据 / Report evidence</RouterLink>
          <a href="#outsourcing-receipt-help">帮助 / Help</a>
        </nav>
      </div>

      <div class="outsourcing-receipt-grid">
        <article>
          <span>外协对象</span>
          <strong>{{ outsourcingCommitment.targetName }}</strong>
          <em>{{ outsourcingCommitment.affectedOrders }}</em>
        </article>
        <article>
          <span>外协厂</span>
          <strong>{{ outsourcingCommitment.partnerName }}</strong>
          <em>{{ outsourcingCommitment.promiseDate }} 承诺到货</em>
        </article>
        <article>
          <span>承诺追踪</span>
          <strong>{{ outsourcingCommitment.auditId }}</strong>
          <em>{{ outsourcingCommitment.traceId }}</em>
        </article>
      </div>

      <div class="outsourcing-receipt-actions">
        <button
          type="button"
          class="btn outsourcing-receive"
          :disabled="Boolean(outsourcingCommitment.receiptTraceId)"
          @click="handleConfirmOutsourcingArrival"
        >
          确认外协到货
        </button>
      </div>

      <div class="outsourcing-receipt-trace">
        <span>到货联动</span>
        <strong>{{ outsourcingCommitment.receiptTraceId ? '外协到货已确认' : '等待采购确认到货' }}</strong>
        <p>{{ outsourcingCommitment.receiptMessage ?? outsourcingCommitment.commitment }}</p>
        <code>{{ outsourcingCommitment.receiptTraceId ?? outsourcingCommitment.traceId }}</code>
      </div>
    </section>

    <section v-if="materialDispatch" class="material-supplier-panel" aria-label="异常分流供应商整改">
      <div class="material-supplier-heading">
        <div>
          <span class="eyebrow">异常分流接入</span>
          <h3>来料异常供应商整改与替代承诺</h3>
        </div>
        <span class="risk-badge ordered">待整改</span>
      </div>
      <div class="material-supplier-body">
        <article>
          <span>异常来源</span>
          <strong>{{ materialDispatch.title }}</strong>
          <em>{{ materialDispatch.traceId }}</em>
        </article>
        <article>
          <span>影响工单</span>
          <strong>{{ materialDispatch.affectedOrders }}</strong>
          <em>{{ materialDispatch.scheduleWindow }}</em>
        </article>
        <article>
          <span>采购动作</span>
          <strong>供应商 8D + 备用批次</strong>
          <em>{{ materialDispatch.owner }}</em>
        </article>
      </div>
      <button type="button" class="btn material-corrective" @click="handleMaterialSupplierCorrection">
        锁定供应商整改承诺
      </button>
    </section>

    <div class="board-body">
      <!-- 左侧列表 -->
      <div class="list-panel">
        <div class="panel-header">
          <span>采购订单</span>
          <span class="badge-count">{{ orders.length }}</span>
          <button class="btn btn-add" @click="showCreate = true">+ 新建</button>
        </div>
        <div class="list-items" role="listbox" aria-label="采购订单列表">
          <div
            v-for="o in orders"
            :key="o.id"
            class="list-item"
            :class="{ active: selected?.id === o.id }"
            role="option"
            tabindex="0"
            :aria-selected="selected?.id === o.id"
            :aria-label="purchaseOrderOptionLabel(o)"
            @click="selectOrder(o)"
            @keydown.enter.prevent="selectOrder(o)"
            @keydown.space.prevent="selectOrder(o)"
          >
            <div class="item-title">{{ o.orderNumber }}</div>
            <div class="item-sub">
              <span class="tag supplier">{{ o.supplierName }}</span>
              <span class="tag" :class="'st-' + o.status.toLowerCase()">{{ statusLabel(o.status) }}</span>
            </div>
            <div class="item-info">
              <span>{{ o.itemCount }} 项</span>
              <span class="amt">¥{{ fmtAmt(o.totalAmount) }}</span>
              <span class="date">{{ formatDate(o.orderDate) }}</span>
            </div>
          </div>
          <div v-if="!orders.length" class="empty-state">暂无采购订单</div>
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

      <!-- 右侧详情 -->
      <div class="detail-panel" v-if="selected">
        <div class="detail-header">
          <h3>{{ selected.orderNumber }}</h3>
          <span class="tag" :class="'st-' + selected.status.toLowerCase()">{{ statusLabel(selected.status) }}</span>
        </div>

        <div class="detail-meta">
          <div><label>供应商</label><span>{{ selected.supplierName }}</span></div>
          <div v-if="selected.supplierContact"><label>联系人</label><span>{{ selected.supplierContact }}</span></div>
          <div><label>订单日期</label><span>{{ formatDate(selected.orderDate) }}</span></div>
          <div><label>预计交货</label><span>{{ selected.expectedDeliveryDate ? formatDate(selected.expectedDeliveryDate) : '-' }}</span></div>
          <div><label>总金额</label><span class="amt">¥{{ fmtAmt(selected.totalAmount) }}</span></div>
          <div><label>创建人</label><span>{{ selected.createdBy }}</span></div>
        </div>
        <div v-if="selected.remark" class="detail-remark">备注: {{ selected.remark }}</div>

        <!-- 操作按钮 -->
        <div class="action-btns" v-if="selected.status !== 'Completed' && selected.status !== 'Cancelled'">
          <button v-if="selected.status === 'Draft'" class="btn act-submit" @click="handleSubmit">提交</button>
          <button v-if="selected.status === 'Submitted'" class="btn act-confirm" @click="handleConfirm">确认</button>
          <button v-if="selected.status === 'Confirmed' || selected.status === 'PartiallyReceived'" class="btn act-receive" @click="showReceive = true">收货</button>
          <button v-if="selected.status !== 'Cancelled'" class="btn act-cancel" @click="handleCancel">取消</button>
        </div>

        <!-- 物料明细 -->
        <h4>物料明细 ({{ selected.items.length }})</h4>
        <table class="items-table">
          <thead>
            <tr><th>物料</th><th>名称</th><th>数量</th><th>已收</th><th>单价</th><th>小计</th><th>预计</th></tr>
          </thead>
          <tbody>
            <tr v-for="i in selected.items" :key="i.id">
              <td class="code">{{ i.materialCode }}</td>
              <td>{{ i.materialName }}</td>
              <td>{{ i.quantity }} {{ i.unit }}</td>
              <td><span :class="i.receivedQuantity >= i.quantity ? 'rec-done' : 'rec-part'">{{ i.receivedQuantity }}</span></td>
              <td>¥{{ i.unitPrice }}</td>
              <td>¥{{ i.totalPrice }}</td>
              <td>{{ i.expectedDate ? formatDate(i.expectedDate) : '-' }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div v-else class="detail-panel empty">
        <div class="empty-state">选择一个采购订单查看详情</div>
      </div>
    </div>

    <!-- 新建对话框 -->
    <div v-if="showCreate" class="modal-overlay" @click.self="showCreate = false">
      <div
        class="modal-content wide"
        role="dialog"
        aria-modal="true"
        aria-labelledby="create-purchase-order-title"
      >
        <h3 id="create-purchase-order-title">新建采购订单</h3>
        <div class="form-row">
          <div class="form-group"><label>订单编号</label><input v-model="form.orderNumber" class="form-input" /></div>
          <div class="form-group"><label>供应商</label><input v-model="form.supplierName" class="form-input" /></div>
        </div>
        <div class="form-row">
          <div class="form-group"><label>联系人</label><input v-model="form.supplierContact" class="form-input" /></div>
          <div class="form-group"><label>预计交货</label><input v-model="form.expectedDeliveryDate" type="date" class="form-input" /></div>
        </div>
        <div class="form-group"><label>备注</label><input v-model="form.remark" class="form-input" /></div>

        <h4>物料项</h4>
        <div v-for="(item, idx) in form.items" :key="idx" class="form-line">
          <input v-model="item.materialCode" class="input-sm" placeholder="编码" />
          <input v-model="item.materialName" class="input-md" placeholder="名称" />
          <input v-model.number="item.quantity" type="number" class="input-xs" placeholder="数量" />
          <input v-model="item.unit" class="input-xs" placeholder="单位" />
          <input v-model.number="item.unitPrice" type="number" class="input-xs" placeholder="单价" />
          <button class="btn-del" @click="form.items.splice(idx, 1)">✕</button>
        </div>
        <button class="btn btn-add-line" @click="form.items.push({ materialCode: '', materialName: '', unit: '个', quantity: 1, unitPrice: 0 })">+ 添加行</button>

        <div class="modal-actions">
          <button class="btn btn-cancel" @click="showCreate = false">取消</button>
          <button class="btn btn-ok" :disabled="!form.orderNumber || !form.supplierName" @click="handleCreate">创建</button>
        </div>
      </div>
    </div>

    <!-- 收货对话框 -->
    <div v-if="showReceive && selected" class="modal-overlay" @click.self="showReceive = false">
      <div
        class="modal-content"
        role="dialog"
        aria-modal="true"
        aria-labelledby="receive-purchase-order-title"
      >
        <h3 id="receive-purchase-order-title">收货</h3>
        <div class="form-group">
          <label>物料</label>
          <select v-model="receiveMaterial" class="form-input">
            <option v-for="i in selected.items" :key="i.materialCode" :value="i.materialCode">
              {{ i.materialCode }} - {{ i.materialName }} (已收 {{ i.receivedQuantity }}/{{ i.quantity }})
            </option>
          </select>
        </div>
        <div class="form-group"><label>数量</label><input v-model.number="receiveQty" type="number" min="1" class="form-input" /></div>
        <div class="modal-actions">
          <button class="btn btn-cancel" @click="showReceive = false">取消</button>
          <button class="btn btn-ok" :disabled="!receiveMaterial || !receiveQty" @click="handleReceive">确认收货</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import type { PurchaseOrderSummary, PurchaseOrderDetail, CreatePurchaseOrderRequest } from '../../types/purchase'
import { getPurchaseList, getPurchaseById, createPurchaseOrder, submitPurchaseOrder, confirmPurchaseOrder, receivePurchaseOrder, cancelPurchaseOrder } from '../../api/purchase'
import { exportToCsv } from '../../utils/export'
import { formatDate } from '../../utils/date'
import { errorMessage } from '../../utils/error-message'
import { isOfflineDemoError } from '../../utils/offline-demo-mode'
import ShortageActionPanel, {
  type ShortageAction,
  type ShortageTrace,
} from './ShortageActionPanel.vue'
import {
  readSupplierNetworkDecision,
  readSupplierNetworkDecisionBackendFirst,
  readSupplyRiskEscalationBackendFirst,
  writeShortageRiskResolution,
  writeSupplierNetworkDecision,
  writeSupplyRiskEscalation,
  type SupplyRiskEscalation,
  type SupplierNetworkCandidate,
  type SupplierNetworkDecision,
} from '../../utils/shortage-risk-sync'
import {
  closeOtdEvidenceChainRecords,
  upsertOtdEvidenceChainRecord,
} from '../../utils/otd-evidence-chain-sync'
import { readAnomalyDispatchRecordByType, readAnomalyDispatchRecordByTypeBackendFirst, type AnomalyDispatchRecord } from '../../utils/anomaly-dispatch-sync'
import {
  closeAssistantRecoveryPurchaseAction,
  readAssistantRecoveryPackagesBackendFirst,
} from '../../utils/assistant-action-package-sync'
import {
  confirmOutsourcingCommitmentArrival,
  readLatestOutsourcingCommitmentPackage,
  readLatestOutsourcingCommitmentPackageBackendFirst,
  type OutsourcingCommitmentPackage,
} from '../../utils/outsourcing-commitment-sync'

const orders = ref<PurchaseOrderSummary[]>([])
const route = useRoute()
const currentPage = ref(1)
const pageSize = ref(10)
const totalCount = ref(0)
const totalPages = computed(() => Math.max(1, Math.ceil(totalCount.value / pageSize.value)))
const displayedPages = computed(() => {
  const tp = totalPages.value
  const cp = currentPage.value
  if (tp <= 7) return Array.from({ length: tp }, (_, i) => i + 1)
  const pages: (number | string)[] = [1]
  if (cp > 3) pages.push('...')
  const start = Math.max(2, cp - 1)
  const end = Math.min(tp - 1, cp + 1)
  for (let i = start; i <= end; i++) pages.push(i)
  if (cp < tp - 2) pages.push('...')
  if (tp > 1) pages.push(tp)
  return pages
})
function goToPage(p: number | string) {
  if (typeof p === "string") return
  if (p < 1 || p > totalPages.value) return
  currentPage.value = p
  refreshList()
}
const selected = ref<PurchaseOrderDetail | null>(null)
const auditFocus = computed(() => {
  const objectType = String(route.query.auditObjectType ?? '')
  const objectId = String(route.query.auditObjectId ?? '')
  const traceId = String(route.query.auditTraceId ?? '')
  const label = String(route.query.auditObjectLabel ?? objectId)
  if (objectType !== 'purchase-order' || !objectId || !traceId) return null
  return { objectType, objectId, traceId, label }
})
const showCreate = ref(false)
const showReceive = ref(false)
const receiveMaterial = ref('')
const receiveQty = ref(1)
const notification = ref('')
const startupSyncFailures = ref<string[]>([])
const operationNotification = ref('')
const form = ref<CreatePurchaseOrderRequest>({
  orderNumber: '', supplierName: '', supplierContact: '', expectedDeliveryDate: '', remark: '', createdBy: 'operator1',
  items: [],
})
const expediteOrderId = ref('')
const shortageTrace = ref<ShortageTrace | null>(null)
type SupplyRiskDecision = 'open' | 'escalated' | 'alternate_committed' | 'alternate_received'

const supplyRiskDecision = ref<SupplyRiskDecision>('open')
const supplyRiskTrace = ref<{ title: string; detail: string; traceId: string } | null>(null)
const supplierNetworkDecision = ref<SupplierNetworkDecision | null>(null)
const outsourcingCommitment = ref<OutsourcingCommitmentPackage | null>(null)
const materialDispatch = ref<AnomalyDispatchRecord | null>(null)
const shortageAction = ref<ShortageAction>({
  materialCode: 'M-AL-6061',
  materialName: '铝合金 6061',
  shortageQuantity: 12,
  availableQuantity: 0,
  unit: '件',
  affectedOrders: 'WO-RUSH-9001 / WO-DEMO-1002',
  scheduleWindow: '锁定期后 24 小时',
  recommendation: '采购加急或替代料',
  supplierName: '华东铝材快供',
  alternateMaterialCode: 'M-AL-6061B',
  alternateMaterialName: '铝合金 6061B',
  status: 'open',
})
const supplyRisk = {
  purchaseOrderNumber: 'PO-20260502',
  materialCode: 'MAT-B02',
  materialName: '花键套',
  supplierName: '南方钢材集团',
  originalDeliveryDate: '2026-05-25',
  promisedDeliveryDate: '2026-05-28',
  delayDays: 3,
  affectedOrders: 'WO-DEMO-1002 / WO-DEMO-1005',
  alternateSupplierName: '华东快供二厂',
  alternatePromiseDate: '2026-05-24',
  alternateReceivedQuantity: 180,
  unit: '件',
}
const supplyRiskStatusText = computed(() => {
  if (supplyRiskDecision.value === 'alternate_received') return '替代已到货'
  if (supplyRiskDecision.value === 'alternate_committed') return '替代已锁定'
  if (supplyRiskDecision.value === 'escalated') return '已升级'
  return '待识别'
})
const supplyRiskStatusClass = computed(() => {
  if (supplyRiskDecision.value === 'alternate_received') return 'mitigated'
  if (supplyRiskDecision.value === 'alternate_committed') return 'mitigated'
  if (supplyRiskDecision.value === 'escalated') return 'ordered'
  return 'open'
})
const supplierNetworkCandidates: SupplierNetworkCandidate[] = [
  {
    supplierName: '华东快供二厂',
    promiseDate: '2026-05-24 10:00',
    quotedPrice: 118,
    capacityQuantity: 180,
    onTimeRate: 96,
    defectRate: 0.8,
    performanceScore: 92,
    slaLeadTimeHours: 24,
    slaStatus: 'healthy',
    riskNote: '本周已有稳定到货批次，适合锁定恢复交期。',
  },
  {
    supplierName: '北方精密协作厂',
    promiseDate: '2026-05-25 16:00',
    quotedPrice: 112,
    capacityQuantity: 220,
    onTimeRate: 88,
    defectRate: 1.6,
    performanceScore: 81,
    slaLeadTimeHours: 36,
    slaStatus: 'watch',
    riskNote: '价格更低但准交波动，需要保留二供观察。',
  },
  {
    supplierName: '南方钢材集团',
    promiseDate: '2026-05-28 18:00',
    quotedPrice: 109,
    capacityQuantity: 300,
    onTimeRate: 73,
    defectRate: 2.8,
    performanceScore: 64,
    slaLeadTimeHours: 96,
    slaStatus: 'breached',
    riskNote: '原供应商已触发延期，SLA 违约需进入绩效扣分。',
  },
]
const preferredSupplier = supplierNetworkCandidates.reduce((best, candidate) =>
  candidate.performanceScore > best.performanceScore ? candidate : best
)

function supplierSlaStatusText(status: SupplierNetworkCandidate['slaStatus']) {
  const map = {
    breached: 'SLA 违约',
    watch: 'SLA 观察',
    healthy: 'SLA 健康',
  }
  return map[status]
}

const demoOrders: PurchaseOrderSummary[] = [
  { id: 'po1', orderNumber: 'PO-20260501', supplierName: '华东轴承有限公司', status: 'Confirmed', orderDate: '2026-05-01T00:00:00', expectedDeliveryDate: '2026-05-20', totalAmount: 45000, itemCount: 3, createdBy: 'admin', createdAt: '2026-05-01T00:00:00' },
  { id: 'po2', orderNumber: 'PO-20260502', supplierName: '南方钢材集团', status: 'Submitted', orderDate: '2026-05-08T00:00:00', expectedDeliveryDate: '2026-05-25', totalAmount: 128000, itemCount: 2, createdBy: 'admin', createdAt: '2026-05-08T00:00:00' },
  { id: 'po3', orderNumber: 'PO-20260403', supplierName: '精密保持架厂', status: 'PartiallyReceived', orderDate: '2026-04-20T00:00:00', expectedDeliveryDate: '2026-05-10', totalAmount: 8600, itemCount: 1, createdBy: 'admin', createdAt: '2026-04-20T00:00:00' },
  { id: 'po4', orderNumber: 'PO-20260401', supplierName: '新华润滑科技有限公司', status: 'Completed', orderDate: '2026-04-01T00:00:00', expectedDeliveryDate: '2026-04-15', totalAmount: 12500, itemCount: 2, createdBy: 'admin', createdAt: '2026-04-01T00:00:00' },
]

const demoDetail: Record<string, PurchaseOrderDetail> = {
  po1: {
    id: 'po1', orderNumber: 'PO-20260501', supplierName: '华东轴承有限公司', supplierContact: '张经理', status: 'Confirmed',
    orderDate: '2026-05-01T00:00:00', expectedDeliveryDate: '2026-05-20', completedDate: null, totalAmount: 45000,
    remark: '紧急订单，请尽快发货', createdBy: 'admin', createdAt: '2026-05-01T00:00:00', updatedAt: '2026-05-02T00:00:00',
    items: [
      { id: 'l1', materialCode: 'MAT-A01', materialName: '轴承钢圈', unit: '个', quantity: 2000, receivedQuantity: 0, unitPrice: 15, totalPrice: 30000, expectedDate: '2026-05-20', remark: null },
      { id: 'l2', materialCode: 'MAT-A02', materialName: '滚珠 φ8mm', unit: '颗', quantity: 50000, receivedQuantity: 0, unitPrice: 0.2, totalPrice: 10000, expectedDate: '2026-05-20', remark: null },
      { id: 'l3', materialCode: 'MAT-A04', materialName: '密封圈', unit: '个', quantity: 5000, receivedQuantity: 0, unitPrice: 1, totalPrice: 5000, expectedDate: '2026-05-20', remark: null },
    ],
  },
  po2: {
    id: 'po2', orderNumber: 'PO-20260502', supplierName: '南方钢材集团', supplierContact: null, status: 'Submitted',
    orderDate: '2026-05-08T00:00:00', expectedDeliveryDate: '2026-05-25', completedDate: null, totalAmount: 128000,
    remark: null, createdBy: 'admin', createdAt: '2026-05-08T00:00:00', updatedAt: null,
    items: [
      { id: 'l4', materialCode: 'MAT-B01', materialName: '轴坯 45#钢', unit: '根', quantity: 500, receivedQuantity: 0, unitPrice: 200, totalPrice: 100000, expectedDate: '2026-05-25', remark: null },
      { id: 'l5', materialCode: 'MAT-C01', materialName: '阀体铸件', unit: '件', quantity: 200, receivedQuantity: 0, unitPrice: 140, totalPrice: 28000, expectedDate: '2026-05-25', remark: null },
    ],
  },
  po3: {
    id: 'po3', orderNumber: 'PO-20260403', supplierName: '精密保持架厂', supplierContact: '李工', status: 'PartiallyReceived',
    orderDate: '2026-04-20T00:00:00', expectedDeliveryDate: '2026-05-10', completedDate: null, totalAmount: 8600,
    remark: null, createdBy: 'admin', createdAt: '2026-04-20T00:00:00', updatedAt: '2026-05-05T00:00:00',
    items: [
      { id: 'l6', materialCode: 'MAT-A03', materialName: '保持架', unit: '个', quantity: 500, receivedQuantity: 300, unitPrice: 17.2, totalPrice: 8600, expectedDate: '2026-05-10', remark: null },
    ],
  },
  po4: {
    id: 'po4', orderNumber: 'PO-20260401', supplierName: '新华润滑科技有限公司', supplierContact: null, status: 'Completed',
    orderDate: '2026-04-01T00:00:00', expectedDeliveryDate: '2026-04-15', completedDate: '2026-04-14', totalAmount: 12500,
    remark: '常规补货', createdBy: 'admin', createdAt: '2026-04-01T00:00:00', updatedAt: '2026-04-14T00:00:00',
    items: [
      { id: 'l7', materialCode: 'MAT-A05', materialName: '润滑脂', unit: 'kg', quantity: 200, receivedQuantity: 200, unitPrice: 50, totalPrice: 10000, expectedDate: '2026-04-15', remark: null },
      { id: 'l8', materialCode: 'MAT-A04', materialName: '密封圈', unit: '个', quantity: 2500, receivedQuantity: 2500, unitPrice: 1, totalPrice: 2500, expectedDate: '2026-04-15', remark: null },
    ],
  },
}

function handleExport() {
  exportToCsv('采购订单列表', ['订单号', '供应商', '状态', '金额', '订单日期', '预计交货', '创建人'], orders.value.map(o => [
    o.orderNumber, o.supplierName, o.status, o.totalAmount, o.orderDate?.slice(0, 10) || '', o.expectedDeliveryDate?.slice(0, 10) || '', o.createdBy
  ]))
}

function statusLabel(s: string) {
  const map: Record<string, string> = { draft: '草稿', submitted: '已提交', confirmed: '已确认', partiallyreceived: '部分收货', completed: '已完成', cancelled: '已取消' }
  return map[s.toLowerCase()] || s
}

function purchaseOrderOptionLabel(o: PurchaseOrderSummary) {
  return `${o.orderNumber}，${o.supplierName}，${statusLabel(o.status)}，${o.itemCount} 项`
}

function appendStartupSyncFailure(message: string) {
  startupSyncFailures.value = [...startupSyncFailures.value, message]
  syncNotification()
}

function setNotification(message: string) {
  operationNotification.value = message
  syncNotification()
}

function clearNotification() {
  operationNotification.value = ''
  syncNotification()
}

function syncNotification() {
  notification.value = [
    ...startupSyncFailures.value,
    operationNotification.value,
  ].filter(Boolean).join('；')
}

function applyLocalStartupEvidence() {
  try {
    supplierNetworkDecision.value = readSupplierNetworkDecision()
  } catch (error: unknown) {
    appendStartupSyncFailure(`供应网络本地决策读取失败：${errorMessage(error, '请稍后重试')}`)
  }
  try {
    outsourcingCommitment.value = readLatestOutsourcingCommitmentPackage()
  } catch (error: unknown) {
    appendStartupSyncFailure(`外协承诺本地读取失败：${errorMessage(error, '请稍后重试')}`)
  }
  try {
    materialDispatch.value = readAnomalyDispatchRecordByType('material')
  } catch (error: unknown) {
    appendStartupSyncFailure(`异常分流本地供应整改读取失败：${errorMessage(error, '请稍后重试')}`)
  }
}

async function selectOrder(o: PurchaseOrderSummary) {
  try {
    selected.value = await getPurchaseById(o.id)
    if (operationNotification.value.startsWith('采购订单详情加载失败')) clearNotification()
  } catch (error: unknown) {
    setNotification(`采购订单详情加载失败，已保留当前列表状态：${errorMessage(error, '请稍后重试')}`)
    selected.value = demoDetail[o.id] || null
  }
}

async function handleCreate() {
  clearNotification()
  try { await createPurchaseOrder(form.value) }
  catch (error) {
    setNotification(`创建失败：${errorMessage(error, '请稍后重试')}`)
    return
  }
  showCreate.value = false
}

async function handleSubmit() {
  if (!selected.value) return
  clearNotification()
  try { selected.value = await submitPurchaseOrder(selected.value.id) }
  catch (error) {
    setNotification(`提交失败：${errorMessage(error, '请稍后重试')}`)
    return
  }
  await refreshList()
}

async function handleConfirm() {
  if (!selected.value) return
  clearNotification()
  try { selected.value = await confirmPurchaseOrder(selected.value.id) }
  catch (error) {
    setNotification(`确认失败：${errorMessage(error, '请稍后重试')}`)
    return
  }
  await refreshList()
  orders.value = orders.value.map(order =>
    order.id === selected.value?.id
      ? {
          ...order,
          supplierName: selected.value.supplierName,
          status: selected.value.status,
          orderDate: selected.value.orderDate,
          expectedDeliveryDate: selected.value.expectedDeliveryDate,
          totalAmount: selected.value.totalAmount,
          itemCount: selected.value.items.length,
          createdBy: selected.value.createdBy,
          createdAt: selected.value.createdAt,
        }
      : order
  )
}

async function handleReceive() {
  if (!selected.value || !receiveMaterial.value) return
  clearNotification()
  try { selected.value = await receivePurchaseOrder(selected.value.id, { materialCode: receiveMaterial.value, quantity: receiveQty.value }) }
  catch (error) {
    setNotification(`收货失败：${errorMessage(error, '请稍后重试')}`)
    return
  }
  showReceive.value = false
  await refreshList()
}

async function handleCancel() {
  if (!selected.value) return
  clearNotification()
  try { await cancelPurchaseOrder(selected.value.id) }
  catch (error) {
    setNotification(`取消失败：${errorMessage(error, '请稍后重试')}`)
    return
  }
  selected.value = { ...selected.value, status: 'Cancelled', completedDate: new Date().toISOString() }
  await refreshList()
}

async function handleExpediteShortage() {
  const orderNumber = `PO-RUSH-${new Date().getFullYear()}0519`
  const request: CreatePurchaseOrderRequest = {
    orderNumber,
    supplierName: shortageAction.value.supplierName,
    supplierContact: '应急采购专员',
    expectedDeliveryDate: '2026-05-20',
    remark: `由缺料事件自动生成：${shortageAction.value.affectedOrders}`,
    createdBy: 'scheduler-agent',
    items: [
      {
        materialCode: shortageAction.value.materialCode,
        materialName: shortageAction.value.materialName,
        unit: shortageAction.value.unit,
        quantity: shortageAction.value.shortageQuantity,
        unitPrice: 128,
        expectedDate: '2026-05-20',
        remark: '排产缺料加急',
      },
    ],
  }

  let detail: PurchaseOrderDetail
  try {
    detail = await createPurchaseOrder(request)
  } catch {
    detail = {
      id: 'po-rush-al6061',
      orderNumber,
      supplierName: request.supplierName,
      supplierContact: request.supplierContact ?? null,
      status: 'Confirmed',
      orderDate: new Date().toISOString(),
      expectedDeliveryDate: request.expectedDeliveryDate ?? null,
      completedDate: null,
      totalAmount: request.items[0].quantity * request.items[0].unitPrice,
      remark: request.remark ?? null,
      createdBy: request.createdBy,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      items: request.items.map((item, index) => ({
        id: `rush-line-${index}`,
        materialCode: item.materialCode,
        materialName: item.materialName,
        unit: item.unit,
        quantity: item.quantity,
        receivedQuantity: 0,
        unitPrice: item.unitPrice,
        totalPrice: item.quantity * item.unitPrice,
        expectedDate: item.expectedDate ?? null,
        remark: item.remark ?? null,
      })),
    }
  }

  expediteOrderId.value = detail.id
  shortageAction.value.status = 'ordered'
  selected.value = detail
  orders.value = [
    {
      id: detail.id,
      orderNumber: detail.orderNumber,
      supplierName: detail.supplierName,
      status: detail.status,
      orderDate: detail.orderDate,
      expectedDeliveryDate: detail.expectedDeliveryDate,
      totalAmount: detail.totalAmount,
      itemCount: detail.items.length,
      createdBy: detail.createdBy,
      createdAt: detail.createdAt,
    },
    ...orders.value.filter(order => order.id !== detail.id),
  ]
  totalCount.value = Math.max(totalCount.value, orders.value.length)
  shortageTrace.value = {
    title: '已生成采购加急单',
    detail: `${detail.orderNumber} 已锁定 ${shortageAction.value.shortageQuantity} ${shortageAction.value.unit} ${shortageAction.value.materialCode}，预计 2026-05-20 到料。`,
  }
}

function handleAlternateMaterial() {
  shortageTrace.value = {
    title: '已生成替代料建议',
    detail: `${shortageAction.value.alternateMaterialCode} 可替代 ${shortageAction.value.materialCode}，建议工程确认后释放 WO-RUSH-9001 排产约束。`,
  }
}

function buildSupplyRiskRecord(decision: Exclude<SupplyRiskDecision, 'open'>): SupplyRiskEscalation {
  const auditId = decision === 'alternate_received'
    ? 'AUD-PUR-SUPPLY-ALT-RECEIPT-20260521-001'
    : decision === 'alternate_committed'
    ? 'AUD-PUR-SUPPLY-ALT-20260521-001'
    : 'AUD-PUR-SUPPLY-RISK-20260521-001'
  const traceId = decision === 'alternate_received'
    ? 'TRACE-PUR-MAT-B02-ALT-SUPPLIER-RECEIVED'
    : decision === 'alternate_committed'
    ? 'TRACE-PUR-MAT-B02-ALT-SUPPLIER-COMMITTED'
    : 'TRACE-PUR-MAT-B02-SUPPLY-RISK-ESCALATED'
  const statusLabel = decision === 'alternate_received'
    ? '替代已到货'
    : decision === 'alternate_committed'
      ? '替代已锁定'
      : '已升级'
  const message = decision === 'alternate_received'
    ? `${supplyRisk.alternateSupplierName} 已按 ${supplyRisk.alternatePromiseDate} 承诺到货，${supplyRisk.affectedOrders} 的 ${supplyRisk.materialCode} 供应风险关闭，可释放排产复核。`
    : decision === 'alternate_committed'
      ? `${supplyRisk.alternateSupplierName} 已承诺 ${supplyRisk.alternatePromiseDate} 到料，${supplyRisk.affectedOrders} 可从供应延期转为排产复核。`
      : `${supplyRisk.supplierName} 将 ${supplyRisk.materialCode} 从 ${supplyRisk.originalDeliveryDate} 推迟到 ${supplyRisk.promisedDeliveryDate}，${supplyRisk.affectedOrders} 需进入供应风险复核。`

  return {
    ...supplyRisk,
    decision,
    statusLabel,
    auditId,
    traceId,
    message,
    createdAt: new Date().toISOString(),
  }
}

function handleEscalateSupplyRisk() {
  const record = buildSupplyRiskRecord('escalated')
  try {
    writeSupplyRiskEscalation(record)
    upsertOtdEvidenceChainRecord({
      id: `supply-risk-${record.materialCode}`,
      stage: '供应风险',
      title: `${record.materialCode} 供应延期已升级`,
      summary: `${record.purchaseOrderNumber} 原计划 ${record.originalDeliveryDate} 到料，供应商承诺延后到 ${record.promisedDeliveryDate}；${record.affectedOrders} 需排产复核。`,
      object: record.affectedOrders,
      source: `采购协同 / ${record.supplierName}`,
      traceId: record.traceId,
      status: 'active',
      statusLabel: record.statusLabel,
      createdAt: record.createdAt,
    })
  } catch (error: unknown) {
    setNotification(`供应风险升级失败，供应风险仍未关闭：${errorMessage(error, '请稍后重试')}`)
    return
  }
  supplyRiskDecision.value = 'escalated'
  supplyRiskTrace.value = {
    title: '供应延期已升级',
    detail: record.message,
    traceId: record.traceId,
  }
}

function handleCommitAlternateSupplier() {
  const record = buildSupplyRiskRecord('alternate_committed')
  try {
    writeSupplyRiskEscalation(record)
    upsertOtdEvidenceChainRecord({
      id: `supply-risk-${record.materialCode}`,
      stage: '供应风险',
      title: `${record.materialCode} 替代供应商已锁定`,
      summary: `${record.alternateSupplierName} 承诺 ${record.alternatePromiseDate} 到料，早于原供应商延后承诺 ${record.promisedDeliveryDate}；${record.affectedOrders} 可恢复排产复核。`,
      object: record.affectedOrders,
      source: `采购协同 / ${record.alternateSupplierName}`,
      traceId: record.traceId,
      status: 'closed',
      statusLabel: record.statusLabel,
      createdAt: record.createdAt,
    })
  } catch (error: unknown) {
    setNotification(`替代供应商锁定失败，供应风险仍未关闭：${errorMessage(error, '请稍后重试')}`)
    return
  }
  supplyRiskDecision.value = 'alternate_committed'
  supplyRiskTrace.value = {
    title: '替代供应商已锁定',
    detail: record.message,
    traceId: record.traceId,
  }
}

function handleReceiveAlternateSupplier() {
  const record = {
    ...buildSupplyRiskRecord('alternate_received'),
    receivedAt: '2026-05-24T10:00:00',
    receivedQuantity: supplyRisk.alternateReceivedQuantity,
    receiptAuditId: 'AUD-PUR-SUPPLY-ALT-RECEIPT-20260521-001',
    receiptTraceId: 'TRACE-PUR-MAT-B02-ALT-SUPPLIER-RECEIVED',
    receiptMessage: `${supplyRisk.alternateSupplierName} 已按 ${supplyRisk.alternatePromiseDate} 承诺到货 ${supplyRisk.alternateReceivedQuantity} ${supplyRisk.unit}，${supplyRisk.affectedOrders} 的 ${supplyRisk.materialCode} 供应风险关闭。`,
  }
  try {
    writeSupplyRiskEscalation(record)
    upsertOtdEvidenceChainRecord({
      id: `supply-risk-${record.materialCode}`,
      stage: '供应到货',
      title: `${record.materialCode} 替代供应商到货已确认`,
      summary: `${record.alternateSupplierName} 已按 ${record.alternatePromiseDate} 承诺到货 ${record.receivedQuantity} ${supplyRisk.unit}，${record.affectedOrders} 的供应风险关闭，AI 排产可释放复核。`,
      object: record.affectedOrders,
      source: `采购协同 / ${record.alternateSupplierName}`,
      traceId: record.receiptTraceId,
      status: 'closed',
      statusLabel: record.statusLabel,
      createdAt: record.createdAt,
    })
  } catch (error: unknown) {
    setNotification(`替代供应商到货确认失败，供应风险仍未关闭：${errorMessage(error, '请稍后重试')}`)
    return
  }
  supplyRiskDecision.value = 'alternate_received'
  supplyRiskTrace.value = {
    title: '替代到货已确认',
    detail: record.receiptMessage,
    traceId: record.receiptTraceId,
  }
}

function handleSupplierNetworkDecision() {
  if (supplierNetworkDecision.value) return
  const createdAt = new Date().toISOString()
  const record: SupplierNetworkDecision = {
    materialCode: supplyRisk.materialCode,
    materialName: supplyRisk.materialName,
    affectedOrders: supplyRisk.affectedOrders,
    selectedSupplierName: preferredSupplier.supplierName,
    selectedPromiseDate: preferredSupplier.promiseDate,
    selectedPerformanceScore: preferredSupplier.performanceScore,
    selectedOnTimeRate: preferredSupplier.onTimeRate,
    selectedQuotedPrice: preferredSupplier.quotedPrice,
    selectedCapacityQuantity: preferredSupplier.capacityQuantity,
    candidates: supplierNetworkCandidates,
    statusLabel: '供应网络已选优',
    auditId: 'AUD-PUR-SUPPLIER-NETWORK-20260521-001',
    traceId: 'TRACE-PUR-MAT-B02-SUPPLIER-NETWORK-SLA',
    message: `${preferredSupplier.supplierName} 以绩效 ${preferredSupplier.performanceScore}、准交 ${preferredSupplier.onTimeRate}% 和 ${preferredSupplier.slaLeadTimeHours}h SLA 成为 ${supplyRisk.materialCode} 首选恢复供应商；${supplyRisk.supplierName} 标记 SLA 违约，北方精密协作厂保留二供观察。`,
    createdAt,
  }
  try {
    writeSupplierNetworkDecision(record)
    upsertOtdEvidenceChainRecord({
      id: `supplier-network-${record.materialCode}`,
      stage: '供应网络',
      title: `${record.materialCode} 供应商绩效与 SLA 选优已确认`,
      summary: `${record.selectedSupplierName} 凭绩效 ${record.selectedPerformanceScore}、准交 ${record.selectedOnTimeRate}% 和 ${preferredSupplier.slaLeadTimeHours}h SLA 被选为恢复供应商；原供应商延期进入 SLA 违约复盘。`,
      object: record.affectedOrders,
      source: '采购协同 / 供应网络治理',
      traceId: record.traceId,
      status: 'closed',
      statusLabel: record.statusLabel,
      createdAt,
    })
  } catch (error: unknown) {
    setNotification(`供应网络选优失败，SLA 决策仍未生效：${errorMessage(error, '请稍后重试')}`)
    return
  }
  supplierNetworkDecision.value = record
}

function handleConfirmOutsourcingArrival() {
  if (!outsourcingCommitment.value) return
  try {
    const updated = confirmOutsourcingCommitmentArrival(outsourcingCommitment.value.sourceKpiId, '采购 王工')
    if (!updated) {
      setNotification('外协到货确认失败，外协承诺仍待到货：未找到可写入的外协承诺记录')
      return
    }
    outsourcingCommitment.value = updated
  } catch (error: unknown) {
    setNotification(`外协到货确认失败，外协承诺仍待到货：${errorMessage(error, '请稍后重试')}`)
  }
}

function handleMaterialSupplierCorrection() {
  if (!materialDispatch.value) return
  const dispatch = materialDispatch.value
  const createdAt = new Date().toISOString()
  const record: SupplyRiskEscalation = {
    purchaseOrderNumber: 'PO-MAT-BATCH-20260521',
    materialCode: 'LH-202605',
    materialName: '原料批次 LH-202605',
    supplierName: '原料批次供应商',
    originalDeliveryDate: '2026-05-21',
    promisedDeliveryDate: '2026-05-22',
    delayDays: 1,
    affectedOrders: dispatch.affectedOrders,
    alternateSupplierName: '备用批次 LH-202604B',
    alternatePromiseDate: '2026-05-21 16:00',
    decision: 'alternate_committed',
    statusLabel: '整改已锁定',
    auditId: dispatch.auditId,
    traceId: dispatch.traceId,
    message: `${dispatch.title} 已锁定供应商整改与备用批次复检承诺，${dispatch.affectedOrders} 转入排产复核。`,
    createdAt,
  }
  try {
    writeSupplyRiskEscalation(record)
    upsertOtdEvidenceChainRecord({
      id: `purchase-material-correction-${dispatch.anomalyId}`,
      stage: '采购整改',
      title: `${dispatch.title}供应商整改承诺已锁定`,
      summary: `${dispatch.traceId} 要求供应商提交 8D，备用批次 LH-202604B 今日 16:00 前复检入库，采购协同与库存齐套共同回写风险状态。`,
      object: dispatch.affectedOrders,
      source: `采购协同 / ${dispatch.owner}`,
      traceId: dispatch.traceId,
      status: 'active',
      statusLabel: '整改已锁定',
      createdAt,
    })
  } catch (error: unknown) {
    setNotification(`供应商整改承诺锁定失败，供应风险仍未关闭：${errorMessage(error, '请稍后重试')}`)
    return
  }
  supplyRiskDecision.value = 'alternate_committed'
  supplyRiskTrace.value = {
    title: '来料异常整改承诺已锁定',
    detail: `${dispatch.traceId} 已要求供应商提交 8D，备用批次 LH-202604B 今日 16:00 前复检入库，${dispatch.affectedOrders} 转入采购与排产联合复核。`,
    traceId: dispatch.traceId,
  }
}

async function applyStoredSupplyRiskEscalation() {
  const record = await readSupplyRiskEscalationBackendFirst()
  if (!record) return

  supplyRiskDecision.value = record.decision
  supplyRiskTrace.value = {
    title: record.decision === 'alternate_received'
      ? '替代到货已确认'
      : record.decision === 'alternate_committed'
        ? '替代供应商已锁定'
        : '供应延期已升级',
    detail: record.receiptMessage ?? record.message,
    traceId: record.receiptTraceId ?? record.traceId,
  }
}

async function handleReceiveExpedite() {
  if (!selected.value || !expediteOrderId.value) return
  const materialCode = shortageAction.value.materialCode
  const shortageQuantity = shortageAction.value.shortageQuantity
  const nextAvailableQuantity = shortageAction.value.availableQuantity + shortageQuantity
  let receivedDetail: PurchaseOrderDetail
  try {
    receivedDetail = await receivePurchaseOrder(expediteOrderId.value, {
      materialCode,
      quantity: shortageQuantity,
    })
  } catch {
    receivedDetail = {
      ...selected.value,
      status: 'Completed',
      completedDate: new Date().toISOString(),
      items: selected.value.items.map(item =>
        item.materialCode === materialCode
          ? { ...item, receivedQuantity: item.quantity }
          : item
      ),
    }
  }
  try {
    writeShortageRiskResolution({
      materialCode,
      materialName: shortageAction.value.materialName,
      affectedOrders: shortageAction.value.affectedOrders,
      sourceOrderNumber: receivedDetail.orderNumber,
      receivedQuantity: nextAvailableQuantity,
      unit: shortageAction.value.unit,
      availableQuantity: nextAvailableQuantity,
      resolvedAt: new Date().toLocaleString('zh-CN', { hour12: false }),
      message: `${materialCode} 加急收货完成，缺口清零，排产缺料风险从高风险降为可执行。`,
    })
    closeOtdEvidenceChainRecords(
      record =>
        record.stage === '库存齐套'
        && record.status !== 'closed'
        && record.traceId.includes(materialCode)
        && record.object.includes('WO-RUSH-9001'),
      {
        statusLabel: '采购收货已齐套',
        sourceTraceId: receivedDetail.orderNumber,
        summary: record => `${record.summary} 采购协同 ${receivedDetail.orderNumber} 已完成 ${materialCode} 加急收货，缺口清零，排产复核可释放冻结工序。`,
      }
    )
    upsertOtdEvidenceChainRecord({
      id: `purchase-receipt-${receivedDetail.orderNumber}`,
      stage: '采购回写',
      title: `${materialCode} 加急采购收货已释放缺料风险`,
      summary: `${receivedDetail.orderNumber} 收货完成，${shortageAction.value.affectedOrders} 的齐套缺口清零，排产复核可恢复执行。`,
      object: shortageAction.value.affectedOrders,
      source: `采购协同 / ${receivedDetail.supplierName}`,
      traceId: receivedDetail.orderNumber,
      status: 'closed',
      statusLabel: '已收货',
      createdAt: new Date().toISOString(),
    })
  } catch (error: unknown) {
    setNotification(`采购加急收货回写失败，缺料风险仍未关闭：${errorMessage(error, '请稍后重试')}`)
    return
  }
  selected.value = receivedDetail
  shortageAction.value.status = 'mitigated'
  shortageAction.value.availableQuantity = nextAvailableQuantity
  shortageAction.value.shortageQuantity = 0
  orders.value = orders.value.map(order =>
    order.id === receivedDetail.id
      ? { ...order, status: receivedDetail.status }
      : order
  )
  shortageTrace.value = {
    title: '采购收货已回写风险',
    detail: `${materialCode} 加急收货完成，缺口清零，排产缺料风险从高风险降为可执行。`,
  }
  try {
    const assistantRecoveryPackage = (await readAssistantRecoveryPackagesBackendFirst())
      .find(record => record.workOrders.includes('WO-RUSH-9001') && record.purchaseActionStatus !== 'closed')
    const assistantPurchaseClosure = assistantRecoveryPackage
      ? closeAssistantRecoveryPurchaseAction(assistantRecoveryPackage.id, '采购 王工', receivedDetail.orderNumber)
      : null
    if (assistantPurchaseClosure?.purchaseActionSummary) {
      shortageTrace.value = {
        title: '采购收货已回写风险',
        detail: `${materialCode} 加急收货完成，缺口清零，排产缺料风险从高风险降为可执行。${assistantPurchaseClosure.purchaseActionSummary}`,
      }
    }
  } catch (error: unknown) {
    setNotification(`采购收货已回写风险，但 AI 助手采购动作闭环失败：${errorMessage(error, '请稍后重试')}`)
  }
}

async function refreshList() {
  try {
    const result = await getPurchaseList(currentPage.value, pageSize.value)
    orders.value = result.items
    totalCount.value = result.totalCount
  } catch (error: unknown) {
    setNotification(`采购订单列表刷新失败，当前保留本地列表状态：${errorMessage(error, '请稍后重试')}`)
  }
}

function fmtAmt(n: number) { return n.toLocaleString('zh-CN', { minimumFractionDigits: 2 }) }

async function applyAuditFocus() {
  const focus = auditFocus.value
  if (!focus) return
  const matched = orders.value.find(order => order.id === focus.objectId || order.orderNumber === focus.label || order.orderNumber === focus.objectId)
  if (matched) {
    await selectOrder(matched)
    return
  }

  const orderNumber = focus.label || focus.objectId
  const detail: PurchaseOrderDetail = {
    id: focus.objectId,
    orderNumber,
    supplierName: '审计回放来源',
    supplierContact: null,
    status: 'Completed',
    orderDate: new Date().toISOString(),
    expectedDeliveryDate: null,
    completedDate: new Date().toISOString(),
    totalAmount: 0,
    remark: `由审计回放 ${focus.traceId} 定位的业务对象，当前列表未返回该采购单明细。`,
    createdBy: 'agent-audit',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    items: [],
  }
  selected.value = detail
  orders.value = [
    {
      id: detail.id,
      orderNumber: detail.orderNumber,
      supplierName: detail.supplierName,
      status: detail.status,
      orderDate: detail.orderDate,
      expectedDeliveryDate: detail.expectedDeliveryDate,
      totalAmount: detail.totalAmount,
      itemCount: detail.items.length,
      createdBy: detail.createdBy,
      createdAt: detail.createdAt,
    },
    ...orders.value,
  ]
}

onMounted(async () => {
  applyLocalStartupEvidence()
  await applyAuditFocus()
  try {
    await applyStoredSupplyRiskEscalation()
  } catch (error: unknown) {
    appendStartupSyncFailure(`供应风险状态同步失败：${errorMessage(error, '请稍后重试')}`)
  }
  try {
    supplierNetworkDecision.value = await readSupplierNetworkDecisionBackendFirst()
  } catch (error: unknown) {
    appendStartupSyncFailure(`供应网络决策同步失败：${errorMessage(error, '请稍后重试')}`)
  }
  try {
    outsourcingCommitment.value = await readLatestOutsourcingCommitmentPackageBackendFirst()
  } catch (error: unknown) {
    appendStartupSyncFailure(`外协承诺同步失败：${errorMessage(error, '请稍后重试')}`)
  }
  try {
    materialDispatch.value = await readAnomalyDispatchRecordByTypeBackendFirst('material')
  } catch (error: unknown) {
    appendStartupSyncFailure(`异常分流供应整改同步失败：${errorMessage(error, '请稍后重试')}`)
  }
  try {
    const result = await getPurchaseList(currentPage.value, pageSize.value)
    orders.value = result.items
    totalCount.value = result.totalCount
  } catch (error: unknown) {
    orders.value = demoOrders
    totalCount.value = demoOrders.length
    if (!isOfflineDemoError(error)) {
      appendStartupSyncFailure(`采购订单列表加载失败，已显示本地演示采购单：${errorMessage(error, '请稍后重试')}`)
    }
  } finally {
    await applyAuditFocus()
  }
})
</script>

<style scoped>
.po-board { min-height: 100%; display: flex; flex-direction: column; padding: 16px; }
.page-title { font-size: 16px; font-weight: 700; margin-bottom: 12px; }
.audit-focus-banner {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
  padding: 10px 12px;
  border: 1px solid #c7d2fe;
  border-radius: 6px;
  background: #eef2ff;
}
.audit-focus-banner span { display: block; color: #4338ca; font-size: 12px; font-weight: 700; }
.audit-focus-banner strong { display: block; color: #111827; font-size: 14px; }
.audit-focus-banner p { margin: 2px 0 0; color: #4b5563; font-size: 12px; }
.audit-focus-banner code { color: #3730a3; font-size: 12px; }
.board-body { flex: 0 0 auto; display: flex; gap: 16px; min-height: 520px; overflow: hidden; }
.list-panel { width: 380px; flex-shrink: 0; background: #fff; border-radius: 8px; display: flex; flex-direction: column; overflow: hidden; }
.panel-header { padding: 12px 16px; border-bottom: 1px solid #f0f0f0; font-weight: 600; display: flex; align-items: center; gap: 8px; }
.badge-count { background: #1890ff; color: #fff; font-size: 11px; padding: 1px 7px; border-radius: 10px; }
.btn-add { margin-left: auto; padding: 4px 12px; background: #1890ff; color: #fff; border: none; border-radius: 4px; cursor: pointer; font-size: 12px; }
.list-items { flex: 1; overflow-y: auto; }
.list-item { padding: 12px 16px; border-bottom: 1px solid #f5f5f5; cursor: pointer; }
.list-item:hover { background: #fafafa; }
.list-item.active { background: #e6f7ff; border-left: 3px solid #1890ff; }
.item-title { font-weight: 600; font-size: 13px; margin-bottom: 4px; }
.item-sub { display: flex; gap: 4px; margin-bottom: 4px; }
.tag { font-size: 11px; padding: 1px 6px; border-radius: 3px; background: #f5f5f5; color: #666; }
.tag.supplier { background: #e6f7ff; color: #1890ff; }
.tag.st-draft { background: #f5f5f5; color: #999; }
.tag.st-submitted { background: #e6f7ff; color: #1890ff; }
.tag.st-confirmed { background: #fffbe6; color: #faad14; }
.tag.st-partiallyreceived { background: #fff7e6; color: #fa8c16; }
.tag.st-completed { background: #f6ffed; color: #52c41a; }
.tag.st-cancelled { background: #fff2f0; color: #ff4d4f; }
.item-info { display: flex; gap: 8px; font-size: 12px; color: #999; }
.amt { color: #ff4d4f; font-weight: 600; }
.date { margin-left: auto; }

.detail-panel { flex: 1; background: #fff; border-radius: 8px; padding: 20px; overflow-y: auto; }
.detail-panel.empty { display: flex; align-items: center; justify-content: center; }
.empty-state { color: #bbb; font-size: 14px; text-align: center; padding: 40px; }
.detail-header { display: flex; align-items: center; gap: 8px; margin-bottom: 16px; }
.detail-header h3 { font-size: 16px; margin: 0; }
.detail-meta { display: grid; grid-template-columns: 1fr 1fr; gap: 6px 16px; margin-bottom: 12px; font-size: 13px; }
.detail-meta label { display: block; font-size: 11px; color: #999; }
.detail-remark { font-size: 12px; color: #888; padding: 8px; background: #fafafa; border-radius: 4px; margin-bottom: 12px; }

.action-btns { display: flex; gap: 8px; margin-bottom: 16px; }
.btn { padding: 6px 16px; border-radius: 4px; font-size: 13px; cursor: pointer; border: 1px solid #d9d9d9; background: #fff; }
.act-submit { background: #1890ff; color: #fff; border-color: #1890ff; }
.act-confirm { background: #52c41a; color: #fff; border-color: #52c41a; }
.act-receive { background: #faad14; color: #fff; border-color: #faad14; }
.act-cancel { background: #fff; color: #ff4d4f; border-color: #ffccc7; }

h4 { font-size: 13px; margin: 0 0 8px; }
.items-table { width: 100%; border-collapse: collapse; font-size: 12px; }
.items-table th { background: #fafafa; padding: 8px; text-align: left; font-weight: 600; border-bottom: 2px solid #f0f0f0; }
.items-table td { padding: 8px; border-bottom: 1px solid #f5f5f5; }
.items-table .code { color: #1890ff; font-family: monospace; font-size: 11px; }
.rec-done { color: #52c41a; font-weight: 600; }
.rec-part { color: #faad14; font-weight: 600; }

.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.3); z-index: 1100; display: flex; align-items: center; justify-content: center; }
.modal-content { background: #fff; border-radius: 8px; padding: 24px; width: 420px; max-width: 90vw; }
.modal-content.wide { width: 640px; }
.modal-content h3 { font-size: 16px; margin: 0 0 16px; }
.modal-content h4 { font-size: 13px; margin: 12px 0 8px; }
.form-row { display: flex; gap: 12px; }
.form-group { flex: 1; margin-bottom: 12px; }
.form-group label { display: block; font-size: 12px; color: #666; margin-bottom: 4px; }
.form-input { width: 100%; padding: 6px 10px; border: 1px solid #d9d9d9; border-radius: 4px; font-size: 13px; }
.form-line { display: flex; gap: 6px; margin-bottom: 6px; align-items: center; }
.input-xs { width: 70px; padding: 4px 6px; border: 1px solid #d9d9d9; border-radius: 4px; font-size: 12px; }
.input-sm { width: 100px; padding: 4px 6px; border: 1px solid #d9d9d9; border-radius: 4px; font-size: 12px; }
.input-md { flex: 1; padding: 4px 6px; border: 1px solid #d9d9d9; border-radius: 4px; font-size: 12px; }
.btn-del { background: none; border: none; color: #999; cursor: pointer; font-size: 14px; }
.btn-add-line { margin-top: 4px; font-size: 12px; background: none; border: 1px dashed #d9d9d9; color: #1890ff; cursor: pointer; padding: 4px 12px; border-radius: 4px; }
.modal-actions { display: flex; gap: 8px; justify-content: flex-end; margin-top: 16px; }
.btn-cancel { border: 1px solid #d9d9d9; background: #fff; }
.btn-ok { background: #1890ff; color: #fff; border: none; }
.btn-ok:disabled { background: #91d5ff; cursor: not-allowed; }
.pagination-bar { display: flex; align-items: center; gap: 4px; padding: 10px 16px; border-top: 1px solid #f0f0f0; flex-wrap: wrap; }
.page-btn { min-width: 28px; height: 28px; padding: 0 8px; border: 1px solid #d9d9d9; background: #fff; border-radius: 4px; font-size: 12px; cursor: pointer; }
.page-btn.active { background: #1890ff; color: #fff; border-color: #1890ff; }
.page-btn:disabled { color: #d9d9d9; cursor: not-allowed; }
.page-ellipsis { width: 28px; text-align: center; color: #999; font-size: 12px; }
.page-info { margin-left: auto; font-size: 12px; color: #999; }

.supply-risk-panel {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 14px;
  padding: 12px 14px;
  border: 1px solid #bfdbfe;
  border-radius: 8px;
  background: #f8fbff;
}

.supplier-network-panel {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 14px;
  padding: 12px 14px;
  border: 1px solid #bae6fd;
  border-radius: 8px;
  background: #f0f9ff;
}

.outsourcing-receipt-panel {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 14px;
  padding: 12px 14px;
  border: 1px solid #c7d2fe;
  border-radius: 8px;
  background: #f8faff;
}

.supply-risk-heading {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
}

.supplier-network-heading {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
}

.outsourcing-receipt-heading {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
}

.eyebrow {
  display: block;
  margin-bottom: 2px;
  color: #1d4ed8;
  font-size: 12px;
  font-weight: 700;
}

.supply-risk-heading h3,
.supplier-network-heading h3,
.outsourcing-receipt-heading h3,
.supply-risk-trace p,
.outsourcing-receipt-trace p {
  margin: 0;
}

.supply-risk-heading h3,
.supplier-network-heading h3,
.outsourcing-receipt-heading h3 {
  color: #111827;
  font-size: 16px;
}

.outsourcing-receipt-guidance {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 10px;
  align-items: center;
  padding: 9px 10px;
  border: 1px solid #c7d2fe;
  border-radius: 6px;
  background: #eef2ff;
  font-size: 12px;
}

.outsourcing-receipt-guidance p {
  margin: 0;
  color: #374151;
  line-height: 1.5;
}

.outsourcing-receipt-guidance nav {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 8px;
}

.outsourcing-receipt-guidance a {
  color: #1d4ed8;
  font-weight: 700;
  text-decoration: none;
  white-space: nowrap;
}

.risk-badge {
  flex: 0 0 auto;
  padding: 4px 9px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 700;
}

.risk-badge.open {
  background: #fff1f2;
  color: #be123c;
}

.risk-badge.ordered {
  background: #fffbeb;
  color: #b45309;
}

.risk-badge.mitigated {
  background: #f0fdf4;
  color: #15803d;
}

.supply-risk-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 8px;
}

.supplier-network-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 8px;
}

.outsourcing-receipt-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 8px;
}

.supply-risk-card {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-height: 66px;
  padding: 8px 10px;
  border: 1px solid #dbeafe;
  border-radius: 6px;
  background: #fff;
}

.supplier-candidate-card {
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-height: 118px;
  padding: 10px;
  border: 1px solid #bae6fd;
  border-radius: 6px;
  background: #fff;
}

.outsourcing-receipt-grid article {
  display: flex;
  flex-direction: column;
  gap: 3px;
  min-height: 74px;
  padding: 9px 10px;
  border: 1px solid #e0e7ff;
  border-radius: 6px;
  background: #fff;
}

.outsourcing-receipt-grid span,
.outsourcing-receipt-grid em,
.outsourcing-receipt-trace span,
.outsourcing-receipt-trace p {
  color: #6b7280;
  font-size: 12px;
  font-style: normal;
  line-height: 1.4;
}

.outsourcing-receipt-grid strong {
  color: #111827;
  font-size: 14px;
}

.supplier-candidate-card.selected {
  border-color: #22c55e;
  background: #f0fdf4;
  box-shadow: inset 0 0 0 1px #22c55e;
}

.candidate-topline,
.candidate-metrics,
.supplier-network-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
}

.outsourcing-receipt-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.candidate-topline {
  justify-content: space-between;
}

.candidate-topline span,
.candidate-metrics span {
  padding: 2px 6px;
  border-radius: 4px;
  background: #e0f2fe;
  color: #0369a1;
  font-size: 12px;
  font-weight: 700;
}

.supplier-candidate-card p,
.supplier-candidate-card em,
.supplier-network-trace p {
  margin: 0;
  color: #4b5563;
  font-size: 12px;
  font-style: normal;
  line-height: 1.4;
}

.supply-risk-card.danger {
  border-color: #fecaca;
  background: #fff1f2;
}

.supply-risk-card.alternate {
  border-color: #bbf7d0;
  background: #f0fdf4;
}

.supply-risk-card span,
.supply-risk-card em,
.supply-risk-trace span,
.supply-risk-trace p {
  color: #6b7280;
  font-size: 12px;
  font-style: normal;
}

.supply-risk-card strong {
  color: #111827;
  font-size: 15px;
}

.supply-risk-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.supply-escalate {
  background: #dc2626;
  border-color: #dc2626;
  color: #fff;
}

.supply-commit {
  background: #16a34a;
  border-color: #16a34a;
  color: #fff;
}

.supply-receive {
  background: #2563eb;
  border-color: #2563eb;
  color: #fff;
}

.supplier-network-commit {
  background: #0284c7;
  border-color: #0284c7;
  color: #fff;
}

.outsourcing-receive {
  background: #4f46e5;
  border-color: #4f46e5;
  color: #fff;
}

.outsourcing-receive:disabled {
  background: #c7d2fe;
  border-color: #c7d2fe;
  cursor: not-allowed;
}

.supply-risk-trace {
  display: flex;
  flex-direction: column;
  gap: 3px;
  padding: 8px 10px;
  border: 1px solid #bbf7d0;
  border-radius: 6px;
  background: #f0fdf4;
}

.supplier-network-trace {
  display: flex;
  flex-direction: column;
  gap: 3px;
  padding: 8px 10px;
  border: 1px solid #bae6fd;
  border-radius: 6px;
  background: #fff;
}

.outsourcing-receipt-trace {
  display: flex;
  flex-direction: column;
  gap: 3px;
  padding: 8px 10px;
  border: 1px solid #c7d2fe;
  border-radius: 6px;
  background: #fff;
}

.outsourcing-receipt-trace strong {
  color: #111827;
  font-size: 14px;
}

.supply-risk-trace.empty {
  border-color: #e5e7eb;
  background: #fff;
}

.supply-risk-trace strong {
  color: #111827;
  font-size: 14px;
}

.supply-risk-trace code,
.supplier-network-trace code,
.outsourcing-receipt-trace code {
  color: #1d4ed8;
  font-size: 12px;
}

.material-supplier-panel {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 14px;
  padding: 12px 14px;
  border: 1px solid #fde68a;
  border-radius: 8px;
  background: #fffbeb;
}

.material-supplier-heading {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: flex-start;
}

.material-supplier-heading h3 {
  margin: 0;
  color: #111827;
  font-size: 16px;
}

.material-supplier-body {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 8px;
}

.material-supplier-body article {
  display: flex;
  flex-direction: column;
  gap: 3px;
  min-height: 72px;
  padding: 9px 10px;
  border: 1px solid #fef3c7;
  border-radius: 6px;
  background: #fff;
}

.material-supplier-body span,
.material-supplier-body em {
  color: #6b7280;
  font-size: 12px;
  font-style: normal;
}

.material-supplier-body strong {
  color: #111827;
  font-size: 14px;
}

.material-corrective {
  align-self: flex-start;
  background: #b45309;
  border-color: #b45309;
  color: #fff;
}

@media (max-width: 1100px) {
  .outsourcing-receipt-guidance {
    grid-template-columns: 1fr;
  }

  .outsourcing-receipt-guidance nav {
    justify-content: flex-start;
  }

  .supply-risk-grid,
  .supplier-network-grid,
  .outsourcing-receipt-grid,
  .material-supplier-body {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>
