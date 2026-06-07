# 2026-06-06 ScheduleBoard 批量方案反馈同步失败真实浏览器证据

## Changed

- `scheduling.spec.ts` 新增真实 Chromium 用例，覆盖多目标对比采用方案后，后台采纳反馈同步失败的 fail-loud 状态。
- 用例确认反馈接口真实命中 503，且页面保留本地目标切换和已应用方案提示。

## Verification

- `npm.cmd run test:e2e -- tests/e2e/scheduling.spec.ts -g "批量方案反馈同步失败"` -> Nuxt production build passed，Chromium 1/1 passed。

## Release Gate Note

本次只关闭 A 轨 ScheduleBoard 批量方案反馈失败浏览器证据缺口，不关闭 v1.0.0 B 轨发布闸门。
