# 2026-06-06 DocumentUpload 知识复核真实浏览器证据

- 为 `DocumentUpload` 增加知识复核写入失败的 Playwright Chromium 用例。
- 覆盖本地治理复核写入失败时的 fail-loud alert、文档状态不变、审计历史不伪造。
- 验证新增用例单跑通过：`npm.cmd run test:e2e -- tests/e2e/knowledge.spec.ts -g "知识复核写入失败"`。
- 后续复跑整份 `knowledge.spec.ts`，生产构建后的 Chromium 15/15 passed。
