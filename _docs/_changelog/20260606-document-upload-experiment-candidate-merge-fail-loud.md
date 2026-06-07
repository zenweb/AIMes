# 2026-06-06 DocumentUpload 实验候选合并 fail-loud

## 变更

- `DocumentUpload.vue` 为 R6 实验候选补样合并写入增加失败处理。
- 写入失败时显示页面级 alert，并保留当前实验候选状态，不写入成功历史。
- `document-upload.test.ts` 增加实验候选合并写入失败回归。

## 验证

- `npm run test:unit -- tests/unit/document-upload.test.ts`：23 passed。
- `npm run test:unit:coverage`：84 files / 523 tests passed。
- `npm run test:e2e -- tests/e2e/knowledge.spec.ts`：生产构建后 Chromium 14 passed。

## 备注

- 本切片继续收敛 DocumentUpload 既有功能，不扩大新范围。
- e2e 第一次因 144s 工具窗口超时未返回断言结果；240s 窗口复跑通过。
- 本切片不关闭发布 B 轨门禁。
