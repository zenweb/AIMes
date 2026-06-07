# 2026-06-06 DocumentUpload 下一训练集审批失败真实浏览器证据

## Changed

- `knowledge.spec.ts` 新增真实 Chromium 用例，覆盖 R3 下一训练集审批写入失败。
- 用例确认失败时页面 alert 可见，且不会伪造审批历史或审批审计号。

## Verification

- `npm.cmd run test:e2e -- tests/e2e/knowledge.spec.ts -g "下一轮训练集审批写入失败"` -> Nuxt production build passed，Chromium 1/1 passed。

## Release Gate Note

本次只关闭 A 轨 DocumentUpload 下一训练集审批失败浏览器证据缺口，不关闭 v1.0.0 B 轨发布闸门。
