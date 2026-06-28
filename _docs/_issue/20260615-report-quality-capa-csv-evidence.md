# 2026-06-15 Issue: CAPA CSV export missed review evidence fields

## Problem
- `ReportBoard` displayed CAPA closure review action, root cause, and evidence strength on screen, but CSV export only carried task, OTD impact, and trace ID.

## Impact
- Offline report packs could lose the evidence needed to explain why the CAPA closure changed the OTD review.

## Resolution
- Added CSV rows for CAPA review action and root cause/evidence strength/owner.
- Added a failing-then-passing unit test for the CSV export contract.
