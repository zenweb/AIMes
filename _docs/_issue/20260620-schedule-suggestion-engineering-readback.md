# 2026-06-20 Issue - Schedule suggestion engineering readback

## Issue
ScheduleBoard suggestion generation could use local fallback engineering evidence after backend readback failed during startup.

## Impact
- Operators could see a generated recommendation backed by stale local alternate-material evidence.
- This weakened audit clarity before formal adoption or schedule writeback.

## Resolution
- Route capability, engineering change, and targeted alternate-material suggestion generation now refresh backend evidence with `{ failLoud: true }`.
- Readback failure prevents suggestion generation and shows the backend failure reason.

## Verification
- Focused stale-local-evidence regression test passed.
- ScheduleBoard full unit test passed.
- Adjacent BOM and engineering evidence tests passed.
