<template>
  <div class="mes-shell">
    <aside class="mes-sidebar">
      <NuxtLink to="/dashboard" class="brand-block">
        <div class="brand-mark">AI</div>
        <div>
          <div class="brand-name">AIMes</div>
          <div class="brand-sub">Manufacturing OS</div>
        </div>
      </NuxtLink>

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
            <span>{{ item.label }}</span>
          </NuxtLink>
        </section>
      </nav>

      <div class="ai-status-card">
        <div class="ai-status-title">AI Agent</div>
        <div class="ai-status-text">监控 18 个工单、7 个约束冲突、3 个异常闭环。</div>
      </div>
    </aside>

    <div class="mes-main">
      <header class="mes-topbar">
        <button class="mobile-menu-btn lg:hidden" @click="menuOpen = !menuOpen" aria-label="菜单">
          <i class="pi pi-bars"></i>
        </button>
        <div class="topbar-search">
          <i class="pi pi-search"></i>
          <PrimeInputText v-model="keyword" placeholder="搜索工单、设备、物料、异常、AI 决策记录" class="search-input" />
        </div>
        <div class="topbar-actions">
          <PrimeTag :severity="connected ? 'success' : 'warn'" :value="connected ? '实时在线' : '离线'" />
          <span class="shift-chip">早班 08:00-20:00</span>
          <PrimeButton text rounded :icon="darkMode ? 'pi pi-sun' : 'pi pi-moon'" @click="toggleDark" />
          <span v-if="user" class="user-info">{{ user.displayName }}</span>
          <PrimeButton v-if="user" label="退出" severity="secondary" outlined size="small" @click="handleLogout" />
        </div>
      </header>

      <div v-if="menuOpen" class="mobile-nav-panel lg:hidden">
        <NuxtLink
          v-for="item in navItems"
          :key="item.path"
          :to="item.path"
          class="mobile-link"
          @click="menuOpen = false"
        >
          {{ item.label }}
        </NuxtLink>
      </div>

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
import { useAuth } from '../../stores/auth'
import { useNotifications } from '../../stores/notifications'
import { navItems } from './nav-items'
import ChatPanel from '../chat/ChatPanel.vue'
import ToastContainer from '../notifications/ToastContainer.vue'
import './MainLayout.css'

const route = useRoute()
const { user, isLoggedIn, logout } = useAuth()
const { toasts, connected, connect, disconnect } = useNotifications()
const chatVisible = ref(false)
const menuOpen = ref(false)
const keyword = ref('')

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
  navigateTo('/login')
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
