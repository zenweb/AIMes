# 2026-06-14 Issue - Anomaly Startup Failure Aggregate Fail Loud

## Issue
AnomalyBoard startup failures used one notification string. When dispatch-record loading failed and anomaly-list loading also failed, the later anomaly-list message overwrote the earlier dispatch-record failure.

## Impact
- Operators could see that demo anomalies were shown, but miss that existing dispatch evidence failed to load.
- The event center remained usable, but diagnostics were incomplete.
- Multi-source startup degradation did not fail loud enough for review.

## Resolution
- Added a startup notification collection path.
- Appended dispatch-record and anomaly-list startup failures to the same alert.
- Kept demo anomaly records and dispatch lane actions available after both failures.

## Status
- Closed for frontend startup aggregation and real-browser visible behavior.
- Backend API reliability remains separate from this frontend hardening slice.
