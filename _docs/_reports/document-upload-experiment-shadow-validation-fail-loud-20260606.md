# DocumentUpload 实验影子验证 fail-loud 证据

日期：2026-06-06

## 范围

- A 轨质量切片：`DocumentUpload.vue` R7 实验影子验证写入失败。
- 目标：影子验证写入失败时不能产生未处理 Vue 事件，也不能把上传历史伪装成已完成。

## 变更

- `src/frontend/src/components/knowledge/DocumentUpload.vue`
  - `handleQualityExperimentShadowValidation` 增加最小 `try/catch`。
  - 写入失败时展示：`质量实验影子验证失败，当前 R7 影子验证仍未进入可灰度发布状态：...`。
  - 失败时直接返回，不写入上传历史。
- `src/frontend/tests/unit/document-upload.test.ts`
  - 新增回归：`runQualityExperimentShadowValidationCandidate` 抛出 `shadow validation storage unavailable` 时，页面显示 `role="alert"`，历史记录仍为空。

## RED/GREEN

- RED：
  - `npm run test:unit -- tests/unit/document-upload.test.ts`
  - 结果：新增用例失败，Vue 报 `Unhandled error during execution of component event handler`，页面没有 `[role="alert"]`。
- GREEN：
  - `npm run test:unit -- tests/unit/document-upload.test.ts`
  - 结果：24 passed。

## 验证

- `npm.cmd run test:e2e -- tests/e2e/knowledge.spec.ts -g "R7 影子验证写入失败"`
  - 结果：Nuxt production build passed，Chromium 1/1 passed。
  - 覆盖：真实浏览器内拦截 `aimes_quality_knowledge_retraining_versions` 写入 R7 影子验证结果时抛错，断言页面展示 `质量实验影子验证失败`，R7 候选仍停留 `影子验证待执行`，历史不出现 `QK-TRAIN-20260521-R7_R7影子验证已通过` 或 `AUD-KG-QA-RETRAINING-R7-SHADOW-VALIDATION-PASS-20260521-001`。
- `npm run test:unit:coverage`
  - 结果：84 files / 524 tests passed。
  - Global statements：74.28%。
  - Global branches：57.10%。
  - Global functions：67.56%。
  - Global lines：77.84%。
  - `DocumentUpload.vue` statements：77.40%。
  - `DocumentUpload.vue` branches：64.64%。
  - `DocumentUpload.vue` functions：73.01%。
  - `DocumentUpload.vue` lines：82.81%。
- `npm run test:e2e -- tests/e2e/knowledge.spec.ts`
  - 结果：生产构建完成，Chromium 14 passed。
  - 最大 JS chunk 仍为 817.50 kB。

## 结论

- R7 实验影子验证写入失败不再静默崩溃或假写历史，并已补齐失败态本身的真实 Chromium 证据。
- DocumentUpload 知识治理链继续按既有功能精品化推进；下一步应处理客户工单导入生成失败等剩余高价值 fail-loud 路径。
- B 轨发布门禁仍未关闭：hosted CI、staging/PostgreSQL、攻击链人工验证、安全签字、14 天灰度观察仍需单独证据。
