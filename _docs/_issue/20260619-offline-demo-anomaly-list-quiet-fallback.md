# 2026-06-19 Issue: Offline Demo Anomaly List Quiet Fallback

## Problem
Real browser verification showed `/scheduling/anomaly?offlineDemo=1` displayed:

`异常列表加载失败，已显示本地演示异常：Offline demo mode skipped backend request: /api/v1/anomaly`

## Root Cause
The anomaly list catch block treated offline demo transport skips like real backend failures and pushed the technical error into the startup notification list.

## Resolution
- Imported `isOfflineDemoError`.
- In `loadAnomalies()`, local demo anomalies are still populated, but `OfflineDemoApiError` returns without adding a startup notification.
- Ordinary backend failures still call `pushStartupNotification(...)`.

## Status
Resolved for anomaly-list startup loading.
