# Plan：急单采纳反馈与正式计划回写边界

## 成功标准

- 急单建议采纳后，用户能看到反馈已进入复盘。
- 同一界面必须明确说明尚未写入正式排产计划。
- Agent 工作台执行追踪不能把事件建议采纳显示成正式计划已落地。
- 单测和真实 Chrome e2e 证明用户可见行为。

## 执行

1. 读取排产采纳数据流，确认 `adoptAgentSuggestion` 只调用反馈记录，普通急单事件没有正式计划写入。
2. 先补失败测试，证明当前提示没有正式计划边界。
3. 最小实现：反馈同步提示补充正式计划边界；工作台执行追踪拆分复盘与正式计划状态。
4. 补强真实 Chrome e2e 断言。
5. 跑目标单测和 e2e。

## 验证结果

- `npm run test:unit -- schedule-board.test.ts -t "keeps rush-order adoption separate from formal schedule execution"`：passed
- `npm run test:unit -- schedule-agent-workbench-panel.test.ts`：3 passed
- `npm run test:unit -- schedule-board.test.ts`：23 passed
- `AIMES_E2E_PORT=4184 npm run test:e2e -- scheduling.spec.ts -g "急单插单生成多方案决策包并进入 OTD 复盘"`：production build + real Chrome，1 passed

