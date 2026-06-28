# 2026-06-15 Issue: Report quality gray experiment governance

## Problem
- `ReportBoard` contained quality gray-release and experiment governance UI/CSV branches, but the unit test suite stubbed the relevant builders to empty arrays.
- This left the successful report and CSV paths easy to regress without a targeted failure.

## Impact
- Quality gray monitor, expand/rollback decisions, experiment comparison, or candidate governance evidence could disappear from the report or CSV without being caught.

## Resolution
- Converted the builder and gray-decision mocks into controllable hoisted mocks.
- Added a focused unit test for visible report content and CSV rows.
- Verified focused, full-file, and coverage runs.
