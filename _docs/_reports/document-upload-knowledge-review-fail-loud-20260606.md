# DocumentUpload 知识复核 fail-loud 证据

日期：2026-06-06

## 范围

- A 轨质量切片：`DocumentUpload.vue` 文档索引复核写入失败。
- 同步完成一次组件级触发点审计：按钮、上传、客户导入、`KnowledgeGovernancePanel` 事件和质量知识链写入点。
- 目标：文档复核写入失败时不能产生未处理 Vue 事件，也不能把上传历史伪装成已完成。

## 审计结论

- 已有 fail-loud 覆盖：
  - 上传接口坏载荷 / 上传失败。
  - 客户工单导入刷新失败 / 生成失败。
  - 质量再训练审批、校验、校验通过、发布、回滚。
  - 下一训练集合并、审批、校验、灰度发布。
  - 实验候选合并、影子验证、影子灰度发布。
  - 质量知识证据刷新失败。
- 本轮发现剩余缺口：
  - `handleKnowledgeReview` 直接调用 `writeKnowledgeGovernanceReview(...)`，写入失败时会未处理事件，且缺少页面级失败反馈。

## 变更

- `src/frontend/src/components/knowledge/DocumentUpload.vue`
  - `handleKnowledgeReview` 增加最小 `try/catch`。
  - 写入失败时展示：`知识文档索引复核失败，当前文档仍未进入可审计治理闭环：...`。
  - 失败时直接返回，不更新治理文档状态，不写入上传历史。
- `src/frontend/tests/unit/document-upload.test.ts`
  - `writeKnowledgeGovernanceReview` 改为可控 hoisted mock。
  - 新增回归：`writeKnowledgeGovernanceReview` 抛出 `knowledge review storage unavailable` 时，页面显示 `role="alert"`，历史记录仍为空。

## RED/GREEN

- RED：
  - `npm run test:unit -- tests/unit/document-upload.test.ts`
  - 结果：新增用例失败，Vue 报 `Unhandled error during execution of component event handler`，页面没有 `[role="alert"]`。
- GREEN：
  - `npm run test:unit -- tests/unit/document-upload.test.ts`
  - 结果：26 passed。

## 验证

- `npm run test:unit:coverage`
  - 结果：84 files / 526 tests passed。
  - Global statements：74.30%。
  - Global branches：57.10%。
  - Global functions：67.60%。
  - Global lines：77.86%。
  - `DocumentUpload.vue` statements：78.33%。
  - `DocumentUpload.vue` branches：64.64%。
  - `DocumentUpload.vue` functions：74.60%。
  - `DocumentUpload.vue` lines：83.40%。
- `npm run test:e2e -- tests/e2e/knowledge.spec.ts`
  - 结果：生产构建完成，Chromium 14 passed。
  - 最大 JS chunk 仍为 817.50 kB。

## 结论

- 文档索引复核写入失败不再静默崩溃或假写历史。
- 本轮扫描后，`DocumentUpload` 当前已知用户触发写入点均有 fail-loud 覆盖或已有行级失败反馈。
- B 轨发布门禁仍未关闭：hosted CI、staging/PostgreSQL、攻击链人工验证、安全签字、14 天灰度观察仍需单独证据。
