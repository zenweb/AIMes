# 2026-06-12 急单拖拽保存正式回写防回归

## 背景

继续按“现有功能精品化”深化 AI 排产急单插单链路。本片聚焦“采纳急单建议后，通过拖拽保存正式排产计划”的状态闭环。

## 改动

- `schedule-board.test.ts` 新增拖拽保存成功路径：急单建议采纳后先为 `pending`，Gantt 发出 `task-drag-end` 且 `rescheduleItem` 成功后切到 `saved`。
- `scripts/e2e.mjs` 新增 `AIMES_E2E_SHOW_DEMO_HINTS=false` 开关，让 e2e 可选择关闭轻量甘特图标记，用于后续真实 dhtmlx 验证。

## 验证

- `npm run test:unit -- schedule-board.test.ts -t "marks rush-order adoption as formally saved after a successful drag reschedule"`：1 passed。
- `npm run test:unit -- schedule-board.test.ts`：25 passed。
- `npm run test:unit -- schedule-agent-workbench-panel.test.ts`：4 passed。
- `AIMES_E2E_PORT=4191 npm run test:e2e -- scheduling.spec.ts -g "急单插单生成多方案决策包并进入 OTD 复盘"`：production build + Chrome，1 passed。
- `git diff --check -- src/frontend/scripts/e2e.mjs src/frontend/tests/unit/schedule-board.test.ts`：exit 0，仅 Windows LF/CRLF 提示。

## Fail Loud

- 真实 dhtmlx 拖拽浏览器证据未完成。
- 复现命令：`AIMES_E2E_PORT=4190 AIMES_E2E_SHOW_DEMO_HINTS=false AIMES_E2E_OFFLINE_DEMO=false npm run test:e2e -- scheduling.spec.ts -g "甘特图视图渲染"`。
- 结果：失败，`.gantt_task_line` 在 10s 内未渲染；重试后 90s 超时。
- 失败上下文：`src/frontend/test-results/scheduling-Scheduling-排产甘特图-甘特图视图渲染-chromium/error-context.md`、`src/frontend/test-results/scheduling-Scheduling-排产甘特图-甘特图视图渲染-chromium-retry1/error-context.md`、`src/frontend/test-results/scheduling-Scheduling-排产甘特图-甘特图视图渲染-chromium-retry1/trace.zip`。
