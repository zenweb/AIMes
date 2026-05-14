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
        <router-link
          v-for="item in navItems"
          :key="item.path"
          :to="item.path"
          class="nav-link"
          :class="{ 'risk-nav-link': item.path === '/risk' }"
          @click="menuOpen = false"
        >{{ item.label }}</router-link>
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

    <ChatPanel :visible="chatVisible" @close="chatVisible = false" />
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '../../stores/auth'
import { useNotifications } from '../../stores/notifications'
import { navItems } from './nav-items'
import ChatPanel from '../chat/ChatPanel.vue'
import ToastContainer from '../notifications/ToastContainer.vue'
import './MainLayout.css'

const router = useRouter()
const { user, isLoggedIn, logout } = useAuth()
const { toasts, connected, connect, disconnect } = useNotifications()
const chatVisible = ref(false)
const menuOpen = ref(false)

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
  if (isLoggedIn.value) connect()
})

watch(isLoggedIn, (loggedIn) => {
  if (loggedIn) connect()
  else disconnect()
})

onUnmounted(() => disconnect())
</script>
