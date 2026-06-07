# 2026-06-07 Plan - ScannerBoard 扫码证据写入失败 Chromium 证据

## 成功标准

- 真实 Chromium 能覆盖扫码证据写入失败路径。
- 失败时页面必须 fail loud。
- 失败时扫码证据面板必须保持未确认状态。
- 失败时不得写入 `aimes_barcode_scan_evidence`。
- 失败时不得伪造 `TRACE-QR-WO-RUSH-9001-ARRIVAL` OTD 证据。

## 执行

- 在 `src/frontend/tests/e2e/scanner.spec.ts` 增加单条定向 e2e。
- 通过 `Storage.prototype.setItem` 注入扫码证据写入失败。
- 只跑目标用例，避免重复烧整套浏览器回归成本。

## 验证

```powershell
npm.cmd run test:e2e -- tests/e2e/scanner.spec.ts -g "扫码证据写入失败"
```

结果：Nuxt production build passed，Chromium `1 passed`。

## Stop Condition

- 目标 Chromium 用例通过。
- 文档证据补齐到 report/changelog/review/todo/issue/plan。
- B 轨仍以 fail-loud 方式保留为未关闭发布阻断项。
