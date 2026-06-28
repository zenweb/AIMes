# 2026-06-20 Issue - Schedule engineering evidence fail-loud

## Issue
ScheduleBoard engineering adoption and route capability release flows did not explicitly demand fail-loud backend readback.

## Impact
- A user could take an adoption/release path while backend evidence failure was not guaranteed to be distinguished from absent local evidence.
- This weakened audit clarity for decisions that affect schedule execution.

## Resolution
- Alternate material approval and ECN impact reads now use `{ failLoud: true }` during engineering adoption.
- Route capability validation now uses `{ failLoud: true }` during release/blocking application.
- Startup evidence loading remains warning-based so the schedule board can still open.

## Verification
- Focused ScheduleBoard tests passed.
- Adjacent BOM and engineering evidence tests passed.
- Production build passed.
