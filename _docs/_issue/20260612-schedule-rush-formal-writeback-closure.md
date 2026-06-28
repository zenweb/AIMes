# Issue：急单采纳后排产优化 e2e 被 offline demo mode 短路

## 状态

已处理。

## 问题

急单多方案 e2e 已 mock `POST /api/v1/scheduling/optimize`，但用例没有显式关闭 `aimes_offline_demo`。当 offline demo mode 为 true 时，axios request interceptor 会直接抛出 `OfflineDemoApiError`，请求不会到达 Playwright route，导致工作台停留在“正式计划待优化或保存”。

## 影响

- 浏览器用例无法证明排产优化真的命中后端边界。
- “正式排产计划已更新”状态缺少真实 Chrome 证据。
- 继续乱试业务代码会浪费 token，并可能破坏已通过的单测状态机。

## 处理

- 在该 e2e 用例中点击优化前显式设置 `localStorage.aimes_offline_demo = false`。
- 增加 `optimizeRequests` 计数并断言大于 0。
- 保存工作台 saved 状态截图与 manifest。

## 验证

- `AIMES_E2E_PORT=4188 npm run test:e2e -- scheduling.spec.ts -g "急单插单生成多方案决策包并进入 OTD 复盘"`：1 passed。
- `npm run test:unit -- schedule-board.test.ts`：24 passed。
- `npm run test:unit -- schedule-agent-workbench-panel.test.ts`：4 passed。
