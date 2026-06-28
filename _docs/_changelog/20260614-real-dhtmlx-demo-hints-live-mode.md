# 2026-06-14 真实 dhtmlx Demo Hints Live Mode 修复

## 变更
- `GanttChart.vue` 将 demo hints 与真实 dhtmlx 渲染开关解耦。
- 当 `aimes_offline_demo=false` 明确表示真实模式时，即使 e2e 环境设置 `VITE_SHOW_DEMO_HINTS=true`，也不再强制显示轻量甘特图 marker。
- 新增单测锁定该行为，防止真实浏览器 dhtmlx 证据再次被 demo hints 误杀。

## 根因
- Playwright 配置全局设置 `VITE_SHOW_DEMO_HINTS=true`。
- 旧代码将 `VITE_SHOW_DEMO_HINTS=true` 直接等同于 `useLightweightGantt=true`。
- 真实 dhtmlx 用例虽然设置了 `aimes_offline_demo=false`，但仍被轻量 marker 覆盖，导致 `.gantt-e2e-markers` 残留。

## 验证
- RED：`npm run test:unit -- tests/unit/gantt-chart.test.ts -t "honors explicit live mode"` 曾失败，确认 demo hints 会阻断真实 dhtmlx。
- GREEN：`npm run test:unit -- tests/unit/gantt-chart.test.ts -t "honors explicit live mode"`，1 passed。
- GREEN：`npm run test:unit -- tests/unit/gantt-chart.test.ts`，17 passed。
- GREEN：`npm run test:e2e -- tests/e2e/scheduling.spec.ts -g "真实 dhtmlx" --project=chromium`，4 passed。
- GREEN：`npm run test:e2e -- tests/e2e/scheduling.spec.ts --project=chromium`，39 passed。

## 备注
- 15 天灰度观察按 owner 指令跳过/延期，不作为本轮继续工作的阻塞项。
