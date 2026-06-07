# DocumentUpload 下一训练集灰度前校验失败真实浏览器证据报告

日期：2026-06-06

## 范围

- A 轨质量切片：质量知识 R3 下一训练集已合并并审批后，灰度前校验写入失败。
- 目标：真实 Chromium 中必须 fail loud，且不能伪造校验通过历史或校验审计号。

## 变更

- `src/frontend/tests/e2e/knowledge.spec.ts`
  - 新增真实 Chromium 用例：`下一轮训练集灰度前校验写入失败时真实浏览器展示 fail-loud 且不伪造历史`。
  - 真实点击 `合并现场反馈` 和 `批准 R3 训练集`。
  - 仅拦截 R3 灰度前校验通过写入。

## Verification

- `npm.cmd run test:e2e -- tests/e2e/knowledge.spec.ts -g "下一轮训练集灰度前校验写入失败"`
- 结果：Nuxt production build passed，Chromium 1/1 passed。

## 覆盖

- 页面展示 `质量知识下一训练集灰度前校验失败`。
- 错误包含 `next training validation storage denied from chromium`。
- R3 卡片仍停留在 `训练集已批准`，仍可见 `运行灰度前校验`。
- 历史表不出现：
  - `QK-TRAIN-20260521-R3_灰度前校验已通过`
  - `AUD-KG-QA-RETRAINING-R3-VALIDATION-PASS-20260521-001`

## 结论

- `DocumentUpload` 下一训练集灰度前校验失败路径现在具备真实浏览器 fail-loud 证据。
- 本片未修改生产代码，只补齐既有行为的 Chromium 证据。
- B 轨发布闸门仍未关闭：hosted CI、PostgreSQL/staging、Attack Chain 人工验证、安全签字、首次灰度和 14 天观察仍需单独证据。
