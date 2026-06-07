# 2026-06-06 DocumentUpload 知识复核 fail-loud

## 变更

- `DocumentUpload.vue` 为文档索引复核写入增加失败处理。
- 写入失败时显示页面级 alert，并保留当前文档治理状态，不写入成功历史。
- `document-upload.test.ts` 增加知识复核写入失败回归。
- 同步扫描 `DocumentUpload` 当前用户触发写入点，确认已知剩余缺口为本轮修复项。

## 验证

- `npm run test:unit -- tests/unit/document-upload.test.ts`：26 passed。
- `npm run test:unit:coverage`：84 files / 526 tests passed。
- `npm run test:e2e -- tests/e2e/knowledge.spec.ts`：生产构建后 Chromium 14 passed。

## 备注

- 本切片继续收敛 DocumentUpload 既有功能，不扩大新范围。
- 本切片不关闭发布 B 轨门禁。
