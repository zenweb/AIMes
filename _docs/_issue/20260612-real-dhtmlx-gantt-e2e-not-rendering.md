# Issue：真实 dhtmlx 甘特图 e2e 模式任务条未渲染

## 状态

已解决。

## 问题

为补“拖拽保存成功后正式排产计划已更新”的真实浏览器证据，尝试关闭 e2e 轻量甘特图标记和 offline demo：

`AIMES_E2E_PORT=4190 AIMES_E2E_SHOW_DEMO_HINTS=false AIMES_E2E_OFFLINE_DEMO=false npm run test:e2e -- scheduling.spec.ts -g "甘特图视图渲染"`

结果 `.gantt_task_line` 未在 10s 内渲染，重试后测试 90s 超时。

## 影响

- 当前无法可靠生成真实 dhtmlx 拖拽截图证据。
- 不能把轻量甘特图标记当成真实拖拽证据。
- 拖拽保存闭环目前只有单测证据，缺端到端浏览器证据。

## 已知证据

- 首次失败上下文：`src/frontend/test-results/scheduling-Scheduling-排产甘特图-甘特图视图渲染-chromium/error-context.md`
- 重试失败上下文：`src/frontend/test-results/scheduling-Scheduling-排产甘特图-甘特图视图渲染-chromium-retry1/error-context.md`
- Trace：`src/frontend/test-results/scheduling-Scheduling-排产甘特图-甘特图视图渲染-chromium-retry1/trace.zip`

## 已采取动作

- `scripts/e2e.mjs` 新增 `AIMES_E2E_SHOW_DEMO_HINTS=false` 开关，便于后续重复验证真实 dhtmlx 路径。
- 保留默认 e2e 行为，避免影响既有 Chrome 证据链。
- `GanttChart` 将内部 `GanttData` 转换为 dhtmlx 期望的 `{ data, links }`。
- 设置 `gantt.config.root_id = '0'`，匹配 mapper 输出的设备分组父级。
- `gantt.parse()` 前复制 tasks/links 快照，避免 dhtmlx 写入内部字段后触发 Vue deep watcher 反馈循环。
- `scheduling.spec.ts` 调整真实 dhtmlx mock 路由顺序，避免 `/equipment/bottlenecks` 被普通 `/equipment` route 抢占。

## 根因

真实浏览器临时探针显示，API 已命中且 `gantt.parse()`/`gantt.render()` 均能执行，但 `loadData()` 在短时间内重复触发。单测复现为 dhtmlx 给 parsed task 写入内部字段后触发组件 deep watcher，再次清空并 parse，形成反馈循环。

## 验证

- `npm run test:unit -- gantt-chart.test.ts`：15 passed。
- `npm run test:unit -- gantt-mapper.test.ts`：8 passed。
- `AIMES_E2E_SHOW_DEMO_HINTS=false AIMES_E2E_OFFLINE_DEMO=false npm run test:e2e -- scheduling.spec.ts -g "真实 dhtmlx 甘特图在后端排产载荷可用时渲染任务条"`：1 passed。
- `npm run test:e2e -- scheduling.spec.ts -g "急单插单生成多方案决策包并进入 OTD 复盘"`：1 passed。
- `npm run lint`：passed。

## 下一步

- 基线已通过；下一步补真实 dhtmlx 拖拽保存端到端证据。
