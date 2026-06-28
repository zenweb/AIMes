# Plan：急单插单多方案决策包深化

## 成功标准

- 急单插单推荐方案显示适用条件和取舍代价。
- 采纳后反馈链路保留这些信息。
- OTD 报表证据链能回放这些信息。
- 单测和真实浏览器 e2e 均通过。

## 执行

1. 用 TDD 先补 `persists rush-order scenario fit and tradeoff in the adoption feedback trail`。
2. 确认 RED 指向 `reasonDetail` 缺少适用条件和取舍代价。
3. 最小实现：扩展急单插单三方案数据、事件面板展示、采纳 trail 格式化。
4. 补强既有 scheduling e2e 的 UI、反馈、本地快照、报表证据链断言。
5. 跑单测和 Chromium e2e。

## 验证结果

- `npm run test:unit -- schedule-board.test.ts -t "persists rush-order scenario fit and tradeoff"`：passed
- `npm run test:unit -- schedule-board.test.ts`：22 passed
- `npm run test:e2e -- scheduling.spec.ts -g "急单插单生成多方案决策包并进入 OTD 复盘"`：1 passed
- `AIMES_E2E_PORT=4181 npm run test:e2e -- scheduling.spec.ts -g "急单插单生成多方案决策包并进入 OTD 复盘"`：production build + real Chrome，1 passed。
- 截图证据：`output/playwright/20260611-schedule-rush-decision/schedule-rush-scenario-package.png`、`output/playwright/20260611-schedule-rush-decision/report-rush-otd-evidence.png`。
