# 2026-06-05 Document Upload Payload Guard Changelog

## Change

- 选片依据：按覆盖率增量选择 `DocumentUpload.vue`；该组件是知识库导入入口，也是 AI 助手证据基础。
- 新增红灯测试：文档上传接口返回 HTML / 非业务载荷时，不能标记为已上传，也不能写入空审计历史。
- 修复：新增 `isDocumentUploadResponse()`，要求上传响应包含 `documentId`、`fileName`、`chunkCount`、`uploadedAt` 和 `status`。
- 坏载荷复用已有行级上传失败路径，通过 `.status-err[role="alert"]` 暴露 `后端返回非文档上传载荷`。

## Validation

- 红灯：目标测试先失败，旧行为把坏响应标记为“已上传”，并写入空历史行。
- 绿灯：`npm run test:unit -- tests/unit/document-upload.test.ts`：1 file / 14 tests passed。
- `npm run lint`：通过。
- `npm run test:unit -- tests/unit/auth.store.test.ts tests/unit/router-auth.test.ts tests/unit/gantt-chart.test.ts`：3 files / 19 tests passed，用于复核一次全量覆盖率中的非相关超时失败。
- `npm run test:unit:coverage`：83 files / 492 tests passed。
- 覆盖率：总行覆盖率 `76.72%`；`DocumentUpload.vue` 行覆盖率 `65.80%`。

## Release Boundary

- 本片属于 A-track 知识库导入可靠性证据。
- Hosted CI、staging rehearsal、Attack Chain A/B/C、安全签字、首次灰度和 14 天无 P0/P1 观察仍需 B-track 独立证据。
