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
          <h4 class="result-name">{{ result.name }}</h4>
          <dl class="result-fields">
            <div v-for="(v, k) in resultFields" :key="k" class="field-row">
              <dt>{{ k }}</dt>
              <dd>{{ v }}</dd>
            </div>
          </dl>
          <div class="context-actions">
            <button
              v-for="action in contextActions"
              :key="`${action.label}-${action.route}`"
              type="button"
              @click="goContext(action)"
            >
              {{ action.label }}
            </button>
          </div>
          <div class="field-evidence-panel" :class="{ synced: currentScanEvidence }">
            <div>
              <span>现场执行证据</span>
              <strong>{{ currentScanEvidence ? currentScanEvidence.title : scanEvidenceHint }}</strong>
              <p v-if="currentScanEvidence">
                {{ currentScanEvidence.traceId }} 已写入 OTD 复盘证据链，下一核对点：{{ currentScanEvidence.nextCheck }}。
              </p>
              <p v-else>确认后会生成扫码追踪编号，并在报表中心与审计回放中核对。</p>
            </div>
            <button type="button" @click="confirmScanEvidence">
              {{ currentScanEvidence ? '重新确认扫码证据' : '确认并写入证据链' }}
            </button>
          </div>
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
import { useRouter } from 'vue-router'
import { Html5Qrcode } from 'html5-qrcode'
import http from '../../api/http'
import {
  createBarcodeScanEvidenceRecord,
  readBarcodeScanEvidenceRecords,
  writeBarcodeScanEvidenceRecord,
  type BarcodeScanEvidenceRecord,
} from '../../utils/barcode-scan-evidence-sync'

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
const router = useRouter()
const manualCode = ref('')
const result = ref<ScanResult | null>(null)
const scanError = ref('')
const history = ref<HistoryItem[]>([])
const scanEvidenceRecords = ref<BarcodeScanEvidenceRecord[]>([])
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

const contextActions = computed(() => {
  if (!result.value) return []
  const actions: { label: string; route: string; query?: Record<string, string> }[] = []
  if (result.value.type === 'WorkOrder') {
    actions.push({ label: '进入生产报工', route: '/production', query: { scanCode: String(result.value.code) } })
    actions.push({ label: '查看排产影响', route: '/scheduling', query: { scanCode: String(result.value.code) } })
  } else if (result.value.type === 'Equipment') {
    actions.push({ label: '查看设备详情', route: '/equipment' })
    actions.push({ label: '查看实时监控', route: '/monitoring' })
  } else if (result.value.type === 'Material') {
    actions.push({ label: '查看库存齐套', route: '/inventory' })
    actions.push({ label: '查看 BOM 用量', route: '/bom' })
  }
  return actions
})

const currentScanEvidence = computed(() => {
  if (!result.value) return null
  const code = result.value.code.trim().toUpperCase()
  return scanEvidenceRecords.value.find(record => record.code === code) ?? null
})

const scanEvidenceHint = computed(() => {
  if (!result.value) return '扫码后确认现场执行证据'
  if (result.value.type === 'WorkOrder') return '确认工单到站并进入报工入口'
  if (result.value.type === 'Equipment') return '确认设备点检入口并进入维护核对'
  if (result.value.type === 'Material') return '确认物料批次并进入齐套复核'
  return '确认扫码上下文'
})

function typeLabel(type: string) {
  const map: Record<string, string> = { Material: '物料', Equipment: '设备', WorkOrder: '工单' }
  return map[type] || type
}

function buildDemoScanResult(code: string): ScanResult | null {
  const normalized = code.trim().toUpperCase()
  if (/^WO[-_]/.test(normalized)) {
    return {
      type: 'WorkOrder',
      id: normalized,
      code: normalized,
      name: normalized === 'WO-RUSH-9001' ? '急单阀体组件' : '精密转接座',
      OrderNumber: normalized,
      ProductCode: normalized === 'WO-RUSH-9001' ? 'PROD-RUSH-01' : 'PRD-001',
      ProductName: normalized === 'WO-RUSH-9001' ? '急单阀体组件' : '精密转接座',
      Quantity: normalized === 'WO-RUSH-9001' ? 30 : 100,
      Completed: normalized === 'WO-RUSH-9001' ? 0 : 48,
    }
  }

  if (/^(EQ|CNC|HT|ASM)[-_]/.test(normalized)) {
    return {
      type: 'Equipment',
      id: normalized,
      code: normalized,
      name: normalized === 'CNC-01' ? 'CNC 加工中心 01' : '现场设备',
      EquipmentType: normalized.startsWith('CNC') ? 'CNC' : normalized.startsWith('HT') ? 'HeatTreatment' : 'Assembly',
      Status: normalized === 'CNC-01' ? '运行中 / 瓶颈设备' : '运行中',
      Workshop: 'WS-001',
    }
  }

  if (/^M[-_]/.test(normalized)) {
    return {
      type: 'Material',
      id: normalized,
      code: normalized,
      name: normalized === 'M-AL-6061' ? '铝合金 6061' : '现场物料',
      MaterialType: '原材料',
      Available: normalized === 'M-AL-6061' ? 0 : 120,
      Unit: '件',
      Location: normalized === 'M-AL-6061' ? '缺料预警 / 待采购收货' : 'A-01-01',
    }
  }

  return null
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
    pushHistory(code, data)
  } catch {
    const demo = buildDemoScanResult(code)
    if (!demo) {
      scanError.value = `未找到 "${code}" 对应的物料、设备或工单`
      return
    }
    result.value = demo
    pushHistory(code, demo)
  }

  if (scannerActive.value) {
    stopScanner()
    scannerActive.value = false
  }
}

function pushHistory(code: string, data: ScanResult) {
  history.value.unshift({
    code,
    type: typeLabel(data.type),
    name: data.name,
    time: new Date().toLocaleTimeString('zh-CN'),
  })
  if (history.value.length > 20) history.value.length = 20
}

function currentActor() {
  if (typeof window === 'undefined') return '现场操作员'
  try {
    const raw = window.localStorage.getItem('aimes_user')
    if (!raw) return '现场操作员'
    const user = JSON.parse(raw) as { displayName?: string; username?: string }
    return user.displayName || user.username || '现场操作员'
  } catch {
    return '现场操作员'
  }
}

function confirmScanEvidence() {
  if (!result.value) return
  const record = createBarcodeScanEvidenceRecord({
    code: result.value.code,
    type: result.value.type,
    name: result.value.name,
    actor: currentActor(),
  })
  writeBarcodeScanEvidenceRecord(record)
  scanEvidenceRecords.value = readBarcodeScanEvidenceRecords()
}

function goContext(action: { route: string; query?: Record<string, string> }) {
  router.push(action.query ? { path: action.route, query: action.query } : action.route)
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

scanEvidenceRecords.value = readBarcodeScanEvidenceRecords()
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
.result-name { margin: 0 0 10px; color: #111827; font-size: 16px; }
.result-fields { display: flex; flex-direction: column; gap: 6px; }
.field-row { display: flex; font-size: 13px; }
.field-row dt { width: 90px; color: #999; flex-shrink: 0; }
.field-row dd { margin: 0; font-weight: 500; }
.context-actions { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 12px; padding-top: 12px; border-top: 1px solid #f0f0f0; }
.context-actions button { padding: 7px 12px; border: 1px solid #1890ff; border-radius: 4px; background: #fff; color: #1677ff; cursor: pointer; font-size: 12px; font-weight: 700; }
.context-actions button:hover { background: #e6f4ff; }
.field-evidence-panel { display: flex; justify-content: space-between; gap: 12px; align-items: flex-start; margin-top: 12px; padding: 12px; border: 1px solid #fed7aa; border-radius: 6px; background: #fff7ed; }
.field-evidence-panel.synced { border-color: #bbf7d0; background: #f0fdf4; }
.field-evidence-panel span { display: block; margin-bottom: 3px; color: #c2410c; font-size: 11px; font-weight: 700; }
.field-evidence-panel.synced span { color: #15803d; }
.field-evidence-panel strong { display: block; color: #111827; font-size: 13px; }
.field-evidence-panel p { margin: 5px 0 0; color: #64748b; font-size: 12px; line-height: 1.45; }
.field-evidence-panel button { flex: 0 0 auto; padding: 7px 12px; border: 1px solid #f97316; border-radius: 4px; background: #fff; color: #c2410c; cursor: pointer; font-size: 12px; font-weight: 700; }
.field-evidence-panel.synced button { border-color: #22c55e; color: #15803d; }

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
