# 2026-06-05 Document Upload Import Evidence Retry

## 已完成
- 在 `DocumentUpload.vue` 中为客户工单导入证据刷新补上重试加载按钮。
- 刷新失败后不再只停留在静态告警，重试成功会恢复真实导入样例并清空错误提示。
- 这条恢复路径复用了现有后端优先读取逻辑，没有改动导入样例的证据字段或发布行为。

## 验证
- `npm run test:unit -- tests/unit/document-upload.test.ts`：通过，16/16。
- `npm run lint`：通过。
- `npm run test:unit:coverage`：通过，499/499。
