# 2026-06-20 Plan - Schedule suggestion missing engineering evidence

## Goal
Ensure ScheduleBoard does not generate engineering evidence driven recommendations when backend readback returns no evidence.

## Selection
- The previous slice handled backend exceptions and stale local evidence.
- The adjacent missing-record path still allowed generic fallback suggestions.

## Steps
1. Add a red test for M-AL-6061 material suggestion with no backend alternate-material evidence.
2. Treat `null` readback as a fail-loud error for engineering evidence driven events.
3. Update existing material adoption coverage to provide current backend alternate-material evidence.
4. Verify focused and adjacent tests.

## Status
- Completed for this slice.
