<template>
  <div class="quality-board">
      <!-- 顶部 KPI -->
      <div class="kpi-row">
        <div class="kpi-card">
          <div class="kpi-icon" style="background:#f6ffed;color:#52c41a">✓</div>
          <div class="kpi-body">
            <span class="kpi-value">{{ stats.passRate }}%</span>
            <span class="kpi-label">质量合格率</span>
          </div>
        </div>
        <div class="kpi-card">
          <div class="kpi-icon" style="background:#e6f7ff;color:#1890ff">📋</div>
          <div class="kpi-body">
            <span class="kpi-value">{{ stats.totalInspections }}</span>
            <span class="kpi-label">检验批次</span>
          </div>
        </div>
        <div class="kpi-card">
          <div class="kpi-icon" style="background:#fff7e6;color:#fa8c16">⚠</div>
          <div class="kpi-body">
            <span class="kpi-value">{{ stats.defectRate }}%</span>
            <span class="kpi-label">不良率</span>
          </div>
        </div>
        <div class="kpi-card">
          <div class="kpi-icon" style="background:#fff0f6;color:#eb2f96">🔄</div>
          <div class="kpi-body">
            <span class="kpi-value">{{ stats.reworkRate }}%</span>
            <span class="kpi-label">返工率</span>
          </div>
        </div>
      </div>

      <section v-if="auditFocus" class="audit-focus-banner" aria-label="审计对象定位">
        <div>
          <span>来自审计回放</span>
          <strong>{{ auditFocus.label }}</strong>
          <p>对象 {{ auditFocus.objectId }} 已定位到质检记录，追踪号 {{ auditFocus.traceId }}。</p>
        </div>
        <code>{{ auditFocus.objectType }}</code>
      </section>

      <QualityReworkImpactPanel
        :event="qualityReworkEvent"
        :sync-message="reworkSyncMessage"
        @create="handleCreateReworkEvent"
      />

      <QualityMrbDispositionPanel
        :preview="qualityMrbPreview"
        :record="qualityMrbDisposition"
        :sync-message="mrbSyncMessage"
        @create="handleCreateMrbDisposition"
        @close="handleCloseMrbDisposition"
      />

      <QualityCapaTaskPanel
        :quality-knowledge-sample="qualityKnowledgeSample"
        :quality-knowledge-reuse-draft="qualityKnowledgeReuseDraft"
      />

      <div v-if="qualityError" class="quality-error" role="alert" aria-live="assertive">{{ qualityError }}</div>

      <section v-if="barcodeQualityGateRecords.length" class="barcode-quality-gate-panel" aria-label="扫码质量门回放">
        <div class="panel-heading">
          <div>
            <span>扫码质量门</span>
            <h3>首件巡检与工序交接</h3>
          </div>
          <em>{{ barcodeQualityGateRecords.length }} 条证据</em>
        </div>
        <div v-if="barcodeFrozenGate" class="barcode-release-banner" :class="{ released: !!barcodeReleaseRecord }">
          <div>
            <strong>{{ barcodeReleaseRecord ? '返工复验已放行' : '返工复验待放行' }}</strong>
            <p>{{ barcodeReleaseRecord ? '标签已解冻，OP-20 接收和排产窗口已恢复。' : '当前存在扫码返工冻结，需复验通过后释放 OP-20 接收并更新流转卡标签。' }}</p>
          </div>
          <button v-if="!barcodeReleaseRecord" type="button" @click="releaseBarcodeReworkGate">复验通过并释放交接</button>
        </div>
        <p v-if="barcodeReleaseMessage" class="barcode-release-message">{{ barcodeReleaseMessage }}</p>
        <div class="barcode-quality-grid">
          <article v-for="record in barcodeQualityGateRecords" :key="record.id" class="barcode-quality-card" :class="record.status">
            <div class="quality-card-topline">
              <span>{{ record.stage }}</span>
              <em>{{ record.statusLabel }}</em>
            </div>
            <h4>{{ record.title }}</h4>
            <p>{{ record.summary }}</p>
            <div class="quality-card-meta">
              <code>{{ record.traceId }}</code>
              <span>{{ record.object }}</span>
            </div>
          </article>
        </div>
        <div class="barcode-knowledge-sample-panel">
          <div>
            <span>质量知识复用</span>
            <h4>扫码返工样本沉淀为 CAPA 推荐</h4>
            <p>把 `WO-RUSH-9001 / OP-10` 的隔离、返工成本、复验释放和排产回写合成可复用质量样本，供同类批次、同类设备和同类缺陷复盘。</p>
          </div>
          <div class="sample-dimensions">
            <span>同类批次 AL-202605</span>
            <span>CNC-002 精加工</span>
            <span>首件尺寸偏差</span>
            <span>OP-20 释放复核</span>
          </div>
          <button v-if="!qualityKnowledgeSample" type="button" @click="publishBarcodeQualityKnowledgeSample">
            沉淀为 CAPA 知识样本
          </button>
          <div v-else class="sample-synced">
            <strong>{{ qualityKnowledgeSample.auditId }}</strong>
            <code>{{ qualityKnowledgeSample.traceId }}</code>
            <span v-for="target in qualityKnowledgeSample.reuseTargets" :key="target">{{ target }}</span>
          </div>
          <div v-if="qualityKnowledgeSample" class="reuse-draft-card" :class="{ synced: !!qualityKnowledgeReuseDraft }">
            <div class="reuse-draft-heading">
              <div>
                <span>同类缺陷自动匹配</span>
                <h4>{{ qualityKnowledgeReuseDraft ? `${qualityKnowledgeReuseDraft.targetWorkOrderId} 处置草案` : 'WO-DEMO-1012 命中扫码返工样本' }}</h4>
                <p>{{ qualityKnowledgeReuseDraft ? qualityKnowledgeReuseDraft.summary : '同设备、同工序、同 AL 批次族和同类首件尺寸偏差命中后，可生成待复核处置草案并计算复用效果。' }}</p>
              </div>
              <strong>{{ qualityKnowledgeReuseDraft ? `${qualityKnowledgeReuseDraft.effectScore} 分` : '92%' }}</strong>
            </div>
            <div class="reuse-match-grid">
              <span
                v-for="dimension in qualityKnowledgeReuseDraft?.matchDimensions ?? previewReuseDimensions"
                :key="dimension.label"
              >
                {{ dimension.label }}：{{ dimension.target }}
              </span>
            </div>
            <button v-if="!qualityKnowledgeReuseDraft" type="button" @click="generateQualityKnowledgeReuseDraft">
              生成同类缺陷处置草案
            </button>
            <div v-else class="reuse-draft-result">
              <strong>{{ qualityKnowledgeReuseDraft.auditId }}</strong>
              <code>{{ qualityKnowledgeReuseDraft.traceId }}</code>
              <ul>
                <li v-for="action in qualityKnowledgeReuseDraft.dispositionDraft" :key="action">{{ action }}</li>
              </ul>
              <div class="reuse-effect-metrics">
                <span v-for="metric in qualityKnowledgeReuseDraft.effectMetrics" :key="metric.label">
                  {{ metric.label }} {{ metric.value }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div class="board-grid">
        <!-- SPC 趋势图 -->
        <div class="card spc-card">
          <div class="card-header">
            <h3>SPC 趋势分析</h3>
            <select v-model="spcParam" class="param-select" aria-label="选择 SPC 参数" @change="loadSpc">
              <option value="surface_roughness">表面粗糙度</option>
              <option value="dimension_tolerance">尺寸公差</option>
              <option value="hardness">硬度</option>
            </select>
          </div>
          <div class="card-body">
            <div class="spc-chart-container">
              <svg :viewBox="`0 0 ${chartW} ${chartH}`" class="spc-chart">
                <!-- 控制限 -->
                <line :x1="pad" :y1="uclY" :x2="chartW - pad" :y2="uclY" stroke="#ff4d4f" stroke-dasharray="4" stroke-width="1" />
                <line :x1="pad" :y1="lclY" :x2="chartW - pad" :y2="lclY" stroke="#ff4d4f" stroke-dasharray="4" stroke-width="1" />
                <line :x1="pad" :y1="clY"  :x2="chartW - pad" :y2="clY"  stroke="#52c41a" stroke-width="1" />
                <!-- 数据线 -->
                <polyline :points="spcPoints" fill="none" stroke="#1890ff" stroke-width="2" />
                <!-- 数据点 -->
                <circle v-for="(p, i) in spcData" :key="i" :cx="p.x" :cy="p.y" r="3" fill="#1890ff">
                  <title>{{ p.label }}</title>
                </circle>
                <!-- 标签 -->
                <text :x="pad"   :y="uclY - 6" font-size="10" fill="#ff4d4f">UCL</text>
                <text :x="pad"   :y="clY - 6"  font-size="10" fill="#52c41a">CL</text>
                <text :x="pad"   :y="lclY - 6" font-size="10" fill="#ff4d4f">LCL</text>
              </svg>
              <div v-if="!spcData.length" class="spc-empty-state">暂无 SPC 数据</div>
            </div>
            <div v-if="spcAlert" class="spc-alert" :class="spcAlert.type">
              {{ spcAlert.message }}
            </div>
            <div v-if="spcRecommend" class="spc-recommend">
              💡 {{ spcRecommend }}
            </div>
          </div>
        </div>

        <!-- 异常告警 -->
        <div class="card">
          <div class="card-header">
            <h3>异常告警 ({{ anomalies.length }})</h3>
          </div>
          <div class="card-body anomalies-body">
            <div v-for="a in anomalies" :key="a.id" class="anomaly-item" :class="a.severity">
              <div class="anomaly-header">
                <span class="anomaly-badge" :class="a.severity">{{ a.severity === 'critical' ? '紧急' : a.severity === 'major' ? '严重' : '一般' }}</span>
                <span class="anomaly-type">{{ a.anomalyType }}</span>
                <span class="anomaly-status" :class="a.status">{{ a.status === 'open' ? '待处理' : a.status === 'investigating' ? '调查中' : '已解决' }}</span>
              </div>
              <div class="anomaly-desc">{{ a.description }}</div>
              <div class="anomaly-meta">
                <span>工单: {{ a.workOrderId }}</span>
                <span>{{ formatTime(a.detectedAt) }}</span>
              </div>
            </div>
            <div v-if="!anomalies.length" class="empty-state">暂无异常告警</div>
          </div>
        </div>
      </div>

      <!-- 检验批次列表 -->
      <div class="card inspections-card">
        <div class="card-header">
          <h3>检验批次</h3>
          <div class="inspection-filters">
            <select v-model="resultFilter" class="filter-select" aria-label="筛选检验结果">
              <option value="">全部结果</option>
              <option value="pass">合格</option>
              <option value="fail">不合格</option>
              <option value="rework">返工</option>
            </select>
          </div>
        </div>
        <div class="card-body">
          <table class="inspection-table">
            <thead>
              <tr>
                <th>工单号</th><th>产品编码</th><th>工序</th><th>检验点</th>
                <th>抽检数</th><th>合格数</th><th>不良数</th><th>合格率</th><th>结果</th><th>操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="ins in filteredInspections" :key="ins.id" class="ins-row">
                <td>{{ ins.workOrderId }}</td>
                <td>{{ ins.productCode }}</td>
                <td>{{ ins.processName }}</td>
                <td>{{ ins.inspectionPoint }}</td>
                <td>{{ ins.inspectionQuantity }}</td>
                <td class="green">{{ ins.qualifiedQuantity }}</td>
                <td class="red">{{ ins.defectQuantity }}</td>
                <td>
                  <span class="pass-badge" :class="ins.passRate >= 95 ? 'high' : ins.passRate >= 80 ? 'mid' : 'low'">
                    {{ ins.passRate }}%
                  </span>
                </td>
                <td>
                  <span class="result-badge" :class="ins.result">{{ ins.result === 'pass' ? '合格' : ins.result === 'fail' ? '不合格' : '返工' }}</span>
                </td>
                <td>
                  <button class="action-btn" :aria-label="`查看 ${ins.id} 根因分析`" @click="showAnalysis(ins.id)">
                    根因分析
                  </button>
                </td>
              </tr>
              <tr v-if="!filteredInspections.length">
                <td colspan="10" class="empty-state">{{ inspectionEmptyMessage }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- 根因分析浮动面板 -->
      <Transition name="slide-up">
        <div
          v-if="currentAnalysis"
          class="analysis-panel"
          role="dialog"
          aria-modal="true"
          aria-labelledby="root-cause-analysis-title"
        >
          <div class="analysis-header">
            <h4 id="root-cause-analysis-title">根因分析 — {{ currentAnalysis.inspectionId }}</h4>
            <button class="close-btn" aria-label="关闭根因分析" @click="currentAnalysis = null">✕</button>
          </div>
          <div class="analysis-body">
            <div class="analysis-section">
              <h5>可能的根因</h5>
              <div v-for="rc in currentAnalysis.rootCauses" :key="rc.cause" class="cause-item">
                <div class="cause-header">
                  <span class="cause-name">{{ rc.cause }}</span>
                  <span class="cause-prob">{{ (rc.probability * 100).toFixed(0) }}%</span>
                </div>
                <div class="prob-bar">
                  <div class="prob-fill" :style="{ width: rc.probability * 100 + '%' }"></div>
                </div>
                <div class="cause-evidence">{{ rc.evidence }}</div>
              </div>
            </div>
            <div class="analysis-section">
              <h5>纠正措施</h5>
              <ul><li v-for="a in currentAnalysis.correctiveActions" :key="a">{{ a }}</li></ul>
            </div>
            <div class="analysis-section">
              <h5>预防措施</h5>
              <ul><li v-for="p in currentAnalysis.preventiveMeasures" :key="p">{{ p }}</li></ul>
            </div>
            <div class="analysis-section summary">
              <strong>分析摘要：</strong>{{ currentAnalysis.analysisSummary }}
            </div>
          </div>
        </div>
      </Transition>
    </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import http from '../../api/http'
import { getInspections, getQualityStatistics, analyzeRootCause, analyzeSpcTrend } from '../../api/quality'
import type { InspectionDto, QualityStatisticsDto, RootCauseAnalysisDto, AnomalyDto } from '../../types/quality'
import QualityReworkImpactPanel from './QualityReworkImpactPanel.vue'
import QualityCapaTaskPanel from './QualityCapaTaskPanel.vue'
import QualityMrbDispositionPanel from './QualityMrbDispositionPanel.vue'
import {
  buildQualityReworkImpact,
  selectQualityReworkInspection,
  writeQualityReworkImpact,
  type QualityReworkImpact,
} from '../../utils/quality-rework-sync'
import {
  buildQualityMrbDispositionRecord,
  closeQualityMrbDispositionRecord,
  readQualityMrbDispositionRecord,
  readQualityMrbDispositionRecordBackendFirst,
  writeQualityMrbDispositionRecord,
  type QualityMrbDispositionRecord,
} from '../../utils/quality-mrb-disposition-sync'
import {
  readOtdEvidenceChainRecords,
  upsertOtdEvidenceChainRecord,
  type OtdEvidenceChainItem,
} from '../../utils/otd-evidence-chain-sync'
import {
  createBarcodeQualityReuseDraft,
  createBarcodeQualityKnowledgeSample,
  readLatestQualityKnowledgeReuseDraft,
  readLatestQualityKnowledgeSample,
  writeQualityKnowledgeReuseDraft,
  writeQualityKnowledgeSample,
  type QualityKnowledgeReuseDraftRecord,
  type QualityKnowledgeSampleRecord,
} from '../../utils/quality-knowledge-sample-sync'

const stats = reactive<QualityStatisticsDto>({
  totalInspections: 0, passedCount: 0, failedCount: 0,
  reworkCount: 0, passRate: 0, defectRate: 0, reworkRate: 0,
})

const inspections = ref<InspectionDto[]>([])
const route = useRoute()
const anomalies = ref<AnomalyDto[]>([])
const resultFilter = ref('')
const analysisMap = reactive<Record<string, RootCauseAnalysisDto>>({})
const analysisPendingMap: Record<string, Promise<RootCauseAnalysisDto>> = {}
let latestAnalysisInspectionId = ''
const currentAnalysis = ref<RootCauseAnalysisDto | null>(null)
const qualityError = ref('')
const reworkSyncMessage = ref('')
const mrbSyncMessage = ref('')
const otdEvidenceRecords = ref<OtdEvidenceChainItem[]>([])
const barcodeReleaseMessage = ref('')
const qualityKnowledgeSample = ref<QualityKnowledgeSampleRecord | null>(readLatestQualityKnowledgeSample())
const qualityKnowledgeReuseDraft = ref<QualityKnowledgeReuseDraftRecord | null>(readLatestQualityKnowledgeReuseDraft())
const qualityMrbDisposition = ref<QualityMrbDispositionRecord | null>(readQualityMrbDispositionRecord())
const qualityMrbPreview = ref<QualityMrbDispositionRecord>(qualityMrbDisposition.value ?? buildQualityMrbDispositionRecord('2026-05-21T09:30:00.000Z'))
const qualityReworkEvent = ref<QualityReworkImpact>({
  inspectionId: 'INS-003',
  workOrderId: 'WO-003',
  productCode: 'PRD-003',
  processName: '热处理',
  equipmentCode: 'HT-01',
  materialBatchCode: 'MAT-AL6061-B03',
  batchCode: 'WO-003-HT',
  inspectionPoint: '终检',
  defectQuantity: 2,
  reworkHours: 6,
  otdImpact: 'WO-003 延期 +1 单风险',
  recommendedAction: '建议插入热处理返工窗口，锁定质检复验时间，并把 WO-DEMO-1007 的热处理批次合并，降低二次换线。',
  rootCause: '硬度不足 / 热处理参数漂移',
  evidence: [
    '终检 检验结果 返工',
    'HT-01 关联工序 热处理',
    '物料批次 MAT-AL6061-B03',
    '批次号 WO-003-HT',
  ],
  createdAt: '2026-05-20T10:00:00',
})

const auditFocus = computed(() => {
  const objectType = String(route.query.auditObjectType ?? '')
  const objectId = String(route.query.auditObjectId ?? '')
  const traceId = String(route.query.auditTraceId ?? '')
  const label = String(route.query.auditObjectLabel ?? objectId)
  if (objectType !== 'quality-inspection' || !objectId || !traceId) return null
  return { objectType, objectId, traceId, label }
})

// SPC
const spcParam = ref('surface_roughness')
const spcData = ref<{ x: number; y: number; label: string }[]>([])
const spcAlert = ref<{ type: string; message: string } | null>(null)
const spcRecommend = ref('')
const chartW = 600; const chartH = 200; const pad = 50

const filteredInspections = computed(() => {
  if (!resultFilter.value) return inspections.value
  return inspections.value.filter(i => i.result === resultFilter.value)
})
const inspectionEmptyMessage = computed(() =>
  inspections.value.length ? '暂无匹配检验记录' : '暂无检验记录'
)

const barcodeQualityGateRecords = computed(() =>
  otdEvidenceRecords.value.filter(record =>
    record.traceId.startsWith('TRACE-QR-')
    && ['质量门', '工序交接', '扫码返工', '交接冻结', '质量CAPA', '质量隔离', '返工成本', '标签状态', '质量复验', '交接释放', '排产回写'].includes(record.stage)
  )
)
const barcodeFrozenGate = computed(() =>
  barcodeQualityGateRecords.value.find(record =>
    record.traceId === 'TRACE-QR-WO-RUSH-9001-OP-10-REWORK'
    && record.stage === '扫码返工'
  ) ?? null
)
const barcodeReleaseRecord = computed(() =>
  barcodeQualityGateRecords.value.find(record =>
    record.traceId === 'TRACE-QR-WO-RUSH-9001-OP-10-RELEASE-OP-20'
    && record.stage === '交接释放'
  ) ?? null
)
const previewReuseDimensions = [
  { label: '工序', target: 'CNC 精加工' },
  { label: '设备', target: 'CNC-002' },
  { label: '材料族', target: 'AL-202605-B' },
  { label: '缺陷模式', target: '首件尺寸偏差' },
]

const spcPoints = computed(() => spcData.value.map(p => `${p.x},${p.y}`).join(' '))
const uclY = computed(() => pad + 20)
const lclY = computed(() => chartH - pad + 10)
const clY = computed(() => (uclY.value + lclY.value) / 2)

function formatTime(t: string) {
  return new Date(t).toLocaleString('zh-CN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })
}

function handleCreateReworkEvent(event: QualityReworkImpact) {
  const impact = {
    ...event,
    createdAt: new Date().toISOString(),
  }
  writeQualityReworkImpact(impact)
  qualityReworkEvent.value = impact
  reworkSyncMessage.value = '返工排产事件已生成：排产工作台将出现质量返工触发器，报表中心会纳入 OTD 复盘。'
}

async function refreshQualityMrbDisposition() {
  try {
    qualityMrbDisposition.value = await readQualityMrbDispositionRecordBackendFirst()
    qualityError.value = ''
  } catch (e: unknown) {
    qualityError.value = `MRB 处置证据加载失败：${e instanceof Error ? e.message : '请稍后重试'}`
  }
  qualityMrbPreview.value = qualityMrbDisposition.value ?? buildQualityMrbDispositionRecord('2026-05-21T09:30:00.000Z')
}

function handleCreateMrbDisposition() {
  try {
    const record = writeQualityMrbDispositionRecord(buildQualityMrbDispositionRecord(new Date().toISOString()))
    qualityMrbDisposition.value = record
    qualityMrbPreview.value = record
    refreshOtdEvidenceRecords()
    mrbSyncMessage.value = 'MRB 报废补料决策已生成：排产工作台将出现 WO-004 报废补料重排事件，报表、治理和审计回放将读取同一追踪号。'
    if (qualityError.value.startsWith('MRB 处置证据写入失败')) qualityError.value = ''
  } catch (e: unknown) {
    qualityError.value = `MRB 处置证据写入失败：${e instanceof Error ? e.message : '请稍后重试'}`
  }
}

function handleCloseMrbDisposition() {
  try {
    const record = closeQualityMrbDispositionRecord('生产经理')
    if (!record) return
    qualityMrbDisposition.value = record
    qualityMrbPreview.value = record
    refreshOtdEvidenceRecords()
    mrbSyncMessage.value = 'MRB 处置闭环已确认：隔离、补料 ETA、排产重建和客户说明均已回写，排产事件转为复核状态。'
    if (qualityError.value.startsWith('MRB 处置闭环写入失败')) qualityError.value = ''
  } catch (e: unknown) {
    qualityError.value = `MRB 处置闭环写入失败：${e instanceof Error ? e.message : '请稍后重试'}`
  }
}

function syncQualityReworkFromInspections() {
  const target = selectQualityReworkInspection(inspections.value)
  if (!target) return
  const impact = buildQualityReworkImpact(target)
  writeQualityReworkImpact(impact)
  qualityReworkEvent.value = impact
  reworkSyncMessage.value = `检验结果 ${target.result === 'fail' ? '不合格' : '返工'} 已自动生成返工排产事件。`
}

function refreshOtdEvidenceRecords() {
  otdEvidenceRecords.value = readOtdEvidenceChainRecords()
}

function refreshQualityKnowledgeSample() {
  qualityKnowledgeSample.value = readLatestQualityKnowledgeSample()
}

function refreshQualityKnowledgeReuseDraft() {
  qualityKnowledgeReuseDraft.value = readLatestQualityKnowledgeReuseDraft()
}

function publishBarcodeQualityKnowledgeSample() {
  try {
    const record = writeQualityKnowledgeSample(createBarcodeQualityKnowledgeSample(new Date().toISOString()))
    qualityKnowledgeSample.value = record
    refreshOtdEvidenceRecords()
    barcodeReleaseMessage.value = '扫码质量样本已沉淀：CAPA 推荐、知识库引用和审计回放将复用同一条质量知识证据。'
    if (qualityError.value.startsWith('质量知识样本写入失败')) qualityError.value = ''
  } catch (e: unknown) {
    qualityError.value = `质量知识样本写入失败：${e instanceof Error ? e.message : '请稍后重试'}`
  }
}

function generateQualityKnowledgeReuseDraft() {
  if (!qualityKnowledgeSample.value) return
  try {
    const draft = writeQualityKnowledgeReuseDraft(createBarcodeQualityReuseDraft(qualityKnowledgeSample.value, new Date().toISOString()))
    qualityKnowledgeReuseDraft.value = draft
    refreshOtdEvidenceRecords()
    barcodeReleaseMessage.value = `同类缺陷处置草案已生成：${draft.targetWorkOrderId} 命中 ${draft.matchScore}%，复用效果评分 ${draft.effectScore} 分，等待质量工程师复核。`
    if (qualityError.value.startsWith('质量知识复用草案写入失败')) qualityError.value = ''
  } catch (e: unknown) {
    qualityError.value = `质量知识复用草案写入失败：${e instanceof Error ? e.message : '请稍后重试'}`
  }
}

function closeExistingBarcodeFreezeRecord(id: string, traceId: string, stage: string, title: string, statusLabel: string) {
  const current = otdEvidenceRecords.value.find(record => record.id === id || record.traceId === traceId)
  if (!current) return
  upsertOtdEvidenceChainRecord({
    ...current,
    stage,
    title,
    status: 'closed',
    statusLabel,
    createdAt: new Date().toISOString(),
  })
}

function releaseBarcodeReworkGate() {
  try {
    closeExistingBarcodeFreezeRecord(
      'barcode-rework-WO-RUSH-9001-OP-10',
      'TRACE-QR-WO-RUSH-9001-OP-10-REWORK',
      '扫码返工',
      'WO-RUSH-9001 CNC 精加工 扫码返工复验通过',
      '返工复验已通过'
    )
    closeExistingBarcodeFreezeRecord(
      'barcode-hold-WO-RUSH-9001-OP-10-OP-20',
      'TRACE-QR-WO-RUSH-9001-OP-10-HOLD-OP-20',
      '交接冻结',
      'WO-RUSH-9001 OP-10 到 OP-20 冻结已释放',
      '交接冻结已释放'
    )
    closeExistingBarcodeFreezeRecord(
      'barcode-capa-WO-RUSH-9001-OP-10',
      'TRACE-QR-WO-RUSH-9001-OP-10-CAPA',
      '质量CAPA',
      'WO-RUSH-9001 CNC 精加工 扫码 CAPA 已验证',
      'CAPA 已验证'
    )
    closeExistingBarcodeFreezeRecord(
      'barcode-isolation-WO-RUSH-9001-OP-10',
      'TRACE-QR-WO-RUSH-9001-OP-10-ISOLATION',
      '质量隔离',
      'WO-RUSH-9001 CNC 精加工 AL-202605 隔离批次复验释放',
      '隔离已解除'
    )
    closeExistingBarcodeFreezeRecord(
      'barcode-rework-cost-WO-RUSH-9001-OP-10',
      'TRACE-QR-WO-RUSH-9001-OP-10-REWORK-COST',
      '返工成本',
      'WO-RUSH-9001 CNC 精加工 返工工时成本已结算',
      '成本已归档'
    )
    closeExistingBarcodeFreezeRecord(
      'barcode-label-hold-WO-RUSH-9001-OP-10',
      'TRACE-QR-WO-RUSH-9001-OP-10-LABEL-HOLD',
      '标签状态',
      'WO-RUSH-9001 流转卡标签冻结已解除',
      '冻结标签已解除'
    )
    const createdAt = new Date().toISOString()
    upsertOtdEvidenceChainRecord({
      id: 'barcode-recheck-WO-RUSH-9001-OP-10',
      stage: '质量复验',
      title: 'WO-RUSH-9001 CNC 精加工 返工复验放行',
      summary: '扫码返工证据 TRACE-QR-WO-RUSH-9001-OP-10-REWORK 已完成复验：返工后首件尺寸和 Ra 粗糙度复检合格，允许释放下道接收。',
      object: 'WO-RUSH-9001 / OP-10',
      source: '质量闭环 / 复验放行 / 质量工程师 周工',
      traceId: 'TRACE-QR-WO-RUSH-9001-OP-10-RECHECK',
      status: 'closed',
      statusLabel: '复验已放行',
      createdAt,
    })
    upsertOtdEvidenceChainRecord({
      id: 'barcode-release-WO-RUSH-9001-OP-10-OP-20',
      stage: '交接释放',
      title: 'WO-RUSH-9001 OP-20 接收已释放',
      summary: '质量复验放行后解除 OP-10 到 OP-20 的交接冻结，OP-20 装配复检可接收 30 件并按更新后的排产窗口开工。',
      object: 'WO-RUSH-9001',
      source: '质量闭环 / 工序交接 / OP-20',
      traceId: 'TRACE-QR-WO-RUSH-9001-OP-10-RELEASE-OP-20',
      status: 'ready',
      statusLabel: 'OP-20 可接收',
      createdAt,
    })
    upsertOtdEvidenceChainRecord({
      id: 'barcode-schedule-release-WO-RUSH-9001-OP-20',
      stage: '排产回写',
      title: 'WO-RUSH-9001 OP-20 接收窗口已恢复',
      summary: '质量冻结解除后，AI 排产可重新安排 OP-20 装配复检窗口，保留返工复验耗时并更新 OTD 复盘口径。',
      object: 'WO-RUSH-9001 / OP-20',
      source: '质量闭环 / AI 排产',
      traceId: 'TRACE-QR-WO-RUSH-9001-OP-10-SCHEDULE-RELEASE',
      status: 'ready',
      statusLabel: '后段可排',
      createdAt,
    })
    upsertOtdEvidenceChainRecord({
      id: 'barcode-label-release-WO-RUSH-9001-OP-10',
      stage: '标签状态',
      title: 'WO-RUSH-9001 流转卡标签已解冻',
      summary: '实物流转卡标签状态已从质量冻结更新为复验放行，现场扫码可继续进入 OP-20 接收确认。',
      object: 'WO-RUSH-9001',
      source: '条码 / QR 打印 / 质量复验',
      traceId: 'TRACE-QR-WO-RUSH-9001-OP-10-LABEL-RELEASE',
      status: 'closed',
      statusLabel: '质量冻结已解除',
      createdAt,
    })
    refreshOtdEvidenceRecords()
    barcodeReleaseMessage.value = '返工复验已放行：OP-20 接收、排产窗口和流转卡标签状态均已更新。'
    if (qualityError.value.startsWith('扫码质量门释放写入失败')) qualityError.value = ''
  } catch (e: unknown) {
    qualityError.value = `扫码质量门释放写入失败：${e instanceof Error ? e.message : '请稍后重试'}`
  }
}

function buildDemoRootCauseAnalysis(id: string): RootCauseAnalysisDto {
  return {
    inspectionId: id,
    rootCauses: [
      { cause: '刀具磨损超差', probability: 0.65, evidence: 'CNC-001 已连续运行 320 小时，超过推荐换刀周期 240 小时' },
      { cause: '冷却液温度偏高', probability: 0.25, evidence: '加工区域温度 38°C，超出工艺要求 35°C' },
      { cause: '来料硬度波动', probability: 0.10, evidence: '批次 AL-6061 硬度检测值 HB95-105，标准要求 HB100±3' },
    ],
    correctiveActions: ['立即更换 CNC-001 刀具', '检查冷却系统循环泵', '对该批次来料进行 100% 硬度分选'],
    preventiveMeasures: ['建立刀具寿命看板，提前 20 小时预警', '加装冷却液温度在线监测', '来料检验增加硬度检测频次'],
    analysisSummary: '主要根因为刀具磨损导致表面粗糙度超差，建议加强刀具寿命管理和冷却系统维护。',
  }
}

async function showAnalysis(id: string) {
  latestAnalysisInspectionId = id
  if (analysisMap[id]) { currentAnalysis.value = analysisMap[id]; return }
  currentAnalysis.value = null

  const pendingAnalysis = analysisPendingMap[id]
  if (pendingAnalysis) {
    const result = await pendingAnalysis
    if (latestAnalysisInspectionId === id) currentAnalysis.value = result
    return
  }

  const request = analyzeRootCause(id)
    .then(result => {
      if (latestAnalysisInspectionId === id && qualityError.value.startsWith('根因分析加载失败')) qualityError.value = ''
      return result
    })
    .catch((e: unknown) => {
      if (latestAnalysisInspectionId === id) {
        qualityError.value = `根因分析加载失败：${e instanceof Error ? e.message : '请稍后重试'}`
      }
      return buildDemoRootCauseAnalysis(id)
    })
    .then(result => {
      analysisMap[id] = result
      return result
    })
    .finally(() => {
      delete analysisPendingMap[id]
    })

  analysisPendingMap[id] = request
  const result = await request
  if (latestAnalysisInspectionId === id) currentAnalysis.value = result
}

async function applyAuditFocus() {
  const focus = auditFocus.value
  if (!focus) return
  let target = inspections.value.find(inspection => inspection.id === focus.objectId)
  let createdAuditPlaceholder = false
  if (!target) {
    target = {
      id: focus.objectId,
      workOrderId: '审计回放对象',
      productCode: 'AUDIT-TRACE',
      processName: 'Agent 质量处置',
      inspectionPoint: '审计定位',
      inspectionQuantity: 2,
      qualifiedQuantity: 0,
      defectQuantity: 2,
      result: 'fail',
      inspectorId: 'agent-audit',
      inspectedAt: new Date().toISOString(),
      passRate: 0,
    }
    createdAuditPlaceholder = true
    inspections.value = [target, ...inspections.value]
  }
  if (createdAuditPlaceholder) {
    const analysis = buildDemoRootCauseAnalysis(target.id)
    analysisMap[target.id] = analysis
    latestAnalysisInspectionId = target.id
    currentAnalysis.value = analysis
    return
  }
  await showAnalysis(target.id)
}

function generateSpcData(param: string) {
  const len = 24
  const points: { x: number; y: number; label: string }[] = []
  const drawW = chartW - pad * 2
  for (let i = 0; i < len; i++) {
    const x = pad + (i / (len - 1)) * drawW
    let y: number
    if (param === 'surface_roughness') {
      y = chartH / 2 + Math.sin(i * 0.6) * 20 + (i > 18 ? 15 : 0) + (Math.random() - 0.5) * 8
    } else if (param === 'dimension_tolerance') {
      y = chartH / 2 + Math.cos(i * 0.4) * 15 + (Math.random() - 0.5) * 6
    } else {
      y = chartH / 2 + Math.sin(i * 0.3) * 10 + (Math.random() - 0.5) * 5
    }
    points.push({ x, y: Math.max(pad + 10, Math.min(chartH - pad + 5, y)), label: `点${i + 1}: ${y.toFixed(1)}` })
  }
  spcData.value = points

  if (param === 'surface_roughness') {
    spcAlert.value = { type: 'warning', message: '⚠ 检测到上升趋势，最近 6 点持续上升，建议检查刀具状态' }
    spcRecommend.value = '建议：检查 CNC-001 刀具磨损情况，必要时更换刀具并重新校准。'
  } else {
    spcAlert.value = null
    spcRecommend.value = ''
  }
}

async function loadSpc() {
  const requestedParam = spcParam.value
  try {
    const result = await analyzeSpcTrend(requestedParam)
    if (spcParam.value !== requestedParam) return
    const drawW = chartW - pad * 2
    spcData.value = result.dataPoints.map((v, i) => ({
      x: pad + (i / Math.max(result.dataPoints.length - 1, 1)) * drawW,
      y: chartH / 2 - (v / 100) * 60,
      label: `点${i + 1}: ${v.toFixed(1)}`,
    }))
    if (result.hasTrend) {
      spcAlert.value = { type: 'warning', message: `⚠ ${result.trendDirection}趋势，建议关注` }
    } else { spcAlert.value = null }
    spcRecommend.value = result.recommendedAction || ''
    if (qualityError.value.startsWith('SPC 趋势分析加载失败')) qualityError.value = ''
  } catch (e: unknown) {
    if (spcParam.value === requestedParam) {
      qualityError.value = `SPC 趋势分析加载失败：${e instanceof Error ? e.message : '请稍后重试'}`
      generateSpcData(requestedParam)
    }
  }
}

onMounted(async () => {
  refreshOtdEvidenceRecords()
  refreshQualityKnowledgeSample()
  refreshQualityKnowledgeReuseDraft()
  await refreshQualityMrbDisposition()

  // 加载统计数据
  try {
    const s = await getQualityStatistics()
    Object.assign(stats, s)
  } catch {
    Object.assign(stats, {
      totalInspections: 45, passedCount: 42, failedCount: 2, reworkCount: 1,
      passRate: 93.3, defectRate: 4.4, reworkRate: 2.2,
    })
  }

  // 加载检验批次
  try {
    const result = await getInspections()
    if (!Array.isArray(result)) throw new Error('后端返回非数组质检载荷')
    inspections.value = result
  } catch (e: unknown) {
    qualityError.value = `质检批次加载失败，已显示本地演示批次：${e instanceof Error ? e.message : '请稍后重试'}`
    inspections.value = [
      { id: 'INS-001', workOrderId: 'WO-001', productCode: 'PRD-001', processName: 'CNC精加工', inspectionPoint: '尺寸检验', inspectionQuantity: 50, qualifiedQuantity: 48, defectQuantity: 2, result: 'pass', inspectorId: 'USR-001', inspectedAt: '2026-05-11T10:30:00', passRate: 96 },
      { id: 'INS-002', workOrderId: 'WO-002', productCode: 'PRD-002', processName: '注塑成型', inspectionPoint: '外观检验', inspectionQuantity: 100, qualifiedQuantity: 97, defectQuantity: 3, result: 'pass', inspectorId: 'USR-002', inspectedAt: '2026-05-11T14:00:00', passRate: 97 },
      { id: 'INS-003', workOrderId: 'WO-003', productCode: 'PRD-003', processName: '热处理', inspectionPoint: '硬度检测', inspectionQuantity: 20, qualifiedQuantity: 18, defectQuantity: 2, result: 'rework', inspectorId: 'USR-001', inspectedAt: '2026-05-12T08:00:00', passRate: 90 },
      { id: 'INS-004', workOrderId: 'WO-004', productCode: 'PRD-001', processName: '装配', inspectionPoint: '功能测试', inspectionQuantity: 30, qualifiedQuantity: 26, defectQuantity: 4, result: 'fail', inspectorId: 'USR-003', inspectedAt: '2026-05-12T09:00:00', passRate: 86.7 },
      { id: 'INS-005', workOrderId: 'WO-005', productCode: 'PRD-004', processName: 'CNC精加工', inspectionPoint: '尺寸检验', inspectionQuantity: 40, qualifiedQuantity: 40, defectQuantity: 0, result: 'pass', inspectorId: 'USR-002', inspectedAt: '2026-05-12T11:00:00', passRate: 100 },
    ]
  }
  await applyAuditFocus()
  syncQualityReworkFromInspections()

  // 异常数据
  try {
    const { data } = await http.get('/anomaly')
    anomalies.value = data.items ?? data
  } catch (e: unknown) {
    qualityError.value = `质量异常告警加载失败：${e instanceof Error ? e.message : '请稍后重试'}`
    anomalies.value = [
      { id: 'ANM-001', workOrderId: 'WO-004', anomalyType: '尺寸超差', severity: 'critical', description: '装配后轴孔配合间隙 0.12mm，超过 0.08mm 标准上限', status: 'open', detectedAt: '2026-05-12T09:15:00' },
      { id: 'ANM-002', workOrderId: 'WO-003', anomalyType: '硬度不足', severity: 'major', description: '热处理后硬度 HB89，低于 HB95 标准下限', status: 'investigating', detectedAt: '2026-05-12T08:30:00' },
      { id: 'ANM-003', workOrderId: 'WO-001', anomalyType: '表面粗糙度', severity: 'minor', description: 'Ra 3.6μm，接近 3.2μm 标准上限，建议监控', status: 'open', detectedAt: '2026-05-11T16:00:00' },
    ]
  }

  await loadSpc()
})
</script>

<style scoped>
.quality-board {
  padding: 24px;
  max-width: 1400px;
  margin: 0 auto;
  overflow-y: auto;
  height: 100%;
}
/* KPI */
.kpi-row {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
}
.kpi-card {
  display: flex;
  align-items: center;
  gap: 16px;
  background: #fff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.06);
}
.kpi-icon {
  width: 48px; height: 48px; border-radius: 12px;
  display: flex; align-items: center; justify-content: center;
  font-size: 20px; flex-shrink: 0;
}
.kpi-body { display: flex; flex-direction: column; }
.kpi-value { font-size: 28px; font-weight: 700; line-height: 1.2; }
.kpi-label { font-size: 13px; color: #888; }

.audit-focus-banner {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
  padding: 10px 12px;
  border: 1px solid #c7d2fe;
  border-radius: 6px;
  background: #eef2ff;
}
.audit-focus-banner span { display: block; color: #4338ca; font-size: 12px; font-weight: 700; }
.audit-focus-banner strong { display: block; color: #111827; font-size: 14px; }
.audit-focus-banner p { margin: 2px 0 0; color: #4b5563; font-size: 12px; }
.audit-focus-banner code { color: #3730a3; font-size: 12px; }

.quality-error {
  margin-bottom: 16px;
  padding: 10px 12px;
  border: 1px solid #fecaca;
  border-radius: 6px;
  background: #fff1f2;
  color: #b91c1c;
  font-size: 13px;
  font-weight: 700;
}

.barcode-quality-gate-panel {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 16px;
  padding: 14px;
  border: 1px solid #bbf7d0;
  border-radius: 8px;
  background: #f0fdf4;
}

.panel-heading,
.quality-card-topline,
.quality-card-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.panel-heading span {
  display: block;
  margin-bottom: 3px;
  color: #15803d;
  font-size: 12px;
  font-weight: 700;
}

.panel-heading h3,
.barcode-quality-card h4,
.barcode-quality-card p {
  margin: 0;
}

.panel-heading h3 {
  color: #111827;
  font-size: 16px;
}

.panel-heading em,
.quality-card-topline span,
.quality-card-topline em,
.quality-card-meta span {
  padding: 2px 7px;
  border-radius: 4px;
  background: #dcfce7;
  color: #15803d;
  font-size: 12px;
  font-style: normal;
  font-weight: 700;
}

.barcode-release-banner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 12px;
  border: 1px solid #fed7aa;
  border-radius: 6px;
  background: #fff7ed;
}

.barcode-release-banner.released {
  border-color: #86efac;
  background: #f0fdf4;
}

.barcode-release-banner strong {
  display: block;
  margin-bottom: 4px;
  color: #9a3412;
  font-size: 14px;
}

.barcode-release-banner.released strong {
  color: #047857;
}

.barcode-release-banner p {
  margin: 0;
  color: #4b5563;
  font-size: 12px;
  line-height: 1.45;
}

.barcode-release-banner button {
  flex: 0 0 auto;
  padding: 7px 12px;
  border: 1px solid #16a34a;
  border-radius: 4px;
  background: #16a34a;
  color: #fff;
  cursor: pointer;
  font-size: 12px;
  font-weight: 700;
}

.barcode-release-banner button:hover {
  background: #15803d;
  border-color: #15803d;
}

.barcode-release-message {
  margin: 0;
  padding: 8px 10px;
  border: 1px solid #bbf7d0;
  border-radius: 4px;
  background: #fff;
  color: #047857;
  font-size: 12px;
  font-weight: 700;
}

.barcode-quality-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 10px;
}

.barcode-quality-card {
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-height: 150px;
  padding: 12px;
  border: 1px solid #86efac;
  border-radius: 6px;
  background: #fff;
}

.barcode-quality-card.ready {
  border-color: #bfdbfe;
  background: #eff6ff;
}

.barcode-quality-card.active {
  border-color: #fde68a;
  background: #fffbeb;
}

.barcode-quality-card h4 {
  color: #111827;
  font-size: 14px;
}

.barcode-quality-card p {
  color: #4b5563;
  font-size: 12px;
  line-height: 1.45;
}

.quality-card-meta code {
  color: #1d4ed8;
  font-size: 12px;
  overflow-wrap: anywhere;
}

.barcode-knowledge-sample-panel {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(220px, 0.55fr);
  gap: 10px;
  padding: 12px;
  border: 1px solid #bae6fd;
  border-radius: 6px;
  background: #f8fbff;
}

.barcode-knowledge-sample-panel span {
  display: block;
  margin-bottom: 3px;
  color: #0369a1;
  font-size: 12px;
  font-weight: 700;
}

.barcode-knowledge-sample-panel h4,
.barcode-knowledge-sample-panel p {
  margin: 0;
}

.barcode-knowledge-sample-panel h4 {
  color: #111827;
  font-size: 14px;
}

.barcode-knowledge-sample-panel p {
  color: #4b5563;
  font-size: 12px;
  line-height: 1.45;
}

.sample-dimensions,
.sample-synced {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.sample-dimensions span,
.sample-synced span {
  margin: 0;
  padding: 2px 7px;
  border-radius: 4px;
  background: #e0f2fe;
  color: #0369a1;
}

.barcode-knowledge-sample-panel button {
  grid-column: 1 / -1;
  width: fit-content;
  padding: 7px 12px;
  border: 1px solid #0284c7;
  border-radius: 4px;
  background: #0284c7;
  color: #fff;
  cursor: pointer;
  font-size: 12px;
  font-weight: 700;
}

.barcode-knowledge-sample-panel button:hover {
  background: #0369a1;
  border-color: #0369a1;
}

.sample-synced {
  align-content: flex-start;
}

.sample-synced strong,
.sample-synced code {
  width: 100%;
  color: #111827;
  font-size: 12px;
  overflow-wrap: anywhere;
}

.sample-synced code {
  color: #1d4ed8;
}

.reuse-draft-card {
  grid-column: 1 / -1;
  display: flex;
  flex-direction: column;
  gap: 9px;
  padding: 10px;
  border: 1px solid #c4b5fd;
  border-radius: 6px;
  background: #fbfaff;
}

.reuse-draft-card.synced {
  border-color: #86efac;
  background: #f7fef9;
}

.reuse-draft-heading {
  display: flex;
  justify-content: space-between;
  gap: 12px;
}

.reuse-draft-heading strong {
  flex: 0 0 auto;
  color: #7c3aed;
  font-size: 20px;
  line-height: 1.1;
}

.reuse-draft-card.synced .reuse-draft-heading strong {
  color: #047857;
}

.reuse-match-grid,
.reuse-effect-metrics {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.reuse-match-grid span,
.reuse-effect-metrics span {
  margin: 0;
  padding: 2px 7px;
  border-radius: 4px;
  background: #ede9fe;
  color: #6d28d9;
}

.reuse-draft-card.synced .reuse-match-grid span,
.reuse-draft-card.synced .reuse-effect-metrics span {
  background: #dcfce7;
  color: #166534;
}

.reuse-draft-result {
  display: flex;
  flex-direction: column;
  gap: 7px;
}

.reuse-draft-result strong,
.reuse-draft-result code {
  color: #111827;
  font-size: 12px;
  overflow-wrap: anywhere;
}

.reuse-draft-result code {
  color: #1d4ed8;
}

.reuse-draft-result ul {
  display: grid;
  gap: 4px;
  margin: 0;
  padding-left: 18px;
  color: #4b5563;
  font-size: 12px;
  line-height: 1.45;
}

/* Cards */
.board-grid {
  display: grid;
  grid-template-columns: 1.5fr 1fr;
  gap: 16px;
  margin-bottom: 16px;
}
.card {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.06);
  overflow: hidden;
}
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 16px;
  border-bottom: 1px solid #f5f5f5;
}
.card-header h3 { margin: 0; font-size: 15px; }
.card-body { padding: 12px 16px; }

/* SPC */
.param-select {
  padding: 4px 8px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  font-size: 13px;
  outline: none;
}
.spc-chart-container { width: 100%; }
.spc-chart { width: 100%; height: 200px; }
.spc-empty-state {
  margin-top: -16px;
  color: #888;
  font-size: 13px;
  text-align: center;
}
.spc-alert {
  margin-top: 8px;
  padding: 8px 12px;
  border-radius: 4px;
  font-size: 13px;
}
.spc-alert.warning { background: #fffbe6; color: #d4b106; }
.spc-recommend {
  margin-top: 6px;
  padding: 8px 12px;
  background: #f6ffed;
  border-radius: 4px;
  font-size: 13px;
  color: #52c41a;
}

/* Anomalies */
.anomalies-body { display: flex; flex-direction: column; gap: 8px; max-height: 380px; overflow-y: auto; }
.anomaly-item {
  padding: 10px 12px;
  border-radius: 6px;
  border-left: 3px solid;
}
.anomaly-item.critical { background: #fff2f0; border-color: #ff4d4f; }
.anomaly-item.major { background: #fffbe6; border-color: #faad14; }
.anomaly-item.minor { background: #f6ffed; border-color: #52c41a; }
.anomaly-header { display: flex; gap: 8px; align-items: center; margin-bottom: 4px; }
.anomaly-badge {
  padding: 1px 6px; border-radius: 3px; font-size: 11px; font-weight: 600;
}
.anomaly-badge.critical { background: #ff4d4f; color: #fff; }
.anomaly-badge.major { background: #faad14; color: #fff; }
.anomaly-badge.minor { background: #52c41a; color: #fff; }
.anomaly-type { font-weight: 600; font-size: 13px; flex: 1; }
.anomaly-status { font-size: 11px; padding: 1px 6px; border-radius: 3px; }
.anomaly-status.open { background: #fff2f0; color: #ff4d4f; }
.anomaly-status.investigating { background: #fffbe6; color: #d4b106; }
.anomaly-status.resolved { background: #f6ffed; color: #52c41a; }
.anomaly-desc { font-size: 13px; color: #555; margin-bottom: 4px; }
.anomaly-meta { font-size: 11px; color: #999; display: flex; gap: 16px; }

/* Inspection table */
.inspections-card { margin-bottom: 0; }
.inspection-filters { display: flex; gap: 8px; }
.filter-select {
  padding: 4px 8px; border: 1px solid #d9d9d9; border-radius: 4px; font-size: 13px; outline: none;
}
.inspection-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}
.inspection-table th {
  text-align: left;
  padding: 10px 8px;
  border-bottom: 2px solid #f0f0f0;
  color: #888;
  font-weight: 600;
  white-space: nowrap;
}
.inspection-table td {
  padding: 10px 8px;
  border-bottom: 1px solid #f5f5f5;
}
.ins-row:hover { background: #fafafa; }
.green { color: #52c41a; font-weight: 600; }
.red { color: #ff4d4f; font-weight: 600; }
.pass-badge {
  padding: 2px 6px; border-radius: 3px; font-weight: 600;
}
.pass-badge.high { background: #f6ffed; color: #52c41a; }
.pass-badge.mid { background: #fffbe6; color: #d4b106; }
.pass-badge.low { background: #fff2f0; color: #ff4d4f; }
.result-badge {
  padding: 2px 6px; border-radius: 3px; font-size: 11px; font-weight: 600;
}
.result-badge.pass { background: #f6ffed; color: #52c41a; }
.result-badge.fail { background: #fff2f0; color: #ff4d4f; }
.result-badge.rework { background: #fffbe6; color: #d4b106; }
.action-btn {
  padding: 4px 12px;
  border: 1px solid #1890ff;
  color: #1890ff;
  background: #fff;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;
}
.action-btn:hover:not(:disabled) { background: #1890ff; color: #fff; }
.action-btn:disabled { border-color: #d9d9d9; color: #d9d9d9; cursor: not-allowed; }

/* Analysis panel */
.analysis-panel {
  position: fixed;
  right: 0;
  bottom: 0;
  width: 440px;
  max-width: 100vw;
  max-height: 70vh;
  background: #fff;
  border-radius: 12px 12px 0 0;
  box-shadow: 0 -4px 20px rgba(0,0,0,0.15);
  z-index: 1001;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
.analysis-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 20px;
  border-bottom: 1px solid #f0f0f0;
  background: #001529;
  color: #fff;
}
.analysis-header h4 { margin: 0; font-size: 14px; }
.analysis-header .close-btn {
  background: none; border: none; color: rgba(255,255,255,0.65);
  font-size: 18px; cursor: pointer; padding: 4px 8px; border-radius: 4px;
}
.analysis-header .close-btn:hover { color: #fff; background: rgba(255,255,255,0.1); }
.analysis-body {
  flex: 1;
  overflow-y: auto;
  padding: 16px 20px;
}
.analysis-section { margin-bottom: 16px; }
.analysis-section h5 {
  margin: 0 0 8px;
  font-size: 14px;
  color: #333;
}
.cause-item { margin-bottom: 12px; }
.cause-header { display: flex; justify-content: space-between; font-size: 13px; margin-bottom: 4px; }
.cause-name { font-weight: 500; }
.cause-prob { color: #1890ff; font-weight: 600; }
.prob-bar { height: 6px; background: #f0f0f0; border-radius: 3px; margin-bottom: 4px; }
.prob-fill { height: 100%; background: #1890ff; border-radius: 3px; transition: width 0.5s; }
.cause-evidence { font-size: 12px; color: #888; }
.analysis-section ul { margin: 0; padding-left: 20px; }
.analysis-section li { font-size: 13px; margin-bottom: 4px; color: #555; }
.analysis-section.summary { background: #f6ffed; padding: 10px 12px; border-radius: 6px; font-size: 13px; }

.slide-up-enter-active { transition: all 0.25s ease-out; }
.slide-up-leave-active { transition: all 0.2s ease-in; }
.slide-up-enter-from,
.slide-up-leave-to { transform: translateY(100%); opacity: 0; }

.empty-state { text-align: center; color: #ccc; padding: 24px; font-size: 14px; }

/* 响应式 */
@media (max-width: 900px) {
  .board-grid { grid-template-columns: 1fr; }
  .barcode-release-banner { align-items: flex-start; flex-direction: column; }
  .barcode-knowledge-sample-panel { grid-template-columns: 1fr; }
}
</style>
