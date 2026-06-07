# DocumentUpload 下一训练集重新灰度发布失败真实浏览器证据报告

日期：2026-06-06

## 范围

- A 轨质量切片：质量知识 R3 回滚后重开灰度前校验，再执行重新灰度发布时写入失败。
- 目标：真实 Chromium 中必须 fail loud，且不能伪造重新灰度发布审计或追踪证据。

## 变更

- `src/frontend/tests/e2e/knowledge.spec.ts`
  - 新增真实 Chromium 用例：`R3 重新灰度发布写入失败时真实浏览器展示 fail-loud 且不伪造历史`。
  - 真实点击 Admin 里的 `回滚到 R2`、`调整范围重开校验`，再回知识页重新运行灰度前校验并注入重新灰度发布写入失败。

## Verification

- `npm.cmd run test:e2e -- tests/e2e/knowledge.spec.ts -g "R3 重新灰度发布写入失败"`
- 结果：Nuxt production build passed，Chromium 1/1 passed。

## 覆盖

- 页面展示 `质量知识灰度发布失败`。
- 错误包含 `next training gray republish storage denied from chromium`。
- R3 卡片仍停留在 `灰度前校验已通过`，仍可见 `重新灰度发布 R3`。
- 历史表不出现：
  - `AUD-KG-QA-RETRAINING-R3-GRAY-REPUBLISH-20260521-001`
  - `TRACE-KG-QA-WO-DEMO-1018-OP-20-R3-GRAY-REPUBLISHED`

## 结论

- `DocumentUpload` 下一训练集重新灰度发布失败路径现在具备真实浏览器 fail-loud 证据。
- 本片未修改生产代码，只补齐既有行为的 Chromium 证据。
- B 轨发布闸门仍未关闭：hosted CI、PostgreSQL/staging、Attack Chain 人工验证、安全签字、首次灰度和 14 天观察仍需单独证据。
