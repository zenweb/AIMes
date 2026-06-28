# 2026-06-14 Issue - Staging Reschedule Persistence Current

## Issue
The OTD commitment browser chain had fresh real-browser proof, but the adjacent Scheduling reschedule write path needed current-state backend persistence evidence.

## Impact
- Browser-only proof can miss database write/read drift.
- A stale staging report would be weaker than a current Docker/PostgreSQL/API rehearsal.

## Resolution
- Re-ran `run-staging-rehearsal.ps1` with `-IncludeRescheduleProbe`.
- Verified PostgreSQL stored window equals the PATCH window.
- Verified API GET returns the same window.
- Verified related Scheduling integration tests.

## Status
- Closed for current-state Scheduling reschedule persistence evidence.
- OTD KPI commitment endpoint persistence remains a separate candidate if server-side persistence exists for that chain.
