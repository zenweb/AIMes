# 2026-06-14 Issue - Demo Hints 阻断真实 dhtmlx

## 问题
- `GanttChart.vue` 使用 `VITE_SHOW_DEMO_HINTS === 'true' || isOfflineDemoMode()` 决定是否启用轻量甘特图。
- e2e 环境全局开启 `VITE_SHOW_DEMO_HINTS=true`，导致真实 dhtmlx 用例也被轻量 marker 覆盖。

## 影响
- 真实 dhtmlx 用例中 `.gantt-e2e-markers` 期望为 0，但实际残留 1。
- 真实任务条拖拽、保存、刷新回读、失败保留状态等浏览器证据被错误阻断。

## 修复
- 新增显式 live mode 判断：当 `localStorage.aimes_offline_demo === 'false'` 时优先启用真实 dhtmlx。
- 对非标准测试环境中的 `localStorage` 做防御式读取，避免 setup 阶段抛错。

## 状态
- 已修复并验证通过。
