<template>
  <div class="po-board">
    <div class="page-header">
      <h2 class="page-title">采购管理</h2>
      <button class="btn btn-export" @click="handleExport" v-if="orders.length">导出 CSV</button>
    </div>

    <div class="board-body">
      <!-- 左侧列表 -->
      <div class="list-panel">
        <div class="panel-header">
          <span>采购订单</span>
          <span class="badge-count">{{ orders.length }}</span>
          <button class="btn btn-add" @click="showCreate = true">+ 新建</button>
        </div>
        <div class="list-items">
          <div
            v-for="o in orders"
            :key="o.id"
            class="list-item"
            :class="{ active: selected?.id === o.id }"
            @click="selectOrder(o)"
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
      <div class="modal-content wide">
        <h3>新建采购订单</h3>
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
      <div class="modal-content">
        <h3>收货</h3>
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
import { ref, onMounted } from 'vue'
import type { PurchaseOrderSummary, PurchaseOrderDetail, CreatePurchaseOrderRequest } from '../../types/purchase'
import { getPurchaseList, getPurchaseById, createPurchaseOrder, submitPurchaseOrder, confirmPurchaseOrder, receivePurchaseOrder, cancelPurchaseOrder } from '../../api/purchase'
import { exportToCsv } from '../../utils/export'

const orders = ref<PurchaseOrderSummary[]>([])
const selected = ref<PurchaseOrderDetail | null>(null)
const showCreate = ref(false)
const showReceive = ref(false)
const receiveMaterial = ref('')
const receiveQty = ref(1)
const form = ref<CreatePurchaseOrderRequest>({
  orderNumber: '', supplierName: '', supplierContact: '', expectedDeliveryDate: '', remark: '', createdBy: 'operator1',
  items: [],
})

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

async function selectOrder(o: PurchaseOrderSummary) {
  try { selected.value = await getPurchaseById(o.id) }
  catch { selected.value = demoDetail[o.id] || null }
}

async function handleCreate() {
  try { await createPurchaseOrder(form.value) }
  catch { orders.value.unshift({ id: 'po-new', orderNumber: form.value.orderNumber, supplierName: form.value.supplierName, status: 'Draft', orderDate: new Date().toISOString(), expectedDeliveryDate: form.value.expectedDeliveryDate || null, totalAmount: form.value.items.reduce((s, i) => s + i.quantity * i.unitPrice, 0), itemCount: form.value.items.length, createdBy: 'operator1', createdAt: new Date().toISOString() }) }
  showCreate.value = false
}

async function handleSubmit() {
  if (!selected.value) return
  try { selected.value = await submitPurchaseOrder(selected.value.id) }
  catch { selected.value = { ...selected.value, status: 'Submitted', updatedAt: new Date().toISOString() } }
  await refreshList()
}

async function handleConfirm() {
  if (!selected.value) return
  try { selected.value = await confirmPurchaseOrder(selected.value.id) }
  catch { selected.value = { ...selected.value, status: 'Confirmed', updatedAt: new Date().toISOString() } }
  await refreshList()
}

async function handleReceive() {
  if (!selected.value || !receiveMaterial.value) return
  try { selected.value = await receivePurchaseOrder(selected.value.id, { materialCode: receiveMaterial.value, quantity: receiveQty.value }) }
  catch { /* demo */ }
  showReceive.value = false
  await refreshList()
}

async function handleCancel() {
  if (!selected.value) return
  try { await cancelPurchaseOrder(selected.value.id) }
  catch { /* demo */ }
  selected.value = { ...selected.value, status: 'Cancelled', completedDate: new Date().toISOString() }
  await refreshList()
}

async function refreshList() {
  try { orders.value = await getPurchaseList() }
  catch { /* keep demo */ }
}

function fmtAmt(n: number) { return n.toLocaleString('zh-CN', { minimumFractionDigits: 2 }) }
function formatDate(d: string) { return d?.slice(0, 10) || '' }

onMounted(async () => {
  try { orders.value = await getPurchaseList() }
  catch { orders.value = demoOrders }
})
</script>

<style scoped>
.po-board { height: 100%; display: flex; flex-direction: column; padding: 16px; }
.page-title { font-size: 16px; font-weight: 700; margin-bottom: 12px; }
.board-body { flex: 1; display: flex; gap: 16px; overflow: hidden; }
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
</style>
