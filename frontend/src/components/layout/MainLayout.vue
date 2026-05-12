<template>
  <div class="main-layout">
    <header class="topbar">
      <router-link to="/dashboard" class="logo-link">
        <div class="logo">AIMes</div>
      </router-link>
      <button class="menu-toggle" @click="menuOpen = !menuOpen" :class="{ open: menuOpen }" aria-label="菜单">
        <span class="bar"></span><span class="bar"></span><span class="bar"></span>
      </button>
      <nav class="nav" :class="{ open: menuOpen }">
        <router-link to="/dashboard" class="nav-link" @click="menuOpen = false">生产概览</router-link>
        <router-link to="/scheduling" class="nav-link" @click="menuOpen = false">排产甘特图</router-link>
<router-link to="/risk" class="nav-link risk-nav-link" @click="menuOpen = false">🔍 风险预警</router-link>
        <router-link to="/quality" class="nav-link" @click="menuOpen = false">质量管理</router-link>
        <router-link to="/equipment" class="nav-link" @click="menuOpen = false">设备管理</router-link>
        <router-link to="/production" class="nav-link" @click="menuOpen = false">生产报工</router-link>
        <router-link to="/bom" class="nav-link" @click="menuOpen = false">BOM 管理</router-link>
        <router-link to="/routing" class="nav-link" @click="menuOpen = false">工艺路线</router-link>
        <router-link to="/anomaly" class="nav-link" @click="menuOpen = false">异常管理</router-link>
        <router-link to="/knowledge/documents" class="nav-link" @click="menuOpen = false">文档上传</router-link>
        <router-link to="/inventory" class="nav-link" @click="menuOpen = false">库存管理</router-link>
        <router-link to="/purchase" class="nav-link" @click="menuOpen = false">采购管理</router-link>
        <router-link to="/employee" class="nav-link" @click="menuOpen = false">人员管理</router-link>
        <router-link to="/barcode" class="nav-link" @click="menuOpen = false">条码打印</router-link>
        <router-link to="/admin" class="nav-link" @click="menuOpen = false">系统管理</router-link>
        <router-link to="/audit-logs" class="nav-link" @click="menuOpen = false">审计日志</router-link>
        <router-link to="/report" class="nav-link" @click="menuOpen = false">报表中心</router-link>
      </nav>
      <div class="topbar-right">
        <span v-if="connected" class="conn-dot live" title="实时连接"></span>
        <button class="dark-toggle" @click="toggleDark" :title="darkMode ? '浅色模式' : '深色模式'">
          {{ darkMode ? '☀' : '☾' }}
        </button>
        <span v-if="user" class="user-info">{{ user.displayName }}</span>
        <button v-if="user" class="logout-btn" @click="handleLogout">退出</button>
      </div>
    </header>
    <main class="content">
      <slot />
    </main>

    <ToastContainer :toasts="toasts" />

    <!-- AI 助手浮动按钮 -->
    <button class="chat-fab" @click="chatVisible = true" aria-label="打开AI助手">
      <span class="fab-icon">AI</span>
    </button>

    <!-- 聊天面板 -->
    <ChatPanel :visible="chatVisible" @close="chatVisible = false" />
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '../../stores/auth'
import { useNotifications } from '../../stores/notifications'
import ChatPanel from '../chat/ChatPanel.vue'
import ToastContainer from '../notifications/ToastContainer.vue'

const router = useRouter()
const { user, isLoggedIn, logout } = useAuth()
const { toasts, connected, connect, disconnect } = useNotifications()
const chatVisible = ref(false)
const menuOpen = ref(false)

// 深色模式
const darkMode = ref(localStorage.getItem('aimes_dark') === 'true')

function toggleDark() {
  darkMode.value = !darkMode.value
  localStorage.setItem('aimes_dark', String(darkMode.value))
  document.documentElement.classList.toggle('dark', darkMode.value)
}

watch(darkMode, (val) => {
  document.documentElement.classList.toggle('dark', val)
}, { immediate: true })

function handleLogout() {
  disconnect()
  logout()
  router.push('/login')
}

onMounted(() => {
  // 已登录则建立 SignalR 连接
  if (isLoggedIn.value) connect()
})

// 登录状态变化时连接/断开
watch(isLoggedIn, (loggedIn) => {
  if (loggedIn) connect()
  else disconnect()
})

onUnmounted(() => disconnect())
</script>

<style>
/* 主题变量 */
:root {
  --bg-primary: #f5f5f5;
  --bg-secondary: #fff;
  --bg-card: #fff;
  --text-primary: #333;
  --text-secondary: #666;
  --border-color: #e8e8e8;
  --shadow: 0 1px 4px rgba(0,0,0,0.06);
}

:root.dark {
  --bg-primary: #141414;
  --bg-secondary: #1f1f1f;
  --bg-card: #262626;
  --text-primary: #e0e0e0;
  --text-secondary: #a0a0a0;
  --border-color: #333;
  --shadow: 0 1px 4px rgba(0,0,0,0.3);
}

/* 全局重置 */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'PingFang SC',
    'Microsoft YaHei', sans-serif;
  font-size: 14px;
  color: var(--text-primary);
  background: var(--bg-primary);
  transition: background 0.2s, color 0.2s;
}

/* 页面通用 header */
.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px 0;
}

.page-header .page-title {
  margin: 0;
}

.btn-export {
  padding: 4px 14px;
  border: 1px solid #d9d9d9;
  background: #fff;
  border-radius: 4px;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
  color: #333;
}

.btn-export:hover {
  color: #1890ff;
  border-color: #1890ff;
}

/* 全局暗色兼容 — 覆盖各页面硬编码颜色 */
:root.dark .kpi-card,
:root.dark .list-item,
:root.dark .detail-panel,
:root.dark .emp-card,
:root.dark .anomaly-card,
:root.dark .modal-content,
:root.dark .drop-zone,
:root.dark .doc-row,
:root.dark .section {
  background: var(--bg-card) !important;
  color: var(--text-primary) !important;
  border-color: var(--border-color) !important;
}

:root.dark .page-title,
:root.dark .detail-header h3 {
  color: var(--text-primary) !important;
}

:root.dark .kpi-card .num,
:root.dark .item-sub,
:root.dark .detail-meta label,
:root.dark .item-info {
  color: var(--text-secondary) !important;
}

:root.dark input,
:root.dark select {
  background: var(--bg-secondary);
  color: var(--text-primary);
  border-color: var(--border-color);
}

:root.dark table {
  color: var(--text-primary);
}

:root.dark table thead {
  background: var(--bg-secondary);
}

:root.dark .toolbar {
  background: var(--bg-primary);
}

/* dhtmlx-gantt 全局样式调整 */
.gantt_task_line.gantt-task-conflict {
  border-color: #ff4d4f !important;
  background: #ffccc7 !important;
}

.gantt_task_line.gantt-task-scheduled {
  border-color: #91d5ff;
  background: #bae7ff;
}

.gantt_task_line.gantt-task-bottleneck {
  border-color: #ffa39e;
  background: #ffccc7;
}

.gantt_task_line.gantt-task-bottleneck .gantt_task_content {
  font-weight: 600;
}

.gantt_tree_content {
  font-size: 13px;
}

/* 冲突任务: 红色边框 + 斜线背景 */
.gantt_task_line.gantt-task-conflict {
  border-color: #ff4d4f !important;
  background: repeating-linear-gradient(
    45deg,
    #ffccc7,
    #ffccc7 4px,
    #ffd8bf 4px,
    #ffd8bf 8px
  ) !important;
  box-shadow: 0 0 6px rgba(255, 77, 79, 0.5) !important;
}
</style>

<style scoped>
.main-layout {
  display: flex;
  flex-direction: column;
  height: 100vh;
}

.topbar {
  height: 50px;
  background: #001529;
  display: flex;
  align-items: center;
  padding: 0 16px;
  gap: 16px;
  position: relative;
}

.logo-link {
  text-decoration: none;
  flex-shrink: 0;
}

.logo {
  color: #fff;
  font-size: 18px;
  font-weight: 700;
  white-space: nowrap;
  letter-spacing: 1px;
}

/* 汉堡菜单按钮 */
.menu-toggle {
  display: none;
  flex-direction: column;
  gap: 4px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  flex-shrink: 0;
}

.menu-toggle .bar {
  width: 20px;
  height: 2px;
  background: rgba(255, 255, 255, 0.65);
  border-radius: 2px;
  transition: all 0.25s;
}

.menu-toggle.open .bar:nth-child(1) { transform: rotate(45deg) translate(4px, 4px); }
.menu-toggle.open .bar:nth-child(2) { opacity: 0; }
.menu-toggle.open .bar:nth-child(3) { transform: rotate(-45deg) translate(4px, -4px); }

.nav {
  display: flex;
  gap: 4px;
  overflow-x: auto;
  scrollbar-width: none;
  -ms-overflow-style: none;
  flex: 1;
}
.nav::-webkit-scrollbar { display: none; }

.nav-link {
  color: rgba(255, 255, 255, 0.65);
  text-decoration: none;
  padding: 4px 10px;
  border-radius: 4px;
  font-size: 13px;
  transition: all 0.2s;
  white-space: nowrap;
  flex-shrink: 0;
}

.nav-link:hover,
.nav-link.active {
  color: #fff;
  background: rgba(255, 255, 255, 0.1);
}

.topbar-right {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-left: auto;
  flex-shrink: 0;
}

.user-info {
  color: rgba(255, 255, 255, 0.65);
  font-size: 13px;
}

.conn-dot {
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #52c41a;
  box-shadow: 0 0 6px rgba(82, 196, 26, 0.6);
}

.conn-dot.live {
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.dark-toggle {
  background: none;
  border: none;
  font-size: 16px;
  cursor: pointer;
  padding: 2px 6px;
  line-height: 1;
  color: rgba(255, 255, 255, 0.65);
  transition: all 0.2s;
}

.dark-toggle:hover {
  color: #fff;
  transform: scale(1.15);
}

.logout-btn {
  padding: 4px 12px;
  background: none;
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: rgba(255, 255, 255, 0.65);
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.logout-btn:hover {
  color: #fff;
  border-color: rgba(255, 255, 255, 0.6);
  background: rgba(255, 255, 255, 0.1);
}

.content {
  flex: 1;
  overflow: hidden;
  background: var(--bg-primary);
  color: var(--text-primary);
  transition: background 0.2s, color 0.2s;
}

/* AI 助手浮动按钮 */
.chat-fab {
  position: fixed;
  right: 24px;
  bottom: 24px;
  width: 52px;
  height: 52px;
  border-radius: 50%;
  background: #1890ff;
  color: #fff;
  border: none;
  box-shadow: 0 4px 14px rgba(24, 144, 255, 0.4);
  cursor: pointer;
  z-index: 900;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.chat-fab:hover {
  background: #40a9ff;
  transform: scale(1.08);
  box-shadow: 0 6px 20px rgba(24, 144, 255, 0.5);
}

.fab-icon {
  font-size: 14px;
  font-weight: 700;
  letter-spacing: 0.5px;
}

/* 响应式：窄屏切换为下拉菜单 */
@media (max-width: 900px) {
  .menu-toggle { display: flex; }

  .nav {
    display: none;
    position: absolute;
    top: 50px;
    left: 0;
    right: 0;
    background: #001529;
    flex-direction: column;
    padding: 8px 0;
    gap: 0;
    overflow-y: auto;
    max-height: calc(100vh - 50px);
    z-index: 500;
    box-shadow: 0 8px 16px rgba(0,0,0,0.3);
  }

  .nav.open { display: flex; }

  .nav-link {
    padding: 10px 20px;
    font-size: 14px;
    border-bottom: 1px solid rgba(255,255,255,0.05);
  }
}
</style>
