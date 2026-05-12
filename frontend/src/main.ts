import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import axios from 'axios'
import { addToast } from './stores/notifications'

// Axios 拦截器 — 自动附加 Authorization header
axios.interceptors.request.use((config) => {
  const token = localStorage.getItem('aimes_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('aimes_token')
      localStorage.removeItem('aimes_user')
      if (window.location.pathname !== '/scheduling/login') {
        window.location.href = '/scheduling/login'
      }
      return Promise.reject(error)
    }

    // 全局 API 错误提示
    const msg =
      error.response?.data?.message ||
      error.response?.data?.title ||
      (typeof error.response?.data === 'string' ? error.response.data : null) ||
      error.message ||
      '请求失败'

    addToast('error', '请求错误', msg)
    return Promise.reject(error)
  }
)

const app = createApp(App)

// 全局 Vue 运行时错误处理
app.config.errorHandler = (err, _instance, _info) => {
  const msg = err instanceof Error ? err.message : String(err)
  addToast('error', '系统错误', msg)
}

// 全局未捕获 Promise 异常
window.addEventListener('unhandledrejection', (event) => {
  const msg = event.reason instanceof Error ? event.reason.message : String(event.reason || '未知错误')
  addToast('error', '未捕获异常', msg)
})

app.use(router)
app.mount('#app')
