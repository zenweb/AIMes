# 2026-06-14 Issue - 批量采纳钻取缺少 CSV 专项证据

## 问题
- 批量对比采纳 snapshot 已能进入报表页面 OTD 证据链和钻取详情。
- CSV 导出虽然复用 `otdDrilldownItems`，但缺少真实 Chromium 断言证明批量采纳字段进入导出交付物。

## 影响
- 页面证据完整，但客户/审计常用的 CSV 交付物缺少回归保护。
- 后续导出重构可能误伤批量采纳业务问题、下一步动作或 traceId，而页面测试不一定发现。

## 修复
- 在批量采纳 snapshot E2E 中捕获 CSV Blob 下载。
- 断言 CSV 包含 `OTD经营钻取`、批量采纳业务问题、下一步动作和 `TRACE-SCH-FEEDBACK-BATCH-balanced`。

## 剩余风险
- PDF/Excel 导出尚未建立同等批量采纳专项断言。
