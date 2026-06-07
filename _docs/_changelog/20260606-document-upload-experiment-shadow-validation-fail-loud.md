# 2026-06-06 DocumentUpload 实验影子验证 fail-loud

## 变更

- `DocumentUpload.vue` 为 R7 实验影子验证写入增加失败处理。
- 写入失败时显示页面级 alert，并保留当前实验候选状态，不写入成功历史。
- `document-upload.test.ts` 增加实验影子验证写入失败回归。

## 验证

- `npm.cmd run test:e2e -- tests/e2e/knowledge.spec.ts -g "R7 影子验证写入失败"`：Nuxt production build passed，Chromium 1/1 passed。
- `npm run test:unit -- tests/unit/document-upload.test.ts`：24 passed。
- `npm run test:unit:coverage`：84 files / 524 tests passed。
- `npm run test:e2e -- tests/e2e/knowledge.spec.ts`：生产构建后 Chromium 14 passed。

## 备注

- 本切片继续收敛 DocumentUpload 既有功能，不扩大新范围。
- 本切片不关闭发布 B 轨门禁。
