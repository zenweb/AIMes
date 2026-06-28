# 2026-06-14 Review - 真实 dhtmlx URL Live Mode

## 结论
- 未发现本轮改动引入的阻塞问题。
- 显式 URL live mode 已纳入真实浏览器证据，`scheduling.spec.ts` Chromium 全文件 40 passed。

## 关注点
- `VITE_SHOW_DEMO_HINTS` 仍服务于 e2e/demo 提示，但不能覆盖用户显式选择的真实模式。
- 真实模式现在支持两类入口：`localStorage.aimes_offline_demo=false` 与 URL `offlineDemo=false` / `demoMode=false`。
- 本轮只硬化既有排产甘特图证据路径，不新增业务功能。

## 已验证
- GanttChart 单测 18 passed。
- 真实 dhtmlx focused Chromium 5 passed。
- scheduling Chromium 全文件 40 passed。
- 前端全量 unit coverage 105 files / 686 tests passed。
