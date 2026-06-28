# 2026-06-20 员工页真实登录态离线标记启动自愈

## 变更
- 在前端 auth store 启动恢复缓存用户时，若 access token 不是 `demo-token-*`，立即将 `aimes_offline_demo` 置为 `false`。
- 覆盖场景：浏览器残留 `aimes_offline_demo=true`，但本地已有真实后端 token 与完整用户信息时，员工列表不再被 HTTP 层误判为离线 demo 并跳过 `/api/v1/employee`。

## 验证
- `npm run test:unit -- tests/unit/auth.store.test.ts tests/unit/employee-board.test.ts tests/unit/offline-demo-mode.test.ts tests/unit/router-auth.test.ts tests/unit/nuxt-auth-middleware.test.ts`
- `npm run build`
- 真实浏览器验证 `http://127.0.0.1:4173/scheduling/employee`：预置真实 JWT + stale `aimes_offline_demo=true` 后进入页面，运行时自动恢复为 `false`，`/api/v1/employee?page=1&pageSize=20` 返回 200，页面不包含 `员工列表加载失败` 或 `Offline demo mode skipped backend request`。

