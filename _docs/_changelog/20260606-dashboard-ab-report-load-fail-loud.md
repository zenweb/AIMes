# 2026-06-06 Dashboard A/B 报告读取失败可见化

## Changed

- 为 `DashboardBoard` 的 `latest-ab-report.json` 读取路径增加失败可见化处理。
- 当 A/B 报告资源读取失败或返回 non-ok 时，页面显示 `A/B 报告读取失败`、影响面和具体错误原因。
- 默认 OTD 演示值仍保留，但不再静默展示。

## Tests

- `npm.cmd run test:unit -- tests/unit/dashboard-board.test.ts`：5 passed。
- `npm.cmd run test:unit:coverage`：84 files / 541 tests passed。
- `npm.cmd run test:e2e -- tests/e2e/dashboard.spec.ts`：Nuxt production build passed，Chromium 11/11 passed。

## Release Gate Note

- 本次只推进 A 轨道质量打磨。
- B 轨道发布闸门仍未关闭：hosted CI、PostgreSQL/staging、Attack Chain 人工验证、安全签字、14 天灰度观察。
