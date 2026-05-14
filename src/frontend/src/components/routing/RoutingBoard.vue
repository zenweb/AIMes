<template>
  <div class="routing-board">
    <h2 class="page-title">工艺路线管理</h2>

    <div class="board-body">
      <!-- 路线列表 -->
      <div class="list-panel">
        <div class="panel-header">
          <span>工艺路线</span>
          <span class="badge-count">{{ routes.length }}</span>
        </div>
        <div v-if="loading" class="loading">加载中...</div>
        <div v-else class="list-items">
          <div
            v-for="r in routes"
            :key="r.id"
            class="list-item"
            :class="{ active: selected?.id === r.id }"
            @click="selectRoute(r)"
          >
            <div class="item-title">{{ r.routeName }}</div>
            <div class="item-sub">
              <span class="tag code">{{ r.routeCode }}</span>
              <span class="tag" :class="r.status === 'Released' ? 'status-green' : 'status-yellow'">
                {{ r.status === 'Released' ? '已发布' : '草稿' }}
              </span>
            </div>
            <div class="item-info">{{ r.productName }} · {{ r.stepCount }} 工序 · {{ r.totalLeadTimeMinutes ? r.totalLeadTimeMinutes + 'min' : '-' }}</div>
          </div>
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

      <!-- 路线详情 -->
      <div class="detail-panel">
        <div v-if="!selected" class="empty-state">选择一个工艺路线查看详情</div>
        <template v-else>
          <h3>{{ selected.routeName }}</h3>
          <div class="detail-meta">
            <div class="meta-item"><label>编码</label><span>{{ selected.routeCode }}</span></div>
            <div class="meta-item"><label>产品</label><span>{{ selected.productName }} ({{ selected.productCode }})</span></div>
            <div class="meta-item"><label>版本</label><span>{{ selected.version }}</span></div>
            <div class="meta-item"><label>状态</label><span :class="selected.status === 'Released' ? 'status-green' : 'status-yellow'">{{ selected.status === 'Released' ? '已发布' : '草稿' }}</span></div>
          </div>

          <!-- 工序流程 -->
          <h4>工序列表 ({{ selected.steps.length }})</h4>
          <div class="steps-flow">
            <div v-for="(step, idx) in selected.steps" :key="step.id" class="step-card">
              <div class="step-connector">
                <div class="step-dot">{{ step.stepSequence }}</div>
                <div v-if="idx < selected.steps.length - 1" class="step-line"></div>
              </div>
              <div class="step-content">
                <div class="step-header">
                  <span class="step-name">{{ step.operationName }}</span>
                  <span v-if="step.inspectionRequired" class="tag qc">质检</span>
                </div>
                <div class="step-details">
                  <span>工位: {{ step.workstationType }}</span>
                  <span>设备: {{ step.equipmentType || '不限' }}</span>
                  <span>准备: {{ step.standardSetupMinutes }}min</span>
                  <span>节拍: {{ step.standardRunMinutesPerUnit }}min/件</span>
                </div>
                <div v-if="step.parameters?.length" class="step-params">
                  <div v-for="p in step.parameters" :key="p.parameterCode" class="param-chip">
                    {{ p.parameterName }}: {{ p.defaultValue }}{{ p.unit }}
                    <span v-if="p.lowerLimit != null" class="param-limit">[{{ p.lowerLimit }}~{{ p.upperLimit }}]</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import type { ProcessRoute, RouteDetail } from '../../types/routing'
import { getRouteList, getRouteById } from '../../api/routing'

const loading = ref(false)
const routes = ref<ProcessRoute[]>([])
const currentPage = ref(1)
const pageSize = ref(10)
const totalCount = ref(0)
const totalPages = computed(() => Math.max(1, Math.ceil(totalCount.value / pageSize.value)))
const displayedPages = computed(() => {
  const tp = totalPages.value; const cp = currentPage.value
  if (tp <= 7) return Array.from({ length: tp }, (_, i) => i + 1)
  const pages: (number | string)[] = [1]
  if (cp > 3) pages.push('...')
  const start = Math.max(2, cp - 1); const end = Math.min(tp - 1, cp + 1)
  for (let i = start; i <= end; i++) pages.push(i)
  if (cp < tp - 2) pages.push('...')
  if (tp > 1) pages.push(tp)
  return pages
})
function goToPage(p: number | string) {
  if (typeof p === "string") return
  if (p < 1 || p > totalPages.value) return
  currentPage.value = p
  loadRoutes()
}
const selected = ref<RouteDetail | null>(null)

const demoRoutes: ProcessRoute[] = [
  { id: 'r-1', routeCode: 'R-A100', routeName: '精密轴承组件工艺路线', productCode: 'PROD-A1', productName: '精密轴承组件 A', version: 'V1.0', status: 'Released', totalLeadTimeMinutes: 45, stepCount: 4 },
  { id: 'r-2', routeCode: 'R-B200', routeName: '传动轴总成工艺路线', productCode: 'PROD-B1', productName: '传动轴总成 B', version: 'V2.1', status: 'Released', totalLeadTimeMinutes: 120, stepCount: 6 },
  { id: 'r-3', routeCode: 'R-C300', routeName: '液压阀体工艺路线', productCode: 'PROD-C1', productName: '液压阀体 C', version: 'V1.0', status: 'Draft', totalLeadTimeMinutes: 90, stepCount: 5 },
]

const demoSteps: Record<string, any[]> = {
  'r-1': [
    { id: 's1', stepSequence: 1, operationCode: 'OP-010', operationName: '来料检验', workstationType: '质检台', standardSetupMinutes: 5, standardRunMinutesPerUnit: 0.5, equipmentType: '测量仪', inspectionRequired: true, parameters: [] },
    { id: 's2', stepSequence: 2, operationCode: 'OP-020', operationName: '车削加工', workstationType: '车床', standardSetupMinutes: 15, standardRunMinutesPerUnit: 3, equipmentType: 'CNC', inspectionRequired: false, parameters: [{ parameterCode: 'P01', parameterName: '主轴转速', defaultValue: '1200', unit: 'rpm', upperLimit: 1500, lowerLimit: 800, isMandatory: true }] },
    { id: 's3', stepSequence: 3, operationCode: 'OP-030', operationName: '装配', workstationType: '装配台', standardSetupMinutes: 10, standardRunMinutesPerUnit: 2, equipmentType: '手动', inspectionRequired: false, parameters: [] },
    { id: 's4', stepSequence: 4, operationCode: 'OP-040', operationName: '最终检验', workstationType: '质检台', standardSetupMinutes: 5, standardRunMinutesPerUnit: 1, equipmentType: '测量仪', inspectionRequired: true, parameters: [] },
  ],
  'r-2': [
    { id: 's5', stepSequence: 1, operationCode: 'OP-050', operationName: '下料', workstationType: '锯床', standardSetupMinutes: 10, standardRunMinutesPerUnit: 2, equipmentType: '带锯', inspectionRequired: false, parameters: [] },
    { id: 's6', stepSequence: 2, operationCode: 'OP-060', operationName: '粗车', workstationType: '车床', standardSetupMinutes: 20, standardRunMinutesPerUnit: 5, equipmentType: 'CNC', inspectionRequired: false, parameters: [{ parameterCode: 'P02', parameterName: '进给量', defaultValue: '0.3', unit: 'mm/r', upperLimit: 0.5, lowerLimit: 0.1, isMandatory: true }] },
    { id: 's7', stepSequence: 3, operationCode: 'OP-070', operationName: '精车', workstationType: '车床', standardSetupMinutes: 20, standardRunMinutesPerUnit: 8, equipmentType: 'CNC', inspectionRequired: false, parameters: [] },
    { id: 's8', stepSequence: 4, operationCode: 'OP-080', operationName: '铣键槽', workstationType: '铣床', standardSetupMinutes: 15, standardRunMinutesPerUnit: 4, equipmentType: 'CNC', inspectionRequired: true, parameters: [] },
    { id: 's9', stepSequence: 5, operationCode: 'OP-090', operationName: '热处理', workstationType: '热处理炉', standardSetupMinutes: 30, standardRunMinutesPerUnit: 15, equipmentType: '加热炉', inspectionRequired: false, parameters: [{ parameterCode: 'P03', parameterName: '温度', defaultValue: '850', unit: '°C', upperLimit: 870, lowerLimit: 830, isMandatory: true }] },
    { id: 's10', stepSequence: 6, operationCode: 'OP-100', operationName: '终检打包', workstationType: '包装台', standardSetupMinutes: 10, standardRunMinutesPerUnit: 3, equipmentType: '手动', inspectionRequired: true, parameters: [] },
  ],
  'r-3': [
    { id: 's11', stepSequence: 1, operationCode: 'OP-110', operationName: '铸造毛坯检验', workstationType: '质检台', standardSetupMinutes: 5, standardRunMinutesPerUnit: 1, equipmentType: '测量仪', inspectionRequired: true, parameters: [] },
    { id: 's12', stepSequence: 2, operationCode: 'OP-120', operationName: '铣面', workstationType: '铣床', standardSetupMinutes: 15, standardRunMinutesPerUnit: 6, equipmentType: 'CNC', inspectionRequired: false, parameters: [] },
    { id: 's13', stepSequence: 3, operationCode: 'OP-130', operationName: '钻孔攻丝', workstationType: '加工中心', standardSetupMinutes: 20, standardRunMinutesPerUnit: 5, equipmentType: 'CNC', inspectionRequired: false, parameters: [{ parameterCode: 'P04', parameterName: '钻速', defaultValue: '600', unit: 'rpm', upperLimit: 800, lowerLimit: 400, isMandatory: false }] },
    { id: 's14', stepSequence: 4, operationCode: 'OP-140', operationName: '去毛刺清洗', workstationType: '清洗台', standardSetupMinutes: 10, standardRunMinutesPerUnit: 3, equipmentType: '手动', inspectionRequired: false, parameters: [] },
    { id: 's15', stepSequence: 5, operationCode: 'OP-150', operationName: '压力测试', workstationType: '测试台', standardSetupMinutes: 15, standardRunMinutesPerUnit: 4, equipmentType: '测试机', inspectionRequired: true, parameters: [{ parameterCode: 'P05', parameterName: '测试压力', defaultValue: '2.5', unit: 'MPa', upperLimit: 3.0, lowerLimit: 2.0, isMandatory: true }] },
  ],
}

function demoRouteDetail(r: ProcessRoute): RouteDetail {
  return {
    ...r as any, steps: demoSteps[r.id] || [],
  }
}

async function selectRoute(r: ProcessRoute) {
  try {
    selected.value = await getRouteById(r.id)
  } catch {
    selected.value = demoRouteDetail(r)
  }
}

async function loadRoutes() {
  loading.value = true
  try {
    const result = await getRouteList(currentPage.value, pageSize.value)
    routes.value = result.items
    totalCount.value = result.totalCount
  } catch {
    routes.value = demoRoutes
    totalCount.value = demoRoutes.length
  }
  loading.value = false
}

onMounted(loadRoutes)
</script>

<style scoped>
.routing-board { height: 100%; display: flex; flex-direction: column; padding: 16px; }
.page-title { font-size: 16px; font-weight: 700; margin-bottom: 12px; }
.board-body { flex: 1; display: flex; gap: 16px; overflow: hidden; }
.list-panel { width: 340px; flex-shrink: 0; background: #fff; border-radius: 8px; display: flex; flex-direction: column; overflow: hidden; }
.panel-header { padding: 12px 16px; border-bottom: 1px solid #f0f0f0; font-weight: 600; display: flex; align-items: center; gap: 8px; }
.badge-count { background: #1890ff; color: #fff; font-size: 11px; padding: 1px 7px; border-radius: 10px; }
.loading { padding: 24px; text-align: center; color: #999; }
.list-items { flex: 1; overflow-y: auto; }
.list-item { padding: 12px 16px; border-bottom: 1px solid #f5f5f5; cursor: pointer; }
.list-item:hover { background: #fafafa; }
.list-item.active { background: #e6f7ff; border-left: 3px solid #1890ff; }
.item-title { font-weight: 600; font-size: 13px; margin-bottom: 4px; }
.item-sub { display: flex; gap: 4px; margin-bottom: 4px; }
.tag { font-size: 11px; padding: 1px 6px; border-radius: 3px; background: #f5f5f5; color: #666; }
.tag.code { background: #e6f7ff; color: #1890ff; }
.tag.qc { background: #fff7e6; color: #fa8c16; }
.tag.status-green { background: #f6ffed; color: #52c41a; }
.tag.status-yellow { background: #fffbe6; color: #faad14; }
.item-info { font-size: 12px; color: #999; }
.detail-panel { flex: 1; background: #fff; border-radius: 8px; padding: 20px; overflow-y: auto; }
.empty-state { text-align: center; color: #bbb; padding-top: 80px; }
.detail-meta { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px; margin-bottom: 20px; }
.meta-item label { display: block; font-size: 11px; color: #999; margin-bottom: 2px; }
.meta-item span { font-size: 13px; }
h3 { font-size: 16px; margin: 0 0 16px; }
h4 { font-size: 13px; margin: 0 0 12px; }
.steps-flow { display: flex; flex-direction: column; gap: 0; }
.step-card { display: flex; gap: 12px; }
.step-connector { display: flex; flex-direction: column; align-items: center; width: 28px; }
.step-dot { width: 26px; height: 26px; border-radius: 50%; background: #1890ff; color: #fff; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 700; flex-shrink: 0; }
.step-line { width: 2px; flex: 1; min-height: 24px; background: #e8e8e8; }
.step-content { flex: 1; padding-bottom: 16px; }
.step-header { display: flex; align-items: center; gap: 8px; margin-bottom: 4px; }
.step-name { font-weight: 600; font-size: 14px; }
.step-details { display: flex; gap: 12px; font-size: 12px; color: #888; margin-bottom: 6px; }
.step-params { display: flex; gap: 6px; flex-wrap: wrap; }
.param-chip { background: #f5f5f5; padding: 2px 8px; border-radius: 4px; font-size: 11px; color: #555; }
.param-limit { color: #1890ff; font-size: 10px; }
.pagination-bar { display: flex; align-items: center; gap: 4px; padding: 10px 16px; border-top: 1px solid #f0f0f0; flex-wrap: wrap; }
.page-btn { min-width: 28px; height: 28px; padding: 0 8px; border: 1px solid #d9d9d9; background: #fff; border-radius: 4px; font-size: 12px; cursor: pointer; }
.page-btn.active { background: #1890ff; color: #fff; border-color: #1890ff; }
.page-btn:disabled { color: #d9d9d9; cursor: not-allowed; }
.page-ellipsis { width: 28px; text-align: center; color: #999; font-size: 12px; }
.page-info { margin-left: auto; font-size: 12px; color: #999; }
</style>
