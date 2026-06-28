# 2026-06-14 Schedule Pareto Compare Missing Items List Fail-Loud

## 变更
- 在多目标方案对比结果进入空列表、推荐目标、计划明细等校验前，新增 `result.items` 必须是数组的合同守卫。
- 当后端返回 200 但缺少 `items` 方案列表时，展示 `批量优化对比失败: 后端对比结果缺少方案列表`。
- 阻止空态、推荐卡片和采用按钮渲染，避免调度员看到 JS TypeError。

## 验证
- RED：缺少 `items` 时单元和 Chromium 均显示 `Cannot read properties of undefined (reading 'length')`。
- GREEN：`npm run test:unit -- tests/unit/pareto-compare.test.ts -t "omits the plan list"`：1 passed。
- GREEN：`npm run test:e2e -- tests/e2e/scheduling.spec.ts --project=chromium -g "缺少方案列表"`：1 passed。
- `npm run test:unit -- tests/unit/pareto-compare.test.ts`：20 passed。
- `npm run test:e2e -- tests/e2e/scheduling.spec.ts --project=chromium`：66 passed。
- `npm run test:unit:coverage`：105 files / 722 tests passed；All lines 83.40%；ParetoCompare lines 93.10%。

## 备注
- 已审计 `groupCount`，后端 `ScheduleOptimizationResult.GroupCount` 当前不映射 `ScheduleAssignmentData.GroupId` 到前端明细，前端无法可靠反推，未盲目增加该校验。
