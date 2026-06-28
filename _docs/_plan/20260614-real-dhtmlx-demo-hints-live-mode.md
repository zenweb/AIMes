# 2026-06-14 Plan - 真实 dhtmlx Demo Hints Live Mode

## 成功标准
- `VITE_SHOW_DEMO_HINTS=true` 不得阻断显式真实模式。
- `aimes_offline_demo=false` 时，真实 dhtmlx 必须渲染并隐藏轻量 marker。
- 4 个真实 dhtmlx Chromium 用例必须恢复通过。
- scheduling Chromium 全文件必须恢复通过。

## 执行
1. 读取失败上下文，确认 `.gantt-e2e-markers` 残留是轻量甘特图被错误启用。
2. 添加 RED 单测，复现 demo hints 阻断真实 dhtmlx。
3. 最小修复 `GanttChart.vue` 的模式选择逻辑，让显式 live mode 优先。
4. 回跑 GanttChart 单测、真实 dhtmlx focused Chromium、scheduling Chromium 全文件。

## 验证结果
- RED 已观察到：新增单测失败于 marker 仍然 visible。
- GREEN：GanttChart 单测 17 passed。
- GREEN：真实 dhtmlx focused Chromium 4 passed。
- GREEN：scheduling Chromium 全文件 39 passed。
