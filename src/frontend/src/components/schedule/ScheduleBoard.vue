<template>
  <div class="schedule-board">
      <GanttToolbar
        :scale="currentScale"
        :objective="currentObjective"
        :plan-name="planName"
        :lock-period-hours="8"
        :loading="loading"
        @optimize="handleOptimize"
        @refresh="loadData"
        @feedback="showFeedbackForm = true"
        @compare="showParetoCompare = true"
        @export-csv="handleExportCsv"
        @update:scale="currentScale = $event"
        @update:objective="currentObjective = $event"
      />

      <ScheduleMetrics
        :utilization="metrics.utilization"
        :on-time-delivery="metrics.onTimeDelivery"
        :changeover-minutes="metrics.changeoverMinutes"
        :group-count="metrics.groupCount"
      />

      <ScheduleAgentWorkbenchPanel
        :comparison="impactComparison"
        :latest-feedback="latestFeedback"
        :active-suggestion="activeAgentSuggestion"
      />

      <ScheduleImpactPanel :comparison="impactComparison" />

      <RushOrderImpactPanel :impact="rushOrderImpact" />

      <EngineeringConstraintPanel
        :constraints="engineeringConstraints"
        :trace="engineeringConstraintTrace"
      />

      <ScheduleFeedbackPanel
        :latest-feedback="latestFeedback"
        :submitting="feedbackSubmitting"
        :sync-note="feedbackSyncNote"
        @decision="handleScheduleDecision"
      />

      <ScheduleEventQueuePanel
        :events="scheduleEvents"
        :active-suggestion="activeAgentSuggestion"
        @generate="generateAgentSuggestion"
        @adopt="adoptAgentSuggestion"
      />

      <ScheduleRecoveryHandoffPanel
        :packages="assistantRecoveryPackageRecords"
        :active-suggestion="activeAgentSuggestion"
        :latest-feedback="latestFeedback"
        @close-handoff="closeAssistantRecoveryHandoff"
      />

      <div class="gantt-wrapper">
        <div v-if="loading" class="loading-overlay">
          <div class="spinner"></div>
          <span>{{ loadingMessage }}</span>
        </div>

        <div v-if="error" class="error-banner">
          {{ error }}
          <button @click="loadData">重试</button>
        </div>

        <div v-if="warnings.length > 0" class="warnings-bar">
          <span class="warnings-icon">⚠</span>
          <span v-for="(w, i) in warnings" :key="i" class="warning-item">{{ w }}</span>
        </div>

        <div v-if="useDemoTaskShortcuts" class="task-explain-shortcuts" aria-label="演示排产任务">
          <button
            v-for="task in demoTaskExplainTasks"
            :key="task.id"
            type="button"
            class="task-explain-shortcut"
            :aria-label="`打开 ${task.text} 排产解释`"
            @click="openDemoTaskExplanation(task)"
          >
            {{ task.text }}
          </button>
        </div>

        <GanttChart
          ref="ganttRef"
          :data="ganttData"
          :lock-period-hours="8"
          :scale="currentScale"
          @task-click="handleTaskClick"
          @task-dbl-click="handleTaskDblClick"
          @task-drag-end="handleTaskDragEnd"
        />
      </div>

      <OrderDetailPanel
        :visible="detailVisible"
        :loading="detailLoading"
        :error="detailError"
        :order="selectedOrder"
        :explanation="selectedTaskExplanation"
        @close="detailVisible = false"
      />

      <FeedbackForm
        :visible="showFeedbackForm"
        :schedule-plan-id="planData?.id ?? ''"
        :workshop-id="'workshop-1'"
        :optimization-objective="currentObjective"
        @close="showFeedbackForm = false"
        @submitted="onFeedbackSubmitted"
      />

      <ParetoCompare
        :visible="showParetoCompare"
        :workshop-id="'workshop-1'"
        @close="showParetoCompare = false"
        @apply="onApplyObjective"
      />
    </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, watch, defineAsyncComponent } from 'vue'
import GanttToolbar from '../gantt/GanttToolbar.vue'
import ScheduleMetrics from './ScheduleMetrics.vue'
import ScheduleAgentWorkbenchPanel from './ScheduleAgentWorkbenchPanel.vue'
import ScheduleImpactPanel, { type ScheduleImpactComparison } from './ScheduleImpactPanel.vue'
import RushOrderImpactPanel, { type RushOrderImpact } from './RushOrderImpactPanel.vue'
import EngineeringConstraintPanel, {
  type EngineeringConstraintItem,
  type EngineeringConstraintTrace,
} from './EngineeringConstraintPanel.vue'
import ScheduleFeedbackPanel, {
  type ScheduleFeedbackPayload,
  type ScheduleFeedbackRecord,
} from './ScheduleFeedbackPanel.vue'
import ScheduleEventQueuePanel, {
  type ScheduleAgentSuggestion,
  type ScheduleAgentScenario,
  type ScheduleEventItem,
} from './ScheduleEventQueuePanel.vue'
import ScheduleRecoveryHandoffPanel from './ScheduleRecoveryHandoffPanel.vue'
import OrderDetailPanel from './OrderDetailPanel.vue'
import type { ScheduleTaskExplanation } from './OrderDetailPanel.vue'
import FeedbackForm from '../gantt/FeedbackForm.vue'
import ParetoCompare from './ParetoCompare.vue'

const GanttChart = defineAsyncComponent({
  loader: () => import('../gantt/GanttChart.vue'),
  loadingComponent: {
    template: '<div class="gantt-loading"><div class="spinner"></div><span>加载甘特图...</span></div>',
  },
  delay: 200,
})
import * as api from '../../api/scheduling'
import { getBottleneckEquipmentIds } from '../../api/equipment'
import { getRiskDashboard } from '../../api/risk'
import { planToGanttData, detectConflicts } from '../../utils/gantt-mapper'
import { useExport } from '../../composables/useExport'
import {
  matchesShortageMaterial,
  readBomKittingPackage,
  readShortageKittingEvent,
  readShortageRiskResolution,
  readSupplierNetworkDecision,
  readSupplyRiskEscalation,
} from '../../utils/shortage-risk-sync'
import { readQualityReworkImpact } from '../../utils/quality-rework-sync'
import { readQualityMrbDispositionRecord } from '../../utils/quality-mrb-disposition-sync'
import { readEquipmentDowntimeEvent } from '../../utils/equipment-risk-sync'
import { readAnomalyDispatchRecords } from '../../utils/anomaly-dispatch-sync'
import { writeScheduleFeedbackSnapshot } from '../../utils/schedule-feedback-sync'
import {
  readAlternateMaterialApproval,
  readEngineeringChangeImpactAnalysis,
  readRouteCapabilityValidation,
  type AlternateMaterialApproval,
  type EngineeringChangeImpactAnalysis,
  type RouteCapabilityValidation,
} from '../../utils/engineering-change-sync'
import {
  confirmOutsourcingScheduleRelease,
  readLatestOutsourcingCommitmentPackage,
  type OutsourcingCommitmentPackage,
} from '../../utils/outsourcing-commitment-sync'
import {
  readLatestOtdKpiCommitmentPackage,
  type OtdKpiCommitmentPackage,
} from '../../utils/otd-kpi-commitment-sync'
import {
  readOtdEvidenceChainRecords,
  type OtdEvidenceChainItem,
} from '../../utils/otd-evidence-chain-sync'
import {
  closeAssistantRecoveryPackage,
  readAssistantRecoveryPackages,
  type AssistantRecoveryPackage,
} from '../../utils/assistant-action-package-sync'
import {
  readAssistantEngineeringConstraintPackages,
  type AssistantEngineeringConstraintPackage,
} from '../../utils/assistant-engineering-constraint-package-sync'
import { readMonitoringSituationEscalations } from '../../utils/monitoring-situation-escalation-sync'
import { readPocPilotRunRecord } from '../../utils/poc-pilot-run-sync'
import { readRiskSlaReviewRecord } from '../../utils/risk-sla-review-sync'
import {
  readLaborQualificationBlock,
  readLaborReassignment,
  type LaborQualificationBlockRecord,
  type LaborReassignmentRecord,
} from '../../utils/labor-assignment-sync'

const { csvFilename, downloadCsv } = useExport()
import type {
  SchedulePlanDto,
  ScheduleItemDto,
  EquipmentDto,
  GanttData,
  GanttTask,
  WorkOrderDto,
} from '../../types/scheduling'
import type { RiskDashboardDto } from '../../types/risk'

const ganttRef = ref()
const currentScale = ref<'day' | 'week' | 'month'>('day')
const currentObjective = ref('due_date')
const loading = ref(false)
const loadingMessage = ref('加载中...')
const error = ref('')
const planName = ref('')
const planData = ref<SchedulePlanDto | null>(null)
const equipmentList = ref<EquipmentDto[]>([])
const bottleneckIds = ref<Set<string>>()
const ganttData = ref<GanttData>({ tasks: [], links: [] })
const useDemoTaskShortcuts = import.meta.env.VITE_SHOW_DEMO_HINTS === 'true'
const demoTaskExplainTasks = computed(() =>
  ganttData.value.tasks.filter((task) => task.parent !== '0' && task.workOrderId).slice(0, 5)
)

const detailVisible = ref(false)
const detailLoading = ref(false)
const detailError = ref('')
const selectedOrder = ref<WorkOrderDto | null>(null)
const selectedTaskExplanation = ref<ScheduleTaskExplanation | null>(null)
const showFeedbackForm = ref(false)
const showParetoCompare = ref(false)
const feedbackSubmitting = ref(false)
const feedbackSyncNote = ref('')
const latestFeedback = ref<ScheduleFeedbackRecord | null>(null)
const activeAgentSuggestion = ref<ScheduleAgentSuggestion | null>(null)
const alternateMaterialApproval = ref<AlternateMaterialApproval | null>(null)
const engineeringChangeImpact = ref<EngineeringChangeImpactAnalysis | null>(null)
const routeCapabilityValidation = ref<RouteCapabilityValidation | null>(null)
const laborReassignment = ref<LaborReassignmentRecord | null>(null)
const laborQualificationBlock = ref<LaborQualificationBlockRecord | null>(null)
const barcodeScheduleReleaseRecord = ref<OtdEvidenceChainItem | null>(null)
const otdKpiCommitmentRecord = ref<OtdKpiCommitmentPackage | null>(null)
const outsourcingCommitmentRecord = ref<OutsourcingCommitmentPackage | null>(null)
const assistantRecoveryPackageRecords = ref<AssistantRecoveryPackage[]>([])
const assistantEngineeringConstraintPackageRecords = ref<AssistantEngineeringConstraintPackage[]>([])
const engineeringConstraints = ref<EngineeringConstraintItem[]>([
  {
    id: 'eng-bom-al6061',
    kind: 'bom',
    kindLabel: 'BOM 替代料',
    sourceCode: 'BOM-A100 V1.0',
    title: 'M-AL-6061B 可替代 M-AL-6061',
    explanation: '替代规则要求工程确认后释放齐套约束，适用于 WO-RUSH-9001 与 WO-DEMO-1002 的 CNC 后段物料缺口。',
    affectedOrders: '影响 2 单',
    agentUsage: '用于缺料重排',
  },
  {
    id: 'eng-route-cnc',
    kind: 'route',
    kindLabel: '工艺能力',
    sourceCode: 'R-A100 OP-020',
    title: 'CNC 精加工必须匹配 CNC 设备能力',
    explanation: '标准准备 30 分钟，单件加工 18 分钟；可用设备集合优先 CNC-01，CNC-02 可作为替代但换线增加 15 分钟。',
    affectedOrders: '影响 3 道工序',
    agentUsage: '用于设备切换',
  },
  {
    id: 'eng-route-qc',
    kind: 'route',
    kindLabel: '质量参数',
    sourceCode: 'R-A100 OP-040',
    title: '装配后必须保留扭矩检验窗口',
    explanation: '关键参数 32-36 N.m，检验点不能被压缩；Agent 只能移动前后工序，不能取消质检窗口。',
    affectedOrders: '影响 OTD 复盘',
    agentUsage: '用于锁定质检',
  },
  {
    id: 'eng-labor-cnc',
    kind: 'labor',
    kindLabel: '人员能力',
    sourceCode: 'EMP-001 / EMP-003',
    title: 'CNC 与热处理工序必须匹配有效资质人员',
    explanation: '白班 CNC 由 EMP-001 承接；热处理夜班 EMP-003 资质 2026-05-25 到期，Agent 不应把下周关键热处理任务继续压给该人员。',
    evidence: ['EMP-001 / EMP-003 技能矩阵', 'CNC 精加工 / 热处理岗位证'],
    affectedOrders: '影响 2 个班次',
    agentUsage: '用于开工校验',
  },
])
const engineeringConstraintTrace = ref<EngineeringConstraintTrace>({
  summary: '缺料、设备、质量、人员 4 类约束已进入 Agent 推荐',
  detail: '当前急单建议引用 BOM-A100 替代料规则、R-A100 CNC 能力要求、OP-040 质检窗口、EMP-001 / EMP-003 技能矩阵与资质有效期，避免只按时间空档机械插单。',
})
const demoScheduleEvents: ScheduleEventItem[] = [
  {
    id: 'evt-material-al6061',
    type: 'material',
    typeLabel: '缺料事件',
    severity: 'critical',
    severityLabel: '高风险',
    title: 'M-AL-6061 齐套缺口',
    impact: '急单与 WO-DEMO-1002 共用铝合金 6061，当前缺 12 件。',
    affectedOrders: '影响 2 单',
    window: '8 小时内',
  },
  {
    id: 'evt-equipment-cnc01',
    type: 'equipment',
    typeLabel: '设备故障事件',
    severity: 'warning',
    severityLabel: '中风险',
    title: 'CNC 加工中心 01 健康下降',
    impact: '瓶颈设备存在主轴振动风险，预计需要 2 小时维护窗口。',
    affectedOrders: '影响 3 道工序',
    window: '今日夜班',
  },
  {
    id: 'evt-rush-9001',
    type: 'rush',
    typeLabel: '急单插单事件',
    severity: 'critical',
    severityLabel: '高风险',
    title: 'WO-RUSH-9001 客户插单',
    impact: '客户承诺交期提前，需要在锁定期外插入 CNC 与装配资源。',
    affectedOrders: '影响 2 单',
    window: '24 小时内',
  },
]
const scheduleEvents = ref<ScheduleEventItem[]>([...demoScheduleEvents])

const metrics = reactive({
  utilization: 0,
  onTimeDelivery: 0,
  changeoverMinutes: 0,
  groupCount: 0,
})
const impactComparison = reactive<ScheduleImpactComparison>({
  baseline: {
    otd: 0,
    delayedOrders: 0,
  },
  agent: {
    otd: 0,
    delayedOrders: 0,
  },
  otdImprovement: 0,
  delayedOrdersReduced: 0,
  changeoverDeltaMinutes: 0,
  utilizationDelta: 0,
  reasons: [],
})
const rushOrderImpact = reactive<RushOrderImpact>({
  orderNumber: '',
  affectedOrders: [],
  delayHours: 0,
  changeoverIncreaseMinutes: 0,
  materialShortage: '',
  materialAction: '',
  bottleneckEquipment: '',
  recommendation: '',
  options: [],
})
const warnings = ref<string[]>([])

type ScenarioTemplate = Omit<ScheduleAgentScenario, 'id' | 'selected'>

const scenarioTemplatesByType: Record<ScheduleEventItem['type'], ScenarioTemplate[]> = {
  material: [
    {
      name: '冻结后段 + 替代料',
      strategy: '冻结受缺料影响的 CNC 后段，优先评估 M-AL-6061B 替代料并保留首件检验。',
      otdImpact: '+8%',
      delayImpact: '-1 单',
      changeoverImpact: '+12min',
      rationale: '保护急单交期，同时避免未确认替代料直接进入生产。',
      recommended: true,
    },
    {
      name: '等待采购到货',
      strategy: '保持原排产顺序，等待 PO-RUSH-20260519 到货后再释放冻结工序。',
      otdImpact: '+3%',
      delayImpact: '0 单改善',
      changeoverImpact: '0min',
      rationale: '换线最少，但急单恢复窗口偏晚。',
    },
    {
      name: '跨单借料',
      strategy: '从低优先级工单借料，先释放 WO-RUSH-9001，再补齐 WO-DEMO-1002。',
      otdImpact: '+6%',
      delayImpact: '-1 单',
      changeoverImpact: '+24min',
      rationale: '急单恢复更快，但会放大后续工单齐套风险。',
    },
  ],
  equipment: [
    {
      name: '夜班维护 + CNC-003 分流',
      strategy: '把 CNC-001 维护窗口放入夜班低负载时段，锁定期后把急单分流到 CNC-003。',
      otdImpact: '+5%',
      delayImpact: '-6h',
      changeoverImpact: '-18min',
      rationale: '兼顾瓶颈保护和维护窗口，现场扰动最低。',
      recommended: true,
    },
    {
      name: '立即停机维护',
      strategy: '立即释放 CNC-001 维护窗口，中断当前瓶颈任务并顺延后续工序。',
      otdImpact: '+1%',
      delayImpact: '+1 单风险',
      changeoverImpact: '0min',
      rationale: '设备风险下降最快，但会破坏锁定期承诺。',
    },
    {
      name: '外协临时分流',
      strategy: '将受影响 CNC 工序转给外协，内部产线只保留质检与装配窗口。',
      otdImpact: '+4%',
      delayImpact: '-4h',
      changeoverImpact: '+30min',
      rationale: '交付恢复可行，但外协到货和审计链更重。',
    },
  ],
  rush: [
    {
      name: '加班插入',
      strategy: '保护 8 小时锁定期，把 WO-RUSH-9001 插入锁定期后第一个 CNC 空窗。',
      otdImpact: '+11%',
      delayImpact: '-2 单',
      changeoverImpact: '+20min',
      rationale: 'OTD 改善最高，且现场变更边界清楚。',
      recommended: true,
    },
    {
      name: '强插当前窗口',
      strategy: '直接挤占当前 CNC 窗口，低优先级工单立即后移。',
      otdImpact: '+7%',
      delayImpact: '-1 单',
      changeoverImpact: '+42min',
      rationale: '急单最快，但破坏锁定期并扩大换线成本。',
    },
    {
      name: '换设备插入',
      strategy: '切到 CNC-002/CNC-003 组合加工，装配窗口保持原节奏。',
      otdImpact: '+9%',
      delayImpact: '-1 单',
      changeoverImpact: '+28min',
      rationale: '比强插温和，但设备能力和首件检验需额外确认。',
    },
  ],
  quality: [
    {
      name: '返工合批 + 复验锁定',
      strategy: '合并同工艺返工批次，保留复验窗口并锁定后续质量门。',
      otdImpact: '+3%',
      delayImpact: '-1 单风险',
      changeoverImpact: '-10min',
      rationale: '控制质量风险，同时降低返工造成的连续挤占。',
      recommended: true,
    },
    {
      name: '先放行后复验',
      strategy: '先恢复后续工序，复验安排到装配前。',
      otdImpact: '+5%',
      delayImpact: '-1 单',
      changeoverImpact: '0min',
      rationale: '交期更好，但质量门风险不可接受。',
    },
    {
      name: '完全冻结',
      strategy: '冻结受影响工单，等待质量工程师完成复核后再排产。',
      otdImpact: '-2%',
      delayImpact: '+1 单风险',
      changeoverImpact: '0min',
      rationale: '质量最稳，但交付恢复不足。',
    },
  ],
  labor: [
    {
      name: '替班放行',
      strategy: '按已审批替班记录释放热处理工序，生产开工保留班组长复核。',
      otdImpact: '+4%',
      delayImpact: '-1 班次风险',
      changeoverImpact: '0min',
      rationale: '资质有效且审计链完整，是人员约束的首选恢复路径。',
      recommended: true,
    },
    {
      name: '停工复核',
      strategy: '保持热处理冻结，等待主管补证或改派后再释放。',
      otdImpact: '-6%',
      delayImpact: '+1 班次待复核',
      changeoverImpact: '0min',
      rationale: '无有效候选时必须采用，不能用排产优化绕过开工资质。',
    },
    {
      name: '跨班借调',
      strategy: '从白班借调具备资质人员，夜班加班执行。',
      otdImpact: '+2%',
      delayImpact: '0 单风险',
      changeoverImpact: '+6min',
      rationale: '可缓解短期风险，但排班和加班窗口需要主管确认。',
    },
  ],
  route: [
    {
      name: '合批分流',
      strategy: '按已确认能力窗口合批或分流到候选设备。',
      otdImpact: '+4%',
      delayImpact: '-1 单风险',
      changeoverImpact: '+10min',
      rationale: '工艺放行证据完整，适合释放热处理瓶颈。',
      recommended: true,
    },
    {
      name: '等待工艺确认',
      strategy: '冻结超排窗口，等待工艺路线能力校验。',
      otdImpact: '-4%',
      delayImpact: '+1 单风险',
      changeoverImpact: '0min',
      rationale: '保守但拖慢 OTD 恢复。',
    },
    {
      name: '外协兜底',
      strategy: '把瓶颈工序临时转外协，内部保留质量复验。',
      otdImpact: '+3%',
      delayImpact: '-1 单风险',
      changeoverImpact: '+22min',
      rationale: '适合能力缺口持续扩大时启用。',
    },
  ],
  anomaly: [
    {
      name: '冻结当前工序',
      strategy: '先冻结异常关联工序，核对异常中心、风险队列和责任人处置结论。',
      otdImpact: '+2%',
      delayImpact: '-1 个窗口风险',
      changeoverImpact: '0min',
      rationale: '避免异常未闭环时继续放大交付风险。',
      recommended: true,
    },
    {
      name: '直接顺延',
      strategy: '不拆分责任动作，只把受影响工序整体后移。',
      otdImpact: '-1%',
      delayImpact: '+1 单风险',
      changeoverImpact: '0min',
      rationale: '操作简单，但不能解释责任模块。',
    },
    {
      name: '替代资源分流',
      strategy: '把设备或物料异常转入替代资源，质量异常保留复验。',
      otdImpact: '+3%',
      delayImpact: '-1 个窗口风险',
      changeoverImpact: '+12min',
      rationale: '需要下游模块确认后才能采纳。',
    },
  ],
  monitoring: [
    {
      name: '瓶颈保护 + 风险回写',
      strategy: '保护锁定期和 CNC 瓶颈窗口，要求风险队列回写处置结果。',
      otdImpact: '+5%',
      delayImpact: '-4h',
      changeoverImpact: '+10min',
      rationale: '把现场态势转为可审计的跨模块动作。',
      recommended: true,
    },
    {
      name: '现场先处置',
      strategy: '等待现场班组先关闭事件，再由排产复核。',
      otdImpact: '+1%',
      delayImpact: '0 单改善',
      changeoverImpact: '0min',
      rationale: '风险低，但 Agent 响应偏慢。',
    },
    {
      name: '立即重排',
      strategy: '不等待风险队列确认，直接释放分流窗口。',
      otdImpact: '+4%',
      delayImpact: '-3h',
      changeoverImpact: '+18min',
      rationale: '恢复快，但责任闭环不完整。',
    },
  ],
  engineering: [
    {
      name: '审批前模拟',
      strategy: '只生成模拟排产，正式释放必须等待工程审批。',
      otdImpact: '+5%',
      delayImpact: '-1 单风险',
      changeoverImpact: '+8min',
      rationale: '能提前看 OTD，但不绕过 ECN 门禁。',
      recommended: true,
    },
    {
      name: '立即释放',
      strategy: '直接按替代料释放生产窗口。',
      otdImpact: '+7%',
      delayImpact: '-1 单风险',
      changeoverImpact: '+8min',
      rationale: '交期更好，但审批前不可采纳。',
    },
    {
      name: '维持原物料',
      strategy: '撤回模拟，等待原料采购到货。',
      otdImpact: '-4%',
      delayImpact: '+1 单风险',
      changeoverImpact: '0min',
      rationale: '适合 ECN 被驳回后的保守策略。',
    },
  ],
  pilot: [
    {
      name: '上线窗口复核',
      strategy: '复核首批真实工单的排产采纳、执行回写和异常关闭证据。',
      otdImpact: '+1%',
      delayImpact: '0 单新增风险',
      changeoverImpact: '0min',
      rationale: '保证 POC 进入正式上线后口径不漂移。',
      recommended: true,
    },
    {
      name: '仅看报表',
      strategy: '只在报表中心核对 OTD，不回到排产事件队列。',
      otdImpact: '0%',
      delayImpact: '未知',
      changeoverImpact: '0min',
      rationale: '证据链不完整，无法解释现场执行。',
    },
    {
      name: '扩大样本',
      strategy: '把 30 单样本扩大到 60 单后再验收。',
      otdImpact: '+2%',
      delayImpact: '0 单新增风险',
      changeoverImpact: '+8min',
      rationale: '更有说服力，但当前验收节奏更慢。',
    },
  ],
  risk: [
    {
      name: '承诺窗口保护',
      strategy: '按晨会复核包保护承诺工单，优先处理关键缺料和瓶颈设备。',
      otdImpact: '+5%',
      delayImpact: '-1 单延期风险',
      changeoverImpact: '+12min',
      rationale: '责任动作已明确，适合直接进入排产复核。',
      recommended: true,
    },
    {
      name: '逐项关闭',
      strategy: '按风险卡逐项关闭，不形成统一排产保护。',
      otdImpact: '+2%',
      delayImpact: '0 单改善',
      changeoverImpact: '0min',
      rationale: '执行简单，但对老板问题解释力弱。',
    },
    {
      name: '生产经理强控',
      strategy: '由生产经理直接冻结所有风险关联工单。',
      otdImpact: '+3%',
      delayImpact: '+1 单风险',
      changeoverImpact: '0min',
      rationale: '风险控制强，但影响面过大。',
    },
  ],
  production: [
    {
      name: '后续窗口复核',
      strategy: '复核后续工序、质量门和 OTD 证据链，确认完工回写支撑承诺交期。',
      otdImpact: '+2% 已锁定',
      delayImpact: '0 单新增风险',
      changeoverImpact: '0min',
      rationale: '生产完成后最适合做闭环复核。',
      recommended: true,
    },
    {
      name: '直接关闭',
      strategy: '只关闭生产工单，不触发排产复核。',
      otdImpact: '0%',
      delayImpact: '未知',
      changeoverImpact: '0min',
      rationale: '会丢失后续质量门和交付复盘。',
    },
    {
      name: '重新拆单',
      strategy: '把剩余工序拆成多个小批次插入。',
      otdImpact: '+1%',
      delayImpact: '-1 个窗口',
      changeoverImpact: '+16min',
      rationale: '适合有返修或交接不稳定时启用。',
    },
  ],
}

function buildScenarioOptions(event: ScheduleEventItem, suggestion: ScheduleAgentSuggestion): ScheduleAgentScenario[] {
  const templates = scenarioTemplatesByType[event.type] ?? scenarioTemplatesByType.rush
  return templates.map((template, index) => ({
    ...template,
    id: `${event.id}-scenario-${index + 1}`,
    selected: template.recommended || template.name === suggestion.recommendedScenarioName,
  }))
}

function enrichSuggestionWithScenarioPackage(suggestion: ScheduleAgentSuggestion | null): ScheduleAgentSuggestion | null {
  if (!suggestion || suggestion.scenarioOptions?.length) return suggestion
  const event = scheduleEvents.value.find(item => item.id === suggestion.eventId)
  if (!event) return suggestion
  const scenarioOptions = buildScenarioOptions(event, suggestion)
  const recommendedScenario = scenarioOptions.find(scenario => scenario.recommended) ?? scenarioOptions[0]
  return {
    ...suggestion,
    recommendedScenarioName: suggestion.recommendedScenarioName ?? recommendedScenario?.name,
    decisionRationale: suggestion.decisionRationale
      ?? `推荐 ${recommendedScenario?.name ?? suggestion.title}，因为它在 ${event.typeLabel} 下对 OTD、延期和换线成本的综合收益最高，同时保留人工采纳审计。`,
    scenarioOptions,
  }
}

function formatScenarioDecisionTrail(suggestion: ScheduleAgentSuggestion) {
  if (!suggestion.scenarioOptions?.length) return suggestion.action
  const recommended = suggestion.scenarioOptions.find(scenario => scenario.recommended || scenario.selected) ?? suggestion.scenarioOptions[0]
  const rejected = suggestion.scenarioOptions.filter(scenario => scenario.id !== recommended.id)
  const rejectedSummary = rejected.map(scenario => `${scenario.name}：${scenario.rationale}`).join('；')
  return `${suggestion.action} 推荐方案：${recommended.name}（${recommended.strategy}，OTD ${recommended.otdImpact}，延期 ${recommended.delayImpact}，换线 ${recommended.changeoverImpact}）。未选方案：${rejectedSummary}。决策依据：${suggestion.decisionRationale ?? recommended.rationale}`
}

watch(activeAgentSuggestion, (suggestion) => {
  const enriched = enrichSuggestionWithScenarioPackage(suggestion)
  if (enriched && enriched !== suggestion) {
    activeAgentSuggestion.value = enriched
  }
})

async function loadData() {
  loading.value = true
  loadingMessage.value = '加载排产计划...'
  error.value = ''

  try {
    const [plan, equipment, apiBottleneckIds] = await Promise.all([
      api.getCurrentPlan(),
      api.getEquipmentList(),
      getBottleneckEquipmentIds().catch(() => undefined as string[] | undefined),
    ])

    planData.value = plan
    equipmentList.value = equipment.items
    planName.value = plan.planName

    // 更新指标
    metrics.utilization = Math.round(plan.overallUtilizationRate * 100)
    metrics.onTimeDelivery = Math.round(plan.onTimeDeliveryRate * 100)
    metrics.changeoverMinutes = plan.totalChangeoverMinutes ?? 0
    metrics.groupCount = plan.groupCount ?? 0
    applyImpactComparison(plan)

    // 转换为甘特图数据，传入后端瓶颈列表
    bottleneckIds.value = apiBottleneckIds ? new Set(apiBottleneckIds) : undefined
    ganttData.value = planToGanttData(plan, equipment.items, bottleneckIds.value)
    markConflicts(plan.items)
    await loadRiskTriggeredEvents()
  } catch (e: any) {
    console.error('加载排产计划失败:', e)
    applyDemoSchedule()
    warnings.value = ['后端排产服务不可用，当前显示演示排产数据']
  } finally {
    loading.value = false
  }
}

function applyDemoSchedule() {
  const now = new Date()
  const start = addHours(now, 9)
  const end = addHours(now, 56)

  const equipment: EquipmentDto[] = [
    {
      id: 'eq-cnc-01',
      equipmentCode: 'CNC-01',
      equipmentName: 'CNC 加工中心 01',
      equipmentType: 'CNC',
      status: 'running',
      capacity: 120,
      utilizationRate: 0.86,
    },
    {
      id: 'eq-asm-01',
      equipmentCode: 'ASM-01',
      equipmentName: '总装线 01',
      equipmentType: 'Assembly',
      status: 'running',
      capacity: 80,
      utilizationRate: 0.72,
    },
    {
      id: 'eq-ht-01',
      equipmentCode: 'HT-01',
      equipmentName: '热处理炉 01',
      equipmentType: 'HeatTreatment',
      status: 'running',
      capacity: 48,
      utilizationRate: 0.9,
    },
  ]

  const items: ScheduleItemDto[] = [
    {
      id: 'demo-item-1',
      workOrderId: 'demo-wo-1001',
      workOrderNumber: 'WO-DEMO-1001',
      equipmentId: 'eq-cnc-01',
      equipmentName: 'CNC 加工中心 01',
      plannedStartTime: addHours(start, 0).toISOString(),
      plannedEndTime: addHours(start, 6).toISOString(),
      sequence: 1,
      setupTime: '30 分钟',
      dependentItems: [],
    },
    {
      id: 'demo-item-2',
      workOrderId: 'demo-wo-1001',
      workOrderNumber: 'WO-DEMO-1001',
      equipmentId: 'eq-ht-01',
      equipmentName: '热处理炉 01',
      plannedStartTime: addHours(start, 7).toISOString(),
      plannedEndTime: addHours(start, 15).toISOString(),
      sequence: 2,
      setupTime: '45 分钟',
      dependentItems: ['demo-item-1'],
    },
    {
      id: 'demo-item-3',
      workOrderId: 'demo-wo-1002',
      workOrderNumber: 'WO-DEMO-1002',
      equipmentId: 'eq-asm-01',
      equipmentName: '总装线 01',
      plannedStartTime: addHours(start, 16).toISOString(),
      plannedEndTime: addHours(start, 24).toISOString(),
      sequence: 3,
      setupTime: '20 分钟',
      dependentItems: ['demo-item-2'],
    },
  ]

  const plan: SchedulePlanDto = {
    id: 'demo-plan-current',
    planName: '演示排产计划',
    planStartDate: start.toISOString(),
    planEndDate: end.toISOString(),
    items,
    overallUtilizationRate: 0.83,
    onTimeDeliveryRate: 0.96,
    totalChangeoverMinutes: 95,
    groupCount: 3,
    optimizationNotes: '无后端连接时的前端演示计划',
    createdAt: now.toISOString(),
    warnings: ['演示数据'],
  }

  planData.value = plan
  equipmentList.value = equipment
  planName.value = plan.planName
  metrics.utilization = Math.round(plan.overallUtilizationRate * 100)
  metrics.onTimeDelivery = Math.round(plan.onTimeDeliveryRate * 100)
  metrics.changeoverMinutes = plan.totalChangeoverMinutes ?? 0
  metrics.groupCount = plan.groupCount ?? 0
  applyImpactComparison(plan)
  bottleneckIds.value = new Set(['eq-cnc-01', 'eq-ht-01'])
  ganttData.value = planToGanttData(plan, equipment, bottleneckIds.value)
  scheduleEvents.value = applyLaborQualificationBlockToEvents(applyLaborReassignmentToEvents(applyShortageResolutionToEvents(demoScheduleEvents)))
  error.value = ''
}

async function loadRiskTriggeredEvents() {
  try {
    const riskDashboard = await getRiskDashboard()
    scheduleEvents.value = applyLaborQualificationBlockToEvents(applyLaborReassignmentToEvents(applyShortageResolutionToEvents(mapRiskDashboardToScheduleEvents(riskDashboard))))
  } catch (e: any) {
    console.warn('加载风险触发事件失败，使用演示事件队列:', e)
    scheduleEvents.value = applyLaborQualificationBlockToEvents(applyLaborReassignmentToEvents(applyShortageResolutionToEvents(demoScheduleEvents)))
  }
  activeAgentSuggestion.value = null
}

function applyShortageResolutionToEvents(events: ScheduleEventItem[]): ScheduleEventItem[] {
  const resolution = readShortageRiskResolution()
  const kittingEvent = readShortageKittingEvent()
  const bomKittingPackage = readBomKittingPackage()
  const downtimeEvent = readEquipmentDowntimeEvent()
  const qualityRework = readQualityReworkImpact()
  const qualityMrbDisposition = readQualityMrbDispositionRecord()
  const productionCloseoutReview = readOtdEvidenceChainRecords().find(record =>
    record.stage === '生产复核'
    && record.traceId.startsWith('TRACE-PROD-CLOSEOUT-')
  )
  const barcodeScheduleRelease = readBarcodeScheduleReleaseRecord()
  const supplierNetworkDecision = readSupplierNetworkDecision()
  const supplyRisk = readSupplyRiskEscalation()
  const otdKpiCommitment = readLatestOtdKpiCommitmentPackage()
  otdKpiCommitmentRecord.value = otdKpiCommitment
  const outsourcingCommitment = readLatestOutsourcingCommitmentPackage()
  outsourcingCommitmentRecord.value = outsourcingCommitment
  const engineeringImpact = readEngineeringChangeImpactAnalysis()
  const routeCapability = readRouteCapabilityValidation()
  const anomalyDispatchRecords = readAnomalyDispatchRecords()
  const assistantPackages = readAssistantRecoveryPackages()
  const assistantEngineeringPackages = readAssistantEngineeringConstraintPackages()
  assistantRecoveryPackageRecords.value = assistantPackages
  assistantEngineeringConstraintPackageRecords.value = assistantEngineeringPackages
  const monitoringSituationEscalations = readMonitoringSituationEscalations()
  const pocPilotRun = readPocPilotRunRecord()
  const riskSlaReview = readRiskSlaReviewRecord()
  const productionAnomalyRecords = readOtdEvidenceChainRecords()
    .filter(record =>
      record.stage === '生产异常'
      && record.traceId.startsWith('TRACE-PROD-ANOMALY-')
    )
    .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt))
  barcodeScheduleReleaseRecord.value = barcodeScheduleRelease
  engineeringChangeImpact.value = engineeringImpact
  routeCapabilityValidation.value = routeCapability
  const kittingMergedEvents = kittingEvent
    ? [
        {
          id: `evt-kitting-${kittingEvent.materialCode}`,
          type: 'material' as const,
          typeLabel: '缺料事件',
          severity: 'critical' as const,
          severityLabel: '高风险',
          title: `${kittingEvent.materialCode} 工单齐套缺口`,
          impact: bomKittingPackage
            ? `${bomKittingPackage.bomCode} ${bomKittingPackage.bomVersion} 展开到 ${kittingEvent.workOrderNumber}：需要 ${kittingEvent.requiredQuantity}，可用 ${kittingEvent.availableQuantity}，在途 ${kittingEvent.inboundQuantity}，缺口 ${kittingEvent.shortageQuantity}；${kittingEvent.suggestion}`
            : `${kittingEvent.workOrderNumber} 需要 ${kittingEvent.requiredQuantity}，可用 ${kittingEvent.availableQuantity}，在途 ${kittingEvent.inboundQuantity}，缺口 ${kittingEvent.shortageQuantity}；${kittingEvent.suggestion}`,
          affectedOrders: kittingEvent.affectedOrders,
          window: kittingEvent.window,
          evidence: bomKittingPackage
            ? [bomKittingPackage.auditId, bomKittingPackage.traceId, `${bomKittingPackage.bomCode} ${bomKittingPackage.bomVersion}`]
            : undefined,
        },
        ...events,
      ]
    : [...events]

  const equipmentMergedEvents = downtimeEvent
    ? [
        {
          id: `evt-downtime-${downtimeEvent.equipmentCode}`,
          type: 'equipment' as const,
          typeLabel: '设备故障事件',
          severity: 'critical' as const,
          severityLabel: '高风险',
          title: `${downtimeEvent.equipmentCode} 停机影响`,
          impact: `${downtimeEvent.equipmentName} 预计停机 ${downtimeEvent.downtimeHours}h；可替代设备 ${downtimeEvent.alternativeEquipment}；${downtimeEvent.protectionStrategy}`,
          affectedOrders: downtimeEvent.affectedOrders,
          window: downtimeEvent.maintenanceWindow,
        },
        ...kittingMergedEvents,
      ]
    : kittingMergedEvents

  const mergedEvents = qualityRework
    ? [
        ...equipmentMergedEvents,
        {
          id: `evt-quality-${qualityRework.inspectionId}`,
          type: 'quality' as const,
          typeLabel: '质量返工事件',
          severity: 'warning' as const,
          severityLabel: '中风险',
          title: `${qualityRework.workOrderId} 返工插入`,
          impact: `${qualityRework.processName} 检验触发 ${qualityRework.defectQuantity} 件返工，设备 ${qualityRework.equipmentCode}，物料批次 ${qualityRework.materialBatchCode}，批次号 ${qualityRework.batchCode}；预计占用 ${qualityRework.reworkHours}h；${qualityRework.otdImpact}。`,
          affectedOrders: qualityRework.workOrderId,
          window: `${qualityRework.inspectionPoint} 复验前`,
          evidence: qualityRework.evidence,
        },
      ]
    : equipmentMergedEvents

  const qualityMrbMergedEvents = qualityMrbDisposition
    ? [
        {
          id: `evt-quality-mrb-${qualityMrbDisposition.id}`,
          type: 'quality' as const,
          typeLabel: 'MRB 处置事件',
          severity: qualityMrbDisposition.status === 'closed' ? 'warning' as const : 'critical' as const,
          severityLabel: qualityMrbDisposition.status === 'closed' ? '已闭环' : '高风险',
          title: `${qualityMrbDisposition.workOrderId} MRB 报废补料重排`,
          impact: `${qualityMrbDisposition.dispositionLabel}：${qualityMrbDisposition.scheduleImpact} ${qualityMrbDisposition.otdImpact}。`,
          affectedOrders: qualityMrbDisposition.workOrderId,
          window: qualityMrbDisposition.status === 'closed' ? '补料后复核' : qualityMrbDisposition.dueAt,
          evidence: [
            qualityMrbDisposition.auditId,
            qualityMrbDisposition.traceId,
            qualityMrbDisposition.scheduleTraceId,
            ...(qualityMrbDisposition.closureTraceId ? [qualityMrbDisposition.closureTraceId] : []),
          ],
          resolved: qualityMrbDisposition.status === 'closed',
          resolutionNote: qualityMrbDisposition.status === 'closed'
            ? qualityMrbDisposition.closureSummary
            : 'MRB 已判定报废补料，AI 排产需冻结原装配窗口并重建补料后装配/复检计划。',
        },
        ...mergedEvents,
      ]
    : mergedEvents

  const releaseMergedEvents = barcodeScheduleRelease
    ? [
        {
          id: 'evt-quality-release-WO-RUSH-9001-OP-20',
          type: 'quality' as const,
          typeLabel: '扫码返工释放',
          severity: 'warning' as const,
          severityLabel: '已释放',
          title: 'WO-RUSH-9001 OP-20 排产窗口恢复',
          impact: `${barcodeScheduleRelease.title}：${barcodeScheduleRelease.summary}`,
          affectedOrders: barcodeScheduleRelease.object,
          window: '复验放行后',
          evidence: [
            'TRACE-QR-WO-RUSH-9001-OP-10-RECHECK',
            'TRACE-QR-WO-RUSH-9001-OP-10-RELEASE-OP-20',
            barcodeScheduleRelease.traceId,
          ],
          resolved: true,
          resolutionNote: '质量复验已释放 OP-20 接收，AI 排产需复核后段装配复检窗口。',
        },
        ...qualityMrbMergedEvents,
      ]
    : qualityMrbMergedEvents

  const productionCloseoutMergedEvents = productionCloseoutReview
    ? [
        {
          id: `evt-production-closeout-${productionCloseoutReview.traceId}`,
          type: 'production' as const,
          typeLabel: '生产完工事件',
          severity: productionCloseoutReview.status === 'closed' ? 'warning' as const : 'critical' as const,
          severityLabel: productionCloseoutReview.status === 'closed' ? '已复核' : '待复核',
          title: productionCloseoutReview.title,
          impact: productionCloseoutReview.summary,
          affectedOrders: productionCloseoutReview.object,
          window: '完工后复核',
          evidence: [productionCloseoutReview.traceId],
          resolved: productionCloseoutReview.status === 'closed',
          resolutionNote: productionCloseoutReview.status === 'closed'
            ? '生产完工已写入 OTD 证据链，建议复核后续工序窗口和质量门。'
            : '生产完工已形成 OTD 风险提示，建议复核后续工序窗口和质量门。',
        },
        ...releaseMergedEvents,
      ]
    : releaseMergedEvents

  const supplyMergedEvents = supplyRisk
    ? (() => {
      const received = supplyRisk.decision === 'alternate_received'
      const committed = supplyRisk.decision === 'alternate_committed'

      return [
        {
          id: `evt-supply-risk-${supplyRisk.materialCode}`,
          type: 'material' as const,
          typeLabel: '供应风险',
          severity: received || committed ? 'warning' as const : 'critical' as const,
          severityLabel: received ? '已关闭' : committed ? '风险下降' : '高风险',
          title: `${supplyRisk.materialCode} 供应延期风险`,
          impact: received
            ? `${supplyRisk.alternateSupplierName} 到货已确认，${supplyRisk.affectedOrders} 的 ${supplyRisk.materialCode} 供应风险关闭，可释放排产复核。`
            : committed
              ? `${supplyRisk.alternateSupplierName} 已承诺 ${supplyRisk.alternatePromiseDate} 到料，早于原供应商 ${supplyRisk.promisedDeliveryDate} 延后承诺。`
              : `${supplyRisk.supplierName} 将 ${supplyRisk.materialCode} 从 ${supplyRisk.originalDeliveryDate} 推迟到 ${supplyRisk.promisedDeliveryDate}，延期 ${supplyRisk.delayDays} 天。`,
          affectedOrders: supplyRisk.affectedOrders,
          window: received ? '到货确认后' : committed ? '替代承诺后' : '3 天内',
          evidence: Array.from(new Set([
            supplyRisk.auditId,
            supplyRisk.traceId,
            ...(supplyRisk.receiptAuditId ? [supplyRisk.receiptAuditId] : []),
            ...(supplyRisk.receiptTraceId ? [supplyRisk.receiptTraceId] : []),
            `${supplyRisk.purchaseOrderNumber} / ${supplyRisk.supplierName}`,
          ])),
          resolved: received || committed,
          resolutionNote: received
            ? '替代供应商到货已确认，AI 排产可释放 MAT-B02 供应风险并复核受影响工单。'
            : committed
              ? '替代供应商已锁定，AI 排产需复核最早可执行窗口。'
              : '供应延期已升级，AI 排产需生成替代采购与工序顺延方案。',
        },
        ...productionCloseoutMergedEvents,
      ]
    })()
    : productionCloseoutMergedEvents

  const supplierNetworkMergedEvents = supplierNetworkDecision
    ? [
        {
          id: `evt-supplier-network-${supplierNetworkDecision.materialCode}`,
          type: 'material' as const,
          typeLabel: '供应网络',
          severity: 'warning' as const,
          severityLabel: '已选优',
          title: `${supplierNetworkDecision.materialCode} 供应商绩效与 SLA 选优`,
          impact: `${supplierNetworkDecision.selectedSupplierName} 绩效 ${supplierNetworkDecision.selectedPerformanceScore}、准交 ${supplierNetworkDecision.selectedOnTimeRate}%、报价 ¥${supplierNetworkDecision.selectedQuotedPrice}，已优于原供应商延期 SLA。`,
          affectedOrders: supplierNetworkDecision.affectedOrders,
          window: supplierNetworkDecision.selectedPromiseDate,
          evidence: [
            supplierNetworkDecision.auditId,
            supplierNetworkDecision.traceId,
            `${supplierNetworkDecision.selectedSupplierName} / ${supplierNetworkDecision.selectedCapacityQuantity} 件`,
          ],
          resolved: true,
          resolutionNote: '采购已完成多供应商承诺比较，AI 排产可按选优供应商承诺窗口复核受影响工单。',
        },
        ...supplyMergedEvents,
      ]
    : supplyMergedEvents

  const customerCommitmentMergedEvents = otdKpiCommitment
    ? [
        {
          id: `evt-otd-kpi-commitment-${otdKpiCommitment.sourceKpiId}`,
          type: 'rush' as const,
          typeLabel: '客户承诺包',
          severity: 'warning' as const,
          severityLabel: otdKpiCommitment.statusLabel,
          title: otdKpiCommitment.title,
          impact: `${otdKpiCommitment.commitment} ${otdKpiCommitment.summary}`,
          affectedOrders: `${otdKpiCommitment.dimensionLabel} / ${otdKpiCommitment.targetName}`,
          window: otdKpiCommitment.dueAt,
          evidence: [otdKpiCommitment.auditId, otdKpiCommitment.traceId, ...otdKpiCommitment.actions.map(action => action.evidence)],
          resolved: false,
          resolutionNote: '客户交付恢复承诺已记录，AI 排产需复核承诺口径背后的急单插入、缺料闭环和质量门边界。',
        },
        ...supplierNetworkMergedEvents,
      ]
    : supplierNetworkMergedEvents

  const outsourcingMergedEvents = outsourcingCommitment
    ? (() => {
      const received = Boolean(outsourcingCommitment.receiptTraceId)
      const released = Boolean(outsourcingCommitment.scheduleReleaseTraceId)
      return [
        {
          id: `evt-outsourcing-commitment-${outsourcingCommitment.sourceKpiId}`,
          type: 'material' as const,
          typeLabel: '外协承诺',
          severity: 'warning' as const,
          severityLabel: released ? '已释放' : received ? '已到货' : '待到货',
          title: released
            ? `${outsourcingCommitment.targetName} 外协排产释放已确认`
            : received ? `${outsourcingCommitment.targetName} 外协到货已确认` : `${outsourcingCommitment.targetName} 外协承诺已锁定`,
          impact: released
            ? `${outsourcingCommitment.scheduleReleaseMessage} OTD 证据链已关闭厂外等待口径并保留排产释放审计。`
            : received
            ? `${outsourcingCommitment.receiptMessage} AI 排产可把厂外等待关闭，并复核 ${outsourcingCommitment.affectedOrders} 的释放窗口。`
            : `${outsourcingCommitment.partnerName} 已承诺 ${outsourcingCommitment.promiseDate} 交付 ${outsourcingCommitment.affectedOrders}，但当前仍保留厂外等待口径，不应计为厂内已恢复。`,
          affectedOrders: outsourcingCommitment.affectedOrders,
          window: released ? '排产释放已确认' : received ? '到货确认后' : outsourcingCommitment.promiseDate,
          evidence: Array.from(new Set([
            outsourcingCommitment.auditId,
            outsourcingCommitment.traceId,
            ...(outsourcingCommitment.receiptAuditId ? [outsourcingCommitment.receiptAuditId] : []),
            ...(outsourcingCommitment.receiptTraceId ? [outsourcingCommitment.receiptTraceId] : []),
            ...(outsourcingCommitment.scheduleReleaseAuditId ? [outsourcingCommitment.scheduleReleaseAuditId] : []),
            ...(outsourcingCommitment.scheduleReleaseTraceId ? [outsourcingCommitment.scheduleReleaseTraceId] : []),
            outsourcingCommitment.sourceTraceId,
            outsourcingCommitment.partnerName,
          ])),
          resolved: received || released,
          resolutionNote: released
            ? '厂外等待口径已关闭，AI 排产释放结论和 OTD 复盘证据已归档。'
            : received
            ? '外协到货已确认，AI 排产可关闭厂外等待并复核后续释放窗口。'
            : '外协承诺已记录，AI 排产需保留外部约束并等待到货确认或计划拆分。',
        },
        ...customerCommitmentMergedEvents,
      ]
    })()
    : customerCommitmentMergedEvents

  const engineeringImpactMergedEvents = engineeringImpact
    ? [
        {
          id: `evt-engineering-change-${engineeringImpact.changeId}`,
          type: 'engineering' as const,
          typeLabel: '工程变更影响',
          severity: engineeringImpact.decision === 'rejected' ? 'critical' as const : 'warning' as const,
          severityLabel: engineeringImpact.statusLabel,
          title: engineeringImpact.changeTitle,
          impact: engineeringImpact.decision === 'approved'
            ? `${engineeringImpact.decisionAuditId} 已批准正式释放 ${engineeringImpact.alternateMaterialCode}，${engineeringImpact.inventoryImpact} ${engineeringImpact.qualityImpact}`
            : engineeringImpact.decision === 'rejected'
              ? `${engineeringImpact.decisionAuditId} 已驳回，撤回审批前模拟；${engineeringImpact.affectedOrders} 保持 ${engineeringImpact.sourceMaterialCode} 原物料策略。`
              : `${engineeringImpact.inventoryImpact} ${engineeringImpact.qualityImpact} ${engineeringImpact.otdImpact}`,
          affectedOrders: engineeringImpact.affectedOrders,
          window: engineeringImpact.decision === 'rejected' ? '原物料到货后' : engineeringImpact.scheduleWindow,
          evidence: [
            engineeringImpact.auditId,
            engineeringImpact.traceId,
            engineeringImpact.changeId,
            ...(engineeringImpact.decisionAuditId ? [engineeringImpact.decisionAuditId] : []),
          ],
          resolved: engineeringImpact.decision === 'approved',
          resolutionNote: engineeringImpact.decision === 'approved'
            ? '工程变更已正式批准，AI 排产可把模拟窗口转为正式替代料释放复核。'
            : engineeringImpact.decision === 'rejected'
              ? '工程变更已驳回，AI 排产需撤回模拟并等待采购/原料到货。'
              : '工程变更已完成影响分析，AI 排产只能生成审批前模拟方案，正式释放仍需工程审批。',
        },
        ...outsourcingMergedEvents,
      ]
    : outsourcingMergedEvents

  const routeMergedEvents = routeCapability
    ? [
        {
          id: `evt-route-capability-${routeCapability.routeCode}-${routeCapability.operationCode}`,
          type: 'route' as const,
          typeLabel: '工艺能力',
          severity: routeCapability.decision === 'released' ? 'warning' as const : 'critical' as const,
          severityLabel: routeCapability.decision === 'released' ? '已放行' : '能力缺口',
          title: `${routeCapability.routeCode} ${routeCapability.operationCode} 热处理能力缺口`,
          impact: routeCapability.decision === 'released'
            ? `${routeCapability.candidateEquipment} 已确认，${routeCapability.batchWindow} 可作为分流/合批窗口进入排产复核。`
            : `${routeCapability.bottleneckResource} 存在 ${routeCapability.capacityGapHours}h 缺口，需确认 ${routeCapability.candidateEquipment} 后释放窗口。`,
          affectedOrders: routeCapability.affectedOrders,
          window: routeCapability.batchWindow,
          evidence: [
            routeCapability.auditId,
            routeCapability.traceId,
            `${routeCapability.routeName} ${routeCapability.routeVersion}`,
          ],
          resolved: routeCapability.decision === 'released',
          resolutionNote: routeCapability.decision === 'released'
            ? '工艺分流/合批已确认，AI 排产需复核热处理夜班窗口。'
            : '工艺能力缺口已校验，需工艺/制造确认后才能释放排产。',
        },
        ...engineeringImpactMergedEvents,
      ]
    : engineeringImpactMergedEvents

  const productionAnomalyMergedEvents = productionAnomalyRecords.length
    ? [
        ...productionAnomalyRecords.map(record => ({
          id: `evt-production-anomaly-${record.traceId}`,
          type: 'anomaly' as const,
          typeLabel: '生产异常',
          severity: 'critical' as const,
          severityLabel: record.statusLabel,
          title: record.title,
          impact: record.summary,
          affectedOrders: record.object,
          window: '异常上报后立即复核',
          evidence: [record.traceId, record.sourceTraceId].filter(Boolean) as string[],
          resolved: false,
          resolutionNote: '生产报工异常已写入 OTD 证据链，AI 排产需冻结当前工序并复核承诺交期影响。',
        })),
        ...routeMergedEvents,
      ]
    : routeMergedEvents

  const anomalyMergedEvents = anomalyDispatchRecords.length
    ? [
        ...anomalyDispatchRecords.map(record => ({
          id: `evt-anomaly-dispatch-${record.anomalyId}`,
          type: 'anomaly' as const,
          typeLabel: '异常分流',
          severity: record.type === 'material' ? 'warning' as const : 'critical' as const,
          severityLabel: record.statusLabel,
          title: record.title,
          impact: `${record.summary} ${record.suggestedAction}`,
          affectedOrders: record.affectedOrders,
          window: record.scheduleWindow,
          evidence: [record.auditId, record.traceId, record.route],
          resolved: false,
          resolutionNote: '异常已确认分流，AI 排产需复核受影响窗口并保留 OTD 证据。',
        })),
        ...productionAnomalyMergedEvents,
      ]
    : productionAnomalyMergedEvents

  const assistantMergedEvents = assistantPackages.length
    ? [
        ...assistantPackages.map(record => ({
          id: `evt-assistant-recovery-${record.id}`,
          type: 'rush' as const,
          typeLabel: '助手执行包',
          severity: record.priority,
          severityLabel: record.statusLabel,
          title: record.title,
          impact: record.closureSummary ? `${record.closureSummary} ${record.scheduleAction}` : `${record.summary} ${record.scheduleAction}`,
          affectedOrders: record.workOrders,
          window: record.status === 'closed' ? '执行交接闭环后复核' : record.scheduleWindow,
          evidence: [record.auditCode, record.traceId, record.closureTraceId, ...record.dispatchSteps.map(step => step.evidence)].filter(Boolean) as string[],
          resolved: record.status === 'closed',
          resolutionNote: record.status === 'closed'
            ? '交期恢复执行包已确认交接闭环，AI 排产需复核恢复窗口是否维持 OTD 改善。'
            : 'AI 生产助手已生成跨模块动作包，调度员需复核建议并采纳或调整。',
        })),
        ...anomalyMergedEvents,
      ]
    : anomalyMergedEvents

  const assistantEngineeringMergedEvents = assistantEngineeringPackages.length
    ? [
        ...assistantEngineeringPackages.map(record => ({
          id: `evt-assistant-engineering-${record.id}`,
          type: 'engineering' as const,
          typeLabel: '助手工程约束',
          severity: record.priority,
          severityLabel: record.statusLabel,
          title: record.title,
          impact: `${record.summary} ${record.otdImpact}`,
          affectedOrders: record.workOrders,
          window: record.dueAt,
          evidence: [record.auditCode, record.traceId, record.ecnCode, record.routeCode, ...record.dispatchSteps.map(step => step.evidence)],
          resolved: false,
          resolutionNote: 'AI 生产助手已生成工程约束复核包，调度员需等待 BOM、工艺路线、质量门和工程审批回写后释放正式排产。',
        })),
        ...assistantMergedEvents,
      ]
    : assistantMergedEvents

  const monitoringMergedEvents = monitoringSituationEscalations.length
    ? [
        ...monitoringSituationEscalations.map(record => ({
          id: `evt-monitoring-situation-${record.sourceEventId}`,
          type: 'monitoring' as const,
          typeLabel: '现场处置包',
          severity: record.priority,
          severityLabel: record.statusLabel,
          title: record.title,
          impact: record.status === 'closed'
            ? `${record.summary} 闭环留痕：${record.closureTrace ?? record.traceId}`
            : `${record.summary} ${record.scheduleAction}`,
          affectedOrders: record.workOrders,
          window: record.status === 'closed' ? '风险关闭后复核' : record.scheduleWindow,
          evidence: [record.auditId, record.traceId],
          resolved: record.status === 'closed',
          resolutionNote: record.status === 'closed'
            ? '风险队列已关闭现场处置包，AI 排产需复核已采用的 CNC 分流和急单窗口是否维持 OTD 改善。'
            : '实时监控已升级现场态势，AI 排产需生成锁定期后重排建议并同步反馈。',
        })),
        ...assistantEngineeringMergedEvents,
      ]
    : assistantEngineeringMergedEvents

  const pilotMergedEvents = pocPilotRun
    ? [
        {
          id: `evt-poc-pilot-${pocPilotRun.batchId}`,
          type: 'pilot' as const,
          typeLabel: 'POC 试点运行',
          severity: 'warning' as const,
          severityLabel: pocPilotRun.statusLabel,
          title: `${pocPilotRun.batchId} 首批真实工单复核`,
          impact: `${pocPilotRun.summary} 样本 ${pocPilotRun.sampleSize} 单，OTD ${pocPilotRun.actualOtd}，需在上线验收前复核排产窗口和执行回写是否仍满足客户承诺。`,
          affectedOrders: pocPilotRun.workOrders.map(order => order.workOrderNumber).join(' / '),
          window: pocPilotRun.runWindow,
          evidence: [pocPilotRun.auditId, pocPilotRun.traceId, ...pocPilotRun.checkpoints.map(checkpoint => checkpoint.evidence)],
          resolved: true,
          resolutionNote: 'POC 首批真实工单已闭环，AI 排产保留复核事件用于上线验收前窗口核对。',
        },
        ...monitoringMergedEvents,
      ]
    : monitoringMergedEvents

  const riskSlaMergedEvents = riskSlaReview
    ? (() => {
      const closed = riskSlaReview.status === 'closed'
      return [
        {
          id: `evt-risk-sla-${riskSlaReview.id}`,
          type: 'risk' as const,
          typeLabel: '风险 SLA 复核',
          severity: closed ? 'warning' as const : 'critical' as const,
          severityLabel: riskSlaReview.statusLabel,
          title: riskSlaReview.title,
          impact: closed
            ? `${riskSlaReview.closureSummary ?? riskSlaReview.summary} ${riskSlaReview.otdImpact}。`
            : `${riskSlaReview.summary} 逾期 ${riskSlaReview.overdueCount} 项，关键风险 ${riskSlaReview.criticalCount} 项；${riskSlaReview.otdImpact}。`,
          affectedOrders: riskSlaReview.affectedOrders,
          window: closed ? '晨会闭环后复核' : riskSlaReview.reviewMeetingId,
          evidence: [
            riskSlaReview.auditId,
            riskSlaReview.traceId,
            ...(riskSlaReview.closureAuditId ? [riskSlaReview.closureAuditId] : []),
            ...(riskSlaReview.closureTraceId ? [riskSlaReview.closureTraceId] : []),
            ...riskSlaReview.actions.map(action => action.evidence),
          ],
          resolved: closed,
          resolutionNote: closed
            ? '风险 SLA 晨会责任动作已闭环，AI 排产需复核承诺窗口是否保持 OTD 恢复。'
            : '风险 SLA 已升级晨会复核，AI 排产需按复核结论保护受影响工单并等待责任动作回写。',
        },
        ...pilotMergedEvents,
      ]
    })()
    : pilotMergedEvents

  if (!resolution) return riskSlaMergedEvents

  return riskSlaMergedEvents.map(event => {
    if (event.type !== 'material') return event
    if (!matchesShortageMaterial(resolution.materialCode, event.title)) return event

    return {
      ...event,
      severity: 'warning',
      severityLabel: '风险下降',
      impact: `${resolution.materialName} 已由 ${resolution.sourceOrderNumber} 加急收货 ${resolution.receivedQuantity}${resolution.unit}，缺料约束降为可执行复核。`,
      resolved: true,
      resolutionNote: `采购收货已回写风险：${resolution.affectedOrders} 缺口清零。`,
    }
  })
}

function readBarcodeScheduleReleaseRecord() {
  return readOtdEvidenceChainRecords().find(record =>
    record.traceId === 'TRACE-QR-WO-RUSH-9001-OP-10-SCHEDULE-RELEASE'
    && record.stage === '排产回写'
  ) ?? null
}

function applyEngineeringChangeApprovals() {
  const approval = readAlternateMaterialApproval()
  alternateMaterialApproval.value = approval
  const impact = readEngineeringChangeImpactAnalysis()
  engineeringChangeImpact.value = impact
  const bomKittingPackage = readBomKittingPackage()

  if (bomKittingPackage && !impact) {
    const shortageItem = bomKittingPackage.items.find(item => item.shortageQuantity > 0)
    engineeringConstraints.value = engineeringConstraints.value.map(constraint => constraint.id === 'eng-bom-al6061'
      ? {
          ...constraint,
          title: `${bomKittingPackage.bomCode} 已展开为工单齐套包`,
          explanation: `${bomKittingPackage.auditId}：${bomKittingPackage.summary}`,
          evidence: [bomKittingPackage.auditId, bomKittingPackage.traceId],
          affectedOrders: `${bomKittingPackage.workOrderNumber}${shortageItem ? ` / ${shortageItem.materialCode} 缺 ${shortageItem.shortageQuantity}${shortageItem.unit}` : ''}`,
          agentUsage: '用于 BOM 展开齐套事件',
        }
      : constraint
    )
    engineeringConstraintTrace.value = {
      summary: 'BOM 展开齐套、设备、质量、人员 4 类约束已进入 Agent 推荐',
      detail: `${bomKittingPackage.traceId} 已把 ${bomKittingPackage.bomCode} ${bomKittingPackage.bomVersion} 展开结果同步到库存齐套和排产事件队列；当前急单建议同时引用 R-A100 CNC 能力、OP-040 质检窗口和人员资质。`,
    }
  }

  if (impact) {
    const decisionText = impact.decision === 'approved'
      ? `${impact.decisionAuditId} 已批准，正式释放 ${impact.alternateMaterialCode} 替代 ${impact.sourceMaterialCode}。`
      : impact.decision === 'rejected'
        ? `${impact.decisionAuditId} 已驳回，撤回审批前模拟并保持 ${impact.sourceMaterialCode} 原物料策略。`
        : `${impact.auditId} 已比较库存、质量、供应、成本和 OTD：${impact.otdImpact}；${impact.recommendedDecision}`
    engineeringConstraints.value = engineeringConstraints.value.map(constraint => constraint.id === 'eng-bom-al6061'
      ? {
          ...constraint,
          title: impact.decision === 'approved'
            ? `${impact.changeId} 已批准正式释放`
            : impact.decision === 'rejected'
              ? `${impact.changeId} 已驳回`
              : `${impact.changeId} 已完成替代料影响分析`,
          explanation: decisionText,
          evidence: [impact.auditId, impact.traceId, impact.changeId, ...(impact.decisionAuditId ? [impact.decisionAuditId] : [])],
          affectedOrders: impact.affectedOrders,
          agentUsage: impact.decision === 'approved'
            ? '用于正式替代料释放'
            : impact.decision === 'rejected'
              ? '用于撤回模拟并保持原策略'
              : '用于工程变更审批前模拟',
        }
      : constraint
    )
    engineeringConstraintTrace.value = {
      summary: impact.decision === 'approved'
        ? '工程变更已批准，替代料释放进入 Agent 推荐'
        : impact.decision === 'rejected'
          ? '工程变更已驳回，Agent 保持原物料策略'
          : '工程变更、设备、质量、人员 4 类约束已进入 Agent 推荐',
      detail: impact.decision === 'approved'
        ? `${impact.decisionAuditId} 已批准 ${impact.changeId}；当前急单可把审批前模拟转为正式替代料释放，同时保留质量门、批次追溯、R-A100 CNC 能力和人员资质。`
        : impact.decision === 'rejected'
          ? `${impact.decisionAuditId} 已驳回 ${impact.changeId}；当前急单撤回替代料模拟，继续等待 ${impact.sourceMaterialCode} 采购/原料到货并保留延期风险。`
          : `${impact.auditId} 已生成 ${impact.changeId} 影响分析；当前急单建议同时引用库存影响、质量门、供应批次、成本影响、R-A100 CNC 能力和人员资质。`,
    }
    return
  }

  if (approval) {
    engineeringConstraints.value = engineeringConstraints.value.map(constraint => constraint.id === 'eng-bom-al6061'
      ? {
          ...constraint,
          title: `${approval.alternateMaterialCode} 已工程确认，可替代 ${approval.sourceMaterialCode}`,
          explanation: `${approval.auditId} 已确认 ${approval.alternateMaterialCode} 可替代 ${approval.sourceMaterialCode}，${approval.affectedOrders} 的缺料约束从高风险冻结降为可执行复核。`,
          evidence: [approval.auditId, approval.traceId],
          affectedOrders: approval.affectedOrders,
          agentUsage: '用于释放缺料冻结',
        }
      : constraint
    )
    engineeringConstraintTrace.value = {
      summary: '替代料、设备、质量、人员 4 类约束已进入 Agent 推荐',
      detail: `${approval.auditId} 已放行 ${approval.alternateMaterialCode} 替代 ${approval.sourceMaterialCode}；当前急单建议同时引用 R-A100 CNC 能力要求、OP-040 质检窗口、EMP-001 / EMP-003 技能矩阵与资质有效期。`,
    }
  }
}

function applyRouteCapabilityValidation() {
  const validation = readRouteCapabilityValidation()
  routeCapabilityValidation.value = validation
  if (!validation) return

  engineeringConstraints.value = engineeringConstraints.value.map(constraint => constraint.id === 'eng-route-cnc'
    ? {
        ...constraint,
        id: 'eng-route-heat-treatment-capacity',
        sourceCode: `${validation.routeCode} ${validation.operationCode}`,
        title: validation.decision === 'released'
          ? `${validation.operationCode} ${validation.operationName}分流/合批已确认`
          : `${validation.operationCode} ${validation.operationName}能力缺口已校验`,
        explanation: `${validation.auditId}：${validation.summary}`,
        evidence: [validation.auditId, validation.traceId, validation.candidateEquipment],
        affectedOrders: validation.affectedOrders,
        agentUsage: validation.decision === 'released' ? '用于热处理夜班窗口复核' : '用于阻断热处理能力超排',
      }
    : constraint
  )
  engineeringConstraintTrace.value = {
    summary: validation.decision === 'released'
      ? '工艺分流、替代料、质量、人员 4 类约束已进入 Agent 推荐'
      : '工艺能力缺口、替代料、质量、人员 4 类约束已进入 Agent 推荐',
    detail: `${engineeringConstraintTrace.value.detail}；${validation.auditId} 已把 ${validation.routeCode} ${validation.operationCode} ${validation.operationName} 的 ${validation.capacityGapHours}h 能力缺口转为${validation.decision === 'released' ? '分流/合批复核' : '待确认能力阻断'}。`,
  }
}

function applyLaborReassignmentClosure() {
  const reassignment = readLaborReassignment()
  laborReassignment.value = reassignment
  if (!reassignment) return

  engineeringConstraints.value = engineeringConstraints.value.map(constraint => constraint.id === 'eng-labor-cnc'
    ? {
        ...constraint,
        title: `${reassignment.blockedEmployeeNumber} 资质临期已生成 ${reassignment.replacementEmployeeNumber} 替班复核`,
        explanation: `${reassignment.auditId} 已将 ${reassignment.blockedEmployeeName} 的 ${reassignment.blockedCertification} 临期风险转为 ${reassignment.replacementEmployeeName} 接管 ${reassignment.operationName} 开工复核，${reassignment.reviewerName} 保留工程放行。`,
        evidence: [reassignment.auditId, reassignment.traceId],
        affectedOrders: `${reassignment.workOrderNumber} ${reassignment.operationName}`,
        agentUsage: '用于替班后开工校验',
      }
    : constraint
  )
  engineeringConstraintTrace.value = {
    summary: '替代料、设备、质量、人员替班 4 类约束已进入 Agent 推荐',
    detail: `${engineeringConstraintTrace.value.detail}；${reassignment.auditId} 已把 ${reassignment.blockedEmployeeNumber} 临期风险转为 ${reassignment.replacementEmployeeNumber} 替班复核，生产开工可直接读取该证据。`,
  }
}

function applyLaborQualificationBlockClosure() {
  const block = readLaborQualificationBlock()
  laborQualificationBlock.value = block
  if (!block) return
  const isReviewing = block.status === 'reviewing'

  engineeringConstraints.value = engineeringConstraints.value.map(constraint => constraint.id === 'eng-labor-cnc'
    ? {
        ...constraint,
        title: isReviewing
          ? `${block.blockedEmployeeNumber} 停工复核主管已受理`
          : `${block.blockedEmployeeNumber} 资质临期且无有效替班候选`,
        explanation: isReviewing
          ? `${block.auditId} 已由 ${block.reviewerName} 主管受理：${block.blockedEmployeeName} 的 ${block.blockedCertification} 临期且无有效替班候选，补证/改派完成前仍需冻结开工。`
          : `${block.auditId} 已阻断 ${block.workOrderNumber} ${block.operationName}：${block.blockedEmployeeName} 的 ${block.blockedCertification} 临期，系统按技能、班组/班次、证书有效期和复核授权评分后未找到有效替班候选，必须停工复核。`,
        evidence: isReviewing ? [block.auditId, `${block.traceId}-REVIEW`] : [block.auditId, block.traceId],
        affectedOrders: `${block.workOrderNumber} ${block.operationName}`,
        agentUsage: isReviewing ? '用于等待补证/改派后重新放行' : '用于阻断开工并触发主管复核',
      }
    : constraint
  )
  engineeringConstraintTrace.value = {
    summary: '替代料、设备、质量、人员阻断 4 类约束已进入 Agent 推荐',
    detail: `${engineeringConstraintTrace.value.detail}；${block.auditId} 已把 ${block.blockedEmployeeNumber} 临期且不可替班风险转为${isReviewing ? '主管复核中' : '停工复核'}，生产开工必须读取阻断证据。`,
  }
}

function applyLaborReassignmentToEvents(events: ScheduleEventItem[]): ScheduleEventItem[] {
  const reassignment = laborReassignment.value ?? readLaborReassignment()
  if (!reassignment) return events
  if (events.some(event => event.id === `evt-labor-${reassignment.id}`)) return events

  return [
    ...events,
    {
      id: `evt-labor-${reassignment.id}`,
      type: 'labor',
      typeLabel: '人员替班事件',
      severity: 'warning',
      severityLabel: '已闭环',
      title: `${reassignment.workOrderNumber} 热处理替班已确认`,
      impact: `${reassignment.blockedEmployeeNumber} ${reassignment.blockedEmployeeName} 资质临期，已由 ${reassignment.replacementEmployeeNumber} ${reassignment.replacementEmployeeName} 接管 ${reassignment.operationName} 开工复核。`,
      affectedOrders: `${reassignment.workOrderNumber} ${reassignment.operationName}`,
      window: '开工前',
      evidence: [reassignment.auditId, reassignment.traceId],
      resolved: true,
      resolutionNote: '人员约束已由替班建议转为开工校验，可同步回写 OTD 复盘。',
    },
  ]
}

function applyLaborQualificationBlockToEvents(events: ScheduleEventItem[]): ScheduleEventItem[] {
  const block = laborQualificationBlock.value ?? readLaborQualificationBlock()
  if (!block) return events
  const isReviewing = block.status === 'reviewing'
  const filteredEvents = events.filter(event =>
    !(event.type === 'labor' && event.affectedOrders.includes(block.workOrderNumber))
  )
  if (filteredEvents.some(event => event.id === `evt-labor-block-${block.id}`)) return filteredEvents

  return [
    ...filteredEvents,
    {
      id: `evt-labor-block-${block.id}`,
      type: 'labor',
      typeLabel: '人员资质阻断事件',
      severity: 'critical',
      severityLabel: isReviewing ? '主管复核中' : '停工复核',
      title: isReviewing
        ? `${block.workOrderNumber} 热处理停工复核主管已受理`
        : `${block.workOrderNumber} 热处理无有效替班候选`,
      impact: isReviewing
        ? `${block.reviewerName} 已受理 ${block.blockedEmployeeNumber} ${block.blockedEmployeeName} 的 ${block.blockedCertification} 临期阻断，等待补证/改派后重新放行，热处理开工仍保持冻结。`
        : `${block.blockedEmployeeNumber} ${block.blockedEmployeeName} 的 ${block.blockedCertification} 临期，系统未找到满足 ${block.requiredSkill}、证书有效期、班组/班次或复核授权的候选人，热处理开工必须冻结。`,
      affectedOrders: `${block.workOrderNumber} ${block.operationName}`,
      window: '开工前',
      evidence: isReviewing ? [block.auditId, `${block.traceId}-REVIEW`] : [block.auditId, block.traceId],
      resolved: false,
      resolutionNote: isReviewing ? '主管已受理，但补证/改派未闭环，生产开工仍不得放行。' : '人员约束未闭环，需主管复核或补充有效资质人员后才能释放开工。',
    },
  ]
}

function mapRiskDashboardToScheduleEvents(riskDashboard: RiskDashboardDto): ScheduleEventItem[] {
  const events: ScheduleEventItem[] = []
  const materialRisk = riskDashboard.materialRisks.find(item => item.level !== 'healthy')
  const equipmentRisk = riskDashboard.equipmentRisks.find(item => item.level !== 'healthy')
  const orderRisk = riskDashboard.orderRisks.find(item => item.level !== 'healthy')

  if (materialRisk) {
    events.push({
      id: `evt-material-${materialRisk.materialCode}`,
      type: 'material',
      typeLabel: '缺料事件',
      severity: materialRisk.level === 'critical' ? 'critical' : 'warning',
      severityLabel: materialRisk.level === 'critical' ? '高风险' : '中风险',
      title: `${materialRisk.materialCode} 齐套缺口`,
      impact: `${materialRisk.materialName} 可用 ${materialRisk.available}/${materialRisk.required}，${materialRisk.riskDetail}`,
      affectedOrders: materialRisk.affectedOrders,
      window: '按排产窗口',
    })
  }

  if (equipmentRisk) {
    events.push({
      id: `evt-equipment-${equipmentRisk.id}`,
      type: 'equipment',
      typeLabel: '设备故障事件',
      severity: equipmentRisk.level === 'critical' ? 'critical' : 'warning',
      severityLabel: equipmentRisk.level === 'critical' ? '高风险' : '中风险',
      title: `${equipmentRisk.equipmentName} 健康下降`,
      impact: `健康 ${equipmentRisk.healthScore} 分，${equipmentRisk.riskDetail}`,
      affectedOrders: `${equipmentRisk.daysSinceMaintenance} 天未维护`,
      window: '维护窗口',
    })
  }

  if (orderRisk) {
    events.push({
      id: `evt-rush-${orderRisk.orderNumber}`,
      type: 'rush',
      typeLabel: '急单插单事件',
      severity: orderRisk.level === 'critical' ? 'critical' : 'warning',
      severityLabel: orderRisk.level === 'critical' ? '高风险' : '中风险',
      title: `${orderRisk.orderNumber} 客户插单`,
      impact: `${orderRisk.productName} ${orderRisk.gapText}，${orderRisk.riskDetail}`,
      affectedOrders: '影响 1 单',
      window: orderRisk.dueDate,
    })
  }

  return events.length ? events.slice(0, 3) : [...demoScheduleEvents]
}

function addHours(date: Date, hours: number): Date {
  return new Date(date.getTime() + hours * 60 * 60 * 1000)
}

function handleExportCsv() {
  const headers = ['工单号', '产品', '设备', '开始时间', '结束时间', '状态', '进度']
  const rows = ganttData.value.tasks.map(t => [
    t.text || '',
    '',
    '',
    typeof t.start_date === 'string' ? t.start_date.slice(0, 16) : t.start_date?.toISOString().slice(0, 16) || '',
    typeof t.end_date === 'string' ? t.end_date.slice(0, 16) : t.end_date?.toISOString().slice(0, 16) || '',
    '',
    String(Math.round((t.progress || 0) * 100)) + '%',
  ])
  downloadCsv(csvFilename('排产计划'), headers, rows)
}

async function handleOptimize() {
  loading.value = true
  loadingMessage.value = `排产优化中（目标: ${currentObjective.value}）...`

  try {
    const result = await api.optimizeSchedule({
      workshopId: 'workshop-1',
      optimizationObjective: currentObjective.value,
    })

    if (result.plan) {
      planData.value = result.plan
      planName.value = result.plan.planName
      metrics.utilization = Math.round(result.plan.overallUtilizationRate * 100)
      metrics.onTimeDelivery = Math.round(result.plan.onTimeDeliveryRate * 100)
      metrics.changeoverMinutes = result.plan.totalChangeoverMinutes ?? metrics.changeoverMinutes
      metrics.groupCount = result.plan.groupCount ?? metrics.groupCount
      applyImpactComparison(result.plan)
      ganttData.value = planToGanttData(result.plan, equipmentList.value, bottleneckIds.value)
      warnings.value = result.warnings ?? result.plan.warnings ?? []
    }
  } catch (e: any) {
    console.error('排产优化失败:', e)
    error.value = `优化失败: ${e?.response?.data?.message || e?.message || '未知错误'}`
  } finally {
    loading.value = false
  }
}

async function handleTaskClick(taskId: string) {
  const task = ganttData.value.tasks.find((t) => t.id === taskId)
  if (!task?.workOrderId) return

  openDemoTaskExplanation(task)

  try {
    const order = await api.getWorkOrderById(task.workOrderId)
    selectedOrder.value = order
  } catch {
    selectedOrder.value = buildDemoWorkOrder(task)
    detailError.value = ''
  } finally {
    detailLoading.value = false
  }
}

function openDemoTaskExplanation(task: GanttTask) {
  if (!task.workOrderId) return

  detailVisible.value = true
  detailLoading.value = false
  detailError.value = ''
  selectedTaskExplanation.value = buildTaskExplanation(task)
  selectedOrder.value = buildDemoWorkOrder(task)
}

function handleTaskDblClick(taskId: string) {
  handleTaskClick(taskId)
}

function buildTaskExplanation(task: GanttTask): ScheduleTaskExplanation {
  const taskStart = typeof task.start_date === 'string' ? task.start_date : task.start_date.toISOString()
  const dependentLinks = planData.value?.items.find(item => item.id === task.id)?.dependentItems ?? []
  const dependencyText = dependentLinks.length ? `${dependentLinks.length} 个前置工序已串联` : '首道工序或前置已满足'
  const materialText = task.text.includes('RUSH') || task.text.includes('1002') ? 'M-AL-6061 缺口需复核' : '关键物料未阻塞'
  const bottleneckText = task.isOnBottleneck ? '命中瓶颈设备' : '未命中瓶颈设备'

  return {
    workOrderNumber: task.text,
    reason: `${task.text} 被放入 ${task.equipmentName || task.equipmentId || '当前设备'} 的可用窗口，优先满足交期、前置工序和锁定期保护。`,
    risk: task.isOnBottleneck
      ? '当前任务命中瓶颈资源，若插单或返工挤占该窗口，OTD 风险会上升。'
      : '当前任务未命中主要瓶颈，但仍需监控物料齐套和后续质量检验窗口。',
    alternative: task.isOnBottleneck
      ? '可选方案是换到 CNC-002 / CNC-003 或安排夜班加班，但必须记录人工调整原因。'
      : '可选方案是在锁定期后局部前移，或让低优先级工单延后释放设备窗口。',
    items: [
      {
        label: '交期',
        value: taskStart.slice(0, 16).replace('T', ' '),
        detail: '按承诺交期和当前序号倒排，保护临近交付任务。',
      },
      {
        label: '设备',
        value: task.equipmentName || task.equipmentId || '-',
        detail: task.isOnBottleneck ? '该设备是当前瓶颈资源，Agent 优先保护连续加工窗口。' : '当前设备满足工艺能力要求。',
      },
      {
        label: '前置工序',
        value: dependencyText,
        detail: 'Agent 不会跳过前后工序依赖，避免只按时间空档机械插单。',
      },
      {
        label: '缺料',
        value: materialText,
        detail: '结合 BOM-A100 替代料规则和库存齐套状态判断是否可执行。',
      },
      {
        label: '瓶颈',
        value: bottleneckText,
        detail: '瓶颈命中会进入 OTD 影响和换线成本解释。',
      },
    ],
  }
}

function buildDemoWorkOrder(task: GanttTask): WorkOrderDto {
  const now = new Date().toISOString()
  const start = typeof task.start_date === 'string' ? new Date(task.start_date) : task.start_date
  const plannedEnd = task.end_date
    ? typeof task.end_date === 'string'
      ? new Date(task.end_date)
      : task.end_date
    : addHours(start, Math.max(1, Math.round(task.duration * 24)))

  return {
    id: task.workOrderId || String(task.id),
    orderNumber: task.text,
    productCode: task.text.includes('RUSH') ? 'FG-A100-RUSH' : 'FG-A100',
    productName: task.text.includes('RUSH') ? '急单轴承组件' : '演示轴承组件',
    plannedQuantity: task.text.includes('RUSH') ? 30 : 120,
    completedQuantity: 0,
    plannedStartDate: start.toISOString(),
    plannedEndDate: plannedEnd.toISOString(),
    status: task.status || 'scheduled',
    workshopId: 'workshop-1',
    routeCode: task.equipmentName || task.equipmentId,
    priority: task.text.includes('RUSH') ? 1 : 3,
    progressPercentage: Math.round((task.progress || 0) * 100),
    createdAt: now,
    updatedAt: now,
  }
}

function handleTaskDragEnd(taskId: string, newStart: Date, newEnd: Date) {
  const task = ganttData.value.tasks.find(t => t.id === taskId)
  if (!task || !planData.value?.id) return

  // 调用 API 持久化
  api.rescheduleItem(
    planData.value.id,
    taskId,
    newStart.toISOString(),
    newEnd.toISOString()
  ).then(() => {
    // 更新本地数据
    task.start_date = newStart
    task.duration = (newEnd.getTime() - newStart.getTime()) / (1000 * 60 * 60 * 24)
    error.value = ''
  }).catch((e: any) => {
    console.error('重排保存失败:', e)
    error.value = `保存失败: ${e?.response?.data?.message || e?.message || '未知错误'}`
    // 重新加载以恢复原始状态
    loadData()
  })
}

function markConflicts(items: ScheduleItemDto[]) {
  const conflicts = detectConflicts(items)
  if (conflicts.size > 0) {
    ganttData.value.tasks = ganttData.value.tasks.map(t => {
      if (conflicts.has(t.id)) {
        return { ...t, hasConflict: true, conflictMessage: conflicts.get(t.id) }
      }
      return t
    })
    error.value = '' // 冲突不是错误，不显示红色横幅
  }
}

function applyImpactComparison(plan: SchedulePlanDto) {
  const agentOtd = Math.round(plan.onTimeDeliveryRate * 100)
  const agentUtilization = Math.round(plan.overallUtilizationRate * 100)
  const itemCount = Math.max(plan.items.length, 1)
  const baselineOtd = clamp(agentOtd - 14, 50, 95)
  const baselineDelayedOrders = Math.max(1, Math.ceil(itemCount * (100 - baselineOtd) / 100))
  const agentDelayedOrders = Math.max(0, Math.floor(itemCount * (100 - agentOtd) / 100))

  impactComparison.baseline.otd = baselineOtd
  impactComparison.baseline.delayedOrders = baselineDelayedOrders
  impactComparison.agent.otd = agentOtd
  impactComparison.agent.delayedOrders = agentDelayedOrders
  impactComparison.otdImprovement = Math.max(0, agentOtd - baselineOtd)
  impactComparison.delayedOrdersReduced = Math.max(0, baselineDelayedOrders - agentDelayedOrders)
  impactComparison.changeoverDeltaMinutes = -Math.max(15, Math.round((plan.totalChangeoverMinutes ?? 90) * 0.22))
  impactComparison.utilizationDelta = Math.max(3, Math.round(agentUtilization * 0.08))
  impactComparison.reasons = [
    '优先保护临近交期工单',
    '瓶颈设备批次合并',
    '前后工序依赖保持连续',
    '锁定期内任务不直接改动',
  ]
  applyRushOrderImpact(plan)
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

function applyRushOrderImpact(plan: SchedulePlanDto) {
  const orderedItems = [...plan.items].sort((a, b) => a.sequence - b.sequence)
  const affectedOrders = orderedItems
    .slice(-2)
    .map(item => item.workOrderNumber)
    .filter((value, index, arr) => arr.indexOf(value) === index)

  rushOrderImpact.orderNumber = 'WO-RUSH-9001'
  rushOrderImpact.affectedOrders = affectedOrders.length ? affectedOrders : ['WO-DEMO-1001', 'WO-DEMO-1002']
  rushOrderImpact.delayHours = Math.max(4, Math.round((plan.totalChangeoverMinutes ?? 90) / 12))
  rushOrderImpact.changeoverIncreaseMinutes = Math.max(20, Math.round((plan.totalChangeoverMinutes ?? 90) * 0.32))
  rushOrderImpact.materialShortage = 'M-AL-6061 缺 12 件'
  rushOrderImpact.materialAction = '建议采购加急或启用替代料 M-AL-6061B'
  rushOrderImpact.bottleneckEquipment = 'CNC 加工中心 01'
  rushOrderImpact.recommendation = '建议加班插入'
  rushOrderImpact.options = [
    {
      name: '强插',
      result: `延期 +${rushOrderImpact.delayHours + 3}h`,
      recommended: false,
    },
    {
      name: '加班',
      result: `延期 +${rushOrderImpact.delayHours}h`,
      recommended: true,
    },
    {
      name: '换设备',
      result: `换线 +${rushOrderImpact.changeoverIncreaseMinutes + 15}min`,
      recommended: false,
    },
  ]
}

function objectiveLabel(objective: string): string {
  const labels: Record<string, string> = {
    due_date: '交期优先',
    utilization: '利用率优先',
    changeover: '换线成本优先',
    balanced: '综合平衡',
  }
  return labels[objective] ?? objective
}

async function handleScheduleDecision(payload: ScheduleFeedbackPayload) {
  const decisionLabel = payload.decision === 'accepted' ? '已采纳 Agent 推荐' : '已拒绝 Agent 推荐'
  const detail = payload.reasonDetail || `${payload.categoryLabel}，调度员未补充说明`

  const feedbackRecord: ScheduleFeedbackRecord = {
    decision: payload.decision,
    decisionLabel,
    reasonCategory: payload.reasonCategory,
    categoryLabel: payload.categoryLabel,
    reasonDetail: detail,
    objectiveLabel: objectiveLabel(currentObjective.value),
    createdAt: new Date().toLocaleString('zh-CN', { hour12: false }),
  }
  latestFeedback.value = feedbackRecord
  writeScheduleFeedbackSnapshot({
    ...feedbackRecord,
    traceId: `TRACE-SCH-FEEDBACK-${rushOrderImpact.orderNumber || 'DEMO'}`,
  })
  feedbackSyncNote.value = '反馈已写入本地复盘记录，正在同步后台。'

  if (!planData.value?.id) {
    feedbackSyncNote.value = '反馈已写入本地复盘记录；当前排产计划缺少 ID，暂未同步后台。'
    return
  }

  feedbackSubmitting.value = true
  try {
    await api.submitAdoptionFeedback({
      schedulePlanId: planData.value.id,
      workshopId: 'workshop-1',
      optimizationObjective: currentObjective.value,
      reasonCategory: `${payload.decision}_${payload.reasonCategory}`,
      reasonDetail: detail,
      movedOrderIds: rushOrderImpact.affectedOrders,
      aiTraceId: `rush-impact-${rushOrderImpact.orderNumber || 'demo'}`,
    })
    feedbackSyncNote.value = '反馈已同步后台，可用于后续审计与模型复盘。'
  } catch (e: any) {
    console.warn('排产反馈同步失败:', e)
    feedbackSyncNote.value = '后台反馈接口不可用，当前先保留本地复盘记录用于演示。'
  } finally {
    feedbackSubmitting.value = false
  }
}

function generateAgentSuggestion(event: ScheduleEventItem) {
  const riskSlaReview = readRiskSlaReviewRecord()
  if (riskSlaReview && event.id === `evt-risk-sla-${riskSlaReview.id}`) {
    const closed = riskSlaReview.status === 'closed'
    activeAgentSuggestion.value = {
      eventId: event.id,
      title: closed ? '风险 SLA 闭环后的排产复核建议' : '风险 SLA 晨会复核后的排产保护建议',
      action: closed
        ? `${riskSlaReview.closureTraceId ?? riskSlaReview.traceId} 已确认责任动作闭环：建议复核 WO-2026-0042 与 WO-RUSH-9001 的承诺窗口是否仍按 CNC-003 分流、夜班加班、AL-6061 承诺和 CNC-001 维护窗口执行；闭环结果 ${riskSlaReview.actions.map(action => `${action.module}-${action.result ?? action.evidence}`).join(' / ')}。`
        : `${riskSlaReview.traceId} 已升级 ${riskSlaReview.reviewMeetingId}：建议锁定 WO-2026-0042 与 WO-RUSH-9001 承诺窗口，先释放 CNC-003 分流与夜班加班方案，同时等待采购主管回写 AL-6061 承诺、设备主管确认 CNC-001 维护窗口；治理动作 ${riskSlaReview.actions.map(action => `${action.module}-${action.owner}`).join(' / ')}。`,
      otdImpact: closed ? '+6% 已锁定' : '+6%',
      delayImpact: closed ? '-2 单延期风险已转复盘' : '-2 单延期风险',
      changeoverImpact: closed ? '+14min 已纳入复盘' : '+14min 可控',
    }
    return
  }
  const qualityMrbDisposition = readQualityMrbDispositionRecord()
  if (qualityMrbDisposition && event.id === `evt-quality-mrb-${qualityMrbDisposition.id}`) {
    const closed = qualityMrbDisposition.status === 'closed'
    activeAgentSuggestion.value = {
      eventId: event.id,
      title: closed ? 'MRB 处置闭环后的排产复核建议' : 'MRB 报废补料后的排产保护建议',
      action: closed
        ? `${qualityMrbDisposition.closureTraceId ?? qualityMrbDisposition.traceId} 已确认 ${qualityMrbDisposition.workOrderId} MRB 处置闭环，建议复核补料 ETA、原装配窗口冻结和终检复验窗口是否按 ${qualityMrbDisposition.actions.map(action => `${action.module}-${action.result ?? action.evidence}`).join(' / ')} 执行。`
        : `${qualityMrbDisposition.scheduleTraceId}：建议冻结 ${qualityMrbDisposition.workOrderId} 原装配窗口，插入 ${qualityMrbDisposition.materialBatchCode} 补料 ETA，重建装配/复检窗口，并把客户交付说明绑定到 OTD 复盘；责任动作 ${qualityMrbDisposition.actions.map(action => `${action.module}-${action.owner}`).join(' / ')}。`,
      otdImpact: closed ? '+4% 已锁定' : '-6% 待恢复',
      delayImpact: closed ? '+2 单风险已转复盘' : '+2 单风险',
      changeoverImpact: closed ? '+8min 已纳入复盘' : '+8min',
    }
    return
  }
  const monitoringSituation = readMonitoringSituationEscalations().find(record => event.id === `evt-monitoring-situation-${record.sourceEventId}`)
  if (monitoringSituation) {
    const closed = monitoringSituation.status === 'closed'
    activeAgentSuggestion.value = {
      eventId: event.id,
      title: closed ? `${monitoringSituation.title}闭环复核建议` : `${monitoringSituation.title}排产建议`,
      action: closed
        ? `${monitoringSituation.traceId} 已由风险队列关闭，建议复核 ${monitoringSituation.workOrders} 的 CNC 分流、缺料复核和返工窗口是否仍满足承诺；关闭留痕：${monitoringSituation.closureTrace ?? '已进入 OTD 复盘'}。`
        : `${monitoringSituation.traceId}：${monitoringSituation.scheduleAction} 关联证据：${monitoringSituation.evidence.join(' / ')}。`,
      otdImpact: monitoringSituation.otdImpact,
      delayImpact: monitoringSituation.delayImpact,
      changeoverImpact: monitoringSituation.changeoverImpact,
    }
    return
  }
  const assistantRecoveryPackage = readAssistantRecoveryPackages().find(record => event.id === `evt-assistant-recovery-${record.id}`)
  if (assistantRecoveryPackage) {
    const purchaseActionLine = assistantRecoveryPackage.purchaseActionSummary
      ? `采购责任动作：${assistantRecoveryPackage.purchaseActionSummary}${assistantRecoveryPackage.purchaseActionTraceId ? `（${assistantRecoveryPackage.purchaseActionTraceId}）` : ''}`
      : '采购责任动作等待收货闭合。'
    const qualityActionLine = assistantRecoveryPackage.qualityActionSummary
      ? `质量责任动作：${assistantRecoveryPackage.qualityActionSummary}${assistantRecoveryPackage.qualityActionTraceId ? `（${assistantRecoveryPackage.qualityActionTraceId}）` : ''}`
      : '质量责任动作等待首件复核闭合。'
    activeAgentSuggestion.value = {
      eventId: event.id,
      title: assistantRecoveryPackage.status === 'closed'
        ? `${assistantRecoveryPackage.title}闭环复核建议`
        : `${assistantRecoveryPackage.title}排产建议`,
      action: assistantRecoveryPackage.status === 'closed'
        ? `${assistantRecoveryPackage.closureTraceId ?? assistantRecoveryPackage.traceId}：执行交接已闭环，建议复核 WO-RUSH-9001 的 CNC-003 夜班窗口、M-AL-6061B 替代批次和 OP-20 质量复核是否继续支撑 ${assistantRecoveryPackage.otdImpact} OTD 恢复。${purchaseActionLine} ${qualityActionLine}`
        : `${assistantRecoveryPackage.traceId}：${assistantRecoveryPackage.scheduleAction} 关联动作：${assistantRecoveryPackage.dispatchSteps.map(step => `${step.module}-${step.owner}`).join(' / ')}。${purchaseActionLine} ${qualityActionLine}`,
      otdImpact: assistantRecoveryPackage.otdImpact,
      delayImpact: assistantRecoveryPackage.delayImpact,
      changeoverImpact: assistantRecoveryPackage.changeoverImpact,
    }
    return
  }
  const anomalyDispatch = readAnomalyDispatchRecords().find(record => event.id === `evt-anomaly-dispatch-${record.anomalyId}`)
  if (anomalyDispatch) {
    activeAgentSuggestion.value = {
      eventId: event.id,
      title: `${anomalyDispatch.typeLabel}后的排产复核`,
      action: `${anomalyDispatch.traceId} 已确认 ${anomalyDispatch.route}，建议按 ${anomalyDispatch.scheduleWindow} 复核 ${anomalyDispatch.affectedOrders}，执行动作：${anomalyDispatch.suggestedAction}`,
      otdImpact: anomalyDispatch.type === 'quality' ? '+4%' : '+2%',
      delayImpact: anomalyDispatch.type === 'quality' ? '-1 单风险' : '-1 个窗口风险',
      changeoverImpact: anomalyDispatch.type === 'equipment' ? '+12min' : '0min',
    }
    return
  }
  const routeCapability = routeCapabilityValidation.value ?? readRouteCapabilityValidation()
  if (routeCapability && event.id === `evt-route-capability-${routeCapability.routeCode}-${routeCapability.operationCode}`) {
    activeAgentSuggestion.value = {
      eventId: event.id,
      title: routeCapability.decision === 'released' ? '热处理分流确认后的排产复核' : '热处理能力缺口阻断建议',
      action: routeCapability.decision === 'released'
        ? `${routeCapability.auditId} 已确认 ${routeCapability.candidateEquipment}，建议把 ${routeCapability.affectedOrders} 合并到 ${routeCapability.batchWindow} 热处理窗口，保留 ${routeCapability.traceId} 进入 OTD 复盘。`
        : `${routeCapability.auditId} 已识别 ${routeCapability.bottleneckResource} 存在 ${routeCapability.capacityGapHours}h 能力缺口，建议冻结 ${routeCapability.affectedOrders} 的 OP-090 超排窗口，等待工艺/制造确认分流或外协兜底。`,
      otdImpact: routeCapability.decision === 'released' ? '+6%' : '-5%',
      delayImpact: routeCapability.decision === 'released' ? '-2 单风险' : '+2 单风险',
      changeoverImpact: routeCapability.decision === 'released' ? `+${routeCapability.changeoverMinutes}min` : '0min',
    }
    return
  }
  const engineeringImpact = engineeringChangeImpact.value ?? readEngineeringChangeImpactAnalysis()
  if (engineeringImpact && event.id === `evt-engineering-change-${engineeringImpact.changeId}`) {
    if (engineeringImpact.decision === 'approved') {
      activeAgentSuggestion.value = {
        eventId: event.id,
        title: '工程变更批准后的正式排产释放',
        action: `${engineeringImpact.decisionAuditId} 已批准 ${engineeringImpact.changeId}，建议正式释放 WO-RUSH-9001 / WO-DEMO-1002 的 ${engineeringImpact.alternateMaterialCode} 替代料窗口，WO-DEMO-1005 保持原物料策略，同时保留 ${engineeringImpact.qualityImpact}`,
        otdImpact: '+7%',
        delayImpact: '-1 单风险',
        changeoverImpact: '+8min',
      }
      return
    }
    if (engineeringImpact.decision === 'rejected') {
      activeAgentSuggestion.value = {
        eventId: event.id,
        title: '工程变更驳回后的模拟撤回',
        action: `${engineeringImpact.decisionAuditId} 已驳回 ${engineeringImpact.changeId}，撤回审批前模拟排产，${engineeringImpact.affectedOrders} 保持 ${engineeringImpact.sourceMaterialCode} 原物料策略，等待采购/原料到货或工程补证后再进入排产复核。`,
        otdImpact: '-4%',
        delayImpact: '+1 单风险',
        changeoverImpact: '0min',
      }
      return
    }
    activeAgentSuggestion.value = {
      eventId: event.id,
      title: '工程变更影响后的审批前排产模拟',
      action: `${engineeringImpact.auditId} 已完成 ${engineeringImpact.changeId} 影响分析，建议按 ${engineeringImpact.scheduleWindow} 释放 ${engineeringImpact.affectedOrders} 的模拟窗口，同时保留 ${engineeringImpact.qualityImpact}；正式采纳前需工程审批。`,
      otdImpact: '+7%',
      delayImpact: '-1 单风险',
      changeoverImpact: '+8min',
    }
    return
  }
  const scheduleRelease = barcodeScheduleReleaseRecord.value ?? readBarcodeScheduleReleaseRecord()
  if (scheduleRelease && event.type === 'quality' && event.id === 'evt-quality-release-WO-RUSH-9001-OP-20') {
    activeAgentSuggestion.value = {
      eventId: event.id,
      title: '质量复验放行后的排产复核',
      action: `${scheduleRelease.traceId} 已解除质量冻结，建议把 WO-RUSH-9001 的 OP-20 装配复检窗口恢复到锁定期后第一个可用班次，同时保留返工复验耗时和标签解冻证据进入 OTD 复盘。`,
      otdImpact: '+3%',
      delayImpact: '-1 单风险',
      changeoverImpact: '0min',
    }
    return
  }
  const approvedAlternate = alternateMaterialApproval.value ?? readAlternateMaterialApproval()
  if (approvedAlternate && event.type === 'material' && event.title.includes(approvedAlternate.sourceMaterialCode)) {
    activeAgentSuggestion.value = {
      eventId: event.id,
      title: '替代料已放行后的缺料复核',
      action: `${approvedAlternate.auditId} 已确认 ${approvedAlternate.alternateMaterialCode} 可替代 ${approvedAlternate.sourceMaterialCode}，建议释放 ${approvedAlternate.affectedOrders} 的冻结工序，保留首件检验与质量追溯窗口。`,
      otdImpact: '+7%',
      delayImpact: '-1 单',
      changeoverImpact: '+8min',
    }
    return
  }
  const supplierNetworkDecision = readSupplierNetworkDecision()
  if (supplierNetworkDecision && event.id === `evt-supplier-network-${supplierNetworkDecision.materialCode}`) {
    activeAgentSuggestion.value = {
      eventId: event.id,
      title: '供应商 SLA 选优后的排产复核',
      action: `${supplierNetworkDecision.traceId} 已选定 ${supplierNetworkDecision.selectedSupplierName}，建议把 ${supplierNetworkDecision.affectedOrders} 的 ${supplierNetworkDecision.materialCode} 到料约束绑定到 ${supplierNetworkDecision.selectedPromiseDate}，并把原供应商 SLA 违约记录保留到 OTD 复盘。`,
      otdImpact: '+5%',
      delayImpact: '-1 单风险',
      changeoverImpact: '+4min',
    }
    return
  }
  const activeCustomerCommitment = otdKpiCommitmentRecord.value ?? readLatestOtdKpiCommitmentPackage()
  if (activeCustomerCommitment && event.id === `evt-otd-kpi-commitment-${activeCustomerCommitment.sourceKpiId}`) {
    activeAgentSuggestion.value = {
      eventId: event.id,
      title: '客户交付恢复承诺后的排产复核',
      action: `${activeCustomerCommitment.traceId} 已生成 ${activeCustomerCommitment.targetName} 交付恢复承诺，建议复核 ${activeCustomerCommitment.agentOtd}% OTD 承诺背后的锁定期后插单、缺料闭环、CNC 瓶颈保护和质量门保留是否仍成立。`,
      otdImpact: `+${activeCustomerCommitment.lift}%`,
      delayImpact: `-${activeCustomerCommitment.delayedReduced} 单`,
      changeoverImpact: '+10min 可控',
    }
    return
  }
  const activeOutsourcingCommitment = outsourcingCommitmentRecord.value ?? readLatestOutsourcingCommitmentPackage()
  if (activeOutsourcingCommitment && event.id === `evt-outsourcing-commitment-${activeOutsourcingCommitment.sourceKpiId}`) {
    if (activeOutsourcingCommitment.scheduleReleaseTraceId) {
      activeAgentSuggestion.value = {
        eventId: event.id,
        title: '外协排产释放后的 OTD 复盘',
        action: `${activeOutsourcingCommitment.scheduleReleaseTraceId} 已确认关闭 ${activeOutsourcingCommitment.affectedOrders} 的厂外等待口径，建议复核后续工序承诺、客户交期和 ${activeOutsourcingCommitment.scheduleReleaseAuditId} 审计链是否已进入 OTD 复盘。`,
        otdImpact: '+2% 已释放归档',
        delayImpact: '0 单外部等待',
        changeoverImpact: '+4min',
      }
      return
    }
    if (activeOutsourcingCommitment.receiptTraceId) {
      activeAgentSuggestion.value = {
        eventId: event.id,
        title: '外协到货后的排产释放复核',
        action: `${activeOutsourcingCommitment.receiptTraceId} 已确认 ${activeOutsourcingCommitment.partnerName} 到货，建议关闭 ${activeOutsourcingCommitment.affectedOrders} 的厂外等待口径，按到货后最早可执行窗口释放排产，并保留 ${activeOutsourcingCommitment.receiptAuditId} 进入 OTD 复盘。`,
        otdImpact: '+2% 已到货释放',
        delayImpact: '-1 单外部等待',
        changeoverImpact: '+4min',
      }
      return
    }
    activeAgentSuggestion.value = {
      eventId: event.id,
      title: '外协承诺后的排产复核建议',
      action: `${activeOutsourcingCommitment.traceId} 已锁定 ${activeOutsourcingCommitment.partnerName} 的 ${activeOutsourcingCommitment.promiseDate} 外协窗口，建议保留 ${activeOutsourcingCommitment.affectedOrders} 的延期口径，不将其计入厂内已恢复订单，并等待到货确认后再释放排产。`,
      otdImpact: '+1% 外部约束保留',
      delayImpact: '0 单厂内恢复',
      changeoverImpact: '0min',
    }
    return
  }
  const supplyRisk = readSupplyRiskEscalation()
  if (supplyRisk && event.id === `evt-supply-risk-${supplyRisk.materialCode}`) {
    if (supplyRisk.decision === 'alternate_received') {
      activeAgentSuggestion.value = {
        eventId: event.id,
        title: '替代供应商到货后的排产释放',
        action: `${supplyRisk.receiptTraceId ?? supplyRisk.traceId} 已确认 ${supplyRisk.alternateSupplierName} 到货，建议释放 ${supplyRisk.affectedOrders} 的 ${supplyRisk.materialCode} 供应风险，按到货后最早可执行窗口复核装配顺序，并保留 ${supplyRisk.receiptAuditId ?? supplyRisk.auditId} 进入 OTD 复盘。`,
        otdImpact: '+6%',
        delayImpact: '-1 单风险',
        changeoverImpact: '+6min',
      }
      return
    }
    activeAgentSuggestion.value = {
      eventId: event.id,
      title: supplyRisk.decision === 'alternate_committed' ? '替代供应商承诺后的排产复核' : '供应延期升级后的排产保护',
      action: supplyRisk.decision === 'alternate_committed'
        ? `${supplyRisk.traceId} 已锁定 ${supplyRisk.alternateSupplierName}，建议把 ${supplyRisk.affectedOrders} 的装配前置约束从供应延期转为到料复核，并保留 ${supplyRisk.auditId} 进入 OTD 复盘。`
        : `${supplyRisk.auditId} 已确认 ${supplyRisk.supplierName} 延期 ${supplyRisk.delayDays} 天，建议冻结受影响装配窗口，评估 ${supplyRisk.alternateSupplierName} 替代承诺，并把 ${supplyRisk.affectedOrders} 顺延方案提交调度员确认。`,
      otdImpact: supplyRisk.decision === 'alternate_committed' ? '+5%' : '-7%',
      delayImpact: supplyRisk.decision === 'alternate_committed' ? '-1 单风险' : '+2 单风险',
      changeoverImpact: supplyRisk.decision === 'alternate_committed' ? '+6min' : '0min',
    }
    return
  }
  const activeLaborBlock = laborQualificationBlock.value ?? readLaborQualificationBlock()
  if (activeLaborBlock && event.type === 'labor' && event.id === `evt-labor-block-${activeLaborBlock.id}`) {
    const isReviewing = activeLaborBlock.status === 'reviewing'
    activeAgentSuggestion.value = {
      eventId: event.id,
      title: '人员资质停工复核建议',
      action: isReviewing
        ? `${activeLaborBlock.auditId} 已由 ${activeLaborBlock.reviewerName} 主管受理，建议继续冻结 ${activeLaborBlock.workOrderNumber} ${activeLaborBlock.operationName}，等待补证/改派记录生成后再释放生产开工。`
        : `${activeLaborBlock.auditId} 已确认 ${activeLaborBlock.blockedEmployeeNumber} ${activeLaborBlock.blockedEmployeeName} 的 ${activeLaborBlock.blockedCertification} 临期且无有效替班候选，建议冻结 ${activeLaborBlock.workOrderNumber} ${activeLaborBlock.operationName}，升级主管补充资质人员或调整排产窗口，复核通过前生产开工不得放行。`,
      otdImpact: '-6%',
      delayImpact: '+1 班次待复核',
      changeoverImpact: '0min',
    }
    return
  }
  const approvedLaborReassignment = laborReassignment.value ?? readLaborReassignment()
  if (approvedLaborReassignment && event.type === 'labor') {
    activeAgentSuggestion.value = {
      eventId: event.id,
      title: '人员替班后的开工复核建议',
      action: `${approvedLaborReassignment.auditId} 已确认 ${approvedLaborReassignment.replacementEmployeeNumber} ${approvedLaborReassignment.replacementEmployeeName} 接管 ${approvedLaborReassignment.workOrderNumber} ${approvedLaborReassignment.operationName}，建议生产开工按替班复核执行，并保留 ${approvedLaborReassignment.traceId} 进入审计回放。`,
      otdImpact: '+4%',
      delayImpact: '-1 班次风险',
      changeoverImpact: '0min',
    }
    return
  }
  const suggestionMap: Record<string, ScheduleAgentSuggestion> = {
    'evt-material-al6061': {
      eventId: event.id,
      title: event.resolved ? '缺料缓解后排产复核' : '缺料约束重排建议',
      action: event.resolved
        ? 'M-AL-6061 已完成采购加急收货，建议释放冻结工序，复核 WO-RUSH-9001 与 WO-DEMO-1002 的最早可执行窗口。'
        : '先冻结 WO-RUSH-9001 的 CNC 后段，引用 BOM-A100 替代料规则评估 M-AL-6061B，同时按 R-A100 CNC 能力要求将 WO-DEMO-1001 前置到可用窗口。',
      otdImpact: '+8%',
      delayImpact: '-1 单',
      changeoverImpact: '+12min',
    },
    'evt-equipment-cnc01': {
      eventId: event.id,
      title: '设备维护窗口重排建议',
      action: '把 CNC-01 维护窗口放入夜班低负载时段，将可替代工序切换到 ASM-01 前置准备。',
      otdImpact: '+5%',
      delayImpact: '-6h',
      changeoverImpact: '-18min',
    },
    'evt-rush-9001': {
      eventId: event.id,
      title: '急单插入重排建议',
      action: '采用加班插入方案，保护锁定期内任务不动，把 WO-RUSH-9001 插入锁定期后第一个 CNC 空窗。',
      otdImpact: '+11%',
      delayImpact: '-2 单',
      changeoverImpact: '+20min',
    },
  }
  const fallbackByType: Record<ScheduleEventItem['type'], ScheduleAgentSuggestion> = {
    material: {
      eventId: event.id,
      title: event.resolved ? '缺料缓解后排产复核' : '缺料约束重排建议',
      action: event.resolved
        ? `针对 ${event.title}，采购风险已下降，建议释放冻结工序并复核 WO-RUSH-9001 与 WO-DEMO-1002 的最早可执行窗口。`
        : `针对 ${event.title}，优先冻结受影响工序，引用 BOM 替代料规则触发采购加急或替代料评估，并按工艺路线能力把不受缺料影响的工单前置。`,
      otdImpact: '+6%',
      delayImpact: '-1 单',
      changeoverImpact: '+10min',
    },
    equipment: {
      eventId: event.id,
      title: '设备维护窗口重排建议',
      action: `针对 ${event.title}，建议换设备到 CNC-002，低优先级工单延后，急单采用夜班加班，必要时拆单分流到 CNC-003，并保护锁定期内任务不直接改动。`,
      otdImpact: '+4%',
      delayImpact: '-4h',
      changeoverImpact: '-12min',
    },
    rush: {
      eventId: event.id,
      title: '急单插入重排建议',
      action: `针对 ${event.title}，采用锁定期后插入策略，比较加班、换设备和强插三种方案后推荐最小延期路径。`,
      otdImpact: '+9%',
      delayImpact: '-1 单',
      changeoverImpact: '+18min',
    },
    quality: {
      eventId: event.id,
      title: '质量返工插入建议',
      action: `针对 ${event.title}，插入返工与复验窗口，将同工艺批次合并，复核设备、物料批次和批次号，保护已承诺交期工单不被返工任务连续挤占。`,
      otdImpact: '+3%',
      delayImpact: '-1 单风险',
      changeoverImpact: '-10min',
    },
    labor: {
      eventId: event.id,
      title: event.resolved === false ? '人员资质停工复核建议' : '人员替班后的开工复核建议',
      action: event.resolved === false
        ? `针对 ${event.title}，保持热处理工序冻结，升级主管补充有效资质人员或调整排产窗口，复核通过前生产开工不得放行。`
        : `针对 ${event.title}，按已审批替班记录释放人员资质临期阻断，生产开工保留班组长复核与工程放行证据。`,
      otdImpact: event.resolved === false ? '-6%' : '+4%',
      delayImpact: event.resolved === false ? '+1 班次待复核' : '-1 班次风险',
      changeoverImpact: '0min',
    },
    route: {
      eventId: event.id,
      title: event.resolved ? '工艺能力释放后排产复核' : '工艺能力缺口阻断建议',
      action: event.resolved
        ? `针对 ${event.title}，按已确认能力窗口进行合批或分流，并把工艺放行证据写入 OTD 复盘。`
        : `针对 ${event.title}，先冻结超排窗口，等待工艺路线能力校验和制造确认后再释放。`,
      otdImpact: event.resolved ? '+4%' : '-4%',
      delayImpact: event.resolved ? '-1 单风险' : '+1 单风险',
      changeoverImpact: event.resolved ? '+10min' : '0min',
    },
    engineering: {
      eventId: event.id,
      title: event.resolved ? '工程变更批准后的正式排产释放' : event.severity === 'critical' ? '工程变更驳回后的模拟撤回' : '工程变更影响后的审批前排产模拟',
      action: event.resolved
        ? `针对 ${event.title}，按已批准 ECN 正式释放替代料排产窗口，并保留库存、质量、供应、成本和 OTD 证据。`
        : event.severity === 'critical'
          ? `针对 ${event.title}，撤回审批前模拟，保持原物料策略并等待采购/原料到货或工程补证。`
          : `针对 ${event.title}，先按工程变更影响分析生成模拟排产，不自动正式采纳；正式释放必须等待工程审批，并保留库存、质量、供应、成本和 OTD 证据。`,
      otdImpact: event.resolved ? '+7%' : event.severity === 'critical' ? '-4%' : '+5%',
      delayImpact: event.resolved ? '-1 单风险' : event.severity === 'critical' ? '+1 单风险' : '-1 单风险',
      changeoverImpact: event.resolved ? '+8min' : event.severity === 'critical' ? '0min' : '+8min',
    },
    anomaly: {
      eventId: event.id,
      title: event.typeLabel === '生产异常' ? '生产异常上报后的排产冻结复核' : '异常分流后的排产复核',
      action: event.typeLabel === '生产异常'
        ? `针对 ${event.title}，先冻结当前工序和受影响设备窗口，核对异常中心、风险队列和班组长处置结论，再决定是否释放后续工序。`
        : `针对 ${event.title}，按异常分流结果冻结受影响窗口，复核质量、设备或物料处置是否影响承诺交期。`,
      otdImpact: event.typeLabel === '生产异常' ? '-4% 待复核' : '+2%',
      delayImpact: event.typeLabel === '生产异常' ? '+1 个工序窗口待确认' : '-1 个窗口风险',
      changeoverImpact: '0min',
    },
    monitoring: {
      eventId: event.id,
      title: '现场态势处置包重排建议',
      action: `针对 ${event.title}，先保护锁定期和瓶颈设备窗口，再把受影响急单插入第一个可用 CNC 空窗，并要求风险队列回写处置结果。`,
      otdImpact: '+5%',
      delayImpact: '-4h',
      changeoverImpact: '+10min',
    },
    pilot: {
      eventId: event.id,
      title: 'POC 试点运行上线验收复核',
      action: `针对 ${event.title}，复核首批真实工单的 Agent 排产建议、现场执行回写和异常关闭证据，确认上线窗口继续保持 OTD 承诺口径。`,
      otdImpact: '+1%',
      delayImpact: '0 单新增风险',
      changeoverImpact: '0min',
    },
    risk: {
      eventId: event.id,
      title: '风险 SLA 晨会复核后的排产保护建议',
      action: `针对 ${event.title}，按晨会复核包保护承诺工单窗口，优先处理逾期风险、关键缺料和瓶颈设备窗口，并要求责任动作回写 OTD 证据链。`,
      otdImpact: '+5%',
      delayImpact: '-1 单延期风险',
      changeoverImpact: '+12min',
    },
    production: {
      eventId: event.id,
      title: '生产完工复核建议',
      action: `针对 ${event.title}，建议复核后续工序窗口、质量门和 OTD 证据链，确认完工回写是否仍支撑承诺交期。`,
      otdImpact: event.resolved ? '+2% 已锁定' : '-3%',
      delayImpact: event.resolved ? '0 单新增风险' : '+1 单待复核',
      changeoverImpact: '0min',
    },
  }
  activeAgentSuggestion.value = suggestionMap[event.id] ?? fallbackByType[event.type]
}

async function adoptAgentSuggestion(suggestion: ScheduleAgentSuggestion) {
  const sourceEvent = scheduleEvents.value.find(event => event.id === suggestion.eventId)
  const activeOutsourcingCommitment = outsourcingCommitmentRecord.value ?? readLatestOutsourcingCommitmentPackage()
  const shouldReleaseOutsourcing = Boolean(
    activeOutsourcingCommitment
    && suggestion.eventId === `evt-outsourcing-commitment-${activeOutsourcingCommitment.sourceKpiId}`
    && activeOutsourcingCommitment.receiptTraceId
    && !activeOutsourcingCommitment.scheduleReleaseTraceId,
  )
  handleScheduleDecision({
    decision: 'accepted',
    reasonCategory: sourceEvent ? `${sourceEvent.type}_event_agent` : 'event_agent',
    categoryLabel: sourceEvent ? sourceEvent.typeLabel : '事件建议',
    reasonDetail: `${suggestion.title}：${formatScenarioDecisionTrail(suggestion)}`,
  })
  if (!shouldReleaseOutsourcing || !activeOutsourcingCommitment) return

  const released = confirmOutsourcingScheduleRelease(activeOutsourcingCommitment.sourceKpiId, '调度员 李工')
  if (!released) return
  outsourcingCommitmentRecord.value = released
  await loadRiskTriggeredEvents()
  activeAgentSuggestion.value = {
    eventId: `evt-outsourcing-commitment-${released.sourceKpiId}`,
    title: '外协排产释放已确认',
    action: `${released.scheduleReleaseTraceId}：${released.scheduleReleaseMessage} ${released.scheduleReleaseAuditId} 已进入 OTD 证据链和审计回放。`,
    otdImpact: '+2% 已释放归档',
    delayImpact: '0 单外部等待',
    changeoverImpact: '+4min',
  }
}

async function closeAssistantRecoveryHandoff(id: string) {
  const closed = closeAssistantRecoveryPackage(id, '调度员 李工')
  if (!closed) return
  assistantRecoveryPackageRecords.value = readAssistantRecoveryPackages()
  assistantEngineeringConstraintPackageRecords.value = readAssistantEngineeringConstraintPackages()
  await loadRiskTriggeredEvents()
  const eventId = `evt-assistant-recovery-${closed.id}`
  activeAgentSuggestion.value = {
    eventId,
    title: `${closed.title}闭环复核建议`,
    action: `${closed.closureTraceId ?? closed.traceId}：执行交接已闭环，建议复核 WO-RUSH-9001 的 CNC-003 夜班窗口、M-AL-6061B 替代批次和 OP-20 质量复核是否继续支撑 ${closed.otdImpact} OTD 恢复。${closed.purchaseActionSummary ? `采购责任动作：${closed.purchaseActionSummary}。` : ''}${closed.qualityActionSummary ? `质量责任动作：${closed.qualityActionSummary}。` : ''}`,
    otdImpact: closed.otdImpact,
    delayImpact: closed.delayImpact,
    changeoverImpact: closed.changeoverImpact,
  }
}

function onFeedbackSubmitted() {
  showFeedbackForm.value = false
}

function onApplyObjective(objective: string) {
  currentObjective.value = objective
  showParetoCompare.value = false

  // 记录方案采纳
  if (planData.value?.id) {
    api.submitAdoptionFeedback({
      schedulePlanId: planData.value.id,
      workshopId: 'workshop-1',
      optimizationObjective: objective,
      reasonCategory: 'batch_optimize_apply',
      reasonDetail: '从批量对比中选择此方案',
    }).catch((e: any) => console.warn('采纳记录提交失败:', e))
  }

  handleOptimize()
}

onMounted(() => {
  applyEngineeringChangeApprovals()
  applyRouteCapabilityValidation()
  applyLaborReassignmentClosure()
  applyLaborQualificationBlockClosure()
  assistantEngineeringConstraintPackageRecords.value = readAssistantEngineeringConstraintPackages()
  loadData()
})
</script>

<style scoped>
.schedule-board {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: calc(100vh - 60px);
  min-height: 1px;
  position: relative;
}

.gantt-wrapper {
  flex: 1;
  position: relative;
  overflow: hidden;
}

.task-explain-shortcuts {
  position: fixed;
  top: 76px;
  left: 24px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  max-width: min(560px, calc(100vw - 48px));
  z-index: 120;
  pointer-events: none;
}

.task-explain-shortcut {
  width: auto;
  min-width: 104px;
  min-height: 30px;
  padding: 0 10px;
  border: 1px solid #bfdbfe;
  border-radius: 4px;
  background: #eff6ff;
  color: #1d4ed8;
  cursor: pointer;
  font-size: 12px;
  font-weight: 700;
  line-height: 1.2;
  pointer-events: auto;
}

.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.8);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 10;
  gap: 12px;
}

.spinner {
  width: 36px;
  height: 36px;
  border: 3px solid #e8e8e8;
  border-top-color: #1890ff;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.error-banner {
  padding: 10px 16px;
  background: #fff2f0;
  border: 1px solid #ffccc7;
  border-radius: 4px;
  color: #ff4d4f;
  margin: 8px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.error-banner button {
  padding: 4px 12px;
  background: #ff4d4f;
  color: white;
  border: none;
  border-radius: 3px;
  cursor: pointer;
}

.warnings-bar {
  padding: 8px 16px;
  background: #fffbe6;
  border: 1px solid #ffe58f;
  border-radius: 4px;
  margin: 4px 8px;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: #ad8b00;
}

.warnings-icon {
  font-size: 15px;
}

.warning-item {
  padding: 2px 0;
}
</style>
