# 2026-06-12 Review：真实 dhtmlx 拖拽回写

## 结论

- 未发现本片新增阻断问题。
- 原失败根因不是保存 API 链路，而是测试鼠标没有命中真实任务条：探针显示任务条 bbox `y=2092.09375`，未滚入视口时没有 DOM/dhtmlx 拖拽事件。

## 已审查点

- E2E 现在在拖拽前执行 `scrollIntoViewIfNeeded()` 并断言 `toBeInViewport()`。
- 防回归断言保留：PATCH URL 必须指向 `plan-dhtmlx-e2e/items/dhtmlx-item-rush`，请求体必须包含 `plannedStartTime/plannedEndTime`。
- 临时探针已移除；`rg` 未发现 `dhtmlx-drag-debug`、`debugEvents` 或临时 `console.log`。

## 风险

- 该用例验证真实 dhtmlx 在 Chromium 下的鼠标拖拽链路；不同浏览器的拖拽行为尚未扩展覆盖。
