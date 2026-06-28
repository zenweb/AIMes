# 2026-06-14 Review - 多目标对比推荐最高分 Fail-Loud

## 结论
- 当前切片未发现新增阻塞问题。
- 后端推荐目标不是综合得分最高方案时，页面现在会 fail-loud，而不是继续展示“综合得分最高”和采纳入口。
- 该修复收紧了多目标对比采用前契约，避免用户基于错误推荐做排产方案采纳。

## 关注点
- 前端复算公式与当前后端 `SchedulingAppService` 公式保持一致；后续如果后端公式调整，需要同步更新前端契约或改由后端返回可审计分数字段。
- 本轮实现允许并列最高分中的任意目标作为推荐，降低 tie 场景误报。
- 完整 Chromium 套件本轮退出码为 0，但 `批量方案反馈同步失败时真实浏览器保留本地目标切换并展示原因` 首次断言 `.warnings-bar` 文案时失败，retry #1 passed，属于仍需单独收敛的既有 flaky 风险。
- 工作树存在大量历史改动，本轮未回滚或整理无关内容。

## 已验证
- `npm run test:unit -- tests/unit/pareto-compare.test.ts -t "recommended objective is not the highest scoring"`：1 passed。
- `npm run test:e2e -- tests/e2e/scheduling.spec.ts --project=chromium -g "推荐方案不是最高分"`：1 passed。
- `npm run test:unit -- tests/unit/pareto-compare.test.ts`：33 passed。
- `npm run test:e2e -- tests/e2e/scheduling.spec.ts --project=chromium`：78 passed，1 flaky 重试后 passed。
- `npm run test:unit:coverage`：105 files / 735 tests passed，lines 83.47%，`ParetoCompare.vue` lines 94.05%。

## 未完成
- 未执行 15 天灰度观察；该项已由 owner 明确跳过/延期。
- 未在本片处理 feedback warning 文案竞态；建议作为下一片真实浏览器稳定性修复。

## 追加 Review - 推荐分数组成
- 新增真实 Chromium 覆盖推荐卡可审计分数组成，用户不再只能看到泛化的“综合得分最高”。
- 当前实现未改动推荐公式，只将既有 `recommendationScore` 结果和输入指标展示出来，避免扩大后端契约。
- 定向验证：`npm run test:e2e -- --grep "批量方案反馈同步失败时真实浏览器保留本地目标切换并展示原因"`，1 passed。
