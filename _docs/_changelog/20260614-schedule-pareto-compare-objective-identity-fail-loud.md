# 2026-06-14 Schedule Pareto Compare Objective Identity Fail-Loud

## 变更
- 在多目标方案对比结果进入推荐卡片、雷达图、KPI 表、Tab 和采用入口前，新增 `objective` / `objectiveLabel` 目标身份校验。
- 当后端返回的方案缺少目标标识或目标名称时，展示 `批量优化对比失败: 后端对比方案缺少目标标识或名称`，并阻止推荐方案与采用按钮渲染。
- 新增单元测试和真实 Chromium e2e 证据，覆盖「后端返回空 `objectiveLabel`」场景。

## 验证
- `npm run test:unit -- tests/unit/pareto-compare.test.ts -t "objective label"`：先失败后通过。
- `npm run test:e2e -- tests/e2e/scheduling.spec.ts --project=chromium -g "目标名称为空"`：先失败后通过。
- `npm run test:unit -- tests/unit/pareto-compare.test.ts`：23 passed。
- `npm run test:e2e -- tests/e2e/scheduling.spec.ts --project=chromium`：69 passed。
- `npm run test:unit:coverage`：105 files / 725 tests passed；All lines 83.41%；ParetoCompare lines 93.35%。

## 发布说明
- 15 天灰度观察按 owner 指令跳过/后置，不作为本轮继续打磨排产多目标对比的阻断项。
