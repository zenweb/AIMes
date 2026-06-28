# 2026-06-20 Plan - Schedule labor suggestion readback

## Goal
Prevent user-triggered labor recommendations from using stale local personnel qualification or reassignment evidence.

## Selection
- Labor suggestions can affect production start release.
- The previous engineering evidence slices secured similar user-action readback paths.

## Steps
1. Inspect ScheduleBoard labor suggestion generation and labor sync utilities.
2. Add backend-first labor read mocks and a red stale-local test.
3. Refresh labor qualification block and reassignment evidence with `{ failLoud: true }` before generating suggestions.
4. Update existing positive labor tests to provide backend evidence.
5. Verify ScheduleBoard and adjacent labor tests.

## Status
- Completed for this slice.
