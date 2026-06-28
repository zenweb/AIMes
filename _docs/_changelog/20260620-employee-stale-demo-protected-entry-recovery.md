# 2026-06-20 员工页旧 Demo 会话受保护入口恢复

## 变更
- 修复旧 `demo-token-*` 与 `aimes_offline_demo=true` 直接进入 `/scheduling/employee` 时，员工接口被前端离线 demo 拦截的问题。
- 路由守卫与 Nuxt 全局中间件现在会在非显式离线 demo 入口清理旧 demo 会话。
- 受保护页面命中旧 demo 会话时会回到登录页，重新登录后使用真实后端 token 请求 `/api/v1/employee`。

## 验证
- `npm run test:unit -- tests/unit/router-auth.test.ts tests/unit/nuxt-auth-middleware.test.ts`
- `npm run build`
- 真实浏览器验证：
  - 旧 demo 会话直进 `/scheduling/employee` 后跳回 `/scheduling/login`。
  - `aimes_token`、`aimes_refresh_token`、`aimes_user` 被清理，`aimes_offline_demo=false`。
  - `admin/admin123` 重新登录后，员工页请求 `/api/v1/employee?page=1&pageSize=20`，无 Offline demo 文案。
