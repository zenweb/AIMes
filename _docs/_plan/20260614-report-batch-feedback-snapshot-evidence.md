# 2026-06-14 Plan - 报表消费批量采纳 feedback snapshot 证据

## 成功标准
- 报表页 backend feedback 不可用时，必须读取本地批量采纳 snapshot。
- OTD 证据链必须展示 `已采纳批量对比方案`、`批量对比采纳`、`综合平衡` 和 `TRACE-SCH-FEEDBACK-BATCH-balanced`。
- 真实 Chromium 必须验证刷新后仍能看到该证据卡。
- 覆盖率、diff 检查、敏感信息扫描和关键文本审计完成。

## 执行步骤
- 已读取 `ReportBoard.vue`，确认已有 `scheduleFeedback` fallback 映射 `人工采纳` 证据卡。
- 已补单测锁定批量采纳 snapshot 字段。
- 已补真实 Chromium 用例，验证 localStorage snapshot 刷新后进入 OTD 证据链。
- 已完成目标单测、目标 Chromium、完整 report 单测、完整 report Chromium 和覆盖率验证。

## 停止条件
- 本片在审计通过后停止，不扩大到钻取详情专属文案。
