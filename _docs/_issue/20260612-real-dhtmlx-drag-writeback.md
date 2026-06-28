# 2026-06-12 Issue：真实 dhtmlx 拖拽未触发 PATCH

## 现象

- `真实 dhtmlx 拖拽保存后回写正式排产计划` 初始失败：鼠标拖动后 `rescheduleRequests.length` 始终为 0。

## 根因

- 真实任务条已渲染，但位于页面下方；失败时 bbox 为 `y=2092.09375`。
- Playwright 直接使用该 bbox 坐标发鼠标事件，实际没有命中视口内可交互元素，因此 DOM/dhtmlx 拖拽事件都未触发。

## 处理

- 在拖拽前将 `.gantt_task_line[task_id="dhtmlx-item-rush"]` 滚入视口，并断言任务条在 viewport 内。
- 复跑后 PATCH 命中 `/api/v1/scheduling/plans/plan-dhtmlx-e2e/items/dhtmlx-item-rush`，页面显示“正式排产计划已更新”。
