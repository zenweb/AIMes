# 2026-06-14 Review - 多目标对比准时率摘要不一致 Fail-Loud

## 结论
- 当前切片未发现新增阻塞问题。
- 后端返回的对比项准时率与计划摘要准时率不一致时，页面现在会明确失败，而不是继续展示互相冲突的 KPI。
- 该修复继续收紧多目标对比采用前契约，避免推荐说明、KPI 图表和采纳动作建立在不可信摘要上。

## 关注点
- 旧行为会在推荐理由、KPI 表、雷达图和条形图中展示顶层 `onTimeDeliveryRate`，但计划摘要可携带另一个 `plan.onTimeDeliveryRate`。
- 本轮按现有 `SchedulePlanDto` 契约直接比较必填摘要字段，未为缺字段旧响应新增兼容分支。
- 完整 Chromium 套件本轮 78/78 passed，上一片记录的既有反馈同步 flaky 未复现。
- 工作树存在大量历史改动，本轮未回滚或整理无关内容。

## 已验证
- `npm run test:unit -- tests/unit/pareto-compare.test.ts -t "on-time delivery rate differs"`：1 passed。
- `npm run test:e2e -- tests/e2e/scheduling.spec.ts --project=chromium -g "准时率与计划摘要不一致"`：1 passed。
- `npm run test:unit -- tests/unit/pareto-compare.test.ts`：32 passed。
- `npm run test:e2e -- tests/e2e/scheduling.spec.ts --project=chromium`：78 passed。
- `npm run test:unit:coverage`：105 files / 734 tests passed，lines 83.46%，`ParetoCompare.vue` lines 93.93%。

## 未完成
- 未执行 15 天灰度观察；该项已由 owner 明确跳过/延期。
