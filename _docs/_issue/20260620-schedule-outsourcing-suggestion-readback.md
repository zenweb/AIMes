# 2026-06-20 Issue - Schedule outsourcing suggestion readback

## Issue
ScheduleBoard could generate outsourcing commitment or receipt recommendations from local outsourcing evidence.

## Impact
- Operators could see an outsourcing release recommendation backed by stale local receipt evidence.
- This weakened audit clarity for schedule release decisions tied to external fulfillment.

## Resolution
- Outsourcing event suggestion generation now requires fail-loud backend readback for the latest outsourcing commitment.
- Missing or mismatched backend evidence leaves the suggestion empty and reports the evidence gap.

## Verification
- Focused stale-local outsourcing receipt regression passed.
- ScheduleBoard full unit suite passed.
- Adjacent outsourcing commitment, OTD KPI, and report tests passed.
