# 2026-06-12 Schedule Drag Refresh Readback Issue

## Issue
- The scheduling drag-save evidence previously proved PATCH submission and PostgreSQL/staging persistence, but the browser E2E did not explicitly prove that a subsequent refresh reads the saved window back through the scheduling read model.

## Root Cause
- The success-path browser test ended after the local save acknowledgement. `ScheduleBoard` also mutates local gantt task state after successful PATCH, so a UI-only assertion could pass without proving refresh/readback behavior.

## Resolution
- Added a real dhtmlx test with a mutable scheduling read-model mock.
- The PATCH handler writes the submitted window into the mocked current plan.
- The test clicks `刷新` and asserts the next GET returns the exact saved `plannedStartTime/plannedEndTime`.

## Status
- Resolved for mocked real-browser evidence.
- Live PostgreSQL/staging evidence remains covered by the staging rehearsal report, not by this Playwright route-mock test.
