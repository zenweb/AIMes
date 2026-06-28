# 2026-06-14 Issue - 离线演示存储失败导致真实 dhtmlx 证据退回 Demo

## 问题
- 当浏览器读取 `localStorage.getItem('aimes_offline_demo')` 抛错时，`GanttChart.vue` 仍可能展示 `.gantt-e2e-markers`。
- 同一异常还会穿透到通用 `isOfflineDemoMode()`，导致 `ScheduleBoard` 把 offline demo 存储错误包装成“后端排产计划载荷不完整”，并切换演示排产数据。

## 影响
- 真实 Chromium 证据会被 demo fallback 污染。
- 用户看到真实 dhtmlx 容器时，底层数据仍可能是演示计划，验证结论会误导。

## 修复
- `GanttChart.vue` 的 `isExplicitLiveMode()` 在存储读取失败时返回 live。
- `offline-demo-mode.ts` 增加 `readOfflineDemoMode()` / `persistOfflineDemoMode()`，读失败返回 live，写失败不影响 URL 当前语义。
- 新增单测和 e2e 覆盖存储不可读路径。

## 状态
- 已修复并验证通过。
