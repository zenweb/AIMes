# 2026-06-06 Monitoring 初始化治理记录读取失败可见化

## Changed

- 为 `MonitoringBoard` 初始化读取 Hypercare 与现场处置包治理记录增加失败可见化处理。
- 当后端优先读取失败时，页面显示失败标题、影响面和具体错误原因。
- 读取失败后仍继续执行实时监控连接，避免治理记录异常阻断整个监控页。

## Tests

- `npm.cmd run test:unit -- tests/unit/monitoring-board.test.ts`：4 passed。
- `npm.cmd run test:unit:coverage`：84 files / 534 tests passed。
- `npm.cmd run test:e2e -- tests/e2e/monitoring.spec.ts`：Chromium 4/4 passed。

## Release Gate Note

- 本次只推进 A 轨道质量打磨。
- B 轨道发布闸门仍未关闭：hosted CI、PostgreSQL/staging、Attack Chain 人工验证、安全签字、14 天灰度观察。
