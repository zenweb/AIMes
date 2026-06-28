# 2026-06-14 Changelog - 推荐公式权重合计 fail-loud

## 变更
- `ParetoCompare` 将推荐公式基础校验与权重合计校验拆成两道检查。
- 当前端收到后端推荐公式三项权重合计不等于 `1` 时，明确 fail loud：`后端推荐公式权重合计无效`。
- 新增前端单测覆盖 `0.4 + 0.3 + 0.2 = 0.9` 的无效公式，确认推荐卡和采纳按钮不会渲染。

## 验证
- 红灯：
  - `npm run test:unit -- tests/unit/pareto-compare.test.ts -t "fails loud when backend recommendation formula weights do not add up to one"`：先失败，原因是 UI 仍展示 `权重 40/30/20`，没有 `.error-msg`。
- 绿灯：
  - `npm run test:unit -- tests/unit/pareto-compare.test.ts -t "fails loud when backend recommendation formula weights do not add up to one"`：1 passed，36 skipped。
  - `npm run test:unit -- tests/unit/pareto-compare.test.ts`：37 passed。
  - `npm run test:e2e -- tests/e2e/scheduling.spec.ts --project=chromium -g "批量方案反馈同步失败时真实浏览器保留本地目标切换并展示原因"`：1 passed。
  - `git diff --check -- src/frontend/src/components/schedule/ParetoCompare.vue src/frontend/tests/unit/pareto-compare.test.ts`：通过，仅 LF/CRLF warning。

## 范围说明
- 本片只精品化现有排产多目标对比推荐公式契约。
- 未新增优化目标、算法或页面。
- 15 天灰度观察按负责人指示跳过，不作为当前阻塞项。
