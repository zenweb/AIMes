# 2026-06-20 Issue - Schedule labor suggestion readback

## Issue
ScheduleBoard could generate personnel qualification or reassignment recommendations from local labor evidence.

## Impact
- Operators could see a production-start recommendation backed by stale local personnel evidence.
- This weakened audit clarity for labor qualification blocking and replacement release decisions.

## Resolution
- Labor event suggestion generation now requires fail-loud backend readback for labor qualification blocks and labor reassignments.
- Missing matching backend evidence leaves the suggestion empty and reports the evidence gap.

## Verification
- Focused stale-local labor block regression passed.
- ScheduleBoard full unit suite passed.
- Adjacent labor assignment, start qualification, and skill matrix tests passed.
