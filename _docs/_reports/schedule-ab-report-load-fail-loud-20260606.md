# ScheduleBoard A/B 报告读取失败可见化报告

日期：2026-06-06

## 范围

- A 轨道：精品化现有用户关键路径。
- 本片继续推进 AI 排产工作台，不扩展新功能。
- 本片只处理 `ScheduleBoard` 读取 `public/reports/latest-ab-report.json` 失败时静默回退到排产计划推导值的问题。
- 未改动发布 B 轨道闸门。

## 变更

- `src/frontend/src/components/schedule/ScheduleBoard.vue`
  - 新增 `abReportWarning` 状态。
  - `loadLatestAbReport()` 在 fetch 失败或 HTTP non-ok 时显示 `A/B 报告读取失败`。
  - 错误文案明确影响面：`基线 vs Agent OTD 对比暂用排产计划推导值`。
  - 通过现有 `.warnings-bar` 展示，避免静默使用推导对比值。
- `src/frontend/tests/unit/schedule-board.test.ts`
  - 新增 A/B 报告读取失败单元测试，模拟 fetch 抛错。
- `src/frontend/tests/e2e/scheduling.spec.ts`
  - 新增 Chromium 失败态用例，拦截 `latest-ab-report.json` 为 404。
  - 断言真实浏览器中失败提示和 OTD 对比来源说明可见。

## 验证

- `npm.cmd run test:unit -- tests/unit/schedule-board.test.ts`
  - 1 file passed。
  - 20 tests passed。
- `npm.cmd run test:e2e -- tests/e2e/scheduling.spec.ts`
  - Nuxt production build passed。
  - Chromium 26/26 passed。
- `npm.cmd run test:unit:coverage`
  - 84 files passed。
  - 542 tests passed。
  - 全局覆盖率：statements 75.03%，branches 59.01%，functions 69.98%，lines 78.42%。
  - `ScheduleBoard.vue`：statements 71.81%，branches 39.45%，functions 51.28%，lines 73.51%。

## B 轨道仍未关闭

- Hosted CI 仍缺 GitHub run URL / run id / job summary。
- PostgreSQL/staging rehearsal 仍缺真实演练证据。
- Attack Chain A/B/C 仍缺人工 verifier 与 `VerifiedAt`。
- Security signoff 仍缺授权人签字。
- Gray observation 仍缺首次灰度与 14 个自然日 P0/P1=0 观察窗口。
