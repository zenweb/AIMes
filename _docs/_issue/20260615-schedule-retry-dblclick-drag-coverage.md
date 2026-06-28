# 2026-06-15 ScheduleBoard coverage issue

## Issue
ScheduleBoard had no direct unit evidence for three user-visible paths:

- Error-banner retry after an optimization alert.
- Gantt task double-click opening order explanation/details.
- Drag writeback receiving an unknown task id.

## Impact
These gaps made the core AI scheduling workbench less auditable. The behavior existed, but regressions in these entry points could pass without focused tests.

## Resolution
- Added focused tests for retry recovery, double-click explanation, and unknown-task drag fail-loud handling.
- Verified the focused ScheduleBoard suite and full frontend coverage suite.

## Status
Resolved for this slice. Broader v1.0.0 release completion remains outside this issue.
