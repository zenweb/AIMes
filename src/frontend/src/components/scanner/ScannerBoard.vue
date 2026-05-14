<template>
  <div class="scanner-board">
    <div class="page-header">
      <h2 class="page-title">条码扫描</h2>
      <button class="btn-toggle" @click="scannerActive = !scannerActive">
        {{ scannerActive ? '关闭摄像头' : '开启摄像头' }}
      </button>
    </div>

    <div class="scanner-body">
      <!-- 摄像头扫描区 -->
      <div class="scanner-section" :class="{ active: scannerActive }">
        <div v-if="scannerActive" id="qr-reader" class="qr-reader"></div>
        <div v-else class="scanner-placeholder" @click="scannerActive = true">
          <span class="placeholder-icon">📷</span>
          <span>点击开启摄像头扫描</span>
        </div>
      </div>

      <!-- 手动输入 -->
      <div class="manual-section">
        <div class="manual-input-row">
          <input v-model="manualCode" class="code-input" placeholder="输入条码/物料编码/工单号..." @keyup.enter="lookup" />
          <button class="btn-lookup" :disabled="!manualCode" @click="lookup">查询</button>
        </div>
        <p v-if="scanError" class="scan-error">{{ scanError }}</p>
      </div>

      <!-- 扫描结果 -->
      <div v-if="result" class="scan-result">
        <h3>扫描结果</h3>
        <div class="result-card" :class="result.type.toLowerCase()">
          <div class="result-type">{{ typeLabel(result.type) }}</div>
          <dl class="result-fields">
            <div v-for="(v, k) in resultFields" :key="k" class="field-row">
              <dt>{{ k }}</dt>
              <dd>{{ v }}</dd>
            </div>
          </dl>
        </div>
      </div>
    </div>

    <!-- 扫描历史 -->
    <div class="scan-history" v-if="history.length">
      <h3>扫描历史</h3>
      <div class="history-list">
        <div v-for="(item, idx) in history" :key="idx" class="history-item" @click="handleScan(item.code)">
          <span class="hist-time">{{ item.time }}</span>
          <span class="hist-type">{{ item.type }}</span>
          <span class="hist-code">{{ item.code }}</span>
          <span class="hist-name">{{ item.name }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onBeforeUnmount, watch, nextTick } from 'vue'
import { Html5Qrcode } from 'html5-qrcode'
import http from '../../api/http'

interface ScanResult {
  type: string
  id: string
  code: string
  name: string
  [key: string]: unknown
}

interface HistoryItem {
  code: string
  type: string
  name: string
  time: string
}

const scannerActive = ref(false)
const manualCode = ref('')
const result = ref<ScanResult | null>(null)
const scanError = ref('')
const history = ref<HistoryItem[]>([])
let scanner: Html5Qrcode | null = null

const fieldLabels: Record<string, string> = {
  MaterialType: '物料类型', Available: '可用数量', Unit: '单位', Location: '库位',
  EquipmentType: '设备类型', Status: '状态', Workshop: '车间',
  OrderNumber: '工单号', ProductCode: '产品编码', ProductName: '产品名称',
  Quantity: '计划数量', Completed: '已完成数量',
}

const resultFields = computed(() => {
  if (!result.value) return {}
  const fields: Record<string, string> = {}
  for (const [k, v] of Object.entries(result.value)) {
    if (['type', 'id', 'code', 'name'].includes(k)) continue
    const label = fieldLabels[k] || k
    fields[label] = String(v ?? '-')
  }
  return fields
})

function typeLabel(type: string) {
  const map: Record<string, string> = { Material: '物料', Equipment: '设备', WorkOrder: '工单' }
  return map[type] || type
}

function startScanner() {
  scanner = new Html5Qrcode('qr-reader')
  scanner.start(
    { facingMode: 'environment' },
    { fps: 10, qrbox: { width: 250, height: 250 } },
    async (decodedText: string) => {
      await handleScan(decodedText)
    },
    () => {},
  ).catch((err: Error) => {
    scanError.value = `摄像头启动失败: ${err.message}`
    scannerActive.value = false
  })
}

function stopScanner() {
  if (scanner?.isScanning) {
    scanner.stop().catch(() => {})
  }
}

async function handleScan(code: string) {
  scanError.value = ''
  manualCode.value = code
  try {
    const { data } = await http.get<ScanResult>(`/scan/${encodeURIComponent(code)}`)
    result.value = data
    history.value.unshift({
      code,
      type: typeLabel(data.type),
      name: data.name,
      time: new Date().toLocaleTimeString('zh-CN'),
    })
    if (history.value.length > 20) history.value.length = 20

    if (scannerActive.value) {
      stopScanner()
      scannerActive.value = false
    }
  } catch {
    scanError.value = `未找到 "${code}" 对应的物料、设备或工单`
  }
}

async function lookup() {
  if (!manualCode.value) return
  await handleScan(manualCode.value)
}

watch(scannerActive, async (val) => {
  if (val) {
    await nextTick()
    startScanner()
  } else {
    stopScanner()
  }
})

onBeforeUnmount(() => {
  stopScanner()
})
</script>

<style scoped>
.scanner-board { height: 100%; display: flex; flex-direction: column; padding: 16px; overflow-y: auto; }
.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
.page-title { font-size: 16px; font-weight: 700; margin: 0; }
.btn-toggle { padding: 8px 16px; border-radius: 4px; border: 1px solid #1890ff; background: #fff; color: #1890ff; cursor: pointer; font-size: 13px; }
.btn-toggle:hover { background: #e6f7ff; }

.scanner-body { display: flex; gap: 24px; flex: 1; min-height: 0; }
.scanner-section { flex: 1; min-width: 320px; max-width: 500px; border: 2px dashed #d9d9d9; border-radius: 8px; display: flex; align-items: center; justify-content: center; min-height: 300px; }
.scanner-section.active { border-color: #1890ff; }
.scanner-placeholder { display: flex; flex-direction: column; align-items: center; gap: 12px; cursor: pointer; color: #999; }
.scanner-placeholder:hover { color: #1890ff; }
.placeholder-icon { font-size: 48px; }
.qr-reader { width: 100%; }

.manual-section { flex: 1; min-width: 280px; }
.manual-input-row { display: flex; gap: 8px; margin-bottom: 8px; }
.code-input { flex: 1; padding: 10px 12px; border: 1px solid #d9d9d9; border-radius: 4px; font-size: 14px; }
.code-input:focus { outline: none; border-color: #1890ff; }
.btn-lookup { padding: 10px 20px; background: #1890ff; color: #fff; border: none; border-radius: 4px; font-size: 13px; cursor: pointer; }
.btn-lookup:disabled { background: #91d5ff; cursor: not-allowed; }
.scan-error { color: #ff4d4f; font-size: 13px; margin: 4px 0 0; }

.scan-result { margin-top: 16px; }
.scan-result h3 { font-size: 14px; margin: 0 0 8px; }
.result-card { background: #fff; border-radius: 8px; padding: 16px; border-left: 4px solid #1890ff; }
.result-card.material { border-left-color: #52c41a; }
.result-card.equipment { border-left-color: #1890ff; }
.result-card.workorder { border-left-color: #fa8c16; }
.result-type { font-size: 12px; color: #999; margin-bottom: 8px; }
.result-fields { display: flex; flex-direction: column; gap: 6px; }
.field-row { display: flex; font-size: 13px; }
.field-row dt { width: 90px; color: #999; flex-shrink: 0; }
.field-row dd { margin: 0; font-weight: 500; }

.scan-history { margin-top: 24px; }
.scan-history h3 { font-size: 14px; margin: 0 0 8px; }
.history-list { display: flex; flex-direction: column; gap: 4px; }
.history-item { display: flex; align-items: center; gap: 12px; padding: 8px 12px; background: #fafafa; border-radius: 4px; cursor: pointer; font-size: 13px; }
.history-item:hover { background: #f0f0f0; }
.hist-time { width: 70px; color: #bbb; flex-shrink: 0; }
.hist-type { width: 40px; color: #666; font-size: 11px; flex-shrink: 0; }
.hist-code { font-family: monospace; font-weight: 600; width: 120px; flex-shrink: 0; }
.hist-name { color: #333; flex: 1; }
</style>
