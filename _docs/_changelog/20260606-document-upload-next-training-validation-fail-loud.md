# 2026-06-06 DocumentUpload 下一训练集校验 fail-loud

## 变更

- `DocumentUpload.vue` 为下一训练集灰度前校验写入增加失败处理。
- 写入失败时显示页面级 alert，并保留当前训练集状态，不写入成功历史。
- `document-upload.test.ts` 增加下一训练集校验写入失败回归。

## 验证

- `npm run test:unit -- tests/unit/document-upload.test.ts`：21 passed。
- `npm run test:unit:coverage`：84 files / 521 tests passed。
- `npm run test:e2e -- tests/e2e/knowledge.spec.ts`：生产构建后 Chromium 14 passed。

## 备注

- 本切片继续收敛 DocumentUpload 既有功能，不扩大新范围。
- 本切片不关闭发布 B 轨门禁。
