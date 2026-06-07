# DocumentUpload 实验候选合并 fail-loud 证据

日期：2026-06-06

## 范围

- A 轨质量切片：`DocumentUpload.vue` R6 实验候选补样合并写入失败。
- 目标：实验候选合并失败时不能产生未处理 Vue 事件，也不能把上传历史伪装成已完成。

## 变更

- `src/frontend/src/components/knowledge/DocumentUpload.vue`
  - `handleQualityExperimentCandidateMerge` 增加最小 `try/catch`。
  - 写入失败时展示：`质量实验候选合并失败，当前 R6 补样实验仍未进入影子验证准备链路：...`。
  - 失败时直接返回，不写入上传历史。
- `src/frontend/tests/unit/document-upload.test.ts`
  - 新增回归：`mergeQualityExperimentNegativeSampleCandidate` 抛出 `experiment candidate merge storage unavailable` 时，页面显示 `role="alert"`，历史记录仍为空。

## RED/GREEN

- RED：
  - `npm run test:unit -- tests/unit/document-upload.test.ts`
  - 结果：新增用例失败，Vue 报 `Unhandled error during execution of component event handler`，页面没有 `[role="alert"]`。
- GREEN：
  - `npm run test:unit -- tests/unit/document-upload.test.ts`
  - 结果：23 passed。

## 验证

- `npm run test:unit:coverage`
  - 结果：84 files / 523 tests passed。
  - Global statements：74.23%。
  - Global branches：57.07%。
  - Global functions：67.48%。
  - Global lines：77.80%。
  - `DocumentUpload.vue` statements：75.65%。
  - `DocumentUpload.vue` branches：63.13%。
  - `DocumentUpload.vue` functions：69.84%。
  - `DocumentUpload.vue` lines：81.25%。
- `npm run test:e2e -- tests/e2e/knowledge.spec.ts`
  - 第一次 144s 工具超时，未返回断言失败；随后以 240s 运行窗口复跑。
  - 复跑结果：生产构建完成，Chromium 14 passed。
  - 最大 JS chunk 仍为 817.50 kB。

## 结论

- R6 实验候选补样合并写入失败不再静默崩溃或假写历史。
- DocumentUpload 知识治理链继续按既有功能精品化推进；下一步应处理实验影子验证等同步写入失败路径。
- B 轨发布门禁仍未关闭：hosted CI、staging/PostgreSQL、攻击链人工验证、安全签字、14 天灰度观察仍需单独证据。
