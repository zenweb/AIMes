# 2026-06-12 真实 dhtmlx 拖拽证据稳定化

- 加固 `src/frontend/tests/e2e/scheduling.spec.ts` 的真实 dhtmlx 拖拽保存用例：
  - 抽出 `adoptRushSuggestion(page)`，用真实点击生成/采纳急单建议，并等待“急单插入重排建议”和“正式计划待优化或保存”。
  - 抽出 `dragRushTask(page)`，确认轻量 marker 不存在，等待任务条与 `.gantt_task_content` 可见、bbox 稳定后，从 dhtmlx 内容层拖拽更长距离。
  - 增加可观察的点击重试：仅当真实点击后 UI 没出现急单建议时重试一次，最终仍由 UI 断言失败并保留 Playwright 证据。
- 加固 `src/frontend/scripts/e2e.mjs`：
  - 当命令参数包含 `真实 dhtmlx` 时，自动关闭 `VITE_SHOW_DEMO_HINTS` 和 `VITE_OFFLINE_DEMO`，避免真实 dhtmlx 证据误跑到轻量 demo marker。
- 验证：
  - `npm run test:unit -- gantt-chart.test.ts`：16 passed。
  - `npm run test:unit -- gantt-mapper.test.ts`：8 passed。
  - `npm run test:unit -- schedule-board.test.ts -t "keeps drag reschedule save failures visible after reloading the plan"`：1 passed / 24 skipped。
  - `npm run test:e2e -- scheduling.spec.ts -g "真实 dhtmlx 拖拽保存" --reporter=line --retries=0`：连续验证通过，2 passed。
  - `npm run lint`：通过。
