# 2026-06-15 Review - Audit Replay Knowledge Governance Load Fail Loud

## Decision

The audit replay path now has explicit regression coverage for knowledge governance review API rejection.

## What changed

- Added a test that forces the knowledge governance review loader to reject.
- Asserted that base replay cards remain visible.
- Asserted that the alert reports the specific knowledge governance load failure.

## Why it matters

- The audit replay panel must stay usable when knowledge governance evidence is temporarily unavailable.
- The operator needs a loud, specific alert so missing knowledge review evidence is not mistaken for no governance activity.

## Verification

- Targeted unit test passed.
- Targeted coverage passed.
- Related replay regression passed.
- Full frontend unit coverage passed at `111 files / 1009 tests passed`.
