# Dashboard Demo 彩排证据写入失败可见化报告

日期：2026-06-06

## 范围

- A 轨道：精品化现有用户关键路径。
- 本片从 Monitoring 转向 Dashboard，因为 Dashboard 是登录后的生产概览/控制塔，且当前函数覆盖率低于已推进后的 Monitoring。
- 本片只处理 `DashboardBoard` 的「确认彩排并写入证据链」按钮在 OTD 证据链写入失败时没有 fail-loud UI 的问题。
- 未扩展新功能，未改动发布 B 轨道闸门。

## 变更

- `src/frontend/src/components/dashboard/DashboardBoard.vue`
  - 新增 `demoRehearsalError` 状态。
  - `handleConfirmDemoRehearsal()` 包裹 `upsertOtdEvidenceChainRecord()`。
  - 写入失败时显示 `彩排证据写入失败，5 分钟 Demo 彩排尚未写入 OTD 证据链：...`。
  - 写入成功或恢复已有彩排证据时清空失败提示。
- `src/frontend/tests/unit/dashboard-board.test.ts`
  - 新增失败路径单元测试，模拟彩排证据写入抛错。
  - 断言页面展示失败标题、影响面和具体错误原因，并且不展示已确认状态。

## 验证

- `npm.cmd run test:unit -- tests/unit/dashboard-board.test.ts`
  - 2 passed。
- `npm.cmd run test:unit:coverage`
  - 84 files passed。
  - 538 tests passed。
  - 全局覆盖率：statements 75%，branches 58.93%，functions 69.9%，lines 78.4%。
  - `DashboardBoard.vue`：statements 71.68%，branches 71.63%，functions 46.51%，lines 75.51%。
- `npm.cmd run test:e2e -- tests/e2e/dashboard.spec.ts`
  - Nuxt production build passed。
  - Chromium 9/9 passed。

## B 轨道仍未关闭

- Hosted CI 仍缺 GitHub run URL / run id / job summary。
- PostgreSQL/staging rehearsal 仍缺真实演练证据。
- Attack Chain A/B/C 仍缺人工 verifier 与 `VerifiedAt`。
- Security signoff 仍缺授权人签字。
- Gray observation 仍缺首次灰度与 14 个自然日 P0/P1=0 观察窗口。
