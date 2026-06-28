# 2026-06-20 Issue - Production Anomaly Latest Toast Cleanup

## Problem

Real browser scans showed `/scheduling/risk` and `/scheduling/anomaly` displaying a global `请求错误` toast when `/api/v1/scheduling/production-anomaly-event/latest` returned 404.

## Root Cause

The latest production anomaly event read is optional evidence hydration, but the API client call did not pass `suppressErrorToast: true`. The HTTP interceptor therefore treated a missing optional latest record as a global user-facing request failure.

## Resolution

- Added `suppressErrorToast: true` to `getLatestProductionAnomalyEvent`.
- Updated unit tests to lock the optional latest contract.
- Verified real browser behavior after rebuilding and restarting preview.

