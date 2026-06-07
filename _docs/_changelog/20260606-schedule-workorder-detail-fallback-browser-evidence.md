# 2026-06-06 ScheduleBoard 工单详情失败兜底真实浏览器证据

## Changed

- 为 `ScheduleBoard` 任务级排产解释链路新增真实 Chromium 失败态证据。
- 当 `/api/v1/scheduling/workorders/{id}` 返回 503 时，e2e 断言详情面板显示失败原因，并说明已使用本地排产解释兜底。
- 用键盘 Enter 触发真实轻量甘特任务条交互，并断言 workorder 路由确实命中。

## Tests

- `npm.cmd run test:e2e -- tests/e2e/scheduling.spec.ts -g "工单详情接口失败"`：Nuxt production build passed，Chromium 1/1 passed。
- `npm.cmd run test:e2e -- tests/e2e/scheduling.spec.ts`：Nuxt production build passed，Chromium 27/27 passed。

## Release Gate Note

- 本次只推进 A 轨道质量证据。
- B 轨道发布闸门仍未关闭：hosted CI、PostgreSQL/staging、Attack Chain 人工验证、安全签字、14 天灰度观察。
