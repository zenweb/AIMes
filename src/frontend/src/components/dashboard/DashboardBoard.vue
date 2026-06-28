<template>
  <div class="dashboard">
      <section class="ops-command-hero" aria-label="生产运营控制塔">
        <div class="ops-hero-main">
          <span class="ops-eyebrow">AIMes Pro Control Tower</span>
          <h1>生产运营控制塔</h1>
          <p>以 OTD 承诺为主线，串联风险识别、AI 排产、执行回写、审计回放和经营复盘。</p>
          <div class="ops-hero-actions">
            <router-link to="/scheduling">进入调度台</router-link>
            <router-link to="/audit-logs">回放证据链</router-link>
          </div>
        </div>
        <div class="ops-hero-status">
          <div>
            <span>今日主承诺</span>
            <strong>{{ abOtdSummary.range }}</strong>
            <em>{{ abOtdSummary.delta }}</em>
          </div>
          <div>
            <span>风险闭环</span>
            <strong>{{ commandBlockers.length }}/{{ kpi.activeOrders }}</strong>
            <em>阻塞项进入责任动作</em>
          </div>
          <div>
            <span>运行状态</span>
            <strong>{{ statusCounts.running }}</strong>
            <em>设备在线 / {{ statusCounts.down }} 停机</em>
          </div>
        </div>
      </section>

      <!-- 顶部指标卡片 -->
      <div class="kpi-row">
        <div class="kpi-card">
          <div class="kpi-icon" style="background:#e6f7ff;color:#1890ff">📊</div>
          <div class="kpi-body">
            <span class="kpi-value">{{ kpi.scheduleAdherence }}%</span>
            <span class="kpi-label">排产达成率</span>
          </div>
        </div>
        <div class="kpi-card">
          <div class="kpi-icon" style="background:#f6ffed;color:#52c41a">✅</div>
          <div class="kpi-body">
            <span class="kpi-value">{{ kpi.qualityPassRate }}%</span>
            <span class="kpi-label">质检合格率</span>
          </div>
        </div>
        <div class="kpi-card">
          <div class="kpi-icon" style="background:#fff7e6;color:#fa8c16">⚡</div>
          <div class="kpi-body">
            <span class="kpi-value">{{ kpi.equipmentUtilization }}%</span>
            <span class="kpi-label">设备利用率</span>
          </div>
        </div>
        <div class="kpi-card">
          <div class="kpi-icon" style="background:#fff0f6;color:#eb2f96">📦</div>
          <div class="kpi-body">
            <span class="kpi-value">{{ kpi.activeOrders }}</span>
            <span class="kpi-label">进行中工单</span>
          </div>
        </div>
      </div>
      <section v-if="dashboardDataError" class="dashboard-data-alert" aria-label="生产概览数据读取失败">
        <span class="command-eyebrow">生产概览数据</span>
        <h2>生产概览数据读取失败</h2>
        <p>{{ dashboardDataError }}</p>
      </section>
      <section v-if="abReportError" class="ab-report-alert" aria-label="A/B 报告读取失败">
        <span class="command-eyebrow">OTD 改善报告</span>
        <h2>A/B 报告读取失败</h2>
        <p>{{ abReportError }}</p>
      </section>

      <section class="command-center" aria-label="AI MES 指挥中心">
        <div class="command-header">
          <div>
            <span class="command-eyebrow">今日主线</span>
            <h2>AI MES 指挥中心</h2>
            <p>从风险识别到 OTD 复盘，按 5 分钟演示路径推进现场闭环。</p>
          </div>
          <div class="otd-summary">
            <span>OTD 改善</span>
            <strong>{{ abOtdSummary.range }}</strong>
            <em>{{ abOtdSummary.delta }}</em>
          </div>
        </div>

        <ol class="command-grid" aria-label="AI MES 指挥中心主线">
          <li v-for="item in commandSteps" :key="item.id">
            <router-link
              class="command-card"
              :to="item.route"
            >
              <span class="step-index">{{ item.index }}</span>
              <div>
                <strong>{{ item.title }}</strong>
                <p>{{ item.detail }}</p>
              </div>
              <span class="step-action">{{ item.action }}</span>
            </router-link>
          </li>
        </ol>

        <div class="command-bottom">
          <div class="blocker-list">
            <h3>当前阻塞</h3>
            <div v-for="blocker in commandBlockers" :key="blocker.id" class="blocker-item" :class="blocker.level">
              <span>{{ blocker.type }}</span>
              <strong>{{ blocker.title }}</strong>
              <em>{{ blocker.owner }} · {{ blocker.due }}</em>
            </div>
          </div>
          <div class="next-action">
            <span>下一步建议</span>
            <strong>先处理 M-AL-6061 缺料，再采纳急单加班插入方案。</strong>
            <router-link to="/scheduling">进入 AI 排产</router-link>
          </div>
        </div>
      </section>

      <section v-if="pocHypercareAcceptance" class="hypercare-command" aria-label="POC Hypercare 上线验收">
        <div class="hypercare-main">
          <span class="command-eyebrow">正式上线验收</span>
          <h2>{{ pocHypercareAcceptance.title }}</h2>
          <p>{{ pocHypercareAcceptance.summary }}</p>
          <div class="hypercare-actions">
            <router-link to="/monitoring">查看现场监控</router-link>
            <router-link to="/report">打开验收报告</router-link>
          </div>
        </div>
        <div class="hypercare-metrics">
          <div>
            <span>状态</span>
            <strong>{{ pocHypercareAcceptance.statusLabel }}</strong>
          </div>
          <div>
            <span>OTD</span>
            <strong>{{ pocHypercareAcceptance.actualOtd }}</strong>
          </div>
          <div>
            <span>OEE</span>
            <strong>{{ pocHypercareAcceptance.currentOee }}</strong>
          </div>
          <div>
            <span>P1/P2 未关闭</span>
            <strong>{{ pocHypercareAcceptance.unresolvedP1P2 }}</strong>
          </div>
        </div>
      </section>
      <section v-if="pocHypercareAcceptanceError" class="hypercare-command" aria-label="POC Hypercare 上线验收读取失败">
        <div class="hypercare-main">
          <span class="command-eyebrow">正式上线验收</span>
          <h2>上线验收记录读取失败</h2>
          <p>{{ pocHypercareAcceptanceError }}</p>
        </div>
      </section>

      <section class="demo-runbook" aria-label="5 分钟 Demo 录制运行手册">
        <div class="runbook-header">
          <div>
            <span class="command-eyebrow">售前录制</span>
            <h2>5 分钟 Demo 录制运行手册</h2>
            <p>从首页到报表，每一步都绑定镜头、证据和讲解话术，录制后可直接进入 POC 复盘。</p>
          </div>
          <div class="recording-summary">
            <span>{{ demoRehearsalEvidence ? '彩排状态' : '总时长' }}</span>
            <strong>{{ demoRehearsalEvidence ? '已确认' : '05:00' }}</strong>
            <em>{{ demoRehearsalEvidence ? demoRehearsalEvidence.traceId : '5 个镜头 · 7 个验收证据' }}</em>
          </div>
        </div>

        <div class="runbook-grid">
          <router-link
            v-for="step in demoRunbook"
            :key="step.id"
            class="runbook-card"
            :to="step.route"
          >
            <div class="runbook-time">{{ step.time }}</div>
            <div class="runbook-body">
              <strong>{{ step.title }}</strong>
              <p>{{ step.script }}</p>
              <div class="evidence-tags">
                <span v-for="evidence in step.evidence" :key="evidence">{{ evidence }}</span>
              </div>
            </div>
            <em>{{ step.capture }}</em>
          </router-link>
        </div>

        <div class="runbook-rehearsal" :class="{ confirmed: demoRehearsalEvidence }">
          <div>
            <span class="command-eyebrow">彩排证据</span>
            <strong>{{ demoRehearsalEvidence ? '5 分钟 Demo 彩排已确认' : '确认 5 分钟 Demo 彩排' }}</strong>
            <p>{{ demoRehearsalEvidence ? demoRehearsalEvidence.summary : '完成一次从生产概览到报表中心的售前演示彩排，并把镜头、证据、POC 口径写入 OTD 复盘证据链。' }}</p>
            <p v-if="demoRehearsalError" class="runbook-error">{{ demoRehearsalError }}</p>
          </div>
          <button type="button" @click="handleConfirmDemoRehearsal">
            {{ demoRehearsalEvidence ? '刷新彩排证据' : '确认彩排并写入证据链' }}
          </button>
        </div>
      </section>

      <div class="widgets-grid">
        <!-- 设备状态 -->
        <div class="widget">
          <div class="widget-header">
            <h3>设备状态</h3>
            <router-link to="/scheduling" class="widget-link">查看排产 →</router-link>
          </div>
          <div class="widget-body">
            <div class="status-summary">
              <span class="status-dot running"></span> 运行 {{ statusCounts.running }}
              <span class="status-dot idle"></span> 空闲 {{ statusCounts.idle }}
              <span class="status-dot down"></span> 停机 {{ statusCounts.down }}
            </div>
            <div class="equip-list">
              <div v-for="eq in equipment" :key="eq.id" class="equip-item">
                <span class="eq-name">{{ eq.name }}</span>
                <span class="eq-type">{{ eq.type }}</span>
                <span class="eq-status" :class="eq.status">{{ eq.statusText }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 今日排产 -->
        <div class="widget">
          <div class="widget-header">
            <h3>今日排产</h3>
            <router-link to="/scheduling" class="widget-link">全部 →</router-link>
          </div>
          <div class="widget-body">
            <div class="today-list">
              <div v-for="task in todayTasks" :key="task.id" class="today-item">
                <span class="today-time">{{ task.time }}</span>
                <span class="today-name">{{ task.name }}</span>
                <span class="today-equip">{{ task.equip }}</span>
                <span class="today-status" :class="task.status">{{ task.statusText }}</span>
              </div>
              <div v-if="todayTasks.length === 0" class="empty-state">今日暂无排产任务</div>
            </div>
          </div>
        </div>

        <!-- 物料预警 -->
        <div class="widget">
          <div class="widget-header">
            <h3>物料预警</h3>
            <span v-if="shortageResolution" class="sync-badge">风险下降</span>
          </div>
          <div class="widget-body">
            <div v-if="shortageResolution" class="risk-sync-card">
              <strong>{{ shortageResolution.materialCode }} 缺料已缓解</strong>
              <span>{{ shortageResolution.message }}</span>
              <em>{{ shortageResolution.affectedOrders }} · {{ shortageResolution.resolvedAt }}</em>
            </div>
            <div v-for="mat in materialAlerts" :key="mat.code" class="alert-item" :class="mat.level">
              <span class="alert-icon">{{ alertIcon(mat.level) }}</span>
              <span class="alert-name">{{ mat.name }}</span>
              <span class="alert-qty">{{ mat.available }}/{{ mat.min }}</span>
            </div>
            <div v-if="materialAlerts.length === 0 && !shortageResolution" class="empty-state">所有物料库存充足</div>
          </div>
        </div>

        <!-- 质量概览 -->
        <div class="widget">
          <div class="widget-header">
            <h3>质量概览</h3>
          </div>
          <div class="widget-body">
            <div class="quality-chart">
              <svg viewBox="0 0 100 100" class="donut">
                <circle cx="50" cy="50" r="40" fill="none" stroke="#f0f0f0" stroke-width="12"/>
                <circle cx="50" cy="50" r="40" fill="none" stroke="#52c41a" stroke-width="12"
                  :stroke-dasharray="`${qualityPass * 2.51} ${(100 - qualityPass) * 2.51}`"
                  transform="rotate(-90 50 50)"/>
                <text x="50" y="48" text-anchor="middle" font-size="18" font-weight="bold" fill="#333">
                  {{ qualityPass }}%
                </text>
                <text x="50" y="62" text-anchor="middle" font-size="9" fill="#888">合格率</text>
              </svg>
            </div>
            <div class="quality-stats">
              <div class="q-row"><span>检验批次</span><span>{{ qualityStats.totalInspections }}</span></div>
              <div class="q-row"><span>合格批次</span><span class="green">{{ qualityStats.passed }}</span></div>
              <div class="q-row"><span>缺陷数</span><span class="red">{{ qualityStats.defects }}</span></div>
              <div class="q-row"><span>待处理异常</span><span class="orange">{{ qualityStats.pendingAnomalies }}</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
</template>

<script setup lang="ts">
import { computed, ref, reactive, onMounted, onBeforeUnmount } from 'vue'
import * as signalR from '@microsoft/signalr'
import { getDashboard } from '../../api/dashboard'
import type { DashboardData, KpiCard, EquipmentStatus, TodaySchedule, MaterialAlert, QualityStats } from '../../types/dashboard'
import { readShortageRiskResolutionBackendFirst, type ShortageRiskResolution } from '../../utils/shortage-risk-sync'
import { readOtdEvidenceChainRecords, upsertOtdEvidenceChainRecord, type OtdEvidenceChainItem } from '../../utils/otd-evidence-chain-sync'
import { readPocHypercareAcceptanceRecordBackendFirst, type PocHypercareAcceptanceRecord } from '../../utils/poc-hypercare-sync'
import { getLocalAccessToken } from '../../utils/auth-token'
import { appAssetPath, isOfflineDemoError, shouldSkipBackendForOfflineDemo } from '../../utils/offline-demo-mode'
import { errorMessage } from '../../utils/error-message'
import { resolveSignalRHubUrl } from '../../utils/signalr-url'

const kpi = reactive<KpiCard>({ scheduleAdherence: 0, qualityPassRate: 0, equipmentUtilization: 0, activeOrders: 0 })
const statusCounts = reactive({ running: 0, idle: 0, down: 0, maintenance: 0 })
const qualityPass = ref(0)
const qualityStats = reactive<QualityStats>({ totalInspections: 0, passed: 0, defects: 0, pendingAnomalies: 0, passRate: 0 })
const equipment = ref<EquipmentStatus[]>([])
const todayTasks = ref<TodaySchedule[]>([])
const materialAlerts = ref<MaterialAlert[]>([])
const shortageResolution = ref<ShortageRiskResolution | null>(null)
const demoRehearsalEvidence = ref<OtdEvidenceChainItem | null>(null)
const demoRehearsalError = ref('')
const pocHypercareAcceptance = ref<PocHypercareAcceptanceRecord | null>(null)
const pocHypercareAcceptanceError = ref('')
const dashboardDataError = ref('')
const latestAbReport = ref<LatestAbReport | null>(null)
const abReportError = ref('')
let connection: signalR.HubConnection | null = null

interface LatestAbReport {
  baseline: { otd: number }
  agent: { otd: number }
  delta: { otd: number }
}

const abOtdSummary = computed(() => {
  const report = latestAbReport.value
  if (!report) return { range: '26.7% -> 30.0%', delta: '+3.3pt' }
  return {
    range: `${(report.baseline.otd * 100).toFixed(1)}% -> ${(report.agent.otd * 100).toFixed(1)}%`,
    delta: `+${(report.delta.otd * 100).toFixed(1)}pt`,
  }
})

const commandSteps = [
  {
    id: 'risk',
    index: '01',
    title: '风险识别',
    detail: '急单、缺料、设备故障进入风险处置队列。',
    action: '查看风险',
    route: '/risk',
  },
  {
    id: 'schedule',
    index: '02',
    title: 'Agent 重排',
    detail: '生成基线与 Agent 方案，解释 OTD 改善来源。',
    action: '生成方案',
    route: '/scheduling',
  },
  {
    id: 'purchase',
    index: '03',
    title: '采购协同',
    detail: '缺料生成加急采购，收货后风险下降。',
    action: '处理缺料',
    route: '/purchase',
  },
  {
    id: 'production',
    index: '04',
    title: '生产执行',
    detail: '开工校验 SOP、人员、设备、物料并回写排产。',
    action: '进入报工',
    route: '/production',
  },
  {
    id: 'report',
    index: '05',
    title: 'OTD 复盘',
    detail: '输出 30 单演示数据和 POC 验收证据。',
    action: '查看报告',
    route: '/report',
  },
]

const commandBlockers = [
  {
    id: 'mat-al6061',
    type: '缺料',
    title: 'M-AL-6061 缺 12 件',
    owner: '采购',
    due: '今日 16:00',
    level: 'critical',
  },
  {
    id: 'cnc-001',
    type: '设备',
    title: 'CNC-001 夜班维护窗口',
    owner: '设备主管',
    due: '22:00 前确认',
    level: 'warning',
  },
  {
    id: 'rush-9001',
    type: '急单',
    title: 'WO-RUSH-9001 加班插入',
    owner: '调度员',
    due: '锁定期后',
    level: 'info',
  },
]

const demoRunbook = [
  {
    id: 'opening',
    time: '00:00-00:45',
    title: '开场：老板问题',
    script: '先展示 A/B 报告 OTD 26.7% -> 30.0%，说明今天只讲“为什么交期会提高”和“当前样本尚未显著”。',
    evidence: ['OTD +3.3pt', '当前阻塞', '主线入口'],
    capture: '录制首页指挥中心',
    route: '/dashboard',
  },
  {
    id: 'risk',
    time: '00:45-01:35',
    title: '风险：三类事件进入队列',
    script: '点进风险预警，展示急单、缺料、设备故障已经变成有负责人和截止时间的处置卡。',
    evidence: ['风险处置队列', '负责人', '截止时间'],
    capture: '录制风险卡与留痕',
    route: '/risk',
  },
  {
    id: 'agent',
    time: '01:35-02:45',
    title: 'Agent：生成重排建议',
    script: '进入 AI 排产，展示调度员工作台、事件队列、推荐解释和采纳反馈。',
    evidence: ['基线 vs Agent', '三类事件', '采纳原因'],
    capture: '录制重排建议和解释',
    route: '/scheduling',
  },
  {
    id: 'execution',
    time: '02:45-03:45',
    title: '执行：采购与生产回写',
    script: '展示采购加急收货后风险下降，再回到生产报工说明开工校验和异常回写。',
    evidence: ['采购收货', '风险下降', '开工校验'],
    capture: '录制采购与生产联动',
    route: '/purchase',
  },
  {
    id: 'report',
    time: '03:45-05:00',
    title: '复盘：POC 评分和缺口',
    script: '打开报表中心，导出 OTD 改善报告，最后展示 POC 97/100 和仍需客户补齐的数据。',
    evidence: ['30 单样本', 'POC 97/100', '补齐缺口'],
    capture: '录制报表与 CSV 导出',
    route: '/report',
  },
]

async function applyDashboardData(d: DashboardData) {
  Object.assign(kpi, d.kpi)
  Object.assign(qualityStats, d.qualityStats)
  qualityPass.value = d.qualityStats.passRate
  equipment.value = d.equipment
  todayTasks.value = d.todaySchedule
  materialAlerts.value = d.materialAlerts
  await applyShortageRiskResolution()

  statusCounts.running = d.equipment.filter(e => e.status === 'running').length
  statusCounts.idle = d.equipment.filter(e => e.status === 'idle').length
  statusCounts.down = d.equipment.filter(e => e.status === 'fault' || e.status === 'offline').length
  statusCounts.maintenance = d.equipment.filter(e => e.status === 'maintenance').length
}

async function applyShortageRiskResolution() {
  shortageResolution.value = await readShortageRiskResolutionBackendFirst()
}

function applyDemoRehearsalEvidence() {
  demoRehearsalEvidence.value = readOtdEvidenceChainRecords().find(record =>
    record.id === 'demo-rehearsal-20260521'
  ) ?? null
  if (demoRehearsalEvidence.value) demoRehearsalError.value = ''
}

async function applyPocHypercareAcceptance() {
  try {
    pocHypercareAcceptance.value = await readPocHypercareAcceptanceRecordBackendFirst()
    pocHypercareAcceptanceError.value = ''
  } catch (error) {
    pocHypercareAcceptance.value = null
    pocHypercareAcceptanceError.value = `POC Hypercare 验收状态暂未加载：${errorMessage(error, '请稍后重试')}`
  }
}

async function loadLatestAbReport() {
  try {
    const response = await fetch(appAssetPath('reports/latest-ab-report.json'), { cache: 'no-store' })
    if (!response.ok) {
      throw new Error(`latest A/B report HTTP ${response.status}`)
    }
    latestAbReport.value = await response.json()
    abReportError.value = ''
  } catch (error) {
    latestAbReport.value = null
    abReportError.value = `OTD 改善暂用默认演示值：${errorMessage(error, '请稍后重试')}`
  }
}

function handleConfirmDemoRehearsal() {
  try {
    demoRehearsalEvidence.value = upsertOtdEvidenceChainRecord({
      id: 'demo-rehearsal-20260521',
      stage: '演示彩排',
      title: '5 分钟 Demo 彩排已确认',
      summary: '已完成生产概览、风险预警、AI 排产、采购协同、生产执行和报表中心 5 段镜头彩排；OTD +3.3pt、30 单样本、p=0.7745 未显著、POC 评分和补齐缺口均可核对。',
      object: '00:00-05:00 可销售 Demo 路径',
      source: '生产概览 / 5 分钟 Demo 录制运行手册',
      traceId: 'TRACE-DEMO-RUNBOOK-20260521-REHEARSAL',
      status: 'closed',
      statusLabel: '彩排已确认',
      createdAt: new Date().toISOString(),
    }).find(record => record.id === 'demo-rehearsal-20260521') ?? null
    demoRehearsalError.value = ''
  } catch (error) {
    demoRehearsalError.value = `彩排证据写入失败，5 分钟 Demo 彩排尚未写入 OTD 证据链：${errorMessage(error, '请稍后重试')}`
  }
}

function alertIcon(level: string) {
  if (level === 'critical') return '🔴'
  if (level === 'healthy') return '🟢'
  return '🟡'
}

function connectSignalR() {
  if (shouldSkipBackendForOfflineDemo(getLocalAccessToken())) return

  connection = new signalR.HubConnectionBuilder()
    .withUrl(resolveSignalRHubUrl('/hubs/monitoring'), {
      accessTokenFactory: () => getLocalAccessToken() ?? '',
    })
    .withAutomaticReconnect([0, 2000, 5000, 10000])
    .configureLogging(signalR.LogLevel.Warning)
    .build()

  connection.on('KpiUpdate', (data: Partial<KpiCard>) => {
    Object.assign(kpi, data)
  })

  connection.on('EquipmentMetrics', (data: EquipmentStatus[]) => {
    equipment.value = data
    statusCounts.running = data.filter(e => e.status === 'running').length
    statusCounts.idle = data.filter(e => e.status === 'idle').length
    statusCounts.down = data.filter(e => e.status === 'fault' || e.status === 'offline').length
    statusCounts.maintenance = data.filter(e => e.status === 'maintenance').length
  })

  connection.start().catch(() => {})
}

onMounted(async () => {
  await loadLatestAbReport()
  applyDemoRehearsalEvidence()
  await applyPocHypercareAcceptance()
  try {
    const data = await getDashboard()
    await applyDashboardData(data)
    dashboardDataError.value = ''
  } catch (error) {
    if (isOfflineDemoError(error)) {
      dashboardDataError.value = ''
      try {
        await applyShortageRiskResolution()
      } catch {
        shortageResolution.value = null
      }
      connectSignalR()
      return
    }
    dashboardDataError.value = `KPI、设备状态、今日排产与物料预警暂未加载：${errorMessage(error, '请稍后重试')}`
    try {
      await applyShortageRiskResolution()
    } catch {
      shortageResolution.value = null
    }
  }

  connectSignalR()
})

onBeforeUnmount(() => {
  connection?.stop().catch(() => {})
})
</script>

<style scoped>
.dashboard {
  padding: 24px;
  max-width: 1400px;
  margin: 0 auto;
  overflow-y: auto;
  height: 100%;
}

.ops-command-hero {
  display: grid;
  grid-template-columns: minmax(0, 1.35fr) minmax(360px, 0.85fr);
  gap: 16px;
  margin-bottom: 16px;
  padding: 18px;
  border: 1px solid #bfdbfe;
  border-radius: 8px;
  background:
    linear-gradient(135deg, rgba(7, 17, 31, 0.96), rgba(11, 79, 143, 0.88)),
    #07111f;
  color: #f8fafc;
  box-shadow: 0 16px 36px rgba(15, 23, 42, 0.16);
}

.ops-eyebrow {
  display: inline-flex;
  margin-bottom: 8px;
  padding: 4px 8px;
  border: 1px solid rgba(125, 211, 252, 0.35);
  border-radius: 999px;
  color: #7dd3fc;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.08em;
}

.ops-hero-main h1 {
  margin: 0;
  font-size: 28px;
  font-weight: 800;
  letter-spacing: 0;
}

.ops-hero-main p {
  max-width: 720px;
  margin: 8px 0 0;
  color: #cfe5ff;
  font-size: 14px;
  line-height: 1.6;
}

.ops-hero-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 14px;
}

.ops-hero-actions a {
  padding: 8px 12px;
  border: 1px solid rgba(125, 211, 252, 0.4);
  border-radius: 6px;
  background: rgba(14, 159, 188, 0.18);
  color: #e0f2fe;
  font-size: 13px;
  font-weight: 800;
  text-decoration: none;
}

.ops-hero-actions a:first-child {
  background: #16a06a;
  border-color: #16a06a;
  color: #fff;
}

.ops-hero-status {
  display: grid;
  grid-template-columns: 1fr;
  gap: 10px;
}

.ops-hero-status div {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 2px 12px;
  padding: 10px 12px;
  border: 1px solid rgba(125, 211, 252, 0.24);
  border-left: 3px solid #22c55e;
  border-radius: 7px;
  background: rgba(2, 8, 23, 0.28);
}

.ops-hero-status span,
.ops-hero-status em {
  color: #a9c9e9;
  font-size: 12px;
  font-style: normal;
}

.ops-hero-status strong {
  color: #fff;
  font-family: 'Fira Code', monospace;
  font-size: 18px;
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
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
}

.kpi-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  flex-shrink: 0;
}

.kpi-body {
  display: flex;
  flex-direction: column;
}

.kpi-value {
  font-size: 28px;
  font-weight: 700;
  line-height: 1.2;
}

.kpi-label {
  font-size: 13px;
  color: #888;
}

.dashboard-data-alert,
.ab-report-alert {
  margin: 0 0 16px;
  padding: 14px 16px;
  border: 1px solid #fecaca;
  border-left: 4px solid #dc2626;
  border-radius: 8px;
  background: #fff5f5;
  color: #7f1d1d;
}

.dashboard-data-alert h2,
.ab-report-alert h2 {
  margin: 4px 0;
  color: #991b1b;
  font-size: 18px;
  line-height: 1.3;
}

.dashboard-data-alert p,
.ab-report-alert p {
  margin: 0;
  color: #7f1d1d;
  font-size: 13px;
  line-height: 1.6;
}

.command-center {
  margin-bottom: 18px;
  padding: 18px;
  border: 1px solid #dbeafe;
  border-radius: 8px;
  background: #fff;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
}

.command-header {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 14px;
}

.command-eyebrow {
  display: block;
  margin-bottom: 4px;
  color: #1d4ed8;
  font-size: 12px;
  font-weight: 700;
}

.command-header h2,
.command-header p,
.blocker-list h3,
.next-action strong {
  margin: 0;
}

.command-header h2 {
  color: #111827;
  font-size: 20px;
}

.command-header p {
  margin-top: 4px;
  color: #4b5563;
  font-size: 13px;
}

.otd-summary {
  display: flex;
  flex-direction: column;
  min-width: 150px;
  padding: 10px 12px;
  border-radius: 6px;
  background: #f0fdf4;
  color: #166534;
}

.otd-summary span,
.otd-summary em {
  font-size: 12px;
  font-style: normal;
}

.otd-summary strong {
  color: #14532d;
  font-size: 22px;
}

.command-grid {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 10px;
  margin-bottom: 12px;
  padding: 0;
  list-style: none;
}

.command-grid li {
  display: flex;
  min-width: 0;
}

.command-card {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  gap: 8px;
  width: 100%;
  min-height: 116px;
  padding: 10px;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  background: #f9fafb;
  color: inherit;
  text-decoration: none;
}

.command-card:hover {
  border-color: #93c5fd;
  background: #eff6ff;
}

.step-index {
  color: #2563eb;
  font-size: 12px;
  font-weight: 800;
}

.command-card strong {
  display: block;
  color: #111827;
  font-size: 14px;
}

.command-card p {
  margin: 5px 0 0;
  color: #4b5563;
  font-size: 12px;
  line-height: 1.45;
}

.step-action {
  grid-column: 2;
  align-self: end;
  color: #2563eb;
  font-size: 12px;
  font-weight: 700;
}

.command-bottom {
  display: grid;
  grid-template-columns: minmax(0, 1.5fr) minmax(260px, 0.8fr);
  gap: 12px;
}

.blocker-list {
  padding: 10px;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  background: #fafafa;
}

.blocker-list h3 {
  margin-bottom: 8px;
  color: #111827;
  font-size: 14px;
}

.blocker-item {
  display: grid;
  grid-template-columns: 54px minmax(0, 1fr) auto;
  gap: 8px;
  align-items: center;
  padding: 7px 0;
  border-top: 1px solid #edf2f7;
  font-size: 12px;
}

.blocker-item span {
  padding: 2px 6px;
  border-radius: 4px;
  text-align: center;
  font-weight: 700;
}

.blocker-item strong {
  color: #111827;
}

.blocker-item em {
  color: #6b7280;
  font-style: normal;
}

.blocker-item.critical span {
  background: #fee2e2;
  color: #b91c1c;
}

.blocker-item.warning span {
  background: #fef3c7;
  color: #92400e;
}

.blocker-item.info span {
  background: #dbeafe;
  color: #1d4ed8;
}

.next-action {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 12px;
  border: 1px solid #bfdbfe;
  border-radius: 6px;
  background: #eff6ff;
}

.next-action span {
  color: #1d4ed8;
  font-size: 12px;
  font-weight: 700;
}

.next-action strong {
  color: #111827;
  font-size: 14px;
  line-height: 1.45;
}

.next-action a {
  align-self: flex-start;
  padding: 6px 10px;
  border-radius: 4px;
  background: #2563eb;
  color: #fff;
  font-size: 12px;
  font-weight: 700;
  text-decoration: none;
}

.hypercare-command {
  display: grid;
  grid-template-columns: minmax(0, 1.2fr) minmax(320px, 0.8fr);
  gap: 14px;
  margin-bottom: 18px;
  padding: 16px;
  border: 1px solid #a7f3d0;
  border-radius: 8px;
  background: #ecfdf5;
}

.hypercare-main h2,
.hypercare-main p {
  margin: 0;
}

.hypercare-main h2 {
  color: #064e3b;
  font-size: 18px;
}

.hypercare-main p {
  margin-top: 5px;
  color: #475569;
  font-size: 13px;
  line-height: 1.5;
}

.hypercare-actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-top: 12px;
}

.hypercare-actions a {
  padding: 7px 10px;
  border-radius: 5px;
  background: #047857;
  color: #fff;
  text-decoration: none;
  font-size: 12px;
  font-weight: 700;
}

.hypercare-actions a + a {
  border: 1px solid #047857;
  background: #fff;
  color: #047857;
}

.hypercare-metrics {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
}

.hypercare-metrics div {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 10px;
  border: 1px solid #a7f3d0;
  border-radius: 6px;
  background: #fff;
}

.hypercare-metrics span {
  color: #047857;
  font-size: 12px;
  font-weight: 700;
}

.hypercare-metrics strong {
  color: #111827;
  font-size: 18px;
}

.demo-runbook {
  margin-bottom: 18px;
  padding: 18px;
  border: 1px solid #fed7aa;
  border-radius: 8px;
  background: #fffaf5;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
}

.runbook-header {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 14px;
}

.runbook-header h2,
.runbook-header p {
  margin: 0;
}

.runbook-header h2 {
  color: #111827;
  font-size: 18px;
}

.runbook-header p {
  margin-top: 4px;
  color: #4b5563;
  font-size: 13px;
}

.recording-summary {
  display: flex;
  flex-direction: column;
  min-width: 160px;
  padding: 10px 12px;
  border-radius: 6px;
  background: #fff;
  border: 1px solid #fed7aa;
  color: #9a3412;
}

.recording-summary span,
.recording-summary em {
  font-size: 12px;
  font-style: normal;
}

.recording-summary strong {
  color: #111827;
  font-size: 22px;
}

.runbook-grid {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 10px;
}

.runbook-card {
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-height: 190px;
  padding: 10px;
  border: 1px solid #fed7aa;
  border-radius: 6px;
  background: #fff;
  color: inherit;
  text-decoration: none;
}

.runbook-card:hover {
  border-color: #fb923c;
  background: #fff7ed;
}

.runbook-time {
  color: #c2410c;
  font-size: 12px;
  font-weight: 800;
}

.runbook-body {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 6px;
}

.runbook-body strong {
  color: #111827;
  font-size: 14px;
}

.runbook-body p {
  margin: 0;
  color: #4b5563;
  font-size: 12px;
  line-height: 1.45;
}

.evidence-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
  margin-top: auto;
}

.evidence-tags span {
  padding: 2px 6px;
  border-radius: 4px;
  background: #ffedd5;
  color: #9a3412;
  font-size: 11px;
  font-weight: 700;
}

.runbook-card em {
  color: #2563eb;
  font-size: 12px;
  font-style: normal;
  font-weight: 700;
}

.runbook-rehearsal {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 12px;
  align-items: center;
  margin-top: 12px;
  padding: 12px;
  border: 1px solid #fed7aa;
  border-radius: 6px;
  background: #fff;
}

.runbook-rehearsal.confirmed {
  border-color: #86efac;
  background: #f0fdf4;
}

.runbook-rehearsal strong {
  display: block;
  color: #111827;
  font-size: 14px;
}

.runbook-rehearsal p {
  margin: 4px 0 0;
  color: #4b5563;
  font-size: 12px;
  line-height: 1.45;
}

.runbook-rehearsal button {
  padding: 7px 11px;
  border: 1px solid #ea580c;
  border-radius: 4px;
  background: #ea580c;
  color: #fff;
  cursor: pointer;
  font-size: 12px;
  font-weight: 700;
}

.runbook-rehearsal.confirmed button {
  border-color: #16a34a;
  background: #16a34a;
}

/* Widgets */
.widgets-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
  gap: 16px;
}

.widget {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
  overflow: hidden;
}

.widget-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 16px;
  border-bottom: 1px solid #f5f5f5;
}

.widget-header h3 {
  margin: 0;
  font-size: 15px;
}

.widget-link {
  font-size: 12px;
  color: #1890ff;
  text-decoration: none;
}

.widget-body {
  padding: 12px 16px;
}

/* Equipment */
.status-summary {
  font-size: 13px;
  color: #666;
  margin-bottom: 12px;
  display: flex;
  gap: 16px;
}

.status-dot {
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  margin-right: 4px;
}

.status-dot.running { background: #52c41a; }
.status-dot.idle { background: #faad14; }
.status-dot.down { background: #ff4d4f; }

.equip-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.equip-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 10px;
  background: #fafafa;
  border-radius: 6px;
  font-size: 13px;
}

.eq-name { flex: 1; font-weight: 500; }
.eq-type { color: #888; font-size: 12px; width: 50px; }
.eq-status {
  padding: 2px 8px;
  border-radius: 3px;
  font-size: 11px;
  font-weight: 500;
}
.eq-status.running { background: #f6ffed; color: #52c41a; }
.eq-status.idle { background: #fffbe6; color: #d4b106; }
.eq-status.down { background: #fff2f0; color: #ff4d4f; }

/* Today */
.today-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.today-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 10px;
  background: #fafafa;
  border-radius: 6px;
  font-size: 12px;
}

.today-time { width: 90px; color: #666; flex-shrink: 0; }
.today-name { flex: 1; font-weight: 500; }
.today-equip { width: 60px; color: #888; }
.today-status {
  padding: 2px 6px;
  border-radius: 3px;
  font-size: 11px;
}
.today-status.in_progress { background: #e6f7ff; color: #1890ff; }
.today-status.completed { background: #f6ffed; color: #52c41a; }
.today-status.pending { background: #f5f5f5; color: #999; }

/* Material alerts */
.alert-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 10px;
  border-radius: 6px;
  margin-bottom: 6px;
  font-size: 13px;
}
.alert-item.critical { background: #fff2f0; }
.alert-item.warning { background: #fffbe6; }
.alert-item.healthy { background: #f6ffed; }
.alert-icon { font-size: 14px; }
.alert-name { flex: 1; font-weight: 500; }
.alert-qty { color: #666; font-size: 12px; }

.sync-badge {
  padding: 3px 8px;
  border-radius: 4px;
  background: #f0fdf4;
  color: #15803d;
  font-size: 12px;
  font-weight: 700;
}

.risk-sync-card {
  display: flex;
  flex-direction: column;
  gap: 3px;
  margin-bottom: 8px;
  padding: 9px 10px;
  border: 1px solid #bbf7d0;
  border-radius: 6px;
  background: #f0fdf4;
  color: #166534;
  font-size: 12px;
}

.risk-sync-card strong {
  color: #14532d;
  font-size: 13px;
}

.risk-sync-card em {
  color: #15803d;
  font-style: normal;
}

/* Quality */
.quality-chart {
  display: flex;
  justify-content: center;
  margin-bottom: 12px;
}

.donut {
  width: 100px;
  height: 100px;
}

.quality-stats {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.q-row {
  display: flex;
  justify-content: space-between;
  font-size: 13px;
  padding: 4px 0;
  border-bottom: 1px solid #f5f5f5;
}
.q-row .green { color: #52c41a; font-weight: 600; }
.q-row .red { color: #ff4d4f; font-weight: 600; }
.q-row .orange { color: #fa8c16; font-weight: 600; }

.empty-state {
  text-align: center;
  color: #ccc;
  padding: 24px;
  font-size: 14px;
}

@media (max-width: 1180px) {
  .ops-command-hero,
  .command-grid,
  .command-bottom,
  .hypercare-command {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 720px) {
  .command-header {
    flex-direction: column;
  }

  .blocker-item {
    grid-template-columns: 1fr;
  }
}
</style>
