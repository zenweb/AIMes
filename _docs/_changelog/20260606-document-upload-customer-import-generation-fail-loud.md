# 2026-06-06 DocumentUpload 客户工单导入生成 fail-loud

## 变更

- `DocumentUpload.vue` 为客户真实工单导入样例生成写入增加失败处理。
- 写入失败或未写入本地证据存储时显示页面级 alert，并保留当前导入样例状态，不写入成功历史。
- `document-upload.test.ts` 增加客户工单导入生成写入失败回归。

## 验证

- `npm run test:unit -- tests/unit/document-upload.test.ts`：25 passed。
- `npm run test:unit:coverage`：84 files / 525 tests passed。
- `npm run test:e2e -- tests/e2e/knowledge.spec.ts`：生产构建后 Chromium 14 passed。

## 备注

- 本切片继续收敛 DocumentUpload 既有功能，不扩大新范围。
- 本切片不关闭发布 B 轨门禁。
