# Plan：真实 dhtmlx 甘特图恢复计划

## 目标

让排产页在真实 dhtmlx 模式、后端排产载荷可用时渲染任务条，并保留自动化证据。

## 执行结果

1. 复核现有失败：真实 dhtmlx 用例 `.gantt_task_line` 超时，轻量 marker 未启用。
2. 临时浏览器诊断：确认 API mock 均命中，`loadData()` 高频重复触发。
3. 根因复现：单测模拟 dhtmlx 写入 parsed task 后，旧实现重复调用 `parse()`。
4. 最小修复：传入 dhtmlx 前复制 tasks/links 快照，并设置 dhtmlx root id。
5. 验证：单测、真实 dhtmlx e2e、默认急单 e2e、lint 均通过。

## 后续计划

- 下一片继续排产页深度：真实 dhtmlx 拖拽保存证据，而不是转向新功能。
