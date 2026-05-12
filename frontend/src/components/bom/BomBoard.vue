<template>
  <div class="bom-board">
    <h2 class="page-title">BOM 物料清单</h2>

    <div class="board-body">
      <!-- BOM 列表 -->
      <div class="list-panel">
        <div class="panel-header">
          <span>BOM 列表</span>
          <span class="badge-count">{{ boms.length }}</span>
        </div>
        <div v-if="loading" class="loading">加载中...</div>
        <div v-else class="list-items">
          <div
            v-for="b in boms"
            :key="b.id"
            class="list-item"
            :class="{ active: selected?.id === b.id }"
            @click="selectBom(b)"
          >
            <div class="item-title">{{ b.bomName }}</div>
            <div class="item-sub">
              <span class="tag code">{{ b.bomCode }}</span>
              <span class="tag type">{{ b.bomType }}</span>
              <span class="tag" :class="statusClass(b.status)">{{ statusLabel(b.status) }}</span>
            </div>
            <div class="item-info">{{ b.productName }} · {{ b.itemCount }} 项</div>
          </div>
        </div>
      </div>

      <!-- BOM 详情 -->
      <div class="detail-panel">
        <div v-if="!selected" class="empty-state">选择一个 BOM 查看详情</div>
        <template v-else>
          <div class="detail-header">
            <h3>{{ selected.bomName }}</h3>
            <button class="btn-explode" @click="handleExplode">爆炸展开</button>
          </div>
          <div class="detail-meta">
            <div class="meta-item"><label>编码</label><span>{{ selected.bomCode }}</span></div>
            <div class="meta-item"><label>产品</label><span>{{ selected.productName }} ({{ selected.productCode }})</span></div>
            <div class="meta-item"><label>版本</label><span>{{ selected.version }}</span></div>
            <div class="meta-item"><label>状态</label><span :class="statusClass(selected.status)">{{ statusLabel(selected.status) }}</span></div>
            <div class="meta-item"><label>类型</label><span>{{ selected.bomType }}</span></div>
            <div v-if="selected.effectiveDate" class="meta-item"><label>生效日</label><span>{{ selected.effectiveDate }}</span></div>
          </div>

          <!-- 爆炸树 -->
          <div v-if="explosion" class="explosion-section">
            <h4>物料展开 — 需求数量: {{ explodeQty }}</h4>
            <div class="tree">
              <div v-for="item in explosion.items" :key="item.materialCode" class="tree-node">
                <div class="tree-row" :style="{ paddingLeft: item.level * 20 + 'px' }">
                  <span class="tree-toggle" @click="toggleTree(item.materialCode)">
                    {{ item.children?.length ? (collapsed[item.materialCode] ? '▶' : '▼') : '·' }}
                  </span>
                  <span class="tree-code">{{ item.materialCode }}</span>
                  <span class="tree-name">{{ item.materialName }}</span>
                  <span class="tree-qty">{{ item.totalQuantity }} {{ item.unit }}</span>
                  <span v-if="item.lossRate" class="tree-loss">+{{ (item.lossRate * 100).toFixed(0) }}%</span>
                </div>
                <div v-if="item.children?.length && !collapsed[item.materialCode]" class="tree-children">
                  <div v-for="c in item.children" :key="c.materialCode" class="tree-node">
                    <div class="tree-row" :style="{ paddingLeft: (c.level || 1) * 20 + 'px' }">
                      <span class="tree-toggle" @click="toggleTree(c.materialCode)">
                        {{ c.children?.length ? (collapsed[c.materialCode] ? '▶' : '▼') : '·' }}
                      </span>
                      <span class="tree-code">{{ c.materialCode }}</span>
                      <span class="tree-name">{{ c.materialName }}</span>
                      <span class="tree-qty">{{ c.totalQuantity }} {{ c.unit }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- BOM 项列表 -->
          <div class="items-section">
            <h4>物料项 ({{ selected.items.length }})</h4>
            <table class="items-table">
              <thead>
                <tr><th>序号</th><th>物料编码</th><th>物料名称</th><th>数量</th><th>单位</th><th>损耗率</th><th>提前期</th><th>消耗时机</th></tr>
              </thead>
              <tbody>
                <tr v-for="item in flatItems(selected.items)" :key="item.id">
                  <td>{{ item.sequence }}</td>
                  <td>{{ item.materialCode }}</td>
                  <td>{{ item.materialName }}</td>
                  <td>{{ item.quantity }}</td>
                  <td>{{ item.unit }}</td>
                  <td>{{ item.lossRate ? (item.lossRate * 100) + '%' : '-' }}</td>
                  <td>{{ item.leadTimeDays ? item.leadTimeDays + '天' : '-' }}</td>
                  <td>{{ item.consumptionTiming || '-' }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import type { BomSummary, BomDetail, BomExplosionResult, BomItem } from '../../types/bom'
import { getBomList, getBomById, explodeBom } from '../../api/bom'

const loading = ref(false)
const boms = ref<BomSummary[]>([])
const selected = ref<BomDetail | null>(null)
const explosion = ref<BomExplosionResult | null>(null)
const explodeQty = ref(1)
const collapsed = ref<Record<string, boolean>>({})

function toggleTree(key: string) {
  collapsed.value[key] = !collapsed.value[key]
}

const demoBoms: BomSummary[] = [
  { id: 'bom-1', bomCode: 'BOM-A100', bomName: '产品A 物料清单', productCode: 'PROD-A1', productName: '精密轴承组件 A', bomType: 'Manufacturing', version: 'V1.0', status: 'Released', effectiveDate: '2026-01-01', expireDate: null, itemCount: 5, createdAt: '2026-01-01' },
  { id: 'bom-2', bomCode: 'BOM-B200', bomName: '产品B 物料清单', productCode: 'PROD-B1', productName: '传动轴总成 B', bomType: 'Manufacturing', version: 'V2.1', status: 'Released', effectiveDate: '2026-03-15', expireDate: null, itemCount: 8, createdAt: '2026-03-10' },
  { id: 'bom-3', bomCode: 'BOM-C300', bomName: '产品C 物料清单', productCode: 'PROD-C1', productName: '液压阀体 C', bomType: 'Manufacturing', version: 'V1.2', status: 'Draft', effectiveDate: null, expireDate: null, itemCount: 3, createdAt: '2026-04-20' },
]

function statusClass(s: string) {
  if (s === 'Released') return 'status-green'
  if (s === 'Draft') return 'status-yellow'
  return 'status-gray'
}

function statusLabel(s: string) {
  if (s === 'Released') return '已发布'
  if (s === 'Draft') return '草稿'
  if (s === 'Obsolete') return '已废弃'
  return s
}

function flatItems(items: BomItem[]): BomItem[] {
  const result: BomItem[] = []
  function walk(list: BomItem[]) {
    for (const item of list) {
      result.push(item)
      if (item.children.length) walk(item.children)
    }
  }
  walk(items)
  return result
}

async function selectBom(b: BomSummary) {
  try {
    selected.value = await getBomById(b.id)
  } catch {
    // demo fallback
    selected.value = {
      id: b.id, bomCode: b.bomCode, bomName: b.bomName,
      productCode: b.productCode, productName: b.productName,
      bomType: b.bomType, version: b.version, status: b.status,
      effectiveDate: b.effectiveDate, expireDate: b.expireDate,
      items: demoItems(b.id),
      changeHistory: [{ changeDescription: '初始创建', changedBy: 'admin', changedAt: b.createdAt }],
      createdAt: b.createdAt, updatedAt: null,
    }
  }
  explosion.value = null
}

function handleExplode() {
  if (!selected.value) return
  explodeQty.value = 1
  try {
    explodeBom(selected.value.id, 1).then(r => { explosion.value = r })
  } catch {
    explosion.value = demoExplosion(selected.value)
  }
}

function demoItems(bomId: string): BomItem[] {
  if (bomId === 'bom-1') return [
    { id: 'i1', materialCode: 'MAT-A01', materialName: '轴承钢圈', quantity: 2, unit: '个', lossRate: 0.02, leadTimeDays: 5, consumptionTiming: '装配前', sequence: 1, children: [] },
    { id: 'i2', materialCode: 'MAT-A02', materialName: '滚珠 φ8mm', quantity: 12, unit: '颗', lossRate: 0.05, leadTimeDays: 3, consumptionTiming: '装配', sequence: 2, children: [] },
    { id: 'i3', materialCode: 'MAT-A03', materialName: '保持架', quantity: 1, unit: '个', lossRate: null, leadTimeDays: 2, consumptionTiming: '装配', sequence: 3, children: [] },
    { id: 'i4', materialCode: 'MAT-A04', materialName: '密封圈', quantity: 2, unit: '个', lossRate: 0.01, leadTimeDays: 7, consumptionTiming: '装配后', sequence: 4, children: [] },
    { id: 'i5', materialCode: 'MAT-A05', materialName: '润滑脂', quantity: 0.5, unit: 'kg', lossRate: 0.03, leadTimeDays: 10, consumptionTiming: '包装前', sequence: 5, children: [] },
  ]
  if (bomId === 'bom-2') return [
    { id: 'i6', materialCode: 'MAT-B01', materialName: '轴坯 45#钢', quantity: 1, unit: '根', lossRate: 0.03, leadTimeDays: 7, consumptionTiming: '车削前', sequence: 1, children: [
      { id: 'i6a', materialCode: 'MAT-B01a', materialName: '圆钢 φ60mm', quantity: 1.2, unit: 'm', lossRate: 0.05, leadTimeDays: 3, consumptionTiming: '下料', sequence: 1, children: [] },
    ] },
    { id: 'i7', materialCode: 'MAT-B02', materialName: '花键套', quantity: 1, unit: '个', lossRate: null, leadTimeDays: 5, consumptionTiming: '装配', sequence: 2, children: [] },
  ]
  return [
    { id: 'i10', materialCode: 'MAT-C01', materialName: '阀体铸件', quantity: 1, unit: '件', lossRate: 0.04, leadTimeDays: 10, consumptionTiming: '加工前', sequence: 1, children: [] },
    { id: 'i11', materialCode: 'MAT-C02', materialName: '阀芯组件', quantity: 1, unit: '套', lossRate: 0.02, leadTimeDays: 7, consumptionTiming: '装配', sequence: 2, children: [] },
    { id: 'i12', materialCode: 'MAT-C03', materialName: '密封垫', quantity: 4, unit: '个', lossRate: 0.01, leadTimeDays: 3, consumptionTiming: '装配', sequence: 3, children: [] },
  ]
}

function demoExplosion(bom: BomDetail): BomExplosionResult {
  return {
    bomId: bom.id, bomName: bom.bomName,
    productCode: bom.productCode, productName: bom.productName,
    items: [
      { materialCode: 'MAT-A01', materialName: '轴承钢圈', quantityPerUnit: 2, totalQuantity: 2, unit: '个', lossRate: 0.02, leadTimeDays: 5, consumptionTiming: '装配前', level: 0, children: [] },
      { materialCode: 'MAT-A02', materialName: '滚珠 φ8mm', quantityPerUnit: 12, totalQuantity: 12, unit: '颗', lossRate: 0.05, leadTimeDays: 3, consumptionTiming: '装配', level: 0, children: [] },
      { materialCode: 'MAT-A03', materialName: '保持架', quantityPerUnit: 1, totalQuantity: 1, unit: '个', lossRate: null, leadTimeDays: 2, consumptionTiming: '装配', level: 0, children: [] },
      { materialCode: 'MAT-A04', materialName: '密封圈', quantityPerUnit: 2, totalQuantity: 2, unit: '个', lossRate: 0.01, leadTimeDays: 7, consumptionTiming: '装配后', level: 0, children: [] },
      { materialCode: 'MAT-A05', materialName: '润滑脂', quantityPerUnit: 0.5, totalQuantity: 0.5, unit: 'kg', lossRate: 0.03, leadTimeDays: 10, consumptionTiming: '包装前', level: 0, children: [] },
    ]
  }
}

onMounted(async () => {
  loading.value = true
  try {
    boms.value = await getBomList()
  } catch {
    boms.value = demoBoms
  }
  loading.value = false
})
</script>

<style scoped>
.bom-board { height: 100%; display: flex; flex-direction: column; padding: 16px; }
.page-title { font-size: 16px; font-weight: 700; margin-bottom: 12px; }
.board-body { flex: 1; display: flex; gap: 16px; overflow: hidden; }
.list-panel { width: 340px; flex-shrink: 0; background: #fff; border-radius: 8px; display: flex; flex-direction: column; overflow: hidden; }
.panel-header { padding: 12px 16px; border-bottom: 1px solid #f0f0f0; font-weight: 600; display: flex; align-items: center; gap: 8px; }
.badge-count { background: #1890ff; color: #fff; font-size: 11px; padding: 1px 7px; border-radius: 10px; }
.loading { padding: 24px; text-align: center; color: #999; }
.list-items { flex: 1; overflow-y: auto; }
.list-item { padding: 12px 16px; border-bottom: 1px solid #f5f5f5; cursor: pointer; transition: background 0.15s; }
.list-item:hover { background: #fafafa; }
.list-item.active { background: #e6f7ff; border-left: 3px solid #1890ff; }
.item-title { font-weight: 600; font-size: 13px; margin-bottom: 4px; }
.item-sub { display: flex; gap: 4px; margin-bottom: 4px; }
.tag { font-size: 11px; padding: 1px 6px; border-radius: 3px; background: #f5f5f5; color: #666; }
.tag.code { background: #e6f7ff; color: #1890ff; }
.tag.type { background: #fff7e6; color: #fa8c16; }
.tag.status-green { background: #f6ffed; color: #52c41a; }
.tag.status-yellow { background: #fffbe6; color: #faad14; }
.tag.status-gray { background: #f5f5f5; color: #999; }
.item-info { font-size: 12px; color: #999; }
.detail-panel { flex: 1; background: #fff; border-radius: 8px; padding: 20px; overflow-y: auto; }
.empty-state { text-align: center; color: #bbb; padding-top: 80px; font-size: 14px; }
.detail-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; }
.detail-header h3 { font-size: 16px; margin: 0; }
.btn-explode { padding: 6px 16px; background: #1890ff; color: #fff; border: none; border-radius: 4px; cursor: pointer; font-size: 13px; }
.btn-explode:hover { background: #40a9ff; }
.detail-meta { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px; margin-bottom: 20px; }
.meta-item label { display: block; font-size: 11px; color: #999; margin-bottom: 2px; }
.meta-item span { font-size: 13px; }
.explosion-section { margin-bottom: 20px; padding: 12px; background: #fafafa; border-radius: 6px; }
.explosion-section h4 { font-size: 13px; margin: 0 0 8px; }
.tree { padding-left: 8px; }
.items-section { }
.items-section h4 { font-size: 13px; margin: 0 0 8px; }
.items-table { width: 100%; border-collapse: collapse; font-size: 12px; }
.items-table th { background: #fafafa; padding: 8px; text-align: left; font-weight: 600; border-bottom: 2px solid #f0f0f0; }
.items-table td { padding: 8px; border-bottom: 1px solid #f5f5f5; }
</style>
