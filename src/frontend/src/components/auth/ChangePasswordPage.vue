<template>
  <div class="change-password-page">
    <div class="change-password-card">
      <div class="change-password-header">
        <div class="change-password-logo">AIMes</div>
        <h2>修改初始密码</h2>
        <p class="change-password-subtitle">当前账号必须先完成密码轮换</p>
      </div>

      <div class="user-pill" v-if="username">
        当前账号：<strong>{{ username }}</strong>
      </div>

      <form class="change-password-form" @submit.prevent="handleSubmit">
        <div class="form-group">
          <label for="currentPassword">当前密码</label>
          <input
            id="currentPassword"
            ref="currentPasswordInput"
            v-model="currentPassword"
            type="password"
            autocomplete="current-password"
            :disabled="loading"
            @input="clearError"
            :aria-invalid="currentPasswordInvalid ? 'true' : undefined"
            :aria-describedby="currentPasswordInvalid ? 'change-password-error' : undefined"
          />
        </div>
        <div class="form-group">
          <label for="newPassword">新密码</label>
          <input
            id="newPassword"
            ref="newPasswordInput"
            v-model="newPassword"
            type="password"
            autocomplete="new-password"
            :disabled="loading"
            @input="clearError"
            :aria-invalid="newPasswordInvalid ? 'true' : undefined"
            :aria-describedby="newPasswordInvalid ? 'change-password-error' : undefined"
          />
        </div>
        <div class="form-group">
          <label for="confirmPassword">确认新密码</label>
          <input
            id="confirmPassword"
            ref="confirmPasswordInput"
            v-model="confirmPassword"
            type="password"
            autocomplete="new-password"
            :disabled="loading"
            @input="clearError"
            :aria-invalid="confirmPasswordInvalid ? 'true' : undefined"
            :aria-describedby="confirmPasswordInvalid ? 'change-password-error' : undefined"
          />
        </div>

        <div v-if="error" id="change-password-error" class="change-password-error" role="alert" aria-live="assertive">
          {{ error }}
        </div>

        <button type="submit" class="change-password-btn" :disabled="loading || !canSubmit" :aria-busy="loading ? 'true' : undefined">
          {{ loading ? '提交中...' : '提 交' }}
        </button>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, ref } from 'vue'
import { useRouter } from 'vue-router'
import { changePassword } from '../../api/auth'
import { useAuth } from '../../stores/auth'

const router = useRouter()
const auth = useAuth()

const username = computed(() => auth.user.value?.username ?? '')

const currentPassword = ref('')
const newPassword = ref('')
const confirmPassword = ref('')
const currentPasswordInput = ref<HTMLInputElement | null>(null)
const newPasswordInput = ref<HTMLInputElement | null>(null)
const confirmPasswordInput = ref<HTMLInputElement | null>(null)
const loading = ref(false)
const error = ref('')
const currentPasswordInvalid = ref(false)
const newPasswordInvalid = ref(false)
const confirmPasswordInvalid = ref(false)
const canSubmit = computed(() => Boolean(username.value.trim() && currentPassword.value.trim() && newPassword.value.trim() && confirmPassword.value.trim()))

function clearError() {
  if (!error.value) return
  error.value = ''
  currentPasswordInvalid.value = false
  newPasswordInvalid.value = false
  confirmPasswordInvalid.value = false
}

async function handleSubmit() {
  error.value = ''
  currentPasswordInvalid.value = false
  newPasswordInvalid.value = false
  confirmPasswordInvalid.value = false

  const trimmedCurrentPassword = currentPassword.value.trim()
  const trimmedNewPassword = newPassword.value.trim()
  const trimmedConfirmPassword = confirmPassword.value.trim()

  if (!username.value.trim()) {
    error.value = '当前登录信息已失效，请重新登录'
    await router.push('/login')
    return
  }

  if (!trimmedCurrentPassword || !trimmedNewPassword || !trimmedConfirmPassword) {
    error.value = '请完整填写当前密码、新密码和确认密码'
    currentPasswordInvalid.value = !trimmedCurrentPassword
    newPasswordInvalid.value = !trimmedNewPassword
    confirmPasswordInvalid.value = !trimmedConfirmPassword
    await nextTick()
    if (!trimmedCurrentPassword) {
      currentPasswordInput.value?.focus()
    } else if (!trimmedNewPassword) {
      newPasswordInput.value?.focus()
    } else {
      confirmPasswordInput.value?.focus()
    }
    return
  }

  if (trimmedNewPassword !== trimmedConfirmPassword) {
    error.value = '两次输入的新密码不一致'
    newPasswordInvalid.value = true
    confirmPasswordInvalid.value = true
    await nextTick()
    confirmPasswordInput.value?.focus()
    return
  }

  loading.value = true
  try {
    await changePassword({
      username: username.value.trim(),
      currentPassword: trimmedCurrentPassword,
      newPassword: trimmedNewPassword,
    })
    auth.logout()
    await router.push({ path: '/login', query: { passwordChanged: '1' } })
  } catch (e) {
    error.value = e instanceof Error ? e.message : '密码修改失败'
    currentPasswordInvalid.value = true
    newPasswordInvalid.value = true
    confirmPasswordInvalid.value = true
    loading.value = false
    await nextTick()
    currentPasswordInput.value?.focus()
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.change-password-page {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #001529 0%, #003a70 50%, #1890ff 100%);
  padding: 20px;
}

.change-password-card {
  width: 420px;
  max-width: 100%;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  overflow: hidden;
}

.change-password-header {
  text-align: center;
  padding: 32px 24px 18px;
}

.change-password-logo {
  display: inline-block;
  font-size: 28px;
  font-weight: 800;
  color: #1890ff;
  letter-spacing: 2px;
  margin-bottom: 12px;
}

.change-password-header h2 {
  margin: 0 0 4px;
  font-size: 18px;
  color: #333;
}

.change-password-subtitle {
  margin: 0;
  font-size: 14px;
  color: #999;
}

.user-pill {
  margin: 0 24px 16px;
  padding: 10px 12px;
  border-radius: 8px;
  background: #f6f8fb;
  color: #4b5563;
  font-size: 13px;
}

.change-password-form {
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

.change-password-error {
  padding: 8px 12px;
  background: #fff2f0;
  color: #ff4d4f;
  border-radius: 4px;
  font-size: 13px;
  margin-bottom: 12px;
}

.change-password-btn {
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

.change-password-btn:hover:not(:disabled) {
  background: #40a9ff;
}

.change-password-btn:disabled {
  background: #d9d9d9;
  cursor: not-allowed;
}
</style>
