# 2026-06-14 Review - 多目标对比分组数无效 Fail-Loud

## 结论
- 当前切片未发现新增阻塞问题。
- 后端返回负数或非有限 `groupCount` 时，页面现在会明确失败，而不是展示误导性的分组 KPI。
- 该修复继续收紧多目标对比采用前契约，避免坏指标进入推荐说明和采纳流程。

## 关注点
- 旧行为会将 `groupCount: -1` 直接渲染到 KPI 表和柱状图 tooltip，并保留“采用此方案”按钮。
- 本轮只校验对比项顶层 `groupCount`；后端 `plan.groupCount` 与顶层值是否一致可作为后续切片继续深挖。
- 工作树存在大量历史改动，本轮未回滚或整理无关内容。

## 已验证
- `npm run test:unit -- tests/unit/pareto-compare.test.ts -t "invalid group count"`：1 passed。
- `npm run test:e2e -- tests/e2e/scheduling.spec.ts --project=chromium -g "分组数无效"`：1 passed。
- `npm run test:unit -- tests/unit/pareto-compare.test.ts`：28 passed。
- `npm run test:e2e -- tests/e2e/scheduling.spec.ts --project=chromium`：74 passed。
- `npm run test:unit:coverage`：105 files / 730 tests passed，lines 83.44%，`ParetoCompare.vue` lines 93.68%。

## 未完成
- 未执行 15 天灰度观察；该项已由 owner 明确跳过/延期。
