# 2026-06-19 Issue: Offline Demo Quality Evidence Quiet Fallback

## Problem
`/scheduling/quality?offlineDemo=1` displayed technical backend skip errors to users:

- `SPC 趋势分析加载失败：Offline demo mode skipped backend request: /api/v1/quality/spc/analyze`
- `质量异常告警加载失败：Offline demo mode skipped backend request: /api/v1/anomaly`
- `质检批次加载失败，已显示本地演示批次：Offline demo mode skipped backend request: /api/v1/quality/inspections`

## Root Cause
Quality startup has multiple independent backend reads. Some catch blocks treated offline demo skips like real backend failures and wrote them into `qualityError`. The anomaly offline branch also returned early, preventing SPC from loading.

## Resolution
- Detect `OfflineDemoApiError` in the quality inspections, anomaly, and SPC catch paths.
- Populate existing demo fallback data quietly for offline demo skips.
- Preserve visible alerts for ordinary backend errors.
- Remove the anomaly early return so SPC still loads.

## Status
Resolved for the quality board slice. Broader offline demo route sweep remains open.
