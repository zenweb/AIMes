# 2026-06-15 Issue: Risk SLA review was loaded but not visible in the report page

## Problem
- `ReportBoard` loaded risk SLA review evidence and exported it to CSV, but did not show a focused risk SLA evidence block in the OTD review report.

## Impact
- A user reviewing the report page could miss closed responsibility actions that explain OTD recovery, even though the CSV contained them.

## Resolution
- Added a compact risk SLA report block to the OTD review section.
- Added a focused failing-then-passing unit test covering visible evidence and CSV rows.
