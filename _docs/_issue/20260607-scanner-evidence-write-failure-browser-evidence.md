# 2026-06-07 Issue - ScannerBoard 扫码证据写入失败 Chromium 证据

## 问题

`ScannerBoard` 已有扫码证据写入失败的组件级 fail-loud 逻辑和单元测试，但缺少真实 Chromium 证据证明现场浏览器中不会静默失败或伪造扫码到站证据。

## 影响

如果扫码证据失败时被误认为已确认，报表中心、审计回放和生产报工入口可能依据不存在的 `TRACE-QR-WO-RUSH-9001-ARRIVAL` 继续流转，破坏现场执行证据链的可信度。

## 处理

- 新增 e2e 扫描 `WO-RUSH-9001`。
- 注入 `aimes_barcode_scan_evidence` 写入失败：`chromium barcode scan evidence storage unavailable`。
- 断言 fail-loud alert、未确认提示保留、不写入扫码证据和 OTD trace。

## 状态

A 轨此切片已用 Chromium 定向验证通过。B 轨发布闸门仍未关闭。
