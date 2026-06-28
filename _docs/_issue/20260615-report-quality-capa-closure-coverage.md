# 2026-06-15 Issue: Report CAPA closure evidence lacked focused coverage

## Problem
- `ReportBoard` rendered quality CAPA closure evidence, but the report unit suite did not prove that the CAPA block appears in the OTD review report.

## Impact
- A future template regression could hide CAPA verification evidence from the report without a focused test failure.

## Resolution
- Added a targeted unit test with controlled CAPA backend-first evidence.
- Verified the report displays the CAPA handoff, root cause, evidence strength, review action, and OTD impact.
