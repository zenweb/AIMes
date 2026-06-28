# 2026-06-16 Risk Monitoring Close Fail Loud Issue

## Status

Closed for this slice.

## Problem

Monitoring-situation risk closure used a two-phase flow:

- write risk action trace with `appendRiskActionTrace`
- close the realtime monitoring situation package with `closeMonitoringSituationEscalation`

Before the fix, if the second write failed, the click handler threw an unhandled native event handler error and no visible alert explained the partial state.

## Resolution

`RiskActionQueuePanel.vue` now catches `closeMonitoringSituationEscalation` failures, shows `现场态势处置包关闭失败，风险关闭留痕已写入但实时监控处置包未闭环：...`, and returns without treating the realtime monitoring package as closed.

## Evidence

- Regression test failed before the fix because `[role="alert"]` was missing and the native event handler error escaped.
- Regression test passed after the fix: `1 passed | 13 skipped`.
- RiskActionQueuePanel targeted coverage passed with `14 passed`.
- Full frontend coverage passed with `111 files / 1059 tests passed`.

## Remaining Open Item

This does not close the whole CC remediation goal. Release strict readiness remains blocked by deferred gray observation, and the owner requested the task be placed on hold.
