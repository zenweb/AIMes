# 2026-06-14 Plan - 真实 dhtmlx live staging 拖拽闭环

## Success Criteria
- 真实浏览器里能看到 dhtmlx 任务条。
- 拖拽后能稳定触发 live API PATCH。
- 刷新后能从 PostgreSQL / read model 读回同一窗口。
- 非可编辑计划会被后端拒绝，且页面不误报保存成功。

## Execution
- 复现 live staging 失败。
- 对照 trace 和 DOM，确认失败来自计划窗口边界和重试对齐问题。
- 仅修测试种子与收尾，不动业务实现。
- 回跑 live staging 单文件验证。

## Stop Condition
- 两个 live staging 用例稳定通过后停止。
- 若后续再次失败，先回 trace 找根因，不继续猜。
