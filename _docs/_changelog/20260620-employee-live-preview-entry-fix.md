# 2026-06-20 Changelog - Employee Live Preview Entry Fix

## Changed
- 普通登录不再因为 `VITE_OFFLINE_DEMO=true` 的构建环境而优先进入离线 demo；只有 URL 显式 `offlineDemo=1|true|offline` 才使用 demo 登录。
- Nuxt production preview 增加 `routeRules`，将 `/api/**` 与 `/hubs/**` 代理到 `NUXT_API_TARGET` / `VITE_API_TARGET`，默认 `http://localhost:5003`。

## Verified
- `npm run test:unit -- tests/unit/auth.store.test.ts`
- `npm run test:unit -- tests/unit/offline-demo-mode.test.ts`
- `npm run test:unit -- tests/unit/employee-board.test.ts`
- `npm run build`
- 真实浏览器：残留 `localStorage.aimes_offline_demo=true` 后，从 `http://127.0.0.1:4173/scheduling/login` 使用 `admin/admin123` 登录，进入 `/scheduling/employee` 后保持 `offlineDemo=false`，页面不再出现 `员工列表加载失败` 或 `Offline demo mode skipped backend request`。
