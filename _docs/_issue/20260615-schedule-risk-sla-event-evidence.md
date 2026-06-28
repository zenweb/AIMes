# 2026-06-15 Issue: Schedule risk SLA event evidence

## Problem
- `ScheduleBoard` had production logic to merge risk SLA review evidence into the schedule event queue and generate a risk-specific agent suggestion.
- The unit tests did not directly cover the backend-first closed risk SLA review path.

## Impact
- A regression could remove risk SLA closure evidence, action traces, affected orders, or the closed-risk recommendation text without a focused test failure.

## Resolution
- Converted the risk SLA review sync mocks into controllable hoisted mocks.
- Added a focused unit test for queue rendering and agent suggestion generation.
- Verified focused, full-file, and coverage runs.
