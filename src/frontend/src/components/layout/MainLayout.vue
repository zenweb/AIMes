<template>
  <div class="mes-shell">
    <aside class="mes-sidebar">
      <NuxtLink to="/dashboard" class="brand-block">
        <div class="brand-mark">MES</div>
        <div>
          <div class="brand-name">AIMes</div>
          <div class="brand-sub">Professional Manufacturing OS</div>
        </div>
      </NuxtLink>

      <div class="plant-context">
        <span class="context-label">当前工厂</span>
        <strong>华东智能装配工厂</strong>
        <em>Line A03 · 离散装配 · V1.5 Pro</em>
      </div>

      <nav class="side-nav">
        <section v-for="group in navGroups" :key="group.name" class="nav-group">
          <div class="nav-group-title">{{ group.name }}</div>
          <NuxtLink
            v-for="item in group.items"
            :key="item.path"
            :to="item.path"
            class="side-link"
            :class="{ active: route.path === item.path }"
          >
            <i :class="item.icon ?? 'pi pi-circle'" aria-hidden="true"></i>
            <span>{{ item.label }}</span>
          </NuxtLink>
        </section>
      </nav>

      <div class="ai-status-card">
        <div class="ai-status-title">
          <span class="live-dot"></span>
          AI Agent Control
        </div>
        <div class="ai-status-text">18 个工单监控中，7 个约束冲突，3 个异常闭环等待复核。</div>
        <div class="ai-status-metrics">
          <span><strong>99.9%</strong>审计留痕</span>
          <span><strong>4</strong>动作待批</span>
        </div>
      </div>
    </aside>

    <div class="mes-main">
      <header class="mes-topbar">
        <button
          class="mobile-menu-btn lg:hidden"
          @click="menuOpen = !menuOpen"
          aria-label="菜单"
          :aria-expanded="menuOpen"
          aria-controls="mobile-nav-panel"
        >
          <i class="pi pi-bars"></i>
        </button>
        <div class="topbar-search">
          <i class="pi pi-search"></i>
          <PrimeInputText v-model="keyword" placeholder="搜索工单、设备、物料、异常、AI 决策记录" class="search-input" />
        </div>
        <div class="module-context" aria-label="当前模块">
          <span>{{ activeGroup }}</span>
          <strong>{{ activeItem?.label ?? 'AIMes' }}</strong>
          <em>{{ activeItem?.description ?? '后端可追溯、动作真落库、证据链可回放' }}</em>
        </div>
        <div class="topbar-actions">
          <PrimeTag :severity="connected ? 'success' : 'warn'" :value="connected ? '实时在线' : '离线'" />
          <span class="shift-chip">早班 08:00-20:00</span>
          <span class="audit-chip"><i class="pi pi-lock"></i> 证据链开启</span>
          <PrimeButton text rounded :icon="darkMode ? 'pi pi-sun' : 'pi pi-moon'" @click="toggleDark" />
          <span v-if="user" class="user-info">{{ user.displayName }}</span>
          <PrimeButton v-if="user" label="退出" severity="secondary" outlined size="small" @click="handleLogout" />
        </div>
      </header>

      <div v-if="menuOpen" id="mobile-nav-panel" class="mobile-nav-panel lg:hidden">
        <NuxtLink
          v-for="item in navItems"
          :key="item.path"
          :to="item.path"
          class="mobile-link"
          @click="menuOpen = false"
        >
          <i :class="item.icon ?? 'pi pi-circle'" aria-hidden="true"></i>
          <span>{{ item.label }}</span>
        </NuxtLink>
      </div>

      <section class="operation-ribbon" aria-label="生产运行状态">
        <div class="ribbon-item">
          <span>现场节拍</span>
          <strong>42s</strong>
          <em>目标 45s</em>
        </div>
        <div class="ribbon-item">
          <span>OTD 预测</span>
          <strong>30.00%</strong>
          <em>当前 runner</em>
        </div>
        <div class="ribbon-item warn">
          <span>风险队列</span>
          <strong>7</strong>
          <em>2 个高优先级</em>
        </div>
        <div class="ribbon-item ok">
          <span>动作落库</span>
          <strong>100%</strong>
          <em>Agent + AuditLog</em>
        </div>
      </section>

      <main class="content app-content">
        <slot />
      </main>
    </div>

    <ToastContainer :toasts="toasts" />

    <button class="chat-fab" @click="chatVisible = true" aria-label="打开AI助手">
      <span class="fab-icon">AI</span>
    </button>

    <ChatPanel :visible="chatVisible" @close="chatVisible = false" />
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuth } from '../../stores/auth'
import { useNotifications } from '../../stores/notifications'
import { navItems } from './nav-items'
import ChatPanel from '../chat/ChatPanel.vue'
import ToastContainer from '../notifications/ToastContainer.vue'
import './MainLayout.css'

const route = useRoute()
const router = useRouter()
const { user, isLoggedIn, logout } = useAuth()
const { toasts, connected, connect, disconnect } = useNotifications()
const chatVisible = ref(false)
const menuOpen = ref(false)
const keyword = ref('')

const activeItem = computed(() => navItems.find((item) => item.path === route.path))
const activeGroup = computed(() => activeItem.value?.group ?? '制造运营')

const navGroups = computed(() => {
  const groups = new Map<string, typeof navItems>()
  for (const item of navItems) {
    const group = item.group ?? '其他'
    groups.set(group, [...(groups.get(group) ?? []), item])
  }
  return Array.from(groups.entries()).map(([name, items]) => ({ name, items }))
})

const darkMode = ref(false)

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
  darkMode.value = localStorage.getItem('aimes_dark') === 'true'
  if (isLoggedIn.value) connect()
})

watch(isLoggedIn, (loggedIn) => {
  if (loggedIn) connect()
  else disconnect()
})

onUnmounted(() => disconnect())
</script>
