# 2026-06-07 ScannerBoard 扫码证据写入失败 Chromium 证据

## 变更

- 新增扫码入口 e2e：`扫码证据写入失败时真实浏览器展示 fail-loud 且不伪造证据链`。
- 用真实 Chromium 模拟扫码证据写入 `aimes_barcode_scan_evidence` 时 localStorage 抛错。
- 验证页面 fail-loud，同时不伪造扫码已确认状态或 OTD 复盘证据链。

## 验证

```powershell
npm.cmd run test:e2e -- tests/e2e/scanner.spec.ts -g "扫码证据写入失败"
```

结果：Nuxt production build passed，Chromium `1 passed`。
