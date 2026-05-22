# 2026-05-22 AI 排产多方案决策包

## 背景

`20260519-function-deepening-brainstorm.md` 的 P0 主线要求调度员 Agent 不只给一条建议，还要能解释方案取舍，并把人工采纳沉淀到 OTD 复盘。

## 改动

- `AI 排产 / 事件触发 Agent` 的当前建议新增 `Agent 多方案决策包`。
- 每个事件建议会显示 3 个候选方案，覆盖推荐方案、策略、OTD 影响、延期影响、换线影响和不选原因。
- 急单插单默认推荐 `加班插入`，同时展示 `强插当前窗口` 与 `换设备插入` 的成本和风险。
- 调度员点击 `采纳此建议` 后，反馈记录和 `OTD 复盘证据链` 会保留推荐方案、未选方案和决策依据，避免只记录一句“采纳 Agent 推荐”。
- 收紧排产 E2E 选择器，避免新增方案包后旧断言被重复文案干扰。

## 验证

- `npx vue-tsc --noEmit -p tsconfig.json`：passed
- `npm run test:e2e -- tests/e2e/scheduling.spec.ts -g "急单插单生成多方案决策包并进入 OTD 复盘"`：1 passed
- `npm run test:e2e -- tests/e2e/scheduling.spec.ts`：20 passed
