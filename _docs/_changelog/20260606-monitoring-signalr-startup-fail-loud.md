# 2026-06-06 Monitoring SignalR 启动失败可诊断

## Changed

- 为 `MonitoringBoard` 非 demo 环境下 SignalR 启动失败增加错误原因展示。
- 失败后仍使用演示数据兜底，但实时事件中会展示具体失败原因，便于定位实时网关问题。

## Tests

- `npm.cmd run test:unit -- tests/unit/monitoring-board.test.ts`：5 passed。
- `npm.cmd run test:unit:coverage`：84 files / 535 tests passed。
- `npm.cmd run test:e2e -- tests/e2e/monitoring.spec.ts`：Chromium 4/4 passed。

## Release Gate Note

- 本次只推进 A 轨道质量打磨。
- B 轨道发布闸门仍未关闭：hosted CI、PostgreSQL/staging、Attack Chain 人工验证、安全签字、14 天灰度观察。
