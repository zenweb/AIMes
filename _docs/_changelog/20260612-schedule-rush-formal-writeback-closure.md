# 2026-06-12 急单采纳后正式排产计划回写闭环

## 背景

继续按“现有功能精品化”约定深化 AI 排产急单插单链路。本片承接 2026-06-11 的边界修正：采纳 Agent 建议后，工作台先显示“正式计划待优化或保存”，随后必须在真实保存动作成功后切换为“正式排产计划已更新”。

## 改动

- `scheduling.spec.ts` 为急单多方案 e2e 明确关闭 `aimes_offline_demo`，避免 axios request interceptor 在本地直接短路 optimize API。
- e2e 增加 `optimizeRequests` 命中计数，断言排产优化 mock 至少命中一次。
- e2e 在排产优化后截图保存调度员 Agent 工作台的正式回写状态。
- 新增真实浏览器证据目录：`output/playwright/20260612-schedule-rush-formal-writeback/`。

## 验证

- `AIMES_E2E_PORT=4188 npm run test:e2e -- scheduling.spec.ts -g "急单插单生成多方案决策包并进入 OTD 复盘"`：production build + Chrome，1 passed。
- `npm run test:unit -- schedule-board.test.ts`：24 passed。
- `npm run test:unit -- schedule-agent-workbench-panel.test.ts`：4 passed。
- `git diff --check -- <touched files>`：exit 0，仅 Windows LF/CRLF 提示。

## 证据

- `output/playwright/20260612-schedule-rush-formal-writeback/schedule-rush-formal-writeback-saved.png`
- `output/playwright/20260612-schedule-rush-formal-writeback/manifest.md`

## 发布闸门

本片只关闭急单排产前端精品化链路中的正式回写证据缺口；v1 发布闸门仍需单独追踪，不能据此声明整体发布已达成。
