# 2026-06-06 Audit Replay 质量灰度决策失败真实浏览器证据

## Changed

- 为审计决策回放新增真实 Chromium 质量灰度决策失败态证据。
- 当质量灰度决策后端读取失败且本地没有可解释审计记录时，面板显示 `质量灰度决策加载失败`。
- 保留已有本地兜底语义：本地已有有效质量知识审计记录时，后端失败仍可展示成功回放。
- `queryQualityKnowledgeEvidence()` 不再吞掉后端错误，由 backend-first utility 决定兜底或 fail-loud。

## Tests

- `npm.cmd run test:unit -- tests/unit/quality-knowledge-sample-sync.test.ts -t "fails loud when backend gray release decisions fail"`：Vitest 1/1 passed。
- `npm.cmd run test:e2e -- tests/e2e/audit.spec.ts -g "质量灰度决策接口失败"`：Nuxt production build passed，Chromium 1/1 passed。
- `npm.cmd run test:unit -- tests/unit/quality-knowledge-sample-sync.test.ts`：Vitest 21/21 passed。
- `npm.cmd run test:e2e -- tests/e2e/audit.spec.ts`：Nuxt production build passed，Chromium 17/17 passed。

## Release Gate Note

- 本次只推进 A 轨道真实浏览器质量证据。
- B 轨道发布闸门仍未关闭：hosted CI、PostgreSQL/staging、Attack Chain 人工验证、安全签字、14 天灰度观察。
