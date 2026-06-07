# Issue: RiskActionQueuePanel 风险 SLA 复核失败态缺口

## Issue

风险 SLA 晨会复核包生成/闭环是用户关键动作。写入失败时原实现会抛出未处理 Vue event error，缺少页面级 fail-loud 反馈，也可能让用户无法判断动作是否已落库。

## Fix

- `generateSlaReview` 捕获 `writeRiskSlaReviewRecord` 异常，展示失败原因并保留空态。
- `closeSlaReview` 捕获 `closeRiskSlaReviewRecord` 异常，展示失败原因并保留原复核状态。
- 用单测验证失败不伪造“已生成/已闭环”留痕。
- 用真实 Chromium 验证生成失败入口。

## Evidence

- `_docs/_reports/risk-sla-review-fail-loud-browser-evidence-20260606.md`

## Release Gate Note

该 issue 只关闭 A 轨既有功能质量缺口，不关闭 B 轨发布闸门。
