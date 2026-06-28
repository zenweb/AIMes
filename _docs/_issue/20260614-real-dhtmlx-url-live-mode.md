# 2026-06-14 Issue - URL 显式真实模式被 Demo Hints 覆盖

## 问题
- `GanttChart.vue` 已支持 `localStorage.aimes_offline_demo=false` 覆盖 demo hints，但 URL `?offlineDemo=false` 仍未被当前显式真实模式识别。
- 在共享链接或手工验证场景中，即使 URL 明确关闭离线演示，`VITE_SHOW_DEMO_HINTS=true` 仍可能启用轻量甘特图。

## 影响
- 真实 dhtmlx 证据可能被 `.gantt-e2e-markers` 覆盖。
- 手工验证和真实浏览器回归链接会出现“明明关闭离线演示但仍非真实 dhtmlx”的误导。

## 修复
- `isExplicitLiveMode()` 增加 URL 参数读取。
- `offlineDemo=false`、`offlineDemo=0`、`demoMode=false`、`demoMode=0` 均视为显式真实模式。
- 新增 unit 与 Chromium e2e 证据。

## 状态
- 已修复并验证通过。
