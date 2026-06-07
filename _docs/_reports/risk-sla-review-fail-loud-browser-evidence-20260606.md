# RiskActionQueuePanel 风险 SLA 复核失败真实浏览器证据报告

日期：2026-06-06

## 范围

- A 轨质量切片：`RiskActionQueuePanel` 的风险 SLA 晨会复核包生成/闭环失败态。
- 目标：用户点击生成或闭环时，持久化失败必须 fail loud，不能出现未处理事件，也不能伪造已生成或已闭环状态。

## 变更

- `src/frontend/src/components/risk/RiskActionQueuePanel.vue`
  - `generateSlaReview` 增加最小 `try/catch`，写入失败时展示 `风险 SLA 复核包生成失败：...` 并保留空态。
  - `closeSlaReview` 增加最小 `try/catch`，闭环失败时展示 `风险 SLA 复核闭环失败：...` 并保留原复核状态。
- `src/frontend/tests/unit/risk-action-queue-panel.test.ts`
  - 新增生成失败和闭环失败回归。
- `src/frontend/tests/e2e/risk.spec.ts`
  - 新增真实 Chromium 用例：`风险 SLA 晨会复核包写入失败时真实浏览器展示 fail-loud 且不伪造复核卡`。

## RED/GREEN

- RED：
  - `npm.cmd run test:unit -- tests/unit/risk-action-queue-panel.test.ts`
  - 结果：2 failed；Vue 报 `Unhandled error during execution of native event handler`，页面没有 `[role="alert"]`。
- GREEN：
  - `npm.cmd run test:unit -- tests/unit/risk-action-queue-panel.test.ts`
  - 结果：10/10 passed。

## 真实浏览器

- `npm.cmd run test:e2e -- tests/e2e/risk.spec.ts -g "风险 SLA 晨会复核包写入失败"`
  - 结果：Nuxt production build passed，Chromium 1/1 passed。
  - 覆盖：真实浏览器内拦截 `aimes_risk_sla_review` 写入并抛错，断言页面展示 `风险 SLA 复核包生成失败`，空态仍显示，`.sla-review-card` 不出现，处置留痕不伪造“已生成”。

## 结论

- 风险 SLA 晨会复核包生成/闭环失败现在具备 fail-loud 保护和定向真实浏览器证据。
- 本片只推进 A 轨既有功能精品化。
- B 轨发布闸门仍未关闭：Hosted CI、PostgreSQL/staging、Attack Chain 人工验证、安全签字、首次灰度与 14 天观察仍需单独证据。
