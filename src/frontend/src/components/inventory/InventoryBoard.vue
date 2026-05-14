<template>
  <div class="inv-board">
    <div class="page-header">
      <h2 class="page-title">库存管理</h2>
      <button class="btn btn-export" @click="handleExport" v-if="items.length">导出 CSV</button>
    </div>

    <!-- KPI -->
    <div class="kpi-row" v-if="dashboard">
      <div class="kpi-card"><label>物料总数</label><span class="num">{{ dashboard.totalMaterials }}</span></div>
      <div class="kpi-card warn"><label>低于安全库存</label><span class="num">{{ dashboard.lowStockCount }}</span></div>
      <div class="kpi-card danger"><label>库存为零</label><span class="num">{{ dashboard.outOfStockCount }}</span></div>
      <div class="kpi-card"><label>今日操作</label><span class="num">{{ dashboard.todayTransactions }}</span></div>
    </div>

    <div class="board-body">
      <!-- 左侧列表 -->
      <div class="list-panel">
        <div class="panel-header">
          <span>物料库存</span>
          <span class="badge-count">{{ items.length }}</span>
        </div>
        <div class="toolbar">
          <input v-model="search" class="search-input" placeholder="搜索物料编码/名称..." />
          <select v-model="typeFilter" class="filter-select">
            <option value="">全部类型</option>
            <option value="Raw">原材料</option>
            <option value="Semi">半成品</option>
            <option value="Finished">成品</option>
            <option value="Auxiliary">辅料</option>
          </select>
        </div>
        <div class="list-items">
          <div
            v-for="item in filteredItems"
            :key="item.materialCode"
            class="list-item"
            :class="{ active: selected?.materialCode === item.materialCode }"
            @click="selectItem(item)"
          >
            <div class="item-title">{{ item.materialName }}</div>
            <div class="item-sub">
              <span class="tag code">{{ item.materialCode }}</span>
              <span class="tag type">{{ item.materialType }}</span>
            </div>
            <div class="item-qty-row">
              <span class="qty-avail" :class="{ low: item.realQuantity <= item.safetyStock }">
                库存: {{ item.availableQuantity }} {{ item.unit }}
              </span>
              <span class="qty-safe">安全: {{ item.safetyStock }}</span>
            </div>
          </div>
          <div v-if="!filteredItems.length" class="empty-state">无匹配物料</div>
        </div>
      </div>

      <!-- 右侧详情 -->
      <div class="detail-panel" v-if="selected">
        <div class="detail-header">
          <h3>{{ selected.materialName }}</h3>
          <span class="tag code">{{ selected.materialCode }}</span>
        </div>

        <div class="stock-bar">
          <div class="bar-track">
            <div class="bar-fill" :class="stockLevelClass" :style="{ width: stockPercent + '%' }"></div>
          </div>
          <div class="bar-labels">
            <span>{{ selected.realQuantity }} {{ selected.unit }}</span>
            <span class="safe-mark">安全线: {{ selected.safetyStock }}</span>
          </div>
        </div>

        <div class="detail-meta">
          <div><label>类型</label><span>{{ selected.materialType }}</span></div>
          <div><label>单位</label><span>{{ selected.unit }}</span></div>
          <div><label>总库存</label><span>{{ selected.availableQuantity }}</span></div>
          <div><label>已预占</label><span>{{ selected.reservedQuantity }}</span></div>
          <div><label>可用量</label><span>{{ selected.realQuantity }}</span></div>
          <div><label>安全库存</label><span>{{ selected.safetyStock }}</span></div>
          <div><label>库位</label><span>{{ selected.storageLocation || '-' }}</span></div>
          <div v-if="selected.expiryDate"><label>有效期</label><span>{{ selected.expiryDate }}</span></div>
        </div>

        <!-- 操作按钮 -->
        <div class="action-btns">
          <button class="btn btn-in" @click="openDialog('in')">入库</button>
          <button class="btn btn-out" @click="openDialog('out')">出库</button>
          <button class="btn btn-trf" @click="openDialog('transfer')">调拨</button>
          <button class="btn btn-adj" @click="openDialog('adjust')">盘点</button>
        </div>

        <!-- 交易记录 -->
        <h4>交易记录</h4>
        <div class="tx-list">
          <div v-for="tx in transactions" :key="tx.id" class="tx-item">
            <div class="tx-header">
              <span class="tx-type" :class="'tp-' + tx.transactionType.toLowerCase()">{{ txLabel(tx.transactionType) }}</span>
              <span class="tx-qty" :class="tx.transactionType === 'StockIn' ? 'qty-in' : 'qty-out'">
                {{ tx.transactionType === 'StockIn' ? '+' : '-' }}{{ tx.quantity }}
              </span>
            </div>
            <div class="tx-body">
              <span>余额: {{ tx.balanceBefore }} → {{ tx.balanceAfter }}</span>
              <span v-if="tx.referenceNumber">参考: {{ tx.referenceNumber }}</span>
              <span v-if="tx.remark">备注: {{ tx.remark }}</span>
            </div>
            <div class="tx-meta">
              <span>{{ tx.operator || '-' }}</span>
              <span>{{ formatTime(tx.createdAt) }}</span>
            </div>
          </div>
          <div v-if="!transactions.length" class="no-data">暂无交易记录</div>
        </div>
      </div>
      <div v-else class="detail-panel empty">
        <div class="empty-state">选择一个物料查看库存详情</div>
      </div>
    </div>

    <!-- 操作对话框 -->
    <div v-if="dialog" class="modal-overlay" @click.self="dialog = null">
      <div class="modal-content">
        <h3>{{ dialogTitle }}</h3>
        <div class="form-group">
          <label>物料</label><span>{{ selected?.materialName }} ({{ selected?.materialCode }})</span>
        </div>
        <div class="form-group" v-if="dialog !== 'adjust'">
          <label>数量</label>
          <input v-model.number="dialogQty" type="number" min="1" class="form-input" />
        </div>
        <div class="form-group" v-if="dialog === 'adjust'">
          <label>新库存量</label>
          <input v-model.number="dialogQty" type="number" min="0" class="form-input" />
        </div>
        <div class="form-group" v-if="dialog === 'in'">
          <label>仓库</label><input v-model="dialogWarehouse" class="form-input" placeholder="主仓库" />
        </div>
        <div class="form-group" v-if="dialog === 'transfer'">
          <label>从仓库</label><input v-model="dialogFrom" class="form-input" />
          <label>到仓库</label><input v-model="dialogWarehouse" class="form-input" />
        </div>
        <div class="form-group">
          <label>备注</label><input v-model="dialogRemark" class="form-input" />
        </div>
        <div class="modal-actions">
          <button class="btn btn-cancel" @click="dialog = null">取消</button>
          <button class="btn btn-ok" @click="confirmDialog" :disabled="!dialogQty || dialogQty < 1">确认</button>
        </div>
        <div v-if="dialogError" class="error-msg">{{ dialogError }}</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import type { InventoryItem, StockTransaction, InventoryDashboard } from '../../types/inventory'
import { getInventoryDashboard, getInventoryList, getStockTransactions, stockIn, stockOut, transferStock, adjustStock } from '../../api/inventory'
import { exportToCsv } from '../../utils/export'

const dashboard = ref<InventoryDashboard | null>(null)
const items = ref<InventoryItem[]>([])
const selected = ref<InventoryItem | null>(null)
const transactions = ref<StockTransaction[]>([])
const search = ref('')
const typeFilter = ref('')
const dialog = ref<string | null>(null)
const dialogQty = ref(1)
const dialogWarehouse = ref('')
const dialogFrom = ref('')
const dialogRemark = ref('')
const dialogError = ref('')

const filteredItems = computed(() => {
  let list = items.value
  if (search.value) {
    const s = search.value.toLowerCase()
    list = list.filter(i => i.materialCode.toLowerCase().includes(s) || i.materialName.toLowerCase().includes(s))
  }
  if (typeFilter.value) list = list.filter(i => i.materialType === typeFilter.value)
  return list
})

const stockPercent = computed(() => {
  if (!selected.value || selected.value.safetyStock <= 0) return 100
  return Math.min(100, (selected.value.realQuantity / selected.value.safetyStock) * 100)
})

const stockLevelClass = computed(() => {
  if (!selected.value) return ''
  const ratio = selected.value.realQuantity / Math.max(selected.value.safetyStock, 1)
  if (ratio <= 0) return 'level-empty'
  if (ratio < 1) return 'level-low'
  if (ratio < 1.5) return 'level-ok'
  return 'level-high'
})

const dialogTitle = computed(() => {
  const map: Record<string, string> = { in: '入库', out: '出库', transfer: '调拨', adjust: '盘点调整' }
  return map[dialog.value || ''] || ''
})

const demoItems: InventoryItem[] = [
  { id: 'm1', materialCode: 'MAT-A01', materialName: '轴承钢圈', materialType: 'Raw', unit: '个', availableQuantity: 500, reservedQuantity: 50, realQuantity: 450, safetyStock: 200, storageLocation: 'A-01-01', expiryDate: null, createdAt: '2026-01-01T00:00:00' },
  { id: 'm2', materialCode: 'MAT-A02', materialName: '滚珠 φ8mm', materialType: 'Raw', unit: '颗', availableQuantity: 12000, reservedQuantity: 3000, realQuantity: 9000, safetyStock: 5000, storageLocation: 'A-01-02', expiryDate: null, createdAt: '2026-01-01T00:00:00' },
  { id: 'm3', materialCode: 'MAT-A03', materialName: '保持架', materialType: 'Semi', unit: '个', availableQuantity: 80, reservedQuantity: 10, realQuantity: 70, safetyStock: 100, storageLocation: 'B-02-01', expiryDate: null, createdAt: '2026-01-01T00:00:00' },
  { id: 'm4', materialCode: 'MAT-A04', materialName: '密封圈', materialType: 'Auxiliary', unit: '个', availableQuantity: 1500, reservedQuantity: 200, realQuantity: 1300, safetyStock: 500, storageLocation: 'A-03-01', expiryDate: null, createdAt: '2026-01-01T00:00:00' },
  { id: 'm5', materialCode: 'MAT-A05', materialName: '润滑脂', materialType: 'Auxiliary', unit: 'kg', availableQuantity: 45, reservedQuantity: 10, realQuantity: 35, safetyStock: 30, storageLocation: 'C-01-01', expiryDate: '2026-12-31', createdAt: '2026-01-01T00:00:00' },
  { id: 'm6', materialCode: 'MAT-B01', materialName: '轴坯 45#钢', materialType: 'Raw', unit: '根', availableQuantity: 200, reservedQuantity: 50, realQuantity: 150, safetyStock: 80, storageLocation: 'A-02-01', expiryDate: null, createdAt: '2026-01-01T00:00:00' },
  { id: 'm7', materialCode: 'MAT-B02', materialName: '花键套', materialType: 'Semi', unit: '个', availableQuantity: 0, reservedQuantity: 0, realQuantity: 0, safetyStock: 50, storageLocation: 'B-01-01', expiryDate: null, createdAt: '2026-01-01T00:00:00' },
  { id: 'm8', materialCode: 'MAT-C01', materialName: '阀体铸件', materialType: 'Raw', unit: '件', availableQuantity: 30, reservedQuantity: 5, realQuantity: 25, safetyStock: 40, storageLocation: 'A-04-01', expiryDate: null, createdAt: '2026-01-01T00:00:00' },
]

const demoTx: StockTransaction[] = [
  { id: 'tx1', materialCode: 'MAT-A01', materialName: '轴承钢圈', transactionType: 'StockIn', quantity: 500, balanceBefore: 0, balanceAfter: 500, referenceType: 'Purchase', referenceNumber: 'PO-20260501', warehouse: '主仓库', operator: 'admin', remark: '采购入库', createdAt: '2026-05-11T09:00:00' },
  { id: 'tx2', materialCode: 'MAT-A01', materialName: '轴承钢圈', transactionType: 'StockOut', quantity: 50, balanceBefore: 500, balanceAfter: 450, referenceType: 'WorkOrder', referenceNumber: 'WO-20260501', warehouse: null, operator: 'operator1', remark: '生产领料', createdAt: '2026-05-12T08:30:00' },
  { id: 'tx3', materialCode: 'MAT-A02', materialName: '滚珠 φ8mm', transactionType: 'StockIn', quantity: 15000, balanceBefore: 0, balanceAfter: 15000, referenceType: 'Purchase', referenceNumber: 'PO-20260415', warehouse: '主仓库', operator: 'admin', remark: null, createdAt: '2026-05-10T10:00:00' },
  { id: 'tx4', materialCode: 'MAT-A03', materialName: '保持架', transactionType: 'Adjustment', quantity: 20, balanceBefore: 100, balanceAfter: 80, referenceType: null, referenceNumber: null, warehouse: null, operator: 'admin', remark: '盘点发现实际库存80', createdAt: '2026-05-12T07:00:00' },
]

async function selectItem(item: InventoryItem) {
  selected.value = item
  try {
    transactions.value = await getStockTransactions(item.materialCode)
  } catch {
    transactions.value = demoTx.filter(t => t.materialCode === item.materialCode)
  }
}

function handleExport() {
  exportToCsv('库存物料列表', ['物料编码', '物料名称', '类型', '库存量', '已预占', '可用量', '安全库存', '库位', '单位'], items.value.map(i => [
    i.materialCode, i.materialName, i.materialType, i.availableQuantity, i.reservedQuantity, i.realQuantity, i.safetyStock, i.storageLocation || '', i.unit
  ]))
}

function openDialog(type: string) {
  dialog.value = type
  dialogQty.value = type === 'adjust' ? (selected.value?.availableQuantity || 0) : 1
  dialogWarehouse.value = ''
  dialogFrom.value = ''
  dialogRemark.value = ''
  dialogError.value = ''
}

async function confirmDialog() {
  if (!selected.value || !dialog.value) return
  dialogError.value = ''
  const code = selected.value.materialCode
  try {
    switch (dialog.value) {
      case 'in':
        await stockIn({ materialCode: code, quantity: dialogQty.value, warehouse: dialogWarehouse.value || undefined, remark: dialogRemark.value || undefined })
        break
      case 'out':
        await stockOut({ materialCode: code, quantity: dialogQty.value, remark: dialogRemark.value || undefined })
        break
      case 'transfer':
        await transferStock({ materialCode: code, quantity: dialogQty.value, fromWarehouse: dialogFrom.value, toWarehouse: dialogWarehouse.value, remark: dialogRemark.value || undefined })
        break
      case 'adjust':
        await adjustStock({ materialCode: code, newQuantity: dialogQty.value, remark: dialogRemark.value || undefined })
        break
    }
  } catch (e: any) {
    dialogError.value = e?.response?.data?.title || e?.message || '操作失败'
    return
  }
  dialog.value = null
  await loadData()
  if (selected.value) {
    const updated = items.value.find(i => i.materialCode === code)
    if (updated) selected.value = updated
  }
}

function txLabel(t: string) {
  const map: Record<string, string> = {
    stockin: '入库', stockout: '出库', transferin: '调拨入', transferout: '调拨出',
    adjustment: '盘点', reservation: '预占', reservationrelease: '释放',
  }
  return map[t.toLowerCase()] || t
}

function formatTime(t: string) { return t?.slice(0, 16).replace('T', ' ') || '' }

async function loadData() {
  try {
    dashboard.value = await getInventoryDashboard()
  } catch {
    const low = demoItems.filter(i => i.realQuantity <= i.safetyStock && i.availableQuantity > 0).length
    const out = demoItems.filter(i => i.availableQuantity <= 0).length
    dashboard.value = { totalMaterials: demoItems.length, lowStockCount: low, outOfStockCount: out, todayTransactions: 2 }
  }
  try {
    items.value = await getInventoryList()
  } catch {
    items.value = demoItems
  }
}

onMounted(loadData)
</script>

<style scoped>
.inv-board { height: 100%; display: flex; flex-direction: column; padding: 16px; }
.page-title { font-size: 16px; font-weight: 700; margin-bottom: 12px; }
.kpi-row { display: flex; gap: 12px; margin-bottom: 12px; }
.kpi-card { background: #fff; border-radius: 6px; padding: 12px 20px; flex: 1; border-left: 3px solid #1890ff; }
.kpi-card.warn { border-left-color: #faad14; }
.kpi-card.danger { border-left-color: #ff4d4f; }
.kpi-card label { display: block; font-size: 11px; color: #999; margin-bottom: 4px; }
.kpi-card .num { font-size: 24px; font-weight: 700; color: #333; }
.kpi-card.warn .num { color: #faad14; }
.kpi-card.danger .num { color: #ff4d4f; }

.board-body { flex: 1; display: flex; gap: 16px; overflow: hidden; }
.list-panel { width: 360px; flex-shrink: 0; background: #fff; border-radius: 8px; display: flex; flex-direction: column; overflow: hidden; }
.panel-header { padding: 12px 16px; border-bottom: 1px solid #f0f0f0; font-weight: 600; display: flex; align-items: center; gap: 8px; }
.badge-count { background: #1890ff; color: #fff; font-size: 11px; padding: 1px 7px; border-radius: 10px; }
.toolbar { display: flex; padding: 8px; gap: 6px; border-bottom: 1px solid #f5f5f5; }
.search-input { flex: 1; padding: 6px 10px; border: 1px solid #d9d9d9; border-radius: 4px; font-size: 12px; }
.filter-select { padding: 6px 8px; border: 1px solid #d9d9d9; border-radius: 4px; font-size: 12px; }
.list-items { flex: 1; overflow-y: auto; }
.list-item { padding: 12px 16px; border-bottom: 1px solid #f5f5f5; cursor: pointer; }
.list-item:hover { background: #fafafa; }
.list-item.active { background: #e6f7ff; border-left: 3px solid #1890ff; }
.item-title { font-weight: 600; font-size: 13px; margin-bottom: 4px; }
.item-sub { display: flex; gap: 4px; margin-bottom: 4px; }
.tag { font-size: 11px; padding: 1px 6px; border-radius: 3px; background: #f5f5f5; color: #666; }
.tag.code { background: #e6f7ff; color: #1890ff; }
.tag.type { background: #fff7e6; color: #fa8c16; }
.item-qty-row { display: flex; gap: 12px; font-size: 12px; }
.qty-avail { color: #333; }
.qty-avail.low { color: #ff4d4f; font-weight: 600; }
.qty-safe { color: #999; }

.detail-panel { flex: 1; background: #fff; border-radius: 8px; padding: 20px; overflow-y: auto; }
.detail-panel.empty { display: flex; align-items: center; justify-content: center; }
.empty-state { color: #bbb; font-size: 14px; text-align: center; }
.detail-header { display: flex; align-items: center; gap: 8px; margin-bottom: 12px; }
.detail-header h3 { font-size: 16px; margin: 0; }

.stock-bar { margin-bottom: 16px; }
.bar-track { height: 16px; background: #f0f0f0; border-radius: 8px; overflow: hidden; margin-bottom: 4px; }
.bar-fill { height: 100%; border-radius: 8px; transition: width 0.5s; }
.bar-fill.level-empty { background: #ff4d4f; }
.bar-fill.level-low { background: #faad14; }
.bar-fill.level-ok { background: #1890ff; }
.bar-fill.level-high { background: #52c41a; }
.bar-labels { display: flex; justify-content: space-between; font-size: 11px; color: #999; }
.safe-mark { color: #faad14; }

.detail-meta { display: grid; grid-template-columns: 1fr 1fr; gap: 6px 16px; margin-bottom: 16px; font-size: 13px; }
.detail-meta label { display: block; font-size: 11px; color: #999; }

.action-btns { display: flex; gap: 8px; margin-bottom: 20px; }
.btn { padding: 6px 16px; border-radius: 4px; font-size: 13px; cursor: pointer; border: 1px solid #d9d9d9; background: #fff; }
.btn:hover { border-color: #1890ff; color: #1890ff; }
.btn-in { background: #f6ffed; border-color: #b7eb8f; color: #52c41a; }
.btn-out { background: #fff2f0; border-color: #ffccc7; color: #ff4d4f; }
.btn-trf { background: #e6f7ff; border-color: #91d5ff; color: #1890ff; }
.btn-adj { background: #fffbe6; border-color: #ffe58f; color: #faad14; }

.tx-list { }
.tx-item { padding: 8px 0; border-bottom: 1px solid #f5f5f5; font-size: 13px; }
.tx-header { display: flex; align-items: center; gap: 8px; margin-bottom: 2px; }
.tx-type { font-size: 11px; padding: 1px 6px; border-radius: 3px; background: #f5f5f5; }
.tp-stockin { background: #f6ffed; color: #52c41a; }
.tp-stockout { background: #fff2f0; color: #ff4d4f; }
.tp-transferin { background: #e6f7ff; color: #1890ff; }
.tp-transferout { background: #e6f7ff; color: #1890ff; }
.tp-adjustment { background: #fffbe6; color: #faad14; }
.tx-qty { font-weight: 600; margin-left: auto; }
.qty-in { color: #52c41a; }
.qty-out { color: #ff4d4f; }
.tx-body { display: flex; gap: 12px; font-size: 12px; color: #888; margin-bottom: 2px; }
.tx-meta { display: flex; gap: 12px; font-size: 11px; color: #bbb; }
.no-data { color: #bbb; font-size: 12px; padding: 8px; }

/* 模态框 */
.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.3); z-index: 1100; display: flex; align-items: center; justify-content: center; }
.modal-content { background: #fff; border-radius: 8px; padding: 24px; width: 400px; max-width: 90vw; }
.modal-content h3 { font-size: 16px; margin: 0 0 16px; }
.form-group { margin-bottom: 12px; }
.form-group label { display: block; font-size: 12px; color: #666; margin-bottom: 4px; }
.form-input { width: 100%; padding: 6px 10px; border: 1px solid #d9d9d9; border-radius: 4px; font-size: 13px; }
.modal-actions { display: flex; gap: 8px; justify-content: flex-end; margin-top: 16px; }
.btn-cancel { border: 1px solid #d9d9d9; background: #fff; }
.btn-ok { background: #1890ff; color: #fff; border: none; }
.btn-ok:disabled { background: #91d5ff; cursor: not-allowed; }
.error-msg { color: #ff4d4f; font-size: 12px; margin-top: 8px; }
</style>
