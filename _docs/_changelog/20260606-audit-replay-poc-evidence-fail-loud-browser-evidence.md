# 2026-06-06 Audit Replay POC 证据治理失败真实浏览器证据

## Changed

- 为审计决策回放新增真实 Chromium POC 证据失败态证据。
- 当客户工单 POC 证据后端读取失败且本地没有可解释样例时，面板显示 `POC 证据治理加载失败`。
- 保留已有本地兜底语义：本地已有客户工单样例时，后端失败仍可展示 POC 成功回放。
- `getLatestCustomerOrderImport()` 不再吞掉后端错误，由 backend-first utility 决定兜底或 fail-loud。

## Tests

- `npm.cmd run test:e2e -- tests/e2e/audit.spec.ts -g "POC 证据治理接口失败"`：Nuxt production build passed，Chromium 1/1 passed。
- `npm.cmd run test:e2e -- tests/e2e/audit.spec.ts`：Nuxt production build passed，Chromium 15/15 passed。
- `npm.cmd run test:unit -- tests/unit/customer-order-import-sync.test.ts`：Vitest 7/7 passed。

## Release Gate Note

- 本次只推进 A 轨道真实浏览器质量证据。
- B 轨道发布闸门仍未关闭：hosted CI、PostgreSQL/staging、Attack Chain 人工验证、安全签字、14 天灰度观察。
