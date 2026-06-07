# Admin 质量灰度回滚决策失败真实浏览器证据报告

日期：2026-06-06

## 范围

- A 轨质量切片：Admin Agent 治理中 R3 质量推荐灰度监控的 `回滚到 R2` 决策写入失败。
- 目标：真实 Chromium 中必须 fail loud，且不能伪造回滚决策审计或追踪证据。

## 变更

- `src/frontend/tests/e2e/admin.spec.ts`
  - 新增真实 Chromium 用例：`R3 灰度回滚决策写入失败时真实浏览器展示 fail-loud 且不伪造决策`。
  - 复用 `seedR3GrayReleaseDemo`，拦截 `aimes_quality_knowledge_gray_release_decisions` 中 R3 rollback 决策写入。

## Verification

- `npm.cmd run test:e2e -- tests/e2e/admin.spec.ts -g "R3 灰度回滚决策写入失败"`
- 结果：Nuxt production build passed，Chromium 1/1 passed。

## 覆盖

- 页面展示 `质量推荐灰度决策失败`。
- 错误包含 `quality gray rollback decision storage denied from chromium`。
- R3 监控卡仍保留 `扩大灰度` 和 `回滚到 R2` 操作。
- 卡片不出现：
  - `AUD-KG-QA-RETRAINING-R3-GRAY-ROLLBACK-20260521-001`
  - `TRACE-KG-QA-WO-DEMO-1018-OP-20-R3-GRAY-ROLLED-BACK`

## 结论

- Admin 质量灰度回滚决策失败路径现在具备真实浏览器 fail-loud 证据。
- 本片未修改生产代码，只补齐既有行为的 Chromium 证据。
- B 轨发布闸门仍未关闭：hosted CI、PostgreSQL/staging、Attack Chain 人工验证、安全签字、首次灰度和 14 天观察仍需单独证据。
