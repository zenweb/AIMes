<template>
  <Transition name="slide">
    <div v-if="visible" class="chat-overlay" @click.self="$emit('close')">
      <div class="chat-panel">
        <!-- 头部 -->
        <div class="chat-header">
          <div class="header-left">
            <h3>AI 生产助手</h3>
            <span v-if="modelLabel" class="model-badge" :title="modelFullLabel">{{ modelLabel }}</span>
          </div>
          <button class="close-btn" @click="$emit('close')" aria-label="关闭聊天">✕</button>
        </div>

        <!-- 消息列表 -->
        <div class="chat-messages" ref="messagesRef">
          <div v-for="msg in messages" :key="msg.id" class="message" :class="msg.role">
            <div class="msg-avatar">{{ msg.role === 'user' ? 'U' : 'AI' }}</div>
            <div class="msg-bubble">
              <div class="msg-content" v-html="renderMarkdown(msg.content)"></div>
              <div v-if="msg.actionPackages?.length" class="action-package-list">
                <article v-for="pkg in msg.actionPackages" :key="pkg.id" class="action-package-card">
                  <div class="package-topline">
                    <span>{{ pkg.statusLabel }}</span>
                    <code>{{ pkg.auditCode }}</code>
                  </div>
                  <strong>{{ pkg.title }}</strong>
                  <p>影响工单：{{ pkg.workOrders }}</p>
                  <div class="package-metrics">
                    <span>OTD {{ pkg.otdImpact }}</span>
                    <span>负责人 {{ pkg.owner }}</span>
                    <span>截止 {{ pkg.dueAt }}</span>
                  </div>
                  <ul>
                    <li v-for="step in pkg.steps" :key="step.evidence">
                      <b>{{ step.module }}</b> · {{ step.owner }}：{{ step.action }}
                      <code>{{ step.evidence }}</code>
                    </li>
                  </ul>
                  <code>{{ pkg.traceId }}</code>
                </article>
              </div>
              <div v-if="msg.actions?.length" class="msg-actions">
                <button
                  v-for="action in msg.actions"
                  :key="action.id"
                  type="button"
                  class="action-btn"
                  @click="executeAction(action)"
                >
                  {{ action.label }}
                </button>
              </div>
              <div v-if="msg.sources && msg.sources.length" class="msg-sources">
                <span class="sources-toggle" @click="toggleSources(msg.id)">
                  参考来源 ({{ msg.sources.length }})
                </span>
                <div v-if="expandedSources.has(msg.id)" class="sources-list">
                  <div v-for="src in msg.sources" :key="src.sourceId" class="source-item">
                    <span class="source-name">{{ src.sourceName }}</span>
                    <span class="source-score">{{ (src.relevanceScore * 100).toFixed(0) }}%</span>
                  </div>
                </div>
              </div>
              <div class="msg-time">{{ formatTime(msg.timestamp) }}</div>
            </div>
          </div>

          <!-- 加载指示器 -->
          <div v-if="loading" class="message assistant">
            <div class="msg-avatar">AI</div>
            <div class="msg-bubble">
              <div class="typing-dots"><span>.</span><span>.</span><span>.</span></div>
            </div>
          </div>

          <!-- 空状态 -->
          <div v-if="!messages.length && !loading" class="empty-chat">
            <div class="empty-icon">💬</div>
            <p>有什么生产相关的问题？</p>
            <p class="empty-hints">例如：当前产能如何？设备利用率是多少？</p>
          </div>
        </div>

        <!-- 输入区 -->
        <div class="chat-input-area">
          <div class="input-wrapper">
            <textarea
              v-model="inputText"
              class="chat-input"
              placeholder="输入生产相关问题..."
              rows="1"
              @keydown.enter.exact.prevent="sendMessage"
              @input="autoResize"
            ></textarea>
            <button class="send-btn" :disabled="!inputText.trim() || loading" @click="sendMessage">
              发送
            </button>
          </div>
          <div v-if="error" class="chat-error">{{ error }}</div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, watch, nextTick, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { queryKnowledge, getChatHistory } from '../../api/knowledge'
import { getLlmStatus } from '../../api/llm'
import type { ChatAction, ChatActionPackage, ChatMessage, KnowledgeSourceDto } from '../../types/knowledge'
import { recordAssistantActionAudit } from '../../utils/assistant-action-audit'
import { writeAssistantRecoveryPackage, type AssistantRecoveryPackage } from '../../utils/assistant-action-package-sync'
import { findAssistantCitationTrace } from '../../utils/knowledge-citations'
import { readLatestOtdKpiCommitmentPackage } from '../../utils/otd-kpi-commitment-sync'
import { readPocRolloutPackageRecord } from '../../utils/poc-rollout-package-sync'
import { readPocPilotRunRecord } from '../../utils/poc-pilot-run-sync'
import { readPocHypercareAcceptanceRecord } from '../../utils/poc-hypercare-sync'
import { readRiskSlaReviewRecord } from '../../utils/risk-sla-review-sync'
import { readQualityMrbDispositionRecord } from '../../utils/quality-mrb-disposition-sync'
import { readOtdEvidenceChainRecords, type OtdEvidenceChainItem } from '../../utils/otd-evidence-chain-sync'
import {
  readLatestQualityKnowledgeReuseClosure,
  readLatestQualityKnowledgeReuseDraft,
  readLatestQualityKnowledgeReviewQueueRecord,
  readLatestQualityKnowledgeSample,
  readLatestQualityKnowledgeRecommendationFeedbackRecord,
  readQualityKnowledgeRetrainingVersionRecords,
  qualityKnowledgeRecommendationReleaseScopeLabel,
  selectPrioritizedQualityKnowledgeRecommendationVersion,
} from '../../utils/quality-knowledge-sample-sync'

const props = defineProps<{ visible: boolean }>()
defineEmits<{ close: [] }>()
const router = useRouter()

const messages = ref<ChatMessage[]>([])
const inputText = ref('')
const loading = ref(false)
const error = ref('')
const sessionId = ref(`session-${Date.now()}`)
const expandedSources = ref(new Set<string>())
const messagesRef = ref<HTMLElement | null>(null)
const modelLabel = ref('')
const modelFullLabel = ref('')

watch(() => props.visible, async (show) => {
  if (show) {
    error.value = ''
    await loadHistory()
    await nextTick()
    scrollToBottom()
  }
})

function toggleSources(id: string) {
  const s = new Set(expandedSources.value)
  if (s.has(id)) s.delete(id)
  else s.add(id)
  expandedSources.value = s
}

function formatTime(d: Date) {
  return d.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/\//g, '&#x2F;')
}

function renderMarkdown(text: string): string {
  return escapeHtml(text)
    .replace(/```(\w*)\n([\s\S]*?)```/g, '<pre><code>$2</code></pre>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n/g, '<br>')
}

function autoResize(e: Event) {
  const el = e.target as HTMLTextAreaElement
  el.style.height = 'auto'
  el.style.height = Math.min(el.scrollHeight, 120) + 'px'
}

function scrollToBottom() {
  if (messagesRef.value) {
    messagesRef.value.scrollTop = messagesRef.value.scrollHeight
  }
}

function addMessage(role: 'user' | 'assistant', content: string, sources?: KnowledgeSourceDto[], actions?: ChatAction[], actionPackages?: ChatActionPackage[]) {
  messages.value.push({
    id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    role,
    content,
    sources,
    actions,
    actionPackages,
    timestamp: new Date(),
  })
}

async function loadHistory() {
  try {
    const history = await getChatHistory(sessionId.value, 50)
    if (history.messages?.length) {
      messages.value = history.messages.map(m => ({
        id: `hist-${m.timestamp}-${Math.random().toString(36).slice(2, 6)}`,
        role: m.role as 'user' | 'assistant',
        content: m.content,
        timestamp: new Date(m.timestamp),
      }))
    }
  } catch {
    // 历史加载失败 — 静默使用空状态
  }
}

async function sendMessage() {
  const text = inputText.value.trim()
  if (!text || loading.value) return

  addMessage('user', text)
  inputText.value = ''
  error.value = ''
  loading.value = true

  try {
    const res = await queryKnowledge({
      question: text,
      sessionId: sessionId.value,
      topK: 5,
    })
    addMessage('assistant', res.answer, res.sources, getExecutableActions(text))
  } catch {
    // 后端不可用 — 演示回复
    addMessage('assistant', getDemoReply(text), getDemoSources(text), getExecutableActions(text))
  } finally {
    loading.value = false
    await nextTick()
    scrollToBottom()
  }
}

function currentUserRole() {
  try {
    const raw = localStorage.getItem('aimes_user')
    if (!raw) return 'Unknown'
    return JSON.parse(raw).role ?? 'Unknown'
  } catch {
    return 'Unknown'
  }
}

function currentUsername() {
  try {
    const raw = localStorage.getItem('aimes_user')
    if (!raw) return 'Unknown'
    const user = JSON.parse(raw)
    return user.username ?? user.displayName ?? 'Unknown'
  } catch {
    return 'Unknown'
  }
}

function canExecuteAction(action: ChatAction) {
  if (!action.requiredRole) return true
  const role = currentUserRole()
  return role === action.requiredRole || role === 'Admin'
}

async function executeAction(action: ChatAction) {
  if (!canExecuteAction(action)) {
    recordAssistantActionAudit({
      action,
      actor: currentUsername(),
      role: currentUserRole(),
      permitted: false,
    })
    addMessage('assistant', `动作已拒绝：当前用户缺少 ${action.requiredRole} 权限，未执行 ${action.label}。`)
    return
  }

  if (action.type === 'navigate' || action.type === 'schedule_suggestion') {
    if (action.targetRoute) {
      await router.push(action.targetRoute)
    }
  }

  if (action.type === 'export_report') {
    exportActionReport()
    if (action.targetRoute) {
      await router.push(action.targetRoute)
    }
  }

  if (action.type === 'delivery_recovery_package') {
    const recoveryPackage = writeAssistantRecoveryPackage({
      actor: currentUsername(),
      role: currentUserRole(),
    })
    if (action.targetRoute) {
      await router.push(action.targetRoute)
    }
    addMessage(
      'assistant',
      [
        `权限校验通过：${currentUserRole()} 可生成交期恢复执行包。`,
        `审计编号：${recoveryPackage.auditCode}`,
        `动作已执行：${action.resultMessage}`,
        `已同步到 AI 排产事件队列、风险处置队列、OTD 复盘证据链和审计回放。`,
      ].join('\n'),
      undefined,
      undefined,
      [mapRecoveryPackageToChatPackage(recoveryPackage)]
    )
  } else if (action.type === 'create_anomaly_card') {
    const auditCode = action.auditCode ?? `AUD-${Date.now()}`
    if (action.targetRoute) {
      await router.push(action.targetRoute)
    }
    addMessage('assistant', `权限校验通过：${currentUserRole()} 可创建异常处置卡。\n审计编号：${auditCode}\n动作已执行：${action.resultMessage}`)
  } else {
    addMessage('assistant', `动作已执行：${action.resultMessage}`)
  }
  recordAssistantActionAudit({
    action,
    actor: currentUsername(),
    role: currentUserRole(),
    permitted: true,
  })
  await nextTick()
  scrollToBottom()
}

function mapRecoveryPackageToChatPackage(record: AssistantRecoveryPackage): ChatActionPackage {
  return {
    id: record.id,
    title: record.title,
    auditCode: record.auditCode,
    traceId: record.traceId,
    statusLabel: record.statusLabel,
    workOrders: record.workOrders,
    otdImpact: record.otdImpact,
    owner: record.owner,
    dueAt: record.dueAt,
    steps: record.dispatchSteps,
  }
}

function exportActionReport() {
  const headers = ['类别', '项目', '值']
  const rows = [
    ['OTD复盘', '人工基线OTD', '82.0%'],
    ['OTD复盘', 'Agent推荐OTD', '96.0%'],
    ['OTD复盘', 'OTD提升', '+14%'],
    ['POC评估', '通过线', '85分'],
    ['Demo路径', '主线', '生产概览 -> 风险预警 -> AI排产 -> 采购协同 -> 报表中心'],
  ]
  const csv = [headers, ...rows]
    .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    .join('\n')
  const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'AI-MES-OTD-POC-Report.csv'
  a.click()
  URL.revokeObjectURL(url)
}

function latestKittingEvidenceForRushOrder(): OtdEvidenceChainItem | null {
  return readOtdEvidenceChainRecords()
    .filter(record =>
      record.stage === '库存齐套'
      && record.object.includes('WO-RUSH-9001')
      && record.title.includes('M-AL-6061')
    )
    .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt))[0] ?? null
}

function buildKittingDelayLines() {
  const evidence = latestKittingEvidenceForRushOrder()
  if (!evidence) {
    return [
      '- 主因：`M-AL-6061` 齐套缺口 12 件，后段 CNC 精加工不能直接释放。',
      '- 采购闭环：尚未读取到库存齐套证据，请先在库存齐套生成缺料排产事件。',
    ]
  }
  if (evidence.status === 'closed') {
    const closureTrace = evidence.sourceTraceId ? `，采购证据 ${evidence.sourceTraceId}` : ''
    return [
      `- 主因：\`${evidence.object}\` 的 \`M-AL-6061\` 齐套风险已闭合，当前状态 ${evidence.statusLabel}${closureTrace}。`,
      `- 采购闭环：${evidence.summary}`,
    ]
  }
  return [
    `- 主因：\`${evidence.object}\` 仍存在 \`M-AL-6061\` 齐套风险，当前状态 ${evidence.statusLabel}。`,
    `- 齐套证据：${evidence.summary}`,
  ]
}

function buildTopRiskOrderLines() {
  const kittingEvidence = latestKittingEvidenceForRushOrder()
  const equipmentRisk = '1. `WO-2026-0042`：`CNC-001` 停机影响精加工窗口，预计延期 +4h，建议分流到 `CNC-003`。'
  const qualityRisk = '2. `WO-003`：热处理硬度返工，`HT-01` 复验窗口受占用，建议执行 CAPA 验证并同步 OTD 复盘。'

  if (kittingEvidence?.status === 'closed') {
    const closureTrace = kittingEvidence.sourceTraceId ? `，采购证据 ${kittingEvidence.sourceTraceId}` : ''
    return [
      equipmentRisk,
      qualityRisk,
      `3. \`WO-RUSH-9001\`：\`M-AL-6061\` ${kittingEvidence.statusLabel}${closureTrace}，缺料风险从高风险降级为观察项，建议排产复核释放冻结工序。`,
      '',
      `齐套闭环依据：${kittingEvidence.summary}`,
      '优先级判断依据：客户承诺交期、瓶颈设备占用、缺料缺口、质量返工对后续工序的连锁影响。',
    ]
  }

  const kittingContext = kittingEvidence
    ? `${kittingEvidence.statusLabel}，${kittingEvidence.summary}`
    : '尚未生成库存齐套证据，需先在库存齐套生成缺料排产事件。'

  return [
    `1. \`WO-RUSH-9001\`：急单插入 + \`M-AL-6061\` 缺料，${kittingContext} 风险等级高，建议采购加急并生成重排建议。`,
    equipmentRisk.replace('1.', '2.'),
    qualityRisk.replace('2.', '3.'),
    '',
    '优先级判断依据：客户承诺交期、瓶颈设备占用、缺料缺口、质量返工对后续工序的连锁影响。',
  ]
}

// ====== 演示数据 ======

const demoReplies = [
  { keywords: ['产能', '利用率'], reply: '当前车间整体设备利用率为 **72%**。瓶颈设备 CNC-001 利用率达 85%，建议优化该设备的排产策略。热处理炉当前利用率 45%，仍有较大富余产能。' },
  { keywords: ['质量', '合格率'], reply: '本月质检合格率为 **94%**（42/45 批次）。主要缺陷类型为表面粗糙度超差（3 例）和尺寸偏差（2 例）。当前有 **3 项待处理异常**，建议优先处理 CNC-002 的尺寸偏移问题。' },
  { keywords: ['工单', '订单'], reply: '当前有 **8 个工单** 处于进行中状态。今日排产 5 个工单：WO-001（精密转接座）、WO-005（基座加工）、WO-008（外壳注塑）已完成，WO-013（淬火热处理）和 WO-009（面板注塑）待生产。' },
  { keywords: ['物料', '库存', '缺料'], reply: '当前有 **3 项物料预警**：\n- 🔴 **铝合金 6061**：库存 180 kg，低于安全库存 200 kg\n- 🟡 **抗磨液压油**：库存 35 L，低于安全库存 50 L\n- 🟡 **6205 轴承**：库存 85 个，低于安全库存 100 个\n建议今日完成铝合金 6061 采购下单。' },
  { keywords: ['设备', '状态'], reply: '当前 **8 台设备** 中：\n- 🟢 运行中：4 台（CNC-001、CNC-002、注塑机-1号、装配线-1号）\n- 🟡 空闲：3 台（CNC-003、装配线-2号、热处理炉）\n- 🔴 停机：1 台（注塑机-2号，维护中）\n瓶颈设备：CNC-001（利用率 85%）。' },
]

function getDemoReply(question: string): string {
  const q = question.toLowerCase()
  const businessAnalysis = getBusinessAnalysisReply(question)
  if (businessAnalysis) return businessAnalysis
  const executable = getExecutableActions(question)
  if (executable.length) {
    return `我识别到可执行意图，已准备 ${executable.length} 个动作。你可以直接点击下方按钮执行；动作会留下聊天记录。`
  }
  const match = demoReplies.find(({ keywords }) => keywords.some(k => q.includes(k)))
  return match?.reply ?? '感谢您的提问！根据当前生产数据分析：\n\n- 今日整体排产达成率 **86%**\n- 设备综合利用率 **72%**\n- 质量合格率 **94%**\n\n如需更详细的分析，请提供更具体的问题描述，例如："CNC-001 的设备利用率趋势如何？"'
}

function getBusinessAnalysisReply(question: string): string {
  const q = question.toLowerCase()
  const citationTrace = findAssistantCitationTrace(question)
  const citationLine = citationTrace
    ? `\n\n引用治理：${citationTrace.sources.map(source => source.sourceName).join('；')}。\n阻断来源：${citationTrace.blockedSource}`
    : ''

  if ((q.includes('客户') || q.includes('交付') || q.includes('承诺')) && (q.includes('承诺包') || q.includes('恢复') || q.includes('otd'))) {
    const commitment = readLatestOtdKpiCommitmentPackage()
    if (!commitment) {
      return [
        '**客户交付承诺：当前还没有生成承诺包。**',
        '',
        '- 请先在报表中心的 OTD KPI 多维钻取中选择客户、产线、产品族或时间窗口。',
        '- 点击“生成客户交付恢复承诺包”后，助手会读取同一审计记录并给出客户可复盘口径。',
      ].join('\n') + citationLine
    }
    return [
      `**${commitment.title} 已生成。**`,
      '',
      `- 承诺口径：${commitment.commitment}`,
      `- 责任人：${commitment.owner}，截止 ${commitment.dueAt}。`,
      `- 审计追踪：${commitment.auditId} / ${commitment.traceId}。`,
      `- 责任动作：${commitment.actions.map(action => `${action.module}：${action.action}`).join('；')}`,
      '- 该承诺包已写入 OTD 证据链和审计回放，可在报表 CSV 中带给客户复盘。',
    ].join('\n') + citationLine
  }

  if (
    q.includes('风险')
    && (q.includes('sla') || q.includes('晨会') || q.includes('复核') || q.includes('逾期'))
  ) {
    const review = readRiskSlaReviewRecord()
    if (!review) {
      return [
        '**风险 SLA 晨会复核：当前还没有生成复核包。**',
        '',
        '- 请先在风险预警的风险处置队列点击“生成 SLA 晨会复核包”。',
        '- 生成后助手会读取逾期数量、关键风险、责任动作、审计编号和 OTD 证据链追踪号。',
      ].join('\n') + citationLine
    }
    const closureLines = review.status === 'closed'
      ? [
          `- 闭环结论：${review.closureSummary}`,
          `- 闭环追踪：${review.closureAuditId} / ${review.closureTraceId}`,
          `- 动作结果：${review.actions.map(action => `${action.module}：${action.result ?? action.evidence}`).join('；')}`,
        ]
      : ['- 闭环状态：责任动作仍在晨会复核中，等待确认后会反写排产、治理和 OTD 证据链。']
    return [
      `**${review.title} ${review.status === 'closed' ? '已闭环' : '已生成'}。**`,
      '',
      `- 晨会编号：${review.reviewMeetingId}，状态 ${review.statusLabel}。`,
      `- 风险概览：逾期 ${review.overdueCount} 项，关键风险 ${review.criticalCount} 项，影响 ${review.affectedOrders}。`,
      `- OTD 影响：${review.otdImpact}`,
      `- 关键风险：${review.risks.slice(0, 3).map(risk => `${risk.title}（${risk.owner} / ${risk.dueAt}）`).join('；')}`,
      `- 责任动作：${review.actions.map(action => `${action.module} ${action.owner} ${action.dueAt}`).join('；')}`,
      `- 审计追踪：${review.auditId} / ${review.traceId}`,
      ...closureLines,
      '- 该复核包已同步到 AI 排产事件队列、系统治理、报表 OTD 证据链和审计回放。',
    ].join('\n') + citationLine
  }

  if (
    (q.includes('mrb') || q.includes('报废') || q.includes('补料') || q.includes('质量'))
    && (q.includes('处置') || q.includes('影响') || q.includes('重排') || q.includes('otd') || q.includes('报废'))
  ) {
    const mrb = readQualityMrbDispositionRecord()
    if (!mrb) {
      return [
        '**质量 MRB 报废补料：当前还没有生成处置决策。**',
        '',
        '- 请先在质量闭环页点击“生成 MRB 报废补料决策”。',
        '- 生成后助手会读取处置结论、补料动作、排产影响、审计编号和 OTD 证据链追踪号。',
      ].join('\n') + citationLine
    }
    const closureLines = mrb.status === 'closed'
      ? [
          `- 闭环结论：${mrb.closureSummary}`,
          `- 闭环追踪：${mrb.closureAuditId} / ${mrb.closureTraceId}`,
          `- 动作结果：${mrb.actions.map(action => `${action.module}：${action.result ?? action.evidence}`).join('；')}`,
        ]
      : ['- 闭环状态：MRB 责任动作仍在执行中，补料 ETA 与排产重建确认后会回写排产、治理和 OTD 证据链。']
    return [
      `**${mrb.title} ${mrb.status === 'closed' ? '已闭环' : '已生成'}。**`,
      '',
      `- 处置结论：${mrb.dispositionLabel}，状态 ${mrb.statusLabel}。`,
      `- 质量事件：${mrb.inspectionId} / ${mrb.workOrderId} / ${mrb.processName}，${mrb.defectQuantity} 件 ${mrb.defectPattern}。`,
      `- OTD 影响：${mrb.otdImpact}`,
      `- 排产影响：${mrb.scheduleImpact}`,
      `- 责任动作：${mrb.actions.map(action => `${action.module} ${action.owner} ${action.dueAt}`).join('；')}`,
      `- 审计追踪：${mrb.auditId} / ${mrb.traceId} / ${mrb.scheduleTraceId}`,
      ...closureLines,
      '- 该 MRB 决策已同步到 AI 排产事件队列、系统治理、报表 OTD 证据链和审计回放。',
    ].join('\n') + citationLine
  }

  if (
    (q.includes('poc') || q.includes('hypercare') || q.includes('上线验收') || q.includes('稳定运行'))
    && (q.includes('hypercare') || q.includes('上线验收') || q.includes('稳定运行') || q.includes('正式上线'))
  ) {
    const hypercare = readPocHypercareAcceptanceRecord()
    if (!hypercare) {
      return [
        '**POC 上线验收：当前还没有生成 Hypercare 监控包。**',
        '',
        '- 请先在报表中心确认首批真实工单试点运行闭环。',
        '- 然后点击“生成上线验收与 Hypercare 监控包”，助手会读取 OTD、OEE、P1/P2 未关闭事件和审计编号。',
      ].join('\n') + citationLine
    }
    return [
      `**${hypercare.title} 已进入运行。**`,
      '',
      `- 状态：${hypercare.statusLabel}，周期 ${hypercare.goLiveWindow}。`,
      `- 验收门禁：${hypercare.acceptanceGate}`,
      `- 当前指标：OTD ${hypercare.actualOtd}，OEE ${hypercare.currentOee}，P1/P2 未关闭 ${hypercare.unresolvedP1P2} 个，异常 ${hypercare.incidentCount} 个。`,
      `- 监控项：${hypercare.monitors.map(monitor => `${monitor.label} ${monitor.current}/${monitor.statusLabel}`).join('；')}`,
      `- 审计追踪：${hypercare.auditId} / ${hypercare.traceId}`,
      '- 该 Hypercare 记录已写入生产概览、实时监控、系统治理、报表 CSV 和审计回放。',
    ].join('\n') + citationLine
  }

  if ((q.includes('poc') || q.includes('试点') || q.includes('客户')) && (q.includes('上线') || q.includes('交付') || q.includes('行动包') || q.includes('推广'))) {
    const rolloutPackage = readPocRolloutPackageRecord()
    if (!rolloutPackage) {
      return [
        '**POC 上线交付：当前还没有生成上线交付行动包。**',
        '',
        '- 请先在报表中心完成客户 POC 复盘签署。',
        '- 签署后点击“生成上线交付行动包”，助手会读取上线窗口、责任动作和审计编号。',
      ].join('\n') + citationLine
    }
    return [
      `**${rolloutPackage.title} 已生成。**`,
      '',
      `- 上线窗口：${rolloutPackage.rolloutWindow}`,
      `- 上线门禁：${rolloutPackage.goLiveGate}`,
      `- 总负责人：${rolloutPackage.owner}`,
      `- 审计追踪：${rolloutPackage.auditId} / ${rolloutPackage.traceId}`,
      `- 行动清单：${rolloutPackage.actions.map(action => `${action.module} ${action.dueAt} ${action.owner}`).join('；')}`,
      '- 该交付包已写入 OTD 证据链、报表 CSV 和审计回放，可作为 POC 转试点上线的客户交付口径。',
    ].join('\n') + citationLine
  }

  if (
    (q.includes('poc') || q.includes('试点') || q.includes('真实工单') || q.includes('首批'))
    && (q.includes('试点运行') || q.includes('运行情况') || q.includes('首批') || q.includes('真实工单'))
  ) {
    const pilotRun = readPocPilotRunRecord()
    if (!pilotRun) {
      return [
        '**POC 试点运行：当前还没有确认首批真实工单运行闭环。**',
        '',
        '- 请先在报表中心生成 POC 上线交付行动包。',
        '- 然后点击“确认试点运行闭环”，助手会读取首批工单、OTD 实测、检查点和审计编号。',
      ].join('\n') + citationLine
    }
    return [
      `**${pilotRun.title} 已闭环。**`,
      '',
      `- 试点批次：${pilotRun.batchId}，${pilotRun.sampleSize} 单，OTD ${pilotRun.actualOtd}（目标 ${pilotRun.otdTarget}）。`,
      `- 运行窗口：${pilotRun.runWindow}`,
      `- 审计追踪：${pilotRun.auditId} / ${pilotRun.traceId}`,
      `- 样本工单：${pilotRun.workOrders.map(order => `${order.workOrderNumber} ${order.executionStatus}`).join('；')}`,
      `- 检查点：${pilotRun.checkpoints.map(checkpoint => `${checkpoint.module} ${checkpoint.evidence}`).join('；')}`,
      '- 该试点运行已进入 OTD 证据链、报表 CSV、系统治理、AI 排产事件和审计回放。',
    ].join('\n') + citationLine
  }

  if (
    (q.includes('bom') || q.includes('物料清单') || q.includes('工艺路线') || q.includes('工程数据') || q.includes('替代料'))
    && (q.includes('排产') || q.includes('约束') || q.includes('如何') || q.includes('影响') || q.includes('解释'))
  ) {
    return [
      '**工程数据约束：BOM、工艺路线和质量门已经进入排产解释。**',
      '',
      '- BOM-A100 负责物料与替代料：M-AL-6061 缺口会冻结 CNC 后段，M-AL-6061B 只有工程确认后才能释放。',
      '- R-A100 负责前段 CNC 与质量门：设备能力、来料检验和最终检验都会进入排产解释。',
      '- R-B200 负责热处理瓶颈：OP-090 的 4.5h 能力缺口需要分流/合批后再放行。',
      '- AI 排产会把这些工程约束写入事件队列和 OTD 证据链，避免只按时间空档机械插单。',
      '- 下一步可直接打开 BOM 管理看替代料与工程变更，再打开工艺路线看设备能力和瓶颈校验。',
    ].join('\n') + citationLine
  }

  if (
    (q.includes('扫码') || q.includes('返工') || q.includes('capa') || q.includes('质量'))
    && (q.includes('复用') || q.includes('同类') || q.includes('知识') || q.includes('根因') || q.includes('推荐'))
  ) {
    const sample = readLatestQualityKnowledgeSample()
    if (!sample) {
      return [
        '**扫码质量复用建议：当前缺少可正式引用的扫码返工样本。**',
        '',
        '- 先在质量闭环中把扫码返工、批次隔离、返工成本和复验放行沉淀为 CAPA 知识样本。',
        '- 样本入库后，AI 生产助手才能用同类批次、同类设备和同类缺陷推荐 CAPA 处置。',
      ].join('\n') + citationLine
    }

    const draft = readLatestQualityKnowledgeReuseDraft()
    const draftLines = draft
      ? [
          `- 已生成处置草案：${draft.targetWorkOrderId} / ${draft.targetOperationCode}，命中 ${draft.matchScore}%，复用效果 ${draft.effectScore} 分。`,
          `- 草案动作：${draft.dispositionDraft.join('；')}`,
          `- 草案追踪：${draft.auditId} / ${draft.traceId}。`,
        ]
      : ['- 还未生成同类缺陷处置草案，可在质量闭环页点击“生成同类缺陷处置草案”。']
    const closure = readLatestQualityKnowledgeReuseClosure()
    const closureLines = closure
      ? closure.status === 'verified'
        ? [
            `- 正式 CAPA：${closure.formalCapaTitle} 已验证，复用评分 ${closure.effectScoreBefore} -> ${closure.effectScoreAfter} 分。`,
            `- 效果回写：${closure.effectTraceId}，${closure.effectReview}`,
          ]
        : [
            `- 正式 CAPA：${closure.formalCapaTitle} 已由 ${closure.owner} 复核建立，验证标准 ${closure.verification}。`,
            `- CAPA 追踪：${closure.auditId} / ${closure.traceId}。`,
          ]
      : ['- 处置草案还未转正式 CAPA，需质量工程师复核后才能纳入效果反馈样本。']
    const reviewQueue = readLatestQualityKnowledgeReviewQueueRecord()
    const publishedRetrainingVersion = selectPrioritizedQualityKnowledgeRecommendationVersion(readQualityKnowledgeRetrainingVersionRecords())
    const recommendationFeedback = readLatestQualityKnowledgeRecommendationFeedbackRecord()
    const reviewQueueLines = reviewQueue
      ? publishedRetrainingVersion
        ? [
            `- 再训练发布：${publishedRetrainingVersion.trainingSetVersion} ${publishedRetrainingVersion.status === 'gray_published' ? '已灰度发布' : '已发布到 AI 推荐链路'}，${qualityKnowledgeRecommendationReleaseScopeLabel(publishedRetrainingVersion)} 已启用。`,
            `- OP-20 推荐：装配扭矩偏移优先匹配独立 CAPA 样本，原跨工序扫码返工低分样本继续作为负样本降权。`,
            `- 发布审计：${publishedRetrainingVersion.publishAuditId} / ${publishedRetrainingVersion.publishTraceId}。`,
            ...(recommendationFeedback
              ? [
                  `- 采纳反馈：${recommendationFeedback.decisionLabel}，效果趋势 ${recommendationFeedback.effectTrendLabel}，进入 ${recommendationFeedback.nextTrainingSetVersion}。`,
                  `- 反馈审计：${recommendationFeedback.auditId} / ${recommendationFeedback.traceId} / ${recommendationFeedback.nextTrainingTraceId}。`,
                ]
              : []),
          ]
        : reviewQueue.status === 'closed'
        ? [
            `- 低分复核结论：${reviewQueue.title} 已判定为 ${reviewQueue.decisionLabel}，复用效果 ${reviewQueue.effectScore} 分。`,
            `- 禁用规则：${reviewQueue.disabledReuseRule}`,
            `- 再训练候选：${reviewQueue.retrainingTraceId}，${reviewQueue.retrainingPlan?.join('；')}`,
            `- 复核追踪：${reviewQueue.decisionAuditId} / ${reviewQueue.decisionTraceId}。`,
          ]
        : [
            `- 低分复核队列：${reviewQueue.title} 已进入 ${reviewQueue.statusLabel}，复用效果 ${reviewQueue.effectScore} 分。`,
            `- 降权原因：${reviewQueue.reason}`,
            `- 复核追踪：${reviewQueue.auditId} / ${reviewQueue.traceId}。`,
          ]
      : []

    return [
      `**扫码质量复用建议：${sample.workOrderId} 的返工样本已可复用。**`,
      '',
      `- 样本：${sample.documentTitle} ${sample.version}，审计编号 ${sample.auditId}。`,
      `- 适用模式：${sample.processName} / ${sample.equipmentCode} / ${sample.materialBatch} / ${sample.defectPattern}。`,
      `- 推荐 CAPA：${sample.capaRecommendations.join('；')}`,
      ...draftLines,
      ...closureLines,
      ...reviewQueueLines,
      `- 复用范围：${sample.reuseTargets.join('、')}。`,
      `- 追踪编号：${sample.traceId}。`,
    ].join('\n') + citationLine
  }

  if ((q.includes('为什么') || q.includes('原因')) && (q.includes('延期') || q.includes('延误'))) {
    const kittingLines = buildKittingDelayLines()
    return [
      '**延期原因分析：WO-RUSH-9001 当前是最高风险订单。**',
      '',
      ...kittingLines,
      '- 次因：`CNC-001` 是瓶颈设备，夜班维护窗口会挤占 4h 可用产能。',
      '- 质量影响：`INS-003` 热处理返工占用 `HT-01` 复验窗口，影响同批 `WO-DEMO-1007`。',
      '- Agent 建议：启用 `M-AL-6061B` 替代料评估，急单放入锁定期后的第一个 CNC 空窗，并把低优先级工单后移。',
      '- 预计恢复：采购收货和重排采纳后，30 单样本 OTD 可从 82% 恢复到 96%。',
    ].join('\n') + citationLine
  }

  if ((q.includes('最危险') || q.includes('最高风险') || q.includes('top') || q.includes('前三') || q.includes('3 个')) && q.includes('工单')) {
    return [
      '**今天最危险的 3 个工单：**',
      '',
      ...buildTopRiskOrderLines(),
    ].join('\n') + citationLine
  }

  if ((q.includes('cnc-01') || q.includes('cnc-001') || q.includes('cnc')) && (q.includes('故障') || q.includes('停机')) && (q.includes('4') || q.includes('四'))) {
    return [
      '**故障假设：CNC-001 停机 4 小时。**',
      '',
      '- 直接影响：`WO-2026-0042 / WO-RUSH-9001 / WO-DEMO-1001` 的 CNC 精加工窗口被压缩。',
      '- 交期影响：若不重排，急单预计新增延期 +4h，低优先级工单至少后移 1 个班次。',
      '- 可替代设备：`CNC-002` 可承接标准件；`CNC-003` 可拆单分流，但换线增加约 25 分钟。',
      '- Agent 推荐：把维护窗口放入 22:00-02:00 夜班，保护锁定期内任务不动，锁定期后生成换设备 + 加班组合方案。',
      '- 审计要求：调度员采纳后需要填写“设备故障分流”原因，进入 AI 决策回放。',
    ].join('\n') + citationLine
  }

  return ''
}

function getExecutableActions(question: string): ChatAction[] {
  const q = question.toLowerCase()
  const actions: ChatAction[] = []
  const engineeringDataIntent = q.includes('bom')
    || q.includes('物料清单')
    || q.includes('工艺路线')
    || (q.includes('工艺') && q.includes('路线'))
    || q.includes('工程数据')
    || q.includes('替代料')

  if (q.includes('打开') || q.includes('进入') || q.includes('跳转')) {
    if (q.includes('排产')) {
      actions.push({
        id: 'open-scheduling',
        label: '打开 AI 排产',
        type: 'navigate',
        targetRoute: '/scheduling',
        resultMessage: '已打开 AI 排产工作台。',
      })
    }
    if (engineeringDataIntent) {
      actions.push({
        id: 'open-bom',
        label: '打开 BOM 管理',
        type: 'navigate',
        targetRoute: '/bom',
        resultMessage: '已打开 BOM 管理页面。',
      })
      actions.push({
        id: 'open-routing',
        label: '打开工艺路线',
        type: 'navigate',
        targetRoute: '/routing',
        resultMessage: '已打开工艺路线页面。',
      })
    }
    if (q.includes('报表') || q.includes('otd')) {
      actions.push({
        id: 'open-report',
        label: '打开 OTD 报告',
        type: 'navigate',
        targetRoute: '/report',
        resultMessage: '已打开报表中心的 OTD 改善复盘报告。',
      })
    }
    if (q.includes('风险')) {
      actions.push({
        id: 'open-risk',
        label: '打开风险预警',
        type: 'navigate',
        targetRoute: '/risk',
        resultMessage: '已打开风险预警页面。',
      })
    }
  }

  if (engineeringDataIntent && (q.includes('排产') || q.includes('约束') || q.includes('如何') || q.includes('影响') || q.includes('解释'))) {
    actions.push({
      id: 'open-engineering-scheduling',
      label: '打开 AI 排产',
      type: 'navigate',
      targetRoute: '/scheduling',
      resultMessage: '已打开 AI 排产工作台，并定位到工程约束解释。',
    })
    actions.push({
      id: 'open-bom',
      label: '打开 BOM 管理',
      type: 'navigate',
      targetRoute: '/bom',
      resultMessage: '已打开 BOM 管理页面。',
    })
    actions.push({
      id: 'open-routing',
      label: '打开工艺路线',
      type: 'navigate',
      targetRoute: '/routing',
      resultMessage: '已打开工艺路线页面。',
    })
  }

  if (q.includes('重排') || q.includes('排产建议') || q.includes('生成建议')) {
    actions.push({
      id: 'generate-schedule-suggestion',
      label: '生成重排建议',
      type: 'schedule_suggestion',
      targetRoute: '/scheduling',
      resultMessage: '已进入 AI 排产，请在“三类事件重排队列”中复核 Agent 建议。',
    })
  }

  if (
    (q.includes('执行包') || q.includes('行动包') || q.includes('交期恢复') || q.includes('一键处置') || q.includes('恢复otd') || q.includes('恢复 otd'))
    && (q.includes('生成') || q.includes('创建') || q.includes('帮我') || q.includes('一键') || q.includes('恢复'))
  ) {
    actions.push({
      id: 'create-delivery-recovery-package',
      label: '生成交期恢复执行包',
      type: 'delivery_recovery_package',
      targetRoute: '/scheduling',
      requiredRole: 'Admin',
      auditCode: 'AUD-CHAT-RECOVERY-PACKAGE-20260521-001',
      resultMessage: '已生成 WO-RUSH-9001 交期恢复执行包，包含排产、风险、采购和质量四个责任动作。',
    })
  }

  if (q.includes('导出') || q.includes('报告') || q.includes('poc') || q.includes('复盘')) {
    actions.push({
      id: 'export-otd-report',
      label: '导出 OTD 复盘',
      type: 'export_report',
      targetRoute: '/report',
      resultMessage: '已生成 OTD/POC 复盘 CSV，并打开报表中心。',
    })
  }

  if ((q.includes('异常') || q.includes('处置卡') || q.includes('现场事件')) && (q.includes('创建') || q.includes('生成') || q.includes('上报'))) {
    actions.push({
      id: 'create-anomaly-card',
      label: '创建异常处置卡',
      type: 'create_anomaly_card',
      targetRoute: '/anomaly',
      requiredRole: 'Admin',
      auditCode: 'AUD-CHAT-ANOMALY-20260520',
      resultMessage: '已创建 WO-RUSH-9001 CNC 精加工现场异常处置卡，并打开异常管理现场事件中心。',
    })
  }

  return dedupeActions(actions)
}

function dedupeActions(actions: ChatAction[]): ChatAction[] {
  const seen = new Set<string>()
  return actions.filter(action => {
    if (seen.has(action.id)) return false
    seen.add(action.id)
    return true
  })
}

onMounted(async () => {
  try {
    const status = await getLlmStatus()
    if (status.provider === 'Ollama') {
      modelLabel.value = 'Ollama'
      modelFullLabel.value = `Ollama (${status.model})`
    } else {
      modelLabel.value = status.provider
      modelFullLabel.value = `${status.provider} / ${status.model}`
    }
  } catch {
    // LLM 状态不可用时静默忽略
  }
})

function getDemoSources(question = ''): KnowledgeSourceDto[] {
  const citationTrace = findAssistantCitationTrace(question)
  if (citationTrace) return citationTrace.sources
  return [
    { sourceId: 'demo-001', sourceName: '生产日报 2026-05-12', content: '', relevanceScore: 0.92 },
    { sourceId: 'demo-002', sourceName: '设备运行台账 Q2', content: '', relevanceScore: 0.85 },
    { sourceId: 'demo-003', sourceName: '质量月报 2026-04', content: '', relevanceScore: 0.78 },
  ]
}
</script>

<style scoped>
/* 遮罩层 */
.chat-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.3);
  z-index: 1000;
  display: flex;
  justify-content: flex-end;
}

/* 面板 */
.chat-panel {
  width: 400px;
  max-width: 100vw;
  height: 100vh;
  background: #fff;
  display: flex;
  flex-direction: column;
  box-shadow: -4px 0 20px rgba(0, 0, 0, 0.15);
}

/* 头部 */
.chat-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid #f0f0f0;
  background: #001529;
  color: #fff;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 8px;
}

.chat-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
}

.model-badge {
  font-size: 11px;
  padding: 1px 8px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.15);
  color: rgba(255, 255, 255, 0.85);
  cursor: help;
}

.close-btn {
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.65);
  font-size: 18px;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
  transition: all 0.2s;
  line-height: 1;
}

.close-btn:hover {
  color: #fff;
  background: rgba(255, 255, 255, 0.1);
}

/* 消息列表 */
.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 16px 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  background: #f8f9fb;
}

.message {
  display: flex;
  gap: 10px;
  max-width: 90%;
}

.message.user {
  align-self: flex-end;
  flex-direction: row-reverse;
}

.msg-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 700;
  flex-shrink: 0;
}

.message.assistant .msg-avatar {
  background: #1890ff;
  color: #fff;
}

.message.user .msg-avatar {
  background: #52c41a;
  color: #fff;
}

.msg-bubble {
  padding: 10px 14px;
  border-radius: 12px;
  font-size: 14px;
  line-height: 1.6;
  position: relative;
}

.message.assistant .msg-bubble {
  background: #fff;
  border: 1px solid #e8e8e8;
  border-top-left-radius: 4px;
}

.message.user .msg-bubble {
  background: #1890ff;
  color: #fff;
  border-top-right-radius: 4px;
}

.msg-content {
  word-break: break-word;
}

.msg-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 10px;
}

.action-package-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 10px;
}

.action-package-card {
  display: flex;
  flex-direction: column;
  gap: 7px;
  padding: 10px;
  border: 1px solid #bfdbfe;
  border-radius: 6px;
  background: #f8fbff;
}

.package-topline,
.package-metrics {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  align-items: center;
}

.package-topline {
  justify-content: space-between;
}

.action-package-card strong {
  color: #111827;
  font-size: 13px;
}

.action-package-card p,
.action-package-card li {
  margin: 0;
  color: #374151;
  font-size: 12px;
  line-height: 1.45;
}

.action-package-card ul {
  display: flex;
  flex-direction: column;
  gap: 5px;
  margin: 0;
  padding-left: 16px;
}

.package-topline span,
.package-metrics span {
  padding: 2px 6px;
  border-radius: 4px;
  background: #dbeafe;
  color: #1d4ed8;
  font-size: 11px;
  font-weight: 700;
}

.action-package-card code {
  color: #1e40af;
  font-size: 11px;
  word-break: break-all;
}

.action-btn {
  padding: 5px 9px;
  border: 1px solid #2563eb;
  border-radius: 4px;
  background: #eff6ff;
  color: #1d4ed8;
  cursor: pointer;
  font-size: 12px;
  font-weight: 700;
}

.action-btn:hover {
  background: #2563eb;
  color: #fff;
}

.msg-content :deep(pre) {
  background: #f5f5f5;
  padding: 8px 12px;
  border-radius: 6px;
  overflow-x: auto;
  font-size: 13px;
  margin: 8px 0;
}

.msg-content :deep(code) {
  font-family: 'SF Mono', 'Fira Code', monospace;
}

.msg-time {
  font-size: 11px;
  color: #bbb;
  margin-top: 4px;
}

.message.user .msg-time {
  color: rgba(255, 255, 255, 0.6);
}

/* 来源 */
.msg-sources {
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px solid #f0f0f0;
}

.sources-toggle {
  font-size: 12px;
  color: #1890ff;
  cursor: pointer;
  user-select: none;
}

.sources-toggle:hover {
  text-decoration: underline;
}

.sources-list {
  margin-top: 6px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.source-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 4px 8px;
  background: #f5f5f5;
  border-radius: 4px;
  font-size: 12px;
}

.source-name {
  color: #333;
  font-weight: 500;
}

.source-score {
  color: #52c41a;
  font-weight: 600;
}

/* 打字动画 */
.typing-dots {
  display: flex;
  gap: 2px;
  padding: 4px 0;
}

.typing-dots span {
  animation: blink 1.4s infinite;
  font-size: 24px;
  line-height: 1;
  color: #999;
}

.typing-dots span:nth-child(2) { animation-delay: 0.2s; }
.typing-dots span:nth-child(3) { animation-delay: 0.4s; }

@keyframes blink {
  0%, 80%, 100% { opacity: 0; }
  40% { opacity: 1; }
}

/* 空状态 */
.empty-chat {
  text-align: center;
  padding: 60px 20px;
  color: #ccc;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.empty-chat p {
  margin: 4px 0;
  font-size: 15px;
  color: #999;
}

.empty-hints {
  font-size: 13px !important;
  color: #bbb !important;
}

/* 输入区 */
.chat-input-area {
  padding: 12px 16px 16px;
  border-top: 1px solid #f0f0f0;
  background: #fff;
}

.input-wrapper {
  display: flex;
  gap: 8px;
  align-items: flex-end;
}

.chat-input {
  flex: 1;
  border: 1px solid #d9d9d9;
  border-radius: 8px;
  padding: 10px 12px;
  font-size: 14px;
  font-family: inherit;
  resize: none;
  outline: none;
  line-height: 1.5;
  max-height: 120px;
  transition: border-color 0.2s;
}

.chat-input:focus {
  border-color: #1890ff;
  box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.1);
}

.send-btn {
  padding: 8px 20px;
  background: #1890ff;
  color: #fff;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  cursor: pointer;
  white-space: nowrap;
  transition: background 0.2s;
  height: 40px;
}

.send-btn:hover:not(:disabled) {
  background: #40a9ff;
}

.send-btn:disabled {
  background: #d9d9d9;
  cursor: not-allowed;
}

.chat-error {
  font-size: 12px;
  color: #ff4d4f;
  margin-top: 6px;
  padding: 0 4px;
}

/* 滑入动画 */
.slide-enter-active {
  transition: all 0.25s ease-out;
}

.slide-leave-active {
  transition: all 0.2s ease-in;
}

.slide-enter-from,
.slide-leave-to {
  opacity: 0;
}

.slide-enter-from .chat-panel,
.slide-leave-to .chat-panel {
  transform: translateX(100%);
}
</style>
