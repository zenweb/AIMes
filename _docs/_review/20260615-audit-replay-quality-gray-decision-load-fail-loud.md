# 2026-06-15 Review - Audit Replay Quality Gray Decision Load Fail Loud

## Decision

The audit replay path now has explicit regression coverage for quality gray release decision API rejection.

## What changed

- Added a test that forces the quality gray release decision loader to reject.
- Asserted that base replay cards remain visible.
- Asserted that the alert reports the specific gray decision load failure.

## Why it matters

- The audit replay panel must stay usable when gray decision evidence is temporarily unavailable.
- The operator needs a loud, specific alert so missing gray decision evidence is not mistaken for no quality decision activity.

## Verification

- Targeted unit test passed.
- Targeted coverage passed.
- Related replay regression passed.
- Full frontend unit coverage passed at `111 files / 1007 tests passed`.
