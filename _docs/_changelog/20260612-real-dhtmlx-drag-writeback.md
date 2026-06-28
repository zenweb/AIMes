# 2026-06-12 真实 dhtmlx 拖拽回写

## 变更

- 补齐排产页真实 dhtmlx 拖拽保存 E2E：关闭 offline demo/轻量 marker 后，真实任务条拖拽会命中正式排产项 PATCH。
- 修正 E2E 交互：拖拽前先将 `dhtmlx-item-rush` 任务条滚入视口，避免鼠标坐标落在屏幕外导致事件链未触发。
- 生成真实浏览器证据：`output/playwright/20260612-schedule-rush-formal-writeback/real-dhtmlx-drag-writeback-saved.png` 与 manifest。

## 验证

- `npm run test:unit -- gantt-chart.test.ts`
- `npm run test:unit -- gantt-mapper.test.ts`
- `npm run test:e2e -- scheduling.spec.ts -g "真实 dhtmlx 拖拽保存后回写正式排产计划" --reporter=line`
- `npm run test:e2e -- scheduling.spec.ts -g "真实 dhtmlx 甘特图在后端排产载荷可用时渲染任务条" --reporter=line`
- `npm run test:e2e -- scheduling.spec.ts -g "急单插单生成多方案决策包并进入 OTD 复盘" --reporter=line`
- `npm run lint`
