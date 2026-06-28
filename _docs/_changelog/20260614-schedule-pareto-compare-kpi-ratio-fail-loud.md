# 2026-06-14 Schedule Pareto Compare KPI Ratio Fail-Loud

## 变更
- 在多目标方案对比结果进入推荐卡片、KPI 表和采用入口前，新增 `utilizationRate`、`onTimeDeliveryRate`、`estimatedCompletionRate` 比率有效性校验。
- 当任一 KPI 比率不是有限数字，或超出 `0..1` 范围时，展示 `批量优化对比失败: 后端对比方案指标超出有效范围`，并阻止推荐方案与采用按钮渲染。
- 新增单元测试和真实 Chromium e2e 证据，覆盖「后端返回 `utilizationRate: 1.2`」场景。

## 验证
- `npm run test:unit -- tests/unit/pareto-compare.test.ts -t "KPI rates"`：1 passed。
- `npm run test:e2e -- tests/e2e/scheduling.spec.ts --project=chromium -g "指标超出有效范围"`：1 passed。
- `npm run test:unit -- tests/unit/pareto-compare.test.ts`：21 passed。
- `npm run test:e2e -- tests/e2e/scheduling.spec.ts --project=chromium`：67 passed。
- `npm run test:unit:coverage`：105 files / 723 tests passed；All lines 83.40%；ParetoCompare lines 93.20%。

## 发布说明
- 15 天灰度观察按 owner 指令跳过/后置，不作为本轮继续打磨排产多目标对比的阻断项。
