import { addToast } from '@/stores/notifications'

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.config.errorHandler = (err) => {
    const msg = err instanceof Error ? err.message : String(err)
    addToast('error', '系统错误', msg)
  }

  window.addEventListener('unhandledrejection', (event) => {
    const msg = event.reason instanceof Error ? event.reason.message : String(event.reason || '未知错误')
    addToast('error', '未捕获异常', msg)
  })
})
