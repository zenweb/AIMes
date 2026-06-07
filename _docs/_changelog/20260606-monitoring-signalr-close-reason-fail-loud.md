# 2026-06-06 Monitoring SignalR 关闭原因可见化

## Changed

- 为 `MonitoringBoard` SignalR `onclose(error)` 路径增加错误原因展示。
- 有关闭错误时，实时事件显示 `实时连接已关闭：...`；无错误时保留原文案。

## Tests

- `npm.cmd run test:unit -- tests/unit/monitoring-board.test.ts`：6 passed。
- `npm.cmd run test:unit:coverage`：84 files / 536 tests passed。
- `npm.cmd run test:e2e -- tests/e2e/monitoring.spec.ts`：Chromium 4/4 passed。

## Release Gate Note

- 本次只推进 A 轨道质量打磨。
- B 轨道发布闸门仍未关闭：hosted CI、PostgreSQL/staging、Attack Chain 人工验证、安全签字、14 天灰度观察。
