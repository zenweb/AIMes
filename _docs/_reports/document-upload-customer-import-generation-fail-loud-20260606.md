# DocumentUpload 客户工单导入生成 fail-loud 证据

日期：2026-06-06

## 范围

- A 轨质量切片：`DocumentUpload.vue` 客户真实工单导入样例生成写入失败。
- 目标：点击生成客户工单样例时，写入失败不能产生未处理 Vue 事件，也不能把上传历史伪装成已完成。

## 变更

- `src/frontend/src/components/knowledge/DocumentUpload.vue`
  - `prepareCustomerOrderImport` 增加最小 `try/catch`。
  - 写入失败时展示：`客户工单导入样例生成失败，当前样例仍未进入 POC 验收证据链：...`。
  - `writeCustomerOrderImportEvidence()` 返回空时也转成明确错误，避免静默无反馈。
  - 失败时直接返回，不写入上传历史、不更新导入样例状态。
- `src/frontend/tests/unit/document-upload.test.ts`
  - 新增回归：`writeCustomerOrderImportEvidence` 抛出 `customer import generation storage unavailable` 时，页面显示 `role="alert"`，导入指标保持待生成，历史记录仍为空。

## RED/GREEN

- RED：
  - `npm run test:unit -- tests/unit/document-upload.test.ts`
  - 结果：新增用例失败，Vue 报 `Unhandled error during execution of native event handler`，页面没有 `[role="alert"]`。
- GREEN：
  - `npm run test:unit -- tests/unit/document-upload.test.ts`
  - 结果：25 passed。

## 验证

- `npm run test:unit:coverage`
  - 结果：84 files / 525 tests passed。
  - Global statements：74.28%。
  - Global branches：57.09%。
  - Global functions：67.56%。
  - Global lines：77.84%。
  - `DocumentUpload.vue` statements：77.73%。
  - `DocumentUpload.vue` branches：64.64%。
  - `DocumentUpload.vue` functions：73.01%。
  - `DocumentUpload.vue` lines：82.75%。
- `npm run test:e2e -- tests/e2e/knowledge.spec.ts`
  - 结果：生产构建完成，Chromium 14 passed。
  - 最大 JS chunk 仍为 817.50 kB。

## 结论

- 客户工单导入样例生成写入失败不再静默崩溃或假写历史。
- DocumentUpload 知识治理链继续按既有功能精品化推进；下一步应重新扫描该组件剩余用户触发动作，确认没有遗漏的同步写入 fail-loud 缺口。
- B 轨发布门禁仍未关闭：hosted CI、staging/PostgreSQL、攻击链人工验证、安全签字、14 天灰度观察仍需单独证据。
