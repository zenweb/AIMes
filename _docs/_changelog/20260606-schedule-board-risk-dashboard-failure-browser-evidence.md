# 2026-06-06 ScheduleBoard 风险看板读取失败真实浏览器证据

## Changed

- `scheduling.spec.ts` 新增真实 Chromium 用例，覆盖风险看板接口失败时的 fail-loud 状态提示。
- 用例固定排产计划、设备列表和瓶颈设备成功前置载荷，避免默认 SPA fallback 阻断风险看板分支。
- 用 `riskRequests` 断言 `/api/v1/risk/dashboard` 在真实浏览器中被命中。

## Verification

- `npm.cmd run test:e2e -- tests/e2e/scheduling.spec.ts -g "风险看板读取失败"` -> Nuxt production build passed，Chromium 1/1 passed。

## Release Gate Note

本次只关闭 A 轨 ScheduleBoard 风险看板读取失败浏览器证据缺口，不关闭 v1.0.0 B 轨发布闸门。
