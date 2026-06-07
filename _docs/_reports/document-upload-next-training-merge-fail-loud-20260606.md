# DocumentUpload 下一训练集合并 fail-loud 证据

日期：2026-06-06

## 范围

- A 轨质量切片：`DocumentUpload.vue` 下一训练集候选合并写入失败。
- 目标：现场推荐反馈合并失败时不能产生未处理 Vue 事件，也不能把上传历史伪装成已完成。

## 变更

- `src/frontend/src/components/knowledge/DocumentUpload.vue`
  - `handleQualityNextTrainingMerge` 增加最小 `try/catch`。
  - 写入失败时展示：`质量知识下一训练集合并失败，当前现场反馈仍未进入灰度前审批链路：...`。
  - 失败时直接返回，不写入上传历史。
- `src/frontend/tests/unit/document-upload.test.ts`
  - 新增回归：`mergeQualityKnowledgeNextTrainingSetCandidate` 抛出 `next training merge storage unavailable` 时，页面显示 `role="alert"`，历史记录仍为空。

## RED/GREEN

- RED：
  - `npm run test:unit -- tests/unit/document-upload.test.ts`
  - 结果：新增用例失败，Vue 报 `Unhandled error during execution of component event handler`，页面没有 `[role="alert"]`。
- GREEN：
  - `npm run test:unit -- tests/unit/document-upload.test.ts`
  - 结果：22 passed。

## 验证

- `npm run test:unit:coverage`
  - 结果：84 files / 522 tests passed。
  - Global statements：74.18%。
  - Global branches：57.06%。
  - Global functions：67.37%。
  - Global lines：77.76%。
  - `DocumentUpload.vue` statements：73.48%。
  - `DocumentUpload.vue` branches：62.62%。
  - `DocumentUpload.vue` functions：65.07%。
  - `DocumentUpload.vue` lines：79.18%。
- `npm run test:e2e -- tests/e2e/knowledge.spec.ts`
  - 结果：生产构建完成，Chromium 14 passed。
  - 最大 JS chunk 仍为 817.50 kB。

## 结论

- 下一训练集候选合并写入失败不再静默崩溃或假写历史。
- DocumentUpload 知识治理链继续按既有功能精品化推进；下一步应处理实验候选合并、实验影子验证等同步写入失败路径。
- B 轨发布门禁仍未关闭：hosted CI、staging/PostgreSQL、攻击链人工验证、安全签字、14 天灰度观察仍需单独证据。
