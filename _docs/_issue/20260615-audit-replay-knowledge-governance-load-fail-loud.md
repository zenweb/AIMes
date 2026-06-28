# 2026-06-15 Audit Replay Knowledge Governance Load Fail Loud Issue

## Issue

Knowledge governance review evidence can fail to load independently from other audit replay inputs. Without a direct regression test, the audit replay panel could regress into a blank or silent state.

## Risk

- Operators could mistake missing knowledge governance evidence for a clean governance state.
- A backend/API outage could hide why knowledge replay evidence is incomplete.
- Base replay cards could disappear during a partial knowledge governance evidence outage.

## Resolution

- Added a focused test that verifies base replay cards remain visible.
- Added assertions that the alert region reports the knowledge governance API rejection.
