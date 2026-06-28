# 2026-06-16 Scanner Startup Evidence Refresh Fail Loud Issue

## Status

Closed for this slice.

## Problem

Scanner loaded local scan evidence first, then awaited backend evidence refresh on mount without handling failures.

Scenario:

- Local browser storage contains a confirmed work-order scan evidence record.
- Backend scan evidence refresh fails during component mount.
- Operator scans the same work order.

Before the fix, the backend failure surfaced as an unhandled mounted-hook rejection and no visible alert explained that evidence freshness could not be confirmed.

## Resolution

`onMounted` now catches startup backend refresh failures, keeps local evidence intact, and shows `扫码证据启动刷新失败：...`.

## Evidence

- Regression test failed before the fix because `[role="alert"]` was missing and Vitest caught an unhandled rejection.
- Regression test passed after the fix.
- Scanner targeted coverage passed with `11 passed`.
- Full frontend coverage passed with `111 files / 1057 tests passed`; refreshed on 2026-06-19 with `111 files / 1083 tests passed`.

## Remaining Open Item

This does not close the whole CC remediation goal. Release strict readiness remains blocked by deferred gray observation.
