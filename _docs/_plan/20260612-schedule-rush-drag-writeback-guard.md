# Plan：急单拖拽保存正式回写防回归

## 成功标准

- 单测证明急单建议采纳后，拖拽保存成功会把正式计划回写状态从 `pending` 切到 `saved`。
- e2e 脚本能按需关闭轻量甘特图标记，为后续真实 dhtmlx 验证提供入口。
- 如果真实浏览器拖拽证据无法完成，必须 fail loud，记录命令、失败点和下一步，不继续空转。

## 执行

1. 读取 `handleTaskDragEnd` 数据流，确认 `rescheduleItem` 成功后已有 `formalScheduleWriteback.value = 'saved'`。
2. 新增 `schedule-board.test.ts` 拖拽保存成功单测。
3. 为 e2e 脚本增加 `AIMES_E2E_SHOW_DEMO_HINTS=false` 开关。
4. 尝试真实 dhtmlx 基线验证。
5. 记录真实 dhtmlx 未渲染阻断项。

## 验证结果

- `npm run test:unit -- schedule-board.test.ts -t "marks rush-order adoption as formally saved after a successful drag reschedule"`：1 passed。
- `npm run test:unit -- schedule-board.test.ts`：25 passed。
- `npm run test:unit -- schedule-agent-workbench-panel.test.ts`：4 passed。
- `AIMES_E2E_PORT=4191 npm run test:e2e -- scheduling.spec.ts -g "急单插单生成多方案决策包并进入 OTD 复盘"`：production build + Chrome，1 passed。

## 未完成项

- 真实 dhtmlx e2e 基线未通过，拖拽保存端到端截图未完成。
- 此项继续留作下一片，不把单测通过包装成完整浏览器拖拽证据。
