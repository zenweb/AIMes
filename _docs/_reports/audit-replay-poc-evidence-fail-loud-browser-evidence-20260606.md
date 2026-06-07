# Audit Replay POC 证据治理失败真实浏览器证据报告

日期：2026-06-06

## 范围

- A 轨道：精品化现有用户关键路径。
- 本片继续推进审计决策回放，不扩展新功能。
- 本片覆盖 POC 客户工单证据读取失败：后端失败且本地没有可解释样例时必须 fail-loud，同时保留基础回放卡片。
- 未改动发布 B 轨道闸门。

## 变更

- `src/frontend/tests/e2e/audit.spec.ts`
  - 新增 `POC 证据治理接口失败时真实浏览器保留基础回放并告警`。
  - 拦截 `**/api/v1/scheduling/customer-order-import/latest` 为 503。
  - 清空本地 POC 工单/设备样例，断言页面保留基础回放卡片。
  - 断言 `.replay-sync-alert` 显示 `POC 证据治理加载失败` 和 `poc order evidence unavailable from chromium`。
  - 断言路由命中数大于 0，避免测试只走静态演示数据。
- `src/frontend/src/api/pocEvidence.ts`
  - `getLatestCustomerOrderImport()` 不再吞掉后端错误。
- `src/frontend/src/utils/customer-order-import-sync.ts`
  - 有本地 POC 工单样例时继续兜底。
  - 后端失败且本地无样例时抛出错误，让审计回放面板 fail-loud。
- `src/frontend/tests/unit/customer-order-import-sync.test.ts`
  - 补充后端失败且有本地样例时兜底。
  - 补充后端失败且无本地样例时抛错。

## 验证

- `npm.cmd run test:e2e -- tests/e2e/audit.spec.ts -g "POC 证据治理接口失败"`
  - Nuxt production build passed。
  - Chromium 1/1 passed。
- `npm.cmd run test:e2e -- tests/e2e/audit.spec.ts`
  - Nuxt production build passed。
  - Chromium 15/15 passed。
- `npm.cmd run test:unit -- tests/unit/customer-order-import-sync.test.ts`
  - Vitest 7/7 passed。

## B 轨道仍未关闭

- Hosted CI 仍缺 GitHub Actions run URL / run id / job summary。
- PostgreSQL/staging rehearsal 仍缺真实演练证据。
- Attack Chain A/B/C 仍缺人工 verifier 与 `VerifiedAt`。
- Security signoff 仍缺授权人签字。
- Gray observation 仍缺首次灰度与 14 个自然日 P0/P1=0 观察窗口。
