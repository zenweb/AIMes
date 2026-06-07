# 2026-06-06 Admin 质量灰度扩大决策失败真实浏览器证据

## Changed

- `admin.spec.ts` 新增真实 Chromium 用例，覆盖 R3 质量灰度监控扩大决策写入失败。
- 用例确认失败时页面 alert 可见，且不会伪造扩大决策审计号或追踪号。

## Verification

- `npm.cmd run test:e2e -- tests/e2e/admin.spec.ts -g "R3 灰度扩大决策写入失败"` -> Nuxt production build passed，Chromium 1/1 passed。

## Release Gate Note

本次只关闭 A 轨 Admin 质量灰度扩大决策失败浏览器证据缺口，不关闭 v1.0.0 B 轨发布闸门。
