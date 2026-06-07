# DocumentUpload 质量知识审批 fail-loud 证据

日期：2026-06-06

## 范围

- A 轨质量切片：`DocumentUpload.vue` 质量知识再训练审批写入失败。
- 目标：审批证据写入失败时不能抛出未处理事件，也不能把历史记录伪装成已完成；必须展示明确 alert。

## 变更

- `src/frontend/src/components/knowledge/DocumentUpload.vue`
  - `handleQualityRetrainingApproval` 增加最小 `try/catch`。
  - 审批写入失败时展示：`质量知识审批失败，当前训练集仍未进入发布前校验链路：...`。
  - 失败时直接返回，不写入上传历史。
- `src/frontend/tests/unit/document-upload.test.ts`
  - 新增 RED/GREEN 回归：审批函数抛出 `approval storage unavailable` 时页面显示 `role="alert"`，历史记录仍为空。
- `src/frontend/tests/e2e/knowledge.spec.ts`
  - 新增真实 Chromium 用例：上传接口返回 HTML fallback 时，行级状态显示 fail-loud 文案，上传历史保持空。

## RED/GREEN

- RED：
  - `npm run test:unit -- tests/unit/document-upload.test.ts`
  - 结果：新增用例失败，Vue 报 `Unhandled error during execution of component event handler`，页面没有 `[role="alert"]`。
- GREEN：
  - `npm run test:unit -- tests/unit/document-upload.test.ts`
  - 结果：17 passed。

## 验证

- `npm run test:unit:coverage`
  - 结果：84 files / 517 tests passed。
  - Global lines：77.50% -> 77.54%。
  - Global branches：56.94% -> 56.95%。
  - `DocumentUpload.vue` lines：67.48% -> 69.41%。
  - `DocumentUpload.vue` functions：46.03% -> 49.20%。
- `npm run test:e2e -- tests/e2e/knowledge.spec.ts`
  - 第一次：新增 e2e 断言错用了内部 guard 文案；真实浏览器实际显示 `API 返回了 HTML fallback，疑似后端不可用：/knowledge/documents`。
  - 修正断言后：生产构建完成，Chromium 14 passed。
  - 最大 JS chunk 仍为 817.50 kB。

## 结论

- 质量知识再训练审批失败不再静默崩溃或假写历史。
- 上传接口 HTML fallback 的真实浏览器行级 fail-loud 证据已补。
- B 轨发布门禁仍未关闭：hosted CI、staging/PostgreSQL、攻击链人工验证、安全签字、14 天灰度观察仍需单独证据。
