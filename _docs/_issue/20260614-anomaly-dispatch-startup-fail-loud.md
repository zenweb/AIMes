# 2026-06-14 Issue - Anomaly Dispatch Startup Fail-Loud

## Status
- Fixed one reliability issue in the anomaly event-center startup path.

## Issue
- If `readAnomalyDispatchRecordsBackendFirst()` rejected during `onMounted`, `applyStoredDispatchRecords()` propagated the error.
- Because `onMounted` awaited dispatch-record loading before `loadAnomalies()`, this could prevent the anomaly list from loading.
- The user-facing result would be a blocked anomaly board instead of a usable board with a visible failure notice.

## Resolution
- Catch startup dispatch-record read failures locally.
- Clear `latestDispatch` and `dispatchedLaneIds` to avoid stale or fabricated routing state.
- Show `异常分流记录加载失败，仍可继续确认新的分流：...`.
- Continue into anomaly list loading.

## Remaining Gaps
- Some dispatch confirmation failure variants remain lower coverage.
- Future anomaly work should target uncovered behavior that affects user-critical routing, not repeat the now-covered startup read failure path.
- Gray observation / 15-day monitoring is intentionally deferred by owner direction.
