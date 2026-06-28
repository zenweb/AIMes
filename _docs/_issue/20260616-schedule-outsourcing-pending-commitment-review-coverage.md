# 2026-06-16 Schedule Outsourcing Pending Commitment Review Coverage Issue

## Status

Closed for this slice.

## Problem

The paused `ScheduleBoard.vue` slice still lacked direct evidence for the pending outsourcing commitment branch. That branch is business-significant because a vendor promise is not the same as confirmed receipt or internal recovery.

## Resolution

Added a regression test that mounts the schedule board with a locked outsourcing commitment that has no receipt or schedule release evidence. The test confirms the generated suggestion keeps the work in external-wait review and does not call schedule-release persistence.

## Evidence

- Targeted schedule suite: `63 passed`.
- Schedule targeted coverage: lines `89.24%`.
- Related schedule regression: `78 passed`.
- Full frontend coverage: `111 files / 1031 tests passed`.
