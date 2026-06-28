# 2026-06-14 Changelog - 推荐分数组成公式一致性 fail-loud

## 变更
- `ParetoCompare` 新增推荐分数组成与推荐公式的一致性校验。
- 前端按后端返回的 `RecommendationScoreFormula` 重新计算三项贡献：
  - 利用率贡献 = 利用率 * 利用率权重。
  - 准时率贡献 = 准时率 * 准时率权重。
  - 换线贡献 = `max(0, 1 - 换线分钟 / 换线归一分钟) * 换线权重`。
- 当后端返回的三项贡献与公式不一致时，明确 fail loud：`后端推荐分数组成与公式不一致`。
- 校验容差为 `0.001`，兼容后端三位小数返回，同时仍能拦截明显口径漂移。

## 验证
- 红灯：
  - `npm run test:unit -- tests/unit/pareto-compare.test.ts -t "fails loud when backend recommendation score breakdown does not match the formula"`：先失败，UI 仍展示推荐卡。
- 绿灯：
  - `npm run test:unit -- tests/unit/pareto-compare.test.ts -t "fails loud when backend recommendation score breakdown does not match the formula"`：1 passed，37 skipped。
  - `npm run test:unit -- tests/unit/pareto-compare.test.ts`：38 passed。
  - `npm run test:e2e -- tests/e2e/scheduling.spec.ts --project=chromium -g "批量方案反馈同步失败时真实浏览器保留本地目标切换并展示原因"`：1 passed。
  - `git diff --check -- src/frontend/src/components/schedule/ParetoCompare.vue src/frontend/tests/unit/pareto-compare.test.ts src/frontend/tests/e2e/scheduling.spec.ts`：通过，仅 LF/CRLF warning。

## 范围说明
- 本片只精品化现有排产多目标对比推荐解释链路。
- 未新增优化目标、算法或页面。
- 15 天灰度观察按负责人指示跳过，不作为当前阻塞项。
