# 2026-06-15 Audit Replay Quality Gray Decision Load Fail Loud Issue

## Issue

Quality gray release decision evidence can fail to load independently from other quality knowledge inputs. Without a direct regression test, the audit replay panel could regress into a blank or silent state.

## Risk

- Operators could mistake missing gray decision evidence for a clean quality decision state.
- A backend/API outage could hide why gray decision replay is absent.
- Base replay cards could disappear during a partial gray decision evidence outage.

## Resolution

- Added a focused test that verifies base replay cards remain visible.
- Added assertions that the alert region reports the gray decision API rejection.
