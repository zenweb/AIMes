<template>
  <div class="report-board">
    <h2 class="page-title">报表中心</h2>

    <!-- 生产概况 -->
    <section class="section">
      <h3>生产概况</h3>
      <div class="kpi-row">
        <div class="kpi"><label>工单总数</label><span class="num">{{ r?.production.totalWorkOrders }}</span></div>
        <div class="kpi"><label>已完成</label><span class="num green">{{ r?.production.completedOrders }}</span></div>
        <div class="kpi"><label>进行中</label><span class="num blue">{{ r?.production.inProgressOrders }}</span></div>
        <div class="kpi"><label>准时率</label><span class="num" :class="onTimeClass">{{ fmtPct(r?.production.onTimeRate) }}</span></div>
      </div>
      <div class="chart-wrap">
        <svg :width="chartW" :height="160" class="chart">
          <line v-for="i in yLines" :key="i" :x1="40" :x2="chartW - 10" :y1="30 + i * 30" :y2="30 + i * 30" stroke="#f0f0f0" />
          <polyline :points="prodPoints" fill="none" stroke="#1890ff" stroke-width="2" />
          <circle v-for="(pt, i) in prodData" :key="i" :cx="pt.x" :cy="pt.y" r="3" fill="#1890ff" />
          <text v-for="(pt, i) in prodData" :key="'l'+i" :x="pt.x" :y="150" text-anchor="middle" font-size="10" fill="#999">{{ pt.label }}</text>
        </svg>
      </div>
    </section>

    <!-- 质量概况 -->
    <section class="section">
      <h3>质量概况</h3>
      <div class="kpi-row">
        <div class="kpi"><label>合格率</label><span class="num green">{{ fmtPct(r?.quality.passRate) }}</span></div>
        <div class="kpi"><label>不良率</label><span class="num red">{{ fmtPct(r?.quality.defectRate) }}</span></div>
        <div class="kpi"><label>检验批数</label><span class="num blue">{{ r?.quality.totalInspections }}</span></div>
        <div class="kpi"><label>不良数</label><span class="num red">{{ r?.quality.defectCount }}</span></div>
      </div>
      <div class="chart-wrap">
        <svg :width="chartW" :height="160" class="chart">
          <line v-for="i in yLines" :key="i" :x1="40" :x2="chartW - 10" :y1="30 + i * 30" :y2="30 + i * 30" stroke="#f0f0f0" />
          <polyline :points="defectPoints" fill="none" stroke="#ff4d4f" stroke-width="2" />
          <circle v-for="(pt, i) in defectData" :key="i" :cx="pt.x" :cy="pt.y" r="3" fill="#ff4d4f" />
          <text v-for="(pt, i) in defectData" :key="'l'+i" :x="pt.x" :y="150" text-anchor="middle" font-size="10" fill="#999">{{ pt.label }}</text>
        </svg>
      </div>
    </section>

    <!-- 设备和异常 -->
    <div class="row-split">
      <section class="section half">
        <h3>设备概况</h3>
        <div class="kpi-row">
          <div class="kpi"><label>总数</label><span class="num">{{ r?.equipment.totalEquipment }}</span></div>
          <div class="kpi"><label>运行中</label><span class="num green">{{ r?.equipment.runningCount }}</span></div>
          <div class="kpi"><label>利用率</label><span class="num blue">{{ fmtPct(r?.equipment.utilizationRate) }}</span></div>
          <div class="kpi"><label>可动率</label><span class="num green">{{ fmtPct(r?.equipment.availabilityRate) }}</span></div>
        </div>
        <div class="chart-wrap">
          <svg :width="chartW / 2 - 20" :height="140" class="chart">
            <rect v-for="(pt, i) in equipData" :key="i" :x="30 + i * 45" :y="pt.y" :width="30" :height="120 - pt.y" :fill="pt.color" rx="3" />
            <text v-for="(pt, i) in equipData" :key="'l'+i" :x="45 + i * 45" :y="135" text-anchor="middle" font-size="10" fill="#999">{{ pt.label }}</text>
          </svg>
        </div>
      </section>

      <section class="section half">
        <h3>异常分布</h3>
        <div class="kpi-row">
          <div class="kpi"><label>总数</label><span class="num">{{ r?.anomaly.totalAnomalies }}</span></div>
          <div class="kpi"><label>待处理</label><span class="num red">{{ r?.anomaly.openCount }}</span></div>
          <div class="kpi"><label>已解决</label><span class="num green">{{ r?.anomaly.resolvedCount }}</span></div>
          <div class="kpi"><label>平均响应</label><span class="num">{{ r?.anomaly.avgResolveHours }}h</span></div>
        </div>
        <div class="chart-wrap">
          <svg :width="chartW / 2 - 20" :height="140" class="chart">
            <rect v-for="(pt, i) in anomalyData" :key="i" :x="40 + i * 70" :y="pt.y" :width="50" :height="120 - pt.y" :fill="pt.color" rx="3" />
            <text v-for="(pt, i) in anomalyData" :key="'l'+i" :x="65 + i * 70" :y="135" text-anchor="middle" font-size="10" fill="#999">{{ pt.label }}</text>
          </svg>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import type { ReportDashboard, ChartDataPoint } from '../../types/report'
import { getReportDashboard } from '../../api/report'

const r = ref<ReportDashboard | null>(null)
const chartW = 700
const yLines = [0, 1, 2, 3]

function fmtPct(v: number | undefined) { return v != null ? (v * 100).toFixed(1) + '%' : '-' }

const onTimeClass = computed(() => {
  const v = r.value?.production.onTimeRate
  if (!v) return ''
  if (v >= 0.9) return 'green'
  if (v >= 0.75) return 'blue'
  return 'red'
})

function mapPoints(data: ChartDataPoint[], maxH = 120, offsetY = 30): { x: number; y: number; label: string }[] {
  if (!data?.length) return []
  const maxVal = Math.max(...data.map(d => d.value), 1)
  const step = (chartW - 60) / Math.max(data.length - 1, 1)
  return data.map((d, i) => ({
    x: 40 + i * step,
    y: offsetY + maxH - (d.value / maxVal) * maxH,
    label: d.label,
  }))
}

const prodData = computed(() => mapPoints(r.value?.production.dailyOutput || []))
const prodPoints = computed(() => prodData.value.map(p => `${p.x},${p.y}`).join(' '))
const defectData = computed(() => mapPoints(r.value?.quality.dailyDefects || []))
const defectPoints = computed(() => defectData.value.map(p => `${p.x},${p.y}`).join(' '))

const colors = ['#1890ff', '#52c41a', '#faad14', '#ff4d4f']
const equipData = computed(() => {
  const trend = r.value?.equipment.utilizationTrend || []
  const maxVal = Math.max(...trend.map(d => d.value), 100)
  return trend.map((d, i) => ({ ...d, y: 120 - (d.value / maxVal) * 120, color: colors[i % 4] }))
})
const anomalyData = computed(() => {
  const types = r.value?.anomaly.anomalyByType || []
  const maxVal = Math.max(...types.map(d => d.value), 1)
  return types.map((d, i) => ({ ...d, y: 120 - (d.value / maxVal) * 120, color: colors[i % 4] }))
})

onMounted(async () => {
  try { r.value = await getReportDashboard() }
  catch {
    r.value = {
      production: { totalWorkOrders: 48, completedOrders: 32, inProgressOrders: 12, onTimeRate: 0.85, dailyOutput: Array.from({ length: 14 }, (_, i) => ({ label: `5/${i + 1}`, value: 20 + Math.random() * 25 })) },
      quality: { passRate: 0.976, defectRate: 0.024, totalInspections: 1250, defectCount: 30, dailyDefects: Array.from({ length: 14 }, (_, i) => ({ label: `5/${i + 1}`, value: Math.random() * 5 })) },
      equipment: { totalEquipment: 24, runningCount: 18, utilizationRate: 0.78, availabilityRate: 0.94, utilizationTrend: [{ label: '第1周', value: 72 }, { label: '第2周', value: 78 }, { label: '第3周', value: 85 }, { label: '第4周', value: 76 }, { label: '第5周', value: 82 }, { label: '第6周', value: 79 }, { label: '第7周', value: 88 }] },
      anomaly: { totalAnomalies: 36, openCount: 5, resolvedCount: 28, avgResolveHours: 3.5, anomalyByType: [{ label: '设备', value: 14 }, { label: '质量', value: 10 }, { label: '物料', value: 7 }, { label: '工艺', value: 5 }] },
    }
  }
})
</script>

<style scoped>
.report-board { height: 100%; overflow-y: auto; padding: 16px; }
.page-title { font-size: 16px; font-weight: 700; margin-bottom: 16px; }
.section { background: #fff; border-radius: 8px; padding: 16px; margin-bottom: 16px; }
.section h3 { font-size: 14px; margin: 0 0 12px; color: #333; }
.half { flex: 1; }
.row-split { display: flex; gap: 16px; }
.kpi-row { display: flex; gap: 16px; margin-bottom: 12px; }
.kpi { flex: 1; }
.kpi label { display: block; font-size: 11px; color: #999; margin-bottom: 4px; }
.kpi .num { font-size: 22px; font-weight: 700; color: #333; }
.kpi .num.green { color: #52c41a; }
.kpi .num.blue { color: #1890ff; }
.kpi .num.red { color: #ff4d4f; }
.chart-wrap { overflow-x: auto; }
.chart { display: block; }
</style>
