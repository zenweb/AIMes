# 2026-06-14 Schedule Pareto Compare Changeover Minutes Fail-Loud

## 变更
- 在多目标方案对比结果进入推荐卡片、雷达图、KPI 表和采用入口前，新增 `totalChangeoverMinutes` 有效性校验。
- 当后端返回的换型分钟不是有限数字，或小于 0 时，展示 `批量优化对比失败: 后端对比方案换型分钟无效`，并阻止推荐方案与采用按钮渲染。
- 新增单元测试和真实 Chromium e2e 证据，覆盖「后端返回 `totalChangeoverMinutes: -5`」场景。

## 验证
- `npm run test:unit -- tests/unit/pareto-compare.test.ts -t "changeover minutes"`：先失败后通过。
- `npm run test:e2e -- tests/e2e/scheduling.spec.ts --project=chromium -g "换型分钟为负数"`：先失败后通过。
- `npm run test:unit -- tests/unit/pareto-compare.test.ts`：22 passed。
- `npm run test:e2e -- tests/e2e/scheduling.spec.ts --project=chromium`：68 passed。
- `npm run test:unit:coverage`：105 files / 724 tests passed；All lines 83.41%；ParetoCompare lines 93.28%。

## 发布说明
- 15 天灰度观察按 owner 指令跳过/后置，不作为本轮继续打磨排产多目标对比的阻断项。
