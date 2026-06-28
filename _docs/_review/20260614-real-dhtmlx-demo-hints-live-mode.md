# 2026-06-14 Review - 真实 dhtmlx Demo Hints Live Mode

## 结论
- 未发现本轮改动引入的阻塞问题。
- 真实 dhtmlx 证据链已从 demo hints 环境配置中恢复，`scheduling.spec.ts` Chromium 全文件已绿。

## 关注点
- `VITE_SHOW_DEMO_HINTS` 仍可用于显示演示提示，但不应再作为禁用真实 dhtmlx 的硬开关。
- 显式 `aimes_offline_demo=false` 是当前真实浏览器证据的优先信号。
- 本轮只修复现有排产甘特图证据路径，不新增功能。

## 已验证
- GanttChart 单测 17 passed。
- 真实 dhtmlx focused Chromium 4 passed。
- scheduling Chromium 全文件 39 passed。
