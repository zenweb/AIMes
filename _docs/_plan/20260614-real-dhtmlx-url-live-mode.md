# 2026-06-14 Plan - 真实 dhtmlx URL Live Mode

## 成功标准
- URL `offlineDemo=false` 必须能覆盖 `VITE_SHOW_DEMO_HINTS=true`。
- 真实 dhtmlx 页面不得出现轻量 `.gantt-e2e-markers`。
- 真实 dhtmlx 任务条必须在 Chromium 中可见。
- scheduling Chromium 全文件必须保持通过。

## 执行
1. 添加 RED 单测复现 URL live mode 被 demo hints 覆盖。
2. 最小修复 `GanttChart.vue` 的显式真实模式识别。
3. 添加 Chromium e2e，打开 `scheduling?offlineDemo=false` 并断言真实 dhtmlx 任务条。
4. 回跑 GanttChart 单测、真实 dhtmlx focused Chromium、scheduling Chromium 全文件、全量 unit coverage。

## 验证结果
- RED 已观察到：URL live mode 单测失败于 marker 仍然 visible。
- GREEN：GanttChart 单测 18 passed。
- GREEN：真实 dhtmlx Chromium 5 passed。
- GREEN：scheduling Chromium 全文件 40 passed。
- GREEN：全量 unit coverage 105 files / 686 tests passed。
