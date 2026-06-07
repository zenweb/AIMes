# 2026-06-06 RiskActionQueuePanel 风险 SLA 复核 fail-loud

## Changed

- 为风险 SLA 晨会复核包生成失败增加 fail-loud 保护。
- 为风险 SLA 晨会复核闭环失败增加 fail-loud 保护。
- 新增单测与真实 Chromium 证据，避免未处理事件或伪造已生成/已闭环状态。

## Verification

- RED：`npm.cmd run test:unit -- tests/unit/risk-action-queue-panel.test.ts` -> 2 failed，命中未处理 Vue event error。
- GREEN：`npm.cmd run test:unit -- tests/unit/risk-action-queue-panel.test.ts` -> 10/10 passed。
- `npm.cmd run test:e2e -- tests/e2e/risk.spec.ts -g "风险 SLA 晨会复核包写入失败"` -> Nuxt production build passed，Chromium 1/1 passed。

## Release Gate Note

本次只关闭 A 轨风险 SLA 复核失败态证据缺口，不关闭 v1.0.0 B 轨发布闸门。
