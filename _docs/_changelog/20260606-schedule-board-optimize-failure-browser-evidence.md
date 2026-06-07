# 2026-06-06 ScheduleBoard 排产优化失败真实浏览器证据

## Changed

- `scheduling.spec.ts` 新增真实 Chromium 用例，覆盖排产优化接口失败时的 fail-loud 告警。
- 用例确认当前甘特图任务数量保持不变，避免优化失败后丢失当前排产上下文。

## Verification

- `npm.cmd run test:e2e -- tests/e2e/scheduling.spec.ts -g "排产优化失败"` -> Nuxt production build passed，Chromium 1/1 passed。

## Release Gate Note

本次只关闭 A 轨 ScheduleBoard 排产优化失败浏览器证据缺口，不关闭 v1.0.0 B 轨发布闸门。
