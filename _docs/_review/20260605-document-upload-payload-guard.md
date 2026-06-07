# 2026-06-05 Document Upload Payload Guard Review

## Findings

- 审计结论：修复上传接口坏载荷污染上传历史的问题。
- 风险场景：`uploadDocument()` 返回 HTML / 非业务对象时，旧逻辑仍把队列项标为 `done`，并写入空 `documentId` / `fileName` 的历史行。
- 修复方式：新增 `isDocumentUploadResponse()`，坏载荷进入已有 catch 分支，队列行显示错误。
- 可访问性覆盖：坏载荷错误通过 `.status-err` 暴露，`role="alert"` / `aria-live="assertive"`。
- 范围控制：未新增上传功能，未改变文件类型校验、超大文件校验、质量知识发布/回滚逻辑。

## Evidence

- TDD 红灯：目标测试先失败，证明旧行为会记录坏历史。
- 目标单测：`npm run test:unit -- tests/unit/document-upload.test.ts`，14 tests passed。
- 全量 lint：`npm run lint` 通过。
- 全量前端覆盖率：`npm run test:unit:coverage`，492 tests passed。
- 覆盖率增量：`DocumentUpload.vue` 行覆盖率 `64.89% -> 65.80%`。

## Residual Risk

- `DocumentUpload.vue` 函数覆盖率仍约 `45%`，后续可继续覆盖导入证据坏载荷、质量知识版本坏载荷和治理文档落库边界。
- 本片不关闭 v1.0.0 的真实发布闸门。
