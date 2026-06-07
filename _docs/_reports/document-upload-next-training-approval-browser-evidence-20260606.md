# DocumentUpload 下一训练集审批失败真实浏览器证据报告

日期：2026-06-06

## 范围

- A 轨质量切片：质量知识 R3 下一训练集候选合并后，审批写入失败。
- 目标：真实 Chromium 中必须 fail loud，且不能伪造审批历史或审批审计号。

## 变更

- `src/frontend/tests/e2e/knowledge.spec.ts`
  - 新增真实 Chromium 用例：`下一轮训练集审批写入失败时真实浏览器展示 fail-loud 且不伪造历史`。
  - 先通过真实按钮 `合并现场反馈` 生成 R3 merged 状态。
  - 拦截 `aimes_quality_knowledge_retraining_versions` 中 R3 approval 写入，模拟本地证据落盘失败。

## Verification

- `npm.cmd run test:e2e -- tests/e2e/knowledge.spec.ts -g "下一轮训练集审批写入失败"`
- 结果：Nuxt production build passed，Chromium 1/1 passed。

## 覆盖

- 页面展示 `质量知识下一训练集审批失败`。
- 错误包含 `next training approval storage denied from chromium`。
- R3 卡片仍停留在 `现场反馈已合并`，仍可见 `批准 R3 训练集`。
- 历史表不出现：
  - `QK-TRAIN-20260521-R3_R3训练集审批`
  - `AUD-KG-QA-RETRAINING-R3-APPROVAL-20260521-001`

## 结论

- `DocumentUpload` 下一训练集审批失败路径现在具备真实浏览器 fail-loud 证据。
- 本片未修改生产代码，只补齐既有行为的 Chromium 证据。
- B 轨发布闸门仍未关闭：hosted CI、PostgreSQL/staging、Attack Chain 人工验证、安全签字、首次灰度和 14 天观察仍需单独证据。
