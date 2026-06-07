# 2026-06-06 Monitoring 现场态势证据同步失败可见化

## Changed

- 为 `MonitoringBoard` 的「同步态势证据」路径增加失败可见化处理。
- 当 OTD 证据链写入失败时，页面显示失败标题与具体错误原因，避免继续展示同步成功文案。

## Tests

- `npm.cmd run test:unit -- tests/unit/monitoring-board.test.ts`：2 passed。
- `npm.cmd run test:unit:coverage`：84 files / 532 tests passed。
- `npm.cmd run test:e2e -- tests/e2e/monitoring.spec.ts`：Chromium 4/4 passed。

## Release Gate Note

- 本次只推进 A 轨道质量打磨。
- B 轨道发布闸门仍未关闭：hosted CI、PostgreSQL/staging、Attack Chain 人工验证、安全签字、14 天灰度观察。
