# 2026-06-06 Dashboard 生产概览数据读取失败可见化

## Changed

- 为 `DashboardBoard` 初始化读取生产概览数据增加失败可见化处理。
- 当 `/api/v1/dashboard` 读取失败时，页面显示 `生产概览数据读取失败`、影响面和具体错误原因。
- 读取失败不再只静默保留 0 值卡片。

## Tests

- `npm.cmd run test:unit -- tests/unit/dashboard-board.test.ts`：4 passed。
- `npm.cmd run test:unit:coverage`：84 files / 540 tests passed。
- `npm.cmd run test:e2e -- tests/e2e/dashboard.spec.ts`：Nuxt production build passed，Chromium 10/10 passed。

## Release Gate Note

- 本次只推进 A 轨道质量打磨。
- B 轨道发布闸门仍未关闭：hosted CI、PostgreSQL/staging、Attack Chain 人工验证、安全签字、14 天灰度观察。
