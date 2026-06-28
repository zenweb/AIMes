# 2026-06-14 真实 dhtmlx URL Live Mode

## 变更
- `GanttChart.vue` 的显式真实模式增加 URL 参数入口。
- `?offlineDemo=false` 或 `?demoMode=false` 现在会覆盖 `VITE_SHOW_DEMO_HINTS=true`，避免真实 dhtmlx 被轻量 marker 覆盖。
- `scheduling.spec.ts` 新增 Chromium 用例，验证共享 URL 显式关闭离线演示时真实 dhtmlx 仍渲染。
- `gantt-chart.test.ts` 新增 RED/GREEN 单测覆盖 URL live mode。

## 验证
- RED：`npm run test:unit -- tests/unit/gantt-chart.test.ts -t "honors URL live mode"` 曾失败，确认 URL 显式真实模式会被 demo hints 覆盖。
- GREEN：`npm run test:unit -- tests/unit/gantt-chart.test.ts -t "honors URL live mode"`，1 passed。
- GREEN：`npm run test:unit -- tests/unit/gantt-chart.test.ts`，18 passed。
- GREEN：`npm run test:e2e -- tests/e2e/scheduling.spec.ts -g "真实 dhtmlx" --project=chromium`，5 passed。
- GREEN：`npm run test:e2e -- tests/e2e/scheduling.spec.ts --project=chromium`，40 passed。
- GREEN：`npm run test:unit:coverage`，105 files / 686 tests passed，lines 83.14%，`GanttChart.vue` lines 76.03%。

## 备注
- 一次 focused Chromium 与另一条 e2e 并行运行时因 `127.0.0.1:4173` 端口占用失败；串行回跑真实 dhtmlx 组和 scheduling 全文件均通过，判定为命令并发端口冲突，不是产品回归。
- 15 天灰度观察按 owner 指令跳过/延期，不作为本轮继续工作的阻塞项。
