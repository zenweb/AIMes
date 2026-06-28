# 2026-06-14 Plan - 真实浏览器证据收口

## Success Criteria
- 不等待 15 天灰度观察，灰度观察标记为 owner-deferred。
- 不扩新功能，只修当前真实浏览器红项。
- 真实 Chromium 中原红的 ParetoCompare 用例通过。
- Chromium 全量 E2E 无失败。

## Execution
- 读取 Playwright `error-context.md`，确认 `.recommend-card` 缺失的直接原因是 compare response 被公式契约拦截。
- 对照绿色 mock 样例，确认 `recommendationScoreFormula` 是成功路径必需字段。
- 只修改 `src/frontend/tests/e2e/scheduling.spec.ts` 的目标 mock，补齐公式对象。
- 跑定向与全量验证。

## Stop Condition
- 若同一用例继续失败，必须回到 error-context 找新根因，不继续叠加猜测式修改。
- 当前 stop condition 已满足：完整 Chromium E2E 为 415 passed, 2 skipped。
