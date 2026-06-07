# 2026-06-06 Audit Replay 质量推荐反馈失败真实浏览器证据

## Changed

- 为审计决策回放新增真实 Chromium 质量推荐反馈失败态证据。
- 当质量推荐反馈后端读取失败且本地没有可解释审计记录时，面板显示 `质量推荐反馈加载失败`。
- 保留基础回放卡片，避免单个证据链失败导致审计回放整体空白。

## Tests

- `npm.cmd run test:unit -- tests/unit/quality-knowledge-sample-sync.test.ts -t "backend recommendation feedback fails"`：Vitest 1/1 passed。
- `npm.cmd run test:e2e -- tests/e2e/audit.spec.ts -g "质量推荐反馈接口失败"`：Nuxt production build passed，Chromium 1/1 passed。
- `npm.cmd run test:unit -- tests/unit/quality-knowledge-sample-sync.test.ts`：Vitest 22/22 passed。
- `npm.cmd run test:e2e -- tests/e2e/audit.spec.ts`：Nuxt production build passed，Chromium 18/18 passed。

## Release Gate Note

- 本次只推进 A 轨道真实浏览器质量证据。
- B 轨道发布闸门仍未关闭：hosted CI、PostgreSQL/staging、Attack Chain 人工验证、安全签字、14 天灰度观察。
