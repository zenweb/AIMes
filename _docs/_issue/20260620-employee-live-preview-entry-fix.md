# 2026-06-20 Issue - Employee Live Preview Entry Fix

## Symptom
- 员工页提示：`员工列表加载失败，当前展示本地示例数据：Offline demo mode skipped backend request: /api/v1/employee`。
- 普通登录后页面可能仍显示离线状态。

## Root Cause
- 认证 store 将构建级 `VITE_OFFLINE_DEMO=true` 当作普通登录优先 demo 的信号。
- 4173 production preview 没有生产态 API 代理，`/api/v1/auth/login` 不能稳定到达 5003 后端。

## Fix
- `src/frontend/src/stores/auth.ts`：普通登录只在 URL 显式 demo 时进入 demo。
- `src/frontend/nuxt.config.ts`：用 Nitro `routeRules` 代理 `/api/**`、`/hubs/**` 到 5003。
