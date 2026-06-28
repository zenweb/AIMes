# 2026-06-15 Review - Audit Replay Quality Retraining Load Fail Loud

## Decision

The audit replay path now has explicit regression coverage for quality retraining version API rejection.

## What changed

- Added a test that forces the quality retraining version loader to reject.
- Asserted that base replay cards remain visible.
- Asserted that the alert reports the specific retraining version load failure.

## Why it matters

- The audit replay panel must stay usable when retraining version evidence is temporarily unavailable.
- The operator needs a loud, specific alert so missing retraining evidence is not mistaken for no quality knowledge activity.

## Verification

- Targeted unit test passed.
- Targeted coverage passed.
- Related replay regression passed.
- Full frontend unit coverage passed at `111 files / 1008 tests passed`.
