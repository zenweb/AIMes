# Dashboard A/B 报告读取失败可见化报告

日期：2026-06-06

## 范围

- A 轨道：精品化现有用户关键路径。
- 本片继续推进 Dashboard 生产运营控制塔，不扩展新功能。
- 本片只处理 `DashboardBoard` 读取 `public/reports/latest-ab-report.json` 失败时静默使用默认 OTD 演示值的问题。
- 未改动发布 B 轨道闸门。

## 变更

- `src/frontend/src/components/dashboard/DashboardBoard.vue`
  - 新增 `abReportError` 状态。
  - `loadLatestAbReport()` 在 fetch 失败或 HTTP non-ok 时显示 `A/B 报告读取失败`。
  - 错误文案明确影响面：`OTD 改善暂用默认演示值`。
  - 继续保留默认 `26.7% -> 30.0% / +3.3pt`，但不再静默。
- `src/frontend/tests/unit/dashboard-board.test.ts`
  - 新增 A/B 报告读取失败单元测试，模拟 fetch 抛错。
- `src/frontend/tests/e2e/dashboard.spec.ts`
  - 新增 Chromium 失败态用例，拦截 `latest-ab-report.json` 为 404。
  - 断言真实浏览器中默认 OTD 值和 `A/B 报告读取失败` 提示同时可见。

## 验证

- `npm.cmd run test:unit -- tests/unit/dashboard-board.test.ts`
  - 1 file passed。
  - 5 tests passed。
- `npm.cmd run test:unit:coverage`
  - 84 files passed。
  - 541 tests passed。
  - 全局覆盖率：statements 75.01%，branches 58.99%，functions 69.89%，lines 78.41%。
  - `DashboardBoard.vue`：statements 72.52%，branches 74.68%，functions 45.23%，lines 76.07%。
- `npm.cmd run test:e2e -- tests/e2e/dashboard.spec.ts`
  - Nuxt production build passed。
  - Chromium 11/11 passed。

## B 轨道仍未关闭

- Hosted CI 仍缺 GitHub run URL / run id / job summary。
- PostgreSQL/staging rehearsal 仍缺真实演练证据。
- Attack Chain A/B/C 仍缺人工 verifier 与 `VerifiedAt`。
- Security signoff 仍缺授权人签字。
- Gray observation 仍缺首次灰度与 14 个自然日 P0/P1=0 观察窗口。
