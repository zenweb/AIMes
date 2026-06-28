# 2026-06-20 员工页 demo 会话切回真实登录

## 变更
- 修复普通 `/scheduling/login` 入口遇到旧 `demo-token-*` 会话时被路由直接推回工作台的问题。
- Vue Router 与 Nuxt 全局 auth middleware 均在普通登录入口清理旧 demo token、refresh token、cached user，并将 `aimes_offline_demo` 置为 `false`。
- 显式离线演示入口（`offlineDemo=1` / `demoMode=offline`）保持不变。

## 验证
- `npm run test:unit -- nuxt-auth-middleware.test.ts router-auth.test.ts auth.store.test.ts offline-demo-mode.test.ts employee-board.test.ts`：70 passed。
- `npm run build`：通过。
- Playwright 真实浏览器：旧 demo 会话进入普通 login 后被清理；`admin/admin123` 登录后 `/api/v1/employee?page=1&pageSize=20` 返回 200；页面无 `Offline demo mode skipped backend request`，无“当前展示本地示例数据”。
