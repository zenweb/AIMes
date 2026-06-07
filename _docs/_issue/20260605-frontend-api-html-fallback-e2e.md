# 2026-06-05 Issue - API HTML Fallback Breaks Demo Main Route

## 现象
- `demo-smoke.spec.ts` 的 `Dashboard -> Scheduling -> Audit -> Report 可回放` 曾在审计页或报表页出现空 `main`。
- 旧失败包含 `Cannot read properties of undefined (reading 'length')`。

## 根因
- E2E 的 init script 会在新页面 document 中重新设置 `aimes_offline_demo=false`。
- 在 Nuxt preview 且无后端 API 时，`/api/v1/...` 会落到 SPA HTML fallback。
- 前端将 HTML 字符串当作 API 数据继续处理，导致 `.items` / `.length` 等字段访问不稳定。

## 修复
- `src/frontend/src/api/http.ts`：API 响应识别 HTML fallback 并抛错。
- `src/frontend/src/components/schedule/ScheduleBoard.vue`：排产计划与设备分页增加运行时载荷守卫。
- `src/frontend/src/main.ts`：Vue runtime error 同步输出 console 栈。
