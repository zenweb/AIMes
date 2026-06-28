# 2026-06-14 Issue - 排产启动工程约束失败阻断主计划

## 问题
- `ScheduleBoard.vue` 的 mounted hook 串行 `await` BOM/ECN 约束与工艺能力约束。
- 任一启动工程约束证据抛错时，后续 `loadData()` 不执行，导致正式排产主计划无法加载。

## 影响
- 排产是用户关键路径。
- 辅助工程约束证据源故障不应让正式排产计划不可用。

## 修复
- 新增启动工程约束聚合读取逻辑，逐项捕获失败并汇总为一条 fail-loud 告警。
- mounted hook 先尝试加载启动工程约束，再始终继续加载排产主数据。

## 状态
- 当前问题已修复并通过 focused unit、focused Chromium 与全量 unit coverage 验证。
- scheduling 全文件 Chromium 仍有 4 个真实 dhtmlx 残留失败，另行追踪。
