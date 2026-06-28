# Review：急单拖拽保存正式回写防回归

## 结论

单测层未发现阻断问题：现有产品代码已在拖拽保存成功后把 `formalScheduleWriteback` 切到 `saved`，新增测试可防止该闭环回退。

## 已核对

- 本片没有改 `ScheduleBoard.vue` 的业务逻辑。
- 新增测试通过 `task-drag-end` 触发真实父组件处理函数，而不是直接改内部状态。
- 测试同时断言 `rescheduleItem(planId, itemId, start, end)` 参数和工作台 `data-writeback=saved`。
- e2e 脚本新增开关保持默认行为不变；默认急单 e2e 仍通过。

## 未通过项

- 真实 dhtmlx 浏览器模式未建立成功：关闭 `VITE_SHOW_DEMO_HINTS` 和 `VITE_OFFLINE_DEMO` 后，`.gantt_task_line` 未渲染。
- 因此本片没有声称完成真实拖拽截图证据。

## 残余风险

- 真实 dhtmlx 初始化或后端/mock 数据依赖仍需单独排查。
- 在该问题解决前，拖拽保存成功闭环只有组件级证据，没有端到端浏览器拖拽证据。
