# 2026-06-14 Review - 多目标对比换型分钟摘要不一致 Fail-Loud

## 结论
- 当前切片未发现新增阻塞问题。
- 后端返回的对比项换型分钟与计划摘要换型分钟不一致时，页面现在会明确失败，而不是继续展示互相冲突的 KPI。
- 该修复继续收紧多目标对比采用前契约，避免推荐说明、KPI 图表和采纳动作建立在不可信摘要上。

## 关注点
- 旧行为会在推荐理由、KPI 表和图表中展示顶层 `totalChangeoverMinutes`，但计划摘要可携带另一个 `plan.totalChangeoverMinutes`。
- 本轮只在 `plan.totalChangeoverMinutes !== undefined` 时比较，兼容旧响应中不返回计划摘要换型分钟的情况。
- 工作树存在大量历史改动，本轮未回滚或整理无关内容。

## 已验证
- `npm run test:unit -- tests/unit/pareto-compare.test.ts -t "changeover minutes differ"`：1 passed。
- `npm run test:e2e -- tests/e2e/scheduling.spec.ts --project=chromium -g "换型分钟与计划摘要不一致"`：1 passed。
- `npm run test:unit -- tests/unit/pareto-compare.test.ts`：30 passed。
- `npm run test:e2e -- tests/e2e/scheduling.spec.ts --project=chromium`：76 passed。
- `npm run test:unit:coverage`：105 files / 732 tests passed，lines 83.45%，`ParetoCompare.vue` lines 93.81%。

## 未完成
- 未执行 15 天灰度观察；该项已由 owner 明确跳过/延期。
