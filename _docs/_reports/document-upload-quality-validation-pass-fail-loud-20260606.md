# DocumentUpload 质量知识发布前校验通过 fail-loud 证据

日期：2026-06-06

## 范围

- A 轨质量切片：`DocumentUpload.vue` 质量知识再训练发布前校验通过写入失败。
- 目标：校验通过证据写入失败时不能产生未处理 Vue 事件，也不能把历史记录伪装成已完成。

## 变更

- `src/frontend/src/components/knowledge/DocumentUpload.vue`
  - `handleQualityRetrainingValidationPass` 增加最小 `try/catch`。
  - 写入失败时展示：`质量知识发布前校验通过写入失败，当前训练集仍未进入可发布状态：...`。
  - 失败时直接返回，不写入上传历史。
- `src/frontend/tests/unit/document-upload.test.ts`
  - 新增回归：`rerunQualityKnowledgeRetrainingValidationPass` 抛出 `validation pass storage unavailable` 时，页面显示 `role="alert"`，历史记录仍为空。

## RED/GREEN

- RED：
  - `npm run test:unit -- tests/unit/document-upload.test.ts`
  - 结果：新增用例失败，Vue 报 `Unhandled error during execution of component event handler`，页面没有 `[role="alert"]`。
- GREEN：
  - `npm run test:unit -- tests/unit/document-upload.test.ts`
  - 结果：19 passed。

## 验证

- `npm run test:unit:coverage`
  - 结果：84 files / 519 tests passed。
  - Global lines：77.58% -> 77.62%。
  - Global branches：56.97% -> 56.99%。
  - `DocumentUpload.vue` lines：71.29% -> 73.11%。
  - `DocumentUpload.vue` functions：52.38% -> 55.55%。
- `npm run test:e2e -- tests/e2e/knowledge.spec.ts`
  - 结果：生产构建完成，Chromium 14 passed。
  - 最大 JS chunk 仍为 817.50 kB。

## 结论

- 质量知识再训练发布前校验通过写入失败不再静默崩溃或假写历史。
- DocumentUpload 知识治理链继续收敛；下一步应继续处理下一训练集审批/校验、实验候选合并/影子验证等同步写入失败路径。
- B 轨发布门禁仍未关闭：hosted CI、staging/PostgreSQL、攻击链人工验证、安全签字、14 天灰度观察仍需单独证据。
