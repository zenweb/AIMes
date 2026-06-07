# 2026-06-06 Monitoring 现场态势升级失败可见化

## Changed

- 为 `MonitoringBoard` 的「升级为跨模块处置包」路径增加失败可见化处理。
- 当升级记录写入失败时，页面显示失败标题、影响面和具体错误原因，避免继续展示升级成功文案。

## Tests

- `npm.cmd run test:unit -- tests/unit/monitoring-board.test.ts`：3 passed。
- `npm.cmd run test:unit:coverage`：84 files / 533 tests passed。
- `npm.cmd run test:e2e -- tests/e2e/monitoring.spec.ts`：Chromium 4/4 passed。

## Release Gate Note

- 本次只推进 A 轨道质量打磨。
- B 轨道发布闸门仍未关闭：hosted CI、PostgreSQL/staging、Attack Chain 人工验证、安全签字、14 天灰度观察。
