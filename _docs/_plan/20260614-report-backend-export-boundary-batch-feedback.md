# 2026-06-14 Plan - 报表后端导出边界提示

## 成功标准
- 用户在报表中心能看出 CSV 与 Excel/PDF 的证据范围不同。
- Excel/PDF 成功点击后不静默清空提示，而是明确说明后端快照边界。
- 批量采纳 snapshot 的真实 Chromium 用例同时证明 CSV 含本地证据、Excel 给出边界提示。
- 完成单测、完整 report Chromium、覆盖率和审计扫描。

## 执行步骤
- 已读取 `ReportEndpoints.cs`，确认 Excel/PDF 由后端数据库报表生成。
- 已在 `ReportBoard.vue` 增加导出边界说明和 Excel/PDF 成功提示。
- 已补 `report-board.test.ts` 单测验证 Excel/PDF 成功提示。
- 已扩展 `report.spec.ts` 批量采纳 Chromium 用例，验证 CSV 和 Excel 边界。

## 停止条件
- 本片完成审计后停止，不扩展到前端生成 Excel/PDF。
