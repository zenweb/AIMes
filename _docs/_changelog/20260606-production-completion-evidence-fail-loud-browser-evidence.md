# 2026-06-06 ProductionBoard 完工证据失败真实浏览器证据

## Changed

- `production.spec.ts` 新增真实 Chromium 用例，覆盖完工提交后 OTD/质量证据写入失败的 fail-loud 路径。
- 用例确认失败时保留完工报告 dialog，不显示 `完工报告已提交`，也不写入不完整 `aimes_otd_evidence_chain`。

## Verification

- `npm.cmd run test:e2e -- tests/e2e/production.spec.ts -g "完工证据写入失败"` -> Nuxt production build passed，Chromium 1/1 passed。

## Release Gate Note

本次只关闭 A 轨生产完工证据失败态真实浏览器证据缺口，不关闭 v1.0.0 B 轨发布闸门。
