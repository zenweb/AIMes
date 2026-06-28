# 2026-06-12 真实 dhtmlx 甘特图任务条恢复

## 变更

- 修复 `GanttChart` 真实 dhtmlx 模式下无法稳定渲染任务条的问题。
- `gantt.parse()` 改为接收 dhtmlx 期望的 `{ data, links }` 载荷。
- 设置 `gantt.config.root_id = '0'`，匹配 mapper 输出的顶层设备父级。
- `gantt.parse()` 前复制 tasks/links 快照，避免 dhtmlx 给任务对象写入内部字段后触发 Vue deep watcher 反馈循环。
- 真实 dhtmlx e2e mock 中修正 `/equipment/bottlenecks` 与 `/equipment` 路由匹配顺序，避免瓶颈接口被普通设备接口抢占。

## 验证

- `npm run test:unit -- gantt-chart.test.ts`：15 passed。
- `npm run test:unit -- gantt-mapper.test.ts`：8 passed。
- `AIMES_E2E_SHOW_DEMO_HINTS=false AIMES_E2E_OFFLINE_DEMO=false npm run test:e2e -- scheduling.spec.ts -g "真实 dhtmlx 甘特图在后端排产载荷可用时渲染任务条"`：1 passed。
- `npm run test:e2e -- scheduling.spec.ts -g "急单插单生成多方案决策包并进入 OTD 复盘"`：1 passed。
- `npm run lint`：passed。
