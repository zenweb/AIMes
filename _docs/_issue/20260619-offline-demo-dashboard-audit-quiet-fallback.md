# 2026-06-19 Issue: Offline Demo Dashboard And Audit Quiet Fallback

## Problem
Real browser verification found technical offline demo backend skip messages in user-facing UI:

- Dashboard: `KPI、设备状态、今日排产与物料预警暂未加载：Offline demo mode skipped backend request: /api/v1/dashboard`
- Audit replay: assistant audit, config approval, knowledge governance, audit-log, and schedule adoption feedback skip messages.
- Audit list: `审计日志列表加载失败，已显示本地演示日志：Offline demo mode skipped backend request: /api/v1/audit-logs`

## Root Cause
Startup catch blocks treated offline demo transport skips the same as real backend failures and wrote them into visible error regions.

## Resolution
- Dashboard now detects `OfflineDemoApiError` and keeps existing local defaults without `dashboardDataError`.
- Audit list now detects `OfflineDemoApiError` and keeps local demo rows without `loadError`.
- Audit replay error aggregation ignores only `OfflineDemoApiError`.

## Status
Resolved for dashboard, audit logs, and audit replay startup paths.
