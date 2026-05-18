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

      <div class="board-grid">
        <!-- SPC 趋势图 -->
        <div class="card spc-card">
          <div class="card-header">
            <h3>SPC 趋势分析</h3>
            <select v-model="spcParam" class="param-select" @change="loadSpc">
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
            <select v-model="resultFilter" class="filter-select">
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
                  <button class="action-btn" @click="showAnalysis(ins.id)" :disabled="!!analysisMap[ins.id]">
                    根因分析
                  </button>
                </td>
              </tr>
              <tr v-if="!inspections.length">
                <td colspan="10" class="empty-state">暂无检验记录</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- 根因分析浮动面板 -->
      <Transition name="slide-up">
        <div v-if="currentAnalysis" class="analysis-panel">
          <div class="analysis-header">
            <h4>根因分析 — {{ currentAnalysis.inspectionId }}</h4>
            <button class="close-btn" @click="currentAnalysis = null">✕</button>
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
import http from '../../api/http'
import { getInspections, getQualityStatistics, analyzeRootCause, analyzeSpcTrend } from '../../api/quality'
import type { InspectionDto, QualityStatisticsDto, RootCauseAnalysisDto, SpcAnalysisDto, AnomalyDto } from '../../types/quality'

const stats = reactive<QualityStatisticsDto>({
  totalInspections: 0, passedCount: 0, failedCount: 0,
  reworkCount: 0, passRate: 0, defectRate: 0, reworkRate: 0,
})

const inspections = ref<InspectionDto[]>([])
const anomalies = ref<AnomalyDto[]>([])
const resultFilter = ref('')
const analysisMap = reactive<Record<string, RootCauseAnalysisDto>>({})
const currentAnalysis = ref<RootCauseAnalysisDto | null>(null)

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

const spcPoints = computed(() => spcData.value.map(p => `${p.x},${p.y}`).join(' '))
const uclY = computed(() => pad + 20)
const lclY = computed(() => chartH - pad + 10)
const clY = computed(() => (uclY.value + lclY.value) / 2)

function formatTime(t: string) {
  return new Date(t).toLocaleString('zh-CN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })
}

async function showAnalysis(id: string) {
  if (analysisMap[id]) { currentAnalysis.value = analysisMap[id]; return }
  try {
    const result = await analyzeRootCause(id)
    analysisMap[id] = result
    currentAnalysis.value = result
  } catch {
    // 演示分析
    const demo: RootCauseAnalysisDto = {
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
    analysisMap[id] = demo
    currentAnalysis.value = demo
  }
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
  try {
    const result = await analyzeSpcTrend(spcParam.value)
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
  } catch {
    generateSpcData(spcParam.value)
  }
}

onMounted(async () => {
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
    inspections.value = await getInspections()
  } catch {
    inspections.value = [
      { id: 'INS-001', workOrderId: 'WO-001', productCode: 'PRD-001', processName: 'CNC精加工', inspectionPoint: '尺寸检验', inspectionQuantity: 50, qualifiedQuantity: 48, defectQuantity: 2, result: 'pass', inspectorId: 'USR-001', inspectedAt: '2026-05-11T10:30:00', passRate: 96 },
      { id: 'INS-002', workOrderId: 'WO-002', productCode: 'PRD-002', processName: '注塑成型', inspectionPoint: '外观检验', inspectionQuantity: 100, qualifiedQuantity: 97, defectQuantity: 3, result: 'pass', inspectorId: 'USR-002', inspectedAt: '2026-05-11T14:00:00', passRate: 97 },
      { id: 'INS-003', workOrderId: 'WO-003', productCode: 'PRD-003', processName: '热处理', inspectionPoint: '硬度检测', inspectionQuantity: 20, qualifiedQuantity: 18, defectQuantity: 2, result: 'rework', inspectorId: 'USR-001', inspectedAt: '2026-05-12T08:00:00', passRate: 90 },
      { id: 'INS-004', workOrderId: 'WO-004', productCode: 'PRD-001', processName: '装配', inspectionPoint: '功能测试', inspectionQuantity: 30, qualifiedQuantity: 26, defectQuantity: 4, result: 'fail', inspectorId: 'USR-003', inspectedAt: '2026-05-12T09:00:00', passRate: 86.7 },
      { id: 'INS-005', workOrderId: 'WO-005', productCode: 'PRD-004', processName: 'CNC精加工', inspectionPoint: '尺寸检验', inspectionQuantity: 40, qualifiedQuantity: 40, defectQuantity: 0, result: 'pass', inspectorId: 'USR-002', inspectedAt: '2026-05-12T11:00:00', passRate: 100 },
    ]
  }

  // 异常数据
  try {
    const { data } = await http.get('/anomaly')
    anomalies.value = data.items ?? data
  } catch {
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
}
</style>
