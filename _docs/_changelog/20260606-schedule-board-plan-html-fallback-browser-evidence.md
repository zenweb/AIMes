# 2026-06-06 ScheduleBoard 排产计划 HTML fallback 真实浏览器证据

## Changed

- `ScheduleBoard.vue` 为当前排产计划读取失败补业务上下文：后端返回 HTML fallback 时，排产页 warning 会明确显示 `后端排产计划载荷不完整`，同时保留底层错误原因。
- `scheduling.spec.ts` 新增真实 Chromium 用例，覆盖 `/api/v1/scheduling/current` 返回 HTML fallback 的 fail-loud fallback。

## Verification

- RED：`npm.cmd run test:e2e -- tests/e2e/scheduling.spec.ts -g "排产计划返回 HTML fallback"` -> Chromium 失败，warning 缺少排产计划业务上下文。
- GREEN：`npm.cmd run test:unit -- tests/unit/schedule-board.test.ts -t "schedule plan payload"` -> 1 passed，20 skipped。
- GREEN：`npm.cmd run test:e2e -- tests/e2e/scheduling.spec.ts -g "排产计划返回 HTML fallback"` -> Nuxt production build passed，Chromium 1/1 passed。

## Release Gate Note

本次只关闭 A 轨 ScheduleBoard 排产计划 HTML fallback 浏览器证据缺口，不关闭 v1.0.0 B 轨发布闸门。
