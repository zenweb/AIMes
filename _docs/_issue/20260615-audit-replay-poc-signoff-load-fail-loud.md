# 2026-06-15 Audit Replay POC Signoff Load Fail Loud Issue

## Issue

POC review signoff evidence can fail to load independently from other audit replay inputs. Without a direct regression test, the audit replay panel could regress into a blank or silent state.

## Risk

- Operators could mistake missing POC signoff evidence for a clean release-review state.
- A backend/API outage could hide why POC signoff replay is incomplete.
- Base replay cards could disappear during a partial POC evidence outage.

## Resolution

- Added a focused test that verifies base replay cards remain visible.
- Added assertions that the alert region reports the POC signoff loader failure.
