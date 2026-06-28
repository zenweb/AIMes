# 2026-06-16 Risk Monitoring Close Fail Loud Review

## Finding

Monitoring-situation risk closure had a two-phase write gap with no visible failure boundary.

## Impact

When an operator closed a `risk-monitoring-situation-*` risk, the panel first wrote the risk action trace, then attempted to close the realtime monitoring situation escalation package. If the second write failed, the click handler threw and the UI did not clearly say that the risk trace was archived but the realtime package remained open.

## Fix

- Wrapped `closeMonitoringSituationEscalation` in a narrow `try/catch`.
- Added an explicit alert: `现场态势处置包关闭失败，风险关闭留痕已写入但实时监控处置包未闭环：...`.
- Returned early after the failed realtime writeback so the panel does not mark the package closed locally.

## Verification

- Red/green test cycle completed.
- RiskActionQueuePanel targeted suite passed: `14 passed`.
- Full frontend suite passed: `111 files / 1059 tests passed`.

## Remaining Risk

- `RiskActionQueuePanel.vue` branch coverage is `73%`; future work should target real operator workflow gaps rather than branch-count chasing.
- Strict v1.0.0 release readiness is still not claimed because gray observation remains owner-deferred.
