# 2026-06-14 Review - 真实 dhtmlx Storage Fail Live Mode

## 结论
- 未发现本轮改动引入的阻塞问题。
- 存储不可用时，离线演示判断现在 fail-live，真实 dhtmlx 证据路径不会被 demo markers 或 offline demo 短路。
- scheduling Chromium 全文件 42 passed，覆盖真实 dhtmlx、拖拽回写、失败保留待回写状态等既有路径。

## 关注点
- `VITE_OFFLINE_DEMO=true` 仍作为无浏览器覆盖时的构建默认值；只有读取 `aimes_offline_demo` 抛错时才保守选择 live。
- URL 显式 live opt-out 在存储写失败时仍生效，但不会持久化到后续页面，这是受限浏览器环境下可接受的降级。
- `GanttChart.vue` 与通用 `offline-demo-mode.ts` 均采用 live 优先，避免组件层与 API/http 层语义分叉。

## 已验证
- `offline-demo-mode.test.ts` 10 passed。
- `gantt-chart.test.ts` 19 passed。
- `scheduling.spec.ts --project=chromium` 42 passed。
- `test:unit:coverage` 105 files / 693 tests passed。
