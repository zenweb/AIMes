# 2026-06-20 Plan - Schedule suggestion engineering readback

## Goal
Prevent ScheduleBoard user-triggered suggestions from using stale local engineering evidence when backend readback fails.

## Selection
- The previous ScheduleBoard fail-loud slice secured adoption/release readback.
- The next adjacent risk was suggestion generation, where a user click could still reuse local fallback evidence.

## Steps
1. Inspect ScheduleBoard suggestion generation and existing tests.
2. Add a red test for stale local alternate-material evidence after startup readback failure.
3. Refresh backend evidence with `{ failLoud: true }` before generating engineering evidence driven suggestions.
4. Surface readback failures through the existing error banner.
5. Verify focused and adjacent tests.

## Status
- Completed for this slice.
