# ProductionBoard 异常证据写入失败真实浏览器证据报告

日期：2026-06-07

## 范围

- A 轨质量切片：`ProductionBoard` 异常上报后，异常管理/OTD 证据写入失败的 fail-loud 证据。
- 目标：后端异常已上报但本地异常管理/OTD 证据归档失败时，真实浏览器必须显示错误，不伪造风险联动成功状态，不写入不完整证据链。

## 变更

- `src/frontend/tests/e2e/production.spec.ts`
  - 新增真实 Chromium 用例：`异常证据写入失败时真实浏览器保留 fail-loud 告警且不伪造风险联动`。
  - 用例在异常上报确认前让 `Storage.prototype.setItem` 对 `aimes_production_anomaly_event` 抛错。

## 验证

- `npm.cmd run test:e2e -- tests/e2e/production.spec.ts -g "异常证据写入失败"`
  - Nuxt production build passed。
  - Chromium 1/1 passed。

## 断言覆盖

- 页面展示 `异常证据写入失败`。
- 错误说明包含 `后端异常已上报但异常管理/OTD 证据未归档`。
- 错误原因包含 `chromium production anomaly storage unavailable`。
- 异常上报 dialog 保留，便于用户重试或人工处置。
- 不展示 `异常已进入处置队列`。
- 不展示 `异常已上报：主轴温升异常，需暂停复核` 成功 toast。
- `aimes_production_anomaly_event` 未写入。
- `aimes_otd_evidence_chain` 未写入 `TRACE-PROD-ANOMALY-WO-001-OP-20`。

## 结论

- `ProductionBoard` 异常证据失败路径已有真实浏览器证据。
- 本片未修改生产代码，只补齐既有 fail-loud 行为的 Chromium 证据。
- B 轨发布闸门仍未关闭：hosted CI、PostgreSQL/staging、Attack Chain 人工验证、安全签字、首次灰度和 14 天观察仍需单独证据。
