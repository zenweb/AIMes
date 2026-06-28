# 2026-06-20 Issue - Schedule suggestion missing engineering evidence

## Issue
ScheduleBoard could generate a generic material shortage recommendation when alternate-material backend readback returned no record.

## Impact
- Operators could see an actionable recommendation on an evidence-sensitive path without current backend proof.
- This weakened the intended fail-loud behavior for formal scheduling decisions.

## Resolution
- Missing backend records now fail loud for route capability, engineering change, and M-AL-6061 alternate-material suggestion generation.
- The UI keeps the Agent suggestion empty and shows the missing-evidence reason.

## Verification
- Focused missing-evidence regression passed.
- ScheduleBoard full unit suite passed.
- Adjacent BOM and engineering evidence tests passed.
