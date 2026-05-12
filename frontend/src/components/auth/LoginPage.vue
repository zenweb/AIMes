<template>
  <div class="login-page">
    <div class="login-card">
      <div class="login-header">
        <div class="login-logo">AIMes</div>
        <h2>智能制造执行系统</h2>
        <p class="login-subtitle">请登录以继续</p>
      </div>

      <form class="login-form" @submit.prevent="handleLogin">
        <div class="form-group">
          <label for="username">用户名</label>
          <input
            id="username"
            v-model="username"
            type="text"
            placeholder="admin / operator / engineer / lead"
            :disabled="loading"
            autocomplete="username"
          />
        </div>
        <div class="form-group">
          <label for="password">密码</label>
          <input
            id="password"
            v-model="password"
            type="password"
            placeholder="admin123 / 123456"
            :disabled="loading"
            autocomplete="current-password"
          />
        </div>

        <div v-if="error" class="login-error">{{ error }}</div>

        <button type="submit" class="login-btn" :disabled="loading || !username || !password">
          {{ loading ? '登录中...' : '登 录' }}
        </button>
      </form>

      <div class="login-hints">
        <p class="hint-title">演示账号</p>
        <div class="hint-row"><span>admin</span><span>admin123</span><span>管理员</span></div>
        <div class="hint-row"><span>operator</span><span>123456</span><span>操作员</span></div>
        <div class="hint-row"><span>engineer</span><span>123456</span><span>工程师</span></div>
        <div class="hint-row"><span>lead</span><span>123456</span><span>组长</span></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '../../stores/auth'

const router = useRouter()
const { login } = useAuth()

const username = ref('')
const password = ref('')
const loading = ref(false)
const error = ref('')

async function handleLogin() {
  error.value = ''
  loading.value = true
  try {
    await login(username.value, password.value)
    router.push('/dashboard')
  } catch (e) {
    error.value = e instanceof Error ? e.message : '登录失败'
  } finally {
    loading.value = false
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
