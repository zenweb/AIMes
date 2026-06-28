# 2026-06-14 Anomaly 分流通道锁定与证据链

## 变更
- `AnomalyBoard.vue` 在异常分流确认成功后锁定对应分流按钮。
- 已确认分流再次点击不会重复写入下游处置证据。
- 新增单测覆盖分流成功后按钮锁定与去重写入。
- 在真实浏览器质量异常分流链路中补充锁定态断言。

## 验证
- `npm run test:unit -- tests/unit/anomaly-board.test.ts`
- `npm run test:e2e -- tests/e2e/anomaly.spec.ts -g "质量异常确认分流后进入风险队列、排产复核和 OTD 审计" --project=chromium`
- `npm run test:unit:coverage`

