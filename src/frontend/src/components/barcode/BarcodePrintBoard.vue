<template>
  <div class="barcode-board">
    <div class="page-header">
      <h2 class="page-title">条码 / QR 打印</h2>
      <div class="header-actions">
        <span class="sel-count" v-if="selected.size">已选 {{ selected.size }} 项</span>
        <button class="btn btn-print" :disabled="!selected.size" @click="handlePrint">打印标签</button>
      </div>
    </div>

    <div class="toolbar">
      <input v-model="search" class="search-input" placeholder="搜索物料名称/编码..." />
      <select v-model="typeFilter" class="filter-select">
        <option value="">全部类型</option>
        <option value="RawMaterial">原材料</option>
        <option value="SemiFinished">半成品</option>
        <option value="Finished">成品</option>
        <option value="Consumable">耗材</option>
      </select>
    </div>

    <div v-if="loadError" class="print-error" role="alert" aria-live="assertive">
      <span>{{ loadError }}</span>
      <button type="button" class="btn btn-retry" @click="loadInventoryList">重试加载</button>
    </div>

    <div v-if="printError" class="print-error" role="alert" aria-live="assertive">
      {{ printError }}
    </div>

    <section class="trace-batch" aria-label="现场追溯标签批次">
      <div class="trace-head">
        <div>
          <span class="eyebrow">现场追溯标签批次</span>
          <h3>打印即绑定现场入口</h3>
        </div>
        <span class="trace-id">BATCH-QR-20260520-01</span>
      </div>
      <div class="trace-grid">
        <div v-for="item in traceLabels" :key="item.code" class="trace-card" :class="item.level">
          <span>{{ item.type }}</span>
          <strong>{{ item.code }}</strong>
          <p>{{ item.purpose }}</p>
          <div class="trace-route">{{ item.route }}</div>
          <code class="trace-evidence">{{ item.evidence }}</code>
          <div v-if="labelStatusFor(item.code)" class="trace-label-status" :class="{ released: isReleasedLabelStatus(item.code) }">
            <span>{{ labelStatusFor(item.code)?.statusLabel }}</span>
            <code>{{ labelStatusFor(item.code)?.traceId }}</code>
          </div>
        </div>
      </div>
      <div class="trace-bridge">
        <span>扫描后动作</span>
        <strong>工单标签进入生产报工，设备标签进入设备维护/实时监控，物料标签进入库存齐套与 BOM 用量追溯；现场确认后写入 OTD 证据链。</strong>
        <router-link :to="scannerRouteTarget()">去扫描验证</router-link>
      </div>
    </section>

    <div class="label-grid">
      <div
        v-for="item in filteredItems"
        :key="item.id"
        class="label-card"
        :class="{ selected: selected.has(item.id) }"
        role="checkbox"
        tabindex="0"
        :aria-checked="selected.has(item.id)"
        :aria-label="labelCardAriaLabel(item)"
        @click="toggleSelect(item.id)"
        @keydown.enter="toggleSelect(item.id)"
        @keydown.space.prevent="toggleSelect(item.id)"
      >
        <div class="label-check">
          <input type="checkbox" :checked="selected.has(item.id)" :id="'chk-' + item.id" />
        </div>
        <canvas :ref="(el) => renderQr(el as HTMLCanvasElement | null, item.materialCode, item.materialName)"></canvas>
        <div class="label-info">
          <div class="label-code">{{ item.materialCode }}</div>
          <div class="label-name">{{ item.materialName }}</div>
          <div class="label-meta">{{ item.materialType }} · {{ item.unit }}</div>
          <div class="label-route">{{ routeHint(item.materialCode) }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import QRCode from 'qrcode'
import type { InventoryItem } from '../../types/inventory'
import { getInventoryList } from '../../api/inventory'
import { errorMessage } from '../../utils/error-message'
import { isOfflineDemoError } from '../../utils/offline-demo-mode'
import {
  readOtdEvidenceChainRecords,
  type OtdEvidenceChainItem,
} from '../../utils/otd-evidence-chain-sync'

const items = ref<InventoryItem[]>([])
const search = ref('')
const typeFilter = ref('')
const selected = ref(new Set<string>())
const otdEvidenceRecords = ref<OtdEvidenceChainItem[]>([])
const loadError = ref('')
const printError = ref('')
const traceLabels = [
  {
    type: '工单标签',
    code: 'WO-RUSH-9001',
    purpose: '急单阀体组件贴到流转卡，扫码直接进入生产报工和排产影响。',
    route: '扫码 -> 生产报工 -> AI 排产',
    evidence: 'TRACE-QR-WO-RUSH-9001-ARRIVAL',
    level: 'critical',
  },
  {
    type: '设备标签',
    code: 'CNC-01',
    purpose: '贴到瓶颈设备看板，扫码进入设备维护和实时监控。',
    route: '扫码 -> 设备维护 -> 实时监控',
    evidence: 'TRACE-QR-CNC-01-CHECK',
    level: 'warning',
  },
  {
    type: '物料标签',
    code: 'M-AL-6061',
    purpose: '贴到缺料批次容器，扫码进入库存齐套和 BOM 用量追溯。',
    route: '扫码 -> 库存齐套 -> BOM 管理',
    evidence: 'TRACE-QR-M-AL-6061-KIT',
    level: 'info',
  },
]

const filteredItems = computed(() => {
  let list = items.value
  if (typeFilter.value) list = list.filter(i => i.materialType === typeFilter.value)
  if (search.value) {
    const s = search.value.toLowerCase()
    list = list.filter(i => i.materialCode.toLowerCase().includes(s) || i.materialName.toLowerCase().includes(s))
  }
  return list
})

function toggleSelect(id: string) {
  const s = new Set(selected.value)
  if (s.has(id)) s.delete(id)
  else s.add(id)
  selected.value = s
}

function labelCardAriaLabel(item: InventoryItem) {
  return `选择打印标签：${item.materialCode} ${item.materialName}`
}

function renderQr(canvas: HTMLCanvasElement | null, code: string, _name: string) {
  if (!canvas) return
  QRCode.toCanvas(canvas, code, { width: 120, margin: 1, color: { dark: '#000', light: '#fff' } }).catch(() => {})
}

function routeHint(code: string) {
  if (code.startsWith('WO-')) return '扫码后进入生产报工'
  if (code.startsWith('CNC') || code.startsWith('EQ-')) return '扫码后进入设备详情'
  if (code.startsWith('M-')) return '扫码后进入库存齐套'
  return '扫码后进入库存追溯'
}

function labelStatusFor(code: string) {
  return otdEvidenceRecords.value
    .filter(record =>
      record.stage === '标签状态'
      && record.object === code
      && record.traceId.startsWith('TRACE-QR-')
    )
    .sort((left, right) => Date.parse(right.createdAt) - Date.parse(left.createdAt))[0]
}

function isReleasedLabelStatus(code: string) {
  return labelStatusFor(code)?.traceId.endsWith('LABEL-RELEASE') ?? false
}

function scannerRouteTarget() {
  if (typeof window === 'undefined') return '/scanner'

  const params = new URLSearchParams(window.location.search)
  const queryValue = params.get('offlineDemo') ?? params.get('demoMode')
  const explicitOfflineDemo = queryValue === '1' || queryValue === 'true' || queryValue === 'offline'

  if (explicitOfflineDemo || localStorage.getItem('aimes_offline_demo') === 'true') {
    return { path: '/scanner', query: { offlineDemo: '1' } }
  }

  return '/scanner'
}

function handlePrint() {
  const selectedItems = items.value.filter(i => selected.value.has(i.id))
  if (!selectedItems.length) return

  const printWindow = window.open('', '_blank')
  if (!printWindow) {
    printError.value = '标签打印窗口打开失败：请允许浏览器弹窗后重试'
    return
  }
  printError.value = ''

  printWindow.document.write('<html><head><title>标签打印</title>')
  printWindow.document.write('<style>')
  printWindow.document.write('body{font-family:sans-serif;padding:20px}')
  printWindow.document.write('.grid{display:grid;grid-template-columns:repeat(4,1fr);gap:16px}')
  printWindow.document.write('@media print{@page{margin:10mm}}')
  printWindow.document.write('.item{text-align:center;border:1px dashed #ccc;padding:12px;border-radius:4px}')
  printWindow.document.write('.item img{display:block;margin:0 auto 8px}')
  printWindow.document.write('.code{font-size:12px;font-weight:600}')
  printWindow.document.write('.name{font-size:11px;color:#666}')
  printWindow.document.write('</style></head><body><div class="grid">')

  Promise.all(
    selectedItems.map(i => QRCode.toDataURL(i.materialCode, { width: 160, margin: 2 }))
  ).then((urls: string[]) => {
    urls.forEach((url: string, idx: number) => {
      const i = selectedItems[idx]
      printWindow.document.write(`<div class="item"><img src="${url}" width="120" height="120" alt="QR"/><div class="code">${i.materialCode}</div><div class="name">${i.materialName}</div></div>`)
    })
    printWindow.document.write('</div></body></html>')
    printWindow.document.close()
    printWindow.print()
  }).catch((error: unknown) => {
    printError.value = `标签二维码生成失败：${errorMessage(error, '请稍后重试')}`
  })
}

async function loadInventoryList() {
  otdEvidenceRecords.value = readOtdEvidenceChainRecords()
  try {
    items.value = await getInventoryList()
    loadError.value = ''
  }
  catch (e: unknown) {
    if (!isOfflineDemoError(e)) {
      loadError.value = `标签列表加载失败：${errorMessage(e, '请稍后重试')}`
    }
    items.value = [
      { id: 'm1', materialCode: 'M-AL-6061', materialName: '铝合金 6061', materialType: 'RawMaterial', unit: '件', availableQuantity: 45, reservedQuantity: 30, realQuantity: 15, safetyStock: 64, storageLocation: '缺料预警 / 待采购收货', expiryDate: null, createdAt: '2026-01-01T00:00:00' },
      { id: 'm2', materialCode: 'WO-RUSH-9001', materialName: '急单阀体组件流转卡', materialType: 'Finished', unit: '单', availableQuantity: 1, reservedQuantity: 0, realQuantity: 1, safetyStock: 1, storageLocation: '生产一线', expiryDate: null, createdAt: '2026-01-01T00:00:00' },
      { id: 'm3', materialCode: 'CNC-01', materialName: 'CNC 加工中心 01 设备牌', materialType: 'Consumable', unit: '张', availableQuantity: 1, reservedQuantity: 0, realQuantity: 1, safetyStock: 1, storageLocation: 'CNC 工位', expiryDate: null, createdAt: '2026-01-01T00:00:00' },
      { id: 'm4', materialCode: 'FG-PRODUCT-A', materialName: '成品A', materialType: 'Finished', unit: 'pcs', availableQuantity: 80, reservedQuantity: 5, realQuantity: 75, safetyStock: 20, storageLocation: 'C-01', expiryDate: null, createdAt: '2026-01-01T00:00:00' },
    ]
  }
}

onMounted(async () => {
  await loadInventoryList()
})
</script>

<style scoped>
.barcode-board { height: 100%; display: flex; flex-direction: column; padding: 16px; }
.page-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; }
.page-title { font-size: 16px; font-weight: 700; margin: 0; }
.header-actions { display: flex; align-items: center; gap: 12px; }
.sel-count { font-size: 13px; color: #666; }
.btn { padding: 6px 16px; border-radius: 4px; font-size: 13px; cursor: pointer; border: 1px solid #d9d9d9; background: #fff; }
.btn-print { background: #1890ff; color: #fff; border-color: #1890ff; }
.btn-print:disabled { background: #91d5ff; border-color: #91d5ff; cursor: not-allowed; }
.toolbar { display: flex; gap: 8px; margin-bottom: 12px; align-items: center; }
.search-input { width: 200px; padding: 6px 10px; border: 1px solid #d9d9d9; border-radius: 4px; font-size: 13px; }
.filter-select { padding: 6px 8px; border: 1px solid #d9d9d9; border-radius: 4px; font-size: 12px; }
.print-error { margin-bottom: 12px; padding: 8px 10px; border: 1px solid #ffa39e; border-radius: 4px; background: #fff1f0; color: #a8071a; font-size: 12px; }
.print-error { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
.btn-retry { padding: 4px 10px; font-size: 12px; background: #fff; color: #a8071a; border-color: #ffa39e; }
.trace-batch { background: #fff; border: 1px solid #e6edf5; border-radius: 8px; padding: 14px; margin-bottom: 12px; }
.trace-head { display: flex; justify-content: space-between; align-items: flex-start; gap: 12px; margin-bottom: 12px; }
.eyebrow { display: block; font-size: 11px; color: #1677ff; font-weight: 700; margin-bottom: 3px; }
.trace-head h3 { margin: 0; font-size: 14px; }
.trace-id { background: #eef6ff; color: #1677ff; border: 1px solid #91caff; border-radius: 4px; padding: 3px 8px; font-size: 12px; white-space: nowrap; font-family: monospace; }
.trace-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 10px; }
.trace-card { border: 1px solid #edf1f5; border-radius: 6px; padding: 10px; min-height: 118px; }
.trace-card span { display: block; color: #667085; font-size: 11px; margin-bottom: 6px; }
.trace-card strong { display: block; color: #1f2937; font-size: 13px; margin-bottom: 6px; font-family: monospace; }
.trace-card p { margin: 0 0 8px; color: #667085; font-size: 12px; line-height: 1.5; }
.trace-card.critical { border-top: 3px solid #ff4d4f; }
.trace-card.warning { border-top: 3px solid #faad14; }
.trace-card.info { border-top: 3px solid #1890ff; }
.trace-route { color: #1677ff; font-size: 11px; background: #eef6ff; border-radius: 4px; padding: 5px 6px; }
.trace-evidence { display: block; margin-top: 6px; color: #15803d; font-size: 11px; font-family: monospace; }
.trace-label-status { display: grid; gap: 4px; margin-top: 6px; padding: 6px; border-radius: 4px; background: #fff7ed; border: 1px solid #fed7aa; }
.trace-label-status span { margin: 0; color: #c2410c; font-size: 11px; font-weight: 700; }
.trace-label-status code { color: #9a3412; font-size: 11px; overflow-wrap: anywhere; }
.trace-label-status.released { background: #f0fdf4; border-color: #86efac; }
.trace-label-status.released span { color: #047857; }
.trace-label-status.released code { color: #15803d; }
.trace-bridge { display: flex; align-items: center; gap: 10px; margin-top: 12px; padding: 10px 12px; background: #f6f9fc; border-radius: 6px; font-size: 12px; }
.trace-bridge span { color: #1677ff; font-weight: 700; white-space: nowrap; }
.trace-bridge strong { flex: 1; color: #1f2937; font-weight: 600; }
.trace-bridge a { color: #1677ff; text-decoration: none; white-space: nowrap; }
.label-grid { flex: 1; overflow-y: auto; display: grid; grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap: 12px; }
.label-card { background: #fff; border-radius: 8px; padding: 12px; text-align: center; cursor: pointer; border: 2px solid transparent; transition: all 0.15s; position: relative; }
.label-card:hover { box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
.label-card.selected { border-color: #1890ff; box-shadow: 0 0 0 2px rgba(24,144,255,0.2); }
.label-check { position: absolute; top: 6px; left: 6px; }
.label-card canvas { display: block; margin: 4px auto 8px; border-radius: 4px; }
.label-code { font-size: 11px; font-weight: 600; color: #333; word-break: break-all; font-family: monospace; }
.label-name { font-size: 13px; color: #333; margin: 2px 0; }
.label-meta { font-size: 11px; color: #999; }
.label-route { margin-top: 5px; font-size: 11px; color: #1677ff; background: #eef6ff; border-radius: 4px; padding: 4px; }
@media (max-width: 1100px) {
  .trace-grid { grid-template-columns: 1fr; }
  .trace-bridge { align-items: flex-start; flex-direction: column; }
}
</style>
