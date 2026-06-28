# Plan：急单采纳后正式排产计划回写闭环

## 成功标准

- 急单建议采纳后，工作台先显示“正式计划待优化或保存”。
- 点击“排产优化”后，真实浏览器必须命中 optimize API mock。
- optimize 成功后，工作台显示“正式排产计划已更新”。
- 单测和真实 Chrome e2e 都要通过。
- 证据落盘到 `output/playwright/20260612-schedule-rush-formal-writeback/`。

## 执行

1. 复核失败路径，确认 offline demo mode 会在 axios request interceptor 短路后端请求。
2. 最小改动 e2e：关闭 `aimes_offline_demo`，并加 optimize mock 命中计数。
3. 真实 Chrome 重跑急单多方案路径。
4. 截图保存工作台正式回写成功状态。
5. 重跑相关单测与 diff 检查。

## 验证结果

- `AIMES_E2E_PORT=4188 npm run test:e2e -- scheduling.spec.ts -g "急单插单生成多方案决策包并进入 OTD 复盘"`：production build + Chrome，1 passed。
- `npm run test:unit -- schedule-board.test.ts`：24 passed。
- `npm run test:unit -- schedule-agent-workbench-panel.test.ts`：4 passed。
- `git diff --check -- src/frontend/tests/e2e/scheduling.spec.ts src/frontend/src/components/schedule/ScheduleBoard.vue src/frontend/src/components/schedule/ScheduleAgentWorkbenchPanel.vue src/frontend/tests/unit/schedule-board.test.ts src/frontend/tests/unit/schedule-agent-workbench-panel.test.ts output/playwright/20260612-schedule-rush-formal-writeback/manifest.md`：exit 0。

## 未完成项

- 本片不关闭完整 v1 发布目标。
- 发布级 hosted CI、PostgreSQL/staging、首次灰度、安全签字、2 周无 P0/P1 观察窗口仍需独立验证。
