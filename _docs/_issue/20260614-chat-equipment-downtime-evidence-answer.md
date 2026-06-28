# 2026-06-14 Issue - Chat Equipment Downtime Evidence Answer

## Issue
- `ChatPanel.vue` had real-browser coverage for equipment-downtime evidence answers, but lacked focused unit evidence that the fallback business answer selects the latest CNC-001 OTD evidence.
- Without the unit assertion, a regression could silently fall back to stale evidence or the no-evidence message while the broad e2e remained harder to diagnose.

## Resolution
- Added a unit test with both old and latest CNC-001 equipment evidence.
- Asserted the answer includes the latest trace, status, source, and affected work orders.
- Asserted stale trace and no-evidence text are absent.

## Status
- Resolved for this slice.
- No production code change required.
