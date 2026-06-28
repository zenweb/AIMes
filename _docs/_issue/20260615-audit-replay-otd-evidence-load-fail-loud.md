# 2026-06-15 Audit Replay OTD Evidence Load Fail Loud Issue

## Issue

OTD evidence chain records can fail to load independently from other audit replay inputs. Without a direct regression test, the audit replay panel could regress into a blank or silent state.

## Risk

- Operators could mistake missing OTD evidence for a clean delivery evidence state.
- A backend/API outage could hide why delivery evidence replay is incomplete.
- Base replay cards could disappear during a partial OTD evidence outage.

## Resolution

- Added a focused test that verifies base replay cards remain visible.
- Added assertions that the alert region reports the OTD evidence chain loader failure.
