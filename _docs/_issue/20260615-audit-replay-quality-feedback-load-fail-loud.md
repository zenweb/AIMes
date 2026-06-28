# 2026-06-15 Audit Replay Quality Feedback Load Fail Loud Issue

## Issue

Quality recommendation feedback and retraining version inputs can fail independently. Without a direct regression test, the audit replay panel could regress into a blank or silent state.

## Risk

- Operators could mistake missing quality feedback evidence for a clean audit state.
- A malformed retraining payload could hide the reason why quality replay evidence is missing.
- Base replay cards could disappear during a partial quality backend outage.

## Resolution

- Added a focused test that verifies base replay cards remain visible.
- Added assertions that the alert region reports both the rejected feedback API and malformed retraining payload.
