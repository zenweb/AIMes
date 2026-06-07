# 2026-06-06 DocumentUpload 质量知识审批 fail-loud

## 变更

- `DocumentUpload.vue` 为质量知识再训练审批写入增加失败处理。
- 审批写入失败时显示页面级 alert，并保留当前训练集状态，不写入成功历史。
- `document-upload.test.ts` 增加审批写入失败回归。
- `knowledge.spec.ts` 增加上传接口 HTML fallback 的真实 Chromium 行级 fail-loud 覆盖。

## 验证

- `npm run test:unit -- tests/unit/document-upload.test.ts`：17 passed。
- `npm run test:unit:coverage`：84 files / 517 tests passed。
- `npm run test:e2e -- tests/e2e/knowledge.spec.ts`：生产构建后 Chromium 14 passed。

## 备注

- 真实浏览器层的 HTML fallback 由 `http.ts` 先行识别，用户可见文案为 `API 返回了 HTML fallback...`。
- 本切片不关闭发布 B 轨门禁。
