<template>
  <div class="login-page">
    <div class="login-card">
      <div class="login-header">
        <div class="login-logo">AIMes</div>
        <h2>智能制造执行系统</h2>
        <p class="login-subtitle">请登录以继续</p>
      </div>

      <div v-if="passwordChangedNotice" class="login-success" role="status" aria-live="polite">
        密码已更新，请使用新密码重新登录
      </div>

      <form class="login-form" @submit.prevent="handleLogin">
        <div class="form-group">
          <label for="username">用户名</label>
          <input
            id="username"
            ref="usernameInput"
            v-model="username"
            type="text"
            :placeholder="usernamePlaceholder"
            :disabled="loading"
            autocomplete="username"
            @input="clearError"
            :aria-invalid="usernameFieldInvalid ? 'true' : undefined"
            :aria-describedby="usernameFieldInvalid ? 'login-error' : undefined"
          />
        </div>
        <div class="form-group">
          <label for="password">密码</label>
          <input
            id="password"
            ref="passwordInput"
            v-model="password"
            type="password"
            :placeholder="passwordPlaceholder"
            :disabled="loading"
            autocomplete="current-password"
            @input="clearError"
            :aria-invalid="passwordFieldInvalid ? 'true' : undefined"
            :aria-describedby="passwordFieldInvalid ? 'login-error' : undefined"
          />
        </div>

        <div v-if="error" id="login-error" class="login-error" role="alert" aria-live="assertive">
          {{ error }}
        </div>

        <button
          type="submit"
          class="login-btn"
          :disabled="loading || !canSubmit"
          :aria-busy="loading ? 'true' : undefined"
        >
          {{ loading ? '登录中...' : '登 录' }}
        </button>
      </form>

      <div v-if="showDemoHints" class="login-hints">
        <p class="hint-title">演示账号 / Demo accounts <span class="hint-badge">仅评估环境显示</span></p>
        <p class="hint-note">
          离线演示入口不连接后端认证。Offline demo login skips live backend authentication.
          <a class="login-help-link" href="#login-demo-help">帮助 / Help</a>
        </p>
        <div class="hint-row"><span>admin</span><span>admin123</span><span>管理员</span></div>
        <div class="hint-row"><span>operator</span><span>operator-demo-2026</span><span>操作员</span></div>
        <div class="hint-row"><span>engineer</span><span>engineer-demo-2026</span><span>工程师</span></div>
        <div class="hint-row"><span>lead</span><span>lead-demo-2026</span><span>组长</span></div>
        <div id="login-demo-help" class="hint-help">
          真实后端登录需要 API 与数据库种子在线；Live backend login requires the API and seeded database.
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuth } from '../../stores/auth'

const router = useRouter()
const route = useRoute()
const { login } = useAuth()

// 演示账号 hint：只在 dev 模式或显式启用 VITE_SHOW_DEMO_HINTS 时显示。
// 生产部署不应直接告诉所有访客默认账号——但开源 docker compose 演示场景需要。
const explicitDemoMode = computed(() => {
  const value = route.query.offlineDemo ?? route.query.demoMode
  return value === '1' || value === 'true' || value === 'offline'
})
const showDemoHints = computed(() => explicitDemoMode.value || import.meta.env.DEV || import.meta.env.VITE_SHOW_DEMO_HINTS === 'true')

// placeholder 同样区分演示/生产。生产环境不在 input placeholder 里泄漏凭证示例。
const usernamePlaceholder = computed(() => showDemoHints.value ? 'admin / operator / engineer / lead' : '请输入用户名')
const passwordPlaceholder = computed(() => showDemoHints.value ? '见下方演示账号' : '请输入密码')

const username = ref('')
const password = ref('')
const usernameInput = ref<HTMLInputElement | null>(null)
const passwordInput = ref<HTMLInputElement | null>(null)
const loading = ref(false)
const error = ref('')
const usernameFieldInvalid = ref(false)
const passwordFieldInvalid = ref(false)
const canSubmit = computed(() => Boolean(username.value.trim() && password.value.trim()))
const passwordChangedNotice = computed(() => route.query.passwordChanged === '1')
const redirectAfterLogin = computed(() => {
  const redirect = route.query.redirect
  return typeof redirect === 'string' && redirect.startsWith('/') && !redirect.startsWith('//')
    ? redirect
    : '/dashboard'
})

function clearError() {
  if (error.value) {
    error.value = ''
    usernameFieldInvalid.value = false
    passwordFieldInvalid.value = false
  }
}

async function handleLogin() {
  error.value = ''
  usernameFieldInvalid.value = false
  passwordFieldInvalid.value = false
  let focusPasswordAfterLogin = false
  const trimmedUsername = username.value.trim()
  const trimmedPassword = password.value.trim()
  if (!trimmedUsername || !trimmedPassword) {
    error.value = '请输入用户名和密码'
    usernameFieldInvalid.value = !trimmedUsername
    passwordFieldInvalid.value = !trimmedPassword
    await nextTick()
    if (!trimmedUsername) {
      usernameInput.value?.focus()
    } else {
      passwordInput.value?.focus()
    }
    return
  }
  loading.value = true
  try {
    const user = await login(trimmedUsername, trimmedPassword)
    await router.push(user?.mustChangePassword ? { path: '/change-password' } : redirectAfterLogin.value)
  } catch (e) {
    error.value = e instanceof Error ? e.message : '登录失败'
    password.value = ''
    usernameFieldInvalid.value = true
    passwordFieldInvalid.value = true
    focusPasswordAfterLogin = true
  } finally {
    loading.value = false
  }
  if (focusPasswordAfterLogin) {
    await nextTick()
    passwordInput.value?.focus()
  }
}
</script>

<style scoped>
.login-page {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #001529 0%, #003a70 50%, #1890ff 100%);
  padding: 20px;
}

.login-card {
  width: 380px;
  max-width: 100%;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  overflow: hidden;
}

.login-header {
  text-align: center;
  padding: 32px 24px 24px;
}

.login-logo {
  display: inline-block;
  font-size: 28px;
  font-weight: 800;
  color: #1890ff;
  letter-spacing: 2px;
  margin-bottom: 12px;
}

.login-header h2 {
  margin: 0 0 4px;
  font-size: 18px;
  color: #333;
}

.login-subtitle {
  margin: 0;
  font-size: 14px;
  color: #999;
}

.login-success {
  margin: 0 24px 16px;
  padding: 10px 12px;
  border-radius: 8px;
  background: #f6ffed;
  color: #52c41a;
  font-size: 13px;
}

.login-form {
  padding: 0 24px 24px;
}

.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  font-size: 13px;
  color: #555;
  margin-bottom: 6px;
  font-weight: 500;
}

.form-group input {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #d9d9d9;
  border-radius: 6px;
  font-size: 14px;
  outline: none;
  transition: border-color 0.2s;
  box-sizing: border-box;
}

.form-group input:focus {
  border-color: #1890ff;
  box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.1);
}

.login-error {
  padding: 8px 12px;
  background: #fff2f0;
  color: #ff4d4f;
  border-radius: 4px;
  font-size: 13px;
  margin-bottom: 12px;
}

.login-btn {
  width: 100%;
  padding: 10px;
  background: #1890ff;
  color: #fff;
  border: none;
  border-radius: 6px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}

.login-btn:hover:not(:disabled) {
  background: #40a9ff;
}

.login-btn:disabled {
  background: #d9d9d9;
  cursor: not-allowed;
}

.login-hints {
  padding: 12px 24px 20px;
  background: #fafafa;
  border-top: 1px solid #f0f0f0;
}

.hint-title {
  margin: 0 0 8px;
  font-size: 12px;
  color: #bbb;
  text-align: center;
}

.hint-note,
.hint-help {
  margin: 0 0 8px;
  font-size: 12px;
  line-height: 1.5;
  color: #666;
}

.login-help-link {
  color: #1890ff;
  font-weight: 600;
}

.hint-row {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 8px;
  font-size: 12px;
  color: #999;
  padding: 3px 0;
  font-family: 'SF Mono', 'Fira Code', monospace;
}

.hint-row span:last-child {
  color: #bbb;
  text-align: right;
}
</style>
