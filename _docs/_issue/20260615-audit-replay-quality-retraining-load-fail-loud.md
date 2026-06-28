# 2026-06-15 Audit Replay Quality Retraining Load Fail Loud Issue

## Issue

Quality retraining version evidence can fail to load independently from recommendation feedback and gray decision evidence. Without a direct regression test, the audit replay panel could regress into a blank or silent state.

## Risk

- Operators could mistake missing retraining evidence for a clean quality knowledge state.
- A backend/API outage could hide why quality replay evidence is incomplete.
- Base replay cards could disappear during a partial retraining evidence outage.

## Resolution

- Added a focused test that verifies base replay cards remain visible.
- Added assertions that the alert region reports the retraining version API rejection.
