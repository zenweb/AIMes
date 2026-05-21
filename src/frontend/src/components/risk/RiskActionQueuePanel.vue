<template>
  <section class="risk-action-panel" aria-label="风险处置队列">
    <div class="action-heading">
      <div>
        <span class="eyebrow">Agent 触发器</span>
        <h3>风险处置队列</h3>
      </div>
      <span class="queue-badge">{{ openCount }} 个待处置</span>
    </div>

    <div class="action-metrics">
      <div v-for="metric in metrics" :key="metric.label" class="metric-tile">
        <strong>{{ metric.value }}</strong>
        <span>{{ metric.label }}</span>
      </div>
    </div>

    <section class="sla-review-panel" aria-label="风险 SLA 晨会复核">
      <div class="sla-review-heading">
        <div>
          <span class="eyebrow">SLA Review</span>
          <h4>风险 SLA 晨会复核</h4>
          <p>把逾期、关键缺料和瓶颈设备风险升级给生产经理，形成排产保护、采购承诺、设备窗口和治理审计动作。</p>
        </div>
        <div class="sla-review-buttons">
          <button type="button" @click="generateSlaReview">生成 SLA 晨会复核包</button>
          <button
            v-if="slaReview && slaReview.status !== 'closed'"
            type="button"
            class="secondary"
            @click="closeSlaReview"
          >
            确认责任动作闭环
          </button>
        </div>
      </div>

      <div v-if="slaReview" class="sla-review-card">
        <div class="sla-review-topline">
          <span>{{ slaReview.statusLabel }}</span>
          <code>{{ slaReview.reviewMeetingId }}</code>
        </div>
        <strong>{{ slaReview.title }}</strong>
        <p>{{ slaReview.summary }}</p>
        <div class="sla-review-metrics">
          <span>逾期 {{ slaReview.overdueCount }} 项</span>
          <span>关键风险 {{ slaReview.criticalCount }} 项</span>
          <span>OTD {{ slaReview.otdImpact }}</span>
        </div>
        <div v-if="slaReview.closureSummary" class="sla-review-closure">
          <strong>{{ slaReview.closureSummary }}</strong>
          <code>{{ slaReview.closureAuditId }} / {{ slaReview.closureTraceId }}</code>
        </div>
        <div class="sla-review-columns">
          <div>
            <h5>复核风险</h5>
            <ul>
              <li v-for="risk in slaReview.risks.slice(0, 3)" :key="risk.id">
                <b>{{ risk.title }}</b>
                <span>{{ risk.owner }} / {{ risk.dueAt }} / {{ risk.deliveryImpact }}</span>
              </li>
            </ul>
          </div>
          <div>
            <h5>责任动作</h5>
            <ul>
              <li v-for="action in slaReview.actions" :key="action.evidence">
                <b>{{ action.module }} · {{ action.owner }}</b>
                <span>{{ action.action }}</span>
                <em v-if="action.result">{{ action.result }}</em>
              </li>
            </ul>
          </div>
        </div>
        <div class="sla-review-audit">
          <span>审计编号：{{ slaReview.auditId }}</span>
          <code>{{ slaReview.traceId }}</code>
        </div>
      </div>
      <div v-else class="sla-review-empty">
        <strong>等待生成晨会复核包</strong>
        <span>生成后会同步到 AI 排产事件队列、AI 生产助手、系统治理、报表证据链和审计回放。</span>
      </div>
    </section>

    <div class="action-grid">
      <article
        v-for="item in actionItems"
        :key="item.id"
        class="action-card"
        :class="[item.level, item.status]"
      >
        <div class="card-topline">
          <span>{{ item.type }}</span>
          <em>{{ statusText(item.status) }}</em>
        </div>
        <h4>{{ item.title }}</h4>
        <p>{{ item.impact }}</p>
        <div class="card-meta">
          <span>影响工单：{{ item.workOrders }}</span>
          <span>交期影响：{{ item.deliveryImpact }}</span>
          <span>负责人：{{ item.owner }}</span>
          <span>截止：{{ item.dueAt }}</span>
        </div>
        <div class="suggestion-box">
          <strong>建议动作</strong>
          <span>{{ item.suggestion }}</span>
        </div>
        <div v-if="item.note" class="closure-note">
          <strong>责任动作</strong>
          <span>{{ item.note }}</span>
        </div>
        <div class="card-actions">
          <button type="button" @click="reassign(item.id)">转派</button>
          <button type="button" @click="escalate(item.id)">升级</button>
          <button type="button" @click="closeItem(item.id)">关闭</button>
        </div>
      </article>
    </div>

    <div class="queue-trace">
      <h4>处置留痕</h4>
      <ul>
        <li v-for="record in actionRecords" :key="record">{{ record }}</li>
      </ul>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import { readProductionAnomalyEvent } from '../../utils/production-anomaly-sync'
import { readAnomalyDispatchRecords } from '../../utils/anomaly-dispatch-sync'
import { readAssistantRecoveryPackages } from '../../utils/assistant-action-package-sync'
import { appendRiskActionTrace, type RiskActionTraceStatus } from '../../utils/risk-action-sync'
import {
  closeRiskSlaReviewRecord,
  readRiskSlaReviewRecord,
  writeRiskSlaReviewRecord,
  type RiskSlaReviewRecord,
} from '../../utils/risk-sla-review-sync'
import {
  closeMonitoringSituationEscalation,
  readMonitoringSituationEscalations,
} from '../../utils/monitoring-situation-escalation-sync'

type RiskLevel = 'critical' | 'warning'
type RiskActionStatus = 'open' | 'assigned' | 'escalated' | 'closed'

interface RiskActionItem {
  id: string
  type: string
  title: string
  level: RiskLevel
  workOrders: string
  deliveryImpact: string
  suggestion: string
  owner: string
  dueAt: string
  status: RiskActionStatus
  impact: string
  note?: string
}

const baseActionItems: RiskActionItem[] = [
  {
    id: 'risk-order-0042',
    type: '工单延期',
    title: 'WO-2026-0042 CNC 停机延期',
    level: 'critical',
    workOrders: 'WO-2026-0042 / WO-2026-0041',
    deliveryImpact: '预计延期 2 天',
    suggestion: '生成 AI 重排建议：CNC-003 分流 + 夜班加班 2 小时。',
    owner: '调度员 李工',
    dueAt: '今日 14:00',
    status: 'open',
    impact: 'CNC-001 故障导致精密转接座停工，已影响客户承诺交期。',
  },
  {
    id: 'risk-material-al6061',
    type: '物料缺口',
    title: 'AL-6061 齐套缺口',
    level: 'critical',
    workOrders: 'WO-RUSH-9001 / WO-DEMO-1002',
    deliveryImpact: '急单存在 1 单延期风险',
    suggestion: '生成采购加急单，并评估 M-AL-6061B 替代料释放排产约束。',
    owner: '采购 王工',
    dueAt: '今日 16:00',
    status: 'assigned',
    impact: '铝合金 6061 可用 45/200，供应商交期延误 5 天。',
  },
  {
    id: 'risk-equipment-cnc001',
    type: '设备健康',
    title: 'CNC-001 主轴振动异常',
    level: 'warning',
    workOrders: 'WO-2026-0042 / WO-2026-0045',
    deliveryImpact: '维护窗口占用 2 小时',
    suggestion: '升级给设备主管确认维护窗口，排产页同步保护瓶颈设备。',
    owner: '设备 赵工',
    dueAt: '明日 10:00',
    status: 'open',
    impact: '主轴振动较基线增加 47%，继续运行会扩大停机风险。',
  },
]

function buildProductionAnomalyRiskItem(): RiskActionItem | null {
  const event = readProductionAnomalyEvent()
  if (!event) return null

  return {
    id: `risk-${event.id}`,
    type: '生产异常',
    title: event.title,
    level: event.severity === 'Critical' || event.severity === 'High' ? 'critical' : 'warning',
    workOrders: event.workOrderNumber,
    deliveryImpact: '预计影响当前工序与排产承诺',
    suggestion: event.suggestedAction,
    owner: '班组长 孙八',
    dueAt: '立即',
    status: 'open',
    impact: `${event.operationName} 现场异常：${event.description}`,
  }
}

function buildAnomalyDispatchRiskItems(): RiskActionItem[] {
  return readAnomalyDispatchRecords().map((record) => ({
    id: `risk-${record.id}`,
    type: record.typeLabel,
    title: record.title,
    level: record.type === 'material' ? 'warning' : 'critical',
    workOrders: record.affectedOrders,
    deliveryImpact: record.deliveryImpact,
    suggestion: record.suggestedAction,
    owner: record.owner,
    dueAt: record.dueAt,
    status: 'open',
    impact: `${record.route}：${record.summary}`,
  }))
}

function buildAssistantRecoveryRiskItems(): RiskActionItem[] {
  return readAssistantRecoveryPackages().map((record) => ({
    id: `risk-assistant-recovery-${record.id}`,
    type: '助手执行包',
    title: record.title,
    level: record.priority,
    workOrders: record.workOrders,
    deliveryImpact: `${record.otdImpact} / ${record.delayImpact}`,
    suggestion: record.purchaseActionSummary
      ? `${record.riskSuggestion} ${record.purchaseActionSummary}`
      : record.riskSuggestion,
    owner: record.owner,
    dueAt: record.dueAt,
    status: record.status === 'closed' ? 'closed' : 'escalated',
    impact: record.closureSummary
      ? `${record.riskImpact} ${record.closureSummary}`
      : record.purchaseActionSummary
        ? `${record.riskImpact} ${record.purchaseActionSummary}`
        : record.riskImpact,
    note: record.purchaseActionStatus === 'closed'
      ? `采购责任动作：${record.purchaseActionSummary}${record.purchaseActionTraceId ? ` ${record.purchaseActionTraceId}` : ''}`
      : undefined,
  }))
}

function buildMonitoringSituationRiskItems(): RiskActionItem[] {
  return readMonitoringSituationEscalations().map(record => ({
    id: `risk-${record.id}`,
    type: '现场态势',
    title: record.title,
    level: record.priority,
    workOrders: record.workOrders,
    deliveryImpact: record.delayImpact,
    suggestion: `${record.riskSuggestion} 追踪：${record.traceId}`,
    owner: record.owner,
    dueAt: record.dueAt,
    status: record.status === 'closed' ? 'closed' : 'escalated',
    impact: record.riskImpact,
  }))
}

const actionItems = ref<RiskActionItem[]>([])
const actionRecords = ref<string[]>([])
const slaReview = ref<RiskSlaReviewRecord | null>(null)

function syncRiskActionQueue() {
  const productionAnomalyRiskItem = buildProductionAnomalyRiskItem()
  const anomalyDispatchRiskItems = buildAnomalyDispatchRiskItems()
  const assistantRecoveryRiskItems = buildAssistantRecoveryRiskItems()
  const monitoringSituationRiskItems = buildMonitoringSituationRiskItems()

  actionItems.value = productionAnomalyRiskItem
    ? [productionAnomalyRiskItem, ...monitoringSituationRiskItems, ...assistantRecoveryRiskItems, ...anomalyDispatchRiskItems, ...baseActionItems]
    : [...monitoringSituationRiskItems, ...assistantRecoveryRiskItems, ...anomalyDispatchRiskItems, ...baseActionItems]

  actionRecords.value = [
    ...(slaReview.value
      ? [`${slaReview.value.title} 已生成，${slaReview.value.reviewMeetingId} 同步到 AI 排产、助手、治理和审计回放。`]
      : []),
    ...monitoringSituationRiskItems.map(item => `${item.title} 已由实时监控升级为跨模块处置包，进入风险处置队列。`),
    ...assistantRecoveryRiskItems.map(item => item.status === 'closed'
      ? `${item.title} 已由 AI 排产确认执行交接闭环${item.note ? `；${item.note}` : ''}，风险队列转为复盘状态。`
      : `${item.title} 已由 AI 生产助手生成执行包，升级为跨模块风险处置项。`),
    ...anomalyDispatchRiskItems.map(item => `${item.title} 已由异常管理现场事件中心确认分流，进入风险处置队列。`),
    ...(productionAnomalyRiskItem
      ? [`${productionAnomalyRiskItem.title} 已由生产报工异常上报自动进入风险处置队列。`]
      : []),
    '系统生成 3 张风险处置卡，并同步为调度员 Agent 触发器。',
  ]
}

const openCount = computed(() => actionItems.value.filter(item => item.status !== 'closed').length)
const metrics = computed(() => [
  { label: '待处置工作项', value: openCount.value },
  { label: '已转派', value: actionItems.value.filter(item => item.status === 'assigned').length },
  { label: '已升级', value: actionItems.value.filter(item => item.status === 'escalated').length },
  { label: '已关闭', value: actionItems.value.filter(item => item.status === 'closed').length },
])

function statusText(status: RiskActionStatus) {
  return {
    open: '待处置',
    assigned: '已转派',
    escalated: '已升级',
    closed: '已关闭',
  }[status]
}

function reassign(id: string) {
  const item = findItem(id)
  if (!item || item.status === 'closed') return
  item.status = 'assigned'
  item.owner = '班组长 孙八'
  actionRecords.value.unshift(`${item.title} 已转派给 ${item.owner}，要求在 ${item.dueAt} 前反馈处置结果。`)
  recordRiskAction(item, 'assigned', `${item.title} 已转派给 ${item.owner}，要求在 ${item.dueAt} 前反馈处置结果。`)
}

function escalate(id: string) {
  const item = findItem(id)
  if (!item || item.status === 'closed') return
  item.status = 'escalated'
  item.owner = '生产经理审批'
  actionRecords.value.unshift(`${item.title} 已升级为跨部门处置，等待生产经理确认资源调整。`)
  recordRiskAction(item, 'escalated', `${item.title} 已升级为跨部门处置，等待生产经理确认资源调整。`)
}

function closeItem(id: string) {
  const item = findItem(id)
  if (!item) return
  item.status = 'closed'
  const trace = `${item.title} 已关闭，处置结果将进入 OTD 复盘与审计日志。`
  if (id.startsWith('risk-monitoring-situation-')) {
    const escalationId = id.replace(/^risk-/, '')
    const closedRecord = closeMonitoringSituationEscalation(escalationId, trace, item.owner)
    if (closedRecord) {
      item.deliveryImpact = closedRecord.delayImpact
      item.suggestion = `${closedRecord.riskSuggestion} 已反写现场处置包，闭环：${closedRecord.closureTrace}`
      item.impact = `${closedRecord.riskImpact} ${closedRecord.statusLabel}。`
      actionRecords.value.unshift(`${item.title} 已关闭并反写实时监控处置包，${closedRecord.traceId} 状态更新为已闭环。`)
      recordRiskAction(item, 'closed', `${trace} 已反写现场处置包 ${closedRecord.traceId}。`)
      return
    }
  }
  actionRecords.value.unshift(trace)
  recordRiskAction(item, 'closed', trace)
}

function findItem(id: string) {
  return actionItems.value.find(item => item.id === id)
}

function recordRiskAction(item: RiskActionItem, status: RiskActionTraceStatus, trace: string) {
  appendRiskActionTrace({
    id: `${item.id}-${status}`,
    title: item.title,
    type: item.type,
    status,
    statusLabel: statusText(status),
    owner: item.owner,
    workOrders: item.workOrders,
    deliveryImpact: item.deliveryImpact,
    suggestion: item.suggestion,
    trace,
    createdAt: new Date().toISOString(),
  })
}

function generateSlaReview() {
  slaReview.value = writeRiskSlaReviewRecord({
    risks: actionItems.value
      .filter(item => item.status !== 'closed')
      .map(item => ({
        id: item.id,
        type: item.type,
        title: item.title,
        level: item.level,
        owner: item.owner,
        dueAt: item.dueAt,
        workOrders: item.workOrders,
        deliveryImpact: item.deliveryImpact,
        status: item.status,
        statusLabel: statusText(item.status),
        suggestion: item.suggestion,
      })),
  })
  actionRecords.value.unshift(`${slaReview.value.title} 已生成，会议 ${slaReview.value.reviewMeetingId}，审计 ${slaReview.value.auditId}。`)
}

function closeSlaReview() {
  const closed = closeRiskSlaReviewRecord('生产经理')
  if (!closed) return
  slaReview.value = closed
  actionRecords.value.unshift(`${closed.title} 责任动作已闭环，${closed.closureTraceId} 已写入 OTD 证据链和审计回放。`)
}

onMounted(() => {
  slaReview.value = readRiskSlaReviewRecord()
  syncRiskActionQueue()
})
</script>

<style scoped>
.risk-action-panel {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 20px;
  padding: 14px;
  border: 1px solid #bfdbfe;
  border-radius: 8px;
  background: #f8fbff;
}

.action-heading,
.card-topline {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: flex-start;
}

.eyebrow {
  display: block;
  margin-bottom: 3px;
  color: #1d4ed8;
  font-size: 12px;
  font-weight: 700;
}

h3,
h4,
p,
ul {
  margin: 0;
}

h3 {
  color: #111827;
  font-size: 16px;
}

.queue-badge {
  flex: 0 0 auto;
  padding: 5px 10px;
  border: 1px solid #fecaca;
  border-radius: 4px;
  background: #fff1f2;
  color: #be123c;
  font-size: 12px;
  font-weight: 700;
}

.action-metrics,
.card-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.sla-review-panel {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 12px;
  border: 1px solid #fed7aa;
  border-radius: 6px;
  background: #fffaf5;
}

.sla-review-heading,
.sla-review-topline,
.sla-review-audit {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: flex-start;
}

.sla-review-heading p,
.sla-review-card p {
  margin: 0;
  color: #6b7280;
  font-size: 12px;
  line-height: 1.45;
}

.sla-review-buttons {
  display: flex;
  flex: 0 0 auto;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: flex-end;
}

.sla-review-heading button {
  flex: 0 0 auto;
  padding: 7px 12px;
  border: 1px solid #c2410c;
  border-radius: 4px;
  background: #c2410c;
  color: #fff;
  cursor: pointer;
  font-size: 12px;
  font-weight: 700;
}

.sla-review-heading button.secondary {
  border-color: #15803d;
  background: #15803d;
}

.sla-review-card,
.sla-review-empty {
  padding: 10px;
  border: 1px solid #fed7aa;
  border-radius: 5px;
  background: #fff;
}

.sla-review-card {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.sla-review-topline span,
.sla-review-metrics span,
.sla-review-audit span {
  padding: 2px 6px;
  border-radius: 4px;
  background: #ffedd5;
  color: #c2410c;
  font-size: 12px;
  font-weight: 700;
}

.sla-review-card strong,
.sla-review-empty strong,
.sla-review-columns h5 {
  color: #111827;
  font-size: 13px;
}

.sla-review-closure {
  display: grid;
  gap: 4px;
  padding: 8px;
  border: 1px solid #bbf7d0;
  border-radius: 4px;
  background: #f0fdf4;
}

.sla-review-closure code,
.sla-review-audit code {
  overflow-wrap: anywhere;
}

.sla-review-metrics,
.sla-review-columns {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 8px;
}

.sla-review-columns {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.sla-review-columns ul {
  display: grid;
  gap: 6px;
  margin: 0;
  padding-left: 16px;
}

.sla-review-columns li {
  color: #4b5563;
  font-size: 12px;
  line-height: 1.45;
}

.sla-review-columns em {
  display: block;
  margin-top: 3px;
  color: #15803d;
  font-style: normal;
  font-weight: 700;
}

.sla-review-columns b,
.sla-review-columns span,
.sla-review-empty span {
  display: block;
}

.sla-review-empty span {
  color: #6b7280;
  font-size: 12px;
}

.metric-tile {
  min-width: 128px;
  padding: 8px 10px;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  background: #fff;
}

.metric-tile strong {
  display: block;
  color: #111827;
  font-size: 18px;
}

.metric-tile span,
.action-card p,
.card-meta span,
.suggestion-box span,
.queue-trace li {
  color: #4b5563;
  font-size: 12px;
  line-height: 1.45;
}

.action-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
}

.action-card {
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-height: 246px;
  padding: 11px;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  background: #fff;
}

.action-card.critical {
  border-color: #fecaca;
}

.action-card.warning {
  border-color: #fde68a;
}

.action-card.closed {
  opacity: 0.72;
}

.card-topline span,
.card-topline em,
.card-meta span {
  padding: 2px 6px;
  border-radius: 4px;
  background: #f3f4f6;
  color: #4b5563;
  font-size: 12px;
}

.card-topline em {
  background: #eff6ff;
  color: #1d4ed8;
  font-style: normal;
  font-weight: 700;
}

.action-card.escalated .card-topline em {
  background: #fff7ed;
  color: #c2410c;
}

.action-card.closed .card-topline em {
  background: #f0fdf4;
  color: #15803d;
}

.action-card h4,
.suggestion-box strong,
.queue-trace h4 {
  color: #111827;
  font-size: 14px;
}

.suggestion-box {
  display: flex;
  flex-direction: column;
  gap: 3px;
  padding: 8px;
  border-radius: 4px;
  background: #f9fafb;
}

.closure-note {
  display: flex;
  flex-direction: column;
  gap: 3px;
  padding: 8px;
  border-radius: 4px;
  background: #ecfeff;
}

.closure-note strong {
  color: #0f766e;
  font-size: 12px;
}

.closure-note span {
  color: #0f172a;
  font-size: 12px;
  line-height: 1.45;
}

.card-actions {
  display: flex;
  gap: 6px;
  margin-top: auto;
}

.card-actions button {
  flex: 1;
  padding: 6px 8px;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  background: #fff;
  color: #374151;
  cursor: pointer;
  font-size: 12px;
  font-weight: 700;
}

.card-actions button:hover {
  border-color: #2563eb;
  color: #1d4ed8;
}

.queue-trace {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 10px;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  background: #fff;
}

.queue-trace ul {
  display: grid;
  gap: 5px;
  padding-left: 18px;
}

@media (max-width: 1180px) {
  .action-grid,
  .sla-review-metrics,
  .sla-review-columns {
    grid-template-columns: 1fr;
  }

  .sla-review-heading,
  .sla-review-audit {
    flex-direction: column;
  }

  .sla-review-buttons {
    justify-content: flex-start;
  }
}
</style>
