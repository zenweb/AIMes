import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { addToast } from './stores/notifications'

// 注：axios 全局拦截器已统一收敛到 src/api/http.ts（含 401 → /auth/refresh → retry 流程）。
// 所有业务模块通过 import http from '@/api/http' 调用，不再使用裸 axios。

const app = createApp(App)

// 全局 Vue 运行时错误处理
app.config.errorHandler = (err, _instance, _info) => {
  const msg = err instanceof Error ? err.message : String(err)
  console.error('Vue runtime error:', err)
  addToast('error', '系统错误', msg)
}

// 全局未捕获 Promise 异常
window.addEventListener('unhandledrejection', (event) => {
  const msg = event.reason instanceof Error ? event.reason.message : String(event.reason || '未知错误')
  addToast('error', '未捕获异常', msg)
})

app.use(router)
app.mount('#app')
