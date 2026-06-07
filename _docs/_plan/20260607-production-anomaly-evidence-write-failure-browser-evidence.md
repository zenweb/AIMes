# 2026-06-07 Plan - ProductionBoard 异常证据写入失败 Chromium 证据

## 成功标准

- 真实 Chromium 能覆盖异常上报后证据写入失败路径。
- 失败时页面必须 fail loud，保留异常上报 dialog。
- 失败时不得展示成功 toast 或风险联动成功状态。
- 失败时不得写入 `aimes_production_anomaly_event` 或伪造 `TRACE-PROD-ANOMALY-WO-001-OP-20` OTD 证据。

## 执行

- 在 `src/frontend/tests/e2e/production.spec.ts` 增加单条定向 e2e。
- 通过 `Storage.prototype.setItem` 注入异常证据写入失败。
- 只跑目标用例，避免重复烧整套浏览器回归成本。

## 验证

```powershell
npm.cmd run test:e2e -- tests/e2e/production.spec.ts -g "异常证据写入失败"
```

结果：Nuxt production build passed，Chromium `1 passed`。

## Stop Condition

- 目标 Chromium 用例通过。
- 文档证据补齐到 report/changelog/review/todo/issue/plan。
- B 轨仍以 fail-loud 方式保留为未关闭发布阻断项。
