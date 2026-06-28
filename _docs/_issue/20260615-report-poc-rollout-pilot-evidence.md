# 2026-06-15 Issue: Report POC rollout and pilot evidence

## Problem
- `ReportBoard` already contained POC rollout and pilot-run rendering plus CSV rows, but the positive backend-first path was not covered by a focused regression test.
- Existing tests covered failure protection for rollout/pilot writes, leaving the successful review/export path easier to regress silently.

## Impact
- A future change could hide rollout actions, pilot work orders, checkpoint evidence, or CSV audit rows without a targeted test failure.

## Resolution
- Added a focused unit test that loads backend-first rollout and pilot records, then verifies both visible report content and CSV rows.
- Verified the full `report-board` unit file and focused coverage command.
