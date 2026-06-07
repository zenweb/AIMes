# 2026-06-06 Dashboard Hypercare 验收读取失败可见化

## Changed

- 为 `DashboardBoard` 初始化读取 POC Hypercare 上线验收记录增加失败可见化处理。
- 当 Hypercare 验收记录读取失败时，页面显示 `上线验收记录读取失败`、影响面和具体错误原因。
- 读取失败不再中断 Dashboard 后续初始化。

## Tests

- `npm.cmd run test:unit -- tests/unit/dashboard-board.test.ts`：3 passed。
- `npm.cmd run test:unit:coverage`：84 files / 539 tests passed。
- `npm.cmd run test:e2e -- tests/e2e/dashboard.spec.ts`：Nuxt production build passed，Chromium 9/9 passed。

## Release Gate Note

- 本次只推进 A 轨道质量打磨。
- B 轨道发布闸门仍未关闭：hosted CI、PostgreSQL/staging、Attack Chain 人工验证、安全签字、14 天灰度观察。
