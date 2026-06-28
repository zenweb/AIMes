# 2026-06-14 Changelog - 真实 dhtmlx live staging 拖拽窗口修正

## 变更
- 跳过 15 天灰度观察等待，不把灰度后置项当作当前阻塞。
- 修正 `src/frontend/tests/e2e/scheduling-live-staging.spec.ts` 的 live staging 种子窗口，避免拖拽后任务越过计划结束边界。
- 给 live staging 的拖拽重试补充重新对齐视口，减少重试时鼠标坐标落到视口外的情况。
- 给该 spec 增加 `afterEach` 的 `page.unrouteAll({ behavior: 'ignoreErrors' })`，避免关闭页面后仍有 in-flight `route.fetch` 报错。

## 验证
- `npm run test:e2e -- tests/e2e/scheduling-live-staging.spec.ts --project=chromium`：2 passed。

## 范围说明
- 未改业务拖拽逻辑。
- 只修 live staging E2E 证据的稳定性和可达性。
