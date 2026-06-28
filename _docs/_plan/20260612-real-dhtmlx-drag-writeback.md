# 2026-06-12 Plan：真实 dhtmlx 拖拽回写

## 成功标准

- 关闭 offline demo 与轻量 marker 后，真实 dhtmlx 任务条可由真实鼠标拖拽触发保存。
- E2E 必须捕获正式计划 PATCH，并校验 URL、`plannedStartTime`、`plannedEndTime`。
- 页面必须显示“正式排产计划已更新”，并留下截图/manifest 证据。

## 执行记录

1. 复现失败，确认 PATCH 为 0。
2. 加临时测试侧探针定位事件链，确认任务条在 DOM 中但未进入视口，鼠标未命中。
3. 移除探针，改为滚入视口后拖拽。
4. 跑单测、真实 dhtmlx E2E、急单主流程 E2E 与 lint。

## 当前状态

- 本片完成；下一片应继续围绕排产页精品化，优先补拖拽冲突/失败保存证据。
