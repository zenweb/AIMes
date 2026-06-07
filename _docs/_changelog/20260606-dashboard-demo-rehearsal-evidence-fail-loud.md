# 2026-06-06 Dashboard Demo 彩排证据写入失败可见化

## Changed

- 为 `DashboardBoard` 的「确认彩排并写入证据链」路径增加失败可见化处理。
- 当 OTD 证据链写入失败时，页面显示 `彩排证据写入失败`、影响面和具体错误原因。

## Tests

- `npm.cmd run test:unit -- tests/unit/dashboard-board.test.ts`：2 passed。
- `npm.cmd run test:unit:coverage`：84 files / 538 tests passed。
- `npm.cmd run test:e2e -- tests/e2e/dashboard.spec.ts`：Chromium 9/9 passed。

## Release Gate Note

- 本次只推进 A 轨道质量打磨。
- B 轨道发布闸门仍未关闭：hosted CI、PostgreSQL/staging、Attack Chain 人工验证、安全签字、14 天灰度观察。
