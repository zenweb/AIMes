# 2026-06-07 Issue - ProductionBoard 异常证据写入失败 Chromium 证据

## 问题

生产异常上报成功后，异常管理/OTD 证据写入失败路径已有组件逻辑，但缺少真实 Chromium 证据证明浏览器中不会静默失败或伪造风险联动成功状态。

## 影响

如果该路径静默失败，现场会以为异常已进入处置队列和 OTD 证据链，但异常中心、风险队列或审计回放可能缺失关键证据，影响生产异常闭环和发布级可追溯性。

## 处理

- 新增 e2e 打开 `WO-001` 的 `OP-20 / CNC 精加工` 异常上报 dialog。
- 注入 `aimes_production_anomaly_event` 写入失败：`chromium production anomaly storage unavailable`。
- 断言 fail-loud alert、dialog 保留、不出现成功 toast、不写入异常事件和 OTD trace。

## 状态

A 轨此切片已用 Chromium 定向验证通过。B 轨发布闸门仍未关闭。
