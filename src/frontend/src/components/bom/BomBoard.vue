<template>
  <div class="bom-board">
    <h2 class="page-title">BOM 物料清单</h2>
    <div v-if="bomError" class="bom-error" role="alert" aria-live="assertive">{{ bomError }}</div>

    <div class="board-body">
      <!-- BOM 列表 -->
      <div class="list-panel">
        <div class="panel-header">
          <span>BOM 列表</span>
          <span class="badge-count">{{ boms.length }}</span>
        </div>
        <div v-if="loading" class="loading">加载中...</div>
        <div v-else class="list-items" role="listbox" aria-label="BOM 列表">
          <div
            v-for="b in boms"
            :key="b.id"
            class="list-item"
            :class="{ active: selected?.id === b.id }"
            role="option"
            tabindex="0"
            :aria-selected="selected?.id === b.id"
            @click="selectBom(b)"
            @keydown.enter.prevent="selectBom(b)"
            @keydown.space.prevent="selectBom(b)"
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

          <section class="constraint-section" aria-label="BOM 排产约束源">
            <div class="constraint-head">
              <div>
                <span class="eyebrow">工程数据约束</span>
                <h4>BOM 排产约束源</h4>
              </div>
              <span class="constraint-status">{{ selected.status === 'Released' ? '可进入 Agent' : '待发布' }}</span>
            </div>
            <div class="constraint-grid">
              <div v-for="rule in bomConstraintRules" :key="rule.title" class="constraint-card" :class="rule.level">
                <span>{{ rule.type }}</span>
                <strong>{{ rule.title }}</strong>
                <p>{{ rule.detail }}</p>
              </div>
            </div>
            <div v-if="selected.bomCode === 'BOM-A100'" class="alternate-approval" :class="{ approved: alternateApproval }">
              <div>
                <span class="eyebrow">替代料工程确认</span>
                <h4>{{ alternateApproval ? 'M-AL-6061B 已工程放行' : 'M-AL-6061B 等待工程确认' }}</h4>
                <p>{{ alternateApproval ? alternateApproval.summary : '确认后允许 Agent 把 M-AL-6061 缺料约束从高风险冻结降为可执行复核，并把审批证据写入 OTD 复盘。' }}</p>
              </div>
              <div class="approval-meta">
                <strong>{{ alternateApproval ? alternateApproval.auditId : 'AUD-ENG-ALT-20260520-001' }}</strong>
                <span>{{ alternateApproval ? alternateApproval.approvedBy : '工程师 / EMP-004' }}</span>
                <button v-if="!alternateApproval" type="button" @click="approveAlternateMaterial">确认替代料放行</button>
                <em v-else>已同步 OTD 证据链</em>
              </div>
            </div>
            <div v-if="selected.bomCode === 'BOM-A100'" class="change-impact" :class="{ analyzed: engineeringChangeImpact }">
              <div class="impact-head">
                <div>
                  <span class="eyebrow">工程变更影响分析</span>
                  <h4>{{ engineeringChangeImpact ? engineeringChangeImpact.changeTitle : '替代料变更先算影响再进排产' }}</h4>
                  <p>{{ engineeringChangeImpact ? engineeringChangeImpact.summary : '比较库存、质量参数、供应商批次、成本和 OTD 影响，生成可被 AI 排产、报表和审计共用的 ECN 证据。' }}</p>
                </div>
                <div class="impact-actions">
                  <button v-if="!engineeringChangeImpact" type="button" @click="analyzeEngineeringChangeImpact">生成影响分析</button>
                  <template v-else>
                    <em>{{ engineeringChangeImpact.auditId }}</em>
                    <button v-if="engineeringChangeImpact.decision === 'pending'" type="button" @click="approveEngineeringChange">批准 ECN 放行</button>
                    <button v-if="engineeringChangeImpact.decision === 'pending'" class="secondary" type="button" @click="rejectEngineeringChange">驳回 ECN</button>
                  </template>
                </div>
              </div>
              <div class="impact-grid">
                <div v-for="item in engineeringChangeImpactCards" :key="item.label" class="impact-card">
                  <span>{{ item.label }}</span>
                  <strong>{{ item.value }}</strong>
                </div>
              </div>
              <div v-if="engineeringChangeImpact" class="impact-trace">
                <span>{{ engineeringChangeImpact.changeId }}</span>
                <code>{{ engineeringChangeImpact.traceId }}</code>
                <strong>{{ engineeringChangeImpact.recommendedDecision }}</strong>
              </div>
              <div v-if="engineeringChangeImpact" class="impact-decision" :class="engineeringChangeImpact.decision">
                <span>{{ engineeringChangeImpact.decisionLabel }}</span>
                <strong>{{ engineeringChangeDecisionText }}</strong>
                <em v-if="engineeringChangeImpact.decidedBy">{{ engineeringChangeImpact.decidedBy }} · {{ engineeringChangeImpact.decisionAuditId }}</em>
              </div>
            </div>
            <div v-if="selected.bomCode === 'BOM-A100'" class="bom-kitting-source" :class="{ published: bomKittingPackage }">
              <div class="kitting-source-head">
                <div>
                  <span class="eyebrow">BOM 展开齐套检查</span>
                  <h4>{{ bomKittingPackage ? 'BOM 展开齐套包已进入库存与排产' : '把 BOM 展开结果送入库存齐套' }}</h4>
                  <p>{{ bomKittingPackage ? bomKittingPackage.summary : '按 WO-RUSH-9001 的排产窗口展开 BOM-A100，核对 M-AL-6061、M-SEAL-20 与关键替代料，把缺口直接生成库存齐套和排产事件。' }}</p>
                </div>
                <div class="kitting-source-actions">
                  <button type="button" @click="publishBomKittingPackage">生成 BOM 齐套检查包</button>
                  <em v-if="bomKittingPackage">{{ bomKittingPackage.auditId }}</em>
                </div>
              </div>
              <div class="kitting-source-grid">
                <div v-for="item in bomKittingItems" :key="item.materialCode" class="kitting-source-card" :class="{ shortage: item.shortageQuantity > 0 }">
                  <span>{{ item.materialCode }}</span>
                  <strong>{{ item.requiredQuantity }}{{ item.unit }} / 可用 {{ item.availableQuantity }}{{ item.unit }} / 在途 {{ item.inboundQuantity }}{{ item.unit }}</strong>
                  <p>{{ item.action }}</p>
                </div>
              </div>
              <div v-if="bomKittingPackage" class="kitting-source-trace">
                <span>{{ bomKittingPackage.workOrderNumber }}</span>
                <code>{{ bomKittingPackage.traceId }}</code>
                <strong>{{ bomKittingPackage.statusLabel }}</strong>
              </div>
            </div>
            <div class="agent-bridge">
              <span>排产引用</span>
              <strong>{{ bomAgentBridge }}</strong>
              <router-link to="/scheduling">查看 AI 排产解释</router-link>
            </div>
          </section>

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
import { ref, computed, onMounted } from 'vue'
import type { BomSummary, BomDetail, BomExplosionResult, BomItem } from '../../types/bom'
import { getBomList, getBomById, explodeBom } from '../../api/bom'
import {
  approveEngineeringChangeImpactAnalysis,
  readAlternateMaterialApprovalBackendFirst,
  readEngineeringChangeImpactAnalysisBackendFirst,
  rejectEngineeringChangeImpactAnalysis,
  writeAlternateMaterialApproval,
  writeEngineeringChangeImpactAnalysis,
  type AlternateMaterialApproval,
  type EngineeringChangeImpactAnalysis,
} from '../../utils/engineering-change-sync'
import { readBomKittingPackageBackendFirst, writeBomKittingPackage, type BomKittingPackage, type BomKittingPackageItem } from '../../utils/shortage-risk-sync'
import { upsertOtdEvidenceChainRecord } from '../../utils/otd-evidence-chain-sync'

const loading = ref(false)
const boms = ref<BomSummary[]>([])
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
  loadBoms()
}
const selected = ref<BomDetail | null>(null)
const alternateApproval = ref<AlternateMaterialApproval | null>(null)
const engineeringChangeImpact = ref<EngineeringChangeImpactAnalysis | null>(null)
const bomKittingPackage = ref<BomKittingPackage | null>(null)
const explosion = ref<BomExplosionResult | null>(null)
const bomError = ref('')
const explodeQty = ref(1)
const collapsed = ref<Record<string, boolean>>({})

const bomConstraintCatalog: Record<string, { type: string, title: string, detail: string, level: string }[]> = {
  'BOM-A100': [
    { type: '关键物料', title: 'M-AL-6061 缺料会冻结 CNC 后段', detail: 'WO-RUSH-9001 需要 64 件，可用 45 件，缺口需采购加急或替代料释放。', level: 'critical' },
    { type: '替代料', title: 'M-AL-6061B 需工程确认', detail: '确认后允许 Agent 把缺料约束从高风险降为可执行复核。', level: 'warning' },
    { type: '生效版本', title: 'BOM-A100 V1.0 已发布', detail: '只有 Released 版本可被排产、库存齐套和采购协同共同引用。', level: 'ready' },
  ],
  'BOM-B200': [
    { type: '关键物料', title: 'MAT-B02 花键套在途不足', detail: '3 天窗口内仍缺 20 个，Agent 需要先排不受该物料约束的工单。', level: 'warning' },
    { type: '提前期', title: '轴坯提前期 7 天', detail: '粗车前置工序需预留采购和下料窗口，避免短交期工单强插。', level: 'info' },
    { type: '生效版本', title: 'BOM-B200 V2.1 已发布', detail: '可作为传动轴总成 B 的库存齐套和成本测算依据。', level: 'ready' },
  ],
  'BOM-C300': [
    { type: '版本状态', title: '草稿 BOM 不能直接排产', detail: '液压阀体 C 需要工程发布后，Agent 才能把阀体铸件和密封件约束纳入方案。', level: 'warning' },
    { type: '长提前期', title: '阀体铸件提前期 10 天', detail: '未发布前只进入预警，不自动生成采购或重排动作。', level: 'info' },
    { type: '质量约束', title: '压力测试物料批次需追溯', detail: '密封垫批次会影响最终压力测试和质量放行窗口。', level: 'info' },
  ],
}

const bomConstraintRules = computed(() => {
  if (!selected.value) return []
  const rules = bomConstraintCatalog[selected.value.bomCode] ?? [
    { type: '工程数据', title: `${selected.value.bomCode} 约束待建模`, detail: '需要补齐替代料、提前期和关键物料规则后进入排产解释。', level: 'info' },
  ]
  if (selected.value.bomCode !== 'BOM-A100' || !alternateApproval.value) return rules
  return rules.map(rule => rule.title === 'M-AL-6061B 需工程确认'
    ? {
        ...rule,
        title: 'M-AL-6061B 已工程确认',
        detail: `${alternateApproval.value?.auditId} 已放行，Agent 可把缺料约束从冻结降为可执行复核。`,
        level: 'ready',
      }
    : rule
  )
})

const bomAgentBridge = computed(() => {
  if (!selected.value) return ''
  if (selected.value.bomCode === 'BOM-A100') {
    if (engineeringChangeImpact.value?.decision === 'approved') return `${engineeringChangeImpact.value.decisionAuditId} 已批准 ${engineeringChangeImpact.value.changeId}，AI 排产可正式释放 WO-RUSH-9001 / WO-DEMO-1002 的替代料窗口。`
    if (engineeringChangeImpact.value?.decision === 'rejected') return `${engineeringChangeImpact.value.decisionAuditId} 已驳回 ${engineeringChangeImpact.value.changeId}，AI 排产撤回模拟并保持 ${engineeringChangeImpact.value.sourceMaterialCode} 原物料策略。`
    if (engineeringChangeImpact.value) return `${engineeringChangeImpact.value.auditId} 已完成 ${engineeringChangeImpact.value.changeId} 影响分析，AI 排产可按 ${engineeringChangeImpact.value.scheduleWindow} 生成审批前模拟复核。`
    if (alternateApproval.value) return `${alternateApproval.value.auditId} 已确认 M-AL-6061B 可替代 M-AL-6061，AI 排产可释放 WO-RUSH-9001 / WO-DEMO-1002 的缺料冻结约束。`
    return 'AI 排产使用 BOM-A100 V1.0 判断 M-AL-6061 缺口，并提示 M-AL-6061B 替代料评估。'
  }
  if (selected.value.bomCode === 'BOM-B200') return 'AI 排产使用 BOM-B200 V2.1 判断 MAT-B02 在途不足，并建议前置不缺料工单。'
  return `${selected.value.bomCode} 当前仍需发布，暂不允许 Agent 自动采纳相关物料约束。`
})

const engineeringChangeImpactCards = computed(() => {
  const impact = engineeringChangeImpact.value
  if (!impact) {
    return [
      { label: '库存影响', value: '缺口 19 件 / 替代可用 28 件' },
      { label: '质量影响', value: '首件材质复核 + OP-040 质量门' },
      { label: 'OTD 影响', value: '预计 OTD +7% / 延期 -1 单' },
    ]
  }
  return [
    { label: '库存影响', value: impact.inventoryImpact },
    { label: '质量影响', value: impact.qualityImpact },
    { label: '供应影响', value: impact.supplierImpact },
    { label: '成本影响', value: impact.costImpact },
    { label: 'OTD 影响', value: impact.otdImpact },
    { label: '排产窗口', value: impact.scheduleWindow },
  ]
})

const engineeringChangeDecisionText = computed(() => {
  const impact = engineeringChangeImpact.value
  if (!impact) return ''
  if (impact.decision === 'approved') return '已批准正式释放：WO-RUSH-9001 / WO-DEMO-1002 可转正式替代料排产，质量门和批次追溯保留。'
  if (impact.decision === 'rejected') return '已驳回：审批前模拟撤回，保持原物料策略并等待采购/工程补证。'
  return '待工程审批：AI 排产只能生成审批前模拟，不自动正式采纳。'
})

const bomKittingItems: BomKittingPackageItem[] = [
  {
    materialCode: 'M-AL-6061',
    materialName: '铝合金 6061',
    requiredQuantity: 64,
    availableQuantity: 45,
    inboundQuantity: 20,
    shortageQuantity: 19,
    unit: '件',
    action: '缺 19 件：先触发采购加急，同时评估 M-AL-6061B 替代料工程放行。',
  },
  {
    materialCode: 'M-SEAL-20',
    materialName: '密封圈 20',
    requiredQuantity: 32,
    availableQuantity: 1300,
    inboundQuantity: 0,
    shortageQuantity: 0,
    unit: '件',
    action: '已齐套：装配前保留批次追溯，不阻断 WO-RUSH-9001。',
  },
  {
    materialCode: 'M-AL-6061B',
    materialName: '铝合金 6061B',
    requiredQuantity: 19,
    availableQuantity: 28,
    inboundQuantity: 0,
    shortageQuantity: 0,
    unit: '件',
    action: '替代可用：需工程确认后进入 AI 排产正式释放，质量门不可压缩。',
  },
]

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
  alternateApproval.value = await readAlternateMaterialApprovalBackendFirst()
  engineeringChangeImpact.value = await readEngineeringChangeImpactAnalysisBackendFirst()
  bomKittingPackage.value = await readBomKittingPackageBackendFirst()
  try {
    selected.value = await getBomById(b.id)
    if (bomError.value.startsWith('BOM 详情加载失败')) bomError.value = ''
  } catch (error: unknown) {
    bomError.value = `BOM 详情加载失败：${error instanceof Error ? error.message : '请稍后重试'}`
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

function approveAlternateMaterial() {
  if (!selected.value) return
  try {
    const approval = writeAlternateMaterialApproval({
      bomCode: selected.value.bomCode,
      bomVersion: selected.value.version,
    })
    if (!approval) {
      bomError.value = '替代料放行失败：请稍后重试'
      return
    }
    alternateApproval.value = approval
    if (bomError.value.startsWith('替代料放行失败')) bomError.value = ''
  } catch (error: unknown) {
    bomError.value = `替代料放行失败：${error instanceof Error ? error.message : '请稍后重试'}`
  }
}

function analyzeEngineeringChangeImpact() {
  if (!selected.value) return
  try {
    const impact = writeEngineeringChangeImpactAnalysis({
      bomCode: selected.value.bomCode,
      bomVersion: selected.value.version,
    })
    if (!impact) {
      bomError.value = 'ECN 影响分析失败：请稍后重试'
      return
    }
    engineeringChangeImpact.value = impact
    if (bomError.value.startsWith('ECN 影响分析失败')) bomError.value = ''
  } catch (error: unknown) {
    bomError.value = `ECN 影响分析失败：${error instanceof Error ? error.message : '请稍后重试'}`
  }
}

function approveEngineeringChange() {
  try {
    const impact = approveEngineeringChangeImpactAnalysis()
    if (!impact) {
      bomError.value = 'ECN 放行失败：请稍后重试'
      return
    }
    engineeringChangeImpact.value = impact
    if (bomError.value.startsWith('ECN 放行失败')) bomError.value = ''
  } catch (error: unknown) {
    bomError.value = `ECN 放行失败：${error instanceof Error ? error.message : '请稍后重试'}`
  }
}

function rejectEngineeringChange() {
  try {
    const impact = rejectEngineeringChangeImpactAnalysis()
    if (!impact) {
      bomError.value = 'ECN 驳回失败：请稍后重试'
      return
    }
    engineeringChangeImpact.value = impact
    if (bomError.value.startsWith('ECN 驳回失败')) bomError.value = ''
  } catch (error: unknown) {
    bomError.value = `ECN 驳回失败：${error instanceof Error ? error.message : '请稍后重试'}`
  }
}

function publishBomKittingPackage() {
  if (!selected.value) return
  const now = new Date().toISOString()
  const record: BomKittingPackage = {
    id: 'bom-kitting-package-bom-a100-wo-rush-9001',
    bomCode: selected.value.bomCode,
    bomVersion: selected.value.version,
    productName: selected.value.productName,
    workOrderNumber: 'WO-RUSH-9001',
    scheduleWindow: '2026-05-20 14:00-22:00',
    statusLabel: '待库存齐套',
    owner: '计划员 李工 / 物控 王工',
    auditId: 'AUD-BOM-KIT-BOM-A100-WO-RUSH-9001-20260522',
    traceId: 'TRACE-BOM-KIT-BOM-A100-WO-RUSH-9001',
    createdAt: now,
    summary: 'BOM-A100 V1.0 已展开到 WO-RUSH-9001 排产窗口，M-AL-6061 缺口 19 件，M-SEAL-20 已齐套，M-AL-6061B 替代料可用但需工程确认。',
    items: bomKittingItems,
  }
  try {
    writeBomKittingPackage(record)
    upsertOtdEvidenceChainRecord({
      id: record.id,
      stage: '库存齐套',
      title: `${record.bomCode} 展开齐套检查包已进入排产复核`,
      summary: `${record.summary} 责任人：${record.owner}；动作：${record.items.map(item => `${item.materialCode} ${item.action}`).join('；')}`,
      object: record.workOrderNumber,
      source: `BOM 管理 / ${record.bomCode} ${record.bomVersion}`,
      traceId: record.traceId,
      status: 'active',
      statusLabel: record.statusLabel,
      createdAt: record.createdAt,
    })
    bomKittingPackage.value = record
    if (bomError.value.startsWith('BOM 齐套检查包发布失败')) bomError.value = ''
  } catch (error: unknown) {
    bomError.value = `BOM 齐套检查包发布失败：${error instanceof Error ? error.message : '请稍后重试'}`
  }
}

async function handleExplode() {
  if (!selected.value) return
  explodeQty.value = 1
  try {
    explosion.value = await explodeBom(selected.value.id, 1)
    if (bomError.value.startsWith('BOM 展开失败')) bomError.value = ''
  } catch (error: unknown) {
    bomError.value = `BOM 展开失败：${error instanceof Error ? error.message : '请稍后重试'}`
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

async function loadBoms() {
  loading.value = true
  try {
    const result = await getBomList(currentPage.value, pageSize.value)
    boms.value = result.items
    totalCount.value = result.totalCount
    if (bomError.value.startsWith('BOM 列表加载失败')) bomError.value = ''
  } catch (error: unknown) {
    bomError.value = `BOM 列表加载失败：${error instanceof Error ? error.message : '请稍后重试'}`
    boms.value = demoBoms
    totalCount.value = demoBoms.length
  }
  loading.value = false
}

onMounted(async () => {
  alternateApproval.value = await readAlternateMaterialApprovalBackendFirst()
  engineeringChangeImpact.value = await readEngineeringChangeImpactAnalysisBackendFirst()
  bomKittingPackage.value = await readBomKittingPackageBackendFirst()
  loadBoms()
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
.constraint-section { border: 1px solid #e6edf5; background: #fbfdff; border-radius: 8px; padding: 14px; margin-bottom: 20px; }
.constraint-head { display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; margin-bottom: 12px; }
.eyebrow { display: block; font-size: 11px; color: #1677ff; font-weight: 700; margin-bottom: 3px; }
.constraint-head h4 { margin: 0; font-size: 14px; }
.constraint-status { background: #f6ffed; color: #389e0d; border: 1px solid #b7eb8f; border-radius: 4px; padding: 3px 8px; font-size: 12px; white-space: nowrap; }
.constraint-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 10px; }
.constraint-card { border: 1px solid #edf1f5; background: #fff; border-radius: 6px; padding: 10px; min-height: 104px; }
.constraint-card span { display: inline-block; color: #667085; font-size: 11px; margin-bottom: 6px; }
.constraint-card strong { display: block; color: #1f2937; font-size: 13px; margin-bottom: 6px; }
.constraint-card p { margin: 0; color: #667085; font-size: 12px; line-height: 1.5; }
.constraint-card.critical { border-top: 3px solid #ff4d4f; }
.constraint-card.warning { border-top: 3px solid #faad14; }
.constraint-card.ready { border-top: 3px solid #52c41a; }
.constraint-card.info { border-top: 3px solid #1890ff; }
.alternate-approval { display: grid; grid-template-columns: minmax(0, 1fr) minmax(240px, 0.42fr); gap: 12px; margin-top: 12px; padding: 12px; border: 1px solid #fed7aa; border-radius: 6px; background: #fff7ed; }
.alternate-approval.approved { border-color: #bbf7d0; background: #f0fdf4; }
.alternate-approval h4, .alternate-approval p { margin: 0; }
.alternate-approval h4 { color: #1f2937; font-size: 14px; }
.alternate-approval p { margin-top: 4px; color: #667085; font-size: 12px; line-height: 1.5; }
.approval-meta { display: flex; flex-direction: column; justify-content: center; gap: 6px; padding: 10px; border: 1px solid #fed7aa; border-radius: 6px; background: #fff; }
.alternate-approval.approved .approval-meta { border-color: #bbf7d0; }
.approval-meta strong { color: #1f2937; font-size: 13px; }
.approval-meta span, .approval-meta em { color: #667085; font-size: 12px; font-style: normal; }
.approval-meta button { align-self: flex-start; padding: 6px 10px; border: 1px solid #16a34a; border-radius: 4px; background: #16a34a; color: #fff; cursor: pointer; font-size: 12px; font-weight: 700; }
.change-impact { display: flex; flex-direction: column; gap: 10px; margin-top: 12px; padding: 12px; border: 1px solid #bfdbfe; border-radius: 6px; background: #eff6ff; }
.change-impact.analyzed { border-color: #bbf7d0; background: #f0fdf4; }
.impact-head { display: flex; justify-content: space-between; gap: 12px; align-items: flex-start; }
.impact-head h4, .impact-head p { margin: 0; }
.impact-head h4 { color: #1f2937; font-size: 14px; }
.impact-head p { margin-top: 4px; color: #667085; font-size: 12px; line-height: 1.5; }
.impact-actions { display: flex; flex: 0 0 auto; flex-direction: column; align-items: flex-end; gap: 6px; }
.impact-actions button { flex: 0 0 auto; padding: 6px 10px; border: 1px solid #2563eb; border-radius: 4px; background: #2563eb; color: #fff; cursor: pointer; font-size: 12px; font-weight: 700; }
.impact-actions button.secondary { border-color: #dc2626; background: #fff; color: #b91c1c; }
.impact-actions em { flex: 0 0 auto; color: #15803d; font-size: 12px; font-style: normal; font-weight: 700; }
.impact-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 8px; }
.impact-card { min-width: 0; padding: 8px; border: 1px solid rgba(255,255,255,0.7); border-radius: 6px; background: rgba(255,255,255,0.75); }
.impact-card span { display: block; margin-bottom: 4px; color: #2563eb; font-size: 11px; font-weight: 700; }
.impact-card strong { display: block; color: #1f2937; font-size: 12px; line-height: 1.45; }
.impact-trace { display: grid; grid-template-columns: minmax(160px, 0.3fr) minmax(160px, 0.35fr) minmax(0, 1fr); gap: 8px; align-items: center; padding: 8px; border-radius: 6px; background: #fff; color: #1f2937; font-size: 12px; }
.impact-trace code { color: #2563eb; font-family: inherit; font-weight: 700; }
.impact-decision { display: grid; grid-template-columns: 96px minmax(0, 1fr) minmax(160px, 0.36fr); gap: 8px; align-items: center; padding: 8px; border: 1px solid #fed7aa; border-radius: 6px; background: #fff7ed; color: #1f2937; font-size: 12px; }
.impact-decision.approved { border-color: #bbf7d0; background: #f0fdf4; }
.impact-decision.rejected { border-color: #fecaca; background: #fff1f2; }
.impact-decision span { color: #b45309; font-weight: 700; }
.impact-decision.approved span { color: #15803d; }
.impact-decision.rejected span { color: #b91c1c; }
.impact-decision strong { font-weight: 600; }
.impact-decision em { color: #667085; font-size: 12px; font-style: normal; overflow-wrap: anywhere; }
.bom-kitting-source { display: flex; flex-direction: column; gap: 10px; margin-top: 12px; padding: 12px; border: 1px solid #c7d2fe; border-radius: 6px; background: #eef2ff; }
.bom-kitting-source.published { border-color: #bbf7d0; background: #f0fdf4; }
.kitting-source-head { display: flex; justify-content: space-between; gap: 12px; align-items: flex-start; }
.kitting-source-head h4,
.kitting-source-head p { margin: 0; }
.kitting-source-head h4 { color: #1f2937; font-size: 14px; }
.kitting-source-head p { margin-top: 4px; color: #667085; font-size: 12px; line-height: 1.5; }
.kitting-source-actions { display: flex; flex: 0 0 auto; flex-direction: column; align-items: flex-end; gap: 6px; }
.kitting-source-actions button { padding: 6px 10px; border: 1px solid #4f46e5; border-radius: 4px; background: #4f46e5; color: #fff; cursor: pointer; font-size: 12px; font-weight: 700; }
.kitting-source-actions em { color: #15803d; font-size: 12px; font-style: normal; font-weight: 700; }
.kitting-source-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 8px; }
.kitting-source-card { min-width: 0; padding: 8px; border: 1px solid rgba(255,255,255,0.78); border-radius: 6px; background: rgba(255,255,255,0.78); }
.kitting-source-card.shortage { border-color: #fecaca; background: #fff7f7; }
.kitting-source-card span { display: block; margin-bottom: 4px; color: #4f46e5; font-size: 11px; font-weight: 700; }
.kitting-source-card strong { display: block; margin-bottom: 4px; color: #1f2937; font-size: 12px; line-height: 1.45; }
.kitting-source-card p { margin: 0; color: #667085; font-size: 12px; line-height: 1.45; }
.kitting-source-trace { display: grid; grid-template-columns: minmax(120px, 0.25fr) minmax(160px, 0.45fr) minmax(0, 1fr); gap: 8px; align-items: center; padding: 8px; border-radius: 6px; background: #fff; color: #1f2937; font-size: 12px; }
.kitting-source-trace code { color: #4f46e5; font-family: inherit; font-weight: 700; }
.agent-bridge { display: flex; align-items: center; gap: 10px; margin-top: 12px; padding: 10px 12px; background: #eef6ff; border-radius: 6px; font-size: 12px; }
.agent-bridge span { color: #1677ff; font-weight: 700; white-space: nowrap; }
.agent-bridge strong { flex: 1; color: #1f2937; font-weight: 600; }
.agent-bridge a { color: #1677ff; text-decoration: none; white-space: nowrap; }
.explosion-section { margin-bottom: 20px; padding: 12px; background: #fafafa; border-radius: 6px; }
.explosion-section h4 { font-size: 13px; margin: 0 0 8px; }
.tree { padding-left: 8px; }
.items-section { }
.items-section h4 { font-size: 13px; margin: 0 0 8px; }
.items-table { width: 100%; border-collapse: collapse; font-size: 12px; }
.items-table th { background: #fafafa; padding: 8px; text-align: left; font-weight: 600; border-bottom: 2px solid #f0f0f0; }
.items-table td { padding: 8px; border-bottom: 1px solid #f5f5f5; }
.pagination-bar { display: flex; align-items: center; gap: 4px; padding: 10px 16px; border-top: 1px solid #f0f0f0; flex-wrap: wrap; }
.page-btn { min-width: 28px; height: 28px; padding: 0 8px; border: 1px solid #d9d9d9; background: #fff; border-radius: 4px; font-size: 12px; cursor: pointer; }
.page-btn.active { background: #1890ff; color: #fff; border-color: #1890ff; }
.page-btn:disabled { color: #d9d9d9; cursor: not-allowed; }
.page-ellipsis { width: 28px; text-align: center; color: #999; font-size: 12px; }
.page-info { margin-left: auto; font-size: 12px; color: #999; }
@media (max-width: 1100px) {
  .constraint-grid { grid-template-columns: 1fr; }
  .alternate-approval { grid-template-columns: 1fr; }
  .impact-head { flex-direction: column; }
  .impact-actions { align-items: flex-start; }
  .impact-grid, .impact-trace, .impact-decision, .kitting-source-grid, .kitting-source-trace { grid-template-columns: 1fr; }
  .kitting-source-head { flex-direction: column; }
  .kitting-source-actions { align-items: flex-start; }
  .agent-bridge { align-items: flex-start; flex-direction: column; }
}
</style>
