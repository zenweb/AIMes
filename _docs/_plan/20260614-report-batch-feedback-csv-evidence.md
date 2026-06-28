# 2026-06-14 Plan - 报表批量采纳 CSV 证据

## 成功标准
- 批量采纳 snapshot 刷新进入报表后，CSV 导出必须包含批量采纳 OTD 经营钻取行。
- CSV 必须包含业务问题、下一步动作和 `TRACE-SCH-FEEDBACK-BATCH-balanced`。
- 真实 Chromium 必须覆盖 Blob 下载内容。
- 覆盖率、diff 检查、敏感信息扫描和关键文本审计完成。

## 执行步骤
- 已确认 `ReportBoard.vue` CSV 逻辑遍历 `otdDrilldownItems`。
- 已补真实 Chromium CSV 捕获断言。
- 目标 Chromium 直接 GREEN，说明生产导出逻辑已满足该链路。
- 已完成完整 report Chromium、report 单测和覆盖率验证。

## 停止条件
- 本片在审计通过后停止，不扩大到 PDF/Excel 导出。
