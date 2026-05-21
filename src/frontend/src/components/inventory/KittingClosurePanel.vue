<template>
  <section class="kitting-panel" aria-label="工单齐套闭环">
    <div class="kitting-heading">
      <div>
        <span class="eyebrow">BOM + 库存 + 排产窗口</span>
        <h3>工单齐套闭环</h3>
      </div>
      <span class="shortage-badge">{{ shortageCount }} 个缺口</span>
    </div>

    <div class="kitting-grid">
      <article v-for="order in orders" :key="order.workOrderNumber" class="order-card" :class="order.status">
        <div class="order-topline">
          <span>{{ order.window }}</span>
          <strong>{{ statusText(order.status) }}</strong>
        </div>
        <h4>{{ order.workOrderNumber }} / {{ order.productName }}</h4>
        <p>{{ order.bomCode }} {{ order.bomVersion }}，排产时间窗 {{ order.scheduleWindow }}</p>

        <table class="kitting-table">
          <thead>
            <tr>
              <th>物料</th>
              <th>需要</th>
              <th>可用</th>
              <th>在途</th>
              <th>缺口</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in order.materials" :key="item.materialCode" :class="{ shortage: item.shortage > 0 }">
              <td>{{ item.materialCode }}</td>
              <td>{{ item.required }}{{ item.unit }}</td>
              <td>{{ item.available }}{{ item.unit }}</td>
              <td>{{ item.inbound }}{{ item.unit }}</td>
              <td>{{ item.shortage > 0 ? `${item.shortage}${item.unit}` : '0' }}</td>
            </tr>
          </tbody>
        </table>

        <div class="action-list">
          <span v-for="action in order.actions" :key="action">{{ action }}</span>
        </div>

        <button type="button" @click="publishShortage(order)" :disabled="order.status === 'ready'">
          生成缺料排产事件
        </button>
      </article>
    </div>

    <div class="time-window">
      <h4>排产时间窗缺料预测</h4>
      <div class="window-grid">
        <div v-for="window in windows" :key="window.label" class="window-card" :class="window.level">
          <strong>{{ window.label }}</strong>
          <span>{{ window.summary }}</span>
        </div>
      </div>
    </div>

    <section v-if="materialDispatch" class="material-dispatch-panel" aria-label="异常分流批次隔离">
      <div>
        <span class="eyebrow">异常分流接入</span>
        <h4>{{ materialDispatch.title }}</h4>
        <p>{{ materialDispatch.summary }}</p>
      </div>
      <div class="material-dispatch-grid">
        <span>影响：{{ materialDispatch.affectedOrders }}</span>
        <span>窗口：{{ materialDispatch.scheduleWindow }}</span>
        <span>负责人：{{ materialDispatch.owner }}</span>
      </div>
      <button type="button" @click="publishMaterialIsolation">
        生成批次隔离与齐套复核
      </button>
    </section>

    <div class="sync-note">
      <strong>{{ syncTitle }}</strong>
      <span>{{ syncMessage }}</span>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { writeShortageKittingEvent } from '../../utils/shortage-risk-sync'
import { upsertOtdEvidenceChainRecord } from '../../utils/otd-evidence-chain-sync'
import { readAnomalyDispatchRecordByType, type AnomalyDispatchRecord } from '../../utils/anomaly-dispatch-sync'

type KittingStatus = 'shortage' | 'warning' | 'ready'

interface KittingMaterial {
  materialCode: string
  materialName: string
  required: number
  available: number
  inbound: number
  shortage: number
  unit: string
}

interface KittingOrder {
  workOrderNumber: string
  productName: string
  bomCode: string
  bomVersion: string
  window: string
  scheduleWindow: string
  status: KittingStatus
  materials: KittingMaterial[]
  actions: string[]
}

const orders = ref<KittingOrder[]>([
  {
    workOrderNumber: 'WO-RUSH-9001',
    productName: '急单阀体组件',
    bomCode: 'BOM-A100',
    bomVersion: 'V1.0',
    window: '今天缺',
    scheduleWindow: '2026-05-20 14:00-22:00',
    status: 'shortage',
    materials: [
      { materialCode: 'M-AL-6061', materialName: '铝合金 6061', required: 64, available: 45, inbound: 20, shortage: 19, unit: '件' },
      { materialCode: 'M-SEAL-20', materialName: '密封圈 20', required: 32, available: 1300, inbound: 0, shortage: 0, unit: '件' },
    ],
    actions: ['调拨：从 A-03 库调 8 件', '替代料：M-AL-6061B 工程确认', '采购加急：今日 18:00 前补 20 件', '调整排产顺序：先做不缺料工序'],
  },
  {
    workOrderNumber: 'WO-DEMO-1002',
    productName: '传动轴总成 B',
    bomCode: 'BOM-B200',
    bomVersion: 'V2.1',
    window: '3 天后缺',
    scheduleWindow: '2026-05-23 08:00-18:00',
    status: 'warning',
    materials: [
      { materialCode: 'MAT-B01', materialName: '轴坯 45#钢', required: 120, available: 150, inbound: 0, shortage: 0, unit: '根' },
      { materialCode: 'MAT-B02', materialName: '花键套', required: 80, available: 0, inbound: 60, shortage: 20, unit: '个' },
    ],
    actions: ['采购催交：花键套在途 60 个', '替代料评估：外协花键套可临时替代', '调整排产顺序：先排 WO-DEMO-1001'],
  },
  {
    workOrderNumber: 'WO-DEMO-1005',
    productName: '轴承组件 A',
    bomCode: 'BOM-A100',
    bomVersion: 'V1.0',
    window: '7 天内齐套',
    scheduleWindow: '2026-05-26 09:00-17:00',
    status: 'ready',
    materials: [
      { materialCode: 'MAT-A01', materialName: '轴承钢圈', required: 180, available: 450, inbound: 0, shortage: 0, unit: '个' },
      { materialCode: 'MAT-A03', materialName: '保持架', required: 60, available: 70, inbound: 40, shortage: 0, unit: '个' },
    ],
    actions: ['可直接排产', '保留安全库存线', '装配前复核批次'],
  },
])

const syncTitle = ref('等待同步')
const syncMessage = ref('生成缺料排产事件后，AI 排产会读取齐套检查结果并给出重排建议。')
const materialDispatch = ref<AnomalyDispatchRecord | null>(readAnomalyDispatchRecordByType('material'))

const shortageCount = computed(() => orders.value.filter(order => order.status !== 'ready').length)
const windows = computed(() => [
  { label: '今天缺', level: 'critical', summary: 'WO-RUSH-9001 缺 M-AL-6061 19 件，需采购加急或替代料。' },
  { label: '3 天后缺', level: 'warning', summary: 'WO-DEMO-1002 花键套在途不足，需催交或调整顺序。' },
  { label: '7 天内', level: 'ready', summary: 'WO-DEMO-1005 齐套，可作为不缺料工单前置。' },
])

function statusText(status: KittingStatus) {
  return {
    shortage: '缺料',
    warning: '预警',
    ready: '齐套',
  }[status]
}

function publishShortage(order: KittingOrder) {
  const shortageItem = order.materials.find(item => item.shortage > 0)
  if (!shortageItem) return

  const event = {
    materialCode: shortageItem.materialCode,
    materialName: shortageItem.materialName,
    workOrderNumber: order.workOrderNumber,
    affectedOrders: order.workOrderNumber,
    requiredQuantity: shortageItem.required,
    availableQuantity: shortageItem.available,
    inboundQuantity: shortageItem.inbound,
    shortageQuantity: shortageItem.shortage,
    window: order.window,
    suggestion: order.actions.join('；'),
    createdAt: new Date().toISOString(),
  }
  writeShortageKittingEvent(event)
  upsertOtdEvidenceChainRecord({
    id: `inventory-kitting-${order.workOrderNumber}-${shortageItem.materialCode}`,
    stage: '库存齐套',
    title: `${shortageItem.materialCode} 工单齐套缺口已进入排产复核`,
    summary: `${order.workOrderNumber} 在 ${order.scheduleWindow} 需要 ${shortageItem.required}${shortageItem.unit}，当前可用 ${shortageItem.available}${shortageItem.unit}、在途 ${shortageItem.inbound}${shortageItem.unit}、缺口 ${shortageItem.shortage}${shortageItem.unit}。建议：${order.actions.join('；')}`,
    object: order.workOrderNumber,
    source: `库存齐套 / ${order.bomCode} ${order.bomVersion}`,
    traceId: `TRACE-KIT-${order.workOrderNumber}-${shortageItem.materialCode}`,
    status: 'active',
    statusLabel: '待齐套',
    createdAt: event.createdAt,
  })
  syncTitle.value = '缺料事件已同步 AI 排产'
  syncMessage.value = `${order.workOrderNumber} ${shortageItem.materialCode} 缺 ${shortageItem.shortage}${shortageItem.unit}，已进入事件触发 Agent。`
}

function publishMaterialIsolation() {
  if (!materialDispatch.value) return
  const dispatch = materialDispatch.value
  const event = {
    materialCode: 'LH-202605',
    materialName: '原料批次 LH-202605',
    workOrderNumber: dispatch.workOrderNumber,
    affectedOrders: dispatch.affectedOrders,
    requiredQuantity: 80,
    availableQuantity: 0,
    inboundQuantity: 64,
    shortageQuantity: 16,
    window: dispatch.scheduleWindow,
    suggestion: `${dispatch.suggestedAction}；隔离 LH-202605，启用备用批次 LH-202604B，并由采购追踪供应商整改。`,
    createdAt: new Date().toISOString(),
  }
  writeShortageKittingEvent(event)
  upsertOtdEvidenceChainRecord({
    id: `material-isolation-${dispatch.anomalyId}`,
    stage: '库存齐套',
    title: `${dispatch.title}批次隔离已进入齐套复核`,
    summary: `${dispatch.traceId} 已隔离 LH-202605，备用批次 LH-202604B 需补齐 ${event.shortageQuantity} 件，${dispatch.affectedOrders} 进入齐套和排产复核。`,
    object: dispatch.affectedOrders,
    source: `库存齐套 / ${dispatch.owner}`,
    traceId: dispatch.traceId,
    status: 'active',
    statusLabel: '批次隔离中',
    createdAt: event.createdAt,
  })
  syncTitle.value = '批次隔离已同步 AI 排产'
  syncMessage.value = `${dispatch.title} 已生成库存齐套复核，${event.materialCode} 缺 ${event.shortageQuantity} 件并进入事件触发 Agent。`
}
</script>

<style scoped>
.kitting-panel {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 16px;
  padding: 14px;
  border: 1px solid #bbf7d0;
  border-radius: 8px;
  background: #f8fffb;
}

.kitting-heading,
.order-topline {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: flex-start;
}

.eyebrow {
  display: block;
  margin-bottom: 3px;
  color: #15803d;
  font-size: 12px;
  font-weight: 700;
}

h3,
h4,
p {
  margin: 0;
}

h3 {
  color: #111827;
  font-size: 16px;
}

.shortage-badge {
  flex: 0 0 auto;
  padding: 5px 10px;
  border: 1px solid #fed7aa;
  border-radius: 4px;
  background: #fff7ed;
  color: #c2410c;
  font-size: 12px;
  font-weight: 700;
}

.kitting-grid,
.window-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
}

.order-card,
.window-card,
.sync-note,
.time-window {
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  background: #fff;
}

.order-card {
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-height: 292px;
  padding: 11px;
}

.order-card.shortage {
  border-color: #fecaca;
}

.order-card.warning {
  border-color: #fde68a;
}

.order-card.ready {
  border-color: #bbf7d0;
}

.order-topline span,
.order-topline strong,
.action-list span {
  padding: 2px 6px;
  border-radius: 4px;
  background: #f3f4f6;
  color: #4b5563;
  font-size: 12px;
}

.order-topline strong {
  background: #fff7ed;
  color: #c2410c;
}

.order-card.ready .order-topline strong {
  background: #dcfce7;
  color: #15803d;
}

.order-card h4,
.time-window h4,
.sync-note strong {
  color: #111827;
  font-size: 14px;
}

.order-card p,
.sync-note span,
.window-card span {
  color: #4b5563;
  font-size: 12px;
  line-height: 1.45;
}

.kitting-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 12px;
}

.kitting-table th,
.kitting-table td {
  padding: 5px;
  border-bottom: 1px solid #f3f4f6;
  text-align: left;
}

.kitting-table th {
  color: #6b7280;
  font-weight: 700;
}

.kitting-table tr.shortage td {
  color: #be123c;
  font-weight: 700;
}

.action-list {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
}

.order-card button {
  align-self: flex-start;
  margin-top: auto;
  padding: 6px 10px;
  border: 1px solid #15803d;
  border-radius: 4px;
  background: #15803d;
  color: #fff;
  cursor: pointer;
  font-size: 12px;
  font-weight: 700;
}

.order-card button:disabled {
  border-color: #d1d5db;
  background: #f3f4f6;
  color: #9ca3af;
  cursor: not-allowed;
}

.time-window,
.sync-note {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 10px;
}

.window-card {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 9px;
}

.window-card strong {
  color: #111827;
  font-size: 13px;
}

.window-card.critical {
  border-color: #fecaca;
  background: #fff1f2;
}

.window-card.warning {
  border-color: #fde68a;
  background: #fffbeb;
}

.window-card.ready {
  border-color: #bbf7d0;
  background: #f0fdf4;
}

.material-dispatch-panel {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(240px, 0.44fr);
  gap: 10px;
  padding: 12px;
  border: 1px solid #bfdbfe;
  border-radius: 6px;
  background: #f8fbff;
}

.material-dispatch-panel p {
  color: #4b5563;
  font-size: 12px;
  line-height: 1.45;
}

.material-dispatch-grid {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.material-dispatch-grid span {
  padding: 5px 7px;
  border: 1px solid #dbeafe;
  border-radius: 4px;
  background: #fff;
  color: #1d4ed8;
  font-size: 12px;
  font-weight: 700;
}

.material-dispatch-panel button {
  grid-column: 1 / -1;
  align-self: flex-start;
  padding: 6px 10px;
  border: 1px solid #2563eb;
  border-radius: 4px;
  background: #2563eb;
  color: #fff;
  cursor: pointer;
  font-size: 12px;
  font-weight: 700;
}

@media (max-width: 1180px) {
  .kitting-grid,
  .window-grid,
  .material-dispatch-panel {
    grid-template-columns: 1fr;
  }
}
</style>
