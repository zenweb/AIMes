# 2026-06-15 Audit Replay Schedule Feedback Load Fail Loud Issue

## Issue

Schedule adoption feedback audit list loading can fail independently from other audit replay inputs. Without a direct regression test, the audit replay panel could silently lose explainability evidence for AI scheduling decisions.

## Risk

- Operators could mistake missing schedule feedback evidence for no scheduling decision activity.
- A backend/API outage could hide why schedule feedback replay is incomplete.
- Base replay cards could disappear during a partial schedule feedback audit outage.

## Resolution

- Added a focused test that verifies base replay cards remain visible.
- Added assertions that the alert region reports the schedule feedback audit list loading failure.
