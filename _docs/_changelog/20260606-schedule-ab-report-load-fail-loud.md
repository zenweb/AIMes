# 2026-06-06 ScheduleBoard A/B 报告读取失败可见化

## Changed

- 为 `ScheduleBoard` 的 `latest-ab-report.json` 读取路径增加失败可见化处理。
- 当 A/B 报告资源读取失败或返回 non-ok 时，页面通过现有 `.warnings-bar` 显示 `A/B 报告读取失败`、影响面和具体错误原因。
- 基线 vs Agent OTD 对比仍可使用排产计划推导值，但不再静默展示。

## Tests

- `npm.cmd run test:unit -- tests/unit/schedule-board.test.ts`：20 passed。
- `npm.cmd run test:e2e -- tests/e2e/scheduling.spec.ts`：Nuxt production build passed，Chromium 26/26 passed。
- `npm.cmd run test:unit:coverage`：84 files / 542 tests passed。

## Release Gate Note

- 本次只推进 A 轨道质量打磨。
- B 轨道发布闸门仍未关闭：hosted CI、PostgreSQL/staging、Attack Chain 人工验证、安全签字、14 天灰度观察。
