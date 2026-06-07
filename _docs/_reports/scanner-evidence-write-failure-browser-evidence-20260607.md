# ScannerBoard 扫码证据写入失败真实浏览器证据报告

日期：2026-06-07

## 范围

- A 轨质量切片：`ScannerBoard` 手动扫码后确认现场执行证据时，本地扫码证据写入失败的 fail-loud 证据。
- 目标：现场扫码到站证据无法写入时，真实浏览器必须显示错误，不把扫码状态伪造成已确认，也不写入 OTD 复盘证据链。

## 变更

- `src/frontend/tests/e2e/scanner.spec.ts`
  - 新增真实 Chromium 用例：`扫码证据写入失败时真实浏览器展示 fail-loud 且不伪造证据链`。
  - 用例在点击 `确认并写入证据链` 前让 `Storage.prototype.setItem` 对 `aimes_barcode_scan_evidence` 抛错。

## 验证

- `npm.cmd run test:e2e -- tests/e2e/scanner.spec.ts -g "扫码证据写入失败"`
  - Nuxt production build passed。
  - Chromium 1/1 passed。

## 断言覆盖

- 页面展示 `扫码证据写入失败`。
- 错误原因包含 `chromium barcode scan evidence storage unavailable`。
- 证据面板仍显示未确认提示 `确认工单到站并进入报工入口`。
- 页面不展示 `TRACE-QR-WO-RUSH-9001-ARRIVAL`。
- `aimes_barcode_scan_evidence` 未写入。
- `aimes_otd_evidence_chain` 未写入 `TRACE-QR-WO-RUSH-9001-ARRIVAL`。

## 结论

- `ScannerBoard` 扫码证据写入失败路径已有真实浏览器证据。
- 本片未修改生产代码，只补齐既有 fail-loud 行为的 Chromium 证据。
- B 轨发布闸门仍未关闭：hosted CI、PostgreSQL/staging、Attack Chain 人工验证、安全签字、首次灰度和 14 天观察仍需单独证据。
