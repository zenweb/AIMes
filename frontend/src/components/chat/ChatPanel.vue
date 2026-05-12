<template>
  <Transition name="slide">
    <div v-if="visible" class="chat-overlay" @click.self="$emit('close')">
      <div class="chat-panel">
        <!-- 头部 -->
        <div class="chat-header">
          <h3>AI 生产助手</h3>
          <button class="close-btn" @click="$emit('close')" aria-label="关闭聊天">✕</button>
        </div>

        <!-- 消息列表 -->
        <div class="chat-messages" ref="messagesRef">
          <div v-for="msg in messages" :key="msg.id" class="message" :class="msg.role">
            <div class="msg-avatar">{{ msg.role === 'user' ? 'U' : 'AI' }}</div>
            <div class="msg-bubble">
              <div class="msg-content" v-html="renderMarkdown(msg.content)"></div>
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
import { ref, watch, nextTick } from 'vue'
import { queryKnowledge, getChatHistory } from '../../api/knowledge'
import type { ChatMessage, KnowledgeSourceDto, KnowledgeQueryResponse } from '../../types/knowledge'

const props = defineProps<{ visible: boolean }>()
defineEmits<{ close: [] }>()

const messages = ref<ChatMessage[]>([])
const inputText = ref('')
const loading = ref(false)
const error = ref('')
const sessionId = ref(`session-${Date.now()}`)
const expandedSources = ref(new Set<string>())
const messagesRef = ref<HTMLElement | null>(null)

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

function renderMarkdown(text: string): string {
  return text
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

function addMessage(role: 'user' | 'assistant', content: string, sources?: KnowledgeSourceDto[]) {
  messages.value.push({
    id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    role,
    content,
    sources,
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
    addMessage('assistant', res.answer, res.sources)
  } catch {
    // 后端不可用 — 演示回复
    addMessage('assistant', getDemoReply(text), getDemoSources())
  } finally {
    loading.value = false
    await nextTick()
    scrollToBottom()
  }
}

// ====== 演示数据 ======

function getDemoReply(question: string): string {
  const q = question.toLowerCase()
  if (q.includes('产能') || q.includes('利用率')) {
    return '当前车间整体设备利用率为 **72%**。瓶颈设备 CNC-001 利用率达 85%，建议优化该设备的排产策略。热处理炉当前利用率 45%，仍有较大富余产能。'
  }
  if (q.includes('质量') || q.includes('合格率')) {
    return '本月质检合格率为 **94%**（42/45 批次）。主要缺陷类型为表面粗糙度超差（3 例）和尺寸偏差（2 例）。当前有 **3 项待处理异常**，建议优先处理 CNC-002 的尺寸偏移问题。'
  }
  if (q.includes('工单') || q.includes('订单')) {
    return '当前有 **8 个工单** 处于进行中状态。今日排产 5 个工单：WO-001（精密转接座）、WO-005（基座加工）、WO-008（外壳注塑）已完成，WO-013（淬火热处理）和 WO-009（面板注塑）待生产。'
  }
  if (q.includes('物料') || q.includes('库存') || q.includes('缺料')) {
    return '当前有 **3 项物料预警**：\n- 🔴 **铝合金 6061**：库存 180 kg，低于安全库存 200 kg\n- 🟡 **抗磨液压油**：库存 35 L，低于安全库存 50 L\n- 🟡 **6205 轴承**：库存 85 个，低于安全库存 100 个\n建议今日完成铝合金 6061 采购下单。'
  }
  if (q.includes('设备') || q.includes('状态')) {
    return '当前 **8 台设备** 中：\n- 🟢 运行中：4 台（CNC-001、CNC-002、注塑机-1号、装配线-1号）\n- 🟡 空闲：3 台（CNC-003、装配线-2号、热处理炉）\n- 🔴 停机：1 台（注塑机-2号，维护中）\n瓶颈设备：CNC-001（利用率 85%）。'
  }
  return '感谢您的提问！根据当前生产数据分析：\n\n- 今日整体排产达成率 **86%**\n- 设备综合利用率 **72%**\n- 质量合格率 **94%**\n\n如需更详细的分析，请提供更具体的问题描述，例如："CNC-001 的设备利用率趋势如何？"'
}

function getDemoSources(): KnowledgeSourceDto[] {
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

.chat-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
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
