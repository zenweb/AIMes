# Frontend Employee Demo Deeplink Evidence - 2026-06-21

## Scope
- 修复未登录访问 `/employee?offlineDemo=1` 时登录后丢失原目标页的问题。
- 保持员工离线演示页不向用户暴露 `Offline demo mode skipped backend request` 技术错误。

## Changes
- `middleware/auth.global.ts`：受保护路由跳转登录时携带 `redirect`，并保留 `offlineDemo` / `demoMode`。
- `LoginPage.vue`：登录成功后优先回到站内 `redirect`；非站内 redirect 回退到 `/dashboard`。
- `login-page.test.ts`、`nuxt-auth-middleware.test.ts`：覆盖深链回跳和非站内 redirect 拒绝。

## Verification
- `npm run test:unit -- tests/unit/login-page.test.ts tests/unit/nuxt-auth-middleware.test.ts --maxWorkers=1 --no-file-parallelism`
  - PASS: 2 files, 22 tests.
- `npm run test:e2e -- tests/e2e/employee.spec.ts`
  - PASS: 12/12 Chromium real-browser tests.
- Manual preview: `http://127.0.0.1:4176/scheduling/employee?offlineDemo=1`
  - Redirected to `/scheduling/login?offlineDemo=1&redirect=/employee?offlineDemo=1`.
  - Login with `admin/admin123` returned to `/scheduling/employee?offlineDemo=1`.
  - Employee cards: 8; alerts: 0; no `员工列表加载失败`; no `Offline demo mode skipped backend request`.

## Result
- 新构建下员工离线演示入口保持静默 fallback，不显示 backend skip 技术错误。
- 用户从员工深链进入登录后，可回到原员工页继续验证。
