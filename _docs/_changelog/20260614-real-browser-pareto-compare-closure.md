# 2026-06-14 Changelog - 真实浏览器多目标对比证据闭环

## 变更
- 按 owner 指示跳过 15 天灰度观察等待，将灰度观察保持为后置项，不作为当前继续工作的阻塞项。
- 修正 `scheduling.spec.ts` 中“多目标方案优化缺少计划时真实浏览器保留待采纳状态”的 `optimize-compare` mock。
- 补齐该 mock 的 `recommendationScoreFormula`，让测试通过现有 ParetoCompare 推荐公式契约校验后，再验证采用方案时 `/optimize` 缺少 `plan` 的 fail-loud 路径。

## 验证
- `npm run test:e2e -- tests/e2e/scheduling.spec.ts --project=chromium -g "多目标方案优化缺少计划时真实浏览器保留待采纳状态"`：1 passed。
- `npm run test:e2e -- tests/e2e/scheduling.spec.ts --project=chromium -g "多目标对比推荐方案不是最高分时真实浏览器展示 fail-loud 告警|多目标方案优化缺少计划时真实浏览器保留待采纳状态"`：2 passed。
- `npm run test:e2e -- --project=chromium`：415 passed, 2 skipped。
- `git diff --check -- src/frontend/tests/e2e/scheduling.spec.ts`：无 whitespace error，仅 LF/CRLF warning。

## 范围说明
- 未放宽 `ParetoCompare` 产品校验。
- 未扩新功能，只修正真实浏览器测试数据以匹配既有推荐公式契约。
- 后端基线与前端覆盖率结果沿用本轮已完成证据：后端全量绿、前端 unit coverage 绿；本片新增的是 Chromium 全量闭环。
