# 2026-06-06 DocumentUpload R7 影子验证真实浏览器证据缺口

## Issue

`DocumentUpload` 的 R7 影子验证写入失败态已有单测和业务保护，但缺少失败态本身的真实 Chromium 证据。

## Resolution

- 在 `tests/e2e/knowledge.spec.ts` 新增 `R7 影子验证写入失败时真实浏览器展示 fail-loud 且不伪造历史`。
- 用真实浏览器拦截 `aimes_quality_knowledge_retraining_versions` 的 R7 写入并抛错。
- 断言页面展示 fail-loud，R7 候选仍保持 `影子验证待执行`，上传历史不伪造通过记录。

## Verification

- `npm.cmd run test:e2e -- tests/e2e/knowledge.spec.ts -g "R7 影子验证写入失败"`：Nuxt production build passed，Chromium 1/1 passed。

## Release Gate Note

该 issue 只关闭 A 轨真实浏览器证据缺口，不关闭 hosted CI、staging/PostgreSQL、Attack Chain 人工验证、安全签字或 14 天灰度观察。
