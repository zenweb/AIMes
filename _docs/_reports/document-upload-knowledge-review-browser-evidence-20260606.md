# 2026-06-06 DocumentUpload 知识复核真实浏览器证据

## 目标

补齐 `DocumentUpload` 知识复核写入失败分支的真实 Chromium 证据，确认失败时 fail-loud，且不会伪造审计记录或把待索引文档改成已索引。

## 变更

- 在 `src/frontend/tests/e2e/knowledge.spec.ts` 新增用例：`知识复核写入失败时真实浏览器展示 fail-loud 且不伪造审计记录`。
- 用真实浏览器覆盖 `localStorage.setItem('aimes_knowledge_governance_reviews', ...)` 抛错场景。
- 断言页面出现 `知识文档索引复核失败` alert。
- 断言 `CNC-01 主轴维护手册` 仍保持 `V1.1`、`索引：待索引`、`已过期`。
- 断言上传历史不出现 `AUD-KG-REINDEX-20260520-001`。

## 验证

- PASS：`npm.cmd run test:e2e -- tests/e2e/knowledge.spec.ts -g "知识复核写入失败"`
  - Production Nuxt build completed.
  - Chromium: 1/1 passed.
- PASS：`npm.cmd run test:e2e -- tests/e2e/knowledge.spec.ts`
  - Production Nuxt build completed.
  - Chromium: 15/15 passed.

## 结论

本轮新增的知识复核失败态已有真实浏览器 PASS 证据。质量知识灰度/实验候选跨页进入 Admin 治理面的断点已在后续修复中关闭，整份 Knowledge e2e 已拿到 Chromium 15/15 passed。
