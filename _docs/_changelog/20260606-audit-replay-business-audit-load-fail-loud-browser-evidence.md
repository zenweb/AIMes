# 2026-06-06 Audit Replay 业务落库审计读取失败真实浏览器证据

## Changed

- 为审计决策回放新增真实 Chromium 失败态证据。
- 当 `/api/v1/audit-logs` 返回 503 时，e2e 断言回放面板保留基础决策卡片，并显示 `业务落库审计加载失败`。
- 断言后端错误原因 `audit log unavailable from chromium` 可见，并确认路由拦截实际命中。

## Tests

- `npm.cmd run test:e2e -- tests/e2e/audit.spec.ts -g "业务落库审计接口失败"`：Nuxt production build passed，Chromium 1/1 passed。
- `npm.cmd run test:e2e -- tests/e2e/audit.spec.ts`：Nuxt production build passed，Chromium 13/13 passed。

## Release Gate Note

- 本次只推进 A 轨道真实浏览器质量证据。
- B 轨道发布闸门仍未关闭：hosted CI、PostgreSQL/staging、Attack Chain 人工验证、安全签字、14 天灰度观察。
