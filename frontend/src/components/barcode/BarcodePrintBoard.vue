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

    <div class="label-grid">
      <div
        v-for="item in filteredItems"
        :key="item.id"
        class="label-card"
        :class="{ selected: selected.has(item.id) }"
        @click="toggleSelect(item.id)"
      >
        <div class="label-check">
          <input type="checkbox" :checked="selected.has(item.id)" :id="'chk-' + item.id" />
        </div>
        <canvas :ref="(el) => renderQr(el as HTMLCanvasElement | null, item.materialCode, item.materialName)"></canvas>
        <div class="label-info">
          <div class="label-code">{{ item.materialCode }}</div>
          <div class="label-name">{{ item.materialName }}</div>
          <div class="label-meta">{{ item.materialType }} · {{ item.unit }}</div>
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

const items = ref<InventoryItem[]>([])
const search = ref('')
const typeFilter = ref('')
const selected = ref(new Set<string>())

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

function renderQr(canvas: HTMLCanvasElement | null, code: string, _name: string) {
  if (!canvas) return
  QRCode.toCanvas(canvas, code, { width: 120, margin: 1, color: { dark: '#000', light: '#fff' } }).catch(() => {})
}

function handlePrint() {
  const printWindow = window.open('', '_blank')
  if (!printWindow) return

  const selectedItems = items.value.filter(i => selected.value.has(i.id))
  if (!selectedItems.length) return

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
  })
}

onMounted(async () => {
  try { items.value = await getInventoryList() }
  catch {
    items.value = [
      { id: 'm1', materialCode: 'RM-STEEL-001', materialName: '碳钢板', materialType: 'RawMaterial', unit: 'kg', availableQuantity: 500, reservedQuantity: 30, realQuantity: 470, safetyStock: 100, storageLocation: 'A-01', expiryDate: null, createdAt: '2026-01-01T00:00:00' },
      { id: 'm2', materialCode: 'RM-AL-002', materialName: '铝合金锭', materialType: 'RawMaterial', unit: 'kg', availableQuantity: 300, reservedQuantity: 20, realQuantity: 280, safetyStock: 80, storageLocation: 'A-02', expiryDate: null, createdAt: '2026-01-01T00:00:00' },
      { id: 'm3', materialCode: 'SF-CNC-001', materialName: '精加工件A', materialType: 'SemiFinished', unit: 'pcs', availableQuantity: 150, reservedQuantity: 10, realQuantity: 140, safetyStock: 30, storageLocation: 'B-01', expiryDate: null, createdAt: '2026-01-01T00:00:00' },
      { id: 'm4', materialCode: 'FG-PRODUCT-A', materialName: '成品A', materialType: 'Finished', unit: 'pcs', availableQuantity: 80, reservedQuantity: 5, realQuantity: 75, safetyStock: 20, storageLocation: 'C-01', expiryDate: null, createdAt: '2026-01-01T00:00:00' },
    ]
  }
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
.label-grid { flex: 1; overflow-y: auto; display: grid; grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap: 12px; }
.label-card { background: #fff; border-radius: 8px; padding: 12px; text-align: center; cursor: pointer; border: 2px solid transparent; transition: all 0.15s; position: relative; }
.label-card:hover { box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
.label-card.selected { border-color: #1890ff; box-shadow: 0 0 0 2px rgba(24,144,255,0.2); }
.label-check { position: absolute; top: 6px; left: 6px; }
.label-card canvas { display: block; margin: 4px auto 8px; border-radius: 4px; }
.label-code { font-size: 11px; font-weight: 600; color: #333; word-break: break-all; font-family: monospace; }
.label-name { font-size: 13px; color: #333; margin: 2px 0; }
.label-meta { font-size: 11px; color: #999; }
</style>
