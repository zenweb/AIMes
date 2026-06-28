# 2026-06-14 Schedule Pareto Compare Work Order Count Fail-Loud

## 变更
- 在多目标方案对比结果进入推荐卡片、KPI 表和采用入口前，新增 `totalWorkOrders` 与 `plan.items.length` 一致性校验。
- 当后端声明工单数与计划明细数量不一致时，展示 `批量优化对比失败: 后端对比方案工单数与计划明细不一致`，并阻止推荐方案与采用按钮渲染。
- 新增单元测试和真实 Chromium e2e 证据，覆盖「后端声明 2 个工单但只返回 1 条计划明细」场景。

## 验证
- `npm run test:unit -- tests/unit/pareto-compare.test.ts -t "work order count"`：1 passed。
- `npm run test:e2e -- tests/e2e/scheduling.spec.ts --project=chromium -g "工单数与计划明细"`：1 passed。
- `npm run test:unit -- tests/unit/pareto-compare.test.ts`：19 passed。
- `npm run test:e2e -- tests/e2e/scheduling.spec.ts --project=chromium`：65 passed。
- `npm run test:unit:coverage`：105 files / 721 tests passed；All lines 83.39%；ParetoCompare lines 93.05%。

## 发布说明
- 15 天灰度观察按 owner 指令跳过/后置，不作为本轮继续打磨排产多目标对比的阻断项。
